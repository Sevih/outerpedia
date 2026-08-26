// CCharacterBattle$$SetShieldHP — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterBattle.cs.

	public void SetShieldHP(int _nShieldHP)
	{
		int nShieldMax = (m_nShieldHP = _nShieldHP);
		m_nShieldMax = nShieldMax;
		if (IsOverNamed)
		{
			BossGauge?.SetHP(m_nGvHP, m_nShieldHP, m_nShieldMax);
		}
		else
		{
			HeadUI?.SetHP(m_nGvHP, base.CharacterData.MaxHP, m_nShieldHP);
		}
	}
