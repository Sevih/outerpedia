import rawProfiles from '@/data/character-profiles.json';
import { Fragment, ReactNode } from 'react';

type CharacterProfile = {
  birthday?: string;
  height?: string;
  weight?: string;
  story?: string;
};

const characterProfiles = rawProfiles as Record<string, CharacterProfile>;

type Props = { fullname: string };

/** Remplace <Color=#FFBF00>...</Color> par <span style={{color:'#FFBF00'}}>{...}</span> (case-insensitive) */
function renderWithColorTags(text: string): ReactNode[] {
  const re =
    /<\s*color\s*=\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\s*>\s*([\s\S]*?)<\s*\/\s*color\s*>/gi;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Helper: normalise #RGB → #RRGGBB (et on ignore l’éventuelle alpha)
  const normalizeHex = (hex: string) => {
    if (hex.length === 3) {
      return hex.split('').map(ch => ch + ch).join('');
    }
    if (hex.length === 8) {
      return hex.slice(0, 6); // on drop l’alpha pour CSS color
    }
    return hex; // 6
  };

  while ((match = re.exec(text)) !== null) {
    const [full, hex, content] = match;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={`c-${match.index}`} style={{ color: `#${normalizeHex(hex)}` }}>
        {content}
      </span>
    );
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
/** Transforme le story en paragraphes React en respectant \n\n */
function formatStory(text: string): ReactNode[] {
  // 1) nettoie \r, et convertit les littéraux "\n" → vrais newlines
  const cleaned = text.replace(/\r/g, '').replace(/\\n/g, '\n');
  const paragraphs = cleaned.split(/\n{2,}/);

  return paragraphs.map((p, i) => {
    const lines = p.split('\n').map(l => l.trim()).filter(Boolean);
    return (
      <p key={i} className="text-white/80 text-sm">
        {lines.map((line, j) => (
          <Fragment key={j}>
            {renderWithColorTags(line)}
            {j < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    );
  });
}



export default function CharacterProfileDescription({ fullname }: Props) {
  const profile = characterProfiles[fullname];
  if (!profile) return null;

  const { birthday, height, weight, story } = profile;

  return (
    <div className="space-y-2 text-sm text-white/80 max-w-2xl mx-auto">
      <div className="flex gap-x-4 gap-y-1 flex-wrap">
        {birthday && (
          <span>🎂 <strong className="text-white">Birthday:</strong> {birthday}</span>
        )}
        {height && (
          <span>📏 <strong className="text-white">Height:</strong> {height}</span>
        )}
        {weight && (
          <span>⚖️ <strong className="text-white">Weight:</strong> {weight}</span>
        )}
      </div>

      {story && (
        <div className="mt-4 space-y-2">
          {formatStory(story)}
        </div>
      )}
    </div>
  );
}
