; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_DMGReduceRate @ 0x29020c4..0x29021a0 (taille 220 octets) =====
  0x29020c4: str      x30, [sp, #-0x20]!
  0x29020c8: stp      x20, x19, [sp, #0x10]
  0x29020cc: adrp     x20, #0x59d8000
  0x29020d0: ldrb     w8, [x20, #0x25c]
  0x29020d4: mov      x19, x0
  0x29020d8: tbnz     w8, #0, #0x29020fc
  0x29020dc: adrp     x0, #0x55b6000
  0x29020e0: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29020e4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29020e8: adrp     x0, #0x55b6000
  0x29020ec: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29020f0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29020f4: mov      w8, #1
  0x29020f8: strb     w8, [x20, #0x25c]
  0x29020fc: ldrb     w8, [x19, #0x28]
  0x2902100: cbz      w8, #0x290210c
  0x2902104: mov      x0, x19
  0x2902108: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x290210c: ldr      x0, [x19, #0x40]
  0x2902110: cbz      x0, #0x290219c
  0x2902114: adrp     x8, #0x55b6000
  0x2902118: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290211c: mov      w1, #6
  0x2902120: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902124: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902128: cbz      x0, #0x290219c
  0x290212c: adrp     x10, #0x55b6000
  0x2902130: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2902134: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902138: mov      x19, x0
  0x290213c: ldrh     w9, [x8, #0x12e]
  0x2902140: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2902144: cbz      x9, #0x2902168
  0x2902148: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x290214c: add      x10, x10, #8
  0x2902150: ldur     x11, [x10, #-8]
  0x2902154: cmp      x11, x1
  0x2902158: b.eq     #0x2902178
  0x290215c: subs     x9, x9, #1
  0x2902160: add      x10, x10, #0x10
  0x2902164: b.ne     #0x2902150
  0x2902168: mov      w2, #1
  0x290216c: mov      x0, x19
  0x2902170: bl       #0x2210028 ; -> ??? 0x2210028
  0x2902174: b        #0x2902188
  0x2902178: ldr      w9, [x10]
  0x290217c: add      w9, w9, #1
  0x2902180: add      x8, x8, w9, sxtw #4
  0x2902184: add      x0, x8, #0x138
  0x2902188: ldp      x2, x1, [x0]
  0x290218c: mov      x0, x19
  0x2902190: ldp      x20, x19, [sp, #0x10]
  0x2902194: ldr      x30, [sp], #0x20
  0x2902198: br       x2
  0x290219c: bl       #0x21afc18 ; -> ??? 0x21afc18
