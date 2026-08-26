// CCharacterData$$CalcStat — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	protected void CalcStat()
	{
		m_IsStatDirty = false;
		CalcBasicStats();
		if (Type == CHARACTER_TYPE.CT_PC)
		{
			CalcEvolutionStats();
			CalcTranscendentStarStats();
			CalcArchiveStats();
		}
		CalcSetItem();
		foreach (KeyValuePair<STAT_TYPE, IStatValue> item in m_StatDic)
		{
			item.Value.SetItemOptionsValue(m_EquipDic);
			item.Value.SetSetItemValue(m_SetItemDic);
			item.Value.SetBuffValue(m_StatBuffList);
			item.Value.SetBuffPremiumValue(m_StatPremiumBuffList);
		}
		CreateBuffSetItem();
		CalcPvpRealtimeFieldSkillStats();
		CalcAwakeningNodeStats();
	}
