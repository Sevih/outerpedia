# Guide Multi-langue - Documentation de Migration

## Vue d'ensemble

Le système de guides supporte maintenant le multi-langue (EN/JP/KR) via une structure de fichiers séparés par langue.

## Structure Implémentée

### Avant (ancien système)
```
src/app/guides/_contents/
  adventure/
    S1-8-5.tsx  ← Un seul fichier, contenu hardcodé en anglais
```

### Après (nouveau système)
```
src/app/guides/_contents/
  adventure/
    S1-8-5/
      en.tsx  ← Version anglaise
      jp.tsx  ← Version japonaise
      kr.tsx  ← Version coréenne
```

## Fonctionnement du Système

### 1. GuideContentWrapper (Modifié)

Le composant `GuideContentWrapper.tsx` essaie maintenant de charger les fichiers dans cet ordre :

1. `_contents/{category}/{slug}/{lang}.tsx` (nouveau système multi-langue)
2. `_contents/{category}/{slug}/en.tsx` (fallback vers anglais)
3. `_contents/{category}/{slug}.tsx` (ancien système, pour rétrocompatibilité)
4. Message d'erreur "Guide not found"

### 2. Métadonnées dans guides-ref.json

Les titres et descriptions doivent être localisés :

```json
{
  "S1-8-5": {
    "category": "adventure",
    "title": {
      "en": "S1 Normal 8-5 : Maxwell",
      "jp": "S1 ノーマル 8-5 : マクスウェル",
      "kr": "S1 노말 8-5 : 맥스웰"
    },
    "description": {
      "en": "Boss strategy guide.",
      "jp": "ボス攻略ガイド。",
      "kr": "보스 전략 가이드."
    },
    "icon": "S1-8-5",
    "last_updated": "2025-05-25",
    "author": "Sevih"
  }
}
```

### 3. Page.tsx (Modifié)

Le composant passe maintenant la langue au wrapper :

```tsx
<GuideContentWrapper category={category} slug={slug} lang={langKey} />
```

## Comment Migrer un Guide

### Étape 1 : Créer la structure de dossiers

```bash
mkdir -p "src/app/guides/_contents/{category}/{slug}"
```

### Étape 2 : Créer les fichiers de contenu

Créer 3 fichiers : `en.tsx`, `jp.tsx`, `kr.tsx`

**Exemple en.tsx :**
```tsx
'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>Strategy Overview</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                Killing the orb will make Maxwell drop to 3% HP. Avoid using AoE damage.
            </ul>
        </div>
    )
}
```

**Exemple jp.tsx :**
```tsx
'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>戦略概要</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                オーブを倒すとマクスウェルのHPが3%まで減少します。AoEダメージの使用は避けてください。
            </ul>
        </div>
    )
}
```

**Exemple kr.tsx :**
```tsx
'use client'

import GuideHeading from '@/app/components/GuideHeading'

export default function S185Guide() {
    return (
        <div>
            <GuideHeading level={3}>전략 개요</GuideHeading>
            <ul className="list-disc list-inside text-neutral-300 mb-4">
                오브를 파괴하면 맥스웰의 HP가 3%로 감소합니다. 광역 데미지 사용을 피하세요.
            </ul>
        </div>
    )
}
```

### Étape 3 : Mettre à jour guides-ref.json

Transformer les chaînes simples en objets localisés :

**Avant :**
```json
{
  "title": "S1 Normal 8-5 : Maxwell",
  "description": "Boss strategy guide."
}
```

**Après :**
```json
{
  "title": {
    "en": "S1 Normal 8-5 : Maxwell",
    "jp": "S1 ノーマル 8-5 : マクスウェル",
    "kr": "S1 노말 8-5 : 맥스웰"
  },
  "description": {
    "en": "Boss strategy guide.",
    "jp": "ボス攻略ガイド。",
    "kr": "보스 전략 가이드."
  }
}
```

### Étape 4 : (Optionnel) Supprimer l'ancien fichier

Une fois la migration confirmée, vous pouvez supprimer `{slug}.tsx` de l'ancien emplacement.

## Migration Progressive

Le système supporte la **coexistence** des deux formats :

- Les guides non migrés continueront de fonctionner avec l'ancien format (fichier unique `.tsx`)
- Les guides migrés utiliseront automatiquement le nouveau format (dossier avec `en.tsx`, `jp.tsx`, `kr.tsx`)
- Le fallback garantit qu'aucun guide ne sera cassé pendant la migration

## Script de Migration Automatique (Optionnel)

Vous pouvez créer un script Node.js pour migrer automatiquement les guides :

```javascript
const fs = require('fs');
const path = require('path');

function migrateGuide(category, slug) {
  const oldPath = `src/app/guides/_contents/${category}/${slug}.tsx`;
  const newDir = `src/app/guides/_contents/${category}/${slug}`;

  // Créer le dossier
  fs.mkdirSync(newDir, { recursive: true });

  // Copier le contenu vers en.tsx
  const content = fs.readFileSync(oldPath, 'utf-8');
  fs.writeFileSync(path.join(newDir, 'en.tsx'), content);

  // Créer les versions jp et kr (à traduire manuellement après)
  fs.writeFileSync(path.join(newDir, 'jp.tsx'), content);
  fs.writeFileSync(path.join(newDir, 'kr.tsx'), content);

  console.log(`✓ Migré: ${category}/${slug}`);
}

// Exemple d'utilisation
migrateGuide('adventure', 'S1-9-5');
```

## Guides Déjà Migrés

- ✅ adventure/S1-8-5 (exemple complet avec traductions)

## Prochaines Étapes

1. Migrer les guides prioritaires (les plus consultés)
2. Traduire progressivement le contenu en JP et KR
3. Documenter les termes techniques à utiliser dans les traductions
4. Éventuellement créer un script de migration en masse

## Notes Techniques

- Le système utilise `dynamic import` avec fallback en cascade
- Aucun impact sur les performances (code-splitting par langue)
- Compatible avec le SSR et le build statique
- Les métadonnées SEO sont déjà localisées via `getLocalized()`
