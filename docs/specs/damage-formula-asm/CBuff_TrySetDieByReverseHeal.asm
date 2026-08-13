; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBuff_TrySetDieByReverseHeal @ 0x232c11c..0x232c1b8 (taille 156 octets) =====
  0x232c11c: stp      x30, x19, [sp, #-0x10]!
  0x232c120: mov      x19, x0
  0x232c124: ldr      x0, [x0, #0x20]
  0x232c128: cbz      x0, #0x232c1b4
  0x232c12c: mov      x1, xzr
  0x232c130: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x232c134: cbnz     w0, #0x232c1ac
  0x232c138: ldr      x0, [x19, #0x20]
  0x232c13c: cbz      x0, #0x232c1b4
  0x232c140: mov      x1, xzr
  0x232c144: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x232c148: tbz      w0, #0, #0x232c1ac
  0x232c14c: ldr      x0, [x19, #0x20]
  0x232c150: cbz      x0, #0x232c1b4
  0x232c154: ldrb     w8, [x0, #0x2e8]
  0x232c158: cbnz     w8, #0x232c1ac
  0x232c15c: ldr      x8, [x0]
  0x232c160: mov      w1, wzr
  0x232c164: ldp      x9, x2, [x8, #0x198]
  0x232c168: blr      x9
  0x232c16c: ldr      x0, [x19, #0x20]
  0x232c170: cbz      x0, #0x232c1b4
  0x232c174: ldr      w8, [x0, #0x21c]
  0x232c178: cmp      w8, #1
  0x232c17c: b.ne     #0x232c1ac
  0x232c180: mov      x1, xzr
  0x232c184: bl       #0x280db44 ; -> CCharacterBattle$$get_IsBoss
  0x232c188: tbz      w0, #0, #0x232c1ac
  0x232c18c: ldr      x0, [x19, #0x20]
  0x232c190: cbz      x0, #0x232c1b4
  0x232c194: mov      x1, xzr
  0x232c198: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x232c19c: cbz      x0, #0x232c1b4
  0x232c1a0: mov      x1, xzr
  0x232c1a4: ldp      x30, x19, [sp], #0x10
  0x232c1a8: b        #0x2592078
  0x232c1ac: ldp      x30, x19, [sp], #0x10
  0x232c1b0: ret      
  0x232c1b4: bl       #0x21afc18 ; -> ??? 0x21afc18
