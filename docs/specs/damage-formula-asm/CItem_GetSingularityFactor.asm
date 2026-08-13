; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetSingularityFactor @ 0x2341cd8..0x2341e28 (taille 336 octets) =====
  0x2341cd8: str      d8, [sp, #-0x30]!
  0x2341cdc: str      x30, [sp, #8]
  0x2341ce0: stp      x22, x21, [sp, #0x10]
  0x2341ce4: stp      x20, x19, [sp, #0x20]
  0x2341ce8: adrp     x22, #0x59d5000
  0x2341cec: ldrb     w8, [x22, #0xbd]
  0x2341cf0: mov      w19, w2
  0x2341cf4: mov      w21, w1
  0x2341cf8: mov      x20, x0
  0x2341cfc: tbnz     w8, #0, #0x2341d2c
  0x2341d00: adrp     x0, #0x558a000
  0x2341d04: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341d08: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341d0c: adrp     x0, #0x558b000
  0x2341d10: ldr      x0, [x0, #0xa38] ; = 0x0 (u64 @ 0x558ba38)
  0x2341d14: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341d18: adrp     x0, #0x558b000
  0x2341d1c: ldr      x0, [x0, #0xa40] ; = 0x0 (u64 @ 0x558ba40)
  0x2341d20: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341d24: mov      w8, #1
  0x2341d28: strb     w8, [x22, #0xbd]
  0x2341d2c: tst      w21, #0xff
  0x2341d30: b.eq     #0x2341db8
  0x2341d34: adrp     x8, #0x558a000
  0x2341d38: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341d3c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2341d40: ldr      w8, [x0, #0xe0]
  0x2341d44: cbnz     w8, #0x2341d4c
  0x2341d48: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2341d4c: mov      x0, xzr
  0x2341d50: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341d54: ldr      x8, [x20, #0x70]
  0x2341d58: cbz      x8, #0x2341e24
  0x2341d5c: cbz      x0, #0x2341e24
  0x2341d60: ldr      w1, [x8, #0x34]
  0x2341d64: mov      w2, wzr
  0x2341d68: mov      x3, xzr
  0x2341d6c: bl       #0x26492d4 ; -> CTempletManager$$GetSingularityEquipEnchantTemplet
  0x2341d70: mov      x21, x0
  0x2341d74: mov      x0, xzr
  0x2341d78: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341d7c: ldr      x8, [x20, #0x70]
  0x2341d80: cbz      x8, #0x2341e24
  0x2341d84: cbz      x0, #0x2341e24
  0x2341d88: ldr      w1, [x8, #0x34]
  0x2341d8c: and      w3, w19, #0xff
  0x2341d90: mov      w2, #1
  0x2341d94: mov      x4, xzr
  0x2341d98: bl       #0x26494e4 ; -> CTempletManager$$GetSingularityEquipEnchantTemplets
  0x2341d9c: mov      x19, x0
  0x2341da0: cbz      x21, #0x2341dc0
  0x2341da4: ldr      s0, [x21, #0x4c]
  0x2341da8: fmov     s1, wzr
  0x2341dac: fadd     s8, s0, s1
  0x2341db0: cbnz     x19, #0x2341dc8
  0x2341db4: b        #0x2341e24
  0x2341db8: fmov     s8, wzr
  0x2341dbc: b        #0x2341e0c
  0x2341dc0: fmov     s8, wzr
  0x2341dc4: cbz      x19, #0x2341e24
  0x2341dc8: ldr      w8, [x19, #0x18]
  0x2341dcc: cmp      w8, #1
  0x2341dd0: b.lt     #0x2341e0c
  0x2341dd4: adrp     x21, #0x558b000
  0x2341dd8: ldr      x21, [x21, #0xa40] ; = 0x0 (u64 @ 0x558ba40)
  0x2341ddc: mov      w20, wzr
  0x2341de0: ldr      x2, [x21] ; = 0x0 (u64 @ 0x558b000)
  0x2341de4: mov      x0, x19
  0x2341de8: mov      w1, w20
  0x2341dec: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2341df0: cbz      x0, #0x2341e24
  0x2341df4: ldr      w8, [x19, #0x18]
  0x2341df8: ldr      s0, [x0, #0x4c] ; = 0.0 (f32 @ 0x558b04c)
  0x2341dfc: add      w20, w20, #1
  0x2341e00: cmp      w20, w8
  0x2341e04: fadd     s8, s8, s0
  0x2341e08: b.lt     #0x2341de0
  0x2341e0c: ldp      x20, x19, [sp, #0x20]
  0x2341e10: ldp      x22, x21, [sp, #0x10]
  0x2341e14: ldr      x30, [sp, #8]
  0x2341e18: mov      v0.16b, v8.16b
  0x2341e1c: ldr      d8, [sp], #0x30
  0x2341e20: ret      
  0x2341e24: bl       #0x21afc18 ; -> ??? 0x21afc18
