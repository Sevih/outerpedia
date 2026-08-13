; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_SetAwakeningNodeStatValue @ 0x29fc228..0x29fc46c (taille 580 octets) =====
  0x29fc228: sub      sp, sp, #0x90
  0x29fc22c: stp      x30, x27, [sp, #0x40]
  0x29fc230: stp      x26, x25, [sp, #0x50]
  0x29fc234: stp      x24, x23, [sp, #0x60]
  0x29fc238: stp      x22, x21, [sp, #0x70]
  0x29fc23c: stp      x20, x19, [sp, #0x80]
  0x29fc240: adrp     x21, #0x59d8000
  0x29fc244: adrp     x23, #0x558a000
  0x29fc248: ldrb     w8, [x21, #0x9b1]
  0x29fc24c: ldr      x23, [x23, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc250: mov      x20, x1
  0x29fc254: mov      x19, x0
  0x29fc258: tbnz     w8, #0, #0x29fc2a0
  0x29fc25c: adrp     x0, #0x55bb000
  0x29fc260: ldr      x0, [x0, #0x998] ; = 0x0 (u64 @ 0x55bb998)
  0x29fc264: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc268: adrp     x0, #0x55bb000
  0x29fc26c: ldr      x0, [x0, #0x9a0] ; = 0x0 (u64 @ 0x55bb9a0)
  0x29fc270: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc274: adrp     x0, #0x55bb000
  0x29fc278: ldr      x0, [x0, #0x9a8] ; = 0x0 (u64 @ 0x55bb9a8)
  0x29fc27c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc280: adrp     x0, #0x55bb000
  0x29fc284: ldr      x0, [x0, #0x9b0] ; = 0x0 (u64 @ 0x55bb9b0)
  0x29fc288: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc28c: adrp     x0, #0x558a000
  0x29fc290: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x29fc294: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29fc298: mov      w8, #1
  0x29fc29c: strb     w8, [x21, #0x9b1]
  0x29fc2a0: mov      x0, x19
  0x29fc2a4: mov      w1, wzr
  0x29fc2a8: stp      xzr, xzr, [sp, #0x20]
  0x29fc2ac: str      xzr, [sp, #0x30]
  0x29fc2b0: bl       #0x29f99a8 ; -> CStatValue$$set_m_nAwakeningValue
  0x29fc2b4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc2b8: ldr      w8, [x0, #0xe0]
  0x29fc2bc: cbnz     w8, #0x29fc2c4
  0x29fc2c0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc2c4: mov      w0, wzr
  0x29fc2c8: mov      x1, xzr
  0x29fc2cc: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fc2d0: stur     x0, [x19, #0x8c]
  0x29fc2d4: str      w1, [x19, #0x94]
  0x29fc2d8: cbz      x20, #0x29fc3d0
  0x29fc2dc: adrp     x8, #0x55bb000
  0x29fc2e0: ldr      x8, [x8, #0x9b0] ; = 0x0 (u64 @ 0x55bb9b0)
  0x29fc2e4: adrp     x24, #0x55bb000
  0x29fc2e8: adrp     x22, #0x55bb000
  0x29fc2ec: mov      x0, x20
  0x29fc2f0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55bb000)
  0x29fc2f4: ldr      x24, [x24, #0x9a0] ; = 0x0 (u64 @ 0x55bb9a0)
  0x29fc2f8: ldr      x22, [x22, #0x998] ; = 0x0 (u64 @ 0x55bb998)
  0x29fc2fc: add      x8, sp, #8
  0x29fc300: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x29fc304: ldur     q0, [sp, #8]
  0x29fc308: ldr      x8, [sp, #0x18]
  0x29fc30c: mov      w25, #1
  0x29fc310: str      q0, [sp, #0x20]
  0x29fc314: str      x8, [sp, #0x30]
  0x29fc318: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55bb000)
  0x29fc31c: add      x0, sp, #0x20
  0x29fc320: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x29fc324: tbz      w0, #0, #0x29fc3c4
  0x29fc328: ldr      x26, [sp, #0x30]
  0x29fc32c: cbz      x26, #0x29fc3ec
  0x29fc330: ldr      w8, [x19, #0x10]
  0x29fc334: ldr      w9, [x26, #0x38]
  0x29fc338: cmp      w8, w9
  0x29fc33c: b.ne     #0x29fc318
  0x29fc340: ldr      w8, [x26, #0x3c]
  0x29fc344: cmp      w8, #1
  0x29fc348: b.eq     #0x29fc3a4
  0x29fc34c: cmp      w8, #2
  0x29fc350: b.ne     #0x29fc318
  0x29fc354: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x29fc358: ldur     x21, [x19, #0x8c]
  0x29fc35c: ldr      w27, [x19, #0x94]
  0x29fc360: ldr      w8, [x0, #0xe0]
  0x29fc364: cbnz     w8, #0x29fc36c
  0x29fc368: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x29fc36c: and      x8, x20, #0xffffffff00000000
  0x29fc370: orr      x20, x8, x27
  0x29fc374: mov      x0, x21
  0x29fc378: mov      x1, x20
  0x29fc37c: mov      x2, xzr
  0x29fc380: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x29fc384: ldr      w8, [x26, #0x40]
  0x29fc388: add      w0, w8, w0
  0x29fc38c: mov      x1, xzr
  0x29fc390: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x29fc394: stur     x0, [x19, #0x8c]
  0x29fc398: str      w1, [x19, #0x94]
  0x29fc39c: strb     w25, [x19, #0xe0]
  0x29fc3a0: b        #0x29fc318
  0x29fc3a4: strb     w25, [x19, #0xe0]
  0x29fc3a8: mov      x0, x19
  0x29fc3ac: bl       #0x29f9a18 ; -> CStatValue$$get_m_nAwakeningValue
  0x29fc3b0: ldr      w8, [x26, #0x40]
  0x29fc3b4: add      w1, w8, w0
  0x29fc3b8: mov      x0, x19
  0x29fc3bc: bl       #0x29f99a8 ; -> CStatValue$$set_m_nAwakeningValue
  0x29fc3c0: b        #0x29fc318
  0x29fc3c4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55bb000)
  0x29fc3c8: add      x0, sp, #0x20
  0x29fc3cc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc3d0: ldp      x20, x19, [sp, #0x80]
  0x29fc3d4: ldp      x22, x21, [sp, #0x70]
  0x29fc3d8: ldp      x24, x23, [sp, #0x60]
  0x29fc3dc: ldp      x26, x25, [sp, #0x50]
  0x29fc3e0: ldp      x30, x27, [sp, #0x40]
  0x29fc3e4: add      sp, sp, #0x90
  0x29fc3e8: ret      
  0x29fc3ec: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x29fc3f0: b        #0x29fc408
  0x29fc3f4: b        #0x29fc408
  0x29fc3f8: b        #0x29fc408
  0x29fc3fc: b        #0x29fc408
  0x29fc400: b        #0x29fc408
  0x29fc404: b        #0x29fc408
  0x29fc408: mov      x19, x0
  0x29fc40c: cmp      w1, #1
  0x29fc410: b.ne     #0x29fc43c
  0x29fc414: mov      x0, x19
  0x29fc418: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x29fc41c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x29fc420: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x29fc424: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55bb000)
  0x29fc428: add      x0, sp, #0x20
  0x29fc42c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc430: cbz      x20, #0x29fc3d0
  0x29fc434: mov      x0, x20
  0x29fc438: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29fc43c: mov      x20, xzr
  0x29fc440: b        #0x29fc448
  0x29fc444: mov      x19, x0
  0x29fc448: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55bb000)
  0x29fc44c: add      x0, sp, #0x20
  0x29fc450: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29fc454: cbnz     x20, #0x29fc460
  0x29fc458: mov      x0, x19
  0x29fc45c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x29fc460: mov      x0, x20
  0x29fc464: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29fc468: bl       #0x1f86e18 ; -> ??? 0x1f86e18
