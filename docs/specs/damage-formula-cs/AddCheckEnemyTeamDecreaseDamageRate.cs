// CFormula$$AddCheckEnemyTeamDecreaseDamageRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static void AddCheckEnemyTeamDecreaseDamageRate(CCharacterBattle _Attacker, int _nDecreaseTargetCount, ref int _nDamageRate)
	{
		_nDamageRate += _nDecreaseTargetCount * _Attacker.FindBuffEnemyTeamDecreaseDamageRate();
	}
