; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetElementeryDamageRate @ 0x2cc13b8..0x2cc14bc (taille 260 octets) =====
  0x2cc13b8: stp      x30, x21, [sp, #-0x20]!
  0x2cc13bc: stp      x20, x19, [sp, #0x10]
  0x2cc13c0: cbz      x0, #0x2cc14b8
  0x2cc13c4: mov      x21, x1
  0x2cc13c8: mov      x1, xzr
  0x2cc13cc: mov      x19, x0
  0x2cc13d0: bl       #0x2822ae8 ; -> CCharacterBattle$$FindBuffElementSuperiority
  0x2cc13d4: tbz      w0, #0, #0x2cc13ec
  0x2cc13d8: mov      x0, x19
  0x2cc13dc: mov      x1, xzr
  0x2cc13e0: bl       #0x282fa04 ; -> CCharacterBattle$$FindBuffElementDamageRate
  0x2cc13e4: add      w0, w0, #0x4b0
  0x2cc13e8: b        #0x2cc14ac
  0x2cc13ec: mov      x0, x19
  0x2cc13f0: mov      x1, xzr
  0x2cc13f4: bl       #0x282f878 ; -> CCharacterBattle$$FindBuffElementInferiority
  0x2cc13f8: tbz      w0, #0, #0x2cc1404
  0x2cc13fc: mov      w0, #0x320
  0x2cc1400: b        #0x2cc14ac
  0x2cc1404: ldr      x0, [x19, #0x28]
  0x2cc1408: cbz      x0, #0x2cc14b8
  0x2cc140c: mov      x1, xzr
  0x2cc1410: bl       #0x29078e4 ; -> CCharacterData$$get_Element
  0x2cc1414: cbz      x21, #0x2cc14b8
  0x2cc1418: mov      w20, w0
  0x2cc141c: ldr      x0, [x21, #0x28]
  0x2cc1420: cbz      x0, #0x2cc14b8
  0x2cc1424: mov      x1, xzr
  0x2cc1428: bl       #0x29078e4 ; -> CCharacterData$$get_Element
  0x2cc142c: cmp      w20, #2
  0x2cc1430: b.gt     #0x2cc1490
  0x2cc1434: cmp      w0, #2
  0x2cc1438: b.gt     #0x2cc1490
  0x2cc143c: mov      w8, #0x5556
  0x2cc1440: add      w9, w20, #1
  0x2cc1444: movk     w8, #0x5555, lsl #16
  0x2cc1448: smull    x10, w9, w8
  0x2cc144c: lsr      x11, x10, #0x3f
  0x2cc1450: lsr      x10, x10, #0x20
  0x2cc1454: add      w10, w10, w11
  0x2cc1458: add      w10, w10, w10, lsl #1
  0x2cc145c: sub      w9, w9, w10
  0x2cc1460: cmp      w9, w0
  0x2cc1464: b.eq     #0x2cc13d8
  0x2cc1468: add      w9, w0, #1
  0x2cc146c: smull    x8, w9, w8
  0x2cc1470: lsr      x10, x8, #0x3f
  0x2cc1474: lsr      x8, x8, #0x20
  0x2cc1478: add      w8, w8, w10
  0x2cc147c: add      w8, w8, w8, lsl #1
  0x2cc1480: sub      w8, w9, w8
  0x2cc1484: cmp      w8, w20
  0x2cc1488: b.eq     #0x2cc13fc
  0x2cc148c: b        #0x2cc14a8
  0x2cc1490: cmp      w20, w0
  0x2cc1494: b.eq     #0x2cc14a8
  0x2cc1498: cmp      w20, #3
  0x2cc149c: b.lt     #0x2cc14a8
  0x2cc14a0: cmp      w0, #2
  0x2cc14a4: b.gt     #0x2cc13d8
  0x2cc14a8: mov      w0, #0x3e8
  0x2cc14ac: ldp      x20, x19, [sp, #0x10]
  0x2cc14b0: ldp      x30, x21, [sp], #0x20
  0x2cc14b4: ret      
  0x2cc14b8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
