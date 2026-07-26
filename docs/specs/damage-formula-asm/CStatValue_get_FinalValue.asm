; ===== CStatValue_get_FinalValue @ 0x28d13f4..0x28d1458 (taille 100 octets) =====
  0x28d13f4: stp      x30, x21, [sp, #-0x20]!
  0x28d13f8: stp      x20, x19, [sp, #0x10]
  0x28d13fc: adrp     x21, #0x5958000
  0x28d1400: adrp     x20, #0x5511000
  0x28d1404: ldrb     w8, [x21, #0xbb3]
  0x28d1408: ldr      x20, [x20, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d140c: mov      x19, x0
  0x28d1410: tbnz     w8, #0, #0x28d1428
  0x28d1414: adrp     x0, #0x5511000
  0x28d1418: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d141c: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d1420: mov      w8, #1
  0x28d1424: strb     w8, [x21, #0xbb3]
  0x28d1428: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d142c: ldr      x20, [x19, #0xc8]
  0x28d1430: ldr      w19, [x19, #0xd0]
  0x28d1434: ldr      w8, [x0, #0xe0]
  0x28d1438: cbnz     w8, #0x28d1440
  0x28d143c: bl       #0x218489c ; -> ??? 0x218489c
  0x28d1440: mov      x0, x20
  0x28d1444: mov      x1, x19
  0x28d1448: ldp      x20, x19, [sp, #0x10]
  0x28d144c: mov      x2, xzr
  0x28d1450: ldp      x30, x21, [sp], #0x20
  0x28d1454: b        #0x2c59abc
