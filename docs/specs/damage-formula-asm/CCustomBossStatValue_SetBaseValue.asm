; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCustomBossStatValue_SetBaseValue @ 0x29fc7c4..0x29fc884 (taille 192 octets) =====
  0x29fc7c4: stp      x30, x23, [sp, #-0x30]!
  0x29fc7c8: stp      x22, x21, [sp, #0x10]
  0x29fc7cc: stp      x20, x19, [sp, #0x20]
  0x29fc7d0: adrp     x23, #0x59d8000
  0x29fc7d4: ldrb     w8, [x23, #0x9b4]
  0x29fc7d8: mov      w22, w3
  0x29fc7dc: mov      w20, w2
  0x29fc7e0: mov      w21, w1
  0x29fc7e4: mov      x19, x0
  0x29fc7e8: tbnz     w8, #0, #0x29fc800
  0x29fc7ec: adrp     x0, #0x558a000
  0x29fc7f0: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc7f4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc7f8: mov      w8, #1
  0x29fc7fc: strb     w8, [x23, #0x9b4]
  0x29fc800: ldr      w8, [x19, #0x10]
  0x29fc804: adrp     x23, #0x558a000
  0x29fc808: ldr      x23, [x23, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc80c: cmp      w8, #1
  0x29fc810: b.ne     #0x29fc82c
  0x29fc814: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc818: ldr      w8, [x0, #0xe0]
  0x29fc81c: cbnz     w8, #0x29fc824
  0x29fc820: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc824: sub      w20, w20, w21
  0x29fc828: b        #0x29fc858
  0x29fc82c: mov      w0, w21
  0x29fc830: mov      w1, w20
  0x29fc834: mov      w2, w22
  0x29fc838: mov      x3, xzr
  0x29fc83c: bl       #0x2cb1bd4 ; -> CFormula$$CalcStat
  0x29fc840: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc844: mov      w20, w0
  0x29fc848: ldr      w9, [x8, #0xe0]
  0x29fc84c: cbnz     w9, #0x29fc858
  0x29fc850: mov      x0, x8
  0x29fc854: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc858: mov      w0, w20
  0x29fc85c: mov      x1, xzr
  0x29fc860: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fc864: mov      w8, #1
  0x29fc868: stur     x0, [x19, #0x14]
  0x29fc86c: str      w1, [x19, #0x1c]
  0x29fc870: strb     w8, [x19, #0xe0]
  0x29fc874: ldp      x20, x19, [sp, #0x20]
  0x29fc878: ldp      x22, x21, [sp, #0x10]
  0x29fc87c: ldp      x30, x23, [sp], #0x30
  0x29fc880: ret      
