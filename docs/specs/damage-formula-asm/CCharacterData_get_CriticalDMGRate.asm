; ===== CCharacterData_get_CriticalDMGRate @ 0x27e036c..0x27e0448 (taille 220 octets) =====
  0x27e036c: str      x30, [sp, #-0x20]!
  0x27e0370: stp      x20, x19, [sp, #0x10]
  0x27e0374: adrp     x20, #0x5958000
  0x27e0378: ldrb     w8, [x20, #0x36a]
  0x27e037c: mov      x19, x0
  0x27e0380: tbnz     w8, #0, #0x27e03a4
  0x27e0384: adrp     x0, #0x5536000
  0x27e0388: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e038c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0390: adrp     x0, #0x5536000
  0x27e0394: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0398: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e039c: mov      w8, #1
  0x27e03a0: strb     w8, [x20, #0x36a]
  0x27e03a4: ldrb     w8, [x19, #0x28]
  0x27e03a8: cbz      w8, #0x27e03b4
  0x27e03ac: mov      x0, x19
  0x27e03b0: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e03b4: ldr      x0, [x19, #0x40]
  0x27e03b8: cbz      x0, #0x27e0444
  0x27e03bc: adrp     x8, #0x5536000
  0x27e03c0: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e03c4: mov      w1, #8
  0x27e03c8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e03cc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e03d0: cbz      x0, #0x27e0444
  0x27e03d4: adrp     x10, #0x5536000
  0x27e03d8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e03dc: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e03e0: mov      x19, x0
  0x27e03e4: ldrh     w9, [x8, #0x12e]
  0x27e03e8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e03ec: cbz      x9, #0x27e0410
  0x27e03f0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e03f4: add      x10, x10, #8
  0x27e03f8: ldur     x11, [x10, #-8]
  0x27e03fc: cmp      x11, x1
  0x27e0400: b.eq     #0x27e0420
  0x27e0404: subs     x9, x9, #1
  0x27e0408: add      x10, x10, #0x10
  0x27e040c: b.ne     #0x27e03f8
  0x27e0410: mov      w2, #1
  0x27e0414: mov      x0, x19
  0x27e0418: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e041c: b        #0x27e0430
  0x27e0420: ldr      w9, [x10]
  0x27e0424: add      w9, w9, #1
  0x27e0428: add      x8, x8, w9, sxtw #4
  0x27e042c: add      x0, x8, #0x138
  0x27e0430: ldp      x2, x1, [x0]
  0x27e0434: mov      x0, x19
  0x27e0438: ldp      x20, x19, [sp, #0x10]
  0x27e043c: ldr      x30, [sp], #0x20
  0x27e0440: br       x2
  0x27e0444: bl       #0x21849c0 ; -> ??? 0x21849c0
