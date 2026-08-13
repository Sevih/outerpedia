; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== FindBuffDamageReduce @ 0x2827ae4..0x2828164 (taille 1664 octets) =====
  0x2827ae4: sub      sp, sp, #0xd0
  0x2827ae8: stp      x29, x30, [sp, #0x70]
  0x2827aec: stp      x28, x27, [sp, #0x80]
  0x2827af0: stp      x26, x25, [sp, #0x90]
  0x2827af4: stp      x24, x23, [sp, #0xa0]
  0x2827af8: stp      x22, x21, [sp, #0xb0]
  0x2827afc: stp      x20, x19, [sp, #0xc0]
  0x2827b00: adrp     x22, #0x59d7000
  0x2827b04: ldrb     w8, [x22, #0xac0]
  0x2827b08: mov      x20, x2
  0x2827b0c: mov      x29, x1
  0x2827b10: mov      x21, x0
  0x2827b14: tbnz     w8, #0, #0x2827b98
  0x2827b18: adrp     x0, #0x558a000
  0x2827b1c: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2827b20: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b24: adrp     x0, #0x558a000
  0x2827b28: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2827b2c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b30: adrp     x0, #0x558a000
  0x2827b34: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827b38: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b3c: adrp     x0, #0x558a000
  0x2827b40: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2827b44: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b48: adrp     x0, #0x558a000
  0x2827b4c: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2827b50: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b54: adrp     x0, #0x558a000
  0x2827b58: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x2827b5c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b60: adrp     x0, #0x558a000
  0x2827b64: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x2827b68: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b6c: adrp     x0, #0x558a000
  0x2827b70: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2827b74: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b78: adrp     x0, #0x558a000
  0x2827b7c: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2827b80: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b84: adrp     x0, #0x5587000
  0x2827b88: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827b8c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2827b90: mov      w8, #1
  0x2827b94: strb     w8, [x22, #0xac0]
  0x2827b98: stp      xzr, xzr, [sp, #0x50]
  0x2827b9c: str      xzr, [sp, #0x60]
  0x2827ba0: stp      xzr, xzr, [sp, #0x30]
  0x2827ba4: str      xzr, [sp, #0x40]
  0x2827ba8: ldr      x0, [x21, #0x380]
  0x2827bac: cbz      x0, #0x2828028
  0x2827bb0: adrp     x8, #0x558a000
  0x2827bb4: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2827bb8: adrp     x28, #0x558a000
  0x2827bbc: adrp     x25, #0x5587000
  0x2827bc0: adrp     x27, #0x558a000
  0x2827bc4: adrp     x26, #0x558a000
  0x2827bc8: ldr      x28, [x28, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2827bcc: ldr      x25, [x25, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2827bd0: ldr      x27, [x27, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2827bd4: ldr      x26, [x26, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2827bd8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827bdc: adrp     x24, #0x558a000
  0x2827be0: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2827be4: add      x8, sp, #0x18
  0x2827be8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2827bec: ldur     q0, [sp, #0x18]
  0x2827bf0: ldr      x8, [sp, #0x28]
  0x2827bf4: mov      w23, wzr
  0x2827bf8: str      q0, [sp, #0x50]
  0x2827bfc: str      x8, [sp, #0x60]
  0x2827c00: ldr      x1, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x2827c04: add      x0, sp, #0x50
  0x2827c08: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2827c0c: tbz      w0, #0, #0x2827ed0
  0x2827c10: ldr      x21, [sp, #0x60]
  0x2827c14: cbz      x21, #0x2827f8c
  0x2827c18: mov      x0, x21
  0x2827c1c: mov      x1, xzr
  0x2827c20: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827c24: cmp      w0, #0x73
  0x2827c28: b.ne     #0x2827c78
  0x2827c2c: mov      w2, #0x17
  0x2827c30: mov      x0, x21
  0x2827c34: mov      x1, x20
  0x2827c38: mov      x3, xzr
  0x2827c3c: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2827c40: tbz      w0, #0, #0x2827c78
  0x2827c44: mov      x0, x21
  0x2827c48: mov      x1, xzr
  0x2827c4c: bl       #0x2320330 ; -> CBuff$$get_ApplyingType
  0x2827c50: cmp      w0, #2
  0x2827c54: b.ne     #0x2827c00
  0x2827c58: mov      x0, x21
  0x2827c5c: mov      x1, xzr
  0x2827c60: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827c64: add      w23, w0, w23
  0x2827c68: mov      x0, x21
  0x2827c6c: mov      x1, xzr
  0x2827c70: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x2827c74: b        #0x2827c00
  0x2827c78: mov      x0, x21
  0x2827c7c: mov      x1, xzr
  0x2827c80: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827c84: cmp      w0, #0x9a
  0x2827c88: b.ne     #0x2827ccc
  0x2827c8c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2827c90: ldr      w8, [x0, #0xe0]
  0x2827c94: cbnz     w8, #0x2827c9c
  0x2827c98: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827c9c: mov      x0, x20
  0x2827ca0: mov      x1, xzr
  0x2827ca4: mov      x2, xzr
  0x2827ca8: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2827cac: tbz      w0, #0, #0x2827ccc
  0x2827cb0: cbz      x20, #0x2827fac
  0x2827cb4: mov      x0, x20
  0x2827cb8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2827cbc: cbz      x0, #0x2827f9c
  0x2827cc0: ldr      w8, [x0, #0x20]
  0x2827cc4: cmp      w8, #1
  0x2827cc8: b.ne     #0x2827e20
  0x2827ccc: mov      x0, x21
  0x2827cd0: mov      x1, xzr
  0x2827cd4: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827cd8: cmp      w0, #0x76
  0x2827cdc: b.ne     #0x2827dbc
  0x2827ce0: mov      w2, #0x17
  0x2827ce4: mov      x0, x21
  0x2827ce8: mov      x1, x20
  0x2827cec: mov      x3, xzr
  0x2827cf0: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2827cf4: tbz      w0, #0, #0x2827dbc
  0x2827cf8: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2827cfc: ldr      x22, [x21, #0x20]
  0x2827d00: ldr      w8, [x0, #0xe0]
  0x2827d04: cbnz     w8, #0x2827d0c
  0x2827d08: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827d0c: mov      x0, x22
  0x2827d10: mov      x1, xzr
  0x2827d14: mov      x2, xzr
  0x2827d18: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2827d1c: tbnz     w0, #0, #0x2827c00
  0x2827d20: ldr      x0, [x21, #0x20]
  0x2827d24: cbz      x0, #0x2827fdc
  0x2827d28: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2827d2c: cbz      x8, #0x2827c00
  0x2827d30: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2827d34: cbz      x0, #0x2827c00
  0x2827d38: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5587010)
  0x2827d3c: cbz      x0, #0x282802c
  0x2827d40: ldr      x1, [x27] ; = 0x0 (u64 @ 0x558a000)
  0x2827d44: mov      x24, x29
  0x2827d48: mov      x19, x27
  0x2827d4c: add      x8, sp, #0x18
  0x2827d50: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2827d54: ldur     q0, [sp, #0x18]
  0x2827d58: ldr      x8, [sp, #0x28]
  0x2827d5c: mov      w27, wzr
  0x2827d60: str      q0, [sp, #0x30]
  0x2827d64: str      x8, [sp, #0x40]
  0x2827d68: ldr      x1, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x2827d6c: add      x0, sp, #0x30
  0x2827d70: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2827d74: tbz      w0, #0, #0x2827e34
  0x2827d78: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2827d7c: ldr      x22, [sp, #0x40]
  0x2827d80: ldr      w8, [x0, #0xe0]
  0x2827d84: cbnz     w8, #0x2827d8c
  0x2827d88: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827d8c: mov      x0, x22
  0x2827d90: mov      x1, xzr
  0x2827d94: mov      x2, xzr
  0x2827d98: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2827d9c: tbnz     w0, #0, #0x2827d68
  0x2827da0: cbz      x22, #0x2827e94
  0x2827da4: mov      x0, x22
  0x2827da8: mov      x1, xzr
  0x2827dac: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x2827db0: and      w8, w0, #1
  0x2827db4: add      w27, w27, w8
  0x2827db8: b        #0x2827d68
  0x2827dbc: mov      x0, x21
  0x2827dc0: mov      x1, xzr
  0x2827dc4: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2827dc8: cmp      w0, #0x3e
  0x2827dcc: b.ne     #0x2827c00
  0x2827dd0: mov      w2, #0x17
  0x2827dd4: mov      x0, x21
  0x2827dd8: mov      x1, xzr
  0x2827ddc: mov      x3, xzr
  0x2827de0: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2827de4: tbz      w0, #0, #0x2827c00
  0x2827de8: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2827dec: ldr      w8, [x0, #0xe0]
  0x2827df0: cbnz     w8, #0x2827df8
  0x2827df4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827df8: mov      x0, xzr
  0x2827dfc: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2827e00: cbz      x0, #0x2827fcc
  0x2827e04: mov      w1, #0xd7
  0x2827e08: mov      x2, xzr
  0x2827e0c: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x2827e10: cbz      x0, #0x2827fbc
  0x2827e14: ldr      w8, [x0, #0x14]
  0x2827e18: add      w23, w8, w23
  0x2827e1c: b        #0x2827c00
  0x2827e20: mov      x0, x21
  0x2827e24: mov      x1, xzr
  0x2827e28: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827e2c: add      w23, w0, w23
  0x2827e30: b        #0x2827c00
  0x2827e34: mov      x22, xzr
  0x2827e38: mov      w29, #9
  0x2827e3c: adrp     x8, #0x558a000
  0x2827e40: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2827e44: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827e48: add      x0, sp, #0x30
  0x2827e4c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827e50: cbnz     x22, #0x282803c
  0x2827e54: cmp      w29, #9
  0x2827e58: b.eq     #0x2827e60
  0x2827e5c: cbnz     w29, #0x2827f74
  0x2827e60: mov      x0, x21
  0x2827e64: mov      x1, xzr
  0x2827e68: bl       #0x232036c ; -> CBuff$$get_Value
  0x2827e6c: sub      w8, w27, #1
  0x2827e70: madd     w23, w0, w8, w23
  0x2827e74: mov      x29, x24
  0x2827e78: adrp     x24, #0x558a000
  0x2827e7c: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2827e80: mov      x0, x21
  0x2827e84: mov      x1, xzr
  0x2827e88: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x2827e8c: mov      x27, x19
  0x2827e90: b        #0x2827c00
  0x2827e94: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827e98: b        #0x2828044
  0x2827e9c: b        #0x2827eac
  0x2827ea0: b        #0x2827eac
  0x2827ea4: b        #0x2827eac
  0x2827ea8: b        #0x2827eac
  0x2827eac: cmp      w1, #1
  0x2827eb0: stp      x1, x0, [sp, #8]
  0x2827eb4: b.ne     #0x2827fec
  0x2827eb8: ldr      x0, [sp, #0x10]
  0x2827ebc: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2827ec0: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x2827ec4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2827ec8: mov      w29, wzr
  0x2827ecc: b        #0x2827e3c
  0x2827ed0: adrp     x8, #0x558a000
  0x2827ed4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827ed8: add      x0, sp, #0x50
  0x2827edc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827ee0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827ee4: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2827ee8: ldr      w8, [x0, #0xe0]
  0x2827eec: cbnz     w8, #0x2827ef4
  0x2827ef0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827ef4: mov      x0, x20
  0x2827ef8: mov      x1, xzr
  0x2827efc: mov      x2, xzr
  0x2827f00: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2827f04: tbz      w0, #0, #0x2827f50
  0x2827f08: cbz      x20, #0x2828028
  0x2827f0c: mov      w1, #0x3e
  0x2827f10: mov      x0, x20
  0x2827f14: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2827f18: cbz      x0, #0x2827f50
  0x2827f1c: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2827f20: ldr      w8, [x0, #0xe0]
  0x2827f24: cbnz     w8, #0x2827f2c
  0x2827f28: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2827f2c: mov      x0, xzr
  0x2827f30: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2827f34: cbz      x0, #0x2828028
  0x2827f38: mov      w1, #0xd7
  0x2827f3c: mov      x2, xzr
  0x2827f40: bl       #0x262513c ; -> CTempletManager$$GetGameConfig
  0x2827f44: cbz      x0, #0x2828028
  0x2827f48: ldr      w8, [x0, #0x14]
  0x2827f4c: add      w23, w8, w23
  0x2827f50: str      w23, [x29]
  0x2827f54: ldp      x20, x19, [sp, #0xc0]
  0x2827f58: ldp      x22, x21, [sp, #0xb0]
  0x2827f5c: ldp      x24, x23, [sp, #0xa0]
  0x2827f60: ldp      x26, x25, [sp, #0x90]
  0x2827f64: ldp      x28, x27, [sp, #0x80]
  0x2827f68: ldp      x29, x30, [sp, #0x70]
  0x2827f6c: add      sp, sp, #0xd0
  0x2827f70: ret      
  0x2827f74: adrp     x8, #0x558a000
  0x2827f78: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827f7c: add      x0, sp, #0x50
  0x2827f80: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827f84: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2827f88: b        #0x2827f54
  0x2827f8c: mov      x19, x29
  0x2827f90: adrp     x29, #0x558a000
  0x2827f94: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827f98: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827f9c: mov      x19, x29
  0x2827fa0: adrp     x29, #0x558a000
  0x2827fa4: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827fa8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827fac: mov      x19, x29
  0x2827fb0: adrp     x29, #0x558a000
  0x2827fb4: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827fb8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827fbc: mov      x19, x29
  0x2827fc0: adrp     x29, #0x558a000
  0x2827fc4: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827fc8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827fcc: mov      x19, x29
  0x2827fd0: adrp     x29, #0x558a000
  0x2827fd4: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827fd8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827fdc: mov      x19, x29
  0x2827fe0: adrp     x29, #0x558a000
  0x2827fe4: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2827fe8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2827fec: mov      x22, xzr
  0x2827ff0: adrp     x8, #0x558a000
  0x2827ff4: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2827ff8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2827ffc: add      x0, sp, #0x30
  0x2828000: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828004: adrp     x26, #0x558a000
  0x2828008: mov      x29, x24
  0x282800c: adrp     x24, #0x558a000
  0x2828010: ldp      x1, x0, [sp, #8]
  0x2828014: ldr      x26, [x26, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828018: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x282801c: cbz      x22, #0x28280fc
  0x2828020: mov      x0, x22
  0x2828024: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828028: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282802c: mov      x19, x29
  0x2828030: adrp     x29, #0x558a000
  0x2828034: ldr      x29, [x29, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828038: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282803c: mov      x0, x22
  0x2828040: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828044: stp      x1, x0, [sp, #8]
  0x2828048: b        #0x2827ff0
  0x282804c: b        #0x28280f4
  0x2828050: b        #0x2828068
  0x2828054: b        #0x2828068
  0x2828058: mov      x29, x24
  0x282805c: adrp     x24, #0x558a000
  0x2828060: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2828064: b        #0x28280f4
  0x2828068: adrp     x26, #0x558a000
  0x282806c: mov      x29, x24
  0x2828070: adrp     x24, #0x558a000
  0x2828074: ldr      x26, [x26, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828078: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x282807c: b        #0x28280fc
  0x2828080: b        #0x28280e4
  0x2828084: b        #0x28280f4
  0x2828088: b        #0x28280f4
  0x282808c: b        #0x28280f4
  0x2828090: b        #0x28280e4
  0x2828094: b        #0x28280f4
  0x2828098: b        #0x28280f4
  0x282809c: b        #0x28280f4
  0x28280a0: b        #0x28280e4
  0x28280a4: b        #0x28280e4
  0x28280a8: b        #0x28280f4
  0x28280ac: b        #0x28280f4
  0x28280b0: b        #0x28280f4
  0x28280b4: b        #0x28280f4
  0x28280b8: b        #0x28280f4
  0x28280bc: b        #0x28280e4
  0x28280c0: b        #0x28280e4
  0x28280c4: b        #0x28280f4
  0x28280c8: b        #0x28280f4
  0x28280cc: b        #0x28280f4
  0x28280d0: b        #0x28280f4
  0x28280d4: b        #0x28280f4
  0x28280d8: b        #0x28280f4
  0x28280dc: b        #0x28280f4
  0x28280e0: b        #0x28280f4
  0x28280e4: mov      x26, x29
  0x28280e8: mov      x29, x19
  0x28280ec: b        #0x28280fc
  0x28280f0: b        #0x28280f4
  0x28280f4: adrp     x26, #0x558a000
  0x28280f8: ldr      x26, [x26, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x28280fc: cmp      w1, #1
  0x2828100: b.ne     #0x2828128
  0x2828104: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2828108: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x282810c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2828110: ldr      x1, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x2828114: add      x0, sp, #0x50
  0x2828118: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282811c: cbz      x21, #0x2827ee4
  0x2828120: mov      x0, x21
  0x2828124: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828128: mov      x29, x26
  0x282812c: mov      x19, x0
  0x2828130: mov      x21, xzr
  0x2828134: b        #0x2828140
  0x2828138: mov      x29, x26
  0x282813c: mov      x19, x0
  0x2828140: ldr      x1, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x2828144: add      x0, sp, #0x50
  0x2828148: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282814c: cbnz     x21, #0x2828158
  0x2828150: mov      x0, x19
  0x2828154: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2828158: mov      x0, x21
  0x282815c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828160: bl       #0x1f86e18 ; -> ??? 0x1f86e18
