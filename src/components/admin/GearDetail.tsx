/* eslint-disable @next/next/no-img-element -- sprites dev */
/**
 * Fiche INFO d'une entrée d'équipement (extracteur) : identité multilingue,
 * sprites, stats, passifs résolus (palier 1 → max), chips d'effets, provenance.
 * Serveur, dev only.
 */
import { notFound } from 'next/navigation';
import type { LangDict } from '@contracts';
import { img } from '@/lib/images';
import type { GearKind } from '@/lib/admin/gear-rows';
import { entityReview, type EquipmentEntityKind } from '@/lib/admin/review-store';
import { IntegrateGearButton } from './IntegrateGearButton';
import {
  getAmuletFamilies,
  getEEViews,
  getSetViews,
  getTalismanFamilies,
  getWeaponFamilies,
  passiveEffects,
  resolvePassives,
  type GearFamily,
} from '@/lib/data/equipment';

/** GearKind d'affichage → kind d'intégration datagen + cible de revue (id ≠ nom). */
const INTEGRATE: Record<GearKind, { kind: EquipmentEntityKind; reviewId: string }> = {
  weapons: { kind: 'weapon', reviewId: 'weapon' },
  amulets: { kind: 'accessory', reviewId: 'amulet' },
  talismans: { kind: 'talisman', reviewId: 'talisman' },
  ee: { kind: 'ee', reviewId: 'ee' },
  sets: { kind: 'set', reviewId: 'set' },
};

/**
 * Bloc d'intégration par entité (bouton « valider ce que l'extracteur sort »).
 * Le statut de revue décide du libellé : entité absente du committé = « new ».
 */
function IntegrateSection({ gearKind, id }: { gearKind: GearKind; id: string }) {
  const { kind, reviewId } = INTEGRATE[gearKind];
  const isNew = entityReview(reviewId, id).status === 'added';
  return (
    <div className="border-line-subtle bg-surface-raised space-y-2 rounded-lg border p-4">
      <IntegrateGearButton kind={kind} id={id} isNew={isNew} />
      <p className="text-content-subtle text-xs">
        Écrit cette entité (lignes de la famille + pools/passifs/paliers référencés) dans{' '}
        <code>data/generated/equipment/</code> et stage ses images — à committer via git.
      </p>
    </div>
  );
}

const sprite = (name: string) => `/api/admin/sprite/${encodeURIComponent(name)}`;

function plain(s: string): string {
  return s.replace(/\\n/g, '\n').replace(/<\/?color[^>]*>/g, '');
}

function Langs({ d }: { d: LangDict }) {
  return (
    <span className="text-content-subtle text-xs">
      {(['jp', 'kr', 'zh'] as const).map((l) => (d[l] ? `${l}: ${d[l]}  ` : '')).join('')}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-content-strong text-sm font-semibold uppercase">{title}</h2>
      {children}
    </section>
  );
}

