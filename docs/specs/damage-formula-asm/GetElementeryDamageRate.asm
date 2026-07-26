; ===== GetElementeryDamageRate @ 0x2c5ab60..0x2c5ac64 (taille 260 octets) =====
  0x2c5ab60: stp      x30, x21, [sp, #-0x20]!
  0x2c5ab64: stp      x20, x19, [sp, #0x10]
  0x2c5ab68: cbz      x0, #0x2c5ac60
  0x2c5ab6c: mov      x21, x1
  0x2c5ab70: mov      x1, xzr
  0x2c5ab74: mov      x19, x0
  0x2c5ab78: bl       #0x26d2d44 ; -> CCharacterBattle$$FindBuffElementSuperiority
  0x2c5ab7c: tbz      w0, #0, #0x2c5ab94
  0x2c5ab80: mov      x0, x19
  0x2c5ab84: mov      x1, xzr
  0x2c5ab88: bl       #0x26df700 ; -> CCharacterBattle$$FindBuffElementDamageRate
  0x2c5ab8c: add      w0, w0, #0x4b0
  0x2c5ab90: b        #0x2c5ac54
  0x2c5ab94: mov      x0, x19
  0x2c5ab98: mov      x1, xzr
  0x2c5ab9c: bl       #0x26df574 ; -> CCharacterBattle$$FindBuffElementInferiority
  0x2c5aba0: tbz      w0, #0, #0x2c5abac
  0x2c5aba4: mov      w0, #0x320
  0x2c5aba8: b        #0x2c5ac54
  0x2c5abac: ldr      x0, [x19, #0x28]
  0x2c5abb0: cbz      x0, #0x2c5ac60
  0x2c5abb4: mov      x1, xzr
  0x2c5abb8: bl       #0x27deac8 ; -> CCharacterData$$get_Element
  0x2c5abbc: cbz      x21, #0x2c5ac60
  0x2c5abc0: mov      w20, w0
  0x2c5abc4: ldr      x0, [x21, #0x28]
  0x2c5abc8: cbz      x0, #0x2c5ac60
  0x2c5abcc: mov      x1, xzr
  0x2c5abd0: bl       #0x27deac8 ; -> CCharacterData$$get_Element
  0x2c5abd4: cmp      w20, #2
  0x2c5abd8: b.gt     #0x2c5ac38
  0x2c5abdc: cmp      w0, #2
  0x2c5abe0: b.gt     #0x2c5ac38
  0x2c5abe4: mov      w8, #0x5556
  0x2c5abe8: add      w9, w20, #1
  0x2c5abec: movk     w8, #0x5555, lsl #16
  0x2c5abf0: smull    x10, w9, w8
  0x2c5abf4: lsr      x11, x10, #0x3f
  0x2c5abf8: lsr      x10, x10, #0x20
  0x2c5abfc: add      w10, w10, w11
  0x2c5ac00: add      w10, w10, w10, lsl #1
  0x2c5ac04: sub      w9, w9, w10
  0x2c5ac08: cmp      w9, w0
  0x2c5ac0c: b.eq     #0x2c5ab80
  0x2c5ac10: add      w9, w0, #1
  0x2c5ac14: smull    x8, w9, w8
  0x2c5ac18: lsr      x10, x8, #0x3f
  0x2c5ac1c: lsr      x8, x8, #0x20
  0x2c5ac20: add      w8, w8, w10
  0x2c5ac24: add      w8, w8, w8, lsl #1
  0x2c5ac28: sub      w8, w9, w8
  0x2c5ac2c: cmp      w8, w20
  0x2c5ac30: b.eq     #0x2c5aba4
  0x2c5ac34: b        #0x2c5ac50
  0x2c5ac38: cmp      w20, w0
  0x2c5ac3c: b.eq     #0x2c5ac50
  0x2c5ac40: cmp      w20, #3
  0x2c5ac44: b.lt     #0x2c5ac50
  0x2c5ac48: cmp      w0, #2
  0x2c5ac4c: b.gt     #0x2c5ab80
  0x2c5ac50: mov      w0, #0x3e8
  0x2c5ac54: ldp      x20, x19, [sp, #0x10]
  0x2c5ac58: ldp      x30, x21, [sp], #0x20
  0x2c5ac5c: ret      
  0x2c5ac60: bl       #0x21849c0 ; -> ??? 0x21849c0
