; ===== GetElementSuperiority @ 0x2c5ac64..0x2c5acf8 (taille 148 octets) =====
  0x2c5ac64: cmp      w0, #2
  0x2c5ac68: b.gt     #0x2c5aca8
  0x2c5ac6c: cmp      w1, #2
  0x2c5ac70: b.gt     #0x2c5aca8
  0x2c5ac74: mov      w8, #0x5556
  0x2c5ac78: add      w9, w0, #1
  0x2c5ac7c: movk     w8, #0x5555, lsl #16
  0x2c5ac80: smull    x10, w9, w8
  0x2c5ac84: lsr      x11, x10, #0x3f
  0x2c5ac88: lsr      x10, x10, #0x20
  0x2c5ac8c: add      w10, w10, w11
  0x2c5ac90: add      w10, w10, w10, lsl #1
  0x2c5ac94: sub      w9, w9, w10
  0x2c5ac98: cmp      w9, w1
  0x2c5ac9c: b.ne     #0x2c5accc
  0x2c5aca0: mov      w8, wzr
  0x2c5aca4: b        #0x2c5acc4
  0x2c5aca8: cmp      w0, #3
  0x2c5acac: mov      w8, #1
  0x2c5acb0: b.lt     #0x2c5acc4
  0x2c5acb4: cmp      w1, #3
  0x2c5acb8: b.lt     #0x2c5acc4
  0x2c5acbc: cmp      w0, w1
  0x2c5acc0: cset     w8, eq
  0x2c5acc4: mov      w0, w8
  0x2c5acc8: ret      
  0x2c5accc: add      w9, w1, #1
  0x2c5acd0: smull    x8, w9, w8
  0x2c5acd4: lsr      x10, x8, #0x3f
  0x2c5acd8: lsr      x8, x8, #0x20
  0x2c5acdc: add      w8, w8, w10
  0x2c5ace0: add      w8, w8, w8, lsl #1
  0x2c5ace4: sub      w8, w9, w8
  0x2c5ace8: cmp      w8, w0
  0x2c5acec: mov      w8, #1
  0x2c5acf0: cinc     w0, w8, eq
  0x2c5acf4: ret      
