import YoutubeEmbed from '@/app/components/YoutubeEmbed';

export default function KOHmeteosGuide() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Combat Footage</h2>
        <p className="mb-2 text-neutral-300">
          No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
        </p>
      </div>

      <YoutubeEmbed videoId="X5bL_YZ73y4" title="Knight of Hope Metos Joint Boss Max Score by Ducky" />
    </div>
  );
}
