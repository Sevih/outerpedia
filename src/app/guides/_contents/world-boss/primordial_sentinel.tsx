'use client'

import YoutubeEmbed from '@/app/components/YoutubeEmbed';
import CharacterLinkCard from '@/app/components/CharacterLinkCard';
import EffectInlineTag from '@/app/components/EffectInlineTag';
import ElementInlineTag from '@/app/components/ElementInline';

export default function PrimordialSentinelGuide() {
  return (
    <div>
      {/* Bloc écrit */}
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Strategy Overview</h3>
      <p className="mb-4 text-neutral-300">
        For Phase 1, you need to :
      </p>
      <ul>
        <li><CharacterLinkCard name="Val" />&apos;s S3 as much as possible</li>
        <li><CharacterLinkCard name="Iota" /> uses S1 only</li>
        <li><CharacterLinkCard name="Notia" /> must maintain her buff uptime for priority pushes</li>
        <li><CharacterLinkCard name="Dianne" /> needs <CharacterLinkCard name="Iota" /> to have the highest ATK to push her every turn with S1</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
        Phase 1 Sequence
      </h3>

      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>Build CP in P1 and lock boss down using <CharacterLinkCard name="Iota" /> &amp; <CharacterLinkCard name="Valentine" />&apos;s priority reduction.</li>
        <li>Do <strong>not heal <CharacterLinkCard name="Iota" /></strong>; let her self-sap to 1 HP (boosts SPD via Swiftness).</li>
        <li>Break boss once, reduce WG to 1 - 2, apply Invulnerable with <CharacterLinkCard name="Iota" /> S3/S2B2.</li>
        <li>Ensure boss is around 1.2M HP after breaking with 10 chain attacks ready.</li>
        <li>Push P1 damage over threshold → P2 boss spawns.</li>
        <li><CharacterLinkCard name="Iota" /> (1 HP, Swiftness) will act <strong>before</strong> P2 boss.</li>
        <li>Swap to Team 2.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
        Phase 2 Mechanics
      </h3>
      <ul className="list-disc list-inside text-neutral-300 mb-4">
        <li>P2 boss uses S2 <EffectInlineTag name="BT_DOT_LIGHTNING" type="debuff" />, <CharacterLinkCard name="Monad Eva" /> S2 cleanses it immediately.</li>
        <li>Cleanse = &quot;healer action&quot;, which applies <EffectInlineTag name="BT_STAT|ST_SPEED" type="debuff" /> to boss.</li>
        <li>Team can outspeed and <strong>break + remove core energy</strong>.</li>
        <li>Spam chain attacks to lock him; use <CharacterLinkCard name="Monad Eva" /> S1 to help build CP.</li>
      </ul>

      <hr className="my-6 border-neutral-700" />
      <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">
        Important Notes
      </h3>
      <p className="text-neutral-300 mb-4">
        This comp only works with 6★ <CharacterLinkCard name="Meva" />. Credit to <strong>Birdmouth</strong> for discovering this.
        The core energy buff counts as an <em>additional attack</em>, which <CharacterLinkCard name="Meva" /> skill seal at battle start can cancel.
        This protects your CP from being lost.
      </p>
      <p className="text-neutral-300 mb-4">
        Alternative: swap to Team 2 <strong>during Phase 1</strong>. Since <ElementInlineTag element="light" /><ElementInlineTag element="dark" /> units can&apos;t reduce WG in P1, you&apos;ll need at least
        one <ElementInlineTag element="fire" /><ElementInlineTag element="water" /><ElementInlineTag element="earth" /> unit in Team 2. This lets <CharacterLinkCard name="Meva" /> apply skill seal upon entering P2 and protect your rotation.
      </p>
      <p className="text-neutral-300">
        Another option: run <CharacterLinkCard name="DStella" /> instead of <CharacterLinkCard name="Stella" />. Swap to Team 2 at end of P1 and use one chain skill to trigger fixed damage and move into P2.
      </p>

      <hr className="my-6 border-neutral-700" />

      {/* Bloc vidéo */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Combat Footage</h3>
        <p className="mb-2 text-neutral-300">
          This video showcases how the comp is executed in practice, as demonstrated by <strong>Ducky</strong>.
        </p>
      </div>

      <YoutubeEmbed videoId="Kd-dKroOXEo" title="Glorious Sentinel World Boss 23mil+ by Ducky" />
    </div>
  );
}
