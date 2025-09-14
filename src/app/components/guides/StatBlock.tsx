import Accordion from '@/app/components/ui/Accordion'
import stats from '@/data/stats.json'
import StatInlineTag from '@/app/components/StatInlineTag'
import EffectInlineTag from '@/app/components/EffectInlineTag'

type Props = {
  title: string
  abbr: keyof typeof stats
  desc?: string
  text?: React.ReactNode
  effect?: {
    buff?: string[]
    debuff?: string[]
  }
}

export default function StatBlock({abbr, desc, text, effect }: Props) {
  const content = (
    <div className="text-gray-300 space-y-3 pt-2">
      {desc && (
        <p>
          <span className="bold underline underline-offset-4">Definition:</span> {desc}
        </p>
      )}

      {effect && (
        <div className="space-y-1">
          {effect.buff && effect.buff?.length > 0 && (
            <p>
              <span className="text-sky-400 underline underline-offset-4">Associated Buffs:</span>{' '}
              {effect.buff.map((e) => (
                <EffectInlineTag key={e} name={e} type="buff" />
              ))}
            </p>
          )}
          {effect.debuff && effect.debuff?.length > 0 && (
            <p>
              <span className="text-red-400 underline underline-offset-4">Associated Debuffs:</span>{' '}
              {effect.debuff.map((e) => (
                <EffectInlineTag key={e} name={e} type="debuff" />
              ))}
            </p>
          )}
        </div>
      )}

      {text && <div className="space-y-2">{text}</div>}
    </div>
  )

  return (
    <div className="mb-4">
      <Accordion
        items={[
          {
            key: abbr,
            title: <h3 className="text-xl font-semibold"><StatInlineTag name={abbr} /></h3>,
            content
          }
        ]}
      />
    </div>
  )
}
