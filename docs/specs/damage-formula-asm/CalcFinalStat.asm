; ===== CalcFinalStat @ 0x2c59e48..0x2c59ee4 (taille 156 octets) =====
  0x2c59e48: ldr      w12, [sp, #0x10]
  0x2c59e4c: ldrsw    x10, [sp, #8]
  0x2c59e50: ldrsw    x11, [sp, #0x18]
  0x2c59e54: add      w14, w1, w4
  0x2c59e58: add      w14, w14, w6
  0x2c59e5c: add      w13, w2, w0
  0x2c59e60: mov      x15, #0xf7cf
  0x2c59e64: add      w14, w14, w7
  0x2c59e68: movk     x15, #0xe353, lsl #16
  0x2c59e6c: add      w13, w13, w3
  0x2c59e70: add      w12, w14, w12
  0x2c59e74: ldr      w9, [sp, #0x20]
  0x2c59e78: movk     x15, #0x9ba5, lsl #32
  0x2c59e7c: add      w13, w13, w5
  0x2c59e80: add      x10, x11, x10
  0x2c59e84: add      w11, w12, #0x3e8
  0x2c59e88: movk     x15, #0x20c4, lsl #48
  0x2c59e8c: smull    x11, w11, w13
  0x2c59e90: ldrsw    x8, [sp]
  0x2c59e94: smulh    x11, x11, x15
  0x2c59e98: asr      x13, x11, #7
  0x2c59e9c: add      w9, w9, #0x3e8
  0x2c59ea0: add      x11, x13, x11, lsr #63
  0x2c59ea4: sxtw     x16, w0
  0x2c59ea8: sxtw     x9, w9
  0x2c59eac: add      x10, x10, x11
  0x2c59eb0: mul      x8, x8, x16
  0x2c59eb4: mul      x9, x10, x9
  0x2c59eb8: smulh    x8, x8, x15
  0x2c59ebc: smulh    x9, x9, x15
  0x2c59ec0: lsr      x12, x8, #0x3f
  0x2c59ec4: lsr      x8, x8, #7
  0x2c59ec8: lsr      x10, x9, #0x3f
  0x2c59ecc: lsr      x9, x9, #7
  0x2c59ed0: add      w9, w9, w10
  0x2c59ed4: add      w8, w8, w12
  0x2c59ed8: add      w8, w9, w8
  0x2c59edc: bic      w0, w8, w8, asr #31
  0x2c59ee0: ret      
