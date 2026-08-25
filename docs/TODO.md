# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code, puis nettoyé les 18, 19, 20, 21 et **26/07** : à chaque passe, le « fait »
> migre dans DONE et les sections vidées sont retirées — leur bilan vit là-bas, le
> garder ici en produirait une copie qui finirait par mentir.
> Le **24/08**, l'item PRIO (Dimensional Supply au guide des bannières) est parti
> dans DONE avec la refonte in-game qu'il attendait, et sa section — vide — a
> suivi.
> État de référence : **26/07** — la migration du 24/08 n'était PAS une passe de
> relecture, les items ci-dessous n'ont pas été re-vérifiés contre le code depuis.
> Re-vérifier chaque item contre le code au moment de le traiter (le 26/07, cette
> relecture a corrigé deux chiffres périmés — cf. l'item SEO ; l'autre, le
> CHANGELOG, est tranché depuis : gelé, cf. DONE 03/08).

---

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. L'historique des portages (19-21/07) vit dans
> DONE. (Le pré-seed des clés de locale est TERMINÉ et purgé — une clé sans
> consommateur fait désormais échouer `locales/keys.test.ts`.)

- [ ] **`/tools` — hero-tracker : boucle de revue Sevih** (V2 livrée le 12/08 au
      périmètre in-game qu'il a dicté, cf. DONE — page PUBLIÉE le 12/08 sur ordre
      de Sevih). RESTE : (1) arbitrer les axes réellement utiles (Sevih : « on
      retirera des trucs à la fin ») ; (2) VÉRIFIER quel barème de limit break
      s'applique à un Core Fusion — l'outil prend sa rareté AFFICHÉE (3★ pour
      CF Snow, dont la base est 2★), ce qui est un choix, pas une donnée ;
      (3) `pnpm images` au prochain passage : le PNG de `CM_EtcMenu_Colleague`
      (og:image de la page) et les `PI_*` des pièces ne sont que dans le staging
      local — le manifest les demande déjà, aucune curation à faire (sa source
      était fausse jusqu'au 13/08, cf. DONE ; il est produit depuis).

## 🧹 Dette code

> L'audit du 07/08 est **entièrement traité** — hors volet damage, qui a son
> backlog séparé : [audit/damage-calculator.md](./audit/damage-calculator.md)
> (**D1–D5**). Bilan, y compris les constats tombés à la vérification, dans
> [DONE.md](./DONE.md).

- [ ] **Découper les gros composants client des autres outils — RÉSERVÉ SEVIH
      (décision 25/08 : pas un lot agent).** Le damage calculator a eu ce
      traitement le 25/08 (`DamageCalculatorBrowser` 4 983 → 2 147 lignes,
      éclaté en types / stores / briques UI / hooks d'état / sections — cf.
      DONE 25/08) ; le même motif « un composant client géant qui tient tout »
      existe encore sur `hero-tracker/HeroTrackerBrowser.tsx` (2 113 l. —
      désormais le plus gros fichier du repo),
      `tier-list-maker/TierListMakerBrowser.tsx` (1 939 l.) et
      `progress-tracker/ProgressTrackerBrowser.tsx` (1 384 l.). Dette FROIDE —
      aucun des trois n'est en souffrance active. Méthode qui a marché sur le
      calculateur, si utile : découpe par script de tranches de lignes (zéro
      retranscription), hook d'état destructuré sous les MÊMES noms (le JSX ne
      bouge pas), tsc/eslint/tests après chaque étape.

### Lots de fond SEO/perf (audit Sitebulb 20/07 — non urgents)

> Le gros de l'audit est traité (cf. DONE 20-22/07). Ce qui suit est du VOLUME
> éditorial, pas du bug — ce n'est pas mécanisable. Détail : `docs/seo&audit/`.

