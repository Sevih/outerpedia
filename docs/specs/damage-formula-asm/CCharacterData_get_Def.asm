; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_Def @ 0x2901fe8..0x29020c4 (taille 220 octets) =====
  0x2901fe8: str      x30, [sp, #-0x20]!
  0x2901fec: stp      x20, x19, [sp, #0x10]
  0x2901ff0: adrp     x20, #0x59d8000
  0x2901ff4: ldrb     w8, [x20, #0x25b]
  0x2901ff8: mov      x19, x0
  0x2901ffc: tbnz     w8, #0, #0x2902020
  0x2902000: adrp     x0, #0x55b6000
  0x2902004: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902008: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290200c: adrp     x0, #0x55b6000
  0x2902010: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2902014: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2902018: mov      w8, #1
  0x290201c: strb     w8, [x20, #0x25b]
  0x2902020: ldrb     w8, [x19, #0x28]
  0x2902024: cbz      w8, #0x2902030
  0x2902028: mov      x0, x19
  0x290202c: bl       #0x2904780 ; -> CCharacterData$$CalcStat
  0x2902030: ldr      x0, [x19, #0x40]
  0x2902034: cbz      x0, #0x29020c0
  0x2902038: adrp     x8, #0x55b6000
  0x290203c: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55b6778)
  0x2902040: mov      w1, #5
  0x2902044: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2902048: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290204c: cbz      x0, #0x29020c0
  0x2902050: adrp     x10, #0x55b6000
  0x2902054: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2902058: ldr      x10, [x10, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290205c: mov      x19, x0
  0x2902060: ldrh     w9, [x8, #0x12e]
  0x2902064: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55b6000)
  0x2902068: cbz      x9, #0x290208c
  0x290206c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2902070: add      x10, x10, #8
  0x2902074: ldur     x11, [x10, #-8]
  0x2902078: cmp      x11, x1
  0x290207c: b.eq     #0x290209c
  0x2902080: subs     x9, x9, #1
  0x2902084: add      x10, x10, #0x10
  0x2902088: b.ne     #0x2902074
  0x290208c: mov      w2, #1
  0x2902090: mov      x0, x19
  0x2902094: bl       #0x2210028 ; -> ??? 0x2210028
  0x2902098: b        #0x29020ac
  0x290209c: ldr      w9, [x10]
  0x29020a0: add      w9, w9, #1
  0x29020a4: add      x8, x8, w9, sxtw #4
  0x29020a8: add      x0, x8, #0x138
  0x29020ac: ldp      x2, x1, [x0]
  0x29020b0: mov      x0, x19
  0x29020b4: ldp      x20, x19, [sp, #0x10]
  0x29020b8: ldr      x30, [sp], #0x20
  0x29020bc: br       x2
  0x29020c0: bl       #0x21afc18 ; -> ??? 0x21afc18
