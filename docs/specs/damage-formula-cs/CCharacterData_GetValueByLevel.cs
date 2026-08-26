// CCharacterData$$GetValueByLevel — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	public int GetValueByLevel(int _nLevel, STAT_TYPE _eStat, bool _bFinal = true)
	{
		CCharacterTranscendentTemplet characterTranscendent = CTempletManager.Instance.GetCharacterTranscendent(Templet.BasicStar, Star, ID);
		switch (_eStat)
		{
		case STAT_TYPE.ST_ATK:
		{
			int nPermille3 = characterTranscendent?.RewardAtkRate ?? 0;
			int num3 = CFormula.CalcStat(Templet.Atk_Min, Templet.Atk_Max, _nLevel);
			num3 += CCommonDefine.MulPermille(num3, nPermille3);
			if (_bFinal)
			{
				return m_StatDic[_eStat].GetFinalValueByValue(num3);
			}
			return num3;
		}
		case STAT_TYPE.ST_HP:
		{
			int nPermille2 = characterTranscendent?.RewardHPRate ?? 0;
			int num2 = CFormula.CalcStat(Templet.HP_Min, Templet.HP_Max, _nLevel);
			num2 += CCommonDefine.MulPermille(num2, nPermille2);
			if (_bFinal)
			{
				return m_StatDic[_eStat].GetFinalValueByValue(num2);
			}
			return num2;
		}
		case STAT_TYPE.ST_DEF:
		{
			int nPermille = characterTranscendent?.RewardDefRate ?? 0;
			int num = CFormula.CalcStat(Templet.Def_Min, Templet.Def_Max, _nLevel);
			num += CCommonDefine.MulPermille(num, nPermille);
			if (_bFinal)
			{
				return m_StatDic[_eStat].GetFinalValueByValue(num);
			}
			return num;
		}
		default:
			return 0;
		}
	}
