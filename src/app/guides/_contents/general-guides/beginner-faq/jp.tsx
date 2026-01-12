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
      title="初心者向けFAQ"
      introduction="コミュニティでの議論やベテランプレイヤーのアドバイスをまとめた、新規プレイヤーからよく寄せられる質問集です。"
      defaultVersion="default"
      versions={{
        default: {
          label: 'FAQ',
          content: (
            <div className="space-y-12">
              {/* Getting Started */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-sky-400 border-l-4 border-sky-500 pl-4">はじめに</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-sky-300">リセマラはどれくらい重要ですか？</h4>
                    <p className=" leading-relaxed">
                      早い段階で<Link href="/guides/general-guides/premium-limited" className="text-blue-400 hover:text-blue-300 underline">プレミアム/限定ヒーロー</Link>を入手すると有利ですが、必須ではありません。
                    </p>
                    <p className=" leading-relaxed">
                      <Link href="/guides/general-guides/free-heroes-start-banner" className="text-blue-400 hover:text-blue-300 underline">無料で入手できるヒーロー</Link>だけでも、序盤を進めるには十分な戦力になります。
                    </p>
                    <p className=" leading-relaxed">
                      ガチャ以外にも、ドッペルゲンガーチャレンジで一般ヒーローを獲得できます（サイドストーリークリア後、各キャラ8日かかります）。
                    </p>
                  </div>
                </div>

              </section>

              {/* Heroes & Pulling */}
              < section className="space-y-6" >
                <h3 className="text-2xl font-bold text-purple-400 border-l-4 border-purple-500 pl-4">ヒーロー＆ガチャ</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-4">
                    <h4 className="text-lg font-semibold text-purple-300">誰を引くべきですか？</h4>
                    <p className=" leading-relaxed">
                      Outerplaneは少数の主力キャラに集中するよりも、<strong>幅広いヒーローを使う</strong>ゲームです。最終的にはほとんどのヒーローを揃えることが目標になります。
                    </p>

                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-purple-300">
                          <span>限定</span>
                        </div>
                        <p className="text-sm ">
                          <ItemInlineDisplay names={'Free Ether'} />は限定ヒーロー（シーズン、フェスティバル、コラボバナー）を優先的に使用します。他のヒーローより必ずしも強いわけではありませんが、バナー期間中のみ入手可能で、特定のコンテンツを楽にクリアできます。バナー開催中に最低でも3つ星で確保しましょう。
                        </p>
                      </div>

                      <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-amber-300">プレミアム</h5>
                        <p className="text-sm ">
                          プレミアムバナーでは7日ごとにピックアップ対象を変更できます。始めたばかりの場合は、現在のピックアップヒーローを引いてから変更するのがおすすめです。
                          推奨順序は<Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">専用ガイド</Link>をご覧ください。
                        </p>
                      </div>

                      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg space-y-2">
                        <h5 className="font-semibold text-green-300">一般</h5>
                        <p className="text-sm  mb-2">
                          ピックアップ募集とカスタム募集の一般ヒーローには、<ItemInlineDisplay names={'Special Recruitment Ticket'} /> <ItemInlineDisplay names={'Special Recruitment Ticket (Event)'} />のみを使用することをおすすめします。
                          <br />カスタム募集での最初の目標は、<EffectInlineTag name="BT_STAT|ST_CRITICAL_RATE" type="buff" />バフを付与できるヒーローです。
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
                    <h4 className="text-lg font-semibold text-purple-300">重ね引きするべきですか？</h4>

                    <div className="space-y-4">
                      <div>
                        <p className=" leading-relaxed mb-2">
                          一般ヒーローはドッペルゲンガーチャレンジで獲得できるため、複数回引く必要はありません。
                          3つ星ヒーローを募集せずに解放するには250ピース、超越には1段階ごとに150ピース(*)が必要です。
                          そのため、一般ヒーローを募集しつつドッペルゲンガーで超越素材を集めるのが若干効率的です。
                          新ヒーローがドッペルゲンガーとカスタム募集に追加されるまで3ヶ月かかります。
                        </p>
                        <p className='text-xs text-gray-300 mb-4'>
                          (*) 超越段階：4星、4+、5星、5+、5++、6星で合計900ピース必要。
                        </p>
                        <div className="ml-4 space-y-1 text-sm text-gray-400">
                          <p>・<StarLevel levelLabel='4' /> — 弱点ゲージダメージ増加が主な目標。</p>
                          <p>・<StarLevel levelLabel='5' /> — 興味深いバースト3効果がある場合。</p>
                          <p>・<StarLevel levelLabel='6' /> — 一般ヒーローでは通常優先度が低いです。ステータスボーナスと戦闘開始時25APのみ。</p>
                        </div>
                      </div>

                      <div>
                        <p className=" leading-relaxed">
                          <strong className="text-amber-300">プレミアム</strong>と<strong className="text-purple-400">限定</strong>ヒーローは主に重ね引きで超越するため、複数回引く必要があるかもしれません。
                          必要な枚数は個々のキットによりますが、基本的に3つ星でも十分機能します。
                          各ヒーローの評価と超越については<Link href="/guides/general-guides/premium-limited" className="text-blue-400 underline">こちら</Link>をご覧ください。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">最初のチームは何がいいですか？</h4>
                    <p className=" leading-relaxed">
                      ストーリー用の基本チームは、メインアタッカー、クリティカル率バッファー、ヒーラー、そして自由枠（デバッファー、サブアタッカー、バッファー、またはディフェンダー）です。
                      ストーリーのほとんどでディフェンダーは必須ではなく、ヒーラーやブルーザーで対応できます。
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300 mb-2">DPS（スタートダッシュバナーから）</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Ame" />
                          <CharacterLinkCard name="Rey" />
                          <CharacterLinkCard name="Rin" />
                          <CharacterLinkCard name="Vlada" />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-900/10 border-l-4 border-blue-500 rounded">
                        <p className="text-sm font-semibold text-blue-300 mb-2">クリティカルバフ（カスタム募集バナーから）</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Valentine" />
                          <CharacterLinkCard name="Tamara" />
                          <CharacterLinkCard name="Skadi" />
                          <CharacterLinkCard name="Charlotte" />
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300 mb-2">ヒーラー</p>
                        <div className="gap-1">

                          <CharacterLinkCard name="Mene" />は無料で入手でき、後から<CharacterLinkCard name="Dianne" />と<CharacterLinkCard name="Nella" />のどちらかを選べます。<CharacterLinkCard name="Monad Eva" />も無条件の<EffectInlineTag name='BT_CALL_BACKUP' type='buff' />があるため、<strong className="text-amber-300">プレミアムバナー</strong>からのおすすめです。
                        </div>
                      </div>

                      <div className="p-3 bg-amber-900/10 border-l-4 border-amber-500 rounded">
                        <p className="text-sm font-semibold text-amber-300 mb-2">フレックス/サポート</p>
                        <div className="gap-1">
                          <CharacterLinkCard name="Veronica" />
                          <CharacterLinkCard name="Eternal" />
                          <CharacterLinkCard name="Akari" />や、途中で入手した他のヒーロー。
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded mt-3">
                      <span className="text-sm ">
                        <strong>最初のボス優先順位：</strong>
                        <ul>
                          <li><GuideIconInline name="IG_Turn_4034002" text="正体不明のキメラ" size={30} />：<StatInlineTag name='SPD' />や<StatInlineTag name='CHD' />などの防具セット。</li>
                          <li><GuideIconInline name="IG_Turn_4076001" text="グリシス" size={30} />と<GuideIconInline name="IG_Turn_4076002" text="炎の騎士メテオス" size={30} />：武器/アクセサリー。</li>
                        </ul>
                        <p className='mt-4'>
                          <ElementInlineTag element='earth' />と<ElementInlineTag element='fire' />ヒーローに集中したパーティが最初に育成するチームとしておすすめです。長期目標は各属性のチームを持つことですが、一度に1チームずつ育成に集中しましょう。
                          1つの強いチームを完成させることで、次のチームの育成が加速します。
                        </p>
                        <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded">

                          <p className="text-sm ">
                            <strong>ヒント：</strong>ステージ10までフレンドのサポートヒーローを使えるので、これは厳密な要件ではありません。
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
                  <h4 className="text-lg font-semibold text-sky-300">最初にどこに行くべきですか？</h4>
                  <p className=" leading-relaxed">
                    ゲーム内の<strong>エヴァのガイドクエスト</strong>がストーリーをクリアしながら様々なゲームモードを案内してくれます。
                  </p>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">・</span>
                      <p className=" leading-relaxed">
                        チャレンジの<Link href="/guides/special-request" className="text-blue-400 underline">スペシャルリクエスト</Link>で、強力なスターターパックとして6体のヒーロー、装備、強化素材を解放できます。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">・</span>
                      <p className=" leading-relaxed">
                        序盤は経験値獲得が遅いです。<strong>バンディットチェイス</strong>のステージを進めて、毎日より多くの食糧を獲得しましょう。
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">・</span>
                      <p className=" leading-relaxed">
                        <Link href="/guides/skyward-tower" className="text-blue-400 underline">昇天の塔</Link>は毎月リセットされます。できるだけ高い階層を目指しましょう。
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              {/* Gear & Equipment */}
              < section className="space-y-6">
                <h3 className="text-2xl font-bold text-amber-400 border-l-4 border-amber-500 pl-4">装備＆エクイップメント</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">装備はどうやって入手しますか？</h4>
                    <p className=" leading-relaxed">
                      エヴァのガイドクエストと昇天の塔がレベリング中の装備を提供してくれます。また、チャレンジ！スペシャルリクエストミッションの6つ星レジェンダリー装備も入手できます。十分なサーベイハブやアリーナの通貨が貯まったら、これらも良い6つ星装備を提供してくれます。
                      装備ファームは、スペシャルリクエストボスのステージ10をクリアして6つ星装備のみがドロップするようになるまでは、大きな焦点ではありません。
                    </p>

                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-cyan-900/10 border-l-4 border-cyan-500 rounded">
                        <p className="text-sm font-semibold text-cyan-300 mb-1">防具優先</p>
                        <p className="text-sm ">
                          <GuideIconInline name="IG_Turn_4034002" text="正体不明のキメラ" size={30} />が防具の最初のターゲットです。速度、反撃、クリティカル、（命中）セットはどの役割にも使えます。聖なる守護者の貫通セットはアタッカーにより強力ですが、このボスは他の役割に汎用的に使えるセットを提供しません。
                        </p>
                      </div>

                      <div className="p-3 bg-rose-900/10 border-l-4 border-rose-500 rounded">
                        <p className="text-sm font-semibold text-rose-300 mb-1">武器/アクセサリー</p>
                        <p className="text-sm ">
                          武器とアクセサリーのスキルはボスによって異なり、各ボスは特定のメインステータスのアクセサリーのみをドロップします。<br />
                          <GuideIconInline name="IG_Turn_4076001" text="グリシス" size={30} />は速度とクリティカル率メインステータス（また防御と抵抗も）のアクセサリーを提供するため、武器とアクセサリーの最初のターゲットとして最適です。<br />
                          <GuideIconInline name="IG_Turn_4076002" text="メテオス" size={30} />は次の簡単なターゲットで、貫通、クリティカルダメージ、体力、効果命中のアクセサリーメインステータスを提供します。Veronicaでステージ10をソロできます。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">専用装備＆タリスマンはどうやって入手しますか？</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                        <p className="text-sm font-semibold text-purple-300 mb-1">専用装備</p>
                        <p className="text-sm ">
                          ヒーローの専用装備は信頼度レベル10で入手できます。<br />
                          ギフトは基地のブラックマーケット探検で入手でき、デイリー入場制限のあるストーリーボスステージでファームできます。<br />
                          イレギュラー殲滅作戦：追跡オペレーションでもボスクリア時にギフトが手に入ります。
                          <br />特定のイベントで誓いの決意を入手して、信頼度を即座に最大にすることもできます。
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-900/10 border-l-4 border-indigo-500 rounded">
                        <p className="text-sm font-semibold text-indigo-300 mb-1">タリスマンとチャーム</p>
                        <p className="text-sm ">
                          アークデーモンの遺跡の無限回廊がタリスマンの主な入手源です。アークデーモンの遺跡ショップでは毎月1つの6つ星セレクターを提供しています。<br />
                          チャレンジ！スペシャルリクエストミッションからもいくつか入手できます。
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">どの装備を残すべきですか？</h4>
                    <div className="p-3 bg-blue-900/20 border-l-4 border-blue-500 rounded mb-3">
                      <p className="text-sm font-semibold text-red-300">注意：青装備を捨てないで！</p>
                    </div>
                    <p className=" leading-relaxed">
                      エピック装備は基本であり、レジェンダリーとそれほど差がなく、強化コストも安いです。<br />
                      6つ星装備を入手したら（フレンドサポートを使えばすぐです）、錬成したエピック装備は5つ星レジェンダリーや、サブステータスの低い6つ星レジェンダリーを簡単に上回ります。<br />
                      緑/スーペリア装備はメインステータスが低くなりますが、ヘルメット/アーマー/ブーツではサブステータスが強ければ良い結果になることがあります。
                    </p>
                    <p>
                      装備は星の数だけ錬成でき、4つのサブステータスが揃うまで新しいサブステータスを解放し、その後はランダムに1つずつ上昇します。最大サブステータス合計は：
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-sm mt-2">
                      <div className="p-2 bg-red-900/20 rounded text-center">
                        <p className="text-red-300 font-semibold">6★ レジェンダリー</p>
                        <p className="">18ティック</p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded text-center">
                        <p className="text-blue-300 font-semibold">6★ エピック</p>
                        <p className="">17ティック</p>
                      </div>
                      <div className="p-2 bg-green-900/20 rounded text-center">
                        <p className="text-green-300 font-semibold">6★ スーペリア</p>
                        <p className="">16ティック</p>
                      </div>
                    </div>
                    <p className="mt-2">
                      つまり防具では、メインステータスが戦闘を左右することは少ないため、レアリティはそれほど重要ではありません。<br />
                      武器、アクセサリー、グローブはメインステータスが重要なので、より高いレアリティを狙いましょう。レジェンダリーの武器とアクセサリーにはスキルも付きます。<br />

                      ドロップ時、サブステータスは錬成前に最大6のうち3ティック分を持つことができます。<br />
                      これは基本要件にするほど一般的ではないので、ほとんどのサブステータスが合っていれば活用できます。<br />
                      アカウントが成長するにつれて、残す装備や素材にする装備の基準を上げていきましょう。

                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-amber-300">いつ装備を強化し始めるべきですか？</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">1.</span>
                        <p className=""><strong>武器の強化</strong>は序盤を大幅に加速します。進行が遅くなったと感じたらすぐに始められます。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">2.</span>
                        <p className="">アタッカー用のクリティカル率メインステータスの<strong>アクセサリー</strong>が次の強化対象です。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">3.</span>
                        <p className=""><strong>防具</strong>はシーズン1の後半チャプターまで強化の必要はありません（その後も+5でしばらく十分です）。</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-400 mt-1">4.</span>
                        <p className=""><strong>錬成/限界突破</strong>システムは6つ星装備を入手するまで重要ではありません。</p>
                      </div>
                      <ul>
                        <li>6つ星ではサブステータスが焦点になるので、錬成がヒーローの力の大きな部分を占めます。</li>
                        <li>限界突破はスキル/セット効果を強化し、メインステータスを各5%ずつ（最大4回）上昇させます。これは長く使える良いサブステータスの装備を入手してから行いましょう。</li>
                        <li>特殊装備用のジェムは同レベルの錬成1回分に相当します。強化にゴールドが大量に必要なので、ゴールドが不足しがちで装備強化に必要な序盤は焦点にしないでください。</li>
                      </ul>
                    </div>
                  </div>


                </div>
              </section>

              {/* Progression & Resources */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-green-400 border-l-4 border-green-500 pl-4">進行＆リソース</h3>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">スキルマニュアルはどこに使うべきですか？</h4>
                    <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm font-semibold text-yellow-300">スキルアップの目安：</p>
                      <ol className="list-decimal list-inside text-sm  space-y-1 mt-2 ml-2">
                        <li>弱点ゲージダメージのためにレベル2</li>
                        <li>効果確率、効果持続時間、クールダウン減少</li>
                        <li>ダメージ増加（DPSのみ）</li>
                      </ol>
                    </div>
                    <p className="text-sm text-gray-300">
                      チェインパッシブはもっと後までレベル2のままで大丈夫です。レベル5の弱点ゲージダメージ増加が唯一興味深い部分なので、より重要なスキルを優先してスキルマニュアルを節約できます。
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">基地のアップグレード優先順位は？</h4>
                    <div className="space-y-2">
                      <p>エヴァのメニュー順に解放・アップグレードできます：</p>
                      <div className="p-3 bg-red-900/10 border-l-4 border-red-500 rounded">
                        <p className="text-sm font-semibold text-red-300">1. 反粒子ジェネレーター <span className="text-sm text-gray-400">最優先で最大に！</span></p>
                      </div>
                      <div className="p-3 bg-orange-900/10 border-l-4 border-orange-500 rounded">
                        <p className="text-sm font-semibold text-orange-300">2. 探検</p>
                      </div>
                      <div className="p-3 bg-yellow-900/10 border-l-4 border-yellow-500 rounded">
                        <p className="text-sm font-semibold text-yellow-300">3. 補給モジュール</p>
                      </div>
                      <div className="p-3 bg-lime-900/10 border-l-4 border-lime-500 rounded">
                        <p className="text-sm font-semibold text-lime-300">4. ケイトの工房</p>
                      </div>
                      <div className="p-3 bg-green-900/10 border-l-4 border-green-500 rounded">
                        <p className="text-sm font-semibold text-green-300">5. シンクロルーム</p>
                      </div>
                      <p className=" text-sm"><strong>クワーク＆精密クラフト</strong>は開放されたら解放しましょう（シーズン1ステージ9-5クリア）。</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">クワークの優先順位は？</h4>
                    <p className=" leading-relaxed">
                      クワークのアップグレード順は、使っているヒーローと次に狙うボスによります。<br />
                      広い影響から具体的な順：強敵対策、クラス、属性。
                    </p>
                    <p className="">
                      お気に入りのダメージディーラーサブクラス（アタッカー、ブルーザー、ウィザード、ヴァンガード）とその属性は、サポーターの生存に問題がなければ先に上げても良いでしょう。
                    </p>
                    <p>メインノードはレベル5でサイドノードを全て取得できるので、レベル6-10は後回しにできます。</p>
                    <p className="">
                      ユーティリティは戦闘に役立たないので、これらのQoL特典を取るかはお好みで。
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                    <h4 className="text-lg font-semibold text-green-300">ギルドに入ることはどれくらい重要ですか？</h4>

                    <p>週間スキルマニュアルの入手源であり、Aer、Ame、Dahlia、Drakhan、Epsilonのヒーローピースも入手できます。レベル5のギルドショップを持つギルドを探しましょう。月間ギルドレイドもジェムとエーテルの重要な入手源です。</p>
                  </div>
                </div>
              </section>

              {/* Advanced Tips */}
              <section className="space-y-6">
                <h3 className="text-2xl font-bold text-rose-400 border-l-4 border-rose-500 pl-4">上級者向けTips</h3>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700 rounded-xl p-6 space-y-3">
                  <h4 className="text-lg font-semibold text-rose-300">HP/防御/速度/回避でスケールするスキルを持つヒーローは、そのステータスに集中すべきですか？</h4>
                  <p className=" leading-relaxed">
                    ここで注目すべきキーワードは<strong className='underline'>「攻撃力の代わりに」</strong>です。
                    スキルがあるステータスに比例してダメージが増加するとだけ書いてある場合、ダメージ計算には依然として主に攻撃力を使用します。
                    比例ステータスは追加の倍率として機能しますが、これは通常メインの焦点にするには小さすぎます。
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Delta" /> <span className="text-xs">（攻撃力の代わりにHP）</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Delta' skill='S1' /><SkillInline character='Delta' skill='S2' /><SkillInline character='Delta' skill='S3' /></p>
                      <p><CharacterLinkCard name="Delta" icon={false} />のスキルは<StatInlineTag name="ATK" />の代わりに最大HPに比例：<StatInlineTag name="HP" />を重視</p>
                    </div>

                    <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                      <p className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
                        <CharacterLinkCard name="Demiurge Stella" /> <span className="text-xs">（HPボーナス）</span>
                      </p>
                      <p className="text-sm "><SkillInline character='Demiurge Stella' skill='S1' /><SkillInline character='Demiurge Stella' skill='S2' /><SkillInline character='Demiurge Stella' skill='S3' /></p>
                      <p className="text-sm "><CharacterLinkCard name="Demiurge Stella" icon={false} />のスキルは最大HPに比例：ダメージを増やすには<StatInlineTag name="ATK" />を重視、<StatInlineTag name="HP" />はボーナス。</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-900/10 border-l-4 border-purple-500 rounded">
                    <p className="text-sm font-semibold text-purple-300 mb-1">
                      <StatInlineTag name="ATK" />を0にするボス（昇天の塔ハードのシチフジャの影など）に対して：<CharacterLinkCard name="Delta" icon={false} />は通常通りダメージを与えられます。<CharacterLinkCard name="Demiurge Stella" icon={false} />のダメージは一桁まで減少します。
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Guides */}
              <div className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">📚 関連ガイド</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <Link href="/guides/general-guides/free-heroes-start-banner" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-blue-400 font-medium">無料ヒーロー＆スタートバナー</p>
                    <p className="text-xs text-gray-400 mt-1">無料キャラを最大限活用</p>
                  </Link>
                  <Link href="/guides/general-guides/premium-limited" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-purple-400 font-medium">プレミアム＆限定ガイド</p>
                    <p className="text-xs text-gray-400 mt-1">ガチャ優先度と超越</p>
                  </Link>
                  <Link href="/guides/general-guides/gear" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-amber-400 font-medium">装備ガイド</p>
                    <p className="text-xs text-gray-400 mt-1">装備の詳細解説</p>
                  </Link>
                  <Link href="/guides/general-guides/heroes-growth" className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition border border-slate-600">
                    <p className="text-green-400 font-medium">ヒーロー育成</p>
                    <p className="text-xs text-gray-400 mt-1">レベリングと進行システム</p>
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
