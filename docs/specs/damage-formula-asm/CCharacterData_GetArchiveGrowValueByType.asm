; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetArchiveGrowValueByType @ 0x290cbb8..0x290cbe8 (taille 48 octets) =====
  0x290cbb8: cmp      w1, #3
  0x290cbbc: b.ls     #0x290cbd4
  0x290cbc0: sub      w8, w1, #4
  0x290cbc4: cmp      w8, #4
  0x290cbc8: b.ls     #0x290cbdc
  0x290cbcc: mov      w0, wzr
  0x290cbd0: ret      
  0x290cbd4: add      x8, x0, #0x98
  0x290cbd8: b        #0x290cbe0
  0x290cbdc: add      x8, x0, #0x60
  0x290cbe0: ldrb     w0, [x8]
  0x290cbe4: ret      
