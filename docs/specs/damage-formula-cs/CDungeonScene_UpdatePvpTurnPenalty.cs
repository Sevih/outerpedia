// CDungeonScene$$UpdatePvpTurnPenalty — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CDungeonScene.cs.

	public void UpdatePvpTurnPenalty()
	{
		PvpPenaltyLevel++;
		PvpPenaltyTurnCount += CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PVP_ATK_PENALTY_LOOP_TURN).Value;
		PvpPenaltyDmgRate += CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PVP_ATK_PENALTY_DMG_ADD_RATE).Value;
		PvpPenaltyMaxTurnCount = PvpPenaltyTurnCount - UserTurnCount;
		if (PvpHealReduceRate == 0)
		{
			PvpHealReduceRate = CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PVP_HEAL_PENALTY_REDUCE_RATE).Value;
		}
		else
		{
			PvpHealReduceRate += CTempletManager.Instance.GetGameConfig(GAME_CONFIG.PVP_HEAL_PENALTY_REDUCE_ADD_RATE).Value;
		}
		if (PvpHealReduceRate > 1000)
		{
			PvpHealReduceRate = 1000;
		}
		CDebug.Log("PvpHealReduceRate : " + PvpHealReduceRate);
		Hud.UpdatePenaltySkill();
	}
