; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_GetBuffListOnSpawn @ 0x25127f8..0x25128a8 (taille 176 octets) =====
  0x25127f8: stp      x30, x23, [sp, #-0x30]!
  0x25127fc: stp      x22, x21, [sp, #0x10]
  0x2512800: stp      x20, x19, [sp, #0x20]
  0x2512804: adrp     x22, #0x59d6000
  0x2512808: adrp     x23, #0x558b000
  0x251280c: adrp     x21, #0x558b000
  0x2512810: ldrb     w8, [x22, #0x9c]
  0x2512814: ldr      x23, [x23, #0x8c0] ; = 0x0 (u64 @ 0x558b8c0)
  0x2512818: ldr      x21, [x21, #0x8c8] ; = 0x0 (u64 @ 0x558b8c8)
  0x251281c: mov      x19, x1
  0x2512820: mov      x20, x0
  0x2512824: tbnz     w8, #0, #0x2512848
  0x2512828: adrp     x0, #0x558b000
  0x251282c: ldr      x0, [x0, #0x8c8] ; = 0x0 (u64 @ 0x558b8c8)
  0x2512830: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2512834: adrp     x0, #0x558b000
  0x2512838: ldr      x0, [x0, #0x8c0] ; = 0x0 (u64 @ 0x558b8c0)
  0x251283c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2512840: mov      w8, #1
  0x2512844: strb     w8, [x22, #0x9c]
  0x2512848: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558b000)
  0x251284c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2512850: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558b000)
  0x2512854: mov      x21, x0
  0x2512858: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x251285c: mov      x0, x19
  0x2512860: mov      x1, x21
  0x2512864: str      x21, [x19]
  0x2512868: bl       #0x21af920 ; -> ??? 0x21af920
  0x251286c: mov      w1, #0x17
  0x2512870: mov      w2, #1
  0x2512874: mov      w3, #3
  0x2512878: mov      x0, x20
  0x251287c: mov      x4, x19
  0x2512880: bl       #0x2510400 ; -> CSkillManager$$GetBuffList
  0x2512884: mov      x0, x20
  0x2512888: mov      x4, x19
  0x251288c: ldp      x20, x19, [sp, #0x20]
  0x2512890: ldp      x22, x21, [sp, #0x10]
  0x2512894: mov      w1, #0x17
  0x2512898: mov      w2, #1
  0x251289c: mov      w3, #4
  0x25128a0: ldp      x30, x23, [sp], #0x30
  0x25128a4: b        #0x2510400
