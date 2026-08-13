; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcDamage_g__helper @ 0x2cb330c..0x2cb35a8 (taille 668 octets) =====
  0x2cb330c: sub      sp, sp, #0x50
  0x2cb3310: stp      x30, x25, [sp, #0x10]
  0x2cb3314: stp      x24, x23, [sp, #0x20]
  0x2cb3318: stp      x22, x21, [sp, #0x30]
  0x2cb331c: stp      x20, x19, [sp, #0x40]
  0x2cb3320: adrp     x21, #0x59da000
  0x2cb3324: ldrb     w8, [x21, #0x118]
  0x2cb3328: mov      x19, x1
  0x2cb332c: mov      w20, w0
  0x2cb3330: tbnz     w8, #0, #0x2cb3354
  0x2cb3334: adrp     x0, #0x558a000
  0x2cb3338: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb333c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3340: adrp     x0, #0x5588000
  0x2cb3344: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb3348: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb334c: mov      w8, #1
  0x2cb3350: strb     w8, [x21, #0x118]
  0x2cb3354: str      wzr, [sp, #0xc]
  0x2cb3358: ldr      x0, [x19]
  0x2cb335c: cbz      x0, #0x2cb35a4
  0x2cb3360: mov      x1, xzr
  0x2cb3364: bl       #0x282939c ; -> CCharacterBattle$$GetAttackStat
  0x2cb3368: ldr      x8, [x19]
  0x2cb336c: cbz      x8, #0x2cb35a4
  0x2cb3370: mov      w21, w0
  0x2cb3374: mov      x0, x8
  0x2cb3378: mov      x1, xzr
  0x2cb337c: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x2cb3380: cbz      x0, #0x2cb35a4
  0x2cb3384: mov      x1, xzr
  0x2cb3388: bl       #0x250fc6c ; -> CSkillManager$$GetSkillFactor
  0x2cb338c: ldr      x8, [x19]
  0x2cb3390: cbz      x8, #0x2cb35a4
  0x2cb3394: mov      w22, w0
  0x2cb3398: ldr      x0, [x8, #0x28]
  0x2cb339c: cbz      x0, #0x2cb35a4
  0x2cb33a0: mov      x1, xzr
  0x2cb33a4: bl       #0x2902434 ; -> CCharacterData$$get_PiercePowerRate
  0x2cb33a8: ldr      x8, [x19]
  0x2cb33ac: cbz      x8, #0x2cb35a4
  0x2cb33b0: mov      w23, w0
  0x2cb33b4: ldr      x0, [x8, #0x28]
  0x2cb33b8: cbz      x0, #0x2cb35a4
  0x2cb33bc: mov      x1, xzr
  0x2cb33c0: bl       #0x2902358 ; -> CCharacterData$$get_PiercePower
  0x2cb33c4: ldr      x8, [x19, #8]
  0x2cb33c8: cbz      x8, #0x2cb35a4
  0x2cb33cc: mov      w24, w0
  0x2cb33d0: ldr      x0, [x8, #0x28]
  0x2cb33d4: cbz      x0, #0x2cb35a4
  0x2cb33d8: adrp     x25, #0x5588000
  0x2cb33dc: ldr      x25, [x25, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb33e0: mov      x1, xzr
  0x2cb33e4: bl       #0x2901fe8 ; -> CCharacterData$$get_Def
  0x2cb33e8: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5588000)
  0x2cb33ec: mov      w25, w0
  0x2cb33f0: ldr      w9, [x8, #0xe0]
  0x2cb33f4: cbnz     w9, #0x2cb3400
  0x2cb33f8: mov      x0, x8
  0x2cb33fc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3400: mov      w8, #0x3e8
  0x2cb3404: cmp      w23, #0x3e8
  0x2cb3408: sub      w8, w8, w23
  0x2cb340c: csel     w8, w8, wzr, lt
  0x2cb3410: smull    x8, w25, w8
  0x2cb3414: mov      w9, #-0x3e8
  0x2cb3418: mov      x0, #-0x3e58
  0x2cb341c: smaddl   x1, w24, w9, x8
  0x2cb3420: movk     x0, #0xfff0, lsl #16
  0x2cb3424: mov      x2, xzr
  0x2cb3428: bl       #0x49051c0 ; -> System.Math$$Max
  0x2cb342c: ldr      x8, [x19, #8]
  0x2cb3430: cbz      x8, #0x2cb35a4
  0x2cb3434: mov      x11, #0xf7cf
  0x2cb3438: movk     x11, #0xe353, lsl #16
  0x2cb343c: sxtw     x9, w22
  0x2cb3440: smull    x10, w21, w20
  0x2cb3444: movk     x11, #0x9ba5, lsl #32
  0x2cb3448: movk     x11, #0x20c4, lsl #48
  0x2cb344c: mul      x9, x10, x9
  0x2cb3450: smulh    x9, x9, x11
  0x2cb3454: asr      x10, x9, #7
  0x2cb3458: mov      w23, #0x4240
  0x2cb345c: add      x9, x10, x9, lsr #63
  0x2cb3460: ldrsw    x10, [x19, #0x10]
  0x2cb3464: movk     w23, #0xf, lsl #16
  0x2cb3468: mul      x9, x9, x23
  0x2cb346c: add      x12, x0, x23
  0x2cb3470: sdiv     x9, x9, x12
  0x2cb3474: mul      x9, x9, x10
  0x2cb3478: smulh    x9, x9, x11
  0x2cb347c: asr      x10, x9, #7
  0x2cb3480: mov      w1, #5
  0x2cb3484: mov      x0, x8
  0x2cb3488: mov      x2, xzr
  0x2cb348c: add      x21, x10, x9, lsr #63
  0x2cb3490: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2cb3494: cbz      x0, #0x2cb34bc
  0x2cb3498: mov      x9, #0xf7cf
  0x2cb349c: movk     x9, #0xe353, lsl #16
  0x2cb34a0: mov      w8, #0x47e
  0x2cb34a4: movk     x9, #0x9ba5, lsl #32
  0x2cb34a8: mul      x8, x21, x8
  0x2cb34ac: movk     x9, #0x20c4, lsl #48
  0x2cb34b0: smulh    x8, x8, x9
  0x2cb34b4: asr      x9, x8, #7
  0x2cb34b8: add      x21, x9, x8, lsr #63
  0x2cb34bc: ldp      x0, x1, [x19]
  0x2cb34c0: bl       #0x2cb2984 ; -> CFormula$$GetElementeryDamageRate
  0x2cb34c4: ldr      x8, [x19, #8]
  0x2cb34c8: cbz      x8, #0x2cb35a4
  0x2cb34cc: mov      w20, w0
  0x2cb34d0: mov      x0, x8
  0x2cb34d4: mov      x1, xzr
  0x2cb34d8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb34dc: cbz      x0, #0x2cb35a4
  0x2cb34e0: mov      x10, #0xf7cf
  0x2cb34e4: movk     x10, #0xe353, lsl #16
  0x2cb34e8: sxtw     x8, w20
  0x2cb34ec: ldr      w9, [x0, #0x3c]
  0x2cb34f0: movk     x10, #0x9ba5, lsl #32
  0x2cb34f4: mul      x8, x21, x8
  0x2cb34f8: movk     x10, #0x20c4, lsl #48
  0x2cb34fc: smulh    x8, x8, x10
  0x2cb3500: asr      x10, x8, #7
  0x2cb3504: cmp      w9, #3
  0x2cb3508: add      x20, x10, x8, lsr #63
  0x2cb350c: b.ne     #0x2cb3554
  0x2cb3510: adrp     x8, #0x558a000
  0x2cb3514: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb3518: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2cb351c: ldr      w8, [x0, #0xe0]
  0x2cb3520: cbnz     w8, #0x2cb3528
  0x2cb3524: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3528: mov      x0, xzr
  0x2cb352c: bl       #0x2a00268 ; -> CCommonDefine$$get_MISSED_DAMAGE_RATE_PERMILLE
  0x2cb3530: mov      x9, #0xf7cf
  0x2cb3534: movk     x9, #0xe353, lsl #16
  0x2cb3538: sxtw     x8, w0
  0x2cb353c: movk     x9, #0x9ba5, lsl #32
  0x2cb3540: mul      x8, x20, x8
  0x2cb3544: movk     x9, #0x20c4, lsl #48
  0x2cb3548: smulh    x8, x8, x9
  0x2cb354c: asr      x9, x8, #7
  0x2cb3550: add      x20, x9, x8, lsr #63
  0x2cb3554: ldr      x0, [x19, #8]
  0x2cb3558: cbz      x0, #0x2cb35a4
  0x2cb355c: ldr      x2, [x19]
  0x2cb3560: add      x1, sp, #0xc
  0x2cb3564: mov      x3, xzr
  0x2cb3568: bl       #0x2828164 ; -> CCharacterBattle$$GetBuffDamgeFinalReduce
  0x2cb356c: ldr      w8, [sp, #0xc]
  0x2cb3570: mov      w9, #0x3e8
  0x2cb3574: ldp      x22, x21, [sp, #0x30]
  0x2cb3578: ldp      x30, x25, [sp, #0x10]
  0x2cb357c: sub      w8, w9, w8
  0x2cb3580: sxtw     x8, w8
  0x2cb3584: mul      x8, x20, x8
  0x2cb3588: sdiv     x8, x8, x23
  0x2cb358c: ldp      x20, x19, [sp, #0x40]
  0x2cb3590: ldp      x24, x23, [sp, #0x20]
  0x2cb3594: cmp      w8, #1
  0x2cb3598: csinc    w0, w8, wzr, gt
  0x2cb359c: add      sp, sp, #0x50
  0x2cb35a0: ret      
  0x2cb35a4: bl       #0x21afc18 ; -> ??? 0x21afc18
