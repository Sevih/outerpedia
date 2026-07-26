; ===== CStateBattle_PvpPenalty_PlayDamage @ 0x24dc250..0x24dc80c (taille 1468 octets) =====
  0x24dc250: sub      sp, sp, #0xc0
  0x24dc254: stp      d9, d8, [sp, #0x50]
  0x24dc258: stp      x29, x30, [sp, #0x60]
  0x24dc25c: stp      x28, x27, [sp, #0x70]
  0x24dc260: stp      x26, x25, [sp, #0x80]
  0x24dc264: stp      x24, x23, [sp, #0x90]
  0x24dc268: stp      x22, x21, [sp, #0xa0]
  0x24dc26c: stp      x20, x19, [sp, #0xb0]
  0x24dc270: adrp     x22, #0x5956000
  0x24dc274: adrp     x20, #0x5511000
  0x24dc278: ldrb     w8, [x22, #0x98e]
  0x24dc27c: ldr      x20, [x20, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x24dc280: mov      x19, x1
  0x24dc284: mov      x21, x0
  0x24dc288: tbnz     w8, #0, #0x24dc324
  0x24dc28c: adrp     x0, #0x5511000
  0x24dc290: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x24dc294: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc298: adrp     x0, #0x5511000
  0x24dc29c: ldr      x0, [x0, #0x980] ; = 0x0 (u64 @ 0x5511980)
  0x24dc2a0: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2a4: adrp     x0, #0x5511000
  0x24dc2a8: ldr      x0, [x0, #0x988] ; = 0x0 (u64 @ 0x5511988)
  0x24dc2ac: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2b0: adrp     x0, #0x5511000
  0x24dc2b4: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x24dc2b8: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2bc: adrp     x0, #0x5511000
  0x24dc2c0: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x24dc2c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2c8: adrp     x0, #0x5511000
  0x24dc2cc: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x24dc2d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2d4: adrp     x0, #0x5511000
  0x24dc2d8: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5511850)
  0x24dc2dc: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2e0: adrp     x0, #0x5511000
  0x24dc2e4: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x24dc2e8: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2ec: adrp     x0, #0x5511000
  0x24dc2f0: ldr      x0, [x0, #0x9f8] ; = 0x0 (u64 @ 0x55119f8)
  0x24dc2f4: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc2f8: adrp     x0, #0x5511000
  0x24dc2fc: ldr      x0, [x0, #0xa00] ; = 0x0 (u64 @ 0x5511a00)
  0x24dc300: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc304: adrp     x0, #0x5511000
  0x24dc308: ldr      x0, [x0, #0xa08] ; = 0x0 (u64 @ 0x5511a08)
  0x24dc30c: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc310: adrp     x0, #0x550f000
  0x24dc314: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x24dc318: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc31c: mov      w8, #1
  0x24dc320: strb     w8, [x22, #0x98e]
  0x24dc324: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x24dc328: stp      xzr, xzr, [sp, #0x30]
  0x24dc32c: str      xzr, [sp, #0x40]
  0x24dc330: ldr      w8, [x0, #0xe0]
  0x24dc334: cbnz     w8, #0x24dc33c
  0x24dc338: bl       #0x218489c ; -> ??? 0x218489c
  0x24dc33c: mov      x0, xzr
  0x24dc340: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x24dc344: cbz      x0, #0x24dc6fc
  0x24dc348: mov      w1, #0x17
  0x24dc34c: mov      x2, xzr
  0x24dc350: bl       #0x25eeaa0 ; -> CTempletManager$$GetDamageTypeTemplet
  0x24dc354: cbz      x21, #0x24dc6fc
  0x24dc358: mov      x20, x0
  0x24dc35c: ldr      x0, [x21, #0x10]
  0x24dc360: cbz      x0, #0x24dc6fc
  0x24dc364: adrp     x8, #0x5511000
  0x24dc368: ldr      x8, [x8, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x24dc36c: adrp     x27, #0x5511000
  0x24dc370: adrp     x28, #0x550f000
  0x24dc374: adrp     x29, #0x5511000
  0x24dc378: ldr      x27, [x27, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x24dc37c: ldr      x28, [x28, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x24dc380: ldr      x29, [x29, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x24dc384: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc388: adrp     x26, #0x5511000
  0x24dc38c: ldr      x26, [x26, #0xa08] ; = 0x0 (u64 @ 0x5511a08)
  0x24dc390: add      x8, sp, #0x18
  0x24dc394: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24dc398: adrp     x21, #0x5511000
  0x24dc39c: adrp     x9, #0x1056000
  0x24dc3a0: ldur     q0, [sp, #0x18]
  0x24dc3a4: ldr      x8, [sp, #0x28]
  0x24dc3a8: ldr      x21, [x21, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x24dc3ac: ldr      s9, [x9, #0x3bc] ; = 9.999999439624929e-11 (f32 @ 0x10563bc)
  0x24dc3b0: adrp     x22, #0x5955000
  0x24dc3b4: fmov     s8, #-1.00000000
  0x24dc3b8: str      q0, [sp, #0x30]
  0x24dc3bc: str      x8, [sp, #0x40]
  0x24dc3c0: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5511000)
  0x24dc3c4: add      x0, sp, #0x30
  0x24dc3c8: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24dc3cc: tbz      w0, #0, #0x24dc698
  0x24dc3d0: ldr      x0, [x28] ; = 0x0 (u64 @ 0x550f000)
  0x24dc3d4: ldr      x23, [sp, #0x40]
  0x24dc3d8: ldr      w8, [x0, #0xe0]
  0x24dc3dc: cbnz     w8, #0x24dc3e4
  0x24dc3e0: bl       #0x218489c ; -> ??? 0x218489c
  0x24dc3e4: mov      x0, x23
  0x24dc3e8: mov      x1, xzr
  0x24dc3ec: bl       #0x4f8524c ; -> UnityEngine.Object$$op_Implicit
  0x24dc3f0: tbz      w0, #0, #0x24dc3c0
  0x24dc3f4: cbz      x23, #0x24dc6dc
  0x24dc3f8: ldr      x0, [x23, #0x28]
  0x24dc3fc: cbz      x0, #0x24dc6e0
  0x24dc400: mov      x1, xzr
  0x24dc404: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x24dc408: mov      w24, w0
  0x24dc40c: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5511000)
  0x24dc410: ldr      w25, [x19]
  0x24dc414: ldr      w8, [x0, #0xe0]
  0x24dc418: cbnz     w8, #0x24dc420
  0x24dc41c: bl       #0x218489c ; -> ??? 0x218489c
  0x24dc420: mov      w0, w24
  0x24dc424: mov      w1, w25
  0x24dc428: mov      x2, xzr
  0x24dc42c: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x24dc430: mov      w24, w0
  0x24dc434: neg      w1, w0
  0x24dc438: mov      w3, #1
  0x24dc43c: mov      x0, x23
  0x24dc440: mov      w2, wzr
  0x24dc444: mov      w4, wzr
  0x24dc448: mov      x5, xzr
  0x24dc44c: bl       #0x26c5fd8 ; -> CCharacterBattle$$AddHP
  0x24dc450: ldrb     w8, [x22, #0x8f3]
  0x24dc454: cbnz     w8, #0x24dc468
  0x24dc458: mov      x0, x21
  0x24dc45c: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc460: mov      w8, #1
  0x24dc464: strb     w8, [x22, #0x8f3]
  0x24dc468: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x24dc46c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x24dc470: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc474: cbz      x8, #0x24dc6d4
  0x24dc478: ldr      x25, [x8, #0x68] ; = 0x0 (u64 @ 0x5511068)
  0x24dc47c: mov      x0, x23
  0x24dc480: mov      x1, xzr
  0x24dc484: bl       #0x4f7f1a8 ; -> UnityEngine.Component$$get_transform
  0x24dc488: cbz      x25, #0x24dc6d8
  0x24dc48c: mov      x4, x0
  0x24dc490: mov      x0, x25
  0x24dc494: mov      w1, w24
  0x24dc498: mov      w2, wzr
  0x24dc49c: mov      w3, wzr
  0x24dc4a0: mov      w5, wzr
  0x24dc4a4: mov      x6, xzr
  0x24dc4a8: bl       #0x28bc9fc ; -> CUIHud$$PlayHudTextDamage
  0x24dc4ac: mov      x0, x23
  0x24dc4b0: mov      x1, xzr
  0x24dc4b4: bl       #0x26c5f5c ; -> CCharacterBattle$$get_HP
  0x24dc4b8: cbnz     w0, #0x24dc4e0
  0x24dc4bc: mov      x0, x23
  0x24dc4c0: mov      x1, xzr
  0x24dc4c4: bl       #0x27d18b4 ; -> CCharacter$$get_IsAlive
  0x24dc4c8: tbz      w0, #0, #0x24dc4e0
  0x24dc4cc: ldr      x8, [x23]
  0x24dc4d0: ldp      x9, x2, [x8, #0x198]
  0x24dc4d4: mov      x0, x23
  0x24dc4d8: mov      w1, wzr
  0x24dc4dc: blr      x9
  0x24dc4e0: cbz      x20, #0x24dc6d0
  0x24dc4e4: ldr      x8, [x20, #0x38] ; = 0x0 (u64 @ 0x5511038)
  0x24dc4e8: cbz      x8, #0x24dc6e4
  0x24dc4ec: ldr      w8, [x8, #0x18]
  0x24dc4f0: cmp      w8, #1
  0x24dc4f4: b.lt     #0x24dc544
  0x24dc4f8: adrp     x8, #0x5511000
  0x24dc4fc: ldr      x8, [x8, #0x988] ; = 0x0 (u64 @ 0x5511988)
  0x24dc500: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc504: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x24dc508: mov      x24, x0
  0x24dc50c: mov      x0, x20
  0x24dc510: mov      x1, xzr
  0x24dc514: bl       #0x25a80a4 ; -> CDamageTypeTemplet$$get_SoundName
  0x24dc518: mov      x25, x0
  0x24dc51c: mov      x0, x23
  0x24dc520: mov      x1, xzr
  0x24dc524: bl       #0x4f7f1e4 ; -> UnityEngine.Component$$get_gameObject
  0x24dc528: cbz      x24, #0x24dc6f4
  0x24dc52c: mov      x3, x0
  0x24dc530: mov      x0, x24
  0x24dc534: mov      w1, wzr
  0x24dc538: mov      x2, x25
  0x24dc53c: mov      x4, xzr
  0x24dc540: bl       #0x2598ff0 ; -> CSoundManager$$PlaySound
  0x24dc544: ldr      x8, [x20, #0x50] ; = 0x0 (u64 @ 0x5511050)
  0x24dc548: cbz      x8, #0x24dc6e8
  0x24dc54c: ldr      w8, [x8, #0x18]
  0x24dc550: cmp      w8, #1
  0x24dc554: b.lt     #0x24dc624
  0x24dc558: adrp     x8, #0x5511000
  0x24dc55c: ldr      x8, [x8, #0x980] ; = 0x0 (u64 @ 0x5511980)
  0x24dc560: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc564: bl       #0x3df53ec ; -> CSingletonBehaviour<object>$$get_Instance
  0x24dc568: mov      x24, x0
  0x24dc56c: ldr      x0, [x20, #0x50] ; = 0x0 (u64 @ 0x5511050)
  0x24dc570: cbz      x0, #0x24dc6f0
  0x24dc574: adrp     x8, #0x5511000
  0x24dc578: ldr      x8, [x8, #0xa00] ; = 0x0 (u64 @ 0x5511a00)
  0x24dc57c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc580: mov      w1, wzr
  0x24dc584: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x24dc588: mov      x25, x0
  0x24dc58c: mov      x0, x23
  0x24dc590: mov      x1, xzr
  0x24dc594: bl       #0x4f7f1a8 ; -> UnityEngine.Component$$get_transform
  0x24dc598: cbz      x0, #0x24dc6ec
  0x24dc59c: mov      x1, xzr
  0x24dc5a0: bl       #0x4f8ba74 ; -> UnityEngine.Transform$$get_position
  0x24dc5a4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x24dc5a8: stp      xzr, xzr, [sp, #0x18]
  0x24dc5ac: add      x0, sp, #0x18
  0x24dc5b0: bl       #0x45b667c ; -> System.Nullable<Vector3>$$.ctor
  0x24dc5b4: adrp     x8, #0x5955000
  0x24dc5b8: ldrb     w8, [x8, #0x8f8]
  0x24dc5bc: cbnz     w8, #0x24dc5d8
  0x24dc5c0: adrp     x0, #0x5511000
  0x24dc5c4: ldr      x0, [x0, #0x400] ; = 0x0 (u64 @ 0x5511400)
  0x24dc5c8: bl       #0x2184724 ; -> ??? 0x2184724
  0x24dc5cc: mov      w8, #1
  0x24dc5d0: adrp     x9, #0x5955000
  0x24dc5d4: strb     w8, [x9, #0x8f8]
  0x24dc5d8: adrp     x8, #0x5511000
  0x24dc5dc: ldr      x8, [x8, #0x400] ; = 0x0 (u64 @ 0x5511400)
  0x24dc5e0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x24dc5e4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc5e8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x24dc5ec: ldp      s0, s1, [x8]
  0x24dc5f0: ldr      s2, [x8, #8] ; = 0.0 (f32 @ 0x5511008)
  0x24dc5f4: stp      xzr, xzr, [sp, #8]
  0x24dc5f8: add      x0, sp, #8
  0x24dc5fc: bl       #0x45b667c ; -> System.Nullable<Vector3>$$.ctor
  0x24dc600: cbz      x24, #0x24dc6f8
  0x24dc604: ldp      x4, x5, [sp, #0x18]
  0x24dc608: ldp      x6, x7, [sp, #8]
  0x24dc60c: mov      x0, x24
  0x24dc610: mov      x1, x25
  0x24dc614: mov      x2, x23
  0x24dc618: mov      x3, x23
  0x24dc61c: str      xzr, [sp]
  0x24dc620: bl       #0x2b94abc ; -> CEffectManager$$Play
  0x24dc624: mov      x0, x20
  0x24dc628: mov      x1, xzr
  0x24dc62c: bl       #0x25a7f98 ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x24dc630: fmul     s0, s0, s0
  0x24dc634: fmul     s1, s1, s1
  0x24dc638: fadd     s3, s3, s8
  0x24dc63c: fmul     s2, s2, s2
  0x24dc640: fadd     s0, s0, s1
  0x24dc644: fadd     s0, s2, s0
  0x24dc648: fmul     s1, s3, s3
  0x24dc64c: fadd     s0, s1, s0
  0x24dc650: fcmp     s0, s9
  0x24dc654: b.mi     #0x24dc680
  0x24dc658: ldr      s0, [x20, #0x30] ; = 0.0 (f32 @ 0x5511030)
  0x24dc65c: fcmp     s0, #0.0
  0x24dc660: b.eq     #0x24dc680
  0x24dc664: mov      x0, x20
  0x24dc668: mov      x1, xzr
  0x24dc66c: bl       #0x25a7f98 ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x24dc670: ldr      s4, [x20, #0x30] ; = 0.0 (f32 @ 0x5511030)
  0x24dc674: mov      x0, x23
  0x24dc678: mov      x1, xzr
  0x24dc67c: bl       #0x27db100 ; -> CCharacter$$PlayHitLightEffect
  0x24dc680: mov      w1, #1
  0x24dc684: mov      x0, x23
  0x24dc688: mov      w2, wzr
  0x24dc68c: mov      x3, xzr
  0x24dc690: bl       #0x27dad6c ; -> CCharacter$$ChangeDamageReactState
  0x24dc694: b        #0x24dc3c0
  0x24dc698: adrp     x8, #0x5511000
  0x24dc69c: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x24dc6a0: add      x0, sp, #0x30
  0x24dc6a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc6a8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24dc6ac: ldp      x20, x19, [sp, #0xb0]
  0x24dc6b0: ldp      x22, x21, [sp, #0xa0]
  0x24dc6b4: ldp      x24, x23, [sp, #0x90]
  0x24dc6b8: ldp      x26, x25, [sp, #0x80]
  0x24dc6bc: ldp      x28, x27, [sp, #0x70]
  0x24dc6c0: ldp      x29, x30, [sp, #0x60]
  0x24dc6c4: ldp      d9, d8, [sp, #0x50]
  0x24dc6c8: add      sp, sp, #0xc0
  0x24dc6cc: ret      
  0x24dc6d0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6d4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6d8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6dc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6e0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6e4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6e8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6ec: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6f0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6f4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6f8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc6fc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24dc700: b        #0x24dc798
  0x24dc704: b        #0x24dc798
  0x24dc708: b        #0x24dc798
  0x24dc70c: b        #0x24dc798
  0x24dc710: b        #0x24dc798
  0x24dc714: b        #0x24dc798
  0x24dc718: b        #0x24dc798
  0x24dc71c: b        #0x24dc798
  0x24dc720: b        #0x24dc798
  0x24dc724: b        #0x24dc798
  0x24dc728: b        #0x24dc798
  0x24dc72c: b        #0x24dc798
  0x24dc730: b        #0x24dc798
  0x24dc734: b        #0x24dc798
  0x24dc738: b        #0x24dc798
  0x24dc73c: b        #0x24dc798
  0x24dc740: b        #0x24dc798
  0x24dc744: b        #0x24dc798
  0x24dc748: b        #0x24dc798
  0x24dc74c: b        #0x24dc798
  0x24dc750: b        #0x24dc798
  0x24dc754: b        #0x24dc798
  0x24dc758: b        #0x24dc798
  0x24dc75c: b        #0x24dc798
  0x24dc760: b        #0x24dc798
  0x24dc764: b        #0x24dc798
  0x24dc768: b        #0x24dc798
  0x24dc76c: b        #0x24dc798
  0x24dc770: b        #0x24dc798
  0x24dc774: b        #0x24dc798
  0x24dc778: b        #0x24dc798
  0x24dc77c: b        #0x24dc798
  0x24dc780: b        #0x24dc798
  0x24dc784: b        #0x24dc798
  0x24dc788: b        #0x24dc798
  0x24dc78c: b        #0x24dc798
  0x24dc790: b        #0x24dc798
  0x24dc794: b        #0x24dc798
  0x24dc798: mov      x19, x0
  0x24dc79c: cmp      w1, #1
  0x24dc7a0: b.ne     #0x24dc7d4
  0x24dc7a4: mov      x0, x19
  0x24dc7a8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24dc7ac: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x24dc7b0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24dc7b4: adrp     x8, #0x5511000
  0x24dc7b8: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x24dc7bc: add      x0, sp, #0x30
  0x24dc7c0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc7c4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24dc7c8: cbz      x20, #0x24dc6ac
  0x24dc7cc: mov      x0, x20
  0x24dc7d0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24dc7d4: mov      x20, xzr
  0x24dc7d8: b        #0x24dc7e0
  0x24dc7dc: mov      x19, x0
  0x24dc7e0: adrp     x8, #0x5511000
  0x24dc7e4: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x24dc7e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x24dc7ec: add      x0, sp, #0x30
  0x24dc7f0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24dc7f4: cbnz     x20, #0x24dc800
  0x24dc7f8: mov      x0, x19
  0x24dc7fc: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x24dc800: mov      x0, x20
  0x24dc804: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24dc808: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
