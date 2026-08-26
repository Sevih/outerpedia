// CCharacterData$$CalcTranscendentStarStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcTranscendentStarStats()
	{
		CCharacterTranscendentTemplet characterTranscendent = CTempletManager.Instance.GetCharacterTranscendent(Templet.BasicStar, Star, ID);
		if (characterTranscendent != null)
		{
			m_StatDic[STAT_TYPE.ST_HP].SetTranscendentStarValue(characterTranscendent.RewardHPRate);
			m_StatDic[STAT_TYPE.ST_ATK].SetTranscendentStarValue(characterTranscendent.RewardAtkRate);
			m_StatDic[STAT_TYPE.ST_DEF].SetTranscendentStarValue(characterTranscendent.RewardDefRate);
		}
	}
