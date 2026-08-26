// CBuff$$CheckReverseHealCAP — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.

	private int CheckReverseHealCAP(int _nFinalValue)
	{
		foreach (CBuff item in Owner.GetBuffListByType(BUFF_TYPE.BT_REVERSE_HEAL_CAP))
		{
			if (item != null && item.CheckCondition() && _nFinalValue > item.Value)
			{
				return item.Value;
			}
		}
		return _nFinalValue;
	}
