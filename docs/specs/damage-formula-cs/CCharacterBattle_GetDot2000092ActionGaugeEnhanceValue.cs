// CCharacterBattle$$GetDot2000092ActionGaugeEnhanceValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int GetDot2000092ActionGaugeEnhanceValue()
	{
		int nPermille = 50;
		int num = 0;
		foreach (CBuff item in GetBuffListByType(BUFF_TYPE.BT_ACTION_GAUGE_ENHANCE))
		{
			num += item.Value;
		}
		int num2 = CCommonDefine.MulPermille(CCommonDefine.MAX_ACTION_POINT, nPermille);
		if (num != 0)
		{
			return CCommonDefine.ApplyRate(num2, num);
		}
		return num2;
	}
