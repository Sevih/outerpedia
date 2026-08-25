; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_FindBuffByType @ 0x2814f10..0x281506c (taille 348 octets) =====
  0x2814f10: sub      sp, sp, #0x50
  0x2814f14: str      x30, [sp, #0x20]
  0x2814f18: stp      x22, x21, [sp, #0x30]
  0x2814f1c: stp      x20, x19, [sp, #0x40]
  0x2814f20: adrp     x21, #0x59e7000
  0x2814f24: ldrb     w8, [x21, #0x6bd]
  0x2814f28: mov      w19, w1
  0x2814f2c: mov      x20, x0
  0x2814f30: tbnz     w8, #0, #0x2814f6c
  0x2814f34: adrp     x0, #0x5598000
  0x2814f38: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2814f3c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2814f40: adrp     x0, #0x5598000
  0x2814f44: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2814f48: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2814f4c: adrp     x0, #0x5598000
  0x2814f50: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x2814f54: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2814f58: adrp     x0, #0x5598000
  0x2814f5c: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2814f60: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2814f64: mov      w8, #1
  0x2814f68: strb     w8, [x21, #0x6bd]
  0x2814f6c: stp      xzr, xzr, [sp, #8]
  0x2814f70: str      xzr, [sp, #0x18]
  0x2814f74: ldr      x0, [x20, #0x380]
  0x2814f78: cbz      x0, #0x2814ffc
  0x2814f7c: adrp     x8, #0x5598000
  0x2814f80: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2814f84: adrp     x22, #0x5598000
  0x2814f88: adrp     x21, #0x5598000
  0x2814f8c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2814f90: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2814f94: ldr      x21, [x21, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2814f98: add      x8, sp, #8
  0x2814f9c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2814fa0: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2814fa4: add      x0, sp, #8
  0x2814fa8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2814fac: tbz      w0, #0, #0x2814fd0
  0x2814fb0: ldr      x20, [sp, #0x18]
  0x2814fb4: cbz      x20, #0x2814ff8
  0x2814fb8: mov      x0, x20
  0x2814fbc: mov      x1, xzr
  0x2814fc0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x2814fc4: cmp      w0, w19
  0x2814fc8: b.ne     #0x2814fa0
  0x2814fcc: b        #0x2814fd4
  0x2814fd0: mov      x20, xzr
  0x2814fd4: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2814fd8: add      x0, sp, #8
  0x2814fdc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2814fe0: mov      x0, x20
  0x2814fe4: ldp      x20, x19, [sp, #0x40]
  0x2814fe8: ldp      x22, x21, [sp, #0x30]
  0x2814fec: ldr      x30, [sp, #0x20]
  0x2814ff0: add      sp, sp, #0x50
  0x2814ff4: ret      
  0x2814ff8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2814ffc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2815000: b        #0x2815008
  0x2815004: b        #0x2815008
  0x2815008: mov      x19, x0
  0x281500c: cmp      w1, #1
  0x2815010: b.ne     #0x281503c
  0x2815014: mov      x0, x19
  0x2815018: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x281501c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x2815020: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2815024: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2815028: add      x0, sp, #8
  0x281502c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2815030: cbz      x20, #0x2814fe0
  0x2815034: mov      x0, x20
  0x2815038: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x281503c: mov      x20, xzr
  0x2815040: b        #0x2815048
  0x2815044: mov      x19, x0
  0x2815048: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x281504c: add      x0, sp, #8
  0x2815050: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2815054: cbnz     x20, #0x2815060
  0x2815058: mov      x0, x19
  0x281505c: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2815060: mov      x0, x20
  0x2815064: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2815068: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
