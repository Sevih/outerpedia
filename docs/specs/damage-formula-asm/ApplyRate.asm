; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== ApplyRate @ 0x2a04a10..0x2a04a3c (taille 44 octets) =====
  0x2a04a10: mov      x9, #0xf7cf
  0x2a04a14: movk     x9, #0xe353, lsl #16
  0x2a04a18: add      w8, w1, #0x3e8
  0x2a04a1c: movk     x9, #0x9ba5, lsl #32
  0x2a04a20: movk     x9, #0x20c4, lsl #48
  0x2a04a24: smull    x8, w8, w0
  0x2a04a28: smulh    x8, x8, x9
  0x2a04a2c: lsr      x9, x8, #0x3f
  0x2a04a30: lsr      x8, x8, #7
  0x2a04a34: add      w0, w8, w9
  0x2a04a38: ret      
