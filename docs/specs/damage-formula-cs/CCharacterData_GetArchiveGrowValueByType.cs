// CCharacterData$$GetArchiveGrowValueByType — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int GetArchiveGrowValueByType(ARCHIVE_CHARACTER_TYPE _eType)
	{
		if (_eType >= ARCHIVE_CHARACTER_TYPE.ACT_STAR_3 && _eType <= ARCHIVE_CHARACTER_TYPE.ACT_STAR_6)
		{
			return Star;
		}
		if (_eType >= ARCHIVE_CHARACTER_TYPE.ACT_EVOLUTION_2 && _eType <= ARCHIVE_CHARACTER_TYPE.ACT_EVOLUTION_6)
		{
			return RealEvolutionLevel;
		}
		return 0;
	}
