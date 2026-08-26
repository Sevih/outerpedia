// CFormula$$CheckResist — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.

	public static bool CheckResist(int _nAttackerBuffChance, int _nDefenderBuffResist)
	{
		if (_nAttackerBuffChance > _nDefenderBuffResist)
		{
			return false;
		}
		int num = _nDefenderBuffResist - _nAttackerBuffChance;
		if (num == 0)
		{
			num = 1;
		}
		return CheckProbabilityPermille(Mathf.FloorToInt(1000f / (1f + 100f / (float)num)));
	}
