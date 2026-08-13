; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcBasicStats @ 0x2906660..0x2907704 (taille 4260 octets) =====
  0x2906660: stp      x29, x30, [sp, #-0x60]!
  0x2906664: stp      x28, x27, [sp, #0x10]
  0x2906668: stp      x26, x25, [sp, #0x20]
  0x290666c: stp      x24, x23, [sp, #0x30]
  0x2906670: stp      x22, x21, [sp, #0x40]
  0x2906674: stp      x20, x19, [sp, #0x50]
  0x2906678: adrp     x20, #0x59d8000
  0x290667c: ldrb     w8, [x20, #0x283]
  0x2906680: mov      x19, x0
  0x2906684: tbnz     w8, #0, #0x29066a8
  0x2906688: adrp     x0, #0x55b6000
  0x290668c: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2906690: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2906694: adrp     x0, #0x55b6000
  0x2906698: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290669c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29066a0: mov      w8, #1
  0x29066a4: strb     w8, [x20, #0x283]
  0x29066a8: ldr      x8, [x19]
  0x29066ac: mov      x0, x19
  0x29066b0: ldp      x9, x1, [x8, #0x188]
  0x29066b4: blr      x9
  0x29066b8: ldr      x0, [x19, #0x40]
  0x29066bc: cbz      x0, #0x2907700
  0x29066c0: adrp     x28, #0x55b6000
  0x29066c4: ldr      x28, [x28, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x29066c8: mov      w1, #2
  0x29066cc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x29066d0: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29066d4: mov      x29, x19
  0x29066d8: ldr      x9, [x29, #0xf0]!
  0x29066dc: cbz      x9, #0x2907700
  0x29066e0: mov      x20, x0
  0x29066e4: cbz      x0, #0x2907700
  0x29066e8: adrp     x26, #0x55b6000
  0x29066ec: ldr      x26, [x26, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29066f0: ldr      x8, [x20]
  0x29066f4: add      x27, x19, #0x79
  0x29066f8: ldrb     w21, [x27]
  0x29066fc: ldrb     w22, [x9, #0x6d]
  0x2906700: ldrb     w23, [x9, #0x6c]
  0x2906704: ldrh     w9, [x8, #0x12e]
  0x2906708: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x290670c: cbz      x9, #0x2906730
  0x2906710: ldr      x10, [x8, #0xb0]
  0x2906714: add      x10, x10, #8
  0x2906718: ldur     x11, [x10, #-8]
  0x290671c: cmp      x11, x1
  0x2906720: b.eq     #0x2906740
  0x2906724: subs     x9, x9, #1
  0x2906728: add      x10, x10, #0x10
  0x290672c: b.ne     #0x2906718
  0x2906730: mov      w2, #6
  0x2906734: mov      x0, x20
  0x2906738: bl       #0x2210028 ; -> ??? 0x2210028
  0x290673c: b        #0x2906750
  0x2906740: ldr      w9, [x10]
  0x2906744: add      w9, w9, #6
  0x2906748: add      x8, x8, w9, sxtw #4
  0x290674c: add      x0, x8, #0x138
  0x2906750: ldp      x8, x7, [x0]
  0x2906754: mov      x0, x20
  0x2906758: mov      w1, w23
  0x290675c: mov      w2, w22
  0x2906760: mov      w3, w21
  0x2906764: mov      w4, wzr
  0x2906768: mov      w5, wzr
  0x290676c: mov      x6, x19
  0x2906770: blr      x8
  0x2906774: ldr      x0, [x19, #0x40]
  0x2906778: cbz      x0, #0x2907700
  0x290677c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906780: mov      w1, #4
  0x2906784: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906788: ldr      x9, [x29]
  0x290678c: cbz      x9, #0x2907700
  0x2906790: mov      x20, x0
  0x2906794: cbz      x0, #0x2907700
  0x2906798: ldr      x8, [x20]
  0x290679c: ldr      w21, [x19, #0xb0]
  0x29067a0: ldr      w22, [x19, #0xc0]
  0x29067a4: ldrb     w23, [x27]
  0x29067a8: ldrh     w24, [x9, #0x74]
  0x29067ac: ldrh     w25, [x9, #0x72]
  0x29067b0: ldrh     w9, [x8, #0x12e]
  0x29067b4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29067b8: cbz      x9, #0x29067dc
  0x29067bc: ldr      x10, [x8, #0xb0]
  0x29067c0: add      x10, x10, #8
  0x29067c4: ldur     x11, [x10, #-8]
  0x29067c8: cmp      x11, x1
  0x29067cc: b.eq     #0x29067ec
  0x29067d0: subs     x9, x9, #1
  0x29067d4: add      x10, x10, #0x10
  0x29067d8: b.ne     #0x29067c4
  0x29067dc: mov      w2, #6
  0x29067e0: mov      x0, x20
  0x29067e4: bl       #0x2210028 ; -> ??? 0x2210028
  0x29067e8: b        #0x29067fc
  0x29067ec: ldr      w9, [x10]
  0x29067f0: add      w9, w9, #6
  0x29067f4: add      x8, x8, w9, sxtw #4
  0x29067f8: add      x0, x8, #0x138
  0x29067fc: ldp      x8, x7, [x0]
  0x2906800: mov      x0, x20
  0x2906804: mov      w1, w25
  0x2906808: mov      w2, w24
  0x290680c: mov      w3, w23
  0x2906810: mov      w4, w21
  0x2906814: mov      w5, w22
  0x2906818: mov      x6, x19
  0x290681c: blr      x8
  0x2906820: ldr      x0, [x19, #0x40]
  0x2906824: cbz      x0, #0x2907700
  0x2906828: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x290682c: mov      w1, #5
  0x2906830: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906834: ldr      x9, [x29]
  0x2906838: cbz      x9, #0x2907700
  0x290683c: mov      x20, x0
  0x2906840: cbz      x0, #0x2907700
  0x2906844: ldr      x8, [x20]
  0x2906848: ldr      w21, [x19, #0xb4]
  0x290684c: ldr      w22, [x19, #0xc4]
  0x2906850: ldrb     w23, [x27]
  0x2906854: ldrh     w24, [x9, #0x78]
  0x2906858: ldrh     w25, [x9, #0x76]
  0x290685c: ldrh     w9, [x8, #0x12e]
  0x2906860: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906864: cbz      x9, #0x2906888
  0x2906868: ldr      x10, [x8, #0xb0]
  0x290686c: add      x10, x10, #8
  0x2906870: ldur     x11, [x10, #-8]
  0x2906874: cmp      x11, x1
  0x2906878: b.eq     #0x2906898
  0x290687c: subs     x9, x9, #1
  0x2906880: add      x10, x10, #0x10
  0x2906884: b.ne     #0x2906870
  0x2906888: mov      w2, #6
  0x290688c: mov      x0, x20
  0x2906890: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906894: b        #0x29068a8
  0x2906898: ldr      w9, [x10]
  0x290689c: add      w9, w9, #6
  0x29068a0: add      x8, x8, w9, sxtw #4
  0x29068a4: add      x0, x8, #0x138
  0x29068a8: ldp      x8, x7, [x0]
  0x29068ac: mov      x0, x20
  0x29068b0: mov      w1, w25
  0x29068b4: mov      w2, w24
  0x29068b8: mov      w3, w23
  0x29068bc: mov      w4, w21
  0x29068c0: mov      w5, w22
  0x29068c4: mov      x6, x19
  0x29068c8: blr      x8
  0x29068cc: ldr      x0, [x19, #0x40]
  0x29068d0: cbz      x0, #0x2907700
  0x29068d4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x29068d8: mov      w1, #3
  0x29068dc: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29068e0: ldr      x9, [x29]
  0x29068e4: cbz      x9, #0x2907700
  0x29068e8: mov      x20, x0
  0x29068ec: cbz      x0, #0x2907700
  0x29068f0: ldr      x8, [x20]
  0x29068f4: ldr      w21, [x19, #0xbc]
  0x29068f8: ldrb     w22, [x27]
  0x29068fc: ldrh     w23, [x9, #0x70]
  0x2906900: ldrh     w24, [x9, #0x6e]
  0x2906904: ldrh     w9, [x8, #0x12e]
  0x2906908: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x290690c: cbz      x9, #0x2906930
  0x2906910: ldr      x10, [x8, #0xb0]
  0x2906914: add      x10, x10, #8
  0x2906918: ldur     x11, [x10, #-8]
  0x290691c: cmp      x11, x1
  0x2906920: b.eq     #0x2906940
  0x2906924: subs     x9, x9, #1
  0x2906928: add      x10, x10, #0x10
  0x290692c: b.ne     #0x2906918
  0x2906930: mov      w2, #6
  0x2906934: mov      x0, x20
  0x2906938: bl       #0x2210028 ; -> ??? 0x2210028
  0x290693c: b        #0x2906950
  0x2906940: ldr      w9, [x10]
  0x2906944: add      w9, w9, #6
  0x2906948: add      x8, x8, w9, sxtw #4
  0x290694c: add      x0, x8, #0x138
  0x2906950: ldp      x8, x7, [x0]
  0x2906954: mov      x0, x20
  0x2906958: mov      w1, w24
  0x290695c: mov      w2, w23
  0x2906960: mov      w3, w22
  0x2906964: mov      w4, w21
  0x2906968: mov      w5, wzr
  0x290696c: mov      x6, x19
  0x2906970: blr      x8
  0x2906974: ldr      x0, [x19, #0x40]
  0x2906978: cbz      x0, #0x2907700
  0x290697c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906980: mov      w1, #6
  0x2906984: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906988: ldr      x9, [x29]
  0x290698c: cbz      x9, #0x2907700
  0x2906990: mov      x20, x0
  0x2906994: cbz      x0, #0x2907700
  0x2906998: ldr      x8, [x20]
  0x290699c: ldrb     w21, [x27]
  0x29069a0: ldrh     w22, [x9, #0x7c]
  0x29069a4: ldrh     w23, [x9, #0x7a]
  0x29069a8: ldrh     w9, [x8, #0x12e]
  0x29069ac: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29069b0: cbz      x9, #0x29069d4
  0x29069b4: ldr      x10, [x8, #0xb0]
  0x29069b8: add      x10, x10, #8
  0x29069bc: ldur     x11, [x10, #-8]
  0x29069c0: cmp      x11, x1
  0x29069c4: b.eq     #0x29069e4
  0x29069c8: subs     x9, x9, #1
  0x29069cc: add      x10, x10, #0x10
  0x29069d0: b.ne     #0x29069bc
  0x29069d4: mov      w2, #6
  0x29069d8: mov      x0, x20
  0x29069dc: bl       #0x2210028 ; -> ??? 0x2210028
  0x29069e0: b        #0x29069f4
  0x29069e4: ldr      w9, [x10]
  0x29069e8: add      w9, w9, #6
  0x29069ec: add      x8, x8, w9, sxtw #4
  0x29069f0: add      x0, x8, #0x138
  0x29069f4: ldp      x8, x7, [x0]
  0x29069f8: mov      x0, x20
  0x29069fc: mov      w1, w23
  0x2906a00: mov      w2, w22
  0x2906a04: mov      w3, w21
  0x2906a08: mov      w4, wzr
  0x2906a0c: mov      w5, wzr
  0x2906a10: mov      x6, x19
  0x2906a14: blr      x8
  0x2906a18: ldr      x0, [x19, #0x40]
  0x2906a1c: cbz      x0, #0x2907700
  0x2906a20: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906a24: mov      w1, #7
  0x2906a28: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906a2c: ldr      x9, [x29]
  0x2906a30: cbz      x9, #0x2907700
  0x2906a34: mov      x20, x0
  0x2906a38: cbz      x0, #0x2907700
  0x2906a3c: ldr      x8, [x20]
  0x2906a40: ldrb     w21, [x27]
  0x2906a44: ldrh     w22, [x9, #0x80]
  0x2906a48: ldrh     w23, [x9, #0x7e]
  0x2906a4c: ldrh     w9, [x8, #0x12e]
  0x2906a50: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906a54: cbz      x9, #0x2906a78
  0x2906a58: ldr      x10, [x8, #0xb0]
  0x2906a5c: add      x10, x10, #8
  0x2906a60: ldur     x11, [x10, #-8]
  0x2906a64: cmp      x11, x1
  0x2906a68: b.eq     #0x2906a88
  0x2906a6c: subs     x9, x9, #1
  0x2906a70: add      x10, x10, #0x10
  0x2906a74: b.ne     #0x2906a60
  0x2906a78: mov      w2, #6
  0x2906a7c: mov      x0, x20
  0x2906a80: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906a84: b        #0x2906a98
  0x2906a88: ldr      w9, [x10]
  0x2906a8c: add      w9, w9, #6
  0x2906a90: add      x8, x8, w9, sxtw #4
  0x2906a94: add      x0, x8, #0x138
  0x2906a98: ldp      x8, x7, [x0]
  0x2906a9c: mov      x0, x20
  0x2906aa0: mov      w1, w23
  0x2906aa4: mov      w2, w22
  0x2906aa8: mov      w3, w21
  0x2906aac: mov      w4, wzr
  0x2906ab0: mov      w5, wzr
  0x2906ab4: mov      x6, x19
  0x2906ab8: blr      x8
  0x2906abc: ldr      x0, [x19, #0x40]
  0x2906ac0: cbz      x0, #0x2907700
  0x2906ac4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906ac8: mov      w1, #8
  0x2906acc: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906ad0: ldr      x9, [x29]
  0x2906ad4: cbz      x9, #0x2907700
  0x2906ad8: mov      x20, x0
  0x2906adc: cbz      x0, #0x2907700
  0x2906ae0: ldr      x8, [x20]
  0x2906ae4: ldrb     w21, [x27]
  0x2906ae8: ldrh     w22, [x9, #0x84]
  0x2906aec: ldrh     w23, [x9, #0x82]
  0x2906af0: ldrh     w9, [x8, #0x12e]
  0x2906af4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906af8: cbz      x9, #0x2906b1c
  0x2906afc: ldr      x10, [x8, #0xb0]
  0x2906b00: add      x10, x10, #8
  0x2906b04: ldur     x11, [x10, #-8]
  0x2906b08: cmp      x11, x1
  0x2906b0c: b.eq     #0x2906b2c
  0x2906b10: subs     x9, x9, #1
  0x2906b14: add      x10, x10, #0x10
  0x2906b18: b.ne     #0x2906b04
  0x2906b1c: mov      w2, #6
  0x2906b20: mov      x0, x20
  0x2906b24: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906b28: b        #0x2906b3c
  0x2906b2c: ldr      w9, [x10]
  0x2906b30: add      w9, w9, #6
  0x2906b34: add      x8, x8, w9, sxtw #4
  0x2906b38: add      x0, x8, #0x138
  0x2906b3c: ldp      x8, x7, [x0]
  0x2906b40: mov      x0, x20
  0x2906b44: mov      w1, w23
  0x2906b48: mov      w2, w22
  0x2906b4c: mov      w3, w21
  0x2906b50: mov      w4, wzr
  0x2906b54: mov      w5, wzr
  0x2906b58: mov      x6, x19
  0x2906b5c: blr      x8
  0x2906b60: ldr      x0, [x19, #0x40]
  0x2906b64: cbz      x0, #0x2907700
  0x2906b68: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906b6c: mov      w1, #9
  0x2906b70: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906b74: ldr      x9, [x29]
  0x2906b78: cbz      x9, #0x2907700
  0x2906b7c: mov      x20, x0
  0x2906b80: cbz      x0, #0x2907700
  0x2906b84: ldr      x8, [x20]
  0x2906b88: ldrb     w21, [x27]
  0x2906b8c: ldrh     w22, [x9, #0x88]
  0x2906b90: ldrh     w23, [x9, #0x86]
  0x2906b94: ldrh     w9, [x8, #0x12e]
  0x2906b98: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906b9c: cbz      x9, #0x2906bc0
  0x2906ba0: ldr      x10, [x8, #0xb0]
  0x2906ba4: add      x10, x10, #8
  0x2906ba8: ldur     x11, [x10, #-8]
  0x2906bac: cmp      x11, x1
  0x2906bb0: b.eq     #0x2906bd0
  0x2906bb4: subs     x9, x9, #1
  0x2906bb8: add      x10, x10, #0x10
  0x2906bbc: b.ne     #0x2906ba8
  0x2906bc0: mov      w2, #6
  0x2906bc4: mov      x0, x20
  0x2906bc8: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906bcc: b        #0x2906be0
  0x2906bd0: ldr      w9, [x10]
  0x2906bd4: add      w9, w9, #6
  0x2906bd8: add      x8, x8, w9, sxtw #4
  0x2906bdc: add      x0, x8, #0x138
  0x2906be0: ldp      x8, x7, [x0]
  0x2906be4: mov      x0, x20
  0x2906be8: mov      w1, w23
  0x2906bec: mov      w2, w22
  0x2906bf0: mov      w3, w21
  0x2906bf4: mov      w4, wzr
  0x2906bf8: mov      w5, wzr
  0x2906bfc: mov      x6, x19
  0x2906c00: blr      x8
  0x2906c04: ldr      x0, [x19, #0x40]
  0x2906c08: cbz      x0, #0x2907700
  0x2906c0c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906c10: mov      w1, #0xa
  0x2906c14: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906c18: ldr      x9, [x29]
  0x2906c1c: cbz      x9, #0x2907700
  0x2906c20: mov      x20, x0
  0x2906c24: cbz      x0, #0x2907700
  0x2906c28: ldr      x8, [x20]
  0x2906c2c: ldrb     w21, [x27]
  0x2906c30: ldrh     w22, [x9, #0x8c]
  0x2906c34: ldrh     w23, [x9, #0x8a]
  0x2906c38: ldrh     w9, [x8, #0x12e]
  0x2906c3c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906c40: cbz      x9, #0x2906c64
  0x2906c44: ldr      x10, [x8, #0xb0]
  0x2906c48: add      x10, x10, #8
  0x2906c4c: ldur     x11, [x10, #-8]
  0x2906c50: cmp      x11, x1
  0x2906c54: b.eq     #0x2906c74
  0x2906c58: subs     x9, x9, #1
  0x2906c5c: add      x10, x10, #0x10
  0x2906c60: b.ne     #0x2906c4c
  0x2906c64: mov      w2, #6
  0x2906c68: mov      x0, x20
  0x2906c6c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906c70: b        #0x2906c84
  0x2906c74: ldr      w9, [x10]
  0x2906c78: add      w9, w9, #6
  0x2906c7c: add      x8, x8, w9, sxtw #4
  0x2906c80: add      x0, x8, #0x138
  0x2906c84: ldp      x8, x7, [x0]
  0x2906c88: mov      x0, x20
  0x2906c8c: mov      w1, w23
  0x2906c90: mov      w2, w22
  0x2906c94: mov      w3, w21
  0x2906c98: mov      w4, wzr
  0x2906c9c: mov      w5, wzr
  0x2906ca0: mov      x6, x19
  0x2906ca4: blr      x8
  0x2906ca8: ldr      x0, [x19, #0x40]
  0x2906cac: cbz      x0, #0x2907700
  0x2906cb0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906cb4: mov      w1, #0xb
  0x2906cb8: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906cbc: ldr      x9, [x29]
  0x2906cc0: cbz      x9, #0x2907700
  0x2906cc4: mov      x20, x0
  0x2906cc8: cbz      x0, #0x2907700
  0x2906ccc: ldr      x8, [x20]
  0x2906cd0: ldrb     w21, [x27]
  0x2906cd4: ldrh     w22, [x9, #0x90]
  0x2906cd8: ldrh     w23, [x9, #0x8e]
  0x2906cdc: ldrh     w9, [x8, #0x12e]
  0x2906ce0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906ce4: cbz      x9, #0x2906d08
  0x2906ce8: ldr      x10, [x8, #0xb0]
  0x2906cec: add      x10, x10, #8
  0x2906cf0: ldur     x11, [x10, #-8]
  0x2906cf4: cmp      x11, x1
  0x2906cf8: b.eq     #0x2906d18
  0x2906cfc: subs     x9, x9, #1
  0x2906d00: add      x10, x10, #0x10
  0x2906d04: b.ne     #0x2906cf0
  0x2906d08: mov      w2, #6
  0x2906d0c: mov      x0, x20
  0x2906d10: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906d14: b        #0x2906d28
  0x2906d18: ldr      w9, [x10]
  0x2906d1c: add      w9, w9, #6
  0x2906d20: add      x8, x8, w9, sxtw #4
  0x2906d24: add      x0, x8, #0x138
  0x2906d28: ldp      x8, x7, [x0]
  0x2906d2c: mov      x0, x20
  0x2906d30: mov      w1, w23
  0x2906d34: mov      w2, w22
  0x2906d38: mov      w3, w21
  0x2906d3c: mov      w4, wzr
  0x2906d40: mov      w5, wzr
  0x2906d44: mov      x6, x19
  0x2906d48: blr      x8
  0x2906d4c: ldr      x0, [x19, #0x40]
  0x2906d50: cbz      x0, #0x2907700
  0x2906d54: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906d58: mov      w1, #0xc
  0x2906d5c: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906d60: ldr      x9, [x29]
  0x2906d64: cbz      x9, #0x2907700
  0x2906d68: mov      x20, x0
  0x2906d6c: cbz      x0, #0x2907700
  0x2906d70: ldr      x8, [x20]
  0x2906d74: ldrb     w21, [x27]
  0x2906d78: ldrh     w22, [x9, #0x94]
  0x2906d7c: ldrh     w23, [x9, #0x92]
  0x2906d80: ldrh     w9, [x8, #0x12e]
  0x2906d84: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906d88: cbz      x9, #0x2906dac
  0x2906d8c: ldr      x10, [x8, #0xb0]
  0x2906d90: add      x10, x10, #8
  0x2906d94: ldur     x11, [x10, #-8]
  0x2906d98: cmp      x11, x1
  0x2906d9c: b.eq     #0x2906dbc
  0x2906da0: subs     x9, x9, #1
  0x2906da4: add      x10, x10, #0x10
  0x2906da8: b.ne     #0x2906d94
  0x2906dac: mov      w2, #6
  0x2906db0: mov      x0, x20
  0x2906db4: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906db8: b        #0x2906dcc
  0x2906dbc: ldr      w9, [x10]
  0x2906dc0: add      w9, w9, #6
  0x2906dc4: add      x8, x8, w9, sxtw #4
  0x2906dc8: add      x0, x8, #0x138
  0x2906dcc: ldp      x8, x7, [x0]
  0x2906dd0: mov      x0, x20
  0x2906dd4: mov      w1, w23
  0x2906dd8: mov      w2, w22
  0x2906ddc: mov      w3, w21
  0x2906de0: mov      w4, wzr
  0x2906de4: mov      w5, wzr
  0x2906de8: mov      x6, x19
  0x2906dec: blr      x8
  0x2906df0: ldr      x0, [x19, #0x40]
  0x2906df4: cbz      x0, #0x2907700
  0x2906df8: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906dfc: mov      w1, #0xd
  0x2906e00: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906e04: ldr      x9, [x29]
  0x2906e08: cbz      x9, #0x2907700
  0x2906e0c: mov      x20, x0
  0x2906e10: cbz      x0, #0x2907700
  0x2906e14: ldr      x8, [x20]
  0x2906e18: ldrb     w21, [x27]
  0x2906e1c: ldrh     w22, [x9, #0x98]
  0x2906e20: ldrh     w23, [x9, #0x96]
  0x2906e24: ldrh     w9, [x8, #0x12e]
  0x2906e28: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906e2c: cbz      x9, #0x2906e50
  0x2906e30: ldr      x10, [x8, #0xb0]
  0x2906e34: add      x10, x10, #8
  0x2906e38: ldur     x11, [x10, #-8]
  0x2906e3c: cmp      x11, x1
  0x2906e40: b.eq     #0x2906e60
  0x2906e44: subs     x9, x9, #1
  0x2906e48: add      x10, x10, #0x10
  0x2906e4c: b.ne     #0x2906e38
  0x2906e50: mov      w2, #6
  0x2906e54: mov      x0, x20
  0x2906e58: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906e5c: b        #0x2906e70
  0x2906e60: ldr      w9, [x10]
  0x2906e64: add      w9, w9, #6
  0x2906e68: add      x8, x8, w9, sxtw #4
  0x2906e6c: add      x0, x8, #0x138
  0x2906e70: ldp      x8, x7, [x0]
  0x2906e74: mov      x0, x20
  0x2906e78: mov      w1, w23
  0x2906e7c: mov      w2, w22
  0x2906e80: mov      w3, w21
  0x2906e84: mov      w4, wzr
  0x2906e88: mov      w5, wzr
  0x2906e8c: mov      x6, x19
  0x2906e90: blr      x8
  0x2906e94: ldr      x0, [x19, #0x40]
  0x2906e98: cbz      x0, #0x2907700
  0x2906e9c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906ea0: mov      w1, #0xe
  0x2906ea4: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906ea8: ldr      x9, [x29]
  0x2906eac: cbz      x9, #0x2907700
  0x2906eb0: mov      x20, x0
  0x2906eb4: cbz      x0, #0x2907700
  0x2906eb8: ldr      x8, [x20]
  0x2906ebc: ldrb     w21, [x27]
  0x2906ec0: ldrh     w22, [x9, #0x9c]
  0x2906ec4: ldrh     w23, [x9, #0x9a]
  0x2906ec8: ldrh     w9, [x8, #0x12e]
  0x2906ecc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906ed0: cbz      x9, #0x2906ef4
  0x2906ed4: ldr      x10, [x8, #0xb0]
  0x2906ed8: add      x10, x10, #8
  0x2906edc: ldur     x11, [x10, #-8]
  0x2906ee0: cmp      x11, x1
  0x2906ee4: b.eq     #0x2906f04
  0x2906ee8: subs     x9, x9, #1
  0x2906eec: add      x10, x10, #0x10
  0x2906ef0: b.ne     #0x2906edc
  0x2906ef4: mov      w2, #6
  0x2906ef8: mov      x0, x20
  0x2906efc: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906f00: b        #0x2906f14
  0x2906f04: ldr      w9, [x10]
  0x2906f08: add      w9, w9, #6
  0x2906f0c: add      x8, x8, w9, sxtw #4
  0x2906f10: add      x0, x8, #0x138
  0x2906f14: ldp      x8, x7, [x0]
  0x2906f18: mov      x0, x20
  0x2906f1c: mov      w1, w23
  0x2906f20: mov      w2, w22
  0x2906f24: mov      w3, w21
  0x2906f28: mov      w4, wzr
  0x2906f2c: mov      w5, wzr
  0x2906f30: mov      x6, x19
  0x2906f34: blr      x8
  0x2906f38: ldr      x0, [x19, #0x40]
  0x2906f3c: cbz      x0, #0x2907700
  0x2906f40: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906f44: mov      w1, #0xf
  0x2906f48: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906f4c: ldr      x9, [x29]
  0x2906f50: cbz      x9, #0x2907700
  0x2906f54: mov      x20, x0
  0x2906f58: cbz      x0, #0x2907700
  0x2906f5c: ldr      x8, [x20]
  0x2906f60: ldrb     w21, [x27]
  0x2906f64: ldrh     w22, [x9, #0xa0]
  0x2906f68: ldrh     w23, [x9, #0x9e]
  0x2906f6c: ldrh     w9, [x8, #0x12e]
  0x2906f70: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906f74: cbz      x9, #0x2906f98
  0x2906f78: ldr      x10, [x8, #0xb0]
  0x2906f7c: add      x10, x10, #8
  0x2906f80: ldur     x11, [x10, #-8]
  0x2906f84: cmp      x11, x1
  0x2906f88: b.eq     #0x2906fa8
  0x2906f8c: subs     x9, x9, #1
  0x2906f90: add      x10, x10, #0x10
  0x2906f94: b.ne     #0x2906f80
  0x2906f98: mov      w2, #6
  0x2906f9c: mov      x0, x20
  0x2906fa0: bl       #0x2210028 ; -> ??? 0x2210028
  0x2906fa4: b        #0x2906fb8
  0x2906fa8: ldr      w9, [x10]
  0x2906fac: add      w9, w9, #6
  0x2906fb0: add      x8, x8, w9, sxtw #4
  0x2906fb4: add      x0, x8, #0x138
  0x2906fb8: ldp      x8, x7, [x0]
  0x2906fbc: mov      x0, x20
  0x2906fc0: mov      w1, w23
  0x2906fc4: mov      w2, w22
  0x2906fc8: mov      w3, w21
  0x2906fcc: mov      w4, wzr
  0x2906fd0: mov      w5, wzr
  0x2906fd4: mov      x6, x19
  0x2906fd8: blr      x8
  0x2906fdc: ldr      x0, [x19, #0x40]
  0x2906fe0: cbz      x0, #0x2907700
  0x2906fe4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2906fe8: mov      w1, #0x10
  0x2906fec: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2906ff0: ldr      x9, [x29]
  0x2906ff4: cbz      x9, #0x2907700
  0x2906ff8: mov      x20, x0
  0x2906ffc: cbz      x0, #0x2907700
  0x2907000: ldr      x8, [x20]
  0x2907004: ldrb     w21, [x27]
  0x2907008: ldrh     w22, [x9, #0xa4]
  0x290700c: ldrh     w23, [x9, #0xa2]
  0x2907010: ldrh     w9, [x8, #0x12e]
  0x2907014: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907018: cbz      x9, #0x290703c
  0x290701c: ldr      x10, [x8, #0xb0]
  0x2907020: add      x10, x10, #8
  0x2907024: ldur     x11, [x10, #-8]
  0x2907028: cmp      x11, x1
  0x290702c: b.eq     #0x290704c
  0x2907030: subs     x9, x9, #1
  0x2907034: add      x10, x10, #0x10
  0x2907038: b.ne     #0x2907024
  0x290703c: mov      w2, #6
  0x2907040: mov      x0, x20
  0x2907044: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907048: b        #0x290705c
  0x290704c: ldr      w9, [x10]
  0x2907050: add      w9, w9, #6
  0x2907054: add      x8, x8, w9, sxtw #4
  0x2907058: add      x0, x8, #0x138
  0x290705c: ldp      x8, x7, [x0]
  0x2907060: mov      x0, x20
  0x2907064: mov      w1, w23
  0x2907068: mov      w2, w22
  0x290706c: mov      w3, w21
  0x2907070: mov      w4, wzr
  0x2907074: mov      w5, wzr
  0x2907078: mov      x6, x19
  0x290707c: blr      x8
  0x2907080: ldr      x0, [x19, #0x40]
  0x2907084: cbz      x0, #0x2907700
  0x2907088: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x290708c: mov      w1, #0x11
  0x2907090: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907094: ldr      x9, [x29]
  0x2907098: cbz      x9, #0x2907700
  0x290709c: mov      x20, x0
  0x29070a0: cbz      x0, #0x2907700
  0x29070a4: ldr      x8, [x20]
  0x29070a8: ldrb     w21, [x27]
  0x29070ac: ldrh     w22, [x9, #0xa8]
  0x29070b0: ldrh     w23, [x9, #0xa6]
  0x29070b4: ldrh     w9, [x8, #0x12e]
  0x29070b8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29070bc: cbz      x9, #0x29070e0
  0x29070c0: ldr      x10, [x8, #0xb0]
  0x29070c4: add      x10, x10, #8
  0x29070c8: ldur     x11, [x10, #-8]
  0x29070cc: cmp      x11, x1
  0x29070d0: b.eq     #0x29070f0
  0x29070d4: subs     x9, x9, #1
  0x29070d8: add      x10, x10, #0x10
  0x29070dc: b.ne     #0x29070c8
  0x29070e0: mov      w2, #6
  0x29070e4: mov      x0, x20
  0x29070e8: bl       #0x2210028 ; -> ??? 0x2210028
  0x29070ec: b        #0x2907100
  0x29070f0: ldr      w9, [x10]
  0x29070f4: add      w9, w9, #6
  0x29070f8: add      x8, x8, w9, sxtw #4
  0x29070fc: add      x0, x8, #0x138
  0x2907100: ldp      x8, x7, [x0]
  0x2907104: mov      x0, x20
  0x2907108: mov      w1, w23
  0x290710c: mov      w2, w22
  0x2907110: mov      w3, w21
  0x2907114: mov      w4, wzr
  0x2907118: mov      w5, wzr
  0x290711c: mov      x6, x19
  0x2907120: blr      x8
  0x2907124: ldr      x0, [x19, #0x40]
  0x2907128: cbz      x0, #0x2907700
  0x290712c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2907130: mov      w1, #0x12
  0x2907134: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907138: ldr      x9, [x29]
  0x290713c: cbz      x9, #0x2907700
  0x2907140: mov      x20, x0
  0x2907144: cbz      x0, #0x2907700
  0x2907148: ldr      x8, [x20]
  0x290714c: ldrb     w21, [x27]
  0x2907150: ldrh     w22, [x9, #0xac]
  0x2907154: ldrh     w23, [x9, #0xaa]
  0x2907158: ldrh     w9, [x8, #0x12e]
  0x290715c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907160: cbz      x9, #0x2907184
  0x2907164: ldr      x10, [x8, #0xb0]
  0x2907168: add      x10, x10, #8
  0x290716c: ldur     x11, [x10, #-8]
  0x2907170: cmp      x11, x1
  0x2907174: b.eq     #0x2907194
  0x2907178: subs     x9, x9, #1
  0x290717c: add      x10, x10, #0x10
  0x2907180: b.ne     #0x290716c
  0x2907184: mov      w2, #6
  0x2907188: mov      x0, x20
  0x290718c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907190: b        #0x29071a4
  0x2907194: ldr      w9, [x10]
  0x2907198: add      w9, w9, #6
  0x290719c: add      x8, x8, w9, sxtw #4
  0x29071a0: add      x0, x8, #0x138
  0x29071a4: ldp      x8, x7, [x0]
  0x29071a8: mov      x0, x20
  0x29071ac: mov      w1, w23
  0x29071b0: mov      w2, w22
  0x29071b4: mov      w3, w21
  0x29071b8: mov      w4, wzr
  0x29071bc: mov      w5, wzr
  0x29071c0: mov      x6, x19
  0x29071c4: blr      x8
  0x29071c8: ldr      x0, [x19, #0x40]
  0x29071cc: cbz      x0, #0x2907700
  0x29071d0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x29071d4: mov      w1, #0x13
  0x29071d8: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29071dc: ldr      x9, [x29]
  0x29071e0: cbz      x9, #0x2907700
  0x29071e4: mov      x20, x0
  0x29071e8: cbz      x0, #0x2907700
  0x29071ec: ldr      x8, [x20]
  0x29071f0: ldrb     w21, [x27]
  0x29071f4: ldrh     w22, [x9, #0xb0]
  0x29071f8: ldrh     w23, [x9, #0xae]
  0x29071fc: ldrh     w9, [x8, #0x12e]
  0x2907200: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907204: cbz      x9, #0x2907228
  0x2907208: ldr      x10, [x8, #0xb0]
  0x290720c: add      x10, x10, #8
  0x2907210: ldur     x11, [x10, #-8]
  0x2907214: cmp      x11, x1
  0x2907218: b.eq     #0x2907238
  0x290721c: subs     x9, x9, #1
  0x2907220: add      x10, x10, #0x10
  0x2907224: b.ne     #0x2907210
  0x2907228: mov      w2, #6
  0x290722c: mov      x0, x20
  0x2907230: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907234: b        #0x2907248
  0x2907238: ldr      w9, [x10]
  0x290723c: add      w9, w9, #6
  0x2907240: add      x8, x8, w9, sxtw #4
  0x2907244: add      x0, x8, #0x138
  0x2907248: ldp      x8, x7, [x0]
  0x290724c: mov      x0, x20
  0x2907250: mov      w1, w23
  0x2907254: mov      w2, w22
  0x2907258: mov      w3, w21
  0x290725c: mov      w4, wzr
  0x2907260: mov      w5, wzr
  0x2907264: mov      x6, x19
  0x2907268: blr      x8
  0x290726c: ldr      x0, [x19, #0x40]
  0x2907270: cbz      x0, #0x2907700
  0x2907274: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2907278: mov      w1, #0x14
  0x290727c: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907280: ldr      x9, [x29]
  0x2907284: cbz      x9, #0x2907700
  0x2907288: mov      x20, x0
  0x290728c: cbz      x0, #0x2907700
  0x2907290: ldr      x8, [x20]
  0x2907294: ldrb     w21, [x27]
  0x2907298: ldrh     w22, [x9, #0xb4]
  0x290729c: ldrh     w23, [x9, #0xb2]
  0x29072a0: ldrh     w9, [x8, #0x12e]
  0x29072a4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29072a8: cbz      x9, #0x29072cc
  0x29072ac: ldr      x10, [x8, #0xb0]
  0x29072b0: add      x10, x10, #8
  0x29072b4: ldur     x11, [x10, #-8]
  0x29072b8: cmp      x11, x1
  0x29072bc: b.eq     #0x29072dc
  0x29072c0: subs     x9, x9, #1
  0x29072c4: add      x10, x10, #0x10
  0x29072c8: b.ne     #0x29072b4
  0x29072cc: mov      w2, #6
  0x29072d0: mov      x0, x20
  0x29072d4: bl       #0x2210028 ; -> ??? 0x2210028
  0x29072d8: b        #0x29072ec
  0x29072dc: ldr      w9, [x10]
  0x29072e0: add      w9, w9, #6
  0x29072e4: add      x8, x8, w9, sxtw #4
  0x29072e8: add      x0, x8, #0x138
  0x29072ec: ldp      x8, x7, [x0]
  0x29072f0: mov      x0, x20
  0x29072f4: mov      w1, w23
  0x29072f8: mov      w2, w22
  0x29072fc: mov      w3, w21
  0x2907300: mov      w4, wzr
  0x2907304: mov      w5, wzr
  0x2907308: mov      x6, x19
  0x290730c: blr      x8
  0x2907310: ldr      x0, [x19, #0x40]
  0x2907314: cbz      x0, #0x2907700
  0x2907318: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x290731c: mov      w1, #0x15
  0x2907320: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907324: ldr      x9, [x29]
  0x2907328: cbz      x9, #0x2907700
  0x290732c: mov      x20, x0
  0x2907330: cbz      x0, #0x2907700
  0x2907334: ldr      x8, [x20]
  0x2907338: ldrb     w21, [x27]
  0x290733c: ldrh     w22, [x9, #0xb8]
  0x2907340: ldrh     w23, [x9, #0xb6]
  0x2907344: ldrh     w9, [x8, #0x12e]
  0x2907348: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x290734c: cbz      x9, #0x2907370
  0x2907350: ldr      x10, [x8, #0xb0]
  0x2907354: add      x10, x10, #8
  0x2907358: ldur     x11, [x10, #-8]
  0x290735c: cmp      x11, x1
  0x2907360: b.eq     #0x2907380
  0x2907364: subs     x9, x9, #1
  0x2907368: add      x10, x10, #0x10
  0x290736c: b.ne     #0x2907358
  0x2907370: mov      w2, #6
  0x2907374: mov      x0, x20
  0x2907378: bl       #0x2210028 ; -> ??? 0x2210028
  0x290737c: b        #0x2907390
  0x2907380: ldr      w9, [x10]
  0x2907384: add      w9, w9, #6
  0x2907388: add      x8, x8, w9, sxtw #4
  0x290738c: add      x0, x8, #0x138
  0x2907390: ldp      x8, x7, [x0]
  0x2907394: mov      x0, x20
  0x2907398: mov      w1, w23
  0x290739c: mov      w2, w22
  0x29073a0: mov      w3, w21
  0x29073a4: mov      w4, wzr
  0x29073a8: mov      w5, wzr
  0x29073ac: mov      x6, x19
  0x29073b0: blr      x8
  0x29073b4: ldr      x0, [x19, #0x40]
  0x29073b8: cbz      x0, #0x2907700
  0x29073bc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x29073c0: mov      w1, #0x16
  0x29073c4: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29073c8: ldr      x9, [x29]
  0x29073cc: cbz      x9, #0x2907700
  0x29073d0: mov      x20, x0
  0x29073d4: cbz      x0, #0x2907700
  0x29073d8: ldr      x8, [x20]
  0x29073dc: ldrb     w21, [x27]
  0x29073e0: ldrh     w22, [x9, #0xbc]
  0x29073e4: ldrh     w23, [x9, #0xba]
  0x29073e8: ldrh     w9, [x8, #0x12e]
  0x29073ec: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29073f0: cbz      x9, #0x2907414
  0x29073f4: ldr      x10, [x8, #0xb0]
  0x29073f8: add      x10, x10, #8
  0x29073fc: ldur     x11, [x10, #-8]
  0x2907400: cmp      x11, x1
  0x2907404: b.eq     #0x2907424
  0x2907408: subs     x9, x9, #1
  0x290740c: add      x10, x10, #0x10
  0x2907410: b.ne     #0x29073fc
  0x2907414: mov      w2, #6
  0x2907418: mov      x0, x20
  0x290741c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907420: b        #0x2907434
  0x2907424: ldr      w9, [x10]
  0x2907428: add      w9, w9, #6
  0x290742c: add      x8, x8, w9, sxtw #4
  0x2907430: add      x0, x8, #0x138
  0x2907434: ldp      x8, x7, [x0]
  0x2907438: mov      x0, x20
  0x290743c: mov      w1, w23
  0x2907440: mov      w2, w22
  0x2907444: mov      w3, w21
  0x2907448: mov      w4, wzr
  0x290744c: mov      w5, wzr
  0x2907450: mov      x6, x19
  0x2907454: blr      x8
  0x2907458: ldr      x0, [x19, #0x40]
  0x290745c: cbz      x0, #0x2907700
  0x2907460: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2907464: mov      w1, #0x17
  0x2907468: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290746c: ldr      x9, [x29]
  0x2907470: cbz      x9, #0x2907700
  0x2907474: mov      x20, x0
  0x2907478: cbz      x0, #0x2907700
  0x290747c: ldr      x8, [x20]
  0x2907480: ldrb     w21, [x27]
  0x2907484: ldrh     w22, [x9, #0xc0]
  0x2907488: ldrh     w23, [x9, #0xbe]
  0x290748c: ldrh     w9, [x8, #0x12e]
  0x2907490: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907494: cbz      x9, #0x29074b8
  0x2907498: ldr      x10, [x8, #0xb0]
  0x290749c: add      x10, x10, #8
  0x29074a0: ldur     x11, [x10, #-8]
  0x29074a4: cmp      x11, x1
  0x29074a8: b.eq     #0x29074c8
  0x29074ac: subs     x9, x9, #1
  0x29074b0: add      x10, x10, #0x10
  0x29074b4: b.ne     #0x29074a0
  0x29074b8: mov      w2, #6
  0x29074bc: mov      x0, x20
  0x29074c0: bl       #0x2210028 ; -> ??? 0x2210028
  0x29074c4: b        #0x29074d8
  0x29074c8: ldr      w9, [x10]
  0x29074cc: add      w9, w9, #6
  0x29074d0: add      x8, x8, w9, sxtw #4
  0x29074d4: add      x0, x8, #0x138
  0x29074d8: ldp      x8, x7, [x0]
  0x29074dc: mov      x0, x20
  0x29074e0: mov      w1, w23
  0x29074e4: mov      w2, w22
  0x29074e8: mov      w3, w21
  0x29074ec: mov      w4, wzr
  0x29074f0: mov      w5, wzr
  0x29074f4: mov      x6, x19
  0x29074f8: blr      x8
  0x29074fc: ldr      x0, [x19, #0x40]
  0x2907500: cbz      x0, #0x2907700
  0x2907504: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2907508: mov      w1, #0x18
  0x290750c: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907510: ldr      x9, [x29]
  0x2907514: cbz      x9, #0x2907700
  0x2907518: mov      x20, x0
  0x290751c: cbz      x0, #0x2907700
  0x2907520: ldr      x8, [x20]
  0x2907524: ldrb     w21, [x27]
  0x2907528: ldrh     w22, [x9, #0xc4]
  0x290752c: ldrh     w23, [x9, #0xc2]
  0x2907530: ldrh     w9, [x8, #0x12e]
  0x2907534: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907538: cbz      x9, #0x290755c
  0x290753c: ldr      x10, [x8, #0xb0]
  0x2907540: add      x10, x10, #8
  0x2907544: ldur     x11, [x10, #-8]
  0x2907548: cmp      x11, x1
  0x290754c: b.eq     #0x290756c
  0x2907550: subs     x9, x9, #1
  0x2907554: add      x10, x10, #0x10
  0x2907558: b.ne     #0x2907544
  0x290755c: mov      w2, #6
  0x2907560: mov      x0, x20
  0x2907564: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907568: b        #0x290757c
  0x290756c: ldr      w9, [x10]
  0x2907570: add      w9, w9, #6
  0x2907574: add      x8, x8, w9, sxtw #4
  0x2907578: add      x0, x8, #0x138
  0x290757c: ldp      x8, x7, [x0]
  0x2907580: mov      x0, x20
  0x2907584: mov      w1, w23
  0x2907588: mov      w2, w22
  0x290758c: mov      w3, w21
  0x2907590: mov      w4, wzr
  0x2907594: mov      w5, wzr
  0x2907598: mov      x6, x19
  0x290759c: blr      x8
  0x29075a0: ldr      x0, [x19, #0x40]
  0x29075a4: cbz      x0, #0x2907700
  0x29075a8: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x29075ac: mov      w1, #0x19
  0x29075b0: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29075b4: ldr      x9, [x29]
  0x29075b8: cbz      x9, #0x2907700
  0x29075bc: mov      x20, x0
  0x29075c0: cbz      x0, #0x2907700
  0x29075c4: ldr      x8, [x20]
  0x29075c8: ldrb     w21, [x27]
  0x29075cc: ldrh     w22, [x9, #0xc8]
  0x29075d0: ldrh     w23, [x9, #0xc6]
  0x29075d4: ldrh     w9, [x8, #0x12e]
  0x29075d8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x29075dc: cbz      x9, #0x2907600
  0x29075e0: ldr      x10, [x8, #0xb0]
  0x29075e4: add      x10, x10, #8
  0x29075e8: ldur     x11, [x10, #-8]
  0x29075ec: cmp      x11, x1
  0x29075f0: b.eq     #0x2907610
  0x29075f4: subs     x9, x9, #1
  0x29075f8: add      x10, x10, #0x10
  0x29075fc: b.ne     #0x29075e8
  0x2907600: mov      w2, #6
  0x2907604: mov      x0, x20
  0x2907608: bl       #0x2210028 ; -> ??? 0x2210028
  0x290760c: b        #0x2907620
  0x2907610: ldr      w9, [x10]
  0x2907614: add      w9, w9, #6
  0x2907618: add      x8, x8, w9, sxtw #4
  0x290761c: add      x0, x8, #0x138
  0x2907620: ldp      x8, x7, [x0]
  0x2907624: mov      x0, x20
  0x2907628: mov      w1, w23
  0x290762c: mov      w2, w22
  0x2907630: mov      w3, w21
  0x2907634: mov      w4, wzr
  0x2907638: mov      w5, wzr
  0x290763c: mov      x6, x19
  0x2907640: blr      x8
  0x2907644: ldr      x0, [x19, #0x40]
  0x2907648: cbz      x0, #0x2907700
  0x290764c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2907650: mov      w1, #0x1a
  0x2907654: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2907658: ldr      x9, [x29]
  0x290765c: cbz      x9, #0x2907700
  0x2907660: mov      x20, x0
  0x2907664: cbz      x0, #0x2907700
  0x2907668: ldr      x8, [x20]
  0x290766c: ldrb     w21, [x27]
  0x2907670: ldrh     w22, [x9, #0xcc]
  0x2907674: ldrh     w23, [x9, #0xca]
  0x2907678: ldrh     w9, [x8, #0x12e]
  0x290767c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2907680: cbz      x9, #0x29076a4
  0x2907684: ldr      x10, [x8, #0xb0]
  0x2907688: add      x10, x10, #8
  0x290768c: ldur     x11, [x10, #-8]
  0x2907690: cmp      x11, x1
  0x2907694: b.eq     #0x29076b4
  0x2907698: subs     x9, x9, #1
  0x290769c: add      x10, x10, #0x10
  0x29076a0: b.ne     #0x290768c
  0x29076a4: mov      w2, #6
  0x29076a8: mov      x0, x20
  0x29076ac: bl       #0x2210028 ; -> ??? 0x2210028
  0x29076b0: b        #0x29076c4
  0x29076b4: ldr      w9, [x10]
  0x29076b8: add      w9, w9, #6
  0x29076bc: add      x8, x8, w9, sxtw #4
  0x29076c0: add      x0, x8, #0x138
  0x29076c4: ldp      x8, x7, [x0]
  0x29076c8: mov      x0, x20
  0x29076cc: mov      w1, w23
  0x29076d0: mov      w2, w22
  0x29076d4: mov      w3, w21
  0x29076d8: mov      x6, x19
  0x29076dc: ldp      x20, x19, [sp, #0x50]
  0x29076e0: ldp      x22, x21, [sp, #0x40]
  0x29076e4: ldp      x24, x23, [sp, #0x30]
  0x29076e8: ldp      x26, x25, [sp, #0x20]
  0x29076ec: ldp      x28, x27, [sp, #0x10]
  0x29076f0: mov      w4, wzr
  0x29076f4: mov      w5, wzr
  0x29076f8: ldp      x29, x30, [sp], #0x60
  0x29076fc: br       x8
  0x2907700: bl       #0x21afc18 ; -> ??? 0x21afc18
