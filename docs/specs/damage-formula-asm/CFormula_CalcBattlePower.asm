; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CFormula_CalcBattlePower @ 0x2cb1d08..0x2cb21ac (taille 1188 octets) =====
  0x2cb1d08: sub      sp, sp, #0xd0
  0x2cb1d0c: str      d14, [sp, #0x30]
  0x2cb1d10: stp      d13, d12, [sp, #0x40]
  0x2cb1d14: stp      d11, d10, [sp, #0x50]
  0x2cb1d18: stp      d9, d8, [sp, #0x60]
  0x2cb1d1c: stp      x29, x30, [sp, #0x70]
  0x2cb1d20: stp      x28, x27, [sp, #0x80]
  0x2cb1d24: stp      x26, x25, [sp, #0x90]
  0x2cb1d28: stp      x24, x23, [sp, #0xa0]
  0x2cb1d2c: stp      x22, x21, [sp, #0xb0]
  0x2cb1d30: stp      x20, x19, [sp, #0xc0]
  0x2cb1d34: cbz      x0, #0x2cb21a8
  0x2cb1d38: mov      x29, x1
  0x2cb1d3c: mov      x1, xzr
  0x2cb1d40: mov      x23, x0
  0x2cb1d44: bl       #0x2901f0c ; -> CCharacterData$$get_Atk
  0x2cb1d48: mov      w28, w0
  0x2cb1d4c: mov      x0, x23
  0x2cb1d50: mov      x1, xzr
  0x2cb1d54: bl       #0x2901fe8 ; -> CCharacterData$$get_Def
  0x2cb1d58: str      w0, [sp, #0x38]
  0x2cb1d5c: mov      x0, x23
  0x2cb1d60: mov      x1, xzr
  0x2cb1d64: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2cb1d68: str      w0, [sp, #0x1c]
  0x2cb1d6c: mov      x0, x23
  0x2cb1d70: mov      x1, xzr
  0x2cb1d74: bl       #0x2901e30 ; -> CCharacterData$$get_Speed
  0x2cb1d78: mov      w27, w0
  0x2cb1d7c: mov      x0, x23
  0x2cb1d80: mov      x1, xzr
  0x2cb1d84: bl       #0x29021a0 ; -> CCharacterData$$get_CriticalRate
  0x2cb1d88: str      w0, [sp, #0x20]
  0x2cb1d8c: mov      x0, x23
  0x2cb1d90: mov      x1, xzr
  0x2cb1d94: bl       #0x290227c ; -> CCharacterData$$get_CriticalDMGRate
  0x2cb1d98: mov      w20, w0
  0x2cb1d9c: mov      x0, x23
  0x2cb1da0: mov      x1, xzr
  0x2cb1da4: bl       #0x2902434 ; -> CCharacterData$$get_PiercePowerRate
  0x2cb1da8: str      w0, [sp, #0x3c]
  0x2cb1dac: mov      x0, x23
  0x2cb1db0: mov      x1, xzr
  0x2cb1db4: bl       #0x2902880 ; -> CCharacterData$$get_BuffChance
  0x2cb1db8: str      w0, [sp, #0x18]
  0x2cb1dbc: mov      x0, x23
  0x2cb1dc0: mov      x1, xzr
  0x2cb1dc4: bl       #0x290295c ; -> CCharacterData$$get_BuffResist
  0x2cb1dc8: mov      w19, w0
  0x2cb1dcc: mov      x0, x23
  0x2cb1dd0: mov      x1, xzr
  0x2cb1dd4: bl       #0x2900df8 ; -> CCharacterData$$get_ShowStarUI
  0x2cb1dd8: mov      w25, w0
  0x2cb1ddc: mov      x0, x23
  0x2cb1de0: mov      x1, xzr
  0x2cb1de4: bl       #0x2900e10 ; -> CCharacterData$$get_StarPlus
  0x2cb1de8: mov      w26, w0
  0x2cb1dec: mov      x0, x23
  0x2cb1df0: mov      x1, xzr
  0x2cb1df4: bl       #0x2903118 ; -> CCharacterData$$get_DMGBoost
  0x2cb1df8: mov      w24, w0
  0x2cb1dfc: mov      x0, x23
  0x2cb1e00: mov      x1, xzr
  0x2cb1e04: bl       #0x29020c4 ; -> CCharacterData$$get_DMGReduceRate
  0x2cb1e08: mov      w21, w0
  0x2cb1e0c: mov      x0, x23
  0x2cb1e10: mov      x1, xzr
  0x2cb1e14: bl       #0x29031f4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cb1e18: cbz      x29, #0x2cb21a8
  0x2cb1e1c: mov      w22, w0
  0x2cb1e20: mov      x0, x29
  0x2cb1e24: mov      w1, wzr
  0x2cb1e28: mov      x2, xzr
  0x2cb1e2c: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2cb1e30: stp      w26, w25, [sp, #0x10]
  0x2cb1e34: cbz      x0, #0x2cb1e4c
  0x2cb1e38: mov      x1, xzr
  0x2cb1e3c: bl       #0x250c4f0 ; -> CSkill$$get_Level
  0x2cb1e40: and      w8, w0, #0xff
  0x2cb1e44: sub      w8, w8, #4
  0x2cb1e48: b        #0x2cb1e50
  0x2cb1e4c: mov      w8, #-3
  0x2cb1e50: mov      w1, #1
  0x2cb1e54: mov      x0, x29
  0x2cb1e58: mov      x2, xzr
  0x2cb1e5c: str      w8, [sp, #0xc]
  0x2cb1e60: mov      w26, #1
  0x2cb1e64: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2cb1e68: cbz      x0, #0x2cb1e78
  0x2cb1e6c: mov      x1, xzr
  0x2cb1e70: bl       #0x250c4f0 ; -> CSkill$$get_Level
  0x2cb1e74: and      w26, w0, #0xff
  0x2cb1e78: mov      w1, #2
  0x2cb1e7c: mov      x0, x29
  0x2cb1e80: mov      x2, xzr
  0x2cb1e84: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2cb1e88: cbz      x0, #0x2cb1e9c
  0x2cb1e8c: mov      x1, xzr
  0x2cb1e90: bl       #0x250c4f0 ; -> CSkill$$get_Level
  0x2cb1e94: and      w25, w0, #0xff
  0x2cb1e98: b        #0x2cb1ea0
  0x2cb1e9c: mov      w25, #1
  0x2cb1ea0: mov      w1, #3
  0x2cb1ea4: mov      x0, x29
  0x2cb1ea8: mov      x2, xzr
  0x2cb1eac: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2cb1eb0: cbz      x0, #0x2cb1ec4
  0x2cb1eb4: mov      x1, xzr
  0x2cb1eb8: bl       #0x250c4f0 ; -> CSkill$$get_Level
  0x2cb1ebc: and      w29, w0, #0xff
  0x2cb1ec0: b        #0x2cb1ec8
  0x2cb1ec4: mov      w29, #1
  0x2cb1ec8: add      w8, w24, w20
  0x2cb1ecc: cmp      w8, #0x7d1
  0x2cb1ed0: scvtf    s0, w8
  0x2cb1ed4: b.ge     #0x2cb1ee8
  0x2cb1ed8: mov      w8, #0x447a0000
  0x2cb1edc: fmov     s1, w8
  0x2cb1ee0: fdiv     s8, s0, s1
  0x2cb1ee4: b        #0x2cb1f20
  0x2cb1ee8: adrp     x8, #0x106d000
  0x2cb1eec: ldr      s1, [x8, #0x810] ; = 2500.0 (f32 @ 0x106d810)
  0x2cb1ef0: mov      w8, #-0x3b060000
  0x2cb1ef4: fmov     s3, w8
  0x2cb1ef8: fadd     s0, s0, s3
  0x2cb1efc: fmov     s2, #1.00000000
  0x2cb1f00: fdiv     s0, s0, s1
  0x2cb1f04: fmin     s0, s0, s2
  0x2cb1f08: fsub     s0, s2, s0
  0x2cb1f0c: fmul     s0, s0, s0
  0x2cb1f10: fsub     s0, s2, s0
  0x2cb1f14: fadd     s0, s0, s0
  0x2cb1f18: fmov     s1, #2.50000000
  0x2cb1f1c: fadd     s8, s0, s1
  0x2cb1f20: ldr      w24, [sp, #0x20]
  0x2cb1f24: fmov     s0, w19
  0x2cb1f28: mov      w1, #8
  0x2cb1f2c: mov      x0, x23
  0x2cb1f30: mov      x2, xzr
  0x2cb1f34: add      w20, w22, w21
  0x2cb1f38: str      q0, [sp, #0x20]
  0x2cb1f3c: bl       #0x2909564 ; -> CCharacterData$$GetEquipItem
  0x2cb1f40: fmov     s10, wzr
  0x2cb1f44: fmov     s9, wzr
  0x2cb1f48: cbz      x0, #0x2cb1f60
  0x2cb1f4c: ldrb     w8, [x0, #0x58]
  0x2cb1f50: mov      w9, #0x64
  0x2cb1f54: mul      w8, w8, w9
  0x2cb1f58: add      w8, w8, #0x12c
  0x2cb1f5c: scvtf    s9, w8
  0x2cb1f60: ldr      q0, [sp, #0x20]
  0x2cb1f64: mov      w1, #9
  0x2cb1f68: mov      x0, x23
  0x2cb1f6c: mov      x2, xzr
  0x2cb1f70: mov      v0.s[1], w20
  0x2cb1f74: str      q0, [sp, #0x20]
  0x2cb1f78: bl       #0x2909564 ; -> CCharacterData$$GetEquipItem
  0x2cb1f7c: cbz      x0, #0x2cb1fa8
  0x2cb1f80: mov      x1, xzr
  0x2cb1f84: mov      x19, x0
  0x2cb1f88: bl       #0x2340180 ; -> CItem$$get_BasicStar
  0x2cb1f8c: ldrb     w8, [x19, #0x58]
  0x2cb1f90: and      w9, w0, #0xff
  0x2cb1f94: mov      w10, #0x32
  0x2cb1f98: mul      w9, w9, w10
  0x2cb1f9c: mov      w10, #0x64
  0x2cb1fa0: madd     w8, w8, w10, w9
  0x2cb1fa4: scvtf    s10, w8
  0x2cb1fa8: adrp     x21, #0x59d5000
  0x2cb1fac: ldr      w9, [sp, #0x38]
  0x2cb1fb0: ldr      w10, [sp, #0x1c]
  0x2cb1fb4: ldrb     w8, [x21, #8]
  0x2cb1fb8: ldr      w19, [x23, #0x58]
  0x2cb1fbc: add      w20, w10, w9
  0x2cb1fc0: cbnz     w8, #0x2cb1fd8
  0x2cb1fc4: adrp     x0, #0x5588000
  0x2cb1fc8: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb1fcc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb1fd0: mov      w8, #1
  0x2cb1fd4: strb     w8, [x21, #8]
  0x2cb1fd8: adrp     x8, #0x5588000
  0x2cb1fdc: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb1fe0: ldr      q0, [sp, #0x20]
  0x2cb1fe4: ldr      w9, [sp, #0x18]
  0x2cb1fe8: scvtf    s12, w20
  0x2cb1fec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x2cb1ff0: scvtf    v13.2s, v0.2s
  0x2cb1ff4: scvtf    s11, w28
  0x2cb1ff8: scvtf    s14, w9
  0x2cb1ffc: ldr      w8, [x0, #0xe0]
  0x2cb2000: cbnz     w8, #0x2cb2008
  0x2cb2004: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2008: ldr      w8, [sp, #0x3c]
  0x2cb200c: ldp      w12, w11, [sp, #0x10]
  0x2cb2010: fmov     s3, #1.50000000
  0x2cb2014: mov      w10, #0x42480000
  0x2cb2018: scvtf    s2, w8
  0x2cb201c: scvtf    s4, w27
  0x2cb2020: ldr      w13, [sp, #0xc]
  0x2cb2024: fmul     s2, s2, s3
  0x2cb2028: fmov     s3, w10
  0x2cb202c: mov      w10, #0x43fa0000
  0x2cb2030: scvtf    s5, w11
  0x2cb2034: fdiv     s3, s4, s3
  0x2cb2038: fmov     s4, w10
  0x2cb203c: mov      w10, #0x42f00000
  0x2cb2040: mov      w11, #0x43020000
  0x2cb2044: scvtf    s6, w12
  0x2cb2048: fmul     s4, s5, s4
  0x2cb204c: fmov     s5, w10
  0x2cb2050: fmul     s5, s6, s5
  0x2cb2054: fmov     s6, w11
  0x2cb2058: mov      w11, #0x43480000
  0x2cb205c: mov      w9, #0x447a0000
  0x2cb2060: adrp     x8, #0x106d000
  0x2cb2064: add      w13, w13, w26
  0x2cb2068: fadd     s4, s4, s5
  0x2cb206c: dup      v5.2s, w11
  0x2cb2070: scvtf    s1, w24
  0x2cb2074: fmov     s7, w9
  0x2cb2078: ldr      s16, [x8, #0x898] ; = 0.0010000000474974513 (f32 @ 0x106d898)
  0x2cb207c: mov      w8, #0x42c80000
  0x2cb2080: add      w11, w13, w25
  0x2cb2084: fadd     v5.2s, v13.2s, v5.2s
  0x2cb2088: fadd     s1, s1, s7
  0x2cb208c: fadd     s2, s2, s7
  0x2cb2090: fmov     v7.2s, #0.25000000
  0x2cb2094: fdiv     v5.2s, v13.2s, v5.2s
  0x2cb2098: fmov     s17, w8
  0x2cb209c: add      w8, w11, w29
  0x2cb20a0: adrp     x12, #0x106d000
  0x2cb20a4: fmul     v5.2s, v5.2s, v7.2s
  0x2cb20a8: scvtf    s7, w8
  0x2cb20ac: fmul     s7, s7, s17
  0x2cb20b0: ldr      s17, [x12, #0x69c] ; = 1.7000000476837158 (f32 @ 0x106d69c)
  0x2cb20b4: fadd     s6, s14, s6
  0x2cb20b8: adrp     x14, #0x106d000
  0x2cb20bc: fdiv     s6, s14, s6
  0x2cb20c0: adrp     x8, #0x106d000
  0x2cb20c4: fmul     s6, s6, s17
  0x2cb20c8: ldr      s17, [x8, #0x7ec] ; = 5000.0 (f32 @ 0x106d7ec)
  0x2cb20cc: fadd     s4, s4, s7
  0x2cb20d0: ldr      s7, [x14, #0x704] ; = 44000.0 (f32 @ 0x106d704)
  0x2cb20d4: fmul     s1, s1, s16
  0x2cb20d8: fmul     s2, s2, s16
  0x2cb20dc: fmov     v16.2s, #1.00000000
  0x2cb20e0: fmov     s0, #1.00000000
  0x2cb20e4: adrp     x9, #0x106d000
  0x2cb20e8: cmp      w19, #0
  0x2cb20ec: fadd     v5.2s, v5.2s, v16.2s
  0x2cb20f0: fmov     s16, wzr
  0x2cb20f4: adrp     x10, #0x106d000
  0x2cb20f8: fcsel    s16, s16, s17, eq
  0x2cb20fc: ldr      s17, [x9, #0x5b0] ; = 0.15000000596046448 (f32 @ 0x106d5b0)
  0x2cb2100: fadd     s3, s3, s0
  0x2cb2104: fadd     s0, s6, s0
  0x2cb2108: fadd     s6, s12, s7
  0x2cb210c: fdiv     s6, s7, s6
  0x2cb2110: ldr      s7, [x10, #0x718] ; = 1.0499999523162842 (f32 @ 0x106d718)
  0x2cb2114: fmul     s1, s1, s11
  0x2cb2118: fmul     s1, s1, s8
  0x2cb211c: fmul     s6, s6, s17
  0x2cb2120: fmul     s1, s2, s1
  0x2cb2124: fadd     s2, s6, s7
  0x2cb2128: fmul     s1, s3, s1
  0x2cb212c: fmul     s2, s2, s12
  0x2cb2130: fmul     s0, s0, s1
  0x2cb2134: fmov     s3, #0.12500000
  0x2cb2138: fmul     s1, s2, v5.s[1]
  0x2cb213c: fadd     s0, s0, s11
  0x2cb2140: fmul     s1, s1, v5.s[0]
  0x2cb2144: fmul     s0, s0, s3
  0x2cb2148: fadd     s0, s1, s0
  0x2cb214c: fadd     s0, s4, s0
  0x2cb2150: fadd     s0, s0, s9
  0x2cb2154: fadd     s0, s0, s10
  0x2cb2158: mov      w8, #0x7f800000
  0x2cb215c: fadd     s0, s0, s16
  0x2cb2160: ldp      x20, x19, [sp, #0xc0]
  0x2cb2164: ldp      x22, x21, [sp, #0xb0]
  0x2cb2168: ldp      x24, x23, [sp, #0xa0]
  0x2cb216c: ldp      x26, x25, [sp, #0x90]
  0x2cb2170: ldp      x28, x27, [sp, #0x80]
  0x2cb2174: ldp      x29, x30, [sp, #0x70]
  0x2cb2178: ldp      d9, d8, [sp, #0x60]
  0x2cb217c: ldp      d11, d10, [sp, #0x50]
  0x2cb2180: ldp      d13, d12, [sp, #0x40]
  0x2cb2184: ldr      d14, [sp, #0x30]
  0x2cb2188: fmov     s6, w8
  0x2cb218c: frintm   s1, s0
  0x2cb2190: fcvtms   w8, s0
  0x2cb2194: fcmp     s1, s6
  0x2cb2198: mov      w9, #-0xffffffff80000000
  0x2cb219c: csel     w0, w9, w8, eq
  0x2cb21a0: add      sp, sp, #0xd0
  0x2cb21a4: ret      
  0x2cb21a8: bl       #0x21afc18 ; -> ??? 0x21afc18
