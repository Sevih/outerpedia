; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetSpecificDotEnhanceBuffType @ 0x2831b18..0x2831b34 (taille 28 octets) =====
  0x2831b18: sub      w8, w0, #0x38
  0x2831b1c: cmp      w8, #6
  0x2831b20: b.hi     #0x2831b2c
  0x2831b24: add      w0, w0, #0xe
  0x2831b28: ret      
  0x2831b2c: mov      w0, wzr
  0x2831b30: ret      
