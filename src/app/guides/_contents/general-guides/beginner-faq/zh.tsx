'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import GuideIconInline from '@/app/components/GuideIconInline'
import ItemInlineDisplay from '@/app/components/ItemInline'
import StarLevel from '@/app/components/StarLevel'
import StatInlineTag from '@/app/components/StatInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import Link from 'next/link'
import ElementInlineTag from '@/app/components/ElementInline'
import SkillInline from '@/app/components/SkillInline'

export default function BeginnerFAQ() {
  return (
    <GuideTemplate
      title="新手常见问题"
      introduction="整理自社区讨论和资深玩家建议的新手常见问题汇总。"
      defaultVersion="default"
      versions={{
        default: {
          label: 'FAQ',
          content: (
            <div className="space-y-12">
              {/* Getting Started */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-sky-400 border-l-4 border-sky-500 pl-4">入门指南</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-sky-300">刷初始有多重要？</h4>
                    <p className=" leading-relaxed">
                      早期获得<Link href="/guides/general-guides/premium-limited" className="text-blue-400 hover:text-blue-300 underline">精选/限定英雄</Link>会有帮助，但不是必须的。
                    </p>
                    <p className=" leading-relaxed">
                      <Link href="/guides/general-guides/free-heroes-start-banner" className="text-blue-400 hover:text-blue-300 underline">免费获得的英雄</Link>足以作为良好的起步基础。
                    </p>
                    <p className=" leading-relaxed">
                      除了招募之外，你还可以在分身挑战中获得普通英雄（完成支线故事后，每个角色需要8天）。
                    </p>
                  </div>
                </div>

              </section>

              {/* Heroes & Pulling */}
              < section className="space-y-6" >
                <h3 className="text-2xl font-bold text-purple-400 border-l-4 border-purple-500 pl-4">英雄与抽卡</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-purple-300">应该抽谁？</h4>
                    <p className=" leading-relaxed">
                      Outerplane的目标是<strong>使用多种英雄</strong>，而不是专注于少数核心角色，所以最终目标是拥有大部分英雄。
                    </p>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-purple-300">
                          <span>限定</span>
                        </div>
                        <p className="text-sm ">
                          <ItemInlineDisplay names={'Ether'} />优先用于限定英雄（季节、节日、联动卡池）。他们不一定比其他英雄强，但只能在卡池期间获得，可以让某些战斗更轻松。在卡池期间至少确保3星。
                        </p>
                      </div>

                      <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-amber-300">精选</h5>
                        <p className="text-sm ">
                          精选卡池每7天可以更换一次UP目标。刚开始时，可以先抽当前UP英雄再更换。
                          推荐顺序请参阅<Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">专用指南</Link>。
                        </p>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-green-300">常规</h5>
                        <p className="text-sm  mb-2">
                          对于UP招募和定向招募的常规英雄，建议只使用<ItemInlineDisplay names={'Special Recruitment Ticket'} /> <ItemInlineDisplay names={'Special Recruitment Ticket (Event)'} />。
                          <br />定向招募的首要目标是能提供<EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />增益的英雄。
                        </p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" /> <br />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">需要抽重复吗？</h4>

                    <div className="space-y-4">
                      <div>
                        <p className=" leading-relaxed mb-2">
                          常规英雄可以在分身挑战中获得，所以不需要抽多份。
                          不招募解锁3星英雄需要250碎片，超越每阶段需要150碎片(*)。
                          因此招募常规英雄同时在分身挑战中刷超越材料效率略高。
                          新英雄需要3个月才会加入分身挑战和定向招募。
                        </p>
                        <p className='text-xs text-gray-300 mb-4'>
                          (*) 超越阶段：4星、4+、5星、5+、5++、6星，共需900碎片。
                        </p>
                        <div className="ml-4 space-y-1 text-sm text-gray-400">
                          <p>• <StarLevel levelLabel='4' /> — 弱点槽伤害增加是主要目标。</p>
                          <p>• <StarLevel levelLabel='5' /> — 如果有有趣的爆发3效果。</p>
                          <p>• <StarLevel levelLabel='6' /> — 常规英雄通常优先级不高，只提供属性加成和战斗开始时25AP。</p>
                        </div>
                      </div>

                      <div>
                        <p className=" leading-relaxed">
                          <strong className="text-amber-300">精选</strong>和<strong className="text-purple-400">限定</strong>英雄主要通过重复抽取超越，所以可能需要多份。
                          需要多少取决于各自的技能组，但基本上3星就能正常运作。
                          各英雄评价和超越详情请参阅<Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">这里</Link>。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">初始队伍怎么搭配？</h4>
                    <p className=" leading-relaxed">
                      故事模式的标准队伍是主力输出、暴击率增益角色、奶妈，以及自由位（减益角色、副输出、增益角色或坦克）。
                      大部分故事不需要坦克，奶妈或战士型角色就能应付。
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300 mb-2">DPS（来自新手冲刺卡池）</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Ame" />
                          <CharacterLinkCard name="Rey" />
                          <CharacterLinkCard name="Rin" />
                          <CharacterLinkCard name="Vlada" />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-blue-300 mb-2">暴击增益（来自定向招募卡池）</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300 mb-2">奶妈</p>
                        <div className="gap-1">

                          <CharacterLinkCard name="Mene" />免费获得，之后可以在<CharacterLinkCard name="Dianne" />和<CharacterLinkCard name="Nella" />中选择一个。<CharacterLinkCard name="Monad Eva" />因为有无条件的<EffectInlineTag name='BT_CALL_BACKUP' type='buff' />，也推荐从<strong className="text-amber-300">精选卡池</strong>获取。
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded">
                        <p className="text-sm font-semibold text-amber-300 mb-2">自由位/辅助</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Veronica" />
                          <CharacterLinkCard name="Eternal" />
                          <CharacterLinkCard name="Akari" />或途中获得的其他英雄。
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded mt-3">
                      <span className="text-sm ">
                        <strong>首要BOSS优先级：</strong>
                        <ul>
                          <li><GuideIconInline name="IG_Turn_4034002" text="不明嵌合体" size={30} />：<StatInlineTag name='SPD' />和<StatInlineTag name='CHD' />等防具套装。</li>
                          <li><GuideIconInline name="IG_Turn_4076001" text="格利西斯" size={30} />和<GuideIconInline name="IG_Turn_4076002" text="炎之骑士梅特奥斯" size={30} />：武器/饰品。</li>
                        </ul>
                        <p className='mt-4'>
                          专注于<ElementInlineTag element='earth' />和<ElementInlineTag element='fire' />英雄的队伍适合作为第一支培养的队伍。长期目标是拥有各属性的队伍，但一次专注培养一支队伍。
                          完成一支强力队伍会加速下一支队伍的培养。
                        </p>
                        <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded">

                          <p className="text-sm ">
                            <strong>提示：</strong>第10关之前可以使用好友的支援英雄，所以这不是严格要求。
                          </p>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </section>


              {/* What to do */}
              <section>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-sky-300">首先应该去哪里？</h4>
                  <p className=" leading-relaxed">
                    游戏内的<strong>艾娃引导任务</strong>会在推进故事的同时引导你了解各种游戏模式。
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        在挑战的<Link href="/guides/special-request" className="text-blue-400 underline">特别委托</Link>中，可以解锁强力新手包：6名英雄、装备和升级材料。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        初期经验获取较慢。推进<strong>悬赏追击</strong>关卡来每天获得更多食物。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        <Link href="/guides/skyward-tower" className="text-blue-400 underline">升天之塔</Link>每月重置，尽可能爬到更高层。
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              {/* Gear & Equipment */}
              < section className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 border-l-4 border-amber-500 pl-4">装备与器材</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">如何获得装备？</h4>
                    <p className=" leading-relaxed">
                      艾娃引导任务和升天之塔会在升级过程中提供装备，还有挑战！特别委托任务的6星传说装备。当积累足够的调查站或竞技场货币时，也能获得不错的6星装备。
                      在特别委托BOSS的第10关通关、只掉落6星装备之前，装备刷取不是主要重点。
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-cyan-900/10 border-l-4 border-cyan-500 rounded">
                        <p className="text-sm font-semibold text-cyan-300 mb-1">防具优先</p>
                        <p className="text-sm ">
                          <GuideIconInline name="IG_Turn_4034002" text="不明嵌合体" size={30} />是防具的首要目标。速度、反击、暴击、（命中）套装适用于任何职业。神圣守护者的穿透套装对输出更强，但这个BOSS不提供对其他职业通用的套装。
                        </p>
                      </div>

                      <div className="p-3 bg-rose-900/10 border-l-4 border-rose-500 rounded">
                        <p className="text-sm font-semibold text-rose-300 mb-1">武器/饰品</p>
                        <p className="text-sm ">
                          武器和饰品技能取决于BOSS，每个BOSS只掉落特定主属性的饰品。<br />
                          <GuideIconInline name="IG_Turn_4076001" text="格利西斯" size={30} />提供速度和暴击率主属性（还有防御和抵抗）的饰品，是武器和饰品的首选目标。<br />
                          <GuideIconInline name="IG_Turn_4076002" text="梅特奥斯" size={30} />是下一个简单目标，提供穿透、暴击伤害、生命、效果命中的饰品主属性。Veronica可以单刷第10关。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">如何获得专属装备和护符？</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                        <p className="text-sm font-semibold text-purple-300 mb-1">专属装备</p>
                        <p className="text-sm ">
                          英雄的专属装备在信赖度10级时获得。<br />
                          礼物可以从基地的黑市探险获得，也可以在有每日入场限制的故事BOSS关卡刷取。<br />
                          异常歼灭作战：追击行动中击败BOSS也能获得礼物。
                          <br />某些活动可以获得誓约决心，立即将信赖度提升到满级。
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded">
                        <p className="text-sm font-semibold text-indigo-300 mb-1">护符和符咒</p>
                        <p className="text-sm ">
                          大恶魔遗迹的无限回廊是护符的主要来源。大恶魔遗迹商店每月提供一个6星选择器。<br />
                          挑战！特别委托任务也能获得一些。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">哪些装备值得保留？</h4>
                    <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded mb-3">
                      <p className="text-sm font-semibold text-red-300">注意：不要扔掉蓝色装备！</p>
                    </div>
                    <p className=" leading-relaxed">
                      史诗装备是基础，与传说装备差距不大，升级成本也更低。<br />
                      获得6星装备后（使用好友支援很快），重铸的史诗装备可以轻松超越5星传说装备，甚至副属性较低的6星传说装备。<br />
                      绿色/优秀装备主属性会降低，但头盔/护甲/鞋子在副属性强的情况下也能有好结果。
                    </p>
                    <p>
                      装备可以重铸星数次，在4个副属性填满之前解锁新副属性，之后随机提升其中一个。最大副属性总计：
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="p-2 bg-red-900/20 rounded text-center">
                        <p className="text-red-300 font-semibold">6★ 传说</p>
                        <p className="">18档</p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded text-center">
                        <p className="text-blue-300 font-semibold">6★ 史诗</p>
                        <p className="">17档</p>
                      </div>
                      <div className="p-2 bg-green-900/20 rounded text-center">
                        <p className="text-green-300 font-semibold">6★ 优秀</p>
                        <p className="">16档</p>
                      </div>
                    </div>
                    <p className="mt-2">
                      也就是说，防具的主属性通常不会决定战斗胜负，所以稀有度不那么重要。<br />
                      武器、饰品、手套的主属性很重要，应该追求更高稀有度。传说武器和饰品还带有技能。<br />

                      掉落时副属性最多可以有3档（满6档），在重铸前。<br />
                      这不够常见到成为基本要求，只要大部分副属性合适就可以使用。<br />
                      随着账号成长，逐步提高保留装备和用作材料的装备标准。

                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">什么时候开始强化装备？</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">1.</span>
                        <p className=""><strong>武器强化</strong>会大大加速前期进度。感觉进度变慢时就可以开始。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">2.</span>
                        <p className="">输出角色用的暴击率主属性<strong>饰品</strong>是下一个强化目标。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">3.</span>
                        <p className=""><strong>防具</strong>在第一季后半章节之前不需要强化（之后+5也能用很久）。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">4.</span>
                        <p className=""><strong>重铸/突破</strong>系统在获得6星装备之前不重要。</p>
                      </div>
                      <ul>
                        <li>6星时副属性是重点，所以重铸是英雄战力的重要组成部分。</li>
                        <li>突破强化技能/套装效果，主属性各提升5%（最多4次）。等获得副属性好、能长期使用的装备再做。</li>
                        <li>特殊装备用的宝石相当于同等级的一次重铸。强化消耗大量金币，所以在金币紧缺、需要装备强化的前期不要专注于此。</li>
                      </ul>
                    </div>
                  </div>


                </div>
              </section>

              {/* Progression & Resources */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-green-400 border-l-4 border-green-500 pl-4">进度与资源</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">技能书优先用在哪里？</h4>
                    <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm font-semibold text-yellow-300">技能升级优先级：</p>
                      <ol className="list-decimal list-inside text-sm  space-y-1 mt-2 ml-2">
                        <li>为了弱点槽伤害升到2级</li>
                        <li>效果概率、效果持续时间、冷却时间减少</li>
                        <li>伤害增加（仅DPS）</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-300">
                      连锁被动可以保持在2级直到很后期。5级的弱点槽伤害增加是唯一有趣的部分，所以可以优先更重要的技能来节省技能书。
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">基地升级优先级？</h4>
                    <div className="space-y-2">
                      <p>可以按艾娃菜单顺序解锁和升级：</p>
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300">1. 反粒子发生器 <span className="text-sm text-gray-400">优先升满！</span></p>
                      </div>
                      <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded">
                        <p className="text-sm font-semibold text-orange-300">2. 探险</p>
                      </div>
                      <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm font-semibold text-yellow-300">3. 补给模块</p>
                      </div>
                      <div className="p-3 bg-lime-900/10 border-l-4 border-lime-500 rounded">
                        <p className="text-sm font-semibold text-lime-300">4. 凯特工坊</p>
                      </div>
                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300">5. 同步室</p>
                      </div>
                      <p className=" text-sm"><strong>特质和精密制作</strong>开放后解锁（通关第一季9-5关）。</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">特质优先级？</h4>
                    <p className=" leading-relaxed">
                      特质升级顺序取决于使用的英雄和下一个目标BOSS。<br />
                      从广泛影响到具体：对抗强敌、职业、属性。
                    </p>
                    <p className="">
                      你喜欢的输出子职业（攻击者、战士、法师、先锋）和其属性，如果辅助生存没问题的话可以优先升级。
                    </p>
                    <p>主节点5级就能获取所有侧节点，所以6-10级可以之后再升。</p>
                    <p className="">
                      实用性不帮助战斗，所以这些便利特权是否获取看个人喜好。
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">加入公会有多重要？</h4>

                    <p>是每周技能书的来源，还能获得Aer、Ame、Dahlia、Drakhan、Epsilon的英雄碎片。找一个有5级公会商店的公会。每月公会副本也是宝石和以太的重要来源。</p>
                  </div>
                </div>
              </section>

              {/* Advanced Tips */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-400 border-l-4 border-rose-500 pl-4">进阶技巧</h3>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-rose-300">有技能按生命/防御/速度/闪避缩放的英雄，应该专注那个属性吗？</h4>
                  <p className=" leading-relaxed">
                    这里要注意的关键词是<strong className='underline'>"代替攻击力"</strong>。
                    如果技能只说伤害随某属性等比增加，伤害计算仍然主要使用攻击力。
                    比例属性作为额外倍率，但通常太小不值得作为主要关注点。
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Delta" /> <span className="text-xs">（用生命代替攻击）</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Delta' skill='S1' /><SkillInline character='Delta' skill='S2' /><SkillInline character='Delta' skill='S3' /></p>
                      <p><CharacterLinkCard name="Delta" icon={false} />的技能按最大生命代替<StatInlineTag name="ATK" />缩放：专注<StatInlineTag name="HP" /></p>
                    </div>

                    <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Demiurge Stella" /> <span className="text-xs">（生命加成）</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Demiurge Stella' skill='S1' /><SkillInline character='Demiurge Stella' skill='S2' /><SkillInline character='Demiurge Stella' skill='S3' /></p>
                      <p className="text-sm "><CharacterLinkCard name="Demiurge Stella" icon={false} />的技能按最大生命等比增加：仍然堆<StatInlineTag name="ATK" />来增加伤害，<StatInlineTag name="HP" />是加成。</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      对于将<StatInlineTag name="ATK" />设为0的BOSS（如升天之塔困难的七伏影）：<CharacterLinkCard name="Delta" icon={false} />可以正常造成伤害。<CharacterLinkCard name="Demiurge Stella" icon={false} />的伤害会降到个位数。
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Guides */}
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">📚 相关指南</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link href="/guides/general-guides/free-heroes-start-banner" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-blue-400 font-medium">免费英雄与新手卡池</p>
                    <p className="text-xs text-gray-400 mt-1">最大化利用免费角色</p>
                  </Link>
                  <Link href="/guides/general-guides/premium-limited" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-purple-400 font-medium">精选与限定指南</p>
                    <p className="text-xs text-gray-400 mt-1">抽卡优先级与超越</p>
                  </Link>
                  <Link href="/guides/general-guides/gear" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-amber-400 font-medium">装备指南</p>
                    <p className="text-xs text-gray-400 mt-1">装备详细解说</p>
                  </Link>
                  <Link href="/guides/general-guides/heroes-growth" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-green-400 font-medium">英雄培养</p>
                    <p className="text-xs text-gray-400 mt-1">升级与进度系统</p>
                  </Link>
                </div>
              </div>
            </div >
          ),
        },
      }}
    />
  )
}
