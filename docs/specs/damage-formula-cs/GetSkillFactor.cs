// CSkillManager$$GetSkillFactor — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CSkillManager.cs.

	public int GetSkillFactor()
	{
		return GetCurrentSkill()?.DamageFactor ?? 0;
	}
