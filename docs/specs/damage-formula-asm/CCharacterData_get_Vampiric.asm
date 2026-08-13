; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Vampiric @ 0x2902510..0x29025ec (taille 220 octets) =====
  0x2902510: str      x30, [sp, #-0x20]!
  0x2902514: stp      x20, x19, [sp, #0x10]
  0x2902518: adrp     x20, #0x59d8000
  0x290251c: ldrb     w8, [x20, #0x261]
  0x2902520: mov      x19, x0
  0x2902524: tbnz     w8, #0, #0x2902548
  0x2902528: adrp     x0, #0x55b6000
  0x290252c: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902530: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902534: adrp     x0, #0x55b6000
  0x2902538: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290253c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902540: mov      w8, #1
  0x2902544: strb     w8, [x20, #0x261]
  0x2902548: ldrb     w8, [x19, #0x28]
  0x290254c: cbz      w8, #0x2902558
  0x2902550: mov      x0, x19
  0x2902554: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x2902558: ldr      x0, [x19, #0x40]
  0x290255c: cbz      x0, #0x29025e8
  0x2902560: adrp     x8, #0x55b6000
  0x2902564: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902568: mov      w1, #0xb
  0x290256c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902570: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902574: cbz      x0, #0x29025e8
  0x2902578: adrp     x10, #0x55b6000
  0x290257c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2902580: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902584: mov      x19, x0
  0x2902588: ldrh     w9, [x8, #0x12e]
  0x290258c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2902590: cbz      x9, #0x29025b4
  0x2902594: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2902598: add      x10, x10, #8
  0x290259c: ldur     x11, [x10, #-8]
  0x29025a0: cmp      x11, x1
  0x29025a4: b.eq     #0x29025c4
  0x29025a8: subs     x9, x9, #1
  0x29025ac: add      x10, x10, #0x10
  0x29025b0: b.ne     #0x290259c
  0x29025b4: mov      w2, #1
  0x29025b8: mov      x0, x19
  0x29025bc: bl       #0x2210028 ; -> ??? 0x2210028
  0x29025c0: b        #0x29025d4
  0x29025c4: ldr      w9, [x10]
  0x29025c8: add      w9, w9, #1
  0x29025cc: add      x8, x8, w9, sxtw #4
  0x29025d0: add      x0, x8, #0x138
  0x29025d4: ldp      x2, x1, [x0]
  0x29025d8: mov      x0, x19
  0x29025dc: ldp      x20, x19, [sp, #0x10]
  0x29025e0: ldr      x30, [sp], #0x20
  0x29025e4: br       x2
  0x29025e8: bl       #0x21afc18 ; -> ??? 0x21afc18
