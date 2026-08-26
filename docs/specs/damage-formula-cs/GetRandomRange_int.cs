// CFormula$$GetRandomRange — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.
// 2 surcharges, dans l'ordre du source.

	public static int GetRandomRange(int nMin, int nMax)
	{
		return Random.Range(nMin, nMax + 1);
	}

	public static float GetRandomRange(float min, float max)
	{
		return Random.Range(min, max);
	}
