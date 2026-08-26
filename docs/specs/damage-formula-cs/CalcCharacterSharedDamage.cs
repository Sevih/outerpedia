// CFormula$$CalcCharacterSharedDamage — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcCharacterSharedDamage(CCharacterBattle _Defender, int _nDamge)
	{
		IEnumerable<CCharacterBattle> charactersMultiSharedDamage = _Defender.GetTeam().GetCharactersMultiSharedDamage(_Defender);
		if (charactersMultiSharedDamage.Count() > 0)
		{
			int num = _nDamge;
			foreach (CCharacterBattle item in charactersMultiSharedDamage)
			{
				CBuff cBuff = item.FindBuffByType(BUFF_TYPE.BT_SHARE_DMG_MULTI);
				if (cBuff.ApplyingType == OPTION_APPLYING_TYPE.OAT_RATE)
				{
					int num2 = CCommonDefine.MulPermille(_nDamge, cBuff.Value);
					item.SkillRecord.MultiSharedDamage += num2;
					num -= num2;
					if (num < 0)
					{
						num = 0;
					}
				}
			}
			_nDamge = num;
		}
		CCharacterBattle characterSharedDamage = _Defender.GetTeam().GetCharacterSharedDamage();
		if (Object.op_Implicit((Object)(object)characterSharedDamage) && (Object)(object)characterSharedDamage != (Object)(object)_Defender)
		{
			CBuff cBuff2 = characterSharedDamage.FindBuffShareDamage();
			if (cBuff2 != null)
			{
				int num3 = CCommonDefine.MulPermille(_nDamge, cBuff2.Value);
				_nDamge -= num3;
				characterSharedDamage.SkillRecord.SharedDamage += num3;
			}
		}
		return _nDamge;
	}
