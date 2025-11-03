# Team Planner

## Vue d'ensemble

Le Team Planner est un outil permettant aux joueurs d'Outerplane de construire et valider des compositions d'équipe selon des règles et restrictions spécifiques.

## Structure des fichiers

### Fichiers principaux

- **page.tsx** - Page principale Next.js avec métadonnées SEO
- **TeamPlannerWrapper.tsx** - Composant client principal (à développer)
- **jsonld.ts** - Structured data pour le SEO

### Configuration et données

- **types.ts** - Définitions TypeScript de tous les types
- **ruleConfig.ts** - Configuration et métadonnées des règles disponibles
- **bossPresets.ts** - Presets de boss prédéfinis

## Types principaux

### RuleType
Types de règles disponibles :
- **Buffs** : Attack, Defense, Crit Rate, Crit Damage, Speed
- **Debuffs** : Attack Break, Defense Break, Crit Resist Down, Speed Down
- **Roles** : DPS, Tank, Healer, Support, Sub DPS
- **Utility** : Dispel, Immunity, Cleanse, Revive, Shield
- **Element Restrictions** : Forbid Fire/Water/Earth/Light/Dark
- **Element Bonus** : Bonus Fire/Water/Earth/Light/Dark
- **Class Restrictions** : Forbid Attacker/Defender/Ranger/Supporter
- **Team Constraints** : Max Same Element/Class, Min Different Elements, Mono Element

### BossPreset
Configuration prédéfinie pour un boss/contenu spécifique :
- ID unique
- Nom et catégorie (Skyward Tower, Guild Raid, etc.)
- Difficulté (Normal → Nightmare)
- Liste de règles actives

### TeamConfig
Configuration d'une équipe créée par l'utilisateur :
- 4 slots de personnages
- Règles appliquées
- Lien optionnel vers un preset
- Timestamps de création/modification

### ValidationResult
Résultat de validation d'une équipe :
- Statut global (valide/invalide)
- Liste d'erreurs (règles non respectées)
- Warnings (suggestions d'amélioration)
- Suggestions (personnages recommandés)

## Fonctionnalités prévues

### MVP1 (Phase 1)
- ✅ Structure de base et routing
- ✅ Types et configuration des règles
- ✅ Presets de boss
- ⏳ Interface de sélection de personnages (style tiermaker)
- ⏳ Configuration des règles custom
- ⏳ Validation basique d'équipe

### MVP2 (Phase 2)
- ⏳ Presets de boss étendus (tous les contenus)
- ⏳ Sauvegarde/partage d'équipes (URL/screenshot)
- ⏳ Suggestions intelligentes de personnages
- ⏳ Filtres avancés (élément, classe, rareté)

### MVP3+ (Futur)
- ⏳ Intégration avec les données de guides
- ⏳ Statistiques d'utilisation
- ⏳ Presets communautaires
- ⏳ Export vers différents formats

## Prochaines étapes

1. **Développer TeamPlannerWrapper** :
   - Interface de sélection des personnages (compact icons)
   - Réutiliser les filtres du roster
   - Drag & drop pour les slots

2. **Implémenter la configuration des règles** :
   - Affichage par catégorie
   - Toggle enable/disable
   - Input de valeur pour les règles paramétrables

3. **Créer la logique de validation** :
   - Vérifier chaque règle active
   - Générer les messages d'erreur/warning
   - Calculer les suggestions

4. **Ajouter les presets réels** :
   - Documenter les règles de chaque boss
   - Ajouter les images des boss
   - Implémenter le sélecteur de preset

## Notes techniques

- Utilise Next.js 15 App Router
- Composant client pour l'interactivité
- SEO optimisé avec JSON-LD
- Compatible i18n (clés de traduction préparées)
- Suit les conventions du projet Outerpedia
