// CBuffSystemManager$$CheckMaxHPEvent — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuffSystemManager.cs.
// Note du manifeste : Taux MAX_HP par contenu (guilde + titre) — spec § 16.2.

	public float CheckMaxHPEvent(DUNGEON_MODE _eDungeonMode, DUNGEON_PLAY_MODE _eDungeonPlayMode, int _nAreaID = 0)
	{
		int num = 0;
		foreach (CEventBuffGroupData buffGroupData in m_BuffGroupDatas)
		{
			num += buffGroupData.CheckMaxHPEvent(_eDungeonMode, _eDungeonPlayMode, _nAreaID);
		}
		CUserNickNameTemplet userNickNameTemplet = CTempletManager.Instance.GetUserNickNameTemplet(CPlayer.SelectedUserTitleID);
		if (userNickNameTemplet != null && userNickNameTemplet.BuffSystemGroupID != 0)
		{
			CBuffSystemTemplet buffSystemTemplet = CTempletManager.Instance.GetBuffSystemTemplet(userNickNameTemplet.BuffSystemGroupID);
			if (buffSystemTemplet != null && _eDungeonPlayMode != DUNGEON_PLAY_MODE.DPM_PVP && buffSystemTemplet.IsEnableDungeonMode(_eDungeonMode) && buffSystemTemplet.BuffType == EVENT_BUFF_TYPE.EBT_MAX_HP)
			{
				num += buffSystemTemplet.BuffValue;
			}
		}
		return (float)(100 + num) * 0.01f;
	}
