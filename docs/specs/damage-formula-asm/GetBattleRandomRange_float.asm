; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetBattleRandomRange_float @ 0x2cc0598..0x2cc05f8 (taille 96 octets) =====
  0x2cc0598: stp      d9, d8, [sp, #-0x20]!
  0x2cc059c: str      x30, [sp, #0x10]
  0x2cc05a0: mov      x0, xzr
  0x2cc05a4: mov      v8.16b, v1.16b
  0x2cc05a8: mov      v9.16b, v0.16b
  0x2cc05ac: str      wzr, [sp, #0x1c]
  0x2cc05b0: bl       #0x25599a8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2cc05b4: cbz      x0, #0x2cc05f4
  0x2cc05b8: add      x1, sp, #0x1c
  0x2cc05bc: mov      v0.16b, v9.16b
  0x2cc05c0: mov      v1.16b, v8.16b
  0x2cc05c4: mov      x2, xzr
  0x2cc05c8: bl       #0x256a424 ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2cc05cc: tbz      w0, #0, #0x2cc05d8
  0x2cc05d0: ldr      s0, [sp, #0x1c]
  0x2cc05d4: b        #0x2cc05e8
  0x2cc05d8: mov      v0.16b, v9.16b
  0x2cc05dc: mov      v1.16b, v8.16b
  0x2cc05e0: mov      x0, xzr
  0x2cc05e4: bl       #0x5040aa4 ; -> UnityEngine.Random$$Range
  0x2cc05e8: ldr      x30, [sp, #0x10]
  0x2cc05ec: ldp      d9, d8, [sp], #0x20
  0x2cc05f0: ret      
  0x2cc05f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
