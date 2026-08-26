// CCustomBossStatValue$$SetBaseValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCustomBossStatValue.cs.

	public override void SetBaseValue(int _MinValue, int _MaxValue, int _nLevel, int _nSpawnAdvantageRate = 0, int addRate = 0, CCharacterData _OwnerCharacter = null)
	{
		if (m_eType == STAT_TYPE.ST_HP)
		{
			m_nBaseValue = _MaxValue - _MinValue;
		}
		else
		{
			m_nBaseValue = CFormula.CalcStat(_MinValue, _MaxValue, _nLevel);
		}
		m_IsDirty = true;
	}
