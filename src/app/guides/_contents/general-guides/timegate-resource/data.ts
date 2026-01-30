import type { TimegateData } from './helper'

// Source keys for translation
// Keys prefixed with 'progress.' already exist in i18n
// Keys prefixed with 'timegate.source.' need to be created
export const SOURCE_KEYS = {
    // Existing keys (from progress tracker)
    RESOURCE_SHOP: 'progress.shop.general',
    ARENA_SHOP: 'progress.shop.arena-shop',
    GUILD_SHOP: 'progress.shop.guild-shop',
    WORLD_BOSS_SHOP: 'progress.shop.world-boss',
    KATES_WORKSHOP: 'progress.craft.kates-workshop',
    SURVEY_HUB: 'progress.shop.survey-hub',
    STARS_MEMORY_SHOP: 'progress.shop.star-memory',
    JOINT_CHALLENGE_SHOP: 'progress.shop.joint-challenge',

    // New keys needed for this guide (using official game text IDs)
    IRREGULAR_INFILTRATION_FLOOR_3: 'timegate.source.irregular-infiltration-floor-3', // SYS_MISSION_IRREGULAR_03 (without "Clear")
    ARENA_WEEKLY_REWARD: 'timegate.source.arena-weekly-reward', // SYS_PVP_WEEKLY_REWARD
    WEEKLY_MISSION: 'timegate.source.weekly-mission', // SYS_MISSION_WEEKLY
    IRREGULAR_EXTERMINATION_POINT: 'timegate.source.irregular-extermination-point', // SYS_IRR_BATTLE_PASS_TITLE
} as const

export const data: TimegateData = {
    'books': [
        {
            name: 'Basic Skill Manual',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_INFILTRATION_FLOOR_3, monthly: 28 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 40 },
                { sourceKey: SOURCE_KEYS.GUILD_SHOP, weekly: 3 },
                { sourceKey: SOURCE_KEYS.RESOURCE_SHOP, weekly: 5 },
                { sourceKey: SOURCE_KEYS.ARENA_SHOP, weekly: 5 },
                { sourceKey: SOURCE_KEYS.ARENA_WEEKLY_REWARD, weekly: 5 },
                { sourceKey: SOURCE_KEYS.WEEKLY_MISSION, weekly: 1 },
            ],
        },
        {
            name: 'Intermediate Skill Manual',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_INFILTRATION_FLOOR_3, monthly: 17 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 25 },
                { sourceKey: SOURCE_KEYS.GUILD_SHOP, weekly: 2 },
                { sourceKey: SOURCE_KEYS.RESOURCE_SHOP, weekly: 2 },
                { sourceKey: SOURCE_KEYS.ARENA_SHOP, weekly: 3 },
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, weekly: 2 },
                { sourceKey: SOURCE_KEYS.ARENA_WEEKLY_REWARD, weekly: 3 },
                { sourceKey: SOURCE_KEYS.WEEKLY_MISSION, weekly: 1 },
            ],
        },
        {
            name: 'Professional Skill Manual',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_INFILTRATION_FLOOR_3, monthly: 3 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 9 },
                { sourceKey: SOURCE_KEYS.GUILD_SHOP, weekly: 1 },
                { sourceKey: SOURCE_KEYS.ARENA_SHOP, weekly: 2 },
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, weekly: 1 },
                { sourceKey: SOURCE_KEYS.ARENA_WEEKLY_REWARD, weekly: 1 },
            ],
        },
    ],
    'transistones': [
        {
            name: 'Transistone (Total)',
            sources: [
                { sourceKey: SOURCE_KEYS.JOINT_CHALLENGE_SHOP, monthly: 1 },
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, weekly: 4 },
                { sourceKey: SOURCE_KEYS.WORLD_BOSS_SHOP, monthly: 2 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 2 },
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 12 },
                { sourceKey: SOURCE_KEYS.IRREGULAR_INFILTRATION_FLOOR_3, monthly: 9 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, monthly: 3 },
            ],
        },
        {
            name: 'Transistone (Individual)',
            sources: [
                { sourceKey: SOURCE_KEYS.JOINT_CHALLENGE_SHOP, monthly: 1 },
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, monthly: 4 },
                { sourceKey: SOURCE_KEYS.WORLD_BOSS_SHOP, monthly: 2 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 2 },
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 12 },
                { sourceKey: SOURCE_KEYS.IRREGULAR_INFILTRATION_FLOOR_3, monthly: 9 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, monthly: 3 },
            ],
        }
    ],
    'special': [
        {
            name: 'Blue Stardust',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 150 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, weekly: 40 },
            ],
        },
        {
            name: 'Purple Stardust',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 300 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, weekly: 10, costItem: 'Blue Stardust', costAmount: 30 },
            ],
        },
        {
            name: 'Blue Memory Stone',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 150 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, weekly: 40 },
            ],
        },
        {
            name: 'Purple Memory Stone',
            sources: [
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 300 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, weekly: 10, costItem: 'Blue Memory Stone', costAmount: 30 },
            ],
        },
    ],
    'glunite': [
        {
            name: 'Refined Glunite',
            sources: [
                { sourceKey: SOURCE_KEYS.JOINT_CHALLENGE_SHOP, monthly: 1 },
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, monthly: 1 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, monthly: 5 },
            ],
        },
        {
            name: 'Armor Glunite',
            sources: [
                { sourceKey: SOURCE_KEYS.JOINT_CHALLENGE_SHOP, weekly: 1 },
                { sourceKey: SOURCE_KEYS.IRREGULAR_EXTERMINATION_POINT, monthly: 9 },
                { sourceKey: SOURCE_KEYS.KATES_WORKSHOP, weekly: 2 },
            ],
        },
        {
            name: 'Glunite',
            sources: [
                { sourceKey: SOURCE_KEYS.STARS_MEMORY_SHOP, weekly: 1 },
                { sourceKey: SOURCE_KEYS.SURVEY_HUB, weekly: 6 },
            ],
        }
    ],
}
