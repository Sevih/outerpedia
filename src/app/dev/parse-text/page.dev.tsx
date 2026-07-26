import type { ReactNode } from 'react';
import { getT } from '@/i18n';
import { parseText, type ParseCtx } from '@/lib/parse-text';

/**
 * BANC DE RENDU DES TAGS INLINE (dev-only, route `/dev/parse-text` — `.dev.tsx`
 * non buildé en prod). Chaque tag `{TYPE/valeur}` du contenu éditorial est rendu
 * par le VRAI moteur (`parseText`, résolution serveur), source brute à gauche,
 * rendu à droite. Sert à contrôler d'un coup d'œil icônes, couleurs, liens ET
 * infobulles — notamment les tooltips `{SK/…}` (desc du dernier palier) et
 * `{I-W|A|T/…}` (passif du haut de famille), à survoler pour vérifier.
 *
 * Les exemples pointent sur de la donnée RÉELLE (Vera, Heartunder's Blade…) pour
 * que les résolveurs aboutissent ; un tag mort s'afficherait en ROUGE (mode
 * tolérant, pas `strict`) — ce qui est en soi un signal utile.
 */
export const metadata = { title: 'Parse-text' };

const GROUPS: { title: string; note?: string; tags: string[] }[] = [
  {
    title: 'Effets — {B/buff} · {D/debuff}',
    note: 'Tuile recolorée + libellé + infobulle (nom + description de l’effet).',
    tags: ['{B/BT_BARRIER}', '{B/BT_COUNTERATTACK}', '{D/BT_DOT_BLEED}', '{D/BT_AGGRO}'],
  },
  {
    title: 'Perso · Skill · EE — {P/…} · {SK/…} · {EE/…}',
    note: 'Skill : infobulle NOUVELLE = nom + desc du dernier palier (placeholders résolus). Survole.',
    tags: ['{P/Vera}', '{SK/Vera|S1}', '{SK/Vera|S2}', '{SK/Vera|S3}', '{EE/Vera}'],
  },
  {
    title: 'Chain · Dual · Passive — moitiés de chaîne & passif core-fusion',
    note: 'Chain/Dual = moitié correspondante du chain_passive. Passive = « Core-Fused Passive », core-fusion UNIQUEMENT — sur un perso normal il reste rouge (voulu).',
    tags: [
      '{SK/Vera|Chain}',
      '{SK/Vera|Dual}',
      '{SK/Core Fusion Notia|Passive}',
      '{SK/Vera|Passive}',
    ],
  },
  {
    title: 'Équipement — {I-W/arme} · {I-A/amulette} · {I-T/talisman}',
    note: 'Infobulle NOUVELLE = passif du haut de famille au palier max. Survole la tuile.',
    tags: ["{I-W/Heartunder's Blade}", '{I-A/Burning Soul}', "{I-T/Executioner's Charm}"],
  },
  {
    title: 'Item générique · Set — {I-I/…} · {AS/…}',
    note: 'Déjà porteurs d’une desc (référence : ceux-là marchaient avant le fix).',
    tags: ['{I-I/Stage 1 Attack Gem}', '{AS/Attack Set}'],
  },
  {
    title: 'Élément · Classe · Stat — {E/…} · {C/…} · {S/…}',
    tags: ['{E/fire}', '{E/water}', '{C/defender}', '{C/mage}', '{S/ATK}', '{S/SPD}'],
  },
  {
    title: 'Lien libre — {L/label|/chemin}',
    tags: ['{L/Voir les guides|/guides}'],
  },
];

// Paragraphe mixte : les tags rendus EN CONTEXTE, au fil du texte (cas réel des
// guides), pour vérifier l'alignement vertical et les sauts de ligne.
const PROSE =
  'Vera lance {SK/Vera|S3} pour poser {B/BT_BARRIER} sur l’équipe, puis {SK/Vera|S1} ' +
  "inflige {D/BT_DOT_BLEED}. Équipe-la de {I-W/Heartunder's Blade} et du {AS/Attack Set} " +
  'pour maximiser les {S/ATK}.';

function Row({ src, rendered }: { src: string; rendered: ReactNode }) {
  return (
    <div className="border-line-subtle grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-b py-2 last:border-b-0">
      <code className="text-content-subtle font-mono text-xs break-all">{src}</code>
      <div className="text-content text-sm">{rendered}</div>
    </div>
  );
}

export default async function ParseTextBench() {
  const t = await getT('en');
  const ctx: ParseCtx = { lang: 'en', t };

  return (
    <div className="bg-surface-base text-content min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-content-strong text-2xl font-bold">
          Parse-text — banc de rendu des tags
        </h1>
        <p className="text-content-muted mt-1 text-sm">
          Moteur <code>parseText</code> (résolution serveur, langue <code>en</code>). Source à
          gauche, rendu à droite ; <strong>survole</strong> les chips pour les infobulles.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <section
            key={g.title}
            className="border-line-subtle bg-surface-raised rounded-xl border p-4"
          >
            <h2 className="text-content-strong text-sm font-semibold tracking-wide uppercase">
              {g.title}
            </h2>
            {g.note && <p className="text-content-subtle mt-1 mb-2 text-[11px]">{g.note}</p>}
            <div className="mt-2">
              {g.tags.map((tag) => (
                <Row key={tag} src={tag} rendered={parseText(tag, ctx)} />
              ))}
            </div>
          </section>
        ))}

        {/* En contexte (paragraphe mixte) */}
        <section className="border-line-subtle bg-surface-raised rounded-xl border p-4 lg:col-span-2">
          <h2 className="text-content-strong mb-2 text-sm font-semibold tracking-wide uppercase">
            En contexte (paragraphe mixte)
          </h2>
          <p className="text-content text-sm leading-relaxed">{parseText(PROSE, ctx)}</p>
        </section>
      </div>
    </div>
  );
}
