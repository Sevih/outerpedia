; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CFormula_CalcBattlePower @ 0x2cc073c..0x2cc0be0 (taille 1188 octets) =====
  0x2cc073c: sub      sp, sp, #0xd0
  0x2cc0740: str      d14, [sp, #0x30]
  0x2cc0744: stp      d13, d12, [sp, #0x40]
  0x2cc0748: stp      d11, d10, [sp, #0x50]
  0x2cc074c: stp      d9, d8, [sp, #0x60]
  0x2cc0750: stp      x29, x30, [sp, #0x70]
  0x2cc0754: stp      x28, x27, [sp, #0x80]
  0x2cc0758: stp      x26, x25, [sp, #0x90]
  0x2cc075c: stp      x24, x23, [sp, #0xa0]
  0x2cc0760: stp      x22, x21, [sp, #0xb0]
  0x2cc0764: stp      x20, x19, [sp, #0xc0]
  0x2cc0768: cbz      x0, #0x2cc0bdc
  0x2cc076c: mov      x29, x1
  0x2cc0770: mov      x1, xzr
  0x2cc0774: mov      x23, x0
  0x2cc0778: bl       #0x2909180 ; -> CCharacterData$$get_Atk
  0x2cc077c: mov      w28, w0
  0x2cc0780: mov      x0, x23
  0x2cc0784: mov      x1, xzr
  0x2cc0788: bl       #0x290925c ; -> CCharacterData$$get_Def
  0x2cc078c: str      w0, [sp, #0x38]
  0x2cc0790: mov      x0, x23
  0x2cc0794: mov      x1, xzr
  0x2cc0798: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2cc079c: str      w0, [sp, #0x1c]
  0x2cc07a0: mov      x0, x23
  0x2cc07a4: mov      x1, xzr
  0x2cc07a8: bl       #0x29090a4 ; -> CCharacterData$$get_Speed
  0x2cc07ac: mov      w27, w0
  0x2cc07b0: mov      x0, x23
  0x2cc07b4: mov      x1, xzr
  0x2cc07b8: bl       #0x2909414 ; -> CCharacterData$$get_CriticalRate
  0x2cc07bc: str      w0, [sp, #0x20]
  0x2cc07c0: mov      x0, x23
  0x2cc07c4: mov      x1, xzr
  0x2cc07c8: bl       #0x29094f0 ; -> CCharacterData$$get_CriticalDMGRate
  0x2cc07cc: mov      w20, w0
  0x2cc07d0: mov      x0, x23
  0x2cc07d4: mov      x1, xzr
  0x2cc07d8: bl       #0x29096a8 ; -> CCharacterData$$get_PiercePowerRate
  0x2cc07dc: str      w0, [sp, #0x3c]
  0x2cc07e0: mov      x0, x23
  0x2cc07e4: mov      x1, xzr
  0x2cc07e8: bl       #0x2909af4 ; -> CCharacterData$$get_BuffChance
  0x2cc07ec: str      w0, [sp, #0x18]
  0x2cc07f0: mov      x0, x23
  0x2cc07f4: mov      x1, xzr
  0x2cc07f8: bl       #0x2909bd0 ; -> CCharacterData$$get_BuffResist
  0x2cc07fc: mov      w19, w0
  0x2cc0800: mov      x0, x23
  0x2cc0804: mov      x1, xzr
  0x2cc0808: bl       #0x290806c ; -> CCharacterData$$get_ShowStarUI
  0x2cc080c: mov      w25, w0
  0x2cc0810: mov      x0, x23
  0x2cc0814: mov      x1, xzr
  0x2cc0818: bl       #0x2908084 ; -> CCharacterData$$get_StarPlus
  0x2cc081c: mov      w26, w0
  0x2cc0820: mov      x0, x23
  0x2cc0824: mov      x1, xzr
  0x2cc0828: bl       #0x290a38c ; -> CCharacterData$$get_DMGBoost
  0x2cc082c: mov      w24, w0
  0x2cc0830: mov      x0, x23
  0x2cc0834: mov      x1, xzr
  0x2cc0838: bl       #0x2909338 ; -> CCharacterData$$get_DMGReduceRate
  0x2cc083c: mov      w21, w0
  0x2cc0840: mov      x0, x23
  0x2cc0844: mov      x1, xzr
  0x2cc0848: bl       #0x290a468 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cc084c: cbz      x29, #0x2cc0bdc
  0x2cc0850: mov      w22, w0
  0x2cc0854: mov      x0, x29
  0x2cc0858: mov      w1, wzr
  0x2cc085c: mov      x2, xzr
  0x2cc0860: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2cc0864: stp      w26, w25, [sp, #0x10]
  0x2cc0868: cbz      x0, #0x2cc0880
  0x2cc086c: mov      x1, xzr
  0x2cc0870: bl       #0x250df84 ; -> CSkill$$get_Level
  0x2cc0874: and      w8, w0, #0xff
  0x2cc0878: sub      w8, w8, #4
  0x2cc087c: b        #0x2cc0884
  0x2cc0880: mov      w8, #-3
  0x2cc0884: mov      w1, #1
  0x2cc0888: mov      x0, x29
  0x2cc088c: mov      x2, xzr
  0x2cc0890: str      w8, [sp, #0xc]
  0x2cc0894: mov      w26, #1
  0x2cc0898: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2cc089c: cbz      x0, #0x2cc08ac
  0x2cc08a0: mov      x1, xzr
  0x2cc08a4: bl       #0x250df84 ; -> CSkill$$get_Level
  0x2cc08a8: and      w26, w0, #0xff
  0x2cc08ac: mov      w1, #2
  0x2cc08b0: mov      x0, x29
  0x2cc08b4: mov      x2, xzr
  0x2cc08b8: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2cc08bc: cbz      x0, #0x2cc08d0
  0x2cc08c0: mov      x1, xzr
  0x2cc08c4: bl       #0x250df84 ; -> CSkill$$get_Level
  0x2cc08c8: and      w25, w0, #0xff
  0x2cc08cc: b        #0x2cc08d4
  0x2cc08d0: mov      w25, #1
  0x2cc08d4: mov      w1, #3
  0x2cc08d8: mov      x0, x29
  0x2cc08dc: mov      x2, xzr
  0x2cc08e0: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2cc08e4: cbz      x0, #0x2cc08f8
  0x2cc08e8: mov      x1, xzr
  0x2cc08ec: bl       #0x250df84 ; -> CSkill$$get_Level
  0x2cc08f0: and      w29, w0, #0xff
  0x2cc08f4: b        #0x2cc08fc
  0x2cc08f8: mov      w29, #1
  0x2cc08fc: add      w8, w24, w20
  0x2cc0900: cmp      w8, #0x7d1
  0x2cc0904: scvtf    s0, w8
  0x2cc0908: b.ge     #0x2cc091c
  0x2cc090c: mov      w8, #0x447a0000
  0x2cc0910: fmov     s1, w8
  0x2cc0914: fdiv     s8, s0, s1
  0x2cc0918: b        #0x2cc0954
  0x2cc091c: adrp     x8, #0x1070000
  0x2cc0920: ldr      s1, [x8, #0x650] ; = 2500.0 (f32 @ 0x1070650)
  0x2cc0924: mov      w8, #-0x3b060000
  0x2cc0928: fmov     s3, w8
  0x2cc092c: fadd     s0, s0, s3
  0x2cc0930: fmov     s2, #1.00000000
  0x2cc0934: fdiv     s0, s0, s1
  0x2cc0938: fmin     s0, s0, s2
  0x2cc093c: fsub     s0, s2, s0
  0x2cc0940: fmul     s0, s0, s0
  0x2cc0944: fsub     s0, s2, s0
  0x2cc0948: fadd     s0, s0, s0
  0x2cc094c: fmov     s1, #2.50000000
  0x2cc0950: fadd     s8, s0, s1
  0x2cc0954: ldr      w24, [sp, #0x20]
  0x2cc0958: fmov     s0, w19
  0x2cc095c: mov      w1, #8
  0x2cc0960: mov      x0, x23
  0x2cc0964: mov      x2, xzr
  0x2cc0968: add      w20, w22, w21
  0x2cc096c: str      q0, [sp, #0x20]
  0x2cc0970: bl       #0x29107d8 ; -> CCharacterData$$GetEquipItem
  0x2cc0974: fmov     s10, wzr
  0x2cc0978: fmov     s9, wzr
  0x2cc097c: cbz      x0, #0x2cc0994
  0x2cc0980: ldrb     w8, [x0, #0x58]
  0x2cc0984: mov      w9, #0x64
  0x2cc0988: mul      w8, w8, w9
  0x2cc098c: add      w8, w8, #0x12c
  0x2cc0990: scvtf    s9, w8
  0x2cc0994: ldr      q0, [sp, #0x20]
  0x2cc0998: mov      w1, #9
  0x2cc099c: mov      x0, x23
  0x2cc09a0: mov      x2, xzr
  0x2cc09a4: mov      v0.s[1], w20
  0x2cc09a8: str      q0, [sp, #0x20]
  0x2cc09ac: bl       #0x29107d8 ; -> CCharacterData$$GetEquipItem
  0x2cc09b0: cbz      x0, #0x2cc09dc
  0x2cc09b4: mov      x1, xzr
  0x2cc09b8: mov      x19, x0
  0x2cc09bc: bl       #0x23454c8 ; -> CItem$$get_BasicStar
  0x2cc09c0: ldrb     w8, [x19, #0x58]
  0x2cc09c4: and      w9, w0, #0xff
  0x2cc09c8: mov      w10, #0x32
  0x2cc09cc: mul      w9, w9, w10
  0x2cc09d0: mov      w10, #0x64
  0x2cc09d4: madd     w8, w8, w10, w9
  0x2cc09d8: scvtf    s10, w8
  0x2cc09dc: adrp     x21, #0x59e4000
  0x2cc09e0: ldr      w9, [sp, #0x38]
  0x2cc09e4: ldr      w10, [sp, #0x1c]
  0x2cc09e8: ldrb     w8, [x21, #0xc19]
  0x2cc09ec: ldr      w19, [x23, #0x58]
  0x2cc09f0: add      w20, w10, w9
  0x2cc09f4: cbnz     w8, #0x2cc0a0c
  0x2cc09f8: adrp     x0, #0x5597000
  0x2cc09fc: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc0a00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0a04: mov      w8, #1
  0x2cc0a08: strb     w8, [x21, #0xc19]
  0x2cc0a0c: adrp     x8, #0x5597000
  0x2cc0a10: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc0a14: ldr      q0, [sp, #0x20]
  0x2cc0a18: ldr      w9, [sp, #0x18]
  0x2cc0a1c: scvtf    s12, w20
  0x2cc0a20: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x2cc0a24: scvtf    v13.2s, v0.2s
  0x2cc0a28: scvtf    s11, w28
  0x2cc0a2c: scvtf    s14, w9
  0x2cc0a30: ldr      w8, [x0, #0xe0]
  0x2cc0a34: cbnz     w8, #0x2cc0a3c
  0x2cc0a38: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc0a3c: ldr      w8, [sp, #0x3c]
  0x2cc0a40: ldp      w12, w11, [sp, #0x10]
  0x2cc0a44: fmov     s3, #1.50000000
  0x2cc0a48: mov      w10, #0x42480000
  0x2cc0a4c: scvtf    s2, w8
  0x2cc0a50: scvtf    s4, w27
  0x2cc0a54: ldr      w13, [sp, #0xc]
  0x2cc0a58: fmul     s2, s2, s3
  0x2cc0a5c: fmov     s3, w10
  0x2cc0a60: mov      w10, #0x43fa0000
  0x2cc0a64: scvtf    s5, w11
  0x2cc0a68: fdiv     s3, s4, s3
  0x2cc0a6c: fmov     s4, w10
  0x2cc0a70: mov      w10, #0x42f00000
  0x2cc0a74: mov      w11, #0x43020000
  0x2cc0a78: scvtf    s6, w12
  0x2cc0a7c: fmul     s4, s5, s4
  0x2cc0a80: fmov     s5, w10
  0x2cc0a84: fmul     s5, s6, s5
  0x2cc0a88: fmov     s6, w11
  0x2cc0a8c: mov      w11, #0x43480000
  0x2cc0a90: mov      w9, #0x447a0000
  0x2cc0a94: adrp     x8, #0x1070000
  0x2cc0a98: add      w13, w13, w26
  0x2cc0a9c: fadd     s4, s4, s5
  0x2cc0aa0: dup      v5.2s, w11
  0x2cc0aa4: scvtf    s1, w24
  0x2cc0aa8: fmov     s7, w9
  0x2cc0aac: ldr      s16, [x8, #0x6d8] ; = 0.0010000000474974513 (f32 @ 0x10706d8)
  0x2cc0ab0: mov      w8, #0x42c80000
  0x2cc0ab4: add      w11, w13, w25
  0x2cc0ab8: fadd     v5.2s, v13.2s, v5.2s
  0x2cc0abc: fadd     s1, s1, s7
  0x2cc0ac0: fadd     s2, s2, s7
  0x2cc0ac4: fmov     v7.2s, #0.25000000
  0x2cc0ac8: fdiv     v5.2s, v13.2s, v5.2s
  0x2cc0acc: fmov     s17, w8
  0x2cc0ad0: add      w8, w11, w29
  0x2cc0ad4: adrp     x12, #0x1070000
  0x2cc0ad8: fmul     v5.2s, v5.2s, v7.2s
  0x2cc0adc: scvtf    s7, w8
  0x2cc0ae0: fmul     s7, s7, s17
  0x2cc0ae4: ldr      s17, [x12, #0x4dc] ; = 1.7000000476837158 (f32 @ 0x10704dc)
  0x2cc0ae8: fadd     s6, s14, s6
  0x2cc0aec: adrp     x14, #0x1070000
  0x2cc0af0: fdiv     s6, s14, s6
  0x2cc0af4: adrp     x8, #0x1070000
  0x2cc0af8: fmul     s6, s6, s17
  0x2cc0afc: ldr      s17, [x8, #0x62c] ; = 5000.0 (f32 @ 0x107062c)
  0x2cc0b00: fadd     s4, s4, s7
  0x2cc0b04: ldr      s7, [x14, #0x544] ; = 44000.0 (f32 @ 0x1070544)
  0x2cc0b08: fmul     s1, s1, s16
  0x2cc0b0c: fmul     s2, s2, s16
  0x2cc0b10: fmov     v16.2s, #1.00000000
  0x2cc0b14: fmov     s0, #1.00000000
  0x2cc0b18: adrp     x9, #0x1070000
  0x2cc0b1c: cmp      w19, #0
  0x2cc0b20: fadd     v5.2s, v5.2s, v16.2s
  0x2cc0b24: fmov     s16, wzr
  0x2cc0b28: adrp     x10, #0x1070000
  0x2cc0b2c: fcsel    s16, s16, s17, eq
  0x2cc0b30: ldr      s17, [x9, #0x3f0] ; = 0.15000000596046448 (f32 @ 0x10703f0)
  0x2cc0b34: fadd     s3, s3, s0
  0x2cc0b38: fadd     s0, s6, s0
  0x2cc0b3c: fadd     s6, s12, s7
  0x2cc0b40: fdiv     s6, s7, s6
  0x2cc0b44: ldr      s7, [x10, #0x558] ; = 1.0499999523162842 (f32 @ 0x1070558)
  0x2cc0b48: fmul     s1, s1, s11
  0x2cc0b4c: fmul     s1, s1, s8
  0x2cc0b50: fmul     s6, s6, s17
  0x2cc0b54: fmul     s1, s2, s1
  0x2cc0b58: fadd     s2, s6, s7
  0x2cc0b5c: fmul     s1, s3, s1
  0x2cc0b60: fmul     s2, s2, s12
  0x2cc0b64: fmul     s0, s0, s1
  0x2cc0b68: fmov     s3, #0.12500000
  0x2cc0b6c: fmul     s1, s2, v5.s[1]
  0x2cc0b70: fadd     s0, s0, s11
  0x2cc0b74: fmul     s1, s1, v5.s[0]
  0x2cc0b78: fmul     s0, s0, s3
  0x2cc0b7c: fadd     s0, s1, s0
  0x2cc0b80: fadd     s0, s4, s0
  0x2cc0b84: fadd     s0, s0, s9
  0x2cc0b88: fadd     s0, s0, s10
  0x2cc0b8c: mov      w8, #0x7f800000
  0x2cc0b90: fadd     s0, s0, s16
  0x2cc0b94: ldp      x20, x19, [sp, #0xc0]
  0x2cc0b98: ldp      x22, x21, [sp, #0xb0]
  0x2cc0b9c: ldp      x24, x23, [sp, #0xa0]
  0x2cc0ba0: ldp      x26, x25, [sp, #0x90]
  0x2cc0ba4: ldp      x28, x27, [sp, #0x80]
  0x2cc0ba8: ldp      x29, x30, [sp, #0x70]
  0x2cc0bac: ldp      d9, d8, [sp, #0x60]
  0x2cc0bb0: ldp      d11, d10, [sp, #0x50]
  0x2cc0bb4: ldp      d13, d12, [sp, #0x40]
  0x2cc0bb8: ldr      d14, [sp, #0x30]
  0x2cc0bbc: fmov     s6, w8
  0x2cc0bc0: frintm   s1, s0
  0x2cc0bc4: fcvtms   w8, s0
  0x2cc0bc8: fcmp     s1, s6
  0x2cc0bcc: mov      w9, #-0xffffffff80000000
  0x2cc0bd0: csel     w0, w9, w8, eq
  0x2cc0bd4: add      sp, sp, #0xd0
  0x2cc0bd8: ret      
  0x2cc0bdc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
