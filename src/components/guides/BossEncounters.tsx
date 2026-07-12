/**
 * UN COMBAT ET SES DIFFICULTÉS — la composition des modes qui rejouent le même
 * boss à plusieurs paliers de difficulté (Joint Challenge, World Boss, Guild
 * Raid, Irregular Extermination).
 *
 * Le guide désigne un `group` — un COMBAT — et tout le reste en découle : les
 * difficultés dans l'ordre, leurs libellés, leurs monstres, leurs niveaux, leurs
 * modificateurs. Rien n'est écrit à la main, rien ne se déduit d'un identifiant.
 *
 * Ce composant ne fait QUE choisir : il pose les onglets et empile des
 * `BossCard`. Toute la connaissance du boss vit dans la carte, tout le choix de
 * difficulté vit dans `EncounterSelection` — et il n'y a pas de troisième
 * endroit. Composant SERVEUR : les monstres changent d'une difficulté à l'autre
 * (icône, compétences, immunités), donc c'est le serveur qui les rend tous.
 */
import { getT } from '@/i18n';
import type { Lang } from '@/lib/i18n/config';
import { difficultyLabel, encounterSpawnContexts, encountersOfGroup } from '@/lib/data/encounters';
import { BossCard } from './BossPanel';
import { EncounterPane, EncounterSelection, EncounterTabs } from './EncounterSelection';

export async function BossEncounters({
  group,
  lang,
  /**
   * Difficulté ouverte au premier rendu. Par défaut la PLUS DURE : c'est celle
   * pour laquelle les guides sont écrits (la V2 ne montrait même que celle-là).
   */
  defaultIndex,
}: {
  group: string;
  lang: Lang;
  defaultIndex?: number;
}) {
  const t = await getT(lang);
  const encounters = encountersOfGroup(group);

  // Groupe inconnu = guide qui pointe dans le vide : on casse le build plutôt
  // que de rendre un panneau muet que personne ne remarquerait.
  if (!encounters.length) {
    throw new Error(
      `BossEncounters : aucun donjon pour le combat « ${group} » — ` +
        `vérifier le champ \`group\` du guide contre data/generated/encounters.json.`,
    );
  }

  const labels = encounters.map(
    (e, i) => difficultyLabel(e.ref, lang, t) ?? `${t('guides.difficulty.title')} ${i + 1}`,
  );

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
              {e.monsters.map((m) => (
                <BossCard
                  key={m.id}
                  monsterId={m.id}
                  spawns={encounterSpawnContexts(e, m, lang)}
                  lang={lang}
                />
              ))}
            </div>
          </EncounterPane>
        ))}
      </div>
    </EncounterSelection>
  );
}
