; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcAwakeningNodeStats @ 0x290c7ec..0x290cf90 (taille 1956 octets) =====
  0x290c7ec: sub      sp, sp, #0x110
  0x290c7f0: stp      x29, x30, [sp, #0xb0]
  0x290c7f4: stp      x28, x27, [sp, #0xc0]
  0x290c7f8: stp      x26, x25, [sp, #0xd0]
  0x290c7fc: stp      x24, x23, [sp, #0xe0]
  0x290c800: stp      x22, x21, [sp, #0xf0]
  0x290c804: stp      x20, x19, [sp, #0x100]
  0x290c808: adrp     x20, #0x59e7000
  0x290c80c: ldrb     w8, [x20, #0xea8]
  0x290c810: mov      x19, x0
  0x290c814: tbnz     w8, #0, #0x290c964
  0x290c818: adrp     x0, #0x55c5000
  0x290c81c: ldr      x0, [x0, #0x420] ; = 0x0 (u64 @ 0x55c5420)
  0x290c820: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c824: adrp     x0, #0x55c5000
  0x290c828: ldr      x0, [x0, #0x428] ; = 0x0 (u64 @ 0x55c5428)
  0x290c82c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c830: adrp     x0, #0x55c5000
  0x290c834: ldr      x0, [x0, #0x430] ; = 0x0 (u64 @ 0x55c5430)
  0x290c838: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c83c: adrp     x0, #0x55c5000
  0x290c840: ldr      x0, [x0, #0x438] ; = 0x0 (u64 @ 0x55c5438)
  0x290c844: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c848: adrp     x0, #0x55c5000
  0x290c84c: ldr      x0, [x0, #0x440] ; = 0x0 (u64 @ 0x55c5440)
  0x290c850: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c854: adrp     x0, #0x55c5000
  0x290c858: ldr      x0, [x0, #0x448] ; = 0x0 (u64 @ 0x55c5448)
  0x290c85c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c860: adrp     x0, #0x55c5000
  0x290c864: ldr      x0, [x0, #0x450] ; = 0x0 (u64 @ 0x55c5450)
  0x290c868: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c86c: adrp     x0, #0x55c5000
  0x290c870: ldr      x0, [x0, #0x458] ; = 0x0 (u64 @ 0x55c5458)
  0x290c874: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c878: adrp     x0, #0x55bc000
  0x290c87c: ldr      x0, [x0, #0x3c8] ; = 0x0 (u64 @ 0x55bc3c8)
  0x290c880: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c884: adrp     x0, #0x5599000
  0x290c888: ldr      x0, [x0, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x290c88c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c890: adrp     x0, #0x55c5000
  0x290c894: ldr      x0, [x0, #0x460] ; = 0x0 (u64 @ 0x55c5460)
  0x290c898: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c89c: adrp     x0, #0x55bc000
  0x290c8a0: ldr      x0, [x0, #0x3d0] ; = 0x0 (u64 @ 0x55bc3d0)
  0x290c8a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8a8: adrp     x0, #0x5599000
  0x290c8ac: ldr      x0, [x0, #0x9a0] ; = 0x0 (u64 @ 0x55999a0)
  0x290c8b0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8b4: adrp     x0, #0x5599000
  0x290c8b8: ldr      x0, [x0, #0x9a8] ; = 0x0 (u64 @ 0x55999a8)
  0x290c8bc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8c0: adrp     x0, #0x55bc000
  0x290c8c4: ldr      x0, [x0, #0x3d8] ; = 0x0 (u64 @ 0x55bc3d8)
  0x290c8c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8cc: adrp     x0, #0x55c5000
  0x290c8d0: ldr      x0, [x0, #0x468] ; = 0x0 (u64 @ 0x55c5468)
  0x290c8d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8d8: adrp     x0, #0x55c5000
  0x290c8dc: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290c8e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8e4: adrp     x0, #0x55c5000
  0x290c8e8: ldr      x0, [x0, #0x470] ; = 0x0 (u64 @ 0x55c5470)
  0x290c8ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8f0: adrp     x0, #0x55c5000
  0x290c8f4: ldr      x0, [x0, #0x478] ; = 0x0 (u64 @ 0x55c5478)
  0x290c8f8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c8fc: adrp     x0, #0x55c5000
  0x290c900: ldr      x0, [x0, #0x480] ; = 0x0 (u64 @ 0x55c5480)
  0x290c904: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c908: adrp     x0, #0x559a000
  0x290c90c: ldr      x0, [x0, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x290c910: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c914: adrp     x0, #0x5599000
  0x290c918: ldr      x0, [x0, #0x9b8] ; = 0x0 (u64 @ 0x55999b8)
  0x290c91c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c920: adrp     x0, #0x55bc000
  0x290c924: ldr      x0, [x0, #0x3f0] ; = 0x0 (u64 @ 0x55bc3f0)
  0x290c928: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c92c: adrp     x0, #0x559a000
  0x290c930: ldr      x0, [x0, #0x3f8] ; = 0x0 (u64 @ 0x559a3f8)
  0x290c934: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c938: adrp     x0, #0x55c5000
  0x290c93c: ldr      x0, [x0, #0x488] ; = 0x0 (u64 @ 0x55c5488)
  0x290c940: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c944: adrp     x0, #0x559a000
  0x290c948: ldr      x0, [x0, #0x3f0] ; = 0x0 (u64 @ 0x559a3f0)
  0x290c94c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c950: adrp     x0, #0x55c5000
  0x290c954: ldr      x0, [x0, #0x490] ; = 0x0 (u64 @ 0x55c5490)
  0x290c958: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290c95c: mov      w8, #1
  0x290c960: strb     w8, [x20, #0xea8]
  0x290c964: movi     v0.2d, #0000000000000000
  0x290c968: stp      xzr, xzr, [sp, #0x90]
  0x290c96c: str      xzr, [sp, #0xa0]
  0x290c970: stp      xzr, xzr, [sp, #0x70]
  0x290c974: str      xzr, [sp, #0x80]
  0x290c978: str      xzr, [sp, #0x60]
  0x290c97c: stp      q0, q0, [sp, #0x40]
  0x290c980: str      xzr, [sp, #0x38]
  0x290c984: ldr      x8, [x19, #0xd0]
  0x290c988: cbz      x8, #0x290cdbc
  0x290c98c: adrp     x8, #0x559a000
  0x290c990: ldr      x8, [x8, #0x3f0] ; = 0x0 (u64 @ 0x559a3f0)
  0x290c994: adrp     x20, #0x559a000
  0x290c998: adrp     x21, #0x55c5000
  0x290c99c: adrp     x22, #0x55c5000
  0x290c9a0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x290c9a4: ldr      x20, [x20, #0x3f8] ; = 0x0 (u64 @ 0x559a3f8)
  0x290c9a8: ldr      x21, [x21, #0x450] ; = 0x0 (u64 @ 0x55c5450)
  0x290c9ac: ldr      x22, [x22, #0x440] ; = 0x0 (u64 @ 0x55c5440)
  0x290c9b0: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290c9b4: ldr      x1, [x20] ; = 0x0 (u64 @ 0x559a000)
  0x290c9b8: mov      x20, x0
  0x290c9bc: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x290c9c0: ldr      x0, [x21] ; = 0x0 (u64 @ 0x55c5000)
  0x290c9c4: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290c9c8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290c9cc: mov      x21, x0
  0x290c9d0: bl       #0x4027c48 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$.ctor
  0x290c9d4: ldr      x0, [x19, #0xd0]
  0x290c9d8: cbz      x0, #0x290ce34
  0x290c9dc: adrp     x8, #0x55bc000
  0x290c9e0: ldr      x8, [x8, #0x3f0] ; = 0x0 (u64 @ 0x55bc3f0)
  0x290c9e4: adrp     x25, #0x55bc000
  0x290c9e8: adrp     x29, #0x5599000
  0x290c9ec: adrp     x28, #0x559a000
  0x290c9f0: adrp     x26, #0x55c5000
  0x290c9f4: adrp     x27, #0x55c5000
  0x290c9f8: ldr      x25, [x25, #0x3d0] ; = 0x0 (u64 @ 0x55bc3d0)
  0x290c9fc: ldr      x29, [x29, #0x9a0] ; = 0x0 (u64 @ 0x55999a0)
  0x290ca00: ldr      x28, [x28, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x290ca04: ldr      x26, [x26, #0x460] ; = 0x0 (u64 @ 0x55c5460)
  0x290ca08: ldr      x27, [x27, #0x438] ; = 0x0 (u64 @ 0x55c5438)
  0x290ca0c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bc000)
  0x290ca10: add      x8, sp, #0x10
  0x290ca14: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x290ca18: ldr      q0, [sp, #0x10]
  0x290ca1c: ldr      x8, [sp, #0x20]
  0x290ca20: str      q0, [sp, #0x90]
  0x290ca24: str      x8, [sp, #0xa0]
  0x290ca28: ldr      x1, [x25] ; = 0x0 (u64 @ 0x55bc000)
  0x290ca2c: add      x0, sp, #0x90
  0x290ca30: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x290ca34: tbz      w0, #0, #0x290ccb0
  0x290ca38: ldr      x22, [sp, #0xa0]
  0x290ca3c: cbz      x22, #0x290cdf8
  0x290ca40: ldr      x8, [x22, #0x18] ; = 0x0 (u64 @ 0x55c5018)
  0x290ca44: cbz      x8, #0x290cdfc
  0x290ca48: ldr      w8, [x8, #0x38]
  0x290ca4c: cmp      w8, #2
  0x290ca50: b.eq     #0x290ca28
  0x290ca54: mov      x0, x19
  0x290ca58: mov      x1, x22
  0x290ca5c: bl       #0x29100b8 ; -> CCharacterData$$CheckNodeApply
  0x290ca60: tbz      w0, #0, #0x290ca28
  0x290ca64: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55c5020)
  0x290ca68: cbz      x8, #0x290ce30
  0x290ca6c: ldr      w9, [x8, #0x34]
  0x290ca70: cbz      w9, #0x290cb3c
  0x290ca74: cmp      w9, #1
  0x290ca78: b.ne     #0x290ca28
  0x290ca7c: ldr      x0, [x8, #0x48] ; = 0x0 (u64 @ 0x55bc048)
  0x290ca80: cbz      x0, #0x290ce40
  0x290ca84: adrp     x8, #0x5599000
  0x290ca88: ldr      x8, [x8, #0x9b8] ; = 0x0 (u64 @ 0x55999b8)
  0x290ca8c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x290ca90: add      x8, sp, #0x10
  0x290ca94: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x290ca98: ldr      q0, [sp, #0x10]
  0x290ca9c: ldr      x8, [sp, #0x20]
  0x290caa0: str      q0, [sp, #0x70]
  0x290caa4: str      x8, [sp, #0x80]
  0x290caa8: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x290caac: add      x0, sp, #0x70
  0x290cab0: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x290cab4: tbz      w0, #0, #0x290cc1c
  0x290cab8: ldr      x22, [sp, #0x80]
  0x290cabc: mov      x0, xzr
  0x290cac0: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x290cac4: cbz      x0, #0x290cc60
  0x290cac8: mov      w2, #1
  0x290cacc: mov      x1, x22
  0x290cad0: mov      x3, xzr
  0x290cad4: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x290cad8: mov      x1, x0
  0x290cadc: cbz      x1, #0x290caa8
  0x290cae0: cbz      x20, #0x290cc70
  0x290cae4: ldr      w10, [x20, #0x1c]
  0x290cae8: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x559a010)
  0x290caec: ldr      x9, [x28] ; = 0x0 (u64 @ 0x559a000)
  0x290caf0: add      w10, w10, #1
  0x290caf4: str      w10, [x20, #0x1c]
  0x290caf8: cbz      x8, #0x290cc68
  0x290cafc: ldrsw    x10, [x20, #0x18]
  0x290cb00: ldr      w11, [x8, #0x18]
  0x290cb04: cmp      w10, w11
  0x290cb08: b.hs     #0x290cb24
  0x290cb0c: add      w9, w10, #1
  0x290cb10: add      x0, x8, x10, lsl #3
  0x290cb14: str      w9, [x20, #0x18]
  0x290cb18: str      x1, [x0, #0x20]!
  0x290cb1c: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x290cb20: b        #0x290caa8
  0x290cb24: ldr      x8, [x9, #0x20]
  0x290cb28: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x290cb2c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x290cb30: mov      x0, x20
  0x290cb34: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x290cb38: b        #0x290caa8
  0x290cb3c: cbz      x21, #0x290ce50
  0x290cb40: ldr      w1, [x8, #0x38]
  0x290cb44: adrp     x8, #0x55c5000
  0x290cb48: ldr      x8, [x8, #0x428] ; = 0x0 (u64 @ 0x55c5428)
  0x290cb4c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cb50: mov      x0, x21
  0x290cb54: bl       #0x4028810 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$ContainsKey
  0x290cb58: tbnz     w0, #0, #0x290cba8
  0x290cb5c: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55c5020)
  0x290cb60: cbz      x8, #0x290ce54
  0x290cb64: ldr      w23, [x8, #0x38]
  0x290cb68: adrp     x8, #0x55c5000
  0x290cb6c: ldr      x8, [x8, #0x490] ; = 0x0 (u64 @ 0x55c5490)
  0x290cb70: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cb74: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290cb78: adrp     x8, #0x55c5000
  0x290cb7c: ldr      x8, [x8, #0x488] ; = 0x0 (u64 @ 0x55c5488)
  0x290cb80: mov      x24, x0
  0x290cb84: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cb88: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x290cb8c: adrp     x8, #0x55c5000
  0x290cb90: ldr      x8, [x8, #0x420] ; = 0x0 (u64 @ 0x55c5420)
  0x290cb94: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cb98: mov      x0, x21
  0x290cb9c: mov      w1, w23
  0x290cba0: mov      x2, x24
  0x290cba4: bl       #0x402861c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$Add
  0x290cba8: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55c5020)
  0x290cbac: cbz      x8, #0x290ce44
  0x290cbb0: ldr      w1, [x8, #0x38]
  0x290cbb4: adrp     x8, #0x55c5000
  0x290cbb8: ldr      x8, [x8, #0x448] ; = 0x0 (u64 @ 0x55c5448)
  0x290cbbc: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cbc0: mov      x0, x21
  0x290cbc4: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290cbc8: cbz      x0, #0x290ce48
  0x290cbcc: adrp     x9, #0x55c5000
  0x290cbd0: ldr      x1, [x22, #0x20] ; = 0x0 (u64 @ 0x55c5020)
  0x290cbd4: ldr      w10, [x0, #0x1c]
  0x290cbd8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55c5010)
  0x290cbdc: ldr      x9, [x9, #0x480] ; = 0x0 (u64 @ 0x55c5480)
  0x290cbe0: add      w10, w10, #1
  0x290cbe4: ldr      x9, [x9] ; = 0x0 (u64 @ 0x55c5000)
  0x290cbe8: str      w10, [x0, #0x1c]
  0x290cbec: cbz      x8, #0x290ce4c
  0x290cbf0: ldrsw    x10, [x0, #0x18]
  0x290cbf4: ldr      w11, [x8, #0x18]
  0x290cbf8: cmp      w10, w11
  0x290cbfc: b.hs     #0x290cc4c
  0x290cc00: add      w9, w10, #1
  0x290cc04: add      x8, x8, x10, lsl #3
  0x290cc08: str      w9, [x0, #0x18]
  0x290cc0c: str      x1, [x8, #0x20]!
  0x290cc10: mov      x0, x8
  0x290cc14: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x290cc18: b        #0x290ca28
  0x290cc1c: mov      x23, xzr
  0x290cc20: mov      w22, #3
  0x290cc24: adrp     x8, #0x5599000
  0x290cc28: ldr      x8, [x8, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x290cc2c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x290cc30: add      x0, sp, #0x70
  0x290cc34: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290cc38: cbnz     x23, #0x290ce38
  0x290cc3c: cmp      w22, #3
  0x290cc40: b.eq     #0x290ca28
  0x290cc44: cbz      w22, #0x290ca28
  0x290cc48: b        #0x290cddc
  0x290cc4c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x55c5020)
  0x290cc50: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x290cc54: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x290cc58: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x290cc5c: b        #0x290ca28
  0x290cc60: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290cc64: b        #0x290ce58
  0x290cc68: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290cc6c: b        #0x290ce58
  0x290cc70: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290cc74: b        #0x290ce58
  0x290cc78: b        #0x290cc8c
  0x290cc7c: b        #0x290cc8c
  0x290cc80: b        #0x290cc8c
  0x290cc84: b        #0x290cc8c
  0x290cc88: b        #0x290cc8c
  0x290cc8c: mov      x22, x0
  0x290cc90: cmp      w1, #1
  0x290cc94: b.ne     #0x290ce04
  0x290cc98: mov      x0, x22
  0x290cc9c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290cca0: ldr      x23, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290cca4: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290cca8: mov      w22, wzr
  0x290ccac: b        #0x290cc24
  0x290ccb0: adrp     x8, #0x55bc000
  0x290ccb4: ldr      x8, [x8, #0x3c8] ; = 0x0 (u64 @ 0x55bc3c8)
  0x290ccb8: add      x0, sp, #0x90
  0x290ccbc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bc000)
  0x290ccc0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290ccc4: adrp     x23, #0x55c5000
  0x290ccc8: ldr      x23, [x23, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290cccc: cbz      x21, #0x290ce34
  0x290ccd0: adrp     x8, #0x55c5000
  0x290ccd4: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x55c5430)
  0x290ccd8: mov      x0, x21
  0x290ccdc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cce0: add      x8, sp, #0x10
  0x290cce4: bl       #0x4028a54 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x290cce8: ldp      q0, q1, [sp, #0x10]
  0x290ccec: ldr      x8, [sp, #0x30]
  0x290ccf0: stp      q0, q1, [sp, #0x40]
  0x290ccf4: str      x8, [sp, #0x60]
  0x290ccf8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290ccfc: add      x0, sp, #0x40
  0x290cd00: bl       #0x416d0bc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x290cd04: tbz      w0, #0, #0x290cd94
  0x290cd08: ldr      x0, [x19, #0x40]
  0x290cd0c: cbz      x0, #0x290cdf4
  0x290cd10: ldr      x21, [sp, #0x58]
  0x290cd14: ldr      w1, [sp, #0x50]
  0x290cd18: ldr      x3, [x27] ; = 0x0 (u64 @ 0x55c5000)
  0x290cd1c: add      x2, sp, #0x38
  0x290cd20: bl       #0x4029d90 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$TryGetValue
  0x290cd24: tbz      w0, #0, #0x290ccf8
  0x290cd28: ldr      x22, [sp, #0x38]
  0x290cd2c: cbz      x22, #0x290ce00
  0x290cd30: ldr      x8, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290cd34: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290cd38: ldrh     w9, [x8, #0x12e]
  0x290cd3c: cbz      x9, #0x290cd60
  0x290cd40: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290cd44: add      x10, x10, #8
  0x290cd48: ldur     x11, [x10, #-8]
  0x290cd4c: cmp      x11, x1
  0x290cd50: b.eq     #0x290cd70
  0x290cd54: subs     x9, x9, #1
  0x290cd58: add      x10, x10, #0x10
  0x290cd5c: b.ne     #0x290cd48
  0x290cd60: mov      w2, #0x10
  0x290cd64: mov      x0, x22
  0x290cd68: bl       #0x2215130 ; -> ??? 0x2215130
  0x290cd6c: b        #0x290cd80
  0x290cd70: ldr      w9, [x10]
  0x290cd74: add      w9, w9, #0x10
  0x290cd78: add      x8, x8, w9, sxtw #4
  0x290cd7c: add      x0, x8, #0x138
  0x290cd80: ldp      x8, x2, [x0]
  0x290cd84: mov      x0, x22
  0x290cd88: mov      x1, x21
  0x290cd8c: blr      x8
  0x290cd90: b        #0x290ccf8
  0x290cd94: adrp     x8, #0x55c5000
  0x290cd98: ldr      x8, [x8, #0x458] ; = 0x0 (u64 @ 0x55c5458)
  0x290cd9c: add      x0, sp, #0x40
  0x290cda0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cda4: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290cda8: ldr      x0, [x19, #0x10]
  0x290cdac: cbz      x0, #0x290ce34
  0x290cdb0: str      x20, [x0, #0x40]!
  0x290cdb4: mov      x1, x20
  0x290cdb8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x290cdbc: ldp      x20, x19, [sp, #0x100]
  0x290cdc0: ldp      x22, x21, [sp, #0xf0]
  0x290cdc4: ldp      x24, x23, [sp, #0xe0]
  0x290cdc8: ldp      x26, x25, [sp, #0xd0]
  0x290cdcc: ldp      x28, x27, [sp, #0xc0]
  0x290cdd0: ldp      x29, x30, [sp, #0xb0]
  0x290cdd4: add      sp, sp, #0x110
  0x290cdd8: ret      
  0x290cddc: adrp     x8, #0x55bc000
  0x290cde0: ldr      x8, [x8, #0x3c8] ; = 0x0 (u64 @ 0x55bc3c8)
  0x290cde4: add      x0, sp, #0x90
  0x290cde8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bc000)
  0x290cdec: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290cdf0: b        #0x290cdbc
  0x290cdf4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290cdf8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290cdfc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce00: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce04: str      x1, [sp, #8]
  0x290ce08: mov      x23, xzr
  0x290ce0c: adrp     x8, #0x5599000
  0x290ce10: ldr      x8, [x8, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x290ce14: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x290ce18: add      x0, sp, #0x70
  0x290ce1c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290ce20: ldr      x1, [sp, #8]
  0x290ce24: cbz      x23, #0x290ceb8
  0x290ce28: mov      x0, x23
  0x290ce2c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290ce30: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce34: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce38: mov      x0, x23
  0x290ce3c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290ce40: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce44: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce48: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce4c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce50: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce54: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ce58: mov      x22, x0
  0x290ce5c: str      x1, [sp, #8]
  0x290ce60: b        #0x290ce0c
  0x290ce64: b        #0x290ceb4
  0x290ce68: b        #0x290ceb4
  0x290ce6c: b        #0x290ceb4
  0x290ce70: b        #0x290ceb4
  0x290ce74: b        #0x290ceb4
  0x290ce78: b        #0x290ceb4
  0x290ce7c: b        #0x290ceb4
  0x290ce80: b        #0x290ceb4
  0x290ce84: b        #0x290ceb4
  0x290ce88: b        #0x290ceb4
  0x290ce8c: b        #0x290ceb4
  0x290ce90: b        #0x290ceb4
  0x290ce94: b        #0x290ceb4
  0x290ce98: b        #0x290ceb4
  0x290ce9c: b        #0x290cf1c
  0x290cea0: b        #0x290cf1c
  0x290cea4: b        #0x290ceb4
  0x290cea8: b        #0x290ceb4
  0x290ceac: b        #0x290cf1c
  0x290ceb0: b        #0x290cf1c
  0x290ceb4: mov      x22, x0
  0x290ceb8: cmp      w1, #1
  0x290cebc: b.ne     #0x290cef0
  0x290cec0: mov      x0, x22
  0x290cec4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290cec8: ldr      x23, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290cecc: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290ced0: adrp     x8, #0x55bc000
  0x290ced4: ldr      x8, [x8, #0x3c8] ; = 0x0 (u64 @ 0x55bc3c8)
  0x290ced8: add      x0, sp, #0x90
  0x290cedc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bc000)
  0x290cee0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290cee4: cbz      x23, #0x290ccc4
  0x290cee8: mov      x0, x23
  0x290ceec: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290cef0: mov      x23, xzr
  0x290cef4: b        #0x290cefc
  0x290cef8: mov      x22, x0
  0x290cefc: adrp     x8, #0x55bc000
  0x290cf00: ldr      x8, [x8, #0x3c8] ; = 0x0 (u64 @ 0x55bc3c8)
  0x290cf04: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bc000)
  0x290cf08: add      x0, sp, #0x90
  0x290cf0c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290cf10: cbz      x23, #0x290cf7c
  0x290cf14: mov      x0, x23
  0x290cf18: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290cf1c: mov      x22, x0
  0x290cf20: cmp      w1, #1
  0x290cf24: b.ne     #0x290cf58
  0x290cf28: mov      x0, x22
  0x290cf2c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290cf30: ldr      x21, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290cf34: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290cf38: adrp     x8, #0x55c5000
  0x290cf3c: ldr      x8, [x8, #0x458] ; = 0x0 (u64 @ 0x55c5458)
  0x290cf40: add      x0, sp, #0x40
  0x290cf44: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cf48: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290cf4c: cbz      x21, #0x290cda8
  0x290cf50: mov      x0, x21
  0x290cf54: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290cf58: mov      x21, xzr
  0x290cf5c: b        #0x290cf64
  0x290cf60: mov      x22, x0
  0x290cf64: adrp     x8, #0x55c5000
  0x290cf68: ldr      x8, [x8, #0x458] ; = 0x0 (u64 @ 0x55c5458)
  0x290cf6c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290cf70: add      x0, sp, #0x40
  0x290cf74: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290cf78: cbnz     x21, #0x290cf84
  0x290cf7c: mov      x0, x22
  0x290cf80: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x290cf84: mov      x0, x21
  0x290cf88: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290cf8c: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
