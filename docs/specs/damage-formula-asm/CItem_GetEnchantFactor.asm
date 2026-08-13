; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetEnchantFactor @ 0x2341ad0..0x2341c04 (taille 308 octets) =====
  0x2341ad0: str      d8, [sp, #-0x40]!
  0x2341ad4: stp      x30, x23, [sp, #0x10]
  0x2341ad8: stp      x22, x21, [sp, #0x20]
  0x2341adc: stp      x20, x19, [sp, #0x30]
  0x2341ae0: adrp     x21, #0x59d5000
  0x2341ae4: adrp     x22, #0x558a000
  0x2341ae8: ldrb     w8, [x21, #0xbb]
  0x2341aec: ldr      x22, [x22, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341af0: mov      w19, w1
  0x2341af4: mov      x20, x0
  0x2341af8: tbnz     w8, #0, #0x2341b28
  0x2341afc: adrp     x0, #0x558a000
  0x2341b00: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341b04: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341b08: adrp     x0, #0x558b000
  0x2341b0c: ldr      x0, [x0, #0xa28] ; = 0x0 (u64 @ 0x558ba28)
  0x2341b10: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341b14: adrp     x0, #0x558b000
  0x2341b18: ldr      x0, [x0, #0xa30] ; = 0x0 (u64 @ 0x558ba30)
  0x2341b1c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341b20: mov      w8, #1
  0x2341b24: strb     w8, [x21, #0xbb]
  0x2341b28: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2341b2c: ldr      w8, [x0, #0xe0]
  0x2341b30: cbnz     w8, #0x2341b38
  0x2341b34: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2341b38: mov      x0, xzr
  0x2341b3c: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341b40: ldr      x8, [x20, #0x70]
  0x2341b44: cbz      x8, #0x2341c00
  0x2341b48: cbz      x0, #0x2341c00
  0x2341b4c: ldr      w1, [x8, #0x34]
  0x2341b50: mov      x2, xzr
  0x2341b54: bl       #0x2627ac0 ; -> CTempletManager$$GetEnchantTempletList
  0x2341b58: cbz      x0, #0x2341c00
  0x2341b5c: ldr      w22, [x0, #0x18]
  0x2341b60: mov      x20, x0
  0x2341b64: cmp      w22, #1
  0x2341b68: b.lt     #0x2341be4
  0x2341b6c: adrp     x23, #0x558b000
  0x2341b70: ldr      x23, [x23, #0xa30] ; = 0x0 (u64 @ 0x558ba30)
  0x2341b74: mov      w21, wzr
  0x2341b78: fmov     s8, wzr
  0x2341b7c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x558b000)
  0x2341b80: mov      x0, x20
  0x2341b84: mov      w1, w21
  0x2341b88: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2341b8c: cbz      x0, #0x2341c00
  0x2341b90: ldrb     w8, [x0, #0x14]
  0x2341b94: cbz      w8, #0x2341bd4
  0x2341b98: ldr      x2, [x23] ; = 0x0 (u64 @ 0x558b000)
  0x2341b9c: mov      x0, x20
  0x2341ba0: mov      w1, w21
  0x2341ba4: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2341ba8: cbz      x0, #0x2341c00
  0x2341bac: ldrb     w8, [x0, #0x14]
  0x2341bb0: cmp      w8, w19, uxtb
  0x2341bb4: b.hi     #0x2341be8
  0x2341bb8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x558b000)
  0x2341bbc: mov      x0, x20
  0x2341bc0: mov      w1, w21
  0x2341bc4: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2341bc8: cbz      x0, #0x2341c00
  0x2341bcc: ldr      s0, [x0, #0x20] ; = 0.0 (f32 @ 0x558b020)
  0x2341bd0: fadd     s8, s8, s0
  0x2341bd4: add      w21, w21, #1
  0x2341bd8: cmp      w22, w21
  0x2341bdc: b.ne     #0x2341b7c
  0x2341be0: b        #0x2341be8
  0x2341be4: fmov     s8, wzr
  0x2341be8: ldp      x20, x19, [sp, #0x30]
  0x2341bec: ldp      x22, x21, [sp, #0x20]
  0x2341bf0: ldp      x30, x23, [sp, #0x10]
  0x2341bf4: mov      v0.16b, v8.16b
  0x2341bf8: ldr      d8, [sp], #0x40
  0x2341bfc: ret      
  0x2341c00: bl       #0x21afc18 ; -> ??? 0x21afc18
