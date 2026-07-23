/**
 * Tests du générateur monad (Monad Gate) — les DEUX registres actés (TODO 17/07) :
 *
 *   1. CŒURS PURS en synthétique : `mapNodeType` (désambiguïsation NodeType +
 *      icône/nom/ending), `splitLabelAndNeed` (détache la condition inline entre
 *      parenthèses, parenthèses pleine largeur incluses), `parseIndex`, et
 *      surtout `markTruePaths` — le SOLVEUR BFS (items-clés, jauge, chemins True
 *      Ending / détours). Toute la logique « portée pure de la V2 », testée sur
 *      des graphes minuscules construits à la main. Aucune table requise.
 *
 *   2. INVARIANTS RÉFÉRENTIELS sur `data/generated/monad/` committé : bijection
 *      index de routes ↔ routes, arêtes qui pointent des nœuds réels du même
 *      graphe, récompenses de nœud résolues dans le thème. Une dérive rendrait
 *      une carte cassée sans aucun symptôme.
 *
 * La suite tourne SANS `.gamedata` (contrainte CI) : rien ici n'appelle
 * `buildMonad()` ni `loadTable`.
 */
import { describe, expect, it } from 'vitest';
import themeData from '../../data/generated/monad/theme.json';
import routesData from '../../data/generated/monad/routes.json';
import type { Row } from '../lib/tables';
import type { LangDict } from '../lib/lang';
import {
  mapNodeType,
  markTruePaths,
  parseIndex,
  splitLabelAndNeed,
  type MonadNodeType,
  type MonadRouteFile,
  type MonadThemeFile,
} from './monad';

// ─── 1. Cœurs purs (synthétique) ─────────────────────────────────────────────

describe('mapNodeType — NodeType du jeu → type du site', () => {
  const t = (r: Record<string, string>) => mapNodeType(r as Row);

  it('types directs', () => {
    expect(t({ NodeType: 'MGNT_START' })).toBe('start');
    expect(t({ NodeType: 'MGNT_SCENARIO' })).toBe('saga');
    expect(t({ NodeType: 'MGNT_ARTIFACT' })).toBe('relic');
    expect(t({ NodeType: 'MGNT_CUBE' })).toBe('cube');
  });

  it('ending désambiguïsé par EndingImage (défaut = tending)', () => {
    expect(t({ NodeType: 'MGNT_ENDING', EndingImage: 'X_True_Y' })).toBe('tending');
    expect(t({ NodeType: 'MGNT_ENDING', EndingImage: 'X_Bad' })).toBe('bending');
    expect(t({ NodeType: 'MGNT_ENDING', EndingImage: 'X_Normal' })).toBe('nending');
    expect(t({ NodeType: 'MGNT_ENDING' })).toBe('tending');
  });

  it('event désambiguïsé par NodeName d’abord, puis icône', () => {
    expect(t({ NodeType: 'MGNT_EVENT', NodeName: 'A_EVENT_02' })).toBe('moment');
    expect(t({ NodeType: 'MGNT_EVENT', NodeName: 'A_EVENT_03' })).toBe('eldritch');
    expect(t({ NodeType: 'MGNT_EVENT', NodeName: 'A_EVENT_01' })).toBe('path');
    expect(t({ NodeType: 'MGNT_EVENT', GateNodeImage: 'CM_Monad_Node_Icon_03' })).toBe('moment');
    expect(t({ NodeType: 'MGNT_EVENT' })).toBe('path'); // défaut
  });

  it('battle par icône, sinon unknown', () => {
    expect(t({ NodeType: 'MGNT_BATTLE', GateNodeImage: 'CM_Monad_Node_Icon_02' })).toBe('combat');
    expect(t({ NodeType: 'MGNT_BATTLE', GateNodeImage: 'CM_Monad_Node_Icon_04' })).toBe('elite');
    expect(t({ NodeType: 'MGNT_BATTLE', GateNodeImage: 'CM_Monad_Node_Icon_07' })).toBe('final');
    expect(t({ NodeType: 'MGNT_BATTLE' })).toBe('unknown');
    expect(t({ NodeType: 'INCONNU' })).toBe('unknown');
  });
});

describe('splitLabelAndNeed — détache la condition inline', () => {
  const dict = (o: Partial<LangDict>): LangDict => ({ en: '', jp: '', kr: '', zh: '', ...o });

  it('pèle le dernier groupe entre parenthèses', () => {
    const { label, need } = splitLabelAndNeed(dict({ en: 'Advance there. (Key Item: Fake ID)' }));
    expect(label.en).toBe('Advance there.');
    expect(need.en).toBe('Key Item: Fake ID');
  });

  it('sans parenthèse : need vide, label = texte', () => {
    const { label, need } = splitLabelAndNeed(dict({ en: 'Just go' }));
    expect(label.en).toBe('Just go');
    expect(need.en).toBe('');
  });

  it('parenthèses pleine largeur (jp/zh)', () => {
    const { label, need } = splitLabelAndNeed(dict({ jp: '進め（鍵アイテム）' }));
    expect(label.jp).toBe('進め');
    expect(need.jp).toBe('鍵アイテム');
  });
});

describe('parseIndex — offsets NextNodeIndex', () => {
  it('éclate le CSV, filtre les NaN, défaut [0]', () => {
    expect(parseIndex('-1,0,1')).toEqual([-1, 0, 1]);
    expect(parseIndex('2, 3')).toEqual([2, 3]);
    expect(parseIndex('x,1')).toEqual([1]);
    expect(parseIndex(undefined)).toEqual([0]);
    expect(parseIndex('')).toEqual([0]);
  });
});

