; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Vampiric @ 0x2909784..0x2909860 (taille 220 octets) =====
  0x2909784: str      x30, [sp, #-0x20]!
  0x2909788: stp      x20, x19, [sp, #0x10]
  0x290978c: adrp     x20, #0x59e7000
  0x2909790: ldrb     w8, [x20, #0xe80]
  0x2909794: mov      x19, x0
  0x2909798: tbnz     w8, #0, #0x29097bc
  0x290979c: adrp     x0, #0x55c5000
  0x29097a0: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29097a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29097a8: adrp     x0, #0x55c5000
  0x29097ac: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29097b0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29097b4: mov      w8, #1
  0x29097b8: strb     w8, [x20, #0xe80]
  0x29097bc: ldrb     w8, [x19, #0x28]
  0x29097c0: cbz      w8, #0x29097cc
  0x29097c4: mov      x0, x19
  0x29097c8: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x29097cc: ldr      x0, [x19, #0x40]
  0x29097d0: cbz      x0, #0x290985c
  0x29097d4: adrp     x8, #0x55c5000
  0x29097d8: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29097dc: mov      w1, #0xb
  0x29097e0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x29097e4: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29097e8: cbz      x0, #0x290985c
  0x29097ec: adrp     x10, #0x55c5000
  0x29097f0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x29097f4: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29097f8: mov      x19, x0
  0x29097fc: ldrh     w9, [x8, #0x12e]
  0x2909800: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2909804: cbz      x9, #0x2909828
  0x2909808: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290980c: add      x10, x10, #8
  0x2909810: ldur     x11, [x10, #-8]
  0x2909814: cmp      x11, x1
  0x2909818: b.eq     #0x2909838
  0x290981c: subs     x9, x9, #1
  0x2909820: add      x10, x10, #0x10
  0x2909824: b.ne     #0x2909810
  0x2909828: mov      w2, #1
  0x290982c: mov      x0, x19
  0x2909830: bl       #0x2215130 ; -> ??? 0x2215130
  0x2909834: b        #0x2909848
  0x2909838: ldr      w9, [x10]
  0x290983c: add      w9, w9, #1
  0x2909840: add      x8, x8, w9, sxtw #4
  0x2909844: add      x0, x8, #0x138
  0x2909848: ldp      x2, x1, [x0]
  0x290984c: mov      x0, x19
  0x2909850: ldp      x20, x19, [sp, #0x10]
  0x2909854: ldr      x30, [sp], #0x20
  0x2909858: br       x2
  0x290985c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
