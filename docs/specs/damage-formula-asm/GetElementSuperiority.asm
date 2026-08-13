; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetElementSuperiority @ 0x2cb2a88..0x2cb2b1c (taille 148 octets) =====
  0x2cb2a88: cmp      w0, #2
  0x2cb2a8c: b.gt     #0x2cb2acc
  0x2cb2a90: cmp      w1, #2
  0x2cb2a94: b.gt     #0x2cb2acc
  0x2cb2a98: mov      w8, #0x5556
  0x2cb2a9c: add      w9, w0, #1
  0x2cb2aa0: movk     w8, #0x5555, lsl #16
  0x2cb2aa4: smull    x10, w9, w8
  0x2cb2aa8: lsr      x11, x10, #0x3f
  0x2cb2aac: lsr      x10, x10, #0x20
  0x2cb2ab0: add      w10, w10, w11
  0x2cb2ab4: add      w10, w10, w10, lsl #1
  0x2cb2ab8: sub      w9, w9, w10
  0x2cb2abc: cmp      w9, w1
  0x2cb2ac0: b.ne     #0x2cb2af0
  0x2cb2ac4: mov      w8, wzr
  0x2cb2ac8: b        #0x2cb2ae8
  0x2cb2acc: cmp      w0, #3
  0x2cb2ad0: mov      w8, #1
  0x2cb2ad4: b.lt     #0x2cb2ae8
  0x2cb2ad8: cmp      w1, #3
  0x2cb2adc: b.lt     #0x2cb2ae8
  0x2cb2ae0: cmp      w0, w1
  0x2cb2ae4: cset     w8, eq
  0x2cb2ae8: mov      w0, w8
  0x2cb2aec: ret      
  0x2cb2af0: add      w9, w1, #1
  0x2cb2af4: smull    x8, w9, w8
  0x2cb2af8: lsr      x10, x8, #0x3f
  0x2cb2afc: lsr      x8, x8, #0x20
  0x2cb2b00: add      w8, w8, w10
  0x2cb2b04: add      w8, w8, w8, lsl #1
  0x2cb2b08: sub      w8, w9, w8
  0x2cb2b0c: cmp      w8, w0
  0x2cb2b10: mov      w8, #1
  0x2cb2b14: cinc     w0, w8, eq
  0x2cb2b18: ret      
