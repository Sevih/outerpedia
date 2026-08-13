; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_PiercePowerRate @ 0x2902434..0x2902510 (taille 220 octets) =====
  0x2902434: str      x30, [sp, #-0x20]!
  0x2902438: stp      x20, x19, [sp, #0x10]
  0x290243c: adrp     x20, #0x59d8000
  0x2902440: ldrb     w8, [x20, #0x260]
  0x2902444: mov      x19, x0
  0x2902448: tbnz     w8, #0, #0x290246c
  0x290244c: adrp     x0, #0x55b6000
  0x2902450: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902454: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902458: adrp     x0, #0x55b6000
  0x290245c: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902460: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902464: mov      w8, #1
  0x2902468: strb     w8, [x20, #0x260]
  0x290246c: ldrb     w8, [x19, #0x28]
  0x2902470: cbz      w8, #0x290247c
  0x2902474: mov      x0, x19
  0x2902478: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x290247c: ldr      x0, [x19, #0x40]
  0x2902480: cbz      x0, #0x290250c
  0x2902484: adrp     x8, #0x55b6000
  0x2902488: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290248c: mov      w1, #0xa
  0x2902490: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902494: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902498: cbz      x0, #0x290250c
  0x290249c: adrp     x10, #0x55b6000
  0x29024a0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x29024a4: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29024a8: mov      x19, x0
  0x29024ac: ldrh     w9, [x8, #0x12e]
  0x29024b0: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x29024b4: cbz      x9, #0x29024d8
  0x29024b8: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29024bc: add      x10, x10, #8
  0x29024c0: ldur     x11, [x10, #-8]
  0x29024c4: cmp      x11, x1
  0x29024c8: b.eq     #0x29024e8
  0x29024cc: subs     x9, x9, #1
  0x29024d0: add      x10, x10, #0x10
  0x29024d4: b.ne     #0x29024c0
  0x29024d8: mov      w2, #1
  0x29024dc: mov      x0, x19
  0x29024e0: bl       #0x2210028 ; -> ??? 0x2210028
  0x29024e4: b        #0x29024f8
  0x29024e8: ldr      w9, [x10]
  0x29024ec: add      w9, w9, #1
  0x29024f0: add      x8, x8, w9, sxtw #4
  0x29024f4: add      x0, x8, #0x138
  0x29024f8: ldp      x2, x1, [x0]
  0x29024fc: mov      x0, x19
  0x2902500: ldp      x20, x19, [sp, #0x10]
  0x2902504: ldr      x30, [sp], #0x20
  0x2902508: br       x2
  0x290250c: bl       #0x21afc18 ; -> ??? 0x21afc18
