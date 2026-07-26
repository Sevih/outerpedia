; ===== CItemMainOption_ctor @ 0x230dbac..0x230dd48 (taille 412 octets) =====
  0x230dbac: sub      sp, sp, #0x60
  0x230dbb0: str      d8, [sp, #0x20]
  0x230dbb4: str      x30, [sp, #0x28]
  0x230dbb8: stp      x24, x23, [sp, #0x30]
  0x230dbbc: stp      x22, x21, [sp, #0x40]
  0x230dbc0: stp      x20, x19, [sp, #0x50]
  0x230dbc4: str      d1, [sp]
  0x230dbc8: str      d0, [sp, #0x10]
  0x230dbcc: adrp     x23, #0x5955000
  0x230dbd0: adrp     x24, #0x5512000
  0x230dbd4: adrp     x22, #0x5512000
  0x230dbd8: ldrb     w8, [x23, #0x990]
  0x230dbdc: ldr      x24, [x24, #0xac0] ; = 0x0 (u64 @ 0x5512ac0)
  0x230dbe0: ldr      x22, [x22, #0xac8] ; = 0x0 (u64 @ 0x5512ac8)
  0x230dbe4: mov      v8.16b, v2.16b
  0x230dbe8: mov      x20, x2
  0x230dbec: mov      w21, w1
  0x230dbf0: mov      x19, x0
  0x230dbf4: tbnz     w8, #0, #0x230dc18
  0x230dbf8: adrp     x0, #0x5512000
  0x230dbfc: ldr      x0, [x0, #0xac8] ; = 0x0 (u64 @ 0x5512ac8)
  0x230dc00: bl       #0x2184724 ; -> ??? 0x2184724
  0x230dc04: adrp     x0, #0x5512000
  0x230dc08: ldr      x0, [x0, #0xac0] ; = 0x0 (u64 @ 0x5512ac0)
  0x230dc0c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230dc10: mov      w8, #1
  0x230dc14: strb     w8, [x23, #0x990]
  0x230dc18: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5512000)
  0x230dc1c: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x230dc20: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5512000)
  0x230dc24: mov      x22, x0
  0x230dc28: bl       #0x4449f88 ; -> System.Collections.Generic.List<object>$$.ctor
  0x230dc2c: mov      x0, x19
  0x230dc30: str      x22, [x0, #0x38]!
  0x230dc34: mov      x1, x22
  0x230dc38: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x230dc3c: mov      x0, x19
  0x230dc40: mov      x1, xzr
  0x230dc44: bl       #0x48e6ab0 ; -> System.Object$$.ctor
  0x230dc48: mov      x0, x19
  0x230dc4c: mov      w1, w21
  0x230dc50: bl       #0x230da0c ; -> CItemOption$$set_ID
  0x230dc54: ldp      q0, q3, [sp]
  0x230dc58: mov      w9, #0x447a0000
  0x230dc5c: ldr      x8, [x19, #0x18]
  0x230dc60: fmov     s1, w9
  0x230dc64: mov      v3.s[1], v0.s[0]
  0x230dc68: dup      v0.2s, w9
  0x230dc6c: fmul     s2, s8, s1
  0x230dc70: fmul     v3.2s, v3.2s, v0.2s
  0x230dc74: fdiv     s1, s2, s1
  0x230dc78: fdiv     v0.2s, v3.2s, v0.2s
  0x230dc7c: str      wzr, [x19, #0x10]
  0x230dc80: str      d0, [x19, #0x20]
  0x230dc84: str      s1, [x19, #0x28]
  0x230dc88: cbz      x8, #0x230dca8
  0x230dc8c: ldr      w9, [x8, #0x18]
  0x230dc90: cmp      w9, #1
  0x230dc94: b.ne     #0x230dca8
  0x230dc98: ldr      x0, [x8, #0x38]
  0x230dc9c: mov      x1, xzr
  0x230dca0: bl       #0x4719194 ; -> System.String$$IsNullOrEmpty
  0x230dca4: tbz      w0, #0, #0x230dcc4
  0x230dca8: ldp      x20, x19, [sp, #0x50]
  0x230dcac: ldp      x22, x21, [sp, #0x40]
  0x230dcb0: ldp      x24, x23, [sp, #0x30]
  0x230dcb4: ldr      x30, [sp, #0x28]
  0x230dcb8: ldr      d8, [sp, #0x20]
  0x230dcbc: add      sp, sp, #0x60
  0x230dcc0: ret      
  0x230dcc4: cbz      x20, #0x230dcf8
  0x230dcc8: mov      x0, x20
  0x230dccc: bl       #0x230dd48 ; -> CItem$$IsSpecialItemEnchantable
  0x230dcd0: tbz      w0, #0, #0x230dcf8
  0x230dcd4: mov      x0, xzr
  0x230dcd8: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x230dcdc: ldr      x8, [x19, #0x18]
  0x230dce0: cbz      x8, #0x230dd44
  0x230dce4: cbz      x0, #0x230dd44
  0x230dce8: ldrb     w9, [x20, #0x58]
  0x230dcec: ldr      x1, [x8, #0x38]
  0x230dcf0: add      w2, w9, #1
  0x230dcf4: b        #0x230dd14
  0x230dcf8: mov      x0, xzr
  0x230dcfc: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x230dd00: ldr      x8, [x19, #0x18]
  0x230dd04: cbz      x8, #0x230dd44
  0x230dd08: cbz      x0, #0x230dd44
  0x230dd0c: ldr      x1, [x8, #0x38]
  0x230dd10: mov      w2, #1
  0x230dd14: mov      x3, xzr
  0x230dd18: bl       #0x25a7b60 ; -> CBuffTempletContainer$$GetBuffTemplet
  0x230dd1c: str      x0, [x19, #0x30]!
  0x230dd20: mov      x1, x0
  0x230dd24: mov      x0, x19
  0x230dd28: ldp      x20, x19, [sp, #0x50]
  0x230dd2c: ldp      x22, x21, [sp, #0x40]
  0x230dd30: ldp      x24, x23, [sp, #0x30]
  0x230dd34: ldr      x30, [sp, #0x28]
  0x230dd38: ldr      d8, [sp, #0x20]
  0x230dd3c: add      sp, sp, #0x60
  0x230dd40: b        #0x21846c8
  0x230dd44: bl       #0x21849c0 ; -> ??? 0x21849c0
