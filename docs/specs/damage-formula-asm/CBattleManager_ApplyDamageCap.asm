; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ApplyDamageCap @ 0x2319ab4..0x2319cf8 (taille 580 octets) =====
  0x2319ab4: sub      sp, sp, #0x80
  0x2319ab8: stp      x30, x25, [sp, #0x40]
  0x2319abc: stp      x24, x23, [sp, #0x50]
  0x2319ac0: stp      x22, x21, [sp, #0x60]
  0x2319ac4: stp      x20, x19, [sp, #0x70]
  0x2319ac8: adrp     x22, #0x59e4000
  0x2319acc: ldrb     w8, [x22, #0xba1]
  0x2319ad0: mov      w19, w2
  0x2319ad4: mov      w20, w1
  0x2319ad8: mov      x21, x0
  0x2319adc: tbnz     w8, #0, #0x2319b30
  0x2319ae0: adrp     x0, #0x5598000
  0x2319ae4: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2319ae8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319aec: adrp     x0, #0x5598000
  0x2319af0: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2319af4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319af8: adrp     x0, #0x5598000
  0x2319afc: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2319b00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319b04: adrp     x0, #0x5598000
  0x2319b08: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x2319b0c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319b10: adrp     x0, #0x5598000
  0x2319b14: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2319b18: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319b1c: adrp     x0, #0x5599000
  0x2319b20: ldr      x0, [x0, #0x200] ; = 0x0 (u64 @ 0x5599200)
  0x2319b24: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319b28: mov      w8, #1
  0x2319b2c: strb     w8, [x22, #0xba1]
  0x2319b30: stp      xzr, xzr, [sp, #0x20]
  0x2319b34: str      xzr, [sp, #0x30]
  0x2319b38: str      wzr, [sp, #0x1c]
  0x2319b3c: cbz      x21, #0x2319c68
  0x2319b40: mov      x0, x21
  0x2319b44: mov      w1, w20
  0x2319b48: mov      x2, xzr
  0x2319b4c: bl       #0x2820eac ; -> CCharacterBattle$$GetBuffListByType
  0x2319b50: cbz      x0, #0x2319c68
  0x2319b54: adrp     x8, #0x5598000
  0x2319b58: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2319b5c: adrp     x22, #0x5598000
  0x2319b60: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2319b64: adrp     x23, #0x5599000
  0x2319b68: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2319b6c: adrp     x24, #0x5598000
  0x2319b70: adrp     x21, #0x5598000
  0x2319b74: ldr      x23, [x23, #0x200] ; = 0x0 (u64 @ 0x5599200)
  0x2319b78: ldr      x24, [x24, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2319b7c: ldr      x21, [x21, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2319b80: mov      x8, sp
  0x2319b84: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2319b88: ldr      q0, [sp]
  0x2319b8c: ldr      x8, [sp, #0x10]
  0x2319b90: str      q0, [sp, #0x20]
  0x2319b94: str      x8, [sp, #0x30]
  0x2319b98: mov      w25, w19
  0x2319b9c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2319ba0: add      x0, sp, #0x20
  0x2319ba4: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2319ba8: tbz      w0, #0, #0x2319c3c
  0x2319bac: ldr      x20, [sp, #0x30]
  0x2319bb0: cbz      x20, #0x2319b9c
  0x2319bb4: mov      x0, x20
  0x2319bb8: mov      x1, xzr
  0x2319bbc: mov      x2, xzr
  0x2319bc0: bl       #0x23279e0 ; -> CBuff$$CheckCondition
  0x2319bc4: tbz      w0, #0, #0x2319b9c
  0x2319bc8: mov      x0, x20
  0x2319bcc: mov      x1, xzr
  0x2319bd0: bl       #0x232548c ; -> CBuff$$get_Value
  0x2319bd4: cmp      w25, w0
  0x2319bd8: b.le     #0x2319b9c
  0x2319bdc: mov      x0, x20
  0x2319be0: mov      x1, xzr
  0x2319be4: bl       #0x232548c ; -> CBuff$$get_Value
  0x2319be8: mov      w19, w0
  0x2319bec: mov      x0, x20
  0x2319bf0: mov      x1, xzr
  0x2319bf4: bl       #0x232548c ; -> CBuff$$get_Value
  0x2319bf8: str      w0, [sp, #0x1c]
  0x2319bfc: add      x0, sp, #0x1c
  0x2319c00: mov      x1, xzr
  0x2319c04: bl       #0x4910684 ; -> System.Int32$$ToString
  0x2319c08: mov      x1, x0
  0x2319c0c: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2319c10: mov      x2, xzr
  0x2319c14: bl       #0x477b31c ; -> System.String$$Concat
  0x2319c18: mov      x20, x0
  0x2319c1c: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x2319c20: ldr      w8, [x0, #0xe0]
  0x2319c24: cbnz     w8, #0x2319c2c
  0x2319c28: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319c2c: mov      x0, x20
  0x2319c30: mov      x1, xzr
  0x2319c34: bl       #0x2cb5f24 ; -> CDebug$$Log
  0x2319c38: b        #0x2319b98
  0x2319c3c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2319c40: add      x0, sp, #0x20
  0x2319c44: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319c48: mov      w19, w25
  0x2319c4c: mov      w0, w19
  0x2319c50: ldp      x20, x19, [sp, #0x70]
  0x2319c54: ldp      x22, x21, [sp, #0x60]
  0x2319c58: ldp      x24, x23, [sp, #0x50]
  0x2319c5c: ldp      x30, x25, [sp, #0x40]
  0x2319c60: add      sp, sp, #0x80
  0x2319c64: ret      
  0x2319c68: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2319c6c: b        #0x2319c78
  0x2319c70: b        #0x2319c8c
  0x2319c74: b        #0x2319c78
  0x2319c78: mov      x22, x21
  0x2319c7c: mov      x20, x0
  0x2319c80: b        #0x2319c98
  0x2319c84: b        #0x2319c8c
  0x2319c88: b        #0x2319c8c
  0x2319c8c: mov      x22, x21
  0x2319c90: mov      x20, x0
  0x2319c94: mov      w19, w25
  0x2319c98: cmp      w1, #1
  0x2319c9c: b.ne     #0x2319cc8
  0x2319ca0: mov      x0, x20
  0x2319ca4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2319ca8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2319cac: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2319cb0: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2319cb4: add      x0, sp, #0x20
  0x2319cb8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319cbc: cbz      x21, #0x2319c4c
  0x2319cc0: mov      x0, x21
  0x2319cc4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2319cc8: mov      x21, xzr
  0x2319ccc: b        #0x2319cd4
  0x2319cd0: mov      x20, x0
  0x2319cd4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2319cd8: add      x0, sp, #0x20
  0x2319cdc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2319ce0: cbnz     x21, #0x2319cec
  0x2319ce4: mov      x0, x20
  0x2319ce8: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2319cec: mov      x0, x21
  0x2319cf0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2319cf4: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
