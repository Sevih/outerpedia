; ===== CCharacterData_get_PiercePower @ 0x27e0448..0x27e0524 (taille 220 octets) =====
  0x27e0448: str      x30, [sp, #-0x20]!
  0x27e044c: stp      x20, x19, [sp, #0x10]
  0x27e0450: adrp     x20, #0x5958000
  0x27e0454: ldrb     w8, [x20, #0x36b]
  0x27e0458: mov      x19, x0
  0x27e045c: tbnz     w8, #0, #0x27e0480
  0x27e0460: adrp     x0, #0x5536000
  0x27e0464: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0468: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e046c: adrp     x0, #0x5536000
  0x27e0470: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0474: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0478: mov      w8, #1
  0x27e047c: strb     w8, [x20, #0x36b]
  0x27e0480: ldrb     w8, [x19, #0x28]
  0x27e0484: cbz      w8, #0x27e0490
  0x27e0488: mov      x0, x19
  0x27e048c: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e0490: ldr      x0, [x19, #0x40]
  0x27e0494: cbz      x0, #0x27e0520
  0x27e0498: adrp     x8, #0x5536000
  0x27e049c: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e04a0: mov      w1, #9
  0x27e04a4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e04a8: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e04ac: cbz      x0, #0x27e0520
  0x27e04b0: adrp     x10, #0x5536000
  0x27e04b4: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e04b8: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e04bc: mov      x19, x0
  0x27e04c0: ldrh     w9, [x8, #0x12e]
  0x27e04c4: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e04c8: cbz      x9, #0x27e04ec
  0x27e04cc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e04d0: add      x10, x10, #8
  0x27e04d4: ldur     x11, [x10, #-8]
  0x27e04d8: cmp      x11, x1
  0x27e04dc: b.eq     #0x27e04fc
  0x27e04e0: subs     x9, x9, #1
  0x27e04e4: add      x10, x10, #0x10
  0x27e04e8: b.ne     #0x27e04d4
  0x27e04ec: mov      w2, #1
  0x27e04f0: mov      x0, x19
  0x27e04f4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e04f8: b        #0x27e050c
  0x27e04fc: ldr      w9, [x10]
  0x27e0500: add      w9, w9, #1
  0x27e0504: add      x8, x8, w9, sxtw #4
  0x27e0508: add      x0, x8, #0x138
  0x27e050c: ldp      x2, x1, [x0]
  0x27e0510: mov      x0, x19
  0x27e0514: ldp      x20, x19, [sp, #0x10]
  0x27e0518: ldr      x30, [sp], #0x20
  0x27e051c: br       x2
  0x27e0520: bl       #0x21849c0 ; -> ??? 0x21849c0
