; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBuff_get_Value @ 0x232036c..0x2320390 (taille 36 octets) =====
  0x232036c: str      x30, [sp, #-0x10]!
  0x2320370: ldr      x8, [x0, #0x10]
  0x2320374: cbz      x8, #0x232038c
  0x2320378: ldr      w8, [x8, #0x54]
  0x232037c: ldr      w9, [x0, #0x30]
  0x2320380: mul      w0, w9, w8
  0x2320384: ldr      x30, [sp], #0x10
  0x2320388: ret      
  0x232038c: bl       #0x21afc18 ; -> ??? 0x21afc18
