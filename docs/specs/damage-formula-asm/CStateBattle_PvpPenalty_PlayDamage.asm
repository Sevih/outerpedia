; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStateBattle_PvpPenalty_PlayDamage @ 0x251e4e0..0x251ea9c (taille 1468 octets) =====
  0x251e4e0: sub      sp, sp, #0xc0
  0x251e4e4: stp      d9, d8, [sp, #0x50]
  0x251e4e8: stp      x29, x30, [sp, #0x60]
  0x251e4ec: stp      x28, x27, [sp, #0x70]
  0x251e4f0: stp      x26, x25, [sp, #0x80]
  0x251e4f4: stp      x24, x23, [sp, #0x90]
  0x251e4f8: stp      x22, x21, [sp, #0xa0]
  0x251e4fc: stp      x20, x19, [sp, #0xb0]
  0x251e500: adrp     x22, #0x59d6000
  0x251e504: adrp     x20, #0x558a000
  0x251e508: ldrb     w8, [x22, #0xf1]
  0x251e50c: ldr      x20, [x20, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x251e510: mov      x19, x1
  0x251e514: mov      x21, x0
  0x251e518: tbnz     w8, #0, #0x251e5b4
  0x251e51c: adrp     x0, #0x558a000
  0x251e520: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x251e524: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e528: adrp     x0, #0x558a000
  0x251e52c: ldr      x0, [x0, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x251e530: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e534: adrp     x0, #0x558a000
  0x251e538: ldr      x0, [x0, #0x3b8] ; = 0x0 (u64 @ 0x558a3b8)
  0x251e53c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e540: adrp     x0, #0x558a000
  0x251e544: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x251e548: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e54c: adrp     x0, #0x558a000
  0x251e550: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x251e554: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e558: adrp     x0, #0x558a000
  0x251e55c: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x251e560: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e564: adrp     x0, #0x558a000
  0x251e568: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x251e56c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e570: adrp     x0, #0x558a000
  0x251e574: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x251e578: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e57c: adrp     x0, #0x558a000
  0x251e580: ldr      x0, [x0, #0x428] ; = 0x0 (u64 @ 0x558a428)
  0x251e584: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e588: adrp     x0, #0x558a000
  0x251e58c: ldr      x0, [x0, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x251e590: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e594: adrp     x0, #0x558a000
  0x251e598: ldr      x0, [x0, #0x438] ; = 0x0 (u64 @ 0x558a438)
  0x251e59c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e5a0: adrp     x0, #0x5587000
  0x251e5a4: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x251e5a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e5ac: mov      w8, #1
  0x251e5b0: strb     w8, [x22, #0xf1]
  0x251e5b4: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x251e5b8: stp      xzr, xzr, [sp, #0x30]
  0x251e5bc: str      xzr, [sp, #0x40]
  0x251e5c0: ldr      w8, [x0, #0xe0]
  0x251e5c4: cbnz     w8, #0x251e5cc
  0x251e5c8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x251e5cc: mov      x0, xzr
  0x251e5d0: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x251e5d4: cbz      x0, #0x251e98c
  0x251e5d8: mov      w1, #0x17
  0x251e5dc: mov      x2, xzr
  0x251e5e0: bl       #0x2625a28 ; -> CTempletManager$$GetDamageTypeTemplet
  0x251e5e4: cbz      x21, #0x251e98c
  0x251e5e8: mov      x20, x0
  0x251e5ec: ldr      x0, [x21, #0x10]
  0x251e5f0: cbz      x0, #0x251e98c
  0x251e5f4: adrp     x8, #0x558a000
  0x251e5f8: ldr      x8, [x8, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x251e5fc: adrp     x27, #0x558a000
  0x251e600: adrp     x28, #0x5587000
  0x251e604: adrp     x29, #0x558a000
  0x251e608: ldr      x27, [x27, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x251e60c: ldr      x28, [x28, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x251e610: ldr      x29, [x29, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x251e614: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e618: adrp     x26, #0x558a000
  0x251e61c: ldr      x26, [x26, #0x438] ; = 0x0 (u64 @ 0x558a438)
  0x251e620: add      x8, sp, #0x18
  0x251e624: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251e628: adrp     x21, #0x558a000
  0x251e62c: adrp     x9, #0x106d000
  0x251e630: ldur     q0, [sp, #0x18]
  0x251e634: ldr      x8, [sp, #0x28]
  0x251e638: ldr      x21, [x21, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x251e63c: ldr      s9, [x9, #0x5ac] ; = 9.999999439624929e-11 (f32 @ 0x106d5ac)
  0x251e640: adrp     x22, #0x59d4000
  0x251e644: fmov     s8, #-1.00000000
  0x251e648: str      q0, [sp, #0x30]
  0x251e64c: str      x8, [sp, #0x40]
  0x251e650: ldr      x1, [x27] ; = 0x0 (u64 @ 0x558a000)
  0x251e654: add      x0, sp, #0x30
  0x251e658: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x251e65c: tbz      w0, #0, #0x251e928
  0x251e660: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5587000)
  0x251e664: ldr      x23, [sp, #0x40]
  0x251e668: ldr      w8, [x0, #0xe0]
  0x251e66c: cbnz     w8, #0x251e674
  0x251e670: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x251e674: mov      x0, x23
  0x251e678: mov      x1, xzr
  0x251e67c: bl       #0x503a8e4 ; -> UnityEngine.Object$$op_Implicit
  0x251e680: tbz      w0, #0, #0x251e650
  0x251e684: cbz      x23, #0x251e96c
  0x251e688: ldr      x0, [x23, #0x28]
  0x251e68c: cbz      x0, #0x251e970
  0x251e690: mov      x1, xzr
  0x251e694: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x251e698: mov      w24, w0
  0x251e69c: ldr      x0, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x251e6a0: ldr      w25, [x19]
  0x251e6a4: ldr      w8, [x0, #0xe0]
  0x251e6a8: cbnz     w8, #0x251e6b0
  0x251e6ac: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x251e6b0: mov      w0, w24
  0x251e6b4: mov      w1, w25
  0x251e6b8: mov      x2, xzr
  0x251e6bc: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x251e6c0: mov      w24, w0
  0x251e6c4: neg      w1, w0
  0x251e6c8: mov      w3, #1
  0x251e6cc: mov      x0, x23
  0x251e6d0: mov      w2, wzr
  0x251e6d4: mov      w4, wzr
  0x251e6d8: mov      x5, xzr
  0x251e6dc: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x251e6e0: ldrb     w8, [x22, #0xfc3]
  0x251e6e4: cbnz     w8, #0x251e6f8
  0x251e6e8: mov      x0, x21
  0x251e6ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e6f0: mov      w8, #1
  0x251e6f4: strb     w8, [x22, #0xfc3]
  0x251e6f8: ldr      x8, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x251e6fc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x251e700: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e704: cbz      x8, #0x251e964
  0x251e708: ldr      x25, [x8, #0x68] ; = 0x0 (u64 @ 0x558a068)
  0x251e70c: mov      x0, x23
  0x251e710: mov      x1, xzr
  0x251e714: bl       #0x5034840 ; -> UnityEngine.Component$$get_transform
  0x251e718: cbz      x25, #0x251e968
  0x251e71c: mov      x4, x0
  0x251e720: mov      x0, x25
  0x251e724: mov      w1, w24
  0x251e728: mov      w2, wzr
  0x251e72c: mov      w3, wzr
  0x251e730: mov      w5, wzr
  0x251e734: mov      x6, xzr
  0x251e738: bl       #0x28fc644 ; -> CUIHud$$PlayHudTextDamage
  0x251e73c: mov      x0, x23
  0x251e740: mov      x1, xzr
  0x251e744: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x251e748: cbnz     w0, #0x251e770
  0x251e74c: mov      x0, x23
  0x251e750: mov      x1, xzr
  0x251e754: bl       #0x270d5c8 ; -> CCharacter$$get_IsAlive
  0x251e758: tbz      w0, #0, #0x251e770
  0x251e75c: ldr      x8, [x23]
  0x251e760: ldp      x9, x2, [x8, #0x198]
  0x251e764: mov      x0, x23
  0x251e768: mov      w1, wzr
  0x251e76c: blr      x9
  0x251e770: cbz      x20, #0x251e960
  0x251e774: ldr      x8, [x20, #0x38] ; = 0x0 (u64 @ 0x558a038)
  0x251e778: cbz      x8, #0x251e974
  0x251e77c: ldr      w8, [x8, #0x18]
  0x251e780: cmp      w8, #1
  0x251e784: b.lt     #0x251e7d4
  0x251e788: adrp     x8, #0x558a000
  0x251e78c: ldr      x8, [x8, #0x3b8] ; = 0x0 (u64 @ 0x558a3b8)
  0x251e790: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e794: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x251e798: mov      x24, x0
  0x251e79c: mov      x0, x20
  0x251e7a0: mov      x1, xzr
  0x251e7a4: bl       #0x25ee8c8 ; -> CDamageTypeTemplet$$get_SoundName
  0x251e7a8: mov      x25, x0
  0x251e7ac: mov      x0, x23
  0x251e7b0: mov      x1, xzr
  0x251e7b4: bl       #0x503487c ; -> UnityEngine.Component$$get_gameObject
  0x251e7b8: cbz      x24, #0x251e984
  0x251e7bc: mov      x3, x0
  0x251e7c0: mov      x0, x24
  0x251e7c4: mov      w1, wzr
  0x251e7c8: mov      x2, x25
  0x251e7cc: mov      x4, xzr
  0x251e7d0: bl       #0x25dee74 ; -> CSoundManager$$PlaySound
  0x251e7d4: ldr      x8, [x20, #0x50] ; = 0x0 (u64 @ 0x558a050)
  0x251e7d8: cbz      x8, #0x251e978
  0x251e7dc: ldr      w8, [x8, #0x18]
  0x251e7e0: cmp      w8, #1
  0x251e7e4: b.lt     #0x251e8b4
  0x251e7e8: adrp     x8, #0x558a000
  0x251e7ec: ldr      x8, [x8, #0x3b0] ; = 0x0 (u64 @ 0x558a3b0)
  0x251e7f0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e7f4: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x251e7f8: mov      x24, x0
  0x251e7fc: ldr      x0, [x20, #0x50] ; = 0x0 (u64 @ 0x558a050)
  0x251e800: cbz      x0, #0x251e980
  0x251e804: adrp     x8, #0x558a000
  0x251e808: ldr      x8, [x8, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x251e80c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e810: mov      w1, wzr
  0x251e814: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x251e818: mov      x25, x0
  0x251e81c: mov      x0, x23
  0x251e820: mov      x1, xzr
  0x251e824: bl       #0x5034840 ; -> UnityEngine.Component$$get_transform
  0x251e828: cbz      x0, #0x251e97c
  0x251e82c: mov      x1, xzr
  0x251e830: bl       #0x5041024 ; -> UnityEngine.Transform$$get_position
  0x251e834: ldr      x1, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x251e838: stp      xzr, xzr, [sp, #0x18]
  0x251e83c: add      x0, sp, #0x18
  0x251e840: bl       #0x4626eb0 ; -> System.Nullable<Vector3>$$.ctor
  0x251e844: adrp     x8, #0x59d4000
  0x251e848: ldrb     w8, [x8, #0xfc8]
  0x251e84c: cbnz     w8, #0x251e868
  0x251e850: adrp     x0, #0x5589000
  0x251e854: ldr      x0, [x0, #0xe30] ; = 0x0 (u64 @ 0x5589e30)
  0x251e858: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251e85c: mov      w8, #1
  0x251e860: adrp     x9, #0x59d4000
  0x251e864: strb     w8, [x9, #0xfc8]
  0x251e868: adrp     x8, #0x5589000
  0x251e86c: ldr      x8, [x8, #0xe30] ; = 0x0 (u64 @ 0x5589e30)
  0x251e870: ldr      x1, [x26] ; = 0x0 (u64 @ 0x558a000)
  0x251e874: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x251e878: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55890b8)
  0x251e87c: ldp      s0, s1, [x8]
  0x251e880: ldr      s2, [x8, #8] ; = 0.0 (f32 @ 0x5589008)
  0x251e884: stp      xzr, xzr, [sp, #8]
  0x251e888: add      x0, sp, #8
  0x251e88c: bl       #0x4626eb0 ; -> System.Nullable<Vector3>$$.ctor
  0x251e890: cbz      x24, #0x251e988
  0x251e894: ldp      x4, x5, [sp, #0x18]
  0x251e898: ldp      x6, x7, [sp, #8]
  0x251e89c: mov      x0, x24
  0x251e8a0: mov      x1, x25
  0x251e8a4: mov      x2, x23
  0x251e8a8: mov      x3, x23
  0x251e8ac: str      xzr, [sp]
  0x251e8b0: bl       #0x2be1fc4 ; -> CEffectManager$$Play
  0x251e8b4: mov      x0, x20
  0x251e8b8: mov      x1, xzr
  0x251e8bc: bl       #0x25ee7bc ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x251e8c0: fmul     s0, s0, s0
  0x251e8c4: fmul     s1, s1, s1
  0x251e8c8: fadd     s3, s3, s8
  0x251e8cc: fmul     s2, s2, s2
  0x251e8d0: fadd     s0, s0, s1
  0x251e8d4: fadd     s0, s2, s0
  0x251e8d8: fmul     s1, s3, s3
  0x251e8dc: fadd     s0, s1, s0
  0x251e8e0: fcmp     s0, s9
  0x251e8e4: b.mi     #0x251e910
  0x251e8e8: ldr      s0, [x20, #0x30] ; = 0.0 (f32 @ 0x558a030)
  0x251e8ec: fcmp     s0, #0.0
  0x251e8f0: b.eq     #0x251e910
  0x251e8f4: mov      x0, x20
  0x251e8f8: mov      x1, xzr
  0x251e8fc: bl       #0x25ee7bc ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x251e900: ldr      s4, [x20, #0x30] ; = 0.0 (f32 @ 0x558a030)
  0x251e904: mov      x0, x23
  0x251e908: mov      x1, xzr
  0x251e90c: bl       #0x2716d2c ; -> CCharacter$$PlayHitLightEffect
  0x251e910: mov      w1, #1
  0x251e914: mov      x0, x23
  0x251e918: mov      w2, wzr
  0x251e91c: mov      x3, xzr
  0x251e920: bl       #0x2716998 ; -> CCharacter$$ChangeDamageReactState
  0x251e924: b        #0x251e650
  0x251e928: adrp     x8, #0x558a000
  0x251e92c: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x251e930: add      x0, sp, #0x30
  0x251e934: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251e938: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251e93c: ldp      x20, x19, [sp, #0xb0]
  0x251e940: ldp      x22, x21, [sp, #0xa0]
  0x251e944: ldp      x24, x23, [sp, #0x90]
  0x251e948: ldp      x26, x25, [sp, #0x80]
  0x251e94c: ldp      x28, x27, [sp, #0x70]
  0x251e950: ldp      x29, x30, [sp, #0x60]
  0x251e954: ldp      d9, d8, [sp, #0x50]
  0x251e958: add      sp, sp, #0xc0
  0x251e95c: ret      
  0x251e960: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e964: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e968: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e96c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e970: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e974: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e978: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e97c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e980: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e984: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e988: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e98c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251e990: b        #0x251ea28
  0x251e994: b        #0x251ea28
  0x251e998: b        #0x251ea28
  0x251e99c: b        #0x251ea28
  0x251e9a0: b        #0x251ea28
  0x251e9a4: b        #0x251ea28
  0x251e9a8: b        #0x251ea28
  0x251e9ac: b        #0x251ea28
  0x251e9b0: b        #0x251ea28
  0x251e9b4: b        #0x251ea28
  0x251e9b8: b        #0x251ea28
  0x251e9bc: b        #0x251ea28
  0x251e9c0: b        #0x251ea28
  0x251e9c4: b        #0x251ea28
  0x251e9c8: b        #0x251ea28
  0x251e9cc: b        #0x251ea28
  0x251e9d0: b        #0x251ea28
  0x251e9d4: b        #0x251ea28
  0x251e9d8: b        #0x251ea28
  0x251e9dc: b        #0x251ea28
  0x251e9e0: b        #0x251ea28
  0x251e9e4: b        #0x251ea28
  0x251e9e8: b        #0x251ea28
  0x251e9ec: b        #0x251ea28
  0x251e9f0: b        #0x251ea28
  0x251e9f4: b        #0x251ea28
  0x251e9f8: b        #0x251ea28
  0x251e9fc: b        #0x251ea28
  0x251ea00: b        #0x251ea28
  0x251ea04: b        #0x251ea28
  0x251ea08: b        #0x251ea28
  0x251ea0c: b        #0x251ea28
  0x251ea10: b        #0x251ea28
  0x251ea14: b        #0x251ea28
  0x251ea18: b        #0x251ea28
  0x251ea1c: b        #0x251ea28
  0x251ea20: b        #0x251ea28
  0x251ea24: b        #0x251ea28
  0x251ea28: mov      x19, x0
  0x251ea2c: cmp      w1, #1
  0x251ea30: b.ne     #0x251ea64
  0x251ea34: mov      x0, x19
  0x251ea38: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x251ea3c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5589000)
  0x251ea40: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x251ea44: adrp     x8, #0x558a000
  0x251ea48: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x251ea4c: add      x0, sp, #0x30
  0x251ea50: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251ea54: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251ea58: cbz      x20, #0x251e93c
  0x251ea5c: mov      x0, x20
  0x251ea60: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x251ea64: mov      x20, xzr
  0x251ea68: b        #0x251ea70
  0x251ea6c: mov      x19, x0
  0x251ea70: adrp     x8, #0x558a000
  0x251ea74: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x251ea78: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x251ea7c: add      x0, sp, #0x30
  0x251ea80: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251ea84: cbnz     x20, #0x251ea90
  0x251ea88: mov      x0, x19
  0x251ea8c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x251ea90: mov      x0, x20
  0x251ea94: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x251ea98: bl       #0x1f86e18 ; -> ??? 0x1f86e18
