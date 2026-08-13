; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== AddCheckEnemyTeamDecreaseDamageRate @ 0x2cb2b1c..0x2cb2b54 (taille 56 octets) =====
  0x2cb2b1c: stp      x30, x21, [sp, #-0x20]!
  0x2cb2b20: stp      x20, x19, [sp, #0x10]
  0x2cb2b24: cbz      x0, #0x2cb2b50
  0x2cb2b28: ldr      w21, [x2]
  0x2cb2b2c: mov      w20, w1
  0x2cb2b30: mov      x1, xzr
  0x2cb2b34: mov      x19, x2
  0x2cb2b38: bl       #0x2828988 ; -> CCharacterBattle$$FindBuffEnemyTeamDecreaseDamageRate
  0x2cb2b3c: madd     w8, w0, w20, w21
  0x2cb2b40: str      w8, [x19]
  0x2cb2b44: ldp      x20, x19, [sp, #0x10]
  0x2cb2b48: ldp      x30, x21, [sp], #0x20
  0x2cb2b4c: ret      
  0x2cb2b50: bl       #0x21afc18 ; -> ??? 0x21afc18
