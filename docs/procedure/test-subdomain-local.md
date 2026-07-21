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

## Caddyfile local

```caddy
outerpedia.local, jp.outerpedia.local, kr.outerpedia.local, zh.outerpedia.local, fr.outerpedia.local, www.outerpedia.local {
	tls internal
	# :3100 = build de test (`next start`) ; :3000 = serveur dev (hot reload).
	reverse_proxy localhost:3100
}
```

`caddy run --config <ce fichier>` (premier lancement : invite UAC pour la CA).

## Mode A — build de test (fidèle prod, ce qui a été validé)

⚠️ Couper le serveur dev d'abord (`pnpm build` écrit dans `.next`), et purger
`.next` si le dev a tourné (ses types générés — `/admin` — cassent le build).

```powershell
Remove-Item -Recurse -Force .next
$env:NEXT_PUBLIC_SITE_ORIGIN = 'https://outerpedia.local'
$env:NEXT_PUBLIC_LANG_ROUTING = 'subdomain'
$env:NEXT_PUBLIC_IMG_BASE = 'https://img.outerpedia.com'
pnpm build
$env:PORT = '3100'; pnpm start
```

## Mode B — serveur dev (hot reload, liens subdomain)

Le PROXY (host → langue) est runtime : il marche en dev tel quel. Pour que les
LIENS GÉNÉRÉS (sélecteur de langue, canonicals) soient en sous-domaines aussi,
décommenter dans `.env.local` :

```
# NEXT_PUBLIC_SITE_ORIGIN=https://outerpedia.local
# NEXT_PUBLIC_LANG_ROUTING=subdomain
```

puis relancer le dev, et pointer le Caddyfile sur `localhost:3000`.
**Recommenter après** : avec ces variables actives, les liens inter-langues du
dev pointent `jp.outerpedia.local` — morts si Caddy ne tourne pas.

## Batterie de vérification (curl)

```bash
curl -sk https://jp.outerpedia.local/characters/ame            # title JP, canonical jp.…
curl -skI https://outerpedia.local/en/characters/ame           # 308 → URL sans préfixe
curl -sk https://www.outerpedia.local/characters/ame           # servie comme l'apex
curl -sk https://outerpedia.local/sitemap.xml                  # <loc> apex + alternates xhtml:link par langue
curl -sk https://jp.outerpedia.local/en/characters/ame         # doublon toléré, canonical → apex
```

## Jour J (rappel)

La mécanique app étant prouvée, la bascule réelle ne teste plus que l'INFRA :
DNS, certs Caddy des 5 hôtes, build profil prod (`outerpedia.com`,
`INDEXABLE=true`). Voir [bascule-domaine.md](./bascule-domaine.md) — et l'option
« répétition générale » : DNS des sous-domaines SEULS d'abord (invisibles au
public, l'apex reste V2), la bascule finale se réduisant à l'apex.
