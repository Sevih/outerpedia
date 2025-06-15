import rawProfiles from '@/data/character-profiles.json';

type CharacterProfile = {
  birthday?: string;
  height?: string;
  weight?: string;
  story?: string;
};

const characterProfiles = rawProfiles as Record<string, CharacterProfile>;

type Props = {
  fullname: string;
};

// Convertit <Color=#FFBF00>...</Color> en <span style="color:#FFBF00">...</span>
function formatStoryToHTML(text: string): string {
  return text
    .replace(/<Color=#(.*?)>(.*?)<\/Color>/g, (_, hex, content) => {
      return `<span style="color:#${hex}">${content}</span>`;
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
          <span>
            🎂 <strong className="text-white">Birthday:</strong> {birthday}
          </span>
        )}
        {height && (
          <span>
            📏 <strong className="text-white">Height:</strong> {height}
          </span>
        )}
        {weight && (
          <span>
            ⚖️ <strong className="text-white">Weight:</strong> {weight}
          </span>
        )}
      </div>

      {story && (
        <div className="mt-4 space-y-2">
          {formatStoryToHTML(story)
            .split('.')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((line, index) => (
              <p
                key={index}
                className="text-white/80 text-sm"
                dangerouslySetInnerHTML={{ __html: `${line}.` }}
              />
            ))}
        </div>
      )}
    </div>
  );
}
