// CCharacterBattle$$FindBuffWGDamageReduce — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Agrégation add/rate des BT_WG_DMG (attaquant) − BT_WG_DMG_REDUCE (défenseur) — spec § 11 CalcDamageWG, lève § 12.3.

	public void FindBuffWGDamageReduce(out int _nAdd, out int _nRate, CCharacterBattle _Attacker)
	{
		_nAdd = (_nRate = 0);
		foreach (CBuff item in _Attacker.GetBuffListByType(BUFF_TYPE.BT_WG_DMG))
		{
			if (item.CheckAvailable(_Attacker))
			{
				switch (item.ApplyingType)
				{
				case OPTION_APPLYING_TYPE.OAT_ADD:
					_nAdd += item.Value;
					break;
				case OPTION_APPLYING_TYPE.OAT_RATE:
					_nRate += item.Value;
					break;
				}
			}
		}
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_WG_DMG_REDUCE == buff.Type && buff.CheckAvailable(_Attacker))
			{
				buff.PlayActivateEffect();
				switch (buff.ApplyingType)
				{
				case OPTION_APPLYING_TYPE.OAT_ADD:
					_nAdd -= buff.Value;
					break;
				case OPTION_APPLYING_TYPE.OAT_RATE:
					_nRate -= buff.Value;
					break;
				}
			}
		}
	}
