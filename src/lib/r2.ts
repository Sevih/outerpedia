/**
 * R2 (API S3) et edge Cloudflare, côté SERVEUR — lecture et écriture d'un objet
 * du bucket, et purge d'une URL publique.
 *
 * Écrit à la main en SigV4 (même dérivation que `scripts/r2-cors.mjs`) plutôt
 * qu'avec rclone : ce module tourne AUSSI dans le conteneur de prod (route
 * interne des coupons), où rclone n'existe pas.
 *
 * Identifiants lus dans `process.env`, mêmes noms en dev (`.env.local`) et en
 * prod (stack sevih-tool) : R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID.
 */
import { createHash, createHmac } from 'node:crypto';

/**
 * En-tête des JSON RUNTIME (`data/*`) : donnée vive, `s-maxage` COURT pour que
 * l'edge se rafraîchisse seul même si la purge échoue. Même valeur que
 * `CACHE_CONTROL_DATA` de `scripts/assets-push.mjs`.
 */
export const RUNTIME_CACHE_CONTROL =
  'public, max-age=300, s-maxage=600, stale-while-revalidate=3600';

interface R2Env {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

function r2Env(): R2Env | undefined {
  const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return undefined;
  return {
    endpoint: R2_ENDPOINT.replace(/\/$/, ''),
    bucket: R2_BUCKET,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  };
}

export const hasR2 = (): boolean => r2Env() !== undefined;

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const hmac = (key: string | Buffer, s: string): Buffer =>
  createHmac('sha256', key).update(s).digest();

/**
 * Requête S3 signée (SigV4, path-style `/<bucket>/<key>`). Seuls host,
 * x-amz-content-sha256 et x-amz-date sont signés ; les autres en-têtes
 * (If-Match, Content-Type, Cache-Control) voyagent non signés, ce que S3 admet.
 */
async function s3(
  method: 'GET' | 'PUT',
  key: string,
  { body = '', headers = {} }: { body?: string; headers?: Record<string, string> } = {},
): Promise<Response> {
  const env = r2Env();
  if (!env) throw new Error('R2_* absents de l’environnement');

  const path = `/${env.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const url = new URL(`${env.endpoint}${path}`);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256(body);

  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    method,
    path,
    '',
    `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const scope = `${dateStamp}/auto/s3/aws4_request`; // R2 ignore la région, SigV4 l'exige.
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  const kSigning = hmac(
    hmac(hmac(hmac(`AWS4${env.secretAccessKey}`, dateStamp), 'auto'), 's3'),
    'aws4_request',
  );
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  return fetch(url, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
    headers: {
      ...headers,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      authorization: `AWS4-HMAC-SHA256 Credential=${env.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    ...(method === 'PUT' ? { body } : {}),
  });
}

/** Lit un objet texte ET son ETag (pour une réécriture conditionnelle). `null` si absent. */
export async function getR2Object(key: string): Promise<{ body: string; etag: string } | null> {
  // `identity` : fetch demande par défaut une réponse compressée, et R2 rend
  // alors un ETag FAIBLE (`W/"…"`) — que `If-Match` (comparaison forte) ne
  // reconnaît jamais : toute réécriture était refusée (constaté le 25/09/2026).
  const res = await s3('GET', key, { headers: { 'accept-encoding': 'identity' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 GET ${key} → HTTP ${res.status}`);
  const etag = res.headers.get('etag');
  if (!etag) throw new Error(`R2 GET ${key} : réponse sans ETag`);
  return { body: await res.text(), etag: strongEtag(etag) };
}

/** Retire le préfixe `W/` : la valeur est la même, seule la comparaison change. */
const strongEtag = (etag: string): string => etag.replace(/^W\//, '');

/**
 * Écrit un objet SEULEMENT s'il n'a pas changé depuis la lecture qui a donné
 * `ifMatch` (renvoie le nouvel ETag) : deux écrivains (l'admin de Sevih, le bot du staff) ne s'écrasent
 * jamais en silence — le second reçoit `conflict` et doit relire.
 */
export async function putR2Object(
  key: string,
  body: string,
  {
    ifMatch,
    contentType,
    cacheControl,
  }: { ifMatch: string; contentType: string; cacheControl: string },
): Promise<{ etag: string } | 'conflict'> {
  const res = await s3('PUT', key, {
    body,
    headers: { 'if-match': ifMatch, 'content-type': contentType, 'cache-control': cacheControl },
  });
  if (res.status === 412) return 'conflict';
  if (!res.ok) throw new Error(`R2 PUT ${key} → HTTP ${res.status}`);
  // Le nouvel ETag : l'écrivain qui enchaîne une 2e sauvegarde en a besoin,
  // sinon elle serait refusée comme conflit… avec sa propre écriture.
  const etag = res.headers.get('etag');
  if (!etag) throw new Error(`R2 PUT ${key} : réponse sans ETag`);
  return { etag: strongEtag(etag) };
}

/**
 * Purge l'edge pour une clé du bucket (`<IMG_BASE>/<key>`). Ne jette jamais :
 * renvoie l'échec en clair — sans purge, le `s-maxage` court borne le retard.
 */
export async function purgeEdge(key: string): Promise<{ purged: boolean; error?: string }> {
  const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, NEXT_PUBLIC_IMG_BASE } = process.env;
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID || !NEXT_PUBLIC_IMG_BASE) {
    return {
      purged: false,
      error: 'purge edge sautée (CLOUDFLARE_* absents) — visible en ≤ 20 min.',
    };
  }
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: [`${NEXT_PUBLIC_IMG_BASE}/${key}`] }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!r.ok) return { purged: false, error: `purge edge en échec (HTTP ${r.status}).` };
  } catch (e) {
    return { purged: false, error: `purge edge en échec : ${(e as Error).message}` };
  }
  return { purged: true };
}
