; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== FindBuffAdditionalDamage @ 0x282d838..0x282ecf0 (taille 5304 octets) =====
  0x282d838: sub      sp, sp, #0x110
  0x282d83c: stp      d13, d12, [sp, #0x80]
  0x282d840: stp      d11, d10, [sp, #0x90]
  0x282d844: stp      d9, d8, [sp, #0xa0]
  0x282d848: stp      x29, x30, [sp, #0xb0]
  0x282d84c: stp      x28, x27, [sp, #0xc0]
  0x282d850: stp      x26, x25, [sp, #0xd0]
  0x282d854: stp      x24, x23, [sp, #0xe0]
  0x282d858: stp      x22, x21, [sp, #0xf0]
  0x282d85c: stp      x20, x19, [sp, #0x100]
  0x282d860: adrp     x20, #0x59e7000
  0x282d864: ldrb     w8, [x20, #0x6de]
  0x282d868: mov      x21, x2
  0x282d86c: mov      x19, x1
  0x282d870: mov      x22, x0
  0x282d874: tbnz     w8, #0, #0x282d940
  0x282d878: adrp     x0, #0x5598000
  0x282d87c: ldr      x0, [x0, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x282d880: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d884: adrp     x0, #0x5599000
  0x282d888: ldr      x0, [x0, #0x2b0] ; = 0x0 (u64 @ 0x55992b0)
  0x282d88c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d890: adrp     x0, #0x55bf000
  0x282d894: ldr      x0, [x0, #0x7b8] ; = 0x0 (u64 @ 0x55bf7b8)
  0x282d898: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d89c: adrp     x0, #0x5597000
  0x282d8a0: ldr      x0, [x0, #0x490] ; = 0x0 (u64 @ 0x5597490)
  0x282d8a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8a8: adrp     x0, #0x55a0000
  0x282d8ac: ldr      x0, [x0, #0x258] ; = 0x0 (u64 @ 0x55a0258)
  0x282d8b0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8b4: adrp     x0, #0x5597000
  0x282d8b8: ldr      x0, [x0, #0x498] ; = 0x0 (u64 @ 0x5597498)
  0x282d8bc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8c0: adrp     x0, #0x5598000
  0x282d8c4: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282d8c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8cc: adrp     x0, #0x5598000
  0x282d8d0: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282d8d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8d8: adrp     x0, #0x5598000
  0x282d8dc: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282d8e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8e4: adrp     x0, #0x5598000
  0x282d8e8: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282d8ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8f0: adrp     x0, #0x5598000
  0x282d8f4: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x282d8f8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d8fc: adrp     x0, #0x5598000
  0x282d900: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x282d904: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d908: adrp     x0, #0x5598000
  0x282d90c: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282d910: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d914: adrp     x0, #0x5598000
  0x282d918: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282d91c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d920: adrp     x0, #0x5599000
  0x282d924: ldr      x0, [x0, #0x898] ; = 0x0 (u64 @ 0x5599898)
  0x282d928: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d92c: adrp     x0, #0x5596000
  0x282d930: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282d934: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282d938: mov      w8, #1
  0x282d93c: strb     w8, [x20, #0x6de]
  0x282d940: stp      xzr, xzr, [sp, #0x60]
  0x282d944: str      xzr, [sp, #0x70]
  0x282d948: stp      xzr, xzr, [sp, #0x50]
  0x282d94c: stp      xzr, xzr, [sp, #0x40]
  0x282d950: str      wzr, [x19]
  0x282d954: ldr      x0, [x22, #0x380]
  0x282d958: cbz      x0, #0x282e924
  0x282d95c: adrp     x8, #0x5598000
  0x282d960: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282d964: adrp     x28, #0x5598000
  0x282d968: ldr      x28, [x28, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282d96c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282d970: add      x8, sp, #0x28
  0x282d974: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282d978: adrp     x23, #0x5597000
  0x282d97c: ldur     q0, [sp, #0x28]
  0x282d980: ldr      x8, [sp, #0x38]
  0x282d984: ldr      x23, [x23, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x282d988: mov      x24, xzr
  0x282d98c: adrp     x20, #0x59e5000
  0x282d990: fmov     d9, #-0.50000000
  0x282d994: fmov     d10, #-1.00000000
  0x282d998: mov      x29, #0x7ff0000000000000
  0x282d99c: fmov     d11, #0.50000000
  0x282d9a0: fmov     d12, #1.00000000
  0x282d9a4: str      q0, [sp, #0x60]
  0x282d9a8: str      x8, [sp, #0x70]
  0x282d9ac: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5598000)
  0x282d9b0: add      x0, sp, #0x60
  0x282d9b4: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282d9b8: tbz      w0, #0, #0x282e848
  0x282d9bc: ldr      x25, [sp, #0x70]
  0x282d9c0: cbz      x25, #0x282e918
  0x282d9c4: mov      x0, x25
  0x282d9c8: mov      x1, xzr
  0x282d9cc: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282d9d0: cmp      w0, #0x5a
  0x282d9d4: b.ne     #0x282da04
  0x282d9d8: mov      w2, #0x17
  0x282d9dc: mov      x0, x25
  0x282d9e0: mov      x1, x21
  0x282d9e4: mov      x3, xzr
  0x282d9e8: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282d9ec: tbz      w0, #0, #0x282da04
  0x282d9f0: ldr      w26, [x19]
  0x282d9f4: mov      x0, x25
  0x282d9f8: mov      x1, xzr
  0x282d9fc: bl       #0x232548c ; -> CBuff$$get_Value
  0x282da00: b        #0x282da9c
  0x282da04: mov      x0, x25
  0x282da08: mov      x1, xzr
  0x282da0c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282da10: cmp      w0, #0x5b
  0x282da14: b.ne     #0x282da50
  0x282da18: mov      w2, #0x17
  0x282da1c: mov      x0, x25
  0x282da20: mov      x1, xzr
  0x282da24: mov      x3, xzr
  0x282da28: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282da2c: tbz      w0, #0, #0x282da50
  0x282da30: ldr      w26, [x19]
  0x282da34: mov      x0, x25
  0x282da38: mov      x1, xzr
  0x282da3c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282da40: mov      w1, w0
  0x282da44: mov      x0, x22
  0x282da48: bl       #0x281611c ; -> CCharacterBattle$$GetLostHPRateValue
  0x282da4c: b        #0x282da9c
  0x282da50: mov      x0, x25
  0x282da54: mov      x1, xzr
  0x282da58: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282da5c: cmp      w0, #0x5c
  0x282da60: b.ne     #0x282daa4
  0x282da64: mov      w2, #0x17
  0x282da68: mov      x0, x25
  0x282da6c: mov      x1, xzr
  0x282da70: mov      x3, xzr
  0x282da74: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282da78: tbz      w0, #0, #0x282daa4
  0x282da7c: ldr      w26, [x19]
  0x282da80: mov      x0, x25
  0x282da84: mov      x1, xzr
  0x282da88: bl       #0x232548c ; -> CBuff$$get_Value
  0x282da8c: mov      w1, w0
  0x282da90: cbz      x21, #0x282e91c
  0x282da94: mov      x0, x21
  0x282da98: bl       #0x281611c ; -> CCharacterBattle$$GetLostHPRateValue
  0x282da9c: add      w8, w0, w26
  0x282daa0: b        #0x282e074
  0x282daa4: mov      x0, x25
  0x282daa8: mov      x1, xzr
  0x282daac: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282dab0: cmp      w0, #0x5d
  0x282dab4: b.ne     #0x282db3c
  0x282dab8: mov      w2, #0x17
  0x282dabc: mov      x0, x25
  0x282dac0: mov      x1, xzr
  0x282dac4: mov      x3, xzr
  0x282dac8: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282dacc: tbz      w0, #0, #0x282db3c
  0x282dad0: ldr      x26, [x22, #0x28]
  0x282dad4: mov      x0, x25
  0x282dad8: mov      x1, xzr
  0x282dadc: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x282dae0: mov      w27, w0
  0x282dae4: mov      x0, x25
  0x282dae8: mov      x1, xzr
  0x282daec: bl       #0x232548c ; -> CBuff$$get_Value
  0x282daf0: cbz      x26, #0x282e920
  0x282daf4: mov      w2, w0
  0x282daf8: mov      x0, x26
  0x282dafc: mov      w1, w27
  0x282db00: mov      x3, xzr
  0x282db04: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x282db08: ldrb     w8, [x20, #0xf]
  0x282db0c: ldr      w26, [x19]
  0x282db10: mov      w25, w0
  0x282db14: cbnz     w8, #0x282db28
  0x282db18: mov      x0, x23
  0x282db1c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282db20: mov      w8, #1
  0x282db24: strb     w8, [x20, #0xf]
  0x282db28: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5597000)
  0x282db2c: ldr      w8, [x0, #0xe0]
  0x282db30: cbnz     w8, #0x282dca4
  0x282db34: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282db38: b        #0x282dca4
  0x282db3c: mov      x0, x25
  0x282db40: mov      x1, xzr
  0x282db44: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282db48: cmp      w0, #0x5e
  0x282db4c: b.ne     #0x282dbd8
  0x282db50: mov      w2, #0x17
  0x282db54: mov      x0, x25
  0x282db58: mov      x1, xzr
  0x282db5c: mov      x3, xzr
  0x282db60: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282db64: tbz      w0, #0, #0x282dbd8
  0x282db68: cbz      x21, #0x282e928
  0x282db6c: ldr      x26, [x21, #0x28]
  0x282db70: mov      x0, x25
  0x282db74: mov      x1, xzr
  0x282db78: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x282db7c: mov      w27, w0
  0x282db80: mov      x0, x25
  0x282db84: mov      x1, xzr
  0x282db88: bl       #0x232548c ; -> CBuff$$get_Value
  0x282db8c: cbz      x26, #0x282e92c
  0x282db90: mov      w2, w0
  0x282db94: mov      x0, x26
  0x282db98: mov      w1, w27
  0x282db9c: mov      x3, xzr
  0x282dba0: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x282dba4: ldrb     w8, [x20, #0xf]
  0x282dba8: ldr      w26, [x19]
  0x282dbac: mov      w25, w0
  0x282dbb0: cbnz     w8, #0x282dbc4
  0x282dbb4: mov      x0, x23
  0x282dbb8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282dbbc: mov      w8, #1
  0x282dbc0: strb     w8, [x20, #0xf]
  0x282dbc4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5597000)
  0x282dbc8: ldr      w8, [x0, #0xe0]
  0x282dbcc: cbnz     w8, #0x282dca4
  0x282dbd0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282dbd4: b        #0x282dca4
  0x282dbd8: mov      x0, x25
  0x282dbdc: mov      x1, xzr
  0x282dbe0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282dbe4: cmp      w0, #0x6b
  0x282dbe8: b.ne     #0x282dce4
  0x282dbec: mov      w2, #0x17
  0x282dbf0: mov      x0, x25
  0x282dbf4: mov      x1, xzr
  0x282dbf8: mov      x3, xzr
  0x282dbfc: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282dc00: tbz      w0, #0, #0x282dce4
  0x282dc04: adrp     x8, #0x5596000
  0x282dc08: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282dc0c: ldr      x26, [x25, #0x18]
  0x282dc10: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282dc14: ldr      w8, [x0, #0xe0]
  0x282dc18: cbnz     w8, #0x282dc20
  0x282dc1c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282dc20: mov      x0, x26
  0x282dc24: mov      x1, xzr
  0x282dc28: mov      x2, xzr
  0x282dc2c: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282dc30: tbz      w0, #0, #0x282d9ac
  0x282dc34: ldr      x8, [x25, #0x18]
  0x282dc38: cbz      x8, #0x282e934
  0x282dc3c: ldr      x26, [x8, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x282dc40: cbz      x26, #0x282d9ac
  0x282dc44: mov      x0, x25
  0x282dc48: mov      x1, xzr
  0x282dc4c: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x282dc50: mov      w27, w0
  0x282dc54: mov      x0, x25
  0x282dc58: mov      x1, xzr
  0x282dc5c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282dc60: mov      w2, w0
  0x282dc64: mov      x0, x26
  0x282dc68: mov      w1, w27
  0x282dc6c: mov      x3, xzr
  0x282dc70: bl       #0x290a63c ; -> CCharacterData$$GetStatValuePermille
  0x282dc74: ldrb     w8, [x20, #0xf]
  0x282dc78: ldr      w26, [x19]
  0x282dc7c: mov      w25, w0
  0x282dc80: cbnz     w8, #0x282dc94
  0x282dc84: mov      x0, x23
  0x282dc88: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282dc8c: mov      w8, #1
  0x282dc90: strb     w8, [x20, #0xf]
  0x282dc94: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5597000)
  0x282dc98: ldr      w8, [x0, #0xe0]
  0x282dc9c: cbnz     w8, #0x282dca4
  0x282dca0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282dca4: mov      w8, #0x447a0000
  0x282dca8: scvtf    s0, w25
  0x282dcac: fmov     s1, w8
  0x282dcb0: fminnm   s13, s0, s1
  0x282dcb4: fcvt     d8, s13
  0x282dcb8: add      x0, sp, #0x28
  0x282dcbc: mov      v0.16b, v8.16b
  0x282dcc0: bl       #0x526dd90 ; -> ??? 0x526dd90
  0x282dcc4: fcmp     s13, #0.0
  0x282dcc8: b.ge     #0x282dd88
  0x282dccc: fcmp     d0, d9
  0x282dcd0: b.ne     #0x282e048
  0x282dcd4: ldr      d0, [sp, #0x28]
  0x282dcd8: fcvtzs   x8, d0
  0x282dcdc: fadd     d1, d0, d10
  0x282dce0: b        #0x282dd9c
  0x282dce4: mov      x0, x25
  0x282dce8: mov      x1, xzr
  0x282dcec: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282dcf0: cmp      w0, #0x5f
  0x282dcf4: b.ne     #0x282dd34
  0x282dcf8: mov      w2, #0x17
  0x282dcfc: mov      x0, x25
  0x282dd00: mov      x1, xzr
  0x282dd04: mov      x3, xzr
  0x282dd08: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282dd0c: tbz      w0, #0, #0x282dd34
  0x282dd10: ldr      w27, [x19]
  0x282dd14: mov      x0, x22
  0x282dd18: mov      w1, wzr
  0x282dd1c: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282dd20: mov      w26, w0
  0x282dd24: mov      x0, x25
  0x282dd28: mov      x1, xzr
  0x282dd2c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282dd30: b        #0x282df44
  0x282dd34: mov      x0, x25
  0x282dd38: mov      x1, xzr
  0x282dd3c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282dd40: cmp      w0, #0x60
  0x282dd44: b.ne     #0x282dda8
  0x282dd48: mov      w2, #0x17
  0x282dd4c: mov      x0, x25
  0x282dd50: mov      x1, xzr
  0x282dd54: mov      x3, xzr
  0x282dd58: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282dd5c: tbz      w0, #0, #0x282dda8
  0x282dd60: cbz      x21, #0x282e930
  0x282dd64: ldr      w27, [x19]
  0x282dd68: mov      x0, x21
  0x282dd6c: mov      w1, wzr
  0x282dd70: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282dd74: mov      w26, w0
  0x282dd78: mov      x0, x25
  0x282dd7c: mov      x1, xzr
  0x282dd80: bl       #0x232548c ; -> CBuff$$get_Value
  0x282dd84: b        #0x282df44
  0x282dd88: fcmp     d0, d11
  0x282dd8c: b.ne     #0x282e054
  0x282dd90: ldr      d0, [sp, #0x28]
  0x282dd94: fcvtzs   x8, d0
  0x282dd98: fadd     d1, d0, d12
  0x282dd9c: tst      x8, #1
  0x282dda0: fcsel    d0, d0, d1, eq
  0x282dda4: b        #0x282e05c
  0x282dda8: mov      x0, x25
  0x282ddac: mov      x1, xzr
  0x282ddb0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282ddb4: cmp      w0, #0xa5
  0x282ddb8: b.ne     #0x282dea4
  0x282ddbc: mov      w2, #0x17
  0x282ddc0: mov      x0, x25
  0x282ddc4: mov      x1, xzr
  0x282ddc8: mov      x3, xzr
  0x282ddcc: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282ddd0: tbz      w0, #0, #0x282dea4
  0x282ddd4: cbnz     x24, #0x282ddfc
  0x282ddd8: adrp     x8, #0x5597000
  0x282dddc: ldr      x8, [x8, #0x498] ; = 0x0 (u64 @ 0x5597498)
  0x282dde0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x282dde4: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x282dde8: adrp     x8, #0x5597000
  0x282ddec: ldr      x8, [x8, #0x490] ; = 0x0 (u64 @ 0x5597490)
  0x282ddf0: mov      x24, x0
  0x282ddf4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x282ddf8: bl       #0x405e668 ; -> System.Collections.Generic.Dictionary<object, int>$$.ctor
  0x282ddfc: mov      x0, x25
  0x282de00: mov      x1, xzr
  0x282de04: bl       #0x232524c ; -> CBuff$$get_ID
  0x282de08: mov      x1, x0
  0x282de0c: cbz      x24, #0x282e938
  0x282de10: adrp     x8, #0x55bf000
  0x282de14: ldr      x8, [x8, #0x7b8] ; = 0x0 (u64 @ 0x55bf7b8)
  0x282de18: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55bf000)
  0x282de1c: add      x2, sp, #0x5c
  0x282de20: mov      x0, x24
  0x282de24: bl       #0x40607d8 ; -> System.Collections.Generic.Dictionary<object, int>$$TryGetValue
  0x282de28: cbz      x21, #0x282e93c
  0x282de2c: ldr      w27, [sp, #0x5c]
  0x282de30: mov      x0, x21
  0x282de34: mov      w1, wzr
  0x282de38: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282de3c: mov      w26, w0
  0x282de40: mov      x0, x25
  0x282de44: mov      x1, xzr
  0x282de48: bl       #0x232548c ; -> CBuff$$get_Value
  0x282de4c: ldr      x8, [x25, #0x10]
  0x282de50: cbz      x8, #0x282e940
  0x282de54: ldr      w8, [x8, #0x58]
  0x282de58: ldr      w9, [x19]
  0x282de5c: ldr      w10, [sp, #0x5c]
  0x282de60: madd     w11, w0, w26, w27
  0x282de64: cmp      w11, w8
  0x282de68: csel     w26, w11, w8, lt
  0x282de6c: sub      w8, w9, w10
  0x282de70: add      w8, w8, w26
  0x282de74: str      w8, [x19]
  0x282de78: mov      x0, x25
  0x282de7c: mov      x1, xzr
  0x282de80: bl       #0x232524c ; -> CBuff$$get_ID
  0x282de84: mov      x1, x0
  0x282de88: adrp     x8, #0x55a0000
  0x282de8c: ldr      x8, [x8, #0x258] ; = 0x0 (u64 @ 0x55a0258)
  0x282de90: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55a0000)
  0x282de94: mov      x0, x24
  0x282de98: mov      w2, w26
  0x282de9c: bl       #0x405f008 ; -> System.Collections.Generic.Dictionary<object, int>$$set_Item
  0x282dea0: b        #0x282d9ac
  0x282dea4: mov      x0, x25
  0x282dea8: mov      x1, xzr
  0x282deac: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282deb0: cmp      w0, #0x61
  0x282deb4: b.ne     #0x282def4
  0x282deb8: mov      w2, #0x17
  0x282debc: mov      x0, x25
  0x282dec0: mov      x1, xzr
  0x282dec4: mov      x3, xzr
  0x282dec8: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282decc: tbz      w0, #0, #0x282def4
  0x282ded0: ldr      w27, [x19]
  0x282ded4: mov      w1, #1
  0x282ded8: mov      x0, x22
  0x282dedc: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282dee0: mov      w26, w0
  0x282dee4: mov      x0, x25
  0x282dee8: mov      x1, xzr
  0x282deec: bl       #0x232548c ; -> CBuff$$get_Value
  0x282def0: b        #0x282df44
  0x282def4: mov      x0, x25
  0x282def8: mov      x1, xzr
  0x282defc: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282df00: cmp      w0, #0x62
  0x282df04: b.ne     #0x282df4c
  0x282df08: mov      w2, #0x17
  0x282df0c: mov      x0, x25
  0x282df10: mov      x1, xzr
  0x282df14: mov      x3, xzr
  0x282df18: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282df1c: tbz      w0, #0, #0x282df4c
  0x282df20: cbz      x21, #0x282e944
  0x282df24: ldr      w27, [x19]
  0x282df28: mov      w1, #1
  0x282df2c: mov      x0, x21
  0x282df30: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282df34: mov      w26, w0
  0x282df38: mov      x0, x25
  0x282df3c: mov      x1, xzr
  0x282df40: bl       #0x232548c ; -> CBuff$$get_Value
  0x282df44: madd     w8, w0, w26, w27
  0x282df48: b        #0x282e074
  0x282df4c: mov      x0, x25
  0x282df50: mov      x1, xzr
  0x282df54: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282df58: cmp      w0, #0xa4
  0x282df5c: b.ne     #0x282e07c
  0x282df60: mov      w2, #0x17
  0x282df64: mov      x0, x25
  0x282df68: mov      x1, xzr
  0x282df6c: mov      x3, xzr
  0x282df70: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282df74: tbz      w0, #0, #0x282e07c
  0x282df78: cbnz     x24, #0x282dfa0
  0x282df7c: adrp     x8, #0x5597000
  0x282df80: ldr      x8, [x8, #0x498] ; = 0x0 (u64 @ 0x5597498)
  0x282df84: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x282df88: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x282df8c: adrp     x8, #0x5597000
  0x282df90: ldr      x8, [x8, #0x490] ; = 0x0 (u64 @ 0x5597490)
  0x282df94: mov      x24, x0
  0x282df98: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x282df9c: bl       #0x405e668 ; -> System.Collections.Generic.Dictionary<object, int>$$.ctor
  0x282dfa0: mov      x0, x25
  0x282dfa4: mov      x1, xzr
  0x282dfa8: bl       #0x232524c ; -> CBuff$$get_ID
  0x282dfac: mov      x1, x0
  0x282dfb0: cbz      x24, #0x282e948
  0x282dfb4: adrp     x8, #0x55bf000
  0x282dfb8: ldr      x8, [x8, #0x7b8] ; = 0x0 (u64 @ 0x55bf7b8)
  0x282dfbc: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55bf000)
  0x282dfc0: add      x2, sp, #0x58
  0x282dfc4: mov      x0, x24
  0x282dfc8: bl       #0x40607d8 ; -> System.Collections.Generic.Dictionary<object, int>$$TryGetValue
  0x282dfcc: cbz      x21, #0x282e950
  0x282dfd0: ldr      w27, [sp, #0x58]
  0x282dfd4: mov      w1, #1
  0x282dfd8: mov      x0, x21
  0x282dfdc: bl       #0x282c0e4 ; -> CCharacterBattle$$GetBuffCount
  0x282dfe0: mov      w26, w0
  0x282dfe4: mov      x0, x25
  0x282dfe8: mov      x1, xzr
  0x282dfec: bl       #0x232548c ; -> CBuff$$get_Value
  0x282dff0: ldr      x8, [x25, #0x10]
  0x282dff4: cbz      x8, #0x282e94c
  0x282dff8: ldr      w8, [x8, #0x58]
  0x282dffc: ldr      w9, [x19]
  0x282e000: ldr      w10, [sp, #0x58]
  0x282e004: madd     w11, w0, w26, w27
  0x282e008: cmp      w11, w8
  0x282e00c: csel     w26, w11, w8, lt
  0x282e010: sub      w8, w9, w10
  0x282e014: add      w8, w8, w26
  0x282e018: str      w8, [x19]
  0x282e01c: mov      x0, x25
  0x282e020: mov      x1, xzr
  0x282e024: bl       #0x232524c ; -> CBuff$$get_ID
  0x282e028: mov      x1, x0
  0x282e02c: adrp     x8, #0x55a0000
  0x282e030: ldr      x8, [x8, #0x258] ; = 0x0 (u64 @ 0x55a0258)
  0x282e034: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55a0000)
  0x282e038: mov      x0, x24
  0x282e03c: mov      w2, w26
  0x282e040: bl       #0x405f008 ; -> System.Collections.Generic.Dictionary<object, int>$$set_Item
  0x282e044: b        #0x282d9ac
  0x282e048: fadd     d0, d8, d9
  0x282e04c: frintp   d0, d0
  0x282e050: b        #0x282e05c
  0x282e054: fadd     d0, d8, d11
  0x282e058: frintm   d0, d0
  0x282e05c: fmov     d1, x29
  0x282e060: fcvtzs   w8, d0
  0x282e064: fcmp     d0, d1
  0x282e068: mov      w9, #-0xffffffff80000000
  0x282e06c: csel     w8, w9, w8, eq
  0x282e070: add      w8, w8, w26
  0x282e074: str      w8, [x19]
  0x282e078: b        #0x282d9ac
  0x282e07c: mov      x0, x25
  0x282e080: mov      x1, xzr
  0x282e084: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e088: cmp      w0, #0x66
  0x282e08c: b.ne     #0x282e0d8
  0x282e090: mov      w2, #0x17
  0x282e094: mov      x0, x25
  0x282e098: mov      x1, xzr
  0x282e09c: mov      x3, xzr
  0x282e0a0: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e0a4: tbz      w0, #0, #0x282e0d8
  0x282e0a8: ldr      x8, [x22, #0x348]
  0x282e0ac: cbz      x8, #0x282e958
  0x282e0b0: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x55a0378)
  0x282e0b4: cbz      x0, #0x282e954
  0x282e0b8: mov      x1, xzr
  0x282e0bc: bl       #0x250b21c ; -> CRageManager$$get_IsBreak
  0x282e0c0: tbz      w0, #0, #0x282e0d8
  0x282e0c4: ldr      w26, [x19]
  0x282e0c8: mov      x0, x25
  0x282e0cc: mov      x1, xzr
  0x282e0d0: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e0d4: b        #0x282da9c
  0x282e0d8: mov      x0, x25
  0x282e0dc: mov      x1, xzr
  0x282e0e0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e0e4: cmp      w0, #0x67
  0x282e0e8: b.ne     #0x282e138
  0x282e0ec: mov      w2, #0x17
  0x282e0f0: mov      x0, x25
  0x282e0f4: mov      x1, xzr
  0x282e0f8: mov      x3, xzr
  0x282e0fc: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e100: tbz      w0, #0, #0x282e138
  0x282e104: ldr      x8, [x22, #0x348]
  0x282e108: cbz      x8, #0x282e95c
  0x282e10c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x55a0028)
  0x282e110: cbz      x0, #0x282e138
  0x282e114: mov      x1, xzr
  0x282e118: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x282e11c: cmp      w0, #3
  0x282e120: b.le     #0x282e138
  0x282e124: ldr      w26, [x19]
  0x282e128: mov      x0, x25
  0x282e12c: mov      x1, xzr
  0x282e130: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e134: b        #0x282da9c
  0x282e138: mov      x0, x25
  0x282e13c: mov      x1, xzr
  0x282e140: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e144: cmp      w0, #0x68
  0x282e148: b.ne     #0x282e178
  0x282e14c: mov      w2, #0x17
  0x282e150: mov      x0, x25
  0x282e154: mov      x1, x21
  0x282e158: mov      x3, xzr
  0x282e15c: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e160: tbz      w0, #0, #0x282e178
  0x282e164: ldr      w26, [x19]
  0x282e168: mov      x0, x25
  0x282e16c: mov      x1, xzr
  0x282e170: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e174: b        #0x282da9c
  0x282e178: mov      x0, x25
  0x282e17c: mov      x1, xzr
  0x282e180: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e184: cmp      w0, #0x69
  0x282e188: b.ne     #0x282e1ec
  0x282e18c: mov      w2, #0x17
  0x282e190: mov      x0, x25
  0x282e194: mov      x1, xzr
  0x282e198: mov      x3, xzr
  0x282e19c: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e1a0: tbz      w0, #0, #0x282e1ec
  0x282e1a4: cbz      x21, #0x282e960
  0x282e1a8: mov      x0, x21
  0x282e1ac: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282e1b0: cbz      x0, #0x282e964
  0x282e1b4: ldr      w8, [x0, #0x3c]
  0x282e1b8: cmp      w8, #1
  0x282e1bc: b.eq     #0x282e1d8
  0x282e1c0: mov      x0, x21
  0x282e1c4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282e1c8: cbz      x0, #0x282e96c
  0x282e1cc: ldr      w8, [x0, #0x3c]
  0x282e1d0: cmp      w8, #3
  0x282e1d4: b.ne     #0x282e1ec
  0x282e1d8: ldr      w26, [x19]
  0x282e1dc: mov      x0, x25
  0x282e1e0: mov      x1, xzr
  0x282e1e4: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e1e8: b        #0x282da9c
  0x282e1ec: mov      x0, x25
  0x282e1f0: mov      x1, xzr
  0x282e1f4: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e1f8: cmp      w0, #0x6a
  0x282e1fc: b.ne     #0x282e274
  0x282e200: mov      w2, #0x17
  0x282e204: mov      x0, x25
  0x282e208: mov      x1, xzr
  0x282e20c: mov      x3, xzr
  0x282e210: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e214: tbz      w0, #0, #0x282e274
  0x282e218: adrp     x8, #0x59e4000
  0x282e21c: ldrb     w8, [x8, #0xbd3]
  0x282e220: cbnz     w8, #0x282e23c
  0x282e224: adrp     x0, #0x5598000
  0x282e228: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e22c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e230: adrp     x8, #0x59e4000
  0x282e234: mov      w9, #1
  0x282e238: strb     w9, [x8, #0xbd3]
  0x282e23c: adrp     x8, #0x5598000
  0x282e240: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e244: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e248: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e24c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e250: cbz      x0, #0x282e968
  0x282e254: mov      x1, xzr
  0x282e258: bl       #0x259be3c ; -> CDungeonScene$$get_IsPvp
  0x282e25c: tbz      w0, #0, #0x282e274
  0x282e260: ldr      w26, [x19]
  0x282e264: mov      x0, x25
  0x282e268: mov      x1, xzr
  0x282e26c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e270: b        #0x282da9c
  0x282e274: mov      x0, x25
  0x282e278: mov      x1, xzr
  0x282e27c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e280: cmp      w0, #0x6c
  0x282e284: b.ne     #0x282e304
  0x282e288: mov      w2, #0x17
  0x282e28c: mov      x0, x25
  0x282e290: mov      x1, xzr
  0x282e294: mov      x3, xzr
  0x282e298: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e29c: tbz      w0, #0, #0x282e304
  0x282e2a0: adrp     x8, #0x5596000
  0x282e2a4: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e2a8: ldr      x26, [x25, #0x18]
  0x282e2ac: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282e2b0: ldr      w8, [x0, #0xe0]
  0x282e2b4: cbnz     w8, #0x282e2bc
  0x282e2b8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e2bc: mov      x0, x26
  0x282e2c0: mov      x1, xzr
  0x282e2c4: mov      x2, xzr
  0x282e2c8: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282e2cc: tbz      w0, #0, #0x282d9ac
  0x282e2d0: ldr      x26, [x25, #0x18]
  0x282e2d4: cbz      x26, #0x282e998
  0x282e2d8: ldr      x8, [x26, #0x28]
  0x282e2dc: cbz      x8, #0x282d9ac
  0x282e2e0: ldr      w27, [x19]
  0x282e2e4: mov      x0, x25
  0x282e2e8: mov      x1, xzr
  0x282e2ec: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e2f0: mov      w1, w0
  0x282e2f4: mov      x0, x26
  0x282e2f8: bl       #0x281611c ; -> CCharacterBattle$$GetLostHPRateValue
  0x282e2fc: add      w8, w0, w27
  0x282e300: b        #0x282e074
  0x282e304: mov      x0, x25
  0x282e308: mov      x1, xzr
  0x282e30c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e310: cmp      w0, #0x6e
  0x282e314: b.ne     #0x282e428
  0x282e318: mov      w2, #0x17
  0x282e31c: mov      x0, x25
  0x282e320: mov      x1, xzr
  0x282e324: mov      x3, xzr
  0x282e328: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e32c: tbz      w0, #0, #0x282e428
  0x282e330: adrp     x8, #0x5596000
  0x282e334: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e338: ldr      x26, [x25, #0x20]
  0x282e33c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282e340: ldr      w8, [x0, #0xe0]
  0x282e344: cbnz     w8, #0x282e34c
  0x282e348: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e34c: mov      x0, x26
  0x282e350: mov      x1, xzr
  0x282e354: mov      x2, xzr
  0x282e358: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282e35c: tbnz     w0, #0, #0x282d9ac
  0x282e360: ldr      x0, [x25, #0x20]
  0x282e364: cbz      x0, #0x282e99c
  0x282e368: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x282e36c: cbz      x8, #0x282d9ac
  0x282e370: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x282e374: cbz      x0, #0x282d9ac
  0x282e378: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x282e37c: cbz      x0, #0x282e9d8
  0x282e380: adrp     x8, #0x5598000
  0x282e384: ldr      x8, [x8, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282e388: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e38c: add      x8, sp, #0x28
  0x282e390: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282e394: ldur     q0, [sp, #0x28]
  0x282e398: ldr      x8, [sp, #0x38]
  0x282e39c: mov      w27, wzr
  0x282e3a0: str      q0, [sp, #0x40]
  0x282e3a4: str      x8, [sp, #0x50]
  0x282e3a8: adrp     x8, #0x5598000
  0x282e3ac: ldr      x8, [x8, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282e3b0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e3b4: add      x0, sp, #0x40
  0x282e3b8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282e3bc: tbz      w0, #0, #0x282e714
  0x282e3c0: adrp     x8, #0x5596000
  0x282e3c4: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e3c8: ldr      x26, [sp, #0x50]
  0x282e3cc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282e3d0: ldr      w8, [x0, #0xe0]
  0x282e3d4: cbnz     w8, #0x282e3dc
  0x282e3d8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e3dc: mov      x0, x26
  0x282e3e0: mov      x1, xzr
  0x282e3e4: mov      x2, xzr
  0x282e3e8: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282e3ec: tbnz     w0, #0, #0x282e3a8
  0x282e3f0: cbz      x26, #0x282e798
  0x282e3f4: mov      x0, x26
  0x282e3f8: mov      w1, wzr
  0x282e3fc: bl       #0x282b82c ; -> CCharacterBattle$$GetBuffList
  0x282e400: adrp     x8, #0x5598000
  0x282e404: ldr      x8, [x8, #0xd60] ; = 0x0 (u64 @ 0x5598d60)
  0x282e408: mov      x26, x0
  0x282e40c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e410: bl       #0x3422e2c ; -> CExtension$$IsNullOrEmpty<object>
  0x282e414: tbnz     w0, #0, #0x282e3a8
  0x282e418: cbz      x26, #0x282e7ac
  0x282e41c: ldr      w8, [x26, #0x18]
  0x282e420: add      w27, w8, w27
  0x282e424: b        #0x282e3a8
  0x282e428: mov      x0, x25
  0x282e42c: mov      x1, xzr
  0x282e430: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e434: cmp      w0, #0x6f
  0x282e438: b.ne     #0x282e530
  0x282e43c: mov      w2, #0x17
  0x282e440: mov      x0, x25
  0x282e444: mov      x1, xzr
  0x282e448: mov      x3, xzr
  0x282e44c: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e450: tbz      w0, #0, #0x282e530
  0x282e454: adrp     x8, #0x5596000
  0x282e458: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e45c: ldr      x26, [x25, #0x20]
  0x282e460: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282e464: ldr      w8, [x0, #0xe0]
  0x282e468: cbnz     w8, #0x282e470
  0x282e46c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e470: mov      x0, x26
  0x282e474: mov      x1, xzr
  0x282e478: mov      x2, xzr
  0x282e47c: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282e480: tbnz     w0, #0, #0x282d9ac
  0x282e484: ldr      x0, [x25, #0x20]
  0x282e488: cbz      x0, #0x282e9a0
  0x282e48c: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x282e490: cbz      x8, #0x282d9ac
  0x282e494: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x282e498: cbz      x0, #0x282d9ac
  0x282e49c: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5598010)
  0x282e4a0: cbz      x0, #0x282e9e4
  0x282e4a4: adrp     x8, #0x5598000
  0x282e4a8: ldr      x8, [x8, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282e4ac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e4b0: add      x8, sp, #0x28
  0x282e4b4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282e4b8: ldur     q0, [sp, #0x28]
  0x282e4bc: ldr      x8, [sp, #0x38]
  0x282e4c0: mov      w27, wzr
  0x282e4c4: str      q0, [sp, #0x40]
  0x282e4c8: str      x8, [sp, #0x50]
  0x282e4cc: adrp     x8, #0x5598000
  0x282e4d0: ldr      x8, [x8, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282e4d4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e4d8: add      x0, sp, #0x40
  0x282e4dc: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282e4e0: tbz      w0, #0, #0x282e75c
  0x282e4e4: adrp     x8, #0x5596000
  0x282e4e8: ldr      x8, [x8, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e4ec: ldr      x26, [sp, #0x50]
  0x282e4f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x282e4f4: ldr      w8, [x0, #0xe0]
  0x282e4f8: cbnz     w8, #0x282e500
  0x282e4fc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e500: mov      x0, x26
  0x282e504: mov      x1, xzr
  0x282e508: mov      x2, xzr
  0x282e50c: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282e510: tbnz     w0, #0, #0x282e4cc
  0x282e514: cbz      x26, #0x282e7a4
  0x282e518: mov      x0, x26
  0x282e51c: mov      x1, xzr
  0x282e520: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x282e524: and      w8, w0, #1
  0x282e528: add      w27, w27, w8
  0x282e52c: b        #0x282e4cc
  0x282e530: mov      x0, x25
  0x282e534: mov      x1, xzr
  0x282e538: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e53c: cmp      w0, #0x70
  0x282e540: b.ne     #0x282e61c
  0x282e544: mov      w2, #0x17
  0x282e548: mov      x0, x25
  0x282e54c: mov      x1, xzr
  0x282e550: mov      x3, xzr
  0x282e554: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e558: tbz      w0, #0, #0x282e61c
  0x282e55c: adrp     x8, #0x59e4000
  0x282e560: ldrb     w8, [x8, #0xbd3]
  0x282e564: cbnz     w8, #0x282e580
  0x282e568: adrp     x0, #0x5598000
  0x282e56c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e570: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e574: adrp     x8, #0x59e4000
  0x282e578: mov      w9, #1
  0x282e57c: strb     w9, [x8, #0xbd3]
  0x282e580: adrp     x8, #0x5598000
  0x282e584: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e588: adrp     x9, #0x5596000
  0x282e58c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e590: ldr      x9, [x9, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e594: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e598: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x282e59c: ldr      x26, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e5a0: ldr      w9, [x0, #0xe0]
  0x282e5a4: cbnz     w9, #0x282e5ac
  0x282e5a8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e5ac: mov      x0, x26
  0x282e5b0: mov      x1, xzr
  0x282e5b4: mov      x2, xzr
  0x282e5b8: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282e5bc: tbz      w0, #0, #0x282e61c
  0x282e5c0: adrp     x8, #0x59e4000
  0x282e5c4: ldrb     w8, [x8, #0xbd3]
  0x282e5c8: cbnz     w8, #0x282e5e4
  0x282e5cc: adrp     x0, #0x5598000
  0x282e5d0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e5d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e5d8: adrp     x8, #0x59e4000
  0x282e5dc: mov      w9, #1
  0x282e5e0: strb     w9, [x8, #0xbd3]
  0x282e5e4: adrp     x8, #0x5598000
  0x282e5e8: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e5ec: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e5f0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e5f4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e5f8: cbz      x0, #0x282e9cc
  0x282e5fc: mov      x1, xzr
  0x282e600: bl       #0x259bf88 ; -> CDungeonScene$$get_IsMonadGate
  0x282e604: tbz      w0, #0, #0x282e61c
  0x282e608: ldr      w26, [x19]
  0x282e60c: mov      x0, x25
  0x282e610: mov      x1, xzr
  0x282e614: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e618: b        #0x282da9c
  0x282e61c: mov      x0, x25
  0x282e620: mov      x1, xzr
  0x282e624: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282e628: cmp      w0, #0x71
  0x282e62c: b.ne     #0x282d9ac
  0x282e630: mov      w2, #0x17
  0x282e634: mov      x0, x25
  0x282e638: mov      x1, xzr
  0x282e63c: mov      x3, xzr
  0x282e640: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282e644: tbz      w0, #0, #0x282d9ac
  0x282e648: adrp     x8, #0x59e4000
  0x282e64c: ldrb     w8, [x8, #0xbd3]
  0x282e650: cbnz     w8, #0x282e66c
  0x282e654: adrp     x0, #0x5598000
  0x282e658: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e65c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e660: adrp     x8, #0x59e4000
  0x282e664: mov      w9, #1
  0x282e668: strb     w9, [x8, #0xbd3]
  0x282e66c: adrp     x8, #0x5598000
  0x282e670: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e674: adrp     x9, #0x5596000
  0x282e678: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e67c: ldr      x9, [x9, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282e680: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e684: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x282e688: ldr      x26, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e68c: ldr      w9, [x0, #0xe0]
  0x282e690: cbnz     w9, #0x282e698
  0x282e694: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282e698: mov      x0, x26
  0x282e69c: mov      x1, xzr
  0x282e6a0: mov      x2, xzr
  0x282e6a4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x282e6a8: tbz      w0, #0, #0x282d9ac
  0x282e6ac: adrp     x8, #0x59e4000
  0x282e6b0: ldrb     w8, [x8, #0xbd3]
  0x282e6b4: cbnz     w8, #0x282e6d0
  0x282e6b8: adrp     x0, #0x5598000
  0x282e6bc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e6c0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e6c4: adrp     x8, #0x59e4000
  0x282e6c8: mov      w9, #1
  0x282e6cc: strb     w9, [x8, #0xbd3]
  0x282e6d0: adrp     x8, #0x5598000
  0x282e6d4: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e6d8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e6dc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e6e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e6e4: cbz      x8, #0x282e9d4
  0x282e6e8: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x282e6ec: cbz      x8, #0x282e9d0
  0x282e6f0: ldr      w0, [x8, #0xa4]
  0x282e6f4: mov      x1, xzr
  0x282e6f8: bl       #0x2cbf540 ; -> CExtension$$IsTowerModes
  0x282e6fc: tbz      w0, #0, #0x282d9ac
  0x282e700: ldr      w26, [x19]
  0x282e704: mov      x0, x25
  0x282e708: mov      x1, xzr
  0x282e70c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e710: b        #0x282da9c
  0x282e714: str      w27, [sp, #0x20]
  0x282e718: mov      x26, xzr
  0x282e71c: mov      w27, #0x1c
  0x282e720: adrp     x8, #0x5598000
  0x282e724: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282e728: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e72c: add      x0, sp, #0x40
  0x282e730: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e734: cbnz     x26, #0x282e9dc
  0x282e738: cmp      w27, #0x1c
  0x282e73c: b.eq     #0x282e744
  0x282e740: cbnz     w27, #0x282e900
  0x282e744: ldr      w26, [x19]
  0x282e748: mov      x0, x25
  0x282e74c: mov      x1, xzr
  0x282e750: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e754: ldr      w8, [sp, #0x20]
  0x282e758: b        #0x282e790
  0x282e75c: mov      x26, xzr
  0x282e760: adrp     x8, #0x5598000
  0x282e764: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282e768: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e76c: add      x0, sp, #0x40
  0x282e770: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e774: cbnz     x26, #0x282e9e8
  0x282e778: ldr      w26, [x19]
  0x282e77c: mov      x0, x25
  0x282e780: mov      x1, xzr
  0x282e784: bl       #0x232548c ; -> CBuff$$get_Value
  0x282e788: mov      w8, #4
  0x282e78c: sub      w8, w8, w27
  0x282e790: madd     w8, w0, w8, w26
  0x282e794: b        #0x282e074
  0x282e798: str      w27, [sp, #0x20]
  0x282e79c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e7a0: b        #0x282e9f0
  0x282e7a4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e7a8: b        #0x282e9f0
  0x282e7ac: str      w27, [sp, #0x20]
  0x282e7b0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e7b4: b        #0x282e9f0
  0x282e7b8: b        #0x282e814
  0x282e7bc: b        #0x282e7dc
  0x282e7c0: b        #0x282e7dc
  0x282e7c4: b        #0x282e7dc
  0x282e7c8: b        #0x282e810
  0x282e7cc: b        #0x282e814
  0x282e7d0: b        #0x282e810
  0x282e7d4: b        #0x282e810
  0x282e7d8: b        #0x282e7dc
  0x282e7dc: mov      x8, x1
  0x282e7e0: mov      x26, x0
  0x282e7e4: cmp      w8, #1
  0x282e7e8: str      x1, [sp, #0x18]
  0x282e7ec: b.ne     #0x282e9a4
  0x282e7f0: mov      x0, x26
  0x282e7f4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282e7f8: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x282e7fc: str      x8, [sp, #0x20]
  0x282e800: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282e804: ldr      x26, [sp, #0x20]
  0x282e808: b        #0x282e760
  0x282e80c: b        #0x282e810
  0x282e810: str      w27, [sp, #0x20]
  0x282e814: mov      x8, x1
  0x282e818: mov      x26, x0
  0x282e81c: cmp      w8, #1
  0x282e820: str      x1, [sp, #0x18]
  0x282e824: b.ne     #0x282e970
  0x282e828: mov      x0, x26
  0x282e82c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282e830: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x282e834: str      x8, [sp, #0x10]
  0x282e838: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282e83c: ldr      x26, [sp, #0x10]
  0x282e840: mov      w27, wzr
  0x282e844: b        #0x282e720
  0x282e848: adrp     x8, #0x5598000
  0x282e84c: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282e850: add      x0, sp, #0x60
  0x282e854: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e858: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e85c: adrp     x20, #0x59e4000
  0x282e860: ldrb     w8, [x20, #0xbd3]
  0x282e864: cbnz     w8, #0x282e87c
  0x282e868: adrp     x0, #0x5598000
  0x282e86c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e870: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282e874: mov      w8, #1
  0x282e878: strb     w8, [x20, #0xbd3]
  0x282e87c: adrp     x8, #0x5598000
  0x282e880: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x282e884: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e888: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x282e88c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e890: cbz      x0, #0x282e924
  0x282e894: mov      x1, xzr
  0x282e898: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x282e89c: tbz      w0, #0, #0x282e8d4
  0x282e8a0: adrp     x8, #0x5599000
  0x282e8a4: ldr      w20, [x19]
  0x282e8a8: ldr      x8, [x8, #0x2b0] ; = 0x0 (u64 @ 0x55992b0)
  0x282e8ac: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x282e8b0: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x282e8b4: cbz      x0, #0x282e924
  0x282e8b8: mov      x1, xzr
  0x282e8bc: bl       #0x255f0c8 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x282e8c0: cbz      x0, #0x282e924
  0x282e8c4: mov      x1, xzr
  0x282e8c8: bl       #0x25678fc ; -> CPvpRealtimeMatch$$get_FieldSkillDmg
  0x282e8cc: add      w8, w0, w20
  0x282e8d0: str      w8, [x19]
  0x282e8d4: ldp      x20, x19, [sp, #0x100]
  0x282e8d8: ldp      x22, x21, [sp, #0xf0]
  0x282e8dc: ldp      x24, x23, [sp, #0xe0]
  0x282e8e0: ldp      x26, x25, [sp, #0xd0]
  0x282e8e4: ldp      x28, x27, [sp, #0xc0]
  0x282e8e8: ldp      x29, x30, [sp, #0xb0]
  0x282e8ec: ldp      d9, d8, [sp, #0xa0]
  0x282e8f0: ldp      d11, d10, [sp, #0x90]
  0x282e8f4: ldp      d13, d12, [sp, #0x80]
  0x282e8f8: add      sp, sp, #0x110
  0x282e8fc: ret      
  0x282e900: adrp     x8, #0x5598000
  0x282e904: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282e908: add      x0, sp, #0x60
  0x282e90c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e910: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e914: b        #0x282e8d4
  0x282e918: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e91c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e920: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e924: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e928: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e92c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e930: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e934: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e938: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e93c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e940: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e944: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e948: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e94c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e950: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e954: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e958: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e95c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e960: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e964: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e968: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e96c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e970: str      xzr, [sp, #0x10]
  0x282e974: adrp     x8, #0x5598000
  0x282e978: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282e97c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e980: add      x0, sp, #0x40
  0x282e984: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e988: ldr      x8, [sp, #0x10]
  0x282e98c: cbz      x8, #0x282ec70
  0x282e990: ldr      x0, [sp, #0x10]
  0x282e994: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282e998: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e99c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9a0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9a4: str      xzr, [sp, #0x20]
  0x282e9a8: adrp     x8, #0x5598000
  0x282e9ac: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282e9b0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282e9b4: add      x0, sp, #0x40
  0x282e9b8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282e9bc: ldr      x8, [sp, #0x20]
  0x282e9c0: cbz      x8, #0x282ec70
  0x282e9c4: ldr      x0, [sp, #0x20]
  0x282e9c8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282e9cc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9d0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9d4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9d8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9dc: mov      x0, x26
  0x282e9e0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282e9e4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282e9e8: mov      x0, x26
  0x282e9ec: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282e9f0: mov      x26, x0
  0x282e9f4: str      x1, [sp, #0x18]
  0x282e9f8: b        #0x282e974
  0x282e9fc: mov      x26, x0
  0x282ea00: str      x1, [sp, #0x18]
  0x282ea04: b        #0x282e9a8
  0x282ea08: b        #0x282ece4
  0x282ea0c: b        #0x282ece4
  0x282ea10: b        #0x282ece4
  0x282ea14: b        #0x282ece4
  0x282ea18: b        #0x282ece4
  0x282ea1c: b        #0x282ece4
  0x282ea20: b        #0x282ece4
  0x282ea24: b        #0x282ece4
  0x282ea28: b        #0x282ece4
  0x282ea2c: b        #0x282ece4
  0x282ea30: b        #0x282ece4
  0x282ea34: b        #0x282ece4
  0x282ea38: b        #0x282ece4
  0x282ea3c: b        #0x282ece4
  0x282ea40: b        #0x282ece4
  0x282ea44: b        #0x282ece4
  0x282ea48: b        #0x282ece4
  0x282ea4c: b        #0x282ece4
  0x282ea50: b        #0x282ece4
  0x282ea54: b        #0x282ece4
  0x282ea58: b        #0x282ece4
  0x282ea5c: b        #0x282ece4
  0x282ea60: b        #0x282ece4
  0x282ea64: b        #0x282ece4
  0x282ea68: b        #0x282ec68
  0x282ea6c: b        #0x282ece4
  0x282ea70: b        #0x282ece4
  0x282ea74: b        #0x282ec68
  0x282ea78: b        #0x282ece4
  0x282ea7c: b        #0x282ece4
  0x282ea80: b        #0x282ece4
  0x282ea84: b        #0x282ece4
  0x282ea88: b        #0x282ece4
  0x282ea8c: b        #0x282ece4
  0x282ea90: b        #0x282ece4
  0x282ea94: b        #0x282ece4
  0x282ea98: b        #0x282ec68
  0x282ea9c: b        #0x282ece4
  0x282eaa0: b        #0x282ece4
  0x282eaa4: b        #0x282ece4
  0x282eaa8: b        #0x282ece4
  0x282eaac: b        #0x282ece4
  0x282eab0: b        #0x282ece4
  0x282eab4: b        #0x282ece4
  0x282eab8: b        #0x282ece4
  0x282eabc: b        #0x282ece4
  0x282eac0: b        #0x282ece4
  0x282eac4: b        #0x282ec68
  0x282eac8: b        #0x282ec68
  0x282eacc: b        #0x282ece4
  0x282ead0: b        #0x282ece4
  0x282ead4: b        #0x282ec68
  0x282ead8: b        #0x282ece4
  0x282eadc: b        #0x282ece4
  0x282eae0: b        #0x282ece4
  0x282eae4: b        #0x282ec68
  0x282eae8: b        #0x282ece4
  0x282eaec: b        #0x282ec68
  0x282eaf0: b        #0x282ece4
  0x282eaf4: b        #0x282ece4
  0x282eaf8: b        #0x282ec68
  0x282eafc: b        #0x282ec68
  0x282eb00: b        #0x282ec68
  0x282eb04: b        #0x282ec68
  0x282eb08: b        #0x282ec68
  0x282eb0c: b        #0x282ece4
  0x282eb10: b        #0x282ec68
  0x282eb14: b        #0x282ec68
  0x282eb18: b        #0x282ec68
  0x282eb1c: b        #0x282ec68
  0x282eb20: b        #0x282ec68
  0x282eb24: b        #0x282ec68
  0x282eb28: b        #0x282ec68
  0x282eb2c: b        #0x282ec68
  0x282eb30: b        #0x282ec68
  0x282eb34: b        #0x282ec68
  0x282eb38: b        #0x282ece4
  0x282eb3c: b        #0x282ec68
  0x282eb40: b        #0x282ec68
  0x282eb44: b        #0x282ec68
  0x282eb48: b        #0x282ec68
  0x282eb4c: b        #0x282ec68
  0x282eb50: b        #0x282ece4
  0x282eb54: b        #0x282ec68
  0x282eb58: b        #0x282ec68
  0x282eb5c: b        #0x282ec68
  0x282eb60: b        #0x282ec68
  0x282eb64: b        #0x282ec68
  0x282eb68: b        #0x282ec68
  0x282eb6c: b        #0x282ec68
  0x282eb70: b        #0x282ec68
  0x282eb74: b        #0x282ec68
  0x282eb78: b        #0x282ec68
  0x282eb7c: b        #0x282ec68
  0x282eb80: b        #0x282ec68
  0x282eb84: b        #0x282ec68
  0x282eb88: b        #0x282ec68
  0x282eb8c: b        #0x282ec68
  0x282eb90: b        #0x282ec68
  0x282eb94: b        #0x282ec68
  0x282eb98: b        #0x282ec68
  0x282eb9c: b        #0x282ec68
  0x282eba0: b        #0x282ec68
  0x282eba4: b        #0x282ec68
  0x282eba8: b        #0x282ec68
  0x282ebac: b        #0x282ec68
  0x282ebb0: b        #0x282ec68
  0x282ebb4: b        #0x282ec68
  0x282ebb8: b        #0x282ec68
  0x282ebbc: b        #0x282ec68
  0x282ebc0: b        #0x282ec68
  0x282ebc4: b        #0x282ec68
  0x282ebc8: b        #0x282ec68
  0x282ebcc: b        #0x282ec68
  0x282ebd0: b        #0x282ec68
  0x282ebd4: b        #0x282ec68
  0x282ebd8: b        #0x282ec68
  0x282ebdc: b        #0x282ec68
  0x282ebe0: b        #0x282ec68
  0x282ebe4: b        #0x282ec68
  0x282ebe8: b        #0x282ec68
  0x282ebec: b        #0x282ec68
  0x282ebf0: b        #0x282ec68
  0x282ebf4: b        #0x282ec68
  0x282ebf8: b        #0x282ec68
  0x282ebfc: b        #0x282ec68
  0x282ec00: b        #0x282ec68
  0x282ec04: b        #0x282ec68
  0x282ec08: b        #0x282ec68
  0x282ec0c: b        #0x282ec68
  0x282ec10: b        #0x282ec68
  0x282ec14: b        #0x282ec68
  0x282ec18: b        #0x282ec68
  0x282ec1c: b        #0x282ec68
  0x282ec20: b        #0x282ec68
  0x282ec24: b        #0x282ec68
  0x282ec28: b        #0x282ec68
  0x282ec2c: b        #0x282ec68
  0x282ec30: b        #0x282ec68
  0x282ec34: b        #0x282ec68
  0x282ec38: b        #0x282ec68
  0x282ec3c: b        #0x282ec68
  0x282ec40: b        #0x282ec68
  0x282ec44: b        #0x282ec68
  0x282ec48: b        #0x282ec68
  0x282ec4c: b        #0x282ec68
  0x282ec50: b        #0x282ec68
  0x282ec54: b        #0x282ec68
  0x282ec58: b        #0x282ec68
  0x282ec5c: b        #0x282ec68
  0x282ec60: b        #0x282ec68
  0x282ec64: b        #0x282ec68
  0x282ec68: str      x1, [sp, #0x18]
  0x282ec6c: mov      x26, x0
  0x282ec70: ldr      x8, [sp, #0x18]
  0x282ec74: cmp      w8, #1
  0x282ec78: b.ne     #0x282ecac
  0x282ec7c: mov      x0, x26
  0x282ec80: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282ec84: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x282ec88: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282ec8c: adrp     x8, #0x5598000
  0x282ec90: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282ec94: add      x0, sp, #0x60
  0x282ec98: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282ec9c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282eca0: cbz      x21, #0x282e85c
  0x282eca4: mov      x0, x21
  0x282eca8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282ecac: mov      x21, xzr
  0x282ecb0: b        #0x282ecb8
  0x282ecb4: mov      x26, x0
  0x282ecb8: adrp     x8, #0x5598000
  0x282ecbc: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282ecc0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282ecc4: add      x0, sp, #0x60
  0x282ecc8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282eccc: cbnz     x21, #0x282ecd8
  0x282ecd0: mov      x0, x26
  0x282ecd4: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x282ecd8: mov      x0, x21
  0x282ecdc: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282ece0: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
  0x282ece4: mov      x26, x0
  0x282ece8: str      x1, [sp, #0x18]
  0x282ecec: b        #0x282ec70
