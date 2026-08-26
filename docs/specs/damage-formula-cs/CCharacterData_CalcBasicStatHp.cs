// CCharacterData$$CalcBasicStatHp — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.
// Note du manifeste : Base HP (§ 17.2) — séparée des autres stats dans CalcBasicStats.

	protected virtual void CalcBasicStatHp()
	{
		m_StatDic[STAT_TYPE.ST_HP].SetBaseValue(Templet.HP_Min, Templet.HP_Max, Level, SpawnAdvantageRateHP, 0, this);
	}
