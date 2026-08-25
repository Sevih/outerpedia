; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CheckNodeApply @ 0x29100b8..0x29101ac (taille 244 octets) =====
  0x29100b8: str      x30, [sp, #-0x20]!
  0x29100bc: stp      x20, x19, [sp, #0x10]
  0x29100c0: cbz      x1, #0x29101a8
  0x29100c4: ldr      x8, [x1, #0x18]
  0x29100c8: mov      x20, x1
  0x29100cc: cbz      x8, #0x29101a8
  0x29100d0: ldr      w9, [x8, #0x38]
  0x29100d4: mov      x19, x0
  0x29100d8: cmp      w9, #3
  0x29100dc: b.ne     #0x2910110
  0x29100e0: ldr      x10, [x20, #0x20]
  0x29100e4: cbz      x10, #0x29101a8
  0x29100e8: ldr      w10, [x10, #0x10]
  0x29100ec: sub      w10, w10, #0xc6
  0x29100f0: cmp      w10, #3
  0x29100f4: b.hi     #0x2910110
  0x29100f8: ldr      x8, [x19, #0xf0]
  0x29100fc: cbz      x8, #0x29101a8
  0x2910100: ldr      w8, [x8, #0x40]
  0x2910104: cmp      w8, #3
  0x2910108: cset     w0, gt
  0x291010c: b        #0x291019c
  0x2910110: ldr      x10, [x19, #0xf0]
  0x2910114: cbz      x10, #0x29101a8
  0x2910118: ldr      w10, [x10, #0x40]
  0x291011c: cbz      w10, #0x2910128
  0x2910120: mov      w0, wzr
  0x2910124: b        #0x291019c
  0x2910128: cmp      w9, #5
  0x291012c: b.ne     #0x2910144
  0x2910130: mov      x0, xzr
  0x2910134: bl       #0x25a561c ; -> CDungeonScene$$IsApplyAwakeningNodeAdventureLicense
  0x2910138: tbz      w0, #0, #0x2910120
  0x291013c: ldr      x8, [x20, #0x18]
  0x2910140: cbz      x8, #0x29101a8
  0x2910144: ldp      w9, w8, [x8, #0x40]
  0x2910148: cmp      w9, #3
  0x291014c: b.eq     #0x2910170
  0x2910150: cmp      w9, #2
  0x2910154: b.eq     #0x2910180
  0x2910158: cmp      w9, #1
  0x291015c: b.ne     #0x2910198
  0x2910160: ldr      x9, [x19, #0xf0]
  0x2910164: cbz      x9, #0x29101a8
  0x2910168: ldr      w9, [x9, #0x50]
  0x291016c: b        #0x291018c
  0x2910170: ldr      x9, [x19, #0xf0]
  0x2910174: cbz      x9, #0x29101a8
  0x2910178: ldr      w9, [x9, #0x4c]
  0x291017c: b        #0x291018c
  0x2910180: ldr      x9, [x19, #0xf0]
  0x2910184: cbz      x9, #0x29101a8
  0x2910188: ldr      w9, [x9, #0x48]
  0x291018c: cmp      w9, w8
  0x2910190: cset     w0, eq
  0x2910194: b        #0x291019c
  0x2910198: mov      w0, #1
  0x291019c: ldp      x20, x19, [sp, #0x10]
  0x29101a0: ldr      x30, [sp], #0x20
  0x29101a4: ret      
  0x29101a8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
