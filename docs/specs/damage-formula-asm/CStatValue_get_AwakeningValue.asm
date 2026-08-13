; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_AwakeningValue @ 0x29f9a18..0x29f9a7c (taille 100 octets) =====
  0x29f9a18: stp      x30, x21, [sp, #-0x20]!
  0x29f9a1c: stp      x20, x19, [sp, #0x10]
  0x29f9a20: adrp     x21, #0x59d8000
  0x29f9a24: adrp     x20, #0x558a000
  0x29f9a28: ldrb     w8, [x21, #0x997]
  0x29f9a2c: ldr      x20, [x20, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9a30: mov      x19, x0
  0x29f9a34: tbnz     w8, #0, #0x29f9a4c
  0x29f9a38: adrp     x0, #0x558a000
  0x29f9a3c: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9a40: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29f9a44: mov      w8, #1
  0x29f9a48: strb     w8, [x21, #0x997]
  0x29f9a4c: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29f9a50: ldur     x20, [x19, #0xbc]
  0x29f9a54: ldr      w19, [x19, #0xc4]
  0x29f9a58: ldr      w8, [x0, #0xe0]
  0x29f9a5c: cbnz     w8, #0x29f9a64
  0x29f9a60: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29f9a64: mov      x0, x20
  0x29f9a68: mov      x1, x19
  0x29f9a6c: ldp      x20, x19, [sp, #0x10]
  0x29f9a70: mov      x2, xzr
  0x29f9a74: ldp      x30, x21, [sp], #0x20
  0x29f9a78: b        #0x2cb18e0
