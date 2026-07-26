; ===== CFormula_CalcStat @ 0x2c59db0..0x2c59de8 (taille 56 octets) =====
  0x2c59db0: mov      x10, #0xd40b
  0x2c59db4: movk     x10, #0x95fa, lsl #16
  0x2c59db8: sub      w8, w1, w0
  0x2c59dbc: sub      w9, w2, #1
  0x2c59dc0: movk     x10, #0xb502, lsl #32
  0x2c59dc4: movk     x10, #0xa57e, lsl #48
  0x2c59dc8: smull    x11, w9, w8
  0x2c59dcc: smulh    x10, x11, x10
  0x2c59dd0: smaddl   x8, w9, w8, x10
  0x2c59dd4: lsr      x9, x8, #0x3f
  0x2c59dd8: lsr      x8, x8, #6
  0x2c59ddc: add      w8, w8, w9
  0x2c59de0: add      w0, w8, w0
  0x2c59de4: ret      
