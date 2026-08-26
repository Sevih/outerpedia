// CCharacterData$$get_HitHPRecovery — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int HitHPRecovery
	{
		get
		{
			CheckStatDirty();
			return m_StatDic[STAT_TYPE.ST_HIT_HP_RECOVERY].GetFinalValue();
		}
	}
