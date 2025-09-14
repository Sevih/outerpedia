// IDs stables → NE PAS changer pour les entrées existantes
export const EL = { Fire:1, Water:2, Earth:3, Light:4, Dark:5 } as const
export const CL = { Striker:1, Defender:2, Ranger:3, Healer:4, Mage:5 } as const
export const CH = { Start:1, Join:2, Finish:3 } as const
// ⚠️ gift en lowercase car tes données gift sont en minuscules
export const GF = { 'science':1, 'luxury':2, 'magic tool':3, 'craftwork':4, 'natural object':5 } as const

// inverses pour décoder
export const EL_INV = Object.fromEntries(Object.entries(EL).map(([k,v]) => [v,k])) as Record<number, keyof typeof EL>
export const CL_INV = Object.fromEntries(Object.entries(CL).map(([k,v]) => [v,k])) as Record<number, keyof typeof CL>
export const CH_INV = Object.fromEntries(Object.entries(CH).map(([k,v]) => [v,k])) as Record<number, keyof typeof CH>
export const GF_INV = Object.fromEntries(Object.entries(GF).map(([k,v]) => [v,k])) as Record<number, keyof typeof GF>
