; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_GetImmediatelyDotDamageCapBuffType @ 0x2319a98..0x2319ab4 (taille 28 octets) =====
  0x2319a98: sub      w8, w0, #0x38
  0x2319a9c: cmp      w8, #5
  0x2319aa0: b.hi     #0x2319aac
  0x2319aa4: add      w0, w0, #0x64
  0x2319aa8: ret      
  0x2319aac: mov      w0, wzr
  0x2319ab0: ret      
