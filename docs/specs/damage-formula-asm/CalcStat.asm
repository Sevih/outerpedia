; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcStat @ 0x2cc0608..0x2cc0640 (taille 56 octets) =====
  0x2cc0608: mov      x10, #0xd40b
  0x2cc060c: movk     x10, #0x95fa, lsl #16
  0x2cc0610: sub      w8, w1, w0
  0x2cc0614: sub      w9, w2, #1
  0x2cc0618: movk     x10, #0xb502, lsl #32
  0x2cc061c: movk     x10, #0xa57e, lsl #48
  0x2cc0620: smull    x11, w9, w8
  0x2cc0624: smulh    x10, x11, x10
  0x2cc0628: smaddl   x8, w9, w8, x10
  0x2cc062c: lsr      x9, x8, #0x3f
  0x2cc0630: lsr      x8, x8, #6
  0x2cc0634: add      w8, w8, w9
  0x2cc0638: add      w0, w8, w0
  0x2cc063c: ret      
