; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ApplyImmediatelyDotDamageCap @ 0x2314828..0x23148e4 (taille 188 octets) =====
  0x2314828: stp      x30, x23, [sp, #-0x30]!
  0x231482c: stp      x22, x21, [sp, #0x10]
  0x2314830: stp      x20, x19, [sp, #0x20]
  0x2314834: adrp     x22, #0x59d4000
  0x2314838: adrp     x23, #0x5587000
  0x231483c: ldrb     w8, [x22, #0xf90]
  0x2314840: ldr      x23, [x23, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2314844: mov      w19, w2
  0x2314848: mov      w21, w1
  0x231484c: mov      x20, x0
  0x2314850: tbnz     w8, #0, #0x2314868
  0x2314854: adrp     x0, #0x5587000
  0x2314858: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x231485c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2314860: mov      w8, #1
  0x2314864: strb     w8, [x22, #0xf90]
  0x2314868: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5587000)
  0x231486c: ldr      w8, [x0, #0xe0]
  0x2314870: cbnz     w8, #0x2314878
  0x2314874: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2314878: mov      x0, x20
  0x231487c: mov      x1, xzr
  0x2314880: mov      x2, xzr
  0x2314884: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2314888: cmp      w19, #1
  0x231488c: b.lt     #0x23148d0
  0x2314890: tbnz     w0, #0, #0x23148d0
  0x2314894: sub      w8, w21, #0x38
  0x2314898: cmp      w8, #5
  0x231489c: b.hi     #0x23148b4
  0x23148a0: add      w1, w21, #0x64
  0x23148a4: mov      x0, x20
  0x23148a8: mov      w2, w19
  0x23148ac: bl       #0x2314994 ; -> CBattleManager$$ApplyDamageCap
  0x23148b0: mov      w19, w0
  0x23148b4: mov      x0, x20
  0x23148b8: mov      w2, w19
  0x23148bc: ldp      x20, x19, [sp, #0x20]
  0x23148c0: ldp      x22, x21, [sp, #0x10]
  0x23148c4: mov      w1, #0xa2
  0x23148c8: ldp      x30, x23, [sp], #0x30
  0x23148cc: b        #0x2314994
  0x23148d0: mov      w0, w19
  0x23148d4: ldp      x20, x19, [sp, #0x20]
  0x23148d8: ldp      x22, x21, [sp, #0x10]
  0x23148dc: ldp      x30, x23, [sp], #0x30
  0x23148e0: ret      
