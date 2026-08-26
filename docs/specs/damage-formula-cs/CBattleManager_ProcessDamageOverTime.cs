// CBattleManager$$ProcessDamageOverTime — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBattleManager.cs.
// Note du manifeste : Chemin du TICK des DoT (§ 12.8 → désassemblage 24/08/2026, déclencheur : le DoT custom BT_DOT_2000092 d'Eternal Bleeding, tick observé sans défense — 2 × 7000 ‰ × Effectiveness fiche).

	public static bool ProcessDamageOverTime(CBuff _Buff, int _nBuffValue, int _nCount, CCharacterBattle _ImmediatelyCaster)
	{
		//IL_052c: Unknown result type (might be due to invalid IL or missing references)
		//IL_0531: Unknown result type (might be due to invalid IL or missing references)
		//IL_055b: Unknown result type (might be due to invalid IL or missing references)
		CCharacterBattle caster = _Buff.Caster;
		CCharacterBattle _Defender = _Buff.Owner;
		BUFF_TYPE type = _Buff.Type;
		if ((Object)null == (Object)(object)caster || (Object)null == (Object)(object)_Defender)
		{
			return false;
		}
		int num = 0;
		CDamageTypeTemplet DamageTypeTemplet = null;
		switch (type)
		{
		case BUFF_TYPE.BT_DOT_BURN:
		{
			int dotDamageIncreaseBuffValue3 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_BURN);
			num = CCommonDefine.MulPermille(caster.CharacterData.Atk, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue3)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_BURN);
			break;
		}
		case BUFF_TYPE.BT_DOT_BLEED:
		{
			if (_Buff.StatType == STAT_TYPE.ST_NONE)
			{
				CDebug.LogError("STAT_TYPE.ST_NONE!");
				return false;
			}
			int dotDamageIncreaseBuffValue2 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_BLEED);
			num = CFormula.CalcDamageDOT(caster, _Defender, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue2), caster.CharacterData.GetStatValue(_Buff.StatType)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_BLEEDING);
			break;
		}
		case BUFF_TYPE.BT_DOT_POISON:
		{
			if (_Buff.StatType == STAT_TYPE.ST_NONE)
			{
				CDebug.LogError("STAT_TYPE.ST_NONE!");
				return false;
			}
			int dotDamageIncreaseBuffValue6 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_POISON);
			num = CFormula.CalcDamageDOT(caster, _Defender, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue6), caster.CharacterData.GetStatValue(_Buff.StatType)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_POISON);
			break;
		}
		case BUFF_TYPE.BT_DOT_LIGHTNING:
		{
			if (_Buff.StatType == STAT_TYPE.ST_NONE)
			{
				CDebug.LogError("STAT_TYPE.ST_NONE!");
				return false;
			}
			int dotDamageIncreaseBuffValue7 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_LIGHTNING);
			num = CFormula.CalcDamageDOT(caster, _Defender, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue7), caster.CharacterData.GetStatValue(_Buff.StatType)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_LIGHTNING);
			break;
		}
		case BUFF_TYPE.BT_DOT_CURSE:
		{
			int dotDamageIncreaseBuffValue5 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_CURSE);
			num = _Defender.CharacterData.GetStatValuePermille(STAT_TYPE.ST_HP, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue5));
			foreach (CBuff item in _Defender.GetBuffListByType(BUFF_TYPE.BT_DOT_CURSE_CAP))
			{
				if (item != null && item.CheckCondition() && num > item.Value)
				{
					num = item.Value;
				}
			}
			num *= _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_CURSE);
			break;
		}
		case BUFF_TYPE.BT_DOT_2000092:
		{
			int dotDamageIncreaseBuffValue4 = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_2000092);
			num = CCommonDefine.MulPermille(caster.CharacterData.GetFinalStat(STAT_TYPE.ST_BUFF_CHANCE), CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue4)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_2000092);
			foreach (CCharacterBattle member in caster.GetTeam().m_MemberList)
			{
				if ((Object)(object)member != (Object)null)
				{
					member.AddActionPoint(member.GetDot2000092ActionGaugeEnhanceValue() * _nCount);
					CHudTurnSequencePanel.Instance.JumpIcon(member);
				}
			}
			break;
		}
		case BUFF_TYPE.BT_DOT_PUNISH:
		{
			if (_Buff.StatType == STAT_TYPE.ST_NONE)
			{
				CDebug.LogError("STAT_TYPE.ST_NONE!");
				return false;
			}
			int dotDamageIncreaseBuffValue = _Defender.GetDotDamageIncreaseBuffValue(BUFF_TYPE.BT_DOT_PUNISH);
			num = CFormula.CalcDamageDOT(caster, _Defender, CCommonDefine.ApplyRate(_nBuffValue, dotDamageIncreaseBuffValue), caster.CharacterData.GetStatValue(_Buff.StatType)) * _nCount;
			DamageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_DOT_PUNISH);
			break;
		}
		}
		if ((Object)(object)_ImmediatelyCaster != (Object)null)
		{
			num = ApplyImmediatelyDotDamageCap(_Defender, type, num);
		}
		if (_Defender.FindBuffByType(BUFF_TYPE.BT_INVINCIBLE) != null)
		{
			num = 0;
			_Defender.PlayBuffEffect(null, null, new Symbol("SYS_BUFF_INVINCIBLE"), _IsDebuff: false);
		}
		if (0 < num)
		{
			_Defender.AddHP(-num);
			CDungeonScene.Instance.Hud.PlayHudTextDamage(num, _IsHeal: false, _IsCritical: false, ((Component)_Defender).transform, _IsBreak: false);
			caster.GetTeam().AddTotalHit(caster.UID, num);
			_Defender.GetTeam().AddTotalDamage(_Defender.UID, num);
		}
		if (_Defender.HP == 0 && _Defender.IsAlive && !_Defender.IsNotDie)
		{
			_Defender.SetDie();
			if (TEAM_TYPE.ENEMY == _Defender.TeamType && _Defender.IsBoss)
			{
				_Defender.GetTeam().BossKill();
			}
		}
		if (0 < DamageTypeTemplet.SoundNameList.Count)
		{
			if ((Object)(object)_ImmediatelyCaster != (Object)null && !_ImmediatelyCaster.SkillRecord.IsPlayDOTImmediateSound)
			{
				_ImmediatelyCaster.SkillRecord.IsPlayDOTImmediateSound = true;
				PlaySE();
			}
			else if ((Object)(object)_ImmediatelyCaster == (Object)null && !_Defender.SkillRecord.IsPlayDOTSound)
			{
				_Defender.SkillRecord.IsPlayDOTSound = true;
				PlaySE();
			}
		}
		if (0 < DamageTypeTemplet.ParticleNameList.Count)
		{
			CSingletonBehaviour<CEffectManager>.Instance.Play(DamageTypeTemplet.ParticleNameList[0], _Defender, null, null, null);
		}
		if (DamageTypeTemplet.HitColorRGB != Color.black && DamageTypeTemplet.HitColorDuration != 0f)
		{
			_Defender.PlayHitLightEffect(DamageTypeTemplet.HitColorRGB, DamageTypeTemplet.HitColorDuration);
		}
		_Defender.ChangeDamageReactState(DAMAGE_REACT_TYPE.DRT_SMALL);
		if ((Object)(object)_ImmediatelyCaster != (Object)null && num > 0 && (Object)(object)CDungeonScene.Instance.GetActiveCharacter() == (Object)(object)_ImmediatelyCaster)
		{
			CDungeonScene.Instance.Hud.m_HudTotalDamage.SetTotalDamage(num);
		}
		return true;
		void PlaySE()
		{
			CSingletonBehaviour<CSoundManager>.Instance.PlaySound(CSoundManager.SOUND_TYPE.EFFECT, DamageTypeTemplet.SoundName, ((Component)_Defender).gameObject);
		}
	}
