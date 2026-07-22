# Procédure — banc d'essai LOCAL du routage par sous-domaines

Rejouer en local le comportement prod (`outerpedia.com` + `jp.` `kr.` `zh.`
`fr.`) sans toucher au DNS : hosts + Caddy local (HTTPS de confiance) + profil
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
  127.0.0.1  www.outerpedia.local
  ```

- Caddy installé ; sa CA locale est déjà dans le magasin Windows (`caddy trust`
  au besoin) → cadenas vert.

## Le dev EST le banc (défaut depuis le 21/07 — décision Sevih : plus de mode path en local)

`pnpm dev` lance Next **et** le Caddy local ([Caddyfile.dev](../../Caddyfile.dev)
à la racine, via `concurrently`) : le dev se navigue sur
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

## Mode A — build de test (fidèle prod : pages figées, profil baké)

⚠️ Couper le dev d'abord (`pnpm build` écrit dans `.next`), et purger `.next`
si le dev a tourné (ses types générés — `/admin` — cassent le build). Les
variables du profil viennent de `.env.local` (lu par `next build`).

```powershell
Remove-Item -Recurse -Force .next
pnpm build
$env:PORT = '3100'; pnpm start
# Caddy vers le build plutôt que le dev :
$env:OUTERPEDIA_PORT = '3100'; caddy run --config Caddyfile.dev
```

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
