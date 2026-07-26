; ===== CheckResist @ 0x2c5a388..0x2c5a448 (taille 192 octets) =====
  0x2c5a388: stp      d9, d8, [sp, #-0x20]!
  0x2c5a38c: stp      x30, x19, [sp, #0x10]
  0x2c5a390: subs     w8, w1, w0
  0x2c5a394: b.lt     #0x2c5a438
  0x2c5a398: cmp      w8, #0
  0x2c5a39c: mov      w9, #0x42c80000
  0x2c5a3a0: adrp     x19, #0x5955000
  0x2c5a3a4: csinc    w8, w8, wzr, ne
  0x2c5a3a8: fmov     s0, w9
  0x2c5a3ac: ldrb     w9, [x19, #0x8ff]
  0x2c5a3b0: scvtf    s1, w8
  0x2c5a3b4: fdiv     s0, s0, s1
  0x2c5a3b8: fmov     s1, #1.00000000
  0x2c5a3bc: mov      w8, #0x447a0000
  0x2c5a3c0: fadd     s8, s0, s1
  0x2c5a3c4: fmov     s9, w8
  0x2c5a3c8: cbnz     w9, #0x2c5a3e0
  0x2c5a3cc: adrp     x0, #0x550f000
  0x2c5a3d0: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5a3d4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a3d8: mov      w8, #1
  0x2c5a3dc: strb     w8, [x19, #0x8ff]
  0x2c5a3e0: adrp     x8, #0x550f000
  0x2c5a3e4: ldr      x8, [x8, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5a3e8: fdiv     s8, s9, s8
  0x2c5a3ec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x2c5a3f0: ldr      w8, [x0, #0xe0]
  0x2c5a3f4: cbnz     w8, #0x2c5a3fc
  0x2c5a3f8: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a3fc: mov      w8, #0x7f800000
  0x2c5a400: frintm   s0, s8
  0x2c5a404: fmov     s1, w8
  0x2c5a408: fcvtms   w9, s8
  0x2c5a40c: fcmp     s0, s1
  0x2c5a410: mov      w8, #-0xffffffff80000000
  0x2c5a414: csel     w19, w8, w9, eq
  0x2c5a418: cmp      w19, #1
  0x2c5a41c: b.lt     #0x2c5a438
  0x2c5a420: mov      w1, #0x3e8
  0x2c5a424: mov      w0, wzr
  0x2c5a428: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x2c5a42c: cmp      w0, w19
  0x2c5a430: cset     w0, le
  0x2c5a434: b        #0x2c5a43c
  0x2c5a438: mov      w0, wzr
  0x2c5a43c: ldp      x30, x19, [sp, #0x10]
  0x2c5a440: ldp      d9, d8, [sp], #0x20
  0x2c5a444: ret      
