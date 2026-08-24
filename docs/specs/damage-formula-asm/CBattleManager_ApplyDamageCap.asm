; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ApplyDamageCap @ 0x2314994..0x2314bd8 (taille 580 octets) =====
  0x2314994: sub      sp, sp, #0x80
  0x2314998: stp      x30, x25, [sp, #0x40]
  0x231499c: stp      x24, x23, [sp, #0x50]
  0x23149a0: stp      x22, x21, [sp, #0x60]
  0x23149a4: stp      x20, x19, [sp, #0x70]
  0x23149a8: adrp     x22, #0x59d4000
  0x23149ac: ldrb     w8, [x22, #0xf91]
  0x23149b0: mov      w19, w2
  0x23149b4: mov      w20, w1
  0x23149b8: mov      x21, x0
  0x23149bc: tbnz     w8, #0, #0x2314a10
  0x23149c0: adrp     x0, #0x5589000
  0x23149c4: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x23149c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23149cc: adrp     x0, #0x558a000
  0x23149d0: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x23149d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23149d8: adrp     x0, #0x558a000
  0x23149dc: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x23149e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23149e4: adrp     x0, #0x558a000
  0x23149e8: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x23149ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23149f0: adrp     x0, #0x558a000
  0x23149f4: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x23149f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23149fc: adrp     x0, #0x558a000
  0x2314a00: ldr      x0, [x0, #0x6f0] ; = 0x0 (u64 @ 0x558a6f0)
  0x2314a04: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2314a08: mov      w8, #1
  0x2314a0c: strb     w8, [x22, #0xf91]
  0x2314a10: stp      xzr, xzr, [sp, #0x20]
  0x2314a14: str      xzr, [sp, #0x30]
  0x2314a18: str      wzr, [sp, #0x1c]
  0x2314a1c: cbz      x21, #0x2314b48
  0x2314a20: mov      x0, x21
  0x2314a24: mov      w1, w20
  0x2314a28: mov      x2, xzr
  0x2314a2c: bl       #0x2819f2c ; -> CCharacterBattle$$GetBuffListByType
  0x2314a30: cbz      x0, #0x2314b48
  0x2314a34: adrp     x8, #0x558a000
  0x2314a38: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2314a3c: adrp     x22, #0x558a000
  0x2314a40: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2314a44: adrp     x23, #0x558a000
  0x2314a48: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2314a4c: adrp     x24, #0x5589000
  0x2314a50: adrp     x21, #0x558a000
  0x2314a54: ldr      x23, [x23, #0x6f0] ; = 0x0 (u64 @ 0x558a6f0)
  0x2314a58: ldr      x24, [x24, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2314a5c: ldr      x21, [x21, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2314a60: mov      x8, sp
  0x2314a64: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2314a68: ldr      q0, [sp]
  0x2314a6c: ldr      x8, [sp, #0x10]
  0x2314a70: str      q0, [sp, #0x20]
  0x2314a74: str      x8, [sp, #0x30]
  0x2314a78: mov      w25, w19
  0x2314a7c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2314a80: add      x0, sp, #0x20
  0x2314a84: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2314a88: tbz      w0, #0, #0x2314b1c
  0x2314a8c: ldr      x20, [sp, #0x30]
  0x2314a90: cbz      x20, #0x2314a7c
  0x2314a94: mov      x0, x20
  0x2314a98: mov      x1, xzr
  0x2314a9c: mov      x2, xzr
  0x2314aa0: bl       #0x23228c0 ; -> CBuff$$CheckCondition
  0x2314aa4: tbz      w0, #0, #0x2314a7c
  0x2314aa8: mov      x0, x20
  0x2314aac: mov      x1, xzr
  0x2314ab0: bl       #0x232036c ; -> CBuff$$get_Value
  0x2314ab4: cmp      w25, w0
  0x2314ab8: b.le     #0x2314a7c
  0x2314abc: mov      x0, x20
  0x2314ac0: mov      x1, xzr
  0x2314ac4: bl       #0x232036c ; -> CBuff$$get_Value
  0x2314ac8: mov      w19, w0
  0x2314acc: mov      x0, x20
  0x2314ad0: mov      x1, xzr
  0x2314ad4: bl       #0x232036c ; -> CBuff$$get_Value
  0x2314ad8: str      w0, [sp, #0x1c]
  0x2314adc: add      x0, sp, #0x1c
  0x2314ae0: mov      x1, xzr
  0x2314ae4: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x2314ae8: mov      x1, x0
  0x2314aec: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2314af0: mov      x2, xzr
  0x2314af4: bl       #0x476ca18 ; -> System.String$$Concat
  0x2314af8: mov      x20, x0
  0x2314afc: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5589000)
  0x2314b00: ldr      w8, [x0, #0xe0]
  0x2314b04: cbnz     w8, #0x2314b0c
  0x2314b08: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2314b0c: mov      x0, x20
  0x2314b10: mov      x1, xzr
  0x2314b14: bl       #0x2ca7164 ; -> CDebug$$Log
  0x2314b18: b        #0x2314a78
  0x2314b1c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x2314b20: add      x0, sp, #0x20
  0x2314b24: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314b28: mov      w19, w25
  0x2314b2c: mov      w0, w19
  0x2314b30: ldp      x20, x19, [sp, #0x70]
  0x2314b34: ldp      x22, x21, [sp, #0x60]
  0x2314b38: ldp      x24, x23, [sp, #0x50]
  0x2314b3c: ldp      x30, x25, [sp, #0x40]
  0x2314b40: add      sp, sp, #0x80
  0x2314b44: ret      
  0x2314b48: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2314b4c: b        #0x2314b58
  0x2314b50: b        #0x2314b6c
  0x2314b54: b        #0x2314b58
  0x2314b58: mov      x22, x21
  0x2314b5c: mov      x20, x0
  0x2314b60: b        #0x2314b78
  0x2314b64: b        #0x2314b6c
  0x2314b68: b        #0x2314b6c
  0x2314b6c: mov      x22, x21
  0x2314b70: mov      x20, x0
  0x2314b74: mov      w19, w25
  0x2314b78: cmp      w1, #1
  0x2314b7c: b.ne     #0x2314ba8
  0x2314b80: mov      x0, x20
  0x2314b84: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2314b88: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x2314b8c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2314b90: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2314b94: add      x0, sp, #0x20
  0x2314b98: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314b9c: cbz      x21, #0x2314b2c
  0x2314ba0: mov      x0, x21
  0x2314ba4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2314ba8: mov      x21, xzr
  0x2314bac: b        #0x2314bb4
  0x2314bb0: mov      x20, x0
  0x2314bb4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2314bb8: add      x0, sp, #0x20
  0x2314bbc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2314bc0: cbnz     x21, #0x2314bcc
  0x2314bc4: mov      x0, x20
  0x2314bc8: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2314bcc: mov      x0, x21
  0x2314bd0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2314bd4: bl       #0x1f86e18 ; -> ??? 0x1f86e18
