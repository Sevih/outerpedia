// CFormula$$CheckDamageRate — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static void CheckDamageRate(CCharacterBattle _Attacker, CCharacterBattle _Defender)
	{
		if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsWorldBoss && CDungeonScene.Instance.IsUseWorldBossFinishAttack && (Object)(object)_Attacker != (Object)null && _Attacker.IsBoss)
		{
			_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.NORMAL;
			_Defender.SkillRecord.DamageRate = 1000;
			return;
		}
		if (_Defender.FindBuffByType(BUFF_TYPE.BT_INVINCIBLE) != null)
		{
			_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.INVINCIBLE;
			_Defender.SkillRecord.DamageRate = 0;
			return;
		}
		if (_Attacker.SkillRecord.IsAdditiveAction && _Defender.SkillRecord.DamageRateType != DAMAGE_RATE_TYPE.NONE)
		{
			if (DAMAGE_RATE_TYPE.MISSED == _Defender.SkillRecord.DamageRateType)
			{
				_Defender.SkillRecord.DamageRate = 1000;
			}
			else if (DAMAGE_RATE_TYPE.CRITICAL == _Defender.SkillRecord.DamageRateType)
			{
				_Defender.SkillRecord.DamageRate = _Attacker.CharacterData.CriticalDMGRate;
				if (_Defender.CharacterData.EnemyCriticalDamageReduce != 0)
				{
					_Defender.SkillRecord.DamageRate -= _Defender.CharacterData.EnemyCriticalDamageReduce;
				}
			}
			else
			{
				_Defender.SkillRecord.DamageRate = 1000;
			}
		}
		else
		{
			if (CheckProbabilityPermille(_Defender.CharacterData.Avoid))
			{
				CDebug.Log("Avoid!");
				_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.MISSED;
				_Defender.SkillRecord.DamageRate = 1000;
			}
			else if (CheckProbabilityPermille(_Attacker.CharacterData.CriticalRate))
			{
				_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.CRITICAL;
				_Defender.SkillRecord.DamageRate = _Attacker.CharacterData.CriticalDMGRate;
				if (_Defender.CharacterData.EnemyCriticalDamageReduce != 0)
				{
					_Defender.SkillRecord.DamageRate -= _Defender.CharacterData.EnemyCriticalDamageReduce;
				}
			}
			else
			{
				_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.NORMAL;
				_Defender.SkillRecord.DamageRate = 1000;
			}
			if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsWorldBoss && CDungeonScene.Instance.IsUseWorldBossSpecialAttack)
			{
				_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.NORMAL;
				_Defender.SkillRecord.DamageRate = 1000;
			}
			if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsIrregularInfiltrate && CDungeonScene.Instance.IsUseInfiltrateSatelliteAttack)
			{
				_Defender.SkillRecord.DamageRateType = DAMAGE_RATE_TYPE.NORMAL;
				_Defender.SkillRecord.DamageRate = 1000;
			}
		}
		_Attacker.FindBuffAdditionalDamage(out var _nDmgRate, _Defender);
		if (_nDmgRate != 0)
		{
			_Defender.SkillRecord.DamageRate += _nDmgRate;
		}
		_Defender.FindBuffDamageReduce(out var _nReduceDmgRate, _Attacker);
		if (_nReduceDmgRate != 0)
		{
			_Defender.SkillRecord.DamageRate -= _nReduceDmgRate;
		}
		_Defender.SkillRecord.DamageRate += _Attacker.CharacterData.DMGBoost;
		_Defender.SkillRecord.DamageRate -= _Defender.CharacterData.DMGReduceRate;
		if (300 > _Defender.SkillRecord.DamageRate)
		{
			_Defender.SkillRecord.DamageRate = 300;
		}
	}
