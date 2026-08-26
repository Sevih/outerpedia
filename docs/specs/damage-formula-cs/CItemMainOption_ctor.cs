// CItemMainOption$$.ctor — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItemMainOption.cs.
// 2 surcharges, dans l'ordre du source.

	public CItemMainOption(int _nID, float _fEnchant, float _fBreakLimitFactor, CItem item = null, float _fSingularityFactor = 0f)
		: base(_nID)
	{
		base.ClassType = ITEM_OPTION_CLASS.MAIN;
		EnchantFactor = _fEnchant * 1000f / 1000f;
		BreakLimitFactor = _fBreakLimitFactor * 1000f / 1000f;
		SingularityFactor = _fSingularityFactor * 1000f / 1000f;
		if (base.Templet != null && IsBuffOption)
		{
			if (item != null && item.IsSpecialItemEnchantable())
			{
				BuffTemplet = CBuffTempletContainer.Instance.GetBuffTemplet(base.Templet.BuffID, (byte)(item.EnchantLevel + 1));
			}
			else
			{
				BuffTemplet = CBuffTempletContainer.Instance.GetBuffTemplet(base.Templet.BuffID, 1);
			}
		}
	}

	public CItemMainOption(List<CItemOptionTemplet> optionList)
		: this((optionList.Count == 1) ? optionList[0].ID : 0, 0f, 0f)
	{
		if (optionList.Count > 1)
		{
			RandomOptionList = optionList;
		}
	}
