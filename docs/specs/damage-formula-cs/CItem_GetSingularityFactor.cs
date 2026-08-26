// CItem$$GetSingularityFactor — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItem.cs.

	public float GetSingularityFactor(byte _nSingularityStep, byte _nSingularityLevel)
	{
		if (_nSingularityStep == 0)
		{
			return 0f;
		}
		CSingularityEquipEnchantTemplet singularityEquipEnchantTemplet = CTempletManager.Instance.GetSingularityEquipEnchantTemplet(Templet.ItemSubType, SINGULARITY_ENCHANT_TYPE.SET_ENCHANT);
		List<CSingularityEquipEnchantTemplet> singularityEquipEnchantTemplets = CTempletManager.Instance.GetSingularityEquipEnchantTemplets(Templet.ItemSubType, SINGULARITY_ENCHANT_TYPE.SET_EQUIP_ENHANCE, _nSingularityLevel);
		float num = 0f;
		if (singularityEquipEnchantTemplet != null)
		{
			num += singularityEquipEnchantTemplet.UpgradeFactorforOP;
		}
		for (int i = 0; i < singularityEquipEnchantTemplets.Count; i++)
		{
			num += singularityEquipEnchantTemplets[i].UpgradeFactorforOP;
		}
		return num;
	}
