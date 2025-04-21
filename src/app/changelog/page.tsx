import { changelog } from "@/data/changelog";
import { Card, CardContent } from "@/app/components/ui/card";

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <div className="space-y-4">
        {changelog.map((entry, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded font-medium uppercase">
                  {entry.type}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-1">{entry.title}</h2>
              <p className="text-sm text-muted-foreground">{entry.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}