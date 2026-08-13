; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== GetBuffDamgeFinalReduce @ 0x2828164..0x282866c (taille 1288 octets) =====
  0x2828164: sub      sp, sp, #0xd0
  0x2828168: stp      x29, x30, [sp, #0x70]
  0x282816c: stp      x28, x27, [sp, #0x80]
  0x2828170: stp      x26, x25, [sp, #0x90]
  0x2828174: stp      x24, x23, [sp, #0xa0]
  0x2828178: stp      x22, x21, [sp, #0xb0]
  0x282817c: stp      x20, x19, [sp, #0xc0]
  0x2828180: adrp     x22, #0x59d7000
  0x2828184: ldrb     w8, [x22, #0xac1]
  0x2828188: mov      x19, x2
  0x282818c: mov      x20, x1
  0x2828190: mov      x21, x0
  0x2828194: tbnz     w8, #0, #0x282820c
  0x2828198: adrp     x0, #0x558a000
  0x282819c: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x28281a0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281a4: adrp     x0, #0x558a000
  0x28281a8: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x28281ac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281b0: adrp     x0, #0x558a000
  0x28281b4: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x28281b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281bc: adrp     x0, #0x558a000
  0x28281c0: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x28281c4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281c8: adrp     x0, #0x558a000
  0x28281cc: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x28281d0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281d4: adrp     x0, #0x558a000
  0x28281d8: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x28281dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281e0: adrp     x0, #0x558a000
  0x28281e4: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x28281e8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281ec: adrp     x0, #0x558a000
  0x28281f0: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x28281f4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x28281f8: adrp     x0, #0x5587000
  0x28281fc: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2828200: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2828204: mov      w8, #1
  0x2828208: strb     w8, [x22, #0xac1]
  0x282820c: stp      xzr, xzr, [sp, #0x50]
  0x2828210: str      xzr, [sp, #0x60]
  0x2828214: stp      xzr, xzr, [sp, #0x30]
  0x2828218: str      xzr, [sp, #0x40]
  0x282821c: str      wzr, [x20]
  0x2828220: ldr      x0, [x21, #0x380]
  0x2828224: cbz      x0, #0x2828580
  0x2828228: adrp     x8, #0x558a000
  0x282822c: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2828230: adrp     x25, #0x558a000
  0x2828234: adrp     x26, #0x5587000
  0x2828238: adrp     x27, #0x558a000
  0x282823c: ldr      x25, [x25, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2828240: ldr      x26, [x26, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2828244: ldr      x27, [x27, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x2828248: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282824c: adrp     x28, #0x558a000
  0x2828250: adrp     x24, #0x558a000
  0x2828254: adrp     x23, #0x558a000
  0x2828258: ldr      x28, [x28, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x282825c: ldr      x24, [x24, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x2828260: ldr      x23, [x23, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2828264: add      x8, sp, #0x18
  0x2828268: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282826c: ldur     q0, [sp, #0x18]
  0x2828270: ldr      x8, [sp, #0x28]
  0x2828274: str      q0, [sp, #0x50]
  0x2828278: str      x8, [sp, #0x60]
  0x282827c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x2828280: add      x0, sp, #0x50
  0x2828284: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2828288: tbz      w0, #0, #0x2828510
  0x282828c: ldr      x21, [sp, #0x60]
  0x2828290: cbz      x21, #0x282827c
  0x2828294: ldr      x0, [x26] ; = 0x0 (u64 @ 0x5587000)
  0x2828298: ldr      x22, [x21, #0x20]
  0x282829c: ldr      w8, [x0, #0xe0]
  0x28282a0: cbnz     w8, #0x28282a8
  0x28282a4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x28282a8: mov      x0, x22
  0x28282ac: mov      x1, xzr
  0x28282b0: mov      x2, xzr
  0x28282b4: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x28282b8: tbnz     w0, #0, #0x282827c
  0x28282bc: mov      x0, x21
  0x28282c0: mov      x1, xzr
  0x28282c4: bl       #0x2320198 ; -> CBuff$$get_Type
  0x28282c8: cmp      w0, #0x77
  0x28282cc: b.ne     #0x282831c
  0x28282d0: mov      w2, #0x17
  0x28282d4: mov      x0, x21
  0x28282d8: mov      x1, x19
  0x28282dc: mov      x3, xzr
  0x28282e0: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x28282e4: tbz      w0, #0, #0x282831c
  0x28282e8: ldr      w22, [x20]
  0x28282ec: mov      x0, x21
  0x28282f0: mov      x1, xzr
  0x28282f4: bl       #0x232036c ; -> CBuff$$get_Value
  0x28282f8: cmp      w22, w0
  0x28282fc: b.ge     #0x282831c
  0x2828300: mov      x0, x21
  0x2828304: mov      x1, xzr
  0x2828308: bl       #0x232036c ; -> CBuff$$get_Value
  0x282830c: str      w0, [x20]
  0x2828310: mov      x0, x21
  0x2828314: mov      x1, xzr
  0x2828318: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282831c: mov      x0, x21
  0x2828320: mov      x1, xzr
  0x2828324: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2828328: cmp      w0, #0x78
  0x282832c: b.ne     #0x2828418
  0x2828330: mov      w2, #0x17
  0x2828334: mov      x0, x21
  0x2828338: mov      x1, x19
  0x282833c: mov      x3, xzr
  0x2828340: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2828344: tbz      w0, #0, #0x2828418
  0x2828348: ldr      x0, [x21, #0x20]
  0x282834c: cbz      x0, #0x2828570
  0x2828350: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2828354: cbz      x0, #0x282827c
  0x2828358: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5587010)
  0x282835c: cbz      x0, #0x2828574
  0x2828360: ldr      x1, [x27] ; = 0x0 (u64 @ 0x558a000)
  0x2828364: add      x8, sp, #0x18
  0x2828368: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282836c: ldur     q0, [sp, #0x18]
  0x2828370: ldr      x8, [sp, #0x28]
  0x2828374: mov      w29, wzr
  0x2828378: str      q0, [sp, #0x30]
  0x282837c: str      x8, [sp, #0x40]
  0x2828380: ldr      x1, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x2828384: add      x0, sp, #0x30
  0x2828388: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282838c: tbz      w0, #0, #0x28283d4
  0x2828390: ldr      x0, [x26] ; = 0x0 (u64 @ 0x5587000)
  0x2828394: ldr      x22, [sp, #0x40]
  0x2828398: ldr      w8, [x0, #0xe0]
  0x282839c: cbnz     w8, #0x28283a4
  0x28283a0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x28283a4: mov      x0, x22
  0x28283a8: mov      x1, xzr
  0x28283ac: mov      x2, xzr
  0x28283b0: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x28283b4: tbnz     w0, #0, #0x2828380
  0x28283b8: cbz      x22, #0x28284d8
  0x28283bc: mov      x0, x22
  0x28283c0: mov      x1, xzr
  0x28283c4: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x28283c8: and      w8, w0, #1
  0x28283cc: add      w29, w29, w8
  0x28283d0: b        #0x2828380
  0x28283d4: mov      x22, xzr
  0x28283d8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x28283dc: add      x0, sp, #0x30
  0x28283e0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28283e4: cbnz     x22, #0x2828578
  0x28283e8: mov      x0, x21
  0x28283ec: mov      x1, xzr
  0x28283f0: bl       #0x232036c ; -> CBuff$$get_Value
  0x28283f4: ldr      w9, [x20]
  0x28283f8: sub      w8, w29, #1
  0x28283fc: mul      w8, w0, w8
  0x2828400: cmp      w8, w9
  0x2828404: b.le     #0x2828418
  0x2828408: str      w8, [x20]
  0x282840c: mov      x0, x21
  0x2828410: mov      x1, xzr
  0x2828414: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x2828418: mov      x0, x21
  0x282841c: mov      x1, xzr
  0x2828420: bl       #0x2320198 ; -> CBuff$$get_Type
  0x2828424: cmp      w0, #0x79
  0x2828428: b.ne     #0x282849c
  0x282842c: cbz      x19, #0x2828544
  0x2828430: mov      x0, x19
  0x2828434: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2828438: cbz      x0, #0x282853c
  0x282843c: ldr      w8, [x0, #0x18]
  0x2828440: cbz      w8, #0x282849c
  0x2828444: mov      x0, x19
  0x2828448: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x282844c: cbz      x0, #0x282856c
  0x2828450: ldr      w2, [x0, #0x18]
  0x2828454: mov      x0, x21
  0x2828458: mov      x1, x19
  0x282845c: mov      x3, xzr
  0x2828460: bl       #0x232bb04 ; -> CBuff$$CheckAvailable
  0x2828464: tbz      w0, #0, #0x282849c
  0x2828468: mov      x0, x21
  0x282846c: mov      x1, xzr
  0x2828470: bl       #0x232036c ; -> CBuff$$get_Value
  0x2828474: ldr      w8, [x20]
  0x2828478: cmp      w0, w8
  0x282847c: b.le     #0x282849c
  0x2828480: mov      x0, x21
  0x2828484: mov      x1, xzr
  0x2828488: bl       #0x232036c ; -> CBuff$$get_Value
  0x282848c: str      w0, [x20]
  0x2828490: mov      x0, x21
  0x2828494: mov      x1, xzr
  0x2828498: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282849c: mov      x0, x21
  0x28284a0: mov      x1, xzr
  0x28284a4: bl       #0x2320198 ; -> CBuff$$get_Type
  0x28284a8: cmp      w0, #0x79
  0x28284ac: b.ne     #0x282827c
  0x28284b0: cbz      x19, #0x2828540
  0x28284b4: mov      x0, x19
  0x28284b8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x28284bc: cbz      x0, #0x2828548
  0x28284c0: ldr      w8, [x0, #0x18]
  0x28284c4: cbnz     w8, #0x282827c
  0x28284c8: mov      x0, x21
  0x28284cc: mov      x1, xzr
  0x28284d0: bl       #0x232bba0 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x28284d4: b        #0x282827c
  0x28284d8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x28284dc: b        #0x2828584
  0x28284e0: b        #0x28284f0
  0x28284e4: b        #0x28284f0
  0x28284e8: b        #0x28284f0
  0x28284ec: b        #0x28284f0
  0x28284f0: cmp      w1, #1
  0x28284f4: stp      x1, x0, [sp, #8]
  0x28284f8: b.ne     #0x282854c
  0x28284fc: ldr      x0, [sp, #0x10]
  0x2828500: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2828504: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x2828508: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x282850c: b        #0x28283d8
  0x2828510: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2828514: add      x0, sp, #0x50
  0x2828518: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282851c: ldp      x20, x19, [sp, #0xc0]
  0x2828520: ldp      x22, x21, [sp, #0xb0]
  0x2828524: ldp      x24, x23, [sp, #0xa0]
  0x2828528: ldp      x26, x25, [sp, #0x90]
  0x282852c: ldp      x28, x27, [sp, #0x80]
  0x2828530: ldp      x29, x30, [sp, #0x70]
  0x2828534: add      sp, sp, #0xd0
  0x2828538: ret      
  0x282853c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828540: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828544: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828548: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282854c: mov      x22, xzr
  0x2828550: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2828554: add      x0, sp, #0x30
  0x2828558: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282855c: ldp      x1, x0, [sp, #8]
  0x2828560: cbz      x22, #0x282860c
  0x2828564: mov      x0, x22
  0x2828568: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282856c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828570: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828574: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828578: mov      x0, x22
  0x282857c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828580: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2828584: stp      x1, x0, [sp, #8]
  0x2828588: b        #0x2828550
  0x282858c: b        #0x282860c
  0x2828590: b        #0x282860c
  0x2828594: b        #0x282860c
  0x2828598: b        #0x282860c
  0x282859c: b        #0x282860c
  0x28285a0: b        #0x282860c
  0x28285a4: b        #0x282860c
  0x28285a8: b        #0x282860c
  0x28285ac: b        #0x282860c
  0x28285b0: b        #0x282860c
  0x28285b4: b        #0x282860c
  0x28285b8: b        #0x282860c
  0x28285bc: b        #0x282860c
  0x28285c0: b        #0x282860c
  0x28285c4: b        #0x282860c
  0x28285c8: b        #0x282860c
  0x28285cc: b        #0x282860c
  0x28285d0: b        #0x282860c
  0x28285d4: b        #0x282860c
  0x28285d8: b        #0x282860c
  0x28285dc: b        #0x282860c
  0x28285e0: b        #0x282860c
  0x28285e4: b        #0x282860c
  0x28285e8: b        #0x282860c
  0x28285ec: b        #0x282860c
  0x28285f0: b        #0x282860c
  0x28285f4: b        #0x282860c
  0x28285f8: b        #0x282860c
  0x28285fc: b        #0x282860c
  0x2828600: b        #0x282860c
  0x2828604: b        #0x282860c
  0x2828608: b        #0x282860c
  0x282860c: cmp      w1, #1
  0x2828610: b.ne     #0x2828638
  0x2828614: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2828618: ldr      x19, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x282861c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2828620: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2828624: add      x0, sp, #0x50
  0x2828628: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282862c: cbz      x19, #0x282851c
  0x2828630: mov      x0, x19
  0x2828634: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828638: mov      x20, x0
  0x282863c: mov      x19, xzr
  0x2828640: b        #0x2828648
  0x2828644: mov      x20, x0
  0x2828648: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x282864c: add      x0, sp, #0x50
  0x2828650: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2828654: cbnz     x19, #0x2828660
  0x2828658: mov      x0, x20
  0x282865c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2828660: mov      x0, x19
  0x2828664: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2828668: bl       #0x1f86e18 ; -> ??? 0x1f86e18
