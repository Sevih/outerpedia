import type { Entry } from './helpers'
import type { LangMap } from '@/lib/localize'

export const DATA: Entry[] = [
    { mode: 'progress.task.joint-challenge', stage: 'S1-8-5', unlockName: 'dungeon.puppet' },
    { mode: 'progress.shop.guild', stage: 'S1-1-8', unlockName: 'dungeon.prisoners' },
    { mode: 'content.base', stage: 'S1-3-1', unlockName: 'dungeon.gathering-supplies' },
    { mode: 'content.event-dungeon', stage: 'S1-3-5', unlockName: 'dungeon.finding-blacksmith' },
    { mode: 'content.archdemon-deeps', stage: 'S1-5-1', unlockName: 'dungeon.onwards-to-magnolia' },
    { mode: 'talisman', stage: 'S1-5-1', unlockName: 'dungeon.onwards-to-magnolia' },
    { mode: 'categories.skyward-tower', stage: 'S1-3-13', unlockName: 'dungeon.her-name-is-alpha' },
    { mode: 'content.special-request-ecology', stage: 'S1-5-5', unlockName: 'dungeon.temporary-truce' },
    { mode: 'content.special-request-identification', stage: 'S1-5-5', unlockName: 'dungeon.temporary-truce' },
    { mode: 'content.arena', stage: 'S1-4-6', unlockName: 'dungeon.commanders-sophistry' },
    { mode: 'content.archdemon-corridor', stage: 'S1-6-12', unlockName: 'dungeon.laplace-magnolia' },
    { mode: 'progress.task.defeat-doppelganger', stage: 'S1-6-5', unlockName: 'dungeon.pass' },
    { mode: 'categories.world-boss', stage: 'S1-10-14', unlockName: 'dungeon.automatons-wish' },
    { mode: 'content.synchro-room', stage: 'S1-7-5', unlockName: 'dungeon.unjust-fight' },
    { mode: 'progress.task.elemental-tower', stage: 'S1-7-5', unlockName: 'dungeon.unjust-fight' },
    { mode: 'content.terminus-isle', stage: 'S1-9-5', unlockName: 'dungeon.responsibility-of-guilty' },
    { mode: 'progress.preciseCraft', stage: 'S1-9-5', unlockName: 'dungeon.responsibility-of-guilty' },
    { mode: 'content.quirk', stage: 'S1-9-5', unlockName: 'dungeon.responsibility-of-guilty' },
    { mode: 'progress.task.adventure-license', stage: 'S1-10-14', unlockName: 'dungeon.automatons-wish' },
    { mode: 'content.irregular-extermination', stage: 'S2-10-15', unlockName: 'dungeon.unchanging' }
]

