// CCharacterData$$GetStatValuePermille — client Steam 1.4.17 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int GetStatValuePermille(STAT_TYPE _eStatType, int _nPermille)
	{
		if (_eStatType == STAT_TYPE.ST_NONE)
		{
			return 0;
		}
		int statValue = GetStatValue(_eStatType);
		Debug.LogWarning((object)("statValue : " + statValue));
		long num = (long)statValue * (long)_nPermille / 1000;
		Debug.LogWarning((object)("tempValue : " + num));
		if (num <= int.MaxValue)
		{
			return (int)num;
		}
		return int.MaxValue;
	}
