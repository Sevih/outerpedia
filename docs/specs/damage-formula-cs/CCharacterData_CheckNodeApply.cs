// CCharacterData$$CheckNodeApply — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CCharacterData.cs.

	private bool CheckNodeApply(CAwakeningNodeData node)
	{
		if (node.NodeTemplet.AwakeningType == AWAKENING_TYPE.PVE)
		{
			int iD = node.LevelTemplet.ID;
			if ((uint)(iD - 198) <= 3u)
			{
				return Type >= CHARACTER_TYPE.CT_BOSS_MONSTER;
			}
		}
		if (Type != CHARACTER_TYPE.CT_PC)
		{
			return false;
		}
		if (node.NodeTemplet.AwakeningType == AWAKENING_TYPE.ADVENTURE_LICENSE && !CDungeonScene.IsApplyAwakeningNodeAdventureLicense())
		{
			return false;
		}
		int awakeningApplyTypeValue = node.NodeTemplet.AwakeningApplyTypeValue;
		return node.NodeTemplet.AwakeningApplyType switch
		{
			AWAKENING_APPLYING_TYPE.AAT_ELEMENTAL => Element == (CHARACTER_ELEMENT_TYPE)awakeningApplyTypeValue, 
			AWAKENING_APPLYING_TYPE.AAT_CLASS => Class == (CHARACTER_CLASS_TYPE)awakeningApplyTypeValue, 
			AWAKENING_APPLYING_TYPE.AAT_SUBCLASS => SubClass == (CHARACTER_SUB_CLASS_TYPE)awakeningApplyTypeValue, 
			_ => true, 
		};
	}
