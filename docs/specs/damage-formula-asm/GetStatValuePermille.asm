; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetStatValuePermille @ 0x290a63c..0x290a698 (taille 92 octets) =====
  0x290a63c: cbz      w1, #0x290a688
  0x290a640: stp      x30, x19, [sp, #-0x10]!
  0x290a644: mov      w19, w2
  0x290a648: bl       #0x290a544 ; -> CCharacterData$$GetStatValue
  0x290a64c: mov      x9, #-0xfe0c00000001
  0x290a650: smull    x8, w0, w19
  0x290a654: movk     x9, #0, lsl #48
  0x290a658: cmp      x8, x9
  0x290a65c: ldp      x30, x19, [sp], #0x10
  0x290a660: b.gt     #0x290a690
  0x290a664: mov      x9, #0xf7cf
  0x290a668: movk     x9, #0xe353, lsl #16
  0x290a66c: movk     x9, #0x9ba5, lsl #32
  0x290a670: movk     x9, #0x20c4, lsl #48
  0x290a674: smulh    x8, x8, x9
  0x290a678: lsr      x9, x8, #0x3f
  0x290a67c: lsr      x8, x8, #7
  0x290a680: add      w0, w8, w9
  0x290a684: ret      
  0x290a688: mov      w0, wzr
  0x290a68c: ret      
  0x290a690: mov      w0, #0x7fffffff
  0x290a694: ret      
