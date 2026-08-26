// CCharacterData$$CalcBasicStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcBasicStats()
	{
		CalcBasicStatHp();
		m_StatDic[STAT_TYPE.ST_WG].SetBaseValue(Templet.WG_Min, Templet.WG_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_ATK].SetBaseValue(Templet.Atk_Min, Templet.Atk_Max, Level, SpawnAdvantageRateAtk, AddRateAtk, this);
		m_StatDic[STAT_TYPE.ST_DEF].SetBaseValue(Templet.Def_Min, Templet.Def_Max, Level, SpawnAdvantageRateDef, AddRateDef, this);
		m_StatDic[STAT_TYPE.ST_SPEED].SetBaseValue(Templet.Speed_Min, Templet.Speed_Max, Level, SpawnAdvantageRateSpd, 0, this);
		m_StatDic[STAT_TYPE.ST_DMG_REDUCE_RATE].SetBaseValue(Templet.DMGReduceRate_Min, Templet.DMGReduceRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_CRITICAL_RATE].SetBaseValue(Templet.CriticalRate_Min, Templet.CriticalRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_CRITICAL_DMG_RATE].SetBaseValue(Templet.CriticalDMGRate_Min, Templet.CriticalDMGRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_PIERCE_POWER].SetBaseValue(Templet.PiercePower_Min, Templet.PiercePower_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_PIERCE_POWER_RATE].SetBaseValue(Templet.PiercePowerRate_Min, Templet.PiercePowerRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_VAMPIRIC].SetBaseValue(Templet.Vampiric_Min, Templet.Vampiric_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_HIT_HP_RECOVERY].SetBaseValue(Templet.HitHPRecovery_Min, Templet.HitHPRecovery_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_ACCURACY].SetBaseValue(Templet.Accuracy_Min, Templet.Accuracy_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_AVOID].SetBaseValue(Templet.Avoid_Min, Templet.Avoid_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_BUFF_CHANCE].SetBaseValue(Templet.BuffChance_Min, Templet.BuffChance_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_BUFF_RESIST].SetBaseValue(Templet.BuffResist_Min, Templet.BuffResist_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_HIT_AP].SetBaseValue(Templet.HitBP_Min, Templet.HitBP_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_ENTER_AP].SetBaseValue(Templet.EnterBP_Min, Templet.EnterBP_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_KILL_AP].SetBaseValue(Templet.KillBP_Min, Templet.KillBP_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_GET_GOLD_RATE].SetBaseValue(Templet.GetGoldRate_Min, Templet.GetGoldRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_GET_CHARACTER_EXP_RATE].SetBaseValue(Templet.GetCharExpRate_Min, Templet.GetCharExpRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_COUNTER_RATE].SetBaseValue(Templet.CounterRate_Min, Templet.CounterRate_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_AVOID_ADD_CAP].SetBaseValue(Templet.AvoidAddCap_Min, Templet.AvoidAddCap_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_AVOID_SUBTRACT_CAP].SetBaseValue(Templet.AvoidSubtractCap_Min, Templet.AvoidSubtractCap_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_DMG_BOOST].SetBaseValue(Templet.DamageBoost_Min, Templet.DamageBoost_Max, Level, 0, 0, this);
		m_StatDic[STAT_TYPE.ST_E_CRI_DMG_REDUCE].SetBaseValue(Templet.EnemyCriticalDamageReduce_Min, Templet.EnemyCriticalDamageReduce_Max, Level, 0, 0, this);
	}
