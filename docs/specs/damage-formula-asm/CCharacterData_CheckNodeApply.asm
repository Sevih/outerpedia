; ===== CCharacterData_CheckNodeApply @ 0x27e6f34..0x27e7028 (taille 244 octets) =====
  0x27e6f34: str      x30, [sp, #-0x20]!
  0x27e6f38: stp      x20, x19, [sp, #0x10]
  0x27e6f3c: cbz      x1, #0x27e7024
  0x27e6f40: ldr      x8, [x1, #0x18]
  0x27e6f44: mov      x20, x1
  0x27e6f48: cbz      x8, #0x27e7024
  0x27e6f4c: ldr      w9, [x8, #0x38]
  0x27e6f50: mov      x19, x0
  0x27e6f54: cmp      w9, #3
  0x27e6f58: b.ne     #0x27e6f8c
  0x27e6f5c: ldr      x10, [x20, #0x20]
  0x27e6f60: cbz      x10, #0x27e7024
  0x27e6f64: ldr      w10, [x10, #0x10]
  0x27e6f68: sub      w10, w10, #0xc6
  0x27e6f6c: cmp      w10, #3
  0x27e6f70: b.hi     #0x27e6f8c
  0x27e6f74: ldr      x8, [x19, #0xf0]
  0x27e6f78: cbz      x8, #0x27e7024
  0x27e6f7c: ldr      w8, [x8, #0x40]
  0x27e6f80: cmp      w8, #3
  0x27e6f84: cset     w0, gt
  0x27e6f88: b        #0x27e7018
  0x27e6f8c: ldr      x10, [x19, #0xf0]
  0x27e6f90: cbz      x10, #0x27e7024
  0x27e6f94: ldr      w10, [x10, #0x40]
  0x27e6f98: cbz      w10, #0x27e6fa4
  0x27e6f9c: mov      w0, wzr
  0x27e6fa0: b        #0x27e7018
  0x27e6fa4: cmp      w9, #5
  0x27e6fa8: b.ne     #0x27e6fc0
  0x27e6fac: mov      x0, xzr
  0x27e6fb0: bl       #0x25599b0 ; -> CDungeonScene$$IsApplyAwakeningNodeAdventureLicense
  0x27e6fb4: tbz      w0, #0, #0x27e6f9c
  0x27e6fb8: ldr      x8, [x20, #0x18]
  0x27e6fbc: cbz      x8, #0x27e7024
  0x27e6fc0: ldp      w9, w8, [x8, #0x40]
  0x27e6fc4: cmp      w9, #3
  0x27e6fc8: b.eq     #0x27e6fec
  0x27e6fcc: cmp      w9, #2
  0x27e6fd0: b.eq     #0x27e6ffc
  0x27e6fd4: cmp      w9, #1
  0x27e6fd8: b.ne     #0x27e7014
  0x27e6fdc: ldr      x9, [x19, #0xf0]
  0x27e6fe0: cbz      x9, #0x27e7024
  0x27e6fe4: ldr      w9, [x9, #0x50]
  0x27e6fe8: b        #0x27e7008
  0x27e6fec: ldr      x9, [x19, #0xf0]
  0x27e6ff0: cbz      x9, #0x27e7024
  0x27e6ff4: ldr      w9, [x9, #0x4c]
  0x27e6ff8: b        #0x27e7008
  0x27e6ffc: ldr      x9, [x19, #0xf0]
  0x27e7000: cbz      x9, #0x27e7024
  0x27e7004: ldr      w9, [x9, #0x48]
  0x27e7008: cmp      w9, w8
  0x27e700c: cset     w0, eq
  0x27e7010: b        #0x27e7018
  0x27e7014: mov      w0, #1
  0x27e7018: ldp      x20, x19, [sp, #0x10]
  0x27e701c: ldr      x30, [sp], #0x20
  0x27e7020: ret      
  0x27e7024: bl       #0x21849c0 ; -> ??? 0x21849c0
