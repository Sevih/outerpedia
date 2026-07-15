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
import { getMonster, monsterDisplayNames, monsterIconSrc } from '@/lib/data/monsters';
import { BossCard } from './BossPanel';
import { MonsterLineup, type LineupItem } from './MonsterLineup';
import { EncounterPane, EncounterSelection, EncounterTabs } from './EncounterSelection';

/**
 * Les monstres d'une rencontre, prêts à être RANGÉS (cf. `MonsterLineup`).
 *
 * Le boss passe devant ses renforts (tri STABLE : à rôle égal, l'ordre du jeu est
 * conservé — les deux phases d'un world boss restent dans leur ordre). Les noms
 * sont désambiguïsés SUR LA RENCONTRE : trois renforts qui partagent un nom
 * donneraient trois vignettes identiques, et le lecteur ne saurait pas laquelle
 * il regarde.
 */
function lineup(
  e: Encounter,
  monsters: DungeonMonster[],
  lang: Lang,
  afterStats: ReactNode,
  hideSpawnLabel: boolean,
  compact: boolean,
): LineupItem[] {
  const ordered = [...monsters].sort((a, b) => Number(a.role === 'add') - Number(b.role === 'add'));
  const names = monsterDisplayNames(
    ordered.map((m) => m.id),
    lang,
  );

  return ordered.map((m, slot) => {
    const monster = getMonster(m.id);
    if (!monster) {
      throw new Error(
        `BossEncounters : monstre « ${m.id} » (donjon ${e.id}) absent de ` +
          `data/generated/monsters.json — à extraire/valider via l'admin.`,
      );
    }
    return {
      role: m.role === 'add' ? 'add' : 'boss',
      name: names.get(m.id) ?? monster.name.en,
      iconSrc: monsterIconSrc(monster),
      card: (
        <BossCard
          monsterId={m.id}
          spawns={encounterSpawnContexts(e, m, lang)}
          lang={lang}
          role={m.role}
          hideSpawnLabel={hideSpawnLabel}
          compact={compact}
          // L'encart du mode va sous la carte du BOSS (le premier après tri),
          // jamais sous celle d'un renfort.
          afterStats={slot === 0 ? afterStats : undefined}
        />
      ),
    };
  });
}

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
  /**
   * Masque le suffixe « — <mode · donjon> » des stats de chaque carte : le
   * guild raid porte déjà ce contexte dans ses onglets (sous-boss + difficulté),
   * le répéter sous les stats n'apprend rien.
   */
  hideSpawnLabel = false,
  /** Mode COMPACT des cartes de boss (cf. `BossCard`) — stats repliées, skills en onglets. */
  compact = false,
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
  hideSpawnLabel?: boolean;
  compact?: boolean;
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
            {/* Plusieurs monstres = un SEUL combat : ils se battent ensemble, ils
                se lisent ensemble. Comment on les range est une règle unique, qui
                vit dans `MonsterLineup` — le boss d'abord, ses renforts ensuite,
                côte à côte à deux, en vignettes à trois et plus.

                LE BOSS D'ABORD n'est pas cosmétique : le jeu range ses monstres
                par POSITION sur le terrain, pas par importance — le Sterope
                d'Astei et le K de Monad Eva sont posés à gauche de leur boss,
                donc listés avant lui, et la page s'ouvrait sur l'escorte.

                L'encart du mode (butin de la difficulté…) va sous la carte du
                BOSS, jamais sous celle d'un renfort. */}
            <MonsterLineup
              addsLabel={t('guides.boss_display.add')}
              items={lineup(e, monsters(e), lang, afterStats?.(e), hideSpawnLabel, compact)}
            />
          </EncounterPane>
        ))}
      </div>
    </EncounterSelection>
  );
}
