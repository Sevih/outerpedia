// CFormula$$GetElementeryDamageRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int GetElementeryDamageRate(CCharacterBattle _Attacker, CCharacterBattle _Defender)
	{
		int num = 1000;
		if (_Attacker.FindBuffElementSuperiority())
		{
			num = 1200;
		}
		else if (_Attacker.FindBuffElementInferiority())
		{
			num = 800;
		}
		else
		{
			ELEMENT_SUPERIORITY_TYPE elementSuperiority = GetElementSuperiority(_Attacker.CharacterData.Element, _Defender.CharacterData.Element);
			if (elementSuperiority == ELEMENT_SUPERIORITY_TYPE.ATTACKER_WIN)
			{
				num = 1200;
			}
			else if (ELEMENT_SUPERIORITY_TYPE.ATTACKER_LOSE == elementSuperiority)
			{
				num = 800;
			}
		}
		if (1200 == num)
		{
			int num2 = _Attacker.FindBuffElementDamageRate();
			num += num2;
		}
		return num;
	}
