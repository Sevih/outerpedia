; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetDotDamageIncreaseBuffValue @ 0x2831b34..0x2831dd8 (taille 676 octets) =====
  0x2831b34: sub      sp, sp, #0x80
  0x2831b38: stp      x30, x25, [sp, #0x40]
  0x2831b3c: stp      x24, x23, [sp, #0x50]
  0x2831b40: stp      x22, x21, [sp, #0x60]
  0x2831b44: stp      x20, x19, [sp, #0x70]
  0x2831b48: adrp     x22, #0x59e7000
  0x2831b4c: adrp     x21, #0x5598000
  0x2831b50: ldrb     w8, [x22, #0x6fe]
  0x2831b54: ldr      x21, [x21, #0xe60] ; = 0x0 (u64 @ 0x5598e60)
  0x2831b58: mov      w20, w1
  0x2831b5c: mov      x19, x0
  0x2831b60: tbnz     w8, #0, #0x2831ba8
  0x2831b64: adrp     x0, #0x5598000
  0x2831b68: ldr      x0, [x0, #0xe60] ; = 0x0 (u64 @ 0x5598e60)
  0x2831b6c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831b70: adrp     x0, #0x5598000
  0x2831b74: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831b78: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831b7c: adrp     x0, #0x5598000
  0x2831b80: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2831b84: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831b88: adrp     x0, #0x5598000
  0x2831b8c: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x2831b90: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831b94: adrp     x0, #0x5598000
  0x2831b98: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2831b9c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2831ba0: mov      w8, #1
  0x2831ba4: strb     w8, [x22, #0x6fe]
  0x2831ba8: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2831bac: stp      xzr, xzr, [sp, #0x20]
  0x2831bb0: str      xzr, [sp, #0x30]
  0x2831bb4: ldr      w8, [x0, #0xe0]
  0x2831bb8: cbnz     w8, #0x2831bc0
  0x2831bbc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2831bc0: sub      w22, w20, #0x38
  0x2831bc4: cmp      w22, #6
  0x2831bc8: b.hi     #0x2831c10
  0x2831bcc: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2831bd0: ldr      w8, [x0, #0xe0]
  0x2831bd4: cbnz     w8, #0x2831bdc
  0x2831bd8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2831bdc: cmp      w22, #6
  0x2831be0: b.hi     #0x2831c3c
  0x2831be4: adrp     x8, #0x1071000
  0x2831be8: add      x8, x8, #0xb71
  0x2831bec: adr      x9, #0x2831c04
  0x2831bf0: ldrb     w10, [x8, x22]
  0x2831bf4: add      x9, x9, x10, lsl #2
  0x2831bf8: mov      w23, wzr
  0x2831bfc: mov      w24, #0x47
  0x2831c00: br       x9
  0x2831c04: mov      w23, wzr
  0x2831c08: mov      w24, #0x46
  0x2831c0c: b        #0x2831c5c
  0x2831c10: mov      w20, wzr
  0x2831c14: b        #0x2831d30
  0x2831c18: mov      w23, wzr
  0x2831c1c: mov      w24, #0x4a
  0x2831c20: b        #0x2831c5c
  0x2831c24: mov      w23, wzr
  0x2831c28: mov      w24, #0x48
  0x2831c2c: b        #0x2831c5c
  0x2831c30: mov      w23, wzr
  0x2831c34: mov      w24, #0x49
  0x2831c38: b        #0x2831c5c
  0x2831c3c: mov      w24, wzr
  0x2831c40: mov      w23, #1
  0x2831c44: b        #0x2831c5c
  0x2831c48: mov      w23, wzr
  0x2831c4c: mov      w24, #0x4b
  0x2831c50: b        #0x2831c5c
  0x2831c54: mov      w23, wzr
  0x2831c58: mov      w24, #0x4c
  0x2831c5c: ldr      x0, [x19, #0x380]
  0x2831c60: cbz      x0, #0x2831d4c
  0x2831c64: adrp     x8, #0x5598000
  0x2831c68: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2831c6c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831c70: add      x8, sp, #8
  0x2831c74: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2831c78: ldur     q0, [sp, #8]
  0x2831c7c: ldr      x8, [sp, #0x18]
  0x2831c80: adrp     x25, #0x5598000
  0x2831c84: mov      w20, wzr
  0x2831c88: str      q0, [sp, #0x20]
  0x2831c8c: str      x8, [sp, #0x30]
  0x2831c90: ldr      x25, [x25, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2831c94: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x2831c98: add      x0, sp, #0x20
  0x2831c9c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2831ca0: tbz      w0, #0, #0x2831d1c
  0x2831ca4: ldr      x21, [sp, #0x30]
  0x2831ca8: cbz      x21, #0x2831c94
  0x2831cac: tbnz     w23, #0, #0x2831cc4
  0x2831cb0: mov      x0, x21
  0x2831cb4: mov      x1, xzr
  0x2831cb8: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x2831cbc: cmp      w0, w24
  0x2831cc0: b.eq     #0x2831cf4
  0x2831cc4: cmp      w22, #4
  0x2831cc8: b.hi     #0x2831ce0
  0x2831ccc: mov      x0, x21
  0x2831cd0: mov      x1, xzr
  0x2831cd4: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x2831cd8: cmp      w0, #0x4e
  0x2831cdc: b.eq     #0x2831cf4
  0x2831ce0: mov      x0, x21
  0x2831ce4: mov      x1, xzr
  0x2831ce8: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x2831cec: cmp      w0, #0x4f
  0x2831cf0: b.ne     #0x2831c94
  0x2831cf4: mov      x0, x21
  0x2831cf8: mov      x1, x19
  0x2831cfc: mov      x2, xzr
  0x2831d00: bl       #0x23279e0 ; -> CBuff$$CheckCondition
  0x2831d04: tbz      w0, #0, #0x2831c94
  0x2831d08: mov      x0, x21
  0x2831d0c: mov      x1, xzr
  0x2831d10: bl       #0x232548c ; -> CBuff$$get_Value
  0x2831d14: add      w20, w0, w20
  0x2831d18: b        #0x2831c94
  0x2831d1c: adrp     x8, #0x5598000
  0x2831d20: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831d24: add      x0, sp, #0x20
  0x2831d28: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831d2c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831d30: mov      w0, w20
  0x2831d34: ldp      x20, x19, [sp, #0x70]
  0x2831d38: ldp      x22, x21, [sp, #0x60]
  0x2831d3c: ldp      x24, x23, [sp, #0x50]
  0x2831d40: ldp      x30, x25, [sp, #0x40]
  0x2831d44: add      sp, sp, #0x80
  0x2831d48: ret      
  0x2831d4c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2831d50: b        #0x2831d64
  0x2831d54: b        #0x2831d64
  0x2831d58: b        #0x2831d64
  0x2831d5c: b        #0x2831d64
  0x2831d60: b        #0x2831d64
  0x2831d64: mov      x19, x0
  0x2831d68: cmp      w1, #1
  0x2831d6c: b.ne     #0x2831da0
  0x2831d70: mov      x0, x19
  0x2831d74: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2831d78: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x2831d7c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2831d80: adrp     x8, #0x5598000
  0x2831d84: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831d88: add      x0, sp, #0x20
  0x2831d8c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831d90: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831d94: cbz      x21, #0x2831d30
  0x2831d98: mov      x0, x21
  0x2831d9c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2831da0: mov      x21, xzr
  0x2831da4: b        #0x2831dac
  0x2831da8: mov      x19, x0
  0x2831dac: adrp     x8, #0x5598000
  0x2831db0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2831db4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2831db8: add      x0, sp, #0x20
  0x2831dbc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2831dc0: cbnz     x21, #0x2831dcc
  0x2831dc4: mov      x0, x19
  0x2831dc8: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2831dcc: mov      x0, x21
  0x2831dd0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2831dd4: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
