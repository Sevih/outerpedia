; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetMonadGateEnchantNodeStatValue @ 0x2a06c18..0x2a06e5c (taille 580 octets) =====
  0x2a06c18: sub      sp, sp, #0x90
  0x2a06c1c: stp      x30, x27, [sp, #0x40]
  0x2a06c20: stp      x26, x25, [sp, #0x50]
  0x2a06c24: stp      x24, x23, [sp, #0x60]
  0x2a06c28: stp      x22, x21, [sp, #0x70]
  0x2a06c2c: stp      x20, x19, [sp, #0x80]
  0x2a06c30: adrp     x21, #0x59e8000
  0x2a06c34: adrp     x23, #0x5599000
  0x2a06c38: ldrb     w8, [x21, #0x5eb]
  0x2a06c3c: ldr      x23, [x23, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06c40: mov      x20, x1
  0x2a06c44: mov      x19, x0
  0x2a06c48: tbnz     w8, #0, #0x2a06c90
  0x2a06c4c: adrp     x0, #0x55c5000
  0x2a06c50: ldr      x0, [x0, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x2a06c54: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06c58: adrp     x0, #0x55c5000
  0x2a06c5c: ldr      x0, [x0, #0x4d8] ; = 0x0 (u64 @ 0x55c54d8)
  0x2a06c60: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06c64: adrp     x0, #0x55c5000
  0x2a06c68: ldr      x0, [x0, #0x4f0] ; = 0x0 (u64 @ 0x55c54f0)
  0x2a06c6c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06c70: adrp     x0, #0x55c5000
  0x2a06c74: ldr      x0, [x0, #0x510] ; = 0x0 (u64 @ 0x55c5510)
  0x2a06c78: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06c7c: adrp     x0, #0x5599000
  0x2a06c80: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06c84: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06c88: mov      w8, #1
  0x2a06c8c: strb     w8, [x21, #0x5eb]
  0x2a06c90: mov      x0, x19
  0x2a06c94: mov      w1, wzr
  0x2a06c98: stp      xzr, xzr, [sp, #0x20]
  0x2a06c9c: str      xzr, [sp, #0x30]
  0x2a06ca0: bl       #0x2a04228 ; -> CStatValue$$set_m_nMonadEnchantValue
  0x2a06ca4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06ca8: ldr      w8, [x0, #0xe0]
  0x2a06cac: cbnz     w8, #0x2a06cb4
  0x2a06cb0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06cb4: mov      w0, wzr
  0x2a06cb8: mov      x1, xzr
  0x2a06cbc: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a06cc0: str      x0, [x19, #0x98]
  0x2a06cc4: str      w1, [x19, #0xa0]
  0x2a06cc8: cbz      x20, #0x2a06dc0
  0x2a06ccc: adrp     x8, #0x55c5000
  0x2a06cd0: ldr      x8, [x8, #0x510] ; = 0x0 (u64 @ 0x55c5510)
  0x2a06cd4: adrp     x24, #0x55c5000
  0x2a06cd8: adrp     x22, #0x55c5000
  0x2a06cdc: mov      x0, x20
  0x2a06ce0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06ce4: ldr      x24, [x24, #0x4d8] ; = 0x0 (u64 @ 0x55c54d8)
  0x2a06ce8: ldr      x22, [x22, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x2a06cec: add      x8, sp, #8
  0x2a06cf0: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2a06cf4: ldur     q0, [sp, #8]
  0x2a06cf8: ldr      x8, [sp, #0x18]
  0x2a06cfc: mov      w25, #1
  0x2a06d00: str      q0, [sp, #0x20]
  0x2a06d04: str      x8, [sp, #0x30]
  0x2a06d08: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06d0c: add      x0, sp, #0x20
  0x2a06d10: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2a06d14: tbz      w0, #0, #0x2a06db4
  0x2a06d18: ldr      x26, [sp, #0x30]
  0x2a06d1c: cbz      x26, #0x2a06ddc
  0x2a06d20: ldr      w8, [x19, #0x10]
  0x2a06d24: ldr      w9, [x26, #0x54]
  0x2a06d28: cmp      w8, w9
  0x2a06d2c: b.ne     #0x2a06d08
  0x2a06d30: ldr      w8, [x26, #0x58]
  0x2a06d34: cmp      w8, #1
  0x2a06d38: b.eq     #0x2a06d94
  0x2a06d3c: cmp      w8, #2
  0x2a06d40: b.ne     #0x2a06d08
  0x2a06d44: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06d48: ldr      x21, [x19, #0x98]
  0x2a06d4c: ldr      w27, [x19, #0xa0]
  0x2a06d50: ldr      w8, [x0, #0xe0]
  0x2a06d54: cbnz     w8, #0x2a06d5c
  0x2a06d58: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06d5c: and      x8, x20, #0xffffffff00000000
  0x2a06d60: orr      x20, x8, x27
  0x2a06d64: mov      x0, x21
  0x2a06d68: mov      x1, x20
  0x2a06d6c: mov      x2, xzr
  0x2a06d70: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06d74: ldr      w8, [x26, #0x5c]
  0x2a06d78: add      w0, w8, w0
  0x2a06d7c: mov      x1, xzr
  0x2a06d80: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a06d84: str      x0, [x19, #0x98]
  0x2a06d88: str      w1, [x19, #0xa0]
  0x2a06d8c: strb     w25, [x19, #0xe0]
  0x2a06d90: b        #0x2a06d08
  0x2a06d94: strb     w25, [x19, #0xe0]
  0x2a06d98: mov      x0, x19
  0x2a06d9c: bl       #0x2a04298 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x2a06da0: ldr      w8, [x26, #0x5c]
  0x2a06da4: add      w1, w8, w0
  0x2a06da8: mov      x0, x19
  0x2a06dac: bl       #0x2a04228 ; -> CStatValue$$set_m_nMonadEnchantValue
  0x2a06db0: b        #0x2a06d08
  0x2a06db4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06db8: add      x0, sp, #0x20
  0x2a06dbc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06dc0: ldp      x20, x19, [sp, #0x80]
  0x2a06dc4: ldp      x22, x21, [sp, #0x70]
  0x2a06dc8: ldp      x24, x23, [sp, #0x60]
  0x2a06dcc: ldp      x26, x25, [sp, #0x50]
  0x2a06dd0: ldp      x30, x27, [sp, #0x40]
  0x2a06dd4: add      sp, sp, #0x90
  0x2a06dd8: ret      
  0x2a06ddc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2a06de0: b        #0x2a06df8
  0x2a06de4: b        #0x2a06df8
  0x2a06de8: b        #0x2a06df8
  0x2a06dec: b        #0x2a06df8
  0x2a06df0: b        #0x2a06df8
  0x2a06df4: b        #0x2a06df8
  0x2a06df8: mov      x19, x0
  0x2a06dfc: cmp      w1, #1
  0x2a06e00: b.ne     #0x2a06e2c
  0x2a06e04: mov      x0, x19
  0x2a06e08: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2a06e0c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2a06e10: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2a06e14: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06e18: add      x0, sp, #0x20
  0x2a06e1c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06e20: cbz      x20, #0x2a06dc0
  0x2a06e24: mov      x0, x20
  0x2a06e28: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2a06e2c: mov      x20, xzr
  0x2a06e30: b        #0x2a06e38
  0x2a06e34: mov      x19, x0
  0x2a06e38: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06e3c: add      x0, sp, #0x20
  0x2a06e40: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06e44: cbnz     x20, #0x2a06e50
  0x2a06e48: mov      x0, x19
  0x2a06e4c: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2a06e50: mov      x0, x20
  0x2a06e54: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2a06e58: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
