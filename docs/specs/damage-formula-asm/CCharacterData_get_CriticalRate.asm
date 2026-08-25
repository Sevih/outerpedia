; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_CriticalRate @ 0x2909414..0x29094f0 (taille 220 octets) =====
  0x2909414: str      x30, [sp, #-0x20]!
  0x2909418: stp      x20, x19, [sp, #0x10]
  0x290941c: adrp     x20, #0x59e7000
  0x2909420: ldrb     w8, [x20, #0xe7c]
  0x2909424: mov      x19, x0
  0x2909428: tbnz     w8, #0, #0x290944c
  0x290942c: adrp     x0, #0x55c5000
  0x2909430: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909434: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909438: adrp     x0, #0x55c5000
  0x290943c: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909440: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909444: mov      w8, #1
  0x2909448: strb     w8, [x20, #0xe7c]
  0x290944c: ldrb     w8, [x19, #0x28]
  0x2909450: cbz      w8, #0x290945c
  0x2909454: mov      x0, x19
  0x2909458: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x290945c: ldr      x0, [x19, #0x40]
  0x2909460: cbz      x0, #0x29094ec
  0x2909464: adrp     x8, #0x55c5000
  0x2909468: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290946c: mov      w1, #7
  0x2909470: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2909474: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909478: cbz      x0, #0x29094ec
  0x290947c: adrp     x10, #0x55c5000
  0x2909480: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2909484: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909488: mov      x19, x0
  0x290948c: ldrh     w9, [x8, #0x12e]
  0x2909490: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2909494: cbz      x9, #0x29094b8
  0x2909498: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290949c: add      x10, x10, #8
  0x29094a0: ldur     x11, [x10, #-8]
  0x29094a4: cmp      x11, x1
  0x29094a8: b.eq     #0x29094c8
  0x29094ac: subs     x9, x9, #1
  0x29094b0: add      x10, x10, #0x10
  0x29094b4: b.ne     #0x29094a0
  0x29094b8: mov      w2, #1
  0x29094bc: mov      x0, x19
  0x29094c0: bl       #0x2215130 ; -> ??? 0x2215130
  0x29094c4: b        #0x29094d8
  0x29094c8: ldr      w9, [x10]
  0x29094cc: add      w9, w9, #1
  0x29094d0: add      x8, x8, w9, sxtw #4
  0x29094d4: add      x0, x8, #0x138
  0x29094d8: ldp      x2, x1, [x0]
  0x29094dc: mov      x0, x19
  0x29094e0: ldp      x20, x19, [sp, #0x10]
  0x29094e4: ldr      x30, [sp], #0x20
  0x29094e8: br       x2
  0x29094ec: bl       #0x21b4d20 ; -> ??? 0x21b4d20
