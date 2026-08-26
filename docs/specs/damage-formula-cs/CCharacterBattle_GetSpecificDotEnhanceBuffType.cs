// CCharacterBattle$$GetSpecificDotEnhanceBuffType — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	private static BUFF_TYPE GetSpecificDotEnhanceBuffType(BUFF_TYPE _eDotBuffType)
	{
		return _eDotBuffType switch
		{
			BUFF_TYPE.BT_DOT_BURN => BUFF_TYPE.BT_BURN_ENHANCE, 
			BUFF_TYPE.BT_DOT_BLEED => BUFF_TYPE.BT_BLEED_ENHANCE, 
			BUFF_TYPE.BT_DOT_POISON => BUFF_TYPE.BT_POISON_ENHANCE, 
			BUFF_TYPE.BT_DOT_LIGHTNING => BUFF_TYPE.BT_LIGHTNING_ENHANCE, 
			BUFF_TYPE.BT_DOT_CURSE => BUFF_TYPE.BT_CURSE_ENHANCE, 
			BUFF_TYPE.BT_DOT_2000092 => BUFF_TYPE.BT_2000092_ENHANCE, 
			BUFF_TYPE.BT_DOT_PUNISH => BUFF_TYPE.BT_PUNISH_ENHANCE, 
			_ => BUFF_TYPE.BT_NONE, 
		};
	}
