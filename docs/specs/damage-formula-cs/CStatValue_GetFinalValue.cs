// CStatValue$$GetFinalValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CStatValue.cs.

	public virtual int GetFinalValue()
	{
		if ((int)m_nTempMaxValue != -1)
		{
			return m_nTempMaxValue;
		}
		if (m_IsDirty)
		{
			SetFinalValue();
		}
		if ((Object)(object)CDungeonScene.Instance != (Object)null && CDungeonScene.Instance.m_StatCapDic.TryGetValue(m_eType, out var value))
		{
			return Mathf.Min(m_nFinalValue, value);
		}
		return m_nFinalValue;
	}