export const DESCRIPTIONS: Record<string, LangMap> = {
    'progress.task.joint-challenge': {
        en: 'Co-op mode across the server',
        jp: 'サーバー全体の協力モード',
        kr: '서버 전체 협동 모드',
        zh: '全服协作模式'
    },
    'progress.shop.guild': {
        en: 'Join or create a guild',
        jp: 'ギルドに参加または作成',
        kr: '길드 가입 또는 생성',
        zh: '加入或创建公会'
    },
    'content.base': {
        en: 'Unlocks the Base with crafting, shop, and other features',
        jp: '製作、ショップなどの機能を持つアジトを解放',
        kr: '제작, 상점 등의 기능이 있는 아지트 해금',
        zh: '解锁基地，包含制作、商店等功能'
    },
    'content.event-dungeon': {
        en: 'Allows entry to event dungeons',
        jp: 'イベントダンジョンへの入場が可能に',
        kr: '이벤트 던전 입장 가능',
        zh: '可进入活动暗堡'
    },
    'content.archdemon-deeps': {
        en: 'Dungeon with one-time clear rewards',
        jp: '初回クリア報酬があるダンジョン',
        kr: '1회 클리어 보상이 있는 던전',
        zh: '首次通关奖励的暗堡'
    },
    'talisman': {
        en: 'Unlock the talisman equipment slot',
        jp: 'タリスマン装備スロットを解放',
        kr: '탈리스만 장비 슬롯 해금',
        zh: '解锁护身符装备栏'
    },
    'categories.skyward-tower': {
        en: 'Monthly tower challenge - unlocks {P/Sigma}',
        jp: '月間リセットの塔チャレンジ - {P/Sigma}を入手可能',
        kr: '월간 리셋 타워 챌린지 - {P/Sigma} 획득 가능',
        zh: '每月重置的塔挑战 - 可获得{P/Sigma}'
    },
    'content.special-request-ecology': {
        en: 'Main place to farm armor sets',
        jp: '防具セットを集める主な場所',
        kr: '방어구 세트를 파밍하는 주요 장소',
        zh: '刷防具套装的主要场所'
    },
    'content.special-request-identification': {
        en: 'Main place to farm weapons and accessories',
        jp: '武器とアクセサリーを集める主な場所',
        kr: '무기와 악세서리를 파밍하는 주요 장소',
        zh: '刷武器和饰品的主要场所'
    },
    'content.arena': {
        en: 'PvP mode against AI defense team',
        jp: 'AI防衛チームと戦うPvPモード',
        kr: 'AI 방어팀과 싸우는 PvP 모드',
        zh: '与AI防守队伍对战的PvP模式'
    },
    'content.archdemon-corridor': {
        en: 'Repeatable dungeon with 3-day cooldown rewards',
        jp: '3日クールダウンで報酬を獲得できるダンジョン',
        kr: '3일 쿨다운으로 보상을 받는 던전',
        zh: '每3天冷却可获得奖励的暗堡'
    },
    'progress.task.defeat-doppelganger': {
        en: 'Obtain {I-I/Hero Piece} to transcend heroes',
        jp: '{I-I/Hero Piece}を入手してヒーローを超越',
        kr: '{I-I/Hero Piece}를 획득하여 영웅 초월',
        zh: '获取{I-I/Hero Piece}来超越英雄'
    },
    'categories.world-boss': {
        en: 'Battle with 8 heroes and rank against other players',
        jp: '8人のヒーローで戦い、他のプレイヤーと順位を競う',
        kr: '8명의 영웅으로 전투하고 다른 플레이어와 순위 경쟁',
        zh: '使用8名英雄战斗并与其他玩家排名'
    },
    'content.synchro-room': {
        en: 'Heroes placed here gain stats based on room upgrades',
        jp: '配置したヒーローがルームのアップグレードに応じてステータスを獲得',
        kr: '배치된 영웅이 룸 업그레이드에 따라 스탯 획득',
        zh: '放置的英雄根据房间升级获得属性'
    },
    'progress.task.elemental-tower': {
        en: 'Element-specific challenge towers with upgrade materials',
        jp: '強化素材を獲得できる属性別チャレンジタワー',
        kr: '강화 재료를 얻을 수 있는 속성별 챌린지 타워',
        zh: '可获得强化材料的元素挑战塔'
    },
    'content.terminus-isle': {
        en: 'Farm resources for Quirk and Precise Craft',
        jp: 'ギフトと精密作成のリソースを集める場所',
        kr: '기프트와 정밀 제작 자원을 파밍하는 장소',
        zh: '刷天赋和精密制作资源的场所'
    },
    'progress.preciseCraft': {
        en: 'Craft equipment and reroll substats until satisfied',
        jp: '装備を作成し、満足するまでサブステータスをリロール',
        kr: '장비를 제작하고 만족할 때까지 부옵션 리롤',
        zh: '制作装备并重新随机副属性直到满意'
    },
    'content.quirk': {
        en: 'Permanent account-wide stat bonuses',
        jp: 'アカウント全体に適用される永続ステータスボーナス',
        kr: '계정 전체에 적용되는 영구 스탯 보너스',
        zh: '全账号永久属性加成'
    },
    'progress.task.adventure-license': {
        en: 'Weekly challenge mode with various rewards',
        jp: '様々な報酬があるウィークリーチャレンジモード',
        kr: '다양한 보상이 있는 주간 챌린지 모드',
        zh: '有各种奖励的每周挑战模式'
    },
    'content.irregular-extermination': {
        en: 'Exclusive weapons, accessories, and other rewards',
        jp: '限定武器、アクセサリー、その他の報酬',
        kr: '전용 무기, 악세서리 및 기타 보상',
        zh: '专属武器、饰品及其他奖励'
    }
}
