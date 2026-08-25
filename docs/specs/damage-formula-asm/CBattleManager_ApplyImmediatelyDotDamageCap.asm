; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBattleManager_ApplyImmediatelyDotDamageCap @ 0x2319948..0x2319a04 (taille 188 octets) =====
  0x2319948: stp      x30, x23, [sp, #-0x30]!
  0x231994c: stp      x22, x21, [sp, #0x10]
  0x2319950: stp      x20, x19, [sp, #0x20]
  0x2319954: adrp     x22, #0x59e4000
  0x2319958: adrp     x23, #0x5596000
  0x231995c: ldrb     w8, [x22, #0xba0]
  0x2319960: ldr      x23, [x23, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2319964: mov      w19, w2
  0x2319968: mov      w21, w1
  0x231996c: mov      x20, x0
  0x2319970: tbnz     w8, #0, #0x2319988
  0x2319974: adrp     x0, #0x5596000
  0x2319978: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x231997c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2319980: mov      w8, #1
  0x2319984: strb     w8, [x22, #0xba0]
  0x2319988: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5596000)
  0x231998c: ldr      w8, [x0, #0xe0]
  0x2319990: cbnz     w8, #0x2319998
  0x2319994: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2319998: mov      x0, x20
  0x231999c: mov      x1, xzr
  0x23199a0: mov      x2, xzr
  0x23199a4: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x23199a8: cmp      w19, #1
  0x23199ac: b.lt     #0x23199f0
  0x23199b0: tbnz     w0, #0, #0x23199f0
  0x23199b4: sub      w8, w21, #0x38
  0x23199b8: cmp      w8, #5
  0x23199bc: b.hi     #0x23199d4
  0x23199c0: add      w1, w21, #0x64
  0x23199c4: mov      x0, x20
  0x23199c8: mov      w2, w19
  0x23199cc: bl       #0x2319ab4 ; -> CBattleManager$$ApplyDamageCap
  0x23199d0: mov      w19, w0
  0x23199d4: mov      x0, x20
  0x23199d8: mov      w2, w19
  0x23199dc: ldp      x20, x19, [sp, #0x20]
  0x23199e0: ldp      x22, x21, [sp, #0x10]
  0x23199e4: mov      w1, #0xa2
  0x23199e8: ldp      x30, x23, [sp], #0x30
  0x23199ec: b        #0x2319ab4
  0x23199f0: mov      w0, w19
  0x23199f4: ldp      x20, x19, [sp, #0x20]
  0x23199f8: ldp      x22, x21, [sp, #0x10]
  0x23199fc: ldp      x30, x23, [sp], #0x30
  0x2319a00: ret      
