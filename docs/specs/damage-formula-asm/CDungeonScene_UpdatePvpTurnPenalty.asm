; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CDungeonScene_UpdatePvpTurnPenalty @ 0x25a609c..0x25a6260 (taille 452 octets) =====
  0x25a609c: str      x30, [sp, #-0x30]!
  0x25a60a0: stp      x22, x21, [sp, #0x10]
  0x25a60a4: stp      x20, x19, [sp, #0x20]
  0x25a60a8: adrp     x21, #0x59e6000
  0x25a60ac: adrp     x20, #0x5598000
  0x25a60b0: ldrb     w8, [x21, #0x136]
  0x25a60b4: ldr      x20, [x20, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x25a60b8: mov      x19, x0
  0x25a60bc: tbnz     w8, #0, #0x25a60ec
  0x25a60c0: adrp     x0, #0x5598000
  0x25a60c4: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x25a60c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25a60cc: adrp     x0, #0x5598000
  0x25a60d0: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x25a60d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25a60d8: adrp     x0, #0x55ac000
  0x25a60dc: ldr      x0, [x0, #0x2f8] ; = 0x0 (u64 @ 0x55ac2f8)
  0x25a60e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25a60e4: mov      w8, #1
  0x25a60e8: strb     w8, [x21, #0x136]
  0x25a60ec: ldp      w8, w21, [x19, #0xf0]
  0x25a60f0: str      w8, [sp, #0xc]
  0x25a60f4: add      w8, w8, #1
  0x25a60f8: str      w8, [x19, #0xf0]
  0x25a60fc: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x25a6100: ldr      w8, [x0, #0xe0]
  0x25a6104: cbnz     w8, #0x25a610c
  0x25a6108: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x25a610c: mov      x0, xzr
  0x25a6110: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x25a6114: cbz      x0, #0x25a625c
  0x25a6118: mov      w1, #0x26
  0x25a611c: mov      x2, xzr
  0x25a6120: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x25a6124: cbz      x0, #0x25a625c
  0x25a6128: ldr      w8, [x0, #0x14]
  0x25a612c: ldr      w22, [x19, #0xfc]
  0x25a6130: mov      x0, xzr
  0x25a6134: add      w8, w8, w21
  0x25a6138: str      w8, [x19, #0xf4]
  0x25a613c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x25a6140: cbz      x0, #0x25a625c
  0x25a6144: mov      w1, #0x28
  0x25a6148: mov      x2, xzr
  0x25a614c: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x25a6150: cbz      x0, #0x25a625c
  0x25a6154: ldr      w8, [x0, #0x14]
  0x25a6158: ldr      w9, [x19, #0xf4]
  0x25a615c: ldr      w10, [x19, #0xa8]
  0x25a6160: add      w8, w8, w22
  0x25a6164: sub      w9, w9, w10
  0x25a6168: stp      w9, w8, [x19, #0xf8]
  0x25a616c: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x25a6170: ldr      w20, [x19, #0x100]
  0x25a6174: ldr      w8, [x0, #0xe0]
  0x25a6178: cbz      w20, #0x25a61ac
  0x25a617c: cbnz     w8, #0x25a6184
  0x25a6180: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x25a6184: mov      x0, xzr
  0x25a6188: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x25a618c: cbz      x0, #0x25a625c
  0x25a6190: mov      w1, #0xb4
  0x25a6194: mov      x2, xzr
  0x25a6198: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x25a619c: cbz      x0, #0x25a625c
  0x25a61a0: ldr      w8, [x0, #0x14]
  0x25a61a4: add      w8, w8, w20
  0x25a61a8: b        #0x25a61d4
  0x25a61ac: cbnz     w8, #0x25a61b4
  0x25a61b0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x25a61b4: mov      x0, xzr
  0x25a61b8: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x25a61bc: cbz      x0, #0x25a625c
  0x25a61c0: mov      w1, #0xb3
  0x25a61c4: mov      x2, xzr
  0x25a61c8: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x25a61cc: cbz      x0, #0x25a625c
  0x25a61d0: ldr      w8, [x0, #0x14]
  0x25a61d4: adrp     x20, #0x55ac000
  0x25a61d8: adrp     x21, #0x5598000
  0x25a61dc: ldr      x20, [x20, #0x2f8] ; = 0x0 (u64 @ 0x55ac2f8)
  0x25a61e0: ldr      x21, [x21, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x25a61e4: cmp      w8, #0x3e8
  0x25a61e8: mov      w9, #0x3e8
  0x25a61ec: csel     w8, w8, w9, lt
  0x25a61f0: add      x0, sp, #0xc
  0x25a61f4: mov      x1, xzr
  0x25a61f8: str      w8, [x19, #0x100]
  0x25a61fc: str      w8, [sp, #0xc]
  0x25a6200: bl       #0x4910684 ; -> System.Int32$$ToString
  0x25a6204: ldr      x8, [x20] ; = 0x0 (u64 @ 0x55ac000)
  0x25a6208: mov      x1, x0
  0x25a620c: mov      x2, xzr
  0x25a6210: mov      x0, x8
  0x25a6214: bl       #0x477b31c ; -> System.String$$Concat
  0x25a6218: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x25a621c: mov      x20, x0
  0x25a6220: ldr      w9, [x8, #0xe0]
  0x25a6224: cbnz     w9, #0x25a6230
  0x25a6228: mov      x0, x8
  0x25a622c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x25a6230: mov      x0, x20
  0x25a6234: mov      x1, xzr
  0x25a6238: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x25a623c: ldr      x0, [x19, #0x68]
  0x25a6240: cbz      x0, #0x25a625c
  0x25a6244: mov      x1, xzr
  0x25a6248: bl       #0x2904648 ; -> CUIHud$$UpdatePenaltySkill
  0x25a624c: ldp      x20, x19, [sp, #0x20]
  0x25a6250: ldp      x22, x21, [sp, #0x10]
  0x25a6254: ldr      x30, [sp], #0x30
  0x25a6258: ret      
  0x25a625c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
