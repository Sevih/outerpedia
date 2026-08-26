// CCharacterBattle$$GetBuffDamgeFinalReduce — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public void GetBuffDamgeFinalReduce(out int _nFinalReduceDmgRate, CCharacterBattle _Attacker)
	{
		_nFinalReduceDmgRate = 0;
		foreach (CBuff buff in m_BuffList)
		{
			if (buff == null || (Object)(object)buff.Owner == (Object)null)
			{
				continue;
			}
			if (buff.Type == BUFF_TYPE.BT_DMG_REDUCE_FINAL && buff.CheckAvailable(_Attacker) && _nFinalReduceDmgRate < buff.Value)
			{
				_nFinalReduceDmgRate = buff.Value;
				buff.MarkUsedHitOverThisSkill();
			}
			if (buff.Type == BUFF_TYPE.BT_DMG_REDUCE_FINAL_MY_TEAM_INCREASE && buff.CheckAvailable(_Attacker))
			{
				CTeam team = buff.Owner.GetTeam();
				if (team == null)
				{
					continue;
				}
				int num = 0;
				foreach (CCharacterBattle member in team.m_MemberList)
				{
					if (!((Object)(object)member == (Object)null) && member.IsAlive)
					{
						num++;
					}
				}
				int num2 = buff.Value * (num - 1);
				if (num2 > _nFinalReduceDmgRate)
				{
					_nFinalReduceDmgRate = num2;
					buff.MarkUsedHitOverThisSkill();
				}
			}
			if (buff.Type == BUFF_TYPE.BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL && _Attacker.SkillRecord.SkillType != SKILL_TYPE.SKT_FIRST && buff.CheckAvailable(_Attacker, _Attacker.SkillRecord.SkillType) && buff.Value > _nFinalReduceDmgRate)
			{
				_nFinalReduceDmgRate = buff.Value;
				buff.MarkUsedHitOverThisSkill();
			}
			if (buff.Type == BUFF_TYPE.BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL && _Attacker.SkillRecord.SkillType == SKILL_TYPE.SKT_FIRST)
			{
				buff.MarkUsedHitOverThisSkill();
			}
		}
	}
