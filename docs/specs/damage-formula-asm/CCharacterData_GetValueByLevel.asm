; ===== CCharacterData_GetValueByLevel @ 0x27e7eb0..0x27e8214 (taille 868 octets) =====
  0x27e7eb0: str      x30, [sp, #-0x40]!
  0x27e7eb4: stp      x24, x23, [sp, #0x10]
  0x27e7eb8: stp      x22, x21, [sp, #0x20]
  0x27e7ebc: stp      x20, x19, [sp, #0x30]
  0x27e7ec0: adrp     x23, #0x5958000
  0x27e7ec4: adrp     x24, #0x5511000
  0x27e7ec8: ldrb     w8, [x23, #0x3a7]
  0x27e7ecc: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e7ed0: mov      w21, w3
  0x27e7ed4: mov      w22, w2
  0x27e7ed8: mov      w19, w1
  0x27e7edc: mov      x20, x0
  0x27e7ee0: tbnz     w8, #0, #0x27e7f1c
  0x27e7ee4: adrp     x0, #0x5511000
  0x27e7ee8: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x27e7eec: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e7ef0: adrp     x0, #0x5511000
  0x27e7ef4: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e7ef8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e7efc: adrp     x0, #0x5536000
  0x27e7f00: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e7f04: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e7f08: adrp     x0, #0x5536000
  0x27e7f0c: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e7f10: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e7f14: mov      w8, #1
  0x27e7f18: strb     w8, [x23, #0x3a7]
  0x27e7f1c: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x27e7f20: ldr      w8, [x0, #0xe0]
  0x27e7f24: cbnz     w8, #0x27e7f2c
  0x27e7f28: bl       #0x218489c ; -> ??? 0x218489c
  0x27e7f2c: mov      x0, xzr
  0x27e7f30: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x27e7f34: ldr      x8, [x20, #0xf0]
  0x27e7f38: cbz      x8, #0x27e8210
  0x27e7f3c: cbz      x0, #0x27e8210
  0x27e7f40: ldr      w3, [x8, #0x10]
  0x27e7f44: ldrb     w2, [x20, #0x98]
  0x27e7f48: ldrb     w1, [x8, #0x54]
  0x27e7f4c: mov      x4, xzr
  0x27e7f50: bl       #0x25f3304 ; -> CTempletManager$$GetCharacterTranscendent
  0x27e7f54: cmp      w22, #1
  0x27e7f58: b.eq     #0x27e7f78
  0x27e7f5c: cmp      w22, #5
  0x27e7f60: b.eq     #0x27e7f84
  0x27e7f64: cmp      w22, #4
  0x27e7f68: b.ne     #0x27e7f90
  0x27e7f6c: cbz      x0, #0x27e7f98
  0x27e7f70: ldr      w22, [x0, #0x34]
  0x27e7f74: b        #0x27e7f9c
  0x27e7f78: cbz      x0, #0x27e8050
  0x27e7f7c: ldr      w22, [x0, #0x30]
  0x27e7f80: b        #0x27e8054
  0x27e7f84: cbz      x0, #0x27e8104
  0x27e7f88: ldr      w22, [x0, #0x38]
  0x27e7f8c: b        #0x27e8108
  0x27e7f90: mov      w19, wzr
  0x27e7f94: b        #0x27e81c8
  0x27e7f98: mov      w22, wzr
  0x27e7f9c: ldr      x8, [x20, #0xf0]
  0x27e7fa0: cbz      x8, #0x27e8210
  0x27e7fa4: ldrh     w0, [x8, #0x72]
  0x27e7fa8: ldrh     w1, [x8, #0x74]
  0x27e7fac: mov      w2, w19
  0x27e7fb0: mov      x3, xzr
  0x27e7fb4: bl       #0x2c59db0 ; -> CFormula$$CalcStat
  0x27e7fb8: adrp     x8, #0x5511000
  0x27e7fbc: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x27e7fc0: mov      w19, w0
  0x27e7fc4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x27e7fc8: ldr      w9, [x8, #0xe0]
  0x27e7fcc: cbnz     w9, #0x27e7fd8
  0x27e7fd0: mov      x0, x8
  0x27e7fd4: bl       #0x218489c ; -> ??? 0x218489c
  0x27e7fd8: mov      w0, w19
  0x27e7fdc: mov      w1, w22
  0x27e7fe0: mov      x2, xzr
  0x27e7fe4: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x27e7fe8: add      w19, w0, w19
  0x27e7fec: tbz      w21, #0, #0x27e81c8
  0x27e7ff0: ldr      x0, [x20, #0x40]
  0x27e7ff4: cbz      x0, #0x27e8210
  0x27e7ff8: adrp     x8, #0x5536000
  0x27e7ffc: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e8000: mov      w1, #4
  0x27e8004: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e8008: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e800c: cbz      x0, #0x27e8210
  0x27e8010: adrp     x10, #0x5536000
  0x27e8014: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e8018: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e801c: mov      x20, x0
  0x27e8020: ldrh     w9, [x8, #0x12e]
  0x27e8024: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e8028: cbz      x9, #0x27e81b8
  0x27e802c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e8030: add      x10, x10, #8
  0x27e8034: ldur     x11, [x10, #-8]
  0x27e8038: cmp      x11, x1
  0x27e803c: b.eq     #0x27e81e0
  0x27e8040: subs     x9, x9, #1
  0x27e8044: add      x10, x10, #0x10
  0x27e8048: b.ne     #0x27e8034
  0x27e804c: b        #0x27e81b8
  0x27e8050: mov      w22, wzr
  0x27e8054: ldr      x8, [x20, #0xf0]
  0x27e8058: cbz      x8, #0x27e8210
  0x27e805c: ldp      w0, w1, [x8, #0x64]
  0x27e8060: mov      w2, w19
  0x27e8064: mov      x3, xzr
  0x27e8068: bl       #0x2c59db0 ; -> CFormula$$CalcStat
  0x27e806c: adrp     x8, #0x5511000
  0x27e8070: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x27e8074: mov      w19, w0
  0x27e8078: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x27e807c: ldr      w9, [x8, #0xe0]
  0x27e8080: cbnz     w9, #0x27e808c
  0x27e8084: mov      x0, x8
  0x27e8088: bl       #0x218489c ; -> ??? 0x218489c
  0x27e808c: mov      w0, w19
  0x27e8090: mov      w1, w22
  0x27e8094: mov      x2, xzr
  0x27e8098: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x27e809c: add      w19, w0, w19
  0x27e80a0: tbz      w21, #0, #0x27e81c8
  0x27e80a4: ldr      x0, [x20, #0x40]
  0x27e80a8: cbz      x0, #0x27e8210
  0x27e80ac: adrp     x8, #0x5536000
  0x27e80b0: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e80b4: mov      w1, #1
  0x27e80b8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e80bc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e80c0: cbz      x0, #0x27e8210
  0x27e80c4: adrp     x10, #0x5536000
  0x27e80c8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e80cc: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e80d0: mov      x20, x0
  0x27e80d4: ldrh     w9, [x8, #0x12e]
  0x27e80d8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e80dc: cbz      x9, #0x27e81b8
  0x27e80e0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e80e4: add      x10, x10, #8
  0x27e80e8: ldur     x11, [x10, #-8]
  0x27e80ec: cmp      x11, x1
  0x27e80f0: b.eq     #0x27e81e0
  0x27e80f4: subs     x9, x9, #1
  0x27e80f8: add      x10, x10, #0x10
  0x27e80fc: b.ne     #0x27e80e8
  0x27e8100: b        #0x27e81b8
  0x27e8104: mov      w22, wzr
  0x27e8108: ldr      x8, [x20, #0xf0]
  0x27e810c: cbz      x8, #0x27e8210
  0x27e8110: ldrh     w0, [x8, #0x76]
  0x27e8114: ldrh     w1, [x8, #0x78]
  0x27e8118: mov      w2, w19
  0x27e811c: mov      x3, xzr
  0x27e8120: bl       #0x2c59db0 ; -> CFormula$$CalcStat
  0x27e8124: adrp     x8, #0x5511000
  0x27e8128: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x27e812c: mov      w19, w0
  0x27e8130: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x27e8134: ldr      w9, [x8, #0xe0]
  0x27e8138: cbnz     w9, #0x27e8144
  0x27e813c: mov      x0, x8
  0x27e8140: bl       #0x218489c ; -> ??? 0x218489c
  0x27e8144: mov      w0, w19
  0x27e8148: mov      w1, w22
  0x27e814c: mov      x2, xzr
  0x27e8150: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x27e8154: add      w19, w0, w19
  0x27e8158: tbz      w21, #0, #0x27e81c8
  0x27e815c: ldr      x0, [x20, #0x40]
  0x27e8160: cbz      x0, #0x27e8210
  0x27e8164: adrp     x8, #0x5536000
  0x27e8168: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e816c: mov      w1, #5
  0x27e8170: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e8174: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e8178: cbz      x0, #0x27e8210
  0x27e817c: adrp     x10, #0x5536000
  0x27e8180: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e8184: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e8188: mov      x20, x0
  0x27e818c: ldrh     w9, [x8, #0x12e]
  0x27e8190: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e8194: cbz      x9, #0x27e81b8
  0x27e8198: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e819c: add      x10, x10, #8
  0x27e81a0: ldur     x11, [x10, #-8]
  0x27e81a4: cmp      x11, x1
  0x27e81a8: b.eq     #0x27e81e0
  0x27e81ac: subs     x9, x9, #1
  0x27e81b0: add      x10, x10, #0x10
  0x27e81b4: b.ne     #0x27e81a0
  0x27e81b8: mov      w2, #4
  0x27e81bc: mov      x0, x20
  0x27e81c0: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e81c4: b        #0x27e81f0
  0x27e81c8: mov      w0, w19
  0x27e81cc: ldp      x20, x19, [sp, #0x30]
  0x27e81d0: ldp      x22, x21, [sp, #0x20]
  0x27e81d4: ldp      x24, x23, [sp, #0x10]
  0x27e81d8: ldr      x30, [sp], #0x40
  0x27e81dc: ret      
  0x27e81e0: ldr      w9, [x10]
  0x27e81e4: add      w9, w9, #4
  0x27e81e8: add      x8, x8, w9, sxtw #4
  0x27e81ec: add      x0, x8, #0x138
  0x27e81f0: ldp      x3, x2, [x0]
  0x27e81f4: mov      x0, x20
  0x27e81f8: mov      w1, w19
  0x27e81fc: ldp      x20, x19, [sp, #0x30]
  0x27e8200: ldp      x22, x21, [sp, #0x20]
  0x27e8204: ldp      x24, x23, [sp, #0x10]
  0x27e8208: ldr      x30, [sp], #0x40
  0x27e820c: br       x3
  0x27e8210: bl       #0x21849c0 ; -> ??? 0x21849c0
