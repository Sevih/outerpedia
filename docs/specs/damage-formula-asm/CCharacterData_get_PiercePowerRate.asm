; ===== CCharacterData_get_PiercePowerRate @ 0x27e0524..0x27e0600 (taille 220 octets) =====
  0x27e0524: str      x30, [sp, #-0x20]!
  0x27e0528: stp      x20, x19, [sp, #0x10]
  0x27e052c: adrp     x20, #0x5958000
  0x27e0530: ldrb     w8, [x20, #0x36c]
  0x27e0534: mov      x19, x0
  0x27e0538: tbnz     w8, #0, #0x27e055c
  0x27e053c: adrp     x0, #0x5536000
  0x27e0540: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e0544: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0548: adrp     x0, #0x5536000
  0x27e054c: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0550: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e0554: mov      w8, #1
  0x27e0558: strb     w8, [x20, #0x36c]
  0x27e055c: ldrb     w8, [x19, #0x28]
  0x27e0560: cbz      w8, #0x27e056c
  0x27e0564: mov      x0, x19
  0x27e0568: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e056c: ldr      x0, [x19, #0x40]
  0x27e0570: cbz      x0, #0x27e05fc
  0x27e0574: adrp     x8, #0x5536000
  0x27e0578: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e057c: mov      w1, #0xa
  0x27e0580: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e0584: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e0588: cbz      x0, #0x27e05fc
  0x27e058c: adrp     x10, #0x5536000
  0x27e0590: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e0594: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e0598: mov      x19, x0
  0x27e059c: ldrh     w9, [x8, #0x12e]
  0x27e05a0: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e05a4: cbz      x9, #0x27e05c8
  0x27e05a8: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e05ac: add      x10, x10, #8
  0x27e05b0: ldur     x11, [x10, #-8]
  0x27e05b4: cmp      x11, x1
  0x27e05b8: b.eq     #0x27e05d8
  0x27e05bc: subs     x9, x9, #1
  0x27e05c0: add      x10, x10, #0x10
  0x27e05c4: b.ne     #0x27e05b0
  0x27e05c8: mov      w2, #1
  0x27e05cc: mov      x0, x19
  0x27e05d0: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e05d4: b        #0x27e05e8
  0x27e05d8: ldr      w9, [x10]
  0x27e05dc: add      w9, w9, #1
  0x27e05e0: add      x8, x8, w9, sxtw #4
  0x27e05e4: add      x0, x8, #0x138
  0x27e05e8: ldp      x2, x1, [x0]
  0x27e05ec: mov      x0, x19
  0x27e05f0: ldp      x20, x19, [sp, #0x10]
  0x27e05f4: ldr      x30, [sp], #0x20
  0x27e05f8: br       x2
  0x27e05fc: bl       #0x21849c0 ; -> ??? 0x21849c0
