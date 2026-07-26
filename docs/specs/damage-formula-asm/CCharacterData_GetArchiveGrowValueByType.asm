; ===== CCharacterData_GetArchiveGrowValueByType @ 0x27eabf8..0x27eac28 (taille 48 octets) =====
  0x27eabf8: cmp      w1, #3
  0x27eabfc: b.ls     #0x27eac14
  0x27eac00: sub      w8, w1, #4
  0x27eac04: cmp      w8, #4
  0x27eac08: b.ls     #0x27eac1c
  0x27eac0c: mov      w0, wzr
  0x27eac10: ret      
  0x27eac14: add      x8, x0, #0x98
  0x27eac18: b        #0x27eac20
  0x27eac1c: add      x8, x0, #0x60
  0x27eac20: ldrb     w0, [x8]
  0x27eac24: ret      
