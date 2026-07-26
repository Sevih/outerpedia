; ===== GetBattleRandomRange_float @ 0x2c59d40..0x2c59da0 (taille 96 octets) =====
  0x2c59d40: stp      d9, d8, [sp, #-0x20]!
  0x2c59d44: str      x30, [sp, #0x10]
  0x2c59d48: mov      x0, xzr
  0x2c59d4c: mov      v8.16b, v1.16b
  0x2c59d50: mov      v9.16b, v0.16b
  0x2c59d54: str      wzr, [sp, #0x1c]
  0x2c59d58: bl       #0x250fad8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2c59d5c: cbz      x0, #0x2c59d9c
  0x2c59d60: add      x1, sp, #0x1c
  0x2c59d64: mov      v0.16b, v9.16b
  0x2c59d68: mov      v1.16b, v8.16b
  0x2c59d6c: mov      x2, xzr
  0x2c59d70: bl       #0x251fec4 ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2c59d74: tbz      w0, #0, #0x2c59d80
  0x2c59d78: ldr      s0, [sp, #0x1c]
  0x2c59d7c: b        #0x2c59d90
  0x2c59d80: mov      v0.16b, v9.16b
  0x2c59d84: mov      v1.16b, v8.16b
  0x2c59d88: mov      x0, xzr
  0x2c59d8c: bl       #0x4f7cb08 ; -> UnityEngine.Random$$Range
  0x2c59d90: ldr      x30, [sp, #0x10]
  0x2c59d94: ldp      d9, d8, [sp], #0x20
  0x2c59d98: ret      
  0x2c59d9c: bl       #0x21849c0 ; -> ??? 0x21849c0
