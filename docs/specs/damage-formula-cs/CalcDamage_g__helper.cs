// CFormula$$<CalcDamage>g__CalcDamage|17_0 — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.
// 2 surcharges, dans l'ordre du source.
// Le binaire cite fonction locale CalcDamage — généré par le compilateur, ILSpy le replie dans CFormula.CalcDamage.

	public static void CalcDamage(CCharacterBattle _Attacker, CCharacterBattle _Defender, CDamageTemplet _DamageTemplet, int _nDamageRate, out int _nDamage, out int _nVampiric, out int _nHitRecovery)
	{
		//IL_008a: Unknown result type (might be due to invalid IL or missing references)
		//IL_008f: Unknown result type (might be due to invalid IL or missing references)
		if (_nDamageRate == 0)
		{
			_nDamage = (_nVampiric = (_nHitRecovery = 0));
			return;
		}
		if (_DamageTemplet.DamageFactor == 0)
		{
			_nDamage = 0;
			_nVampiric = 0;
			_nHitRecovery = 0;
			return;
		}
		_nDamage = CalcDamage(_DamageTemplet.DamageFactor);
		if (_Defender.SkillRecord.ReceiveMaxDamage == 0)
		{
			int num = 0;
			AnimatorClipInfo[] currentAnimatorClipInfo = _Attacker.Animator.GetCurrentAnimatorClipInfo(0);
			int i;
			for (i = 0; i < currentAnimatorClipInfo.Length; i++)
			{
				AnimatorClipInfo val = currentAnimatorClipInfo[i];
				AnimationEvent[] events = ((AnimatorClipInfo)(ref val)).clip.events;
				foreach (AnimationEvent val2 in events)
				{
					if ("EventAttackStart".Equals(val2.functionName))
					{
						string[] array = val2.stringParameter.Replace(" ", "").Split(',', StringSplitOptions.None);
						CDamageTemplet damageTemplet = CTempletManager.Instance.GetDamageTemplet(array[0]);
						num += damageTemplet.DamageFactor * ((damageTemplet.MaxHitCount == 0) ? 1 : damageTemplet.MaxHitCount);
					}
					else if ("EventEffect".Equals(val2.functionName))
					{
						string[] array2 = val2.stringParameter.Replace(" ", "").Split(',', StringSplitOptions.None);
						if (array2 != null && array2.Length >= 2 && int.TryParse(array2[1], out var result) && result > 0)
						{
							CDebug.LogWarning("EventEffect damage factor : " + result);
							num += result;
						}
					}
				}
			}
			if (num == 0 && _Attacker.SkillRecord.TotalSkillFactor != 0)
			{
				num = _Attacker.SkillRecord.TotalSkillFactor;
			}
			_Defender.SkillRecord.ReceiveMaxDamage = CalcDamage(num);
			_Defender.SkillRecord.TotalSkillFactor = num;
			CSkillRecord skillRecord = _Defender.SkillRecord;
			i = (_Defender.SkillRecord.ReceiveCurrentFactorDamage = 0);
			skillRecord.CurrentSkillFactor = i;
		}
		if (!IsIgnoreTurnLimitDamage(_Attacker) && !CDungeonScene.Instance.IsUseWorldBossFinishAttack && _Defender.TurnLimitMaxDamage != -1 && _Defender.SkillRecord.SkillLimitMaxDamage == -1)
		{
			int num3 = Mathf.Min(Mathf.Max(0, _Defender.TurnLimitMaxDamage - _Defender.TurnLimitCurrentDamage), _Defender.SkillRecord.ReceiveMaxDamage);
			int skillLimitMaxDamage = CalcCharacterSharedDamage(_Defender, num3);
			_Defender.SkillRecord.SkillLimitMaxDamage = skillLimitMaxDamage;
			_Defender.TurnLimitCurrentDamage += num3;
		}
		_Defender.SkillRecord.CurrentSkillFactor += _DamageTemplet.DamageFactor;
		if (_Defender.SkillRecord.CurrentSkillFactor >= _Defender.SkillRecord.TotalSkillFactor)
		{
			if (_Defender.SkillRecord.ReceiveMaxDamage > _Defender.SkillRecord.ReceiveCurrentFactorDamage + _nDamage)
			{
				_nDamage += _Defender.SkillRecord.ReceiveMaxDamage - _Defender.SkillRecord.ReceiveCurrentFactorDamage - _nDamage;
			}
			CSkillRecord skillRecord2 = _Defender.SkillRecord;
			int i = (_Defender.SkillRecord.TotalSkillFactor = 0);
			skillRecord2.ReceiveMaxDamage = i;
		}
		_Defender.SkillRecord.ReceiveCurrentFactorDamage += _nDamage;
		_nVampiric = CCommonDefine.MulPermille(_nDamage, _Attacker.CharacterData.Vampiric);
		float num5 = (float)(_nDamage * _Defender.CharacterData.HitHPRecovery) * 0.001f;
		_nHitRecovery = Mathf.FloorToInt(num5);
		int CalcDamage(int _nDamageFactor)
		{
			int attackStat = _Attacker.GetAttackStat();
			int skillFactor = _Attacker.SkillManager.GetSkillFactor();
			long num6 = (long)attackStat * (long)skillFactor * _nDamageFactor / 1000;
			int num7 = Mathf.Min(1000, _Attacker.CharacterData.PiercePowerRate);
			int piercePower = _Attacker.CharacterData.PiercePower;
			long num8 = Math.Max(-999000L, (long)_Defender.CharacterData.Def * (long)(1000 - num7) - (long)piercePower * 1000L);
			long num9 = num6 * 1000000 / (1000000 + num8);
			num9 = num9 * _nDamageRate / 1000;
			if (_Defender.FindBuffByType(BUFF_TYPE.BT_MARKING) != null)
			{
				num9 = num9 * 1150 / 1000;
			}
			num9 = num9 * GetElementeryDamageRate(_Attacker, _Defender) / 1000;
			if (_Defender.SkillRecord.DamageRateType == DAMAGE_RATE_TYPE.MISSED)
			{
				num9 = num9 * CCommonDefine.MISSED_DAMAGE_RATE_PERMILLE / 1000;
			}
			_Defender.GetBuffDamgeFinalReduce(out var _nFinalReduceDmgRate, _Attacker);
			num9 = num9 * (1000 - _nFinalReduceDmgRate) / 1000;
			return Mathf.Max(1, (int)(num9 / 1000));
		}
	}

		int CalcDamage(int _nDamageFactor)
		{
			int attackStat = _Attacker.GetAttackStat();
			int skillFactor = _Attacker.SkillManager.GetSkillFactor();
			long num6 = (long)attackStat * (long)skillFactor * _nDamageFactor / 1000;
			int num7 = Mathf.Min(1000, _Attacker.CharacterData.PiercePowerRate);
			int piercePower = _Attacker.CharacterData.PiercePower;
			long num8 = Math.Max(-999000L, (long)_Defender.CharacterData.Def * (long)(1000 - num7) - (long)piercePower * 1000L);
			long num9 = num6 * 1000000 / (1000000 + num8);
			num9 = num9 * _nDamageRate / 1000;
			if (_Defender.FindBuffByType(BUFF_TYPE.BT_MARKING) != null)
			{
				num9 = num9 * 1150 / 1000;
			}
			num9 = num9 * GetElementeryDamageRate(_Attacker, _Defender) / 1000;
			if (_Defender.SkillRecord.DamageRateType == DAMAGE_RATE_TYPE.MISSED)
			{
				num9 = num9 * CCommonDefine.MISSED_DAMAGE_RATE_PERMILLE / 1000;
			}
			_Defender.GetBuffDamgeFinalReduce(out var _nFinalReduceDmgRate, _Attacker);
			num9 = num9 * (1000 - _nFinalReduceDmgRate) / 1000;
			return Mathf.Max(1, (int)(num9 / 1000));
		}
