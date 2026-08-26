// CFormula$$CheckProbability — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static bool CheckProbability(int _nValue, int _nMax, bool isAuto = false)
	{
		if (_nValue <= 0)
		{
			return false;
		}
		return _nValue >= (isAuto ? GetRandomRange(0, _nMax) : GetBattleRandomRange(0, _nMax));
	}
