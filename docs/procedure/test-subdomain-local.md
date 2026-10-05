# Procédure — banc d'essai LOCAL du routage par sous-domaines

Rejouer en local le comportement prod (`outerpedia.com` + `jp.` `kr.` `zh.`
`fr.` `es.`) sans toucher au DNS : hosts + Caddy local (HTTPS de confiance) + profil
`subdomain` baké. Validé de bout en bout le **21/07/2026** (proxy, canonicals,
hreflang, sitemap à alternates, 308 `/en/*`, `www` = apex, sélecteur de
langue) — seul finding : `<html lang>` figé à `en`, bug PRÉEXISTANT tracé au
TODO, pas lié aux sous-domaines.

## Pré-requis (déjà en place sur le poste)

- `C:\Windows\System32\drivers\etc\hosts` :

  ```
  127.0.0.1  outerpedia.local
  127.0.0.1  jp.outerpedia.local
  127.0.0.1  kr.outerpedia.local
  127.0.0.1  zh.outerpedia.local
  127.0.0.1  fr.outerpedia.local
  127.0.0.1  es.outerpedia.local
  127.0.0.1  www.outerpedia.local
  127.0.0.1  quick.outerpedia.local
  ```

  (`es` ajouté le 23/09/2026 avec la langue, `quick` le 05/10/2026 — le fichier
  hosts se modifie en administrateur, ce n'est pas le repo qui le pose. Sous
  Fedora : `/etc/hosts`, mêmes lignes.)

- Caddy installé ; sa CA locale est déjà dans le magasin Windows (`caddy trust`
  au besoin) → cadenas vert.

## Le dev EST le banc (défaut depuis le 21/07 — décision Sevih : plus de mode path en local)

`pnpm dev` lance Next **et** le Caddy local ([Caddyfile.dev](../../Caddyfile.dev)
à la racine, via `concurrently` et `scripts/dev-caddy.mjs`, qui ne démarre pas
un second Caddy si celui du poste tourne déjà) : le dev se navigue sur
`https://outerpedia.local` avec le vrai comportement sous-domaines, hot reload
compris. Les deux variables qui bakent les LIENS en sous-domaines vivent dans
`.env.local` (non committé — ni la CI ni l'image Docker ne les voient, le
profil prod vient des ARG du Dockerfile) :

```
NEXT_PUBLIC_SITE_ORIGIN=https://outerpedia.local
NEXT_PUBLIC_LANG_ROUTING=subdomain
```

`next.config.ts` porte le pendant dev : `allowedDevOrigins`
(`*.outerpedia.local`), sinon le dev server refuse les `/_next/*` proxifiés.

## Deux PC, un serveur (depuis le 05/10/2026)

Le fixe (Windows) et le portable (Fedora) voient tous deux
`https://outerpedia.local` et `https://quick.outerpedia.local`, servis par
**celui qui a lancé** `pnpm dev` / `pnpm quick`. Rien à faire sur l'autre.

Comment : un Caddy tourne en permanence sur CHAQUE poste (démarré à
l'ouverture de session) ; il vise d'abord le serveur local, puis celui de
l'autre PC (`lb_policy first` dans le Caddyfile). Chaque poste garde ses hosts
en `127.0.0.1` et sa propre CA : ni DNS ni certificat à partager, plus de
tunnel SSH. Si les deux lancent en même temps, chacun voit le sien.

Mise en place, une fois par poste :

1. `.env.local` — la même ligne sur les deux, avec toutes les adresses des
   deux postes (les réserver dans la box, elles viennent du DHCP) :

   ```
   DEV_PEERS=192.168.1.54,192.168.1.204,192.168.1.65
   ```

2. hosts — la ligne `quick.outerpedia.local` ci-dessus.

3. `pnpm dev:caddy:install` — unité systemd utilisateur
   (`outerpedia-caddy.service`, journal par `journalctl --user -u
outerpedia-caddy`) sous Fedora ; script `outerpedia-caddy.vbs` du dossier
   Démarrage (`shell:startup`) sous Windows. Le retirer : `systemctl --user
disable --now outerpedia-caddy`, ou supprimer le `.vbs`.

4. Pare-feu du poste, pour que l'autre atteigne Next (3000) et quick (4747).
   Fedora : rien, la zone ouvre déjà les ports ≥ 1025. Windows, en
   administrateur :

   ```powershell
   New-NetFirewallRule -DisplayName 'outerpedia dev (portable)' -Direction Inbound `
     -Protocol TCP -LocalPort 3000,4747 -RemoteAddress 192.168.1.204,192.168.1.65 -Action Allow
   ```

   (Une règle de BLOCAGE « Node.js JavaScript Runtime », posée si l'invite du
   pare-feu a été refusée un jour, l'emporte sur celle-ci : la supprimer.)

quick, lui, n'écoute sur le réseau que si `DEV_PEERS` existe, ne répond qu'à
ces adresses et à la boucle locale, et refuse toute écriture dont l'en-tête
`Origin` n'est pas sa propre page (`scripts/quick/lan.ts`). Il committe et
pousse **depuis le poste qui l'a lancé** : l'autre doit `git pull` ensuite.

Sous Fedora, après un `dnf update caddy`, repasser le `setcap` (sinon le
service boucle sur le port 443, visible dans son journal).

## Mode A — build de test (fidèle prod : pages figées, profil baké)

⚠️ Couper le dev d'abord (`pnpm build` écrit dans `.next`), et purger `.next`
si le dev a tourné (ses types générés — `/admin` — cassent le build). Les
variables du profil viennent de `.env.local` (lu par `next build`).

```powershell
Remove-Item -Recurse -Force .next
pnpm build
$env:PORT = '3100'; pnpm start
# Caddy vers le build plutôt que le dev (recharge celui du poste s'il tourne) :
$env:OUTERPEDIA_PORT = '3100'; pnpm dev:caddy
```

Revenir au dev : relancer `pnpm dev:caddy` (ou `pnpm dev`) sans la variable.

## Batterie de vérification (curl)

```bash
curl -sk https://jp.outerpedia.local/characters/ame            # title JP, canonical jp.…
curl -skI https://outerpedia.local/en/characters/ame           # 308 → URL sans préfixe
curl -sk https://www.outerpedia.local/characters/ame           # servie comme l'apex
curl -sk https://outerpedia.local/sitemap.xml                  # <loc> apex + alternates xhtml:link par langue
curl -sk https://jp.outerpedia.local/en/characters/ame         # doublon toléré, canonical → apex
```

> La bascule vers `outerpedia.com` a été exécutée le 22/07/2026
> ([bascule-domaine.md](./bascule-domaine.md)). Ce banc reste la façon de tester
> le routage par sous-domaines **en local**, avant de pousser un changement qui
> y touche.
