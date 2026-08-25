; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CheckProbability @ 0x2cc0640..0x2cc0688 (taille 72 octets) =====
  0x2cc0640: cmp      w0, #1
  0x2cc0644: b.lt     #0x2cc0668
  0x2cc0648: stp      x30, x19, [sp, #-0x10]!
  0x2cc064c: mov      w19, w0
  0x2cc0650: tbz      w2, #0, #0x2cc0670
  0x2cc0654: add      w1, w1, #1
  0x2cc0658: mov      w0, wzr
  0x2cc065c: mov      x2, xzr
  0x2cc0660: bl       #0x5040ae4 ; -> UnityEngine.Random$$Range
  0x2cc0664: b        #0x2cc0678
  0x2cc0668: mov      w0, wzr
  0x2cc066c: ret      
  0x2cc0670: mov      w0, wzr
  0x2cc0674: bl       #0x2cc0538 ; -> CFormula$$GetBattleRandomRange
  0x2cc0678: cmp      w0, w19
  0x2cc067c: cset     w0, le
  0x2cc0680: ldp      x30, x19, [sp], #0x10
  0x2cc0684: ret      
