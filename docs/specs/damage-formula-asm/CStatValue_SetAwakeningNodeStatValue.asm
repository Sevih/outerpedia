; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetAwakeningNodeStatValue @ 0x2a069d4..0x2a06c18 (taille 580 octets) =====
  0x2a069d4: sub      sp, sp, #0x90
  0x2a069d8: stp      x30, x27, [sp, #0x40]
  0x2a069dc: stp      x26, x25, [sp, #0x50]
  0x2a069e0: stp      x24, x23, [sp, #0x60]
  0x2a069e4: stp      x22, x21, [sp, #0x70]
  0x2a069e8: stp      x20, x19, [sp, #0x80]
  0x2a069ec: adrp     x21, #0x59e8000
  0x2a069f0: adrp     x23, #0x5599000
  0x2a069f4: ldrb     w8, [x21, #0x5ea]
  0x2a069f8: ldr      x23, [x23, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a069fc: mov      x20, x1
  0x2a06a00: mov      x19, x0
  0x2a06a04: tbnz     w8, #0, #0x2a06a4c
  0x2a06a08: adrp     x0, #0x55ca000
  0x2a06a0c: ldr      x0, [x0, #0x698] ; = 0x0 (u64 @ 0x55ca698)
  0x2a06a10: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06a14: adrp     x0, #0x55ca000
  0x2a06a18: ldr      x0, [x0, #0x6a0] ; = 0x0 (u64 @ 0x55ca6a0)
  0x2a06a1c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06a20: adrp     x0, #0x55ca000
  0x2a06a24: ldr      x0, [x0, #0x6a8] ; = 0x0 (u64 @ 0x55ca6a8)
  0x2a06a28: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06a2c: adrp     x0, #0x55ca000
  0x2a06a30: ldr      x0, [x0, #0x6b0] ; = 0x0 (u64 @ 0x55ca6b0)
  0x2a06a34: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06a38: adrp     x0, #0x5599000
  0x2a06a3c: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06a40: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06a44: mov      w8, #1
  0x2a06a48: strb     w8, [x21, #0x5ea]
  0x2a06a4c: mov      x0, x19
  0x2a06a50: mov      w1, wzr
  0x2a06a54: stp      xzr, xzr, [sp, #0x20]
  0x2a06a58: str      xzr, [sp, #0x30]
  0x2a06a5c: bl       #0x2a04154 ; -> CStatValue$$set_m_nAwakeningValue
  0x2a06a60: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06a64: ldr      w8, [x0, #0xe0]
  0x2a06a68: cbnz     w8, #0x2a06a70
  0x2a06a6c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06a70: mov      w0, wzr
  0x2a06a74: mov      x1, xzr
  0x2a06a78: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a06a7c: stur     x0, [x19, #0x8c]
  0x2a06a80: str      w1, [x19, #0x94]
  0x2a06a84: cbz      x20, #0x2a06b7c
  0x2a06a88: adrp     x8, #0x55ca000
  0x2a06a8c: ldr      x8, [x8, #0x6b0] ; = 0x0 (u64 @ 0x55ca6b0)
  0x2a06a90: adrp     x24, #0x55ca000
  0x2a06a94: adrp     x22, #0x55ca000
  0x2a06a98: mov      x0, x20
  0x2a06a9c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ca000)
  0x2a06aa0: ldr      x24, [x24, #0x6a0] ; = 0x0 (u64 @ 0x55ca6a0)
  0x2a06aa4: ldr      x22, [x22, #0x698] ; = 0x0 (u64 @ 0x55ca698)
  0x2a06aa8: add      x8, sp, #8
  0x2a06aac: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2a06ab0: ldur     q0, [sp, #8]
  0x2a06ab4: ldr      x8, [sp, #0x18]
  0x2a06ab8: mov      w25, #1
  0x2a06abc: str      q0, [sp, #0x20]
  0x2a06ac0: str      x8, [sp, #0x30]
  0x2a06ac4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55ca000)
  0x2a06ac8: add      x0, sp, #0x20
  0x2a06acc: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2a06ad0: tbz      w0, #0, #0x2a06b70
  0x2a06ad4: ldr      x26, [sp, #0x30]
  0x2a06ad8: cbz      x26, #0x2a06b98
  0x2a06adc: ldr      w8, [x19, #0x10]
  0x2a06ae0: ldr      w9, [x26, #0x38]
  0x2a06ae4: cmp      w8, w9
  0x2a06ae8: b.ne     #0x2a06ac4
  0x2a06aec: ldr      w8, [x26, #0x3c]
  0x2a06af0: cmp      w8, #1
  0x2a06af4: b.eq     #0x2a06b50
  0x2a06af8: cmp      w8, #2
  0x2a06afc: b.ne     #0x2a06ac4
  0x2a06b00: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06b04: ldur     x21, [x19, #0x8c]
  0x2a06b08: ldr      w27, [x19, #0x94]
  0x2a06b0c: ldr      w8, [x0, #0xe0]
  0x2a06b10: cbnz     w8, #0x2a06b18
  0x2a06b14: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06b18: and      x8, x20, #0xffffffff00000000
  0x2a06b1c: orr      x20, x8, x27
  0x2a06b20: mov      x0, x21
  0x2a06b24: mov      x1, x20
  0x2a06b28: mov      x2, xzr
  0x2a06b2c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a06b30: ldr      w8, [x26, #0x40]
  0x2a06b34: add      w0, w8, w0
  0x2a06b38: mov      x1, xzr
  0x2a06b3c: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a06b40: stur     x0, [x19, #0x8c]
  0x2a06b44: str      w1, [x19, #0x94]
  0x2a06b48: strb     w25, [x19, #0xe0]
  0x2a06b4c: b        #0x2a06ac4
  0x2a06b50: strb     w25, [x19, #0xe0]
  0x2a06b54: mov      x0, x19
  0x2a06b58: bl       #0x2a041c4 ; -> CStatValue$$get_m_nAwakeningValue
  0x2a06b5c: ldr      w8, [x26, #0x40]
  0x2a06b60: add      w1, w8, w0
  0x2a06b64: mov      x0, x19
  0x2a06b68: bl       #0x2a04154 ; -> CStatValue$$set_m_nAwakeningValue
  0x2a06b6c: b        #0x2a06ac4
  0x2a06b70: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55ca000)
  0x2a06b74: add      x0, sp, #0x20
  0x2a06b78: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06b7c: ldp      x20, x19, [sp, #0x80]
  0x2a06b80: ldp      x22, x21, [sp, #0x70]
  0x2a06b84: ldp      x24, x23, [sp, #0x60]
  0x2a06b88: ldp      x26, x25, [sp, #0x50]
  0x2a06b8c: ldp      x30, x27, [sp, #0x40]
  0x2a06b90: add      sp, sp, #0x90
  0x2a06b94: ret      
  0x2a06b98: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2a06b9c: b        #0x2a06bb4
  0x2a06ba0: b        #0x2a06bb4
  0x2a06ba4: b        #0x2a06bb4
  0x2a06ba8: b        #0x2a06bb4
  0x2a06bac: b        #0x2a06bb4
  0x2a06bb0: b        #0x2a06bb4
  0x2a06bb4: mov      x19, x0
  0x2a06bb8: cmp      w1, #1
  0x2a06bbc: b.ne     #0x2a06be8
  0x2a06bc0: mov      x0, x19
  0x2a06bc4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2a06bc8: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2a06bcc: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2a06bd0: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55ca000)
  0x2a06bd4: add      x0, sp, #0x20
  0x2a06bd8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06bdc: cbz      x20, #0x2a06b7c
  0x2a06be0: mov      x0, x20
  0x2a06be4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2a06be8: mov      x20, xzr
  0x2a06bec: b        #0x2a06bf4
  0x2a06bf0: mov      x19, x0
  0x2a06bf4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55ca000)
  0x2a06bf8: add      x0, sp, #0x20
  0x2a06bfc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2a06c00: cbnz     x20, #0x2a06c0c
  0x2a06c04: mov      x0, x19
  0x2a06c08: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2a06c0c: mov      x0, x20
  0x2a06c10: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2a06c14: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
