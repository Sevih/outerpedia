/**
 * URL des assets AUDIO (OST). Même logique que `img` (lib/images) : en dev
 * `/audio/*` est servi depuis `.assets-staging/audio` (route dev), en prod
 * `NEXT_PUBLIC_IMG_BASE` pointe le bucket R2 (mêmes assets, préfixe `/audio`).
 */
const BASE = process.env.NEXT_PUBLIC_IMG_BASE ?? '';

export const audio = {
  /** mp3 d'une piste d'OST (clé `file` de `bgm_mapping.json`). */
  bgm: (file: string) => `${BASE}/audio/bgm/${encodeURIComponent(file)}.mp3`,
};
