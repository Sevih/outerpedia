import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';

/**
 * Encart Discord — lien d'invitation + compteurs membres/en-ligne récupérés via
 * l'API d'invitation (revalidés 1 h ; absents = section sans compteurs). Icône
 * `react-icons` (pas d'asset image dédié en V3). Couleur de marque Discord en
 * valeur littérale (hors palette sémantique, assumé).
 */
const INVITE_URL = 'https://discord.com/invite/PNMd5mkAV8';
const INVITE_CODE = 'PNMd5mkAV8';

export interface DiscordStrings {
  title: string;
  description: string;
  join: string;
  /** Gabarit avec `{count}`. */
  members: string;
  /** Gabarit avec `{count}`. */
  online: string;
}

async function fetchDiscordCounts(): Promise<{ members: number; online: number } | null> {
  try {
    const res = await fetch(`https://discord.com/api/v9/invites/${INVITE_CODE}?with_counts=true`, {
      next: { revalidate: 3600 },
    });
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
        href={INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="card-interactive group flex items-center gap-4 p-4 transition-colors hover:border-[#5865F2]/50"
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] transition-transform group-hover:scale-110">
          <FaDiscord className="text-content-strong text-2xl" />
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
