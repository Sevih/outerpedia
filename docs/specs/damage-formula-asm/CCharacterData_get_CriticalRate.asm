; ===== CCharacterData_get_CriticalRate @ 0x27e0290..0x27e036c (taille 220 octets) =====
  0x27e0290: str      x30, [sp, #-0x20]!
  0x27e0294: stp      x20, x19, [sp, #0x10]
  0x27e0298: adrp     x20, #0x5958000
  0x27e029c: ldrb     w8, [x20, #0x369]
  0x27e02a0: mov      x19, x0
  0x27e02a4: tbnz     w8, #0, #0x27e02c8
  0x27e02a8: adrp     x0, #0x5536000
  0x27e02ac: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e02b0: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e02b4: adrp     x0, #0x5536000
  0x27e02b8: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e02bc: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e02c0: mov      w8, #1
  0x27e02c4: strb     w8, [x20, #0x369]
  0x27e02c8: ldrb     w8, [x19, #0x28]
  0x27e02cc: cbz      w8, #0x27e02d8
  0x27e02d0: mov      x0, x19
  0x27e02d4: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e02d8: ldr      x0, [x19, #0x40]
  0x27e02dc: cbz      x0, #0x27e0368
  0x27e02e0: adrp     x8, #0x5536000
  0x27e02e4: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e02e8: mov      w1, #7
  0x27e02ec: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e02f0: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e02f4: cbz      x0, #0x27e0368
  0x27e02f8: adrp     x10, #0x5536000
  0x27e02fc: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0300: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0304: mov      x19, x0
  0x27e0308: ldrh     w9, [x8, #0x12e]
  0x27e030c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e0310: cbz      x9, #0x27e0334
  0x27e0314: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e0318: add      x10, x10, #8
  0x27e031c: ldur     x11, [x10, #-8]
  0x27e0320: cmp      x11, x1
  0x27e0324: b.eq     #0x27e0344
  0x27e0328: subs     x9, x9, #1
  0x27e032c: add      x10, x10, #0x10
  0x27e0330: b.ne     #0x27e031c
  0x27e0334: mov      w2, #1
  0x27e0338: mov      x0, x19
  0x27e033c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e0340: b        #0x27e0354
  0x27e0344: ldr      w9, [x10]
  0x27e0348: add      w9, w9, #1
  0x27e034c: add      x8, x8, w9, sxtw #4
  0x27e0350: add      x0, x8, #0x138
  0x27e0354: ldp      x2, x1, [x0]
  0x27e0358: mov      x0, x19
  0x27e035c: ldp      x20, x19, [sp, #0x10]
  0x27e0360: ldr      x30, [sp], #0x20
  0x27e0364: br       x2
  0x27e0368: bl       #0x21849c0 ; -> ??? 0x21849c0
