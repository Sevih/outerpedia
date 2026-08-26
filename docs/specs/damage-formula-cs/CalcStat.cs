// CFormula$$CalcStat — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcStat(int _nMinValue, int _nMaxValue, int _nLevel)
	{
		return (int)((long)(_nMaxValue - _nMinValue) * (long)(_nLevel - 1) / 99) + _nMinValue;
	}
