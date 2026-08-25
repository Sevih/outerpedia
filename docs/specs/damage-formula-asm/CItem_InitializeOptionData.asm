; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItem_InitializeOptionData @ 0x2346338..0x2346e18 (taille 2784 octets) =====
  0x2346338: sub      sp, sp, #0xe0
  0x234633c: str      d10, [sp, #0x60]
  0x2346340: stp      d9, d8, [sp, #0x70]
  0x2346344: stp      x29, x30, [sp, #0x80]
  0x2346348: stp      x28, x27, [sp, #0x90]
  0x234634c: stp      x26, x25, [sp, #0xa0]
  0x2346350: stp      x24, x23, [sp, #0xb0]
  0x2346354: stp      x22, x21, [sp, #0xc0]
  0x2346358: stp      x20, x19, [sp, #0xd0]
  0x234635c: adrp     x20, #0x59e4000
  0x2346360: ldrb     w8, [x20, #0xcc9]
  0x2346364: mov      w26, w3
  0x2346368: mov      x21, x2
  0x234636c: mov      x22, x1
  0x2346370: mov      x19, x0
  0x2346374: tbnz     w8, #0, #0x23464c4
  0x2346378: adrp     x0, #0x5598000
  0x234637c: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2346380: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346384: adrp     x0, #0x559a000
  0x2346388: ldr      x0, [x0, #0x4d0] ; = 0x0 (u64 @ 0x559a4d0)
  0x234638c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346390: adrp     x0, #0x559a000
  0x2346394: ldr      x0, [x0, #0x4d8] ; = 0x0 (u64 @ 0x559a4d8)
  0x2346398: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x234639c: adrp     x0, #0x559a000
  0x23463a0: ldr      x0, [x0, #0x468] ; = 0x0 (u64 @ 0x559a468)
  0x23463a4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463a8: adrp     x0, #0x5598000
  0x23463ac: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x23463b0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463b4: adrp     x0, #0x559a000
  0x23463b8: ldr      x0, [x0, #0x4e0] ; = 0x0 (u64 @ 0x559a4e0)
  0x23463bc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463c0: adrp     x0, #0x5598000
  0x23463c4: ldr      x0, [x0, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x23463c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463cc: adrp     x0, #0x559a000
  0x23463d0: ldr      x0, [x0, #0x4e8] ; = 0x0 (u64 @ 0x559a4e8)
  0x23463d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463d8: adrp     x0, #0x5598000
  0x23463dc: ldr      x0, [x0, #0xcb0] ; = 0x0 (u64 @ 0x5598cb0)
  0x23463e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463e4: adrp     x0, #0x559a000
  0x23463e8: ldr      x0, [x0, #0x4f0] ; = 0x0 (u64 @ 0x559a4f0)
  0x23463ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463f0: adrp     x0, #0x5598000
  0x23463f4: ldr      x0, [x0, #0xcb8] ; = 0x0 (u64 @ 0x5598cb8)
  0x23463f8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23463fc: adrp     x0, #0x559a000
  0x2346400: ldr      x0, [x0, #0x4f8] ; = 0x0 (u64 @ 0x559a4f8)
  0x2346404: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346408: adrp     x0, #0x5596000
  0x234640c: ldr      x0, [x0, #0x558] ; = 0x0 (u64 @ 0x5596558)
  0x2346410: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346414: adrp     x0, #0x5598000
  0x2346418: ldr      x0, [x0, #0xcd8] ; = 0x0 (u64 @ 0x5598cd8)
  0x234641c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346420: adrp     x0, #0x559a000
  0x2346424: ldr      x0, [x0, #0x500] ; = 0x0 (u64 @ 0x559a500)
  0x2346428: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x234642c: adrp     x0, #0x559a000
  0x2346430: ldr      x0, [x0, #0x508] ; = 0x0 (u64 @ 0x559a508)
  0x2346434: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346438: adrp     x0, #0x559a000
  0x234643c: ldr      x0, [x0, #0x510] ; = 0x0 (u64 @ 0x559a510)
  0x2346440: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346444: adrp     x0, #0x559a000
  0x2346448: ldr      x0, [x0, #0x518] ; = 0x0 (u64 @ 0x559a518)
  0x234644c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346450: adrp     x0, #0x5598000
  0x2346454: ldr      x0, [x0, #0xa58] ; = 0x0 (u64 @ 0x5598a58)
  0x2346458: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x234645c: adrp     x0, #0x559a000
  0x2346460: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x559a520)
  0x2346464: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346468: adrp     x0, #0x5598000
  0x234646c: ldr      x0, [x0, #0xce0] ; = 0x0 (u64 @ 0x5598ce0)
  0x2346470: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346474: adrp     x0, #0x559a000
  0x2346478: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x559a528)
  0x234647c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346480: adrp     x0, #0x559a000
  0x2346484: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x559a530)
  0x2346488: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x234648c: adrp     x0, #0x559a000
  0x2346490: ldr      x0, [x0, #0x538] ; = 0x0 (u64 @ 0x559a538)
  0x2346494: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346498: adrp     x0, #0x559a000
  0x234649c: ldr      x0, [x0, #0x540] ; = 0x0 (u64 @ 0x559a540)
  0x23464a0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23464a4: adrp     x0, #0x559a000
  0x23464a8: ldr      x0, [x0, #0x548] ; = 0x0 (u64 @ 0x559a548)
  0x23464ac: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23464b0: adrp     x0, #0x559a000
  0x23464b4: ldr      x0, [x0, #0x550] ; = 0x0 (u64 @ 0x559a550)
  0x23464b8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23464bc: mov      w8, #1
  0x23464c0: strb     w8, [x20, #0xcc9]
  0x23464c4: stp      xzr, xzr, [sp, #0x40]
  0x23464c8: str      xzr, [sp, #0x50]
  0x23464cc: stp      xzr, xzr, [sp, #0x20]
  0x23464d0: str      xzr, [sp, #0x30]
  0x23464d4: ldr      x8, [x19, #0x10]
  0x23464d8: cbz      x8, #0x2346c44
  0x23464dc: ldp      w2, w9, [x8, #0x18]
  0x23464e0: add      w9, w9, #1
  0x23464e4: cmp      w2, #1
  0x23464e8: stp      wzr, w9, [x8, #0x18]
  0x23464ec: b.lt     #0x2346500
  0x23464f0: ldr      x0, [x8, #0x10]
  0x23464f4: mov      w1, wzr
  0x23464f8: mov      x3, xzr
  0x23464fc: bl       #0x4935ab8 ; -> System.Array$$Clear
  0x2346500: ldr      x8, [x19, #0x18]
  0x2346504: cbz      x8, #0x2346c44
  0x2346508: ldp      w2, w9, [x8, #0x18]
  0x234650c: add      w9, w9, #1
  0x2346510: cmp      w2, #1
  0x2346514: stp      wzr, w9, [x8, #0x18]
  0x2346518: b.lt     #0x234652c
  0x234651c: ldr      x0, [x8, #0x10]
  0x2346520: mov      w1, wzr
  0x2346524: mov      x3, xzr
  0x2346528: bl       #0x4935ab8 ; -> System.Array$$Clear
  0x234652c: ldr      x8, [x19, #0x38]
  0x2346530: cbz      x8, #0x2346c44
  0x2346534: ldr      w9, [x8, #0x1c]
  0x2346538: add      w9, w9, #1
  0x234653c: stp      wzr, w9, [x8, #0x18]
  0x2346540: ldr      x8, [x19, #0x28]
  0x2346544: cbz      x8, #0x2346c44
  0x2346548: ldp      w2, w9, [x8, #0x18]
  0x234654c: add      w9, w9, #1
  0x2346550: cmp      w2, #1
  0x2346554: stp      wzr, w9, [x8, #0x18]
  0x2346558: b.lt     #0x234656c
  0x234655c: ldr      x0, [x8, #0x10]
  0x2346560: mov      w1, wzr
  0x2346564: mov      x3, xzr
  0x2346568: bl       #0x4935ab8 ; -> System.Array$$Clear
  0x234656c: ldr      x8, [x19, #0x70]
  0x2346570: cbz      x8, #0x2346c44
  0x2346574: ldr      w8, [x8, #0x34]
  0x2346578: adrp     x29, #0x559a000
  0x234657c: adrp     x24, #0x5598000
  0x2346580: ldr      x29, [x29, #0x468] ; = 0x0 (u64 @ 0x559a468)
  0x2346584: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346588: cmp      w8, #8
  0x234658c: b.ne     #0x2346618
  0x2346590: ldrb     w8, [x19, #0x58]
  0x2346594: cbz      w8, #0x2346618
  0x2346598: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x234659c: ldr      w8, [x0, #0xe0]
  0x23465a0: cbnz     w8, #0x23465a8
  0x23465a4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x23465a8: mov      x0, xzr
  0x23465ac: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23465b0: ldr      x8, [x19, #0x70]
  0x23465b4: cbz      x8, #0x2346c44
  0x23465b8: cbz      x0, #0x2346c44
  0x23465bc: ldr      w1, [x8, #0x10]
  0x23465c0: mov      x2, xzr
  0x23465c4: bl       #0x262e380 ; -> CTempletManager$$GetItemOptionTempletFromGroup
  0x23465c8: adrp     x8, #0x559a000
  0x23465cc: ldr      x8, [x8, #0x4e0] ; = 0x0 (u64 @ 0x559a4e0)
  0x23465d0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x23465d4: bl       #0x346e838 ; -> System.Linq.Enumerable$$FirstOrDefault<object>
  0x23465d8: cbz      x0, #0x2346c44
  0x23465dc: ldr      w23, [x0, #0x10]
  0x23465e0: ldr      x0, [x29] ; = 0x0 (u64 @ 0x559a000)
  0x23465e4: ldrb     w24, [x19, #0x58]
  0x23465e8: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x23465ec: mov      w1, w23
  0x23465f0: mov      w2, wzr
  0x23465f4: mov      w3, w24
  0x23465f8: mov      x25, x0
  0x23465fc: bl       #0x2344830 ; -> CItemSubOptionData$$.ctor
  0x2346600: mov      x0, x19
  0x2346604: str      x25, [x0, #0x20]!
  0x2346608: mov      x1, x25
  0x234660c: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2346610: adrp     x24, #0x5598000
  0x2346614: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346618: str      w26, [sp, #0x6c]
  0x234661c: adrp     x25, #0x5598000
  0x2346620: adrp     x28, #0x5598000
  0x2346624: adrp     x26, #0x559a000
  0x2346628: ldr      x25, [x25, #0xce0] ; = 0x0 (u64 @ 0x5598ce0)
  0x234662c: ldr      x28, [x28, #0xcb0] ; = 0x0 (u64 @ 0x5598cb0)
  0x2346630: ldr      x26, [x26, #0x500] ; = 0x0 (u64 @ 0x559a500)
  0x2346634: cbz      x22, #0x2346750
  0x2346638: ldrb     w1, [x19, #0x58]
  0x234663c: adrp     x20, #0x559a000
  0x2346640: ldr      x20, [x20, #0x4d0] ; = 0x0 (u64 @ 0x559a4d0)
  0x2346644: mov      x0, x19
  0x2346648: bl       #0x2346e18 ; -> CItem$$GetEnchantFactor
  0x234664c: ldrb     w1, [x19, #0x65]
  0x2346650: mov      x0, x19
  0x2346654: mov      v8.16b, v0.16b
  0x2346658: bl       #0x2346f4c ; -> CItem$$GetBreakLimitFactor
  0x234665c: ldrb     w2, [x19, #0x67]
  0x2346660: ldrb     w1, [x19, #0x66]
  0x2346664: mov      x0, x19
  0x2346668: mov      v9.16b, v0.16b
  0x234666c: bl       #0x2347020 ; -> CItem$$GetSingularityFactor
  0x2346670: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x2346674: add      x8, sp, #8
  0x2346678: mov      x0, x22
  0x234667c: mov      v10.16b, v0.16b
  0x2346680: bl       #0x447c8bc ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x2346684: ldur     q0, [sp, #8]
  0x2346688: ldr      x8, [sp, #0x18]
  0x234668c: str      q0, [sp, #0x40]
  0x2346690: str      x8, [sp, #0x50]
  0x2346694: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5598000)
  0x2346698: add      x0, sp, #0x40
  0x234669c: bl       #0x411cce4 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x23466a0: tbz      w0, #0, #0x234673c
  0x23466a4: ldr      w23, [sp, #0x50]
  0x23466a8: cmp      w23, #1
  0x23466ac: b.lt     #0x2346694
  0x23466b0: ldr      x0, [x20] ; = 0x0 (u64 @ 0x559a000)
  0x23466b4: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x23466b8: mov      x22, x0
  0x23466bc: mov      w1, w23
  0x23466c0: mov      v0.16b, v8.16b
  0x23466c4: mov      v1.16b, v9.16b
  0x23466c8: mov      x2, x19
  0x23466cc: mov      v2.16b, v10.16b
  0x23466d0: bl       #0x234458c ; -> CItemMainOption$$.ctor
  0x23466d4: ldr      x0, [x19, #0x10]
  0x23466d8: cbz      x0, #0x2346c28
  0x23466dc: ldr      w10, [x0, #0x1c]
  0x23466e0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x559a010)
  0x23466e4: ldr      x9, [x26] ; = 0x0 (u64 @ 0x559a000)
  0x23466e8: add      w10, w10, #1
  0x23466ec: str      w10, [x0, #0x1c]
  0x23466f0: cbz      x8, #0x2346c2c
  0x23466f4: ldrsw    x10, [x0, #0x18]
  0x23466f8: ldr      w11, [x8, #0x18]
  0x23466fc: cmp      w10, w11
  0x2346700: b.hs     #0x2346724
  0x2346704: add      w9, w10, #1
  0x2346708: add      x8, x8, x10, lsl #3
  0x234670c: str      w9, [x0, #0x18]
  0x2346710: str      x22, [x8, #0x20]!
  0x2346714: mov      x0, x8
  0x2346718: mov      x1, x22
  0x234671c: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2346720: b        #0x2346694
  0x2346724: ldr      x8, [x9, #0x20]
  0x2346728: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x559a0c0)
  0x234672c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x559a070)
  0x2346730: mov      x1, x22
  0x2346734: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2346738: b        #0x2346694
  0x234673c: adrp     x8, #0x5598000
  0x2346740: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346744: add      x0, sp, #0x40
  0x2346748: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x234674c: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346750: cbz      x21, #0x23468b4
  0x2346754: adrp     x8, #0x559a000
  0x2346758: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x559a520)
  0x234675c: adrp     x27, #0x559a000
  0x2346760: adrp     x20, #0x5598000
  0x2346764: mov      x0, x21
  0x2346768: ldr      x1, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x234676c: ldr      x27, [x27, #0x4f0] ; = 0x0 (u64 @ 0x559a4f0)
  0x2346770: ldr      x20, [x20, #0xcd8] ; = 0x0 (u64 @ 0x5598cd8)
  0x2346774: add      x8, sp, #8
  0x2346778: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x234677c: ldur     q0, [sp, #8]
  0x2346780: ldr      x8, [sp, #0x18]
  0x2346784: str      q0, [sp, #0x20]
  0x2346788: str      x8, [sp, #0x30]
  0x234678c: ldr      x1, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2346790: add      x0, sp, #0x20
  0x2346794: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2346798: tbz      w0, #0, #0x2346898
  0x234679c: ldr      x24, [sp, #0x30]
  0x23467a0: cbz      x24, #0x2346c18
  0x23467a4: ldr      x0, [x19, #0x38]
  0x23467a8: cbz      x0, #0x2346c1c
  0x23467ac: ldr      w10, [x0, #0x1c]
  0x23467b0: ldr      w21, [x24, #0x10]
  0x23467b4: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x559a010)
  0x23467b8: ldr      x9, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x23467bc: add      w10, w10, #1
  0x23467c0: str      w10, [x0, #0x1c]
  0x23467c4: cbz      x8, #0x2346c14
  0x23467c8: ldrsw    x10, [x0, #0x18]
  0x23467cc: ldr      w11, [x8, #0x18]
  0x23467d0: cmp      w10, w11
  0x23467d4: b.hs     #0x23467ec
  0x23467d8: add      w9, w10, #1
  0x23467dc: add      x8, x8, x10, lsl #2
  0x23467e0: str      w9, [x0, #0x18]
  0x23467e4: str      w21, [x8, #0x20]
  0x23467e8: b        #0x2346800
  0x23467ec: ldr      x8, [x9, #0x20]
  0x23467f0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x559a0c0)
  0x23467f4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x559a070)
  0x23467f8: mov      w1, w21
  0x23467fc: bl       #0x447bde0 ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x2346800: cmp      w21, #1
  0x2346804: b.lt     #0x234678c
  0x2346808: ldr      w22, [x24, #0x10]
  0x234680c: ldrb     w23, [x24, #0x15]
  0x2346810: ldrb     w24, [x24, #0x14]
  0x2346814: ldr      x0, [x29] ; = 0x0 (u64 @ 0x559a000)
  0x2346818: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x234681c: mov      x21, x0
  0x2346820: mov      w1, w22
  0x2346824: mov      w2, w23
  0x2346828: mov      w3, w24
  0x234682c: bl       #0x2344830 ; -> CItemSubOptionData$$.ctor
  0x2346830: ldr      x0, [x19, #0x18]
  0x2346834: cbz      x0, #0x2346c34
  0x2346838: ldr      w10, [x0, #0x1c]
  0x234683c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x559a010)
  0x2346840: ldr      x9, [x26] ; = 0x0 (u64 @ 0x559a000)
  0x2346844: add      w10, w10, #1
  0x2346848: str      w10, [x0, #0x1c]
  0x234684c: cbz      x8, #0x2346c30
  0x2346850: ldrsw    x10, [x0, #0x18]
  0x2346854: ldr      w11, [x8, #0x18]
  0x2346858: cmp      w10, w11
  0x234685c: b.hs     #0x2346880
  0x2346860: add      w9, w10, #1
  0x2346864: add      x8, x8, x10, lsl #3
  0x2346868: str      w9, [x0, #0x18]
  0x234686c: str      x21, [x8, #0x20]!
  0x2346870: mov      x0, x8
  0x2346874: mov      x1, x21
  0x2346878: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x234687c: b        #0x234678c
  0x2346880: ldr      x8, [x9, #0x20]
  0x2346884: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x559a0c0)
  0x2346888: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x559a070)
  0x234688c: mov      x1, x21
  0x2346890: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2346894: b        #0x234678c
  0x2346898: adrp     x8, #0x559a000
  0x234689c: ldr      x8, [x8, #0x4e8] ; = 0x0 (u64 @ 0x559a4e8)
  0x23468a0: add      x0, sp, #0x20
  0x23468a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x23468a8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23468ac: adrp     x24, #0x5598000
  0x23468b0: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x23468b4: ldr      x8, [x19, #0x70]
  0x23468b8: cbz      x8, #0x2346c44
  0x23468bc: ldr      x0, [x8, #0x70] ; = 0x0 (u64 @ 0x559a070)
  0x23468c0: cbz      x0, #0x2346c44
  0x23468c4: adrp     x26, #0x559a000
  0x23468c8: adrp     x29, #0x559a000
  0x23468cc: adrp     x27, #0x5598000
  0x23468d0: ldr      x26, [x26, #0x548] ; = 0x0 (u64 @ 0x559a548)
  0x23468d4: ldr      x29, [x29, #0x550] ; = 0x0 (u64 @ 0x559a550)
  0x23468d8: ldr      x27, [x27, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x23468dc: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x23468e0: adrp     x25, #0x559a000
  0x23468e4: adrp     x20, #0x559a000
  0x23468e8: ldr      x25, [x25, #0x4d8] ; = 0x0 (u64 @ 0x559a4d8)
  0x23468ec: ldr      x20, [x20, #0x508] ; = 0x0 (u64 @ 0x559a508)
  0x23468f0: add      x8, sp, #8
  0x23468f4: bl       #0x447c8bc ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x23468f8: ldur     q0, [sp, #8]
  0x23468fc: ldr      x8, [sp, #0x18]
  0x2346900: str      q0, [sp, #0x40]
  0x2346904: str      x8, [sp, #0x50]
  0x2346908: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5598000)
  0x234690c: add      x0, sp, #0x40
  0x2346910: bl       #0x411cce4 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x2346914: tbz      w0, #0, #0x2346af8
  0x2346918: ldr      w23, [sp, #0x50]
  0x234691c: cmp      w23, #1
  0x2346920: b.lt     #0x2346908
  0x2346924: ldr      x0, [x26] ; = 0x0 (u64 @ 0x559a000)
  0x2346928: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x234692c: mov      x21, x0
  0x2346930: mov      x1, xzr
  0x2346934: bl       #0x241b408 ; -> CItem.<>c__DisplayClass122_0$$.ctor
  0x2346938: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x234693c: ldr      w8, [x0, #0xe0]
  0x2346940: cbnz     w8, #0x2346948
  0x2346944: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2346948: mov      x0, xzr
  0x234694c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2346950: cbz      x0, #0x2346c20
  0x2346954: mov      w1, w23
  0x2346958: mov      x2, xzr
  0x234695c: bl       #0x2637f74 ; -> CTempletManager$$GetItemSpecialOptionTemplet
  0x2346960: mov      x1, x0
  0x2346964: cbz      x21, #0x2346c24
  0x2346968: mov      x22, x21
  0x234696c: str      x1, [x22, #0x10]!
  0x2346970: mov      x0, x22
  0x2346974: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2346978: ldr      x8, [x22]
  0x234697c: cbz      x8, #0x2346a18
  0x2346980: ldrb     w23, [x19, #0x65]
  0x2346984: mov      x0, x19
  0x2346988: bl       #0x2344728 ; -> CItem$$IsSpecialItemEnchantable
  0x234698c: tbz      w0, #0, #0x2346a64
  0x2346990: ldr      x8, [x22]
  0x2346994: cbz      x8, #0x2346c48
  0x2346998: ldrb     w9, [x19, #0x58]
  0x234699c: ldr      w23, [x8, #0x18]
  0x23469a0: cmp      w9, #0
  0x23469a4: csinc    w9, w9, wzr, ne
  0x23469a8: cmp      w23, w9
  0x23469ac: b.gt     #0x2346908
  0x23469b0: ldrb     w8, [x8, #0x1c]
  0x23469b4: cbnz     w8, #0x2346a68
  0x23469b8: adrp     x8, #0x559a000
  0x23469bc: ldr      x24, [x19, #0x28]
  0x23469c0: ldr      x8, [x8, #0x538] ; = 0x0 (u64 @ 0x559a538)
  0x23469c4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x23469c8: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x23469cc: adrp     x8, #0x559a000
  0x23469d0: ldr      x8, [x8, #0x540] ; = 0x0 (u64 @ 0x559a540)
  0x23469d4: mov      x25, x0
  0x23469d8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x23469dc: mov      x1, x21
  0x23469e0: mov      x3, xzr
  0x23469e4: bl       #0x46b4344 ; -> System.Predicate<object>$$.ctor
  0x23469e8: cbz      x24, #0x2346c4c
  0x23469ec: adrp     x8, #0x559a000
  0x23469f0: ldr      x8, [x8, #0x528] ; = 0x0 (u64 @ 0x559a528)
  0x23469f4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x23469f8: mov      x1, x25
  0x23469fc: adrp     x25, #0x559a000
  0x2346a00: ldr      x25, [x25, #0x4d8] ; = 0x0 (u64 @ 0x559a4d8)
  0x2346a04: mov      x0, x24
  0x2346a08: bl       #0x44caa28 ; -> System.Collections.Generic.List<object>$$RemoveAll
  0x2346a0c: adrp     x24, #0x5598000
  0x2346a10: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346a14: b        #0x2346a68
  0x2346a18: adrp     x8, #0x5596000
  0x2346a1c: ldr      x8, [x8, #0x558] ; = 0x0 (u64 @ 0x5596558)
  0x2346a20: str      w23, [sp, #8]
  0x2346a24: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5596000)
  0x2346a28: add      x1, sp, #8
  0x2346a2c: bl       #0x21b4c04 ; -> ??? 0x21b4c04
  0x2346a30: mov      x1, x0
  0x2346a34: ldr      x0, [x29] ; = 0x0 (u64 @ 0x559a000)
  0x2346a38: mov      x2, xzr
  0x2346a3c: bl       #0x477f23c ; -> System.String$$Format
  0x2346a40: mov      x21, x0
  0x2346a44: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5598000)
  0x2346a48: ldr      w8, [x0, #0xe0]
  0x2346a4c: cbnz     w8, #0x2346a54
  0x2346a50: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2346a54: mov      x0, x21
  0x2346a58: mov      x1, xzr
  0x2346a5c: bl       #0x2cb618c ; -> CDebug$$LogError
  0x2346a60: b        #0x2346908
  0x2346a64: add      w23, w23, #1
  0x2346a68: ldr      x8, [x22]
  0x2346a6c: cbz      x8, #0x2346c3c
  0x2346a70: ldr      w22, [x8, #0x10]
  0x2346a74: ldr      x0, [x25] ; = 0x0 (u64 @ 0x559a000)
  0x2346a78: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2346a7c: mov      x21, x0
  0x2346a80: mov      w1, w22
  0x2346a84: mov      w2, w23
  0x2346a88: mov      w3, wzr
  0x2346a8c: bl       #0x2344bdc ; -> CItemSpecialOption$$.ctor
  0x2346a90: ldr      x0, [x19, #0x28]
  0x2346a94: cbz      x0, #0x2346c40
  0x2346a98: ldr      w10, [x0, #0x1c]
  0x2346a9c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x559a010)
  0x2346aa0: ldr      x9, [x20] ; = 0x0 (u64 @ 0x559a000)
  0x2346aa4: add      w10, w10, #1
  0x2346aa8: str      w10, [x0, #0x1c]
  0x2346aac: cbz      x8, #0x2346c38
  0x2346ab0: ldrsw    x10, [x0, #0x18]
  0x2346ab4: ldr      w11, [x8, #0x18]
  0x2346ab8: cmp      w10, w11
  0x2346abc: b.hs     #0x2346ae0
  0x2346ac0: add      w9, w10, #1
  0x2346ac4: add      x8, x8, x10, lsl #3
  0x2346ac8: str      w9, [x0, #0x18]
  0x2346acc: str      x21, [x8, #0x20]!
  0x2346ad0: mov      x0, x8
  0x2346ad4: mov      x1, x21
  0x2346ad8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2346adc: b        #0x2346908
  0x2346ae0: ldr      x8, [x9, #0x20]
  0x2346ae4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55960c0)
  0x2346ae8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5596070)
  0x2346aec: mov      x1, x21
  0x2346af0: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2346af4: b        #0x2346908
  0x2346af8: adrp     x8, #0x5598000
  0x2346afc: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346b00: add      x0, sp, #0x40
  0x2346b04: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346b08: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346b0c: ldr      w20, [sp, #0x6c]
  0x2346b10: cmp      w20, #1
  0x2346b14: b.lt     #0x2346b44
  0x2346b18: ldr      x0, [x25] ; = 0x0 (u64 @ 0x559a000)
  0x2346b1c: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2346b20: mov      w2, #1
  0x2346b24: mov      w1, w20
  0x2346b28: mov      w3, wzr
  0x2346b2c: mov      x21, x0
  0x2346b30: bl       #0x2344bdc ; -> CItemSpecialOption$$.ctor
  0x2346b34: mov      x0, x19
  0x2346b38: str      x21, [x0, #0x30]!
  0x2346b3c: mov      x1, x21
  0x2346b40: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2346b44: ldr      x8, [x19, #0x10]
  0x2346b48: fmov     s0, wzr
  0x2346b4c: cbz      x8, #0x2346be8
  0x2346b50: ldr      w8, [x8, #0x18]
  0x2346b54: cmp      w8, #1
  0x2346b58: b.lt     #0x2346be8
  0x2346b5c: ldr      x8, [x19, #0x70]
  0x2346b60: cbz      x8, #0x2346c44
  0x2346b64: ldr      w8, [x8, #0x38]
  0x2346b68: sub      w8, w8, #1
  0x2346b6c: cmp      w8, #2
  0x2346b70: b.hi     #0x2346b84
  0x2346b74: adrp     x9, #0x1070000
  0x2346b78: add      x9, x9, #0xa00
  0x2346b7c: ldr      s8, [x9, w8, sxtw #2] ; = 6.844502219148137e-41 (f32 @ 0x1070002)
  0x2346b80: b        #0x2346b8c
  0x2346b84: adrp     x8, #0x1070000
  0x2346b88: ldr      s8, [x8, #0x4b8] ; = 0.6000000238418579 (f32 @ 0x10704b8)
  0x2346b8c: mov      x0, x19
  0x2346b90: bl       #0x23471b0 ; -> CItem$$GetBasicStarPoint
  0x2346b94: ldrb     w8, [x19, #0x65]
  0x2346b98: fmov     s1, #1.00000000
  0x2346b9c: sub      w8, w8, #2
  0x2346ba0: cmp      w8, #3
  0x2346ba4: b.hi     #0x2346bb8
  0x2346ba8: adrp     x9, #0x106f000
  0x2346bac: sxtb     x8, w8
  0x2346bb0: add      x9, x9, #0x370
  0x2346bb4: ldr      s1, [x9, x8, lsl #2] ; = 1.5782046448128588e-19 (f32 @ 0x106f002)
  0x2346bb8: ldrb     w8, [x19, #0x58]
  0x2346bbc: fmul     s0, s8, s0
  0x2346bc0: adrp     x9, #0x1070000
  0x2346bc4: fmul     s0, s0, s1
  0x2346bc8: ldr      s1, [x9, #0x6c4] ; = 0.07999999821186066 (f32 @ 0x10706c4)
  0x2346bcc: sub      w8, w8, #1
  0x2346bd0: scvtf    s3, w8
  0x2346bd4: fmov     s2, #5.00000000
  0x2346bd8: fmul     s3, s0, s3
  0x2346bdc: fmul     s1, s3, s1
  0x2346be0: fdiv     s0, s0, s2
  0x2346be4: fadd     s0, s0, s1
  0x2346be8: str      s0, [x19, #0x40]
  0x2346bec: ldp      x20, x19, [sp, #0xd0]
  0x2346bf0: ldp      x22, x21, [sp, #0xc0]
  0x2346bf4: ldp      x24, x23, [sp, #0xb0]
  0x2346bf8: ldp      x26, x25, [sp, #0xa0]
  0x2346bfc: ldp      x28, x27, [sp, #0x90]
  0x2346c00: ldp      x29, x30, [sp, #0x80]
  0x2346c04: ldp      d9, d8, [sp, #0x70]
  0x2346c08: ldr      d10, [sp, #0x60]
  0x2346c0c: add      sp, sp, #0xe0
  0x2346c10: ret      
  0x2346c14: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c18: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c1c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c20: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c24: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c28: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c2c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c30: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c34: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c38: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c3c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c40: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c44: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c48: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c4c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2346c50: b        #0x2346d34
  0x2346c54: b        #0x2346c94
  0x2346c58: b        #0x2346c94
  0x2346c5c: b        #0x2346c94
  0x2346c60: b        #0x2346d34
  0x2346c64: b        #0x2346d34
  0x2346c68: b        #0x2346d34
  0x2346c6c: b        #0x2346c94
  0x2346c70: b        #0x2346d9c
  0x2346c74: b        #0x2346d34
  0x2346c78: b        #0x2346d9c
  0x2346c7c: b        #0x2346cbc
  0x2346c80: b        #0x2346d34
  0x2346c84: b        #0x2346c94
  0x2346c88: b        #0x2346d34
  0x2346c8c: b        #0x2346d34
  0x2346c90: b        #0x2346c94
  0x2346c94: adrp     x25, #0x559a000
  0x2346c98: ldr      w20, [sp, #0x6c]
  0x2346c9c: ldr      x25, [x25, #0x4d8] ; = 0x0 (u64 @ 0x559a4d8)
  0x2346ca0: b        #0x2346d38
  0x2346ca4: b        #0x2346d9c
  0x2346ca8: b        #0x2346d9c
  0x2346cac: b        #0x2346cbc
  0x2346cb0: b        #0x2346d9c
  0x2346cb4: b        #0x2346d9c
  0x2346cb8: b        #0x2346cbc
  0x2346cbc: mov      x22, x0
  0x2346cc0: cmp      w1, #1
  0x2346cc4: b.ne     #0x2346d00
  0x2346cc8: mov      x0, x22
  0x2346ccc: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2346cd0: ldr      x23, [x0] ; = 0x0 (u64 @ 0x559a000)
  0x2346cd4: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2346cd8: adrp     x8, #0x5598000
  0x2346cdc: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346ce0: add      x0, sp, #0x40
  0x2346ce4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346ce8: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346cec: adrp     x24, #0x5598000
  0x2346cf0: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346cf4: cbz      x23, #0x2346750
  0x2346cf8: mov      x0, x23
  0x2346cfc: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2346d00: mov      x23, xzr
  0x2346d04: b        #0x2346d0c
  0x2346d08: mov      x22, x0
  0x2346d0c: adrp     x8, #0x5598000
  0x2346d10: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346d14: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346d18: add      x0, sp, #0x40
  0x2346d1c: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346d20: cbz      x23, #0x2346e04
  0x2346d24: mov      x0, x23
  0x2346d28: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2346d2c: b        #0x2346d34
  0x2346d30: b        #0x2346d34
  0x2346d34: ldr      w20, [sp, #0x6c]
  0x2346d38: mov      x22, x0
  0x2346d3c: cmp      w1, #1
  0x2346d40: b.ne     #0x2346d70
  0x2346d44: mov      x0, x22
  0x2346d48: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2346d4c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x559a000)
  0x2346d50: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2346d54: adrp     x8, #0x5598000
  0x2346d58: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346d5c: add      x0, sp, #0x40
  0x2346d60: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346d64: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346d68: cbz      x21, #0x2346b10
  0x2346d6c: b        #0x2346dd8
  0x2346d70: mov      x21, xzr
  0x2346d74: b        #0x2346d7c
  0x2346d78: mov      x22, x0
  0x2346d7c: adrp     x8, #0x5598000
  0x2346d80: ldr      x8, [x8, #0xc98] ; = 0x0 (u64 @ 0x5598c98)
  0x2346d84: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346d88: add      x0, sp, #0x40
  0x2346d8c: bl       #0x411cce0 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2346d90: cbz      x21, #0x2346e04
  0x2346d94: mov      x0, x21
  0x2346d98: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2346d9c: adrp     x24, #0x5598000
  0x2346da0: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346da4: mov      x22, x0
  0x2346da8: cmp      w1, #1
  0x2346dac: b.ne     #0x2346de0
  0x2346db0: mov      x0, x22
  0x2346db4: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2346db8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x559a000)
  0x2346dbc: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2346dc0: adrp     x8, #0x559a000
  0x2346dc4: ldr      x8, [x8, #0x4e8] ; = 0x0 (u64 @ 0x559a4e8)
  0x2346dc8: add      x0, sp, #0x20
  0x2346dcc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x2346dd0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2346dd4: cbz      x21, #0x23468b4
  0x2346dd8: mov      x0, x21
  0x2346ddc: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2346de0: mov      x21, xzr
  0x2346de4: b        #0x2346dec
  0x2346de8: mov      x22, x0
  0x2346dec: adrp     x8, #0x559a000
  0x2346df0: ldr      x8, [x8, #0x4e8] ; = 0x0 (u64 @ 0x559a4e8)
  0x2346df4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x2346df8: add      x0, sp, #0x20
  0x2346dfc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2346e00: cbnz     x21, #0x2346e0c
  0x2346e04: mov      x0, x22
  0x2346e08: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2346e0c: mov      x0, x21
  0x2346e10: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2346e14: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
