; ===== FindBuffAdditionalDamage @ 0x26dd9b4..0x26debd8 (taille 4644 octets) =====
  0x26dd9b4: sub      sp, sp, #0x100
  0x26dd9b8: stp      d13, d12, [sp, #0x70]
  0x26dd9bc: stp      d11, d10, [sp, #0x80]
  0x26dd9c0: stp      d9, d8, [sp, #0x90]
  0x26dd9c4: stp      x29, x30, [sp, #0xa0]
  0x26dd9c8: stp      x28, x27, [sp, #0xb0]
  0x26dd9cc: stp      x26, x25, [sp, #0xc0]
  0x26dd9d0: stp      x24, x23, [sp, #0xd0]
  0x26dd9d4: stp      x22, x21, [sp, #0xe0]
  0x26dd9d8: stp      x20, x19, [sp, #0xf0]
  0x26dd9dc: adrp     x20, #0x5957000
  0x26dd9e0: ldrb     w8, [x20, #0xb66]
  0x26dd9e4: mov      x21, x2
  0x26dd9e8: mov      x19, x1
  0x26dd9ec: mov      x22, x0
  0x26dd9f0: tbnz     w8, #0, #0x26dda8c
  0x26dd9f4: adrp     x0, #0x5511000
  0x26dd9f8: ldr      x0, [x0, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x26dd9fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda00: adrp     x0, #0x5511000
  0x26dda04: ldr      x0, [x0, #0xd68] ; = 0x0 (u64 @ 0x5511d68)
  0x26dda08: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda0c: adrp     x0, #0x5511000
  0x26dda10: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26dda14: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda18: adrp     x0, #0x5511000
  0x26dda1c: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26dda20: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda24: adrp     x0, #0x5511000
  0x26dda28: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26dda2c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda30: adrp     x0, #0x5511000
  0x26dda34: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26dda38: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda3c: adrp     x0, #0x5511000
  0x26dda40: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5511850)
  0x26dda44: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda48: adrp     x0, #0x5511000
  0x26dda4c: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x26dda50: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda54: adrp     x0, #0x5511000
  0x26dda58: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26dda5c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda60: adrp     x0, #0x5511000
  0x26dda64: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26dda68: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda6c: adrp     x0, #0x5512000
  0x26dda70: ldr      x0, [x0, #0x330] ; = 0x0 (u64 @ 0x5512330)
  0x26dda74: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda78: adrp     x0, #0x550f000
  0x26dda7c: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26dda80: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dda84: mov      w8, #1
  0x26dda88: strb     w8, [x20, #0xb66]
  0x26dda8c: stp      xzr, xzr, [sp, #0x50]
  0x26dda90: str      xzr, [sp, #0x60]
  0x26dda94: stp      xzr, xzr, [sp, #0x30]
  0x26dda98: str      xzr, [sp, #0x40]
  0x26dda9c: str      wzr, [x19]
  0x26ddaa0: ldr      x0, [x22, #0x380]
  0x26ddaa4: cbz      x0, #0x26de888
  0x26ddaa8: adrp     x8, #0x5511000
  0x26ddaac: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26ddab0: adrp     x29, #0x5511000
  0x26ddab4: ldr      x29, [x29, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26ddab8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26ddabc: add      x8, sp, #0x18
  0x26ddac0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26ddac4: adrp     x23, #0x550f000
  0x26ddac8: ldur     q0, [sp, #0x18]
  0x26ddacc: ldr      x8, [sp, #0x28]
  0x26ddad0: ldr      x23, [x23, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x26ddad4: mov      w28, #0x447a0000
  0x26ddad8: adrp     x20, #0x5955000
  0x26ddadc: fmov     d9, #-0.50000000
  0x26ddae0: fmov     d10, #-1.00000000
  0x26ddae4: mov      x27, #0x7ff0000000000000
  0x26ddae8: fmov     d11, #0.50000000
  0x26ddaec: fmov     d12, #1.00000000
  0x26ddaf0: str      q0, [sp, #0x50]
  0x26ddaf4: str      x8, [sp, #0x60]
  0x26ddaf8: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5511000)
  0x26ddafc: add      x0, sp, #0x50
  0x26ddb00: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26ddb04: tbz      w0, #0, #0x26de7a8
  0x26ddb08: ldr      x24, [sp, #0x60]
  0x26ddb0c: cbz      x24, #0x26de87c
  0x26ddb10: mov      x0, x24
  0x26ddb14: mov      x1, xzr
  0x26ddb18: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddb1c: cmp      w0, #0x55
  0x26ddb20: b.ne     #0x26ddb50
  0x26ddb24: mov      w2, #0x17
  0x26ddb28: mov      x0, x24
  0x26ddb2c: mov      x1, x21
  0x26ddb30: mov      x3, xzr
  0x26ddb34: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddb38: tbz      w0, #0, #0x26ddb50
  0x26ddb3c: ldr      w25, [x19]
  0x26ddb40: mov      x0, x24
  0x26ddb44: mov      x1, xzr
  0x26ddb48: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddb4c: b        #0x26ddbe8
  0x26ddb50: mov      x0, x24
  0x26ddb54: mov      x1, xzr
  0x26ddb58: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddb5c: cmp      w0, #0x56
  0x26ddb60: b.ne     #0x26ddb9c
  0x26ddb64: mov      w2, #0x17
  0x26ddb68: mov      x0, x24
  0x26ddb6c: mov      x1, xzr
  0x26ddb70: mov      x3, xzr
  0x26ddb74: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddb78: tbz      w0, #0, #0x26ddb9c
  0x26ddb7c: ldr      w25, [x19]
  0x26ddb80: mov      x0, x24
  0x26ddb84: mov      x1, xzr
  0x26ddb88: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddb8c: mov      w1, w0
  0x26ddb90: mov      x0, x22
  0x26ddb94: bl       #0x26c6cbc ; -> CCharacterBattle$$GetLostHPRateValue
  0x26ddb98: b        #0x26ddbe8
  0x26ddb9c: mov      x0, x24
  0x26ddba0: mov      x1, xzr
  0x26ddba4: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddba8: cmp      w0, #0x57
  0x26ddbac: b.ne     #0x26ddbf0
  0x26ddbb0: mov      w2, #0x17
  0x26ddbb4: mov      x0, x24
  0x26ddbb8: mov      x1, xzr
  0x26ddbbc: mov      x3, xzr
  0x26ddbc0: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddbc4: tbz      w0, #0, #0x26ddbf0
  0x26ddbc8: ldr      w25, [x19]
  0x26ddbcc: mov      x0, x24
  0x26ddbd0: mov      x1, xzr
  0x26ddbd4: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddbd8: mov      w1, w0
  0x26ddbdc: cbz      x21, #0x26de880
  0x26ddbe0: mov      x0, x21
  0x26ddbe4: bl       #0x26c6cbc ; -> CCharacterBattle$$GetLostHPRateValue
  0x26ddbe8: add      w8, w0, w25
  0x26ddbec: b        #0x26de0c0
  0x26ddbf0: mov      x0, x24
  0x26ddbf4: mov      x1, xzr
  0x26ddbf8: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddbfc: cmp      w0, #0x58
  0x26ddc00: b.ne     #0x26ddc88
  0x26ddc04: mov      w2, #0x17
  0x26ddc08: mov      x0, x24
  0x26ddc0c: mov      x1, xzr
  0x26ddc10: mov      x3, xzr
  0x26ddc14: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddc18: tbz      w0, #0, #0x26ddc88
  0x26ddc1c: ldr      x25, [x22, #0x28]
  0x26ddc20: mov      x0, x24
  0x26ddc24: mov      x1, xzr
  0x26ddc28: bl       #0x22f4ae4 ; -> CBuff$$get_StatType
  0x26ddc2c: mov      w26, w0
  0x26ddc30: mov      x0, x24
  0x26ddc34: mov      x1, xzr
  0x26ddc38: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddc3c: cbz      x25, #0x26de884
  0x26ddc40: mov      w2, w0
  0x26ddc44: mov      x0, x25
  0x26ddc48: mov      w1, w26
  0x26ddc4c: mov      x3, xzr
  0x26ddc50: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x26ddc54: ldrb     w8, [x20, #0xc60]
  0x26ddc58: ldr      w25, [x19]
  0x26ddc5c: mov      w24, w0
  0x26ddc60: cbnz     w8, #0x26ddc74
  0x26ddc64: mov      x0, x23
  0x26ddc68: bl       #0x2184724 ; -> ??? 0x2184724
  0x26ddc6c: mov      w8, #1
  0x26ddc70: strb     w8, [x20, #0xc60]
  0x26ddc74: ldr      x0, [x23] ; = 0x0 (u64 @ 0x550f000)
  0x26ddc78: ldr      w8, [x0, #0xe0]
  0x26ddc7c: cbnz     w8, #0x26dddf0
  0x26ddc80: bl       #0x218489c ; -> ??? 0x218489c
  0x26ddc84: b        #0x26dddf0
  0x26ddc88: mov      x0, x24
  0x26ddc8c: mov      x1, xzr
  0x26ddc90: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddc94: cmp      w0, #0x59
  0x26ddc98: b.ne     #0x26ddd24
  0x26ddc9c: mov      w2, #0x17
  0x26ddca0: mov      x0, x24
  0x26ddca4: mov      x1, xzr
  0x26ddca8: mov      x3, xzr
  0x26ddcac: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddcb0: tbz      w0, #0, #0x26ddd24
  0x26ddcb4: cbz      x21, #0x26de88c
  0x26ddcb8: ldr      x25, [x21, #0x28]
  0x26ddcbc: mov      x0, x24
  0x26ddcc0: mov      x1, xzr
  0x26ddcc4: bl       #0x22f4ae4 ; -> CBuff$$get_StatType
  0x26ddcc8: mov      w26, w0
  0x26ddccc: mov      x0, x24
  0x26ddcd0: mov      x1, xzr
  0x26ddcd4: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddcd8: cbz      x25, #0x26de890
  0x26ddcdc: mov      w2, w0
  0x26ddce0: mov      x0, x25
  0x26ddce4: mov      w1, w26
  0x26ddce8: mov      x3, xzr
  0x26ddcec: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x26ddcf0: ldrb     w8, [x20, #0xc60]
  0x26ddcf4: ldr      w25, [x19]
  0x26ddcf8: mov      w24, w0
  0x26ddcfc: cbnz     w8, #0x26ddd10
  0x26ddd00: mov      x0, x23
  0x26ddd04: bl       #0x2184724 ; -> ??? 0x2184724
  0x26ddd08: mov      w8, #1
  0x26ddd0c: strb     w8, [x20, #0xc60]
  0x26ddd10: ldr      x0, [x23] ; = 0x0 (u64 @ 0x550f000)
  0x26ddd14: ldr      w8, [x0, #0xe0]
  0x26ddd18: cbnz     w8, #0x26dddf0
  0x26ddd1c: bl       #0x218489c ; -> ??? 0x218489c
  0x26ddd20: b        #0x26dddf0
  0x26ddd24: mov      x0, x24
  0x26ddd28: mov      x1, xzr
  0x26ddd2c: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddd30: cmp      w0, #0x66
  0x26ddd34: b.ne     #0x26dde2c
  0x26ddd38: mov      w2, #0x17
  0x26ddd3c: mov      x0, x24
  0x26ddd40: mov      x1, xzr
  0x26ddd44: mov      x3, xzr
  0x26ddd48: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddd4c: tbz      w0, #0, #0x26dde2c
  0x26ddd50: adrp     x8, #0x550f000
  0x26ddd54: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26ddd58: ldr      x25, [x24, #0x18]
  0x26ddd5c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26ddd60: ldr      w8, [x0, #0xe0]
  0x26ddd64: cbnz     w8, #0x26ddd6c
  0x26ddd68: bl       #0x218489c ; -> ??? 0x218489c
  0x26ddd6c: mov      x0, x25
  0x26ddd70: mov      x1, xzr
  0x26ddd74: mov      x2, xzr
  0x26ddd78: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x26ddd7c: tbz      w0, #0, #0x26ddaf8
  0x26ddd80: ldr      x8, [x24, #0x18]
  0x26ddd84: cbz      x8, #0x26de898
  0x26ddd88: ldr      x25, [x8, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x26ddd8c: cbz      x25, #0x26ddaf8
  0x26ddd90: mov      x0, x24
  0x26ddd94: mov      x1, xzr
  0x26ddd98: bl       #0x22f4ae4 ; -> CBuff$$get_StatType
  0x26ddd9c: mov      w26, w0
  0x26ddda0: mov      x0, x24
  0x26ddda4: mov      x1, xzr
  0x26ddda8: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26dddac: mov      w2, w0
  0x26dddb0: mov      x0, x25
  0x26dddb4: mov      w1, w26
  0x26dddb8: mov      x3, xzr
  0x26dddbc: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x26dddc0: ldrb     w8, [x20, #0xc60]
  0x26dddc4: ldr      w25, [x19]
  0x26dddc8: mov      w24, w0
  0x26dddcc: cbnz     w8, #0x26ddde0
  0x26dddd0: mov      x0, x23
  0x26dddd4: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dddd8: mov      w8, #1
  0x26ddddc: strb     w8, [x20, #0xc60]
  0x26ddde0: ldr      x0, [x23] ; = 0x0 (u64 @ 0x550f000)
  0x26ddde4: ldr      w8, [x0, #0xe0]
  0x26ddde8: cbnz     w8, #0x26dddf0
  0x26dddec: bl       #0x218489c ; -> ??? 0x218489c
  0x26dddf0: scvtf    s0, w24
  0x26dddf4: fmov     s1, w28
  0x26dddf8: fminnm   s13, s0, s1
  0x26dddfc: fcvt     d8, s13
  0x26dde00: add      x0, sp, #0x18
  0x26dde04: mov      v0.16b, v8.16b
  0x26dde08: bl       #0x51eab50 ; -> ??? 0x51eab50
  0x26dde0c: fcmp     s13, #0.0
  0x26dde10: b.ge     #0x26dded0
  0x26dde14: fcmp     d0, d9
  0x26dde18: b.ne     #0x26de094
  0x26dde1c: ldr      d0, [sp, #0x18]
  0x26dde20: fcvtzs   x8, d0
  0x26dde24: fadd     d1, d0, d10
  0x26dde28: b        #0x26ddee4
  0x26dde2c: mov      x0, x24
  0x26dde30: mov      x1, xzr
  0x26dde34: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26dde38: cmp      w0, #0x5a
  0x26dde3c: b.ne     #0x26dde7c
  0x26dde40: mov      w2, #0x17
  0x26dde44: mov      x0, x24
  0x26dde48: mov      x1, xzr
  0x26dde4c: mov      x3, xzr
  0x26dde50: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26dde54: tbz      w0, #0, #0x26dde7c
  0x26dde58: ldr      w26, [x19]
  0x26dde5c: mov      x0, x22
  0x26dde60: mov      w1, wzr
  0x26dde64: bl       #0x26dc260 ; -> CCharacterBattle$$GetBuffCount
  0x26dde68: mov      w25, w0
  0x26dde6c: mov      x0, x24
  0x26dde70: mov      x1, xzr
  0x26dde74: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26dde78: b        #0x26ddf90
  0x26dde7c: mov      x0, x24
  0x26dde80: mov      x1, xzr
  0x26dde84: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26dde88: cmp      w0, #0x5b
  0x26dde8c: b.ne     #0x26ddef0
  0x26dde90: mov      w2, #0x17
  0x26dde94: mov      x0, x24
  0x26dde98: mov      x1, xzr
  0x26dde9c: mov      x3, xzr
  0x26ddea0: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddea4: tbz      w0, #0, #0x26ddef0
  0x26ddea8: ldr      x0, [x22, #0x348]
  0x26ddeac: cbz      x0, #0x26de894
  0x26ddeb0: ldr      w26, [x19]
  0x26ddeb4: mov      w1, wzr
  0x26ddeb8: bl       #0x26dc260 ; -> CCharacterBattle$$GetBuffCount
  0x26ddebc: mov      w25, w0
  0x26ddec0: mov      x0, x24
  0x26ddec4: mov      x1, xzr
  0x26ddec8: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddecc: b        #0x26ddf90
  0x26dded0: fcmp     d0, d11
  0x26dded4: b.ne     #0x26de0a0
  0x26dded8: ldr      d0, [sp, #0x18]
  0x26ddedc: fcvtzs   x8, d0
  0x26ddee0: fadd     d1, d0, d12
  0x26ddee4: tst      x8, #1
  0x26ddee8: fcsel    d0, d0, d1, eq
  0x26ddeec: b        #0x26de0a8
  0x26ddef0: mov      x0, x24
  0x26ddef4: mov      x1, xzr
  0x26ddef8: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddefc: cmp      w0, #0x5c
  0x26ddf00: b.ne     #0x26ddf40
  0x26ddf04: mov      w2, #0x17
  0x26ddf08: mov      x0, x24
  0x26ddf0c: mov      x1, xzr
  0x26ddf10: mov      x3, xzr
  0x26ddf14: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddf18: tbz      w0, #0, #0x26ddf40
  0x26ddf1c: ldr      w26, [x19]
  0x26ddf20: mov      w1, #1
  0x26ddf24: mov      x0, x22
  0x26ddf28: bl       #0x26dc260 ; -> CCharacterBattle$$GetBuffCount
  0x26ddf2c: mov      w25, w0
  0x26ddf30: mov      x0, x24
  0x26ddf34: mov      x1, xzr
  0x26ddf38: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddf3c: b        #0x26ddf90
  0x26ddf40: mov      x0, x24
  0x26ddf44: mov      x1, xzr
  0x26ddf48: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddf4c: cmp      w0, #0x5d
  0x26ddf50: b.ne     #0x26ddf98
  0x26ddf54: mov      w2, #0x17
  0x26ddf58: mov      x0, x24
  0x26ddf5c: mov      x1, xzr
  0x26ddf60: mov      x3, xzr
  0x26ddf64: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddf68: tbz      w0, #0, #0x26ddf98
  0x26ddf6c: ldr      x0, [x22, #0x348]
  0x26ddf70: cbz      x0, #0x26de89c
  0x26ddf74: ldr      w26, [x19]
  0x26ddf78: mov      w1, #1
  0x26ddf7c: bl       #0x26dc260 ; -> CCharacterBattle$$GetBuffCount
  0x26ddf80: mov      w25, w0
  0x26ddf84: mov      x0, x24
  0x26ddf88: mov      x1, xzr
  0x26ddf8c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddf90: madd     w8, w0, w25, w26
  0x26ddf94: b        #0x26de0c0
  0x26ddf98: mov      x0, x24
  0x26ddf9c: mov      x1, xzr
  0x26ddfa0: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ddfa4: cmp      w0, #0x61
  0x26ddfa8: b.ne     #0x26ddff4
  0x26ddfac: mov      w2, #0x17
  0x26ddfb0: mov      x0, x24
  0x26ddfb4: mov      x1, xzr
  0x26ddfb8: mov      x3, xzr
  0x26ddfbc: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ddfc0: tbz      w0, #0, #0x26ddff4
  0x26ddfc4: ldr      x8, [x22, #0x348]
  0x26ddfc8: cbz      x8, #0x26de8a4
  0x26ddfcc: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x550f378)
  0x26ddfd0: cbz      x0, #0x26de8a0
  0x26ddfd4: mov      x1, xzr
  0x26ddfd8: bl       #0x24cc4f8 ; -> CRageManager$$get_IsBreak
  0x26ddfdc: tbz      w0, #0, #0x26ddff4
  0x26ddfe0: ldr      w25, [x19]
  0x26ddfe4: mov      x0, x24
  0x26ddfe8: mov      x1, xzr
  0x26ddfec: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ddff0: b        #0x26ddbe8
  0x26ddff4: mov      x0, x24
  0x26ddff8: mov      x1, xzr
  0x26ddffc: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de000: cmp      w0, #0x62
  0x26de004: b.ne     #0x26de054
  0x26de008: mov      w2, #0x17
  0x26de00c: mov      x0, x24
  0x26de010: mov      x1, xzr
  0x26de014: mov      x3, xzr
  0x26de018: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de01c: tbz      w0, #0, #0x26de054
  0x26de020: ldr      x8, [x22, #0x348]
  0x26de024: cbz      x8, #0x26de8a8
  0x26de028: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x26de02c: cbz      x0, #0x26de054
  0x26de030: mov      x1, xzr
  0x26de034: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26de038: cmp      w0, #3
  0x26de03c: b.le     #0x26de054
  0x26de040: ldr      w25, [x19]
  0x26de044: mov      x0, x24
  0x26de048: mov      x1, xzr
  0x26de04c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de050: b        #0x26ddbe8
  0x26de054: mov      x0, x24
  0x26de058: mov      x1, xzr
  0x26de05c: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de060: cmp      w0, #0x63
  0x26de064: b.ne     #0x26de0c8
  0x26de068: mov      w2, #0x17
  0x26de06c: mov      x0, x24
  0x26de070: mov      x1, x21
  0x26de074: mov      x3, xzr
  0x26de078: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de07c: tbz      w0, #0, #0x26de0c8
  0x26de080: ldr      w25, [x19]
  0x26de084: mov      x0, x24
  0x26de088: mov      x1, xzr
  0x26de08c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de090: b        #0x26ddbe8
  0x26de094: fadd     d0, d8, d9
  0x26de098: frintp   d0, d0
  0x26de09c: b        #0x26de0a8
  0x26de0a0: fadd     d0, d8, d11
  0x26de0a4: frintm   d0, d0
  0x26de0a8: fmov     d1, x27
  0x26de0ac: fcvtzs   w8, d0
  0x26de0b0: fcmp     d0, d1
  0x26de0b4: mov      w9, #-0xffffffff80000000
  0x26de0b8: csel     w8, w9, w8, eq
  0x26de0bc: add      w8, w8, w25
  0x26de0c0: str      w8, [x19]
  0x26de0c4: b        #0x26ddaf8
  0x26de0c8: mov      x0, x24
  0x26de0cc: mov      x1, xzr
  0x26de0d0: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de0d4: cmp      w0, #0x64
  0x26de0d8: b.ne     #0x26de13c
  0x26de0dc: mov      w2, #0x17
  0x26de0e0: mov      x0, x24
  0x26de0e4: mov      x1, xzr
  0x26de0e8: mov      x3, xzr
  0x26de0ec: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de0f0: tbz      w0, #0, #0x26de13c
  0x26de0f4: cbz      x21, #0x26de8b0
  0x26de0f8: mov      x0, x21
  0x26de0fc: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26de100: cbz      x0, #0x26de8ac
  0x26de104: ldr      w8, [x0, #0x3c]
  0x26de108: cmp      w8, #1
  0x26de10c: b.eq     #0x26de128
  0x26de110: mov      x0, x21
  0x26de114: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26de118: cbz      x0, #0x26de8b8
  0x26de11c: ldr      w8, [x0, #0x3c]
  0x26de120: cmp      w8, #3
  0x26de124: b.ne     #0x26de13c
  0x26de128: ldr      w25, [x19]
  0x26de12c: mov      x0, x24
  0x26de130: mov      x1, xzr
  0x26de134: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de138: b        #0x26ddbe8
  0x26de13c: mov      x0, x24
  0x26de140: mov      x1, xzr
  0x26de144: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de148: cmp      w0, #0x65
  0x26de14c: b.ne     #0x26de1c4
  0x26de150: mov      w2, #0x17
  0x26de154: mov      x0, x24
  0x26de158: mov      x1, xzr
  0x26de15c: mov      x3, xzr
  0x26de160: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de164: tbz      w0, #0, #0x26de1c4
  0x26de168: adrp     x8, #0x5955000
  0x26de16c: ldrb     w8, [x8, #0x8f3]
  0x26de170: cbnz     w8, #0x26de18c
  0x26de174: adrp     x0, #0x5511000
  0x26de178: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de17c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de180: adrp     x8, #0x5955000
  0x26de184: mov      w9, #1
  0x26de188: strb     w9, [x8, #0x8f3]
  0x26de18c: adrp     x8, #0x5511000
  0x26de190: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de194: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de198: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de19c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de1a0: cbz      x0, #0x26de8b4
  0x26de1a4: mov      x1, xzr
  0x26de1a8: bl       #0x2548c30 ; -> CDungeonScene$$get_IsPvp
  0x26de1ac: tbz      w0, #0, #0x26de1c4
  0x26de1b0: ldr      w25, [x19]
  0x26de1b4: mov      x0, x24
  0x26de1b8: mov      x1, xzr
  0x26de1bc: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de1c0: b        #0x26ddbe8
  0x26de1c4: mov      x0, x24
  0x26de1c8: mov      x1, xzr
  0x26de1cc: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de1d0: cmp      w0, #0x67
  0x26de1d4: b.ne     #0x26de254
  0x26de1d8: mov      w2, #0x17
  0x26de1dc: mov      x0, x24
  0x26de1e0: mov      x1, xzr
  0x26de1e4: mov      x3, xzr
  0x26de1e8: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de1ec: tbz      w0, #0, #0x26de254
  0x26de1f0: adrp     x8, #0x550f000
  0x26de1f4: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de1f8: ldr      x25, [x24, #0x18]
  0x26de1fc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26de200: ldr      w8, [x0, #0xe0]
  0x26de204: cbnz     w8, #0x26de20c
  0x26de208: bl       #0x218489c ; -> ??? 0x218489c
  0x26de20c: mov      x0, x25
  0x26de210: mov      x1, xzr
  0x26de214: mov      x2, xzr
  0x26de218: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x26de21c: tbz      w0, #0, #0x26ddaf8
  0x26de220: ldr      x25, [x24, #0x18]
  0x26de224: cbz      x25, #0x26de8e4
  0x26de228: ldr      x8, [x25, #0x28]
  0x26de22c: cbz      x8, #0x26ddaf8
  0x26de230: ldr      w26, [x19]
  0x26de234: mov      x0, x24
  0x26de238: mov      x1, xzr
  0x26de23c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de240: mov      w1, w0
  0x26de244: mov      x0, x25
  0x26de248: bl       #0x26c6cbc ; -> CCharacterBattle$$GetLostHPRateValue
  0x26de24c: add      w8, w0, w26
  0x26de250: b        #0x26de0c0
  0x26de254: mov      x0, x24
  0x26de258: mov      x1, xzr
  0x26de25c: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de260: cmp      w0, #0x69
  0x26de264: b.ne     #0x26de380
  0x26de268: mov      w2, #0x17
  0x26de26c: mov      x0, x24
  0x26de270: mov      x1, xzr
  0x26de274: mov      x3, xzr
  0x26de278: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de27c: tbz      w0, #0, #0x26de380
  0x26de280: adrp     x8, #0x550f000
  0x26de284: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de288: ldr      x25, [x24, #0x20]
  0x26de28c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26de290: ldr      w8, [x0, #0xe0]
  0x26de294: cbnz     w8, #0x26de29c
  0x26de298: bl       #0x218489c ; -> ??? 0x218489c
  0x26de29c: mov      x0, x25
  0x26de2a0: mov      x1, xzr
  0x26de2a4: mov      x2, xzr
  0x26de2a8: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26de2ac: tbnz     w0, #0, #0x26ddaf8
  0x26de2b0: ldr      x0, [x24, #0x20]
  0x26de2b4: cbz      x0, #0x26de8e8
  0x26de2b8: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x26de2bc: cbz      x8, #0x26ddaf8
  0x26de2c0: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x26de2c4: cbz      x0, #0x26ddaf8
  0x26de2c8: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x26de2cc: cbz      x0, #0x26de924
  0x26de2d0: adrp     x8, #0x5511000
  0x26de2d4: ldr      x8, [x8, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26de2d8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de2dc: add      x8, sp, #0x18
  0x26de2e0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26de2e4: ldur     q0, [sp, #0x18]
  0x26de2e8: ldr      x8, [sp, #0x28]
  0x26de2ec: str      wzr, [sp, #0x14]
  0x26de2f0: str      q0, [sp, #0x30]
  0x26de2f4: str      x8, [sp, #0x40]
  0x26de2f8: adrp     x8, #0x5511000
  0x26de2fc: ldr      x8, [x8, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26de300: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de304: add      x0, sp, #0x30
  0x26de308: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26de30c: tbz      w0, #0, #0x26de674
  0x26de310: adrp     x8, #0x550f000
  0x26de314: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de318: ldr      x25, [sp, #0x40]
  0x26de31c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26de320: ldr      w8, [x0, #0xe0]
  0x26de324: cbnz     w8, #0x26de32c
  0x26de328: bl       #0x218489c ; -> ??? 0x218489c
  0x26de32c: mov      x0, x25
  0x26de330: mov      x1, xzr
  0x26de334: mov      x2, xzr
  0x26de338: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26de33c: tbnz     w0, #0, #0x26de2f8
  0x26de340: cbz      x25, #0x26de708
  0x26de344: mov      x0, x25
  0x26de348: mov      w1, wzr
  0x26de34c: bl       #0x26db9a8 ; -> CCharacterBattle$$GetBuffList
  0x26de350: adrp     x8, #0x5511000
  0x26de354: ldr      x8, [x8, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x26de358: mov      x25, x0
  0x26de35c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de360: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x26de364: tbnz     w0, #0, #0x26de2f8
  0x26de368: cbz      x25, #0x26de718
  0x26de36c: ldr      w8, [x25, #0x18]
  0x26de370: ldr      w9, [sp, #0x14]
  0x26de374: add      w9, w8, w9
  0x26de378: str      w9, [sp, #0x14]
  0x26de37c: b        #0x26de2f8
  0x26de380: mov      x0, x24
  0x26de384: mov      x1, xzr
  0x26de388: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de38c: cmp      w0, #0x6a
  0x26de390: b.ne     #0x26de490
  0x26de394: mov      w2, #0x17
  0x26de398: mov      x0, x24
  0x26de39c: mov      x1, xzr
  0x26de3a0: mov      x3, xzr
  0x26de3a4: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de3a8: tbz      w0, #0, #0x26de490
  0x26de3ac: adrp     x8, #0x550f000
  0x26de3b0: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de3b4: ldr      x25, [x24, #0x20]
  0x26de3b8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26de3bc: ldr      w8, [x0, #0xe0]
  0x26de3c0: cbnz     w8, #0x26de3c8
  0x26de3c4: bl       #0x218489c ; -> ??? 0x218489c
  0x26de3c8: mov      x0, x25
  0x26de3cc: mov      x1, xzr
  0x26de3d0: mov      x2, xzr
  0x26de3d4: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26de3d8: tbnz     w0, #0, #0x26ddaf8
  0x26de3dc: ldr      x0, [x24, #0x20]
  0x26de3e0: cbz      x0, #0x26de8ec
  0x26de3e4: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x26de3e8: cbz      x8, #0x26ddaf8
  0x26de3ec: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x26de3f0: cbz      x0, #0x26ddaf8
  0x26de3f4: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x26de3f8: cbz      x0, #0x26de930
  0x26de3fc: adrp     x8, #0x5511000
  0x26de400: ldr      x8, [x8, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26de404: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de408: add      x8, sp, #0x18
  0x26de40c: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26de410: ldur     q0, [sp, #0x18]
  0x26de414: ldr      x8, [sp, #0x28]
  0x26de418: str      wzr, [sp, #0x14]
  0x26de41c: str      q0, [sp, #0x30]
  0x26de420: str      x8, [sp, #0x40]
  0x26de424: adrp     x8, #0x5511000
  0x26de428: ldr      x8, [x8, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26de42c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de430: add      x0, sp, #0x30
  0x26de434: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26de438: tbz      w0, #0, #0x26de6b8
  0x26de43c: adrp     x8, #0x550f000
  0x26de440: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de444: ldr      x25, [sp, #0x40]
  0x26de448: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26de44c: ldr      w8, [x0, #0xe0]
  0x26de450: cbnz     w8, #0x26de458
  0x26de454: bl       #0x218489c ; -> ??? 0x218489c
  0x26de458: mov      x0, x25
  0x26de45c: mov      x1, xzr
  0x26de460: mov      x2, xzr
  0x26de464: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26de468: tbnz     w0, #0, #0x26de424
  0x26de46c: cbz      x25, #0x26de710
  0x26de470: mov      x0, x25
  0x26de474: mov      x1, xzr
  0x26de478: bl       #0x27d18b4 ; -> CCharacter$$get_IsAlive
  0x26de47c: ldr      w9, [sp, #0x14]
  0x26de480: and      w8, w0, #1
  0x26de484: add      w9, w9, w8
  0x26de488: str      w9, [sp, #0x14]
  0x26de48c: b        #0x26de424
  0x26de490: mov      x0, x24
  0x26de494: mov      x1, xzr
  0x26de498: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de49c: cmp      w0, #0x6b
  0x26de4a0: b.ne     #0x26de57c
  0x26de4a4: mov      w2, #0x17
  0x26de4a8: mov      x0, x24
  0x26de4ac: mov      x1, xzr
  0x26de4b0: mov      x3, xzr
  0x26de4b4: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de4b8: tbz      w0, #0, #0x26de57c
  0x26de4bc: adrp     x8, #0x5955000
  0x26de4c0: ldrb     w8, [x8, #0x8f3]
  0x26de4c4: cbnz     w8, #0x26de4e0
  0x26de4c8: adrp     x0, #0x5511000
  0x26de4cc: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de4d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de4d4: adrp     x8, #0x5955000
  0x26de4d8: mov      w9, #1
  0x26de4dc: strb     w9, [x8, #0x8f3]
  0x26de4e0: adrp     x8, #0x5511000
  0x26de4e4: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de4e8: adrp     x9, #0x550f000
  0x26de4ec: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de4f0: ldr      x9, [x9, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de4f4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de4f8: ldr      x0, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x26de4fc: ldr      x25, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de500: ldr      w9, [x0, #0xe0]
  0x26de504: cbnz     w9, #0x26de50c
  0x26de508: bl       #0x218489c ; -> ??? 0x218489c
  0x26de50c: mov      x0, x25
  0x26de510: mov      x1, xzr
  0x26de514: mov      x2, xzr
  0x26de518: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x26de51c: tbz      w0, #0, #0x26de57c
  0x26de520: adrp     x8, #0x5955000
  0x26de524: ldrb     w8, [x8, #0x8f3]
  0x26de528: cbnz     w8, #0x26de544
  0x26de52c: adrp     x0, #0x5511000
  0x26de530: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de534: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de538: adrp     x8, #0x5955000
  0x26de53c: mov      w9, #1
  0x26de540: strb     w9, [x8, #0x8f3]
  0x26de544: adrp     x8, #0x5511000
  0x26de548: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de54c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de550: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de554: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de558: cbz      x0, #0x26de918
  0x26de55c: mov      x1, xzr
  0x26de560: bl       #0x2551044 ; -> CDungeonScene$$get_IsMonadGate
  0x26de564: tbz      w0, #0, #0x26de57c
  0x26de568: ldr      w25, [x19]
  0x26de56c: mov      x0, x24
  0x26de570: mov      x1, xzr
  0x26de574: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de578: b        #0x26ddbe8
  0x26de57c: mov      x0, x24
  0x26de580: mov      x1, xzr
  0x26de584: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26de588: cmp      w0, #0x6c
  0x26de58c: b.ne     #0x26ddaf8
  0x26de590: mov      w2, #0x17
  0x26de594: mov      x0, x24
  0x26de598: mov      x1, xzr
  0x26de59c: mov      x3, xzr
  0x26de5a0: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26de5a4: tbz      w0, #0, #0x26ddaf8
  0x26de5a8: adrp     x8, #0x5955000
  0x26de5ac: ldrb     w8, [x8, #0x8f3]
  0x26de5b0: cbnz     w8, #0x26de5cc
  0x26de5b4: adrp     x0, #0x5511000
  0x26de5b8: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de5bc: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de5c0: adrp     x8, #0x5955000
  0x26de5c4: mov      w9, #1
  0x26de5c8: strb     w9, [x8, #0x8f3]
  0x26de5cc: adrp     x8, #0x5511000
  0x26de5d0: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de5d4: adrp     x9, #0x550f000
  0x26de5d8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de5dc: ldr      x9, [x9, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26de5e0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de5e4: ldr      x0, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x26de5e8: ldr      x25, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de5ec: ldr      w9, [x0, #0xe0]
  0x26de5f0: cbnz     w9, #0x26de5f8
  0x26de5f4: bl       #0x218489c ; -> ??? 0x218489c
  0x26de5f8: mov      x0, x25
  0x26de5fc: mov      x1, xzr
  0x26de600: mov      x2, xzr
  0x26de604: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x26de608: tbz      w0, #0, #0x26ddaf8
  0x26de60c: adrp     x8, #0x5955000
  0x26de610: ldrb     w8, [x8, #0x8f3]
  0x26de614: cbnz     w8, #0x26de630
  0x26de618: adrp     x0, #0x5511000
  0x26de61c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de620: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de624: adrp     x8, #0x5955000
  0x26de628: mov      w9, #1
  0x26de62c: strb     w9, [x8, #0x8f3]
  0x26de630: adrp     x8, #0x5511000
  0x26de634: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de638: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de63c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de640: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de644: cbz      x8, #0x26de920
  0x26de648: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x5511020)
  0x26de64c: cbz      x8, #0x26de91c
  0x26de650: ldr      w0, [x8, #0xa4]
  0x26de654: mov      x1, xzr
  0x26de658: bl       #0x2c58ce8 ; -> CExtension$$IsTowerModes
  0x26de65c: tbz      w0, #0, #0x26ddaf8
  0x26de660: ldr      w25, [x19]
  0x26de664: mov      x0, x24
  0x26de668: mov      x1, xzr
  0x26de66c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de670: b        #0x26ddbe8
  0x26de674: mov      x25, xzr
  0x26de678: mov      w26, #0x18
  0x26de67c: adrp     x8, #0x5511000
  0x26de680: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26de684: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de688: add      x0, sp, #0x30
  0x26de68c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de690: cbnz     x25, #0x26de928
  0x26de694: cmp      w26, #0x18
  0x26de698: b.eq     #0x26de6a0
  0x26de69c: cbnz     w26, #0x26de860
  0x26de6a0: ldr      w25, [x19]
  0x26de6a4: mov      x0, x24
  0x26de6a8: mov      x1, xzr
  0x26de6ac: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de6b0: ldr      w8, [sp, #0x14]
  0x26de6b4: b        #0x26de700
  0x26de6b8: mov      x25, xzr
  0x26de6bc: mov      w26, #0x1c
  0x26de6c0: adrp     x8, #0x5511000
  0x26de6c4: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26de6c8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de6cc: add      x0, sp, #0x30
  0x26de6d0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de6d4: cbnz     x25, #0x26de934
  0x26de6d8: cmp      w26, #0x1c
  0x26de6dc: b.eq     #0x26de6e4
  0x26de6e0: cbnz     w26, #0x26de860
  0x26de6e4: ldr      w25, [x19]
  0x26de6e8: mov      x0, x24
  0x26de6ec: mov      x1, xzr
  0x26de6f0: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26de6f4: ldr      w9, [sp, #0x14]
  0x26de6f8: mov      w8, #4
  0x26de6fc: sub      w8, w8, w9
  0x26de700: madd     w8, w0, w8, w25
  0x26de704: b        #0x26de0c0
  0x26de708: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de70c: b        #0x26de93c
  0x26de710: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de714: b        #0x26de93c
  0x26de718: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de71c: b        #0x26de93c
  0x26de720: b        #0x26de778
  0x26de724: b        #0x26de744
  0x26de728: b        #0x26de744
  0x26de72c: b        #0x26de744
  0x26de730: b        #0x26de778
  0x26de734: b        #0x26de778
  0x26de738: b        #0x26de778
  0x26de73c: b        #0x26de778
  0x26de740: b        #0x26de744
  0x26de744: mov      x26, x1
  0x26de748: mov      x25, x0
  0x26de74c: cmp      w26, #1
  0x26de750: b.ne     #0x26de8f0
  0x26de754: mov      x0, x25
  0x26de758: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26de75c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x26de760: str      x8, [sp, #8]
  0x26de764: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26de768: ldr      x25, [sp, #8]
  0x26de76c: mov      w26, wzr
  0x26de770: b        #0x26de6c0
  0x26de774: b        #0x26de778
  0x26de778: mov      x26, x1
  0x26de77c: mov      x25, x0
  0x26de780: cmp      w26, #1
  0x26de784: b.ne     #0x26de8bc
  0x26de788: mov      x0, x25
  0x26de78c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26de790: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x26de794: str      x8, [sp, #8]
  0x26de798: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26de79c: ldr      x25, [sp, #8]
  0x26de7a0: mov      w26, wzr
  0x26de7a4: b        #0x26de67c
  0x26de7a8: adrp     x8, #0x5511000
  0x26de7ac: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26de7b0: add      x0, sp, #0x50
  0x26de7b4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de7b8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de7bc: adrp     x20, #0x5955000
  0x26de7c0: ldrb     w8, [x20, #0x8f3]
  0x26de7c4: cbnz     w8, #0x26de7dc
  0x26de7c8: adrp     x0, #0x5511000
  0x26de7cc: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de7d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26de7d4: mov      w8, #1
  0x26de7d8: strb     w8, [x20, #0x8f3]
  0x26de7dc: adrp     x8, #0x5511000
  0x26de7e0: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26de7e4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de7e8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26de7ec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de7f0: cbz      x0, #0x26de888
  0x26de7f4: mov      x1, xzr
  0x26de7f8: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x26de7fc: tbz      w0, #0, #0x26de834
  0x26de800: adrp     x8, #0x5511000
  0x26de804: ldr      w20, [x19]
  0x26de808: ldr      x8, [x8, #0xd68] ; = 0x0 (u64 @ 0x5511d68)
  0x26de80c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de810: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x26de814: cbz      x0, #0x26de888
  0x26de818: mov      x1, xzr
  0x26de81c: bl       #0x2514f84 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x26de820: cbz      x0, #0x26de888
  0x26de824: mov      x1, xzr
  0x26de828: bl       #0x251d4f0 ; -> CPvpRealtimeMatch$$get_FieldSkillDmg
  0x26de82c: add      w8, w0, w20
  0x26de830: str      w8, [x19]
  0x26de834: ldp      x20, x19, [sp, #0xf0]
  0x26de838: ldp      x22, x21, [sp, #0xe0]
  0x26de83c: ldp      x24, x23, [sp, #0xd0]
  0x26de840: ldp      x26, x25, [sp, #0xc0]
  0x26de844: ldp      x28, x27, [sp, #0xb0]
  0x26de848: ldp      x29, x30, [sp, #0xa0]
  0x26de84c: ldp      d9, d8, [sp, #0x90]
  0x26de850: ldp      d11, d10, [sp, #0x80]
  0x26de854: ldp      d13, d12, [sp, #0x70]
  0x26de858: add      sp, sp, #0x100
  0x26de85c: ret      
  0x26de860: adrp     x8, #0x5511000
  0x26de864: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26de868: add      x0, sp, #0x50
  0x26de86c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de870: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de874: cbnz     w26, #0x26de834
  0x26de878: b        #0x26de7bc
  0x26de87c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de880: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de884: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de888: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de88c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de890: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de894: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de898: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de89c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8a0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8a4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8a8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8ac: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8b0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8b4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8b8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8bc: str      xzr, [sp, #8]
  0x26de8c0: adrp     x8, #0x5511000
  0x26de8c4: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26de8c8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de8cc: add      x0, sp, #0x30
  0x26de8d0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de8d4: ldr      x8, [sp, #8]
  0x26de8d8: cbz      x8, #0x26deb5c
  0x26de8dc: ldr      x0, [sp, #8]
  0x26de8e0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26de8e4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8e8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8ec: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de8f0: str      xzr, [sp, #8]
  0x26de8f4: adrp     x8, #0x5511000
  0x26de8f8: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26de8fc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26de900: add      x0, sp, #0x30
  0x26de904: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26de908: ldr      x8, [sp, #8]
  0x26de90c: cbz      x8, #0x26deb5c
  0x26de910: ldr      x0, [sp, #8]
  0x26de914: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26de918: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de91c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de920: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de924: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de928: mov      x0, x25
  0x26de92c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26de930: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26de934: mov      x0, x25
  0x26de938: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26de93c: mov      x25, x0
  0x26de940: mov      w26, w1
  0x26de944: b        #0x26de8f4
  0x26de948: mov      x25, x0
  0x26de94c: mov      w26, w1
  0x26de950: b        #0x26de8c0
  0x26de954: b        #0x26debcc
  0x26de958: b        #0x26debcc
  0x26de95c: b        #0x26debcc
  0x26de960: b        #0x26debcc
  0x26de964: b        #0x26debcc
  0x26de968: b        #0x26debcc
  0x26de96c: b        #0x26debcc
  0x26de970: b        #0x26debcc
  0x26de974: b        #0x26debcc
  0x26de978: b        #0x26debcc
  0x26de97c: b        #0x26debcc
  0x26de980: b        #0x26debcc
  0x26de984: b        #0x26debcc
  0x26de988: b        #0x26debcc
  0x26de98c: b        #0x26debcc
  0x26de990: b        #0x26debcc
  0x26de994: b        #0x26debcc
  0x26de998: b        #0x26debcc
  0x26de99c: b        #0x26debcc
  0x26de9a0: b        #0x26debcc
  0x26de9a4: b        #0x26debcc
  0x26de9a8: b        #0x26deb54
  0x26de9ac: b        #0x26debcc
  0x26de9b0: b        #0x26deb54
  0x26de9b4: b        #0x26deb54
  0x26de9b8: b        #0x26deb54
  0x26de9bc: b        #0x26deb54
  0x26de9c0: b        #0x26deb54
  0x26de9c4: b        #0x26deb54
  0x26de9c8: b        #0x26deb54
  0x26de9cc: b        #0x26debcc
  0x26de9d0: b        #0x26debcc
  0x26de9d4: b        #0x26deb54
  0x26de9d8: b        #0x26deb54
  0x26de9dc: b        #0x26debcc
  0x26de9e0: b        #0x26deb54
  0x26de9e4: b        #0x26deb54
  0x26de9e8: b        #0x26deb54
  0x26de9ec: b        #0x26deb54
  0x26de9f0: b        #0x26deb54
  0x26de9f4: b        #0x26debcc
  0x26de9f8: b        #0x26debcc
  0x26de9fc: b        #0x26deb54
  0x26dea00: b        #0x26deb54
  0x26dea04: b        #0x26debcc
  0x26dea08: b        #0x26deb54
  0x26dea0c: b        #0x26deb54
  0x26dea10: b        #0x26deb54
  0x26dea14: b        #0x26deb54
  0x26dea18: b        #0x26deb54
  0x26dea1c: b        #0x26deb54
  0x26dea20: b        #0x26deb54
  0x26dea24: b        #0x26deb54
  0x26dea28: b        #0x26debcc
  0x26dea2c: b        #0x26debcc
  0x26dea30: b        #0x26deb54
  0x26dea34: b        #0x26deb54
  0x26dea38: b        #0x26deb54
  0x26dea3c: b        #0x26debcc
  0x26dea40: b        #0x26deb54
  0x26dea44: b        #0x26deb54
  0x26dea48: b        #0x26deb54
  0x26dea4c: b        #0x26deb54
  0x26dea50: b        #0x26deb54
  0x26dea54: b        #0x26deb54
  0x26dea58: b        #0x26deb54
  0x26dea5c: b        #0x26deb54
  0x26dea60: b        #0x26deb54
  0x26dea64: b        #0x26deb54
  0x26dea68: b        #0x26deb54
  0x26dea6c: b        #0x26deb54
  0x26dea70: b        #0x26deb54
  0x26dea74: b        #0x26deb54
  0x26dea78: b        #0x26deb54
  0x26dea7c: b        #0x26deb54
  0x26dea80: b        #0x26deb54
  0x26dea84: b        #0x26deb54
  0x26dea88: b        #0x26deb54
  0x26dea8c: b        #0x26deb54
  0x26dea90: b        #0x26deb54
  0x26dea94: b        #0x26deb54
  0x26dea98: b        #0x26deb54
  0x26dea9c: b        #0x26deb54
  0x26deaa0: b        #0x26deb54
  0x26deaa4: b        #0x26deb54
  0x26deaa8: b        #0x26deb54
  0x26deaac: b        #0x26deb54
  0x26deab0: b        #0x26deb54
  0x26deab4: b        #0x26deb54
  0x26deab8: b        #0x26deb54
  0x26deabc: b        #0x26deb54
  0x26deac0: b        #0x26deb54
  0x26deac4: b        #0x26deb54
  0x26deac8: b        #0x26deb54
  0x26deacc: b        #0x26deb54
  0x26dead0: b        #0x26deb54
  0x26dead4: b        #0x26deb54
  0x26dead8: b        #0x26deb54
  0x26deadc: b        #0x26deb54
  0x26deae0: b        #0x26deb54
  0x26deae4: b        #0x26deb54
  0x26deae8: b        #0x26deb54
  0x26deaec: b        #0x26deb54
  0x26deaf0: b        #0x26deb54
  0x26deaf4: b        #0x26deb54
  0x26deaf8: b        #0x26deb54
  0x26deafc: b        #0x26deb54
  0x26deb00: b        #0x26deb54
  0x26deb04: b        #0x26deb54
  0x26deb08: b        #0x26deb54
  0x26deb0c: b        #0x26deb54
  0x26deb10: b        #0x26deb54
  0x26deb14: b        #0x26deb54
  0x26deb18: b        #0x26deb54
  0x26deb1c: b        #0x26deb54
  0x26deb20: b        #0x26deb54
  0x26deb24: b        #0x26deb54
  0x26deb28: b        #0x26deb54
  0x26deb2c: b        #0x26deb54
  0x26deb30: b        #0x26deb54
  0x26deb34: b        #0x26deb54
  0x26deb38: b        #0x26deb54
  0x26deb3c: b        #0x26deb54
  0x26deb40: b        #0x26deb54
  0x26deb44: b        #0x26deb54
  0x26deb48: b        #0x26deb54
  0x26deb4c: b        #0x26deb54
  0x26deb50: b        #0x26deb54
  0x26deb54: mov      x26, x1
  0x26deb58: mov      x25, x0
  0x26deb5c: cmp      w26, #1
  0x26deb60: b.ne     #0x26deb94
  0x26deb64: mov      x0, x25
  0x26deb68: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26deb6c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x26deb70: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26deb74: adrp     x8, #0x5511000
  0x26deb78: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26deb7c: add      x0, sp, #0x50
  0x26deb80: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26deb84: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26deb88: cbz      x21, #0x26de7bc
  0x26deb8c: mov      x0, x21
  0x26deb90: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26deb94: mov      x21, xzr
  0x26deb98: b        #0x26deba0
  0x26deb9c: mov      x25, x0
  0x26deba0: adrp     x8, #0x5511000
  0x26deba4: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26deba8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26debac: add      x0, sp, #0x50
  0x26debb0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26debb4: cbnz     x21, #0x26debc0
  0x26debb8: mov      x0, x25
  0x26debbc: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x26debc0: mov      x0, x21
  0x26debc4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26debc8: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
  0x26debcc: mov      x25, x0
  0x26debd0: mov      w26, w1
  0x26debd4: b        #0x26deb5c
