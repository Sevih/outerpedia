; ===== GetStatValuePermille @ 0x27e14b8..0x27e1514 (taille 92 octets) =====
  0x27e14b8: cbz      w1, #0x27e1504
  0x27e14bc: stp      x30, x19, [sp, #-0x10]!
  0x27e14c0: mov      w19, w2
  0x27e14c4: bl       #0x27e13c0 ; -> CCharacterData$$GetStatValue
  0x27e14c8: mov      x9, #-0xfe0c00000001
  0x27e14cc: smull    x8, w0, w19
  0x27e14d0: movk     x9, #0, lsl #48
  0x27e14d4: cmp      x8, x9
  0x27e14d8: ldp      x30, x19, [sp], #0x10
  0x27e14dc: b.gt     #0x27e150c
  0x27e14e0: mov      x9, #0xf7cf
  0x27e14e4: movk     x9, #0xe353, lsl #16
  0x27e14e8: movk     x9, #0x9ba5, lsl #32
  0x27e14ec: movk     x9, #0x20c4, lsl #48
  0x27e14f0: smulh    x8, x8, x9
  0x27e14f4: lsr      x9, x8, #0x3f
  0x27e14f8: lsr      x8, x8, #7
  0x27e14fc: add      w0, w8, w9
  0x27e1500: ret      
  0x27e1504: mov      w0, wzr
  0x27e1508: ret      
  0x27e150c: mov      w0, #0x7fffffff
  0x27e1510: ret      
