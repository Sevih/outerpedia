// CCharacterBattle$$GetDotDamageIncreaseBuffValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int GetDotDamageIncreaseBuffValue(BUFF_TYPE _eDotBuffType)
	{
		if (!IsDotBuffType(_eDotBuffType))
		{
			return 0;
		}
		int num = 0;
		BUFF_TYPE specificDotEnhanceBuffType = GetSpecificDotEnhanceBuffType(_eDotBuffType);
		bool flag = IsCommonDotEnhanceTarget(_eDotBuffType);
		foreach (CBuff buff in BuffList)
		{
			if (buff != null && ((specificDotEnhanceBuffType != BUFF_TYPE.BT_NONE && buff.Type == specificDotEnhanceBuffType) || (flag && buff.Type == BUFF_TYPE.BT_ENHANCE_COMMON) || buff.Type == BUFF_TYPE.BT_ENHANCE_ALL) && buff.CheckCondition(this))
			{
				num += buff.Value;
			}
		}
		return num;
	}
