// src/app/components/JsonLd.tsx
'use client'
import React from 'react'

// JSON sérialisable (propre pour JSON-LD)
type JSONValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JSONValue }
  | JSONValue[]

type JsonLdObject = { [key: string]: JSONValue }

type Props = { json: JsonLdObject | JsonLdObject[] }

export default function JsonLd({ json }: Props) {
  const data: JsonLdObject[] = Array.isArray(json) ? json : [json]
  return (
    <>
      {data.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  )
}
