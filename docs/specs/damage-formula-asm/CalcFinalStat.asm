; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcFinalStat @ 0x2cb1c6c..0x2cb1d08 (taille 156 octets) =====
  0x2cb1c6c: ldr      w12, [sp, #0x10]
  0x2cb1c70: ldrsw    x10, [sp, #8]
  0x2cb1c74: ldrsw    x11, [sp, #0x18]
  0x2cb1c78: add      w14, w1, w4
  0x2cb1c7c: add      w14, w14, w6
  0x2cb1c80: add      w13, w2, w0
  0x2cb1c84: mov      x15, #0xf7cf
  0x2cb1c88: add      w14, w14, w7
  0x2cb1c8c: movk     x15, #0xe353, lsl #16
  0x2cb1c90: add      w13, w13, w3
  0x2cb1c94: add      w12, w14, w12
  0x2cb1c98: ldr      w9, [sp, #0x20]
  0x2cb1c9c: movk     x15, #0x9ba5, lsl #32
  0x2cb1ca0: add      w13, w13, w5
  0x2cb1ca4: add      x10, x11, x10
  0x2cb1ca8: add      w11, w12, #0x3e8
  0x2cb1cac: movk     x15, #0x20c4, lsl #48
  0x2cb1cb0: smull    x11, w11, w13
  0x2cb1cb4: ldrsw    x8, [sp]
  0x2cb1cb8: smulh    x11, x11, x15
  0x2cb1cbc: asr      x13, x11, #7
  0x2cb1cc0: add      w9, w9, #0x3e8
  0x2cb1cc4: add      x11, x13, x11, lsr #63
  0x2cb1cc8: sxtw     x16, w0
  0x2cb1ccc: sxtw     x9, w9
  0x2cb1cd0: add      x10, x10, x11
  0x2cb1cd4: mul      x8, x8, x16
  0x2cb1cd8: mul      x9, x10, x9
  0x2cb1cdc: smulh    x8, x8, x15
  0x2cb1ce0: smulh    x9, x9, x15
  0x2cb1ce4: lsr      x12, x8, #0x3f
  0x2cb1ce8: lsr      x8, x8, #7
  0x2cb1cec: lsr      x10, x9, #0x3f
  0x2cb1cf0: lsr      x9, x9, #7
  0x2cb1cf4: add      w9, w9, w10
  0x2cb1cf8: add      w8, w8, w12
  0x2cb1cfc: add      w8, w9, w8
  0x2cb1d00: bic      w0, w8, w8, asr #31
  0x2cb1d04: ret      
