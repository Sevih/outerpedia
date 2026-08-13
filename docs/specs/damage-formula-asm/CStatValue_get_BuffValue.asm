; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_BuffValue @ 0x29f9944..0x29f99a8 (taille 100 octets) =====
  0x29f9944: stp      x30, x21, [sp, #-0x20]!
  0x29f9948: stp      x20, x19, [sp, #0x10]
  0x29f994c: adrp     x21, #0x59d8000
  0x29f9950: adrp     x20, #0x558a000
  0x29f9954: ldrb     w8, [x21, #0x995]
  0x29f9958: ldr      x20, [x20, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f995c: mov      x19, x0
  0x29f9960: tbnz     w8, #0, #0x29f9978
  0x29f9964: adrp     x0, #0x558a000
  0x29f9968: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f996c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29f9970: mov      w8, #1
  0x29f9974: strb     w8, [x21, #0x995]
  0x29f9978: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29f997c: ldr      x20, [x19, #0xb0]
  0x29f9980: ldr      w19, [x19, #0xb8]
  0x29f9984: ldr      w8, [x0, #0xe0]
  0x29f9988: cbnz     w8, #0x29f9990
  0x29f998c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29f9990: mov      x0, x20
  0x29f9994: mov      x1, x19
  0x29f9998: ldp      x20, x19, [sp, #0x10]
  0x29f999c: mov      x2, xzr
  0x29f99a0: ldp      x30, x21, [sp], #0x20
  0x29f99a4: b        #0x2cb18e0
