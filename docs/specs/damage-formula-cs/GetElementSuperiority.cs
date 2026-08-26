// CFormula$$GetElementSuperiority — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static ELEMENT_SUPERIORITY_TYPE GetElementSuperiority(CHARACTER_ELEMENT_TYPE _eAttackerElement, CHARACTER_ELEMENT_TYPE _eDefenderElement)
	{
		if (CHARACTER_ELEMENT_TYPE.CET_FIRE >= _eAttackerElement && CHARACTER_ELEMENT_TYPE.CET_FIRE >= _eDefenderElement)
		{
			int num = 3;
			if ((int)(_eAttackerElement + 1) % num == (int)_eDefenderElement)
			{
				return ELEMENT_SUPERIORITY_TYPE.ATTACKER_WIN;
			}
			if ((int)(_eDefenderElement + 1) % num == (int)_eAttackerElement)
			{
				return ELEMENT_SUPERIORITY_TYPE.ATTACKER_LOSE;
			}
			return ELEMENT_SUPERIORITY_TYPE.EQUAL;
		}
		if (CHARACTER_ELEMENT_TYPE.CET_LIGHT <= _eAttackerElement && CHARACTER_ELEMENT_TYPE.CET_LIGHT <= _eDefenderElement)
		{
			if (_eAttackerElement != _eDefenderElement)
			{
				return ELEMENT_SUPERIORITY_TYPE.ATTACKER_WIN;
			}
			return ELEMENT_SUPERIORITY_TYPE.EQUAL;
		}
		return ELEMENT_SUPERIORITY_TYPE.EQUAL;
	}
