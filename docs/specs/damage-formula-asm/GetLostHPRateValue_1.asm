; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetLostHPRateValue_1 @ 0x280f19c..0x280f220 (taille 132 octets) =====
  0x280f19c: stp      x30, x21, [sp, #-0x20]!
  0x280f1a0: stp      x20, x19, [sp, #0x10]
  0x280f1a4: mov      x20, x0
  0x280f1a8: ldr      x0, [x0, #0x28]
  0x280f1ac: cbz      x0, #0x280f21c
  0x280f1b0: mov      w19, w1
  0x280f1b4: mov      x1, xzr
  0x280f1b8: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f1bc: cmp      w0, #1
  0x280f1c0: b.lt     #0x280f20c
  0x280f1c4: ldr      x0, [x20, #0x28]
  0x280f1c8: cbz      x0, #0x280f21c
  0x280f1cc: mov      x1, xzr
  0x280f1d0: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f1d4: mov      w21, w0
  0x280f1d8: mov      x0, x20
  0x280f1dc: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x280f1e0: ldr      x8, [x20, #0x28]
  0x280f1e4: cbz      x8, #0x280f21c
  0x280f1e8: mov      w20, w0
  0x280f1ec: mov      x0, x8
  0x280f1f0: mov      x1, xzr
  0x280f1f4: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f1f8: sub      w8, w21, w20
  0x280f1fc: smull    x8, w8, w19
  0x280f200: sxtw     x9, w0
  0x280f204: sdiv     x0, x8, x9
  0x280f208: b        #0x280f210
  0x280f20c: mov      w0, wzr
  0x280f210: ldp      x20, x19, [sp, #0x10]
  0x280f214: ldp      x30, x21, [sp], #0x20
  0x280f218: ret      
  0x280f21c: bl       #0x21afc18 ; -> ??? 0x21afc18
