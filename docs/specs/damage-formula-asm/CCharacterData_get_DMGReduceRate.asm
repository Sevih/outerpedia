; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_DMGReduceRate @ 0x2909338..0x2909414 (taille 220 octets) =====
  0x2909338: str      x30, [sp, #-0x20]!
  0x290933c: stp      x20, x19, [sp, #0x10]
  0x2909340: adrp     x20, #0x59e7000
  0x2909344: ldrb     w8, [x20, #0xe7b]
  0x2909348: mov      x19, x0
  0x290934c: tbnz     w8, #0, #0x2909370
  0x2909350: adrp     x0, #0x55c5000
  0x2909354: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909358: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290935c: adrp     x0, #0x55c5000
  0x2909360: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909364: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909368: mov      w8, #1
  0x290936c: strb     w8, [x20, #0xe7b]
  0x2909370: ldrb     w8, [x19, #0x28]
  0x2909374: cbz      w8, #0x2909380
  0x2909378: mov      x0, x19
  0x290937c: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x2909380: ldr      x0, [x19, #0x40]
  0x2909384: cbz      x0, #0x2909410
  0x2909388: adrp     x8, #0x55c5000
  0x290938c: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909390: mov      w1, #6
  0x2909394: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2909398: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290939c: cbz      x0, #0x2909410
  0x29093a0: adrp     x10, #0x55c5000
  0x29093a4: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x29093a8: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29093ac: mov      x19, x0
  0x29093b0: ldrh     w9, [x8, #0x12e]
  0x29093b4: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x29093b8: cbz      x9, #0x29093dc
  0x29093bc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x29093c0: add      x10, x10, #8
  0x29093c4: ldur     x11, [x10, #-8]
  0x29093c8: cmp      x11, x1
  0x29093cc: b.eq     #0x29093ec
  0x29093d0: subs     x9, x9, #1
  0x29093d4: add      x10, x10, #0x10
  0x29093d8: b.ne     #0x29093c4
  0x29093dc: mov      w2, #1
  0x29093e0: mov      x0, x19
  0x29093e4: bl       #0x2215130 ; -> ??? 0x2215130
  0x29093e8: b        #0x29093fc
  0x29093ec: ldr      w9, [x10]
  0x29093f0: add      w9, w9, #1
  0x29093f4: add      x8, x8, w9, sxtw #4
  0x29093f8: add      x0, x8, #0x138
  0x29093fc: ldp      x2, x1, [x0]
  0x2909400: mov      x0, x19
  0x2909404: ldp      x20, x19, [sp, #0x10]
  0x2909408: ldr      x30, [sp], #0x20
  0x290940c: br       x2
  0x2909410: bl       #0x21b4d20 ; -> ??? 0x21b4d20
