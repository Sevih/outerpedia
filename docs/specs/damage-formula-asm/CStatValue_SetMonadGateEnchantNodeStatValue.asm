; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetMonadGateEnchantNodeStatValue @ 0x29fc46c..0x29fc6b0 (taille 580 octets) =====
  0x29fc46c: sub      sp, sp, #0x90
  0x29fc470: stp      x30, x27, [sp, #0x40]
  0x29fc474: stp      x26, x25, [sp, #0x50]
  0x29fc478: stp      x24, x23, [sp, #0x60]
  0x29fc47c: stp      x22, x21, [sp, #0x70]
  0x29fc480: stp      x20, x19, [sp, #0x80]
  0x29fc484: adrp     x21, #0x59d8000
  0x29fc488: adrp     x23, #0x558a000
  0x29fc48c: ldrb     w8, [x21, #0x9b2]
  0x29fc490: ldr      x23, [x23, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc494: mov      x20, x1
  0x29fc498: mov      x19, x0
  0x29fc49c: tbnz     w8, #0, #0x29fc4e4
  0x29fc4a0: adrp     x0, #0x55b6000
  0x29fc4a4: ldr      x0, [x0, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x29fc4a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc4ac: adrp     x0, #0x55b6000
  0x29fc4b0: ldr      x0, [x0, #0x8d8] ; = 0x0 (u64 @ 0x55b68d8)
  0x29fc4b4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc4b8: adrp     x0, #0x55b6000
  0x29fc4bc: ldr      x0, [x0, #0x8f0] ; = 0x0 (u64 @ 0x55b68f0)
  0x29fc4c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc4c4: adrp     x0, #0x55b6000
  0x29fc4c8: ldr      x0, [x0, #0x910] ; = 0x0 (u64 @ 0x55b6910)
  0x29fc4cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc4d0: adrp     x0, #0x558a000
  0x29fc4d4: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc4d8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc4dc: mov      w8, #1
  0x29fc4e0: strb     w8, [x21, #0x9b2]
  0x29fc4e4: mov      x0, x19
  0x29fc4e8: mov      w1, wzr
  0x29fc4ec: stp      xzr, xzr, [sp, #0x20]
  0x29fc4f0: str      xzr, [sp, #0x30]
  0x29fc4f4: bl       #0x29f9a7c ; -> CStatValue$$set_m_nMonadEnchantValue
  0x29fc4f8: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc4fc: ldr      w8, [x0, #0xe0]
  0x29fc500: cbnz     w8, #0x29fc508
  0x29fc504: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc508: mov      w0, wzr
  0x29fc50c: mov      x1, xzr
  0x29fc510: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fc514: str      x0, [x19, #0x98]
  0x29fc518: str      w1, [x19, #0xa0]
  0x29fc51c: cbz      x20, #0x29fc614
  0x29fc520: adrp     x8, #0x55b6000
  0x29fc524: ldr      x8, [x8, #0x910] ; = 0x0 (u64 @ 0x55b6910)
  0x29fc528: adrp     x24, #0x55b6000
  0x29fc52c: adrp     x22, #0x55b6000
  0x29fc530: mov      x0, x20
  0x29fc534: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29fc538: ldr      x24, [x24, #0x8d8] ; = 0x0 (u64 @ 0x55b68d8)
  0x29fc53c: ldr      x22, [x22, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x29fc540: add      x8, sp, #8
  0x29fc544: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x29fc548: ldur     q0, [sp, #8]
  0x29fc54c: ldr      x8, [sp, #0x18]
  0x29fc550: mov      w25, #1
  0x29fc554: str      q0, [sp, #0x20]
  0x29fc558: str      x8, [sp, #0x30]
  0x29fc55c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x29fc560: add      x0, sp, #0x20
  0x29fc564: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x29fc568: tbz      w0, #0, #0x29fc608
  0x29fc56c: ldr      x26, [sp, #0x30]
  0x29fc570: cbz      x26, #0x29fc630
  0x29fc574: ldr      w8, [x19, #0x10]
  0x29fc578: ldr      w9, [x26, #0x54]
  0x29fc57c: cmp      w8, w9
  0x29fc580: b.ne     #0x29fc55c
  0x29fc584: ldr      w8, [x26, #0x58]
  0x29fc588: cmp      w8, #1
  0x29fc58c: b.eq     #0x29fc5e8
  0x29fc590: cmp      w8, #2
  0x29fc594: b.ne     #0x29fc55c
  0x29fc598: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc59c: ldr      x21, [x19, #0x98]
  0x29fc5a0: ldr      w27, [x19, #0xa0]
  0x29fc5a4: ldr      w8, [x0, #0xe0]
  0x29fc5a8: cbnz     w8, #0x29fc5b0
  0x29fc5ac: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc5b0: and      x8, x20, #0xffffffff00000000
  0x29fc5b4: orr      x20, x8, x27
  0x29fc5b8: mov      x0, x21
  0x29fc5bc: mov      x1, x20
  0x29fc5c0: mov      x2, xzr
  0x29fc5c4: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fc5c8: ldr      w8, [x26, #0x5c]
  0x29fc5cc: add      w0, w8, w0
  0x29fc5d0: mov      x1, xzr
  0x29fc5d4: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fc5d8: str      x0, [x19, #0x98]
  0x29fc5dc: str      w1, [x19, #0xa0]
  0x29fc5e0: strb     w25, [x19, #0xe0]
  0x29fc5e4: b        #0x29fc55c
  0x29fc5e8: strb     w25, [x19, #0xe0]
  0x29fc5ec: mov      x0, x19
  0x29fc5f0: bl       #0x29f9aec ; -> CStatValue$$get_m_nMonadEnchantValue
  0x29fc5f4: ldr      w8, [x26, #0x5c]
  0x29fc5f8: add      w1, w8, w0
  0x29fc5fc: mov      x0, x19
  0x29fc600: bl       #0x29f9a7c ; -> CStatValue$$set_m_nMonadEnchantValue
  0x29fc604: b        #0x29fc55c
  0x29fc608: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x29fc60c: add      x0, sp, #0x20
  0x29fc610: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc614: ldp      x20, x19, [sp, #0x80]
  0x29fc618: ldp      x22, x21, [sp, #0x70]
  0x29fc61c: ldp      x24, x23, [sp, #0x60]
  0x29fc620: ldp      x26, x25, [sp, #0x50]
  0x29fc624: ldp      x30, x27, [sp, #0x40]
  0x29fc628: add      sp, sp, #0x90
  0x29fc62c: ret      
  0x29fc630: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x29fc634: b        #0x29fc64c
  0x29fc638: b        #0x29fc64c
  0x29fc63c: b        #0x29fc64c
  0x29fc640: b        #0x29fc64c
  0x29fc644: b        #0x29fc64c
  0x29fc648: b        #0x29fc64c
  0x29fc64c: mov      x19, x0
  0x29fc650: cmp      w1, #1
  0x29fc654: b.ne     #0x29fc680
  0x29fc658: mov      x0, x19
  0x29fc65c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x29fc660: ldr      x20, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x29fc664: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x29fc668: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x29fc66c: add      x0, sp, #0x20
  0x29fc670: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc674: cbz      x20, #0x29fc614
  0x29fc678: mov      x0, x20
  0x29fc67c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29fc680: mov      x20, xzr
  0x29fc684: b        #0x29fc68c
  0x29fc688: mov      x19, x0
  0x29fc68c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x29fc690: add      x0, sp, #0x20
  0x29fc694: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc698: cbnz     x20, #0x29fc6a4
  0x29fc69c: mov      x0, x19
  0x29fc6a0: bl       #0x22b072c ; -> ??? 0x22b072c
  0x29fc6a4: mov      x0, x20
  0x29fc6a8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29fc6ac: bl       #0x1f86e18 ; -> ??? 0x1f86e18
