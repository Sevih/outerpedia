import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';
import { img } from '@/lib/images';
import { DISCORD_INVITE_CODE, DISCORD_INVITE_URL } from '@/lib/discord';

/**
 * Encart Discord — lien d'invitation + compteurs membres/en-ligne récupérés via
 * l'API d'invitation (revalidés 1 h ; absents = section sans compteurs). Icône
 * `react-icons` (pas d'asset image dédié). Couleur de marque Discord en
 * valeur littérale (hors palette sémantique, assumé).
 */

export interface DiscordStrings {
  title: string;
  description: string;
  join: string;
  /** Gabarit avec `{count}`. */
  members: string;
  /** Gabarit avec `{count}`. */
  online: string;
}

/**
 * Compteurs Discord, ou `null` si l'API ne répond pas comme attendu.
 *
 * `AbortSignal.timeout` n'est PAS redondant avec le `try/catch` : celui-ci
 * n'attrape qu'un échec, pas une absence de réponse. Un socket accepté mais
 * jamais servi laisse `fetch` pendre — et comme cet appel est awaité pendant le
 * rendu SERVEUR de l'accueil, c'est la régénération ISR de la page la plus vue
 * du site qui reste suspendue. 3 s : cet encart est décoratif, la home ne
 * l'attend pas plus longtemps. Le timeout rejette, le `catch` existant rend
 * `null`, et la section s'affiche sans compteurs — la dégradation prévue.
 */
async function fetchDiscordCounts(): Promise<{ members: number; online: number } | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/v9/invites/${DISCORD_INVITE_CODE}?with_counts=true`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      members: data.approximate_member_count as number,
      online: data.approximate_presence_count as number,
    };
  } catch {
    return null;
  }
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(count);
}

export async function DiscordBanner({ strings }: { strings: DiscordStrings }) {
  const counts = await fetchDiscordCounts();

  return (
    <section>
      <Link
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="card-interactive group flex items-center gap-4 p-4 transition-colors hover:border-[#5865F2]/50"
      >
        <div className="size-12 shrink-0 overflow-hidden rounded-xl transition-transform group-hover:scale-110">
          <img src={img.discord()} alt="Discord" className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-content-strong font-semibold">{strings.title}</p>
          <p className="text-content-muted text-sm">{strings.description}</p>
          {counts && (
            <div className="text-content-subtle mt-1.5 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-emerald-500" />
                {strings.online.replace('{count}', formatCount(counts.online))}
              </span>
              <span>{strings.members.replace('{count}', formatCount(counts.members))}</span>
            </div>
          )}
        </div>

        <span className="flex shrink-0 items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-[#ffffff] transition-colors group-hover:bg-[#4752C4]">
          <FaDiscord className="text-base" />
          {strings.join}
        </span>
      </Link>
    </section>
  );
}
