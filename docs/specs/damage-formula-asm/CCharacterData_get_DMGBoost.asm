; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_DMGBoost @ 0x290a38c..0x290a468 (taille 220 octets) =====
  0x290a38c: str      x30, [sp, #-0x20]!
  0x290a390: stp      x20, x19, [sp, #0x10]
  0x290a394: adrp     x20, #0x59e7000
  0x290a398: ldrb     w8, [x20, #0xe8e]
  0x290a39c: mov      x19, x0
  0x290a3a0: tbnz     w8, #0, #0x290a3c4
  0x290a3a4: adrp     x0, #0x55c5000
  0x290a3a8: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290a3ac: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290a3b0: adrp     x0, #0x55c5000
  0x290a3b4: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290a3b8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290a3bc: mov      w8, #1
  0x290a3c0: strb     w8, [x20, #0xe8e]
  0x290a3c4: ldrb     w8, [x19, #0x28]
  0x290a3c8: cbz      w8, #0x290a3d4
  0x290a3cc: mov      x0, x19
  0x290a3d0: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x290a3d4: ldr      x0, [x19, #0x40]
  0x290a3d8: cbz      x0, #0x290a464
  0x290a3dc: adrp     x8, #0x55c5000
  0x290a3e0: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290a3e4: mov      w1, #0x19
  0x290a3e8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290a3ec: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290a3f0: cbz      x0, #0x290a464
  0x290a3f4: adrp     x10, #0x55c5000
  0x290a3f8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290a3fc: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290a400: mov      x19, x0
  0x290a404: ldrh     w9, [x8, #0x12e]
  0x290a408: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x290a40c: cbz      x9, #0x290a430
  0x290a410: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290a414: add      x10, x10, #8
  0x290a418: ldur     x11, [x10, #-8]
  0x290a41c: cmp      x11, x1
  0x290a420: b.eq     #0x290a440
  0x290a424: subs     x9, x9, #1
  0x290a428: add      x10, x10, #0x10
  0x290a42c: b.ne     #0x290a418
  0x290a430: mov      w2, #1
  0x290a434: mov      x0, x19
  0x290a438: bl       #0x2215130 ; -> ??? 0x2215130
  0x290a43c: b        #0x290a450
  0x290a440: ldr      w9, [x10]
  0x290a444: add      w9, w9, #1
  0x290a448: add      x8, x8, w9, sxtw #4
  0x290a44c: add      x0, x8, #0x138
  0x290a450: ldp      x2, x1, [x0]
  0x290a454: mov      x0, x19
  0x290a458: ldp      x20, x19, [sp, #0x10]
  0x290a45c: ldr      x30, [sp], #0x20
  0x290a460: br       x2
  0x290a464: bl       #0x21b4d20 ; -> ??? 0x21b4d20
