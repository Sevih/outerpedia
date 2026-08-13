; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CheckDamageRate @ 0x2cb226c..0x2cb2984 (taille 1816 octets) =====
  0x2cb226c: sub      sp, sp, #0x50
  0x2cb2270: stp      x30, x25, [sp, #0x10]
  0x2cb2274: stp      x24, x23, [sp, #0x20]
  0x2cb2278: stp      x22, x21, [sp, #0x30]
  0x2cb227c: stp      x20, x19, [sp, #0x40]
  0x2cb2280: adrp     x21, #0x59da000
  0x2cb2284: ldrb     w8, [x21, #0x112]
  0x2cb2288: mov      x19, x1
  0x2cb228c: mov      x20, x0
  0x2cb2290: tbnz     w8, #0, #0x2cb22c0
  0x2cb2294: adrp     x0, #0x5589000
  0x2cb2298: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2cb229c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb22a0: adrp     x0, #0x5587000
  0x2cb22a4: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb22a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb22ac: adrp     x0, #0x55cb000
  0x2cb22b0: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x55cb088)
  0x2cb22b4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb22b8: mov      w8, #1
  0x2cb22bc: strb     w8, [x21, #0x112]
  0x2cb22c0: adrp     x23, #0x59d4000
  0x2cb22c4: adrp     x25, #0x5587000
  0x2cb22c8: ldrb     w8, [x23, #0xfc3]
  0x2cb22cc: ldr      x25, [x25, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb22d0: str      xzr, [sp, #8]
  0x2cb22d4: cbnz     w8, #0x2cb22ec
  0x2cb22d8: adrp     x0, #0x558a000
  0x2cb22dc: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb22e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb22e4: mov      w8, #1
  0x2cb22e8: strb     w8, [x23, #0xfc3]
  0x2cb22ec: adrp     x24, #0x558a000
  0x2cb22f0: ldr      x24, [x24, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb22f4: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2cb22f8: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb22fc: ldr      w9, [x0, #0xe0]
  0x2cb2300: ldr      x8, [x8, #0xb8]
  0x2cb2304: ldr      x21, [x8]
  0x2cb2308: cbnz     w9, #0x2cb2310
  0x2cb230c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2310: mov      x0, x21
  0x2cb2314: mov      x1, xzr
  0x2cb2318: mov      x2, xzr
  0x2cb231c: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb2320: tbz      w0, #0, #0x2cb23fc
  0x2cb2324: ldrb     w8, [x23, #0xfc3]
  0x2cb2328: cbnz     w8, #0x2cb2340
  0x2cb232c: adrp     x0, #0x558a000
  0x2cb2330: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb2334: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2338: mov      w8, #1
  0x2cb233c: strb     w8, [x23, #0xfc3]
  0x2cb2340: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb2344: ldr      x8, [x8, #0xb8]
  0x2cb2348: ldr      x0, [x8]
  0x2cb234c: cbz      x0, #0x2cb2980
  0x2cb2350: mov      x1, xzr
  0x2cb2354: bl       #0x25958b8 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cb2358: tbz      w0, #0, #0x2cb23fc
  0x2cb235c: ldrb     w8, [x23, #0xfc3]
  0x2cb2360: cbnz     w8, #0x2cb2378
  0x2cb2364: adrp     x0, #0x558a000
  0x2cb2368: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb236c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2370: mov      w8, #1
  0x2cb2374: strb     w8, [x23, #0xfc3]
  0x2cb2378: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb237c: ldr      x8, [x8, #0xb8]
  0x2cb2380: ldr      x8, [x8]
  0x2cb2384: cbz      x8, #0x2cb2980
  0x2cb2388: ldrb     w8, [x8, #0x35]
  0x2cb238c: cbz      w8, #0x2cb23fc
  0x2cb2390: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2394: ldr      w8, [x0, #0xe0]
  0x2cb2398: cbnz     w8, #0x2cb23a0
  0x2cb239c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb23a0: mov      x0, x20
  0x2cb23a4: mov      x1, xzr
  0x2cb23a8: mov      x2, xzr
  0x2cb23ac: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb23b0: tbz      w0, #0, #0x2cb23fc
  0x2cb23b4: cbz      x20, #0x2cb2980
  0x2cb23b8: mov      x0, x20
  0x2cb23bc: mov      x1, xzr
  0x2cb23c0: bl       #0x280db44 ; -> CCharacterBattle$$get_IsBoss
  0x2cb23c4: tbz      w0, #0, #0x2cb23fc
  0x2cb23c8: cbz      x19, #0x2cb2980
  0x2cb23cc: mov      x0, x19
  0x2cb23d0: mov      x1, xzr
  0x2cb23d4: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb23d8: cbz      x0, #0x2cb2980
  0x2cb23dc: mov      w8, #1
  0x2cb23e0: str      w8, [x0, #0x3c]
  0x2cb23e4: mov      x0, x19
  0x2cb23e8: mov      x1, xzr
  0x2cb23ec: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb23f0: cbz      x0, #0x2cb2980
  0x2cb23f4: mov      w8, #0x3e8
  0x2cb23f8: b        #0x2cb2964
  0x2cb23fc: cbz      x19, #0x2cb2980
  0x2cb2400: mov      w1, #3
  0x2cb2404: mov      x0, x19
  0x2cb2408: mov      x2, xzr
  0x2cb240c: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2cb2410: cbz      x0, #0x2cb2444
  0x2cb2414: mov      x0, x19
  0x2cb2418: mov      x1, xzr
  0x2cb241c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2420: cbz      x0, #0x2cb2980
  0x2cb2424: mov      w8, #4
  0x2cb2428: str      w8, [x0, #0x3c]
  0x2cb242c: mov      x0, x19
  0x2cb2430: mov      x1, xzr
  0x2cb2434: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2438: cbz      x0, #0x2cb2980
  0x2cb243c: mov      w8, wzr
  0x2cb2440: b        #0x2cb2964
  0x2cb2444: cbz      x20, #0x2cb2980
  0x2cb2448: mov      x0, x20
  0x2cb244c: mov      x1, xzr
  0x2cb2450: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2454: cbz      x0, #0x2cb2980
  0x2cb2458: ldrb     w8, [x0, #0x34]
  0x2cb245c: cbz      w8, #0x2cb251c
  0x2cb2460: mov      x0, x19
  0x2cb2464: mov      x1, xzr
  0x2cb2468: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb246c: cbz      x0, #0x2cb2980
  0x2cb2470: ldr      w8, [x0, #0x3c]
  0x2cb2474: cbz      w8, #0x2cb251c
  0x2cb2478: mov      x0, x19
  0x2cb247c: mov      x1, xzr
  0x2cb2480: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2484: cbz      x0, #0x2cb2980
  0x2cb2488: ldr      w21, [x0, #0x3c]
  0x2cb248c: mov      x0, x19
  0x2cb2490: mov      x1, xzr
  0x2cb2494: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2498: cbz      x0, #0x2cb2980
  0x2cb249c: cmp      w21, #3
  0x2cb24a0: b.eq     #0x2cb2844
  0x2cb24a4: ldr      w21, [x0, #0x3c]
  0x2cb24a8: mov      x0, x19
  0x2cb24ac: mov      x1, xzr
  0x2cb24b0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb24b4: cmp      w21, #2
  0x2cb24b8: mov      x21, x0
  0x2cb24bc: b.ne     #0x2cb2850
  0x2cb24c0: ldr      x0, [x20, #0x28]
  0x2cb24c4: cbz      x0, #0x2cb2980
  0x2cb24c8: mov      x1, xzr
  0x2cb24cc: bl       #0x290227c ; -> CCharacterData$$get_CriticalDMGRate
  0x2cb24d0: cbz      x21, #0x2cb2980
  0x2cb24d4: str      w0, [x21, #0x40]
  0x2cb24d8: ldr      x0, [x19, #0x28]
  0x2cb24dc: cbz      x0, #0x2cb2980
  0x2cb24e0: mov      x1, xzr
  0x2cb24e4: bl       #0x29031f4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cb24e8: cbz      w0, #0x2cb285c
  0x2cb24ec: mov      x0, x19
  0x2cb24f0: mov      x1, xzr
  0x2cb24f4: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb24f8: cbz      x0, #0x2cb2980
  0x2cb24fc: mov      x21, x0
  0x2cb2500: ldr      x0, [x19, #0x28]
  0x2cb2504: cbz      x0, #0x2cb2980
  0x2cb2508: ldr      w22, [x21, #0x40]
  0x2cb250c: mov      x1, xzr
  0x2cb2510: bl       #0x29031f4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cb2514: sub      w8, w22, w0
  0x2cb2518: b        #0x2cb2858
  0x2cb251c: ldr      x0, [x19, #0x28]
  0x2cb2520: cbz      x0, #0x2cb2980
  0x2cb2524: mov      x1, xzr
  0x2cb2528: bl       #0x29027a4 ; -> CCharacterData$$get_Avoid
  0x2cb252c: cmp      w0, #1
  0x2cb2530: b.lt     #0x2cb254c
  0x2cb2534: mov      w21, w0
  0x2cb2538: mov      w1, #0x3e8
  0x2cb253c: mov      w0, wzr
  0x2cb2540: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x2cb2544: cmp      w0, w21
  0x2cb2548: b.le     #0x2cb260c
  0x2cb254c: ldr      x0, [x20, #0x28]
  0x2cb2550: cbz      x0, #0x2cb2980
  0x2cb2554: mov      x1, xzr
  0x2cb2558: bl       #0x29021a0 ; -> CCharacterData$$get_CriticalRate
  0x2cb255c: cmp      w0, #1
  0x2cb2560: b.lt     #0x2cb264c
  0x2cb2564: mov      w21, w0
  0x2cb2568: mov      w1, #0x3e8
  0x2cb256c: mov      w0, wzr
  0x2cb2570: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x2cb2574: mov      w22, w0
  0x2cb2578: mov      x0, x19
  0x2cb257c: mov      x1, xzr
  0x2cb2580: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2584: cbz      x0, #0x2cb2980
  0x2cb2588: cmp      w22, w21
  0x2cb258c: b.gt     #0x2cb265c
  0x2cb2590: mov      w8, #2
  0x2cb2594: str      w8, [x0, #0x3c]
  0x2cb2598: mov      x0, x19
  0x2cb259c: mov      x1, xzr
  0x2cb25a0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb25a4: ldr      x8, [x20, #0x28]
  0x2cb25a8: cbz      x8, #0x2cb2980
  0x2cb25ac: mov      x21, x0
  0x2cb25b0: mov      x0, x8
  0x2cb25b4: mov      x1, xzr
  0x2cb25b8: bl       #0x290227c ; -> CCharacterData$$get_CriticalDMGRate
  0x2cb25bc: cbz      x21, #0x2cb2980
  0x2cb25c0: str      w0, [x21, #0x40]
  0x2cb25c4: ldr      x0, [x19, #0x28]
  0x2cb25c8: cbz      x0, #0x2cb2980
  0x2cb25cc: mov      x1, xzr
  0x2cb25d0: bl       #0x29031f4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cb25d4: cbz      w0, #0x2cb267c
  0x2cb25d8: mov      x0, x19
  0x2cb25dc: mov      x1, xzr
  0x2cb25e0: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb25e4: cbz      x0, #0x2cb2980
  0x2cb25e8: mov      x21, x0
  0x2cb25ec: ldr      x0, [x19, #0x28]
  0x2cb25f0: cbz      x0, #0x2cb2980
  0x2cb25f4: ldr      w22, [x21, #0x40]
  0x2cb25f8: mov      x1, xzr
  0x2cb25fc: bl       #0x29031f4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2cb2600: sub      w8, w22, w0
  0x2cb2604: str      w8, [x21, #0x40]
  0x2cb2608: b        #0x2cb267c
  0x2cb260c: adrp     x8, #0x5589000
  0x2cb2610: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2cb2614: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x2cb2618: ldr      w8, [x0, #0xe0]
  0x2cb261c: cbnz     w8, #0x2cb2624
  0x2cb2620: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2624: adrp     x8, #0x55cb000
  0x2cb2628: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x55cb088)
  0x2cb262c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb2630: bl       #0x2ca7164 ; -> CDebug$$Log
  0x2cb2634: mov      x0, x19
  0x2cb2638: mov      x1, xzr
  0x2cb263c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2640: cbz      x0, #0x2cb2980
  0x2cb2644: mov      w8, #3
  0x2cb2648: b        #0x2cb2660
  0x2cb264c: mov      x0, x19
  0x2cb2650: mov      x1, xzr
  0x2cb2654: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2658: cbz      x0, #0x2cb2980
  0x2cb265c: mov      w8, #1
  0x2cb2660: str      w8, [x0, #0x3c]
  0x2cb2664: mov      x0, x19
  0x2cb2668: mov      x1, xzr
  0x2cb266c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2670: cbz      x0, #0x2cb2980
  0x2cb2674: mov      w8, #0x3e8
  0x2cb2678: str      w8, [x0, #0x40]
  0x2cb267c: ldrb     w8, [x23, #0xfc3]
  0x2cb2680: cbnz     w8, #0x2cb2698
  0x2cb2684: adrp     x0, #0x558a000
  0x2cb2688: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb268c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2690: mov      w8, #1
  0x2cb2694: strb     w8, [x23, #0xfc3]
  0x2cb2698: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb269c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2cb26a0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb26a4: ldr      w9, [x0, #0xe0]
  0x2cb26a8: ldr      x21, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb26ac: cbnz     w9, #0x2cb26b4
  0x2cb26b0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb26b4: mov      x0, x21
  0x2cb26b8: mov      x1, xzr
  0x2cb26bc: mov      x2, xzr
  0x2cb26c0: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb26c4: tbz      w0, #0, #0x2cb2764
  0x2cb26c8: ldrb     w8, [x23, #0xfc3]
  0x2cb26cc: cbnz     w8, #0x2cb26e4
  0x2cb26d0: adrp     x0, #0x558a000
  0x2cb26d4: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb26d8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb26dc: mov      w8, #1
  0x2cb26e0: strb     w8, [x23, #0xfc3]
  0x2cb26e4: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb26e8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb26ec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb26f0: cbz      x0, #0x2cb2980
  0x2cb26f4: mov      x1, xzr
  0x2cb26f8: bl       #0x25958b8 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cb26fc: tbz      w0, #0, #0x2cb2764
  0x2cb2700: ldrb     w8, [x23, #0xfc3]
  0x2cb2704: cbnz     w8, #0x2cb271c
  0x2cb2708: adrp     x0, #0x558a000
  0x2cb270c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb2710: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2714: mov      w8, #1
  0x2cb2718: strb     w8, [x23, #0xfc3]
  0x2cb271c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb2720: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb2724: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb2728: cbz      x8, #0x2cb2980
  0x2cb272c: ldrb     w8, [x8, #0x34]
  0x2cb2730: cbz      w8, #0x2cb2764
  0x2cb2734: mov      x0, x19
  0x2cb2738: mov      x1, xzr
  0x2cb273c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2740: cbz      x0, #0x2cb2980
  0x2cb2744: mov      w8, #1
  0x2cb2748: str      w8, [x0, #0x3c]
  0x2cb274c: mov      x0, x19
  0x2cb2750: mov      x1, xzr
  0x2cb2754: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2758: cbz      x0, #0x2cb2980
  0x2cb275c: mov      w8, #0x3e8
  0x2cb2760: str      w8, [x0, #0x40]
  0x2cb2764: ldrb     w8, [x23, #0xfc3]
  0x2cb2768: cbnz     w8, #0x2cb2780
  0x2cb276c: adrp     x0, #0x558a000
  0x2cb2770: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb2774: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb2778: mov      w8, #1
  0x2cb277c: strb     w8, [x23, #0xfc3]
  0x2cb2780: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb2784: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5587000)
  0x2cb2788: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb278c: ldr      w9, [x0, #0xe0]
  0x2cb2790: ldr      x21, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb2794: cbnz     w9, #0x2cb279c
  0x2cb2798: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb279c: mov      x0, x21
  0x2cb27a0: mov      x1, xzr
  0x2cb27a4: mov      x2, xzr
  0x2cb27a8: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb27ac: tbz      w0, #0, #0x2cb285c
  0x2cb27b0: ldrb     w8, [x23, #0xfc3]
  0x2cb27b4: cbnz     w8, #0x2cb27cc
  0x2cb27b8: adrp     x0, #0x558a000
  0x2cb27bc: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb27c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb27c4: mov      w8, #1
  0x2cb27c8: strb     w8, [x23, #0xfc3]
  0x2cb27cc: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb27d0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb27d4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb27d8: cbz      x0, #0x2cb2980
  0x2cb27dc: mov      x1, xzr
  0x2cb27e0: bl       #0x259594c ; -> CDungeonScene$$get_IsIrregularInfiltrate
  0x2cb27e4: tbz      w0, #0, #0x2cb285c
  0x2cb27e8: ldrb     w8, [x23, #0xfc3]
  0x2cb27ec: cbnz     w8, #0x2cb2804
  0x2cb27f0: adrp     x0, #0x558a000
  0x2cb27f4: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb27f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb27fc: mov      w8, #1
  0x2cb2800: strb     w8, [x23, #0xfc3]
  0x2cb2804: ldr      x8, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2cb2808: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55cb0b8)
  0x2cb280c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb2810: cbz      x8, #0x2cb2980
  0x2cb2814: ldrb     w8, [x8, #0x38]
  0x2cb2818: cbz      w8, #0x2cb285c
  0x2cb281c: mov      x0, x19
  0x2cb2820: mov      x1, xzr
  0x2cb2824: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2828: cbz      x0, #0x2cb2980
  0x2cb282c: mov      w8, #1
  0x2cb2830: str      w8, [x0, #0x3c]
  0x2cb2834: mov      x0, x19
  0x2cb2838: mov      x1, xzr
  0x2cb283c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2840: cbz      x0, #0x2cb2980
  0x2cb2844: mov      w8, #0x3e8
  0x2cb2848: str      w8, [x0, #0x40]
  0x2cb284c: b        #0x2cb285c
  0x2cb2850: cbz      x21, #0x2cb2980
  0x2cb2854: mov      w8, #0x3e8
  0x2cb2858: str      w8, [x21, #0x40]
  0x2cb285c: add      x1, sp, #0xc
  0x2cb2860: mov      x0, x20
  0x2cb2864: mov      x2, x19
  0x2cb2868: mov      x3, xzr
  0x2cb286c: bl       #0x28268c0 ; -> CCharacterBattle$$FindBuffAdditionalDamage
  0x2cb2870: ldr      w8, [sp, #0xc]
  0x2cb2874: cbz      w8, #0x2cb2898
  0x2cb2878: mov      x0, x19
  0x2cb287c: mov      x1, xzr
  0x2cb2880: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2884: cbz      x0, #0x2cb2980
  0x2cb2888: ldr      w8, [x0, #0x40]
  0x2cb288c: ldr      w9, [sp, #0xc]
  0x2cb2890: add      w8, w9, w8
  0x2cb2894: str      w8, [x0, #0x40]
  0x2cb2898: add      x1, sp, #8
  0x2cb289c: mov      x0, x19
  0x2cb28a0: mov      x2, x20
  0x2cb28a4: mov      x3, xzr
  0x2cb28a8: bl       #0x2827ae4 ; -> CCharacterBattle$$FindBuffDamageReduce
  0x2cb28ac: ldr      w8, [sp, #8]
  0x2cb28b0: cbz      w8, #0x2cb28d4
  0x2cb28b4: mov      x0, x19
  0x2cb28b8: mov      x1, xzr
  0x2cb28bc: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb28c0: cbz      x0, #0x2cb2980
  0x2cb28c4: ldr      w8, [x0, #0x40]
  0x2cb28c8: ldr      w9, [sp, #8]
  0x2cb28cc: sub      w8, w8, w9
  0x2cb28d0: str      w8, [x0, #0x40]
  0x2cb28d4: mov      x0, x19
  0x2cb28d8: mov      x1, xzr
  0x2cb28dc: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb28e0: cbz      x0, #0x2cb2980
  0x2cb28e4: mov      x21, x0
  0x2cb28e8: ldr      x0, [x20, #0x28]
  0x2cb28ec: cbz      x0, #0x2cb2980
  0x2cb28f0: ldr      w20, [x21, #0x40]
  0x2cb28f4: mov      x1, xzr
  0x2cb28f8: bl       #0x2903118 ; -> CCharacterData$$get_DMGBoost
  0x2cb28fc: add      w8, w0, w20
  0x2cb2900: mov      x0, x19
  0x2cb2904: mov      x1, xzr
  0x2cb2908: str      w8, [x21, #0x40]
  0x2cb290c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2910: cbz      x0, #0x2cb2980
  0x2cb2914: mov      x20, x0
  0x2cb2918: ldr      x0, [x19, #0x28]
  0x2cb291c: cbz      x0, #0x2cb2980
  0x2cb2920: ldr      w21, [x20, #0x40]
  0x2cb2924: mov      x1, xzr
  0x2cb2928: bl       #0x29020c4 ; -> CCharacterData$$get_DMGReduceRate
  0x2cb292c: sub      w8, w21, w0
  0x2cb2930: mov      x0, x19
  0x2cb2934: mov      x1, xzr
  0x2cb2938: str      w8, [x20, #0x40]
  0x2cb293c: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb2940: cbz      x0, #0x2cb2980
  0x2cb2944: ldr      w8, [x0, #0x40]
  0x2cb2948: cmp      w8, #0x12b
  0x2cb294c: b.gt     #0x2cb2968
  0x2cb2950: mov      x0, x19
  0x2cb2954: mov      x1, xzr
  0x2cb2958: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb295c: cbz      x0, #0x2cb2980
  0x2cb2960: mov      w8, #0x12c
  0x2cb2964: str      w8, [x0, #0x40]
  0x2cb2968: ldp      x20, x19, [sp, #0x40]
  0x2cb296c: ldp      x22, x21, [sp, #0x30]
  0x2cb2970: ldp      x24, x23, [sp, #0x20]
  0x2cb2974: ldp      x30, x25, [sp, #0x10]
  0x2cb2978: add      sp, sp, #0x50
  0x2cb297c: ret      
  0x2cb2980: bl       #0x21afc18 ; -> ??? 0x21afc18
