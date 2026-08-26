// CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|81_1 — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStateBattle.cs.
// Le binaire cite fonction locale PlayDamage — généré par le compilateur, ILSpy le replie dans CStateBattle.PvpAttackTeamPenaltyDmg.

	private IEnumerator PvpAttackTeamPenaltyDmg(int _nDmgHpRate)
	{
		if (!m_ShowPenalty)
		{
			m_ShowPenalty = true;
			bool MsgDelay = true;
			CUIManager.Instance.SimpleMessage(CSystemString.SYS_PVP_PENALTY_SKILL_MES, delegate
			{
				MsgDelay = false;
			});
			while (MsgDelay)
			{
				yield return null;
			}
		}
		StartEffect(CDungeonScene.Instance.m_UserTeam);
		StartEffect(CDungeonScene.Instance.m_EnemyTeam);
		yield return (object)new WaitForSeconds(0.2f);
		PlayDamage(CDungeonScene.Instance.m_UserTeam);
		PlayDamage(CDungeonScene.Instance.m_EnemyTeam);
		yield return (object)new WaitForSeconds(2f);
		CDungeonScene.Instance.UpdatePvpTurnPenalty();
		ChangeSubState(SUB_STATE.RETURN);
		void PlayDamage(CTeam _Team)
		{
			//IL_00ec: Unknown result type (might be due to invalid IL or missing references)
			//IL_00f1: Unknown result type (might be due to invalid IL or missing references)
			//IL_00d1: Unknown result type (might be due to invalid IL or missing references)
			//IL_00db: Unknown result type (might be due to invalid IL or missing references)
			//IL_010c: Unknown result type (might be due to invalid IL or missing references)
			CDamageTypeTemplet damageTypeTemplet = CTempletManager.Instance.GetDamageTypeTemplet(DAMAGE_TYPE.DT_LIGHTNING_HIT);
			foreach (CCharacterBattle member in _Team.m_MemberList)
			{
				if (Object.op_Implicit((Object)(object)member))
				{
					int num = CCommonDefine.MulPermille(member.CharacterData.MaxHP, _nDmgHpRate);
					member.AddHP(-num, _bHeal: false, _bIgnoreUndead: true);
					CDungeonScene.Instance.Hud.PlayHudTextDamage(num, _IsHeal: false, _IsCritical: false, ((Component)member).transform, _IsBreak: false);
					if (member.HP == 0 && member.IsAlive)
					{
						member.SetDie();
					}
					if (0 < damageTypeTemplet.SoundNameList.Count)
					{
						CSingletonBehaviour<CSoundManager>.Instance.PlaySound(CSoundManager.SOUND_TYPE.EFFECT, damageTypeTemplet.SoundName, ((Component)member).gameObject);
					}
					if (0 < damageTypeTemplet.ParticleNameList.Count)
					{
						CSingletonBehaviour<CEffectManager>.Instance.Play(damageTypeTemplet.ParticleNameList[0], member, member, ((Component)member).transform.position, Vector3.zero);
					}
					if (damageTypeTemplet.HitColorRGB != Color.black && damageTypeTemplet.HitColorDuration != 0f)
					{
						member.PlayHitLightEffect(damageTypeTemplet.HitColorRGB, damageTypeTemplet.HitColorDuration);
					}
					member.ChangeDamageReactState(DAMAGE_REACT_TYPE.DRT_SMALL, _bRandom: false);
				}
			}
		}
		static void StartEffect(CTeam _Team)
		{
			foreach (CCharacterBattle member2 in _Team.m_MemberList)
			{
				if (Object.op_Implicit((Object)(object)member2))
				{
					CSingletonBehaviour<CEffectManager>.Instance.Play("FX_PVP_Penalty", member2, member2);
				}
			}
		}
	}
