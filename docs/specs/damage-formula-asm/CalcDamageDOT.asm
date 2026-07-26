; ===== CalcDamageDOT @ 0x2c5bc6c..0x2c5bdbc (taille 336 octets) =====
  0x2c5bc6c: stp      x30, x25, [sp, #-0x40]!
  0x2c5bc70: stp      x24, x23, [sp, #0x10]
  0x2c5bc74: stp      x22, x21, [sp, #0x20]
  0x2c5bc78: stp      x20, x19, [sp, #0x30]
  0x2c5bc7c: adrp     x23, #0x595a000
  0x2c5bc80: ldrb     w8, [x23, #0x907]
  0x2c5bc84: mov      w19, w3
  0x2c5bc88: mov      w20, w2
  0x2c5bc8c: mov      x21, x1
  0x2c5bc90: mov      x22, x0
  0x2c5bc94: tbnz     w8, #0, #0x2c5bcac
  0x2c5bc98: adrp     x0, #0x550f000
  0x2c5bc9c: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5bca0: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5bca4: mov      w8, #1
  0x2c5bca8: strb     w8, [x23, #0x907]
  0x2c5bcac: cbz      x22, #0x2c5bdb8
  0x2c5bcb0: ldr      x0, [x22, #0x28]
  0x2c5bcb4: cbz      x0, #0x2c5bdb8
  0x2c5bcb8: mov      x1, xzr
  0x2c5bcbc: bl       #0x27e0524 ; -> CCharacterData$$get_PiercePowerRate
  0x2c5bcc0: ldr      x8, [x22, #0x28]
  0x2c5bcc4: cbz      x8, #0x2c5bdb8
  0x2c5bcc8: mov      w22, w0
  0x2c5bccc: mov      x0, x8
  0x2c5bcd0: mov      x1, xzr
  0x2c5bcd4: bl       #0x27e0448 ; -> CCharacterData$$get_PiercePower
  0x2c5bcd8: cbz      x21, #0x2c5bdb8
  0x2c5bcdc: mov      w23, w0
  0x2c5bce0: ldr      x0, [x21, #0x28]
  0x2c5bce4: cbz      x0, #0x2c5bdb8
  0x2c5bce8: adrp     x24, #0x550f000
  0x2c5bcec: ldr      x24, [x24, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5bcf0: mov      x1, xzr
  0x2c5bcf4: bl       #0x27e00d8 ; -> CCharacterData$$get_Def
  0x2c5bcf8: ldr      x8, [x24] ; = 0x0 (u64 @ 0x550f000)
  0x2c5bcfc: mov      w24, w0
  0x2c5bd00: ldr      w9, [x8, #0xe0]
  0x2c5bd04: cbnz     w9, #0x2c5bd10
  0x2c5bd08: mov      x0, x8
  0x2c5bd0c: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5bd10: mov      w25, #0x3e8
  0x2c5bd14: cmp      w22, #0x3e8
  0x2c5bd18: sub      w8, w25, w22
  0x2c5bd1c: csel     w8, w8, wzr, lt
  0x2c5bd20: smull    x8, w24, w8
  0x2c5bd24: mov      w9, #-0x3e8
  0x2c5bd28: mov      x0, #-0x3e58
  0x2c5bd2c: smaddl   x1, w23, w9, x8
  0x2c5bd30: movk     x0, #0xfff0, lsl #16
  0x2c5bd34: mov      x2, xzr
  0x2c5bd38: bl       #0x48a46d8 ; -> System.Math$$Max
  0x2c5bd3c: ldr      x8, [x21, #0x28]
  0x2c5bd40: cbz      x8, #0x2c5bdb8
  0x2c5bd44: mov      x21, x0
  0x2c5bd48: mov      x0, x8
  0x2c5bd4c: mov      x1, xzr
  0x2c5bd50: bl       #0x27e01b4 ; -> CCharacterData$$get_DMGReduceRate
  0x2c5bd54: cmp      w0, #0x384
  0x2c5bd58: mov      w8, #0x384
  0x2c5bd5c: mov      w10, #0x4240
  0x2c5bd60: smull    x9, w20, w19
  0x2c5bd64: movk     w10, #0xf, lsl #16
  0x2c5bd68: csel     w8, w0, w8, lt
  0x2c5bd6c: mov      x11, #0x34db
  0x2c5bd70: movk     x11, #0xd7b6, lsl #16
  0x2c5bd74: mul      x9, x9, x10
  0x2c5bd78: add      x10, x21, x10
  0x2c5bd7c: sub      w8, w25, w8
  0x2c5bd80: movk     x11, #0xde82, lsl #32
  0x2c5bd84: sdiv     x9, x9, x10
  0x2c5bd88: sxtw     x8, w8
  0x2c5bd8c: movk     x11, #0x431b, lsl #48
  0x2c5bd90: mul      x8, x9, x8
  0x2c5bd94: ldp      x20, x19, [sp, #0x30]
  0x2c5bd98: ldp      x22, x21, [sp, #0x20]
  0x2c5bd9c: ldp      x24, x23, [sp, #0x10]
  0x2c5bda0: smulh    x8, x8, x11
  0x2c5bda4: lsr      x9, x8, #0x3f
  0x2c5bda8: lsr      x8, x8, #0x12
  0x2c5bdac: add      w0, w8, w9
  0x2c5bdb0: ldp      x30, x25, [sp], #0x40
  0x2c5bdb4: ret      
  0x2c5bdb8: bl       #0x21849c0 ; -> ??? 0x21849c0
