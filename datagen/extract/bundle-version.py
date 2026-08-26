# Imprime `PlayerSettings.bundleVersion` d'un `globalgamemanagers` — la version
# APPLICATIVE du client (« 1.4.15 », = `versionName` Android), que `dump-steam.ts`
# grave dans l'empreinte du dump. Elle ne vit dans aucun fichier texte du client
# Windows (l'exe porte la version d'Unity, pas celle du jeu) : seul le typetree
# des PlayerSettings la donne — même lecture qu'`extract-portrait-fx.py` pour
# `m_ActiveColorSpace`.
#
#   python datagen/extract/bundle-version.py <chemin/globalgamemanagers>
#
# Sortie : la version seule sur stdout ; code 1 si le fichier n'a pas de
# PlayerSettings (l'appelant grave alors « inconnue », jamais une valeur devinée).
import sys

import UnityPy

env = UnityPy.load(sys.argv[1])
for o in env.objects:
    if o.type.name == 'PlayerSettings':
        print(o.read_typetree().get('bundleVersion', ''))
        sys.exit(0)
sys.exit(1)
