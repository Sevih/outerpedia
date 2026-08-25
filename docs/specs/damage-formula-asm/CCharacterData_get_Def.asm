; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Def @ 0x290925c..0x2909338 (taille 220 octets) =====
  0x290925c: str      x30, [sp, #-0x20]!
  0x2909260: stp      x20, x19, [sp, #0x10]
  0x2909264: adrp     x20, #0x59e7000
  0x2909268: ldrb     w8, [x20, #0xe7a]
  0x290926c: mov      x19, x0
  0x2909270: tbnz     w8, #0, #0x2909294
  0x2909274: adrp     x0, #0x55c5000
  0x2909278: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290927c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909280: adrp     x0, #0x55c5000
  0x2909284: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909288: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290928c: mov      w8, #1
  0x2909290: strb     w8, [x20, #0xe7a]
  0x2909294: ldrb     w8, [x19, #0x28]
  0x2909298: cbz      w8, #0x29092a4
  0x290929c: mov      x0, x19
  0x29092a0: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x29092a4: ldr      x0, [x19, #0x40]
  0x29092a8: cbz      x0, #0x2909334
  0x29092ac: adrp     x8, #0x55c5000
  0x29092b0: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29092b4: mov      w1, #5
  0x29092b8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x29092bc: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29092c0: cbz      x0, #0x2909334
  0x29092c4: adrp     x10, #0x55c5000
  0x29092c8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x29092cc: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29092d0: mov      x19, x0
  0x29092d4: ldrh     w9, [x8, #0x12e]
  0x29092d8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x29092dc: cbz      x9, #0x2909300
  0x29092e0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x29092e4: add      x10, x10, #8
  0x29092e8: ldur     x11, [x10, #-8]
  0x29092ec: cmp      x11, x1
  0x29092f0: b.eq     #0x2909310
  0x29092f4: subs     x9, x9, #1
  0x29092f8: add      x10, x10, #0x10
  0x29092fc: b.ne     #0x29092e8
  0x2909300: mov      w2, #1
  0x2909304: mov      x0, x19
  0x2909308: bl       #0x2215130 ; -> ??? 0x2215130
  0x290930c: b        #0x2909320
  0x2909310: ldr      w9, [x10]
  0x2909314: add      w9, w9, #1
  0x2909318: add      x8, x8, w9, sxtw #4
  0x290931c: add      x0, x8, #0x138
  0x2909320: ldp      x2, x1, [x0]
  0x2909324: mov      x0, x19
  0x2909328: ldp      x20, x19, [sp, #0x10]
  0x290932c: ldr      x30, [sp], #0x20
  0x2909330: br       x2
  0x2909334: bl       #0x21b4d20 ; -> ??? 0x21b4d20
