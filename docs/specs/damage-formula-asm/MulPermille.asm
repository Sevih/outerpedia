; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== MulPermille @ 0x2a00d74..0x2a00d9c (taille 40 octets) =====
  0x2a00d74: mov      x9, #0xf7cf
  0x2a00d78: movk     x9, #0xe353, lsl #16
  0x2a00d7c: movk     x9, #0x9ba5, lsl #32
  0x2a00d80: smull    x8, w1, w0
  0x2a00d84: movk     x9, #0x20c4, lsl #48
  0x2a00d88: smulh    x8, x8, x9
  0x2a00d8c: lsr      x9, x8, #0x3f
  0x2a00d90: lsr      x8, x8, #7
  0x2a00d94: add      w0, w8, w9
  0x2a00d98: ret      
