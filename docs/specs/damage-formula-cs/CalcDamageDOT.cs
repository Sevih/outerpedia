// CFormula$$CalcDamageDOT — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcDamageDOT(CCharacterBattle _Attacker, CCharacterBattle _Defender, int _nAttackRate, int _nStatValue)
	{
		long num = (long)_nStatValue * (long)_nAttackRate;
		int num2 = Mathf.Min(1000, _Attacker.CharacterData.PiercePowerRate);
		int piercePower = _Attacker.CharacterData.PiercePower;
		long num3 = Math.Max(-999000L, (long)_Defender.CharacterData.Def * (long)(1000 - num2) - (long)piercePower * 1000L);
		long num4 = num * 1000000 / (1000000 + num3);
		int num5 = Mathf.Min(900, _Defender.CharacterData.DMGReduceRate);
		return (int)(num4 * (1000 - num5) / 1000 / 1000);
	}
