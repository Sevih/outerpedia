// CBuff$$OnTurnStart — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.
// Note du manifeste : Appelant PÉRIODIQUE du tick : ProcessDamageOverTime(this, Value, 1, null) — _nCount = 1 (§ 11, lève le reste de § 12.8) ; HoT et reverse heal périodiques (§ 14).

	public void OnTurnStart()
	{
		int num = Value;
		switch (Type)
		{
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
			}
			break;
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER:
		case BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL:
		{
			bool flag = Type == BUFF_TYPE.BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL;
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
				num = Owner.AddHP(-num);
			}
			else if (flag)
			{
				num = Owner.AddHP(-num);
				TrySetDieByReverseHeal();
			}
			else
			{
				num = Owner.AddHP(-(Owner.HP + Owner.ShieldHP - 1));
			}
			CDungeonScene.Instance.Hud.PlayHudTextDamage(Mathf.Abs(num), _IsHeal: false, _IsCritical: false, ((Component)Owner).transform, _IsBreak: false);
			if ((Object)(object)Caster == (Object)(object)CDungeonScene.Instance.GetActiveCharacter())
			{
				CDungeonScene.Instance.Hud.m_HudTotalDamage.SetTotalDamage(Mathf.Abs(num));
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
				num = Owner.AddHP(-num);
			}
			else if (!flag2)
			{
				num = ((!CDungeonScene.Instance.IsGuildDungeon && !CDungeonScene.Instance.IsEventChallenge) ? Owner.AddHP(-(Owner.HP + Owner.ShieldHP - 1)) : Owner.AddHP(-num));
			}
			else
			{
				num = Owner.AddHP(-num);
				TrySetDieByReverseHeal();
			}
			CDungeonScene.Instance.Hud.PlayHudTextDamage(Mathf.Abs(num), _IsHeal: false, _IsCritical: false, ((Component)Owner).transform, _IsBreak: false);
			if ((Object)(object)Caster == (Object)(object)CDungeonScene.Instance.GetActiveCharacter())
			{
				CDungeonScene.Instance.Hud.m_HudTotalDamage.SetTotalDamage(Mathf.Abs(num));
			}
			break;
		}
		case BUFF_TYPE.BT_DOT_BURN:
		case BUFF_TYPE.BT_DOT_BLEED:
		case BUFF_TYPE.BT_DOT_POISON:
		case BUFF_TYPE.BT_DOT_LIGHTNING:
		case BUFF_TYPE.BT_DOT_CURSE:
		case BUFF_TYPE.BT_DOT_2000092:
		case BUFF_TYPE.BT_DOT_PUNISH:
			CBattleManager.ProcessDamageOverTime(this, Value, 1, null);
			break;
		case BUFF_TYPE.BT_WG_HEAL:
			if (OPTION_APPLYING_TYPE.OAT_RATE == ApplyingType)
			{
				num = CCommonDefine.MulPermille(Owner.CharacterData.MaxWG, Value);
			}
			Owner.m_RageManager.WG += num;
			PlayCreateEffect();
			break;
		}
	}
