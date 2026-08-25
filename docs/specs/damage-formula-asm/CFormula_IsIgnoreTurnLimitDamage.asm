; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CFormula_IsIgnoreTurnLimitDamage @ 0x2cc1fdc..0x2cc2130 (taille 340 octets) =====
  0x2cc1fdc: stp      x30, x23, [sp, #-0x30]!
  0x2cc1fe0: stp      x22, x21, [sp, #0x10]
  0x2cc1fe4: stp      x20, x19, [sp, #0x20]
  0x2cc1fe8: adrp     x20, #0x59e9000
  0x2cc1fec: ldrb     w8, [x20, #0xd6c]
  0x2cc1ff0: mov      x19, x0
  0x2cc1ff4: tbnz     w8, #0, #0x2cc200c
  0x2cc1ff8: adrp     x0, #0x5596000
  0x2cc1ffc: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc2000: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2004: mov      w8, #1
  0x2cc2008: strb     w8, [x20, #0xd6c]
  0x2cc200c: adrp     x22, #0x59e4000
  0x2cc2010: adrp     x21, #0x5596000
  0x2cc2014: ldrb     w8, [x22, #0xbd3]
  0x2cc2018: ldr      x21, [x21, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc201c: cbnz     w8, #0x2cc2034
  0x2cc2020: adrp     x0, #0x5598000
  0x2cc2024: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc2028: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc202c: mov      w8, #1
  0x2cc2030: strb     w8, [x22, #0xbd3]
  0x2cc2034: adrp     x23, #0x5598000
  0x2cc2038: ldr      x23, [x23, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc203c: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5596000)
  0x2cc2040: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x2cc2044: ldr      w9, [x0, #0xe0]
  0x2cc2048: ldr      x8, [x8, #0xb8]
  0x2cc204c: ldr      x20, [x8]
  0x2cc2050: cbnz     w9, #0x2cc2058
  0x2cc2054: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc2058: mov      x0, x20
  0x2cc205c: mov      x1, xzr
  0x2cc2060: mov      x2, xzr
  0x2cc2064: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc2068: tbz      w0, #0, #0x2cc2118
  0x2cc206c: ldrb     w8, [x22, #0xbd3]
  0x2cc2070: cbnz     w8, #0x2cc2088
  0x2cc2074: adrp     x0, #0x5598000
  0x2cc2078: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc207c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2080: mov      w8, #1
  0x2cc2084: strb     w8, [x22, #0xbd3]
  0x2cc2088: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x2cc208c: ldr      x8, [x8, #0xb8]
  0x2cc2090: ldr      x0, [x8]
  0x2cc2094: cbz      x0, #0x2cc212c
  0x2cc2098: mov      x1, xzr
  0x2cc209c: bl       #0x259bed0 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cc20a0: tbz      w0, #0, #0x2cc2118
  0x2cc20a4: ldrb     w8, [x22, #0xbd3]
  0x2cc20a8: cbnz     w8, #0x2cc20c0
  0x2cc20ac: adrp     x0, #0x5598000
  0x2cc20b0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc20b4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc20b8: mov      w8, #1
  0x2cc20bc: strb     w8, [x22, #0xbd3]
  0x2cc20c0: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x2cc20c4: ldr      x8, [x8, #0xb8]
  0x2cc20c8: ldr      x8, [x8]
  0x2cc20cc: cbz      x8, #0x2cc212c
  0x2cc20d0: ldrb     w8, [x8, #0x34]
  0x2cc20d4: cbz      w8, #0x2cc2118
  0x2cc20d8: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5596000)
  0x2cc20dc: ldr      w8, [x0, #0xe0]
  0x2cc20e0: cbnz     w8, #0x2cc20e8
  0x2cc20e4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc20e8: mov      x0, x19
  0x2cc20ec: mov      x1, xzr
  0x2cc20f0: mov      x2, xzr
  0x2cc20f4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc20f8: tbz      w0, #0, #0x2cc2118
  0x2cc20fc: cbz      x19, #0x2cc212c
  0x2cc2100: mov      x0, x19
  0x2cc2104: mov      x1, xzr
  0x2cc2108: bl       #0x27141ac ; -> CCharacter$$get_UID
  0x2cc210c: cmp      x0, #0
  0x2cc2110: cset     w0, eq
  0x2cc2114: b        #0x2cc211c
  0x2cc2118: mov      w0, wzr
  0x2cc211c: ldp      x20, x19, [sp, #0x20]
  0x2cc2120: ldp      x22, x21, [sp, #0x10]
  0x2cc2124: ldp      x30, x23, [sp], #0x30
  0x2cc2128: ret      
  0x2cc212c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
