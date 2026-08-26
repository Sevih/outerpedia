// CCharacterData$$AddEvolutionStatToDictionary — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private void AddEvolutionStatToDictionary(Dictionary<STAT_TYPE, int> _Dic, STAT_TYPE _eStat, int _nValue)
	{
		if (_Dic.ContainsKey(_eStat))
		{
			_Dic[_eStat] += _nValue;
		}
		else
		{
			_Dic.Add(_eStat, _nValue);
		}
	}
