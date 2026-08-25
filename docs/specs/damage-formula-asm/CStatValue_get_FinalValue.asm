; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_FinalValue @ 0x2a0436c..0x2a043d0 (taille 100 octets) =====
  0x2a0436c: stp      x30, x21, [sp, #-0x20]!
  0x2a04370: stp      x20, x19, [sp, #0x10]
  0x2a04374: adrp     x21, #0x59e8000
  0x2a04378: adrp     x20, #0x5599000
  0x2a0437c: ldrb     w8, [x21, #0x5d4]
  0x2a04380: ldr      x20, [x20, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04384: mov      x19, x0
  0x2a04388: tbnz     w8, #0, #0x2a043a0
  0x2a0438c: adrp     x0, #0x5599000
  0x2a04390: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04394: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a04398: mov      w8, #1
  0x2a0439c: strb     w8, [x21, #0x5d4]
  0x2a043a0: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a043a4: ldr      x20, [x19, #0xc8]
  0x2a043a8: ldr      w19, [x19, #0xd0]
  0x2a043ac: ldr      w8, [x0, #0xe0]
  0x2a043b0: cbnz     w8, #0x2a043b8
  0x2a043b4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a043b8: mov      x0, x20
  0x2a043bc: mov      x1, x19
  0x2a043c0: ldp      x20, x19, [sp, #0x10]
  0x2a043c4: mov      x2, xzr
  0x2a043c8: ldp      x30, x21, [sp], #0x20
  0x2a043cc: b        #0x2cc0314
