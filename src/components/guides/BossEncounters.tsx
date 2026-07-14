/**
 * UN COMBAT ET SES DIFFICULTÉS — la composition des modes qui rejouent le même
 * boss à plusieurs paliers de difficulté (Joint Challenge, World Boss, Guild
 * Raid, Irregular Extermination).
 *
 * Le guide désigne un `group` — un COMBAT — et tout le reste en découle : les
 * difficultés dans l'ordre, leurs libellés, leurs monstres, leurs niveaux, leurs
 * modificateurs. Rien n'est écrit à la main, rien ne se déduit d'un identifiant.
 * Les modes dont la donnée ne porte AUCUN group (l'histoire) désignent leurs
 * donjons nommément (`dungeons`) : même rendu, même onglets, autre clé d'entrée.
 *
 * Ce composant ne fait QUE choisir : il pose les onglets et empile des
 * `BossCard`. Toute la connaissance du boss vit dans la carte, tout le choix de
 * difficulté vit dans `EncounterSelection` — et il n'y a pas de troisième
 * endroit. Composant SERVEUR : les monstres changent d'une difficulté à l'autre
 * (icône, compétences, immunités), donc c'est le serveur qui les rend tous.
 */
import type { ReactNode } from 'react';
import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import type { DungeonMonster } from '@contracts';
import {
  encounterLabel,
  encounterSpawnContexts,
  encountersOfGroup,
  encountersOfIds,
  type Encounter,
} from '@/lib/data/encounters';
import { BossCard } from './BossPanel';
import { EncounterPane, EncounterSelection, EncounterTabs } from './EncounterSelection';

export async function BossEncounters({
  group,
  dungeons,
  lang,
  /**
   * Difficulté ouverte au premier rendu. Par défaut la PLUS DURE : c'est celle
   * pour laquelle les guides sont écrits (la V2 ne montrait même que celle-là).
   */
  defaultIndex,
  /**
   * Encart posé DANS la carte du boss, sous ses stats — ce que le mode a de
   * particulier à dire sur CETTE difficulté (la poursuite irregular y met son
   * butin : le pool change d'une difficulté à l'autre, l'équipement ne tombe
   * qu'en Very Hard). Un render-prop plutôt qu'un drapeau : le composant est
   * partagé avec le Joint Challenge et le World Boss, et il n'a aucune raison
   * de connaître le butin de qui que ce soit.
   */
  afterStats,
  /**
   * Les monstres à rendre pour une rencontre. Par défaut TOUT le donjon : au
   * joint challenge ou au guild raid, ce qui est dans le donjon est le combat.
   * L'histoire, elle, empile des vagues d'escorte devant son boss et ne garde
   * que la sienne (`bossWaveMonsters`) — d'où le choix laissé à l'appelant,
   * plutôt qu'un drapeau `story` que ce composant n'a aucune raison de porter.
   */
  monsters = (e) => e.monsters,
}: {
  /** Le COMBAT — pour les modes qui en déclarent un (`DungeonRef.group`). */
  group?: string;
  /**
   * Les donjons désignés NOMMÉMENT, du plus facile au plus dur — pour les modes
   * qui n'ont pas de `group` (l'histoire : cf. `encountersOfIds`). Exclusif de
   * `group`.
   */
  dungeons?: readonly string[];
  lang: Lang;
  defaultIndex?: number;
  afterStats?: (encounter: Encounter) => ReactNode;
  monsters?: (encounter: Encounter) => DungeonMonster[];
}) {
  const t = await getT(lang);

  if (!group === !dungeons) {
    throw new Error('BossEncounters : exactement un de « group » / « dungeons » est attendu.');
  }
  // Un combat inconnu = guide qui pointe dans le vide : on casse le build plutôt
  // que de rendre un panneau muet que personne ne remarquerait.
  const encounters = group ? encountersOfGroup(group) : encountersOfIds(dungeons!);
  if (!encounters.length) {
    throw new Error(
      `BossEncounters : aucun donjon pour le combat « ${group} » — ` +
        `vérifier le champ \`group\` du guide contre data/generated/encounters.json.`,
    );
  }

  const labels = encounters.map((e) => encounterLabel(e.ref, lang, t));

  return (
    <EncounterSelection
      count={encounters.length}
      defaultIndex={defaultIndex ?? encounters.length - 1}
    >
      <div className="space-y-4">
        {encounters.length > 1 && (
          <EncounterTabs label={t('guides.difficulty.title')} tabs={labels} />
        )}

        {encounters.map((e, i) => (
          <EncounterPane key={e.id} index={i}>
            {/* Plusieurs monstres = un seul combat : le World Boss enchaîne deux
                phases dans ses ligues hautes, le Guild Raid flanque son boss d'un
                add. On les empile — ils se battent ensemble, ils se lisent
                ensemble. */}
            <div className="space-y-6">
              {monsters(e).map((m, slot) => (
                <BossCard
                  key={m.id}
                  monsterId={m.id}
                  spawns={encounterSpawnContexts(e, m, lang)}
                  lang={lang}
                  // L'encart du mode va dans la carte du BOSS (le premier
                  // monstre du donjon), pas sous celle de l'add qui l'escorte.
                  afterStats={slot === 0 ? afterStats?.(e) : undefined}
                />
              ))}
            </div>
          </EncounterPane>
        ))}
      </div>
    </EncounterSelection>
  );
}
