; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_AwakeningValue @ 0x2a041c4..0x2a04228 (taille 100 octets) =====
  0x2a041c4: stp      x30, x21, [sp, #-0x20]!
  0x2a041c8: stp      x20, x19, [sp, #0x10]
  0x2a041cc: adrp     x21, #0x59e8000
  0x2a041d0: adrp     x20, #0x5599000
  0x2a041d4: ldrb     w8, [x21, #0x5d0]
  0x2a041d8: ldr      x20, [x20, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a041dc: mov      x19, x0
  0x2a041e0: tbnz     w8, #0, #0x2a041f8
  0x2a041e4: adrp     x0, #0x5599000
  0x2a041e8: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a041ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a041f0: mov      w8, #1
  0x2a041f4: strb     w8, [x21, #0x5d0]
  0x2a041f8: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a041fc: ldur     x20, [x19, #0xbc]
  0x2a04200: ldr      w19, [x19, #0xc4]
  0x2a04204: ldr      w8, [x0, #0xe0]
  0x2a04208: cbnz     w8, #0x2a04210
  0x2a0420c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a04210: mov      x0, x20
  0x2a04214: mov      x1, x19
  0x2a04218: ldp      x20, x19, [sp, #0x10]
  0x2a0421c: mov      x2, xzr
  0x2a04220: ldp      x30, x21, [sp], #0x20
  0x2a04224: b        #0x2cc0314
