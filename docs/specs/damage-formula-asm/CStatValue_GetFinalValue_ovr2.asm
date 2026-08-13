; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue_ovr2 @ 0x29fc888..0x29fc8a0 (taille 24 octets) =====
  0x29fc888: ldr      w8, [x0, #0x10]
  0x29fc88c: cmp      w8, #3
  0x29fc890: b.ne     #0x29fc89c
  0x29fc894: mov      w0, wzr
  0x29fc898: ret      
  0x29fc89c: b        #0x29fbd34
