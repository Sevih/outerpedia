// CBuff$$OnCreate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.

	public bool OnCreate()
	{
		int num = Value;
		switch (Type)
		{
		case BUFF_TYPE.BT_FREEZE:
		case BUFF_TYPE.BT_STONE:
		case BUFF_TYPE.BT_STUN:
		case BUFF_TYPE.BT_GOLDEN_CURSE:
			Owner.SetCCFreeze(BuffCCType);
			if (Type == BUFF_TYPE.BT_STUN)
			{
				Owner.PlayAnimation(ANIMATION_TYPE.BATTLE_STUN);
			}
			break;
		case BUFF_TYPE.BT_HEAL_BASED_CASTER:
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Caster.CharacterData.GetStatValuePermille(StatType, Value);
				if (CDungeonScene.Instance.IsPvp || CDungeonScene.Instance.IsPvpRealtime)
				{
					num = CCommonDefine.MulPermille(num, 1000 - CDungeonScene.Instance.PvpHealReduceRate);
				}
			}
			num = Owner.AddHP(num, _bHeal: true);
			Owner.SkillRecord.Heal += num;
			Owner.GetTeam().AddTotalHeal(Caster.UID, num);
			CDungeonScene.Instance.Hud.PlayHudTextDamage(num, _IsHeal: true, _IsCritical: false, ((Component)Owner).transform, _IsBreak: false);
			if (Owner.GetTeam().TeamType == TEAM_TYPE.USER)
			{
				CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(DUNGEON_MISSION_TYPE.DMT_USED_HEAL);
				CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(DUNGEON_MISSION_TYPE.DMT_USED_BURST_HEAL, Owner);
			}
			break;
		case BUFF_TYPE.BT_HEAL_BASED_TARGET:
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Owner.CharacterData.GetStatValuePermille(StatType, Value);
				if (CDungeonScene.Instance.IsPvp || CDungeonScene.Instance.IsPvpRealtime)
				{
					num = CCommonDefine.MulPermille(num, 1000 - CDungeonScene.Instance.PvpHealReduceRate);
				}
			}
			num = Owner.AddHP(num, _bHeal: true);
			Owner.SkillRecord.Heal += num;
			Owner.GetTeam().AddTotalHeal(Caster.UID, num);
			CDungeonScene.Instance.Hud.PlayHudTextDamage(num, _IsHeal: true, _IsCritical: false, ((Component)Owner).transform, _IsBreak: false);
			if (Owner.GetTeam().TeamType == TEAM_TYPE.USER)
			{
				CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(DUNGEON_MISSION_TYPE.DMT_USED_HEAL);
				CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(DUNGEON_MISSION_TYPE.DMT_USED_BURST_HEAL, Caster);
			}
			break;
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER:
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL:
		{
			bool flag4 = Type == BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL;
			if (Owner.FindBuffByType(BUFF_TYPE.BT_INVINCIBLE) != null)
			{
				Owner.PlayBuffEffect(null, null, new Symbol("SYS_BUFF_INVINCIBLE"), _IsDebuff: false);
				break;
			}
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Caster.CharacterData.GetStatValuePermille(StatType, Value);
			}
			num = CheckReverseHealCAP(num);
			if (Owner.HP + Owner.ShieldHP > num)
			{
				Owner.AddHP(-num);
			}
			else if (flag4)
			{
				Owner.AddHP(-num);
				TrySetDieByReverseHeal();
			}
			else if ((CDungeonScene.Instance.IsGuildDungeon || CDungeonScene.Instance.IsEventChallenge || CDungeonScene.Instance.IsWorldBoss || CDungeonScene.Instance.IsMonadGateSingularity) && Owner.IsBoss)
			{
				Owner.AddHP(-num);
			}
			else
			{
				int hP3 = Owner.HP;
				num = Owner.AddHP(-(Owner.HP + Owner.ShieldHP - 1));
				num = hP3 + Owner.ShieldHP - 1;
			}
			if (num != 0)
			{
				CBattleManager.ShowDamage(Caster, Owner, Mathf.Abs(num), _bCritical: false);
			}
			break;
		}
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_TARGET:
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_TARGET_ABLE_KILL:
		{
			bool flag2 = Type == BUFF_TYPE.BT_REVERSE_HEAL_BASED_TARGET_ABLE_KILL;
			if (Owner.FindBuffByType(BUFF_TYPE.BT_INVINCIBLE) != null)
			{
				Owner.PlayBuffEffect(null, null, new Symbol("SYS_BUFF_INVINCIBLE"), _IsDebuff: false);
				break;
			}
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Owner.CharacterData.GetStatValuePermille(StatType, Value);
			}
			num = CheckReverseHealCAP(num);
			if (Owner.HP + Owner.ShieldHP > num)
			{
				Owner.AddHP(-num);
			}
			else if (flag2)
			{
				Owner.AddHP(-num);
				TrySetDieByReverseHeal();
			}
			else if ((CDungeonScene.Instance.IsGuildDungeon || CDungeonScene.Instance.IsEventChallenge || CDungeonScene.Instance.IsWorldBoss || CDungeonScene.Instance.IsMonadGateSingularity) && Owner.IsBoss)
			{
				Owner.AddHP(-num);
			}
			else
			{
				int hP = Owner.HP;
				num = Owner.AddHP(-(Owner.HP + Owner.ShieldHP - 1));
				num = hP + Owner.ShieldHP - 1;
			}
			if (num != 0)
			{
				CBattleManager.ShowDamage(Caster, Owner, Mathf.Abs(num), _bCritical: false);
			}
			break;
		}
		case BUFF_TYPE.BT_SHIELD_BASED_CASTER:
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Caster.CharacterData.GetStatValuePermille(StatType, Value);
			}
			Owner.SetShieldHP(num);
			break;
		case BUFF_TYPE.BT_SHIELD_BASED_TARGET:
			if (StatType != STAT_TYPE.ST_NONE)
			{
				num = Owner.CharacterData.GetStatValuePermille(StatType, Value);
			}
			Owner.SetShieldHP(num);
			break;
		case BUFF_TYPE.BT_RESURRECTION:
			if (Owner.IsGhost)
			{
				if (OPTION_APPLYING_TYPE.OAT_RATE == ApplyingType)
				{
					num = Owner.CharacterData.GetStatValuePermille(STAT_TYPE.ST_HP, Value);
				}
				Owner.SetResurrection(num);
			}
			break;
		case BUFF_TYPE.BT_SEALED_RESURRECTION:
			if (Owner.IsDying)
			{
				Owner.SetSealedResurrection();
			}
			break;
		case BUFF_TYPE.BT_REMOVE_DEATH:
		{
			CBuff cBuff5 = Owner.FindBuffByType(BUFF_TYPE.BT_DEATH);
			if (cBuff5 != null)
			{
				Owner.RemoveBuff(cBuff5);
			}
			break;
		}
		case BUFF_TYPE.BT_STAT:
		case BUFF_TYPE.BT_STAT_PREMIUM:
		case BUFF_TYPE.BT_STAT_OWNER_LOST_HP_RATE:
		case BUFF_TYPE.BT_STAT_OWNER_LOST_HP_RATE_HALF:
		case BUFF_TYPE.BT_STAT_TOWER_CONTENT:
		case BUFF_TYPE.BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER:
		case BUFF_TYPE.BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK:
			if (Type == BUFF_TYPE.BT_STAT_TOWER_CONTENT && ((Object)(object)CDungeonScene.Instance == (Object)null || !CDungeonScene.Instance.DungeonTemplet.IsTowerModes()))
			{
				return false;
			}
			if (Type == BUFF_TYPE.BT_STAT)
			{
				if (Templet.ToolTipID != 0)
				{
					CBuff cBuff4 = (IsDebuff ? Owner.FindBuffByType(BUFF_TYPE.BT_STAT_DEBUFF_ENHANCE) : Owner.FindBuffByType(BUFF_TYPE.BT_STAT_BUFF_ENHANCE));
					if (cBuff4 != null)
					{
						IsUseInstanceValue = true;
						InstanceValue = CCommonDefine.ApplyRate(Value, cBuff4.Value);
					}
				}
			}
			else if (Type == BUFF_TYPE.BT_STAT_OWNER_LOST_HP_RATE)
			{
				IsUseInstanceValue = true;
				InstanceValue = Owner.GetLostHPRateValue(Value);
			}
			else if (Type == BUFF_TYPE.BT_STAT_OWNER_LOST_HP_RATE_HALF)
			{
				IsUseInstanceValue = true;
				int nHP = (int)Math.Clamp(2L * (long)Owner.HP - Owner.CharacterData.MaxHP, 0L, (long)Owner.CharacterData.MaxHP);
				InstanceValue = Owner.GetLostHPRateValue(nHP, Value);
			}
			if (STAT_TYPE.ST_HP == StatType)
			{
				if (Owner.IsFullHP)
				{
					Owner.CharacterData.AddStatBuff(this);
					Owner.AddHP(Owner.CharacterData.MaxHP, _bHeal: false, _bIgnoreUndead: false, _bIgnoreHealModifier: true);
					break;
				}
				int hP2 = Owner.HP;
				int maxHP = Owner.CharacterData.MaxHP;
				Owner.CharacterData.AddStatBuff(this);
				int nValue = ((maxHP > 0) ? ((int)((long)Owner.CharacterData.MaxHP * (long)hP2 / maxHP) - Owner.HP) : 0);
				Owner.AddHP(nValue, _bHeal: false, _bIgnoreUndead: false, _bIgnoreHealModifier: true);
			}
			else if (StatType != STAT_TYPE.ST_NONE)
			{
				Owner.CharacterData.AddStatBuff(this);
			}
			break;
		case BUFF_TYPE.BT_ACTION_GAUGE:
			Owner.AddActionPoint(GetActionGaugeEnhanceValue());
			CHudTurnSequencePanel.Instance.JumpIcon(Owner);
			break;
		case BUFF_TYPE.BT_COOL_CHARGE:
			if (!Owner.CharacterData.IsImmune(BUFF_TYPE.BT_COOL2_CHARGE))
			{
				Owner.SkillManager.AddCoolSecond(num);
			}
			if (!Owner.CharacterData.IsImmune(BUFF_TYPE.BT_COOL3_CHARGE))
			{
				Owner.SkillManager.AddCoolUltimate(num);
			}
			Owner.BossGauge?.SetSkillButtons();
			break;
		case BUFF_TYPE.BT_COOL2_CHARGE:
			Owner.SkillManager.AddCoolSecond(num);
			Owner.BossGauge?.SetSkillButtons();
			break;
		case BUFF_TYPE.BT_COOL3_CHARGE:
			Owner.SkillManager.AddCoolUltimate(num);
			Owner.BossGauge?.SetSkillButtons();
			break;
		case BUFF_TYPE.BT_COOL_MAX_REDUCE:
			Owner.SkillManager.ReduceCoolMax(num);
			Owner.BossGauge?.SetSkillButtons();
			break;
		case BUFF_TYPE.BT_CP_CHARGE:
			Owner.GetTeam().CP += num;
			break;
		case BUFF_TYPE.BT_AP_CHARGE:
			Owner.AP += num;
			break;
		case BUFF_TYPE.BT_REMOVE_BUFF:
			if (Owner.RemoveBuffs(_IsDebuff: false, num) && (Object)(object)Caster != (Object)null)
			{
				Caster.SkillRecord.IsRemoveBuff = true;
			}
			break;
		case BUFF_TYPE.BT_REMOVE_DEBUFF:
			if (Owner.RemoveBuffs(_IsDebuff: true, num))
			{
				if (Owner.TeamType == TEAM_TYPE.USER && ((Object)(object)Caster == (Object)null || ((Object)(object)Caster != (Object)null && Caster.TeamType == TEAM_TYPE.USER)))
				{
					CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(DUNGEON_MISSION_TYPE.DMT_USED_HEAL_DEBUFF);
				}
				if ((Object)(object)Caster != (Object)null)
				{
					Caster.SkillRecord.IsRemoveDebuff = true;
				}
			}
			break;
		case BUFF_TYPE.BT_REMOVE_BY_GROUP_ID:
		{
			CBuffGroupTemplet buffGroupTemplet3 = CTempletManager.Instance.GetBuffGroupTemplet(Value);
			if (buffGroupTemplet3 != null)
			{
				string[] child_BIDs2 = buffGroupTemplet3.Child_BIDs;
				if (child_BIDs2.IsNullOrEmpty())
				{
					break;
				}
				string[] child_BIDs = child_BIDs2;
				foreach (string text3 in child_BIDs)
				{
					if (!text3.IsNullOrEmpty())
					{
						CBuff cBuff7 = Owner.FindBuff(text3);
						if (cBuff7 != null)
						{
							Owner.RemoveBuff(cBuff7);
							Owner.CharacterData.SetStatDirty();
						}
					}
				}
			}
			else
			{
				CDebug.LogWarning("buffGroupTemplet is null. ID : " + Value);
			}
			break;
		}
		case BUFF_TYPE.BT_EXTEND_BUFF:
			Owner.ExtendBuff(_IsDebuff: false, num);
			Owner.ClearBuffFinishDuration();
			break;
		case BUFF_TYPE.BT_EXTEND_DEBUFF:
			Owner.ExtendBuff(_IsDebuff: true, num);
			Owner.ClearBuffFinishDuration();
			break;
		case BUFF_TYPE.BT_STEAL_BUFF:
		{
			List<CBuff> buffList3 = Owner.GetBuffList(_IsDeBuff: false);
			if (buffList3.IsNullOrEmpty())
			{
				break;
			}
			int num7 = 0;
			foreach (CBuff item in buffList3)
			{
				if (!item.IsIgnoreInterruption)
				{
					CBuff cBuff6 = CBuffManager.Instance.CreateBuffInstance();
					if (cBuff6.Initialize(item.Templet, Caster, Caster, _IsIgnoreCheckCondition: true, item.RemainTurnCont))
					{
						cBuff6.Run();
						cBuff6.RemainTurnCont = item.RemainTurnCont;
						Caster.AddBuff(cBuff6);
						num7++;
					}
					else
					{
						CBuffManager.Instance.ReleaseBuff(cBuff6);
					}
					Owner.RemoveBuff(item);
					if (num7 >= Value)
					{
						break;
					}
				}
			}
			break;
		}
		case BUFF_TYPE.BT_REDISTRIBUTE_BUFF:
		{
			CDebug.Log("start BUFF_TYPE.BT_REDISTRIBUTE_BUFF");
			List<CBuff> buffList2 = Owner.GetBuffList(_IsDeBuff: false);
			if (buffList2.IsNullOrEmpty())
			{
				CDebug.Log("BuffList.IsNullOrEmpty");
				break;
			}
			buffList2 = buffList2.Where((CBuff d) => !d.IsIgnoreInterruption && d.Templet.ToolTipID != 0).ToList();
			if (buffList2.IsNullOrEmpty())
			{
				CDebug.Log("no IsIgnoreInterruption BuffList.IsNullOrEmpty");
				break;
			}
			buffList2.Sort((CBuff x, CBuff y) => x.Templet.ToolTipID.CompareTo(y.Templet.ToolTipID));
			buffList2 = buffList2.Take(Value).ToList();
			foreach (CBuff item2 in buffList2)
			{
				bool flag3 = false;
				List<CCharacterBattle> list4 = new List<CCharacterBattle>(Caster.GetTeam().m_MemberList);
				for (int num6 = list4.Count - 1; num6 > 0; num6--)
				{
					int battleRandomRange3 = CFormula.GetBattleRandomRange(0, num6);
					List<CCharacterBattle> list5 = list4;
					int index = num6;
					List<CCharacterBattle> list6 = list4;
					int k = battleRandomRange3;
					CCharacterBattle cCharacterBattle = list4[battleRandomRange3];
					CCharacterBattle cCharacterBattle2 = list4[num6];
					CCharacterBattle cCharacterBattle3 = (list5[index] = cCharacterBattle);
					cCharacterBattle3 = (list6[k] = cCharacterBattle2);
				}
				foreach (CCharacterBattle item3 in list4)
				{
					if (!((Object)(object)item3 == (Object)null))
					{
						CBuff cBuff3 = CBuffManager.Instance.CreateBuffInstance();
						if (cBuff3.Initialize(item2.Templet, Caster, item3, _IsIgnoreCheckCondition: true, item2.RemainTurnCont))
						{
							cBuff3.Run();
							cBuff3.RemainTurnCont = item2.RemainTurnCont;
							item3.AddBuff(cBuff3);
							flag3 = true;
							CDebug.Log("BT_REDISTRIBUTE_BUFF buffID : " + item2.Templet.BuffID + " to characterID : " + item3.ID);
							break;
						}
						CBuffManager.Instance.ReleaseBuff(cBuff3);
					}
				}
				if (!flag3)
				{
					CDebug.Log("BT_REDISTRIBUTE_BUFF buffID : " + item2.Templet.BuffID + ". Create Fail.");
				}
			}
			foreach (CBuff item4 in buffList2)
			{
				Owner.RemoveBuff(item4);
			}
			break;
		}
		case BUFF_TYPE.BT_STATBUFF_CONVERT_TO_STATDEBUFF:
		{
			_ = string.Empty;
			List<CBuff> list3 = new List<CBuff>(Owner.GetBuffList(_IsDeBuff: false));
			if (list3 == null || 0 >= list3.Count)
			{
				break;
			}
			foreach (CBuff item5 in list3)
			{
				CBuffToolTipTemplet buffToolTipTemplet = CTempletManager.Instance.GetBuffToolTipTemplet(item5.Templet.ToolTipID);
				if (buffToolTipTemplet != null && buffToolTipTemplet.ConvertToID > 0)
				{
					CBuff cBuff2 = CBuffManager.Instance.CreateBuffInstance();
					cBuff2.Templet = item5.Templet.CopyForChangeDebuff(buffToolTipTemplet.ConvertToID);
					if (cBuff2.Initialize(cBuff2.Templet, Caster, item5.Owner, _IsIgnoreCheckCondition: true))
					{
						cBuff2.Caster = Caster;
						cBuff2.Run();
						cBuff2.RemainTurnCont = item5.RemainTurnCont;
						Owner.AddBuff(cBuff2);
					}
					else
					{
						CBuffManager.Instance.ReleaseBuff(cBuff2);
					}
					Owner.RemoveBuff(item5);
				}
			}
			break;
		}
		case BUFF_TYPE.BT_CASTER_COPY_BUFF:
		{
			if ((Object)(object)Caster == (Object)null)
			{
				break;
			}
			List<CBuff> buffList = Caster.GetBuffList(_IsDeBuff: false);
			if (buffList.IsNullOrEmpty())
			{
				break;
			}
			int num4 = 0;
			foreach (CBuff item6 in buffList)
			{
				if (item6 == null || item6.RemainTurnCont <= 0 || item6.Templet.ToolTipID <= 0)
				{
					continue;
				}
				CToolTipGroupTemplet toolTipMemberTemplet = CTempletManager.Instance.GetToolTipMemberTemplet(Templet.Value);
				if (toolTipMemberTemplet != null && !toolTipMemberTemplet.ToolTipMemberList.IsNullOrEmpty() && toolTipMemberTemplet.ToolTipMemberList.Contains(item6.Templet.ToolTipID))
				{
					CBuff cBuff = CBuffManager.Instance.CreateBuffInstance();
					if (cBuff.Initialize(item6.Templet, Caster, Owner, _IsIgnoreCheckCondition: false, Templet.TurnDuration))
					{
						cBuff.Run();
						cBuff.RemainTurnCont = Templet.TurnDuration;
						Owner.AddBuff(cBuff);
						num4++;
					}
					else
					{
						CBuffManager.Instance.ReleaseBuff(cBuff);
					}
				}
			}
			break;
		}
		case BUFF_TYPE.BT_IMMEDIATELY_BURN:
		case BUFF_TYPE.BT_IMMEDIATELY_BLEED:
		case BUFF_TYPE.BT_IMMEDIATELY_POISON:
		case BUFF_TYPE.BT_IMMEDIATELY_LIGHTNING:
		case BUFF_TYPE.BT_IMMEDIATELY_CURSE:
		case BUFF_TYPE.BT_IMMEDIATELY_2000092:
		case BUFF_TYPE.BT_IMMEDIATELY_PUNISH:
		{
			BUFF_TYPE eBuffType = ConvertImmediatelyToDot(Type);
			List<CBuff> buffListByType = Owner.GetBuffListByType(eBuffType);
			if (buffListByType.IsNullOrEmpty())
			{
				break;
			}
			foreach (CBuff item7 in buffListByType)
			{
				CBattleManager.ProcessDamageOverTime(item7, CCommonDefine.ApplyRate(item7.Value, Templet.Value), item7.RemainTurnCont, Caster);
				item7.RemainTurnCont = 0;
			}
			Owner.ClearBuffFinishDuration();
			break;
		}
		case BUFF_TYPE.BT_RESOURCE_USE_SKILL:
			Owner.SkillManager.SetMaxUniqueResource(TargetSkillType, num);
			if (Owner.IsOverNamed)
			{
				CSkill skill = Owner.SkillManager.GetSkill(TargetSkillType);
				if (skill != null)
				{
					Owner.BossGauge?.UpdateUniqueResource(TargetSkillType, skill.UniqueResource, skill.MaxUniqueResource);
				}
			}
			else
			{
				Owner.UpdateBuffIcon();
			}
			break;
		case BUFF_TYPE.BT_RESOURCE_DOWN:
			AddUniqueResource(Owner, -Templet.Value);
			break;
		case BUFF_TYPE.BT_RESOURCE_CHARGE_BUFF_CASTER:
			AddUniqueResource(Caster, Templet.Value);
			break;
		case BUFF_TYPE.BT_WG_HEAL:
			if (OPTION_APPLYING_TYPE.OAT_RATE == ApplyingType)
			{
				num = CCommonDefine.MulPermille(Owner.CharacterData.MaxWG, Value);
			}
			Owner.m_RageManager.WG += num;
			break;
		case BUFF_TYPE.BT_WG_REVERSE_HEAL:
			if (!Owner.m_RageManager.CanReduceWG)
			{
				return false;
			}
			if (OPTION_APPLYING_TYPE.OAT_RATE == ApplyingType)
			{
				num = CCommonDefine.MulPermille(Owner.CharacterData.MaxWG, Value);
			}
			num = CFormula.CalcDamageWG(Caster, Owner, num);
			Owner.m_RageManager.WG -= num;
			break;
		case BUFF_TYPE.BT_2000065_A:
			Owner.Render.ToggleObject(1);
			break;
		case BUFF_TYPE.BT_2000065_B:
			Owner.Render.ToggleObject(2);
			break;
		case BUFF_TYPE.BT_GROUP:
		{
			CBuffGroupTemplet buffGroupTemplet2 = CTempletManager.Instance.GetBuffGroupTemplet(Value);
			if (buffGroupTemplet2 == null)
			{
				CDebug.LogErrorFormat("BuffGroupTemplet not Found!! [{0}]", Value);
				return false;
			}
			if (buffGroupTemplet2.IsAllCreate)
			{
				bool result = false;
				if (!buffGroupTemplet2.Child_BIDs.IsNullOrEmpty())
				{
					string[] child_BIDs = buffGroupTemplet2.Child_BIDs;
					foreach (string text2 in child_BIDs)
					{
						if (!text2.IsNullOrEmpty())
						{
							CBuffTemplet buffTemplet3 = CBuffTempletContainer.Instance.GetBuffTemplet(text2, Templet.Level);
							if (buffTemplet3 != null)
							{
								CBuffManager.Instance.CreateBuff(buffTemplet3, Caster, Owner, _bTargetEnemyOnly: false);
								result = true;
							}
						}
					}
				}
				else
				{
					CDebug.LogWarning("Child_BIDs is NullOrEmpty. id : " + Value);
				}
				return result;
			}
			int battleRandomRange2 = CFormula.GetBattleRandomRange(0, 999);
			int num5 = 0;
			for (int l = 0; l < buffGroupTemplet2.Child_Rates.Length; l++)
			{
				num5 += buffGroupTemplet2.Child_Rates[l];
				if (battleRandomRange2 < num5)
				{
					CBuffTemplet buffTemplet4 = CBuffTempletContainer.Instance.GetBuffTemplet(buffGroupTemplet2.Child_BIDs[l], Templet.Level);
					if (buffTemplet4 == null)
					{
						CDebug.LogErrorFormat("ChildBuffTemplet not Found!! [{0}][{1}]", buffGroupTemplet2.Child_BIDs[l], Templet.Level);
						return false;
					}
					CBuffManager.Instance.CreateBuff(buffTemplet4, Caster, Owner, _bTargetEnemyOnly: false);
					return true;
				}
			}
			break;
		}
		case BUFF_TYPE.BT_GROUP_CASTER_TOOLTIP_CHECK:
		{
			CBuffGroupTemplet buffGroupTemplet = CTempletManager.Instance.GetBuffGroupTemplet(Value);
			if (buffGroupTemplet == null)
			{
				CDebug.LogErrorFormat("BuffGroupTemplet not Found!! [{0}]", Value);
				return false;
			}
			List<string> list = new List<string>();
			List<int> list2 = new List<int>();
			for (int i = 0; i < buffGroupTemplet.Child_BIDs.Length; i++)
			{
				string text = buffGroupTemplet.Child_BIDs[i];
				if (text.IsNullOrEmpty())
				{
					continue;
				}
				CBuffTemplet buffTemplet = CBuffTempletContainer.Instance.GetBuffTemplet(text, 1);
				if (buffTemplet == null)
				{
					continue;
				}
				bool flag = false;
				if (buffTemplet != null && buffTemplet.ToolTipID != 0)
				{
					foreach (CBuff buff in Caster.BuffList)
					{
						if (buff != null && buff.Templet != null && buff.Templet.ToolTipID == buffTemplet.ToolTipID)
						{
							flag = true;
							break;
						}
					}
				}
				if (!flag)
				{
					list.Add(text);
					list2.Add(buffGroupTemplet.Child_Rates[i]);
				}
			}
			int num2 = list2.Sum();
			if (num2 == 0)
			{
				break;
			}
			int battleRandomRange = CFormula.GetBattleRandomRange(0, num2 - 1);
			int num3 = 0;
			for (int j = 0; j < list2.Count; j++)
			{
				num3 += list2[j];
				if (battleRandomRange < num3)
				{
					CBuffTemplet buffTemplet2 = CBuffTempletContainer.Instance.GetBuffTemplet(list[j], Templet.Level);
					if (buffTemplet2 == null)
					{
						CDebug.LogErrorFormat("ChildBuffTemplet not Found!! [{0}][{1}]", list[j], Templet.Level);
						return false;
					}
					CBuffManager.Instance.CreateBuff(buffTemplet2, Caster, Owner, _bTargetEnemyOnly: false);
					break;
				}
			}
			break;
		}
		}
		return true;
	}
