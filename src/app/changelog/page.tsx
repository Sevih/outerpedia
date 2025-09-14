import { changelog } from "@/data/changelog";
import { Card, CardContent } from "@/app/components/ui/card";
import { renderMarkdown } from "@/utils/markdown";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: 'Changelog | Outerpedia',
  description: 'Track all updates made to Outerpedia: guides, characters, tools, and more.',
  keywords: [
    'outerpedia changelog',
    'outerpedia updates',
    'patch notes',
    'site update history',
    'guide updates',
    'tier list changes',
    'new characters',
    'tool improvements'
  ],
  alternates: {
    canonical: 'https://outerpedia.com/changelog',
  },
};


export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center relative">
        <span className="relative z-10">Changelog</span>
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-24 h-1 bg-cyan-600 opacity-70 rounded" />
      </h1>

      <div className="space-y-6">
        {changelog.map((entry, index) => (
          <Card key={index}>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{entry.date}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded uppercase bg-opacity-20 ${
                    entry.type.toUpperCase() === 'FEATURE'
                      ? 'bg-green-800 text-green-100'
                      : entry.type.toUpperCase() === 'UPDATE'
                      ? 'bg-blue-800 text-blue-100'
                      : entry.type.toUpperCase() === 'FIX'
                      ? 'bg-red-800 text-red-100'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {entry.type.toUpperCase()}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white">{entry.title}</h2>
              <div
                className="text-sm text-gray-400 markdown"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.content.join('\n')) }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
