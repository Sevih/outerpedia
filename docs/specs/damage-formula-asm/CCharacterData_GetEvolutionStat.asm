; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetEvolutionStat @ 0x2908a60..0x2908e44 (taille 996 octets) =====
  0x2908a60: stp      x30, x27, [sp, #-0x50]!
  0x2908a64: stp      x26, x25, [sp, #0x10]
  0x2908a68: stp      x24, x23, [sp, #0x20]
  0x2908a6c: stp      x22, x21, [sp, #0x30]
  0x2908a70: stp      x20, x19, [sp, #0x40]
  0x2908a74: adrp     x24, #0x59d8000
  0x2908a78: adrp     x25, #0x558b000
  0x2908a7c: adrp     x19, #0x558b000
  0x2908a80: adrp     x20, #0x558a000
  0x2908a84: ldrb     w8, [x24, #0x29c]
  0x2908a88: ldr      x25, [x25, #0xe18] ; = 0x0 (u64 @ 0x558be18)
  0x2908a8c: ldr      x19, [x19, #0xd80] ; = 0x0 (u64 @ 0x558bd80)
  0x2908a90: ldr      x20, [x20, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2908a94: mov      w21, w2
  0x2908a98: mov      w22, w1
  0x2908a9c: mov      x23, x0
  0x2908aa0: tbnz     w8, #0, #0x2908b00
  0x2908aa4: adrp     x0, #0x558a000
  0x2908aa8: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2908aac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908ab0: adrp     x0, #0x558b000
  0x2908ab4: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x558bd80)
  0x2908ab8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908abc: adrp     x0, #0x558b000
  0x2908ac0: ldr      x0, [x0, #0xe18] ; = 0x0 (u64 @ 0x558be18)
  0x2908ac4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908ac8: adrp     x0, #0x5587000
  0x2908acc: ldr      x0, [x0, #0xbf0] ; = 0x0 (u64 @ 0x5587bf0)
  0x2908ad0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908ad4: adrp     x0, #0x55ae000
  0x2908ad8: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x55ae288)
  0x2908adc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908ae0: adrp     x0, #0x55ae000
  0x2908ae4: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x55ae290)
  0x2908ae8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908aec: adrp     x0, #0x5587000
  0x2908af0: ldr      x0, [x0, #0xce8] ; = 0x0 (u64 @ 0x5587ce8)
  0x2908af4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2908af8: mov      w8, #1
  0x2908afc: strb     w8, [x24, #0x29c]
  0x2908b00: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558b000)
  0x2908b04: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2908b08: ldr      x1, [x19] ; = 0x0 (u64 @ 0x558b000)
  0x2908b0c: mov      x19, x0
  0x2908b10: bl       #0x40108cc ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$.ctor
  0x2908b14: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2908b18: ldr      w8, [x0, #0xe0]
  0x2908b1c: cbnz     w8, #0x2908b24
  0x2908b20: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2908b24: mov      x0, xzr
  0x2908b28: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2908b2c: ldr      x8, [x23, #0xf0]
  0x2908b30: cbz      x8, #0x2908d78
  0x2908b34: cbz      x0, #0x2908d78
  0x2908b38: ldr      w1, [x8, #0x10]
  0x2908b3c: mov      x2, xzr
  0x2908b40: bl       #0x262a190 ; -> CTempletManager$$GetCharacterEvolutionStatTempletList
  0x2908b44: cbz      x0, #0x2908d78
  0x2908b48: adrp     x10, #0x55ae000
  0x2908b4c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x2908b50: ldr      x10, [x10, #0x288] ; = 0x0 (u64 @ 0x55ae288)
  0x2908b54: mov      x20, x0
  0x2908b58: ldrh     w9, [x8, #0x12e]
  0x2908b5c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55ae000)
  0x2908b60: cbz      x9, #0x2908b84
  0x2908b64: ldr      x10, [x8, #0xb0]
  0x2908b68: add      x10, x10, #8
  0x2908b6c: ldur     x11, [x10, #-8]
  0x2908b70: cmp      x11, x1
  0x2908b74: b.eq     #0x2908b94
  0x2908b78: subs     x9, x9, #1
  0x2908b7c: add      x10, x10, #0x10
  0x2908b80: b.ne     #0x2908b6c
  0x2908b84: mov      x0, x20
  0x2908b88: mov      w2, wzr
  0x2908b8c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2908b90: b        #0x2908ba0
  0x2908b94: ldrsw    x9, [x10]
  0x2908b98: add      x8, x8, x9, lsl #4
  0x2908b9c: add      x0, x8, #0x138
  0x2908ba0: ldp      x8, x1, [x0]
  0x2908ba4: adrp     x25, #0x5587000
  0x2908ba8: ldr      x25, [x25, #0xbf0] ; = 0x0 (u64 @ 0x5587bf0)
  0x2908bac: mov      x0, x20
  0x2908bb0: blr      x8
  0x2908bb4: mov      x20, x0
  0x2908bb8: cbz      x0, #0x2908d7c
  0x2908bbc: adrp     x26, #0x5587000
  0x2908bc0: adrp     x27, #0x55ae000
  0x2908bc4: ldr      x26, [x26, #0xce8] ; = 0x0 (u64 @ 0x5587ce8)
  0x2908bc8: ldr      x27, [x27, #0x290] ; = 0x0 (u64 @ 0x55ae290)
  0x2908bcc: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2908bd0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5587000)
  0x2908bd4: ldrh     w9, [x8, #0x12e]
  0x2908bd8: cbz      x9, #0x2908bfc
  0x2908bdc: ldr      x10, [x8, #0xb0]
  0x2908be0: add      x10, x10, #8
  0x2908be4: ldur     x11, [x10, #-8]
  0x2908be8: cmp      x11, x1
  0x2908bec: b.eq     #0x2908c0c
  0x2908bf0: subs     x9, x9, #1
  0x2908bf4: add      x10, x10, #0x10
  0x2908bf8: b.ne     #0x2908be4
  0x2908bfc: mov      x0, x20
  0x2908c00: mov      w2, wzr
  0x2908c04: bl       #0x2210028 ; -> ??? 0x2210028
  0x2908c08: b        #0x2908c18
  0x2908c0c: ldrsw    x9, [x10]
  0x2908c10: add      x8, x8, x9, lsl #4
  0x2908c14: add      x0, x8, #0x138
  0x2908c18: ldp      x8, x1, [x0]
  0x2908c1c: mov      x0, x20
  0x2908c20: blr      x8
  0x2908c24: tbz      w0, #0, #0x2908cf0
  0x2908c28: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2908c2c: ldr      x1, [x27] ; = 0x0 (u64 @ 0x55ae000)
  0x2908c30: ldrh     w9, [x8, #0x12e]
  0x2908c34: cbz      x9, #0x2908c58
  0x2908c38: ldr      x10, [x8, #0xb0]
  0x2908c3c: add      x10, x10, #8
  0x2908c40: ldur     x11, [x10, #-8]
  0x2908c44: cmp      x11, x1
  0x2908c48: b.eq     #0x2908c68
  0x2908c4c: subs     x9, x9, #1
  0x2908c50: add      x10, x10, #0x10
  0x2908c54: b.ne     #0x2908c40
  0x2908c58: mov      x0, x20
  0x2908c5c: mov      w2, wzr
  0x2908c60: bl       #0x2210028 ; -> ??? 0x2210028
  0x2908c64: b        #0x2908c74
  0x2908c68: ldrsw    x9, [x10]
  0x2908c6c: add      x8, x8, x9, lsl #4
  0x2908c70: add      x0, x8, #0x138
  0x2908c74: ldp      x8, x1, [x0]
  0x2908c78: mov      x0, x20
  0x2908c7c: blr      x8
  0x2908c80: mov      x24, x0
  0x2908c84: tbz      w22, #0, #0x2908ca0
  0x2908c88: cbz      x24, #0x2908d74
  0x2908c8c: ldrb     w8, [x24, #0x18]
  0x2908c90: ldrb     w9, [x23, #0x78]
  0x2908c94: cmp      w8, w9
  0x2908c98: b.hi     #0x2908bcc
  0x2908c9c: b        #0x2908cb0
  0x2908ca0: cbz      x24, #0x2908d70
  0x2908ca4: ldrb     w8, [x24, #0x18]
  0x2908ca8: cmp      w8, w21
  0x2908cac: b.ne     #0x2908bcc
  0x2908cb0: ldr      w2, [x24, #0x1c]
  0x2908cb4: cbz      w2, #0x2908cc4
  0x2908cb8: ldr      w3, [x24, #0x20]
  0x2908cbc: mov      x1, x19
  0x2908cc0: bl       #0x290a124 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x2908cc4: ldr      w2, [x24, #0x24]
  0x2908cc8: cbz      w2, #0x2908cd8
  0x2908ccc: ldr      w3, [x24, #0x28]
  0x2908cd0: mov      x1, x19
  0x2908cd4: bl       #0x290a124 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x2908cd8: ldr      w2, [x24, #0x2c]
  0x2908cdc: cbz      w2, #0x2908bcc
  0x2908ce0: ldr      w3, [x24, #0x30]
  0x2908ce4: mov      x1, x19
  0x2908ce8: bl       #0x290a124 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x2908cec: b        #0x2908bcc
  0x2908cf0: mov      x21, xzr
  0x2908cf4: cbz      x20, #0x2908d50
  0x2908cf8: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2908cfc: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2908d00: ldrh     w9, [x8, #0x12e]
  0x2908d04: cbz      x9, #0x2908d28
  0x2908d08: ldr      x10, [x8, #0xb0]
  0x2908d0c: add      x10, x10, #8
  0x2908d10: ldur     x11, [x10, #-8]
  0x2908d14: cmp      x11, x1
  0x2908d18: b.eq     #0x2908d38
  0x2908d1c: subs     x9, x9, #1
  0x2908d20: add      x10, x10, #0x10
  0x2908d24: b.ne     #0x2908d10
  0x2908d28: mov      x0, x20
  0x2908d2c: mov      w2, wzr
  0x2908d30: bl       #0x2210028 ; -> ??? 0x2210028
  0x2908d34: b        #0x2908d44
  0x2908d38: ldrsw    x9, [x10]
  0x2908d3c: add      x8, x8, x9, lsl #4
  0x2908d40: add      x0, x8, #0x138
  0x2908d44: ldp      x8, x1, [x0]
  0x2908d48: mov      x0, x20
  0x2908d4c: blr      x8
  0x2908d50: cbnz     x21, #0x2908d80
  0x2908d54: mov      x0, x19
  0x2908d58: ldp      x20, x19, [sp, #0x40]
  0x2908d5c: ldp      x22, x21, [sp, #0x30]
  0x2908d60: ldp      x24, x23, [sp, #0x20]
  0x2908d64: ldp      x26, x25, [sp, #0x10]
  0x2908d68: ldp      x30, x27, [sp], #0x50
  0x2908d6c: ret      
  0x2908d70: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2908d74: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2908d78: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2908d7c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2908d80: mov      x0, x21
  0x2908d84: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2908d88: b        #0x2908da4
  0x2908d8c: b        #0x2908da4
  0x2908d90: b        #0x2908da4
  0x2908d94: b        #0x2908da4
  0x2908d98: b        #0x2908da4
  0x2908d9c: b        #0x2908da4
  0x2908da0: b        #0x2908da4
  0x2908da4: mov      x22, x0
  0x2908da8: cmp      w1, #1
  0x2908dac: b.ne     #0x2908dc4
  0x2908db0: mov      x0, x22
  0x2908db4: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2908db8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x2908dbc: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2908dc0: b        #0x2908cf4
  0x2908dc4: mov      x21, xzr
  0x2908dc8: b        #0x2908dd0
  0x2908dcc: mov      x22, x0
  0x2908dd0: cbz      x20, #0x2908e2c
  0x2908dd4: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2908dd8: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2908ddc: ldrh     w9, [x8, #0x12e]
  0x2908de0: cbz      x9, #0x2908e04
  0x2908de4: ldr      x10, [x8, #0xb0]
  0x2908de8: add      x10, x10, #8
  0x2908dec: ldur     x11, [x10, #-8]
  0x2908df0: cmp      x11, x1
  0x2908df4: b.eq     #0x2908e14
  0x2908df8: subs     x9, x9, #1
  0x2908dfc: add      x10, x10, #0x10
  0x2908e00: b.ne     #0x2908dec
  0x2908e04: mov      x0, x20
  0x2908e08: mov      w2, wzr
  0x2908e0c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2908e10: b        #0x2908e20
  0x2908e14: ldrsw    x9, [x10]
  0x2908e18: add      x8, x8, x9, lsl #4
  0x2908e1c: add      x0, x8, #0x138
  0x2908e20: ldp      x8, x1, [x0]
  0x2908e24: mov      x0, x20
  0x2908e28: blr      x8
  0x2908e2c: cbnz     x21, #0x2908e38
  0x2908e30: mov      x0, x22
  0x2908e34: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2908e38: mov      x0, x21
  0x2908e3c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2908e40: bl       #0x1f86e18 ; -> ??? 0x1f86e18
