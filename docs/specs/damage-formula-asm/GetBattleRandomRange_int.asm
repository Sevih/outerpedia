; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetBattleRandomRange_int @ 0x2cc0538..0x2cc0598 (taille 96 octets) =====
  0x2cc0538: str      x30, [sp, #-0x20]!
  0x2cc053c: stp      x20, x19, [sp, #0x10]
  0x2cc0540: mov      w19, w0
  0x2cc0544: mov      x0, xzr
  0x2cc0548: mov      w20, w1
  0x2cc054c: str      wzr, [sp, #0xc]
  0x2cc0550: bl       #0x25599a8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2cc0554: cbz      x0, #0x2cc0594
  0x2cc0558: add      x3, sp, #0xc
  0x2cc055c: mov      w1, w19
  0x2cc0560: mov      w2, w20
  0x2cc0564: mov      x4, xzr
  0x2cc0568: bl       #0x256a1c0 ; -> CPvpRealtimeMatch$$GetRandomRange
  0x2cc056c: tbz      w0, #0, #0x2cc0578
  0x2cc0570: ldr      w0, [sp, #0xc]
  0x2cc0574: b        #0x2cc0588
  0x2cc0578: add      w1, w20, #1
  0x2cc057c: mov      w0, w19
  0x2cc0580: mov      x2, xzr
  0x2cc0584: bl       #0x5040ae4 ; -> UnityEngine.Random$$Range
  0x2cc0588: ldp      x20, x19, [sp, #0x10]
  0x2cc058c: ldr      x30, [sp], #0x20
  0x2cc0590: ret      
  0x2cc0594: bl       #0x21b4d20 ; -> ??? 0x21b4d20
