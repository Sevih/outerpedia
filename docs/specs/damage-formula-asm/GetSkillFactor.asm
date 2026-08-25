; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetSkillFactor @ 0x2511700..0x2511728 (taille 40 octets) =====
  0x2511700: str      x30, [sp, #-0x10]!
  0x2511704: ldr      w1, [x0, #0x70]
  0x2511708: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x251170c: cbz      x0, #0x251171c
  0x2511710: ldr      x8, [x0, #0x18]
  0x2511714: cbz      x8, #0x2511724
  0x2511718: ldr      w0, [x8, #0x28]
  0x251171c: ldr      x30, [sp], #0x10
  0x2511720: ret      
  0x2511724: bl       #0x21b4d20 ; -> ??? 0x21b4d20
