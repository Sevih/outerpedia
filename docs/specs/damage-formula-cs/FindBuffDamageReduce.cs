// CCharacterBattle$$FindBuffDamageReduce — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public void FindBuffDamageReduce(out int _nReduceDmgRate, CCharacterBattle _Attacker)
	{
		int num = 0;
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_DMG_REDUCE == buff.Type && buff.CheckAvailable(_Attacker))
			{
				if (OPTION_APPLYING_TYPE.OAT_RATE == buff.ApplyingType)
				{
					num += buff.Value;
					buff.MarkUsedHitOverThisSkill();
				}
			}
			else if (BUFF_TYPE.BT_STEALTHED == buff.Type && (Object)(object)_Attacker != (Object)null && _Attacker.SkillRecord.SkillRangeType != SKILL_RANGE_TYPE.SINGLE)
			{
				num += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_REDUCE_MY_TEAM_INCREASE == buff.Type && buff.CheckAvailable(_Attacker))
			{
				if ((Object)(object)buff.Owner == (Object)null || buff.Owner.CharacterData == null)
				{
					continue;
				}
				CTeam team = buff.Owner.GetTeam();
				if (team == null)
				{
					continue;
				}
				int num2 = 0;
				foreach (CCharacterBattle member in team.m_MemberList)
				{
					if (!((Object)(object)member == (Object)null) && member.IsAlive)
					{
						num2++;
					}
				}
				num += buff.Value * (num2 - 1);
				buff.MarkUsedHitOverThisSkill();
			}
			else if (BUFF_TYPE.BT_DOT_PUNISH == buff.Type && buff.CheckAvailable())
			{
				num += CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PUNISH_DMG_REDUCE_VALUE).Value;
			}
		}
		if ((Object)(object)_Attacker != (Object)null && _Attacker.FindBuffByType(BUFF_TYPE.BT_DOT_PUNISH) != null)
		{
			int value = CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PUNISH_DMG_REDUCE_VALUE).Value;
			num += value;
		}
		_nReduceDmgRate = num;
	}
