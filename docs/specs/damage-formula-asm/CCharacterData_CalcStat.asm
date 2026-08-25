; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcStat @ 0x290b9f4..0x290bd60 (taille 876 octets) =====
  0x290b9f4: sub      sp, sp, #0xa0
  0x290b9f8: str      x30, [sp, #0x60]
  0x290b9fc: stp      x24, x23, [sp, #0x70]
  0x290ba00: stp      x22, x21, [sp, #0x80]
  0x290ba04: stp      x20, x19, [sp, #0x90]
  0x290ba08: adrp     x20, #0x59e7000
  0x290ba0c: ldrb     w8, [x20, #0xea0]
  0x290ba10: mov      x19, x0
  0x290ba14: tbnz     w8, #0, #0x290ba68
  0x290ba18: adrp     x0, #0x55c5000
  0x290ba1c: ldr      x0, [x0, #0x3d8] ; = 0x0 (u64 @ 0x55c53d8)
  0x290ba20: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba24: adrp     x0, #0x55c5000
  0x290ba28: ldr      x0, [x0, #0x3e0] ; = 0x0 (u64 @ 0x55c53e0)
  0x290ba2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba30: adrp     x0, #0x55c5000
  0x290ba34: ldr      x0, [x0, #0x3e8] ; = 0x0 (u64 @ 0x55c53e8)
  0x290ba38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba3c: adrp     x0, #0x55c5000
  0x290ba40: ldr      x0, [x0, #0x3f0] ; = 0x0 (u64 @ 0x55c53f0)
  0x290ba44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba48: adrp     x0, #0x55c5000
  0x290ba4c: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290ba50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba54: adrp     x0, #0x55c5000
  0x290ba58: ldr      x0, [x0, #0x3f8] ; = 0x0 (u64 @ 0x55c53f8)
  0x290ba5c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ba60: mov      w8, #1
  0x290ba64: strb     w8, [x20, #0xea0]
  0x290ba68: movi     v0.2d, #0000000000000000
  0x290ba6c: mov      x0, x19
  0x290ba70: str      xzr, [sp, #0x50]
  0x290ba74: stp      q0, q0, [sp, #0x30]
  0x290ba78: strb     wzr, [x19, #0x28]
  0x290ba7c: bl       #0x290d8d4 ; -> CCharacterData$$CalcBasicStats
  0x290ba80: ldr      x8, [x19, #0xf0]
  0x290ba84: cbz      x8, #0x290bce4
  0x290ba88: ldr      w8, [x8, #0x40]
  0x290ba8c: cbnz     w8, #0x290baa8
  0x290ba90: mov      x0, x19
  0x290ba94: bl       #0x290e978 ; -> CCharacterData$$CalcEvolutionStats
  0x290ba98: mov      x0, x19
  0x290ba9c: bl       #0x290eb50 ; -> CCharacterData$$CalcTranscendentStarStats
  0x290baa0: mov      x0, x19
  0x290baa4: bl       #0x290ed9c ; -> CCharacterData$$CalcArchiveStats
  0x290baa8: mov      x0, x19
  0x290baac: bl       #0x290efd8 ; -> CCharacterData$$CalcSetItem
  0x290bab0: ldr      x0, [x19, #0x40]
  0x290bab4: cbz      x0, #0x290bce4
  0x290bab8: adrp     x8, #0x55c5000
  0x290babc: ldr      x8, [x8, #0x3d8] ; = 0x0 (u64 @ 0x55c53d8)
  0x290bac0: adrp     x23, #0x55c5000
  0x290bac4: adrp     x24, #0x55c5000
  0x290bac8: adrp     x22, #0x55c5000
  0x290bacc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290bad0: ldr      x23, [x23, #0x3e8] ; = 0x0 (u64 @ 0x55c53e8)
  0x290bad4: ldr      x24, [x24, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290bad8: ldr      x22, [x22, #0x3e0] ; = 0x0 (u64 @ 0x55c53e0)
  0x290badc: add      x8, sp, #8
  0x290bae0: bl       #0x4028a54 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x290bae4: ldur     q0, [sp, #8]
  0x290bae8: ldur     q1, [sp, #0x18]
  0x290baec: ldr      x8, [sp, #0x28]
  0x290baf0: stp      q0, q1, [sp, #0x30]
  0x290baf4: str      x8, [sp, #0x50]
  0x290baf8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290bafc: add      x0, sp, #0x30
  0x290bb00: bl       #0x416d0bc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x290bb04: tbz      w0, #0, #0x290bca4
  0x290bb08: ldr      x20, [sp, #0x48]
  0x290bb0c: cbz      x20, #0x290bce0
  0x290bb10: ldr      x8, [x20]
  0x290bb14: ldr      x21, [x19, #0x48]
  0x290bb18: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290bb1c: ldrh     w9, [x8, #0x12e]
  0x290bb20: cbz      x9, #0x290bb44
  0x290bb24: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290bb28: add      x10, x10, #8
  0x290bb2c: ldur     x11, [x10, #-8]
  0x290bb30: cmp      x11, x1
  0x290bb34: b.eq     #0x290bb54
  0x290bb38: subs     x9, x9, #1
  0x290bb3c: add      x10, x10, #0x10
  0x290bb40: b.ne     #0x290bb2c
  0x290bb44: mov      w2, #7
  0x290bb48: mov      x0, x20
  0x290bb4c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290bb50: b        #0x290bb64
  0x290bb54: ldr      w9, [x10]
  0x290bb58: add      w9, w9, #7
  0x290bb5c: add      x8, x8, w9, sxtw #4
  0x290bb60: add      x0, x8, #0x138
  0x290bb64: ldp      x8, x2, [x0]
  0x290bb68: mov      x0, x20
  0x290bb6c: mov      x1, x21
  0x290bb70: blr      x8
  0x290bb74: ldr      x8, [x20]
  0x290bb78: ldr      x21, [x19, #0x18]
  0x290bb7c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290bb80: ldrh     w9, [x8, #0x12e]
  0x290bb84: cbz      x9, #0x290bba8
  0x290bb88: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290bb8c: add      x10, x10, #8
  0x290bb90: ldur     x11, [x10, #-8]
  0x290bb94: cmp      x11, x1
  0x290bb98: b.eq     #0x290bbb8
  0x290bb9c: subs     x9, x9, #1
  0x290bba0: add      x10, x10, #0x10
  0x290bba4: b.ne     #0x290bb90
  0x290bba8: mov      w2, #8
  0x290bbac: mov      x0, x20
  0x290bbb0: bl       #0x2215130 ; -> ??? 0x2215130
  0x290bbb4: b        #0x290bbc8
  0x290bbb8: ldr      w9, [x10]
  0x290bbbc: add      w9, w9, #8
  0x290bbc0: add      x8, x8, w9, sxtw #4
  0x290bbc4: add      x0, x8, #0x138
  0x290bbc8: ldp      x8, x2, [x0]
  0x290bbcc: mov      x0, x20
  0x290bbd0: mov      x1, x21
  0x290bbd4: blr      x8
  0x290bbd8: ldr      x8, [x20]
  0x290bbdc: ldr      x21, [x19, #0x20]
  0x290bbe0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290bbe4: ldrh     w9, [x8, #0x12e]
  0x290bbe8: cbz      x9, #0x290bc0c
  0x290bbec: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290bbf0: add      x10, x10, #8
  0x290bbf4: ldur     x11, [x10, #-8]
  0x290bbf8: cmp      x11, x1
  0x290bbfc: b.eq     #0x290bc1c
  0x290bc00: subs     x9, x9, #1
  0x290bc04: add      x10, x10, #0x10
  0x290bc08: b.ne     #0x290bbf4
  0x290bc0c: mov      w2, #9
  0x290bc10: mov      x0, x20
  0x290bc14: bl       #0x2215130 ; -> ??? 0x2215130
  0x290bc18: b        #0x290bc2c
  0x290bc1c: ldr      w9, [x10]
  0x290bc20: add      w9, w9, #9
  0x290bc24: add      x8, x8, w9, sxtw #4
  0x290bc28: add      x0, x8, #0x138
  0x290bc2c: ldp      x8, x2, [x0]
  0x290bc30: mov      x0, x20
  0x290bc34: mov      x1, x21
  0x290bc38: blr      x8
  0x290bc3c: ldr      x8, [x20]
  0x290bc40: ldr      x21, [x19, #0x30]
  0x290bc44: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290bc48: ldrh     w9, [x8, #0x12e]
  0x290bc4c: cbz      x9, #0x290bc70
  0x290bc50: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290bc54: add      x10, x10, #8
  0x290bc58: ldur     x11, [x10, #-8]
  0x290bc5c: cmp      x11, x1
  0x290bc60: b.eq     #0x290bc80
  0x290bc64: subs     x9, x9, #1
  0x290bc68: add      x10, x10, #0x10
  0x290bc6c: b.ne     #0x290bc58
  0x290bc70: mov      w2, #0xa
  0x290bc74: mov      x0, x20
  0x290bc78: bl       #0x2215130 ; -> ??? 0x2215130
  0x290bc7c: b        #0x290bc90
  0x290bc80: ldr      w9, [x10]
  0x290bc84: add      w9, w9, #0xa
  0x290bc88: add      x8, x8, w9, sxtw #4
  0x290bc8c: add      x0, x8, #0x138
  0x290bc90: ldp      x8, x2, [x0]
  0x290bc94: mov      x0, x20
  0x290bc98: mov      x1, x21
  0x290bc9c: blr      x8
  0x290bca0: b        #0x290baf8
  0x290bca4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290bca8: add      x0, sp, #0x30
  0x290bcac: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290bcb0: mov      x0, x19
  0x290bcb4: bl       #0x290f3b4 ; -> CCharacterData$$CreateBuffSetItem
  0x290bcb8: mov      x0, x19
  0x290bcbc: bl       #0x290f9d8 ; -> CCharacterData$$CalcPvpRealtimeFieldSkillStats
  0x290bcc0: mov      x0, x19
  0x290bcc4: bl       #0x290c7ec ; -> CCharacterData$$CalcAwakeningNodeStats
  0x290bcc8: ldp      x20, x19, [sp, #0x90]
  0x290bccc: ldp      x22, x21, [sp, #0x80]
  0x290bcd0: ldp      x24, x23, [sp, #0x70]
  0x290bcd4: ldr      x30, [sp, #0x60]
  0x290bcd8: add      sp, sp, #0xa0
  0x290bcdc: ret      
  0x290bce0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290bce4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290bce8: b        #0x290bcfc
  0x290bcec: b        #0x290bcfc
  0x290bcf0: b        #0x290bcfc
  0x290bcf4: b        #0x290bcfc
  0x290bcf8: b        #0x290bcfc
  0x290bcfc: mov      x20, x0
  0x290bd00: cmp      w1, #1
  0x290bd04: b.ne     #0x290bd30
  0x290bd08: mov      x0, x20
  0x290bd0c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290bd10: ldr      x21, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290bd14: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290bd18: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290bd1c: add      x0, sp, #0x30
  0x290bd20: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290bd24: cbz      x21, #0x290bcb0
  0x290bd28: mov      x0, x21
  0x290bd2c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290bd30: mov      x21, xzr
  0x290bd34: b        #0x290bd3c
  0x290bd38: mov      x20, x0
  0x290bd3c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290bd40: add      x0, sp, #0x30
  0x290bd44: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290bd48: cbnz     x21, #0x290bd54
  0x290bd4c: mov      x0, x20
  0x290bd50: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x290bd54: mov      x0, x21
  0x290bd58: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290bd5c: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
