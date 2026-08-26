// CBattleManager$$ApplyDamageCap — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBattleManager.cs.

	private static int ApplyDamageCap(CCharacterBattle _Defender, BUFF_TYPE _eCapBuffType, int _nDamage)
	{
		foreach (CBuff item in _Defender.GetBuffListByType(_eCapBuffType))
		{
			if (item != null && item.CheckCondition() && _nDamage > item.Value)
			{
				_nDamage = item.Value;
				CDebug.Log("ApplyDamageCap : " + item.Value);
			}
		}
		return _nDamage;
	}
