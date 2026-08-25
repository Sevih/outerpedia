; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetFinalValue @ 0x2a05fd8..0x2a064e0 (taille 1288 octets) =====
  0x2a05fd8: sub      sp, sp, #0xa0
  0x2a05fdc: stp      x29, x30, [sp, #0x40]
  0x2a05fe0: stp      x28, x27, [sp, #0x50]
  0x2a05fe4: stp      x26, x25, [sp, #0x60]
  0x2a05fe8: stp      x24, x23, [sp, #0x70]
  0x2a05fec: stp      x22, x21, [sp, #0x80]
  0x2a05ff0: stp      x20, x19, [sp, #0x90]
  0x2a05ff4: adrp     x20, #0x59e8000
  0x2a05ff8: ldrb     w8, [x20, #0x5e3]
  0x2a05ffc: mov      x19, x0
  0x2a06000: tbnz     w8, #0, #0x2a06024
  0x2a06004: adrp     x0, #0x5599000
  0x2a06008: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2a0600c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06010: adrp     x0, #0x5599000
  0x2a06014: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06018: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a0601c: mov      w8, #1
  0x2a06020: strb     w8, [x20, #0x5e3]
  0x2a06024: ldr      w8, [x19, #0x10]
  0x2a06028: adrp     x20, #0x5599000
  0x2a0602c: ldr      x20, [x20, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06030: cmp      w8, #7
  0x2a06034: b.ne     #0x2a06220
  0x2a06038: ldr      x0, [x19, #0xe8]
  0x2a0603c: cbz      x0, #0x2a064dc
  0x2a06040: mov      w1, #1
  0x2a06044: mov      x2, xzr
  0x2a06048: bl       #0x29144d8 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x2a0604c: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a06050: ldur     x21, [x19, #0x14]
  0x2a06054: ldr      w22, [x19, #0x1c]
  0x2a06058: mov      x20, x0
  0x2a0605c: ldr      w9, [x8, #0xe0]
  0x2a06060: lsr      x10, x0, #0x20
  0x2a06064: str      x10, [sp, #0x38]
  0x2a06068: cbnz     w9, #0x2a06074
  0x2a0606c: mov      x0, x8
  0x2a06070: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06074: mov      x0, x21
  0x2a06078: mov      x1, x22
  0x2a0607c: mov      x2, xzr
  0x2a06080: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06084: ldr      x8, [x19, #0x20]
  0x2a06088: ldr      w1, [x19, #0x28]
  0x2a0608c: str      w0, [sp, #0x34]
  0x2a06090: mov      x2, xzr
  0x2a06094: mov      x0, x8
  0x2a06098: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a0609c: ldur     x8, [x19, #0x2c]
  0x2a060a0: ldr      w1, [x19, #0x34]
  0x2a060a4: mov      w22, w0
  0x2a060a8: mov      x2, xzr
  0x2a060ac: mov      x0, x8
  0x2a060b0: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a060b4: mov      w23, w0
  0x2a060b8: mov      x0, x19
  0x2a060bc: bl       #0x2a041c4 ; -> CStatValue$$get_m_nAwakeningValue
  0x2a060c0: ldur     x8, [x19, #0x8c]
  0x2a060c4: ldr      w1, [x19, #0x94]
  0x2a060c8: mov      w24, w0
  0x2a060cc: mov      x2, xzr
  0x2a060d0: mov      x0, x8
  0x2a060d4: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a060d8: mov      w25, w0
  0x2a060dc: mov      x0, x19
  0x2a060e0: bl       #0x2a04298 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x2a060e4: ldr      x8, [x19, #0x98]
  0x2a060e8: ldr      w1, [x19, #0xa0]
  0x2a060ec: mov      w26, w0
  0x2a060f0: mov      x2, xzr
  0x2a060f4: mov      x0, x8
  0x2a060f8: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a060fc: ldr      x8, [x19, #0x38]
  0x2a06100: ldr      w1, [x19, #0x40]
  0x2a06104: mov      w27, w0
  0x2a06108: mov      x2, xzr
  0x2a0610c: mov      x0, x8
  0x2a06110: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06114: ldur     x8, [x19, #0x44]
  0x2a06118: ldr      w1, [x19, #0x4c]
  0x2a0611c: mov      w28, w0
  0x2a06120: mov      x2, xzr
  0x2a06124: mov      x0, x8
  0x2a06128: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a0612c: mov      w29, w0
  0x2a06130: mov      x0, x19
  0x2a06134: bl       #0x2a0401c ; -> CStatValue$$get_m_nItemOptionValue
  0x2a06138: ldr      x8, [x19, #0x50]
  0x2a0613c: ldr      w1, [x19, #0x58]
  0x2a06140: mov      w21, w0
  0x2a06144: mov      x2, xzr
  0x2a06148: mov      x0, x8
  0x2a0614c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06150: ldr      x8, [sp, #0x38]
  0x2a06154: str      w0, [sp, #0x10]
  0x2a06158: ldr      w0, [sp, #0x34]
  0x2a0615c: mov      w1, w22
  0x2a06160: mov      w2, w23
  0x2a06164: mov      w3, w24
  0x2a06168: mov      w4, w25
  0x2a0616c: mov      w5, w26
  0x2a06170: mov      w6, w27
  0x2a06174: mov      w7, w28
  0x2a06178: str      xzr, [sp, #0x28]
  0x2a0617c: str      w8, [sp, #0x20]
  0x2a06180: str      w20, [sp, #0x18]
  0x2a06184: str      w21, [sp, #8]
  0x2a06188: str      w29, [sp]
  0x2a0618c: bl       #0x2cc06a0 ; -> CFormula$$CalcFinalStat
  0x2a06190: mov      w8, w0
  0x2a06194: ldr      x0, [x19, #0xe8]
  0x2a06198: cmp      w8, #0x3e8
  0x2a0619c: mov      w9, #0x3e8
  0x2a061a0: csel     w8, w8, w9, lt
  0x2a061a4: cbz      x0, #0x2a064dc
  0x2a061a8: mov      w1, wzr
  0x2a061ac: mov      x2, xzr
  0x2a061b0: bic      w21, w8, w8, asr #31
  0x2a061b4: bl       #0x29144d8 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x2a061b8: adrp     x8, #0x5599000
  0x2a061bc: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2a061c0: adrp     x22, #0x5599000
  0x2a061c4: mov      x20, x0
  0x2a061c8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2a061cc: ldr      w9, [x8, #0xe0]
  0x2a061d0: ldr      x22, [x22, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a061d4: cbnz     w9, #0x2a061e0
  0x2a061d8: mov      x0, x8
  0x2a061dc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a061e0: mov      x9, #0x3e800000000
  0x2a061e4: mov      x10, #0xf7cf
  0x2a061e8: add      w8, w21, w20
  0x2a061ec: movk     x10, #0xe353, lsl #16
  0x2a061f0: add      x9, x20, x9
  0x2a061f4: movk     x10, #0x9ba5, lsl #32
  0x2a061f8: sxtw     x8, w8
  0x2a061fc: asr      x9, x9, #0x20
  0x2a06200: movk     x10, #0x20c4, lsl #48
  0x2a06204: mul      x8, x9, x8
  0x2a06208: smulh    x8, x8, x10
  0x2a0620c: lsr      x9, x8, #0x3f
  0x2a06210: lsr      x8, x8, #7
  0x2a06214: add      w8, w8, w9
  0x2a06218: bic      w1, w8, w8, asr #31
  0x2a0621c: b        #0x2a0637c
  0x2a06220: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a06224: ldur     x20, [x19, #0x14]
  0x2a06228: ldr      w21, [x19, #0x1c]
  0x2a0622c: ldr      w8, [x0, #0xe0]
  0x2a06230: cbnz     w8, #0x2a06238
  0x2a06234: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06238: mov      x0, x20
  0x2a0623c: mov      x1, x21
  0x2a06240: mov      x2, xzr
  0x2a06244: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06248: ldr      x8, [x19, #0x20]
  0x2a0624c: ldr      w1, [x19, #0x28]
  0x2a06250: str      w0, [sp, #0x38]
  0x2a06254: mov      x2, xzr
  0x2a06258: mov      x0, x8
  0x2a0625c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06260: ldur     x8, [x19, #0x2c]
  0x2a06264: ldr      w1, [x19, #0x34]
  0x2a06268: str      w0, [sp, #0x34]
  0x2a0626c: mov      x2, xzr
  0x2a06270: mov      x0, x8
  0x2a06274: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06278: mov      w22, w0
  0x2a0627c: mov      x0, x19
  0x2a06280: bl       #0x2a041c4 ; -> CStatValue$$get_m_nAwakeningValue
  0x2a06284: ldur     x8, [x19, #0x8c]
  0x2a06288: ldr      w1, [x19, #0x94]
  0x2a0628c: mov      w23, w0
  0x2a06290: mov      x2, xzr
  0x2a06294: mov      x0, x8
  0x2a06298: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a0629c: mov      w24, w0
  0x2a062a0: mov      x0, x19
  0x2a062a4: bl       #0x2a04298 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x2a062a8: ldr      x8, [x19, #0x98]
  0x2a062ac: ldr      w1, [x19, #0xa0]
  0x2a062b0: mov      w25, w0
  0x2a062b4: mov      x2, xzr
  0x2a062b8: mov      x0, x8
  0x2a062bc: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a062c0: ldr      x8, [x19, #0x38]
  0x2a062c4: ldr      w1, [x19, #0x40]
  0x2a062c8: mov      w26, w0
  0x2a062cc: mov      x2, xzr
  0x2a062d0: mov      x0, x8
  0x2a062d4: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a062d8: ldur     x8, [x19, #0x44]
  0x2a062dc: ldr      w1, [x19, #0x4c]
  0x2a062e0: mov      w27, w0
  0x2a062e4: mov      x2, xzr
  0x2a062e8: mov      x0, x8
  0x2a062ec: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a062f0: mov      w28, w0
  0x2a062f4: mov      x0, x19
  0x2a062f8: bl       #0x2a0401c ; -> CStatValue$$get_m_nItemOptionValue
  0x2a062fc: ldr      x8, [x19, #0x50]
  0x2a06300: ldr      w1, [x19, #0x58]
  0x2a06304: mov      w29, w0
  0x2a06308: mov      x2, xzr
  0x2a0630c: mov      x0, x8
  0x2a06310: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06314: mov      w20, w0
  0x2a06318: mov      x0, x19
  0x2a0631c: bl       #0x2a040f0 ; -> CStatValue$$get_m_nBuffValue
  0x2a06320: ldur     x8, [x19, #0x5c]
  0x2a06324: ldr      w1, [x19, #0x64]
  0x2a06328: mov      w21, w0
  0x2a0632c: mov      x2, xzr
  0x2a06330: mov      x0, x8
  0x2a06334: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06338: str      w0, [sp, #0x20]
  0x2a0633c: ldp      w1, w0, [sp, #0x34]
  0x2a06340: mov      w2, w22
  0x2a06344: mov      w3, w23
  0x2a06348: mov      w4, w24
  0x2a0634c: mov      w5, w25
  0x2a06350: mov      w6, w26
  0x2a06354: mov      w7, w27
  0x2a06358: str      xzr, [sp, #0x28]
  0x2a0635c: str      w21, [sp, #0x18]
  0x2a06360: str      w20, [sp, #0x10]
  0x2a06364: str      w29, [sp, #8]
  0x2a06368: str      w28, [sp]
  0x2a0636c: bl       #0x2cc06a0 ; -> CFormula$$CalcFinalStat
  0x2a06370: adrp     x22, #0x5599000
  0x2a06374: ldr      x22, [x22, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06378: mov      w1, w0
  0x2a0637c: mov      x0, x19
  0x2a06380: bl       #0x2a042fc ; -> CStatValue$$set_m_nFinalValue
  0x2a06384: mov      x0, x19
  0x2a06388: bl       #0x2a0436c ; -> CStatValue$$get_m_nFinalValue
  0x2a0638c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2a06390: ldur     x22, [x19, #0x14]
  0x2a06394: ldr      w21, [x19, #0x1c]
  0x2a06398: mov      w20, w0
  0x2a0639c: ldr      w9, [x8, #0xe0]
  0x2a063a0: cbnz     w9, #0x2a063ac
  0x2a063a4: mov      x0, x8
  0x2a063a8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a063ac: mov      x0, x22
  0x2a063b0: mov      x1, x21
  0x2a063b4: mov      x2, xzr
  0x2a063b8: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a063bc: ldr      x8, [x19, #0x20]
  0x2a063c0: ldr      w1, [x19, #0x28]
  0x2a063c4: mov      w21, w0
  0x2a063c8: mov      x2, xzr
  0x2a063cc: mov      x0, x8
  0x2a063d0: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a063d4: ldur     x8, [x19, #0x2c]
  0x2a063d8: ldr      w1, [x19, #0x34]
  0x2a063dc: mov      w22, w0
  0x2a063e0: mov      x2, xzr
  0x2a063e4: mov      x0, x8
  0x2a063e8: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a063ec: mov      w23, w0
  0x2a063f0: mov      x0, x19
  0x2a063f4: bl       #0x2a041c4 ; -> CStatValue$$get_m_nAwakeningValue
  0x2a063f8: ldur     x8, [x19, #0x8c]
  0x2a063fc: ldr      w1, [x19, #0x94]
  0x2a06400: mov      w24, w0
  0x2a06404: mov      x2, xzr
  0x2a06408: mov      x0, x8
  0x2a0640c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06410: mov      w4, w0
  0x2a06414: mov      w0, w21
  0x2a06418: mov      w1, w22
  0x2a0641c: mov      w2, w23
  0x2a06420: mov      w3, w24
  0x2a06424: mov      w5, wzr
  0x2a06428: mov      w6, wzr
  0x2a0642c: mov      w7, wzr
  0x2a06430: str      xzr, [sp, #0x28]
  0x2a06434: str      wzr, [sp, #0x20]
  0x2a06438: str      wzr, [sp, #0x18]
  0x2a0643c: str      wzr, [sp, #0x10]
  0x2a06440: str      wzr, [sp, #8]
  0x2a06444: str      wzr, [sp]
  0x2a06448: bl       #0x2cc06a0 ; -> CFormula$$CalcFinalStat
  0x2a0644c: sub      w0, w20, w0
  0x2a06450: mov      x1, xzr
  0x2a06454: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a06458: str      x0, [x19, #0x68]
  0x2a0645c: mov      x0, x19
  0x2a06460: str      w1, [x19, #0x70]
  0x2a06464: bl       #0x2a0436c ; -> CStatValue$$get_m_nFinalValue
  0x2a06468: ldr      x8, [x19, #0x80]
  0x2a0646c: ldr      w1, [x19, #0x88]
  0x2a06470: mov      w20, w0
  0x2a06474: mov      x2, xzr
  0x2a06478: mov      x0, x8
  0x2a0647c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06480: add      w1, w0, w20
  0x2a06484: mov      x0, x19
  0x2a06488: bl       #0x2a042fc ; -> CStatValue$$set_m_nFinalValue
  0x2a0648c: ldr      w8, [x19, #0x10]
  0x2a06490: cmp      w8, #7
  0x2a06494: b.ne     #0x2a064b8
  0x2a06498: mov      x0, x19
  0x2a0649c: bl       #0x2a0436c ; -> CStatValue$$get_m_nFinalValue
  0x2a064a0: cmp      w0, #0x3e8
  0x2a064a4: mov      w8, #0x3e8
  0x2a064a8: csel     w8, w0, w8, lt
  0x2a064ac: bic      w1, w8, w8, asr #31
  0x2a064b0: mov      x0, x19
  0x2a064b4: bl       #0x2a042fc ; -> CStatValue$$set_m_nFinalValue
  0x2a064b8: strb     wzr, [x19, #0xe0]
  0x2a064bc: ldp      x20, x19, [sp, #0x90]
  0x2a064c0: ldp      x22, x21, [sp, #0x80]
  0x2a064c4: ldp      x24, x23, [sp, #0x70]
  0x2a064c8: ldp      x26, x25, [sp, #0x60]
  0x2a064cc: ldp      x28, x27, [sp, #0x50]
  0x2a064d0: ldp      x29, x30, [sp, #0x40]
  0x2a064d4: add      sp, sp, #0xa0
  0x2a064d8: ret      
  0x2a064dc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
