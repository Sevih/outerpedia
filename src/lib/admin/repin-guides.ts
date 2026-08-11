/**
 * RÉ-ÉPINGLAGE des guides après « Versionner » un boss — étape 2/3 du
 * `TODO(guides)`. Versionner ne doit JAMAIS demander d'éditer un guide à la main.
 *
 * Ce module ne fait que PLANIFIER : il rend la liste des éditions, il n'écrit
 * rien. L'appelant affiche le plan puis l'applique — c'est ce qui rend le geste
 * inspectable avant qu'il touche 87 fichiers de contenu.
 *
 * DEUX NATURES DE RÉFÉRENCE, et elles ne se traitent pas pareil :
 *
 *   DIRECTE — `meta.bossId` (87 guides) et `meta.monsters` (2) nomment UN
 *   monstre. On y réécrit l'id en place : `getMonster` sait résoudre `<id>@<n>`
 *   depuis l'étape 1, donc ça fonctionne sans rien changer au rendu.
 *
 *   INDIRECTE — `meta.group` (40), `meta.dungeons` (20) et les groupes des
 *   `config.json` versionnés désignent un COMBAT, dont les monstres sont résolus
 *   au rendu depuis `encounters.json`. Il n'y a aucun id à réécrire : le pin ne
 *   peut être qu'une LISTE À PART, que le rendu doit apprendre à consulter. Ces
 *   références sont donc RAPPORTÉES mais pas éditées — c'est le reste de
 *   l'étape 2, et le plan les montre pour qu'on en connaisse le volume.
 *
 * Règle appliquée : « ré-épingler ce qui est ENCORE EN LIVE », par monstre. Une
 * référence déjà épinglée (`<id>@<k>`) n'est pas retouchée — c'est ce qui fait
 * que le geste se maintient tout seul d'une version de guide à la suivante.
 */
import { listGuides, readGuideVersionFile, type Guide } from '@/lib/data/guides';
import { encountersOfGroup } from '@/lib/data/encounters';
import { addVersionPin, patchGuideMetaFields } from '@/lib/admin/guide-store';

/** Clés d'un `config.json` de version qui désignent un COMBAT. */
const GROUP_KEYS = ['group', 'main', 'subA', 'subB'] as const;

export interface RepinEdit {
  /** `<catégorie>/<slug>` — le guide concerné. */
  guide: string;
  /** Chemin RELATIF au dossier de contenu, pour l'affichage. */
  file: string;
  /** Champ touché. */
  field: 'meta.bossId' | 'meta.monsters';
  /**
   * Valeurs AVANT/APRÈS, dans la forme qu'a le champ : une chaîne pour
   * `meta.bossId`, une LISTE pour `meta.monsters`. Structurées et pas jointes
   * pour l'œil — c'est `after` qu'on écrit, et un `"a, b"` recollé serait une
   * conversion à refaire au moment le plus risqué (cf. `applyRepin`).
   */
  before: string | string[];
  after: string | string[];
}

/** Clé de `meta.json` touchée par une édition. */
export const metaKey = (e: RepinEdit): 'bossId' | 'monsters' =>
  e.field === 'meta.bossId' ? 'bossId' : 'monsters';

/** Rendu lisible d'une valeur d'édition (l'affichage joint, le disque non). */
export const showValue = (v: string | string[]): string => (Array.isArray(v) ? v.join(', ') : v);

/**
 * Référence que le plan voit et laisse EXPRÈS en live. Rapportée quand même :
 * une référence qui disparaît du plan sans un mot ressemble à un oubli.
 */
export interface RepinKept {
  guide: string;
  field: 'meta.bossId';
  reason: 'guide versionné — le portrait et le H1 suivent l’entité courante';
}

/** Référence INDIRECTE (un combat) : rapportée, pas éditable en l'état. */
export interface RepinPending {
  guide: string;
  /** D'où vient la référence au combat. */
  origin: 'meta.group' | 'meta.dungeons' | 'version.config';
  /** Clé de version pour `version.config`. */
  version?: string;
  /** Le combat qui amène ce monstre. */
  group: string;
}

export interface RepinPlan {
  id: string;
  key: string;
  /** Éditions applicables telles quelles. */
  edits: RepinEdit[];
  /** Références qui atteignent le monstre sans le nommer. */
  pending: RepinPending[];
  /** Références nommées qu'on laisse volontairement en live. */
  kept: RepinKept[];
}

/** Ids des monstres d'un combat (toutes ses rencontres confondues). */
function monstersOfGroup(group: string): Set<string> {
  const out = new Set<string>();
  for (const e of encountersOfGroup(group)) for (const m of e.monsters) out.add(m.id);
  return out;
}

/** Une référence pointe-t-elle ENCORE le monstre vivant ? (déjà épinglée = non) */
const isLiveRef = (ref: string, id: string): boolean => ref === id;

function metaFile(g: Guide): string {
  return `${g.category}/${g.slug}/meta.json`;
}

/**
 * Ce que « Versionner `id` en `key` » impliquerait pour les guides. N'écrit rien.
 */
