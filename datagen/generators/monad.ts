/**
 * Générateur — MONAD GATE (`monad/theme.json` + `monad/routes.json`, routes
 * indexées par groupId dans UN fichier).
 *
 * Porté de l'extracteur admin V2 (`api/admin/extractor-v3/monad-gate/route.ts`),
 * en ne gardant QUE la logique pure (graphe + solveur) et en la branchant sur
 * la lib datagen (`loadTable`/`indexBy`/`groupBy`/`resolveText`…) au lieu des
 * loaders ad-hoc de la V2.
 *
 * RESHAPE V3 : la V2 résolvait les libellés au BUILD dans `extractGroup`, puis
 * les JETAIT au profit de clés (`typeNameKey`, `eventEndId`, registres
 * `labels`/`events`/`stageLabels`) re-résolues au RUNTIME (`loadRoute.ts`). Ici
 * on GARDE les chaînes résolues sur les nœuds/arêtes → le JSON de route est
 * prêt à rendre, `loadRoute` et les registres n'existent plus. Seul le registre
 * de RÉCOMPENSES reste partagé dans le thème (l'en-tête récompense agrège le
 * pool par id ; les items y sont résolus par le catalogue côté site).
 *
 * Le jeu : une route = une grille (Column × Row) de nœuds ; les arêtes suivent
 * `NextNodeIndex` ; les événements (`MGET_*`) portent choix, items-clés et
 * contraintes de jauge. Le solveur BFS marque les nœuds/arêtes sur au moins un
 * chemin valide vers une True Ending (`truePath`), et les détours qui y
 * reconnectent (`altPath`). Cf. les commentaires de section pour le détail.
 */
import type { GameLang, LangDict } from '../lib/lang';
import { GAME_LANGS } from '../lib/lang';
import { groupBy, idSpan, indexBy, loadTable, num, splitCsv, type Row } from '../lib/tables';
import { hasText, loadTextIndex, resolveText } from '../lib/text';

// ─────────────────────────────────────────────────────────────────────────────
// Types de sortie (contrat V3)
// ─────────────────────────────────────────────────────────────────────────────

/** Type de nœud du site, dérivé du `NodeType` du jeu + icône/nom (cf. `mapNodeType`). */
export type MonadNodeType =
  | 'start'
  | 'saga'
  | 'relic'
  | 'cube'
  | 'tending'
  | 'bending'
  | 'nending'
  | 'moment'
  | 'eldritch'
  | 'path'
  | 'combat'
  | 'elite'
  | 'pinnacle'
  | 'final'
  | 'unknown';

/** Un nœud de la carte, prêt à rendre (libellés déjà localisés). */
export interface MonadNode {
  id: string;
  /** Colonne (1-based) et rangée (1-based) dans la grille du jeu. */
  col: number;
  row: number;
  type: MonadNodeType;
  /** Libellé spécifique au stage (sous-type de relique, saveur de fin) — seulement
   *  quand il ajoute de l'info au type générique. */
  label?: LangDict;
  /** Items-clés que VISITER ce nœud peut octroyer (auto ∪ union des choix), noms résolus. */
  givesItem?: LangDict;
  /** Récompense du nœud (→ `MonadThemeFile.rewards`). */
  rewardId?: string;
  /** Récompense de premier clear (→ `MonadThemeFile.rewards`). */
  firstClearRewardId?: string;
  /** Sur le chemin canonique vers une True Ending. */
  truePath?: boolean;
  /** Sur un détour valide qui reconnecte à une True Ending. */
  altPath?: boolean;
}

/** Une arête (choix / transition), prête à rendre. */
export interface MonadEdge {
  from: string;
  to: string;
  /** Libellé du choix (localisé). */
  label?: LangDict;
  /** Condition inline extraite du libellé (« (Key Item: …) »). */
  need?: LangDict;
  /** Items-clés octroyés en empruntant l'arête (noms résolus). */
  gives?: LangDict;
  /** Événement mécanique récurrent (join/levelup/jauge) — hors résumé des choix. */
  service?: boolean;
  truePath?: boolean;
  altPath?: boolean;
}

/** Récompense résolue (référencée par id depuis les nœuds). */
export interface MonadReward {
  gold?: { min: number; max: number };
  crystal?: { min: number; max: number };
  items: Array<{ type: string; typeId: string; min: number; max: number }>;
}

