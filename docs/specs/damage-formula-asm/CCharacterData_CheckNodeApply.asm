; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CheckNodeApply @ 0x2908e44..0x2908f38 (taille 244 octets) =====
  0x2908e44: str      x30, [sp, #-0x20]!
  0x2908e48: stp      x20, x19, [sp, #0x10]
  0x2908e4c: cbz      x1, #0x2908f34
  0x2908e50: ldr      x8, [x1, #0x18]
  0x2908e54: mov      x20, x1
  0x2908e58: cbz      x8, #0x2908f34
  0x2908e5c: ldr      w9, [x8, #0x38]
  0x2908e60: mov      x19, x0
  0x2908e64: cmp      w9, #3
  0x2908e68: b.ne     #0x2908e9c
  0x2908e6c: ldr      x10, [x20, #0x20]
  0x2908e70: cbz      x10, #0x2908f34
  0x2908e74: ldr      w10, [x10, #0x10]
  0x2908e78: sub      w10, w10, #0xc6
  0x2908e7c: cmp      w10, #3
  0x2908e80: b.hi     #0x2908e9c
  0x2908e84: ldr      x8, [x19, #0xf0]
  0x2908e88: cbz      x8, #0x2908f34
  0x2908e8c: ldr      w8, [x8, #0x40]
  0x2908e90: cmp      w8, #3
  0x2908e94: cset     w0, gt
  0x2908e98: b        #0x2908f28
  0x2908e9c: ldr      x10, [x19, #0xf0]
  0x2908ea0: cbz      x10, #0x2908f34
  0x2908ea4: ldr      w10, [x10, #0x40]
  0x2908ea8: cbz      w10, #0x2908eb4
  0x2908eac: mov      w0, wzr
  0x2908eb0: b        #0x2908f28
  0x2908eb4: cmp      w9, #5
  0x2908eb8: b.ne     #0x2908ed0
  0x2908ebc: mov      x0, xzr
  0x2908ec0: bl       #0x259eca4 ; -> CDungeonScene$$IsApplyAwakeningNodeAdventureLicense
  0x2908ec4: tbz      w0, #0, #0x2908eac
  0x2908ec8: ldr      x8, [x20, #0x18]
  0x2908ecc: cbz      x8, #0x2908f34
  0x2908ed0: ldp      w9, w8, [x8, #0x40]
  0x2908ed4: cmp      w9, #3
  0x2908ed8: b.eq     #0x2908efc
  0x2908edc: cmp      w9, #2
  0x2908ee0: b.eq     #0x2908f0c
  0x2908ee4: cmp      w9, #1
  0x2908ee8: b.ne     #0x2908f24
  0x2908eec: ldr      x9, [x19, #0xf0]
  0x2908ef0: cbz      x9, #0x2908f34
  0x2908ef4: ldr      w9, [x9, #0x50]
  0x2908ef8: b        #0x2908f18
  0x2908efc: ldr      x9, [x19, #0xf0]
  0x2908f00: cbz      x9, #0x2908f34
  0x2908f04: ldr      w9, [x9, #0x4c]
  0x2908f08: b        #0x2908f18
  0x2908f0c: ldr      x9, [x19, #0xf0]
  0x2908f10: cbz      x9, #0x2908f34
  0x2908f14: ldr      w9, [x9, #0x48]
  0x2908f18: cmp      w9, w8
  0x2908f1c: cset     w0, eq
  0x2908f20: b        #0x2908f28
  0x2908f24: mov      w0, #1
  0x2908f28: ldp      x20, x19, [sp, #0x10]
  0x2908f2c: ldr      x30, [sp], #0x20
  0x2908f30: ret      
  0x2908f34: bl       #0x21afc18 ; -> ??? 0x21afc18