export function planRepin(id: string, key: string): RepinPlan {
  const edits: RepinEdit[] = [];
  const pending: RepinPending[] = [];
  const kept: RepinKept[] = [];

  for (const g of listGuides()) {
    const name = `${g.category}/${g.slug}`;

    // --- Références DIRECTES : l'id est écrit, on le réécrit ------------------
    if (g.bossId && isLiveRef(g.bossId, id)) {
      // SAUF sur un guide VERSIONNÉ, où `meta.bossId` ne désigne pas le boss
      // d'une version : il porte le portrait, le H1, l'og:image et la jointure
      // saison — l'entité COURANTE. L'épingler figerait l'illustration du guide
      // sur l'ancien boss jusque sur sa version la plus récente. Le pin d'un
      // guide versionné vit dans le `config.json` de la version concernée
      // (décision arbitrée avec Sevih, cf. TODO.md), et il n'y a donc rien à
      // réécrire ici — les vraies références ressortent en `pending`.
      if (g.versions.length) {
        kept.push({
          guide: name,
          field: 'meta.bossId',
          reason: 'guide versionné — le portrait et le H1 suivent l’entité courante',
        });
      } else {
        edits.push({
          guide: name,
          file: metaFile(g),
          field: 'meta.bossId',
          before: g.bossId,
          after: key,
        });
      }
    }
    const monsters = (g as Guide & { monsters?: string[] }).monsters;
    if (monsters?.some((m) => isLiveRef(m, id))) {
      edits.push({
        guide: name,
        file: metaFile(g),
        field: 'meta.monsters',
        before: monsters,
        after: monsters.map((m) => (isLiveRef(m, id) ? key : m)),
      });
    }

    // --- Références INDIRECTES : un COMBAT amène le monstre ------------------
    if (g.group && monstersOfGroup(g.group).has(id)) {
      pending.push({ guide: name, origin: 'meta.group', group: g.group });
    }
    for (const v of g.versions) {
      const cfg = readGuideVersionFile<Record<string, unknown>>(g, v.key, 'config.json');
      if (!cfg) continue;
      for (const k of GROUP_KEYS) {
        const group = cfg[k];
        if (typeof group !== 'string' || !monstersOfGroup(group).has(id)) continue;
        pending.push({ guide: name, origin: 'version.config', version: v.key, group });
      }
    }
  }

  return { id, key, edits, pending, kept };
}

/** Ce que l'application a vraiment fait. */
export interface RepinResult {
  /** Fichiers réécrits, `<catégorie>/<slug>/meta.json`. */
  files: string[];
  /** Éditions effectivement écrites. */
  applied: RepinEdit[];
  /** Guides du plan qu'on n'a PAS su écrire (introuvables, hors périmètre). */
  skipped: string[];
  /** Versions dont le `config.json` a reçu la clé d'archive (`pinned`). */
  pinnedVersions: string[];
  /**
   * Références indirectes qu'on n'a PAS su épingler — un guide plat qui désigne
   * un combat n'a pas de version où poser le pin, et il suit le live par nature
   * (il décrit le contenu courant, il n'a pas d'archive à lire). Rendues telles
   * quelles : les taire ferait croire le geste complet.
   */
  pending: RepinPending[];
  /** Références laissées en live à dessein (cf. `RepinKept`). */
  kept: RepinKept[];
}

/**
 * APPLIQUE le plan. Écrit dans les `meta.json` des guides — le seul geste de
 * cette affaire qui touche au contenu éditorial.
 *
 * GROUPÉ PAR FICHIER, et c'est la seule façon correcte : un guide peut porter
 * deux éditions sur le même `meta.json` (`adventure/S1-8-5` nomme son boss dans
 * `bossId` ET dans `monsters`). Écrire édition par édition ferait relire un état
 * mis en cache et la seconde écriture perdrait la première.
 */
export async function applyRepin(
  plan: RepinPlan,
  /**
   * L'écriture, substituable — défaut : le vrai `meta.json`. Les tests passent
   * un journal : vérifier le groupage en écrivant pour de bon demanderait un
   * faux arbre de guides complet, et le seul autre choix serait de ne pas le
   * vérifier du tout.
   */
  write: typeof patchGuideMetaFields = patchGuideMetaFields,
  /** L'écriture du pin de version, substituable pour les mêmes raisons. */
  pin: typeof addVersionPin = addVersionPin,
): Promise<RepinResult> {
  const byGuide = new Map<string, RepinEdit[]>();
  for (const e of plan.edits) {
    const list = byGuide.get(e.guide);
    if (list) list.push(e);
    else byGuide.set(e.guide, [e]);
  }

  const files: string[] = [];
  const applied: RepinEdit[] = [];
  const skipped: string[] = [];
  for (const [guide, edits] of byGuide) {
    const [category, slug] = guide.split('/');
    const fields = Object.fromEntries(edits.map((e) => [metaKey(e), e.after]));
    if (await write(category, slug, fields)) {
      files.push(edits[0].file);
      applied.push(...edits);
    } else {
      skipped.push(guide);
    }
  }
  // Références INDIRECTES : rien à réécrire dans le guide, le pin va dans le
  // `config.json` de la VERSION. C'est le seul chemin pour un guide versionné —
  // et c'est le cas majoritaire (joint challenge, world boss, guild raid).
  const pinnedVersions: string[] = [];
  const stillPending: RepinPending[] = [];
  for (const p of plan.pending) {
    const [category, slug] = p.guide.split('/');
    if (
      p.origin === 'version.config' &&
      p.version &&
      (await pin(category, slug, p.version, plan.key))
    ) {
      pinnedVersions.push(`${p.guide}@${p.version}`);
    } else {
      stillPending.push(p);
    }
  }
  return { files, applied, skipped, pinnedVersions, pending: stillPending, kept: plan.kept };
}
