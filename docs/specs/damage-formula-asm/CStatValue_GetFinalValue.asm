; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue @ 0x29fbd34..0x29fbed8 (taille 420 octets) =====
  0x29fbd34: str      x30, [sp, #-0x30]!
  0x29fbd38: stp      x22, x21, [sp, #0x10]
  0x29fbd3c: stp      x20, x19, [sp, #0x20]
  0x29fbd40: adrp     x20, #0x59d8000
  0x29fbd44: adrp     x22, #0x558a000
  0x29fbd48: ldrb     w8, [x20, #0x9ab]
  0x29fbd4c: ldr      x22, [x22, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fbd50: mov      x19, x0
  0x29fbd54: tbnz     w8, #0, #0x29fbd84
  0x29fbd58: adrp     x0, #0x55b6000
  0x29fbd5c: ldr      x0, [x0, #0x968] ; = 0x0 (u64 @ 0x55b6968)
  0x29fbd60: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fbd64: adrp     x0, #0x5587000
  0x29fbd68: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x29fbd6c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fbd70: adrp     x0, #0x558a000
  0x29fbd74: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fbd78: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fbd7c: mov      w8, #1
  0x29fbd80: strb     w8, [x20, #0x9ab]
  0x29fbd84: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x29fbd88: str      wzr, [sp, #0xc]
  0x29fbd8c: ldur     x20, [x19, #0x74]
  0x29fbd90: ldr      w21, [x19, #0x7c]
  0x29fbd94: ldr      w8, [x0, #0xe0]
  0x29fbd98: cbnz     w8, #0x29fbda0
  0x29fbd9c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fbda0: mov      x0, x20
  0x29fbda4: mov      x1, x21
  0x29fbda8: mov      x2, xzr
  0x29fbdac: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbdb0: cmn      w0, #1
  0x29fbdb4: b.eq     #0x29fbde4
  0x29fbdb8: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x29fbdbc: ldur     x20, [x19, #0x74]
  0x29fbdc0: ldr      w19, [x19, #0x7c]
  0x29fbdc4: ldr      w8, [x0, #0xe0]
  0x29fbdc8: cbnz     w8, #0x29fbdd0
  0x29fbdcc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fbdd0: mov      x0, x20
  0x29fbdd4: mov      x1, x19
  0x29fbdd8: mov      x2, xzr
  0x29fbddc: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fbde0: b        #0x29fbec4
  0x29fbde4: ldrb     w8, [x19, #0xe0]
  0x29fbde8: cbz      w8, #0x29fbdf4
  0x29fbdec: mov      x0, x19
  0x29fbdf0: bl       #0x29fb82c ; -> CStatValue$$SetFinalValue
  0x29fbdf4: adrp     x21, #0x59d4000
  0x29fbdf8: ldrb     w8, [x21, #0xfc3]
  0x29fbdfc: cbnz     w8, #0x29fbe14
  0x29fbe00: adrp     x0, #0x558a000
  0x29fbe04: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x29fbe08: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fbe0c: mov      w8, #1
  0x29fbe10: strb     w8, [x21, #0xfc3]
  0x29fbe14: adrp     x22, #0x558a000
  0x29fbe18: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x29fbe1c: adrp     x9, #0x5587000
  0x29fbe20: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x29fbe24: ldr      x9, [x9, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x29fbe28: ldr      x8, [x8, #0xb8]
  0x29fbe2c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x29fbe30: ldr      x20, [x8]
  0x29fbe34: ldr      w9, [x0, #0xe0]
  0x29fbe38: cbnz     w9, #0x29fbe40
  0x29fbe3c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fbe40: mov      x0, x20
  0x29fbe44: mov      x1, xzr
  0x29fbe48: mov      x2, xzr
  0x29fbe4c: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x29fbe50: tbz      w0, #0, #0x29fbebc
  0x29fbe54: ldrb     w8, [x21, #0xfc3]
  0x29fbe58: cbnz     w8, #0x29fbe70
  0x29fbe5c: adrp     x0, #0x558a000
  0x29fbe60: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x29fbe64: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fbe68: mov      w8, #1
  0x29fbe6c: strb     w8, [x21, #0xfc3]
  0x29fbe70: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x29fbe74: ldr      x8, [x8, #0xb8]
  0x29fbe78: ldr      x8, [x8]
  0x29fbe7c: cbz      x8, #0x29fbed4
  0x29fbe80: ldr      x0, [x8, #0x168]
  0x29fbe84: cbz      x0, #0x29fbed4
  0x29fbe88: adrp     x8, #0x55b6000
  0x29fbe8c: ldr      w1, [x19, #0x10]
  0x29fbe90: ldr      x8, [x8, #0x968] ; = 0x0 (u64 @ 0x55b6968)
  0x29fbe94: add      x2, sp, #0xc
  0x29fbe98: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29fbe9c: bl       #0x4012910 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$TryGetValue
  0x29fbea0: tbz      w0, #0, #0x29fbebc
  0x29fbea4: mov      x0, x19
  0x29fbea8: bl       #0x29f9bc0 ; -> CStatValue$$get_m_nFinalValue
  0x29fbeac: ldr      w8, [sp, #0xc]
  0x29fbeb0: cmp      w0, w8
  0x29fbeb4: csel     w0, w0, w8, lt
  0x29fbeb8: b        #0x29fbec4
  0x29fbebc: mov      x0, x19
  0x29fbec0: bl       #0x29f9bc0 ; -> CStatValue$$get_m_nFinalValue
  0x29fbec4: ldp      x20, x19, [sp, #0x20]
  0x29fbec8: ldp      x22, x21, [sp, #0x10]
  0x29fbecc: ldr      x30, [sp], #0x30
  0x29fbed0: ret      
  0x29fbed4: bl       #0x21afc18 ; -> ??? 0x21afc18
