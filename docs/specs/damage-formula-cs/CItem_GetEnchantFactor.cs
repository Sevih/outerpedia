// CItem$$GetEnchantFactor — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItem.cs.

	public float GetEnchantFactor(byte _nEnchantLevel)
	{
		float num = 0f;
		List<CItemEnchantTemplet> enchantTempletList = CTempletManager.Instance.GetEnchantTempletList(ItemSubType);
		int i = 0;
		for (int count = enchantTempletList.Count; i < count; i++)
		{
			if (0 < enchantTempletList[i].EnchantLevel)
			{
				if (_nEnchantLevel < enchantTempletList[i].EnchantLevel)
				{
					break;
				}
				num += enchantTempletList[i].UpgradeFactorforOP;
			}
		}
		return num;
	}
