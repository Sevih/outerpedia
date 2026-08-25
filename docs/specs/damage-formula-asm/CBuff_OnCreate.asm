; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBuff_OnCreate @ 0x232d68c..0x23308e0 (taille 12884 octets) =====
  0x232d68c: sub      sp, sp, #0xd0
  0x232d690: stp      x29, x30, [sp, #0x70]
  0x232d694: stp      x28, x27, [sp, #0x80]
  0x232d698: stp      x26, x25, [sp, #0x90]
  0x232d69c: stp      x24, x23, [sp, #0xa0]
  0x232d6a0: stp      x22, x21, [sp, #0xb0]
  0x232d6a4: stp      x20, x19, [sp, #0xc0]
  0x232d6a8: adrp     x20, #0x59e4000
  0x232d6ac: ldrb     w8, [x20, #0xc0b]
  0x232d6b0: mov      x19, x0
  0x232d6b4: tbnz     w8, #0, #0x232d99c
  0x232d6b8: adrp     x0, #0x5596000
  0x232d6bc: ldr      x0, [x0, #0x630] ; = 0x0 (u64 @ 0x5596630)
  0x232d6c0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d6c4: adrp     x0, #0x5599000
  0x232d6c8: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232d6cc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d6d0: adrp     x0, #0x5598000
  0x232d6d4: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232d6d8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d6dc: adrp     x0, #0x5598000
  0x232d6e0: ldr      x0, [x0, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x232d6e4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d6e8: adrp     x0, #0x5599000
  0x232d6ec: ldr      x0, [x0, #0x9c0] ; = 0x0 (u64 @ 0x55999c0)
  0x232d6f0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d6f4: adrp     x0, #0x5598000
  0x232d6f8: ldr      x0, [x0, #0xd68] ; = 0x0 (u64 @ 0x5598d68)
  0x232d6fc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d700: adrp     x0, #0x5599000
  0x232d704: ldr      x0, [x0, #0x9c8] ; = 0x0 (u64 @ 0x55999c8)
  0x232d708: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d70c: adrp     x0, #0x5598000
  0x232d710: ldr      x0, [x0, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232d714: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d718: adrp     x0, #0x5598000
  0x232d71c: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x232d720: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d724: adrp     x0, #0x5599000
  0x232d728: ldr      x0, [x0, #0x9d0] ; = 0x0 (u64 @ 0x55999d0)
  0x232d72c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d730: adrp     x0, #0x5599000
  0x232d734: ldr      x0, [x0, #0x9d8] ; = 0x0 (u64 @ 0x55999d8)
  0x232d738: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d73c: adrp     x0, #0x5599000
  0x232d740: ldr      x0, [x0, #0x9e0] ; = 0x0 (u64 @ 0x55999e0)
  0x232d744: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d748: adrp     x0, #0x5599000
  0x232d74c: ldr      x0, [x0, #0x9e8] ; = 0x0 (u64 @ 0x55999e8)
  0x232d750: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d754: adrp     x0, #0x5598000
  0x232d758: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x232d75c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d760: adrp     x0, #0x5598000
  0x232d764: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232d768: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d76c: adrp     x0, #0x5598000
  0x232d770: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x232d774: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d778: adrp     x0, #0x5598000
  0x232d77c: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x232d780: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d784: adrp     x0, #0x5598000
  0x232d788: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x232d78c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d790: adrp     x0, #0x5598000
  0x232d794: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x232d798: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d79c: adrp     x0, #0x5599000
  0x232d7a0: ldr      x0, [x0, #0x9f0] ; = 0x0 (u64 @ 0x55999f0)
  0x232d7a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7a8: adrp     x0, #0x5596000
  0x232d7ac: ldr      x0, [x0, #0x558] ; = 0x0 (u64 @ 0x5596558)
  0x232d7b0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7b4: adrp     x0, #0x5598000
  0x232d7b8: ldr      x0, [x0, #0xcd8] ; = 0x0 (u64 @ 0x5598cd8)
  0x232d7bc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7c0: adrp     x0, #0x5596000
  0x232d7c4: ldr      x0, [x0, #0x618] ; = 0x0 (u64 @ 0x5596618)
  0x232d7c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7cc: adrp     x0, #0x5598000
  0x232d7d0: ldr      x0, [x0, #0xbc0] ; = 0x0 (u64 @ 0x5598bc0)
  0x232d7d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7d8: adrp     x0, #0x5598000
  0x232d7dc: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x232d7e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7e4: adrp     x0, #0x5598000
  0x232d7e8: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x232d7ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7f0: adrp     x0, #0x5599000
  0x232d7f4: ldr      x0, [x0, #0x9f8] ; = 0x0 (u64 @ 0x55999f8)
  0x232d7f8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d7fc: adrp     x0, #0x5598000
  0x232d800: ldr      x0, [x0, #0x9d8] ; = 0x0 (u64 @ 0x55989d8)
  0x232d804: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d808: adrp     x0, #0x5599000
  0x232d80c: ldr      x0, [x0, #0xa00] ; = 0x0 (u64 @ 0x5599a00)
  0x232d810: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d814: adrp     x0, #0x5599000
  0x232d818: ldr      x0, [x0, #0xa08] ; = 0x0 (u64 @ 0x5599a08)
  0x232d81c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d820: adrp     x0, #0x5596000
  0x232d824: ldr      x0, [x0, #0x608] ; = 0x0 (u64 @ 0x5596608)
  0x232d828: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d82c: adrp     x0, #0x5599000
  0x232d830: ldr      x0, [x0, #0x898] ; = 0x0 (u64 @ 0x5599898)
  0x232d834: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d838: adrp     x0, #0x5598000
  0x232d83c: ldr      x0, [x0, #0xb50] ; = 0x0 (u64 @ 0x5598b50)
  0x232d840: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d844: adrp     x0, #0x5599000
  0x232d848: ldr      x0, [x0, #0x2b8] ; = 0x0 (u64 @ 0x55992b8)
  0x232d84c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d850: adrp     x0, #0x5598000
  0x232d854: ldr      x0, [x0, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x232d858: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d85c: adrp     x0, #0x5599000
  0x232d860: ldr      x0, [x0, #0x388] ; = 0x0 (u64 @ 0x5599388)
  0x232d864: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d868: adrp     x0, #0x5599000
  0x232d86c: ldr      x0, [x0, #0x2c0] ; = 0x0 (u64 @ 0x55992c0)
  0x232d870: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d874: adrp     x0, #0x5599000
  0x232d878: ldr      x0, [x0, #0xa10] ; = 0x0 (u64 @ 0x5599a10)
  0x232d87c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d880: adrp     x0, #0x5598000
  0x232d884: ldr      x0, [x0, #0x9d0] ; = 0x0 (u64 @ 0x55989d0)
  0x232d888: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d88c: adrp     x0, #0x5599000
  0x232d890: ldr      x0, [x0, #0xa18] ; = 0x0 (u64 @ 0x5599a18)
  0x232d894: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d898: adrp     x0, #0x5599000
  0x232d89c: ldr      x0, [x0, #0x4f0] ; = 0x0 (u64 @ 0x55994f0)
  0x232d8a0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8a4: adrp     x0, #0x5596000
  0x232d8a8: ldr      x0, [x0, #0x600] ; = 0x0 (u64 @ 0x5596600)
  0x232d8ac: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8b0: adrp     x0, #0x5597000
  0x232d8b4: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x232d8b8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8bc: adrp     x0, #0x5596000
  0x232d8c0: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5596850)
  0x232d8c4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8c8: adrp     x0, #0x5596000
  0x232d8cc: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232d8d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8d4: adrp     x0, #0x5596000
  0x232d8d8: ldr      x0, [x0, #0x7a0] ; = 0x0 (u64 @ 0x55967a0)
  0x232d8dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8e0: adrp     x0, #0x5598000
  0x232d8e4: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5598f50)
  0x232d8e8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8ec: adrp     x0, #0x5599000
  0x232d8f0: ldr      x0, [x0, #0xa20] ; = 0x0 (u64 @ 0x5599a20)
  0x232d8f4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d8f8: adrp     x0, #0x5599000
  0x232d8fc: ldr      x0, [x0, #0xa28] ; = 0x0 (u64 @ 0x5599a28)
  0x232d900: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d904: adrp     x0, #0x5599000
  0x232d908: ldr      x0, [x0, #0x988] ; = 0x0 (u64 @ 0x5599988)
  0x232d90c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d910: adrp     x0, #0x5599000
  0x232d914: ldr      x0, [x0, #0xa30] ; = 0x0 (u64 @ 0x5599a30)
  0x232d918: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d91c: adrp     x0, #0x5599000
  0x232d920: ldr      x0, [x0, #0xa38] ; = 0x0 (u64 @ 0x5599a38)
  0x232d924: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d928: adrp     x0, #0x5599000
  0x232d92c: ldr      x0, [x0, #0xa40] ; = 0x0 (u64 @ 0x5599a40)
  0x232d930: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d934: adrp     x0, #0x5599000
  0x232d938: ldr      x0, [x0, #0xa48] ; = 0x0 (u64 @ 0x5599a48)
  0x232d93c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d940: adrp     x0, #0x5599000
  0x232d944: ldr      x0, [x0, #0xa50] ; = 0x0 (u64 @ 0x5599a50)
  0x232d948: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d94c: adrp     x0, #0x5599000
  0x232d950: ldr      x0, [x0, #0xa58] ; = 0x0 (u64 @ 0x5599a58)
  0x232d954: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d958: adrp     x0, #0x5599000
  0x232d95c: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5599a60)
  0x232d960: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d964: adrp     x0, #0x5598000
  0x232d968: ldr      x0, [x0, #0xf80] ; = 0x0 (u64 @ 0x5598f80)
  0x232d96c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d970: adrp     x0, #0x5599000
  0x232d974: ldr      x0, [x0, #0xa68] ; = 0x0 (u64 @ 0x5599a68)
  0x232d978: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d97c: adrp     x0, #0x5599000
  0x232d980: ldr      x0, [x0, #0xa70] ; = 0x0 (u64 @ 0x5599a70)
  0x232d984: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d988: adrp     x0, #0x5599000
  0x232d98c: ldr      x0, [x0, #0xa78] ; = 0x0 (u64 @ 0x5599a78)
  0x232d990: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d994: mov      w8, #1
  0x232d998: strb     w8, [x20, #0xc0b]
  0x232d99c: str      wzr, [sp, #0x6c]
  0x232d9a0: stp      xzr, xzr, [sp, #0x50]
  0x232d9a4: str      xzr, [sp, #0x60]
  0x232d9a8: str      wzr, [sp, #0x4c]
  0x232d9ac: stp      xzr, xzr, [sp, #0x30]
  0x232d9b0: str      xzr, [sp, #0x40]
  0x232d9b4: mov      x26, x19
  0x232d9b8: ldr      x0, [x26, #0x10]!
  0x232d9bc: cbz      x0, #0x23307a0
  0x232d9c0: ldr      w22, [x0, #0x24]
  0x232d9c4: sub      w8, w22, #0xa
  0x232d9c8: cmp      w8, #0x4c
  0x232d9cc: b.hi     #0x232ea24
  0x232d9d0: ldr      w2, [x0, #0x54]
  0x232d9d4: ldr      w9, [x19, #0x30]
  0x232d9d8: adrp     x10, #0x1070000
  0x232d9dc: add      x10, x10, #0x92c
  0x232d9e0: adr      x11, #0x232d9f8
  0x232d9e4: ldrh     w12, [x10, x8, lsl #1]
  0x232d9e8: add      x11, x11, x12, lsl #2
  0x232d9ec: mul      w20, w9, w2
  0x232d9f0: mov      w25, #1
  0x232d9f4: br       x11
  0x232d9f8: mov      x0, x19
  0x232d9fc: bl       #0x2330cf8 ; -> CBuff$$ConvertImmediatelyToDot
  0x232da00: ldr      x8, [x19, #0x20]
  0x232da04: cbz      x8, #0x23307a0
  0x232da08: mov      w1, w0
  0x232da0c: mov      x0, x8
  0x232da10: mov      x2, xzr
  0x232da14: bl       #0x2820eac ; -> CCharacterBattle$$GetBuffListByType
  0x232da18: adrp     x8, #0x5598000
  0x232da1c: ldr      x8, [x8, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x232da20: mov      x20, x0
  0x232da24: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232da28: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232da2c: tbnz     w0, #0, #0x2330510
  0x232da30: cbz      x20, #0x23307a0
  0x232da34: adrp     x8, #0x5598000
  0x232da38: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x232da3c: mov      x0, x20
  0x232da40: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232da44: add      x8, sp, #0x18
  0x232da48: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232da4c: ldur     q0, [sp, #0x18]
  0x232da50: ldr      x8, [sp, #0x28]
  0x232da54: adrp     x22, #0x5598000
  0x232da58: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x232da5c: str      q0, [sp, #0x50]
  0x232da60: str      x8, [sp, #0x60]
  0x232da64: adrp     x23, #0x5599000
  0x232da68: ldr      x23, [x23, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232da6c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232da70: add      x0, sp, #0x50
  0x232da74: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232da78: tbz      w0, #0, #0x232dbdc
  0x232da7c: ldr      x20, [sp, #0x60]
  0x232da80: cbz      x20, #0x232f9f0
  0x232da84: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x59e4010)
  0x232da88: cbz      x8, #0x232f9f4
  0x232da8c: ldr      x9, [x26]
  0x232da90: cbz      x9, #0x232f9ec
  0x232da94: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232da98: ldr      w24, [x8, #0x54]
  0x232da9c: ldr      w25, [x20, #0x30]
  0x232daa0: ldr      w21, [x9, #0x54]
  0x232daa4: ldr      w8, [x0, #0xe0]
  0x232daa8: cbnz     w8, #0x232dab0
  0x232daac: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232dab0: mul      w0, w25, w24
  0x232dab4: mov      w1, w21
  0x232dab8: mov      x2, xzr
  0x232dabc: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x232dac0: mov      w1, w0
  0x232dac4: ldr      w2, [x20, #0x2c]
  0x232dac8: ldr      x3, [x19, #0x18]
  0x232dacc: mov      x0, x20
  0x232dad0: mov      x4, xzr
  0x232dad4: bl       #0x23189b4 ; -> CBattleManager$$ProcessDamageOverTime
  0x232dad8: str      wzr, [x20, #0x2c]
  0x232dadc: b        #0x232da6c
  0x232dae0: cmp      w22, #0x23
  0x232dae4: b.ne     #0x232ea4c
  0x232dae8: adrp     x21, #0x59e4000
  0x232daec: ldrb     w8, [x21, #0xbd3]
  0x232daf0: cbnz     w8, #0x232db08
  0x232daf4: adrp     x0, #0x5598000
  0x232daf8: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232dafc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232db00: mov      w8, #1
  0x232db04: strb     w8, [x21, #0xbd3]
  0x232db08: adrp     x22, #0x5598000
  0x232db0c: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232db10: adrp     x9, #0x5596000
  0x232db14: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232db18: ldr      x9, [x9, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232db1c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232db20: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x232db24: ldr      x20, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232db28: ldr      w9, [x0, #0xe0]
  0x232db2c: cbnz     w9, #0x232db34
  0x232db30: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232db34: mov      x0, x20
  0x232db38: mov      x1, xzr
  0x232db3c: mov      x2, xzr
  0x232db40: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x232db44: tbnz     w0, #0, #0x232f5a4
  0x232db48: ldrb     w8, [x21, #0xbd3]
  0x232db4c: cbnz     w8, #0x232db64
  0x232db50: adrp     x0, #0x5598000
  0x232db54: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232db58: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232db5c: mov      w8, #1
  0x232db60: strb     w8, [x21, #0xbd3]
  0x232db64: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232db68: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232db6c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232db70: cbz      x8, #0x23307a0
  0x232db74: ldr      x0, [x8, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x232db78: mov      x1, xzr
  0x232db7c: bl       #0x2cbf564 ; -> CExtension$$IsTowerModes
  0x232db80: tbz      w0, #0, #0x232f5a4
  0x232db84: ldr      x0, [x26]
  0x232db88: cbnz     x0, #0x232ea4c
  0x232db8c: b        #0x23307a0
  0x232db90: ldr      x8, [x19, #0x20]
  0x232db94: cbz      x8, #0x23307a0
  0x232db98: ldr      w1, [x0, #0x48]
  0x232db9c: mov      x0, x8
  0x232dba0: mov      x2, xzr
  0x232dba4: bl       #0x282d0e0 ; -> CCharacterBattle$$SetCCFreeze
  0x232dba8: ldr      x8, [x26]
  0x232dbac: cbz      x8, #0x23307a0
  0x232dbb0: ldr      w8, [x8, #0x24]
  0x232dbb4: cmp      w8, #0xc
  0x232dbb8: b.ne     #0x2330510
  0x232dbbc: ldr      x0, [x19, #0x20]
  0x232dbc0: cbz      x0, #0x23307a0
  0x232dbc4: mov      w1, #0xe
  0x232dbc8: mov      w2, #1
  0x232dbcc: mov      x3, xzr
  0x232dbd0: mov      w25, #1
  0x232dbd4: bl       #0x27105dc ; -> CCharacter$$PlayAnimation
  0x232dbd8: b        #0x2330514
  0x232dbdc: adrp     x8, #0x5598000
  0x232dbe0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232dbe4: add      x0, sp, #0x50
  0x232dbe8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232dbec: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232dbf0: b        #0x232e848
  0x232dbf4: ldr      x0, [x19, #0x20]
  0x232dbf8: cbz      x0, #0x23307a0
  0x232dbfc: mov      w1, #3
  0x232dc00: mov      x2, xzr
  0x232dc04: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x232dc08: cbnz     x0, #0x232dcdc
  0x232dc0c: ldr      x8, [x26]
  0x232dc10: cbz      x8, #0x232dc44
  0x232dc14: ldr      w1, [x8, #0x4c]
  0x232dc18: cbz      w1, #0x232dc44
  0x232dc1c: ldr      x9, [x19, #0x18]
  0x232dc20: cbz      x9, #0x23307a0
  0x232dc24: ldr      x0, [x9, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x232dc28: cbz      x0, #0x23307a0
  0x232dc2c: ldr      w9, [x19, #0x30]
  0x232dc30: ldr      w8, [x8, #0x54]
  0x232dc34: mov      x3, xzr
  0x232dc38: mul      w2, w8, w9
  0x232dc3c: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232dc40: mov      w20, w0
  0x232dc44: mov      x0, x19
  0x232dc48: mov      w1, w20
  0x232dc4c: bl       #0x2331094 ; -> CBuff$$CheckReverseHealCAP
  0x232dc50: ldr      x8, [x19, #0x20]
  0x232dc54: cbz      x8, #0x23307a0
  0x232dc58: mov      w20, w0
  0x232dc5c: mov      x0, x8
  0x232dc60: mov      x1, xzr
  0x232dc64: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232dc68: ldr      x8, [x19, #0x20]
  0x232dc6c: cbz      x8, #0x23307a0
  0x232dc70: mov      w21, w0
  0x232dc74: mov      x0, x8
  0x232dc78: mov      x1, xzr
  0x232dc7c: bl       #0x2815424 ; -> CCharacterBattle$$get_ShieldHP
  0x232dc80: add      w8, w0, w21
  0x232dc84: cmp      w8, w20
  0x232dc88: b.gt     #0x232ee30
  0x232dc8c: cmp      w22, #0x12
  0x232dc90: b.ne     #0x232ed30
  0x232dc94: ldr      x0, [x19, #0x20]
  0x232dc98: cbz      x0, #0x23307a0
  0x232dc9c: neg      w1, w20
  0x232dca0: mov      w2, wzr
  0x232dca4: mov      w3, wzr
  0x232dca8: mov      w4, wzr
  0x232dcac: mov      x5, xzr
  0x232dcb0: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232dcb4: mov      x0, x19
  0x232dcb8: bl       #0x2331224 ; -> CBuff$$TrySetDieByReverseHeal
  0x232dcbc: cbnz     w20, #0x232ee54
  0x232dcc0: b        #0x2330510
  0x232dcc4: ldr      x0, [x19, #0x20]
  0x232dcc8: cbz      x0, #0x23307a0
  0x232dccc: mov      w1, #3
  0x232dcd0: mov      x2, xzr
  0x232dcd4: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x232dcd8: cbz      x0, #0x232eca8
  0x232dcdc: adrp     x8, #0x5598000
  0x232dce0: ldr      x19, [x19, #0x20]
  0x232dce4: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5598f50)
  0x232dce8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232dcec: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232dcf0: adrp     x8, #0x5598000
  0x232dcf4: ldr      x8, [x8, #0xf80] ; = 0x0 (u64 @ 0x5598f80)
  0x232dcf8: mov      x2, xzr
  0x232dcfc: mov      x20, x0
  0x232dd00: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232dd04: bl       #0x25ef940 ; -> Symbol$$.ctor
  0x232dd08: cbz      x19, #0x23307a0
  0x232dd0c: mov      x0, x19
  0x232dd10: mov      x1, xzr
  0x232dd14: mov      x2, xzr
  0x232dd18: mov      x3, x20
  0x232dd1c: mov      w4, wzr
  0x232dd20: mov      w5, wzr
  0x232dd24: mov      w6, wzr
  0x232dd28: mov      w7, wzr
  0x232dd2c: str      xzr, [sp]
  0x232dd30: bl       #0x2815de0 ; -> CCharacterBattle$$PlayBuffEffect
  0x232dd34: b        #0x2330510
  0x232dd38: ldr      x0, [x19, #0x20]
  0x232dd3c: cbz      x0, #0x23307a0
  0x232dd40: mov      w1, #0x1b
  0x232dd44: mov      x2, xzr
  0x232dd48: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x232dd4c: cbz      x0, #0x2330510
  0x232dd50: mov      x1, x0
  0x232dd54: ldr      x0, [x19, #0x20]
  0x232dd58: cbz      x0, #0x23307a0
  0x232dd5c: mov      w2, #1
  0x232dd60: mov      x3, xzr
  0x232dd64: mov      w25, #1
  0x232dd68: bl       #0x282b2f4 ; -> CCharacterBattle$$RemoveBuff
  0x232dd6c: b        #0x2330514
  0x232dd70: ldr      x0, [x19, #0x20]
  0x232dd74: cbz      x0, #0x23307a0
  0x232dd78: mov      x1, xzr
  0x232dd7c: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232dd80: cbz      x0, #0x23307a0
  0x232dd84: mov      w1, w20
  0x232dd88: mov      x2, xzr
  0x232dd8c: bl       #0x2511c0c ; -> CSkillManager$$ReduceCoolMax
  0x232dd90: b        #0x232e9fc
  0x232dd94: ldr      x0, [x19, #0x20]
  0x232dd98: cbz      x0, #0x23307a0
  0x232dd9c: mov      w1, wzr
  0x232dda0: mov      x2, xzr
  0x232dda4: bl       #0x282b82c ; -> CCharacterBattle$$GetBuffList
  0x232dda8: adrp     x8, #0x5598000
  0x232ddac: ldr      x8, [x8, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x232ddb0: mov      x20, x0
  0x232ddb4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232ddb8: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232ddbc: tbnz     w0, #0, #0x2330510
  0x232ddc0: cbz      x20, #0x23307a0
  0x232ddc4: adrp     x8, #0x5598000
  0x232ddc8: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x232ddcc: mov      x0, x20
  0x232ddd0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232ddd4: add      x8, sp, #0x18
  0x232ddd8: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232dddc: ldur     q0, [sp, #0x18]
  0x232dde0: ldr      x8, [sp, #0x28]
  0x232dde4: adrp     x23, #0x5598000
  0x232dde8: mov      w22, wzr
  0x232ddec: str      q0, [sp, #0x50]
  0x232ddf0: str      x8, [sp, #0x60]
  0x232ddf4: ldr      x23, [x23, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x232ddf8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x232ddfc: add      x0, sp, #0x50
  0x232de00: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232de04: tbz      w0, #0, #0x232ded4
  0x232de08: ldr      x20, [sp, #0x60]
  0x232de0c: cbz      x20, #0x232f9f8
  0x232de10: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x59e4010)
  0x232de14: cbz      x8, #0x232f9fc
  0x232de18: ldrb     w8, [x8, #0x44]
  0x232de1c: cbnz     w8, #0x232ddf8
  0x232de20: mov      x0, xzr
  0x232de24: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232de28: cbz      x0, #0x232fa10
  0x232de2c: mov      x1, xzr
  0x232de30: bl       #0x2505c80 ; -> CBuffManager$$CreateBuffInstance
  0x232de34: mov      x21, x0
  0x232de38: cbz      x0, #0x232fa0c
  0x232de3c: ldr      x1, [x20, #0x10] ; = 0x0 (u64 @ 0x59e4010)
  0x232de40: ldr      x2, [x19, #0x18]
  0x232de44: ldr      w5, [x20, #0x2c]
  0x232de48: mov      w4, #1
  0x232de4c: mov      x0, x21
  0x232de50: mov      x3, x2
  0x232de54: bl       #0x2325630 ; -> CBuff$$Initialize
  0x232de58: tbz      w0, #0, #0x232de88
  0x232de5c: mov      x0, x21
  0x232de60: bl       #0x232d2fc ; -> CBuff$$Run
  0x232de64: ldr      w8, [x20, #0x2c]
  0x232de68: str      w8, [x21, #0x2c]
  0x232de6c: ldr      x0, [x19, #0x18]
  0x232de70: cbz      x0, #0x232fa18
  0x232de74: mov      x1, x21
  0x232de78: mov      x2, xzr
  0x232de7c: bl       #0x282ad40 ; -> CCharacterBattle$$AddBuff
  0x232de80: add      w22, w22, #1
  0x232de84: b        #0x232dea0
  0x232de88: mov      x0, xzr
  0x232de8c: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232de90: cbz      x0, #0x232fa14
  0x232de94: mov      x1, x21
  0x232de98: mov      x2, xzr
  0x232de9c: bl       #0x2505cd4 ; -> CBuffManager$$ReleaseBuff
  0x232dea0: ldr      x0, [x19, #0x20]
  0x232dea4: cbz      x0, #0x232fa08
  0x232dea8: mov      w2, #1
  0x232deac: mov      x1, x20
  0x232deb0: mov      x3, xzr
  0x232deb4: bl       #0x282b2f4 ; -> CCharacterBattle$$RemoveBuff
  0x232deb8: ldr      x8, [x26]
  0x232debc: cbz      x8, #0x232fa04
  0x232dec0: ldr      w8, [x8, #0x54]
  0x232dec4: ldr      w9, [x19, #0x30]
  0x232dec8: mul      w8, w9, w8
  0x232decc: cmp      w22, w8
  0x232ded0: b.lt     #0x232ddf8
  0x232ded4: adrp     x8, #0x5598000
  0x232ded8: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232dedc: add      x0, sp, #0x50
  0x232dee0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232dee4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232dee8: b        #0x2330510
  0x232deec: ldr      x0, [x19, #0x20]
  0x232def0: cbz      x0, #0x23307a0
  0x232def4: mov      w1, wzr
  0x232def8: mov      w2, w20
  0x232defc: mov      x3, xzr
  0x232df00: bl       #0x282c2d8 ; -> CCharacterBattle$$RemoveBuffs
  0x232df04: tbz      w0, #0, #0x2330510
  0x232df08: adrp     x8, #0x5596000
  0x232df0c: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232df10: ldr      x20, [x19, #0x18]
  0x232df14: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232df18: ldr      w8, [x0, #0xe0]
  0x232df1c: cbnz     w8, #0x232df24
  0x232df20: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232df24: mov      x0, x20
  0x232df28: mov      x1, xzr
  0x232df2c: mov      x2, xzr
  0x232df30: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x232df34: tbz      w0, #0, #0x2330510
  0x232df38: ldr      x0, [x19, #0x18]
  0x232df3c: cbz      x0, #0x23307a0
  0x232df40: mov      x1, xzr
  0x232df44: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232df48: cbz      x0, #0x23307a0
  0x232df4c: mov      w25, #1
  0x232df50: strb     w25, [x0, #0xb4]
  0x232df54: b        #0x2330514
  0x232df58: ldr      w8, [x0, #0x50]
  0x232df5c: cmp      w8, #2
  0x232df60: b.ne     #0x232dfc0
  0x232df64: ldr      x8, [x19, #0x20]
  0x232df68: cbz      x8, #0x23307a0
  0x232df6c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x232df70: cbz      x0, #0x23307a0
  0x232df74: mov      x1, xzr
  0x232df78: bl       #0x2908fc8 ; -> CCharacterData$$get_MaxWG
  0x232df7c: ldr      x8, [x26]
  0x232df80: cbz      x8, #0x23307a0
  0x232df84: adrp     x9, #0x5599000
  0x232df88: ldr      x9, [x9, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232df8c: mov      w20, w0
  0x232df90: ldr      w8, [x8, #0x54]
  0x232df94: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232df98: ldr      w9, [x19, #0x30]
  0x232df9c: ldr      w10, [x0, #0xe0]
  0x232dfa0: mul      w21, w9, w8
  0x232dfa4: cbnz     w10, #0x232dfac
  0x232dfa8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232dfac: mov      w0, w20
  0x232dfb0: mov      w1, w21
  0x232dfb4: mov      x2, xzr
  0x232dfb8: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x232dfbc: mov      w20, w0
  0x232dfc0: ldr      x8, [x19, #0x20]
  0x232dfc4: cbz      x8, #0x23307a0
  0x232dfc8: ldr      x0, [x8, #0x378] ; = 0x1b47b (u64 @ 0x5596378)
  0x232dfcc: cbz      x0, #0x23307a0
  0x232dfd0: ldr      w8, [x0, #0x38]
  0x232dfd4: add      w1, w8, w20
  0x232dfd8: b        #0x232e738
  0x232dfdc: ldr      w1, [x0, #0x4c]
  0x232dfe0: cbz      w1, #0x232e0e0
  0x232dfe4: ldr      x8, [x19, #0x20]
  0x232dfe8: cbz      x8, #0x23307a0
  0x232dfec: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x232dff0: cbz      x0, #0x23307a0
  0x232dff4: mov      w2, w20
  0x232dff8: mov      x3, xzr
  0x232dffc: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232e000: adrp     x21, #0x59e4000
  0x232e004: ldrb     w8, [x21, #0xbd3]
  0x232e008: mov      w20, w0
  0x232e00c: cbnz     w8, #0x232e024
  0x232e010: adrp     x0, #0x5598000
  0x232e014: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e018: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e01c: mov      w8, #1
  0x232e020: strb     w8, [x21, #0xbd3]
  0x232e024: adrp     x22, #0x5598000
  0x232e028: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e02c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e030: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55960b8)
  0x232e034: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232e038: cbz      x0, #0x23307a0
  0x232e03c: mov      x1, xzr
  0x232e040: bl       #0x259be3c ; -> CDungeonScene$$get_IsPvp
  0x232e044: tbnz     w0, #0, #0x232e080
  0x232e048: ldrb     w8, [x21, #0xbd3]
  0x232e04c: cbnz     w8, #0x232e064
  0x232e050: adrp     x0, #0x5598000
  0x232e054: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e058: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e05c: mov      w8, #1
  0x232e060: strb     w8, [x21, #0xbd3]
  0x232e064: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e068: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55960b8)
  0x232e06c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232e070: cbz      x0, #0x23307a0
  0x232e074: mov      x1, xzr
  0x232e078: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x232e07c: tbz      w0, #0, #0x232e0e0
  0x232e080: ldrb     w8, [x21, #0xbd3]
  0x232e084: cbnz     w8, #0x232e09c
  0x232e088: adrp     x0, #0x5598000
  0x232e08c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e090: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e094: mov      w8, #1
  0x232e098: strb     w8, [x21, #0xbd3]
  0x232e09c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e0a0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55960b8)
  0x232e0a4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232e0a8: cbz      x8, #0x23307a0
  0x232e0ac: adrp     x9, #0x5599000
  0x232e0b0: ldr      x9, [x9, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232e0b4: ldr      w21, [x8, #0x100]
  0x232e0b8: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232e0bc: ldr      w9, [x0, #0xe0]
  0x232e0c0: cbnz     w9, #0x232e0c8
  0x232e0c4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232e0c8: mov      w8, #0x3e8
  0x232e0cc: sub      w1, w8, w21
  0x232e0d0: mov      w0, w20
  0x232e0d4: mov      x2, xzr
  0x232e0d8: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x232e0dc: mov      w20, w0
  0x232e0e0: ldr      x0, [x19, #0x20]
  0x232e0e4: cbz      x0, #0x23307a0
  0x232e0e8: mov      w2, #1
  0x232e0ec: mov      w1, w20
  0x232e0f0: mov      w3, wzr
  0x232e0f4: mov      w4, wzr
  0x232e0f8: mov      x5, xzr
  0x232e0fc: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232e100: ldr      x8, [x19, #0x20]
  0x232e104: cbz      x8, #0x23307a0
  0x232e108: mov      w20, w0
  0x232e10c: mov      x0, x8
  0x232e110: mov      x1, xzr
  0x232e114: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232e118: cbz      x0, #0x23307a0
  0x232e11c: ldr      w8, [x0, #0xac]
  0x232e120: add      w8, w8, w20
  0x232e124: str      w8, [x0, #0xac]
  0x232e128: ldr      x0, [x19, #0x20]
  0x232e12c: cbz      x0, #0x23307a0
  0x232e130: mov      x1, xzr
  0x232e134: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232e138: ldr      x8, [x19, #0x18]
  0x232e13c: cbz      x8, #0x23307a0
  0x232e140: mov      x21, x0
  0x232e144: mov      x0, x8
  0x232e148: mov      x1, xzr
  0x232e14c: bl       #0x27141ac ; -> CCharacter$$get_UID
  0x232e150: cbz      x21, #0x23307a0
  0x232e154: mov      x1, x0
  0x232e158: mov      x0, x21
  0x232e15c: mov      w2, w20
  0x232e160: mov      x3, xzr
  0x232e164: bl       #0x25936a0 ; -> CTeam$$AddTotalHeal
  0x232e168: adrp     x21, #0x59e4000
  0x232e16c: ldrb     w8, [x21, #0xbd3]
  0x232e170: cbnz     w8, #0x232e188
  0x232e174: adrp     x0, #0x5598000
  0x232e178: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e17c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e180: mov      w8, #1
  0x232e184: strb     w8, [x21, #0xbd3]
  0x232e188: adrp     x8, #0x5598000
  0x232e18c: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e190: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e194: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232e198: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e19c: cbz      x8, #0x23307a0
  0x232e1a0: ldr      x0, [x19, #0x20]
  0x232e1a4: cbz      x0, #0x23307a0
  0x232e1a8: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x5598068)
  0x232e1ac: mov      x1, xzr
  0x232e1b0: bl       #0x5043144 ; -> UnityEngine.Component$$get_transform
  0x232e1b4: cbz      x21, #0x23307a0
  0x232e1b8: mov      x4, x0
  0x232e1bc: mov      w2, #1
  0x232e1c0: mov      x0, x21
  0x232e1c4: mov      w1, w20
  0x232e1c8: mov      w3, wzr
  0x232e1cc: mov      w5, wzr
  0x232e1d0: mov      x6, xzr
  0x232e1d4: bl       #0x29038b8 ; -> CUIHud$$PlayHudTextDamage
  0x232e1d8: ldr      x0, [x19, #0x20]
  0x232e1dc: cbz      x0, #0x23307a0
  0x232e1e0: mov      x1, xzr
  0x232e1e4: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232e1e8: cbz      x0, #0x23307a0
  0x232e1ec: ldr      w8, [x0, #0x60]
  0x232e1f0: cbnz     w8, #0x2330510
  0x232e1f4: adrp     x20, #0x5598000
  0x232e1f8: ldr      x20, [x20, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232e1fc: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x232e200: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232e204: cbz      x0, #0x23307a0
  0x232e208: mov      w1, #0x10
  0x232e20c: mov      x2, xzr
  0x232e210: bl       #0x231c8c0 ; -> CBattleManager$$BattleMissionCheck
  0x232e214: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x232e218: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232e21c: cbz      x0, #0x23307a0
  0x232e220: ldr      x2, [x19, #0x18]
  0x232e224: b        #0x232e470
  0x232e228: ldr      w1, [x0, #0x4c]
  0x232e22c: cbz      w1, #0x232e32c
  0x232e230: ldr      x8, [x19, #0x18]
  0x232e234: cbz      x8, #0x23307a0
  0x232e238: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232e23c: cbz      x0, #0x23307a0
  0x232e240: mov      w2, w20
  0x232e244: mov      x3, xzr
  0x232e248: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232e24c: adrp     x21, #0x59e4000
  0x232e250: ldrb     w8, [x21, #0xbd3]
  0x232e254: mov      w20, w0
  0x232e258: cbnz     w8, #0x232e270
  0x232e25c: adrp     x0, #0x5598000
  0x232e260: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e264: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e268: mov      w8, #1
  0x232e26c: strb     w8, [x21, #0xbd3]
  0x232e270: adrp     x22, #0x5598000
  0x232e274: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e278: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e27c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232e280: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e284: cbz      x0, #0x23307a0
  0x232e288: mov      x1, xzr
  0x232e28c: bl       #0x259be3c ; -> CDungeonScene$$get_IsPvp
  0x232e290: tbnz     w0, #0, #0x232e2cc
  0x232e294: ldrb     w8, [x21, #0xbd3]
  0x232e298: cbnz     w8, #0x232e2b0
  0x232e29c: adrp     x0, #0x5598000
  0x232e2a0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e2a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e2a8: mov      w8, #1
  0x232e2ac: strb     w8, [x21, #0xbd3]
  0x232e2b0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e2b4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232e2b8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e2bc: cbz      x0, #0x23307a0
  0x232e2c0: mov      x1, xzr
  0x232e2c4: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x232e2c8: tbz      w0, #0, #0x232e32c
  0x232e2cc: ldrb     w8, [x21, #0xbd3]
  0x232e2d0: cbnz     w8, #0x232e2e8
  0x232e2d4: adrp     x0, #0x5598000
  0x232e2d8: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e2dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e2e0: mov      w8, #1
  0x232e2e4: strb     w8, [x21, #0xbd3]
  0x232e2e8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232e2ec: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232e2f0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e2f4: cbz      x8, #0x23307a0
  0x232e2f8: adrp     x9, #0x5599000
  0x232e2fc: ldr      x9, [x9, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232e300: ldr      w21, [x8, #0x100]
  0x232e304: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232e308: ldr      w9, [x0, #0xe0]
  0x232e30c: cbnz     w9, #0x232e314
  0x232e310: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232e314: mov      w8, #0x3e8
  0x232e318: sub      w1, w8, w21
  0x232e31c: mov      w0, w20
  0x232e320: mov      x2, xzr
  0x232e324: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x232e328: mov      w20, w0
  0x232e32c: ldr      x0, [x19, #0x20]
  0x232e330: cbz      x0, #0x23307a0
  0x232e334: mov      w2, #1
  0x232e338: mov      w1, w20
  0x232e33c: mov      w3, wzr
  0x232e340: mov      w4, wzr
  0x232e344: mov      x5, xzr
  0x232e348: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232e34c: ldr      x8, [x19, #0x20]
  0x232e350: cbz      x8, #0x23307a0
  0x232e354: mov      w20, w0
  0x232e358: mov      x0, x8
  0x232e35c: mov      x1, xzr
  0x232e360: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232e364: cbz      x0, #0x23307a0
  0x232e368: ldr      w8, [x0, #0xac]
  0x232e36c: add      w8, w8, w20
  0x232e370: str      w8, [x0, #0xac]
  0x232e374: ldr      x0, [x19, #0x20]
  0x232e378: cbz      x0, #0x23307a0
  0x232e37c: mov      x1, xzr
  0x232e380: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232e384: ldr      x8, [x19, #0x18]
  0x232e388: cbz      x8, #0x23307a0
  0x232e38c: mov      x21, x0
  0x232e390: mov      x0, x8
  0x232e394: mov      x1, xzr
  0x232e398: bl       #0x27141ac ; -> CCharacter$$get_UID
  0x232e39c: cbz      x21, #0x23307a0
  0x232e3a0: mov      x1, x0
  0x232e3a4: mov      x0, x21
  0x232e3a8: mov      w2, w20
  0x232e3ac: mov      x3, xzr
  0x232e3b0: bl       #0x25936a0 ; -> CTeam$$AddTotalHeal
  0x232e3b4: adrp     x21, #0x59e4000
  0x232e3b8: ldrb     w8, [x21, #0xbd3]
  0x232e3bc: cbnz     w8, #0x232e3d4
  0x232e3c0: adrp     x0, #0x5598000
  0x232e3c4: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e3c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e3cc: mov      w8, #1
  0x232e3d0: strb     w8, [x21, #0xbd3]
  0x232e3d4: adrp     x8, #0x5598000
  0x232e3d8: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232e3dc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e3e0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232e3e4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e3e8: cbz      x8, #0x23307a0
  0x232e3ec: ldr      x0, [x19, #0x20]
  0x232e3f0: cbz      x0, #0x23307a0
  0x232e3f4: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x5598068)
  0x232e3f8: mov      x1, xzr
  0x232e3fc: bl       #0x5043144 ; -> UnityEngine.Component$$get_transform
  0x232e400: cbz      x21, #0x23307a0
  0x232e404: mov      x4, x0
  0x232e408: mov      w2, #1
  0x232e40c: mov      x0, x21
  0x232e410: mov      w1, w20
  0x232e414: mov      w3, wzr
  0x232e418: mov      w5, wzr
  0x232e41c: mov      x6, xzr
  0x232e420: bl       #0x29038b8 ; -> CUIHud$$PlayHudTextDamage
  0x232e424: ldr      x0, [x19, #0x20]
  0x232e428: cbz      x0, #0x23307a0
  0x232e42c: mov      x1, xzr
  0x232e430: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232e434: cbz      x0, #0x23307a0
  0x232e438: ldr      w8, [x0, #0x60]
  0x232e43c: cbnz     w8, #0x2330510
  0x232e440: adrp     x20, #0x5598000
  0x232e444: ldr      x20, [x20, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232e448: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x232e44c: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232e450: cbz      x0, #0x23307a0
  0x232e454: mov      w1, #0x10
  0x232e458: mov      x2, xzr
  0x232e45c: bl       #0x231c8c0 ; -> CBattleManager$$BattleMissionCheck
  0x232e460: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x232e464: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232e468: cbz      x0, #0x23307a0
  0x232e46c: ldr      x2, [x19, #0x20]
  0x232e470: mov      w1, #0x18
  0x232e474: mov      x3, xzr
  0x232e478: bl       #0x231cadc ; -> CBattleManager$$BattleMissionCheck
  0x232e47c: b        #0x2330510
  0x232e480: adrp     x8, #0x5598000
  0x232e484: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x232e488: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e48c: ldr      w8, [x0, #0xe0]
  0x232e490: cbnz     w8, #0x232e498
  0x232e494: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232e498: mov      x0, xzr
  0x232e49c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x232e4a0: ldr      x8, [x26]
  0x232e4a4: cbz      x8, #0x23307a0
  0x232e4a8: cbz      x0, #0x23307a0
  0x232e4ac: ldr      w9, [x19, #0x30]
  0x232e4b0: ldr      w8, [x8, #0x54]
  0x232e4b4: mov      x2, xzr
  0x232e4b8: mul      w1, w8, w9
  0x232e4bc: bl       #0x262c4c8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x232e4c0: cbz      x0, #0x232eee0
  0x232e4c4: adrp     x8, #0x5599000
  0x232e4c8: ldr      x20, [x0, #0x18] ; = 0x0 (u64 @ 0x5598018)
  0x232e4cc: ldr      x8, [x8, #0x9c8] ; = 0x0 (u64 @ 0x55999c8)
  0x232e4d0: mov      x0, x20
  0x232e4d4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232e4d8: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232e4dc: tbnz     w0, #0, #0x2330510
  0x232e4e0: cbz      x20, #0x23307a0
  0x232e4e4: ldr      w8, [x20, #0x18]
  0x232e4e8: cmp      w8, #1
  0x232e4ec: b.lt     #0x2330510
  0x232e4f0: adrp     x24, #0x5599000
  0x232e4f4: ldr      x24, [x24, #0x9c0] ; = 0x0 (u64 @ 0x55999c0)
  0x232e4f8: mov      x22, xzr
  0x232e4fc: add      x23, x20, #0x20
  0x232e500: mov      w25, #1
  0x232e504: cmp      w22, w8
  0x232e508: b.hs     #0x232fa00
  0x232e50c: ldr      x21, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x5598003)
  0x232e510: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5599000)
  0x232e514: mov      x0, x21
  0x232e518: bl       #0x3422cdc ; -> CExtension$$IsNullOrEmpty<char>
  0x232e51c: tbnz     w0, #0, #0x232e568
  0x232e520: ldr      x0, [x19, #0x20]
  0x232e524: cbz      x0, #0x23307a0
  0x232e528: mov      x1, x21
  0x232e52c: mov      x2, xzr
  0x232e530: bl       #0x282b6b4 ; -> CCharacterBattle$$FindBuff
  0x232e534: cbz      x0, #0x232e568
  0x232e538: mov      x1, x0
  0x232e53c: ldr      x0, [x19, #0x20]
  0x232e540: cbz      x0, #0x23307a0
  0x232e544: mov      w2, #1
  0x232e548: mov      x3, xzr
  0x232e54c: bl       #0x282b2f4 ; -> CCharacterBattle$$RemoveBuff
  0x232e550: ldr      x8, [x19, #0x20]
  0x232e554: cbz      x8, #0x23307a0
  0x232e558: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232e55c: cbz      x0, #0x23307a0
  0x232e560: mov      x1, xzr
  0x232e564: bl       #0x2907980 ; -> CCharacterData$$SetStatDirty
  0x232e568: add      x22, x22, #1
  0x232e56c: str      w22, [sp, #0x6c]
  0x232e570: ldr      w8, [x20, #0x18]
  0x232e574: cmp      w22, w8
  0x232e578: b.lt     #0x232e504
  0x232e57c: b        #0x2330514
  0x232e580: ldr      w1, [x0, #0x4c]
  0x232e584: cbz      w1, #0x232e76c
  0x232e588: ldr      x8, [x19, #0x20]
  0x232e58c: cbnz     x8, #0x232e754
  0x232e590: b        #0x23307a0
  0x232e594: ldr      x20, [x19, #0x20]
  0x232e598: mov      x0, x19
  0x232e59c: bl       #0x23312c0 ; -> CBuff$$GetActionGaugeEnhanceValue
  0x232e5a0: cbz      x20, #0x23307a0
  0x232e5a4: mov      w1, w0
  0x232e5a8: mov      w2, #1
  0x232e5ac: mov      x0, x20
  0x232e5b0: mov      x3, xzr
  0x232e5b4: mov      w21, #1
  0x232e5b8: bl       #0x28151b8 ; -> CCharacterBattle$$AddActionPoint
  0x232e5bc: adrp     x20, #0x59e4000
  0x232e5c0: ldrb     w8, [x20, #0xbdb]
  0x232e5c4: cbnz     w8, #0x232e5d8
  0x232e5c8: adrp     x0, #0x5599000
  0x232e5cc: ldr      x0, [x0, #0x1f8] ; = 0x0 (u64 @ 0x55991f8)
  0x232e5d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232e5d4: strb     w21, [x20, #0xbdb]
  0x232e5d8: adrp     x8, #0x5599000
  0x232e5dc: ldr      x8, [x8, #0x1f8] ; = 0x0 (u64 @ 0x55991f8)
  0x232e5e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232e5e4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232e5e8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232e5ec: cbz      x0, #0x23307a0
  0x232e5f0: ldr      x1, [x19, #0x20]
  0x232e5f4: mov      x2, xzr
  0x232e5f8: bl       #0x29010bc ; -> CHudTurnSequencePanel$$JumpIcon
  0x232e5fc: b        #0x2330510
  0x232e600: ldr      x0, [x19, #0x20]
  0x232e604: cbz      x0, #0x23307a0
  0x232e608: mov      w1, #1
  0x232e60c: b        #0x232e83c
  0x232e610: ldr      x0, [x19, #0x20]
  0x232e614: cbz      x0, #0x23307a0
  0x232e618: mov      x1, xzr
  0x232e61c: bl       #0x2714560 ; -> CCharacter$$get_IsGhost
  0x232e620: tbz      w0, #0, #0x2330510
  0x232e624: ldr      x8, [x26]
  0x232e628: cbz      x8, #0x232e664
  0x232e62c: ldr      w9, [x8, #0x50]
  0x232e630: cmp      w9, #2
  0x232e634: b.ne     #0x232e664
  0x232e638: ldr      x9, [x19, #0x20]
  0x232e63c: cbz      x9, #0x23307a0
  0x232e640: ldr      x0, [x9, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232e644: cbz      x0, #0x23307a0
  0x232e648: ldr      w9, [x19, #0x30]
  0x232e64c: ldr      w8, [x8, #0x54]
  0x232e650: mov      w1, #1
  0x232e654: mov      x3, xzr
  0x232e658: mul      w2, w8, w9
  0x232e65c: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232e660: mov      w20, w0
  0x232e664: ldr      x0, [x19, #0x20]
  0x232e668: cbz      x0, #0x23307a0
  0x232e66c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x232e670: mov      w1, w20
  0x232e674: ldp      x9, x2, [x8, #0x1c8]
  0x232e678: blr      x9
  0x232e67c: b        #0x2330510
  0x232e680: ldr      x8, [x19, #0x20]
  0x232e684: cbz      x8, #0x23307a0
  0x232e688: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x5599378)
  0x232e68c: cbz      x0, #0x23307a0
  0x232e690: mov      x1, xzr
  0x232e694: bl       #0x250b2f8 ; -> CRageManager$$get_CanReduceWG
  0x232e698: tbz      w0, #0, #0x232f5a4
  0x232e69c: ldr      x8, [x26]
  0x232e6a0: cbz      x8, #0x232e70c
  0x232e6a4: ldr      w8, [x8, #0x50]
  0x232e6a8: cmp      w8, #2
  0x232e6ac: b.ne     #0x232e70c
  0x232e6b0: ldr      x8, [x19, #0x20]
  0x232e6b4: cbz      x8, #0x23307a0
  0x232e6b8: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232e6bc: cbz      x0, #0x23307a0
  0x232e6c0: mov      x1, xzr
  0x232e6c4: bl       #0x2908fc8 ; -> CCharacterData$$get_MaxWG
  0x232e6c8: ldr      x8, [x26]
  0x232e6cc: cbz      x8, #0x23307a0
  0x232e6d0: adrp     x9, #0x5599000
  0x232e6d4: ldr      x9, [x9, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232e6d8: mov      w20, w0
  0x232e6dc: ldr      w8, [x8, #0x54]
  0x232e6e0: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232e6e4: ldr      w9, [x19, #0x30]
  0x232e6e8: ldr      w10, [x0, #0xe0]
  0x232e6ec: mul      w21, w9, w8
  0x232e6f0: cbnz     w10, #0x232e6f8
  0x232e6f4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232e6f8: mov      w0, w20
  0x232e6fc: mov      w1, w21
  0x232e700: mov      x2, xzr
  0x232e704: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x232e708: mov      w20, w0
  0x232e70c: ldp      x0, x1, [x19, #0x18]
  0x232e710: mov      w2, w20
  0x232e714: mov      x3, xzr
  0x232e718: bl       #0x2cc2774 ; -> CFormula$$CalcDamageWG
  0x232e71c: ldr      x8, [x19, #0x20]
  0x232e720: cbz      x8, #0x23307a0
  0x232e724: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x5599378)
  0x232e728: cbz      x8, #0x23307a0
  0x232e72c: ldr      w9, [x8, #0x38]
  0x232e730: sub      w1, w9, w0
  0x232e734: mov      x0, x8
  0x232e738: mov      x2, xzr
  0x232e73c: bl       #0x250b244 ; -> CRageManager$$set_WG
  0x232e740: b        #0x2330510
  0x232e744: ldr      w1, [x0, #0x4c]
  0x232e748: cbz      w1, #0x232e76c
  0x232e74c: ldr      x8, [x19, #0x18]
  0x232e750: cbz      x8, #0x23307a0
  0x232e754: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232e758: cbz      x0, #0x23307a0
  0x232e75c: mov      w2, w20
  0x232e760: mov      x3, xzr
  0x232e764: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232e768: mov      w20, w0
  0x232e76c: ldr      x0, [x19, #0x20]
  0x232e770: cbz      x0, #0x23307a0
  0x232e774: mov      w1, w20
  0x232e778: mov      x2, xzr
  0x232e77c: bl       #0x2817e30 ; -> CCharacterBattle$$SetShieldHP
  0x232e780: b        #0x2330510
  0x232e784: ldr      x0, [x19, #0x20]
  0x232e788: cbz      x0, #0x23307a0
  0x232e78c: mov      x1, xzr
  0x232e790: bl       #0x2714540 ; -> CCharacter$$get_IsDying
  0x232e794: tbz      w0, #0, #0x2330510
  0x232e798: ldr      x0, [x19, #0x20]
  0x232e79c: cbz      x0, #0x23307a0
  0x232e7a0: mov      x1, xzr
  0x232e7a4: bl       #0x281ac40 ; -> CCharacterBattle$$SetSealedResurrection
  0x232e7a8: b        #0x2330510
  0x232e7ac: ldr      x0, [x19, #0x20]
  0x232e7b0: cbz      x0, #0x23307a0
  0x232e7b4: mov      w1, #1
  0x232e7b8: mov      w2, w20
  0x232e7bc: mov      x3, xzr
  0x232e7c0: mov      w25, #1
  0x232e7c4: bl       #0x282c2d8 ; -> CCharacterBattle$$RemoveBuffs
  0x232e7c8: tbz      w0, #0, #0x2330514
  0x232e7cc: ldr      x8, [x19, #0x20]
  0x232e7d0: cbz      x8, #0x23307a0
  0x232e7d4: ldr      w8, [x8, #0x21c]
  0x232e7d8: cbnz     w8, #0x232f5e4
  0x232e7dc: adrp     x21, #0x5596000
  0x232e7e0: ldr      x21, [x21, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232e7e4: ldr      x20, [x19, #0x18]
  0x232e7e8: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5596000)
  0x232e7ec: ldr      w8, [x0, #0xe0]
  0x232e7f0: cbnz     w8, #0x232e7f8
  0x232e7f4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232e7f8: mov      x0, x20
  0x232e7fc: mov      x1, xzr
  0x232e800: mov      x2, xzr
  0x232e804: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x232e808: tbz      w0, #0, #0x232f5ac
  0x232e80c: adrp     x8, #0x5598000
  0x232e810: ldr      x8, [x8, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232e814: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232e818: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232e81c: cbz      x0, #0x23307a0
  0x232e820: mov      w1, #0x19
  0x232e824: mov      x2, xzr
  0x232e828: bl       #0x231c8c0 ; -> CBattleManager$$BattleMissionCheck
  0x232e82c: b        #0x232f5e4
  0x232e830: ldr      x0, [x19, #0x20]
  0x232e834: cbz      x0, #0x23307a0
  0x232e838: mov      w1, wzr
  0x232e83c: mov      w2, w20
  0x232e840: mov      x3, xzr
  0x232e844: bl       #0x282cd90 ; -> CCharacterBattle$$ExtendBuff
  0x232e848: ldr      x0, [x19, #0x20]
  0x232e84c: cbz      x0, #0x23307a0
  0x232e850: mov      x1, xzr
  0x232e854: bl       #0x282ce80 ; -> CCharacterBattle$$ClearBuffFinishDuration
  0x232e858: b        #0x2330510
  0x232e85c: ldr      x0, [x19, #0x20]
  0x232e860: cbz      x0, #0x23307a0
  0x232e864: mov      x1, xzr
  0x232e868: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232e86c: cbz      x0, #0x23307a0
  0x232e870: ldr      w8, [x0, #0x70]
  0x232e874: mov      x2, xzr
  0x232e878: add      w1, w8, w20
  0x232e87c: bl       #0x25932cc ; -> CTeam$$set_CP
  0x232e880: b        #0x2330510
  0x232e884: ldr      x0, [x19, #0x20]
  0x232e888: cbz      x0, #0x23307a0
  0x232e88c: mov      x1, xzr
  0x232e890: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232e894: ldr      x8, [x26]
  0x232e898: cbz      x8, #0x23307a0
  0x232e89c: cbz      x0, #0x23307a0
  0x232e8a0: ldr      w1, [x8, #0x5c]
  0x232e8a4: mov      w2, w20
  0x232e8a8: mov      x3, xzr
  0x232e8ac: bl       #0x2511ce0 ; -> CSkillManager$$SetMaxUniqueResource
  0x232e8b0: ldr      x0, [x19, #0x20]
  0x232e8b4: cbz      x0, #0x23307a0
  0x232e8b8: mov      x1, xzr
  0x232e8bc: bl       #0x2814b0c ; -> CCharacterBattle$$get_IsOverNamed
  0x232e8c0: ldr      x8, [x19, #0x20]
  0x232e8c4: cbz      x8, #0x23307a0
  0x232e8c8: tbz      w0, #0, #0x232eed0
  0x232e8cc: mov      x0, x8
  0x232e8d0: mov      x1, xzr
  0x232e8d4: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232e8d8: ldr      x8, [x26]
  0x232e8dc: cbz      x8, #0x23307a0
  0x232e8e0: cbz      x0, #0x23307a0
  0x232e8e4: ldr      w1, [x8, #0x5c]
  0x232e8e8: mov      x2, xzr
  0x232e8ec: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x232e8f0: cbz      x0, #0x2330510
  0x232e8f4: ldr      x8, [x19, #0x20]
  0x232e8f8: cbz      x8, #0x23307a0
  0x232e8fc: ldr      x8, [x8, #0x2d8] ; = 0x0 (u64 @ 0x55982d8)
  0x232e900: cbz      x8, #0x2330510
  0x232e904: ldr      x9, [x26]
  0x232e908: cbz      x9, #0x23307a0
  0x232e90c: ldr      w1, [x9, #0x5c]
  0x232e910: ldp      w2, w3, [x0, #0x3c]
  0x232e914: mov      x0, x8
  0x232e918: mov      x4, xzr
  0x232e91c: bl       #0x28ebea0 ; -> CHudBossGauge$$UpdateUniqueResource
  0x232e920: b        #0x2330510
  0x232e924: ldr      x19, [x19, #0x20]
  0x232e928: cbz      x19, #0x23307a0
  0x232e92c: mov      x0, x19
  0x232e930: mov      x1, xzr
  0x232e934: bl       #0x281622c ; -> CCharacterBattle$$get_AP
  0x232e938: add      w1, w0, w20
  0x232e93c: mov      x0, x19
  0x232e940: mov      x2, xzr
  0x232e944: bl       #0x2816290 ; -> CCharacterBattle$$set_AP
  0x232e948: b        #0x2330510
  0x232e94c: ldr      x0, [x19, #0x20]
  0x232e950: cbz      x0, #0x23307a0
  0x232e954: mov      x1, xzr
  0x232e958: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232e95c: cbz      x0, #0x23307a0
  0x232e960: mov      w1, w20
  0x232e964: mov      x2, xzr
  0x232e968: bl       #0x2511aec ; -> CSkillManager$$AddCoolSecond
  0x232e96c: b        #0x232e9fc
  0x232e970: ldr      x1, [x19, #0x20]
  0x232e974: neg      w2, w2
  0x232e978: b        #0x232ea1c
  0x232e97c: ldr      x8, [x19, #0x20]
  0x232e980: cbz      x8, #0x23307a0
  0x232e984: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232e988: cbz      x0, #0x23307a0
  0x232e98c: mov      w1, #0x26
  0x232e990: mov      x2, xzr
  0x232e994: bl       #0x2913438 ; -> CCharacterData$$IsImmune
  0x232e998: tbnz     w0, #0, #0x232e9bc
  0x232e99c: ldr      x0, [x19, #0x20]
  0x232e9a0: cbz      x0, #0x23307a0
  0x232e9a4: mov      x1, xzr
  0x232e9a8: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232e9ac: cbz      x0, #0x23307a0
  0x232e9b0: mov      w1, w20
  0x232e9b4: mov      x2, xzr
  0x232e9b8: bl       #0x2511aec ; -> CSkillManager$$AddCoolSecond
  0x232e9bc: ldr      x8, [x19, #0x20]
  0x232e9c0: cbz      x8, #0x23307a0
  0x232e9c4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232e9c8: cbz      x0, #0x23307a0
  0x232e9cc: mov      w1, #0x27
  0x232e9d0: mov      x2, xzr
  0x232e9d4: bl       #0x2913438 ; -> CCharacterData$$IsImmune
  0x232e9d8: tbnz     w0, #0, #0x232e9fc
  0x232e9dc: ldr      x0, [x19, #0x20]
  0x232e9e0: cbz      x0, #0x23307a0
  0x232e9e4: mov      x1, xzr
  0x232e9e8: bl       #0x27141f0 ; -> CCharacter$$get_SkillManager
  0x232e9ec: cbz      x0, #0x23307a0
  0x232e9f0: mov      w1, w20
  0x232e9f4: mov      x2, xzr
  0x232e9f8: bl       #0x2511b4c ; -> CSkillManager$$AddCoolUltimate
  0x232e9fc: ldr      x8, [x19, #0x20]
  0x232ea00: cbz      x8, #0x23307a0
  0x232ea04: ldr      x0, [x8, #0x2d8] ; = 0x0 (u64 @ 0x55982d8)
  0x232ea08: cbz      x0, #0x2330510
  0x232ea0c: mov      x1, xzr
  0x232ea10: bl       #0x28ebc34 ; -> CHudBossGauge$$SetSkillButtons
  0x232ea14: b        #0x2330510
  0x232ea18: ldr      x1, [x19, #0x18]
  0x232ea1c: bl       #0x2331674 ; -> CBuff$$AddUniqueResource
  0x232ea20: b        #0x2330510
  0x232ea24: sub      w8, w22, #0x8f
  0x232ea28: cmp      w8, #0xa
  0x232ea2c: mov      w25, #1
  0x232ea30: b.hi     #0x2330514
  0x232ea34: adrp     x9, #0x1070000
  0x232ea38: add      x9, x9, #0x9c6
  0x232ea3c: adr      x10, #0x232ea4c
  0x232ea40: ldrh     w11, [x9, x8, lsl #1]
  0x232ea44: add      x10, x10, x11, lsl #2
  0x232ea48: br       x10
  0x232ea4c: ldr      w8, [x0, #0x24]
  0x232ea50: cmp      w8, #0x22
  0x232ea54: b.eq     #0x232eb28
  0x232ea58: cmp      w8, #0x21
  0x232ea5c: b.eq     #0x232eafc
  0x232ea60: cmp      w8, #0x1f
  0x232ea64: b.ne     #0x232ec34
  0x232ea68: ldr      w8, [x0, #0xd8]
  0x232ea6c: cbz      w8, #0x232ec34
  0x232ea70: mov      x1, xzr
  0x232ea74: bl       #0x25f4428 ; -> CBuffTemplet$$get_IsDebuff
  0x232ea78: ldr      x8, [x19, #0x20]
  0x232ea7c: cbz      x8, #0x23307a0
  0x232ea80: tst      w0, #1
  0x232ea84: mov      w9, #0x1d
  0x232ea88: cinc     w1, w9, ne
  0x232ea8c: mov      x0, x8
  0x232ea90: mov      x2, xzr
  0x232ea94: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x232ea98: cbz      x0, #0x232ec34
  0x232ea9c: ldr      x8, [x19, #0x10]
  0x232eaa0: mov      w9, #1
  0x232eaa4: strb     w9, [x19, #0x34]
  0x232eaa8: cbz      x8, #0x23307a0
  0x232eaac: ldr      x9, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x232eab0: cbz      x9, #0x23307a0
  0x232eab4: ldr      w10, [x8, #0x54]
  0x232eab8: adrp     x8, #0x5599000
  0x232eabc: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x232eac0: ldr      w11, [x19, #0x30]
  0x232eac4: ldr      w9, [x9, #0x54]
  0x232eac8: ldr      w12, [x0, #0x30]
  0x232eacc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ead0: mul      w21, w11, w10
  0x232ead4: mul      w20, w12, w9
  0x232ead8: ldr      w13, [x8, #0xe0]
  0x232eadc: cbnz     w13, #0x232eae8
  0x232eae0: mov      x0, x8
  0x232eae4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232eae8: mov      w0, w21
  0x232eaec: mov      w1, w20
  0x232eaf0: mov      x2, xzr
  0x232eaf4: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x232eaf8: b        #0x232ec30
  0x232eafc: ldr      x8, [x19, #0x20]
  0x232eb00: mov      w9, #1
  0x232eb04: strb     w9, [x19, #0x34]
  0x232eb08: cbz      x8, #0x23307a0
  0x232eb0c: ldr      w9, [x19, #0x30]
  0x232eb10: ldr      w10, [x0, #0x54]
  0x232eb14: mov      x0, x8
  0x232eb18: mov      x2, xzr
  0x232eb1c: mul      w1, w10, w9
  0x232eb20: bl       #0x281611c ; -> CCharacterBattle$$GetLostHPRateValue
  0x232eb24: b        #0x232ec30
  0x232eb28: ldr      x0, [x19, #0x20]
  0x232eb2c: mov      w8, #1
  0x232eb30: strb     w8, [x19, #0x34]
  0x232eb34: cbz      x0, #0x23307a0
  0x232eb38: mov      x1, xzr
  0x232eb3c: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232eb40: ldr      x8, [x19, #0x20]
  0x232eb44: cbz      x8, #0x23307a0
  0x232eb48: mov      w20, w0
  0x232eb4c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232eb50: cbz      x0, #0x23307a0
  0x232eb54: mov      x1, xzr
  0x232eb58: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x232eb5c: ldr      x8, [x19, #0x20]
  0x232eb60: cbz      x8, #0x23307a0
  0x232eb64: mov      w21, w0
  0x232eb68: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232eb6c: cbz      x0, #0x23307a0
  0x232eb70: mov      x1, xzr
  0x232eb74: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x232eb78: adrp     x23, #0x5597000
  0x232eb7c: ldr      x23, [x23, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x232eb80: mov      w22, w0
  0x232eb84: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5597000)
  0x232eb88: ldr      w9, [x8, #0xe0]
  0x232eb8c: cbnz     w9, #0x232eb98
  0x232eb90: mov      x0, x8
  0x232eb94: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232eb98: adrp     x24, #0x59e4000
  0x232eb9c: ldrb     w8, [x24, #0xc1f]
  0x232eba0: sbfiz    x9, x20, #1, #0x20
  0x232eba4: sub      x21, x9, w21, sxtw
  0x232eba8: sxtw     x20, w22
  0x232ebac: cbnz     w8, #0x232ebd0
  0x232ebb0: adrp     x0, #0x5599000
  0x232ebb4: ldr      x0, [x0, #0xa80] ; = 0x0 (u64 @ 0x5599a80)
  0x232ebb8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232ebbc: adrp     x0, #0x5597000
  0x232ebc0: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x232ebc4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232ebc8: mov      w8, #1
  0x232ebcc: strb     w8, [x24, #0xc1f]
  0x232ebd0: tbz      w22, #0x1f, #0x232ebfc
  0x232ebd4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5597000)
  0x232ebd8: ldr      w8, [x0, #0xe0]
  0x232ebdc: cbnz     w8, #0x232ebe4
  0x232ebe0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232ebe4: adrp     x8, #0x5599000
  0x232ebe8: ldr      x8, [x8, #0xa80] ; = 0x0 (u64 @ 0x5599a80)
  0x232ebec: mov      x0, xzr
  0x232ebf0: mov      x1, x20
  0x232ebf4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ebf8: bl       #0x34d2084 ; -> System.Math$$ThrowMinMaxException<long>
  0x232ebfc: ldr      x8, [x19, #0x10]
  0x232ec00: cmp      x21, x20
  0x232ec04: csel     w9, w20, w21, gt
  0x232ec08: cmp      x21, #0
  0x232ec0c: csel     w1, wzr, w9, lt
  0x232ec10: cbz      x8, #0x23307a0
  0x232ec14: ldr      x0, [x19, #0x20]
  0x232ec18: cbz      x0, #0x23307a0
  0x232ec1c: ldr      w9, [x19, #0x30]
  0x232ec20: ldr      w8, [x8, #0x54]
  0x232ec24: mov      x3, xzr
  0x232ec28: mul      w2, w8, w9
  0x232ec2c: bl       #0x28161a0 ; -> CCharacterBattle$$GetLostHPRateValue
  0x232ec30: str      w0, [x19, #0x38]
  0x232ec34: ldr      x8, [x26]
  0x232ec38: cbz      x8, #0x2330510
  0x232ec3c: ldr      w8, [x8, #0x4c]
  0x232ec40: cbz      w8, #0x2330510
  0x232ec44: cmp      w8, #1
  0x232ec48: b.ne     #0x232eeb0
  0x232ec4c: ldr      x0, [x19, #0x20]
  0x232ec50: cbz      x0, #0x23307a0
  0x232ec54: mov      x1, xzr
  0x232ec58: bl       #0x28160e4 ; -> CCharacterBattle$$get_IsFullHP
  0x232ec5c: ldr      x8, [x19, #0x20]
  0x232ec60: cbz      x8, #0x23307a0
  0x232ec64: tbz      w0, #0, #0x232ef50
  0x232ec68: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x232ec6c: cbz      x0, #0x23307a0
  0x232ec70: mov      x1, x19
  0x232ec74: mov      x2, xzr
  0x232ec78: bl       #0x29109f8 ; -> CCharacterData$$AddStatBuff
  0x232ec7c: ldr      x19, [x19, #0x20]
  0x232ec80: cbz      x19, #0x23307a0
  0x232ec84: ldr      x0, [x19, #0x28]
  0x232ec88: cbz      x0, #0x23307a0
  0x232ec8c: mov      x1, xzr
  0x232ec90: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x232ec94: mov      w1, w0
  0x232ec98: mov      w4, #1
  0x232ec9c: mov      w25, #1
  0x232eca0: mov      x0, x19
  0x232eca4: b        #0x232f4e4
  0x232eca8: ldr      x8, [x26]
  0x232ecac: cbz      x8, #0x232ece0
  0x232ecb0: ldr      w1, [x8, #0x4c]
  0x232ecb4: cbz      w1, #0x232ece0
  0x232ecb8: ldr      x9, [x19, #0x20]
  0x232ecbc: cbz      x9, #0x23307a0
  0x232ecc0: ldr      x0, [x9, #0x28] ; = 0x6ffffffff (u64 @ 0x1070028)
  0x232ecc4: cbz      x0, #0x23307a0
  0x232ecc8: ldr      w9, [x19, #0x30]
  0x232eccc: ldr      w8, [x8, #0x54]
  0x232ecd0: mov      x3, xzr
  0x232ecd4: mul      w2, w8, w9
  0x232ecd8: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x232ecdc: mov      w20, w0
  0x232ece0: mov      x0, x19
  0x232ece4: mov      w1, w20
  0x232ece8: bl       #0x2331094 ; -> CBuff$$CheckReverseHealCAP
  0x232ecec: ldr      x8, [x19, #0x20]
  0x232ecf0: cbz      x8, #0x23307a0
  0x232ecf4: mov      w20, w0
  0x232ecf8: mov      x0, x8
  0x232ecfc: mov      x1, xzr
  0x232ed00: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232ed04: ldr      x8, [x19, #0x20]
  0x232ed08: cbz      x8, #0x23307a0
  0x232ed0c: mov      w21, w0
  0x232ed10: mov      x0, x8
  0x232ed14: mov      x1, xzr
  0x232ed18: bl       #0x2815424 ; -> CCharacterBattle$$get_ShieldHP
  0x232ed1c: add      w8, w0, w21
  0x232ed20: cmp      w8, w20
  0x232ed24: b.gt     #0x232ee30
  0x232ed28: cmp      w22, #0x13
  0x232ed2c: b.eq     #0x232dc94
  0x232ed30: adrp     x21, #0x59e4000
  0x232ed34: ldrb     w8, [x21, #0xbd3]
  0x232ed38: cbnz     w8, #0x232ed50
  0x232ed3c: adrp     x0, #0x5598000
  0x232ed40: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232ed44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232ed48: mov      w8, #1
  0x232ed4c: strb     w8, [x21, #0xbd3]
  0x232ed50: adrp     x22, #0x5598000
  0x232ed54: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232ed58: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232ed5c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232ed60: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ed64: cbz      x0, #0x23307a0
  0x232ed68: mov      x1, xzr
  0x232ed6c: bl       #0x259be84 ; -> CDungeonScene$$get_IsGuildDungeon
  0x232ed70: tbnz     w0, #0, #0x232ee1c
  0x232ed74: ldrb     w8, [x21, #0xbd3]
  0x232ed78: cbnz     w8, #0x232ed90
  0x232ed7c: adrp     x0, #0x5598000
  0x232ed80: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232ed84: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232ed88: mov      w8, #1
  0x232ed8c: strb     w8, [x21, #0xbd3]
  0x232ed90: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232ed94: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232ed98: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ed9c: cbz      x0, #0x23307a0
  0x232eda0: mov      x1, xzr
  0x232eda4: bl       #0x259bef4 ; -> CDungeonScene$$get_IsEventChallenge
  0x232eda8: tbnz     w0, #0, #0x232ee1c
  0x232edac: ldrb     w8, [x21, #0xbd3]
  0x232edb0: cbnz     w8, #0x232edc8
  0x232edb4: adrp     x0, #0x5598000
  0x232edb8: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232edbc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232edc0: mov      w8, #1
  0x232edc4: strb     w8, [x21, #0xbd3]
  0x232edc8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232edcc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232edd0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232edd4: cbz      x0, #0x23307a0
  0x232edd8: mov      x1, xzr
  0x232eddc: bl       #0x259bed0 ; -> CDungeonScene$$get_IsWorldBoss
  0x232ede0: tbnz     w0, #0, #0x232ee1c
  0x232ede4: ldrb     w8, [x21, #0xbd3]
  0x232ede8: cbnz     w8, #0x232ee00
  0x232edec: adrp     x0, #0x5598000
  0x232edf0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x232edf4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232edf8: mov      w8, #1
  0x232edfc: strb     w8, [x21, #0xbd3]
  0x232ee00: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232ee04: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232ee08: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ee0c: cbz      x0, #0x23307a0
  0x232ee10: mov      x1, xzr
  0x232ee14: bl       #0x259bfac ; -> CDungeonScene$$get_IsMonadGateSingularity
  0x232ee18: tbz      w0, #0, #0x232efe4
  0x232ee1c: ldr      x0, [x19, #0x20]
  0x232ee20: cbz      x0, #0x23307a0
  0x232ee24: mov      x1, xzr
  0x232ee28: bl       #0x2814ac4 ; -> CCharacterBattle$$get_IsBoss
  0x232ee2c: tbz      w0, #0, #0x232efe4
  0x232ee30: ldr      x0, [x19, #0x20]
  0x232ee34: cbz      x0, #0x23307a0
  0x232ee38: neg      w1, w20
  0x232ee3c: mov      w2, wzr
  0x232ee40: mov      w3, wzr
  0x232ee44: mov      w4, wzr
  0x232ee48: mov      x5, xzr
  0x232ee4c: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232ee50: cbz      w20, #0x2330510
  0x232ee54: adrp     x22, #0x59e4000
  0x232ee58: ldrb     w8, [x22, #0xc1e]
  0x232ee5c: ldp      x21, x19, [x19, #0x18]
  0x232ee60: cbnz     w8, #0x232ee78
  0x232ee64: adrp     x0, #0x5597000
  0x232ee68: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x232ee6c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232ee70: mov      w8, #1
  0x232ee74: strb     w8, [x22, #0xc1e]
  0x232ee78: adrp     x8, #0x5597000
  0x232ee7c: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x232ee80: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x232ee84: ldr      w8, [x0, #0xe0]
  0x232ee88: cbnz     w8, #0x232ee90
  0x232ee8c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232ee90: cmp      w20, #0
  0x232ee94: cneg     w2, w20, mi
  0x232ee98: mov      x0, x21
  0x232ee9c: mov      x1, x19
  0x232eea0: mov      w3, wzr
  0x232eea4: mov      x4, xzr
  0x232eea8: bl       #0x2317ea8 ; -> CBattleManager$$ShowDamage
  0x232eeac: b        #0x2330510
  0x232eeb0: ldr      x8, [x19, #0x20]
  0x232eeb4: cbz      x8, #0x23307a0
  0x232eeb8: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5597028)
  0x232eebc: cbz      x0, #0x23307a0
  0x232eec0: mov      x1, x19
  0x232eec4: mov      x2, xzr
  0x232eec8: bl       #0x29109f8 ; -> CCharacterData$$AddStatBuff
  0x232eecc: b        #0x2330510
  0x232eed0: mov      x0, x8
  0x232eed4: mov      x1, xzr
  0x232eed8: bl       #0x282ace8 ; -> CCharacterBattle$$UpdateBuffIcon
  0x232eedc: b        #0x2330510
  0x232eee0: ldr      x8, [x26]
  0x232eee4: cbz      x8, #0x23307a0
  0x232eee8: ldr      w8, [x8, #0x54]
  0x232eeec: ldr      w9, [x19, #0x30]
  0x232eef0: add      x0, sp, #0x6c
  0x232eef4: mov      x1, xzr
  0x232eef8: mul      w8, w9, w8
  0x232eefc: str      w8, [sp, #0x6c]
  0x232ef00: bl       #0x4910684 ; -> System.Int32$$ToString
  0x232ef04: adrp     x8, #0x5599000
  0x232ef08: ldr      x8, [x8, #0xa40] ; = 0x0 (u64 @ 0x5599a40)
  0x232ef0c: mov      x1, x0
  0x232ef10: mov      x2, xzr
  0x232ef14: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ef18: mov      x0, x8
  0x232ef1c: bl       #0x477b31c ; -> System.String$$Concat
  0x232ef20: adrp     x8, #0x5598000
  0x232ef24: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232ef28: mov      x19, x0
  0x232ef2c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232ef30: ldr      w9, [x8, #0xe0]
  0x232ef34: cbnz     w9, #0x232ef40
  0x232ef38: mov      x0, x8
  0x232ef3c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232ef40: mov      x0, x19
  0x232ef44: mov      x1, xzr
  0x232ef48: bl       #0x2cb6058 ; -> CDebug$$LogWarning
  0x232ef4c: b        #0x2330510
  0x232ef50: mov      x0, x8
  0x232ef54: mov      x1, xzr
  0x232ef58: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232ef5c: ldr      x8, [x19, #0x20]
  0x232ef60: cbz      x8, #0x23307a0
  0x232ef64: mov      w20, w0
  0x232ef68: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232ef6c: cbz      x0, #0x23307a0
  0x232ef70: mov      x1, xzr
  0x232ef74: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x232ef78: ldr      x8, [x19, #0x20]
  0x232ef7c: cbz      x8, #0x23307a0
  0x232ef80: mov      w21, w0
  0x232ef84: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232ef88: cbz      x0, #0x23307a0
  0x232ef8c: mov      x1, x19
  0x232ef90: mov      x2, xzr
  0x232ef94: bl       #0x29109f8 ; -> CCharacterData$$AddStatBuff
  0x232ef98: cmp      w21, #1
  0x232ef9c: b.lt     #0x232f4d0
  0x232efa0: ldr      x8, [x19, #0x20]
  0x232efa4: cbz      x8, #0x23307a0
  0x232efa8: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x232efac: cbz      x0, #0x23307a0
  0x232efb0: mov      x1, xzr
  0x232efb4: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x232efb8: ldr      x8, [x19, #0x20]
  0x232efbc: cbz      x8, #0x23307a0
  0x232efc0: mov      w22, w0
  0x232efc4: mov      x0, x8
  0x232efc8: mov      x1, xzr
  0x232efcc: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232efd0: smull    x8, w22, w20
  0x232efd4: mov      w9, w21
  0x232efd8: sdiv     x8, x8, x9
  0x232efdc: sub      w1, w8, w0
  0x232efe0: b        #0x232f4d4
  0x232efe4: ldr      x0, [x19, #0x20]
  0x232efe8: cbz      x0, #0x23307a0
  0x232efec: mov      x1, xzr
  0x232eff0: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232eff4: ldr      x21, [x19, #0x20]
  0x232eff8: cbz      x21, #0x23307a0
  0x232effc: mov      w20, w0
  0x232f000: mov      x0, x21
  0x232f004: mov      x1, xzr
  0x232f008: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x232f00c: ldr      x8, [x19, #0x20]
  0x232f010: cbz      x8, #0x23307a0
  0x232f014: mov      w22, w0
  0x232f018: mov      x0, x8
  0x232f01c: mov      x1, xzr
  0x232f020: bl       #0x2815424 ; -> CCharacterBattle$$get_ShieldHP
  0x232f024: add      w8, w22, w0
  0x232f028: mov      w9, #1
  0x232f02c: sub      w1, w9, w8
  0x232f030: mov      x0, x21
  0x232f034: mov      w2, wzr
  0x232f038: mov      w3, wzr
  0x232f03c: mov      w4, wzr
  0x232f040: mov      x5, xzr
  0x232f044: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232f048: ldr      x0, [x19, #0x20]
  0x232f04c: cbz      x0, #0x23307a0
  0x232f050: mov      x1, xzr
  0x232f054: bl       #0x2815424 ; -> CCharacterBattle$$get_ShieldHP
  0x232f058: add      w8, w20, w0
  0x232f05c: sub      w20, w8, #1
  0x232f060: cbnz     w20, #0x232ee54
  0x232f064: b        #0x2330510
  0x232f068: ldr      x8, [x19, #0x20]
  0x232f06c: cbz      x8, #0x23307a0
  0x232f070: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5598088)
  0x232f074: cbz      x0, #0x23307a0
  0x232f078: mov      w1, #1
  0x232f07c: mov      x2, xzr
  0x232f080: mov      w25, #1
  0x232f084: bl       #0x2576e80 ; -> CCharacterRender$$ToggleObject
  0x232f088: b        #0x2330514
  0x232f08c: adrp     x8, #0x5598000
  0x232f090: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x232f094: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f098: ldr      w8, [x0, #0xe0]
  0x232f09c: cbnz     w8, #0x232f0a4
  0x232f0a0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f0a4: mov      x0, xzr
  0x232f0a8: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x232f0ac: ldr      x8, [x26]
  0x232f0b0: cbz      x8, #0x23307a0
  0x232f0b4: cbz      x0, #0x23307a0
  0x232f0b8: ldr      w9, [x19, #0x30]
  0x232f0bc: ldr      w8, [x8, #0x54]
  0x232f0c0: mov      x2, xzr
  0x232f0c4: mul      w1, w8, w9
  0x232f0c8: bl       #0x262c4c8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x232f0cc: cbz      x0, #0x232f4f8
  0x232f0d0: adrp     x8, #0x5596000
  0x232f0d4: ldr      x8, [x8, #0x600] ; = 0x0 (u64 @ 0x5596600)
  0x232f0d8: mov      x23, x0
  0x232f0dc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f0e0: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232f0e4: adrp     x8, #0x5596000
  0x232f0e8: ldr      x8, [x8, #0x608] ; = 0x0 (u64 @ 0x5596608)
  0x232f0ec: str      x0, [sp, #8]
  0x232f0f0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f0f4: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x232f0f8: adrp     x8, #0x5598000
  0x232f0fc: ldr      x8, [x8, #0x9d0] ; = 0x0 (u64 @ 0x55989d0)
  0x232f100: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f104: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232f108: adrp     x8, #0x5598000
  0x232f10c: ldr      x8, [x8, #0x9d8] ; = 0x0 (u64 @ 0x55989d8)
  0x232f110: mov      x22, x0
  0x232f114: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f118: bl       #0x447b58c ; -> System.Collections.Generic.List<int>$$.ctor
  0x232f11c: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x5597018)
  0x232f120: cbz      x8, #0x23307a0
  0x232f124: adrp     x25, #0x5599000
  0x232f128: adrp     x27, #0x5598000
  0x232f12c: ldr      x25, [x25, #0x9c0] ; = 0x0 (u64 @ 0x55999c0)
  0x232f130: ldr      x27, [x27, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x232f134: mov      x28, xzr
  0x232f138: mov      w29, #0x88
  0x232f13c: str      x23, [sp, #0x10]
  0x232f140: ldr      w9, [x8, #0x18]
  0x232f144: cmp      x28, w9, sxtw
  0x232f148: b.ge     #0x232f634
  0x232f14c: cmp      x28, x9
  0x232f150: b.hs     #0x232fa00
  0x232f154: add      x8, x8, x28, lsl #3
  0x232f158: ldr      x24, [x8, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x232f15c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x232f160: mov      x0, x24
  0x232f164: bl       #0x3422cdc ; -> CExtension$$IsNullOrEmpty<char>
  0x232f168: tbnz     w0, #0, #0x232f374
  0x232f16c: mov      x0, xzr
  0x232f170: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x232f174: cbz      x0, #0x23307a0
  0x232f178: mov      w2, #1
  0x232f17c: mov      x1, x24
  0x232f180: mov      x3, xzr
  0x232f184: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232f188: cbz      x0, #0x232f374
  0x232f18c: ldr      w8, [x0, #0xd8]
  0x232f190: mov      x21, x0
  0x232f194: mov      x20, x25
  0x232f198: cbz      w8, #0x232f288
  0x232f19c: ldr      x8, [x19, #0x18]
  0x232f1a0: cbz      x8, #0x23307a0
  0x232f1a4: ldr      x0, [x8, #0x380] ; = 0x0 (u64 @ 0x5598380)
  0x232f1a8: cbz      x0, #0x23307a0
  0x232f1ac: adrp     x8, #0x5598000
  0x232f1b0: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x232f1b4: mov      x25, x20
  0x232f1b8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f1bc: add      x8, sp, #0x18
  0x232f1c0: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232f1c4: ldur     q0, [sp, #0x18]
  0x232f1c8: ldr      x8, [sp, #0x28]
  0x232f1cc: str      q0, [sp, #0x50]
  0x232f1d0: str      x8, [sp, #0x60]
  0x232f1d4: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5598000)
  0x232f1d8: add      x0, sp, #0x50
  0x232f1dc: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232f1e0: tbz      w0, #0, #0x232f258
  0x232f1e4: ldr      x8, [sp, #0x60]
  0x232f1e8: cmp      x8, #0
  0x232f1ec: csel     w23, w29, wzr, eq
  0x232f1f0: cmp      w23, #0x88
  0x232f1f4: b.eq     #0x232f1d4
  0x232f1f8: cbnz     w23, #0x232f270
  0x232f1fc: cbz      x8, #0x232f384
  0x232f200: ldr      x8, [x8, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x232f204: cmp      x8, #0
  0x232f208: csel     w23, w29, wzr, eq
  0x232f20c: cbz      w23, #0x232f21c
  0x232f210: cmp      w23, #0x88
  0x232f214: b.eq     #0x232f1d4
  0x232f218: b        #0x232f270
  0x232f21c: cbz      x8, #0x232f38c
  0x232f220: ldr      w8, [x8, #0xd8]
  0x232f224: ldr      w9, [x21, #0xd8]
  0x232f228: cmp      w8, w9
  0x232f22c: csel     w23, wzr, w29, eq
  0x232f230: cmp      w23, #0x88
  0x232f234: b.eq     #0x232f1d4
  0x232f238: cbnz     w23, #0x232f270
  0x232f23c: adrp     x8, #0x5598000
  0x232f240: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232f244: add      x0, sp, #0x50
  0x232f248: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f24c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232f250: ldr      x23, [sp, #0x10]
  0x232f254: b        #0x232f374
  0x232f258: adrp     x8, #0x5598000
  0x232f25c: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232f260: add      x0, sp, #0x50
  0x232f264: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f268: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232f26c: b        #0x232f288
  0x232f270: adrp     x8, #0x5598000
  0x232f274: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232f278: add      x0, sp, #0x50
  0x232f27c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f280: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232f284: cbnz     w23, #0x2330514
  0x232f288: ldr      x12, [sp, #8]
  0x232f28c: cbz      x12, #0x23307a0
  0x232f290: adrp     x9, #0x5596000
  0x232f294: ldr      w10, [x12, #0x1c]
  0x232f298: ldr      x8, [x12, #0x10]
  0x232f29c: ldr      x9, [x9, #0x618] ; = 0x0 (u64 @ 0x5596618)
  0x232f2a0: ldr      x23, [sp, #0x10]
  0x232f2a4: add      w10, w10, #1
  0x232f2a8: ldr      x9, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x232f2ac: str      w10, [x12, #0x1c]
  0x232f2b0: cbz      x8, #0x23307a0
  0x232f2b4: ldrsw    x10, [x12, #0x18]
  0x232f2b8: ldr      w11, [x8, #0x18]
  0x232f2bc: mov      x25, x20
  0x232f2c0: cmp      w10, w11
  0x232f2c4: b.hs     #0x232f2e4
  0x232f2c8: add      w9, w10, #1
  0x232f2cc: add      x0, x8, x10, lsl #3
  0x232f2d0: str      w9, [x12, #0x18]
  0x232f2d4: str      x24, [x0, #0x20]!
  0x232f2d8: mov      x1, x24
  0x232f2dc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232f2e0: b        #0x232f2fc
  0x232f2e4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5596020)
  0x232f2e8: mov      x0, x12
  0x232f2ec: mov      x1, x24
  0x232f2f0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55980c0)
  0x232f2f4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5598070)
  0x232f2f8: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x232f2fc: ldr      x8, [x23, #0x20] ; = 0x0 (u64 @ 0x5597020)
  0x232f300: cbz      x8, #0x23307a0
  0x232f304: ldr      w9, [x8, #0x18]
  0x232f308: cmp      x28, x9
  0x232f30c: b.hs     #0x232fa00
  0x232f310: cbz      x22, #0x23307a0
  0x232f314: add      x8, x8, x28, lsl #2
  0x232f318: adrp     x9, #0x5598000
  0x232f31c: ldr      w10, [x22, #0x1c]
  0x232f320: ldr      w1, [x8, #0x20]
  0x232f324: ldr      x8, [x22, #0x10] ; = 0x0 (u64 @ 0x59e4010)
  0x232f328: ldr      x9, [x9, #0xcd8] ; = 0x0 (u64 @ 0x5598cd8)
  0x232f32c: add      w10, w10, #1
  0x232f330: ldr      x9, [x9] ; = 0x0 (u64 @ 0x5598000)
  0x232f334: str      w10, [x22, #0x1c]
  0x232f338: cbz      x8, #0x23307a0
  0x232f33c: ldrsw    x10, [x22, #0x18]
  0x232f340: ldr      w11, [x8, #0x18]
  0x232f344: cmp      w10, w11
  0x232f348: b.hs     #0x232f360
  0x232f34c: add      w9, w10, #1
  0x232f350: add      x8, x8, x10, lsl #2
  0x232f354: str      w9, [x22, #0x18]
  0x232f358: str      w1, [x8, #0x20]
  0x232f35c: b        #0x232f374
  0x232f360: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x232f364: mov      x0, x22
  0x232f368: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55980c0)
  0x232f36c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5598070)
  0x232f370: bl       #0x447bde0 ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x232f374: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x5597018)
  0x232f378: add      x28, x28, #1
  0x232f37c: cbnz     x8, #0x232f140
  0x232f380: b        #0x23307a0
  0x232f384: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f388: b        #0x232fa28
  0x232f38c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f390: b        #0x232fa28
  0x232f394: b        #0x232f39c
  0x232f398: b        #0x232f39c
  0x232f39c: mov      x21, x0
  0x232f3a0: cmp      w1, #1
  0x232f3a4: b.ne     #0x232fa28
  0x232f3a8: mov      x0, x21
  0x232f3ac: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x232f3b0: ldr      x25, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x232f3b4: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x232f3b8: adrp     x8, #0x5598000
  0x232f3bc: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232f3c0: add      x0, sp, #0x50
  0x232f3c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f3c8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232f3cc: cbz      x25, #0x232f288
  0x232f3d0: mov      x0, x25
  0x232f3d4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x232f3d8: ldr      x8, [x19, #0x20]
  0x232f3dc: cbz      x8, #0x23307a0
  0x232f3e0: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5598088)
  0x232f3e4: cbz      x0, #0x23307a0
  0x232f3e8: mov      w1, #2
  0x232f3ec: mov      x2, xzr
  0x232f3f0: bl       #0x2576e80 ; -> CCharacterRender$$ToggleObject
  0x232f3f4: b        #0x2330510
  0x232f3f8: adrp     x8, #0x5598000
  0x232f3fc: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x232f400: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f404: ldr      w8, [x0, #0xe0]
  0x232f408: cbnz     w8, #0x232f410
  0x232f40c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f410: mov      x0, xzr
  0x232f414: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x232f418: ldr      x8, [x26]
  0x232f41c: cbz      x8, #0x23307a0
  0x232f420: cbz      x0, #0x23307a0
  0x232f424: ldr      w9, [x19, #0x30]
  0x232f428: ldr      w8, [x8, #0x54]
  0x232f42c: mov      x2, xzr
  0x232f430: mul      w1, w8, w9
  0x232f434: bl       #0x262c4c8 ; -> CTempletManager$$GetBuffGroupTemplet
  0x232f438: cbz      x0, #0x232f4f8
  0x232f43c: ldrb     w8, [x0, #0x28]
  0x232f440: mov      x20, x0
  0x232f444: cbz      w8, #0x232f6ac
  0x232f448: adrp     x8, #0x5599000
  0x232f44c: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x59e4018)
  0x232f450: ldr      x8, [x8, #0x9c8] ; = 0x0 (u64 @ 0x55999c8)
  0x232f454: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232f458: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232f45c: tbz      w0, #0, #0x232f70c
  0x232f460: ldr      x8, [x26]
  0x232f464: cbz      x8, #0x23307a0
  0x232f468: ldr      w8, [x8, #0x54]
  0x232f46c: ldr      w9, [x19, #0x30]
  0x232f470: add      x0, sp, #0x4c
  0x232f474: mov      x1, xzr
  0x232f478: mul      w8, w9, w8
  0x232f47c: str      w8, [sp, #0x4c]
  0x232f480: bl       #0x4910684 ; -> System.Int32$$ToString
  0x232f484: adrp     x8, #0x5599000
  0x232f488: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5599a60)
  0x232f48c: mov      x1, x0
  0x232f490: mov      x2, xzr
  0x232f494: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232f498: mov      x0, x8
  0x232f49c: bl       #0x477b31c ; -> System.String$$Concat
  0x232f4a0: adrp     x8, #0x5598000
  0x232f4a4: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232f4a8: mov      x19, x0
  0x232f4ac: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f4b0: ldr      w9, [x8, #0xe0]
  0x232f4b4: cbnz     w9, #0x232f4c0
  0x232f4b8: mov      x0, x8
  0x232f4bc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f4c0: mov      x0, x19
  0x232f4c4: mov      x1, xzr
  0x232f4c8: bl       #0x2cb6058 ; -> CDebug$$LogWarning
  0x232f4cc: b        #0x232f5a4
  0x232f4d0: mov      w1, wzr
  0x232f4d4: ldr      x0, [x19, #0x20]
  0x232f4d8: cbz      x0, #0x23307a0
  0x232f4dc: mov      w4, #1
  0x232f4e0: mov      w25, #1
  0x232f4e4: mov      w2, wzr
  0x232f4e8: mov      w3, wzr
  0x232f4ec: mov      x5, xzr
  0x232f4f0: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x232f4f4: b        #0x2330514
  0x232f4f8: adrp     x8, #0x5596000
  0x232f4fc: ldr      x8, [x8, #0x850] ; = 0x0 (u64 @ 0x5596850)
  0x232f500: mov      w1, #1
  0x232f504: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f508: bl       #0x21b4b6c ; -> ??? 0x21b4b6c
  0x232f50c: ldr      x8, [x26]
  0x232f510: cbz      x8, #0x23307a0
  0x232f514: adrp     x10, #0x5596000
  0x232f518: ldr      w8, [x8, #0x54]
  0x232f51c: ldr      w9, [x19, #0x30]
  0x232f520: ldr      x10, [x10, #0x558] ; = 0x0 (u64 @ 0x5596558)
  0x232f524: mov      x20, x0
  0x232f528: add      x1, sp, #0x18
  0x232f52c: mul      w8, w9, w8
  0x232f530: ldr      x0, [x10] ; = 0x0 (u64 @ 0x5596000)
  0x232f534: str      w8, [sp, #0x18]
  0x232f538: bl       #0x21b4c04 ; -> ??? 0x21b4c04
  0x232f53c: cbz      x20, #0x23307a0
  0x232f540: mov      x19, x0
  0x232f544: cbz      x0, #0x232f55c
  0x232f548: ldr      x8, [x20] ; = 0x0 (u64 @ 0x59e4000)
  0x232f54c: mov      x0, x19
  0x232f550: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5596040)
  0x232f554: bl       #0x21b4c00 ; -> ??? 0x21b4c00
  0x232f558: cbz      x0, #0x232fa1c
  0x232f55c: ldr      w8, [x20, #0x18]
  0x232f560: cbz      w8, #0x232fa00
  0x232f564: mov      x0, x20
  0x232f568: str      x19, [x0, #0x20]!
  0x232f56c: mov      x1, x19
  0x232f570: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232f574: adrp     x8, #0x5598000
  0x232f578: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232f57c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f580: ldr      w8, [x0, #0xe0]
  0x232f584: cbnz     w8, #0x232f58c
  0x232f588: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f58c: adrp     x8, #0x5599000
  0x232f590: ldr      x8, [x8, #0xa58] ; = 0x0 (u64 @ 0x5599a58)
  0x232f594: mov      x1, x20
  0x232f598: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232f59c: mov      x2, xzr
  0x232f5a0: bl       #0x2cb621c ; -> CDebug$$LogErrorFormat
  0x232f5a4: mov      w25, wzr
  0x232f5a8: b        #0x2330514
  0x232f5ac: ldr      x0, [x21] ; = 0x0 (u64 @ 0x59e4000)
  0x232f5b0: ldr      x20, [x19, #0x18]
  0x232f5b4: ldr      w8, [x0, #0xe0]
  0x232f5b8: cbnz     w8, #0x232f5c0
  0x232f5bc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f5c0: mov      x0, x20
  0x232f5c4: mov      x1, xzr
  0x232f5c8: mov      x2, xzr
  0x232f5cc: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x232f5d0: tbz      w0, #0, #0x232f5e4
  0x232f5d4: ldr      x8, [x19, #0x18]
  0x232f5d8: cbz      x8, #0x23307a0
  0x232f5dc: ldr      w8, [x8, #0x21c]
  0x232f5e0: cbz      w8, #0x232e80c
  0x232f5e4: adrp     x8, #0x5596000
  0x232f5e8: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232f5ec: ldr      x20, [x19, #0x18]
  0x232f5f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f5f4: ldr      w8, [x0, #0xe0]
  0x232f5f8: cbnz     w8, #0x232f600
  0x232f5fc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f600: mov      x0, x20
  0x232f604: mov      x1, xzr
  0x232f608: mov      x2, xzr
  0x232f60c: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x232f610: tbz      w0, #0, #0x2330510
  0x232f614: ldr      x0, [x19, #0x18]
  0x232f618: cbz      x0, #0x23307a0
  0x232f61c: mov      x1, xzr
  0x232f620: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232f624: cbz      x0, #0x23307a0
  0x232f628: mov      w25, #1
  0x232f62c: strb     w25, [x0, #0xb5]
  0x232f630: b        #0x2330514
  0x232f634: mov      x0, x22
  0x232f638: mov      x1, xzr
  0x232f63c: bl       #0x4a2b760 ; -> System.Linq.Enumerable$$Sum
  0x232f640: cbz      w0, #0x2330510
  0x232f644: sub      w1, w0, #1
  0x232f648: mov      w0, wzr
  0x232f64c: mov      x2, xzr
  0x232f650: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x232f654: cbz      x22, #0x23307a0
  0x232f658: ldr      w8, [x22, #0x18]
  0x232f65c: cmp      w8, #1
  0x232f660: b.lt     #0x2330510
  0x232f664: adrp     x27, #0x5599000
  0x232f668: ldr      x27, [x27, #0x388] ; = 0x0 (u64 @ 0x5599388)
  0x232f66c: mov      w23, w0
  0x232f670: mov      w21, wzr
  0x232f674: mov      w24, wzr
  0x232f678: mov      w25, #1
  0x232f67c: ldr      x2, [x27] ; = 0x0 (u64 @ 0x5599000)
  0x232f680: mov      x0, x22
  0x232f684: mov      w1, w21
  0x232f688: bl       #0x447baf0 ; -> System.Collections.Generic.List<int>$$get_Item
  0x232f68c: add      w24, w0, w24
  0x232f690: cmp      w23, w24
  0x232f694: b.lt     #0x232f7b8
  0x232f698: ldr      w8, [x22, #0x18]
  0x232f69c: add      w21, w21, #1
  0x232f6a0: cmp      w21, w8
  0x232f6a4: b.lt     #0x232f67c
  0x232f6a8: b        #0x2330514
  0x232f6ac: mov      w1, #0x3e7
  0x232f6b0: mov      w0, wzr
  0x232f6b4: mov      x2, xzr
  0x232f6b8: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x232f6bc: ldr      x8, [x20, #0x20] ; = 0x0 (u64 @ 0x59e4020)
  0x232f6c0: cbz      x8, #0x23307a0
  0x232f6c4: ldr      w9, [x8, #0x18]
  0x232f6c8: cmp      w9, #1
  0x232f6cc: b.lt     #0x2330510
  0x232f6d0: mov      w11, wzr
  0x232f6d4: mov      w10, wzr
  0x232f6d8: mov      w25, #1
  0x232f6dc: cmp      w11, w9
  0x232f6e0: b.hs     #0x232fa00
  0x232f6e4: sxtw     x22, w11
  0x232f6e8: add      x11, x8, x22, lsl #2
  0x232f6ec: ldr      w11, [x11, #0x20]
  0x232f6f0: add      w10, w11, w10
  0x232f6f4: cmp      w0, w10
  0x232f6f8: b.lt     #0x232f820
  0x232f6fc: add      w11, w22, #1
  0x232f700: cmp      w11, w9
  0x232f704: b.lt     #0x232f6dc
  0x232f708: b        #0x2330514
  0x232f70c: ldr      x21, [x20, #0x18] ; = 0x0 (u64 @ 0x59e4018)
  0x232f710: cbz      x21, #0x23307a0
  0x232f714: ldr      w8, [x21, #0x18]
  0x232f718: cmp      w8, #1
  0x232f71c: b.lt     #0x232f888
  0x232f720: adrp     x24, #0x5599000
  0x232f724: ldr      x24, [x24, #0x9c0] ; = 0x0 (u64 @ 0x55999c0)
  0x232f728: mov      x22, xzr
  0x232f72c: mov      w25, wzr
  0x232f730: add      x23, x21, #0x20
  0x232f734: cmp      w22, w8
  0x232f738: b.hs     #0x232fa00
  0x232f73c: ldr      x20, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x5597003)
  0x232f740: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5599000)
  0x232f744: mov      x0, x20
  0x232f748: bl       #0x3422cdc ; -> CExtension$$IsNullOrEmpty<char>
  0x232f74c: tbnz     w0, #0, #0x232f7a0
  0x232f750: mov      x0, xzr
  0x232f754: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x232f758: ldr      x8, [x26]
  0x232f75c: cbz      x8, #0x23307a0
  0x232f760: cbz      x0, #0x23307a0
  0x232f764: ldrb     w2, [x8, #0x20]
  0x232f768: mov      x1, x20
  0x232f76c: mov      x3, xzr
  0x232f770: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232f774: cbz      x0, #0x232f7a0
  0x232f778: mov      x20, x0
  0x232f77c: mov      x0, xzr
  0x232f780: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232f784: cbz      x0, #0x23307a0
  0x232f788: ldp      x2, x3, [x19, #0x18]
  0x232f78c: mov      x1, x20
  0x232f790: mov      w4, wzr
  0x232f794: mov      x5, xzr
  0x232f798: bl       #0x2506adc ; -> CBuffManager$$CreateBuff
  0x232f79c: mov      w25, #1
  0x232f7a0: add      x22, x22, #1
  0x232f7a4: str      w22, [sp, #0x4c]
  0x232f7a8: ldr      w8, [x21, #0x18]
  0x232f7ac: cmp      w22, w8
  0x232f7b0: b.lt     #0x232f734
  0x232f7b4: b        #0x232f88c
  0x232f7b8: mov      x0, xzr
  0x232f7bc: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x232f7c0: mov      x22, x0
  0x232f7c4: ldr      x0, [sp, #8]
  0x232f7c8: cbz      x0, #0x23307a0
  0x232f7cc: adrp     x23, #0x5598000
  0x232f7d0: ldr      x23, [x23, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x232f7d4: mov      w1, w21
  0x232f7d8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x232f7dc: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232f7e0: ldr      x8, [x26]
  0x232f7e4: cbz      x8, #0x23307a0
  0x232f7e8: cbz      x22, #0x23307a0
  0x232f7ec: ldrb     w2, [x8, #0x20]
  0x232f7f0: mov      x1, x0
  0x232f7f4: mov      x0, x22
  0x232f7f8: mov      x3, xzr
  0x232f7fc: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232f800: cbz      x0, #0x232f894
  0x232f804: mov      x22, x0
  0x232f808: mov      x0, xzr
  0x232f80c: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232f810: cbz      x0, #0x23307a0
  0x232f814: ldp      x2, x3, [x19, #0x18]
  0x232f818: mov      x1, x22
  0x232f81c: b        #0x232f878
  0x232f820: mov      x0, xzr
  0x232f824: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x232f828: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x59e4018)
  0x232f82c: cbz      x8, #0x23307a0
  0x232f830: ldr      w9, [x8, #0x18]
  0x232f834: cmp      w22, w9
  0x232f838: b.hs     #0x232fa00
  0x232f83c: ldr      x9, [x26]
  0x232f840: cbz      x9, #0x23307a0
  0x232f844: cbz      x0, #0x23307a0
  0x232f848: add      x8, x8, x22, lsl #3
  0x232f84c: ldr      x1, [x8, #0x20] ; = 0x0 (u64 @ 0x5596020)
  0x232f850: ldrb     w2, [x9, #0x20]
  0x232f854: mov      x3, xzr
  0x232f858: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232f85c: cbz      x0, #0x232f900
  0x232f860: mov      x21, x0
  0x232f864: mov      x0, xzr
  0x232f868: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232f86c: cbz      x0, #0x23307a0
  0x232f870: ldp      x2, x3, [x19, #0x18]
  0x232f874: mov      x1, x21
  0x232f878: mov      w4, wzr
  0x232f87c: mov      x5, xzr
  0x232f880: bl       #0x2506adc ; -> CBuffManager$$CreateBuff
  0x232f884: b        #0x2330510
  0x232f888: mov      w25, wzr
  0x232f88c: and      w25, w25, #1
  0x232f890: b        #0x2330514
  0x232f894: adrp     x8, #0x5596000
  0x232f898: ldr      x8, [x8, #0x850] ; = 0x0 (u64 @ 0x5596850)
  0x232f89c: mov      w1, #2
  0x232f8a0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f8a4: bl       #0x21b4b6c ; -> ??? 0x21b4b6c
  0x232f8a8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x232f8ac: mov      x19, x0
  0x232f8b0: ldr      x0, [sp, #8]
  0x232f8b4: mov      w1, w21
  0x232f8b8: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232f8bc: cbz      x19, #0x23307a0
  0x232f8c0: mov      x20, x0
  0x232f8c4: cbz      x0, #0x232f8dc
  0x232f8c8: ldr      x8, [x19]
  0x232f8cc: mov      x0, x20
  0x232f8d0: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5596040)
  0x232f8d4: bl       #0x21b4c00 ; -> ??? 0x21b4c00
  0x232f8d8: cbz      x0, #0x232fa1c
  0x232f8dc: ldr      w8, [x19, #0x18]
  0x232f8e0: cbz      w8, #0x232fa00
  0x232f8e4: mov      x0, x19
  0x232f8e8: str      x20, [x0, #0x20]!
  0x232f8ec: mov      x1, x20
  0x232f8f0: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232f8f4: ldr      x8, [x26]
  0x232f8f8: cbnz     x8, #0x232f970
  0x232f8fc: b        #0x23307a0
  0x232f900: adrp     x8, #0x5596000
  0x232f904: ldr      x8, [x8, #0x850] ; = 0x0 (u64 @ 0x5596850)
  0x232f908: mov      w1, #2
  0x232f90c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x232f910: bl       #0x21b4b6c ; -> ??? 0x21b4b6c
  0x232f914: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x59e4018)
  0x232f918: cbz      x8, #0x23307a0
  0x232f91c: ldr      w9, [x8, #0x18]
  0x232f920: cmp      w22, w9
  0x232f924: b.hs     #0x232fa00
  0x232f928: mov      x19, x0
  0x232f92c: cbz      x0, #0x23307a0
  0x232f930: add      x8, x8, x22, lsl #3
  0x232f934: ldr      x20, [x8, #0x20] ; = 0x0 (u64 @ 0x5596020)
  0x232f938: cbz      x20, #0x232f950
  0x232f93c: ldr      x8, [x19]
  0x232f940: mov      x0, x20
  0x232f944: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5596040)
  0x232f948: bl       #0x21b4c00 ; -> ??? 0x21b4c00
  0x232f94c: cbz      x0, #0x232fa1c
  0x232f950: ldr      w8, [x19, #0x18]
  0x232f954: cbz      w8, #0x232fa00
  0x232f958: mov      x0, x19
  0x232f95c: str      x20, [x0, #0x20]!
  0x232f960: mov      x1, x20
  0x232f964: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232f968: ldr      x8, [x26]
  0x232f96c: cbz      x8, #0x23307a0
  0x232f970: adrp     x9, #0x5596000
  0x232f974: ldrb     w8, [x8, #0x20]
  0x232f978: ldr      x9, [x9, #0x630] ; = 0x0 (u64 @ 0x5596630)
  0x232f97c: add      x1, sp, #0x18
  0x232f980: strb     w8, [sp, #0x18]
  0x232f984: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x232f988: bl       #0x21b4c04 ; -> ??? 0x21b4c04
  0x232f98c: mov      x20, x0
  0x232f990: cbz      x0, #0x232f9a8
  0x232f994: ldr      x8, [x19]
  0x232f998: mov      x0, x20
  0x232f99c: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5596040)
  0x232f9a0: bl       #0x21b4c00 ; -> ??? 0x21b4c00
  0x232f9a4: cbz      x0, #0x232fa1c
  0x232f9a8: ldr      w8, [x19, #0x18]
  0x232f9ac: cmp      w8, #1
  0x232f9b0: b.ls     #0x232fa00
  0x232f9b4: mov      x0, x19
  0x232f9b8: str      x20, [x0, #0x28]!
  0x232f9bc: mov      x1, x20
  0x232f9c0: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232f9c4: adrp     x8, #0x5598000
  0x232f9c8: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232f9cc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232f9d0: ldr      w8, [x0, #0xe0]
  0x232f9d4: cbnz     w8, #0x232f9dc
  0x232f9d8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232f9dc: adrp     x8, #0x5599000
  0x232f9e0: ldr      x8, [x8, #0xa68] ; = 0x0 (u64 @ 0x5599a68)
  0x232f9e4: mov      x1, x19
  0x232f9e8: b        #0x232f598
  0x232f9ec: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f9f0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f9f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f9f8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232f9fc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa00: bl       #0x21b4d28 ; -> ??? 0x21b4d28
  0x232fa04: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa08: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa0c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa10: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa14: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa18: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232fa1c: bl       #0x21b4d44 ; -> ??? 0x21b4d44
  0x232fa20: mov      x1, xzr
  0x232fa24: bl       #0x21b4bec ; -> ??? 0x21b4bec
  0x232fa28: mov      x25, xzr
  0x232fa2c: b        #0x232fa34
  0x232fa30: mov      x21, x0
  0x232fa34: adrp     x8, #0x5598000
  0x232fa38: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232fa3c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fa40: add      x0, sp, #0x50
  0x232fa44: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232fa48: cbz      x25, #0x23308cc
  0x232fa4c: mov      x0, x25
  0x232fa50: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x232fa54: b        #0x232fa94
  0x232fa58: b        #0x232fa94
  0x232fa5c: b        #0x232fa94
  0x232fa60: b        #0x232fa94
  0x232fa64: b        #0x232fa94
  0x232fa68: b        #0x232fa94
  0x232fa6c: b        #0x232fa94
  0x232fa70: b        #0x232fa94
  0x232fa74: b        #0x232fa94
  0x232fa78: b        #0x232fa94
  0x232fa7c: b        #0x232fa94
  0x232fa80: b        #0x232fa94
  0x232fa84: b        #0x232fa94
  0x232fa88: b        #0x232fa94
  0x232fa8c: b        #0x232fa94
  0x232fa90: b        #0x232fa94
  0x232fa94: mov      x21, x0
  0x232fa98: cmp      w1, #1
  0x232fa9c: b.ne     #0x2330180
  0x232faa0: mov      x0, x21
  0x232faa4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x232faa8: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x232faac: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x232fab0: adrp     x8, #0x5598000
  0x232fab4: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x232fab8: add      x0, sp, #0x50
  0x232fabc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fac0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232fac4: cbnz     x20, #0x233081c
  0x232fac8: adrp     x8, #0x5598000
  0x232facc: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232fad0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fad4: ldr      w8, [x0, #0xe0]
  0x232fad8: cbnz     w8, #0x232fae0
  0x232fadc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fae0: adrp     x8, #0x5599000
  0x232fae4: ldr      x8, [x8, #0xa50] ; = 0x0 (u64 @ 0x5599a50)
  0x232fae8: mov      x1, xzr
  0x232faec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232faf0: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x232faf4: ldr      x0, [x19, #0x20]
  0x232faf8: cbz      x0, #0x23307a0
  0x232fafc: mov      w1, wzr
  0x232fb00: mov      x2, xzr
  0x232fb04: bl       #0x282b82c ; -> CCharacterBattle$$GetBuffList
  0x232fb08: adrp     x25, #0x5598000
  0x232fb0c: ldr      x25, [x25, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x232fb10: mov      x20, x0
  0x232fb14: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x232fb18: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232fb1c: tbz      w0, #0, #0x232fb44
  0x232fb20: adrp     x8, #0x5598000
  0x232fb24: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232fb28: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fb2c: ldr      w8, [x0, #0xe0]
  0x232fb30: cbnz     w8, #0x232fb38
  0x232fb34: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fb38: adrp     x8, #0x5599000
  0x232fb3c: ldr      x8, [x8, #0xa30] ; = 0x0 (u64 @ 0x5599a30)
  0x232fb40: b        #0x232fc1c
  0x232fb44: adrp     x23, #0x5599000
  0x232fb48: ldr      x23, [x23, #0x988] ; = 0x0 (u64 @ 0x5599988)
  0x232fb4c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fb50: ldr      w8, [x0, #0xe0]
  0x232fb54: cbnz     w8, #0x232fb60
  0x232fb58: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fb5c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fb60: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55970b8)
  0x232fb64: ldr      x21, [x8, #0xd8] ; = 0x0 (u64 @ 0x55990d8)
  0x232fb68: cbnz     x21, #0x232fbc4
  0x232fb6c: ldr      w8, [x0, #0xe0]
  0x232fb70: cbnz     w8, #0x232fb7c
  0x232fb74: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fb78: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fb7c: adrp     x9, #0x5599000
  0x232fb80: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55970b8)
  0x232fb84: ldr      x9, [x9, #0x9f0] ; = 0x0 (u64 @ 0x55999f0)
  0x232fb88: ldr      x22, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fb8c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232fb90: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232fb94: adrp     x8, #0x5599000
  0x232fb98: ldr      x8, [x8, #0xa20] ; = 0x0 (u64 @ 0x5599a20)
  0x232fb9c: mov      x1, x22
  0x232fba0: mov      x3, xzr
  0x232fba4: mov      x21, x0
  0x232fba8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fbac: bl       #0x42a7700 ; -> System.Func<object, bool>$$.ctor
  0x232fbb0: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fbb4: mov      x1, x21
  0x232fbb8: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232fbbc: str      x21, [x0, #0xd8]!
  0x232fbc0: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232fbc4: adrp     x8, #0x5599000
  0x232fbc8: ldr      x8, [x8, #0x9e8] ; = 0x0 (u64 @ 0x55999e8)
  0x232fbcc: mov      x0, x20
  0x232fbd0: mov      x1, x21
  0x232fbd4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fbd8: bl       #0x34a335c ; -> System.Linq.Enumerable$$Where<object>
  0x232fbdc: adrp     x24, #0x5599000
  0x232fbe0: ldr      x24, [x24, #0x9e0] ; = 0x0 (u64 @ 0x55999e0)
  0x232fbe4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5599000)
  0x232fbe8: bl       #0x34a0cdc ; -> System.Linq.Enumerable$$ToList<object>
  0x232fbec: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x232fbf0: mov      x20, x0
  0x232fbf4: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x232fbf8: tbz      w0, #0, #0x232fc2c
  0x232fbfc: adrp     x8, #0x5598000
  0x232fc00: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232fc04: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fc08: ldr      w8, [x0, #0xe0]
  0x232fc0c: cbnz     w8, #0x232fc14
  0x232fc10: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fc14: adrp     x8, #0x5599000
  0x232fc18: ldr      x8, [x8, #0xa70] ; = 0x0 (u64 @ 0x5599a70)
  0x232fc1c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fc20: mov      x1, xzr
  0x232fc24: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x232fc28: b        #0x2330510
  0x232fc2c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fc30: ldr      w8, [x0, #0xe0]
  0x232fc34: cbnz     w8, #0x232fc40
  0x232fc38: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fc3c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fc40: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55970b8)
  0x232fc44: ldr      x21, [x8, #0xe0] ; = 0x0 (u64 @ 0x55990e0)
  0x232fc48: cbnz     x21, #0x232fca4
  0x232fc4c: ldr      w8, [x0, #0xe0]
  0x232fc50: cbnz     w8, #0x232fc5c
  0x232fc54: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fc58: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fc5c: adrp     x9, #0x5599000
  0x232fc60: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55970b8)
  0x232fc64: ldr      x9, [x9, #0x9d0] ; = 0x0 (u64 @ 0x55999d0)
  0x232fc68: ldr      x22, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fc6c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x232fc70: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232fc74: adrp     x8, #0x5599000
  0x232fc78: ldr      x8, [x8, #0xa28] ; = 0x0 (u64 @ 0x5599a28)
  0x232fc7c: mov      x1, x22
  0x232fc80: mov      x3, xzr
  0x232fc84: mov      x21, x0
  0x232fc88: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fc8c: bl       #0x3f8c78c ; -> System.Comparison<object>$$.ctor
  0x232fc90: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232fc94: mov      x1, x21
  0x232fc98: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x232fc9c: str      x21, [x0, #0xe0]!
  0x232fca0: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232fca4: cbz      x20, #0x23307a0
  0x232fca8: adrp     x8, #0x5599000
  0x232fcac: ldr      x8, [x8, #0x9f8] ; = 0x0 (u64 @ 0x55999f8)
  0x232fcb0: mov      x0, x20
  0x232fcb4: mov      x1, x21
  0x232fcb8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fcbc: bl       #0x44cae90 ; -> System.Collections.Generic.List<object>$$Sort
  0x232fcc0: ldr      x8, [x26]
  0x232fcc4: cbz      x8, #0x23307a0
  0x232fcc8: adrp     x10, #0x5599000
  0x232fccc: ldr      w8, [x8, #0x54]
  0x232fcd0: ldr      w9, [x19, #0x30]
  0x232fcd4: ldr      x10, [x10, #0x9d8] ; = 0x0 (u64 @ 0x55999d8)
  0x232fcd8: mov      x0, x20
  0x232fcdc: mul      w1, w9, w8
  0x232fce0: ldr      x2, [x10] ; = 0x0 (u64 @ 0x5599000)
  0x232fce4: bl       #0x349b284 ; -> System.Linq.Enumerable$$Take<object>
  0x232fce8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5599000)
  0x232fcec: bl       #0x34a0cdc ; -> System.Linq.Enumerable$$ToList<object>
  0x232fcf0: cbz      x0, #0x23307a0
  0x232fcf4: adrp     x8, #0x5598000
  0x232fcf8: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x232fcfc: str      x0, [sp, #0x10]
  0x232fd00: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fd04: add      x8, sp, #0x18
  0x232fd08: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232fd0c: ldur     q0, [sp, #0x18]
  0x232fd10: ldr      x8, [sp, #0x28]
  0x232fd14: adrp     x28, #0x5599000
  0x232fd18: adrp     x29, #0x5599000
  0x232fd1c: adrp     x20, #0x5598000
  0x232fd20: adrp     x27, #0x5596000
  0x232fd24: ldr      x28, [x28, #0x2c0] ; = 0x0 (u64 @ 0x55992c0)
  0x232fd28: ldr      x29, [x29, #0xa10] ; = 0x0 (u64 @ 0x5599a10)
  0x232fd2c: ldr      x20, [x20, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x232fd30: ldr      x27, [x27, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x232fd34: str      q0, [sp, #0x50]
  0x232fd38: str      x8, [sp, #0x60]
  0x232fd3c: adrp     x21, #0x5598000
  0x232fd40: ldr      x21, [x21, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x232fd44: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x232fd48: add      x0, sp, #0x50
  0x232fd4c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232fd50: tbz      w0, #0, #0x23300bc
  0x232fd54: ldr      x0, [x19, #0x18]
  0x232fd58: cbz      x0, #0x2330168
  0x232fd5c: ldr      x25, [sp, #0x60]
  0x232fd60: mov      x1, xzr
  0x232fd64: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x232fd68: cbz      x0, #0x233016c
  0x232fd6c: adrp     x8, #0x5599000
  0x232fd70: ldr      x22, [x0, #0x10] ; = 0x0 (u64 @ 0x5597010)
  0x232fd74: ldr      x8, [x8, #0x4f0] ; = 0x0 (u64 @ 0x55994f0)
  0x232fd78: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fd7c: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x232fd80: adrp     x8, #0x5599000
  0x232fd84: ldr      x8, [x8, #0xa00] ; = 0x0 (u64 @ 0x5599a00)
  0x232fd88: mov      x21, x0
  0x232fd8c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232fd90: mov      x1, x22
  0x232fd94: bl       #0x44c8cb8 ; -> System.Collections.Generic.List<object>$$.ctor
  0x232fd98: cbz      x21, #0x2330164
  0x232fd9c: ldr      w8, [x21, #0x18]
  0x232fda0: sub      w22, w8, #1
  0x232fda4: cmp      w22, #0
  0x232fda8: b.le     #0x232fe1c
  0x232fdac: mov      w0, wzr
  0x232fdb0: mov      w1, w22
  0x232fdb4: mov      x2, xzr
  0x232fdb8: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x232fdbc: mov      w1, w0
  0x232fdc0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x232fdc4: str      w22, [sp, #0x6c]
  0x232fdc8: str      w1, [sp, #0x4c]
  0x232fdcc: mov      x0, x21
  0x232fdd0: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232fdd4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x232fdd8: mov      x24, x0
  0x232fddc: mov      x0, x21
  0x232fde0: mov      w1, w22
  0x232fde4: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232fde8: ldr      w1, [sp, #0x6c]
  0x232fdec: ldr      x3, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x232fdf0: mov      x23, x0
  0x232fdf4: mov      x0, x21
  0x232fdf8: mov      x2, x24
  0x232fdfc: bl       #0x44c9148 ; -> System.Collections.Generic.List<object>$$set_Item
  0x232fe00: ldr      w1, [sp, #0x4c]
  0x232fe04: ldr      x3, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x232fe08: sub      w22, w22, #1
  0x232fe0c: mov      x0, x21
  0x232fe10: mov      x2, x23
  0x232fe14: bl       #0x44c9148 ; -> System.Collections.Generic.List<object>$$set_Item
  0x232fe18: b        #0x232fda4
  0x232fe1c: adrp     x8, #0x5598000
  0x232fe20: ldr      x8, [x8, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x232fe24: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fe28: add      x8, sp, #0x18
  0x232fe2c: mov      x0, x21
  0x232fe30: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232fe34: ldur     q0, [sp, #0x18]
  0x232fe38: ldr      x8, [sp, #0x28]
  0x232fe3c: str      q0, [sp, #0x30]
  0x232fe40: str      x8, [sp, #0x40]
  0x232fe44: ldr      x1, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x232fe48: add      x0, sp, #0x30
  0x232fe4c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232fe50: tbz      w0, #0, #0x232fed8
  0x232fe54: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5596000)
  0x232fe58: ldr      x21, [sp, #0x40]
  0x232fe5c: ldr      w8, [x0, #0xe0]
  0x232fe60: cbnz     w8, #0x232fe68
  0x232fe64: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232fe68: mov      x0, x21
  0x232fe6c: mov      x1, xzr
  0x232fe70: mov      x2, xzr
  0x232fe74: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x232fe78: tbnz     w0, #0, #0x232fe44
  0x232fe7c: mov      x0, xzr
  0x232fe80: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232fe84: cbz      x0, #0x2330018
  0x232fe88: mov      x1, xzr
  0x232fe8c: bl       #0x2505c80 ; -> CBuffManager$$CreateBuffInstance
  0x232fe90: cbz      x25, #0x2330020
  0x232fe94: mov      x22, x0
  0x232fe98: cbz      x0, #0x2330010
  0x232fe9c: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x232fea0: ldr      w5, [x25, #0x2c]
  0x232fea4: ldr      x2, [x19, #0x18]
  0x232fea8: mov      w4, #1
  0x232feac: mov      x0, x22
  0x232feb0: mov      x3, x21
  0x232feb4: bl       #0x2325630 ; -> CBuff$$Initialize
  0x232feb8: tbnz     w0, #0, #0x232fee4
  0x232febc: mov      x0, xzr
  0x232fec0: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x232fec4: cbz      x0, #0x2330028
  0x232fec8: mov      x1, x22
  0x232fecc: mov      x2, xzr
  0x232fed0: bl       #0x2505cd4 ; -> CBuffManager$$ReleaseBuff
  0x232fed4: b        #0x232fe44
  0x232fed8: mov      x23, xzr
  0x232fedc: mov      w24, wzr
  0x232fee0: b        #0x232ff88
  0x232fee4: mov      x0, x22
  0x232fee8: bl       #0x232d2fc ; -> CBuff$$Run
  0x232feec: ldr      w8, [x25, #0x2c]
  0x232fef0: str      w8, [x22, #0x2c]
  0x232fef4: cbz      x21, #0x2330030
  0x232fef8: mov      x0, x21
  0x232fefc: mov      x1, x22
  0x232ff00: mov      x2, xzr
  0x232ff04: bl       #0x282ad40 ; -> CCharacterBattle$$AddBuff
  0x232ff08: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x232ff0c: cbz      x8, #0x2330038
  0x232ff10: ldr      x22, [x8, #0x18] ; = 0x0 (u64 @ 0x5598018)
  0x232ff14: mov      x0, x21
  0x232ff18: mov      x1, xzr
  0x232ff1c: bl       #0x27141c4 ; -> CCharacter$$get_ID
  0x232ff20: str      w0, [sp, #0x4c]
  0x232ff24: add      x0, sp, #0x4c
  0x232ff28: mov      x1, xzr
  0x232ff2c: bl       #0x4910684 ; -> System.Int32$$ToString
  0x232ff30: adrp     x8, #0x5599000
  0x232ff34: ldr      x8, [x8, #0xa48] ; = 0x0 (u64 @ 0x5599a48)
  0x232ff38: mov      x3, x0
  0x232ff3c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ff40: adrp     x8, #0x5599000
  0x232ff44: ldr      x8, [x8, #0xa38] ; = 0x0 (u64 @ 0x5599a38)
  0x232ff48: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ff4c: mov      x1, x22
  0x232ff50: mov      x4, xzr
  0x232ff54: bl       #0x478842c ; -> System.String$$Concat
  0x232ff58: adrp     x8, #0x5598000
  0x232ff5c: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232ff60: mov      x21, x0
  0x232ff64: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232ff68: ldr      w8, [x0, #0xe0]
  0x232ff6c: cbnz     w8, #0x232ff74
  0x232ff70: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x232ff74: mov      x0, x21
  0x232ff78: mov      x1, xzr
  0x232ff7c: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x232ff80: mov      x23, xzr
  0x232ff84: mov      w24, #1
  0x232ff88: mov      w21, #0x65
  0x232ff8c: adrp     x8, #0x5598000
  0x232ff90: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x232ff94: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232ff98: add      x0, sp, #0x30
  0x232ff9c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232ffa0: cbnz     x23, #0x2330170
  0x232ffa4: cmp      w21, #0x65
  0x232ffa8: b.eq     #0x232ffb0
  0x232ffac: cbnz     w21, #0x2330124
  0x232ffb0: tbnz     w24, #0, #0x232fd3c
  0x232ffb4: cbz      x25, #0x233017c
  0x232ffb8: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x232ffbc: cbz      x8, #0x2330178
  0x232ffc0: ldr      x1, [x8, #0x18] ; = 0x0 (u64 @ 0x5598018)
  0x232ffc4: adrp     x8, #0x5599000
  0x232ffc8: ldr      x8, [x8, #0xa48] ; = 0x0 (u64 @ 0x5599a48)
  0x232ffcc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ffd0: adrp     x8, #0x5599000
  0x232ffd4: ldr      x8, [x8, #0xa78] ; = 0x0 (u64 @ 0x5599a78)
  0x232ffd8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232ffdc: mov      x3, xzr
  0x232ffe0: bl       #0x478810c ; -> System.String$$Concat
  0x232ffe4: adrp     x8, #0x5598000
  0x232ffe8: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x232ffec: mov      x21, x0
  0x232fff0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232fff4: ldr      w8, [x0, #0xe0]
  0x232fff8: cbnz     w8, #0x2330000
  0x232fffc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2330000: mov      x0, x21
  0x2330004: mov      x1, xzr
  0x2330008: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x233000c: b        #0x232fd3c
  0x2330010: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330014: b        #0x2330180
  0x2330018: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x233001c: b        #0x2330180
  0x2330020: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330024: b        #0x2330180
  0x2330028: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x233002c: b        #0x2330180
  0x2330030: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330034: b        #0x2330180
  0x2330038: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x233003c: b        #0x2330180
  0x2330040: b        #0x2330054
  0x2330044: b        #0x2330054
  0x2330048: b        #0x2330054
  0x233004c: b        #0x2330090
  0x2330050: b        #0x2330090
  0x2330054: mov      x22, x1
  0x2330058: mov      x21, x0
  0x233005c: mov      w24, #1
  0x2330060: b        #0x233009c
  0x2330064: b        #0x2330090
  0x2330068: b        #0x2330090
  0x233006c: b        #0x2330090
  0x2330070: b        #0x2330090
  0x2330074: b        #0x2330090
  0x2330078: b        #0x2330090
  0x233007c: b        #0x2330090
  0x2330080: b        #0x2330090
  0x2330084: b        #0x2330090
  0x2330088: b        #0x2330090
  0x233008c: b        #0x2330090
  0x2330090: mov      x22, x1
  0x2330094: mov      x21, x0
  0x2330098: mov      w24, wzr
  0x233009c: cmp      w22, #1
  0x23300a0: b.ne     #0x233013c
  0x23300a4: mov      x0, x21
  0x23300a8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x23300ac: ldr      x23, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x23300b0: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x23300b4: mov      w21, wzr
  0x23300b8: b        #0x232ff8c
  0x23300bc: adrp     x8, #0x5598000
  0x23300c0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23300c4: add      x0, sp, #0x50
  0x23300c8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23300cc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23300d0: adrp     x8, #0x5598000
  0x23300d4: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x23300d8: ldr      x0, [sp, #0x10]
  0x23300dc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23300e0: add      x8, sp, #0x18
  0x23300e4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x23300e8: ldur     q0, [sp, #0x18]
  0x23300ec: ldr      x8, [sp, #0x28]
  0x23300f0: str      q0, [sp, #0x50]
  0x23300f4: str      x8, [sp, #0x60]
  0x23300f8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x23300fc: add      x0, sp, #0x50
  0x2330100: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2330104: tbz      w0, #0, #0x232ded4
  0x2330108: ldr      x0, [x19, #0x20]
  0x233010c: cbz      x0, #0x2330160
  0x2330110: ldr      x1, [sp, #0x60]
  0x2330114: mov      w2, #1
  0x2330118: mov      x3, xzr
  0x233011c: bl       #0x282b2f4 ; -> CCharacterBattle$$RemoveBuff
  0x2330120: b        #0x23300f8
  0x2330124: adrp     x8, #0x5598000
  0x2330128: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x233012c: add      x0, sp, #0x50
  0x2330130: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330134: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330138: b        #0x2330514
  0x233013c: mov      x23, xzr
  0x2330140: adrp     x8, #0x5598000
  0x2330144: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x2330148: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x233014c: add      x0, sp, #0x30
  0x2330150: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330154: cbz      x23, #0x2330868
  0x2330158: mov      x0, x23
  0x233015c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330160: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330164: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330168: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x233016c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330170: mov      x0, x23
  0x2330174: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330178: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x233017c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2330180: mov      x20, xzr
  0x2330184: b        #0x233018c
  0x2330188: mov      x21, x0
  0x233018c: adrp     x8, #0x5598000
  0x2330190: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2330194: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330198: add      x0, sp, #0x50
  0x233019c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23301a0: cbz      x20, #0x23308cc
  0x23301a4: mov      x0, x20
  0x23301a8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23301ac: mov      x22, x1
  0x23301b0: mov      x21, x0
  0x23301b4: b        #0x2330140
  0x23301b8: b        #0x2330860
  0x23301bc: b        #0x2330860
  0x23301c0: b        #0x2330860
  0x23301c4: b        #0x2330860
  0x23301c8: b        #0x2330860
  0x23301cc: b        #0x2330860
  0x23301d0: b        #0x2330860
  0x23301d4: b        #0x2330860
  0x23301d8: b        #0x2330860
  0x23301dc: b        #0x23301e8
  0x23301e0: b        #0x23301e8
  0x23301e4: b        #0x2330860
  0x23301e8: mov      x21, x0
  0x23301ec: cmp      w1, #1
  0x23301f0: b.ne     #0x23303f4
  0x23301f4: mov      x0, x21
  0x23301f8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x23301fc: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x2330200: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2330204: adrp     x8, #0x5598000
  0x2330208: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x233020c: add      x0, sp, #0x50
  0x2330210: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330214: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330218: cbnz     x20, #0x233081c
  0x233021c: ldr      x0, [x19, #0x20]
  0x2330220: cbz      x0, #0x23307a0
  0x2330224: mov      w1, wzr
  0x2330228: mov      x2, xzr
  0x233022c: bl       #0x282b82c ; -> CCharacterBattle$$GetBuffList
  0x2330230: adrp     x8, #0x5599000
  0x2330234: ldr      x8, [x8, #0xa18] ; = 0x0 (u64 @ 0x5599a18)
  0x2330238: mov      x21, x0
  0x233023c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2330240: mov      x0, x8
  0x2330244: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2330248: adrp     x8, #0x5599000
  0x233024c: ldr      x8, [x8, #0xa08] ; = 0x0 (u64 @ 0x5599a08)
  0x2330250: mov      x1, x21
  0x2330254: mov      x20, x0
  0x2330258: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x233025c: bl       #0x44c8cb8 ; -> System.Collections.Generic.List<object>$$.ctor
  0x2330260: cbz      x20, #0x2330510
  0x2330264: ldr      w8, [x20, #0x18]
  0x2330268: cmp      w8, #1
  0x233026c: b.lt     #0x2330510
  0x2330270: adrp     x8, #0x5598000
  0x2330274: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2330278: mov      x0, x20
  0x233027c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330280: add      x8, sp, #0x18
  0x2330284: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2330288: ldur     q0, [sp, #0x18]
  0x233028c: ldr      x8, [sp, #0x28]
  0x2330290: adrp     x23, #0x5598000
  0x2330294: ldr      x23, [x23, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2330298: str      q0, [sp, #0x50]
  0x233029c: str      x8, [sp, #0x60]
  0x23302a0: adrp     x24, #0x5598000
  0x23302a4: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x23302a8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x23302ac: add      x0, sp, #0x50
  0x23302b0: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x23302b4: tbz      w0, #0, #0x232ded4
  0x23302b8: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x23302bc: ldr      x20, [sp, #0x60]
  0x23302c0: ldr      w8, [x0, #0xe0]
  0x23302c4: cbnz     w8, #0x23302cc
  0x23302c8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23302cc: mov      x0, xzr
  0x23302d0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23302d4: cbz      x20, #0x23303d0
  0x23302d8: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x23302dc: cbz      x8, #0x23303d4
  0x23302e0: cbz      x0, #0x23303d8
  0x23302e4: ldr      w1, [x8, #0xd8]
  0x23302e8: mov      x2, xzr
  0x23302ec: bl       #0x262c524 ; -> CTempletManager$$GetBuffToolTipTemplet
  0x23302f0: mov      x22, x0
  0x23302f4: cbz      x0, #0x23302a8
  0x23302f8: ldr      w8, [x22, #0x34]
  0x23302fc: cmp      w8, #1
  0x2330300: b.lt     #0x23302a8
  0x2330304: mov      x0, xzr
  0x2330308: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x233030c: cbz      x0, #0x23303e0
  0x2330310: mov      x1, xzr
  0x2330314: bl       #0x2505c80 ; -> CBuffManager$$CreateBuffInstance
  0x2330318: mov      x21, x0
  0x233031c: ldr      x0, [x20, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x2330320: cbz      x0, #0x23303e8
  0x2330324: ldr      w1, [x22, #0x34]
  0x2330328: mov      x2, xzr
  0x233032c: bl       #0x25f4480 ; -> CBuffTemplet$$CopyForChangeDebuff
  0x2330330: mov      x1, x0
  0x2330334: cbz      x21, #0x23303e4
  0x2330338: mov      x0, x21
  0x233033c: str      x1, [x0, #0x10]!
  0x2330340: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2330344: ldr      x1, [x21, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x2330348: ldr      x2, [x19, #0x18]
  0x233034c: ldr      x3, [x20, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x2330350: mov      w4, #1
  0x2330354: mov      w5, #-1
  0x2330358: mov      x0, x21
  0x233035c: bl       #0x2325630 ; -> CBuff$$Initialize
  0x2330360: tbz      w0, #0, #0x233039c
  0x2330364: ldr      x1, [x19, #0x18]
  0x2330368: mov      x0, x21
  0x233036c: str      x1, [x0, #0x18]!
  0x2330370: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2330374: mov      x0, x21
  0x2330378: bl       #0x232d2fc ; -> CBuff$$Run
  0x233037c: ldr      w8, [x20, #0x2c]
  0x2330380: str      w8, [x21, #0x2c]
  0x2330384: ldr      x0, [x19, #0x20]
  0x2330388: cbz      x0, #0x23303f0
  0x233038c: mov      x1, x21
  0x2330390: mov      x2, xzr
  0x2330394: bl       #0x282ad40 ; -> CCharacterBattle$$AddBuff
  0x2330398: b        #0x23303b4
  0x233039c: mov      x0, xzr
  0x23303a0: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x23303a4: cbz      x0, #0x23303ec
  0x23303a8: mov      x1, x21
  0x23303ac: mov      x2, xzr
  0x23303b0: bl       #0x2505cd4 ; -> CBuffManager$$ReleaseBuff
  0x23303b4: ldr      x0, [x19, #0x20]
  0x23303b8: cbz      x0, #0x23303dc
  0x23303bc: mov      w2, #1
  0x23303c0: mov      x1, x20
  0x23303c4: mov      x3, xzr
  0x23303c8: bl       #0x282b2f4 ; -> CCharacterBattle$$RemoveBuff
  0x23303cc: b        #0x23302a8
  0x23303d0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303d4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303d8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303dc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303e0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303e4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303e8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303ec: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303f0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23303f4: mov      x20, xzr
  0x23303f8: b        #0x2330400
  0x23303fc: mov      x21, x0
  0x2330400: adrp     x8, #0x5598000
  0x2330404: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2330408: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x233040c: add      x0, sp, #0x50
  0x2330410: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330414: cbz      x20, #0x23308cc
  0x2330418: mov      x0, x20
  0x233041c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330420: b        #0x2330480
  0x2330424: b        #0x2330480
  0x2330428: b        #0x2330480
  0x233042c: b        #0x2330480
  0x2330430: b        #0x2330480
  0x2330434: b        #0x2330480
  0x2330438: b        #0x2330480
  0x233043c: b        #0x2330480
  0x2330440: b        #0x2330480
  0x2330444: b        #0x2330480
  0x2330448: b        #0x2330480
  0x233044c: b        #0x2330480
  0x2330450: b        #0x2330480
  0x2330454: b        #0x2330480
  0x2330458: b        #0x2330480
  0x233045c: b        #0x2330480
  0x2330460: b        #0x2330860
  0x2330464: b        #0x2330480
  0x2330468: b        #0x2330860
  0x233046c: b        #0x2330480
  0x2330470: b        #0x2330480
  0x2330474: b        #0x2330480
  0x2330478: b        #0x2330480
  0x233047c: b        #0x2330480
  0x2330480: mov      x21, x0
  0x2330484: cmp      w1, #1
  0x2330488: b.ne     #0x23306dc
  0x233048c: mov      x0, x21
  0x2330490: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2330494: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x2330498: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x233049c: adrp     x8, #0x5598000
  0x23304a0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23304a4: add      x0, sp, #0x50
  0x23304a8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23304ac: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23304b0: cbnz     x20, #0x233081c
  0x23304b4: adrp     x8, #0x5596000
  0x23304b8: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x23304bc: ldr      x20, [x19, #0x18]
  0x23304c0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x23304c4: ldr      w8, [x0, #0xe0]
  0x23304c8: cbnz     w8, #0x23304d0
  0x23304cc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23304d0: mov      x0, x20
  0x23304d4: mov      x1, xzr
  0x23304d8: mov      x2, xzr
  0x23304dc: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x23304e0: tbnz     w0, #0, #0x2330510
  0x23304e4: ldr      x0, [x19, #0x18]
  0x23304e8: cbz      x0, #0x23307a0
  0x23304ec: mov      w1, wzr
  0x23304f0: mov      x2, xzr
  0x23304f4: bl       #0x282b82c ; -> CCharacterBattle$$GetBuffList
  0x23304f8: adrp     x8, #0x5598000
  0x23304fc: ldr      x8, [x8, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x2330500: mov      x20, x0
  0x2330504: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330508: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x233050c: tbz      w0, #0, #0x2330538
  0x2330510: mov      w25, #1
  0x2330514: and      w0, w25, #1
  0x2330518: ldp      x20, x19, [sp, #0xc0]
  0x233051c: ldp      x22, x21, [sp, #0xb0]
  0x2330520: ldp      x24, x23, [sp, #0xa0]
  0x2330524: ldp      x26, x25, [sp, #0x90]
  0x2330528: ldp      x28, x27, [sp, #0x80]
  0x233052c: ldp      x29, x30, [sp, #0x70]
  0x2330530: add      sp, sp, #0xd0
  0x2330534: ret      
  0x2330538: cbz      x20, #0x23307a0
  0x233053c: adrp     x8, #0x5598000
  0x2330540: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2330544: mov      x0, x20
  0x2330548: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x233054c: add      x8, sp, #0x18
  0x2330550: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2330554: ldur     q0, [sp, #0x18]
  0x2330558: ldr      x8, [sp, #0x28]
  0x233055c: adrp     x21, #0x5598000
  0x2330560: adrp     x22, #0x5598000
  0x2330564: adrp     x23, #0x5598000
  0x2330568: ldr      x21, [x21, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x233056c: ldr      x22, [x22, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2330570: ldr      x23, [x23, #0xd68] ; = 0x0 (u64 @ 0x5598d68)
  0x2330574: str      q0, [sp, #0x50]
  0x2330578: str      x8, [sp, #0x60]
  0x233057c: adrp     x24, #0x5598000
  0x2330580: ldr      x24, [x24, #0xbc0] ; = 0x0 (u64 @ 0x5598bc0)
  0x2330584: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2330588: add      x0, sp, #0x50
  0x233058c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2330590: tbz      w0, #0, #0x232ded4
  0x2330594: ldr      x25, [sp, #0x60]
  0x2330598: cbz      x25, #0x2330584
  0x233059c: ldr      w8, [x25, #0x2c]
  0x23305a0: cmp      w8, #1
  0x23305a4: b.lt     #0x2330584
  0x23305a8: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x23305ac: cbz      x8, #0x23306b0
  0x23305b0: ldr      w8, [x8, #0xd8]
  0x23305b4: cmp      w8, #1
  0x23305b8: b.lt     #0x2330584
  0x23305bc: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x23305c0: ldr      w8, [x0, #0xe0]
  0x23305c4: cbnz     w8, #0x23305cc
  0x23305c8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23305cc: mov      x0, xzr
  0x23305d0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23305d4: ldr      x8, [x26]
  0x23305d8: cbz      x8, #0x23306b8
  0x23305dc: cbz      x0, #0x23306b4
  0x23305e0: ldr      w1, [x8, #0x54]
  0x23305e4: mov      x2, xzr
  0x23305e8: bl       #0x262c464 ; -> CTempletManager$$GetToolTipMemberTemplet
  0x23305ec: mov      x20, x0
  0x23305f0: cbz      x0, #0x2330584
  0x23305f4: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x5598018)
  0x23305f8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x23305fc: bl       #0x3422d30 ; -> CExtension$$IsNullOrEmpty<int>
  0x2330600: tbnz     w0, #0, #0x2330584
  0x2330604: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x2330608: cbz      x8, #0x23306bc
  0x233060c: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x5598018)
  0x2330610: cbz      x0, #0x23306c0
  0x2330614: ldr      w1, [x8, #0xd8]
  0x2330618: ldr      x2, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x233061c: bl       #0x447c158 ; -> System.Collections.Generic.List<int>$$Contains
  0x2330620: tbz      w0, #0, #0x2330584
  0x2330624: mov      x0, xzr
  0x2330628: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x233062c: cbz      x0, #0x23306cc
  0x2330630: mov      x1, xzr
  0x2330634: bl       #0x2505c80 ; -> CBuffManager$$CreateBuffInstance
  0x2330638: ldr      x8, [x19, #0x10]
  0x233063c: cbz      x8, #0x23306c8
  0x2330640: mov      x20, x0
  0x2330644: cbz      x0, #0x23306c4
  0x2330648: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x233064c: ldp      x2, x3, [x19, #0x18]
  0x2330650: ldr      w5, [x8, #0x88]
  0x2330654: mov      x0, x20
  0x2330658: mov      w4, wzr
  0x233065c: bl       #0x2325630 ; -> CBuff$$Initialize
  0x2330660: tbz      w0, #0, #0x2330694
  0x2330664: mov      x0, x20
  0x2330668: bl       #0x232d2fc ; -> CBuff$$Run
  0x233066c: ldr      x8, [x26]
  0x2330670: cbz      x8, #0x23306d0
  0x2330674: ldr      w8, [x8, #0x88]
  0x2330678: str      w8, [x20, #0x2c]
  0x233067c: ldr      x0, [x19, #0x20]
  0x2330680: cbz      x0, #0x23306d4
  0x2330684: mov      x1, x20
  0x2330688: mov      x2, xzr
  0x233068c: bl       #0x282ad40 ; -> CCharacterBattle$$AddBuff
  0x2330690: b        #0x2330584
  0x2330694: mov      x0, xzr
  0x2330698: bl       #0x2505afc ; -> CBuffManager$$get_Instance
  0x233069c: cbz      x0, #0x23306d8
  0x23306a0: mov      x1, x20
  0x23306a4: mov      x2, xzr
  0x23306a8: bl       #0x2505cd4 ; -> CBuffManager$$ReleaseBuff
  0x23306ac: b        #0x2330584
  0x23306b0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306b4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306b8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306bc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306c0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306c4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306c8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306cc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306d0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306d4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306d8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23306dc: mov      x20, xzr
  0x23306e0: b        #0x23306e8
  0x23306e4: mov      x21, x0
  0x23306e8: adrp     x8, #0x5598000
  0x23306ec: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23306f0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23306f4: add      x0, sp, #0x50
  0x23306f8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23306fc: cbz      x20, #0x23308cc
  0x2330700: mov      x0, x20
  0x2330704: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330708: b        #0x2330764
  0x233070c: b        #0x2330764
  0x2330710: b        #0x2330764
  0x2330714: b        #0x2330764
  0x2330718: b        #0x2330764
  0x233071c: b        #0x2330764
  0x2330720: b        #0x2330764
  0x2330724: b        #0x2330764
  0x2330728: b        #0x2330764
  0x233072c: b        #0x2330764
  0x2330730: b        #0x2330764
  0x2330734: b        #0x2330764
  0x2330738: b        #0x2330764
  0x233073c: b        #0x2330764
  0x2330740: b        #0x2330764
  0x2330744: b        #0x2330764
  0x2330748: b        #0x2330764
  0x233074c: b        #0x2330764
  0x2330750: b        #0x2330764
  0x2330754: b        #0x2330764
  0x2330758: b        #0x2330764
  0x233075c: b        #0x2330764
  0x2330760: b        #0x2330764
  0x2330764: mov      x21, x0
  0x2330768: cmp      w1, #1
  0x233076c: b.ne     #0x23307a4
  0x2330770: mov      x0, x21
  0x2330774: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2330778: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x233077c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2330780: adrp     x8, #0x5598000
  0x2330784: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2330788: add      x0, sp, #0x50
  0x233078c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330790: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330794: cbnz     x20, #0x233081c
  0x2330798: ldr      x8, [x26]
  0x233079c: cbnz     x8, #0x232d9f8
  0x23307a0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23307a4: mov      x20, xzr
  0x23307a8: b        #0x23307b0
  0x23307ac: mov      x21, x0
  0x23307b0: adrp     x8, #0x5598000
  0x23307b4: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23307b8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23307bc: add      x0, sp, #0x50
  0x23307c0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23307c4: cbz      x20, #0x23308cc
  0x23307c8: mov      x0, x20
  0x23307cc: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23307d0: b        #0x23307e8
  0x23307d4: b        #0x23307e8
  0x23307d8: b        #0x23307e8
  0x23307dc: b        #0x23307e8
  0x23307e0: b        #0x23307e8
  0x23307e4: b        #0x23307e8
  0x23307e8: mov      x21, x0
  0x23307ec: cmp      w1, #1
  0x23307f0: b.ne     #0x2330824
  0x23307f4: mov      x0, x21
  0x23307f8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x23307fc: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x2330800: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2330804: adrp     x8, #0x5598000
  0x2330808: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x233080c: add      x0, sp, #0x50
  0x2330810: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330814: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330818: cbz      x20, #0x232e848
  0x233081c: mov      x0, x20
  0x2330820: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330824: mov      x20, xzr
  0x2330828: b        #0x2330830
  0x233082c: mov      x21, x0
  0x2330830: adrp     x8, #0x5598000
  0x2330834: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2330838: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x233083c: add      x0, sp, #0x50
  0x2330840: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330844: cbz      x20, #0x23308cc
  0x2330848: mov      x0, x20
  0x233084c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2330850: b        #0x2330860
  0x2330854: b        #0x2330860
  0x2330858: b        #0x2330860
  0x233085c: b        #0x2330860
  0x2330860: mov      x22, x1
  0x2330864: mov      x21, x0
  0x2330868: cmp      w22, #1
  0x233086c: b.ne     #0x23308a8
  0x2330870: mov      x0, x21
  0x2330874: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2330878: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5597000)
  0x233087c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2330880: adrp     x8, #0x5598000
  0x2330884: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2330888: add      x0, sp, #0x50
  0x233088c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2330890: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2330894: adrp     x21, #0x5598000
  0x2330898: ldr      x21, [x21, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x233089c: cbz      x22, #0x23300d0
  0x23308a0: mov      x0, x22
  0x23308a4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23308a8: mov      x22, xzr
  0x23308ac: b        #0x23308b4
  0x23308b0: mov      x21, x0
  0x23308b4: adrp     x8, #0x5598000
  0x23308b8: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23308bc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23308c0: add      x0, sp, #0x50
  0x23308c4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23308c8: cbnz     x22, #0x23308d4
  0x23308cc: mov      x0, x21
  0x23308d0: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x23308d4: mov      x0, x22
  0x23308d8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23308dc: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
