; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetLostHPRateValue_1 @ 0x281611c..0x28161a0 (taille 132 octets) =====
  0x281611c: stp      x30, x21, [sp, #-0x20]!
  0x2816120: stp      x20, x19, [sp, #0x10]
  0x2816124: mov      x20, x0
  0x2816128: ldr      x0, [x0, #0x28]
  0x281612c: cbz      x0, #0x281619c
  0x2816130: mov      w19, w1
  0x2816134: mov      x1, xzr
  0x2816138: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x281613c: cmp      w0, #1
  0x2816140: b.lt     #0x281618c
  0x2816144: ldr      x0, [x20, #0x28]
  0x2816148: cbz      x0, #0x281619c
  0x281614c: mov      x1, xzr
  0x2816150: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2816154: mov      w21, w0
  0x2816158: mov      x0, x20
  0x281615c: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x2816160: ldr      x8, [x20, #0x28]
  0x2816164: cbz      x8, #0x281619c
  0x2816168: mov      w20, w0
  0x281616c: mov      x0, x8
  0x2816170: mov      x1, xzr
  0x2816174: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2816178: sub      w8, w21, w20
  0x281617c: smull    x8, w8, w19
  0x2816180: sxtw     x9, w0
  0x2816184: sdiv     x0, x8, x9
  0x2816188: b        #0x2816190
  0x281618c: mov      w0, wzr
  0x2816190: ldp      x20, x19, [sp, #0x10]
  0x2816194: ldp      x30, x21, [sp], #0x20
  0x2816198: ret      
  0x281619c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
