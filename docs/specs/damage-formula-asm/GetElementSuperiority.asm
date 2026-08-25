; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetElementSuperiority @ 0x2cc14bc..0x2cc1550 (taille 148 octets) =====
  0x2cc14bc: cmp      w0, #2
  0x2cc14c0: b.gt     #0x2cc1500
  0x2cc14c4: cmp      w1, #2
  0x2cc14c8: b.gt     #0x2cc1500
  0x2cc14cc: mov      w8, #0x5556
  0x2cc14d0: add      w9, w0, #1
  0x2cc14d4: movk     w8, #0x5555, lsl #16
  0x2cc14d8: smull    x10, w9, w8
  0x2cc14dc: lsr      x11, x10, #0x3f
  0x2cc14e0: lsr      x10, x10, #0x20
  0x2cc14e4: add      w10, w10, w11
  0x2cc14e8: add      w10, w10, w10, lsl #1
  0x2cc14ec: sub      w9, w9, w10
  0x2cc14f0: cmp      w9, w1
  0x2cc14f4: b.ne     #0x2cc1524
  0x2cc14f8: mov      w8, wzr
  0x2cc14fc: b        #0x2cc151c
  0x2cc1500: cmp      w0, #3
  0x2cc1504: mov      w8, #1
  0x2cc1508: b.lt     #0x2cc151c
  0x2cc150c: cmp      w1, #3
  0x2cc1510: b.lt     #0x2cc151c
  0x2cc1514: cmp      w0, w1
  0x2cc1518: cset     w8, eq
  0x2cc151c: mov      w0, w8
  0x2cc1520: ret      
  0x2cc1524: add      w9, w1, #1
  0x2cc1528: smull    x8, w9, w8
  0x2cc152c: lsr      x10, x8, #0x3f
  0x2cc1530: lsr      x8, x8, #0x20
  0x2cc1534: add      w8, w8, w10
  0x2cc1538: add      w8, w8, w8, lsl #1
  0x2cc153c: sub      w8, w9, w8
  0x2cc1540: cmp      w8, w0
  0x2cc1544: mov      w8, #1
  0x2cc1548: cinc     w0, w8, eq
  0x2cc154c: ret      
