# Procédure — bascule VPS → `outerpedia.com`

Le jour où le vrai domaine est prêt. On passe de :

|                     | Avant (staging)            | Après (prod)                                         |
| ------------------- | -------------------------- | ---------------------------------------------------- |
| Hôte servi          | `vps-7b703196.vps.ovh.net` | `outerpedia.com` (+ `jp.` `kr.` `zh.` `fr.`)         |
| Routage des langues | `path` (`/en`, `/jp`…)     | `subdomain` (`outerpedia.com`, `jp.outerpedia.com`…) |
| Indexation          | `noindex`                  | indexable                                            |

Deux couches à toucher, **une par repo** : l'app (`outerpedia`) et l'infra
(`sevih-tool`). La source unique côté app est [src/lib/site.ts](../../src/lib/site.ts).

> ⚠️ **Build-time.** `NEXT_PUBLIC_*` est gravé dans le bundle **à la compilation**
> (la génération statique fige les canonicals). La bascule côté app est donc un
> **changement de code → push → rebuild CI**, pas un toggle runtime.

Ce qui **ne bouge pas** : `NEXT_PUBLIC_IMG_BASE=https://img.outerpedia.com` (le CDN
R2 est déjà sur le domaine final) et le cron de purge (réseau Docker interne).

---

## Ordre (important — ne pas inverser)

DNS et Caddy **avant** l'app : si l'app émet des URLs `outerpedia.com` alors que
rien ne résout encore, tout casse. Caddy a besoin que le DNS pointe déjà sur le
VPS pour obtenir les certificats Let's Encrypt (challenge HTTP-01).

### 1. DNS (Cloudflare)

Créer les enregistrements vers le VPS (`213.32.67.18` / `2001:41d0:367:f31::1`) :

| Nom                 | Type                       | Cible  |
| ------------------- | -------------------------- | ------ |
| `outerpedia.com`    | A / AAAA                   | IP VPS |
| `jp` `kr` `zh` `fr` | A / AAAA (ou CNAME → apex) | IP VPS |

- **Commencer en DNS-only (nuage gris)** : Caddy gère lui-même les certs, comme le
  staging aujourd'hui. Le nuage orange (proxy Cloudflare) est une optimisation
  ultérieure — il change la chaîne TLS (cert edge CF + cert origine) et se règle à
  part.
- Attendre la propagation (`nslookup outerpedia.com`, `nslookup jp.outerpedia.com`).

### 2. Infra — Caddyfile (`sevih-tool`)

Dans [stack/Caddyfile](../../../sevih-tool/stack/Caddyfile), remplacer le bloc
`vps-7b703196.vps.ovh.net { … }`. Lister les 5 hôtes explicitement (chacun obtient
son cert auto en HTTP-01 — pas besoin du plugin DNS ni d'un build Caddy custom) :

```caddy
outerpedia.com, jp.outerpedia.com, kr.outerpedia.com, zh.outerpedia.com, fr.outerpedia.com {
	import internal_only
	reverse_proxy outerpedia:3000
}

# Transition : les liens partagés vers l'ancien hôte suivent vers le domaine final.
vps-7b703196.vps.ovh.net {
	redir https://outerpedia.com{uri} permanent
}
```

Puis, **sur le VPS** :

```bash
cd ~/sevih-tool/stack
git pull
docker compose up -d --force-recreate caddy   # bind-mount de fichier = inode : `up -d` seul ne propage RIEN
docker compose logs -f caddy                    # vérifier l'émission des 5 certs
```

> ⚠️ Le Caddyfile est bind-monté : `git pull` **remplace** l'inode, le conteneur
> voit encore l'ancienne version et un `reload` recharge l'ancienne config **en
> annonçant un succès**. Toujours `--force-recreate caddy`.

### 3. App — profil de déploiement (`outerpedia`)

Dans le [Dockerfile](../../Dockerfile), passer les 3 défauts au profil prod :

```dockerfile
ARG NEXT_PUBLIC_SITE_ORIGIN=https://outerpedia.com
ARG NEXT_PUBLIC_LANG_ROUTING=subdomain
ARG NEXT_PUBLIC_SITE_INDEXABLE=true
```

Commit + push sur `main` → la CI rebuilde l'image et redéploie sur le VPS. À la fin,
canonicals / hreflang / `@id` JSON-LD pointent sur `outerpedia.com` + sous-domaines,
et le `noindex` global disparaît.

---

## Vérification

```bash
# Canonical + hreflang sur le domaine final (plus aucune trace du host VPS)
curl -s https://outerpedia.com/ | grep -Ei 'canonical|hreflang|robots'
# Un sous-domaine de langue résout et sert la bonne langue
curl -sI https://jp.outerpedia.com/ | head -5
# robots + sitemap sur le bon hôte, plus de noindex
curl -s https://outerpedia.com/robots.txt
curl -s https://outerpedia.com/sitemap.xml | head -20
```

- [ ] `<link rel="canonical">` = `https://outerpedia.com/…` (pas le host VPS).
- [ ] Plus de balise `<meta name="robots" content="noindex">`.
- [ ] hreflang listent apex + `jp./kr./zh./fr.` et **résolvent tous**.
- [ ] JSON-LD : `@id` en `https://outerpedia.com/#…`.
- [ ] Rich Results Test sur une fiche perso + un guide + une FAQ.
- [ ] `redir` de l'ancien host VPS → 301 vers `outerpedia.com`.
- [ ] Google Search Console : ajouter la propriété `outerpedia.com`, soumettre le sitemap.
- [ ] Relancer un crawl (Unlighthouse / Sitebulb) → zéro alerte canonical cross-domaine.

## Rollback

Revenir aux défauts staging du Dockerfile (`SITE_ORIGIN=https://vps-…`,
`LANG_ROUTING=path`, `SITE_INDEXABLE=false`), push → rebuild. Restaurer l'ancien
bloc Caddy (`vps-… { reverse_proxy outerpedia:3000 }`), `--force-recreate caddy`.
Le DNS peut rester en place sans dommage.
