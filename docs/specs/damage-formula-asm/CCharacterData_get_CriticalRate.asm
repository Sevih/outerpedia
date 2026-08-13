; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_CriticalRate @ 0x29021a0..0x290227c (taille 220 octets) =====
  0x29021a0: str      x30, [sp, #-0x20]!
  0x29021a4: stp      x20, x19, [sp, #0x10]
  0x29021a8: adrp     x20, #0x59d8000
  0x29021ac: ldrb     w8, [x20, #0x25d]
  0x29021b0: mov      x19, x0
  0x29021b4: tbnz     w8, #0, #0x29021d8
  0x29021b8: adrp     x0, #0x55b6000
  0x29021bc: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29021c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29021c4: adrp     x0, #0x55b6000
  0x29021c8: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29021cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29021d0: mov      w8, #1
  0x29021d4: strb     w8, [x20, #0x25d]
  0x29021d8: ldrb     w8, [x19, #0x28]
  0x29021dc: cbz      w8, #0x29021e8
  0x29021e0: mov      x0, x19
  0x29021e4: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x29021e8: ldr      x0, [x19, #0x40]
  0x29021ec: cbz      x0, #0x2902278
  0x29021f0: adrp     x8, #0x55b6000
  0x29021f4: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29021f8: mov      w1, #7
  0x29021fc: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902200: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902204: cbz      x0, #0x2902278
  0x2902208: adrp     x10, #0x55b6000
  0x290220c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2902210: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902214: mov      x19, x0
  0x2902218: ldrh     w9, [x8, #0x12e]
  0x290221c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2902220: cbz      x9, #0x2902244
  0x2902224: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2902228: add      x10, x10, #8
  0x290222c: ldur     x11, [x10, #-8]
  0x2902230: cmp      x11, x1
  0x2902234: b.eq     #0x2902254
  0x2902238: subs     x9, x9, #1
  0x290223c: add      x10, x10, #0x10
  0x2902240: b.ne     #0x290222c
  0x2902244: mov      w2, #1
  0x2902248: mov      x0, x19
  0x290224c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2902250: b        #0x2902264
  0x2902254: ldr      w9, [x10]
  0x2902258: add      w9, w9, #1
  0x290225c: add      x8, x8, w9, sxtw #4
  0x2902260: add      x0, x8, #0x138
  0x2902264: ldp      x2, x1, [x0]
  0x2902268: mov      x0, x19
  0x290226c: ldp      x20, x19, [sp, #0x10]
  0x2902270: ldr      x30, [sp], #0x20
  0x2902274: br       x2
  0x2902278: bl       #0x21afc18 ; -> ??? 0x21afc18
