// CCharacterData$$get_Vampiric — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int Vampiric
	{
		get
		{
			CheckStatDirty();
			return m_StatDic[STAT_TYPE.ST_VAMPIRIC].GetFinalValue();
		}
	}
