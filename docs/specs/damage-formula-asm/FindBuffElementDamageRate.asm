; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== FindBuffElementDamageRate @ 0x28287f8..0x2828988 (taille 400 octets) =====
  0x28287f8: sub      sp, sp, #0x50
  0x28287fc: str      x30, [sp, #0x20]
  0x2828800: stp      x22, x21, [sp, #0x30]
  0x2828804: stp      x20, x19, [sp, #0x40]
  0x2828808: adrp     x20, #0x59d7000
  0x282880c: ldrb     w8, [x20, #0xac4]
  0x2828810: mov      x19, x0
  0x2828814: tbnz     w8, #0, #0x2828850
  0x2828818: adrp     x0, #0x558a000
  0x282881c: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828820: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2828824: adrp     x0, #0x558a000
  0x2828828: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x282882c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2828830: adrp     x0, #0x558a000
  0x2828834: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x2828838: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282883c: adrp     x0, #0x558a000
  0x2828840: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2828844: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2828848: mov      w8, #1
  0x282884c: strb     w8, [x20, #0xac4]
  0x2828850: stp      xzr, xzr, [sp, #8]
  0x2828854: str      xzr, [sp, #0x18]
  0x2828858: ldr      x0, [x19, #0x380]
  0x282885c: cbz      x0, #0x282890c
  0x2828860: adrp     x8, #0x558a000
  0x2828864: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2828868: adrp     x22, #0x558a000
  0x282886c: adrp     x21, #0x558a000
  0x2828870: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2828874: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2828878: ldr      x21, [x21, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282887c: add      x8, sp, #8
  0x2828880: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2828884: mov      w19, wzr
  0x2828888: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x282888c: add      x0, sp, #8
  0x2828890: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2828894: tbz      w0, #0, #0x28288e0
  0x2828898: ldr      x20, [sp, #0x18]
  0x282889c: cbz      x20, #0x2828904
  0x28288a0: mov      x0, x20
  0x28288a4: mov      x1, xzr
  0x28288a8: bl       #0x2320198 ; -> CBuff$$get_Type
  0x28288ac: cmp      w0, #0x64
  0x28288b0: b.ne     #0x2828888
  0x28288b4: mov      w2, #0x17
  0x28288b8: mov      x0, x20
  0x28288bc: mov      x1, xzr
  0x28288c0: mov      x3, xzr
  0x28288c4: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28288c8: tbz      w0, #0, #0x2828888
  0x28288cc: mov      x0, x20
  0x28288d0: mov      x1, xzr
  0x28288d4: bl       #0x232036c ; -> CBuff$$get_Value
  0x28288d8: add      w19, w0, w19
  0x28288dc: b        #0x2828888
  0x28288e0: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x28288e4: add      x0, sp, #8
  0x28288e8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28288ec: mov      w0, w19
  0x28288f0: ldp      x20, x19, [sp, #0x40]
  0x28288f4: ldp      x22, x21, [sp, #0x30]
  0x28288f8: ldr      x30, [sp, #0x20]
  0x28288fc: add      sp, sp, #0x50
  0x2828900: ret      
  0x2828904: mov      x22, x21
  0x2828908: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282890c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828910: b        #0x2828920
  0x2828914: b        #0x2828920
  0x2828918: b        #0x2828924
  0x282891c: b        #0x2828920
  0x2828920: mov      x22, x21
  0x2828924: mov      x20, x0
  0x2828928: cmp      w1, #1
  0x282892c: b.ne     #0x2828958
  0x2828930: mov      x0, x20
  0x2828934: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2828938: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x282893c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2828940: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2828944: add      x0, sp, #8
  0x2828948: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282894c: cbz      x21, #0x28288ec
  0x2828950: mov      x0, x21
  0x2828954: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828958: mov      x21, xzr
  0x282895c: b        #0x2828964
  0x2828960: mov      x20, x0
  0x2828964: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2828968: add      x0, sp, #8
  0x282896c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828970: cbnz     x21, #0x282897c
  0x2828974: mov      x0, x20
  0x2828978: bl       #0x22b072c ; -> ??? 0x22b072c
  0x282897c: mov      x0, x21
  0x2828980: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828984: bl       #0x1f86e18 ; -> ??? 0x1f86e18
