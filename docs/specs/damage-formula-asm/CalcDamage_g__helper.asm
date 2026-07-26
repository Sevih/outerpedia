; ===== CalcDamage_g__helper @ 0x2c5b4dc..0x2c5b778 (taille 668 octets) =====
  0x2c5b4dc: sub      sp, sp, #0x50
  0x2c5b4e0: stp      x30, x25, [sp, #0x10]
  0x2c5b4e4: stp      x24, x23, [sp, #0x20]
  0x2c5b4e8: stp      x22, x21, [sp, #0x30]
  0x2c5b4ec: stp      x20, x19, [sp, #0x40]
  0x2c5b4f0: adrp     x21, #0x595a000
  0x2c5b4f4: ldrb     w8, [x21, #0x90a]
  0x2c5b4f8: mov      x19, x1
  0x2c5b4fc: mov      w20, w0
  0x2c5b500: tbnz     w8, #0, #0x2c5b524
  0x2c5b504: adrp     x0, #0x5511000
  0x2c5b508: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5b50c: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b510: adrp     x0, #0x550f000
  0x2c5b514: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5b518: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b51c: mov      w8, #1
  0x2c5b520: strb     w8, [x21, #0x90a]
  0x2c5b524: str      wzr, [sp, #0xc]
  0x2c5b528: ldr      x0, [x19]
  0x2c5b52c: cbz      x0, #0x2c5b774
  0x2c5b530: mov      x1, xzr
  0x2c5b534: bl       #0x26e02a4 ; -> CCharacterBattle$$GetAttackStat
  0x2c5b538: ldr      x8, [x19]
  0x2c5b53c: cbz      x8, #0x2c5b774
  0x2c5b540: mov      w21, w0
  0x2c5b544: mov      x0, x8
  0x2c5b548: mov      x1, xzr
  0x2c5b54c: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x2c5b550: cbz      x0, #0x2c5b774
  0x2c5b554: mov      x1, xzr
  0x2c5b558: bl       #0x24d29a4 ; -> CSkillManager$$GetSkillFactor
  0x2c5b55c: ldr      x8, [x19]
  0x2c5b560: cbz      x8, #0x2c5b774
  0x2c5b564: mov      w22, w0
  0x2c5b568: ldr      x0, [x8, #0x28]
  0x2c5b56c: cbz      x0, #0x2c5b774
  0x2c5b570: mov      x1, xzr
  0x2c5b574: bl       #0x27e0524 ; -> CCharacterData$$get_PiercePowerRate
  0x2c5b578: ldr      x8, [x19]
  0x2c5b57c: cbz      x8, #0x2c5b774
  0x2c5b580: mov      w23, w0
  0x2c5b584: ldr      x0, [x8, #0x28]
  0x2c5b588: cbz      x0, #0x2c5b774
  0x2c5b58c: mov      x1, xzr
  0x2c5b590: bl       #0x27e0448 ; -> CCharacterData$$get_PiercePower
  0x2c5b594: ldr      x8, [x19, #8]
  0x2c5b598: cbz      x8, #0x2c5b774
  0x2c5b59c: mov      w24, w0
  0x2c5b5a0: ldr      x0, [x8, #0x28]
  0x2c5b5a4: cbz      x0, #0x2c5b774
  0x2c5b5a8: adrp     x25, #0x550f000
  0x2c5b5ac: ldr      x25, [x25, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5b5b0: mov      x1, xzr
  0x2c5b5b4: bl       #0x27e00d8 ; -> CCharacterData$$get_Def
  0x2c5b5b8: ldr      x8, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x2c5b5bc: mov      w25, w0
  0x2c5b5c0: ldr      w9, [x8, #0xe0]
  0x2c5b5c4: cbnz     w9, #0x2c5b5d0
  0x2c5b5c8: mov      x0, x8
  0x2c5b5cc: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b5d0: mov      w8, #0x3e8
  0x2c5b5d4: cmp      w23, #0x3e8
  0x2c5b5d8: sub      w8, w8, w23
  0x2c5b5dc: csel     w8, w8, wzr, lt
  0x2c5b5e0: smull    x8, w25, w8
  0x2c5b5e4: mov      w9, #-0x3e8
  0x2c5b5e8: mov      x0, #-0x3e58
  0x2c5b5ec: smaddl   x1, w24, w9, x8
  0x2c5b5f0: movk     x0, #0xfff0, lsl #16
  0x2c5b5f4: mov      x2, xzr
  0x2c5b5f8: bl       #0x48a46d8 ; -> System.Math$$Max
  0x2c5b5fc: ldr      x8, [x19, #8]
  0x2c5b600: cbz      x8, #0x2c5b774
  0x2c5b604: mov      x11, #0xf7cf
  0x2c5b608: movk     x11, #0xe353, lsl #16
  0x2c5b60c: sxtw     x9, w22
  0x2c5b610: smull    x10, w21, w20
  0x2c5b614: movk     x11, #0x9ba5, lsl #32
  0x2c5b618: movk     x11, #0x20c4, lsl #48
  0x2c5b61c: mul      x9, x10, x9
  0x2c5b620: smulh    x9, x9, x11
  0x2c5b624: asr      x10, x9, #7
  0x2c5b628: mov      w23, #0x4240
  0x2c5b62c: add      x9, x10, x9, lsr #63
  0x2c5b630: ldrsw    x10, [x19, #0x10]
  0x2c5b634: movk     w23, #0xf, lsl #16
  0x2c5b638: mul      x9, x9, x23
  0x2c5b63c: add      x12, x0, x23
  0x2c5b640: sdiv     x9, x9, x12
  0x2c5b644: mul      x9, x9, x10
  0x2c5b648: smulh    x9, x9, x11
  0x2c5b64c: asr      x10, x9, #7
  0x2c5b650: mov      w1, #5
  0x2c5b654: mov      x0, x8
  0x2c5b658: mov      x2, xzr
  0x2c5b65c: add      x21, x10, x9, lsr #63
  0x2c5b660: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x2c5b664: cbz      x0, #0x2c5b68c
  0x2c5b668: mov      x9, #0xf7cf
  0x2c5b66c: movk     x9, #0xe353, lsl #16
  0x2c5b670: mov      w8, #0x47e
  0x2c5b674: movk     x9, #0x9ba5, lsl #32
  0x2c5b678: mul      x8, x21, x8
  0x2c5b67c: movk     x9, #0x20c4, lsl #48
  0x2c5b680: smulh    x8, x8, x9
  0x2c5b684: asr      x9, x8, #7
  0x2c5b688: add      x21, x9, x8, lsr #63
  0x2c5b68c: ldp      x0, x1, [x19]
  0x2c5b690: bl       #0x2c5ab60 ; -> CFormula$$GetElementeryDamageRate
  0x2c5b694: ldr      x8, [x19, #8]
  0x2c5b698: cbz      x8, #0x2c5b774
  0x2c5b69c: mov      w20, w0
  0x2c5b6a0: mov      x0, x8
  0x2c5b6a4: mov      x1, xzr
  0x2c5b6a8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b6ac: cbz      x0, #0x2c5b774
  0x2c5b6b0: mov      x10, #0xf7cf
  0x2c5b6b4: movk     x10, #0xe353, lsl #16
  0x2c5b6b8: sxtw     x8, w20
  0x2c5b6bc: ldr      w9, [x0, #0x3c]
  0x2c5b6c0: movk     x10, #0x9ba5, lsl #32
  0x2c5b6c4: mul      x8, x21, x8
  0x2c5b6c8: movk     x10, #0x20c4, lsl #48
  0x2c5b6cc: smulh    x8, x8, x10
  0x2c5b6d0: asr      x10, x8, #7
  0x2c5b6d4: cmp      w9, #3
  0x2c5b6d8: add      x20, x10, x8, lsr #63
  0x2c5b6dc: b.ne     #0x2c5b724
  0x2c5b6e0: adrp     x8, #0x5511000
  0x2c5b6e4: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5b6e8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b6ec: ldr      w8, [x0, #0xe0]
  0x2c5b6f0: cbnz     w8, #0x2c5b6f8
  0x2c5b6f4: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b6f8: mov      x0, xzr
  0x2c5b6fc: bl       #0x28d779c ; -> CCommonDefine$$get_MISSED_DAMAGE_RATE_PERMILLE
  0x2c5b700: mov      x9, #0xf7cf
  0x2c5b704: movk     x9, #0xe353, lsl #16
  0x2c5b708: sxtw     x8, w0
  0x2c5b70c: movk     x9, #0x9ba5, lsl #32
  0x2c5b710: mul      x8, x20, x8
  0x2c5b714: movk     x9, #0x20c4, lsl #48
  0x2c5b718: smulh    x8, x8, x9
  0x2c5b71c: asr      x9, x8, #7
  0x2c5b720: add      x20, x9, x8, lsr #63
  0x2c5b724: ldr      x0, [x19, #8]
  0x2c5b728: cbz      x0, #0x2c5b774
  0x2c5b72c: ldr      x2, [x19]
  0x2c5b730: add      x1, sp, #0xc
  0x2c5b734: mov      x3, xzr
  0x2c5b738: bl       #0x26df06c ; -> CCharacterBattle$$GetBuffDamgeFinalReduce
  0x2c5b73c: ldr      w8, [sp, #0xc]
  0x2c5b740: mov      w9, #0x3e8
  0x2c5b744: ldp      x22, x21, [sp, #0x30]
  0x2c5b748: ldp      x30, x25, [sp, #0x10]
  0x2c5b74c: sub      w8, w9, w8
  0x2c5b750: sxtw     x8, w8
  0x2c5b754: mul      x8, x20, x8
  0x2c5b758: sdiv     x8, x8, x23
  0x2c5b75c: ldp      x20, x19, [sp, #0x40]
  0x2c5b760: ldp      x24, x23, [sp, #0x20]
  0x2c5b764: cmp      w8, #1
  0x2c5b768: csinc    w0, w8, wzr, gt
  0x2c5b76c: add      sp, sp, #0x50
  0x2c5b770: ret      
  0x2c5b774: bl       #0x21849c0 ; -> ??? 0x21849c0
