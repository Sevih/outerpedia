// CStatValue$$SetMonadGateEnchantNodeStatValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.

	public void SetMonadGateEnchantNodeStatValue(List<CMonadGateEnchantNodeTemplet> _templetList)
	{
		m_nMonadEnchantValue = 0;
		m_nMonadEnchantValueRate = 0;
		if (_templetList == null)
		{
			return;
		}
		foreach (CMonadGateEnchantNodeTemplet _templet in _templetList)
		{
			if (m_eType == _templet.StatType)
			{
				switch (_templet.ApplyingType)
				{
				case OPTION_APPLYING_TYPE.OAT_ADD:
					m_IsDirty = true;
					m_nMonadEnchantValue += _templet.OptionValue;
					break;
				case OPTION_APPLYING_TYPE.OAT_RATE:
					m_nMonadEnchantValueRate = (int)m_nMonadEnchantValueRate + _templet.OptionValue;
					m_IsDirty = true;
					break;
				}
			}
		}
	}
