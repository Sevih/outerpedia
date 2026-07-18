/**
 * CORS du bucket R2 : `node scripts/r2-cors.mjs` (setup rare, une fois).
 *
 * Les tuiles d'effets sont peintes en `mask-image: url(R2)` — un masque CSS
 * cross-origin EXIGE l'en-tête `Access-Control-Allow-Origin` (contrairement à
 * un simple `<img>`). Sans lui, le navigateur charge l'image (200) mais refuse
 * de l'utiliser comme masque → icônes vides. On pose donc une politique CORS
 * en lecture seule (GET/HEAD, toute origine — ce sont des assets publics).
 *
 * Applique via l'API S3 (SigV4) avec les creds R2 de `.env.local` — les mêmes
 * que `assets:push`, aucun login Cloudflare interactif requis.
 */
import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const env = /** @type {Record<string, string>} */ ({});
for (const line of readFileSync(resolve('.env.local'), 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const { R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
if (!R2_ENDPOINT || !R2_BUCKET || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('R2_ENDPOINT / R2_BUCKET / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY requis');
  process.exit(1);
}

// Politique : lecture cross-origin des assets publics (masques CSS, canvas…).
const body = [
  '<CORSConfiguration>',
  '<CORSRule>',
  '<AllowedOrigin>*</AllowedOrigin>',
  '<AllowedMethod>GET</AllowedMethod>',
  '<AllowedMethod>HEAD</AllowedMethod>',
  '<AllowedHeader>*</AllowedHeader>',
  '<MaxAgeSeconds>86400</MaxAgeSeconds>',
  '</CORSRule>',
  '</CORSConfiguration>',
].join('');

/** @param {import('node:crypto').BinaryLike} s */
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
/**
 * @param {import('node:crypto').BinaryLike} key
 * @param {import('node:crypto').BinaryLike} s
 */
const hmac = (key, s) => createHmac('sha256', key).update(s).digest();

const url = new URL(R2_ENDPOINT);
const host = url.host;
const region = 'auto'; // R2 ignore la région mais SigV4 l'exige dans le scope.
const now = new Date();
const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ''); // YYYYMMDDTHHMMSSZ
const dateStamp = amzDate.slice(0, 8);
const payloadHash = sha256(body);

// Requête canonique : PUT /{bucket}?cors= (path-style, comme rclone).
const canonicalUri = `/${R2_BUCKET}`;
const canonicalQuery = 'cors=';
const canonicalHeaders =
  `host:${host}\n` + `x-amz-content-sha256:${payloadHash}\n` + `x-amz-date:${amzDate}\n`;
const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
const canonicalRequest = [
  'PUT',
  canonicalUri,
  canonicalQuery,
  canonicalHeaders,
  signedHeaders,
  payloadHash,
].join('\n');

const scope = `${dateStamp}/${region}/s3/aws4_request`;
const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');

const kDate = hmac(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp);
const kRegion = hmac(kDate, region);
const kService = hmac(kRegion, 's3');
const kSigning = hmac(kService, 'aws4_request');
const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

const authorization =
  `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, ` +
  `SignedHeaders=${signedHeaders}, Signature=${signature}`;

const res = await fetch(`${R2_ENDPOINT.replace(/\/$/, '')}/${R2_BUCKET}?cors`, {
  method: 'PUT',
  headers: {
    Host: host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    Authorization: authorization,
    'Content-Type': 'application/xml',
  },
  body,
});

if (res.ok) {
  console.log(`✔ CORS appliqué sur le bucket « ${R2_BUCKET} » (GET/HEAD, toute origine).`);
} else {
  console.error(`✗ échec (${res.status}) :`, await res.text());
  process.exit(1);
}
