; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetArchiveGrowValueByType @ 0x2913e2c..0x2913e5c (taille 48 octets) =====
  0x2913e2c: cmp      w1, #3
  0x2913e30: b.ls     #0x2913e48
  0x2913e34: sub      w8, w1, #4
  0x2913e38: cmp      w8, #4
  0x2913e3c: b.ls     #0x2913e50
  0x2913e40: mov      w0, wzr
  0x2913e44: ret      
  0x2913e48: add      x8, x0, #0x98
  0x2913e4c: b        #0x2913e54
  0x2913e50: add      x8, x0, #0x60
  0x2913e54: ldrb     w0, [x8]
  0x2913e58: ret      
