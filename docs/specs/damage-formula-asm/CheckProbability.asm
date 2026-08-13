; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CheckProbability @ 0x2cb1c0c..0x2cb1c54 (taille 72 octets) =====
  0x2cb1c0c: cmp      w0, #1
  0x2cb1c10: b.lt     #0x2cb1c34
  0x2cb1c14: stp      x30, x19, [sp, #-0x10]!
  0x2cb1c18: mov      w19, w0
  0x2cb1c1c: tbz      w2, #0, #0x2cb1c3c
  0x2cb1c20: add      w1, w1, #1
  0x2cb1c24: mov      w0, wzr
  0x2cb1c28: mov      x2, xzr
  0x2cb1c2c: bl       #0x50321e0 ; -> UnityEngine.Random$$Range
  0x2cb1c30: b        #0x2cb1c44
  0x2cb1c34: mov      w0, wzr
  0x2cb1c38: ret      
  0x2cb1c3c: mov      w0, wzr
  0x2cb1c40: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x2cb1c44: cmp      w0, w19
  0x2cb1c48: cset     w0, le
  0x2cb1c4c: ldp      x30, x19, [sp], #0x10
  0x2cb1c50: ret      
