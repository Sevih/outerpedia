// CCharacterBattle$$FindBuffEnemyTeamDecreaseDamageRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int FindBuffEnemyTeamDecreaseDamageRate()
	{
		int num = 0;
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_DMG_ENEMY_TEAM_DECREASE == buff.Type && buff.CheckAvailable())
			{
				num += buff.Value;
			}
		}
		return num;
	}
