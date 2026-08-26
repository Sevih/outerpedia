// CFormula$$CheckProbabilityPermille — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static bool CheckProbabilityPermille(int _nPermilleValue, bool isAuto = false)
	{
		return CheckProbability(_nPermilleValue, 1000, isAuto);
	}
