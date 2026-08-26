// CCustomBossStatValue$$GetFinalValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCustomBossStatValue.cs.

	public override int GetFinalValue()
	{
		if (m_eType == STAT_TYPE.ST_HP)
		{
			return GetBaseValue();
		}
		return base.GetFinalValue();
	}
