// CCharacterBattle$$IsDotBuffType — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	private static bool IsDotBuffType(BUFF_TYPE _eDotBuffType)
	{
		if ((uint)(_eDotBuffType - 56) <= 6u)
		{
			return true;
		}
		return false;
	}
