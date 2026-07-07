type JsonLdValue = string | number | boolean | null | JsonLdNode | JsonLdValue[];
type JsonLdNode = { [key: string]: JsonLdValue };

/**
 * Rend une balise `<script type="application/ld+json">`. Échappe `<` pour éviter
 * de casser le contexte script si de la donnée s'y retrouve un jour.
 */
export default function JsonLd({ data, id }: { data: JsonLdNode; id?: string }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      {...(id && { id })}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
