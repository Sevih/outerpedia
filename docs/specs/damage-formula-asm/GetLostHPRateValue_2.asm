; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetLostHPRateValue_2 @ 0x28161a0..0x281621c (taille 124 octets) =====
  0x28161a0: stp      x30, x21, [sp, #-0x20]!
  0x28161a4: stp      x20, x19, [sp, #0x10]
  0x28161a8: mov      x21, x0
  0x28161ac: ldr      x0, [x0, #0x28]
  0x28161b0: cbz      x0, #0x2816218
  0x28161b4: mov      w20, w1
  0x28161b8: mov      x1, xzr
  0x28161bc: mov      w19, w2
  0x28161c0: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x28161c4: cmp      w0, #1
  0x28161c8: b.lt     #0x2816208
  0x28161cc: ldr      x0, [x21, #0x28]
  0x28161d0: cbz      x0, #0x2816218
  0x28161d4: mov      x1, xzr
  0x28161d8: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x28161dc: ldr      x8, [x21, #0x28]
  0x28161e0: cbz      x8, #0x2816218
  0x28161e4: mov      w21, w0
  0x28161e8: mov      x0, x8
  0x28161ec: mov      x1, xzr
  0x28161f0: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x28161f4: sub      w8, w21, w20
  0x28161f8: smull    x8, w8, w19
  0x28161fc: sxtw     x9, w0
  0x2816200: sdiv     x0, x8, x9
  0x2816204: b        #0x281620c
  0x2816208: mov      w0, wzr
  0x281620c: ldp      x20, x19, [sp, #0x10]
  0x2816210: ldp      x30, x21, [sp], #0x20
  0x2816214: ret      
  0x2816218: bl       #0x21b4d20 ; -> ??? 0x21b4d20
