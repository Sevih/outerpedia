; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CheckResist @ 0x2cc0be0..0x2cc0ca0 (taille 192 octets) =====
  0x2cc0be0: stp      d9, d8, [sp, #-0x20]!
  0x2cc0be4: stp      x30, x19, [sp, #0x10]
  0x2cc0be8: subs     w8, w1, w0
  0x2cc0bec: b.lt     #0x2cc0c90
  0x2cc0bf0: cmp      w8, #0
  0x2cc0bf4: mov      w9, #0x42c80000
  0x2cc0bf8: adrp     x19, #0x59e4000
  0x2cc0bfc: csinc    w8, w8, wzr, ne
  0x2cc0c00: fmov     s0, w9
  0x2cc0c04: ldrb     w9, [x19, #0xc19]
  0x2cc0c08: scvtf    s1, w8
  0x2cc0c0c: fdiv     s0, s0, s1
  0x2cc0c10: fmov     s1, #1.00000000
  0x2cc0c14: mov      w8, #0x447a0000
  0x2cc0c18: fadd     s8, s0, s1
  0x2cc0c1c: fmov     s9, w8
  0x2cc0c20: cbnz     w9, #0x2cc0c38
  0x2cc0c24: adrp     x0, #0x5597000
  0x2cc0c28: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc0c2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc0c30: mov      w8, #1
  0x2cc0c34: strb     w8, [x19, #0xc19]
  0x2cc0c38: adrp     x8, #0x5597000
  0x2cc0c3c: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc0c40: fdiv     s8, s9, s8
  0x2cc0c44: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x2cc0c48: ldr      w8, [x0, #0xe0]
  0x2cc0c4c: cbnz     w8, #0x2cc0c54
  0x2cc0c50: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc0c54: mov      w8, #0x7f800000
  0x2cc0c58: frintm   s0, s8
  0x2cc0c5c: fmov     s1, w8
  0x2cc0c60: fcvtms   w9, s8
  0x2cc0c64: fcmp     s0, s1
  0x2cc0c68: mov      w8, #-0xffffffff80000000
  0x2cc0c6c: csel     w19, w8, w9, eq
  0x2cc0c70: cmp      w19, #1
  0x2cc0c74: b.lt     #0x2cc0c90
  0x2cc0c78: mov      w1, #0x3e8
  0x2cc0c7c: mov      w0, wzr
  0x2cc0c80: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x2cc0c84: cmp      w0, w19
  0x2cc0c88: cset     w0, le
  0x2cc0c8c: b        #0x2cc0c94
  0x2cc0c90: mov      w0, wzr
  0x2cc0c94: ldp      x30, x19, [sp, #0x10]
  0x2cc0c98: ldp      d9, d8, [sp], #0x20
  0x2cc0c9c: ret      
