; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBuff_Run @ 0x23281dc..0x232856c (taille 912 octets) =====
  0x23281dc: sub      sp, sp, #0x90
  0x23281e0: stp      x30, x23, [sp, #0x60]
  0x23281e4: stp      x22, x21, [sp, #0x70]
  0x23281e8: stp      x20, x19, [sp, #0x80]
  0x23281ec: adrp     x20, #0x59d4000
  0x23281f0: ldrb     w8, [x20, #0xff4]
  0x23281f4: mov      x19, x0
  0x23281f8: tbnz     w8, #0, #0x2328258
  0x23281fc: adrp     x0, #0x558a000
  0x2328200: ldr      x0, [x0, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x2328204: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328208: adrp     x0, #0x558a000
  0x232820c: ldr      x0, [x0, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x2328210: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328214: adrp     x0, #0x558a000
  0x2328218: ldr      x0, [x0, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x232821c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328220: adrp     x0, #0x558a000
  0x2328224: ldr      x0, [x0, #0xe90] ; = 0x0 (u64 @ 0x558ae90)
  0x2328228: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232822c: adrp     x0, #0x558a000
  0x2328230: ldr      x0, [x0, #0xe98] ; = 0x0 (u64 @ 0x558ae98)
  0x2328234: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328238: adrp     x0, #0x558a000
  0x232823c: ldr      x0, [x0, #0xea0] ; = 0x0 (u64 @ 0x558aea0)
  0x2328240: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328244: adrp     x0, #0x558a000
  0x2328248: ldr      x0, [x0, #0xea8] ; = 0x0 (u64 @ 0x558aea8)
  0x232824c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328250: mov      w8, #1
  0x2328254: strb     w8, [x20, #0xff4]
  0x2328258: stp      xzr, xzr, [sp, #0x40]
  0x232825c: str      xzr, [sp, #0x50]
  0x2328260: ldr      x8, [x19, #0x10]
  0x2328264: cbz      x8, #0x23284e0
  0x2328268: ldr      w9, [x8, #0x5c]
  0x232826c: cmp      w9, #0x1c
  0x2328270: b.ne     #0x232827c
  0x2328274: mov      w9, wzr
  0x2328278: b        #0x2328288
  0x232827c: ldr      x9, [x19, #0x20]
  0x2328280: cbz      x9, #0x23284e0
  0x2328284: ldrb     w9, [x9, #0x370]
  0x2328288: cmp      w9, #0
  0x232828c: cset     w9, ne
  0x2328290: strb     w9, [x19, #0x3d]
  0x2328294: ldp      w8, w9, [x8, #0x88]
  0x2328298: mov      x0, x19
  0x232829c: cmp      w9, #6
  0x23282a0: csinv    w8, w8, wzr, ne
  0x23282a4: str      w8, [x19, #0x2c]
  0x23282a8: bl       #0x232856c ; -> CBuff$$OnCreate
  0x23282ac: tbz      w0, #0, #0x23284c0
  0x23282b0: adrp     x8, #0x558a000
  0x23282b4: ldr      x8, [x8, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x23282b8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23282bc: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x23282c0: cbz      x0, #0x23284e0
  0x23282c4: ldr      x2, [x19, #0x20]
  0x23282c8: mov      x1, x19
  0x23282cc: mov      x3, xzr
  0x23282d0: bl       #0x2317c08 ; -> CBattleManager$$BattleMissionCheck
  0x23282d4: mov      x0, x19
  0x23282d8: bl       #0x232b7d8 ; -> CBuff$$PlayCreateEffect
  0x23282dc: ldr      x8, [x19, #0x10]
  0x23282e0: cbz      x8, #0x23284e0
  0x23282e4: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x23282e8: cbz      x0, #0x23284e0
  0x23282ec: adrp     x8, #0x558a000
  0x23282f0: ldr      x8, [x8, #0xea8] ; = 0x0 (u64 @ 0x558aea8)
  0x23282f4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23282f8: add      x8, sp, #0x28
  0x23282fc: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2328300: ldur     q0, [sp, #0x28]
  0x2328304: ldr      x8, [sp, #0x38]
  0x2328308: adrp     x21, #0x558a000
  0x232830c: adrp     x22, #0x558a000
  0x2328310: ldr      x21, [x21, #0xe90] ; = 0x0 (u64 @ 0x558ae90)
  0x2328314: ldr      x22, [x22, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x2328318: str      q0, [sp, #0x40]
  0x232831c: str      x8, [sp, #0x50]
  0x2328320: adrp     x23, #0x558a000
  0x2328324: ldr      x23, [x23, #0xea0] ; = 0x0 (u64 @ 0x558aea0)
  0x2328328: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x232832c: add      x0, sp, #0x40
  0x2328330: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2328334: tbz      w0, #0, #0x23283d0
  0x2328338: ldr      x20, [sp, #0x50]
  0x232833c: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328340: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2328344: cbz      x0, #0x23284d8
  0x2328348: ldr      x2, [x19, #0x20]
  0x232834c: mov      x1, x20
  0x2328350: mov      x3, xzr
  0x2328354: mov      x4, xzr
  0x2328358: mov      x5, xzr
  0x232835c: mov      x6, xzr
  0x2328360: mov      x7, xzr
  0x2328364: str      xzr, [sp]
  0x2328368: bl       #0x2be1fc4 ; -> CEffectManager$$Play
  0x232836c: mov      x1, x0
  0x2328370: ldr      x0, [x19, #0x40]
  0x2328374: cbz      x0, #0x23284dc
  0x2328378: ldr      w10, [x0, #0x1c]
  0x232837c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x2328380: ldr      x9, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2328384: add      w10, w10, #1
  0x2328388: str      w10, [x0, #0x1c]
  0x232838c: cbz      x8, #0x23284d4
  0x2328390: ldrsw    x10, [x0, #0x18]
  0x2328394: ldr      w11, [x8, #0x18]
  0x2328398: cmp      w10, w11
  0x232839c: b.hs     #0x23283bc
  0x23283a0: add      w9, w10, #1
  0x23283a4: add      x8, x8, x10, lsl #3
  0x23283a8: str      w9, [x0, #0x18]
  0x23283ac: str      x1, [x8, #0x20]!
  0x23283b0: mov      x0, x8
  0x23283b4: bl       #0x21af920 ; -> ??? 0x21af920
  0x23283b8: b        #0x2328328
  0x23283bc: ldr      x8, [x9, #0x20]
  0x23283c0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558a0c0)
  0x23283c4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558a070)
  0x23283c8: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x23283cc: b        #0x2328328
  0x23283d0: adrp     x8, #0x558a000
  0x23283d4: ldr      x8, [x8, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x23283d8: add      x0, sp, #0x40
  0x23283dc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23283e0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23283e4: ldr      x0, [x19, #0x10]
  0x23283e8: cbz      x0, #0x23284e0
  0x23283ec: ldr      w1, [x0, #0xc8]
  0x23283f0: cbz      w1, #0x2328430
  0x23283f4: ldr      x8, [x19, #0x20]
  0x23283f8: cbz      x8, #0x23284e0
  0x23283fc: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2328400: stp      xzr, xzr, [sp, #0x28]
  0x2328404: str      wzr, [sp, #0x38]
  0x2328408: cbz      x0, #0x23284e0
  0x232840c: ldur     q0, [sp, #0x28]
  0x2328410: ldr      w8, [sp, #0x38]
  0x2328414: add      x2, sp, #0x10
  0x2328418: mov      x3, xzr
  0x232841c: str      q0, [sp, #0x10]
  0x2328420: str      w8, [sp, #0x20]
  0x2328424: bl       #0x2572330 ; -> CCharacterRender$$ChangeMaterials
  0x2328428: ldr      x0, [x19, #0x10]
  0x232842c: cbz      x0, #0x23284e0
  0x2328430: mov      x1, xzr
  0x2328434: bl       #0x25ed8a8 ; -> CBuffTemplet$$get_IsDebuff
  0x2328438: tbz      w0, #0, #0x23284c0
  0x232843c: ldr      x0, [x19, #0x10]
  0x2328440: cbz      x0, #0x23284e0
  0x2328444: mov      w1, #1
  0x2328448: mov      x2, xzr
  0x232844c: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2328450: tbnz     w0, #0, #0x23284c0
  0x2328454: ldr      x0, [x19, #0x10]
  0x2328458: cbz      x0, #0x23284e0
  0x232845c: mov      w1, #3
  0x2328460: mov      x2, xzr
  0x2328464: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2328468: tbnz     w0, #0, #0x23284c0
  0x232846c: ldr      x8, [x19, #0x20]
  0x2328470: cbz      x8, #0x23284e0
  0x2328474: ldr      x0, [x19, #0x18]
  0x2328478: cbz      x0, #0x23284e0
  0x232847c: ldr      w8, [x8, #0x21c]
  0x2328480: ldr      w9, [x0, #0x21c]
  0x2328484: cmp      w8, w9
  0x2328488: b.eq     #0x23284c0
  0x232848c: mov      x1, xzr
  0x2328490: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2328494: cbz      x0, #0x23284e0
  0x2328498: mov      w8, #1
  0x232849c: strb     w8, [x0, #0x58]
  0x23284a0: ldr      x0, [x19, #0x20]
  0x23284a4: cbz      x0, #0x23284e0
  0x23284a8: mov      x1, xzr
  0x23284ac: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x23284b0: cbz      x0, #0x23284e0
  0x23284b4: ldr      x1, [x19, #0x18]
  0x23284b8: str      x1, [x0, #0x60]!
  0x23284bc: bl       #0x21af920 ; -> ??? 0x21af920
  0x23284c0: ldp      x20, x19, [sp, #0x80]
  0x23284c4: ldp      x22, x21, [sp, #0x70]
  0x23284c8: ldp      x30, x23, [sp, #0x60]
  0x23284cc: add      sp, sp, #0x90
  0x23284d0: ret      
  0x23284d4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23284d8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23284dc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23284e0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23284e4: b        #0x23284f8
  0x23284e8: b        #0x23284f8
  0x23284ec: b        #0x23284f8
  0x23284f0: b        #0x23284f8
  0x23284f4: b        #0x23284f8
  0x23284f8: mov      x20, x0
  0x23284fc: cmp      w1, #1
  0x2328500: b.ne     #0x2328534
  0x2328504: mov      x0, x20
  0x2328508: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232850c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x2328510: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2328514: adrp     x8, #0x558a000
  0x2328518: ldr      x8, [x8, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x232851c: add      x0, sp, #0x40
  0x2328520: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328524: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2328528: cbz      x21, #0x23283e4
  0x232852c: mov      x0, x21
  0x2328530: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2328534: mov      x21, xzr
  0x2328538: b        #0x2328540
  0x232853c: mov      x20, x0
  0x2328540: adrp     x8, #0x558a000
  0x2328544: ldr      x8, [x8, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x2328548: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232854c: add      x0, sp, #0x40
  0x2328550: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2328554: cbnz     x21, #0x2328560
  0x2328558: mov      x0, x20
  0x232855c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2328560: mov      x0, x21
  0x2328564: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2328568: bl       #0x1f86e18 ; -> ??? 0x1f86e18
