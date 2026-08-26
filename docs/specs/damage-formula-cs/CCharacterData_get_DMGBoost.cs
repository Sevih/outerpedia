// CCharacterData$$get_DMGBoost — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int DMGBoost
	{
		get
		{
			CheckStatDirty();
			return m_StatDic[STAT_TYPE.ST_DMG_BOOST].GetFinalValue();
		}
	}
