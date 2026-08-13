; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_ItemOptionValue @ 0x29f9870..0x29f98d4 (taille 100 octets) =====
  0x29f9870: stp      x30, x21, [sp, #-0x20]!
  0x29f9874: stp      x20, x19, [sp, #0x10]
  0x29f9878: adrp     x21, #0x59d8000
  0x29f987c: adrp     x20, #0x558a000
  0x29f9880: ldrb     w8, [x21, #0x993]
  0x29f9884: ldr      x20, [x20, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9888: mov      x19, x0
  0x29f988c: tbnz     w8, #0, #0x29f98a4
  0x29f9890: adrp     x0, #0x558a000
  0x29f9894: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9898: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29f989c: mov      w8, #1
  0x29f98a0: strb     w8, [x21, #0x993]
  0x29f98a4: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29f98a8: ldur     x20, [x19, #0xa4]
  0x29f98ac: ldr      w19, [x19, #0xac]
  0x29f98b0: ldr      w8, [x0, #0xe0]
  0x29f98b4: cbnz     w8, #0x29f98bc
  0x29f98b8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29f98bc: mov      x0, x20
  0x29f98c0: mov      x1, x19
  0x29f98c4: ldp      x20, x19, [sp, #0x10]
  0x29f98c8: mov      x2, xzr
  0x29f98cc: ldp      x30, x21, [sp], #0x20
  0x29f98d0: b        #0x2cb18e0
