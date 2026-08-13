; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcTranscendentStarStats @ 0x29078dc..0x2907b28 (taille 588 octets) =====
  0x29078dc: str      x30, [sp, #-0x40]!
  0x29078e0: stp      x24, x23, [sp, #0x10]
  0x29078e4: stp      x22, x21, [sp, #0x20]
  0x29078e8: stp      x20, x19, [sp, #0x30]
  0x29078ec: adrp     x20, #0x59d8000
  0x29078f0: adrp     x21, #0x558a000
  0x29078f4: ldrb     w8, [x20, #0x285]
  0x29078f8: ldr      x21, [x21, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x29078fc: mov      x19, x0
  0x2907900: tbnz     w8, #0, #0x2907930
  0x2907904: adrp     x0, #0x558a000
  0x2907908: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x290790c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907910: adrp     x0, #0x55b6000
  0x2907914: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2907918: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290791c: adrp     x0, #0x55b6000
  0x2907920: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2907924: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907928: mov      w8, #1
  0x290792c: strb     w8, [x20, #0x285]
  0x2907930: ldr      x0, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x2907934: ldr      w8, [x0, #0xe0]
  0x2907938: cbnz     w8, #0x2907940
  0x290793c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2907940: mov      x0, xzr
  0x2907944: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2907948: ldr      x8, [x19, #0xf0]
  0x290794c: cbz      x8, #0x2907b24
  0x2907950: cbz      x0, #0x2907b24
  0x2907954: ldr      w3, [x8, #0x10]
  0x2907958: ldrb     w2, [x19, #0x98]
  0x290795c: ldrb     w1, [x8, #0x54]
  0x2907960: mov      x4, xzr
  0x2907964: bl       #0x262a28c ; -> CTempletManager$$GetCharacterTranscendent
  0x2907968: cbz      x0, #0x29079e0
  0x290796c: mov      x20, x0
  0x2907970: ldr      x0, [x19, #0x40]
  0x2907974: cbz      x0, #0x2907b24
  0x2907978: adrp     x23, #0x55b6000
  0x290797c: ldr      x23, [x23, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2907980: mov      w1, #1
  0x2907984: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907988: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290798c: cbz      x0, #0x2907b24
  0x2907990: adrp     x24, #0x55b6000
  0x2907994: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907998: ldr      x24, [x24, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290799c: ldr      w22, [x20, #0x30]
  0x29079a0: mov      x21, x0
  0x29079a4: ldrh     w9, [x8, #0x12e]
  0x29079a8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x29079ac: cbz      x9, #0x29079d0
  0x29079b0: ldr      x10, [x8, #0xb0]
  0x29079b4: add      x10, x10, #8
  0x29079b8: ldur     x11, [x10, #-8]
  0x29079bc: cmp      x11, x1
  0x29079c0: b.eq     #0x29079f4
  0x29079c4: subs     x9, x9, #1
  0x29079c8: add      x10, x10, #0x10
  0x29079cc: b.ne     #0x29079b8
  0x29079d0: mov      w2, #0xc
  0x29079d4: mov      x0, x21
  0x29079d8: bl       #0x2210028 ; -> ??? 0x2210028
  0x29079dc: b        #0x2907a04
  0x29079e0: ldp      x20, x19, [sp, #0x30]
  0x29079e4: ldp      x22, x21, [sp, #0x20]
  0x29079e8: ldp      x24, x23, [sp, #0x10]
  0x29079ec: ldr      x30, [sp], #0x40
  0x29079f0: ret      
  0x29079f4: ldr      w9, [x10]
  0x29079f8: add      w9, w9, #0xc
  0x29079fc: add      x8, x8, w9, sxtw #4
  0x2907a00: add      x0, x8, #0x138
  0x2907a04: ldp      x8, x2, [x0]
  0x2907a08: mov      x0, x21
  0x2907a0c: mov      w1, w22
  0x2907a10: blr      x8
  0x2907a14: ldr      x0, [x19, #0x40]
  0x2907a18: cbz      x0, #0x2907b24
  0x2907a1c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907a20: mov      w1, #4
  0x2907a24: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907a28: cbz      x0, #0x2907b24
  0x2907a2c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907a30: ldr      w22, [x20, #0x34]
  0x2907a34: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2907a38: mov      x21, x0
  0x2907a3c: ldrh     w9, [x8, #0x12e]
  0x2907a40: cbz      x9, #0x2907a64
  0x2907a44: ldr      x10, [x8, #0xb0]
  0x2907a48: add      x10, x10, #8
  0x2907a4c: ldur     x11, [x10, #-8]
  0x2907a50: cmp      x11, x1
  0x2907a54: b.eq     #0x2907a74
  0x2907a58: subs     x9, x9, #1
  0x2907a5c: add      x10, x10, #0x10
  0x2907a60: b.ne     #0x2907a4c
  0x2907a64: mov      w2, #0xc
  0x2907a68: mov      x0, x21
  0x2907a6c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907a70: b        #0x2907a84
  0x2907a74: ldr      w9, [x10]
  0x2907a78: add      w9, w9, #0xc
  0x2907a7c: add      x8, x8, w9, sxtw #4
  0x2907a80: add      x0, x8, #0x138
  0x2907a84: ldp      x8, x2, [x0]
  0x2907a88: mov      x0, x21
  0x2907a8c: mov      w1, w22
  0x2907a90: blr      x8
  0x2907a94: ldr      x0, [x19, #0x40]
  0x2907a98: cbz      x0, #0x2907b24
  0x2907a9c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2907aa0: mov      w1, #5
  0x2907aa4: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907aa8: cbz      x0, #0x2907b24
  0x2907aac: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907ab0: ldr      w20, [x20, #0x38]
  0x2907ab4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2907ab8: mov      x19, x0
  0x2907abc: ldrh     w9, [x8, #0x12e]
  0x2907ac0: cbz      x9, #0x2907ae4
  0x2907ac4: ldr      x10, [x8, #0xb0]
  0x2907ac8: add      x10, x10, #8
  0x2907acc: ldur     x11, [x10, #-8]
  0x2907ad0: cmp      x11, x1
  0x2907ad4: b.eq     #0x2907af4
  0x2907ad8: subs     x9, x9, #1
  0x2907adc: add      x10, x10, #0x10
  0x2907ae0: b.ne     #0x2907acc
  0x2907ae4: mov      w2, #0xc
  0x2907ae8: mov      x0, x19
  0x2907aec: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907af0: b        #0x2907b04
  0x2907af4: ldr      w9, [x10]
  0x2907af8: add      w9, w9, #0xc
  0x2907afc: add      x8, x8, w9, sxtw #4
  0x2907b00: add      x0, x8, #0x138
  0x2907b04: ldp      x3, x2, [x0]
  0x2907b08: mov      x0, x19
  0x2907b0c: mov      w1, w20
  0x2907b10: ldp      x20, x19, [sp, #0x30]
  0x2907b14: ldp      x22, x21, [sp, #0x20]
  0x2907b18: ldp      x24, x23, [sp, #0x10]
  0x2907b1c: ldr      x30, [sp], #0x40
  0x2907b20: br       x3
  0x2907b24: bl       #0x21afc18 ; -> ??? 0x21afc18
