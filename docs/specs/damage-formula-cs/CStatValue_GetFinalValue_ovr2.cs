// CSkillDungeonStatValue$$GetFinalValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CSkillDungeonStatValue.cs.

	public override int GetFinalValue()
	{
		if (m_eType == STAT_TYPE.ST_SPEED)
		{
			return 0;
		}
		return base.GetFinalValue();
	}
