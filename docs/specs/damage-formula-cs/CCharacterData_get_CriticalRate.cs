// CCharacterData$$get_CriticalRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int CriticalRate
	{
		get
		{
			CheckStatDirty();
			return m_StatDic[STAT_TYPE.ST_CRITICAL_RATE].GetFinalValue();
		}
	}
