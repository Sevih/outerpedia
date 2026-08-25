; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetBaseValue @ 0x2a047e8..0x2a04a10 (taille 552 octets) =====
  0x2a047e8: str      x30, [sp, #-0x50]!
  0x2a047ec: stp      x26, x25, [sp, #0x10]
  0x2a047f0: stp      x24, x23, [sp, #0x20]
  0x2a047f4: stp      x22, x21, [sp, #0x30]
  0x2a047f8: stp      x20, x19, [sp, #0x40]
  0x2a047fc: adrp     x26, #0x59e8000
  0x2a04800: ldrb     w8, [x26, #0x5d8]
  0x2a04804: mov      x25, x6
  0x2a04808: mov      w21, w5
  0x2a0480c: mov      w20, w4
  0x2a04810: mov      w23, w3
  0x2a04814: mov      w24, w2
  0x2a04818: mov      w22, w1
  0x2a0481c: mov      x19, x0
  0x2a04820: tbnz     w8, #0, #0x2a04844
  0x2a04824: adrp     x0, #0x5599000
  0x2a04828: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2a0482c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a04830: adrp     x0, #0x5599000
  0x2a04834: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04838: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a0483c: mov      w8, #1
  0x2a04840: strb     w8, [x26, #0x5d8]
  0x2a04844: cbz      x25, #0x2a04858
  0x2a04848: mov      x0, x19
  0x2a0484c: str      x25, [x0, #0xe8]!
  0x2a04850: mov      x1, x25
  0x2a04854: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2a04858: adrp     x25, #0x5599000
  0x2a0485c: ldr      x0, [x19, #0xe8]
  0x2a04860: ldr      x25, [x25, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04864: cbz      x0, #0x2a04900
  0x2a04868: mov      x1, xzr
  0x2a0486c: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x2a04870: cmp      w23, #0x65
  0x2a04874: b.lt     #0x2a04900
  0x2a04878: cbnz     w0, #0x2a04900
  0x2a0487c: ldr      x8, [x19, #0xe8]
  0x2a04880: cbz      x8, #0x2a04a0c
  0x2a04884: mov      x12, #0xd40b
  0x2a04888: movk     x12, #0x95fa, lsl #16
  0x2a0488c: ldrsw    x8, [x8, #0x88]
  0x2a04890: sub      w10, w24, w22
  0x2a04894: sub      w11, w23, #1
  0x2a04898: movk     x12, #0xb502, lsl #32
  0x2a0489c: movk     x12, #0xa57e, lsl #48
  0x2a048a0: mov      x13, #0x3339
  0x2a048a4: smull    x14, w11, w10
  0x2a048a8: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2a048ac: sub      w9, w23, #0x64
  0x2a048b0: movk     x13, #0x77cc, lsl #16
  0x2a048b4: smulh    x12, x14, x12
  0x2a048b8: sxtw     x14, w10
  0x2a048bc: movk     x13, #0xc107, lsl #32
  0x2a048c0: mul      x9, x9, x14
  0x2a048c4: movk     x13, #0x54bb, lsl #48
  0x2a048c8: smaddl   x10, w11, w10, x12
  0x2a048cc: mul      x8, x9, x8
  0x2a048d0: lsr      x11, x10, #0x3f
  0x2a048d4: lsr      x10, x10, #6
  0x2a048d8: ldr      w9, [x0, #0xe0]
  0x2a048dc: smulh    x8, x8, x13
  0x2a048e0: add      w10, w10, w11
  0x2a048e4: lsr      x11, x8, #0x3f
  0x2a048e8: lsr      x8, x8, #0xf
  0x2a048ec: add      w10, w10, w22
  0x2a048f0: add      w8, w8, w11
  0x2a048f4: add      w22, w10, w8
  0x2a048f8: cbnz     w9, #0x2a0492c
  0x2a048fc: b        #0x2a04928
  0x2a04900: mov      w0, w22
  0x2a04904: mov      w1, w24
  0x2a04908: mov      w2, w23
  0x2a0490c: mov      x3, xzr
  0x2a04910: bl       #0x2cc0608 ; -> CFormula$$CalcStat
  0x2a04914: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2a04918: mov      w22, w0
  0x2a0491c: ldr      w9, [x8, #0xe0]
  0x2a04920: cbnz     w9, #0x2a0492c
  0x2a04924: mov      x0, x8
  0x2a04928: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a0492c: mov      w0, w22
  0x2a04930: mov      x1, xzr
  0x2a04934: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a04938: mov      x23, x1
  0x2a0493c: cmp      w21, #1
  0x2a04940: stur     x0, [x19, #0x14]
  0x2a04944: str      w23, [x19, #0x1c]
  0x2a04948: b.lt     #0x2a049c8
  0x2a0494c: mov      x22, x0
  0x2a04950: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2a04954: adrp     x24, #0x5599000
  0x2a04958: ldr      w8, [x0, #0xe0]
  0x2a0495c: ldr      x24, [x24, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2a04960: cbnz     w8, #0x2a04968
  0x2a04964: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a04968: and      x1, x23, #0xffffffff
  0x2a0496c: mov      x0, x22
  0x2a04970: mov      x2, xzr
  0x2a04974: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a04978: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5599000)
  0x2a0497c: mov      w22, w0
  0x2a04980: ldr      w9, [x8, #0xe0]
  0x2a04984: cbnz     w9, #0x2a04990
  0x2a04988: mov      x0, x8
  0x2a0498c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a04990: mov      x9, #0xf7cf
  0x2a04994: movk     x9, #0xe353, lsl #16
  0x2a04998: add      w8, w21, #0x3e8
  0x2a0499c: movk     x9, #0x9ba5, lsl #32
  0x2a049a0: movk     x9, #0x20c4, lsl #48
  0x2a049a4: smull    x8, w22, w8
  0x2a049a8: smulh    x8, x8, x9
  0x2a049ac: lsr      x9, x8, #0x3f
  0x2a049b0: lsr      x8, x8, #7
  0x2a049b4: add      w0, w8, w9
  0x2a049b8: mov      x1, xzr
  0x2a049bc: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a049c0: stur     x0, [x19, #0x14]
  0x2a049c4: str      w1, [x19, #0x1c]
  0x2a049c8: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2a049cc: ldr      w8, [x0, #0xe0]
  0x2a049d0: cbnz     w8, #0x2a049d8
  0x2a049d4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a049d8: mov      w0, w20
  0x2a049dc: mov      x1, xzr
  0x2a049e0: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a049e4: mov      w8, #1
  0x2a049e8: str      x0, [x19, #0x20]
  0x2a049ec: str      w1, [x19, #0x28]
  0x2a049f0: strb     w8, [x19, #0xe0]
  0x2a049f4: ldp      x20, x19, [sp, #0x40]
  0x2a049f8: ldp      x22, x21, [sp, #0x30]
  0x2a049fc: ldp      x24, x23, [sp, #0x20]
  0x2a04a00: ldp      x26, x25, [sp, #0x10]
  0x2a04a04: ldr      x30, [sp], #0x50
  0x2a04a08: ret      
  0x2a04a0c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
