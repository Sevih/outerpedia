; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetValueByLevel @ 0x2909dc0..0x290a124 (taille 868 octets) =====
  0x2909dc0: str      x30, [sp, #-0x40]!
  0x2909dc4: stp      x24, x23, [sp, #0x10]
  0x2909dc8: stp      x22, x21, [sp, #0x20]
  0x2909dcc: stp      x20, x19, [sp, #0x30]
  0x2909dd0: adrp     x23, #0x59d8000
  0x2909dd4: adrp     x24, #0x558a000
  0x2909dd8: ldrb     w8, [x23, #0x29b]
  0x2909ddc: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2909de0: mov      w21, w3
  0x2909de4: mov      w22, w2
  0x2909de8: mov      w19, w1
  0x2909dec: mov      x20, x0
  0x2909df0: tbnz     w8, #0, #0x2909e2c
  0x2909df4: adrp     x0, #0x558a000
  0x2909df8: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2909dfc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2909e00: adrp     x0, #0x558a000
  0x2909e04: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2909e08: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2909e0c: adrp     x0, #0x55b6000
  0x2909e10: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2909e14: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2909e18: adrp     x0, #0x55b6000
  0x2909e1c: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2909e20: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2909e24: mov      w8, #1
  0x2909e28: strb     w8, [x23, #0x29b]
  0x2909e2c: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2909e30: ldr      w8, [x0, #0xe0]
  0x2909e34: cbnz     w8, #0x2909e3c
  0x2909e38: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2909e3c: mov      x0, xzr
  0x2909e40: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2909e44: ldr      x8, [x20, #0xf0]
  0x2909e48: cbz      x8, #0x290a120
  0x2909e4c: cbz      x0, #0x290a120
  0x2909e50: ldr      w3, [x8, #0x10]
  0x2909e54: ldrb     w2, [x20, #0x98]
  0x2909e58: ldrb     w1, [x8, #0x54]
  0x2909e5c: mov      x4, xzr
  0x2909e60: bl       #0x262a28c ; -> CTempletManager$$GetCharacterTranscendent
  0x2909e64: cmp      w22, #1
  0x2909e68: b.eq     #0x2909e88
  0x2909e6c: cmp      w22, #5
  0x2909e70: b.eq     #0x2909e94
  0x2909e74: cmp      w22, #4
  0x2909e78: b.ne     #0x2909ea0
  0x2909e7c: cbz      x0, #0x2909ea8
  0x2909e80: ldr      w22, [x0, #0x34]
  0x2909e84: b        #0x2909eac
  0x2909e88: cbz      x0, #0x2909f60
  0x2909e8c: ldr      w22, [x0, #0x30]
  0x2909e90: b        #0x2909f64
  0x2909e94: cbz      x0, #0x290a014
  0x2909e98: ldr      w22, [x0, #0x38]
  0x2909e9c: b        #0x290a018
  0x2909ea0: mov      w19, wzr
  0x2909ea4: b        #0x290a0d8
  0x2909ea8: mov      w22, wzr
  0x2909eac: ldr      x8, [x20, #0xf0]
  0x2909eb0: cbz      x8, #0x290a120
  0x2909eb4: ldrh     w0, [x8, #0x72]
  0x2909eb8: ldrh     w1, [x8, #0x74]
  0x2909ebc: mov      w2, w19
  0x2909ec0: mov      x3, xzr
  0x2909ec4: bl       #0x2cb1bd4 ; -> CFormula$$CalcStat
  0x2909ec8: adrp     x8, #0x558a000
  0x2909ecc: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2909ed0: mov      w19, w0
  0x2909ed4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2909ed8: ldr      w9, [x8, #0xe0]
  0x2909edc: cbnz     w9, #0x2909ee8
  0x2909ee0: mov      x0, x8
  0x2909ee4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2909ee8: mov      w0, w19
  0x2909eec: mov      w1, w22
  0x2909ef0: mov      x2, xzr
  0x2909ef4: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2909ef8: add      w19, w0, w19
  0x2909efc: tbz      w21, #0, #0x290a0d8
  0x2909f00: ldr      x0, [x20, #0x40]
  0x2909f04: cbz      x0, #0x290a120
  0x2909f08: adrp     x8, #0x55b6000
  0x2909f0c: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2909f10: mov      w1, #4
  0x2909f14: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2909f18: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909f1c: cbz      x0, #0x290a120
  0x2909f20: adrp     x10, #0x55b6000
  0x2909f24: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2909f28: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2909f2c: mov      x20, x0
  0x2909f30: ldrh     w9, [x8, #0x12e]
  0x2909f34: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2909f38: cbz      x9, #0x290a0c8
  0x2909f3c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2909f40: add      x10, x10, #8
  0x2909f44: ldur     x11, [x10, #-8]
  0x2909f48: cmp      x11, x1
  0x2909f4c: b.eq     #0x290a0f0
  0x2909f50: subs     x9, x9, #1
  0x2909f54: add      x10, x10, #0x10
  0x2909f58: b.ne     #0x2909f44
  0x2909f5c: b        #0x290a0c8
  0x2909f60: mov      w22, wzr
  0x2909f64: ldr      x8, [x20, #0xf0]
  0x2909f68: cbz      x8, #0x290a120
  0x2909f6c: ldp      w0, w1, [x8, #0x64]
  0x2909f70: mov      w2, w19
  0x2909f74: mov      x3, xzr
  0x2909f78: bl       #0x2cb1bd4 ; -> CFormula$$CalcStat
  0x2909f7c: adrp     x8, #0x558a000
  0x2909f80: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2909f84: mov      w19, w0
  0x2909f88: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2909f8c: ldr      w9, [x8, #0xe0]
  0x2909f90: cbnz     w9, #0x2909f9c
  0x2909f94: mov      x0, x8
  0x2909f98: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2909f9c: mov      w0, w19
  0x2909fa0: mov      w1, w22
  0x2909fa4: mov      x2, xzr
  0x2909fa8: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2909fac: add      w19, w0, w19
  0x2909fb0: tbz      w21, #0, #0x290a0d8
  0x2909fb4: ldr      x0, [x20, #0x40]
  0x2909fb8: cbz      x0, #0x290a120
  0x2909fbc: adrp     x8, #0x55b6000
  0x2909fc0: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2909fc4: mov      w1, #1
  0x2909fc8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2909fcc: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909fd0: cbz      x0, #0x290a120
  0x2909fd4: adrp     x10, #0x55b6000
  0x2909fd8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2909fdc: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2909fe0: mov      x20, x0
  0x2909fe4: ldrh     w9, [x8, #0x12e]
  0x2909fe8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2909fec: cbz      x9, #0x290a0c8
  0x2909ff0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2909ff4: add      x10, x10, #8
  0x2909ff8: ldur     x11, [x10, #-8]
  0x2909ffc: cmp      x11, x1
  0x290a000: b.eq     #0x290a0f0
  0x290a004: subs     x9, x9, #1
  0x290a008: add      x10, x10, #0x10
  0x290a00c: b.ne     #0x2909ff8
  0x290a010: b        #0x290a0c8
  0x290a014: mov      w22, wzr
  0x290a018: ldr      x8, [x20, #0xf0]
  0x290a01c: cbz      x8, #0x290a120
  0x290a020: ldrh     w0, [x8, #0x76]
  0x290a024: ldrh     w1, [x8, #0x78]
  0x290a028: mov      w2, w19
  0x290a02c: mov      x3, xzr
  0x290a030: bl       #0x2cb1bd4 ; -> CFormula$$CalcStat
  0x290a034: adrp     x8, #0x558a000
  0x290a038: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x290a03c: mov      w19, w0
  0x290a040: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x290a044: ldr      w9, [x8, #0xe0]
  0x290a048: cbnz     w9, #0x290a054
  0x290a04c: mov      x0, x8
  0x290a050: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x290a054: mov      w0, w19
  0x290a058: mov      w1, w22
  0x290a05c: mov      x2, xzr
  0x290a060: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x290a064: add      w19, w0, w19
  0x290a068: tbz      w21, #0, #0x290a0d8
  0x290a06c: ldr      x0, [x20, #0x40]
  0x290a070: cbz      x0, #0x290a120
  0x290a074: adrp     x8, #0x55b6000
  0x290a078: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x290a07c: mov      w1, #5
  0x290a080: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x290a084: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290a088: cbz      x0, #0x290a120
  0x290a08c: adrp     x10, #0x55b6000
  0x290a090: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x290a094: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290a098: mov      x20, x0
  0x290a09c: ldrh     w9, [x8, #0x12e]
  0x290a0a0: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x290a0a4: cbz      x9, #0x290a0c8
  0x290a0a8: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x290a0ac: add      x10, x10, #8
  0x290a0b0: ldur     x11, [x10, #-8]
  0x290a0b4: cmp      x11, x1
  0x290a0b8: b.eq     #0x290a0f0
  0x290a0bc: subs     x9, x9, #1
  0x290a0c0: add      x10, x10, #0x10
  0x290a0c4: b.ne     #0x290a0b0
  0x290a0c8: mov      w2, #4
  0x290a0cc: mov      x0, x20
  0x290a0d0: bl       #0x2210028 ; -> ??? 0x2210028
  0x290a0d4: b        #0x290a100
  0x290a0d8: mov      w0, w19
  0x290a0dc: ldp      x20, x19, [sp, #0x30]
  0x290a0e0: ldp      x22, x21, [sp, #0x20]
  0x290a0e4: ldp      x24, x23, [sp, #0x10]
  0x290a0e8: ldr      x30, [sp], #0x40
  0x290a0ec: ret      
  0x290a0f0: ldr      w9, [x10]
  0x290a0f4: add      w9, w9, #4
  0x290a0f8: add      x8, x8, w9, sxtw #4
  0x290a0fc: add      x0, x8, #0x138
  0x290a100: ldp      x3, x2, [x0]
  0x290a104: mov      x0, x20
  0x290a108: mov      w1, w19
  0x290a10c: ldp      x20, x19, [sp, #0x30]
  0x290a110: ldp      x22, x21, [sp, #0x20]
  0x290a114: ldp      x24, x23, [sp, #0x10]
  0x290a118: ldr      x30, [sp], #0x40
  0x290a11c: br       x3
  0x290a120: bl       #0x21afc18 ; -> ??? 0x21afc18
