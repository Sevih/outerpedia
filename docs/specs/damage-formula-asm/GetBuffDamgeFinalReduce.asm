; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetBuffDamgeFinalReduce @ 0x282f370..0x282f878 (taille 1288 octets) =====
  0x282f370: sub      sp, sp, #0xd0
  0x282f374: stp      x29, x30, [sp, #0x70]
  0x282f378: stp      x28, x27, [sp, #0x80]
  0x282f37c: stp      x26, x25, [sp, #0x90]
  0x282f380: stp      x24, x23, [sp, #0xa0]
  0x282f384: stp      x22, x21, [sp, #0xb0]
  0x282f388: stp      x20, x19, [sp, #0xc0]
  0x282f38c: adrp     x22, #0x59e7000
  0x282f390: ldrb     w8, [x22, #0x6e0]
  0x282f394: mov      x19, x2
  0x282f398: mov      x20, x1
  0x282f39c: mov      x21, x0
  0x282f3a0: tbnz     w8, #0, #0x282f418
  0x282f3a4: adrp     x0, #0x5598000
  0x282f3a8: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282f3ac: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3b0: adrp     x0, #0x5598000
  0x282f3b4: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f3b8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3bc: adrp     x0, #0x5598000
  0x282f3c0: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282f3c4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3c8: adrp     x0, #0x5598000
  0x282f3cc: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282f3d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3d4: adrp     x0, #0x5598000
  0x282f3d8: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x282f3dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3e0: adrp     x0, #0x5598000
  0x282f3e4: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x282f3e8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3ec: adrp     x0, #0x5598000
  0x282f3f0: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282f3f4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f3f8: adrp     x0, #0x5598000
  0x282f3fc: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282f400: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f404: adrp     x0, #0x5596000
  0x282f408: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282f40c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282f410: mov      w8, #1
  0x282f414: strb     w8, [x22, #0x6e0]
  0x282f418: stp      xzr, xzr, [sp, #0x50]
  0x282f41c: str      xzr, [sp, #0x60]
  0x282f420: stp      xzr, xzr, [sp, #0x30]
  0x282f424: str      xzr, [sp, #0x40]
  0x282f428: str      wzr, [x20]
  0x282f42c: ldr      x0, [x21, #0x380]
  0x282f430: cbz      x0, #0x282f78c
  0x282f434: adrp     x8, #0x5598000
  0x282f438: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282f43c: adrp     x25, #0x5598000
  0x282f440: adrp     x26, #0x5596000
  0x282f444: adrp     x27, #0x5598000
  0x282f448: ldr      x25, [x25, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282f44c: ldr      x26, [x26, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x282f450: ldr      x27, [x27, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x282f454: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282f458: adrp     x28, #0x5598000
  0x282f45c: adrp     x24, #0x5598000
  0x282f460: adrp     x23, #0x5598000
  0x282f464: ldr      x28, [x28, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x282f468: ldr      x24, [x24, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x282f46c: ldr      x23, [x23, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282f470: add      x8, sp, #0x18
  0x282f474: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282f478: ldur     q0, [sp, #0x18]
  0x282f47c: ldr      x8, [sp, #0x28]
  0x282f480: str      q0, [sp, #0x50]
  0x282f484: str      x8, [sp, #0x60]
  0x282f488: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5598000)
  0x282f48c: add      x0, sp, #0x50
  0x282f490: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282f494: tbz      w0, #0, #0x282f71c
  0x282f498: ldr      x21, [sp, #0x60]
  0x282f49c: cbz      x21, #0x282f488
  0x282f4a0: ldr      x0, [x26] ; = 0x0 (u64 @ 0x5596000)
  0x282f4a4: ldr      x22, [x21, #0x20]
  0x282f4a8: ldr      w8, [x0, #0xe0]
  0x282f4ac: cbnz     w8, #0x282f4b4
  0x282f4b0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282f4b4: mov      x0, x22
  0x282f4b8: mov      x1, xzr
  0x282f4bc: mov      x2, xzr
  0x282f4c0: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282f4c4: tbnz     w0, #0, #0x282f488
  0x282f4c8: mov      x0, x21
  0x282f4cc: mov      x1, xzr
  0x282f4d0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282f4d4: cmp      w0, #0x77
  0x282f4d8: b.ne     #0x282f528
  0x282f4dc: mov      w2, #0x17
  0x282f4e0: mov      x0, x21
  0x282f4e4: mov      x1, x19
  0x282f4e8: mov      x3, xzr
  0x282f4ec: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282f4f0: tbz      w0, #0, #0x282f528
  0x282f4f4: ldr      w22, [x20]
  0x282f4f8: mov      x0, x21
  0x282f4fc: mov      x1, xzr
  0x282f500: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f504: cmp      w22, w0
  0x282f508: b.ge     #0x282f528
  0x282f50c: mov      x0, x21
  0x282f510: mov      x1, xzr
  0x282f514: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f518: str      w0, [x20]
  0x282f51c: mov      x0, x21
  0x282f520: mov      x1, xzr
  0x282f524: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282f528: mov      x0, x21
  0x282f52c: mov      x1, xzr
  0x282f530: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282f534: cmp      w0, #0x78
  0x282f538: b.ne     #0x282f624
  0x282f53c: mov      w2, #0x17
  0x282f540: mov      x0, x21
  0x282f544: mov      x1, x19
  0x282f548: mov      x3, xzr
  0x282f54c: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282f550: tbz      w0, #0, #0x282f624
  0x282f554: ldr      x0, [x21, #0x20]
  0x282f558: cbz      x0, #0x282f77c
  0x282f55c: bl       #0x2818b28 ; -> CCharacterBattle$$GetTeam
  0x282f560: cbz      x0, #0x282f488
  0x282f564: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x5596010)
  0x282f568: cbz      x0, #0x282f780
  0x282f56c: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5598000)
  0x282f570: add      x8, sp, #0x18
  0x282f574: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282f578: ldur     q0, [sp, #0x18]
  0x282f57c: ldr      x8, [sp, #0x28]
  0x282f580: mov      w29, wzr
  0x282f584: str      q0, [sp, #0x30]
  0x282f588: str      x8, [sp, #0x40]
  0x282f58c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5598000)
  0x282f590: add      x0, sp, #0x30
  0x282f594: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282f598: tbz      w0, #0, #0x282f5e0
  0x282f59c: ldr      x0, [x26] ; = 0x0 (u64 @ 0x5596000)
  0x282f5a0: ldr      x22, [sp, #0x40]
  0x282f5a4: ldr      w8, [x0, #0xe0]
  0x282f5a8: cbnz     w8, #0x282f5b0
  0x282f5ac: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x282f5b0: mov      x0, x22
  0x282f5b4: mov      x1, xzr
  0x282f5b8: mov      x2, xzr
  0x282f5bc: bl       #0x5046628 ; -> UnityEngine.Object$$op_Equality
  0x282f5c0: tbnz     w0, #0, #0x282f58c
  0x282f5c4: cbz      x22, #0x282f6e4
  0x282f5c8: mov      x0, x22
  0x282f5cc: mov      x1, xzr
  0x282f5d0: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x282f5d4: and      w8, w0, #1
  0x282f5d8: add      w29, w29, w8
  0x282f5dc: b        #0x282f58c
  0x282f5e0: mov      x22, xzr
  0x282f5e4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x282f5e8: add      x0, sp, #0x30
  0x282f5ec: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f5f0: cbnz     x22, #0x282f784
  0x282f5f4: mov      x0, x21
  0x282f5f8: mov      x1, xzr
  0x282f5fc: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f600: ldr      w9, [x20]
  0x282f604: sub      w8, w29, #1
  0x282f608: mul      w8, w0, w8
  0x282f60c: cmp      w8, w9
  0x282f610: b.le     #0x282f624
  0x282f614: str      w8, [x20]
  0x282f618: mov      x0, x21
  0x282f61c: mov      x1, xzr
  0x282f620: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282f624: mov      x0, x21
  0x282f628: mov      x1, xzr
  0x282f62c: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282f630: cmp      w0, #0x79
  0x282f634: b.ne     #0x282f6a8
  0x282f638: cbz      x19, #0x282f750
  0x282f63c: mov      x0, x19
  0x282f640: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282f644: cbz      x0, #0x282f748
  0x282f648: ldr      w8, [x0, #0x18]
  0x282f64c: cbz      w8, #0x282f6a8
  0x282f650: mov      x0, x19
  0x282f654: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282f658: cbz      x0, #0x282f778
  0x282f65c: ldr      w2, [x0, #0x18]
  0x282f660: mov      x0, x21
  0x282f664: mov      x1, x19
  0x282f668: mov      x3, xzr
  0x282f66c: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282f670: tbz      w0, #0, #0x282f6a8
  0x282f674: mov      x0, x21
  0x282f678: mov      x1, xzr
  0x282f67c: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f680: ldr      w8, [x20]
  0x282f684: cmp      w0, w8
  0x282f688: b.le     #0x282f6a8
  0x282f68c: mov      x0, x21
  0x282f690: mov      x1, xzr
  0x282f694: bl       #0x232548c ; -> CBuff$$get_Value
  0x282f698: str      w0, [x20]
  0x282f69c: mov      x0, x21
  0x282f6a0: mov      x1, xzr
  0x282f6a4: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282f6a8: mov      x0, x21
  0x282f6ac: mov      x1, xzr
  0x282f6b0: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282f6b4: cmp      w0, #0x79
  0x282f6b8: b.ne     #0x282f488
  0x282f6bc: cbz      x19, #0x282f74c
  0x282f6c0: mov      x0, x19
  0x282f6c4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x282f6c8: cbz      x0, #0x282f754
  0x282f6cc: ldr      w8, [x0, #0x18]
  0x282f6d0: cbnz     w8, #0x282f488
  0x282f6d4: mov      x0, x21
  0x282f6d8: mov      x1, xzr
  0x282f6dc: bl       #0x2330ca8 ; -> CBuff$$MarkUsedHitOverThisSkill
  0x282f6e0: b        #0x282f488
  0x282f6e4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f6e8: b        #0x282f790
  0x282f6ec: b        #0x282f6fc
  0x282f6f0: b        #0x282f6fc
  0x282f6f4: b        #0x282f6fc
  0x282f6f8: b        #0x282f6fc
  0x282f6fc: cmp      w1, #1
  0x282f700: stp      x1, x0, [sp, #8]
  0x282f704: b.ne     #0x282f758
  0x282f708: ldr      x0, [sp, #0x10]
  0x282f70c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282f710: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x282f714: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282f718: b        #0x282f5e4
  0x282f71c: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x282f720: add      x0, sp, #0x50
  0x282f724: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f728: ldp      x20, x19, [sp, #0xc0]
  0x282f72c: ldp      x22, x21, [sp, #0xb0]
  0x282f730: ldp      x24, x23, [sp, #0xa0]
  0x282f734: ldp      x26, x25, [sp, #0x90]
  0x282f738: ldp      x28, x27, [sp, #0x80]
  0x282f73c: ldp      x29, x30, [sp, #0x70]
  0x282f740: add      sp, sp, #0xd0
  0x282f744: ret      
  0x282f748: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f74c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f750: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f754: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f758: mov      x22, xzr
  0x282f75c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x282f760: add      x0, sp, #0x30
  0x282f764: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f768: ldp      x1, x0, [sp, #8]
  0x282f76c: cbz      x22, #0x282f818
  0x282f770: mov      x0, x22
  0x282f774: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f778: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f77c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f780: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f784: mov      x0, x22
  0x282f788: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f78c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282f790: stp      x1, x0, [sp, #8]
  0x282f794: b        #0x282f75c
  0x282f798: b        #0x282f818
  0x282f79c: b        #0x282f818
  0x282f7a0: b        #0x282f818
  0x282f7a4: b        #0x282f818
  0x282f7a8: b        #0x282f818
  0x282f7ac: b        #0x282f818
  0x282f7b0: b        #0x282f818
  0x282f7b4: b        #0x282f818
  0x282f7b8: b        #0x282f818
  0x282f7bc: b        #0x282f818
  0x282f7c0: b        #0x282f818
  0x282f7c4: b        #0x282f818
  0x282f7c8: b        #0x282f818
  0x282f7cc: b        #0x282f818
  0x282f7d0: b        #0x282f818
  0x282f7d4: b        #0x282f818
  0x282f7d8: b        #0x282f818
  0x282f7dc: b        #0x282f818
  0x282f7e0: b        #0x282f818
  0x282f7e4: b        #0x282f818
  0x282f7e8: b        #0x282f818
  0x282f7ec: b        #0x282f818
  0x282f7f0: b        #0x282f818
  0x282f7f4: b        #0x282f818
  0x282f7f8: b        #0x282f818
  0x282f7fc: b        #0x282f818
  0x282f800: b        #0x282f818
  0x282f804: b        #0x282f818
  0x282f808: b        #0x282f818
  0x282f80c: b        #0x282f818
  0x282f810: b        #0x282f818
  0x282f814: b        #0x282f818
  0x282f818: cmp      w1, #1
  0x282f81c: b.ne     #0x282f844
  0x282f820: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282f824: ldr      x19, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x282f828: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282f82c: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x282f830: add      x0, sp, #0x50
  0x282f834: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f838: cbz      x19, #0x282f728
  0x282f83c: mov      x0, x19
  0x282f840: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f844: mov      x20, x0
  0x282f848: mov      x19, xzr
  0x282f84c: b        #0x282f854
  0x282f850: mov      x20, x0
  0x282f854: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5598000)
  0x282f858: add      x0, sp, #0x50
  0x282f85c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282f860: cbnz     x19, #0x282f86c
  0x282f864: mov      x0, x20
  0x282f868: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x282f86c: mov      x0, x19
  0x282f870: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282f874: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
