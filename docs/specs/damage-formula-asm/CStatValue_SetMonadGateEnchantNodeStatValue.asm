; ===== CStatValue_SetMonadGateEnchantNodeStatValue @ 0x28d3aec..0x28d3d30 (taille 580 octets) =====
  0x28d3aec: sub      sp, sp, #0x90
  0x28d3af0: stp      x30, x27, [sp, #0x40]
  0x28d3af4: stp      x26, x25, [sp, #0x50]
  0x28d3af8: stp      x24, x23, [sp, #0x60]
  0x28d3afc: stp      x22, x21, [sp, #0x70]
  0x28d3b00: stp      x20, x19, [sp, #0x80]
  0x28d3b04: adrp     x21, #0x5958000
  0x28d3b08: adrp     x23, #0x5511000
  0x28d3b0c: ldrb     w8, [x21, #0xbca]
  0x28d3b10: ldr      x23, [x23, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d3b14: mov      x20, x1
  0x28d3b18: mov      x19, x0
  0x28d3b1c: tbnz     w8, #0, #0x28d3b64
  0x28d3b20: adrp     x0, #0x5536000
  0x28d3b24: ldr      x0, [x0, #0xe28] ; = 0x0 (u64 @ 0x5536e28)
  0x28d3b28: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3b2c: adrp     x0, #0x5536000
  0x28d3b30: ldr      x0, [x0, #0xe30] ; = 0x0 (u64 @ 0x5536e30)
  0x28d3b34: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3b38: adrp     x0, #0x5536000
  0x28d3b3c: ldr      x0, [x0, #0xe48] ; = 0x0 (u64 @ 0x5536e48)
  0x28d3b40: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3b44: adrp     x0, #0x5536000
  0x28d3b48: ldr      x0, [x0, #0xe68] ; = 0x0 (u64 @ 0x5536e68)
  0x28d3b4c: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3b50: adrp     x0, #0x5511000
  0x28d3b54: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d3b58: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3b5c: mov      w8, #1
  0x28d3b60: strb     w8, [x21, #0xbca]
  0x28d3b64: mov      x0, x19
  0x28d3b68: mov      w1, wzr
  0x28d3b6c: stp      xzr, xzr, [sp, #0x20]
  0x28d3b70: str      xzr, [sp, #0x30]
  0x28d3b74: bl       #0x28d12b0 ; -> CStatValue$$set_m_nMonadEnchantValue
  0x28d3b78: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d3b7c: ldr      w8, [x0, #0xe0]
  0x28d3b80: cbnz     w8, #0x28d3b88
  0x28d3b84: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3b88: mov      w0, wzr
  0x28d3b8c: mov      x1, xzr
  0x28d3b90: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d3b94: str      x0, [x19, #0x98]
  0x28d3b98: str      w1, [x19, #0xa0]
  0x28d3b9c: cbz      x20, #0x28d3c94
  0x28d3ba0: adrp     x8, #0x5536000
  0x28d3ba4: ldr      x8, [x8, #0xe68] ; = 0x0 (u64 @ 0x5536e68)
  0x28d3ba8: adrp     x24, #0x5536000
  0x28d3bac: adrp     x22, #0x5536000
  0x28d3bb0: mov      x0, x20
  0x28d3bb4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x28d3bb8: ldr      x24, [x24, #0xe30] ; = 0x0 (u64 @ 0x5536e30)
  0x28d3bbc: ldr      x22, [x22, #0xe28] ; = 0x0 (u64 @ 0x5536e28)
  0x28d3bc0: add      x8, sp, #8
  0x28d3bc4: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x28d3bc8: ldur     q0, [sp, #8]
  0x28d3bcc: ldr      x8, [sp, #0x18]
  0x28d3bd0: mov      w25, #1
  0x28d3bd4: str      q0, [sp, #0x20]
  0x28d3bd8: str      x8, [sp, #0x30]
  0x28d3bdc: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x28d3be0: add      x0, sp, #0x20
  0x28d3be4: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x28d3be8: tbz      w0, #0, #0x28d3c88
  0x28d3bec: ldr      x26, [sp, #0x30]
  0x28d3bf0: cbz      x26, #0x28d3cb0
  0x28d3bf4: ldr      w8, [x19, #0x10]
  0x28d3bf8: ldr      w9, [x26, #0x54]
  0x28d3bfc: cmp      w8, w9
  0x28d3c00: b.ne     #0x28d3bdc
  0x28d3c04: ldr      w8, [x26, #0x58]
  0x28d3c08: cmp      w8, #1
  0x28d3c0c: b.eq     #0x28d3c68
  0x28d3c10: cmp      w8, #2
  0x28d3c14: b.ne     #0x28d3bdc
  0x28d3c18: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d3c1c: ldr      x21, [x19, #0x98]
  0x28d3c20: ldr      w27, [x19, #0xa0]
  0x28d3c24: ldr      w8, [x0, #0xe0]
  0x28d3c28: cbnz     w8, #0x28d3c30
  0x28d3c2c: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3c30: and      x8, x20, #0xffffffff00000000
  0x28d3c34: orr      x20, x8, x27
  0x28d3c38: mov      x0, x21
  0x28d3c3c: mov      x1, x20
  0x28d3c40: mov      x2, xzr
  0x28d3c44: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3c48: ldr      w8, [x26, #0x5c]
  0x28d3c4c: add      w0, w8, w0
  0x28d3c50: mov      x1, xzr
  0x28d3c54: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d3c58: str      x0, [x19, #0x98]
  0x28d3c5c: str      w1, [x19, #0xa0]
  0x28d3c60: strb     w25, [x19, #0xe0]
  0x28d3c64: b        #0x28d3bdc
  0x28d3c68: strb     w25, [x19, #0xe0]
  0x28d3c6c: mov      x0, x19
  0x28d3c70: bl       #0x28d1320 ; -> CStatValue$$get_m_nMonadEnchantValue
  0x28d3c74: ldr      w8, [x26, #0x5c]
  0x28d3c78: add      w1, w8, w0
  0x28d3c7c: mov      x0, x19
  0x28d3c80: bl       #0x28d12b0 ; -> CStatValue$$set_m_nMonadEnchantValue
  0x28d3c84: b        #0x28d3bdc
  0x28d3c88: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x28d3c8c: add      x0, sp, #0x20
  0x28d3c90: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3c94: ldp      x20, x19, [sp, #0x80]
  0x28d3c98: ldp      x22, x21, [sp, #0x70]
  0x28d3c9c: ldp      x24, x23, [sp, #0x60]
  0x28d3ca0: ldp      x26, x25, [sp, #0x50]
  0x28d3ca4: ldp      x30, x27, [sp, #0x40]
  0x28d3ca8: add      sp, sp, #0x90
  0x28d3cac: ret      
  0x28d3cb0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x28d3cb4: b        #0x28d3ccc
  0x28d3cb8: b        #0x28d3ccc
  0x28d3cbc: b        #0x28d3ccc
  0x28d3cc0: b        #0x28d3ccc
  0x28d3cc4: b        #0x28d3ccc
  0x28d3cc8: b        #0x28d3ccc
  0x28d3ccc: mov      x19, x0
  0x28d3cd0: cmp      w1, #1
  0x28d3cd4: b.ne     #0x28d3d00
  0x28d3cd8: mov      x0, x19
  0x28d3cdc: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x28d3ce0: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x28d3ce4: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x28d3ce8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x28d3cec: add      x0, sp, #0x20
  0x28d3cf0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3cf4: cbz      x20, #0x28d3c94
  0x28d3cf8: mov      x0, x20
  0x28d3cfc: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x28d3d00: mov      x20, xzr
  0x28d3d04: b        #0x28d3d0c
  0x28d3d08: mov      x19, x0
  0x28d3d0c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x28d3d10: add      x0, sp, #0x20
  0x28d3d14: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3d18: cbnz     x20, #0x28d3d24
  0x28d3d1c: mov      x0, x19
  0x28d3d20: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x28d3d24: mov      x0, x20
  0x28d3d28: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x28d3d2c: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
