; ===== CStatValue_SetFinalValue @ 0x28d2eac..0x28d33b4 (taille 1288 octets) =====
  0x28d2eac: sub      sp, sp, #0xa0
  0x28d2eb0: stp      x29, x30, [sp, #0x40]
  0x28d2eb4: stp      x28, x27, [sp, #0x50]
  0x28d2eb8: stp      x26, x25, [sp, #0x60]
  0x28d2ebc: stp      x24, x23, [sp, #0x70]
  0x28d2ec0: stp      x22, x21, [sp, #0x80]
  0x28d2ec4: stp      x20, x19, [sp, #0x90]
  0x28d2ec8: adrp     x20, #0x5958000
  0x28d2ecc: ldrb     w8, [x20, #0xbc2]
  0x28d2ed0: mov      x19, x0
  0x28d2ed4: tbnz     w8, #0, #0x28d2ef8
  0x28d2ed8: adrp     x0, #0x5511000
  0x28d2edc: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x28d2ee0: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d2ee4: adrp     x0, #0x5511000
  0x28d2ee8: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d2eec: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d2ef0: mov      w8, #1
  0x28d2ef4: strb     w8, [x20, #0xbc2]
  0x28d2ef8: ldr      w8, [x19, #0x10]
  0x28d2efc: adrp     x20, #0x5511000
  0x28d2f00: ldr      x20, [x20, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d2f04: cmp      w8, #7
  0x28d2f08: b.ne     #0x28d30f4
  0x28d2f0c: ldr      x0, [x19, #0xe8]
  0x28d2f10: cbz      x0, #0x28d33b0
  0x28d2f14: mov      w1, #1
  0x28d2f18: mov      x2, xzr
  0x28d2f1c: bl       #0x27eb080 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x28d2f20: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d2f24: ldur     x21, [x19, #0x14]
  0x28d2f28: ldr      w22, [x19, #0x1c]
  0x28d2f2c: mov      x20, x0
  0x28d2f30: ldr      w9, [x8, #0xe0]
  0x28d2f34: lsr      x10, x0, #0x20
  0x28d2f38: str      x10, [sp, #0x38]
  0x28d2f3c: cbnz     w9, #0x28d2f48
  0x28d2f40: mov      x0, x8
  0x28d2f44: bl       #0x218489c ; -> ??? 0x218489c
  0x28d2f48: mov      x0, x21
  0x28d2f4c: mov      x1, x22
  0x28d2f50: mov      x2, xzr
  0x28d2f54: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2f58: ldr      x8, [x19, #0x20]
  0x28d2f5c: ldr      w1, [x19, #0x28]
  0x28d2f60: str      w0, [sp, #0x34]
  0x28d2f64: mov      x2, xzr
  0x28d2f68: mov      x0, x8
  0x28d2f6c: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2f70: ldur     x8, [x19, #0x2c]
  0x28d2f74: ldr      w1, [x19, #0x34]
  0x28d2f78: mov      w22, w0
  0x28d2f7c: mov      x2, xzr
  0x28d2f80: mov      x0, x8
  0x28d2f84: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2f88: mov      w23, w0
  0x28d2f8c: mov      x0, x19
  0x28d2f90: bl       #0x28d124c ; -> CStatValue$$get_m_nAwakeningValue
  0x28d2f94: ldur     x8, [x19, #0x8c]
  0x28d2f98: ldr      w1, [x19, #0x94]
  0x28d2f9c: mov      w24, w0
  0x28d2fa0: mov      x2, xzr
  0x28d2fa4: mov      x0, x8
  0x28d2fa8: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2fac: mov      w25, w0
  0x28d2fb0: mov      x0, x19
  0x28d2fb4: bl       #0x28d1320 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x28d2fb8: ldr      x8, [x19, #0x98]
  0x28d2fbc: ldr      w1, [x19, #0xa0]
  0x28d2fc0: mov      w26, w0
  0x28d2fc4: mov      x2, xzr
  0x28d2fc8: mov      x0, x8
  0x28d2fcc: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2fd0: ldr      x8, [x19, #0x38]
  0x28d2fd4: ldr      w1, [x19, #0x40]
  0x28d2fd8: mov      w27, w0
  0x28d2fdc: mov      x2, xzr
  0x28d2fe0: mov      x0, x8
  0x28d2fe4: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d2fe8: ldur     x8, [x19, #0x44]
  0x28d2fec: ldr      w1, [x19, #0x4c]
  0x28d2ff0: mov      w28, w0
  0x28d2ff4: mov      x2, xzr
  0x28d2ff8: mov      x0, x8
  0x28d2ffc: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3000: mov      w29, w0
  0x28d3004: mov      x0, x19
  0x28d3008: bl       #0x28d10a4 ; -> CStatValue$$get_m_nItemOptionValue
  0x28d300c: ldr      x8, [x19, #0x50]
  0x28d3010: ldr      w1, [x19, #0x58]
  0x28d3014: mov      w21, w0
  0x28d3018: mov      x2, xzr
  0x28d301c: mov      x0, x8
  0x28d3020: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3024: ldr      x8, [sp, #0x38]
  0x28d3028: str      w0, [sp, #0x10]
  0x28d302c: ldr      w0, [sp, #0x34]
  0x28d3030: mov      w1, w22
  0x28d3034: mov      w2, w23
  0x28d3038: mov      w3, w24
  0x28d303c: mov      w4, w25
  0x28d3040: mov      w5, w26
  0x28d3044: mov      w6, w27
  0x28d3048: mov      w7, w28
  0x28d304c: str      xzr, [sp, #0x28]
  0x28d3050: str      w8, [sp, #0x20]
  0x28d3054: str      w20, [sp, #0x18]
  0x28d3058: str      w21, [sp, #8]
  0x28d305c: str      w29, [sp]
  0x28d3060: bl       #0x2c59e48 ; -> CFormula$$CalcFinalStat
  0x28d3064: mov      w8, w0
  0x28d3068: ldr      x0, [x19, #0xe8]
  0x28d306c: cmp      w8, #0x3e8
  0x28d3070: mov      w9, #0x3e8
  0x28d3074: csel     w8, w8, w9, lt
  0x28d3078: cbz      x0, #0x28d33b0
  0x28d307c: mov      w1, wzr
  0x28d3080: mov      x2, xzr
  0x28d3084: bic      w21, w8, w8, asr #31
  0x28d3088: bl       #0x27eb080 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x28d308c: adrp     x8, #0x5511000
  0x28d3090: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x28d3094: adrp     x22, #0x5511000
  0x28d3098: mov      x20, x0
  0x28d309c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x28d30a0: ldr      w9, [x8, #0xe0]
  0x28d30a4: ldr      x22, [x22, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d30a8: cbnz     w9, #0x28d30b4
  0x28d30ac: mov      x0, x8
  0x28d30b0: bl       #0x218489c ; -> ??? 0x218489c
  0x28d30b4: mov      x9, #0x3e800000000
  0x28d30b8: mov      x10, #0xf7cf
  0x28d30bc: add      w8, w21, w20
  0x28d30c0: movk     x10, #0xe353, lsl #16
  0x28d30c4: add      x9, x20, x9
  0x28d30c8: movk     x10, #0x9ba5, lsl #32
  0x28d30cc: sxtw     x8, w8
  0x28d30d0: asr      x9, x9, #0x20
  0x28d30d4: movk     x10, #0x20c4, lsl #48
  0x28d30d8: mul      x8, x9, x8
  0x28d30dc: smulh    x8, x8, x10
  0x28d30e0: lsr      x9, x8, #0x3f
  0x28d30e4: lsr      x8, x8, #7
  0x28d30e8: add      w8, w8, w9
  0x28d30ec: bic      w1, w8, w8, asr #31
  0x28d30f0: b        #0x28d3250
  0x28d30f4: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d30f8: ldur     x20, [x19, #0x14]
  0x28d30fc: ldr      w21, [x19, #0x1c]
  0x28d3100: ldr      w8, [x0, #0xe0]
  0x28d3104: cbnz     w8, #0x28d310c
  0x28d3108: bl       #0x218489c ; -> ??? 0x218489c
  0x28d310c: mov      x0, x20
  0x28d3110: mov      x1, x21
  0x28d3114: mov      x2, xzr
  0x28d3118: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d311c: ldr      x8, [x19, #0x20]
  0x28d3120: ldr      w1, [x19, #0x28]
  0x28d3124: str      w0, [sp, #0x38]
  0x28d3128: mov      x2, xzr
  0x28d312c: mov      x0, x8
  0x28d3130: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3134: ldur     x8, [x19, #0x2c]
  0x28d3138: ldr      w1, [x19, #0x34]
  0x28d313c: str      w0, [sp, #0x34]
  0x28d3140: mov      x2, xzr
  0x28d3144: mov      x0, x8
  0x28d3148: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d314c: mov      w22, w0
  0x28d3150: mov      x0, x19
  0x28d3154: bl       #0x28d124c ; -> CStatValue$$get_m_nAwakeningValue
  0x28d3158: ldur     x8, [x19, #0x8c]
  0x28d315c: ldr      w1, [x19, #0x94]
  0x28d3160: mov      w23, w0
  0x28d3164: mov      x2, xzr
  0x28d3168: mov      x0, x8
  0x28d316c: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3170: mov      w24, w0
  0x28d3174: mov      x0, x19
  0x28d3178: bl       #0x28d1320 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x28d317c: ldr      x8, [x19, #0x98]
  0x28d3180: ldr      w1, [x19, #0xa0]
  0x28d3184: mov      w25, w0
  0x28d3188: mov      x2, xzr
  0x28d318c: mov      x0, x8
  0x28d3190: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3194: ldr      x8, [x19, #0x38]
  0x28d3198: ldr      w1, [x19, #0x40]
  0x28d319c: mov      w26, w0
  0x28d31a0: mov      x2, xzr
  0x28d31a4: mov      x0, x8
  0x28d31a8: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d31ac: ldur     x8, [x19, #0x44]
  0x28d31b0: ldr      w1, [x19, #0x4c]
  0x28d31b4: mov      w27, w0
  0x28d31b8: mov      x2, xzr
  0x28d31bc: mov      x0, x8
  0x28d31c0: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d31c4: mov      w28, w0
  0x28d31c8: mov      x0, x19
  0x28d31cc: bl       #0x28d10a4 ; -> CStatValue$$get_m_nItemOptionValue
  0x28d31d0: ldr      x8, [x19, #0x50]
  0x28d31d4: ldr      w1, [x19, #0x58]
  0x28d31d8: mov      w29, w0
  0x28d31dc: mov      x2, xzr
  0x28d31e0: mov      x0, x8
  0x28d31e4: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d31e8: mov      w20, w0
  0x28d31ec: mov      x0, x19
  0x28d31f0: bl       #0x28d1178 ; -> CStatValue$$get_m_nBuffValue
  0x28d31f4: ldur     x8, [x19, #0x5c]
  0x28d31f8: ldr      w1, [x19, #0x64]
  0x28d31fc: mov      w21, w0
  0x28d3200: mov      x2, xzr
  0x28d3204: mov      x0, x8
  0x28d3208: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d320c: str      w0, [sp, #0x20]
  0x28d3210: ldp      w1, w0, [sp, #0x34]
  0x28d3214: mov      w2, w22
  0x28d3218: mov      w3, w23
  0x28d321c: mov      w4, w24
  0x28d3220: mov      w5, w25
  0x28d3224: mov      w6, w26
  0x28d3228: mov      w7, w27
  0x28d322c: str      xzr, [sp, #0x28]
  0x28d3230: str      w21, [sp, #0x18]
  0x28d3234: str      w20, [sp, #0x10]
  0x28d3238: str      w29, [sp, #8]
  0x28d323c: str      w28, [sp]
  0x28d3240: bl       #0x2c59e48 ; -> CFormula$$CalcFinalStat
  0x28d3244: adrp     x22, #0x5511000
  0x28d3248: ldr      x22, [x22, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d324c: mov      w1, w0
  0x28d3250: mov      x0, x19
  0x28d3254: bl       #0x28d1384 ; -> CStatValue$$set_m_nFinalValue
  0x28d3258: mov      x0, x19
  0x28d325c: bl       #0x28d13f4 ; -> CStatValue$$get_m_nFinalValue
  0x28d3260: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x28d3264: ldur     x22, [x19, #0x14]
  0x28d3268: ldr      w21, [x19, #0x1c]
  0x28d326c: mov      w20, w0
  0x28d3270: ldr      w9, [x8, #0xe0]
  0x28d3274: cbnz     w9, #0x28d3280
  0x28d3278: mov      x0, x8
  0x28d327c: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3280: mov      x0, x22
  0x28d3284: mov      x1, x21
  0x28d3288: mov      x2, xzr
  0x28d328c: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3290: ldr      x8, [x19, #0x20]
  0x28d3294: ldr      w1, [x19, #0x28]
  0x28d3298: mov      w21, w0
  0x28d329c: mov      x2, xzr
  0x28d32a0: mov      x0, x8
  0x28d32a4: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d32a8: ldur     x8, [x19, #0x2c]
  0x28d32ac: ldr      w1, [x19, #0x34]
  0x28d32b0: mov      w22, w0
  0x28d32b4: mov      x2, xzr
  0x28d32b8: mov      x0, x8
  0x28d32bc: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d32c0: mov      w23, w0
  0x28d32c4: mov      x0, x19
  0x28d32c8: bl       #0x28d124c ; -> CStatValue$$get_m_nAwakeningValue
  0x28d32cc: ldur     x8, [x19, #0x8c]
  0x28d32d0: ldr      w1, [x19, #0x94]
  0x28d32d4: mov      w24, w0
  0x28d32d8: mov      x2, xzr
  0x28d32dc: mov      x0, x8
  0x28d32e0: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d32e4: mov      w4, w0
  0x28d32e8: mov      w0, w21
  0x28d32ec: mov      w1, w22
  0x28d32f0: mov      w2, w23
  0x28d32f4: mov      w3, w24
  0x28d32f8: mov      w5, wzr
  0x28d32fc: mov      w6, wzr
  0x28d3300: mov      w7, wzr
  0x28d3304: str      xzr, [sp, #0x28]
  0x28d3308: str      wzr, [sp, #0x20]
  0x28d330c: str      wzr, [sp, #0x18]
  0x28d3310: str      wzr, [sp, #0x10]
  0x28d3314: str      wzr, [sp, #8]
  0x28d3318: str      wzr, [sp]
  0x28d331c: bl       #0x2c59e48 ; -> CFormula$$CalcFinalStat
  0x28d3320: sub      w0, w20, w0
  0x28d3324: mov      x1, xzr
  0x28d3328: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d332c: str      x0, [x19, #0x68]
  0x28d3330: mov      x0, x19
  0x28d3334: str      w1, [x19, #0x70]
  0x28d3338: bl       #0x28d13f4 ; -> CStatValue$$get_m_nFinalValue
  0x28d333c: ldr      x8, [x19, #0x80]
  0x28d3340: ldr      w1, [x19, #0x88]
  0x28d3344: mov      w20, w0
  0x28d3348: mov      x2, xzr
  0x28d334c: mov      x0, x8
  0x28d3350: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3354: add      w1, w0, w20
  0x28d3358: mov      x0, x19
  0x28d335c: bl       #0x28d1384 ; -> CStatValue$$set_m_nFinalValue
  0x28d3360: ldr      w8, [x19, #0x10]
  0x28d3364: cmp      w8, #7
  0x28d3368: b.ne     #0x28d338c
  0x28d336c: mov      x0, x19
  0x28d3370: bl       #0x28d13f4 ; -> CStatValue$$get_m_nFinalValue
  0x28d3374: cmp      w0, #0x3e8
  0x28d3378: mov      w8, #0x3e8
  0x28d337c: csel     w8, w0, w8, lt
  0x28d3380: bic      w1, w8, w8, asr #31
  0x28d3384: mov      x0, x19
  0x28d3388: bl       #0x28d1384 ; -> CStatValue$$set_m_nFinalValue
  0x28d338c: strb     wzr, [x19, #0xe0]
  0x28d3390: ldp      x20, x19, [sp, #0x90]
  0x28d3394: ldp      x22, x21, [sp, #0x80]
  0x28d3398: ldp      x24, x23, [sp, #0x70]
  0x28d339c: ldp      x26, x25, [sp, #0x60]
  0x28d33a0: ldp      x28, x27, [sp, #0x50]
  0x28d33a4: ldp      x29, x30, [sp, #0x40]
  0x28d33a8: add      sp, sp, #0xa0
  0x28d33ac: ret      
  0x28d33b0: bl       #0x21849c0 ; -> ??? 0x21849c0
