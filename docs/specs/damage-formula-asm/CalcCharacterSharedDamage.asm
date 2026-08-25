; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcCharacterSharedDamage @ 0x2cc2130..0x2cc2624 (taille 1268 octets) =====
  0x2cc2130: stp      x30, x27, [sp, #-0x50]!
  0x2cc2134: stp      x26, x25, [sp, #0x10]
  0x2cc2138: stp      x24, x23, [sp, #0x20]
  0x2cc213c: stp      x22, x21, [sp, #0x30]
  0x2cc2140: stp      x20, x19, [sp, #0x40]
  0x2cc2144: adrp     x20, #0x59e9000
  0x2cc2148: ldrb     w8, [x20, #0xd6b]
  0x2cc214c: mov      w22, w1
  0x2cc2150: mov      x19, x0
  0x2cc2154: tbnz     w8, #0, #0x2cc21b4
  0x2cc2158: adrp     x0, #0x5599000
  0x2cc215c: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc2160: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2164: adrp     x0, #0x5599000
  0x2cc2168: ldr      x0, [x0, #0xaa0] ; = 0x0 (u64 @ 0x5599aa0)
  0x2cc216c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2170: adrp     x0, #0x5596000
  0x2cc2174: ldr      x0, [x0, #0x700] ; = 0x0 (u64 @ 0x5596700)
  0x2cc2178: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc217c: adrp     x0, #0x55d9000
  0x2cc2180: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x55d9ec0)
  0x2cc2184: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2188: adrp     x0, #0x55d9000
  0x2cc218c: ldr      x0, [x0, #0xec8] ; = 0x0 (u64 @ 0x55d9ec8)
  0x2cc2190: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc2194: adrp     x0, #0x5596000
  0x2cc2198: ldr      x0, [x0, #0x7f8] ; = 0x0 (u64 @ 0x55967f8)
  0x2cc219c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc21a0: adrp     x0, #0x5596000
  0x2cc21a4: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc21a8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc21ac: mov      w8, #1
  0x2cc21b0: strb     w8, [x20, #0xd6b]
  0x2cc21b4: cbz      x19, #0x2cc253c
  0x2cc21b8: mov      x0, x19
  0x2cc21bc: mov      x1, xzr
  0x2cc21c0: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x2cc21c4: cbz      x0, #0x2cc253c
  0x2cc21c8: adrp     x20, #0x5599000
  0x2cc21cc: adrp     x25, #0x5599000
  0x2cc21d0: ldr      x20, [x20, #0xaa0] ; = 0x0 (u64 @ 0x5599aa0)
  0x2cc21d4: ldr      x25, [x25, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc21d8: mov      x1, x19
  0x2cc21dc: mov      x2, xzr
  0x2cc21e0: bl       #0x2599f58 ; -> CTeam$$GetCharactersMultiSharedDamage
  0x2cc21e4: ldr      x1, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2cc21e8: mov      x20, x0
  0x2cc21ec: bl       #0x34661a0 ; -> System.Linq.Enumerable$$Count<object>
  0x2cc21f0: cmp      w0, #1
  0x2cc21f4: b.lt     #0x2cc2244
  0x2cc21f8: cbz      x20, #0x2cc253c
  0x2cc21fc: adrp     x10, #0x55d9000
  0x2cc2200: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5599000)
  0x2cc2204: ldr      x10, [x10, #0xec0] ; = 0x0 (u64 @ 0x55d9ec0)
  0x2cc2208: ldrh     w9, [x8, #0x12e]
  0x2cc220c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc2210: cbz      x9, #0x2cc2234
  0x2cc2214: ldr      x10, [x8, #0xb0]
  0x2cc2218: add      x10, x10, #8
  0x2cc221c: ldur     x11, [x10, #-8]
  0x2cc2220: cmp      x11, x1
  0x2cc2224: b.eq     #0x2cc224c
  0x2cc2228: subs     x9, x9, #1
  0x2cc222c: add      x10, x10, #0x10
  0x2cc2230: b.ne     #0x2cc221c
  0x2cc2234: mov      x0, x20
  0x2cc2238: mov      w2, wzr
  0x2cc223c: bl       #0x2215130 ; -> ??? 0x2215130
  0x2cc2240: b        #0x2cc2258
  0x2cc2244: mov      w20, w22
  0x2cc2248: b        #0x2cc2440
  0x2cc224c: ldrsw    x9, [x10]
  0x2cc2250: add      x8, x8, x9, lsl #4
  0x2cc2254: add      x0, x8, #0x138
  0x2cc2258: ldp      x8, x1, [x0]
  0x2cc225c: adrp     x26, #0x5596000
  0x2cc2260: adrp     x27, #0x55d9000
  0x2cc2264: ldr      x26, [x26, #0x7f8] ; = 0x0 (u64 @ 0x55967f8)
  0x2cc2268: ldr      x27, [x27, #0xec8] ; = 0x0 (u64 @ 0x55d9ec8)
  0x2cc226c: mov      x0, x20
  0x2cc2270: blr      x8
  0x2cc2274: mov      x21, x0
  0x2cc2278: mov      w20, w22
  0x2cc227c: cbz      x21, #0x2cc2530
  0x2cc2280: ldr      x8, [x21]
  0x2cc2284: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5596000)
  0x2cc2288: ldrh     w9, [x8, #0x12e]
  0x2cc228c: cbz      x9, #0x2cc22b0
  0x2cc2290: ldr      x10, [x8, #0xb0]
  0x2cc2294: add      x10, x10, #8
  0x2cc2298: ldur     x11, [x10, #-8]
  0x2cc229c: cmp      x11, x1
  0x2cc22a0: b.eq     #0x2cc22c0
  0x2cc22a4: subs     x9, x9, #1
  0x2cc22a8: add      x10, x10, #0x10
  0x2cc22ac: b.ne     #0x2cc2298
  0x2cc22b0: mov      x0, x21
  0x2cc22b4: mov      w2, wzr
  0x2cc22b8: bl       #0x2215130 ; -> ??? 0x2215130
  0x2cc22bc: b        #0x2cc22cc
  0x2cc22c0: ldrsw    x9, [x10]
  0x2cc22c4: add      x8, x8, x9, lsl #4
  0x2cc22c8: add      x0, x8, #0x138
  0x2cc22cc: ldp      x8, x1, [x0]
  0x2cc22d0: mov      x0, x21
  0x2cc22d4: blr      x8
  0x2cc22d8: tbz      w0, #0, #0x2cc23c4
  0x2cc22dc: ldr      x8, [x21]
  0x2cc22e0: ldr      x1, [x27] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc22e4: ldrh     w9, [x8, #0x12e]
  0x2cc22e8: cbz      x9, #0x2cc230c
  0x2cc22ec: ldr      x10, [x8, #0xb0]
  0x2cc22f0: add      x10, x10, #8
  0x2cc22f4: ldur     x11, [x10, #-8]
  0x2cc22f8: cmp      x11, x1
  0x2cc22fc: b.eq     #0x2cc231c
  0x2cc2300: subs     x9, x9, #1
  0x2cc2304: add      x10, x10, #0x10
  0x2cc2308: b.ne     #0x2cc22f4
  0x2cc230c: mov      x0, x21
  0x2cc2310: mov      w2, wzr
  0x2cc2314: bl       #0x2215130 ; -> ??? 0x2215130
  0x2cc2318: b        #0x2cc2328
  0x2cc231c: ldrsw    x9, [x10]
  0x2cc2320: add      x8, x8, x9, lsl #4
  0x2cc2324: add      x0, x8, #0x138
  0x2cc2328: ldp      x8, x1, [x0]
  0x2cc232c: mov      x0, x21
  0x2cc2330: blr      x8
  0x2cc2334: mov      x23, x0
  0x2cc2338: cbz      x0, #0x2cc2534
  0x2cc233c: mov      w1, #0x8e
  0x2cc2340: mov      x0, x23
  0x2cc2344: mov      x2, xzr
  0x2cc2348: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2cc234c: mov      x24, x0
  0x2cc2350: cbz      x0, #0x2cc2538
  0x2cc2354: mov      x0, x24
  0x2cc2358: mov      x1, xzr
  0x2cc235c: bl       #0x2325450 ; -> CBuff$$get_ApplyingType
  0x2cc2360: cmp      w0, #2
  0x2cc2364: b.ne     #0x2cc227c
  0x2cc2368: mov      x0, x24
  0x2cc236c: mov      x1, xzr
  0x2cc2370: bl       #0x232548c ; -> CBuff$$get_Value
  0x2cc2374: mov      w24, w0
  0x2cc2378: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2cc237c: ldr      w8, [x0, #0xe0]
  0x2cc2380: cbnz     w8, #0x2cc2388
  0x2cc2384: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc2388: mov      w0, w22
  0x2cc238c: mov      w1, w24
  0x2cc2390: mov      x2, xzr
  0x2cc2394: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2cc2398: mov      w24, w0
  0x2cc239c: mov      x0, x23
  0x2cc23a0: mov      x1, xzr
  0x2cc23a4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc23a8: cbz      x0, #0x2cc2548
  0x2cc23ac: ldr      w8, [x0, #0xa8]
  0x2cc23b0: sub      w9, w20, w24
  0x2cc23b4: bic      w20, w9, w9, asr #31
  0x2cc23b8: add      w8, w8, w24
  0x2cc23bc: str      w8, [x0, #0xa8]
  0x2cc23c0: b        #0x2cc227c
  0x2cc23c4: mov      x22, xzr
  0x2cc23c8: mov      w23, #5
  0x2cc23cc: cbz      x21, #0x2cc2430
  0x2cc23d0: adrp     x10, #0x5596000
  0x2cc23d4: ldr      x8, [x21]
  0x2cc23d8: ldr      x10, [x10, #0x700] ; = 0x0 (u64 @ 0x5596700)
  0x2cc23dc: ldrh     w9, [x8, #0x12e]
  0x2cc23e0: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5596000)
  0x2cc23e4: cbz      x9, #0x2cc2408
  0x2cc23e8: ldr      x10, [x8, #0xb0]
  0x2cc23ec: add      x10, x10, #8
  0x2cc23f0: ldur     x11, [x10, #-8]
  0x2cc23f4: cmp      x11, x1
  0x2cc23f8: b.eq     #0x2cc2418
  0x2cc23fc: subs     x9, x9, #1
  0x2cc2400: add      x10, x10, #0x10
  0x2cc2404: b.ne     #0x2cc23f0
  0x2cc2408: mov      x0, x21
  0x2cc240c: mov      w2, wzr
  0x2cc2410: bl       #0x2215130 ; -> ??? 0x2215130
  0x2cc2414: b        #0x2cc2424
  0x2cc2418: ldrsw    x9, [x10]
  0x2cc241c: add      x8, x8, x9, lsl #4
  0x2cc2420: add      x0, x8, #0x138
  0x2cc2424: ldp      x8, x1, [x0]
  0x2cc2428: mov      x0, x21
  0x2cc242c: blr      x8
  0x2cc2430: cbnz     x22, #0x2cc2540
  0x2cc2434: cmp      w23, #5
  0x2cc2438: b.eq     #0x2cc2440
  0x2cc243c: cbnz     w23, #0x2cc2514
  0x2cc2440: mov      x0, x19
  0x2cc2444: mov      x1, xzr
  0x2cc2448: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x2cc244c: cbz      x0, #0x2cc253c
  0x2cc2450: adrp     x22, #0x5596000
  0x2cc2454: ldr      x22, [x22, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2cc2458: mov      x1, xzr
  0x2cc245c: bl       #0x2599d78 ; -> CTeam$$GetCharacterSharedDamage
  0x2cc2460: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5596000)
  0x2cc2464: mov      x21, x0
  0x2cc2468: ldr      w9, [x8, #0xe0]
  0x2cc246c: cbnz     w9, #0x2cc2478
  0x2cc2470: mov      x0, x8
  0x2cc2474: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc2478: mov      x0, x21
  0x2cc247c: mov      x1, xzr
  0x2cc2480: bl       #0x50491e8 ; -> UnityEngine.Object$$op_Implicit
  0x2cc2484: tbz      w0, #0, #0x2cc2514
  0x2cc2488: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5596000)
  0x2cc248c: ldr      w8, [x0, #0xe0]
  0x2cc2490: cbnz     w8, #0x2cc2498
  0x2cc2494: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc2498: mov      x0, x21
  0x2cc249c: mov      x1, x19
  0x2cc24a0: mov      x2, xzr
  0x2cc24a4: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2cc24a8: tbz      w0, #0, #0x2cc2514
  0x2cc24ac: cbz      x21, #0x2cc253c
  0x2cc24b0: mov      x0, x21
  0x2cc24b4: mov      x1, xzr
  0x2cc24b8: bl       #0x282fee0 ; -> CCharacterBattle$$FindBuffShareDamage
  0x2cc24bc: cbz      x0, #0x2cc2514
  0x2cc24c0: mov      x1, xzr
  0x2cc24c4: bl       #0x232548c ; -> CBuff$$get_Value
  0x2cc24c8: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5599000)
  0x2cc24cc: mov      w19, w0
  0x2cc24d0: ldr      w9, [x8, #0xe0]
  0x2cc24d4: cbnz     w9, #0x2cc24e0
  0x2cc24d8: mov      x0, x8
  0x2cc24dc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc24e0: mov      w0, w20
  0x2cc24e4: mov      w1, w19
  0x2cc24e8: mov      x2, xzr
  0x2cc24ec: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2cc24f0: mov      w19, w0
  0x2cc24f4: mov      x0, x21
  0x2cc24f8: mov      x1, xzr
  0x2cc24fc: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc2500: cbz      x0, #0x2cc253c
  0x2cc2504: ldr      w8, [x0, #0xa4]
  0x2cc2508: sub      w20, w20, w19
  0x2cc250c: add      w8, w8, w19
  0x2cc2510: str      w8, [x0, #0xa4]
  0x2cc2514: mov      w0, w20
  0x2cc2518: ldp      x20, x19, [sp, #0x40]
  0x2cc251c: ldp      x22, x21, [sp, #0x30]
  0x2cc2520: ldp      x24, x23, [sp, #0x20]
  0x2cc2524: ldp      x26, x25, [sp, #0x10]
  0x2cc2528: ldp      x30, x27, [sp], #0x50
  0x2cc252c: ret      
  0x2cc2530: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc2534: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc2538: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc253c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc2540: mov      x0, x22
  0x2cc2544: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2cc2548: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc254c: b        #0x2cc2578
  0x2cc2550: b        #0x2cc2578
  0x2cc2554: b        #0x2cc2578
  0x2cc2558: b        #0x2cc2578
  0x2cc255c: b        #0x2cc2578
  0x2cc2560: b        #0x2cc2578
  0x2cc2564: b        #0x2cc2578
  0x2cc2568: b        #0x2cc2578
  0x2cc256c: mov      w20, w22
  0x2cc2570: b        #0x2cc2578
  0x2cc2574: b        #0x2cc2578
  0x2cc2578: cmp      w1, #1
  0x2cc257c: b.ne     #0x2cc2598
  0x2cc2580: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2cc2584: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x2cc2588: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2cc258c: mov      w23, wzr
  0x2cc2590: cbnz     x21, #0x2cc23d0
  0x2cc2594: b        #0x2cc2430
  0x2cc2598: mov      x19, x0
  0x2cc259c: mov      x22, xzr
  0x2cc25a0: b        #0x2cc25a8
  0x2cc25a4: mov      x19, x0
  0x2cc25a8: cbz      x21, #0x2cc260c
  0x2cc25ac: adrp     x10, #0x5596000
  0x2cc25b0: ldr      x8, [x21]
  0x2cc25b4: ldr      x10, [x10, #0x700] ; = 0x0 (u64 @ 0x5596700)
  0x2cc25b8: ldrh     w9, [x8, #0x12e]
  0x2cc25bc: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5596000)
  0x2cc25c0: cbz      x9, #0x2cc25e4
  0x2cc25c4: ldr      x10, [x8, #0xb0]
  0x2cc25c8: add      x10, x10, #8
  0x2cc25cc: ldur     x11, [x10, #-8]
  0x2cc25d0: cmp      x11, x1
  0x2cc25d4: b.eq     #0x2cc25f4
  0x2cc25d8: subs     x9, x9, #1
  0x2cc25dc: add      x10, x10, #0x10
  0x2cc25e0: b.ne     #0x2cc25cc
  0x2cc25e4: mov      x0, x21
  0x2cc25e8: mov      w2, wzr
  0x2cc25ec: bl       #0x2215130 ; -> ??? 0x2215130
  0x2cc25f0: b        #0x2cc2600
  0x2cc25f4: ldrsw    x9, [x10]
  0x2cc25f8: add      x8, x8, x9, lsl #4
  0x2cc25fc: add      x0, x8, #0x138
  0x2cc2600: ldp      x8, x1, [x0]
  0x2cc2604: mov      x0, x21
  0x2cc2608: blr      x8
  0x2cc260c: cbnz     x22, #0x2cc2618
  0x2cc2610: mov      x0, x19
  0x2cc2614: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2cc2618: mov      x0, x22
  0x2cc261c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2cc2620: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
