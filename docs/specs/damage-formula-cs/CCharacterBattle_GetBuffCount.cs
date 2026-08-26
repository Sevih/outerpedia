// CCharacterBattle$$GetBuffCount — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.
// Note du manifeste : Compteur des buffs/débuffs VISIBLES (tooltip > 0, non neutres) — les familles OWNER/TARGET_(DE)BUFF de § 9.1.

	public int GetBuffCount(bool _IsDeBuff)
	{
		int num = 0;
		foreach (CBuff buff in m_BuffList)
		{
			if (_IsDeBuff == buff.IsDebuff && !buff.IsNeutral && 0 < buff.Templet.ToolTipID)
			{
				num++;
			}
		}
		return num;
	}
