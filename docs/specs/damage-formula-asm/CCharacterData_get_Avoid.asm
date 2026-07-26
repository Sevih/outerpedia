; ===== CCharacterData_get_Avoid @ 0x27e0894..0x27e0970 (taille 220 octets) =====
  0x27e0894: str      x30, [sp, #-0x20]!
  0x27e0898: stp      x20, x19, [sp, #0x10]
  0x27e089c: adrp     x20, #0x5958000
  0x27e08a0: ldrb     w8, [x20, #0x370]
  0x27e08a4: mov      x19, x0
  0x27e08a8: tbnz     w8, #0, #0x27e08cc
  0x27e08ac: adrp     x0, #0x5536000
  0x27e08b0: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e08b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e08b8: adrp     x0, #0x5536000
  0x27e08bc: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e08c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e08c4: mov      w8, #1
  0x27e08c8: strb     w8, [x20, #0x370]
  0x27e08cc: ldrb     w8, [x19, #0x28]
  0x27e08d0: cbz      w8, #0x27e08dc
  0x27e08d4: mov      x0, x19
  0x27e08d8: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e08dc: ldr      x0, [x19, #0x40]
  0x27e08e0: cbz      x0, #0x27e096c
  0x27e08e4: adrp     x8, #0x5536000
  0x27e08e8: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e08ec: mov      w1, #0xe
  0x27e08f0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e08f4: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e08f8: cbz      x0, #0x27e096c
  0x27e08fc: adrp     x10, #0x5536000
  0x27e0900: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0904: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0908: mov      x19, x0
  0x27e090c: ldrh     w9, [x8, #0x12e]
  0x27e0910: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e0914: cbz      x9, #0x27e0938
  0x27e0918: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e091c: add      x10, x10, #8
  0x27e0920: ldur     x11, [x10, #-8]
  0x27e0924: cmp      x11, x1
  0x27e0928: b.eq     #0x27e0948
  0x27e092c: subs     x9, x9, #1
  0x27e0930: add      x10, x10, #0x10
  0x27e0934: b.ne     #0x27e0920
  0x27e0938: mov      w2, #1
  0x27e093c: mov      x0, x19
  0x27e0940: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e0944: b        #0x27e0958
  0x27e0948: ldr      w9, [x10]
  0x27e094c: add      w9, w9, #1
  0x27e0950: add      x8, x8, w9, sxtw #4
  0x27e0954: add      x0, x8, #0x138
  0x27e0958: ldp      x2, x1, [x0]
  0x27e095c: mov      x0, x19
  0x27e0960: ldp      x20, x19, [sp, #0x10]
  0x27e0964: ldr      x30, [sp], #0x20
  0x27e0968: br       x2
  0x27e096c: bl       #0x21849c0 ; -> ??? 0x21849c0
