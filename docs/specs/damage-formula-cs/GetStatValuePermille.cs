// CCharacterData$$GetStatValuePermille — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int GetStatValuePermille(STAT_TYPE _eStatType, int _nPermille)
	{
		if (_eStatType == STAT_TYPE.ST_NONE)
		{
			return 0;
		}
		long num = (long)GetStatValue(_eStatType) * (long)_nPermille / 1000;
		if (num <= int.MaxValue)
		{
			return (int)num;
		}
		return int.MaxValue;
	}
