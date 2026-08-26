// CFormula$$CalcDamageWG — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static int CalcDamageWG(CCharacterBattle _Attacker, CCharacterBattle _Defender, int _nCustomValue = 0)
	{
		CBuff cBuff = _Defender.FindBuffWGInvincible(_Attacker);
		if (cBuff != null)
		{
			cBuff.PlayActivateEffect();
			return 0;
		}
		int num = ((_nCustomValue == 0) ? _Attacker.UsingSkill.WGReduce : _nCustomValue);
		_Defender.FindBuffWGDamageReduce(out var _nAdd, out var _nRate, _Attacker);
		num = CCommonDefine.ApplyRate(num + _nAdd, _nRate);
		return Mathf.Max(0, num);
	}
