// CCharacterData$$CalcAwakeningNodeStats — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void CalcAwakeningNodeStats()
	{
		if (AwakeningNodeList == null)
		{
			return;
		}
		List<CBuffTemplet> list = new List<CBuffTemplet>();
		Dictionary<STAT_TYPE, List<CCharacterAwakeningLevelTemplet>> dictionary = new Dictionary<STAT_TYPE, List<CCharacterAwakeningLevelTemplet>>();
		foreach (CAwakeningNodeData awakeningNode in AwakeningNodeList)
		{
			if (awakeningNode.NodeTemplet.AwakeningType == AWAKENING_TYPE.UTILITY || !CheckNodeApply(awakeningNode))
			{
				continue;
			}
			switch (awakeningNode.LevelTemplet.OptionType)
			{
			case ITEM_OPTION_TYPE.IOT_STAT:
				if (!dictionary.ContainsKey(awakeningNode.LevelTemplet.StatType))
				{
					dictionary.Add(awakeningNode.LevelTemplet.StatType, new List<CCharacterAwakeningLevelTemplet>());
				}
				dictionary[awakeningNode.LevelTemplet.StatType].Add(awakeningNode.LevelTemplet);
				break;
			case ITEM_OPTION_TYPE.IOT_BUFF:
				foreach (string buffID in awakeningNode.LevelTemplet.BuffIDList)
				{
					CBuffTemplet buffTemplet = CBuffTempletContainer.Instance.GetBuffTemplet(buffID, 1);
					if (buffTemplet != null)
					{
						list.Add(buffTemplet);
					}
				}
				break;
			}
		}
		foreach (KeyValuePair<STAT_TYPE, List<CCharacterAwakeningLevelTemplet>> item in dictionary)
		{
			if (m_StatDic.TryGetValue(item.Key, out var value))
			{
				value.SetAwakeningNodeStatValue(item.Value);
			}
		}
		SkillManager.SetAwakeningNodeBuffTempletList(list);
	}
