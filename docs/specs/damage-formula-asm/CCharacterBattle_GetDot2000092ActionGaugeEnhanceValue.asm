; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetDot2000092ActionGaugeEnhanceValue @ 0x2831dd8..0x2831fa4 (taille 460 octets) =====
  0x2831dd8: sub      sp, sp, #0x50
  0x2831ddc: str      x30, [sp, #0x20]
  0x2831de0: stp      x22, x21, [sp, #0x30]
  0x2831de4: stp      x20, x19, [sp, #0x40]
  0x2831de8: adrp     x20, #0x59e7000
  0x2831dec: ldrb     w8, [x20, #0x6ff]
  0x2831df0: mov      x19, x0
  0x2831df4: tbnz     w8, #0, #0x2831e3c
  0x2831df8: adrp     x0, #0x5599000
  0x2831dfc: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2831e00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831e04: adrp     x0, #0x5598000
  0x2831e08: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831e0c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831e10: adrp     x0, #0x5598000
  0x2831e14: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2831e18: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831e1c: adrp     x0, #0x5598000
  0x2831e20: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x2831e24: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831e28: adrp     x0, #0x5598000
  0x2831e2c: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2831e30: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831e34: mov      w8, #1
  0x2831e38: strb     w8, [x20, #0x6ff]
  0x2831e3c: mov      w1, #0x33
  0x2831e40: mov      x0, x19
  0x2831e44: stp      xzr, xzr, [sp, #8]
  0x2831e48: str      xzr, [sp, #0x18]
  0x2831e4c: bl       #0x2820eac ; -> CCharacterBattle$$GetBuffListByType
  0x2831e50: cbz      x0, #0x2831f24
  0x2831e54: adrp     x8, #0x5598000
  0x2831e58: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2831e5c: adrp     x21, #0x5598000
  0x2831e60: adrp     x22, #0x5599000
  0x2831e64: adrp     x20, #0x5598000
  0x2831e68: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831e6c: ldr      x21, [x21, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2831e70: ldr      x22, [x22, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2831e74: ldr      x20, [x20, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831e78: add      x8, sp, #8
  0x2831e7c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2831e80: mov      w19, wzr
  0x2831e84: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2831e88: add      x0, sp, #8
  0x2831e8c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2831e90: tbz      w0, #0, #0x2831eac
  0x2831e94: ldr      x0, [sp, #0x18]
  0x2831e98: cbz      x0, #0x2831f20
  0x2831e9c: mov      x1, xzr
  0x2831ea0: bl       #0x232548c ; -> CBuff$$get_Value
  0x2831ea4: add      w19, w0, w19
  0x2831ea8: b        #0x2831e84
  0x2831eac: ldr      x1, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x2831eb0: add      x0, sp, #8
  0x2831eb4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831eb8: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2831ebc: ldr      w8, [x0, #0xe0]
  0x2831ec0: cbnz     w8, #0x2831ec8
  0x2831ec4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2831ec8: mov      x0, xzr
  0x2831ecc: bl       #0x2a0a848 ; -> CCommonDefine$$get_MAX_ACTION_POINT
  0x2831ed0: mov      w1, #0x32
  0x2831ed4: mov      x2, xzr
  0x2831ed8: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2831edc: mov      w20, w0
  0x2831ee0: cbz      w19, #0x2831f08
  0x2831ee4: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2831ee8: ldr      w8, [x0, #0xe0]
  0x2831eec: cbnz     w8, #0x2831ef4
  0x2831ef0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2831ef4: mov      w0, w20
  0x2831ef8: mov      w1, w19
  0x2831efc: mov      x2, xzr
  0x2831f00: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2831f04: mov      w20, w0
  0x2831f08: mov      w0, w20
  0x2831f0c: ldp      x20, x19, [sp, #0x40]
  0x2831f10: ldp      x22, x21, [sp, #0x30]
  0x2831f14: ldr      x30, [sp, #0x20]
  0x2831f18: add      sp, sp, #0x50
  0x2831f1c: ret      
  0x2831f20: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2831f24: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2831f28: b        #0x2831f30
  0x2831f2c: b        #0x2831f30
  0x2831f30: mov      x20, x0
  0x2831f34: cmp      w1, #1
  0x2831f38: b.ne     #0x2831f6c
  0x2831f3c: mov      x0, x20
  0x2831f40: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2831f44: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x2831f48: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2831f4c: adrp     x8, #0x5598000
  0x2831f50: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831f54: add      x0, sp, #8
  0x2831f58: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831f5c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831f60: cbz      x21, #0x2831eb8
  0x2831f64: mov      x0, x21
  0x2831f68: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2831f6c: mov      x21, xzr
  0x2831f70: b        #0x2831f78
  0x2831f74: mov      x20, x0
  0x2831f78: adrp     x8, #0x5598000
  0x2831f7c: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831f80: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831f84: add      x0, sp, #8
  0x2831f88: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831f8c: cbnz     x21, #0x2831f98
  0x2831f90: mov      x0, x20
  0x2831f94: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2831f98: mov      x0, x21
  0x2831f9c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2831fa0: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
