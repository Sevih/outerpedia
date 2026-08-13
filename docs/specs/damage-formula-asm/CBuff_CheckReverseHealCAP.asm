; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBuff_CheckReverseHealCAP @ 0x232bf8c..0x232c11c (taille 400 octets) =====
  0x232bf8c: sub      sp, sp, #0x50
  0x232bf90: str      x30, [sp, #0x20]
  0x232bf94: stp      x22, x21, [sp, #0x30]
  0x232bf98: stp      x20, x19, [sp, #0x40]
  0x232bf9c: adrp     x21, #0x59d5000
  0x232bfa0: ldrb     w8, [x21, #1]
  0x232bfa4: mov      w19, w1
  0x232bfa8: mov      x20, x0
  0x232bfac: tbnz     w8, #0, #0x232bfe8
  0x232bfb0: adrp     x0, #0x558a000
  0x232bfb4: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232bfb8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232bfbc: adrp     x0, #0x558a000
  0x232bfc0: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232bfc4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232bfc8: adrp     x0, #0x558a000
  0x232bfcc: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x232bfd0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232bfd4: adrp     x0, #0x558a000
  0x232bfd8: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232bfdc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232bfe0: mov      w8, #1
  0x232bfe4: strb     w8, [x21, #1]
  0x232bfe8: stp      xzr, xzr, [sp, #8]
  0x232bfec: str      xzr, [sp, #0x18]
  0x232bff0: ldr      x0, [x20, #0x20]
  0x232bff4: cbz      x0, #0x232c09c
  0x232bff8: mov      w1, #0x14
  0x232bffc: mov      x2, xzr
  0x232c000: bl       #0x2819f2c ; -> CCharacterBattle$$GetBuffListByType
  0x232c004: cbz      x0, #0x232c09c
  0x232c008: adrp     x8, #0x558a000
  0x232c00c: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232c010: adrp     x22, #0x558a000
  0x232c014: adrp     x21, #0x558a000
  0x232c018: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232c01c: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232c020: ldr      x21, [x21, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232c024: add      x8, sp, #8
  0x232c028: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232c02c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x232c030: add      x0, sp, #8
  0x232c034: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232c038: tbz      w0, #0, #0x232c074
  0x232c03c: ldr      x20, [sp, #0x18]
  0x232c040: cbz      x20, #0x232c02c
  0x232c044: mov      x0, x20
  0x232c048: mov      x1, xzr
  0x232c04c: bl       #0x23228c0 ; -> CBuff$$CheckCondition
  0x232c050: tbz      w0, #0, #0x232c02c
  0x232c054: ldr      x8, [x20, #0x10]
  0x232c058: cbz      x8, #0x232c098
  0x232c05c: ldr      w8, [x8, #0x54]
  0x232c060: ldr      w9, [x20, #0x30]
  0x232c064: mul      w8, w9, w8
  0x232c068: cmp      w8, w19
  0x232c06c: b.ge     #0x232c02c
  0x232c070: mov      w19, w8
  0x232c074: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x232c078: add      x0, sp, #8
  0x232c07c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232c080: mov      w0, w19
  0x232c084: ldp      x20, x19, [sp, #0x40]
  0x232c088: ldp      x22, x21, [sp, #0x30]
  0x232c08c: ldr      x30, [sp, #0x20]
  0x232c090: add      sp, sp, #0x50
  0x232c094: ret      
  0x232c098: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232c09c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232c0a0: b        #0x232c0a8
  0x232c0a4: b        #0x232c0a8
  0x232c0a8: mov      x20, x0
  0x232c0ac: cmp      w1, #1
  0x232c0b0: b.ne     #0x232c0e4
  0x232c0b4: mov      x0, x20
  0x232c0b8: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232c0bc: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x232c0c0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232c0c4: adrp     x8, #0x558a000
  0x232c0c8: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232c0cc: add      x0, sp, #8
  0x232c0d0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232c0d4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232c0d8: cbz      x21, #0x232c080
  0x232c0dc: mov      x0, x21
  0x232c0e0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232c0e4: mov      x21, xzr
  0x232c0e8: b        #0x232c0f0
  0x232c0ec: mov      x20, x0
  0x232c0f0: adrp     x8, #0x558a000
  0x232c0f4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232c0f8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232c0fc: add      x0, sp, #8
  0x232c100: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232c104: cbnz     x21, #0x232c110
  0x232c108: mov      x0, x20
  0x232c10c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x232c110: mov      x0, x21
  0x232c114: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232c118: bl       #0x1f86e18 ; -> ??? 0x1f86e18
