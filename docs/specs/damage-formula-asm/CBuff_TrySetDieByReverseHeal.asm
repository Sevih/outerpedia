; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBuff_TrySetDieByReverseHeal @ 0x2331224..0x23312c0 (taille 156 octets) =====
  0x2331224: stp      x30, x19, [sp, #-0x10]!
  0x2331228: mov      x19, x0
  0x233122c: ldr      x0, [x0, #0x20]
  0x2331230: cbz      x0, #0x23312bc
  0x2331234: mov      x1, xzr
  0x2331238: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x233123c: cbnz     w0, #0x23312b4
  0x2331240: ldr      x0, [x19, #0x20]
  0x2331244: cbz      x0, #0x23312bc
  0x2331248: mov      x1, xzr
  0x233124c: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x2331250: tbz      w0, #0, #0x23312b4
  0x2331254: ldr      x0, [x19, #0x20]
  0x2331258: cbz      x0, #0x23312bc
  0x233125c: ldrb     w8, [x0, #0x2e8]
  0x2331260: cbnz     w8, #0x23312b4
  0x2331264: ldr      x8, [x0]
  0x2331268: mov      w1, wzr
  0x233126c: ldp      x9, x2, [x8, #0x198]
  0x2331270: blr      x9
  0x2331274: ldr      x0, [x19, #0x20]
  0x2331278: cbz      x0, #0x23312bc
  0x233127c: ldr      w8, [x0, #0x21c]
  0x2331280: cmp      w8, #1
  0x2331284: b.ne     #0x23312b4
  0x2331288: mov      x1, xzr
  0x233128c: bl       #0x2814ac4 ; -> CCharacterBattle$$get_IsBoss
  0x2331290: tbz      w0, #0, #0x23312b4
  0x2331294: ldr      x0, [x19, #0x20]
  0x2331298: cbz      x0, #0x23312bc
  0x233129c: mov      x1, xzr
  0x23312a0: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x23312a4: cbz      x0, #0x23312bc
  0x23312a8: mov      x1, xzr
  0x23312ac: ldp      x30, x19, [sp], #0x10
  0x23312b0: b        #0x2598690
  0x23312b4: ldp      x30, x19, [sp], #0x10
  0x23312b8: ret      
  0x23312bc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
