; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_EnemyCritDmgReduce @ 0x29031f4..0x29032d0 (taille 220 octets) =====
  0x29031f4: str      x30, [sp, #-0x20]!
  0x29031f8: stp      x20, x19, [sp, #0x10]
  0x29031fc: adrp     x20, #0x59d8000
  0x2903200: ldrb     w8, [x20, #0x270]
  0x2903204: mov      x19, x0
  0x2903208: tbnz     w8, #0, #0x290322c
  0x290320c: adrp     x0, #0x55b6000
  0x2903210: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2903214: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2903218: adrp     x0, #0x55b6000
  0x290321c: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2903220: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2903224: mov      w8, #1
  0x2903228: strb     w8, [x20, #0x270]
  0x290322c: ldrb     w8, [x19, #0x28]
  0x2903230: cbz      w8, #0x290323c
  0x2903234: mov      x0, x19
  0x2903238: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x290323c: ldr      x0, [x19, #0x40]
  0x2903240: cbz      x0, #0x29032cc
  0x2903244: adrp     x8, #0x55b6000
  0x2903248: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290324c: mov      w1, #0x1a
  0x2903250: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2903254: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2903258: cbz      x0, #0x29032cc
  0x290325c: adrp     x10, #0x55b6000
  0x2903260: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2903264: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2903268: mov      x19, x0
  0x290326c: ldrh     w9, [x8, #0x12e]
  0x2903270: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2903274: cbz      x9, #0x2903298
  0x2903278: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x290327c: add      x10, x10, #8
  0x2903280: ldur     x11, [x10, #-8]
  0x2903284: cmp      x11, x1
  0x2903288: b.eq     #0x29032a8
  0x290328c: subs     x9, x9, #1
  0x2903290: add      x10, x10, #0x10
  0x2903294: b.ne     #0x2903280
  0x2903298: mov      w2, #1
  0x290329c: mov      x0, x19
  0x29032a0: bl       #0x2210028 ; -> ??? 0x2210028
  0x29032a4: b        #0x29032b8
  0x29032a8: ldr      w9, [x10]
  0x29032ac: add      w9, w9, #1
  0x29032b0: add      x8, x8, w9, sxtw #4
  0x29032b4: add      x0, x8, #0x138
  0x29032b8: ldp      x2, x1, [x0]
  0x29032bc: mov      x0, x19
  0x29032c0: ldp      x20, x19, [sp, #0x10]
  0x29032c4: ldr      x30, [sp], #0x20
  0x29032c8: br       x2
  0x29032cc: bl       #0x21afc18 ; -> ??? 0x21afc18
