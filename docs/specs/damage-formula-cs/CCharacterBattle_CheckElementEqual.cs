// CCharacterBattle$$CheckElementEqual — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Condition TARGET_ELEMENT : égalité stricte (§ 16.3).

	public bool CheckElementEqual(int _nValue)
	{
		if (base.CharacterData == null)
		{
			return false;
		}
		return base.CharacterData.Element == (CHARACTER_ELEMENT_TYPE)_nValue;
	}
