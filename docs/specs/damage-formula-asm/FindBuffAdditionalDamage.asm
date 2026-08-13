; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== FindBuffAdditionalDamage @ 0x28268c0..0x2827ae4 (taille 4644 octets) =====
  0x28268c0: sub      sp, sp, #0x100
  0x28268c4: stp      d13, d12, [sp, #0x70]
  0x28268c8: stp      d11, d10, [sp, #0x80]
  0x28268cc: stp      d9, d8, [sp, #0x90]
  0x28268d0: stp      x29, x30, [sp, #0xa0]
  0x28268d4: stp      x28, x27, [sp, #0xb0]
  0x28268d8: stp      x26, x25, [sp, #0xc0]
  0x28268dc: stp      x24, x23, [sp, #0xd0]
  0x28268e0: stp      x22, x21, [sp, #0xe0]
  0x28268e4: stp      x20, x19, [sp, #0xf0]
  0x28268e8: adrp     x20, #0x59d7000
  0x28268ec: ldrb     w8, [x20, #0xabf]
  0x28268f0: mov      x21, x2
  0x28268f4: mov      x19, x1
  0x28268f8: mov      x22, x0
  0x28268fc: tbnz     w8, #0, #0x2826998
  0x2826900: adrp     x0, #0x558a000
  0x2826904: ldr      x0, [x0, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x2826908: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282690c: adrp     x0, #0x558a000
  0x2826910: ldr      x0, [x0, #0x7a0] ; = 0x0 (u64 @ 0x558a7a0)
  0x2826914: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826918: adrp     x0, #0x558a000
  0x282691c: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2826920: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826924: adrp     x0, #0x558a000
  0x2826928: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282692c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826930: adrp     x0, #0x558a000
  0x2826934: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2826938: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282693c: adrp     x0, #0x558a000
  0x2826940: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2826944: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826948: adrp     x0, #0x558a000
  0x282694c: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x2826950: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826954: adrp     x0, #0x558a000
  0x2826958: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x282695c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826960: adrp     x0, #0x558a000
  0x2826964: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2826968: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282696c: adrp     x0, #0x558a000
  0x2826970: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2826974: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826978: adrp     x0, #0x558a000
  0x282697c: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x558ad88)
  0x2826980: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826984: adrp     x0, #0x5587000
  0x2826988: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x282698c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826990: mov      w8, #1
  0x2826994: strb     w8, [x20, #0xabf]
  0x2826998: stp      xzr, xzr, [sp, #0x50]
  0x282699c: str      xzr, [sp, #0x60]
  0x28269a0: stp      xzr, xzr, [sp, #0x30]
  0x28269a4: str      xzr, [sp, #0x40]
  0x28269a8: str      wzr, [x19]
  0x28269ac: ldr      x0, [x22, #0x380]
  0x28269b0: cbz      x0, #0x2827794
  0x28269b4: adrp     x8, #0x558a000
  0x28269b8: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x28269bc: adrp     x29, #0x558a000
  0x28269c0: ldr      x29, [x29, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x28269c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28269c8: add      x8, sp, #0x18
  0x28269cc: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x28269d0: adrp     x23, #0x5588000
  0x28269d4: ldur     q0, [sp, #0x18]
  0x28269d8: ldr      x8, [sp, #0x28]
  0x28269dc: ldr      x23, [x23, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x28269e0: mov      w28, #0x447a0000
  0x28269e4: adrp     x20, #0x59d5000
  0x28269e8: fmov     d9, #-0.50000000
  0x28269ec: fmov     d10, #-1.00000000
  0x28269f0: mov      x27, #0x7ff0000000000000
  0x28269f4: fmov     d11, #0.50000000
  0x28269f8: fmov     d12, #1.00000000
  0x28269fc: str      q0, [sp, #0x50]
  0x2826a00: str      x8, [sp, #0x60]
  0x2826a04: ldr      x1, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x2826a08: add      x0, sp, #0x50
  0x2826a0c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2826a10: tbz      w0, #0, #0x28276b4
  0x2826a14: ldr      x24, [sp, #0x60]
  0x2826a18: cbz      x24, #0x2827788
  0x2826a1c: mov      x0, x24
  0x2826a20: mov      x1, xzr
  0x2826a24: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826a28: cmp      w0, #0x5a
  0x2826a2c: b.ne     #0x2826a5c
  0x2826a30: mov      w2, #0x17
  0x2826a34: mov      x0, x24
  0x2826a38: mov      x1, x21
  0x2826a3c: mov      x3, xzr
  0x2826a40: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826a44: tbz      w0, #0, #0x2826a5c
  0x2826a48: ldr      w25, [x19]
  0x2826a4c: mov      x0, x24
  0x2826a50: mov      x1, xzr
  0x2826a54: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826a58: b        #0x2826af4
  0x2826a5c: mov      x0, x24
  0x2826a60: mov      x1, xzr
  0x2826a64: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826a68: cmp      w0, #0x5b
  0x2826a6c: b.ne     #0x2826aa8
  0x2826a70: mov      w2, #0x17
  0x2826a74: mov      x0, x24
  0x2826a78: mov      x1, xzr
  0x2826a7c: mov      x3, xzr
  0x2826a80: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826a84: tbz      w0, #0, #0x2826aa8
  0x2826a88: ldr      w25, [x19]
  0x2826a8c: mov      x0, x24
  0x2826a90: mov      x1, xzr
  0x2826a94: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826a98: mov      w1, w0
  0x2826a9c: mov      x0, x22
  0x2826aa0: bl       #0x280f19c ; -> CCharacterBattle$$GetLostHPRateValue
  0x2826aa4: b        #0x2826af4
  0x2826aa8: mov      x0, x24
  0x2826aac: mov      x1, xzr
  0x2826ab0: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826ab4: cmp      w0, #0x5c
  0x2826ab8: b.ne     #0x2826afc
  0x2826abc: mov      w2, #0x17
  0x2826ac0: mov      x0, x24
  0x2826ac4: mov      x1, xzr
  0x2826ac8: mov      x3, xzr
  0x2826acc: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826ad0: tbz      w0, #0, #0x2826afc
  0x2826ad4: ldr      w25, [x19]
  0x2826ad8: mov      x0, x24
  0x2826adc: mov      x1, xzr
  0x2826ae0: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826ae4: mov      w1, w0
  0x2826ae8: cbz      x21, #0x282778c
  0x2826aec: mov      x0, x21
  0x2826af0: bl       #0x280f19c ; -> CCharacterBattle$$GetLostHPRateValue
  0x2826af4: add      w8, w0, w25
  0x2826af8: b        #0x2826fcc
  0x2826afc: mov      x0, x24
  0x2826b00: mov      x1, xzr
  0x2826b04: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826b08: cmp      w0, #0x5d
  0x2826b0c: b.ne     #0x2826b94
  0x2826b10: mov      w2, #0x17
  0x2826b14: mov      x0, x24
  0x2826b18: mov      x1, xzr
  0x2826b1c: mov      x3, xzr
  0x2826b20: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826b24: tbz      w0, #0, #0x2826b94
  0x2826b28: ldr      x25, [x22, #0x28]
  0x2826b2c: mov      x0, x24
  0x2826b30: mov      x1, xzr
  0x2826b34: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2826b38: mov      w26, w0
  0x2826b3c: mov      x0, x24
  0x2826b40: mov      x1, xzr
  0x2826b44: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826b48: cbz      x25, #0x2827790
  0x2826b4c: mov      w2, w0
  0x2826b50: mov      x0, x25
  0x2826b54: mov      w1, w26
  0x2826b58: mov      x3, xzr
  0x2826b5c: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2826b60: ldrb     w8, [x20, #0x3fe]
  0x2826b64: ldr      w25, [x19]
  0x2826b68: mov      w24, w0
  0x2826b6c: cbnz     w8, #0x2826b80
  0x2826b70: mov      x0, x23
  0x2826b74: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826b78: mov      w8, #1
  0x2826b7c: strb     w8, [x20, #0x3fe]
  0x2826b80: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5588000)
  0x2826b84: ldr      w8, [x0, #0xe0]
  0x2826b88: cbnz     w8, #0x2826cfc
  0x2826b8c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2826b90: b        #0x2826cfc
  0x2826b94: mov      x0, x24
  0x2826b98: mov      x1, xzr
  0x2826b9c: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826ba0: cmp      w0, #0x5e
  0x2826ba4: b.ne     #0x2826c30
  0x2826ba8: mov      w2, #0x17
  0x2826bac: mov      x0, x24
  0x2826bb0: mov      x1, xzr
  0x2826bb4: mov      x3, xzr
  0x2826bb8: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826bbc: tbz      w0, #0, #0x2826c30
  0x2826bc0: cbz      x21, #0x2827798
  0x2826bc4: ldr      x25, [x21, #0x28]
  0x2826bc8: mov      x0, x24
  0x2826bcc: mov      x1, xzr
  0x2826bd0: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2826bd4: mov      w26, w0
  0x2826bd8: mov      x0, x24
  0x2826bdc: mov      x1, xzr
  0x2826be0: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826be4: cbz      x25, #0x282779c
  0x2826be8: mov      w2, w0
  0x2826bec: mov      x0, x25
  0x2826bf0: mov      w1, w26
  0x2826bf4: mov      x3, xzr
  0x2826bf8: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2826bfc: ldrb     w8, [x20, #0x3fe]
  0x2826c00: ldr      w25, [x19]
  0x2826c04: mov      w24, w0
  0x2826c08: cbnz     w8, #0x2826c1c
  0x2826c0c: mov      x0, x23
  0x2826c10: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826c14: mov      w8, #1
  0x2826c18: strb     w8, [x20, #0x3fe]
  0x2826c1c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5588000)
  0x2826c20: ldr      w8, [x0, #0xe0]
  0x2826c24: cbnz     w8, #0x2826cfc
  0x2826c28: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2826c2c: b        #0x2826cfc
  0x2826c30: mov      x0, x24
  0x2826c34: mov      x1, xzr
  0x2826c38: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826c3c: cmp      w0, #0x6b
  0x2826c40: b.ne     #0x2826d38
  0x2826c44: mov      w2, #0x17
  0x2826c48: mov      x0, x24
  0x2826c4c: mov      x1, xzr
  0x2826c50: mov      x3, xzr
  0x2826c54: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826c58: tbz      w0, #0, #0x2826d38
  0x2826c5c: adrp     x8, #0x5587000
  0x2826c60: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2826c64: ldr      x25, [x24, #0x18]
  0x2826c68: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2826c6c: ldr      w8, [x0, #0xe0]
  0x2826c70: cbnz     w8, #0x2826c78
  0x2826c74: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2826c78: mov      x0, x25
  0x2826c7c: mov      x1, xzr
  0x2826c80: mov      x2, xzr
  0x2826c84: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2826c88: tbz      w0, #0, #0x2826a04
  0x2826c8c: ldr      x8, [x24, #0x18]
  0x2826c90: cbz      x8, #0x28277a4
  0x2826c94: ldr      x25, [x8, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2826c98: cbz      x25, #0x2826a04
  0x2826c9c: mov      x0, x24
  0x2826ca0: mov      x1, xzr
  0x2826ca4: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2826ca8: mov      w26, w0
  0x2826cac: mov      x0, x24
  0x2826cb0: mov      x1, xzr
  0x2826cb4: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826cb8: mov      w2, w0
  0x2826cbc: mov      x0, x25
  0x2826cc0: mov      w1, w26
  0x2826cc4: mov      x3, xzr
  0x2826cc8: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2826ccc: ldrb     w8, [x20, #0x3fe]
  0x2826cd0: ldr      w25, [x19]
  0x2826cd4: mov      w24, w0
  0x2826cd8: cbnz     w8, #0x2826cec
  0x2826cdc: mov      x0, x23
  0x2826ce0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2826ce4: mov      w8, #1
  0x2826ce8: strb     w8, [x20, #0x3fe]
  0x2826cec: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5588000)
  0x2826cf0: ldr      w8, [x0, #0xe0]
  0x2826cf4: cbnz     w8, #0x2826cfc
  0x2826cf8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2826cfc: scvtf    s0, w24
  0x2826d00: fmov     s1, w28
  0x2826d04: fminnm   s13, s0, s1
  0x2826d08: fcvt     d8, s13
  0x2826d0c: add      x0, sp, #0x18
  0x2826d10: mov      v0.16b, v8.16b
  0x2826d14: bl       #0x525f560 ; -> ??? 0x525f560
  0x2826d18: fcmp     s13, #0.0
  0x2826d1c: b.ge     #0x2826ddc
  0x2826d20: fcmp     d0, d9
  0x2826d24: b.ne     #0x2826fa0
  0x2826d28: ldr      d0, [sp, #0x18]
  0x2826d2c: fcvtzs   x8, d0
  0x2826d30: fadd     d1, d0, d10
  0x2826d34: b        #0x2826df0
  0x2826d38: mov      x0, x24
  0x2826d3c: mov      x1, xzr
  0x2826d40: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826d44: cmp      w0, #0x5f
  0x2826d48: b.ne     #0x2826d88
  0x2826d4c: mov      w2, #0x17
  0x2826d50: mov      x0, x24
  0x2826d54: mov      x1, xzr
  0x2826d58: mov      x3, xzr
  0x2826d5c: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826d60: tbz      w0, #0, #0x2826d88
  0x2826d64: ldr      w26, [x19]
  0x2826d68: mov      x0, x22
  0x2826d6c: mov      w1, wzr
  0x2826d70: bl       #0x282516c ; -> CCharacterBattle$$GetBuffCount
  0x2826d74: mov      w25, w0
  0x2826d78: mov      x0, x24
  0x2826d7c: mov      x1, xzr
  0x2826d80: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826d84: b        #0x2826e9c
  0x2826d88: mov      x0, x24
  0x2826d8c: mov      x1, xzr
  0x2826d90: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826d94: cmp      w0, #0x60
  0x2826d98: b.ne     #0x2826dfc
  0x2826d9c: mov      w2, #0x17
  0x2826da0: mov      x0, x24
  0x2826da4: mov      x1, xzr
  0x2826da8: mov      x3, xzr
  0x2826dac: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826db0: tbz      w0, #0, #0x2826dfc
  0x2826db4: ldr      x0, [x22, #0x348]
  0x2826db8: cbz      x0, #0x28277a0
  0x2826dbc: ldr      w26, [x19]
  0x2826dc0: mov      w1, wzr
  0x2826dc4: bl       #0x282516c ; -> CCharacterBattle$$GetBuffCount
  0x2826dc8: mov      w25, w0
  0x2826dcc: mov      x0, x24
  0x2826dd0: mov      x1, xzr
  0x2826dd4: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826dd8: b        #0x2826e9c
  0x2826ddc: fcmp     d0, d11
  0x2826de0: b.ne     #0x2826fac
  0x2826de4: ldr      d0, [sp, #0x18]
  0x2826de8: fcvtzs   x8, d0
  0x2826dec: fadd     d1, d0, d12
  0x2826df0: tst      x8, #1
  0x2826df4: fcsel    d0, d0, d1, eq
  0x2826df8: b        #0x2826fb4
  0x2826dfc: mov      x0, x24
  0x2826e00: mov      x1, xzr
  0x2826e04: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826e08: cmp      w0, #0x61
  0x2826e0c: b.ne     #0x2826e4c
  0x2826e10: mov      w2, #0x17
  0x2826e14: mov      x0, x24
  0x2826e18: mov      x1, xzr
  0x2826e1c: mov      x3, xzr
  0x2826e20: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826e24: tbz      w0, #0, #0x2826e4c
  0x2826e28: ldr      w26, [x19]
  0x2826e2c: mov      w1, #1
  0x2826e30: mov      x0, x22
  0x2826e34: bl       #0x282516c ; -> CCharacterBattle$$GetBuffCount
  0x2826e38: mov      w25, w0
  0x2826e3c: mov      x0, x24
  0x2826e40: mov      x1, xzr
  0x2826e44: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826e48: b        #0x2826e9c
  0x2826e4c: mov      x0, x24
  0x2826e50: mov      x1, xzr
  0x2826e54: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826e58: cmp      w0, #0x62
  0x2826e5c: b.ne     #0x2826ea4
  0x2826e60: mov      w2, #0x17
  0x2826e64: mov      x0, x24
  0x2826e68: mov      x1, xzr
  0x2826e6c: mov      x3, xzr
  0x2826e70: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826e74: tbz      w0, #0, #0x2826ea4
  0x2826e78: ldr      x0, [x22, #0x348]
  0x2826e7c: cbz      x0, #0x28277a8
  0x2826e80: ldr      w26, [x19]
  0x2826e84: mov      w1, #1
  0x2826e88: bl       #0x282516c ; -> CCharacterBattle$$GetBuffCount
  0x2826e8c: mov      w25, w0
  0x2826e90: mov      x0, x24
  0x2826e94: mov      x1, xzr
  0x2826e98: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826e9c: madd     w8, w0, w25, w26
  0x2826ea0: b        #0x2826fcc
  0x2826ea4: mov      x0, x24
  0x2826ea8: mov      x1, xzr
  0x2826eac: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826eb0: cmp      w0, #0x66
  0x2826eb4: b.ne     #0x2826f00
  0x2826eb8: mov      w2, #0x17
  0x2826ebc: mov      x0, x24
  0x2826ec0: mov      x1, xzr
  0x2826ec4: mov      x3, xzr
  0x2826ec8: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826ecc: tbz      w0, #0, #0x2826f00
  0x2826ed0: ldr      x8, [x22, #0x348]
  0x2826ed4: cbz      x8, #0x28277b0
  0x2826ed8: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x5587378)
  0x2826edc: cbz      x0, #0x28277ac
  0x2826ee0: mov      x1, xzr
  0x2826ee4: bl       #0x2509788 ; -> CRageManager$$get_IsBreak
  0x2826ee8: tbz      w0, #0, #0x2826f00
  0x2826eec: ldr      w25, [x19]
  0x2826ef0: mov      x0, x24
  0x2826ef4: mov      x1, xzr
  0x2826ef8: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826efc: b        #0x2826af4
  0x2826f00: mov      x0, x24
  0x2826f04: mov      x1, xzr
  0x2826f08: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826f0c: cmp      w0, #0x67
  0x2826f10: b.ne     #0x2826f60
  0x2826f14: mov      w2, #0x17
  0x2826f18: mov      x0, x24
  0x2826f1c: mov      x1, xzr
  0x2826f20: mov      x3, xzr
  0x2826f24: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826f28: tbz      w0, #0, #0x2826f60
  0x2826f2c: ldr      x8, [x22, #0x348]
  0x2826f30: cbz      x8, #0x28277b4
  0x2826f34: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2826f38: cbz      x0, #0x2826f60
  0x2826f3c: mov      x1, xzr
  0x2826f40: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x2826f44: cmp      w0, #3
  0x2826f48: b.le     #0x2826f60
  0x2826f4c: ldr      w25, [x19]
  0x2826f50: mov      x0, x24
  0x2826f54: mov      x1, xzr
  0x2826f58: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826f5c: b        #0x2826af4
  0x2826f60: mov      x0, x24
  0x2826f64: mov      x1, xzr
  0x2826f68: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826f6c: cmp      w0, #0x68
  0x2826f70: b.ne     #0x2826fd4
  0x2826f74: mov      w2, #0x17
  0x2826f78: mov      x0, x24
  0x2826f7c: mov      x1, x21
  0x2826f80: mov      x3, xzr
  0x2826f84: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826f88: tbz      w0, #0, #0x2826fd4
  0x2826f8c: ldr      w25, [x19]
  0x2826f90: mov      x0, x24
  0x2826f94: mov      x1, xzr
  0x2826f98: bl       #0x232036c ; -> CBuff$$get_Value
  0x2826f9c: b        #0x2826af4
  0x2826fa0: fadd     d0, d8, d9
  0x2826fa4: frintp   d0, d0
  0x2826fa8: b        #0x2826fb4
  0x2826fac: fadd     d0, d8, d11
  0x2826fb0: frintm   d0, d0
  0x2826fb4: fmov     d1, x27
  0x2826fb8: fcvtzs   w8, d0
  0x2826fbc: fcmp     d0, d1
  0x2826fc0: mov      w9, #-0xffffffff80000000
  0x2826fc4: csel     w8, w9, w8, eq
  0x2826fc8: add      w8, w8, w25
  0x2826fcc: str      w8, [x19]
  0x2826fd0: b        #0x2826a04
  0x2826fd4: mov      x0, x24
  0x2826fd8: mov      x1, xzr
  0x2826fdc: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2826fe0: cmp      w0, #0x69
  0x2826fe4: b.ne     #0x2827048
  0x2826fe8: mov      w2, #0x17
  0x2826fec: mov      x0, x24
  0x2826ff0: mov      x1, xzr
  0x2826ff4: mov      x3, xzr
  0x2826ff8: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2826ffc: tbz      w0, #0, #0x2827048
  0x2827000: cbz      x21, #0x28277bc
  0x2827004: mov      x0, x21
  0x2827008: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x282700c: cbz      x0, #0x28277b8
  0x2827010: ldr      w8, [x0, #0x3c]
  0x2827014: cmp      w8, #1
  0x2827018: b.eq     #0x2827034
  0x282701c: mov      x0, x21
  0x2827020: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2827024: cbz      x0, #0x28277c4
  0x2827028: ldr      w8, [x0, #0x3c]
  0x282702c: cmp      w8, #3
  0x2827030: b.ne     #0x2827048
  0x2827034: ldr      w25, [x19]
  0x2827038: mov      x0, x24
  0x282703c: mov      x1, xzr
  0x2827040: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827044: b        #0x2826af4
  0x2827048: mov      x0, x24
  0x282704c: mov      x1, xzr
  0x2827050: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827054: cmp      w0, #0x6a
  0x2827058: b.ne     #0x28270d0
  0x282705c: mov      w2, #0x17
  0x2827060: mov      x0, x24
  0x2827064: mov      x1, xzr
  0x2827068: mov      x3, xzr
  0x282706c: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2827070: tbz      w0, #0, #0x28270d0
  0x2827074: adrp     x8, #0x59d4000
  0x2827078: ldrb     w8, [x8, #0xfc3]
  0x282707c: cbnz     w8, #0x2827098
  0x2827080: adrp     x0, #0x558a000
  0x2827084: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2827088: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282708c: adrp     x8, #0x59d4000
  0x2827090: mov      w9, #1
  0x2827094: strb     w9, [x8, #0xfc3]
  0x2827098: adrp     x8, #0x558a000
  0x282709c: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28270a0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28270a4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x28270a8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28270ac: cbz      x0, #0x28277c0
  0x28270b0: mov      x1, xzr
  0x28270b4: bl       #0x2595824 ; -> CDungeonScene$$get_IsPvp
  0x28270b8: tbz      w0, #0, #0x28270d0
  0x28270bc: ldr      w25, [x19]
  0x28270c0: mov      x0, x24
  0x28270c4: mov      x1, xzr
  0x28270c8: bl       #0x232036c ; -> CBuff$$get_Value
  0x28270cc: b        #0x2826af4
  0x28270d0: mov      x0, x24
  0x28270d4: mov      x1, xzr
  0x28270d8: bl       #0x2320198 ; -> CBuff$$get_Type
  0x28270dc: cmp      w0, #0x6c
  0x28270e0: b.ne     #0x2827160
  0x28270e4: mov      w2, #0x17
  0x28270e8: mov      x0, x24
  0x28270ec: mov      x1, xzr
  0x28270f0: mov      x3, xzr
  0x28270f4: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28270f8: tbz      w0, #0, #0x2827160
  0x28270fc: adrp     x8, #0x5587000
  0x2827100: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827104: ldr      x25, [x24, #0x18]
  0x2827108: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x282710c: ldr      w8, [x0, #0xe0]
  0x2827110: cbnz     w8, #0x2827118
  0x2827114: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827118: mov      x0, x25
  0x282711c: mov      x1, xzr
  0x2827120: mov      x2, xzr
  0x2827124: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2827128: tbz      w0, #0, #0x2826a04
  0x282712c: ldr      x25, [x24, #0x18]
  0x2827130: cbz      x25, #0x28277f0
  0x2827134: ldr      x8, [x25, #0x28]
  0x2827138: cbz      x8, #0x2826a04
  0x282713c: ldr      w26, [x19]
  0x2827140: mov      x0, x24
  0x2827144: mov      x1, xzr
  0x2827148: bl       #0x232036c ; -> CBuff$$get_Value
  0x282714c: mov      w1, w0
  0x2827150: mov      x0, x25
  0x2827154: bl       #0x280f19c ; -> CCharacterBattle$$GetLostHPRateValue
  0x2827158: add      w8, w0, w26
  0x282715c: b        #0x2826fcc
  0x2827160: mov      x0, x24
  0x2827164: mov      x1, xzr
  0x2827168: bl       #0x2320198 ; -> CBuff$$get_Type
  0x282716c: cmp      w0, #0x6e
  0x2827170: b.ne     #0x282728c
  0x2827174: mov      w2, #0x17
  0x2827178: mov      x0, x24
  0x282717c: mov      x1, xzr
  0x2827180: mov      x3, xzr
  0x2827184: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2827188: tbz      w0, #0, #0x282728c
  0x282718c: adrp     x8, #0x5587000
  0x2827190: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827194: ldr      x25, [x24, #0x20]
  0x2827198: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x282719c: ldr      w8, [x0, #0xe0]
  0x28271a0: cbnz     w8, #0x28271a8
  0x28271a4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x28271a8: mov      x0, x25
  0x28271ac: mov      x1, xzr
  0x28271b0: mov      x2, xzr
  0x28271b4: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x28271b8: tbnz     w0, #0, #0x2826a04
  0x28271bc: ldr      x0, [x24, #0x20]
  0x28271c0: cbz      x0, #0x28277f4
  0x28271c4: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x28271c8: cbz      x8, #0x2826a04
  0x28271cc: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x28271d0: cbz      x0, #0x2826a04
  0x28271d4: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x28271d8: cbz      x0, #0x2827830
  0x28271dc: adrp     x8, #0x558a000
  0x28271e0: ldr      x8, [x8, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x28271e4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28271e8: add      x8, sp, #0x18
  0x28271ec: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x28271f0: ldur     q0, [sp, #0x18]
  0x28271f4: ldr      x8, [sp, #0x28]
  0x28271f8: str      wzr, [sp, #0x14]
  0x28271fc: str      q0, [sp, #0x30]
  0x2827200: str      x8, [sp, #0x40]
  0x2827204: adrp     x8, #0x558a000
  0x2827208: ldr      x8, [x8, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x282720c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827210: add      x0, sp, #0x30
  0x2827214: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2827218: tbz      w0, #0, #0x2827580
  0x282721c: adrp     x8, #0x5587000
  0x2827220: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827224: ldr      x25, [sp, #0x40]
  0x2827228: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x282722c: ldr      w8, [x0, #0xe0]
  0x2827230: cbnz     w8, #0x2827238
  0x2827234: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827238: mov      x0, x25
  0x282723c: mov      x1, xzr
  0x2827240: mov      x2, xzr
  0x2827244: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2827248: tbnz     w0, #0, #0x2827204
  0x282724c: cbz      x25, #0x2827614
  0x2827250: mov      x0, x25
  0x2827254: mov      w1, wzr
  0x2827258: bl       #0x28248b4 ; -> CCharacterBattle$$GetBuffList
  0x282725c: adrp     x8, #0x558a000
  0x2827260: ldr      x8, [x8, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x2827264: mov      x25, x0
  0x2827268: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282726c: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x2827270: tbnz     w0, #0, #0x2827204
  0x2827274: cbz      x25, #0x2827624
  0x2827278: ldr      w8, [x25, #0x18]
  0x282727c: ldr      w9, [sp, #0x14]
  0x2827280: add      w9, w8, w9
  0x2827284: str      w9, [sp, #0x14]
  0x2827288: b        #0x2827204
  0x282728c: mov      x0, x24
  0x2827290: mov      x1, xzr
  0x2827294: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827298: cmp      w0, #0x6f
  0x282729c: b.ne     #0x282739c
  0x28272a0: mov      w2, #0x17
  0x28272a4: mov      x0, x24
  0x28272a8: mov      x1, xzr
  0x28272ac: mov      x3, xzr
  0x28272b0: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28272b4: tbz      w0, #0, #0x282739c
  0x28272b8: adrp     x8, #0x5587000
  0x28272bc: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x28272c0: ldr      x25, [x24, #0x20]
  0x28272c4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x28272c8: ldr      w8, [x0, #0xe0]
  0x28272cc: cbnz     w8, #0x28272d4
  0x28272d0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x28272d4: mov      x0, x25
  0x28272d8: mov      x1, xzr
  0x28272dc: mov      x2, xzr
  0x28272e0: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x28272e4: tbnz     w0, #0, #0x2826a04
  0x28272e8: ldr      x0, [x24, #0x20]
  0x28272ec: cbz      x0, #0x28277f8
  0x28272f0: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x28272f4: cbz      x8, #0x2826a04
  0x28272f8: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x28272fc: cbz      x0, #0x2826a04
  0x2827300: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x2827304: cbz      x0, #0x282783c
  0x2827308: adrp     x8, #0x558a000
  0x282730c: ldr      x8, [x8, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2827310: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827314: add      x8, sp, #0x18
  0x2827318: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282731c: ldur     q0, [sp, #0x18]
  0x2827320: ldr      x8, [sp, #0x28]
  0x2827324: str      wzr, [sp, #0x14]
  0x2827328: str      q0, [sp, #0x30]
  0x282732c: str      x8, [sp, #0x40]
  0x2827330: adrp     x8, #0x558a000
  0x2827334: ldr      x8, [x8, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2827338: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282733c: add      x0, sp, #0x30
  0x2827340: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2827344: tbz      w0, #0, #0x28275c4
  0x2827348: adrp     x8, #0x5587000
  0x282734c: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827350: ldr      x25, [sp, #0x40]
  0x2827354: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2827358: ldr      w8, [x0, #0xe0]
  0x282735c: cbnz     w8, #0x2827364
  0x2827360: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827364: mov      x0, x25
  0x2827368: mov      x1, xzr
  0x282736c: mov      x2, xzr
  0x2827370: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2827374: tbnz     w0, #0, #0x2827330
  0x2827378: cbz      x25, #0x282761c
  0x282737c: mov      x0, x25
  0x2827380: mov      x1, xzr
  0x2827384: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x2827388: ldr      w9, [sp, #0x14]
  0x282738c: and      w8, w0, #1
  0x2827390: add      w9, w9, w8
  0x2827394: str      w9, [sp, #0x14]
  0x2827398: b        #0x2827330
  0x282739c: mov      x0, x24
  0x28273a0: mov      x1, xzr
  0x28273a4: bl       #0x2320198 ; -> CBuff$$get_Type
  0x28273a8: cmp      w0, #0x70
  0x28273ac: b.ne     #0x2827488
  0x28273b0: mov      w2, #0x17
  0x28273b4: mov      x0, x24
  0x28273b8: mov      x1, xzr
  0x28273bc: mov      x3, xzr
  0x28273c0: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28273c4: tbz      w0, #0, #0x2827488
  0x28273c8: adrp     x8, #0x59d4000
  0x28273cc: ldrb     w8, [x8, #0xfc3]
  0x28273d0: cbnz     w8, #0x28273ec
  0x28273d4: adrp     x0, #0x558a000
  0x28273d8: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28273dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28273e0: adrp     x8, #0x59d4000
  0x28273e4: mov      w9, #1
  0x28273e8: strb     w9, [x8, #0xfc3]
  0x28273ec: adrp     x8, #0x558a000
  0x28273f0: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28273f4: adrp     x9, #0x5587000
  0x28273f8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28273fc: ldr      x9, [x9, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827400: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2827404: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x2827408: ldr      x25, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282740c: ldr      w9, [x0, #0xe0]
  0x2827410: cbnz     w9, #0x2827418
  0x2827414: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827418: mov      x0, x25
  0x282741c: mov      x1, xzr
  0x2827420: mov      x2, xzr
  0x2827424: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2827428: tbz      w0, #0, #0x2827488
  0x282742c: adrp     x8, #0x59d4000
  0x2827430: ldrb     w8, [x8, #0xfc3]
  0x2827434: cbnz     w8, #0x2827450
  0x2827438: adrp     x0, #0x558a000
  0x282743c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2827440: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827444: adrp     x8, #0x59d4000
  0x2827448: mov      w9, #1
  0x282744c: strb     w9, [x8, #0xfc3]
  0x2827450: adrp     x8, #0x558a000
  0x2827454: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2827458: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282745c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2827460: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827464: cbz      x0, #0x2827824
  0x2827468: mov      x1, xzr
  0x282746c: bl       #0x2595970 ; -> CDungeonScene$$get_IsMonadGate
  0x2827470: tbz      w0, #0, #0x2827488
  0x2827474: ldr      w25, [x19]
  0x2827478: mov      x0, x24
  0x282747c: mov      x1, xzr
  0x2827480: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827484: b        #0x2826af4
  0x2827488: mov      x0, x24
  0x282748c: mov      x1, xzr
  0x2827490: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827494: cmp      w0, #0x71
  0x2827498: b.ne     #0x2826a04
  0x282749c: mov      w2, #0x17
  0x28274a0: mov      x0, x24
  0x28274a4: mov      x1, xzr
  0x28274a8: mov      x3, xzr
  0x28274ac: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28274b0: tbz      w0, #0, #0x2826a04
  0x28274b4: adrp     x8, #0x59d4000
  0x28274b8: ldrb     w8, [x8, #0xfc3]
  0x28274bc: cbnz     w8, #0x28274d8
  0x28274c0: adrp     x0, #0x558a000
  0x28274c4: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28274c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28274cc: adrp     x8, #0x59d4000
  0x28274d0: mov      w9, #1
  0x28274d4: strb     w9, [x8, #0xfc3]
  0x28274d8: adrp     x8, #0x558a000
  0x28274dc: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28274e0: adrp     x9, #0x5587000
  0x28274e4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28274e8: ldr      x9, [x9, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x28274ec: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x28274f0: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x28274f4: ldr      x25, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28274f8: ldr      w9, [x0, #0xe0]
  0x28274fc: cbnz     w9, #0x2827504
  0x2827500: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827504: mov      x0, x25
  0x2827508: mov      x1, xzr
  0x282750c: mov      x2, xzr
  0x2827510: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2827514: tbz      w0, #0, #0x2826a04
  0x2827518: adrp     x8, #0x59d4000
  0x282751c: ldrb     w8, [x8, #0xfc3]
  0x2827520: cbnz     w8, #0x282753c
  0x2827524: adrp     x0, #0x558a000
  0x2827528: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x282752c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827530: adrp     x8, #0x59d4000
  0x2827534: mov      w9, #1
  0x2827538: strb     w9, [x8, #0xfc3]
  0x282753c: adrp     x8, #0x558a000
  0x2827540: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2827544: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827548: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x282754c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827550: cbz      x8, #0x282782c
  0x2827554: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x558a020)
  0x2827558: cbz      x8, #0x2827828
  0x282755c: ldr      w0, [x8, #0xa4]
  0x2827560: mov      x1, xzr
  0x2827564: bl       #0x2cb0b0c ; -> CExtension$$IsTowerModes
  0x2827568: tbz      w0, #0, #0x2826a04
  0x282756c: ldr      w25, [x19]
  0x2827570: mov      x0, x24
  0x2827574: mov      x1, xzr
  0x2827578: bl       #0x232036c ; -> CBuff$$get_Value
  0x282757c: b        #0x2826af4
  0x2827580: mov      x25, xzr
  0x2827584: mov      w26, #0x18
  0x2827588: adrp     x8, #0x558a000
  0x282758c: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2827590: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827594: add      x0, sp, #0x30
  0x2827598: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282759c: cbnz     x25, #0x2827834
  0x28275a0: cmp      w26, #0x18
  0x28275a4: b.eq     #0x28275ac
  0x28275a8: cbnz     w26, #0x282776c
  0x28275ac: ldr      w25, [x19]
  0x28275b0: mov      x0, x24
  0x28275b4: mov      x1, xzr
  0x28275b8: bl       #0x232036c ; -> CBuff$$get_Value
  0x28275bc: ldr      w8, [sp, #0x14]
  0x28275c0: b        #0x282760c
  0x28275c4: mov      x25, xzr
  0x28275c8: mov      w26, #0x1c
  0x28275cc: adrp     x8, #0x558a000
  0x28275d0: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x28275d4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28275d8: add      x0, sp, #0x30
  0x28275dc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28275e0: cbnz     x25, #0x2827840
  0x28275e4: cmp      w26, #0x1c
  0x28275e8: b.eq     #0x28275f0
  0x28275ec: cbnz     w26, #0x282776c
  0x28275f0: ldr      w25, [x19]
  0x28275f4: mov      x0, x24
  0x28275f8: mov      x1, xzr
  0x28275fc: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827600: ldr      w9, [sp, #0x14]
  0x2827604: mov      w8, #4
  0x2827608: sub      w8, w8, w9
  0x282760c: madd     w8, w0, w8, w25
  0x2827610: b        #0x2826fcc
  0x2827614: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827618: b        #0x2827848
  0x282761c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827620: b        #0x2827848
  0x2827624: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827628: b        #0x2827848
  0x282762c: b        #0x2827684
  0x2827630: b        #0x2827650
  0x2827634: b        #0x2827650
  0x2827638: b        #0x2827650
  0x282763c: b        #0x2827684
  0x2827640: b        #0x2827684
  0x2827644: b        #0x2827684
  0x2827648: b        #0x2827684
  0x282764c: b        #0x2827650
  0x2827650: mov      x26, x1
  0x2827654: mov      x25, x0
  0x2827658: cmp      w26, #1
  0x282765c: b.ne     #0x28277fc
  0x2827660: mov      x0, x25
  0x2827664: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2827668: ldr      x8, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x282766c: str      x8, [sp, #8]
  0x2827670: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2827674: ldr      x25, [sp, #8]
  0x2827678: mov      w26, wzr
  0x282767c: b        #0x28275cc
  0x2827680: b        #0x2827684
  0x2827684: mov      x26, x1
  0x2827688: mov      x25, x0
  0x282768c: cmp      w26, #1
  0x2827690: b.ne     #0x28277c8
  0x2827694: mov      x0, x25
  0x2827698: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x282769c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x28276a0: str      x8, [sp, #8]
  0x28276a4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x28276a8: ldr      x25, [sp, #8]
  0x28276ac: mov      w26, wzr
  0x28276b0: b        #0x2827588
  0x28276b4: adrp     x8, #0x558a000
  0x28276b8: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x28276bc: add      x0, sp, #0x50
  0x28276c0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28276c4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28276c8: adrp     x20, #0x59d4000
  0x28276cc: ldrb     w8, [x20, #0xfc3]
  0x28276d0: cbnz     w8, #0x28276e8
  0x28276d4: adrp     x0, #0x558a000
  0x28276d8: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28276dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28276e0: mov      w8, #1
  0x28276e4: strb     w8, [x20, #0xfc3]
  0x28276e8: adrp     x8, #0x558a000
  0x28276ec: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x28276f0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28276f4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x28276f8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28276fc: cbz      x0, #0x2827794
  0x2827700: mov      x1, xzr
  0x2827704: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x2827708: tbz      w0, #0, #0x2827740
  0x282770c: adrp     x8, #0x558a000
  0x2827710: ldr      w20, [x19]
  0x2827714: ldr      x8, [x8, #0x7a0] ; = 0x0 (u64 @ 0x558a7a0)
  0x2827718: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282771c: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2827720: cbz      x0, #0x2827794
  0x2827724: mov      x1, xzr
  0x2827728: bl       #0x2558ab0 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x282772c: cbz      x0, #0x2827794
  0x2827730: mov      x1, xzr
  0x2827734: bl       #0x25612e4 ; -> CPvpRealtimeMatch$$get_FieldSkillDmg
  0x2827738: add      w8, w0, w20
  0x282773c: str      w8, [x19]
  0x2827740: ldp      x20, x19, [sp, #0xf0]
  0x2827744: ldp      x22, x21, [sp, #0xe0]
  0x2827748: ldp      x24, x23, [sp, #0xd0]
  0x282774c: ldp      x26, x25, [sp, #0xc0]
  0x2827750: ldp      x28, x27, [sp, #0xb0]
  0x2827754: ldp      x29, x30, [sp, #0xa0]
  0x2827758: ldp      d9, d8, [sp, #0x90]
  0x282775c: ldp      d11, d10, [sp, #0x80]
  0x2827760: ldp      d13, d12, [sp, #0x70]
  0x2827764: add      sp, sp, #0x100
  0x2827768: ret      
  0x282776c: adrp     x8, #0x558a000
  0x2827770: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827774: add      x0, sp, #0x50
  0x2827778: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282777c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827780: cbnz     w26, #0x2827740
  0x2827784: b        #0x28276c8
  0x2827788: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282778c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827790: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827794: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827798: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282779c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277a0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277a4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277a8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277ac: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277b8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277bc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277c0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277c4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277c8: str      xzr, [sp, #8]
  0x28277cc: adrp     x8, #0x558a000
  0x28277d0: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x28277d4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x28277d8: add      x0, sp, #0x30
  0x28277dc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28277e0: ldr      x8, [sp, #8]
  0x28277e4: cbz      x8, #0x2827a68
  0x28277e8: ldr      x0, [sp, #8]
  0x28277ec: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x28277f0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277f4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277f8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28277fc: str      xzr, [sp, #8]
  0x2827800: adrp     x8, #0x558a000
  0x2827804: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2827808: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282780c: add      x0, sp, #0x30
  0x2827810: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827814: ldr      x8, [sp, #8]
  0x2827818: cbz      x8, #0x2827a68
  0x282781c: ldr      x0, [sp, #8]
  0x2827820: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2827824: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827828: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282782c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827830: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827834: mov      x0, x25
  0x2827838: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282783c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827840: mov      x0, x25
  0x2827844: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2827848: mov      x25, x0
  0x282784c: mov      w26, w1
  0x2827850: b        #0x2827800
  0x2827854: mov      x25, x0
  0x2827858: mov      w26, w1
  0x282785c: b        #0x28277cc
  0x2827860: b        #0x2827ad8
  0x2827864: b        #0x2827ad8
  0x2827868: b        #0x2827ad8
  0x282786c: b        #0x2827ad8
  0x2827870: b        #0x2827ad8
  0x2827874: b        #0x2827ad8
  0x2827878: b        #0x2827ad8
  0x282787c: b        #0x2827ad8
  0x2827880: b        #0x2827ad8
  0x2827884: b        #0x2827ad8
  0x2827888: b        #0x2827ad8
  0x282788c: b        #0x2827ad8
  0x2827890: b        #0x2827ad8
  0x2827894: b        #0x2827ad8
  0x2827898: b        #0x2827ad8
  0x282789c: b        #0x2827ad8
  0x28278a0: b        #0x2827ad8
  0x28278a4: b        #0x2827ad8
  0x28278a8: b        #0x2827ad8
  0x28278ac: b        #0x2827ad8
  0x28278b0: b        #0x2827ad8
  0x28278b4: b        #0x2827a60
  0x28278b8: b        #0x2827ad8
  0x28278bc: b        #0x2827a60
  0x28278c0: b        #0x2827a60
  0x28278c4: b        #0x2827a60
  0x28278c8: b        #0x2827a60
  0x28278cc: b        #0x2827a60
  0x28278d0: b        #0x2827a60
  0x28278d4: b        #0x2827a60
  0x28278d8: b        #0x2827ad8
  0x28278dc: b        #0x2827ad8
  0x28278e0: b        #0x2827a60
  0x28278e4: b        #0x2827a60
  0x28278e8: b        #0x2827ad8
  0x28278ec: b        #0x2827a60
  0x28278f0: b        #0x2827a60
  0x28278f4: b        #0x2827a60
  0x28278f8: b        #0x2827a60
  0x28278fc: b        #0x2827a60
  0x2827900: b        #0x2827ad8
  0x2827904: b        #0x2827ad8
  0x2827908: b        #0x2827a60
  0x282790c: b        #0x2827a60
  0x2827910: b        #0x2827ad8
  0x2827914: b        #0x2827a60
  0x2827918: b        #0x2827a60
  0x282791c: b        #0x2827a60
  0x2827920: b        #0x2827a60
  0x2827924: b        #0x2827a60
  0x2827928: b        #0x2827a60
  0x282792c: b        #0x2827a60
  0x2827930: b        #0x2827a60
  0x2827934: b        #0x2827ad8
  0x2827938: b        #0x2827ad8
  0x282793c: b        #0x2827a60
  0x2827940: b        #0x2827a60
  0x2827944: b        #0x2827a60
  0x2827948: b        #0x2827ad8
  0x282794c: b        #0x2827a60
  0x2827950: b        #0x2827a60
  0x2827954: b        #0x2827a60
  0x2827958: b        #0x2827a60
  0x282795c: b        #0x2827a60
  0x2827960: b        #0x2827a60
  0x2827964: b        #0x2827a60
  0x2827968: b        #0x2827a60
  0x282796c: b        #0x2827a60
  0x2827970: b        #0x2827a60
  0x2827974: b        #0x2827a60
  0x2827978: b        #0x2827a60
  0x282797c: b        #0x2827a60
  0x2827980: b        #0x2827a60
  0x2827984: b        #0x2827a60
  0x2827988: b        #0x2827a60
  0x282798c: b        #0x2827a60
  0x2827990: b        #0x2827a60
  0x2827994: b        #0x2827a60
  0x2827998: b        #0x2827a60
  0x282799c: b        #0x2827a60
  0x28279a0: b        #0x2827a60
  0x28279a4: b        #0x2827a60
  0x28279a8: b        #0x2827a60
  0x28279ac: b        #0x2827a60
  0x28279b0: b        #0x2827a60
  0x28279b4: b        #0x2827a60
  0x28279b8: b        #0x2827a60
  0x28279bc: b        #0x2827a60
  0x28279c0: b        #0x2827a60
  0x28279c4: b        #0x2827a60
  0x28279c8: b        #0x2827a60
  0x28279cc: b        #0x2827a60
  0x28279d0: b        #0x2827a60
  0x28279d4: b        #0x2827a60
  0x28279d8: b        #0x2827a60
  0x28279dc: b        #0x2827a60
  0x28279e0: b        #0x2827a60
  0x28279e4: b        #0x2827a60
  0x28279e8: b        #0x2827a60
  0x28279ec: b        #0x2827a60
  0x28279f0: b        #0x2827a60
  0x28279f4: b        #0x2827a60
  0x28279f8: b        #0x2827a60
  0x28279fc: b        #0x2827a60
  0x2827a00: b        #0x2827a60
  0x2827a04: b        #0x2827a60
  0x2827a08: b        #0x2827a60
  0x2827a0c: b        #0x2827a60
  0x2827a10: b        #0x2827a60
  0x2827a14: b        #0x2827a60
  0x2827a18: b        #0x2827a60
  0x2827a1c: b        #0x2827a60
  0x2827a20: b        #0x2827a60
  0x2827a24: b        #0x2827a60
  0x2827a28: b        #0x2827a60
  0x2827a2c: b        #0x2827a60
  0x2827a30: b        #0x2827a60
  0x2827a34: b        #0x2827a60
  0x2827a38: b        #0x2827a60
  0x2827a3c: b        #0x2827a60
  0x2827a40: b        #0x2827a60
  0x2827a44: b        #0x2827a60
  0x2827a48: b        #0x2827a60
  0x2827a4c: b        #0x2827a60
  0x2827a50: b        #0x2827a60
  0x2827a54: b        #0x2827a60
  0x2827a58: b        #0x2827a60
  0x2827a5c: b        #0x2827a60
  0x2827a60: mov      x26, x1
  0x2827a64: mov      x25, x0
  0x2827a68: cmp      w26, #1
  0x2827a6c: b.ne     #0x2827aa0
  0x2827a70: mov      x0, x25
  0x2827a74: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2827a78: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x2827a7c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2827a80: adrp     x8, #0x558a000
  0x2827a84: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827a88: add      x0, sp, #0x50
  0x2827a8c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827a90: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827a94: cbz      x21, #0x28276c8
  0x2827a98: mov      x0, x21
  0x2827a9c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2827aa0: mov      x21, xzr
  0x2827aa4: b        #0x2827aac
  0x2827aa8: mov      x25, x0
  0x2827aac: adrp     x8, #0x558a000
  0x2827ab0: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827ab4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827ab8: add      x0, sp, #0x50
  0x2827abc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827ac0: cbnz     x21, #0x2827acc
  0x2827ac4: mov      x0, x25
  0x2827ac8: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2827acc: mov      x0, x21
  0x2827ad0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2827ad4: bl       #0x1f86e18 ; -> ??? 0x1f86e18
  0x2827ad8: mov      x25, x0
  0x2827adc: mov      w26, w1
  0x2827ae0: b        #0x2827a68
