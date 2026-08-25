; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCustomBossStatValue_SetBaseValue @ 0x2a06f70..0x2a07030 (taille 192 octets) =====
  0x2a06f70: stp      x30, x23, [sp, #-0x30]!
  0x2a06f74: stp      x22, x21, [sp, #0x10]
  0x2a06f78: stp      x20, x19, [sp, #0x20]
  0x2a06f7c: adrp     x23, #0x59e8000
  0x2a06f80: ldrb     w8, [x23, #0x5ed]
  0x2a06f84: mov      w22, w3
  0x2a06f88: mov      w20, w2
  0x2a06f8c: mov      w21, w1
  0x2a06f90: mov      x19, x0
  0x2a06f94: tbnz     w8, #0, #0x2a06fac
  0x2a06f98: adrp     x0, #0x5599000
  0x2a06f9c: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06fa0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06fa4: mov      w8, #1
  0x2a06fa8: strb     w8, [x23, #0x5ed]
  0x2a06fac: ldr      w8, [x19, #0x10]
  0x2a06fb0: adrp     x23, #0x5599000
  0x2a06fb4: ldr      x23, [x23, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06fb8: cmp      w8, #1
  0x2a06fbc: b.ne     #0x2a06fd8
  0x2a06fc0: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06fc4: ldr      w8, [x0, #0xe0]
  0x2a06fc8: cbnz     w8, #0x2a06fd0
  0x2a06fcc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a06fd0: sub      w20, w20, w21
  0x2a06fd4: b        #0x2a07004
  0x2a06fd8: mov      w0, w21
  0x2a06fdc: mov      w1, w20
  0x2a06fe0: mov      w2, w22
  0x2a06fe4: mov      x3, xzr
  0x2a06fe8: bl       #0x2cc0608 ; -> CFormula$$CalcStat
  0x2a06fec: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x2a06ff0: mov      w20, w0
  0x2a06ff4: ldr      w9, [x8, #0xe0]
  0x2a06ff8: cbnz     w9, #0x2a07004
  0x2a06ffc: mov      x0, x8
  0x2a07000: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a07004: mov      w0, w20
  0x2a07008: mov      x1, xzr
  0x2a0700c: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2a07010: mov      w8, #1
  0x2a07014: stur     x0, [x19, #0x14]
  0x2a07018: str      w1, [x19, #0x1c]
  0x2a0701c: strb     w8, [x19, #0xe0]
  0x2a07020: ldp      x20, x19, [sp, #0x20]
  0x2a07024: ldp      x22, x21, [sp, #0x10]
  0x2a07028: ldp      x30, x23, [sp], #0x30
  0x2a0702c: ret      
