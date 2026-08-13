; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetSkillFactor @ 0x250fc6c..0x250fc94 (taille 40 octets) =====
  0x250fc6c: str      x30, [sp, #-0x10]!
  0x250fc70: ldr      w1, [x0, #0x70]
  0x250fc74: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x250fc78: cbz      x0, #0x250fc88
  0x250fc7c: ldr      x8, [x0, #0x18]
  0x250fc80: cbz      x8, #0x250fc90
  0x250fc84: ldr      w0, [x8, #0x28]
  0x250fc88: ldr      x30, [sp], #0x10
  0x250fc8c: ret      
  0x250fc90: bl       #0x21afc18 ; -> ??? 0x21afc18
