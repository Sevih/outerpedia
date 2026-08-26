// CBattleManager$$GetImmediatelyDotDamageCapBuffType — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBattleManager.cs.

	private static BUFF_TYPE GetImmediatelyDotDamageCapBuffType(BUFF_TYPE _eDotBuffType)
	{
		return _eDotBuffType switch
		{
			BUFF_TYPE.BT_DOT_BURN => BUFF_TYPE.BT_IMMEDIATELY_BURN_CAP, 
			BUFF_TYPE.BT_DOT_BLEED => BUFF_TYPE.BT_IMMEDIATELY_BLEED_CAP, 
			BUFF_TYPE.BT_DOT_POISON => BUFF_TYPE.BT_IMMEDIATELY_POISON_CAP, 
			BUFF_TYPE.BT_DOT_LIGHTNING => BUFF_TYPE.BT_IMMEDIATELY_LIGHTNING_CAP, 
			BUFF_TYPE.BT_DOT_CURSE => BUFF_TYPE.BT_IMMEDIATELY_CURSE_CAP, 
			BUFF_TYPE.BT_DOT_2000092 => BUFF_TYPE.BT_IMMEDIATELY_2000092_CAP, 
			_ => BUFF_TYPE.BT_NONE, 
		};
	}
