; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== ApplyRate @ 0x29fa264..0x29fa290 (taille 44 octets) =====
  0x29fa264: mov      x9, #0xf7cf
  0x29fa268: movk     x9, #0xe353, lsl #16
  0x29fa26c: add      w8, w1, #0x3e8
  0x29fa270: movk     x9, #0x9ba5, lsl #32
  0x29fa274: movk     x9, #0x20c4, lsl #48
  0x29fa278: smull    x8, w8, w0
  0x29fa27c: smulh    x8, x8, x9
  0x29fa280: lsr      x9, x8, #0x3f
  0x29fa284: lsr      x8, x8, #7
  0x29fa288: add      w0, w8, w9
  0x29fa28c: ret      
