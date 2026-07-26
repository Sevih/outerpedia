; ===== CCharacterData_get_Def @ 0x27e00d8..0x27e01b4 (taille 220 octets) =====
  0x27e00d8: str      x30, [sp, #-0x20]!
  0x27e00dc: stp      x20, x19, [sp, #0x10]
  0x27e00e0: adrp     x20, #0x5958000
  0x27e00e4: ldrb     w8, [x20, #0x367]
  0x27e00e8: mov      x19, x0
  0x27e00ec: tbnz     w8, #0, #0x27e0110
  0x27e00f0: adrp     x0, #0x5536000
  0x27e00f4: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e00f8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e00fc: adrp     x0, #0x5536000
  0x27e0100: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0104: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0108: mov      w8, #1
  0x27e010c: strb     w8, [x20, #0x367]
  0x27e0110: ldrb     w8, [x19, #0x28]
  0x27e0114: cbz      w8, #0x27e0120
  0x27e0118: mov      x0, x19
  0x27e011c: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e0120: ldr      x0, [x19, #0x40]
  0x27e0124: cbz      x0, #0x27e01b0
  0x27e0128: adrp     x8, #0x5536000
  0x27e012c: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0130: mov      w1, #5
  0x27e0134: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e0138: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e013c: cbz      x0, #0x27e01b0
  0x27e0140: adrp     x10, #0x5536000
  0x27e0144: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0148: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e014c: mov      x19, x0
  0x27e0150: ldrh     w9, [x8, #0x12e]
  0x27e0154: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e0158: cbz      x9, #0x27e017c
  0x27e015c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e0160: add      x10, x10, #8
  0x27e0164: ldur     x11, [x10, #-8]
  0x27e0168: cmp      x11, x1
  0x27e016c: b.eq     #0x27e018c
  0x27e0170: subs     x9, x9, #1
  0x27e0174: add      x10, x10, #0x10
  0x27e0178: b.ne     #0x27e0164
  0x27e017c: mov      w2, #1
  0x27e0180: mov      x0, x19
  0x27e0184: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e0188: b        #0x27e019c
  0x27e018c: ldr      w9, [x10]
  0x27e0190: add      w9, w9, #1
  0x27e0194: add      x8, x8, w9, sxtw #4
  0x27e0198: add      x0, x8, #0x138
  0x27e019c: ldp      x2, x1, [x0]
  0x27e01a0: mov      x0, x19
  0x27e01a4: ldp      x20, x19, [sp, #0x10]
  0x27e01a8: ldr      x30, [sp], #0x20
  0x27e01ac: br       x2
  0x27e01b0: bl       #0x21849c0 ; -> ??? 0x21849c0
