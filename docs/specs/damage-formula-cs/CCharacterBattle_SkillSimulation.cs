// CCharacterBattle$$SkillSimulation — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Mode simulateur (CPlayer.IsYSLSimulator) : la seule écriture du TotalSkillFactor de l'ATTAQUANT — le repli `num == 0` de CalcDamage (spec § 8.1).

	private void SkillSimulation()
	{
		List<CDamageTemplet> damageTempletBySkillID = CTempletManager.Instance.GetDamageTempletBySkillID(UsingSkill.ID);
		int num = 0;
		foreach (CDamageTemplet item in damageTempletBySkillID)
		{
			num += item.DamageFactor * ((item.MaxHitCount == 0) ? 1 : item.MaxHitCount);
		}
		SkillRecord.TotalSkillFactor = num;
		int num2 = 0;
		if (SKILL_TARGET_TEAM_TYPE.ENEMY == UsingSkill.TargetTeamType)
		{
			switch (SkillRecord.SkillRangeType)
			{
			case SKILL_RANGE_TYPE.ALL:
				foreach (CCharacterBattle member in GetEnemyTeam().m_MemberList)
				{
					if (Object.op_Implicit((Object)(object)member))
					{
						num2 += DamageSimulation(member, damageTempletBySkillID);
					}
				}
				break;
			case SKILL_RANGE_TYPE.DOUBLE:
			case SKILL_RANGE_TYPE.DOUBLE_SPEED:
				num2 += DamageSimulation(TargetCharacter, damageTempletBySkillID);
				num2 += DamageSimulation(SubTargetCharacter, damageTempletBySkillID);
				break;
			case SKILL_RANGE_TYPE.SINGLE:
				num2 += DamageSimulation(TargetCharacter, damageTempletBySkillID);
				break;
			}
		}
		CUIHudSimulator.Instance.Log(base.TeamType, "Play Skill [{0}] Type[{1}] Target[{2}] SubTarget[{3}] TotalDamage[{4}]", base.ID, UsingSkill.Type, TargetCharacter.ID, SubTargetCharacter?.ID, num2);
		EventCallStriker();
		EventSkillFinish();
	}
