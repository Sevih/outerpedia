export const dynamic = 'force-dynamic';

export default function GuidesIndex() {
  return (
    <div className="space-y-3">
      <h1 className="text-content-strong text-xl font-semibold">Guide editor</h1>
      <p className="text-content-muted text-sm">
        Choisis un guide à gauche pour l’éditer. Famille de boss branchée :{' '}
        <strong>joint-challenge</strong> (versionné), <strong>special-request</strong>,{' '}
        <strong>irregular-extermination</strong>, <strong>adventure-license</strong>,{' '}
        <strong>adventure</strong>, <strong>dimensional-singularity</strong> — monstre + conseils +
        persos + équipe + vidéos, selon la catégorie.
      </p>
    </div>
  );
}
