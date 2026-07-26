; ===== CCharacterBattle_AddHP @ 0x26c5fd8..0x26c67bc (taille 2020 octets) =====
  0x26c5fd8: sub      sp, sp, #0x70
  0x26c5fdc: stp      x29, x30, [sp, #0x10]
  0x26c5fe0: stp      x28, x27, [sp, #0x20]
  0x26c5fe4: stp      x26, x25, [sp, #0x30]
  0x26c5fe8: stp      x24, x23, [sp, #0x40]
  0x26c5fec: stp      x22, x21, [sp, #0x50]
  0x26c5ff0: stp      x20, x19, [sp, #0x60]
  0x26c5ff4: adrp     x23, #0x5957000
  0x26c5ff8: ldrb     w8, [x23, #0xae7]
  0x26c5ffc: mov      w22, w4
  0x26c6000: mov      w21, w3
  0x26c6004: mov      w19, w1
  0x26c6008: mov      x20, x0
  0x26c600c: tbnz     w8, #0, #0x26c6054
  0x26c6010: adrp     x0, #0x5511000
  0x26c6014: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26c6018: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c601c: adrp     x0, #0x5511000
  0x26c6020: ldr      x0, [x0, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x26c6024: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c6028: adrp     x0, #0x5511000
  0x26c602c: ldr      x0, [x0, #0xd68] ; = 0x0 (u64 @ 0x5511d68)
  0x26c6030: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c6034: adrp     x0, #0x550f000
  0x26c6038: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x26c603c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c6040: adrp     x0, #0x5511000
  0x26c6044: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x26c6048: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c604c: mov      w8, #1
  0x26c6050: strb     w8, [x23, #0xae7]
  0x26c6054: adrp     x26, #0x5511000
  0x26c6058: ldr      x26, [x26, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c605c: cmp      w19, #1
  0x26c6060: adrp     x27, #0x5955000
  0x26c6064: b.lt     #0x26c6090
  0x26c6068: tbnz     w22, #0, #0x26c6090
  0x26c606c: mov      x0, x20
  0x26c6070: bl       #0x26c67bc ; -> CCharacterBattle$$FindBuffeReceiveHeal
  0x26c6074: cbz      x0, #0x26c6228
  0x26c6078: mov      w1, #7
  0x26c607c: mov      x0, x20
  0x26c6080: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26c6084: cbz      x0, #0x26c60fc
  0x26c6088: mov      w19, wzr
  0x26c608c: b        #0x26c66d4
  0x26c6090: tbz      w19, #0x1f, #0x26c62f8
  0x26c6094: mov      x0, x20
  0x26c6098: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c609c: cmp      w0, #1
  0x26c60a0: b.lt     #0x26c615c
  0x26c60a4: mov      x0, x20
  0x26c60a8: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c60ac: adrp     x8, #0x550f000
  0x26c60b0: ldr      x8, [x8, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x26c60b4: mov      w22, w0
  0x26c60b8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26c60bc: ldr      w9, [x8, #0xe0]
  0x26c60c0: cbnz     w9, #0x26c60cc
  0x26c60c4: mov      x0, x8
  0x26c60c8: bl       #0x218489c ; -> ??? 0x218489c
  0x26c60cc: cmp      w19, #0
  0x26c60d0: mov      x0, x20
  0x26c60d4: cneg     w23, w19, mi
  0x26c60d8: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c60dc: cmp      w22, w23
  0x26c60e0: add      w19, w0, w19
  0x26c60e4: mov      x0, x20
  0x26c60e8: b.le     #0x26c614c
  0x26c60ec: mov      w1, w19
  0x26c60f0: bl       #0x26c5eec ; -> CCharacterBattle$$set_m_nShieldHP
  0x26c60f4: mov      w19, wzr
  0x26c60f8: b        #0x26c615c
  0x26c60fc: mov      w1, #8
  0x26c6100: mov      x0, x20
  0x26c6104: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26c6108: cbz      x0, #0x26c61dc
  0x26c610c: mov      x1, xzr
  0x26c6110: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26c6114: adrp     x8, #0x5511000
  0x26c6118: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26c611c: mov      w22, w0
  0x26c6120: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6124: ldr      w9, [x8, #0xe0]
  0x26c6128: cbnz     w9, #0x26c6134
  0x26c612c: mov      x0, x8
  0x26c6130: bl       #0x218489c ; -> ??? 0x218489c
  0x26c6134: mov      w0, w19
  0x26c6138: mov      w1, w22
  0x26c613c: mov      x2, xzr
  0x26c6140: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x26c6144: add      w19, w0, w19
  0x26c6148: b        #0x26c6228
  0x26c614c: mov      w1, wzr
  0x26c6150: bl       #0x26c5eec ; -> CCharacterBattle$$set_m_nShieldHP
  0x26c6154: mov      x0, x20
  0x26c6158: bl       #0x26c6954 ; -> CCharacterBattle$$RemoveBuffShield
  0x26c615c: ldr      x0, [x20, #0x28]
  0x26c6160: cbz      x0, #0x26c62f8
  0x26c6164: mov      x1, xzr
  0x26c6168: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c616c: cmp      w0, #4
  0x26c6170: b.lt     #0x26c62f8
  0x26c6174: adrp     x8, #0x550f000
  0x26c6178: ldr      x8, [x8, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x26c617c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x26c6180: ldr      w8, [x0, #0xe0]
  0x26c6184: cbnz     w8, #0x26c618c
  0x26c6188: bl       #0x218489c ; -> ??? 0x218489c
  0x26c618c: adrp     x8, #0x5511000
  0x26c6190: ldr      x8, [x8, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x26c6194: cmp      w19, #0
  0x26c6198: cneg     w22, w19, mi
  0x26c619c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c61a0: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x26c61a4: cbz      x0, #0x26c67b8
  0x26c61a8: mov      x1, x20
  0x26c61ac: mov      w2, w22
  0x26c61b0: mov      x3, xzr
  0x26c61b4: bl       #0x22e93f4 ; -> CBattleManager$$SetBossDamage
  0x26c61b8: ldr      x0, [x20, #0x378]
  0x26c61bc: cbz      x0, #0x26c62f8
  0x26c61c0: mov      x1, xzr
  0x26c61c4: bl       #0x24cc7b8 ; -> CRageManager$$get_IsRage
  0x26c61c8: tbnz     w0, #0, #0x26c62f8
  0x26c61cc: ldr      w8, [x20, #0x328]
  0x26c61d0: add      w8, w8, w22
  0x26c61d4: str      w8, [x20, #0x328]
  0x26c61d8: b        #0x26c62f8
  0x26c61dc: mov      w1, #9
  0x26c61e0: mov      x0, x20
  0x26c61e4: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26c61e8: cbz      x0, #0x26c6228
  0x26c61ec: mov      x1, xzr
  0x26c61f0: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26c61f4: adrp     x8, #0x5511000
  0x26c61f8: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26c61fc: mov      w22, w0
  0x26c6200: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6204: ldr      w9, [x8, #0xe0]
  0x26c6208: cbnz     w9, #0x26c6214
  0x26c620c: mov      x0, x8
  0x26c6210: bl       #0x218489c ; -> ??? 0x218489c
  0x26c6214: mov      w0, w19
  0x26c6218: mov      w1, w22
  0x26c621c: mov      x2, xzr
  0x26c6220: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x26c6224: sub      w19, w19, w0
  0x26c6228: ldrb     w8, [x27, #0x8f3]
  0x26c622c: cbnz     w8, #0x26c6244
  0x26c6230: adrp     x0, #0x5511000
  0x26c6234: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c6238: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c623c: mov      w8, #1
  0x26c6240: strb     w8, [x27, #0x8f3]
  0x26c6244: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c6248: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c624c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6250: cbz      x0, #0x26c67b8
  0x26c6254: mov      x1, xzr
  0x26c6258: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x26c625c: tbz      w0, #0, #0x26c62bc
  0x26c6260: adrp     x8, #0x5511000
  0x26c6264: ldr      x8, [x8, #0xd68] ; = 0x0 (u64 @ 0x5511d68)
  0x26c6268: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c626c: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x26c6270: cbz      x0, #0x26c67b8
  0x26c6274: mov      x1, xzr
  0x26c6278: bl       #0x2514f84 ; -> CPVPRealTimeManager$$get_CurrentMatchInfo
  0x26c627c: cbz      x0, #0x26c67b8
  0x26c6280: mov      x1, xzr
  0x26c6284: bl       #0x251d508 ; -> CPvpRealtimeMatch$$get_FieldSkillReduceReceiveHeal
  0x26c6288: adrp     x8, #0x5511000
  0x26c628c: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26c6290: mov      w22, w0
  0x26c6294: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6298: ldr      w9, [x8, #0xe0]
  0x26c629c: cbnz     w9, #0x26c62a8
  0x26c62a0: mov      x0, x8
  0x26c62a4: bl       #0x218489c ; -> ??? 0x218489c
  0x26c62a8: mov      w0, w19
  0x26c62ac: mov      w1, w22
  0x26c62b0: mov      x2, xzr
  0x26c62b4: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x26c62b8: sub      w19, w19, w0
  0x26c62bc: mov      w1, #0x37
  0x26c62c0: mov      x0, x20
  0x26c62c4: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26c62c8: cbz      x0, #0x26c62f8
  0x26c62cc: adrp     x8, #0x5511000
  0x26c62d0: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26c62d4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c62d8: ldr      w8, [x0, #0xe0]
  0x26c62dc: cbnz     w8, #0x26c62e4
  0x26c62e0: bl       #0x218489c ; -> ??? 0x218489c
  0x26c62e4: mov      w1, #0x1f4
  0x26c62e8: mov      w0, w19
  0x26c62ec: mov      x2, xzr
  0x26c62f0: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x26c62f4: mov      w19, w0
  0x26c62f8: mov      x0, x20
  0x26c62fc: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x26c6300: ldr      x8, [x20, #0x28]
  0x26c6304: cbz      x8, #0x26c67b8
  0x26c6308: adrp     x28, #0x5511000
  0x26c630c: ldr      x28, [x28, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x26c6310: mov      w22, w0
  0x26c6314: mov      x0, x8
  0x26c6318: mov      x1, xzr
  0x26c631c: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6320: mov      w8, w0
  0x26c6324: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c6328: add      w9, w22, w19
  0x26c632c: cmp      w9, w8
  0x26c6330: csel     w8, w8, w9, gt
  0x26c6334: ldr      w10, [x0, #0xe0]
  0x26c6338: cmp      w9, #0
  0x26c633c: csel     w22, wzr, w8, lt
  0x26c6340: cbnz     w10, #0x26c6348
  0x26c6344: bl       #0x218489c ; -> ??? 0x218489c
  0x26c6348: mov      w0, w22
  0x26c634c: mov      x1, xzr
  0x26c6350: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x26c6354: add      x29, x20, #0x31c
  0x26c6358: str      w1, [x29, #8]
  0x26c635c: and      x1, x1, #0xffffffff
  0x26c6360: mov      x2, xzr
  0x26c6364: str      x0, [x29]
  0x26c6368: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c636c: cbz      w0, #0x26c66f8
  0x26c6370: ldr      x0, [x20, #0x28]
  0x26c6374: cbz      x0, #0x26c643c
  0x26c6378: mov      x1, xzr
  0x26c637c: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c6380: cmp      w0, #3
  0x26c6384: b.lt     #0x26c643c
  0x26c6388: ldr      x21, [x20, #0x2d8]
  0x26c638c: cbz      x21, #0x26c63dc
  0x26c6390: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c6394: ldr      x22, [x29]
  0x26c6398: ldr      w23, [x20, #0x324]
  0x26c639c: ldr      w8, [x0, #0xe0]
  0x26c63a0: cbnz     w8, #0x26c63a8
  0x26c63a4: bl       #0x218489c ; -> ??? 0x218489c
  0x26c63a8: mov      x0, x22
  0x26c63ac: mov      x1, x23
  0x26c63b0: mov      x2, xzr
  0x26c63b4: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c63b8: mov      w22, w0
  0x26c63bc: mov      x0, x20
  0x26c63c0: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c63c4: ldr      w3, [x20, #0x30c]
  0x26c63c8: mov      w2, w0
  0x26c63cc: mov      x0, x21
  0x26c63d0: mov      w1, w22
  0x26c63d4: mov      x4, xzr
  0x26c63d8: bl       #0x28a515c ; -> CHudBossGauge$$SetHP
  0x26c63dc: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c63e0: ldr      x21, [x20, #0x378]
  0x26c63e4: ldr      x22, [x29]
  0x26c63e8: ldr      w23, [x20, #0x324]
  0x26c63ec: ldr      w8, [x0, #0xe0]
  0x26c63f0: cbnz     w8, #0x26c63f8
  0x26c63f4: bl       #0x218489c ; -> ??? 0x218489c
  0x26c63f8: mov      x0, x22
  0x26c63fc: mov      x1, x23
  0x26c6400: mov      x2, xzr
  0x26c6404: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c6408: ldr      x8, [x20, #0x28]
  0x26c640c: cbz      x8, #0x26c67b8
  0x26c6410: mov      w22, w0
  0x26c6414: mov      x0, x8
  0x26c6418: mov      x1, xzr
  0x26c641c: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6420: cbz      x21, #0x26c67b8
  0x26c6424: mov      w2, w0
  0x26c6428: mov      x0, x21
  0x26c642c: mov      w1, w22
  0x26c6430: mov      x3, xzr
  0x26c6434: bl       #0x24cce34 ; -> CRageManager$$CheckRageHP
  0x26c6438: b        #0x26c64a8
  0x26c643c: ldr      x21, [x20, #0x2d0]
  0x26c6440: cbz      x21, #0x26c64a8
  0x26c6444: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c6448: ldr      x22, [x29]
  0x26c644c: ldr      w23, [x20, #0x324]
  0x26c6450: ldr      w8, [x0, #0xe0]
  0x26c6454: cbnz     w8, #0x26c645c
  0x26c6458: bl       #0x218489c ; -> ??? 0x218489c
  0x26c645c: mov      x0, x22
  0x26c6460: mov      x1, x23
  0x26c6464: mov      x2, xzr
  0x26c6468: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c646c: ldr      x8, [x20, #0x28]
  0x26c6470: cbz      x8, #0x26c67b8
  0x26c6474: mov      w22, w0
  0x26c6478: mov      x0, x8
  0x26c647c: mov      x1, xzr
  0x26c6480: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c6484: mov      w23, w0
  0x26c6488: mov      x0, x20
  0x26c648c: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c6490: mov      w3, w0
  0x26c6494: mov      x0, x21
  0x26c6498: mov      w1, w22
  0x26c649c: mov      w2, w23
  0x26c64a0: mov      x4, xzr
  0x26c64a4: bl       #0x289e9c4 ; -> CHeadUI$$SetHP
  0x26c64a8: ldr      x0, [x20, #0x28]
  0x26c64ac: cbz      x0, #0x26c65e0
  0x26c64b0: mov      x1, xzr
  0x26c64b4: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c64b8: cmp      w0, #4
  0x26c64bc: b.lt     #0x26c6518
  0x26c64c0: adrp     x8, #0x5511000
  0x26c64c4: ldr      x8, [x8, #0x928] ; = 0x0 (u64 @ 0x5511928)
  0x26c64c8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c64cc: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x26c64d0: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c64d4: ldr      x23, [x29]
  0x26c64d8: ldr      w22, [x20, #0x324]
  0x26c64dc: mov      x21, x0
  0x26c64e0: ldr      w9, [x8, #0xe0]
  0x26c64e4: cbnz     w9, #0x26c64f0
  0x26c64e8: mov      x0, x8
  0x26c64ec: bl       #0x218489c ; -> ??? 0x218489c
  0x26c64f0: mov      x0, x23
  0x26c64f4: mov      x1, x22
  0x26c64f8: mov      x2, xzr
  0x26c64fc: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c6500: cbz      x21, #0x26c67b8
  0x26c6504: mov      w2, w0
  0x26c6508: mov      x0, x21
  0x26c650c: mov      x1, x20
  0x26c6510: mov      x3, xzr
  0x26c6514: bl       #0x22e9a8c ; -> CBattleManager$$SetLastBossHP
  0x26c6518: ldr      x0, [x20, #0x28]
  0x26c651c: cbz      x0, #0x26c65e0
  0x26c6520: mov      x1, xzr
  0x26c6524: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c6528: cmp      w0, #4
  0x26c652c: b.lt     #0x26c6578
  0x26c6530: ldrb     w8, [x27, #0x8f3]
  0x26c6534: cbnz     w8, #0x26c654c
  0x26c6538: adrp     x0, #0x5511000
  0x26c653c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c6540: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c6544: mov      w8, #1
  0x26c6548: strb     w8, [x27, #0x8f3]
  0x26c654c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c6550: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c6554: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6558: cbz      x0, #0x26c67b8
  0x26c655c: mov      x1, xzr
  0x26c6560: bl       #0x2550fac ; -> CDungeonScene$$get_IsGuildRaid
  0x26c6564: tbz      w0, #0, #0x26c6578
  0x26c6568: ldr      x0, [x20, #0x2d8]
  0x26c656c: cbz      x0, #0x26c67b8
  0x26c6570: mov      x1, xzr
  0x26c6574: bl       #0x28a7bc4 ; -> CHudBossGauge$$SetGuildRiadHPString
  0x26c6578: ldr      x0, [x20, #0x28]
  0x26c657c: cbz      x0, #0x26c65e0
  0x26c6580: mov      x1, xzr
  0x26c6584: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c6588: cmp      w0, #4
  0x26c658c: b.lt     #0x26c65e0
  0x26c6590: ldrb     w8, [x27, #0x8f3]
  0x26c6594: cbnz     w8, #0x26c65ac
  0x26c6598: adrp     x0, #0x5511000
  0x26c659c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c65a0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c65a4: mov      w8, #1
  0x26c65a8: strb     w8, [x27, #0x8f3]
  0x26c65ac: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c65b0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c65b4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c65b8: cbz      x8, #0x26c67b8
  0x26c65bc: ldr      x8, [x8, #0x20] ; = 0x0 (u64 @ 0x5511020)
  0x26c65c0: cbz      x8, #0x26c67b8
  0x26c65c4: ldr      w8, [x8, #0xa4]
  0x26c65c8: cmp      w8, #0x17
  0x26c65cc: b.ne     #0x26c65e0
  0x26c65d0: ldr      x0, [x20, #0x2d8]
  0x26c65d4: cbz      x0, #0x26c67b8
  0x26c65d8: mov      x1, xzr
  0x26c65dc: bl       #0x28a7bc4 ; -> CHudBossGauge$$SetGuildRiadHPString
  0x26c65e0: ldrb     w8, [x27, #0x8f3]
  0x26c65e4: cbnz     w8, #0x26c65fc
  0x26c65e8: adrp     x0, #0x5511000
  0x26c65ec: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c65f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c65f4: mov      w8, #1
  0x26c65f8: strb     w8, [x27, #0x8f3]
  0x26c65fc: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c6600: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c6604: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6608: cbz      x0, #0x26c67b8
  0x26c660c: mov      x1, xzr
  0x26c6610: bl       #0x2548c30 ; -> CDungeonScene$$get_IsPvp
  0x26c6614: tbnz     w0, #0, #0x26c6650
  0x26c6618: ldrb     w8, [x27, #0x8f3]
  0x26c661c: cbnz     w8, #0x26c6634
  0x26c6620: adrp     x0, #0x5511000
  0x26c6624: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c6628: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c662c: mov      w8, #1
  0x26c6630: strb     w8, [x27, #0x8f3]
  0x26c6634: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c6638: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c663c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6640: cbz      x0, #0x26c67b8
  0x26c6644: mov      x1, xzr
  0x26c6648: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x26c664c: tbz      w0, #0, #0x26c66d4
  0x26c6650: ldrb     w8, [x27, #0x8f3]
  0x26c6654: cbnz     w8, #0x26c666c
  0x26c6658: adrp     x0, #0x5511000
  0x26c665c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c6660: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c6664: mov      w8, #1
  0x26c6668: strb     w8, [x27, #0x8f3]
  0x26c666c: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c6670: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c6674: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c6678: cbz      x0, #0x26c67b8
  0x26c667c: mov      x1, xzr
  0x26c6680: bl       #0x2548c54 ; -> CDungeonScene$$get_IsPvpRealtime
  0x26c6684: tbz      w0, #0, #0x26c669c
  0x26c6688: mov      x0, xzr
  0x26c668c: bl       #0x250fad8 ; -> CPVPRealTimeManager$$get_PvpRealtimeMatch
  0x26c6690: cbz      x0, #0x26c67b8
  0x26c6694: ldrb     w8, [x0, #0xd4]
  0x26c6698: cbz      w8, #0x26c66d4
  0x26c669c: ldrb     w8, [x27, #0x8f3]
  0x26c66a0: cbnz     w8, #0x26c66b8
  0x26c66a4: adrp     x0, #0x5511000
  0x26c66a8: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x26c66ac: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c66b0: mov      w8, #1
  0x26c66b4: strb     w8, [x27, #0x8f3]
  0x26c66b8: ldr      x8, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26c66bc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x26c66c0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c66c4: cbz      x0, #0x26c67b8
  0x26c66c8: ldr      w1, [x20, #0x21c]
  0x26c66cc: mov      x2, xzr
  0x26c66d0: bl       #0x255a384 ; -> CDungeonScene$$UpdatePvpTeamHp
  0x26c66d4: mov      w0, w19
  0x26c66d8: ldp      x20, x19, [sp, #0x60]
  0x26c66dc: ldp      x22, x21, [sp, #0x50]
  0x26c66e0: ldp      x24, x23, [sp, #0x40]
  0x26c66e4: ldp      x26, x25, [sp, #0x30]
  0x26c66e8: ldp      x28, x27, [sp, #0x20]
  0x26c66ec: ldp      x29, x30, [sp, #0x10]
  0x26c66f0: add      sp, sp, #0x70
  0x26c66f4: ret      
  0x26c66f8: mov      w1, #0x6f
  0x26c66fc: mov      x0, x20
  0x26c6700: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26c6704: cbz      x0, #0x26c6370
  0x26c6708: tbnz     w21, #0, #0x26c6370
  0x26c670c: mov      x22, x0
  0x26c6710: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26c6714: ldr      w8, [x0, #0xe0]
  0x26c6718: cbnz     w8, #0x26c6720
  0x26c671c: bl       #0x218489c ; -> ??? 0x218489c
  0x26c6720: mov      w0, #1
  0x26c6724: mov      x1, xzr
  0x26c6728: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x26c672c: str      x0, [x29]
  0x26c6730: str      w1, [x20, #0x324]
  0x26c6734: ldrb     w8, [x22, #0x3c]
  0x26c6738: cbnz     w8, #0x26c6370
  0x26c673c: mov      x0, x22
  0x26c6740: mov      x1, xzr
  0x26c6744: bl       #0x22f4c48 ; -> CBuff$$get_ActivateEffect
  0x26c6748: mov      x21, x0
  0x26c674c: mov      x0, x22
  0x26c6750: mov      x1, xzr
  0x26c6754: bl       #0x22f4c64 ; -> CBuff$$get_ActivateText
  0x26c6758: mov      x23, x0
  0x26c675c: mov      x0, x22
  0x26c6760: mov      x1, xzr
  0x26c6764: bl       #0x22f4a10 ; -> CBuff$$get_IsDebuff
  0x26c6768: mov      w24, w0
  0x26c676c: mov      x0, x22
  0x26c6770: mov      x1, xzr
  0x26c6774: bl       #0x22f4a90 ; -> CBuff$$get_IsEquip
  0x26c6778: mov      w25, w0
  0x26c677c: mov      x0, x22
  0x26c6780: mov      x1, xzr
  0x26c6784: bl       #0x22f4a2c ; -> CBuff$$get_IsEquipDebuff
  0x26c6788: ldr      w7, [x22, #0x30]
  0x26c678c: and      w4, w24, #1
  0x26c6790: and      w5, w25, #1
  0x26c6794: and      w6, w0, #1
  0x26c6798: mov      x0, x20
  0x26c679c: mov      x1, x21
  0x26c67a0: mov      x2, x20
  0x26c67a4: mov      x3, x23
  0x26c67a8: bl       #0x26c6980 ; -> CCharacterBattle$$PlayBuffEffect
  0x26c67ac: mov      w8, #1
  0x26c67b0: strb     w8, [x22, #0x3c]
  0x26c67b4: b        #0x26c6370
  0x26c67b8: bl       #0x21849c0 ; -> ??? 0x21849c0
