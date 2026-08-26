// CBuff$$Run — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.

	public void Run()
	{
		IsCreatedThisTurn = Templet.BuffCreateType != BUFF_CREATE_TYPE.ON_GOLDEN_CURSE_BUFF_REMOVE && Owner.IsTurnOwner;
		RemainTurnCont = Templet.TurnDuration;
		if (Templet.BuffRemoveType == BUFF_REMOVE_TYPE.ON_HIT_OVER)
		{
			RemainTurnCont = -1;
		}
		if (!OnCreate())
		{
			return;
		}
		CSingletonBehaviour<CBattleManager>.Instance.BattleMissionCheck(this, Owner);
		PlayCreateEffect();
		foreach (string lastingEffect in Templet.LastingEffectList)
		{
			CEffect item = CSingletonBehaviour<CEffectManager>.Instance.Play(lastingEffect, Owner, null, null, null);
			LastingEffectList.Add(item);
		}
		if (Templet.MaterialType != CHARACTER_MATERIAL_TYPE.CMT_NONE)
		{
			Owner.Render.ChangeMaterials(Templet.MaterialType);
		}
		if (IsDebuff && !Templet.IsBuffCreateType(BUFF_CREATE_TYPE.PASSIVE) && !Templet.IsBuffCreateType(BUFF_CREATE_TYPE.ON_SPAWN) && Owner.TeamType != Caster.TeamType)
		{
			Caster.SkillRecord.IsDebuffAttack = true;
			Owner.SkillRecord.DebuffAttacker = Caster;
		}
	}
