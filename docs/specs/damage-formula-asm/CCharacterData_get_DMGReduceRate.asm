; ===== CCharacterData_get_DMGReduceRate @ 0x27e01b4..0x27e0290 (taille 220 octets) =====
  0x27e01b4: str      x30, [sp, #-0x20]!
  0x27e01b8: stp      x20, x19, [sp, #0x10]
  0x27e01bc: adrp     x20, #0x5958000
  0x27e01c0: ldrb     w8, [x20, #0x368]
  0x27e01c4: mov      x19, x0
  0x27e01c8: tbnz     w8, #0, #0x27e01ec
  0x27e01cc: adrp     x0, #0x5536000
  0x27e01d0: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e01d4: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e01d8: adrp     x0, #0x5536000
  0x27e01dc: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e01e0: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e01e4: mov      w8, #1
  0x27e01e8: strb     w8, [x20, #0x368]
  0x27e01ec: ldrb     w8, [x19, #0x28]
  0x27e01f0: cbz      w8, #0x27e01fc
  0x27e01f4: mov      x0, x19
  0x27e01f8: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e01fc: ldr      x0, [x19, #0x40]
  0x27e0200: cbz      x0, #0x27e028c
  0x27e0204: adrp     x8, #0x5536000
  0x27e0208: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e020c: mov      w1, #6
  0x27e0210: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e0214: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e0218: cbz      x0, #0x27e028c
  0x27e021c: adrp     x10, #0x5536000
  0x27e0220: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0224: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0228: mov      x19, x0
  0x27e022c: ldrh     w9, [x8, #0x12e]
  0x27e0230: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e0234: cbz      x9, #0x27e0258
  0x27e0238: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e023c: add      x10, x10, #8
  0x27e0240: ldur     x11, [x10, #-8]
  0x27e0244: cmp      x11, x1
  0x27e0248: b.eq     #0x27e0268
  0x27e024c: subs     x9, x9, #1
  0x27e0250: add      x10, x10, #0x10
  0x27e0254: b.ne     #0x27e0240
  0x27e0258: mov      w2, #1
  0x27e025c: mov      x0, x19
  0x27e0260: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e0264: b        #0x27e0278
  0x27e0268: ldr      w9, [x10]
  0x27e026c: add      w9, w9, #1
  0x27e0270: add      x8, x8, w9, sxtw #4
  0x27e0274: add      x0, x8, #0x138
  0x27e0278: ldp      x2, x1, [x0]
  0x27e027c: mov      x0, x19
  0x27e0280: ldp      x20, x19, [sp, #0x10]
  0x27e0284: ldr      x30, [sp], #0x20
  0x27e0288: br       x2
  0x27e028c: bl       #0x21849c0 ; -> ??? 0x21849c0
