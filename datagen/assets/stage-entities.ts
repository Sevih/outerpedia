/**
 * Staging des images de MONSTRES et d'ÉQUIPEMENTS DÉJÀ VALIDÉS dont l'entrée
 * vient de changer — le pendant de `stage-characters.ts` pour les entités qui
 * n'ont pas d'étape « images » à l'intégration (`integrateMonster` : « pas
 * d'images ici », les vignettes relèvent du manifest global). Rejoué pour
 * QUELQUES ids seulement, jamais toute la collecte.
 *
 * Branché aux mêmes écritures que les persos : la validation d'une cible et
 * l'application des retouches mineures (revue admin, `extractor/review.ts`), et
 * `promote --apply` (CLI, `promote.ts`).
 *
 * CE QUI EST DEMANDÉ, par entité (`monsterAssetRequests`, `equipmentAssetRequests`
 * — les fonctions que `buildAssetManifest` appelle lui-même) :
 *   - monstre : sa vignette `MT_<icon>` (webp, PNG og) ;
 *   - équipement : sa tuile (webp, PNG og) et les icônes de SES passifs.
 * Jamais les calques partagés (cadres, classes, éléments, cadres de rareté),
 * qui ne dépendent pas d'une entité.
 *
 * … ET SEULEMENT SI LE MANIFEST GLOBAL LE DEMANDE AUSSI : chaque clé de l'entité
 * est cherchée dans `buildAssetManifest()` et c'est SA demande qui est stagée.
 * Le PNG n'existe que pour un boss de guide ou un objet à page détail, et un
 * monstre qu'aucune page ne sert n'a pas de vignette du tout (212 des 3 180
 * monstres à vignette propre le 06/10/2026) : sans ce filtre, le staging
 * restreint déposerait des images que `assets:collect` ne demande pas — et que
 * `assets:push` enverrait quand même. Le manifest se lit sur le validé qu'on
 * vient d'écrire : appeler APRÈS l'écriture.
 *
 * `deps` injectables (manifest, catalogue des passifs, index d'images,
 * staging) : testable sans `.gamedata`, sans `data/generated`, sans écriture
 * dans `.assets-staging/`.
 */
import { resolve } from 'node:path';
import { readCuratedJson } from '../lib/json';
import {
  buildAssetManifest,
  equipmentAssetRequests,
  monsterAssetRequests,
  type AssetRequest,
  type EquipmentAssetOptions,
} from './manifest';
import { buildImageIndex, type ImageIndex } from './source';
import { stageAssets, type StageResult } from './stage';
import { emptyStage } from './stage-characters';

type Dict = Record<string, unknown>;
type Passives = NonNullable<EquipmentAssetOptions['passives']>;

/**
 * Fichiers validés (relatifs à `data/generated/`) dont les entités portent des
 * images PROPRES, et leur sorte. Les cibles de revue `monster`, `ee`, `weapon`,
 * `amulet`, `armor`, `talisman` et `set` s'y retrouvent par leur `file` ; les
 * trois autres pièces d'armure n'ont pas de cible de revue mais partent avec
 * `promote`.
 */
const ENTITY_FILES: Record<string, 'monster' | 'equipment'> = {
  'monsters.json': 'monster',
  'equipment/weapon.json': 'equipment',
  'equipment/accessory.json': 'equipment',
  'equipment/talisman.json': 'equipment',
  'equipment/helmet.json': 'equipment',
  'equipment/armor.json': 'equipment',
  'equipment/gloves.json': 'equipment',
  'equipment/shoes.json': 'equipment',
  'equipment/ee.json': 'equipment',
  'equipment/sets.json': 'equipment',
};

/** `file` est-il un fichier dont ce module sait stager les entités ? */
export function stagesEntityAssets(file: string): boolean {
  return file in ENTITY_FILES;
}

export interface StageEntitiesDeps {
  /** Manifest global, lu sur le validé (défaut : `buildAssetManifest`). */
  manifest?: () => AssetRequest[];
  /** Catalogue des passifs d'équipement (défaut : `equipment/passives.json` validé). */
  passives?: () => Passives;
  /** Index des images extraites du jeu (défaut : `buildImageIndex`). */
  index?: () => ImageIndex;
  /** Dépôt des demandes dans le staging (défaut : `stageAssets`). */
  stage?: (requests: AssetRequest[], index: ImageIndex) => Promise<StageResult>;
}

const validatedPassives = (): Passives =>
  readCuratedJson<Passives>(resolve('data/generated/equipment/passives.json')) ?? {};

/**
 * Met en place les images manquantes des entités `ids` du fichier `file` (lues
 * dans `entities`, le contenu validé de ce fichier). Un id absent d'`entities`
 * est ignoré, une clé que le manifest global ne demande pas aussi ; les
 * demandes sont dédupliquées par clé (deux armes partagent une tuile de tier).
 * Incrémental comme la collecte : une image déjà à jour est comptée `present`.
 */
export async function stageEntityAssets(
  file: string,
  ids: Iterable<string>,
  entities: Dict,
  deps: StageEntitiesDeps = {},
): Promise<StageResult> {
  const kind = ENTITY_FILES[file];
  if (!kind) return emptyStage();

  // Toutes les clés que l'entité PEUT avoir (PNG et passifs compris) — le
  // manifest tranche ensuite lesquelles existent vraiment.
  let passives: Passives | undefined;
  const requestsOf = (entity: Dict): AssetRequest[] =>
    kind === 'monster'
      ? monsterAssetRequests(entity, { png: true })
      : equipmentAssetRequests(entity, {
          og: true,
          passives: (passives ??= (deps.passives ?? validatedPassives)()),
        });

  const own: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const e = entities[id];
    if (!e || typeof e !== 'object' || Array.isArray(e)) continue;
    for (const r of requestsOf(e as Dict)) {
      if (seen.has(r.key)) continue;
      seen.add(r.key);
      own.push(r.key);
    }
  }
  if (!own.length) return emptyStage();

  const wanted = new Map((deps.manifest ?? buildAssetManifest)().map((r) => [r.key, r]));
  const requests = own.flatMap((key) => wanted.get(key) ?? []);
  if (!requests.length) return emptyStage();
  const index = (deps.index ?? buildImageIndex)();
  return (deps.stage ?? stageAssets)(requests, index);
}
