; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_GetImmediatelyDotDamageCapBuffType @ 0x2314978..0x2314994 (taille 28 octets) =====
  0x2314978: sub      w8, w0, #0x38
  0x231497c: cmp      w8, #5
  0x2314980: b.hi     #0x231498c
  0x2314984: add      w0, w0, #0x64
  0x2314988: ret      
  0x231498c: mov      w0, wzr
  0x2314990: ret      
