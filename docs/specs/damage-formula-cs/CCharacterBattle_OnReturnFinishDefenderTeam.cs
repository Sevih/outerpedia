// CCharacterBattle$$OnReturnFinishDefenderTeam — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Roll de contre-attaque : CheckProbabilityPermille(CounterRate) après avoir été touché, S1 (§ 12.9).

	public void OnReturnFinishDefenderTeam()
	{
		OnReturnFinishAll();
		if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsPvpRealtime)
		{
			CDebug.LogWarning($"★ DefenderTeam: ID={base.ID}(UID={base.UID}), HitAttacker={(Object)(object)SkillRecord.HitAttacker != (Object)null}, HitAP={base.CharacterData.HitAP}, AP={AP}, ActionPoint={ActionPoint}");
		}
		if (Object.op_Implicit((Object)(object)SkillRecord.HitAttacker))
		{
			if (Object.op_Implicit((Object)(object)SkillRecord.HitAttacker) && 0 < base.CharacterData.HitAP)
			{
				if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsPvpRealtime)
				{
					CDebug.LogWarning($"★ DefenderTeam HitAP: ID={base.ID}(UID={base.UID}), AP={AP} → {AP + base.CharacterData.HitAP}");
				}
				AP += base.CharacterData.HitAP;
			}
			CBuff cBuff = FindBuffResourceCharage();
			if (cBuff != null)
			{
				CSkill cSkill = base.SkillManager.AddUniqueResource(cBuff.Value);
				if (IsOverNamed)
				{
					BossGauge?.UpdateUniqueResource(cSkill.Type, cSkill.UniqueResource, cSkill.MaxUniqueResource);
				}
			}
		}
		CBuff cBuff2 = FindBuffByType(BUFF_TYPE.BT_DMG_KILL_COUNT_STACK);
		if (cBuff2 != null)
		{
			bool flag = false;
			foreach (CCharacterBattle member in GetEnemyTeam().m_MemberList)
			{
				if (Object.op_Implicit((Object)(object)member) && 0 < member.SkillRecord.KillCount)
				{
					flag = true;
					break;
				}
			}
			if (flag)
			{
				cBuff2.SetStack();
			}
		}
		if (base.CharacterData == null || base.SkillManager == null)
		{
			return;
		}
		base.SkillManager.GetBuffListOnTurnEndDefender(out var _BuffTempletList);
		if (0 < _BuffTempletList.Count)
		{
			CBuffManager.Instance.CreateBuffList(_BuffTempletList, this, null, _bTargetEnemyOnly: false);
		}
		CCharacterBattle activeCharacter = CDungeonScene.Instance.GetActiveCharacter();
		if (Object.op_Implicit((Object)(object)activeCharacter) && activeCharacter.SkillRecord.IsSealCounter && activeCharacter.TeamType != base.TeamType && activeCharacter.CharacterData != null)
		{
			CDebug.LogWarning(base.CharacterData.Name + " sealer : " + activeCharacter.CharacterData.Name);
		}
		else if (Object.op_Implicit((Object)(object)activeCharacter) && activeCharacter.SkillRecord.IsSealCounterMyTeam && activeCharacter.TeamType == base.TeamType && activeCharacter.CharacterData != null)
		{
			CDebug.LogWarning(base.CharacterData.Name + " seal counter my team : " + activeCharacter.CharacterData.Name);
		}
		else
		{
			if (m_RageManager.IsBreak || !CanUseSkill())
			{
				return;
			}
			CBuff cBuff3 = FindBuffDefenderActionOnTurnEndNoCheck();
			if (cBuff3 != null)
			{
				CSkill skill = base.SkillManager.GetSkill(cBuff3.TargetSkillType);
				if (skill != null && skill.IsPassive && CanUseSkill(cBuff3.TargetSkillType))
				{
					TargetCharacter = skill.GetPassiveSkillTarget(this, TargetCharacter);
					if ((Object)null != (Object)(object)TargetCharacter)
					{
						CSingletonBehaviour<CBattleManager>.Instance.InsertCounterTurnQueue(this, skill.Type, TargetCharacter, cBuff3);
					}
					return;
				}
			}
			cBuff3 = FindBuffDefenderActionOnTurnEnd();
			if (cBuff3 != null)
			{
				CSkill skill2 = base.SkillManager.GetSkill(cBuff3.TargetSkillType);
				if (skill2 != null && skill2.IsPassive && CanUseSkill(cBuff3.TargetSkillType))
				{
					TargetCharacter = skill2.GetPassiveSkillTarget(this, TargetCharacter);
					if ((Object)null != (Object)(object)TargetCharacter)
					{
						CSingletonBehaviour<CBattleManager>.Instance.InsertCounterTurnQueue(this, skill2.Type, TargetCharacter, cBuff3);
					}
					return;
				}
			}
			cBuff3 = FindBuffDefenderActionOnTurnEndFirstSkill();
			if (cBuff3 != null && CanUseSkill())
			{
				CCharacterBattle turnOwner = GetEnemyTeam().GetTurnOwner();
				if ((Object)null != (Object)(object)turnOwner)
				{
					CSingletonBehaviour<CBattleManager>.Instance.InsertCounterTurnQueue(this, SKILL_TYPE.SKT_FIRST, turnOwner, cBuff3);
				}
			}
			else if (CheckSkillRecord(_bCheckLast: false, (CSkillRecord skillRecord) => Object.op_Implicit((Object)(object)skillRecord.HitAttacker)) && CFormula.CheckProbabilityPermille(base.CharacterData.CounterRate))
			{
				CCharacterBattle turnOwner2 = GetEnemyTeam().GetTurnOwner();
				if ((Object)null != (Object)(object)turnOwner2)
				{
					CSingletonBehaviour<CBattleManager>.Instance.InsertCounterTurnQueue(this, SKILL_TYPE.SKT_FIRST, turnOwner2, null);
				}
			}
		}
	}
