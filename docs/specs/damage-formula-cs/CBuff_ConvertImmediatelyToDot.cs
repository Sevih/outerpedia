// CBuff$$ConvertImmediatelyToDot — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.
// Note du manifeste : Détonation : BT_IMMEDIATELY_<TYPE> → BT_DOT_<TYPE> (§ 14.6).

	private BUFF_TYPE ConvertImmediatelyToDot(BUFF_TYPE _eBuffType)
	{
		BUFF_TYPE result = BUFF_TYPE.BT_NONE;
		switch (Type)
		{
		case BUFF_TYPE.BT_IMMEDIATELY_BURN:
			result = BUFF_TYPE.BT_DOT_BURN;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_BLEED:
			result = BUFF_TYPE.BT_DOT_BLEED;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_POISON:
			result = BUFF_TYPE.BT_DOT_POISON;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_LIGHTNING:
			result = BUFF_TYPE.BT_DOT_LIGHTNING;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_CURSE:
			result = BUFF_TYPE.BT_DOT_CURSE;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_2000092:
			result = BUFF_TYPE.BT_DOT_2000092;
			break;
		case BUFF_TYPE.BT_IMMEDIATELY_PUNISH:
			result = BUFF_TYPE.BT_DOT_PUNISH;
			break;
		}
		return result;
	}
