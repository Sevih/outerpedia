// CItem$$InitializeOptionData — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItem.cs.
// 2 surcharges, dans l'ordre du source.
// Note du manifeste : Le listing porte les deux surcharges ; la spec cite l'implémentation (4 args), pas le raccourci à 1 argument.

	public void InitializeOptionData(WSItemData _ItemData)
	{
		InitializeOptionData(_ItemData?.OptionList ?? null, _ItemData?.SubOptionList ?? null, _ItemData?.SingularityOptionID ?? 0);
	}

	public void InitializeOptionData(List<int> MainOptionList, List<WSSubOption> SubOptionList, int SingularityOptionID = 0)
	{
		m_MainOptionList.Clear();
		m_SubOptionList.Clear();
		m_SubOptionListForGemIndex.Clear();
		m_UniqueOptionList.Clear();
		if (Templet.ItemSubType == ITEM_SUB_TYPE.ITS_EQUIP_EXCLUSIVE && EnchantLevel > 0)
		{
			CItemOptionTemplet cItemOptionTemplet = CTempletManager.Instance.GetItemOptionTempletFromGroup(Templet.ID).FirstOrDefault();
			m_ExclusiveStatOption = new CItemSubOptionData(cItemOptionTemplet.ID, 0, EnchantLevel);
		}
		if (MainOptionList != null)
		{
			float enchantFactor = GetEnchantFactor(EnchantLevel);
			float breakLimitFactor = GetBreakLimitFactor(BreakLimitCount);
			float singularityFactor = GetSingularityFactor(SingularityStep, SingularityLevel);
			foreach (int MainOption in MainOptionList)
			{
				if (0 < MainOption)
				{
					CItemMainOption item = new CItemMainOption(MainOption, enchantFactor, breakLimitFactor, this, singularityFactor);
					m_MainOptionList.Add(item);
				}
			}
		}
		if (SubOptionList != null)
		{
			foreach (WSSubOption SubOption in SubOptionList)
			{
				int optionID = SubOption.OptionID;
				m_SubOptionListForGemIndex.Add(optionID);
				if (0 < optionID)
				{
					CItemSubOptionData item2 = new CItemSubOptionData(SubOption.OptionID, SubOption.BaseLevel, SubOption.Level);
					m_SubOptionList.Add(item2);
				}
			}
		}
		foreach (int uniqueOptionID in Templet.UniqueOptionIDList)
		{
			if (0 >= uniqueOptionID)
			{
				continue;
			}
			CItemSpecialOptionTemplet itemSetOptionTemplet = CTempletManager.Instance.GetItemSpecialOptionTemplet(uniqueOptionID);
			if (itemSetOptionTemplet == null)
			{
				CDebug.LogError($"itemSetOptionTemplet is null !! : {uniqueOptionID}");
				continue;
			}
			int num = 1 + BreakLimitCount;
			if (IsSpecialItemEnchantable())
			{
				num = itemSetOptionTemplet.Level;
				int num2 = ((EnchantLevel == 0) ? 1 : EnchantLevel);
				if (itemSetOptionTemplet.Level > num2)
				{
					continue;
				}
				if (!itemSetOptionTemplet.IsAdd)
				{
					m_UniqueOptionList.RemoveAll((CItemSpecialOption _) => _.Templet.GroupID == itemSetOptionTemplet.GroupID && _.Templet.Level < itemSetOptionTemplet.Level);
				}
			}
			CItemSpecialOption item3 = new CItemSpecialOption(itemSetOptionTemplet.ID, (byte)num, _bCustomCraft: false);
			m_UniqueOptionList.Add(item3);
		}
		if (SingularityOptionID > 0)
		{
			m_SingularityOption = new CItemSpecialOption(SingularityOptionID, 1, _bCustomCraft: false);
		}
		if (m_MainOptionList != null && m_MainOptionList.Count > 0)
		{
			float num3 = GetBasicGradePoint() * GetBasicStarPoint() * GetBreakLimitPoint();
			AutoEquipPointMain = num3 * (float)(EnchantLevel - 1) * 0.08f + num3 / 5f;
		}
		else
		{
			AutoEquipPointMain = 0f;
		}
	}
