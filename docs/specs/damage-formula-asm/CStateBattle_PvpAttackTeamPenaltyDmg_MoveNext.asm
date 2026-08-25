; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStateBattle_PvpAttackTeamPenaltyDmg_MoveNext @ 0x2610b10..0x2610ebc (taille 940 octets) =====
  0x2610b10: stp      x30, x23, [sp, #-0x30]!
  0x2610b14: stp      x22, x21, [sp, #0x10]
  0x2610b18: stp      x20, x19, [sp, #0x20]
  0x2610b1c: adrp     x20, #0x59e6000
  0x2610b20: ldrb     w8, [x20, #0x596]
  0x2610b24: mov      x19, x0
  0x2610b28: tbnz     w8, #0, #0x2610b70
  0x2610b2c: adrp     x0, #0x5599000
  0x2610b30: ldr      x0, [x0, #0xfb8] ; = 0x0 (u64 @ 0x5599fb8)
  0x2610b34: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610b38: adrp     x0, #0x559a000
  0x2610b3c: ldr      x0, [x0, #0x7d8] ; = 0x0 (u64 @ 0x559a7d8)
  0x2610b40: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610b44: adrp     x0, #0x55ae000
  0x2610b48: ldr      x0, [x0, #0xa70] ; = 0x0 (u64 @ 0x55aea70)
  0x2610b4c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610b50: adrp     x0, #0x55ae000
  0x2610b54: ldr      x0, [x0, #0xa78] ; = 0x0 (u64 @ 0x55aea78)
  0x2610b58: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610b5c: adrp     x0, #0x5598000
  0x2610b60: ldr      x0, [x0, #0xe38] ; = 0x0 (u64 @ 0x5598e38)
  0x2610b64: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610b68: mov      w8, #1
  0x2610b6c: strb     w8, [x20, #0x596]
  0x2610b70: ldr      w8, [x19, #0x10]
  0x2610b74: cmp      w8, #3
  0x2610b78: b.hi     #0x2610dd8
  0x2610b7c: ldr      x20, [x19, #0x28]
  0x2610b80: adrp     x9, #0x1071000
  0x2610b84: add      x9, x9, #0x1bc
  0x2610b88: adr      x10, #0x2610b98
  0x2610b8c: ldrb     w11, [x9, x8]
  0x2610b90: add      x10, x10, x11, lsl #2
  0x2610b94: br       x10
  0x2610b98: ldr      w8, [x19, #0x20]
  0x2610b9c: mov      w9, #-1
  0x2610ba0: str      w9, [x19, #0x10]
  0x2610ba4: str      w8, [x19, #0x38]
  0x2610ba8: cbz      x20, #0x2610eb8
  0x2610bac: ldrb     w8, [x20, #0x98]
  0x2610bb0: cbnz     w8, #0x2610dec
  0x2610bb4: adrp     x8, #0x55ae000
  0x2610bb8: ldr      x8, [x8, #0xa78] ; = 0x0 (u64 @ 0x55aea78)
  0x2610bbc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x2610bc0: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2610bc4: mov      x1, xzr
  0x2610bc8: mov      x22, x0
  0x2610bcc: bl       #0x4955ea4 ; -> System.Object$$.ctor
  0x2610bd0: mov      x21, x19
  0x2610bd4: str      x22, [x21, #0x30]!
  0x2610bd8: mov      x0, x21
  0x2610bdc: mov      x1, x22
  0x2610be0: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2610be4: mov      w8, #1
  0x2610be8: strb     w8, [x20, #0x98]
  0x2610bec: ldr      x9, [x21]
  0x2610bf0: cbz      x9, #0x2610eb8
  0x2610bf4: mov      x0, xzr
  0x2610bf8: strb     w8, [x9, #0x10]
  0x2610bfc: bl       #0x26d65b4 ; -> CUIManager$$get_Instance
  0x2610c00: adrp     x22, #0x559a000
  0x2610c04: ldr      x22, [x22, #0x7d8] ; = 0x0 (u64 @ 0x559a7d8)
  0x2610c08: mov      x20, x0
  0x2610c0c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x559a000)
  0x2610c10: ldr      w9, [x8, #0xe0]
  0x2610c14: cbnz     w9, #0x2610c24
  0x2610c18: mov      x0, x8
  0x2610c1c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2610c20: ldr      x8, [x22] ; = 0x0 (u64 @ 0x559a000)
  0x2610c24: adrp     x9, #0x5599000
  0x2610c28: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55ae0b8)
  0x2610c2c: ldr      x23, [x21]
  0x2610c30: ldr      x9, [x9, #0xfb8] ; = 0x0 (u64 @ 0x5599fb8)
  0x2610c34: ldr      w21, [x8, #0x5ac]
  0x2610c38: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5599000)
  0x2610c3c: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2610c40: adrp     x8, #0x55ae000
  0x2610c44: ldr      x8, [x8, #0xa70] ; = 0x0 (u64 @ 0x55aea70)
  0x2610c48: mov      x1, x23
  0x2610c4c: mov      x3, xzr
  0x2610c50: mov      x22, x0
  0x2610c54: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x2610c58: bl       #0x487ee08 ; -> System.Action$$.ctor
  0x2610c5c: cbz      x20, #0x2610eb8
  0x2610c60: fmov     s0, #2.00000000
  0x2610c64: mov      x0, x20
  0x2610c68: mov      w1, w21
  0x2610c6c: mov      x2, x22
  0x2610c70: mov      x3, xzr
  0x2610c74: bl       #0x26e3634 ; -> CUIManager$$SimpleMessage
  0x2610c78: b        #0x2610c84
  0x2610c7c: mov      w8, #-1
  0x2610c80: str      w8, [x19, #0x10]
  0x2610c84: mov      x0, x19
  0x2610c88: ldr      x8, [x0, #0x30]!
  0x2610c8c: cbz      x8, #0x2610eb8
  0x2610c90: ldrb     w8, [x8, #0x10]
  0x2610c94: cbz      w8, #0x2610de0
  0x2610c98: str      xzr, [x19, #0x18]!
  0x2610c9c: mov      x0, x19
  0x2610ca0: mov      x1, xzr
  0x2610ca4: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2610ca8: mov      w0, #1
  0x2610cac: stur     w0, [x19, #-8]
  0x2610cb0: b        #0x2610ea8
  0x2610cb4: mov      w8, #-1
  0x2610cb8: str      w8, [x19, #0x10]
  0x2610cbc: adrp     x21, #0x59e4000
  0x2610cc0: ldrb     w8, [x21, #0xbd3]
  0x2610cc4: cbnz     w8, #0x2610cdc
  0x2610cc8: adrp     x0, #0x5598000
  0x2610ccc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610cd0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610cd4: mov      w8, #1
  0x2610cd8: strb     w8, [x21, #0xbd3]
  0x2610cdc: adrp     x22, #0x5598000
  0x2610ce0: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610ce4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2610ce8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55ae0b8)
  0x2610cec: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x2610cf0: cbz      x8, #0x2610eb8
  0x2610cf4: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x55ae090)
  0x2610cf8: add      x20, x19, #0x38
  0x2610cfc: mov      x1, x20
  0x2610d00: mov      x2, xzr
  0x2610d04: bl       #0x251ff74 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|81_1
  0x2610d08: ldrb     w8, [x21, #0xbd3]
  0x2610d0c: cbnz     w8, #0x2610d24
  0x2610d10: adrp     x0, #0x5598000
  0x2610d14: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610d18: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610d1c: mov      w8, #1
  0x2610d20: strb     w8, [x21, #0xbd3]
  0x2610d24: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2610d28: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55ae0b8)
  0x2610d2c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x2610d30: cbz      x8, #0x2610eb8
  0x2610d34: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x55ae098)
  0x2610d38: mov      x1, x20
  0x2610d3c: mov      x2, xzr
  0x2610d40: bl       #0x251ff74 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|81_1
  0x2610d44: adrp     x8, #0x5598000
  0x2610d48: ldr      x8, [x8, #0xe38] ; = 0x0 (u64 @ 0x5598e38)
  0x2610d4c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610d50: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2610d54: fmov     s0, #2.00000000
  0x2610d58: mov      x1, xzr
  0x2610d5c: mov      x20, x0
  0x2610d60: bl       #0x504ba88 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x2610d64: str      x20, [x19, #0x18]!
  0x2610d68: mov      x0, x19
  0x2610d6c: mov      x1, x20
  0x2610d70: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2610d74: mov      w8, #3
  0x2610d78: b        #0x2610ea0
  0x2610d7c: mov      w8, #-1
  0x2610d80: str      w8, [x19, #0x10]
  0x2610d84: adrp     x19, #0x59e4000
  0x2610d88: ldrb     w8, [x19, #0xbd3]
  0x2610d8c: cbnz     w8, #0x2610da4
  0x2610d90: adrp     x0, #0x5598000
  0x2610d94: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610d98: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610d9c: mov      w8, #1
  0x2610da0: strb     w8, [x19, #0xbd3]
  0x2610da4: adrp     x8, #0x5598000
  0x2610da8: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610dac: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610db0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2610db4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610db8: cbz      x0, #0x2610eb8
  0x2610dbc: mov      x1, xzr
  0x2610dc0: bl       #0x25a609c ; -> CDungeonScene$$UpdatePvpTurnPenalty
  0x2610dc4: cbz      x20, #0x2610eb8
  0x2610dc8: mov      w1, #7
  0x2610dcc: mov      x0, x20
  0x2610dd0: mov      x2, xzr
  0x2610dd4: bl       #0x250cd60 ; -> CStateBattle$$ChangeSubState
  0x2610dd8: mov      w0, wzr
  0x2610ddc: b        #0x2610ea8
  0x2610de0: mov      x1, xzr
  0x2610de4: str      xzr, [x0]
  0x2610de8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2610dec: adrp     x20, #0x59e4000
  0x2610df0: ldrb     w8, [x20, #0xbd3]
  0x2610df4: cbnz     w8, #0x2610e0c
  0x2610df8: adrp     x0, #0x5598000
  0x2610dfc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610e00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610e04: mov      w8, #1
  0x2610e08: strb     w8, [x20, #0xbd3]
  0x2610e0c: adrp     x21, #0x5598000
  0x2610e10: ldr      x21, [x21, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610e14: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2610e18: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2610e1c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610e20: cbz      x8, #0x2610eb8
  0x2610e24: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x5598090)
  0x2610e28: mov      x1, xzr
  0x2610e2c: bl       #0x251fd90 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|81_0
  0x2610e30: ldrb     w8, [x20, #0xbd3]
  0x2610e34: cbnz     w8, #0x2610e4c
  0x2610e38: adrp     x0, #0x5598000
  0x2610e3c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2610e40: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2610e44: mov      w8, #1
  0x2610e48: strb     w8, [x20, #0xbd3]
  0x2610e4c: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2610e50: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2610e54: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610e58: cbz      x8, #0x2610eb8
  0x2610e5c: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x5598098)
  0x2610e60: mov      x1, xzr
  0x2610e64: bl       #0x251fd90 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|81_0
  0x2610e68: adrp     x8, #0x5598000
  0x2610e6c: ldr      x8, [x8, #0xe38] ; = 0x0 (u64 @ 0x5598e38)
  0x2610e70: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2610e74: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2610e78: adrp     x8, #0x1070000
  0x2610e7c: ldr      s0, [x8, #0x688] ; = 0.20000000298023224 (f32 @ 0x1070688)
  0x2610e80: mov      x1, xzr
  0x2610e84: mov      x20, x0
  0x2610e88: bl       #0x504ba88 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x2610e8c: str      x20, [x19, #0x18]!
  0x2610e90: mov      x0, x19
  0x2610e94: mov      x1, x20
  0x2610e98: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2610e9c: mov      w8, #2
  0x2610ea0: stur     w8, [x19, #-8]
  0x2610ea4: mov      w0, #1
  0x2610ea8: ldp      x20, x19, [sp, #0x20]
  0x2610eac: ldp      x22, x21, [sp, #0x10]
  0x2610eb0: ldp      x30, x23, [sp], #0x30
  0x2610eb4: ret      
  0x2610eb8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
