// CStatValue$$SetAwakeningNodeStatValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.

	public void SetAwakeningNodeStatValue(List<CCharacterAwakeningLevelTemplet> levelTempletList)
	{
		m_nAwakeningValue = 0;
		m_nAwakeningValueRate = 0;
		if (levelTempletList == null)
		{
			return;
		}
		foreach (CCharacterAwakeningLevelTemplet levelTemplet in levelTempletList)
		{
			if (m_eType == levelTemplet.StatType)
			{
				switch (levelTemplet.ApplyingType)
				{
				case OPTION_APPLYING_TYPE.OAT_ADD:
					m_IsDirty = true;
					m_nAwakeningValue += levelTemplet.OptionValue;
					break;
				case OPTION_APPLYING_TYPE.OAT_RATE:
					m_nAwakeningValueRate = (int)m_nAwakeningValueRate + levelTemplet.OptionValue;
					m_IsDirty = true;
					break;
				}
			}
		}
	}
