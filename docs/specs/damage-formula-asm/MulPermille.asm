; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== MulPermille @ 0x2a0b520..0x2a0b548 (taille 40 octets) =====
  0x2a0b520: mov      x9, #0xf7cf
  0x2a0b524: movk     x9, #0xe353, lsl #16
  0x2a0b528: movk     x9, #0x9ba5, lsl #32
  0x2a0b52c: smull    x8, w1, w0
  0x2a0b530: movk     x9, #0x20c4, lsl #48
  0x2a0b534: smulh    x8, x8, x9
  0x2a0b538: lsr      x9, x8, #0x3f
  0x2a0b53c: lsr      x8, x8, #7
  0x2a0b540: add      w0, w8, w9
  0x2a0b544: ret      
