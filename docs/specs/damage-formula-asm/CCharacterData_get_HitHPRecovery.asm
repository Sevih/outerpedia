; ===== CCharacterData_get_HitHPRecovery @ 0x27e06dc..0x27e07b8 (taille 220 octets) =====
  0x27e06dc: str      x30, [sp, #-0x20]!
  0x27e06e0: stp      x20, x19, [sp, #0x10]
  0x27e06e4: adrp     x20, #0x5958000
  0x27e06e8: ldrb     w8, [x20, #0x36e]
  0x27e06ec: mov      x19, x0
  0x27e06f0: tbnz     w8, #0, #0x27e0714
  0x27e06f4: adrp     x0, #0x5536000
  0x27e06f8: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e06fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0700: adrp     x0, #0x5536000
  0x27e0704: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0708: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e070c: mov      w8, #1
  0x27e0710: strb     w8, [x20, #0x36e]
  0x27e0714: ldrb     w8, [x19, #0x28]
  0x27e0718: cbz      w8, #0x27e0724
  0x27e071c: mov      x0, x19
  0x27e0720: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e0724: ldr      x0, [x19, #0x40]
  0x27e0728: cbz      x0, #0x27e07b4
  0x27e072c: adrp     x8, #0x5536000
  0x27e0730: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0734: mov      w1, #0xc
  0x27e0738: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e073c: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e0740: cbz      x0, #0x27e07b4
  0x27e0744: adrp     x10, #0x5536000
  0x27e0748: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e074c: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0750: mov      x19, x0
  0x27e0754: ldrh     w9, [x8, #0x12e]
  0x27e0758: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e075c: cbz      x9, #0x27e0780
  0x27e0760: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e0764: add      x10, x10, #8
  0x27e0768: ldur     x11, [x10, #-8]
  0x27e076c: cmp      x11, x1
  0x27e0770: b.eq     #0x27e0790
  0x27e0774: subs     x9, x9, #1
  0x27e0778: add      x10, x10, #0x10
  0x27e077c: b.ne     #0x27e0768
  0x27e0780: mov      w2, #1
  0x27e0784: mov      x0, x19
  0x27e0788: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e078c: b        #0x27e07a0
  0x27e0790: ldr      w9, [x10]
  0x27e0794: add      w9, w9, #1
  0x27e0798: add      x8, x8, w9, sxtw #4
  0x27e079c: add      x0, x8, #0x138
  0x27e07a0: ldp      x2, x1, [x0]
  0x27e07a4: mov      x0, x19
  0x27e07a8: ldp      x20, x19, [sp, #0x10]
  0x27e07ac: ldr      x30, [sp], #0x20
  0x27e07b0: br       x2
  0x27e07b4: bl       #0x21849c0 ; -> ??? 0x21849c0
