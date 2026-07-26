; ===== CCharacterData_GetEvolutionStat @ 0x27e6b50..0x27e6f34 (taille 996 octets) =====
  0x27e6b50: stp      x30, x27, [sp, #-0x50]!
  0x27e6b54: stp      x26, x25, [sp, #0x10]
  0x27e6b58: stp      x24, x23, [sp, #0x20]
  0x27e6b5c: stp      x22, x21, [sp, #0x30]
  0x27e6b60: stp      x20, x19, [sp, #0x40]
  0x27e6b64: adrp     x24, #0x5958000
  0x27e6b68: adrp     x25, #0x5523000
  0x27e6b6c: adrp     x19, #0x5523000
  0x27e6b70: adrp     x20, #0x5511000
  0x27e6b74: ldrb     w8, [x24, #0x3a8]
  0x27e6b78: ldr      x25, [x25, #0x908] ; = 0x0 (u64 @ 0x5523908)
  0x27e6b7c: ldr      x19, [x19, #0x900] ; = 0x0 (u64 @ 0x5523900)
  0x27e6b80: ldr      x20, [x20, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e6b84: mov      w21, w2
  0x27e6b88: mov      w22, w1
  0x27e6b8c: mov      x23, x0
  0x27e6b90: tbnz     w8, #0, #0x27e6bf0
  0x27e6b94: adrp     x0, #0x5511000
  0x27e6b98: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e6b9c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6ba0: adrp     x0, #0x5523000
  0x27e6ba4: ldr      x0, [x0, #0x900] ; = 0x0 (u64 @ 0x5523900)
  0x27e6ba8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6bac: adrp     x0, #0x5523000
  0x27e6bb0: ldr      x0, [x0, #0x908] ; = 0x0 (u64 @ 0x5523908)
  0x27e6bb4: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6bb8: adrp     x0, #0x550f000
  0x27e6bbc: ldr      x0, [x0, #0x1c0] ; = 0x0 (u64 @ 0x550f1c0)
  0x27e6bc0: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6bc4: adrp     x0, #0x5534000
  0x27e6bc8: ldr      x0, [x0, #0x258] ; = 0x0 (u64 @ 0x5534258)
  0x27e6bcc: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6bd0: adrp     x0, #0x5534000
  0x27e6bd4: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x5534260)
  0x27e6bd8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6bdc: adrp     x0, #0x550f000
  0x27e6be0: ldr      x0, [x0, #0x2b8] ; = 0x0 (u64 @ 0x550f2b8)
  0x27e6be4: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e6be8: mov      w8, #1
  0x27e6bec: strb     w8, [x24, #0x3a8]
  0x27e6bf0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5523000)
  0x27e6bf4: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x27e6bf8: ldr      x1, [x19] ; = 0x0 (u64 @ 0x5523000)
  0x27e6bfc: mov      x19, x0
  0x27e6c00: bl       #0x3fa818c ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$.ctor
  0x27e6c04: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x27e6c08: ldr      w8, [x0, #0xe0]
  0x27e6c0c: cbnz     w8, #0x27e6c14
  0x27e6c10: bl       #0x218489c ; -> ??? 0x218489c
  0x27e6c14: mov      x0, xzr
  0x27e6c18: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x27e6c1c: ldr      x8, [x23, #0xf0]
  0x27e6c20: cbz      x8, #0x27e6e68
  0x27e6c24: cbz      x0, #0x27e6e68
  0x27e6c28: ldr      w1, [x8, #0x10]
  0x27e6c2c: mov      x2, xzr
  0x27e6c30: bl       #0x25f3208 ; -> CTempletManager$$GetCharacterEvolutionStatTempletList
  0x27e6c34: cbz      x0, #0x27e6e68
  0x27e6c38: adrp     x10, #0x5534000
  0x27e6c3c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x27e6c40: ldr      x10, [x10, #0x258] ; = 0x0 (u64 @ 0x5534258)
  0x27e6c44: mov      x20, x0
  0x27e6c48: ldrh     w9, [x8, #0x12e]
  0x27e6c4c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5534000)
  0x27e6c50: cbz      x9, #0x27e6c74
  0x27e6c54: ldr      x10, [x8, #0xb0]
  0x27e6c58: add      x10, x10, #8
  0x27e6c5c: ldur     x11, [x10, #-8]
  0x27e6c60: cmp      x11, x1
  0x27e6c64: b.eq     #0x27e6c84
  0x27e6c68: subs     x9, x9, #1
  0x27e6c6c: add      x10, x10, #0x10
  0x27e6c70: b.ne     #0x27e6c5c
  0x27e6c74: mov      x0, x20
  0x27e6c78: mov      w2, wzr
  0x27e6c7c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e6c80: b        #0x27e6c90
  0x27e6c84: ldrsw    x9, [x10]
  0x27e6c88: add      x8, x8, x9, lsl #4
  0x27e6c8c: add      x0, x8, #0x138
  0x27e6c90: ldp      x8, x1, [x0]
  0x27e6c94: adrp     x25, #0x550f000
  0x27e6c98: ldr      x25, [x25, #0x1c0] ; = 0x0 (u64 @ 0x550f1c0)
  0x27e6c9c: mov      x0, x20
  0x27e6ca0: blr      x8
  0x27e6ca4: mov      x20, x0
  0x27e6ca8: cbz      x0, #0x27e6e6c
  0x27e6cac: adrp     x26, #0x550f000
  0x27e6cb0: adrp     x27, #0x5534000
  0x27e6cb4: ldr      x26, [x26, #0x2b8] ; = 0x0 (u64 @ 0x550f2b8)
  0x27e6cb8: ldr      x27, [x27, #0x260] ; = 0x0 (u64 @ 0x5534260)
  0x27e6cbc: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x27e6cc0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x550f000)
  0x27e6cc4: ldrh     w9, [x8, #0x12e]
  0x27e6cc8: cbz      x9, #0x27e6cec
  0x27e6ccc: ldr      x10, [x8, #0xb0]
  0x27e6cd0: add      x10, x10, #8
  0x27e6cd4: ldur     x11, [x10, #-8]
  0x27e6cd8: cmp      x11, x1
  0x27e6cdc: b.eq     #0x27e6cfc
  0x27e6ce0: subs     x9, x9, #1
  0x27e6ce4: add      x10, x10, #0x10
  0x27e6ce8: b.ne     #0x27e6cd4
  0x27e6cec: mov      x0, x20
  0x27e6cf0: mov      w2, wzr
  0x27e6cf4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e6cf8: b        #0x27e6d08
  0x27e6cfc: ldrsw    x9, [x10]
  0x27e6d00: add      x8, x8, x9, lsl #4
  0x27e6d04: add      x0, x8, #0x138
  0x27e6d08: ldp      x8, x1, [x0]
  0x27e6d0c: mov      x0, x20
  0x27e6d10: blr      x8
  0x27e6d14: tbz      w0, #0, #0x27e6de0
  0x27e6d18: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x27e6d1c: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5534000)
  0x27e6d20: ldrh     w9, [x8, #0x12e]
  0x27e6d24: cbz      x9, #0x27e6d48
  0x27e6d28: ldr      x10, [x8, #0xb0]
  0x27e6d2c: add      x10, x10, #8
  0x27e6d30: ldur     x11, [x10, #-8]
  0x27e6d34: cmp      x11, x1
  0x27e6d38: b.eq     #0x27e6d58
  0x27e6d3c: subs     x9, x9, #1
  0x27e6d40: add      x10, x10, #0x10
  0x27e6d44: b.ne     #0x27e6d30
  0x27e6d48: mov      x0, x20
  0x27e6d4c: mov      w2, wzr
  0x27e6d50: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e6d54: b        #0x27e6d64
  0x27e6d58: ldrsw    x9, [x10]
  0x27e6d5c: add      x8, x8, x9, lsl #4
  0x27e6d60: add      x0, x8, #0x138
  0x27e6d64: ldp      x8, x1, [x0]
  0x27e6d68: mov      x0, x20
  0x27e6d6c: blr      x8
  0x27e6d70: mov      x24, x0
  0x27e6d74: tbz      w22, #0, #0x27e6d90
  0x27e6d78: cbz      x24, #0x27e6e64
  0x27e6d7c: ldrb     w8, [x24, #0x18]
  0x27e6d80: ldrb     w9, [x23, #0x78]
  0x27e6d84: cmp      w8, w9
  0x27e6d88: b.hi     #0x27e6cbc
  0x27e6d8c: b        #0x27e6da0
  0x27e6d90: cbz      x24, #0x27e6e60
  0x27e6d94: ldrb     w8, [x24, #0x18]
  0x27e6d98: cmp      w8, w21
  0x27e6d9c: b.ne     #0x27e6cbc
  0x27e6da0: ldr      w2, [x24, #0x1c]
  0x27e6da4: cbz      w2, #0x27e6db4
  0x27e6da8: ldr      w3, [x24, #0x20]
  0x27e6dac: mov      x1, x19
  0x27e6db0: bl       #0x27e8214 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x27e6db4: ldr      w2, [x24, #0x24]
  0x27e6db8: cbz      w2, #0x27e6dc8
  0x27e6dbc: ldr      w3, [x24, #0x28]
  0x27e6dc0: mov      x1, x19
  0x27e6dc4: bl       #0x27e8214 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x27e6dc8: ldr      w2, [x24, #0x2c]
  0x27e6dcc: cbz      w2, #0x27e6cbc
  0x27e6dd0: ldr      w3, [x24, #0x30]
  0x27e6dd4: mov      x1, x19
  0x27e6dd8: bl       #0x27e8214 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x27e6ddc: b        #0x27e6cbc
  0x27e6de0: mov      x21, xzr
  0x27e6de4: cbz      x20, #0x27e6e40
  0x27e6de8: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x27e6dec: ldr      x1, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x27e6df0: ldrh     w9, [x8, #0x12e]
  0x27e6df4: cbz      x9, #0x27e6e18
  0x27e6df8: ldr      x10, [x8, #0xb0]
  0x27e6dfc: add      x10, x10, #8
  0x27e6e00: ldur     x11, [x10, #-8]
  0x27e6e04: cmp      x11, x1
  0x27e6e08: b.eq     #0x27e6e28
  0x27e6e0c: subs     x9, x9, #1
  0x27e6e10: add      x10, x10, #0x10
  0x27e6e14: b.ne     #0x27e6e00
  0x27e6e18: mov      x0, x20
  0x27e6e1c: mov      w2, wzr
  0x27e6e20: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e6e24: b        #0x27e6e34
  0x27e6e28: ldrsw    x9, [x10]
  0x27e6e2c: add      x8, x8, x9, lsl #4
  0x27e6e30: add      x0, x8, #0x138
  0x27e6e34: ldp      x8, x1, [x0]
  0x27e6e38: mov      x0, x20
  0x27e6e3c: blr      x8
  0x27e6e40: cbnz     x21, #0x27e6e70
  0x27e6e44: mov      x0, x19
  0x27e6e48: ldp      x20, x19, [sp, #0x40]
  0x27e6e4c: ldp      x22, x21, [sp, #0x30]
  0x27e6e50: ldp      x24, x23, [sp, #0x20]
  0x27e6e54: ldp      x26, x25, [sp, #0x10]
  0x27e6e58: ldp      x30, x27, [sp], #0x50
  0x27e6e5c: ret      
  0x27e6e60: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e6e64: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e6e68: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e6e6c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e6e70: mov      x0, x21
  0x27e6e74: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e6e78: b        #0x27e6e94
  0x27e6e7c: b        #0x27e6e94
  0x27e6e80: b        #0x27e6e94
  0x27e6e84: b        #0x27e6e94
  0x27e6e88: b        #0x27e6e94
  0x27e6e8c: b        #0x27e6e94
  0x27e6e90: b        #0x27e6e94
  0x27e6e94: mov      x22, x0
  0x27e6e98: cmp      w1, #1
  0x27e6e9c: b.ne     #0x27e6eb4
  0x27e6ea0: mov      x0, x22
  0x27e6ea4: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x27e6ea8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x27e6eac: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x27e6eb0: b        #0x27e6de4
  0x27e6eb4: mov      x21, xzr
  0x27e6eb8: b        #0x27e6ec0
  0x27e6ebc: mov      x22, x0
  0x27e6ec0: cbz      x20, #0x27e6f1c
  0x27e6ec4: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x27e6ec8: ldr      x1, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x27e6ecc: ldrh     w9, [x8, #0x12e]
  0x27e6ed0: cbz      x9, #0x27e6ef4
  0x27e6ed4: ldr      x10, [x8, #0xb0]
  0x27e6ed8: add      x10, x10, #8
  0x27e6edc: ldur     x11, [x10, #-8]
  0x27e6ee0: cmp      x11, x1
  0x27e6ee4: b.eq     #0x27e6f04
  0x27e6ee8: subs     x9, x9, #1
  0x27e6eec: add      x10, x10, #0x10
  0x27e6ef0: b.ne     #0x27e6edc
  0x27e6ef4: mov      x0, x20
  0x27e6ef8: mov      w2, wzr
  0x27e6efc: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e6f00: b        #0x27e6f10
  0x27e6f04: ldrsw    x9, [x10]
  0x27e6f08: add      x8, x8, x9, lsl #4
  0x27e6f0c: add      x0, x8, #0x138
  0x27e6f10: ldp      x8, x1, [x0]
  0x27e6f14: mov      x0, x20
  0x27e6f18: blr      x8
  0x27e6f1c: cbnz     x21, #0x27e6f28
  0x27e6f20: mov      x0, x22
  0x27e6f24: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x27e6f28: mov      x0, x21
  0x27e6f2c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e6f30: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
