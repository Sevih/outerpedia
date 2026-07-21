/**
 * Générateur — SOURCES D'OBTENTION des équipements, extraites du client.
 *
 * Passe 1 : `DungeonPVEGroupTemplet.ExpectReward` (la liste « récompenses
 * possibles » affichée en jeu) → items ; boss via `DungeonID` →
 * `DungeonTemplet` (SpawnID_Pos0..2, réf par GROUPE de spawn) →
 * `DungeonSpawnTemplet.ID0..ID3` (helpers partagés d'encounters) →
 * `MonsterTemplet`.
 *
 * Passe 2 — IRREGULAR CHASE : pas d'ExpectReward, mais chaque combat
 * (`IrregularChaseTemplet`) porte un `Reward_Win` par difficulté ; seule la
 * VERY HARD (difficulté 3) a un `RandomGroupID`, qui contient les équipements
 * droppés. Boss via le spawn du donjon (mêmes variantes nommées qu'en passe 1).
 *
 * Sortie : item id → ids de boss (dédup par NOM de monstre : chaque difficulté
 * spawne une variante du même boss, on garde l'id le plus élevé).
 *
 * Passe 3 — BOUTIQUES : `ProductTemplet` vend des équipements (`PGT_ITEM`) ;
 * la monnaie (`ProductBuyType`) identifie la boutique : Adventure License
 * (permanente) et pièces d'événement (`PBT_[ALWAYS_]EVENT_COIN_*`).
 *
 * LIMITE : les achats aux monnaies génériques (cristaux…) ne nomment pas une
 * « source » utile → non extraits, complétés par la couche curée.
 */
import { groupBy, loadTable, splitCsv } from '../lib/tables';
import { dungeonSpawnedMonsters, modeTitleKey } from './encounters';

export type ItemSources = Record<string, { bosses: string[]; shops?: string[] }>;

export interface ItemSourcesResult {
  items: ItemSources;
  /** Boss id → clé `TextSystem` du titre du contenu où il apparaît. */
  bossTitleKeys: Map<string, string>;
}

/**
 * Titre du contenu Irregular Chase (« Irregular Extermination Project »).
 *
 * EN DUR ET ASSUMÉ (décision Sevih 2026-07-21) : contrairement à la passe 1,
 * qui résout le titre par mode (`modeTitleKey`), la poursuite est nommée à DEUX
 * niveaux dans le jeu — le MODE s'appelle « Pursuit Operation » (ce que rendrait
 * le résolveur, cf. `glossaries.modes.irregular_chase`) mais le CONTENU qui
 * l'englobe, celui qu'on veut sous le portrait du boss sur `/equipment/<slug>`,
 * s'appelle « Irregular Extermination Project ». Les deux titres sont justes et
 * doivent RESTER distincts : curer celui-ci dans `mode-titles.json` renommerait
 * aussi le mode partout ailleurs (fiches de monstres). D'où la constante — pas
 * un oubli de curation.
 */
const CHASE_TITLE_KEY = 'SYS_IRREGULAR_EXTERMINATION';

/** ProductBuyType → slug de boutique (clé i18n `equip.source.<slug>`). */
function shopSlug(buyType: string | undefined): string | null {
  if (!buyType) return null;
  if (buyType === 'PBT_ADVENTURE_LICENSE') return 'adventure_license';
  if (/^PBT_(ALWAYS_)?EVENT_COIN/.test(buyType)) return 'event_shop';
  return null;
}

