// CCharacterBattle$$GetLostHPRateValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// 2 surcharges, dans l'ordre du source.

	public int GetLostHPRateValue(int _nValue)
	{
		if (base.CharacterData.MaxHP <= 0)
		{
			return 0;
		}
		return (int)((long)(base.CharacterData.MaxHP - HP) * (long)_nValue / base.CharacterData.MaxHP);
	}

	public int GetLostHPRateValue(int _nHP, int _nValue)
	{
		if (base.CharacterData.MaxHP <= 0)
		{
			return 0;
		}
		return (int)((long)(base.CharacterData.MaxHP - _nHP) * (long)_nValue / base.CharacterData.MaxHP);
	}
