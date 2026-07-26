; ===== CStatValue_SetBaseValue @ 0x28d16bc..0x28d18e4 (taille 552 octets) =====
  0x28d16bc: str      x30, [sp, #-0x50]!
  0x28d16c0: stp      x26, x25, [sp, #0x10]
  0x28d16c4: stp      x24, x23, [sp, #0x20]
  0x28d16c8: stp      x22, x21, [sp, #0x30]
  0x28d16cc: stp      x20, x19, [sp, #0x40]
  0x28d16d0: adrp     x26, #0x5958000
  0x28d16d4: ldrb     w8, [x26, #0xbb7]
  0x28d16d8: mov      x25, x6
  0x28d16dc: mov      w21, w5
  0x28d16e0: mov      w20, w4
  0x28d16e4: mov      w23, w3
  0x28d16e8: mov      w24, w2
  0x28d16ec: mov      w22, w1
  0x28d16f0: mov      x19, x0
  0x28d16f4: tbnz     w8, #0, #0x28d1718
  0x28d16f8: adrp     x0, #0x5511000
  0x28d16fc: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x28d1700: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d1704: adrp     x0, #0x5511000
  0x28d1708: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d170c: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d1710: mov      w8, #1
  0x28d1714: strb     w8, [x26, #0xbb7]
  0x28d1718: cbz      x25, #0x28d172c
  0x28d171c: mov      x0, x19
  0x28d1720: str      x25, [x0, #0xe8]!
  0x28d1724: mov      x1, x25
  0x28d1728: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x28d172c: adrp     x25, #0x5511000
  0x28d1730: ldr      x0, [x19, #0xe8]
  0x28d1734: ldr      x25, [x25, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d1738: cbz      x0, #0x28d17d4
  0x28d173c: mov      x1, xzr
  0x28d1740: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x28d1744: cmp      w23, #0x65
  0x28d1748: b.lt     #0x28d17d4
  0x28d174c: cbnz     w0, #0x28d17d4
  0x28d1750: ldr      x8, [x19, #0xe8]
  0x28d1754: cbz      x8, #0x28d18e0
  0x28d1758: mov      x12, #0xd40b
  0x28d175c: movk     x12, #0x95fa, lsl #16
  0x28d1760: ldrsw    x8, [x8, #0x88]
  0x28d1764: sub      w10, w24, w22
  0x28d1768: sub      w11, w23, #1
  0x28d176c: movk     x12, #0xb502, lsl #32
  0x28d1770: movk     x12, #0xa57e, lsl #48
  0x28d1774: mov      x13, #0x3339
  0x28d1778: smull    x14, w11, w10
  0x28d177c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x28d1780: sub      w9, w23, #0x64
  0x28d1784: movk     x13, #0x77cc, lsl #16
  0x28d1788: smulh    x12, x14, x12
  0x28d178c: sxtw     x14, w10
  0x28d1790: movk     x13, #0xc107, lsl #32
  0x28d1794: mul      x9, x9, x14
  0x28d1798: movk     x13, #0x54bb, lsl #48
  0x28d179c: smaddl   x10, w11, w10, x12
  0x28d17a0: mul      x8, x9, x8
  0x28d17a4: lsr      x11, x10, #0x3f
  0x28d17a8: lsr      x10, x10, #6
  0x28d17ac: ldr      w9, [x0, #0xe0]
  0x28d17b0: smulh    x8, x8, x13
  0x28d17b4: add      w10, w10, w11
  0x28d17b8: lsr      x11, x8, #0x3f
  0x28d17bc: lsr      x8, x8, #0xf
  0x28d17c0: add      w10, w10, w22
  0x28d17c4: add      w8, w8, w11
  0x28d17c8: add      w22, w10, w8
  0x28d17cc: cbnz     w9, #0x28d1800
  0x28d17d0: b        #0x28d17fc
  0x28d17d4: mov      w0, w22
  0x28d17d8: mov      w1, w24
  0x28d17dc: mov      w2, w23
  0x28d17e0: mov      x3, xzr
  0x28d17e4: bl       #0x2c59db0 ; -> CFormula$$CalcStat
  0x28d17e8: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x28d17ec: mov      w22, w0
  0x28d17f0: ldr      w9, [x8, #0xe0]
  0x28d17f4: cbnz     w9, #0x28d1800
  0x28d17f8: mov      x0, x8
  0x28d17fc: bl       #0x218489c ; -> ??? 0x218489c
  0x28d1800: mov      w0, w22
  0x28d1804: mov      x1, xzr
  0x28d1808: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d180c: mov      x23, x1
  0x28d1810: cmp      w21, #1
  0x28d1814: stur     x0, [x19, #0x14]
  0x28d1818: str      w23, [x19, #0x1c]
  0x28d181c: b.lt     #0x28d189c
  0x28d1820: mov      x22, x0
  0x28d1824: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x28d1828: adrp     x24, #0x5511000
  0x28d182c: ldr      w8, [x0, #0xe0]
  0x28d1830: ldr      x24, [x24, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x28d1834: cbnz     w8, #0x28d183c
  0x28d1838: bl       #0x218489c ; -> ??? 0x218489c
  0x28d183c: and      x1, x23, #0xffffffff
  0x28d1840: mov      x0, x22
  0x28d1844: mov      x2, xzr
  0x28d1848: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d184c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x28d1850: mov      w22, w0
  0x28d1854: ldr      w9, [x8, #0xe0]
  0x28d1858: cbnz     w9, #0x28d1864
  0x28d185c: mov      x0, x8
  0x28d1860: bl       #0x218489c ; -> ??? 0x218489c
  0x28d1864: mov      x9, #0xf7cf
  0x28d1868: movk     x9, #0xe353, lsl #16
  0x28d186c: add      w8, w21, #0x3e8
  0x28d1870: movk     x9, #0x9ba5, lsl #32
  0x28d1874: movk     x9, #0x20c4, lsl #48
  0x28d1878: smull    x8, w22, w8
  0x28d187c: smulh    x8, x8, x9
  0x28d1880: lsr      x9, x8, #0x3f
  0x28d1884: lsr      x8, x8, #7
  0x28d1888: add      w0, w8, w9
  0x28d188c: mov      x1, xzr
  0x28d1890: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d1894: stur     x0, [x19, #0x14]
  0x28d1898: str      w1, [x19, #0x1c]
  0x28d189c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x28d18a0: ldr      w8, [x0, #0xe0]
  0x28d18a4: cbnz     w8, #0x28d18ac
  0x28d18a8: bl       #0x218489c ; -> ??? 0x218489c
  0x28d18ac: mov      w0, w20
  0x28d18b0: mov      x1, xzr
  0x28d18b4: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d18b8: mov      w8, #1
  0x28d18bc: str      x0, [x19, #0x20]
  0x28d18c0: str      w1, [x19, #0x28]
  0x28d18c4: strb     w8, [x19, #0xe0]
  0x28d18c8: ldp      x20, x19, [sp, #0x40]
  0x28d18cc: ldp      x22, x21, [sp, #0x30]
  0x28d18d0: ldp      x24, x23, [sp, #0x20]
  0x28d18d4: ldp      x26, x25, [sp, #0x10]
  0x28d18d8: ldr      x30, [sp], #0x50
  0x28d18dc: ret      
  0x28d18e0: bl       #0x21849c0 ; -> ??? 0x21849c0
