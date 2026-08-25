; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue_ovr2 @ 0x2a07034..0x2a0704c (taille 24 octets) =====
  0x2a07034: ldr      w8, [x0, #0x10]
  0x2a07038: cmp      w8, #3
  0x2a0703c: b.ne     #0x2a07048
  0x2a07040: mov      w0, wzr
  0x2a07044: ret      
  0x2a07048: b        #0x2a064e0
