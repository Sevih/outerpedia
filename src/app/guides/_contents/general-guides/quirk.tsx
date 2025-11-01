import GuideHeading from '@/app/components/GuideHeading'
import GuideIconInline from '@/app/components/GuideIconInline'
import Accordion from '@/app/components/ui/Accordion'
import ItemInlineDisplay from '@/app/components/ItemInline'
import CharacterInlineTag from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'


const quirkFaq = [
  {
    key: 'quirk-respec',
    title: 'Can I reset Quirks if I make a mistake?',
    content: (
      <>
        <p>
          Yes. You can respec all your quirks by spending <ItemInlineDisplay names="Ether" />. This will fully refund all materials used, letting you reallocate them freely.
        </p>
      </>
    )
  },
  {
    key: 'quirk-subnodes',
    title: 'Should I max out a main node before unlocking sub-nodes?',
    content: (
      <>
        <p>
          No. Most main nodes should be upgraded to <strong>5/10</strong> — this unlocks all sub-nodes. Focus on sub-nodes early, as they usually offer better value per point.
        </p>
        <p className="mt-2">
          The exception is the <GuideIconInline name="CM_Gift_Menu_06" text="Adventure License" size={24} /> tree, which requires <strong>level 9</strong> in the main node to unlock sub-nodes.
        </p>
      </>
    )
  },
  {
    key: 'quirk-skip-nodes',
    title: 'Are there any nodes I should skip?',
    content: (
      <>
        <p>
          Yes. In early and mid-game, skip quirks related to:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Healers</strong></li>
          <li><strong>Defenders</strong></li>
          <li><strong>Tactician (Ranger subclass)</strong></li>
          <li><strong>Evasion</strong> and <strong>Resilience</strong> effects</li>
        </ul>
      </>
    )
  },
  {
    key: 'quirk-material-usage',
    title: 'What materials do I need to upgrade Quirks?',
    content: (
      <ul className="list-disc list-inside ml-4">
        <li><ItemInlineDisplay names="Proof of Destiny" /> — mainly otained throught Terminus Isle</li>
        <li><ItemInlineDisplay names="Token of Connection" /> — mainly otained throught Terminus Isle</li>
        <li><ItemInlineDisplay names="Proof of Worth" /> — exclusively obtained from Adventure License shop</li>
      </ul>
    )
  }
]


export default function QuirkGuide() {
  return (
    <div>
      <GuideHeading level={2}>Quirk System</GuideHeading>
      <p>
        After clearing Season 1 stage 9-5 : The Responsibility of the Guilty, you will unlock the Quirk system.<br />
        Quirks are a permanent, account-wide enhancement system available in the <strong>Base → Quirk</strong> menu. They provide additional stats for your heroes or utility effects for your account, and are unlocked using materials such as <ItemInlineDisplay names="Proof of Destiny" />, <ItemInlineDisplay names="Token of Connection" />, and <ItemInlineDisplay names="Proof of Worth" />.
      </p>


      <GuideHeading level={3}>Category Overview</GuideHeading>
      <ul className="list-inside ml-4 space-y-1">
        <li><GuideIconInline name="CM_Gift_Menu_05" text="Counteract Strong Enemies" size={40} />: bonuses that enhance your team or weaken the enemy when facing bosses</li>
        <li><GuideIconInline name="CM_Gift_Menu_03" text="Class Enhancement" size={40} />: stat boosts for heroes based on their class and subclass</li>
        <li><GuideIconInline name="CM_Gift_Menu_01" text="Element Enhancement" size={40} />: stat boosts based on hero elements</li>
        <li><GuideIconInline name="CM_Gift_Menu_04" text="Utility" size={40} />: account-wide bonuses (EXP gain, drop rate, crafting cost, etc.)</li>
        <li><GuideIconInline name="CM_Gift_Menu_06" text="Adventure License" size={40} />: bonuses that only apply in Adventure License mode</li>
      </ul>

      <GuideHeading level={3}>How It Works</GuideHeading>
      <ul className="list-disc list-inside ml-4 space-y-1">
        <li>Each category has <strong>Main Nodes</strong> and <strong>Sub-Nodes</strong>. You must upgrade the main node to unlock its sub-nodes.</li>
        <li>You need 5 points in a main node to unlock all sub-nodes (except <GuideIconInline name="CM_Gift_Menu_06" text="Adventure License" size={40} />, which requires level 9).</li>
        <li>Some nodes are more valuable than others. You can skip early nodes like Healer, Defender, Ranger (Tactician), Evasion, and Resilience quirks.</li>
        <li>You can reset quirk investments using <ItemInlineDisplay names="Ether" />, refunding all materials spent.</li>
      </ul>

      <GuideHeading level={3}>Upgrading Priority</GuideHeading>
      <p>
        In the early game, your first priority should be <GuideIconInline name="CM_Gift_Menu_05" text="Counteract Strong Enemies" size={40} /> quirks, as their bonuses apply universally — regardless of enemy, game mode, hero class, or element.
      </p>
      <p className="mt-2">
        Next, focus on <GuideIconInline name="CM_Gift_Menu_03" text="Class Enhancement" size={40} />, starting with the class of your main DPS. Then move on to <GuideIconInline name="CM_Gift_Menu_01" text="Element Enhancement" size={40} />, prioritizing the element your team relies on the most.
      </p>
      <p className="mt-2">
        Finally, consider <GuideIconInline name="CM_Gift_Menu_04" text="Utility" size={40} /> quirks, which offer account-wide bonuses such as EXP gain, drop rate, crafting discounts — and most notably, an increase to your stamina cap.
        While the stamina cap boost is the most impactful perk in this category, Utility quirks as a whole still remain a lower priority early on.
      </p>
      <p className="mt-2">
        As for the <GuideIconInline name="CM_Gift_Menu_06" text="Adventure License" size={40} /> tree: this is an endgame system and shouldn’t be your early focus. It’s also the only tree that requires <ItemInlineDisplay names="Proof of Worth" />, which is exclusively obtained from Adventure License mode.
      </p>

      <GuideHeading level={4}>Early Game Example</GuideHeading>
      <p>
        Let’s take a common early team: <CharacterInlineTag name="Valentine" /> <CharacterInlineTag name="Aer" /> <CharacterInlineTag name="Monad Eva" /> <CharacterInlineTag name="Drakhan" />.
      </p>
      <ul className="list-disc list-inside ml-4 space-y-1">
        <li>After unlocking boss quirks, prioritize the <ClassInlineTag name="Striker" /> tree — especially the left path, which benefits <ClassInlineTag name="Striker" subclass='Attacker' />  like Aer and Drakhan.</li>
        <li>Then, upgrade the <ElementInlineTag element='fire' /> tree (Valentine and Aer) — one of your early goals will be farming Chimera for Speed gear.</li>
        <li>Then, invest in <ElementInlineTag element='light' /> quirks for Drakhan and Monad Eva.</li>
      </ul>
      <p className="mt-2">
        This is just one example — always adapt your quirk investments based on your team composition and progression goals.
      </p>

      <GuideHeading level={2}>FAQ</GuideHeading>
      <Accordion items={quirkFaq} />
    </div>
  )
}
