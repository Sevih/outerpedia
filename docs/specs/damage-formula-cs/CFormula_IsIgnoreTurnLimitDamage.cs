// CFormula$$IsIgnoreTurnLimitDamage — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static bool IsIgnoreTurnLimitDamage(CCharacterBattle _Attacker)
	{
		if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsWorldBoss && CDungeonScene.Instance.IsUseWorldBossSpecialAttack && (Object)(object)_Attacker != (Object)null)
		{
			return _Attacker.UID == 0;
		}
		return false;
	}
