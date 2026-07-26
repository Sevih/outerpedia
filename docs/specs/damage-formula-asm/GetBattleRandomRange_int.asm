; ===== GetBattleRandomRange_int @ 0x2c59ce0..0x2c59d40 (taille 96 octets) =====
  0x2c59ce0: str      x30, [sp, #-0x20]!
  0x2c59ce4: stp      x20, x19, [sp, #0x10]
  0x2c59ce8: mov      w19, w0
  0x2c59cec: mov      x0, xzr
  0x2c59cf0: mov      w20, w1
  0x2c59cf4: str      wzr, [sp, #0xc]
  0x2c59cf8: bl       #0x250fad8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2c59cfc: cbz      x0, #0x2c59d3c
  0x2c59d00: add      x3, sp, #0xc
  0x2c59d04: mov      w1, w19
  0x2c59d08: mov      w2, w20
  0x2c59d0c: mov      x4, xzr
  0x2c59d10: bl       #0x251fc60 ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2c59d14: tbz      w0, #0, #0x2c59d20
  0x2c59d18: ldr      w0, [sp, #0xc]
  0x2c59d1c: b        #0x2c59d30
  0x2c59d20: add      w1, w20, #1
  0x2c59d24: mov      w0, w19
  0x2c59d28: mov      x2, xzr
  0x2c59d2c: bl       #0x4f7cb48 ; -> UnityEngine.Random$$Range
  0x2c59d30: ldp      x20, x19, [sp, #0x10]
  0x2c59d34: ldr      x30, [sp], #0x20
  0x2c59d38: ret      
  0x2c59d3c: bl       #0x21849c0 ; -> ??? 0x21849c0
