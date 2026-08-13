; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetBaseValue @ 0x29fa03c..0x29fa264 (taille 552 octets) =====
  0x29fa03c: str      x30, [sp, #-0x50]!
  0x29fa040: stp      x26, x25, [sp, #0x10]
  0x29fa044: stp      x24, x23, [sp, #0x20]
  0x29fa048: stp      x22, x21, [sp, #0x30]
  0x29fa04c: stp      x20, x19, [sp, #0x40]
  0x29fa050: adrp     x26, #0x59d8000
  0x29fa054: ldrb     w8, [x26, #0x99f]
  0x29fa058: mov      x25, x6
  0x29fa05c: mov      w21, w5
  0x29fa060: mov      w20, w4
  0x29fa064: mov      w23, w3
  0x29fa068: mov      w24, w2
  0x29fa06c: mov      w22, w1
  0x29fa070: mov      x19, x0
  0x29fa074: tbnz     w8, #0, #0x29fa098
  0x29fa078: adrp     x0, #0x558a000
  0x29fa07c: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x29fa080: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fa084: adrp     x0, #0x558a000
  0x29fa088: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fa08c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fa090: mov      w8, #1
  0x29fa094: strb     w8, [x26, #0x99f]
  0x29fa098: cbz      x25, #0x29fa0ac
  0x29fa09c: mov      x0, x19
  0x29fa0a0: str      x25, [x0, #0xe8]!
  0x29fa0a4: mov      x1, x25
  0x29fa0a8: bl       #0x21af920 ; -> ??? 0x21af920
  0x29fa0ac: adrp     x25, #0x558a000
  0x29fa0b0: ldr      x0, [x19, #0xe8]
  0x29fa0b4: ldr      x25, [x25, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fa0b8: cbz      x0, #0x29fa154
  0x29fa0bc: mov      x1, xzr
  0x29fa0c0: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x29fa0c4: cmp      w23, #0x65
  0x29fa0c8: b.lt     #0x29fa154
  0x29fa0cc: cbnz     w0, #0x29fa154
  0x29fa0d0: ldr      x8, [x19, #0xe8]
  0x29fa0d4: cbz      x8, #0x29fa260
  0x29fa0d8: mov      x12, #0xd40b
  0x29fa0dc: movk     x12, #0x95fa, lsl #16
  0x29fa0e0: ldrsw    x8, [x8, #0x88]
  0x29fa0e4: sub      w10, w24, w22
  0x29fa0e8: sub      w11, w23, #1
  0x29fa0ec: movk     x12, #0xb502, lsl #32
  0x29fa0f0: movk     x12, #0xa57e, lsl #48
  0x29fa0f4: mov      x13, #0x3339
  0x29fa0f8: smull    x14, w11, w10
  0x29fa0fc: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x29fa100: sub      w9, w23, #0x64
  0x29fa104: movk     x13, #0x77cc, lsl #16
  0x29fa108: smulh    x12, x14, x12
  0x29fa10c: sxtw     x14, w10
  0x29fa110: movk     x13, #0xc107, lsl #32
  0x29fa114: mul      x9, x9, x14
  0x29fa118: movk     x13, #0x54bb, lsl #48
  0x29fa11c: smaddl   x10, w11, w10, x12
  0x29fa120: mul      x8, x9, x8
  0x29fa124: lsr      x11, x10, #0x3f
  0x29fa128: lsr      x10, x10, #6
  0x29fa12c: ldr      w9, [x0, #0xe0]
  0x29fa130: smulh    x8, x8, x13
  0x29fa134: add      w10, w10, w11
  0x29fa138: lsr      x11, x8, #0x3f
  0x29fa13c: lsr      x8, x8, #0xf
  0x29fa140: add      w10, w10, w22
  0x29fa144: add      w8, w8, w11
  0x29fa148: add      w22, w10, w8
  0x29fa14c: cbnz     w9, #0x29fa180
  0x29fa150: b        #0x29fa17c
  0x29fa154: mov      w0, w22
  0x29fa158: mov      w1, w24
  0x29fa15c: mov      w2, w23
  0x29fa160: mov      x3, xzr
  0x29fa164: bl       #0x2cb1bd4 ; -> CFormula$$CalcStat
  0x29fa168: ldr      x8, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x29fa16c: mov      w22, w0
  0x29fa170: ldr      w9, [x8, #0xe0]
  0x29fa174: cbnz     w9, #0x29fa180
  0x29fa178: mov      x0, x8
  0x29fa17c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fa180: mov      w0, w22
  0x29fa184: mov      x1, xzr
  0x29fa188: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fa18c: mov      x23, x1
  0x29fa190: cmp      w21, #1
  0x29fa194: stur     x0, [x19, #0x14]
  0x29fa198: str      w23, [x19, #0x1c]
  0x29fa19c: b.lt     #0x29fa21c
  0x29fa1a0: mov      x22, x0
  0x29fa1a4: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x29fa1a8: adrp     x24, #0x558a000
  0x29fa1ac: ldr      w8, [x0, #0xe0]
  0x29fa1b0: ldr      x24, [x24, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x29fa1b4: cbnz     w8, #0x29fa1bc
  0x29fa1b8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fa1bc: and      x1, x23, #0xffffffff
  0x29fa1c0: mov      x0, x22
  0x29fa1c4: mov      x2, xzr
  0x29fa1c8: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fa1cc: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x29fa1d0: mov      w22, w0
  0x29fa1d4: ldr      w9, [x8, #0xe0]
  0x29fa1d8: cbnz     w9, #0x29fa1e4
  0x29fa1dc: mov      x0, x8
  0x29fa1e0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fa1e4: mov      x9, #0xf7cf
  0x29fa1e8: movk     x9, #0xe353, lsl #16
  0x29fa1ec: add      w8, w21, #0x3e8
  0x29fa1f0: movk     x9, #0x9ba5, lsl #32
  0x29fa1f4: movk     x9, #0x20c4, lsl #48
  0x29fa1f8: smull    x8, w22, w8
  0x29fa1fc: smulh    x8, x8, x9
  0x29fa200: lsr      x9, x8, #0x3f
  0x29fa204: lsr      x8, x8, #7
  0x29fa208: add      w0, w8, w9
  0x29fa20c: mov      x1, xzr
  0x29fa210: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fa214: stur     x0, [x19, #0x14]
  0x29fa218: str      w1, [x19, #0x1c]
  0x29fa21c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x29fa220: ldr      w8, [x0, #0xe0]
  0x29fa224: cbnz     w8, #0x29fa22c
  0x29fa228: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fa22c: mov      w0, w20
  0x29fa230: mov      x1, xzr
  0x29fa234: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fa238: mov      w8, #1
  0x29fa23c: str      x0, [x19, #0x20]
  0x29fa240: str      w1, [x19, #0x28]
  0x29fa244: strb     w8, [x19, #0xe0]
  0x29fa248: ldp      x20, x19, [sp, #0x40]
  0x29fa24c: ldp      x22, x21, [sp, #0x30]
  0x29fa250: ldp      x24, x23, [sp, #0x20]
  0x29fa254: ldp      x26, x25, [sp, #0x10]
  0x29fa258: ldr      x30, [sp], #0x50
  0x29fa25c: ret      
  0x29fa260: bl       #0x21afc18 ; -> ??? 0x21afc18
