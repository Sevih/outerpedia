// CCharacterBattle$$GetAttackStat — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public int GetAttackStat()
	{
		CBuff cBuff = FindBuffByType(BUFF_TYPE.BT_SWAP_STAT_ATTACK);
		if (cBuff != null && cBuff.CheckAvailable(this))
		{
			int finalStat = base.CharacterData.GetFinalStat(cBuff.StatType);
			if (cBuff.ApplyingType == OPTION_APPLYING_TYPE.OAT_RATE)
			{
				return CCommonDefine.MulPermille(finalStat, cBuff.Value);
			}
			return finalStat + cBuff.Value;
		}
		return base.CharacterData.Atk;
	}
