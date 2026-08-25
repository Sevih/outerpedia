; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItemMainOption_get_OptionValue @ 0x23444f8..0x2344550 (taille 88 octets) =====
  0x23444f8: str      x30, [sp, #-0x10]!
  0x23444fc: ldr      x8, [x0, #0x18]
  0x2344500: cbz      x8, #0x234454c
  0x2344504: ldr      s1, [x0, #0x20]
  0x2344508: ldp      s2, s0, [x0, #0x24]
  0x234450c: ldr      s3, [x8, #0x24]
  0x2344510: fmov     s4, #1.00000000
  0x2344514: fadd     s1, s1, s4
  0x2344518: fadd     s0, s1, s0
  0x234451c: scvtf    s3, s3
  0x2344520: mov      w8, #0x7f800000
  0x2344524: fadd     s2, s2, s4
  0x2344528: fmul     s0, s0, s3
  0x234452c: fmov     s4, w8
  0x2344530: fmul     s0, s0, s2
  0x2344534: fcvtzs   w8, s0
  0x2344538: fcmp     s0, s4
  0x234453c: mov      w9, #-0xffffffff80000000
  0x2344540: csel     w0, w9, w8, eq
  0x2344544: ldr      x30, [sp], #0x10
  0x2344548: ret      
  0x234454c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
