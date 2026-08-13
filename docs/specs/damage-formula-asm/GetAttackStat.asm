; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetAttackStat @ 0x282939c..0x282949c (taille 256 octets) =====
  0x282939c: stp      x30, x21, [sp, #-0x20]!
  0x28293a0: stp      x20, x19, [sp, #0x10]
  0x28293a4: adrp     x19, #0x59d7000
  0x28293a8: ldrb     w8, [x19, #0xad5]
  0x28293ac: mov      x20, x0
  0x28293b0: tbnz     w8, #0, #0x28293c8
  0x28293b4: adrp     x0, #0x558a000
  0x28293b8: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x28293bc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28293c0: mov      w8, #1
  0x28293c4: strb     w8, [x19, #0xad5]
  0x28293c8: mov      w1, #0x72
  0x28293cc: mov      x0, x20
  0x28293d0: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x28293d4: cbz      x0, #0x2829470
  0x28293d8: mov      w2, #0x17
  0x28293dc: mov      x1, x20
  0x28293e0: mov      x3, xzr
  0x28293e4: mov      x19, x0
  0x28293e8: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28293ec: tbz      w0, #0, #0x2829470
  0x28293f0: ldr      x20, [x20, #0x28]
  0x28293f4: mov      x0, x19
  0x28293f8: mov      x1, xzr
  0x28293fc: bl       #0x2320318 ; -> CBuff$$get_StatType
  0x2829400: cbz      x20, #0x2829498
  0x2829404: mov      w1, w0
  0x2829408: mov      x0, x20
  0x282940c: mov      x2, xzr
  0x2829410: bl       #0x2908f38 ; -> CCharacterData$$GetFinalStat
  0x2829414: mov      w20, w0
  0x2829418: mov      x0, x19
  0x282941c: mov      x1, xzr
  0x2829420: bl       #0x2320330 ; -> CBuff$$get_ApplyingType
  0x2829424: mov      w21, w0
  0x2829428: mov      x0, x19
  0x282942c: mov      x1, xzr
  0x2829430: bl       #0x232036c ; -> CBuff$$get_Value
  0x2829434: cmp      w21, #2
  0x2829438: mov      w19, w0
  0x282943c: b.ne     #0x2829488
  0x2829440: adrp     x8, #0x558a000
  0x2829444: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2829448: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282944c: ldr      w8, [x0, #0xe0]
  0x2829450: cbnz     w8, #0x2829458
  0x2829454: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2829458: mov      w0, w20
  0x282945c: mov      w1, w19
  0x2829460: ldp      x20, x19, [sp, #0x10]
  0x2829464: mov      x2, xzr
  0x2829468: ldp      x30, x21, [sp], #0x20
  0x282946c: b        #0x2a00d74
  0x2829470: ldr      x0, [x20, #0x28]
  0x2829474: cbz      x0, #0x2829498
  0x2829478: ldp      x20, x19, [sp, #0x10]
  0x282947c: mov      x1, xzr
  0x2829480: ldp      x30, x21, [sp], #0x20
  0x2829484: b        #0x2901f0c
  0x2829488: add      w0, w19, w20
  0x282948c: ldp      x20, x19, [sp, #0x10]
  0x2829490: ldp      x30, x21, [sp], #0x20
  0x2829494: ret      
  0x2829498: bl       #0x21afc18 ; -> ??? 0x21afc18
