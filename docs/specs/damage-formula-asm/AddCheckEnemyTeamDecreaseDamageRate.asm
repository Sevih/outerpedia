; ===== AddCheckEnemyTeamDecreaseDamageRate @ 0x2c5acf8..0x2c5ad30 (taille 56 octets) =====
  0x2c5acf8: stp      x30, x21, [sp, #-0x20]!
  0x2c5acfc: stp      x20, x19, [sp, #0x10]
  0x2c5ad00: cbz      x0, #0x2c5ad2c
  0x2c5ad04: ldr      w21, [x2]
  0x2c5ad08: mov      w20, w1
  0x2c5ad0c: mov      x1, xzr
  0x2c5ad10: mov      x19, x2
  0x2c5ad14: bl       #0x26df890 ; -> CCharacterBattle$$FindBuffEnemyTeamDecreaseDamageRate
  0x2c5ad18: madd     w8, w0, w20, w21
  0x2c5ad1c: str      w8, [x19]
  0x2c5ad20: ldp      x20, x19, [sp, #0x10]
  0x2c5ad24: ldp      x30, x21, [sp], #0x20
  0x2c5ad28: ret      
  0x2c5ad2c: bl       #0x21849c0 ; -> ??? 0x21849c0
