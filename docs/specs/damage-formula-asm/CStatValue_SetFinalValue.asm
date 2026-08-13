; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetFinalValue @ 0x29fb82c..0x29fbd34 (taille 1288 octets) =====
  0x29fb82c: sub      sp, sp, #0xa0
  0x29fb830: stp      x29, x30, [sp, #0x40]
  0x29fb834: stp      x28, x27, [sp, #0x50]
  0x29fb838: stp      x26, x25, [sp, #0x60]
  0x29fb83c: stp      x24, x23, [sp, #0x70]
  0x29fb840: stp      x22, x21, [sp, #0x80]
  0x29fb844: stp      x20, x19, [sp, #0x90]
  0x29fb848: adrp     x20, #0x59d8000
  0x29fb84c: ldrb     w8, [x20, #0x9aa]
  0x29fb850: mov      x19, x0
  0x29fb854: tbnz     w8, #0, #0x29fb878
  0x29fb858: adrp     x0, #0x558a000
  0x29fb85c: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x29fb860: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fb864: adrp     x0, #0x558a000
  0x29fb868: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fb86c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fb870: mov      w8, #1
  0x29fb874: strb     w8, [x20, #0x9aa]
  0x29fb878: ldr      w8, [x19, #0x10]
  0x29fb87c: adrp     x20, #0x558a000
  0x29fb880: ldr      x20, [x20, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fb884: cmp      w8, #7
  0x29fb888: b.ne     #0x29fba74
  0x29fb88c: ldr      x0, [x19, #0xe8]
  0x29fb890: cbz      x0, #0x29fbd30
  0x29fb894: mov      w1, #1
  0x29fb898: mov      x2, xzr
  0x29fb89c: bl       #0x290d264 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x29fb8a0: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29fb8a4: ldur     x21, [x19, #0x14]
  0x29fb8a8: ldr      w22, [x19, #0x1c]
  0x29fb8ac: mov      x20, x0
  0x29fb8b0: ldr      w9, [x8, #0xe0]
  0x29fb8b4: lsr      x10, x0, #0x20
  0x29fb8b8: str      x10, [sp, #0x38]
  0x29fb8bc: cbnz     w9, #0x29fb8c8
  0x29fb8c0: mov      x0, x8
  0x29fb8c4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fb8c8: mov      x0, x21
  0x29fb8cc: mov      x1, x22
  0x29fb8d0: mov      x2, xzr
  0x29fb8d4: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb8d8: ldr      x8, [x19, #0x20]
  0x29fb8dc: ldr      w1, [x19, #0x28]
  0x29fb8e0: str      w0, [sp, #0x34]
  0x29fb8e4: mov      x2, xzr
  0x29fb8e8: mov      x0, x8
  0x29fb8ec: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb8f0: ldur     x8, [x19, #0x2c]
  0x29fb8f4: ldr      w1, [x19, #0x34]
  0x29fb8f8: mov      w22, w0
  0x29fb8fc: mov      x2, xzr
  0x29fb900: mov      x0, x8
  0x29fb904: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb908: mov      w23, w0
  0x29fb90c: mov      x0, x19
  0x29fb910: bl       #0x29f9a18 ; -> CStatValue$$get_m_nAwakeningValue
  0x29fb914: ldur     x8, [x19, #0x8c]
  0x29fb918: ldr      w1, [x19, #0x94]
  0x29fb91c: mov      w24, w0
  0x29fb920: mov      x2, xzr
  0x29fb924: mov      x0, x8
  0x29fb928: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb92c: mov      w25, w0
  0x29fb930: mov      x0, x19
  0x29fb934: bl       #0x29f9aec ; -> CStatValue$$get_m_nMonadEnchantValue
  0x29fb938: ldr      x8, [x19, #0x98]
  0x29fb93c: ldr      w1, [x19, #0xa0]
  0x29fb940: mov      w26, w0
  0x29fb944: mov      x2, xzr
  0x29fb948: mov      x0, x8
  0x29fb94c: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb950: ldr      x8, [x19, #0x38]
  0x29fb954: ldr      w1, [x19, #0x40]
  0x29fb958: mov      w27, w0
  0x29fb95c: mov      x2, xzr
  0x29fb960: mov      x0, x8
  0x29fb964: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb968: ldur     x8, [x19, #0x44]
  0x29fb96c: ldr      w1, [x19, #0x4c]
  0x29fb970: mov      w28, w0
  0x29fb974: mov      x2, xzr
  0x29fb978: mov      x0, x8
  0x29fb97c: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb980: mov      w29, w0
  0x29fb984: mov      x0, x19
  0x29fb988: bl       #0x29f9870 ; -> CStatValue$$get_m_nItemOptionValue
  0x29fb98c: ldr      x8, [x19, #0x50]
  0x29fb990: ldr      w1, [x19, #0x58]
  0x29fb994: mov      w21, w0
  0x29fb998: mov      x2, xzr
  0x29fb99c: mov      x0, x8
  0x29fb9a0: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fb9a4: ldr      x8, [sp, #0x38]
  0x29fb9a8: str      w0, [sp, #0x10]
  0x29fb9ac: ldr      w0, [sp, #0x34]
  0x29fb9b0: mov      w1, w22
  0x29fb9b4: mov      w2, w23
  0x29fb9b8: mov      w3, w24
  0x29fb9bc: mov      w4, w25
  0x29fb9c0: mov      w5, w26
  0x29fb9c4: mov      w6, w27
  0x29fb9c8: mov      w7, w28
  0x29fb9cc: str      xzr, [sp, #0x28]
  0x29fb9d0: str      w8, [sp, #0x20]
  0x29fb9d4: str      w20, [sp, #0x18]
  0x29fb9d8: str      w21, [sp, #8]
  0x29fb9dc: str      w29, [sp]
  0x29fb9e0: bl       #0x2cb1c6c ; -> CFormula$$CalcFinalStat
  0x29fb9e4: mov      w8, w0
  0x29fb9e8: ldr      x0, [x19, #0xe8]
  0x29fb9ec: cmp      w8, #0x3e8
  0x29fb9f0: mov      w9, #0x3e8
  0x29fb9f4: csel     w8, w8, w9, lt
  0x29fb9f8: cbz      x0, #0x29fbd30
  0x29fb9fc: mov      w1, wzr
  0x29fba00: mov      x2, xzr
  0x29fba04: bic      w21, w8, w8, asr #31
  0x29fba08: bl       #0x290d264 ; -> CCharacterData$$GetCriticalStatBuffValues
  0x29fba0c: adrp     x8, #0x558a000
  0x29fba10: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x29fba14: adrp     x22, #0x558a000
  0x29fba18: mov      x20, x0
  0x29fba1c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x29fba20: ldr      w9, [x8, #0xe0]
  0x29fba24: ldr      x22, [x22, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fba28: cbnz     w9, #0x29fba34
  0x29fba2c: mov      x0, x8
  0x29fba30: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fba34: mov      x9, #0x3e800000000
  0x29fba38: mov      x10, #0xf7cf
  0x29fba3c: add      w8, w21, w20
  0x29fba40: movk     x10, #0xe353, lsl #16
  0x29fba44: add      x9, x20, x9
  0x29fba48: movk     x10, #0x9ba5, lsl #32
  0x29fba4c: sxtw     x8, w8
  0x29fba50: asr      x9, x9, #0x20
  0x29fba54: movk     x10, #0x20c4, lsl #48
  0x29fba58: mul      x8, x9, x8
  0x29fba5c: smulh    x8, x8, x10
  0x29fba60: lsr      x9, x8, #0x3f
  0x29fba64: lsr      x8, x8, #7
  0x29fba68: add      w8, w8, w9
  0x29fba6c: bic      w1, w8, w8, asr #31
  0x29fba70: b        #0x29fbbd0
  0x29fba74: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x29fba78: ldur     x20, [x19, #0x14]
  0x29fba7c: ldr      w21, [x19, #0x1c]
  0x29fba80: ldr      w8, [x0, #0xe0]
  0x29fba84: cbnz     w8, #0x29fba8c
  0x29fba88: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fba8c: mov      x0, x20
  0x29fba90: mov      x1, x21
  0x29fba94: mov      x2, xzr
  0x29fba98: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fba9c: ldr      x8, [x19, #0x20]
  0x29fbaa0: ldr      w1, [x19, #0x28]
  0x29fbaa4: str      w0, [sp, #0x38]
  0x29fbaa8: mov      x2, xzr
  0x29fbaac: mov      x0, x8
  0x29fbab0: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbab4: ldur     x8, [x19, #0x2c]
  0x29fbab8: ldr      w1, [x19, #0x34]
  0x29fbabc: str      w0, [sp, #0x34]
  0x29fbac0: mov      x2, xzr
  0x29fbac4: mov      x0, x8
  0x29fbac8: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbacc: mov      w22, w0
  0x29fbad0: mov      x0, x19
  0x29fbad4: bl       #0x29f9a18 ; -> CStatValue$$get_m_nAwakeningValue
  0x29fbad8: ldur     x8, [x19, #0x8c]
  0x29fbadc: ldr      w1, [x19, #0x94]
  0x29fbae0: mov      w23, w0
  0x29fbae4: mov      x2, xzr
  0x29fbae8: mov      x0, x8
  0x29fbaec: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbaf0: mov      w24, w0
  0x29fbaf4: mov      x0, x19
  0x29fbaf8: bl       #0x29f9aec ; -> CStatValue$$get_m_nMonadEnchantValue
  0x29fbafc: ldr      x8, [x19, #0x98]
  0x29fbb00: ldr      w1, [x19, #0xa0]
  0x29fbb04: mov      w25, w0
  0x29fbb08: mov      x2, xzr
  0x29fbb0c: mov      x0, x8
  0x29fbb10: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbb14: ldr      x8, [x19, #0x38]
  0x29fbb18: ldr      w1, [x19, #0x40]
  0x29fbb1c: mov      w26, w0
  0x29fbb20: mov      x2, xzr
  0x29fbb24: mov      x0, x8
  0x29fbb28: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbb2c: ldur     x8, [x19, #0x44]
  0x29fbb30: ldr      w1, [x19, #0x4c]
  0x29fbb34: mov      w27, w0
  0x29fbb38: mov      x2, xzr
  0x29fbb3c: mov      x0, x8
  0x29fbb40: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbb44: mov      w28, w0
  0x29fbb48: mov      x0, x19
  0x29fbb4c: bl       #0x29f9870 ; -> CStatValue$$get_m_nItemOptionValue
  0x29fbb50: ldr      x8, [x19, #0x50]
  0x29fbb54: ldr      w1, [x19, #0x58]
  0x29fbb58: mov      w29, w0
  0x29fbb5c: mov      x2, xzr
  0x29fbb60: mov      x0, x8
  0x29fbb64: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbb68: mov      w20, w0
  0x29fbb6c: mov      x0, x19
  0x29fbb70: bl       #0x29f9944 ; -> CStatValue$$get_m_nBuffValue
  0x29fbb74: ldur     x8, [x19, #0x5c]
  0x29fbb78: ldr      w1, [x19, #0x64]
  0x29fbb7c: mov      w21, w0
  0x29fbb80: mov      x2, xzr
  0x29fbb84: mov      x0, x8
  0x29fbb88: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbb8c: str      w0, [sp, #0x20]
  0x29fbb90: ldp      w1, w0, [sp, #0x34]
  0x29fbb94: mov      w2, w22
  0x29fbb98: mov      w3, w23
  0x29fbb9c: mov      w4, w24
  0x29fbba0: mov      w5, w25
  0x29fbba4: mov      w6, w26
  0x29fbba8: mov      w7, w27
  0x29fbbac: str      xzr, [sp, #0x28]
  0x29fbbb0: str      w21, [sp, #0x18]
  0x29fbbb4: str      w20, [sp, #0x10]
  0x29fbbb8: str      w29, [sp, #8]
  0x29fbbbc: str      w28, [sp]
  0x29fbbc0: bl       #0x2cb1c6c ; -> CFormula$$CalcFinalStat
  0x29fbbc4: adrp     x22, #0x558a000
  0x29fbbc8: ldr      x22, [x22, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fbbcc: mov      w1, w0
  0x29fbbd0: mov      x0, x19
  0x29fbbd4: bl       #0x29f9b50 ; -> CStatValue$$set_m_nFinalValue
  0x29fbbd8: mov      x0, x19
  0x29fbbdc: bl       #0x29f9bc0 ; -> CStatValue$$get_m_nFinalValue
  0x29fbbe0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x29fbbe4: ldur     x22, [x19, #0x14]
  0x29fbbe8: ldr      w21, [x19, #0x1c]
  0x29fbbec: mov      w20, w0
  0x29fbbf0: ldr      w9, [x8, #0xe0]
  0x29fbbf4: cbnz     w9, #0x29fbc00
  0x29fbbf8: mov      x0, x8
  0x29fbbfc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fbc00: mov      x0, x22
  0x29fbc04: mov      x1, x21
  0x29fbc08: mov      x2, xzr
  0x29fbc0c: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbc10: ldr      x8, [x19, #0x20]
  0x29fbc14: ldr      w1, [x19, #0x28]
  0x29fbc18: mov      w21, w0
  0x29fbc1c: mov      x2, xzr
  0x29fbc20: mov      x0, x8
  0x29fbc24: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbc28: ldur     x8, [x19, #0x2c]
  0x29fbc2c: ldr      w1, [x19, #0x34]
  0x29fbc30: mov      w22, w0
  0x29fbc34: mov      x2, xzr
  0x29fbc38: mov      x0, x8
  0x29fbc3c: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbc40: mov      w23, w0
  0x29fbc44: mov      x0, x19
  0x29fbc48: bl       #0x29f9a18 ; -> CStatValue$$get_m_nAwakeningValue
  0x29fbc4c: ldur     x8, [x19, #0x8c]
  0x29fbc50: ldr      w1, [x19, #0x94]
  0x29fbc54: mov      w24, w0
  0x29fbc58: mov      x2, xzr
  0x29fbc5c: mov      x0, x8
  0x29fbc60: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbc64: mov      w4, w0
  0x29fbc68: mov      w0, w21
  0x29fbc6c: mov      w1, w22
  0x29fbc70: mov      w2, w23
  0x29fbc74: mov      w3, w24
  0x29fbc78: mov      w5, wzr
  0x29fbc7c: mov      w6, wzr
  0x29fbc80: mov      w7, wzr
  0x29fbc84: str      xzr, [sp, #0x28]
  0x29fbc88: str      wzr, [sp, #0x20]
  0x29fbc8c: str      wzr, [sp, #0x18]
  0x29fbc90: str      wzr, [sp, #0x10]
  0x29fbc94: str      wzr, [sp, #8]
  0x29fbc98: str      wzr, [sp]
  0x29fbc9c: bl       #0x2cb1c6c ; -> CFormula$$CalcFinalStat
  0x29fbca0: sub      w0, w20, w0
  0x29fbca4: mov      x1, xzr
  0x29fbca8: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fbcac: str      x0, [x19, #0x68]
  0x29fbcb0: mov      x0, x19
  0x29fbcb4: str      w1, [x19, #0x70]
  0x29fbcb8: bl       #0x29f9bc0 ; -> CStatValue$$get_m_nFinalValue
  0x29fbcbc: ldr      x8, [x19, #0x80]
  0x29fbcc0: ldr      w1, [x19, #0x88]
  0x29fbcc4: mov      w20, w0
  0x29fbcc8: mov      x2, xzr
  0x29fbccc: mov      x0, x8
  0x29fbcd0: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbcd4: add      w1, w0, w20
  0x29fbcd8: mov      x0, x19
  0x29fbcdc: bl       #0x29f9b50 ; -> CStatValue$$set_m_nFinalValue
  0x29fbce0: ldr      w8, [x19, #0x10]
  0x29fbce4: cmp      w8, #7
  0x29fbce8: b.ne     #0x29fbd0c
  0x29fbcec: mov      x0, x19
  0x29fbcf0: bl       #0x29f9bc0 ; -> CStatValue$$get_m_nFinalValue
  0x29fbcf4: cmp      w0, #0x3e8
  0x29fbcf8: mov      w8, #0x3e8
  0x29fbcfc: csel     w8, w0, w8, lt
  0x29fbd00: bic      w1, w8, w8, asr #31
  0x29fbd04: mov      x0, x19
  0x29fbd08: bl       #0x29f9b50 ; -> CStatValue$$set_m_nFinalValue
  0x29fbd0c: strb     wzr, [x19, #0xe0]
  0x29fbd10: ldp      x20, x19, [sp, #0x90]
  0x29fbd14: ldp      x22, x21, [sp, #0x80]
  0x29fbd18: ldp      x24, x23, [sp, #0x70]
  0x29fbd1c: ldp      x26, x25, [sp, #0x60]
  0x29fbd20: ldp      x28, x27, [sp, #0x50]
  0x29fbd24: ldp      x29, x30, [sp, #0x40]
  0x29fbd28: add      sp, sp, #0xa0
  0x29fbd2c: ret      
  0x29fbd30: bl       #0x21afc18 ; -> ??? 0x21afc18
