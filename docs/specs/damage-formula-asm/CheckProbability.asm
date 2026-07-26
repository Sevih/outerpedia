; ===== CheckProbability @ 0x2c59de8..0x2c59e30 (taille 72 octets) =====
  0x2c59de8: cmp      w0, #1
  0x2c59dec: b.lt     #0x2c59e10
  0x2c59df0: stp      x30, x19, [sp, #-0x10]!
  0x2c59df4: mov      w19, w0
  0x2c59df8: tbz      w2, #0, #0x2c59e18
  0x2c59dfc: add      w1, w1, #1
  0x2c59e00: mov      w0, wzr
  0x2c59e04: mov      x2, xzr
  0x2c59e08: bl       #0x4f7cb48 ; -> UnityEngine.Random$$Range
  0x2c59e0c: b        #0x2c59e20
  0x2c59e10: mov      w0, wzr
  0x2c59e14: ret      
  0x2c59e18: mov      w0, wzr
  0x2c59e1c: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x2c59e20: cmp      w0, w19
  0x2c59e24: cset     w0, le
  0x2c59e28: ldp      x30, x19, [sp], #0x10
  0x2c59e2c: ret      
