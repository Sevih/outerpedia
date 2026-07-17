/**
 * Reviews ÉDITORIALES du guide « Core Fusion » — transplantées VERBATIM de la
 * V2 (data/core_fusion_data.json, oracle de contenu). `recommendedLevels`
 * vient du texte V2 (« 3 or 5 ») ; les COÛTS de ces niveaux dérivent des
 * tables du jeu (fusionCumulativeCosts), plus de constantes en dur.
 */
import type { LocalizedText } from '@contracts';

export interface FusionChanges {
  s1?: LocalizedText;
  s2?: LocalizedText;
  s3?: LocalizedText;
  chain?: LocalizedText;
  passive?: LocalizedText;
  transcendence?: LocalizedText;
}

export interface FusionReviewEntry {
  name: string;
  review: LocalizedText;
  /** Niveaux de fusion recommandés (paliers du jeu, coût dérivé). */
  recommendedLevels: number[];
  changes?: FusionChanges;
}

export const fusionReviews: FusionReviewEntry[] = [
  {
    name: 'Core Fusion Lisha',
    review: {
      en: 'Full rework into a self-sufficient anti-{E/Earth} DPS with up to 50% DEF ignore.',
      jp: '{E/Earth}特化の自己完結型DPSに完全リワーク。最大50%のDEF無視。',
      kr: '{E/Earth} 특화 자급자족형 딜러로 완전 리워크. 최대 50% DEF 무시.',
      zh: '完全重做为反{E/Earth}自给自足型输出，最高50%无视防御。',
      fr: "Rework complet en DPS auto-suffisant anti-{E/Earth} avec jusqu'à 50% d'ignore DEF.",
    },
    recommendedLevels: [3, 5],
    changes: {
      s1: {
        en: '{B/BT_STAT|ST_CRITICAL_RATE} self-buff replaced by {B/BT_STAT|ST_ATK} self-buff (2 turns at Lv5).',
        jp: '{B/BT_STAT|ST_CRITICAL_RATE}の自己バフが{B/BT_STAT|ST_ATK}の自己バフに変更（Lv5で2ターン）。',
        kr: '{B/BT_STAT|ST_CRITICAL_RATE} 자기 버프가 {B/BT_STAT|ST_ATK} 자기 버프로 변경 (Lv5에서 2턴).',
        zh: '{B/BT_STAT|ST_CRITICAL_RATE}自我增益替换为{B/BT_STAT|ST_ATK}自我增益（Lv5时2回合）。',
        fr: 'Le self-buff {B/BT_STAT|ST_CRITICAL_RATE} est remplacé par un self-buff {B/BT_STAT|ST_ATK} (2 tours au Lv5).',
      },
      s2: {
        en: 'Complete rework. Grants {B/BT_STAT|ST_PIERCE_POWER_RATE} (3 turns).\nWith {B/BT_STAT|ST_CRITICAL_DMG_RATE}: becomes single-target + S3 cooldown -1.\nVs {E/Earth}: +30% Priority.',
        jp: '完全リワーク。{B/BT_STAT|ST_PIERCE_POWER_RATE}を付与（3ターン）。\n{B/BT_STAT|ST_CRITICAL_DMG_RATE}時：単体攻撃に変化＋S3クールダウン-1。\n{E/Earth}対象：優先度+30%。',
        kr: '완전 리워크. {B/BT_STAT|ST_PIERCE_POWER_RATE} 부여 (3턴).\n{B/BT_STAT|ST_CRITICAL_DMG_RATE} 시: 단일 대상으로 변경 + S3 쿨다운 -1.\n{E/Earth} 상대: 우선도 +30%.',
        zh: '完全重做。赋予{B/BT_STAT|ST_PIERCE_POWER_RATE}（3回合）。\n{B/BT_STAT|ST_CRITICAL_DMG_RATE}时：变为单体+S3冷却-1。\n对{E/Earth}：优先度+30%。',
        fr: 'Rework complet. Accorde {B/BT_STAT|ST_PIERCE_POWER_RATE} (3 tours).\nAvec {B/BT_STAT|ST_CRITICAL_DMG_RATE} : devient single-target + cooldown S3 -1.\nVs {E/Earth} : +30% de Priority.',
      },
      s3: {
        en: 'Self-buff changed from {B/BT_STAT|ST_ATK} to {B/BT_STAT|ST_CRITICAL_DMG_RATE} (3 turns). +20% DMG vs {E/Earth} replaced by DEF ignore:\nWith {B/BT_STAT|ST_PIERCE_POWER_RATE}: ignores 20% DEF.\nVs {E/Earth}: ignores additional 30% DEF (50% total).',
        jp: '自己バフが{B/BT_STAT|ST_ATK}から{B/BT_STAT|ST_CRITICAL_DMG_RATE}（3ターン）に変更。{E/Earth}への+20%ダメージがDEF無視に置き換え：\n{B/BT_STAT|ST_PIERCE_POWER_RATE}時：DEF20%無視。\n{E/Earth}対象：追加30%DEF無視（合計50%）。',
        kr: '자기 버프가 {B/BT_STAT|ST_ATK}에서 {B/BT_STAT|ST_CRITICAL_DMG_RATE} (3턴)로 변경. {E/Earth} 대상 +20% 피해가 DEF 무시로 교체:\n{B/BT_STAT|ST_PIERCE_POWER_RATE} 시: DEF 20% 무시.\n{E/Earth} 상대: 추가 30% DEF 무시 (총 50%).',
        zh: '自我增益从{B/BT_STAT|ST_ATK}改为{B/BT_STAT|ST_CRITICAL_DMG_RATE}（3回合）。对{E/Earth}+20%伤害替换为无视防御：\n有{B/BT_STAT|ST_PIERCE_POWER_RATE}时：无视20%防御。\n对{E/Earth}：额外无视30%防御（共50%）。',
        fr: "Self-buff passe de {B/BT_STAT|ST_ATK} à {B/BT_STAT|ST_CRITICAL_DMG_RATE} (3 tours). Les +20% DMG vs {E/Earth} sont remplacés par de l'ignore DEF :\nAvec {B/BT_STAT|ST_PIERCE_POWER_RATE} : ignore 20% de DEF.\nVs {E/Earth} : ignore 30% de DEF supplémentaires (50% au total).",
      },
      chain: {
        en: 'Chain: Starter → Companion. Team {B/BT_STAT|ST_ATK} replaced by 25 AP restore (caster + next chain unit).\nDual: {B/BT_STAT|ST_ATK} duration 1 → 2 turns.',
        jp: 'チェーン：スターター→コンパニオン。味方全体{B/BT_STAT|ST_ATK}がAP25回復（自身＋次のチェーンユニット）に置き換え。\n連携攻撃：{B/BT_STAT|ST_ATK}が1→2ターンに。',
        kr: '체인: 스타터 → 컴패니언. 아군 전체 {B/BT_STAT|ST_ATK}가 AP 25 회복 (시전자 + 다음 체인 유닛)으로 교체.\n협공: {B/BT_STAT|ST_ATK} 1 → 2턴.',
        zh: '连锁：开启者→同伴。全队{B/BT_STAT|ST_ATK}替换为25 AP恢复（施法者+下一个连锁单位）。\n协攻：{B/BT_STAT|ST_ATK} 1→2回合。',
        fr: "Chain : Starter → Companion. Le {B/BT_STAT|ST_ATK} d'équipe est remplacé par 25 AP restore (caster + unité suivante de la chain).\nDual : durée du {B/BT_STAT|ST_ATK} 1 → 2 tours.",
      },
      passive: {
        en: '+50% DMG vs elemental advantage. Enhanced (Lv5): +50% DMG vs bosses.',
        jp: '属性有利に+50%ダメージ。強化（Lv5）：ボスに+50%ダメージ。',
        kr: '속성 유리 시 +50% 피해. 강화 (Lv5): 보스에 +50% 피해.',
        zh: '属性克制时+50%伤害。强化（Lv5）：对Boss+50%伤害。',
        fr: '+50% DMG en avantage élémentaire. Amélioré (Lv5) : +50% DMG vs bosses.',
      },
    },
  },
  {
    name: 'Core Fusion Snow',
    review: {
      en: 'Full Speed scaling across all skills. Priority reduction extended to all enemies (still some bonus against {E/Fire} enemies). {D/BT_FREEZE} now guaranteed.',
      jp: '全スキルにスピード依存ダメージ。優先度減少が全対象に拡大（{E/Fire}への追加ボーナスは維持）。{D/BT_FREEZE}が確定に。',
      kr: '모든 스킬에 속도 비례 피해. 우선도 감소가 모든 대상으로 확대 ({E/Fire} 상대 추가 보너스 유지). {D/BT_FREEZE} 확정으로 변경.',
      zh: '所有技能获得速度比例伤害。优先度降低扩展至所有敌人（对{E/Fire}仍有额外加成）。{D/BT_FREEZE}改为必定触发。',
      fr: 'Scaling complet sur la SPD pour tous les skills. La réduction de Priority est étendue à tous les ennemis (bonus supplémentaire vs {E/Fire} conservé). {D/BT_FREEZE} désormais garanti.',
    },
    recommendedLevels: [3, 5],
    changes: {
      s1: {
        en: 'Priority reduction now targets all enemies (was {E/Fire} only). +10% additional vs {E/Fire}.',
        jp: '優先度減少が全対象に（以前は{E/Fire}のみ）。{E/Fire}には追加+10%。',
        kr: '우선도 감소가 모든 대상으로 (이전에는 {E/Fire}만). {E/Fire} 상대 추가 +10%.',
        zh: '优先度降低现在对所有敌人生效（原仅{E/Fire}）。对{E/Fire}额外+10%。',
        fr: 'La réduction de Priority cible désormais tous les ennemis (avant : {E/Fire} uniquement). +10% supplémentaires vs {E/Fire}.',
      },
      s2: {
        en: '{D/BT_FREEZE} now guaranteed (was 80%). Gains +20% Priority after attacking. +50% DMG vs {D/BT_FREEZE} targets.',
        jp: '{D/BT_FREEZE}が確定に（以前は80%）。攻撃後に優先度+20%。{D/BT_FREEZE}対象にダメージ+50%。',
        kr: '{D/BT_FREEZE} 확정으로 변경 (이전 80%). 공격 후 우선도 +20%. {D/BT_FREEZE} 대상에 피해 +50%.',
        zh: '{D/BT_FREEZE}改为必定触发（原80%）。攻击后优先度+20%。对{D/BT_FREEZE}目标伤害+50%。',
        fr: '{D/BT_FREEZE} désormais garanti (avant 80%). Gagne +20% de Priority après attaque. +50% DMG vs cibles {D/BT_FREEZE}.',
      },
      s3: {
        en: 'Changed from AoE to single-target. Priority reduction replaced by {B/BT_STAT|ST_SPEED} self-buff and {D/BT_FREEZE} (2 turns). Extra Priority reduction vs {E/Fire} remains.',
        jp: '全体から単体に変更。優先度減少が{B/BT_STAT|ST_SPEED}自己バフと{D/BT_FREEZE}（2ターン）に置き換え。{E/Fire}への追加優先度減少は変わらず。',
        kr: '전체에서 단일 대상으로 변경. 우선도 감소가 {B/BT_STAT|ST_SPEED} 자기 버프와 {D/BT_FREEZE} (2턴)으로 교체. {E/Fire} 상대 추가 우선도 감소는 유지.',
        zh: '从全体改为单体。优先度降低替换为{B/BT_STAT|ST_SPEED}自我增益和{D/BT_FREEZE}（2回合）。对{E/Fire}额外优先度降低不变。',
        fr: "Passe d'AoE à single-target. La réduction de Priority est remplacée par un self-buff {B/BT_STAT|ST_SPEED} et {D/BT_FREEZE} (2 tours). La réduction de Priority supplémentaire vs {E/Fire} est conservée.",
      },
      chain: {
        en: 'Chain: Finish → Companion. Gains Speed scaling + always counts as elemental advantage.\nDual: gains Speed scaling + -10% target Priority.',
        jp: 'チェーン：フィニッシュ→コンパニオン。スピード依存ダメージを獲得＋常に属性有利として扱われる。\n連携攻撃：スピード依存ダメージを獲得＋対象の優先度-10%。',
        kr: '체인: 피니시 → 컴패니언. 속도 비례 피해 획득 + 항상 속성 유리로 적용.\n협공: 속도 비례 피해 획득 + 대상 우선도 -10%.',
        zh: '连锁：终结者→同伴。获得速度比例伤害+始终视为属性克制。\n协攻：获得速度比例伤害+目标优先度-10%。',
        fr: 'Chain : Finish → Companion. Gagne du scaling SPD + toujours compté comme avantage élémentaire.\nDual : gagne du scaling SPD + -10% de Priority sur la cible.',
      },
      passive: {
        en: '+50% DMG vs elemental advantage. Enhanced (Lv5): +50% DMG vs bosses.',
        jp: '属性有利に+50%ダメージ。強化（Lv5）：ボスに+50%ダメージ。',
        kr: '속성 유리 시 +50% 피해. 강화 (Lv5): 보스에 +50% 피해.',
        zh: '属性克制时+50%伤害。强化（Lv5）：对Boss+50%伤害。',
        fr: '+50% DMG en avantage élémentaire. Amélioré (Lv5) : +50% DMG vs bosses.',
      },
    },
  },
  {
    name: 'Core Fusion Veronica',
    review: {
      en: "All skills now deal damage proportional to the caster's Max Health instead of a mixed scaling ratio. This makes her a pure HP-scaling tank.",
      jp: '全スキルのダメージが混合比率ではなく、施術者の最大HPに比例するようになった。純粋なHPスケーリングタンクに。',
      kr: '모든 스킬의 피해가 혼합 비율 대신 시전자의 최대 HP에 비례하도록 변경. 순수 HP 스케일링 탱커로 전환.',
      zh: '所有技能伤害从混合比例改为基于施法者最大生命值。使她成为纯HP成长型坦克。',
      fr: "Tous les skills infligent désormais des dégâts proportionnels aux Max HP du caster au lieu d'un ratio de scaling mixte. Elle devient une tank au scaling HP pur.",
    },
    recommendedLevels: [5],
    changes: {
      s1: {
        en: '{B/BT_CALL_BACKUP} no longer requires {B/BT_STAT|ST_DEF}. {D/BT_STAT|ST_ATK} on target if {B/BT_STAT|ST_DEF} is active.\nBurst 1: +1 WGD.\nBurst 2: ignores Resilience.',
        jp: '{B/BT_CALL_BACKUP}に{B/BT_STAT|ST_DEF}が不要に。{B/BT_STAT|ST_DEF}がある場合に対象の{D/BT_STAT|ST_ATK}を付与。\nバースト1：WGD+1。\nバースト2：効果抵抗無視。',
        kr: '{B/BT_CALL_BACKUP}에 {B/BT_STAT|ST_DEF}가 불필요. {B/BT_STAT|ST_DEF} 활성 시 대상에 {D/BT_STAT|ST_ATK} 부여.\n버스트 1: WGD +1.\n버스트 2: 효과 저항 무시.',
        zh: '{B/BT_CALL_BACKUP}不再需要{B/BT_STAT|ST_DEF}。{B/BT_STAT|ST_DEF}激活时对目标施加{D/BT_STAT|ST_ATK}。\n爆发1：WGD+1。\n爆发2：无视效果抵抗。',
        fr: '{B/BT_CALL_BACKUP} ne nécessite plus {B/BT_STAT|ST_DEF}. {D/BT_STAT|ST_ATK} sur la cible si {B/BT_STAT|ST_DEF} est actif.\nBurst 1 : +1 WGD.\nBurst 2 : ignore la RES.',
      },
      s2: {
        en: '{B/BT_REMOVE_DEBUFF} now targets lowest HP ally instead of self only. Gains counterattack when hit, inflicts {D/BT_AGGRO}.',
        jp: '{B/BT_REMOVE_DEBUFF}が自身のみから最低HPの味方に変更。被弾時にカウンターが追加、{D/BT_AGGRO}を付与。',
        kr: '{B/BT_REMOVE_DEBUFF}가 자신만에서 최저 HP 아군으로 변경. 피격 시 반격 추가, {D/BT_AGGRO} 부여.',
        zh: '{B/BT_REMOVE_DEBUFF}从仅自身改为最低HP友军。受击时反击并施加{D/BT_AGGRO}。',
        fr: "{B/BT_REMOVE_DEBUFF} cible désormais l'allié avec le moins de HP au lieu de soi-même uniquement. Gagne une contre-attaque quand touchée, inflige {D/BT_AGGRO}.",
      },
      s3: {
        en: '{D/BT_REMOVE_BUFF} 2 buffs (was 1). Ignores 30% DEF vs bosses.',
        jp: '{D/BT_REMOVE_BUFF}が2つに（以前は1つ）。ボスに対してDEF30%無視。',
        kr: '{D/BT_REMOVE_BUFF} 2개로 (이전 1개). 보스 상대 DEF 30% 무시.',
        zh: '{D/BT_REMOVE_BUFF}增至2个（原1个）。对Boss无视30%防御。',
        fr: '{D/BT_REMOVE_BUFF} 2 buffs (avant 1). Ignore 30% de DEF vs bosses.',
      },
      chain: {
        en: 'Chain: unchanged. Dual: {D/BT_AGGRO} 100% (was 70%).',
        jp: 'チェーン：変更なし。連携攻撃：{D/BT_AGGRO}が100%に（以前は70%）。',
        kr: '체인: 변경 없음. 협공: {D/BT_AGGRO} 100% (이전 70%).',
        zh: '连锁：无变化。协攻：{D/BT_AGGRO} 100%（原70%）。',
        fr: 'Chain : inchangée. Dual : {D/BT_AGGRO} 100% (avant 70%).',
      },
      passive: {
        en: 'Team {B/BT_STAT|ST_CRITICAL_DMG_RATE} for 2 turns at battle start. Increases damage for all allies under {B/BT_STAT|ST_DEF}.',
        jp: '戦闘開始時にチーム全体{B/BT_STAT|ST_CRITICAL_DMG_RATE}（2ターン）。{B/BT_STAT|ST_DEF}を受けた味方全体のダメージ増加。',
        kr: '전투 시작 시 팀 전체 {B/BT_STAT|ST_CRITICAL_DMG_RATE} (2턴). {B/BT_STAT|ST_DEF} 받는 모든 아군 피해 증가.',
        zh: '战斗开始时全队{B/BT_STAT|ST_CRITICAL_DMG_RATE}（2回合）。{B/BT_STAT|ST_DEF}状态下的所有友军伤害提升。',
        fr: "{B/BT_STAT|ST_CRITICAL_DMG_RATE} d'équipe pendant 2 tours en début de combat. Augmente les dégâts de tous les alliés sous {B/BT_STAT|ST_DEF}.",
      },
    },
  },
  {
    name: 'Core Fusion Notia',
    review: {
      en: 'Massive {D/BT_DOT_POISON} output on nearly every action. Shifts from a priority/debuff controller to a full-on poison carry. Fierce Offensive +1 turn upon entering battle.',
      jp: 'ほぼ全てのアクションで大量の{D/BT_DOT_POISON}を付与。優先度/デバフコントローラーから本格的な毒キャリーに転換。戦闘開始時に猛攻+1ターン。',
      kr: '거의 모든 행동에서 대량의 {D/BT_DOT_POISON} 부여. 우선도/디버프 컨트롤러에서 본격적인 독 캐리로 전환. 전투 시작 시 맹공 +1턴.',
      zh: '几乎每个行动都能施加大量{D/BT_DOT_POISON}。从优先度/减益控制者转变为全面的毒伤输出核心。入场时猛烈攻势+1回合。',
      fr: "Énorme output de {D/BT_DOT_POISON} sur quasiment chaque action. Passe d'un controller de priority/debuff à un véritable poison carry. Fierce Offensive +1 tour à l'entrée en combat.",
    },
    recommendedLevels: [5],
    changes: {
      s1: {
        en: 'With Fierce Offensive: gains {D/BT_DOT_POISON} (2 turns) on target.\nBurst 2: Poison Detonate (was DMG increase).',
        jp: '猛攻時：対象に{D/BT_DOT_POISON}（2ターン）を追加。\nバースト2：毒爆破に変更（以前はダメージ増加）。',
        kr: '맹공 시: 대상에 {D/BT_DOT_POISON} (2턴) 추가.\n버스트 2: 독 폭발로 변경 (이전 피해 증가).',
        zh: '猛烈攻势时：对目标施加{D/BT_DOT_POISON}（2回合）。\n爆发2：毒引爆（原伤害提升）。',
        fr: 'Avec Fierce Offensive : ajoute {D/BT_DOT_POISON} (2 tours) sur la cible.\nBurst 2 : Poison Detonate (avant : DMG increase).',
      },
      s2: {
        en: 'Crystal Storm now inflicts {D/BT_DOT_POISON} unconditionally (was Fierce Offensive only). With Fierce Offensive: additional {D/BT_DOT_POISON} + {D/BT_SILENCE} on healers.',
        jp: 'クリスタルストームが無条件で{D/BT_DOT_POISON}を付与（以前は猛攻時のみ）。猛攻時：追加{D/BT_DOT_POISON}＋ヒーラーに{D/BT_SILENCE}。',
        kr: '크리스탈 스톰이 무조건 {D/BT_DOT_POISON} 부여 (이전에는 맹공 시만). 맹공 시: 추가 {D/BT_DOT_POISON} + 힐러에 {D/BT_SILENCE}.',
        zh: '水晶风暴现在无条件施加{D/BT_DOT_POISON}（原仅猛烈攻势时）。猛烈攻势时：额外{D/BT_DOT_POISON}+对奶妈{D/BT_SILENCE}。',
        fr: 'Crystal Storm inflige désormais {D/BT_DOT_POISON} inconditionnellement (avant : uniquement avec Fierce Offensive). Avec Fierce Offensive : {D/BT_DOT_POISON} supplémentaire + {D/BT_SILENCE} sur les healers.',
      },
      s3: {
        en: 'Gains {D/BT_DOT_POISON} on all enemies (2 turns at Lv5). +1 additional {D/BT_DOT_POISON} stack vs bosses.',
        jp: '全敵に{D/BT_DOT_POISON}を追加（Lv5で2ターン）。ボスには追加で{D/BT_DOT_POISON}+1スタック。',
        kr: '모든 적에 {D/BT_DOT_POISON} 추가 (Lv5에서 2턴). 보스에 추가 {D/BT_DOT_POISON} +1 스택.',
        zh: '对所有敌人施加{D/BT_DOT_POISON}（Lv5时2回合）。对Boss额外+1层{D/BT_DOT_POISON}。',
        fr: 'Inflige {D/BT_DOT_POISON} à tous les ennemis (2 tours au Lv5). +1 stack supplémentaire de {D/BT_DOT_POISON} vs bosses.',
      },
      chain: {
        en: 'Chain: 25 AP restore replaced by {D/BT_DOT_POISON} (2 turns).\nDual: +20% Priority replaced by {D/BT_DOT_POISON} (2 turns).',
        jp: 'チェーン：AP25回復が{D/BT_DOT_POISON}（2ターン）に置き換え。\n連携攻撃：優先度+20%が{D/BT_DOT_POISON}（2ターン）に置き換え。',
        kr: '체인: AP 25 회복이 {D/BT_DOT_POISON} (2턴)으로 교체.\n협공: 우선도 +20%가 {D/BT_DOT_POISON} (2턴)으로 교체.',
        zh: '连锁：25 AP恢复替换为{D/BT_DOT_POISON}（2回合）。\n协攻：优先度+20%替换为{D/BT_DOT_POISON}（2回合）。',
        fr: 'Chain : 25 AP restore remplacé par {D/BT_DOT_POISON} (2 tours).\nDual : +20% de Priority remplacé par {D/BT_DOT_POISON} (2 tours).',
      },
      passive: {
        en: '+50% DMG vs elemental advantage. Enhanced (Lv5): +50% Effectiveness.',
        jp: '属性有利に+50%ダメージ。強化（Lv5）：効果命中+50%。',
        kr: '속성 유리 시 +50% 피해. 강화 (Lv5): 효과 적중 +50%.',
        zh: '属性克制时+50%伤害。强化（Lv5）：效果命中+50%。',
        fr: "+50% DMG en avantage élémentaire. Amélioré (Lv5) : +50% d'EFF.",
      },
    },
  },
  {
    name: 'Core Fusion Eternal',
    review: {
      en: 'More damage, new {D/BT_ACTION_GAUGE} debuff on S3, and {B/BT_STAT|ST_SPEED} buff at battle start from transcendence.',
      jp: 'ダメージ増加、S3に新たな{D/BT_ACTION_GAUGE}デバフ、超越で戦闘開始時に{B/BT_STAT|ST_SPEED}バフを獲得。',
      kr: '피해량 증가, S3에 새로운 {D/BT_ACTION_GAUGE} 디버프, 초월로 전투 시작 시 {B/BT_STAT|ST_SPEED} 버프 획득.',
      zh: '伤害提升，S3获得新的{D/BT_ACTION_GAUGE}减益，超越战斗开始时获得{B/BT_STAT|ST_SPEED}增益。',
      fr: 'Plus de dégâts, nouveau debuff {D/BT_ACTION_GAUGE} sur le S3, et buff {B/BT_STAT|ST_SPEED} en début de combat via la transcendance.',
    },
    recommendedLevels: [3, 5],
    changes: {
      s2: {
        en: 'Inflicts additional {D/BT_DOT_BURN} (2 turns) on {E/Earth} targets.\nBurst 1: grants {B/BT_BARRIER} to self (was Effectiveness).\nBurst 2: inflicts {D/BT_DOT_BURN} (2 turns).',
        jp: '{E/Earth}対象に追加{D/BT_DOT_BURN}（2ターン）を付与。\nバースト1：効果命中の代わりに自身に{B/BT_BARRIER}を付与。\nバースト2：{D/BT_DOT_BURN}（2ターン）を付与。',
        kr: '{E/Earth} 상대에 추가 {D/BT_DOT_BURN} (2턴) 부여.\n버스트 1: 효과 적중 대신 자신에게 {B/BT_BARRIER} 부여.\n버스트 2: {D/BT_DOT_BURN} (2턴) 부여.',
        zh: '对{E/Earth}追加{D/BT_DOT_BURN}（2回合）。\n爆发1：对自身施加{B/BT_BARRIER}（原效果命中）。\n爆发2：施加{D/BT_DOT_BURN}（2回合）。',
        fr: 'Inflige du {D/BT_DOT_BURN} supplémentaire (2 tours) sur les cibles {E/Earth}.\nBurst 1 : accorde {B/BT_BARRIER} à soi-même (avant : EFF).\nBurst 2 : inflige {D/BT_DOT_BURN} (2 tours).',
      },
      s3: {
        en: 'Inflicts {D/BT_ACTION_GAUGE} -20% on the enemy with the highest ATK.',
        jp: '最高攻撃力の敵に{D/BT_ACTION_GAUGE}-20%を付与。',
        kr: '최고 공격력 적에 {D/BT_ACTION_GAUGE} -20% 부여.',
        zh: '对最高攻击力敌人施加{D/BT_ACTION_GAUGE}-20%。',
        fr: "Inflige {D/BT_ACTION_GAUGE} -20% sur l'ennemi avec la plus haute ATK.",
      },
      chain: {
        en: 'Chain Companion Effect: {B/BT_DMG_TARGET_BREAK} replaced by {D/BT_DOT_BURN} (2 turns, ignores Resilience) on all enemies.',
        jp: 'チェーン効果：{B/BT_DMG_TARGET_BREAK}が{D/BT_DOT_BURN}（2ターン、効果抵抗無視）に置き換え（敵全体）。',
        kr: '체인 컴패니언 효과: {B/BT_DMG_TARGET_BREAK}이 적 전체 {D/BT_DOT_BURN} (2턴, 효과 저항 무시)으로 교체.',
        zh: '连携效果：{B/BT_DMG_TARGET_BREAK}替换为对全体敌人施加{D/BT_DOT_BURN}（2回合，无视效果抵抗）。',
        fr: 'Chain Companion Effect : {B/BT_DMG_TARGET_BREAK} remplacé par {D/BT_DOT_BURN} (2 tours, ignore la RES) sur tous les ennemis.',
      },
      passive: {
        en: 'On Death Sentence use: self {B/BT_STAT|ST_ATK} and {B/BT_ADDITIVE_TURN}.',
        jp: '【死刑宣告】使用時：自身{B/BT_STAT|ST_ATK}と{B/BT_ADDITIVE_TURN}を獲得。',
        kr: '사형 선고 사용 시: 자신 {B/BT_STAT|ST_ATK} 및 {B/BT_ADDITIVE_TURN} 획득.',
        zh: '使用死刑宣判时：自身获得{B/BT_STAT|ST_ATK}和{B/BT_ADDITIVE_TURN}。',
        fr: "À l'utilisation de Death Sentence : self {B/BT_STAT|ST_ATK} et {B/BT_ADDITIVE_TURN}.",
      },
      transcendence: {
        en: 'Self {B/BT_STAT|ST_SPEED} (1 turn) at battle start.',
        jp: '戦闘開始時に自身{B/BT_STAT|ST_SPEED}（1ターン）を獲得。',
        kr: '전투 시작 시 자신 {B/BT_STAT|ST_SPEED} (1턴) 획득.',
        zh: '战斗开始时获得自身{B/BT_STAT|ST_SPEED}（1回合）。',
        fr: 'Self {B/BT_STAT|ST_SPEED} (1 tour) en début de combat.',
      },
    },
  },
  {
    name: 'Core Fusion Epsilon',
    review: {
      en: 'Full rework into a DEF-scaling DPS: every skill now deals damage proportional to Defense instead of Attack, and gains +50% DMG while {B/BT_STAT|ST_DEF} is active (all Barrier-conditional bonuses removed). Gains buff steal across the kit and a team {B/BT_STAT|ST_CRITICAL_DMG_RATE} buff on S3.',
      jp: '防御力依存DPSに完全リワーク。全スキルのダメージが攻撃力の代わりに防御力に比例し、{B/BT_STAT|ST_DEF}保有中はダメージ+50%（シールド条件ボーナスは全て削除）。キット全体で強化効果奪取を獲得し、S3で味方全体に{B/BT_STAT|ST_CRITICAL_DMG_RATE}を付与。',
      kr: '방어력 비례 딜러로 완전 리워크. 모든 스킬 피해가 공격력 대신 방어력에 비례하고, {B/BT_STAT|ST_DEF} 보유 중 피해 +50% (실드 조건 보너스 전부 삭제). 킷 전체에 강화 효과 강탈 획득, S3로 아군 전체 {B/BT_STAT|ST_CRITICAL_DMG_RATE} 부여.',
      zh: '完全重做为防御力成长型输出。所有技能伤害按防御力而非攻击力计算，持有{B/BT_STAT|ST_DEF}期间伤害+50%（护盾条件加成全部移除）。整套技能获得夺取强化效果，S3为全队提供{B/BT_STAT|ST_CRITICAL_DMG_RATE}。',
      fr: "Rework complet en DPS au scaling DEF : tous les skills infligent des dégâts proportionnels à la DEF au lieu de l'ATK, et gagnent +50% de DMG tant que {B/BT_STAT|ST_DEF} est actif (tous les bonus conditionnés au Barrier sont supprimés). Gagne du vol de buffs sur tout le kit et un buff {B/BT_STAT|ST_CRITICAL_DMG_RATE} d'équipe sur le S3.",
    },
    recommendedLevels: [3, 5],
    changes: {
      s1: {
        en: 'Chance to gain {B/BT_STAT|ST_DEF} increased: 20/35/50% → 50/75/100% (guaranteed at Lv5).',
        jp: '{B/BT_STAT|ST_DEF}の獲得確率がUP：20/35/50% → 50/75/100%（Lv5で確定）。',
        kr: '{B/BT_STAT|ST_DEF} 획득 확률 증가: 20/35/50% → 50/75/100% (Lv5에서 확정).',
        zh: '获得{B/BT_STAT|ST_DEF}的概率提升：20/35/50% → 50/75/100%（Lv5时必定触发）。',
        fr: "Chance d'obtenir {B/BT_STAT|ST_DEF} augmentée : 20/35/50% → 50/75/100% (garanti au Lv5).",
      },
      s2: {
        en: 'Gains {D/BT_STEAL_BUFF} (1 buff, 2 at Lv4).\nBurst 1: enhanced steal (ignores Resilience) + 1 WGD (was DMG increase + {D/BT_REMOVE_BUFF} +1).\nBurst 2: DMG increase (was {D/BT_REMOVE_BUFF} +1).',
        jp: '{D/BT_STEAL_BUFF}を獲得（1個、Lv4で2個）。\nバースト1：強化奪取強化（効果抵抗無視）＋WGダメージ+1（以前はダメージUP＋{D/BT_REMOVE_BUFF}+1）。\nバースト2：ダメージUP（以前は{D/BT_REMOVE_BUFF}+1）。',
        kr: '{D/BT_STEAL_BUFF} 획득 (1개, Lv4에서 2개).\n버스트 1: 강화 강탈 강화 (효과 저항 무시) + WG 감소량 +1 (이전 피해 증가 + {D/BT_REMOVE_BUFF} +1).\n버스트 2: 피해 증가 (이전 {D/BT_REMOVE_BUFF} +1).',
        zh: '获得{D/BT_STEAL_BUFF}（1个，Lv4时2个）。\n爆发1：强化夺取强化（无视效果抵抗）+WG降低量+1（原伤害提升+{D/BT_REMOVE_BUFF}+1）。\n爆发2：伤害提升（原{D/BT_REMOVE_BUFF}+1）。',
        fr: 'Gagne {D/BT_STEAL_BUFF} (1 buff, 2 au Lv4).\nBurst 1 : vol de buff amélioré (ignore la RES) + 1 WGD (avant : DMG increase + {D/BT_REMOVE_BUFF} +1).\nBurst 2 : DMG increase (avant : {D/BT_REMOVE_BUFF} +1).',
      },
      s3: {
        en: "Changed from AoE to single-target. AP self-recovery (35 per target) replaced by removing all of the target's AP. After attacking, grants team {B/BT_STAT|ST_CRITICAL_DMG_RATE} (2 turns). {B/BT_INVINCIBLE} at Lv5 unchanged.",
        jp: '全体から単体に変更。自分のAP回復（対象ごとに35）が対象のAP全除去に置き換え。攻撃後、味方全体に{B/BT_STAT|ST_CRITICAL_DMG_RATE}（2ターン）を付与。Lv5の{B/BT_INVINCIBLE}は変わらず。',
        kr: '전체에서 단일 대상으로 변경. 자신 AP 회복 (대상당 35)이 대상의 AP 전부 제거로 교체. 공격 후 아군 전체에 {B/BT_STAT|ST_CRITICAL_DMG_RATE} (2턴) 부여. Lv5의 {B/BT_INVINCIBLE}은 유지.',
        zh: '从全体改为单体。自身AP恢复（每目标35）替换为清除目标所有AP。攻击后为全队附加{B/BT_STAT|ST_CRITICAL_DMG_RATE}（2回合）。Lv5的{B/BT_INVINCIBLE}保留。',
        fr: "Passe d'AoE à monocible. La récupération d'AP (35 par cible) est remplacée par le retrait de toute l'AP de la cible. Après l'attaque, accorde {B/BT_STAT|ST_CRITICAL_DMG_RATE} à l'équipe (2 tours). {B/BT_INVINCIBLE} au Lv5 conservé.",
      },
      chain: {
        en: 'Chain: Starter → Companion. Team {B/BT_DMG_TARGET_BREAK} replaced by {B/BT_COOL_CHARGE} on own skills.\nDual: Barrier-conditional DMG replaced by {D/BT_STEAL_BUFF} (1 buff, ignores Resilience).',
        jp: 'チェーン：スターター→コンパニオン。味方全体{B/BT_DMG_TARGET_BREAK}が自分の{B/BT_COOL_CHARGE}に置き換え。\n連携攻撃：シールド条件ダメージが{D/BT_STEAL_BUFF}（1個、効果抵抗無視）に置き換え。',
        kr: '체인: 스타터 → 컴패니언. 아군 전체 {B/BT_DMG_TARGET_BREAK}이 자신 {B/BT_COOL_CHARGE}로 교체.\n협공: 실드 조건 피해가 {D/BT_STEAL_BUFF} (1개, 효과 저항 무시)로 교체.',
        zh: '连锁：开启者→同伴。全队{B/BT_DMG_TARGET_BREAK}替换为自身{B/BT_COOL_CHARGE}。\n协攻：护盾条件伤害替换为{D/BT_STEAL_BUFF}（1个，无视效果抵抗）。',
        fr: "Chain : Starter → Companion. Le {B/BT_DMG_TARGET_BREAK} d'équipe est remplacé par {B/BT_COOL_CHARGE} sur ses propres skills.\nDual : le DMG conditionné au Barrier est remplacé par {D/BT_STEAL_BUFF} (1 buff, ignore la RES).",
      },
      passive: {
        en: '+50% DMG vs elemental advantage. Enhanced (Lv5): all attacks count as elemental advantage.',
        jp: '属性有利に+50%ダメージ。強化（Lv5）：すべての攻撃が有利属性判定に。',
        kr: '속성 유리 시 +50% 피해. 강화 (Lv5): 모든 공격이 유리한 상성으로 적용.',
        zh: '属性克制时+50%伤害。强化（Lv5）：所有攻击以克制属性生效。',
        fr: '+50% DMG en avantage élémentaire. Amélioré (Lv5) : toutes les attaques comptent comme avantage élémentaire.',
      },
      transcendence: {
        en: '5★: +30% Penetration against Dimensional Singularity bosses.',
        jp: '5★：次元特異点ボス対象に貫通力+30%。',
        kr: '5★: 차원 특이점 보스 대상 관통력 +30%.',
        zh: '5★：对次元奇点首领穿透力+30%。',
        fr: '5★ : +30% de Penetration vs boss Dimensional Singularity.',
      },
    },
  },
];
