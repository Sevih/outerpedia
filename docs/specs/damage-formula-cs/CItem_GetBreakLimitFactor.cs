// CItem$$GetBreakLimitFactor — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItem.cs.

	public float GetBreakLimitFactor(byte _nBreakLimit)
	{
		if (_nBreakLimit == 0)
		{
			return 0f;
		}
		CItemBreakLimitTemplet breakLimitTemplet = CTempletManager.Instance.GetBreakLimitTemplet(BasicStar, ItemGrade);
		float num = 0f;
		for (int i = 0; i < _nBreakLimit; i++)
		{
			num += breakLimitTemplet.FactorArr[i];
		}
		return num;
	}
