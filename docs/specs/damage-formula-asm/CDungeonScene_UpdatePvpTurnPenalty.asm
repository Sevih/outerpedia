; ===== CDungeonScene_UpdatePvpTurnPenalty @ 0x255a430..0x255a5f4 (taille 452 octets) =====
  0x255a430: str      x30, [sp, #-0x30]!
  0x255a434: stp      x22, x21, [sp, #0x10]
  0x255a438: stp      x20, x19, [sp, #0x20]
  0x255a43c: adrp     x21, #0x5956000
  0x255a440: adrp     x20, #0x5511000
  0x255a444: ldrb     w8, [x21, #0xda3]
  0x255a448: ldr      x20, [x20, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x255a44c: mov      x19, x0
  0x255a450: tbnz     w8, #0, #0x255a480
  0x255a454: adrp     x0, #0x5511000
  0x255a458: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x255a45c: bl       #0x2184724 ; -> ??? 0x2184724
  0x255a460: adrp     x0, #0x5511000
  0x255a464: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x255a468: bl       #0x2184724 ; -> ??? 0x2184724
  0x255a46c: adrp     x0, #0x5523000
  0x255a470: ldr      x0, [x0, #0x678] ; = 0x0 (u64 @ 0x5523678)
  0x255a474: bl       #0x2184724 ; -> ??? 0x2184724
  0x255a478: mov      w8, #1
  0x255a47c: strb     w8, [x21, #0xda3]
  0x255a480: ldp      w8, w21, [x19, #0xf0]
  0x255a484: str      w8, [sp, #0xc]
  0x255a488: add      w8, w8, #1
  0x255a48c: str      w8, [x19, #0xf0]
  0x255a490: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x255a494: ldr      w8, [x0, #0xe0]
  0x255a498: cbnz     w8, #0x255a4a0
  0x255a49c: bl       #0x218489c ; -> ??? 0x218489c
  0x255a4a0: mov      x0, xzr
  0x255a4a4: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x255a4a8: cbz      x0, #0x255a5f0
  0x255a4ac: mov      w1, #0x26
  0x255a4b0: mov      x2, xzr
  0x255a4b4: bl       #0x25ee210 ; -> CTempletManager$$GetGameConfig
  0x255a4b8: cbz      x0, #0x255a5f0
  0x255a4bc: ldr      w8, [x0, #0x14]
  0x255a4c0: ldr      w22, [x19, #0xfc]
  0x255a4c4: mov      x0, xzr
  0x255a4c8: add      w8, w8, w21
  0x255a4cc: str      w8, [x19, #0xf4]
  0x255a4d0: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x255a4d4: cbz      x0, #0x255a5f0
  0x255a4d8: mov      w1, #0x28
  0x255a4dc: mov      x2, xzr
  0x255a4e0: bl       #0x25ee210 ; -> CTempletManager$$GetGameConfig
  0x255a4e4: cbz      x0, #0x255a5f0
  0x255a4e8: ldr      w8, [x0, #0x14]
  0x255a4ec: ldr      w9, [x19, #0xf4]
  0x255a4f0: ldr      w10, [x19, #0xa8]
  0x255a4f4: add      w8, w8, w22
  0x255a4f8: sub      w9, w9, w10
  0x255a4fc: stp      w9, w8, [x19, #0xf8]
  0x255a500: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x255a504: ldr      w20, [x19, #0x100]
  0x255a508: ldr      w8, [x0, #0xe0]
  0x255a50c: cbz      w20, #0x255a540
  0x255a510: cbnz     w8, #0x255a518
  0x255a514: bl       #0x218489c ; -> ??? 0x218489c
  0x255a518: mov      x0, xzr
  0x255a51c: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x255a520: cbz      x0, #0x255a5f0
  0x255a524: mov      w1, #0xb4
  0x255a528: mov      x2, xzr
  0x255a52c: bl       #0x25ee210 ; -> CTempletManager$$GetGameConfig
  0x255a530: cbz      x0, #0x255a5f0
  0x255a534: ldr      w8, [x0, #0x14]
  0x255a538: add      w8, w8, w20
  0x255a53c: b        #0x255a568
  0x255a540: cbnz     w8, #0x255a548
  0x255a544: bl       #0x218489c ; -> ??? 0x218489c
  0x255a548: mov      x0, xzr
  0x255a54c: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x255a550: cbz      x0, #0x255a5f0
  0x255a554: mov      w1, #0xb3
  0x255a558: mov      x2, xzr
  0x255a55c: bl       #0x25ee210 ; -> CTempletManager$$GetGameConfig
  0x255a560: cbz      x0, #0x255a5f0
  0x255a564: ldr      w8, [x0, #0x14]
  0x255a568: adrp     x20, #0x5523000
  0x255a56c: adrp     x21, #0x5511000
  0x255a570: ldr      x20, [x20, #0x678] ; = 0x0 (u64 @ 0x5523678)
  0x255a574: ldr      x21, [x21, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x255a578: cmp      w8, #0x3e8
  0x255a57c: mov      w9, #0x3e8
  0x255a580: csel     w8, w8, w9, lt
  0x255a584: add      x0, sp, #0xc
  0x255a588: mov      x1, xzr
  0x255a58c: str      w8, [x19, #0x100]
  0x255a590: str      w8, [sp, #0xc]
  0x255a594: bl       #0x48a1298 ; -> System.Int32$$ToString
  0x255a598: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5523000)
  0x255a59c: mov      x1, x0
  0x255a5a0: mov      x2, xzr
  0x255a5a4: mov      x0, x8
  0x255a5a8: bl       #0x470c0a0 ; -> System.String$$Concat
  0x255a5ac: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x255a5b0: mov      x20, x0
  0x255a5b4: ldr      w9, [x8, #0xe0]
  0x255a5b8: cbnz     w9, #0x255a5c4
  0x255a5bc: mov      x0, x8
  0x255a5c0: bl       #0x218489c ; -> ??? 0x218489c
  0x255a5c4: mov      x0, x20
  0x255a5c8: mov      x1, xzr
  0x255a5cc: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x255a5d0: ldr      x0, [x19, #0x68]
  0x255a5d4: cbz      x0, #0x255a5f0
  0x255a5d8: mov      x1, xzr
  0x255a5dc: bl       #0x28bd78c ; -> CUIHud$$UpdatePenaltySkill
  0x255a5e0: ldp      x20, x19, [sp, #0x20]
  0x255a5e4: ldp      x22, x21, [sp, #0x10]
  0x255a5e8: ldr      x30, [sp], #0x30
  0x255a5ec: ret      
  0x255a5f0: bl       #0x21849c0 ; -> ??? 0x21849c0
