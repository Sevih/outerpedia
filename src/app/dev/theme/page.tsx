import { Accordion } from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Surface } from '@/components/ui/Surface';
import { Tabs } from '@/components/ui/Tabs';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

/**
 * Page de DEV (Phase A) : prévisualise le système de tokens et les primitives
 * dans les 2 thèmes. Bascule via le bouton en haut à droite.
 */
export default function ThemePreviewPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-content-strong text-2xl font-bold">Design system — preview</h1>
        <ThemeToggle />
      </header>

      <Section title="Surfaces">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['base', 'raised', 'overlay', 'sunken'] as const).map((lvl) => (
            <Surface
              key={lvl}
              level={lvl}
              className="border-line-subtle rounded-lg border p-4 text-sm"
            >
              surface-{lvl}
            </Surface>
          ))}
        </div>
      </Section>

      <Section title="Contenu (texte)">
        <div className="space-y-1">
          <p className="text-content-strong">content-strong — titres, valeurs clés</p>
          <p className="text-content">content — texte courant</p>
          <p className="text-content-muted">content-muted — secondaire</p>
          <p className="text-content-subtle">content-subtle — discret, légendes</p>
        </div>
      </Section>

      <Section title="Lignes & accent">
        <div className="flex flex-wrap items-center gap-4">
          <div className="border-line-subtle rounded-md border px-3 py-2 text-sm">
            border-line-subtle
          </div>
          <div className="border-line rounded-md border px-3 py-2 text-sm">border-line</div>
          <div className="border-line-strong rounded-md border px-3 py-2 text-sm">
            border-line-strong
          </div>
          <div className="bg-accent text-accent-fg rounded-md px-3 py-2 text-sm">accent</div>
        </div>
      </Section>

      <Section title="Couleurs métier">
        <div className="flex flex-wrap gap-2">
          {[
            ['fire', 'text-fire'],
            ['water', 'text-water'],
            ['earth', 'text-earth'],
            ['light', 'text-light'],
            ['dark', 'text-dark-elem'],
            ['class', 'text-class'],
            ['buff', 'text-buff'],
            ['debuff', 'text-debuff'],
            ['stat', 'text-stat'],
            ['highlight', 'text-highlight'],
          ].map(([name, cls]) => (
            <span
              key={name}
              className={`border-line-subtle rounded-md border px-2 py-1 text-sm ${cls}`}
            >
              {name}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {(['neutral', 'accent', 'success', 'warn', 'danger', 'buff', 'debuff'] as const).map(
            (tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ),
          )}
        </div>
      </Section>

      <Section title="Pills (filtres)">
        <div className="flex flex-wrap gap-2">
          <Pill active>Actif</Pill>
          <Pill>Inactif</Pill>
          <Pill>Fire</Pill>
          <Pill>Water</Pill>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>Titre de carte</CardHeader>
          <CardBody>
            <p className="text-content-muted">
              Corps de carte sur surface élevée, bordure et ombre théminées.
            </p>
          </CardBody>
        </Card>
      </Section>

      <Section title="Tabs">
        <Tabs
          tabs={[
            { id: 'a', label: 'Aperçu', content: <p className="text-content-muted">Contenu A</p> },
            {
              id: 'b',
              label: 'Compétences',
              content: <p className="text-content-muted">Contenu B</p>,
            },
            {
              id: 'c',
              label: 'Équipement',
              content: <p className="text-content-muted">Contenu C</p>,
            },
          ]}
        />
      </Section>

      <Section title="Accordion">
        <Accordion
          items={[
            { id: '1', title: 'Section 1', content: <p>Détails de la section 1.</p> },
            { id: '2', title: 'Section 2', content: <p>Détails de la section 2.</p> },
          ]}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-content-subtle text-sm font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </section>
  );
}
