; ===== MulPermille @ 0x28d81c0..0x28d81e8 (taille 40 octets) =====
  0x28d81c0: mov      x9, #0xf7cf
  0x28d81c4: movk     x9, #0xe353, lsl #16
  0x28d81c8: movk     x9, #0x9ba5, lsl #32
  0x28d81cc: smull    x8, w1, w0
  0x28d81d0: movk     x9, #0x20c4, lsl #48
  0x28d81d4: smulh    x8, x8, x9
  0x28d81d8: lsr      x9, x8, #0x3f
  0x28d81dc: lsr      x8, x8, #7
  0x28d81e0: add      w0, w8, w9
  0x28d81e4: ret      
