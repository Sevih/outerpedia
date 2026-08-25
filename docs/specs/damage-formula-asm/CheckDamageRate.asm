; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CheckDamageRate @ 0x2cc0ca0..0x2cc13b8 (taille 1816 octets) =====
  0x2cc0ca0: sub      sp, sp, #0x50
  0x2cc0ca4: stp      x30, x25, [sp, #0x10]
  0x2cc0ca8: stp      x24, x23, [sp, #0x20]
  0x2cc0cac: stp      x22, x21, [sp, #0x30]
  0x2cc0cb0: stp      x20, x19, [sp, #0x40]
  0x2cc0cb4: adrp     x21, #0x59e9000
  0x2cc0cb8: ldrb     w8, [x21, #0xd67]
  0x2cc0cbc: mov      x19, x1
  0x2cc0cc0: mov      x20, x0
  0x2cc0cc4: tbnz     w8, #0, #0x2cc0cf4
  0x2cc0cc8: adrp     x0, #0x5598000
  0x2cc0ccc: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2cc0cd0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0cd4: adrp     x0, #0x5596000
  0x2cc0cd8: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc0cdc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0ce0: adrp     x0, #0x55d9000
  0x2cc0ce4: ldr      x0, [x0, #0xeb0] ; = 0x0 (u64 @ 0x55d9eb0)
  0x2cc0ce8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0cec: mov      w8, #1
  0x2cc0cf0: strb     w8, [x21, #0xd67]
  0x2cc0cf4: adrp     x23, #0x59e4000
  0x2cc0cf8: adrp     x25, #0x5596000
  0x2cc0cfc: ldrb     w8, [x23, #0xbd3]
  0x2cc0d00: ldr      x25, [x25, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc0d04: str      xzr, [sp, #8]
  0x2cc0d08: cbnz     w8, #0x2cc0d20
  0x2cc0d0c: adrp     x0, #0x5598000
  0x2cc0d10: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc0d14: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0d18: mov      w8, #1
  0x2cc0d1c: strb     w8, [x23, #0xbd3]
  0x2cc0d20: adrp     x24, #0x5598000
  0x2cc0d24: ldr      x24, [x24, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc0d28: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x2cc0d2c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc0d30: ldr      w9, [x0, #0xe0]
  0x2cc0d34: ldr      x8, [x8, #0xb8]
  0x2cc0d38: ldr      x21, [x8]
  0x2cc0d3c: cbnz     w9, #0x2cc0d44
  0x2cc0d40: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc0d44: mov      x0, x21
  0x2cc0d48: mov      x1, xzr
  0x2cc0d4c: mov      x2, xzr
  0x2cc0d50: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc0d54: tbz      w0, #0, #0x2cc0e30
  0x2cc0d58: ldrb     w8, [x23, #0xbd3]
  0x2cc0d5c: cbnz     w8, #0x2cc0d74
  0x2cc0d60: adrp     x0, #0x5598000
  0x2cc0d64: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc0d68: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0d6c: mov      w8, #1
  0x2cc0d70: strb     w8, [x23, #0xbd3]
  0x2cc0d74: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc0d78: ldr      x8, [x8, #0xb8]
  0x2cc0d7c: ldr      x0, [x8]
  0x2cc0d80: cbz      x0, #0x2cc13b4
  0x2cc0d84: mov      x1, xzr
  0x2cc0d88: bl       #0x259bed0 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cc0d8c: tbz      w0, #0, #0x2cc0e30
  0x2cc0d90: ldrb     w8, [x23, #0xbd3]
  0x2cc0d94: cbnz     w8, #0x2cc0dac
  0x2cc0d98: adrp     x0, #0x5598000
  0x2cc0d9c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc0da0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0da4: mov      w8, #1
  0x2cc0da8: strb     w8, [x23, #0xbd3]
  0x2cc0dac: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc0db0: ldr      x8, [x8, #0xb8]
  0x2cc0db4: ldr      x8, [x8]
  0x2cc0db8: cbz      x8, #0x2cc13b4
  0x2cc0dbc: ldrb     w8, [x8, #0x35]
  0x2cc0dc0: cbz      w8, #0x2cc0e30
  0x2cc0dc4: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x2cc0dc8: ldr      w8, [x0, #0xe0]
  0x2cc0dcc: cbnz     w8, #0x2cc0dd4
  0x2cc0dd0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc0dd4: mov      x0, x20
  0x2cc0dd8: mov      x1, xzr
  0x2cc0ddc: mov      x2, xzr
  0x2cc0de0: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc0de4: tbz      w0, #0, #0x2cc0e30
  0x2cc0de8: cbz      x20, #0x2cc13b4
  0x2cc0dec: mov      x0, x20
  0x2cc0df0: mov      x1, xzr
  0x2cc0df4: bl       #0x2814ac4 ; -> CCharacterBattle$$get_IsBoss
  0x2cc0df8: tbz      w0, #0, #0x2cc0e30
  0x2cc0dfc: cbz      x19, #0x2cc13b4
  0x2cc0e00: mov      x0, x19
  0x2cc0e04: mov      x1, xzr
  0x2cc0e08: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0e0c: cbz      x0, #0x2cc13b4
  0x2cc0e10: mov      w8, #1
  0x2cc0e14: str      w8, [x0, #0x3c]
  0x2cc0e18: mov      x0, x19
  0x2cc0e1c: mov      x1, xzr
  0x2cc0e20: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0e24: cbz      x0, #0x2cc13b4
  0x2cc0e28: mov      w8, #0x3e8
  0x2cc0e2c: b        #0x2cc1398
  0x2cc0e30: cbz      x19, #0x2cc13b4
  0x2cc0e34: mov      w1, #3
  0x2cc0e38: mov      x0, x19
  0x2cc0e3c: mov      x2, xzr
  0x2cc0e40: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2cc0e44: cbz      x0, #0x2cc0e78
  0x2cc0e48: mov      x0, x19
  0x2cc0e4c: mov      x1, xzr
  0x2cc0e50: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0e54: cbz      x0, #0x2cc13b4
  0x2cc0e58: mov      w8, #4
  0x2cc0e5c: str      w8, [x0, #0x3c]
  0x2cc0e60: mov      x0, x19
  0x2cc0e64: mov      x1, xzr
  0x2cc0e68: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0e6c: cbz      x0, #0x2cc13b4
  0x2cc0e70: mov      w8, wzr
  0x2cc0e74: b        #0x2cc1398
  0x2cc0e78: cbz      x20, #0x2cc13b4
  0x2cc0e7c: mov      x0, x20
  0x2cc0e80: mov      x1, xzr
  0x2cc0e84: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0e88: cbz      x0, #0x2cc13b4
  0x2cc0e8c: ldrb     w8, [x0, #0x34]
  0x2cc0e90: cbz      w8, #0x2cc0f50
  0x2cc0e94: mov      x0, x19
  0x2cc0e98: mov      x1, xzr
  0x2cc0e9c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0ea0: cbz      x0, #0x2cc13b4
  0x2cc0ea4: ldr      w8, [x0, #0x3c]
  0x2cc0ea8: cbz      w8, #0x2cc0f50
  0x2cc0eac: mov      x0, x19
  0x2cc0eb0: mov      x1, xzr
  0x2cc0eb4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0eb8: cbz      x0, #0x2cc13b4
  0x2cc0ebc: ldr      w21, [x0, #0x3c]
  0x2cc0ec0: mov      x0, x19
  0x2cc0ec4: mov      x1, xzr
  0x2cc0ec8: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0ecc: cbz      x0, #0x2cc13b4
  0x2cc0ed0: cmp      w21, #3
  0x2cc0ed4: b.eq     #0x2cc1278
  0x2cc0ed8: ldr      w21, [x0, #0x3c]
  0x2cc0edc: mov      x0, x19
  0x2cc0ee0: mov      x1, xzr
  0x2cc0ee4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0ee8: cmp      w21, #2
  0x2cc0eec: mov      x21, x0
  0x2cc0ef0: b.ne     #0x2cc1284
  0x2cc0ef4: ldr      x0, [x20, #0x28]
  0x2cc0ef8: cbz      x0, #0x2cc13b4
  0x2cc0efc: mov      x1, xzr
  0x2cc0f00: bl       #0x29094f0 ; -> CCharacterData$$get_CriticalDMGRate
  0x2cc0f04: cbz      x21, #0x2cc13b4
  0x2cc0f08: str      w0, [x21, #0x40]
  0x2cc0f0c: ldr      x0, [x19, #0x28]
  0x2cc0f10: cbz      x0, #0x2cc13b4
  0x2cc0f14: mov      x1, xzr
  0x2cc0f18: bl       #0x290a468 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cc0f1c: cbz      w0, #0x2cc1290
  0x2cc0f20: mov      x0, x19
  0x2cc0f24: mov      x1, xzr
  0x2cc0f28: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0f2c: cbz      x0, #0x2cc13b4
  0x2cc0f30: mov      x21, x0
  0x2cc0f34: ldr      x0, [x19, #0x28]
  0x2cc0f38: cbz      x0, #0x2cc13b4
  0x2cc0f3c: ldr      w22, [x21, #0x40]
  0x2cc0f40: mov      x1, xzr
  0x2cc0f44: bl       #0x290a468 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cc0f48: sub      w8, w22, w0
  0x2cc0f4c: b        #0x2cc128c
  0x2cc0f50: ldr      x0, [x19, #0x28]
  0x2cc0f54: cbz      x0, #0x2cc13b4
  0x2cc0f58: mov      x1, xzr
  0x2cc0f5c: bl       #0x2909a18 ; -> CCharacterData$$get_Avoid
  0x2cc0f60: cmp      w0, #1
  0x2cc0f64: b.lt     #0x2cc0f80
  0x2cc0f68: mov      w21, w0
  0x2cc0f6c: mov      w1, #0x3e8
  0x2cc0f70: mov      w0, wzr
  0x2cc0f74: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x2cc0f78: cmp      w0, w21
  0x2cc0f7c: b.le     #0x2cc1040
  0x2cc0f80: ldr      x0, [x20, #0x28]
  0x2cc0f84: cbz      x0, #0x2cc13b4
  0x2cc0f88: mov      x1, xzr
  0x2cc0f8c: bl       #0x2909414 ; -> CCharacterData$$get_CriticalRate
  0x2cc0f90: cmp      w0, #1
  0x2cc0f94: b.lt     #0x2cc1080
  0x2cc0f98: mov      w21, w0
  0x2cc0f9c: mov      w1, #0x3e8
  0x2cc0fa0: mov      w0, wzr
  0x2cc0fa4: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x2cc0fa8: mov      w22, w0
  0x2cc0fac: mov      x0, x19
  0x2cc0fb0: mov      x1, xzr
  0x2cc0fb4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0fb8: cbz      x0, #0x2cc13b4
  0x2cc0fbc: cmp      w22, w21
  0x2cc0fc0: b.gt     #0x2cc1090
  0x2cc0fc4: mov      w8, #2
  0x2cc0fc8: str      w8, [x0, #0x3c]
  0x2cc0fcc: mov      x0, x19
  0x2cc0fd0: mov      x1, xzr
  0x2cc0fd4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc0fd8: ldr      x8, [x20, #0x28]
  0x2cc0fdc: cbz      x8, #0x2cc13b4
  0x2cc0fe0: mov      x21, x0
  0x2cc0fe4: mov      x0, x8
  0x2cc0fe8: mov      x1, xzr
  0x2cc0fec: bl       #0x29094f0 ; -> CCharacterData$$get_CriticalDMGRate
  0x2cc0ff0: cbz      x21, #0x2cc13b4
  0x2cc0ff4: str      w0, [x21, #0x40]
  0x2cc0ff8: ldr      x0, [x19, #0x28]
  0x2cc0ffc: cbz      x0, #0x2cc13b4
  0x2cc1000: mov      x1, xzr
  0x2cc1004: bl       #0x290a468 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cc1008: cbz      w0, #0x2cc10b0
  0x2cc100c: mov      x0, x19
  0x2cc1010: mov      x1, xzr
  0x2cc1014: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1018: cbz      x0, #0x2cc13b4
  0x2cc101c: mov      x21, x0
  0x2cc1020: ldr      x0, [x19, #0x28]
  0x2cc1024: cbz      x0, #0x2cc13b4
  0x2cc1028: ldr      w22, [x21, #0x40]
  0x2cc102c: mov      x1, xzr
  0x2cc1030: bl       #0x290a468 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cc1034: sub      w8, w22, w0
  0x2cc1038: str      w8, [x21, #0x40]
  0x2cc103c: b        #0x2cc10b0
  0x2cc1040: adrp     x8, #0x5598000
  0x2cc1044: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2cc1048: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2cc104c: ldr      w8, [x0, #0xe0]
  0x2cc1050: cbnz     w8, #0x2cc1058
  0x2cc1054: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc1058: adrp     x8, #0x55d9000
  0x2cc105c: ldr      x8, [x8, #0xeb0] ; = 0x0 (u64 @ 0x55d9eb0)
  0x2cc1060: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc1064: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x2cc1068: mov      x0, x19
  0x2cc106c: mov      x1, xzr
  0x2cc1070: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1074: cbz      x0, #0x2cc13b4
  0x2cc1078: mov      w8, #3
  0x2cc107c: b        #0x2cc1094
  0x2cc1080: mov      x0, x19
  0x2cc1084: mov      x1, xzr
  0x2cc1088: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc108c: cbz      x0, #0x2cc13b4
  0x2cc1090: mov      w8, #1
  0x2cc1094: str      w8, [x0, #0x3c]
  0x2cc1098: mov      x0, x19
  0x2cc109c: mov      x1, xzr
  0x2cc10a0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc10a4: cbz      x0, #0x2cc13b4
  0x2cc10a8: mov      w8, #0x3e8
  0x2cc10ac: str      w8, [x0, #0x40]
  0x2cc10b0: ldrb     w8, [x23, #0xbd3]
  0x2cc10b4: cbnz     w8, #0x2cc10cc
  0x2cc10b8: adrp     x0, #0x5598000
  0x2cc10bc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc10c0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc10c4: mov      w8, #1
  0x2cc10c8: strb     w8, [x23, #0xbd3]
  0x2cc10cc: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc10d0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x2cc10d4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc10d8: ldr      w9, [x0, #0xe0]
  0x2cc10dc: ldr      x21, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc10e0: cbnz     w9, #0x2cc10e8
  0x2cc10e4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc10e8: mov      x0, x21
  0x2cc10ec: mov      x1, xzr
  0x2cc10f0: mov      x2, xzr
  0x2cc10f4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc10f8: tbz      w0, #0, #0x2cc1198
  0x2cc10fc: ldrb     w8, [x23, #0xbd3]
  0x2cc1100: cbnz     w8, #0x2cc1118
  0x2cc1104: adrp     x0, #0x5598000
  0x2cc1108: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc110c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1110: mov      w8, #1
  0x2cc1114: strb     w8, [x23, #0xbd3]
  0x2cc1118: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc111c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc1120: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc1124: cbz      x0, #0x2cc13b4
  0x2cc1128: mov      x1, xzr
  0x2cc112c: bl       #0x259bed0 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cc1130: tbz      w0, #0, #0x2cc1198
  0x2cc1134: ldrb     w8, [x23, #0xbd3]
  0x2cc1138: cbnz     w8, #0x2cc1150
  0x2cc113c: adrp     x0, #0x5598000
  0x2cc1140: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc1144: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1148: mov      w8, #1
  0x2cc114c: strb     w8, [x23, #0xbd3]
  0x2cc1150: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc1154: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc1158: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc115c: cbz      x8, #0x2cc13b4
  0x2cc1160: ldrb     w8, [x8, #0x34]
  0x2cc1164: cbz      w8, #0x2cc1198
  0x2cc1168: mov      x0, x19
  0x2cc116c: mov      x1, xzr
  0x2cc1170: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1174: cbz      x0, #0x2cc13b4
  0x2cc1178: mov      w8, #1
  0x2cc117c: str      w8, [x0, #0x3c]
  0x2cc1180: mov      x0, x19
  0x2cc1184: mov      x1, xzr
  0x2cc1188: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc118c: cbz      x0, #0x2cc13b4
  0x2cc1190: mov      w8, #0x3e8
  0x2cc1194: str      w8, [x0, #0x40]
  0x2cc1198: ldrb     w8, [x23, #0xbd3]
  0x2cc119c: cbnz     w8, #0x2cc11b4
  0x2cc11a0: adrp     x0, #0x5598000
  0x2cc11a4: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc11a8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc11ac: mov      w8, #1
  0x2cc11b0: strb     w8, [x23, #0xbd3]
  0x2cc11b4: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc11b8: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x2cc11bc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc11c0: ldr      w9, [x0, #0xe0]
  0x2cc11c4: ldr      x21, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc11c8: cbnz     w9, #0x2cc11d0
  0x2cc11cc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc11d0: mov      x0, x21
  0x2cc11d4: mov      x1, xzr
  0x2cc11d8: mov      x2, xzr
  0x2cc11dc: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc11e0: tbz      w0, #0, #0x2cc1290
  0x2cc11e4: ldrb     w8, [x23, #0xbd3]
  0x2cc11e8: cbnz     w8, #0x2cc1200
  0x2cc11ec: adrp     x0, #0x5598000
  0x2cc11f0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc11f4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc11f8: mov      w8, #1
  0x2cc11fc: strb     w8, [x23, #0xbd3]
  0x2cc1200: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc1204: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc1208: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc120c: cbz      x0, #0x2cc13b4
  0x2cc1210: mov      x1, xzr
  0x2cc1214: bl       #0x259bf64 ; -> CDungeonScene$$get_IsIrregularInfiltrate
  0x2cc1218: tbz      w0, #0, #0x2cc1290
  0x2cc121c: ldrb     w8, [x23, #0xbd3]
  0x2cc1220: cbnz     w8, #0x2cc1238
  0x2cc1224: adrp     x0, #0x5598000
  0x2cc1228: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc122c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1230: mov      w8, #1
  0x2cc1234: strb     w8, [x23, #0xbd3]
  0x2cc1238: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2cc123c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55d90b8)
  0x2cc1240: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc1244: cbz      x8, #0x2cc13b4
  0x2cc1248: ldrb     w8, [x8, #0x38]
  0x2cc124c: cbz      w8, #0x2cc1290
  0x2cc1250: mov      x0, x19
  0x2cc1254: mov      x1, xzr
  0x2cc1258: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc125c: cbz      x0, #0x2cc13b4
  0x2cc1260: mov      w8, #1
  0x2cc1264: str      w8, [x0, #0x3c]
  0x2cc1268: mov      x0, x19
  0x2cc126c: mov      x1, xzr
  0x2cc1270: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1274: cbz      x0, #0x2cc13b4
  0x2cc1278: mov      w8, #0x3e8
  0x2cc127c: str      w8, [x0, #0x40]
  0x2cc1280: b        #0x2cc1290
  0x2cc1284: cbz      x21, #0x2cc13b4
  0x2cc1288: mov      w8, #0x3e8
  0x2cc128c: str      w8, [x21, #0x40]
  0x2cc1290: add      x1, sp, #0xc
  0x2cc1294: mov      x0, x20
  0x2cc1298: mov      x2, x19
  0x2cc129c: mov      x3, xzr
  0x2cc12a0: bl       #0x282d838 ; -> CCharacterBattle$$FindBuffAdditionalDamage
  0x2cc12a4: ldr      w8, [sp, #0xc]
  0x2cc12a8: cbz      w8, #0x2cc12cc
  0x2cc12ac: mov      x0, x19
  0x2cc12b0: mov      x1, xzr
  0x2cc12b4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc12b8: cbz      x0, #0x2cc13b4
  0x2cc12bc: ldr      w8, [x0, #0x40]
  0x2cc12c0: ldr      w9, [sp, #0xc]
  0x2cc12c4: add      w8, w9, w8
  0x2cc12c8: str      w8, [x0, #0x40]
  0x2cc12cc: add      x1, sp, #8
  0x2cc12d0: mov      x0, x19
  0x2cc12d4: mov      x2, x20
  0x2cc12d8: mov      x3, xzr
  0x2cc12dc: bl       #0x282ecf0 ; -> CCharacterBattle$$FindBuffDamageReduce
  0x2cc12e0: ldr      w8, [sp, #8]
  0x2cc12e4: cbz      w8, #0x2cc1308
  0x2cc12e8: mov      x0, x19
  0x2cc12ec: mov      x1, xzr
  0x2cc12f0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc12f4: cbz      x0, #0x2cc13b4
  0x2cc12f8: ldr      w8, [x0, #0x40]
  0x2cc12fc: ldr      w9, [sp, #8]
  0x2cc1300: sub      w8, w8, w9
  0x2cc1304: str      w8, [x0, #0x40]
  0x2cc1308: mov      x0, x19
  0x2cc130c: mov      x1, xzr
  0x2cc1310: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1314: cbz      x0, #0x2cc13b4
  0x2cc1318: mov      x21, x0
  0x2cc131c: ldr      x0, [x20, #0x28]
  0x2cc1320: cbz      x0, #0x2cc13b4
  0x2cc1324: ldr      w20, [x21, #0x40]
  0x2cc1328: mov      x1, xzr
  0x2cc132c: bl       #0x290a38c ; -> CCharacterData$$get_DMGBoost
  0x2cc1330: add      w8, w0, w20
  0x2cc1334: mov      x0, x19
  0x2cc1338: mov      x1, xzr
  0x2cc133c: str      w8, [x21, #0x40]
  0x2cc1340: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1344: cbz      x0, #0x2cc13b4
  0x2cc1348: mov      x20, x0
  0x2cc134c: ldr      x0, [x19, #0x28]
  0x2cc1350: cbz      x0, #0x2cc13b4
  0x2cc1354: ldr      w21, [x20, #0x40]
  0x2cc1358: mov      x1, xzr
  0x2cc135c: bl       #0x2909338 ; -> CCharacterData$$get_DMGReduceRate
  0x2cc1360: sub      w8, w21, w0
  0x2cc1364: mov      x0, x19
  0x2cc1368: mov      x1, xzr
  0x2cc136c: str      w8, [x20, #0x40]
  0x2cc1370: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1374: cbz      x0, #0x2cc13b4
  0x2cc1378: ldr      w8, [x0, #0x40]
  0x2cc137c: cmp      w8, #0x12b
  0x2cc1380: b.gt     #0x2cc139c
  0x2cc1384: mov      x0, x19
  0x2cc1388: mov      x1, xzr
  0x2cc138c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1390: cbz      x0, #0x2cc13b4
  0x2cc1394: mov      w8, #0x12c
  0x2cc1398: str      w8, [x0, #0x40]
  0x2cc139c: ldp      x20, x19, [sp, #0x40]
  0x2cc13a0: ldp      x22, x21, [sp, #0x30]
  0x2cc13a4: ldp      x24, x23, [sp, #0x20]
  0x2cc13a8: ldp      x30, x25, [sp, #0x10]
  0x2cc13ac: add      sp, sp, #0x50
  0x2cc13b0: ret      
  0x2cc13b4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
