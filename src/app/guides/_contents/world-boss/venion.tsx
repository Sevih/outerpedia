import YoutubeEmbed from '@/app/components/YoutubeEmbed';

export default function DahliaGuide() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Video Guide</h2>
        <p className="mb-2 text-neutral-300">
          No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Adjen</strong>:
        </p>
      </div>

      <YoutubeEmbed videoId="PxdLAUgbBPg" title="Dahlia World Boss Guide by Ducky" />
    </div>
  );
}
