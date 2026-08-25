; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_BuffValue @ 0x2a040f0..0x2a04154 (taille 100 octets) =====
  0x2a040f0: stp      x30, x21, [sp, #-0x20]!
  0x2a040f4: stp      x20, x19, [sp, #0x10]
  0x2a040f8: adrp     x21, #0x59e8000
  0x2a040fc: adrp     x20, #0x5599000
  0x2a04100: ldrb     w8, [x21, #0x5ce]
  0x2a04104: ldr      x20, [x20, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04108: mov      x19, x0
  0x2a0410c: tbnz     w8, #0, #0x2a04124
  0x2a04110: adrp     x0, #0x5599000
  0x2a04114: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04118: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a0411c: mov      w8, #1
  0x2a04120: strb     w8, [x21, #0x5ce]
  0x2a04124: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a04128: ldr      x20, [x19, #0xb0]
  0x2a0412c: ldr      w19, [x19, #0xb8]
  0x2a04130: ldr      w8, [x0, #0xe0]
  0x2a04134: cbnz     w8, #0x2a0413c
  0x2a04138: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a0413c: mov      x0, x20
  0x2a04140: mov      x1, x19
  0x2a04144: ldp      x20, x19, [sp, #0x10]
  0x2a04148: mov      x2, xzr
  0x2a0414c: ldp      x30, x21, [sp], #0x20
  0x2a04150: b        #0x2cc0314
