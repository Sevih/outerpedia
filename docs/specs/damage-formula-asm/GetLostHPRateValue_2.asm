; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetLostHPRateValue_2 @ 0x280f220..0x280f29c (taille 124 octets) =====
  0x280f220: stp      x30, x21, [sp, #-0x20]!
  0x280f224: stp      x20, x19, [sp, #0x10]
  0x280f228: mov      x21, x0
  0x280f22c: ldr      x0, [x0, #0x28]
  0x280f230: cbz      x0, #0x280f298
  0x280f234: mov      w20, w1
  0x280f238: mov      x1, xzr
  0x280f23c: mov      w19, w2
  0x280f240: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f244: cmp      w0, #1
  0x280f248: b.lt     #0x280f288
  0x280f24c: ldr      x0, [x21, #0x28]
  0x280f250: cbz      x0, #0x280f298
  0x280f254: mov      x1, xzr
  0x280f258: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f25c: ldr      x8, [x21, #0x28]
  0x280f260: cbz      x8, #0x280f298
  0x280f264: mov      w21, w0
  0x280f268: mov      x0, x8
  0x280f26c: mov      x1, xzr
  0x280f270: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280f274: sub      w8, w21, w20
  0x280f278: smull    x8, w8, w19
  0x280f27c: sxtw     x9, w0
  0x280f280: sdiv     x0, x8, x9
  0x280f284: b        #0x280f28c
  0x280f288: mov      w0, wzr
  0x280f28c: ldp      x20, x19, [sp, #0x10]
  0x280f290: ldp      x30, x21, [sp], #0x20
  0x280f294: ret      
  0x280f298: bl       #0x21afc18 ; -> ??? 0x21afc18
