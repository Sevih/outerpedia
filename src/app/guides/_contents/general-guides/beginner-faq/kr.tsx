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
      title="초보자 FAQ"
      introduction="커뮤니티 토론과 베테랑 플레이어 조언을 정리한, 신규 플레이어가 자주 묻는 질문 모음입니다."
      defaultVersion="default"
      versions={{
        default: {
          label: 'FAQ',
          content: (
            <div className="space-y-12">
              {/* Getting Started */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-sky-400 border-l-4 border-sky-500 pl-4">시작하기</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-sky-300">리세마라는 얼마나 중요한가요?</h4>
                    <p className=" leading-relaxed">
                      초반에 <Link href="/guides/general-guides/premium-limited" className="text-blue-400 hover:text-blue-300 underline">프리미엄/한정 영웅</Link>을 얻으면 도움이 되지만, 필수는 아닙니다.
                    </p>
                    <p className=" leading-relaxed">
                      <Link href="/guides/general-guides/free-heroes-start-banner" className="text-blue-400 hover:text-blue-300 underline">무료로 얻을 수 있는 영웅</Link>만으로도 초반 진행에 충분한 전력이 됩니다.
                    </p>
                    <p className=" leading-relaxed">
                      모집 외에도 도플갱어 챌린지에서 일반 영웅을 획득할 수 있습니다 (사이드 스토리 클리어 후 각 캐릭터당 8일 소요).
                    </p>
                  </div>
                </div>

              </section>

              {/* Heroes & Pulling */}
              < section className="space-y-6" >
                <h3 className="text-2xl font-bold text-purple-400 border-l-4 border-purple-500 pl-4">영웅 & 모집</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-purple-300">누구를 뽑아야 하나요?</h4>
                    <p className=" leading-relaxed">
                      Outerplane은 소수의 핵심 캐릭터에 집중하기보다 <strong>다양한 영웅을 사용</strong>하는 게임입니다. 최종 목표는 대부분의 영웅을 보유하는 것입니다.
                    </p>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-purple-300">
                          <span>한정</span>
                        </div>
                        <p className="text-sm ">
                          <ItemInlineDisplay names={'Ether'} />는 한정 영웅(시즌, 페스티벌, 콜라보 배너)에 우선적으로 사용합니다. 다른 영웅보다 반드시 강하지는 않지만, 배너 기간에만 획득 가능하며 특정 컨텐츠를 더 쉽게 클리어할 수 있습니다. 배너 진행 중 최소 3성으로 확보하세요.
                        </p>
                      </div>

                      <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-amber-300">프리미엄</h5>
                        <p className="text-sm ">
                          프리미엄 배너에서는 7일마다 픽업 대상을 변경할 수 있습니다. 처음 시작하는 경우, 현재 픽업 영웅을 뽑은 후 변경하는 것이 좋습니다.
                          추천 순서는 <Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">전용 가이드</Link>를 참고하세요.
                        </p>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-green-300">일반</h5>
                        <p className="text-sm  mb-2">
                          픽업 모집과 커스텀 모집의 일반 영웅에는 <ItemInlineDisplay names={'Special Recruitment Ticket'} /> <ItemInlineDisplay names={'Special Recruitment Ticket (Event)'} />만 사용하는 것을 권장합니다.
                          <br />커스텀 모집에서의 첫 번째 목표는 <EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" /> 버프를 부여하는 영웅입니다.
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
                    <h4 className="text-lg font-semibold text-purple-300">중복으로 뽑아야 하나요?</h4>

                    <div className="space-y-4">
                      <div>
                        <p className=" leading-relaxed mb-2">
                          일반 영웅은 도플갱어 챌린지에서 획득할 수 있으므로 여러 번 뽑을 필요가 없습니다.
                          모집 없이 3성 영웅을 해금하려면 250피스, 초월에는 단계당 150피스(*)가 필요합니다.
                          따라서 일반 영웅을 모집하면서 도플갱어에서 초월 재료를 모으는 것이 약간 더 효율적입니다.
                          신규 영웅이 도플갱어와 커스텀 모집에 추가되기까지 3개월이 걸립니다.
                        </p>
                        <p className='text-xs text-gray-300 mb-4'>
                          (*) 초월 단계: 4성, 4+, 5성, 5+, 5++, 6성으로 총 900피스 필요.
                        </p>
                        <div className="ml-4 space-y-1 text-sm text-gray-400">
                          <p>• <StarLevel levelLabel='4' /> — 약점 게이지 데미지 증가가 주요 목표.</p>
                          <p>• <StarLevel levelLabel='5' /> — 흥미로운 버스트 3 효과가 있는 경우.</p>
                          <p>• <StarLevel levelLabel='6' /> — 일반 영웅에서는 보통 우선순위가 낮습니다. 스탯 보너스와 전투 시작 시 25AP만 제공.</p>
                        </div>
                      </div>

                      <div>
                        <p className=" leading-relaxed">
                          <strong className="text-amber-300">프리미엄</strong>과 <strong className="text-purple-400">한정</strong> 영웅은 주로 중복으로 초월하므로 여러 번 뽑아야 할 수 있습니다.
                          필요한 수량은 개별 키트에 따라 다르지만, 기본적으로 3성에서도 충분히 작동합니다.
                          각 영웅 평가와 초월에 대해서는 <Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">여기</Link>를 참고하세요.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">처음 팀은 어떻게 구성하나요?</h4>
                    <p className=" leading-relaxed">
                      스토리용 기본 팀은 메인 딜러, 치명타 확률 버퍼, 힐러, 그리고 자유 슬롯(디버퍼, 서브 딜러, 버퍼 또는 디펜더)입니다.
                      스토리 대부분에서 디펜더는 필수가 아니며, 힐러나 브루저로 대응할 수 있습니다.
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300 mb-2">DPS (스타트 대시 배너에서)</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Ame" />
                          <CharacterLinkCard name="Rey" />
                          <CharacterLinkCard name="Rin" />
                          <CharacterLinkCard name="Vlada" />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-blue-300 mb-2">치명타 버프 (커스텀 모집 배너에서)</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300 mb-2">힐러</p>
                        <div className="gap-1">

                          <CharacterLinkCard name="Mene" />는 무료로 획득할 수 있고, 나중에 <CharacterLinkCard name="Dianne" />와 <CharacterLinkCard name="Nella" /> 중 하나를 선택할 수 있습니다. <CharacterLinkCard name="Monad Eva" />도 무조건적인 <EffectInlineTag name='BT_CALL_BACKUP' type='buff' />이 있어 <strong className="text-amber-300">프리미엄 배너</strong>에서 추천합니다.
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded">
                        <p className="text-sm font-semibold text-amber-300 mb-2">플렉스/서포트</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Veronica" />
                          <CharacterLinkCard name="Eternal" />
                          <CharacterLinkCard name="Akari" /> 또는 진행 중 획득한 다른 영웅.
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded mt-3">
                      <span className="text-sm ">
                        <strong>첫 보스 우선순위:</strong>
                        <ul>
                          <li><GuideIconInline name="IG_Turn_4034002" text="정체불명의 키메라" size={30} />: <StatInlineTag name='SPD' />와 <StatInlineTag name='CHD' /> 등의 방어구 세트.</li>
                          <li><GuideIconInline name="IG_Turn_4076001" text="글리시스" size={30} />와 <GuideIconInline name="IG_Turn_4076002" text="화염의 기사 메테오스" size={30} />: 무기/액세서리.</li>
                        </ul>
                        <p className='mt-4'>
                          <ElementInlineTag element='earth' />와 <ElementInlineTag element='fire' /> 영웅에 집중한 파티가 첫 번째로 육성할 팀으로 좋습니다. 장기 목표는 각 속성의 팀을 보유하는 것이지만, 한 번에 하나의 팀에 집중하세요.
                          하나의 강한 팀을 완성하면 다음 팀 육성이 빨라집니다.
                        </p>
                        <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded">

                          <p className="text-sm ">
                            <strong>팁:</strong> 스테이지 10까지 친구의 서포트 영웅을 사용할 수 있으므로, 이것은 엄격한 요구 사항이 아닙니다.
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
                  <h4 className="text-lg font-semibold text-sky-300">처음에 어디로 가야 하나요?</h4>
                  <p className=" leading-relaxed">
                    게임 내 <strong>에바의 가이드 퀘스트</strong>가 스토리를 클리어하면서 다양한 게임 모드를 안내해 줍니다.
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        챌린지의 <Link href="/guides/special-request" className="text-blue-400 underline">스페셜 리퀘스트</Link>에서 강력한 스타터 팩으로 6명의 영웅, 장비, 강화 재료를 해금할 수 있습니다.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        초반에는 경험치 획득이 느립니다. <strong>밴디트 체이스</strong> 스테이지를 진행해서 매일 더 많은 식량을 획득하세요.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <p className=" leading-relaxed">
                        <Link href="/guides/skyward-tower" className="text-blue-400 underline">승천의 탑</Link>은 매월 리셋됩니다. 최대한 높은 층까지 올라가세요.
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              {/* Gear & Equipment */}
              < section className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 border-l-4 border-amber-500 pl-4">장비 & 이큅먼트</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">장비는 어떻게 얻나요?</h4>
                    <p className=" leading-relaxed">
                      에바의 가이드 퀘스트와 승천의 탑이 레벨링 중 장비를 제공합니다. 또한 챌린지! 스페셜 리퀘스트 미션의 6성 레전더리 장비도 얻을 수 있습니다. 충분한 서베이 허브나 아레나 화폐가 모이면 이곳에서도 좋은 6성 장비를 얻을 수 있습니다.
                      장비 파밍은 스페셜 리퀘스트 보스의 스테이지 10을 클리어해서 6성 장비만 드롭되기 전까지는 큰 초점이 아닙니다.
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-cyan-900/10 border-l-4 border-cyan-500 rounded">
                        <p className="text-sm font-semibold text-cyan-300 mb-1">방어구 우선</p>
                        <p className="text-sm ">
                          <GuideIconInline name="IG_Turn_4034002" text="정체불명의 키메라" size={30} />가 방어구의 첫 타겟입니다. 속도, 반격, 치명타, (명중) 세트는 어떤 역할에도 사용할 수 있습니다. 성스러운 수호자의 관통 세트가 딜러에게 더 강력하지만, 이 보스는 다른 역할에 범용적으로 사용할 수 있는 세트를 제공하지 않습니다.
                        </p>
                      </div>

                      <div className="p-3 bg-rose-900/10 border-l-4 border-rose-500 rounded">
                        <p className="text-sm font-semibold text-rose-300 mb-1">무기/액세서리</p>
                        <p className="text-sm ">
                          무기와 액세서리 스킬은 보스에 따라 다르며, 각 보스는 특정 메인 스탯의 액세서리만 드롭합니다.<br />
                          <GuideIconInline name="IG_Turn_4076001" text="글리시스" size={30} />는 속도와 치명타 확률 메인 스탯 (또한 방어와 저항도) 액세서리를 제공하여, 무기와 액세서리의 첫 타겟으로 최적입니다.<br />
                          <GuideIconInline name="IG_Turn_4076002" text="메테오스" size={30} />는 다음 쉬운 타겟으로, 관통, 치명타 피해, 체력, 효과 적중 액세서리 메인 스탯을 제공합니다. Veronica로 스테이지 10을 솔로할 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">전용 장비 & 탈리스만은 어떻게 얻나요?</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                        <p className="text-sm font-semibold text-purple-300 mb-1">전용 장비</p>
                        <p className="text-sm ">
                          영웅의 전용 장비는 신뢰도 레벨 10에서 획득합니다.<br />
                          선물은 기지의 블랙마켓 탐험에서 얻을 수 있고, 일일 입장 제한이 있는 스토리 보스 스테이지에서 파밍할 수 있습니다.<br />
                          이레귤러 섬멸 작전: 추적 오퍼레이션에서도 보스 클리어 시 선물을 얻을 수 있습니다.
                          <br />특정 이벤트에서 맹세의 결의를 얻어 신뢰도를 즉시 최대로 올릴 수도 있습니다.
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded">
                        <p className="text-sm font-semibold text-indigo-300 mb-1">탈리스만과 참</p>
                        <p className="text-sm ">
                          아크데몬의 유적의 무한 회랑이 탈리스만의 주요 획득처입니다. 아크데몬의 유적 상점에서는 매월 6성 셀렉터 1개를 제공합니다.<br />
                          챌린지! 스페셜 리퀘스트 미션에서도 몇 개를 얻을 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">어떤 장비를 남겨야 하나요?</h4>
                    <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded mb-3">
                      <p className="text-sm font-semibold text-red-300">주의: 파란 장비를 버리지 마세요!</p>
                    </div>
                    <p className=" leading-relaxed">
                      에픽 장비가 기본이며, 레전더리와 큰 차이가 없고 강화 비용도 저렴합니다.<br />
                      6성 장비를 얻으면 (친구 서포트를 사용하면 금방입니다), 재련한 에픽 장비가 5성 레전더리나 서브 스탯이 낮은 6성 레전더리를 쉽게 능가합니다.<br />
                      그린/슈페리어 장비는 메인 스탯이 낮아지지만, 헬멧/아머/부츠에서는 서브 스탯이 강하면 좋은 결과가 나올 수 있습니다.
                    </p>
                    <p>
                      장비는 별 개수만큼 재련할 수 있으며, 4개의 서브 스탯이 채워질 때까지 새로운 서브 스탯을 해금하고, 그 후에는 랜덤으로 하나씩 증가합니다. 최대 서브 스탯 합계는:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="p-2 bg-red-900/20 rounded text-center">
                        <p className="text-red-300 font-semibold">6★ 레전더리</p>
                        <p className="">18틱</p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded text-center">
                        <p className="text-blue-300 font-semibold">6★ 에픽</p>
                        <p className="">17틱</p>
                      </div>
                      <div className="p-2 bg-green-900/20 rounded text-center">
                        <p className="text-green-300 font-semibold">6★ 슈페리어</p>
                        <p className="">16틱</p>
                      </div>
                    </div>
                    <p className="mt-2">
                      즉, 방어구에서는 메인 스탯이 전투를 좌우하는 경우가 적으므로 레어리티가 그다지 중요하지 않습니다.<br />
                      무기, 액세서리, 장갑은 메인 스탯이 중요하므로 더 높은 레어리티를 노리세요. 레전더리 무기와 액세서리에는 스킬도 붙습니다.<br />

                      드롭 시 서브 스탯은 재련 전 최대 6 중 3틱을 가질 수 있습니다.<br />
                      이것은 기본 요구 사항으로 삼을 만큼 흔하지 않으므로, 대부분의 서브 스탯이 맞으면 활용할 수 있습니다.<br />
                      계정이 성장함에 따라 남길 장비와 재료로 쓸 장비의 기준을 높여가세요.

                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">언제 장비 강화를 시작해야 하나요?</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">1.</span>
                        <p className=""><strong>무기 강화</strong>는 초반을 크게 가속합니다. 진행이 느려졌다고 느끼면 바로 시작할 수 있습니다.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">2.</span>
                        <p className="">딜러용 치명타 확률 메인 스탯 <strong>액세서리</strong>가 다음 강화 대상입니다.</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">3.</span>
                        <p className=""><strong>방어구</strong>는 시즌 1 후반 챕터까지 강화할 필요가 없습니다 (이후에도 +5면 한동안 충분합니다).</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">4.</span>
                        <p className=""><strong>재련/한계돌파</strong> 시스템은 6성 장비를 얻을 때까지 중요하지 않습니다.</p>
                      </div>
                      <ul>
                        <li>6성에서는 서브 스탯이 초점이 되므로, 재련이 영웅 전력의 큰 부분을 차지합니다.</li>
                        <li>한계돌파는 스킬/세트 효과를 강화하고, 메인 스탯을 각 5%씩 (최대 4회) 상승시킵니다. 이것은 오래 사용할 좋은 서브 스탯 장비를 얻은 후에 하세요.</li>
                        <li>특수 장비용 젬은 같은 레벨의 재련 1회분에 해당합니다. 강화에 골드가 많이 들어가므로, 골드가 부족하고 장비 강화에 필요한 초반에는 초점으로 삼지 마세요.</li>
                      </ul>
                    </div>
                  </div>


                </div>
              </section>

              {/* Progression & Resources */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-green-400 border-l-4 border-green-500 pl-4">진행 & 리소스</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">스킬 매뉴얼은 어디에 먼저 사용하나요?</h4>
                    <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm font-semibold text-yellow-300">스킬업 기준:</p>
                      <ol className="list-decimal list-inside text-sm  space-y-1 mt-2 ml-2">
                        <li>약점 게이지 데미지를 위해 레벨 2</li>
                        <li>효과 확률, 효과 지속 시간, 쿨다운 감소</li>
                        <li>데미지 증가 (DPS만)</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-300">
                      체인 패시브는 나중까지 레벨 2로 둬도 됩니다. 레벨 5의 약점 게이지 데미지 증가가 유일한 관심 부분이므로, 더 중요한 스킬을 우선하여 스킬 매뉴얼을 절약할 수 있습니다.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">기지 업그레이드 우선순위는?</h4>
                    <div className="space-y-2">
                      <p>에바의 메뉴 순서대로 해금하고 업그레이드할 수 있습니다:</p>
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300">1. 반입자 발생기 <span className="text-sm text-gray-400">최우선으로 최대로!</span></p>
                      </div>
                      <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded">
                        <p className="text-sm font-semibold text-orange-300">2. 탐험</p>
                      </div>
                      <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm font-semibold text-yellow-300">3. 보급 모듈</p>
                      </div>
                      <div className="p-3 bg-lime-900/10 border-l-4 border-lime-500 rounded">
                        <p className="text-sm font-semibold text-lime-300">4. 케이트의 공방</p>
                      </div>
                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300">5. 싱크로 룸</p>
                      </div>
                      <p className=" text-sm"><strong>퀴크 & 정밀 제작</strong>은 열리면 해금하세요 (시즌 1 스테이지 9-5 클리어).</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">퀴크 우선순위는?</h4>
                    <p className=" leading-relaxed">
                      퀴크 업그레이드 순서는 사용하는 영웅과 다음에 노리는 보스에 따라 다릅니다.<br />
                      넓은 영향에서 구체적인 순서: 강적 대응, 클래스, 속성.
                    </p>
                    <p className="">
                      선호하는 딜러 서브클래스 (어태커, 브루저, 위자드, 뱅가드)와 그 속성은 서포터 생존에 문제가 없다면 먼저 올려도 됩니다.
                    </p>
                    <p>메인 노드는 레벨 5에서 사이드 노드를 전부 획득할 수 있으므로, 레벨 6-10은 나중으로 미뤄도 됩니다.</p>
                    <p className="">
                      유틸리티는 전투에 도움이 되지 않으므로, 이러한 QoL 특전을 얻을지는 취향입니다.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">길드 가입은 얼마나 중요한가요?</h4>

                    <p>주간 스킬 매뉴얼 획득처이며, Aer, Ame, Dahlia, Drakhan, Epsilon의 영웅 피스도 얻을 수 있습니다. 레벨 5 길드 상점을 가진 길드를 찾으세요. 월간 길드 레이드도 젬과 에테르의 중요한 획득처입니다.</p>
                  </div>
                </div>
              </section>

              {/* Advanced Tips */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-400 border-l-4 border-rose-500 pl-4">고급 팁</h3>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-rose-300">HP/방어/속도/회피로 스케일하는 스킬을 가진 영웅은 그 스탯에 집중해야 하나요?</h4>
                  <p className=" leading-relaxed">
                    여기서 주목해야 할 키워드는 <strong className='underline'>&quot;공격력 대신&quot;</strong>입니다.
                    스킬이 특정 스탯에 비례해서 데미지가 증가한다고만 쓰여 있으면, 데미지 계산에는 여전히 주로 공격력을 사용합니다.
                    비례 스탯은 추가 배율로 작용하지만, 이는 보통 메인 초점으로 삼기에는 너무 작습니다.
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Delta" /> <span className="text-xs">(공격력 대신 HP)</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Delta' skill='S1' /><SkillInline character='Delta' skill='S2' /><SkillInline character='Delta' skill='S3' /></p>
                      <p><CharacterLinkCard name="Delta" icon={false} />의 스킬은 <StatInlineTag name="ATK" /> 대신 최대 HP에 비례: <StatInlineTag name="HP" />에 집중</p>
                    </div>

                    <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Demiurge Stella" /> <span className="text-xs">(HP 보너스)</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Demiurge Stella' skill='S1' /><SkillInline character='Demiurge Stella' skill='S2' /><SkillInline character='Demiurge Stella' skill='S3' /></p>
                      <p className="text-sm "><CharacterLinkCard name="Demiurge Stella" icon={false} />의 스킬은 최대 HP에 비례: 데미지를 늘리려면 <StatInlineTag name="ATK" />에 집중, <StatInlineTag name="HP" />는 보너스.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      <StatInlineTag name="ATK" />를 0으로 만드는 보스(승천의 탑 하드의 시치후자의 그림자 등)에 대해: <CharacterLinkCard name="Delta" icon={false} />는 정상적으로 데미지를 줄 수 있습니다. <CharacterLinkCard name="Demiurge Stella" icon={false} />의 데미지는 한 자릿수까지 감소합니다.
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Guides */}
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">📚 관련 가이드</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link href="/guides/general-guides/free-heroes-start-banner" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-blue-400 font-medium">무료 영웅 & 스타트 배너</p>
                    <p className="text-xs text-gray-400 mt-1">무료 캐릭터 최대한 활용</p>
                  </Link>
                  <Link href="/guides/general-guides/premium-limited" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-purple-400 font-medium">프리미엄 & 한정 가이드</p>
                    <p className="text-xs text-gray-400 mt-1">모집 우선순위와 초월</p>
                  </Link>
                  <Link href="/guides/general-guides/gear" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-amber-400 font-medium">장비 가이드</p>
                    <p className="text-xs text-gray-400 mt-1">장비 상세 해설</p>
                  </Link>
                  <Link href="/guides/general-guides/heroes-growth" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-green-400 font-medium">영웅 육성</p>
                    <p className="text-xs text-gray-400 mt-1">레벨링과 진행 시스템</p>
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
