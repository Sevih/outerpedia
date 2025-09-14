import YoutubeEmbed from '@/app/components/YoutubeEmbed';

export default function RagnakeusGuide() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Video Guide</h2>
        <p className="mb-2 text-neutral-300">
          No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
        </p>
      </div>

      <YoutubeEmbed videoId="vR_FaPyptRk" title="15mil Ragnakeus World Boss Guide by Ducky" />
    </div>
  );
}
