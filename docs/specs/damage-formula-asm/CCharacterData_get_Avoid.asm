; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Avoid @ 0x29027a4..0x2902880 (taille 220 octets) =====
  0x29027a4: str      x30, [sp, #-0x20]!
  0x29027a8: stp      x20, x19, [sp, #0x10]
  0x29027ac: adrp     x20, #0x59d8000
  0x29027b0: ldrb     w8, [x20, #0x264]
  0x29027b4: mov      x19, x0
  0x29027b8: tbnz     w8, #0, #0x29027dc
  0x29027bc: adrp     x0, #0x55b6000
  0x29027c0: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29027c4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29027c8: adrp     x0, #0x55b6000
  0x29027cc: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29027d0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29027d4: mov      w8, #1
  0x29027d8: strb     w8, [x20, #0x264]
  0x29027dc: ldrb     w8, [x19, #0x28]
  0x29027e0: cbz      w8, #0x29027ec
  0x29027e4: mov      x0, x19
  0x29027e8: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x29027ec: ldr      x0, [x19, #0x40]
  0x29027f0: cbz      x0, #0x290287c
  0x29027f4: adrp     x8, #0x55b6000
  0x29027f8: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29027fc: mov      w1, #0xe
  0x2902800: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902804: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902808: cbz      x0, #0x290287c
  0x290280c: adrp     x10, #0x55b6000
  0x2902810: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2902814: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902818: mov      x19, x0
  0x290281c: ldrh     w9, [x8, #0x12e]
  0x2902820: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2902824: cbz      x9, #0x2902848
  0x2902828: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x290282c: add      x10, x10, #8
  0x2902830: ldur     x11, [x10, #-8]
  0x2902834: cmp      x11, x1
  0x2902838: b.eq     #0x2902858
  0x290283c: subs     x9, x9, #1
  0x2902840: add      x10, x10, #0x10
  0x2902844: b.ne     #0x2902830
  0x2902848: mov      w2, #1
  0x290284c: mov      x0, x19
  0x2902850: bl       #0x2210028 ; -> ??? 0x2210028
  0x2902854: b        #0x2902868
  0x2902858: ldr      w9, [x10]
  0x290285c: add      w9, w9, #1
  0x2902860: add      x8, x8, w9, sxtw #4
  0x2902864: add      x0, x8, #0x138
  0x2902868: ldp      x2, x1, [x0]
  0x290286c: mov      x0, x19
  0x2902870: ldp      x20, x19, [sp, #0x10]
  0x2902874: ldr      x30, [sp], #0x20
  0x2902878: br       x2
  0x290287c: bl       #0x21afc18 ; -> ??? 0x21afc18
