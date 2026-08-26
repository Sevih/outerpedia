// CCharacterData$$CalcArchiveStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcArchiveStats()
	{
		CCharacterArchiveStatTemplet characterArchiveStatTemplet = CTempletManager.Instance.GetCharacterArchiveStatTemplet(ArchiveStatID);
		if (characterArchiveStatTemplet != null)
		{
			m_StatDic[STAT_TYPE.ST_ATK].SetArchiveStatValue(characterArchiveStatTemplet.Atk_Rate);
			m_StatDic[STAT_TYPE.ST_DEF].SetArchiveStatValue(characterArchiveStatTemplet.Def_Rate);
			m_StatDic[STAT_TYPE.ST_HP].SetArchiveStatValue(characterArchiveStatTemplet.HP_Rate);
		}
	}
