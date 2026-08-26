// CBattleManager$$ApplyImmediatelyDotDamageCap — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBattleManager.cs.

	private static int ApplyImmediatelyDotDamageCap(CCharacterBattle _Defender, BUFF_TYPE _eDotBuffType, int _nDamage)
	{
		if ((Object)(object)_Defender == (Object)null || _nDamage <= 0)
		{
			return _nDamage;
		}
		BUFF_TYPE immediatelyDotDamageCapBuffType = GetImmediatelyDotDamageCapBuffType(_eDotBuffType);
		if (immediatelyDotDamageCapBuffType != BUFF_TYPE.BT_NONE)
		{
			_nDamage = ApplyDamageCap(_Defender, immediatelyDotDamageCapBuffType, _nDamage);
		}
		return ApplyDamageCap(_Defender, BUFF_TYPE.BT_IMMEDIATELY_ALL_CAP, _nDamage);
	}