- [ ] **Reste du lot « titles/descriptions courts » : re-mesurer, puis les
      descriptions d'OUTILS** — le gros est traité le 03/08 (cf. DONE : titles
      des fiches perso/équipement/outils enrichis, 53 descriptions de guides
      dédupliquées). Restent : (1) re-passer Sitebulb pour re-compter ce qui
      est encore court après ces deux lots ; (2) les descriptions des ~17 pages
      d'outils (une phrase, honnête mais courte) — ARBITRAGE REQUIS : la même
      chaîne i18n (`tools.<slug>.desc`) sert AUSSI de sous-titre visible dans
      ToolShell et sur la landing /tools — l'allonger pour le SEO change
      l'écran. Options : découpler (clé meta dédiée) ou assumer le texte court.

---

## 📌 Notes de référence (à ne pas perdre)

- **Damage calculator : SURTOUT NE PAS se baser sur la V2** (décision Sevih
  22/07 : le calculateur V2 est foireux) — exception à la règle « V2 =
  oracle », conception V3 native. Vaut pour toute évolution future du moteur
  (l'outil est PUBLIC depuis le 25/08, item de portage soldé — cf. DONE).

- **Warnings Turbopack au build (« overly broad patterns » sur guides.ts,
  « unexpected file in NFT list ») : BÉNINS, mesurés le 26/07.** Le scan FS des
  guides fait tracer tout le projet → ~16 Mo embarqués à tort dans l'image
  (src 11 Mo + datagen 3 Mo + docs 1,4 Mo), négligeable vs les 1,6 Go du
  `.next` légitime (1584 pages SSG). Le runtime, lui, est garanti par
  `outputFileTracingIncludes`. Si le temps de build ou l'image dérivent un
  jour : annotations `/*turbopackIgnore: true*/` sur les `resolve()` de
  guides.ts (sans risque, l'inclusion étant déclarée à la main).

- **Assets d'événement : rien à pousser à la main.** La collecte
  (`datagen/assets/manifest.ts`, PAS `collect.ts` qui n'indexe que les sprites du
  jeu) est DATA-DRIVEN sur le curé : ajouter un événement en admin suffit, il n'y a
  aucune liste d'assets à tenir. `pnpm images` enchaîne collect + audio +
  wallpapers + comics + push — ce n'est pas une commande « événements », elle
  pousse TOUT ce qui est en attente.
- **Guide porté → son boss doit exister** : chaque `meta.bossId` d'un guide doit
  être dans `monsters.json`, sinon le rendu JETTE. Extraction à la demande
  (`pnpm datagen:extract-entity`).
- **Jointure guide↔saison** : par le monstre réellement combattu
  (`meta.bossId` ↔ `season.monsters`), JAMAIS par la colonne `boss` (id
  canonique d'affichage). Gravée dans `content-schedule.test.ts`.
- `battleEnd` ≠ `end` : un boss peut être « en saison » sans être combattable.
- Le statut « en cours » se calcule CÔTÉ CLIENT (`SeasonBadge`) — pages ISR 24 h.
- Tours : `waves` = formations successives ; `encounters` = pools alternatifs
  (very hard) — ne jamais confondre.
- Sécurité vérifiée saine à l'audit 17/07 (ne pas re-auditer sans raison) :
  routes admin doublement gardées (`.dev.*` hors build prod + `IS_DEV`),
  `/api/revalidate` en Bearer temps constant sans dégradation, anti-path-
  traversal correct sur `images/[...path]`, `.env.local` ignoré et non tracké,
  aucun secret committé/loggé, `.dockerignore` exclut `.env*`.
- **Frontière `admin/`** : le chemin ne garantit rien, 6 modules shippent en prod
  (liste blanche BLOQUANTE `ADMIN_SHIPS_TO_PROD` dans `eslint.config.mjs`, audit
  F2). Les dossiers de briques `components/admin/editorial/` et
  `premium-limited/` ne peuvent pas importer de secret : c'est vérifié par eslint,
  pas par convention.
