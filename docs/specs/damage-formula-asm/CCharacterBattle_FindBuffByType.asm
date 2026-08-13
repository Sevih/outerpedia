; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_FindBuffByType @ 0x280df90..0x280e0ec (taille 348 octets) =====
  0x280df90: sub      sp, sp, #0x50
  0x280df94: str      x30, [sp, #0x20]
  0x280df98: stp      x22, x21, [sp, #0x30]
  0x280df9c: stp      x20, x19, [sp, #0x40]
  0x280dfa0: adrp     x21, #0x59d7000
  0x280dfa4: ldrb     w8, [x21, #0xa9e]
  0x280dfa8: mov      w19, w1
  0x280dfac: mov      x20, x0
  0x280dfb0: tbnz     w8, #0, #0x280dfec
  0x280dfb4: adrp     x0, #0x558a000
  0x280dfb8: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x280dfbc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280dfc0: adrp     x0, #0x558a000
  0x280dfc4: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x280dfc8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280dfcc: adrp     x0, #0x558a000
  0x280dfd0: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x280dfd4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280dfd8: adrp     x0, #0x558a000
  0x280dfdc: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x280dfe0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280dfe4: mov      w8, #1
  0x280dfe8: strb     w8, [x21, #0xa9e]
  0x280dfec: stp      xzr, xzr, [sp, #8]
  0x280dff0: str      xzr, [sp, #0x18]
  0x280dff4: ldr      x0, [x20, #0x380]
  0x280dff8: cbz      x0, #0x280e07c
  0x280dffc: adrp     x8, #0x558a000
  0x280e000: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x280e004: adrp     x22, #0x558a000
  0x280e008: adrp     x21, #0x558a000
  0x280e00c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e010: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x280e014: b        #0x525e9dc
  0x280e018: add      x8, sp, #8
  0x280e01c: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x280e020: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x280e024: add      x0, sp, #8
  0x280e028: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x280e02c: tbz      w0, #0, #0x280e050
  0x280e030: ldr      x20, [sp, #0x18]
  0x280e034: cbz      x20, #0x280e078
  0x280e038: mov      x0, x20
  0x280e03c: mov      x1, xzr
  0x280e040: bl       #0x2320198 ; -> CBuff$$get_Type
  0x280e044: cmp      w0, w19
  0x280e048: b.ne     #0x280e020
  0x280e04c: b        #0x280e054
  0x280e050: mov      x20, xzr
  0x280e054: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x280e058: add      x0, sp, #8
  0x280e05c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x280e060: mov      x0, x20
  0x280e064: ldp      x20, x19, [sp, #0x40]
  0x280e068: ldp      x22, x21, [sp, #0x30]
  0x280e06c: ldr      x30, [sp, #0x20]
  0x280e070: add      sp, sp, #0x50
  0x280e074: ret      
  0x280e078: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x280e07c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x280e080: b        #0x280e088
  0x280e084: b        #0x280e088
  0x280e088: mov      x19, x0
  0x280e08c: cmp      w1, #1
  0x280e090: b.ne     #0x280e0bc
  0x280e094: mov      x0, x19
  0x280e098: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x280e09c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x280e0a0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x280e0a4: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x280e0a8: add      x0, sp, #8
  0x280e0ac: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x280e0b0: cbz      x20, #0x280e060
  0x280e0b4: mov      x0, x20
  0x280e0b8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x280e0bc: mov      x20, xzr
  0x280e0c0: b        #0x280e0c8
  0x280e0c4: mov      x19, x0
  0x280e0c8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x280e0cc: add      x0, sp, #8
  0x280e0d0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x280e0d4: cbnz     x20, #0x280e0e0
  0x280e0d8: mov      x0, x19
  0x280e0dc: bl       #0x22b072c ; -> ??? 0x22b072c
  0x280e0e0: mov      x0, x20
  0x280e0e4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x280e0e8: bl       #0x1f86e18 ; -> ??? 0x1f86e18
