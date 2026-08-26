// CCharacterBattle$$FindBuffElementDamageRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int FindBuffElementDamageRate()
	{
		int num = 0;
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_DMG_ELEMENT_ENCHANT == buff.Type && buff.CheckAvailable())
			{
				num += buff.Value;
			}
		}
		return num;
	}
