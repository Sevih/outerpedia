; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ProcessDamageOverTime @ 0x2313894..0x2314828 (taille 3988 octets) =====
  0x2313894: sub      sp, sp, #0xe0
  0x2313898: stp      x29, x30, [sp, #0x80]
  0x231389c: stp      x28, x27, [sp, #0x90]
  0x23138a0: stp      x26, x25, [sp, #0xa0]
  0x23138a4: stp      x24, x23, [sp, #0xb0]
  0x23138a8: stp      x22, x21, [sp, #0xc0]
  0x23138ac: stp      x20, x19, [sp, #0xd0]
  0x23138b0: adrp     x20, #0x59d4000
  0x23138b4: ldrb     w8, [x20, #0xf8f]
  0x23138b8: mov      x19, x3
  0x23138bc: mov      w22, w2
  0x23138c0: mov      w24, w1
  0x23138c4: mov      x25, x0
  0x23138c8: tbnz     w8, #0, #0x23139ac
  0x23138cc: adrp     x0, #0x558a000
  0x23138d0: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x23138d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23138d8: adrp     x0, #0x5589000
  0x23138dc: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x23138e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23138e4: adrp     x0, #0x558a000
  0x23138e8: ldr      x0, [x0, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x23138ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23138f0: adrp     x0, #0x558a000
  0x23138f4: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x23138f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23138fc: adrp     x0, #0x558a000
  0x2313900: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2313904: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313908: adrp     x0, #0x558a000
  0x231390c: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2313910: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313914: adrp     x0, #0x558a000
  0x2313918: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x231391c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313920: adrp     x0, #0x558a000
  0x2313924: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2313928: bl       #0x21af97c ; -> ??? 0x21af97c
  0x231392c: adrp     x0, #0x558a000
  0x2313930: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x2313934: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313938: adrp     x0, #0x558a000
  0x231393c: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x2313940: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313944: adrp     x0, #0x558a000
  0x2313948: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x231394c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313950: adrp     x0, #0x558a000
  0x2313954: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2313958: bl       #0x21af97c ; -> ??? 0x21af97c
  0x231395c: adrp     x0, #0x558a000
  0x2313960: ldr      x0, [x0, #0x428] ; = 0x0 (u64 @ 0x558a428)
  0x2313964: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313968: adrp     x0, #0x558a000
  0x231396c: ldr      x0, [x0, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x2313970: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313974: adrp     x0, #0x5587000
  0x2313978: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x231397c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313980: adrp     x0, #0x558a000
  0x2313984: ldr      x0, [x0, #0x440] ; = 0x0 (u64 @ 0x558a440)
  0x2313988: bl       #0x21af97c ; -> ??? 0x21af97c
  0x231398c: adrp     x0, #0x558a000
  0x2313990: ldr      x0, [x0, #0x6e0] ; = 0x0 (u64 @ 0x558a6e0)
  0x2313994: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2313998: adrp     x0, #0x558a000
  0x231399c: ldr      x0, [x0, #0x470] ; = 0x0 (u64 @ 0x558a470)
  0x23139a0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23139a4: mov      w8, #1
  0x23139a8: strb     w8, [x20, #0xf8f]
  0x23139ac: str      xzr, [sp, #0x70]
  0x23139b0: stp      xzr, xzr, [sp, #0x50]
  0x23139b4: str      xzr, [sp, #0x60]
  0x23139b8: stp      xzr, xzr, [sp, #0x30]
  0x23139bc: str      xzr, [sp, #0x40]
  0x23139c0: cbz      x25, #0x231477c
  0x23139c4: ldp      x20, x1, [x25, #0x18]
  0x23139c8: adrp     x28, #0x5587000
  0x23139cc: ldr      x28, [x28, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x23139d0: add      x8, sp, #0x70
  0x23139d4: add      x0, x8, #8
  0x23139d8: str      x1, [sp, #0x78]
  0x23139dc: bl       #0x21af920 ; -> ??? 0x21af920
  0x23139e0: mov      x0, x25
  0x23139e4: mov      x1, xzr
  0x23139e8: bl       #0x2320198 ; -> CBuff$$get_Type
  0x23139ec: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x23139f0: mov      w21, w0
  0x23139f4: ldr      w9, [x8, #0xe0]
  0x23139f8: cbnz     w9, #0x2313a04
  0x23139fc: mov      x0, x8
  0x2313a00: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313a04: mov      x0, xzr
  0x2313a08: mov      x1, x20
  0x2313a0c: mov      x2, xzr
  0x2313a10: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2313a14: tbnz     w0, #0, #0x2313a40
  0x2313a18: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x2313a1c: ldr      x23, [sp, #0x78]
  0x2313a20: ldr      w8, [x0, #0xe0]
  0x2313a24: cbnz     w8, #0x2313a2c
  0x2313a28: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313a2c: mov      x0, xzr
  0x2313a30: mov      x1, x23
  0x2313a34: mov      x2, xzr
  0x2313a38: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2313a3c: tbz      w0, #0, #0x2313a48
  0x2313a40: mov      w0, wzr
  0x2313a44: b        #0x231475c
  0x2313a48: add      x0, sp, #0x70
  0x2313a4c: mov      x1, xzr
  0x2313a50: str      xzr, [sp, #0x70]
  0x2313a54: bl       #0x21af920 ; -> ??? 0x21af920
  0x2313a58: sub      w8, w21, #0x38
  0x2313a5c: cmp      w8, #6
  0x2313a60: b.hi     #0x2313dd0
  0x2313a64: adrp     x9, #0x106d000
  0x2313a68: add      x9, x9, #0x91a
  0x2313a6c: adr      x10, #0x2313a7c
  0x2313a70: ldrh     w11, [x9, x8, lsl #1]
  0x2313a74: add      x10, x10, x11, lsl #2
  0x2313a78: br       x10
  0x2313a7c: ldr      x0, [sp, #0x78]
  0x2313a80: cbz      x0, #0x231477c
  0x2313a84: mov      w1, #0x38
  0x2313a88: mov      x2, xzr
  0x2313a8c: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313a90: cbz      x20, #0x231477c
  0x2313a94: mov      w23, w0
  0x2313a98: ldr      x0, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2313a9c: cbz      x0, #0x231477c
  0x2313aa0: mov      x1, xzr
  0x2313aa4: bl       #0x2901f0c ; -> CCharacterData$$get_Atk
  0x2313aa8: adrp     x8, #0x558a000
  0x2313aac: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313ab0: mov      w25, w0
  0x2313ab4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313ab8: ldr      w9, [x8, #0xe0]
  0x2313abc: cbnz     w9, #0x2313ac8
  0x2313ac0: mov      x0, x8
  0x2313ac4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313ac8: mov      w0, w24
  0x2313acc: mov      w1, w23
  0x2313ad0: mov      x2, xzr
  0x2313ad4: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313ad8: mov      w1, w0
  0x2313adc: mov      w0, w25
  0x2313ae0: mov      x2, xzr
  0x2313ae4: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2313ae8: adrp     x8, #0x558a000
  0x2313aec: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2313af0: mov      w23, w0
  0x2313af4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313af8: ldr      w9, [x8, #0xe0]
  0x2313afc: cbnz     w9, #0x2313b08
  0x2313b00: mov      x0, x8
  0x2313b04: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313b08: mov      x0, xzr
  0x2313b0c: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2313b10: cbz      x0, #0x231477c
  0x2313b14: mul      w23, w23, w22
  0x2313b18: mov      w1, #0x22
  0x2313b1c: b        #0x23141e8
  0x2313b20: ldr      x0, [sp, #0x78]
  0x2313b24: cbz      x0, #0x231477c
  0x2313b28: mov      w1, #0x3c
  0x2313b2c: mov      x2, xzr
  0x2313b30: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313b34: ldr      x8, [sp, #0x78]
  0x2313b38: cbz      x8, #0x231477c
  0x2313b3c: adrp     x9, #0x558a000
  0x2313b40: ldr      x9, [x9, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313b44: mov      w25, w0
  0x2313b48: ldr      x23, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2313b4c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x2313b50: ldr      w9, [x0, #0xe0]
  0x2313b54: cbnz     w9, #0x2313b5c
  0x2313b58: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313b5c: mov      w0, w24
  0x2313b60: mov      w1, w25
  0x2313b64: mov      x2, xzr
  0x2313b68: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313b6c: cbz      x23, #0x231477c
  0x2313b70: mov      w2, w0
  0x2313b74: mov      w1, #1
  0x2313b78: mov      x0, x23
  0x2313b7c: mov      x3, xzr
  0x2313b80: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2313b84: ldr      x8, [sp, #0x78]
  0x2313b88: cbz      x8, #0x231477c
  0x2313b8c: mov      w23, w0
  0x2313b90: mov      w1, #0x4d
  0x2313b94: mov      x0, x8
  0x2313b98: mov      x2, xzr
  0x2313b9c: bl       #0x2819f2c ; -> CCharacterBattle$$GetBuffListByType
  0x2313ba0: cbz      x0, #0x231477c
  0x2313ba4: adrp     x8, #0x558a000
  0x2313ba8: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2313bac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313bb0: add      x8, sp, #0x18
  0x2313bb4: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2313bb8: ldur     q0, [sp, #0x18]
  0x2313bbc: ldr      x8, [sp, #0x28]
  0x2313bc0: adrp     x24, #0x558a000
  0x2313bc4: str      q0, [sp, #0x50]
  0x2313bc8: str      x8, [sp, #0x60]
  0x2313bcc: ldr      x24, [x24, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2313bd0: mov      w25, w23
  0x2313bd4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2313bd8: add      x0, sp, #0x50
  0x2313bdc: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2313be0: tbz      w0, #0, #0x2314050
  0x2313be4: ldr      x23, [sp, #0x60]
  0x2313be8: cbz      x23, #0x2313bd4
  0x2313bec: mov      x0, x23
  0x2313bf0: mov      x1, xzr
  0x2313bf4: mov      x2, xzr
  0x2313bf8: bl       #0x23228c0 ; -> CBuff$$CheckCondition
  0x2313bfc: tbz      w0, #0, #0x2313bd4
  0x2313c00: mov      x0, x23
  0x2313c04: mov      x1, xzr
  0x2313c08: bl       #0x232036c ; -> CBuff$$get_Value
  0x2313c0c: cmp      w25, w0
  0x2313c10: b.le     #0x2313bd4
  0x2313c14: mov      x0, x23
  0x2313c18: mov      x1, xzr
  0x2313c1c: bl       #0x232036c ; -> CBuff$$get_Value
  0x2313c20: mov      w23, w0
  0x2313c24: b        #0x2313bd0
  0x2313c28: mov      x0, x25
  0x2313c2c: mov      x1, xzr
  0x2313c30: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313c34: cbz      w0, #0x23143cc
  0x2313c38: ldr      x0, [sp, #0x78]
  0x2313c3c: cbz      x0, #0x231477c
  0x2313c40: mov      w1, #0x3a
  0x2313c44: mov      x2, xzr
  0x2313c48: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313c4c: adrp     x8, #0x558a000
  0x2313c50: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313c54: ldr      x23, [sp, #0x78]
  0x2313c58: mov      w26, w0
  0x2313c5c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313c60: ldr      w9, [x8, #0xe0]
  0x2313c64: cbnz     w9, #0x2313c70
  0x2313c68: mov      x0, x8
  0x2313c6c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313c70: mov      w0, w24
  0x2313c74: mov      w1, w26
  0x2313c78: mov      x2, xzr
  0x2313c7c: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313c80: cbz      x20, #0x231477c
  0x2313c84: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2313c88: mov      w24, w0
  0x2313c8c: mov      x0, x25
  0x2313c90: mov      x1, xzr
  0x2313c94: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313c98: cbz      x26, #0x231477c
  0x2313c9c: mov      w1, w0
  0x2313ca0: mov      x0, x26
  0x2313ca4: mov      x2, xzr
  0x2313ca8: bl       #0x29032d0 ; -> CCharacterData$$GetStatValue
  0x2313cac: mov      w3, w0
  0x2313cb0: mov      x0, x20
  0x2313cb4: mov      x1, x23
  0x2313cb8: mov      w2, w24
  0x2313cbc: mov      x4, xzr
  0x2313cc0: bl       #0x2cb3bf0 ; -> CFormula$$CalcDamageDOT
  0x2313cc4: adrp     x8, #0x558a000
  0x2313cc8: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2313ccc: mov      w23, w0
  0x2313cd0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313cd4: ldr      w9, [x8, #0xe0]
  0x2313cd8: cbnz     w9, #0x2313ce4
  0x2313cdc: mov      x0, x8
  0x2313ce0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313ce4: mov      x0, xzr
  0x2313ce8: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2313cec: cbz      x0, #0x231477c
  0x2313cf0: mul      w23, w23, w22
  0x2313cf4: mov      w1, #0x24
  0x2313cf8: b        #0x23141e8
  0x2313cfc: mov      x0, x25
  0x2313d00: mov      x1, xzr
  0x2313d04: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313d08: cbz      w0, #0x23143cc
  0x2313d0c: ldr      x0, [sp, #0x78]
  0x2313d10: cbz      x0, #0x231477c
  0x2313d14: mov      w1, #0x3b
  0x2313d18: mov      x2, xzr
  0x2313d1c: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313d20: adrp     x8, #0x558a000
  0x2313d24: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313d28: ldr      x23, [sp, #0x78]
  0x2313d2c: mov      w26, w0
  0x2313d30: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313d34: ldr      w9, [x8, #0xe0]
  0x2313d38: cbnz     w9, #0x2313d44
  0x2313d3c: mov      x0, x8
  0x2313d40: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313d44: mov      w0, w24
  0x2313d48: mov      w1, w26
  0x2313d4c: mov      x2, xzr
  0x2313d50: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313d54: cbz      x20, #0x231477c
  0x2313d58: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2313d5c: mov      w24, w0
  0x2313d60: mov      x0, x25
  0x2313d64: mov      x1, xzr
  0x2313d68: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313d6c: cbz      x26, #0x231477c
  0x2313d70: mov      w1, w0
  0x2313d74: mov      x0, x26
  0x2313d78: mov      x2, xzr
  0x2313d7c: bl       #0x29032d0 ; -> CCharacterData$$GetStatValue
  0x2313d80: mov      w3, w0
  0x2313d84: mov      x0, x20
  0x2313d88: mov      x1, x23
  0x2313d8c: mov      w2, w24
  0x2313d90: mov      x4, xzr
  0x2313d94: bl       #0x2cb3bf0 ; -> CFormula$$CalcDamageDOT
  0x2313d98: adrp     x8, #0x558a000
  0x2313d9c: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2313da0: mov      w23, w0
  0x2313da4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313da8: ldr      w9, [x8, #0xe0]
  0x2313dac: cbnz     w9, #0x2313db8
  0x2313db0: mov      x0, x8
  0x2313db4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313db8: mov      x0, xzr
  0x2313dbc: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2313dc0: cbz      x0, #0x231477c
  0x2313dc4: mul      w23, w23, w22
  0x2313dc8: mov      w1, #0x25
  0x2313dcc: b        #0x23141e8
  0x2313dd0: mov      w23, wzr
  0x2313dd4: b        #0x2314200
  0x2313dd8: mov      x0, x25
  0x2313ddc: mov      x1, xzr
  0x2313de0: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313de4: cbz      w0, #0x23143cc
  0x2313de8: ldr      x0, [sp, #0x78]
  0x2313dec: cbz      x0, #0x231477c
  0x2313df0: mov      w1, #0x39
  0x2313df4: mov      x2, xzr
  0x2313df8: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313dfc: adrp     x8, #0x558a000
  0x2313e00: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313e04: ldr      x23, [sp, #0x78]
  0x2313e08: mov      w26, w0
  0x2313e0c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313e10: ldr      w9, [x8, #0xe0]
  0x2313e14: cbnz     w9, #0x2313e20
  0x2313e18: mov      x0, x8
  0x2313e1c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313e20: mov      w0, w24
  0x2313e24: mov      w1, w26
  0x2313e28: mov      x2, xzr
  0x2313e2c: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313e30: cbz      x20, #0x231477c
  0x2313e34: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2313e38: mov      w24, w0
  0x2313e3c: mov      x0, x25
  0x2313e40: mov      x1, xzr
  0x2313e44: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2313e48: cbz      x26, #0x231477c
  0x2313e4c: mov      w1, w0
  0x2313e50: mov      x0, x26
  0x2313e54: mov      x2, xzr
  0x2313e58: bl       #0x29032d0 ; -> CCharacterData$$GetStatValue
  0x2313e5c: mov      w3, w0
  0x2313e60: mov      x0, x20
  0x2313e64: mov      x1, x23
  0x2313e68: mov      w2, w24
  0x2313e6c: mov      x4, xzr
  0x2313e70: bl       #0x2cb3bf0 ; -> CFormula$$CalcDamageDOT
  0x2313e74: adrp     x8, #0x558a000
  0x2313e78: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2313e7c: mov      w23, w0
  0x2313e80: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313e84: ldr      w9, [x8, #0xe0]
  0x2313e88: cbnz     w9, #0x2313e94
  0x2313e8c: mov      x0, x8
  0x2313e90: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313e94: mov      x0, xzr
  0x2313e98: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2313e9c: cbz      x0, #0x231477c
  0x2313ea0: mul      w23, w23, w22
  0x2313ea4: mov      w1, #0x23
  0x2313ea8: b        #0x23141e8
  0x2313eac: ldr      x0, [sp, #0x78]
  0x2313eb0: cbz      x0, #0x231477c
  0x2313eb4: mov      w1, #0x3d
  0x2313eb8: mov      x2, xzr
  0x2313ebc: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2313ec0: cbz      x20, #0x231477c
  0x2313ec4: mov      w23, w0
  0x2313ec8: ldr      x0, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2313ecc: cbz      x0, #0x231477c
  0x2313ed0: mov      w1, #0xf
  0x2313ed4: mov      x2, xzr
  0x2313ed8: bl       #0x2908f38 ; -> CCharacterData$$GetFinalStat
  0x2313edc: adrp     x8, #0x558a000
  0x2313ee0: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2313ee4: mov      w26, w0
  0x2313ee8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313eec: ldr      w9, [x8, #0xe0]
  0x2313ef0: cbnz     w9, #0x2313efc
  0x2313ef4: mov      x0, x8
  0x2313ef8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313efc: mov      w0, w24
  0x2313f00: mov      w1, w23
  0x2313f04: mov      x2, xzr
  0x2313f08: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2313f0c: mov      w1, w0
  0x2313f10: mov      w0, w26
  0x2313f14: mov      x2, xzr
  0x2313f18: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2313f1c: adrp     x8, #0x558a000
  0x2313f20: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2313f24: mov      w23, w0
  0x2313f28: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313f2c: ldr      w9, [x8, #0xe0]
  0x2313f30: cbnz     w9, #0x2313f3c
  0x2313f34: mov      x0, x8
  0x2313f38: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313f3c: mov      x0, xzr
  0x2313f40: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2313f44: cbz      x0, #0x231477c
  0x2313f48: mov      w1, #0x27
  0x2313f4c: mov      x2, xzr
  0x2313f50: bl       #0x2625a28 ; -> CTempletManager$$GetDamageTypeTemplet
  0x2313f54: mov      x1, x0
  0x2313f58: str      x0, [sp, #0x70]
  0x2313f5c: add      x0, sp, #0x70
  0x2313f60: bl       #0x21af920 ; -> ??? 0x21af920
  0x2313f64: mov      x0, x20
  0x2313f68: mov      x1, xzr
  0x2313f6c: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2313f70: cbz      x0, #0x231477c
  0x2313f74: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x2313f78: cbz      x0, #0x231477c
  0x2313f7c: adrp     x8, #0x558a000
  0x2313f80: ldr      x8, [x8, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2313f84: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2313f88: mul      w8, w23, w22
  0x2313f8c: str      w8, [sp, #0x14]
  0x2313f90: add      x8, sp, #0x18
  0x2313f94: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2313f98: ldur     q0, [sp, #0x18]
  0x2313f9c: ldr      x8, [sp, #0x28]
  0x2313fa0: adrp     x29, #0x558a000
  0x2313fa4: ldr      x29, [x29, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2313fa8: str      q0, [sp, #0x30]
  0x2313fac: str      x8, [sp, #0x40]
  0x2313fb0: adrp     x26, #0x558a000
  0x2313fb4: ldr      x26, [x26, #0x6e8] ; = 0x0 (u64 @ 0x558a6e8)
  0x2313fb8: adrp     x23, #0x59d4000
  0x2313fbc: ldr      x1, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x2313fc0: add      x0, sp, #0x30
  0x2313fc4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2313fc8: tbz      w0, #0, #0x2314094
  0x2313fcc: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x2313fd0: ldr      x27, [sp, #0x40]
  0x2313fd4: ldr      w8, [x0, #0xe0]
  0x2313fd8: cbnz     w8, #0x2313fe0
  0x2313fdc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2313fe0: mov      x0, x27
  0x2313fe4: mov      x1, xzr
  0x2313fe8: mov      x2, xzr
  0x2313fec: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2313ff0: tbz      w0, #0, #0x2313fbc
  0x2313ff4: cbz      x27, #0x23140b0
  0x2313ff8: mov      x0, x27
  0x2313ffc: mov      x1, xzr
  0x2314000: bl       #0x282abcc ; -> CCharacterBattle$$GetDot2000092ActionGaugeEnhanceValue
  0x2314004: mul      w1, w0, w22
  0x2314008: mov      w2, #1
  0x231400c: mov      x0, x27
  0x2314010: mov      x3, xzr
  0x2314014: bl       #0x280e238 ; -> CCharacterBattle$$AddActionPoint
  0x2314018: ldrb     w8, [x23, #0xfcb]
  0x231401c: cbnz     w8, #0x2314030
  0x2314020: mov      x0, x26
  0x2314024: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2314028: mov      w8, #1
  0x231402c: strb     w8, [x23, #0xfcb]
  0x2314030: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x2314034: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2314038: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x231403c: cbz      x0, #0x23140b4
  0x2314040: mov      x1, x27
  0x2314044: mov      x2, xzr
  0x2314048: bl       #0x28f9e48 ; -> CHudTurnSequencePanel$$JumpIcon
  0x231404c: b        #0x2313fbc
  0x2314050: adrp     x8, #0x558a000
  0x2314054: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2314058: add      x0, sp, #0x50
  0x231405c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314060: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314064: adrp     x8, #0x558a000
  0x2314068: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x231406c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314070: ldr      w8, [x0, #0xe0]
  0x2314074: cbnz     w8, #0x231407c
  0x2314078: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x231407c: mov      x0, xzr
  0x2314080: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2314084: cbz      x0, #0x231477c
  0x2314088: mul      w23, w25, w22
  0x231408c: mov      w1, #0x26
  0x2314090: b        #0x23141e8
  0x2314094: adrp     x8, #0x558a000
  0x2314098: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x231409c: add      x0, sp, #0x30
  0x23140a0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23140a4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23140a8: ldr      w23, [sp, #0x14]
  0x23140ac: b        #0x2314200
  0x23140b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23140b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23140b8: b        #0x23147b4
  0x23140bc: b        #0x23140e4
  0x23140c0: b        #0x23147b4
  0x23140c4: b        #0x23140e4
  0x23140c8: b        #0x23140e4
  0x23140cc: b        #0x23140e4
  0x23140d0: b        #0x23140e4
  0x23140d4: b        #0x23140e4
  0x23140d8: b        #0x23140e4
  0x23140dc: b        #0x23147b4
  0x23140e0: b        #0x23140e4
  0x23140e4: mov      x23, x0
  0x23140e8: cmp      w1, #1
  0x23140ec: b.ne     #0x2314780
  0x23140f0: mov      x0, x23
  0x23140f4: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x23140f8: ldr      x26, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x23140fc: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2314100: adrp     x8, #0x558a000
  0x2314104: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2314108: add      x0, sp, #0x30
  0x231410c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314110: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314114: cbnz     x26, #0x2314788
  0x2314118: mov      x0, x25
  0x231411c: mov      x1, xzr
  0x2314120: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2314124: cbz      w0, #0x23143cc
  0x2314128: ldr      x0, [sp, #0x78]
  0x231412c: cbz      x0, #0x231477c
  0x2314130: mov      w1, #0x3e
  0x2314134: mov      x2, xzr
  0x2314138: bl       #0x282a928 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x231413c: adrp     x8, #0x558a000
  0x2314140: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2314144: ldr      x23, [sp, #0x78]
  0x2314148: mov      w26, w0
  0x231414c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314150: ldr      w9, [x8, #0xe0]
  0x2314154: cbnz     w9, #0x2314160
  0x2314158: mov      x0, x8
  0x231415c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2314160: mov      w0, w24
  0x2314164: mov      w1, w26
  0x2314168: mov      x2, xzr
  0x231416c: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2314170: cbz      x20, #0x231477c
  0x2314174: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59d4028)
  0x2314178: mov      w24, w0
  0x231417c: mov      x0, x25
  0x2314180: mov      x1, xzr
  0x2314184: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2314188: cbz      x26, #0x231477c
  0x231418c: mov      w1, w0
  0x2314190: mov      x0, x26
  0x2314194: mov      x2, xzr
  0x2314198: bl       #0x29032d0 ; -> CCharacterData$$GetStatValue
  0x231419c: mov      w3, w0
  0x23141a0: mov      x0, x20
  0x23141a4: mov      x1, x23
  0x23141a8: mov      w2, w24
  0x23141ac: mov      x4, xzr
  0x23141b0: bl       #0x2cb3bf0 ; -> CFormula$$CalcDamageDOT
  0x23141b4: adrp     x8, #0x558a000
  0x23141b8: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x23141bc: mov      w23, w0
  0x23141c0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23141c4: ldr      w9, [x8, #0xe0]
  0x23141c8: cbnz     w9, #0x23141d4
  0x23141cc: mov      x0, x8
  0x23141d0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23141d4: mov      x0, xzr
  0x23141d8: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x23141dc: cbz      x0, #0x231477c
  0x23141e0: mul      w23, w23, w22
  0x23141e4: mov      w1, #0x28
  0x23141e8: mov      x2, xzr
  0x23141ec: bl       #0x2625a28 ; -> CTempletManager$$GetDamageTypeTemplet
  0x23141f0: mov      x1, x0
  0x23141f4: str      x0, [sp, #0x70]
  0x23141f8: add      x0, sp, #0x70
  0x23141fc: bl       #0x21af920 ; -> ??? 0x21af920
  0x2314200: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x2314204: ldr      w8, [x0, #0xe0]
  0x2314208: cbnz     w8, #0x2314210
  0x231420c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2314210: mov      x0, x19
  0x2314214: mov      x1, xzr
  0x2314218: mov      x2, xzr
  0x231421c: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2314220: tbz      w0, #0, #0x2314238
  0x2314224: ldr      x0, [sp, #0x78]
  0x2314228: mov      w1, w21
  0x231422c: mov      w2, w23
  0x2314230: bl       #0x2314828 ; -> CBattleManager$$ApplyImmediatelyDotDamageCap
  0x2314234: mov      w23, w0
  0x2314238: ldr      x0, [sp, #0x78]
  0x231423c: cbz      x0, #0x231477c
  0x2314240: mov      w1, #3
  0x2314244: mov      x2, xzr
  0x2314248: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x231424c: cbz      x0, #0x23142b4
  0x2314250: adrp     x8, #0x558a000
  0x2314254: ldr      x20, [sp, #0x78]
  0x2314258: ldr      x8, [x8, #0x440] ; = 0x0 (u64 @ 0x558a440)
  0x231425c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314260: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2314264: adrp     x8, #0x558a000
  0x2314268: ldr      x8, [x8, #0x470] ; = 0x0 (u64 @ 0x558a470)
  0x231426c: mov      x2, xzr
  0x2314270: mov      x21, x0
  0x2314274: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314278: bl       #0x25e8dd0 ; -> Symbol$$.ctor
  0x231427c: cbz      x20, #0x231477c
  0x2314280: mov      x0, x20
  0x2314284: mov      x1, xzr
  0x2314288: mov      x2, xzr
  0x231428c: mov      x3, x21
  0x2314290: mov      w4, wzr
  0x2314294: mov      w5, wzr
  0x2314298: mov      w6, wzr
  0x231429c: mov      w7, wzr
  0x23142a0: str      xzr, [sp]
  0x23142a4: bl       #0x280ee60 ; -> CCharacterBattle$$PlayBuffEffect
  0x23142a8: mov      w21, wzr
  0x23142ac: mov      w23, wzr
  0x23142b0: b        #0x2314400
  0x23142b4: cmp      w23, #1
  0x23142b8: b.lt     #0x23143fc
  0x23142bc: ldr      x0, [sp, #0x78]
  0x23142c0: cbz      x0, #0x231477c
  0x23142c4: neg      w1, w23
  0x23142c8: mov      w2, wzr
  0x23142cc: mov      w3, wzr
  0x23142d0: mov      w4, wzr
  0x23142d4: mov      x5, xzr
  0x23142d8: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x23142dc: adrp     x21, #0x59d4000
  0x23142e0: ldrb     w8, [x21, #0xfc3]
  0x23142e4: cbnz     w8, #0x23142fc
  0x23142e8: adrp     x0, #0x558a000
  0x23142ec: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23142f0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23142f4: mov      w8, #1
  0x23142f8: strb     w8, [x21, #0xfc3]
  0x23142fc: adrp     x8, #0x558a000
  0x2314300: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2314304: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314308: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x231430c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314310: cbz      x8, #0x231477c
  0x2314314: ldr      x0, [sp, #0x78]
  0x2314318: cbz      x0, #0x231477c
  0x231431c: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x558a068)
  0x2314320: mov      x1, xzr
  0x2314324: bl       #0x5034840 ; -> UnityEngine.Component$$get_transform
  0x2314328: cbz      x21, #0x231477c
  0x231432c: mov      x4, x0
  0x2314330: mov      x0, x21
  0x2314334: mov      w1, w23
  0x2314338: mov      w2, wzr
  0x231433c: mov      w3, wzr
  0x2314340: mov      w5, wzr
  0x2314344: mov      x6, xzr
  0x2314348: bl       #0x28fc644 ; -> CUIHud$$PlayHudTextDamage
  0x231434c: cbz      x20, #0x231477c
  0x2314350: mov      x0, x20
  0x2314354: mov      x1, xzr
  0x2314358: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x231435c: mov      x21, x0
  0x2314360: mov      x0, x20
  0x2314364: mov      x1, xzr
  0x2314368: bl       #0x270d244 ; -> CCharacter$$get_UID
  0x231436c: cbz      x21, #0x231477c
  0x2314370: mov      x1, x0
  0x2314374: mov      x0, x21
  0x2314378: mov      w2, w23
  0x231437c: mov      x3, xzr
  0x2314380: bl       #0x258cec8 ; -> CTeam$$AddTotalHit
  0x2314384: ldr      x0, [sp, #0x78]
  0x2314388: cbz      x0, #0x231477c
  0x231438c: mov      x1, xzr
  0x2314390: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2314394: ldr      x8, [sp, #0x78]
  0x2314398: cbz      x8, #0x231477c
  0x231439c: mov      x20, x0
  0x23143a0: mov      x0, x8
  0x23143a4: mov      x1, xzr
  0x23143a8: bl       #0x270d244 ; -> CCharacter$$get_UID
  0x23143ac: cbz      x20, #0x231477c
  0x23143b0: mov      x1, x0
  0x23143b4: mov      x0, x20
  0x23143b8: mov      w2, w23
  0x23143bc: mov      x3, xzr
  0x23143c0: bl       #0x258cf6c ; -> CTeam$$AddTotalDamage
  0x23143c4: mov      w21, #1
  0x23143c8: b        #0x2314400
  0x23143cc: adrp     x8, #0x5589000
  0x23143d0: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x23143d4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x23143d8: ldr      w8, [x0, #0xe0]
  0x23143dc: cbnz     w8, #0x23143e4
  0x23143e0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23143e4: adrp     x8, #0x558a000
  0x23143e8: ldr      x8, [x8, #0x6e0] ; = 0x0 (u64 @ 0x558a6e0)
  0x23143ec: mov      x1, xzr
  0x23143f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23143f4: bl       #0x2ca73cc ; -> CDebug$$LogError
  0x23143f8: b        #0x2313a40
  0x23143fc: mov      w21, wzr
  0x2314400: ldr      x0, [sp, #0x78]
  0x2314404: cbz      x0, #0x231477c
  0x2314408: mov      x1, xzr
  0x231440c: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2314410: cbnz     w0, #0x2314484
  0x2314414: ldr      x0, [sp, #0x78]
  0x2314418: cbz      x0, #0x231477c
  0x231441c: mov      x1, xzr
  0x2314420: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x2314424: tbz      w0, #0, #0x2314484
  0x2314428: ldr      x0, [sp, #0x78]
  0x231442c: cbz      x0, #0x231477c
  0x2314430: ldrb     w8, [x0, #0x2e8]
  0x2314434: cbnz     w8, #0x2314484
  0x2314438: ldr      x8, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x231443c: mov      w1, wzr
  0x2314440: ldp      x9, x2, [x8, #0x198]
  0x2314444: blr      x9
  0x2314448: ldr      x0, [sp, #0x78]
  0x231444c: cbz      x0, #0x231477c
  0x2314450: ldr      w8, [x0, #0x21c]
  0x2314454: cmp      w8, #1
  0x2314458: b.ne     #0x2314484
  0x231445c: mov      x1, xzr
  0x2314460: bl       #0x280db44 ; -> CCharacterBattle$$get_IsBoss
  0x2314464: tbz      w0, #0, #0x2314484
  0x2314468: ldr      x0, [sp, #0x78]
  0x231446c: cbz      x0, #0x231477c
  0x2314470: mov      x1, xzr
  0x2314474: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2314478: cbz      x0, #0x231477c
  0x231447c: mov      x1, xzr
  0x2314480: bl       #0x2592078 ; -> CTeam$$BossKill
  0x2314484: ldr      x8, [sp, #0x70]
  0x2314488: cbz      x8, #0x231477c
  0x231448c: ldr      x8, [x8, #0x38] ; = 0x0 (u64 @ 0x558a038)
  0x2314490: cbz      x8, #0x231477c
  0x2314494: ldr      w8, [x8, #0x18]
  0x2314498: cmp      w8, #1
  0x231449c: b.lt     #0x2314560
  0x23144a0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x23144a4: ldr      w8, [x0, #0xe0]
  0x23144a8: cbnz     w8, #0x23144b0
  0x23144ac: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23144b0: mov      x0, x19
  0x23144b4: mov      x1, xzr
  0x23144b8: mov      x2, xzr
  0x23144bc: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x23144c0: tbz      w0, #0, #0x23144e0
  0x23144c4: cbz      x19, #0x231477c
  0x23144c8: mov      x0, x19
  0x23144cc: mov      x1, xzr
  0x23144d0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x23144d4: cbz      x0, #0x231477c
  0x23144d8: ldrb     w8, [x0, #0xb7]
  0x23144dc: cbz      w8, #0x2314540
  0x23144e0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x23144e4: ldr      w8, [x0, #0xe0]
  0x23144e8: cbnz     w8, #0x23144f0
  0x23144ec: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23144f0: mov      x0, x19
  0x23144f4: mov      x1, xzr
  0x23144f8: mov      x2, xzr
  0x23144fc: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2314500: tbz      w0, #0, #0x2314560
  0x2314504: ldr      x0, [sp, #0x78]
  0x2314508: cbz      x0, #0x231477c
  0x231450c: mov      x1, xzr
  0x2314510: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2314514: cbz      x0, #0x231477c
  0x2314518: ldrb     w8, [x0, #0xb6]
  0x231451c: cbnz     w8, #0x2314560
  0x2314520: ldr      x0, [sp, #0x78]
  0x2314524: cbz      x0, #0x231477c
  0x2314528: mov      x1, xzr
  0x231452c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2314530: cbz      x0, #0x231477c
  0x2314534: mov      w8, #1
  0x2314538: strb     w8, [x0, #0xb6]
  0x231453c: b        #0x2314558
  0x2314540: mov      x0, x19
  0x2314544: mov      x1, xzr
  0x2314548: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x231454c: cbz      x0, #0x231477c
  0x2314550: mov      w8, #1
  0x2314554: strb     w8, [x0, #0xb7]
  0x2314558: add      x0, sp, #0x70
  0x231455c: bl       #0x23148e4 ; -> CBattleManager$$<ProcessDamageOverTime>g__PlaySE|82_0
  0x2314560: ldr      x0, [sp, #0x70]
  0x2314564: cbz      x0, #0x231477c
  0x2314568: ldr      x8, [x0, #0x50] ; = 0x0 (u64 @ 0x558a050)
  0x231456c: cbz      x8, #0x231477c
  0x2314570: ldr      w8, [x8, #0x18]
  0x2314574: cmp      w8, #1
  0x2314578: b.lt     #0x23145e8
  0x231457c: adrp     x8, #0x558a000
  0x2314580: ldr      x8, [x8, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x2314584: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314588: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x231458c: ldr      x8, [sp, #0x70]
  0x2314590: cbz      x8, #0x231477c
  0x2314594: mov      x20, x0
  0x2314598: ldr      x0, [x8, #0x50] ; = 0x0 (u64 @ 0x558a050)
  0x231459c: cbz      x0, #0x231477c
  0x23145a0: adrp     x8, #0x558a000
  0x23145a4: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x23145a8: mov      w1, wzr
  0x23145ac: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23145b0: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x23145b4: cbz      x20, #0x231477c
  0x23145b8: ldr      x2, [sp, #0x78]
  0x23145bc: mov      x1, x0
  0x23145c0: mov      x0, x20
  0x23145c4: mov      x3, xzr
  0x23145c8: mov      x4, xzr
  0x23145cc: mov      x5, xzr
  0x23145d0: mov      x6, xzr
  0x23145d4: mov      x7, xzr
  0x23145d8: str      xzr, [sp]
  0x23145dc: bl       #0x2be1fc4 ; -> CEffectManager$$Play
  0x23145e0: ldr      x0, [sp, #0x70]
  0x23145e4: cbz      x0, #0x231477c
  0x23145e8: mov      x1, xzr
  0x23145ec: bl       #0x25ee7bc ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x23145f0: fmul     s0, s0, s0
  0x23145f4: fmul     s1, s1, s1
  0x23145f8: adrp     x8, #0x106d000
  0x23145fc: fmov     s4, #-1.00000000
  0x2314600: fadd     s0, s0, s1
  0x2314604: ldr      s1, [x8, #0x5ac] ; = 9.999999439624929e-11 (f32 @ 0x106d5ac)
  0x2314608: fmul     s2, s2, s2
  0x231460c: fadd     s3, s3, s4
  0x2314610: fadd     s0, s2, s0
  0x2314614: fmul     s2, s3, s3
  0x2314618: fadd     s0, s2, s0
  0x231461c: fcmp     s0, s1
  0x2314620: b.mi     #0x2314660
  0x2314624: ldr      x0, [sp, #0x70]
  0x2314628: cbz      x0, #0x231477c
  0x231462c: ldr      s0, [x0, #0x30] ; = 0.0 (f32 @ 0x558a030)
  0x2314630: fcmp     s0, #0.0
  0x2314634: b.eq     #0x2314660
  0x2314638: ldr      x20, [sp, #0x78]
  0x231463c: mov      x1, xzr
  0x2314640: bl       #0x25ee7bc ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x2314644: ldr      x8, [sp, #0x70]
  0x2314648: cbz      x8, #0x231477c
  0x231464c: cbz      x20, #0x231477c
  0x2314650: ldr      s4, [x8, #0x30] ; = 9.625507941059454e-38 (f32 @ 0x106d030)
  0x2314654: mov      x0, x20
  0x2314658: mov      x1, xzr
  0x231465c: bl       #0x2716d2c ; -> CCharacter$$PlayHitLightEffect
  0x2314660: ldr      x0, [sp, #0x78]
  0x2314664: cbz      x0, #0x231477c
  0x2314668: mov      w1, #1
  0x231466c: mov      w2, #1
  0x2314670: mov      x3, xzr
  0x2314674: bl       #0x2716998 ; -> CCharacter$$ChangeDamageReactState
  0x2314678: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x231467c: ldr      w8, [x0, #0xe0]
  0x2314680: cbnz     w8, #0x2314688
  0x2314684: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2314688: mov      x0, x19
  0x231468c: mov      x1, xzr
  0x2314690: mov      x2, xzr
  0x2314694: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2314698: and      w8, w21, w0
  0x231469c: cmp      w8, #1
  0x23146a0: b.ne     #0x2314758
  0x23146a4: adrp     x21, #0x59d4000
  0x23146a8: ldrb     w8, [x21, #0xfc3]
  0x23146ac: cbnz     w8, #0x23146c4
  0x23146b0: adrp     x0, #0x558a000
  0x23146b4: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23146b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23146bc: mov      w8, #1
  0x23146c0: strb     w8, [x21, #0xfc3]
  0x23146c4: adrp     x22, #0x558a000
  0x23146c8: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23146cc: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x23146d0: ldr      x8, [x8, #0xb8] ; = 0x3f847ae147ae147b (u64 @ 0x106d0b8)
  0x23146d4: ldr      x0, [x8] ; = 0x1b5000004e4 (u64 @ 0x106d000)
  0x23146d8: cbz      x0, #0x231477c
  0x23146dc: mov      x1, xzr
  0x23146e0: bl       #0x259be60 ; -> CDungeonScene$$GetActiveCharacter
  0x23146e4: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x23146e8: mov      x20, x0
  0x23146ec: ldr      w9, [x8, #0xe0]
  0x23146f0: cbnz     w9, #0x23146fc
  0x23146f4: mov      x0, x8
  0x23146f8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23146fc: mov      x0, x20
  0x2314700: mov      x1, x19
  0x2314704: mov      x2, xzr
  0x2314708: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x231470c: tbz      w0, #0, #0x2314758
  0x2314710: ldrb     w8, [x21, #0xfc3]
  0x2314714: cbnz     w8, #0x231472c
  0x2314718: adrp     x0, #0x558a000
  0x231471c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2314720: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2314724: mov      w8, #1
  0x2314728: strb     w8, [x21, #0xfc3]
  0x231472c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2314730: ldr      x8, [x8, #0xb8] ; = 0x3f847ae147ae147b (u64 @ 0x106d0b8)
  0x2314734: ldr      x8, [x8] ; = 0x1b5000004e4 (u64 @ 0x106d000)
  0x2314738: cbz      x8, #0x231477c
  0x231473c: ldr      x8, [x8, #0x68] ; = 0x4000000020 (u64 @ 0x106d068)
  0x2314740: cbz      x8, #0x231477c
  0x2314744: ldr      x0, [x8, #0x138] ; = 0xac471b4784230fcf (u64 @ 0x106d138)
  0x2314748: cbz      x0, #0x231477c
  0x231474c: mov      w1, w23
  0x2314750: mov      x2, xzr
  0x2314754: bl       #0x28f8708 ; -> CHudTotalDamage$$SetTotalDamage
  0x2314758: mov      w0, #1
  0x231475c: ldp      x20, x19, [sp, #0xd0]
  0x2314760: ldp      x22, x21, [sp, #0xc0]
  0x2314764: ldp      x24, x23, [sp, #0xb0]
  0x2314768: ldp      x26, x25, [sp, #0xa0]
  0x231476c: ldp      x28, x27, [sp, #0x90]
  0x2314770: ldp      x29, x30, [sp, #0x80]
  0x2314774: add      sp, sp, #0xe0
  0x2314778: ret      
  0x231477c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2314780: mov      x26, xzr
  0x2314784: b        #0x2314794
  0x2314788: mov      x0, x26
  0x231478c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2314790: mov      x23, x0
  0x2314794: adrp     x8, #0x558a000
  0x2314798: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x231479c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23147a0: add      x0, sp, #0x30
  0x23147a4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23147a8: cbz      x26, #0x2314814
  0x23147ac: mov      x0, x26
  0x23147b0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x23147b4: mov      x23, x0
  0x23147b8: cmp      w1, #1
  0x23147bc: b.ne     #0x23147f0
  0x23147c0: mov      x0, x23
  0x23147c4: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x23147c8: ldr      x24, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x23147cc: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x23147d0: adrp     x8, #0x558a000
  0x23147d4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x23147d8: add      x0, sp, #0x50
  0x23147dc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23147e0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23147e4: cbz      x24, #0x2314064
  0x23147e8: mov      x0, x24
  0x23147ec: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x23147f0: mov      x24, xzr
  0x23147f4: b        #0x23147fc
  0x23147f8: mov      x23, x0
  0x23147fc: adrp     x8, #0x558a000
  0x2314800: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2314804: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314808: add      x0, sp, #0x50
  0x231480c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314810: cbnz     x24, #0x231481c
  0x2314814: mov      x0, x23
  0x2314818: bl       #0x22b072c ; -> ??? 0x22b072c
  0x231481c: mov      x0, x24
  0x2314820: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2314824: bl       #0x1f86e18 ; -> ??? 0x1f86e18
