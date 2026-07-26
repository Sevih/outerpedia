; ===== CheckDamageRate @ 0x2c5a448..0x2c5ab60 (taille 1816 octets) =====
  0x2c5a448: sub      sp, sp, #0x50
  0x2c5a44c: stp      x30, x25, [sp, #0x10]
  0x2c5a450: stp      x24, x23, [sp, #0x20]
  0x2c5a454: stp      x22, x21, [sp, #0x30]
  0x2c5a458: stp      x20, x19, [sp, #0x40]
  0x2c5a45c: adrp     x21, #0x595a000
  0x2c5a460: ldrb     w8, [x21, #0x905]
  0x2c5a464: mov      x19, x1
  0x2c5a468: mov      x20, x0
  0x2c5a46c: tbnz     w8, #0, #0x2c5a49c
  0x2c5a470: adrp     x0, #0x5511000
  0x2c5a474: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x2c5a478: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a47c: adrp     x0, #0x550f000
  0x2c5a480: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x2c5a484: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a488: adrp     x0, #0x5551000
  0x2c5a48c: ldr      x0, [x0, #0x1e0] ; = 0x0 (u64 @ 0x55511e0)
  0x2c5a490: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a494: mov      w8, #1
  0x2c5a498: strb     w8, [x21, #0x905]
  0x2c5a49c: adrp     x23, #0x5955000
  0x2c5a4a0: adrp     x25, #0x550f000
  0x2c5a4a4: ldrb     w8, [x23, #0x8f3]
  0x2c5a4a8: ldr      x25, [x25, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x2c5a4ac: str      xzr, [sp, #8]
  0x2c5a4b0: cbnz     w8, #0x2c5a4c8
  0x2c5a4b4: adrp     x0, #0x5511000
  0x2c5a4b8: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a4bc: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a4c0: mov      w8, #1
  0x2c5a4c4: strb     w8, [x23, #0x8f3]
  0x2c5a4c8: adrp     x24, #0x5511000
  0x2c5a4cc: ldr      x24, [x24, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a4d0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x2c5a4d4: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a4d8: ldr      w9, [x0, #0xe0]
  0x2c5a4dc: ldr      x8, [x8, #0xb8]
  0x2c5a4e0: ldr      x21, [x8]
  0x2c5a4e4: cbnz     w9, #0x2c5a4ec
  0x2c5a4e8: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a4ec: mov      x0, x21
  0x2c5a4f0: mov      x1, xzr
  0x2c5a4f4: mov      x2, xzr
  0x2c5a4f8: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x2c5a4fc: tbz      w0, #0, #0x2c5a5d8
  0x2c5a500: ldrb     w8, [x23, #0x8f3]
  0x2c5a504: cbnz     w8, #0x2c5a51c
  0x2c5a508: adrp     x0, #0x5511000
  0x2c5a50c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a510: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a514: mov      w8, #1
  0x2c5a518: strb     w8, [x23, #0x8f3]
  0x2c5a51c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a520: ldr      x8, [x8, #0xb8]
  0x2c5a524: ldr      x0, [x8]
  0x2c5a528: cbz      x0, #0x2c5ab5c
  0x2c5a52c: mov      x1, xzr
  0x2c5a530: bl       #0x2548e34 ; -> CDungeonScene$$get_IsWorldBoss
  0x2c5a534: tbz      w0, #0, #0x2c5a5d8
  0x2c5a538: ldrb     w8, [x23, #0x8f3]
  0x2c5a53c: cbnz     w8, #0x2c5a554
  0x2c5a540: adrp     x0, #0x5511000
  0x2c5a544: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a548: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a54c: mov      w8, #1
  0x2c5a550: strb     w8, [x23, #0x8f3]
  0x2c5a554: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a558: ldr      x8, [x8, #0xb8]
  0x2c5a55c: ldr      x8, [x8]
  0x2c5a560: cbz      x8, #0x2c5ab5c
  0x2c5a564: ldrb     w8, [x8, #0x35]
  0x2c5a568: cbz      w8, #0x2c5a5d8
  0x2c5a56c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x2c5a570: ldr      w8, [x0, #0xe0]
  0x2c5a574: cbnz     w8, #0x2c5a57c
  0x2c5a578: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a57c: mov      x0, x20
  0x2c5a580: mov      x1, xzr
  0x2c5a584: mov      x2, xzr
  0x2c5a588: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x2c5a58c: tbz      w0, #0, #0x2c5a5d8
  0x2c5a590: cbz      x20, #0x2c5ab5c
  0x2c5a594: mov      x0, x20
  0x2c5a598: mov      x1, xzr
  0x2c5a59c: bl       #0x26c5664 ; -> CCharacterBattle$$get_IsBoss
  0x2c5a5a0: tbz      w0, #0, #0x2c5a5d8
  0x2c5a5a4: cbz      x19, #0x2c5ab5c
  0x2c5a5a8: mov      x0, x19
  0x2c5a5ac: mov      x1, xzr
  0x2c5a5b0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a5b4: cbz      x0, #0x2c5ab5c
  0x2c5a5b8: mov      w8, #1
  0x2c5a5bc: str      w8, [x0, #0x3c]
  0x2c5a5c0: mov      x0, x19
  0x2c5a5c4: mov      x1, xzr
  0x2c5a5c8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a5cc: cbz      x0, #0x2c5ab5c
  0x2c5a5d0: mov      w8, #0x3e8
  0x2c5a5d4: b        #0x2c5ab40
  0x2c5a5d8: cbz      x19, #0x2c5ab5c
  0x2c5a5dc: mov      w1, #3
  0x2c5a5e0: mov      x0, x19
  0x2c5a5e4: mov      x2, xzr
  0x2c5a5e8: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x2c5a5ec: cbz      x0, #0x2c5a620
  0x2c5a5f0: mov      x0, x19
  0x2c5a5f4: mov      x1, xzr
  0x2c5a5f8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a5fc: cbz      x0, #0x2c5ab5c
  0x2c5a600: mov      w8, #4
  0x2c5a604: str      w8, [x0, #0x3c]
  0x2c5a608: mov      x0, x19
  0x2c5a60c: mov      x1, xzr
  0x2c5a610: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a614: cbz      x0, #0x2c5ab5c
  0x2c5a618: mov      w8, wzr
  0x2c5a61c: b        #0x2c5ab40
  0x2c5a620: cbz      x20, #0x2c5ab5c
  0x2c5a624: mov      x0, x20
  0x2c5a628: mov      x1, xzr
  0x2c5a62c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a630: cbz      x0, #0x2c5ab5c
  0x2c5a634: ldrb     w8, [x0, #0x34]
  0x2c5a638: cbz      w8, #0x2c5a6f8
  0x2c5a63c: mov      x0, x19
  0x2c5a640: mov      x1, xzr
  0x2c5a644: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a648: cbz      x0, #0x2c5ab5c
  0x2c5a64c: ldr      w8, [x0, #0x3c]
  0x2c5a650: cbz      w8, #0x2c5a6f8
  0x2c5a654: mov      x0, x19
  0x2c5a658: mov      x1, xzr
  0x2c5a65c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a660: cbz      x0, #0x2c5ab5c
  0x2c5a664: ldr      w21, [x0, #0x3c]
  0x2c5a668: mov      x0, x19
  0x2c5a66c: mov      x1, xzr
  0x2c5a670: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a674: cbz      x0, #0x2c5ab5c
  0x2c5a678: cmp      w21, #3
  0x2c5a67c: b.eq     #0x2c5aa20
  0x2c5a680: ldr      w21, [x0, #0x3c]
  0x2c5a684: mov      x0, x19
  0x2c5a688: mov      x1, xzr
  0x2c5a68c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a690: cmp      w21, #2
  0x2c5a694: mov      x21, x0
  0x2c5a698: b.ne     #0x2c5aa2c
  0x2c5a69c: ldr      x0, [x20, #0x28]
  0x2c5a6a0: cbz      x0, #0x2c5ab5c
  0x2c5a6a4: mov      x1, xzr
  0x2c5a6a8: bl       #0x27e036c ; -> CCharacterData$$get_CriticalDMGRate
  0x2c5a6ac: cbz      x21, #0x2c5ab5c
  0x2c5a6b0: str      w0, [x21, #0x40]
  0x2c5a6b4: ldr      x0, [x19, #0x28]
  0x2c5a6b8: cbz      x0, #0x2c5ab5c
  0x2c5a6bc: mov      x1, xzr
  0x2c5a6c0: bl       #0x27e12e4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2c5a6c4: cbz      w0, #0x2c5aa38
  0x2c5a6c8: mov      x0, x19
  0x2c5a6cc: mov      x1, xzr
  0x2c5a6d0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a6d4: cbz      x0, #0x2c5ab5c
  0x2c5a6d8: mov      x21, x0
  0x2c5a6dc: ldr      x0, [x19, #0x28]
  0x2c5a6e0: cbz      x0, #0x2c5ab5c
  0x2c5a6e4: ldr      w22, [x21, #0x40]
  0x2c5a6e8: mov      x1, xzr
  0x2c5a6ec: bl       #0x27e12e4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2c5a6f0: sub      w8, w22, w0
  0x2c5a6f4: b        #0x2c5aa34
  0x2c5a6f8: ldr      x0, [x19, #0x28]
  0x2c5a6fc: cbz      x0, #0x2c5ab5c
  0x2c5a700: mov      x1, xzr
  0x2c5a704: bl       #0x27e0894 ; -> CCharacterData$$get_Avoid
  0x2c5a708: cmp      w0, #1
  0x2c5a70c: b.lt     #0x2c5a728
  0x2c5a710: mov      w21, w0
  0x2c5a714: mov      w1, #0x3e8
  0x2c5a718: mov      w0, wzr
  0x2c5a71c: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x2c5a720: cmp      w0, w21
  0x2c5a724: b.le     #0x2c5a7e8
  0x2c5a728: ldr      x0, [x20, #0x28]
  0x2c5a72c: cbz      x0, #0x2c5ab5c
  0x2c5a730: mov      x1, xzr
  0x2c5a734: bl       #0x27e0290 ; -> CCharacterData$$get_CriticalRate
  0x2c5a738: cmp      w0, #1
  0x2c5a73c: b.lt     #0x2c5a828
  0x2c5a740: mov      w21, w0
  0x2c5a744: mov      w1, #0x3e8
  0x2c5a748: mov      w0, wzr
  0x2c5a74c: bl       #0x2c59ce0 ; -> CFormula$$GetBattleRandomRange
  0x2c5a750: mov      w22, w0
  0x2c5a754: mov      x0, x19
  0x2c5a758: mov      x1, xzr
  0x2c5a75c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a760: cbz      x0, #0x2c5ab5c
  0x2c5a764: cmp      w22, w21
  0x2c5a768: b.gt     #0x2c5a838
  0x2c5a76c: mov      w8, #2
  0x2c5a770: str      w8, [x0, #0x3c]
  0x2c5a774: mov      x0, x19
  0x2c5a778: mov      x1, xzr
  0x2c5a77c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a780: ldr      x8, [x20, #0x28]
  0x2c5a784: cbz      x8, #0x2c5ab5c
  0x2c5a788: mov      x21, x0
  0x2c5a78c: mov      x0, x8
  0x2c5a790: mov      x1, xzr
  0x2c5a794: bl       #0x27e036c ; -> CCharacterData$$get_CriticalDMGRate
  0x2c5a798: cbz      x21, #0x2c5ab5c
  0x2c5a79c: str      w0, [x21, #0x40]
  0x2c5a7a0: ldr      x0, [x19, #0x28]
  0x2c5a7a4: cbz      x0, #0x2c5ab5c
  0x2c5a7a8: mov      x1, xzr
  0x2c5a7ac: bl       #0x27e12e4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2c5a7b0: cbz      w0, #0x2c5a858
  0x2c5a7b4: mov      x0, x19
  0x2c5a7b8: mov      x1, xzr
  0x2c5a7bc: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a7c0: cbz      x0, #0x2c5ab5c
  0x2c5a7c4: mov      x21, x0
  0x2c5a7c8: ldr      x0, [x19, #0x28]
  0x2c5a7cc: cbz      x0, #0x2c5ab5c
  0x2c5a7d0: ldr      w22, [x21, #0x40]
  0x2c5a7d4: mov      x1, xzr
  0x2c5a7d8: bl       #0x27e12e4 ; -> CCharacterData$$get_EnemyCriticalDamageReduce
  0x2c5a7dc: sub      w8, w22, w0
  0x2c5a7e0: str      w8, [x21, #0x40]
  0x2c5a7e4: b        #0x2c5a858
  0x2c5a7e8: adrp     x8, #0x5511000
  0x2c5a7ec: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x2c5a7f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a7f4: ldr      w8, [x0, #0xe0]
  0x2c5a7f8: cbnz     w8, #0x2c5a800
  0x2c5a7fc: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a800: adrp     x8, #0x5551000
  0x2c5a804: ldr      x8, [x8, #0x1e0] ; = 0x0 (u64 @ 0x55511e0)
  0x2c5a808: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a80c: bl       #0x2c4fcb0 ; -> CDebug$$Log
  0x2c5a810: mov      x0, x19
  0x2c5a814: mov      x1, xzr
  0x2c5a818: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a81c: cbz      x0, #0x2c5ab5c
  0x2c5a820: mov      w8, #3
  0x2c5a824: b        #0x2c5a83c
  0x2c5a828: mov      x0, x19
  0x2c5a82c: mov      x1, xzr
  0x2c5a830: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a834: cbz      x0, #0x2c5ab5c
  0x2c5a838: mov      w8, #1
  0x2c5a83c: str      w8, [x0, #0x3c]
  0x2c5a840: mov      x0, x19
  0x2c5a844: mov      x1, xzr
  0x2c5a848: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a84c: cbz      x0, #0x2c5ab5c
  0x2c5a850: mov      w8, #0x3e8
  0x2c5a854: str      w8, [x0, #0x40]
  0x2c5a858: ldrb     w8, [x23, #0x8f3]
  0x2c5a85c: cbnz     w8, #0x2c5a874
  0x2c5a860: adrp     x0, #0x5511000
  0x2c5a864: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a868: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a86c: mov      w8, #1
  0x2c5a870: strb     w8, [x23, #0x8f3]
  0x2c5a874: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a878: ldr      x0, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x2c5a87c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a880: ldr      w9, [x0, #0xe0]
  0x2c5a884: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a888: cbnz     w9, #0x2c5a890
  0x2c5a88c: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a890: mov      x0, x21
  0x2c5a894: mov      x1, xzr
  0x2c5a898: mov      x2, xzr
  0x2c5a89c: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x2c5a8a0: tbz      w0, #0, #0x2c5a940
  0x2c5a8a4: ldrb     w8, [x23, #0x8f3]
  0x2c5a8a8: cbnz     w8, #0x2c5a8c0
  0x2c5a8ac: adrp     x0, #0x5511000
  0x2c5a8b0: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a8b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a8b8: mov      w8, #1
  0x2c5a8bc: strb     w8, [x23, #0x8f3]
  0x2c5a8c0: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a8c4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a8c8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a8cc: cbz      x0, #0x2c5ab5c
  0x2c5a8d0: mov      x1, xzr
  0x2c5a8d4: bl       #0x2548e34 ; -> CDungeonScene$$get_IsWorldBoss
  0x2c5a8d8: tbz      w0, #0, #0x2c5a940
  0x2c5a8dc: ldrb     w8, [x23, #0x8f3]
  0x2c5a8e0: cbnz     w8, #0x2c5a8f8
  0x2c5a8e4: adrp     x0, #0x5511000
  0x2c5a8e8: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a8ec: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a8f0: mov      w8, #1
  0x2c5a8f4: strb     w8, [x23, #0x8f3]
  0x2c5a8f8: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a8fc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a900: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a904: cbz      x8, #0x2c5ab5c
  0x2c5a908: ldrb     w8, [x8, #0x34]
  0x2c5a90c: cbz      w8, #0x2c5a940
  0x2c5a910: mov      x0, x19
  0x2c5a914: mov      x1, xzr
  0x2c5a918: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a91c: cbz      x0, #0x2c5ab5c
  0x2c5a920: mov      w8, #1
  0x2c5a924: str      w8, [x0, #0x3c]
  0x2c5a928: mov      x0, x19
  0x2c5a92c: mov      x1, xzr
  0x2c5a930: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5a934: cbz      x0, #0x2c5ab5c
  0x2c5a938: mov      w8, #0x3e8
  0x2c5a93c: str      w8, [x0, #0x40]
  0x2c5a940: ldrb     w8, [x23, #0x8f3]
  0x2c5a944: cbnz     w8, #0x2c5a95c
  0x2c5a948: adrp     x0, #0x5511000
  0x2c5a94c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a950: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a954: mov      w8, #1
  0x2c5a958: strb     w8, [x23, #0x8f3]
  0x2c5a95c: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a960: ldr      x0, [x25] ; = 0x0 (u64 @ 0x550f000)
  0x2c5a964: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a968: ldr      w9, [x0, #0xe0]
  0x2c5a96c: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a970: cbnz     w9, #0x2c5a978
  0x2c5a974: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5a978: mov      x0, x21
  0x2c5a97c: mov      x1, xzr
  0x2c5a980: mov      x2, xzr
  0x2c5a984: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x2c5a988: tbz      w0, #0, #0x2c5aa38
  0x2c5a98c: ldrb     w8, [x23, #0x8f3]
  0x2c5a990: cbnz     w8, #0x2c5a9a8
  0x2c5a994: adrp     x0, #0x5511000
  0x2c5a998: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a99c: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a9a0: mov      w8, #1
  0x2c5a9a4: strb     w8, [x23, #0x8f3]
  0x2c5a9a8: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a9ac: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a9b0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a9b4: cbz      x0, #0x2c5ab5c
  0x2c5a9b8: mov      x1, xzr
  0x2c5a9bc: bl       #0x2551020 ; -> CDungeonScene$$get_IsIrregularInfiltrate
  0x2c5a9c0: tbz      w0, #0, #0x2c5aa38
  0x2c5a9c4: ldrb     w8, [x23, #0x8f3]
  0x2c5a9c8: cbnz     w8, #0x2c5a9e0
  0x2c5a9cc: adrp     x0, #0x5511000
  0x2c5a9d0: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5a9d4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5a9d8: mov      w8, #1
  0x2c5a9dc: strb     w8, [x23, #0x8f3]
  0x2c5a9e0: ldr      x8, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x2c5a9e4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55510b8)
  0x2c5a9e8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5a9ec: cbz      x8, #0x2c5ab5c
  0x2c5a9f0: ldrb     w8, [x8, #0x38]
  0x2c5a9f4: cbz      w8, #0x2c5aa38
  0x2c5a9f8: mov      x0, x19
  0x2c5a9fc: mov      x1, xzr
  0x2c5aa00: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aa04: cbz      x0, #0x2c5ab5c
  0x2c5aa08: mov      w8, #1
  0x2c5aa0c: str      w8, [x0, #0x3c]
  0x2c5aa10: mov      x0, x19
  0x2c5aa14: mov      x1, xzr
  0x2c5aa18: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aa1c: cbz      x0, #0x2c5ab5c
  0x2c5aa20: mov      w8, #0x3e8
  0x2c5aa24: str      w8, [x0, #0x40]
  0x2c5aa28: b        #0x2c5aa38
  0x2c5aa2c: cbz      x21, #0x2c5ab5c
  0x2c5aa30: mov      w8, #0x3e8
  0x2c5aa34: str      w8, [x21, #0x40]
  0x2c5aa38: add      x1, sp, #0xc
  0x2c5aa3c: mov      x0, x20
  0x2c5aa40: mov      x2, x19
  0x2c5aa44: mov      x3, xzr
  0x2c5aa48: bl       #0x26dd9b4 ; -> CCharacterBattle$$FindBuffAdditionalDamage
  0x2c5aa4c: ldr      w8, [sp, #0xc]
  0x2c5aa50: cbz      w8, #0x2c5aa74
  0x2c5aa54: mov      x0, x19
  0x2c5aa58: mov      x1, xzr
  0x2c5aa5c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aa60: cbz      x0, #0x2c5ab5c
  0x2c5aa64: ldr      w8, [x0, #0x40]
  0x2c5aa68: ldr      w9, [sp, #0xc]
  0x2c5aa6c: add      w8, w9, w8
  0x2c5aa70: str      w8, [x0, #0x40]
  0x2c5aa74: add      x1, sp, #8
  0x2c5aa78: mov      x0, x19
  0x2c5aa7c: mov      x2, x20
  0x2c5aa80: mov      x3, xzr
  0x2c5aa84: bl       #0x26debd8 ; -> CCharacterBattle$$FindBuffDamageReduce
  0x2c5aa88: ldr      w8, [sp, #8]
  0x2c5aa8c: cbz      w8, #0x2c5aab0
  0x2c5aa90: mov      x0, x19
  0x2c5aa94: mov      x1, xzr
  0x2c5aa98: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aa9c: cbz      x0, #0x2c5ab5c
  0x2c5aaa0: ldr      w8, [x0, #0x40]
  0x2c5aaa4: ldr      w9, [sp, #8]
  0x2c5aaa8: sub      w8, w8, w9
  0x2c5aaac: str      w8, [x0, #0x40]
  0x2c5aab0: mov      x0, x19
  0x2c5aab4: mov      x1, xzr
  0x2c5aab8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aabc: cbz      x0, #0x2c5ab5c
  0x2c5aac0: mov      x21, x0
  0x2c5aac4: ldr      x0, [x20, #0x28]
  0x2c5aac8: cbz      x0, #0x2c5ab5c
  0x2c5aacc: ldr      w20, [x21, #0x40]
  0x2c5aad0: mov      x1, xzr
  0x2c5aad4: bl       #0x27e1208 ; -> CCharacterData$$get_DMGBoost
  0x2c5aad8: add      w8, w0, w20
  0x2c5aadc: mov      x0, x19
  0x2c5aae0: mov      x1, xzr
  0x2c5aae4: str      w8, [x21, #0x40]
  0x2c5aae8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5aaec: cbz      x0, #0x2c5ab5c
  0x2c5aaf0: mov      x20, x0
  0x2c5aaf4: ldr      x0, [x19, #0x28]
  0x2c5aaf8: cbz      x0, #0x2c5ab5c
  0x2c5aafc: ldr      w21, [x20, #0x40]
  0x2c5ab00: mov      x1, xzr
  0x2c5ab04: bl       #0x27e01b4 ; -> CCharacterData$$get_DMGReduceRate
  0x2c5ab08: sub      w8, w21, w0
  0x2c5ab0c: mov      x0, x19
  0x2c5ab10: mov      x1, xzr
  0x2c5ab14: str      w8, [x20, #0x40]
  0x2c5ab18: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5ab1c: cbz      x0, #0x2c5ab5c
  0x2c5ab20: ldr      w8, [x0, #0x40]
  0x2c5ab24: cmp      w8, #0x12b
  0x2c5ab28: b.gt     #0x2c5ab44
  0x2c5ab2c: mov      x0, x19
  0x2c5ab30: mov      x1, xzr
  0x2c5ab34: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5ab38: cbz      x0, #0x2c5ab5c
  0x2c5ab3c: mov      w8, #0x12c
  0x2c5ab40: str      w8, [x0, #0x40]
  0x2c5ab44: ldp      x20, x19, [sp, #0x40]
  0x2c5ab48: ldp      x22, x21, [sp, #0x30]
  0x2c5ab4c: ldp      x24, x23, [sp, #0x20]
  0x2c5ab50: ldp      x30, x25, [sp, #0x10]
  0x2c5ab54: add      sp, sp, #0x50
  0x2c5ab58: ret      
  0x2c5ab5c: bl       #0x21849c0 ; -> ??? 0x21849c0
