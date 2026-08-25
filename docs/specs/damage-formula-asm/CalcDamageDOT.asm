; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcDamageDOT @ 0x2cc2624..0x2cc2774 (taille 336 octets) =====
  0x2cc2624: stp      x30, x25, [sp, #-0x40]!
  0x2cc2628: stp      x24, x23, [sp, #0x10]
  0x2cc262c: stp      x22, x21, [sp, #0x20]
  0x2cc2630: stp      x20, x19, [sp, #0x30]
  0x2cc2634: adrp     x23, #0x59e9000
  0x2cc2638: ldrb     w8, [x23, #0xd69]
  0x2cc263c: mov      w19, w3
  0x2cc2640: mov      w20, w2
  0x2cc2644: mov      x21, x1
  0x2cc2648: mov      x22, x0
  0x2cc264c: tbnz     w8, #0, #0x2cc2664
  0x2cc2650: adrp     x0, #0x5597000
  0x2cc2654: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc2658: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc265c: mov      w8, #1
  0x2cc2660: strb     w8, [x23, #0xd69]
  0x2cc2664: cbz      x22, #0x2cc2770
  0x2cc2668: ldr      x0, [x22, #0x28]
  0x2cc266c: cbz      x0, #0x2cc2770
  0x2cc2670: mov      x1, xzr
  0x2cc2674: bl       #0x29096a8 ; -> CCharacterData$$get_PiercePowerRate
  0x2cc2678: ldr      x8, [x22, #0x28]
  0x2cc267c: cbz      x8, #0x2cc2770
  0x2cc2680: mov      w22, w0
  0x2cc2684: mov      x0, x8
  0x2cc2688: mov      x1, xzr
  0x2cc268c: bl       #0x29095cc ; -> CCharacterData$$get_PiercePower
  0x2cc2690: cbz      x21, #0x2cc2770
  0x2cc2694: mov      w23, w0
  0x2cc2698: ldr      x0, [x21, #0x28]
  0x2cc269c: cbz      x0, #0x2cc2770
  0x2cc26a0: adrp     x24, #0x5597000
  0x2cc26a4: ldr      x24, [x24, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc26a8: mov      x1, xzr
  0x2cc26ac: bl       #0x290925c ; -> CCharacterData$$get_Def
  0x2cc26b0: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5597000)
  0x2cc26b4: mov      w24, w0
  0x2cc26b8: ldr      w9, [x8, #0xe0]
  0x2cc26bc: cbnz     w9, #0x2cc26c8
  0x2cc26c0: mov      x0, x8
  0x2cc26c4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc26c8: mov      w25, #0x3e8
  0x2cc26cc: cmp      w22, #0x3e8
  0x2cc26d0: sub      w8, w25, w22
  0x2cc26d4: csel     w8, w8, wzr, lt
  0x2cc26d8: smull    x8, w24, w8
  0x2cc26dc: mov      w9, #-0x3e8
  0x2cc26e0: mov      x0, #-0x3e58
  0x2cc26e4: smaddl   x1, w23, w9, x8
  0x2cc26e8: movk     x0, #0xfff0, lsl #16
  0x2cc26ec: mov      x2, xzr
  0x2cc26f0: bl       #0x4913ac4 ; -> System.Math$$Max
  0x2cc26f4: ldr      x8, [x21, #0x28]
  0x2cc26f8: cbz      x8, #0x2cc2770
  0x2cc26fc: mov      x21, x0
  0x2cc2700: mov      x0, x8
  0x2cc2704: mov      x1, xzr
  0x2cc2708: bl       #0x2909338 ; -> CCharacterData$$get_DMGReduceRate
  0x2cc270c: cmp      w0, #0x384
  0x2cc2710: mov      w8, #0x384
  0x2cc2714: mov      w10, #0x4240
  0x2cc2718: smull    x9, w20, w19
  0x2cc271c: movk     w10, #0xf, lsl #16
  0x2cc2720: csel     w8, w0, w8, lt
  0x2cc2724: mov      x11, #0x34db
  0x2cc2728: movk     x11, #0xd7b6, lsl #16
  0x2cc272c: mul      x9, x9, x10
  0x2cc2730: add      x10, x21, x10
  0x2cc2734: sub      w8, w25, w8
  0x2cc2738: movk     x11, #0xde82, lsl #32
  0x2cc273c: sdiv     x9, x9, x10
  0x2cc2740: sxtw     x8, w8
  0x2cc2744: movk     x11, #0x431b, lsl #48
  0x2cc2748: mul      x8, x9, x8
  0x2cc274c: ldp      x20, x19, [sp, #0x30]
  0x2cc2750: ldp      x22, x21, [sp, #0x20]
  0x2cc2754: ldp      x24, x23, [sp, #0x10]
  0x2cc2758: smulh    x8, x8, x11
  0x2cc275c: lsr      x9, x8, #0x3f
  0x2cc2760: lsr      x8, x8, #0x12
  0x2cc2764: add      w0, w8, w9
  0x2cc2768: ldp      x30, x25, [sp], #0x40
  0x2cc276c: ret      
  0x2cc2770: bl       #0x21b4d20 ; -> ??? 0x21b4d20
