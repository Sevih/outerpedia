// CStatValue$$SetBaseValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.
// 2 surcharges, dans l'ordre du source.
// Note du manifeste : Le listing porte les deux surcharges ; la spec § 9 cite la complète (int, int, int, int, int, CCharacterData).

	public virtual void SetBaseValue(int value)
	{
		m_nBaseValue = value;
		m_IsDirty = true;
	}

	public virtual void SetBaseValue(int _MinValue, int _MaxValue, int _nLevel, int _nSpawnAdvantageRate = 0, int addRate = 0, CCharacterData _OwnerCharacter = null)
	{
		if (_OwnerCharacter != null)
		{
			OwnerCharacter = _OwnerCharacter;
		}
		if (OwnerCharacter != null && OwnerCharacter.Type == CHARACTER_TYPE.CT_PC && _nLevel > 100)
		{
			int levelUpStatModifierAfter = OwnerCharacter.LevelUpStatModifierAfter100;
			m_nBaseValue = CalcPcExtendedBaseValue(_MinValue, _MaxValue, _nLevel, levelUpStatModifierAfter);
		}
		else
		{
			m_nBaseValue = CFormula.CalcStat(_MinValue, _MaxValue, _nLevel);
		}
		if (addRate > 0)
		{
			m_nBaseValue = CCommonDefine.ApplyRate(m_nBaseValue, addRate);
		}
		m_nSpawnAdvantageRate = _nSpawnAdvantageRate;
		m_IsDirty = true;
	}
