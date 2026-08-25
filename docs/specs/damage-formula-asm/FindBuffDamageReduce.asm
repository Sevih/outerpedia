; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== FindBuffDamageReduce @ 0x282ecf0..0x282f370 (taille 1664 octets) =====
  0x282ecf0: sub      sp, sp, #0xd0
  0x282ecf4: stp      x29, x30, [sp, #0x70]
  0x282ecf8: stp      x28, x27, [sp, #0x80]
  0x282ecfc: stp      x26, x25, [sp, #0x90]
  0x282ed00: stp      x24, x23, [sp, #0xa0]
  0x282ed04: stp      x22, x21, [sp, #0xb0]
  0x282ed08: stp      x20, x19, [sp, #0xc0]
  0x282ed0c: adrp     x22, #0x59e7000
  0x282ed10: ldrb     w8, [x22, #0x6df]
  0x282ed14: mov      x20, x2
  0x282ed18: mov      x29, x1
  0x282ed1c: mov      x21, x0
  0x282ed20: tbnz     w8, #0, #0x282eda4
  0x282ed24: adrp     x0, #0x5598000
  0x282ed28: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282ed2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed30: adrp     x0, #0x5598000
  0x282ed34: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282ed38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed3c: adrp     x0, #0x5598000
  0x282ed40: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282ed44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed48: adrp     x0, #0x5598000
  0x282ed4c: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282ed50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed54: adrp     x0, #0x5598000
  0x282ed58: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282ed5c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed60: adrp     x0, #0x5598000
  0x282ed64: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x282ed68: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed6c: adrp     x0, #0x5598000
  0x282ed70: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x282ed74: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed78: adrp     x0, #0x5598000
  0x282ed7c: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282ed80: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed84: adrp     x0, #0x5598000
  0x282ed88: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282ed8c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed90: adrp     x0, #0x5596000
  0x282ed94: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282ed98: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282ed9c: mov      w8, #1
  0x282eda0: strb     w8, [x22, #0x6df]
  0x282eda4: stp      xzr, xzr, [sp, #0x50]
  0x282eda8: str      xzr, [sp, #0x60]
  0x282edac: stp      xzr, xzr, [sp, #0x30]
  0x282edb0: str      xzr, [sp, #0x40]
  0x282edb4: ldr      x0, [x21, #0x380]
  0x282edb8: cbz      x0, #0x282f234
  0x282edbc: adrp     x8, #0x5598000
  0x282edc0: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282edc4: adrp     x28, #0x5598000
  0x282edc8: adrp     x25, #0x5596000
  0x282edcc: adrp     x27, #0x5598000
  0x282edd0: adrp     x26, #0x5598000
  0x282edd4: ldr      x28, [x28, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282edd8: ldr      x25, [x25, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282eddc: ldr      x27, [x27, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282ede0: ldr      x26, [x26, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282ede4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282ede8: adrp     x24, #0x5598000
  0x282edec: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282edf0: add      x8, sp, #0x18
  0x282edf4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282edf8: ldur     q0, [sp, #0x18]
  0x282edfc: ldr      x8, [sp, #0x28]
  0x282ee00: mov      w23, wzr
  0x282ee04: str      q0, [sp, #0x50]
  0x282ee08: str      x8, [sp, #0x60]
  0x282ee0c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5598000)
  0x282ee10: add      x0, sp, #0x50
  0x282ee14: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282ee18: tbz      w0, #0, #0x282f0dc
  0x282ee1c: ldr      x21, [sp, #0x60]
  0x282ee20: cbz      x21, #0x282f198
  0x282ee24: mov      x0, x21
  0x282ee28: mov      x1, xzr
  0x282ee2c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282ee30: cmp      w0, #0x73
  0x282ee34: b.ne     #0x282ee84
  0x282ee38: mov      w2, #0x17
  0x282ee3c: mov      x0, x21
  0x282ee40: mov      x1, x20
  0x282ee44: mov      x3, xzr
  0x282ee48: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282ee4c: tbz      w0, #0, #0x282ee84
  0x282ee50: mov      x0, x21
  0x282ee54: mov      x1, xzr
  0x282ee58: bl       #0x2325450 ; -> CBuff$$get_ApplyingType
  0x282ee5c: cmp      w0, #2
  0x282ee60: b.ne     #0x282ee0c
  0x282ee64: mov      x0, x21
  0x282ee68: mov      x1, xzr
  0x282ee6c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282ee70: add      w23, w0, w23
  0x282ee74: mov      x0, x21
  0x282ee78: mov      x1, xzr
  0x282ee7c: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282ee80: b        #0x282ee0c
  0x282ee84: mov      x0, x21
  0x282ee88: mov      x1, xzr
  0x282ee8c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282ee90: cmp      w0, #0x9a
  0x282ee94: b.ne     #0x282eed8
  0x282ee98: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x282ee9c: ldr      w8, [x0, #0xe0]
  0x282eea0: cbnz     w8, #0x282eea8
  0x282eea4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282eea8: mov      x0, x20
  0x282eeac: mov      x1, xzr
  0x282eeb0: mov      x2, xzr
  0x282eeb4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282eeb8: tbz      w0, #0, #0x282eed8
  0x282eebc: cbz      x20, #0x282f1b8
  0x282eec0: mov      x0, x20
  0x282eec4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282eec8: cbz      x0, #0x282f1a8
  0x282eecc: ldr      w8, [x0, #0x20]
  0x282eed0: cmp      w8, #1
  0x282eed4: b.ne     #0x282f02c
  0x282eed8: mov      x0, x21
  0x282eedc: mov      x1, xzr
  0x282eee0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282eee4: cmp      w0, #0x76
  0x282eee8: b.ne     #0x282efc8
  0x282eeec: mov      w2, #0x17
  0x282eef0: mov      x0, x21
  0x282eef4: mov      x1, x20
  0x282eef8: mov      x3, xzr
  0x282eefc: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282ef00: tbz      w0, #0, #0x282efc8
  0x282ef04: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x282ef08: ldr      x22, [x21, #0x20]
  0x282ef0c: ldr      w8, [x0, #0xe0]
  0x282ef10: cbnz     w8, #0x282ef18
  0x282ef14: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282ef18: mov      x0, x22
  0x282ef1c: mov      x1, xzr
  0x282ef20: mov      x2, xzr
  0x282ef24: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282ef28: tbnz     w0, #0, #0x282ee0c
  0x282ef2c: ldr      x0, [x21, #0x20]
  0x282ef30: cbz      x0, #0x282f1e8
  0x282ef34: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x282ef38: cbz      x8, #0x282ee0c
  0x282ef3c: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x282ef40: cbz      x0, #0x282ee0c
  0x282ef44: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5596010)
  0x282ef48: cbz      x0, #0x282f238
  0x282ef4c: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5598000)
  0x282ef50: mov      x24, x29
  0x282ef54: mov      x19, x27
  0x282ef58: add      x8, sp, #0x18
  0x282ef5c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282ef60: ldur     q0, [sp, #0x18]
  0x282ef64: ldr      x8, [sp, #0x28]
  0x282ef68: mov      w27, wzr
  0x282ef6c: str      q0, [sp, #0x30]
  0x282ef70: str      x8, [sp, #0x40]
  0x282ef74: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x282ef78: add      x0, sp, #0x30
  0x282ef7c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282ef80: tbz      w0, #0, #0x282f040
  0x282ef84: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x282ef88: ldr      x22, [sp, #0x40]
  0x282ef8c: ldr      w8, [x0, #0xe0]
  0x282ef90: cbnz     w8, #0x282ef98
  0x282ef94: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282ef98: mov      x0, x22
  0x282ef9c: mov      x1, xzr
  0x282efa0: mov      x2, xzr
  0x282efa4: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282efa8: tbnz     w0, #0, #0x282ef74
  0x282efac: cbz      x22, #0x282f0a0
  0x282efb0: mov      x0, x22
  0x282efb4: mov      x1, xzr
  0x282efb8: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x282efbc: and      w8, w0, #1
  0x282efc0: add      w27, w27, w8
  0x282efc4: b        #0x282ef74
  0x282efc8: mov      x0, x21
  0x282efcc: mov      x1, xzr
  0x282efd0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282efd4: cmp      w0, #0x3e
  0x282efd8: b.ne     #0x282ee0c
  0x282efdc: mov      w2, #0x17
  0x282efe0: mov      x0, x21
  0x282efe4: mov      x1, xzr
  0x282efe8: mov      x3, xzr
  0x282efec: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282eff0: tbz      w0, #0, #0x282ee0c
  0x282eff4: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x282eff8: ldr      w8, [x0, #0xe0]
  0x282effc: cbnz     w8, #0x282f004
  0x282f000: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282f004: mov      x0, xzr
  0x282f008: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x282f00c: cbz      x0, #0x282f1d8
  0x282f010: mov      w1, #0xd7
  0x282f014: mov      x2, xzr
  0x282f018: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x282f01c: cbz      x0, #0x282f1c8
  0x282f020: ldr      w8, [x0, #0x14]
  0x282f024: add      w23, w8, w23
  0x282f028: b        #0x282ee0c
  0x282f02c: mov      x0, x21
  0x282f030: mov      x1, xzr
  0x282f034: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f038: add      w23, w0, w23
  0x282f03c: b        #0x282ee0c
  0x282f040: mov      x22, xzr
  0x282f044: mov      w29, #9
  0x282f048: adrp     x8, #0x5598000
  0x282f04c: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282f050: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282f054: add      x0, sp, #0x30
  0x282f058: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f05c: cbnz     x22, #0x282f248
  0x282f060: cmp      w29, #9
  0x282f064: b.eq     #0x282f06c
  0x282f068: cbnz     w29, #0x282f180
  0x282f06c: mov      x0, x21
  0x282f070: mov      x1, xzr
  0x282f074: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f078: sub      w8, w27, #1
  0x282f07c: madd     w23, w0, w8, w23
  0x282f080: mov      x29, x24
  0x282f084: adrp     x24, #0x5598000
  0x282f088: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282f08c: mov      x0, x21
  0x282f090: mov      x1, xzr
  0x282f094: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282f098: mov      x27, x19
  0x282f09c: b        #0x282ee0c
  0x282f0a0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f0a4: b        #0x282f250
  0x282f0a8: b        #0x282f0b8
  0x282f0ac: b        #0x282f0b8
  0x282f0b0: b        #0x282f0b8
  0x282f0b4: b        #0x282f0b8
  0x282f0b8: cmp      w1, #1
  0x282f0bc: stp      x1, x0, [sp, #8]
  0x282f0c0: b.ne     #0x282f1f8
  0x282f0c4: ldr      x0, [sp, #0x10]
  0x282f0c8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282f0cc: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x282f0d0: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282f0d4: mov      w29, wzr
  0x282f0d8: b        #0x282f048
  0x282f0dc: adrp     x8, #0x5598000
  0x282f0e0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f0e4: add      x0, sp, #0x50
  0x282f0e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282f0ec: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f0f0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x282f0f4: ldr      w8, [x0, #0xe0]
  0x282f0f8: cbnz     w8, #0x282f100
  0x282f0fc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282f100: mov      x0, x20
  0x282f104: mov      x1, xzr
  0x282f108: mov      x2, xzr
  0x282f10c: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282f110: tbz      w0, #0, #0x282f15c
  0x282f114: cbz      x20, #0x282f234
  0x282f118: mov      w1, #0x3e
  0x282f11c: mov      x0, x20
  0x282f120: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x282f124: cbz      x0, #0x282f15c
  0x282f128: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x282f12c: ldr      w8, [x0, #0xe0]
  0x282f130: cbnz     w8, #0x282f138
  0x282f134: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282f138: mov      x0, xzr
  0x282f13c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x282f140: cbz      x0, #0x282f234
  0x282f144: mov      w1, #0xd7
  0x282f148: mov      x2, xzr
  0x282f14c: bl       #0x262bcf0 ; -> CTempletManager$$GetGameConfig
  0x282f150: cbz      x0, #0x282f234
  0x282f154: ldr      w8, [x0, #0x14]
  0x282f158: add      w23, w8, w23
  0x282f15c: str      w23, [x29]
  0x282f160: ldp      x20, x19, [sp, #0xc0]
  0x282f164: ldp      x22, x21, [sp, #0xb0]
  0x282f168: ldp      x24, x23, [sp, #0xa0]
  0x282f16c: ldp      x26, x25, [sp, #0x90]
  0x282f170: ldp      x28, x27, [sp, #0x80]
  0x282f174: ldp      x29, x30, [sp, #0x70]
  0x282f178: add      sp, sp, #0xd0
  0x282f17c: ret      
  0x282f180: adrp     x8, #0x5598000
  0x282f184: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f188: add      x0, sp, #0x50
  0x282f18c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282f190: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f194: b        #0x282f160
  0x282f198: mov      x19, x29
  0x282f19c: adrp     x29, #0x5598000
  0x282f1a0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1a4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1a8: mov      x19, x29
  0x282f1ac: adrp     x29, #0x5598000
  0x282f1b0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1b4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1b8: mov      x19, x29
  0x282f1bc: adrp     x29, #0x5598000
  0x282f1c0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1c4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1c8: mov      x19, x29
  0x282f1cc: adrp     x29, #0x5598000
  0x282f1d0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1d4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1d8: mov      x19, x29
  0x282f1dc: adrp     x29, #0x5598000
  0x282f1e0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1e4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1e8: mov      x19, x29
  0x282f1ec: adrp     x29, #0x5598000
  0x282f1f0: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f1f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f1f8: mov      x22, xzr
  0x282f1fc: adrp     x8, #0x5598000
  0x282f200: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282f204: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282f208: add      x0, sp, #0x30
  0x282f20c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f210: adrp     x26, #0x5598000
  0x282f214: mov      x29, x24
  0x282f218: adrp     x24, #0x5598000
  0x282f21c: ldp      x1, x0, [sp, #8]
  0x282f220: ldr      x26, [x26, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f224: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282f228: cbz      x22, #0x282f308
  0x282f22c: mov      x0, x22
  0x282f230: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f234: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f238: mov      x19, x29
  0x282f23c: adrp     x29, #0x5598000
  0x282f240: ldr      x29, [x29, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f244: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f248: mov      x0, x22
  0x282f24c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f250: stp      x1, x0, [sp, #8]
  0x282f254: b        #0x282f1fc
  0x282f258: b        #0x282f300
  0x282f25c: b        #0x282f274
  0x282f260: b        #0x282f274
  0x282f264: mov      x29, x24
  0x282f268: adrp     x24, #0x5598000
  0x282f26c: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282f270: b        #0x282f300
  0x282f274: adrp     x26, #0x5598000
  0x282f278: mov      x29, x24
  0x282f27c: adrp     x24, #0x5598000
  0x282f280: ldr      x26, [x26, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f284: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x282f288: b        #0x282f308
  0x282f28c: b        #0x282f2f0
  0x282f290: b        #0x282f300
  0x282f294: b        #0x282f300
  0x282f298: b        #0x282f300
  0x282f29c: b        #0x282f2f0
  0x282f2a0: b        #0x282f300
  0x282f2a4: b        #0x282f300
  0x282f2a8: b        #0x282f300
  0x282f2ac: b        #0x282f2f0
  0x282f2b0: b        #0x282f2f0
  0x282f2b4: b        #0x282f300
  0x282f2b8: b        #0x282f300
  0x282f2bc: b        #0x282f300
  0x282f2c0: b        #0x282f300
  0x282f2c4: b        #0x282f300
  0x282f2c8: b        #0x282f2f0
  0x282f2cc: b        #0x282f2f0
  0x282f2d0: b        #0x282f300
  0x282f2d4: b        #0x282f300
  0x282f2d8: b        #0x282f300
  0x282f2dc: b        #0x282f300
  0x282f2e0: b        #0x282f300
  0x282f2e4: b        #0x282f300
  0x282f2e8: b        #0x282f300
  0x282f2ec: b        #0x282f300
  0x282f2f0: mov      x26, x29
  0x282f2f4: mov      x29, x19
  0x282f2f8: b        #0x282f308
  0x282f2fc: b        #0x282f300
  0x282f300: adrp     x26, #0x5598000
  0x282f304: ldr      x26, [x26, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f308: cmp      w1, #1
  0x282f30c: b.ne     #0x282f334
  0x282f310: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282f314: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x282f318: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282f31c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x282f320: add      x0, sp, #0x50
  0x282f324: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f328: cbz      x21, #0x282f0f0
  0x282f32c: mov      x0, x21
  0x282f330: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f334: mov      x29, x26
  0x282f338: mov      x19, x0
  0x282f33c: mov      x21, xzr
  0x282f340: b        #0x282f34c
  0x282f344: mov      x29, x26
  0x282f348: mov      x19, x0
  0x282f34c: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5598000)
  0x282f350: add      x0, sp, #0x50
  0x282f354: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f358: cbnz     x21, #0x282f364
  0x282f35c: mov      x0, x19
  0x282f360: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x282f364: mov      x0, x21
  0x282f368: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f36c: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
