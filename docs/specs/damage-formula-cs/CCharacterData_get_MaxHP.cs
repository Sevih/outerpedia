// CCharacterData$$get_MaxHP — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.
// Note du manifeste : Buff de guilde / titre sur les PV max (spec § 16.2).

	public int MaxHP
	{
		get
		{
			CheckStatDirty();
			int num = m_StatDic[STAT_TYPE.ST_HP].GetFinalValue();
			if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.IsWorldBoss && Templet.IsBoss())
			{
				num = CDungeonScene.Instance.Hud.GetBossGauge().WorldBossMaxHP;
			}
			return Mathf.FloorToInt((float)num * MaxHPRate);
		}
		set
		{
			m_StatDic[STAT_TYPE.ST_HP].SetTempMaxValue(value);
		}
	}
