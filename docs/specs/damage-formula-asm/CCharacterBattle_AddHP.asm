; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_AddHP @ 0x280e4b8..0x280ec9c (taille 2020 octets) =====
  0x280e4b8: sub      sp, sp, #0x70
  0x280e4bc: stp      x29, x30, [sp, #0x10]
  0x280e4c0: stp      x28, x27, [sp, #0x20]
  0x280e4c4: stp      x26, x25, [sp, #0x30]
  0x280e4c8: stp      x24, x23, [sp, #0x40]
  0x280e4cc: stp      x22, x21, [sp, #0x50]
  0x280e4d0: stp      x20, x19, [sp, #0x60]
  0x280e4d4: adrp     x23, #0x59d7000
  0x280e4d8: ldrb     w8, [x23, #0xa3f]
  0x280e4dc: mov      w22, w4
  0x280e4e0: mov      w21, w3
  0x280e4e4: mov      w19, w1
  0x280e4e8: mov      x20, x0
  0x280e4ec: tbnz     w8, #0, #0x280e534
  0x280e4f0: adrp     x0, #0x558a000
  0x280e4f4: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x280e4f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e4fc: adrp     x0, #0x558a000
  0x280e500: ldr      x0, [x0, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x280e504: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e508: adrp     x0, #0x558a000
  0x280e50c: ldr      x0, [x0, #0x7a0] ; = 0x0 (u64 @ 0x558a7a0)
  0x280e510: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e514: adrp     x0, #0x5588000
  0x280e518: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x280e51c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e520: adrp     x0, #0x558a000
  0x280e524: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x280e528: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e52c: mov      w8, #1
  0x280e530: strb     w8, [x23, #0xa3f]
  0x280e534: adrp     x26, #0x558a000
  0x280e538: ldr      x26, [x26, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280e53c: cmp      w19, #1
  0x280e540: adrp     x27, #0x59d4000
  0x280e544: b.lt     #0x280e570
  0x280e548: tbnz     w22, #0, #0x280e570
  0x280e54c: mov      x0, x20
  0x280e550: bl       #0x280ec9c ; -> CCharacterBattle$$FindBuffeReceiveHeal
  0x280e554: cbz      x0, #0x280e708
  0x280e558: mov      w1, #7
  0x280e55c: mov      x0, x20
  0x280e560: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x280e564: cbz      x0, #0x280e5dc
  0x280e568: mov      w19, wzr
  0x280e56c: b        #0x280ebb4
  0x280e570: tbz      w19, #0x1f, #0x280e7d8
  0x280e574: mov      x0, x20
  0x280e578: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x280e57c: cmp      w0, #1
  0x280e580: b.lt     #0x280e63c
  0x280e584: mov      x0, x20
  0x280e588: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x280e58c: adrp     x8, #0x5588000
  0x280e590: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x280e594: mov      w22, w0
  0x280e598: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x280e59c: ldr      w9, [x8, #0xe0]
  0x280e5a0: cbnz     w9, #0x280e5ac
  0x280e5a4: mov      x0, x8
  0x280e5a8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e5ac: cmp      w19, #0
  0x280e5b0: mov      x0, x20
  0x280e5b4: cneg     w23, w19, mi
  0x280e5b8: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x280e5bc: cmp      w22, w23
  0x280e5c0: add      w19, w0, w19
  0x280e5c4: mov      x0, x20
  0x280e5c8: b.le     #0x280e62c
  0x280e5cc: mov      w1, w19
  0x280e5d0: bl       #0x280e3cc ; -> CCharacterBattle$$set_m_nShieldHP
  0x280e5d4: mov      w19, wzr
  0x280e5d8: b        #0x280e63c
  0x280e5dc: mov      w1, #8
  0x280e5e0: mov      x0, x20
  0x280e5e4: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x280e5e8: cbz      x0, #0x280e6bc
  0x280e5ec: mov      x1, xzr
  0x280e5f0: bl       #0x232036c ; -> CBuff$$get_Value
  0x280e5f4: adrp     x8, #0x558a000
  0x280e5f8: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x280e5fc: mov      w22, w0
  0x280e600: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e604: ldr      w9, [x8, #0xe0]
  0x280e608: cbnz     w9, #0x280e614
  0x280e60c: mov      x0, x8
  0x280e610: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e614: mov      w0, w19
  0x280e618: mov      w1, w22
  0x280e61c: mov      x2, xzr
  0x280e620: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x280e624: add      w19, w0, w19
  0x280e628: b        #0x280e708
  0x280e62c: mov      w1, wzr
  0x280e630: bl       #0x280e3cc ; -> CCharacterBattle$$set_m_nShieldHP
  0x280e634: mov      x0, x20
  0x280e638: bl       #0x280ee34 ; -> CCharacterBattle$$RemoveBuffShield
  0x280e63c: ldr      x0, [x20, #0x28]
  0x280e640: cbz      x0, #0x280e7d8
  0x280e644: mov      x1, xzr
  0x280e648: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x280e64c: cmp      w0, #4
  0x280e650: b.lt     #0x280e7d8
  0x280e654: adrp     x8, #0x5588000
  0x280e658: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x280e65c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x280e660: ldr      w8, [x0, #0xe0]
  0x280e664: cbnz     w8, #0x280e66c
  0x280e668: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e66c: adrp     x8, #0x558a000
  0x280e670: ldr      x8, [x8, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x280e674: cmp      w19, #0
  0x280e678: cneg     w22, w19, mi
  0x280e67c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e680: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x280e684: cbz      x0, #0x280ec98
  0x280e688: mov      x1, x20
  0x280e68c: mov      w2, w22
  0x280e690: mov      x3, xzr
  0x280e694: bl       #0x2314bd8 ; -> CBattleManager$$SetBossDamage
  0x280e698: ldr      x0, [x20, #0x378]
  0x280e69c: cbz      x0, #0x280e7d8
  0x280e6a0: mov      x1, xzr
  0x280e6a4: bl       #0x2509a48 ; -> CRageManager$$get_IsRage
  0x280e6a8: tbnz     w0, #0, #0x280e7d8
  0x280e6ac: ldr      w8, [x20, #0x328]
  0x280e6b0: add      w8, w8, w22
  0x280e6b4: str      w8, [x20, #0x328]
  0x280e6b8: b        #0x280e7d8
  0x280e6bc: mov      w1, #9
  0x280e6c0: mov      x0, x20
  0x280e6c4: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x280e6c8: cbz      x0, #0x280e708
  0x280e6cc: mov      x1, xzr
  0x280e6d0: bl       #0x232036c ; -> CBuff$$get_Value
  0x280e6d4: adrp     x8, #0x558a000
  0x280e6d8: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x280e6dc: mov      w22, w0
  0x280e6e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e6e4: ldr      w9, [x8, #0xe0]
  0x280e6e8: cbnz     w9, #0x280e6f4
  0x280e6ec: mov      x0, x8
  0x280e6f0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e6f4: mov      w0, w19
  0x280e6f8: mov      w1, w22
  0x280e6fc: mov      x2, xzr
  0x280e700: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x280e704: sub      w19, w19, w0
  0x280e708: ldrb     w8, [x27, #0xfc3]
  0x280e70c: cbnz     w8, #0x280e724
  0x280e710: adrp     x0, #0x558a000
  0x280e714: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280e718: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280e71c: mov      w8, #1
  0x280e720: strb     w8, [x27, #0xfc3]
  0x280e724: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280e728: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280e72c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e730: cbz      x0, #0x280ec98
  0x280e734: mov      x1, xzr
  0x280e738: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x280e73c: tbz      w0, #0, #0x280e79c
  0x280e740: adrp     x8, #0x558a000
  0x280e744: ldr      x8, [x8, #0x7a0] ; = 0x0 (u64 @ 0x558a7a0)
  0x280e748: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e74c: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x280e750: cbz      x0, #0x280ec98
  0x280e754: mov      x1, xzr
  0x280e758: bl       #0x2558ab0 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x280e75c: cbz      x0, #0x280ec98
  0x280e760: mov      x1, xzr
  0x280e764: bl       #0x25612fc ; -> CPvpRealtimeMatch$$get_FieldSkillReduceReceiveHeal
  0x280e768: adrp     x8, #0x558a000
  0x280e76c: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x280e770: mov      w22, w0
  0x280e774: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e778: ldr      w9, [x8, #0xe0]
  0x280e77c: cbnz     w9, #0x280e788
  0x280e780: mov      x0, x8
  0x280e784: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e788: mov      w0, w19
  0x280e78c: mov      w1, w22
  0x280e790: mov      x2, xzr
  0x280e794: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x280e798: sub      w19, w19, w0
  0x280e79c: mov      w1, #0x39
  0x280e7a0: mov      x0, x20
  0x280e7a4: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x280e7a8: cbz      x0, #0x280e7d8
  0x280e7ac: adrp     x8, #0x558a000
  0x280e7b0: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x280e7b4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e7b8: ldr      w8, [x0, #0xe0]
  0x280e7bc: cbnz     w8, #0x280e7c4
  0x280e7c0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e7c4: mov      w1, #0x1f4
  0x280e7c8: mov      w0, w19
  0x280e7cc: mov      x2, xzr
  0x280e7d0: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x280e7d4: mov      w19, w0
  0x280e7d8: mov      x0, x20
  0x280e7dc: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x280e7e0: ldr      x8, [x20, #0x28]
  0x280e7e4: cbz      x8, #0x280ec98
  0x280e7e8: adrp     x28, #0x558a000
  0x280e7ec: ldr      x28, [x28, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x280e7f0: mov      w22, w0
  0x280e7f4: mov      x0, x8
  0x280e7f8: mov      x1, xzr
  0x280e7fc: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280e800: mov      w8, w0
  0x280e804: ldr      x0, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280e808: add      w9, w22, w19
  0x280e80c: cmp      w9, w8
  0x280e810: csel     w8, w8, w9, gt
  0x280e814: ldr      w10, [x0, #0xe0]
  0x280e818: cmp      w9, #0
  0x280e81c: csel     w22, wzr, w8, lt
  0x280e820: cbnz     w10, #0x280e828
  0x280e824: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e828: mov      w0, w22
  0x280e82c: mov      x1, xzr
  0x280e830: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x280e834: add      x29, x20, #0x31c
  0x280e838: str      w1, [x29, #8]
  0x280e83c: and      x1, x1, #0xffffffff
  0x280e840: mov      x2, xzr
  0x280e844: str      x0, [x29]
  0x280e848: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x280e84c: cbz      w0, #0x280ebd8
  0x280e850: ldr      x0, [x20, #0x28]
  0x280e854: cbz      x0, #0x280e91c
  0x280e858: mov      x1, xzr
  0x280e85c: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x280e860: cmp      w0, #3
  0x280e864: b.lt     #0x280e91c
  0x280e868: ldr      x21, [x20, #0x2d8]
  0x280e86c: cbz      x21, #0x280e8bc
  0x280e870: ldr      x0, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280e874: ldr      x22, [x29]
  0x280e878: ldr      w23, [x20, #0x324]
  0x280e87c: ldr      w8, [x0, #0xe0]
  0x280e880: cbnz     w8, #0x280e888
  0x280e884: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e888: mov      x0, x22
  0x280e88c: mov      x1, x23
  0x280e890: mov      x2, xzr
  0x280e894: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x280e898: mov      w22, w0
  0x280e89c: mov      x0, x20
  0x280e8a0: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x280e8a4: ldr      w3, [x20, #0x30c]
  0x280e8a8: mov      w2, w0
  0x280e8ac: mov      x0, x21
  0x280e8b0: mov      w1, w22
  0x280e8b4: mov      x4, xzr
  0x280e8b8: bl       #0x28e4da4 ; -> CHudBossGauge$$SetHP
  0x280e8bc: ldr      x0, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280e8c0: ldr      x21, [x20, #0x378]
  0x280e8c4: ldr      x22, [x29]
  0x280e8c8: ldr      w23, [x20, #0x324]
  0x280e8cc: ldr      w8, [x0, #0xe0]
  0x280e8d0: cbnz     w8, #0x280e8d8
  0x280e8d4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e8d8: mov      x0, x22
  0x280e8dc: mov      x1, x23
  0x280e8e0: mov      x2, xzr
  0x280e8e4: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x280e8e8: ldr      x8, [x20, #0x28]
  0x280e8ec: cbz      x8, #0x280ec98
  0x280e8f0: mov      w22, w0
  0x280e8f4: mov      x0, x8
  0x280e8f8: mov      x1, xzr
  0x280e8fc: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280e900: cbz      x21, #0x280ec98
  0x280e904: mov      w2, w0
  0x280e908: mov      x0, x21
  0x280e90c: mov      w1, w22
  0x280e910: mov      x3, xzr
  0x280e914: bl       #0x250a0c4 ; -> CRageManager$$CheckRageHP
  0x280e918: b        #0x280e988
  0x280e91c: ldr      x21, [x20, #0x2d0]
  0x280e920: cbz      x21, #0x280e988
  0x280e924: ldr      x0, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280e928: ldr      x22, [x29]
  0x280e92c: ldr      w23, [x20, #0x324]
  0x280e930: ldr      w8, [x0, #0xe0]
  0x280e934: cbnz     w8, #0x280e93c
  0x280e938: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e93c: mov      x0, x22
  0x280e940: mov      x1, x23
  0x280e944: mov      x2, xzr
  0x280e948: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x280e94c: ldr      x8, [x20, #0x28]
  0x280e950: cbz      x8, #0x280ec98
  0x280e954: mov      w22, w0
  0x280e958: mov      x0, x8
  0x280e95c: mov      x1, xzr
  0x280e960: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x280e964: mov      w23, w0
  0x280e968: mov      x0, x20
  0x280e96c: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x280e970: mov      w3, w0
  0x280e974: mov      x0, x21
  0x280e978: mov      w1, w22
  0x280e97c: mov      w2, w23
  0x280e980: mov      x4, xzr
  0x280e984: bl       #0x28de60c ; -> CHeadUI$$SetHP
  0x280e988: ldr      x0, [x20, #0x28]
  0x280e98c: cbz      x0, #0x280eac0
  0x280e990: mov      x1, xzr
  0x280e994: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x280e998: cmp      w0, #4
  0x280e99c: b.lt     #0x280e9f8
  0x280e9a0: adrp     x8, #0x558a000
  0x280e9a4: ldr      x8, [x8, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x280e9a8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280e9ac: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x280e9b0: ldr      x8, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280e9b4: ldr      x23, [x29]
  0x280e9b8: ldr      w22, [x20, #0x324]
  0x280e9bc: mov      x21, x0
  0x280e9c0: ldr      w9, [x8, #0xe0]
  0x280e9c4: cbnz     w9, #0x280e9d0
  0x280e9c8: mov      x0, x8
  0x280e9cc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280e9d0: mov      x0, x23
  0x280e9d4: mov      x1, x22
  0x280e9d8: mov      x2, xzr
  0x280e9dc: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x280e9e0: cbz      x21, #0x280ec98
  0x280e9e4: mov      w2, w0
  0x280e9e8: mov      x0, x21
  0x280e9ec: mov      x1, x20
  0x280e9f0: mov      x3, xzr
  0x280e9f4: bl       #0x2315270 ; -> CBattleManager$$SetLastBossHP
  0x280e9f8: ldr      x0, [x20, #0x28]
  0x280e9fc: cbz      x0, #0x280eac0
  0x280ea00: mov      x1, xzr
  0x280ea04: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x280ea08: cmp      w0, #4
  0x280ea0c: b.lt     #0x280ea58
  0x280ea10: ldrb     w8, [x27, #0xfc3]
  0x280ea14: cbnz     w8, #0x280ea2c
  0x280ea18: adrp     x0, #0x558a000
  0x280ea1c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280ea20: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280ea24: mov      w8, #1
  0x280ea28: strb     w8, [x27, #0xfc3]
  0x280ea2c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280ea30: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280ea34: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280ea38: cbz      x0, #0x280ec98
  0x280ea3c: mov      x1, xzr
  0x280ea40: bl       #0x2595890 ; -> CDungeonScene$$get_IsGuildRaid
  0x280ea44: tbz      w0, #0, #0x280ea58
  0x280ea48: ldr      x0, [x20, #0x2d8]
  0x280ea4c: cbz      x0, #0x280ec98
  0x280ea50: mov      x1, xzr
  0x280ea54: bl       #0x28e780c ; -> CHudBossGauge$$SetGuildRiadHPString
  0x280ea58: ldr      x0, [x20, #0x28]
  0x280ea5c: cbz      x0, #0x280eac0
  0x280ea60: mov      x1, xzr
  0x280ea64: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x280ea68: cmp      w0, #4
  0x280ea6c: b.lt     #0x280eac0
  0x280ea70: ldrb     w8, [x27, #0xfc3]
  0x280ea74: cbnz     w8, #0x280ea8c
  0x280ea78: adrp     x0, #0x558a000
  0x280ea7c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280ea80: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280ea84: mov      w8, #1
  0x280ea88: strb     w8, [x27, #0xfc3]
  0x280ea8c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280ea90: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280ea94: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280ea98: cbz      x8, #0x280ec98
  0x280ea9c: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x558a020)
  0x280eaa0: cbz      x8, #0x280ec98
  0x280eaa4: ldr      w8, [x8, #0xa4]
  0x280eaa8: cmp      w8, #0x17
  0x280eaac: b.ne     #0x280eac0
  0x280eab0: ldr      x0, [x20, #0x2d8]
  0x280eab4: cbz      x0, #0x280ec98
  0x280eab8: mov      x1, xzr
  0x280eabc: bl       #0x28e780c ; -> CHudBossGauge$$SetGuildRiadHPString
  0x280eac0: ldrb     w8, [x27, #0xfc3]
  0x280eac4: cbnz     w8, #0x280eadc
  0x280eac8: adrp     x0, #0x558a000
  0x280eacc: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280ead0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280ead4: mov      w8, #1
  0x280ead8: strb     w8, [x27, #0xfc3]
  0x280eadc: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280eae0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280eae4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280eae8: cbz      x0, #0x280ec98
  0x280eaec: mov      x1, xzr
  0x280eaf0: bl       #0x2595824 ; -> CDungeonScene$$get_IsPvp
  0x280eaf4: tbnz     w0, #0, #0x280eb30
  0x280eaf8: ldrb     w8, [x27, #0xfc3]
  0x280eafc: cbnz     w8, #0x280eb14
  0x280eb00: adrp     x0, #0x558a000
  0x280eb04: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280eb08: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280eb0c: mov      w8, #1
  0x280eb10: strb     w8, [x27, #0xfc3]
  0x280eb14: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280eb18: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280eb1c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280eb20: cbz      x0, #0x280ec98
  0x280eb24: mov      x1, xzr
  0x280eb28: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x280eb2c: tbz      w0, #0, #0x280ebb4
  0x280eb30: ldrb     w8, [x27, #0xfc3]
  0x280eb34: cbnz     w8, #0x280eb4c
  0x280eb38: adrp     x0, #0x558a000
  0x280eb3c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280eb40: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280eb44: mov      w8, #1
  0x280eb48: strb     w8, [x27, #0xfc3]
  0x280eb4c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280eb50: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280eb54: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280eb58: cbz      x0, #0x280ec98
  0x280eb5c: mov      x1, xzr
  0x280eb60: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x280eb64: tbz      w0, #0, #0x280eb7c
  0x280eb68: mov      x0, xzr
  0x280eb6c: bl       #0x2553390 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x280eb70: cbz      x0, #0x280ec98
  0x280eb74: ldrb     w8, [x0, #0xd4]
  0x280eb78: cbz      w8, #0x280ebb4
  0x280eb7c: ldrb     w8, [x27, #0xfc3]
  0x280eb80: cbnz     w8, #0x280eb98
  0x280eb84: adrp     x0, #0x558a000
  0x280eb88: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x280eb8c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x280eb90: mov      w8, #1
  0x280eb94: strb     w8, [x27, #0xfc3]
  0x280eb98: ldr      x8, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x280eb9c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x280eba0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x280eba4: cbz      x0, #0x280ec98
  0x280eba8: ldr      w1, [x20, #0x21c]
  0x280ebac: mov      x2, xzr
  0x280ebb0: bl       #0x259f678 ; -> CDungeonScene$$UpdatePvpTeamHp
  0x280ebb4: mov      w0, w19
  0x280ebb8: ldp      x20, x19, [sp, #0x60]
  0x280ebbc: ldp      x22, x21, [sp, #0x50]
  0x280ebc0: ldp      x24, x23, [sp, #0x40]
  0x280ebc4: ldp      x26, x25, [sp, #0x30]
  0x280ebc8: ldp      x28, x27, [sp, #0x20]
  0x280ebcc: ldp      x29, x30, [sp, #0x10]
  0x280ebd0: add      sp, sp, #0x70
  0x280ebd4: ret      
  0x280ebd8: mov      w1, #0x74
  0x280ebdc: mov      x0, x20
  0x280ebe0: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x280ebe4: cbz      x0, #0x280e850
  0x280ebe8: tbnz     w21, #0, #0x280e850
  0x280ebec: mov      x22, x0
  0x280ebf0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x280ebf4: ldr      w8, [x0, #0xe0]
  0x280ebf8: cbnz     w8, #0x280ec00
  0x280ebfc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x280ec00: mov      w0, #1
  0x280ec04: mov      x1, xzr
  0x280ec08: bl       #0x2cb1944 ; -> SVAInt$$op_Implicit
  0x280ec0c: str      x0, [x29]
  0x280ec10: str      w1, [x20, #0x324]
  0x280ec14: ldrb     w8, [x22, #0x3c]
  0x280ec18: cbnz     w8, #0x280e850
  0x280ec1c: mov      x0, x22
  0x280ec20: mov      x1, xzr
  0x280ec24: bl       #0x232047c ; -> CBuff$$get_ActivateEffect
  0x280ec28: mov      x21, x0
  0x280ec2c: mov      x0, x22
  0x280ec30: mov      x1, xzr
  0x280ec34: bl       #0x2320498 ; -> CBuff$$get_ActivateText
  0x280ec38: mov      x23, x0
  0x280ec3c: mov      x0, x22
  0x280ec40: mov      x1, xzr
  0x280ec44: bl       #0x2320244 ; -> CBuff$$get_IsDebuff
  0x280ec48: mov      w24, w0
  0x280ec4c: mov      x0, x22
  0x280ec50: mov      x1, xzr
  0x280ec54: bl       #0x23202c4 ; -> CBuff$$get_IsEquip
  0x280ec58: mov      w25, w0
  0x280ec5c: mov      x0, x22
  0x280ec60: mov      x1, xzr
  0x280ec64: bl       #0x2320260 ; -> CBuff$$get_IsEquipDebuff
  0x280ec68: ldr      w7, [x22, #0x30]
  0x280ec6c: and      w4, w24, #1
  0x280ec70: and      w5, w25, #1
  0x280ec74: and      w6, w0, #1
  0x280ec78: mov      x0, x20
  0x280ec7c: mov      x1, x21
  0x280ec80: mov      x2, x20
  0x280ec84: mov      x3, x23
  0x280ec88: bl       #0x280ee60 ; -> CCharacterBattle$$PlayBuffEffect
  0x280ec8c: mov      w8, #1
  0x280ec90: strb     w8, [x22, #0x3c]
  0x280ec94: b        #0x280e850
  0x280ec98: bl       #0x21afc18 ; -> ??? 0x21afc18
