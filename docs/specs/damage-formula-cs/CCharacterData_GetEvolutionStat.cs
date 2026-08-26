// CCharacterData$$GetEvolutionStat — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public Dictionary<STAT_TYPE, int> GetEvolutionStat(bool _bCheckTotal = true, int _nTargetEvolutionLevel = 0)
	{
		Dictionary<STAT_TYPE, int> dictionary = new Dictionary<STAT_TYPE, int>();
		foreach (CCharacterEvolutionStatTemplet characterEvolutionStatTemplet in CTempletManager.Instance.GetCharacterEvolutionStatTempletList(ID))
		{
			if (_bCheckTotal ? (characterEvolutionStatTemplet.EvolutionLevel <= EvolutionLevel) : (characterEvolutionStatTemplet.EvolutionLevel == _nTargetEvolutionLevel))
			{
				if (characterEvolutionStatTemplet.RewardStatType_1 != STAT_TYPE.ST_NONE)
				{
					AddEvolutionStatToDictionary(dictionary, characterEvolutionStatTemplet.RewardStatType_1, characterEvolutionStatTemplet.RewardValue_1);
				}
				if (characterEvolutionStatTemplet.RewardStatType_2 != STAT_TYPE.ST_NONE)
				{
					AddEvolutionStatToDictionary(dictionary, characterEvolutionStatTemplet.RewardStatType_2, characterEvolutionStatTemplet.RewardValue_2);
				}
				if (characterEvolutionStatTemplet.RewardStatType_3 != STAT_TYPE.ST_NONE)
				{
					AddEvolutionStatToDictionary(dictionary, characterEvolutionStatTemplet.RewardStatType_3, characterEvolutionStatTemplet.RewardValue_3);
				}
			}
		}
		return dictionary;
	}
