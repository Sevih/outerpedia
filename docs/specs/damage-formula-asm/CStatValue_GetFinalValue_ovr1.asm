; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue_ovr1 @ 0x2a06f5c..0x2a06f70 (taille 20 octets) =====
  0x2a06f5c: ldr      w8, [x0, #0x10]
  0x2a06f60: cmp      w8, #1
  0x2a06f64: b.ne     #0x2a06f6c
  0x2a06f68: b        #0x2a06900
  0x2a06f6c: b        #0x2a064e0
