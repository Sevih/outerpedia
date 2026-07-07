# `data/legacy/` — snapshot V2 (oracle de complétude)

Copie **figée** de la donnée perso + équipement du site de production
(`outerpedia-v2`), au moment du démarrage de la reconstruction V3.

## À quoi ça sert

C'est l'**oracle** : la référence de _tout ce que V2 sait_ sur les personnages
et l'équipement. On compare ce que les extracteurs V3 produisent contre ce
dossier pour repérer les champs/entités qu'on aurait **zappés**.

## Règles

- ❌ **L'application V3 ne lit JAMAIS ce dossier.** Aucun import depuis `src/`.
- ❌ On ne le modifie pas pour « corriger » : c'est un constat de l'existant.
- ✅ On le lit uniquement comme spec / cible de diff pendant la reconstruction.
- 🗑️ Supprimable une fois les extracteurs V3 validés complets.

## Contenu

| Chemin | Origine V2 | Nature |
|---|---|---|
| `character/*.json` | `data/character/` | Per-entité — **oracle d'extraction perso** |
| `equipment/*.json` | `data/equipment/` | Per-slot — oracle d'extraction équipement |
| `reco/*.json` | `data/reco/` | Curé : recommandations de gear |
| `generated/*.json` | `data/generated/` | Dérivés V2 (index, stats…) — pour diff |
| `*.json` (racine) | `data/*.json` | items, profils, pros-cons, tags, stats… |

## Rappel des défauts V2 à NE PAS reproduire en V3

Voir la cartographie : duplications (index ⊂ list, double encodage
classe/élément), trio stat-ranges (dont un mort), clés incohérentes du curé
(slug vs ID), toolchain mixte TS/Python. La donnée ci-dessus _contient_ ces
défauts — l'extracteur V3 doit produire la version corrigée.
