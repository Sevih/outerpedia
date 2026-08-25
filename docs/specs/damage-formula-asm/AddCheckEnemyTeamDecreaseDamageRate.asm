; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== AddCheckEnemyTeamDecreaseDamageRate @ 0x2cc1550..0x2cc1588 (taille 56 octets) =====
  0x2cc1550: stp      x30, x21, [sp, #-0x20]!
  0x2cc1554: stp      x20, x19, [sp, #0x10]
  0x2cc1558: cbz      x0, #0x2cc1584
  0x2cc155c: ldr      w21, [x2]
  0x2cc1560: mov      w20, w1
  0x2cc1564: mov      x1, xzr
  0x2cc1568: mov      x19, x2
  0x2cc156c: bl       #0x282fb94 ; -> CCharacterBattle$$FindBuffEnemyTeamDecreaseDamageRate
  0x2cc1570: madd     w8, w0, w20, w21
  0x2cc1574: str      w8, [x19]
  0x2cc1578: ldp      x20, x19, [sp, #0x10]
  0x2cc157c: ldp      x30, x21, [sp], #0x20
  0x2cc1580: ret      
  0x2cc1584: bl       #0x21b4d20 ; -> ??? 0x21b4d20
