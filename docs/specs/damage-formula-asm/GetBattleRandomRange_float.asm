; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetBattleRandomRange_float @ 0x2cb1b64..0x2cb1bc4 (taille 96 octets) =====
  0x2cb1b64: stp      d9, d8, [sp, #-0x20]!
  0x2cb1b68: str      x30, [sp, #0x10]
  0x2cb1b6c: mov      x0, xzr
  0x2cb1b70: mov      v8.16b, v1.16b
  0x2cb1b74: mov      v9.16b, v0.16b
  0x2cb1b78: str      wzr, [sp, #0x1c]
  0x2cb1b7c: bl       #0x2553390 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2cb1b80: cbz      x0, #0x2cb1bc0
  0x2cb1b84: add      x1, sp, #0x1c
  0x2cb1b88: mov      v0.16b, v9.16b
  0x2cb1b8c: mov      v1.16b, v8.16b
  0x2cb1b90: mov      x2, xzr
  0x2cb1b94: bl       #0x2563e0c ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2cb1b98: tbz      w0, #0, #0x2cb1ba4
  0x2cb1b9c: ldr      s0, [sp, #0x1c]
  0x2cb1ba0: b        #0x2cb1bb4
  0x2cb1ba4: mov      v0.16b, v9.16b
  0x2cb1ba8: mov      v1.16b, v8.16b
  0x2cb1bac: mov      x0, xzr
  0x2cb1bb0: bl       #0x50321a0 ; -> UnityEngine.Random$$Range
  0x2cb1bb4: ldr      x30, [sp, #0x10]
  0x2cb1bb8: ldp      d9, d8, [sp], #0x20
  0x2cb1bbc: ret      
  0x2cb1bc0: bl       #0x21afc18 ; -> ??? 0x21afc18
