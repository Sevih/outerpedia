; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetStatValuePermille @ 0x29033c8..0x2903424 (taille 92 octets) =====
  0x29033c8: cbz      w1, #0x2903414
  0x29033cc: stp      x30, x19, [sp, #-0x10]!
  0x29033d0: mov      w19, w2
  0x29033d4: bl       #0x29032d0 ; -> CCharacterData$$GetStatValue
  0x29033d8: mov      x9, #-0xfe0c00000001
  0x29033dc: smull    x8, w0, w19
  0x29033e0: movk     x9, #0, lsl #48
  0x29033e4: cmp      x8, x9
  0x29033e8: ldp      x30, x19, [sp], #0x10
  0x29033ec: b.gt     #0x290341c
  0x29033f0: mov      x9, #0xf7cf
  0x29033f4: movk     x9, #0xe353, lsl #16
  0x29033f8: movk     x9, #0x9ba5, lsl #32
  0x29033fc: movk     x9, #0x20c4, lsl #48
  0x2903400: smulh    x8, x8, x9
  0x2903404: lsr      x9, x8, #0x3f
  0x2903408: lsr      x8, x8, #7
  0x290340c: add      w0, w8, w9
  0x2903410: ret      
  0x2903414: mov      w0, wzr
  0x2903418: ret      
  0x290341c: mov      w0, #0x7fffffff
  0x2903420: ret      
