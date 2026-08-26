// CStatValue$$SetFinalValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.

	private void SetFinalValue()
	{
		if (STAT_TYPE.ST_CRITICAL_RATE == m_eType)
		{
			(int, int) criticalStatBuffValues = OwnerCharacter.GetCriticalStatBuffValues(_bCheckPassive: true);
			int num = CFormula.CalcFinalStat(m_nBaseValue, m_nSpawnAdvantageRate, m_nEvolutionValue, m_nAwakeningValue, m_nAwakeningValueRate, m_nMonadEnchantValue, m_nMonadEnchantValueRate, m_nTranscendentStarValueRate, m_nArchiveStatValueRate, m_nItemOptionValue, m_nItemOptionValueRate, criticalStatBuffValues.Item1, criticalStatBuffValues.Item2);
			num = Mathf.Clamp(num, 0, 1000);
			criticalStatBuffValues = OwnerCharacter.GetCriticalStatBuffValues(_bCheckPassive: false);
			m_nFinalValue = Mathf.Max(0, CCommonDefine.ApplyRate(num + criticalStatBuffValues.Item1, criticalStatBuffValues.Item2));
		}
		else
		{
			m_nFinalValue = CFormula.CalcFinalStat(m_nBaseValue, m_nSpawnAdvantageRate, m_nEvolutionValue, m_nAwakeningValue, m_nAwakeningValueRate, m_nMonadEnchantValue, m_nMonadEnchantValueRate, m_nTranscendentStarValueRate, m_nArchiveStatValueRate, m_nItemOptionValue, m_nItemOptionValueRate, m_nBuffValue, m_nBuffValueRate);
		}
		m_nEquipIncrementValue = m_nFinalValue - CFormula.CalcFinalStat(m_nBaseValue, m_nSpawnAdvantageRate, m_nEvolutionValue, m_nAwakeningValue, m_nAwakeningValueRate, 0, 0, 0, 0, 0, 0, 0, 0);
		m_nFinalValue += m_nPvpRealtimeFieldSkillValue;
		if (Type == STAT_TYPE.ST_CRITICAL_RATE)
		{
			m_nFinalValue = Mathf.Clamp(m_nFinalValue, 0, 1000);
		}
		m_IsDirty = false;
	}
