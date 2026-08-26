// CSkillManager$$GetBuffList — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CSkillManager.cs.

	private void GetBuffList(SKILL_TYPE _eSkillType, bool _IsPassiveSkill, BUFF_CREATE_TYPE _eBuffCreateType, ref List<CBuffTemplet> _BuffTempletList)
	{
		if (SKILL_TYPE.SKT_ALL == _eSkillType)
		{
			foreach (CSkill skill in m_SkillList)
			{
				foreach (CBuffTemplet buffTemplet in skill.m_BuffTempletList)
				{
					if ((buffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || buffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && buffTemplet.IsBuffCreateType(_eBuffCreateType) && buffTemplet.IsCallerSkillType(_eSkillType))
					{
						_BuffTempletList.Add(buffTemplet);
					}
				}
			}
		}
		else if (SKILL_TYPE.SKT_NONE != _eSkillType && GetSkill(_eSkillType) != null)
		{
			foreach (CBuffTemplet buffTemplet2 in GetSkill(_eSkillType).m_BuffTempletList)
			{
				if (buffTemplet2.IsBuffCreateType(_eBuffCreateType) && buffTemplet2.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(buffTemplet2);
				}
			}
		}
		if (_IsPassiveSkill)
		{
			foreach (CSkill skill2 in m_SkillList)
			{
				if (!skill2.IsPassive)
				{
					continue;
				}
				foreach (CBuffTemplet BuffTemplet in skill2.m_BuffTempletList)
				{
					if (BuffTemplet.IsBuffCreateType(_eBuffCreateType) && BuffTemplet.IsCallerSkillType(_eSkillType) && !_BuffTempletList.Exists((CBuffTemplet x) => x == BuffTemplet))
					{
						_BuffTempletList.Add(BuffTemplet);
					}
				}
			}
			if (GetSkill(SKILL_TYPE.SKT_UNIQUE_PASSIVE) != null)
			{
				foreach (CBuffTemplet BuffTemplet2 in GetSkill(SKILL_TYPE.SKT_UNIQUE_PASSIVE).m_BuffTempletList)
				{
					if (BuffTemplet2.IsBuffCreateType(_eBuffCreateType) && BuffTemplet2.IsCallerSkillType(_eSkillType) && !_BuffTempletList.Exists((CBuffTemplet x) => x == BuffTemplet2))
					{
						_BuffTempletList.Add(BuffTemplet2);
					}
				}
			}
		}
		foreach (CBuffTemplet itemBuffTemplet in m_ItemBuffTempletList)
		{
			if ((itemBuffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || itemBuffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && itemBuffTemplet.IsBuffCreateType(_eBuffCreateType) && itemBuffTemplet.IsCallerSkillType(_eSkillType))
			{
				_BuffTempletList.Add(itemBuffTemplet);
			}
		}
		if (m_ItemSetBuffTempletList != null)
		{
			foreach (CBuffTemplet itemSetBuffTemplet in m_ItemSetBuffTempletList)
			{
				if (itemSetBuffTemplet.IsBuffCreateType(_eBuffCreateType) && itemSetBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(itemSetBuffTemplet);
				}
			}
		}
		if (m_ArtifactBuffTempletList != null)
		{
			foreach (CBuffTemplet artifactBuffTemplet in m_ArtifactBuffTempletList)
			{
				if (artifactBuffTemplet.IsBuffCreateType(_eBuffCreateType) && artifactBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(artifactBuffTemplet);
				}
			}
		}
		if (m_GuildRaidBuffTempletList != null)
		{
			foreach (CBuffTemplet guildRaidBuffTemplet in m_GuildRaidBuffTempletList)
			{
				if (guildRaidBuffTemplet.IsBuffCreateType(_eBuffCreateType) && guildRaidBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(guildRaidBuffTemplet);
				}
			}
		}
		if (m_PvpLeagueBuffTempletList != null)
		{
			foreach (CBuffTemplet pvpLeagueBuffTemplet in m_PvpLeagueBuffTempletList)
			{
				if (pvpLeagueBuffTemplet.IsBuffCreateType(_eBuffCreateType) && pvpLeagueBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(pvpLeagueBuffTemplet);
				}
			}
		}
		if (m_PVPRealTimeLeaderBuffTempletList != null)
		{
			foreach (CBuffTemplet pVPRealTimeLeaderBuffTemplet in m_PVPRealTimeLeaderBuffTempletList)
			{
				if (pVPRealTimeLeaderBuffTemplet.IsBuffCreateType(_eBuffCreateType) && pVPRealTimeLeaderBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(pVPRealTimeLeaderBuffTemplet);
				}
			}
		}
		if (m_AwakeningNodeBuffTempletList != null)
		{
			foreach (CBuffTemplet awakeningNodeBuffTemplet in m_AwakeningNodeBuffTempletList)
			{
				if ((awakeningNodeBuffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || awakeningNodeBuffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && awakeningNodeBuffTemplet.IsBuffCreateType(_eBuffCreateType) && awakeningNodeBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(awakeningNodeBuffTemplet);
				}
			}
		}
		if (m_InfiltrateBuffTempletList != null)
		{
			foreach (CBuffTemplet infiltrateBuffTemplet in m_InfiltrateBuffTempletList)
			{
				if ((infiltrateBuffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || infiltrateBuffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && infiltrateBuffTemplet.IsBuffCreateType(_eBuffCreateType) && infiltrateBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(infiltrateBuffTemplet);
				}
			}
		}
		if (m_MonadGateBuffTempletList != null)
		{
			foreach (CBuffTemplet monadGateBuffTemplet in m_MonadGateBuffTempletList)
			{
				if ((monadGateBuffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || monadGateBuffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && monadGateBuffTemplet.IsBuffCreateType(_eBuffCreateType) && monadGateBuffTemplet.IsCallerSkillType(_eSkillType))
				{
					_BuffTempletList.Add(monadGateBuffTemplet);
				}
			}
		}
		if (m_DailyGiftBuffTempletList == null)
		{
			return;
		}
		foreach (CBuffTemplet dailyGiftBuffTemplet in m_DailyGiftBuffTempletList)
		{
			if ((dailyGiftBuffTemplet.Type != BUFF_TYPE.BT_STAT_PREMIUM || dailyGiftBuffTemplet.TargetType != BUFF_TARGET_TYPE.ME) && dailyGiftBuffTemplet.IsBuffCreateType(_eBuffCreateType) && dailyGiftBuffTemplet.IsCallerSkillType(_eSkillType))
			{
				_BuffTempletList.Add(dailyGiftBuffTemplet);
			}
		}
	}
