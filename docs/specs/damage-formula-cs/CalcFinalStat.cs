// CFormula$$CalcFinalStat — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcFinalStat(int _nBaseValue, int _nSpawnAdvantageRate, int _nEvolutionValue, int _nAwakeningValue, int _nAwakeningValueRate, int _nMonadEnchantValue, int _nMonadEnchantValueRate, int _nTranscendentStarValueRate, int _nArchiveStatValueRate, int _ItemOptionValue, int _ItemOptionValueRate, int _nBuffValue, int _nBuffValueRate)
	{
		long num = ((long)(_nBaseValue + _nEvolutionValue + _nAwakeningValue + _nMonadEnchantValue) * (long)(1000 + _nSpawnAdvantageRate + _nTranscendentStarValueRate + _ItemOptionValueRate + _nAwakeningValueRate + _nMonadEnchantValueRate) / 1000 + _ItemOptionValue + _nBuffValue) * (1000 + _nBuffValueRate) / 1000 + (long)_nBaseValue * (long)_nArchiveStatValueRate / 1000;
		return Mathf.Max(0, (int)num);
	}
