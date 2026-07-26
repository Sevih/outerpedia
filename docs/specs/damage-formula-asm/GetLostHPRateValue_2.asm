; ===== GetLostHPRateValue_2 @ 0x26c6d40..0x26c6dbc (taille 124 octets) =====
  0x26c6d40: stp      x30, x21, [sp, #-0x20]!
  0x26c6d44: stp      x20, x19, [sp, #0x10]
  0x26c6d48: mov      x21, x0
  0x26c6d4c: ldr      x0, [x0, #0x28]
  0x26c6d50: cbz      x0, #0x26c6db8
  0x26c6d54: mov      w20, w1
  0x26c6d58: mov      x1, xzr
  0x26c6d5c: mov      w19, w2
  0x26c6d60: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6d64: cmp      w0, #1
  0x26c6d68: b.lt     #0x26c6da8
  0x26c6d6c: ldr      x0, [x21, #0x28]
  0x26c6d70: cbz      x0, #0x26c6db8
  0x26c6d74: mov      x1, xzr
  0x26c6d78: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6d7c: ldr      x8, [x21, #0x28]
  0x26c6d80: cbz      x8, #0x26c6db8
  0x26c6d84: mov      w21, w0
  0x26c6d88: mov      x0, x8
  0x26c6d8c: mov      x1, xzr
  0x26c6d90: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6d94: sub      w8, w21, w20
  0x26c6d98: smull    x8, w8, w19
  0x26c6d9c: sxtw     x9, w0
  0x26c6da0: sdiv     x0, x8, x9
  0x26c6da4: b        #0x26c6dac
  0x26c6da8: mov      w0, wzr
  0x26c6dac: ldp      x20, x19, [sp, #0x10]
  0x26c6db0: ldp      x30, x21, [sp], #0x20
  0x26c6db4: ret      
  0x26c6db8: bl       #0x21849c0 ; -> ??? 0x21849c0
