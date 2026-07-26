; ===== CBuff_OnCreate @ 0x22fc71c..0x22ff894 (taille 12664 octets) =====
  0x22fc71c: sub      sp, sp, #0xd0
  0x22fc720: stp      x29, x30, [sp, #0x70]
  0x22fc724: stp      x28, x27, [sp, #0x80]
  0x22fc728: stp      x26, x25, [sp, #0x90]
  0x22fc72c: stp      x24, x23, [sp, #0xa0]
  0x22fc730: stp      x22, x21, [sp, #0xb0]
  0x22fc734: stp      x20, x19, [sp, #0xc0]
  0x22fc738: adrp     x20, #0x5955000
  0x22fc73c: ldrb     w8, [x20, #0x928]
  0x22fc740: mov      x19, x0
  0x22fc744: tbnz     w8, #0, #0x22fca2c
  0x22fc748: adrp     x0, #0x550f000
  0x22fc74c: ldr      x0, [x0, #0xf0] ; = 0x0 (u64 @ 0x550f0f0)
  0x22fc750: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc754: adrp     x0, #0x5511000
  0x22fc758: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fc75c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc760: adrp     x0, #0x5511000
  0x22fc764: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fc768: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc76c: adrp     x0, #0x5511000
  0x22fc770: ldr      x0, [x0, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x22fc774: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc778: adrp     x0, #0x5512000
  0x22fc77c: ldr      x0, [x0, #0x458] ; = 0x0 (u64 @ 0x5512458)
  0x22fc780: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc784: adrp     x0, #0x5511000
  0x22fc788: ldr      x0, [x0, #0x828] ; = 0x0 (u64 @ 0x5511828)
  0x22fc78c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc790: adrp     x0, #0x5512000
  0x22fc794: ldr      x0, [x0, #0x460] ; = 0x0 (u64 @ 0x5512460)
  0x22fc798: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc79c: adrp     x0, #0x5511000
  0x22fc7a0: ldr      x0, [x0, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fc7a4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7a8: adrp     x0, #0x5511000
  0x22fc7ac: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22fc7b0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7b4: adrp     x0, #0x5512000
  0x22fc7b8: ldr      x0, [x0, #0x468] ; = 0x0 (u64 @ 0x5512468)
  0x22fc7bc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7c0: adrp     x0, #0x5512000
  0x22fc7c4: ldr      x0, [x0, #0x470] ; = 0x0 (u64 @ 0x5512470)
  0x22fc7c8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7cc: adrp     x0, #0x5512000
  0x22fc7d0: ldr      x0, [x0, #0x478] ; = 0x0 (u64 @ 0x5512478)
  0x22fc7d4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7d8: adrp     x0, #0x5512000
  0x22fc7dc: ldr      x0, [x0, #0x480] ; = 0x0 (u64 @ 0x5512480)
  0x22fc7e0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7e4: adrp     x0, #0x5511000
  0x22fc7e8: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x22fc7ec: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7f0: adrp     x0, #0x5511000
  0x22fc7f4: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fc7f8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc7fc: adrp     x0, #0x5511000
  0x22fc800: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22fc804: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc808: adrp     x0, #0x5511000
  0x22fc80c: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x22fc810: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc814: adrp     x0, #0x5511000
  0x22fc818: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5511850)
  0x22fc81c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc820: adrp     x0, #0x5511000
  0x22fc824: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x22fc828: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc82c: adrp     x0, #0x5512000
  0x22fc830: ldr      x0, [x0, #0x488] ; = 0x0 (u64 @ 0x5512488)
  0x22fc834: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc838: adrp     x0, #0x550f000
  0x22fc83c: ldr      x0, [x0, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x22fc840: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc844: adrp     x0, #0x5511000
  0x22fc848: ldr      x0, [x0, #0x798] ; = 0x0 (u64 @ 0x5511798)
  0x22fc84c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc850: adrp     x0, #0x550f000
  0x22fc854: ldr      x0, [x0, #0xd8] ; = 0x0 (u64 @ 0x550f0d8)
  0x22fc858: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc85c: adrp     x0, #0x5511000
  0x22fc860: ldr      x0, [x0, #0x680] ; = 0x0 (u64 @ 0x5511680)
  0x22fc864: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc868: adrp     x0, #0x5511000
  0x22fc86c: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x22fc870: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc874: adrp     x0, #0x5511000
  0x22fc878: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22fc87c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc880: adrp     x0, #0x5512000
  0x22fc884: ldr      x0, [x0, #0x490] ; = 0x0 (u64 @ 0x5512490)
  0x22fc888: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc88c: adrp     x0, #0x5511000
  0x22fc890: ldr      x0, [x0, #0x498] ; = 0x0 (u64 @ 0x5511498)
  0x22fc894: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc898: adrp     x0, #0x5512000
  0x22fc89c: ldr      x0, [x0, #0x498] ; = 0x0 (u64 @ 0x5512498)
  0x22fc8a0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8a4: adrp     x0, #0x5512000
  0x22fc8a8: ldr      x0, [x0, #0x4a0] ; = 0x0 (u64 @ 0x55124a0)
  0x22fc8ac: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8b0: adrp     x0, #0x550f000
  0x22fc8b4: ldr      x0, [x0, #0xc8] ; = 0x0 (u64 @ 0x550f0c8)
  0x22fc8b8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8bc: adrp     x0, #0x5512000
  0x22fc8c0: ldr      x0, [x0, #0x330] ; = 0x0 (u64 @ 0x5512330)
  0x22fc8c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8c8: adrp     x0, #0x5511000
  0x22fc8cc: ldr      x0, [x0, #0x610] ; = 0x0 (u64 @ 0x5511610)
  0x22fc8d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8d4: adrp     x0, #0x5511000
  0x22fc8d8: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5511d70)
  0x22fc8dc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8e0: adrp     x0, #0x5511000
  0x22fc8e4: ldr      x0, [x0, #0xa00] ; = 0x0 (u64 @ 0x5511a00)
  0x22fc8e8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8ec: adrp     x0, #0x5511000
  0x22fc8f0: ldr      x0, [x0, #0xe40] ; = 0x0 (u64 @ 0x5511e40)
  0x22fc8f4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc8f8: adrp     x0, #0x5511000
  0x22fc8fc: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5511d78)
  0x22fc900: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc904: adrp     x0, #0x5512000
  0x22fc908: ldr      x0, [x0, #0x4a8] ; = 0x0 (u64 @ 0x55124a8)
  0x22fc90c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc910: adrp     x0, #0x5511000
  0x22fc914: ldr      x0, [x0, #0x490] ; = 0x0 (u64 @ 0x5511490)
  0x22fc918: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc91c: adrp     x0, #0x5512000
  0x22fc920: ldr      x0, [x0, #0x4b0] ; = 0x0 (u64 @ 0x55124b0)
  0x22fc924: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc928: adrp     x0, #0x5511000
  0x22fc92c: ldr      x0, [x0, #0xfa8] ; = 0x0 (u64 @ 0x5511fa8)
  0x22fc930: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc934: adrp     x0, #0x550f000
  0x22fc938: ldr      x0, [x0, #0xc0] ; = 0x0 (u64 @ 0x550f0c0)
  0x22fc93c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc940: adrp     x0, #0x550f000
  0x22fc944: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x22fc948: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc94c: adrp     x0, #0x550f000
  0x22fc950: ldr      x0, [x0, #0x310] ; = 0x0 (u64 @ 0x550f310)
  0x22fc954: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc958: adrp     x0, #0x550f000
  0x22fc95c: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fc960: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc964: adrp     x0, #0x550f000
  0x22fc968: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x550f260)
  0x22fc96c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc970: adrp     x0, #0x5511000
  0x22fc974: ldr      x0, [x0, #0xa10] ; = 0x0 (u64 @ 0x5511a10)
  0x22fc978: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc97c: adrp     x0, #0x5512000
  0x22fc980: ldr      x0, [x0, #0x4b8] ; = 0x0 (u64 @ 0x55124b8)
  0x22fc984: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc988: adrp     x0, #0x5512000
  0x22fc98c: ldr      x0, [x0, #0x4c0] ; = 0x0 (u64 @ 0x55124c0)
  0x22fc990: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc994: adrp     x0, #0x5512000
  0x22fc998: ldr      x0, [x0, #0x420] ; = 0x0 (u64 @ 0x5512420)
  0x22fc99c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9a0: adrp     x0, #0x5512000
  0x22fc9a4: ldr      x0, [x0, #0x4c8] ; = 0x0 (u64 @ 0x55124c8)
  0x22fc9a8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9ac: adrp     x0, #0x5512000
  0x22fc9b0: ldr      x0, [x0, #0x4d0] ; = 0x0 (u64 @ 0x55124d0)
  0x22fc9b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9b8: adrp     x0, #0x5512000
  0x22fc9bc: ldr      x0, [x0, #0x4d8] ; = 0x0 (u64 @ 0x55124d8)
  0x22fc9c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9c4: adrp     x0, #0x5512000
  0x22fc9c8: ldr      x0, [x0, #0x4e0] ; = 0x0 (u64 @ 0x55124e0)
  0x22fc9cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9d0: adrp     x0, #0x5512000
  0x22fc9d4: ldr      x0, [x0, #0x4e8] ; = 0x0 (u64 @ 0x55124e8)
  0x22fc9d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9dc: adrp     x0, #0x5512000
  0x22fc9e0: ldr      x0, [x0, #0x4f0] ; = 0x0 (u64 @ 0x55124f0)
  0x22fc9e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9e8: adrp     x0, #0x5512000
  0x22fc9ec: ldr      x0, [x0, #0x4f8] ; = 0x0 (u64 @ 0x55124f8)
  0x22fc9f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc9f4: adrp     x0, #0x5511000
  0x22fc9f8: ldr      x0, [x0, #0xa40] ; = 0x0 (u64 @ 0x5511a40)
  0x22fc9fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fca00: adrp     x0, #0x5512000
  0x22fca04: ldr      x0, [x0, #0x500] ; = 0x0 (u64 @ 0x5512500)
  0x22fca08: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fca0c: adrp     x0, #0x5512000
  0x22fca10: ldr      x0, [x0, #0x508] ; = 0x0 (u64 @ 0x5512508)
  0x22fca14: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fca18: adrp     x0, #0x5512000
  0x22fca1c: ldr      x0, [x0, #0x510] ; = 0x0 (u64 @ 0x5512510)
  0x22fca20: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fca24: mov      w8, #1
  0x22fca28: strb     w8, [x20, #0x928]
  0x22fca2c: str      wzr, [sp, #0x6c]
  0x22fca30: stp      xzr, xzr, [sp, #0x50]
  0x22fca34: str      xzr, [sp, #0x60]
  0x22fca38: str      wzr, [sp, #0x4c]
  0x22fca3c: stp      xzr, xzr, [sp, #0x30]
  0x22fca40: str      xzr, [sp, #0x40]
  0x22fca44: mov      x26, x19
  0x22fca48: ldr      x0, [x26, #0x10]!
  0x22fca4c: cbz      x0, #0x22ff754
  0x22fca50: ldr      w8, [x0, #0x24]
  0x22fca54: sub      w9, w8, #0xa
  0x22fca58: cmp      w9, #0x47
  0x22fca5c: b.hi     #0x22fd9fc
  0x22fca60: ldr      w2, [x0, #0x54]
  0x22fca64: ldr      w10, [x19, #0x30]
  0x22fca68: adrp     x11, #0x1056000
  0x22fca6c: add      x11, x11, #0x8c4
  0x22fca70: adr      x12, #0x22fca88
  0x22fca74: ldrh     w13, [x11, x9, lsl #1]
  0x22fca78: add      x12, x12, x13, lsl #2
  0x22fca7c: mul      w20, w10, w2
  0x22fca80: mov      w24, #1
  0x22fca84: br       x12
  0x22fca88: mov      x0, x19
  0x22fca8c: bl       #0x22ffcac ; -> CBuff$$ConvertImmediatelyToDot
  0x22fca90: ldr      x8, [x19, #0x20]
  0x22fca94: cbz      x8, #0x22ff754
  0x22fca98: mov      w1, w0
  0x22fca9c: mov      x0, x8
  0x22fcaa0: mov      x2, xzr
  0x22fcaa4: bl       #0x26d110c ; -> CCharacterBattle$$GetBuffListByType
  0x22fcaa8: adrp     x8, #0x5511000
  0x22fcaac: ldr      x8, [x8, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x22fcab0: mov      x20, x0
  0x22fcab4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcab8: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22fcabc: tbnz     w0, #0, #0x22ff4a4
  0x22fcac0: cbz      x20, #0x22ff754
  0x22fcac4: adrp     x8, #0x5511000
  0x22fcac8: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22fcacc: mov      x0, x20
  0x22fcad0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcad4: add      x8, sp, #0x18
  0x22fcad8: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fcadc: ldur     q0, [sp, #0x18]
  0x22fcae0: ldr      x8, [sp, #0x28]
  0x22fcae4: adrp     x22, #0x5511000
  0x22fcae8: ldr      x22, [x22, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22fcaec: str      q0, [sp, #0x50]
  0x22fcaf0: str      x8, [sp, #0x60]
  0x22fcaf4: adrp     x23, #0x5511000
  0x22fcaf8: ldr      x23, [x23, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fcafc: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fcb00: add      x0, sp, #0x50
  0x22fcb04: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fcb08: tbz      w0, #0, #0x22fcc6c
  0x22fcb0c: ldr      x20, [sp, #0x60]
  0x22fcb10: cbz      x20, #0x22fe964
  0x22fcb14: ldr      x8, [x20, #0x10] ; = 0x6000038 (u64 @ 0x5955010)
  0x22fcb18: cbz      x8, #0x22fe968
  0x22fcb1c: ldr      x9, [x26]
  0x22fcb20: cbz      x9, #0x22fe960
  0x22fcb24: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22fcb28: ldr      w24, [x8, #0x54]
  0x22fcb2c: ldr      w25, [x20, #0x30]
  0x22fcb30: ldr      w21, [x9, #0x54]
  0x22fcb34: ldr      w8, [x0, #0xe0]
  0x22fcb38: cbnz     w8, #0x22fcb40
  0x22fcb3c: bl       #0x218489c ; -> ??? 0x218489c
  0x22fcb40: mul      w0, w25, w24
  0x22fcb44: mov      w1, w21
  0x22fcb48: mov      x2, xzr
  0x22fcb4c: bl       #0x28d18e4 ; -> CCommonDefine$$ApplyRate
  0x22fcb50: mov      w1, w0
  0x22fcb54: ldr      w2, [x20, #0x2c]
  0x22fcb58: ldr      x3, [x19, #0x18]
  0x22fcb5c: mov      x0, x20
  0x22fcb60: mov      x4, xzr
  0x22fcb64: bl       #0x22e818c ; -> CBattleManager$$ProcessDamageOverTime
  0x22fcb68: str      wzr, [x20, #0x2c]
  0x22fcb6c: b        #0x22fcafc
  0x22fcb70: cmp      w8, #0x21
  0x22fcb74: b.ne     #0x22fda24
  0x22fcb78: adrp     x21, #0x5955000
  0x22fcb7c: ldrb     w8, [x21, #0x8f3]
  0x22fcb80: cbnz     w8, #0x22fcb98
  0x22fcb84: adrp     x0, #0x5511000
  0x22fcb88: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fcb8c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fcb90: mov      w8, #1
  0x22fcb94: strb     w8, [x21, #0x8f3]
  0x22fcb98: adrp     x22, #0x5511000
  0x22fcb9c: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fcba0: adrp     x9, #0x550f000
  0x22fcba4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fcba8: ldr      x9, [x9, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fcbac: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fcbb0: ldr      x0, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x22fcbb4: ldr      x20, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcbb8: ldr      w9, [x0, #0xe0]
  0x22fcbbc: cbnz     w9, #0x22fcbc4
  0x22fcbc0: bl       #0x218489c ; -> ??? 0x218489c
  0x22fcbc4: mov      x0, x20
  0x22fcbc8: mov      x1, xzr
  0x22fcbcc: mov      x2, xzr
  0x22fcbd0: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x22fcbd4: tbnz     w0, #0, #0x22fe518
  0x22fcbd8: ldrb     w8, [x21, #0x8f3]
  0x22fcbdc: cbnz     w8, #0x22fcbf4
  0x22fcbe0: adrp     x0, #0x5511000
  0x22fcbe4: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fcbe8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fcbec: mov      w8, #1
  0x22fcbf0: strb     w8, [x21, #0x8f3]
  0x22fcbf4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fcbf8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fcbfc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcc00: cbz      x8, #0x22ff754
  0x22fcc04: ldr      x0, [x8, #0x20] ; = 0x0 (u64 @ 0x5511020)
  0x22fcc08: mov      x1, xzr
  0x22fcc0c: bl       #0x2c58d0c ; -> CExtension$$IsTowerModes
  0x22fcc10: tbz      w0, #0, #0x22fe518
  0x22fcc14: ldr      x0, [x26]
  0x22fcc18: cbnz     x0, #0x22fda24
  0x22fcc1c: b        #0x22ff754
  0x22fcc20: ldr      x8, [x19, #0x20]
  0x22fcc24: cbz      x8, #0x22ff754
  0x22fcc28: ldr      w1, [x0, #0x48]
  0x22fcc2c: mov      x0, x8
  0x22fcc30: mov      x2, xzr
  0x22fcc34: bl       #0x26dd25c ; -> CCharacterBattle$$SetCCFreeze
  0x22fcc38: ldr      x8, [x26]
  0x22fcc3c: cbz      x8, #0x22ff754
  0x22fcc40: ldr      w8, [x8, #0x24]
  0x22fcc44: cmp      w8, #0xc
  0x22fcc48: b.ne     #0x22ff4a4
  0x22fcc4c: ldr      x0, [x19, #0x20]
  0x22fcc50: cbz      x0, #0x22ff754
  0x22fcc54: mov      w1, #0xe
  0x22fcc58: mov      w2, #1
  0x22fcc5c: mov      x3, xzr
  0x22fcc60: mov      w24, #1
  0x22fcc64: bl       #0x27db23c ; -> CCharacter$$PlayAnimation
  0x22fcc68: b        #0x22ff4a8
  0x22fcc6c: adrp     x8, #0x5511000
  0x22fcc70: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fcc74: add      x0, sp, #0x50
  0x22fcc78: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcc7c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fcc80: b        #0x22fdaec
  0x22fcc84: ldr      x1, [x19, #0x20]
  0x22fcc88: neg      w2, w2
  0x22fcc8c: b        #0x22fd3c4
  0x22fcc90: ldr      w8, [x0, #0x50]
  0x22fcc94: cmp      w8, #2
  0x22fcc98: b.ne     #0x22fccf8
  0x22fcc9c: ldr      x8, [x19, #0x20]
  0x22fcca0: cbz      x8, #0x22ff754
  0x22fcca4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fcca8: cbz      x0, #0x22ff754
  0x22fccac: mov      x1, xzr
  0x22fccb0: bl       #0x27dfe44 ; -> CCharacterData$$get_MaxWG
  0x22fccb4: ldr      x8, [x26]
  0x22fccb8: cbz      x8, #0x22ff754
  0x22fccbc: adrp     x9, #0x5511000
  0x22fccc0: ldr      x9, [x9, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fccc4: mov      w20, w0
  0x22fccc8: ldr      w8, [x8, #0x54]
  0x22fcccc: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5511000)
  0x22fccd0: ldr      w9, [x19, #0x30]
  0x22fccd4: ldr      w10, [x0, #0xe0]
  0x22fccd8: mul      w21, w9, w8
  0x22fccdc: cbnz     w10, #0x22fcce4
  0x22fcce0: bl       #0x218489c ; -> ??? 0x218489c
  0x22fcce4: mov      w0, w20
  0x22fcce8: mov      w1, w21
  0x22fccec: mov      x2, xzr
  0x22fccf0: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x22fccf4: mov      w20, w0
  0x22fccf8: ldr      x8, [x19, #0x20]
  0x22fccfc: cbz      x8, #0x22ff754
  0x22fcd00: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x5511378)
  0x22fcd04: cbz      x0, #0x22ff754
  0x22fcd08: ldr      w8, [x0, #0x38]
  0x22fcd0c: add      w1, w8, w20
  0x22fcd10: b        #0x22fd134
  0x22fcd14: ldr      x0, [x19, #0x20]
  0x22fcd18: cbz      x0, #0x22ff754
  0x22fcd1c: mov      w1, wzr
  0x22fcd20: mov      w2, w20
  0x22fcd24: mov      x3, xzr
  0x22fcd28: bl       #0x26dc454 ; -> CCharacterBattle$$RemoveBuffs
  0x22fcd2c: tbz      w0, #0, #0x22ff4a4
  0x22fcd30: adrp     x8, #0x550f000
  0x22fcd34: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fcd38: ldr      x20, [x19, #0x18]
  0x22fcd3c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fcd40: ldr      w8, [x0, #0xe0]
  0x22fcd44: cbnz     w8, #0x22fcd4c
  0x22fcd48: bl       #0x218489c ; -> ??? 0x218489c
  0x22fcd4c: mov      x0, x20
  0x22fcd50: mov      x1, xzr
  0x22fcd54: mov      x2, xzr
  0x22fcd58: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x22fcd5c: tbz      w0, #0, #0x22ff4a4
  0x22fcd60: ldr      x0, [x19, #0x18]
  0x22fcd64: cbz      x0, #0x22ff754
  0x22fcd68: mov      x1, xzr
  0x22fcd6c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fcd70: cbz      x0, #0x22ff754
  0x22fcd74: mov      w24, #1
  0x22fcd78: strb     w24, [x0, #0xb0]
  0x22fcd7c: b        #0x22ff4a8
  0x22fcd80: ldr      x0, [x19, #0x20]
  0x22fcd84: cbz      x0, #0x22ff754
  0x22fcd88: mov      w1, #0x19
  0x22fcd8c: mov      x2, xzr
  0x22fcd90: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x22fcd94: cbz      x0, #0x22ff4a4
  0x22fcd98: mov      x1, x0
  0x22fcd9c: ldr      x0, [x19, #0x20]
  0x22fcda0: cbz      x0, #0x22ff754
  0x22fcda4: mov      w2, #1
  0x22fcda8: mov      x3, xzr
  0x22fcdac: mov      w24, #1
  0x22fcdb0: bl       #0x26db46c ; -> CCharacterBattle$$RemoveBuff
  0x22fcdb4: b        #0x22ff4a8
  0x22fcdb8: ldr      x19, [x19, #0x20]
  0x22fcdbc: cbz      x19, #0x22ff754
  0x22fcdc0: mov      x0, x19
  0x22fcdc4: mov      x1, xzr
  0x22fcdc8: bl       #0x26c6dcc ; -> CCharacterBattle$$get_AP
  0x22fcdcc: add      w1, w0, w20
  0x22fcdd0: mov      x0, x19
  0x22fcdd4: mov      x2, xzr
  0x22fcdd8: bl       #0x26c6e30 ; -> CCharacterBattle$$set_AP
  0x22fcddc: b        #0x22ff4a4
  0x22fcde0: ldr      w1, [x0, #0x4c]
  0x22fcde4: cbz      w1, #0x22fcee4
  0x22fcde8: ldr      x8, [x19, #0x20]
  0x22fcdec: cbz      x8, #0x22ff754
  0x22fcdf0: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22fcdf4: cbz      x0, #0x22ff754
  0x22fcdf8: mov      w2, w20
  0x22fcdfc: mov      x3, xzr
  0x22fce00: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x22fce04: adrp     x21, #0x5955000
  0x22fce08: ldrb     w8, [x21, #0x8f3]
  0x22fce0c: mov      w20, w0
  0x22fce10: cbnz     w8, #0x22fce28
  0x22fce14: adrp     x0, #0x5511000
  0x22fce18: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fce1c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fce20: mov      w8, #1
  0x22fce24: strb     w8, [x21, #0x8f3]
  0x22fce28: adrp     x22, #0x5511000
  0x22fce2c: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fce30: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fce34: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22fce38: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fce3c: cbz      x0, #0x22ff754
  0x22fce40: mov      x1, xzr
  0x22fce44: bl       #0x2548c30 ; -> CDungeonScene$$get_IsPvp
  0x22fce48: tbnz     w0, #0, #0x22fce84
  0x22fce4c: ldrb     w8, [x21, #0x8f3]
  0x22fce50: cbnz     w8, #0x22fce68
  0x22fce54: adrp     x0, #0x5511000
  0x22fce58: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fce5c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fce60: mov      w8, #1
  0x22fce64: strb     w8, [x21, #0x8f3]
  0x22fce68: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fce6c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22fce70: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fce74: cbz      x0, #0x22ff754
  0x22fce78: mov      x1, xzr
  0x22fce7c: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x22fce80: tbz      w0, #0, #0x22fcee4
  0x22fce84: ldrb     w8, [x21, #0x8f3]
  0x22fce88: cbnz     w8, #0x22fcea0
  0x22fce8c: adrp     x0, #0x5511000
  0x22fce90: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fce94: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fce98: mov      w8, #1
  0x22fce9c: strb     w8, [x21, #0x8f3]
  0x22fcea0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fcea4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22fcea8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fceac: cbz      x8, #0x22ff754
  0x22fceb0: adrp     x9, #0x5511000
  0x22fceb4: ldr      x9, [x9, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fceb8: ldr      w21, [x8, #0x100]
  0x22fcebc: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5511000)
  0x22fcec0: ldr      w9, [x0, #0xe0]
  0x22fcec4: cbnz     w9, #0x22fcecc
  0x22fcec8: bl       #0x218489c ; -> ??? 0x218489c
  0x22fcecc: mov      w8, #0x3e8
  0x22fced0: sub      w1, w8, w21
  0x22fced4: mov      w0, w20
  0x22fced8: mov      x2, xzr
  0x22fcedc: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x22fcee0: mov      w20, w0
  0x22fcee4: ldr      x0, [x19, #0x20]
  0x22fcee8: cbz      x0, #0x22ff754
  0x22fceec: mov      w2, #1
  0x22fcef0: mov      w1, w20
  0x22fcef4: mov      w3, wzr
  0x22fcef8: mov      w4, wzr
  0x22fcefc: mov      x5, xzr
  0x22fcf00: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x22fcf04: ldr      x8, [x19, #0x20]
  0x22fcf08: cbz      x8, #0x22ff754
  0x22fcf0c: mov      w20, w0
  0x22fcf10: mov      x0, x8
  0x22fcf14: mov      x1, xzr
  0x22fcf18: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fcf1c: cbz      x0, #0x22ff754
  0x22fcf20: ldr      w8, [x0, #0xa8]
  0x22fcf24: add      w8, w8, w20
  0x22fcf28: str      w8, [x0, #0xa8]
  0x22fcf2c: ldr      x0, [x19, #0x20]
  0x22fcf30: cbz      x0, #0x22ff754
  0x22fcf34: mov      x1, xzr
  0x22fcf38: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fcf3c: ldr      x8, [x19, #0x18]
  0x22fcf40: cbz      x8, #0x22ff754
  0x22fcf44: mov      x21, x0
  0x22fcf48: mov      x0, x8
  0x22fcf4c: mov      x1, xzr
  0x22fcf50: bl       #0x27d1500 ; -> CCharacter$$get_UID
  0x22fcf54: cbz      x21, #0x22ff754
  0x22fcf58: mov      x1, x0
  0x22fcf5c: mov      x0, x21
  0x22fcf60: mov      w2, w20
  0x22fcf64: mov      x3, xzr
  0x22fcf68: bl       #0x2548e58 ; -> CTeam$$AddTotalHeal
  0x22fcf6c: adrp     x21, #0x5955000
  0x22fcf70: ldrb     w8, [x21, #0x8f3]
  0x22fcf74: cbnz     w8, #0x22fcf8c
  0x22fcf78: adrp     x0, #0x5511000
  0x22fcf7c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fcf80: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fcf84: mov      w8, #1
  0x22fcf88: strb     w8, [x21, #0x8f3]
  0x22fcf8c: adrp     x8, #0x5511000
  0x22fcf90: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fcf94: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcf98: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fcf9c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fcfa0: cbz      x8, #0x22ff754
  0x22fcfa4: ldr      x0, [x19, #0x20]
  0x22fcfa8: cbz      x0, #0x22ff754
  0x22fcfac: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x5511068)
  0x22fcfb0: mov      x1, xzr
  0x22fcfb4: bl       #0x4f7f1a8 ; -> UnityEngine.Component$$get_transform
  0x22fcfb8: cbz      x21, #0x22ff754
  0x22fcfbc: mov      x4, x0
  0x22fcfc0: mov      w2, #1
  0x22fcfc4: mov      x0, x21
  0x22fcfc8: mov      w1, w20
  0x22fcfcc: mov      w3, wzr
  0x22fcfd0: mov      w5, wzr
  0x22fcfd4: mov      x6, xzr
  0x22fcfd8: bl       #0x28bc9fc ; -> CUIHud$$PlayHudTextDamage
  0x22fcfdc: ldr      x0, [x19, #0x20]
  0x22fcfe0: cbz      x0, #0x22ff754
  0x22fcfe4: mov      x1, xzr
  0x22fcfe8: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fcfec: cbz      x0, #0x22ff754
  0x22fcff0: ldr      w8, [x0, #0x48]
  0x22fcff4: cbnz     w8, #0x22ff4a4
  0x22fcff8: adrp     x20, #0x5511000
  0x22fcffc: ldr      x20, [x20, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fd000: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x22fd004: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fd008: cbz      x0, #0x22ff754
  0x22fd00c: mov      w1, #0x10
  0x22fd010: mov      x2, xzr
  0x22fd014: bl       #0x22ebfbc ; -> CBattleManager$$BattleMissionCheck
  0x22fd018: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x22fd01c: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fd020: cbz      x0, #0x22ff754
  0x22fd024: ldr      x2, [x19, #0x18]
  0x22fd028: b        #0x22fd880
  0x22fd02c: ldr      x0, [x19, #0x20]
  0x22fd030: cbz      x0, #0x22ff754
  0x22fd034: mov      x1, xzr
  0x22fd038: bl       #0x27d18c4 ; -> CCharacter$$get_IsDying
  0x22fd03c: tbz      w0, #0, #0x22ff4a4
  0x22fd040: ldr      x0, [x19, #0x20]
  0x22fd044: cbz      x0, #0x22ff754
  0x22fd048: mov      x1, xzr
  0x22fd04c: bl       #0x26cb01c ; -> CCharacterBattle$$SetSealedResurrection
  0x22fd050: b        #0x22ff4a4
  0x22fd054: ldr      x0, [x19, #0x20]
  0x22fd058: cbz      x0, #0x22ff754
  0x22fd05c: mov      x1, xzr
  0x22fd060: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fd064: cbz      x0, #0x22ff754
  0x22fd068: ldr      w8, [x0, #0x58]
  0x22fd06c: mov      x2, xzr
  0x22fd070: add      w1, w8, w20
  0x22fd074: bl       #0x2548a58 ; -> CTeam$$set_CP
  0x22fd078: b        #0x22ff4a4
  0x22fd07c: ldr      x8, [x19, #0x20]
  0x22fd080: cbz      x8, #0x22ff754
  0x22fd084: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x5511378)
  0x22fd088: cbz      x0, #0x22ff754
  0x22fd08c: mov      x1, xzr
  0x22fd090: bl       #0x24cc5d4 ; -> CRageManager$$get_CanReduceWG
  0x22fd094: tbz      w0, #0, #0x22fe518
  0x22fd098: ldr      x8, [x26]
  0x22fd09c: cbz      x8, #0x22fd108
  0x22fd0a0: ldr      w8, [x8, #0x50]
  0x22fd0a4: cmp      w8, #2
  0x22fd0a8: b.ne     #0x22fd108
  0x22fd0ac: ldr      x8, [x19, #0x20]
  0x22fd0b0: cbz      x8, #0x22ff754
  0x22fd0b4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd0b8: cbz      x0, #0x22ff754
  0x22fd0bc: mov      x1, xzr
  0x22fd0c0: bl       #0x27dfe44 ; -> CCharacterData$$get_MaxWG
  0x22fd0c4: ldr      x8, [x26]
  0x22fd0c8: cbz      x8, #0x22ff754
  0x22fd0cc: adrp     x9, #0x5511000
  0x22fd0d0: ldr      x9, [x9, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fd0d4: mov      w20, w0
  0x22fd0d8: ldr      w8, [x8, #0x54]
  0x22fd0dc: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5511000)
  0x22fd0e0: ldr      w9, [x19, #0x30]
  0x22fd0e4: ldr      w10, [x0, #0xe0]
  0x22fd0e8: mul      w21, w9, w8
  0x22fd0ec: cbnz     w10, #0x22fd0f4
  0x22fd0f0: bl       #0x218489c ; -> ??? 0x218489c
  0x22fd0f4: mov      w0, w20
  0x22fd0f8: mov      w1, w21
  0x22fd0fc: mov      x2, xzr
  0x22fd100: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x22fd104: mov      w20, w0
  0x22fd108: ldp      x0, x1, [x19, #0x18]
  0x22fd10c: mov      w2, w20
  0x22fd110: mov      x3, xzr
  0x22fd114: bl       #0x2c5bdbc ; -> CFormula$$CalcDamageWG
  0x22fd118: ldr      x8, [x19, #0x20]
  0x22fd11c: cbz      x8, #0x22ff754
  0x22fd120: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x5511378)
  0x22fd124: cbz      x8, #0x22ff754
  0x22fd128: ldr      w9, [x8, #0x38]
  0x22fd12c: sub      w1, w9, w0
  0x22fd130: mov      x0, x8
  0x22fd134: mov      x2, xzr
  0x22fd138: bl       #0x24cc520 ; -> CRageManager$$set_WG
  0x22fd13c: b        #0x22ff4a4
  0x22fd140: ldr      x0, [x19, #0x20]
  0x22fd144: cbz      x0, #0x22ff754
  0x22fd148: mov      w1, wzr
  0x22fd14c: mov      x2, xzr
  0x22fd150: bl       #0x26db9a8 ; -> CCharacterBattle$$GetBuffList
  0x22fd154: adrp     x8, #0x5511000
  0x22fd158: ldr      x8, [x8, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x22fd15c: mov      x20, x0
  0x22fd160: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd164: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22fd168: tbnz     w0, #0, #0x22ff4a4
  0x22fd16c: cbz      x20, #0x22ff754
  0x22fd170: adrp     x8, #0x5511000
  0x22fd174: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22fd178: mov      x0, x20
  0x22fd17c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd180: add      x8, sp, #0x18
  0x22fd184: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fd188: ldur     q0, [sp, #0x18]
  0x22fd18c: ldr      x8, [sp, #0x28]
  0x22fd190: adrp     x23, #0x5511000
  0x22fd194: mov      w22, wzr
  0x22fd198: str      q0, [sp, #0x50]
  0x22fd19c: str      x8, [sp, #0x60]
  0x22fd1a0: ldr      x23, [x23, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22fd1a4: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22fd1a8: add      x0, sp, #0x50
  0x22fd1ac: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fd1b0: tbz      w0, #0, #0x22fd290
  0x22fd1b4: ldr      x20, [sp, #0x60]
  0x22fd1b8: cbz      x20, #0x22fe96c
  0x22fd1bc: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fd1c0: cbz      x8, #0x22fe970
  0x22fd1c4: ldrb     w8, [x8, #0x44]
  0x22fd1c8: cbnz     w8, #0x22fd1a4
  0x22fd1cc: mov      x0, xzr
  0x22fd1d0: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fd1d4: cbz      x0, #0x22fe988
  0x22fd1d8: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd1dc: cbz      x0, #0x22fe984
  0x22fd1e0: mov      x1, xzr
  0x22fd1e4: bl       #0x24cbee4 ; -> CBuffManager.CBuffPool$$GetBuff
  0x22fd1e8: mov      x21, x0
  0x22fd1ec: cbz      x0, #0x22fe980
  0x22fd1f0: ldr      x1, [x20, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fd1f4: ldr      x2, [x19, #0x18]
  0x22fd1f8: ldr      w5, [x20, #0x2c]
  0x22fd1fc: mov      w4, #1
  0x22fd200: mov      x0, x21
  0x22fd204: mov      x3, x2
  0x22fd208: bl       #0x22f4cdc ; -> CBuff$$Initialize
  0x22fd20c: tbz      w0, #0, #0x22fd23c
  0x22fd210: mov      x0, x21
  0x22fd214: bl       #0x22fc38c ; -> CBuff$$Run
  0x22fd218: ldr      w8, [x20, #0x2c]
  0x22fd21c: str      w8, [x21, #0x2c]
  0x22fd220: ldr      x0, [x19, #0x18]
  0x22fd224: cbz      x0, #0x22fe994
  0x22fd228: mov      x1, x21
  0x22fd22c: mov      x2, xzr
  0x22fd230: bl       #0x26daeb8 ; -> CCharacterBattle$$AddBuff
  0x22fd234: add      w22, w22, #1
  0x22fd238: b        #0x22fd25c
  0x22fd23c: mov      x0, xzr
  0x22fd240: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fd244: cbz      x0, #0x22fe990
  0x22fd248: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd24c: cbz      x0, #0x22fe98c
  0x22fd250: mov      x1, x21
  0x22fd254: mov      x2, xzr
  0x22fd258: bl       #0x24cb8a8 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x22fd25c: ldr      x0, [x19, #0x20]
  0x22fd260: cbz      x0, #0x22fe97c
  0x22fd264: mov      w2, #1
  0x22fd268: mov      x1, x20
  0x22fd26c: mov      x3, xzr
  0x22fd270: bl       #0x26db46c ; -> CCharacterBattle$$RemoveBuff
  0x22fd274: ldr      x8, [x26]
  0x22fd278: cbz      x8, #0x22fe978
  0x22fd27c: ldr      w8, [x8, #0x54]
  0x22fd280: ldr      w9, [x19, #0x30]
  0x22fd284: mul      w8, w9, w8
  0x22fd288: cmp      w22, w8
  0x22fd28c: b.lt     #0x22fd1a4
  0x22fd290: adrp     x8, #0x5511000
  0x22fd294: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fd298: add      x0, sp, #0x50
  0x22fd29c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd2a0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fd2a4: b        #0x22ff4a4
  0x22fd2a8: ldr      x0, [x19, #0x20]
  0x22fd2ac: cbz      x0, #0x22ff754
  0x22fd2b0: mov      w1, #1
  0x22fd2b4: mov      w2, w20
  0x22fd2b8: mov      x3, xzr
  0x22fd2bc: mov      w24, #1
  0x22fd2c0: bl       #0x26dc454 ; -> CCharacterBattle$$RemoveBuffs
  0x22fd2c4: tbz      w0, #0, #0x22ff4a8
  0x22fd2c8: ldr      x8, [x19, #0x20]
  0x22fd2cc: cbz      x8, #0x22ff754
  0x22fd2d0: ldr      w8, [x8, #0x21c]
  0x22fd2d4: cbnz     w8, #0x22fe558
  0x22fd2d8: adrp     x21, #0x550f000
  0x22fd2dc: ldr      x21, [x21, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fd2e0: ldr      x20, [x19, #0x18]
  0x22fd2e4: ldr      x0, [x21] ; = 0x0 (u64 @ 0x550f000)
  0x22fd2e8: ldr      w8, [x0, #0xe0]
  0x22fd2ec: cbnz     w8, #0x22fd2f4
  0x22fd2f0: bl       #0x218489c ; -> ??? 0x218489c
  0x22fd2f4: mov      x0, x20
  0x22fd2f8: mov      x1, xzr
  0x22fd2fc: mov      x2, xzr
  0x22fd300: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x22fd304: tbz      w0, #0, #0x22fe520
  0x22fd308: adrp     x8, #0x5511000
  0x22fd30c: ldr      x8, [x8, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fd310: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd314: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fd318: cbz      x0, #0x22ff754
  0x22fd31c: mov      w1, #0x19
  0x22fd320: mov      x2, xzr
  0x22fd324: bl       #0x22ebfbc ; -> CBattleManager$$BattleMissionCheck
  0x22fd328: b        #0x22fe558
  0x22fd32c: ldr      x0, [x19, #0x20]
  0x22fd330: cbz      x0, #0x22ff754
  0x22fd334: mov      w1, #1
  0x22fd338: b        #0x22fdae0
  0x22fd33c: ldr      x8, [x19, #0x20]
  0x22fd340: cbz      x8, #0x22ff754
  0x22fd344: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd348: cbz      x0, #0x22ff754
  0x22fd34c: mov      w1, #0x24
  0x22fd350: mov      x2, xzr
  0x22fd354: bl       #0x27ea21c ; -> CCharacterData$$IsImmune
  0x22fd358: tbnz     w0, #0, #0x22fd37c
  0x22fd35c: ldr      x0, [x19, #0x20]
  0x22fd360: cbz      x0, #0x22ff754
  0x22fd364: mov      x1, xzr
  0x22fd368: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd36c: cbz      x0, #0x22ff754
  0x22fd370: mov      w1, w20
  0x22fd374: mov      x2, xzr
  0x22fd378: bl       #0x24d2d90 ; -> CSkillManager$$AddCoolSecond
  0x22fd37c: ldr      x8, [x19, #0x20]
  0x22fd380: cbz      x8, #0x22ff754
  0x22fd384: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd388: cbz      x0, #0x22ff754
  0x22fd38c: mov      w1, #0x25
  0x22fd390: mov      x2, xzr
  0x22fd394: bl       #0x27ea21c ; -> CCharacterData$$IsImmune
  0x22fd398: tbnz     w0, #0, #0x22fd61c
  0x22fd39c: ldr      x0, [x19, #0x20]
  0x22fd3a0: cbz      x0, #0x22ff754
  0x22fd3a4: mov      x1, xzr
  0x22fd3a8: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd3ac: cbz      x0, #0x22ff754
  0x22fd3b0: mov      w1, w20
  0x22fd3b4: mov      x2, xzr
  0x22fd3b8: bl       #0x24d2df0 ; -> CSkillManager$$AddCoolUltimate
  0x22fd3bc: b        #0x22fd61c
  0x22fd3c0: ldr      x1, [x19, #0x18]
  0x22fd3c4: bl       #0x2300288 ; -> CBuff$$AddUniqueResource
  0x22fd3c8: b        #0x22ff4a4
  0x22fd3cc: ldr      x0, [x19, #0x20]
  0x22fd3d0: cbz      x0, #0x22ff754
  0x22fd3d4: mov      x1, xzr
  0x22fd3d8: bl       #0x27d18e4 ; -> CCharacter$$get_IsGhost
  0x22fd3dc: tbz      w0, #0, #0x22ff4a4
  0x22fd3e0: ldr      x8, [x26]
  0x22fd3e4: cbz      x8, #0x22fd420
  0x22fd3e8: ldr      w9, [x8, #0x50]
  0x22fd3ec: cmp      w9, #2
  0x22fd3f0: b.ne     #0x22fd420
  0x22fd3f4: ldr      x9, [x19, #0x20]
  0x22fd3f8: cbz      x9, #0x22ff754
  0x22fd3fc: ldr      x0, [x9, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd400: cbz      x0, #0x22ff754
  0x22fd404: ldr      w9, [x19, #0x30]
  0x22fd408: ldr      w8, [x8, #0x54]
  0x22fd40c: mov      w1, #1
  0x22fd410: mov      x3, xzr
  0x22fd414: mul      w2, w8, w9
  0x22fd418: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x22fd41c: mov      w20, w0
  0x22fd420: ldr      x0, [x19, #0x20]
  0x22fd424: cbz      x0, #0x22ff754
  0x22fd428: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x22fd42c: mov      w1, w20
  0x22fd430: ldp      x9, x2, [x8, #0x1c8]
  0x22fd434: blr      x9
  0x22fd438: b        #0x22ff4a4
  0x22fd43c: ldr      w1, [x0, #0x4c]
  0x22fd440: cbz      w1, #0x22fd478
  0x22fd444: ldr      x8, [x19, #0x18]
  0x22fd448: cbnz     x8, #0x22fd460
  0x22fd44c: b        #0x22ff754
  0x22fd450: ldr      w1, [x0, #0x4c]
  0x22fd454: cbz      w1, #0x22fd478
  0x22fd458: ldr      x8, [x19, #0x20]
  0x22fd45c: cbz      x8, #0x22ff754
  0x22fd460: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd464: cbz      x0, #0x22ff754
  0x22fd468: mov      w2, w20
  0x22fd46c: mov      x3, xzr
  0x22fd470: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x22fd474: mov      w20, w0
  0x22fd478: ldr      x0, [x19, #0x20]
  0x22fd47c: cbz      x0, #0x22ff754
  0x22fd480: mov      w1, w20
  0x22fd484: mov      x2, xzr
  0x22fd488: bl       #0x26c89d0 ; -> CCharacterBattle$$SetShieldHP
  0x22fd48c: b        #0x22ff4a4
  0x22fd490: ldr      x0, [x19, #0x20]
  0x22fd494: cbz      x0, #0x22ff754
  0x22fd498: mov      x1, xzr
  0x22fd49c: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd4a0: ldr      x8, [x26]
  0x22fd4a4: cbz      x8, #0x22ff754
  0x22fd4a8: cbz      x0, #0x22ff754
  0x22fd4ac: ldr      w1, [x8, #0x58]
  0x22fd4b0: mov      w2, w20
  0x22fd4b4: mov      x3, xzr
  0x22fd4b8: bl       #0x24d2f84 ; -> CSkillManager$$SetMaxUniqueResource
  0x22fd4bc: ldr      x0, [x19, #0x20]
  0x22fd4c0: cbz      x0, #0x22ff754
  0x22fd4c4: mov      x1, xzr
  0x22fd4c8: bl       #0x26c56ac ; -> CCharacterBattle$$get_IsOverNamed
  0x22fd4cc: ldr      x8, [x19, #0x20]
  0x22fd4d0: cbz      x8, #0x22ff754
  0x22fd4d4: tbz      w0, #0, #0x22fdccc
  0x22fd4d8: mov      x0, x8
  0x22fd4dc: mov      x1, xzr
  0x22fd4e0: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd4e4: ldr      x8, [x26]
  0x22fd4e8: cbz      x8, #0x22ff754
  0x22fd4ec: cbz      x0, #0x22ff754
  0x22fd4f0: ldr      w1, [x8, #0x58]
  0x22fd4f4: mov      x2, xzr
  0x22fd4f8: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x22fd4fc: cbz      x0, #0x22ff4a4
  0x22fd500: ldr      x8, [x19, #0x20]
  0x22fd504: cbz      x8, #0x22ff754
  0x22fd508: ldr      x8, [x8, #0x2d8] ; = 0x0 (u64 @ 0x55112d8)
  0x22fd50c: cbz      x8, #0x22ff4a4
  0x22fd510: ldr      x9, [x26]
  0x22fd514: cbz      x9, #0x22ff754
  0x22fd518: ldr      w1, [x9, #0x58]
  0x22fd51c: ldp      w2, w3, [x0, #0x3c]
  0x22fd520: mov      x0, x8
  0x22fd524: mov      x4, xzr
  0x22fd528: bl       #0x28a504c ; -> CHudBossGauge$$UpdateUniqueResource
  0x22fd52c: b        #0x22ff4a4
  0x22fd530: ldr      x0, [x19, #0x20]
  0x22fd534: cbz      x0, #0x22ff754
  0x22fd538: mov      w1, #3
  0x22fd53c: mov      x2, xzr
  0x22fd540: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x22fd544: cbnz     x0, #0x22fd5a0
  0x22fd548: ldr      x8, [x26]
  0x22fd54c: cbz      x8, #0x22fdd14
  0x22fd550: ldr      w1, [x8, #0x4c]
  0x22fd554: cbz      w1, #0x22fdd14
  0x22fd558: ldr      x9, [x19, #0x20]
  0x22fd55c: cbnz     x9, #0x22fdcf4
  0x22fd560: b        #0x22ff754
  0x22fd564: ldr      x0, [x19, #0x20]
  0x22fd568: cbz      x0, #0x22ff754
  0x22fd56c: mov      x1, xzr
  0x22fd570: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd574: cbz      x0, #0x22ff754
  0x22fd578: mov      w1, w20
  0x22fd57c: mov      x2, xzr
  0x22fd580: bl       #0x24d2d90 ; -> CSkillManager$$AddCoolSecond
  0x22fd584: b        #0x22fd61c
  0x22fd588: ldr      x0, [x19, #0x20]
  0x22fd58c: cbz      x0, #0x22ff754
  0x22fd590: mov      w1, #3
  0x22fd594: mov      x2, xzr
  0x22fd598: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x22fd59c: cbz      x0, #0x22fdcdc
  0x22fd5a0: adrp     x8, #0x5511000
  0x22fd5a4: ldr      x19, [x19, #0x20]
  0x22fd5a8: ldr      x8, [x8, #0xa10] ; = 0x0 (u64 @ 0x5511a10)
  0x22fd5ac: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd5b0: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22fd5b4: adrp     x8, #0x5511000
  0x22fd5b8: ldr      x8, [x8, #0xa40] ; = 0x0 (u64 @ 0x5511a40)
  0x22fd5bc: mov      x2, xzr
  0x22fd5c0: mov      x20, x0
  0x22fd5c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd5c8: bl       #0x25a297c ; -> Symbol$$.ctor
  0x22fd5cc: cbz      x19, #0x22ff754
  0x22fd5d0: mov      x0, x19
  0x22fd5d4: mov      x1, xzr
  0x22fd5d8: mov      x2, xzr
  0x22fd5dc: mov      x3, x20
  0x22fd5e0: mov      w4, wzr
  0x22fd5e4: mov      w5, wzr
  0x22fd5e8: mov      w6, wzr
  0x22fd5ec: mov      w7, wzr
  0x22fd5f0: str      xzr, [sp]
  0x22fd5f4: bl       #0x26c6980 ; -> CCharacterBattle$$PlayBuffEffect
  0x22fd5f8: b        #0x22ff4a4
  0x22fd5fc: ldr      x0, [x19, #0x20]
  0x22fd600: cbz      x0, #0x22ff754
  0x22fd604: mov      x1, xzr
  0x22fd608: bl       #0x27d1574 ; -> CCharacter$$get_SkillManager
  0x22fd60c: cbz      x0, #0x22ff754
  0x22fd610: mov      w1, w20
  0x22fd614: mov      x2, xzr
  0x22fd618: bl       #0x24d2eb0 ; -> CSkillManager$$ReduceCoolMax
  0x22fd61c: ldr      x8, [x19, #0x20]
  0x22fd620: cbz      x8, #0x22ff754
  0x22fd624: ldr      x0, [x8, #0x2d8] ; = 0x0 (u64 @ 0x55112d8)
  0x22fd628: cbz      x0, #0x22ff4a4
  0x22fd62c: mov      x1, xzr
  0x22fd630: bl       #0x28a4de0 ; -> CHudBossGauge$$SetSkillButtons
  0x22fd634: b        #0x22ff4a4
  0x22fd638: ldr      w1, [x0, #0x4c]
  0x22fd63c: cbz      w1, #0x22fd73c
  0x22fd640: ldr      x8, [x19, #0x18]
  0x22fd644: cbz      x8, #0x22ff754
  0x22fd648: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fd64c: cbz      x0, #0x22ff754
  0x22fd650: mov      w2, w20
  0x22fd654: mov      x3, xzr
  0x22fd658: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x22fd65c: adrp     x21, #0x5955000
  0x22fd660: ldrb     w8, [x21, #0x8f3]
  0x22fd664: mov      w20, w0
  0x22fd668: cbnz     w8, #0x22fd680
  0x22fd66c: adrp     x0, #0x5511000
  0x22fd670: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd674: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fd678: mov      w8, #1
  0x22fd67c: strb     w8, [x21, #0x8f3]
  0x22fd680: adrp     x22, #0x5511000
  0x22fd684: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd688: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fd68c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fd690: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd694: cbz      x0, #0x22ff754
  0x22fd698: mov      x1, xzr
  0x22fd69c: bl       #0x2548c30 ; -> CDungeonScene$$get_IsPvp
  0x22fd6a0: tbnz     w0, #0, #0x22fd6dc
  0x22fd6a4: ldrb     w8, [x21, #0x8f3]
  0x22fd6a8: cbnz     w8, #0x22fd6c0
  0x22fd6ac: adrp     x0, #0x5511000
  0x22fd6b0: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd6b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fd6b8: mov      w8, #1
  0x22fd6bc: strb     w8, [x21, #0x8f3]
  0x22fd6c0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fd6c4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fd6c8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd6cc: cbz      x0, #0x22ff754
  0x22fd6d0: mov      x1, xzr
  0x22fd6d4: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x22fd6d8: tbz      w0, #0, #0x22fd73c
  0x22fd6dc: ldrb     w8, [x21, #0x8f3]
  0x22fd6e0: cbnz     w8, #0x22fd6f8
  0x22fd6e4: adrp     x0, #0x5511000
  0x22fd6e8: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd6ec: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fd6f0: mov      w8, #1
  0x22fd6f4: strb     w8, [x21, #0x8f3]
  0x22fd6f8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fd6fc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fd700: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd704: cbz      x8, #0x22ff754
  0x22fd708: adrp     x9, #0x5511000
  0x22fd70c: ldr      x9, [x9, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fd710: ldr      w21, [x8, #0x100]
  0x22fd714: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5511000)
  0x22fd718: ldr      w9, [x0, #0xe0]
  0x22fd71c: cbnz     w9, #0x22fd724
  0x22fd720: bl       #0x218489c ; -> ??? 0x218489c
  0x22fd724: mov      w8, #0x3e8
  0x22fd728: sub      w1, w8, w21
  0x22fd72c: mov      w0, w20
  0x22fd730: mov      x2, xzr
  0x22fd734: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x22fd738: mov      w20, w0
  0x22fd73c: ldr      x0, [x19, #0x20]
  0x22fd740: cbz      x0, #0x22ff754
  0x22fd744: mov      w2, #1
  0x22fd748: mov      w1, w20
  0x22fd74c: mov      w3, wzr
  0x22fd750: mov      w4, wzr
  0x22fd754: mov      x5, xzr
  0x22fd758: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x22fd75c: ldr      x8, [x19, #0x20]
  0x22fd760: cbz      x8, #0x22ff754
  0x22fd764: mov      w20, w0
  0x22fd768: mov      x0, x8
  0x22fd76c: mov      x1, xzr
  0x22fd770: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fd774: cbz      x0, #0x22ff754
  0x22fd778: ldr      w8, [x0, #0xa8]
  0x22fd77c: add      w8, w8, w20
  0x22fd780: str      w8, [x0, #0xa8]
  0x22fd784: ldr      x0, [x19, #0x20]
  0x22fd788: cbz      x0, #0x22ff754
  0x22fd78c: mov      x1, xzr
  0x22fd790: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fd794: ldr      x8, [x19, #0x18]
  0x22fd798: cbz      x8, #0x22ff754
  0x22fd79c: mov      x21, x0
  0x22fd7a0: mov      x0, x8
  0x22fd7a4: mov      x1, xzr
  0x22fd7a8: bl       #0x27d1500 ; -> CCharacter$$get_UID
  0x22fd7ac: cbz      x21, #0x22ff754
  0x22fd7b0: mov      x1, x0
  0x22fd7b4: mov      x0, x21
  0x22fd7b8: mov      w2, w20
  0x22fd7bc: mov      x3, xzr
  0x22fd7c0: bl       #0x2548e58 ; -> CTeam$$AddTotalHeal
  0x22fd7c4: adrp     x21, #0x5955000
  0x22fd7c8: ldrb     w8, [x21, #0x8f3]
  0x22fd7cc: cbnz     w8, #0x22fd7e4
  0x22fd7d0: adrp     x0, #0x5511000
  0x22fd7d4: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd7d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fd7dc: mov      w8, #1
  0x22fd7e0: strb     w8, [x21, #0x8f3]
  0x22fd7e4: adrp     x8, #0x5511000
  0x22fd7e8: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fd7ec: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd7f0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fd7f4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd7f8: cbz      x8, #0x22ff754
  0x22fd7fc: ldr      x0, [x19, #0x20]
  0x22fd800: cbz      x0, #0x22ff754
  0x22fd804: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x5511068)
  0x22fd808: mov      x1, xzr
  0x22fd80c: bl       #0x4f7f1a8 ; -> UnityEngine.Component$$get_transform
  0x22fd810: cbz      x21, #0x22ff754
  0x22fd814: mov      x4, x0
  0x22fd818: mov      w2, #1
  0x22fd81c: mov      x0, x21
  0x22fd820: mov      w1, w20
  0x22fd824: mov      w3, wzr
  0x22fd828: mov      w5, wzr
  0x22fd82c: mov      x6, xzr
  0x22fd830: bl       #0x28bc9fc ; -> CUIHud$$PlayHudTextDamage
  0x22fd834: ldr      x0, [x19, #0x20]
  0x22fd838: cbz      x0, #0x22ff754
  0x22fd83c: mov      x1, xzr
  0x22fd840: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fd844: cbz      x0, #0x22ff754
  0x22fd848: ldr      w8, [x0, #0x48]
  0x22fd84c: cbnz     w8, #0x22ff4a4
  0x22fd850: adrp     x20, #0x5511000
  0x22fd854: ldr      x20, [x20, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fd858: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x22fd85c: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fd860: cbz      x0, #0x22ff754
  0x22fd864: mov      w1, #0x10
  0x22fd868: mov      x2, xzr
  0x22fd86c: bl       #0x22ebfbc ; -> CBattleManager$$BattleMissionCheck
  0x22fd870: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x22fd874: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fd878: cbz      x0, #0x22ff754
  0x22fd87c: ldr      x2, [x19, #0x20]
  0x22fd880: mov      w1, #0x18
  0x22fd884: mov      x3, xzr
  0x22fd888: bl       #0x22ec1d8 ; -> CBattleManager$$BattleMissionCheck
  0x22fd88c: b        #0x22ff4a4
  0x22fd890: ldr      x20, [x19, #0x20]
  0x22fd894: mov      x0, x19
  0x22fd898: bl       #0x22ffed4 ; -> CBuff$$GetActionGaugeEnhanceValue
  0x22fd89c: cbz      x20, #0x22ff754
  0x22fd8a0: mov      w1, w0
  0x22fd8a4: mov      w2, #1
  0x22fd8a8: mov      x0, x20
  0x22fd8ac: mov      x3, xzr
  0x22fd8b0: mov      w21, #1
  0x22fd8b4: bl       #0x26c5d58 ; -> CCharacterBattle$$AddActionPoint
  0x22fd8b8: adrp     x20, #0x5955000
  0x22fd8bc: ldrb     w8, [x20, #0x8fb]
  0x22fd8c0: cbnz     w8, #0x22fd8d4
  0x22fd8c4: adrp     x0, #0x5511000
  0x22fd8c8: ldr      x0, [x0, #0xcb0] ; = 0x0 (u64 @ 0x5511cb0)
  0x22fd8cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fd8d0: strb     w21, [x20, #0x8fb]
  0x22fd8d4: adrp     x8, #0x5511000
  0x22fd8d8: ldr      x8, [x8, #0xcb0] ; = 0x0 (u64 @ 0x5511cb0)
  0x22fd8dc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd8e0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fd8e4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd8e8: cbz      x0, #0x22ff754
  0x22fd8ec: ldr      x1, [x19, #0x20]
  0x22fd8f0: mov      x2, xzr
  0x22fd8f4: bl       #0x28ba200 ; -> CHudTurnSequencePanel$$JumpIcon
  0x22fd8f8: b        #0x22ff4a4
  0x22fd8fc: adrp     x8, #0x5511000
  0x22fd900: ldr      x8, [x8, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22fd904: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fd908: ldr      w8, [x0, #0xe0]
  0x22fd90c: cbnz     w8, #0x22fd914
  0x22fd910: bl       #0x218489c ; -> ??? 0x218489c
  0x22fd914: mov      x0, xzr
  0x22fd918: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x22fd91c: ldr      x8, [x26]
  0x22fd920: cbz      x8, #0x22ff754
  0x22fd924: cbz      x0, #0x22ff754
  0x22fd928: ldr      w9, [x19, #0x30]
  0x22fd92c: ldr      w8, [x8, #0x54]
  0x22fd930: mov      x2, xzr
  0x22fd934: mul      w1, w8, w9
  0x22fd938: bl       #0x25ee9e8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x22fd93c: cbz      x0, #0x22fde80
  0x22fd940: adrp     x8, #0x5512000
  0x22fd944: ldr      x20, [x0, #0x18] ; = 0x0 (u64 @ 0x5511018)
  0x22fd948: ldr      x8, [x8, #0x460] ; = 0x0 (u64 @ 0x5512460)
  0x22fd94c: mov      x0, x20
  0x22fd950: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fd954: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22fd958: tbnz     w0, #0, #0x22ff4a4
  0x22fd95c: cbz      x20, #0x22ff754
  0x22fd960: ldr      w8, [x20, #0x18]
  0x22fd964: cmp      w8, #1
  0x22fd968: b.lt     #0x22ff4a4
  0x22fd96c: adrp     x25, #0x5512000
  0x22fd970: ldr      x25, [x25, #0x458] ; = 0x0 (u64 @ 0x5512458)
  0x22fd974: mov      x22, xzr
  0x22fd978: add      x23, x20, #0x20
  0x22fd97c: mov      w24, #1
  0x22fd980: cmp      w22, w8
  0x22fd984: b.hs     #0x22fe974
  0x22fd988: ldr      x21, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x5511003)
  0x22fd98c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5512000)
  0x22fd990: mov      x0, x21
  0x22fd994: bl       #0x33c39a4 ; -> CExtension$$IsNullOrEmpty<char>
  0x22fd998: tbnz     w0, #0, #0x22fd9e4
  0x22fd99c: ldr      x0, [x19, #0x20]
  0x22fd9a0: cbz      x0, #0x22ff754
  0x22fd9a4: mov      x1, x21
  0x22fd9a8: mov      x2, xzr
  0x22fd9ac: bl       #0x26db830 ; -> CCharacterBattle$$FindBuff
  0x22fd9b0: cbz      x0, #0x22fd9e4
  0x22fd9b4: mov      x1, x0
  0x22fd9b8: ldr      x0, [x19, #0x20]
  0x22fd9bc: cbz      x0, #0x22ff754
  0x22fd9c0: mov      w2, #1
  0x22fd9c4: mov      x3, xzr
  0x22fd9c8: bl       #0x26db46c ; -> CCharacterBattle$$RemoveBuff
  0x22fd9cc: ldr      x8, [x19, #0x20]
  0x22fd9d0: cbz      x8, #0x22ff754
  0x22fd9d4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5512028)
  0x22fd9d8: cbz      x0, #0x22ff754
  0x22fd9dc: mov      x1, xzr
  0x22fd9e0: bl       #0x27deb64 ; -> CCharacterData$$SetStatDirty
  0x22fd9e4: add      x22, x22, #1
  0x22fd9e8: str      w22, [sp, #0x6c]
  0x22fd9ec: ldr      w8, [x20, #0x18]
  0x22fd9f0: cmp      w22, w8
  0x22fd9f4: b.lt     #0x22fd980
  0x22fd9f8: b        #0x22ff4a8
  0x22fd9fc: sub      w8, w8, #0x8a
  0x22fda00: cmp      w8, #0xa
  0x22fda04: mov      w24, #1
  0x22fda08: b.hi     #0x22ff4a8
  0x22fda0c: adrp     x9, #0x1056000
  0x22fda10: add      x9, x9, #0x954
  0x22fda14: adr      x10, #0x22fda24
  0x22fda18: ldrh     w11, [x9, x8, lsl #1]
  0x22fda1c: add      x10, x10, x11, lsl #2
  0x22fda20: br       x10
  0x22fda24: ldr      w8, [x0, #0x24]
  0x22fda28: cmp      w8, #0x20
  0x22fda2c: b.eq     #0x22fdb2c
  0x22fda30: cmp      w8, #0x1f
  0x22fda34: b.eq     #0x22fdb00
  0x22fda38: cmp      w8, #0x1d
  0x22fda3c: b.ne     #0x22fdc38
  0x22fda40: ldr      w8, [x0, #0xd8]
  0x22fda44: cbz      w8, #0x22fdc38
  0x22fda48: mov      x1, xzr
  0x22fda4c: bl       #0x25a73ec ; -> CBuffTemplet$$get_IsDebuff
  0x22fda50: ldr      x8, [x19, #0x20]
  0x22fda54: cbz      x8, #0x22ff754
  0x22fda58: tst      w0, #1
  0x22fda5c: mov      w9, #0x1b
  0x22fda60: cinc     w1, w9, ne
  0x22fda64: mov      x0, x8
  0x22fda68: mov      x2, xzr
  0x22fda6c: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x22fda70: cbz      x0, #0x22fdc38
  0x22fda74: ldr      x8, [x19, #0x10]
  0x22fda78: mov      w9, #1
  0x22fda7c: strb     w9, [x19, #0x34]
  0x22fda80: cbz      x8, #0x22ff754
  0x22fda84: ldr      x9, [x0, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fda88: cbz      x9, #0x22ff754
  0x22fda8c: ldr      w10, [x8, #0x54]
  0x22fda90: adrp     x8, #0x5511000
  0x22fda94: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x22fda98: ldr      w11, [x19, #0x30]
  0x22fda9c: ldr      w9, [x9, #0x54]
  0x22fdaa0: ldr      w12, [x0, #0x30]
  0x22fdaa4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fdaa8: mul      w21, w11, w10
  0x22fdaac: mul      w20, w12, w9
  0x22fdab0: ldr      w13, [x8, #0xe0]
  0x22fdab4: cbnz     w13, #0x22fdac0
  0x22fdab8: mov      x0, x8
  0x22fdabc: bl       #0x218489c ; -> ??? 0x218489c
  0x22fdac0: mov      w0, w21
  0x22fdac4: mov      w1, w20
  0x22fdac8: mov      x2, xzr
  0x22fdacc: bl       #0x28d18e4 ; -> CCommonDefine$$ApplyRate
  0x22fdad0: b        #0x22fdc34
  0x22fdad4: ldr      x0, [x19, #0x20]
  0x22fdad8: cbz      x0, #0x22ff754
  0x22fdadc: mov      w1, wzr
  0x22fdae0: mov      w2, w20
  0x22fdae4: mov      x3, xzr
  0x22fdae8: bl       #0x26dcf0c ; -> CCharacterBattle$$ExtendBuff
  0x22fdaec: ldr      x0, [x19, #0x20]
  0x22fdaf0: cbz      x0, #0x22ff754
  0x22fdaf4: mov      x1, xzr
  0x22fdaf8: bl       #0x26dcffc ; -> CCharacterBattle$$ClearBuffFinishDuration
  0x22fdafc: b        #0x22ff4a4
  0x22fdb00: ldr      x8, [x19, #0x20]
  0x22fdb04: mov      w9, #1
  0x22fdb08: strb     w9, [x19, #0x34]
  0x22fdb0c: cbz      x8, #0x22ff754
  0x22fdb10: ldr      w9, [x19, #0x30]
  0x22fdb14: ldr      w10, [x0, #0x54]
  0x22fdb18: mov      x0, x8
  0x22fdb1c: mov      x2, xzr
  0x22fdb20: mul      w1, w10, w9
  0x22fdb24: bl       #0x26c6cbc ; -> CCharacterBattle$$GetLostHPRateValue
  0x22fdb28: b        #0x22fdc34
  0x22fdb2c: ldr      x0, [x19, #0x20]
  0x22fdb30: mov      w8, #1
  0x22fdb34: strb     w8, [x19, #0x34]
  0x22fdb38: cbz      x0, #0x22ff754
  0x22fdb3c: mov      x1, xzr
  0x22fdb40: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdb44: ldr      x8, [x19, #0x20]
  0x22fdb48: cbz      x8, #0x22ff754
  0x22fdb4c: mov      w20, w0
  0x22fdb50: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fdb54: cbz      x0, #0x22ff754
  0x22fdb58: mov      x1, xzr
  0x22fdb5c: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x22fdb60: ldr      x8, [x19, #0x20]
  0x22fdb64: cbz      x8, #0x22ff754
  0x22fdb68: mov      w21, w0
  0x22fdb6c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fdb70: cbz      x0, #0x22ff754
  0x22fdb74: mov      x1, xzr
  0x22fdb78: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x22fdb7c: adrp     x23, #0x550f000
  0x22fdb80: ldr      x23, [x23, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x22fdb84: mov      w22, w0
  0x22fdb88: ldr      x8, [x23] ; = 0x0 (u64 @ 0x550f000)
  0x22fdb8c: ldr      w9, [x8, #0xe0]
  0x22fdb90: cbnz     w9, #0x22fdb9c
  0x22fdb94: mov      x0, x8
  0x22fdb98: bl       #0x218489c ; -> ??? 0x218489c
  0x22fdb9c: adrp     x24, #0x5955000
  0x22fdba0: ldrb     w8, [x24, #0x93a]
  0x22fdba4: sbfiz    x9, x20, #1, #0x20
  0x22fdba8: sub      x21, x9, w21, sxtw
  0x22fdbac: sxtw     x20, w22
  0x22fdbb0: cbnz     w8, #0x22fdbd4
  0x22fdbb4: adrp     x0, #0x5512000
  0x22fdbb8: ldr      x0, [x0, #0x518] ; = 0x0 (u64 @ 0x5512518)
  0x22fdbbc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fdbc0: adrp     x0, #0x550f000
  0x22fdbc4: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x22fdbc8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fdbcc: mov      w8, #1
  0x22fdbd0: strb     w8, [x24, #0x93a]
  0x22fdbd4: tbz      w22, #0x1f, #0x22fdc00
  0x22fdbd8: ldr      x0, [x23] ; = 0x0 (u64 @ 0x550f000)
  0x22fdbdc: ldr      w8, [x0, #0xe0]
  0x22fdbe0: cbnz     w8, #0x22fdbe8
  0x22fdbe4: bl       #0x218489c ; -> ??? 0x218489c
  0x22fdbe8: adrp     x8, #0x5512000
  0x22fdbec: ldr      x8, [x8, #0x518] ; = 0x0 (u64 @ 0x5512518)
  0x22fdbf0: mov      x0, xzr
  0x22fdbf4: mov      x1, x20
  0x22fdbf8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fdbfc: bl       #0x347727c ; -> System.Math$$ThrowMinMaxException<long>
  0x22fdc00: ldr      x8, [x19, #0x10]
  0x22fdc04: cmp      x21, x20
  0x22fdc08: csel     w9, w20, w21, gt
  0x22fdc0c: cmp      x21, #0
  0x22fdc10: csel     w1, wzr, w9, lt
  0x22fdc14: cbz      x8, #0x22ff754
  0x22fdc18: ldr      x0, [x19, #0x20]
  0x22fdc1c: cbz      x0, #0x22ff754
  0x22fdc20: ldr      w9, [x19, #0x30]
  0x22fdc24: ldr      w8, [x8, #0x54]
  0x22fdc28: mov      x3, xzr
  0x22fdc2c: mul      w2, w8, w9
  0x22fdc30: bl       #0x26c6d40 ; -> CCharacterBattle$$GetLostHPRateValue
  0x22fdc34: str      w0, [x19, #0x38]
  0x22fdc38: ldr      x8, [x26]
  0x22fdc3c: cbz      x8, #0x22ff4a4
  0x22fdc40: ldr      w8, [x8, #0x4c]
  0x22fdc44: cbz      w8, #0x22ff4a4
  0x22fdc48: cmp      w8, #1
  0x22fdc4c: b.ne     #0x22fdcac
  0x22fdc50: ldr      x0, [x19, #0x20]
  0x22fdc54: cbz      x0, #0x22ff754
  0x22fdc58: mov      x1, xzr
  0x22fdc5c: bl       #0x26c6c84 ; -> CCharacterBattle$$get_IsFullHP
  0x22fdc60: ldr      x8, [x19, #0x20]
  0x22fdc64: cbz      x8, #0x22ff754
  0x22fdc68: tbz      w0, #0, #0x22fdef0
  0x22fdc6c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5512028)
  0x22fdc70: cbz      x0, #0x22ff754
  0x22fdc74: mov      x1, x19
  0x22fdc78: mov      x2, xzr
  0x22fdc7c: bl       #0x27e7874 ; -> CCharacterData$$AddStatBuff
  0x22fdc80: ldr      x19, [x19, #0x20]
  0x22fdc84: cbz      x19, #0x22ff754
  0x22fdc88: ldr      x0, [x19, #0x28]
  0x22fdc8c: cbz      x0, #0x22ff754
  0x22fdc90: mov      x1, xzr
  0x22fdc94: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x22fdc98: mov      w1, w0
  0x22fdc9c: mov      w4, #1
  0x22fdca0: mov      w24, #1
  0x22fdca4: mov      x0, x19
  0x22fdca8: b        #0x22fe458
  0x22fdcac: ldr      x8, [x19, #0x20]
  0x22fdcb0: cbz      x8, #0x22ff754
  0x22fdcb4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5512028)
  0x22fdcb8: cbz      x0, #0x22ff754
  0x22fdcbc: mov      x1, x19
  0x22fdcc0: mov      x2, xzr
  0x22fdcc4: bl       #0x27e7874 ; -> CCharacterData$$AddStatBuff
  0x22fdcc8: b        #0x22ff4a4
  0x22fdccc: mov      x0, x8
  0x22fdcd0: mov      x1, xzr
  0x22fdcd4: bl       #0x26dae60 ; -> CCharacterBattle$$UpdateBuffIcon
  0x22fdcd8: b        #0x22ff4a4
  0x22fdcdc: ldr      x8, [x26]
  0x22fdce0: cbz      x8, #0x22fdd14
  0x22fdce4: ldr      w1, [x8, #0x4c]
  0x22fdce8: cbz      w1, #0x22fdd14
  0x22fdcec: ldr      x9, [x19, #0x18]
  0x22fdcf0: cbz      x9, #0x22ff754
  0x22fdcf4: ldr      x0, [x9, #0x28] ; = 0x3f8000003e48c8c9 (u64 @ 0x1056028)
  0x22fdcf8: cbz      x0, #0x22ff754
  0x22fdcfc: ldr      w9, [x19, #0x30]
  0x22fdd00: ldr      w8, [x8, #0x54]
  0x22fdd04: mov      x3, xzr
  0x22fdd08: mul      w2, w8, w9
  0x22fdd0c: bl       #0x27e14b8 ; -> CCharacterData$$GetStatValuePermille
  0x22fdd10: mov      w20, w0
  0x22fdd14: mov      x0, x19
  0x22fdd18: mov      w1, w20
  0x22fdd1c: bl       #0x22ffd44 ; -> CBuff$$CheckReverseHealCAP
  0x22fdd20: ldr      x8, [x19, #0x20]
  0x22fdd24: cbz      x8, #0x22ff754
  0x22fdd28: mov      w20, w0
  0x22fdd2c: mov      x0, x8
  0x22fdd30: mov      x1, xzr
  0x22fdd34: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdd38: ldr      x8, [x19, #0x20]
  0x22fdd3c: cbz      x8, #0x22ff754
  0x22fdd40: mov      w21, w0
  0x22fdd44: mov      x0, x8
  0x22fdd48: mov      x1, xzr
  0x22fdd4c: bl       #0x26c5fc4 ; -> CCharacterBattle$$get_ShieldHP
  0x22fdd50: add      w8, w0, w21
  0x22fdd54: cmp      w8, w20
  0x22fdd58: b.gt     #0x22fde5c
  0x22fdd5c: adrp     x21, #0x5955000
  0x22fdd60: ldrb     w8, [x21, #0x8f3]
  0x22fdd64: cbnz     w8, #0x22fdd7c
  0x22fdd68: adrp     x0, #0x5511000
  0x22fdd6c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fdd70: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fdd74: mov      w8, #1
  0x22fdd78: strb     w8, [x21, #0x8f3]
  0x22fdd7c: adrp     x22, #0x5511000
  0x22fdd80: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fdd84: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fdd88: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22fdd8c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fdd90: cbz      x0, #0x22ff754
  0x22fdd94: mov      x1, xzr
  0x22fdd98: bl       #0x2550f88 ; -> CDungeonScene$$get_IsGuildDungeon
  0x22fdd9c: tbnz     w0, #0, #0x22fde48
  0x22fdda0: ldrb     w8, [x21, #0x8f3]
  0x22fdda4: cbnz     w8, #0x22fddbc
  0x22fdda8: adrp     x0, #0x5511000
  0x22fddac: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fddb0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fddb4: mov      w8, #1
  0x22fddb8: strb     w8, [x21, #0x8f3]
  0x22fddbc: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fddc0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22fddc4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fddc8: cbz      x0, #0x22ff754
  0x22fddcc: mov      x1, xzr
  0x22fddd0: bl       #0x2550fd4 ; -> CDungeonScene$$get_IsEventChallenge
  0x22fddd4: tbnz     w0, #0, #0x22fde48
  0x22fddd8: ldrb     w8, [x21, #0x8f3]
  0x22fdddc: cbnz     w8, #0x22fddf4
  0x22fdde0: adrp     x0, #0x5511000
  0x22fdde4: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fdde8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fddec: mov      w8, #1
  0x22fddf0: strb     w8, [x21, #0x8f3]
  0x22fddf4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fddf8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22fddfc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fde00: cbz      x0, #0x22ff754
  0x22fde04: mov      x1, xzr
  0x22fde08: bl       #0x2548e34 ; -> CDungeonScene$$get_IsWorldBoss
  0x22fde0c: tbnz     w0, #0, #0x22fde48
  0x22fde10: ldrb     w8, [x21, #0x8f3]
  0x22fde14: cbnz     w8, #0x22fde2c
  0x22fde18: adrp     x0, #0x5511000
  0x22fde1c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x22fde20: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fde24: mov      w8, #1
  0x22fde28: strb     w8, [x21, #0x8f3]
  0x22fde2c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fde30: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22fde34: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fde38: cbz      x0, #0x22ff754
  0x22fde3c: mov      x1, xzr
  0x22fde40: bl       #0x2551068 ; -> CDungeonScene$$get_IsMonadGateSingularity
  0x22fde44: tbz      w0, #0, #0x22fdf84
  0x22fde48: ldr      x0, [x19, #0x20]
  0x22fde4c: cbz      x0, #0x22ff754
  0x22fde50: mov      x1, xzr
  0x22fde54: bl       #0x26c5664 ; -> CCharacterBattle$$get_IsBoss
  0x22fde58: tbz      w0, #0, #0x22fdf84
  0x22fde5c: ldr      x0, [x19, #0x20]
  0x22fde60: cbz      x0, #0x22ff754
  0x22fde64: neg      w1, w20
  0x22fde68: mov      w2, wzr
  0x22fde6c: mov      w3, wzr
  0x22fde70: mov      w4, wzr
  0x22fde74: mov      x5, xzr
  0x22fde78: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x22fde7c: b        #0x22fe000
  0x22fde80: ldr      x8, [x26]
  0x22fde84: cbz      x8, #0x22ff754
  0x22fde88: ldr      w8, [x8, #0x54]
  0x22fde8c: ldr      w9, [x19, #0x30]
  0x22fde90: add      x0, sp, #0x6c
  0x22fde94: mov      x1, xzr
  0x22fde98: mul      w8, w9, w8
  0x22fde9c: str      w8, [sp, #0x6c]
  0x22fdea0: bl       #0x48a1298 ; -> System.Int32$$ToString
  0x22fdea4: adrp     x8, #0x5512000
  0x22fdea8: ldr      x8, [x8, #0x4d8] ; = 0x0 (u64 @ 0x55124d8)
  0x22fdeac: mov      x1, x0
  0x22fdeb0: mov      x2, xzr
  0x22fdeb4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fdeb8: mov      x0, x8
  0x22fdebc: bl       #0x470c0a0 ; -> System.String$$Concat
  0x22fdec0: adrp     x8, #0x5511000
  0x22fdec4: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fdec8: mov      x19, x0
  0x22fdecc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fded0: ldr      w9, [x8, #0xe0]
  0x22fded4: cbnz     w9, #0x22fdee0
  0x22fded8: mov      x0, x8
  0x22fdedc: bl       #0x218489c ; -> ??? 0x218489c
  0x22fdee0: mov      x0, x19
  0x22fdee4: mov      x1, xzr
  0x22fdee8: bl       #0x2c4fde4 ; -> CDebug$$LogWarning
  0x22fdeec: b        #0x22ff4a4
  0x22fdef0: mov      x0, x8
  0x22fdef4: mov      x1, xzr
  0x22fdef8: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdefc: ldr      x8, [x19, #0x20]
  0x22fdf00: cbz      x8, #0x22ff754
  0x22fdf04: mov      w20, w0
  0x22fdf08: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fdf0c: cbz      x0, #0x22ff754
  0x22fdf10: mov      x1, xzr
  0x22fdf14: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x22fdf18: ldr      x8, [x19, #0x20]
  0x22fdf1c: cbz      x8, #0x22ff754
  0x22fdf20: mov      w21, w0
  0x22fdf24: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fdf28: cbz      x0, #0x22ff754
  0x22fdf2c: mov      x1, x19
  0x22fdf30: mov      x2, xzr
  0x22fdf34: bl       #0x27e7874 ; -> CCharacterData$$AddStatBuff
  0x22fdf38: cmp      w21, #1
  0x22fdf3c: b.lt     #0x22fe444
  0x22fdf40: ldr      x8, [x19, #0x20]
  0x22fdf44: cbz      x8, #0x22ff754
  0x22fdf48: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x22fdf4c: cbz      x0, #0x22ff754
  0x22fdf50: mov      x1, xzr
  0x22fdf54: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x22fdf58: ldr      x8, [x19, #0x20]
  0x22fdf5c: cbz      x8, #0x22ff754
  0x22fdf60: mov      w22, w0
  0x22fdf64: mov      x0, x8
  0x22fdf68: mov      x1, xzr
  0x22fdf6c: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdf70: smull    x8, w22, w20
  0x22fdf74: mov      w9, w21
  0x22fdf78: sdiv     x8, x8, x9
  0x22fdf7c: sub      w1, w8, w0
  0x22fdf80: b        #0x22fe448
  0x22fdf84: ldr      x0, [x19, #0x20]
  0x22fdf88: cbz      x0, #0x22ff754
  0x22fdf8c: mov      x1, xzr
  0x22fdf90: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdf94: ldr      x21, [x19, #0x20]
  0x22fdf98: cbz      x21, #0x22ff754
  0x22fdf9c: mov      w20, w0
  0x22fdfa0: mov      x0, x21
  0x22fdfa4: mov      x1, xzr
  0x22fdfa8: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x22fdfac: ldr      x8, [x19, #0x20]
  0x22fdfb0: cbz      x8, #0x22ff754
  0x22fdfb4: mov      w22, w0
  0x22fdfb8: mov      x0, x8
  0x22fdfbc: mov      x1, xzr
  0x22fdfc0: bl       #0x26c5fc4 ; -> CCharacterBattle$$get_ShieldHP
  0x22fdfc4: add      w8, w22, w0
  0x22fdfc8: mov      w9, #1
  0x22fdfcc: sub      w1, w9, w8
  0x22fdfd0: mov      x0, x21
  0x22fdfd4: mov      w2, wzr
  0x22fdfd8: mov      w3, wzr
  0x22fdfdc: mov      w4, wzr
  0x22fdfe0: mov      x5, xzr
  0x22fdfe4: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x22fdfe8: ldr      x0, [x19, #0x20]
  0x22fdfec: cbz      x0, #0x22ff754
  0x22fdff0: mov      x1, xzr
  0x22fdff4: bl       #0x26c5fc4 ; -> CCharacterBattle$$get_ShieldHP
  0x22fdff8: add      w8, w20, w0
  0x22fdffc: sub      w20, w8, #1
  0x22fe000: cbz      w20, #0x22ff4a4
  0x22fe004: adrp     x22, #0x5955000
  0x22fe008: ldrb     w8, [x22, #0x939]
  0x22fe00c: ldp      x21, x19, [x19, #0x18]
  0x22fe010: cbnz     w8, #0x22fe028
  0x22fe014: adrp     x0, #0x550f000
  0x22fe018: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x22fe01c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fe020: mov      w8, #1
  0x22fe024: strb     w8, [x22, #0x939]
  0x22fe028: adrp     x8, #0x550f000
  0x22fe02c: ldr      x8, [x8, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x22fe030: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe034: ldr      w8, [x0, #0xe0]
  0x22fe038: cbnz     w8, #0x22fe040
  0x22fe03c: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe040: cmp      w20, #0
  0x22fe044: cneg     w2, w20, mi
  0x22fe048: mov      x0, x21
  0x22fe04c: mov      x1, x19
  0x22fe050: mov      w3, wzr
  0x22fe054: mov      x4, xzr
  0x22fe058: bl       #0x22e76a8 ; -> CBattleManager$$ShowDamage
  0x22fe05c: b        #0x22ff4a4
  0x22fe060: ldr      x8, [x19, #0x20]
  0x22fe064: cbz      x8, #0x22ff754
  0x22fe068: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x550f088)
  0x22fe06c: cbz      x0, #0x22ff754
  0x22fe070: mov      w1, #1
  0x22fe074: mov      x2, xzr
  0x22fe078: mov      w24, #1
  0x22fe07c: bl       #0x252c950 ; -> CCharacterRender$$ToggleObject
  0x22fe080: b        #0x22ff4a8
  0x22fe084: adrp     x8, #0x5511000
  0x22fe088: ldr      x8, [x8, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22fe08c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe090: ldr      w8, [x0, #0xe0]
  0x22fe094: cbnz     w8, #0x22fe09c
  0x22fe098: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe09c: mov      x0, xzr
  0x22fe0a0: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x22fe0a4: ldr      x8, [x26]
  0x22fe0a8: cbz      x8, #0x22ff754
  0x22fe0ac: cbz      x0, #0x22ff754
  0x22fe0b0: ldr      w9, [x19, #0x30]
  0x22fe0b4: ldr      w8, [x8, #0x54]
  0x22fe0b8: mov      x2, xzr
  0x22fe0bc: mul      w1, w8, w9
  0x22fe0c0: bl       #0x25ee9e8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x22fe0c4: cbz      x0, #0x22fe46c
  0x22fe0c8: adrp     x8, #0x550f000
  0x22fe0cc: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x550f0c0)
  0x22fe0d0: mov      x23, x0
  0x22fe0d4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe0d8: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22fe0dc: adrp     x8, #0x550f000
  0x22fe0e0: ldr      x8, [x8, #0xc8] ; = 0x0 (u64 @ 0x550f0c8)
  0x22fe0e4: mov      x20, x0
  0x22fe0e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe0ec: bl       #0x4449f88 ; -> System.Collections.Generic.List<object>$$.ctor
  0x22fe0f0: adrp     x8, #0x5511000
  0x22fe0f4: ldr      x8, [x8, #0x490] ; = 0x0 (u64 @ 0x5511490)
  0x22fe0f8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe0fc: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22fe100: adrp     x8, #0x5511000
  0x22fe104: ldr      x8, [x8, #0x498] ; = 0x0 (u64 @ 0x5511498)
  0x22fe108: mov      x22, x0
  0x22fe10c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe110: bl       #0x43fcaf0 ; -> System.Collections.Generic.List<int>$$.ctor
  0x22fe114: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x22fe118: cbz      x8, #0x22ff754
  0x22fe11c: adrp     x29, #0x5512000
  0x22fe120: adrp     x27, #0x5511000
  0x22fe124: adrp     x25, #0x5511000
  0x22fe128: ldr      x29, [x29, #0x458] ; = 0x0 (u64 @ 0x5512458)
  0x22fe12c: ldr      x27, [x27, #0x798] ; = 0x0 (u64 @ 0x5511798)
  0x22fe130: ldr      x25, [x25, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22fe134: mov      x28, xzr
  0x22fe138: ldr      w9, [x8, #0x18]
  0x22fe13c: cmp      x28, w9, sxtw
  0x22fe140: b.ge     #0x22fe5a8
  0x22fe144: cmp      x28, x9
  0x22fe148: b.hs     #0x22fe974
  0x22fe14c: add      x8, x8, x28, lsl #3
  0x22fe150: ldr      x24, [x8, #0x20] ; = 0x0 (u64 @ 0x5511020)
  0x22fe154: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x22fe158: mov      x0, x24
  0x22fe15c: bl       #0x33c39a4 ; -> CExtension$$IsNullOrEmpty<char>
  0x22fe160: tbnz     w0, #0, #0x22fe2f8
  0x22fe164: mov      x0, xzr
  0x22fe168: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x22fe16c: cbz      x0, #0x22ff754
  0x22fe170: mov      w2, #1
  0x22fe174: mov      x1, x24
  0x22fe178: mov      x3, xzr
  0x22fe17c: bl       #0x25a7b60 ; -> CBuffTempletContainer$$GetBuffTemplet
  0x22fe180: cbz      x0, #0x22fe2f8
  0x22fe184: ldr      w8, [x0, #0xd8]
  0x22fe188: mov      x21, x0
  0x22fe18c: cbz      w8, #0x22fe220
  0x22fe190: ldr      x8, [x19, #0x18]
  0x22fe194: cbz      x8, #0x22ff754
  0x22fe198: ldr      x0, [x8, #0x380] ; = 0x0 (u64 @ 0x5511380)
  0x22fe19c: cbz      x0, #0x22ff754
  0x22fe1a0: adrp     x8, #0x5511000
  0x22fe1a4: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22fe1a8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe1ac: add      x8, sp, #0x18
  0x22fe1b0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fe1b4: ldur     q0, [sp, #0x18]
  0x22fe1b8: ldr      x8, [sp, #0x28]
  0x22fe1bc: str      q0, [sp, #0x50]
  0x22fe1c0: str      x8, [sp, #0x60]
  0x22fe1c4: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x22fe1c8: add      x0, sp, #0x50
  0x22fe1cc: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fe1d0: tbz      w0, #0, #0x22fe20c
  0x22fe1d4: ldr      x8, [sp, #0x60]
  0x22fe1d8: cbz      x8, #0x22fe1c4
  0x22fe1dc: ldr      x8, [x8, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fe1e0: cbz      x8, #0x22fe1c4
  0x22fe1e4: ldr      w8, [x8, #0xd8]
  0x22fe1e8: ldr      w9, [x21, #0xd8]
  0x22fe1ec: cmp      w8, w9
  0x22fe1f0: b.ne     #0x22fe1c4
  0x22fe1f4: adrp     x8, #0x5511000
  0x22fe1f8: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fe1fc: add      x0, sp, #0x50
  0x22fe200: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe204: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fe208: b        #0x22fe2f8
  0x22fe20c: adrp     x8, #0x5511000
  0x22fe210: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fe214: add      x0, sp, #0x50
  0x22fe218: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe21c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fe220: cbz      x20, #0x22ff754
  0x22fe224: adrp     x9, #0x550f000
  0x22fe228: ldr      w10, [x20, #0x1c]
  0x22fe22c: ldr      x8, [x20, #0x10] ; = 0x6000038 (u64 @ 0x5955010)
  0x22fe230: ldr      x9, [x9, #0xd8] ; = 0x0 (u64 @ 0x550f0d8)
  0x22fe234: add      w10, w10, #1
  0x22fe238: ldr      x9, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x22fe23c: str      w10, [x20, #0x1c]
  0x22fe240: cbz      x8, #0x22ff754
  0x22fe244: ldrsw    x10, [x20, #0x18]
  0x22fe248: ldr      w11, [x8, #0x18]
  0x22fe24c: cmp      w10, w11
  0x22fe250: b.hs     #0x22fe270
  0x22fe254: add      w9, w10, #1
  0x22fe258: add      x0, x8, x10, lsl #3
  0x22fe25c: str      w9, [x20, #0x18]
  0x22fe260: str      x24, [x0, #0x20]!
  0x22fe264: mov      x1, x24
  0x22fe268: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fe26c: b        #0x22fe288
  0x22fe270: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x550f020)
  0x22fe274: mov      x0, x20
  0x22fe278: mov      x1, x24
  0x22fe27c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55110c0)
  0x22fe280: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5511070)
  0x22fe284: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x22fe288: ldr      x8, [x23, #0x20] ; = 0x0 (u64 @ 0x550f020)
  0x22fe28c: cbz      x8, #0x22ff754
  0x22fe290: ldr      w9, [x8, #0x18]
  0x22fe294: cmp      x28, x9
  0x22fe298: b.hs     #0x22fe974
  0x22fe29c: cbz      x22, #0x22ff754
  0x22fe2a0: add      x8, x8, x28, lsl #2
  0x22fe2a4: ldr      w10, [x22, #0x1c]
  0x22fe2a8: ldr      w1, [x8, #0x20]
  0x22fe2ac: ldr      x8, [x22, #0x10] ; = 0x6000038 (u64 @ 0x5955010)
  0x22fe2b0: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5511000)
  0x22fe2b4: add      w10, w10, #1
  0x22fe2b8: str      w10, [x22, #0x1c]
  0x22fe2bc: cbz      x8, #0x22ff754
  0x22fe2c0: ldrsw    x10, [x22, #0x18]
  0x22fe2c4: ldr      w11, [x8, #0x18]
  0x22fe2c8: cmp      w10, w11
  0x22fe2cc: b.hs     #0x22fe2e4
  0x22fe2d0: add      w9, w10, #1
  0x22fe2d4: add      x8, x8, x10, lsl #2
  0x22fe2d8: str      w9, [x22, #0x18]
  0x22fe2dc: str      w1, [x8, #0x20]
  0x22fe2e0: b        #0x22fe2f8
  0x22fe2e4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x550f020)
  0x22fe2e8: mov      x0, x22
  0x22fe2ec: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55110c0)
  0x22fe2f0: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5511070)
  0x22fe2f4: bl       #0x43fd344 ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x22fe2f8: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x22fe2fc: add      x28, x28, #1
  0x22fe300: cbnz     x8, #0x22fe138
  0x22fe304: b        #0x22ff754
  0x22fe308: cmp      w1, #1
  0x22fe30c: mov      x21, x0
  0x22fe310: b.ne     #0x22fe9a4
  0x22fe314: mov      x0, x21
  0x22fe318: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22fe31c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22fe320: str      x8, [sp, #0x10]
  0x22fe324: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22fe328: adrp     x8, #0x5511000
  0x22fe32c: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fe330: add      x0, sp, #0x50
  0x22fe334: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe338: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fe33c: ldr      x8, [sp, #0x10]
  0x22fe340: cbz      x8, #0x22fe220
  0x22fe344: ldr      x0, [sp, #0x10]
  0x22fe348: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22fe34c: ldr      x8, [x19, #0x20]
  0x22fe350: cbz      x8, #0x22ff754
  0x22fe354: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5511088)
  0x22fe358: cbz      x0, #0x22ff754
  0x22fe35c: mov      w1, #2
  0x22fe360: mov      x2, xzr
  0x22fe364: bl       #0x252c950 ; -> CCharacterRender$$ToggleObject
  0x22fe368: b        #0x22ff4a4
  0x22fe36c: adrp     x8, #0x5511000
  0x22fe370: ldr      x8, [x8, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22fe374: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe378: ldr      w8, [x0, #0xe0]
  0x22fe37c: cbnz     w8, #0x22fe384
  0x22fe380: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe384: mov      x0, xzr
  0x22fe388: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x22fe38c: ldr      x8, [x26]
  0x22fe390: cbz      x8, #0x22ff754
  0x22fe394: cbz      x0, #0x22ff754
  0x22fe398: ldr      w9, [x19, #0x30]
  0x22fe39c: ldr      w8, [x8, #0x54]
  0x22fe3a0: mov      x2, xzr
  0x22fe3a4: mul      w1, w8, w9
  0x22fe3a8: bl       #0x25ee9e8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x22fe3ac: cbz      x0, #0x22fe46c
  0x22fe3b0: ldrb     w8, [x0, #0x28]
  0x22fe3b4: mov      x20, x0
  0x22fe3b8: cbz      w8, #0x22fe620
  0x22fe3bc: adrp     x8, #0x5512000
  0x22fe3c0: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x5955018)
  0x22fe3c4: ldr      x8, [x8, #0x460] ; = 0x0 (u64 @ 0x5512460)
  0x22fe3c8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fe3cc: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22fe3d0: tbz      w0, #0, #0x22fe680
  0x22fe3d4: ldr      x8, [x26]
  0x22fe3d8: cbz      x8, #0x22ff754
  0x22fe3dc: ldr      w8, [x8, #0x54]
  0x22fe3e0: ldr      w9, [x19, #0x30]
  0x22fe3e4: add      x0, sp, #0x4c
  0x22fe3e8: mov      x1, xzr
  0x22fe3ec: mul      w8, w9, w8
  0x22fe3f0: str      w8, [sp, #0x4c]
  0x22fe3f4: bl       #0x48a1298 ; -> System.Int32$$ToString
  0x22fe3f8: adrp     x8, #0x5512000
  0x22fe3fc: ldr      x8, [x8, #0x4f8] ; = 0x0 (u64 @ 0x55124f8)
  0x22fe400: mov      x1, x0
  0x22fe404: mov      x2, xzr
  0x22fe408: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fe40c: mov      x0, x8
  0x22fe410: bl       #0x470c0a0 ; -> System.String$$Concat
  0x22fe414: adrp     x8, #0x5511000
  0x22fe418: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fe41c: mov      x19, x0
  0x22fe420: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe424: ldr      w9, [x8, #0xe0]
  0x22fe428: cbnz     w9, #0x22fe434
  0x22fe42c: mov      x0, x8
  0x22fe430: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe434: mov      x0, x19
  0x22fe438: mov      x1, xzr
  0x22fe43c: bl       #0x2c4fde4 ; -> CDebug$$LogWarning
  0x22fe440: b        #0x22fe518
  0x22fe444: mov      w1, wzr
  0x22fe448: ldr      x0, [x19, #0x20]
  0x22fe44c: cbz      x0, #0x22ff754
  0x22fe450: mov      w4, #1
  0x22fe454: mov      w24, #1
  0x22fe458: mov      w2, wzr
  0x22fe45c: mov      w3, wzr
  0x22fe460: mov      x5, xzr
  0x22fe464: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x22fe468: b        #0x22ff4a8
  0x22fe46c: adrp     x8, #0x550f000
  0x22fe470: ldr      x8, [x8, #0x310] ; = 0x0 (u64 @ 0x550f310)
  0x22fe474: mov      w1, #1
  0x22fe478: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe47c: bl       #0x218480c ; -> ??? 0x218480c
  0x22fe480: ldr      x8, [x26]
  0x22fe484: cbz      x8, #0x22ff754
  0x22fe488: adrp     x10, #0x550f000
  0x22fe48c: ldr      w8, [x8, #0x54]
  0x22fe490: ldr      w9, [x19, #0x30]
  0x22fe494: ldr      x10, [x10, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x22fe498: mov      x20, x0
  0x22fe49c: add      x1, sp, #0x18
  0x22fe4a0: mul      w8, w9, w8
  0x22fe4a4: ldr      x0, [x10] ; = 0x0 (u64 @ 0x550f000)
  0x22fe4a8: str      w8, [sp, #0x18]
  0x22fe4ac: bl       #0x21848a4 ; -> ??? 0x21848a4
  0x22fe4b0: cbz      x20, #0x22ff754
  0x22fe4b4: mov      x19, x0
  0x22fe4b8: cbz      x0, #0x22fe4d0
  0x22fe4bc: ldr      x8, [x20] ; = 0x6000037 (u64 @ 0x5955000)
  0x22fe4c0: mov      x0, x19
  0x22fe4c4: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x550f040)
  0x22fe4c8: bl       #0x21848a0 ; -> ??? 0x21848a0
  0x22fe4cc: cbz      x0, #0x22fe998
  0x22fe4d0: ldr      w8, [x20, #0x18]
  0x22fe4d4: cbz      w8, #0x22fe974
  0x22fe4d8: mov      x0, x20
  0x22fe4dc: str      x19, [x0, #0x20]!
  0x22fe4e0: mov      x1, x19
  0x22fe4e4: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fe4e8: adrp     x8, #0x5511000
  0x22fe4ec: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fe4f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe4f4: ldr      w8, [x0, #0xe0]
  0x22fe4f8: cbnz     w8, #0x22fe500
  0x22fe4fc: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe500: adrp     x8, #0x5512000
  0x22fe504: ldr      x8, [x8, #0x4f0] ; = 0x0 (u64 @ 0x55124f0)
  0x22fe508: mov      x1, x20
  0x22fe50c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fe510: mov      x2, xzr
  0x22fe514: bl       #0x2c4ffa8 ; -> CDebug$$LogErrorFormat
  0x22fe518: mov      w24, wzr
  0x22fe51c: b        #0x22ff4a8
  0x22fe520: ldr      x0, [x21] ; = 0x6000037 (u64 @ 0x5955000)
  0x22fe524: ldr      x20, [x19, #0x18]
  0x22fe528: ldr      w8, [x0, #0xe0]
  0x22fe52c: cbnz     w8, #0x22fe534
  0x22fe530: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe534: mov      x0, x20
  0x22fe538: mov      x1, xzr
  0x22fe53c: mov      x2, xzr
  0x22fe540: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x22fe544: tbz      w0, #0, #0x22fe558
  0x22fe548: ldr      x8, [x19, #0x18]
  0x22fe54c: cbz      x8, #0x22ff754
  0x22fe550: ldr      w8, [x8, #0x21c]
  0x22fe554: cbz      w8, #0x22fd308
  0x22fe558: adrp     x8, #0x550f000
  0x22fe55c: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fe560: ldr      x20, [x19, #0x18]
  0x22fe564: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe568: ldr      w8, [x0, #0xe0]
  0x22fe56c: cbnz     w8, #0x22fe574
  0x22fe570: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe574: mov      x0, x20
  0x22fe578: mov      x1, xzr
  0x22fe57c: mov      x2, xzr
  0x22fe580: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x22fe584: tbz      w0, #0, #0x22ff4a4
  0x22fe588: ldr      x0, [x19, #0x18]
  0x22fe58c: cbz      x0, #0x22ff754
  0x22fe590: mov      x1, xzr
  0x22fe594: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fe598: cbz      x0, #0x22ff754
  0x22fe59c: mov      w24, #1
  0x22fe5a0: strb     w24, [x0, #0xb1]
  0x22fe5a4: b        #0x22ff4a8
  0x22fe5a8: mov      x0, x22
  0x22fe5ac: mov      x1, xzr
  0x22fe5b0: bl       #0x49be3c0 ; -> System.Linq.Enumerable$$Sum
  0x22fe5b4: cbz      w0, #0x22ff4a4
  0x22fe5b8: sub      w1, w0, #1
  0x22fe5bc: mov      w0, wzr
  0x22fe5c0: mov      x2, xzr
  0x22fe5c4: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x22fe5c8: cbz      x22, #0x22ff754
  0x22fe5cc: ldr      w8, [x22, #0x18]
  0x22fe5d0: cmp      w8, #1
  0x22fe5d4: b.lt     #0x22ff4a4
  0x22fe5d8: adrp     x27, #0x5511000
  0x22fe5dc: ldr      x27, [x27, #0xe40] ; = 0x0 (u64 @ 0x5511e40)
  0x22fe5e0: mov      w23, w0
  0x22fe5e4: mov      w21, wzr
  0x22fe5e8: mov      w25, wzr
  0x22fe5ec: mov      w24, #1
  0x22fe5f0: ldr      x2, [x27] ; = 0x0 (u64 @ 0x5511000)
  0x22fe5f4: mov      x0, x22
  0x22fe5f8: mov      w1, w21
  0x22fe5fc: bl       #0x43fd054 ; -> System.Collections.Generic.List<int>$$get_Item
  0x22fe600: add      w25, w0, w25
  0x22fe604: cmp      w23, w25
  0x22fe608: b.lt     #0x22fe72c
  0x22fe60c: ldr      w8, [x22, #0x18]
  0x22fe610: add      w21, w21, #1
  0x22fe614: cmp      w21, w8
  0x22fe618: b.lt     #0x22fe5f0
  0x22fe61c: b        #0x22ff4a8
  0x22fe620: mov      w1, #0x3e7
  0x22fe624: mov      w0, wzr
  0x22fe628: mov      x2, xzr
  0x22fe62c: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x22fe630: ldr      x8, [x20, #0x20] ; = 0x6000039 (u64 @ 0x5955020)
  0x22fe634: cbz      x8, #0x22ff754
  0x22fe638: ldr      w9, [x8, #0x18]
  0x22fe63c: cmp      w9, #1
  0x22fe640: b.lt     #0x22ff4a4
  0x22fe644: mov      w11, wzr
  0x22fe648: mov      w10, wzr
  0x22fe64c: mov      w24, #1
  0x22fe650: cmp      w11, w9
  0x22fe654: b.hs     #0x22fe974
  0x22fe658: sxtw     x22, w11
  0x22fe65c: add      x11, x8, x22, lsl #2
  0x22fe660: ldr      w11, [x11, #0x20]
  0x22fe664: add      w10, w11, w10
  0x22fe668: cmp      w0, w10
  0x22fe66c: b.lt     #0x22fe794
  0x22fe670: add      w11, w22, #1
  0x22fe674: cmp      w11, w9
  0x22fe678: b.lt     #0x22fe650
  0x22fe67c: b        #0x22ff4a8
  0x22fe680: ldr      x21, [x20, #0x18] ; = 0x0 (u64 @ 0x5955018)
  0x22fe684: cbz      x21, #0x22ff754
  0x22fe688: ldr      w8, [x21, #0x18]
  0x22fe68c: cmp      w8, #1
  0x22fe690: b.lt     #0x22fe7fc
  0x22fe694: adrp     x24, #0x5512000
  0x22fe698: ldr      x24, [x24, #0x458] ; = 0x0 (u64 @ 0x5512458)
  0x22fe69c: mov      x22, xzr
  0x22fe6a0: mov      w25, wzr
  0x22fe6a4: add      x23, x21, #0x20
  0x22fe6a8: cmp      w22, w8
  0x22fe6ac: b.hs     #0x22fe974
  0x22fe6b0: ldr      x20, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x550f003)
  0x22fe6b4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5512000)
  0x22fe6b8: mov      x0, x20
  0x22fe6bc: bl       #0x33c39a4 ; -> CExtension$$IsNullOrEmpty<char>
  0x22fe6c0: tbnz     w0, #0, #0x22fe714
  0x22fe6c4: mov      x0, xzr
  0x22fe6c8: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x22fe6cc: ldr      x8, [x26]
  0x22fe6d0: cbz      x8, #0x22ff754
  0x22fe6d4: cbz      x0, #0x22ff754
  0x22fe6d8: ldrb     w2, [x8, #0x20]
  0x22fe6dc: mov      x1, x20
  0x22fe6e0: mov      x3, xzr
  0x22fe6e4: bl       #0x25a7b60 ; -> CBuffTempletContainer$$GetBuffTemplet
  0x22fe6e8: cbz      x0, #0x22fe714
  0x22fe6ec: mov      x20, x0
  0x22fe6f0: mov      x0, xzr
  0x22fe6f4: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fe6f8: cbz      x0, #0x22ff754
  0x22fe6fc: ldp      x2, x3, [x19, #0x18]
  0x22fe700: mov      x1, x20
  0x22fe704: mov      w4, wzr
  0x22fe708: mov      x5, xzr
  0x22fe70c: bl       #0x24c7ee4 ; -> CBuffManager$$CreateBuff
  0x22fe710: mov      w25, #1
  0x22fe714: add      x22, x22, #1
  0x22fe718: str      w22, [sp, #0x4c]
  0x22fe71c: ldr      w8, [x21, #0x18]
  0x22fe720: cmp      w22, w8
  0x22fe724: b.lt     #0x22fe6a8
  0x22fe728: b        #0x22fe800
  0x22fe72c: mov      x0, xzr
  0x22fe730: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x22fe734: cbz      x20, #0x22ff754
  0x22fe738: adrp     x23, #0x5511000
  0x22fe73c: ldr      x23, [x23, #0xa00] ; = 0x0 (u64 @ 0x5511a00)
  0x22fe740: mov      x22, x0
  0x22fe744: mov      x0, x20
  0x22fe748: mov      w1, w21
  0x22fe74c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22fe750: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x22fe754: ldr      x8, [x26]
  0x22fe758: cbz      x8, #0x22ff754
  0x22fe75c: cbz      x22, #0x22ff754
  0x22fe760: ldrb     w2, [x8, #0x20]
  0x22fe764: mov      x1, x0
  0x22fe768: mov      x0, x22
  0x22fe76c: mov      x3, xzr
  0x22fe770: bl       #0x25a7b60 ; -> CBuffTempletContainer$$GetBuffTemplet
  0x22fe774: cbz      x0, #0x22fe808
  0x22fe778: mov      x22, x0
  0x22fe77c: mov      x0, xzr
  0x22fe780: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fe784: cbz      x0, #0x22ff754
  0x22fe788: ldp      x2, x3, [x19, #0x18]
  0x22fe78c: mov      x1, x22
  0x22fe790: b        #0x22fe7ec
  0x22fe794: mov      x0, xzr
  0x22fe798: bl       #0x25a7690 ; -> CBuffTempletContainer$$get_Instance
  0x22fe79c: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x5955018)
  0x22fe7a0: cbz      x8, #0x22ff754
  0x22fe7a4: ldr      w9, [x8, #0x18]
  0x22fe7a8: cmp      w22, w9
  0x22fe7ac: b.hs     #0x22fe974
  0x22fe7b0: ldr      x9, [x26]
  0x22fe7b4: cbz      x9, #0x22ff754
  0x22fe7b8: cbz      x0, #0x22ff754
  0x22fe7bc: add      x8, x8, x22, lsl #3
  0x22fe7c0: ldr      x1, [x8, #0x20] ; = 0x0 (u64 @ 0x550f020)
  0x22fe7c4: ldrb     w2, [x9, #0x20]
  0x22fe7c8: mov      x3, xzr
  0x22fe7cc: bl       #0x25a7b60 ; -> CBuffTempletContainer$$GetBuffTemplet
  0x22fe7d0: cbz      x0, #0x22fe874
  0x22fe7d4: mov      x21, x0
  0x22fe7d8: mov      x0, xzr
  0x22fe7dc: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fe7e0: cbz      x0, #0x22ff754
  0x22fe7e4: ldp      x2, x3, [x19, #0x18]
  0x22fe7e8: mov      x1, x21
  0x22fe7ec: mov      w4, wzr
  0x22fe7f0: mov      x5, xzr
  0x22fe7f4: bl       #0x24c7ee4 ; -> CBuffManager$$CreateBuff
  0x22fe7f8: b        #0x22ff4a4
  0x22fe7fc: mov      w25, wzr
  0x22fe800: and      w24, w25, #1
  0x22fe804: b        #0x22ff4a8
  0x22fe808: adrp     x8, #0x550f000
  0x22fe80c: ldr      x8, [x8, #0x310] ; = 0x0 (u64 @ 0x550f310)
  0x22fe810: mov      w1, #2
  0x22fe814: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe818: bl       #0x218480c ; -> ??? 0x218480c
  0x22fe81c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22fe820: mov      x19, x0
  0x22fe824: mov      x0, x20
  0x22fe828: mov      w1, w21
  0x22fe82c: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x22fe830: cbz      x19, #0x22ff754
  0x22fe834: mov      x20, x0
  0x22fe838: cbz      x0, #0x22fe850
  0x22fe83c: ldr      x8, [x19]
  0x22fe840: mov      x0, x20
  0x22fe844: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x550f040)
  0x22fe848: bl       #0x21848a0 ; -> ??? 0x21848a0
  0x22fe84c: cbz      x0, #0x22fe998
  0x22fe850: ldr      w8, [x19, #0x18]
  0x22fe854: cbz      w8, #0x22fe974
  0x22fe858: mov      x0, x19
  0x22fe85c: str      x20, [x0, #0x20]!
  0x22fe860: mov      x1, x20
  0x22fe864: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fe868: ldr      x8, [x26]
  0x22fe86c: cbnz     x8, #0x22fe8e4
  0x22fe870: b        #0x22ff754
  0x22fe874: adrp     x8, #0x550f000
  0x22fe878: ldr      x8, [x8, #0x310] ; = 0x0 (u64 @ 0x550f310)
  0x22fe87c: mov      w1, #2
  0x22fe880: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22fe884: bl       #0x218480c ; -> ??? 0x218480c
  0x22fe888: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x5955018)
  0x22fe88c: cbz      x8, #0x22ff754
  0x22fe890: ldr      w9, [x8, #0x18]
  0x22fe894: cmp      w22, w9
  0x22fe898: b.hs     #0x22fe974
  0x22fe89c: mov      x19, x0
  0x22fe8a0: cbz      x0, #0x22ff754
  0x22fe8a4: add      x8, x8, x22, lsl #3
  0x22fe8a8: ldr      x20, [x8, #0x20] ; = 0x0 (u64 @ 0x550f020)
  0x22fe8ac: cbz      x20, #0x22fe8c4
  0x22fe8b0: ldr      x8, [x19]
  0x22fe8b4: mov      x0, x20
  0x22fe8b8: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x550f040)
  0x22fe8bc: bl       #0x21848a0 ; -> ??? 0x21848a0
  0x22fe8c0: cbz      x0, #0x22fe998
  0x22fe8c4: ldr      w8, [x19, #0x18]
  0x22fe8c8: cbz      w8, #0x22fe974
  0x22fe8cc: mov      x0, x19
  0x22fe8d0: str      x20, [x0, #0x20]!
  0x22fe8d4: mov      x1, x20
  0x22fe8d8: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fe8dc: ldr      x8, [x26]
  0x22fe8e0: cbz      x8, #0x22ff754
  0x22fe8e4: adrp     x9, #0x550f000
  0x22fe8e8: ldrb     w8, [x8, #0x20]
  0x22fe8ec: ldr      x9, [x9, #0xf0] ; = 0x0 (u64 @ 0x550f0f0)
  0x22fe8f0: add      x1, sp, #0x18
  0x22fe8f4: strb     w8, [sp, #0x18]
  0x22fe8f8: ldr      x0, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x22fe8fc: bl       #0x21848a4 ; -> ??? 0x21848a4
  0x22fe900: mov      x20, x0
  0x22fe904: cbz      x0, #0x22fe91c
  0x22fe908: ldr      x8, [x19]
  0x22fe90c: mov      x0, x20
  0x22fe910: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x550f040)
  0x22fe914: bl       #0x21848a0 ; -> ??? 0x21848a0
  0x22fe918: cbz      x0, #0x22fe998
  0x22fe91c: ldr      w8, [x19, #0x18]
  0x22fe920: cmp      w8, #1
  0x22fe924: b.ls     #0x22fe974
  0x22fe928: mov      x0, x19
  0x22fe92c: str      x20, [x0, #0x28]!
  0x22fe930: mov      x1, x20
  0x22fe934: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fe938: adrp     x8, #0x5511000
  0x22fe93c: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fe940: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe944: ldr      w8, [x0, #0xe0]
  0x22fe948: cbnz     w8, #0x22fe950
  0x22fe94c: bl       #0x218489c ; -> ??? 0x218489c
  0x22fe950: adrp     x8, #0x5512000
  0x22fe954: ldr      x8, [x8, #0x500] ; = 0x0 (u64 @ 0x5512500)
  0x22fe958: mov      x1, x19
  0x22fe95c: b        #0x22fe50c
  0x22fe960: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe964: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe968: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe96c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe970: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe974: bl       #0x21849c8 ; -> ??? 0x21849c8
  0x22fe978: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe97c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe980: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe984: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe988: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe98c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe990: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe994: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fe998: bl       #0x21849e4 ; -> ??? 0x21849e4
  0x22fe99c: mov      x1, xzr
  0x22fe9a0: bl       #0x218488c ; -> ??? 0x218488c
  0x22fe9a4: str      xzr, [sp, #0x10]
  0x22fe9a8: b        #0x22fe9b0
  0x22fe9ac: mov      x21, x0
  0x22fe9b0: adrp     x8, #0x5511000
  0x22fe9b4: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fe9b8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fe9bc: add      x0, sp, #0x50
  0x22fe9c0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fe9c4: ldr      x8, [sp, #0x10]
  0x22fe9c8: cbz      x8, #0x22ff880
  0x22fe9cc: ldr      x0, [sp, #0x10]
  0x22fe9d0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22fe9d4: b        #0x22fea1c
  0x22fe9d8: b        #0x22fea1c
  0x22fe9dc: b        #0x22fea1c
  0x22fe9e0: b        #0x22fea1c
  0x22fe9e4: b        #0x22fea1c
  0x22fe9e8: b        #0x22fea1c
  0x22fe9ec: b        #0x22fea1c
  0x22fe9f0: b        #0x22fea1c
  0x22fe9f4: b        #0x22fea1c
  0x22fe9f8: b        #0x22fea1c
  0x22fe9fc: b        #0x22fea1c
  0x22fea00: b        #0x22fea1c
  0x22fea04: b        #0x22fea1c
  0x22fea08: b        #0x22fea1c
  0x22fea0c: b        #0x22fea1c
  0x22fea10: b        #0x22fea1c
  0x22fea14: b        #0x22fea1c
  0x22fea18: b        #0x22fea1c
  0x22fea1c: mov      x21, x0
  0x22fea20: cmp      w1, #1
  0x22fea24: b.ne     #0x22ff130
  0x22fea28: mov      x0, x21
  0x22fea2c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22fea30: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22fea34: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22fea38: adrp     x8, #0x5511000
  0x22fea3c: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22fea40: add      x0, sp, #0x50
  0x22fea44: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fea48: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fea4c: cbnz     x20, #0x22ff7d0
  0x22fea50: adrp     x8, #0x5511000
  0x22fea54: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fea58: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fea5c: ldr      w8, [x0, #0xe0]
  0x22fea60: cbnz     w8, #0x22fea68
  0x22fea64: bl       #0x218489c ; -> ??? 0x218489c
  0x22fea68: adrp     x8, #0x5512000
  0x22fea6c: ldr      x8, [x8, #0x4e8] ; = 0x0 (u64 @ 0x55124e8)
  0x22fea70: mov      x1, xzr
  0x22fea74: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fea78: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x22fea7c: ldr      x0, [x19, #0x20]
  0x22fea80: cbz      x0, #0x22ff754
  0x22fea84: mov      w1, wzr
  0x22fea88: mov      x2, xzr
  0x22fea8c: bl       #0x26db9a8 ; -> CCharacterBattle$$GetBuffList
  0x22fea90: adrp     x25, #0x5511000
  0x22fea94: ldr      x25, [x25, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x22fea98: mov      x20, x0
  0x22fea9c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x22feaa0: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22feaa4: tbz      w0, #0, #0x22feacc
  0x22feaa8: adrp     x8, #0x5511000
  0x22feaac: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22feab0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22feab4: ldr      w8, [x0, #0xe0]
  0x22feab8: cbnz     w8, #0x22feac0
  0x22feabc: bl       #0x218489c ; -> ??? 0x218489c
  0x22feac0: adrp     x8, #0x5512000
  0x22feac4: ldr      x8, [x8, #0x4c8] ; = 0x0 (u64 @ 0x55124c8)
  0x22feac8: b        #0x22feba4
  0x22feacc: adrp     x23, #0x5512000
  0x22fead0: ldr      x23, [x23, #0x420] ; = 0x0 (u64 @ 0x5512420)
  0x22fead4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22fead8: ldr      w8, [x0, #0xe0]
  0x22feadc: cbnz     w8, #0x22feae8
  0x22feae0: bl       #0x218489c ; -> ??? 0x218489c
  0x22feae4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22feae8: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22feaec: ldr      x21, [x8, #0xd8] ; = 0x0 (u64 @ 0x55120d8)
  0x22feaf0: cbnz     x21, #0x22feb4c
  0x22feaf4: ldr      w8, [x0, #0xe0]
  0x22feaf8: cbnz     w8, #0x22feb04
  0x22feafc: bl       #0x218489c ; -> ??? 0x218489c
  0x22feb00: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22feb04: adrp     x9, #0x5512000
  0x22feb08: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22feb0c: ldr      x9, [x9, #0x488] ; = 0x0 (u64 @ 0x5512488)
  0x22feb10: ldr      x22, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feb14: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5512000)
  0x22feb18: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22feb1c: adrp     x8, #0x5512000
  0x22feb20: ldr      x8, [x8, #0x4b8] ; = 0x0 (u64 @ 0x55124b8)
  0x22feb24: mov      x1, x22
  0x22feb28: mov      x3, xzr
  0x22feb2c: mov      x21, x0
  0x22feb30: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feb34: bl       #0x423119c ; -> System.Func<object, bool>$$.ctor
  0x22feb38: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22feb3c: mov      x1, x21
  0x22feb40: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22feb44: str      x21, [x0, #0xd8]!
  0x22feb48: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22feb4c: adrp     x8, #0x5512000
  0x22feb50: ldr      x8, [x8, #0x480] ; = 0x0 (u64 @ 0x5512480)
  0x22feb54: mov      x0, x20
  0x22feb58: mov      x1, x21
  0x22feb5c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feb60: bl       #0x3448624 ; -> System.Linq.Enumerable$$Where<object>
  0x22feb64: adrp     x24, #0x5512000
  0x22feb68: ldr      x24, [x24, #0x478] ; = 0x0 (u64 @ 0x5512478)
  0x22feb6c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5512000)
  0x22feb70: bl       #0x3445fa4 ; -> System.Linq.Enumerable$$ToList<object>
  0x22feb74: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x22feb78: mov      x20, x0
  0x22feb7c: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22feb80: tbz      w0, #0, #0x22febb4
  0x22feb84: adrp     x8, #0x5511000
  0x22feb88: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22feb8c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22feb90: ldr      w8, [x0, #0xe0]
  0x22feb94: cbnz     w8, #0x22feb9c
  0x22feb98: bl       #0x218489c ; -> ??? 0x218489c
  0x22feb9c: adrp     x8, #0x5512000
  0x22feba0: ldr      x8, [x8, #0x508] ; = 0x0 (u64 @ 0x5512508)
  0x22feba4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feba8: mov      x1, xzr
  0x22febac: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x22febb0: b        #0x22ff4a4
  0x22febb4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22febb8: ldr      w8, [x0, #0xe0]
  0x22febbc: cbnz     w8, #0x22febc8
  0x22febc0: bl       #0x218489c ; -> ??? 0x218489c
  0x22febc4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22febc8: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22febcc: ldr      x21, [x8, #0xe0] ; = 0x0 (u64 @ 0x55120e0)
  0x22febd0: cbnz     x21, #0x22fec2c
  0x22febd4: ldr      w8, [x0, #0xe0]
  0x22febd8: cbnz     w8, #0x22febe4
  0x22febdc: bl       #0x218489c ; -> ??? 0x218489c
  0x22febe0: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22febe4: adrp     x9, #0x5512000
  0x22febe8: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x550f0b8)
  0x22febec: ldr      x9, [x9, #0x468] ; = 0x0 (u64 @ 0x5512468)
  0x22febf0: ldr      x22, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22febf4: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5512000)
  0x22febf8: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22febfc: adrp     x8, #0x5512000
  0x22fec00: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55124c0)
  0x22fec04: mov      x1, x22
  0x22fec08: mov      x3, xzr
  0x22fec0c: mov      x21, x0
  0x22fec10: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fec14: bl       #0x3f15ae8 ; -> System.Comparison<object>$$.ctor
  0x22fec18: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22fec1c: mov      x1, x21
  0x22fec20: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55120b8)
  0x22fec24: str      x21, [x0, #0xe0]!
  0x22fec28: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fec2c: cbz      x20, #0x22ff754
  0x22fec30: adrp     x8, #0x5512000
  0x22fec34: ldr      x8, [x8, #0x490] ; = 0x0 (u64 @ 0x5512490)
  0x22fec38: mov      x0, x20
  0x22fec3c: mov      x1, x21
  0x22fec40: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fec44: bl       #0x444c384 ; -> System.Collections.Generic.List<object>$$Sort
  0x22fec48: ldr      x8, [x26]
  0x22fec4c: cbz      x8, #0x22ff754
  0x22fec50: adrp     x10, #0x5512000
  0x22fec54: ldr      w8, [x8, #0x54]
  0x22fec58: ldr      w9, [x19, #0x30]
  0x22fec5c: ldr      x10, [x10, #0x470] ; = 0x0 (u64 @ 0x5512470)
  0x22fec60: mov      x0, x20
  0x22fec64: mul      w1, w9, w8
  0x22fec68: ldr      x2, [x10] ; = 0x0 (u64 @ 0x5512000)
  0x22fec6c: bl       #0x344054c ; -> System.Linq.Enumerable$$Take<object>
  0x22fec70: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5512000)
  0x22fec74: bl       #0x3445fa4 ; -> System.Linq.Enumerable$$ToList<object>
  0x22fec78: cbz      x0, #0x22ff754
  0x22fec7c: adrp     x8, #0x5511000
  0x22fec80: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22fec84: str      x0, [sp, #0x10]
  0x22fec88: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fec8c: add      x8, sp, #0x18
  0x22fec90: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fec94: ldur     q0, [sp, #0x18]
  0x22fec98: ldr      x8, [sp, #0x28]
  0x22fec9c: adrp     x28, #0x5511000
  0x22feca0: adrp     x29, #0x5512000
  0x22feca4: adrp     x20, #0x5511000
  0x22feca8: adrp     x27, #0x550f000
  0x22fecac: ldr      x28, [x28, #0xd78] ; = 0x0 (u64 @ 0x5511d78)
  0x22fecb0: ldr      x29, [x29, #0x4a8] ; = 0x0 (u64 @ 0x55124a8)
  0x22fecb4: ldr      x20, [x20, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x22fecb8: ldr      x27, [x27, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22fecbc: str      q0, [sp, #0x50]
  0x22fecc0: str      x8, [sp, #0x60]
  0x22fecc4: adrp     x21, #0x5511000
  0x22fecc8: ldr      x21, [x21, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22feccc: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x22fecd0: add      x0, sp, #0x50
  0x22fecd4: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fecd8: tbz      w0, #0, #0x22ff06c
  0x22fecdc: ldr      x0, [x19, #0x18]
  0x22fece0: cbz      x0, #0x22ff118
  0x22fece4: ldr      x25, [sp, #0x60]
  0x22fece8: mov      x1, xzr
  0x22fecec: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x22fecf0: cbz      x0, #0x22ff11c
  0x22fecf4: adrp     x8, #0x5511000
  0x22fecf8: ldr      x22, [x0, #0x10] ; = 0x0 (u64 @ 0x550f010)
  0x22fecfc: ldr      x8, [x8, #0xfa8] ; = 0x0 (u64 @ 0x5511fa8)
  0x22fed00: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fed04: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22fed08: adrp     x8, #0x5512000
  0x22fed0c: ldr      x8, [x8, #0x498] ; = 0x0 (u64 @ 0x5512498)
  0x22fed10: mov      x21, x0
  0x22fed14: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fed18: mov      x1, x22
  0x22fed1c: bl       #0x444a0b0 ; -> System.Collections.Generic.List<object>$$.ctor
  0x22fed20: cbz      x21, #0x22ff114
  0x22fed24: ldr      w8, [x21, #0x18]
  0x22fed28: sub      w22, w8, #1
  0x22fed2c: cmp      w22, #0
  0x22fed30: b.le     #0x22feda4
  0x22fed34: mov      w0, wzr
  0x22fed38: mov      w1, w22
  0x22fed3c: mov      x2, xzr
  0x22fed40: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x22fed44: mov      w1, w0
  0x22fed48: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x22fed4c: str      w22, [sp, #0x6c]
  0x22fed50: str      w1, [sp, #0x4c]
  0x22fed54: mov      x0, x21
  0x22fed58: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x22fed5c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x22fed60: mov      x24, x0
  0x22fed64: mov      x0, x21
  0x22fed68: mov      w1, w22
  0x22fed6c: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x22fed70: ldr      w1, [sp, #0x6c]
  0x22fed74: ldr      x3, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x22fed78: mov      x23, x0
  0x22fed7c: mov      x0, x21
  0x22fed80: mov      x2, x24
  0x22fed84: bl       #0x444a540 ; -> System.Collections.Generic.List<object>$$set_Item
  0x22fed88: ldr      w1, [sp, #0x4c]
  0x22fed8c: ldr      x3, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x22fed90: sub      w22, w22, #1
  0x22fed94: mov      x0, x21
  0x22fed98: mov      x2, x23
  0x22fed9c: bl       #0x444a540 ; -> System.Collections.Generic.List<object>$$set_Item
  0x22feda0: b        #0x22fed2c
  0x22feda4: adrp     x8, #0x5511000
  0x22feda8: ldr      x8, [x8, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x22fedac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fedb0: add      x8, sp, #0x18
  0x22fedb4: mov      x0, x21
  0x22fedb8: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fedbc: ldur     q0, [sp, #0x18]
  0x22fedc0: ldr      x8, [sp, #0x28]
  0x22fedc4: str      q0, [sp, #0x30]
  0x22fedc8: str      x8, [sp, #0x40]
  0x22fedcc: ldr      x1, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x22fedd0: add      x0, sp, #0x30
  0x22fedd4: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fedd8: tbz      w0, #0, #0x22fee70
  0x22feddc: ldr      x0, [x27] ; = 0x0 (u64 @ 0x550f000)
  0x22fede0: ldr      x21, [sp, #0x40]
  0x22fede4: ldr      w8, [x0, #0xe0]
  0x22fede8: cbnz     w8, #0x22fedf0
  0x22fedec: bl       #0x218489c ; -> ??? 0x218489c
  0x22fedf0: mov      x0, x21
  0x22fedf4: mov      x1, xzr
  0x22fedf8: mov      x2, xzr
  0x22fedfc: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x22fee00: tbnz     w0, #0, #0x22fedcc
  0x22fee04: mov      x0, xzr
  0x22fee08: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fee0c: cbz      x0, #0x22fefb8
  0x22fee10: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22fee14: cbz      x0, #0x22fefc0
  0x22fee18: mov      x1, xzr
  0x22fee1c: bl       #0x24cbee4 ; -> CBuffManager.CBuffPool$$GetBuff
  0x22fee20: cbz      x25, #0x22fefa8
  0x22fee24: mov      x22, x0
  0x22fee28: cbz      x0, #0x22fefb0
  0x22fee2c: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fee30: ldr      w5, [x25, #0x2c]
  0x22fee34: ldr      x2, [x19, #0x18]
  0x22fee38: mov      w4, #1
  0x22fee3c: mov      x0, x22
  0x22fee40: mov      x3, x21
  0x22fee44: bl       #0x22f4cdc ; -> CBuff$$Initialize
  0x22fee48: tbnz     w0, #0, #0x22fee7c
  0x22fee4c: mov      x0, xzr
  0x22fee50: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22fee54: cbz      x0, #0x22fefc8
  0x22fee58: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22fee5c: cbz      x0, #0x22fefd0
  0x22fee60: mov      x1, x22
  0x22fee64: mov      x2, xzr
  0x22fee68: bl       #0x24cb8a8 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x22fee6c: b        #0x22fedcc
  0x22fee70: mov      x23, xzr
  0x22fee74: mov      w24, wzr
  0x22fee78: b        #0x22fef20
  0x22fee7c: mov      x0, x22
  0x22fee80: bl       #0x22fc38c ; -> CBuff$$Run
  0x22fee84: ldr      w8, [x25, #0x2c]
  0x22fee88: str      w8, [x22, #0x2c]
  0x22fee8c: cbz      x21, #0x22fefd8
  0x22fee90: mov      x0, x21
  0x22fee94: mov      x1, x22
  0x22fee98: mov      x2, xzr
  0x22fee9c: bl       #0x26daeb8 ; -> CCharacterBattle$$AddBuff
  0x22feea0: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22feea4: cbz      x8, #0x22fefe0
  0x22feea8: ldr      x22, [x8, #0x18] ; = 0x0 (u64 @ 0x5511018)
  0x22feeac: mov      x0, x21
  0x22feeb0: mov      x1, xzr
  0x22feeb4: bl       #0x27d1518 ; -> CCharacter$$get_ID
  0x22feeb8: str      w0, [sp, #0x4c]
  0x22feebc: add      x0, sp, #0x4c
  0x22feec0: mov      x1, xzr
  0x22feec4: bl       #0x48a1298 ; -> System.Int32$$ToString
  0x22feec8: adrp     x8, #0x5512000
  0x22feecc: ldr      x8, [x8, #0x4e0] ; = 0x0 (u64 @ 0x55124e0)
  0x22feed0: mov      x3, x0
  0x22feed4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feed8: adrp     x8, #0x5512000
  0x22feedc: ldr      x8, [x8, #0x4d0] ; = 0x0 (u64 @ 0x55124d0)
  0x22feee0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22feee4: mov      x1, x22
  0x22feee8: mov      x4, xzr
  0x22feeec: bl       #0x47191b0 ; -> System.String$$Concat
  0x22feef0: adrp     x8, #0x5511000
  0x22feef4: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22feef8: mov      x21, x0
  0x22feefc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fef00: ldr      w8, [x0, #0xe0]
  0x22fef04: cbnz     w8, #0x22fef0c
  0x22fef08: bl       #0x218489c ; -> ??? 0x218489c
  0x22fef0c: mov      x0, x21
  0x22fef10: mov      x1, xzr
  0x22fef14: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x22fef18: mov      x23, xzr
  0x22fef1c: mov      w24, #1
  0x22fef20: mov      w21, #0x63
  0x22fef24: adrp     x8, #0x5511000
  0x22fef28: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x22fef2c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fef30: add      x0, sp, #0x30
  0x22fef34: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fef38: cbnz     x23, #0x22ff120
  0x22fef3c: cmp      w21, #0x63
  0x22fef40: b.eq     #0x22fef48
  0x22fef44: cbnz     w21, #0x22ff0d4
  0x22fef48: tbnz     w24, #0, #0x22fecc4
  0x22fef4c: cbz      x25, #0x22ff12c
  0x22fef50: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22fef54: cbz      x8, #0x22ff128
  0x22fef58: ldr      x1, [x8, #0x18] ; = 0x0 (u64 @ 0x5511018)
  0x22fef5c: adrp     x8, #0x5512000
  0x22fef60: ldr      x8, [x8, #0x4e0] ; = 0x0 (u64 @ 0x55124e0)
  0x22fef64: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fef68: adrp     x8, #0x5512000
  0x22fef6c: ldr      x8, [x8, #0x510] ; = 0x0 (u64 @ 0x5512510)
  0x22fef70: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fef74: mov      x3, xzr
  0x22fef78: bl       #0x4718e90 ; -> System.String$$Concat
  0x22fef7c: adrp     x8, #0x5511000
  0x22fef80: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x22fef84: mov      x21, x0
  0x22fef88: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fef8c: ldr      w8, [x0, #0xe0]
  0x22fef90: cbnz     w8, #0x22fef98
  0x22fef94: bl       #0x218489c ; -> ??? 0x218489c
  0x22fef98: mov      x0, x21
  0x22fef9c: mov      x1, xzr
  0x22fefa0: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x22fefa4: b        #0x22fecc4
  0x22fefa8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefac: b        #0x22ff130
  0x22fefb0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefb4: b        #0x22ff130
  0x22fefb8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefbc: b        #0x22ff130
  0x22fefc0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefc4: b        #0x22ff130
  0x22fefc8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefcc: b        #0x22ff130
  0x22fefd0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefd4: b        #0x22ff130
  0x22fefd8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefdc: b        #0x22ff130
  0x22fefe0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fefe4: b        #0x22ff130
  0x22fefe8: b        #0x22feffc
  0x22fefec: b        #0x22feffc
  0x22feff0: b        #0x22feffc
  0x22feff4: b        #0x22ff040
  0x22feff8: b        #0x22ff040
  0x22feffc: mov      x22, x1
  0x22ff000: mov      x21, x0
  0x22ff004: mov      w24, #1
  0x22ff008: b        #0x22ff04c
  0x22ff00c: b        #0x22ff040
  0x22ff010: b        #0x22ff040
  0x22ff014: b        #0x22ff040
  0x22ff018: b        #0x22ff040
  0x22ff01c: b        #0x22ff040
  0x22ff020: b        #0x22ff040
  0x22ff024: b        #0x22ff040
  0x22ff028: b        #0x22ff040
  0x22ff02c: b        #0x22ff040
  0x22ff030: b        #0x22ff040
  0x22ff034: b        #0x22ff040
  0x22ff038: b        #0x22ff040
  0x22ff03c: b        #0x22ff040
  0x22ff040: mov      x22, x1
  0x22ff044: mov      x21, x0
  0x22ff048: mov      w24, wzr
  0x22ff04c: cmp      w22, #1
  0x22ff050: b.ne     #0x22ff0ec
  0x22ff054: mov      x0, x21
  0x22ff058: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff05c: ldr      x23, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff060: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff064: mov      w21, wzr
  0x22ff068: b        #0x22fef24
  0x22ff06c: adrp     x8, #0x5511000
  0x22ff070: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff074: add      x0, sp, #0x50
  0x22ff078: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff07c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff080: adrp     x8, #0x5511000
  0x22ff084: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22ff088: ldr      x0, [sp, #0x10]
  0x22ff08c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff090: add      x8, sp, #0x18
  0x22ff094: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22ff098: ldur     q0, [sp, #0x18]
  0x22ff09c: ldr      x8, [sp, #0x28]
  0x22ff0a0: str      q0, [sp, #0x50]
  0x22ff0a4: str      x8, [sp, #0x60]
  0x22ff0a8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x22ff0ac: add      x0, sp, #0x50
  0x22ff0b0: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22ff0b4: tbz      w0, #0, #0x22fd290
  0x22ff0b8: ldr      x0, [x19, #0x20]
  0x22ff0bc: cbz      x0, #0x22ff110
  0x22ff0c0: ldr      x1, [sp, #0x60]
  0x22ff0c4: mov      w2, #1
  0x22ff0c8: mov      x3, xzr
  0x22ff0cc: bl       #0x26db46c ; -> CCharacterBattle$$RemoveBuff
  0x22ff0d0: b        #0x22ff0a8
  0x22ff0d4: adrp     x8, #0x5511000
  0x22ff0d8: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff0dc: add      x0, sp, #0x50
  0x22ff0e0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff0e4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff0e8: b        #0x22ff4a8
  0x22ff0ec: mov      x23, xzr
  0x22ff0f0: adrp     x8, #0x5511000
  0x22ff0f4: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x22ff0f8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff0fc: add      x0, sp, #0x30
  0x22ff100: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff104: cbz      x23, #0x22ff81c
  0x22ff108: mov      x0, x23
  0x22ff10c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff110: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff114: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff118: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff11c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff120: mov      x0, x23
  0x22ff124: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff128: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff12c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff130: mov      x20, xzr
  0x22ff134: b        #0x22ff13c
  0x22ff138: mov      x21, x0
  0x22ff13c: adrp     x8, #0x5511000
  0x22ff140: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff144: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff148: add      x0, sp, #0x50
  0x22ff14c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff150: cbz      x20, #0x22ff880
  0x22ff154: mov      x0, x20
  0x22ff158: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff15c: mov      x22, x1
  0x22ff160: mov      x21, x0
  0x22ff164: b        #0x22ff0f0
  0x22ff168: b        #0x22ff814
  0x22ff16c: b        #0x22ff814
  0x22ff170: b        #0x22ff814
  0x22ff174: b        #0x22ff814
  0x22ff178: b        #0x22ff814
  0x22ff17c: b        #0x22ff814
  0x22ff180: b        #0x22ff814
  0x22ff184: b        #0x22ff814
  0x22ff188: b        #0x22ff814
  0x22ff18c: b        #0x22ff198
  0x22ff190: b        #0x22ff198
  0x22ff194: b        #0x22ff814
  0x22ff198: mov      x21, x0
  0x22ff19c: cmp      w1, #1
  0x22ff1a0: b.ne     #0x22ff390
  0x22ff1a4: mov      x0, x21
  0x22ff1a8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff1ac: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff1b0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff1b4: adrp     x8, #0x5511000
  0x22ff1b8: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff1bc: add      x0, sp, #0x50
  0x22ff1c0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff1c4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff1c8: cbnz     x20, #0x22ff7d0
  0x22ff1cc: ldr      x0, [x19, #0x20]
  0x22ff1d0: cbz      x0, #0x22ff754
  0x22ff1d4: mov      w1, wzr
  0x22ff1d8: mov      x2, xzr
  0x22ff1dc: bl       #0x26db9a8 ; -> CCharacterBattle$$GetBuffList
  0x22ff1e0: adrp     x8, #0x5512000
  0x22ff1e4: ldr      x8, [x8, #0x4b0] ; = 0x0 (u64 @ 0x55124b0)
  0x22ff1e8: mov      x21, x0
  0x22ff1ec: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22ff1f0: mov      x0, x8
  0x22ff1f4: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x22ff1f8: adrp     x8, #0x5512000
  0x22ff1fc: ldr      x8, [x8, #0x4a0] ; = 0x0 (u64 @ 0x55124a0)
  0x22ff200: mov      x1, x21
  0x22ff204: mov      x20, x0
  0x22ff208: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22ff20c: bl       #0x444a0b0 ; -> System.Collections.Generic.List<object>$$.ctor
  0x22ff210: cbz      x20, #0x22ff4a4
  0x22ff214: ldr      w8, [x20, #0x18]
  0x22ff218: cmp      w8, #1
  0x22ff21c: b.lt     #0x22ff4a4
  0x22ff220: adrp     x8, #0x5511000
  0x22ff224: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22ff228: mov      x0, x20
  0x22ff22c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff230: add      x8, sp, #0x18
  0x22ff234: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22ff238: ldur     q0, [sp, #0x18]
  0x22ff23c: ldr      x8, [sp, #0x28]
  0x22ff240: adrp     x23, #0x5511000
  0x22ff244: ldr      x23, [x23, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22ff248: str      q0, [sp, #0x50]
  0x22ff24c: str      x8, [sp, #0x60]
  0x22ff250: adrp     x24, #0x5511000
  0x22ff254: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22ff258: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22ff25c: add      x0, sp, #0x50
  0x22ff260: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22ff264: tbz      w0, #0, #0x22fd290
  0x22ff268: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x22ff26c: ldr      x20, [sp, #0x60]
  0x22ff270: ldr      w8, [x0, #0xe0]
  0x22ff274: cbnz     w8, #0x22ff27c
  0x22ff278: bl       #0x218489c ; -> ??? 0x218489c
  0x22ff27c: mov      x0, xzr
  0x22ff280: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x22ff284: cbz      x20, #0x22ff36c
  0x22ff288: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff28c: cbz      x8, #0x22ff370
  0x22ff290: cbz      x0, #0x22ff374
  0x22ff294: ldr      w1, [x8, #0xd8]
  0x22ff298: mov      x2, xzr
  0x22ff29c: bl       #0x25eea44 ; -> CTempletManager$$GetBuffToolTipTemplet
  0x22ff2a0: mov      x22, x0
  0x22ff2a4: cbz      x0, #0x22ff258
  0x22ff2a8: ldr      w8, [x22, #0x34]
  0x22ff2ac: cmp      w8, #1
  0x22ff2b0: b.lt     #0x22ff258
  0x22ff2b4: mov      x0, xzr
  0x22ff2b8: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22ff2bc: cbz      x0, #0x22ff378
  0x22ff2c0: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22ff2c4: cbz      x0, #0x22ff388
  0x22ff2c8: mov      x1, xzr
  0x22ff2cc: bl       #0x24cbee4 ; -> CBuffManager.CBuffPool$$GetBuff
  0x22ff2d0: mov      x21, x0
  0x22ff2d4: ldr      x0, [x20, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff2d8: cbz      x0, #0x22ff380
  0x22ff2dc: ldr      w1, [x22, #0x34]
  0x22ff2e0: mov      x2, xzr
  0x22ff2e4: bl       #0x25a7444 ; -> CBuffTemplet$$CopyForChangeDebuff
  0x22ff2e8: mov      x1, x0
  0x22ff2ec: cbz      x21, #0x22ff37c
  0x22ff2f0: mov      x0, x21
  0x22ff2f4: str      x1, [x0, #0x10]!
  0x22ff2f8: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22ff2fc: ldr      x1, [x21, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff300: ldr      x2, [x19, #0x18]
  0x22ff304: ldr      x3, [x20, #0x20] ; = 0x0 (u64 @ 0x5511020)
  0x22ff308: mov      w4, #1
  0x22ff30c: mov      w5, #-1
  0x22ff310: mov      x0, x21
  0x22ff314: bl       #0x22f4cdc ; -> CBuff$$Initialize
  0x22ff318: tbz      w0, #0, #0x22ff350
  0x22ff31c: ldr      x1, [x19, #0x18]
  0x22ff320: mov      x0, x21
  0x22ff324: str      x1, [x0, #0x18]!
  0x22ff328: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22ff32c: mov      x0, x21
  0x22ff330: bl       #0x22fc38c ; -> CBuff$$Run
  0x22ff334: ldr      w8, [x20, #0x2c]
  0x22ff338: str      w8, [x21, #0x2c]
  0x22ff33c: ldr      x0, [x19, #0x20]
  0x22ff340: cbz      x0, #0x22ff38c
  0x22ff344: mov      x1, x21
  0x22ff348: mov      x2, xzr
  0x22ff34c: bl       #0x26daeb8 ; -> CCharacterBattle$$AddBuff
  0x22ff350: ldr      x0, [x19, #0x20]
  0x22ff354: cbz      x0, #0x22ff384
  0x22ff358: mov      w2, #1
  0x22ff35c: mov      x1, x20
  0x22ff360: mov      x3, xzr
  0x22ff364: bl       #0x26db46c ; -> CCharacterBattle$$RemoveBuff
  0x22ff368: b        #0x22ff258
  0x22ff36c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff370: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff374: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff378: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff37c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff380: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff384: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff388: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff38c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff390: mov      x20, xzr
  0x22ff394: b        #0x22ff39c
  0x22ff398: mov      x21, x0
  0x22ff39c: adrp     x8, #0x5511000
  0x22ff3a0: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff3a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff3a8: add      x0, sp, #0x50
  0x22ff3ac: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff3b0: cbz      x20, #0x22ff880
  0x22ff3b4: mov      x0, x20
  0x22ff3b8: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff3bc: b        #0x22ff414
  0x22ff3c0: b        #0x22ff414
  0x22ff3c4: b        #0x22ff414
  0x22ff3c8: b        #0x22ff414
  0x22ff3cc: b        #0x22ff414
  0x22ff3d0: b        #0x22ff414
  0x22ff3d4: b        #0x22ff414
  0x22ff3d8: b        #0x22ff414
  0x22ff3dc: b        #0x22ff414
  0x22ff3e0: b        #0x22ff414
  0x22ff3e4: b        #0x22ff414
  0x22ff3e8: b        #0x22ff414
  0x22ff3ec: b        #0x22ff414
  0x22ff3f0: b        #0x22ff414
  0x22ff3f4: b        #0x22ff814
  0x22ff3f8: b        #0x22ff414
  0x22ff3fc: b        #0x22ff814
  0x22ff400: b        #0x22ff414
  0x22ff404: b        #0x22ff414
  0x22ff408: b        #0x22ff414
  0x22ff40c: b        #0x22ff414
  0x22ff410: b        #0x22ff414
  0x22ff414: mov      x21, x0
  0x22ff418: cmp      w1, #1
  0x22ff41c: b.ne     #0x22ff688
  0x22ff420: mov      x0, x21
  0x22ff424: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff428: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff42c: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff430: adrp     x8, #0x5511000
  0x22ff434: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff438: add      x0, sp, #0x50
  0x22ff43c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff440: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff444: cbnz     x20, #0x22ff7d0
  0x22ff448: adrp     x8, #0x550f000
  0x22ff44c: ldr      x8, [x8, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x22ff450: ldr      x20, [x19, #0x18]
  0x22ff454: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x22ff458: ldr      w8, [x0, #0xe0]
  0x22ff45c: cbnz     w8, #0x22ff464
  0x22ff460: bl       #0x218489c ; -> ??? 0x218489c
  0x22ff464: mov      x0, x20
  0x22ff468: mov      x1, xzr
  0x22ff46c: mov      x2, xzr
  0x22ff470: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x22ff474: tbnz     w0, #0, #0x22ff4a4
  0x22ff478: ldr      x0, [x19, #0x18]
  0x22ff47c: cbz      x0, #0x22ff754
  0x22ff480: mov      w1, wzr
  0x22ff484: mov      x2, xzr
  0x22ff488: bl       #0x26db9a8 ; -> CCharacterBattle$$GetBuffList
  0x22ff48c: adrp     x8, #0x5511000
  0x22ff490: ldr      x8, [x8, #0x820] ; = 0x0 (u64 @ 0x5511820)
  0x22ff494: mov      x20, x0
  0x22ff498: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff49c: bl       #0x33c3af4 ; -> CExtension$$IsNullOrEmpty<object>
  0x22ff4a0: tbz      w0, #0, #0x22ff4cc
  0x22ff4a4: mov      w24, #1
  0x22ff4a8: and      w0, w24, #1
  0x22ff4ac: ldp      x20, x19, [sp, #0xc0]
  0x22ff4b0: ldp      x22, x21, [sp, #0xb0]
  0x22ff4b4: ldp      x24, x23, [sp, #0xa0]
  0x22ff4b8: ldp      x26, x25, [sp, #0x90]
  0x22ff4bc: ldp      x28, x27, [sp, #0x80]
  0x22ff4c0: ldp      x29, x30, [sp, #0x70]
  0x22ff4c4: add      sp, sp, #0xd0
  0x22ff4c8: ret      
  0x22ff4cc: cbz      x20, #0x22ff754
  0x22ff4d0: adrp     x8, #0x5511000
  0x22ff4d4: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22ff4d8: mov      x0, x20
  0x22ff4dc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff4e0: add      x8, sp, #0x18
  0x22ff4e4: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22ff4e8: ldur     q0, [sp, #0x18]
  0x22ff4ec: ldr      x8, [sp, #0x28]
  0x22ff4f0: adrp     x21, #0x5511000
  0x22ff4f4: adrp     x22, #0x5511000
  0x22ff4f8: adrp     x23, #0x5511000
  0x22ff4fc: ldr      x21, [x21, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22ff500: ldr      x22, [x22, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x22ff504: ldr      x23, [x23, #0x828] ; = 0x0 (u64 @ 0x5511828)
  0x22ff508: str      q0, [sp, #0x50]
  0x22ff50c: str      x8, [sp, #0x60]
  0x22ff510: adrp     x24, #0x5511000
  0x22ff514: ldr      x24, [x24, #0x680] ; = 0x0 (u64 @ 0x5511680)
  0x22ff518: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x22ff51c: add      x0, sp, #0x50
  0x22ff520: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22ff524: tbz      w0, #0, #0x22fd290
  0x22ff528: ldr      x25, [sp, #0x60]
  0x22ff52c: cbz      x25, #0x22ff518
  0x22ff530: ldr      w8, [x25, #0x2c]
  0x22ff534: cmp      w8, #1
  0x22ff538: b.lt     #0x22ff518
  0x22ff53c: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff540: cbz      x8, #0x22ff654
  0x22ff544: ldr      w8, [x8, #0xd8]
  0x22ff548: cmp      w8, #1
  0x22ff54c: b.lt     #0x22ff518
  0x22ff550: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22ff554: ldr      w8, [x0, #0xe0]
  0x22ff558: cbnz     w8, #0x22ff560
  0x22ff55c: bl       #0x218489c ; -> ??? 0x218489c
  0x22ff560: mov      x0, xzr
  0x22ff564: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x22ff568: ldr      x8, [x26]
  0x22ff56c: cbz      x8, #0x22ff65c
  0x22ff570: cbz      x0, #0x22ff658
  0x22ff574: ldr      w1, [x8, #0x54]
  0x22ff578: mov      x2, xzr
  0x22ff57c: bl       #0x25ee984 ; -> CTempletManager$$GetToolTipMemberTemplet
  0x22ff580: mov      x20, x0
  0x22ff584: cbz      x0, #0x22ff518
  0x22ff588: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x5511018)
  0x22ff58c: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x22ff590: bl       #0x33c39f8 ; -> CExtension$$IsNullOrEmpty<int>
  0x22ff594: tbnz     w0, #0, #0x22ff518
  0x22ff598: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff59c: cbz      x8, #0x22ff660
  0x22ff5a0: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x5511018)
  0x22ff5a4: cbz      x0, #0x22ff664
  0x22ff5a8: ldr      w1, [x8, #0xd8]
  0x22ff5ac: ldr      x2, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x22ff5b0: bl       #0x43fd6bc ; -> System.Collections.Generic.List<int>$$Contains
  0x22ff5b4: tbz      w0, #0, #0x22ff518
  0x22ff5b8: mov      x0, xzr
  0x22ff5bc: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22ff5c0: cbz      x0, #0x22ff670
  0x22ff5c4: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22ff5c8: cbz      x0, #0x22ff66c
  0x22ff5cc: mov      x1, xzr
  0x22ff5d0: bl       #0x24cbee4 ; -> CBuffManager.CBuffPool$$GetBuff
  0x22ff5d4: ldr      x8, [x19, #0x10]
  0x22ff5d8: cbz      x8, #0x22ff668
  0x22ff5dc: mov      x20, x0
  0x22ff5e0: cbz      x0, #0x22ff674
  0x22ff5e4: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x5511010)
  0x22ff5e8: ldp      x2, x3, [x19, #0x18]
  0x22ff5ec: ldr      w5, [x8, #0x88]
  0x22ff5f0: mov      x0, x20
  0x22ff5f4: mov      w4, wzr
  0x22ff5f8: bl       #0x22f4cdc ; -> CBuff$$Initialize
  0x22ff5fc: tbz      w0, #0, #0x22ff630
  0x22ff600: mov      x0, x20
  0x22ff604: bl       #0x22fc38c ; -> CBuff$$Run
  0x22ff608: ldr      x8, [x26]
  0x22ff60c: cbz      x8, #0x22ff684
  0x22ff610: ldr      w8, [x8, #0x88]
  0x22ff614: str      w8, [x20, #0x2c]
  0x22ff618: ldr      x0, [x19, #0x20]
  0x22ff61c: cbz      x0, #0x22ff67c
  0x22ff620: mov      x1, x20
  0x22ff624: mov      x2, xzr
  0x22ff628: bl       #0x26daeb8 ; -> CCharacterBattle$$AddBuff
  0x22ff62c: b        #0x22ff518
  0x22ff630: mov      x0, xzr
  0x22ff634: bl       #0x24c7018 ; -> CBuffManager$$get_Instance
  0x22ff638: cbz      x0, #0x22ff678
  0x22ff63c: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x22ff640: cbz      x0, #0x22ff680
  0x22ff644: mov      x1, x20
  0x22ff648: mov      x2, xzr
  0x22ff64c: bl       #0x24cb8a8 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x22ff650: b        #0x22ff518
  0x22ff654: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff658: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff65c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff660: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff664: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff668: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff66c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff670: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff674: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff678: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff67c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff680: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff684: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff688: mov      x20, xzr
  0x22ff68c: b        #0x22ff694
  0x22ff690: mov      x21, x0
  0x22ff694: adrp     x8, #0x5511000
  0x22ff698: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff69c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff6a0: add      x0, sp, #0x50
  0x22ff6a4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff6a8: cbz      x20, #0x22ff880
  0x22ff6ac: mov      x0, x20
  0x22ff6b0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff6b4: b        #0x22ff718
  0x22ff6b8: b        #0x22ff718
  0x22ff6bc: b        #0x22ff718
  0x22ff6c0: b        #0x22ff718
  0x22ff6c4: b        #0x22ff718
  0x22ff6c8: b        #0x22ff718
  0x22ff6cc: b        #0x22ff718
  0x22ff6d0: b        #0x22ff718
  0x22ff6d4: b        #0x22ff718
  0x22ff6d8: b        #0x22ff718
  0x22ff6dc: b        #0x22ff718
  0x22ff6e0: b        #0x22ff718
  0x22ff6e4: b        #0x22ff718
  0x22ff6e8: b        #0x22ff718
  0x22ff6ec: b        #0x22ff718
  0x22ff6f0: b        #0x22ff718
  0x22ff6f4: b        #0x22ff718
  0x22ff6f8: b        #0x22ff718
  0x22ff6fc: b        #0x22ff718
  0x22ff700: b        #0x22ff718
  0x22ff704: b        #0x22ff718
  0x22ff708: b        #0x22ff718
  0x22ff70c: b        #0x22ff718
  0x22ff710: b        #0x22ff718
  0x22ff714: b        #0x22ff718
  0x22ff718: mov      x21, x0
  0x22ff71c: cmp      w1, #1
  0x22ff720: b.ne     #0x22ff758
  0x22ff724: mov      x0, x21
  0x22ff728: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff72c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff730: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff734: adrp     x8, #0x5511000
  0x22ff738: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff73c: add      x0, sp, #0x50
  0x22ff740: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff744: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff748: cbnz     x20, #0x22ff7d0
  0x22ff74c: ldr      x8, [x26]
  0x22ff750: cbnz     x8, #0x22fca88
  0x22ff754: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ff758: mov      x20, xzr
  0x22ff75c: b        #0x22ff764
  0x22ff760: mov      x21, x0
  0x22ff764: adrp     x8, #0x5511000
  0x22ff768: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff76c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff770: add      x0, sp, #0x50
  0x22ff774: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff778: cbz      x20, #0x22ff880
  0x22ff77c: mov      x0, x20
  0x22ff780: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff784: b        #0x22ff79c
  0x22ff788: b        #0x22ff79c
  0x22ff78c: b        #0x22ff79c
  0x22ff790: b        #0x22ff79c
  0x22ff794: b        #0x22ff79c
  0x22ff798: b        #0x22ff79c
  0x22ff79c: mov      x21, x0
  0x22ff7a0: cmp      w1, #1
  0x22ff7a4: b.ne     #0x22ff7d8
  0x22ff7a8: mov      x0, x21
  0x22ff7ac: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff7b0: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff7b4: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff7b8: adrp     x8, #0x5511000
  0x22ff7bc: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff7c0: add      x0, sp, #0x50
  0x22ff7c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff7c8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff7cc: cbz      x20, #0x22fdaec
  0x22ff7d0: mov      x0, x20
  0x22ff7d4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff7d8: mov      x20, xzr
  0x22ff7dc: b        #0x22ff7e4
  0x22ff7e0: mov      x21, x0
  0x22ff7e4: adrp     x8, #0x5511000
  0x22ff7e8: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff7ec: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff7f0: add      x0, sp, #0x50
  0x22ff7f4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff7f8: cbz      x20, #0x22ff880
  0x22ff7fc: mov      x0, x20
  0x22ff800: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff804: b        #0x22ff814
  0x22ff808: b        #0x22ff814
  0x22ff80c: b        #0x22ff814
  0x22ff810: b        #0x22ff814
  0x22ff814: mov      x22, x1
  0x22ff818: mov      x21, x0
  0x22ff81c: cmp      w22, #1
  0x22ff820: b.ne     #0x22ff85c
  0x22ff824: mov      x0, x21
  0x22ff828: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ff82c: ldr      x22, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x22ff830: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ff834: adrp     x8, #0x5511000
  0x22ff838: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff83c: add      x0, sp, #0x50
  0x22ff840: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff844: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff848: adrp     x21, #0x5511000
  0x22ff84c: ldr      x21, [x21, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22ff850: cbz      x22, #0x22ff080
  0x22ff854: mov      x0, x22
  0x22ff858: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff85c: mov      x22, xzr
  0x22ff860: b        #0x22ff868
  0x22ff864: mov      x21, x0
  0x22ff868: adrp     x8, #0x5511000
  0x22ff86c: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ff870: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ff874: add      x0, sp, #0x50
  0x22ff878: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ff87c: cbnz     x22, #0x22ff888
  0x22ff880: mov      x0, x21
  0x22ff884: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x22ff888: mov      x0, x22
  0x22ff88c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ff890: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
