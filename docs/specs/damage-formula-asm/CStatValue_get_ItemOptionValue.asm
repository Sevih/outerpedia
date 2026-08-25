; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_get_ItemOptionValue @ 0x2a0401c..0x2a04080 (taille 100 octets) =====
  0x2a0401c: stp      x30, x21, [sp, #-0x20]!
  0x2a04020: stp      x20, x19, [sp, #0x10]
  0x2a04024: adrp     x21, #0x59e8000
  0x2a04028: adrp     x20, #0x5599000
  0x2a0402c: ldrb     w8, [x21, #0x5cc]
  0x2a04030: ldr      x20, [x20, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04034: mov      x19, x0
  0x2a04038: tbnz     w8, #0, #0x2a04050
  0x2a0403c: adrp     x0, #0x5599000
  0x2a04040: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a04044: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a04048: mov      w8, #1
  0x2a0404c: strb     w8, [x21, #0x5cc]
  0x2a04050: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2a04054: ldur     x20, [x19, #0xa4]
  0x2a04058: ldr      w19, [x19, #0xac]
  0x2a0405c: ldr      w8, [x0, #0xe0]
  0x2a04060: cbnz     w8, #0x2a04068
  0x2a04064: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a04068: mov      x0, x20
  0x2a0406c: mov      x1, x19
  0x2a04070: ldp      x20, x19, [sp, #0x10]
  0x2a04074: mov      x2, xzr
  0x2a04078: ldp      x30, x21, [sp], #0x20
  0x2a0407c: b        #0x2cc0314
