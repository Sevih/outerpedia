; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue_ovr1 @ 0x29fc7b0..0x29fc7c4 (taille 20 octets) =====
  0x29fc7b0: ldr      w8, [x0, #0x10]
  0x29fc7b4: cmp      w8, #1
  0x29fc7b8: b.ne     #0x29fc7c0
  0x29fc7bc: b        #0x29fc154
  0x29fc7c0: b        #0x29fbd34
