; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItemMainOption_get_OptionValue @ 0x233f1b0..0x233f208 (taille 88 octets) =====
  0x233f1b0: str      x30, [sp, #-0x10]!
  0x233f1b4: ldr      x8, [x0, #0x18]
  0x233f1b8: cbz      x8, #0x233f204
  0x233f1bc: ldr      s1, [x0, #0x20]
  0x233f1c0: ldp      s2, s0, [x0, #0x24]
  0x233f1c4: ldr      s3, [x8, #0x24]
  0x233f1c8: fmov     s4, #1.00000000
  0x233f1cc: fadd     s1, s1, s4
  0x233f1d0: fadd     s0, s1, s0
  0x233f1d4: scvtf    s3, s3
  0x233f1d8: mov      w8, #0x7f800000
  0x233f1dc: fadd     s2, s2, s4
  0x233f1e0: fmul     s0, s0, s3
  0x233f1e4: fmov     s4, w8
  0x233f1e8: fmul     s0, s0, s2
  0x233f1ec: fcvtzs   w8, s0
  0x233f1f0: fcmp     s0, s4
  0x233f1f4: mov      w9, #-0xffffffff80000000
  0x233f1f8: csel     w0, w9, w8, eq
  0x233f1fc: ldr      x30, [sp], #0x10
  0x233f200: ret      
  0x233f204: bl       #0x21afc18 ; -> ??? 0x21afc18
