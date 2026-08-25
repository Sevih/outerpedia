; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ProcessDamageOverTime @ 0x23189b4..0x2319948 (taille 3988 octets) =====
  0x23189b4: sub      sp, sp, #0xe0
  0x23189b8: stp      x29, x30, [sp, #0x80]
  0x23189bc: stp      x28, x27, [sp, #0x90]
  0x23189c0: stp      x26, x25, [sp, #0xa0]
  0x23189c4: stp      x24, x23, [sp, #0xb0]
  0x23189c8: stp      x22, x21, [sp, #0xc0]
  0x23189cc: stp      x20, x19, [sp, #0xd0]
  0x23189d0: adrp     x20, #0x59e4000
  0x23189d4: ldrb     w8, [x20, #0xb9f]
  0x23189d8: mov      x19, x3
  0x23189dc: mov      w22, w2
  0x23189e0: mov      w24, w1
  0x23189e4: mov      x25, x0
  0x23189e8: tbnz     w8, #0, #0x2318acc
  0x23189ec: adrp     x0, #0x5599000
  0x23189f0: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x23189f4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23189f8: adrp     x0, #0x5598000
  0x23189fc: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2318a00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a04: adrp     x0, #0x5598000
  0x2318a08: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x2318a0c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a10: adrp     x0, #0x5598000
  0x2318a14: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2318a18: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a1c: adrp     x0, #0x5598000
  0x2318a20: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x2318a24: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a28: adrp     x0, #0x5598000
  0x2318a2c: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2318a30: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a34: adrp     x0, #0x5598000
  0x2318a38: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2318a3c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a40: adrp     x0, #0x5598000
  0x2318a44: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x2318a48: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a4c: adrp     x0, #0x5598000
  0x2318a50: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x2318a54: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a58: adrp     x0, #0x5598000
  0x2318a5c: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x2318a60: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a64: adrp     x0, #0x5598000
  0x2318a68: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x2318a6c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a70: adrp     x0, #0x5598000
  0x2318a74: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2318a78: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a7c: adrp     x0, #0x5598000
  0x2318a80: ldr      x0, [x0, #0xf38] ; = 0x0 (u64 @ 0x5598f38)
  0x2318a84: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a88: adrp     x0, #0x5598000
  0x2318a8c: ldr      x0, [x0, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x2318a90: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318a94: adrp     x0, #0x5596000
  0x2318a98: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2318a9c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318aa0: adrp     x0, #0x5598000
  0x2318aa4: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5598f50)
  0x2318aa8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318aac: adrp     x0, #0x5599000
  0x2318ab0: ldr      x0, [x0, #0x1f0] ; = 0x0 (u64 @ 0x55991f0)
  0x2318ab4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318ab8: adrp     x0, #0x5598000
  0x2318abc: ldr      x0, [x0, #0xf80] ; = 0x0 (u64 @ 0x5598f80)
  0x2318ac0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2318ac4: mov      w8, #1
  0x2318ac8: strb     w8, [x20, #0xb9f]
  0x2318acc: str      xzr, [sp, #0x70]
  0x2318ad0: stp      xzr, xzr, [sp, #0x50]
  0x2318ad4: str      xzr, [sp, #0x60]
  0x2318ad8: stp      xzr, xzr, [sp, #0x30]
  0x2318adc: str      xzr, [sp, #0x40]
  0x2318ae0: cbz      x25, #0x231989c
  0x2318ae4: ldp      x20, x1, [x25, #0x18]
  0x2318ae8: adrp     x28, #0x5596000
  0x2318aec: ldr      x28, [x28, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2318af0: add      x8, sp, #0x70
  0x2318af4: add      x0, x8, #8
  0x2318af8: str      x1, [sp, #0x78]
  0x2318afc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2318b00: mov      x0, x25
  0x2318b04: mov      x1, xzr
  0x2318b08: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x2318b0c: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x2318b10: mov      w21, w0
  0x2318b14: ldr      w9, [x8, #0xe0]
  0x2318b18: cbnz     w9, #0x2318b24
  0x2318b1c: mov      x0, x8
  0x2318b20: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318b24: mov      x0, xzr
  0x2318b28: mov      x1, x20
  0x2318b2c: mov      x2, xzr
  0x2318b30: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x2318b34: tbnz     w0, #0, #0x2318b60
  0x2318b38: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x2318b3c: ldr      x23, [sp, #0x78]
  0x2318b40: ldr      w8, [x0, #0xe0]
  0x2318b44: cbnz     w8, #0x2318b4c
  0x2318b48: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318b4c: mov      x0, xzr
  0x2318b50: mov      x1, x23
  0x2318b54: mov      x2, xzr
  0x2318b58: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x2318b5c: tbz      w0, #0, #0x2318b68
  0x2318b60: mov      w0, wzr
  0x2318b64: b        #0x231987c
  0x2318b68: add      x0, sp, #0x70
  0x2318b6c: mov      x1, xzr
  0x2318b70: str      xzr, [sp, #0x70]
  0x2318b74: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2318b78: sub      w8, w21, #0x38
  0x2318b7c: cmp      w8, #6
  0x2318b80: b.hi     #0x2318ef0
  0x2318b84: adrp     x9, #0x1070000
  0x2318b88: add      x9, x9, #0x75a
  0x2318b8c: adr      x10, #0x2318b9c
  0x2318b90: ldrh     w11, [x9, x8, lsl #1]
  0x2318b94: add      x10, x10, x11, lsl #2
  0x2318b98: br       x10
  0x2318b9c: ldr      x0, [sp, #0x78]
  0x2318ba0: cbz      x0, #0x231989c
  0x2318ba4: mov      w1, #0x38
  0x2318ba8: mov      x2, xzr
  0x2318bac: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318bb0: cbz      x20, #0x231989c
  0x2318bb4: mov      w23, w0
  0x2318bb8: ldr      x0, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2318bbc: cbz      x0, #0x231989c
  0x2318bc0: mov      x1, xzr
  0x2318bc4: bl       #0x2909180 ; -> CCharacterData$$get_Atk
  0x2318bc8: adrp     x8, #0x5599000
  0x2318bcc: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2318bd0: mov      w25, w0
  0x2318bd4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2318bd8: ldr      w9, [x8, #0xe0]
  0x2318bdc: cbnz     w9, #0x2318be8
  0x2318be0: mov      x0, x8
  0x2318be4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318be8: mov      w0, w24
  0x2318bec: mov      w1, w23
  0x2318bf0: mov      x2, xzr
  0x2318bf4: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2318bf8: mov      w1, w0
  0x2318bfc: mov      w0, w25
  0x2318c00: mov      x2, xzr
  0x2318c04: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2318c08: adrp     x8, #0x5598000
  0x2318c0c: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2318c10: mov      w23, w0
  0x2318c14: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2318c18: ldr      w9, [x8, #0xe0]
  0x2318c1c: cbnz     w9, #0x2318c28
  0x2318c20: mov      x0, x8
  0x2318c24: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318c28: mov      x0, xzr
  0x2318c2c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2318c30: cbz      x0, #0x231989c
  0x2318c34: mul      w23, w23, w22
  0x2318c38: mov      w1, #0x22
  0x2318c3c: b        #0x2319308
  0x2318c40: ldr      x0, [sp, #0x78]
  0x2318c44: cbz      x0, #0x231989c
  0x2318c48: mov      w1, #0x3c
  0x2318c4c: mov      x2, xzr
  0x2318c50: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318c54: ldr      x8, [sp, #0x78]
  0x2318c58: cbz      x8, #0x231989c
  0x2318c5c: adrp     x9, #0x5599000
  0x2318c60: ldr      x9, [x9, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2318c64: mov      w25, w0
  0x2318c68: ldr      x23, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x2318c6c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x2318c70: ldr      w9, [x0, #0xe0]
  0x2318c74: cbnz     w9, #0x2318c7c
  0x2318c78: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318c7c: mov      w0, w24
  0x2318c80: mov      w1, w25
  0x2318c84: mov      x2, xzr
  0x2318c88: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2318c8c: cbz      x23, #0x231989c
  0x2318c90: mov      w2, w0
  0x2318c94: mov      w1, #1
  0x2318c98: mov      x0, x23
  0x2318c9c: mov      x3, xzr
  0x2318ca0: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x2318ca4: ldr      x8, [sp, #0x78]
  0x2318ca8: cbz      x8, #0x231989c
  0x2318cac: mov      w23, w0
  0x2318cb0: mov      w1, #0x4d
  0x2318cb4: mov      x0, x8
  0x2318cb8: mov      x2, xzr
  0x2318cbc: bl       #0x2820eac ; -> CCharacterBattle$$GetBuffListByType
  0x2318cc0: cbz      x0, #0x231989c
  0x2318cc4: adrp     x8, #0x5598000
  0x2318cc8: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2318ccc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2318cd0: add      x8, sp, #0x18
  0x2318cd4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2318cd8: ldur     q0, [sp, #0x18]
  0x2318cdc: ldr      x8, [sp, #0x28]
  0x2318ce0: adrp     x24, #0x5598000
  0x2318ce4: str      q0, [sp, #0x50]
  0x2318ce8: str      x8, [sp, #0x60]
  0x2318cec: ldr      x24, [x24, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2318cf0: mov      w25, w23
  0x2318cf4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2318cf8: add      x0, sp, #0x50
  0x2318cfc: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2318d00: tbz      w0, #0, #0x2319170
  0x2318d04: ldr      x23, [sp, #0x60]
  0x2318d08: cbz      x23, #0x2318cf4
  0x2318d0c: mov      x0, x23
  0x2318d10: mov      x1, xzr
  0x2318d14: mov      x2, xzr
  0x2318d18: bl       #0x23279e0 ; -> CBuff$$CheckCondition
  0x2318d1c: tbz      w0, #0, #0x2318cf4
  0x2318d20: mov      x0, x23
  0x2318d24: mov      x1, xzr
  0x2318d28: bl       #0x232548c ; -> CBuff$$get_Value
  0x2318d2c: cmp      w25, w0
  0x2318d30: b.le     #0x2318cf4
  0x2318d34: mov      x0, x23
  0x2318d38: mov      x1, xzr
  0x2318d3c: bl       #0x232548c ; -> CBuff$$get_Value
  0x2318d40: mov      w23, w0
  0x2318d44: b        #0x2318cf0
  0x2318d48: mov      x0, x25
  0x2318d4c: mov      x1, xzr
  0x2318d50: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318d54: cbz      w0, #0x23194ec
  0x2318d58: ldr      x0, [sp, #0x78]
  0x2318d5c: cbz      x0, #0x231989c
  0x2318d60: mov      w1, #0x3a
  0x2318d64: mov      x2, xzr
  0x2318d68: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318d6c: adrp     x8, #0x5599000
  0x2318d70: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2318d74: ldr      x23, [sp, #0x78]
  0x2318d78: mov      w26, w0
  0x2318d7c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2318d80: ldr      w9, [x8, #0xe0]
  0x2318d84: cbnz     w9, #0x2318d90
  0x2318d88: mov      x0, x8
  0x2318d8c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318d90: mov      w0, w24
  0x2318d94: mov      w1, w26
  0x2318d98: mov      x2, xzr
  0x2318d9c: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2318da0: cbz      x20, #0x231989c
  0x2318da4: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2318da8: mov      w24, w0
  0x2318dac: mov      x0, x25
  0x2318db0: mov      x1, xzr
  0x2318db4: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318db8: cbz      x26, #0x231989c
  0x2318dbc: mov      w1, w0
  0x2318dc0: mov      x0, x26
  0x2318dc4: mov      x2, xzr
  0x2318dc8: bl       #0x290a544 ; -> CCharacterData$$GetStatValue
  0x2318dcc: mov      w3, w0
  0x2318dd0: mov      x0, x20
  0x2318dd4: mov      x1, x23
  0x2318dd8: mov      w2, w24
  0x2318ddc: mov      x4, xzr
  0x2318de0: bl       #0x2cc2624 ; -> CFormula$$CalcDamageDOT
  0x2318de4: adrp     x8, #0x5598000
  0x2318de8: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2318dec: mov      w23, w0
  0x2318df0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2318df4: ldr      w9, [x8, #0xe0]
  0x2318df8: cbnz     w9, #0x2318e04
  0x2318dfc: mov      x0, x8
  0x2318e00: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318e04: mov      x0, xzr
  0x2318e08: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2318e0c: cbz      x0, #0x231989c
  0x2318e10: mul      w23, w23, w22
  0x2318e14: mov      w1, #0x24
  0x2318e18: b        #0x2319308
  0x2318e1c: mov      x0, x25
  0x2318e20: mov      x1, xzr
  0x2318e24: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318e28: cbz      w0, #0x23194ec
  0x2318e2c: ldr      x0, [sp, #0x78]
  0x2318e30: cbz      x0, #0x231989c
  0x2318e34: mov      w1, #0x3b
  0x2318e38: mov      x2, xzr
  0x2318e3c: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318e40: adrp     x8, #0x5599000
  0x2318e44: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2318e48: ldr      x23, [sp, #0x78]
  0x2318e4c: mov      w26, w0
  0x2318e50: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2318e54: ldr      w9, [x8, #0xe0]
  0x2318e58: cbnz     w9, #0x2318e64
  0x2318e5c: mov      x0, x8
  0x2318e60: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318e64: mov      w0, w24
  0x2318e68: mov      w1, w26
  0x2318e6c: mov      x2, xzr
  0x2318e70: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2318e74: cbz      x20, #0x231989c
  0x2318e78: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2318e7c: mov      w24, w0
  0x2318e80: mov      x0, x25
  0x2318e84: mov      x1, xzr
  0x2318e88: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318e8c: cbz      x26, #0x231989c
  0x2318e90: mov      w1, w0
  0x2318e94: mov      x0, x26
  0x2318e98: mov      x2, xzr
  0x2318e9c: bl       #0x290a544 ; -> CCharacterData$$GetStatValue
  0x2318ea0: mov      w3, w0
  0x2318ea4: mov      x0, x20
  0x2318ea8: mov      x1, x23
  0x2318eac: mov      w2, w24
  0x2318eb0: mov      x4, xzr
  0x2318eb4: bl       #0x2cc2624 ; -> CFormula$$CalcDamageDOT
  0x2318eb8: adrp     x8, #0x5598000
  0x2318ebc: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2318ec0: mov      w23, w0
  0x2318ec4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2318ec8: ldr      w9, [x8, #0xe0]
  0x2318ecc: cbnz     w9, #0x2318ed8
  0x2318ed0: mov      x0, x8
  0x2318ed4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318ed8: mov      x0, xzr
  0x2318edc: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2318ee0: cbz      x0, #0x231989c
  0x2318ee4: mul      w23, w23, w22
  0x2318ee8: mov      w1, #0x25
  0x2318eec: b        #0x2319308
  0x2318ef0: mov      w23, wzr
  0x2318ef4: b        #0x2319320
  0x2318ef8: mov      x0, x25
  0x2318efc: mov      x1, xzr
  0x2318f00: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318f04: cbz      w0, #0x23194ec
  0x2318f08: ldr      x0, [sp, #0x78]
  0x2318f0c: cbz      x0, #0x231989c
  0x2318f10: mov      w1, #0x39
  0x2318f14: mov      x2, xzr
  0x2318f18: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318f1c: adrp     x8, #0x5599000
  0x2318f20: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2318f24: ldr      x23, [sp, #0x78]
  0x2318f28: mov      w26, w0
  0x2318f2c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2318f30: ldr      w9, [x8, #0xe0]
  0x2318f34: cbnz     w9, #0x2318f40
  0x2318f38: mov      x0, x8
  0x2318f3c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318f40: mov      w0, w24
  0x2318f44: mov      w1, w26
  0x2318f48: mov      x2, xzr
  0x2318f4c: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2318f50: cbz      x20, #0x231989c
  0x2318f54: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2318f58: mov      w24, w0
  0x2318f5c: mov      x0, x25
  0x2318f60: mov      x1, xzr
  0x2318f64: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2318f68: cbz      x26, #0x231989c
  0x2318f6c: mov      w1, w0
  0x2318f70: mov      x0, x26
  0x2318f74: mov      x2, xzr
  0x2318f78: bl       #0x290a544 ; -> CCharacterData$$GetStatValue
  0x2318f7c: mov      w3, w0
  0x2318f80: mov      x0, x20
  0x2318f84: mov      x1, x23
  0x2318f88: mov      w2, w24
  0x2318f8c: mov      x4, xzr
  0x2318f90: bl       #0x2cc2624 ; -> CFormula$$CalcDamageDOT
  0x2318f94: adrp     x8, #0x5598000
  0x2318f98: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2318f9c: mov      w23, w0
  0x2318fa0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2318fa4: ldr      w9, [x8, #0xe0]
  0x2318fa8: cbnz     w9, #0x2318fb4
  0x2318fac: mov      x0, x8
  0x2318fb0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2318fb4: mov      x0, xzr
  0x2318fb8: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2318fbc: cbz      x0, #0x231989c
  0x2318fc0: mul      w23, w23, w22
  0x2318fc4: mov      w1, #0x23
  0x2318fc8: b        #0x2319308
  0x2318fcc: ldr      x0, [sp, #0x78]
  0x2318fd0: cbz      x0, #0x231989c
  0x2318fd4: mov      w1, #0x3d
  0x2318fd8: mov      x2, xzr
  0x2318fdc: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x2318fe0: cbz      x20, #0x231989c
  0x2318fe4: mov      w23, w0
  0x2318fe8: ldr      x0, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2318fec: cbz      x0, #0x231989c
  0x2318ff0: mov      w1, #0xf
  0x2318ff4: mov      x2, xzr
  0x2318ff8: bl       #0x29101ac ; -> CCharacterData$$GetFinalStat
  0x2318ffc: adrp     x8, #0x5599000
  0x2319000: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2319004: mov      w26, w0
  0x2319008: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x231900c: ldr      w9, [x8, #0xe0]
  0x2319010: cbnz     w9, #0x231901c
  0x2319014: mov      x0, x8
  0x2319018: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x231901c: mov      w0, w24
  0x2319020: mov      w1, w23
  0x2319024: mov      x2, xzr
  0x2319028: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x231902c: mov      w1, w0
  0x2319030: mov      w0, w26
  0x2319034: mov      x2, xzr
  0x2319038: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x231903c: adrp     x8, #0x5598000
  0x2319040: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2319044: mov      w23, w0
  0x2319048: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x231904c: ldr      w9, [x8, #0xe0]
  0x2319050: cbnz     w9, #0x231905c
  0x2319054: mov      x0, x8
  0x2319058: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x231905c: mov      x0, xzr
  0x2319060: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2319064: cbz      x0, #0x231989c
  0x2319068: mov      w1, #0x27
  0x231906c: mov      x2, xzr
  0x2319070: bl       #0x262c5dc ; -> CTempletManager$$GetDamageTypeTemplet
  0x2319074: mov      x1, x0
  0x2319078: str      x0, [sp, #0x70]
  0x231907c: add      x0, sp, #0x70
  0x2319080: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2319084: mov      x0, x20
  0x2319088: mov      x1, xzr
  0x231908c: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x2319090: cbz      x0, #0x231989c
  0x2319094: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x2319098: cbz      x0, #0x231989c
  0x231909c: adrp     x8, #0x5598000
  0x23190a0: ldr      x8, [x8, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x23190a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23190a8: mul      w8, w23, w22
  0x23190ac: str      w8, [sp, #0x14]
  0x23190b0: add      x8, sp, #0x18
  0x23190b4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x23190b8: ldur     q0, [sp, #0x18]
  0x23190bc: ldr      x8, [sp, #0x28]
  0x23190c0: adrp     x29, #0x5598000
  0x23190c4: ldr      x29, [x29, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x23190c8: str      q0, [sp, #0x30]
  0x23190cc: str      x8, [sp, #0x40]
  0x23190d0: adrp     x26, #0x5599000
  0x23190d4: ldr      x26, [x26, #0x1f8] ; = 0x0 (u64 @ 0x55991f8)
  0x23190d8: adrp     x23, #0x59e4000
  0x23190dc: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5598000)
  0x23190e0: add      x0, sp, #0x30
  0x23190e4: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x23190e8: tbz      w0, #0, #0x23191b4
  0x23190ec: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x23190f0: ldr      x27, [sp, #0x40]
  0x23190f4: ldr      w8, [x0, #0xe0]
  0x23190f8: cbnz     w8, #0x2319100
  0x23190fc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319100: mov      x0, x27
  0x2319104: mov      x1, xzr
  0x2319108: mov      x2, xzr
  0x231910c: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2319110: tbz      w0, #0, #0x23190dc
  0x2319114: cbz      x27, #0x23191d0
  0x2319118: mov      x0, x27
  0x231911c: mov      x1, xzr
  0x2319120: bl       #0x2831dd8 ; -> CCharacterBattle$$GetDot2000092ActionGaugeEnhanceValue
  0x2319124: mul      w1, w0, w22
  0x2319128: mov      w2, #1
  0x231912c: mov      x0, x27
  0x2319130: mov      x3, xzr
  0x2319134: bl       #0x28151b8 ; -> CCharacterBattle$$AddActionPoint
  0x2319138: ldrb     w8, [x23, #0xbdb]
  0x231913c: cbnz     w8, #0x2319150
  0x2319140: mov      x0, x26
  0x2319144: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319148: mov      w8, #1
  0x231914c: strb     w8, [x23, #0xbdb]
  0x2319150: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2319154: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2319158: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x231915c: cbz      x0, #0x23191d4
  0x2319160: mov      x1, x27
  0x2319164: mov      x2, xzr
  0x2319168: bl       #0x29010bc ; -> CHudTurnSequencePanel$$JumpIcon
  0x231916c: b        #0x23190dc
  0x2319170: adrp     x8, #0x5598000
  0x2319174: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2319178: add      x0, sp, #0x50
  0x231917c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319180: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319184: adrp     x8, #0x5598000
  0x2319188: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x231918c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319190: ldr      w8, [x0, #0xe0]
  0x2319194: cbnz     w8, #0x231919c
  0x2319198: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x231919c: mov      x0, xzr
  0x23191a0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23191a4: cbz      x0, #0x231989c
  0x23191a8: mul      w23, w25, w22
  0x23191ac: mov      w1, #0x26
  0x23191b0: b        #0x2319308
  0x23191b4: adrp     x8, #0x5598000
  0x23191b8: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x23191bc: add      x0, sp, #0x30
  0x23191c0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23191c4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23191c8: ldr      w23, [sp, #0x14]
  0x23191cc: b        #0x2319320
  0x23191d0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23191d4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23191d8: b        #0x23198d4
  0x23191dc: b        #0x2319204
  0x23191e0: b        #0x23198d4
  0x23191e4: b        #0x2319204
  0x23191e8: b        #0x2319204
  0x23191ec: b        #0x2319204
  0x23191f0: b        #0x2319204
  0x23191f4: b        #0x2319204
  0x23191f8: b        #0x2319204
  0x23191fc: b        #0x23198d4
  0x2319200: b        #0x2319204
  0x2319204: mov      x23, x0
  0x2319208: cmp      w1, #1
  0x231920c: b.ne     #0x23198a0
  0x2319210: mov      x0, x23
  0x2319214: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2319218: ldr      x26, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x231921c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2319220: adrp     x8, #0x5598000
  0x2319224: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x2319228: add      x0, sp, #0x30
  0x231922c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319230: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319234: cbnz     x26, #0x23198a8
  0x2319238: mov      x0, x25
  0x231923c: mov      x1, xzr
  0x2319240: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x2319244: cbz      w0, #0x23194ec
  0x2319248: ldr      x0, [sp, #0x78]
  0x231924c: cbz      x0, #0x231989c
  0x2319250: mov      w1, #0x3e
  0x2319254: mov      x2, xzr
  0x2319258: bl       #0x2831b34 ; -> CCharacterBattle$$GetDotDamageIncreaseBuffValue
  0x231925c: adrp     x8, #0x5599000
  0x2319260: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2319264: ldr      x23, [sp, #0x78]
  0x2319268: mov      w26, w0
  0x231926c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2319270: ldr      w9, [x8, #0xe0]
  0x2319274: cbnz     w9, #0x2319280
  0x2319278: mov      x0, x8
  0x231927c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319280: mov      w0, w24
  0x2319284: mov      w1, w26
  0x2319288: mov      x2, xzr
  0x231928c: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2319290: cbz      x20, #0x231989c
  0x2319294: ldr      x26, [x20, #0x28] ; = 0x0 (u64 @ 0x59e4028)
  0x2319298: mov      w24, w0
  0x231929c: mov      x0, x25
  0x23192a0: mov      x1, xzr
  0x23192a4: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x23192a8: cbz      x26, #0x231989c
  0x23192ac: mov      w1, w0
  0x23192b0: mov      x0, x26
  0x23192b4: mov      x2, xzr
  0x23192b8: bl       #0x290a544 ; -> CCharacterData$$GetStatValue
  0x23192bc: mov      w3, w0
  0x23192c0: mov      x0, x20
  0x23192c4: mov      x1, x23
  0x23192c8: mov      w2, w24
  0x23192cc: mov      x4, xzr
  0x23192d0: bl       #0x2cc2624 ; -> CFormula$$CalcDamageDOT
  0x23192d4: adrp     x8, #0x5598000
  0x23192d8: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x23192dc: mov      w23, w0
  0x23192e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23192e4: ldr      w9, [x8, #0xe0]
  0x23192e8: cbnz     w9, #0x23192f4
  0x23192ec: mov      x0, x8
  0x23192f0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23192f4: mov      x0, xzr
  0x23192f8: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23192fc: cbz      x0, #0x231989c
  0x2319300: mul      w23, w23, w22
  0x2319304: mov      w1, #0x28
  0x2319308: mov      x2, xzr
  0x231930c: bl       #0x262c5dc ; -> CTempletManager$$GetDamageTypeTemplet
  0x2319310: mov      x1, x0
  0x2319314: str      x0, [sp, #0x70]
  0x2319318: add      x0, sp, #0x70
  0x231931c: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2319320: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x2319324: ldr      w8, [x0, #0xe0]
  0x2319328: cbnz     w8, #0x2319330
  0x231932c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319330: mov      x0, x19
  0x2319334: mov      x1, xzr
  0x2319338: mov      x2, xzr
  0x231933c: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2319340: tbz      w0, #0, #0x2319358
  0x2319344: ldr      x0, [sp, #0x78]
  0x2319348: mov      w1, w21
  0x231934c: mov      w2, w23
  0x2319350: bl       #0x2319948 ; -> CBattleManager$$ApplyImmediatelyDotDamageCap
  0x2319354: mov      w23, w0
  0x2319358: ldr      x0, [sp, #0x78]
  0x231935c: cbz      x0, #0x231989c
  0x2319360: mov      w1, #3
  0x2319364: mov      x2, xzr
  0x2319368: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x231936c: cbz      x0, #0x23193d4
  0x2319370: adrp     x8, #0x5598000
  0x2319374: ldr      x20, [sp, #0x78]
  0x2319378: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5598f50)
  0x231937c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319380: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2319384: adrp     x8, #0x5598000
  0x2319388: ldr      x8, [x8, #0xf80] ; = 0x0 (u64 @ 0x5598f80)
  0x231938c: mov      x2, xzr
  0x2319390: mov      x21, x0
  0x2319394: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319398: bl       #0x25ef940 ; -> Symbol$$.ctor
  0x231939c: cbz      x20, #0x231989c
  0x23193a0: mov      x0, x20
  0x23193a4: mov      x1, xzr
  0x23193a8: mov      x2, xzr
  0x23193ac: mov      x3, x21
  0x23193b0: mov      w4, wzr
  0x23193b4: mov      w5, wzr
  0x23193b8: mov      w6, wzr
  0x23193bc: mov      w7, wzr
  0x23193c0: str      xzr, [sp]
  0x23193c4: bl       #0x2815de0 ; -> CCharacterBattle$$PlayBuffEffect
  0x23193c8: mov      w21, wzr
  0x23193cc: mov      w23, wzr
  0x23193d0: b        #0x2319520
  0x23193d4: cmp      w23, #1
  0x23193d8: b.lt     #0x231951c
  0x23193dc: ldr      x0, [sp, #0x78]
  0x23193e0: cbz      x0, #0x231989c
  0x23193e4: neg      w1, w23
  0x23193e8: mov      w2, wzr
  0x23193ec: mov      w3, wzr
  0x23193f0: mov      w4, wzr
  0x23193f4: mov      x5, xzr
  0x23193f8: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x23193fc: adrp     x21, #0x59e4000
  0x2319400: ldrb     w8, [x21, #0xbd3]
  0x2319404: cbnz     w8, #0x231941c
  0x2319408: adrp     x0, #0x5598000
  0x231940c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2319410: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319414: mov      w8, #1
  0x2319418: strb     w8, [x21, #0xbd3]
  0x231941c: adrp     x8, #0x5598000
  0x2319420: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2319424: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319428: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x231942c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319430: cbz      x8, #0x231989c
  0x2319434: ldr      x0, [sp, #0x78]
  0x2319438: cbz      x0, #0x231989c
  0x231943c: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x5598068)
  0x2319440: mov      x1, xzr
  0x2319444: bl       #0x5043144 ; -> UnityEngine.Component$$get_transform
  0x2319448: cbz      x21, #0x231989c
  0x231944c: mov      x4, x0
  0x2319450: mov      x0, x21
  0x2319454: mov      w1, w23
  0x2319458: mov      w2, wzr
  0x231945c: mov      w3, wzr
  0x2319460: mov      w5, wzr
  0x2319464: mov      x6, xzr
  0x2319468: bl       #0x29038b8 ; -> CUIHud$$PlayHudTextDamage
  0x231946c: cbz      x20, #0x231989c
  0x2319470: mov      x0, x20
  0x2319474: mov      x1, xzr
  0x2319478: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x231947c: mov      x21, x0
  0x2319480: mov      x0, x20
  0x2319484: mov      x1, xzr
  0x2319488: bl       #0x27141ac ; -> CCharacter$$get_UID
  0x231948c: cbz      x21, #0x231989c
  0x2319490: mov      x1, x0
  0x2319494: mov      x0, x21
  0x2319498: mov      w2, w23
  0x231949c: mov      x3, xzr
  0x23194a0: bl       #0x25934e0 ; -> CTeam$$AddTotalHit
  0x23194a4: ldr      x0, [sp, #0x78]
  0x23194a8: cbz      x0, #0x231989c
  0x23194ac: mov      x1, xzr
  0x23194b0: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x23194b4: ldr      x8, [sp, #0x78]
  0x23194b8: cbz      x8, #0x231989c
  0x23194bc: mov      x20, x0
  0x23194c0: mov      x0, x8
  0x23194c4: mov      x1, xzr
  0x23194c8: bl       #0x27141ac ; -> CCharacter$$get_UID
  0x23194cc: cbz      x20, #0x231989c
  0x23194d0: mov      x1, x0
  0x23194d4: mov      x0, x20
  0x23194d8: mov      w2, w23
  0x23194dc: mov      x3, xzr
  0x23194e0: bl       #0x2593584 ; -> CTeam$$AddTotalDamage
  0x23194e4: mov      w21, #1
  0x23194e8: b        #0x2319520
  0x23194ec: adrp     x8, #0x5598000
  0x23194f0: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x23194f4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23194f8: ldr      w8, [x0, #0xe0]
  0x23194fc: cbnz     w8, #0x2319504
  0x2319500: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319504: adrp     x8, #0x5599000
  0x2319508: ldr      x8, [x8, #0x1f0] ; = 0x0 (u64 @ 0x55991f0)
  0x231950c: mov      x1, xzr
  0x2319510: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2319514: bl       #0x2cb618c ; -> CDebug$$LogError
  0x2319518: b        #0x2318b60
  0x231951c: mov      w21, wzr
  0x2319520: ldr      x0, [sp, #0x78]
  0x2319524: cbz      x0, #0x231989c
  0x2319528: mov      x1, xzr
  0x231952c: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x2319530: cbnz     w0, #0x23195a4
  0x2319534: ldr      x0, [sp, #0x78]
  0x2319538: cbz      x0, #0x231989c
  0x231953c: mov      x1, xzr
  0x2319540: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x2319544: tbz      w0, #0, #0x23195a4
  0x2319548: ldr      x0, [sp, #0x78]
  0x231954c: cbz      x0, #0x231989c
  0x2319550: ldrb     w8, [x0, #0x2e8]
  0x2319554: cbnz     w8, #0x23195a4
  0x2319558: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x231955c: mov      w1, wzr
  0x2319560: ldp      x9, x2, [x8, #0x198]
  0x2319564: blr      x9
  0x2319568: ldr      x0, [sp, #0x78]
  0x231956c: cbz      x0, #0x231989c
  0x2319570: ldr      w8, [x0, #0x21c]
  0x2319574: cmp      w8, #1
  0x2319578: b.ne     #0x23195a4
  0x231957c: mov      x1, xzr
  0x2319580: bl       #0x2814ac4 ; -> CCharacterBattle$$get_IsBoss
  0x2319584: tbz      w0, #0, #0x23195a4
  0x2319588: ldr      x0, [sp, #0x78]
  0x231958c: cbz      x0, #0x231989c
  0x2319590: mov      x1, xzr
  0x2319594: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x2319598: cbz      x0, #0x231989c
  0x231959c: mov      x1, xzr
  0x23195a0: bl       #0x2598690 ; -> CTeam$$BossKill
  0x23195a4: ldr      x8, [sp, #0x70]
  0x23195a8: cbz      x8, #0x231989c
  0x23195ac: ldr      x8, [x8, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x23195b0: cbz      x8, #0x231989c
  0x23195b4: ldr      w8, [x8, #0x18]
  0x23195b8: cmp      w8, #1
  0x23195bc: b.lt     #0x2319680
  0x23195c0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x23195c4: ldr      w8, [x0, #0xe0]
  0x23195c8: cbnz     w8, #0x23195d0
  0x23195cc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23195d0: mov      x0, x19
  0x23195d4: mov      x1, xzr
  0x23195d8: mov      x2, xzr
  0x23195dc: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x23195e0: tbz      w0, #0, #0x2319600
  0x23195e4: cbz      x19, #0x231989c
  0x23195e8: mov      x0, x19
  0x23195ec: mov      x1, xzr
  0x23195f0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x23195f4: cbz      x0, #0x231989c
  0x23195f8: ldrb     w8, [x0, #0xb7]
  0x23195fc: cbz      w8, #0x2319660
  0x2319600: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x2319604: ldr      w8, [x0, #0xe0]
  0x2319608: cbnz     w8, #0x2319610
  0x231960c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319610: mov      x0, x19
  0x2319614: mov      x1, xzr
  0x2319618: mov      x2, xzr
  0x231961c: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x2319620: tbz      w0, #0, #0x2319680
  0x2319624: ldr      x0, [sp, #0x78]
  0x2319628: cbz      x0, #0x231989c
  0x231962c: mov      x1, xzr
  0x2319630: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2319634: cbz      x0, #0x231989c
  0x2319638: ldrb     w8, [x0, #0xb6]
  0x231963c: cbnz     w8, #0x2319680
  0x2319640: ldr      x0, [sp, #0x78]
  0x2319644: cbz      x0, #0x231989c
  0x2319648: mov      x1, xzr
  0x231964c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2319650: cbz      x0, #0x231989c
  0x2319654: mov      w8, #1
  0x2319658: strb     w8, [x0, #0xb6]
  0x231965c: b        #0x2319678
  0x2319660: mov      x0, x19
  0x2319664: mov      x1, xzr
  0x2319668: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x231966c: cbz      x0, #0x231989c
  0x2319670: mov      w8, #1
  0x2319674: strb     w8, [x0, #0xb7]
  0x2319678: add      x0, sp, #0x70
  0x231967c: bl       #0x2319a04 ; -> CBattleManager$$<ProcessDamageOverTime>g__PlaySE|82_0
  0x2319680: ldr      x0, [sp, #0x70]
  0x2319684: cbz      x0, #0x231989c
  0x2319688: ldr      x8, [x0, #0x50] ; = 0x0 (u64 @ 0x5598050)
  0x231968c: cbz      x8, #0x231989c
  0x2319690: ldr      w8, [x8, #0x18]
  0x2319694: cmp      w8, #1
  0x2319698: b.lt     #0x2319708
  0x231969c: adrp     x8, #0x5598000
  0x23196a0: ldr      x8, [x8, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x23196a4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23196a8: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x23196ac: ldr      x8, [sp, #0x70]
  0x23196b0: cbz      x8, #0x231989c
  0x23196b4: mov      x20, x0
  0x23196b8: ldr      x0, [x8, #0x50] ; = 0x0 (u64 @ 0x5598050)
  0x23196bc: cbz      x0, #0x231989c
  0x23196c0: adrp     x8, #0x5598000
  0x23196c4: ldr      x8, [x8, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x23196c8: mov      w1, wzr
  0x23196cc: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23196d0: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x23196d4: cbz      x20, #0x231989c
  0x23196d8: ldr      x2, [sp, #0x78]
  0x23196dc: mov      x1, x0
  0x23196e0: mov      x0, x20
  0x23196e4: mov      x3, xzr
  0x23196e8: mov      x4, xzr
  0x23196ec: mov      x5, xzr
  0x23196f0: mov      x6, xzr
  0x23196f4: mov      x7, xzr
  0x23196f8: str      xzr, [sp]
  0x23196fc: bl       #0x2bebf34 ; -> CEffectManager$$Play
  0x2319700: ldr      x0, [sp, #0x70]
  0x2319704: cbz      x0, #0x231989c
  0x2319708: mov      x1, xzr
  0x231970c: bl       #0x25f533c ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x2319710: fmul     s0, s0, s0
  0x2319714: fmul     s1, s1, s1
  0x2319718: adrp     x8, #0x1070000
  0x231971c: fmov     s4, #-1.00000000
  0x2319720: fadd     s0, s0, s1
  0x2319724: ldr      s1, [x8, #0x3ec] ; = 9.999999439624929e-11 (f32 @ 0x10703ec)
  0x2319728: fmul     s2, s2, s2
  0x231972c: fadd     s3, s3, s4
  0x2319730: fadd     s0, s2, s0
  0x2319734: fmul     s2, s3, s3
  0x2319738: fadd     s0, s2, s0
  0x231973c: fcmp     s0, s1
  0x2319740: b.mi     #0x2319780
  0x2319744: ldr      x0, [sp, #0x70]
  0x2319748: cbz      x0, #0x231989c
  0x231974c: ldr      s0, [x0, #0x30] ; = 0.0 (f32 @ 0x5598030)
  0x2319750: fcmp     s0, #0.0
  0x2319754: b.eq     #0x2319780
  0x2319758: ldr      x20, [sp, #0x78]
  0x231975c: mov      x1, xzr
  0x2319760: bl       #0x25f533c ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x2319764: ldr      x8, [sp, #0x70]
  0x2319768: cbz      x8, #0x231989c
  0x231976c: cbz      x20, #0x231989c
  0x2319770: ldr      s4, [x8, #0x30] ; = 1.401298464324817e-45 (f32 @ 0x1070030)
  0x2319774: mov      x0, x20
  0x2319778: mov      x1, xzr
  0x231977c: bl       #0x271dc94 ; -> CCharacter$$PlayHitLightEffect
  0x2319780: ldr      x0, [sp, #0x78]
  0x2319784: cbz      x0, #0x231989c
  0x2319788: mov      w1, #1
  0x231978c: mov      w2, #1
  0x2319790: mov      x3, xzr
  0x2319794: bl       #0x271d900 ; -> CCharacter$$ChangeDamageReactState
  0x2319798: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x231979c: ldr      w8, [x0, #0xe0]
  0x23197a0: cbnz     w8, #0x23197a8
  0x23197a4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23197a8: mov      x0, x19
  0x23197ac: mov      x1, xzr
  0x23197b0: mov      x2, xzr
  0x23197b4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x23197b8: and      w8, w21, w0
  0x23197bc: cmp      w8, #1
  0x23197c0: b.ne     #0x2319878
  0x23197c4: adrp     x21, #0x59e4000
  0x23197c8: ldrb     w8, [x21, #0xbd3]
  0x23197cc: cbnz     w8, #0x23197e4
  0x23197d0: adrp     x0, #0x5598000
  0x23197d4: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x23197d8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23197dc: mov      w8, #1
  0x23197e0: strb     w8, [x21, #0xbd3]
  0x23197e4: adrp     x22, #0x5598000
  0x23197e8: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x23197ec: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x23197f0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x10700b8)
  0x23197f4: ldr      x0, [x8] ; = 0xbecccccd (u64 @ 0x1070000)
  0x23197f8: cbz      x0, #0x231989c
  0x23197fc: mov      x1, xzr
  0x2319800: bl       #0x25a27d8 ; -> CDungeonScene$$GetActiveCharacter
  0x2319804: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x2319808: mov      x20, x0
  0x231980c: ldr      w9, [x8, #0xe0]
  0x2319810: cbnz     w9, #0x231981c
  0x2319814: mov      x0, x8
  0x2319818: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x231981c: mov      x0, x20
  0x2319820: mov      x1, x19
  0x2319824: mov      x2, xzr
  0x2319828: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x231982c: tbz      w0, #0, #0x2319878
  0x2319830: ldrb     w8, [x21, #0xbd3]
  0x2319834: cbnz     w8, #0x231984c
  0x2319838: adrp     x0, #0x5598000
  0x231983c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2319840: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319844: mov      w8, #1
  0x2319848: strb     w8, [x21, #0xbd3]
  0x231984c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2319850: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x10700b8)
  0x2319854: ldr      x8, [x8] ; = 0xbecccccd (u64 @ 0x1070000)
  0x2319858: cbz      x8, #0x231989c
  0x231985c: ldr      x8, [x8, #0x68] ; = 0x3800000007 (u64 @ 0x1070068)
  0x2319860: cbz      x8, #0x231989c
  0x2319864: ldr      x0, [x8, #0x138] ; = 0x3e99999a (u64 @ 0x1070138)
  0x2319868: cbz      x0, #0x231989c
  0x231986c: mov      w1, w23
  0x2319870: mov      x2, xzr
  0x2319874: bl       #0x28ff97c ; -> CHudTotalDamage$$SetTotalDamage
  0x2319878: mov      w0, #1
  0x231987c: ldp      x20, x19, [sp, #0xd0]
  0x2319880: ldp      x22, x21, [sp, #0xc0]
  0x2319884: ldp      x24, x23, [sp, #0xb0]
  0x2319888: ldp      x26, x25, [sp, #0xa0]
  0x231988c: ldp      x28, x27, [sp, #0x90]
  0x2319890: ldp      x29, x30, [sp, #0x80]
  0x2319894: add      sp, sp, #0xe0
  0x2319898: ret      
  0x231989c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23198a0: mov      x26, xzr
  0x23198a4: b        #0x23198b4
  0x23198a8: mov      x0, x26
  0x23198ac: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23198b0: mov      x23, x0
  0x23198b4: adrp     x8, #0x5598000
  0x23198b8: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x23198bc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23198c0: add      x0, sp, #0x30
  0x23198c4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23198c8: cbz      x26, #0x2319934
  0x23198cc: mov      x0, x26
  0x23198d0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23198d4: mov      x23, x0
  0x23198d8: cmp      w1, #1
  0x23198dc: b.ne     #0x2319910
  0x23198e0: mov      x0, x23
  0x23198e4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x23198e8: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x23198ec: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x23198f0: adrp     x8, #0x5598000
  0x23198f4: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23198f8: add      x0, sp, #0x50
  0x23198fc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319900: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319904: cbz      x24, #0x2319184
  0x2319908: mov      x0, x24
  0x231990c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2319910: mov      x24, xzr
  0x2319914: b        #0x231991c
  0x2319918: mov      x23, x0
  0x231991c: adrp     x8, #0x5598000
  0x2319920: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2319924: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319928: add      x0, sp, #0x50
  0x231992c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319930: cbnz     x24, #0x231993c
  0x2319934: mov      x0, x23
  0x2319938: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x231993c: mov      x0, x24
  0x2319940: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2319944: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
