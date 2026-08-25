; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== FindBuffElementDamageRate @ 0x282fa04..0x282fb94 (taille 400 octets) =====
  0x282fa04: sub      sp, sp, #0x50
  0x282fa08: str      x30, [sp, #0x20]
  0x282fa0c: stp      x22, x21, [sp, #0x30]
  0x282fa10: stp      x20, x19, [sp, #0x40]
  0x282fa14: adrp     x20, #0x59e7000
  0x282fa18: ldrb     w8, [x20, #0x6e3]
  0x282fa1c: mov      x19, x0
  0x282fa20: tbnz     w8, #0, #0x282fa5c
  0x282fa24: adrp     x0, #0x5598000
  0x282fa28: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282fa2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fa30: adrp     x0, #0x5598000
  0x282fa34: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282fa38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fa3c: adrp     x0, #0x5598000
  0x282fa40: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x282fa44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fa48: adrp     x0, #0x5598000
  0x282fa4c: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282fa50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fa54: mov      w8, #1
  0x282fa58: strb     w8, [x20, #0x6e3]
  0x282fa5c: stp      xzr, xzr, [sp, #8]
  0x282fa60: str      xzr, [sp, #0x18]
  0x282fa64: ldr      x0, [x19, #0x380]
  0x282fa68: cbz      x0, #0x282fb18
  0x282fa6c: adrp     x8, #0x5598000
  0x282fa70: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282fa74: adrp     x22, #0x5598000
  0x282fa78: adrp     x21, #0x5598000
  0x282fa7c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282fa80: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282fa84: ldr      x21, [x21, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282fa88: add      x8, sp, #8
  0x282fa8c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282fa90: mov      w19, wzr
  0x282fa94: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fa98: add      x0, sp, #8
  0x282fa9c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282faa0: tbz      w0, #0, #0x282faec
  0x282faa4: ldr      x20, [sp, #0x18]
  0x282faa8: cbz      x20, #0x282fb10
  0x282faac: mov      x0, x20
  0x282fab0: mov      x1, xzr
  0x282fab4: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282fab8: cmp      w0, #0x64
  0x282fabc: b.ne     #0x282fa94
  0x282fac0: mov      w2, #0x17
  0x282fac4: mov      x0, x20
  0x282fac8: mov      x1, xzr
  0x282facc: mov      x3, xzr
  0x282fad0: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282fad4: tbz      w0, #0, #0x282fa94
  0x282fad8: mov      x0, x20
  0x282fadc: mov      x1, xzr
  0x282fae0: bl       #0x232548c ; -> CBuff$$get_Value
  0x282fae4: add      w19, w0, w19
  0x282fae8: b        #0x282fa94
  0x282faec: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x282faf0: add      x0, sp, #8
  0x282faf4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282faf8: mov      w0, w19
  0x282fafc: ldp      x20, x19, [sp, #0x40]
  0x282fb00: ldp      x22, x21, [sp, #0x30]
  0x282fb04: ldr      x30, [sp, #0x20]
  0x282fb08: add      sp, sp, #0x50
  0x282fb0c: ret      
  0x282fb10: mov      x22, x21
  0x282fb14: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282fb18: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282fb1c: b        #0x282fb2c
  0x282fb20: b        #0x282fb2c
  0x282fb24: b        #0x282fb30
  0x282fb28: b        #0x282fb2c
  0x282fb2c: mov      x22, x21
  0x282fb30: mov      x20, x0
  0x282fb34: cmp      w1, #1
  0x282fb38: b.ne     #0x282fb64
  0x282fb3c: mov      x0, x20
  0x282fb40: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282fb44: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x282fb48: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282fb4c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fb50: add      x0, sp, #8
  0x282fb54: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282fb58: cbz      x21, #0x282faf8
  0x282fb5c: mov      x0, x21
  0x282fb60: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282fb64: mov      x21, xzr
  0x282fb68: b        #0x282fb70
  0x282fb6c: mov      x20, x0
  0x282fb70: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fb74: add      x0, sp, #8
  0x282fb78: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282fb7c: cbnz     x21, #0x282fb88
  0x282fb80: mov      x0, x20
  0x282fb84: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x282fb88: mov      x0, x21
  0x282fb8c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282fb90: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
