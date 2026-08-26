// CCommonDefine$$get_MISSED_DAMAGE_RATE_PERMILLE — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCommonDefine.cs.

	public static int MISSED_DAMAGE_RATE_PERMILLE
	{
		get
		{
			if (m_nMissedDamageRatePermille == 0)
			{
				m_nMissedDamageRatePermille = CTempletManager.Instance.GetGameConfig(GAME_CONFIG.MISSED_DAMAGE_RATE).Value;
			}
			return m_nMissedDamageRatePermille;
		}
	}
