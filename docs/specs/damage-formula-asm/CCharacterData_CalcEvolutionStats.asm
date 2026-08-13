; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcEvolutionStats @ 0x2907704..0x29078dc (taille 472 octets) =====
  0x2907704: sub      sp, sp, #0x60
  0x2907708: stp      x30, x23, [sp, #0x30]
  0x290770c: stp      x22, x21, [sp, #0x40]
  0x2907710: stp      x20, x19, [sp, #0x50]
  0x2907714: adrp     x20, #0x59d8000
  0x2907718: ldrb     w8, [x20, #0x284]
  0x290771c: mov      x19, x0
  0x2907720: tbnz     w8, #0, #0x2907774
  0x2907724: adrp     x0, #0x55b6000
  0x2907728: ldr      x0, [x0, #0x7d8] ; = 0x0 (u64 @ 0x55b67d8)
  0x290772c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907730: adrp     x0, #0x55b6000
  0x2907734: ldr      x0, [x0, #0x7e0] ; = 0x0 (u64 @ 0x55b67e0)
  0x2907738: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290773c: adrp     x0, #0x55b6000
  0x2907740: ldr      x0, [x0, #0x7e8] ; = 0x0 (u64 @ 0x55b67e8)
  0x2907744: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907748: adrp     x0, #0x55b6000
  0x290774c: ldr      x0, [x0, #0x7f0] ; = 0x0 (u64 @ 0x55b67f0)
  0x2907750: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907754: adrp     x0, #0x55b6000
  0x2907758: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290775c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2907760: adrp     x0, #0x55b6000
  0x2907764: ldr      x0, [x0, #0x7f8] ; = 0x0 (u64 @ 0x55b67f8)
  0x2907768: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290776c: mov      w8, #1
  0x2907770: strb     w8, [x20, #0x284]
  0x2907774: movi     v0.2d, #0000000000000000
  0x2907778: mov      w1, #1
  0x290777c: mov      x0, x19
  0x2907780: mov      w2, wzr
  0x2907784: str      xzr, [sp, #0x20]
  0x2907788: stp      q0, q0, [sp]
  0x290778c: bl       #0x2908a60 ; -> CCharacterData$$GetEvolutionStat
  0x2907790: ldr      x9, [x19, #0x40]
  0x2907794: cbz      x9, #0x290786c
  0x2907798: adrp     x8, #0x55b6000
  0x290779c: ldr      x8, [x8, #0x7d8] ; = 0x0 (u64 @ 0x55b67d8)
  0x29077a0: adrp     x22, #0x55b6000
  0x29077a4: adrp     x23, #0x55b6000
  0x29077a8: adrp     x21, #0x55b6000
  0x29077ac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29077b0: ldr      x22, [x22, #0x7e8] ; = 0x0 (u64 @ 0x55b67e8)
  0x29077b4: ldr      x23, [x23, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29077b8: ldr      x21, [x21, #0x7e0] ; = 0x0 (u64 @ 0x55b67e0)
  0x29077bc: mov      x19, x0
  0x29077c0: mov      x8, sp
  0x29077c4: mov      x0, x9
  0x29077c8: bl       #0x401a150 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x29077cc: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x29077d0: mov      x0, sp
  0x29077d4: bl       #0x415e7b8 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x29077d8: tbz      w0, #0, #0x2907848
  0x29077dc: ldr      x20, [sp, #0x18]
  0x29077e0: cbz      x20, #0x2907868
  0x29077e4: ldr      x8, [x20]
  0x29077e8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x29077ec: ldrh     w9, [x8, #0x12e]
  0x29077f0: cbz      x9, #0x2907814
  0x29077f4: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29077f8: add      x10, x10, #8
  0x29077fc: ldur     x11, [x10, #-8]
  0x2907800: cmp      x11, x1
  0x2907804: b.eq     #0x2907824
  0x2907808: subs     x9, x9, #1
  0x290780c: add      x10, x10, #0x10
  0x2907810: b.ne     #0x29077fc
  0x2907814: mov      w2, #0xb
  0x2907818: mov      x0, x20
  0x290781c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2907820: b        #0x2907834
  0x2907824: ldr      w9, [x10]
  0x2907828: add      w9, w9, #0xb
  0x290782c: add      x8, x8, w9, sxtw #4
  0x2907830: add      x0, x8, #0x138
  0x2907834: ldp      x8, x2, [x0]
  0x2907838: mov      x0, x20
  0x290783c: mov      x1, x19
  0x2907840: blr      x8
  0x2907844: b        #0x29077cc
  0x2907848: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55b6000)
  0x290784c: mov      x0, sp
  0x2907850: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2907854: ldp      x20, x19, [sp, #0x50]
  0x2907858: ldp      x22, x21, [sp, #0x40]
  0x290785c: ldp      x30, x23, [sp, #0x30]
  0x2907860: add      sp, sp, #0x60
  0x2907864: ret      
  0x2907868: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x290786c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2907870: b        #0x2907878
  0x2907874: b        #0x2907878
  0x2907878: mov      x19, x0
  0x290787c: cmp      w1, #1
  0x2907880: b.ne     #0x29078ac
  0x2907884: mov      x0, x19
  0x2907888: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x290788c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2907890: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2907894: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55b6000)
  0x2907898: mov      x0, sp
  0x290789c: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x29078a0: cbz      x20, #0x2907854
  0x29078a4: mov      x0, x20
  0x29078a8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29078ac: mov      x20, xzr
  0x29078b0: b        #0x29078b8
  0x29078b4: mov      x19, x0
  0x29078b8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x55b6000)
  0x29078bc: mov      x0, sp
  0x29078c0: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x29078c4: cbnz     x20, #0x29078d0
  0x29078c8: mov      x0, x19
  0x29078cc: bl       #0x22b072c ; -> ??? 0x22b072c
  0x29078d0: mov      x0, x20
  0x29078d4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29078d8: bl       #0x1f86e18 ; -> ??? 0x1f86e18
