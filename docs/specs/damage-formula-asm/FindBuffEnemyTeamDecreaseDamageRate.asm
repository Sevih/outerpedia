; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== FindBuffEnemyTeamDecreaseDamageRate @ 0x2828988..0x2828b18 (taille 400 octets) =====
  0x2828988: sub      sp, sp, #0x50
  0x282898c: str      x30, [sp, #0x20]
  0x2828990: stp      x22, x21, [sp, #0x30]
  0x2828994: stp      x20, x19, [sp, #0x40]
  0x2828998: adrp     x20, #0x59d7000
  0x282899c: ldrb     w8, [x20, #0xac5]
  0x28289a0: mov      x19, x0
  0x28289a4: tbnz     w8, #0, #0x28289e0
  0x28289a8: adrp     x0, #0x558a000
  0x28289ac: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x28289b0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28289b4: adrp     x0, #0x558a000
  0x28289b8: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x28289bc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28289c0: adrp     x0, #0x558a000
  0x28289c4: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x28289c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28289cc: adrp     x0, #0x558a000
  0x28289d0: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x28289d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28289d8: mov      w8, #1
  0x28289dc: strb     w8, [x20, #0xac5]
  0x28289e0: stp      xzr, xzr, [sp, #8]
  0x28289e4: str      xzr, [sp, #0x18]
  0x28289e8: ldr      x0, [x19, #0x380]
  0x28289ec: cbz      x0, #0x2828a9c
  0x28289f0: adrp     x8, #0x558a000
  0x28289f4: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x28289f8: adrp     x22, #0x558a000
  0x28289fc: adrp     x21, #0x558a000
  0x2828a00: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2828a04: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2828a08: ldr      x21, [x21, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828a0c: add      x8, sp, #8
  0x2828a10: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2828a14: mov      w19, wzr
  0x2828a18: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2828a1c: add      x0, sp, #8
  0x2828a20: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2828a24: tbz      w0, #0, #0x2828a70
  0x2828a28: ldr      x20, [sp, #0x18]
  0x2828a2c: cbz      x20, #0x2828a94
  0x2828a30: mov      x0, x20
  0x2828a34: mov      x1, xzr
  0x2828a38: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2828a3c: cmp      w0, #0x65
  0x2828a40: b.ne     #0x2828a18
  0x2828a44: mov      w2, #0x17
  0x2828a48: mov      x0, x20
  0x2828a4c: mov      x1, xzr
  0x2828a50: mov      x3, xzr
  0x2828a54: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2828a58: tbz      w0, #0, #0x2828a18
  0x2828a5c: mov      x0, x20
  0x2828a60: mov      x1, xzr
  0x2828a64: bl       #0x232036c ; -> CBuff$$get_Value
  0x2828a68: add      w19, w0, w19
  0x2828a6c: b        #0x2828a18
  0x2828a70: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x2828a74: add      x0, sp, #8
  0x2828a78: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828a7c: mov      w0, w19
  0x2828a80: ldp      x20, x19, [sp, #0x40]
  0x2828a84: ldp      x22, x21, [sp, #0x30]
  0x2828a88: ldr      x30, [sp, #0x20]
  0x2828a8c: add      sp, sp, #0x50
  0x2828a90: ret      
  0x2828a94: mov      x22, x21
  0x2828a98: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828a9c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828aa0: b        #0x2828ab0
  0x2828aa4: b        #0x2828ab0
  0x2828aa8: b        #0x2828ab4
  0x2828aac: b        #0x2828ab0
  0x2828ab0: mov      x22, x21
  0x2828ab4: mov      x20, x0
  0x2828ab8: cmp      w1, #1
  0x2828abc: b.ne     #0x2828ae8
  0x2828ac0: mov      x0, x20
  0x2828ac4: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2828ac8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x2828acc: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2828ad0: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2828ad4: add      x0, sp, #8
  0x2828ad8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828adc: cbz      x21, #0x2828a7c
  0x2828ae0: mov      x0, x21
  0x2828ae4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828ae8: mov      x21, xzr
  0x2828aec: b        #0x2828af4
  0x2828af0: mov      x20, x0
  0x2828af4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2828af8: add      x0, sp, #8
  0x2828afc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828b00: cbnz     x21, #0x2828b0c
  0x2828b04: mov      x0, x20
  0x2828b08: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2828b0c: mov      x0, x21
  0x2828b10: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828b14: bl       #0x1f86e18 ; -> ??? 0x1f86e18
