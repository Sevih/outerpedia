// CItemMainOption$$get_OptionValue — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CItemMainOption.cs.

	public override int OptionValue => (int)((float)base.Templet.OptionValue * (1f + EnchantFactor + SingularityFactor) * (1f + BreakLimitFactor));
