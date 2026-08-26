// CFormula$$CalcBattlePower — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcBattlePower(CCharacterData _Data, CSkillManager _SkillManager, Dictionary<ITEM_SUB_TYPE, CItem> _dicItemList)
	{
		int atk = _Data.Atk;
		int def = _Data.Def;
		int maxHP = _Data.MaxHP;
		int speed = _Data.Speed;
		int criticalRate = _Data.CriticalRate;
		int criticalDMGRate = _Data.CriticalDMGRate;
		int piercePowerRate = _Data.PiercePowerRate;
		int buffChance = _Data.BuffChance;
		int buffResist = _Data.BuffResist;
		int showStarUI = _Data.ShowStarUI;
		int starPlus = _Data.StarPlus;
		int dMGBoost = _Data.DMGBoost;
		int dMGReduceRate = _Data.DMGReduceRate;
		int enemyCriticalDamageReduce = _Data.EnemyCriticalDamageReduce;
		int num = _SkillManager.GetSkill(SKILL_TYPE.SKT_FIRST)?.Level ?? 1;
		int num2 = _SkillManager.GetSkill(SKILL_TYPE.SKT_SECOND)?.Level ?? 1;
		int num3 = _SkillManager.GetSkill(SKILL_TYPE.SKT_ULTIMATE)?.Level ?? 1;
		int num4 = _SkillManager.GetSkill(SKILL_TYPE.SKT_CHAIN_PASSIVE)?.Level ?? 1;
		float num5 = criticalDMGRate + dMGBoost;
		float num6 = ((num5 <= 2000f) ? (num5 / 1000f) : (2.5f + 2f * (1f - Mathf.Pow(1f - Mathf.Min(1f, (num5 - 2000f) / 2500f), 2f))));
		float num7 = ((float)atk + (float)atk * ((1000f + (float)criticalRate) * 0.001f) * num6 * ((1000f + (float)piercePowerRate * 1.5f) * 0.001f) * (1f + (float)speed / 50f) * (1f + 1.7f * ((float)buffChance / ((float)buffChance + 130f)))) / 8f;
		float num8 = (float)(maxHP + def) * (1.05f + 0.15f * (44000f / ((float)(maxHP + def) + 44000f))) * (1f + 0.25f * ((float)(enemyCriticalDamageReduce + dMGReduceRate) / ((float)(enemyCriticalDamageReduce + dMGReduceRate) + 200f))) * (1f + 0.25f * ((float)buffResist / ((float)buffResist + 200f)));
		float num9 = (float)showStarUI * 500f + (float)starPlus * 120f + (float)(num + num2 + num3 + num4 - 4) * 100f;
		CItem equipItem = _Data.GetEquipItem(ITEM_SUB_TYPE.ITS_EQUIP_EXCLUSIVE);
		int num10 = ((equipItem != null) ? (300 + equipItem.EnchantLevel * 100) : 0);
		CItem equipItem2 = _Data.GetEquipItem(ITEM_SUB_TYPE.ITS_EQUIP_OOPARTS);
		int num11 = ((equipItem2 != null) ? (50 * equipItem2.BasicStar + equipItem2.EnchantLevel * 100) : 0);
		int num12 = ((_Data.FusionCharID != 0) ? 5000 : 0);
		return Mathf.FloorToInt(num7 + num8 + num9 + (float)num10 + (float)num11 + (float)num12);
	}