/** Entrée d'index d'une route (pour la vue de catégorie / le mapping depth,route). */
export interface MonadRouteRef {
  groupId: string;
  depth: number;
  /**
   * Slot ORDINAL de la route dans sa profondeur (1-based) — pas le `StageRouteID`
   * du jeu : la depth 4 a DEUX routes de même `StageRouteID` (les 2 parts), que le
   * slot désambiguïse. C'est ce que porte `meta.route` d'un guide.
   */
  route: number;
  /** Index du layout de map dans la route (0-based ; depth 10 en a 2). */
  variant: number;
  /** Nombre de layouts de map de la route (→ `meta.variants`). */
  variantCount: number;
  /** Art de map de la route (`T_DungeonArea_XX`, namespace guides). */
  routeImage: string;
  name: LangDict | null;
}

/** `monad/theme-{id}.json` — registres partagés du thème. */
export interface MonadThemeFile {
  themeId: string;
  name: LangDict | null;
  gauge: { perMove: number; cap: number };
  rewards: Record<string, MonadReward>;
  routes: MonadRouteRef[];
}

/** `monad/routes/{groupId}.json` — une route prête à rendre. */
export interface MonadRouteFile {
  groupId: string;
  depth: number;
  /** Slot ordinal dans la profondeur (cf. `MonadRouteRef.route`). */
  route: number;
  variant: number;
  variantCount: number;
  routeImage: string;
  name: LangDict | null;
  nodes: MonadNode[];
  edges: MonadEdge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de résolution
// ─────────────────────────────────────────────────────────────────────────────

/** Résout une clé de texte ; `null` si absente/vide (≠ dict vide de la lib). */
function resolveOrNull(index: Map<string, LangDict>, key: string | undefined): LangDict | null {
  if (!key) return null;
  const d = resolveText(index, key);
  return hasText(d) ? d : null;
}

// Sépare un libellé résolu en {label, need} en pelant le dernier groupe entre
// parenthèses de chaque langue. Le jeu inline les conditions (« Advance there.
// (Key Item: Fake ID) ») — on les détache pour l'UI.
export function splitLabelAndNeed(full: LangDict): { label: LangDict; need: LangDict } {
  const labelOut = {} as LangDict;
  const needOut = {} as LangDict;
  for (const lang of GAME_LANGS) {
    const text = full[lang] ?? '';
    const m = text.match(/^([\s\S]*?)\s*[(（]([^()（）]+)[)）]\s*$/);
    if (m) {
      labelOut[lang] = m[1].trim();
      needOut[lang] = m[2].trim();
    } else {
      labelOut[lang] = text;
      needOut[lang] = '';
    }
  }
  return { label: labelOut, need: needOut };
}

// Type de nœud du jeu (NodeType + icône/nom) → type du site. `MGNT_EVENT` est
// désambiguïsé via `NodeName` d'abord car l'icône est ambiguë : la depth 4
// réutilise CM_Monad_Node_Icon_08 pour EVENT_01 (Path of Fate) et EVENT_03
// (Eldritch Realm).
export function mapNodeType(stage: Row): MonadNodeType {
  const nodeType = stage.NodeType;
  const icon = stage.GateNodeImage;
  const ending = stage.EndingImage;
  const name = stage.NodeName ?? '';
  switch (nodeType) {
    case 'MGNT_START':
      return 'start';
    case 'MGNT_SCENARIO':
      return 'saga';
    case 'MGNT_ARTIFACT':
      return 'relic';
    case 'MGNT_CUBE':
      return 'cube';
    case 'MGNT_ENDING':
      if (ending?.includes('True')) return 'tending';
      if (ending?.includes('Bad')) return 'bending';
      if (ending?.includes('Normal')) return 'nending';
      return 'tending';
    case 'MGNT_EVENT':
      if (name.endsWith('_EVENT_02')) return 'moment';
      if (name.endsWith('_EVENT_03')) return 'eldritch';
      if (name.endsWith('_EVENT_01')) return 'path';
      if (icon === 'CM_Monad_Node_Icon_03') return 'moment';
      if (icon === 'CM_Monad_Node_Icon_09') return 'eldritch';
      return 'path';
    case 'MGNT_BATTLE':
      if (icon === 'CM_Monad_Node_Icon_02') return 'combat';
      if (icon === 'CM_Monad_Node_Icon_04') return 'elite';
      if (icon === 'CM_Monad_Node_Icon_06') return 'pinnacle';
      if (icon === 'CM_Monad_Node_Icon_07') return 'final';
      return 'unknown';
    default:
      return 'unknown';
  }
}

// Parse `NextNodeIndex` « -1,0,1 » → [-1, 0, 1].
export function parseIndex(raw: string | undefined): number[] {
  if (!raw) return [0];
  return raw
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

/** Types dont le libellé de stage ajoute de l'info au type générique (sous-type / saveur). */
const TYPES_WITH_SPECIFIC_LABEL = new Set<MonadNodeType>([
  'relic',
  'tending',
  'bending',
  'nending',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Extraction d'un groupe (une route)
// ─────────────────────────────────────────────────────────────────────────────

/** Nœud interne (porte des champs solveur, retirés à la sérialisation). */
interface WorkNode extends MonadNode {
  stageGroupId: string;
  column: number;
  rowNum: number;
  eventGroupId?: string;
  /** Clé de libellé de stage (avant filtre `TYPES_WITH_SPECIFIC_LABEL`). */
  stageNameKey?: string;
  /** Items octroyés juste en visitant le nœud (événement sans vrai choix). */
  autoGivesItemIds?: string[];
}

/** Arête interne (contraintes solveur, retirées à la sérialisation). */
interface WorkEdge extends MonadEdge {
  requireItemId?: string;
  requireGauge?: number;
  givesItemIds?: string[];
  gaugeDelta?: number;
}

function extractGroup(
  groupId: string,
  nodeRows: Row[],
  stageIndex: Map<string, Row>,
  eventByGroup: Map<string, Row[]>,
  textIndex: Map<string, LangDict>,
  itemIndex: Map<string, Row>,
  textItemIndex: Map<string, LangDict>,
): { nodes: WorkNode[]; edges: WorkEdge[] } {
  const entries = nodeRows.filter((r) => r.NodeGroupID === groupId);

  // Grille : clé `${col}:${row}` → nœud.
  const grid = new Map<string, WorkNode>();
  let nodeCounter = 1;

  for (const entry of entries) {
    const col = num(entry.Column);
    for (let r = 1; r <= 10; r++) {
      const stageGroupId = entry[`Row${r}`];
      if (!stageGroupId) continue;
      const stage = stageIndex.get(stageGroupId);
      if (!stage) continue;
      const id = `N${nodeCounter++}`;
      grid.set(`${col}:${r}`, {
        id,
        col,
        row: r,
        type: mapNodeType(stage),
        stageGroupId,
        column: col,
        rowNum: r,
        eventGroupId: stage.EventGroupID || undefined,
        stageNameKey: stage.NodeName || undefined,
      });
    }
  }

  // Arêtes : on marche `NextNodeIndex` par entrée.
  const edges: WorkEdge[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const col = num(entry.Column);
    const offsets = parseIndex(entry.NextNodeIndex);
    for (let r = 1; r <= 10; r++) {
      if (!entry[`Row${r}`]) continue;
      const fromNode = grid.get(`${col}:${r}`);
      if (!fromNode) continue;
      for (const off of offsets) {
        const toNode = grid.get(`${col + 1}:${r + off}`);
        if (!toNode) continue;
        const pair = `${fromNode.id}:${toNode.id}`;
        if (seen.has(pair)) continue;
        seen.add(pair);
        edges.push({ from: fromNode.id, to: toNode.id });
      }
    }
  }

  // Libellés d'événements + items-clés par arête.
  //
  // Chaque groupe d'événements est un petit graphe enraciné en MGET_START. Les
  // événements intermédiaires (MGET_NONE / MGET_BATTLE) enchaînent via
  // MoveEventID ; les terminaux (MGET_END) portent NextNodeRow → rangée
  // destination dans la grille. On fait un DFS avant depuis MGET_START pour
  // accumuler GetKeyItemID le long de chaque branche, puis on applique la liste
  // d'items accumulée à l'arête atteignant ce terminal.
  for (const node of grid.values()) {
    if (!node.eventGroupId) continue;
    const events = eventByGroup.get(node.eventGroupId);
    if (!events) continue;
    const eventById = new Map(events.map((e) => [e.ID, e]));
    const starts = events.filter((e) => e.EventType === 'MGET_START');

    const endItemIds = new Map<string, string[]>();
    const visit = (evId: string, acquired: string[], visited: Set<string>) => {
      if (visited.has(evId)) return;
      const ev = eventById.get(evId);
      if (!ev) return;
      const nextAcquired = ev.GetKeyItemID ? [...acquired, ev.GetKeyItemID] : acquired;
      if (ev.EventType === 'MGET_END') {
        const existing = endItemIds.get(evId);
        if (!existing || existing.length < nextAcquired.length) endItemIds.set(evId, nextAcquired);
        return;
      }
      const nextVisited = new Set(visited).add(evId);
      for (const nid of splitCsv(ev.MoveEventID)) visit(nid, nextAcquired, nextVisited);
    };
    for (const s of starts) {
      for (const nid of splitCsv(s.MoveEventID)) visit(nid, [], new Set([s.ID]));
    }

    // Items auto-octroyés : un MGET_END sans NextNodeRow représente un événement
    // sans vrai choix — l'item est donné juste en visitant le nœud.
    const autoIds: string[] = [];
    for (const ev of events) {
      if (ev.EventType !== 'MGET_END') continue;
      if (ev.NextNodeRow) continue;
      for (const id of endItemIds.get(ev.ID) ?? []) if (!autoIds.includes(id)) autoIds.push(id);
    }
    if (autoIds.length > 0) node.autoGivesItemIds = autoIds;

    // Libellé + need + gives sur chaque arête correspondant à un MGET_END.
    for (const ev of events) {
      if (ev.EventType !== 'MGET_END') continue;
      if (!ev.NextNodeRow) continue;
      const nextRow = num(ev.NextNodeRow);
      const target = grid.get(`${node.column + 1}:${nextRow}`);
      if (!target) continue;
      const edge = edges.find((e) => e.from === node.id && e.to === target.id);
      if (!edge || edge.label) continue;

      const rawLabel = resolveOrNull(textIndex, ev.NameID);
      if (rawLabel) {
        const hasRequirement = !!(ev.RequireItemID || ev.RequireThemeRuleGauge);
        if (hasRequirement) {
          const { label, need } = splitLabelAndNeed(rawLabel);
          edge.label = label;
          if (Object.values(need).some((v) => v)) edge.need = need;
        } else {
          edge.label = rawLabel;
        }
      }

      if (ev.RequireItemID) edge.requireItemId = ev.RequireItemID;
      if (ev.RequireThemeRuleGauge) edge.requireGauge = num(ev.RequireThemeRuleGauge);
      if (ev.ThemeRuleGaugeValue) edge.gaugeDelta = num(ev.ThemeRuleGaugeValue);

      const acquiredIds = endItemIds.get(ev.ID) ?? [];
      if (acquiredIds.length > 0) edge.givesItemIds = acquiredIds;

      if (acquiredIds.length === 0) continue;
      const names: LangDict[] = [];
      for (const itemId of acquiredIds) {
        const item = itemIndex.get(itemId);
        if (!item) continue;
        const name = resolveOrNull(textItemIndex, item.NameID);
        if (name) names.push(name);
      }
      if (names.length === 0) continue;
      const merged = {} as LangDict;
      for (const lang of GAME_LANGS) {
        merged[lang] = names
          .map((n) => n[lang] ?? '')
          .filter(Boolean)
          .join(' / ');
      }
      edge.gives = merged;
    }

    // Événements auto passifs : MGET_END sans NextNodeRow = événement sans vrai
    // choix (le joueur lit juste une ligne). L'arête sortante existe quand même
    // via NextNodeIndex → on propage le libellé de l'événement à toute arête
    // sortante non encore libellée.
    //
    // Les groupes « service » (join/levelup de perso, ops de jauge) sont exclus :
    // leur MGET_END décrit quel CHOIX a été pris (offense/défense/soin), pas
    // quelle arête de carte — propager le 1er END stamperait les 3 sorties du
    // même texte (ex. « A hero specialized in offense » ×3 sur D4R1).
    const hasServiceEvent = events.some(
      (e) =>
        e.EventType === 'MGET_CHARACTER_JOIN' ||
        e.EventType === 'MGET_CHARACTER_LEVELUP' ||
        e.EventType === 'MGET_THEMERULE_GAUGE',
    );
    if (!hasServiceEvent) {
      const autoEnd = events.find(
        (ev) => ev.EventType === 'MGET_END' && !ev.NextNodeRow && ev.NameID,
      );
      if (autoEnd) {
        const rawLabel = resolveOrNull(textIndex, autoEnd.NameID);
        if (rawLabel) {
          for (const edge of edges) {
            if (edge.from !== node.id || edge.label) continue;
            edge.label = rawLabel;
          }
        }
      }
    }

    // Marque les arêtes issues d'un groupe « service » (hors résumé des choix).
    if (hasServiceEvent) {
      for (const edge of edges) if (edge.from === node.id) edge.service = true;
    }
  }

  // Agrège les items atteignables par nœud (union des `gives` des arêtes
  // sortantes + items auto du nœud) → flag « peut octroyer un item-clé ».
  for (const node of grid.values()) {
    const merged: Record<GameLang, Set<string>> = {
      en: new Set(),
      jp: new Set(),
      kr: new Set(),
      zh: new Set(),
    };
    for (const e of edges) {
      if (e.from !== node.id || !e.gives) continue;
      for (const lang of GAME_LANGS) {
        const v = e.gives[lang];
        if (v) merged[lang].add(v);
      }
    }
    for (const itemId of node.autoGivesItemIds ?? []) {
      const item = itemIndex.get(itemId);
      if (!item) continue;
      const name = resolveOrNull(textItemIndex, item.NameID);
      if (!name) continue;
      for (const lang of GAME_LANGS) if (name[lang]) merged[lang].add(name[lang]);
    }
    if (Object.values(merged).every((s) => s.size === 0)) continue;
    const out = {} as LangDict;
    for (const lang of GAME_LANGS) out[lang] = Array.from(merged[lang]).join(' / ');
    node.givesItem = out;
  }

  const nodesOut = Array.from(grid.values()).sort(
    (a, b) => parseInt(a.id.slice(1), 10) - parseInt(b.id.slice(1), 10),
  );
  return { nodes: nodesOut, edges };
}

// ─────────────────────────────────────────────────────────────────────────────
// Solveur : marquage des chemins True Ending
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BFS avant avec état = (nodeId, itemSet, gauge) pour trouver tout nœud/arête sur
 * au moins un chemin valide du start vers une True Ending (`tending`), puis les
 * détours qui y reconnectent (`altPath`). Contraintes honorées : requireItemId,
 * requireGauge, gaugeDelta (modif d'arête), givesItemIds. La jauge est
 * discrétisée en paquets de 50 pour borner la combinatoire.
 */
export function markTruePaths(
  nodes: WorkNode[],
  edges: WorkEdge[],
  gaugePerMove: number,
  gaugeCap: number,
): void {
  const start = nodes.find((n) => n.type === 'start');
  const tendings = new Set(nodes.filter((n) => n.type === 'tending').map((n) => n.id));
  if (!start || tendings.size === 0) return;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, WorkEdge[]>();
  for (const e of edges) {
    if (!outgoing.has(e.from)) outgoing.set(e.from, []);
    outgoing.get(e.from)!.push(e);
  }

  const truePathNodes = new Set<string>();
  const truePathEdges = new Set<string>();
  const edgeKey = (e: WorkEdge) => `${e.from}:${e.to}`;

  const mergeAuto = (nodeId: string, items: string[]): string[] => {
    const auto = nodeById.get(nodeId)?.autoGivesItemIds;
    if (!auto || auto.length === 0) return items;
    return Array.from(new Set([...items, ...auto])).sort();
  };

  interface State {
    nodeId: string;
    items: string[];
    gauge: number;
    path: string[];
    edgePath: string[];
  }
  const initial: State = {
    nodeId: start.id,
    items: mergeAuto(start.id, []),
    gauge: 0,
    path: [start.id],
    edgePath: [],
  };

  const visited = new Set<string>();
  const stateKey = (s: { nodeId: string; items: string[]; gauge: number }) =>
    `${s.nodeId}|${s.items.join(',')}|${Math.floor(s.gauge / 50)}`;

  const edgePreference = (e: WorkEdge): number => {
    let score = 0;
    if (e.givesItemIds?.length) score -= 10;
    if (e.requireItemId) score += 5;
    if (e.requireGauge) score += 3;
    return score;
  };

  // ─── Passe 1 : BFS pour le chemin canonique (le plus court) ───
  const queue: State[] = [initial];
  visited.add(stateKey(initial));
  const MAX_ITER = 200_000;
  let iter = 0;
  let canonical: State | null = null;

  while (queue.length > 0 && iter++ < MAX_ITER) {
    const cur = queue.shift()!;
    if (tendings.has(cur.nodeId)) {
      canonical = cur;
      break;
    }
    const outs = outgoing.get(cur.nodeId) ?? [];
    const sortedOuts = [...outs].sort((a, b) => edgePreference(a) - edgePreference(b));
    for (const edge of sortedOuts) {
      if (edge.requireItemId && !cur.items.includes(edge.requireItemId)) continue;
      if (edge.requireGauge && cur.gauge < edge.requireGauge) continue;
      const viaEdge = edge.givesItemIds
        ? Array.from(new Set([...cur.items, ...edge.givesItemIds])).sort()
        : cur.items;
      const nextItems = mergeAuto(edge.to, viaEdge);
      const nextGauge = Math.max(
        0,
        Math.min(gaugeCap, cur.gauge + gaugePerMove + (edge.gaugeDelta ?? 0)),
      );
      const nextState: State = {
        nodeId: edge.to,
        items: nextItems,
        gauge: nextGauge,
        path: [...cur.path, edge.to],
        edgePath: [...cur.edgePath, edgeKey(edge)],
      };
      const key = stateKey(nextState);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push(nextState);
    }
  }

  if (!canonical) return;

  for (const n of canonical.path) truePathNodes.add(n);
  for (const e of canonical.edgePath) truePathEdges.add(e);

  // ─── Passe 2 : détours valides depuis chaque nœud du chemin canonique ───
  const findPathToTending = (
    startId: string,
    startItems: string[],
    startGauge: number,
  ): string[] | null => {
    const localSeen = new Set<string>();
    interface LocalState {
      id: string;
      items: string[];
      gauge: number;
      edgePath: string[];
    }
    const localQueue: LocalState[] = [
      { id: startId, items: startItems, gauge: startGauge, edgePath: [] },
    ];
    localSeen.add(`${startId}|${startItems.join(',')}|${Math.floor(startGauge / 50)}`);
    const LOCAL_MAX = 20_000;
    let li = 0;
    while (localQueue.length && li++ < LOCAL_MAX) {
      const cur = localQueue.shift()!;
      if (tendings.has(cur.id)) return cur.edgePath;
      for (const edge of outgoing.get(cur.id) ?? []) {
        if (edge.requireItemId && !cur.items.includes(edge.requireItemId)) continue;
        if (edge.requireGauge && cur.gauge < edge.requireGauge) continue;
        const viaEdge = edge.givesItemIds
          ? Array.from(new Set([...cur.items, ...edge.givesItemIds])).sort()
          : cur.items;
        const nextItems = mergeAuto(edge.to, viaEdge);
        const nextGauge = Math.max(
          0,
          Math.min(gaugeCap, cur.gauge + gaugePerMove + (edge.gaugeDelta ?? 0)),
        );
        const k = `${edge.to}|${nextItems.join(',')}|${Math.floor(nextGauge / 50)}`;
        if (localSeen.has(k)) continue;
        localSeen.add(k);
        localQueue.push({
          id: edge.to,
          items: nextItems,
          gauge: nextGauge,
          edgePath: [...cur.edgePath, edgeKey(edge)],
        });
      }
    }
    return null;
  };

  // Rejoue le chemin canonique pour connaître l'état porté à chaque étape.
  const stateAt: State[] = [initial];
  for (let i = 0; i < canonical.edgePath.length; i++) {
    const prev = stateAt[i];
    const [fromId, toId] = canonical.edgePath[i].split(':');
    const edge = (outgoing.get(fromId) ?? []).find((e) => e.to === toId);
    if (!edge) break;
    const viaEdge = edge.givesItemIds
      ? Array.from(new Set([...prev.items, ...edge.givesItemIds])).sort()
      : prev.items;
    const nextItems = mergeAuto(edge.to, viaEdge);
    const nextGauge = Math.max(
      0,
      Math.min(gaugeCap, prev.gauge + gaugePerMove + (edge.gaugeDelta ?? 0)),
    );
    stateAt.push({
      nodeId: edge.to,
      items: nextItems,
      gauge: nextGauge,
      path: [...prev.path, edge.to],
      edgePath: [...prev.edgePath, canonical.edgePath[i]],
    });
  }

  const altPathEdges = new Set<string>();
  for (let i = 0; i < canonical.path.length - 1; i++) {
    const state = stateAt[i];
    const canonicalEdgeK = canonical.edgePath[i];
    for (const edge of outgoing.get(canonical.path[i]) ?? []) {
      const k = edgeKey(edge);
      if (k === canonicalEdgeK) continue;
      if (edge.requireItemId && !state.items.includes(edge.requireItemId)) continue;
      if (edge.requireGauge && state.gauge < edge.requireGauge) continue;
      const viaEdge = edge.givesItemIds
        ? Array.from(new Set([...state.items, ...edge.givesItemIds])).sort()
        : state.items;
      const nextItems = mergeAuto(edge.to, viaEdge);
      const nextGauge = Math.max(
        0,
        Math.min(gaugeCap, state.gauge + gaugePerMove + (edge.gaugeDelta ?? 0)),
      );
      const recovery = findPathToTending(edge.to, nextItems, nextGauge);
      if (recovery !== null) {
        altPathEdges.add(k);
        for (const ek of recovery) altPathEdges.add(ek);
      }
    }
  }

  for (const e of truePathEdges) altPathEdges.delete(e);

  const altPathNodes = new Set<string>();
  for (const ek of altPathEdges) {
    const [fromId, toId] = ek.split(':');
    if (!truePathNodes.has(fromId)) altPathNodes.add(fromId);
    if (!truePathNodes.has(toId)) altPathNodes.add(toId);
  }

  for (const n of nodes) {
    if (truePathNodes.has(n.id)) n.truePath = true;
    else if (altPathNodes.has(n.id)) n.altPath = true;
  }
  for (const e of edges) {
    if (truePathEdges.has(edgeKey(e))) e.truePath = true;
    else if (altPathEdges.has(edgeKey(e))) e.altPath = true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Récompenses
// ─────────────────────────────────────────────────────────────────────────────

/** Lacunes de butin rencontrées pendant un build — signalées en UNE ligne
 * agrégée à la fin (même régime qu'encounters) ; jamais de throw : la donnée
 * réelle peut être lacunaire sans invalider le reste du build.
 *
 * La RÉSOLUTION elle-même reste volontairement séparée de celle d'encounters :
 * les deux lisent RewardTemplet/RewardGroupTemplet mais produisent des CONTRATS
 * différents (`MonadReward` : gold/crystal en min-max, items plats, type brut ;
 * `RewardTable` : crystal scalaire, exp, `kind` slugifié, flag `random`).
 * Mutualiser imposerait de changer l'un des deux JSON committés. */
interface RewardGaps {
  rewards: Set<string>;
  groups: Set<string>;
}

function resolveReward(
  rewardId: string,
  rewardIndex: Map<string, Row>,
  groupByGroupId: Map<string, Row[]>,
  gaps: RewardGaps,
): MonadReward | null {
  const reward = rewardIndex.get(rewardId);
  if (!reward) {
    gaps.rewards.add(rewardId);
    return null;
  }
  const out: MonadReward = { items: [] };
  if (reward.CreditMin) {
    out.gold = { min: num(reward.CreditMin), max: num(reward.CreditMax || reward.CreditMin) };
  }
  if (reward.Crystal) {
    const n = num(reward.Crystal);
    out.crystal = { min: n, max: n };
  }
  const addGroup = (raw: string | undefined) => {
    for (const gid of splitCsv(raw)) {
      const rows = groupByGroupId.get(gid) ?? [];
      if (!rows.length) gaps.groups.add(gid);
      for (const r of rows) {
        // Ligne sans TypeID = inexploitable (icône/lien impossibles) : écartée
        // et signalée, comme dans encounters.
        if (!r.TypeID) {
          gaps.groups.add(gid);
          continue;
        }
        out.items.push({
          type: r.Type ?? '',
          typeId: r.TypeID,
          min: num(r.MinCount),
          max: num(r.MaxCount),
        });
      }
    }
  };
  addGroup(reward.StaticGroupID);
  addGroup(reward.RandomGroupID);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sérialisation
// ─────────────────────────────────────────────────────────────────────────────

/** Sérialise un nœud de travail vers le contrat public (retire les champs solveur). */
function toNode(
  n: WorkNode,
  stage: Row | undefined,
  stageLabels: Map<string, LangDict>,
): MonadNode {
  const out: MonadNode = { id: n.id, col: n.col, row: n.row, type: n.type };
  // Libellé spécifique au stage, seulement quand il ajoute de l'info au type.
  // `resolveOrNull` (pas un .get brut) : un dict aux langues toutes vides ne
  // doit pas produire de label — même filtre que le reste du fichier.
  if (n.stageNameKey && TYPES_WITH_SPECIFIC_LABEL.has(n.type)) {
    const label = resolveOrNull(stageLabels, n.stageNameKey);
    if (label) out.label = label;
  }
  if (n.givesItem) out.givesItem = n.givesItem;
  if (stage?.RewardID) out.rewardId = stage.RewardID;
  if (stage?.FirstClearRewardID) out.firstClearRewardId = stage.FirstClearRewardID;
  if (n.truePath) out.truePath = true;
  if (n.altPath) out.altPath = true;
  return out;
}

/** Sérialise une arête de travail vers le contrat public (retire les contraintes solveur). */
function toEdge(e: WorkEdge): MonadEdge {
  const out: MonadEdge = { from: e.from, to: e.to };
  if (e.label) out.label = e.label;
  if (e.need) out.need = e.need;
  if (e.gives) out.gives = e.gives;
  if (e.service) out.service = true;
  if (e.truePath) out.truePath = true;
  if (e.altPath) out.altPath = true;
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée
// ─────────────────────────────────────────────────────────────────────────────

/** Construit le thème + toutes les routes Monad Gate depuis `.gamedata/parsed`. */
export function buildMonad(): { theme: MonadThemeFile; routes: MonadRouteFile[] } {
  const routeRows = loadTable('MonadGateRouteTemplet');
  const nodeRows = loadTable('MonadGateNodeTemplet');
  const stageRows = loadTable('MonadGateNodeStageTemplet');
  const eventRows = loadTable('MonadGateEventTemplet');
  const itemRows = loadTable('ItemTemplet');
  const themeRuleRows = loadTable('MonadGateThemeRuleTemplet');
  const themeRows = loadTable('MonadGateThemeTemplet');
  const rewardRows = loadTable('RewardTemplet');
  const rewardGroupRows = loadTable('RewardGroupTemplet');

  const textIndex = loadTextIndex('TextSystem');
  const textItemIndex = loadTextIndex('TextItem');
  const stageIndex = indexBy(stageRows, 'GroupID');
  const eventByGroup = groupBy(eventRows, 'EventGroupID');
  const itemIndex = indexBy(itemRows, 'ID');
  const rewardIndex = indexBy(rewardRows, 'ID');
  const rewardGroupByGroupId = groupBy(rewardGroupRows, 'GroupID');

  const themeRule = themeRuleRows[0] ?? {};
  const gaugePerMove = num(themeRule.NodeMoveGaugeIncrease) || 20;
  const gaugeCap = num(themeRule.MonadGateThemeRuleGauge) || 1000;
  const theme = themeRows[0] ?? {};
  const themeId = theme.ID ?? '1';
  const themeName = resolveOrNull(textIndex, theme.MonadGateThemeName);

  const referencedRewardIds = new Set<string>();
  const routeRefs: MonadRouteRef[] = [];
  const routes: MonadRouteFile[] = [];

  // Slot ordinal par profondeur : `StageRouteID` ne désambiguïse pas les 2 parts
  // de la depth 4 (même id). Le slot (1-based, ordre du templet) fait foi et
  // devient le `route` de `meta.json`.
  const slotByDepth = new Map<number, number>();

  for (const routeRow of routeRows) {
    const depth = num(routeRow.DepthID);
    const route = (slotByDepth.get(depth) ?? 0) + 1;
    slotByDepth.set(depth, route);
    const routeImage = routeRow.RouteImage ?? '';
    const groupIds = splitCsv(routeRow.NodeGroupID);
    const variantCount = groupIds.length;
    const name = resolveOrNull(textIndex, routeRow.RouteName);

    groupIds.forEach((groupId, variant) => {
      const { nodes, edges } = extractGroup(
        groupId,
        nodeRows,
        stageIndex,
        eventByGroup,
        textIndex,
        itemIndex,
        textItemIndex,
      );
      markTruePaths(nodes, edges, gaugePerMove, gaugeCap);

      for (const n of nodes) {
        const stage = stageIndex.get(n.stageGroupId);
        if (stage?.RewardID) referencedRewardIds.add(stage.RewardID);
        if (stage?.FirstClearRewardID) referencedRewardIds.add(stage.FirstClearRewardID);
      }

      routes.push({
        groupId,
        depth,
        route,
        variant,
        variantCount,
        routeImage,
        name,
        nodes: nodes.map((n) => toNode(n, stageIndex.get(n.stageGroupId), textIndex)),
        edges: edges.map(toEdge),
      });
      routeRefs.push({ groupId, depth, route, variant, variantCount, routeImage, name });
    });
  }

  const rewards: Record<string, MonadReward> = {};
  const gaps: RewardGaps = { rewards: new Set(), groups: new Set() };
  for (const id of referencedRewardIds) {
    const r = resolveReward(id, rewardIndex, rewardGroupByGroupId, gaps);
    if (r) rewards[id] = r;
  }
  // Lacunes de butin : UNE ligne agrégée par build (cf. RewardGaps).
  if (gaps.rewards.size || gaps.groups.size) {
    const parts: string[] = [];
    if (gaps.rewards.size)
      parts.push(
        `${gaps.rewards.size} RewardID absent(s) de RewardTemplet (${idSpan(gaps.rewards)})`,
      );
    if (gaps.groups.size)
      parts.push(
        `${gaps.groups.size} groupe(s) de RewardGroup vide(s) ou sans TypeID (${idSpan(gaps.groups)})`,
      );
    console.warn(`⚠ monad : butin partiellement ignoré — ${parts.join(' ; ')}.`);
  }

  const themeFile: MonadThemeFile = {
    themeId,
    name: themeName,
    gauge: { perMove: gaugePerMove, cap: gaugeCap },
    rewards,
    routes: routeRefs,
  };

  return { theme: themeFile, routes };
}
