; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetBattleRandomRange_int @ 0x2cb1b04..0x2cb1b64 (taille 96 octets) =====
  0x2cb1b04: str      x30, [sp, #-0x20]!
  0x2cb1b08: stp      x20, x19, [sp, #0x10]
  0x2cb1b0c: mov      w19, w0
  0x2cb1b10: mov      x0, xzr
  0x2cb1b14: mov      w20, w1
  0x2cb1b18: str      wzr, [sp, #0xc]
  0x2cb1b1c: bl       #0x2553390 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2cb1b20: cbz      x0, #0x2cb1b60
  0x2cb1b24: add      x3, sp, #0xc
  0x2cb1b28: mov      w1, w19
  0x2cb1b2c: mov      w2, w20
  0x2cb1b30: mov      x4, xzr
  0x2cb1b34: bl       #0x2563ba8 ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2cb1b38: tbz      w0, #0, #0x2cb1b44
  0x2cb1b3c: ldr      w0, [sp, #0xc]
  0x2cb1b40: b        #0x2cb1b54
  0x2cb1b44: add      w1, w20, #1
  0x2cb1b48: mov      w0, w19
  0x2cb1b4c: mov      x2, xzr
  0x2cb1b50: bl       #0x50321e0 ; -> UnityEngine.Random$$Range
  0x2cb1b54: ldp      x20, x19, [sp, #0x10]
  0x2cb1b58: ldr      x30, [sp], #0x20
  0x2cb1b5c: ret      
  0x2cb1b60: bl       #0x21afc18 ; -> ??? 0x21afc18
