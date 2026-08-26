// CStatValue$$CalcPcExtendedBaseValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.
// Note du manifeste : Post-100 des PC (spec § 3.2) — l'ASM l'inlinait dans SetBaseValue, le C# la nomme.

	private static int CalcPcExtendedBaseValue(int _MinValue, int _MaxValue, int _nLevel, int correctionRate)
	{
		int num = _MaxValue - _MinValue;
		int num2 = 99;
		int num3 = Mathf.Max(_nLevel - 100, 0);
		int num4 = (int)((long)num * (long)(_nLevel - 1) / num2) + _MinValue;
		int num5 = (int)((long)num * (long)correctionRate * num3 / 1000 / num2);
		return num4 + num5;
	}
