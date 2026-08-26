// CFormula$$CheckProbabilityPercent — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static bool CheckProbabilityPercent(int _nPercentValue, bool isAuto = false)
	{
		return CheckProbability(_nPercentValue, 100, isAuto);
	}
