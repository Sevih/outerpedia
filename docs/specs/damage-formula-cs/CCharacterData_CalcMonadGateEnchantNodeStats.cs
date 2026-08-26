// CCharacterData$$CalcMonadGateEnchantNodeStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcMonadGateEnchantNodeStats()
	{
		if (MonadGateEnchantNodeList == null)
		{
			return;
		}
		Dictionary<STAT_TYPE, List<CMonadGateEnchantNodeTemplet>> dictionary = new Dictionary<STAT_TYPE, List<CMonadGateEnchantNodeTemplet>>();
		foreach (CMonadGateEnchantNodeTemplet monadGateEnchantNode in MonadGateEnchantNodeList)
		{
			if (monadGateEnchantNode.OptionType == ITEM_OPTION_TYPE.IOT_STAT)
			{
				if (!dictionary.ContainsKey(monadGateEnchantNode.StatType))
				{
					dictionary.Add(monadGateEnchantNode.StatType, new List<CMonadGateEnchantNodeTemplet>());
				}
				dictionary[monadGateEnchantNode.StatType].Add(monadGateEnchantNode);
			}
		}
		foreach (KeyValuePair<STAT_TYPE, List<CMonadGateEnchantNodeTemplet>> item in dictionary)
		{
			if (m_StatDic.TryGetValue(item.Key, out var value))
			{
				value.SetMonadGateEnchantNodeStatValue(item.Value);
			}
		}
	}
