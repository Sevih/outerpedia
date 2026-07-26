; ===== CCharacterData_CalcArchiveStats @ 0x27e5c18..0x27e5e54 (taille 572 octets) =====
  0x27e5c18: str      x30, [sp, #-0x40]!
  0x27e5c1c: stp      x24, x23, [sp, #0x10]
  0x27e5c20: stp      x22, x21, [sp, #0x20]
  0x27e5c24: stp      x20, x19, [sp, #0x30]
  0x27e5c28: adrp     x20, #0x5958000
  0x27e5c2c: adrp     x21, #0x5511000
  0x27e5c30: ldrb     w8, [x20, #0x392]
  0x27e5c34: ldr      x21, [x21, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e5c38: mov      x19, x0
  0x27e5c3c: tbnz     w8, #0, #0x27e5c6c
  0x27e5c40: adrp     x0, #0x5511000
  0x27e5c44: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e5c48: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5c4c: adrp     x0, #0x5536000
  0x27e5c50: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e5c54: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5c58: adrp     x0, #0x5536000
  0x27e5c5c: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e5c60: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5c64: mov      w8, #1
  0x27e5c68: strb     w8, [x20, #0x392]
  0x27e5c6c: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x27e5c70: ldr      w8, [x0, #0xe0]
  0x27e5c74: cbnz     w8, #0x27e5c7c
  0x27e5c78: bl       #0x218489c ; -> ??? 0x218489c
  0x27e5c7c: mov      x0, xzr
  0x27e5c80: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x27e5c84: cbz      x0, #0x27e5e50
  0x27e5c88: ldr      w1, [x19, #0xc8]
  0x27e5c8c: mov      x2, xzr
  0x27e5c90: bl       #0x25f50d4 ; -> CTempletManager$$GetCharacterArchiveStatTemplet
  0x27e5c94: cbz      x0, #0x27e5d0c
  0x27e5c98: mov      x20, x0
  0x27e5c9c: ldr      x0, [x19, #0x40]
  0x27e5ca0: cbz      x0, #0x27e5e50
  0x27e5ca4: adrp     x23, #0x5536000
  0x27e5ca8: ldr      x23, [x23, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e5cac: mov      w1, #4
  0x27e5cb0: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5cb4: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5cb8: cbz      x0, #0x27e5e50
  0x27e5cbc: adrp     x24, #0x5536000
  0x27e5cc0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5cc4: ldr      x24, [x24, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e5cc8: ldrh     w22, [x20, #0x14]
  0x27e5ccc: mov      x21, x0
  0x27e5cd0: ldrh     w9, [x8, #0x12e]
  0x27e5cd4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5cd8: cbz      x9, #0x27e5cfc
  0x27e5cdc: ldr      x10, [x8, #0xb0]
  0x27e5ce0: add      x10, x10, #8
  0x27e5ce4: ldur     x11, [x10, #-8]
  0x27e5ce8: cmp      x11, x1
  0x27e5cec: b.eq     #0x27e5d20
  0x27e5cf0: subs     x9, x9, #1
  0x27e5cf4: add      x10, x10, #0x10
  0x27e5cf8: b.ne     #0x27e5ce4
  0x27e5cfc: mov      w2, #0xd
  0x27e5d00: mov      x0, x21
  0x27e5d04: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5d08: b        #0x27e5d30
  0x27e5d0c: ldp      x20, x19, [sp, #0x30]
  0x27e5d10: ldp      x22, x21, [sp, #0x20]
  0x27e5d14: ldp      x24, x23, [sp, #0x10]
  0x27e5d18: ldr      x30, [sp], #0x40
  0x27e5d1c: ret      
  0x27e5d20: ldr      w9, [x10]
  0x27e5d24: add      w9, w9, #0xd
  0x27e5d28: add      x8, x8, w9, sxtw #4
  0x27e5d2c: add      x0, x8, #0x138
  0x27e5d30: ldp      x8, x2, [x0]
  0x27e5d34: mov      x0, x21
  0x27e5d38: mov      w1, w22
  0x27e5d3c: blr      x8
  0x27e5d40: ldr      x0, [x19, #0x40]
  0x27e5d44: cbz      x0, #0x27e5e50
  0x27e5d48: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5d4c: mov      w1, #5
  0x27e5d50: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5d54: cbz      x0, #0x27e5e50
  0x27e5d58: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5d5c: ldrh     w22, [x20, #0x16]
  0x27e5d60: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5d64: mov      x21, x0
  0x27e5d68: ldrh     w9, [x8, #0x12e]
  0x27e5d6c: cbz      x9, #0x27e5d90
  0x27e5d70: ldr      x10, [x8, #0xb0]
  0x27e5d74: add      x10, x10, #8
  0x27e5d78: ldur     x11, [x10, #-8]
  0x27e5d7c: cmp      x11, x1
  0x27e5d80: b.eq     #0x27e5da0
  0x27e5d84: subs     x9, x9, #1
  0x27e5d88: add      x10, x10, #0x10
  0x27e5d8c: b.ne     #0x27e5d78
  0x27e5d90: mov      w2, #0xd
  0x27e5d94: mov      x0, x21
  0x27e5d98: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5d9c: b        #0x27e5db0
  0x27e5da0: ldr      w9, [x10]
  0x27e5da4: add      w9, w9, #0xd
  0x27e5da8: add      x8, x8, w9, sxtw #4
  0x27e5dac: add      x0, x8, #0x138
  0x27e5db0: ldp      x8, x2, [x0]
  0x27e5db4: mov      x0, x21
  0x27e5db8: mov      w1, w22
  0x27e5dbc: blr      x8
  0x27e5dc0: ldr      x0, [x19, #0x40]
  0x27e5dc4: cbz      x0, #0x27e5e50
  0x27e5dc8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5dcc: mov      w1, #1
  0x27e5dd0: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5dd4: cbz      x0, #0x27e5e50
  0x27e5dd8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5ddc: ldr      w20, [x20, #0x18]
  0x27e5de0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5de4: mov      x19, x0
  0x27e5de8: ldrh     w9, [x8, #0x12e]
  0x27e5dec: cbz      x9, #0x27e5e10
  0x27e5df0: ldr      x10, [x8, #0xb0]
  0x27e5df4: add      x10, x10, #8
  0x27e5df8: ldur     x11, [x10, #-8]
  0x27e5dfc: cmp      x11, x1
  0x27e5e00: b.eq     #0x27e5e20
  0x27e5e04: subs     x9, x9, #1
  0x27e5e08: add      x10, x10, #0x10
  0x27e5e0c: b.ne     #0x27e5df8
  0x27e5e10: mov      w2, #0xd
  0x27e5e14: mov      x0, x19
  0x27e5e18: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5e1c: b        #0x27e5e30
  0x27e5e20: ldr      w9, [x10]
  0x27e5e24: add      w9, w9, #0xd
  0x27e5e28: add      x8, x8, w9, sxtw #4
  0x27e5e2c: add      x0, x8, #0x138
  0x27e5e30: ldp      x3, x2, [x0]
  0x27e5e34: mov      x0, x19
  0x27e5e38: mov      w1, w20
  0x27e5e3c: ldp      x20, x19, [sp, #0x30]
  0x27e5e40: ldp      x22, x21, [sp, #0x20]
  0x27e5e44: ldp      x24, x23, [sp, #0x10]
  0x27e5e48: ldr      x30, [sp], #0x40
  0x27e5e4c: br       x3
  0x27e5e50: bl       #0x21849c0 ; -> ??? 0x21849c0
