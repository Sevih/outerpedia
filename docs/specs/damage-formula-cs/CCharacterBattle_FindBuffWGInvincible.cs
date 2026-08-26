// CCharacterBattle$$FindBuffWGInvincible — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Garde BT_WG_INVINCIBLE de CalcDamageWG (§ 11).

	public CBuff FindBuffWGInvincible(CCharacterBattle _Attacker)
	{
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_WG_INVINCIBLE == buff.Type && buff.CheckAvailable(_Attacker))
			{
				return buff;
			}
		}
		return null;
	}
