import React from 'react';

export default function formatEffectText(text: string): React.ReactElement {
  const colored = text.replace(/<color=(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, (_, color, content) => {
    return `<span style="color: ${color}">${content}</span>`;
  });

  const withLineBreaks = colored.replace(/\\n|\\\\n/g, '<br />');

  return <span dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
}


export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD") // enlever accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}