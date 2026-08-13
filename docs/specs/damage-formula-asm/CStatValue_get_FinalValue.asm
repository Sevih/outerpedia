; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_FinalValue @ 0x29f9bc0..0x29f9c24 (taille 100 octets) =====
  0x29f9bc0: stp      x30, x21, [sp, #-0x20]!
  0x29f9bc4: stp      x20, x19, [sp, #0x10]
  0x29f9bc8: adrp     x21, #0x59d8000
  0x29f9bcc: adrp     x20, #0x558a000
  0x29f9bd0: ldrb     w8, [x21, #0x99b]
  0x29f9bd4: ldr      x20, [x20, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9bd8: mov      x19, x0
  0x29f9bdc: tbnz     w8, #0, #0x29f9bf4
  0x29f9be0: adrp     x0, #0x558a000
  0x29f9be4: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29f9be8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29f9bec: mov      w8, #1
  0x29f9bf0: strb     w8, [x21, #0x99b]
  0x29f9bf4: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29f9bf8: ldr      x20, [x19, #0xc8]
  0x29f9bfc: ldr      w19, [x19, #0xd0]
  0x29f9c00: ldr      w8, [x0, #0xe0]
  0x29f9c04: cbnz     w8, #0x29f9c0c
  0x29f9c08: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29f9c0c: mov      x0, x20
  0x29f9c10: mov      x1, x19
  0x29f9c14: ldp      x20, x19, [sp, #0x10]
  0x29f9c18: mov      x2, xzr
  0x29f9c1c: ldp      x30, x21, [sp], #0x20
  0x29f9c20: b        #0x2cb18e0
