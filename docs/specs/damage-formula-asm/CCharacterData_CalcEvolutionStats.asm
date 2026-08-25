; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcEvolutionStats @ 0x290e978..0x290eb50 (taille 472 octets) =====
  0x290e978: sub      sp, sp, #0x60
  0x290e97c: stp      x30, x23, [sp, #0x30]
  0x290e980: stp      x22, x21, [sp, #0x40]
  0x290e984: stp      x20, x19, [sp, #0x50]
  0x290e988: adrp     x20, #0x59e7000
  0x290e98c: ldrb     w8, [x20, #0xea3]
  0x290e990: mov      x19, x0
  0x290e994: tbnz     w8, #0, #0x290e9e8
  0x290e998: adrp     x0, #0x55c5000
  0x290e99c: ldr      x0, [x0, #0x3d8] ; = 0x0 (u64 @ 0x55c53d8)
  0x290e9a0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9a4: adrp     x0, #0x55c5000
  0x290e9a8: ldr      x0, [x0, #0x3e0] ; = 0x0 (u64 @ 0x55c53e0)
  0x290e9ac: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9b0: adrp     x0, #0x55c5000
  0x290e9b4: ldr      x0, [x0, #0x3e8] ; = 0x0 (u64 @ 0x55c53e8)
  0x290e9b8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9bc: adrp     x0, #0x55c5000
  0x290e9c0: ldr      x0, [x0, #0x3f0] ; = 0x0 (u64 @ 0x55c53f0)
  0x290e9c4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9c8: adrp     x0, #0x55c5000
  0x290e9cc: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290e9d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9d4: adrp     x0, #0x55c5000
  0x290e9d8: ldr      x0, [x0, #0x3f8] ; = 0x0 (u64 @ 0x55c53f8)
  0x290e9dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290e9e0: mov      w8, #1
  0x290e9e4: strb     w8, [x20, #0xea3]
  0x290e9e8: movi     v0.2d, #0000000000000000
  0x290e9ec: mov      w1, #1
  0x290e9f0: mov      x0, x19
  0x290e9f4: mov      w2, wzr
  0x290e9f8: str      xzr, [sp, #0x20]
  0x290e9fc: stp      q0, q0, [sp]
  0x290ea00: bl       #0x290fcd4 ; -> CCharacterData$$GetEvolutionStat
  0x290ea04: ldr      x9, [x19, #0x40]
  0x290ea08: cbz      x9, #0x290eae0
  0x290ea0c: adrp     x8, #0x55c5000
  0x290ea10: ldr      x8, [x8, #0x3d8] ; = 0x0 (u64 @ 0x55c53d8)
  0x290ea14: adrp     x22, #0x55c5000
  0x290ea18: adrp     x23, #0x55c5000
  0x290ea1c: adrp     x21, #0x55c5000
  0x290ea20: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290ea24: ldr      x22, [x22, #0x3e8] ; = 0x0 (u64 @ 0x55c53e8)
  0x290ea28: ldr      x23, [x23, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290ea2c: ldr      x21, [x21, #0x3e0] ; = 0x0 (u64 @ 0x55c53e0)
  0x290ea30: mov      x19, x0
  0x290ea34: mov      x8, sp
  0x290ea38: mov      x0, x9
  0x290ea3c: bl       #0x4028a54 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x290ea40: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290ea44: mov      x0, sp
  0x290ea48: bl       #0x416d0bc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x290ea4c: tbz      w0, #0, #0x290eabc
  0x290ea50: ldr      x20, [sp, #0x18]
  0x290ea54: cbz      x20, #0x290eadc
  0x290ea58: ldr      x8, [x20]
  0x290ea5c: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ea60: ldrh     w9, [x8, #0x12e]
  0x290ea64: cbz      x9, #0x290ea88
  0x290ea68: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290ea6c: add      x10, x10, #8
  0x290ea70: ldur     x11, [x10, #-8]
  0x290ea74: cmp      x11, x1
  0x290ea78: b.eq     #0x290ea98
  0x290ea7c: subs     x9, x9, #1
  0x290ea80: add      x10, x10, #0x10
  0x290ea84: b.ne     #0x290ea70
  0x290ea88: mov      w2, #0xb
  0x290ea8c: mov      x0, x20
  0x290ea90: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ea94: b        #0x290eaa8
  0x290ea98: ldr      w9, [x10]
  0x290ea9c: add      w9, w9, #0xb
  0x290eaa0: add      x8, x8, w9, sxtw #4
  0x290eaa4: add      x0, x8, #0x138
  0x290eaa8: ldp      x8, x2, [x0]
  0x290eaac: mov      x0, x20
  0x290eab0: mov      x1, x19
  0x290eab4: blr      x8
  0x290eab8: b        #0x290ea40
  0x290eabc: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55c5000)
  0x290eac0: mov      x0, sp
  0x290eac4: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290eac8: ldp      x20, x19, [sp, #0x50]
  0x290eacc: ldp      x22, x21, [sp, #0x40]
  0x290ead0: ldp      x30, x23, [sp, #0x30]
  0x290ead4: add      sp, sp, #0x60
  0x290ead8: ret      
  0x290eadc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290eae0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290eae4: b        #0x290eaec
  0x290eae8: b        #0x290eaec
  0x290eaec: mov      x19, x0
  0x290eaf0: cmp      w1, #1
  0x290eaf4: b.ne     #0x290eb20
  0x290eaf8: mov      x0, x19
  0x290eafc: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290eb00: ldr      x20, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290eb04: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290eb08: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55c5000)
  0x290eb0c: mov      x0, sp
  0x290eb10: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290eb14: cbz      x20, #0x290eac8
  0x290eb18: mov      x0, x20
  0x290eb1c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290eb20: mov      x20, xzr
  0x290eb24: b        #0x290eb2c
  0x290eb28: mov      x19, x0
  0x290eb2c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55c5000)
  0x290eb30: mov      x0, sp
  0x290eb34: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290eb38: cbnz     x20, #0x290eb44
  0x290eb3c: mov      x0, x19
  0x290eb40: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x290eb44: mov      x0, x20
  0x290eb48: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290eb4c: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
