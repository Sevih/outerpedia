; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBuff_Run @ 0x232d2fc..0x232d68c (taille 912 octets) =====
  0x232d2fc: sub      sp, sp, #0x90
  0x232d300: stp      x30, x23, [sp, #0x60]
  0x232d304: stp      x22, x21, [sp, #0x70]
  0x232d308: stp      x20, x19, [sp, #0x80]
  0x232d30c: adrp     x20, #0x59e4000
  0x232d310: ldrb     w8, [x20, #0xc04]
  0x232d314: mov      x19, x0
  0x232d318: tbnz     w8, #0, #0x232d378
  0x232d31c: adrp     x0, #0x5598000
  0x232d320: ldr      x0, [x0, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232d324: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d328: adrp     x0, #0x5598000
  0x232d32c: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x232d330: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d334: adrp     x0, #0x5599000
  0x232d338: ldr      x0, [x0, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x232d33c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d340: adrp     x0, #0x5599000
  0x232d344: ldr      x0, [x0, #0x9a0] ; = 0x0 (u64 @ 0x55999a0)
  0x232d348: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d34c: adrp     x0, #0x5599000
  0x232d350: ldr      x0, [x0, #0x9a8] ; = 0x0 (u64 @ 0x55999a8)
  0x232d354: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d358: adrp     x0, #0x5599000
  0x232d35c: ldr      x0, [x0, #0x9b0] ; = 0x0 (u64 @ 0x55999b0)
  0x232d360: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d364: adrp     x0, #0x5599000
  0x232d368: ldr      x0, [x0, #0x9b8] ; = 0x0 (u64 @ 0x55999b8)
  0x232d36c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x232d370: mov      w8, #1
  0x232d374: strb     w8, [x20, #0xc04]
  0x232d378: stp      xzr, xzr, [sp, #0x40]
  0x232d37c: str      xzr, [sp, #0x50]
  0x232d380: ldr      x8, [x19, #0x10]
  0x232d384: cbz      x8, #0x232d600
  0x232d388: ldr      w9, [x8, #0x60]
  0x232d38c: cmp      w9, #0x1c
  0x232d390: b.ne     #0x232d39c
  0x232d394: mov      w9, wzr
  0x232d398: b        #0x232d3a8
  0x232d39c: ldr      x9, [x19, #0x20]
  0x232d3a0: cbz      x9, #0x232d600
  0x232d3a4: ldrb     w9, [x9, #0x370]
  0x232d3a8: cmp      w9, #0
  0x232d3ac: cset     w9, ne
  0x232d3b0: strb     w9, [x19, #0x3d]
  0x232d3b4: ldp      w8, w9, [x8, #0x88]
  0x232d3b8: mov      x0, x19
  0x232d3bc: cmp      w9, #6
  0x232d3c0: csinv    w8, w8, wzr, ne
  0x232d3c4: str      w8, [x19, #0x2c]
  0x232d3c8: bl       #0x232d68c ; -> CBuff$$OnCreate
  0x232d3cc: tbz      w0, #0, #0x232d5e0
  0x232d3d0: adrp     x8, #0x5598000
  0x232d3d4: ldr      x8, [x8, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x232d3d8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x232d3dc: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232d3e0: cbz      x0, #0x232d600
  0x232d3e4: ldr      x2, [x19, #0x20]
  0x232d3e8: mov      x1, x19
  0x232d3ec: mov      x3, xzr
  0x232d3f0: bl       #0x231cd28 ; -> CBattleManager$$BattleMissionCheck
  0x232d3f4: mov      x0, x19
  0x232d3f8: bl       #0x23308e0 ; -> CBuff$$PlayCreateEffect
  0x232d3fc: ldr      x8, [x19, #0x10]
  0x232d400: cbz      x8, #0x232d600
  0x232d404: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x232d408: cbz      x0, #0x232d600
  0x232d40c: adrp     x8, #0x5599000
  0x232d410: ldr      x8, [x8, #0x9b8] ; = 0x0 (u64 @ 0x55999b8)
  0x232d414: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232d418: add      x8, sp, #0x28
  0x232d41c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232d420: ldur     q0, [sp, #0x28]
  0x232d424: ldr      x8, [sp, #0x38]
  0x232d428: adrp     x21, #0x5599000
  0x232d42c: adrp     x22, #0x5598000
  0x232d430: ldr      x21, [x21, #0x9a0] ; = 0x0 (u64 @ 0x55999a0)
  0x232d434: ldr      x22, [x22, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x232d438: str      q0, [sp, #0x40]
  0x232d43c: str      x8, [sp, #0x50]
  0x232d440: adrp     x23, #0x5599000
  0x232d444: ldr      x23, [x23, #0x9b0] ; = 0x0 (u64 @ 0x55999b0)
  0x232d448: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5599000)
  0x232d44c: add      x0, sp, #0x40
  0x232d450: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232d454: tbz      w0, #0, #0x232d4f0
  0x232d458: ldr      x20, [sp, #0x50]
  0x232d45c: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x232d460: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232d464: cbz      x0, #0x232d5f8
  0x232d468: ldr      x2, [x19, #0x20]
  0x232d46c: mov      x1, x20
  0x232d470: mov      x3, xzr
  0x232d474: mov      x4, xzr
  0x232d478: mov      x5, xzr
  0x232d47c: mov      x6, xzr
  0x232d480: mov      x7, xzr
  0x232d484: str      xzr, [sp]
  0x232d488: bl       #0x2bebf34 ; -> CEffectManager$$Play
  0x232d48c: mov      x1, x0
  0x232d490: ldr      x0, [x19, #0x40]
  0x232d494: cbz      x0, #0x232d5fc
  0x232d498: ldr      w10, [x0, #0x1c]
  0x232d49c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x232d4a0: ldr      x9, [x23] ; = 0x0 (u64 @ 0x5599000)
  0x232d4a4: add      w10, w10, #1
  0x232d4a8: str      w10, [x0, #0x1c]
  0x232d4ac: cbz      x8, #0x232d5f4
  0x232d4b0: ldrsw    x10, [x0, #0x18]
  0x232d4b4: ldr      w11, [x8, #0x18]
  0x232d4b8: cmp      w10, w11
  0x232d4bc: b.hs     #0x232d4dc
  0x232d4c0: add      w9, w10, #1
  0x232d4c4: add      x8, x8, x10, lsl #3
  0x232d4c8: str      w9, [x0, #0x18]
  0x232d4cc: str      x1, [x8, #0x20]!
  0x232d4d0: mov      x0, x8
  0x232d4d4: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232d4d8: b        #0x232d448
  0x232d4dc: ldr      x8, [x9, #0x20]
  0x232d4e0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x232d4e4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x232d4e8: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x232d4ec: b        #0x232d448
  0x232d4f0: adrp     x8, #0x5599000
  0x232d4f4: ldr      x8, [x8, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x232d4f8: add      x0, sp, #0x40
  0x232d4fc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232d500: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232d504: ldr      x0, [x19, #0x10]
  0x232d508: cbz      x0, #0x232d600
  0x232d50c: ldr      w1, [x0, #0xc8]
  0x232d510: cbz      w1, #0x232d550
  0x232d514: ldr      x8, [x19, #0x20]
  0x232d518: cbz      x8, #0x232d600
  0x232d51c: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5599088)
  0x232d520: stp      xzr, xzr, [sp, #0x28]
  0x232d524: str      wzr, [sp, #0x38]
  0x232d528: cbz      x0, #0x232d600
  0x232d52c: ldur     q0, [sp, #0x28]
  0x232d530: ldr      w8, [sp, #0x38]
  0x232d534: add      x2, sp, #0x10
  0x232d538: mov      x3, xzr
  0x232d53c: str      q0, [sp, #0x10]
  0x232d540: str      w8, [sp, #0x20]
  0x232d544: bl       #0x2578948 ; -> CCharacterRender$$ChangeMaterials
  0x232d548: ldr      x0, [x19, #0x10]
  0x232d54c: cbz      x0, #0x232d600
  0x232d550: mov      x1, xzr
  0x232d554: bl       #0x25f4428 ; -> CBuffTemplet$$get_IsDebuff
  0x232d558: tbz      w0, #0, #0x232d5e0
  0x232d55c: ldr      x0, [x19, #0x10]
  0x232d560: cbz      x0, #0x232d600
  0x232d564: mov      w1, #1
  0x232d568: mov      x2, xzr
  0x232d56c: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x232d570: tbnz     w0, #0, #0x232d5e0
  0x232d574: ldr      x0, [x19, #0x10]
  0x232d578: cbz      x0, #0x232d600
  0x232d57c: mov      w1, #3
  0x232d580: mov      x2, xzr
  0x232d584: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x232d588: tbnz     w0, #0, #0x232d5e0
  0x232d58c: ldr      x8, [x19, #0x20]
  0x232d590: cbz      x8, #0x232d600
  0x232d594: ldr      x0, [x19, #0x18]
  0x232d598: cbz      x0, #0x232d600
  0x232d59c: ldr      w8, [x8, #0x21c]
  0x232d5a0: ldr      w9, [x0, #0x21c]
  0x232d5a4: cmp      w8, w9
  0x232d5a8: b.eq     #0x232d5e0
  0x232d5ac: mov      x1, xzr
  0x232d5b0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232d5b4: cbz      x0, #0x232d600
  0x232d5b8: mov      w8, #1
  0x232d5bc: strb     w8, [x0, #0x58]
  0x232d5c0: ldr      x0, [x19, #0x20]
  0x232d5c4: cbz      x0, #0x232d600
  0x232d5c8: mov      x1, xzr
  0x232d5cc: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x232d5d0: cbz      x0, #0x232d600
  0x232d5d4: ldr      x1, [x19, #0x18]
  0x232d5d8: str      x1, [x0, #0x60]!
  0x232d5dc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x232d5e0: ldp      x20, x19, [sp, #0x80]
  0x232d5e4: ldp      x22, x21, [sp, #0x70]
  0x232d5e8: ldp      x30, x23, [sp, #0x60]
  0x232d5ec: add      sp, sp, #0x90
  0x232d5f0: ret      
  0x232d5f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232d5f8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232d5fc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232d600: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x232d604: b        #0x232d618
  0x232d608: b        #0x232d618
  0x232d60c: b        #0x232d618
  0x232d610: b        #0x232d618
  0x232d614: b        #0x232d618
  0x232d618: mov      x20, x0
  0x232d61c: cmp      w1, #1
  0x232d620: b.ne     #0x232d654
  0x232d624: mov      x0, x20
  0x232d628: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x232d62c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x232d630: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x232d634: adrp     x8, #0x5599000
  0x232d638: ldr      x8, [x8, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x232d63c: add      x0, sp, #0x40
  0x232d640: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232d644: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232d648: cbz      x21, #0x232d504
  0x232d64c: mov      x0, x21
  0x232d650: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x232d654: mov      x21, xzr
  0x232d658: b        #0x232d660
  0x232d65c: mov      x20, x0
  0x232d660: adrp     x8, #0x5599000
  0x232d664: ldr      x8, [x8, #0x998] ; = 0x0 (u64 @ 0x5599998)
  0x232d668: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x232d66c: add      x0, sp, #0x40
  0x232d670: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232d674: cbnz     x21, #0x232d680
  0x232d678: mov      x0, x20
  0x232d67c: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x232d680: mov      x0, x21
  0x232d684: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x232d688: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
