; ===== CCharacterData_get_Vampiric @ 0x27e0600..0x27e06dc (taille 220 octets) =====
  0x27e0600: str      x30, [sp, #-0x20]!
  0x27e0604: stp      x20, x19, [sp, #0x10]
  0x27e0608: adrp     x20, #0x5958000
  0x27e060c: ldrb     w8, [x20, #0x36d]
  0x27e0610: mov      x19, x0
  0x27e0614: tbnz     w8, #0, #0x27e0638
  0x27e0618: adrp     x0, #0x5536000
  0x27e061c: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0620: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0624: adrp     x0, #0x5536000
  0x27e0628: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e062c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0630: mov      w8, #1
  0x27e0634: strb     w8, [x20, #0x36d]
  0x27e0638: ldrb     w8, [x19, #0x28]
  0x27e063c: cbz      w8, #0x27e0648
  0x27e0640: mov      x0, x19
  0x27e0644: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e0648: ldr      x0, [x19, #0x40]
  0x27e064c: cbz      x0, #0x27e06d8
  0x27e0650: adrp     x8, #0x5536000
  0x27e0654: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0658: mov      w1, #0xb
  0x27e065c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e0660: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e0664: cbz      x0, #0x27e06d8
  0x27e0668: adrp     x10, #0x5536000
  0x27e066c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0670: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0674: mov      x19, x0
  0x27e0678: ldrh     w9, [x8, #0x12e]
  0x27e067c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e0680: cbz      x9, #0x27e06a4
  0x27e0684: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e0688: add      x10, x10, #8
  0x27e068c: ldur     x11, [x10, #-8]
  0x27e0690: cmp      x11, x1
  0x27e0694: b.eq     #0x27e06b4
  0x27e0698: subs     x9, x9, #1
  0x27e069c: add      x10, x10, #0x10
  0x27e06a0: b.ne     #0x27e068c
  0x27e06a4: mov      w2, #1
  0x27e06a8: mov      x0, x19
  0x27e06ac: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e06b0: b        #0x27e06c4
  0x27e06b4: ldr      w9, [x10]
  0x27e06b8: add      w9, w9, #1
  0x27e06bc: add      x8, x8, w9, sxtw #4
  0x27e06c0: add      x0, x8, #0x138
  0x27e06c4: ldp      x2, x1, [x0]
  0x27e06c8: mov      x0, x19
  0x27e06cc: ldp      x20, x19, [sp, #0x10]
  0x27e06d0: ldr      x30, [sp], #0x20
  0x27e06d4: br       x2
  0x27e06d8: bl       #0x21849c0 ; -> ??? 0x21849c0
