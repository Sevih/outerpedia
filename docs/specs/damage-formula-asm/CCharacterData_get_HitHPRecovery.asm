; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_HitHPRecovery @ 0x29025ec..0x29026c8 (taille 220 octets) =====
  0x29025ec: str      x30, [sp, #-0x20]!
  0x29025f0: stp      x20, x19, [sp, #0x10]
  0x29025f4: adrp     x20, #0x59d8000
  0x29025f8: ldrb     w8, [x20, #0x262]
  0x29025fc: mov      x19, x0
  0x2902600: tbnz     w8, #0, #0x2902624
  0x2902604: adrp     x0, #0x55b6000
  0x2902608: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290260c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902610: adrp     x0, #0x55b6000
  0x2902614: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902618: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290261c: mov      w8, #1
  0x2902620: strb     w8, [x20, #0x262]
  0x2902624: ldrb     w8, [x19, #0x28]
  0x2902628: cbz      w8, #0x2902634
  0x290262c: mov      x0, x19
  0x2902630: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x2902634: ldr      x0, [x19, #0x40]
  0x2902638: cbz      x0, #0x29026c4
  0x290263c: adrp     x8, #0x55b6000
  0x2902640: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902644: mov      w1, #0xc
  0x2902648: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x290264c: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2902650: cbz      x0, #0x29026c4
  0x2902654: adrp     x10, #0x55b6000
  0x2902658: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x290265c: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902660: mov      x19, x0
  0x2902664: ldrh     w9, [x8, #0x12e]
  0x2902668: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x290266c: cbz      x9, #0x2902690
  0x2902670: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2902674: add      x10, x10, #8
  0x2902678: ldur     x11, [x10, #-8]
  0x290267c: cmp      x11, x1
  0x2902680: b.eq     #0x29026a0
  0x2902684: subs     x9, x9, #1
  0x2902688: add      x10, x10, #0x10
  0x290268c: b.ne     #0x2902678
  0x2902690: mov      w2, #1
  0x2902694: mov      x0, x19
  0x2902698: bl       #0x2210028 ; -> ??? 0x2210028
  0x290269c: b        #0x29026b0
  0x29026a0: ldr      w9, [x10]
  0x29026a4: add      w9, w9, #1
  0x29026a8: add      x8, x8, w9, sxtw #4
  0x29026ac: add      x0, x8, #0x138
  0x29026b0: ldp      x2, x1, [x0]
  0x29026b4: mov      x0, x19
  0x29026b8: ldp      x20, x19, [sp, #0x10]
  0x29026bc: ldr      x30, [sp], #0x20
  0x29026c0: br       x2
  0x29026c4: bl       #0x21afc18 ; -> ??? 0x21afc18
