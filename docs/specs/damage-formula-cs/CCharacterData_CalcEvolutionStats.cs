// CCharacterData$$CalcEvolutionStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcEvolutionStats()
	{
		Dictionary<STAT_TYPE, int> evolutionStat = GetEvolutionStat();
		foreach (KeyValuePair<STAT_TYPE, IStatValue> item in m_StatDic)
		{
			item.Value.SetEvolutionValue(evolutionStat);
		}
	}
