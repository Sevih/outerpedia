; ===== CalcCharacterSharedDamage @ 0x2c5b778..0x2c5bc6c (taille 1268 octets) =====
  0x2c5b778: stp      x30, x27, [sp, #-0x50]!
  0x2c5b77c: stp      x26, x25, [sp, #0x10]
  0x2c5b780: stp      x24, x23, [sp, #0x20]
  0x2c5b784: stp      x22, x21, [sp, #0x30]
  0x2c5b788: stp      x20, x19, [sp, #0x40]
  0x2c5b78c: adrp     x20, #0x595a000
  0x2c5b790: ldrb     w8, [x20, #0x909]
  0x2c5b794: mov      w22, w1
  0x2c5b798: mov      x19, x0
  0x2c5b79c: tbnz     w8, #0, #0x2c5b7fc
  0x2c5b7a0: adrp     x0, #0x5511000
  0x2c5b7a4: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5b7a8: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7ac: adrp     x0, #0x5523000
  0x2c5b7b0: ldr      x0, [x0, #0x108] ; = 0x0 (u64 @ 0x5523108)
  0x2c5b7b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7b8: adrp     x0, #0x550f000
  0x2c5b7bc: ldr      x0, [x0, #0x1c0] ; = 0x0 (u64 @ 0x550f1c0)
  0x2c5b7c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7c4: adrp     x0, #0x5551000
  0x2c5b7c8: ldr      x0, [x0, #0x1f0] ; = 0x0 (u64 @ 0x55511f0)
  0x2c5b7cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7d0: adrp     x0, #0x5551000
  0x2c5b7d4: ldr      x0, [x0, #0x1f8] ; = 0x0 (u64 @ 0x55511f8)
  0x2c5b7d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7dc: adrp     x0, #0x550f000
  0x2c5b7e0: ldr      x0, [x0, #0x2b8] ; = 0x0 (u64 @ 0x550f2b8)
  0x2c5b7e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7e8: adrp     x0, #0x550f000
  0x2c5b7ec: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x2c5b7f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b7f4: mov      w8, #1
  0x2c5b7f8: strb     w8, [x20, #0x909]
  0x2c5b7fc: cbz      x19, #0x2c5bb84
  0x2c5b800: mov      x0, x19
  0x2c5b804: mov      x1, xzr
  0x2c5b808: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x2c5b80c: cbz      x0, #0x2c5bb84
  0x2c5b810: adrp     x20, #0x5523000
  0x2c5b814: adrp     x25, #0x5511000
  0x2c5b818: ldr      x20, [x20, #0x108] ; = 0x0 (u64 @ 0x5523108)
  0x2c5b81c: ldr      x25, [x25, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5b820: mov      x1, x19
  0x2c5b824: mov      x2, xzr
  0x2c5b828: bl       #0x254efe4 ; -> CTeam$$GetCharactersMultiSharedDamage
  0x2c5b82c: ldr      x1, [x20] ; = 0x0 (u64 @ 0x5523000)
  0x2c5b830: mov      x20, x0
  0x2c5b834: bl       #0x340a90c ; -> System.Linq.Enumerable$$Count<object>
  0x2c5b838: cmp      w0, #1
  0x2c5b83c: b.lt     #0x2c5b88c
  0x2c5b840: cbz      x20, #0x2c5bb84
  0x2c5b844: adrp     x10, #0x5551000
  0x2c5b848: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5523000)
  0x2c5b84c: ldr      x10, [x10, #0x1f0] ; = 0x0 (u64 @ 0x55511f0)
  0x2c5b850: ldrh     w9, [x8, #0x12e]
  0x2c5b854: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5551000)
  0x2c5b858: cbz      x9, #0x2c5b87c
  0x2c5b85c: ldr      x10, [x8, #0xb0]
  0x2c5b860: add      x10, x10, #8
  0x2c5b864: ldur     x11, [x10, #-8]
  0x2c5b868: cmp      x11, x1
  0x2c5b86c: b.eq     #0x2c5b894
  0x2c5b870: subs     x9, x9, #1
  0x2c5b874: add      x10, x10, #0x10
  0x2c5b878: b.ne     #0x2c5b864
  0x2c5b87c: mov      x0, x20
  0x2c5b880: mov      w2, wzr
  0x2c5b884: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x2c5b888: b        #0x2c5b8a0
  0x2c5b88c: mov      w20, w22
  0x2c5b890: b        #0x2c5ba88
  0x2c5b894: ldrsw    x9, [x10]
  0x2c5b898: add      x8, x8, x9, lsl #4
  0x2c5b89c: add      x0, x8, #0x138
  0x2c5b8a0: ldp      x8, x1, [x0]
  0x2c5b8a4: adrp     x26, #0x550f000
  0x2c5b8a8: adrp     x27, #0x5551000
  0x2c5b8ac: ldr      x26, [x26, #0x2b8] ; = 0x0 (u64 @ 0x550f2b8)
  0x2c5b8b0: ldr      x27, [x27, #0x1f8] ; = 0x0 (u64 @ 0x55511f8)
  0x2c5b8b4: mov      x0, x20
  0x2c5b8b8: blr      x8
  0x2c5b8bc: mov      x21, x0
  0x2c5b8c0: mov      w20, w22
  0x2c5b8c4: cbz      x21, #0x2c5bb78
  0x2c5b8c8: ldr      x8, [x21]
  0x2c5b8cc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x550f000)
  0x2c5b8d0: ldrh     w9, [x8, #0x12e]
  0x2c5b8d4: cbz      x9, #0x2c5b8f8
  0x2c5b8d8: ldr      x10, [x8, #0xb0]
  0x2c5b8dc: add      x10, x10, #8
  0x2c5b8e0: ldur     x11, [x10, #-8]
  0x2c5b8e4: cmp      x11, x1
  0x2c5b8e8: b.eq     #0x2c5b908
  0x2c5b8ec: subs     x9, x9, #1
  0x2c5b8f0: add      x10, x10, #0x10
  0x2c5b8f4: b.ne     #0x2c5b8e0
  0x2c5b8f8: mov      x0, x21
  0x2c5b8fc: mov      w2, wzr
  0x2c5b900: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x2c5b904: b        #0x2c5b914
  0x2c5b908: ldrsw    x9, [x10]
  0x2c5b90c: add      x8, x8, x9, lsl #4
  0x2c5b910: add      x0, x8, #0x138
  0x2c5b914: ldp      x8, x1, [x0]
  0x2c5b918: mov      x0, x21
  0x2c5b91c: blr      x8
  0x2c5b920: tbz      w0, #0, #0x2c5ba0c
  0x2c5b924: ldr      x8, [x21]
  0x2c5b928: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5551000)
  0x2c5b92c: ldrh     w9, [x8, #0x12e]
  0x2c5b930: cbz      x9, #0x2c5b954
  0x2c5b934: ldr      x10, [x8, #0xb0]
  0x2c5b938: add      x10, x10, #8
  0x2c5b93c: ldur     x11, [x10, #-8]
  0x2c5b940: cmp      x11, x1
  0x2c5b944: b.eq     #0x2c5b964
  0x2c5b948: subs     x9, x9, #1
  0x2c5b94c: add      x10, x10, #0x10
  0x2c5b950: b.ne     #0x2c5b93c
  0x2c5b954: mov      x0, x21
  0x2c5b958: mov      w2, wzr
  0x2c5b95c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x2c5b960: b        #0x2c5b970
  0x2c5b964: ldrsw    x9, [x10]
  0x2c5b968: add      x8, x8, x9, lsl #4
  0x2c5b96c: add      x0, x8, #0x138
  0x2c5b970: ldp      x8, x1, [x0]
  0x2c5b974: mov      x0, x21
  0x2c5b978: blr      x8
  0x2c5b97c: mov      x23, x0
  0x2c5b980: cbz      x0, #0x2c5bb7c
  0x2c5b984: mov      w1, #0x89
  0x2c5b988: mov      x0, x23
  0x2c5b98c: mov      x2, xzr
  0x2c5b990: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x2c5b994: mov      x24, x0
  0x2c5b998: cbz      x0, #0x2c5bb80
  0x2c5b99c: mov      x0, x24
  0x2c5b9a0: mov      x1, xzr
  0x2c5b9a4: bl       #0x22f4afc ; -> CBuff$$get_ApplyingType
  0x2c5b9a8: cmp      w0, #2
  0x2c5b9ac: b.ne     #0x2c5b8c4
  0x2c5b9b0: mov      x0, x24
  0x2c5b9b4: mov      x1, xzr
  0x2c5b9b8: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x2c5b9bc: mov      w24, w0
  0x2c5b9c0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b9c4: ldr      w8, [x0, #0xe0]
  0x2c5b9c8: cbnz     w8, #0x2c5b9d0
  0x2c5b9cc: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b9d0: mov      w0, w22
  0x2c5b9d4: mov      w1, w24
  0x2c5b9d8: mov      x2, xzr
  0x2c5b9dc: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x2c5b9e0: mov      w24, w0
  0x2c5b9e4: mov      x0, x23
  0x2c5b9e8: mov      x1, xzr
  0x2c5b9ec: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b9f0: cbz      x0, #0x2c5bb90
  0x2c5b9f4: ldr      w8, [x0, #0xa4]
  0x2c5b9f8: sub      w9, w20, w24
  0x2c5b9fc: bic      w20, w9, w9, asr #31
  0x2c5ba00: add      w8, w8, w24
  0x2c5ba04: str      w8, [x0, #0xa4]
  0x2c5ba08: b        #0x2c5b8c4
  0x2c5ba0c: mov      x22, xzr
  0x2c5ba10: mov      w23, #5
  0x2c5ba14: cbz      x21, #0x2c5ba78
  0x2c5ba18: adrp     x10, #0x550f000
  0x2c5ba1c: ldr      x8, [x21]
  0x2c5ba20: ldr      x10, [x10, #0x1c0] ; = 0x0 (u64 @ 0x550f1c0)
  0x2c5ba24: ldrh     w9, [x8, #0x12e]
  0x2c5ba28: ldr      x1, [x10] ; = 0x0 (u64 @ 0x550f000)
  0x2c5ba2c: cbz      x9, #0x2c5ba50
  0x2c5ba30: ldr      x10, [x8, #0xb0]
  0x2c5ba34: add      x10, x10, #8
  0x2c5ba38: ldur     x11, [x10, #-8]
  0x2c5ba3c: cmp      x11, x1
  0x2c5ba40: b.eq     #0x2c5ba60
  0x2c5ba44: subs     x9, x9, #1
  0x2c5ba48: add      x10, x10, #0x10
  0x2c5ba4c: b.ne     #0x2c5ba38
  0x2c5ba50: mov      x0, x21
  0x2c5ba54: mov      w2, wzr
  0x2c5ba58: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x2c5ba5c: b        #0x2c5ba6c
  0x2c5ba60: ldrsw    x9, [x10]
  0x2c5ba64: add      x8, x8, x9, lsl #4
  0x2c5ba68: add      x0, x8, #0x138
  0x2c5ba6c: ldp      x8, x1, [x0]
  0x2c5ba70: mov      x0, x21
  0x2c5ba74: blr      x8
  0x2c5ba78: cbnz     x22, #0x2c5bb88
  0x2c5ba7c: cmp      w23, #5
  0x2c5ba80: b.eq     #0x2c5ba88
  0x2c5ba84: cbnz     w23, #0x2c5bb5c
  0x2c5ba88: mov      x0, x19
  0x2c5ba8c: mov      x1, xzr
  0x2c5ba90: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x2c5ba94: cbz      x0, #0x2c5bb84
  0x2c5ba98: adrp     x22, #0x550f000
  0x2c5ba9c: ldr      x22, [x22, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x2c5baa0: mov      x1, xzr
  0x2c5baa4: bl       #0x254ee04 ; -> CTeam$$GetCharacterSharedDamage
  0x2c5baa8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x550f000)
  0x2c5baac: mov      x21, x0
  0x2c5bab0: ldr      w9, [x8, #0xe0]
  0x2c5bab4: cbnz     w9, #0x2c5bac0
  0x2c5bab8: mov      x0, x8
  0x2c5babc: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5bac0: mov      x0, x21
  0x2c5bac4: mov      x1, xzr
  0x2c5bac8: bl       #0x4f8524c ; -> UnityEngine.Object$$op_Implicit
  0x2c5bacc: tbz      w0, #0, #0x2c5bb5c
  0x2c5bad0: ldr      x0, [x22] ; = 0x0 (u64 @ 0x550f000)
  0x2c5bad4: ldr      w8, [x0, #0xe0]
  0x2c5bad8: cbnz     w8, #0x2c5bae0
  0x2c5badc: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5bae0: mov      x0, x21
  0x2c5bae4: mov      x1, x19
  0x2c5bae8: mov      x2, xzr
  0x2c5baec: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x2c5baf0: tbz      w0, #0, #0x2c5bb5c
  0x2c5baf4: cbz      x21, #0x2c5bb84
  0x2c5baf8: mov      x0, x21
  0x2c5bafc: mov      x1, xzr
  0x2c5bb00: bl       #0x26dfbdc ; -> CCharacterBattle$$FindBuffShareDamage
  0x2c5bb04: cbz      x0, #0x2c5bb5c
  0x2c5bb08: mov      x1, xzr
  0x2c5bb0c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x2c5bb10: ldr      x8, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x2c5bb14: mov      w19, w0
  0x2c5bb18: ldr      w9, [x8, #0xe0]
  0x2c5bb1c: cbnz     w9, #0x2c5bb28
  0x2c5bb20: mov      x0, x8
  0x2c5bb24: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5bb28: mov      w0, w20
  0x2c5bb2c: mov      w1, w19
  0x2c5bb30: mov      x2, xzr
  0x2c5bb34: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x2c5bb38: mov      w19, w0
  0x2c5bb3c: mov      x0, x21
  0x2c5bb40: mov      x1, xzr
  0x2c5bb44: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5bb48: cbz      x0, #0x2c5bb84
  0x2c5bb4c: ldr      w8, [x0, #0xa0]
  0x2c5bb50: sub      w20, w20, w19
  0x2c5bb54: add      w8, w8, w19
  0x2c5bb58: str      w8, [x0, #0xa0]
  0x2c5bb5c: mov      w0, w20
  0x2c5bb60: ldp      x20, x19, [sp, #0x40]
  0x2c5bb64: ldp      x22, x21, [sp, #0x30]
  0x2c5bb68: ldp      x24, x23, [sp, #0x20]
  0x2c5bb6c: ldp      x26, x25, [sp, #0x10]
  0x2c5bb70: ldp      x30, x27, [sp], #0x50
  0x2c5bb74: ret      
  0x2c5bb78: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5bb7c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5bb80: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5bb84: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5bb88: mov      x0, x22
  0x2c5bb8c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x2c5bb90: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5bb94: b        #0x2c5bbc0
  0x2c5bb98: b        #0x2c5bbc0
  0x2c5bb9c: b        #0x2c5bbc0
  0x2c5bba0: b        #0x2c5bbc0
  0x2c5bba4: b        #0x2c5bbc0
  0x2c5bba8: b        #0x2c5bbc0
  0x2c5bbac: b        #0x2c5bbc0
  0x2c5bbb0: b        #0x2c5bbc0
  0x2c5bbb4: mov      w20, w22
  0x2c5bbb8: b        #0x2c5bbc0
  0x2c5bbbc: b        #0x2c5bbc0
  0x2c5bbc0: cmp      w1, #1
  0x2c5bbc4: b.ne     #0x2c5bbe0
  0x2c5bbc8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x2c5bbcc: ldr      x22, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x2c5bbd0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x2c5bbd4: mov      w23, wzr
  0x2c5bbd8: cbnz     x21, #0x2c5ba18
  0x2c5bbdc: b        #0x2c5ba78
  0x2c5bbe0: mov      x19, x0
  0x2c5bbe4: mov      x22, xzr
  0x2c5bbe8: b        #0x2c5bbf0
  0x2c5bbec: mov      x19, x0
  0x2c5bbf0: cbz      x21, #0x2c5bc54
  0x2c5bbf4: adrp     x10, #0x550f000
  0x2c5bbf8: ldr      x8, [x21]
  0x2c5bbfc: ldr      x10, [x10, #0x1c0] ; = 0x0 (u64 @ 0x550f1c0)
  0x2c5bc00: ldrh     w9, [x8, #0x12e]
  0x2c5bc04: ldr      x1, [x10] ; = 0x0 (u64 @ 0x550f000)
  0x2c5bc08: cbz      x9, #0x2c5bc2c
  0x2c5bc0c: ldr      x10, [x8, #0xb0]
  0x2c5bc10: add      x10, x10, #8
  0x2c5bc14: ldur     x11, [x10, #-8]
  0x2c5bc18: cmp      x11, x1
  0x2c5bc1c: b.eq     #0x2c5bc3c
  0x2c5bc20: subs     x9, x9, #1
  0x2c5bc24: add      x10, x10, #0x10
  0x2c5bc28: b.ne     #0x2c5bc14
  0x2c5bc2c: mov      x0, x21
  0x2c5bc30: mov      w2, wzr
  0x2c5bc34: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x2c5bc38: b        #0x2c5bc48
  0x2c5bc3c: ldrsw    x9, [x10]
  0x2c5bc40: add      x8, x8, x9, lsl #4
  0x2c5bc44: add      x0, x8, #0x138
  0x2c5bc48: ldp      x8, x1, [x0]
  0x2c5bc4c: mov      x0, x21
  0x2c5bc50: blr      x8
  0x2c5bc54: cbnz     x22, #0x2c5bc60
  0x2c5bc58: mov      x0, x19
  0x2c5bc5c: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x2c5bc60: mov      x0, x22
  0x2c5bc64: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x2c5bc68: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
