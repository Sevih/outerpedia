; ===== CBuff_Run @ 0x22fc38c..0x22fc71c (taille 912 octets) =====
  0x22fc38c: sub      sp, sp, #0x90
  0x22fc390: stp      x30, x23, [sp, #0x60]
  0x22fc394: stp      x22, x21, [sp, #0x70]
  0x22fc398: stp      x20, x19, [sp, #0x80]
  0x22fc39c: adrp     x20, #0x5955000
  0x22fc3a0: ldrb     w8, [x20, #0x923]
  0x22fc3a4: mov      x19, x0
  0x22fc3a8: tbnz     w8, #0, #0x22fc408
  0x22fc3ac: adrp     x0, #0x5511000
  0x22fc3b0: ldr      x0, [x0, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fc3b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3b8: adrp     x0, #0x5511000
  0x22fc3bc: ldr      x0, [x0, #0x980] ; = 0x0 (u64 @ 0x5511980)
  0x22fc3c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3c4: adrp     x0, #0x5512000
  0x22fc3c8: ldr      x0, [x0, #0x430] ; = 0x0 (u64 @ 0x5512430)
  0x22fc3cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3d0: adrp     x0, #0x5512000
  0x22fc3d4: ldr      x0, [x0, #0x438] ; = 0x0 (u64 @ 0x5512438)
  0x22fc3d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3dc: adrp     x0, #0x5512000
  0x22fc3e0: ldr      x0, [x0, #0x440] ; = 0x0 (u64 @ 0x5512440)
  0x22fc3e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3e8: adrp     x0, #0x5512000
  0x22fc3ec: ldr      x0, [x0, #0x448] ; = 0x0 (u64 @ 0x5512448)
  0x22fc3f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc3f4: adrp     x0, #0x5512000
  0x22fc3f8: ldr      x0, [x0, #0x450] ; = 0x0 (u64 @ 0x5512450)
  0x22fc3fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x22fc400: mov      w8, #1
  0x22fc404: strb     w8, [x20, #0x923]
  0x22fc408: stp      xzr, xzr, [sp, #0x40]
  0x22fc40c: str      xzr, [sp, #0x50]
  0x22fc410: ldr      x8, [x19, #0x10]
  0x22fc414: cbz      x8, #0x22fc690
  0x22fc418: ldr      w9, [x8, #0x5c]
  0x22fc41c: cmp      w9, #0x1c
  0x22fc420: b.ne     #0x22fc42c
  0x22fc424: mov      w9, wzr
  0x22fc428: b        #0x22fc438
  0x22fc42c: ldr      x9, [x19, #0x20]
  0x22fc430: cbz      x9, #0x22fc690
  0x22fc434: ldrb     w9, [x9, #0x370]
  0x22fc438: cmp      w9, #0
  0x22fc43c: cset     w9, ne
  0x22fc440: strb     w9, [x19, #0x3d]
  0x22fc444: ldp      w8, w9, [x8, #0x88]
  0x22fc448: mov      x0, x19
  0x22fc44c: cmp      w9, #6
  0x22fc450: csinv    w8, w8, wzr, ne
  0x22fc454: str      w8, [x19, #0x2c]
  0x22fc458: bl       #0x22fc71c ; -> CBuff$$OnCreate
  0x22fc45c: tbz      w0, #0, #0x22fc670
  0x22fc460: adrp     x8, #0x5511000
  0x22fc464: ldr      x8, [x8, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x22fc468: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22fc46c: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fc470: cbz      x0, #0x22fc690
  0x22fc474: ldr      x2, [x19, #0x20]
  0x22fc478: mov      x1, x19
  0x22fc47c: mov      x3, xzr
  0x22fc480: bl       #0x22ec424 ; -> CBattleManager$$BattleMissionCheck
  0x22fc484: mov      x0, x19
  0x22fc488: bl       #0x22ff894 ; -> CBuff$$PlayCreateEffect
  0x22fc48c: ldr      x8, [x19, #0x10]
  0x22fc490: cbz      x8, #0x22fc690
  0x22fc494: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x22fc498: cbz      x0, #0x22fc690
  0x22fc49c: adrp     x8, #0x5512000
  0x22fc4a0: ldr      x8, [x8, #0x450] ; = 0x0 (u64 @ 0x5512450)
  0x22fc4a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fc4a8: add      x8, sp, #0x28
  0x22fc4ac: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22fc4b0: ldur     q0, [sp, #0x28]
  0x22fc4b4: ldr      x8, [sp, #0x38]
  0x22fc4b8: adrp     x21, #0x5512000
  0x22fc4bc: adrp     x22, #0x5511000
  0x22fc4c0: ldr      x21, [x21, #0x438] ; = 0x0 (u64 @ 0x5512438)
  0x22fc4c4: ldr      x22, [x22, #0x980] ; = 0x0 (u64 @ 0x5511980)
  0x22fc4c8: str      q0, [sp, #0x40]
  0x22fc4cc: str      x8, [sp, #0x50]
  0x22fc4d0: adrp     x23, #0x5512000
  0x22fc4d4: ldr      x23, [x23, #0x448] ; = 0x0 (u64 @ 0x5512448)
  0x22fc4d8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5512000)
  0x22fc4dc: add      x0, sp, #0x40
  0x22fc4e0: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22fc4e4: tbz      w0, #0, #0x22fc580
  0x22fc4e8: ldr      x20, [sp, #0x50]
  0x22fc4ec: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22fc4f0: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x22fc4f4: cbz      x0, #0x22fc688
  0x22fc4f8: ldr      x2, [x19, #0x20]
  0x22fc4fc: mov      x1, x20
  0x22fc500: mov      x3, xzr
  0x22fc504: mov      x4, xzr
  0x22fc508: mov      x5, xzr
  0x22fc50c: mov      x6, xzr
  0x22fc510: mov      x7, xzr
  0x22fc514: str      xzr, [sp]
  0x22fc518: bl       #0x2b94abc ; -> CEffectManager$$Play
  0x22fc51c: mov      x1, x0
  0x22fc520: ldr      x0, [x19, #0x40]
  0x22fc524: cbz      x0, #0x22fc68c
  0x22fc528: ldr      w10, [x0, #0x1c]
  0x22fc52c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5512010)
  0x22fc530: ldr      x9, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x22fc534: add      w10, w10, #1
  0x22fc538: str      w10, [x0, #0x1c]
  0x22fc53c: cbz      x8, #0x22fc684
  0x22fc540: ldrsw    x10, [x0, #0x18]
  0x22fc544: ldr      w11, [x8, #0x18]
  0x22fc548: cmp      w10, w11
  0x22fc54c: b.hs     #0x22fc56c
  0x22fc550: add      w9, w10, #1
  0x22fc554: add      x8, x8, x10, lsl #3
  0x22fc558: str      w9, [x0, #0x18]
  0x22fc55c: str      x1, [x8, #0x20]!
  0x22fc560: mov      x0, x8
  0x22fc564: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fc568: b        #0x22fc4d8
  0x22fc56c: ldr      x8, [x9, #0x20]
  0x22fc570: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55120c0)
  0x22fc574: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5512070)
  0x22fc578: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x22fc57c: b        #0x22fc4d8
  0x22fc580: adrp     x8, #0x5512000
  0x22fc584: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x5512430)
  0x22fc588: add      x0, sp, #0x40
  0x22fc58c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fc590: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fc594: ldr      x0, [x19, #0x10]
  0x22fc598: cbz      x0, #0x22fc690
  0x22fc59c: ldr      w1, [x0, #0xc8]
  0x22fc5a0: cbz      w1, #0x22fc5e0
  0x22fc5a4: ldr      x8, [x19, #0x20]
  0x22fc5a8: cbz      x8, #0x22fc690
  0x22fc5ac: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5512088)
  0x22fc5b0: stp      xzr, xzr, [sp, #0x28]
  0x22fc5b4: str      wzr, [sp, #0x38]
  0x22fc5b8: cbz      x0, #0x22fc690
  0x22fc5bc: ldur     q0, [sp, #0x28]
  0x22fc5c0: ldr      w8, [sp, #0x38]
  0x22fc5c4: add      x2, sp, #0x10
  0x22fc5c8: mov      x3, xzr
  0x22fc5cc: str      q0, [sp, #0x10]
  0x22fc5d0: str      w8, [sp, #0x20]
  0x22fc5d4: bl       #0x252e418 ; -> CCharacterRender$$ChangeMaterials
  0x22fc5d8: ldr      x0, [x19, #0x10]
  0x22fc5dc: cbz      x0, #0x22fc690
  0x22fc5e0: mov      x1, xzr
  0x22fc5e4: bl       #0x25a73ec ; -> CBuffTemplet$$get_IsDebuff
  0x22fc5e8: tbz      w0, #0, #0x22fc670
  0x22fc5ec: ldr      x0, [x19, #0x10]
  0x22fc5f0: cbz      x0, #0x22fc690
  0x22fc5f4: mov      w1, #1
  0x22fc5f8: mov      x2, xzr
  0x22fc5fc: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x22fc600: tbnz     w0, #0, #0x22fc670
  0x22fc604: ldr      x0, [x19, #0x10]
  0x22fc608: cbz      x0, #0x22fc690
  0x22fc60c: mov      w1, #3
  0x22fc610: mov      x2, xzr
  0x22fc614: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x22fc618: tbnz     w0, #0, #0x22fc670
  0x22fc61c: ldr      x8, [x19, #0x20]
  0x22fc620: cbz      x8, #0x22fc690
  0x22fc624: ldr      x0, [x19, #0x18]
  0x22fc628: cbz      x0, #0x22fc690
  0x22fc62c: ldr      w8, [x8, #0x21c]
  0x22fc630: ldr      w9, [x0, #0x21c]
  0x22fc634: cmp      w8, w9
  0x22fc638: b.eq     #0x22fc670
  0x22fc63c: mov      x1, xzr
  0x22fc640: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fc644: cbz      x0, #0x22fc690
  0x22fc648: mov      w8, #1
  0x22fc64c: strb     w8, [x0, #0x58]
  0x22fc650: ldr      x0, [x19, #0x20]
  0x22fc654: cbz      x0, #0x22fc690
  0x22fc658: mov      x1, xzr
  0x22fc65c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x22fc660: cbz      x0, #0x22fc690
  0x22fc664: ldr      x1, [x19, #0x18]
  0x22fc668: str      x1, [x0, #0x60]!
  0x22fc66c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x22fc670: ldp      x20, x19, [sp, #0x80]
  0x22fc674: ldp      x22, x21, [sp, #0x70]
  0x22fc678: ldp      x30, x23, [sp, #0x60]
  0x22fc67c: add      sp, sp, #0x90
  0x22fc680: ret      
  0x22fc684: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fc688: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fc68c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fc690: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22fc694: b        #0x22fc6a8
  0x22fc698: b        #0x22fc6a8
  0x22fc69c: b        #0x22fc6a8
  0x22fc6a0: b        #0x22fc6a8
  0x22fc6a4: b        #0x22fc6a8
  0x22fc6a8: mov      x20, x0
  0x22fc6ac: cmp      w1, #1
  0x22fc6b0: b.ne     #0x22fc6e4
  0x22fc6b4: mov      x0, x20
  0x22fc6b8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22fc6bc: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5512000)
  0x22fc6c0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22fc6c4: adrp     x8, #0x5512000
  0x22fc6c8: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x5512430)
  0x22fc6cc: add      x0, sp, #0x40
  0x22fc6d0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fc6d4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fc6d8: cbz      x21, #0x22fc594
  0x22fc6dc: mov      x0, x21
  0x22fc6e0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22fc6e4: mov      x21, xzr
  0x22fc6e8: b        #0x22fc6f0
  0x22fc6ec: mov      x20, x0
  0x22fc6f0: adrp     x8, #0x5512000
  0x22fc6f4: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x5512430)
  0x22fc6f8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x22fc6fc: add      x0, sp, #0x40
  0x22fc700: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22fc704: cbnz     x21, #0x22fc710
  0x22fc708: mov      x0, x20
  0x22fc70c: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x22fc710: mov      x0, x21
  0x22fc714: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22fc718: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
