; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_CriticalDMGRate @ 0x29094f0..0x29095cc (taille 220 octets) =====
  0x29094f0: str      x30, [sp, #-0x20]!
  0x29094f4: stp      x20, x19, [sp, #0x10]
  0x29094f8: adrp     x20, #0x59e7000
  0x29094fc: ldrb     w8, [x20, #0xe7d]
  0x2909500: mov      x19, x0
  0x2909504: tbnz     w8, #0, #0x2909528
  0x2909508: adrp     x0, #0x55c5000
  0x290950c: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909510: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909514: adrp     x0, #0x55c5000
  0x2909518: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290951c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909520: mov      w8, #1
  0x2909524: strb     w8, [x20, #0xe7d]
  0x2909528: ldrb     w8, [x19, #0x28]
  0x290952c: cbz      w8, #0x2909538
  0x2909530: mov      x0, x19
  0x2909534: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x2909538: ldr      x0, [x19, #0x40]
  0x290953c: cbz      x0, #0x29095c8
  0x2909540: adrp     x8, #0x55c5000
  0x2909544: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909548: mov      w1, #8
  0x290954c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2909550: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909554: cbz      x0, #0x29095c8
  0x2909558: adrp     x10, #0x55c5000
  0x290955c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2909560: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909564: mov      x19, x0
  0x2909568: ldrh     w9, [x8, #0x12e]
  0x290956c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2909570: cbz      x9, #0x2909594
  0x2909574: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2909578: add      x10, x10, #8
  0x290957c: ldur     x11, [x10, #-8]
  0x2909580: cmp      x11, x1
  0x2909584: b.eq     #0x29095a4
  0x2909588: subs     x9, x9, #1
  0x290958c: add      x10, x10, #0x10
  0x2909590: b.ne     #0x290957c
  0x2909594: mov      w2, #1
  0x2909598: mov      x0, x19
  0x290959c: bl       #0x2215130 ; -> ??? 0x2215130
  0x29095a0: b        #0x29095b4
  0x29095a4: ldr      w9, [x10]
  0x29095a8: add      w9, w9, #1
  0x29095ac: add      x8, x8, w9, sxtw #4
  0x29095b0: add      x0, x8, #0x138
  0x29095b4: ldp      x2, x1, [x0]
  0x29095b8: mov      x0, x19
  0x29095bc: ldp      x20, x19, [sp, #0x10]
  0x29095c0: ldr      x30, [sp], #0x20
  0x29095c4: br       x2
  0x29095c8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
