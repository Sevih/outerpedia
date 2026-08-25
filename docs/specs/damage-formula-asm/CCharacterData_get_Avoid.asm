; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Avoid @ 0x2909a18..0x2909af4 (taille 220 octets) =====
  0x2909a18: str      x30, [sp, #-0x20]!
  0x2909a1c: stp      x20, x19, [sp, #0x10]
  0x2909a20: adrp     x20, #0x59e7000
  0x2909a24: ldrb     w8, [x20, #0xe83]
  0x2909a28: mov      x19, x0
  0x2909a2c: tbnz     w8, #0, #0x2909a50
  0x2909a30: adrp     x0, #0x55c5000
  0x2909a34: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909a38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909a3c: adrp     x0, #0x55c5000
  0x2909a40: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909a44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909a48: mov      w8, #1
  0x2909a4c: strb     w8, [x20, #0xe83]
  0x2909a50: ldrb     w8, [x19, #0x28]
  0x2909a54: cbz      w8, #0x2909a60
  0x2909a58: mov      x0, x19
  0x2909a5c: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x2909a60: ldr      x0, [x19, #0x40]
  0x2909a64: cbz      x0, #0x2909af0
  0x2909a68: adrp     x8, #0x55c5000
  0x2909a6c: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909a70: mov      w1, #0xe
  0x2909a74: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2909a78: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909a7c: cbz      x0, #0x2909af0
  0x2909a80: adrp     x10, #0x55c5000
  0x2909a84: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2909a88: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909a8c: mov      x19, x0
  0x2909a90: ldrh     w9, [x8, #0x12e]
  0x2909a94: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2909a98: cbz      x9, #0x2909abc
  0x2909a9c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2909aa0: add      x10, x10, #8
  0x2909aa4: ldur     x11, [x10, #-8]
  0x2909aa8: cmp      x11, x1
  0x2909aac: b.eq     #0x2909acc
  0x2909ab0: subs     x9, x9, #1
  0x2909ab4: add      x10, x10, #0x10
  0x2909ab8: b.ne     #0x2909aa4
  0x2909abc: mov      w2, #1
  0x2909ac0: mov      x0, x19
  0x2909ac4: bl       #0x2215130 ; -> ??? 0x2215130
  0x2909ac8: b        #0x2909adc
  0x2909acc: ldr      w9, [x10]
  0x2909ad0: add      w9, w9, #1
  0x2909ad4: add      x8, x8, w9, sxtw #4
  0x2909ad8: add      x0, x8, #0x138
  0x2909adc: ldp      x2, x1, [x0]
  0x2909ae0: mov      x0, x19
  0x2909ae4: ldp      x20, x19, [sp, #0x10]
  0x2909ae8: ldr      x30, [sp], #0x20
  0x2909aec: br       x2
  0x2909af0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
