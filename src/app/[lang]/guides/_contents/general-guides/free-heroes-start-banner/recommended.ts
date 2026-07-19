/**
 * Contenu ÉDITORIAL du guide « Free Heroes & Starter Banners » — les picks
 * recommandés de la Custom Banner, avec leurs raisons localisées.
 *
 * Les SOURCES de héros gratuits (onglet « Free Heroes ») vivent désormais dans
 * `free-heroes-sources.json` : ÉDITABLES depuis l'admin (ajout/retrait de
 * sources et de héros). Elles sont ré-exportées ici pour ne rien changer aux
 * imports d'`index.tsx`.
 *
 * Les personnages sont désignés par NOM D'AFFICHAGE EN (clé du contenu
 * éditorial) : un nom inconnu casse le build à la résolution. La section « pas
 * encore dans la Custom Banner » ne vit PAS ici : elle se dérive du pool réel
 * (data/generated/recruit.json) dans index.tsx.
 */
import type { LocalizedText } from '@contracts';
import freeHeroesData from './free-heroes-sources.json';

export type FreeHeroEntry = {
  names: string[];
  pickType: 'one' | 'all';
  reason: LocalizedText;
};

export type FreeHeroSource = {
  source: LocalizedText;
  entries: FreeHeroEntry[];
};

export type CustomBannerPick = {
  names: string[];
  reason: LocalizedText;
};

// Free Heroes Sources — donnée éditable (JSON), typée à l'import.
export const freeHeroesSources: FreeHeroSource[] = freeHeroesData.sources as FreeHeroSource[];

// Custom Banner Picks
export const customBannerPicks: CustomBannerPick[] = [
  {
    names: ['Tamara', 'Valentine', 'Skadi'],
    reason: {
      en: 'Crit buffers.',
      jp: 'クリティカルバッファー。',
      kr: '치명타 버퍼.',
      zh: '暴击辅助。',
      fr: 'Buffers de crit.',
    },
  },
  {
    names: ['Dianne', 'Nella'],
    reason: {
      en: 'Pick based on your starter selector choice.',
      jp: 'スターター選択に合わせて選ぼう。',
      kr: '스타터 선택에 맞춰 고르세요.',
      zh: '根据新手包选择来挑选。',
      fr: 'À choisir selon votre sélecteur de starter.',
    },
  },
  {
    names: ['Dahlia', 'Iota', 'Kanon'],
    reason: {
      en: 'Excellent PvP units.',
      jp: '優秀なPvPユニット。',
      kr: '우수한 PvP 유닛.',
      zh: '优秀的PvP角色。',
      fr: 'Excellentes unités PvP.',
    },
  },
  {
    names: ['Ame', 'Rey', 'Roxie', 'Maxwell'],
    reason: {
      en: 'High damage dealers for general content.',
      jp: '汎用コンテンツ向けの高火力アタッカー。',
      kr: '범용 콘텐츠용 고화력 딜러.',
      zh: '通用内容的高伤害输出。',
      fr: 'Damage dealers élevés pour le contenu général.',
    },
  },
  {
    names: ['Akari', 'Tamamo-no-Mae', 'Kuro'],
    reason: {
      en: 'Reliable debuffers.',
      jp: '信頼できるデバッファー。',
      kr: '믿을 수 있는 디버퍼.',
      zh: '可靠的减益角色。',
      fr: 'Debuffers fiables.',
    },
  },
  {
    names: ['Primine', 'Astei', 'Liselotte', 'Viella'],
    reason: {
      en: 'Healers.',
      jp: 'ヒーラー。',
      kr: '힐러.',
      zh: '治疗角色。',
      fr: 'Healers.',
    },
  },
  {
    names: ['Eris', 'Drakhan', 'Regina', 'Caren', 'Vlada', 'Maxie', 'Fortuna'],
    reason: {
      en: 'DPS with special use cases.',
      jp: '特定用途向けDPS。',
      kr: '특수 용도 DPS.',
      zh: '特殊用途的输出角色。',
      fr: "DPS avec des cas d'usage spécifiques.",
    },
  },
  {
    names: ['Sterope', 'Notia', 'Hilde', 'Charlotte', 'Fran', 'Luna', 'Ember', 'Stella'],
    reason: {
      en: 'Niche but useful in specific content.',
      jp: 'ニッチだが特定コンテンツで有用。',
      kr: '틈새지만 특정 콘텐츠에서 유용.',
      zh: '小众但在特定内容中有用。',
      fr: 'De niche mais utiles dans des contenus spécifiques.',
    },
  },
  {
    names: ['Rin', 'Epsilon'],
    reason: {
      en: 'Usable as DPS early on, but generally outscaled later.',
      jp: '序盤はDPSとして使えるが、後半は他に劣る。',
      kr: '초반에는 DPS로 사용 가능하지만, 후반에는 밀림.',
      zh: '前期可作为输出使用，但后期会被超越。',
      fr: 'Utilisables comme DPS au début, mais généralement surpassés plus tard.',
    },
  },
  {
    names: [
      'Rhona',
      'Hanbyul Lee',
      'Alice',
      'Saeran',
      'Mero',
      'Leo',
      'Christina',
      'Edelweiss',
      'Delta',
      'Bryn',
      'Francesca',
      'Eliza',
      'Mene',
    ],
    reason: {
      en: 'Niche usage.',
      jp: 'ニッチな用途。',
      kr: '틈새 용도.',
      zh: '小众用途。',
      fr: 'Usage de niche.',
    },
  },
];
