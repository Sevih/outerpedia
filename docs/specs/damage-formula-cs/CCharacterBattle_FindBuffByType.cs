// CCharacterBattle$$FindBuffByType — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public CBuff FindBuffByType(BUFF_TYPE _eBuffType)
	{
		foreach (CBuff buff in m_BuffList)
		{
			if (buff.Type == _eBuffType)
			{
				return buff;
			}
		}
		return null;
	}
