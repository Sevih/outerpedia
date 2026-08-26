// CFormula$$GetBattleRandomRange — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CFormula.cs.
// 2 surcharges, dans l'ordre du source.
// Note du manifeste : Le listing porte les deux surcharges (int, int) et (float, float).

	public static int GetBattleRandomRange(int nMin, int nMax)
	{
		if (!CPVPRealTimeManager.PvpRealtimeMatch.GetRandomRange(nMin, nMax, out var rand))
		{
			return GetRandomRange(nMin, nMax);
		}
		return rand;
	}

	public static float GetBattleRandomRange(float min, float max)
	{
		if (!CPVPRealTimeManager.PvpRealtimeMatch.GetRandomRange(min, max, out var rand))
		{
			return GetRandomRange(min, max);
		}
		return rand;
	}
