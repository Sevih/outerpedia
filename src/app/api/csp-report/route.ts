import type { NextRequest } from 'next/server';

/**
 * Collecteur des rapports de violation CSP — PASSE 1 (mode Report-Only).
 *
 * Le navigateur POST ici, tout seul, à chaque violation de la politique servie
 * par le middleware. On agrège donc ce que la CSP stricte casserait sur le
 * trafic RÉEL (tous visiteurs, tous navigateurs), sans ouvrir la console. Sink
 * volontairement simple : un `console.warn` structuré → logs du conteneur, que
 * l'on `grep`. On repassera à une politique réelle quand ces logs ne montreront
 * plus que du bruit.
 *
 * Deux formats coexistent : `application/csp-report` (objet unique, clés-tiret,
 * Firefox/Safari via `report-uri`) et `application/reports+json` (tableau,
 * clés camelCase sous `.body`, Chrome via `report-to`). On normalise les deux.
 */

// Violations provoquées par les extensions du VISITEUR (AdBlock, Grammarly,
// traducteurs…), pas par notre code : on les jette à l'entrée pour ne pas noyer
// le signal.
const NOISE = [
  'chrome-extension',
  'moz-extension',
  'safari-extension',
  'safari-web-extension',
  'webkit-masked-url',
];

// Dédup en mémoire (par instance) — n'écrit qu'UNE fois chaque violation
// distincte au lieu de dix mille. Borné pour ne pas fuir ; remis à zéro au
// redémarrage du conteneur (on réapprend alors, c'est voulu).
const seen = new Set<string>();
const SEEN_MAX = 500;
const BODY_MAX = 64_000;

type Dict = Record<string, unknown>;
type Norm = {
  directive: string;
  blocked: string;
  documentUri: string;
  sourceFile?: string;
  line?: number;
};

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === 'number' ? v : undefined);

function normalize(raw: unknown): Norm | null {
  if (!raw || typeof raw !== 'object') return null;
  const outer = raw as Dict;
  // `csp-report` (report-uri) ou `.body` (report-to) ou l'objet nu.
  const r = (outer['csp-report'] ?? outer.body ?? outer) as Dict;
  const directive =
    str(r['effective-directive']) ??
    str(r.effectiveDirective) ??
    str(r['violated-directive']) ??
    str(r.violatedDirective) ??
    '';
  const blocked = str(r['blocked-uri']) ?? str(r.blockedURL) ?? '';
  const documentUri = str(r['document-uri']) ?? str(r.documentURL) ?? '';
  const sourceFile = str(r['source-file']) ?? str(r.sourceFile);
  const line = num(r['line-number']) ?? num(r.lineNumber);
  if (!directive && !blocked) return null;
  return { directive, blocked, documentUri, sourceFile, line };
}

function isNoise(n: Norm): boolean {
  const hay = `${n.blocked} ${n.sourceFile ?? ''}`.toLowerCase();
  return NOISE.some((p) => hay.includes(p));
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  // Garde-fou anti-flood : on n'accepte que les types de rapport attendus.
  if (!ct.includes('csp-report') && !ct.includes('reports+json') && !ct.includes('json')) {
    return new Response(null, { status: 415 });
  }

  let payload: unknown;
  try {
    const text = await req.text();
    if (text.length > BODY_MAX) return new Response(null, { status: 413 });
    payload = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  // `reports+json` = tableau ; `report-uri` = objet unique.
  const items = Array.isArray(payload) ? payload : [payload];
  for (const item of items) {
    const n = normalize(item);
    if (!n || isNoise(n)) continue;
    const key = `${n.directive}|${n.blocked}|${n.sourceFile ?? ''}`;
    if (seen.has(key)) continue;
    if (seen.size >= SEEN_MAX) seen.clear();
    seen.add(key);
    console.warn(
      '[csp-report]',
      JSON.stringify({
        directive: n.directive,
        blocked: n.blocked,
        document: n.documentUri,
        source: n.sourceFile,
        line: n.line,
      }),
    );
  }

  // 204 : rapport encaissé, rien à renvoyer.
  return new Response(null, { status: 204 });
}
