# DONE — journal du suivi interne

> Pendant « fait » de [TODO.md](./TODO.md) (décision Sevih 2026-07-17 : le TODO
> ne garde que le « à faire »). Un item traité migre ici avec sa date ; le
> détail vit dans git. Le `CHANGELOG.md` racine est GELÉ depuis le 03/08 —
> ce fichier et le log git SONT le journal du projet.

## 2026-08-21

- **Terminal de `pnpm dev` dégraissé — Caddy et Next.** Côté Caddy, les ~25
  lignes `info` du démarrage (admin, pki, auto_https, storage, autosave…) sont
  coupées par un bloc global `log { level WARN }` dans `Caddyfile.dev` ; ne
  restent que les deux `warn` h2/h3 du serveur de redirection `:80`. Les six
  `warn "stapling OCSP"` sans champ `error` n'étaient PAS un souci de config :
  bug de log de certmagic 0.24.0 (`else { Warn }` qui se déclenche quand
  `stapleOCSP` retourne `nil`, cas des certs internes de 12 h), embarqué dans
  Caddy 2.10.2 et corrigé en certmagic 0.25.3 / Caddy 2.11.4 → poste mis à jour
  (`choco upgrade caddy`). `ocsp_stapling off` ne changeait rien (testé : il
  fait aussi retourner `nil`) ; `servers :80 { protocols h1 }` ne touche pas le
  serveur de redirection auto-créé, et une redirection HTTP explicite échange
  les deux `warn` h2/h3 contre un autre — on laisse. Le Caddyfile.dev n'est lu
  que sur le poste : le Caddy prod (`sevih-tool/stack`, conteneur) n'est pas
  concerné. Côté Next, chaque page tirait des dizaines de `GET /images/… 200`
  (route locale `images/[...path]/route.dev.ts`) ; Next ne sait ignorer que par
  motif d'URL (`logging.incomingRequests.ignore`), jamais par statut, et on
  veut GARDER les 404 (asset pas collecté). D'où `scripts/dev-next.ts`, fin
  wrapper de `next dev` qui tait uniquement les lignes `/images/*` en 200 —
  concurrently pipait déjà Next, rien ne change pour lui.

- **`capstone` : la cinquième dépendance python non déclarée — et `datagen:dump`
  échouait après avoir RÉUSSI.** Le dump 1.4.14 s'est déroulé entièrement
  (metadata, .so, globalgamemanagers, dump.cs écrit, « ✅ dump généré »), puis
  `disasm.py` a manqué de capstone et fait sortir tout le run en erreur — un
  « datagen:dump a échoué » trompeur après plusieurs minutes de travail acquis.
  Même schéma qu'UnityPy le 07/08 : un module absent n'est pas une panne du
  script, c'est une machine non outillée. `dump.ts` sonde donc l'outillage avant
  d'appeler disasm et SAUTE les listings avec un avertissement (en disant qu'ils
  restent ceux du dump précédent, donc périmés si les RVA ont bougé) ; un échec
  du script lui-même — méthode renommée, .so périmé — lève toujours, c'est tout
  son intérêt. `capstone>=5,<6` déclaré dans `requirements.txt` avec disasm.py.
  • **La sonde devient une primitive** : `pythonToolingMissing` quittait
  `refresh.ts` pour `datagen/lib/python.ts`, partagée par les deux flux qui
  appellent du python. Trois pannes de la même famille valaient bien une brique
  commune plutôt qu'une copie.
  • Vérifié dans la foulée : `globalgamemanagers` tiré du jeu installé résout
  `colorSpace = linear` (fin de la dépendance à l'APK manuelle), et les 91
  listings régénérés sont IDENTIQUES aux committés — le binaire du portable
  correspond au dernier dump du fixe, les specs damage étaient déjà à jour.

- **`extract-portrait-fx.py` entre ENFIN dans la pipeline — après avoir fermé le
  piège qui l'en empêchait.** Quatrième script python, mais le seul qui vivait
  HORS du flux alors que sa sortie est committée : `manifest.ts` réclamait ses 38
  textures sur toutes les machines, seule celle où on l'avait lancé à la main
  savait les produire (34 « sprite introuvable » sur le portable le 14/08). Le
  câbler d'abord aurait cassé le site : il écrit le `colorSpace`, que le rendu
  exige à `linear` (`portrait-fx-gl.ts` refuse tout le reste), et cette valeur ne
  se lit que dans `globalgamemanagers` — pris jusqu'ici d'une APK déposée à la
  main, donc absente d'ici : chaque `pnpm dev` aurait écrit `unknown` et effacé
  l'effet. Dans l'ordre : (1) `datagen:dump` extrait `globalgamemanagers` du jeu
  INSTALLÉ (3ᵉ `extractFromApk` sur `base.apk`, même geste adb que la paire
  metadata/so — plus rien à déposer à la main, ni à aller chercher dans le repo
  archivé) ; (2) le script lit trois sources dans l'ordre — fichier tiré, APK en
  repli, puis PRÉSERVATION de la valeur committée plutôt que `unknown` ;
  (3) l'étape rejoint `genSteps` avec `py: 'UnityPy'`, appelée SANS argument
  (= les 9 `DEFAULT_EFFECTS`, exactement ce que porte le JSON committé — `--all`
  sortirait des textures que le manifeste ne demande pas). Vérifié sur cette
  machine, sans dump ni APK : « colorSpace conservé : linear », exit 0, aucun
  diff sur `portrait-fx.json`. 31 tests de `refresh` à jour, `pnpm
datagen:portrait-fx` pour le relancer seul.
  • **Au passage, la règle qui manquait** : ce qui est hors git doit être SOIT
  reconstruit par une commande de la chaîne, SOIT sauvegardé sur R2. Le gitignore
  n'a jamais été le problème (`.gamedata`, `data/extracted`, `.assets-staging`
  sont régénérables et sains) — les quatre pannes de ces deux semaines venaient
  toutes d'une reconstruction qui dépendait d'un geste qu'on devait se rappeler.

- **Le garde-fou 4-comics comparait des NOMBRES — il a failli laisser effacer
  trois BD.** Retour sur le portable après une semaine : pool local et galerie
  affichaient 31 BD par langue… mais pas les mêmes. Trois nouvelles d'un côté,
  trois anciennes de l'autre (`HOiDkTzbMAAcqeX` / `HOiEvqabQAAVN4T` /
  `HOiDBeDakAAnQYP`), jamais poussées en ORIGINAL depuis le fixe — donc
  irrattrapables par `editorial:pull`. L'échange à somme nulle passait le test
  des comptes : `pnpm images` d'ici aurait retiré les trois de la galerie.
  `removedStems` (generators/comics) compare désormais les ENSEMBLES de stems,
  par langue, contre le seed committé — que `sync-comics-seed` réaligne sur ce
  qui est réellement en ligne, donc une référence fiable et hors ligne. 5 tests.
  • **Et ne pas écrire ne suffisait pas** : un manifeste PÉRIMÉ laissé dans le
  staging par une collecte précédente (celui du pool d'avant le pull) serait
  parti quand même — `assets:push` envoie tout ce qu'il trouve, et son sha1
  différait bien de celui poussé. Le garde-fou l'ÉLAGUE maintenant, comme
  `collect-wallpapers` le fait d'un perso non intégré. Vérifié sur le cas réel :
  3 BD nommées, manifeste retenu ET retiré du staging.
  • **Et le garde-fou RÉCONCILIE au lieu de bloquer** (Sevih n'ayant pas accès au
  fixe, le blocage l'aurait laissé sans recours) : le manifeste n'étant qu'une
  liste de NOMS, une BD dont les deux dérivés sont confirmés dans `pushed.json`
  reste servie par R2 même sans original local — elle est donc conservée au
  catalogue. Publier depuis une machine au pool incomplet devient SANS PERTE ;
  seules les vraies orphelines (ni original ici, ni dérivé en ligne) retiennent
  encore le manifeste. Vérifié sur le cas réel : 32 BD par langue, 0 perdue,
  3 ajoutées, catalogue trié.
  • **`pnpm images` enchaîne `editorial:push`** (avant `assets:push` : la source
  est sauvegardée avant que le dérivé parte). C'est l'oubli de ce geste manuel
  qui avait créé la situation — publier sans sauvegarder l'original ne doit plus
  être possible. Procédure `ajouter-comic.md` mise à jour, et sa note sur le
  repli corrigée (périmée depuis `sync-comics-seed`).

## 2026-08-19

- **Campagne de validation in-game des compteurs § 9.1** (5 captures Sevih,
  toutes à 0.00 % — 5 fixtures dorées) :
  - **Débuffs de la cible** (`dd`) : Eris `2000117_2_4` (+20 %/débuff,
    S2/S3) mesurée à dd=1 (S2) et dd=3 (S3) — la droite est prouvée en deux
    points et deux slots.
  - **Buffs de l'équipe du lanceur** (`ot`) : H. Dianne `2000093_3_1`
    (+10 %/buff, S3 seul), Dianne SEULE, normal + crit à ot=2. Trois faits
    établis par la mesure : le compte se lit AU MOMENT du hit (une première
    série où les icônes étaient lues en fin d'animation sur-comptait — les
    poses du S3 lui-même, `SKILL_FINISH`, ne comptent pas pour son propre
    hit) ; « l'équipe » INCLUT le lanceur (Dianne seule, ot=2 = ses propres
    buffs) ; toute icône de buff compte, même sans effet sur le montant du
    hit (un CHC up, sans chip déclarable côté montant, pesait dans le
    compteur).
  - **Scaling vitesse du burst** de Dianne (`2000093_2_1` : +150 % de la
    SPEED de combat dans la somme § 9.1) : S2b1 exact en équipe de 4 avec
    chip ATK up — et contre-preuve que le S2b1 ne lit PAS le compteur
    d'équipe (son lecteur est calé `SKT_ULTIMATE`).
- **Libellés des compteurs précisés** (5 locales) : le stepper d'équipe dit
  « (lanceur inclus) » et le hint de section « comptez les icônes juste
  avant que le coup parte (les buffs posés par le skill lui-même arrivent
  après) » — les deux ambiguïtés rencontrées pendant la campagne.

## 2026-08-18

- **Recherche du header : les noms anglais revivent hors anglais** (signalé par
  XTY109 sur zh). La palette ne filtrait que sur le libellé AFFICHÉ
  (`characterDisplayName(c, lang)`) : depuis que les 125 persos ont un nom zh
  distinct de l'anglais, taper « Ame » sur zh.outerpedia.com ne matchait plus
  rien — jp et kr étaient logés à la même enseigne, personne ne l'avait dit. Le
  champ de la page personnages, lui, marchait déjà : il cherche dans
  `characterSearchNames` (noms toutes langues + surnoms + alias curés + id +
  slug). L'index porte désormais un champ `terms` qui rend cette parité :
  personnages = `characterSearchNames` complet ; pages, catégories et guides =
  libellé localisé + SLUG (déjà la forme anglaise du sujet — les quatre titres
  de guide coûtaient 6 Ko gzip pour ce que le slug donne). Index zh : 6,3 → 17 Ko
  gzip, chargé à la 1re ouverture et caché par le CDN. La normalisation
  (minuscules, diacritiques, pleine chasse) vit dans `lib/search-text.ts`,
  SEULE source pour les deux côtés — le serveur indexe et le client tape avec la
  même. Champ optionnel + repli sur le libellé : un index déjà en cache CDN
  (s-maxage 1 j) reste utilisable tel quel.
- **Liens courts `/s/` réparés** (signalé par Sevih : outerpedia.com/s/0oLx4q4AbSI3
  menait sur `https://0.0.0.0:3000/characters?z=…`). La route reconstruisait une
  URL ABSOLUE avec `new URL(path, request.url)` : dans l'image standalone,
  `request.url` porte l'adresse d'ÉCOUTE du serveur (`HOSTNAME=0.0.0.0`,
  `PORT=3000`), pas l'hôte public — tous les liens partagés depuis la mise en
  ligne du raccourcisseur étaient morts. Le `Location` est désormais le chemin
  RELATIF (RFC 7231) : c'est le navigateur qui le résout sur l'hôte appelé, ce
  qui garde l'intention d'origine (jp.outerpedia.com/s/… reste sur `jp`) sans
  jamais nommer d'hôte côté serveur. Le chemin est revalidé À LA LECTURE
  (`isInternalPath`) puisque `new URL()` ne recadre plus rien. Trois tests de
  route (db mockée) tiennent le `Location` relatif, l'accueil sur lien
  mort/id invalide/BDD absente, et le refus d'un `//evil.com` lu en base.
- **Burst slot de bout en bout** (bug Caren signalé par Sevih : « la table
  result affiche S2 B1… » alors que son burst est le S1). La règle `RequireAP`
  (1er coût > 0, plusieurs coûts) est factorisée en UN helper datagen
  (`datagen/lib/burst.ts`) partagé générateur wiki / extracteur damage —
  marqueur `burstAP` émis dans les DEUX artefacts (garde croisée), répartition
  réelle S1=60/S2=51/S3=14. Le moteur (`burstableSlotOf`, gear.ts) rattache
  les lignes `SKT_BURST_1..3` au slot du skill burstable avec SON niveau ;
  sans marqueur les lignes burst sont OMISES et signalées (`dataIssues`) —
  plus jamais de « toujours S2 » silencieux. Le Browser résout les callers
  burst sur la rangée qui porte `burstIds` : Contexte et Résultat disent le
  même slot.
- **Nommage des conditions consolidé** : prédicat unique `conditionBuffRef`
  (sentinelles 9996..9999 = catégories « n'importe quel buff/débuff »,
  vérifié sur pièce — le gabarit générique redevient leur libellé ; famille
  `HAS_NOT_BUFF` incluse, 188 lignes nommables) + `buildCondBuffNames`
  (résolution `effects` ∘ pont `effectByTooltip` — « 66 » Cooldown Increase,
  « 59 » Detonate récupérés). 4089002 (marqueur Irregular, NameID vide) reste
  `#4089002` — jamais un nom inventé.
- **Popover de desc de skill refait sur l'existant** : `SkillIconTip`
  (SkillTip.tsx) = `InlineTooltip` (portal Radix, collision, tap mobile) +
  `SkillDescription` (même rendu que la fiche perso), descs des bursts en
  vert/bleu/rouge cumulatives dans la table Résultat (`burstMax`). L'état du
  survol vit dans le sous-composant : plus aucun re-rendu du Browser au
  survol. Les 5,9 Mo de skills.json quittent le bundle client : projection
  `damage/skill-descs.json` (~865 Ko brut, descs + vars élaguées aux
  placeholders, niveaux dédupliqués, équivalence exacte testée contre le
  catalogue), chargée au premier survol.
- **Dédup des buffs de kit multi-référencés** (revue) : un buff référencé par
  plusieurs skills (CSV caller « S2,B1..B3 ») redevenait une entrée PAR
  référence — Rhona (2000008) comptait 3× son `BT_DMG_TO_BOSS` (+1500 ‰ au lieu de
  +500), Caren 2× le `BT_DMG` de ses bursts (66 buffs concernés).
  `resolveKitPassives` sert désormais chaque buffId au premier référent (un
  templet = une instance). Preuves structurelles (référents ⊆ callers 63/66,
  héritage cumulatif des listes burst chez 2000129, vars du jeu identiques
  B2/B3) ; la preuve RUNTIME manque — mesure in-game Rhona S1 vs boss à
  capturer en fixture (dédup +50 % / cumul +150 %). Garde datagen : un buff
  multi-référencé damage-pertinent est mono-niveau (l'hypothèse « niveau du
  premier référent » casse bruyamment sinon).
- **Compteurs § 9.1 branchés** (lot 1) : les familles « ×N »
  (`BT_DMG_OWNER_BUFF/OWNER_DEBUFF/TARGET_BUFF/TARGET_DEBUFF/OWNER_TEAM_BUFF`)
  avaient leurs cases dans `AdditionalDamageContext` mais rien ne les
  alimentait. Saisies déclarées (`buffCount`/`debuffCount`/`teamBuffCount`
  attaquant, `buffCount`/`debuffCount` cible), clés z `ob`/`od`/`ot`/`db`/`dd`
  bornées, steppers CONTEXTUELS du panneau Contexte (visibles seulement si un
  passif du rapport lit la famille — Eris affiche « Débuffs sur la cible »),
  5 locales. Témoins testés : Eris 2000117_2_4 (+20 %/débuff sur S2/S3 seuls
  — ses bursts restent hors bonus, le CSV du jeu ne les liste pas), H. Dianne
  2000093_3_1 (Σ équipe sur S3 seul). Jamais dérivés des chips : déclaration
  du joueur, absents = 0.
- **`TARGET_IS_BOSS` : rien à brancher** (constat contre le plan de revue) :
  les 22 lignes réelles sont des procs `SKILL_START`/`SKILL_FINISH` (déjà
  classés dynamic) ou des types hors pipeline (`BT_ADDITIVE_TURN`) — aucune
  entrée active n'atteint l'évaluateur ; l'implémenter aurait été du code
  mort. Documenté ici, point retiré du plan. **RENVERSÉ le jour même par la
  mesure** (bullet suivant) : un proc `SKILL_START` pèse sur le hit de son
  lanceur, donc `TARGET_IS_BOSS` s'évalue bel et bien.
- **Câblage des découvertes des 7 captures in-game du jour** (Rhona vs
  Meteos ; Caren vs Meteos et vs Amadeus — un combat par mesure, premier coup,
  état neutre) :
  - **Procs `SKILL_START` au lanceur** : un buff `SKILL_START` est posé AU
    LANCEMENT et pèse sur le hit du skill lanceur. Lanceurs = les skills
    ACTIFS qui le référencent (Caren `2000089_3_1` : S3/B2/B3 — ratio B2/B1
    mesuré 1.3306 vs 1.3305 calculé) ; porté par un passif seul, le CSV
    `CallerSkillType` décide (Rhona `2000008_passive_3`, `TARGET_IS_BOSS`
    évalué via `target.boss` passé aux trois résolveurs). Rhona S1 vs boss :
    delta 0.00 % exact. Chaque ligne reste un PREMIER lancement (durées non
    simulées).
  - **Canal § 16.1 PAR SLOT** : les `BT_STAT` gatés par lanceurs recalculent
    les stats de combat de LEUR ligne (`combatStatsWith`, 2 passes PV-perdus)
    et celles de la CIBLE (`applyTargetStatChannel`, A = 0 — Rhona
    `2000008_3_3` : DEF cible −50 % au lancement du S3, sur sa ligne seule) ;
    les `BT_STAT` défenseur sont classés et consommés côté cible.
  - **Facteur total § 8.1** : le vrai total d'un skill = Σ des AnimationEvents
    du clip, hors tables — 165/1062 skills ont Σ hits ≠ 1000 ‰. Règle :
    `totalFactor = max(rawFactor, 1000)` + flag `factorFilled` (témoin mesuré :
    S1 de Caren, 700 ‰ en table, 1000 ‰ en jeu) ; les Σ > 1000 sont gardés
    (bursts renforcés plausibles, non tranchés § 12.4).
  - **Fixtures dorées** : `rhona-meteos` (1 obs), `caren-meteos` (4 obs),
    `caren-amadeus` (2 obs) — gameVersion 1.4.14, quirks/codex/guilde des
    captures, `ENGINE_GAME_VERSION` monté à 1.4.14.
- **Le « +1.03 % résiduel » de Caren RÉSOLU : les buffs PREMIUM sont DANS la
  fiche** (spec § 16.1 amendée). La fiche affichée `X (+Y)` inclut les
  `BT_STAT_PREMIUM` passifs inconditionnels du porteur (`ME` et `MY_TEAM` —
  un buff d'équipe couvre son porteur) dans le canal `buffRate` de
  CalcFinalStat : passif de transcendance Skill_8, option d'EE Lv10, quirks
  IOT_BUFF, artefacts. Preuve à l'unité (fiche relevée par Sevih SANS
  équipement) : Caren lv120 T-max = 2314 (+732) = base 535 + évo 247 + quirks
  BRUISER +800, ×1.3 (trans), ×1.1 (skill_8 100 ‰), + codex 53 ; équipée
  5631 → sous-total 4291 avec 300 ‰ (skill_8 100 + EE Lv10 `_ADD` 200) ; DEF
  de combat 5891 = div1000((4291 + 200 trust) × 1300) + 53 — EXACTEMENT le
  « +60 » que les 6 captures exigeaient. Le résiduel était le TERME CROISÉ
  trust × premiums (aucune fixture verte n'avait d'affinité > palier 0 : le
  canal n'avait jamais été testé), pas un « premium d'équipe à assiette
  mystérieuse ». Câblé : `gear.ts` collecte les taux premium
  (`GearPassivesInfo.premium`, trois résolveurs), `sheet.ts` DÉFACTORISE la
  fiche saisie par (1000+Rp) puis applique (1000+Rp+buffs) au sous-total
  (ambiguïté ±1 documentée, nulle sans premium — identité historique
  inchangée), `inputs.ts` agrège par stat. Les 2 fixtures Caren passent de
  skip à VERTES (7/7 captures à 0.00 %) ; test de propriété défactorisation +
  témoin 5891 dans `sheet.test.ts`.
- État : suite 148 fichiers / 1725 tests (0 skip), tsc app + datagen 0,
  eslint 0 ; rejeu des 7 captures du jour : 0.00 % partout.

## 2026-08-17

- **Picker de cibles du damage calculator refait en NAVIGATION PAR CARTES**
  (série de demandes Sevih du jour). L'ancien sélecteur ouvrait sur la liste
  plate « All » (~700 monstres) avec une cascade de selects ; désormais :
  sommaire en cartes de modes (chacune avec son compte), chaque niveau
  intermédiaire en cartes (même grammaire que les saisons du browser story),
  breadcrumb cliquable sur TOUS les modes (la navigation saison/épisode du
  browser story est remontée dans le picker, qui la contrôle), sous-titres des
  cartes sans ce que le breadcrumb dit déjà. Hiérarchies par mode :
  - **Special Request** : raid_1/raid_2 repliés sous le titre officiel du menu
    (`SYS_RAID_TITLE`) via la généralisation des familles story en **familles
    de modes** (`storyFamilies` → `modeFamilies`, curé dans mode-titles.json) ;
    puis sous-requête (titre complet — le jeu n'a aucun « Ecology Study » nu),
    puis nom du boss FINAL du donjon (le mi-boss de vague 1 se range dessous).
  - **Guild Raid** : saison nommée par le TITRE officiel du raid (« The Frost
    Legion »… — nouveau glossaire `guildRaidSeasons`, jointure
    GuildRaidTemplet.TitleStr × grades × NameID, crochets décoratifs retirés),
    puis les 3 boss en cartes de LIGNE.
  - **Joint Challenge** : édition (boss final) → les 3 difficultés à plat ;
    **World Boss** : rotation (nom de donjon) → ligue ; tours inchangées
    (déjà conformes) ; l'axe Main/Sub et les clés `phase_*` disparaissent.
- **Guild raid : le stage se CHOISIT dans le panneau cible (overgrade
  compris)** — comme la Singularité. Chaque stage reste un donjon/monstre
  distinct (ids vérifiés : 440400070→079) : le sélecteur bascule le `ti` ;
  les stages > 10 du main boss sont des CONTEXTES DE SPAWN du donjon stage 10
  (`si` = overgrade, drapeau `overgrade` émis par le générateur sur le dernier
  stage templeté de chaque ligne) — `ti`/`si` restent le contrat du moteur,
  `resolvePresetTarget` et le wrapper passent par la même fonction. Stats
  overgrade par la formule prouvée au binaire (spec § 12.13) : PV
  `floor(float32(1 + 0,3·og) × float32(BossMonsterHP))`, ATK/DEF par le canal
  addRate § 3.2. La borne n'est pas inventée : GameConfig
  `GUILD_RAID_MAIN_BOSS_MAX_GRADE` = 100 ; taux `[300, 300, 10]` et borne
  extraits dans `damage/config.json` et GARDÉS par le test d'invariants
  (même régime que MISSED_DAMAGE_RATE). Vérifié sur pièce : Gornolf S4
  stage 11 = 6 265 911 × 1,3 = 8 145 684 PV exacts.
- **Sélecteur du panneau : « Rank » quand l'échelle est un RANG** (world boss,
  Singularité — paliers de dégâts cumulés pendant le combat), « Stage » quand
  c'en est un (guild raid, adventure) — détecté sur la donnée (`s.rank`),
  aucune liste de modes en dur.
- **Panneau contexte : conditions EN CLAIR et enrage** (série de demandes
  Sevih du jour, « histoire de comprendre la condition »).
  - Les mécaniques du kit et les chips de passifs de boss affichent leur
    condition en libellé lisible (« Gone Surfing! S3 — Target has a buff »,
    « · Attacker has the elemental advantage ») : enum brut → gabarit localisé
    (20 clés `context.cond.*` × 5 langues, seuils HPRATE ‰→%), l'enum reste
    dans le tooltip. `GearPassiveEntry.conditionValue` versé aux entrées
    stateful pour porter le seuil.
  - **Enrage** : coche « Enragé » (visible seulement si le boss a un skill
    `SKT_RAGE_ENTER*`, persistée en z `en`) — les buffs posés par le skill
    d'enrage deviennent des entrées gatées (passives.ts), les `BT_STAT`
    défenseur damage-pertinents (canal `DEFENDER_STAT_CHANNEL`) s'appliquent
    aux stats de la cible par l'identité § 16.1 avec A = 0 (Chimera :
    `Common_Rage_Buff_3`, DMG Reduce +40 pts). `OWNER_RAGE` suit la même
    coche ; durées de tours non simulées (coché = enragé). Testé sur donnée
    réelle : off/on, les dégâts chutent.
  - **Chips de boss : seulement ce qui est ACTIF et qui pèse un MONTANT.**
    Les branches élémentaires non concernées disparaissent (plus de barré),
    et la crit chance de l'équipe n'apparaît que si le kit courant la LIT :
    le rapport expose `attackerAmountStats` (base ATK/CDMG/pierce/dmg_boost
    - lectures des buffs actifs — familles `*_STAT` § 9.1, swap § 10.1,
      contexte PV § 14). Vérifié sur pièce : Aer vs Chimera 12 la tait (elle ne
      pèse que sur P(crit) § 4, gardée au moteur), 2000067 l'affiche
      (`2000067_2_6` : +50 % du taux crit en dégâts § 9.1).

## 2026-08-15

- **Plus aucune référence « V2 »/« V3 » dans les commentaires** (~500
  occurrences, 300 fichiers). Ces numéros ne désignaient plus rien de
  consultable — `outerpediaV2` est archivé — et plusieurs commentaires
  justifiaient un choix par un dépôt que personne ne peut ouvrir. Le mot
  disparaît, **le sens reste** : « l'ancien site », « format hérité »,
  « inchangé », « auparavant », « nos tokens », et la raison intrinsèque plutôt
  que la comparaison (« max-w-6xl : les vues dimensionnent leurs cartes en % du
  conteneur », plus « même largeur que la V2 »).
  Le piège, vérifié fichier par fichier avant de couper : **~92 de ces mentions
  ne parlaient pas du dépôt mais d'une compatibilité EN PRODUCTION** — le codec
  `?z=` décode les liens de filtres encore en favoris, `client-storage` absorbe
  les clés localStorage des visiteurs sur le même origin, la tier-list hérite
  d'anciens ids. Là, la description remplace le numéro (« CONTRAT PUBLIC hérité
  du site précédent, remplacé le 21/07/2026 ») : rien n'est perdu.
  Laissés en place, car ce ne sont pas des commentaires : le `d="…1.51V21a2…"`
  d'un path SVG, le nom `outerpediaV2` quand il désigne le dépôt, et les « V2 »
  de `docs/TODO.md` — dont un désigne la 2ᵉ version du hero-tracker, pas le site.
  La règle est désormais dans `CONVENTIONS.md` § Langue : sans elle, un
  « comme en V2 » repousse au prochain fichier.

- **Trois textes décrivaient un état disparu.** (1) Le lien **GitHub du pied de
  page** pointait `Sevih/outerpediaV2` — dépôt **archivé** — au lieu de
  `Sevih/outerpedia` : tout visiteur cliquant sur GitHub atterrissait sur le
  mort. Deux occurrences dans `Footer.tsx` (liste de liens + rangée sociale).
  (2) Trois pages d'admin (`tools/banners`, `tools/changelog`,
  `tools/promo-codes`) annonçaient un bouton **« Regen depuis V2 »** qui
  n'existe plus — l'import ponctuel a été retiré le 21/07 (cf. en-têtes de
  `promo-banner-store.ts` et `changelog-store.ts`), et aucun `regen` ne subsiste
  dans les trois éditeurs : phrases supprimées. (3) `beginner-faq` portait un
  `TODO(portage general-guides)` demandant d'ajouter `gear` et `heroes-growth`
  aux guides connexes « au fur et à mesure de leur portage » — les deux sont
  portés depuis longtemps : liens ajoutés (accents emerald/amber), TODO retiré.
  Trouvés en balayant les références à l'ancien site, pas cherchés.

- **`pnpm commit` refuse de partir en retard sur `origin`** — pré-vol en tête de
  séquence, rejoué juste avant le push R2
  ([scripts/commit.ts](../scripts/commit.ts)). Le jour même la séquence s'est
  arrêtée entre les deux : contrôles verts, 2 images poussées sur R2 et edge
  purgé, puis `git push` REFUSÉ — `origin/main` portait 7 commits du 14/08
  (machine `sevih`). R2 servait alors deux images que le dépôt n'enregistrait
  pas encore.
  Ce décalage-là est bénin. Le vrai danger est `pushed.json` : calculé sur une
  base périmée, il ignore ce qu'une AUTRE machine a déjà poussé, et
  `assets:push` re-pousse du vieux par-dessus du récent — régression
  silencieuse, edge purgé pour servir l'ancienne image, qu'aucun `git pull`
  APRÈS coup ne rattrape. Le merge du jour l'a frôlée :
  `CM_Btn_Recruit_Special_11.webp` vaut `9edbae` en local (staging d'avant le
  14/08) contre `6f0bc8` sur R2 ; inscrire « la vérité R2 » dans le manifeste
  aurait fait re-pousser l'ancienne image au run suivant. Le manifeste garde
  donc `9edbae` — mensonge assumé sur une clé, qui se résorbe au prochain
  `pnpm datagen:patch` suivi d'un `assets:collect` (cette machine est en retard
  sur la donnée jeu ; `datagen:patch` ne collecte pas, c'est `pnpm images` —
  donc `pnpm commit` — qui réécrit le staging).
  Option ÉCARTÉE : déplacer le bloc images APRÈS le push git. « Merger/pousser
  = déployer » et la prod lit R2 — le code partirait en référençant des images
  pas encore en ligne. L'ordre était juste ; c'est le départ qui manquait d'un
  garde-fou.

- **Le repli 4-comics se réaligne tout seul sur ce qui est en ligne**
  ([datagen/assets/sync-comics-seed.ts](../datagen/assets/sync-comics-seed.ts),
  dernier maillon de `pnpm images`). Symptôme : 4 BD par langue déposées,
  `pnpm images` passé sans erreur, invisibles sur `/4-comics` en LOCAL — et
  pourtant déjà EN LIGNE. La page lit le manifeste R2 à la requête, mais en dev
  `NEXT_PUBLIC_IMG_BASE` est vide (il n'est défini nulle part), donc
  `loadComics` saute le fetch et sert `data/generated/comics.json`. Ce repli
  était à 27 BD contre 31 en ligne : personne ne l'écrivait, `buildComics`
  n'étant délibérément pas câblé dans `build.ts`. La dérive était donc STRUCTURELLE,
  et le docblock du générateur annonçait `pnpm datagen:build` comme writer
  canonique — faux depuis toujours, contredit par `promote.ts`, et c'est le
  premier fichier qu'on ouvre. Corrigé aussi : un commentaire qui ment coûte
  plus cher que pas de commentaire (il envoyait rejouer un `datagen:build`
  complet, sur une machine en retard sur la donnée jeu de surcroît).
  Le sync ne recopie PAS le pool local : il copie le manifeste du staging une
  fois son sha1 CONFIRMÉ dans `pushed.json`. Invariant « le repli est ce qui est
  en ligne » — un push interrompu laisse le repli en retard plutôt que d'annoncer
  des BD que R2 ne sert pas. Le garde-fou « pool partiel » de `collect-comics`
  reste intact en amont (pas de manifeste → rien à pousser → rien à synchroniser).
  `pnpm commit` lançant `pnpm images` avant son `git add -A`, le repli réaligné
  part dans le même commit que les BD.

- **Audit : wallpapers et BGM n'ont PAS ce piège** (résultat négatif, consigné
  pour ne pas le refaire). `wallpapers.json` et `bgm_mapping.json` sont écrits
  par `build.ts` (`writeJson`, lignes 280 et 284) et passent par `promote` :
  leur docblock « écriture canonique `datagen:build` » dit vrai, et
  `collect-wallpapers`/`collect-audio` n'écrivent aucun manifeste runtime — une
  seule source, pas de repli à tenir. Comics était le seul cas hors-pipeline
  (`isPureCurated`). Nuance restante, de nature différente : `buildWallpapers`
  lit `.editorial/wallpapers/Outerpedia` (gitignoré) SANS le garde-fou « pool
  partiel » de `collect-comics` — une machine au pool amputé produirait un
  `wallpapers.json` tronqué. Non traité : contrairement au manifeste R2 de
  comics, ce fichier passe par la revue de `promote`, où la troncature se voit.

## 2026-08-14

- **Les 125 persos ont une date de sortie** (brief
  [docs/specs/character-release-date.md](./specs/character-release-date.md)),
  dérivée de l'archive des notes de MAJ COMMITTÉE — la génération ne dépend
  d'aucun scrape. `data/generated/character-release.json`, contrat minimal
  `id → "YYYY-MM-DD"` : 69 dates lues dans la fiche officielle de la note
  (`# Schedule` / `＊Period`), 5 dans la maintenance annoncée en intro, 4 dans la
  fiche d'une section voisine du même post, 47 dans le curé. Zéro libellé non
  apparié.
  Le brief pariait sur UNE convention (« New Hero {name} Drop Rate Up! ») et sur
  une deuxième passe pour l'ère major9. La mesure a dit autre chose. **Dix
  gabarits de titre** se succèdent (`New Limited/Festival/Demiurge/Collaboration
Hero`, `New Boss`, `New 2★ Heroes X and Y`, `[Core Fusion] Hero Added – [X]`),
  donc le titre n'est pas le signal : c'est **la fiche qu'il contient**, et elle
  a la même forme aux deux ères au marqueur près (`#` → `＊`, `Schedule` →
  `Period`/`Pickup Period`). Un seul parseur couvre les 89 notes ; la « passe 2 »
  n'a pas eu lieu d'être. Deux pièges du brief tombent aussi : les homonymes se
  résolvent seuls (`showNickName` + `nickname` reconstruit « Demiurge Stella »,
  « Holy Night's Blessing Dianne » — aucune curation), et les Core Fusion, que le
  brief laissait à curer, se datent par leur section major9.
  Ce qui a vraiment coûté, ce sont les pièges du HTML : une cellule de table de
  taux (`1.25%`) lue comme un titre de section, qui coupait la section de
  Demiurge Stella avant sa fiche ; trois champs COLLÉS sur une ligne
  (`# Battle Type: Mage# Subclass: Wizard# Schedule: 1/30 …`, Regina) ; six
  écritures de date dont un `24/10/22` en `YY/MM/DD`, unique dans l'archive.
  **La date vient de la note, jamais du post ni du titre** — l'archive major9 a
  été rechargée dans le désordre après le transfert de service (la note de
  Viella est datée du 2025-11-02 et couvre le 10/23), et là où intro et titre
  coexistent ils divergent 3 fois, l'intro ayant raison les 3 fois (la note du
  2023-08-14 s'intitule « 8/15 » et annonce « August 16 » ; la fiche de Sterope
  tranche). `RecruitGroupTemplet` reste un CONTRÔLE, jamais une source : avant
  09/2023 ses `StartDate` sont 8 à 26 jours en avance (dates internes/KR — la
  table date Rin au 2023-04-27 quand la note écrit « Rin (Added on 5/23) »).
  **Confrontation à `data/curated/banner.json` : 20 concordances au jour près,
  zéro contradiction.** Elle a fait sortir deux coquilles d'un an dans le curé
  (Primine `2025-02-10` pour une bannière finissant en 2026 ; la « release 2023 »
  de Poolside Trickster Regina, dont la première mention dans les 1765 posts
  archivés est du 2024-07-15) — corrigées par Sevih, dont 5 lignes de 2024 qui
  suivaient une autre convention (date d'annonce + 21 j forfaitaires).
  Le curé `data/curated/character-release.json` porte les 47 dates que l'archive
  ne PEUT pas donner : le roster de lancement (46 persos au 2023-04-19 — les
  Update Notice ne commencent qu'au 2023-05-01 ; vérifié qu'aucun perso ne sort
  entre le 19/04 et le 01/05) et le trou du transfert de service (S. Ember au
  2025-10-01, sur lequel `banner.json` et les tables concordent). Il ÉCRASE la
  dérivation, seul moyen de corriger une dérivation fausse sans toucher au code,
  et le générateur warne sur une entrée qu'il retrouve déjà — sinon le fichier
  pourrit.
  **Garde-fou** : un perso sans date d'aucune source fait échouer la génération
  en le nommant, doublé d'un test sur le committé (sans ça le trou revient en
  silence au prochain patch — c'est exactement ce qui était arrivé aux bannières
  purgées). Il tient compte de la garde perso du promote : le jeu embarque les
  persos des patchs à venir (`2400015`, sans même un nom), et on ne leur cherche
  pas de date — filtre sur une PREUVE de non-intégration, jamais sur une absence
  de donnée, comme `lib/released.ts`.
  **Régénéré à l'intégration** (demande Sevih) : `integrateCharacter` calcule les
  dates AVANT la moindre écriture, donc un perso sans date arrête l'intégration
  sans avoir touché à `characters.json` au lieu de laisser le validé à jour et
  les dates en retard ; le message dit quoi ajouter au curé et la route admin le
  remonte tel quel. Le cœur `integrateCharacterData` ne fait qu'écrire, les
  dates lui sont branchées par le wrapper comme les skills frais.
  42 tests ajoutés, chacun citant la note dont il est tiré ; 1672 verts au total.

- **La date de sortie est SERVIE** — le reste de la spec ci-dessus, débloqué le
  jour même par une suggestion Discord (好, 13/08 : « characters are shown in
  alphabetical order, would be great to add the option to sort them by release
  date ; also would be great to add release date at charas info page »). Elle
  demandait exactement les deux consommateurs prévus, donc aucun arbitrage à
  reprendre. Accès par `src/lib/data/character-release.ts` (import statique de la
  donnée générée, comme `characters.ts`/`recruit.ts` ; contrat ré-exporté par
  `@contracts`).
  **Tri de `/characters`** : segmenté « Nom | Sortie » dans le bandeau des
  filtres actifs — dernier réglage avant la grille, et le seul endroit visible
  même sans aucun filtre (la barre de filtres, elle, se replie en tiroir sur
  mobile). Re-cliquer « Sortie » inverse le sens, flèche à l'appui ; le défaut
  est le plus RÉCENT d'abord, qui est ce qu'on vient chercher. « Nom » ne trie
  pas : il rend l'ordre serveur (rareté décroissante puis A→Z), et comme le tri
  natif est stable c'est aussi le départage des ex æquo par date — il y en a
  beaucoup, 46 persos partageant le jour du lancement global.
  Le tri voyage en clair (`?sort=release` / `release-asc`), **hors du codec
  `?z=`** : celui-ci est un contrat public figé partagé avec la V2, on n'y ajoute
  pas un champ pour un état d'affichage. Il n'est pas remis à zéro par le bouton
  reset — ce n'est pas un filtre.
  **Fiche perso** : ligne en tête du bloc `meta`, avant le profil in-game (la
  date est une donnée wiki, pas une fiche de perso), formatée par locale en UTC
  comme les autres dates du site. Clés `characters.sort.*` et
  `page.character.release` dans les 5 langues.

- **Une étape qui casse ne renvoie plus toute la pipeline à zéro** (constat
  Sevih, dans la foulée de la panne fontTools ci-dessous : pull, extract,
  convert, face-layout et sprite-rect étaient verts, une étape de deux secondes
  les a tous fait rejouer). Le gating était binaire pour toute la chaîne — un
  stamp unique, écrit une seule fois tout à la fin, qui dit « tout a réussi »
  sans jamais dire QUOI. C'est une bonne propriété (auto-réparation : un extract
  planté laisse la signature désynchronisée, le run suivant se rattrape sans
  `--force`) mais sans aucune granularité, alors que le coût est très asymétrique
  — `extract` sort 2,2 Go et ne cache rien, les étapes qui cassent le plus sont
  les moins chères et les plus tardives.
  Deux gardes posés, tous deux permis par le même préalable : **la chaîne est
  désormais DÉCLARÉE** (`genSteps`) au lieu d'être une ligne droite d'appels. On
  ne peut ni annoncer ni reprendre une étape qui n'a pas de nom.
  **Pré-vol** : l'outillage python de toutes les étapes est sondé AVANT le pull,
  et ce qui sera sauté est annoncé immédiatement. La panne de ce matin coûtait un
  quart d'heure de datamine pour une information connaissable à la seconde 0. Le
  verdict est calculé une fois et réutilisé par la boucle — ce qui est annoncé
  est exactement ce qui se passe, il n'y a plus deux sondages qui pourraient
  diverger.
  **Reprise** : `.gamedata/.refresh-checkpoint.json`, réécrit après CHAQUE étape,
  effacé au succès complet. Le refus explicite, c'est l'incrémental (option
  écartée) : modéliser les entrées de chaque étape demande de n'en oublier
  aucune, et une entrée oubliée sert de la donnée périmée EN SILENCE — bien pire
  que rejouer. La promesse tenue est plus étroite et vérifiable : mêmes entrées,
  mêmes sources, on reprend où ça a cassé ; tout le reste jette le checkpoint.
  La clé porte `.gamedata/files` ET l'empreinte des sources `datagen/**`
  (.ts/.py). Cette seconde moitié est le vrai garde : sans elle, le scénario le
  plus probable te mord — build casse, tu corriges `bytes-parser.ts`, la reprise
  saute `convert` et tu débogues sur du JSON périmé. Bornée aux SOURCES et pas
  aux JSON du dossier, sinon `face-layout` changerait la clé au milieu du run et
  invaliderait le checkpoint qu'on vient d'écrire — une reprise qui ne reprend
  jamais. `--force` la jette aussi : « rejoue tout » et « reprends » sont
  contradictoires.
  L'auto-réparation par le stamp est intacte : le checkpoint est purement
  additif, l'effacer ramène au comportement d'avant. Tests : 31 sur `refresh`
  (les quatre décisions sont maintenant des fonctions pures — `regenDecision`,
  `dumpDecision`, `resumeDecision`, `preflightPython`, cette dernière avec sonde
  injectée), dont le cas de ce matin en régression : UnityPy présent + fontTools
  absent ⇒ seule `font-metrics` annoncée. 1630 tests verts au total.

- **`pnpm dev` ne meurt plus sur une machine outillée à moitié.** Sur le
  portable, l'étape `font-metrics` a fait échouer tout le refresh
  (`ModuleNotFoundError: No module named 'fontTools'`) — alors que le garde posé
  le 2026-08-07 existe précisément pour SAUTER une étape python non outillée. Il
  ne l'a pas vue : il sondait `import UnityPy` pour TOUTES les étapes, un module
  témoin et non celui dont l'étape dépend. UnityPy étant installé, le garde
  disait « bon » et le script mourait deux lignes plus loin. Le sondage est
  désormais **par étape** (`pyStep(label, file, mod)`), donc un garde qui ne peut
  plus mentir : ajouter une étape python sans déclarer son module la laisse
  échouer bruyamment, ce qui est le bon défaut.
  Deuxième casse au même endroit, indépendante : le script passé, il mourait sur
  son propre log. Sous Windows python encode sa sortie dans la codepage ANSI
  (cp1252) — les accents passent, la flèche « → » lève un `UnicodeEncodeError`.
  `refresh` force donc `PYTHONIOENCODING=utf-8` pour toutes les étapes python,
  ce qui décorrèle leur sortie de la console héritée. Le JSON, lui, était déjà
  écrit : la sortie régénérée est identique au fichier committé, aucune donnée
  n'avait bougé.
  La dépendance ne vivait nulle part — `datagen/requirements.txt` n'a jamais
  connu que UnityPy depuis que `extract-font-metrics.py` existe (2026-08-08).
  Elle y est, avec **brotli** déclaré explicitement : c'est la compression du
  WOFF2, donc non facultatif pour lire `src/fonts/*.woff2`, et il n'arrivait
  jusqu'ici qu'en transitif d'UnityPy. `init.ps1` posait déjà le requirements
  entier, il couvre donc le nouveau cas sans changement de logique (ses libellés
  parlaient encore de « la SEULE étape python » — corrigés, ils sont trois).
  fontTools 4.63 installé sur le portable dans la foulée. Doc alignée : le § de
  `datagen/README` (le tableau des scripts gagne une colonne « Module » et une
  ligne) et le §1 de `docs/procedure/installation.md`, qui insiste maintenant sur
  « installer le fichier en entier, pas un module à la carte » — c'est
  exactement la moitié d'outillage qui transforme un cas sauté proprement en
  étape qui échoue.

## 2026-08-13

- **Réordonner les héros d'un palier de « Recommended choices »** (demande
  Sevih : ajouter ne suffisait pas, il faut pouvoir classer). Dans un palier
  l'ORDRE est le contenu — la page les affiche de gauche à droite dans l'ordre de
  la liste — et il n'était modifiable qu'en supprimant/rajoutant à la bonne
  place. Chaque ligne porte désormais son rang à gauche et deux flèches, ces
  dernières DÉSACTIVÉES aux extrémités : un bouton qui ne fait rien quand on
  clique se lit comme une panne.
  Le geste existait déjà dans `EventsEditor` (`moveBlock`). Plutôt que d'en poser
  une seconde copie, l'échange descend dans `lib/admin/reorder` (pur, donc
  testable seul) et les deux boutons dans `MoveButtons` ; EventsEditor est migré
  dessus dans le même commit — laisser la copie aurait créé exactement la dette
  qu'on voulait éviter.
  Ce que les tests gardent n'est pas l'échange du milieu mais le CAS LIMITE : la
  première ligne qu'on monte, la dernière qu'on descend. Sans garde, l'échange
  avec un indice hors bornes fabrique un `undefined` dans la liste et l'éditeur
  l'enregistre. Un mouvement bloqué rend la liste d'origine À L'IDENTITÉ PRÈS,
  ce qui permet d'appeler sans condition sans provoquer de re-rendu — et c'est
  vérifié, sinon la propriété se perdrait à la première réécriture.
  1615 tests verts.
  NON REPRODUIT, classé : l'erreur d'hydratation signalée sur le bouton « Export
  this hero » ne réapparaît pas dans un onglet neuf (Sevih). Le code est
  déterministe (`selected` démarre à `null`), et le HTML fautif supposait un
  héros déjà sélectionné — un état qu'un rendu serveur frais ne peut pas
  produire. Artefact de Fast Refresh, rien à corriger.

- **Priorités de pull : une cible « 6★ » s'affichait 5★** — signalé par Sevih. Le
  champ `stars` part en `transcendence` au portrait, c'est-à-dire en PALIER
  (`TransStar`) ; le sélecteur admin, lui, proposait « ★ 3 / 4 / 5 / 6 » et
  stockait ces nombres tels quels. Les deux échelles coïncident jusqu'à 4 puis
  divergent — 5★ = palier 6, 6★ = palier 9 — donc choisir « 6 » donnait un
  portrait à cinq étoiles. Sans erreur, sans signal : un palier 6 est valide.
  EXACTEMENT la confusion déjà payée sur la tier list (cf.
  `transcend-step.test.ts`), et corrigée pareil plutôt qu'avec une seconde
  convention : la donnée porte des paliers, l'écran affiche des étoiles. Deux
  données voisines dans deux unités, c'est ce qui produit ce bug.
  Trois valeurs migrées (Monad Eva et Demiurge Vlada 5→6, Demiurge Luna 6→9) ;
  les 3 et 4 étaient justes par coïncidence, les deux échelles s'y confondant.
  Le sélecteur admin tire désormais ses options de la table du jeu — valeur =
  palier, libellé = ce qu'un joueur lit — et sur la rareté RÉELLE du héros.
  LA VALIDATION À L'ÉCRITURE ÉTAIT PIRE QUE MUETTE : sa règle « entre 1 et 6 »
  décrivait des étoiles, laissait donc entrer la faute, et surtout REFUSAIT la
  valeur correcte — la cible 6★ (palier 9) était impossible à enregistrer. Elle
  n'accepte plus que les crans PLEINS de l'échelle du héros, et énumère les
  valeurs valides avec leur libellé quand elle refuse.
  Ce qu'elle ne peut PAS attraper est écrit dans le test : un « 6 » reste
  ambigu — c'est le palier 5★ autant que le nombre qu'on écrit pour 6 étoiles.
  Aucune validation ne les distingue, d'où le correctif porté d'abord par le
  SÉLECTEUR. Le noter évite de croire la garde plus forte qu'elle n'est.
  CONTRE-ÉPREUVES : remettre la donnée en comptes d'étoiles fait rougir le
  nouveau test de `priorities` — avec le symptôme exact (« attendu 6★, reçu
  5★ ») —, et un cas dédié vérifie que les quatre crans pleins passent, sans quoi
  une règle qui refuse tout satisferait la première. 1608 tests verts.

- **Briareos/Gorgon : 20 objets réels, 4 référençables — et 37 refs déjà écrites
  affichaient le mauvais** — signalé par Sevih sur les boutons « +item » de
  l'éditeur assisté. Ces deux familles existent en CINQ objets chacune, un par
  classe, avec tuile, passif, mains et page détail différents ; le picker n'en
  proposait qu'un (la tête = striker).
  Le trou était double, et le second bien pire : `findFamily` TOLÉRAIT le suffixe
  de classe en le RETIRANT, donc `{I-W/Gorgon's Wrath [Ranger]}` résolvait — vers
  le striker. Icône, passif et lien de la mauvaise classe, sans le moindre
  signal. Compté dans le contenu publié : **37 références suffixées** montraient
  toutes le striker (14 Briareos [Ranger], 12 Gorgon's Vanity [Mage], 6 Gorgon's
  Wrath [Ranger], 5 Gorgon's Vanity [Defender]). Le correctif les répare toutes.
  Un seul vocabulaire, `gearDisplayNames`, sert désormais le picker ET l'index du
  résolveur : l'un ne peut plus proposer ce que l'autre refuse. Le nom NU reste
  accepté au rendu (contenu déjà écrit) mais n'est plus proposé — ces familles
  sont cinq objets, pas six.
  Le test du CONTRAT CROISÉ, posé au passage, a trouvé tout seul un défaut sans
  rapport : le picker d'items proposait « {0}'s Limit Break Factors », un gabarit
  du jeu dont le `{0}` n'est jamais substitué — les accolades ferment le tag,
  donc l'insérer produisait une référence invalide. Les noms portant `{`, `}` ou
  `|` sont désormais écartés.
  CONTRE-ÉPREUVES, chacune vérifiée en annulant son correctif : sans les entrées
  par variante le picker les perd, sans la variante au rendu les cinq se
  confondent. 1602 tests verts.
  RESTE À FAIRE CÔTÉ CONTENU (pas touché : fichier en cours d'édition ailleurs) —
  dans `premium-limited/premium-reviews.json`, la review de Saint parle de
  `Gorgon's Wrath [Ranger]` en EN mais du nom NU dans les quatre autres langues :
  jusqu'ici les cinq montraient la même chose (le striker), désormais l'EN dit
  vrai et les autres non.

- **`assets:collect` — trois « manquants » éternels, deux causes (Sevih)** —
  (1) `CT_2010130` / `FI_2010130` : le manifest réclamait un visage pour la FORME
  DE COMBAT du skin de Demiurge Saeran. Les bundles disent la règle sans
  ambiguïté — AUCUNE forme n'a de visage à elle, ni celles des bases
  (`CT_2000130`, `CT_2000120` absents) ni celles des skins (`CT_2010130`,
  `CT_2010120` absents) ; seul `IG_Turn_` existe par forme. Le jeu ENCODE parfois
  l'emprunt (2010120 → `FaceIconID` 2010119) et on suivait cette indirection ;
  Saeran s'auto-référence, alors la demande partait dans le vide. La résolution
  passe donc par le LIEN DE TRANSFORMATION (`CharacterChangeTemplet`) quand la
  table s'auto-référence : 2010130 → 2010129, qui existe. Un seul saut — la
  transformation de Demiurge Luna est réciproque, remonter en boucle ne
  désignerait jamais de propriétaire. Rien ne change pour D. Luna (mêmes clés
  qu'avant), et `IG_Turn_2010130` reste demandé. ⚠ Ceci CLÔT la question posée le
  12/08 : pas de test en jeu à faire, l'asset n'existe pas et n'existera pas.
  (2) `CM_EtcMenu_Colleague.png` : la boucle des icônes d'outil postulait que
  toute icône vient du pool éditorial. Le hero-tracker est le premier outil dont
  l'icône est un sprite du JEU (menu principal) — le `.webp` passait par le
  dédoublonnage avec la collecte `ui/nav`, la variante PNG (og:image) réclamait au
  pool une source qui n'y sera jamais. Même résolution que les guides : pool
  d'abord, extraction ensuite. `assets:collect` : 0 manquant (1 produit).
  5 tests sur le cœur pur `resolveAppearanceFace`.

- **`/hero-tracker` — le résumé d'une rangée ne dit plus que ce qui RESTE (Sevih :
  « pourquoi je vois 6★ → 6★ ? »)** — il énumérait ses axes que l'écart soit nul
  ou non, si bien qu'un compte déjà 6★ partout lisait 119 fois « 6★ → 6★ ». Un
  axe à sa cible ne s'affiche plus. L'affinité gagne son segment au passage :
  elle ne se paie qu'en cadeaux, n'entre dans aucun décompte d'objets, et un
  héros à qui il ne manquait qu'elle n'avait donc rien à dire. Repli sur l'or
  s'il ne reste que lui — la ligne d'un héros qui a du travail ne peut pas rester
  vide.

## 2026-08-12

- **`/hero-tracker` — masquer les petites raretés, et des portraits qui disent la
  transcendance (Sevih)** — (1) « hide 1 star / 2 star » : deux réglages de plus,
  qui sortent ces héros de l'écran — roster suivi ET tiroir « ajouter », sinon
  masquer laisserait les proposer. À ne pas confondre avec « hors totaux », qui
  les garde visibles et éditables : les quatre cases vivent désormais dans une
  GRILLE `1★ / 2★ × masquer / hors totaux`, parce que quatre phrases entières
  disaient deux fois la même chose dans une colonne de 22 rem.
  (2) « refléter sur le portrait l'état de la transcendance (là ils ont tous
  leurs base star) » : la vignette d'un héros suivi prend `transcendence`, donc
  le palier saisi — un compte 6★ partout ne s'affiche plus en 3★. Le tiroir
  « ajouter », lui, garde la rareté de base : on ne possède pas encore le héros.

- **`/hero-tracker` — import d'un roster capturé (Sevih : « je vais faire un truc
  côté gear-solver pour exporter un JSON »)** — personne ne saisit 119 héros à la
  main. Un FORMAT D'ÉCHANGE versionné (`outerpedia:hero-tracker` v1), documenté
  en tête de `roster-import.ts`, et un bouton dans les réglages qui remplace tout
  le roster suivi (les réglages, eux, sont conservés). Le fichier ne parle qu'en
  termes de JEU — `transcend_star` est l'étoile INTERNE (1→9, qui démarre à la
  rareté de base : un 3★ non transcendé vaut 3), `core_fusion` dit qu'on possède
  le fusionné À LA PLACE de sa base, `owned: false` sort un héros du suivi.
  Le module d'import est la FRONTIÈRE et se comporte comme telle : enveloppe
  absente ou version inconnue → refus en bloc (un fichier étranger n'écrase pas
  un roster) ; champ absent → plancher ; champ hors plage → BORNÉ, parce qu'un
  fichier presque juste vaut mieux qu'un import refusé. 10 tests.
  Vérifié bout en bout sur la capture réelle de Sevih (119 héros, 6 Core Fusion)
  : l'import et le générateur de commande console produisent le même total au
  franc près (76 441 objets, 1,16 Md d'or), et le moteur les digère.

- **`/hero-tracker` — deux réglages « ignorer les 1★ / les 2★ » (Sevih)** — « on
  peut les renseigner mais les ressources ne sont pas comptabilisées » : leur
  carte reste éditable et affiche son besoin, qui est vrai, mais ils n'entrent
  dans AUCUN total — ni liste de courses, ni or/XP/affinité, ni pièces. Personne
  ne farme les manuels d'un 1★, et les compter noyait la liste de courses sous
  des lignes qu'on n'achètera jamais. Une marque « non compté » sur la rangée du
  héros, sinon le total aurait l'air faux.

- **`/hero-tracker` — filtrer, trier, et surtout ARRÊTER DE BOUGER (Sevih, en
  remplissant son compte en prod)** — trois gênes de saisie réelle : (1) aucun
  filtre sur « mes héros », (2) aucun tri, (3) « la position des perso dans la
  liste qui bouge pendant que l'on édite c'est chiant ». Une barre de roster
  apparaît dès qu'un héros est suivi : filtres élément / classe / rareté (icônes
  du jeu, un clic pour poser, un autre pour retirer) et quatre tris — à farmer,
  niveau, affinité, nom — chacun avec son sens naturel (le plus gros besoin
  d'abord, les niveaux et affinités les plus BAS d'abord : c'est ce qu'il reste
  à monter), recliquer le critère actif inversant le sens.
  La troisième est la vraie : trier par niveau ou par besoin, c'est trier sur ce
  qu'on est en train de changer — la carte ouverte se déplaçait sous le curseur
  à chaque « + ». DÉPLIER UN HÉROS GÈLE DONC LA LISTE ; changer de tri, de
  filtre ou de roster la dégèle. (Deux impasses avant d'y arriver : ordre en
  `useRef` puis synchronisation par `useEffect` — les règles React du repo
  interdisent l'un comme l'autre, et elles ont raison : le gel n'est pas un état
  dérivé, c'est une décision de l'utilisateur, prise quand il clique.)
  Au passage : filtrer jusqu'à zéro n'affiche plus « aucun héros suivi » avec un
  bouton « choisir mes héros » — c'est un état de filtre, pas un roster vide.

- **`/hero-tracker` — PUBLIÉ (`unlisted` → `available`, ordre de Sevih)** — la
  boucle de revue passe en public : l'outil apparaît dans la landing `/tools` et
  dans la recherche. Reste au TODO ce qui ne bloque pas la publication —
  arbitrer les axes utiles, vérifier le barème de limit break d'un Core Fusion,
  et un `pnpm images` pour pousser le PNG d'og:image et les icônes `PI_*` des
  pièces, qui n'existent que dans le staging local (le manifest les demande
  déjà : rien à curer).

- **`/hero-tracker` — « un grand espace vide entre level et transcendance »
  (Sevih, sur un héros sans Core Fusion)** — la carte dépliée était une GRILLE à
  deux colonnes : elle alignait les lignes, donc le bloc « niveau » (une rangée)
  se retrouvait seul en haut d'une case aussi haute que les quatre rangées de
  compétences d'en face. Les axes passent en FLUX DE COLONNES
  (`md:columns-2` + `break-inside-avoid`) : chacun garde sa hauteur, la lecture
  reste verticale et l'ordre du DOM inchangé. Le bilan du héros sort du flux
  pour rester pleine largeur (une colonne CSS ne connaît pas `col-span`).

- **`/hero-tracker` — le cadeau préféré devient la règle, et les pièces se lisent
  comme elles se farment (Sevih)** — (1) « au contraire il faut forcer les gift
  préférés (sinon c'est con) » : personne n'offre autre chose que son cadeau
  préféré à un héros qu'on monte, donc le +50 % est TOUJOURS appliqué et la case
  à cocher disparaît — avec elle la note « comptés sans le bonus », qui
  n'annonçait plus qu'un majorant théorique (deux clés i18n retirées ×5).
  (2) Le bloc des pièces passe de la liste (nom + nombre + doublons) à une
  GRILLE 3 COLONNES d'icônes, le besoin sous chacune, GROUPÉE PAR ÉLÉMENT —
  parce que c'est par élément qu'on va les chercher. Les héros `premium` et
  `limited` en sortent : leurs pièces ne tombent dans aucun donjon d'élément, et
  les ranger sous « feu » promettrait une source qui n'existe pas. Le tri vient
  des tags CURÉS (aucune colonne du jeu ne dit comment un héros s'obtient — seul
  `data/curated/characters.json` le sait) ; le nom du héros et le « ou N
  doublons » vivent dans l'infobulle, l'icône suffit à le reconnaître.
  DEUX familles à part, pas une (correction de Sevih) : « limité » au sens du
  joueur couvre TOUT ce qui ne revient pas — `limited` + `seasonal` + `collab`,
  soit 13 héros — là où les tags curés les distinguent par occasion ; le premium
  (12) reste achetable et fait son propre groupe. Restent 100 héros classés par
  élément. Au passage, « ajouter un héros » ne propose plus ceux déjà suivis :
  ils vivent dans la liste au-dessus, avec leur bouton pour en sortir.

- **`/hero-tracker` — les pièces portent enfin leur icône (`img.piece`, genre
  `piece-icon` du datagen que Sevih venait de construire)** — l'outil écrivait
  « Pièces du héros ×450 » en toutes lettres, seul besoin sans visuel au milieu
  de tuiles d'items. Il rend maintenant `PI_<id>` dans les deux endroits qui
  comptent : le chip du héros déplié et le bloc « par héros, jamais mutualisées »
  du récap. Variante SANS halo : le `_Fx` marque les pièces « rares », une
  donnée curée côté site qui n'existe pas encore. L'icône est composée et porte
  déjà son cadre du jeu — pas de tuile de rareté par-dessus, qui en ferait deux.

- **`/hero-tracker` — « pas très compréhensible pour distinguer ce que l'on a de
  ce que l'on cible » (Sevih, capture à l'appui)** — le vrai défaut : les deux
  contrôles d'un axe (le champ, les paliers) ne disaient pas lequel portait
  l'état et lequel portait la cible, et l'en-tête écrivait l'état en ACCENT et
  la cible en gris — l'inverse de ce que montrait le bouton de palier
  sélectionné. UN SEUL CODE COULEUR désormais, partout : ce qu'on possède est en
  clair, ce qu'on vise est en accent. Chaque contrôle porte son rôle en toutes
  lettres (« Actuel » / « Objectif »), et les échelles (transcendance, fusion,
  skills) distinguent enfin TROIS états au lieu de deux gris jumeaux — acquis,
  reste à faire (teinte accent), hors cible — le cran visé portant un liseré.
  Au passage : le résumé replié suit le même code, la cible s'affiche même quand
  le réglage « tout au max » la rend non saisissable (elle existe, elle vaut le
  plafond), le rappel « clic = actuel · maj+clic = objectif » s'affiche sur les
  trois échelles et non plus sur les seuls skills (`skillHint` → `scaleHint`),
  et l'en-tête du palier de fusion cesse d'annoncer « 0 → 5 » alors que le 0
  n'existe pas pour un fusionné qu'on possède.

- **`/tools/hero-tracker` — V2 : le périmètre RÉEL du jeu (Sevih, en termes
  in-game)** — « matériaux pour monter un perso de 5 à 120 + les breakthrough
  105/110/120, les skills 1/2/3/**chain passive** de 1 à 5, l'XP d'affinité
  0→100, les EE de 0 à 10, les pièces restantes pour amener le héros 6★ », plus
  un panneau de RÉGLAGES car « on ne possède pas à la fois le perso de base et
  sa Core Fusion : c'est soit l'un soit l'autre », et « les Core Fusion montent
  tous leurs skills en même temps mais pas avec des bouquins ».
  QUATRE QUESTIONS, TROIS TRANCHÉES PAR LA DONNÉE plutôt que par Sevih : (1) le
  limit break ne consomme PAS les pièces du héros — la chaîne est _Limit Break
  Memory_ (Singularity) → _Memory [élément au choix]_ → _Limit Break Factor_ du
  héros, donc une ressource DISTINCTE de la transcendance, agrégeable par
  élément ; (2) `affinityCurve[9] = 170 000` = exactement le « niveau 10 »
  annoncé par le guide et par _Oath of Determination_ → index = niveau − 1,
  aucun décalage ; (3) le `skillLevel` de `transcend.json` monte 0→4 et le
  passif de transcendance (`unique_passive`) a `maxLevel: 4` : c'est SON niveau,
  pas celui de S1/S2/S3 — aucun coût, aucune interaction avec les manuels (la
  question « le chain passive monte-t-il à la transcendance ? » est close).
  Restaient à Sevih : la transcendance se paie en N pièces OU un doublon (le
  moteur rend donc AUSSI `transcendSteps`, l'écran affiche « 900 pièces (ou 6
  doublons) »), et un fusionné hérite du niveau, de l'affinité, de la
  transcendance et de l'EE de sa base **et débloque un second EE au niveau 0** —
  seuls les skills repartent à 1.
  DATAGEN : `CharacterFusionTemplet` + `CharacterFusionLevelTemplet` existaient
  → rien de curé, `hero-growth.fusion` dérive les 6 couples (base → fusionné),
  l'étoile exigée et le barème (300 cores au déblocage puis 4 × 150 = 900, ce
  que dit l'éditorial du guide core-fusion). Le générateur VÉRIFIE que chaque
  colonne `Skill_n_Level` vaut le numéro du palier : c'est cet invariant qui
  autorise l'outil à n'offrir qu'UN curseur pour les skills d'un fusionné, et il
  jettera le jour où le jeu changera d'avis.
  MOTEUR : 4 slots de skill (chain passive incluse), régime de fusion exclusif
  (cores, pas de manuels, palier 1 = déblocage), `ee` devient un TABLEAU (deux
  barres pour un fusionné), `fragments` → `pieces` + `transcendSteps`, et
  `giftBreakdown` accepte le bonus du cadeau préféré. 21 tests (+5).
  ÉCRAN : panneau de réglages (choix Base ⇄ Core Fusion par couple — la version
  non retenue disparaît du roster ; bonus « cadeau préféré » +50 % en option, ce
  qui tranche le point (3) resté ouvert au TODO en le rendant à l'utilisateur),
  transcendance saisie en ÉTOILES DU JEU (« 5★+1 ») et non en index interne,
  départ au niveau 5 (recrutement) et cibles préremplies au PLAFOND de chaque
  axe — la question que pose l'outil est « que me reste-t-il pour finir ce
  héros ? ». Store v2 avec migration depuis v1 (une saisie déjà faite vaut mieux
  qu'un écran remis à zéro). 32 clés i18n ×5.

- **Générateur `solver` : outerpedia alimente l'app desktop gear-solver (fin de
  la dépendance au repo mort outerpediaV2)** — port fidèle de
  `gear-solver/data/build.mjs` + `calc-stats.mjs` (~1500 l., la spec exécutable)
  en `datagen/generators/solver.ts` + `solver-ingredients.ts` : **19 fichiers**
  émis dans `data/generated/solver/` (committé/promu comme le reste), que l'app
  téléchargera tels quels — plus aucune distillation côté client. Branché au
  `datagen:build` standard ; la vue des sets vient du MÊME `buildEquipment()`
  (source unique). Remplacements spécifiés : `effect_icon` curated supprimé (ISO
  IconName couvre 100 %), prose des sets = desc du jeu OU synthèse « Label
  +valeur » (libellés V2 exacts), `sub-ticks` recomposé depuis les pools
  `ItemOptionTemplet` 105/106 (calibré à l'identique), `dmgStat`/`dmgSec`/
  `noCrit` re-dérivés des tables brutes — scan S1/S2/S3 + Skill_8 (le
  eff-scaling de Nella vit dans les buffs partagés `trancendent_8_owner_*`) +
  Skill_22/23 (les swaps de Domine/Skadi/Anarky/Epsilon), PAS les skills backup
  (Tamara), noCrit sur tout le kit (le `_passive` de Rhona est hors S1-S3).
  VALIDÉ par deep-diff contre `gear-solver/data/derived` (étalon) : **12
  fichiers identiques octet pour octet**, et tous les écarts expliqués table
  brute à l'appui — ajouts du patch (Lambda/H.Delta/Saeran, armes 998/999),
  armes 629/641 passées 5★→6★ par le jeu, et 6 scalings de la réf DISPARUS ou
  nerfés dans le jeu actuel (Laine, Veronica ×2, Fatal, K.Tamamo eff 1.2,
  Cindy 1.5→1 — balance patch, kits revérifiés buff par buff). `version.json`
  = hash de contenu 12 hexa idempotent (builtAt repris si inchangé — clé
  d'invalidation de cache de l'app). Le garde perso écarte 2400015 du solver
  committé comme partout. Tests : `solver.test.ts` (10 cas — contrat de FORME
  enums bruts/EN simple, cohérence gems↔options, courbes, version). 518/518,
  TSC datagen + racine verts.

- **Promote : les faux orphelins `damage/*` + `video-meta.json` ne crient plus**
  (question Sevih sur les ⚠ du `--apply`) — ces 7 fichiers sont des validés
  SANS équivalent extrait PAR CONSTRUCTION : `damage/` sort du pipeline dédié
  `datagen/damage/build.ts` (source = binaire, jamais `build.ts`) et
  `video-meta.json` de `pnpm datagen:video-meta` (à la demande). Le promote les
  signalait « à trancher » À CHAQUE run — même motif que `comics.json` déjà
  exclu : du bruit qui masque les vrais orphelins. Ajoutés à `isPureCurated`
  (l'idiome existant), avec le POURQUOI par fichier. Vérifié sur le promote
  réel : plus aucun ⚠, il ne reste que le ⛔ attendu (2400015). 25/25.

- **D.Luna ne disparaît plus de l'extrait — le cycle de change-forme piégeait la
  sélection (l'inbox « 1 removed » de Sevih)** — la MAJ du jour a rendu le
  change-forme de Luna ALLER-RETOUR dans `CharacterChangeTemplet` (`2000119→
2000120` ET `2000120→2000119`, `ON_ACTIVE_SKILL_2`). Or `select` écartait
  comme « forme » TOUTE cible `ChangeCharacterID` : la base, devenue cible du
  « retour », sautait — Luna extraite=absente, proposée « removed ». Correctif :
  `formIdsFrom(changeRows, byId)` (pur, exporté, testé) — une cible n'est une
  forme que SANS identité propre (`ownIdentity`) ; mesuré sur les 6 cibles du
  jeu : seule la base cyclée a la sienne, toutes les vraies formes empruntent
  leur `NameID` (y compris les 2 formes `ON_DIE` de Saeran, inchangées). Une
  future forme à identité propre passerait en inbox (revue humaine, pas perte
  silencieuse). +3 cas (cycle → base gardée/forme écartée ; sens unique ; cible
  hors templet → prudence). VÉRIFIÉ par rebuild réel : 125→126, Luna revenue,
  0 removed, seul le NEW attendu (2400015). Au passage, DIAGNOSTIQUÉ pour
  Sevih : les 2 manquants d'assets (`CT_2010130`) = la change-forme du COSTUME
  de Saeran s'auto-pointe en `FaceIconID` (contrairement à D.Luna qui pointe le
  frère) et sa texture n'est pas dans les bundles téléchargés — test in-game à
  faire avant tout fallback ; et les 2 tests rouges du moment étaient l'état
  TRANSITOIRE de l'intégration Saeran — RÉSOLUS tous deux par le
  `promote --apply` de Sevih (l'EE a retrouvé ses passifs/pools, et les options
  de palier `_s_2/_s_3` du nouveau boss de Singularité « Ksai » 75000102
  étaient déjà générées, elles attendaient juste la promotion de
  `glossaries.json` — rien à mapper, 34/34).

- **Garde perso : la retenue remplace le tout-ou-rien (question Sevih « un perso
  datamined non-release bloque tout ? »)** — oui, c'était le cas : le refus
  d'apply était ENTIER, donc un perso complet présent dans la donnée avant sa
  sortie (bagage aux ids insécables — buff d'EE, icône de costume, vars de
  skill) aurait bloqué TOUTE promotion en lot jusqu'à sa release, avec pour
  seuls contournements `--only` manuel ou une intégration-spoiler. Décision
  (arbitrée Sevih) : les fichiers où une réf survit sont **RETENUS** — jamais
  écrits, listés `⛔ RETENU (non promu)` avec leurs ids — et **le reste du lot
  se promeut**. La garantie « jamais publié » reste à l'octet près (aucun octet
  contenant l'id ne part) ; les fichiers retenus rattrapent leur retard à
  l'intégration du perso. Dry-run inchangé (avertit, EXIT=0). Tests réécrits
  (le cas « REFUSE la promotion entière » devient « RETIENT le fichier, promeut
  le reste », 31/31) et VÉRIFIÉ sur la donnée du jour : les 3 fichiers de
  Saeran `⛔`, le reste promu-able.

- **`pnpm dev` ne tombe plus en panne sur une MAJ à nouveau perso (deadlock du
  garde perso en dry-run)** — la MAJ du jour (Saeran `2000129`) a fait ÉCHOUER
  `dev-refresh` : le garde perso de `promote` levait AUSSI en dry-run quand une
  réf d'un perso non intégré survit à l'écartement (formes légitimes que le strip
  ne peut pas retirer : buff d'EE `BID_CEQUIP_2000129`, icône de costume
  `TI_Costume_Clothes_2000129_02`, clés de vars de skill `2000129_1_1`). Or le
  refus bloquait `pnpm dev`… qui sert l'admin, seul outil d'intégration du perso :
  deadlock de flux. Correctif : en **apply**, refus bloquant INCHANGÉ (rien n'est
  écrit) ; en **dry-run**, la revue AVERTIT (même message + « l'apply, lui,
  refusera ») et continue — rien n'allait être écrit de toute façon. `violations`
  exposé dans `PromoteResult`. Testé (31/31 promote+refresh, dont le nouveau cas
  dry-run) et VÉRIFIÉ en rejouant le promote réel sur la donnée du jour :
  EXIT=0, diff complet affiché, `⛔ 2000129, 2400015` listés, rien écrit. Aucun
  générateur à corriger : les 3 formes survivantes sont des données légitimes du
  nouveau perso, légales dès son intégration via l'admin.

- **L'onglet Monster d'une version versionnée montre ce qui BOUGE : l'état du
  boss** — correction de cap demandée par Sevih (« perso j'aurais juste fait un
  sélecteur de version ; là si je veux je peux assigner Deep Sea à un guide de
  Prototype »). Il avait raison et la mesure le dit : sur les 16 guides
  versionnés, **aucun** ne change de combat d'une version à l'autre (Annihilator
  garde `..._0001` sur ses 4 versions, Dahlia `world_boss:4086019` sur ses 3…).
  Le combat appartient donc au GUIDE. Le proposer par version n'ouvrait aucune
  possibilité utile, seulement celle de se tromper — et le filtre par mode posé
  juste avant n'y changeait rien : il ramenait 69 mauvaises réponses à 4.
  Ce qui varie vraiment, c'est l'ÉTAT du boss, et l'admin ne savait pas l'éditer :
  `pinned` n'était visible nulle part, posé par « Versionner » et corrigeable
  seulement dans le JSON. Nouveau `VersionPinPicker` : un choix par monstre du
  combat — Live / v1 · game 1.10.805 · Aug 11, 2026 / v2… — la note humaine de
  l'archive primant sur le numéro, comme au rendu public. Le combat, lui, passe
  en lecture avec un « Change for the whole guide… » replié, qui écrit dans
  TOUTES les versions qui en portent un : deux versions du même guide sur deux
  combats est exactement l'état qu'on veut rendre impossible.
  CONTRAT À TROIS ÉTATS sur `VersionDraft.pinned`, et il porte tout : `undefined`
  = l'écran n'en parle pas, le pin du disque est reporté (c'est le correctif du
  matin, qui empêche une sauvegarde d'effacer l'épinglage) ; `[]` = « tout en
  live », le pin est EFFACÉ ; une liste = écrite telle quelle, TRIÉE (sinon
  l'ordre des clics produit un diff git). Sans le deuxième état, le sélecteur
  serait à sens unique : on épinglerait sans jamais pouvoir revenir au live.
  Vérifié en contre-épreuve : reporter le pin inconditionnellement fait rougir
  les deux nouveaux cas. 1524 tests verts.

- **Le sélecteur de combat d'un guide proposait 69 réponses pour 5 valides** —
  signalé par Sevih (« le sélecteur de monstre est éclaté à cet endroit »), et la
  mesure lui donne raison largement : `listGroups` rendait TOUS les combats
  peuplés du jeu, tous modes confondus (20 adventure_mission, 15 guild_raid, 9
  adventure_challenge, 6 world_boss, 10 raid, 4 irregular_chase, 5 event_boss),
  à une catégorie qui n'en accepte qu'un mode. Pire, 23 de ces options portent un
  nom qu'une autre porte aussi (trois « Drakhan », deux « Dahlia », deux « Ars
  Nova »…) : on ne choisissait plus, on cherchait parmi des homonymes.
  `CatSpec.groupModes` déclare les modes éligibles, `listGroups(lang, modes)`
  filtre, et le picker montre le PORTRAIT du boss — reconnaître vaut mieux que
  lire. Joint challenge passe de 69 options à 5.
  La table n'a pas été écrite au jugé : elle est DÉRIVÉE de ce que les guides
  désignent réellement aujourd'hui, et un test la tient dans les DEUX sens — un
  mode utilisé mais non déclaré échoue, un mode déclaré que personne n'utilise
  aussi (une liste qui grossit sans jamais maigrir finit par ne plus rien
  restreindre). Plus la contre-épreuve du mécanisme : le filtre doit retirer
  quelque chose ET laisser de quoi choisir.
  Portée : c'est une garde d'ERGONOMIE, pas de rendu — un `group` hors mode
  s'afficherait très bien, il ferait juste un guide qui parle d'autre chose.

- **Versionner DEUX FOIS empilait mal — les vieilles versions sautaient sur la
  dernière archive** — trouvé en vérifiant contre le code le modèle que Sevih
  décrivait, qui était le bon : `v1,v2,v3 → y1`, versionner fige `y1@1` sous
  elles ; `v4` naît sans pin et suit le live ; au tour suivant, `v1..v3` doivent
  GARDER `y1@1` et seule `v4` prendre `y1@2`.
  Le code ne faisait pas ça. La règle « ré-épingler ce qui est ENCORE EN LIVE »
  était écrite en tête du module et appliquée aux références DIRECTES
  (`isLiveRef`), mais jamais aux INDIRECTES : `planRepin` collectait toute
  version dont le combat contient le monstre, sans regarder son `pinned`. Le
  deuxième versionnage aurait donc réécrit `y1@1` en `y1@2` partout — toutes les
  versions auraient fini par montrer le MÊME boss, et les états intermédiaires,
  pourtant sur le disque, n'auraient plus été lus par personne. L'empilement,
  c'est-à-dire tout l'intérêt du mécanisme, n'existait pas.
  Filtre posé côté plan, par MONSTRE et pas par version — la liste est creuse,
  une version figée sur un boss doit rester épinglable sur le second de sa
  rencontre. C'est la CONTRE-ÉPREUVE du test, sans laquelle un filtre trop large
  (« cette version porte un pin, on n'y touche plus ») passerait.
  La version laissée tranquille part en `kept`, comme le `meta.bossId` d'un guide
  versionné : deux motifs distincts, donc le motif descend dans l'entrée et
  l'admin l'affiche par ligne — un texte unique côté écran mentait sur l'autre
  cas. 1517 tests verts.

- **Le pin d'une version SURVIT aux gestes d'édition** — deux fuites trouvées en
  répondant à « comment je mets à jour, et dans quel ordre ? ». `pinned` est la
  seule clé de `config.json` que l'éditeur ne connaît pas : posée par
  « Versionner », jamais saisie, jamais affichée. Deux gestes ordinaires
  l'emportaient donc EN SILENCE.
  (1) SAUVEGARDER un guide versionné : `fromVersionDraft` reconstruit
  `config.json` depuis le seul brouillon — corriger une faute dans les conseils
  réécrivait le fichier sans le pin. L'archive restait sur le disque, le guide
  repassait au live, et rien ne le disait. C'est le plus grave des deux : il se
  déclenchait à chaque passage dans l'éditeur, sur un guide déjà épinglé.
  (2) DUPLIQUER une version : la copie emportait le pin de la source. La nouvelle
  version, créée précisément pour décrire le combat TEL QU'IL EST, naissait en
  montrant le boss d'avant — et il aurait fallu penser à l'enlever à la main,
  exactement le geste que « Versionner » existe pour supprimer.
  Réglé aux deux endroits : report du pin présent sur le disque à la sauvegarde
  (lu au chemin, pas via le cache de `listGuides`, qui peut rendre l'état
  d'avant), et copie SANS `pinned` à la duplication. `addGuideVersion` devient
  async — elle écrit désormais par `writeJson` comme le reste du store, plutôt
  qu'un second formateur qui ferait diverger les diffs.
  CONTRE-ÉPREUVES, les deux vérifiées en désactivant chaque correctif : une
  version sans pin n'en reçoit pas (un report inconditionnel écrirait une clé
  vide dans les 16 guides versionnés), et la duplication garde bien le RESTE du
  config (sinon vider le fichier passerait pour un correctif).
  Le bac à sable a lui-même appris quelque chose : ce store fige `CONTENTS_DIR`
  au CHARGEMENT, donc la redirection de `process.cwd()` doit précéder l'import et
  pas vivre dans un `beforeAll` — sinon le test écrit dans l'arbre réel du site.
  C'est la garde « source vérifiée AVANT la cible » de `addGuideVersion` qui a
  évité le dossier parasite au premier essai. 1515 tests verts.

- **Un boss figé le DIT** — dernier item de l'épinglage, et celui que le premier
  usage réel a rendu urgent : Sevih, devant ses trois versions de guide, ne
  pouvait pas savoir laquelle montrait quoi. Une carte archivée et une carte
  vivante étaient identiques au pixel près. Un lecteur prenait donc un boss d'il
  y a six mois pour l'actuel, et l'éditeur n'avait aucun moyen de vérifier son
  propre épinglage autrement qu'en lisant le JSON.
  La vue porte désormais un TAMPON (`BossView.archived` : numéro d'archive,
  version du jeu, date, note humaine), rempli par `getBossView` depuis l'entrée
  et recopié par `buildBossView` depuis ses sources — la fonction reste PURE, le
  tampon voyage avec les données au lieu d'être relu au disque par la carte.
  Bandeau PAR CARTE, et c'est la seule place juste : la liste `pinned` est
  CREUSE, donc une rencontre peut mêler un boss figé et ses renforts vivants. Un
  bandeau en tête de section mentirait sur la moitié des cartes qu'il surplombe.
  La note humaine de l'archive (`label`) PRIME sur le numéro de version : « avant
  la refonte de la maj 1.11 » dit ce qu'un `1.10.805` ne dira jamais.
  Trois clés dans les cinq langues, la phrase ENTIÈRE par cas (avec ou sans
  version de jeu) et jamais des fragments recollés — une langue qui place la date
  avant la version n'aurait aucun moyen de le dire.
  CONTRE-ÉPREUVE : la vue vivante n'a pas de tampon. Sans elle, un tampon posé
  inconditionnellement passerait le test tout en marquant « archivé » toutes les
  cartes du site. 1510 tests verts.
  La section `🧊` de TODO.md est retirée : le mécanisme est complet. Sa dernière
  décision sans trace ailleurs — la COMPOSITION de la rencontre reste LIVE, un
  vieux guide doit MONTRER une phase ajoutée depuis plutôt que la cacher — est
  descendue dans le code, sur la prop `pinned` de `BossEncounters`, là où on se
  pose la question.

- **Premier passage BOUT EN BOUT du mécanisme, sur du contenu réel** — Sevih a
  re-versionné les trois Prototype EX-78 (les trois difficultés du Joint
  Challenge sont TROIS monstres distincts, pas trois fois le même) avec le geste
  complet. Ce qu'il a produit, sans qu'aucun fichier soit édité à la main :
  trois archives auto-suffisantes (`4548161@1`, `4548171@1`, `4548181@1`, ref
  `31a5203`, sources figées) et la clé `pinned` posée toute seule dans les DEUX
  `config.json` de version qui rejouent ce combat (2025-10 et 2026-03).
  Vérifié sur le diff réel : `meta.json` NON touché — la règle `kept` tient en
  conditions réelles, et pas seulement en test. La version 2024-12 n'a pas de
  `group` et n'a donc rien reçu : correct, elle ne montre pas ce combat.
- **La garde des références de boss lit AUSSI les `pinned`** — trou ouvert le
  jour même : elle ne scannait que `meta.bossId` et `meta.monsters`, or un guide
  versionné ne nomme pas son boss, donc 100 % de ses références épinglées
  passaient à côté. Le mode de panne n'a rien de théorique : déposer les
  `config.json` sans committer `data/generated/monster-archive/` laisse des pins
  qui ne résolvent nulle part, et le rendu ne l'apprend qu'au build de prod.
  CONTRE-ÉPREUVE faite (archive retirée → la garde rougit en nommant le fichier
  manquant et la cause). Ce que le plancher `> 50` ne garde PAS est écrit dans le
  test : zéro pin reste un état éditorial légitime, un seuil dessus échouerait
  pour une bonne raison. 1508 tests verts.

- **La liste `pinned` : les guides qui ne NOMMENT pas leur boss savent l'épingler**
  — le dernier morceau, et celui qui rend tout le reste utile.
  Un guide versionné (joint-challenge, world-boss, guild-raid) désigne un COMBAT :
  ses monstres sont résolus au rendu depuis `encounters.json`, il n'y a aucun id à
  réécrire chez lui. Le pin ne peut donc vivre que dans une LISTE à part — `pinned`
  du `config.json` de la version, seul endroit qui puisse différer d'une version à
  l'autre — et c'est le RENDU qui doit faire passer chaque id du combat au travers.
  Sans ça, versionner un boss de mode versionné ne changeait rigoureusement rien à
  l'écran : l'archive existait et personne ne la lisait. Or c'est le cas
  MAJORITAIRE (mesuré : pour les boss versionnés par Sevih, 100 % des références
  sont indirectes).
  LECTURE : `pinResolver` (creux — un monstre absent de la liste reste live, donc
  zéro migration), branché dans `BossEncounters` et remonté aux quatre points
  d'appel des guides versionnés. `monsterDisplayNames` passe par `getMonster` au
  lieu de la table vivante : sur une version figée, c'est le nom D'ÉPOQUE qu'il
  faut désambiguïser, pas seulement dans la carte.
  ÉCRITURE : « Versionner » pose la clé lui-même (`addVersionPin`), idempotent et
  un seul état par monstre et par version — re-versionner REMPLACE le pin plutôt
  que d'en empiler deux, ce que `pinResolver` trancherait en silence.
  RÈGLE DE RENDU RETOUCHÉE, et c'est le piège de l'affaire : `VersionedBossGuide`
  monte le panneau de boss au-dessus des onglets quand toutes les versions jouent
  le même combat. Deux saisons qui rejouent le même groupe mais dont l'une épingle
  le boss d'avant une refonte ne montrent PAS la même chose — le panneau partagé
  aurait affiché le même boss aux deux, et la version figée aurait menti. La
  signature de partage comprend donc l'épinglage.
  Ce qui n'est PAS épinglable reste dit : un guide PLAT qui atteint le monstre par
  un combat n'a pas de version où poser le pin — et il suit le live par nature,
  puisqu'il décrit le contenu courant. 1508 tests verts.

- **Le `meta.bossId` d'un guide VERSIONNÉ ne doit JAMAIS être épinglé** — bug
  attrapé au PREMIER usage réel du mécanisme, et payé sur un fichier de contenu.
  Sevih a versionné trois boss (Annihilator ×2, Prototype EX-78). Le ré-épinglage
  automatique a réécrit `joint-challenge/annihilator/meta.json` :
  `bossId: "4318062"` → `"4318062@1"`. Or ce guide a QUATRE versions, et sur un
  guide versionné `meta.bossId` ne désigne pas le boss d'une version : il porte le
  portrait, le H1, l'og:image et la jointure saison — l'entité COURANTE. Épinglé,
  l'illustration du guide serait restée sur l'ancien boss jusque sur sa version la
  plus récente. C'était écrit dans la décision arbitrée (« `meta.bossId` reste
  LIVE ») ; `planRepin` ne faisait simplement pas la distinction.
  Fichier restauré, règle corrigée à la source : sur un guide versionné, la
  référence part dans `kept` — VUE et rapportée, jamais éditée. Une référence qui
  disparaît du plan sans un mot se lit comme un oubli, et l'admin l'affiche.
  MESURÉ SUR LES TROIS BOSS : toutes leurs vraies références sont INDIRECTES
  (`version.config` → `event_boss:…`), 0 édition légitime. Autrement dit le
  ré-épinglage automatique n'apportait rien ici et ne faisait que du mal —
  ces guides attendent la liste `pinned`, qui devient le vrai sujet.
  Deux cas de plus, dont la CONTRE-ÉPREUVE (un guide PLAT voit bien son `bossId`
  épinglé) : sans elle, la règle serait satisfaite par un plan qui n'épingle plus
  rien. 1500 tests verts.

## 2026-08-11

- **« Versionner » RÉ-ÉPINGLE les guides tout seul** — le `TODO(guides)` de
  `version-monster.ts:16` (« versionner ne doit JAMAIS demander d'éditer un guide
  à la main ») est tenu pour les références DIRECTES.
  Le bouton faisait la moitié du chemin : il écrivait l'archive, et les guides
  continuaient de pointer l'id vivant — donc l'ancien guide affichait le NOUVEAU
  boss, exactement ce que versionner cherche à éviter. La route enchaîne
  maintenant les deux gestes, le ré-épinglage APRÈS l'archive et seulement si elle
  s'est écrite : on ne fait pas pointer des guides vers un fichier absent (le
  rendu lèverait). `{ repin: false }` versionne sans toucher aux guides et rend le
  plan — rattrapage, ou inspection avant d'appliquer.
  GROUPÉ PAR FICHIER, et réglé À LA SOURCE : `patchGuideMeta` n'écrivait qu'un
  champ à la fois, or `meta.json` est relu via un cache mtime — deux patchs sur le
  MÊME fichier seraient partis du même état et le second aurait écrasé le premier.
  Le cas est réel (`adventure/S1-8-5` nomme son boss dans `bossId` ET dans
  `monsters`, vérifié sur la donnée : 2 éditions, 1 fichier). D'où
  `patchGuideMetaFields`, multi-champs en une écriture.
  CORRIGÉ AU PASSAGE : `RepinEdit.before/after` joignait les listes en `"a, b"`
  pour l'affichage. Écrire ça dans `meta.monsters` aurait produit un JSON faux, en
  silence, dans le contenu. Les valeurs sont désormais STRUCTURÉES (chaîne pour
  `bossId`, liste pour `monsters`) et c'est l'affichage qui joint.
  LE RÉSULTAT SE VOIT : la fiche admin liste les fichiers de guides réécrits (à
  committer aussi), et AVERTIT pour les références qui passent par un combat —
  elles ne sont pas ré-épinglables automatiquement et attendent la liste `pinned`.
  Les taire ferait croire le geste complet alors qu'il ne l'est pas.
  Cinq cas de plus (12 en tout), écriture SUBSTITUÉE par un journal : la vérifier
  pour de vrai demanderait un faux arbre de guides complet, et le seul autre choix
  serait de ne pas vérifier le groupage. 1498 tests verts.

- **Épinglage des boss, étape 3 : la GARDE sur les références de boss**
  CONSTAT en allant l'écrire : l'invariant « chaque `meta.bossId` existe dans
  `monsters.json` » n'existait PAS comme test — c'était une note de TODO. Les
  tests de guides ne vérifiaient que la cohérence `bossId` ↔ `encounters`, par
  catégorie. Une référence morte ne se voyait donc qu'au build de prod, une fois
  le contenu déposé (le rendu JETTE sur un monstre absent).
  Il est posé, et d'emblée pour LES DEUX formes que le rendu accepte : un id
  vivant doit être dans `monsters.json`, un id épinglé `<id>@<n>` doit avoir son
  fichier d'archive. Sans cette seconde branche, le premier ré-épinglage aurait
  passé toute la suite au rouge — l'invariant aurait interdit le mécanisme qu'il
  est censé protéger. Le message d'erreur d'un pin sans archive est rapporté tel
  quel : c'est lui qui nomme le fichier attendu.
  Plancher (>50 références), pas comptage figé : le nombre de guides monte
  légitimement. Les 89 références actuelles résolvent toutes.
  TODO.md remis d'aplomb : ce qui reste est ce qui ÉCRIT dans les guides —
  appliquer le plan (en groupant par fichier) et la liste `pinned` des guides
  versionnés, qui demande une lecture côté rendu.

- **Épinglage des boss, étape 2d : l'archive devient AUTO-SUFFISANTE**
  (direction Sevih : « le versionnage sauvegarde tout ce dont l'affichage a besoin »).
  `versionMonster` fige désormais, À LA MÊME RÉF GIT que l'entité, les sources qui
  donnent un SENS à ses références : les 9 sections du glossaire dont dépend le
  rendu d'un boss (`ARCHIVED_GLOSSARY_KEYS`), `curated/effects.json` et
  `curated/monster-skills.json`. Lues à la réf et pas au disque — en dev,
  l'auto-apply a déjà pu écraser le working tree avec la nouvelle maj, et figer
  l'ancien boss avec les libellés du nouveau n'aurait servi à rien.
  MESURÉ AVANT DE TRANCHER : le glossaire entier ne fait que 270 Ko (dont 125 pour
  les effets), les deux curés 12 et 7 Ko. On garde donc les sections ENTIÈRES
  plutôt que de déduire les seuls effets utiles : la déduction demanderait de
  tracer la résolution, et une restriction ratée produirait une archive
  silencieusement incomplète — le pire résultat pour un mécanisme dont tout
  l'intérêt est la fidélité. Versionner est un geste rare.
  UNE ARCHIVE QUI PORTE SES SOURCES GOUVERNE SEULE : on ne complète pas avec le
  live, sinon moitié figée et moitié courante se mélangeraient sans qu'on puisse
  dire laquelle on regarde. Une archive SANS sources (celles d'avant) retombe sur
  le live — comportement inchangé, donc zéro migration.
  LA GARDE QUI REND LA LISTE HONNÊTE : un test reconstruit les 4492 vues avec le
  glossaire RESTREINT aux 9 sections et exige l'égalité avec le glossaire complet.
  Le jour où la carte lira une dixième section, il tombe — au lieu de laisser
  passer des archives muettes. Avec sa CONTRE-ÉPREUVE : priver la vue du catalogue
  d'effets doit la changer, sinon la comparaison ne prouverait rien.
  TROUVÉ EN ÉCRIVANT CETTE CONTRE-ÉPREUVE : vider `effectByTooltip` seul ne change
  RIEN sur bien des boss — leurs réfs de tooltip SONT déjà des ids d'effets et
  `toChipEffect` retombe sur la résolution directe. L'index reste figé par
  prudence, mais il ne ferait pas une contre-épreuve honnête (noté dans le test).
  TROUVÉ AUSSI, par le bac à sable : un glossaire d'archive incomplet faisait
  PLANTER le rendu (la chaîne indexe `g.effectByTooltip[ref]` sans le tester).
  Normalisé à la frontière — index manquant = index vide. Un guide qui jette pour
  une section absente serait un très mauvais échange, une réf non résolue se voit
  déjà à l'écran.
  Bout en bout au disque (bac à sable `process.cwd()`) : une archive dont les
  sources nomment un statut que le glossaire courant ignore l'affiche quand même,
  et le live ne l'a pas. 1491 tests verts.

- **Épinglage des boss, étape 2c : `BossView` — la carte ne va plus rien chercher**
  `BossCard` mélangeait deux métiers : trouver la donnée (glossaire des effets,
  curation d'affichage, échelles de stats, donjons, quirks, passifs de palier) et
  la rendre. `buildBossView` prend le premier, et c'est une fonction PURE : tout
  vient de ses sources, rien du disque — donc la même carte se rend depuis le live
  ou depuis une archive, avec le MÊME code.
  CE QUI N'EST PAS DANS LA VUE, et pourquoi : les `spawns` d'une rencontre
  appartiennent au MODE, pas au boss (le guide dit contre quoi on se bat, la vue
  dit qui est le boss) — seules les rencontres PROPRES du monstre y sont, et
  `BossCard` les prend quand aucun mode ne lui en impose (ce que faisait
  `BossPanel`, qui n'est plus qu'un alias). Le chrome d'interface reste live : le
  figer casserait les traductions.
  BUG RÉEL CORRIGÉ AU PASSAGE : les donjons. `versionMonster` les fige depuis
  toujours « pour que l'archive reste lisible même si le donjon disparaît du
  live », et le rendu ne les avait jamais relus — un boss épinglé dont le donjon
  disparaissait (événement retiré, stage re-niveauté) perdait TOUS ses contextes
  de stats. `getBossView` lit maintenant ceux de l'archive.
  CODE MORT EMPORTÉ : `monsterSpawnContexts`, `rankOptionLabels`, `getStatScales`,
  `getBossQuirkMods`, `getRankOptions` n'avaient qu'un appelant — la carte — et
  lisaient le glossaire live, ce qu'un boss figé ne doit pas faire.
  PREUVE D'ÉQUIVALENCE avant de committer : la vue comparée au rendu d'origine,
  champ par champ (nom, vignette, stats, échelles, quirks, cartes de skills,
  statuts, immunités, spawns, libellés de palier) sur les 4492 monstres du
  catalogue — IDENTIQUES. Le test jetable qui l'a prouvé est parti avec l'ancien
  code qu'il comparait ; ce qui reste est un test de PROVENANCE (7 cas) : la vue
  sort de ses sources et de rien d'autre. Le cas central renomme un effet dans les
  sources et l'exige à l'écran — sans lui, une résolution qui court-circuiterait
  `src` passerait à l'œil et rendrait toute l'archive inutile.
  1488 tests verts.

- **Épinglage des boss, étape 2b : la résolution des kits devient PARAMÉTRABLE**
  (préalable à l'archive auto-suffisante — direction Sevih : « le versionnage
  sauvegarde tout ce dont l'affichage a besoin »).
  LE CONSTAT QUI L'A DÉCLENCHÉ : l'archive fige l'entité, ses skills et ses donjons,
  mais un skill ne stocke que des RÉFÉRENCES d'effets (`tooltip`, `label`, `type`) —
  nom, icône et description sont rejoués à l'affichage contre le glossaire COURANT.
  Un boss épinglé affichait donc les libellés d'aujourd'hui, et aurait perdu les
  chips dont la réf disparaît. Restaient live aussi : la curation d'affichage des
  kits, `statScales`, `bossQuirkMods`, `rankOptions` — et les DONJONS, alors que
  `versionMonster` les fige exprès depuis toujours en promettant « l'archive reste
  lisible même si le donjon disparaît du live ». Promesse écrite, jamais tenue.
  LE GESTE : `EffectSources` (glossaire + curation d'effets) et `KitSources`
  (glossaire + effets) passées en paramètre OPTIONNEL de toute la chaîne de
  résolution, défaut = le live. Aucun appelant à changer. `mergeStatusEffectsI18n`
  et `buildStatusMapI18n` résolvent SANS choisir de langue : un guide versionné se
  lit dans les cinq langues, pas seulement en anglais (arbitrage Sevih).
  POURQUOI PAS UN SECOND COMPOSANT, comme envisagé : `BossCard` fait 270 lignes et
  sert quatre modes de guide ; deux rendus censés être identiques divergent, et la
  divergence tombe sur les vieux guides, ceux que personne ne relit. On sépare
  RÉSOUDRE de RENDRE plutôt que de dupliquer.
  FILET, parce qu'il n'y en avait aucun : `skill-view.ts` (879 lignes, le code le
  plus subtil du rendu) n'a pas un seul test. Capture de référence des vues de kit,
  immunités et statuts des 4492 monstres du catalogue avant/après le geste :
  IDENTIQUES au hash près. 1481 tests verts.

- **Épinglage des boss, étape 2a : le PLAN de ré-épinglage (dry-run)** — `planRepin`
  dit ce que « Versionner » ferait aux guides, sans rien écrire. Inspectable avant
  de toucher 87 fichiers de contenu.
  INVENTAIRE DES RÉFÉRENCES, mesuré : `meta.bossId` 87 guides, `meta.group` 40,
  `meta.dungeons` 20, `meta.monsters` 2. Deux natures qui NE SE TRAITENT PAS
  PAREIL. Les références DIRECTES (`bossId`, `monsters`) nomment un monstre : on
  réécrit l'id en place, et ça marche déjà puisque l'étape 1 apprend à `getMonster`
  à résoudre `<id>@<n>`. Les références INDIRECTES (`group`, `dungeons`, les
  groupes des configs de version) désignent un COMBAT dont les monstres sont
  résolus au rendu depuis `encounters.json` : il n'y a aucun id à réécrire, donc le
  pin ne peut être qu'une liste à part QUE LE RENDU DOIT APPRENDRE À LIRE. Le plan
  les rapporte séparément plutôt que de faire semblant de les traiter.
  CE QUE LE DRY-RUN SUR DONNÉE RÉELLE A MONTRÉ : versionner le boss de
  `special-request/beatles` donne 1 édition applicable ; versionner celui de
  `world-boss/dahlia` en donne ZÉRO, et trois références en attente — ses trois
  versions pointent le MÊME groupe `world_boss:4086019`.
  CORRECTION DE LECTURE (Sevih, 11/08) : ce zéro n'est PAS un trou. Une nouvelle
  version de GUIDE ne veut pas dire une nouvelle version de BOSS — les world boss
  de Dahlia ont été rerun plusieurs fois avec le même boss et les mêmes skills,
  donc il n'y a rien à ré-épingler. Ce qui reste vrai : le jour où un boss de mode
  versionné change vraiment, la référence du guide est un GROUPE et non un id, donc
  le pin ne peut passer que par la liste `pinned` — que le rendu doit lire.
  SEPT CAS, ids DÉRIVÉS de la donnée committée et jamais écrits en dur — la leçon
  du comptage figé de `tags.test.ts`. Dont l'invariant « une référence déjà
  épinglée n'est pas re-planifiée », qui est ce qui fait tenir la règle
  « ré-épingler ce qui est encore en live » d'une version à la suivante.
  Trouvé au passage : `adventure/S1-8-5` porte le même id dans `bossId` ET dans
  `monsters` — deux éditions sur le MÊME fichier. L'application devra grouper par
  fichier, c'est verrouillé par un test. 1481 tests verts.

- **Épinglage des boss, étape 1/3 : le rendu sait enfin LIRE une version figée**
  (`TODO(guides)` de `version-monster.ts:16`, cadré avec Sevih).
  ÉTAT DES LIEUX avant de toucher quoi que ce soit : le côté écriture était
  complet depuis longtemps — `versionMonster` fige l'entité, ses skills, et même
  un snapshot des donjons de ses spawns. Mais `data/generated/monster-archive/`
  est VIDE : la fonctionnalité n'avait jamais servi. Et pour cause, RIEN ne savait
  relire ces fichiers. `getMonster` faisait un simple `MONSTERS()[id]` : épingler
  un guide sur `<id>@<n>` l'aurait fait JETER au rendu (`BossEncounters` et
  `AdventureSeasons` lèvent sur un monstre absent). La convention était pourtant
  à moitié posée — `seasonsForBoss` coupe déjà le suffixe pour la jointure saison.
  `getMonster` résout donc l'archive quand l'id porte un `@`. Posé DANS la
  fonction et pas chez les appelants : 31 sites d'appel, et un id vivant ne
  contient pas de `@` — leur comportement est strictement inchangé.
  `getMonsterSkills` prend désormais l'id, en paramètre REQUIS. C'est le piège de
  l'affaire : les ids de skills survivent à une refonte, seul leur CONTENU change.
  Un appelant qui l'oublierait afficherait les skills du NOUVEAU boss sous
  l'entité figée, sans le moindre signe. Le typage force à trancher (un seul
  appelant aujourd'hui, `BossPanel`, qui a le pin sous la main).
  Un pin sans archive LÈVE en nommant le fichier attendu, au lieu de rendre
  `undefined` — l'appelant dirait alors « absent de monsters.json », ce qui est
  faux et envoie chercher au mauvais endroit. Même esprit que `readCuratedJson`.
  SEPT CAS de test, lecture réelle au disque via un bac à sable `process.cwd()` :
  id vivant inchangé, id inconnu qui rend toujours `undefined`, monstre et skills
  archivés, coexistence des deux états, et le message du pin orphelin.
  Étapes 2 (ré-épinglage automatique) et 3 (la garde) dans TODO.md, avec les
  décisions d'architecture arbitrées pour ne pas les re-débattre. 1474 tests verts.

- **La transcendance ne se compte plus, elle se lit — une seule fois** (signalé
  Sevih 11/08 : « la tier list PvE filtre sur 3/4/5/6 mais portrait utilise les
  vrais step 4 5 6 7… »). Le sélecteur PvE offrait des COMPTES D'ÉTOILES là où le
  portrait n'a jamais connu que le palier (`TransStar`), et les deux ne coïncident
  plus au-delà de 4 : le palier 6 montre 5 étoiles, le 9 en montre 6. La pastille
  « 6★ » rendait donc des portraits à 5 étoiles. La donnée curée portait la même
  lecture humaine, sous un contrat qui disait pourtant déjà « transStar → tier ».
  Arbitrage Sevih : corriger la DONNÉE, pas l'habillage.
  - **Migration** de `rankByTranscend`/`roleByTranscend` (3★→3, 4★→4, 5★→6, 6★→9)
    — 15 champs sur 14 persos, 30 lignes de diff, aucun reformatage.
  - **Source unique.** Les colonnes `ShowUIStar`/`StarColor`/`StarPlus` étaient
    lues à deux endroits : `transcend.json` (extrait — slider de la fiche, damage
    calculator, sweetspots) et une transcription À LA MAIN de 27 lignes dans
    `Thumbnail`. Elles concordaient, rien ne les y obligeait. La copie est
    supprimée ; tout passe par [transcendence.ts](../src/lib/transcendence.ts),
    seul lecteur de l'extraction. Objection bundle levée par la mesure :
    `transcend.json` pèse **745 o gzippés** contre ~1 ko pour la table manuelle.
    La règle « quelle étoile prend la teinte » y vit aussi — elle était écrite
    quatre fois (vignette, portrait, canvas ×2).
  - **Filtre PvE** limité aux paliers PLEINS (3, 4, 6, 9 → 3★/4★/5★/6★, demande
    Sevih) : trois pastilles à cinq étoiles ne se distinguant qu'à la teinte ne
    font pas un filtre. Éditeur admin aligné. Résolution en ESCALIER (`atStep`) :
    la curation ne note que les paliers où le rang bascule, un cran non curé prend
    le cran curé juste en dessous — et non la base, qui est le 6★.
  - **Tier list PvP** : portraits au palier 9, comme son propre avertissement
    l'annonce (« assumes 6-star transcends ») — ils sortaient à la rareté, donc
    3 étoiles sous un texte qui en promet six. Filtre rareté masqué (88 persos
    tous 3★) ; la règle « un filtre à une seule valeur ne filtre rien » est posée
    dans `CharactersFiltersBar`, pas chez l'appelant.
  - **Deux bugs préexistants trouvés en chemin, sur les 34 persos 1★ et 2★** dont
    le jeu laisse les paliers « + » en JAUNE (le + existe, il ne se voit pas) :
    le libellé du slider se déduisait de la COULEUR et affichait « 4 | 4 | 5 | 5
    | 5 | 6 », trois crans homonymes ; et le Combat Power reconstruisait
    `showUIStar`/`starPlus` en PARSANT ce libellé (`parseInt` + `/\+/g`), d'où un
    CP sous-évalué de 120 aux paliers 4★+ et 5★+, de 240 au 5★++. Le libellé vient
    maintenant de `StarPlus`, et `TranscendLayer` porte les deux nombres : plus
    aucune grandeur de calcul ne transite par du texte d'affichage.
  - **PvP = base 3★** écrit sur le champ `rankPvp` du contrat : Snow (2700003) et
    Lisha (2700005), Core Fusion d'un 2★, n'ont pas de rang PvP et n'en auront
    jamais. Leur forme fusionnée porte `rarity: 3` comme les quatre autres — le
    trou ressemble à une curation manquante, il n'en est pas une.
  - 12 tests neufs
    ([transcend-step.test.ts](../src/components/tierlist/transcend-step.test.ts))
    gravent la confusion palier/étoiles, la règle du libellé, l'escalier, et
    interdisent le retour d'un compte d'étoiles dans le curé.

## 2026-08-10

- **Listings ASM régénérés à chaque patch** (constat Sevih 10/08 : ils ne
  l'étaient pas — outillage historique en RVA 1.4.9 figés ET gitignoré dans
  `.gamedata/apk/`). Nouveau [datagen/extract/disasm.py](../datagen/extract/disasm.py)
  COMMITTÉ : manifeste explicite des 88 listings résolus PAR NOM dans
  `script.json` (ordinal d'adresse pour les surcharges — `GetLostHPRateValue`,
  `GetBattleRandomRange`), même format/annotations que l'existant (cibles des
  `bl`, littéraux `adrp`+`ldr`) ; une méthode du manifeste absente du dump =
  échec bruyant listant les specs peut-être périmées. Branché en fin de
  `pnpm datagen:dump` + commande seule `pnpm datagen:disasm`.
  - **Le binaire aussi doit être frais** (constat Sevih 13/08). `datagen:dump`
    ré-extrait déjà la paire `.so`/metadata de l'APK **installé sur
    l'émulateur** : la source n'est pas figée de ce côté. Mais le repli de
    `find_lib()` ramassait n'importe quel `libil2cpp.so` traînant sous
    `.gamedata/apk/` — donc l'archive APKPure 1.4.9 du 22/06. Le run de
    « validation » du 10/08 est passé par là (le `.so` du dump n'a jamais
    existé sur le disque) : il comparait 1.4.9 à lui-même et ne prouvait rien.
    Pire, le repli pouvait apparier un binaire **périmé** à un `script.json`
    **frais** : adresses justes, octets faux, 88 listings crédibles et
    mensongers sans une erreur. Repli SUPPRIMÉ ; `dump.ts` écrit désormais
    `dumped/.dump-stamp.json` (sha256 du `.so` + de la metadata, `versionName`
    lu sur l'émulateur) et `disasm.py` refuse de désassembler si le sha256 du
    binaire n'est pas celui de l'empreinte.
  - **Sortie déplacée vers [docs/specs/damage-formula-asm/](specs/damage-formula-asm/)**,
    les 87 listings SUIVIS PAR GIT que la spec référence. L'ancienne sortie
    `.gamedata/apk/asm/` était gitignorée : « régénéré à chaque patch »
    n'atteignait jamais la copie durable, qui serait restée en 1.4.9 pour
    toujours. Le diff d'un patch montre maintenant ce que le jeu a bougé dans
    les formules ; chaque listing porte la version du jeu en tête. Un `.asm`
    présent en sortie mais hors manifeste est signalé (plus régénéré = spec
    qui se périme en silence).
  - Deux entrées du manifeste pointaient la **mauvaise surcharge** (ordinal 0) :
    `CItem_InitializeOptionData` tombait sur le thunk 1 argument (52 o. au lieu
    de 2784) et `CStatValue_SetBaseValue` sur la variante `(int)` courte
    (120 o. au lieu de 552). Corrigées en ordinal 1.
  - Le `✅` final plantait en `UnicodeEncodeError` dès que la sortie est
    redirigée (console cp1252) — **après** écriture des fichiers : un run
    réussi remontait en échec à `datagen:dump`. stdout/stderr forcés en UTF-8.
  - **Noms générés par le compilateur résolus par squelette.** Les itérateurs et
    fonctions locales portent un compteur interne (`<PvpAttackTeamPenaltyDmg>d__79`,
    `g__PlayDamage|79_1`) qui se renumérote à chaque recompilation de la classe
    — `79` en 1.4.9, `81` en 1.4.14. Le manifeste tombait donc en panne sur un
    simple recompile. Repli : si le nom exact manque, on cherche le nom dont les
    suites de chiffres coïncident, et on ne l'accepte QUE s'il est unique (sinon
    échec — mieux vaut rien que le mauvais listing). Renumérotation signalée.
  - **Validé pour de vrai sur 1.4.14** (13/08, émulateur lancé, jeu à jour —
    l'archive APKPure était 5 versions en retard). `pnpm datagen:dump` bout en
    bout : paire extraite de l'install, empreinte écrite (`versionName=1.4.14`,
    sha256), 88/88 listings régénérés. Le premier run a ÉCHOUÉ bruyamment sur
    les deux noms renumérotés — le garde-fou fait ce pour quoi il est là.
  - **Ce que le patch a bougé** (corps normalisés : RVA, pages `adrp` et slots de
    métadonnées neutralisés) : 72/88 inchangés, 12 à allocation de registres près,
    3 vrais changements de comportement — `CalcDamage` gagne un garde
    `IsIgnoreTurnLimitDamage`, `FindBuffDamageReduce` gagne 492 octets (boucle de
    buffs en plus + 2 lectures `GetGameConfig`), `CBuff_OnCreate` gagne
    `TrySetDieByReverseHeal`. Consignés en [spec § 12.16](specs/damage-formula.md)
    avec les sections rendues incomplètes ; en-tête de la spec corrigé
    (1.4.9 → 1.4.14, `TypeDefIndex` 7258 → 7282).

- **Spec damage remise à 1.4.14** (suite du point ci-dessus, même journée).
  Documentaire uniquement : **aucun fichier de code touché**, le moteur TS
  n'implémente toujours pas les trois écarts.
  - Les 3 changements de comportement sont désassemblés et rédigés. **§ 8.5**
    `CFormula.IsIgnoreTurnLimitDamage` : pendant l'attaque spéciale d'un world
    boss, un attaquant **sans UID** échappe à la limite de dégâts par tour (en
    1.4.9 seul `IsUseWorldBossFinishAttack` ouvrait ce chemin). **§ 9.2** : la
    réduction de dégâts gagne une boucle `FindBuffByType(BT 62 BT_DOT_PUNISH)`
    et lit `GameConfig.PUNISH_DMG_REDUCE_VALUE` (`GAME_CONFIG` 215 = **300**) —
    porter un DOT « punish » ouvre une réduction paramétrée serveur. **§ 14.5** :
    `BT_REVERSE_HEAL_BASED_{CASTER,TARGET}_ABLE_KILL` (18/19) + `TrySetDieByReverseHeal`
    — ce reverse heal tue PARTOUT, sans la condition de scène, seul `IsNotDie`
    protège ; si le mort est un boss ennemi, `CTeam.BossKill` est comptabilisé.
  - **`BUFF_TYPE` a été RENUMÉROTÉ** — trouvaille de la re-dérivation, pas de la
    comparaison de listings. L'insertion des deux `_ABLE_KILL` décale tout ce qui
    suit : cap reverse heal 18 → 20, shields 19/20 → 21/22, `DMG_REDUCE` 110 → 115,
    `STEALTHED` 149 → 154, `IMMEDIATELY_*` 60–65 → 63–69… Les **29 identifiants**
    cités dans la spec ont été réécrits en résolvant chaque NOM dans l'énumération
    1.4.14. Le moteur et les tables ne sont pas affectés : ils clés sur le nom
    (`Type: 'BT_DMG_REDUCE'`), jamais sur l'entier — vérifié.
  - **44 RVA** réécrites de même (par nom, avec désambiguïsation des homonymes :
    `CalcStat` existe sur `CFormula` ET `CCharacterData`, `SetBaseValue` sur
    `CStatValue` ET `CCustomBossStatValue`). Balayage final : plus une seule
    adresse du document absente de la table des méthodes 1.4.14.
  - 3 listings ajoutés au manifeste (`CFormula_IsIgnoreTurnLimitDamage`,
    `CBuff_TrySetDieByReverseHeal`, `CCharacterBattle_FindBuffByType`) → 91.
  - **Le dump suit désormais le patch tout seul** (question Sevih 13/08 : « les
    asm et l'apk sont bien regénérés auto à chaque patch ? » — non, ils ne
    l'étaient pas : `refresh.ts` enchaînait pull → extract → convert → build →
    promote, sans jamais `dump` ni `disasm`, et rien ne signalait qu'un patch
    avait changé le CODE). `refresh.ts` compare maintenant la version installée
    sur l'émulateur à celle gravée dans l'empreinte du dernier dump et lance
    `dump` (qui enchaîne `disasm`) avant la génération. Décision isolée en
    fonction pure `dumpDecision` (comme `regenDecision`), 6 tests : même version
    = rien, versions différentes = dump dans les deux sens, et surtout empreinte
    absente / adb muet / `inconnue` ne déclenchent JAMAIS un dump de plusieurs
    minutes sur une non-preuve. `versionName` factorisé dans `adb.ts`.
  - **Second signal : la metadata tirée** (constat en lisant un `pnpm dev` de
    Sevih, 13/08 — la ligne `✓ il2cpp : à jour (5 fichiers, md5)`). Le jeu garde
    son `global-metadata.dat` dans son dossier `files/`, que le pull suit déjà au
    md5 : elle peut donc être remplacée SANS réinstaller l'APK, et un correctif
    sans bump de `versionName` passerait sous le radar du signal 1. `dumpDecision`
    compare aussi son sha256 à celui de l'empreinte (la version prime quand les
    deux ont bougé). Vérifié le 13/08 : la copie `files/` et celle de l'APK sont
    **identiques au sha256** — le dump s'appuie bien sur la metadata que le jeu
    exécute ; ce second signal est un filet, pas le cas courant.
  - Restent ouverts en § 12.16, à ne pas combler au jugé : la place exacte des
    300 ‰ dans l'agrégation § 9.2, la quantité accumulée dans
    `CSkillRecord.CurrentSkillFactor` (§ 8.5), et le slot virtuel 0x198 de la mise
    à mort (§ 14.5). Deux commentaires du moteur portent d'anciens numéros BT et
    sont signalés, volontairement non corrigés (passe documentaire).

- **Mécaniques perso : conditions d'ÉTAT DE COMBAT déclarables** (demande
  Sevih 10/08 — « Noa a un délire de stack sur son S3 »). Générique, pas un
  cas Noa : les passifs kit/EE/quirks gatés par une condition d'état
  (`STATE_CONDITIONS` de gear.ts — `OWNER_RESOURCE`, `OWNER/TARGET_HAS_BUFF`
  ×172, `OWNER_ALONE`, seuils de PV…, `CheckAvailable` § 12.1 non désassemblé)
  sortent en entrées `stateful`, INACTIVES par défaut, activées seulement si
  le scénario déclare la condition remplie — nouveau champ z `cs` (buffIds).
  Coches PUBLIQUES dans le panneau Contexte (« Mécaniques du kit », demande
  Sevih : un bouton pour l'utilisateur pas dev) : le libellé est le NOM DU JEU
  de la source (skill du kit via le slot lanceur, EE, nœud d'éveil — jamais de
  texte écrit main ; l'habillage passe par les locales en/fr/jp/kr/zh, repli
  buffId brut si la source ne se résout pas). La coche voyage dans z, donc
  dans les captures/fixtures. Prouvé par test (le 3 % PV
  du S3 de Noa déclaré rempli ajoute exactement 356 ‰) puis VALIDÉ EN JEU le
  jour même : capture S3 crit à 5 Kaizer Energy vs Unidentified Chimera
  (cible ET build différents des autres fixtures — niveau 100, stats réelles
  avec pierce), perfect match à la première capture → fixture dorée
  [noa-chimera.json](../src/lib/damage/fixtures/noa-chimera.json).

- **Table Scénarios du harnais : le plus récent en haut** — tri d'affichage
  par `savedAt` décroissant (un re-save remonte sa ligne), le stockage garde
  l'ordre d'ajout.

- **Buffs restreints par slot BRANCHÉS — les 4 captures Noa vs Rhona rejouent
  à Δ 0 exact** (elles divergeaient de 13-24 %). Diagnostic aux traces § 7.6 :
  l'écart était un taux additif constant par slot, identique normal/crit —
  S2 +356 ‰ = `trunc(11876 × 30/1000)` (buff `2000022_2_2`, 3 % des PV max de
  la CIBLE, `CallerSkillType SKT_SECOND`) ; S3 +450 ‰ = 150 × 3 (EE +0
  `BID_CEQUIP_2000022`, `BT_DMG_ENEMY_TEAM_DECREASE`, `SKT_ULTIMATE`). Branché :
  - **gear.ts** : un buff à `CallerSkillType` recoupant les lignes du rapport
    devient une entrée PORTANT ses lanceurs (`callers`) au lieu d'un
    « non branché » ; les familles à canal de stat gatées restent signalées
    (stats de combat globales) ; `TargetSkillType` reste signalé (gate de
    mécanique, pas de lanceur).
  - **kit** : `resolveKitPassives` collecte aussi les `buffIds` des skills
    ACTIFS (S1/S2/S3/bursts) au NIVEAU SAISI (z `k`) — c'est là que vivent les
    passifs permanents gatés comme le +3 % PV cible de Noa ; conditions à état
    (`OWNER_RESOURCE` = 5 Kaizer Energy) signalées, jamais devinées.
  - **inputs.ts** : `buildSkillReport` reçoit par slot les buffs gatés dont le
    lanceur matche (`sk.type`, bursts compris) ; `additionalContext` gagne
    `defenderStat` (famille TARGET_STAT § 9.1 — lisait 0 faute de lecteur) ;
    `decreaseTargetCount = 4 − cibles touchées` (z `n` branché de bout en bout,
    la référence 4 est PROUVÉE par la fixture — spec formule § 7 mise à jour).
  - Fixture [noa-rhona.json](../src/lib/damage/fixtures/noa-rhona.json)
    committée en dorée (Δ 0 aux 4 lignes) — elle prouve aussi le décompte § 7
    et la sélection de niveau des buffs de skill (paliers 1/3/5).
- **Miroir fichier des scénarios du harnais en dev** (demande Sevih 10/08) :
  la liste localStorage s'écrit en write-through vers
  `.dev/damage-scenarios.json` (gitignoré) via la route dev
  `/api/dev/damage-scenarios` — un agent lit les captures sans copier-coller ;
  seule la CAPTURE est stockée (z + en jeu + réglages de compte), calculé et Δ
  se rejouent. Gaté sur l'hydratation (jamais d'écrasement par le fallback).
- **Chargement des tables damage quand le harnais a des scénarios sauvés** :
  l'import dynamique ne partait qu'à la sélection d'un attaquant — arrivé sur
  la page avec des scénarios en localStorage, la table restait sans Calculé/Δ.
  Le déclencheur couvre maintenant `devMode && savedScns.length` (les deux
  arrivent après montage → dépendances de l'effet).

## 2026-08-09

- **Audit damage du 07/08 : D1, D2, D3, D5 traités** (D4 — le découpage du
  browser 4 000+ lignes — reste la condition de sortie du chantier, après
  stabilisation du moteur). D1 : `stat-compose.calcFinalStat` ne remodélise
  plus la formule — adaptateur qui délègue à `damage/formula.calcFinalStat`
  (BigInt, couches absentes à 0, entrées tronquées en garde-fou : BigInt
  jette sur une fraction et les entrées de la fiche sont entières par
  contrat) ; la fiche perso est désormais couverte par le test de propriété
  du moteur, plus de divergence possible. D2 : `DebugHarness` en
  `next/dynamic` — le harnais opt-in (~700 l.) sort du bundle initial de la
  page. D3 : les quatre gros JSON du wrapper (skills, monster-skills,
  damage/targets, damage/buffs — ~23 Mo) passent par `loadDataJson` (cache
  mtime) au lieu d'imports statiques : plus de recompilation Turbopack à
  chaque « Enregistrer » de l'admin. D5 : `preset-target.ts` lit
  `encounters.json` au disque comme le reste du module — une seule voie de
  chargement. Statuts consignés dans [audit/damage-calculator.md](./audit/damage-calculator.md).

## 2026-08-08

- **Le mismatch d'hydratation du tier list maker venait de FIREFOX, pas du code**
  (signalé par Sevih, extensions déjà écartées). Serveur et client calculaient la
  MÊME chose — le HTML servi portait bien `disabled=""` sur les cinq boutons
  « vider la ligne », et `tier.items.length === 0` vaut `true` des deux côtés au
  premier rendu. Ce que React signalait, c'est que l'attribut avait DISPARU du DOM
  avant l'hydratation : au rechargement (F5), Firefox restaure l'état des contrôles
  de formulaire, donc les boutons que le JS avait activés après coup — les lignes
  remplies par le `?z=` de l'URL — revenaient activés avant que React ne prenne la
  main. Le lien du rapport le prouve : son payload décode en `counts [1,0,1,0,0]`,
  et le diff ne portait que sur `t0` et `t2`.
  - `RowBtn` s'inactive maintenant par `aria-disabled`, jamais par l'attribut
    `disabled` : Firefox n'a plus rien à restaurer, et le bouton reste au parcours
    clavier (ce que `disabled` lui retire sans l'annoncer). La garde passe dans le
    `onClick`, le `stopPropagation` restant INCONDITIONNEL — un bouton `disabled`
    n'émettait pas de clic du tout ; sans ça, le clic retomberait maintenant sur le
    `onClick` de la ligne et y placerait l'item sélectionné.
  - Les cinq boutons de ligne sont couverts, pas seulement « vider » : un lien
    partagé dont le nombre de lignes diffère du défaut décale aussi les boutons
    monter/descendre inactifs. HTML servi vérifié après coup — 0 `disabled`, 25
    `aria-disabled` (5 lignes × 5 boutons).
  - Les autres outils à état client ne sont PAS exposés, mesuré sur le HTML servi :
    0 occurrence de `disabled` au SSR pour le progress tracker (garde `!ready`
    explicite), le damage calculator et le team planner (état vide au SSR, `?z=`
    décodé dans un effet). Firefox ne restaure que ce qu'il a parsé ; ce que React
    crée ensuite lui échappe. Le tier list maker était le seul à peindre son
    éditeur complet côté serveur.
  - **Le piège à retenir** n'est donc pas `disabled` : c'est un contrôle de
    formulaire PRÉSENT dans le HTML SSR dont `disabled`/`checked`/`value` bascule
    après restauration client. Les cases à cocher y sont plus exposées encore
    (`checked` est ce que Firefox restaure le plus volontiers) ; aucune n'est
    rendue au SSR aujourd'hui.

- **Les paliers d'amélioration sont du TEXTE DE JEU, comme les descs** (constat
  Sevih). `EnhancementList` les rendait en texte brut (`upgrades.join(', ')`) :
  la balise de couleur et le `\n` littéral s'affichaient tels quels. Trois
  upgrades sont concernées dans `data/generated/skills.json` — dont
  `increases <color=#28d9ed>You're Fired!</color> damage by +20%` — et rien ne
  garantit qu'il n'en arrivera pas d'autres : ces chaînes sortent des mêmes
  tables que les descs, elles portent donc le même balisage. Elles passent
  maintenant par `renderGameColors`, le span étant en `whitespace-pre-line` ; le
  séparateur `, ` entre upgrades d'un même palier est conservé. `ChainDualSection`
  en bénéficie, il partage le composant.
  - Le `\n` littéral → vrai saut de ligne était déjà écrit deux fois (`GameText`,
    `SkillDescription`) ; en faire une troisième copie aurait figé la convention
    à trois endroits. Extrait en `gameLineBreaks` (`components/ui/GameText`),
    les trois appelants s'en servent.
  - **Non fait, assumé** : les upgrades ne rendent pas les icônes inline
    d'élément/classe (`renderGameText`) — `EnhancementList` ne reçoit pas de
    `lang`. Aucune upgrade actuelle ne mentionne d'élément ni de classe, donc
    l'affichage est identique ; à faire descendre le jour où c'est le cas.

- **Les postes d'équipe cessent de se traverser — et `/dev/carousel` pour le voir.**
  Le carrousel est le seul endroit du site où une carte est TOURNÉE : ses voisines
  se projettent hors de la scène, et l'écart du conteneur essayait de couvrir ce
  débordement à l'aveugle. Il grandissait avec l'ÉCRAN (48 → 64 → 96 px) quand le
  débordement dépend du NOMBRE D'OPTIONS — deux quantités sur deux axes qui ne se
  croisent jamais : suffisant au-dessus de 1024, jamais en dessous, et les roues
  voisines s'y traversaient.
  - **Le débordement se CALCULE** (`sideOverflow`) à partir du transform lui-même :
    `x₃ = x₀·cos θ + r·sin θ`, `z₃ = r·cos θ − x₀·sin θ − r`, puis la perspective.
    Ma première version était FAUSSE — elle réduisait la carte à son centre avec une
    seule échelle. C'est la question de Sevih (« il est calculé comment ? ») qui l'a
    sortie : une carte tournée n'est pas plate face à l'œil, ses deux arêtes
    verticales sont à des profondeurs différentes donc à des échelles différentes.
    L'erreur allait dans les DEUX sens — 12 px réservés pour 35 nécessaires à quatre
    options et 152 px de carte, ce qui ramenait le chevauchement sur le cas le plus
    fréquent des guides ; 73 pour 49 réels à huit options.
  - Le résultat reste contre-intuitif, et c'est pourquoi le calcul vit dans le
    composant plutôt qu'en écart choisi à l'œil : le débordement NE DÉPEND PRESQUE
    PAS de la taille de la carte (35 à 43 px de quatre à six options, sur les quatre
    paliers) — la perspective étant fixe, une carte plus grande tourne sur un rayon
    plus grand mais recule d'autant.
  - **La réserve est une propriété de la RANGÉE, pas du poste** (constat Sevih,
    capture d'une équipe 2/2/6/2) : chacun réservant la sienne, le poste fourni
    écartait ses voisins de lui seul et les quatre cartes cessaient d'être
    régulièrement espacées. `TeamSlots` calcule le maximum une fois et le passe à
    tous (`rowOptions`). Le poste à une SEULE option — qui ne rend pas de cylindre —
    porte désormais le `ref` et la réserve : faute de mesure il ne réservait rien et
    décalait la rangée à lui seul.
  - **Plancher à une équipe pleine**, quatre options (décision Sevih : « 1 affichée +
    3 en réserve »). En dessous la géométrie ne déborde presque plus — 0 px à deux
    options — et les cartes se colleraient bord à bord. Effet secondaire meilleur que
    le correctif lui-même : toutes les rangées peu fournies partagent la même
    réserve, donc les équipes d'un guide restent alignées ENTRE ELLES, pas seulement
    à l'intérieur d'une rangée.
  - **Plus d'écart horizontal dans le conteneur** (`gap-x-0 gap-y-6`) : deux emprises
    accolées ne se touchent déjà pas, en rajouter délaverait la rangée. Le vertical
    reste — la réserve est latérale, elle ne dit rien de deux rangées enroulées.
  - **Aucun réalignement au chargement** (constat Sevih : « y'a comme un flash »).
    DEUX causes distinctes. La réserve dépendait de la mesure, donc n'existait pas au
    rendu serveur : elle se calcule maintenant sur le pire des quatre paliers
    (`CARD_PX`, exportée à côté de `CARD_WIDTH` — une classe Tailwind ne se dérive
    pas d'un nombre, les deux formes restent littérales et côte à côte), soit 2 à 4 px
    d'approximation contre une valeur disponible au PREMIER rendu. Et le cylindre
    était rendu d'emblée avec un rayon de 0 — cartes empilées au centre à pleine
    taille — puis le `transition-transform` ouvrait la roue en 300 ms à chaque
    chargement ; il n'est plus MONTÉ tant que la scène n'est pas mesurée, le masquer
    ne suffisait pas (une transition court aussi sur un élément qu'on vient de rendre
    visible).
  - **`/dev/carousel`** : quatre iframes aux largeurs des quatre paliers. Une page ne
    peut pas montrer quatre viewports à la fois, et une prop de contournement
    finirait par diverger de la prod — là, c'est le vrai composant dans le vrai
    chemin de code. La rangée y est HÉTÉROGÈNE (`[max, 1, moitié, max]`) : quatre
    postes égaux ne montreraient jamais le défaut d'alignement. La bascule
    avant/après rétablit AUSSI les anciens écarts du conteneur — comparer sans cela
    truquerait la démonstration en faveur du correctif.

- **Les cartes du site BRANCHÉES sur le portrait, et une seule table de tailles.**
  Le lot précédent livrait la transcription sans la raccorder ; celui-ci raccorde
  les cinq appelants DOM (liste des persos, tier lists, bannières d'accueil,
  équipes de guide, admin) et supprime tout ce qui doublonnait au passage. Le
  tier-list-maker (mode « cards » + son jumeau canvas pour l'export PNG) reste
  explicitement pour un autre lot.
  - **Trois composants pour une carte, il en reste un.**
    `ResponsiveCharacterCard` SUPPRIMÉ : il n'existait que pour choisir une
    taille au `useMediaQuery`, donc côté client, avec le décalage d'hydratation
    que ça suppose — des classes Tailwind responsives font la même chose en CSS,
    dans un composant serveur. `CharacterCard` réécrit en coquille au-dessus de
    `Portrait` (256 → 180 lignes) : il ne pose plus une seule mesure de portrait,
    seulement ce que le prefab n'a pas (lien, badge de recrutement, nom sous la
    carte, étiquette a11y de la rareté).
  - **UN NOM A TROIS FORMES, et la lib n'en exposait que deux** (constat Sevih,
    capture à l'appui : « les titres sont dupliqués » — « Core Fusion » puis
    « Core Fusion Epsilon » l'un sous l'autre). Le portrait du jeu écrit le titre
    et le nom dans DEUX champs séparés (`Text_Demi`, `Text_Name`), il lui faut
    donc le nom NU — que personne n'avait jamais eu à produire, le site écrivant
    toujours le nom d'un bloc. Ma première correction le retrouvait en retirant
    le préfixe au `replace` ; Sevih l'a refusée à raison (« plutôt que de faire
    un traitement bizarre, il faudrait pas plutôt corriger l'extraction /
    génération ? »). D'où `characterBaseName` + `joinDisplayName`, avec
    `characterDisplayName` REDÉFINIE par-dessus les deux : la composition n'existe
    plus qu'à un seul endroit. C'est le nom nu qui circule dans les rangées
    d'affichage, le complet qui se reconstruit là où il sert (tri, JSON-LD,
    `title`) — composer est sûr, décomposer ne l'est pas.
  - **Le barème : 80 / 104 / 128 / 152 px** à base / 640 / 1024 / 1440, soit 44 à
    84 % du prefab là où le site servait 66 / 100 / 120 (37 à 67 %) — c'était la
    cause de fond du problème de lisibilité. Le nom passe DANS le cadre à partir
    de 128, la largeur à laquelle son corps rendu atteint 12 px (le plus petit du
    site) : c'est le SEUL nombre du lot qui ne vienne pas du jeu, et il vit dans
    la table `SCALE`, pas dans `Portrait`. Largeur et placement du nom y sont
    solidaires par construction. 1440 n'est pas un breakpoint Tailwind (les
    défauts sautent de 1280 à 1536) et n'a pas à le devenir pour un seul usage :
    variante arbitraire, thème intact pour les ~440 autres usages.
  - **Le repli sur le nom court NE SE DÉCLENCHAIT JAMAIS.** Il jugeait sur 128 px
    (104 + 24 hérités de `CharacterPortrait`, qui laisse son libellé déborder sa
    vignette — pas la carte, qui le rend en `w-full`) un texte rendu sur 80. La
    condition était donc toujours vraie et 16 couples (perso, langue) se faisaient
    tronquer en silence par le `line-clamp-2`. Il mesure désormais au PLUS ÉTROIT
    des paliers où le libellé s'affiche : ce qui tient en 80 tient a fortiori en
    104, l'inverse est faux. `card-label.test.ts` grave l'invariant — 124 persos ×
    5 langues, chacun doit tenir sur deux lignes en 80 px, au besoin via son nom
    court. Si un perso arrive avec un nom long, c'est le test qui le dit, plus le
    rendu.
  - **`short-names.json` localisé** (demande Sevih : « un fallback anglais sur les
    shortname ça fait bizarre »). Les entrées n'avaient qu'une clé `en`, servie
    telle quelle aux lecteurs jp/kr/zh par le repli de `lRec` — trois cellules
    l'affichaient réellement. Clés `jp`/`kr`/`zh` ajoutées aux dix entrées,
    dérivées du TITRE LOCALISÉ : le jeu n'a pas d'abréviations, il n'y avait rien
    à relever dans le binaire, et un natif peut légitimement corriger ligne à
    ligne. Chaque langue suit SON titre plutôt que la traduction de l'anglais —
    « Summer Knight's Dream » est 青雲の志 en jp, « l'ambition des nuages d'azur »,
    sans rapport avec l'été. Nouvelle entrée `MR.Skadi` (seule Skadi débordait en
    jp, 14 caractères pleine chasse). `CF. Epsilon` → `CF Epsilon` (constat
    Sevih : seule des trois core-fusion à porter un point). Convention EN
    confirmée par Sevih et laissée telle quelle : le préfixe marque la SAISON pour
    les `seasonal` (d'où deux `S.`, Regina et Ember étant toutes deux estivales),
    le titre sinon.
  - **`TeamSlotCarousel` MESURE la carte au lieu d'en recopier les cotes.** Il
    portait trois gabarits (66×128, 100×192, 120×231) sous un commentaire qui
    jurait qu'ils venaient « telles quelles de `CharacterCard` » : vrai le jour où
    ils ont été écrits, faux depuis deux refontes de la carte. La scène chaussait
    encore du 66 de large pour une carte de 104, et les cartes débordaient leur
    cylindre par le bas jusqu'à 105 px — droit sur les flèches et les points de
    navigation. Elle prend maintenant sa LARGEUR des classes exportées
    (`CARD_WIDTH`) et sa HAUTEUR d'un vrai exemplaire de carte laissé dans le
    flux ; plus aucun nombre à tenir à jour, et la hauteur suit toute seule les
    34 px du nom tant qu'il n'est pas passé dans le cadre. Le `ResizeObserver` ne
    sert plus qu'au rayon et à la conversion « pixels glissés → degrés », les deux
    seules choses qui ne s'expriment pas en CSS — dernier `useMediaQuery` de la
    chaîne retiré. Bonus : ce gabarit EST le rendu serveur, là où le cylindre
    était inerte sans JS.
  - **Le palier de transcendance passe enfin par sa vraie prop.**
    `TierListBrowser` le passait À LA PLACE de la rareté pour obtenir le bon
    nombre d'étoiles : ça marchait par accident et perdait la teinte du « + ».
  - **`/dev/portrait`** montre les quatre paliers du barème plus la taille du
    prefab, chacun rendu COMME L'APPELANT doit le rendre (nom dedans ou dessous,
    repli sur le nom court compris) — la page ne rejoue plus la règle de travers.

- **Le PORTRAIT du jeu transcrit (`Portrait`), et la page `/dev/portrait`.** Le
  grand format vertical (180×344). Rien n'est branché dans ce lot : on livre la
  transcription et son rendu de contrôle, le raccordement des appelants se
  décidera après vue.
  - **DEUX habillages, un seul composant**, parce que le jeu fait exactement ça :
    deux nœuds portent le même MonoBehaviour `CUICharacterThumbnail` en 180×344.
    `mainPage` (`CharacterThumbnailList`, dans `CUICharacterMainPageScrollCell`) —
    la carte de la page « personnages », de l'archive et de la transcendance,
    c'est CELLE que les grilles du site imitent, et c'est le défaut ; `long`
    (`CUICharacterLongThumbnail`) — pvploading, synchro, infiltrate, recruit.
    Trouvés en balayant les 578 bundles `prefabs/ui` à la recherche d'un cadre de
    cette taille. Le rail d'étoiles, l'élément, la classe, le voile et l'ancrage
    du niveau y sont RIGOUREUSEMENT identiques : la table `SKIN` ne porte que la
    boîte du nom (150 contre 100), la teinte des étoiles, et les deux badges que
    `long` n'a pas.
  - **La boîte du nom décide de sa TAILLE** (constat Sevih sur le jeu : le nom est
    plus gros que son titre, aucun des deux tronqué). Comme `m_BestFit` réduit le
    corps jusqu'à ce que le texte tienne, la largeur de la boîte décide du corps
    rendu : sur « Tamamo-no-Mae » et « Kitsune of Eternity », une boîte de 150
    descend le nom à 16,9 pendant que le titre reste plafonné à son maximum de 14 —
    l'écart se lit ; à 100 ils tombent à 11,3 et 10,6, c'est-à-dire au même corps.
    La variante `cuirecruit` (170) a été essayée et écartée : elle déplaçait aussi
    l'origine (5 au lieu de 20 du bord) et sortait le texte du cadre.
  - **L'alignement VERTICAL du titre diffère entre les deux habillages**, et c'est
    la seule valeur de typographie qu'ils n'écrivent pas pareil : `m_Alignment`
    vaut `MiddleLeft` (3) en `mainPage` contre `LowerLeft` (6) en `long`. Le
    composant appliquait `LowerLeft` aux deux, ce qui descendait le titre de
    8 unités en `mainPage` et le collait au nom (remarque Sevih : « le titre a
    l'air d'être un peu plus haut en vrai »). Corrigé, et le témoin PIL montre le
    décalage de 8 unités exactement.
  - **Les DEUX polices du jeu, résolues et embarquées.** Sevih avait vu à l'œil que
    « titre et nom n'ont pas l'air d'être régis par les mêmes règles de style » ;
    les `m_Font` le confirmaient sans les nommer, et le bundle `font2` manquait sur
    le disque. Sevih l'a extrait : `Text_Name` (et les deux textes du niveau)
    prennent l'asset `NotoSans_Bold`, `Text_Demi` l'asset `NotoSans_Regular`.
    **L'ÉTIQUETTE UNITY MENT**, et c'est le script d'extraction qui l'a montré :
    leur table `name` dit **SUIT ExtraBold** (usWeightClass 800) et **SUIT Bold**
    (700), une famille coréenne de Sunn sous licence libre. Ni des Noto, ni les
    graisses annoncées — une seule graisse d'écart, ce qui explique que le titre
    reste franchement gras en jeu. Les fichiers de `src/fonts/` portent donc le
    VRAI nom (196 et 194 Ko), et le lien avec l'asset se lit dans le script, pas
    dans un nom de fichier faux. Déclarées dans `root-document` en
    `preload: false` : la `@font-face` existe partout, mais rien ne se télécharge
    tant qu'aucun portrait n'est peint. Elles ne couvrent que latin + hangûl
    (11 435 glyphes) : sur `jp` et `zh`, le jeu retombe lui aussi ailleurs.
  - **Le crénage est DÉSACTIVÉ, et c'est fidèle** : les deux polices ont un `GPOS`
    avec du crénage que le navigateur applique par défaut, mais le `Text`
    historique d'Unity empile les chasses sans moteur de composition (c'est
    TextMeshPro qui a introduit le crénage). `fontKerning: 'none'` colle donc au
    jeu — et rend exacte la somme sur laquelle `m_BestFit` s'appuie.
  - **Les deux badges d'état partagent UN emplacement** (constat Sevih : un
    core-fusion ne peut pas être synchronisé). Le prefab les pose pourtant à deux
    hauteurs, et c'est un leurre : leur parent `Sync_Core` (34×74) porte un
    `VerticalLayoutGroup` en `m_ChildAlignment = 7` (LowerCenter), qui replace au
    runtime l'enfant ACTIF — les `m_AnchoredPosition` écrits sont de l'état
    d'éditeur, celle de `Core` tombant même hors du conteneur. L'unique badge est
    donc calé en bas des 74, à `top` 191.
  - **Les sprites de classe se demandent au SLUG DU SITE**, pas à l'énum du jeu :
    le datagen publie `CT_Class_Attacker` sous la clé `CT_Class_Striker` et
    `CT_Class_Priest` sous `CT_Class_Healer`. Traduire vers l'énum donnait deux 404
    (remarque Sevih) ; c'est `img.boss(\`CT_Class_${cap(slug)}\`)` qu'il faut,
    exactement comme la vignette carrée le fait déjà.
  - **Le nœud identifié, avec sa preuve.** `CUIFaceIcon.m_LongThumbnail` (7ᵉ
    champ `GameObject`, aligné sur `FACE_TYPE.LONGTHUMBNAIL = 6`) pointe le
    GameObject **`MainThumbnail`** — vérifié en suivant le `m_PathID` du champ,
    pas le nom, sur **les 255 prefabs `FI_` qui le renseignent, sans exception**
    (les 478 autres l'ont à `path_id = 0`). Mais `MainThumbnail` ne porte AUCUNE
    chrome : juste un masque de 180×344 et un `Character` à (0,0), taille égale.
    La chrome vit ailleurs, dans **`CUICharacterLongThumbnail`** — trouvé en
    balayant les 578 bundles `prefabs/ui` à la recherche d'un cadre de 180×344.
    Il porte le MonoBehaviour **`CUICharacterThumbnail`**, la MÊME classe que les
    deux vignettes carrées, qui expose un `SetLongData` en propre.
  - **Les 478 sans portrait long sont des MONSTRES** (ids `4xxxxxx`), plus quatre
    cas isolés. Les **124 personnages du site ont TOUS leur `MainThumbnail`** :
    la page n'a aucun trou à signaler côté persos.
  - **Le sens de remplissage des étoiles ne se lit pas dans le prefab** — il a
    fallu désassembler `libil2cpp.so`. `CUtilUI.SetStarImage` (la même fonction
    que la vignette carrée, d'où la table `TRANSCENDENCE` réutilisée et non
    recopiée) éteint tout le tableau, puis allume `m_StarImage[0..ShowUIStar-1]`
    par indexation DIRECTE et colore `m_StarImage[ShowUIStar-1]`. Or le prefab
    câble ce tableau `[Star5 … Star0]`, index 0 en HAUT : les étoiles gagnées
    occupent donc le haut du rail, et la teinte du « + » va à la plus BASSE des
    allumées. Validé au compositeur PIL sur les sept paliers d'un 3★.
  - **Quatre pièges tranchés par la donnée.** Le masque `CT_Mask_Thumbnail` est
    en 9-slice border 28 — de quoi croire à des coins arrondis — mais son alpha
    est à 255 partout, coins compris : il n'écrête rien, donc pas de
    `border-radius`. `Dim` est `m_DimImage` (aplat noir, `SetDim`), pas un
    vignetage : le prefab le laisse actif en éditeur, le rendre par défaut
    noircirait tout. `LowBg` (le dégradé sous le nom) est INACTIF dans les onze
    copies. Et **tous** les champs de badge du MonoBehaviour sont NULL, y compris
    `m_BGObjects` — le portrait ne porte aucune pastille, et son fond est cuit
    dans le PNG.
  - **Deux sprites au manifeste** : `CM_icon_star_B` (l'étoile en creux du rail,
    et non `_w`) et `CM_Character_Thumbnail_Dim`. Élément, classe et slot
    d'étoiles réutilisent les sprites déjà collectés.
  - **La page liste les 9 ÉCARTS que le site porte aujourd'hui** : `CharacterCard`
    et le mode « cartes » du tier-list-maker rendent déjà `img.portrait(id)` avec
    leur chrome à l'estime, et des nombres différents l'un de l'autre — ratio
    faux (0,516/0,521/0,519 contre 0,5233) avec `object-cover` qui rogne l'art,
    dégradé du bas inventé, étoiles comptées sur la rareté au lieu de
    `ShowUIStar`, badge de recrutement que le jeu ne pose pas. Plus un TROISIÈME
    rendu, le jumeau canvas de l'export PNG.
  - **`m_BestFit` porté, pas éludé** (remarque Sevih : ça débordait dès qu'un nom
    était long ou accompagné d'un titre). Les quatre textes l'ont actif ; le corps
    est donc réduit jusqu'à `m_MinSize` pour tenir **sur une ligne** — leur
    `m_HorizontalOverflow` vaut pourtant Wrap, mais Sevih a vérifié en jeu que ni
    le nom ni le titre ne passent à la ligne. `FitText` n'a pas été réutilisé : il
    comprime en `scaleX`, ce qui DÉFORME la lettre au lieu de réduire le corps.
  - **La largeur du texte est MESURÉE, plus estimée** (remarque Sevih : « Ais
    Wallenstein » sortait coupé au milieu du « i » final). Un premier jet estimait
    la largeur par classe de caractère ; il sous-évaluait ce nom de **10,6 %**, soit
    16 unités sur 150 — le « n » passait hors cadre. Une estimation ne pouvait pas
    tenir, parce que la contrainte n'est pas « à peu près » : c'est déborder ou non.
    Les chasses sont DÉRIVÉES, pas transcrites : `extract-font-metrics.py` relit le
    `hmtx` des deux fichiers de `src/fonts/` et écrit `portrait-font-metrics.json`
    — 263 chasses par police (tout ce qu'elles couvrent hors hangûl, pris en
    entier plutôt que choisi à la main), plus la chasse unique des 11 172 syllabes
    hangûl, que le script REFUSE de résumer si elle cesse d'être unique. Vérifié en
    rejouant les 992 chaînes du corpus (nom et titre, quatre langues) rendues par
    FreeType en layout BASIC — celui qui ne crène pas, comme Unity : zéro
    débordement, le résidu (0,03 % au pire) étant l'arrondi entier du corps par
    FreeType, qui s'efface quand on augmente la résolution du témoin. Reste hors
    mesure ce que ces polices NE couvrent PAS — kana et idéogrammes, peints par une
    police système et supposés pleine chasse.
  - **Le titre n'est pas affiché pour tout le monde**, et ça ne se déduit pas du
    `nickname` — les 124 en ont un en base. L'indication est `showNickName`
    (21 persos sur 124), et la règle du site vit déjà dans `characterNamePrefix`,
    qui couvre aussi le « Core Fusion » des entités fusionnées : c'est elle que la
    page appelle, pas le nickname brut.
  - **Deux valeurs relevées mais non appliquées, corrigées** : `m_FontStyle = 2`
    sur les deux textes du niveau vaut ITALIQUE (dans Unity 1 = gras) — les seuls
    du portrait à ne pas être droits ; et le `ContentSizeFitter` de `Level` a
    `m_HorizontalFit = 2` (PreferredSize), donc sa boîte s'ajuste au nombre au
    lieu de le contraindre — seuls son `left` et son `top` s'appliquent.
  - **Ce qui reste incertain est listé à part sur la page**, pas noyé : la teinte
    `#FCDB42` (appuyée sur une absence dans le désassemblage), le sprite exact des
    étoiles allumées (le runtime écrase celui du prefab, et le littéral n'a pas pu
    être résolu), et la largeur des KANA et IDÉOGRAMMES — et d'eux seuls, puisque
    aucune des deux polices n'en porte : c'est une police système qui les peint,
    dans le jeu comme ici, et on la suppose pleine chasse. Il ne reste donc que
    DEUX incertitudes de fond ; celle sur les polices est levée. La variante
    `cuirecruit` de la boîte du nom (170 de large) a été essayée et écartée : elle
    déplaçait aussi l'origine et sortait le texte du cadre.
  - **L'habillage `long` est ÉCARTÉ : le site ne veut que la carte.** Le composant
    ne rend plus que `CharacterThumbnailList` — plus de table `SKIN`, plus de prop
    `variant`, les rects sont posés en clair. L'avoir transcrit n'a rien coûté pour
    autant : c'est en le comparant que la lecture s'est confirmée (rail, élément,
    classe, voile, ancrage du niveau identiques au pixel) et que le nom écrasé s'est
    expliqué. Ses QUATRE valeurs divergentes (boîte du nom en 100 au lieu de 150,
    titre ancré dans celle du nom, `m_Alignment = 6` au lieu de 3, étoiles teintées
    #FCDB42) restent notées en commentaire — pour qu'on sache que la différence a
    été vue et écartée, pas manquée.
  - **Trois nettoyages, après relecture demandée par Sevih.** `starTint` était
    posé dans la table `SKIN` et jamais lu : un champ mort fait croire à un
    branchement qui n'existe pas, la valeur passe en commentaire sur `SKIN.long`.
    Les six étoiles allumées étaient six littéraux là où le prefab pose une
    progression EXACTE (31,21 puis pas de 15, sans le flottement d'un pixel que
    les creux, eux, portent) : elles se génèrent. Et la lisibilité du nom en petit
    n'entre PAS dans le composant — un seuil que le jeu n'a pas n'a rien à faire
    dans un fichier dont tout le reste est relevé ; c'est `hideName` que
    l'appelant coupe, pour réécrire titre ET nom sous le cadre comme
    `CharacterPortrait` le fait déjà, avec son repli sur le nom court curé.
  - **La rangée « trois tailles » MONTRE ce déplacement** (remarque Sevih : sinon
    elle affiche un nom illisible en donnant à croire que c'est le rendu voulu).
    Elle rend TROIS portraits, pas six : chaque taille telle que l'appelant devra
    la rendre — un premier jet doublait chaque taille pour laisser choisir le seuil
    à l'œil, mais une rangée de comparaison n'est pas une rangée de rendu (seconde
    remarque Sevih). Le seuil est donc posé, et c'est le SEUL nombre de la page qui
    ne vienne pas du jeu : 128 px de large, la largeur à laquelle le nom passe sous
    `text-xs` (12 px, le plus petit corps du site). Il vit sur la page, pas dans
    `Portrait`, parce que c'est un choix de lisibilité et pas un relevé. Le repli
    n'est pas imité mais EXÉCUTÉ : `fitsOnTwoLines` est exportée de
    `CharacterPortrait` et appelée — la recopier aurait fait diverger la page de la
    règle qu'elle illustre. Et le libellé du bas est un SEUL bloc « titre + nom »,
    la forme que les appelants passent déjà : les séparer en deux lignes paraissait
    plus fidèle au cadre, mais vidait la règle de son sens — vérifié sur les neuf
    noms courts curés, un nom seul tient toujours sur deux lignes et le repli ne se
    déclencherait jamais. En un bloc, « Kitsune of Eternity Tamamo-no-Mae » tient à
    128 et 180 px et bascule sur « E.Tamamo » à 80.

- **Les portraits de MONSTRE des guides rejoignent la vignette — six vues, et
  une règle pour trancher le reste.** Le premier balayage n'avait cherché que ce
  qui EMPILAIT la géométrie du portrait ; il manquait toute une famille qui
  passait par `monsterIconSrc` (remarque Sevih). Deux d'entre elles redessinaient
  à la main des calques que le jeu a en sprite :
  - `GeasUnlockList` écrivait la bannière BOSS **en CSS** — une pastille
    `bg-debuff` avec le mot « BOSS » en 7 px, au coin haut-gauche, là où le jeu
    pose `MT_Boss`. La vignette la pose seule, d'après le type.
  - `IrregularChaseMap` posait le portrait sur `img.slotFrame('unique')`, un
    cadre de rareté d'**ITEM** (`TI_Slot_Unique`) détourné en fond de monstre,
    alors que `MT_Slot_*` existe pour exactement ça.
  - Puis `BossPanel`, `TowerFloorMenu`, `TowerAddsSelector` et `AdventureGrid`,
    avec leurs alimentateurs (`TowerGuide`, `AdventureSeasons`, `GuildRaidGuide`).
  - **`MonsterThumb` + `monsterThumb()`** : les guides résolvent leurs monstres
    côté serveur puis passent le résultat à des composants CLIENT. Ils leur
    passaient une URL déjà construite — assez pour une face nue, mais le type, la
    rareté, l'élément et la classe restaient au vestiaire. La forme plate les
    transporte et se déverse dans `Thumbnail` (`{...thumb}`). Trois champs de
    `TowerMenuEntry` (`portraitSrc` + `element` + `classType`) fondent en un.
  - **La règle appliquée**, pour que la suite se tranche sans rediscuter : un
    monstre rendu comme PORTRAIT (image carrée autonome, ≥ 32 px) prend la
    vignette ; une icône ≤ 28 px posée dans du texte ou dans l'étiquette d'un
    onglet, à côté de son propre libellé, garde `monsterIconSrc`. La vignette
    complète y serait illisible et ferait doubler la hauteur des barres
    d'onglets. Restent donc à l'icône nue : les onglets de `MonsterLineup` (24)
    et de `GuildRaidGuide` (28), les `InlineIcon` des guides rédigés, et les
    og:image (`monsterOgImage`, PNG).
  - Élément et classe disparaissent d'à côté des noms dans `BossPanel` et
    `TowerFloorMenu` : la vignette les porte aux places du jeu, les répéter les
    montrait deux fois.
  - **Le bloc « Source » d'une fiche d'équipement** (le boss qui lâche l'objet,
    40 px) suit — sur remarque de Sevih, qui a vu que ces boss SONT des monstres.
    Ils le sont : `bosses.json` sort de `MonsterTemplet`, la même table que
    `monsters.json`, aux mêmes ids ; `buildBosses` n'en retient simplement que le
    nom, l'icône et l'élément et laisse tomber le type, la rareté et la classe.
    Un `getMonster(b.id)` dans `toSourceView` les reprend — pas besoin d'élargir
    le générateur pour 14 lignes. `thumb` y est FACULTATIF : la liste des boss
    peut venir de la couche curée, qui nomme des ids à la main, et un id sans
    monstre doit perdre son portrait, pas faire tomber la page. (Les quatre
    autres rendus de source — `cards.tsx` 24 px, `GearRecoSection` 20 px ×2,
    l'option de filtre d'`EquipmentBrowser` — restent à l'icône nue : la règle
    ci-dessus les y range.)
  - Écartés, et vérifiés un par un : `SingularityRotation`,
    qui préfère `img.singularity`, l'avatar rond que le jeu dédie à ce mode ;
    `SpecialRequestSplit` et les `VariantIcon`, qui montrent de l'ÉQUIPEMENT et
    non des monstres.

- **Tous les portraits passent par la vignette transcrite : trois rendus à l'œil
  supprimés, un seul reste.** `Thumbnail` existait mais rien ne s'en servait — le
  site portait EN PARALLÈLE trois géométries recopiées les unes des autres et
  déjà divergentes : `CharacterPortrait` (élément à `-top-1 -right-1` en 39 %,
  classe à 40 % là où le prefab dit 30 %, étoiles chevauchées d'un quart, aucun
  fond de rareté), le `MonsterPortrait` du calculateur (vignette à 92 % du fond
  au lieu de 122/128, élément et classe à 34 % l'un sous l'autre, niveau en
  pastille alors que le jeu l'écrit à nu) et ses `TileOverlays` sur les faces de
  perso. Les trois sont partis.
  - `CharacterPortrait` ne pose PLUS une seule mesure : il ne garde que ce que le
    jeu n'a pas — le nom sous la vignette, le lien, et le badge de recrutement,
    convention du site posée PAR-DESSUS plutôt que dans `Thumbnail` (qui est une
    transcription du prefab, et le prefab n'a pas ce calque). Ses 16 appelants
    n'ont pas bougé d'une ligne.
  - **`rarity` devient REQUISE** — c'est elle qui choisit le fond de la vignette,
    et le jeu n'a pas de vignette sans fond. Neuf appelants ne l'avaient pas : la
    donnée a été câblée à LA SOURCE (`FlagshipTopHero`, `GachaMinor`,
    `GearUsageChar`, `FinderCharacter`, `CharOption`, `ChipView`,
    `RosterGroupCardCharacter`) plutôt que devinée dans le composant. Tous les
    constructeurs l'avaient déjà sous la main.
  - **`PriorityTiers` peignait un palier de transcendance comme une rareté.**
    `stars` y est la CIBLE éditoriale (jusqu'à 9) : un palier 5 posait un fond de
    rareté inexistant et alignait cinq étoiles jaunes. Il passe désormais par
    `transcendence`, et la table du jeu rend les vraies teintes (4 jaunes + 1
    violette au palier 8).
  - **`img.monsterSlot` supprimée** : son dernier appelant était le calculateur.
    Elle déduisait le fond de la rareté — faux pour ~900 monstres. `DcTarget`
    porte maintenant `type` (le fond) ET `rarity` (les étoiles), les deux axes
    que le jeu tient séparés.
  - `SlotTile` perd son `overflow-hidden` : l'icône d'élément sort volontairement
    du cadre (le prefab l'ancre en dehors), rogner la recadrait en biais. Même
    raison pour l'anneau de sélection du picker, déplacé sur un conteneur.
  - **Laissés de côté, et pourquoi.** `TierListMakerBrowser` a un JUMEAU CANVAS
    qui doit produire la même image à l'export PNG : basculer le DOM seul les
    ferait diverger, et porter le 9-slice + la géométrie du prefab en `drawImage`
    est un chantier à part, à faire en regardant le rendu. Les pages admin
    monstres et `ExtractorSidebar` servent leurs sprites par
    `/api/admin/sprite/*` et non par le pipeline d'assets : les `MT_` des 4382
    monstres ne sont PAS collectés, `Thumbnail` n'y afficherait que des images
    mortes — leurs cadres `GD_Slot_Bg_*` sont une convention admin assumée, pas
    une copie ratée du jeu. `CharacterCard` est un autre prefab (la carte
    verticale `CT_`), pas une vignette.

## 2026-08-07

- **La vignette du jeu, transcrite des binaires — `src/components/ui/Thumbnail.tsx`
  - page de contrôle `/dev/thumbnail`.** Pas un portrait « inspiré du jeu » :
    chaque nombre est une valeur de RectTransform relevée aux bundles avec UnityPy.
    UN SEUL composant parce que le jeu n'en a qu'un — les prefabs
    `uimonsterthumbnail` et `uicharacterthumbnail` portent le même MonoBehaviour,
    `CUICharacterThumbnail`, et c'est cette classe « perso » qui expose
    `SetMonsterBG`. Deux habillages, pas deux composants. API en union discriminée
    (`kind="monster"` avec `icon`/`type`/`stars`, `kind="character"` avec
    `id`/`rarity`/`transcendence`) pour qu'on ne puisse pas croiser les deux.
  * **Le fond d'un monstre vient du TYPE, pas de la rareté** (`SetMonsterBG`
    prend un `CHARACTER_TYPE`) ; chez le perso c'est l'inverse, la rareté choisit
    Magic/Rare/Unique. Les deux axes sont indépendants : 951 monstres où la règle
    « rareté ≥ 3 = rouge » peignait à l'envers. `img.monsterSlotByType` et
    `img.characterSlot` portent chacune leur règle.
  * **Un sprite posé n'est pas un sprite dessiné.** Les deux prefabs assignent un
    cartouche au niveau (`MT_Slot_Level_Box` / `CT_Slot_Level_Bg`) avec
    `m_Color.a = 0` et un CanvasRenderer qui cull les meshes transparents : il
    n'est JAMAIS rendu. Le chiffre tient sur ses effets de texte. Même piège pour
    `DefaultBG` côté perso — trois sprites écartés du manifeste pour cette raison.
  * **Le vignetage n'est pas l'état grisé** : `m_DimImage` pointe le `Dim` de
    124×124 (allumé par `SetDim`) et vaut null chez le monstre ; celui de 122×122
    est un décor fixe. Vérifié, pas supposé.
  * **`CT_Slot_Bottom` et `MT_Slot_Bottom` sont identiques octet pour octet mais
    ne se rendent pas pareil** : leur `m_Border` vaut 28 d'un côté, 0 de l'autre.
    Rendu en `border-image`, qui couvre les deux cas (`slice: 0` se réduit à
    l'étirement). Rien dans les fichiers ne le dit — d'où deux fichiers collectés
    pour un même bitmap, plutôt qu'un renvoi implicite d'une famille à l'autre.
  * **Les étoiles d'un perso ne se comptent pas, elles se lisent dans une table.**
    Le prefab fige quatre rangées (`Star_4`, `Star_5`, `Star_5_Plus`, `Star_6`)
    d'apparence plausible : elles sont INACTIVES et `Star_6` contredit le jeu. La
    règle vit dans `CharacterTranscendentTemplet` (`ShowUIStar` / `StarColor` /
    `StarPlus`), portée telle quelle. `StarPlus` n'est pas un nombre d'étoiles
    colorées mais le « + » du palier : il n'y en a jamais qu'une, la dernière. Le
    nombre d'étoiles ne suit pas le palier — 4 au palier 5, 5 aux paliers 6, 7 ET
    8, 6 au palier 9. **Correction Sevih**, deux fois : c'est le seul calque dont
    la vérité n'est pas dans le prefab.
  * `m_BestFit` porté (approximation à chasse fixe, commentée) : la boîte du
    niveau perso ne fait que 32 de large, un nombre à trois chiffres en sortait.
  * 15 sprites `CT_` ajoutés au manifeste, collectés et poussés sur R2 (Sevih,
    07/08). Ils vont dans `ui/boss/`, dont le nom ne dit plus ce qu'il contient :
    historique, et le renommer en `ui/thumbnail/` laisserait autant d'orphelins
    sur R2 (le push ne supprime rien, `rclone delete` est manuel). Ménage à
    décider pour lui-même.
  * Page `/dev/thumbnail` : un tableau des huit calques qui divergent, une rangée
    par axe. La comparaison « rareté ≠ type » a été retirée — on veut le rendu du
    jeu, l'autre axe n'a rien à y faire même en contre-exemple.
  * `CharacterPortrait` (21 appelants) et le `MonsterPortrait` du calculateur
    gardaient leur rendu à l'œil : branchés le 08/08, cf. l'entrée du jour.

- **Les sprites rognés par l'atlas retrouvent leur taille logique — 782 fichiers
  changeaient de cadrage sans qu'on le sache.** Le packer d'atlas de Unity coupe
  les bords transparents d'un sprite et ne stocke que les pixels utiles ;
  AssetStudio exporte ce rognage tel quel. Un `MT_` déclaré 128×128 sortait donc
  en 126×121, décalé, et de façon ASYMÉTRIQUE — 232 des 515 vignettes de monstre
  sont concernées. Toute mise à l'échelle en aval reposait sur une image qui
  n'était plus celle que le jeu compose : le buste ne tombait plus sur la ligne
  du bas, et le décalage variait d'un monstre à l'autre.
  - `extract-sprite-rect.py` (UnityPy) relève `m_Rect` contre
    `m_RD.textureRect` / `textureRectOffset` et produit `sprite-rect.json`
    (564 entrées, committé). Les clés sont `<atlas>/<sprite>` et pas le seul nom :
    **32 sprites portent le même nom dans deux atlas avec des géométries
    différentes**, une clé plate en aurait écrasé la moitié.
  - `stage.ts` repose les marges à la production. Le défaut est GÉNÉRAL (83 %
    de `at_dungeonruntime`, 97 % des costumes, 76 % des items) mais la table est
    volontairement limitée aux deux atlas de vignettes : élargir se fait un
    atlas à la fois, en regardant le rendu.
  - La fraîcheur n'ajoute `sprite-rect.json` aux sources QUE pour les images qui
    y figurent (`hasRect`) — sans ce filtre, les 3998 fichiers staged se
    reproduisaient à chaque passe.
  - `face-icon.ts` pose les marges dans une passe sharp SÉPARÉE : sharp applique
    ses étapes dans son ordre (resize puis extend), pas dans l'ordre des appels,
    donc un `.extend().resize()` chaîné paddait l'image DÉJÀ étirée et les
    355 icônes échouaient à la composition.
  - Bénéficie à tout ce qui existait déjà (en-têtes de boss, lineups, tours,
    guild raid, sources d'équipement), pas seulement au nouveau composant.

- **2ᵉ passe d'audit : landmark `<main>` dupliqué, et le site n'avait aucun
  écran d'erreur.** Passe ciblée sur ce que la première n'avait pas regardé —
  a11y, boundaries d'erreur, intégrité des données, streaming.
  - **`<main>` imbriqué sur 9 pages publiques**, dont l'accueil et la fiche
    perso. Le layout pose `<main>{children}</main>` et ces pages en rendaient un
    SECOND à l'intérieur : invalide en HTML (un `main` ne peut pas descendre d'un
    `main`) et **deux régions « principal »** annoncées aux lecteurs d'écran, ce
    qui rend la navigation par landmark ambiguë. Origine lisible dans le
    commentaire du layout : « chaque page pose le sien » parlait du CONTENEUR de
    mise en page ; le `<main>` du layout est venu après, sans nettoyer les pages
    qui en avaient déjà un. Les 9 passent en `<div>` (classes inchangées), sauf
    l'accueil dont le `<main>` était nu → fragment. Le layout porte désormais
    l'avertissement pour éviter la récidive par copier-coller.
  - **`error.tsx` + `global-error.tsx`** — il n'existait AUCUN écran d'erreur,
    seulement `not-found.tsx`. Toute exception de rendu servait la page par
    défaut de Next : anglais, sans header/footer, sans chemin de retour. Ce
    n'est pas théorique ici — un `meta.bossId` absent de `monsters.json` fait
    JETER le rendu d'un guide (cf. la note du TODO). `error.tsx` reprend le
    gabarit de la 404 ; `global-error.tsx` est VOLONTAIREMENT autonome (styles
    inline, aucune dépendance à `RootDocument`, `globals.css`, Tailwind ou
    l'i18n) : il ne se déclenche que si le layout racine a échoué, donc au
    moment précis où il ne faut dépendre de rien. Il affiche le `digest`, seul
    lien entre l'écran du visiteur et la stack dans les logs.
  - Traduction de `error.tsx` : un écran d'erreur est forcément un Client
    Component, donc ni `getT` ni `getRequestLang`. On n'importe PAS `@/i18n`
    pour autant — aucun composant client ne le fait, et ce serait tirer 519 clés
    × 5 locales dans le bundle pour trois phrases. Dictionnaire local de 5
    langues, saisi sur `<html lang>` via `useSyncExternalStore` (et pas un
    `setState` dans un effet : `react-hooks/set-state-in-effect` est gardée
    active sur ce projet, c'est exactement le cas qu'elle vise).

  **Confirmation au passage — `localePath` est encore plus justifié que
  l'audit ne le croyait.** Le `<Link href="/">` d'`error.tsx` a été REFUSÉ par
  le typecheck : `Type '"/"' is not assignable to type 'UrlObject |
RouteImpl<"/">'`. Avec le routing par sous-domaine, les routes typées de l'app
  router sont `/[lang]/…` — `/` n'en est pas une. Ce que la 1ʳᵉ passe n'avait pas
  pu prouver faute de `.next/dev/types/routes.d.ts` généré est donc vérifié :
  sans `localePath`, ce sont 44 casts qu'il faudrait disséminer.

  **Sain, vérifié, à ne pas re-auditer** : données curées (124 persos, 91 recos
  d'équipement, 9 noms courts — **zéro référence orpheline** vers
  `characters.json`, tous les JSON valides) ; i18n (`keys.test.ts` vert, aucune
  clé morte) ; titres (aucune page à deux `h1`, et les 7 qui semblaient en
  manquer les délèguent à `ToolShell`/`HomeHero`/`guide-detail`) ; zéro `catch`
  vide sur 815 fichiers.

- **Les 4 `fetch` serveur vers un hôte externe ont enfin un plafond d'attente.**
  Reliquat de la 2ᵉ passe, élargi en le traitant : le défaut repéré sur
  `fetchDiscordCounts` était le même sur trois autres appels, dont un bien plus
  exposé.

  Tous étaient correctement gardés — `try/catch`, `!res.ok`, repli committé — et
  tous avaient le même angle mort : **un `catch` attrape un échec, jamais une
  absence de réponse**. Un socket accepté mais non servi laisse `fetch` pendre,
  et le repli promis en commentaire ne se déclenche alors JAMAIS. Comme ces
  appels sont awaités pendant le rendu serveur, c'est la régénération ISR qui
  reste suspendue.

  | Appel                         | Hôte             | Pages concernées            | Plafond |
  | ----------------------------- | ---------------- | --------------------------- | ------- |
  | `loadRuntimeJson` (générique) | R2               | accueil, /coupons, /event   | 3 s     |
  | `getReviewsForCharacter`      | API du bot (VPS) | **toutes les fiches perso** | 2 s     |
  | `loadComics`                  | R2               | /4-comics                   | 3 s     |
  | `fetchDiscordCounts`          | API Discord      | accueil                     | 3 s     |

  Le plus exposé n'était pas Discord mais **`runtime-json.ts`** : c'est le
  lecteur générique de toute la donnée vive du site. Et `reviews.ts` vise un
  service SÉPARÉ du VPS, dont un conteneur en cours de démarrage accepte la
  connexion sans répondre — le cas exact que le `catch` ne voit pas, sur la
  page la plus nombreuse du site, avec `revalidate: 60`.

  Les 3 `fetch` restants (`/api/tierlist`, `/api/search`, `/api/shortlink`) sont
  laissés tels quels : same-origin ET côté client, un timeout y serait du
  confort d'UX, pas de la robustesse de rendu.

- **Heatwave Cop Delta rejoint Ryu Lion partout où celle-ci est recommandée.**
  Même kit (skillset partagé, exclusion mutuelle en deck) : tout guide qui
  conseillait Ryu conseille désormais les deux. **52 listes dans 45 fichiers**
  (adventure-license, guild-raid, joint-challenge, world-boss, special-request,
  skyward-tower), Delta insérée JUSTE APRÈS Ryu — dans un slot d'équipe les
  entrées sont des alternatives, la placer là la présente en substitut et non
  en unité de plus. 1425 tests au vert.
  • **Les versions ARCHIVÉES ont été épargnées, délibérément** : Delta est
  sortie le **2026-07-14** (`banner.json`), l'écrire dans `koh-meteos/2025-05`
  ou `frost-legion/2025-05` inventerait une reco qui ne pouvait pas exister.
  Critère retenu : la version la PLUS RÉCENTE de chaque guide (celle qui
  s'affiche par défaut, donc le conseil courant) + les guides non versionnés —
  ce qui garde `madman-laboratory/2026-04` et `ragnakeus/2025-12`, antérieurs à
  sa sortie mais toujours actifs. 24 fichiers laissés tels quels.
  • **Un doublon rattrapé** : `shichifuja/2026-07` proposait déjà Delta dans un
  AUTRE slot — l'ajouter près de Ryu l'aurait fait apparaître deux fois dans la
  même équipe. Ajout annulé sur ce fichier, mention d'origine conservée.
  • La PROSE n'a pas été touchée (seules les listes de persos) : la note de
  `madman-laboratory/2026-04` cite encore Ryu seule là où `android-sphinx` cite
  déjà les deux — décision éditoriale, pas mécanique. `stats/labels.ts` garde
  Ryu comme cas d'école (`{SK/Ryu Lion|S2}`, bonus 4★), à raison.

- **Clôture de l'audit : primitives admin, forme des reviews, et TROIS constats
  tombés.** Dernière passe, sur un arbre propre.
  - **`components/admin/_ui.ts`** — `btn` était déclaré 17×, `input` 11×,
    `field` 7×, `label` 6×, et aucun n'était importé d'ailleurs (les
    `export const btn` existants n'avaient aucun consommateur : de l'export
    mort). 25 fichiers en dérivent. Règle tenue : **on n'unifie que des chaînes
    strictement identiques** — les variantes réelles se composent à l'appel
    (`inputFull`, `${input} text-content`, `${inputFull} max-w-xs`), et les
    styles franchement distincts (le `btn` « chip » de `gear/`, le compact
    d'`events/`) restent locaux. Vérifié **mécaniquement** : un script compare
    les classes avant/après en résolvant imports et compositions — aucune
    divergence. Un refactor de style qui déplace une classe ne se voit pas au
    typecheck, seulement à l'écran.
  - **`lib/admin/review-shape.ts`** — `normalizeReview` était écrit deux fois à
    l'identique, `hasText` deux fois à une garde près. Ce n'était **pas** de la
    négligence : `general-guide-store.ts` tire `node:fs`, et
    `PremiumLimitedParts.tsx` est une brique PARTAGÉE avec `/contribute` qui
    part en prod — elle ne peut pas importer le store. La dédup correcte passait
    donc par un module **pur**, ce que réclame déjà `SHARED_BRICK_MSG` dans
    `eslint.config.mjs`. `ReviewEntryData`/`StarKey` y déménagent (le type vit
    avec les fonctions qui le façonnent) et le store les ré-exporte : aucun
    consommateur ne bouge. Pour `hasText`, on garde le corps **défensif**
    (`typeof x === 'string'`) — ces objets viennent aussi d'un JSON importé à la
    main, où une valeur peut être un nombre ou `null`, et l'autre variante
    jetait.

  **Trois constats de l'audit se sont révélés FAUX à la vérification** — notés
  ici pour qu'ils ne soient pas rouverts :
  - **`monsterIconSrc` n'est pas un doublon.** `lib/admin/` résout vers la route
    sprite admin (`/api/admin/sprite/MT_*`, sprites non collectés, dev),
    `lib/data/` vers le CDN R2 (`img.boss`). Même nom, deux sources — les
    fusionner aurait été un bug.
  - **`DATALIST_ID` n'est pas dupliqué.** Les 3 déclarations portent 3 valeurs
    distinctes (`free-heroes-`, `guide-`, `premium-limited-char-names`) : un id
    de datalist par écran, ce qui est correct.
  - **`localePath()` n'est pas un no-op à supprimer**, et l'audit a failli le
    faire. Le `_lang` ne sert plus depuis les sous-domaines, mais le
    `as Route` du corps porte tout : `typedRoutes: true` fait de `Route` une
    union de littéraux, et **44 des 68 appels** passent un template
    (`/characters/${slug}`). Le retirer ne supprimerait pas un cast — il en
    disperserait 44. Le commentaire de `navigation.ts` dit désormais pourquoi la
    fonction reste. (Chiffre de l'audit corrigé au passage : 68 appels, pas 110
    — le premier comptait les occurrences du mot, imports compris.)

- **`LANGS` : trois choses portaient le même nom, le TYPE tient maintenant
  l'alignement.** Suite de l'audit. Le nom `LANGS` désignait, selon le fichier
  ouvert : les **5** langues du site importées de `i18n/config` (sitemap,
  layout, Footer, `ChangelogEditor`, `EventsEditor`), les **5** mêmes recopiées
  à la main dans 7 écrans admin, et les **4** langues de jeu dans
  `ItemCuratedEditor`. Les usages étaient corrects — le danger était qu'ils le
  restent : les trois sont des listes de codes langue, donc **confondre les deux
  compile**. Supprimer la const locale d'`ItemCuratedEditor`, ou laisser
  l'auto-import de l'IDE résoudre `LANGS` vers config, lui aurait fait écrire
  une clé `fr` dans un `LangDict` — donnée hors contrat, sans une erreur.

  `config.ts` gagne `GAME_LANGS`, **dérivé** de `LANGUAGES` par `isOfficial`
  (jamais un littéral) et annoté `readonly GameLang[]`. Les 8 littéraux
  disparaissent au profit de `LANGS` ou `GAME_LANGS` selon le type édité
  (`LocalizedText` ou `LangDict`) : le choix est désormais lisible au nom, plus
  à la longueur du tableau.

  Détail qui a motivé le geste : une version de cette constante avait été
  retirée de `config.ts` « faute de consommateur » — inexact, `ItemCuratedEditor`
  la réimplémentait en dur. Et `config.ts` / `datagen/lib/lang.ts` se
  renvoyaient l'alignement en commentaire (« DOIVENT rester alignées »), sans
  que personne ne le vérifie. **C'est maintenant le compilateur** : passer `fr`
  à `isOfficial: true` sans l'ajouter à `GAME_LANGS` côté datagen produit
  `Type '"fr"' is not assignable to type '"en" | "jp" | "kr" | "zh"'`. Vérifié
  en le cassant exprès. `import type` seul, donc `config.ts` reste client-safe.

- **Audit complet du site, et ses trois premiers correctifs.** Rapport damage
  sorti à part ([audit/damage-calculator.md](./audit/damage-calculator.md),
  constats **D1–D5**) — le domaine a son worker dédié, l'audit global n'en garde
  rien. Ce qui a été corrigé dans la foulée :
  - **`next` 16.2.10 → 16.3.0** — 4 avis _high_ dont **« Middleware / Proxy
    bypass in App Router (Turbopack + single locale) »** et **« SSRF in rewrites
    via attacker-controlled destination hostname »**, tous deux visant
    exactement ce que fait `src/proxy.ts` (routing i18n par sous-domaine +
    exclusion `/admin`, `/api`, `/dev`). Corrigés en amont dès 16.2.11 : on
    était à une version patch. `pnpm audit` passe de 26 à 12 avis, et les 12
    restants sont **tous** en devDependencies (`cheerio`, `concurrently`,
    `eslint`) — zéro surface prod. ⚠️ La mise à jour a été faite **serveur de
    dev allumé**, ce qui a swappé `node_modules` sous lui (`TypeError: this.load
is not a function` sur les routes admin). Redémarrage requis ; à ne pas
    refaire sans prévenir.
  - **Sitemap : `/changelog`, `/event` et ses fiches étaient absents.** Pages
    indexables et pré-rendues (`generateStaticParams`), mais rien ne les
    signalait au crawl. `sitemap()` passe en `async` pour `listEventSlugs`, qui
    filtre déjà les brouillons. `/contribute` reste dehors, à raison : il porte
    `robots: { index: false }`.
  - **Socle de partage factorisé** — `src/lib/hash-store.ts`. `short-links.ts`
    et `api/tierlist/_store.ts` portaient chacun leur copie caractère pour
    caractère de `ensureTable` (mémoïsé) et de l'id-hash `sha256 → base64url →
12`. Le 3ᵉ partage annoncé dans `db.ts` (les équipes) n'aura plus qu'à
    déclarer sa table. `ID_RE` de la tier-list reste **volontairement** plus
    permissif (`{1,16}`) : des liens `?s=` V2 en dépendent. 9 tests couvrent ce
    que la factorisation pouvait casser — déterminisme des ids et **isolation de
    la mémoïsation entre stores**.
  - Commentaire CI qui annonçait « 278 tests » pour 1416 réels → ordre de
    grandeur, qui ne re-périmera pas.

  **Deux constats de l'audit ont été INVALIDÉS en les vérifiant**, et ne
  laissent donc aucune tâche :
  - _« 38 des 41 `<img>` sans `loading="lazy"` »_ — mesure brute et trompeuse :
    elle comptait des **lignes**, pas des rendus. La politique est déjà en
    place (48 `loading=` posés), et posée aux bons endroits — `CharacterCard`
    gère même le LCP (`priority ? 'eager' : 'lazy'`), `CharacterPortrait`,
    `EquipmentIcon`, `GuideCard` et toutes les grilles de guides en portent un
    qui sert des centaines de vignettes. Ce qui reste sans attribut, ce sont des
    icônes d'overlay de 16 à 56 px (élément, classe, étoile, rang) : les passer
    en `lazy` serait une régression.
  - _« `LANGS` redéclaré 8× avec des contenus divergents »_ — ce n'est pas une
    dérive : `ItemCuratedEditor` a **raison** d'omettre `fr` (il édite un
    `LangDict = Record<GameLang, string>`, et `fr` est `isOfficial: false`), là
    où `EffectCuratedEditor` a raison de l'inclure (il édite un
    `LocalizedText`). Reste que le même identifiant désigne deux concepts
    opposés — **traité dans la foulée**, cf. l'entrée suivante.

  **Reliquat traité le jour même**, une fois l'arbre propre : `_ui.ts` admin et
  `review-shape.ts` (cf. entrées suivantes). Ce qui laisse l'audit **clos**,
  hors volet damage.

- **Les noms sous les portraits ne sont plus tronqués.** `CharacterPortrait`
  écrivait le nom sur UNE ligne `truncate` large de `size + 24` (88 px pour un
  portrait de 64) : tout ce qui dépasse deux mots courts finissait en « Heatwave
  Cop D… ». Repéré par Sevih sur les paliers du guide Premium & Limited, mais le
  composant sert sur une vingtaine d'écrans (team-planner, synergies,
  pull-simulator, admin…) — c'était partout. Le nom passe sur **2 lignes**
  (`line-clamp-2`, `leading-tight`, `wrap-break-word`) à largeur de colonne
  INCHANGÉE : les rangées `flex-wrap` gardent leur alignement, ce que faisait
  gagner la troncature. La hauteur est réservée en dur à 2 lignes
  (`min-h-[2.5em]`) — sans ça, un voisin tenant sur une seule ligne décentre les
  portraits d'une même rangée sous `items-center`. `title` ajouté pour le nom
  qui déborde quand même (Tamamo-no-Mae et consorts).
  • **Et pour ceux qui débordent MALGRÉ les deux lignes, repli sur le nom
  court curé** (`short-names.json`, déjà localisé et déjà consommé par le
  tier-list-maker et les recos d'équipement — rien à construire). Le portrait
  reçoit `shortName` en PROP : `loadShortNames()` lit le fs, or le composant
  tourne aussi côté client, donc la résolution (`short[lang] ?? short.en`,
  fallback maison) reste chez l'appelant serveur. Le repli n'est employé qu'en
  DERNIER recours, arbitré par `fitsOnTwoLines` — estimation typographique
  (largeur moyenne par caractère, pleine chasse pour les scripts CJK, wrap
  glouton par mots), pas une mesure DOM : le portrait est rendu côté serveur.
  Vérifié sur les noms réels : « Heatwave Cop Delta », « Demiurge Stella » et
  les noms JP/KR/ZH tiennent et gardent leur nom complet ; « Holy Night's
  Blessing Dianne », « Kitsune of Eternity Tamamo-no-Mae » et « Summer Knight's
  Dream Ember » basculent. `alt` et `title` gardent TOUJOURS le nom complet.
  Branché sur `PriorityTiers` (guides) ; les browsers client (team-planner,
  most-used-units, synergies…) restent à câbler, `shortName` se posant à côté
  de `searchNames` dans la ligne construite côté serveur.
  • Liste de l'admin Short names triée **du nom le plus long au plus court**
  (alphabétique en départage, sinon l'ordre serait instable) : les persos qui
  débordent arrivent en tête, ce sont les seuls à traiter.

- **L'éditeur d'alias de recherche VIDAIT la clé au lieu d'enregistrer.** Le
  texte tapé reste un brouillon local tant qu'on n'a pas fait Entrée ou
  virgule ; `save()` n'envoyait que les chips déjà validées. Taper un alias puis
  cliquer Save postait donc une liste VIDE — et « liste vide ⇒ supprime la clé »
  côté store — en affichant « ✓ saved ». Diagnostiqué sur un
  `data/curated/search-aliases.json` réduit à `{}` après une saisie de Sevih.
  `save()` valide désormais le champ en cours avant d'envoyer. Seul éditeur admin
  bâti sur ce motif chips + brouillon (vérifié).

- **Guide « Premium & Limited » : les collab se voient sans être un choix
  (retour Shiraen).** Les héros de collab étaient classés dans les paliers de
  priorité comme n'importe quel autre — utile comme repère (« voilà où ils se
  situent »), trompeur comme conseil : un collab n'est obtenable que **pendant
  son événement de collaboration**, et un retour n'est jamais garanti (les trois
  concernés viennent de la collab DanMachi, qui ne sera probablement jamais
  refaite).
  Les portraits de collab sont désormais rendus à **70 % d'opacité** dans
  `PriorityTiers` — DÉRIVÉ du tag `collab` de la data, pas d'un champ éditorial
  à maintenir : un futur collab est atténué tout seul, et rien à re-vérifier
  dans le JSON de priorités. Nouvelle prop `dimmed` sur `CharacterPortrait`
  (composant partagé, défaut inchangé). Une légende `collabNote` (5 langues)
  dit cette raison-là sous les paliers — le translucide seul se lit aussi bien
  comme « pas encore sorti » ou comme un bug de rendu, et une formulation en
  « pas un choix sur CETTE bannière » aurait été fausse : ce n'est pas un
  manque ponctuel, c'est le format collab. Elle ne s'affiche que sur l'onglet
  qui contient des collab, donc pas côté Premium.
  • **Second tour de retours (Shiraen, 11:33) : un BADGE `collab` sur les
  portraits de priorité**, le contraste de la seule opacité étant jugé trop
  faible. Prop `badgeTag` sur `CharacterPortrait` : même sprite de recrutement
  et même coin (haut-gauche, libre) que sur `CharacterCard`, filtré par
  `RECRUIT_TAG_SPRITE` pour qu'un tag sans sprite ne fabrique pas d'URL morte.
  Le badge a REMPLACÉ l'atténuation, pas complété : opacité rendue à 100 % et
  prop `dimmed` SUPPRIMÉE (plus aucun appelant — une prop morte dans un
  composant servi sur vingt écrans finit recopiée par erreur). Le ruban occupe
  68 % de la largeur du portrait, sous les 100 % pour ne pas courir jusque sous
  l'icône d'élément du coin opposé. La légende ne parle plus de translucidité,
  devenue sans objet : elle garde le fait (obtenable pendant l'événement
  seulement, retour jamais garanti), la formulation EN de Shiraen, et s'OUVRE
  sur le sprite lui-même — le lecteur relie le badge des portraits à
  l'explication sans le deviner (`alt=""`, le mot « Collab » suit). À revoir si
  Major9 tient sa piste d'intégrations de collab durables : le format
  changerait, la note aussi.
  • **Poolside Trickster Regina et Holy Night's Blessing Dianne échangent leurs
  paliers** (Limited) : Regina passe en 2e priorité, Dianne en 3e.
  • **Heatwave Cop Delta ajoutée en 2e priorité Limited, juste après Ryu Lion**
  (consensus Shiraen/Sevih) : c'est la copie de Ryu (Terre/Ranger, skillset
  partagé, exclusion mutuelle en deck), et elle avait déjà sa review dans le
  guide — seule la ligne de priorités manquait, si bien que le seul des deux
  visible dans les paliers était l'indisponible.

- **`pnpm dev` ne meurt plus sur une machine sans UnityPy.** L'étape python
  face-layout (la seule du projet) s'exécutait dès que `.gamedata` existait —
  mais tirer les bundles n'implique pas avoir l'outillage python : sur le
  portable, `ModuleNotFoundError: No module named 'UnityPy'` faisait échouer
  TOUT le refresh, donc tout `pnpm dev`, pour une étape dont la sortie
  (`face-icon-layout.json`) est COMMITTÉE. `refresh` sonde désormais
  `python -c "import UnityPy"` et SAUTE l'étape avec un avertissement actionnable
  (`pip install UnityPy` puis `pnpm datagen:patch --force`) : le dev tourne sur
  le layout du dernier passage, seuls les FI_ de persos/skins arrivés depuis
  manqueraient sur cette machine. Un échec du script LUI-MÊME (bundle absent,
  prefab illisible) lève toujours — c'est un vrai problème de la machine de
  datamine, à ne pas avaler. `datagen/README` § exception python mis à jour.
  • **Et la dépendance est enfin DÉCLARÉE** : `datagen/requirements.txt`
  (`UnityPy>=1.25,<2` — plancher borné sous la 2.x, pas épingle). Elle ne vivait
  nulle part : ni requirements, ni pyproject, ni doc — juste un `pip install`
  fait à la main sur le fixe un jour, que rien ne rejouait ailleurs. `init.ps1`
  la pose désormais si python est présent (§1c), SANS installer python via
  winget : gros runtime pour une étape facultative, et le refresh la tolère
  absente. Prérequis §1 d'`installation.md` complété (+ `editorial:pull` ajouté
  au §4). UnityPy 1.25.3 installé sur le portable dans la foulée (wheels
  disponibles pour Python 3.14, aucune compilation) — sonde repassée au vert.

- **`.editorial/` a enfin une source de vérité — `editorial:pull` /
  `editorial:push`.** Le pool éditorial (27×3 BD 4-cut + 5 wallpapers faits
  main) est du contenu ORIGINAL absent des fichiers du jeu ET de git
  (gitignoré, binaires) : il ne vivait que sur le PC fixe. Aucune sauvegarde
  hors-machine, et deux PC qui divergent en silence. Conséquence concrète
  repérée depuis le portable : `collect-comics` régénère le manifeste R2 depuis
  le pool LOCAL, donc un `pnpm images` (que `pnpm commit` enchaîne !) sur une
  machine au pool partiel faisait tomber la galerie de 27 BD à ce qu'elle avait
  — les webp survivant sur R2 (le push n'efface rien), mais plus personne ne les
  demandant. Les ORIGINAUX montent désormais sur R2 sous le préfixe `editorial/`
  (distinct d'`images/`, hors staging) via `r2Upload` ajouté au runner rclone
  partagé. **`copy` dans les deux sens, jamais `sync`** : union des machines,
  aucun transfert ne peut détruire un pool (même doctrine qu'`assets:pull`) ;
  corollaire assumé, retirer une BD partout reste manuel.
  • **Garde-fou** dans `collect-comics` : le manifeste n'est plus écrit si le
  pool local compte moins de BD que le seed committé `comics.json` (la trace
  versionnée du pool complet) — warning qui renvoie sur `editorial:pull`,
  `--force` pour le retrait volontaire. Les webp, eux, partent quand même :
  rien n'est perdu, seule la liste est retenue. Vérifié dans les deux sens sur
  un pool factice (1 < 81 → retenu ; `--force` → écrit). Procédure
  `docs/procedure/ajouter-comic.md` complétée (étape 0 « avoir le pool
  complet », `editorial:push` ajouté à la publication). tsc datagen + eslint OK.

## 2026-08-06

- **Story vs Origin Story — l'histoire retrouve son vrai découpage.** Depuis
  la refonte du jeu, DM_NORMAL couvre DEUX contenus : la story courante
  (zones `AGT_NEW_*`, « Story Season 1 », 3 épisodes) et l'Origin Story
  (zones historiques S1-S4 — clés `SYS_SEASON_NAME_*`, déblocage après la
  story 3-16). Le site mélangeait tout sous « Story Normal/Hard », et les
  stages hard refondus (`AGT_NEW_HARD`) étaient MAL CLASSÉS en normal.
  Encounters émet désormais 4 slugs synthétiques (`normal`/`normal_hard`/
  `origin`/`origin_hard`, titres du jeu curés « Origin Normal/Hard ») + le
  NUMÉRO de stage dans l'épisode (chiffres de la clé `ShortNameID`, « 0513 »
  = 5-13) ; le donjon de test oublié dans les tables (`THIS_IS_TEST_DUNGEON`)
  est exclu (retenu `retired` par la promotion). Moteur : les 4 slugs →
  `DM_NORMAL` (`dungeonModeOf`, gate § 16.2 inchangé). Les guides des boss
  d'histoire affichent maintenant « Origin Normal/Hard » — fidèle au jeu.

- **Damage calculator : picker de cible VISUEL pour l'histoire + toutes les
  vagues ciblables** (demande Sevih). Les 4 modes story se replient en 2
  familles (« Story », « Origin Story ») ; choisir une famille ouvre un
  browser : toggle Normal/Hard (rendu rougeâtre en hard, tokens `danger`),
  saisons → épisodes (portrait du boss de l'épisode) → stages à combat
  (accordéon des N vagues, portrait du boss du stage) → chaque monstre d'une
  vague est ciblable — plus seulement les boss. La recherche bascule sur la
  liste à plat (les libellés story portent le numéro en jeu : « 3-16. Part
  of the Plan »). Donnée : `damage/targets.json` passe des boss aux monstres
  des rencontres vivantes (1560 → 2443 cibles, fermeture buffs élargie) ;
  `resolvePresetTarget` ne filtre plus sur le rôle (id répété = première
  entrée, même dédup que l'UI). Les autres modes gardent la cascade de
  selects en attendant leur propre visuel. Au passage : le regen rattrape
  les tables 1.10.802 → 1.10.805.

- **Picker story — retours Sevih (2e passe).** (1) Titres des familles
  « Story »/« Origin Story » : plus de texte main dans les locales — clés
  TextSystem curées (mode-titles.json § families) émises au glossaire
  (`storyFamilies`), repli sur le titre du mode. (2) Portraits manquants
  (404 `MT_4041041`) : la collecte d'assets prenait les seuls `type: 'boss'`
  référencés — désormais TOUS les monstres référencés par une rencontre, +
  les fonds de rareté `MT_Slot_Normal/Magic/Rare` (rareté 1/2/3+ →
  `img.monsterSlot`). Le push R2 reste à faire. (3) Vagues fidèles : la
  dédup d'encounters devient PAR VAGUE avec `count` (story 1-1 : 2 × le même
  loup en vague 1 → « ×2 » ; un monstre rejoué sur plusieurs vagues a une
  entrée par vague, spawns inverses inchangés, `pickMonsters` dédoublonne
  pour les guides). (4) UN composant portrait (`MonsterPortrait` : fond de
  rareté + vignette + overlays élément/classe/boss/niveau) partagé entre la
  cible sélectionnée, la liste à plat et les vagues du browser ; l'icône de
  classe passe à la taille de celle de l'élément (TileOverlays).

## 2026-08-04

- **`/tools/hero-tracker` — V1 : suivi de compte par héros → items à farmer**
  (demande Sevih, item TODO « track l'avancée du compte sur les hero »).
  CARTOGRAPHIE D'ABORD, et elle a décidé du reste : tout ce qu'il fallait
  existait déjà, sauf trois choses, ajoutées au générateur `hero-growth`
  (même domaine, même fichier — un second JSON « croissance des héros »
  aurait divergé) : `xpCurve` (120 niveaux) et `affinityCurve` (100
  niveaux) depuis `ExpCharacterTemplet`, et `gifts` — dont les points ne
  sont dans AUCUNE table (`MaterialValue` vide) mais dans le TEXTE de
  l'item : dérivés par motif strict, qui JETTE s'il ne matche plus.
  Recoupement fort : les 20 cadeaux et leurs paliers (100/200/500/1000)
  tombent exactement sur l'éditorial curé du guide heroes-growth.
  MOTEUR (`engine.ts`, pur, tables injectées, 16 tests) : différentiels de
  CUMUL pour niveau et affinité (jamais une somme de paliers), paliers
  franchis pour skills / limit break / EE / transcendance, bornes à zéro
  (dépasser sa cible n'est pas une dette), et les deux monnaies qui ne sont
  pas des items — XP et points d'affinité — converties en plats/cadeaux à
  l'affichage seulement.
  TROUVAILLES : le limit break consomme une « Limit Break Memory [élément] »
  GÉNÉRIQUE (`progression.limitBreak` indexé `${rareté}_${élément}`), donc
  agrégeable sur tout le compte ; la transcendance, elle, consomme des
  fragments PROPRES au héros — jamais additionnés entre héros. Et
  l'awakening n'est PAS par héros (arbre de compte) : sorti du périmètre,
  reversé au TODO.
  État en localStorage (`outerpedia:hero-tracker`, aucun compte), roster
  complet affiché (un héros non suivi se repère), cible préremplie par
  héros (niveau 100, skills max, affinité 20 ; transcendance et EE égales à
  l'état — elles dépendent du gacha). 24 clés i18n ×5. Page `unlisted` : la
  boucle de revue et les arbitrages restants sont au TODO.

- **ee-effects : DoT enhance — deux sens opposés sous le même type** (rapport
  Sevih : Gnosis Beth « 2000092 enhance », Omega Nadja spammée de six chips
  enhance). (1) `BT_2000092_ENHANCE` : le nombre est l'id du PERSO (Gnosis
  Beth), PAS un id de statut — le résoudre par le glossaire des effets tombe
  sur un homonyme (« Retribution's Dominion ») ; le nom vient du texte du
  passif → « Eternal Bleeding enhance » en libellé explicite. (2) « Ally DoT
  taken -30% » (Nadja +10) est implémenté par le jeu comme UN effet
  `*_ENHANCE` PAR type de DoT ciblant les alliés : replié en UNE clé
  `dot:taken` (« Ally DoT taken ») — la CIBLE distingue ce cas de l'enhance
  offensif de Beth (target enemy_team). Au passage : libellés lisibles pour
  les types restants (« DMG scaling with own stat », « Heal (caster-based)
  »…), fallback capitalisé partout — plus aucun label brut ou minuscule
  (vérifié sur les 124). Lien fiche perso : sur le NOM directement (nouvel
  onglet), plus de flèche.

- **ee-effects : labels non résolus (« get_gold_rate up ») — et une leçon.**
  Capture Sevih sur Notia. Le slug `get_gold_rate` est un RÉEMPLOI
  fourre-tout du jeu pour des mécaniques propres à un perso (« Fierce
  Offensive » chez Notia) : l'identité réelle de l'effet est son tooltip.
  PREMIER fix (statut prime toujours) REJETÉ à la mesure : il fragmentait le
  vocabulaire (30 porteurs sur 124 — le jeu n'attache un tooltip qu'à
  CERTAINS buffs de stat, deux « Speed up » identiques ne matchaient plus).
  Règle finale : une stat de combat CONNUE (dans `statNames`) reste
  l'identité canonique, tooltip ou pas ; le statut nommé ne fait l'identité
  que pour les slugs HORS statNames. `WEAKNESS_GAUGE_DAMAGE` (dégâts à la
  jauge de faiblesse — vidée = break, sens confirmé Sevih) : libellé en
  repli explicite + prettifier générique capitalisé en dernier recours
  (plus jamais de `_` à l'écran, testé). Diff final chirurgical : 14
  porteurs, labels seuls sauf l'identité voulue des fourre-tout. LEÇON :
  j'avais d'abord libellé « Gold gain » d'après le nom du slug — faux, le
  slug ment ; lire le texte réel du passif avant de nommer quoi que ce soit.

- **Ranking helper : « Demiurge Demiurge Astei » — préfixe doublé** (capture
  Sevih). Le contrat du site : `characterDisplayName` rend le nom COMPLET
  (préfixe inclus) et les composants qui affichent le préfixe à part le
  RETRANCHENT du nom (`CharacterCard` fait `name.replace(prefix, '')`).
  L'outil préfixait une seconde fois. Fix : champ `prefix` retiré de la
  donnée et des rendus, `name` seul partout.

- **Ranking helper : retours Discord (Shiraen, Arabyss) après mise en ligne.**
  (1) BUG : en modes EE, éteindre toutes les chips d'effets pour ne comparer
  qu'en structurel (« Same role » seul) VIDAIT la cohorte — le filtre
  exigeait « partage une chip active » face à un ensemble vide. Corrigé :
  zéro chip active = critère effets DÉSACTIVÉ, cohorte structurelle seule.
  (2) Suggestion : lien ↗ vers la fiche du perso depuis chaque cadre —
  NOUVEL onglet, ouvrir la fiche ne doit pas perdre l'état de l'outil.

- **Ranking helper : second cadre de comparaison** (demande Sevih : « il ne
  faut pas perdre le focus du hero »). Cliquer un homologue n'écrase plus le
  perso discuté : sa fiche s'ouvre À CÔTÉ (grille 2 colonnes en large,
  empilée en mobile), avec ✕ pour fermer et « Focus » pour le promouvoir en
  principal. Anneau accent = perso discuté, anneau vert = comparé ;
  re-cliquer le même homologue ferme la comparaison. La fiche condensée est
  extraite en `HeroSheet`, partagée par les deux cadres.

- **Ranking helper : passe UI d'après capture Sevih.** (1) Fiche cassée —
  cause : le span racine de `CharacterPortrait` est `w-full`, lâché dans une
  rangée flex il avale toute la largeur → conteneurs à largeur FIXE autour
  de chaque portrait en rangée. (2) Les textes d'EE passaient BRUTS
  (`<color=#…>`, `\n` littéraux) → rendus via `GameText` (fiche) et
  nettoyés pour les tooltips natifs. (3) « Comparer les EE sans voir les
  effets des persos affichés est difficile » → en modes EE, les homologues
  deviennent des CARTES (portrait + nom + LEURS chips d'effets, partagées
  en surbrillance, texte complet de l'EE en tooltip) au lieu de portraits
  nus. (4) Demande complémentaire : filtres structurels dans TOUS les modes
  (+ « Same subclass » ajouté, `subClass` exposé dans la donnée et la
  fiche) — état séparé pour les modes EE, défaut VIDE (les effets font la
  cohorte, un Set partagé imposerait rôle+élément aux comparaisons EE).

- **Ranking helper : le vocabulaire « effets similaires » passe dans un
  GÉNÉRATEUR dédié** (`datagen/generators/ee-effects.ts` →
  `ee-effects.json`, décision Sevih : dériver des effets BRUTS des fichiers
  du jeu, pas des chips curées de la carte EE). Par porteur : clés
  normalisées `stat:<slug>:<dir>` (nom réel du jeu via `statNames` —
  « Penetration up »), `status:<id>` (id canonique du glossaire via
  `byTooltip`/`byLabel`), `<family>:<type>:<stat>` (mécanique adossée à une
  stat ≠ buff de la stat), `type:<type>` sinon. THROW si un EE n'a aucun
  effet comparable (preuve requise, pas de silence). 7 tests purs colocalisés
  (dont le cas d'origine Triaena/Frost Nova) ; l'app devient un lecteur bête
  du JSON — `eeCuratedChips`, ajouté le matin même pour l'approche chips,
  est RETIRÉ (equipment-detail restauré à l'identique). Promotion ciblée
  `--only ee-effects.json --apply` (124 porteurs).

## 2026-08-03

- **`/contribute/ranking-helper` livré** (item « outil pour aider au
  ranking », précisé par Sevih le 03/08 : pour ranker un perso sur Discord
  il faut le perso, son EE, ET où sont ses homologues dans le classement).
  Consultation pure — contrairement aux autres outils du hub, rien à
  exporter : l'outil JOINT des données déjà publiques (curé `rank`/`rankPvp`
  /`role`, `getEEViews` pour EE base/+10, tags) en une seule vue. On entre
  un perso → fiche condensée (élément/classe/rôle/tags, les 4 rangs, textes
  des passifs EE niv.1 et niv.10 aux valeurs MAX comme les tooltips) + ses
  homologues groupés par tier S→E dans le mode choisi (PvE/PvP/EE base/
  EE+10), cliquables pour pivoter. « Homologues » : en PvE/PvP, critères
  COMBINABLES (rôle/élément/classe, défaut rôle+élément — un critère sans
  valeur côté perso choisi est ignoré plutôt que de vider la cohorte) ; en
  modes EE, précision Sevih du 03/08 : la comparaison se fait par EFFETS
  SIMILAIRES — cohorte = porteurs d'un EE rangé partageant au moins une
  chip d'effet ACTIVE avec l'EE choisi (chips désactivables une à une,
  tooltip des homologues = effets partagés). Le vocabulaire est en DEUX
  couches : les chips nommées de la CARTE EE (curation `chipHide`/`chipAdd`
  appliquée — nouveau helper `eeCuratedChips` à côté d'`eeEditorChips`,
  corps commun factorisé), PLUS des clés synthétiques pour les effets
  structurés sans statut nommé (`stat:<slug>:<dir>` libellées via
  `statAbbr`, clés par type sinon). MESURÉ après le test Sevih sur Lambda :
  41 EE sur 124 n'ont AUCUNE chip nommée (« Penetration against bosses
  +30% » est un effet de stat muet) — sans la couche 2, un tiers du roster
  était incomparable et l'UI concluait à tort « pas d'EE ». Test de
  régression sur la donnée réelle : tout perso à EE a ≥1 chip, et Lambda
  (Triaena) partage `stat:pierce_power_rate:up` avec Snow core-fusion
  (Frost Nova). Anglais seul et noindex, comme tout `/contribute`.

- **Vraie page 404 localisée** (demande Sevih « on devrait pas aussi faire
  des vraies pages 404 ? ») : aucun `not-found.tsx` n'existait — chaque
  `notFound()` du site rendait la page par défaut de Next (anglais seul,
  sans header ni retour possible), et un lien court `/s/` mort renvoyait
  une réponse VIDE. Livré : `src/app/[lang]/not-found.tsx` rendue dans le
  layout (header/footer présents), 2 clés i18n neuves ×5 + réutilisation
  des clés nav pour les liens de sortie (accueil, persos, outils, guides).
  ASTUCE STRUCTURELLE : une not-found ne reçoit pas les params du segment —
  la langue vient du store à portée requête posé par le layout
  (`getRequestLang`). Les `/s/` morts redirigent maintenant vers l'accueil
  de l'hôte appelé (302 sans cache) au lieu de la page blanche.
  « Under construction » : RIEN à créer — la landing `/tools` a déjà ses
  badges (`coming-soon`/`hidden`/`unlisted`) et les cibles du header
  existent toutes ; le patron « badge sans lien mort » reste la règle.

- **Raccourcisseur branché sur les boutons « partager » des pages à état**
  (demande Sevih — solde l'item « bouton partager Discord »). INVENTAIRE des
  copies de lien : deux vrais consommateurs, le team-planner (lien `?z=`) et
  le browser de personnages (filtres dans l'URL, sync continue en 150 ms).
  Helper client `src/lib/short-share.ts` — fichier SÉPARÉ de
  `short-links.ts` (qui importe crypto/mysql2, interdit de bundle client) :
  rend `/s/<id>` si le serveur répond, sinon le lien long autoporté (même
  dégradation que le partage tier-list), et NE raccourcit PAS une URL sans
  query/hash (le canonique est déjà court, zéro ligne en BDD pour rien).
  NON branchés, à dessein : tier-list-maker (a déjà son `?s=` qui stocke le
  CONTENU — le doubler d'un `/s/` serait deux mécanismes pour le même
  bouton), ShareButtons des pages de contenu (URL canonique, rien à
  raccourcir), progress-tracker (copie un JSON d'état, pas un lien),
  damage-calculator (chantier d'un autre worker). Le rendu Discord vient des
  meta de la page cible après la 302 — rien à faire de plus.

- **CI rouge ×2 sur le commit du raccourcisseur — deux causes emboîtées,
  toutes deux réglées.** (1) Prettier NE CONVERGE PAS sur un code inline
  coupé en fin de ligne dans un item de liste Markdown : chaque `--write`
  déplace l'indentation de la ligne de suite sans jamais stabiliser — le
  pre-commit « formate » et commite de bonne foi, le `--check` de la CI
  refuse (run 30813507816). Fix : reformuler pour ne jamais couper un code
  inline ; vérifié `--write` idempotent + `--check` vert sur tout le repo.
  RÈGLE D'ÉCRITURE à retenir pour tous les .md du repo. (2) Le commit de fix
  ne touchait que du .md → `paths-ignore: ['**.md']` n'a RIEN déclenché, et
  re-lancer le run échoué aurait rejoué l'ancien commit : la prod restait
  coincée sans levier. Fix : `workflow_dispatch:` ajouté au workflow (les
  jobs docker/deploy l'acceptent), relance manuelle possible depuis
  l'onglet Actions.

- **Raccourcisseur interne `/s/[id]` livré** (idée actée 21/07, demande
  Sevih) : `POST /api/shortlink { path }` → `{ id }` (12 chars, hash sha256
  du chemin — même chemin ⇒ même id, upsert idempotent) et `GET /s/[id]` →
  302, calqués sur le partage tier-list (connexion éphémère `src/lib/db.ts`,
  `ensureTable` mémoïsé, 503 sans BDD → le client garde le lien long `?z=`).
  SÉCURITÉ : `isInternalPath` n'accepte que des chemins internes ASCII
  imprimable — refuse URL absolue, `//` protocol-relative, `\` (normalisé en
  `/` par les navigateurs), espaces/contrôles ; testé au niveau lib (6 tests,
  chaque trou serait un open redirect). PIÈGE ÉVITÉ : le proxy i18n aurait
  réécrit `/s/xyz` en `/{lang}/s/xyz` (route jamais atteinte) — `/s/` rejoint
  les exclusions ; la langue du lien partagé est portée par le SOUS-DOMAINE,
  le chemin stocké reste sans préfixe. Au passage : le rate-limiter par IP de
  la route tier-list est extrait en factory `src/lib/rate-limit.ts` (un quota
  par route), consommé par les deux POST. La table `short_links` se crée au
  premier appel. Reste au TODO : le bouton « partager » (Discord), premier
  consommateur envisagé.

- **pnpm épinglé 11.13.0 → 11.13.1 : la CI du commit SEO (run 30812484820)
  échouait dès `pnpm/action-setup`.** La release 11.13.0 est cassée côté npm
  (`@pnpm/exe` publié sans binaire) et pnpm la refuse désormais à
  l'installation — le poste local, qui l'avait déjà, continuait de tourner,
  d'où une CI rouge sans aucun rapport avec le contenu du commit. 11.13.1 est
  la republication réparée de la même version. Les 4 points d'épingle
  alignés : `packageManager` (source de vérité), Dockerfile (pin répété
  assumé), installation.md, init.ps1.

- **Lot SEO éditorial : 53 descriptions de guides dédupliquées + titles des
  pages générées enrichis** (items Sitebulb du 20/07, demande Sevih).
  INVENTAIRE D'ABORD, et il corrige le TODO : les familles réellement
  touchées étaient adventure (×20 « Boss strategy guide. »),
  dimensional-singularity (×14), world-boss (×6), special-request (×9) et
  irregular-extermination (×4) — adventure-license, que l'item soupçonnait,
  était déjà propre. 94 uniques sur 147 avant, **147/147 après** (re-mesuré).
  MÉTHODE : chaque description est SOURCÉE du guide lui-même (intro de
  content.json, tips tactiques, strings) — nom du boss depuis la donnée du
  jeu (×4 langues + EN pour le FR, convention du site), élément, et LA
  mécanique signature en accroche ; ×5 langues, ~120-160 caractères. Aucun
  nom de perso/allié inventé en CJK (seuls les noms présents dans
  monsters.json sont utilisés).
  TITLES (l'autre moitié du lot) : fiche perso = nom + le suffixe
  `sr_suffix` DÉJÀ localisé du h1 lecteur d'écran (« Ame — Outerplane Water
  Mage Guide ») ; fiche équipement = nom + type localisé via `model.kind`
  (7 clés i18n neuves ×5) ; outils = `page.tool.meta_title` passait de
  `'{title}'` nu à « {title} — Outerplane Tool ».
  ARBITRAGE ASSUMÉ : les descriptions d'outils (courtes) ne sont PAS
  gonflées — la même chaîne sert de sous-titre visible dans ToolShell et sur
  la landing ; découpler ou assumer reste au TODO avec la re-mesure Sitebulb.

- **CHANGELOG.md racine : GELÉ — l'item « resync ou assouplir » est tranché,
  assouplir.** Le retard mesuré au moment du gel : **422 commits** depuis la
  dernière écriture (17/07), après 216 relevés le 17/07 et 612 le 26/07 — la
  resync avait déjà raté deux fois, et re-raterait : la règle qui devait
  l'alimenter (checkbox du template PR) ne s'applique presque jamais, `main`
  recevant des commits directs par convention. Le journal que la convention
  APPLIQUE réellement — DONE.md dans le commit de chaque changement — est à
  jour, lui. Un journal par versions ne colle pas non plus au flux (pas de
  tag, pas de release, déploiement continu).
  FAIT : en-tête de gel dans CHANGELOG.md (pointe vers DONE.md, le log git et
  le /changelog public du site), l'instantané des ~130 premiers commits
  conservé tel quel ; checkbox du template PR remplacée par « DONE.md mis à
  jour dans le commit » ; CONVENTIONS (§ Commits et § Branches & PR) et README
  réalignés. RÉVERSIBLE : au premier tag, le fichier se reconstruit du log git
  — c'est pour ça que `pnpm commit` verrouille le format des messages (le
  commentaire de scripts/commit.ts le dit déjà, inchangé).

- **Gear reco, deux retouches d'affichage** (demande Sevih, validées à l'écran).
  (1) La barre de PRIORITÉ DES SUBSTATS porte l'icône de la stat avant son nom,
  au même gabarit que les main stats de l'EE. Tous les jetons réellement
  utilisés (`ATK`, `CHC`, `CHD`, `DEF%`, `DMG RED%`, `DMG UP%`…) sont des clés
  directes de `STAT_ICON` — vérifié sur la donnée, aucune normalisation requise.
  (2) Executioner's Charm s'affiche « +10 » DANS LES RECOS, et nulle part
  ailleurs. ⚠ CAS ÉDITORIAL ASSUMÉ, à NE PAS généraliser : cinq autres talismans
  gagnent eux aussi un passif au niveau 10 (Gladiator's, Rogue's, Sage's,
  Prophet's, Saint's Charm) et ne portent PAS la mention — arbitrage explicite de
  Sevih quand je l'ai signalé. Posé dans `resolveItem` (`lib/data/gear-reco.ts`),
  qui EST le résolveur des recos, et non dans `ItemRow` qui sert aussi au butin de
  donjon. Comparé au SLUG et pas au nom : le nom est déjà localisé au rendu, un
  test sur l'anglais n'aurait marché que sur la version EN du site.

- **Gear reco : le sélecteur ne propose plus l'objet d'une AUTRE classe**
  (signalé par Sevih) — sur un mage, choisir « Briareos's Ambition » enregistrait
  l'accessoire du STRIKER.
  CAUSE : quatre familles sont multi-classes (Briareos's Ambition / Recklessness,
  Gorgon's Vanity / Wrath), soit cinq objets DISTINCTS en jeu, un par classe.
  `familyOptions` n'en produisait qu'UNE option, portant l'id de TÊTE de famille
  (le striker) tout en annonçant les cinq classes : elle passait donc le filtre de
  classe de l'éditeur pour n'importe quel perso, et le select affichait un libellé
  sans suffixe — cinq objets réduits à une ligne indiscernable.
  Le modèle SAVAIT déjà : `memberClassVariant` prévient noir sur blanc que « la
  tête de famille ne représente pas les vues qui référencent un id précis (build
  curé, outils d'usage) ». Le constructeur d'options ignorait purement et
  simplement `classPassives`.
  CORRIGÉ À LA SOURCE. `classPassives` porte désormais l'id canonique du membre de
  chaque classe (le plus petit numériquement = l'objet de base, pas une copie
  pré-roulée `93xxx` de la Singularité — déterministe quel que soit l'ordre de
  `families.json`). `familyOptions` éclate alors une famille multi-classes en une
  option PAR classe : le bon id, son icône, sa restriction de classe SEULE — le
  filtre ne laisse plus passer que la bonne — et ses propres main stats, chaque
  classe ayant son pool (l'union de la famille était affichée jusqu'ici).
  MESURÉ AVANT DE CORRIGER : les 63 références existantes à un id de tête sont
  TOUTES sur des persos striker (7 persos), donc aucune donnée à réparer. NB : ma
  première mesure disait « 0 incohérente » parce que la jointure était fausse —
  `gear-reco.json` est keyé par ID de perso et les persos n'ont pas de `slug`,
  donc le lookup rendait `undefined` en silence. Refaite proprement.
  TESTS : cinq cas sur la donnée committée, dont l'invariant qui manquait — si
  l'objet pointé par une option est réservé à une classe, l'option doit annoncer
  CETTE classe et elle seule. C'est lui qui aurait attrapé le bug, et il attrapera
  la prochaine famille multi-classes ajoutée par un patch. 1259 tests verts.

- **Progress tracker : 2 masquages pilotés par les réglages + pastille de
  saison honnête** (item TODO du 03/08, demande Sevih).
  (1) Pack premium Veronica → la tâche « ad stamina » disparaît : le pack
  réclame la stamina des pubs automatiquement, plus rien à cocher. Même
  mécanique que la tour élémentaire (filtre dans `activeTaskIds`), et la
  description du réglage l'annonce (×5 langues).
  (2) Nouveau réglage Game « tous les héros réguliers en 6★ »
  (`hasAllRegularHeroesSixStar`) → la tâche doppelganger disparaît (elle ne
  sert qu'à cette montée). Réglage additif : les réglages stockés d'avant
  l'option se normalisent en `false` sans migration.
  (3) Question Sevih « jusqu'au 4 août, inclus ou exclu ? » : `battleEnd` est
  une borne EXCLUSIVE (minuit UTC — vérifié sur la saison 47 : fin
  04/08 00:00Z, soit les ~14 h restantes en jeu le 03/08). La pastille
  SeasonBadge affichait la date calendaire de la borne, promettant un jour de
  trop ; elle affiche désormais le DERNIER JOUR JOUABLE (date de
  battleEnd − 1 ms) — « jusqu'au 3 août », inclusif. Seul affichage de
  `battleEnd` du site (vérifié) ; la détection auto du tracker comparait déjà
  les bornes exactes, rien à corriger là.

## 2026-07-28

- **Garde perso dans `promote` : un perso non intégré ne part JAMAIS avec un
  `--apply`** (règle posée par Sevih le 28/07). Le jeu embarque les persos des
  patchs à venir : la proposition du jour portait `2400015` (sans nom → slug
  VIDE dans characters-slug-to-id) dans 5 fichiers, et un promote global
  l'aurait publié — en contradiction avec le contrat d'`integrate.ts` (« rien
  n'entre dans data/generated sans un clic dans l'admin »). Mesure préalable :
  la fuite avait DÉJÀ eu lieu pour `damage-scaling.json` et `progression.json`
  validés — le premier dry-run gardé l'a montré en les nettoyant.
  CHOIX D'EMPLACEMENT : pas de filtre générateur par générateur
  (damage-scaling et progression lisent chacun CharacterTemplet — la convention
  à recopier partout est la dette de demain), mais UN point d'étranglement là où
  la frontière extrait → validé se franchit : promote. « Non intégré » = clé du
  characters.json proposé absente du validé ; sans l'un des deux fichiers,
  aucun filtrage (on ne filtre que sur une preuve, comme lib/released.ts).
  DEUX ÉTAGES : (1) écartement GÉNÉRIQUE récursif — entrée de record dont la
  clé OU la valeur est un id non intégré — qui couvre les 5 fichiers du jour
  sans liste à tenir ; (2) VERROU : une réf qui survit (id dans un tableau,
  forme d'un futur générateur) refuse la promotion ENTIÈRE en nommant
  fichier + ids, bornes non-chiffre pour ne pas confondre `2400015` et
  `24000151`. Les écritures sont différées après le verrou : une promotion
  refusée ne laisse RIEN d'écrit (avant, l'apply écrivait au fil de l'eau).
  L'écran de revue nomme l'écarté à CHAQUE run, même quand les fichiers
  finissent identiques. 6 tests promote + 4 tests du cœur pur, suite à 24.

## 2026-07-26

- **`tags.test.ts` ne se bloque plus lui-même** (signalé par Sevih) — le test
  figeait des EFFECTIFS d'une donnée VIVANTE (`toHaveLength(47)` pour
  `ignore-defense`, plus les 4 catégories de bannière). Intégrer un perso le
  faisait donc échouer, le hook de pré-commit refusait le commit, et corriger le
  chiffre demandait justement de committer : impasse circulaire, vécue le 26/07 en
  pleine intégration.
  CE QU'UN COMPTE PROTÉGEAIT VRAIMENT, c'est que la détection ne s'effondre pas —
  un détecteur cassé rend 0 ou une poignée, pas 47. Un PLANCHER
  (`toBeGreaterThanOrEqual`) le dit aussi bien sans casser à chaque ajout. La
  justesse, elle, ne dépendait déjà d'aucun effectif : règle « taggé ⇔
  provenance », exclusivité des catégories de bannière, et surtout les cas
  ÉPINGLÉS NOMMÉMENT (Delta, Aer, Vlada, Francesca, Beth…) qui sont la mémoire des
  bugs — tout ça est intact.
  Ajouté en remplacement de ce que le compte gardait en creux : toute provenance
  de pénétration est une origine CONNUE (`kit`/`ee`/`transcend`), donc une
  nouvelle voie d'acquisition non modélisée fait sonner la suite au lieu de passer
  inaperçue. 19 cas (contre 18), suite complète à 1243 verts.
  Le POURQUOI est en tête de fichier : aucun effectif n'y est figé, délibérément.

- **Auto-traduction branchée sur l'éditeur du changelog** — `/admin/tools/changelog`
  était le dernier éditeur localisé sans bouton « Translate » : l'échafaudage de F4
  (`useAutoTranslate` + `TranslateButton`) couvrait six éditeurs, pas celui-là.
  Titres ET puces y passent désormais, l'anglais faisant foi comme partout.
  LE POINT DÉLICAT est que le contenu d'une entrée n'est pas un texte mais une
  LISTE de puces par langue. Choix retenu : UNE PUCE = UN enregistrement, aligné
  sur l'index de la puce anglaise. Surtout PAS un `join` par saut de ligne pour
  n'envoyer qu'un texte par entrée — rien ne garantit le nombre de lignes EN
  RETOUR : `PROTECT` (`translate-actions`) ne couvre pas le saut de ligne, Haiku
  ne le préserve que sur consigne de prompt, et l'appel DeepL ne passe ni
  `preserve_formatting` ni `splitting_tags`. Un redécoupage désaligné mélangerait
  les puces en silence. VÉRIFIÉ dans le code avant de trancher, pas déduit de
  l'en-tête du module — lui annonce les sauts de ligne comme préservés.
  Ce découpage ne coûte AUCUN appel de plus : le hook groupe tous les
  enregistrements périmés dans une seule requête.
  PIÈGE ÉVITÉ, celui qui aurait coûté du texte : reprojeter les puces d'une entrée
  NON traduite la réaligne sur la structure anglaise, donc supprime ses puces
  orphelines (une langue plus longue que l'EN). Silencieux, et sur une entrée que
  l'utilisateur n'a même pas fait traduire. `rebuiltContent` renvoie `null` quand
  rien n'a bougé — seule une entrée réellement traduite est reconstruite.
  Cœur pur dans `changelog/changelog-text.ts` (même convention que les quatre
  dossiers de F9), verrouillé par dix cas : alignement par index, langue plus
  courte que l'EN, entrée intacte qui garde ses orphelines, entrée traduite qui
  suit la structure anglaise.

- **Équipement : 2 bugs signalés par Sevih — jumelles de nom L/T et mains des
  variantes irregular** (vérifiés sur le RENDU réel avant tests, demande Sevih).
  (1) Resurrection Token / Clear Mind / Saint's Ring (+ Combination Simulator)
  affichaient DEUX restrictions de classe : TYPO DANS LA DONNÉE DU JEU — le
  palier 2★ des accessoires uniques Lumière/Ténèbres (1181–1190, série
  reconnaissable à son UniqueOptionID 2016–2025 constant du 1★ au 6★) a 8 clés de
  nom mal numérotées (`_2_8.._2_15` = les clés des accessoires CLASSIQUES au lieu
  de `_2_18.._2_25`). « Physical Exorcism 2★ » (ranger) s'appelait donc
  « Resurrection Token » et fusionnait dans la famille healer. Réparé au
  générateur (`MISNAMED_LD_2STAR` : reprise de la clé d'un frère de série via
  l'UO) — les 4 familles polluées redeviennent mono-classe ET les 8 familles L/T
  récupèrent leur palier 2★ manquant ([1,3,4,5,6] → [1..6]). Gelé par 3 cas dans
  `equipment.test.ts` (17/17).
  (2) Briareos's Ambition / Gorgon's Vanity : chaque variante de classe a SON
  pool de mains (ranger 2454 vs 2354 chez Briareos ; mage 2354 vs 2454 chez
  Gorgon) mais le site affichait autre chose — la FICHE prenait les mains du top
  de famille (le striker), et les CARTES de /equipment l'UNION des pools des 5
  classes (12 stats, capture Sevih). Corrigé aux deux niveaux : `gearModel`
  (fiche de variante → main/sub de SA ligne top) et `materializeFamilies` +
  `page.tsx` (`classPassives[].mainStats` par classe, la carte de variante
  l'utilise ; l'union reste pour les familles à variante PAR main stat, où elle
  est la bonne sémantique). Vérifié en rendant cartes ET fiches réelles :
  chaque variante ses 6 stats, classiques inchangés. Regen ciblée
  accessory/families uniquement (le contenu Epsilon frais du parsed N'EST PAS
  embarqué). TSC datagen + racine verts.
  SUITE (question Sevih « tous les consommateurs ? ») — balayage EXHAUSTIF de
  `mainStats`/`classPassives`/`getEquipmentDetail` : 2 consommateurs publics
  portaient encore l'union — `gear-usage-finder` (mains par variante) et
  `resolveLootGear` (MiniCards de butin des guides : mains ET valeurs max, qui
  seraient sorties VIDES avec les mains de la variante lues sur le pool du top
  de famille → `maxEntry` = top de SA classe). Corrigés et VÉRIFIÉS en exécutant
  les deux sur la vraie donnée (drop `9921795` compris). Sains d'office :
  bot-api (n'expose pas les mains), carte EE (pas de variantes), rewards (par id
  brut), damage-calculator (passifs seuls). ⚠ RESTE côté WORKER (admin, pas
  touché) : `GearDetail.tsx` affiche l'union de famille, `gear-options.ts` la
  propose au picker gear-reco — `classPassives[].mainStats` est dispo pour les
  brancher. GARDE-FOU anti-contamination ajouté (réponse au « un accessoire qui
  merde ne devrait pas taper sur un autre ») : le regroupement par NOM est la
  seule jointure que la donnée du jeu offre (aucun FamilyID) — un test épingle
  donc l'ensemble EXACT des familles multi-classes légitimes (les 4 sets
  irregular à 5 classes) ; toute famille qui gagne une classe fait sonner la
  suite (18/18).

- **Damage Calculator : UI POSÉE sur le site (phase UI seule, `unlisted`)** —
  wrapper serveur + client (`tools/_contents/damage-calculator/`), moteur PAS
  branché (rapport à « — »). Décisions produit intégrées au fil de la revue
  Sevih : stats saisies = fiche du jeu, mais on ne DEMANDE que celles qui
  pilotent les dégâts du perso choisi — faits dérivés des kits par le NOUVEAU
  générateur `datagen/generators/damage-scaling.ts` (swap d'ATK
  `BT_SWAP_STAT_ATTACK` → HP/DEF-scalers, scalings annexes `BT_DMG_OWNER_STAT`
  (SPD/HP/DEF/CHC/EFF), dégâts lost-HP, DoT → EFF), promotion ciblée
  `--only damage-scaling.json`. RES/lifesteal écartés (ne touchent pas les
  dégâts), CHC seulement si le kit scale dessus (le crit du rapport est un
  interrupteur), PEN % et DMG UP % sont des lignes de la fiche (le Penetration
  Set passe par la saisie). Sets whitelist combat (Revenge/Patience/
  Pulverization/Swiftness/Weakness/Augmentation), talisman réduit au Rogue's
  Charm, armes/accessoires filtrés par classe, chain/dual hors calc, quirks
  OFFENSIFS de compte en réglage localStorage (onglet Settings). Les arbres de
  quirks du guide sont devenus un module partagé `src/components/quirks/`.
  Presets de cible : TOUS les donjons peuplés d'`encounters.json` (1671 cibles,
  13 modes, monad exclu) — payload ~730 Ko à optimiser quand le besoin sera figé.

- **Passifs +10 FANTÔMES purgés (talismans Adventurer + EE Eclipse)** — Sharp &
  Powerful Adventurer's Talisman affichaient un passif « +10 : Recovers [Value]
  Action Points when using an ultimate » — placeholder `[Value]` non substitué.
  VÉRIFIÉ en jeu (Sevih) : ces deux-là n'ont PAS de passif au +10. La donnée le
  reflétait déjà (les Unique Options `5101`/`5102` n'ont AUCUN buff en source),
  mais le générateur émettait quand même la ref, et le rendu
  (`equipment-detail.ts:325` renvoie le desc BRUT quand `values` est vide) sortait
  la ligne fantôme avec `[Value]`. Correctif À LA SOURCE : `resolvePassiveRefs`
  (`generators/equipment.ts`) n'émet plus une Unique Option sans buff/valeur/effet
  — ni comme ref d'équipement, ni comme définition dans `passives.json`. Mesuré :
  **3 passifs vides sur 411** — `5101`/`5102` (les 2 talismans) et `2100078`, même
  signature vide, porté au +10 par l'**EE Eclipse** (nettoyé du même coup ; le
  `[Value]` y était faux de toute façon — un contrôle en jeu confirmerait qu'Eclipse
  n'a pas non plus de +10). Regen équipement ciblé (`talisman`/`passives`/`ee.json`),
  diff prouvé chirurgical (aucune autre dérive). TSC datagen vert, 439/439.

- **Locales : pré-seed V2 TERMINÉ — 150 clés orphelines purgées ×5 langues,
  contrat gardé par TEST** (`src/i18n/locales/keys.test.ts`, commit e219d55).
  L'item offrait « documenter ou parquer » ; la mesure a tranché mieux : après
  la bascule il ne restait plus de pré-seed légitime, juste des VESTIGES (la
  page V3 consomme d'autres clés que celles transplantées de la V2 —
  `coupons.redeem.*` 27 clés vs les clés plates de `/coupons`,
  `characters.filters.*` vs `filters.*`, `common.sort`, `monad.route`,
  `sys.rarity`, `tower.*`…). Le test garde DEUX invariants : clés identiques
  ×5 langues, et chaque clé EN a un consommateur — littéral OU préfixe
  dynamique EXTRAIT du code (`t(\`tools.${'{'}slug}\`)`, concat `'xxx.' +`),
donc un refactor qui supprime le consommateur ré-expose ses clés. « Clé
inutilisée » est redevenu un signal bloquant. En covoiturage assumé (choix
Sevih) : les clés `tools.damage-calculator.*`du chantier parallèle,
cohérentes ×5 et couvertes par le préfixe`tools.`.

- **Visuels d'événement sur R2 : item FERMÉ sans rien pousser** — l'item demandait
  de lancer `pnpm images` pour collecter `images/events/**`. Vérifié AVANT d'agir,
  et c'était périmé : les 2 événements curés référencent 2 visuels, tous deux
  présents dans le pool `data/editorial/events/`, et les 4 clés
  (`default.webp`/`.png`, `gtfo.webp`/`.png` — la variante PNG est la carte de
  partage) sont tracées dans `pushed.json` ET servies en HTTP 200 par
  `img.outerpedia.com`. Zéro asset en attente. Aucune référence du curé ne pointe
  vers un fichier absent du pool.
  DEUX ERREURS DANS L'ÉNONCÉ DE L'ITEM, corrigées au passage. La collecte des
  événements ne vit pas dans `collect.ts` (qui n'indexe que les sprites du JEU
  depuis `.gamedata/extracted/images`) mais dans `manifest.ts`, en DATA-DRIVEN sur
  le curé : ajouter un événement en admin suffit, aucune liste d'assets à tenir.
  Et `pnpm images` n'est pas « la commande des événements » : elle enchaîne
  collect + audio + wallpapers + comics + push, donc elle aurait poussé TOUT ce
  qui traîne en attente. La lancer pour cet item aurait été une opération de
  production pour un gain nul.

- **Éditeur assisté validé en dev, et un doublon de clé React corrigé au
  passage** — validation dev de Sevih : le geste d'édition de **F5** et les **4
  éditeurs de F9** sont bons (les deux ⚠ ci-dessous tombent). L'éditeur assisté,
  lui, portait encore un vrai bug : React « two children with the same key,
  `BT_AP_CHARGE` » dans le picker d'`InlineTextField`, vu depuis
  `CharacterGroups`/`RecoGroups`.
  CAUSE : la dédup posée le 24/07 se fait par APPARENCE (nom + icône + desc).
  Elle garantit l'unicité de la SIGNATURE, pas celle de la CLÉ — or
  `InlineTextField` keye ses options par la clé. La boucle parcourait les IDS, et
  plusieurs ids réclament la même clé : `BT_AP_CHARGE` est revendiquée par le
  glossaire DES DEUX CÔTÉS (`SYS_BUFF_CHARGE_CP` en buff, `SYS_BUFF_REDUCE_AP` en
  debuff) et par trois effets curés. Chaque id apportant son apparence, plusieurs
  entrées survivaient avec la même `value`.
  CORRECTIF À LA SOURCE : on itère les CLÉS, dédoublonnées DANS le helper, et
  chaque clé est étiquetée par ce que `resolveEffectKey` résout réellement
  (glossaire du côté demandé, puis côté opposé, puis curé). Ça corrige au passage
  un MENSONGE : le picker affichait l'apparence de l'id qui avait introduit la
  clé, pas celle que le tag rend. Effet de bord assumé — quelques étiquettes du
  picker changent, elles sont désormais exactes.
  MA PREMIÈRE VERSION NE TENAIT PAS : j'avais déplacé la dédup côté clés mais
  laissé le helper faire confiance à l'appelant. Le test l'a refusée — soit
  exactement la classe d'invariant implicite qui a causé le bug. L'unicité est
  maintenant structurelle, elle ne dépend plus de la vigilance de l'appelant.
  TESTS : dix cas de plus, huit sur le cœur pur et deux sur la DONNÉE RÉELLE
  (garde anti-vide, puis unicité des `value` sur les 13 listes) — le second est le
  seul capable d'attraper une clé nouvellement partagée, comme celle-ci l'a été.
  1224 tests verts (110 fichiers).

- **F2 (2/2) : la frontière `admin/` devient BLOQUANTE, dans les deux sens** —
  arbitrage tranché avec Sevih, et ni l'une ni l'autre des deux options de
  l'audit : « documenter » ne bloque rien (un commentaire en tête de dossier
  vieillit, et le jour où il mentira sera précisément le jour de l'incident), et
  l'extraction complète vers `lib/editorial/` demandait une fermeture transitive
  que je ne pouvais pas chiffrer honnêtement d'avance.
  TROISIÈME VOIE : `no-restricted-imports` avec liste blanche — coût de
  « documenter », mais la liste devient EXÉCUTABLE, donc incapable de mentir. Le
  repo faisait déjà ça pour l'architecture (tokens de couleur, et
  `react-hooks/static-components` qui a refusé un `ShopNoteRow` le 24/07) ; c'est
  son idiome, pas une nouveauté.
  RÈGLE 1, vers l'extérieur : hors `admin/` et hors `.dev.*`, seuls 6 modules
  `admin/` sont importables (`ADMIN_SHIPS_TO_PROD`). `allowTypeImports` couvre
  gratuitement les 4 traversées en `import type`, qui ne peuvent rien embarquer.
  RÈGLE 2, vers l'intérieur — ET C'EST ELLE QUI AURAIT ATTRAPÉ LE VRAI BUG : la
  règle 1 ne voit rien de ce qui se passe DANS `admin/`, or le fil trouvé ce jour
  était interne. Les deux dossiers de briques partagées (`editorial/`,
  `premium-limited/`) portent donc l'invariant « tout ce qui vit ici ship », et il
  leur est interdit d'importer un secret ou un module dont la sûreté tient à
  `IS_DEV`. `*-actions` étant la convention de nommage des server actions, un
  nouveau module d'actions est couvert d'office ; seule exception,
  `inline-preview-actions`, délibérément publique.
  PIÈGE GITIGNORE, trouvé en le mesurant : une exception `!` ne réinclut PAS un
  fichier dont un dossier parent est matché. `@/components/admin/**` matchait le
  dossier `editorial`, donc les deux outils publics nichés restaient bloqués
  MALGRÉ leur présence dans la liste. Corrigé en ne matchant que des FICHIERS
  (`*/*`, jamais de motif sur un ancêtre) — documenté dans la config, c'est le
  genre de subtilité qui se re-perd.
  LES DEUX RÈGLES SONT PASSÉES AU CANARI, parce qu'un garde-fou qui ne se
  déclenche pas est pire que pas de garde-fou : vérifié qu'elles refusent bien une
  vraie violation et laissent passer l'exception assumée.
  `premium-limited-translate.ts` remonté HORS de `premium-limited/` : l'y laisser
  aurait obligé à percer une exception dans la règle 2 dès le premier jour, donc à
  rendre l'invariant du dossier faux immédiatement.
  Enfin `lib/data/item-catalog.ts` ne s'annonce plus « Vue ADMIN » alors que la
  home publique le consomme — l'étiquette qui invite à y glisser une hypothèse
  dev-only. eslint, tsc et prettier verts, 1214 tests.
  ⚠ `docs/TODO.md` NON touché : il portait une note non committée de Sevih (descs
  buggées des talismans Adventurer's). La ligne F2 y reste donc à retirer.

- **F2 (1/2) : les pages `/contribute` publiques ne tirent plus la couche de
  traduction** — en rouvrant la donnée de F2 avant d'arbitrer, la frontière s'est
  révélée plus PETITE que l'audit le disait : sur les 13 imports hors-admin, **4
  sont des `import type`** (effacés à la compilation) et `IS_DEV` est une
  constante. Ce qui ship vraiment tient en 5 modules + 2 composants clients.
  MAIS un fil reliait le public aux clés API. `PremiumLimitedParts` — le module
  de briques PARTAGÉ avec les outils publics de contribution — importait
  `autoTranslate` pour la seule `translateReviews`, et les deux outils publics
  importent ce module (`downloadJson`, `ReviewForm`, `emptyReview`). Le graphe de
  modules des TROIS pages `/contribute` publiques incluait donc
  `translate-actions`, qui lit `DEEPL_API_KEY` et `ANTHROPIC_API_KEY`.
  VÉRIFIÉ, RIEN NE FUYAIT : le corps d'une server action ne part jamais au
  navigateur (seule une référence y va), la garde `IS_DEV` la rend inerte en prod,
  et `translateReviews` n'a qu'un appelant, `PremiumLimitedEditor` (dev) — donc
  pas de bouton mort chez les contributeurs non plus.
  C'EST EXACTEMENT LA THÈSE DE F2, rendue concrète : la sûreté ne tenait qu'à une
  garde posée dans un module que personne ne croyait public. Un fichier `admin/`
  qui ship, c'est l'endroit où quelqu'un ajoutera une hypothèse dev-only.
  `translateReviews` isolée dans `premium-limited/premium-translate.ts`
  (admin-only) ; l'arête n'existe plus. Les 9 importateurs restants de
  `translate-actions` sont tous des éditeurs admin, aucun dans le graphe public.
  L'en-tête de `PremiumLimitedParts` porte désormais la RÈGLE : ce module ship
  malgré son chemin, rien ici ne doit importer un secret ni dépendre d'`IS_DEV`.
  Déplacement PUR, aucun comportement changé. 1214 tests verts (109 fichiers).

- **F9 : taille des 4 éditeurs admin** — `3464 → 2240` lignes cumulées, en
  sortant les briques dans un dossier par éditeur (`guide/`, `events/`, `shop/`,
  `gear/` — convention déjà en place avec `editorial/` et `premium-limited/`) :
  `GuideEditor` 1121 → 911, `EventsEditor` 890 → 449, `ShopPrioritiesEditor`
  725 → 242, `GearRecoEditor` 728 → 638.
  NB : `GuideEditor` était remonté à 1121 (au-dessus des 1002 de l'audit) parce
  que **F5 l'avait allongé de ~120 lignes** — le refactor rattrape ça en plus.
  CE N'EST PAS DU RANGEMENT, c'est une protection. Ces composants doivent vivre
  au niveau MODULE : déclarés dans le corps de l'éditeur, leur identité change à
  chaque rendu et React démonte puis remonte tout leur sous-arbre à CHAQUE frappe
  — le champ perd le focus et chaque aperçu repart. C'est le bug vécu le 24/07, et
  la surface exacte que F9 visait. `ShopPrioritiesEditor` le DISAIT déjà en tête
  de fichier (« sinon remontage → perte de focus ») : dans un fichier séparé,
  l'erreur devient impossible à commettre par distraction.
  LE VRAI GAIN est la testabilité des cœurs purs ainsi dégagés — **+37 cas** :
  `guide-text` (15) verrouille la règle la moins évidente de l'éditeur de guides,
  **l'ANGLAIS est la STRUCTURE** (éditer le bloc EN ajoute/retire des entrées ;
  éditer une autre langue ne fait que remplir des traductions par index — sans
  cette asymétrie, traduire un guide en FR pourrait en supprimer des conseils) ;
  `event-text` (13) verrouille la RÉFÉRENCE (les valeurs rendues sont les objets
  eux-mêmes, `applyTranslation` écrit dedans — des copies casseraient la
  traduction en silence) et la COUVERTURE, un cas par forme de bloc puisqu'un type
  oublié dans la collecte ne serait jamais traduit ; `shop-text` (9) verrouille la
  référence et le FILTRE PAR L'ANGLAIS (un texte sans EN n'a rien à traduire).
  `GearRecoEditor` rend volontairement moins : sa logique (édition de tuiles,
  import de build, résolution debouncée) est indissociable de son état, l'extraire
  demanderait dix props pour un gain douteux et un risque que je ne peux pas
  vérifier à l'écran. Seules les briques autonomes sortent.
  Déplacements PURS : aucune prop ni comportement modifié. 1212 tests verts (108
  fichiers). VALIDÉ EN DEV le 26/07 par Sevih, comme F5.
  Commits `64dc6ff`, `e158f5b`, `9b751eb`, `9a27cb2`.

- **F7-reste : le 10ᵉ store passe sous verrou** — `item-curated-store` était le
  seul store à merge par CLÉ non protégé par `withStoreLock` : il était en pleine
  refonte côté datagen (F11) au moment de F7, et je n'allais pas éditer un fichier
  que quelqu'un d'autre tenait. Rattrapé une fois son travail committé — son F11 a
  bien préservé la validation et le tri numérique posés par F10. +1 cas dans
  `store-concurrency.test.ts`. **F1–F11 : backlog d'audit admin clos**, hors F2
  (arbitrage archi).

- **E5 : collision de basename au flatten audio rendue VISIBLE** — `extract-audio.ts`
  remonte les WAV nichés à plat, mais si deux partagent le basename, le second
  restait niché et le `readdirSync` NON récursif l'ignorait → piste perdue **sans
  la moindre trace**. Rare (noms BGM uniques en pratique) mais silencieux. Ajout
  d'un `console.warn` sur la collision (coût nul, comportement inchangé : on
  n'écrase toujours pas l'existant). Ferme le dernier quick-win ouvert du volet
  extraction —
  E8 (sécurité shell) et X4/X5 (diff négligeable, clés inattendues assumées) sont
  « rien à faire » par verdict d'audit. TSC datagen vert.

- **F7 : plus de perte d'écriture entre deux onglets** (`3d92d9f`) — le bug a été
  MESURÉ avant d'être corrigé, et il était réel : deux `upsertCharacterCurated`
  concurrents sur deux persos DIFFÉRENTS ne laissaient qu'une seule entrée dans
  `characters.json`, l'autre évaporée, les deux appels répondant « OK ».
  LA CAUSE est un point de suspension véritable. Un store fait `readAll()` →
  modifier → `await writeJson()`, et `writeJson` FORMATE avant d'écrire
  (`await formatJson`, qui passe par prettier). Entre la lecture et l'écriture,
  une autre requête du même processus se glisse : A lit `{}`, rend la main au
  formatage, B lit `{}` à son tour, A écrit `{stella}`, B écrit `{tamamo}` — et
  l'écriture de A est perdue. ⚠ À NE PAS confondre avec F1 : là, l'entrelacement
  intra-processus était IMPOSSIBLE (`writeFileSync` puis `renameSync`, synchrones,
  rien entre eux) et je m'étais trompé en l'affirmant ; ici l'`await` existe
  vraiment. D'où la démonstration empirique avant d'écrire une ligne de correctif.
  LE REMÈDE : `withStoreLock(fichier, fn)`, une file d'attente en mémoire par
  fichier, appliquée aux **9 stores dont le merge est par CLÉ** (characters,
  effects, equipment, gear-reco, search-aliases, short-names, les deux kits,
  l'overlay shop). C'est sur l'overlay shop que la perte coûtait le plus cher : il
  PRÉSERVE les slugs hors rotation, donc deux enregistrements se rendaient
  mutuellement leurs priorités invisibles — constat qu'on n'aurait fait que des
  semaines plus tard, au retour du produit en boutique.
  PORTÉE ASSUMÉE : un seul processus (les deux onglets parlent au même serveur
  dev). Deux PROCESSUS (dev + CLI datagen) demanderaient un verrou sur disque,
  hors de proportion pour un outil local mono-utilisateur — et F1 garantit déjà
  qu'aucun des deux ne laisse de fichier tronqué. Les stores qui REMPLACENT le
  fichier entier (changelog, events, coupons/bannières, presets) ne sont pas
  concernés : l'éditeur y envoie la liste complète qu'il a chargée, le dernier
  écrase par construction — il faudrait une détection de version côté UI, autre
  sujet. Un échec ne gèle pas la file (testé) : sinon un enregistrement refusé
  bloquerait toutes les écritures suivantes jusqu'au redémarrage.
  **+16 cas** (1160 tests). `item-curated-store` est le seul store par clé NON
  protégé — il était en cours de modification par l'agent datagen (F11) ; à
  reprendre une fois son travail committé.

- **F5 : aperçus au montage — un seul champ éditable à la fois** — `InlineTextField`
  lance son aperçu dans un `useEffect` dépendant de `[value, lang, previewMode]` :
  il part donc AU MONTAGE, sans frappe. Là où un champ est monté PAR ÉLÉMENT de
  liste, ça fait autant d'allers-retours serveur à la simple ouverture de la page.
  Remède : l'idiome qui existait déjà dans le repo (`EditorialFields`,
  `CharacterGroups`) — un état `editing`, UN seul `InlineTextField` monté, les
  autres rendus au repos depuis UN `renderInlineBatch` debouncé (250 ms),
  cliquables pour passer en édition.
  MESURE, qui corrige mon propre audit sur deux points : F5 annonçait « au plus 3
  équipes par guide », la donnée réelle en montre **5** (73 équipes sur 25
  fichiers) ; et il citait UN site par éditeur alors qu'il y en a **trois** —
  `FreeHeroesEditor` monte aussi un champ par SOURCE (11) en plus des raisons (13),
  soit **24 aperçus** à l'ouverture, et `GuideEditor` a un troisième site en liste
  (mode `named`, notes multi-paragraphes) que l'audit ne listait pas. Les trois
  sites sont traités.
  DÉTAILS qui comptent : les clés d'édition portent l'INDEX, donc supprimer une
  source/entrée/équipe ou changer de version en sort explicitement (sinon on
  éditerait la ligne voisine) — d'où `goToVersion` plutôt qu'un effet, la règle
  `react-hooks/set-state-in-effect` interdisant le `setState` en effet. Le rendu au
  repos du mode `named` reprend la même liste à puces que l'aperçu du champ, pour
  que passer en édition ne déplace rien. `RestingText` / `RestingNote` /
  `RestingNoteList` sont au niveau module (`react-hooks/static-components`, cf. le
  bloc d'avertissement en tête de `GuideEditor`).
  SEUL item de la série qui CHANGE UN GESTE d'édition — VALIDÉ EN DEV le 26/07
  par Sevih.
  TSC / eslint / prettier verts, 1159 tests inchangés.

- **F11 : type `ItemCurated` unifié — fin de la « forme miroir »** — le contrat de
  l'override d'item était DUPLIQUÉ entre le store admin (`item-curated-store.ts`,
  qui ÉCRIT le curé) et le générateur (`generators/item-catalog.ts`, qui le LIT et
  le bake) : deux `interface ItemCurated` identiques mais que rien ne tenait
  ensemble — le curé écrit d'un côté, lu de l'autre, sans garde-fou de forme
  partagée. Contrat + validation déplacés dans **`datagen/curated/items.ts`**
  (source UNIQUE, comme character/effects/equipment/gear-reco) : `interface
ItemCurated`, `itemCuratedSchema`, `validateItemCurated`. Le store le ré-exporte
  (ses consommateurs — route admin, overlay live, bake — le tiraient de là) ; le
  générateur l'importe. `LangDict` étant le MÊME type des deux côtés (`@contracts`
  ré-exporte `datagen/lib/lang`), l'unification est sans risque de divergence.
  Aucun comportement changé (mêmes champs, même schéma). TSC datagen + racine
  verts, 439/439 datagen + tests store inchangés.

- **F10 : les trois divergences de socle des stores, corrigées** — issues des
  constats faits en écrivant F8. **+27 cas** (1159 tests, 103 fichiers).
  SÉRIALISEUR : `gear-presets-store` passe à `writeJson` — il était le SEUL des 16
  à écrire en `writeFileSync` + `JSON.stringify` nu. Deux gains, tous deux
  vécus ailleurs : l'ATOMICITÉ (une interruption y laissait un JSON tronqué, que
  `readCuratedJson` refuse ensuite en levant → `pnpm dev` et build bloqués ; c'est
  le trou que F1 avait manqué en annonçant couvrir « les ~53 sites d'écriture »),
  et le FORMAT canonique (le fichier committé est déjà au format prettier, donc le
  store écrivait éclaté et le hook pre-commit ramassait derrière : chaque édition
  d'UN preset diffait tout le fichier). `saveGearPresets` devient async, son unique
  appelant est la route.
  VALIDATION : `promo-banner-store` n'en avait AUCUNE alors que sa sauvegarde
  PUBLIE sur R2 — un coupon cassé partait en prod sans redéploiement, exactement
  l'argument qui avait motivé celle d'`events-store`. Ajout de `validateCoupons`
  et `validateBanners` (cœurs purs testés) : code requis et UNIQUE (c'est
  l'identité de l'entrée — deux lignes pour un code et la période affichée devient
  un tirage au sort), dates `YYYY-MM-DD` ordonnables en texte, fin après début, au
  moins une récompense. PAS d'unicité sur l'id de bannière : un perso revient
  légitimement en rerun. Les règles ont été calibrées SUR LA DONNÉE COMMITTÉE
  avant d'être écrites (91 coupons, 48 bannières relus : tous passent, dont 19
  bannières en rerun) — sans quoi la validation aurait bloqué la première
  sauvegarde. `item-curated-store` non plus ne validait rien et renvoyait `void` :
  schéma ajouté, l'enjeu étant direct (la route rebake dans la foulée, donc un
  `hidden: "true"` ou un nom en chaîne partait dans le catalogue SERVI).
  TRI : `curated-store` et `item-curated-store` alignés sur `numeric: true`.
  Vérifié avant : ZÉRO changement d'ordre sur les 123 + 23 clés committées (ids
  textuels) — c'est de la cohérence préventive, pas un bug corrigé.
  Les trois routes concernées renvoient désormais `400 { ok, errors }` ; aucun
  composant à toucher — `postJson` jette déjà une `Error` construite depuis
  `errors[]` et les éditeurs ont leur `try/catch` (dividende de F3).
  Constat reporté en **F11** : le type `ItemCurated` est dupliqué entre
  `item-curated-store` et `datagen/generators/item-catalog` — non touché, c'est le
  périmètre datagen.

- **F8 : tests des 16 stores qui écrivent** — les 14 non couverts le sont
  désormais (events et guide l'étaient déjà), **+178 cas** (1132 tests au total,
  102 fichiers). Ce que ça verrouille n'est PAS la validation (elle vit dans
  `datagen/curated/*` et avait déjà ses tests) mais le **read-merge-write** :
  c'est là qu'une régression perd de la curation en silence, sans qu'aucun test de
  schéma ne bronche et sans rien casser au rendu.
  APPROCHE : plutôt que de mocker `writeJson` (ce qui n'aurait rien dit du merge),
  `process.cwd()` est redirigé vers un dossier temporaire AVANT l'import du store —
  les chemins étant résolus au chargement du module, tout le geste réel est
  exercé (vraie lecture, vrai `writeJson` atomique, vrai format canonique) sans
  jamais toucher `data/curated/` du repo. L'échafaudage est mutualisé dans
  `src/lib/admin/store-fixture.ts` (`sandbox()`), avec l'ordre d'appel obligatoire
  documenté en tête — le piège de la session précédente (un test de `guide-store`
  qui avait créé un VRAI répertoire) ne peut plus se reproduire par construction.
  INVARIANTS COUVERTS, store par store : préservation des clés voisines, entrée
  vide qui supprime la clé, remplacement (et non fusion) de l'entrée éditée,
  écriture TOUT-OU-RIEN quand la validation échoue (vérifiée octet pour octet :
  ni écriture partielle, ni reformatage), tri stable, zéro `.tmp` résiduel. Plus
  les cas propres à chacun : les kits JUMEAUX de `chipOwner` (poser un porteur
  pour un kit préserve les candidats des autres monstres), les slugs HORS ROTATION
  de l'overlay shop (le cas qui justifie le merge), le `source` d'une entrée EE
  qu'un éditeur hors périmètre ne doit pas effacer, les clés `_doc` de trois
  fichiers, la recompression des builds vers `$preset` de gear-reco, le garde-fou
  de références de gear-presets (refus de retirer un preset encore cité), et
  l'exception `unreleased` sans laquelle la contribution anticipée de Shiraen
  serait impossible à enregistrer. Deux générateurs hors périmètre sont mockés
  (`buildShopPriorities`, la data persos) : ils ont leurs propres tests.
  CONSTATS relevés en écrivant les tests, verrouillés par des cas qui DÉCRIVENT
  l'état actuel plutôt que de le cautionner — reportés en TODO (**F10**) :
  `gear-presets-store` est le SEUL des 16 à écrire hors du sérialiseur canonique
  (`writeFileSync` + `JSON.stringify` nu), donc ni atomique ni au format commun —
  ce qui corrige au passage une phrase trop large de F1 (« ce seul point couvre
  les ~53 sites d'écriture ») : il en restait un ; `item-curated-store` et
  `promo-banner-store` n'ont AUCUNE validation (le second accepte un code en
  double et des dates illisibles, là où `events-store` refuse un slug en double) ;
  et le tri diverge entre stores (`numeric: true` chez cinq, absent chez deux).
  TSC vert, eslint vert, prettier vert.

- **E7 : blocklist wallpapers MESURÉE sur le pool réel (puis documentée + gelée)** —
  la crainte de l'audit (« ~50 regex verbatim V2, partiellement redondantes avec la
  catégorisation ») est TRANCHÉE par la donnée, pas par l'intuition. Mesure sur les
  **17 380 PNG** extraits (script jetable, lecture seule) du recouvrement blocklist ∩
  catégorisation, par motif, avec la métrique « seul rempart d'un wallpaper » :
  la blocklist **RATTRAPE 952** images pourtant catégorisables ≥ 250px (surtout des
  2048×1024 happées par la règle Full) qui, sans elle, fuiraient dans la sortie
  (497 vrais wallpapers ↔ 1449 candidats). La catégorisation n'est **pas** un
  sur-ensemble → la vider serait un BUG. Décomposition : **11 porteurs** (seul
  rempart d'≥ 1 wallpaper : `^T_Banner_` 80, `^LOADING_` 64, `^T_Event_World_` 36,
  `_(d|body|cloud|a)` 21, `#` 10…), **12 inertes** (0 match — assurance héritée V2,
  familles de textures/UI absentes du pool V3), **26 redondants individuellement**
  (matchent mais jamais seuls ; recouvrement croisé → pas d'élagage en bloc sans
  re-mesure). LIVRÉ : le POURQUOI mesuré consigné en tête de la blocklist (fin du
  « verbatim V2 » inexpliqué = le vrai passif d'E7) + **1 test** qui gèle le
  comportement porteur (nom catégorisable Full MAIS exclu, pour 5 motifs) contre un
  futur « nettoyage » silencieux. Aucun motif supprimé : l'élagage effectif des 12
  inertes est de l'assurance non nulle → laissé à l'arbitrage Sevih plutôt que
  tranché seul. TSC datagen vert, 439/439.

- **E6 : parallélisme borné de la dédup wallpapers** — les deux passes `sharp` de
  `extract-wallpapers.ts` (`scanAndFilter` lisait les dimensions fichier par
  fichier, `detectDuplicates` hashait fichier par fichier) étaient SÉRIALISÉES sur
  un grand pool. Nouveau helper pur **`lib/concurrency.mapLimit(items, limit, fn)`**
  — mini-pool sans dépendance externe (le repo n'en a aucune pour ça), au plus
  `limit` tâches en vol, résultats rendus **dans l'ordre des entrées** : le tri/dédup
  aval reste DÉTERMINISTE (le représentant retenu par groupe de doublons ne change
  pas). Les deux boucles passent en `mapLimit(all, CONCURRENCY, …)` avec
  `CONCURRENCY = min(max(cpus, 1), 16)` (lectures/décodages courts, seule work en
  cours — pas la réserve `-4` de l'ombrelle AssetStudio). `writeOutputs` reste
  séquentiel (sa gestion de collision de noms via `taken` est ordonnée, hors
  périmètre E6). Tests : `concurrency.test.ts` (7 cas — ordre préservé même à
  achèvement inversé, plafond jamais dépassé, `limit ≤ 0 → 1`, liste vide, erreur
  propagée, index passé). **+7 cas** (438 tests datagen). TSC datagen vert.

- **E1 : tests des cœurs purs d'extraction (parsers de signatures + classifieurs
  wallpapers)** — **+19 cas** (431 tests datagen), sans device ni `.gamedata`.
  PRIORITÉ aux parsers de `pull-gamedata.ts` (fragiles, dépendants du layout de
  colonnes toybox, et à conséquence lourde — siège d'E2) : `remoteSignatures`
  faisait le parsing inline, EXTRAIT en deux fonctions pures exportées —
  `parseMd5(text)` (« hash ./relatif », ignore bruit adb / hash invalide / `./`
  manquant, CRLF toléré) et `parseLsLR(text, baseDir)` (un bloc par dossier, ne
  retient que les fichiers réguliers `-`, écarte dossiers/liens/`total`, taille en
  5e colonne, nom à espaces via la 8e). Un cas documente le SIÈGE d'E2 : une ligne
  `ls -lR` tronquée (< 8 colonnes) est ignorée en silence → le fichier manque de
  `remote`, ce que `massDeleteGuard` rattrape en aval. Puis les classifieurs de
  `extract-wallpapers.ts` (`getPriorityScore`/`getCategory`/`shouldExclude`, juste
  EXPORTÉS) : hiérarchie des doublons (CG scénario > BG scénario > BG event > CG
  event, bonus `_E2`), catégorie « premier match gagne » (Full dimensionnel
  l'emporte sur le nom), blocklist nom + chemin (HeroFullArt `IMG_`, textures 3D
  par chemin). Noms de test pris RÉELS dans `wallpapers.json` (le motif `_a` de la
  blocklist excluait mon nom synthétique). Aucune logique de prod modifiée, juste
  isolée et exportée. TSC datagen vert.

- **X1 : tests des prédicats purs des specs (character/monster)** — le siège du
  bug NPC de la session mis sous garde. **+25 cas** (412 tests datagen). Prédicats
  rendus testables SANS moteur (ils prennent des `Row` bruts) :
  `isInnatePierce` (les trois formes de pénétration à ne pas confondre — buff
  durable `ON_TURN_END`, dégâts conditionnés `BT_DMG`, pénétration innée
  `ON_SKILL_FINISH`/`NONE` — plus le cas négatif sur `ENEMY_TEAM` de Domine/Anarky
  et l'exclusion `MY_TEAM_WITHOUT_ME`), `ownIdentity` (base vs skin), `boolCol`
  (tri-état : colonne absente ≠ faux), `monsterType` (catégorie `CT_*`), et le
  cœur de stats partagé `extractStats` (stats de cœur toujours émises, valeurs
  BRUTES sans échelle). La règle de sélection de `select` a été EXTRAITE en
  prédicat pur `isRealCharacterRow(r, formIds, fusionIds)` — l'exclusion
  NPC/skin/forme testée seule : base gardée, skin écarté, forme de combat écartée,
  core-fusion gardée par le `OR` (identité empruntée mais dans `fusionIds`), clone
  NPC (`Type ≠ CT_PC`) écarté. Aucune logique de prod modifiée, juste isolée et
  exportée. TSC datagen vert.

- **F4 : hook `useAutoTranslate` + `TranslateButton`** — fin de l'échafaudage
  « Translate » recopié. **−335 / +193 lignes** sur les éditeurs (~142 lignes de
  duplication retirées). Le COMPORTEMENT vivait déjà en un point
  (`translate-fill.ts`) ; ce qui restait dupliqué était la plomberie : deux états,
  les langues cibles, la sortie anticipée, l'appel, la boucle
  `applyTranslation` + `markFresh`, les messages — jusqu'aux chaînes littérales,
  identiques dans six fichiers. Le JSX du bouton l'était aussi (infobulle et
  classes comprises) d'où la seconde extraction. Chaque éditeur ne fournit plus
  que `collect()` (copie mutable + enregistrements) et `commit()` (publication) —
  la seule chose qui variait vraiment.
  PÉRIMÈTRE, revu contre le code et non contre l'audit : **5 éditeurs** sur le hook
  (FreeHeroes, Guide, ShopPriorities, Editorial, GearReco — ce dernier avait bien
  l'échafaudage, l'audit l'avait écarté à tort) ; `GearRecoEditor` garde son JSX
  (libellé « Translate notes », message après le bouton Save) ;
  `PremiumLimitedEditor` **non migré volontairement** — il délègue déjà à
  `translateReviews`, qui RETOURNE un objet au lieu de muter, le forcer dans le
  modèle collect/commit aurait été un mauvais ajustement ; il consomme les
  messages partagés. Résultat : plus une seule chaîne dupliquée ni un état
  `trans/transMsg` résiduel.
  TROUVÉ EN ROUTE : `EventsEditor` avait ses messages en FRANÇAIS (convention = UI
  en anglais) ; trois divergences accidentelles effacées (`Haiku` sans mention du
  quota, `note(s) via X — to review.`, « to review » vs « review ») — le libellé de
  GearReco passe donc de « notes » à « fields ». Dans `GuideEditor`, le hook a dû
  REMONTER au-dessus du `if (!spec) return` (règle des hooks ; l'ancienne fonction
  pouvait vivre plus bas) — un ⚠ le dit sur place, sinon on le « rangera » et ça
  cassera.
  TESTS : `useAutoTranslate.hook.test.tsx` (6 cas) sur le précédent maison
  (`client-storage.hook.test`, rendu réel via `react-dom/client` sous happy-dom) :
  sortie anticipée sans `commit`, comptage, repli Haiku, cas « déjà identique »,
  et l'erreur du traducteur qui ne doit JAMAIS échapper. L'état `loading` n'était
  pas observable (React 19 regroupe les rendus) → l'appel est tenu en suspens pour
  vérifier que le bouton est bien désactivé PENDANT l'appel.

- **F3 : garde de FORME sur tous les corps d'écriture admin** — et sévérité
  RÉVISÉE À LA HAUSSE. L'audit annonçait « JSON malformé → 500 » ; l'exécution a
  montré bien pire. Les stores « compactent » l'entrée reçue puis appliquent
  « compact vide ⇒ plus de curation ⇒ SUPPRIMER l'entrée ». Un payload d'un
  mauvais TYPE n'a aucun champ connu → compact vide → **l'override curé est
  effacé et la route répond `{ ok: true }`**. Vérifié sur `upsertEffectCurated` :
  `"bonjour"`, `42`, `true`, `["a"]` renvoient tous ZÉRO erreur (`null` lève un
  500). Donc `POST /curated/effects/42` avec le corps `"oops"` supprimait la
  curation de l'effet 42, en silence, en affichant un succès. Ce n'était pas du
  bruit de log mais de la perte de donnée éditoriale.
  Nouveau `route-body.ts`, trois contrats explicites plutôt qu'un helper
  fourre-tout : `jsonObjectBody` (objet obligatoire — refuse `null`, tableau,
  scalaire ; 9 routes), `jsonArrayBody` (6 routes), `optionalJsonObject` (2 routes
  d'ACTION où poster sans corps est NORMAL — leur `req.json().catch(() => ({}))`
  ne rattrapait pas un `null` littéral, JSON valide, donc `body.x` levait un 500).
  Couverture : **100 % des routes admin lisant du JSON**, plus aucun `req.json()`
  nu. 5 contrôles `Array.isArray` devenus morts retirés (pas de garde en double
  qui ferait croire à deux niveaux). AUCUNE dépendance ajoutée (pas de zod) ; la
  validation PAR CHAMP reste dans les stores, où elle est déjà et a du sens.
  TESTS : `route-body.test.ts` (10 cas, dont les 5 payloads qui effaçaient la curée).

- **F6 : confinement des chemins d'écriture de guides** (`guide-store.ts`).
  `guideDir` faisait `resolve(CONTENTS_DIR, category, slug)` sans vérifier le
  périmètre — or `resolve()` normalise les `..` et le `slug` vient de l'URL sans
  validation. Confinement rendu STRUCTUREL : `guideDir` renvoie `null` hors
  périmètre, il FAUT donc traiter le cas (impossible d'oublier la garde à un futur
  appel). Idiome aligné sur `src/app/images/[...path]/route.dev.ts`. `fromKey`
  (clé de version, servait à choisir le dossier source à recopier) validé par la
  même regex `YYYY-MM` que `newKey`.
  DEUX DÉFAUTS ADJACENTS trouvés en instrumentant : (1) `addGuideVersion` ne
  validait PAS la catégorie (contrairement à `saveGuideDraft`) → une catégorie
  inventée passait le confinement puis `mkdirSync` créait un dossier parasite que
  le scanner de guides parcourt ; corrigé par liste blanche `guideSpec` + exigence
  `spec.versioned` ; (2) le dossier cible était créé AVANT de vérifier la version
  source → un `fromKey` introuvable laissait un `versions/<clé>/` vide derrière lui.
  Nouveau `guide-store.test.ts` (6 cas) — il n'exerce QUE les chemins de refus,
  donc n'écrit rien ; le piège inverse est documenté en tête du fichier (ma
  première version passait un slug VALIDE et a réellement créé un dossier dans
  l'arbre du site, supprimé depuis).

- **F1, complément : temporaire à nom UNIQUE + nettoyage sur échec** (`writeJson`).
  L'écriture atomique posée plus tôt utilisait un temporaire à nom FIXE
  (`<path>.tmp`). Constat mesuré en écrivant le test : ce nom fixe était **déjà
  sans risque en intra-processus** — `writeFileSync` et `renameSync` sont
  synchrones et rien ne les sépare, donc deux requêtes admin ne peuvent pas
  s'entrelacer (vérifié : la suite passe à l'identique avec un nom fixe, mon
  hypothèse « deux onglets » était FAUSSE). Le gain réel est **inter-processus** :
  serveur dev enregistrant un curé pendant qu'une CLI datagen réécrit le même
  fichier visaient le même `.tmp` → octets mélangés puis double rename. Le `pid`
  ferme ça ; la séquence est une défense en profondeur si un refactor glissait un
  `await` entre l'écriture et le rename. Ajouté aussi : un échec d'écriture ne
  laisse plus de temporaire orphelin à côté du curé. Suite json : 11 tests (dont
  un qui porte l'avertissement « ce test ne démontre pas l'utilité du pid »).

- **Audit datagen en TROIS volets + synthèse consolidée.** Campagne d'audit de
  la chaîne datagen, lue de première main (pas de résumé d'agent) : `datagen/extract/`
  (pipeline device → pool, **E1–E8**, [`docs/audit/extraction.md`](./audit/extraction.md),
  commit `92be398`) puis `datagen/extractor/` (moteur de revue/intégration,
  **13 fic. · 2699 l.**, l'angle mort — plus du double de `extract/` — **X1–X6**,
  [`docs/audit/extractor.md`](./audit/extractor.md), commit `10b59d5`). Mis en
  commun avec l'audit worker du panneau admin (**F1–F9**, `admin.md`) dans une
  synthèse dédupliquée et priorisée ([`docs/audit/README.md`](./audit/README.md),
  commits `ee3731f`/`523bb39`). **Verdict croisé : les trois volets sont sains** ;
  le vrai risque partagé n'est pas l'exposition mais la **durabilité de la donnée
  éditoriale**, et il converge sur un fichier commun (`datagen/lib/json.ts`). Fil
  rouge des trois : « lecture ratée → vide silencieux → purge » (F1 / E2 / X2),
  dont le remède unique est `readCuratedJson`. Backlog restant tenu dans TODO,
  réparti par rôle (Claude = datagen, Worker = admin).

- **F1 — écriture atomique `writeJson` (socle partagé, seul constat de sévérité
  Haute).** `datagen/lib/json.ts` écrivait sans fichier temporaire : une
  interruption laissait un JSON tronqué, et comme `readCuratedJson` **lève** sur
  JSON cassé (à raison), un save interrompu **bloquait `pnpm dev` ET le build**.
  Surface : 53 sites d'écriture, dont `characters.json` (243 Ko de travail
  éditorial). Fix = write-tmp + `renameSync` atomique (`MoveFileEx` écrase sur
  Windows), avec nom de temporaire unique (`${path}.${pid}.${seq}.tmp`) et
  `rmSync` de nettoyage sur échec — robuste aussi en concurrence inter-processus
  (dev server ↔ CLI datagen). Testé (round-trip, zéro `.tmp` résiduel, écrasement,
  concurrence). Commit `f4fc6d4`. **Corrigé une seule fois** : bénéficie aux trois
  volets (l'admin écrit ces curés, l'extraction les relit).

- **E2 — garde anti-purge du miroir sur listing incomplet.** `pull-gamedata` :
  un miss partiel du listing distant → suppression locale SILENCIEUSE (le
  garde-fou d'origine ne couvrait que le vide total). Ajout de `massDeleteGuard`
  (pur + testé) : refuse la passe si `>50 %` du local serait supprimé pour `<10 %`
  tiré (signature d'un listing tronqué). Câblé avant la boucle de suppression.
  Commit `db6afaf`.

- **E3 — helper PNG partagé `lib/png readPngSize`.** Le parsing de l'en-tête IHDR
  (24 octets, fd fermé en `finally`) était dupliqué ×3 (`extract-wallpapers.ts`,
  `generators/wallpapers.ts`, `assets/hero-full-art.ts`). Extrait en un seul
  `readPngSize(path)` ; les trois sites y basculent (`extract-wallpapers` adapte
  `{w,h}` → `{width,height}`). Commit `706ee03` (+ test dédié).

- **E4 — timeout anti-blocage sur l'extraction bytes/images.** `extract.ts`
  `cli()` (`execFileSync` sur AssetStudio) n'avait aucun garde-fou : un process
  pendu ne rendait jamais la main. Ajout d'un `timeout` de 30 min — pas un plafond
  de durée normale (le process complet tourne ~10-15 min sur un gros patch), mais
  une borne bien au-dessus du pire cas d'UNE passe. Aligné en esprit sur le
  timeout de l'audio. Commit `918a130`.

- **X3 — mémoïsation `character`/`monster` dans `targets.ts` (le gros des
  1320 ms de `reviewAll`).** `targets.ts` cachait déjà `equipment()` et
  `itemCatalog()` sur l'empreinte des tables, mais les cibles `character` et
  `monster` appelaient `buildCharacters()`/`buildMonsters()` SANS cache : chaque
  `reviewAll`, puis chaque `reviewTarget`/`acceptTypos` sur ces cibles,
  reconstruisait l'extraction complète (~15 tables, `prepare` sur chaque ligne,
  résolution buffs/textes/pool d'images) — payé plusieurs fois par session de
  revue admin. Fix : deux helpers mémoïsés calqués à l'identique sur `equipment()`,
  sur la sentinelle `TextSystem` (un refresh réécrit TOUTES les tables d'un coup).
  Ni `buildCharacters` ni `buildMonsters` ne lit de curé éditable (tout vient de
  `.gamedata`) → rien à ajouter à l'empreinte, contrairement à `itemCatalog` ;
  résultat traité en LECTURE SEULE par la revue, comme les caches existants.
  TSC datagen vert, suite datagen 386/386. Commit `0396470`.

- **X2 — lecture du committé via `readCuratedJson` : anti-wipe silencieux.** Deux
  lecteurs AVANT écriture confondaient « fichier ABSENT » (normal) et « fichier
  CASSÉ » (erreur), en renvoyant `{}` dans les deux cas. `review.ts`
  `readCommitted` : un `data/generated/*.json` corrompu faisait voir TOUTES les
  entités comme « new » (diff faussé) et, au `writeBack` d'une cible à `subKey`
  (effets sous `glossaries.json`), `{ ...readCommitted(file), [subKey]: data }`
  avec `readCommitted = {}` **écrasait les autres clés** du fichier partagé à
  l'accept. `integrate.ts` `readJsonOr` : un `monsters.json` momentanément
  corrompu → merge d'un monstre sur `{}` → **tous les autres monstres perdus**.
  Même classe que F1 (admin) et E2 (extraction). Fix : router ces lectures par
  `readCuratedJson` (ENOENT → `{}`, JSON cassé → **throw** nommant le fichier) ;
  `readJson` garde son throw-sur-absent. Idiome unifié, plus de
  `JSON.parse(readFileSync)` maison ni de catch-all. Test de non-régression
  (integrate) : un committé cassé lève au lieu de merger sur du vide, fichier
  corrompu resté intact. Suite datagen 387/387. Commit `f3f1cd0`.

- **Desc de skill PAR NIVEAU (le texte ne suivait pas le palier).** Le `DescID`
  d'un skill est une liste CSV — une desc PLEINE par niveau — mais le datagen ne
  gardait que `splitCsv(DescID)[0]` (niveau 1), jetant les suivants. Invisible
  pour ~800 skills (entrées identiques : template unique, les nombres viennent
  des placeholders + vars) mais **84 skills** changent le TEXTE à un palier
  (S2 ×41, S3 ×34, S1 ×3, Core-Fused Passive ×6) — ex. le passif de CF Veronica
  gagne au Lv2 « Increases Damage for all allies currently affected by Increased
  Defense », jamais affiché. Fix : `datagen/generators/skills.ts` émet `levels[].desc`
  quand les entrées CSV DIVERGENT (repli sur la dernière si moins d'entrées que de
  niveaux ; balaie aussi ces descs pour résoudre leurs placeholders) ; `SkillCard`
  rend `levels[niveau].desc ?? skill.desc`. Le champ `SkillLevel.desc` existait
  déjà au contrat. `skills.json` régénéré CHIRURGICALEMENT (patch des seuls ids
  déjà committés → 84 skills / 394 niveaux, ZÉRO perso non intégré ajouté, diff
  purement additif). Au passage, les skills à desc chiffrée en dur par niveau
  (ex. « 40 % » → « 60 % » de contre-attaque) affichent enfin la bonne valeur.

- **Raccourcis `{SK/…}` : `Passive` recadré + `Dual` ajouté + passif Core Fusion
  affiché.** `SKILL_SHORTHAND` mélangeait deux choses : `Passive → unique_passive`,
  or `unique_passive` n'est qu'un marqueur « Burst Level 2 Unlocked » (tout le
  roster) — pas un passif. Le VRAI passif ne vit que sur les 6 entités core-fusion
  (`2700xxx`, tag `core-fusion`, affichées « Core Fusion X ») dans leur
  `fusion_passive` (« Core-Fused Passive »). Nouvelle sémantique : `Passive →
fusion_passive` (rouge sur un perso normal — voulu), `Chain`/`Dual` visent le
  même `chain_passive` mais `skillDesc` n'en garde que LEUR moitié
  (`splitChainDual`) ET le libellé du chip devient le TITRE de section coloré du
  jeu (« Chain Companion Effect », « Dual Attack Effect ») au lieu du nom générique
  « Chain Passive » — sinon Chain et Dual s'affichaient identiques. La fiche perso
  ne rendait jamais `fusion_passive` : ajout
  d'une carte de skill dédiée (après S1/S2/S3, via le `SkillCard` existant qui
  gère nativement une carte sans cooldown/cible/burst) quand un `fusion_passive`
  non vide existe. Contenu curé rectifié : les 5 `{SK/Bryn|Passive}` (Bryn n'est
  pas core-fusion ; le texte parlait de son effet Chain Starter) → `{SK/Bryn|Chain}`.
  Miroir aperçu admin (`resolveSegment`) tenu ; banc `/dev/parse-text` enrichi
  (Chain/Dual + Passive core-fusion + le cas rouge). tsc + eslint verts.

- **Accueil `/admin` : la matrice devient une INBOX priorisée** (dernier des trois
  items du chantier « panneau admin » figé le 07/07 — la section est close). La
  home affichait une matrice entité × fonction dont la colonne « Extract »
  redisait EXACTEMENT les badges de la sidebar (mêmes chiffres, mêmes liens), en
  dix lignes dont neuf « ✓ ». Remplacée par une liste de ce qui DEMANDE une
  action, triée par urgence, tous signaux confondus : tag éditorial mort (rang 0
  — casse le rendu et bloque `tag-control.test`), entité `diff`/`removed` (rang 1
  — le site sert du faux), entité `new` (rang 2), asset manquant (rang 3), `typo`
  seul (rang 4, cosmétique). Rien à signaler → « Nothing to process » : l'écran
  vide DIT quelque chose. La couverture curée (info absente de la sidebar, jamais
  une TODO) descend en section « Editorial coverage ».
  DUPLICATION RÉGLÉE À LA SOURCE, au-delà du visuel : `src/lib/admin/admin-inbox.ts`
  porte désormais la liste des entités d'extraction (sidebar ET home en tenaient
  chacune une copie — celle de la home avait déjà dérivé, Monstre en 3e au lieu
  de l'avant-dernier) et le calcul de revue, mémoïsé à la requête via `cache()`
  de React (motif déjà utilisé par `i18n/server.ts`). Le moteur coûte ~1,3 s
  MESURÉ : layout et page le lançaient chacun de leur côté, soit ~2,6 s par
  chargement de `/admin` — un seul appel les sert tous les deux (dédup RSC à
  confirmer en dev, non vérifiable hors rendu). Le scan de tags, lui, est bon
  marché (~120 ms mesuré) : il entre dans l'inbox sans la ralentir.

- **Infobulles `{I-W|A|T/…}` et `{SK/…}` : desc branchée (plus juste le nom).**
  Au rendu public (`parse-text.tsx`), `equipmentChip` (armes/amulettes/talismans)
  et `skillChip` ne passaient AUCUNE desc à leur chip → tooltip réduit au nom
  (seuls les items `{I-I/…}` et les sets `{AS/…}` marchaient). Branché sur les
  résolveurs EXISTANTS, sans dupliquer : équipement (`{I-W|A|T/…}`) ET EE
  (`{EE/…}`) → `gearPassivesText(refs, lang, byTier)` qui reprend TOUS les passifs
  (MIROIR de la page détail — pas juste le premier ; Executioner's Charm en a 2),
  `byTier` selon le type (armes/amulettes par breakthrough, talismans/EE par niveau
  déclaré), et dédoublonne par template de desc (dernier gagne — un EE porte souvent
  le même passif en base+upgrade → une ligne à la valeur max). Passifs gear sans
  `<color>` (rendu direct `ItemInline`) ; passifs d'EE AVEC `<color>` → tooltip
  `renderGameColors`. Skill → helper `skillDesc()` = `resolveSkillText(desc, dernier
palier.vars)` + `\n` littéraux convertis, EXACTEMENT la résolution de la fiche
  perso (`SkillDescription`) et de l'aperçu admin (`page.dev`). La desc de skill
  garde ses `<color=…>`, rendus par `renderGameColors` dans le tooltip.
  MIROIR tenu : les fns de rendu ET les cas de `resolveSegment` (aperçu admin)
  corrigés ensemble ; segment `icon` doté d'un champ `desc?`, rendu par
  `InlinePreview` (tooltip via `renderGameColors`). Helpers partagés rendu/aperçu
  (pas de dérive). tsc + eslint + parse-text.test verts.

- **CSP — chantier CLOS : nonce + strict-dynamic ABANDONNÉ (résultat négatif),
  Report-Only retiré, `img-src` resserré.** L'expérience Report-Only (PASSE 1,
  livrée le 19/07) a tourné ~1 semaine en prod ; les rapports (`docker logs
stack-outerpedia-1 | grep [csp-report]`) ont tranché : ce n'était PAS du bruit
  de tiers mais **nos propres scripts**, sur TOUTES les pages, tous les
  sous-domaines — deux classes, `script-src-elem` bloqué sur les chunks
  `_next/static/chunks/*.js` (strict-dynamic ignore `'self'`) ET sur l'inline
  (`__next_f`, bootstrap RSC). Cause unique : le **nonce par-requête ≠ HTML ISR
  mis en cache** (nonce baké une fois à la génération, régénéré à chaque requête).
  Le nonce impose le rendu dynamique (perte de l'ISR 24 h + archi du cron de
  purge) et le payload RSC inline n'est pas hashable (change à chaque page) → pas
  de retrait propre de `'unsafe-inline'` sur du statique. DÉCISION : on garde
  `'unsafe-inline'` côté script (défendable : wiki de données curées, zéro contenu
  utilisateur réinjecté dans le DOM, pas de session publique). RETIRÉ : `buildCsp`
  /`withCsp` + headers Report-Only/`Reporting-Endpoints` de `proxy.ts` (redevient
  du pur routing i18n), et la route collectrice `src/app/api/csp-report/route.ts`
  (chaque visiteur POSTait un rapport par page — bruit/bande passante pour rien).
  GAIN réel et compatible statique : `img-src` passe du `https:` fourre-tout (toute
  image HTTPS autorisée) à un allowlist EXPLICITE — inventaire vérifié des hôtes
  servis : `'self'`, `data:`, `blob:` (export tier-list), `img.outerpedia.com`
  (R2), `cdn.discordapp.com` (avatars+emojis reviews), `i.ytimg.com` +
  `img.youtube.com` (miniatures) ; grep confirmé zéro hotlink vers le CDN du jeu.
  Commentaires `next.config.ts` + `Analytics.tsx` alignés. tsc + eslint verts.

## 2026-07-24

- **Auto-convert des icônes faites main + icône « Extra Skill ».** L'effet
  `SYS_BUFF_ADDITIVE_SKILL` (« Extra Skill ») n'avait aucune icône (le jeu n'en
  fournit pas) : icône générée par IA déposée dans le POOL ÉDITORIAL versionné
  (`data/editorial/ui/effect/extra_skill.webp`), que le manifest route déjà via
  `editorialFallback` — donc durable et suivie (pas coincée dans `.assets-staging/`,
  gitignoré, où `collect` la déclarait « manquante » et où un rebuild l'aurait
  perdue). `assets:collect` gagne `normalizeEditorialPool()` : un raster png/jpg
  FRAÎCHEMENT DÉPOSÉ (non suivi par git) dans `data/editorial/` est converti en
  webp — déposer un `.png` suffit désormais, `pnpm images` fait le reste. Borné
  au git-untracked À DESSEIN : le pool contient aussi des rasters versionnés
  légitimes qui doivent rester tels quels (og:image `ui/og_default.jpg` en `.jpg`).
  Au passage, `extra_skill.png` poussé par erreur sur R2 a été supprimé du bucket
  (+ purge edge, entrée retirée de `pushed.json`).

- **Éditeur d'effet curé : « Editorial tag » → select fermé « Editorial family ».**
  Le champ était libre (placeholder « dot, stat, cc… » — trompeur : « stat »
  n'est pas une famille, la vraie est `statBoosts`), alors que le runtime
  (`buildEffectGroups`) n'applique l'override de `tag` que si c'est une famille
  VALIDE du côté de l'effet. Devenu un select piloté par la nature effective
  (buff/debuff), qui ne propose que les familles de ce côté. SOURCE UNIQUE
  extraite dans `src/lib/data/effect-families.ts` (`EFFECT_FAMILIES` +
  `effectFamilyLabel`, sans dépendance runtime) : `effect-filters.ts` la consomme
  (fin de la liste dupliquée) et l'éditeur client aussi. Garde-fou : un `tag`
  hérité d'un autre côté reste affiché (« other side ») — pas d'effacement muet.
  Les 14 tags curés existants (`statReduction`/`unique`/`utility`) sont tous des
  familles valides → rien à migrer.

- **Bug éditeur assisté `/admin/guides` : picker `{P/}` + doublons buff/debuff.**
  (1) Le picker `{P/}`/`{SK/}`/`{EE/}` listait le nom NU (`c.name.en`) alors que
  le résolveur `findCharacterByName` indexe par `characterDisplayName` (préfixe
  compris : « Core Fusion … », surnoms) → les persos à nom composé étaient
  introuvables, ou fondus sous leur nom de base par la dédup → tag inséré non
  résolvable. Le picker liste désormais la MÊME clé que le résolveur.
  (2) Les listes buff/debuff dédoublonnent maintenant par APPARENCE (nom, icône
  et description) et non par clé : un effet à N clés au rendu identique
  (variantes, jumeau `_IR`) ne propose plus qu'une entrée (la clé la plus courte
  = la base) ; deux homonymes à description DIFFÉRENTE restent distincts. Tout
  dans `src/lib/admin/inline-refs.ts`.

## 2026-07-23

- **CI : Docker construit sur `/mnt`, fin du `rm -rf` I/O-bound.** Le build sature
  le disque RACINE au COPY final (standalone duplique node_modules + ~4500 pages).
  On libérait ~25 Go en `rm -rf` des toolchains préinstallés — I/O-bound, et sur
  un runner à disque lent monté à **10 min 32 s** (vs 24 s d'habitude, run
  30025349354, +10 min sur les 17 min du run). Impossible à backgrounder : la
  place DOIT être libre avant le COPY final, sinon ENOSPC. À la place, data-root
  Docker déplacé sur `/mnt` (disque éphémère du runner, ~70 Go libres) : les
  couches ne touchent plus `/`, plus de suppression, plus de variance. jq fusionne
  data-root dans un `daemon.json` éventuel ; pas d'action tierce (choix maintenu).

- **Warning Turbopack « over bundling » sur les guides coupée.** `readGuideFile`/
  `readGuideVersionFile` (`src/lib/data/guides.ts`) lisent des JSON via
  `resolve(CONTENTS_DIR, <dyn>, <dyn>, <dyn>)`. Turbopack constant-foldait
  `CONTENTS_DIR` (= `process.cwd()`+littéral) et croyait devoir embarquer TOUT
  l'arbre `_contents` (~11700 fichiers) dans le bundle serveur. Base rendue opaque
  via `process.env.GUIDES_CONTENTS_DIR ?? <défaut>` → l'analyse statique lâche.
  Sans effet runtime : ces JSON viennent de `outputFileTracingIncludes`
  (next.config), pas de ce bundling.

- **Warnings Firefox « police préchargée … non utilisée » coupés.** `next/font`
  préchargeait les TROIS polices (`<link rel=preload as=font>` par page) ; Firefox
  avertit dès qu'une page n'en peint pas le glyphe dans les ~3 s. `preload: false`
  sur les DEUX secondaires (Geist Sans = simple fallback de Paybooc, Geist Mono =
  usages épars). **Paybooc GARDE son préchargement** : c'est la police par défaut
  du site (`--font-sans`), peinte above-the-fold partout (LCP) — la dé-précharger
  flasherait le fallback à chaque premier rendu. Elles se chargent toujours à la
  découverte CSS ; `display: swap` + fallback à métriques ajustées de next/font
  couvrent le rendu sans préchargement.

- **Fix prod : `/ost` « Failed to load track » sur toutes les pistes — CSP.**
  La CSP appliquée (`next.config.ts`) avait `media-src 'self' youtube discord`
  mais PAS le host des assets `img.outerpedia.com` → les mp3 du jukebox, servis
  en cross-origin depuis R2, étaient bloqués par le navigateur (l'`<audio>` fire
  `error`). Les images passaient parce qu'`img-src` a un `https:` large, pas le
  média. En local l'URL est same-origin (`/audio/…`, `NEXT_PUBLIC_IMG_BASE` vide)
  → couverte par `'self'`, d'où le « marche en local, casse en prod ». Diagnostic
  confirmé sur la donnée réelle : `curl` sur R2 renvoie `206` + `audio/mpeg` +
  ranges, l'asset était sain — seule la CSP bloquait. `img.outerpedia.com` ajouté
  à `media-src` dans les DEUX CSP (appliquée + Report-Only jumelle de `proxy.ts`).
  Nécessite un déploiement prod (build). Non poussé.

- **Tests datagen : les générateurs MINCES/fs restants couverts — le chantier
  « Tests à écrire » est SOLDÉ.** Derniers non nommés, même méthode (cœur pur
  synthétique quand il y en a un + invariants sur `data/generated/` committé,
  sans `.gamedata`). **game-version** (5 t — `parseResVersion` extrait de la
  regex inline : ancrage fin de chaîne, tolérance espaces, null si pas en toute
  fin), **bgm-mapping** (12 t — `formatFilenameAsName` : camelCase/digit collé/
  acronyme majuscule/`_intro` ; `byFileNameCI` déterministe ; invariants forme +
  ORDRE du JSON), **unlock-content** (8 t — `buildSeasonDisplayMap` exporté :
  numérotation saison JOUEUR, une suite d'épisodes ≠ redémarrage NE crée PAS de
  saison ; invariants stage `S1H-10-7`/mode/dicts), **comics** (2 t, invariants —
  clés = langues connues, stems sans extension, uniques, triés), **wallpapers**
  (4 t, invariants — éclatement `Full:` par préfixe, tri par `f`, HeroFullArt =
  `IMG_<id>`). **effects** n'a RIEN de neuf : c'est un outil de staging dont
  toute la logique vit dans `lib/effects.ts`, déjà couvert par `lib/effects.test`
  (`classifyFamily`, `resolveKeyWinners`). Cœurs privés exportés/extraits, zéro
  changement de comportement. Suite datagen : **372 tests** (43 fichiers).

- **`shop-purchase-priorities` éditable en admin — CLÔT la campagne
  general-guides bespoke.** Dernier fragment (après free-heroes et
  premium-limited). Deux surfaces, décision Sevih « LES DEUX » : (1) les 8 shops
  DÉRIVÉS du jeu (guild/joint/friend/arena/stars/worldboss/al/survey) — seuls
  priorité S/A/B/C + notes sont curés, overlay `data/curated/shop-priorities.json`
  keyé par slug stable ; à la sauvegarde on RÉGÉNÈRE
  `data/generated/shop-priorities.json` (via le générateur en process, comme
  l'intégration monstre lance `buildMonsters`) → aperçu live sans
  `pnpm datagen:build`. Vérifié : régénération **byte-identique** au committé
  quand rien ne change (zéro diff parasite). (2) les shops ÉDITORIAUX
  (Event/Resource/Supply/Rico + notes) — `editorial.ts` MIGRÉ en
  `shop-editorial.json` (par script, zéro transcription ; le module ne garde que
  types + lecture typée, `index.tsx` du guide inchangé) → tout éditable en admin.
  Éditeur : onglet par shop, `PriorityPicker`, notes/textes localisés au clic
  (un seul `InlineTextField` monté, sous-composants au niveau module), barre de
  langue + Translate (périmètre de fraîcheur). Store branché sur le registre
  general-guide + l'API `[category]/[slug]` + la sidebar general-guides.

- **Guide editor : une entrée de menu PAR TYPE, sidebar filtrée.** Avant : une
  seule entrée « Guides » → sidebar listant TOUT le corpus. Maintenant le menu
  admin liste un type par ligne (dérivés de `GUIDE_SPECS` + general-guides, via
  `guide-nav.ts` — source unique partagée menu/sidebar, une future catégorie
  branchée apparaît d'office), et chaque type a sa sidebar (layout `[category]`).
  Le layout global (liste plate) supprimé ; index de catégorie ajouté (sinon
  `/admin/guides/<type>` = 404) ; `AdminSidebar` gagne un flag `exact` pour que
  l'entrée « Overview » (accueil + import de contribution) ne s'allume qu'au
  chemin exact. Bonus : pour les catégories `bossTitle` (special-request), la
  sidebar liste par NOM DE BOSS (résolu depuis `bossId`, comme le H1 public) —
  sinon 8 lignes « Strategy Guide » identiques.

- **Titres SEO des guides special-request rendus uniques.** 8 des 10 avaient un
  `meta.title` générique « Strategy Guide » (mauvais pour le SEO et les cartes de
  liste — le H1 public, lui, titre déjà sur le nom du boss via `bossId`). Titre
  regénéré « <Boss> Special Request Guide » dans les 5 langues, gabarit dérivé de
  chimera (rédigé indépendamment → gabarit validé), nom de boss résolu depuis
  `TextCharacter` (jeu). beatles EXCLU (guide de boss jumeaux Dek'Ril & Mek'Ril,
  `bossId` n'en résout qu'un → titre légitimement custom). Reste en TODO : les
  meta DESCRIPTIONS, encore génériques et dupliquées (8 identiques), éditorial à
  passer famille par famille.

- **« Extractors orphelins » : prémisse déjà résolue — rien à redéfinir.** Le
  TODO craignait des pages de contrôle de régression sans oracle depuis la fin
  de la migration (Effect, rapport gear, badges de diff sidebar). Or l'oracle
  externe (l'ancien site / la V2) a DÉJÀ été arraché : cf. « Comparaisons V2
  retirées de l'admin » et « `data/legacy/` supprimé (249 fichiers) » plus bas
  — `data/legacy` absent, plus aucun `V2Control*`/`EquipmentReport`/`v2-control`
  dans `src` ni `datagen`. Bilan par cible : le **rapport gear** (`EquipmentReport`)
  n'existe littéralement plus (supprimé) ; la page **Effect**
  (`extractor/effects/page.dev.tsx`) et les **badges sidebar** (`pendingCounts()`
  dans `layout.dev.tsx`, `new + diff + removed`) sont vivantes et centrales, mais
  ont changé de rôle : ce ne sont plus des contrôles de régression contre
  l'ancien site, ce sont des contrôles de cohérence **data jeu ↔ data site**
  (extraction fraîche des tables ↔ data committée). L'oracle d'aujourd'hui, c'est
  le jeu. TODO fermé. (Les derniers vrais liens vers la V2 restent hors périmètre
  ici : regens `banners`/`promo-codes`/`changelog`, imports ponctuels — pas des
  oracles de diff — à couper à la bascule prod.)

- **Tests datagen : les générateurs SECONDAIRES nommés couverts (12).** Suite
  du lot principal, même méthode (cœurs purs synthétiques + invariants sur
  `data/generated/` committé, sans `.gamedata`). **characters-list** (12 t —
  `buildCharactersList` end-to-end : résolution effet→clé, repli `group`, EE,
  zéro faux positif sur un mécanique ; `teamStatsFromDesc`/`invertKeys`),
  **progression** (7 t, invariants — évolutions/limit breaks/quirks ; documente
  le sur-ensemble `premium` = tous les CT_PC), **hero-growth** (8 t — `costsFrom`/
  `itemRef`), **item-catalog** (8 t — `catalogCompare`/`applyCurated` + fichier
  trié = diff stable ; `items` fondu dedans), **quirks** (4 t, invariants arbres
  d'Awakening), **ether-rankings** (6 t — `byRank`), **enhance** (5 t, invariants
  ascension Singularity), **shop-priorities** (7 t — `computeAsOf`/`isCurrent`/
  `goodsSlug`, ancre déterministe), **timegate-resources** (4 t, invariants —
  total mensuel global), **costumes** (3 t — `costumeCore`), **bosses** (2 t —
  boss de source résolu), **monster-skills** (3 t — cœur `assembleSkill` déjà
  couvert par skills.test ; documente le `type` vide côté monstre). Cœurs purs
  privés EXPORTÉS/extraits au scope module (convention encounters), zéro
  changement de comportement. Suite datagen : **346 tests** (38 fichiers).
  Restent seulement les générateurs minces/fs non nommés (unlock-content,
  effects, game-version, bgm-mapping, comics, wallpapers).

- **Tests datagen : le LOT NOMMÉ de générateurs couvert (7) + gating de
  `refresh` + `gamedata-store`.** Même méthode que le trio du 20/07 — cœurs purs
  isolés en synthétique (aucune table) + invariants référentiels sur
  `data/generated/` committé, la suite tourne SANS `.gamedata` (CI). Détail :
  **skills** (16 t — `assembleSkill` buffs vides, réf croisée persos↔skills),
  **recruit** (10 t — `ratesOf` poids→%, taux à 100, bannières), **goods** (6 t —
  `iconNameCandidates`, assetTypes↔goods), **monad** (15 t — le SOLVEUR BFS
  True Ending sur graphes synthétiques, `mapNodeType`/`splitLabelAndNeed`,
  bijection index↔routes), **towers** (8 t — `formationOf`, étages↔donjons/
  monstres, pool very-hard), **equipment** (14 t — `usedValueKeys`/
  `conditionalLabel`, graphe de réfs items→pools/passifs/breakLimits/sets→EE→
  perso→familles), **sources** (5 t — `shopSlug`, items↔équipement/boss).
  `refresh` : décision de (re)génération extraite en `regenDecision` pur (gating
  extract→build). `gamedata-store` (dev-only) : `isValidTableName` + `linkTargetFor`.
  Pour tester, les cœurs purs privés ont été EXPORTÉS ou extraits au scope module
  (convention encounters), sans changer aucun comportement. Suite datagen : 271
  tests ; suite complète : 692. Trois quirks de donnée RÉELLE documentés par les
  tests plutôt que masqués : skill orphelin `3807` (0 niveau, aucun perso — « pas
  de drop silencieux »), 5 bannières `seasonal-selection` à `end='0'` (rerun
  ouvert sans fin en table), 3 Unique Options descriptives sans `BuffTemplet`
  (« Fatal's Exclusive Equipment »…). Restent les générateurs secondaires non
  nommés (cf. TODO).

- **Deux dérives doc↔code datagen corrigées (commentaires seuls, zéro
  comportement).** (1) `slugTeam` (`datagen/generators/skills.ts`) prétendait
  rendre `undefined` sur un CSV, alors que `splitCsv(v)[0]` prend le 1er token
  (« A,B » → `'a'`) — commentaire recadré (`undefined` seulement si NONE/vide).
  (2) `stageLabel` (`datagen/generators/unlock-content.ts`) contredit sans le
  dire l'en-tête « jamais parser l'ID » : le n° de stage se lit bien sur
  `dungeonId.slice(-2)` (il ne vit nulle part ailleurs) — exception désormais
  documentée sur la fonction (saison/épisode passent, eux, par AreaID). Vidait
  le dernier item « Doc ↔ code » du TODO.

- **Deux TODO « Panneau admin » fermés — DÉJÀ livrés, vérifiés à l'audit.**
  (1) **Diff « TYPO » + quick-fix** : le bucket `typo` est classé côté serveur
  (`datagen/extractor/core/changes.ts` — `isTypoField`/`diffBuckets`), et l'UI
  expose le bouton « Fix typos (N) » (`ExtractorReview.tsx`) → `POST
/api/admin/review/[id]` mode `typos` → `acceptTypos`. Le TODO citait encore
  « seule la normalisation d'apostrophes existe (`equipment-control.ts`) » —
  doublement périmé, ce fichier a été supprimé. (2) **Auto-détection des tags
  perso** (premium/limited/seasonal/collab) : produite en dur par la spec
  d'extraction (`datagen/extractor/specs/character.ts` — `recruitTagById` via
  `RecruitGroupTemplet.RibbonType` + détection collab par image de bannière /
  `ThumbnailEffect`). Seul `free` reste curé (aucun marqueur en jeu). La GARDE
  « ne pas retirer ces tags du curé tant que l'auto-détection n'existe pas » est
  donc levée.

- **`rewardTables` sort de `glossaries.json` → fuites client vers un gros JSON
  8 → 2, et `glossaries.json` quitte la catégorie « gros ».** Suite directe de
  la scission de `lib/stats` (22/07). MESURÉ en prod sur `/characters/drakhan` :
  le glossaire ENTIER partait au navigateur (chunk de 917 Ko décompressés,
  55 % du JS de la page), et `rewardTables` en fait **85 % indenté / 76 %
  minifié** (1367 tables) — lu du SEUL `lib/data/rewards`, serveur, jamais
  d'un composant client. Ces tables ne voyageaient que parce qu'elles
  PARTAGEAIENT UN FICHIER avec `elements`/`classes` (tirés côté client par
  `game-tokens`). Sorties dans `reward-tables.json` : `glossaries.json` passe
  de 1,88 Mo à 277 Ko, tombe SOUS le seuil « gros JSON » du graphe d'imports,
  et `reward-tables.json` (1,43 Mo) n'est atteint par AUCUN module client.
  Touche `datagen/build.ts` (écriture séparée), `contracts` (type
  `RewardTablesFile`, `rewardTables` quitte `Glossaries`), `lib/data/rewards`
  et le test d'invariants d'`encounters`. Les deux fichiers `data/generated/`
  ont été produits par un SPLIT DÉTERMINISTE du `glossaries.json` committé, via
  le formateur canonique du pipeline (`formatJson`) — byte-identique à la sortie
  de `build.ts`, pour isoler le déplacement sans embarquer la dérive de contenu
  du jour. Le prochain `datagen:regen` réconciliera ces deux fichiers avec un
  diff vide (hors contenu de jeu réellement nouveau, revu à part).

- **Slug des core-fusions : `notia-2` → `core-fusion-notia`.** Une core-fusion
  est une entité séparée portant le MÊME nom EN que sa base ; `buildSlugMap`
  (datagen/lib/slug.ts) lui collait donc un suffixe de collision (`notia-2`) au
  lieu de l'URL canonique V2. Fix : si `originalCharacter` est posé, base du
  slug = `core-fusion-<nom>` (préfixe figé, pas dérivé du libellé localisé
  FusionTitle — un slug est une URL stable). Vérifié : les 6 fusions repassent
  en `core-fusion-*`, `notia` (la base) intacte, aucun autre perso touché
  (tous les `-N` de la map appartenaient à des fusions). 3 liens du changelog
  curé (epsilon/eternal/notia) repointés sur le nouveau slug.

## 2026-07-22 (nuit du 21 au 22)

- **🚀 BASCULE V2→V3 EXÉCUTÉE — `outerpedia.com` est la V3.** Décision Sevih
  (« c'est un wiki, rien de vital ») après levée de TOUTES les inconnues le
  21/07 : mécanique subdomain prouvée au banc local, ACME prouvé par le canari
  `v2.outerpedia.com` (~10 s/cert), parité d'URLs V2↔V3 (la V2 servait DÉJÀ les
  sous-domaines de langue — découvert dans la zone Cloudflare, ça a annulé
  l'idée de « répétition générale » sur les sous-domaines, vivants). Séquence
  sans coupure : image profil prod déployée d'abord (Dockerfile : défauts
  `outerpedia.com` + `subdomain` + `INDEXABLE=true`), puis flip des 6 DNS
  (apex, www, jp, kr, zh, fr → 213.32.67.18, NUAGE GRIS), puis recreate Caddy
  (bloc 6 hôtes + `bot_api`, www/v2/ancien staging → 301 apex) — les clients
  sur l'ancienne IP voyaient la V2 pendant la propagation. Certs en ~15 s sauf
  `zh` (+90 s : l'enregistrement avait échappé au premier flip, LE validait
  encore l'ancienne IP). Batterie post-bascule TOUTE VERTE : page JP + canonical,
  308 `/en/*`, robots ouvert, sitemap, `/botapi`, `/api/bot/*`, lien court
  tier-list V2, reviews sur fiche. RESTE (non bloquant) : Search Console
  (sitemap + suivi), AAAA éventuels, nuage orange = chantier à part (cert
  d'origine + Full strict), décommission de l'ancien serveur après quelques
  jours de fenêtre de rollback (rollback = re-pointer les 6 DNS).

## 2026-07-22

- **« HTML dépasse la limite de 2 Mo de Google » (hint _Critical_ de Sitebulb) :
  MESURÉ, sans effet — chantier CLOS, refactor annulé.** 4 pages dépassent bien
  2 MiB en BRUT (frost-legion 2,25 Mo, madman-laboratory 2,15,
  prevent-world-alteration 2,14, patch-history 2,52 ; planetary-control-unit à
  1,91 était « le prochain »). Deux mesures tuent l'alerte :
  (1) **Google lit tout.** Le contenu visible d'un guild raid s'arrête à
  l'octet **153 208** (`</main>` à 129 135) et celui de `/patch-history` à
  **30 642** ; le payload RSC ne démarre qu'ensuite et court jusqu'au bout. La
  coupe des 2 MiB tombe donc en plein milieu du payload d'HYDRATATION, qui ne
  contient aucun contenu indexable.
  (2) **Les visiteurs ne le paient pas.** En brotli : frost-legion **67 Ko**,
  madman **66 Ko**, patch-history **314 Ko**, TTFB 137-182 ms. Le payload d'un
  guild raid se comprime d'un facteur ~35 tant il est répétitif (11 115
  `className`, 858 blocs de masque CSS inline identiques).
  MÉCANISME quand même compris, pour mémoire : 93 % du HTML d'un guild raid est
  du payload RSC, parce que `SegmentedTabs` et `GuideVersions` sont des
  composants CLIENT qui reçoivent chaque onglet et chaque saison en `ReactNode`
  DÉJÀ RENDU (leur docblock l'assume). React sérialise donc toutes les saisons
  alors qu'une seule s'affiche — le markup visible ne fait que 150 Ko sur 2,25.
  C'est un choix de conception (bascule d'onglet instantanée, zéro fetch) qui
  coûte du parsing, pas de la bande passante ; les CWV terrain sont tout verts.
  ⚠ ANNULÉ de ce fait : le découpage de `posts.json` en `content.{lang}.json`
  avec chargement paresseux, qui aurait touché `scripts/get-news.ts` et la
  forme des données committées. Ne pas le ressortir sans une mesure qui le
  justifie.

- **Vidéos non indexées (605, dont 0 indexée) : piste FERMÉE, ne pas la
  rouvrir.** Le ratio donne envie d'y voir un défaut ; c'en est l'inverse.
  Motif Google : « Video isn't on a watch page ». Ses deux cas disqualifiants
  décrivent EXACTEMENT nos pages — « un article où la vidéo complète le texte
  plutôt que d'en être le contenu principal » (nos guides sont des stratégies
  écrites, la vidéo illustre un clear) et « une page qui liste plusieurs vidéos
  d'importance égale » (le composant s'appelle `MultiVideoEmbed` ; 18 de nos 47
  blocs portent 2 vidéos ou plus, jusqu'à 4). Google classe correctement.
  Rendre les 605 éligibles imposerait 605 pages DÉDIÉES, une vidéo par page en
  contenu principal — soit recréer le motif de pages fines qu'on vient
  d'éteindre sur Skyward Tower. Et le gain serait nul : ce sont des embeds
  YouTube (257 références), déjà indexés sur YouTube et attribués à leur chaîne
  (Sevih 157, ダイス 49, Shiraen 35, Tango, Ducky…). Le balisage, lui, est sain
  (286 vidéos valides, 0 invalide) : c'est le TYPE DE PAGE qui ne colle pas, et
  c'est un choix éditorial assumé, pas un bug.

- **Logo de l'éditeur en 404 dans le JSON-LD de CHAQUE page.**
  `buildSiteJsonLd` publiait `Organization.logo` en
  `https://outerpedia.com/images/logo.png` — le MÊME piège que l'image OG par
  défaut, déjà corrigé dans ce fichier : un chemin racine résolu contre le
  domaine du SITE, où `/images/*` n'est servi par personne en prod (les assets
  vivent sur R2). L'OG avait été réparée, le logo avait survécu. Vérifié en
  prod : 404. Il pointe désormais `/icons/icon-512x512.png`, l'icône PWA servie
  par Next lui-même — délibérément PAS via `img.*` (R2), pour qu'il tienne sur
  tous les hôtes de langue sans dépendre de la base d'assets (200 vérifié sur
  l'apex ET sur `kr.`). Dimensions corrigées (512×512, elles annonçaient encore
  1000×1353). Un test verrouille l'invariant « jamais sous `/images/` » — ce
  bug a déjà survécu à une correction du même piège.
  TROUVÉ EN CREUSANT le rapport de couverture Search Console, dont la
  conclusion principale était pourtant qu'il n'y avait RIEN à faire :
  467 chemins distincts en 404, dont 333 `/patch-history/{type}/{slug}` et
  49 `/item/*` — des reliques de V1 (décision Sevih : un 404 est la bonne
  réponse pour une page morte, pas de table de redirections à maintenir).
  `/manifest.webmanifest`, seul 404 suspect de la liste, répond 200 depuis la
  bascule.

- **La règle `alt` passe dans CONVENTIONS — le lot Sitebulb « 27 267 images
  sans alt » est un FAUX POSITIF, à ne pas retraiter.** Le nouveau crawl le
  remonte à 27 267 instances (contre 13 894 le 20/07, la hausse suit la
  couverture du crawl) sur 82 % des pages, ce qui donne envie de rouvrir le
  chantier. Vérification : **476 images distinctes seulement**, et surtout
  **zéro `<img>` sans attribut `alt` dans tout le repo** — ce sont donc des
  `alt=""` délibérés. Les 4 familles dominantes ont été relues (drapeaux
  5 950, icônes de nav 5 950, boss 6 996, portraits 5 703) : toutes doublées
  par leur nom en texte adjacent, donc décoratives — même conclusion que la
  revue site par site du 20-21/07 (a9c1381). Leur donner un `alt` ferait
  annoncer chaque nom DEUX FOIS par un lecteur d'écran : ce serait une
  régression d'accessibilité, pas un correctif. La règle (décoratif =
  `alt="" aria-hidden` ; `alt` descriptif quand l'image porte SEULE
  l'information, cf. `CharacterPortrait`) est écrite dans `CONVENTIONS.md`
  avec les chiffres, pour que le prochain audit ne relance pas le sujet.

- **`lib/stats` scindé : les tables pures d'un côté, le glossaire de l'autre —
  fuites client 16 → 8.** Même classe de bug que `STAR_SPRITE`, en plus
  systémique : `lib/stats` mêlait des tables PURES (`STAT_ABBR`, `STAT_ICON`,
  `statAbbr`, `statIconSprite`, `statOptionView`) et deux fonctions adossées au
  glossaire extrait (`statName`, `statDesc`, via `glossaries.json`, 1,8 Mo).
  Relevé des 20 sites d'import : les composants `use client` (fiches perso,
  équipement, tier list, outils) ne prennent QUE `STAT_ICON` ou `statAbbr` —
  aucun ne veut les noms localisés — et embarquaient pourtant 1,8 Mo. Les deux
  fonctions partent dans `lib/data/stat-glossary` (data access layer : c'est de
  la donnée de jeu), `lib/stats` n'importe plus rien de `data/`. La frontière
  est posée sur la DÉPENDANCE À LA DONNÉE, pas sur le thème — écrit dans le
  docblock du nouveau module pour qu'elle ne se referme pas. 7 appelants
  serveur réorientés.

  RESTE (voir TODO) : 6 composants client tirent encore les 1,8 Mo par
  `SkillDescription → GameTokens → lib/game-tokens`. Là ce n'est plus un
  rangement mais la forme du fichier : `game-tokens` lit `elements` et
  `classes`, soit **0,8 Ko — 0,04 % de `glossaries.json`**, dont 43 % sont des
  `rewardTables` sans rapport. Le correctif est un découpage à la GÉNÉRATION,
  pas un déplacement de code.

- **`skills.json` (5,2 Mo) sort du bundle navigateur des 794 pages de guides —
  pour UNE constante mal rangée.** L'audit Sitebulb flaggait 794 URLs en
  « enormous network payloads » (67 % du site) ; en croisant les ressources du
  rapport, un SEUL chunk explique tout : 4,03 Mo décompressés, 64 % du JS du
  site, chargé sur exactement ces 794 pages (le socle commun, lui, est sain :
  251 Ko sur les 1191). Contenu identifié en le récupérant en prod —
  234 des 300 plus longues chaînes s'y retrouvent textuellement dans
  `skills.json`, dans les 5 langues. Chaîne coupable : `STAR_SPRITE`, une table
  de 5 NOMS DE SPRITES, habitait `lib/data/char-progression` — un module qui
  importe 6,1 Mo de JSON. `PropertyDiagram` (`use client`) n'en lit qu'une clé,
  et comme `guide-detail` résout son contenu par un `import()` JOKER sur tous
  les `_contents`, le bundler devait embarquer ce client-là dans toute la
  route. Correctif : `STAR_SPRITE` déménage dans `lib/images`, qui n'a AUCUN
  import — rien ne peut plus suivre. Vérifié par graphe d'imports : plus aucun
  module client n'atteint `skills.json`. ⚠ Sitebulb annonce la taille
  DÉCOMPRESSÉE : sur le réseau le chunk faisait 480 Ko gzippés, le gain est
  surtout en parsing/exécution (coût CPU mobile), pas en bande passante.

- **Titre de guide : la catégorie entre dans le titre — 147 guides, 147 titres
  distincts.** Un titre de meta n'était pas unique à l'échelle du SITE :
  « Drakhan » titrait à la fois `/characters/drakhan` et son guide World Boss,
  « Tyrant Toddler » ses deux guides (Dimensional Singularity et Adventure
  License) — deux pages à nous qui se disputent la même requête. Sitebulb n'en
  voyait que la moitié : il n'avait crawlé que 12 des 35 pages Monad Gate, où
  **29 guides partagent 5 titres** (la même zone rejouée de Depth 1 à 10).
  Correctif dans `[category]/[slug]/page.tsx` : `titre — catégorie`, plus la
  profondeur quand le guide en déclare une (clé `guides.monad_gate.depth`,
  déjà localisée). Piste ÉCARTÉE : activer le flag `bossTitle` existant sur
  world-boss / dimensional-singularity / adventure-license — il pilote AUSSI
  le h1 et la mise en page (h1 centré au nom du monstre + sous-titre), et sur
  adventure-license il aurait écrasé les titres curés (« Promotion : Demiurge
  Astei » → nom brut du boss). Un correctif SEO ne doit pas embarquer un
  changement d'UI. Effet de bord voulu : des titres plus longs, ce qui entame
  le lot « titles trop courts ». Vérifié par simulation sur les 147 metas.

- **Étages de tour : canonical vers le guide parent — 410 duplicates et 711 h1
  dupliqués éteints d'un coup.** Audit Sitebulb du 22/07 : les 410 URLs en
  duplicate content sont TOUTES des étages de Skyward Tower (176 groupes, 8
  tours, aucune exception), et 6 h1 couvrent 100 pages chacun (« Elemental
  Tower: Light »…). Cause : chaque étage se canonicalisait sur LUI-MÊME, alors
  qu'il est une VUE du guide de tour — même cadre, même h1 — et que des étages
  entiers partagent la même équipe de clear, donc le même contenu. Les étages
  pèsent 670 des 1193 URLs crawlées, soit 56 % du site (potentiel ~16 000 avec
  les 5 langues, alors qu'ils ne sont même pas au sitemap : Google les trouve
  par le maillage). Correctif : option `canonicalPath` de `createPageMetadata`
  (`src/lib/seo.ts`), posée par `[floor]/page.tsx`. Canonical ET hreflang
  basculent ENSEMBLE sur la tour — un hreflang qui annoncerait la page
  canonicalisée contredirait le canonical, et Google ignore les paires en
  conflit ; `og:url` reste sur l'étage, c'est l'URL réellement partagée. Les
  étages restent rendus et navigables : on ne retire que la candidature à
  l'index. 2 tests.

- **Retour au NUAGE ORANGE Cloudflare, exécuté** (côté `sevih-tool` : procédure,
  Caddyfile et certificat — voir `docs/nuage-orange.md` de ce dépôt-là).
  Apex, `jp`, `kr`, `fr`, `www` et `v2` passent derrière le proxy ; Caddy leur
  sert un **certificat d'origine Cloudflare valable jusqu'en 2041**, ce qui
  supprime tout ACME pour eux — donc le risque de renouvellement échouant en
  silence derrière le proxy. Le mode de chiffrement était déjà Full (Strict),
  qui accepte aussi bien une CA publique que le certificat d'origine : rien à
  y toucher. **`zh` reste en nuage GRIS** (Cloudflare est inutilisable depuis
  la Chine) et garde son Let's Encrypt automatique.
  ⚠️ INCIDENT au premier essai, ~2 min de coupure pour `zh` : le certificat
  demandé portait un joker `*.outerpedia.com`, qui couvrait donc `zh` — Caddy
  choisit son certificat par SNI dans un cache GLOBAL (pas par bloc de site) et
  cesse de gérer les noms couverts par un certificat manuel. `zh` s'est vu
  servir un certificat que seuls les serveurs Cloudflare reconnaissent →
  `HTTP 000`. Rollback immédiat (les deux lignes `tls` recommentées), puis
  nouveau certificat **sans joker**, énumérant les 6 hôtes proxifiés et eux
  seuls. Leçon : ce n'est pas la structure du Caddyfile qui isole un hôte,
  c'est la PORTÉE du certificat.
  Rappel toujours valable : ne pas réactiver l'injection automatique de Web
  Analytics, le beacon est posé à la main (cf. entrée suivante).

- **Mesure d'audience réparée — beacon Cloudflare posé à la main.** Trou
  découvert en creusant une question de l'audit Sitebulb (« 99,92 % des URLs
  sans GA/GTM : volontaire ou trou de mesure ? »). Réponse : les deux, dans
  cet ordre. À l'audit du 20/07 c'était un ARTEFACT — Sitebulb crawlait
  `vps-7b703196.vps.ovh.net`, donc l'origine en direct, et le beacon Cloudflare
  n'existe pas dans le code : il était injecté par le proxy, invisible depuis
  l'origine. Mais DEPUIS la bascule du 21/07 le nuage est GRIS, donc plus de
  proxy, donc plus d'injection : le site n'a mesuré AUCUNE visite depuis sa
  mise en ligne (vérifié en prod : ni beacon dans le HTML, ni en-tête
  `cf-ray`). Correctif : `src/components/seo/Analytics.tsx`, rendu par le
  layout racine PUBLIC seulement (l'admin et les outils dev ne sont pas
  mesurés), no-op sans token. Token = identifiant de site, PAS un secret (il
  est servi en clair) → baké dans le Dockerfile comme le reste du profil, et
  laissé VIDE en dev pour ne pas polluer les stats avec le trafic local. Mode
  « JS Snippet installation » choisi côté Cloudflare : il fonctionne en gris ET
  en orange, donc rien à re-câbler au retour du orange (item ajouté au TODO
  avec l'avertissement de double comptage) — et il est le seul compatible avec
  la PASSE 3 de CSP, où `strict-dynamic` ignorera l'allowlist d'hôtes et
  exigera un nonce qu'un script injecté par Cloudflare n'aurait jamais.
  `defer` explicite plutôt qu'un `eslint-disable` de `no-sync-scripts`.

- **Le repo passe en PUBLIC — doc remise d'équerre (décision Sevih).** Le site
  tournant sur cette version, plus de raison de garder le code privé.
  Audit préalable de l'historique complet (pickaxe `ghp_`/`github_pat_`/
  `AGE-SECRET-KEY`/webhooks/clés privées/`R2_SECRET`) : **aucun secret** — les
  seuls hits sont des noms de variables et un `.env.example` à valeur vide,
  `.env*` est ignoré depuis le premier commit. Ajout d'une **licence MIT**
  (choix Sevih), avec la réserve explicite que les données et images du jeu
  restent la propriété de Major9 / VA Games et ne sont pas couvertes par elle.
  README réécrit pour un lecteur extérieur (ce qu'est le projet, pourquoi les
  données sont générées, ce qu'un clone permet de faire sans `.gamedata`).
  **ROADMAP.md supprimée** : ses 6 phases étaient toutes atteintes (la phase 5
  était la bascule du 21/07) et elle doublonnait `docs/TODO.md`, fichier de
  suivi unique depuis le 17/07 ; renvois retirés du README et de CLAUDE.md.
  Incohérences doc↔code corrigées au passage : CLAUDE.md ne présente plus le
  projet comme « la reconstruction de la V2 » (+ ajout des gardes réelles :
  pnpm only, ne pas lancer `pnpm dev`, admin dev-only en double garde) ;
  CONVENTIONS.md — la politique de commit de `data/generated/` passe du futur
  (« Phase 2 ») au présent, `data/editorial/` enfin documenté (ici ET dans le
  tableau des zones de datagen/README — item du TODO), règles de staging
  explicites et « DONE.md part dans le commit du fix » gravées là plutôt que
  dans la tête de l'IA ; datagen/README ne promet plus une synchro `.gamedata`
  par R2 qui n'a jamais été branchée (on refait un `datagen:pull`) ;
  test-subdomain-local.md perd sa section « Jour J » d'avant-bascule.
  Enfin, les 4 chantiers du panneau admin qui ne vivaient QUE dans la mémoire
  de l'IA sont posés dans la section Dette code — dont la garde « ne pas
  retirer les tags perso du curé avant leur auto-détection ».

- **Purge des dépendances V2 mortes (post-bascule).** Inventaire complet à la
  demande de Sevih : la prod ne lit RIEN de la V2 (image Docker = .next+public,
  assets R2, MySQL migré, changelog seedé) ; extract-audio/wallpapers sont V3
  natifs (la V2 n'y vit qu'en commentaires d'héritage). RETIRÉS (décision
  Sevih) : le regen changelog depuis la V2 (`regenChangelogFromV2` + route
  `/api/admin/tools/regen-v2` + `RegenFromV2Button` — l'historique est seedé,
  V3 seule source de vérité, le code vit dans git) et
  `scripts/migrate-legacy-news.ts` (one-shot déjà joué). Le POOL D'IMAGES V2
  aussi (2ᵉ passe, précision Sevih « dégage-le ») : les 309 sources
  éditoriales (4,0 Mo) que la collecte résolvait encore depuis le pool V2 sont
  RAPATRIÉES dans `data/editorial` (versionné — fin du pool machine-dépendant),
  `v2Dir`/`v2ImagesDir`/`V2_DIR` supprimés, le choix editorial-vs-extraction du
  manifeste se fait sur `data/editorial`. Au passage le scan des screenshots de
  guides ignore désormais les sous-dossiers (le `general-guides/banner/`
  rapatrié le faisait trébucher — ces sprites passent par `editorialFallback`).
  `assets:collect` vérifié TOUT VERT sans repo V2 voisin. Les 50 sources
  « nulle part » de l'inventaire = `editorialFallback` jamais déclenchés
  (l'extraction couvre), comportement inchangé. RESTE : la V2 sur l'ancien
  serveur en filet de rollback (décommission planifiée).
  `.env.example` resynchronisé : l'en-tête « V2 — PAS ENCORE PORTÉ / aucun code
  ne lit ces variables » mentait (DB_*, BOT_API_URL, REVALIDATE_SECRET sont
  consommés depuis le 21/07) ; bloc V2_DIR réduit au seul pool d'images.
  ⚠ Décision gravée au TODO : le damage-calculator se conçoit V3 NATIF, sans
  regarder la V2 (« elle est foireuse ») — exception à la règle « V2 = oracle ».

- **`GET /api/reco/:id` était mort depuis la reconstruction V3 — restauré,
  enrichi, et désormais tenu par des tests.** Signalé par le mainteneur de
  **Gear Solver** (app desktop, repo séparé) : sa fonction « Get preset »
  appelait l'endpoint pour pré-remplir les filtres du solveur. La V3 ne l'avait
  jamais porté, la prod servait la page HTML 404 de Next — indistinguable d'une
  panne réseau côté app, alors que son 404 est un signal métier (« ce perso n'a
  pas de preset »). **Personne ne l'a vu pendant des semaines : aucun test, et
  le consommateur est dans un autre dépôt.** La donnée, elle, n'avait rien
  perdu (90 persos des deux côtés). Deux traductions séparent le curé V3 du
  vocabulaire du solveur, et **les deux échouent en silence** : (1) libellés de
  stats du wiki → clés moteur (`ATK%` → `atkPct`) ; (2) **le palier
  d'équipement** — le curé référence le membre bas de famille (Surefire
  Greatsword id 4, 1★) parce que c'est la famille qu'affiche le wiki, mais l'app
  résout l'effet via l'INVENTAIRE du joueur, où l'objet possédé est le 6★
  (754). Règle retenue : déjà au palier max de sa famille → id conservé, sinon
  `topId` — elle préserve les variantes par classe (Briareos/Gorgon : 5 objets
  distincts) et les familles mono-palier (Bloody Edge, 5★ sans 6★). Validée
  contre la sortie V2 : **49 des 68 items référencés identiques au bit près**,
  les 19 autres étant les variantes que la V2 renvoyait à `itemId: null` (l'app
  sautait leur filtre d'effet) et qui sont maintenant résolues. Second passage
  après revue d'en face : **talismans exposés** (clé `Talisman` additive) — avec
  le piège que leurs passifs CHANGENT d'un palier à l'autre (Executioner's
  Charm : 3001 en 4★, 3023 en 6★), contrairement aux armes, donc c'est bien le
  6★ qu'on émet ; et **la variante de classe verrouillée par un test** : les 5
  variantes portent des `setId` différents, en recommander une de la mauvaise
  classe poserait une contrainte qu'aucune pièce de l'inventaire ne satisfait —
  zéro build, et l'app n'a aucun moyen de le détecter (l'id est valide). Trois
  invariants balayent les 90 persos curés (vocabulaire de stats, `itemId`/`setId`
  tous résolus, tiers non vides). **Leçon : un contrat consommé hors du dépôt
  n'existe que s'il est testé ici** — sinon sa disparition est silencieuse des
  deux côtés. Validé en live par le mainteneur (89 recos en 200, 33 en 404,
  zéro warning de traduction).

- **Les skills NPC ne polluent plus les fiches perso, et un diff d'ids devient
  lisible.** Parti d'une question de Sevih sur `/admin/extractor/characters/2000001` :
  « `skills[14] : 132 → 130`, ça correspond à quoi ? ». Deux problèmes distincts
  derrière. **(1) Le panneau de diff était indécidable** : des ids nus, sans
  moyen de trancher. `lib/admin/diff-labels.ts` résout les valeurs des DEUX
  côtés — l'id qui disparaît n'existe plus que dans le committé (`skills.json`),
  celui qui apparaît que dans l'extraction fraîche, une seule source et la
  moitié des lignes reste muette. Repli sur le TYPE quand le skill n'a pas de
  nom localisé (`strike_finish`), et le diff mot-à-mot est désactivé sur les ids
  résolus (comparer « 132 » et « 130 » lettre à lettre n'apprend rien). Branché
  sur les fiches perso (+ `recommendedSets`) et monstre. **(2) Le vrai bug,
  trouvé grâce aux libellés** (intuition de Sevih : « c'est pas le perso, c'est
  les monstres qui ont son modèle ») : la spec déduisait une « forme de combat »
  d'une RESSEMBLANCE — apparence dont le kit principal diffère de la base — et
  ramassait donc les variantes **NPC** (`NPCCharacterTemplet` : K niveau 99 ★9,
  id 2600001, `OriginalCharacterID` 2000001). Six persos héritaient de skills
  qu'un joueur ne joue jamais (K perdait « Raging Storm » + « Sliding
  Uppercut », Snow, Francesca, Tanya, Veronica, Stella). Remplacé par la
  DÉCLARATION du jeu (`CharacterChangeTemplet`), skins ramenés à leur base.
  Vérifié : Demiurge Luna garde sa vraie forme (12001…12021), **zéro**
  changement de `tags`/`ignoreDefense` (la détection de pénétration parcourt
  `skills` — c'était le risque), aucune entrée curée orpheline. Piège écarté au
  passage : `NPCCharacterTemplet` n'est PAS un marqueur de fausse variante (les
  persos jouables et leurs skins y figurent, le jeu les utilise en NPC de
  scénario) — écrire la règle en exclusion aurait cassé des skins légitimes.
  Refusé : classer ces écarts en « typo » comme demandé — ce bucket alimente
  `applyTypoOnly()` qui applique AUTOMATIQUEMENT, et il ne peut plus se
  reproduire de toute façon (les 6 écarts sont un nettoyage unique, à intégrer
  fiche par fiche : l'accept global embarquerait Lambda et le `2400015` sans
  nom, pas encore publiables).

- **`<html lang>` par langue — layouts racine multiples (b679985).** Le layout
  racine global figeait `lang="en"` partout ; il disparaît. Chaque racine rend
  son `<html>` via la coquille commune `src/app/root-document.tsx` :
  `[lang]/layout` porte le vrai lang (SSG ×5 vérifié en build PROPRE :
  en/fr/jp/kr/zh dans le HTML prérendu), `admin/` et `dev/` (dev-only) portent
  le leur figé `en`. `HtmlLang` (patch client) supprimé — en navigation client
  le param du segment change et React met l'attribut à jour seul. Garde
  invalide : PAS de `notFound()` dans un layout racine (interdit) →
  `normalizeLang`, inatteignable de toute façon (le proxy réécrit tout préfixe
  inconnu vers `/en/…`). Reliquat cosmétique : le 404 global par défaut de Next
  (`_not-found`) rend sans attribut lang — inatteignable en pratique.
  ⚠ PIÈGE local découvert au passage : `pnpm build` avec le serveur dev actif
  échoue — `.next/types` (build) et `.next/dev/types` (dev) sont TOUS DEUX dans
  le tsconfig et leurs routes divergent par construction (les `.dev.tsx`
  n'existent qu'en dev) → clash de types. Le build de vérification s'est fait
  dans un worktree propre ; `.next/types` supprimé ensuite pour rendre le
  typecheck local à nouveau vert. Docker/CI (env propre) n'est pas concerné.

- **Images : `aria-hidden` sur le décoratif + dimensions intrinsèques
  (a9c1381)** — deux lots Sitebulb (« alt manquants » 13 894, « add
  dimensions » 1 167 pages). (1) Les 143 `<img alt="">` sans `aria-hidden`
  l'ont reçu (codemod + revue site par site : tous décoratifs — sprites à côté
  d'un libellé lisible, cadres, overlays ; AUCUN n'était l'unique contenu d'un
  lien, pas de texte inventé). (2) `width`/`height` posés partout où la taille
  est connue : dérivés des classes Tailwind numériques (h-N w-N, size-N →
  N×4 px, 90 sites via codemod) + passe manuelle sur les primitives à taille
  en prop (EquipmentIcon, CharacterPortrait, CharacterCard, ItemInline/
  StatInline, lightbox wallpapers, logo header). 146/242 `<img>` du code
  portent leurs dimensions ; le reste ASSUMÉ sans (overlays absolus en % dans
  des conteneurs dimensionnés — aucun CLS possible, l'espace est réservé par
  le parent). CSS garde la main sur le rendu : les attributs ne fixent que le
  ratio intrinsèque.

- **Éditeur de guides : la frappe ne remonte plus l'arbre, et la traduction ne
  brûle plus le quota (3947b95).** Symptôme : dans `/admin/guides/.../S4-1-10`
  onglet Characters, chaque LETTRE tapée perdait le focus et relançait l'aperçu
  de TOUS les champs (une requête `renderInlinePreview` par champ, par frappe).
  Cause : `SlotsBlock` et `RecoGroups` étaient déclarés DANS le corps de
  `GuideEditor` — nouvelle identité de composant à chaque rendu, donc React
  démonte/remonte tout le sous-arbre (le `textarea` est un nouveau nœud DOM, et
  les effets se rejouent). Hoistés au niveau module avec un ⚠ pour que le piège
  ne revienne pas. Mutualisation au passage, demandée par Sevih (« au final
  c'est la même chose ») : `CharacterChips` n'existe plus qu'en UN exemplaire
  (il y en avait 3 : partagé, FreeHeroes, GuideEditor), agnostique du jeton
  stocké (guides = NOM EN, synergies = ID) via `resolve`/`viewOf` — les
  correctifs Shiraen (dédoublonnage, ajout au choix dans la datalist, « Francesca »
  tapable) profitent donc à tout le monde ; et `CharacterGroups` (portraits +
  raison éditée UNE à la fois, aperçus au repos en un seul batch) sert
  maintenant les synergies ET les persos recommandés d'un guide.
  **Traduction — deux corrections de fond, source unique dans
  `lib/admin/translate-fill.ts`** (les 6 éditeurs la ré-implémentaient chacun) :
  (1) l'EN fait foi, donc une retraduction ÉCRASE les cibles — l'ancien
  « ne remplir que les langues vides » rendait toute CORRECTION de l'anglais
  inrattrapable ; (2) `createFreshness` restreint l'envoi à ce qui a BOUGÉ
  depuis le chargement (EN inconnu = édité/ajouté) ou à qui il manque une
  langue : 39 champs envoyés → 1 sur le cas réel. La référence est l'ENSEMBLE
  des EN au montage, pas une position — ajouter/supprimer/réordonner ne fausse
  rien. Limite assumée : une traduction retouchée à la main sans toucher l'EN
  n'est pas régénérée. Import de contributions aligné sur l'écrasement (sans
  fraîcheur : une contribution arrive sans historique).

- **Compteurs de l'admin : quatre sources, quatre chiffres (6efbb17, cf5c4cd).**
  `/admin/extractor/weapons` annonçait 4 diff au menu, 0 à sa sidebar, 2 new +
  2 diff sur sa page. Cause : `gear-rows.ts` codait `status: 'ok'` en dur (une
  ligne = une FAMILLE, la revue est par item) — remplacé par une agrégation
  réelle par famille + un compteur AUTORITAIRE passé à `ExtractorSidebar`
  (`counts`) quand la ligne n'est pas l'unité de revue, plus une infobulle qui
  dit pourquoi les granularités diffèrent. Même divergence côté monstres (18 vs 10) : la sidebar dérivait ses stats de TOUTES ses lignes alors que le toggle
  « Used by the site » ne filtre que l'affichage. Le badge du menu compte
  désormais le PÉRIMÈTRE SITE (`monster-review.ts`, défensif : diff rendu
  intact si l'ensemble n'est pas calculable). Trouvé en vérifiant la question de
  Sevih (« `siteMonsterIds` est à jour ? ») : **21 des 87 `bossId` de guides
  manquaient** (20 adventure-license + 1 adventure — ils ne spawnent que dans
  des modes exclus), donc leurs écarts d'extraction étaient invisibles. Comblé
  (2034 → 2055 ids, 0 manquant).

- **`@next/next/no-img-element` : la dette éteinte à la source, pas rustinée.**
  La CI annotait encore des `<img>` non couverts (tier-list-maker,
  progress-tracker) et le réflexe était d'ajouter le `eslint-disable-next-line`
  maison. Diagnostic : `next.config.ts` pose `images.unoptimized: true` (assets
  R2 en `.webp` pré-dimensionné + cache headers réglés le 20/07) — donc
  `<Image />` n'émettrait qu'un `<img>` nu et la règle n'a **aucun objet** ici.
  La convention par commentaire était le vrai palliatif : **215 directives dans
  96 fichiers**, que tout nouveau fichier « oubliait » (d'où le bruit
  récurrent). Règle éteinte **une fois** dans `eslint.config.mjs` (bloc commenté :
  pourquoi, et quoi rallumer si `unoptimized` repasse à false en « Phase 3 »),
  les 215 directives supprimées. Effet de bord gagné : prettier recolle le JSX
  que ces commentaires forçaient en multi-lignes (~30 blocs). Convention notée
  dans `CONVENTIONS.md`. Lint 0, typecheck OK, 586 tests verts. À NOTER : le
  vrai sujet perf que la règle effleurait (`width`/`height` manquants → CLS,
  1167 pages) reste ouvert dans `TODO.md` — il se traite dans les primitives
  d'image, pas via le linter.

## 2026-07-21

- **Pré-bascule : les 3 reliquats utilisateurs traités.** ① `/tools` : le
  REGISTRY fait autorité sur la disponibilité — un outil sans composant porté
  (et sans `href` de renvoi) est « coming soon » quoi qu'en dise le curé : carte
  grisée non cliquable au lieu d'un 404 (mécanisme d'affichage déjà en place,
  seule la source du statut manquait ; s'éteint tout seul à mesure des
  portages). ② Tables V2 `tier_lists` (8 lignes) + `teams` (31) MIGRÉES sur le
  MySQL du VPS depuis le dump live (local, `*.sql` désormais gitignoré) — import
  en fusion (`CREATE IF NOT EXISTS` + `INSERT IGNORE`, ids = hashes
  déterministes donc collision = même contenu ; l'`ADD PRIMARY KEY` du dump
  retiré pour `tier_lists`, la table app existait déjà) ; lien court V2 vérifié
  200 sur staging. `teams` n'a PAS encore de consommateur V3 (le team-planner
  partage par URL compacte) — la donnée est là si on porte les liens courts un
  jour. ③ Regen V2 coupons/banners RETIRÉE (fichiers à jour, V3 = source de
  vérité — décision Sevih) : fonctions du store, branches de la route
  `regen-v2`, boutons des éditeurs ; ne reste que le volet CHANGELOG comme
  dernier import V2 (à trancher avec l'item CHANGELOG.md).

- **Reviews Discord LIVRÉES ET EN PROD — chantier complet ①②③ + bascule.** Le
  bot V2 « à l'arrache » (fichiers JSON committés dans son repo, copie des
  données du site, `UPDATE.md` manuel à chaque perso : scripts + commit +
  restart PM2) est REMPLACÉ par **`outerbot`** (repo dédié, TS/discord.js 14/
  better-sqlite3, 15 tests) : Discord = source de vérité, SQLite = index
  RECONSTRUCTIBLE (base vide au boot → resync complet automatique — la
  migration réelle a relié les 123 posts hérités et 90 reviews en 35 s, zéro
  intervention), posts forum créés AUTOMATIQUEMENT pour les persos manquants
  (cron 6 h + `/admin sync`), slug posé en DB à la création (plus jamais déduit
  du nom du thread). Données wiki : plus aucune copie — routes internes
  `/api/bot/{characters,guides,items}` côté site (payloads pré-formatés pour
  les embeds, test de contrat inter-repos), client TTL 1 h + repli stale côté
  bot. Côté site : `lib/data/reviews.ts` (BOT_API_URL, revalidate 60 s, toute
  erreur → `[]` → pas de section) + `ReviewsSection` V3 (labels serveur→props,
  dates localisées, hex élément, ordre V2 synergies→reviews→video) — la CSP
  couvrait déjà le CDN Discord (`img-src https:`). Infra : service `outerbot`
  dans la stack (réseau interne SEULEMENT, volume SQLite, healthcheck),
  `BOT_API_URL` sur le site, 3 secrets `OUTERBOT_*` au coffre SOPS, CI/CD
  identique au site (GHCR + deploy SSH). Dev local : les routes read-only du
  bot exposées par Caddy sous `/botapi` (staging) — `BOT_API_URL` du
  `.env.local` pointe dessus, vraies reviews de prod sans bot local. Bascule
  faite le 21/07 : bot V2 `pm2 stop` (le site V2 affiche des sections vides,
  assumé), slash commands réenregistrées (mêmes 6), 73 build threads curés
  (`threads.json` V2) importés par script — 73/73 matchés par nom via l'API.

- **Outil `event` porté — mais REPENSÉ : un événement est une DONNÉE, plus un
  composant.** En V2, un événement = un fichier `events/<slug>.tsx` avec son
  dictionnaire i18n inline : publier, corriger une date ou ajouter les gagnants
  demandait un commit + un redéploiement, et le filtre des événements cachés
  étant CÔTÉ CLIENT, leur contenu partait quand même dans le bundle de prod.
  V3 : `data/curated/events.json` = métadonnées + liste de BLOCS au vocabulaire
  fermé (`prose`, `list`, `sections`, `timeline`, `callout`, `cta`, `videos`,
  `image`), rendus par un composant unique (`EventBlocks`). Décisions Sevih :
  ① UNE PAGE PAR ÉVÉNEMENT (`/event/<slug>` — URL partageable, meta description
  et carte OG propres ; `/event` reste l'index) ; ② bloc `videos` GÉNÉRIQUE —
  une entrée porteuse d'un libellé `featured` passe en lecteur embarqué badgé,
  les autres forment la grille : le podium d'un concours et une galerie de
  showcase sont la même donnée. Le statut (à venir/en cours/terminé) se DÉDUIT
  des dates (plus rien à basculer), `draft` remplace le `hidden` V2 et est
  filtré CÔTÉ SERVEUR. `meta.phases` devient la source unique des dates
  intermédiaires (le bloc `timeline` les rend, l'en-tête met en avant le jalon
  courant) — la V2 les retapait en dur dans la prose ×4 langues. Admin
  `/admin/tools/events` (maître/détail, blocs réordonnables, bouton Traduire
  DeepL/Haiku) et `events.json` rejoint `RUNTIME_DATA_FILES` : **enregistrer
  publie sur R2, l'événement paraît en prod sans redéploiement**. Au passage :
  `loadRuntimeJson` extrait de `lib/home` en module partagé, collecte R2 des
  visuels d'événement data-driven dans le manifeste, `ToolShell` extrait du
  routeur à plat (partagé avec la route dédiée `/event`), et la CSP ouvre
  `frame-src` à Twitch/Bilibili — `MultiVideoEmbed` sait les embarquer depuis
  toujours mais leur lecteur était bloqué en silence. Contenu V2 transplanté
  (concours vidéo de mars + le teaser `_no-peaking`, en brouillon). 578 tests
  verts (+20). RESTE : pousser `images/events/**` sur R2 (`pnpm images`).

- **Promotion du patch réparée + deux verrous dans `promote` (cd218dc,
  d263b88).** Les invariants d'encounters.test ont détecté un état MI-PROMU :
  `monsters.json` copié verbatim depuis l'extrait SANS ses 41 skills ni les 57
  donjons de ses spawns (les boutons admin « Enregistrer » n'y sont pour rien —
  ils embarquent bien entité + skills + donjons ; c'est une promotion par
  fichier qui a coupé le trio). Verrous : ① `--only` sur un membre du trio à
  rétention (monsters/monster-skills/encounters) ENTRAÎNE les deux autres
  (unité référentielle) ; ② les entités retenues sont marquées `retired: true`
  (archives — contenu retiré des tables, ex. les 6 donjons world boss event
  554xxx purgés par le patch) et l'invariant d'aller-retour spawn↔donjon
  exempte les archives. Promotion appliquée SANS les persos en proposition
  (décision Sevih : lambda `2000118` et `2400015` ne partent pas — vérifié :
  aucun de leurs skills/EE dans les 15 fichiers promus). 552 tests verts.
  Régime de croisière : une regen complète par patch → invariants verts ; les
  retraits de contenu futurs passent en archive automatiquement. Décision
  Sevih : l'enregistrement UNITAIRE d'un monstre reste chirurgical (il
  n'entraîne PAS les co-monstres de ses donjons — si l'invariant d'aller-retour
  signale le reste du roster, c'est une CHECKLIST, pas un bug ; le lot = bouton
  « Enregistrer le mode »).

- **`/characters` : retour au `?z=` compact (codec V2) dans la barre
  d'adresse.** Décision Sevih : la barre EST le lien de partage (réflexe =
  copier l'URL, pas un bouton), et les params en clair faisaient des URLs de
  300 chars dès que les facettes s'empilent. `filter-codec.ts` (10 tests dont
  épinglage octet-à-octet + décodage d'un payload V2 brut) : bitfields aux
  POSITIONS V2 avec les slugs V3 (le contrat = les bits, pas les chaînes),
  indices buffs/debuffs/tags GELÉS depuis `effectsIndex.json` V2 (snapshot
  21/07) avec canonisation V3 au décodage (variantes `_IR` → clé de base,
  dédup) ; toute clé future sans indice voyage en clair dans `bx`/`dx`/`tx` —
  zéro table à maintenir, zéro dérive possible. Conséquences : les liens V2
  `/characters?z=…` se décodent à nouveau ; les params en clair de la période
  intérimaire restent lus à l'hydratation (legacy), la sync n'écrit plus que
  `?z=`. Piège appris : l'alphabet lz-string URI-safe contient `+`
  (URLSearchParams le rend en espace, `decompressFromEncodedURIComponent` le
  restaure — testé). Le raccourcisseur `/s/[id]` est NOTÉ au TODO (non
  prioritaire, la barre compacte couvre le besoin).

- **Badges de recrutement : SÉRIE DÉPAREILLÉE corrigée (constat Sevih).** Les
  5 `CM_Recruit_Tag_*` étaient collectés de DEUX sources : le jeu ne porte que
  Seasonal/Premium/Fes, donc ces trois venaient du client et Collab/Free du
  wiki — trois sprites du jeu et deux visuels wiki côte à côte sur la même
  carte. Les 5 PNG V2 sont désormais convertis en webp DANS le pool éditorial
  V3 (`data/editorial/ui/recruit/`, versionné : plus rien à chercher dans la
  V2) et le manifest les déclare en source EXCLUSIVE (`candidates: []` → le
  sprite du jeu, même présent, est ignoré). Vérifié : `assets:collect` refait
  exactement 5 assets, tailles staging = tailles éditoriales (copie brute).
  Second bug trouvé au passage : le repli V2 ne résolvait PAS ici (il n'y
  porte que des `.png` quand la clé demande `.webp` et que la copie éditoriale
  est brute) — les deux webp présents étaient des VESTIGES non reproductibles.
  `stage.ts` documente la règle de format et signale désormais correctement une
  source éditoriale absente (au lieu de « sprite introuvable : undefined »).
- **Les 4 items d'audit du 17/07 traités (décisions Sevih).**
  ① `ModeColumns` REFONDU : une seule instance de chaque colonne, bascule
  mobile/desktop en pur CSS (avant : bloc mobile + bloc desktop = colonne
  active sérialisée 2×). Mesuré sur `/guides/special-request` : 175 → 165 Ko
  d'HTML, 45 → 40 occurrences de cartes (plus aucune dupliquée) ; titre de
  colonne en `sr-only` mobile (l'onglet en tient lieu) → l'a11y ne régresse
  pas. ② `item-blacklist` DÉPLACÉ dans `datagen/lib/` : ses 3 consommateurs
  sont des générateurs et AUCUN code `src` ne le lisait — l'import
  datagen → src violait la doctrine des contrats pour rien. ③ `[+Turn]` :
  FAUX POSITIF de l'audit, comportement CONSERVÉ et commenté — les 22 usages
  réels sont des DURÉES (« [+Turn]ターンの間 » = pendant N tours), un signe
  donnerait « pendant +2 tours » ; la V2 fait pareil et `[-Turn]` n'existe
  dans aucune table. ④ `comics.json` EXEMPTÉ du signalement « orphelin » de
  `promote` (`isArchive` → `isPureCurated`) : validé pur par construction
  (BD faites main, `buildComics` volontairement hors `build.ts`, manifeste R2
  à la requête) — le warning à chaque promote masquait les vrais orphelins.
- **Outil `/team-planner` porté.** ① Moteur SERVEUR dans `skill-view.ts` :
  `buildTeamKitView` (4 tests) — mêmes règles de routage que les cartes de la
  fiche (variantes unies, passifs rattachés caller/convention, upgrades de
  transcendance exclues, résolution chips) mais qui CONSERVE la cible de
  chaque effet et isole ce que le burst APPORTE (chips absentes du kit de
  base — équivalent du flag `burst` du générateur skill-buffs V2, sans
  pipeline Python : tout sort de `skills.json`). ② Wrapper : classement par
  cible/nature (self / équipe / debuffs ennemis / burst / chaîne / duo), EE
  compté dans le kit de base (passifs `equipment/passives.json`), le client ne
  reçoit que des réfs + la `StatusMap` résolue (trimée aux réfs utilisées).
  ③ Client sur primitives V3 (`EffectIconBadge`/`EffectChip`,
  `CharacterPortrait`) : croix 4 slots (sprites `ui/skillchain`, 6 collectés —
  `T_FX_SkillChain_Mask` absent des bundles extraits → repli pool V2 via
  `editorialFallback`), buffs self en icônes près des portraits, ordre de
  chaîne (échange par deux clics, validité Start/Join/Finish par position,
  icônes d'effet sur fond bleu/rouge/gris), synthèse par perso (team
  buffs/debuffs, burst, duo si équipe complète), picker
  recherche + élément/classe. Roster V3 complet (core-fusion INCLUSES — kits
  propres, absentes de la V2). ④ Partage : format `?z=` V2 à l'identique
  (lz-string ajouté, ids de base = ids du jeu → liens V2 compatibles), legacy
  `?t=&o=&n=` décodé. Clés `tools.team-planner.*` déjà ×5 depuis le pré-seed.

- **Deux « décisions en attente » tranchées (Sevih).** ① `CHASE_TITLE_KEY`
  (sources.ts) : **gardé en dur et ASSUMÉ par un commentaire** — la poursuite
  est nommée à deux niveaux dans le jeu (le MODE « Pursuit Operation », ce que
  rendrait `modeTitleKey`, vs le CONTENU « Irregular Extermination Project »,
  celui qu'on veut sous le portrait du boss) ; le curer dans `mode-titles.json`
  renommerait AUSSI le mode sur les fiches de monstres, d'où la constante.
  ② Convention `_doc` des curés **uniformisée et gravée dans CONVENTIONS.md**.
  L'inventaire des 21 curés a montré DEUX familles que l'item confondait :
  `_doc`/`_docXxx` à la racine = doc de fichier (7 fichiers, la majorité) ;
  `note` DANS une entrée = justification de cette entrée (gear-reco ×89 =
  contenu AFFICHÉ, effects ×18, items) — à NE PAS renommer. Restaient 2 vraies
  divergences, corrigées : `singularity.note` → `_doc`, `monster-skills._notes`
  → `_docNotes` (loaders vérifiés tolérants avant renommage : singularity ne
  lit que `anchor`, le store admin fait du read-merge-write).
- **Outil `/tier-list-maker` porté + PREMIER code BDD de la V3.** ① Socle :
  `src/lib/db.ts` (mysql2, connexion éphémère par requête, `null` sans env
  `DB_*` → toute fonctionnalité dégrade) + routes `/api/tierlist` (POST
  rate-limité 30/min/IP, id = sha256(payload) tronqué — idempotent ; GET par id,
  cache 5 min) — MÊME table `tier_lists`/mêmes ids que la V2. ② Codec du lien
  de partage extrait en module PUR `share-codec.ts` (6 tests dont un ÉPINGLAGE
  octet-à-octet du format : les liens `?z=` V2 circulent, le format ne doit
  jamais bouger) — encodage par rang de sélection contre un canon par type trié
  par id numérique. Compat canon : core-fusion EXCLUES du pool perso. ③ Wrapper
  serveur : pools localisés (persos + 99 costumes via `appearances`, EE, boss =
  monstres `type boss` référencés par une rencontre dédup par icône — règle
  DUPLIQUÉE dans le manifeste d'assets pour la collecte des portraits, 33 MT_
  produits + push). ④ Client réécrit sur tokens V3 : DnD pointeur
  (souris/tactile + tap-to-place), lignes éditables (label/couleur/palette/
  réorder), pool filtrable 3 onglets, export PNG canvas (fond tokens V3,
  `crossOrigin` — l'export dépend du CORS de img.outerpedia.com, garde-fou
  `export_blocked` sinon), export/import JSON, réglages via `useStoredState`
  (clé `outerpedia:tier-list-maker:settings` v1, legacy `tlm-settings`
  absorbée). RESTE côté infra : décommenter `DB_*` (fait dans sevih-tool, à
  déployer) et DÉCIDER la migration de la table `tier_lists` V2 → MySQL VPS
  (sans elle, les liens courts `?s=` V2 sont morts — les `?z=` longs, eux,
  marchent).

- **Cache statique des images ALIGNÉ en prod (e172ec9).** `assets:push --full`
  (9094 assets ré-uploadés + purge edge) : un en-tête S3 est figé à l'upload et
  le push incrémental ne renvoie que ce qui change — les objets déjà en place
  seraient restés en `max-age=600` pour toujours. Vérifié par `curl` :
  images `max-age=86400`, `data/*` (coupons/bannières) inchangé en 300/600.
  Dernière marche du hint « efficient cache policy » côté assets.

- **Outil `/progress-tracker` porté** (+ hook `useStoredState` posé la veille,
  a06cdfe). Logique V2 réécrite en fonctions PURES
  (`_contents/progress-tracker/tracker.ts`, 28 tests) : `count` = seule source
  de vérité (« complété » = count ≥ max TOUJOURS dérivé des réglages — la V2
  stockait `completed`/`maxCount` en doublon et son `toggleTask` était du code
  mort), resets UTC (quotidien/lundi/1er) via arithmétique epoch, couloir
  infini (3 j après complétion), VHT (phases 1/8/15/22), fabrication précise
  (30 j glissants), singularité mer→sam, packs (Terminus/Veronica/licence).
  Persistance via les DEUX specs actés : `outerpedia:progress-tracker`
  (legacy `outerplane:progress`) et `…:settings` (legacy
  `outerplane:settings`), `coerceProgress` absorbe le schéma V2 (y compris le
  vieux « coché sans count »), clés V2 laissées en place. Le client ne lit
  JAMAIS le stocké tel quel : vue `reconcileProgress` à chaque rendu (tick
  60 s), mutations depuis la vue → resets persistés au premier geste, zéro
  effet de synchro. Définitions verbatim (`tasks.ts`, labelKey dérivé),
  wrapper serveur (libellés + 27 items du catalogue résolus par nom EN +
  sprites monnaies), UI V2 refaite sur tokens V3 (cartes-onglets / page
  unique, hiérarchie boutique, modales réglages 5 onglets + export/import —
  l'import accepte aussi un export V2 brut). 4 icônes nav + monnaie de guilde
  ancrées au manifeste (déjà sur R2 via le re-push du 20/07).

## 2026-07-20

- **Socle `client-storage` posé AVANT les outils à état client (1f53858,
  a06cdfe).** `readStored`/`writeStored`/`clearStored` + `useStoredState`
  autour d'un `StoreSpec` déclaré par l'outil. Trois conventions, tirées des
  ratés V2 : version de schéma DANS la valeur (`{v, data}` + `migrate`) et
  JAMAIS dans le nom de la clé (les bumps V2 `damage-lab-form-v9` perdaient les
  données) ; absorption des clés V2 héritées à la première lecture (`legacyKeys`
  - `fromLegacy`) puisque la V3 remplacera la V2 sur le MÊME origin — périmètre
    arbitré : `outerplane:progress`/`:settings` et `tlm-settings` repris, redeem
    et damage-calc/lab NON ; la clé V2 est laissée en place (retour arrière).
    SSR/JSON corrompu/quota → `fallback` silencieux, lecture après montage
    (`ready`) donc zéro mismatch d'hydratation. 10 + 6 tests. Premier
    consommateur : le progress-tracker le lendemain.

- **Audit Sitebulb de la prod (crawl du 20/07, export `docs/seo&audit/`) —
  3 hints majeurs traités.** ① **Canonicals (7144d84, ~70 % de l'audit)** :
  `buildUrl` en mode path préfixait la langue par défaut alors que le proxy
  SERT `/characters` et REDIRIGE `/en/characters` — 1163 pages annonçaient
  comme canonique une URL qui redirige (+ hreflang, x-default, sitemap). La
  langue par défaut n'est plus préfixée (même convention que le mode
  subdomain), la redirection `/en/*` passe en 308 permanent, 3 tests réalignés.
  Au passage : 2 hrefs du changelog curé pointaient le slug V2
  `primordial_sentinel` (404) → `primordial-sentinel`. ② **`/4-comics`
  22 Mo (537dd8a)** : la grille rendait les planches PLEINE TAILLE (~758 Ko
  pièce) ; `collect-comics` émet désormais `<stem>.thumb.webp` (360 px, q75,
  idempotent mtime), la grille charge ~44 Ko/planche (×17), la lightbox garde
  l'original, repli `onError` le temps que R2 se peuple. ③ **Cache statique**
  : `max-age` navigateur des images 600 → 86400 (arbitrage Sevih : une
  correction reste visible sous 24 h, contre ~1456 revalidations par visiteur
  récurrent) ; `/icons/*` et `/favicon.ico`, servis en `max-age=0` par Next,
  passent à 1 semaine via `headers()` (4c8f294). CLASSÉ BRUIT après mesure :
  « properly size images » (les sprites sont à ~2× leur rendu = correct pour le
  rétina, Sitebulb crawle en densité 1), CSS render-blocking (2 fichiers Next
  gzippés immutable), majuscules des slugs adventure, GA/GTM absents (design).
  Duplicate content : RAS.

- **Site INSTALLABLE — PWA sans service worker (0b03a75).** Le « worker » de la
  V2 était un service worker dont le vrai rôle était de rattraper les chunks
  orphelins après déploiement : Next 16 gère ça nativement (fallback navigation
  complète), les statiques sont déjà `immutable` et les images vivent sur R2 —
  le porter aurait réintroduit sa machinerie (`set-version.js`, cache versionné)
  pour rien. Livré à la place : `src/app/manifest.ts` (route metadata, servie
  sur `/manifest.webmanifest` — chemin déjà whitelisté par le garde anti-points
  du proxy) + icônes 192/512 sous `/icons/` (préfixe autorisé), couleurs
  `--surface-base` V3, et `appleWebApp` dans le layout (standalone iOS ancien +
  barre de statut + titre d'app). Pas de mode hors-ligne : un wiki vit de
  données fraîches.

- **Bannières de la home : source CURÉE + lecture RUNTIME R2 (56672b3,
  af5136e).** La home lisait `recruit.json` (dérivé des tables du jeu) qui
  n'émet QUE les bannières limited : Caren, en pickup normal, manquait alors
  qu'elle était dans l'éditeur admin. Bascule sur `data/curated/banner.json`
  — décision Sevih : les patch notes tombent 24-48 h AVANT la mise à jour du
  jeu, la curation permet de pré-saisir ; le généré reste la source des guides
  (historique release/rerun). `activeBanners()` retiré (sans consommateur).
  Puis même patron que les coupons : `loadRuntimeJson` (fetch R2, revalidate
  600 s, repli committé), publication R2 au Save admin et au regen V2 via
  `runtime-publish` (module généralisé depuis `coupons-publish`), résultat
  affiché dans l'éditeur → une bannière saisie est en prod en ≤ 10 min sans
  redéploiement. Éditeur `/admin/tools/banners` refait au passage : picker
  compact (fini le nom tronqué sous un portrait), badges
  Active/Upcoming/Expired avec jours restants, lignes expirées atténuées.

- **Outil `/pull-simulator` porté.** Moteur pur dans `src/lib/gacha.ts`
  (4 bannières aux taux V2, session immuable, garantie 2★ du x10, mileage) —
  FIX au passage : la V2 amorçait le compteur « premier 3★ » à `totalPulls`
  avant de re-parcourir tout l'historique (numéro compté double dès la 2e
  salve) ; en V3 les deux compteurs comptent depuis zéro (helper unique,
  vérifié par smoke). Wrapper serveur : pools depuis le catalogue — entités
  CORE-FUSION EXCLUES (non tirables ; la V2 n'en avait pas dans son index),
  rareté 1/2 = pools mineurs, 3★ catégorisés par tags (premium /
  limited-seasonal-collab / normal), noms+préfixes localisés serveur,
  recherche multilingue via `characterSearchNames`+alias. Client sur les
  primitives V3 (FilterPill, CharacterPortrait wrappé, FitText, tokens ;
  ambre/violet = couleurs de donnée) : focus en combobox, x1/x10, mileage,
  cartes de résultat, stats de session, historique par batch. Identité par ID
  (plus de slugs — des 3★ sans fiche publique restent tirables).
- **Outil `/patch-history` porté + archive Stove migrée.** Le pipeline major9
  existait déjà (getNews → `posts.json`, images staged/R2) ; ce chantier a
  ramené le RESTE. ① Migration ONE-SHOT `scripts/migrate-legacy-news.ts` :
  `legacy-posts.json` (806 posts EN, archive figée) copié verbatim + les 2 749
  images RÉFÉRENCÉES par le contenu (déjà toutes .webp) copiées de la V2 vers
  le staging → 211 Mo poussés sur R2. Collecte DATA-DRIVEN : le dossier V2 en
  contenait 6 684 (originaux jpg/png, orphelins) — non embarqués. ② Outil :
  wrapper serveur (posts major9 de la langue courante ; en/jp/kr seulement →
  zh ET fr replient sur en, bandeau ; la V2 ne gérait que zh et le libellé fr
  du bandeau parlait du chinois — corrigé) + client (ères, filtres par type,
  recherche titre+contenu, pagination fenêtrée, posts dépliables, `?era&type`
  - `#slug` auto-déplié). L'archive legacy (2,8 Mo) n'est PAS dans le bundle :
    chunk chargé au premier passage sur l'ère Smilegate. ③ `prefixAssetSrcs`
    (images.ts) préfixe la base R2 sur les `src` relatifs stockés — solde
    l'item « Patch-notes : préfixer NEXT_PUBLIC_IMG_BASE » de l'ex todo-data.
    ④ CSS `.patch-note-content` porté sur les tokens V3.

- **Onglets « game » et filtres UNIFORMISÉS sur tout le site.** Le visuel
  d'onglet glow (`.tab-game-active`) devient LE style d'onglet : classes
  partagées dans `ui/game-tab` (SegmentedTabs, ui/Tabs `variant="game"`,
  onglets de builds de GearRecoSection), teinte paramétrable `--tab-glow`
  (défaut `var(--cd-el, ambre)` — la fiche perso teinte ses onglets à
  l'élément SANS style inline). `/equipment` : tabs → game (en gardant
  `?tab=`, règle hors guides) et filtres refondus sur la toolbar de
  /characters (SearchField/BarGroup/ToolbarDivider MUTUALISÉS dans
  FilterAtoms, pills élément/classe/étoiles multi-sélection). Filtre source
  en pills à icônes multi (OU) : portraits de boss (halo élémentaire) +
  boutiques (sprites CM_Adventure_License / CM_Shop_Shortcuts_EventShop,
  déjà sur R2) ; doublon Event Shop réglé À LA RACINE — le curé équipement
  gagne `source.shops` (slugs, vocabulaire de l'extraction), les 17
  `label: "Event Shop"` migrés, `resolveSource` fait l'union dédoublonnée ;
  queue de liste éditoriale (4 boss d'équipement puis boutiques, le reste
  alphabétique devant).
- **Variantes irregular, PASSE 2 : /equipment éclaté en cartes ET fiches PAR
  variante (retour Sevih : « 1 seule carte pour tous »).** Le browser rend
  UNE carte par variante (tuile/passif/nom suffixé/classe propres — plus de
  bloc « variants » groupé, retiré de cards.tsx) et chaque variante a SA page
  détail au slug suffixé (`briareoss-recklessness-defender`…) = les URLs V2
  (le suffixe était dans le nom → même slugify, les liens survivent). 20
  fiches : 2 armes ET 2 amulettes (Ambition/Vanity, couvertes par le même
  chemin). `classPassives` porte le `slug` de variante ; `gearModel` accepte
  une variante (nom/tuile/classe/SON passif/SES porteurs) ; le slug de
  FAMILLE reste servi en vue d'ensemble (compat V3, plus listé dans
  sitemap/llms) ; resolveItem/loot/stats lient la fiche de la variante.
  Manifest : PNG og pour TOUS les membres du palier max (+ passifs par
  variante), 13 assets poussés sur R2. tsc ×3 + eslint + 300 tests src verts.
- **Variantes de classe des items irregular (Briareos/Gorgon) distinguées
  partout (constat Sevih en relisant les outils gear).** En jeu ce sont 5
  objets distincts par item (un par classe : tuile ET passif propres) ; la V2
  les séparait en bakant « [Striker] » dans le nom à la main. La famille V3
  les groupait sous la tête (Striker) → BUG réel sur la fiche perso :
  `resolveItem` affichait la tuile ET le passif Striker pour un build
  référençant la variante Defender (ex. 2000106/787). Décision (tuile +
  suffixe, périmètre complet) : `classPassives` porte maintenant l'`icon` de
  chaque variante ; nouveaux helpers `withClassSuffix` (suffixe = libellé de
  classe OFFICIEL du jeu via `glossaries.classes` — « [Defender] » /
  「[防御型]」, comme la V2) et `memberClassVariant` (id membre → identité de
  SA variante). Corrigés : fiche perso + aperçu admin (resolveItem : tuile/
  passif/nom/classType de la variante), loot de donjon (nom suffixé),
  gear-usage-statistics et gear-usage-finder (clé `famille:classe` → 5 lignes/
  entrées par item, chacune sa tuile et sa classe), carte /equipment (chaque
  bloc de variante montre SA tuile ; la page détail taguait déjà par classe).
  Smoke test tsx sur les 3 vues + tsc + eslint + 300 tests src verts.
- **Règle « état interne d'un guide = hash » APPLIQUÉE partout (item Dette
  soldé).** `BannerTabs` bascule de `?banner=` (useUrlTab) au hash
  (`#banner=`, patron url-hash/SegmentedTabs, prop `urlKey`) ;
  `free-heroes-start-banner` ET `premium-limited` (3e contrevenant, découvert
  au passage) troquent `ui/Tabs ?tab=` contre `SegmentedTabs variant="game"
urlKey="tab"`. Plus AUCUN `?param` dans `guides/` ; `useUrlTab` reste le
  moteur de `ui/Tabs` seul (doc à jour). Vérifié : tsc propre, les 3 guides
  rendent en 200.
- **Tests générateurs : le TRIO PRIORITAIRE couvert (2270b92, 28 tests).**
  encounters/singularity/content-schedule, selon les deux registres actés
  (CI sans `.gamedata`) : cœurs PURS en synthétique (traversée spawn — CSV,
  slots ID0..3, dédup/accumulation — et `isoUtc` exporté pour ça) +
  INVARIANTS sur data/generated committé (références croisées d'encounters
  monstres/rewards/geas/rankOptions/spawns aller-retour/group mono-contenu,
  vagues tout-ou-rien conformes au contrat de sérialisation ; singularity
  rotation ordonnée + ancre curée + boss complets ; content-schedule tri,
  bornes ISO ordonnées, donjons des saisons SERVIES — jc tous, gr saison
  courante —, monstres de toutes les saisons, boss canonique courant).
  Reste dans l'item : les autres générateurs + build/refresh, même méthode.
- **Helpers seo.ts BRANCHÉS (c9cbb78) — VideoObject + FAQPage (item Dette
  soldé).** Pipeline video-meta porté de la V2 en mieux : collecte
  DATA-DRIVEN (marche des JSON de guides + curé persos) au lieu du scan
  regex des .tsx, fetch incrémental YouTube API (`pnpm datagen:video-meta`,
  YOUTUBE_API_KEY optionnel), purge des fantômes ; seed = cache V2 (169),
  complété à 221. `VideoJsonLd` (serveur, pendant SEO de MultiVideoEmbed
  client) branché dans les 5 moteurs de guides + la fiche perso — sans
  meta, rien d'émis (jamais de schéma invalide). `buildFaqJsonLd` branché
  sur beginner-faq : FAQ_LD déclaratif (14 Q/R en phase avec les QACard) +
  `plainInlineText` (parse-text) qui aplatit les tags pour le JSON-LD.
  Vérifié en dev : FAQPage 14 questions, VideoObject complet sur dahlia.
- **Outil `/gear-usage-finder` porté — même régime gear-reco à la lecture.**
  La V2 lisait un artefact de pipeline `gear-finder-index.json` ; en V3
  `finder.ts` assemble au rendu, depuis la gear-reco curée, les builds MIS À
  PLAT par FAMILLE (mains multi « ATK%/SPD » éclatées, presets `$` résolus —
  sets ET substats, priorité « A>B=C » éclatée en clés) + les catalogues
  sélectionnables (familles d'armes/amulettes avec `classLimits`/pools de
  mains, sets). Client `GearUsageFinderBrowser`, parité V2 : modes Recommandé
  (pièces/mains présentes dans les builds, main stricte) et Libre (tout le
  catalogue, scoring main=4 pts + 1/substat), parcours type → classe → pièce →
  main → substats, résultats en cartes triées par score (meilleur build par
  perso, compte de builds). Différences V3 assumées : unité = famille (pas la
  variante d'étoiles), restriction de classe vide = pièce montrée pour toutes
  les classes, mains du mode libre = pools réels de la famille (la V2 codait
  la liste en dur pour les armes). Pills de classe = `ClassIconPill` partagée.
  Smoke test tsx : 246 builds, 55/51/21 catalogues, éclatements vérifiés.
- **Outil `/gear-usage-statistics` porté — agrégation gear-reco à la lecture.**
  La V2 générait `gear-usage-stats.json` par un step de pipeline sur ses
  fichiers de reco par perso ; en V3 l'usage se calcule au rendu depuis la
  GEAR-RECO CURÉE (source unique des builds de fiche perso — `usage.ts`, même
  régime que most-used-units). Unité de compte = la FAMILLE d'équipement
  (armes/amulettes/talismans, presets `$` résolus) et le SET pour les armures ;
  ids inconnus/`!refs` non arbitrés SKIPPÉS (modèle `unresolved` de la fiche,
  pas une erreur) ; dédup par (perso, pièce). Abandonné : `buildNames` du JSON
  V2 — jamais affiché, et son accumulation était cassée (le `seen` par perso ne
  gardait que le premier build). Client `GearUsageBrowser` : onglets ×4 avec
  comptes, recherche multilingue, lignes classées (tuile `EquipmentIcon` —
  étoiles du haut de famille, passif/enchantement en overlay, cadre `unique`
  pour les sets comme /equipment —, barre proportionnelle, count) dépliables
  sur les persos (portrait + lien fiche). État local pur (parité V2, pas de
  sync URL). tsc (src) + eslint verts ; datagen/tests rouges = WIP du worker
  generators (content-schedule/encounters), hors périmètre — le bump sharp
  0.35 de ce chantier-là cassait par contre tout `pnpm typecheck` : corrigé
  (import nommé `type Sharp`, d12e5af).
- **Page `/changelog` du site livrée (entrée reconstituée depuis le
  TODO, le worker n'avait pas journalisé).** Journal du site refait propre
  (pas de portage V2) : socle données + migration des 134 entrées V2, page
  publique + section Recent Updates de la Home (rebranchée) + i18n (5
  locales), éditeur admin (store + route `.dev` + presets + lien typé +
  date/programmée/brouillon + regen V2 + sidebar Tools), flux RSS dédié
  `/feed/changelog` avec filtre de programmation. Vignette = og:image de la
  cible (garde-fou `og_default`) ; upload abandonné (inutile).
- **Outils admin Search aliases + Short names livrés (a36c228, worker
  aliases — entrée reconstituée).** Curés par perso. Le transitoire
  `@/lib/data/name-aliases` (importé mais inexistant, tsc cassé sur main
  quelques heures) a été résolu par SCISSION : `search-aliases.ts` (élargit la
  recherche) + `short-names.ts` (noms courts d'affichage) — vérifié, tsc
  propre. Solde aussi l'item « name-aliases.json à porter » de l'ex-section
  Données V2 (parité V2 atteinte via les deux curés).
- **H1 réellement centrés sur les pages du site (8588562).** Les headings
  sont en `width: fit-content` (globals.css, trait de titre du jeu) :
  `text-center` seul ne centre RIEN — le centrage passe par `mx-auto` sur le
  bloc. Vrais bugs corrigés (/contributors, /coupons, /changelog : intention
  `text-center` annulée par le fit-content) ; H1 à gauche centrés (/equipment
  en-tête complet, /legal, /guides/[category] bloc icône+titre, guide détail
  sans boss aligné sur la variante boss, /contribute ×4). Exclusions voulues
  (mises en page propres) : /characters/[slug], /tools, /tools/[slug],
  EquipmentDetail. Déjà bons : /characters, /guides, /tierlist, HomeHero.
- **Icône `bosses.json` unifiée sur l'id BRUT (décision Sevih : go).** Le
  générateur bakait `MT_<FaceIconID>` dans la donnée là où `monsters.json`
  stocke l'id brut (préfixe au rendu) — ambiguïté qui mordait en refactor
  (double préfixe / 404). Désormais : id brut partout, le sprite est une
  affaire de vue. `bosses.ts` (+ doc du type), 4 sites de rendu
  (GearRecoSection ×2, equipment/cards, EquipmentDetail) et le manifest
  d'assets préfixent `MT_` eux-mêmes ; `bosses.json` régénéré (diff = les 14
  champs `icon` exactement, promotion ciblée `--only`). Au passage, le
  dry-run de promote a CONFIRMÉ rétroactivement la neutralité de tous les
  refactors datagen du jour (39 fichiers identiques) et révélé un perso
  `lambda` (2000118) en attente dans l'extraction — non promu, décision de
  contenu. Vérifié : tsc, eslint, 461/461, fiche équipement en dev (émet
  `MT_4013071.webp`), assets:collect stable (mêmes clés R2, 0 re-staging).
- **`coupon-codes` résolu + coupons en RUNTIME R2 (zéro redéploiement).**
  ① `coupon-codes` n'est pas une page : renvoi vers `/coupons` (parité V2) —
  le champ `href` du curé outils, déjà présent dans `_index.json`, est
  maintenant SERVI (`ToolMeta.href`, landing `/tools`). ② Décision Sevih :
  un code poussé ne doit plus redéployer le site → patron du manifeste comics
  généralisé : `lib/home` lit `data/coupons.json` sur R2 à la requête
  (revalidate 600 s, repli committé en dev/panne ; `getActiveCoupons`/
  `getAllCoupons` async — home et /coupons passent à l'ISR 10 min de fait).
  Publication À LA SAUVEGARDE admin : `lib/admin/coupons-publish` (rclone
  copyto + purge edge d'une URL, conventions assets-push ; `s-maxage` COURT
  10 min — donnée vive, l'edge se rafraîchit seul même sans purge ; pire cas
  sans Cloudflare : ≤ 20 min). Branchée sur la route curated/coupons ET le
  regen V2 ; l'éditeur affiche « Saved + publié (live ≤ 10 min) » ou
  l'avertissement d'échec (l'écriture locale n'est jamais invalidée).
  Namespace R2 : `data/` (JSON runtime, distinct des images). tsc + eslint +
  tests verts. COMPLÉMENT (échange Sevih) : les JSON runtime entrent aussi dans
  le STAGING (`assets:collect` copie `data/curated/{coupons,banner}.json` →
  `data/`) — le flux `pnpm commit` (→ `pnpm images`) resynchronise donc R2 même
  si une édition a contourné le Save admin ; `assets:push` leur applique un
  Cache-Control COURT dédié (donnée vive ≠ asset immuable, deux lots rclone).
  Copies initiales poussées + vérifiées servies (200, bon en-tête).
- **Hygiène CLI datagen : l'item ⚙️ soldé (re-vérifié : 3 cibles n'existaient
  plus — coherence.ts, extractor/run.ts, import-gear-reco).** ① Gardes
  `isMain` : extract.ts, convert.ts (script top-level enveloppé dans `main()` —
  un import ne déclenche plus conversion + purge des fantômes), collect.ts
  (garde + `.catch` → exit 1, plus d'unhandledRejection). ② Flags stricts :
  `version-boss` refuse un flag sans valeur (`--ref --label x` prenait
  `--label` comme ref) ; `promote --only` borné au PROCHAIN flag (absorbait
  les fichiers situés après `--apply`). ③ `loadEnvLocal` (lib/env, hérité de
  la note r2.ts) : quotes d'enrobage dotenv retirées. ④ pull-gamedata :
  GARDE-FOU dossier distant absent — les signatures distantes vides faisaient
  passer « jeu désinstallé » pour « tout a disparu » et PURGEAIENT le miroir
  local entier ; désormais erreur explicite (`; true` pour que le test négatif
  ne fasse pas jeter adb avant le message, même piège que dump.ts). Vérifié :
  tsc, eslint, promote.test 12/12, CLI réels (usage, flag sans valeur,
  convert 257/257).
- **Homonymes site/admin désambiguïsés (dernier item Duplication).**
  `rankOptionLabels` (admin/monster-store) → `rankOptionAdminLabels` : PAS le
  même contrat que celui du site (EN seul + repli en cascade vs localisé +
  option inconnue omise) — doc croisée des deux côtés. `BOSS_TYPES` ×2 →
  `FORMATION_BOSS_TYPES` (data/towers : mène une formation) et
  `BOSS_BADGE_TYPES` (admin/monster-icon : porte le badge, `season_boss` en
  plus) — sets volontairement distincts, commentaires « ne pas fusionner ».
  Vérifié : tsc, towers.test 19/19, eslint.
- **Dette code datagen : le gros item duplications ×N soldé.** ① Traversée
  « monstres spawnés d'un donjon » ×3 → `dungeonSpawnedMonsters` (encounters,
  à côté de `spawnGroupIds`/`spawnUnits`) ; singularity/content-schedule en
  wrappers d'une ligne, sources garde son filtre boss dessus. ② Expansion
  BuffGroup Child1..10 ×3 → `loadBuffGroups` (lib/buff) devient l'index UNIQUE,
  stampé mtime ; equipment perd `groupKids` ET sa lecture brute (resolveBuffEffects
  itère `grp.kids`). ③ `span()` ×2 → `idSpan` (lib/tables) ; les résolutions
  RewardTemplet restent volontairement SÉPARÉES (contrats `RewardTable` vs
  `MonadReward` différents — mutualiser changerait un JSON committé ; documenté
  dans monad.ts). ④ Walk récursif ×4 → `walkFiles` (lib/fs, nouveau) avec
  option `sorted` (source.ts seul : « premier trié gagne » ; les autres gardent
  l'ordre FS — trier changerait quel doublon gagne). ⑤ `sc()` ×2 →
  `effectIconCandidates` (lib/effects, partagé avec le manifest). Sous-items
  ÉTEINTS constatés : `nameKey`/`isPresent`/regex VA/`norm()` import-* n'existent
  plus. Vérifié : tsc datagen, eslint, 461/461, regen à blanc byte-identique,
  assets:collect à blanc = 0 re-staging.
- **Outil `/most-used-units` porté — agrégation à la LECTURE, plus d'artefact.**
  La V2 générait `most-used-units.json` par un step de pipeline avec 4
  extracteurs par famille ; en V3 l'usage se calcule au rendu (ISR 24 h) depuis
  les fichiers de guides eux-mêmes (`usage.ts`) : collecte STRUCTURELLE unique —
  partout dans les contenus V3, les persos recommandés vivent dans
  `characters: string[]` ou `slots: string[][]` — sur les 9 catégories comptées
  (dernière version seulement pour les guides versionnés, méta courante ; noms
  résolus par `findCharacterByName`, inconnu = THROW, doctrine bruyante).
  Vérifié sur la donnée réelle : 108 persos / 91 guides, top Monad Eva=56 —
  cohérent avec le JSON V2 (56/37 sur les mêmes têtes). Client
  `MostUsedUnitsBrowser` (dans `_contents/`, pattern ost/wallpapers) : barre
  standard + pills de catégorie (`common.all` + catégories présentes, libellés
  `GUIDE_CATEGORIES.label`), lignes dépliables (portrait overlays + guides par
  catégorie en liens), total recalculé sur les catégories cochées, URL à plat
  `q/el/cl/r/cat`. Au passage : `characterSearchNames` factorisé dans
  `lib/data/characters` (le bloc était copié dans /characters + TierListTool,
  le 3e usage arrivait). tsc + eslint + tests verts.
- **Dette code datagen : code mort soldé + helpers adb mutualisés.**
  ① **Code mort (5 sites, re-vérifiés par grep)** : supprimés `hasFaceIconLayout`
  (face-icon.ts — et son en-tête « script à re-porter » corrigé : l'extracteur
  UnityPy est porté, `extract-face-layout.py` via datagen:patch — solde aussi la
  ligne face-icon du doc-item 📚), `r2Push` (lib/r2.ts, doublonnait
  assets-push.mjs), `getMaxLevel`/`resolvePlaceholders` (+ leurs describe) et
  l'export mort `isPermilleRow` (buff.ts). `validateTagDef` : BRANCHÉ au lieu de
  supprimé — nouveau test bloquant de FORME dans tags.test.ts (chaque définition
  de tags.json validée contre le schéma ; la couverture seule laissait passer un
  `kind` hors enum) et commentaire recadré. ② **`extract/adb.ts`** : ADB/PKG/
  capture/stream/pickDevice/ensureRoot mutualisés entre pull-gamedata.ts et
  dump.ts (maxBuffer unifié à 64 Mo, superset sans risque). Vérifié : tsc
  datagen, eslint, suite 461/461 (−5 tests morts, +1 schéma tags), regen à
  blanc → data/generated byte-identique.
- **Outils `/ee-priority-base` + `/ee-priority-plus10` portés + og:image des
  pages d'outil.** Suite du chantier tierlist (même session) : `TierListTool`
  généralisé en socle des 4 tier lists par perso (`mode: pve|pvp|ee-base|
ee-plus10`) — le rang vient d'une jointure par mode (curé perso pour PvE/PvP ;
  `getEEViews()` → porteur pour les EE, rangs `rank`/`rank10` du curé équipement,
  123/123 présents). `TierListBrowser` paramétré par PROPS et non plus par mode :
  `withTranscend` (PvE seul), groupe Rôles si fourni (PvE/PvP), **légende du sens
  des tiers** si fournie (EE seuls — clés `tierlist.legend.*` ; parité V2 :
  les disclaimers restent `tierlist.disclaimer_ee_*`, les clés
  `tools.ee-*.disclaimer` étaient mortes aussi en V2). JSON-LD ItemList étendu
  aux EE (la V2 ne l'avait que sur PvE/PvP). Deux one-liners `_contents/` +
  registre (7 outils portés, restent 11). **og:image = icône de l'outil**
  (demande Sevih) : `img.toolIconPng` + `ogImage` dans le generateMetadata du
  routeur `[slug]` ; manifeste d'assets : variante PNG de TOUTES les icônes de
  l'index curé (le sous-ensemble « portés » vit côté src/app — le lire du datagen
  inverserait la doctrine) ; 18 PNG produits (`assets:collect`) et poussés sur R2
  - purge edge (`assets:push` — `pushed.json` à commiter). tsc + eslint + 465
    tests verts.
- **Bugs sévérité moyenne : SOLDÉS (les deux items datagen).**
  ① **Caches module stampés** (régime mtime/TTL, modèle `curatedKeyCache`) :
  `faceIconIndex` (assets/manifest → CharacterTemplet), `groupKidsCache`
  (generators/equipment → BuffGroupTemplet), `iconIndex` (generators/goods →
  mtime du DOSSIER de sprites, le cache ne tient que la liste des noms),
  `assetEnum` (generators/recruit → mtime de dump.cs). Le 5e site du TODO
  (`v2-control.ts` `curatedKeySides`) n'existe plus — parti avec le chantier
  admin du 18/07. ② **`bool()` généralisé** : les 10 comparaisons exactes
  `=== 'True'` (character, encounters, buff, effects ×6) basculées sur `bool()`
  de lib/tables ; `boolCol` (specs/monster) garde son tri-état mais délègue son
  parsing à `bool()` — un seul point de vérité de casse. NB : le site cité par
  l'audit (`ShowMainPage === 'true'`, character.ts:492) avait déjà disparu (le
  filtre a été retiré). Vérifié : regen à blanc → data/generated **byte-
  identique** (0 diff git), tsc datagen, eslint, suite complète 465/465.
- **Outils `/tierlistpve` + `/tierlistpvp` portés + reliquat `/tierlist` soldé.**
  Découverte : la donnée de rang existait DÉJÀ dans `data/curated/characters.json`
  (`rank` ×123, `rankPvp` ×87, `rankByTranscend` ×14, `roleByTranscend` ×1 —
  l'item TODO « absente en V3 » était périmé) → chantier purement UI/câblage.
  `components/tierlist/tiers.ts` (TIERS S→E, accents de rangée — D tokenisé,
  zinc interdit —, `tierListRankOrder`) + `TierListBrowser` client UNIQUE
  PvE/PvP (la V2 avait 2 clients quasi-clones) : rangées S→E (glyphe
  `IG_Event_Rank_*`), sélecteur de transcendance 3–6★ côté PvE (repli
  `rankByTranscend`/`roleByTranscend` → 6★), URL partageable en params à plat
  (`q/el/cl/r/role/tr`, idiome CharactersBrowser — pas le `?z=` LZ de la V2).
  `CharactersFiltersBar` étendue : groupe **Rôles** optionnel (desktop + rangée
  mobile) et déclencheur avancé optionnel. Cartes en `sizes={{sm,sm,md}}`
  (`ResponsiveCharacterCard` paramétrable, défaut inchangé) — parité densité V2
  (remarque Sevih). Socle serveur `_shared/TierListTool` : lignes liste+curé,
  libellés pré-traduits, JSON-LD ItemList S→E daté (`getMonthYear`). Hub
  `/tierlist` : aperçu top S-tier RESTAURÉ (mélange à graine journalière stable
  ISR, cluster 2 rangées de `CharacterPortrait` dans `FlagshipCard`, repli
  glyphe centré sans données) et liens corrigés `/tools/<slug>` → `/<slug>`
  (routeur à plat). Sitemap : les slugs d'outils portés (registre) y entrent.
  i18n pré-seedée (rien ajouté). tsc + eslint + 465 tests verts.

- **Guild raid — erreurs (item PRIO) : VÉRIFIÉ RÉGLÉ, item retiré.** Le fix
  og:image phase 2 (55f0621, jointure saison + `guideBossMonster`) couvrait
  bien le problème — les 5 pages guild-raid rendent 200 avec le bon titre en
  dev (dignity/frost-legion/madman/planetary/prevent, vérifié le 20/07).
- **og:image des guides SANS boss = icône du meta (d68e140).** La carte par
  défaut du site ne sert plus jamais à un guide : repli ogImage explicite →
  portrait de boss → icône du meta en PNG (Discord/OG digèrent mal le WebP).
  Manifest : collecte PNG du sous-ensemble EXACT que la page utilise (même
  prédicat `guideBossMonster`) — 27 icônes pour 57 guides, poussées sur R2 ;
  stage : la branche `editorial` (pool V2 webp) sait convertir en PNG.
- **Audit cohérence structurelle des guides + harmonisation (9a16ebb).**
  Audit complet `_contents` (12 catégories, ~160 guides) : structure saine —
  familles moteur en re-export 1 ligne, fichiers optionnels par contrat,
  versions archives maigres prévues, validation scan bruyante (33 tests verts).
  Seule asymétrie corrigée : `BossGuide`/`StoryBossGuide` recevaient leur
  `content.json` en prop via 34 wrappers de 8 lignes (adventure ×20,
  dimensional-singularity ×14) — ils le lisent maintenant EUX-MÊMES
  (`readGuideFile`, pattern TowerGuide, jette si absent) et les 34 index.tsx
  sont des one-liners identiques, alignés sur les 6 autres familles moteur.
  Dates `updated` volontairement non stampées (aucun changement éditorial).
- **`/characters` (liste) — PHASE 2 : onglets Effects + Bonus (parité V2).**
  Data worker atterrie (`glossaries.effectFilters` 89/77 + `CharacterListItem.
{buff,debuff,effectsBySource,teamBonuses}`). Nouveau `lib/data/effect-filters.ts` :
  arbre d'options des effets construit CÔTÉ SERVEUR (le gros `glossaries.json` ne
  part pas dans le bundle client), **univers dérivé des agrégats réels** (chaque
  case matche ≥1 perso, chaque clé de perso a sa case — pas de filtre mort).
  Canonicalisation robuste `canonicalEffectKey` : `group` de la taxonomie, sinon
  la convention `_IR → base` (referme les trous `BT_BARRIER_IR`,
  `BT_STAT_BUFF_ENHANCE_IR` sans toucher la donnée). `EffectGroupGrid` :
  grille d'icônes par famille (desktop/sidebar xl) + déroulants à cases (drawer
  mobile), cyan=buff / rose=debuff. Onglet **Effects** : logique ET/OU, **filtre
  par source** de skill (`effectsBySource`, sources présentes seulement), toggle
  **unique**, familles ordonnées (statBoosts/supporting/utility/unique ·
  statReduction/cc/dot/utility/unique), `hidden` exclu. Onglet **Bonus** :
  `teamBonuses` avec icônes de stat (`STAT_ICON`), logique OU. Chips actifs +
  URL partageable (`b`/`d`/`el2`/`src`/`uniq`/`tb`) + reset étendus. Onglets
  data-gated (invisibles sans data). tsc + eslint verts ; pipeline (options ↔
  agrégats) vérifié sur la donnée réelle : 54 buff / 39 debuff, 0 doublon, 0 orphelin.
- **`/characters` (liste) — PHASE 1 : coquille + layout + filtres data-dispo.**
  Refonte du browser minimal (3 selects mono) en **recherche à facettes** parité
  V2, réécrite sur primitives/tokens V3 (zéro import V2). `components/character/
filters/` : `FilterAtoms` (pills élément/classe/étoile sur sprites `img.*`,
  chips ×, toggle AND/OR), `FilterPill`, `CharactersFiltersBar` (toolbar desktop +
  rangées mobiles), `AdvancedFiltersPanel` (onglets), `CharactersFiltersSidebar`
  (xl persistante), `CharactersFiltersDrawer` (bottom-sheet mobile, TOUJOURS monté
  - CSS pour éviter le setState-in-effect banni), `ActiveFiltersStrip` (chips +
    reset + copier le lien). `CharactersBrowser` réécrit : multi-sélection
    élément/classe/rareté/**chaîne**/**gift**/role/**tags** (logique ET/OU),
    recherche **multi-langues**, **URL partageable** (params simples lisibles, pas
    de LZString), hydratation depuis l'URL. `gift` exposé dans
    `getCharacterListItems`. i18n déjà pré-seedée (rien ajouté). tsc + eslint verts.
    (Phase 2 — onglets Effects/Bonus — livrée le même jour, cf. entrée ci-dessus.)
- **Retours Shiraen/Jaego sur les outils publics** (déployés sur le VPS) — 3 fixes.
  • **Synergies** : sélectionner un héros dans la liste l'ajoute DIRECTEMENT au
  groupe (avant : il fallait Entrée après avoir choisi dans le datalist). Entrée
  reste dispo pour saisie manuelle / tag `{…}`.
  • **Reco stars (premium)** : interaction _toggle de borne_ — sur une plage
  4-5, clic 4 = « 5 seul », clic 5 = « 4 seul » (un seul clic, fini le
  double-clic) ; clic dehors étend, clic sur l'étoile unique désélectionne.
  • **Aperçu inline PUBLIC** : garde `IS_DEV` retirée des deux actions read-only
  `renderInlinePreview`/`renderInlineBatch` (rendu de données de jeu publiques,
  aucun secret/écriture) → les `{tags}` s'affichent en prod sur `/contribute/*`
  (avant : blanc hors dev). `autoTranslate` + écriture restent dev-only. tsc +
  eslint OK.

## 2026-07-19

- **Contribution pros/cons & synergies (Jaego) — deux outils publics + import.**
  Deux outils SÉPARÉS (pros/cons et synergies sont deux choses distinctes, comme
  l'admin `/admin/tools/pros-cons` vs `/synergies`).
  • **Réutilisation, pas de réécriture** : le corps d'édition de `EditorialEditor`
  (pros/cons + synergies) extrait dans une brique CONTRÔLÉE partagée
  `editorial/EditorialFields.tsx` ; l'éditeur admin l'utilise (langue + trad +
  save autour), les outils publics aussi (EN only + export). Une seule UI de saisie.
  • **Outils publics** `/contribute/pros-cons` + `/contribute/synergies`
  (`EditorialPublicTool`, paramétré par `slice`/`kind`) : choix du perso par
  **grille de portraits** cliquables (pas un select — on choisit à la tête), avec
  toggle **Add** (persos SANS la slice) / **Edit** (ceux qui en ont), pré-rempli
  depuis l'éditorial existant. Data serveur commune factorisée
  (`editorial-tool-data.ts`). Hub : 2 cartes.
  • **Deux `kind`** `character-pros-cons` / `character-synergy` → même handler
  `importEditorial` : merge par PRÉSENCE de slice (un import synergies n'efface
  PAS les pros/cons existants, et inversement), reste du curé (skills, gear reco)
  préservé, batch auto-trad EN→vides, `upsertCharacterCurated`. Héros de synergie
  résolus nom→id à l'export. Import via le tool générique `/admin/guides`.
  • **Fix** : clé React dupliquée dans `InlineTextField` — les refs perso
  d'autocomplétion (`inline-refs`) dédoublonnées par valeur (20+ persos partagent
  un même nom EN : Ame, Snow, Eva… base/skin). tsc + eslint OK.
- **Sous-outil `/4-comics` (galerie BD) — 3ᵉ et dernier média** (ordre Sevih :
  ost → wallpapers → 4-comics ✓). BD faites main (hors jeu) : **ramenées en V3**
  (27×3 EN/JP/KR de la V2 → `.editorial/comics/<LANG>/`, gitignoré → R2), zéro
  dépendance V2. Générateur `datagen/generators/comics.ts` (`buildComics`, scanne
  les originaux → `{EN,JP,KR}` de stems). Collect `collect-comics.ts` (originaux
  → webp `quality:90`, idempotent mtime) ajouté à `pnpm images`. Page
  `_contents/4-comics/` (wrapper serveur + `ComicsGallery` client : onglets
  langue, grille portrait, lightbox clavier) sur tokens V3. Lib `comics.ts`,
  registre outils, `data/generated/comics.json`.
  • **Manifeste RUNTIME sur R2 (décision Sevih)** : pour ne PAS redéployer à
  chaque BD, `collect-comics` pousse aussi `images/4-comics/comics.json` sur R2 ;
  la page le lit à la requête (`fetch` + `revalidate:600`), repli sur le seed
  committé en dev / si R2 injoignable. Ajouter une BD = `pnpm images`, visible
  < 10 min sans build. Non câblé dans `build.ts` exprès (buildComics lit
  `.editorial`, absent en CI → écraserait le seed). tsc app + datagen + eslint OK.
- **Contribution premium/limited (Shiraen) — outil public + import admin
  générique.** Chaîne complète export→import bouclée.
  • **Outil public** `/contribute/premium-reviews` refondu : EN uniquement (pas
  de barre de langue — la trad se fait à l'import), pas de bouton delete,
  sélection **pilotée par le roster** (dérivé des tags perso : Premium = tag
  `premium` ; Limited = `limited`/`seasonal`/`collab` hors premium/core-fusion)
  avec compteur « X/Y unit reviews » + puces ★/☆ + « N without review ». Support
  **perso pas encore sorti** (`unreleased`) : review rédigée d'avance, saute au
  rendu du guide jusqu'à la sortie (garde-fou anti-typo conservé pour les noms
  non-unreleased). Hub `/contribute` + registre des outils.
  • **Enveloppe de contribution auto-descriptive** (`src/lib/contribute/
contribution.ts`) : `kind` (routage vers le guide), `mode` (edit/add),
  `payload`. `parseContribution` tolère l'ancien format nu. Un `kind` =
  `premium-limited-review` pour l'instant.
  • **Tool d'import admin GÉNÉRIQUE** posé sur `/admin/guides`
  (`ContributionImport` + server action `importContribution`, `IS_DEV`) : lit le
  `kind`, fusionne dans le bon bucket (edit par match de nom sinon add),
  **auto-traduit** les langues manquantes de l'entrée (EN→jp/kr/zh/fr, entrée
  seule pour ne pas re-facturer tout le lot), **enregistre**, renvoie un résumé.
  L'import per-guide de l'éditeur (stage avant Save) lit aussi l'enveloppe.
  Brancher core-fusion/shop plus tard = 1 `kind` + 1 handler. tsc + eslint OK.
- **Sous-outil `/wallpapers` (galerie) — tranche 1** (2ᵉ média, ordre Sevih).
  Principes actés : **hors-jeu → ramené en V3**, **zéro dépendance V2**. Split :
  jeu (Cutin/Full/Banner/Art) = extraction native **worker** (`extract-wallpapers`,
  spec + 2 hooks d'auto-maintenance transmis) ; **HeroFullArt** = RÉUTILISE les
  full-arts perso déjà hébergés (`IMG_<id>`, décision Sevih — zéro re-host) ;
  **Outerpedia** (5 faits main) = ramenés en V3 (`.editorial/wallpapers/`,
  gitignoré → R2, jamais git vu les 40 Mo dont un 8k).
  • **Générateur** `datagen/generators/wallpapers.ts` → `wallpapers.json` : scan
  pools (jeu + éditorial) + énumération `IMG_<id>` réutilisés, dims via en-tête
  PNG (pas de sharp), split `Full:*`. Writer canonique = `datagen:build`
  (buildWallpapers) ; exécution directe = revue. **Peuplé maintenant** :
  Outerpedia (5) + HeroFullArt (227) ; catégories jeu à 0 jusqu'au worker.
  • **Page** `_contents/wallpapers/` : wrapper serveur + `WallpapersGallery`
  client (onglets, grille portrait/paysage, lightbox clavier + download) sur
  tokens V3 (lightbox always-dark en valeurs arbitraires `[#fff]`/`[#000]`).
  Helper `lib/wallpapers.ts`. Registre outils. 2 clés i18n `Full:Scenario`/
  `Full:Others` ×5. tsc + eslint OK.
  • **Pool worker livré** (be3e700, parité V2 exacte : Cutin 222/Banner 90/Art 11/
  Full 135) → `wallpapers.json` régénéré : **690 wallpapers** (Outerpedia 5,
  HeroFullArt 227, + jeu). **Collect+push câblés** : `assets:collect-wallpapers`
  (pool jeu + éditorial → staging `images/download/<cat>`, HeroFullArt réutilise
  `characters/full`) ajouté à `pnpm images`. Chaîne d'auto-maintenance bouclée
  (Hook 1 worker ✓, Hook 2 build.ts en cours côté worker, collect/push moi ✓).
  • **Fix HeroFullArt (404 + parité V2)** : l'énumération `^IMG_\d+$` du pool ramassait
  des ids de skin/PNJ non hébergés (`IMG_2000120` → 404) ET ratait les arts
  alternatifs `IMG_<id>_NN` (8 que V2 a). Refonte en source partagée
  `datagen/assets/hero-full-art.ts` (`listHeroFullArt`) répliquant l'INTENTION V2
  (scan illust + min-largeur 250) **sans** sa dédup perceptuelle lossy (qui jette
  de vrais skins) → **superset natif** : V2 (230) ⊆ 235 (garde les 5 skins que V2
  sur-jette). Hébergement : le **manifest** demande `characters/full/IMG_<f>.webp`
  pour chaque entrée (dédup par clé ⇒ seuls les 9 extras s'ajoutent, jamais deux
  copies). `wallpapers.json` régénéré (HeroFullArt 227→235), 9 extras stagés en
  webp. Décision Sevih : superset natif plutôt que parité stricte. tsc/eslint OK.
- **Admin — toute l'UI passée en anglais** (décision Sevih). Balayage complet de
  la matrice (composants `admin/*`, pages `.dev`, stores/actions `lib/admin`,
  pickers) : seuls les CHAÎNES vues par l'utilisateur sont traduites, les
  COMMENTAIRES restent en français (convention). Fait via 8 sous-agents
  parallèles sur lots disjoints + rattrapage des chaînes sans accent
  (`Chercher`/`Changer` des pickers, `(no name)`, titres). tsc + eslint verts.
- **Guide editor — Premium & Limited (reviews + recommended choices) + outil
  public de contribution (Shiraen)** — 2ᵉ fragment general-guides bespoke.
  Données sorties du TS vers JSON (`premium-reviews.json`,
  `premium-priorities.json`, rendu inchangé). UX : UN éditeur par perso (édite un
  existant pré-rempli ou ajoute), notes en ÉTOILES (impact 1-5 ; cibles reco =
  plage 3-6 + Any + note libre, round-trip du texte existant). Recommended
  choices éditables (paliers de pull). **Contribution export/import** : outil
  PUBLIC `/contribute/premium-reviews` (prod, sans login, sans écriture serveur)
  qui exporte UN perso ; l'IMPORT se fait côté admin (fusion dans le bucket).
  Briques partagées (`PremiumLimitedParts`, `CharacterChips` extrait).
- **Guide editor — world-boss (phases) + adventure (notes multiples)** — world-
  boss branché sur le shell versionné (équipes/persos en SECTIONS de phase,
  reco sectionnée, 1re version vierge possible) ; `StoryBossGuide` rend
  DÉSORMAIS toutes les notes (`note: LText | LText[]`, rétro-compatible).
- **Sous-outil `/ost` (jukebox OST) + infra de routage des outils** — 1er des
  3 médias (ordre Sevih : ost → wallpapers → 4-comics). **Décisions** (cf. TODO) :
  URLs À PLAT `/(slug)` (parité prod V2, enjeu SEO) et « je fais aussi le
  générateur ».
  • **Routeur** `src/app/[lang]/[slug]/page.tsx` : catch-all qui sert
  `_contents/<slug>` via un **registre** de slugs portés (`tools/registry.ts`) —
  slug absent = 404 ; enveloppe titre i18n + fil d'Ariane + retour landing.
  Landing `href` basculée `/tools/<slug>` → `/<slug>`. `getToolMeta` ajouté.
  • **Générateur** `datagen/generators/bgm-mapping.ts` (`pnpm datagen:bgm`) :
  lit `LobbyCustomResourceTemplet` (lignes `LRT_BGM`) + `TextSystem` via
  `langDict` (en/jp/kr/zh d'un coup — plus riche que la V2 qui ne prenait que
  l'anglais et reportait les autres à la main), noms de repli dérivés du fichier
  (sans le tiret parasite « Battle - 02 » de la V2), `size`/`duration` sondées
  (statSync + ffprobe). Sortie `data/generated/bgm_mapping.json` (91 pistes,
  19 localisées). Vérifié vs V2 : mêmes 91, zéro vrai nom JP perdu, replis plus
  propres, doublons anglais kr/zh omis. Les mp3 (déjà convertis, hors
  ré-extraction datamine) sont RÉUTILISÉS, pas re-générés.
  • **Audio** : helper `src/lib/audio.ts` (base R2 partagée, préfixe `/audio`),
  route dev `src/app/audio/[...path]/route.dev.ts` avec **support `Range`**
  (206) pour le seek. 91 mp3 (122 Mo) en staging (gitignoré). **Push R2 câblé**
  dans `pnpm images` : `assets:collect-audio` copie le pool audio → staging, et
  `assets:push` parcourt déjà tout le staging → mp3 sur R2
  (`img.outerpedia.com/audio/bgm/*.mp3`, content-type auto par rclone).
  • **Dépendance V2 coupée** (worker a livré l'extraction native, commit 8bfaaa0) :
  `pnpm datagen:extract-audio` sort l'OST des bundles Unity vers
  `.gamedata/extracted/audio/bgm` (pool V3-owned, miroir de `GAME_IMAGES_DIR`).
  `collect-audio` repointé dessus (copie TOUT le pool — déjà curé par la regex
  de l'extracteur, donc zéro orphelin ; robuste aux nouvelles pistes) ;
  `v2AudioBgmDir()` retiré. Vérifié : mapping regénéré depuis le pool V3
  **strictement identique** (diff vide, 91 pistes).
  • **ffmpeg/ffprobe en auto-fetch R2** (comme AssetStudio) : entrées `FFMPEG`/
  `FFPROBE` dans `datagen/extract/tools.ts` (dossier R2 `tools/ffmpeg`, exe à
  plat), `ensureTool` les rapatrie dans `.gamedata/tools/ffmpeg` ; `datagen:tools`
  les garantit. Mon `bgm-mapping` résout ffprobe via `ensureTool(FFPROBE)`
  (surcharge `FFPROBE`). Plus de dépendance au PATH. Reste : pousser une fois le
  build ffmpeg sur R2 `tools/ffmpeg` (comme AssetStudio l'a été) ; le worker
  repointe son ffmpeg d'extraction sur `ensureTool(FFMPEG)`.
  • **Page** `_contents/ost/` : wrapper serveur (résout les libellés, passe la
  table) + `OstPlayer` client (logique V2 fidèle : lecture/seek/shuffle/repeat/
  historique/volume/raccourcis) **réhabillé sur les tokens V3** (accent ciel
  conservé — vif autorisé hors `guides/**` ; zinc/white/black → tokens). tsc +
  eslint clean.
- **Guide editor — general-guides bespoke : `free-heroes-start-banner` (onglet
  Free Heroes)** — premier fragment éditable d'un GUIDE GÉNÉRAL (contenu sur
  mesure, pas la famille de boss). Les SOURCES de héros gratuits sortent du TS
  (`recommended.ts`) vers `free-heroes-sources.json` (rendu `index.tsx`
  INCHANGÉ, ré-export depuis le JSON) ; `general-guide-store.ts` porte un
  REGISTRE extensible (slug → fragment) + load/save + validation (libellé EN,
  ≥1 entrée, ≥1 héros, chaque nom résout). Éditeur `FreeHeroesEditor` :
  ajout/retrait de sources, d'entrées et de héros (chips + portraits), type de
  choix (tous / un au choix), libellé + raison en 5 langues (InlineTextField,
  tokens, auto-traduction EN → vides). Câblé sur le shell `/admin/guides`
  (ligne « GG · … », dispatch page, branche `general-guides` de la route).
- **`/tools` + `/tierlist` : fidélité visuelle V2** (retour Sevih : « ne ressemble
  pas à la V2 »). J'avais trop neutralisé — or les couleurs vives Tailwind sont
  autorisées HORS `guides/**`. Repris le design V2 sur les primitives V3 (seuls
  les neutres → tokens). **Tools** : `toolsTheme` (accents par catégorie
  rankings=rose / equipment=ambre / simulators=cyan / info=violet / media=rose),
  onglets colorés, sections à en-tête barré d'accent, `ToolCard` (boîte d'icône à
  dégradé d'accent + halo au survol), **FeaturedRow** (3 phares avec ruban),
  `StatusBadge`. **Tierlist** : `tierlistTheme` (PvE=émeraude / PvP=rouge /
  rail=ciel), `FlagshipCard` à **panneau d'art** (dégradé radial + texture rayée +
  grand glyphe S centré), `VsBadge` (médaillon dégradé), `OtherRankingsRail`.
  Cluster de portraits top-tier toujours omis (pas de donnée de rang en V3).
  _Correctif (retour Sevih)_ : le glyphe de rang prenait les sprites `IG_Event_Rank_*`
  BRUTS du jeu (minuscules, ~1,6 Ko). Sevih avait upscalé les siens en V2 → on
  retire le rang des sprites de jeu du manifeste et on le ramène en **éditorial**
  depuis le pool V2 (`ui/rank/IG_Event_Rank_*`, S = 7,6 Ko). Staging resynchronisé.
- **Hub `/tierlist`** — dernière page manquante de l'inventaire footer/nav
  (layout d'abord). Hero (`getMonthYear`, compteurs rankings/units), deux cartes
  phares **PvE vs PvP** (badge VS central) et un rail vers 3 autres classements
  (ee-priority-base / ee-priority-plus10 / most-used-units) — métadonnées prises
  dans le domaine outils (`getVisibleTools`), liens vers `/tools/<slug>` (404 le
  temps du portage). Au sitemap. **Aperçu « top S-tier » différé** : aucune donnée
  de RANG par perso en V3 (elle vit dans l'outil tierlist non porté). Page serveur
  pure (liens seulement).
- **Guide editor — famille complète (6 catégories) sur un shell unifié** — suite
  du pilote joint-challenge : l'éditeur couvre désormais TOUTE la famille de boss.
  Généralisation autour d'un **`CatSpec` par catégorie** (`guide-draft.ts`), qui
  décrit un stockage divergent derrière un unique modèle éditable :
  - **stockage** : versionné (`versions/YYYY-MM/*.json`, JC), plat (fichiers
    racine, special-request / irregular / adventure-license), ou **`content.json`
    mono-fichier** (adventure, dimensional-singularity) ;
  - **monstre** : `config.group` (JC), `meta.group` (plates), `meta.dungeons`
    ordonnés (adventure, picker donjon), `meta.bossId` (dim, picker monstre) —
    écriture `meta.json` en read-merge-write ;
  - **équipes** : une équipe `slots` (JC), **buckets par plage de stages**
    (special-request), **nommées** titre `SectionTitle` + note multi-§ (irregular /
    adventure-license), ou **persos en sections** (dim = `content.teams`) ;
  - conseils en **sections titrées** (JC, dim) ou liste plate ; les titres
    `SectionTitle` non libres (preset/perso/élément/effet) sont préservés et
    éditables en libre. Nouveaux helpers data `listGroups`/`listDungeons`
    (`encounters.ts`) + `listMonsters` (`monsters.ts`), picker générique
    `IdLabelPicker`. Autotrad EN→vides couvrant tous les textes (intro, conseils,
    notes, raisons, titres, notes d'équipe). HORS scope : guild-raid, world-boss,
    general-guides/other, skyward-tower, monad-gate. Aperçu fidèle partout via le
    même pipeline de descripteurs (`previewMode="list"` pour les conseils).
- **Landing `/tools`** — 5ᵉ 404 du footer fermée (landing seule, décision Sevih :
  le layout d'abord, les 18 sous-outils viendront après). Données curées ramenées
  du V2 (`data/curated/tools/_categories.json` + `_index.json`) ; domaine
  `src/lib/data/tools.ts` (import statique). 17 outils visibles groupés en 5
  catégories, onglets + filtre par HASH (`#cat-…`, deep-link footer, idiome
  `useUrlSlice`), cartes icône+titre+desc pointant `/tools/<slug>` (404 assumée le
  temps du portage). 18 icônes ramenées data-driven (manifest lit `_index.json`),
  helper `img.toolIcon`. Au sitemap. Vérifié : 17 outils, toutes les clés i18n
  résolvent. Poussée R2 des icônes au prochain `pnpm images`.
- **Page `/coupons`** — liste complète des codes promo depuis `coupons.json`
  (curé) : 90 codes triés actifs → à venir → expirés (12 actifs / 78 expirés
  ce jour), badge de statut, validité, récompenses résolues en `ItemInline`,
  copie presse-papier ; instructions de rachat MANUEL en tête (Android + lien iOS
  officiel via HTML i18n de confiance). Assemblage `getAllCoupons` dans
  `lib/home.ts` ; composant client `CouponsList`. Au sitemap. **Rachat one-click
  NON porté** — `REDEEM_ENABLED=false` même en V2 (accord VA Games en attente) ;
  le lien « voir les N codes » de la home pointe désormais sur une vraie page.
- **Page `/contributors`** — 3ᵉ 404 du footer fermée. `contributors.json`
  ramené du V2 en `data/curated/` (liste curée, pas de la donnée de jeu) ;
  avatars (`images/contributors/*`) collectés **data-driven** (le manifest lit
  le curé et pousse chaque `avatar` référencé une fois) + copie staging ;
  helper `img.contributor`. Page statique i18n (clés `contributors.*`), grille de
  cartes sur primitives V3, perso(s) favori(s) rendus par `parseText` (tags
  `{P/…}`), ajoutée au sitemap. Vérifié : les 14 persos favoris résolvent tous.
  Poussée R2 des avatars au prochain `pnpm images`.
- **Guide editor — pilote joint-challenge (éditeur unifié « guide de boss »)** —
  dernier éditeur manquant de la matrice admin, posé sur la catégorie la plus
  utile (versionnée). Modèle métier (Sevih) : 1 monstre désigné + conseils +
  persos + équipe + vidéos, par version. Un guide n'a AUCUN chemin d'écriture
  jusqu'ici (couche `guides.ts` en lecture seule) : nouveau **store**
  (`guide-store.ts` — load/save/add-version, `writeJson` canonique, mkdir/rm par
  fichier, duplication d'une version « pour servir de base ») + **route**
  `/api/admin/guides/[category]/[slug]` (gardée `IS_DEV`). Adaptateurs PURS
  (`guide-draft.ts`) entre le modèle plat éditable et l'arbre de fichiers
  (`strings.json` + `versions/YYYY-MM/{config,tips,recommended,teams}.json`) :
  lecture aplatit, écriture ré-émet la forme courte (une section de conseils sans
  titre → `{tactical}`, sinon `{sections}` titrées) — diffs JC minimaux. Le
  « monstre » = un `DungeonRef.group`, choisi dans un **picker** alimenté par
  `listGroups` (nouveau, `encounters.ts` : les combats réels étiquetés boss·mode).
  UI (`GuideEditor` + `GroupPicker`) : intro commune + barre de versions + **＋
  version** (source à dupliquer sélectionnable, défaut = la plus récente), parties
  en **onglets** (`EditorTabs`, comme l'éditeur perso) — Monstre / Conseils /
  Notes / Persos / Équipe / Vidéos. Conseils = **un éditeur bloc, un rendu liste**
  (nouveau `previewMode="list"` d'`InlineTextField` : une ligne = un conseil,
  rendu via le vrai `parseText` — l'EN pilote la structure, les autres langues
  remplissent par index) ; équipe plafonnée à **4 slots** ; persos en portraits ;
  vidéos via `VideoCurator` réutilisé ; **auto-trad EN → langues vides** (DeepL →
  Haiku). Nav « Guide editor » activée (liste JC via `ToolCharacterList`). RESTE
  (TODO) : brancher les autres catégories de la famille sur le même shell.
- **Tokens de contraste remontés** (`globals.css`) — retours Sevih, en deux temps.
  - _Bordures_ : `line`/`line-subtle` disparaissaient À MÊME le fond du site
    (`line-subtle` #1e293b = la couleur de `surface-overlay` → 1.29:1). Remontés :
    `line-subtle` #42566e (2.5:1), `line` #526075 (3:1), `line-strong` #64748b
    (4:1, remonté aussi pour garder subtle<normal<strong).
  - _Texte_ (échelle entière remontée, trop sombre) : `content-strong` + `content`
    = VRAI blanc #fff — `content-strong` se distingue désormais par le GRAS (règle
    `.text-content-strong { font-weight: 700 }` en `@layer base`, surchargeable par
    un `font-*` explicite) ; `content-muted` + `content-subtle` reprennent l'ancien
    `content` #cbd5e1 (bien plus clair que l'ancien slate moyen #94a3b8/#808ea6).

- **Home riche** — page d'accueil reconstruite sur les primitives V3 (aucun
  import de composant V2). Sections : **HomeHero** (titre discret + déclencheur
  de recherche via événement `op:open-search`, écouté par HeaderClient),
  **DiscordBanner** (compteurs via l'API d'invitation, revalidés 1 h),
  **CurrentBanners** (bannières ACTIVES de `recruit.json` → `ResponsiveCharacterCard`
  - compte à rebours), **ServerResets** (daily/weekly/monthly, calcul pur),
    **BuffEventTimer** (Daily Buff depuis `buff-events.json`), **PromoCodes**
    (codes actifs de `data/curated/coupons.json`, récompenses résolues en
    `ItemInline`, copie presse-papier), **BeginnerGuides** (5 liens general-guides).
    Assemblage data serveur dans `src/lib/home.ts` (bannières/coupons/buff en
    view-models). Les 3 compteurs partagent une horloge unique
    (`src/hooks/useNow.ts`, `useSyncExternalStore` — même idiome que
    `SingularityCountdown`, pas de `setState`-dans-effet). Assets ramenés du pool
    V2 (entrées éditoriales dans le manifest + copie staging ; poussée R2 au
    prochain `pnpm images`) : bannière du site (`croped_banner.webp`,
    `img.homeBanner`), icône Discord (`discord.webp`, `img.discord`), et les
    7 icônes du Daily Buff (`ui/buffs/*`, `img.buff` ; repli pastille pour les
    types sans icône).
    Simplification assumée : pas de carousel mobile (flex-wrap responsive).
    **Recent Updates différée** (lit `getChangelog`,
    non porté). Vérifié runtime : 4 bannières actives, 12 coupons, buff du jour OK ;
    465 tests verts.
- **Guide « How Quirks Work » porté** (quirk, heroes-gear, ordre 3) — le plus
  « ajout de contenu » : la V2 était PUREMENT conceptuelle (5 catégories,
  how-it-works, priorité, exemple, FAQ), la V3 y AJOUTE les **arbres reproduits
  depuis les fichiers du jeu** (demande Sevih). 3 onglets (Guide / Quirk Trees /
  FAQ). Nouveau générateur `quirks.ts` → `quirks.json` : les quirks = table
  interne « **Awakening** » (`CharacterAwakeningNodeTemplet` + `…LevelTemplet` +
  `…Templet`). Les **5 catégories V2 = les 5 groupes** du jeu (PVE→counteract,
  JOB→class, ELEMENTAL→element, UTILITY, ADVENTURE_LICENSE) ; un sous-arbre = un
  main node + tous les nœuds dont `RequireMainNodeID` pointe dessus (13 arbres :
  5 éléments + 5 classes + utility + pve + adventure). Émis par nœud : type
  (main/normal), couleur de fond du jeu, nom/desc (`TextSystem`, `{0}` = valeur),
  connexions du graphe, niveau de main requis, et **coût (or + items) + effet PAR
  NIVEAU**. Valeur d'effet dérivée pour les 128 nœuds `IOT_STAT`
  (`formatStatValue` sur le SLUG, pas l'enum — CHC 2%/4%…) ; les 79 nœuds
  `IOT_BUFF` (buffs `Awakening_*` ABSENTS de `BuffTemplet`) → nom + coût sans
  chiffre (limite assumée). Rendu : **layout radial dérivé, main node au CENTRE**
  (choix Sevih ; positions in-game relatives/ambiguës → on reconstruit le graphe
  depuis les connexions, profondeur = distance), nœuds en pastilles teintées par
  leur couleur (sprites `CM_Gift_*` non collectés), **tooltip au survol** (nom,
  effet, coût total au max, niveau de déblocage) — client `QuirkTreeView` +
  navigateur `QuirkTrees` (onglets catégorie + sélecteur élément/classe). Prose
  5 langues portée V2 → `labels.ts` (tags `{C/}{E/}{S/}{P/}{I-I/}` supportés par
  le parse-text V3 ; `{ICON_*}` de catégorie résolus en terme gras faute de
  sprite de menu). Icône meta `TI_Gift_Cost_01` (choix Sevih). Rendu 200 EN + FR,
  0 réf morte.
- **Guide « Equipment Guide » porté** (gear, heroes-gear, ordre 2) — le plus
  gros des general-guides, 5 onglets (Bases, Upgrading, Ascension, Obtaining,
  FAQ). Port INTÉGRAL fidèle (décision Sevih), mais **zéro hardcode** : les
  tables numériques que la V2 figeait DÉRIVENT toutes de la donnée de jeu, en
  réutilisant les briques de l'outil `equipment/[slug]` déjà en place —
  - _ascension_ (activation, steps +11→+15, bonus +15 offensif/défensif avec
    grades C→S+ et split F/W/E · L/D, reroll) : `getAscensionView('weapon'|'armor')`
    exposé depuis `equipment-detail.ts`, source `enhance.json` (générique, sans
    item) ; main-stat % dérivé des facteurs (0.15 + 0.1×4 + 0.2) ;
  - _comparaison d'enhancement_ (Normal 1★ 18→90, Epic 2★ 54→270, Leg 1★ 30→150) :
    nouveau champ `EnhanceRules.examples` — base ATK par archétype (grade, star)
    tiré de `ItemOptionTemplet`, × ×5 au +10 ;
  - _breakthrough_ (Surefire Greatsword ATK 200→240 + textes T0→T4, Immunity /
    Penetration Set 2P/4P base vs T4) : `getEquipmentDetail` (mêmes passives /
    setEffects que la fiche).
  - _reroll manquant → DÉRIVÉ_ : le générateur `enhance.ts` mentionnait « reroll »
    sans l'émettre ; ajouté `singularity.reroll` (`SET_EQUIP_REROLL` : 500 000 or
    - Reload Cartridge ×10, 100 %) — plus besoin de curer.
      Reste ÉDITORIAL (prose 5 langues transplantée V2 → `labels.ts`) : mécaniques
      substats (barre 6 segments **sans valeurs chiffrées**, décision Sevih), tips
      (ratios 2:1 / 6:1), Change Stats, priorité par slot, FAQ. Nouveaux tokens
      `--substat-roll/reforge/empty` (jaune roll / orange reforge / creux). Guide V3 :
      `SegmentedTabs` 5 onglets, cartes `EquipmentIcon`, items `{I-I/…}` parse-text
      strict. Rendu 200 EN + FR ; datagen régénéré (`enhance.json`, lambda écarté).
- **Guide « Growth Systems » porté** (heroes-growth, heroes-gear, ordre 1) —
  gros guide de systèmes, 7 onglets (Gems fusionné dans Special Equipment,
  décision Sevih). Nouveau générateur `hero-growth.json` : les tables NUMÉRIQUES
  DÉRIVENT de la donnée de jeu (vérifiées identiques à la V2, avec le détail que
  la V2 masquait) —
  - _limit break_ : `CharacterMaxLevelTemplet` (facteurs = `CharBreakPieceQuantity`,
    gold = `Price`, bonus de stat = `LevelUpStatModifierAfter100` ; pièces/prix
    indépendants de l'élément → collapse par rareté) ;
  - _skill upgrade_ : `CharacterSkillEnchantTemplet` (manuels via `ItemID_n`, gold
    via `UpgradePrice`) ;
  - _EE / talisman_ : `SpecialEquipEnchantTemplet` (`ITS_EQUIP_EXCLUSIVE` /
    `ITS_EQUIP_OOPARTS`, matériaux + gold + déblocage de gem slot ; les « 150 »
    de la V2 = la SOMME des coûts 10+20+30+40+50 → ici le détail par niveau) ;
  - _XP food_ : `ItemTemplet` `ITS_MATERIAL_CHAR_LEVEL`, XP = `MaterialValue`.
    Le reste reste ÉDITORIAL car ABSENT de la donnée (vérifié : pas de table
    favor/present→points, pas de paliers d'affinité, effets de transcendance non
    structurés) : points des gifts d'affinité, paliers de récompense, effets de
    transcendance → `editorial.ts` ; toute la prose (5 langues) transplantée V2 →
    `labels.ts`. Guide V3 : `SegmentedTabs` 7 onglets, tables en tuiles à cadre de
    rareté (`ItemInline`), gem ref `{I-I/…}` en parse-text strict, résumé Gear +
    lien vers le guide gear (ordre 2, à venir).

- **Pages `/legal` + `/feed`** — les deux 404 de la barre basse du footer,
  fermées. **`/legal`** (`src/app/[lang]/legal/page.tsx`) : page statique i18n,
  contenu dans les clés `legal.*` déjà pré-seedées ×5 (heading, p1-p4, titre
  hébergeur + p5 LCEN), `generateMetadata` via `createPageMetadata`
  (`page.legal.*`), `revalidate` 24 h, ajoutée au `sitemap.ts` (page indexable).
  **`/feed`** (`src/app/feed/route.ts`) : flux **RSS 2.0** des guides non
  masqués, triés par fraîcheur (`guideUpdatedDate`, comme le sitemap), lien vers
  la fiche en langue par défaut, dates RFC-822, entités XML échappées. Route à
  la RACINE hors `[lang]` — le proxy l'exclut déjà nommément — donc flux unique
  en langue par défaut ; `dynamic = 'force-static'` + revalidation 24 h,
  `Content-Type: application/rss+xml`. 465 tests verts.
- **Éditeurs éditoriaux perso alignés sur le rendu du site (B/C/D)** — même
  chaîne de descripteurs que l'aperçu inline, généralisée aux 3 éditeurs perso.
  **B (pros/cons)** : `EditorialEditor` rend les entrées comme
  `getCharacterProsCons` (2 onglets Pros/Cons, lignes `Side`), résolues par
  `renderInlineBatch` (nouveau, `inline-preview-actions`) ; édition en place au
  clic sur la tuile (plus de champ séparé), `✕` par entrée, `+ entrée`.
  **B (synergies)** : les partenaires rendus en `CharacterPortrait` comme
  `SynergiesSection`, ajout par datalist (`+ partenaire…`), raison éditable au
  clic. **C** : `synergies/[id]/page.dev.tsx` construit les `heroViews`
  (id→portrait/slug) passés à l'éditeur. **D** : `characters/[id]/page.dev.tsx`
  regroupe champs manuels → skills → reco dans un `EditorTabs` (nouveau, panneaux
  tous montés, inactifs `hidden` → l'état survit au changement d'onglet).
  Piège corrigé : les wrappers cliquables étaient des `<button>` contenant du
  rendu inline interactif (`StatInline`=button, `{P}`/`{SK}`=lien) → nesting DOM
  invalide ; passés en `<div role="button" tabIndex onKeyDown>`, et `ItemRow`
  (`GearRecoSection`) reçoit `noLink` pour que les tuiles d'édition ne naviguent
  pas. Prolonge l'éditeur reco unifié du 18/07.
- **`useUrlTab` — dédup de la logique « URL source de vérité »** — le bloc
  identique de `ui/Tabs` et `guides/.../BannerTabs` (lecture de la tranche
  `?<param>=<id>` via useUrlSlice → Back/Forward pilote l'UI, écriture par
  `replaceState`, validation de l'id lu, repli local sans `urlParam`) extrait
  dans un hook générique `src/hooks/useUrlTab.ts` (`<T extends { id: string }>`,
  retourne `{ active, current, select }`). Les deux composants n'en gardent que
  leur rendu propre (soulignement thémé / cartes-images). Aucun changement de
  comportement. RESTE hors périmètre : migrer `BannerTabs` vers le hash (règle
  « état interne d'un guide = hash »), tracé en TODO.
- **CSP durcissement, PASSE 1 (Report-Only, observation)** — préparation du
  passage à une CSP à nonce sans casser la prod (build indisponible en local :
  on valide sur le trafic RÉEL). Une politique **stricte** (`script-src 'self'
'nonce-…' 'strict-dynamic'`, sans `'unsafe-inline'`) est servie via
  `proxy.ts` (Next 16 : la convention est `proxy.ts`, pas `middleware.ts`) sous
  l'en-tête **`Content-Security-Policy-Report-Only`** : le navigateur l'évalue
  et REMONTE ce qu'elle casserait, sans jamais bloquer. La politique réelle
  (`next.config.ts`, avec `'unsafe-inline'`) est **inchangée** → zéro risque.
  Le nonce est glissé sur les en-têtes de REQUÊTE (`Content-Security-Policy`
  interne, jamais renvoyé) pour que Next le pose sur SES `<script>` — sinon ils
  pollueraient les rapports. Collecte automatique sur tous les visiteurs :
  `report-uri` (Firefox/Safari) + `report-to`/`Reporting-Endpoints` (Chrome)
  → nouvel endpoint **`/api/csp-report`** qui normalise les deux formats, filtre
  le bruit d'extensions (`chrome-extension://`…), dédupe en mémoire et loggue en
  `console.warn` structuré (→ logs conteneur, `grep`). Vérifié : Caddy prod
  (`vps-…ovh.net`) ne strippe PAS la CSP (le `header_down -Content-Security-
Policy` est cantonné au bloc test-IP HTTP), donc le header arrive intact.
  `style-src` garde `'unsafe-inline'` (styles inline React, hors périmètre XSS).
  À DÉPLOYER puis observer avant la bascule réelle (PASSE 3, cf. TODO).

## 2026-07-18

- **Éditeur reco d'équipement UNIFIÉ sur tuiles** — l'aperçu EST l'éditeur : rend
  le vrai `GearRecoSection` (tuiles 6★, onglets par build), chaque tuile cliquable
  ouvre son éditeur inline (`✕` direct pour retirer). (1) **Icônes 6★** :
  `gear-options` dérive désormais des FAMILLES (`topId`) au lieu du plus petit id
  → corrige le bug 1★. (2) **Filtre de classe** sur les selects arme/amulette
  (`family.classLimits`, vide = libre ; valeur hors-classe préexistante conservée
  et marquée). (3) **Main stats en multi-select** (puces, pool du slot ; armes =
  ATK%/DEF%/HP% fixes ; amulettes = pool famille ; valeurs hors-pool retirables).
  (4) **Presets bidirectionnels** (`gear-preset-resolve`) : DÉPLIÉS au chargement
  (page) → édition en pièces 1:1 avec les tuiles, RECOMPRESSÉS au save (store)
  → JSON compact, pas de diff géant. (5) **Import d'un build** depuis un autre
  perso. Résolution via server action debouncée (`gear-preview-actions` +
  `resolveGearBuilds` extrait de `getCharacterGearReco`). `GearRecoSection`
  inchangé côté site (juste `SubstatPrioBar` exportée).
- **Auto-traduction éditoriale (DeepL → fallback Haiku)** — bouton « Traduire
  (EN → langues vides) » dans les éditeurs (pros/cons, synergie, notes reco).
  `translate-actions` (server action) : masque les fragments à préserver (tags
  `{…}` déjà localisés au rendu, `<color>`, `\n`), traduit la prose seule,
  réinsère. Deux moteurs, bascule auto : **DeepL** primaire (mode XML
  `ignore_tags`, quota gratuit) → sur **456** (quota épuisé) → **Claude Haiku**.
  Remplit uniquement les langues vides (préserve les trads manuelles), champs
  « à revoir ». Clés `DEEPL_API_KEY` / `ANTHROPIC_API_KEY` (env, dev-only).
- **Aperçu inline fidèle (descripteurs + vrais composants)** — l'aperçu des tags
  `{TYPE/…}` ne réimplémente plus le rendu (couleurs seules, sans icônes) :
  `resolveInlineSegments` (sibling de `parseText`, partage ses résolveurs privés
  → zéro dérive) projette le texte en DESCRIPTEURS purs, la server action
  `inline-preview-actions` les renvoie (résolveurs effets/équipement server-only,
  `node:fs`), et `InlinePreview` (client) les rend avec les VRAIS composants
  inline (`InlineIcon`/`ItemInline`/`StatInline`/`EffectIconTile`, tous
  client-safe) → identique au site (icônes, couleurs, liens, tooltips). Corrige
  le mur Next 16 : renvoyer du JSX de composants clients depuis une action casse
  le manifeste RSC Turbopack → on ne traverse QUE des données. `parseText`
  intouché (tests verts). Câblé dans `InlineTextField` (prop `lang` réintroduite),
  route `/api/admin/preview-text` supprimée (repliée dans l'action).

- **Guide « Weekly & Monthly Reference Tables » porté** (timegate-resource,
  economy, ordre 5) — re-pivot par item du même socle `ProductTemplet`. Pour un
  panel curé de ressources (manuels, transistones, poussière/mémoire, glunite,
  engrenage de singularité, limit break) : d'où on les récolte par semaine/mois
  et combien. Frontière dérivé/curé tranchée SOURCE PAR SOURCE (règle Sevih :
  dérivable → on dérive, sinon → on cure) — vérifiée dans la donnée de jeu :
  - _Dérivé_ (`timegate-resources.json`, générateur) : les sources de SHOP.
    **UN SHOP = UN ONGLET d'échange RÉEL** du jeu (`ProductCategory` →
    `ShopTabType` de `ProductShopTabGroupTemplet`), PAS une monnaie — correction
    Sevih 19/07 : grouper par `ProductBuyType` scindait l'onglet **Arena**
    (`PC_PVP`) en deux faux shops (points d'arène `PBT_PVP` hebdo + arène temps
    réel `PBT_PVP_REAL` mensuel) → désormais une seule ligne Arena hebdo+mensuel.
    On EXCLUT les catégories sans onglet d'échange (`PC_TOWER`/Automaton Coin,
    `PC_REMAINS`) que la V2 n'avait pas listées non plus. Résultat = les 7 shops
    canoniques V2 (general, guild, arena, stars, survey, worldboss, joint), mais
    DÉRIVÉS. Produit COURANT via les helpers `computeAsOf`/`isCurrent`/`PERIOD`
    EXPORTÉS de `shop-priorities` (une seule règle) ; quantité = `MaxBuyCount` ×
    période, auto-corrigée (retire l'arena/survey Basic Manual expiré fin 04-2026,
    impossible à tenir à la main).
  - _Curé_ (`data/curated/timegate-resources.json`) : le panel d'items + leur
    regroupement en onglets (choix éditorial), ET les sources NON-SHOP dont la
    quantité est une estimation joueur ABSENTE de la donnée — vérifié : drops
    de Floor 3 (probabilistes), échange de points d'Extermination
    (`IrregularChaseExchangeTemplet`, zéro colonne limite/reset → budget estimé),
    Singularité rang/daily/ranking (suppose SSS++ + 4 jours joués), missions,
    atelier de Kate (recette dans `ItemCraftConsumeTemplet` mais limite hebdo de
    craft absente). Chiffres transplantés verbatim de la V2. Zéro chevauchement
    avec le dérivé → pas de double comptage. Totaux calculés au build (mensuel
    global = mensuel + hebdo×4). Guide V3 : `SegmentedTabs` 6 onglets, une table
    par item, items en tuile à CADRE DE RARETÉ (`ItemInline`), badge par type de
    source. Aucune horloge (déterministe, « ne bouge que quand la donnée bouge »).

- **Guide « Shop Purchase Priorities » porté** (economy, ordre 4) — le plus
  data-driven de la catégorie. La V2 codait ~1000 lignes de contenu de shop EN
  DUR (`data.ts`), déjà PÉRIMÉ (Guild Shop rebrassé le 2024-12-03 : prix changés,
  Intermediate Skill Manual 200→150 Guild Coins). Nouveau générateur
  `shop-priorities.json` : les 8 shops permanents « à monnaie » (guild, joint,
  friend, arena, stars, worldboss, adventure-license, survey) DÉRIVENT de
  `ProductTemplet` — noms (ProductNameID→TextItem, 4 langues), coûts, limites,
  périodes, monnaie (asset du catalogue). « Produit courant » 100 % déterministe
  SANS horloge (exigence Sevih « trigger quand ça bouge uniquement ») : ancre
  `asOf` = StartDate réelle max (cluster d'années contigu → écarte les sentinelles
  forever 2034/2224/2999), courant si `StartDate ≤ asOf < EndDate`. Overlay curé
  `data/curated/shop-priorities.json` = SEUL l'éditorial (priorité S/A/B/C +
  notes), keyé par un slug STABLE `shop/<goods>/<période>` (le productId ET le
  ProductNameID bougent à chaque rotation ; l'invariant est CE QU'ON ACHÈTE) —
  la priorité reste accrochée quand le jeu rebrasse le shop. Seed depuis la V2
  (72/126 produits ; le reste = items V2 périmés rotationnés out, ou produits
  nouveaux jamais notés — à compléter à l'admin). Shops variables (Event,
  General/Resource) ou texte (Supply, Rico) restent éditoriaux (transplant
  verbatim, `editorial.ts`). Guide V3 : `SegmentedTabs` 12 onglets, table unifiée
  dérivé/éditorial sur primitives, textes supply/rico. Icône meta
  `TI_Web_Event_Coin` (collecte au prochain push d'assets).
  - _Retours icônes Sevih_ : (1) les 37 items sans icône résolus — équipement
    (arena/al) via le domaine gear (`buildEquipment`, namespace
    `images/equipment`, d'où `iconKind` sur chaque entrée) ; tickets PGT_TICKET
    (Stamina, Arena Ticket) via asset du catalogue ; seul « Title [Tycoon] »
    reste sans sprite. (2) Onglets : 12 icônes de shop dédiées (`shop_*.webp`
    V2 → `images/ui/shop/`, manifest + `img.shopIcon`) plutôt que l'icône de
    monnaie (vide pour world boss / joint challenge, absente pour les shops
    éditoriaux supply/rico/event/resource). (3) CADRE DE RARETÉ manquant : rendu
    des items via `ItemInline` (tuile `img.slotFrame(grade)` + icône + tooltip,
    comme les chips `{I-I/…}` de parse-text) au lieu d'`InlineIcon` — d'où un
    champ `grade` par entrée ; items éditoriaux (event/resource) résolus par nom
    sur le catalogue (`CATALOG_BY_NAME`) pour icône/grade/desc. (4) Le manifest
    ne collectait qu'un sous-ensemble d'icônes d'équipement (familles wiki +
    unique 6★) → 404 sur les équipements mid-tier du shop : collecte désormais
    TOUTES les icônes d'équipement (327 sprites de tier distincts, webp), à
    disposition hors pages détail. Assets `ui/shop` + équipement à pousser.
- **Éditeur EE — suivi (menu, colonne Curé, descriptions, portrait, passifs)**
  (raffinements de l'éditeur EE livré le même jour). (1) Menu Editor : retrait
  des entrées « à venir » armes/amulettes/armures/talismans + pages placeholder
  (seul l'EE a une curation à éditer). (2) Liste `editor/ee` : colonne « Curé »
  (✓/—, TOUTE curation posée — rang ou chips). (3) Fiche `editor/ee/[id]` :
  descriptions des effets (légende chips + ajouts, `EeChipMeta`/`EffectOption`
  gagnent `desc`) et section « Passifs (référence) » (paliers résolus déblocage
  Lv.1 + Lv.10 via `eeModelForView().passives`, textes remplis) — on ne voyait
  pas les passifs de stats sans chip. (4) Portrait EE (`img.ee`) au lieu de la
  face du perso sur les deux pages. Lint + 353 tests OK.

- **Exports src sans consommateur RETIRÉS** (dette code / code mort). RETIRÉS :
  `elementName`/`className` (game-tokens), `tagDesc` (tags), `SuffixLang`/
  `getLangConfig`/`GameLang`/`GAME_LANGS`/`isGameLang` (i18n/config — copie site
  self-référentielle, la vraie vit en datagen), repli inopérant de
  `guide-sections.ts:69-72` (`resolveEffectKey` teste déjà les 2 côtés).
  DÉ-EXPORTÉS (usage interne conservé) : `resolveRewardEntry`, `EffectTooltipBody`,
  `ELEMENT_HEX`. GARDÉS volontairement : `getMonthYear`/`buildVideoObjectJsonLd`/
  `buildFaqJsonLd` (seo.ts — /tierlist et /tools à venir ; `getMonthYear`→
  `serverNow` au portage).

- **Tokenisation couleurs guides — Phase 1 (palettes .ts) + galerie dev**
  (chantier Sevih 16/07, périmètre choisi 18/07 : palettes+composants d'abord,
  éditorial `_contents` en phase 2). Méthode actée : tokens PAR RÔLE aux valeurs
  EXACTES → rendu inchangé. Fait : (1) `nodeStyles.ts` (Monad Gate) — 4 couleurs
  vives de texte sorties en tokens `--monad-milestone/explore/combat/story`
  (yellow/green/red/sky-400 V2), exposés `text-monad-*` ; le filtre CSS qui
  teinte le sprite reste une chaîne `filter` à part. `ELEMENT_RING` déjà
  tokenisé. (2) `TurnOrder` : amber SPD → `text-stat` (le point précis du TODO ;
  look inchangé, l'unification SPD amber-vs-neutre reste un choix visuel).
  (3) `/dev/tokens` (`page.dev.tsx`, dev-only) : GALERIE des tokens EN CONTEXTE —
  chaque token appliqué dans une mini-maquette du composant qui l'emploie (carte
  neutre surfaces/contenu, encarts de statut, nœuds Monad, chips buff/debuff,
  valeurs de stat, chaîne, éléments, raretés/grades, rôles d'équipe, rampe de
  chaleur) + sa valeur résolue au runtime (lue via `useSyncExternalStore` pour
  respecter `set-state-in-effect`) — pour voir OÙ et COMMENT ça rend, et ajuster.
  (4) 1er ajustement piloté par la galerie : `--content-subtle` #64748b→#808ea6
  (les légendes discrètes tombaient à ~3:1 de contraste sur `surface-overlay`, sous
  le seuil AA en `text-xs` ; remonté à ~4.4:1, reste le cran le plus faible sous
  `content-muted`). (5) `MonadGateMap` — conversions EXACTES sûres (valeur =
  token existant, 0 pixel bougé) : `text-yellow-400` #facc15 → `text-monad-milestone`
  (2 cases à cocher + texte « requis » + titre True Ending) ; `hover:text-red-400`
  #f87171 → `hover:text-danger` (croix de fermeture). (6) `MonadGateMap` — nuances
  bespoke : arbitrage tranché par Sevih = TOKEN-FIN EXACT (0 pixel bougé, pas
  d'unification color-mix). 12 tokens `--monad-*` ajoutés aux valeurs OKLCH EXACTES
  de Tailwind v4 (relevées dans `tailwindcss/theme.css`) : famille choix (choice-bd/
  bg/chip-bd/text), clé (key/key-soft/key-badge), « n'a pas d'importance » (void-bd/
  bg/text), pastille de quête (quest-bd/text ; fond jaune réutilise monad-milestone).
  Les 9 classes vives (green/emerald/red/yellow à opacités) routées dessus, opacité
  gardée côté classe (`/30`…). Restent en littéraux SVG (attributs de présentation,
  `var()` non résolu) : `fill="white"`, `stroke="black"`, `#facc15`, `#fde047` —
  hors cible de l'eslint (classes). Galerie `/dev/tokens` : bloc « Encarts Monad
  Gate » ajouté (reproduit les usages réels). (7) Famille SÉLECTION jaune-or —
  rôle fonctionnel partagé des category-views (onglet/carte actif, anneau de
  survol). 3 tokens sémantiques `--select`/`--select-fg`/`--select-fg-hover`
  (yellow-400/300/200, valeurs OKLCH exactes) ; ~10 usages routés dessus sur 7
  composants (ModeColumns, AdventureGrid, LicenseTabs, MonadGateGallery,
  MonadRouteClient, SpecialRequestSplit, SkywardTowerView) ; opacités gardées
  côté classe. MonadRouteReward `text-emerald-300` (titre First Clear) réutilise
  `--monad-key-soft` (valeur exacte, 0 nouveau token). Galerie : bloc « Sélection »
  ajouté. Typecheck + lint + 423 tests OK. (8) Palette d'IDENTITÉ des catégories
  `guide-accents.ts` — fork tranché par Sevih = TOKENISER. 33 tokens `--cat-<teinte>-*`
  pour 11 catégories colorées (emerald/sky/indigo/amber/orange/violet/teal/rose/
  red/fuchsia/cyan) × 3 rôles : `-fg` (texte -300) + `-bd` (bords/fonds -500,
  opacité côté classe) exposés en `@theme inline` ; `-glow` (ombre colorée au
  survol, hex V2 verbatim) en var brute dans le `shadow-[…]`. fg/bd = OKLCH EXACTES
  de Tailwind v4. `other` (fourre-tout) reste neutre-tokenisé. Galerie : bloc
  « Accents de catégorie » appliquant la vraie map `GUIDE_ACCENT`. Lint + 423 tests
  OK. (9) 3 rouges stragglers → rampe danger cohérente : 2 tokens `--danger-strong`
  (rouge-500) / `--danger-deep` (rouge-600), valeurs OKLCH exactes, au-dessus de
  `--danger` (rouge-400). BossPanel `text-red-500` (id non résolu) → `text-danger-strong` ;
  TowerCombatRoster `border-red-500 bg-red-500/15` (ban) → `border/bg-danger-strong` ;
  IrregularChaseMap `border-red-600 hover:border-red-400` (cadre) → `border-danger-deep
group-hover:border-danger`. Galerie : rampe danger ajoutée au bloc Statut.
  ★ Les composants guides NON-ÉDITORIAUX sont désormais 100 % sans classe vive
  (vérifié). Lint + 423 tests OK. RESTE : extension RAW_COLOR aux couleurs vives
  (gros chantier séparé qui touche TOUT le repo, pas que les guides).

- **Tokenisation couleurs guides — Phase 2 (composants ÉDITORIAUX)** (suite du
  chantier, périmètre phase 2). Même méthode : tokens PAR RÔLE aux valeurs EXACTES
  (OKLCH Tailwind v4 / rgba V2 verbatim), rendu inchangé. Famille `--ed-*` (21
  tokens) : (1) palette canonique à 6 teintes de `editorial/accents.ts` (QACard/
  Callout/TocBar…) — base `-400` (`--ed-sky/violet/emerald/amber/rose/cyan`, à
  opacités côté classe) + `-glow` (halo des puces, rgba V2 en var brute dans le
  `shadow-[…]`) ; fichier réécrit dessus (text/stripe/chip/callout/borderL/borderT/
  dot/from). (2) crans annexes des bannières/reviews : `-soft` (-200, texte de
  callout : BannerBlocks amber/emerald/sky), `-faint` (-100, anneau d'onglet au
  survol : BannerTabs), `-deep` (-500, anneaux PvE/PvP : review premium sky/rose),
  `--ed-pink` (héros « limited »), `--ed-purple-fg/-bd` (review fusion). 5 fichiers
  routés (BannerBlocks, BannerTabs, LimitedHeroesList, reviews/premium, reviews/
  fusion). Galerie `/dev/tokens` : bloc « Accents éditoriaux » (vraie map
  `EDITORIAL_ACCENT` : callout + puce lumineuse + crans annexes). ★ Toute
  l'arborescence `components/guides/**` est maintenant sans classe vive. Lint +
  423 tests OK.

- **Verrou eslint — couleurs vives interdites sous `components/guides/**`**
  (lock-in de la tokenisation). Nouvelle règle `no-restricted-syntax` scopée à
  `src/components/guides/**` : interdit EN PLUS des gris/white/black (RAW_COLOR)
  les classes vives numérotées (`red/sky/emerald/…-100…900`, préfixes bg/text/
  border(-lrtbxy)/ring/fill/stroke/from/via/to/divide/outline/decoration) —
  regex `VIVID_COLOR`, message dédié pointant vers les tokens + `/dev/tokens`. Le
  bloc RÉ-INCLUT les sélecteurs RAW_COLOR (un bloc flat-config redéfinit la règle
  pour ses fichiers). Périmètre volontairement CONFINÉ aux guides (arbo tokenisée) :
  le reste du site (fiche perso exemptée, tools/landing) n'est pas prêt. Prose
  `_contents` hors périmètre (vit dans `app/**/guides/_contents/**`). Vérifié :
  lint vert sur tout le repo + test négatif (une vive injectée = erreur, message
  correct). RESTE (hors chantier guides) : tokeniser tools/landing puis étendre le
  garde-fou ; prose `_contents` éditoriale (à laisser en Tailwind direct, à confirmer).

- **Lot config / hygiène (dette)**. (1) Trous de typecheck comblés :
  `next.config.ts` + `vitest.config.ts` ajoutés au `include` de la tsconfig racine
  (couverts par la passe `tsc` principale) ; `scripts/*.mjs` (maillon R2 :
  `assets-push`, `r2-cors`) désormais typecheckés — `scripts/tsconfig.json` passe
  en `allowJs+checkJs` (+ `**/*.mjs`), les 18 gaps révélés corrigés par
  annotations JSDoc INERTES (objets `env`/`pushed` typés `Record<string,string>`,
  params crypto/`walk` typés). Les 3 passes tsc vertes, `node --check` OK.
  (2) `.env.example` : `DB_*`/`BOT_API_URL` (lus par AUCUN code, vérifié) annotés
  « V2 — pas encore porté » (mémo de prod, plutôt que supprimés). (3) Doc↔code :
  en-tête de `src/lib/data/geas.ts` corrigé — il disait que le classement bonus/
  malus se lit sur le flag `positive`, alors que `isBonusGeas` classe sur le SIGNE
  de `points` (« aide au combat ≠ bonus de score »). RESTE (hors ce lot) : CSP
  nonce + strict-dynamic (risqué : middleware + vérif build/runtime → passe dédiée) ;
  doc↔code restants en datagen (worker).

- **Recherche globale (palette Ctrl+K)** — item « Pages manquantes ». Trigger
  header (desktop = pilule « Search… ⌘K », mobile = loupe) + raccourci global
  Ctrl/⌘+K. Archi : index construit CÔTÉ SERVEUR (`src/lib/search-index.ts`,
  `buildSearchIndex(lang, t)`) et servi par un route handler `/api/search?lang=`
  (Cache-Control CDN agressif) — chargé à la 1re ouverture, PAS inliné dans le
  header de chaque page. Périmètre : pages (nav + catégories de guides + pages
  annexes, contrat `lib/nav.ts`), personnages (`/characters/<slug>` + face icon),
  guides (`/guides/<cat>/<slug>`). **Équipement différé** (éclaté familles/sets/EE,
  slugs dérivés — l'archi et la palette le prennent tel quel, `kind:'equipment'`).
  `SearchModal` (client) : fetch mémorisé au niveau module (par langue, requêtes
  concurrentes dédupliquées), filtre ACCENT-INSENSIBLE (NFD), résultats groupés
  par nature (8/groupe), navigation clavier complète (↑↓ parcourt, Entrée ouvre,
  Échap ferme), voile + verrou de scroll. `buildSearchIndex` est BEST-EFFORT par
  source (`source()` : une source qui jette — ex. guide transitoirement malformé
  pendant un portage — est ignorée avec `console.warn`, la palette ne 500 pas ;
  l'erreur reste levée bruyamment par les pages qui lisent la donnée en direct).
  Test `search-index.test.ts` (7) sur la donnée committée. Lint + tsc OK, suite
  464 verts (arbre guides redevenu sain). Fix : les pages de CATÉGORIE de guides
  affichaient un carré vide → icône `img.guideIcon(cat.icon)` ajoutée (garde-fou
  de test).

- **Tests `seo.ts` + compléments `skill-view`** (suite de la campagne tests,
  +35 → 458). `seo.test.ts` (26) : `createPageMetadata` (canonical, hreflang ×5
  - x-default dérivés de `buildUrl`, suffixe titre, tailles/carte OG-Twitter
    défaut vs custom carré/paysage, robots noindex, locale, og:type article vs
    website), et tous les builders JSON-LD (`buildSiteJsonLd` graphe connecté,
    breadcrumb positions, `VideoGameCharacter`/`Article` image absolutisée +
    `datePublished` repli, `ItemList` ordres schema.org, `VideoObject` youtube/
    twitch/bilibili + null si champ Google manquant, FAQ, `getMonthYear`).
    Assertions dérivées des mêmes helpers (`buildUrl`/`CANONICAL_ORIGIN`) → indép.
    de l'env. `skill-view.test.ts` (+9 → 39) : `cardEffects` (effets propres,
    union variantes, héritage burst_1..3 du burstable, passif rattaché par caller,
    curation chipHide/chipAdd substituable, vide→undefined) + `levelTooltipEffects`
    (tooltip de niveau à icône → chip ; statut cité comme CONDITION par la desc
    exclu) — ancrés sur un tooltip réel à icône CALCULÉ du glossaire committé.

- **Lot de tests « petits modules purs »** (suite de la campagne tests, +40).
  Six fichiers co-localisés : `stats.test.ts` (statAbbr connu/repli,
  `statOptionView` sur les 4 régimes flat/rate/%/RAW_FLAT — EFF flat brut, ATK
  rate suffixé, CHC % sans suffixe —, `statIconSprite` WG=undefined, `statName`
  glossaire+repli) ; `game-tokens.test.ts` (reconnaissance élément/classe +
  slug/nature, FRONTIÈRE LATINE « Fire »∉« Firefly », reconstruction fidèle,
  mention CJK sans frontière de mot) ; `tower-restrictions.test.ts` (ban prime
  sur quota, alias attacker→striker/priest→healer, star numérique, neutral) ;
  `site.test.ts` (`buildUrl` en routage PATH et SUBDOMAIN via `vi.stubEnv` +
  import dynamique — le module fige son profil au chargement —, apex vs
  sous-domaine, normalizeLang, racine sans slash) ; `i18n/index.test.ts` (`makeT`
  interpolation, clé brute si absente, `{k}` littéral, pluriels ICU one/other/#,
  combiné) ; `guide-sections.test.ts` (`resolveSectionTitle` title/preset/sujet
  avec `t` factice + jets sur preset/élément/perso inconnus). Stratégie : pur en
  synthétique, ancrage glossaire committé pour le reste. 383 → 423 tests, typecheck
  OK. RESTE mineur : builders JSON-LD de seo.ts + hreflang `buildAlternates`.

- **Tests `skill-view.ts` — APPROFONDISSEMENT (vues monstre / immunités /
  chaîne)** (suite du prio 1). +12 tests (18 → 30). VUES MONSTRE
  (`monsterSkillViews`, le cœur commenté « cas payé ») : duplication d'un effet
  de passif vers son skill déclencheur `caller` (ET conservation) — les cas
  Prototype EX-78 / Irregular Queen ; caller IGNORÉ sur skill actif (faux positif
  de kit réutilisé) ; réattribution vers le seul skill dont la desc nomme le buff ;
  fusion `rage_finish`→`rage_enter` (finish sans nom/desc absorbé) ; finish
  orphelin (sans enter) supprimé ; variante technique masquée ; WG jamais une chip
  côté monstre ; `chipOwner` curé prioritaire sur les signaux de tables.
  `immunityChipEffects` : résolution tooltips + types (`effectByKey` côté debuff)
  - baisses de stat (`BT_STAT|ST_*`), repli déclinaison-numérotée→base, réfs
    mortes rendues en `unresolved`. `buildChainView` : null sans chain_passive,
    répartition strike→chaîne / backup→duo, un niveau par palier. 371 → 383 tests.

- **Tests `skill-view.ts` (prio 1 du TODO)** — le module aux règles les plus
  fines du repo (741 lignes) n'avait AUCUN test. 18 tests posés
  (`skill-view.test.ts`), stratégie endossée par le TODO : règles DÉTERMINISTES
  en synthétique + ancrage sur le glossaire committé (une clé tooltip réelle
  calculée à l'exécution, pas de `.gamedata` requis). Couvert : les exclusions de
  câblage de `toChipEffect`/`toClientEffects` (enfant `choice`, `NON_CHIP_BUFFS`
  Ais/Astei/Ember, `BT_STAT` à label seul, `SYS_BUFF_DMG`, reverse-heal ciblé
  soi/allié = coût HP, tooltip irrésoluble) et le cas positif (tooltip du
  glossaire → chip) ; `isTranscendUpgrade` via ses 3 branches (palier autonome
  cantonné / rattaché par `caller` gardé / accordé au niveau 1 gardé) ;
  `monsterChipMeta` (WG→null, résolution nom+nature) ; `buildBurstViews`
  (numérotation 1..3, coût AP du burstable, variante la plus complète) ;
  `dedupSkills`, `mainSkills` ; smoke sur 400 skills réels (aucun throw,
  `buildStatusMap` rend des statuts). 353 → 371 tests. RESTE (TODO) : vues
  monstre (réattribution caller/enrage), immunités, chaîne, curation cardEffects.

- **Props / branches mortes retirées** (dette code, chaque prop RE-VÉRIFIÉE contre
  tous ses call sites). `CharacterCard` : 6 props d'affichage jamais passées
  (showName/showIcons/showElement/showClass/showStars/showBadge) + `children` +
  la branche `maxWidth: 120` inatteignable (seul `sm` atteint le nom-sous-carte,
  et son container fait 66) → composant allégé, sortie IDENTIQUE (les défauts
  valaient déjà true). `title` : prop morte de MonadRouteClient (le seul appelant,
  MonadGateGuide, ne la passe pas) qui alimentait un `<h2>` mort de MonadGateMap —
  retirée des deux + son rendu. `defaultIndex` : mort sur SegmentedTabs (toujours 0) et BossEncounters (toujours `encounters.length-1`, la difficulté la plus
  dure) → inliné ; EncounterSelection.defaultIndex GARDÉ (requis, passé par
  StagedBossGuide). `guide-accents.ts` : `textSoft`/`dot`/`stripe`/`border` lus
  par personne (CategoryCard n'utilise que 7 des 11 champs) → 48 chaînes Tailwind
  mortes supprimées, type resserré. Typecheck + 353 tests OK.

- **Éditeur admin EE** (dernier éditeur d'équipement — les autres pièces n'ont
  pas de curation à éditer, décision Sevih). L'`editor/ee` était un placeholder ;
  la couche curée EE (`rank`/`rank10`, tier list V2 ee-priority-base/plus10)
  existait dans `equipment.json` et s'affichait déjà mais était éditée MAIN.
  Livré, en DEUX volets dans un seul formulaire :
  • **Priorité** : sélecteurs `rank` (déblocage) / `rank10` (+10) avec aperçu
  image (`IG_Event_Rank_*`).
  • **Câblage buff/debuff des passifs** (demande Sevih) : masquer/ajouter les
  chips des passifs de l'EE (carte UNIQUE — un EE n'a qu'un jeu de passifs).
  Modèle : `EquipmentCuratedEntry` gagne `chipHide?`/`chipAdd?` (EE-only) ;
  `buildEeDetail` applique la curation aux `effectChips` (helper `eeChipEffects`
  partagé avec l'export `eeEditorChips` des chips AUTO résolues). `effectChips`
  passe de `EffectShape[]` à `ClientEffect[]` (contrat réel d'EffectChipsRow).
  Store `equipment-curated-store.ts` (upsert de l'entrée `ee`, préserve les
  autres sections + un éventuel `source`, section `ee` triée, `writeJson`
  canonique, validation `validateEquipmentCurated`) + route `POST
/api/admin/curated/ee/[id]`. Pages : liste `editor/ee` (rangs + lien) +
  `editor/ee/[id]` (form `EeCuratedEditor`), `EntitySwitch` élargi à `ee`. Nav :
  `soon` retiré, cellule Édition de la matrice d'accueil branchée (couverture
  X/N). Vérifié : `equipment.json` déjà canonique (0 reformatage à la 1re
  écriture), rendu public EE byte-identique (aucune curation chip posée),
  typecheck + lint (fichiers propres) + 353 tests OK.

- **`ResponsiveCharacterCard` : layout-shift réduit (défaut SSR = md) + hook
  mémoïsé** (perf UI publique, page la plus visitée). Deux volets :
  (1) `useMediaQuery` mémoïsé — `subscribe`/`getSnapshot` étaient recréés à chaque
  rendu → `useSyncExternalStore` se désabonnait/réabonnait à `window.matchMedia`
  à CHAQUE rendu, multiplié par les ~200 cartes (2 requêtes chacune). Passés en
  `useCallback([query])`. Bénéficie aussi à TeamSlotCarousel.
  (2) Layout-shift — DÉCISION Sevih : le SSR (sans viewport) partait toujours sur
  `sm` (66px) puis sautait à `lg` (120px) à l'hydratation. `useMediaQuery` gagne
  un `serverDefault` (via `getServerSnapshot`) ; la carte force `md` au SSR
  (`/characters` est surtout desktop). Le shift devient md→lg au pire sur grand
  écran, mobile se recale md→sm — plus jamais depuis 66px. `useSyncExternalStore`
  gère le recalage client sans warning d'hydratation. TeamSlotCarousel inchangé
  (serverDefault reste `false`). Typecheck (mes fichiers) + 353 tests OK.

- **Caches périmés (partie src) STAMPÉS sur le mtime du curé** (bug moyen —
  process admin long-running). `gear-reco.ts` (`famByMember`) et `rewards.ts`
  (`gearIndex`) indexaient membre→famille d'équipement dans un cache module
  PERMANENT. Or les familles sont matérialisées depuis `data/curated/equipment.json`
  (nom/icône/slug/source/passifs) — mutable via l'admin, `loadEquipmentEditorial`
  le relit à chaque appel. Les deux caches contredisaient donc l'en-tête « l'admin
  voit ses écritures immédiatement » : une réédition de l'éditorial n'apparaissait
  qu'au redémarrage. Fix : `equipmentEditorialStamp()` exporté d'equipment.ts
  (source unique du chemin curé, `statSync` → mtime, `-1` si absent) ; les deux
  caches se re-bâtissent quand le stamp bouge (même patron que `loadCuratedEffects`
  et monster-store). Structure d'index inchangée. Typecheck + 353 tests OK. RESTE
  (worker) : les caches DATAGEN équivalents (v2-control, manifest faceIconIndex,
  equipment groupKidsCache, goods/recruit).

- **Index des clés curées MUTUALISÉ (`resolveEffectKey` ↔ skill-view)** (dette
  code / duplication + cache périmé, d'une pierre deux coups). `resolveEffectKey`
  (effects.ts) faisait un scan linéaire `Object.entries(loadCuratedEffects())
.find(c.keys.includes(key))` à CHAQUE résolution de titre de section ; skill-view
  maintenait en parallèle un index `curatedKeyCache` (`nature|clé`→id) mais dans
  un cache module PERMANENT (jamais invalidé → périmé dès que l'admin réécrit le
  curé). Fusionnés en `curatedKeyIndex()` (effects.ts) : deux vues (`byKey` pour
  resolveEffectKey, `bySideKey` pour skill-view), mémoïsé sur l'IDENTITÉ de
  l'objet renvoyé par `loadCuratedEffects` (qui bascule au mtime) — donc frais
  dans le process admin, contrairement à l'ancien cache permanent. Sémantique
  préservée à l'octet (premier-gagnant dans l'ordre du fichier). +2 tests
  d'invariant (index fidèle au scan linéaire ; toute clé curée reste résoluble).
  Typecheck + 353 tests OK.

- **Câblage buff/debuff des PERSOS dans l'éditeur** (matrice admin — parité
  partielle avec l'éditeur de monstre). Constat Sevih : l'éditeur perso ne
  touchait qu'aux champs curés (rank/rôle/prio/tags/vidéos), jamais au câblage
  d'affichage des chips de skills, alors que le monstre l'a (MonsterKitEditor).
  Périmètre ACTÉ (le rendu perso est déterministe, contrairement au monstre où
  tout s'empile sur un porteur) : **masquer + ajouter uniquement**, PAS de
  déplacement inter-cartes (`chipOwner`) — question posée, réponse « Masquer +
  Ajouter ». Livré :
  • Couche curée `data/curated/character-skills.json` — `chipHide` (cardId →
  refs `tooltip/label` masquées) + `chipAdd` (cardId → réfs tooltip du
  glossaire ajoutées). cardId = id du skill (mains/fusion_passive/extra), id
  du chain_passive pour la chaîne, `…::dual` pour le duo.
  • Moteur : `CharacterKitCuration` + `characterCurated()` (lecture disque
  tolérante au fichier absent) + `applyCardCuration()` (filtre LOCAL) threadés
  dans `cardEffects(skills, s, curated?)` et `buildChainView(skills, lang,
curated?)` — l'admin passe `{}` pour les positions « règles pures ».
  • Store `character-skill-curated-store.ts` (patch card-scoped, `writeJson`
  canonique, `_doc` préservé, clés triées) + route `POST
/api/admin/curated/character-skills` (403 hors dev).
  • Composant `CharacterKitEditor` (× masque / + ajoute, identité par
  carte+ref, datalist du glossaire) branché dans l'éditeur perso.
  • 2e passe `mergeStatusEffects` sur la fiche publique ET l'extractor pour
  résoudre le statut des `chipAdd` (nom/icône/nature) — même patron que
  BossPanel. Fichier curé vide au départ → rendu public byte-identique tant
  qu'aucune curation n'est posée. Typecheck + lint (fichiers propres) + 351
  tests verts. NB : `skill-view.ts` reste sans test unitaire (chantier TODO
  priorité 1 séparé).

- **Wrappers de guides uniformisés sur le re-export 1 ligne** (dette code /
  duplication). 64 `index.tsx` qui ne faisaient que forwarder `{...props}` à un
  composant de rendu partagé (EncounterBossGuide ×30, VersionedBossGuide ×11,
  StagedBossGuide ×10, TowerGuide ×8, GuildRaidGuide ×5) passent de 6-8 lignes à
  `export { X as default } from '…'` — modèle déjà prouvé par les 31 monad-gate.
  NON touchés : les 34 wrappers qui INJECTENT un `content.json` local
  (BossGuide & co, le re-export sec ne peut pas passer le contenu) et les 12
  vrais contenus éditoriaux de `general-guides`/`other` (100-485 lignes). Le
  loader (`guide-detail.tsx`) lit `mod.default` — re-export transparent.
  Typecheck OK, 27 tests guides verts.

- **`StatInline` / hex éléments — faux doublon levé, mort retiré** (dette code /
  duplication). Le `StatInline` local d'`EquipmentDetail.tsx` était flaggé
  « redondant avec `inline/StatInline` » : VÉRIFICATION → ce n'est pas un
  doublon. Le local résout l'icône depuis `statKey`, tronque le nom, n'a pas de
  tooltip ; le partagé prend `name/iconSrc/desc` pré-résolus + tooltip. Rôles et
  habillages distincts. Renommé `EquipStatChip` (l'homonyme induisait le faux
  constat de doublon) + docstring qui explique la distinction. `detail/theme.ts` :
  seul `.hex` d'`elementAccent()` était consommé — les 4 champs alpha
  (`glow/soft/softer/border`) + l'interface `ElementAccent` étaient CALCULÉS
  MORTS ; réduit à `elementHex(): string`, `ELEMENT_HEX` dé-exporté (n'était lu
  qu'en interne). Les valeurs miroitent globals.css (`--fire`…) : commentaire
  renforcé (seconde source assumée, pas indépendante). Le vrai single-source CSS
  (`var(--${element})`) est REPORTÉ — il casse sur la clé `dark` vs `--dark-elem`
  et touche des styles inline SSR de la fiche perso (risque visuel, relecture).
  Typecheck OK.

- **Code mort — exports src sans consommateur** (dette code, chaque symbole
  RE-VÉRIFIÉ par grep repo+datagen avant retrait). SUPPRIMÉS : `elementName`/
  `className` (game-tokens.ts — seul `splitGameTokens`/`GameToken` importés),
  `tagDesc` (tags.ts), et tout le cluster `SuffixLang`/`getLangConfig`/`GameLang`/
  `GAME_LANGS`/`isGameLang` de `i18n/config.ts` — c'était une COPIE côté site,
  self-référentielle (aucun rendu ne la lisait) ; la vraie notion « langue de
  jeu » vit côté données dans `datagen/lib/lang.ts`, très utilisée (laissé un
  commentaire qui pointe là). Repli INOPÉRANT retiré de `guide-sections.ts:69-72` :
  le 2ᵉ `resolveEffectKey(côté inversé)` ne pouvait jamais réussir, la fonction
  testant DÉJÀ en interne le côté demandé puis l'opposé puis le curé (effects.ts).
  DÉ-EXPORTÉS (usage uniquement interne à leur fichier) : `resolveRewardEntry`
  (rewards.ts), `EffectTooltipBody` (EffectChips.tsx), `ELEMENT_HEX` (fait à
  l'item theme.ts). `gearIssueCounts` : déjà absent. GARDÉS À DESSEIN :
  `getMonthYear`/`buildVideoObjectJsonLd`/`buildFaqJsonLd` (seo.ts) — /tierlist
  et /tools sont inventoriés en « Pages manquantes ». Typecheck + 351 tests OK.

- **`data/legacy/` SUPPRIMÉ (249 fichiers) — l'oracle V2 déposé** (fin du PRIO #1).
  Trois familles de lecteurs coupées : (1) OUTILS ONE-SHOT obsolètes (migration
  finie) — `import-equipment`, `import-gear-reco`, `seedFromLegacy` +
  `datagen/curated/seed.ts`, scripts `datagen:seed-curated`/`extract-entity`.
  (2) ORACLE DE COUVERTURE (« qu'a-t-on zappé vs V2 ? ») — `core/diff.ts`,
  `extractor/run.ts`, `specs/index.ts` supprimés ; `coverage`/`FieldStatus`/
  `CoverageSpec` retirés de `core/spec.ts` + `core/runner.ts`, bloc `coverage:`
  de `specs/character.ts` retiré (le moteur `runSpec` et `characterSpec` RESTENT :
  `buildCharacters` s'en sert). (3) REPLIS RUNTIME — pros-cons legacy était du
  CODE MORT (keyé par slug, appelé par id V3 ; les 46 persos 100 % en curé) →
  repli retiré de `pros-cons.ts` + scan legacy de `tag-control.ts` ; icônes
  d'effets (105/193 effets sans icône de jeu) RAPATRIÉES du glossaire V2 vers
  `data/editorial/effect-icons.json` (versionné V3), `datagen/lib/effects.ts`
  repointé. Vérifié : `buildEffectGlossary()` produit un glossaire d'effets
  BYTE-IDENTIQUE au committé, legacy absent (l'éditorial couvre tout) ; typecheck
  - lint + 351 tests OK. RESTE hors legacy : le regen coupons/banner (EXCEPTION
    jusqu'à bascule prod, cf. TODO).

- **CSP resserrée : `unsafe-eval` retiré du script-src en PROD** — il n'est
  requis QU'EN DEV (le HMR / React Fast Refresh de Next s'appuie sur eval) ; un
  build de prod n'en a pas besoin. `script-src` construit dynamiquement :
  `unsafe-eval` n'entre que si `NODE_ENV !== 'production'`. Vérifié — prod →
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com`
  (sans eval), dev → avec eval. Prérequis vérifié avant : aucun `eval`/`new
Function` dans `src/`, aucune dépendance cliente eval-suspecte. Au passage, le
  `isDev` du fichier était dupliqué (défini deux fois) — dédupliqué en tête.
  RESTE (TODO) : nonce + strict-dynamic pour retirer `unsafe-inline`. NB : la CSP
  ne prend effet qu'au prochain déploiement — un smoke-test du build prod reste
  la confirmation ultime avant bascule.
- **Factorisations admin (switches / pickers / sidebars)** — trois paires quasi
  dupliquées fusionnées. (1) `EntitySwitch({id, mode, entity})` générique remplace
  CharacterSwitch + MonsterSwitch (identiques au segment de route près), 4 call
  sites. (2) `SearchPicker<T>` : châssis de sélecteur cherchable (recherche →
  dropdown → aperçu + « changer »), CharacterPicker et ItemPicker deviennent des
  adaptateurs minces passant leur filtre/classement, icône de ligne et aperçu du
  sélectionné en callbacks. (3) `CharactersSidebar` (spécialisée) fusionnée dans
  `ExtractorSidebar` (générique, superset) : adaptateur `characterExtractorRows`
  mappe `SidebarRow`→`ExtractorRow` (face `FI_<id>`, élément/classe en overlays
  du portrait, rareté en étoiles), un champ `marker` générique porte le ✎ « curé ».
  3 composants supprimés. Vérifié : typecheck + lint + 351 tests OK. La sidebar
  perso adopte l'UX générique (nom d'abord, overlays) — à confirmer d'un coup d'œil.

- **Homonymes dédupliqués (partie non-admin)** — deux pièges levés. (1) Les
  constantes d'ordre d'équipement vivaient en copies : `GRADE_RANK`/`GRADE_ORDER`
  ×3 (equipment.ts, equipment-detail.ts, char-progression.ts — la 3ᵉ sous un nom
  DIFFÉRENT pour la même table) et `PIECE_ORDER` ×2 (equipment-detail, gear-reco)
  → source unique `src/lib/data/gear-order.ts` (module feuille, zéro import → pas
  de cycle), branchée aux 4 fichiers, nom uniformisé `GRADE_RANK`. Un grade ou
  une pièce ajoutés par le jeu se changent désormais à UN endroit. (2) `gearById`
  homonyme piégeux : rewards.ts définissait une fonction LOCALE `gearById`
  (résout une FAMILLE) tout en important `gearById` d'equipment.ts aliasé en
  `gearPieceById` (résout une PIÈCE) — deux « gearById » de retours différents
  dans le même fichier. La locale renommée `gearFamilyById` (+ 2 appels). RESTE
  (cf. TODO) : `rankOptionLabels` et `BOSS_TYPES` (touchent l'admin, zone du
  worker) + l'index `resolveEffectKey`. Typecheck + 351 tests OK.
- **Éditeur de recos : aperçu iconographique « à vue »** (demande Sevih) —
  l'éditeur `GearRecoEditor` listait des ids bruts dans des `<select>`. Un
  `<option>` HTML ne peut pas porter d'image → à côté de chaque sélecteur, un
  aperçu du sprite de l'item choisi (endpoint `/api/admin/sprite`, dev, comme
  `GearDetail`) : armes, amulettes, talismans (badge `$` pour un preset, ⚠ pour
  un id irrésolu, carré vide si rien). Les sets (preset-only dans l'éditeur)
  affichent les icônes des sets du preset — `GearOption` porte désormais son
  `icon`, la page éditeur résout slug→pièces→icônes (`setPresetIcons`). Vérifié :
  icônes résolues (armes/sets/presets), 351 tests verts, typecheck + lint OK.

- **Primitive `HeatSlider` — dédup RankSlider ↔ EncounterSlider** — les deux
  glissières d'échelle longue (palier de boss dans BossStats, stage dans
  EncounterSelection) partageaient ~90 lignes quasi identiques : le double-ref
  `hit`/`rail` (zone d'écoute vs mesure — le geste tactile correct), `pos`,
  `clamp`, `indexAt`, capture de pointeur, clavier (←/→ un cran, Page↑/↓ trois,
  Début/Fin), boutons ◀▶, rail + dégradé de chaleur + pouce. Extrait en composant
  `src/components/guides/HeatSlider.tsx` qui rend le CHÂSSIS et prend en props ce
  qui diffère : graduations (`marks`), contenu du pouce (`thumb`), libellés du
  bas (`labels`), et les dimensions (`railClass`/`padClass`/`thumbClass`). Les
  deux appelants deviennent de simples adaptateurs (RankSlider = badges de grade
  - repères E…SSS ; EncounterSlider = numéros de stage, dans sa carte). Classes
    Tailwind reprises À L'IDENTIQUE par appelant → rendu et gestes inchangés (à
    confirmer d'un coup d'œil). Imports react devenus inutiles retirés des deux
    fichiers. typecheck + lint + 351 tests OK.
- **Intégration PAR ENTITÉ pour l'item** (complète l'extracteur d'items) — bouton
  « Intégrer » (ou « Retirer » si l'id a disparu du frais) sur chaque ligne du
  diff de `/admin/extractor/items`. Cœur `integrateItemData(dir, id)` EXTRAIT
  dans `item-catalog.ts` : reporte la seule entrée fraîche dans `items.json`
  (tri `catalogCompare`, canonique) — désormais PARTAGÉ entre le rebake de
  l'éditeur curé (`bakeItemCatalogEntry`, réduit à une façade) et la revue
  d'extraction (`integrateItem`), plus de logique dupliquée. Wrapper
  `integrateItem` : entrée + staging de l'icône (`images/items/…`, sautée si
  placeholder blacklisté). Route `POST /api/admin/integrate/item/[id]`,
  `ExtractorReview` reçoit un prop `integrateKind` optionnel (bouton par ligne,
  générique). Vérifié : ré-intégration idempotente (0 diff `items.json`), 351
  tests verts, typecheck + lint OK.

- **Stores d'édition curée : écriture au format CANONIQUE** — les 6 stores admin
  (`curated-store` persos, `effects-store`, `item-curated-store`, `gear-reco-store`,
  `monster-skill-curated-store`, `promo-banner-store` coupons/banner) écrivaient
  en `JSON.stringify(sorted, null, 2)` au lieu du sérialiseur canonique
  (`writeJson`/`formatJson` de `datagen/lib/json`). Conséquence : les tableaux
  courts (`tags`, `videos`…) s'éclataient en multiligne, donc chaque édition d'UNE
  entité via l'admin reformatait TOUT le fichier (diff git géant — vu en direct
  quand Delta a été ajouté au curé). Tous passés en `writeJson` ; les mutateurs
  (`upsert*`, `apply*`, `save*`, `regen*`) et leurs 8 routes deviennent async
  (`await`). Vérifié : les 8 fichiers `data/curated/*` sont déjà canoniques (rien
  à reformater — le fix est purement code), 351 tests verts, typecheck + lint OK.
  Piège documenté dans l'en-tête de `lib/json.ts`, désormais fermé côté admin.
- **A11y des barres d'onglets (roving tabindex) + micro-fixes** — les 5
  implémentations `role="tablist"` du site (ui/Tabs, guides/SegmentedTabs,
  EncounterSelection, MonsterLineup, TeamSlotCarousel — l'audit en citait 4)
  n'avaient AUCUNE navigation clavier ni liaison onglet↔panneau. Helper unique
  `src/lib/tablist.ts` (`onTabListKeyDown`) : ←/↑ recule, →/↓ avance (cyclique),
  Home/End aux extrémités, sélectionne ET déplace le focus. Roving tabindex
  posé partout (`tabIndex` 0 sur l'actif, −1 sinon → Tab entre/sort de la barre,
  les flèches naviguent dedans). Les deux primitives à panneau unique (ui/Tabs,
  SegmentedTabs) gagnent en plus `id`/`aria-controls` sur les onglets et un
  panneau `role="tabpanel"` lié (`aria-labelledby`, focusable) — sémantique
  d'onglet conditionnée à « >1 onglet » dans SegmentedTabs (sinon aria-labelledby
  pointerait dans le vide). Micro-fixes du même audit : LicenseTabs — face avant
  nommée (`revealLabel`) et seule la face VISIBLE focusable/exposée (backface-
  hidden ne masque qu'au visuel) ; TowerFloorMenu — `aria-label` sur la
  recherche (placeholder ≠ label) ; EeTranscendSection — boutons +/- redondants
  (le slider est la commande accessible) sortis de l'arbre a11y + du focus au
  lieu d'`aria-label="-"/"+"` ; GearRecoSection — `aria-pressed` sur le sélecteur
  de build. Aucun changement visuel. 351 tests verts, typecheck propre (mon
  périmètre).
- **Extracteur d'ITEMS** (PRIO Sevih — l'entité manquante de la matrice) —
  nouvelle cible de revue `item` (`buildItemCatalog` : items + goods + costumes
  - overlay curé baké, exactement la forme d'`items.json`), mémoïsée sur les
    tables d'items ET `data/curated/items.json` (l'éditeur d'items le réécrit, la
    revue doit le refléter). Page `/admin/extractor/items` sur le composant
    générique `ExtractorReview` (diff jeu↔site new/diff/typo + « valider toute
    l'extraction » + « corriger les typos »), helper `itemReviewProps` qui résout
    les noms via l'union committé ∪ frais (nouveaux et disparus nommés), exposé
    par un `targetBuild(id)` (build frais mémoïsé, gratuit après `reviewTarget`).
    Entrée de menu Extractor (Item en fin, aligné sur l'Editor) + ligne de la
    matrice d'accueil (couverture curée X/N). Vérifié : 0 faux positif
    (`buildItemCatalog()` == `items.json` committé, 1171 items), 351 tests verts,
    typecheck datagen + lint OK. RESTE : intégration PAR ENTITÉ (bouton) — le
    « valider tout » global marche déjà.
- **Intégration par entité pour l'ÉQUIPEMENT** (PRIO Sevih — pendant gear de
  `integrateCharacter`) — bouton « Intégrer » sur les fiches extracteur (armes,
  amulettes, talismans, EE, sets) qui valide CETTE entité sans passer par le
  promote global. Cœur `integrateEquipmentData` (datagen, testable, injecté sur
  dossier temp) : merge toutes les lignes de la FAMILLE (plusieurs paliers
  d'étoiles) dans son fichier de slot + son entrée dans `families.json` + les
  records PARTAGÉS qu'elle référence (pools/passifs/paliers de casse) — comme
  `integrateCharacter` embarque les skills, sinon réfs pendantes côté site pour
  une famille neuve ; seuls les records référencés entrent (pas les voisins).
  Wrapper `integrateEquipment` : extraction fraîche + staging des images
  (icônes d'items + de passifs, + PNG og de l'icône représentative). Glossaires
  transverses laissés à `datagen:build` (une famille neuve réutilise des grades/
  classes déjà committés). Route `POST /api/admin/integrate/equipment/[kind]/[id]`,
  bouton `IntegrateGearButton` (rapport fichiers + images), câblé dans
  `GearDetail`. +6 tests (merge non destructif, refs ciblées, idempotence,
  upsert de famille, entité inconnue). 340 tests verts, typecheck + lint OK.

- **Oracle de test `combat-power`** — la formule de Combat Power sans équipement
  (reverse-engineered, « validée 0-diff in-game par le gear-solver ») n'avait
  aucun test. Verrouillée par 11 cas en deux familles : (1) invariants hand-
  dérivés du modèle, exacts et indépendants du cœur stat-dépendant — +500 par
  étoile UI, +120 par « +1 », +100 par niveau de skill au-dessus de 1, +5000 en
  Core Fusion, cap du crit rate à 100 % (130 ≡ 100), sortie entière ; (2) quatre
  snapshots de régression sur des profils réalistes (DPS crit, tank HP/DEF,
  support fusionné, crit cappé + coude du facteur crit) figés à l'état validé.
  Une modif du cœur fait bouger les snapshots → revue explicite.
- **`stamp-guides` : deux défauts corrigés (dates de guides auto)** — le stamp
  maintient `meta.updated` au commit (le build ne voit pas git). Défaut 1
  (diff parasite) : le stamp réécrivait le meta en `JSON.stringify(…,2)`, qui
  ÉCLATE en multiligne les tableaux courts que prettier garde inline (ex.
  `"dungeons": ["100805"]`). Comme le commit maison saute les hooks
  (`--no-verify`), le meta partait non-prettier et rebondissait en diff au
  `format:check` suivant. Piège latent (aucun des 141 metas re-stampé depuis la
  baseline, donc jamais déclenché) mais réel : prouvé qu'un bump aurait éclaté
  les tableaux. Fix : sérialisation via l'API Node de prettier (le CLI aurait
  interprété les `[lang]` du chemin comme un glob), qui reprend le `printWidth`
  du repo — sortie byte-identique à prettier, vérifiée sur un meta à tableaux +
  bump e2e réel. Défaut 2 : `--all` SANS date suivante dégradait silencieusement
  en mode normal (bump des seuls guides modifiés) au lieu de la baseline —
  désormais refus explicite. Au passage : le contrôle « le stamp attrape-t-il
  tout le pertinent ? » a été refait — tout le contenu d'un guide vit dans son
  dossier (zéro contenu partagé hors dossier, zéro import remontant), archives
  de versions exclues sauf la plus récente (même regex/tri que `guides.ts`).
  Limites ASSUMÉES : le contenu dérivé de `data/generated` ne bump pas (dérive
  de data ≠ édition) et les images (`public/images/guides/…`, hors `_contents`)
  non plus.
- **Recos (gear-reco) de Ryu Lion (2000097) + Delta (2000121) mises à jour
  depuis V2** — le snapshot legacy était figé ; sync des fichiers V2 à jour
  (`reco/2000097.json`, `reco/2000121.json` — nouveau, `reco/_presets.json`
  +preset de sets `a2s2` = Attack×2/Speed×2) puis ré-import `import-gear-reco.ts`.
  Périmètre vérifié strictement borné : côté curé, seuls `2000097` + `2000121`
  changent (Delta ajouté, 90 persos / 246 builds), presets = +`a2s2` seul ; 0
  référence irrésolue. Preuve d'absence de divergence : un ré-import à blanc du
  legacy inchangé reproduit le curé à l'identique. LIMITE connue (pipeline, pas
  une régression) : seules les notes EN sont capturées, les `Note_fr/jp/kr/zh`
  V2 sont ignorées pour les 90 persos. TODO ajouté : rendre l'UI d'édition des
  recos fidèle au rendu public (icônes, main stats).
- **Comparaisons V2 RETIRÉES de l'admin** (PRIO Sevih #1) — l'oracle a joué son
  rôle. Supprimés : `datagen/extractor/v2-control.ts`, `coherence.ts`,
  `src/lib/admin/equipment-control.ts`, `V2ControlPanel`, `EquipmentReport`,
  `v2MissingInV3` + `v2Reference` (effects.ts), script `datagen:coherence`.
  Toutes les pages extracteur (persos, effets, EE, armes, amulettes, armures,
  talismans, sets) tournent désormais sur le moteur `review` (diff jeu↔site
  new/diff/typo) via le composant générique `ExtractorReview` — index des
  équipements refaits à partir d'un helper `equipmentReviewProps(kind)` (noms
  résolus par famille/vue). Fiche perso extracteur : panneau V2 retiré (garde le
  diff extraction↔committé + intégration). GearDetail : bloc « Contrôle V2 »
  retiré (garde l'affichage info). Sidebars sans colonne `v2≠` ; badges du menu
  admin sur les buckets review (plus `equipmentV2Control`/`v2MissingInV3`).
  Éditeur d'effets : référence V2 retirée. Ordre du side-menu Extractor/Editor
  ALIGNÉ (demande Sevih). Vérifié : 0 code de comparaison V2 restant, 334 tests
  verts, extraction équipement sans faux positif. RESTE (cf. TODO) : déposer
  `data/legacy/` (encore lu par les specs datagen + imports one-shot).
- **Helper `normalizeLang` — fin du boilerplate lang (18 occurrences)** — chaque
  page répétait le bloc « await params » suivi de la normalisation
  copiée-collée du param de langue (garde de type puis repli sur un littéral en
  dur, avec un cast). Un seul helper exporté par la config i18n remplace les 18
  occurrences dans 9 pages, plus la copie privée du module SEO (dédupliquée).
  Le repli passe du littéral en dur à la langue par défaut de la config (même
  valeur aujourd'hui : l'anglais est la langue par défaut) — comportement
  identique, un seul endroit à changer si le défaut bouge. Le cast disparaît :
  le helper renvoie directement le bon type. Nettoyage induit : l'import du type
  Lang, devenu inutile là où le cast était sa seule référence, retiré des 7
  pages concernées. La garde `layout.tsx` (qui rejette une langue invalide en 404) garde volontairement la garde de type brute — sémantique différente.
- **`shopSourceLabel` : fin des trois `shopLabel` divergents** — le libellé d'un
  slug de boutique (source d'équipement) était calculé en trois copies : les
  pages liste/fiche équipement repliaient sur le slug brut pour un slug hors
  `adventure_license`/`event_shop`, tandis que la fiche perso traduisait via un
  cast `t(\`equip.source.${s}\`)`— rendant la CLÉ brute pour un slug inconnu.
Un nouveau slug se serait donc affiché différemment selon la page. Source
unique`shopSourceLabel(slug, t)`dans`data/equipment.ts` (map slug→clé +
REPLI ASSUMÉ sur le slug brut), branchée aux 3 sites. Data actuelle : 2 slugs
seulement (`event_shop`, `adventure_license`, tous deux traduits), donc rendu
  visible inchangé — c'est le risque futur qui est fermé.
- **Modèle admin « intégration = seule porte »** (PRIO Sevih) — deux volets :
  - _Extraction montre TOUT_ : la spec perso ne filtre plus sur `ShowMainPage`
    (elle gardait de fait les non-« sortis » invisibles). On garde exactement
    normaux (`ownIdentity`) + core-fusion, et on EXCLUT les form-changes
    (`CharacterChangeTemplet`, ex. Luna 2000119↔2000120) comme les skins.
    Résultat vérifié : +1 seul perso (Lambda 2000118), zéro skin/forme. La
    sidebar extracteur le liste en « new » (nom/élément/classe résolus).
  - _`pnpm dev` ne promeut plus auto_ (`scripts/dev-refresh.ts` : `apply:false`).
    Le site sert la donnée INTÉGRÉE (`data/generated` committé) ; les changements
    du jeu s'affichent en diff (extracteur + dry-run console) et s'intègrent
    DÉLIBÉRÉMENT — par entité (bouton `integrateCharacter`, écrit direct dans
    generated) ou via `promote --apply` manuel. Commentaires promote.ts/README
    corrigés (l'« apply auto en dev » n'existe plus).
- **Garde-fou des cibles internes `{L}`** (bug sévérité HAUTE) — `checkTag`
  validait `{L/…|/guides/…}` en `ok: true` inconditionnel : un lien de guide
  MORT passait le contrôle CI (seul `RelatedGuides` jetait, au render). Comme
  `parse-text` ne peut pas importer `data/guides` (node:fs → casse le bundle
  client), la validation est INJECTÉE : `checkText(text, { guideHrefExists })`
  reçoit un prédicat, le cas `L` contrôle les hrefs `/guides/...` (landing racine,
  landing de catégorie, ou fiche `catégorie/slug`) et ignore externes/ancres/
  label-seul. Le prédicat est câblé dans `guides.test.ts` (les 2 scans, plats +
  versionnés) sur `getGuide` + `GUIDE_CATEGORY_SLUGS` : un lien éditorial mort
  casse désormais le test. Vérifié : les 25 `{L}` internes existants valident
  tous. +4 tests (`parse-text.test.ts`) verrouillant le garde-fou (mort→échec,
  vivant→ok, sans validateur→ok, externe/ancre→ok).
- **Équipement remis dans le circuit SEO** (fiches `/equipment/*`) — elles
  étaient absentes de `sitemap.ts` ET de `/llms.txt`, avec une meta description
  identique sur tout le catalogue et un titre `« X – Outerplane » | Outerpedia`
  incohérent (les persos font `X | Outerpedia`). `allEquipmentSlugs()` existait
  pour ça mais était mort. Câblé : (1) sitemap + `/llms.txt` listent les 272
  fiches (58 armes + 55 accessoires + 15 talismans + 21 sets + 123 EE) via un
  nouveau `allEquipmentEntries()` (slug + nom EN, dont `allEquipmentSlugs`
  dérive maintenant) ; (2) titre = `model.name` seul (aligné sur les persos) ;
  (3) description UNIQUE par item : nouvelle clé `page.equipment.meta_description`
  templée `{name}`, ajoutée aux 5 langues (cohérence inter-langues préservée,
  `Record<TranslationKey>` l'impose). **`generateStaticParams` volontairement
  PAS ajouté** : le point d'audit était un faux problème — l'équipement se rend
  à la demande puis se cache 24 h (`revalidate` + `dynamicParams`), une page ISR
  reste indexable et le sitemap déclenche le 1er crawl. C'est le modèle EXACT
  qu'ont suivi les étages de tour quand on a retiré leur `generateStaticParams`
  (commit c38561f : +1360 pages au build évitées, décision assumée en commentaire
  de la route).
- **Dédup de chips d'effet alignée sur l'affichage (`EffectChips`)** — la clé de
  dédoublonnage clivait la nature en `category === 'debuff'` alors que
  l'affichage (couleur de la pill) la clive en `category !== 'buff'` : un effet
  `neutral`/`cc` sans statut nommé était PEINT en debuff (rouge) mais KEYÉ en
  buff, si bien qu'un chip rouge et un chip vert de même nom pouvaient fusionner
  (données : `neutral` ×715, `cc` ×389). Règle unique extraite en helper exporté
  `isDebuffEffect(category, statusIsDebuff?)` (`statusIsDebuff ?? category !==
'buff'`), branché aux 3 sites : affichage `EffectChip`, clé de dédup
  `EffectChipsRow`, et pills admin `monsterChipMeta` (`skill-view.ts:58`, déjà
  correct — passé par le helper pour verrouiller). Les statuts homonymes de
  natures OPPOSÉES documentés (Starving Devil buff 1076 / debuff 1077) restent
  distincts : ils portent un `isDebuff` curé, inchangé. +2 tests
  (`EffectChips.test.ts`) gravant le contrat.
- **`LOCK_SCREEN_OVERRIDES` trié (unlock-content.ts)** — les 11 overrides
  passés au crible (override forcé vs convention `SYS_CONTENS_LOCK_<CT>` vs
  `TextID` de la ligne vs nom du donjon). Constat de fond : le nom primaire est
  bâti sur une CONVENTION qui rouille (6 valeurs conventionnelles périmées), les
  overrides sont des rustines par-dessus. Tri : 7 vraies corrections (donnée
  absente/périmée, gardées), 2 « épinglage explicite » IRREGULAR_INFILTRATE /
  IRREGULAR_CHASE (la convention donne déjà le même texte — gardées, documentées
  comme telles), 2 alignées sur le `TextID` de la ligne (PVE_REMAINS_LOOP,
  PIECE_DUNGEON — annotées). AGIT_CUSTOM_CRAFT n'était PAS une correction mais un
  choix éditorial (« Precise Craft », terme du site entier, vs « Precision
  Crafting » de la convention, les deux valides/à jour) : sorti du générateur
  (qui ne fait que de la donnée) et déplacé en `modeName` éditorial dans
  `notes.ts` où il a sa place. Rendu visible du guide INCHANGÉ (« Precise
  Craft » via l'éditorial), commentaire de tête du générateur reformulé.
- **Panneau admin : matrice repensée + moteur de diff jeu↔site généralisé**
  (PRIO Sevih, 1re moitié). Le panneau d'accueil (`/admin`) ne compare plus la
  V2 : chaque entité montre le diff **committé (`data/generated`) vs extraction
  fraîche** en trois buckets **new / diff / typo** (colonne Extract), et la
  **couverture curée X/N** (colonne Édition — le « 1 » énigmatique devient
  « 142/143 curés »). Fondations : classifieur **typo** porté à l'identique de
  la V2 (`normalizeTypo` : replie blanc + ponctuation pleine largeur/CJK +
  guillemets simples courbes + `…` ; NE replie PAS les guillemets doubles, comme
  la V2) + `diffBuckets` dans le cœur PUR `core/changes.ts` (+5 tests) ; registre
  `TARGETS` étendu de 2 → 9 (character, monster, effect, ee, weapon, amulet,
  armor, talisman, set), effets ciblés via `select` sur `glossaries.json`.effects,
  `buildEquipment` mémoïsé (1× au lieu de 6×). Vérifié zéro faux positif :
  `reviewAll` sur la data committée rend `new=0 diff=0 typo=0 removed=0` partout.
  RESTE (cf. TODO PRIO) : pages extracteur PAR ENTITÉ + suppression `v2-control`.
- **Robustesse des éditeurs admin (4 bugs de l'audit 17/07)** :
  - _13 `fetch` sans `try/catch`_ → helper partagé `src/lib/admin/post-json.ts`
    (`postJson` : parse tolérant, jette le message serveur `error`/`errors[]`,
    supporte le contrat `200 {ok:false}`). Les 13 composants enveloppés en
    `try/catch`(+`finally` sur l'état busy séparé) — plus de bouton figé sur
    erreur réseau. `MonsterActions` (la référence) consomme le helper au lieu
    de son `post` local dupliqué.
  - _Listes keyées par index_ → util `src/lib/admin/keyed.ts`
    (`rowKey`/`withKey`/`stripKey`, `_key` synthétique retiré avant
    sérialisation) sur Banners, PromoCodes (+ récompenses), CharacterCurated
    (paliers), Editorial (pros/cons + groupes), GearPresets, GearReco (dont le
    piège `structuredClone` de « Dupliquer »). Supprimer une ligne ne transfère
    plus la recherche du picker à la voisine.
  - _`eeReport` O(n²)_ → `eeModelForView(view)` exposé dans `equipment-detail`,
    modèle EE bâti depuis la vue en main (fin des re-matérialisations de
    familles + `.find` par slug ; `loadCuratedEffects` hissé) — O(n).
  - _Caches `monster-store`_ (`siteIdsCache`, `tooltipNamesCache`) passés au
    régime `{stamp}` établi : sentinelle `tablesStamp(['TextSystem'])`
    (+ `fileStamp` du curé équipement pour `siteMonsterIds`).
- **Guide « Daily Stamina Burn » porté** (economy, ordre 3) : contenu verbatim
  V2 (labels 5 langues, roadmap 5 priorités, suggestions hors endgame, pro
  tips) sur les primitives éditoriales ; les noms des boss irréguliers
  DÉRIVENT de monsters.json (la V2 les codait en dur). Entrée curée « Gems »
  ajoutée pour les tags {I-I/…} (générique, icône V2 TI_GEM_dissolve_Random_3).
- **Daily Stamina : corrections post-relecture Sevih** (414344c) — « Bounty
  Hunter » est l'ANCIEN nom du mode, devenu Hypnotic Frog Hall
  (SYS_GOLD_DUNGEON) : la note utilise le vrai {I-I/Frog Hall Ticket}
  (SYS_ASSET_TICKET_GOLD, seul consommé par DungeonTemplet ; le jumeau legacy
  TICKET_EXP, homonyme et consommé nulle part, est masqué en curé pour gagner
  la résolution par nom). L'entrée custom « Bounty Hunter Ticket » saute. Les
  boss pointent sur les fiches pursuit 512020xx (celles des guides
  irregular-extermination) : noms complets 4 langues, y compris l'Irregular
  Queen — fini le repli éditorial (les fiches 40xxxxx ont la Queen sans nom).
- **Ether income : cadence bimestrielle** — guild raid et world boss ont lieu
  UN MOIS SUR DEUX (info Sevih ; la V2 les comptait chaque mois) : champ
  `monthsPerCycle` sur les sources, colonne/totaux en moyenne mensuelle, note
  « Held once every 2 months — reward from {min} to {max} » dérivée des
  échelles.
- **Guide « Ether Income » porté** (tier economy, ordre 1 ; unlock-content
  reste 2) : les QUATRE échelles de récompenses par rang (arène 24 paliers,
  guild raid, world boss 4 ligues, singularity) DÉRIVENT désormais du jeu —
  nouveau générateur `ether-rankings.json` (RewardTemplet.Crystal = Ether,
  vérifié sur l'arène et la singularity, valeurs V2 à l'identique). Constat :
  les valeurs V2 de guild raid et world boss étaient PÉRIMÉES (le jeu les a
  doublées — top 1 raid 1500 → 3000) ; l'Ether du world boss vient du
  classement GLOBAL_WORLD (MY_WORLD paie titres/cadres/tickets), ligues de la
  saison courante par StartDate. Noms de paliers = noms officiels du jeu
  (arène, ligues) + gabarits Top/Rank/Below ; notes de rang = gabarits
  {min}/{max}/{league} remplis des données générées. Éditorial verbatim
  (sources régulières, libellés, variables) ; calculateur client re-stylé V3
  (formatage numérique à locale fixe — mismatch d'hydratation sinon).

## 2026-07-17

- **Guides « Premium & Limited » (ordre 2) et « Core Fusion » (ordre 3)
  portés** (tier pulls) : reviews/priorités/labels transplantés VERBATIM
  (script) ; tout le reste DÉRIVE du jeu — sweetspots de transcendance
  (`getTranscendSweetspots`, paliers officiels — la V2 rechargeait ses textes
  côté client), coûts de fusion (`CharacterFusionLevelTemplet`, plus de
  `[300,150…]` en dur), paires base↔CF (plus de `replace('2700','2000')`),
  renommages de skills dérivés de skills.json (24/24 identiques au
  `cf-skill-names.json` V2 — item TODO soldé par vérification), EE base↔CF
  (données équipement V3). Primitives partagées
  `components/guides/editorial/reviews/` (HeroReviewCard, PriorityTiers, blocs
  premium/fusion). beginner-faq : carte RelatedGuides premium-limited
  réactivée (les 3 liens 404 de la section Bugs haute sont résorbés ; le
  garde-fou `{L}` reste en TODO). Icônes pve/pvp (éditorial) + icônes des 2
  guides collectées.
- **Archive des bannières purgées** — `data/curated/recruit-banners.json`
  (seed : release 2023 de Regina, purgée des tables du jeu) + garde anti-purge
  dans le générateur recruit : toute bannière du recruit.json promu qui
  disparaît des tables sans être archivée (ou assumée via `dropped`) casse la
  génération. Constat : le banner.json V2 était saisi À LA MAIN (éditeur admin
  dev-only) — dates à ±1 j et bannière d'Ais fabriquée, non reprises.
- **Écarts V2 résorbés** (audit 4 guides du 17/07, 4 agents, textes 5 langues
  comparés octet à octet) : intro de free-heroes restaurée (seule vraie perte
  de contenu rendue), description PIECE_DUNGEON d'unlock-content revenue au
  verbatim `{I-I/Hero Piece}` (l'item curé existe désormais). Reste ouvert :
  pattern « titres en page V2 » (H1 meta seul en V3) et mileage du Custom Rate
  Up (Elemental vs Custom) — décisions Sevih.
- **Layout, passe de fidélité 2 (retours Sevih)** — icône tierlist basculée
  sur `CM_Mission_Icon_Daily` (manifest + collecte, ui 190 ✓) ;
  LanguageSwitcher refait à l'identique V2 : dropdown drapeau + abréviation,
  liste avec badges officiel/communautaire et note de repli, variante
  `mobile-chips` dans le drawer (libellés passés en props — pas de contexte
  i18n client), navigation V3 conservée (préfixe de path + ?query/#hash) ;
  drapeaux SVG branchés partout via `img.flag` (ils étaient DÉJÀ collectés
  par le bloc éditorial du manifest) ; icônes de marque tranchées :
  react-icons comme la V2 (social rapide Discord/GitHub/RSS + bandeau
  officiel Reddit/YouTube/X…) ; chips de langues du footer alignées
  (drapeau + abréviation + pastille communautaire). Deux items « Pages
  manquantes » soldés (drapeaux, icônes de marque). GV : lue depuis
  `data/generated/game-version.json` (resVersion du jeu extrait), plus de
  variable d'env comme en V2.
- **Layout terminé : header/nav/footer, FIDÈLES à la V2 sur tokens V3**
  (PRIO Sevih ; « pas le même du tout » corrigé après premier jet minimal) —
  contrat `src/lib/nav.ts` (5 items V2 + EXTRA_PAGES pour la future
  recherche, sprites de jeu déclarés). Header = structure V2 complète :
  logo + badges v/GV, nav à icônes (libellé court < xl, long ≥ xl),
  DROPDOWN Guides (catégories de `GUIDE_CATEGORIES`), collapse au scroll
  (hystérésis V2), drawer mobile (icônes, chevrons, sous-menu guides,
  langues) ; l'emplacement recherche est réservé. Footer = structure V2 :
  marque + tagline + chips sociaux + CHIPS DE LANGUES, 4 colonnes
  repliables en mobile (`<details>`, zéro JS), bandeau officiel Outerplane,
  disclaimer, barre légale avec point de version. `game-version.ts` SORT du
  code mort (consommé header + footer). Les 5 sprites de nav ajoutés au
  manifest et COLLECTÉS (ui 185→190 ✓ — push R2 au prochain commit).
  Cibles 404 assumées — inventaire complet en section TODO
  « Pages manquantes ».
- **Texte en dur des 5 langues éradiqué** (2 commits — le site est servi en
  EN par défaut, le FR en dur fuyait chez tout le monde) : home
  (`characters.filters.count`), meta description fiche perso
  (`page.character.meta_description`, clé V2 pré-seedée), Footer
  (`footer.tagline`), ShareButtons (strings en props), selects
  d'EquipmentBrowser (options slug→libellé via `sys.*`, pattern
  CharactersBrowser), breadcrumb JSON-LD, srSuffix ; puis les aria/titres
  épars : FullArtCarousel, étoiles de CharacterCard (gabarit `{rarity}`),
  ImageLightbox, « by {author} » des vidéos (`video.by`, 6 sites câblés),
  tooltip CP (`page.character.cp_title`), « min → max »/« Step »
  d'EquipmentDetail. +13 clés ×5 langues. NB : ImageLightbox garde des
  défauts EN pour les appels du guide roadmap-2026 (à câbler quand ce guide
  repassera en chantier).
- **Détection émulateur d'`init.ps1` fiabilisée** : sous PS 5.1, `2>$null` sur
  adb + EAP global `Stop` transformait le stderr bénin (« daemon not running;
  starting now ») en exception → émulateur déclaré absent à tort au premier
  lancement, pipeline data sauté. EAP local `Continue` (portée fonction) ;
  bug et remède reproduits sur PS 5.1 réel.
- **« 18 générateurs » soldé** : le décompte de référence (20, characters/
  monsters exclus — ils vivent dans l'extracteur) est gravé à UN seul endroit
  (datagen/README couche 3) ; ROADMAP et CHANGELOG y renvoient au lieu de
  citer un nombre qui périme (l'énumération du CHANGELOG citait encore
  characters/monsters).
- **Spec monstre : `spawns`/`summonedBy`/`linkedTo` COPIÉS à l'embarquement**
  — ils aliasaient les tableaux du cache mémoïsé partagé de `buildEncounters` :
  une mutation d'entité aurait corrompu le cache pour tous les consommateurs.
  MonsterSpawn est plat → copie à un niveau, sortie identique par construction.
- **`extract-face-layout.py` : le re-scan complet FUSIONNE** (`cache.update`)
  au lieu d'écraser — un prefab retiré du bundle garde son entrée committée
  (rétention, comme le reste du pipeline ; ce mode est joué par `refresh.ts`).
  Au passage : le nom de fichier faux du docstring d'usage corrigé (item
  Doc ↔ code de l'audit).
- **`content-schedule` : garde sur `_unknown_0`** — le main boss guild raid
  vit dans une colonne sans en-tête que seul le parseur nomme (absente du
  schéma déclaré, 17/36 lignes la portent) : si plus aucune ligne ne la porte
  (colonne renommée par le jeu), warn explicite au build au lieu de saisons
  sans main boss en silence. Iso-sortie prouvée IDENTIQUE, garde muette
  aujourd'hui.
- **`convert.ts` purge les tables fantômes** : les `.json` de
  `.gamedata/parsed/` sans `.bytes` source (table retirée du jeu) sont
  supprimés en début de run — ils restaient servis à vie par `loadTable`.
  Testé e2e : fantôme planté → purgé, 257/257 tables converties.
- **`BuildRequirements` : ordre SPD déterministe** — l'ancien comparateur
  renvoyait 0 face à une entrée sans SPD (non transitif → ordre indéfini).
  Désormais : les entrées à SPD connue se trient entre elles (décroissant),
  celles sans SPD gardent leur position d'écriture — l'auteur fait foi, et la
  promesse « ordre DOM = ordre de jeu » redevient vraie.
- **`LanguageSwitcher` conserve query + hash** : l'état des guides vit dans
  l'URL (`?…` + `#version=`/`#team=`) et le switch de langue le perdait.
  Search/hash lus AU CLIC (le hash n'existe pas côté serveur et ses
  `replaceState` n'émettent aucun événement) → clic simple intercepté vers
  `router.push(path + search + hash)`, clic modifié/molette garde le href nu.
- **`commit.ts` : bump de version différé** — le choix reste à l'étape 2 mais
  l'écriture de package.json attend l'étape commit (avant le `git status`,
  pour qu'un commit « bump seul » reste possible) : tout abandon (bump,
  message vide, Ctrl-C) ne modifie plus rien, fini les versions sautées.
  Prouvé : bump choisi puis abandon → md5 de package.json inchangé (l'ancien
  code l'avait déjà écrit à ce stade).
- **Erreurs avalées sur les curés éradiquées** : `readCuratedJson` dans
  `datagen/lib/json.ts` (pendant lecture de `writeJson`) — fichier absent =
  `undefined` (pas de curation, cas normal), JSON cassé = **throw nommant le
  fichier** (un curé cassé décurait silencieusement la donnée servie,
  `pnpm dev` auto-appliquant le promote). Les 4 avaleurs convertis
  (curated/equipment, curated/effects, overrides familles de lib/effects,
  item-catalog) + les 2 parsers nus contextualisés (mode-titles d'encounters,
  ancre de singularity — leurs warns sémantiques inchangés). 5 tests
  synthétiques CI-safe (`json.test.ts`, tmpdir) ; iso-sortie prouvée sur
  items.json (IDENTIQUE).
- **`IL2CPP_SO` supprimée de `dump.ts`** (décision Sevih) : la paire
  .so/metadata se ré-extrait de l'émulateur à chaque dump — un `.so` imposé
  n'avait aucun cas d'usage (variable jamais documentée ni posée), et
  metadata absente → l'extraction écrasait silencieusement le fichier fourni
  par celui de l'émulateur.
- **Alerte « 93 assets guides refaits depuis le pool V2 » levée** : vérifié —
  `../outerpedia` à jour avec origin, 0 clé nouvelle, 92/93 fichiers identiques
  octet à octet à l'état R2 (`pushed.json`) ; l'unique diff
  (`CT_Detail_Slot_Lock_Open.webp`) est la face dérivée localement des cartes
  promotion, ré-encodée à l'identique visuel — poussée légitime au prochain
  commit.
- **Collecte d'assets soldée à 0 manquant** (après V2_DIR) : les 2 icônes
  `IG_Buff_Action_Gauge_Up/Down` (overrides curés dont le sprite source a
  disparu des bundles du jeu) copiées du staging vers `data/editorial/ui/effect/`
  (pool V3 versionné — même pattern que Reversal_Buff) ; le générateur
  costumes filtre désormais les entrées sans nom résolu (contenu pas encore
  sorti : COSTUME_97/102 des persos 2000118/2000120 retirés d'items.json, ils
  reviendront à la sortie du contenu).
- **Config fixe/portable `V2_DIR`** : le chemin `../outerpedia-v2` en dur
  cassait le pool V2 et le regen coupons/banner sur les machines où le repo
  s'appelle `../outerpedia`. Nouveau `datagen/lib/env.ts` (parse `.env.local`
  mémoïsé — repris par r2.ts — + `v2Dir()`/`v2ImagesDir()`), consommé par
  `promo-banner-store` (Next lit V2_DIR nativement), `stage.ts` et
  `manifest.ts` (la double définition du pool est morte). Documenté dans
  `.env.example`, `V2_DIR=../outerpedia` posé dans le `.env.local` local.
  Résultat mesuré : `assets:collect` passe de 55 à 4 manquants (editorial
  14/14, ui 185/185, guides ✓).
- **Bug `_NAME`→`_DESC` (items.ts + enhance.ts)** : quand `NameID` ne suivait
  pas la convention, le `replace` ne changeait rien et la « description » émise
  était le nom — 97 entrées de `items.json` contaminées. Garde
  `descKey !== NameID` posée aux deux endroits, regen + promote appliqués
  (~97 entrées corrigées, 0 restante), cohérence et tests verts.
- **Code mort supprimé** (aucun consommateur, vérifié par grep + typecheck
  complet) : kit `src/components/ui/` jamais importé (`Badge.tsx`, `Card.tsx`,
  `Pill.tsx`, `Surface.tsx`), alias historiques `getItems`/`getItem`
  (items.ts), alias `CostumeItem` des contrats (CostumeEntry reste interne à
  datagen).
- **Audit complet du site** (7 passes par zone : app, components ×2, lib/i18n,
  datagen ×2, scripts/config — findings versés dans TODO.md, sévérités hautes
  contre-vérifiées). État au moment de l'audit : typecheck/lint OK,
  319/319 tests verts, commit `7d30203`, v0.1.21.
- **`assets-push.mjs --purge-only`** : l'état `pushed.json` était écrit AVANT le
  `exit(0)` du mode purge — des assets jamais uploadés étaient marqués
  « poussés » et sautés à jamais. Sortie déplacée avant l'écriture d'état.
- **`get-news.ts`** : le `catch { break }` de pagination avalait TOUTE erreur
  (réseau, 500, DNS) → exit 0 avec « 0 new ». Le statut HTTP est porté par
  l'erreur ; seul le 400 (fin de pagination WP) « break », le reste remonte.
- **CI** : `node-version-file: .nvmrc` (au lieu de `24` en dur) +
  `pnpm format:check` ajouté au job check (le formatage n'était vérifié nulle
  part côté serveur, lefthook étant sautable).
- **`package.json`** : `prepare` — `|| true` (inexistant sous cmd.exe) →
  `|| echo skip`.
- **`src/__tests__/smoke.test.ts` supprimé** (placeholder 1+1 ; la stack est
  prouvée par les 27 fichiers de tests co-localisés). Dossier `__tests__` vide
  supprimé avec.
- **`.env.example`** : bloc `R2_*` (4 variables requises par chaque
  `pnpm commit`) + `V2_DIR` ajoutés commentés (`V2_DIR` documentée mais pas
  encore lue par le code — cf. chantier prio du TODO).
- **`area_name`** — constat : DÉJÀ COUVERT, `AreaTemplet` est consommé par
  `encounters.ts` (champ `area` localisé + saison/épisode story) et
  `unlock-content.ts` — pas de fichier dédié à porter.

## 2026-07-16 (avant la réécriture du TODO — détail dans git)

- **Bugs** (commits `7d858d8`…, un par fix) : collecte tours VH (waves +
  encounters), `pnpm test` en CI, MonadRouteClient sur `useUrlSlice`, caches
  d'effects salés du mtime des curés (`fileStamp` TTLisé), butin monad
  instrumenté + label via `resolveOrNull`, nom stable `monad/theme.json`,
  warning `isoUtc`, heuristique goods contournée pour les clés adossées à une
  ligne item. Enums d'éveil VÉRIFIÉS contre les `NodeNameID` : aucun
  off-by-one (méthode gravée en commentaire dans progression.ts). Sortie monad
  prouvée identique octet à octet avant/après.
- **Tests** (suite à 319) : restrictions/compositions de tours
  (`towers.test.ts`), geas guild-raid (`geas.test.ts`), hash-params
  (`url-hash.test.ts`), vote-croisé c9ce852 (`resolveKeyWinners` extrait PUR —
  glossaire prouvé identique — + 5 tests synthétiques).
- **Dette code** (un commit par chantier) : code mort (accès monad/towers,
  no-op stamp-guides), loader partagé du curé effects.json, « or »/« Gold » de
  Monad Gate localisés, `#4cc2ff` tokenisé (`--buff-tint`/`--debuff-tint`),
  TowerGuide + TeamSlots sur `resolveGuideCharacter`, `pickSkills`
  (5 boucles → 1), `GuideCardArt`, `RosterGroupCard` (habillage very hard via
  `decorate`), équipe de StagedBossGuide sur SegmentedTabs `#team=` — règle
  hash/`?param` gravée dans les docstrings. Règle eslint RAW_COLOR étendue aux
  `.ts` + exemption resserrée à `characters/**`.
- **Config/infra** : `scripts/*.ts` sous typecheck (3ᵉ projet tsc),
  `data/extracted/` exclu du contexte Docker, `git gc` (5017 objets loose),
  branche `backup/site-rebuild` supprimée. Hygiène commits : `pnpm commit`
  refuse tout message non conventionnel.
