; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_PiercePower @ 0x2902358..0x2902434 (taille 220 octets) =====
  0x2902358: str      x30, [sp, #-0x20]!
  0x290235c: stp      x20, x19, [sp, #0x10]
  0x2902360: adrp     x20, #0x59d8000
  0x2902364: ldrb     w8, [x20, #0x25f]
  0x2902368: mov      x19, x0
  0x290236c: tbnz     w8, #0, #0x2902390
  0x2902370: adrp     x0, #0x55b6000
  0x2902374: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902378: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290237c: adrp     x0, #0x55b6000
  0x2902380: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902384: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902388: mov      w8, #1
  0x290238c: strb     w8, [x20, #0x25f]
  0x2902390: ldrb     w8, [x19, #0x28]
  0x2902394: cbz      w8, #0x29023a0
  0x2902398: mov      x0, x19
  0x290239c: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x29023a0: ldr      x0, [x19, #0x40]
  0x29023a4: cbz      x0, #0x2902430
  0x29023a8: adrp     x8, #0x55b6000
  0x29023ac: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29023b0: mov      w1, #9
  0x29023b4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29023b8: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29023bc: cbz      x0, #0x2902430
  0x29023c0: adrp     x10, #0x55b6000
  0x29023c4: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x29023c8: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29023cc: mov      x19, x0
  0x29023d0: ldrh     w9, [x8, #0x12e]
  0x29023d4: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x29023d8: cbz      x9, #0x29023fc
  0x29023dc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29023e0: add      x10, x10, #8
  0x29023e4: ldur     x11, [x10, #-8]
  0x29023e8: cmp      x11, x1
  0x29023ec: b.eq     #0x290240c
  0x29023f0: subs     x9, x9, #1
  0x29023f4: add      x10, x10, #0x10
  0x29023f8: b.ne     #0x29023e4
  0x29023fc: mov      w2, #1
  0x2902400: mov      x0, x19
  0x2902404: bl       #0x2210028 ; -> ??? 0x2210028
  0x2902408: b        #0x290241c
  0x290240c: ldr      w9, [x10]
  0x2902410: add      w9, w9, #1
  0x2902414: add      x8, x8, w9, sxtw #4
  0x2902418: add      x0, x8, #0x138
  0x290241c: ldp      x2, x1, [x0]
  0x2902420: mov      x0, x19
  0x2902424: ldp      x20, x19, [sp, #0x10]
  0x2902428: ldr      x30, [sp], #0x20
  0x290242c: br       x2
  0x2902430: bl       #0x21afc18 ; -> ??? 0x21afc18
