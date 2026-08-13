; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetElementeryDamageRate @ 0x2cb2984..0x2cb2a88 (taille 260 octets) =====
  0x2cb2984: stp      x30, x21, [sp, #-0x20]!
  0x2cb2988: stp      x20, x19, [sp, #0x10]
  0x2cb298c: cbz      x0, #0x2cb2a84
  0x2cb2990: mov      x21, x1
  0x2cb2994: mov      x1, xzr
  0x2cb2998: mov      x19, x0
  0x2cb299c: bl       #0x281bb68 ; -> CCharacterBattle$$FindBuffElementSuperiority
  0x2cb29a0: tbz      w0, #0, #0x2cb29b8
  0x2cb29a4: mov      x0, x19
  0x2cb29a8: mov      x1, xzr
  0x2cb29ac: bl       #0x28287f8 ; -> CCharacterBattle$$FindBuffElementDamageRate
  0x2cb29b0: add      w0, w0, #0x4b0
  0x2cb29b4: b        #0x2cb2a78
  0x2cb29b8: mov      x0, x19
  0x2cb29bc: mov      x1, xzr
  0x2cb29c0: bl       #0x282866c ; -> CCharacterBattle$$FindBuffElementInferiority
  0x2cb29c4: tbz      w0, #0, #0x2cb29d0
  0x2cb29c8: mov      w0, #0x320
  0x2cb29cc: b        #0x2cb2a78
  0x2cb29d0: ldr      x0, [x19, #0x28]
  0x2cb29d4: cbz      x0, #0x2cb2a84
  0x2cb29d8: mov      x1, xzr
  0x2cb29dc: bl       #0x2900670 ; -> CCharacterData$$get_Element
  0x2cb29e0: cbz      x21, #0x2cb2a84
  0x2cb29e4: mov      w20, w0
  0x2cb29e8: ldr      x0, [x21, #0x28]
  0x2cb29ec: cbz      x0, #0x2cb2a84
  0x2cb29f0: mov      x1, xzr
  0x2cb29f4: bl       #0x2900670 ; -> CCharacterData$$get_Element
  0x2cb29f8: cmp      w20, #2
  0x2cb29fc: b.gt     #0x2cb2a5c
  0x2cb2a00: cmp      w0, #2
  0x2cb2a04: b.gt     #0x2cb2a5c
  0x2cb2a08: mov      w8, #0x5556
  0x2cb2a0c: add      w9, w20, #1
  0x2cb2a10: movk     w8, #0x5555, lsl #16
  0x2cb2a14: smull    x10, w9, w8
  0x2cb2a18: lsr      x11, x10, #0x3f
  0x2cb2a1c: lsr      x10, x10, #0x20
  0x2cb2a20: add      w10, w10, w11
  0x2cb2a24: add      w10, w10, w10, lsl #1
  0x2cb2a28: sub      w9, w9, w10
  0x2cb2a2c: cmp      w9, w0
  0x2cb2a30: b.eq     #0x2cb29a4
  0x2cb2a34: add      w9, w0, #1
  0x2cb2a38: smull    x8, w9, w8
  0x2cb2a3c: lsr      x10, x8, #0x3f
  0x2cb2a40: lsr      x8, x8, #0x20
  0x2cb2a44: add      w8, w8, w10
  0x2cb2a48: add      w8, w8, w8, lsl #1
  0x2cb2a4c: sub      w8, w9, w8
  0x2cb2a50: cmp      w8, w20
  0x2cb2a54: b.eq     #0x2cb29c8
  0x2cb2a58: b        #0x2cb2a74
  0x2cb2a5c: cmp      w20, w0
  0x2cb2a60: b.eq     #0x2cb2a74
  0x2cb2a64: cmp      w20, #3
  0x2cb2a68: b.lt     #0x2cb2a74
  0x2cb2a6c: cmp      w0, #2
  0x2cb2a70: b.gt     #0x2cb29a4
  0x2cb2a74: mov      w0, #0x3e8
  0x2cb2a78: ldp      x20, x19, [sp, #0x10]
  0x2cb2a7c: ldp      x30, x21, [sp], #0x20
  0x2cb2a80: ret      
  0x2cb2a84: bl       #0x21afc18 ; -> ??? 0x21afc18
