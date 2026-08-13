; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_DMGBoost @ 0x2903118..0x29031f4 (taille 220 octets) =====
  0x2903118: str      x30, [sp, #-0x20]!
  0x290311c: stp      x20, x19, [sp, #0x10]
  0x2903120: adrp     x20, #0x59d8000
  0x2903124: ldrb     w8, [x20, #0x26f]
  0x2903128: mov      x19, x0
  0x290312c: tbnz     w8, #0, #0x2903150
  0x2903130: adrp     x0, #0x55b6000
  0x2903134: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2903138: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290313c: adrp     x0, #0x55b6000
  0x2903140: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2903144: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2903148: mov      w8, #1
  0x290314c: strb     w8, [x20, #0x26f]
  0x2903150: ldrb     w8, [x19, #0x28]
  0x2903154: cbz      w8, #0x2903160
  0x2903158: mov      x0, x19
  0x290315c: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x2903160: ldr      x0, [x19, #0x40]
  0x2903164: cbz      x0, #0x29031f0
  0x2903168: adrp     x8, #0x55b6000
  0x290316c: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2903170: mov      w1, #0x19
  0x2903174: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2903178: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290317c: cbz      x0, #0x29031f0
  0x2903180: adrp     x10, #0x55b6000
  0x2903184: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2903188: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290318c: mov      x19, x0
  0x2903190: ldrh     w9, [x8, #0x12e]
  0x2903194: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2903198: cbz      x9, #0x29031bc
  0x290319c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29031a0: add      x10, x10, #8
  0x29031a4: ldur     x11, [x10, #-8]
  0x29031a8: cmp      x11, x1
  0x29031ac: b.eq     #0x29031cc
  0x29031b0: subs     x9, x9, #1
  0x29031b4: add      x10, x10, #0x10
  0x29031b8: b.ne     #0x29031a4
  0x29031bc: mov      w2, #1
  0x29031c0: mov      x0, x19
  0x29031c4: bl       #0x2210028 ; -> ??? 0x2210028
  0x29031c8: b        #0x29031dc
  0x29031cc: ldr      w9, [x10]
  0x29031d0: add      w9, w9, #1
  0x29031d4: add      x8, x8, w9, sxtw #4
  0x29031d8: add      x0, x8, #0x138
  0x29031dc: ldp      x2, x1, [x0]
  0x29031e0: mov      x0, x19
  0x29031e4: ldp      x20, x19, [sp, #0x10]
  0x29031e8: ldr      x30, [sp], #0x20
  0x29031ec: br       x2
  0x29031f0: bl       #0x21afc18 ; -> ??? 0x21afc18
