// CCharacterBattle$$CheckElementWin — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Conditions ATTACKER_ELEMENT_WIN/EQUAL/LOSE (§ 16.3) — supériorité forcée prise en compte, pas l'infériorité.

	public ELEMENT_SUPERIORITY_TYPE CheckElementWin(CCharacterBattle _Attacker)
	{
		if (Object.op_Implicit((Object)(object)_Attacker) && _Attacker.FindBuffElementSuperiority())
		{
			return ELEMENT_SUPERIORITY_TYPE.ATTACKER_WIN;
		}
		return CFormula.GetElementSuperiority(_Attacker.CharacterData.Element, base.CharacterData.Element);
	}