function PassiveList({ passives }: { passives: ReturnType<typeof resolvePassives> }) {
  return (
    <ul className="space-y-2">
      {passives.map((p, i) => (
        <li key={i} className="border-line-subtle rounded-lg border p-3 text-sm">
          <p className="text-content-strong flex items-center gap-2 font-medium">
            {p.icon && <img src={sprite(p.icon)} alt="" className="h-6 w-6 object-contain" />}
            {p.name}
            <span className="text-content-subtle text-xs font-normal">
              niv. {p.level}
              {p.isAdd ? ' (s’ajoute)' : ''} · {p.levels} palier(s)
            </span>
          </p>
          <p className="text-content-subtle mt-1 text-xs whitespace-pre-line">{plain(p.first)}</p>
          {p.last && (
            <p className="text-content-subtle mt-1 text-xs whitespace-pre-line">
              max : {plain(p.last)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function Header({
  icon,
  frame,
  name,
  sub,
}: {
  icon: string;
  /** Fond de slot (rareté) derrière le sprite. */
  frame?: string;
  name: LangDict;
  sub: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h1 className="text-content-strong flex items-center gap-3 text-xl font-semibold">
        <span className="relative h-12 w-12 shrink-0">
          {frame && (
            <img
              src={frame}
              alt=""
              className="absolute inset-0 h-full w-full rounded object-cover"
            />
          )}
          <img
            src={sprite(icon)}
            alt=""
            className="absolute inset-0 h-full w-full rounded object-contain"
          />
        </span>
        <span>{name.en}</span>
      </h1>
      <p className="text-content-subtle text-sm">{sub}</p>
      <Langs d={name} />
    </div>
  );
}

function FamilyDetail({ f }: { f: GearFamily }) {
  const passives = resolvePassives(f.passives, 'en');
  const effects = passiveEffects(f.passives);
  return (
    <div className="max-w-3xl space-y-5">
      <Header
        icon={f.icon}
        frame={img.slotFrame(f.grade)}
        name={f.name}
        sub={
          <>
            <span className="font-mono">{f.id}</span> · {f.grade} · ★{f.stars.join('/')}
            {f.mode ? ` · ${f.mode}` : ''}
            {f.classLimits.length ? ` · classes : ${f.classLimits.join(', ')}` : ''}
          </>
        }
      />
      {f.mainStats.length > 0 && (
        <Section title="Main stats">
          <p className="flex flex-wrap gap-1.5 text-xs">
            {f.mainStats.map((s) => (
              <span
                key={s}
                className="bg-surface-raised border-line-subtle rounded border px-1.5 py-0.5"
              >
                {s}
              </span>
            ))}
          </p>
        </Section>
      )}
      <Section title="Passif">
        <PassiveList passives={passives} />
        {f.classPassives?.map((cp) => (
          <div key={cp.classLimit} className="space-y-1">
            <p className="text-content-subtle text-xs">variante {cp.classLimit} :</p>
            <PassiveList passives={resolvePassives(cp.passives, 'en')} />
          </div>
        ))}
        {effects.length > 0 && (
          <p className="flex flex-wrap gap-1 text-xs">
            {effects.map((e, i) => (
              <span
                key={i}
                className="bg-surface-raised border-line-subtle rounded border px-1.5 py-0.5"
              >
                {e.family}/{e.category}
                {e.stat ? ` ${e.stat}` : ''}
              </span>
            ))}
          </p>
        )}
      </Section>
      {f.source && (f.source.bosses.length > 0 || f.source.shops.length > 0 || f.source.label) && (
        <Section title="Provenance">
          <p className="text-content-subtle text-xs">
            {f.source.bosses.map((b) => b.name.en).join(', ')}
            {f.source.shops.length ? ` · boutiques : ${f.source.shops.join(', ')}` : ''}
            {f.source.label ? ` · ${f.source.label}` : ''}
          </p>
        </Section>
      )}
      <Section title="Membres de la famille">
        <p className="text-content-subtle font-mono text-xs">{f.ids.join(' · ')}</p>
      </Section>
    </div>
  );
}

/** Fiche d'une entrée d'équipement — `notFound()` si l'id est inconnu. */
export function GearDetail({ kind, id }: { kind: GearKind; id: string }) {
  if (kind === 'weapons' || kind === 'amulets' || kind === 'talismans') {
    const fams =
      kind === 'weapons'
        ? getWeaponFamilies()
        : kind === 'amulets'
          ? getAmuletFamilies()
          : getTalismanFamilies();
    const f = fams.find((x) => x.id === id);
    if (!f) notFound();
    return (
      <div className="space-y-5">
        <IntegrateSection gearKind={kind} id={id} />
        <FamilyDetail f={f} />
      </div>
    );
  }

  if (kind === 'ee') {
    const e = getEEViews().find((x) => x.itemId === id);
    if (!e) notFound();
    const passives = resolvePassives(e.passives, 'en');
    const effects = passiveEffects(e.passives);
    return (
      <div className="max-w-3xl space-y-5">
        <IntegrateSection gearKind={kind} id={id} />
        <Header
          icon={`TI_Equipment_EX_${e.characterId}`}
          frame={img.slotFrame(e.grade)}
          name={e.name}
          sub={
            <>
              <span className="font-mono">{e.itemId}</span> · EE de{' '}
              <span className="font-mono">{e.characterId}</span> · {e.grade} · {e.star}★ · trust{' '}
              {e.trustLevel}
              {e.rank ? ` · rank ${e.rank}` : ''}
              {e.rank10 ? ` / +10 ${e.rank10}` : ''}
            </>
          }
        />
        {e.mainStats.length > 0 && (
          <Section title="Main stats">
            <p className="flex flex-wrap gap-1.5 text-xs">
              {e.mainStats.map((s) => (
                <span
                  key={s}
                  className="bg-surface-raised border-line-subtle rounded border px-1.5 py-0.5"
                >
                  {s}
                </span>
              ))}
            </p>
          </Section>
        )}
        <Section title="Passif (base → +10)">
          <PassiveList passives={passives} />
          {effects.length > 0 && (
            <p className="flex flex-wrap gap-1 text-xs">
              {effects.map((x, i) => (
                <span
                  key={i}
                  className="bg-surface-raised border-line-subtle rounded border px-1.5 py-0.5"
                >
                  {x.family}/{x.category}
                  {x.stat ? ` ${x.stat}` : ''}
                </span>
              ))}
            </p>
          )}
        </Section>
      </div>
    );
  }

  // Sets
  const s = getSetViews('en').find((x) => x.id === id);
  if (!s) notFound();
  return (
    <div className="max-w-3xl space-y-5">
      <IntegrateSection gearKind={kind} id={id} />
      <Header
        icon={s.icon}
        frame={img.slotFrame('unique')}
        name={s.name}
        sub={
          <>
            <span className="font-mono">{s.id}</span> · set d&apos;armure
          </>
        }
      />
      <Section title="Pièces (6★)">
        <p className="flex gap-2">
          {Object.entries(s.pieceIcons).map(([slot, icon]) => (
            <span key={slot} className="text-center text-xs">
              <img src={sprite(icon)} alt="" className="h-10 w-10 object-contain" />
              <span className="text-content-subtle">{slot}</span>
            </span>
          ))}
        </p>
      </Section>
      <Section title="Bonus (base → enchanté)">
        <ul className="space-y-1 text-sm">
          {s.tiers.map((t, i) => (
            <li key={i} className="text-content-subtle text-xs">
              <span className="text-content-strong">palier {i === 0 ? 'base' : 'enchanté'}</span>
              {t.p2 ? ` · 2P : ${plain(t.p2)}` : ''}
              {t.p4 ? ` · 4P : ${plain(t.p4)}` : ''}
            </li>
          ))}
        </ul>
      </Section>
      {s.source && (s.source.bosses.length > 0 || s.source.shops.length > 0 || s.source.label) && (
        <Section title="Provenance">
          <p className="text-content-subtle text-xs">
            {s.source.bosses.map((b) => b.name.en).join(', ')}
            {s.source.shops.length ? ` · boutiques : ${s.source.shops.join(', ')}` : ''}
            {s.source.label ? ` · ${s.source.label}` : ''}
          </p>
        </Section>
      )}
    </div>
  );
}
