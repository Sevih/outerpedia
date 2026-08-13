; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcCharacterSharedDamage @ 0x2cb36fc..0x2cb3bf0 (taille 1268 octets) =====
  0x2cb36fc: stp      x30, x27, [sp, #-0x50]!
  0x2cb3700: stp      x26, x25, [sp, #0x10]
  0x2cb3704: stp      x24, x23, [sp, #0x20]
  0x2cb3708: stp      x22, x21, [sp, #0x30]
  0x2cb370c: stp      x20, x19, [sp, #0x40]
  0x2cb3710: adrp     x20, #0x59da000
  0x2cb3714: ldrb     w8, [x20, #0x116]
  0x2cb3718: mov      w22, w1
  0x2cb371c: mov      x19, x0
  0x2cb3720: tbnz     w8, #0, #0x2cb3780
  0x2cb3724: adrp     x0, #0x558a000
  0x2cb3728: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb372c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3730: adrp     x0, #0x558a000
  0x2cb3734: ldr      x0, [x0, #0xf90] ; = 0x0 (u64 @ 0x558af90)
  0x2cb3738: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb373c: adrp     x0, #0x5587000
  0x2cb3740: ldr      x0, [x0, #0xbf0] ; = 0x0 (u64 @ 0x5587bf0)
  0x2cb3744: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3748: adrp     x0, #0x55cb000
  0x2cb374c: ldr      x0, [x0, #0x98] ; = 0x0 (u64 @ 0x55cb098)
  0x2cb3750: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3754: adrp     x0, #0x55cb000
  0x2cb3758: ldr      x0, [x0, #0xa0] ; = 0x0 (u64 @ 0x55cb0a0)
  0x2cb375c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3760: adrp     x0, #0x5587000
  0x2cb3764: ldr      x0, [x0, #0xce8] ; = 0x0 (u64 @ 0x5587ce8)
  0x2cb3768: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb376c: adrp     x0, #0x5587000
  0x2cb3770: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb3774: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3778: mov      w8, #1
  0x2cb377c: strb     w8, [x20, #0x116]
  0x2cb3780: cbz      x19, #0x2cb3b08
  0x2cb3784: mov      x0, x19
  0x2cb3788: mov      x1, xzr
  0x2cb378c: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2cb3790: cbz      x0, #0x2cb3b08
  0x2cb3794: adrp     x20, #0x558a000
  0x2cb3798: adrp     x25, #0x558a000
  0x2cb379c: ldr      x20, [x20, #0xf90] ; = 0x0 (u64 @ 0x558af90)
  0x2cb37a0: ldr      x25, [x25, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb37a4: mov      x1, x19
  0x2cb37a8: mov      x2, xzr
  0x2cb37ac: bl       #0x2593940 ; -> CTeam$$GetCharactersMultiSharedDamage
  0x2cb37b0: ldr      x1, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2cb37b4: mov      x20, x0
  0x2cb37b8: bl       #0x34578dc ; -> System.Linq.Enumerable$$Count<object>
  0x2cb37bc: cmp      w0, #1
  0x2cb37c0: b.lt     #0x2cb3810
  0x2cb37c4: cbz      x20, #0x2cb3b08
  0x2cb37c8: adrp     x10, #0x55cb000
  0x2cb37cc: ldr      x8, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2cb37d0: ldr      x10, [x10, #0x98] ; = 0x0 (u64 @ 0x55cb098)
  0x2cb37d4: ldrh     w9, [x8, #0x12e]
  0x2cb37d8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb37dc: cbz      x9, #0x2cb3800
  0x2cb37e0: ldr      x10, [x8, #0xb0]
  0x2cb37e4: add      x10, x10, #8
  0x2cb37e8: ldur     x11, [x10, #-8]
  0x2cb37ec: cmp      x11, x1
  0x2cb37f0: b.eq     #0x2cb3818
  0x2cb37f4: subs     x9, x9, #1
  0x2cb37f8: add      x10, x10, #0x10
  0x2cb37fc: b.ne     #0x2cb37e8
  0x2cb3800: mov      x0, x20
  0x2cb3804: mov      w2, wzr
  0x2cb3808: bl       #0x2210028 ; -> ??? 0x2210028
  0x2cb380c: b        #0x2cb3824
  0x2cb3810: mov      w20, w22
  0x2cb3814: b        #0x2cb3a0c
  0x2cb3818: ldrsw    x9, [x10]
  0x2cb381c: add      x8, x8, x9, lsl #4
  0x2cb3820: add      x0, x8, #0x138
  0x2cb3824: ldp      x8, x1, [x0]
  0x2cb3828: adrp     x26, #0x5587000
  0x2cb382c: adrp     x27, #0x55cb000
  0x2cb3830: ldr      x26, [x26, #0xce8] ; = 0x0 (u64 @ 0x5587ce8)
  0x2cb3834: ldr      x27, [x27, #0xa0] ; = 0x0 (u64 @ 0x55cb0a0)
  0x2cb3838: mov      x0, x20
  0x2cb383c: blr      x8
  0x2cb3840: mov      x21, x0
  0x2cb3844: mov      w20, w22
  0x2cb3848: cbz      x21, #0x2cb3afc
  0x2cb384c: ldr      x8, [x21]
  0x2cb3850: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5587000)
  0x2cb3854: ldrh     w9, [x8, #0x12e]
  0x2cb3858: cbz      x9, #0x2cb387c
  0x2cb385c: ldr      x10, [x8, #0xb0]
  0x2cb3860: add      x10, x10, #8
  0x2cb3864: ldur     x11, [x10, #-8]
  0x2cb3868: cmp      x11, x1
  0x2cb386c: b.eq     #0x2cb388c
  0x2cb3870: subs     x9, x9, #1
  0x2cb3874: add      x10, x10, #0x10
  0x2cb3878: b.ne     #0x2cb3864
  0x2cb387c: mov      x0, x21
  0x2cb3880: mov      w2, wzr
  0x2cb3884: bl       #0x2210028 ; -> ??? 0x2210028
  0x2cb3888: b        #0x2cb3898
  0x2cb388c: ldrsw    x9, [x10]
  0x2cb3890: add      x8, x8, x9, lsl #4
  0x2cb3894: add      x0, x8, #0x138
  0x2cb3898: ldp      x8, x1, [x0]
  0x2cb389c: mov      x0, x21
  0x2cb38a0: blr      x8
  0x2cb38a4: tbz      w0, #0, #0x2cb3990
  0x2cb38a8: ldr      x8, [x21]
  0x2cb38ac: ldr      x1, [x27] ; = 0x0 (u64 @ 0x55cb000)
  0x2cb38b0: ldrh     w9, [x8, #0x12e]
  0x2cb38b4: cbz      x9, #0x2cb38d8
  0x2cb38b8: ldr      x10, [x8, #0xb0]
  0x2cb38bc: add      x10, x10, #8
  0x2cb38c0: ldur     x11, [x10, #-8]
  0x2cb38c4: cmp      x11, x1
  0x2cb38c8: b.eq     #0x2cb38e8
  0x2cb38cc: subs     x9, x9, #1
  0x2cb38d0: add      x10, x10, #0x10
  0x2cb38d4: b.ne     #0x2cb38c0
  0x2cb38d8: mov      x0, x21
  0x2cb38dc: mov      w2, wzr
  0x2cb38e0: bl       #0x2210028 ; -> ??? 0x2210028
  0x2cb38e4: b        #0x2cb38f4
  0x2cb38e8: ldrsw    x9, [x10]
  0x2cb38ec: add      x8, x8, x9, lsl #4
  0x2cb38f0: add      x0, x8, #0x138
  0x2cb38f4: ldp      x8, x1, [x0]
  0x2cb38f8: mov      x0, x21
  0x2cb38fc: blr      x8
  0x2cb3900: mov      x23, x0
  0x2cb3904: cbz      x0, #0x2cb3b00
  0x2cb3908: mov      w1, #0x8e
  0x2cb390c: mov      x0, x23
  0x2cb3910: mov      x2, xzr
  0x2cb3914: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2cb3918: mov      x24, x0
  0x2cb391c: cbz      x0, #0x2cb3b04
  0x2cb3920: mov      x0, x24
  0x2cb3924: mov      x1, xzr
  0x2cb3928: bl       #0x2320330 ; -> CBuff$$get_ApplyingType
  0x2cb392c: cmp      w0, #2
  0x2cb3930: b.ne     #0x2cb3848
  0x2cb3934: mov      x0, x24
  0x2cb3938: mov      x1, xzr
  0x2cb393c: bl       #0x232036c ; -> CBuff$$get_Value
  0x2cb3940: mov      w24, w0
  0x2cb3944: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3948: ldr      w8, [x0, #0xe0]
  0x2cb394c: cbnz     w8, #0x2cb3954
  0x2cb3950: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3954: mov      w0, w22
  0x2cb3958: mov      w1, w24
  0x2cb395c: mov      x2, xzr
  0x2cb3960: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2cb3964: mov      w24, w0
  0x2cb3968: mov      x0, x23
  0x2cb396c: mov      x1, xzr
  0x2cb3970: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3974: cbz      x0, #0x2cb3b14
  0x2cb3978: ldr      w8, [x0, #0xa8]
  0x2cb397c: sub      w9, w20, w24
  0x2cb3980: bic      w20, w9, w9, asr #31
  0x2cb3984: add      w8, w8, w24
  0x2cb3988: str      w8, [x0, #0xa8]
  0x2cb398c: b        #0x2cb3848
  0x2cb3990: mov      x22, xzr
  0x2cb3994: mov      w23, #5
  0x2cb3998: cbz      x21, #0x2cb39fc
  0x2cb399c: adrp     x10, #0x5587000
  0x2cb39a0: ldr      x8, [x21]
  0x2cb39a4: ldr      x10, [x10, #0xbf0] ; = 0x0 (u64 @ 0x5587bf0)
  0x2cb39a8: ldrh     w9, [x8, #0x12e]
  0x2cb39ac: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5587000)
  0x2cb39b0: cbz      x9, #0x2cb39d4
  0x2cb39b4: ldr      x10, [x8, #0xb0]
  0x2cb39b8: add      x10, x10, #8
  0x2cb39bc: ldur     x11, [x10, #-8]
  0x2cb39c0: cmp      x11, x1
  0x2cb39c4: b.eq     #0x2cb39e4
  0x2cb39c8: subs     x9, x9, #1
  0x2cb39cc: add      x10, x10, #0x10
  0x2cb39d0: b.ne     #0x2cb39bc
  0x2cb39d4: mov      x0, x21
  0x2cb39d8: mov      w2, wzr
  0x2cb39dc: bl       #0x2210028 ; -> ??? 0x2210028
  0x2cb39e0: b        #0x2cb39f0
  0x2cb39e4: ldrsw    x9, [x10]
  0x2cb39e8: add      x8, x8, x9, lsl #4
  0x2cb39ec: add      x0, x8, #0x138
  0x2cb39f0: ldp      x8, x1, [x0]
  0x2cb39f4: mov      x0, x21
  0x2cb39f8: blr      x8
  0x2cb39fc: cbnz     x22, #0x2cb3b0c
  0x2cb3a00: cmp      w23, #5
  0x2cb3a04: b.eq     #0x2cb3a0c
  0x2cb3a08: cbnz     w23, #0x2cb3ae0
  0x2cb3a0c: mov      x0, x19
  0x2cb3a10: mov      x1, xzr
  0x2cb3a14: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2cb3a18: cbz      x0, #0x2cb3b08
  0x2cb3a1c: adrp     x22, #0x5587000
  0x2cb3a20: ldr      x22, [x22, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb3a24: mov      x1, xzr
  0x2cb3a28: bl       #0x2593760 ; -> CTeam$$GetCharacterSharedDamage
  0x2cb3a2c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5587000)
  0x2cb3a30: mov      x21, x0
  0x2cb3a34: ldr      w9, [x8, #0xe0]
  0x2cb3a38: cbnz     w9, #0x2cb3a44
  0x2cb3a3c: mov      x0, x8
  0x2cb3a40: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3a44: mov      x0, x21
  0x2cb3a48: mov      x1, xzr
  0x2cb3a4c: bl       #0x503a8e4 ; -> UnityEngine.Object$$op_Implicit
  0x2cb3a50: tbz      w0, #0, #0x2cb3ae0
  0x2cb3a54: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5587000)
  0x2cb3a58: ldr      w8, [x0, #0xe0]
  0x2cb3a5c: cbnz     w8, #0x2cb3a64
  0x2cb3a60: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3a64: mov      x0, x21
  0x2cb3a68: mov      x1, x19
  0x2cb3a6c: mov      x2, xzr
  0x2cb3a70: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb3a74: tbz      w0, #0, #0x2cb3ae0
  0x2cb3a78: cbz      x21, #0x2cb3b08
  0x2cb3a7c: mov      x0, x21
  0x2cb3a80: mov      x1, xzr
  0x2cb3a84: bl       #0x2828cd4 ; -> CCharacterBattle$$FindBuffShareDamage
  0x2cb3a88: cbz      x0, #0x2cb3ae0
  0x2cb3a8c: mov      x1, xzr
  0x2cb3a90: bl       #0x232036c ; -> CBuff$$get_Value
  0x2cb3a94: ldr      x8, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3a98: mov      w19, w0
  0x2cb3a9c: ldr      w9, [x8, #0xe0]
  0x2cb3aa0: cbnz     w9, #0x2cb3aac
  0x2cb3aa4: mov      x0, x8
  0x2cb3aa8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3aac: mov      w0, w20
  0x2cb3ab0: mov      w1, w19
  0x2cb3ab4: mov      x2, xzr
  0x2cb3ab8: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2cb3abc: mov      w19, w0
  0x2cb3ac0: mov      x0, x21
  0x2cb3ac4: mov      x1, xzr
  0x2cb3ac8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2cb3acc: cbz      x0, #0x2cb3b08
  0x2cb3ad0: ldr      w8, [x0, #0xa4]
  0x2cb3ad4: sub      w20, w20, w19
  0x2cb3ad8: add      w8, w8, w19
  0x2cb3adc: str      w8, [x0, #0xa4]
  0x2cb3ae0: mov      w0, w20
  0x2cb3ae4: ldp      x20, x19, [sp, #0x40]
  0x2cb3ae8: ldp      x22, x21, [sp, #0x30]
  0x2cb3aec: ldp      x24, x23, [sp, #0x20]
  0x2cb3af0: ldp      x26, x25, [sp, #0x10]
  0x2cb3af4: ldp      x30, x27, [sp], #0x50
  0x2cb3af8: ret      
  0x2cb3afc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3b00: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3b04: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3b08: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3b0c: mov      x0, x22
  0x2cb3b10: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2cb3b14: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2cb3b18: b        #0x2cb3b44
  0x2cb3b1c: b        #0x2cb3b44
  0x2cb3b20: b        #0x2cb3b44
  0x2cb3b24: b        #0x2cb3b44
  0x2cb3b28: b        #0x2cb3b44
  0x2cb3b2c: b        #0x2cb3b44
  0x2cb3b30: b        #0x2cb3b44
  0x2cb3b34: b        #0x2cb3b44
  0x2cb3b38: mov      w20, w22
  0x2cb3b3c: b        #0x2cb3b44
  0x2cb3b40: b        #0x2cb3b44
  0x2cb3b44: cmp      w1, #1
  0x2cb3b48: b.ne     #0x2cb3b64
  0x2cb3b4c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2cb3b50: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5587000)
  0x2cb3b54: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2cb3b58: mov      w23, wzr
  0x2cb3b5c: cbnz     x21, #0x2cb399c
  0x2cb3b60: b        #0x2cb39fc
  0x2cb3b64: mov      x19, x0
  0x2cb3b68: mov      x22, xzr
  0x2cb3b6c: b        #0x2cb3b74
  0x2cb3b70: mov      x19, x0
  0x2cb3b74: cbz      x21, #0x2cb3bd8
  0x2cb3b78: adrp     x10, #0x5587000
  0x2cb3b7c: ldr      x8, [x21]
  0x2cb3b80: ldr      x10, [x10, #0xbf0] ; = 0x0 (u64 @ 0x5587bf0)
  0x2cb3b84: ldrh     w9, [x8, #0x12e]
  0x2cb3b88: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5587000)
  0x2cb3b8c: cbz      x9, #0x2cb3bb0
  0x2cb3b90: ldr      x10, [x8, #0xb0]
  0x2cb3b94: add      x10, x10, #8
  0x2cb3b98: ldur     x11, [x10, #-8]
  0x2cb3b9c: cmp      x11, x1
  0x2cb3ba0: b.eq     #0x2cb3bc0
  0x2cb3ba4: subs     x9, x9, #1
  0x2cb3ba8: add      x10, x10, #0x10
  0x2cb3bac: b.ne     #0x2cb3b98
  0x2cb3bb0: mov      x0, x21
  0x2cb3bb4: mov      w2, wzr
  0x2cb3bb8: bl       #0x2210028 ; -> ??? 0x2210028
  0x2cb3bbc: b        #0x2cb3bcc
  0x2cb3bc0: ldrsw    x9, [x10]
  0x2cb3bc4: add      x8, x8, x9, lsl #4
  0x2cb3bc8: add      x0, x8, #0x138
  0x2cb3bcc: ldp      x8, x1, [x0]
  0x2cb3bd0: mov      x0, x21
  0x2cb3bd4: blr      x8
  0x2cb3bd8: cbnz     x22, #0x2cb3be4
  0x2cb3bdc: mov      x0, x19
  0x2cb3be0: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2cb3be4: mov      x0, x22
  0x2cb3be8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2cb3bec: bl       #0x1f86e18 ; -> ??? 0x1f86e18