describe('markTruePaths — solveur True Ending', () => {
  type WNode = Parameters<typeof markTruePaths>[0][number];
  type WEdge = Parameters<typeof markTruePaths>[1][number];
  const node = (id: string, type: MonadNodeType, extra: Partial<WNode> = {}): WNode =>
    ({ id, col: 0, row: 0, type, stageGroupId: '', column: 0, rowNum: 0, ...extra }) as WNode;
  const edge = (from: string, to: string, extra: Partial<WEdge> = {}): WEdge =>
    ({ from, to, ...extra }) as WEdge;
  const findEdge = (edges: WEdge[], f: string, t: string) =>
    edges.find((e) => e.from === f && e.to === t)!;

  it('marque le chemin canonique (truePath) et le détour qui reconnecte (altPath)', () => {
    const nodes = [
      node('N1', 'start'),
      node('N2', 'path'),
      node('N3', 'tending'),
      node('N4', 'path'),
    ];
    const edges = [edge('N1', 'N2'), edge('N2', 'N3'), edge('N1', 'N4'), edge('N4', 'N3')];
    markTruePaths(nodes, edges, 20, 1000);
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    expect(byId.N1.truePath).toBe(true);
    expect(byId.N2.truePath).toBe(true);
    expect(byId.N3.truePath).toBe(true);
    expect(byId.N4.truePath).toBeUndefined();
    expect(byId.N4.altPath).toBe(true); // N1→N4→N3 reconnecte à la True Ending
    expect(findEdge(edges, 'N1', 'N2').truePath).toBe(true);
    expect(findEdge(edges, 'N1', 'N4').altPath).toBe(true);
  });

  it('un item-clé requis mais JAMAIS obtenu bloque tout (aucun marquage)', () => {
    const nodes = [node('N1', 'start'), node('N2', 'path'), node('N3', 'tending')];
    const edges = [edge('N1', 'N2', { requireItemId: 'x' }), edge('N2', 'N3')];
    markTruePaths(nodes, edges, 20, 1000);
    expect(nodes.find((n) => n.id === 'N1')!.truePath).toBeUndefined();
    expect(nodes.find((n) => n.id === 'N3')!.truePath).toBeUndefined();
  });

  it('une arête qui OCTROIE l’item débloque la porte qui l’exige', () => {
    const nodes = [node('N1', 'start'), node('N2', 'path'), node('N3', 'tending')];
    const edges = [
      edge('N1', 'N2', { givesItemIds: ['x'] }),
      edge('N2', 'N3', { requireItemId: 'x' }),
    ];
    markTruePaths(nodes, edges, 20, 1000);
    expect(nodes.every((n) => n.truePath)).toBe(true);
  });
});

// ─── 2. Invariants sur la donnée committée ───────────────────────────────────

const theme = themeData as unknown as MonadThemeFile;
const routes = routesData as unknown as Record<string, MonadRouteFile>;
const NODE_TYPES = new Set<MonadNodeType>([
  'start',
  'saga',
  'relic',
  'cube',
  'tending',
  'bending',
  'nending',
  'moment',
  'eldritch',
  'path',
  'combat',
  'elite',
  'pinnacle',
  'final',
  'unknown',
]);
const rewardIds = new Set(Object.keys(theme.rewards));

describe('monad — thème', () => {
  it('jauge cohérente (perMove et cap > 0)', () => {
    expect(theme.gauge.perMove).toBeGreaterThan(0);
    expect(theme.gauge.cap).toBeGreaterThan(0);
  });

  it('index des routes ↔ routes.json : bijection par groupId', () => {
    const refIds = new Set(theme.routes.map((r) => r.groupId));
    const routeIds = new Set(Object.keys(routes));
    expect(refIds).toEqual(routeIds);
  });
});

describe('monad — routes', () => {
  it('nœuds non vides, types connus, arêtes internes, récompenses résolues', () => {
    const bad: string[] = [];
    for (const [gid, rt] of Object.entries(routes)) {
      if (!rt.nodes.length) bad.push(`${gid} : 0 nœud`);
      const ids = new Set(rt.nodes.map((n) => n.id));
      for (const n of rt.nodes) {
        if (!NODE_TYPES.has(n.type)) bad.push(`${gid}/${n.id} : type « ${n.type} »`);
        for (const rid of [n.rewardId, n.firstClearRewardId]) {
          if (rid && !rewardIds.has(rid)) bad.push(`${gid}/${n.id} : reward ${rid} absent`);
        }
      }
      for (const e of rt.edges) {
        if (!ids.has(e.from) || !ids.has(e.to))
          bad.push(`${gid} : arête ${e.from}→${e.to} orpheline`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('toute route avec un nœud truePath a un start ET un tending (précond. du solveur)', () => {
    const bad: string[] = [];
    for (const [gid, rt] of Object.entries(routes)) {
      if (!rt.nodes.some((n) => n.truePath)) continue;
      if (!rt.nodes.some((n) => n.type === 'start')) bad.push(`${gid} : truePath sans start`);
      if (!rt.nodes.some((n) => n.type === 'tending')) bad.push(`${gid} : truePath sans tending`);
    }
    expect(bad).toEqual([]);
  });
});
