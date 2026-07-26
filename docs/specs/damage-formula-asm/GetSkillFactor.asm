; ===== GetSkillFactor @ 0x24d29a4..0x24d29cc (taille 40 octets) =====
  0x24d29a4: str      x30, [sp, #-0x10]!
  0x24d29a8: ldr      w1, [x0, #0x70]
  0x24d29ac: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x24d29b0: cbz      x0, #0x24d29c0
  0x24d29b4: ldr      x8, [x0, #0x18]
  0x24d29b8: cbz      x8, #0x24d29c8
  0x24d29bc: ldr      w0, [x8, #0x28]
  0x24d29c0: ldr      x30, [sp], #0x10
  0x24d29c4: ret      
  0x24d29c8: bl       #0x21849c0 ; -> ??? 0x21849c0
