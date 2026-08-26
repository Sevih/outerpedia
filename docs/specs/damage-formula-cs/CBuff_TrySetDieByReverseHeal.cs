// CBuff$$TrySetDieByReverseHeal — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CBuff.cs.

	private void TrySetDieByReverseHeal()
	{
		if (Owner.HP == 0 && Owner.IsAlive && !Owner.IsNotDie)
		{
			Owner.SetDie();
			if (TEAM_TYPE.ENEMY == Owner.TeamType && Owner.IsBoss)
			{
				Owner.GetTeam().BossKill();
			}
		}
	}
