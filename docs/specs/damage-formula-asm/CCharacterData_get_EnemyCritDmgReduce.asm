; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_EnemyCritDmgReduce @ 0x290a468..0x290a544 (taille 220 octets) =====
  0x290a468: str      x30, [sp, #-0x20]!
  0x290a46c: stp      x20, x19, [sp, #0x10]
  0x290a470: adrp     x20, #0x59e7000
  0x290a474: ldrb     w8, [x20, #0xe8f]
  0x290a478: mov      x19, x0
  0x290a47c: tbnz     w8, #0, #0x290a4a0
  0x290a480: adrp     x0, #0x55c5000
  0x290a484: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290a488: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290a48c: adrp     x0, #0x55c5000
  0x290a490: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290a494: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290a498: mov      w8, #1
  0x290a49c: strb     w8, [x20, #0xe8f]
  0x290a4a0: ldrb     w8, [x19, #0x28]
  0x290a4a4: cbz      w8, #0x290a4b0
  0x290a4a8: mov      x0, x19
  0x290a4ac: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x290a4b0: ldr      x0, [x19, #0x40]
  0x290a4b4: cbz      x0, #0x290a540
  0x290a4b8: adrp     x8, #0x55c5000
  0x290a4bc: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290a4c0: mov      w1, #0x1a
  0x290a4c4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290a4c8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290a4cc: cbz      x0, #0x290a540
  0x290a4d0: adrp     x10, #0x55c5000
  0x290a4d4: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290a4d8: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290a4dc: mov      x19, x0
  0x290a4e0: ldrh     w9, [x8, #0x12e]
  0x290a4e4: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x290a4e8: cbz      x9, #0x290a50c
  0x290a4ec: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290a4f0: add      x10, x10, #8
  0x290a4f4: ldur     x11, [x10, #-8]
  0x290a4f8: cmp      x11, x1
  0x290a4fc: b.eq     #0x290a51c
  0x290a500: subs     x9, x9, #1
  0x290a504: add      x10, x10, #0x10
  0x290a508: b.ne     #0x290a4f4
  0x290a50c: mov      w2, #1
  0x290a510: mov      x0, x19
  0x290a514: bl       #0x2215130 ; -> ??? 0x2215130
  0x290a518: b        #0x290a52c
  0x290a51c: ldr      w9, [x10]
  0x290a520: add      w9, w9, #1
  0x290a524: add      x8, x8, w9, sxtw #4
  0x290a528: add      x0, x8, #0x138
  0x290a52c: ldp      x2, x1, [x0]
  0x290a530: mov      x0, x19
  0x290a534: ldp      x20, x19, [sp, #0x10]
  0x290a538: ldr      x30, [sp], #0x20
  0x290a53c: br       x2
  0x290a540: bl       #0x21b4d20 ; -> ??? 0x21b4d20
