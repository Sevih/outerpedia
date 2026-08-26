// CSkillManager$$GetBuffListOnSpawn — client Steam 1.4.15 (Assembly-CSharp.dll, Mono)
// Régénéré par `pnpm datagen:extract-cs` — NE PAS ÉDITER. Source : CSkillManager.cs.

	public void GetBuffListOnSpawn(out List<CBuffTemplet> _BuffTempletList)
	{
		_BuffTempletList = new List<CBuffTemplet>();
		GetBuffList(SKILL_TYPE.SKT_NONE, _IsPassiveSkill: true, BUFF_CREATE_TYPE.ON_SPAWN, ref _BuffTempletList);
		GetBuffList(SKILL_TYPE.SKT_NONE, _IsPassiveSkill: true, BUFF_CREATE_TYPE.ON_SPAWN2, ref _BuffTempletList);
	}
