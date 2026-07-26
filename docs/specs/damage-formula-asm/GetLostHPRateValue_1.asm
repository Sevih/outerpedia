; ===== GetLostHPRateValue_1 @ 0x26c6cbc..0x26c6d40 (taille 132 octets) =====
  0x26c6cbc: stp      x30, x21, [sp, #-0x20]!
  0x26c6cc0: stp      x20, x19, [sp, #0x10]
  0x26c6cc4: mov      x20, x0
  0x26c6cc8: ldr      x0, [x0, #0x28]
  0x26c6ccc: cbz      x0, #0x26c6d3c
  0x26c6cd0: mov      w19, w1
  0x26c6cd4: mov      x1, xzr
  0x26c6cd8: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6cdc: cmp      w0, #1
  0x26c6ce0: b.lt     #0x26c6d2c
  0x26c6ce4: ldr      x0, [x20, #0x28]
  0x26c6ce8: cbz      x0, #0x26c6d3c
  0x26c6cec: mov      x1, xzr
  0x26c6cf0: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6cf4: mov      w21, w0
  0x26c6cf8: mov      x0, x20
  0x26c6cfc: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x26c6d00: ldr      x8, [x20, #0x28]
  0x26c6d04: cbz      x8, #0x26c6d3c
  0x26c6d08: mov      w20, w0
  0x26c6d0c: mov      x0, x8
  0x26c6d10: mov      x1, xzr
  0x26c6d14: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6d18: sub      w8, w21, w20
  0x26c6d1c: smull    x8, w8, w19
  0x26c6d20: sxtw     x9, w0
  0x26c6d24: sdiv     x0, x8, x9
  0x26c6d28: b        #0x26c6d30
  0x26c6d2c: mov      w0, wzr
  0x26c6d30: ldp      x20, x19, [sp, #0x10]
  0x26c6d34: ldp      x30, x21, [sp], #0x20
  0x26c6d38: ret      
  0x26c6d3c: bl       #0x21849c0 ; -> ??? 0x21849c0
