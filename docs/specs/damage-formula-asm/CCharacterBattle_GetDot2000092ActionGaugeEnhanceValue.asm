; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetDot2000092ActionGaugeEnhanceValue @ 0x282abcc..0x282ad98 (taille 460 octets) =====
  0x282abcc: sub      sp, sp, #0x50
  0x282abd0: str      x30, [sp, #0x20]
  0x282abd4: stp      x22, x21, [sp, #0x30]
  0x282abd8: stp      x20, x19, [sp, #0x40]
  0x282abdc: adrp     x20, #0x59d7000
  0x282abe0: ldrb     w8, [x20, #0xae0]
  0x282abe4: mov      x19, x0
  0x282abe8: tbnz     w8, #0, #0x282ac30
  0x282abec: adrp     x0, #0x558a000
  0x282abf0: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x282abf4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282abf8: adrp     x0, #0x558a000
  0x282abfc: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ac00: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282ac04: adrp     x0, #0x558a000
  0x282ac08: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x282ac0c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282ac10: adrp     x0, #0x558a000
  0x282ac14: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x282ac18: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282ac1c: adrp     x0, #0x558a000
  0x282ac20: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x282ac24: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282ac28: mov      w8, #1
  0x282ac2c: strb     w8, [x20, #0xae0]
  0x282ac30: mov      w1, #0x33
  0x282ac34: mov      x0, x19
  0x282ac38: stp      xzr, xzr, [sp, #8]
  0x282ac3c: str      xzr, [sp, #0x18]
  0x282ac40: bl       #0x2819f2c ; -> CCharacterBattle$$GetBuffListByType
  0x282ac44: cbz      x0, #0x282ad18
  0x282ac48: adrp     x8, #0x558a000
  0x282ac4c: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x282ac50: adrp     x21, #0x558a000
  0x282ac54: adrp     x22, #0x558a000
  0x282ac58: adrp     x20, #0x558a000
  0x282ac5c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282ac60: ldr      x21, [x21, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x282ac64: ldr      x22, [x22, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x282ac68: ldr      x20, [x20, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ac6c: add      x8, sp, #8
  0x282ac70: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282ac74: mov      w19, wzr
  0x282ac78: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x282ac7c: add      x0, sp, #8
  0x282ac80: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282ac84: tbz      w0, #0, #0x282aca0
  0x282ac88: ldr      x0, [sp, #0x18]
  0x282ac8c: cbz      x0, #0x282ad14
  0x282ac90: mov      x1, xzr
  0x282ac94: bl       #0x232036c ; -> CBuff$$get_Value
  0x282ac98: add      w19, w0, w19
  0x282ac9c: b        #0x282ac78
  0x282aca0: ldr      x1, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x282aca4: add      x0, sp, #8
  0x282aca8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282acac: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x282acb0: ldr      w8, [x0, #0xe0]
  0x282acb4: cbnz     w8, #0x282acbc
  0x282acb8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x282acbc: mov      x0, xzr
  0x282acc0: bl       #0x2a0009c ; -> CCommonDefine$$get_MAX_ACTION_POINT
  0x282acc4: mov      w1, #0x32
  0x282acc8: mov      x2, xzr
  0x282accc: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x282acd0: mov      w20, w0
  0x282acd4: cbz      w19, #0x282acfc
  0x282acd8: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x282acdc: ldr      w8, [x0, #0xe0]
  0x282ace0: cbnz     w8, #0x282ace8
  0x282ace4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x282ace8: mov      w0, w20
  0x282acec: mov      w1, w19
  0x282acf0: mov      x2, xzr
  0x282acf4: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x282acf8: mov      w20, w0
  0x282acfc: mov      w0, w20
  0x282ad00: ldp      x20, x19, [sp, #0x40]
  0x282ad04: ldp      x22, x21, [sp, #0x30]
  0x282ad08: ldr      x30, [sp, #0x20]
  0x282ad0c: add      sp, sp, #0x50
  0x282ad10: ret      
  0x282ad14: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282ad18: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282ad1c: b        #0x282ad24
  0x282ad20: b        #0x282ad24
  0x282ad24: mov      x20, x0
  0x282ad28: cmp      w1, #1
  0x282ad2c: b.ne     #0x282ad60
  0x282ad30: mov      x0, x20
  0x282ad34: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x282ad38: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x282ad3c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x282ad40: adrp     x8, #0x558a000
  0x282ad44: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ad48: add      x0, sp, #8
  0x282ad4c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282ad50: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282ad54: cbz      x21, #0x282acac
  0x282ad58: mov      x0, x21
  0x282ad5c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282ad60: mov      x21, xzr
  0x282ad64: b        #0x282ad6c
  0x282ad68: mov      x20, x0
  0x282ad6c: adrp     x8, #0x558a000
  0x282ad70: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ad74: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282ad78: add      x0, sp, #8
  0x282ad7c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282ad80: cbnz     x21, #0x282ad8c
  0x282ad84: mov      x0, x20
  0x282ad88: bl       #0x22b072c ; -> ??? 0x22b072c
  0x282ad8c: mov      x0, x21
  0x282ad90: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282ad94: bl       #0x1f86e18 ; -> ??? 0x1f86e18
