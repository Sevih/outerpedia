; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcDamage @ 0x2cb2b54..0x2cb330c (taille 1976 octets) =====
  0x2cb2b54: sub      sp, sp, #0xc0
  0x2cb2b58: stp      d9, d8, [sp, #0x50]
  0x2cb2b5c: stp      x29, x30, [sp, #0x60]
  0x2cb2b60: stp      x28, x27, [sp, #0x70]
  0x2cb2b64: stp      x26, x25, [sp, #0x80]
  0x2cb2b68: stp      x24, x23, [sp, #0x90]
  0x2cb2b6c: stp      x22, x21, [sp, #0xa0]
  0x2cb2b70: stp      x20, x19, [sp, #0xb0]
  0x2cb2b74: adrp     x19, #0x59da000
  0x2cb2b78: ldrb     w8, [x19, #0x113]
  0x2cb2b7c: mov      x21, x6
  0x2cb2b80: mov      x28, x5
  0x2cb2b84: mov      x27, x4
  0x2cb2b88: mov      w23, w3
  0x2cb2b8c: mov      x22, x2
  0x2cb2b90: mov      x24, x1
  0x2cb2b94: mov      x25, x0
  0x2cb2b98: tbnz     w8, #0, #0x2cb2c04
  0x2cb2b9c: adrp     x0, #0x558a000
  0x2cb2ba0: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb2ba4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2ba8: adrp     x0, #0x5589000
  0x2cb2bac: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2cb2bb0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bb4: adrp     x0, #0x558a000
  0x2cb2bb8: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2cb2bbc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bc0: adrp     x0, #0x55a9000
  0x2cb2bc4: ldr      x0, [x0, #0xee0] ; = 0x0 (u64 @ 0x55a9ee0)
  0x2cb2bc8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bcc: adrp     x0, #0x5587000
  0x2cb2bd0: ldr      x0, [x0, #0xb18] ; = 0x0 (u64 @ 0x5587b18)
  0x2cb2bd4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bd8: adrp     x0, #0x55cb000
  0x2cb2bdc: ldr      x0, [x0, #0x90] ; = 0x0 (u64 @ 0x55cb090)
  0x2cb2be0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2be4: adrp     x0, #0x55a9000
  0x2cb2be8: ldr      x0, [x0, #0xef8] ; = 0x0 (u64 @ 0x55a9ef8)
  0x2cb2bec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bf0: adrp     x0, #0x5587000
  0x2cb2bf4: ldr      x0, [x0, #0xd50] ; = 0x0 (u64 @ 0x5587d50)
  0x2cb2bf8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2bfc: mov      w8, #1
  0x2cb2c00: strb     w8, [x19, #0x113]
  0x2cb2c04: add      x8, sp, #0x38
  0x2cb2c08: add      x0, sp, #0x38
  0x2cb2c0c: mov      x1, x25
  0x2cb2c10: stp      xzr, xzr, [sp, #0x40]
  0x2cb2c14: stp      xzr, x25, [sp, #0x30]
  0x2cb2c18: str      wzr, [sp, #0x2c]
  0x2cb2c1c: add      x26, x8, #8
  0x2cb2c20: bl       #0x21af920 ; -> ??? 0x21af920
  0x2cb2c24: mov      x0, x26
  0x2cb2c28: mov      x1, x24
  0x2cb2c2c: str      x24, [sp, #0x40]
  0x2cb2c30: bl       #0x21af920 ; -> ??? 0x21af920
  0x2cb2c34: str      w23, [sp, #0x48]
  0x2cb2c38: cbz      w23, #0x2cb2ef0
  0x2cb2c3c: cbz      x22, #0x2cb3304
  0x2cb2c40: ldr      w0, [x22, #0x68]
  0x2cb2c44: cbz      w0, #0x2cb2f00
  0x2cb2c48: add      x1, sp, #0x38
  0x2cb2c4c: bl       #0x2cb330c ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2cb2c50: str      w0, [x27]
  0x2cb2c54: ldr      x0, [sp, #0x40]
  0x2cb2c58: cbz      x0, #0x2cb3304
  0x2cb2c5c: mov      x1, xzr
  0x2cb2c60: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2c64: cbz      x0, #0x2cb3304
  0x2cb2c68: ldr      w8, [x0, #0x80]
  0x2cb2c6c: cbnz     w8, #0x2cb2fd4
  0x2cb2c70: ldr      x8, [sp, #0x38]
  0x2cb2c74: cbz      x8, #0x2cb3304
  0x2cb2c78: ldr      x0, [x8, #0xf0]
  0x2cb2c7c: cbz      x0, #0x2cb3304
  0x2cb2c80: mov      w1, wzr
  0x2cb2c84: mov      x2, xzr
  0x2cb2c88: bl       #0x5002e0c ; -> UnityEngine.Animator$$GetCurrentAnimatorClipInfo
  0x2cb2c8c: cbz      x0, #0x2cb3304
  0x2cb2c90: ldr      x8, [x0, #0x18] ; = 0x0 (u64 @ 0x5587018)
  0x2cb2c94: mov      x24, x0
  0x2cb2c98: stp      x22, x28, [sp, #8]
  0x2cb2c9c: stp      x27, x21, [sp, #0x18]
  0x2cb2ca0: cmp      w8, #1
  0x2cb2ca4: b.lt     #0x2cb2f10
  0x2cb2ca8: adrp     x28, #0x55a9000
  0x2cb2cac: adrp     x29, #0x5587000
  0x2cb2cb0: adrp     x19, #0x5587000
  0x2cb2cb4: adrp     x21, #0x558a000
  0x2cb2cb8: adrp     x22, #0x55a9000
  0x2cb2cbc: ldr      x28, [x28, #0xee0] ; = 0x0 (u64 @ 0x55a9ee0)
  0x2cb2cc0: ldr      x29, [x29, #0xb18] ; = 0x0 (u64 @ 0x5587b18)
  0x2cb2cc4: ldr      x19, [x19, #0xd50] ; = 0x0 (u64 @ 0x5587d50)
  0x2cb2cc8: ldr      x21, [x21, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2cb2ccc: ldr      x22, [x22, #0xef8] ; = 0x0 (u64 @ 0x55a9ef8)
  0x2cb2cd0: mov      w23, wzr
  0x2cb2cd4: mov      x27, xzr
  0x2cb2cd8: and      x8, x8, #0xffffffff
  0x2cb2cdc: cmp      x27, w8, uxtw
  0x2cb2ce0: b.hs     #0x2cb3308
  0x2cb2ce4: add      x8, x24, x27, lsl #3
  0x2cb2ce8: ldr      x8, [x8, #0x20]
  0x2cb2cec: add      x0, sp, #0x30
  0x2cb2cf0: mov      x1, xzr
  0x2cb2cf4: str      x8, [sp, #0x30]
  0x2cb2cf8: bl       #0x5002608 ; -> UnityEngine.AnimatorClipInfo$$get_clip
  0x2cb2cfc: cbz      x0, #0x2cb3304
  0x2cb2d00: mov      x1, xzr
  0x2cb2d04: bl       #0x5002540 ; -> UnityEngine.AnimationClip$$get_events
  0x2cb2d08: cbz      x0, #0x2cb3304
  0x2cb2d0c: ldr      w8, [x0, #0x18]
  0x2cb2d10: mov      x25, x0
  0x2cb2d14: cmp      w8, #1
  0x2cb2d18: b.lt     #0x2cb2edc
  0x2cb2d1c: mov      w20, wzr
  0x2cb2d20: cmp      w20, w8
  0x2cb2d24: b.hs     #0x2cb3308
  0x2cb2d28: add      x8, x25, w20, sxtw #3
  0x2cb2d2c: ldr      x26, [x8, #0x20]
  0x2cb2d30: cbz      x26, #0x2cb3304
  0x2cb2d34: mov      x0, x26
  0x2cb2d38: mov      x1, xzr
  0x2cb2d3c: bl       #0x50021f4 ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2cb2d40: ldr      x8, [x28] ; = 0x0 (u64 @ 0x55a9000)
  0x2cb2d44: cbz      x8, #0x2cb3304
  0x2cb2d48: mov      x1, x0
  0x2cb2d4c: mov      x0, x8
  0x2cb2d50: mov      x2, xzr
  0x2cb2d54: bl       #0x4778c8c ; -> System.String$$Equals
  0x2cb2d58: tbz      w0, #0, #0x2cb2de8
  0x2cb2d5c: mov      x0, x26
  0x2cb2d60: mov      x1, xzr
  0x2cb2d64: bl       #0x50021ec ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2cb2d68: cbz      x0, #0x2cb3304
  0x2cb2d6c: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2d70: ldr      x2, [x19] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2d74: mov      x3, xzr
  0x2cb2d78: bl       #0x477b3b8 ; -> System.String$$Replace
  0x2cb2d7c: cbz      x0, #0x2cb3304
  0x2cb2d80: mov      w1, #0x2c
  0x2cb2d84: mov      w2, wzr
  0x2cb2d88: mov      x3, xzr
  0x2cb2d8c: bl       #0x477ba0c ; -> System.String$$Split
  0x2cb2d90: ldr      x8, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x2cb2d94: mov      x26, x0
  0x2cb2d98: ldr      w9, [x8, #0xe0]
  0x2cb2d9c: cbnz     w9, #0x2cb2da8
  0x2cb2da0: mov      x0, x8
  0x2cb2da4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2da8: mov      x0, xzr
  0x2cb2dac: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2cb2db0: cbz      x26, #0x2cb3304
  0x2cb2db4: ldr      w8, [x26, #0x18]
  0x2cb2db8: cbz      w8, #0x2cb3308
  0x2cb2dbc: cbz      x0, #0x2cb3304
  0x2cb2dc0: ldr      x1, [x26, #0x20]
  0x2cb2dc4: mov      x2, xzr
  0x2cb2dc8: bl       #0x2625db0 ; -> CTempletManager$$GetDamageTemplet
  0x2cb2dcc: cbz      x0, #0x2cb3304
  0x2cb2dd0: ldr      w8, [x0, #0x34]
  0x2cb2dd4: ldr      w9, [x0, #0x68]
  0x2cb2dd8: cmp      w8, #0
  0x2cb2ddc: csinc    w8, w8, wzr, ne
  0x2cb2de0: madd     w23, w8, w9, w23
  0x2cb2de4: b        #0x2cb2ecc
  0x2cb2de8: mov      x0, x26
  0x2cb2dec: mov      x1, xzr
  0x2cb2df0: bl       #0x50021f4 ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2cb2df4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x55a9000)
  0x2cb2df8: cbz      x8, #0x2cb3304
  0x2cb2dfc: mov      x1, x0
  0x2cb2e00: mov      x0, x8
  0x2cb2e04: mov      x2, xzr
  0x2cb2e08: bl       #0x4778c8c ; -> System.String$$Equals
  0x2cb2e0c: tbz      w0, #0, #0x2cb2ecc
  0x2cb2e10: mov      x0, x26
  0x2cb2e14: mov      x1, xzr
  0x2cb2e18: bl       #0x50021ec ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2cb2e1c: cbz      x0, #0x2cb3304
  0x2cb2e20: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2e24: ldr      x2, [x19] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2e28: mov      x3, xzr
  0x2cb2e2c: bl       #0x477b3b8 ; -> System.String$$Replace
  0x2cb2e30: cbz      x0, #0x2cb3304
  0x2cb2e34: mov      w1, #0x2c
  0x2cb2e38: mov      w2, wzr
  0x2cb2e3c: mov      x3, xzr
  0x2cb2e40: bl       #0x477ba0c ; -> System.String$$Split
  0x2cb2e44: cbz      x0, #0x2cb2ecc
  0x2cb2e48: ldr      w8, [x0, #0x18]
  0x2cb2e4c: cmp      w8, #2
  0x2cb2e50: b.lt     #0x2cb2ecc
  0x2cb2e54: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2cb2e58: add      x1, sp, #0x2c
  0x2cb2e5c: mov      x2, xzr
  0x2cb2e60: bl       #0x4902494 ; -> System.Int32$$TryParse
  0x2cb2e64: ldr      w8, [sp, #0x2c]
  0x2cb2e68: cmp      w8, #1
  0x2cb2e6c: b.lt     #0x2cb2ecc
  0x2cb2e70: tbz      w0, #0, #0x2cb2ecc
  0x2cb2e74: add      x0, sp, #0x2c
  0x2cb2e78: mov      x1, xzr
  0x2cb2e7c: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x2cb2e80: adrp     x8, #0x55cb000
  0x2cb2e84: ldr      x8, [x8, #0x90] ; = 0x0 (u64 @ 0x55cb090)
  0x2cb2e88: mov      x1, x0
  0x2cb2e8c: mov      x2, xzr
  0x2cb2e90: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb2e94: mov      x0, x8
  0x2cb2e98: bl       #0x476ca18 ; -> System.String$$Concat
  0x2cb2e9c: adrp     x8, #0x5589000
  0x2cb2ea0: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2cb2ea4: mov      x26, x0
  0x2cb2ea8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x2cb2eac: ldr      w9, [x8, #0xe0]
  0x2cb2eb0: cbnz     w9, #0x2cb2ebc
  0x2cb2eb4: mov      x0, x8
  0x2cb2eb8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2ebc: mov      x0, x26
  0x2cb2ec0: bl       #0x2ca7298 ; -> CDebug$$LogWarning
  0x2cb2ec4: ldr      w8, [sp, #0x2c]
  0x2cb2ec8: add      w23, w8, w23
  0x2cb2ecc: ldr      w8, [x25, #0x18]
  0x2cb2ed0: add      w20, w20, #1
  0x2cb2ed4: cmp      w20, w8
  0x2cb2ed8: b.lt     #0x2cb2d20
  0x2cb2edc: ldr      w8, [x24, #0x18]
  0x2cb2ee0: add      x27, x27, #1
  0x2cb2ee4: cmp      x27, w8, sxtw
  0x2cb2ee8: b.lt     #0x2cb2cdc
  0x2cb2eec: b        #0x2cb2f14
  0x2cb2ef0: str      wzr, [x21]
  0x2cb2ef4: str      wzr, [x28]
  0x2cb2ef8: str      wzr, [x27]
  0x2cb2efc: b        #0x2cb3240
  0x2cb2f00: str      wzr, [x27]
  0x2cb2f04: str      wzr, [x28]
  0x2cb2f08: str      wzr, [x21]
  0x2cb2f0c: b        #0x2cb3240
  0x2cb2f10: mov      w23, wzr
  0x2cb2f14: ldp      x27, x21, [sp, #0x18]
  0x2cb2f18: ldp      x22, x28, [sp, #8]
  0x2cb2f1c: cbnz     w23, #0x2cb2f5c
  0x2cb2f20: ldr      x0, [sp, #0x38]
  0x2cb2f24: cbz      x0, #0x2cb3304
  0x2cb2f28: mov      x1, xzr
  0x2cb2f2c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2f30: cbz      x0, #0x2cb3304
  0x2cb2f34: ldr      w8, [x0, #0x88]
  0x2cb2f38: cbz      w8, #0x2cb2f58
  0x2cb2f3c: ldr      x0, [sp, #0x38]
  0x2cb2f40: cbz      x0, #0x2cb3304
  0x2cb2f44: mov      x1, xzr
  0x2cb2f48: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2f4c: cbz      x0, #0x2cb3304
  0x2cb2f50: ldr      w23, [x0, #0x88]
  0x2cb2f54: b        #0x2cb2f5c
  0x2cb2f58: mov      w23, wzr
  0x2cb2f5c: ldr      x0, [sp, #0x40]
  0x2cb2f60: cbz      x0, #0x2cb3304
  0x2cb2f64: mov      x1, xzr
  0x2cb2f68: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2f6c: mov      x24, x0
  0x2cb2f70: add      x1, sp, #0x38
  0x2cb2f74: mov      w0, w23
  0x2cb2f78: bl       #0x2cb330c ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2cb2f7c: cbz      x24, #0x2cb3304
  0x2cb2f80: str      w0, [x24, #0x80]
  0x2cb2f84: ldr      x0, [sp, #0x40]
  0x2cb2f88: cbz      x0, #0x2cb3304
  0x2cb2f8c: mov      x1, xzr
  0x2cb2f90: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2f94: cbz      x0, #0x2cb3304
  0x2cb2f98: str      w23, [x0, #0x88]
  0x2cb2f9c: ldr      x0, [sp, #0x40]
  0x2cb2fa0: cbz      x0, #0x2cb3304
  0x2cb2fa4: mov      x1, xzr
  0x2cb2fa8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2fac: ldr      x8, [sp, #0x40]
  0x2cb2fb0: cbz      x8, #0x2cb3304
  0x2cb2fb4: mov      x23, x0
  0x2cb2fb8: mov      x0, x8
  0x2cb2fbc: mov      x1, xzr
  0x2cb2fc0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2fc4: cbz      x0, #0x2cb3304
  0x2cb2fc8: str      wzr, [x0, #0x84]
  0x2cb2fcc: cbz      x23, #0x2cb3304
  0x2cb2fd0: str      wzr, [x23, #0x8c]
  0x2cb2fd4: ldr      x0, [sp, #0x38]
  0x2cb2fd8: bl       #0x2cb35a8 ; -> CFormula$$IsIgnoreTurnLimitDamage
  0x2cb2fdc: tbnz     w0, #0, #0x2cb3020
  0x2cb2fe0: adrp     x19, #0x59d4000
  0x2cb2fe4: ldrb     w8, [x19, #0xfc3]
  0x2cb2fe8: cbnz     w8, #0x2cb3000
  0x2cb2fec: adrp     x0, #0x558a000
  0x2cb2ff0: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb2ff4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2ff8: mov      w8, #1
  0x2cb2ffc: strb     w8, [x19, #0xfc3]
  0x2cb3000: adrp     x8, #0x558a000
  0x2cb3004: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb3008: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2cb300c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2cb3010: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3014: cbz      x8, #0x2cb3304
  0x2cb3018: ldrb     w8, [x8, #0x35]
  0x2cb301c: cbz      w8, #0x2cb3264
  0x2cb3020: ldr      x0, [sp, #0x40]
  0x2cb3024: cbz      x0, #0x2cb3304
  0x2cb3028: mov      x1, xzr
  0x2cb302c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3030: cbz      x0, #0x2cb3304
  0x2cb3034: ldr      w8, [x0, #0x8c]
  0x2cb3038: ldr      w9, [x22, #0x68]
  0x2cb303c: add      w8, w9, w8
  0x2cb3040: str      w8, [x0, #0x8c]
  0x2cb3044: ldr      x0, [sp, #0x40]
  0x2cb3048: cbz      x0, #0x2cb3304
  0x2cb304c: mov      x1, xzr
  0x2cb3050: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3054: cbz      x0, #0x2cb3304
  0x2cb3058: ldr      x8, [sp, #0x40]
  0x2cb305c: cbz      x8, #0x2cb3304
  0x2cb3060: ldr      w19, [x0, #0x8c]
  0x2cb3064: mov      x0, x8
  0x2cb3068: mov      x1, xzr
  0x2cb306c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3070: cbz      x0, #0x2cb3304
  0x2cb3074: ldr      w8, [x0, #0x88]
  0x2cb3078: cmp      w19, w8
  0x2cb307c: b.lt     #0x2cb3144
  0x2cb3080: ldr      x0, [sp, #0x40]
  0x2cb3084: cbz      x0, #0x2cb3304
  0x2cb3088: mov      x1, xzr
  0x2cb308c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3090: cbz      x0, #0x2cb3304
  0x2cb3094: ldr      x8, [sp, #0x40]
  0x2cb3098: cbz      x8, #0x2cb3304
  0x2cb309c: ldr      w20, [x0, #0x80]
  0x2cb30a0: mov      x0, x8
  0x2cb30a4: mov      x1, xzr
  0x2cb30a8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb30ac: cbz      x0, #0x2cb3304
  0x2cb30b0: ldr      w8, [x0, #0x84]
  0x2cb30b4: ldr      w19, [x27]
  0x2cb30b8: add      w8, w19, w8
  0x2cb30bc: cmp      w20, w8
  0x2cb30c0: b.le     #0x2cb310c
  0x2cb30c4: ldr      x0, [sp, #0x40]
  0x2cb30c8: cbz      x0, #0x2cb3304
  0x2cb30cc: mov      x1, xzr
  0x2cb30d0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb30d4: cbz      x0, #0x2cb3304
  0x2cb30d8: ldr      x8, [sp, #0x40]
  0x2cb30dc: cbz      x8, #0x2cb3304
  0x2cb30e0: ldr      w20, [x0, #0x80]
  0x2cb30e4: mov      x0, x8
  0x2cb30e8: mov      x1, xzr
  0x2cb30ec: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb30f0: cbz      x0, #0x2cb3304
  0x2cb30f4: ldr      w8, [x0, #0x84]
  0x2cb30f8: ldr      w9, [x27]
  0x2cb30fc: add      w10, w20, w19
  0x2cb3100: sub      w8, w10, w8
  0x2cb3104: sub      w8, w8, w9
  0x2cb3108: str      w8, [x27]
  0x2cb310c: ldr      x0, [sp, #0x40]
  0x2cb3110: cbz      x0, #0x2cb3304
  0x2cb3114: mov      x1, xzr
  0x2cb3118: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb311c: ldr      x8, [sp, #0x40]
  0x2cb3120: cbz      x8, #0x2cb3304
  0x2cb3124: mov      x22, x0
  0x2cb3128: mov      x0, x8
  0x2cb312c: mov      x1, xzr
  0x2cb3130: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3134: cbz      x0, #0x2cb3304
  0x2cb3138: str      wzr, [x0, #0x88]
  0x2cb313c: cbz      x22, #0x2cb3304
  0x2cb3140: str      wzr, [x22, #0x80]
  0x2cb3144: ldr      x0, [sp, #0x40]
  0x2cb3148: cbz      x0, #0x2cb3304
  0x2cb314c: mov      x1, xzr
  0x2cb3150: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3154: cbz      x0, #0x2cb3304
  0x2cb3158: ldr      w8, [x0, #0x84]
  0x2cb315c: ldr      w9, [x27]
  0x2cb3160: add      w8, w9, w8
  0x2cb3164: str      w8, [x0, #0x84]
  0x2cb3168: ldr      x8, [sp, #0x38]
  0x2cb316c: cbz      x8, #0x2cb3304
  0x2cb3170: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2cb3174: cbz      x0, #0x2cb3304
  0x2cb3178: ldr      w22, [x27]
  0x2cb317c: mov      x1, xzr
  0x2cb3180: bl       #0x2902510 ; -> CCharacterData$$get_Vampiric
  0x2cb3184: adrp     x8, #0x558a000
  0x2cb3188: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb318c: mov      w23, w0
  0x2cb3190: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3194: ldr      w9, [x8, #0xe0]
  0x2cb3198: cbnz     w9, #0x2cb31a4
  0x2cb319c: mov      x0, x8
  0x2cb31a0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb31a4: mov      w0, w22
  0x2cb31a8: mov      w1, w23
  0x2cb31ac: mov      x2, xzr
  0x2cb31b0: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2cb31b4: str      w0, [x28]
  0x2cb31b8: ldr      x8, [sp, #0x40]
  0x2cb31bc: cbz      x8, #0x2cb3304
  0x2cb31c0: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2cb31c4: cbz      x0, #0x2cb3304
  0x2cb31c8: ldr      w20, [x27]
  0x2cb31cc: mov      x1, xzr
  0x2cb31d0: bl       #0x29025ec ; -> CCharacterData$$get_HitHPRecovery
  0x2cb31d4: adrp     x8, #0x106d000
  0x2cb31d8: adrp     x19, #0x59d5000
  0x2cb31dc: ldrb     w9, [x19, #8]
  0x2cb31e0: ldr      s8, [x8, #0x898] ; = 0.0010000000474974513 (f32 @ 0x106d898)
  0x2cb31e4: mul      w8, w0, w20
  0x2cb31e8: scvtf    s9, w8
  0x2cb31ec: cbnz     w9, #0x2cb3204
  0x2cb31f0: adrp     x0, #0x5588000
  0x2cb31f4: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb31f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb31fc: mov      w8, #1
  0x2cb3200: strb     w8, [x19, #8]
  0x2cb3204: adrp     x8, #0x5588000
  0x2cb3208: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb320c: fmul     s8, s9, s8
  0x2cb3210: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x2cb3214: ldr      w8, [x0, #0xe0]
  0x2cb3218: cbnz     w8, #0x2cb3220
  0x2cb321c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3220: mov      w8, #0x7f800000
  0x2cb3224: frintm   s0, s8
  0x2cb3228: fmov     s1, w8
  0x2cb322c: fcvtms   w9, s8
  0x2cb3230: fcmp     s0, s1
  0x2cb3234: mov      w8, #-0xffffffff80000000
  0x2cb3238: csel     w8, w8, w9, eq
  0x2cb323c: str      w8, [x21]
  0x2cb3240: ldp      x20, x19, [sp, #0xb0]
  0x2cb3244: ldp      x22, x21, [sp, #0xa0]
  0x2cb3248: ldp      x24, x23, [sp, #0x90]
  0x2cb324c: ldp      x26, x25, [sp, #0x80]
  0x2cb3250: ldp      x28, x27, [sp, #0x70]
  0x2cb3254: ldp      x29, x30, [sp, #0x60]
  0x2cb3258: ldp      d9, d8, [sp, #0x50]
  0x2cb325c: add      sp, sp, #0xc0
  0x2cb3260: ret      
  0x2cb3264: ldr      x0, [sp, #0x40]
  0x2cb3268: cbz      x0, #0x2cb3304
  0x2cb326c: ldr      w8, [x0, #0x2ec]
  0x2cb3270: cmn      w8, #1
  0x2cb3274: b.eq     #0x2cb3020
  0x2cb3278: mov      x1, xzr
  0x2cb327c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3280: cbz      x0, #0x2cb3304
  0x2cb3284: ldr      w8, [x0, #0x90]
  0x2cb3288: cmn      w8, #1
  0x2cb328c: b.ne     #0x2cb3020
  0x2cb3290: ldr      x0, [sp, #0x40]
  0x2cb3294: cbz      x0, #0x2cb3304
  0x2cb3298: ldr      w19, [x0, #0x2ec]
  0x2cb329c: ldr      w20, [x0, #0x2f0]
  0x2cb32a0: mov      x1, xzr
  0x2cb32a4: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb32a8: cbz      x0, #0x2cb3304
  0x2cb32ac: ldr      w8, [x0, #0x80]
  0x2cb32b0: sub      w9, w19, w20
  0x2cb32b4: ldr      x0, [sp, #0x40]
  0x2cb32b8: bic      w9, w9, w9, asr #31
  0x2cb32bc: cmp      w9, w8
  0x2cb32c0: csel     w23, w9, w8, lt
  0x2cb32c4: mov      w1, w23
  0x2cb32c8: bl       #0x2cb36fc ; -> CFormula$$CalcCharacterSharedDamage
  0x2cb32cc: ldr      x8, [sp, #0x40]
  0x2cb32d0: cbz      x8, #0x2cb3304
  0x2cb32d4: mov      w24, w0
  0x2cb32d8: mov      x0, x8
  0x2cb32dc: mov      x1, xzr
  0x2cb32e0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb32e4: cbz      x0, #0x2cb3304
  0x2cb32e8: str      w24, [x0, #0x90]
  0x2cb32ec: ldr      x8, [sp, #0x40]
  0x2cb32f0: cbz      x8, #0x2cb3304
  0x2cb32f4: ldr      w9, [x8, #0x2f0]
  0x2cb32f8: add      w9, w9, w23
  0x2cb32fc: str      w9, [x8, #0x2f0]
  0x2cb3300: b        #0x2cb3020
  0x2cb3304: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3308: bl       #0x21afc20 ; -> ??? 0x21afc20
