; ===== ApplyRate @ 0x28d18e4..0x28d1910 (taille 44 octets) =====
  0x28d18e4: mov      x9, #0xf7cf
  0x28d18e8: movk     x9, #0xe353, lsl #16
  0x28d18ec: add      w8, w1, #0x3e8
  0x28d18f0: movk     x9, #0x9ba5, lsl #32
  0x28d18f4: movk     x9, #0x20c4, lsl #48
  0x28d18f8: smull    x8, w8, w0
  0x28d18fc: smulh    x8, x8, x9
  0x28d1900: lsr      x9, x8, #0x3f
  0x28d1904: lsr      x8, x8, #7
  0x28d1908: add      w0, w8, w9
  0x28d190c: ret      
