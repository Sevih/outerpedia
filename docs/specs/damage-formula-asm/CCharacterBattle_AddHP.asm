; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_AddHP @ 0x2815438..0x2815c1c (taille 2020 octets) =====
  0x2815438: sub      sp, sp, #0x70
  0x281543c: stp      x29, x30, [sp, #0x10]
  0x2815440: stp      x28, x27, [sp, #0x20]
  0x2815444: stp      x26, x25, [sp, #0x30]
  0x2815448: stp      x24, x23, [sp, #0x40]
  0x281544c: stp      x22, x21, [sp, #0x50]
  0x2815450: stp      x20, x19, [sp, #0x60]
  0x2815454: adrp     x23, #0x59e7000
  0x2815458: ldrb     w8, [x23, #0x65e]
  0x281545c: mov      w22, w4
  0x2815460: mov      w21, w3
  0x2815464: mov      w19, w1
  0x2815468: mov      x20, x0
  0x281546c: tbnz     w8, #0, #0x28154b4
  0x2815470: adrp     x0, #0x5599000
  0x2815474: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2815478: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x281547c: adrp     x0, #0x5598000
  0x2815480: ldr      x0, [x0, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x2815484: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815488: adrp     x0, #0x5599000
  0x281548c: ldr      x0, [x0, #0x2b0] ; = 0x0 (u64 @ 0x55992b0)
  0x2815490: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815494: adrp     x0, #0x5597000
  0x2815498: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x281549c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x28154a0: adrp     x0, #0x5599000
  0x28154a4: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x28154a8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x28154ac: mov      w8, #1
  0x28154b0: strb     w8, [x23, #0x65e]
  0x28154b4: adrp     x26, #0x5598000
  0x28154b8: ldr      x26, [x26, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x28154bc: cmp      w19, #1
  0x28154c0: adrp     x27, #0x59e4000
  0x28154c4: b.lt     #0x28154f0
  0x28154c8: tbnz     w22, #0, #0x28154f0
  0x28154cc: mov      x0, x20
  0x28154d0: bl       #0x2815c1c ; -> CCharacterBattle$$FindBuffeReceiveHeal
  0x28154d4: cbz      x0, #0x2815688
  0x28154d8: mov      w1, #7
  0x28154dc: mov      x0, x20
  0x28154e0: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x28154e4: cbz      x0, #0x281555c
  0x28154e8: mov      w19, wzr
  0x28154ec: b        #0x2815b34
  0x28154f0: tbz      w19, #0x1f, #0x2815758
  0x28154f4: mov      x0, x20
  0x28154f8: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x28154fc: cmp      w0, #1
  0x2815500: b.lt     #0x28155bc
  0x2815504: mov      x0, x20
  0x2815508: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x281550c: adrp     x8, #0x5597000
  0x2815510: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2815514: mov      w22, w0
  0x2815518: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x281551c: ldr      w9, [x8, #0xe0]
  0x2815520: cbnz     w9, #0x281552c
  0x2815524: mov      x0, x8
  0x2815528: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x281552c: cmp      w19, #0
  0x2815530: mov      x0, x20
  0x2815534: cneg     w23, w19, mi
  0x2815538: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x281553c: cmp      w22, w23
  0x2815540: add      w19, w0, w19
  0x2815544: mov      x0, x20
  0x2815548: b.le     #0x28155ac
  0x281554c: mov      w1, w19
  0x2815550: bl       #0x281534c ; -> CCharacterBattle$$set_m_nShieldHP
  0x2815554: mov      w19, wzr
  0x2815558: b        #0x28155bc
  0x281555c: mov      w1, #8
  0x2815560: mov      x0, x20
  0x2815564: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2815568: cbz      x0, #0x281563c
  0x281556c: mov      x1, xzr
  0x2815570: bl       #0x232548c ; -> CBuff$$get_Value
  0x2815574: adrp     x8, #0x5599000
  0x2815578: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x281557c: mov      w22, w0
  0x2815580: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2815584: ldr      w9, [x8, #0xe0]
  0x2815588: cbnz     w9, #0x2815594
  0x281558c: mov      x0, x8
  0x2815590: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815594: mov      w0, w19
  0x2815598: mov      w1, w22
  0x281559c: mov      x2, xzr
  0x28155a0: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x28155a4: add      w19, w0, w19
  0x28155a8: b        #0x2815688
  0x28155ac: mov      w1, wzr
  0x28155b0: bl       #0x281534c ; -> CCharacterBattle$$set_m_nShieldHP
  0x28155b4: mov      x0, x20
  0x28155b8: bl       #0x2815db4 ; -> CCharacterBattle$$RemoveBuffShield
  0x28155bc: ldr      x0, [x20, #0x28]
  0x28155c0: cbz      x0, #0x2815758
  0x28155c4: mov      x1, xzr
  0x28155c8: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x28155cc: cmp      w0, #4
  0x28155d0: b.lt     #0x2815758
  0x28155d4: adrp     x8, #0x5597000
  0x28155d8: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x28155dc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x28155e0: ldr      w8, [x0, #0xe0]
  0x28155e4: cbnz     w8, #0x28155ec
  0x28155e8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x28155ec: adrp     x8, #0x5598000
  0x28155f0: ldr      x8, [x8, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x28155f4: cmp      w19, #0
  0x28155f8: cneg     w22, w19, mi
  0x28155fc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815600: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2815604: cbz      x0, #0x2815c18
  0x2815608: mov      x1, x20
  0x281560c: mov      w2, w22
  0x2815610: mov      x3, xzr
  0x2815614: bl       #0x2319cf8 ; -> CBattleManager$$SetBossDamage
  0x2815618: ldr      x0, [x20, #0x378]
  0x281561c: cbz      x0, #0x2815758
  0x2815620: mov      x1, xzr
  0x2815624: bl       #0x250b4dc ; -> CRageManager$$get_IsRage
  0x2815628: tbnz     w0, #0, #0x2815758
  0x281562c: ldr      w8, [x20, #0x328]
  0x2815630: add      w8, w8, w22
  0x2815634: str      w8, [x20, #0x328]
  0x2815638: b        #0x2815758
  0x281563c: mov      w1, #9
  0x2815640: mov      x0, x20
  0x2815644: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2815648: cbz      x0, #0x2815688
  0x281564c: mov      x1, xzr
  0x2815650: bl       #0x232548c ; -> CBuff$$get_Value
  0x2815654: adrp     x8, #0x5599000
  0x2815658: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x281565c: mov      w22, w0
  0x2815660: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2815664: ldr      w9, [x8, #0xe0]
  0x2815668: cbnz     w9, #0x2815674
  0x281566c: mov      x0, x8
  0x2815670: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815674: mov      w0, w19
  0x2815678: mov      w1, w22
  0x281567c: mov      x2, xzr
  0x2815680: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2815684: sub      w19, w19, w0
  0x2815688: ldrb     w8, [x27, #0xbd3]
  0x281568c: cbnz     w8, #0x28156a4
  0x2815690: adrp     x0, #0x5598000
  0x2815694: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815698: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x281569c: mov      w8, #1
  0x28156a0: strb     w8, [x27, #0xbd3]
  0x28156a4: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x28156a8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55990b8)
  0x28156ac: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x28156b0: cbz      x0, #0x2815c18
  0x28156b4: mov      x1, xzr
  0x28156b8: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x28156bc: tbz      w0, #0, #0x281571c
  0x28156c0: adrp     x8, #0x5599000
  0x28156c4: ldr      x8, [x8, #0x2b0] ; = 0x0 (u64 @ 0x55992b0)
  0x28156c8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x28156cc: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x28156d0: cbz      x0, #0x2815c18
  0x28156d4: mov      x1, xzr
  0x28156d8: bl       #0x255f0c8 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x28156dc: cbz      x0, #0x2815c18
  0x28156e0: mov      x1, xzr
  0x28156e4: bl       #0x2567914 ; -> CPvpRealtimeMatch$$get_FieldSkillReduceReceiveHeal
  0x28156e8: adrp     x8, #0x5599000
  0x28156ec: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x28156f0: mov      w22, w0
  0x28156f4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x28156f8: ldr      w9, [x8, #0xe0]
  0x28156fc: cbnz     w9, #0x2815708
  0x2815700: mov      x0, x8
  0x2815704: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815708: mov      w0, w19
  0x281570c: mov      w1, w22
  0x2815710: mov      x2, xzr
  0x2815714: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2815718: sub      w19, w19, w0
  0x281571c: mov      w1, #0x39
  0x2815720: mov      x0, x20
  0x2815724: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2815728: cbz      x0, #0x2815758
  0x281572c: adrp     x8, #0x5599000
  0x2815730: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2815734: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2815738: ldr      w8, [x0, #0xe0]
  0x281573c: cbnz     w8, #0x2815744
  0x2815740: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815744: mov      w1, #0x1f4
  0x2815748: mov      w0, w19
  0x281574c: mov      x2, xzr
  0x2815750: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2815754: mov      w19, w0
  0x2815758: mov      x0, x20
  0x281575c: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x2815760: ldr      x8, [x20, #0x28]
  0x2815764: cbz      x8, #0x2815c18
  0x2815768: adrp     x28, #0x5599000
  0x281576c: ldr      x28, [x28, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2815770: mov      w22, w0
  0x2815774: mov      x0, x8
  0x2815778: mov      x1, xzr
  0x281577c: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2815780: mov      w8, w0
  0x2815784: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2815788: add      w9, w22, w19
  0x281578c: cmp      w9, w8
  0x2815790: csel     w8, w8, w9, gt
  0x2815794: ldr      w10, [x0, #0xe0]
  0x2815798: cmp      w9, #0
  0x281579c: csel     w22, wzr, w8, lt
  0x28157a0: cbnz     w10, #0x28157a8
  0x28157a4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x28157a8: mov      w0, w22
  0x28157ac: mov      x1, xzr
  0x28157b0: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x28157b4: add      x29, x20, #0x31c
  0x28157b8: str      w1, [x29, #8]
  0x28157bc: and      x1, x1, #0xffffffff
  0x28157c0: mov      x2, xzr
  0x28157c4: str      x0, [x29]
  0x28157c8: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x28157cc: cbz      w0, #0x2815b58
  0x28157d0: ldr      x0, [x20, #0x28]
  0x28157d4: cbz      x0, #0x281589c
  0x28157d8: mov      x1, xzr
  0x28157dc: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x28157e0: cmp      w0, #3
  0x28157e4: b.lt     #0x281589c
  0x28157e8: ldr      x21, [x20, #0x2d8]
  0x28157ec: cbz      x21, #0x281583c
  0x28157f0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x28157f4: ldr      x22, [x29]
  0x28157f8: ldr      w23, [x20, #0x324]
  0x28157fc: ldr      w8, [x0, #0xe0]
  0x2815800: cbnz     w8, #0x2815808
  0x2815804: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815808: mov      x0, x22
  0x281580c: mov      x1, x23
  0x2815810: mov      x2, xzr
  0x2815814: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2815818: mov      w22, w0
  0x281581c: mov      x0, x20
  0x2815820: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x2815824: ldr      w3, [x20, #0x30c]
  0x2815828: mov      w2, w0
  0x281582c: mov      x0, x21
  0x2815830: mov      w1, w22
  0x2815834: mov      x4, xzr
  0x2815838: bl       #0x28ebfb0 ; -> CHudBossGauge$$SetHP
  0x281583c: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2815840: ldr      x21, [x20, #0x378]
  0x2815844: ldr      x22, [x29]
  0x2815848: ldr      w23, [x20, #0x324]
  0x281584c: ldr      w8, [x0, #0xe0]
  0x2815850: cbnz     w8, #0x2815858
  0x2815854: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815858: mov      x0, x22
  0x281585c: mov      x1, x23
  0x2815860: mov      x2, xzr
  0x2815864: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2815868: ldr      x8, [x20, #0x28]
  0x281586c: cbz      x8, #0x2815c18
  0x2815870: mov      w22, w0
  0x2815874: mov      x0, x8
  0x2815878: mov      x1, xzr
  0x281587c: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2815880: cbz      x21, #0x2815c18
  0x2815884: mov      w2, w0
  0x2815888: mov      x0, x21
  0x281588c: mov      w1, w22
  0x2815890: mov      x3, xzr
  0x2815894: bl       #0x250bb58 ; -> CRageManager$$CheckRageHP
  0x2815898: b        #0x2815908
  0x281589c: ldr      x21, [x20, #0x2d0]
  0x28158a0: cbz      x21, #0x2815908
  0x28158a4: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x28158a8: ldr      x22, [x29]
  0x28158ac: ldr      w23, [x20, #0x324]
  0x28158b0: ldr      w8, [x0, #0xe0]
  0x28158b4: cbnz     w8, #0x28158bc
  0x28158b8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x28158bc: mov      x0, x22
  0x28158c0: mov      x1, x23
  0x28158c4: mov      x2, xzr
  0x28158c8: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x28158cc: ldr      x8, [x20, #0x28]
  0x28158d0: cbz      x8, #0x2815c18
  0x28158d4: mov      w22, w0
  0x28158d8: mov      x0, x8
  0x28158dc: mov      x1, xzr
  0x28158e0: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x28158e4: mov      w23, w0
  0x28158e8: mov      x0, x20
  0x28158ec: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x28158f0: mov      w3, w0
  0x28158f4: mov      x0, x21
  0x28158f8: mov      w1, w22
  0x28158fc: mov      w2, w23
  0x2815900: mov      x4, xzr
  0x2815904: bl       #0x28e5818 ; -> CHeadUI$$SetHP
  0x2815908: ldr      x0, [x20, #0x28]
  0x281590c: cbz      x0, #0x2815a40
  0x2815910: mov      x1, xzr
  0x2815914: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x2815918: cmp      w0, #4
  0x281591c: b.lt     #0x2815978
  0x2815920: adrp     x8, #0x5598000
  0x2815924: ldr      x8, [x8, #0xe68] ; = 0x0 (u64 @ 0x5598e68)
  0x2815928: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x281592c: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2815930: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2815934: ldr      x23, [x29]
  0x2815938: ldr      w22, [x20, #0x324]
  0x281593c: mov      x21, x0
  0x2815940: ldr      w9, [x8, #0xe0]
  0x2815944: cbnz     w9, #0x2815950
  0x2815948: mov      x0, x8
  0x281594c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815950: mov      x0, x23
  0x2815954: mov      x1, x22
  0x2815958: mov      x2, xzr
  0x281595c: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2815960: cbz      x21, #0x2815c18
  0x2815964: mov      w2, w0
  0x2815968: mov      x0, x21
  0x281596c: mov      x1, x20
  0x2815970: mov      x3, xzr
  0x2815974: bl       #0x231a390 ; -> CBattleManager$$SetLastBossHP
  0x2815978: ldr      x0, [x20, #0x28]
  0x281597c: cbz      x0, #0x2815a40
  0x2815980: mov      x1, xzr
  0x2815984: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x2815988: cmp      w0, #4
  0x281598c: b.lt     #0x28159d8
  0x2815990: ldrb     w8, [x27, #0xbd3]
  0x2815994: cbnz     w8, #0x28159ac
  0x2815998: adrp     x0, #0x5598000
  0x281599c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x28159a0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x28159a4: mov      w8, #1
  0x28159a8: strb     w8, [x27, #0xbd3]
  0x28159ac: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x28159b0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x28159b4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x28159b8: cbz      x0, #0x2815c18
  0x28159bc: mov      x1, xzr
  0x28159c0: bl       #0x259bea8 ; -> CDungeonScene$$get_IsGuildRaid
  0x28159c4: tbz      w0, #0, #0x28159d8
  0x28159c8: ldr      x0, [x20, #0x2d8]
  0x28159cc: cbz      x0, #0x2815c18
  0x28159d0: mov      x1, xzr
  0x28159d4: bl       #0x28eea18 ; -> CHudBossGauge$$SetGuildRiadHPString
  0x28159d8: ldr      x0, [x20, #0x28]
  0x28159dc: cbz      x0, #0x2815a40
  0x28159e0: mov      x1, xzr
  0x28159e4: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x28159e8: cmp      w0, #4
  0x28159ec: b.lt     #0x2815a40
  0x28159f0: ldrb     w8, [x27, #0xbd3]
  0x28159f4: cbnz     w8, #0x2815a0c
  0x28159f8: adrp     x0, #0x5598000
  0x28159fc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815a00: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815a04: mov      w8, #1
  0x2815a08: strb     w8, [x27, #0xbd3]
  0x2815a0c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2815a10: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2815a14: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815a18: cbz      x8, #0x2815c18
  0x2815a1c: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x5598020)
  0x2815a20: cbz      x8, #0x2815c18
  0x2815a24: ldr      w8, [x8, #0xa4]
  0x2815a28: cmp      w8, #0x17
  0x2815a2c: b.ne     #0x2815a40
  0x2815a30: ldr      x0, [x20, #0x2d8]
  0x2815a34: cbz      x0, #0x2815c18
  0x2815a38: mov      x1, xzr
  0x2815a3c: bl       #0x28eea18 ; -> CHudBossGauge$$SetGuildRiadHPString
  0x2815a40: ldrb     w8, [x27, #0xbd3]
  0x2815a44: cbnz     w8, #0x2815a5c
  0x2815a48: adrp     x0, #0x5598000
  0x2815a4c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815a50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815a54: mov      w8, #1
  0x2815a58: strb     w8, [x27, #0xbd3]
  0x2815a5c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2815a60: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2815a64: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815a68: cbz      x0, #0x2815c18
  0x2815a6c: mov      x1, xzr
  0x2815a70: bl       #0x259be3c ; -> CDungeonScene$$get_IsPvp
  0x2815a74: tbnz     w0, #0, #0x2815ab0
  0x2815a78: ldrb     w8, [x27, #0xbd3]
  0x2815a7c: cbnz     w8, #0x2815a94
  0x2815a80: adrp     x0, #0x5598000
  0x2815a84: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815a88: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815a8c: mov      w8, #1
  0x2815a90: strb     w8, [x27, #0xbd3]
  0x2815a94: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2815a98: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2815a9c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815aa0: cbz      x0, #0x2815c18
  0x2815aa4: mov      x1, xzr
  0x2815aa8: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x2815aac: tbz      w0, #0, #0x2815b34
  0x2815ab0: ldrb     w8, [x27, #0xbd3]
  0x2815ab4: cbnz     w8, #0x2815acc
  0x2815ab8: adrp     x0, #0x5598000
  0x2815abc: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815ac0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815ac4: mov      w8, #1
  0x2815ac8: strb     w8, [x27, #0xbd3]
  0x2815acc: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2815ad0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2815ad4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815ad8: cbz      x0, #0x2815c18
  0x2815adc: mov      x1, xzr
  0x2815ae0: bl       #0x259bf18 ; -> CDungeonScene$$get_IsPvpRealtime
  0x2815ae4: tbz      w0, #0, #0x2815afc
  0x2815ae8: mov      x0, xzr
  0x2815aec: bl       #0x25599a8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x2815af0: cbz      x0, #0x2815c18
  0x2815af4: ldrb     w8, [x0, #0xd4]
  0x2815af8: cbz      w8, #0x2815b34
  0x2815afc: ldrb     w8, [x27, #0xbd3]
  0x2815b00: cbnz     w8, #0x2815b18
  0x2815b04: adrp     x0, #0x5598000
  0x2815b08: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2815b0c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2815b10: mov      w8, #1
  0x2815b14: strb     w8, [x27, #0xbd3]
  0x2815b18: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2815b1c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2815b20: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2815b24: cbz      x0, #0x2815c18
  0x2815b28: ldr      w1, [x20, #0x21c]
  0x2815b2c: mov      x2, xzr
  0x2815b30: bl       #0x25a5ff0 ; -> CDungeonScene$$UpdatePvpTeamHp
  0x2815b34: mov      w0, w19
  0x2815b38: ldp      x20, x19, [sp, #0x60]
  0x2815b3c: ldp      x22, x21, [sp, #0x50]
  0x2815b40: ldp      x24, x23, [sp, #0x40]
  0x2815b44: ldp      x26, x25, [sp, #0x30]
  0x2815b48: ldp      x28, x27, [sp, #0x20]
  0x2815b4c: ldp      x29, x30, [sp, #0x10]
  0x2815b50: add      sp, sp, #0x70
  0x2815b54: ret      
  0x2815b58: mov      w1, #0x74
  0x2815b5c: mov      x0, x20
  0x2815b60: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x2815b64: cbz      x0, #0x28157d0
  0x2815b68: tbnz     w21, #0, #0x28157d0
  0x2815b6c: mov      x22, x0
  0x2815b70: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2815b74: ldr      w8, [x0, #0xe0]
  0x2815b78: cbnz     w8, #0x2815b80
  0x2815b7c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2815b80: mov      w0, #1
  0x2815b84: mov      x1, xzr
  0x2815b88: bl       #0x2cc0378 ; -> SVAInt$$op_Implicit
  0x2815b8c: str      x0, [x29]
  0x2815b90: str      w1, [x20, #0x324]
  0x2815b94: ldrb     w8, [x22, #0x3c]
  0x2815b98: cbnz     w8, #0x28157d0
  0x2815b9c: mov      x0, x22
  0x2815ba0: mov      x1, xzr
  0x2815ba4: bl       #0x232559c ; -> CBuff$$get_ActivateEffect
  0x2815ba8: mov      x21, x0
  0x2815bac: mov      x0, x22
  0x2815bb0: mov      x1, xzr
  0x2815bb4: bl       #0x23255b8 ; -> CBuff$$get_ActivateText
  0x2815bb8: mov      x23, x0
  0x2815bbc: mov      x0, x22
  0x2815bc0: mov      x1, xzr
  0x2815bc4: bl       #0x2325364 ; -> CBuff$$get_IsDebuff
  0x2815bc8: mov      w24, w0
  0x2815bcc: mov      x0, x22
  0x2815bd0: mov      x1, xzr
  0x2815bd4: bl       #0x23253e4 ; -> CBuff$$get_IsEquip
  0x2815bd8: mov      w25, w0
  0x2815bdc: mov      x0, x22
  0x2815be0: mov      x1, xzr
  0x2815be4: bl       #0x2325380 ; -> CBuff$$get_IsEquipDebuff
  0x2815be8: ldr      w7, [x22, #0x30]
  0x2815bec: and      w4, w24, #1
  0x2815bf0: and      w5, w25, #1
  0x2815bf4: and      w6, w0, #1
  0x2815bf8: mov      x0, x20
  0x2815bfc: mov      x1, x21
  0x2815c00: mov      x2, x20
  0x2815c04: mov      x3, x23
  0x2815c08: bl       #0x2815de0 ; -> CCharacterBattle$$PlayBuffEffect
  0x2815c0c: mov      w8, #1
  0x2815c10: strb     w8, [x22, #0x3c]
  0x2815c14: b        #0x28157d0
  0x2815c18: bl       #0x21b4d20 ; -> ??? 0x21b4d20
