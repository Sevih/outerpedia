; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcDamageDOT @ 0x2cb3bf0..0x2cb3d40 (taille 336 octets) =====
  0x2cb3bf0: stp      x30, x25, [sp, #-0x40]!
  0x2cb3bf4: stp      x24, x23, [sp, #0x10]
  0x2cb3bf8: stp      x22, x21, [sp, #0x20]
  0x2cb3bfc: stp      x20, x19, [sp, #0x30]
  0x2cb3c00: adrp     x23, #0x59da000
  0x2cb3c04: ldrb     w8, [x23, #0x114]
  0x2cb3c08: mov      w19, w3
  0x2cb3c0c: mov      w20, w2
  0x2cb3c10: mov      x21, x1
  0x2cb3c14: mov      x22, x0
  0x2cb3c18: tbnz     w8, #0, #0x2cb3c30
  0x2cb3c1c: adrp     x0, #0x5588000
  0x2cb3c20: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb3c24: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3c28: mov      w8, #1
  0x2cb3c2c: strb     w8, [x23, #0x114]
  0x2cb3c30: cbz      x22, #0x2cb3d3c
  0x2cb3c34: ldr      x0, [x22, #0x28]
  0x2cb3c38: cbz      x0, #0x2cb3d3c
  0x2cb3c3c: mov      x1, xzr
  0x2cb3c40: bl       #0x2902434 ; -> CCharacterData$$get_PiercePowerRate
  0x2cb3c44: ldr      x8, [x22, #0x28]
  0x2cb3c48: cbz      x8, #0x2cb3d3c
  0x2cb3c4c: mov      w22, w0
  0x2cb3c50: mov      x0, x8
  0x2cb3c54: mov      x1, xzr
  0x2cb3c58: bl       #0x2902358 ; -> CCharacterData$$get_PiercePower
  0x2cb3c5c: cbz      x21, #0x2cb3d3c
  0x2cb3c60: mov      w23, w0
  0x2cb3c64: ldr      x0, [x21, #0x28]
  0x2cb3c68: cbz      x0, #0x2cb3d3c
  0x2cb3c6c: adrp     x24, #0x5588000
  0x2cb3c70: ldr      x24, [x24, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb3c74: mov      x1, xzr
  0x2cb3c78: bl       #0x2901fe8 ; -> CCharacterData$$get_Def
  0x2cb3c7c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5588000)
  0x2cb3c80: mov      w24, w0
  0x2cb3c84: ldr      w9, [x8, #0xe0]
  0x2cb3c88: cbnz     w9, #0x2cb3c94
  0x2cb3c8c: mov      x0, x8
  0x2cb3c90: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3c94: mov      w25, #0x3e8
  0x2cb3c98: cmp      w22, #0x3e8
  0x2cb3c9c: sub      w8, w25, w22
  0x2cb3ca0: csel     w8, w8, wzr, lt
  0x2cb3ca4: smull    x8, w24, w8
  0x2cb3ca8: mov      w9, #-0x3e8
  0x2cb3cac: mov      x0, #-0x3e58
  0x2cb3cb0: smaddl   x1, w23, w9, x8
  0x2cb3cb4: movk     x0, #0xfff0, lsl #16
  0x2cb3cb8: mov      x2, xzr
  0x2cb3cbc: bl       #0x49051c0 ; -> System.Math$$Max
  0x2cb3cc0: ldr      x8, [x21, #0x28]
  0x2cb3cc4: cbz      x8, #0x2cb3d3c
  0x2cb3cc8: mov      x21, x0
  0x2cb3ccc: mov      x0, x8
  0x2cb3cd0: mov      x1, xzr
  0x2cb3cd4: bl       #0x29020c4 ; -> CCharacterData$$get_DMGReduceRate
  0x2cb3cd8: cmp      w0, #0x384
  0x2cb3cdc: mov      w8, #0x384
  0x2cb3ce0: mov      w10, #0x4240
  0x2cb3ce4: smull    x9, w20, w19
  0x2cb3ce8: movk     w10, #0xf, lsl #16
  0x2cb3cec: csel     w8, w0, w8, lt
  0x2cb3cf0: mov      x11, #0x34db
  0x2cb3cf4: movk     x11, #0xd7b6, lsl #16
  0x2cb3cf8: mul      x9, x9, x10
  0x2cb3cfc: add      x10, x21, x10
  0x2cb3d00: sub      w8, w25, w8
  0x2cb3d04: movk     x11, #0xde82, lsl #32
  0x2cb3d08: sdiv     x9, x9, x10
  0x2cb3d0c: sxtw     x8, w8
  0x2cb3d10: movk     x11, #0x431b, lsl #48
  0x2cb3d14: mul      x8, x9, x8
  0x2cb3d18: ldp      x20, x19, [sp, #0x30]
  0x2cb3d1c: ldp      x22, x21, [sp, #0x20]
  0x2cb3d20: ldp      x24, x23, [sp, #0x10]
  0x2cb3d24: smulh    x8, x8, x11
  0x2cb3d28: lsr      x9, x8, #0x3f
  0x2cb3d2c: lsr      x8, x8, #0x12
  0x2cb3d30: add      w0, w8, w9
  0x2cb3d34: ldp      x30, x25, [sp], #0x40
  0x2cb3d38: ret      
  0x2cb3d3c: bl       #0x21afc18 ; -> ??? 0x21afc18
