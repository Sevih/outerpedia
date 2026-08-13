; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CFormula_CalcStat @ 0x2cb1bd4..0x2cb1c0c (taille 56 octets) =====
  0x2cb1bd4: mov      x10, #0xd40b
  0x2cb1bd8: movk     x10, #0x95fa, lsl #16
  0x2cb1bdc: sub      w8, w1, w0
  0x2cb1be0: sub      w9, w2, #1
  0x2cb1be4: movk     x10, #0xb502, lsl #32
  0x2cb1be8: movk     x10, #0xa57e, lsl #48
  0x2cb1bec: smull    x11, w9, w8
  0x2cb1bf0: smulh    x10, x11, x10
  0x2cb1bf4: smaddl   x8, w9, w8, x10
  0x2cb1bf8: lsr      x9, x8, #0x3f
  0x2cb1bfc: lsr      x8, x8, #6
  0x2cb1c00: add      w8, w8, w9
  0x2cb1c04: add      w0, w8, w0
  0x2cb1c08: ret      
