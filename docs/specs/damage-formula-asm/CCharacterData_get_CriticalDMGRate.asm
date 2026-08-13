; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_CriticalDMGRate @ 0x290227c..0x2902358 (taille 220 octets) =====
  0x290227c: str      x30, [sp, #-0x20]!
  0x2902280: stp      x20, x19, [sp, #0x10]
  0x2902284: adrp     x20, #0x59d8000
  0x2902288: ldrb     w8, [x20, #0x25e]
  0x290228c: mov      x19, x0
  0x2902290: tbnz     w8, #0, #0x29022b4
  0x2902294: adrp     x0, #0x55b6000
  0x2902298: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290229c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29022a0: adrp     x0, #0x55b6000
  0x29022a4: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29022a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29022ac: mov      w8, #1
  0x29022b0: strb     w8, [x20, #0x25e]
  0x29022b4: ldrb     w8, [x19, #0x28]
  0x29022b8: cbz      w8, #0x29022c4
  0x29022bc: mov      x0, x19
  0x29022c0: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x29022c4: ldr      x0, [x19, #0x40]
  0x29022c8: cbz      x0, #0x2902354
  0x29022cc: adrp     x8, #0x55b6000
  0x29022d0: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29022d4: mov      w1, #8
  0x29022d8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29022dc: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29022e0: cbz      x0, #0x2902354
  0x29022e4: adrp     x10, #0x55b6000
  0x29022e8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x29022ec: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29022f0: mov      x19, x0
  0x29022f4: ldrh     w9, [x8, #0x12e]
  0x29022f8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x29022fc: cbz      x9, #0x2902320
  0x2902300: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2902304: add      x10, x10, #8
  0x2902308: ldur     x11, [x10, #-8]
  0x290230c: cmp      x11, x1
  0x2902310: b.eq     #0x2902330
  0x2902314: subs     x9, x9, #1
  0x2902318: add      x10, x10, #0x10
  0x290231c: b.ne     #0x2902308
  0x2902320: mov      w2, #1
  0x2902324: mov      x0, x19
  0x2902328: bl       #0x2210028 ; -> ??? 0x2210028
  0x290232c: b        #0x2902340
  0x2902330: ldr      w9, [x10]
  0x2902334: add      w9, w9, #1
  0x2902338: add      x8, x8, w9, sxtw #4
  0x290233c: add      x0, x8, #0x138
  0x2902340: ldp      x2, x1, [x0]
  0x2902344: mov      x0, x19
  0x2902348: ldp      x20, x19, [sp, #0x10]
  0x290234c: ldr      x30, [sp], #0x20
  0x2902350: br       x2
  0x2902354: bl       #0x21afc18 ; -> ??? 0x21afc18
