// CSkillManager$$CheckItemBuffCool — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CSkillManager.cs.

	public bool CheckItemBuffCool(CBuffTemplet _BuffTemplet)
	{
		if (!m_EquipItemBuffCoolList.ContainsKey(_BuffTemplet.BuffID))
		{
			return true;
		}
		CCustomBuffCool cCustomBuffCool = m_EquipItemBuffCoolList[_BuffTemplet.BuffID];
		if (cCustomBuffCool.CanUse())
		{
			cCustomBuffCool.Zero();
			return true;
		}
		return false;
	}
