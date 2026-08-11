# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code, puis nettoyé les 18, 19, 20, 21 et **26/07** : à chaque passe, le « fait »
> migre dans DONE et les sections vidées sont retirées — leur bilan vit là-bas, le
> garder ici en produirait une copie qui finirait par mentir.
> État de référence : **26/07**.
> Re-vérifier chaque item contre le code au moment de le traiter (le 26/07, cette
> relecture a corrigé deux chiffres périmés — cf. l'item SEO ; l'autre, le
> CHANGELOG, est tranché depuis : gelé, cf. DONE 03/08).

---

## 🎯 PRIO (décision Sevih)

- [ ] **Ajouter la bannière Dimensional Supply au guide banner** (banner-mileage) —
      elle donne au max 4 segments jaunes sur un substat (cf. guide gear, onglet
      Bases) ; à documenter côté guide des bannières.
      VÉRIFIÉ le 26/07 : « Dimensional Supply » n'apparaît que dans
      `general-guides/gear/labels.ts` (la source de l'info), nulle part dans le
      guide des bannières. Toujours à faire. MAIS FAUT ATTENDRE LA REFONTE INGAME AVANT!!!!!

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. L'historique des portages (19-21/07) vit dans
> DONE. (Le pré-seed des clés de locale est TERMINÉ et purgé — une clé sans
> consommateur fait désormais échouer `locales/keys.test.ts`.)

- [ ] **`/tools` — RESTE 1 sous-outil : damage-calculator** — namespaces `tools.*`.
      UI POSÉE et committée le 26/07 (page `unlisted`, boucle de revue Sevih en
      cours — cf. DONE). RESTE : le MOTEUR — extracteurs damage
      (`docs/specs/damage-report-inputs.md` § 6) puis branchement du rapport ;
      `pnpm images` AVANT merge (icône `CM_Damage_Calc` pas encore sur R2) ;
      passage `unlisted` → `available` quand le rapport calcule.
      ⚠ SURTOUT NE PAS se baser sur la V2 pour cet outil (décision Sevih 22/07 :
      le calculateur V2 est foireux) — exception à la règle « V2 = oracle »,
      conception V3 native.
- [ ] **`/tools` — outil pour track l'avancée du compte sur les hero (niveau, skill, affinity)

## 🧹 Dette code

> L'audit du 07/08 est **entièrement traité** — hors volet damage, qui a son
> backlog séparé : [audit/damage-calculator.md](./audit/damage-calculator.md)
> (**D1–D5**). Bilan, y compris les constats tombés à la vérification, dans
> [DONE.md](./DONE.md).

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

## 🧊 Épinglage des boss versionnés (`TODO(guides)`)

> Cadrage ARBITRÉ avec Sevih le 11/08, étape 1 FAITE (cf. DONE). Le geste
> « Versionner » écrit `monster-archive/<id>@<n>.json` depuis longtemps ; ce qu'il
> manque, c'est que versionner mette à jour les références tout seul.
> DÉCISIONS PRISES, à ne pas re-débattre : le pin d'un guide VERSIONNÉ vit dans le
> `config.json` de la version (seul endroit qui peut différer d'une version à
> l'autre), sous forme de LISTE creuse de clés d'archive — un groupe pointe
> plusieurs monstres et une maj n'en touche souvent qu'un. `meta.bossId` reste
> LIVE (H1, portrait, jointure saison = l'entité courante). La COMPOSITION de la
> rencontre reste live elle aussi : si le jeu ajoute une phase, un vieux guide
> doit la montrer plutôt que la cacher — l'archive garde le snapshot si on change
> d'avis. Absence de pin = live, donc zéro migration sur les 16 guides existants.

> LE MÉCANISME EST COMPLET (cf. DONE 11 et 12/08) : le rendu lit un id épinglé,
> l'archive est AUTO-SUFFISANTE (elle fige ses sources, donc un boss épinglé garde
> ses libellés d'époque), la garde est posée, et « Versionner » ré-épingle tout
> seul — en réécrivant `meta.bossId`/`meta.monsters` des guides qui NOMMENT le
> monstre, et en posant `pinned` dans le `config.json` des versions de ceux qui
> désignent un COMBAT (joint-challenge, world-boss, guild-raid). Ne reste que le
> confort de lecture ci-dessous.

- [ ] _(optionnel)_ **Bandeau lecteur** « boss tel qu'avant la maj X » sur la
      carte d'un guide épinglé : l'archive porte déjà `label`, `gameVersion` et
      `committedAt`. Sans ça, un guide figé est indiscernable d'un guide à jour.

---

## 📌 Notes de référence (à ne pas perdre)

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
