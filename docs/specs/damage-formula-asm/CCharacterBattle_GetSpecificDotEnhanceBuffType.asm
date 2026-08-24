; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetSpecificDotEnhanceBuffType @ 0x282a90c..0x282a928 (taille 28 octets) =====
  0x282a90c: sub      w8, w0, #0x38
  0x282a910: cmp      w8, #6
  0x282a914: b.hi     #0x282a920
  0x282a918: add      w0, w0, #0xe
  0x282a91c: ret      
  0x282a920: mov      w0, wzr
  0x282a924: ret      