export function buildItemSources(): ItemSourcesResult {
  const bossTitleKeys = new Map<string, string>();
  const dungeons = new Map(loadTable('DungeonTemplet').map((r) => [r.ID, r]));
  // Les donjons référencent un GROUPE de spawn (plusieurs lignes possibles) —
  // traversée via les helpers d'encounters (positions CSV, colonnes ID0..ID3).
  const spawnsByGroup = groupBy(loadTable('DungeonSpawnTemplet'), 'GroupID');
  const monsters = new Map(loadTable('MonsterTemplet').map((r) => [r.ID, r]));

  /** Boss d'un donjon : NameID → id de monstre (variante la plus élevée).
   * Traversée donjon → spawn partagée (cf. encounters) ; le filtre boss reste ici. */
  const bossesOfDungeon = (dungeonId: string): Map<string, string> => {
    const bosses = new Map<string, string>();
    for (const mid of dungeonSpawnedMonsters(dungeons.get(dungeonId), spawnsByGroup)) {
      const m = monsters.get(mid);
      if (m?.Type !== 'CT_AREA_BOSS_MONSTER' || !m.NameID) continue;
      const prev = bosses.get(m.NameID);
      if (!prev || Number(mid) > Number(prev)) bosses.set(m.NameID, mid);
    }
    return bosses;
  };

  const byItem = new Map<string, Map<string, string>>();
  const credit = (itemId: string, bosses: Map<string, string>) => {
    const entry = byItem.get(itemId) ?? new Map<string, string>();
    for (const [nameId, mid] of bosses) {
      const prev = entry.get(nameId);
      if (!prev || Number(mid) > Number(prev)) entry.set(nameId, mid);
    }
    byItem.set(itemId, entry);
  };

  // Passe 1 : drops déclarés des donjons (raids, requêtes…). Le titre du
  // contenu est RÉSOLU par mode (règle partagée d'encounters : curation puis
  // résolveur structurel — DM_RAID_1 → SYS_RAID_1_TITLE, plus de mapping en
  // dur ; les modes ignorés par la curation, ex. ivanez, restent sans titre).
  const titleKeyByMode = new Map<string, string | undefined>();
  for (const g of loadTable('DungeonPVEGroupTemplet')) {
    if (!g.ExpectReward) continue;
    const bosses = bossesOfDungeon(g.DungeonID);
    if (!bosses.size) continue;
    if (!titleKeyByMode.has(g.DungeonMode))
      titleKeyByMode.set(g.DungeonMode, modeTitleKey(g.DungeonMode));
    const titleKey = titleKeyByMode.get(g.DungeonMode);
    if (titleKey) for (const mid of bosses.values()) bossTitleKeys.set(mid, titleKey);
    for (const itemId of splitCsv(g.ExpectReward)) credit(itemId, bosses);
  }

  // Passe 2 : Irregular Chase (équipements du RandomGroup du Reward_Win).
  const rewards = new Map(loadTable('RewardTemplet').map((r) => [r.ID, r]));
  const groupItems = new Map<string, string[]>();
  for (const g of loadTable('RewardGroupTemplet')) {
    if (g.Type !== 'RIT_ITEM' || !g.GroupID) continue;
    const list = groupItems.get(g.GroupID) ?? [];
    list.push(g.TypeID);
    groupItems.set(g.GroupID, list);
  }
  const equipIds = new Set(
    loadTable('ItemTemplet')
      .filter((r) => r.ItemType === 'IT_EQUIP')
      .map((r) => r.ID),
  );
  for (const row of loadTable('IrregularChaseTemplet')) {
    const rw = rewards.get(row.Reward_Win);
    if (!rw?.RandomGroupID) continue;
    const bosses = bossesOfDungeon(row.DungeonID);
    if (!bosses.size) continue;
    for (const mid of bosses.values()) bossTitleKeys.set(mid, CHASE_TITLE_KEY);
    for (const itemId of groupItems.get(rw.RandomGroupID) ?? []) {
      if (equipIds.has(itemId)) credit(itemId, bosses);
    }
  }

  // Passe 3 : boutiques (Adventure License, boutiques d'événement).
  const shopsByItem = new Map<string, Set<string>>();
  for (const p of loadTable('ProductTemplet')) {
    const slug = shopSlug(p.ProductBuyType);
    if (!slug) continue;
    for (const [type, goods] of [
      [p.ProductGoodsType, p.ProductGoodsID],
      [p.ProductGoodsType2, p.ProductGoodsID2],
    ]) {
      if (type !== 'PGT_ITEM' || !goods || !equipIds.has(goods)) continue;
      const set = shopsByItem.get(goods) ?? new Set<string>();
      set.add(slug);
      shopsByItem.set(goods, set);
    }
  }

  const out: ItemSources = {};
  for (const [itemId, bosses] of byItem) {
    out[itemId] = { bosses: [...bosses.values()].sort() };
  }
  for (const [itemId, shops] of shopsByItem) {
    const entry = (out[itemId] ??= { bosses: [] });
    entry.shops = [...shops].sort();
  }
  return { items: out, bossTitleKeys };
}
