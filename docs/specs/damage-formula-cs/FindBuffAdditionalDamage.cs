// CCharacterBattle$$FindBuffAdditionalDamage — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public void FindBuffAdditionalDamage(out int _nDmgRate, CCharacterBattle _TargetCharacter)
	{
		_nDmgRate = 0;
		Dictionary<string, int> dictionary = null;
		foreach (CBuff buff in m_BuffList)
		{
			if (BUFF_TYPE.BT_DMG == buff.Type && buff.CheckAvailable(_TargetCharacter))
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_OWNER_LOST_HP_RATE == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += GetLostHPRateValue(buff.Value);
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_LOST_HP_RATE == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += _TargetCharacter.GetLostHPRateValue(buff.Value);
			}
			else if (BUFF_TYPE.BT_DMG_OWNER_STAT == buff.Type && buff.CheckAvailable())
			{
				float num = base.CharacterData.GetStatValuePermille(buff.StatType, buff.Value);
				num = Mathf.Min(num, 1000f);
				_nDmgRate += Mathf.RoundToInt(num);
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_STAT == buff.Type && buff.CheckAvailable())
			{
				float num2 = _TargetCharacter.CharacterData.GetStatValuePermille(buff.StatType, buff.Value);
				num2 = Mathf.Min(num2, 1000f);
				_nDmgRate += Mathf.RoundToInt(num2);
			}
			else if (BUFF_TYPE.BT_DMG_CASTER_STAT == buff.Type && buff.CheckAvailable())
			{
				if ((Object)(object)buff.Caster != (Object)null && buff.Caster.CharacterData != null)
				{
					float num3 = buff.Caster.CharacterData.GetStatValuePermille(buff.StatType, buff.Value);
					num3 = Mathf.Min(num3, 1000f);
					_nDmgRate += Mathf.RoundToInt(num3);
				}
			}
			else if (BUFF_TYPE.BT_DMG_OWNER_BUFF == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += GetBuffCount(_IsDeBuff: false) * buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_BUFF == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += _TargetCharacter.GetBuffCount(_IsDeBuff: false) * buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_BUFF_LIMIT == buff.Type && buff.CheckAvailable())
			{
				if (dictionary == null)
				{
					dictionary = new Dictionary<string, int>();
				}
				dictionary.TryGetValue(buff.ID, out var value);
				int num4 = Mathf.Min(value + _TargetCharacter.GetBuffCount(_IsDeBuff: false) * buff.Value, buff.Templet.LimitValue);
				_nDmgRate += num4 - value;
				dictionary[buff.ID] = num4;
			}
			else if (BUFF_TYPE.BT_DMG_OWNER_DEBUFF == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += GetBuffCount(_IsDeBuff: true) * buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_DEBUFF == buff.Type && buff.CheckAvailable())
			{
				_nDmgRate += _TargetCharacter.GetBuffCount(_IsDeBuff: true) * buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_DEBUFF_LIMIT == buff.Type && buff.CheckAvailable())
			{
				if (dictionary == null)
				{
					dictionary = new Dictionary<string, int>();
				}
				dictionary.TryGetValue(buff.ID, out var value2);
				int num5 = Mathf.Min(value2 + _TargetCharacter.GetBuffCount(_IsDeBuff: true) * buff.Value, buff.Templet.LimitValue);
				_nDmgRate += num5 - value2;
				dictionary[buff.ID] = num5;
			}
			else if (BUFF_TYPE.BT_DMG_TARGET_BREAK == buff.Type && buff.CheckAvailable() && TargetCharacter.m_RageManager.IsBreak)
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TO_BOSS == buff.Type && buff.CheckAvailable() && TargetCharacter.IsBoss)
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_KILL_COUNT_STACK == buff.Type && buff.CheckAvailable(_TargetCharacter))
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_NOT_CRITICAL == buff.Type && buff.CheckAvailable() && (_TargetCharacter.SkillRecord.DamageRateType == DAMAGE_RATE_TYPE.NORMAL || _TargetCharacter.SkillRecord.DamageRateType == DAMAGE_RATE_TYPE.MISSED))
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_PVP_CONTENT == buff.Type && buff.CheckAvailable() && CDungeonScene.Instance.IsPvp)
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_CASTER_LOST_HP_RATE == buff.Type && buff.CheckAvailable())
			{
				if ((Object)(object)buff.Caster != (Object)null && buff.Caster.CharacterData != null)
				{
					_nDmgRate += buff.Caster.GetLostHPRateValue(buff.Value);
				}
			}
			else if (BUFF_TYPE.BT_DMG_OWNER_TEAM_BUFF == buff.Type && buff.CheckAvailable())
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
				int num6 = 0;
				foreach (CCharacterBattle member in team.m_MemberList)
				{
					if (!((Object)(object)member == (Object)null))
					{
						List<CBuff> buffList = member.GetBuffList(_IsDeBuff: false);
						if (!buffList.IsNullOrEmpty())
						{
							num6 += buffList.Count;
						}
					}
				}
				_nDmgRate += num6 * buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_MY_TEAM_DECREASE == buff.Type && buff.CheckAvailable())
			{
				if ((Object)(object)buff.Owner == (Object)null || buff.Owner.CharacterData == null)
				{
					continue;
				}
				CTeam team2 = buff.Owner.GetTeam();
				if (team2 == null)
				{
					continue;
				}
				int num7 = 0;
				foreach (CCharacterBattle member2 in team2.m_MemberList)
				{
					if (!((Object)(object)member2 == (Object)null) && member2.IsAlive)
					{
						num7++;
					}
				}
				_nDmgRate += buff.Value * (4 - num7);
			}
			else if (BUFF_TYPE.BT_DMG_MONADGATE_CONTENT == buff.Type && buff.CheckAvailable() && (Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsMonadGate)
			{
				_nDmgRate += buff.Value;
			}
			else if (BUFF_TYPE.BT_DMG_TOWER_CONTENT == buff.Type && buff.CheckAvailable() && (Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.DungeonTemplet.DungeonMode.IsTowerModes())
			{
				_nDmgRate += buff.Value;
			}
		}
		if (CDungeonScene.Instance.IsPvpRealtime)
		{
			_nDmgRate += CSingletonBehaviour<CPVPRealTimeManager>.Instance.CurrentMatchInfo.FieldSkillDmg;
		}
	}
