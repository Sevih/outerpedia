// CCharacterBattle$$AddHP — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int AddHP(int _nValue, bool _bHeal = false, bool _bIgnoreUndead = false, bool _bIgnoreHealModifier = false)
	{
		if (0 < _nValue && !_bIgnoreHealModifier)
		{
			CBuff cBuff = FindBuffeReceiveHeal();
			if (cBuff != null)
			{
				cBuff = FindBuffByType(BUFF_TYPE.BT_SEALED_RECEIVE_HEAL);
				if (cBuff != null)
				{
					return 0;
				}
				cBuff = FindBuffByType(BUFF_TYPE.BT_INCREASE_RECEIVE_HEAL);
				if (cBuff != null)
				{
					_nValue += CCommonDefine.MulPermille(_nValue, cBuff.Value);
				}
				else
				{
					cBuff = FindBuffByType(BUFF_TYPE.BT_REDUCE_RECEIVE_HEAL);
					if (cBuff != null)
					{
						_nValue -= CCommonDefine.MulPermille(_nValue, cBuff.Value);
					}
				}
			}
			if (CDungeonScene.Instance.IsPvpRealtime)
			{
				_nValue -= CCommonDefine.MulPermille(_nValue, CSingletonBehaviour<CPVPRealTimeManager>.Instance.CurrentMatchInfo.FieldSkillReduceReceiveHeal);
			}
			if (FindBuffByType(BUFF_TYPE.BT_DOT_BLEED) != null)
			{
				_nValue = CCommonDefine.MulPermille(_nValue, 500);
			}
		}
		else if (0 > _nValue)
		{
			if (0 < m_nShieldHP)
			{
				if (m_nShieldHP > Math.Abs(_nValue))
				{
					m_nShieldHP += _nValue;
					_nValue = 0;
				}
				else
				{
					_nValue += m_nShieldHP;
					m_nShieldHP = 0;
					RemoveBuffShield();
				}
			}
			if (IsBoss)
			{
				int num = Math.Abs(_nValue);
				CSingletonBehaviour<CBattleManager>.Instance.SetBossDamage(this, num);
				if (m_RageManager != null && !m_RageManager.IsRage)
				{
					LoseHP += num;
				}
			}
		}
		m_nGvHP = Mathf.Clamp(HP + _nValue, 0, base.CharacterData.MaxHP);
		if ((int)m_nGvHP == 0)
		{
			CBuff cBuff2 = FindBuffByType(BUFF_TYPE.BT_UNDEAD);
			if (!_bIgnoreUndead && cBuff2 != null)
			{
				m_nGvHP = 1;
				if (!cBuff2.IsShowFirstEffect)
				{
					PlayBuffEffect(cBuff2.ActivateEffect, this, cBuff2.ActivateText, cBuff2.IsDebuff, cBuff2.IsEquip, cBuff2.IsEquipDebuff, cBuff2.StackCount);
					cBuff2.IsShowFirstEffect = true;
				}
			}
		}
		if (IsOverNamed)
		{
			BossGauge?.SetHP(m_nGvHP, m_nShieldHP, m_nShieldMax);
			m_RageManager.CheckRageHP(m_nGvHP, base.CharacterData.MaxHP);
		}
		else
		{
			HeadUI?.SetHP(m_nGvHP, base.CharacterData.MaxHP, m_nShieldHP);
		}
		if (IsBoss)
		{
			CSingletonBehaviour<CBattleManager>.Instance.SetLastBossHP(this, m_nGvHP);
		}
		if (IsBoss && CDungeonScene.Instance.IsGuildRaid)
		{
			BossGauge.SetGuildRiadHPString();
		}
		if (IsBoss && CDungeonScene.Instance.DungeonTemplet.DungeonMode == DUNGEON_MODE.DM_EXPLORATION_SPOT_BOSS)
		{
			BossGauge.SetGuildRiadHPString();
		}
		if ((CDungeonScene.Instance.IsPvp || CDungeonScene.Instance.IsPvpRealtime) && (!CDungeonScene.Instance.IsPvpRealtime || CPVPRealTimeManager.PvpRealtimeMatch.IsMatchStarted))
		{
			CDungeonScene.Instance.UpdatePvpTeamHp(base.TeamType);
		}
		return _nValue;
	}
