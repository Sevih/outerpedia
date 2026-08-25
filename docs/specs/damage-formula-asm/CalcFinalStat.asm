; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcFinalStat @ 0x2cc06a0..0x2cc073c (taille 156 octets) =====
  0x2cc06a0: ldr      w12, [sp, #0x10]
  0x2cc06a4: ldrsw    x10, [sp, #8]
  0x2cc06a8: ldrsw    x11, [sp, #0x18]
  0x2cc06ac: add      w14, w1, w4
  0x2cc06b0: add      w14, w14, w6
  0x2cc06b4: add      w13, w2, w0
  0x2cc06b8: mov      x15, #0xf7cf
  0x2cc06bc: add      w14, w14, w7
  0x2cc06c0: movk     x15, #0xe353, lsl #16
  0x2cc06c4: add      w13, w13, w3
  0x2cc06c8: add      w12, w14, w12
  0x2cc06cc: ldr      w9, [sp, #0x20]
  0x2cc06d0: movk     x15, #0x9ba5, lsl #32
  0x2cc06d4: add      w13, w13, w5
  0x2cc06d8: add      x10, x11, x10
  0x2cc06dc: add      w11, w12, #0x3e8
  0x2cc06e0: movk     x15, #0x20c4, lsl #48
  0x2cc06e4: smull    x11, w11, w13
  0x2cc06e8: ldrsw    x8, [sp]
  0x2cc06ec: smulh    x11, x11, x15
  0x2cc06f0: asr      x13, x11, #7
  0x2cc06f4: add      w9, w9, #0x3e8
  0x2cc06f8: add      x11, x13, x11, lsr #63
  0x2cc06fc: sxtw     x16, w0
  0x2cc0700: sxtw     x9, w9
  0x2cc0704: add      x10, x10, x11
  0x2cc0708: mul      x8, x8, x16
  0x2cc070c: mul      x9, x10, x9
  0x2cc0710: smulh    x8, x8, x15
  0x2cc0714: smulh    x9, x9, x15
  0x2cc0718: lsr      x12, x8, #0x3f
  0x2cc071c: lsr      x8, x8, #7
  0x2cc0720: lsr      x10, x9, #0x3f
  0x2cc0724: lsr      x9, x9, #7
  0x2cc0728: add      w9, w9, w10
  0x2cc072c: add      w8, w8, w12
  0x2cc0730: add      w8, w9, w8
  0x2cc0734: bic      w0, w8, w8, asr #31
  0x2cc0738: ret      
