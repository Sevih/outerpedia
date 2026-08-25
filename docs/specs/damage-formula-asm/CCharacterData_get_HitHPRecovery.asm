; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_HitHPRecovery @ 0x2909860..0x290993c (taille 220 octets) =====
  0x2909860: str      x30, [sp, #-0x20]!
  0x2909864: stp      x20, x19, [sp, #0x10]
  0x2909868: adrp     x20, #0x59e7000
  0x290986c: ldrb     w8, [x20, #0xe81]
  0x2909870: mov      x19, x0
  0x2909874: tbnz     w8, #0, #0x2909898
  0x2909878: adrp     x0, #0x55c5000
  0x290987c: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909880: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909884: adrp     x0, #0x55c5000
  0x2909888: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290988c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2909890: mov      w8, #1
  0x2909894: strb     w8, [x20, #0xe81]
  0x2909898: ldrb     w8, [x19, #0x28]
  0x290989c: cbz      w8, #0x29098a8
  0x29098a0: mov      x0, x19
  0x29098a4: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x29098a8: ldr      x0, [x19, #0x40]
  0x29098ac: cbz      x0, #0x2909938
  0x29098b0: adrp     x8, #0x55c5000
  0x29098b4: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29098b8: mov      w1, #0xc
  0x29098bc: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x29098c0: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29098c4: cbz      x0, #0x2909938
  0x29098c8: adrp     x10, #0x55c5000
  0x29098cc: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x29098d0: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29098d4: mov      x19, x0
  0x29098d8: ldrh     w9, [x8, #0x12e]
  0x29098dc: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x29098e0: cbz      x9, #0x2909904
  0x29098e4: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x29098e8: add      x10, x10, #8
  0x29098ec: ldur     x11, [x10, #-8]
  0x29098f0: cmp      x11, x1
  0x29098f4: b.eq     #0x2909914
  0x29098f8: subs     x9, x9, #1
  0x29098fc: add      x10, x10, #0x10
  0x2909900: b.ne     #0x29098ec
  0x2909904: mov      w2, #1
  0x2909908: mov      x0, x19
  0x290990c: bl       #0x2215130 ; -> ??? 0x2215130
  0x2909910: b        #0x2909924
  0x2909914: ldr      w9, [x10]
  0x2909918: add      w9, w9, #1
  0x290991c: add      x8, x8, w9, sxtw #4
  0x2909920: add      x0, x8, #0x138
  0x2909924: ldp      x2, x1, [x0]
  0x2909928: mov      x0, x19
  0x290992c: ldp      x20, x19, [sp, #0x10]
  0x2909930: ldr      x30, [sp], #0x20
  0x2909934: br       x2
  0x2909938: bl       #0x21b4d20 ; -> ??? 0x21b4d20
