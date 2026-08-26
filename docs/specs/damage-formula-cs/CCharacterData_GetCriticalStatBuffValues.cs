// CCharacterData$$GetCriticalStatBuffValues — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.
// Note du manifeste : Branche crit de SetFinalValue : buffs passifs DANS CalcFinalStat puis cap 1000, actifs APRÈS (§ 16, lève § 12.11).

	public (int addValue, int rateValue) GetCriticalStatBuffValues(bool _bCheckPassive)
	{
		int addValue = 0;
		int rateValue = 0;
		foreach (CBuff statBuff in m_StatBuffList)
		{
			if (statBuff != null && statBuff.Templet != null && statBuff.StatType == STAT_TYPE.ST_CRITICAL_RATE)
			{
				CheckIsPassiveCreateType(statBuff.Templet, _bCheckPassive, statBuff.IsUseInstanceValue ? statBuff.InstanceValue : statBuff.Value);
			}
		}
		foreach (CBuffTemplet statPremiumBuff in m_StatPremiumBuffList)
		{
			if (statPremiumBuff != null && statPremiumBuff.StatType == STAT_TYPE.ST_CRITICAL_RATE)
			{
				CheckIsPassiveCreateType(statPremiumBuff, _bCheckPassive, statPremiumBuff.Value);
			}
		}
		return (addValue: addValue, rateValue: rateValue);
		void CheckIsPassiveCreateType(CBuffTemplet _buffTemplet, bool flag, int value)
		{
			if ((_buffTemplet.BuffCreateType == BUFF_CREATE_TYPE.PASSIVE || _buffTemplet.BuffCreateType == BUFF_CREATE_TYPE.PASSIVE2 || _buffTemplet.BuffCreateType == BUFF_CREATE_TYPE.ON_SPAWN || _buffTemplet.BuffCreateType == BUFF_CREATE_TYPE.ON_SPAWN2) == flag)
			{
				if (_buffTemplet.ApplyingType == OPTION_APPLYING_TYPE.OAT_ADD)
				{
					addValue += value;
				}
				else if (_buffTemplet.ApplyingType == OPTION_APPLYING_TYPE.OAT_RATE)
				{
					rateValue += value;
				}
			}
		}
	}
