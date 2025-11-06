const fs = require('fs');
const path = require('path');

const charactersDir = path.join(process.cwd(), 'src/data/char');
const eeFilePath = path.join(process.cwd(), 'src/data/ee.json');
const outputFile = path.join(process.cwd(), 'src/data/_allCharacters.json');
const isNonEmpty = v => typeof v === 'string' && v.trim() !== '';

// Helper function to normalize effects (arrays or strings)
function normalizeEffect(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') return raw ? [raw] : [];
  return [];
}

// Extract buffs and debuffs with source information
function extractBuffsAndDebuffsWithSource(character, eeData) {
  const buffs = new Set();
  const debuffs = new Set();

  const effectsBySource = {
    SKT_FIRST: { buff: [], debuff: [] },
    SKT_SECOND: { buff: [], debuff: [] },
    SKT_ULTIMATE: { buff: [], debuff: [] },
    SKT_CHAIN_PASSIVE: { buff: [], debuff: [] },
    DUAL_ATTACK: { buff: [], debuff: [] },
    EXCLUSIVE_EQUIP: { buff: [], debuff: [] }
  };

  if (character.skills) {
    const skillMapping = {
      SKT_FIRST: 'SKT_FIRST',
      SKT_SECOND: 'SKT_SECOND',
      SKT_ULTIMATE: 'SKT_ULTIMATE',
      SKT_CHAIN_PASSIVE: 'SKT_CHAIN_PASSIVE'
    };

    for (const [skillKey, sourceKey] of Object.entries(skillMapping)) {
      const skill = character.skills[skillKey];
      if (!skill) continue;

      // Handle regular buff/debuff (chain skill effects)
      for (const [effectKey, targetSet, targetArray] of [
        ['buff', buffs, effectsBySource[sourceKey].buff],
        ['debuff', debuffs, effectsBySource[sourceKey].debuff],
      ]) {
        if (effectKey in skill && skill[effectKey]) {
          const effects = normalizeEffect(skill[effectKey]);
          effects.forEach((e) => {
            targetSet.add(e);
            if (!targetArray.includes(e)) {
              targetArray.push(e);
            }
          });
        }
      }

      // Handle dual_buff/dual_debuff separately (dual attack effects)
      for (const [effectKey, targetSet, targetArray] of [
        ['dual_buff', buffs, effectsBySource.DUAL_ATTACK.buff],
        ['dual_debuff', debuffs, effectsBySource.DUAL_ATTACK.debuff],
      ]) {
        if (effectKey in skill && skill[effectKey]) {
          const effects = normalizeEffect(skill[effectKey]);
          effects.forEach((e) => {
            targetSet.add(e);
            if (!targetArray.includes(e)) {
              targetArray.push(e);
            }
          });
        }
      }
    }
  }

  // Handle Exclusive Equipment
  const slug = character.Fullname?.toLowerCase().replace(/ /g, '-');
  const ee = eeData[slug];
  if (ee) {
    const eeBuffs = normalizeEffect(ee.buff);
    const eeDebuffs = normalizeEffect(ee.debuff);

    eeBuffs.forEach(b => {
      buffs.add(b);
      effectsBySource.EXCLUSIVE_EQUIP.buff.push(b);
    });

    eeDebuffs.forEach(d => {
      debuffs.add(d);
      effectsBySource.EXCLUSIVE_EQUIP.debuff.push(d);
    });
  }

  return {
    buff: Array.from(buffs),
    debuff: Array.from(debuffs),
    effectsBySource
  };
}

async function generateAllCharacters() {
  try {
    // Load exclusive equipment data
    const eeContent = await fs.promises.readFile(eeFilePath, 'utf-8');
    const eeData = JSON.parse(eeContent);

    const files = await fs.promises.readdir(charactersDir);
    const allCharacters = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(charactersDir, file);
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const character = JSON.parse(content);

        // Extract buffs and debuffs
        const { buff, debuff, effectsBySource } = extractBuffsAndDebuffsWithSource(character, eeData);

        const entry = {
          ID: character.ID,
          Fullname: character.Fullname,
          Rarity: character.Rarity,
          role: character.role,
          rank: character.rank,
          Class: character.Class,
          SubClass: character.SubClass,
          Element: character.Element,
          Chain_Type: character.Chain_Type,
          limited: character.limited ?? false,
          gift: character.gift ?? false,
          rank_pvp: character.rank_pvp ?? false,
          buff,
          debuff,
          effectsBySource
        }

        if (Array.isArray(character.tags) && character.tags.length > 0) entry.tags = character.tags
        if (isNonEmpty(character.Fullname_jp)) entry.Fullname_jp = character.Fullname_jp.trim()
        if (isNonEmpty(character.Fullname_kr)) entry.Fullname_kr = character.Fullname_kr.trim()
        if (isNonEmpty(character.Fullname_zh)) entry.Fullname_zh = character.Fullname_zh.trim()

        allCharacters.push(entry)
      }
    }

    await fs.promises.writeFile(outputFile, JSON.stringify(allCharacters, null, 2));
    console.log(`✅ Successfully generated ${outputFile} with ${allCharacters.length} characters`);
  } catch (err) {
    console.error('❌ Error generating all characters:', err);
  }
}

generateAllCharacters();