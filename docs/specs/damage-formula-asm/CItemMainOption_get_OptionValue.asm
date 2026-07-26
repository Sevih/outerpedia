; ===== CItemMainOption_get_OptionValue @ 0x230db18..0x230db70 (taille 88 octets) =====
  0x230db18: str      x30, [sp, #-0x10]!
  0x230db1c: ldr      x8, [x0, #0x18]
  0x230db20: cbz      x8, #0x230db6c
  0x230db24: ldr      s1, [x0, #0x20]
  0x230db28: ldp      s2, s0, [x0, #0x24]
  0x230db2c: ldr      s3, [x8, #0x24]
  0x230db30: fmov     s4, #1.00000000
  0x230db34: fadd     s1, s1, s4
  0x230db38: fadd     s0, s1, s0
  0x230db3c: scvtf    s3, s3
  0x230db40: mov      w8, #0x7f800000
  0x230db44: fadd     s2, s2, s4
  0x230db48: fmul     s0, s0, s3
  0x230db4c: fmov     s4, w8
  0x230db50: fmul     s0, s0, s2
  0x230db54: fcvtzs   w8, s0
  0x230db58: fcmp     s0, s4
  0x230db5c: mov      w9, #-0xffffffff80000000
  0x230db60: csel     w0, w9, w8, eq
  0x230db64: ldr      x30, [sp], #0x10
  0x230db68: ret      
  0x230db6c: bl       #0x21849c0 ; -> ??? 0x21849c0
