; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBuff_get_Value @ 0x232548c..0x23254b0 (taille 36 octets) =====
  0x232548c: str      x30, [sp, #-0x10]!
  0x2325490: ldr      x8, [x0, #0x10]
  0x2325494: cbz      x8, #0x23254ac
  0x2325498: ldr      w8, [x8, #0x54]
  0x232549c: ldr      w9, [x0, #0x30]
  0x23254a0: mul      w0, w9, w8
  0x23254a4: ldr      x30, [sp], #0x10
  0x23254a8: ret      
  0x23254ac: bl       #0x21b4d20 ; -> ??? 0x21b4d20
