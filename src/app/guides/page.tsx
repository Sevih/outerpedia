import GuideCategoryList from '@/app/components/CategoryCard';

export const dynamic = 'force-static'; // ou 'auto'

export default function GuidesHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Guides</h1>
      <GuideCategoryList />
    </div>
  );
}
