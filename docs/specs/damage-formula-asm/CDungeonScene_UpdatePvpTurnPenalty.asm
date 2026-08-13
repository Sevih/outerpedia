; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CDungeonScene_UpdatePvpTurnPenalty @ 0x259f724..0x259f8e8 (taille 452 octets) =====
  0x259f724: str      x30, [sp, #-0x30]!
  0x259f728: stp      x22, x21, [sp, #0x10]
  0x259f72c: stp      x20, x19, [sp, #0x20]
  0x259f730: adrp     x21, #0x59d6000
  0x259f734: adrp     x20, #0x558a000
  0x259f738: ldrb     w8, [x21, #0x51a]
  0x259f73c: ldr      x20, [x20, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x259f740: mov      x19, x0
  0x259f744: tbnz     w8, #0, #0x259f774
  0x259f748: adrp     x0, #0x5589000
  0x259f74c: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x259f750: bl       #0x21af97c ; -> ??? 0x21af97c
  0x259f754: adrp     x0, #0x558a000
  0x259f758: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x259f75c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x259f760: adrp     x0, #0x559d000
  0x259f764: ldr      x0, [x0, #0x750] ; = 0x0 (u64 @ 0x559d750)
  0x259f768: bl       #0x21af97c ; -> ??? 0x21af97c
  0x259f76c: mov      w8, #1
  0x259f770: strb     w8, [x21, #0x51a]
  0x259f774: ldp      w8, w21, [x19, #0xf0]
  0x259f778: str      w8, [sp, #0xc]
  0x259f77c: add      w8, w8, #1
  0x259f780: str      w8, [x19, #0xf0]
  0x259f784: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x259f788: ldr      w8, [x0, #0xe0]
  0x259f78c: cbnz     w8, #0x259f794
  0x259f790: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x259f794: mov      x0, xzr
  0x259f798: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x259f79c: cbz      x0, #0x259f8e4
  0x259f7a0: mov      w1, #0x26
  0x259f7a4: mov      x2, xzr
  0x259f7a8: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x259f7ac: cbz      x0, #0x259f8e4
  0x259f7b0: ldr      w8, [x0, #0x14]
  0x259f7b4: ldr      w22, [x19, #0xfc]
  0x259f7b8: mov      x0, xzr
  0x259f7bc: add      w8, w8, w21
  0x259f7c0: str      w8, [x19, #0xf4]
  0x259f7c4: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x259f7c8: cbz      x0, #0x259f8e4
  0x259f7cc: mov      w1, #0x28
  0x259f7d0: mov      x2, xzr
  0x259f7d4: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x259f7d8: cbz      x0, #0x259f8e4
  0x259f7dc: ldr      w8, [x0, #0x14]
  0x259f7e0: ldr      w9, [x19, #0xf4]
  0x259f7e4: ldr      w10, [x19, #0xa8]
  0x259f7e8: add      w8, w8, w22
  0x259f7ec: sub      w9, w9, w10
  0x259f7f0: stp      w9, w8, [x19, #0xf8]
  0x259f7f4: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x259f7f8: ldr      w20, [x19, #0x100]
  0x259f7fc: ldr      w8, [x0, #0xe0]
  0x259f800: cbz      w20, #0x259f834
  0x259f804: cbnz     w8, #0x259f80c
  0x259f808: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x259f80c: mov      x0, xzr
  0x259f810: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x259f814: cbz      x0, #0x259f8e4
  0x259f818: mov      w1, #0xb4
  0x259f81c: mov      x2, xzr
  0x259f820: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x259f824: cbz      x0, #0x259f8e4
  0x259f828: ldr      w8, [x0, #0x14]
  0x259f82c: add      w8, w8, w20
  0x259f830: b        #0x259f85c
  0x259f834: cbnz     w8, #0x259f83c
  0x259f838: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x259f83c: mov      x0, xzr
  0x259f840: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x259f844: cbz      x0, #0x259f8e4
  0x259f848: mov      w1, #0xb3
  0x259f84c: mov      x2, xzr
  0x259f850: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x259f854: cbz      x0, #0x259f8e4
  0x259f858: ldr      w8, [x0, #0x14]
  0x259f85c: adrp     x20, #0x559d000
  0x259f860: adrp     x21, #0x5589000
  0x259f864: ldr      x20, [x20, #0x750] ; = 0x0 (u64 @ 0x559d750)
  0x259f868: ldr      x21, [x21, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x259f86c: cmp      w8, #0x3e8
  0x259f870: mov      w9, #0x3e8
  0x259f874: csel     w8, w8, w9, lt
  0x259f878: add      x0, sp, #0xc
  0x259f87c: mov      x1, xzr
  0x259f880: str      w8, [x19, #0x100]
  0x259f884: str      w8, [sp, #0xc]
  0x259f888: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x259f88c: ldr      x8, [x20] ; = 0x0 (u64 @ 0x559d000)
  0x259f890: mov      x1, x0
  0x259f894: mov      x2, xzr
  0x259f898: mov      x0, x8
  0x259f89c: bl       #0x476ca18 ; -> System.String$$Concat
  0x259f8a0: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5589000)
  0x259f8a4: mov      x20, x0
  0x259f8a8: ldr      w9, [x8, #0xe0]
  0x259f8ac: cbnz     w9, #0x259f8b8
  0x259f8b0: mov      x0, x8
  0x259f8b4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x259f8b8: mov      x0, x20
  0x259f8bc: mov      x1, xzr
  0x259f8c0: bl       #0x2ca7164 ; -> CDebug$$Log
  0x259f8c4: ldr      x0, [x19, #0x68]
  0x259f8c8: cbz      x0, #0x259f8e4
  0x259f8cc: mov      x1, xzr
  0x259f8d0: bl       #0x28fd3d4 ; -> CUIHud$$UpdatePenaltySkill
  0x259f8d4: ldp      x20, x19, [sp, #0x20]
  0x259f8d8: ldp      x22, x21, [sp, #0x10]
  0x259f8dc: ldr      x30, [sp], #0x30
  0x259f8e0: ret      
  0x259f8e4: bl       #0x21afc18 ; -> ??? 0x21afc18
