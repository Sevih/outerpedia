; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcArchiveStats @ 0x2907b28..0x2907d64 (taille 572 octets) =====
  0x2907b28: str      x30, [sp, #-0x40]!
  0x2907b2c: stp      x24, x23, [sp, #0x10]
  0x2907b30: stp      x22, x21, [sp, #0x20]
  0x2907b34: stp      x20, x19, [sp, #0x30]
  0x2907b38: adrp     x20, #0x59d8000
  0x2907b3c: adrp     x21, #0x558a000
  0x2907b40: ldrb     w8, [x20, #0x286]
  0x2907b44: ldr      x21, [x21, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2907b48: mov      x19, x0
  0x2907b4c: tbnz     w8, #0, #0x2907b7c
  0x2907b50: adrp     x0, #0x558a000
  0x2907b54: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2907b58: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907b5c: adrp     x0, #0x55b6000
  0x2907b60: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2907b64: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907b68: adrp     x0, #0x55b6000
  0x2907b6c: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2907b70: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907b74: mov      w8, #1
  0x2907b78: strb     w8, [x20, #0x286]
  0x2907b7c: ldr      x0, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x2907b80: ldr      w8, [x0, #0xe0]
  0x2907b84: cbnz     w8, #0x2907b8c
  0x2907b88: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2907b8c: mov      x0, xzr
  0x2907b90: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2907b94: cbz      x0, #0x2907d60
  0x2907b98: ldr      w1, [x19, #0xc8]
  0x2907b9c: mov      x2, xzr
  0x2907ba0: bl       #0x262c05c ; -> CTempletManager$$GetCharacterArchiveStatTemplet
  0x2907ba4: cbz      x0, #0x2907c1c
  0x2907ba8: mov      x20, x0
  0x2907bac: ldr      x0, [x19, #0x40]
  0x2907bb0: cbz      x0, #0x2907d60
  0x2907bb4: adrp     x23, #0x55b6000
  0x2907bb8: ldr      x23, [x23, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2907bbc: mov      w1, #4
  0x2907bc0: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907bc4: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907bc8: cbz      x0, #0x2907d60
  0x2907bcc: adrp     x24, #0x55b6000
  0x2907bd0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907bd4: ldr      x24, [x24, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2907bd8: ldrh     w22, [x20, #0x14]
  0x2907bdc: mov      x21, x0
  0x2907be0: ldrh     w9, [x8, #0x12e]
  0x2907be4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2907be8: cbz      x9, #0x2907c0c
  0x2907bec: ldr      x10, [x8, #0xb0]
  0x2907bf0: add      x10, x10, #8
  0x2907bf4: ldur     x11, [x10, #-8]
  0x2907bf8: cmp      x11, x1
  0x2907bfc: b.eq     #0x2907c30
  0x2907c00: subs     x9, x9, #1
  0x2907c04: add      x10, x10, #0x10
  0x2907c08: b.ne     #0x2907bf4
  0x2907c0c: mov      w2, #0xd
  0x2907c10: mov      x0, x21
  0x2907c14: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907c18: b        #0x2907c40
  0x2907c1c: ldp      x20, x19, [sp, #0x30]
  0x2907c20: ldp      x22, x21, [sp, #0x20]
  0x2907c24: ldp      x24, x23, [sp, #0x10]
  0x2907c28: ldr      x30, [sp], #0x40
  0x2907c2c: ret      
  0x2907c30: ldr      w9, [x10]
  0x2907c34: add      w9, w9, #0xd
  0x2907c38: add      x8, x8, w9, sxtw #4
  0x2907c3c: add      x0, x8, #0x138
  0x2907c40: ldp      x8, x2, [x0]
  0x2907c44: mov      x0, x21
  0x2907c48: mov      w1, w22
  0x2907c4c: blr      x8
  0x2907c50: ldr      x0, [x19, #0x40]
  0x2907c54: cbz      x0, #0x2907d60
  0x2907c58: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907c5c: mov      w1, #5
  0x2907c60: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907c64: cbz      x0, #0x2907d60
  0x2907c68: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907c6c: ldrh     w22, [x20, #0x16]
  0x2907c70: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2907c74: mov      x21, x0
  0x2907c78: ldrh     w9, [x8, #0x12e]
  0x2907c7c: cbz      x9, #0x2907ca0
  0x2907c80: ldr      x10, [x8, #0xb0]
  0x2907c84: add      x10, x10, #8
  0x2907c88: ldur     x11, [x10, #-8]
  0x2907c8c: cmp      x11, x1
  0x2907c90: b.eq     #0x2907cb0
  0x2907c94: subs     x9, x9, #1
  0x2907c98: add      x10, x10, #0x10
  0x2907c9c: b.ne     #0x2907c88
  0x2907ca0: mov      w2, #0xd
  0x2907ca4: mov      x0, x21
  0x2907ca8: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907cac: b        #0x2907cc0
  0x2907cb0: ldr      w9, [x10]
  0x2907cb4: add      w9, w9, #0xd
  0x2907cb8: add      x8, x8, w9, sxtw #4
  0x2907cbc: add      x0, x8, #0x138
  0x2907cc0: ldp      x8, x2, [x0]
  0x2907cc4: mov      x0, x21
  0x2907cc8: mov      w1, w22
  0x2907ccc: blr      x8
  0x2907cd0: ldr      x0, [x19, #0x40]
  0x2907cd4: cbz      x0, #0x2907d60
  0x2907cd8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907cdc: mov      w1, #1
  0x2907ce0: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907ce4: cbz      x0, #0x2907d60
  0x2907ce8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907cec: ldr      w20, [x20, #0x18]
  0x2907cf0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2907cf4: mov      x19, x0
  0x2907cf8: ldrh     w9, [x8, #0x12e]
  0x2907cfc: cbz      x9, #0x2907d20
  0x2907d00: ldr      x10, [x8, #0xb0]
  0x2907d04: add      x10, x10, #8
  0x2907d08: ldur     x11, [x10, #-8]
  0x2907d0c: cmp      x11, x1
  0x2907d10: b.eq     #0x2907d30
  0x2907d14: subs     x9, x9, #1
  0x2907d18: add      x10, x10, #0x10
  0x2907d1c: b.ne     #0x2907d08
  0x2907d20: mov      w2, #0xd
  0x2907d24: mov      x0, x19
  0x2907d28: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907d2c: b        #0x2907d40
  0x2907d30: ldr      w9, [x10]
  0x2907d34: add      w9, w9, #0xd
  0x2907d38: add      x8, x8, w9, sxtw #4
  0x2907d3c: add      x0, x8, #0x138
  0x2907d40: ldp      x3, x2, [x0]
  0x2907d44: mov      x0, x19
  0x2907d48: mov      w1, w20
  0x2907d4c: ldp      x20, x19, [sp, #0x30]
  0x2907d50: ldp      x22, x21, [sp, #0x20]
  0x2907d54: ldp      x24, x23, [sp, #0x10]
  0x2907d58: ldr      x30, [sp], #0x40
  0x2907d5c: br       x3
  0x2907d60: bl       #0x21afc18 ; -> ??? 0x21afc18
