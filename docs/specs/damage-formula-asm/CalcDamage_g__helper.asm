; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcDamage_g__helper @ 0x2cc1d40..0x2cc1fdc (taille 668 octets) =====
  0x2cc1d40: sub      sp, sp, #0x50
  0x2cc1d44: stp      x30, x25, [sp, #0x10]
  0x2cc1d48: stp      x24, x23, [sp, #0x20]
  0x2cc1d4c: stp      x22, x21, [sp, #0x30]
  0x2cc1d50: stp      x20, x19, [sp, #0x40]
  0x2cc1d54: adrp     x21, #0x59e9000
  0x2cc1d58: ldrb     w8, [x21, #0xd6d]
  0x2cc1d5c: mov      x19, x1
  0x2cc1d60: mov      w20, w0
  0x2cc1d64: tbnz     w8, #0, #0x2cc1d88
  0x2cc1d68: adrp     x0, #0x5599000
  0x2cc1d6c: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc1d70: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1d74: adrp     x0, #0x5597000
  0x2cc1d78: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc1d7c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1d80: mov      w8, #1
  0x2cc1d84: strb     w8, [x21, #0xd6d]
  0x2cc1d88: str      wzr, [sp, #0xc]
  0x2cc1d8c: ldr      x0, [x19]
  0x2cc1d90: cbz      x0, #0x2cc1fd8
  0x2cc1d94: mov      x1, xzr
  0x2cc1d98: bl       #0x28305a8 ; -> CCharacterBattle$$GetAttackStat
  0x2cc1d9c: ldr      x8, [x19]
  0x2cc1da0: cbz      x8, #0x2cc1fd8
  0x2cc1da4: mov      w21, w0
  0x2cc1da8: mov      x0, x8
  0x2cc1dac: mov      x1, xzr
  0x2cc1db0: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x2cc1db4: cbz      x0, #0x2cc1fd8
  0x2cc1db8: mov      x1, xzr
  0x2cc1dbc: bl       #0x2511700 ; -> CSkillManager$$GetSkillFactor
  0x2cc1dc0: ldr      x8, [x19]
  0x2cc1dc4: cbz      x8, #0x2cc1fd8
  0x2cc1dc8: mov      w22, w0
  0x2cc1dcc: ldr      x0, [x8, #0x28]
  0x2cc1dd0: cbz      x0, #0x2cc1fd8
  0x2cc1dd4: mov      x1, xzr
  0x2cc1dd8: bl       #0x29096a8 ; -> CCharacterData$$get_PiercePowerRate
  0x2cc1ddc: ldr      x8, [x19]
  0x2cc1de0: cbz      x8, #0x2cc1fd8
  0x2cc1de4: mov      w23, w0
  0x2cc1de8: ldr      x0, [x8, #0x28]
  0x2cc1dec: cbz      x0, #0x2cc1fd8
  0x2cc1df0: mov      x1, xzr
  0x2cc1df4: bl       #0x29095cc ; -> CCharacterData$$get_PiercePower
  0x2cc1df8: ldr      x8, [x19, #8]
  0x2cc1dfc: cbz      x8, #0x2cc1fd8
  0x2cc1e00: mov      w24, w0
  0x2cc1e04: ldr      x0, [x8, #0x28]
  0x2cc1e08: cbz      x0, #0x2cc1fd8
  0x2cc1e0c: adrp     x25, #0x5597000
  0x2cc1e10: ldr      x25, [x25, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc1e14: mov      x1, xzr
  0x2cc1e18: bl       #0x290925c ; -> CCharacterData$$get_Def
  0x2cc1e1c: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5597000)
  0x2cc1e20: mov      w25, w0
  0x2cc1e24: ldr      w9, [x8, #0xe0]
  0x2cc1e28: cbnz     w9, #0x2cc1e34
  0x2cc1e2c: mov      x0, x8
  0x2cc1e30: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc1e34: mov      w8, #0x3e8
  0x2cc1e38: cmp      w23, #0x3e8
  0x2cc1e3c: sub      w8, w8, w23
  0x2cc1e40: csel     w8, w8, wzr, lt
  0x2cc1e44: smull    x8, w25, w8
  0x2cc1e48: mov      w9, #-0x3e8
  0x2cc1e4c: mov      x0, #-0x3e58
  0x2cc1e50: smaddl   x1, w24, w9, x8
  0x2cc1e54: movk     x0, #0xfff0, lsl #16
  0x2cc1e58: mov      x2, xzr
  0x2cc1e5c: bl       #0x4913ac4 ; -> System.Math$$Max
  0x2cc1e60: ldr      x8, [x19, #8]
  0x2cc1e64: cbz      x8, #0x2cc1fd8
  0x2cc1e68: mov      x11, #0xf7cf
  0x2cc1e6c: movk     x11, #0xe353, lsl #16
  0x2cc1e70: sxtw     x9, w22
  0x2cc1e74: smull    x10, w21, w20
  0x2cc1e78: movk     x11, #0x9ba5, lsl #32
  0x2cc1e7c: movk     x11, #0x20c4, lsl #48
  0x2cc1e80: mul      x9, x10, x9
  0x2cc1e84: smulh    x9, x9, x11
  0x2cc1e88: asr      x10, x9, #7
  0x2cc1e8c: mov      w23, #0x4240
  0x2cc1e90: add      x9, x10, x9, lsr #63
  0x2cc1e94: ldrsw    x10, [x19, #0x10]
  0x2cc1e98: movk     w23, #0xf, lsl #16
  0x2cc1e9c: mul      x9, x9, x23
  0x2cc1ea0: add      x12, x0, x23
  0x2cc1ea4: sdiv     x9, x9, x12
  0x2cc1ea8: mul      x9, x9, x10
  0x2cc1eac: smulh    x9, x9, x11
  0x2cc1eb0: asr      x10, x9, #7
  0x2cc1eb4: mov      w1, #5
  0x2cc1eb8: mov      x0, x8
  0x2cc1ebc: mov      x2, xzr
  0x2cc1ec0: add      x21, x10, x9, lsr #63
  0x2cc1ec4: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2cc1ec8: cbz      x0, #0x2cc1ef0
  0x2cc1ecc: mov      x9, #0xf7cf
  0x2cc1ed0: movk     x9, #0xe353, lsl #16
  0x2cc1ed4: mov      w8, #0x47e
  0x2cc1ed8: movk     x9, #0x9ba5, lsl #32
  0x2cc1edc: mul      x8, x21, x8
  0x2cc1ee0: movk     x9, #0x20c4, lsl #48
  0x2cc1ee4: smulh    x8, x8, x9
  0x2cc1ee8: asr      x9, x8, #7
  0x2cc1eec: add      x21, x9, x8, lsr #63
  0x2cc1ef0: ldp      x0, x1, [x19]
  0x2cc1ef4: bl       #0x2cc13b8 ; -> CFormula$$GetElementeryDamageRate
  0x2cc1ef8: ldr      x8, [x19, #8]
  0x2cc1efc: cbz      x8, #0x2cc1fd8
  0x2cc1f00: mov      w20, w0
  0x2cc1f04: mov      x0, x8
  0x2cc1f08: mov      x1, xzr
  0x2cc1f0c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1f10: cbz      x0, #0x2cc1fd8
  0x2cc1f14: mov      x10, #0xf7cf
  0x2cc1f18: movk     x10, #0xe353, lsl #16
  0x2cc1f1c: sxtw     x8, w20
  0x2cc1f20: ldr      w9, [x0, #0x3c]
  0x2cc1f24: movk     x10, #0x9ba5, lsl #32
  0x2cc1f28: mul      x8, x21, x8
  0x2cc1f2c: movk     x10, #0x20c4, lsl #48
  0x2cc1f30: smulh    x8, x8, x10
  0x2cc1f34: asr      x10, x8, #7
  0x2cc1f38: cmp      w9, #3
  0x2cc1f3c: add      x20, x10, x8, lsr #63
  0x2cc1f40: b.ne     #0x2cc1f88
  0x2cc1f44: adrp     x8, #0x5599000
  0x2cc1f48: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc1f4c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2cc1f50: ldr      w8, [x0, #0xe0]
  0x2cc1f54: cbnz     w8, #0x2cc1f5c
  0x2cc1f58: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc1f5c: mov      x0, xzr
  0x2cc1f60: bl       #0x2a0aa14 ; -> CCommonDefine$$get_MISSED_DAMAGE_RATE_PERMILLE
  0x2cc1f64: mov      x9, #0xf7cf
  0x2cc1f68: movk     x9, #0xe353, lsl #16
  0x2cc1f6c: sxtw     x8, w0
  0x2cc1f70: movk     x9, #0x9ba5, lsl #32
  0x2cc1f74: mul      x8, x20, x8
  0x2cc1f78: movk     x9, #0x20c4, lsl #48
  0x2cc1f7c: smulh    x8, x8, x9
  0x2cc1f80: asr      x9, x8, #7
  0x2cc1f84: add      x20, x9, x8, lsr #63
  0x2cc1f88: ldr      x0, [x19, #8]
  0x2cc1f8c: cbz      x0, #0x2cc1fd8
  0x2cc1f90: ldr      x2, [x19]
  0x2cc1f94: add      x1, sp, #0xc
  0x2cc1f98: mov      x3, xzr
  0x2cc1f9c: bl       #0x282f370 ; -> CCharacterBattle$$GetBuffDamgeFinalReduce
  0x2cc1fa0: ldr      w8, [sp, #0xc]
  0x2cc1fa4: mov      w9, #0x3e8
  0x2cc1fa8: ldp      x22, x21, [sp, #0x30]
  0x2cc1fac: ldp      x30, x25, [sp, #0x10]
  0x2cc1fb0: sub      w8, w9, w8
  0x2cc1fb4: sxtw     x8, w8
  0x2cc1fb8: mul      x8, x20, x8
  0x2cc1fbc: sdiv     x8, x8, x23
  0x2cc1fc0: ldp      x20, x19, [sp, #0x40]
  0x2cc1fc4: ldp      x24, x23, [sp, #0x20]
  0x2cc1fc8: cmp      w8, #1
  0x2cc1fcc: csinc    w0, w8, wzr, gt
  0x2cc1fd0: add      sp, sp, #0x50
  0x2cc1fd4: ret      
  0x2cc1fd8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
