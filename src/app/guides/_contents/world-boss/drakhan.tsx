import YoutubeEmbed from '@/app/components/YoutubeEmbed';

export default function DrakhanGuide() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Video Guide</h2>
        <p className="mb-2 text-neutral-300">
          No full written guide has been made yet. For now, we recommend watching this excellent video by <strong>Ducky</strong>:
        </p>
      </div>

      <YoutubeEmbed videoId="tX4Xhm4byAY" title="Holy Night Dianne Summons, Testing, and New World Boss by Ducky" startTime={12794}/>
    </div>
  );
}
