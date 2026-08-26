// CCommonDefine$$ApplyRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCommonDefine.cs.

	public static int ApplyRate(int _nValue, int _nRate)
	{
		return (int)((long)_nValue * (long)(1000 + _nRate) / 1000);
	}
