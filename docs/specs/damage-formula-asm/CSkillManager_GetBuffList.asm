; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_GetBuffList @ 0x2510400..0x2511ce4 (taille 6372 octets) =====
  0x2510400: sub      sp, sp, #0xc0
  0x2510404: stp      x29, x30, [sp, #0x60]
  0x2510408: stp      x28, x27, [sp, #0x70]
  0x251040c: stp      x26, x25, [sp, #0x80]
  0x2510410: stp      x24, x23, [sp, #0x90]
  0x2510414: stp      x22, x21, [sp, #0xa0]
  0x2510418: stp      x20, x19, [sp, #0xb0]
  0x251041c: adrp     x22, #0x59d6000
  0x2510420: ldrb     w8, [x22, #0x99]
  0x2510424: mov      x19, x4
  0x2510428: mov      w20, w3
  0x251042c: mov      w24, w2
  0x2510430: mov      w21, w1
  0x2510434: mov      x29, x0
  0x2510438: tbnz     w8, #0, #0x25104f8
  0x251043c: adrp     x0, #0x5599000
  0x2510440: ldr      x0, [x0, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x2510444: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510448: adrp     x0, #0x5599000
  0x251044c: ldr      x0, [x0, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2510450: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510454: adrp     x0, #0x5599000
  0x2510458: ldr      x0, [x0, #0x4b0] ; = 0x0 (u64 @ 0x55994b0)
  0x251045c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510460: adrp     x0, #0x5599000
  0x2510464: ldr      x0, [x0, #0x570] ; = 0x0 (u64 @ 0x5599570)
  0x2510468: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251046c: adrp     x0, #0x5599000
  0x2510470: ldr      x0, [x0, #0x578] ; = 0x0 (u64 @ 0x5599578)
  0x2510474: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510478: adrp     x0, #0x5599000
  0x251047c: ldr      x0, [x0, #0x4b8] ; = 0x0 (u64 @ 0x55994b8)
  0x2510480: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510484: adrp     x0, #0x558b000
  0x2510488: ldr      x0, [x0, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x251048c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2510490: adrp     x0, #0x5599000
  0x2510494: ldr      x0, [x0, #0x670] ; = 0x0 (u64 @ 0x5599670)
  0x2510498: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251049c: adrp     x0, #0x5599000
  0x25104a0: ldr      x0, [x0, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x25104a4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104a8: adrp     x0, #0x5599000
  0x25104ac: ldr      x0, [x0, #0x580] ; = 0x0 (u64 @ 0x5599580)
  0x25104b0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104b4: adrp     x0, #0x5599000
  0x25104b8: ldr      x0, [x0, #0x678] ; = 0x0 (u64 @ 0x5599678)
  0x25104bc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104c0: adrp     x0, #0x5599000
  0x25104c4: ldr      x0, [x0, #0x680] ; = 0x0 (u64 @ 0x5599680)
  0x25104c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104cc: adrp     x0, #0x5599000
  0x25104d0: ldr      x0, [x0, #0x688] ; = 0x0 (u64 @ 0x5599688)
  0x25104d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104d8: adrp     x0, #0x5599000
  0x25104dc: ldr      x0, [x0, #0x690] ; = 0x0 (u64 @ 0x5599690)
  0x25104e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104e4: adrp     x0, #0x5599000
  0x25104e8: ldr      x0, [x0, #0x698] ; = 0x0 (u64 @ 0x5599698)
  0x25104ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x25104f0: mov      w8, #1
  0x25104f4: strb     w8, [x22, #0x99]
  0x25104f8: adrp     x28, #0x5599000
  0x25104fc: adrp     x27, #0x558b000
  0x2510500: adrp     x26, #0x5599000
  0x2510504: ldr      x28, [x28, #0x4b0] ; = 0x0 (u64 @ 0x55994b0)
  0x2510508: ldr      x27, [x27, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x251050c: ldr      x26, [x26, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2510510: cmp      w21, #0x17
  0x2510514: stp      xzr, xzr, [sp, #0x40]
  0x2510518: str      xzr, [sp, #0x50]
  0x251051c: stp      xzr, xzr, [sp, #0x20]
  0x2510520: str      xzr, [sp, #0x30]
  0x2510524: b.eq     #0x2510880
  0x2510528: cmp      w21, #0x18
  0x251052c: b.ne     #0x2510780
  0x2510530: ldr      x0, [x29, #0x10]
  0x2510534: cbz      x0, #0x25116e4
  0x2510538: adrp     x8, #0x5599000
  0x251053c: ldr      x8, [x8, #0x580] ; = 0x0 (u64 @ 0x5599580)
  0x2510540: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510544: add      x8, sp, #8
  0x2510548: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251054c: ldur     q0, [sp, #8]
  0x2510550: ldr      x8, [sp, #0x18]
  0x2510554: adrp     x22, #0x5599000
  0x2510558: str      q0, [sp, #0x40]
  0x251055c: str      x8, [sp, #0x50]
  0x2510560: ldr      x22, [x22, #0x570] ; = 0x0 (u64 @ 0x5599570)
  0x2510564: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2510568: add      x0, sp, #0x40
  0x251056c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510570: tbz      w0, #0, #0x25106e0
  0x2510574: ldr      x8, [sp, #0x50]
  0x2510578: cbz      x8, #0x2510720
  0x251057c: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x5599030)
  0x2510580: cbz      x0, #0x2510714
  0x2510584: adrp     x8, #0x5599000
  0x2510588: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x251058c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510590: add      x8, sp, #8
  0x2510594: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510598: ldur     q0, [sp, #8]
  0x251059c: ldr      x8, [sp, #0x18]
  0x25105a0: str      q0, [sp, #0x20]
  0x25105a4: str      x8, [sp, #0x30]
  0x25105a8: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x25105ac: add      x0, sp, #0x20
  0x25105b0: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x25105b4: tbz      w0, #0, #0x2510668
  0x25105b8: ldr      x23, [sp, #0x30]
  0x25105bc: cbz      x23, #0x2510690
  0x25105c0: ldr      w8, [x23, #0x24]
  0x25105c4: cmp      w8, #0x20
  0x25105c8: b.ne     #0x25105d8
  0x25105cc: ldr      w8, [x23, #0x28]
  0x25105d0: cmp      w8, #1
  0x25105d4: b.eq     #0x25105a8
  0x25105d8: mov      x0, x23
  0x25105dc: mov      w1, w20
  0x25105e0: mov      x2, xzr
  0x25105e4: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x25105e8: tbz      w0, #0, #0x25105a8
  0x25105ec: mov      w1, #0x18
  0x25105f0: mov      x0, x23
  0x25105f4: mov      x2, xzr
  0x25105f8: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x25105fc: tbz      w0, #0, #0x25105a8
  0x2510600: ldr      x0, [x19]
  0x2510604: cbz      x0, #0x25106a0
  0x2510608: ldr      w10, [x0, #0x1c]
  0x251060c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510610: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510614: add      w10, w10, #1
  0x2510618: str      w10, [x0, #0x1c]
  0x251061c: cbz      x8, #0x2510698
  0x2510620: ldrsw    x10, [x0, #0x18]
  0x2510624: ldr      w11, [x8, #0x18]
  0x2510628: cmp      w10, w11
  0x251062c: b.hs     #0x2510650
  0x2510630: add      w9, w10, #1
  0x2510634: add      x8, x8, x10, lsl #3
  0x2510638: str      w9, [x0, #0x18]
  0x251063c: str      x23, [x8, #0x20]!
  0x2510640: mov      x0, x8
  0x2510644: mov      x1, x23
  0x2510648: bl       #0x21af920 ; -> ??? 0x21af920
  0x251064c: b        #0x25105a8
  0x2510650: ldr      x8, [x9, #0x20]
  0x2510654: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510658: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x251065c: mov      x1, x23
  0x2510660: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510664: b        #0x25105a8
  0x2510668: mov      x25, xzr
  0x251066c: mov      w23, #3
  0x2510670: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510674: add      x0, sp, #0x20
  0x2510678: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251067c: cbnz     x25, #0x2510718
  0x2510680: cmp      w23, #3
  0x2510684: b.eq     #0x2510564
  0x2510688: cbz      w23, #0x2510564
  0x251068c: b        #0x25115f0
  0x2510690: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510694: b        #0x2510724
  0x2510698: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251069c: b        #0x2510724
  0x25106a0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25106a4: b        #0x2510724
  0x25106a8: b        #0x25106bc
  0x25106ac: b        #0x25106bc
  0x25106b0: b        #0x25106bc
  0x25106b4: b        #0x25106bc
  0x25106b8: b        #0x25106bc
  0x25106bc: mov      x23, x0
  0x25106c0: cmp      w1, #1
  0x25106c4: b.ne     #0x25106f4
  0x25106c8: mov      x0, x23
  0x25106cc: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x25106d0: ldr      x25, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x25106d4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x25106d8: mov      w23, wzr
  0x25106dc: b        #0x2510670
  0x25106e0: adrp     x8, #0x5599000
  0x25106e4: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x25106e8: add      x0, sp, #0x40
  0x25106ec: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x25106f0: b        #0x251087c
  0x25106f4: str      x1, [sp]
  0x25106f8: mov      x25, xzr
  0x25106fc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510700: add      x0, sp, #0x20
  0x2510704: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510708: cbz      x25, #0x251074c
  0x251070c: mov      x0, x25
  0x2510710: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2510714: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510718: mov      x0, x25
  0x251071c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2510720: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510724: mov      x23, x0
  0x2510728: str      x1, [sp]
  0x251072c: b        #0x25106fc
  0x2510730: b        #0x2510744
  0x2510734: b        #0x2510744
  0x2510738: b        #0x2510744
  0x251073c: b        #0x2510744
  0x2510740: b        #0x2510744
  0x2510744: mov      x23, x0
  0x2510748: str      x1, [sp]
  0x251074c: ldr      x8, [sp]
  0x2510750: cmp      w8, #1
  0x2510754: b.ne     #0x25116fc
  0x2510758: mov      x0, x23
  0x251075c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2510760: ldr      x25, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2510764: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2510768: adrp     x8, #0x5599000
  0x251076c: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x2510770: add      x0, sp, #0x40
  0x2510774: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510778: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251077c: cbnz     x25, #0x25117e8
  0x2510780: mov      x0, x29
  0x2510784: mov      w1, w21
  0x2510788: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x251078c: cbz      x0, #0x2510880
  0x2510790: mov      x0, x29
  0x2510794: mov      w1, w21
  0x2510798: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x251079c: cbz      x0, #0x25116e4
  0x25107a0: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x5599030)
  0x25107a4: cbz      x0, #0x25116e4
  0x25107a8: adrp     x8, #0x5599000
  0x25107ac: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x25107b0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x25107b4: add      x8, sp, #8
  0x25107b8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x25107bc: ldur     q0, [sp, #8]
  0x25107c0: ldr      x8, [sp, #0x18]
  0x25107c4: str      q0, [sp, #0x20]
  0x25107c8: str      x8, [sp, #0x30]
  0x25107cc: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x25107d0: add      x0, sp, #0x20
  0x25107d4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x25107d8: tbz      w0, #0, #0x2510874
  0x25107dc: ldr      x23, [sp, #0x30]
  0x25107e0: cbz      x23, #0x2511680
  0x25107e4: mov      x0, x23
  0x25107e8: mov      w1, w20
  0x25107ec: mov      x2, xzr
  0x25107f0: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x25107f4: tbz      w0, #0, #0x25107cc
  0x25107f8: mov      x0, x23
  0x25107fc: mov      w1, w21
  0x2510800: mov      x2, xzr
  0x2510804: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510808: tbz      w0, #0, #0x25107cc
  0x251080c: ldr      x0, [x19]
  0x2510810: cbz      x0, #0x25116ec
  0x2510814: ldr      w10, [x0, #0x1c]
  0x2510818: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x251081c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510820: add      w10, w10, #1
  0x2510824: str      w10, [x0, #0x1c]
  0x2510828: cbz      x8, #0x25116f0
  0x251082c: ldrsw    x10, [x0, #0x18]
  0x2510830: ldr      w11, [x8, #0x18]
  0x2510834: cmp      w10, w11
  0x2510838: b.hs     #0x251085c
  0x251083c: add      w9, w10, #1
  0x2510840: add      x8, x8, x10, lsl #3
  0x2510844: str      w9, [x0, #0x18]
  0x2510848: str      x23, [x8, #0x20]!
  0x251084c: mov      x0, x8
  0x2510850: mov      x1, x23
  0x2510854: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510858: b        #0x25107cc
  0x251085c: ldr      x8, [x9, #0x20]
  0x2510860: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510864: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510868: mov      x1, x23
  0x251086c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510870: b        #0x25107cc
  0x2510874: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510878: add      x0, sp, #0x20
  0x251087c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510880: tbz      w24, #0, #0x2510cb8
  0x2510884: ldr      x0, [x29, #0x10]
  0x2510888: str      x29, [sp]
  0x251088c: cbz      x0, #0x25116e4
  0x2510890: adrp     x8, #0x5599000
  0x2510894: ldr      x8, [x8, #0x580] ; = 0x0 (u64 @ 0x5599580)
  0x2510898: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x251089c: add      x8, sp, #8
  0x25108a0: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x25108a4: ldur     q0, [sp, #8]
  0x25108a8: ldr      x8, [sp, #0x18]
  0x25108ac: adrp     x29, #0x5599000
  0x25108b0: adrp     x27, #0x5599000
  0x25108b4: ldr      x29, [x29, #0x688] ; = 0x0 (u64 @ 0x5599688)
  0x25108b8: ldr      x27, [x27, #0x680] ; = 0x0 (u64 @ 0x5599680)
  0x25108bc: str      q0, [sp, #0x40]
  0x25108c0: str      x8, [sp, #0x50]
  0x25108c4: adrp     x22, #0x5599000
  0x25108c8: ldr      x22, [x22, #0x670] ; = 0x0 (u64 @ 0x5599670)
  0x25108cc: adrp     x8, #0x5599000
  0x25108d0: ldr      x8, [x8, #0x570] ; = 0x0 (u64 @ 0x5599570)
  0x25108d4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x25108d8: add      x0, sp, #0x40
  0x25108dc: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x25108e0: tbz      w0, #0, #0x2510afc
  0x25108e4: ldr      x8, [sp, #0x50]
  0x25108e8: cbz      x8, #0x2511670
  0x25108ec: ldr      x9, [x8, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x25108f0: cbz      x9, #0x2511674
  0x25108f4: ldr      w9, [x9, #0x3c]
  0x25108f8: cmp      w9, #1
  0x25108fc: b.le     #0x25108cc
  0x2510900: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x5599030)
  0x2510904: cbz      x0, #0x2511684
  0x2510908: adrp     x8, #0x5599000
  0x251090c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510910: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510914: add      x8, sp, #8
  0x2510918: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251091c: ldur     q0, [sp, #8]
  0x2510920: ldr      x8, [sp, #0x18]
  0x2510924: str      q0, [sp, #0x20]
  0x2510928: str      x8, [sp, #0x30]
  0x251092c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510930: add      x0, sp, #0x20
  0x2510934: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510938: tbz      w0, #0, #0x2510a44
  0x251093c: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x2510940: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2510944: mov      x24, x0
  0x2510948: mov      x1, xzr
  0x251094c: bl       #0x49475a0 ; -> System.Object$$.ctor
  0x2510950: cbz      x24, #0x2510a74
  0x2510954: ldr      x1, [sp, #0x30]
  0x2510958: mov      x23, x24
  0x251095c: str      x1, [x23, #0x10]!
  0x2510960: mov      x0, x23
  0x2510964: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510968: ldr      x0, [x23]
  0x251096c: cbz      x0, #0x2510a7c
  0x2510970: mov      w1, w20
  0x2510974: mov      x2, xzr
  0x2510978: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x251097c: tbz      w0, #0, #0x251092c
  0x2510980: ldr      x0, [x23]
  0x2510984: cbz      x0, #0x2510a84
  0x2510988: mov      w1, w21
  0x251098c: mov      x2, xzr
  0x2510990: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510994: tbz      w0, #0, #0x251092c
  0x2510998: adrp     x8, #0x5599000
  0x251099c: ldr      x25, [x19]
  0x25109a0: ldr      x8, [x8, #0x678] ; = 0x0 (u64 @ 0x5599678)
  0x25109a4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x25109a8: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x25109ac: ldr      x2, [x27] ; = 0x0 (u64 @ 0x5599000)
  0x25109b0: mov      x26, x0
  0x25109b4: mov      x1, x24
  0x25109b8: mov      x3, xzr
  0x25109bc: bl       #0x46a5a40 ; -> System.Predicate<object>$$.ctor
  0x25109c0: cbz      x25, #0x2510a8c
  0x25109c4: ldr      x2, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x25109c8: mov      x0, x25
  0x25109cc: mov      x1, x26
  0x25109d0: bl       #0x44bb150 ; -> System.Collections.Generic.List<object>$$Exists
  0x25109d4: tbnz     w0, #0, #0x251092c
  0x25109d8: ldr      x0, [x19]
  0x25109dc: cbz      x0, #0x2510a94
  0x25109e0: adrp     x9, #0x558b000
  0x25109e4: ldr      x1, [x23]
  0x25109e8: ldr      w10, [x0, #0x1c]
  0x25109ec: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x25109f0: ldr      x9, [x9, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x25109f4: add      w10, w10, #1
  0x25109f8: ldr      x9, [x9] ; = 0x0 (u64 @ 0x558b000)
  0x25109fc: str      w10, [x0, #0x1c]
  0x2510a00: cbz      x8, #0x2510a9c
  0x2510a04: ldrsw    x10, [x0, #0x18]
  0x2510a08: ldr      w11, [x8, #0x18]
  0x2510a0c: cmp      w10, w11
  0x2510a10: b.hs     #0x2510a30
  0x2510a14: add      w9, w10, #1
  0x2510a18: add      x8, x8, x10, lsl #3
  0x2510a1c: str      w9, [x0, #0x18]
  0x2510a20: str      x1, [x8, #0x20]!
  0x2510a24: mov      x0, x8
  0x2510a28: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510a2c: b        #0x251092c
  0x2510a30: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2510a34: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510a38: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510a3c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510a40: b        #0x251092c
  0x2510a44: mov      x25, xzr
  0x2510a48: mov      w23, #0xc
  0x2510a4c: adrp     x8, #0x5599000
  0x2510a50: ldr      x8, [x8, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2510a54: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510a58: add      x0, sp, #0x20
  0x2510a5c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510a60: cbnz     x25, #0x2511688
  0x2510a64: cmp      w23, #0xc
  0x2510a68: b.eq     #0x25108cc
  0x2510a6c: cbz      w23, #0x25108cc
  0x2510a70: b        #0x25115f0
  0x2510a74: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510a78: b        #0x25116fc
  0x2510a7c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510a80: b        #0x25116fc
  0x2510a84: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510a88: b        #0x25116fc
  0x2510a8c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510a90: b        #0x25116fc
  0x2510a94: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510a98: b        #0x25116fc
  0x2510a9c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2510aa0: b        #0x25116fc
  0x2510aa4: b        #0x2510ad4
  0x2510aa8: b        #0x2510ad4
  0x2510aac: b        #0x2510ad4
  0x2510ab0: b        #0x2510ad4
  0x2510ab4: b        #0x2510ad4
  0x2510ab8: b        #0x2510ad4
  0x2510abc: b        #0x2510ad4
  0x2510ac0: b        #0x2510ad4
  0x2510ac4: b        #0x2510ad4
  0x2510ac8: b        #0x2510ad4
  0x2510acc: b        #0x2510ad4
  0x2510ad0: b        #0x2510ad4
  0x2510ad4: mov      x24, x1
  0x2510ad8: mov      x23, x0
  0x2510adc: cmp      w24, #1
  0x2510ae0: b.ne     #0x2511624
  0x2510ae4: mov      x0, x23
  0x2510ae8: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2510aec: ldr      x25, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2510af0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2510af4: mov      w23, wzr
  0x2510af8: b        #0x2510a4c
  0x2510afc: adrp     x8, #0x5599000
  0x2510b00: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x2510b04: add      x0, sp, #0x40
  0x2510b08: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510b0c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510b10: ldr      x29, [sp]
  0x2510b14: mov      w1, #7
  0x2510b18: mov      x0, x29
  0x2510b1c: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2510b20: adrp     x26, #0x5599000
  0x2510b24: adrp     x27, #0x558b000
  0x2510b28: ldr      x26, [x26, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2510b2c: ldr      x27, [x27, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x2510b30: cbz      x0, #0x2510cb8
  0x2510b34: mov      w1, #7
  0x2510b38: mov      x0, x29
  0x2510b3c: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x2510b40: cbz      x0, #0x25116e4
  0x2510b44: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x5599030)
  0x2510b48: cbz      x0, #0x25116e4
  0x2510b4c: adrp     x8, #0x5599000
  0x2510b50: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510b54: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510b58: add      x8, sp, #8
  0x2510b5c: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510b60: ldur     q0, [sp, #8]
  0x2510b64: ldr      x8, [sp, #0x18]
  0x2510b68: adrp     x27, #0x5599000
  0x2510b6c: ldr      x27, [x27, #0x698] ; = 0x0 (u64 @ 0x5599698)
  0x2510b70: str      q0, [sp, #0x20]
  0x2510b74: str      x8, [sp, #0x30]
  0x2510b78: adrp     x29, #0x5599000
  0x2510b7c: ldr      x29, [x29, #0x690] ; = 0x0 (u64 @ 0x5599690)
  0x2510b80: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510b84: add      x0, sp, #0x20
  0x2510b88: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510b8c: tbz      w0, #0, #0x2510c98
  0x2510b90: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5599000)
  0x2510b94: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2510b98: mov      x24, x0
  0x2510b9c: mov      x1, xzr
  0x2510ba0: bl       #0x49475a0 ; -> System.Object$$.ctor
  0x2510ba4: cbz      x24, #0x2511678
  0x2510ba8: ldr      x1, [sp, #0x30]
  0x2510bac: mov      x23, x24
  0x2510bb0: str      x1, [x23, #0x10]!
  0x2510bb4: mov      x0, x23
  0x2510bb8: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510bbc: ldr      x0, [x23]
  0x2510bc0: cbz      x0, #0x251167c
  0x2510bc4: mov      w1, w20
  0x2510bc8: mov      x2, xzr
  0x2510bcc: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2510bd0: tbz      w0, #0, #0x2510b80
  0x2510bd4: ldr      x0, [x23]
  0x2510bd8: cbz      x0, #0x25116c0
  0x2510bdc: mov      w1, w21
  0x2510be0: mov      x2, xzr
  0x2510be4: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510be8: tbz      w0, #0, #0x2510b80
  0x2510bec: adrp     x8, #0x5599000
  0x2510bf0: ldr      x25, [x19]
  0x2510bf4: ldr      x8, [x8, #0x678] ; = 0x0 (u64 @ 0x5599678)
  0x2510bf8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510bfc: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2510c00: ldr      x2, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x2510c04: mov      x26, x0
  0x2510c08: mov      x1, x24
  0x2510c0c: mov      x3, xzr
  0x2510c10: bl       #0x46a5a40 ; -> System.Predicate<object>$$.ctor
  0x2510c14: cbz      x25, #0x25116e8
  0x2510c18: ldr      x2, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2510c1c: mov      x0, x25
  0x2510c20: mov      x1, x26
  0x2510c24: bl       #0x44bb150 ; -> System.Collections.Generic.List<object>$$Exists
  0x2510c28: tbnz     w0, #0, #0x2510b80
  0x2510c2c: ldr      x0, [x19]
  0x2510c30: cbz      x0, #0x25116f4
  0x2510c34: adrp     x9, #0x558b000
  0x2510c38: ldr      x1, [x23]
  0x2510c3c: ldr      w10, [x0, #0x1c]
  0x2510c40: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510c44: ldr      x9, [x9, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x2510c48: add      w10, w10, #1
  0x2510c4c: ldr      x9, [x9] ; = 0x0 (u64 @ 0x558b000)
  0x2510c50: str      w10, [x0, #0x1c]
  0x2510c54: cbz      x8, #0x25116f8
  0x2510c58: ldrsw    x10, [x0, #0x18]
  0x2510c5c: ldr      w11, [x8, #0x18]
  0x2510c60: cmp      w10, w11
  0x2510c64: b.hs     #0x2510c84
  0x2510c68: add      w9, w10, #1
  0x2510c6c: add      x8, x8, x10, lsl #3
  0x2510c70: str      w9, [x0, #0x18]
  0x2510c74: str      x1, [x8, #0x20]!
  0x2510c78: mov      x0, x8
  0x2510c7c: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510c80: b        #0x2510b80
  0x2510c84: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2510c88: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510c8c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510c90: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510c94: b        #0x2510b80
  0x2510c98: adrp     x26, #0x5599000
  0x2510c9c: ldr      x26, [x26, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2510ca0: add      x0, sp, #0x20
  0x2510ca4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510ca8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510cac: adrp     x27, #0x558b000
  0x2510cb0: ldr      x27, [x27, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x2510cb4: ldr      x29, [sp]
  0x2510cb8: ldr      x0, [x29, #0x18] ; = 0x0 (u64 @ 0x5599018)
  0x2510cbc: cbz      x0, #0x25116e4
  0x2510cc0: adrp     x8, #0x5599000
  0x2510cc4: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510cc8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510ccc: add      x8, sp, #8
  0x2510cd0: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510cd4: ldur     q0, [sp, #8]
  0x2510cd8: ldr      x8, [sp, #0x18]
  0x2510cdc: str      q0, [sp, #0x20]
  0x2510ce0: str      x8, [sp, #0x30]
  0x2510ce4: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510ce8: add      x0, sp, #0x20
  0x2510cec: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510cf0: tbz      w0, #0, #0x2510da4
  0x2510cf4: ldr      x23, [sp, #0x30]
  0x2510cf8: cbz      x23, #0x2511648
  0x2510cfc: ldr      w8, [x23, #0x24]
  0x2510d00: cmp      w8, #0x20
  0x2510d04: b.ne     #0x2510d14
  0x2510d08: ldr      w8, [x23, #0x28]
  0x2510d0c: cmp      w8, #1
  0x2510d10: b.eq     #0x2510ce4
  0x2510d14: mov      x0, x23
  0x2510d18: mov      w1, w20
  0x2510d1c: mov      x2, xzr
  0x2510d20: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2510d24: tbz      w0, #0, #0x2510ce4
  0x2510d28: mov      x0, x23
  0x2510d2c: mov      w1, w21
  0x2510d30: mov      x2, xzr
  0x2510d34: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510d38: tbz      w0, #0, #0x2510ce4
  0x2510d3c: ldr      x0, [x19]
  0x2510d40: cbz      x0, #0x2511694
  0x2510d44: ldr      w10, [x0, #0x1c]
  0x2510d48: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510d4c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510d50: add      w10, w10, #1
  0x2510d54: str      w10, [x0, #0x1c]
  0x2510d58: cbz      x8, #0x2511690
  0x2510d5c: ldrsw    x10, [x0, #0x18]
  0x2510d60: ldr      w11, [x8, #0x18]
  0x2510d64: cmp      w10, w11
  0x2510d68: b.hs     #0x2510d8c
  0x2510d6c: add      w9, w10, #1
  0x2510d70: add      x8, x8, x10, lsl #3
  0x2510d74: str      w9, [x0, #0x18]
  0x2510d78: str      x23, [x8, #0x20]!
  0x2510d7c: mov      x0, x8
  0x2510d80: mov      x1, x23
  0x2510d84: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510d88: b        #0x2510ce4
  0x2510d8c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2510d90: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510d94: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510d98: mov      x1, x23
  0x2510d9c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510da0: b        #0x2510ce4
  0x2510da4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510da8: add      x0, sp, #0x20
  0x2510dac: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510db0: ldr      x0, [x29, #0x20] ; = 0x0 (u64 @ 0x5599020)
  0x2510db4: cbz      x0, #0x2510e90
  0x2510db8: adrp     x8, #0x5599000
  0x2510dbc: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510dc0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510dc4: add      x8, sp, #8
  0x2510dc8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510dcc: ldur     q0, [sp, #8]
  0x2510dd0: ldr      x8, [sp, #0x18]
  0x2510dd4: str      q0, [sp, #0x20]
  0x2510dd8: str      x8, [sp, #0x30]
  0x2510ddc: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510de0: add      x0, sp, #0x20
  0x2510de4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510de8: tbz      w0, #0, #0x2510e84
  0x2510dec: ldr      x23, [sp, #0x30]
  0x2510df0: cbz      x23, #0x251165c
  0x2510df4: mov      x0, x23
  0x2510df8: mov      w1, w20
  0x2510dfc: mov      x2, xzr
  0x2510e00: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2510e04: tbz      w0, #0, #0x2510ddc
  0x2510e08: mov      x0, x23
  0x2510e0c: mov      w1, w21
  0x2510e10: mov      x2, xzr
  0x2510e14: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510e18: tbz      w0, #0, #0x2510ddc
  0x2510e1c: ldr      x0, [x19]
  0x2510e20: cbz      x0, #0x2511698
  0x2510e24: ldr      w10, [x0, #0x1c]
  0x2510e28: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510e2c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510e30: add      w10, w10, #1
  0x2510e34: str      w10, [x0, #0x1c]
  0x2510e38: cbz      x8, #0x25116ac
  0x2510e3c: ldrsw    x10, [x0, #0x18]
  0x2510e40: ldr      w11, [x8, #0x18]
  0x2510e44: cmp      w10, w11
  0x2510e48: b.hs     #0x2510e6c
  0x2510e4c: add      w9, w10, #1
  0x2510e50: add      x8, x8, x10, lsl #3
  0x2510e54: str      w9, [x0, #0x18]
  0x2510e58: str      x23, [x8, #0x20]!
  0x2510e5c: mov      x0, x8
  0x2510e60: mov      x1, x23
  0x2510e64: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510e68: b        #0x2510ddc
  0x2510e6c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2510e70: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510e74: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510e78: mov      x1, x23
  0x2510e7c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510e80: b        #0x2510ddc
  0x2510e84: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510e88: add      x0, sp, #0x20
  0x2510e8c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510e90: ldr      x0, [x29, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x2510e94: cbz      x0, #0x2510f70
  0x2510e98: adrp     x8, #0x5599000
  0x2510e9c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510ea0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510ea4: add      x8, sp, #8
  0x2510ea8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510eac: ldur     q0, [sp, #8]
  0x2510eb0: ldr      x8, [sp, #0x18]
  0x2510eb4: str      q0, [sp, #0x20]
  0x2510eb8: str      x8, [sp, #0x30]
  0x2510ebc: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510ec0: add      x0, sp, #0x20
  0x2510ec4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510ec8: tbz      w0, #0, #0x2510f64
  0x2510ecc: ldr      x23, [sp, #0x30]
  0x2510ed0: cbz      x23, #0x2511660
  0x2510ed4: mov      x0, x23
  0x2510ed8: mov      w1, w20
  0x2510edc: mov      x2, xzr
  0x2510ee0: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2510ee4: tbz      w0, #0, #0x2510ebc
  0x2510ee8: mov      x0, x23
  0x2510eec: mov      w1, w21
  0x2510ef0: mov      x2, xzr
  0x2510ef4: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510ef8: tbz      w0, #0, #0x2510ebc
  0x2510efc: ldr      x0, [x19]
  0x2510f00: cbz      x0, #0x251169c
  0x2510f04: ldr      w10, [x0, #0x1c]
  0x2510f08: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510f0c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510f10: add      w10, w10, #1
  0x2510f14: str      w10, [x0, #0x1c]
  0x2510f18: cbz      x8, #0x25116b0
  0x2510f1c: ldrsw    x10, [x0, #0x18]
  0x2510f20: ldr      w11, [x8, #0x18]
  0x2510f24: cmp      w10, w11
  0x2510f28: b.hs     #0x2510f4c
  0x2510f2c: add      w9, w10, #1
  0x2510f30: add      x8, x8, x10, lsl #3
  0x2510f34: str      w9, [x0, #0x18]
  0x2510f38: str      x23, [x8, #0x20]!
  0x2510f3c: mov      x0, x8
  0x2510f40: mov      x1, x23
  0x2510f44: bl       #0x21af920 ; -> ??? 0x21af920
  0x2510f48: b        #0x2510ebc
  0x2510f4c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2510f50: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2510f54: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2510f58: mov      x1, x23
  0x2510f5c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2510f60: b        #0x2510ebc
  0x2510f64: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2510f68: add      x0, sp, #0x20
  0x2510f6c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2510f70: ldr      x0, [x29, #0x30] ; = 0x0 (u64 @ 0x5599030)
  0x2510f74: cbz      x0, #0x2511050
  0x2510f78: adrp     x8, #0x5599000
  0x2510f7c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2510f80: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2510f84: add      x8, sp, #8
  0x2510f88: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2510f8c: ldur     q0, [sp, #8]
  0x2510f90: ldr      x8, [sp, #0x18]
  0x2510f94: str      q0, [sp, #0x20]
  0x2510f98: str      x8, [sp, #0x30]
  0x2510f9c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2510fa0: add      x0, sp, #0x20
  0x2510fa4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2510fa8: tbz      w0, #0, #0x2511044
  0x2510fac: ldr      x23, [sp, #0x30]
  0x2510fb0: cbz      x23, #0x2511664
  0x2510fb4: mov      x0, x23
  0x2510fb8: mov      w1, w20
  0x2510fbc: mov      x2, xzr
  0x2510fc0: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2510fc4: tbz      w0, #0, #0x2510f9c
  0x2510fc8: mov      x0, x23
  0x2510fcc: mov      w1, w21
  0x2510fd0: mov      x2, xzr
  0x2510fd4: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2510fd8: tbz      w0, #0, #0x2510f9c
  0x2510fdc: ldr      x0, [x19]
  0x2510fe0: cbz      x0, #0x25116a0
  0x2510fe4: ldr      w10, [x0, #0x1c]
  0x2510fe8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2510fec: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2510ff0: add      w10, w10, #1
  0x2510ff4: str      w10, [x0, #0x1c]
  0x2510ff8: cbz      x8, #0x25116b4
  0x2510ffc: ldrsw    x10, [x0, #0x18]
  0x2511000: ldr      w11, [x8, #0x18]
  0x2511004: cmp      w10, w11
  0x2511008: b.hs     #0x251102c
  0x251100c: add      w9, w10, #1
  0x2511010: add      x8, x8, x10, lsl #3
  0x2511014: str      w9, [x0, #0x18]
  0x2511018: str      x23, [x8, #0x20]!
  0x251101c: mov      x0, x8
  0x2511020: mov      x1, x23
  0x2511024: bl       #0x21af920 ; -> ??? 0x21af920
  0x2511028: b        #0x2510f9c
  0x251102c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2511030: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2511034: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2511038: mov      x1, x23
  0x251103c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2511040: b        #0x2510f9c
  0x2511044: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511048: add      x0, sp, #0x20
  0x251104c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511050: ldr      x0, [x29, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2511054: cbz      x0, #0x2511130
  0x2511058: adrp     x8, #0x5599000
  0x251105c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511060: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511064: add      x8, sp, #8
  0x2511068: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251106c: ldur     q0, [sp, #8]
  0x2511070: ldr      x8, [sp, #0x18]
  0x2511074: str      q0, [sp, #0x20]
  0x2511078: str      x8, [sp, #0x30]
  0x251107c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511080: add      x0, sp, #0x20
  0x2511084: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511088: tbz      w0, #0, #0x2511124
  0x251108c: ldr      x23, [sp, #0x30]
  0x2511090: cbz      x23, #0x2511668
  0x2511094: mov      x0, x23
  0x2511098: mov      w1, w20
  0x251109c: mov      x2, xzr
  0x25110a0: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x25110a4: tbz      w0, #0, #0x251107c
  0x25110a8: mov      x0, x23
  0x25110ac: mov      w1, w21
  0x25110b0: mov      x2, xzr
  0x25110b4: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x25110b8: tbz      w0, #0, #0x251107c
  0x25110bc: ldr      x0, [x19]
  0x25110c0: cbz      x0, #0x25116a4
  0x25110c4: ldr      w10, [x0, #0x1c]
  0x25110c8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x25110cc: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x25110d0: add      w10, w10, #1
  0x25110d4: str      w10, [x0, #0x1c]
  0x25110d8: cbz      x8, #0x25116b8
  0x25110dc: ldrsw    x10, [x0, #0x18]
  0x25110e0: ldr      w11, [x8, #0x18]
  0x25110e4: cmp      w10, w11
  0x25110e8: b.hs     #0x251110c
  0x25110ec: add      w9, w10, #1
  0x25110f0: add      x8, x8, x10, lsl #3
  0x25110f4: str      w9, [x0, #0x18]
  0x25110f8: str      x23, [x8, #0x20]!
  0x25110fc: mov      x0, x8
  0x2511100: mov      x1, x23
  0x2511104: bl       #0x21af920 ; -> ??? 0x21af920
  0x2511108: b        #0x251107c
  0x251110c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x2511110: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x2511114: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x2511118: mov      x1, x23
  0x251111c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2511120: b        #0x251107c
  0x2511124: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511128: add      x0, sp, #0x20
  0x251112c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511130: ldr      x0, [x29, #0x58] ; = 0x0 (u64 @ 0x5599058)
  0x2511134: cbz      x0, #0x2511210
  0x2511138: adrp     x8, #0x5599000
  0x251113c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511140: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511144: add      x8, sp, #8
  0x2511148: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251114c: ldur     q0, [sp, #8]
  0x2511150: ldr      x8, [sp, #0x18]
  0x2511154: str      q0, [sp, #0x20]
  0x2511158: str      x8, [sp, #0x30]
  0x251115c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511160: add      x0, sp, #0x20
  0x2511164: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511168: tbz      w0, #0, #0x2511204
  0x251116c: ldr      x23, [sp, #0x30]
  0x2511170: cbz      x23, #0x251166c
  0x2511174: mov      x0, x23
  0x2511178: mov      w1, w20
  0x251117c: mov      x2, xzr
  0x2511180: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2511184: tbz      w0, #0, #0x251115c
  0x2511188: mov      x0, x23
  0x251118c: mov      w1, w21
  0x2511190: mov      x2, xzr
  0x2511194: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2511198: tbz      w0, #0, #0x251115c
  0x251119c: ldr      x0, [x19]
  0x25111a0: cbz      x0, #0x25116a8
  0x25111a4: ldr      w10, [x0, #0x1c]
  0x25111a8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x25111ac: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x25111b0: add      w10, w10, #1
  0x25111b4: str      w10, [x0, #0x1c]
  0x25111b8: cbz      x8, #0x25116bc
  0x25111bc: ldrsw    x10, [x0, #0x18]
  0x25111c0: ldr      w11, [x8, #0x18]
  0x25111c4: cmp      w10, w11
  0x25111c8: b.hs     #0x25111ec
  0x25111cc: add      w9, w10, #1
  0x25111d0: add      x8, x8, x10, lsl #3
  0x25111d4: str      w9, [x0, #0x18]
  0x25111d8: str      x23, [x8, #0x20]!
  0x25111dc: mov      x0, x8
  0x25111e0: mov      x1, x23
  0x25111e4: bl       #0x21af920 ; -> ??? 0x21af920
  0x25111e8: b        #0x251115c
  0x25111ec: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x25111f0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x25111f4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x25111f8: mov      x1, x23
  0x25111fc: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2511200: b        #0x251115c
  0x2511204: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511208: add      x0, sp, #0x20
  0x251120c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511210: ldr      x0, [x29, #0x40] ; = 0x0 (u64 @ 0x5599040)
  0x2511214: cbz      x0, #0x2511308
  0x2511218: adrp     x8, #0x5599000
  0x251121c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511220: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511224: add      x8, sp, #8
  0x2511228: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251122c: ldur     q0, [sp, #8]
  0x2511230: ldr      x8, [sp, #0x18]
  0x2511234: str      q0, [sp, #0x20]
  0x2511238: str      x8, [sp, #0x30]
  0x251123c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511240: add      x0, sp, #0x20
  0x2511244: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511248: tbz      w0, #0, #0x25112fc
  0x251124c: ldr      x23, [sp, #0x30]
  0x2511250: cbz      x23, #0x251164c
  0x2511254: ldr      w8, [x23, #0x24]
  0x2511258: cmp      w8, #0x20
  0x251125c: b.ne     #0x251126c
  0x2511260: ldr      w8, [x23, #0x28]
  0x2511264: cmp      w8, #1
  0x2511268: b.eq     #0x251123c
  0x251126c: mov      x0, x23
  0x2511270: mov      w1, w20
  0x2511274: mov      x2, xzr
  0x2511278: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x251127c: tbz      w0, #0, #0x251123c
  0x2511280: mov      x0, x23
  0x2511284: mov      w1, w21
  0x2511288: mov      x2, xzr
  0x251128c: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2511290: tbz      w0, #0, #0x251123c
  0x2511294: ldr      x0, [x19]
  0x2511298: cbz      x0, #0x25116cc
  0x251129c: ldr      w10, [x0, #0x1c]
  0x25112a0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x25112a4: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x25112a8: add      w10, w10, #1
  0x25112ac: str      w10, [x0, #0x1c]
  0x25112b0: cbz      x8, #0x25116c4
  0x25112b4: ldrsw    x10, [x0, #0x18]
  0x25112b8: ldr      w11, [x8, #0x18]
  0x25112bc: cmp      w10, w11
  0x25112c0: b.hs     #0x25112e4
  0x25112c4: add      w9, w10, #1
  0x25112c8: add      x8, x8, x10, lsl #3
  0x25112cc: str      w9, [x0, #0x18]
  0x25112d0: str      x23, [x8, #0x20]!
  0x25112d4: mov      x0, x8
  0x25112d8: mov      x1, x23
  0x25112dc: bl       #0x21af920 ; -> ??? 0x21af920
  0x25112e0: b        #0x251123c
  0x25112e4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x25112e8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x25112ec: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x25112f0: mov      x1, x23
  0x25112f4: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25112f8: b        #0x251123c
  0x25112fc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511300: add      x0, sp, #0x20
  0x2511304: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511308: ldr      x0, [x29, #0x48] ; = 0x0 (u64 @ 0x5599048)
  0x251130c: cbz      x0, #0x2511400
  0x2511310: adrp     x8, #0x5599000
  0x2511314: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511318: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x251131c: add      x8, sp, #8
  0x2511320: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2511324: ldur     q0, [sp, #8]
  0x2511328: ldr      x8, [sp, #0x18]
  0x251132c: str      q0, [sp, #0x20]
  0x2511330: str      x8, [sp, #0x30]
  0x2511334: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511338: add      x0, sp, #0x20
  0x251133c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511340: tbz      w0, #0, #0x25113f4
  0x2511344: ldr      x23, [sp, #0x30]
  0x2511348: cbz      x23, #0x2511650
  0x251134c: ldr      w8, [x23, #0x24]
  0x2511350: cmp      w8, #0x20
  0x2511354: b.ne     #0x2511364
  0x2511358: ldr      w8, [x23, #0x28]
  0x251135c: cmp      w8, #1
  0x2511360: b.eq     #0x2511334
  0x2511364: mov      x0, x23
  0x2511368: mov      w1, w20
  0x251136c: mov      x2, xzr
  0x2511370: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2511374: tbz      w0, #0, #0x2511334
  0x2511378: mov      x0, x23
  0x251137c: mov      w1, w21
  0x2511380: mov      x2, xzr
  0x2511384: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2511388: tbz      w0, #0, #0x2511334
  0x251138c: ldr      x0, [x19]
  0x2511390: cbz      x0, #0x25116d4
  0x2511394: ldr      w10, [x0, #0x1c]
  0x2511398: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x251139c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x25113a0: add      w10, w10, #1
  0x25113a4: str      w10, [x0, #0x1c]
  0x25113a8: cbz      x8, #0x25116c8
  0x25113ac: ldrsw    x10, [x0, #0x18]
  0x25113b0: ldr      w11, [x8, #0x18]
  0x25113b4: cmp      w10, w11
  0x25113b8: b.hs     #0x25113dc
  0x25113bc: add      w9, w10, #1
  0x25113c0: add      x8, x8, x10, lsl #3
  0x25113c4: str      w9, [x0, #0x18]
  0x25113c8: str      x23, [x8, #0x20]!
  0x25113cc: mov      x0, x8
  0x25113d0: mov      x1, x23
  0x25113d4: bl       #0x21af920 ; -> ??? 0x21af920
  0x25113d8: b        #0x2511334
  0x25113dc: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x25113e0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x25113e4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x25113e8: mov      x1, x23
  0x25113ec: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25113f0: b        #0x2511334
  0x25113f4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25113f8: add      x0, sp, #0x20
  0x25113fc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511400: ldr      x0, [x29, #0x50] ; = 0x0 (u64 @ 0x5599050)
  0x2511404: cbz      x0, #0x25114f8
  0x2511408: adrp     x8, #0x5599000
  0x251140c: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511410: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511414: add      x8, sp, #8
  0x2511418: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251141c: ldur     q0, [sp, #8]
  0x2511420: ldr      x8, [sp, #0x18]
  0x2511424: str      q0, [sp, #0x20]
  0x2511428: str      x8, [sp, #0x30]
  0x251142c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511430: add      x0, sp, #0x20
  0x2511434: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511438: tbz      w0, #0, #0x25114ec
  0x251143c: ldr      x23, [sp, #0x30]
  0x2511440: cbz      x23, #0x2511654
  0x2511444: ldr      w8, [x23, #0x24]
  0x2511448: cmp      w8, #0x20
  0x251144c: b.ne     #0x251145c
  0x2511450: ldr      w8, [x23, #0x28]
  0x2511454: cmp      w8, #1
  0x2511458: b.eq     #0x251142c
  0x251145c: mov      x0, x23
  0x2511460: mov      w1, w20
  0x2511464: mov      x2, xzr
  0x2511468: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x251146c: tbz      w0, #0, #0x251142c
  0x2511470: mov      x0, x23
  0x2511474: mov      w1, w21
  0x2511478: mov      x2, xzr
  0x251147c: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2511480: tbz      w0, #0, #0x251142c
  0x2511484: ldr      x0, [x19]
  0x2511488: cbz      x0, #0x25116dc
  0x251148c: ldr      w10, [x0, #0x1c]
  0x2511490: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x2511494: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2511498: add      w10, w10, #1
  0x251149c: str      w10, [x0, #0x1c]
  0x25114a0: cbz      x8, #0x25116d0
  0x25114a4: ldrsw    x10, [x0, #0x18]
  0x25114a8: ldr      w11, [x8, #0x18]
  0x25114ac: cmp      w10, w11
  0x25114b0: b.hs     #0x25114d4
  0x25114b4: add      w9, w10, #1
  0x25114b8: add      x8, x8, x10, lsl #3
  0x25114bc: str      w9, [x0, #0x18]
  0x25114c0: str      x23, [x8, #0x20]!
  0x25114c4: mov      x0, x8
  0x25114c8: mov      x1, x23
  0x25114cc: bl       #0x21af920 ; -> ??? 0x21af920
  0x25114d0: b        #0x251142c
  0x25114d4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x25114d8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x25114dc: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x25114e0: mov      x1, x23
  0x25114e4: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25114e8: b        #0x251142c
  0x25114ec: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25114f0: add      x0, sp, #0x20
  0x25114f4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25114f8: ldr      x0, [x29, #0x60] ; = 0x0 (u64 @ 0x5599060)
  0x25114fc: cbz      x0, #0x2511604
  0x2511500: adrp     x8, #0x5599000
  0x2511504: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55994c0)
  0x2511508: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x251150c: add      x8, sp, #8
  0x2511510: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2511514: ldur     q0, [sp, #8]
  0x2511518: ldr      x8, [sp, #0x18]
  0x251151c: str      q0, [sp, #0x20]
  0x2511520: str      x8, [sp, #0x30]
  0x2511524: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5599000)
  0x2511528: add      x0, sp, #0x20
  0x251152c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2511530: tbz      w0, #0, #0x25115e4
  0x2511534: ldr      x22, [sp, #0x30]
  0x2511538: cbz      x22, #0x2511658
  0x251153c: ldr      w8, [x22, #0x24]
  0x2511540: cmp      w8, #0x20
  0x2511544: b.ne     #0x2511554
  0x2511548: ldr      w8, [x22, #0x28]
  0x251154c: cmp      w8, #1
  0x2511550: b.eq     #0x2511524
  0x2511554: mov      x0, x22
  0x2511558: mov      w1, w20
  0x251155c: mov      x2, xzr
  0x2511560: bl       #0x25ed5d0 ; -> CBuffTemplet$$IsBuffCreateType
  0x2511564: tbz      w0, #0, #0x2511524
  0x2511568: mov      x0, x22
  0x251156c: mov      w1, w21
  0x2511570: mov      x2, xzr
  0x2511574: bl       #0x25ed5e0 ; -> CBuffTemplet$$IsCallerSkillType
  0x2511578: tbz      w0, #0, #0x2511524
  0x251157c: ldr      x0, [x19]
  0x2511580: cbz      x0, #0x25116e0
  0x2511584: ldr      w10, [x0, #0x1c]
  0x2511588: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5599010)
  0x251158c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2511590: add      w10, w10, #1
  0x2511594: str      w10, [x0, #0x1c]
  0x2511598: cbz      x8, #0x25116d8
  0x251159c: ldrsw    x10, [x0, #0x18]
  0x25115a0: ldr      w11, [x8, #0x18]
  0x25115a4: cmp      w10, w11
  0x25115a8: b.hs     #0x25115cc
  0x25115ac: add      w9, w10, #1
  0x25115b0: add      x8, x8, x10, lsl #3
  0x25115b4: str      w9, [x0, #0x18]
  0x25115b8: str      x22, [x8, #0x20]!
  0x25115bc: mov      x0, x8
  0x25115c0: mov      x1, x22
  0x25115c4: bl       #0x21af920 ; -> ??? 0x21af920
  0x25115c8: b        #0x2511524
  0x25115cc: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x558b020)
  0x25115d0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55990c0)
  0x25115d4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5599070)
  0x25115d8: mov      x1, x22
  0x25115dc: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25115e0: b        #0x2511524
  0x25115e4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25115e8: add      x0, sp, #0x20
  0x25115ec: b        #0x2511600
  0x25115f0: adrp     x8, #0x5599000
  0x25115f4: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x25115f8: add      x0, sp, #0x40
  0x25115fc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511600: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511604: ldp      x20, x19, [sp, #0xb0]
  0x2511608: ldp      x22, x21, [sp, #0xa0]
  0x251160c: ldp      x24, x23, [sp, #0x90]
  0x2511610: ldp      x26, x25, [sp, #0x80]
  0x2511614: ldp      x28, x27, [sp, #0x70]
  0x2511618: ldp      x29, x30, [sp, #0x60]
  0x251161c: add      sp, sp, #0xc0
  0x2511620: ret      
  0x2511624: mov      x25, xzr
  0x2511628: adrp     x8, #0x5599000
  0x251162c: ldr      x8, [x8, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2511630: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511634: add      x0, sp, #0x20
  0x2511638: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251163c: cbz      x25, #0x2511868
  0x2511640: mov      x0, x25
  0x2511644: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511648: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251164c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511650: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511654: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511658: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251165c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511660: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511664: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511668: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251166c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511670: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511674: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511678: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251167c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511680: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511684: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511688: mov      x0, x25
  0x251168c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511690: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511694: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2511698: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x251169c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116a0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116a4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116a8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116ac: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116b8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116bc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116c0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116c4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116c8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116cc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116d0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116d4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116d8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116dc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116e0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116e4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116e8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116ec: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116f0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116f4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116f8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x25116fc: mov      x25, xzr
  0x2511700: b        #0x2511708
  0x2511704: mov      x23, x0
  0x2511708: adrp     x8, #0x5599000
  0x251170c: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x2511710: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511714: add      x0, sp, #0x40
  0x2511718: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251171c: cbz      x25, #0x2511cd0
  0x2511720: mov      x0, x25
  0x2511724: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511728: mov      x24, x1
  0x251172c: mov      x23, x0
  0x2511730: b        #0x2511628
  0x2511734: b        #0x25118d8
  0x2511738: b        #0x25117bc
  0x251173c: b        #0x25118d8
  0x2511740: b        #0x25118d8
  0x2511744: b        #0x25118d8
  0x2511748: b        #0x2511b24
  0x251174c: b        #0x2511b7c
  0x2511750: b        #0x2511bd0
  0x2511754: b        #0x2511c24
  0x2511758: b        #0x25117bc
  0x251175c: b        #0x25117bc
  0x2511760: b        #0x25118d8
  0x2511764: b        #0x25118d8
  0x2511768: b        #0x25118d8
  0x251176c: b        #0x2511980
  0x2511770: b        #0x25119d4
  0x2511774: b        #0x2511a28
  0x2511778: b        #0x2511a7c
  0x251177c: b        #0x2511ad0
  0x2511780: b        #0x2511c80
  0x2511784: b        #0x2511860
  0x2511788: b        #0x2511860
  0x251178c: b        #0x2511860
  0x2511790: b        #0x2511860
  0x2511794: b        #0x2511b24
  0x2511798: b        #0x2511b7c
  0x251179c: b        #0x2511bd0
  0x25117a0: b        #0x2511b24
  0x25117a4: b        #0x2511c24
  0x25117a8: b        #0x2511b7c
  0x25117ac: b        #0x2511bd0
  0x25117b0: b        #0x2511c24
  0x25117b4: b        #0x25117bc
  0x25117b8: b        #0x25117bc
  0x25117bc: mov      x23, x0
  0x25117c0: cmp      w1, #1
  0x25117c4: b.ne     #0x25117f0
  0x25117c8: mov      x0, x23
  0x25117cc: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x25117d0: ldr      x25, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x25117d4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x25117d8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25117dc: add      x0, sp, #0x20
  0x25117e0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25117e4: cbz      x25, #0x2510880
  0x25117e8: mov      x0, x25
  0x25117ec: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x25117f0: mov      x25, xzr
  0x25117f4: b        #0x25117fc
  0x25117f8: mov      x23, x0
  0x25117fc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511800: add      x0, sp, #0x20
  0x2511804: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511808: cbz      x25, #0x2511cd0
  0x251180c: mov      x0, x25
  0x2511810: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511814: b        #0x25118d8
  0x2511818: b        #0x25118d8
  0x251181c: b        #0x25118d8
  0x2511820: b        #0x25118d8
  0x2511824: b        #0x25118d8
  0x2511828: b        #0x2511980
  0x251182c: b        #0x25119d4
  0x2511830: b        #0x2511a28
  0x2511834: b        #0x2511a7c
  0x2511838: b        #0x2511ad0
  0x251183c: b        #0x2511980
  0x2511840: b        #0x25119d4
  0x2511844: b        #0x2511a28
  0x2511848: b        #0x2511a7c
  0x251184c: b        #0x2511ad0
  0x2511850: b        #0x2511c80
  0x2511854: b        #0x2511c80
  0x2511858: b        #0x2511860
  0x251185c: b        #0x2511860
  0x2511860: mov      x24, x1
  0x2511864: mov      x23, x0
  0x2511868: cmp      w24, #1
  0x251186c: b.ne     #0x251189c
  0x2511870: mov      x0, x23
  0x2511874: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511878: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x251187c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511880: adrp     x8, #0x5599000
  0x2511884: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x2511888: add      x0, sp, #0x40
  0x251188c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511890: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511894: cbz      x24, #0x2510b10
  0x2511898: b        #0x2511cac
  0x251189c: mov      x24, xzr
  0x25118a0: b        #0x25118a8
  0x25118a4: mov      x23, x0
  0x25118a8: adrp     x8, #0x5599000
  0x25118ac: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x5599568)
  0x25118b0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x25118b4: add      x0, sp, #0x40
  0x25118b8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25118bc: cbz      x24, #0x2511cd0
  0x25118c0: mov      x0, x24
  0x25118c4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x25118c8: b        #0x2511b24
  0x25118cc: b        #0x2511b7c
  0x25118d0: b        #0x2511bd0
  0x25118d4: b        #0x2511c24
  0x25118d8: mov      x23, x0
  0x25118dc: cmp      w1, #1
  0x25118e0: b.ne     #0x251191c
  0x25118e4: mov      x0, x23
  0x25118e8: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x25118ec: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x25118f0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x25118f4: adrp     x26, #0x5599000
  0x25118f8: ldr      x26, [x26, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x25118fc: add      x0, sp, #0x20
  0x2511900: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511904: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511908: adrp     x27, #0x558b000
  0x251190c: ldr      x27, [x27, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x2511910: ldr      x29, [sp]
  0x2511914: cbz      x24, #0x2510cb8
  0x2511918: b        #0x2511cac
  0x251191c: mov      x24, xzr
  0x2511920: b        #0x2511928
  0x2511924: mov      x23, x0
  0x2511928: adrp     x8, #0x5599000
  0x251192c: ldr      x8, [x8, #0x4a8] ; = 0x0 (u64 @ 0x55994a8)
  0x2511930: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2511934: add      x0, sp, #0x20
  0x2511938: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251193c: cbz      x24, #0x2511cd0
  0x2511940: mov      x0, x24
  0x2511944: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511948: b        #0x2511980
  0x251194c: b        #0x25119d4
  0x2511950: b        #0x2511a28
  0x2511954: b        #0x2511a7c
  0x2511958: b        #0x2511980
  0x251195c: b        #0x2511ad0
  0x2511960: b        #0x25119d4
  0x2511964: b        #0x2511a28
  0x2511968: b        #0x2511a7c
  0x251196c: b        #0x2511ad0
  0x2511970: b        #0x2511b24
  0x2511974: b        #0x2511b7c
  0x2511978: b        #0x2511bd0
  0x251197c: b        #0x2511c24
  0x2511980: mov      x23, x0
  0x2511984: cmp      w1, #1
  0x2511988: b.ne     #0x25119b0
  0x251198c: mov      x0, x23
  0x2511990: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511994: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511998: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x251199c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25119a0: add      x0, sp, #0x20
  0x25119a4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25119a8: cbz      x24, #0x2511210
  0x25119ac: b        #0x2511cac
  0x25119b0: mov      x24, xzr
  0x25119b4: b        #0x25119bc
  0x25119b8: mov      x23, x0
  0x25119bc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25119c0: add      x0, sp, #0x20
  0x25119c4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25119c8: cbz      x24, #0x2511cd0
  0x25119cc: mov      x0, x24
  0x25119d0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x25119d4: mov      x23, x0
  0x25119d8: cmp      w1, #1
  0x25119dc: b.ne     #0x2511a04
  0x25119e0: mov      x0, x23
  0x25119e4: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x25119e8: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x25119ec: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x25119f0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x25119f4: add      x0, sp, #0x20
  0x25119f8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25119fc: cbz      x24, #0x2511130
  0x2511a00: b        #0x2511cac
  0x2511a04: mov      x24, xzr
  0x2511a08: b        #0x2511a10
  0x2511a0c: mov      x23, x0
  0x2511a10: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511a14: add      x0, sp, #0x20
  0x2511a18: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511a1c: cbz      x24, #0x2511cd0
  0x2511a20: mov      x0, x24
  0x2511a24: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511a28: mov      x23, x0
  0x2511a2c: cmp      w1, #1
  0x2511a30: b.ne     #0x2511a58
  0x2511a34: mov      x0, x23
  0x2511a38: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511a3c: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511a40: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511a44: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511a48: add      x0, sp, #0x20
  0x2511a4c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511a50: cbz      x24, #0x2511050
  0x2511a54: b        #0x2511cac
  0x2511a58: mov      x24, xzr
  0x2511a5c: b        #0x2511a64
  0x2511a60: mov      x23, x0
  0x2511a64: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511a68: add      x0, sp, #0x20
  0x2511a6c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511a70: cbz      x24, #0x2511cd0
  0x2511a74: mov      x0, x24
  0x2511a78: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511a7c: mov      x23, x0
  0x2511a80: cmp      w1, #1
  0x2511a84: b.ne     #0x2511aac
  0x2511a88: mov      x0, x23
  0x2511a8c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511a90: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511a94: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511a98: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511a9c: add      x0, sp, #0x20
  0x2511aa0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511aa4: cbz      x24, #0x2510f70
  0x2511aa8: b        #0x2511cac
  0x2511aac: mov      x24, xzr
  0x2511ab0: b        #0x2511ab8
  0x2511ab4: mov      x23, x0
  0x2511ab8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511abc: add      x0, sp, #0x20
  0x2511ac0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511ac4: cbz      x24, #0x2511cd0
  0x2511ac8: mov      x0, x24
  0x2511acc: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511ad0: mov      x23, x0
  0x2511ad4: cmp      w1, #1
  0x2511ad8: b.ne     #0x2511b00
  0x2511adc: mov      x0, x23
  0x2511ae0: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511ae4: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511ae8: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511aec: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511af0: add      x0, sp, #0x20
  0x2511af4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511af8: cbz      x24, #0x2510e90
  0x2511afc: b        #0x2511cac
  0x2511b00: mov      x24, xzr
  0x2511b04: b        #0x2511b0c
  0x2511b08: mov      x23, x0
  0x2511b0c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511b10: add      x0, sp, #0x20
  0x2511b14: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511b18: cbz      x24, #0x2511cd0
  0x2511b1c: mov      x0, x24
  0x2511b20: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511b24: mov      x23, x0
  0x2511b28: cmp      w1, #1
  0x2511b2c: b.ne     #0x2511b58
  0x2511b30: mov      x0, x23
  0x2511b34: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511b38: ldr      x19, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511b3c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511b40: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511b44: add      x0, sp, #0x20
  0x2511b48: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511b4c: cbz      x19, #0x2511604
  0x2511b50: mov      x0, x19
  0x2511b54: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511b58: mov      x19, xzr
  0x2511b5c: b        #0x2511b64
  0x2511b60: mov      x23, x0
  0x2511b64: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511b68: add      x0, sp, #0x20
  0x2511b6c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511b70: cbz      x19, #0x2511cd0
  0x2511b74: mov      x0, x19
  0x2511b78: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511b7c: mov      x23, x0
  0x2511b80: cmp      w1, #1
  0x2511b84: b.ne     #0x2511bac
  0x2511b88: mov      x0, x23
  0x2511b8c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511b90: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511b94: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511b98: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511b9c: add      x0, sp, #0x20
  0x2511ba0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511ba4: cbz      x24, #0x25114f8
  0x2511ba8: b        #0x2511cac
  0x2511bac: mov      x24, xzr
  0x2511bb0: b        #0x2511bb8
  0x2511bb4: mov      x23, x0
  0x2511bb8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511bbc: add      x0, sp, #0x20
  0x2511bc0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511bc4: cbz      x24, #0x2511cd0
  0x2511bc8: mov      x0, x24
  0x2511bcc: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511bd0: mov      x23, x0
  0x2511bd4: cmp      w1, #1
  0x2511bd8: b.ne     #0x2511c00
  0x2511bdc: mov      x0, x23
  0x2511be0: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511be4: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511be8: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511bec: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511bf0: add      x0, sp, #0x20
  0x2511bf4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511bf8: cbz      x24, #0x2511400
  0x2511bfc: b        #0x2511cac
  0x2511c00: mov      x24, xzr
  0x2511c04: b        #0x2511c0c
  0x2511c08: mov      x23, x0
  0x2511c0c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511c10: add      x0, sp, #0x20
  0x2511c14: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511c18: cbz      x24, #0x2511cd0
  0x2511c1c: mov      x0, x24
  0x2511c20: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511c24: mov      x23, x0
  0x2511c28: cmp      w1, #1
  0x2511c2c: b.ne     #0x2511c54
  0x2511c30: mov      x0, x23
  0x2511c34: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511c38: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511c3c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511c40: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511c44: add      x0, sp, #0x20
  0x2511c48: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511c4c: cbz      x24, #0x2511308
  0x2511c50: b        #0x2511cac
  0x2511c54: mov      x24, xzr
  0x2511c58: b        #0x2511c60
  0x2511c5c: mov      x23, x0
  0x2511c60: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511c64: add      x0, sp, #0x20
  0x2511c68: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511c6c: cbz      x24, #0x2511cd0
  0x2511c70: mov      x0, x24
  0x2511c74: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511c78: b        #0x2511c80
  0x2511c7c: b        #0x2511c80
  0x2511c80: mov      x23, x0
  0x2511c84: cmp      w1, #1
  0x2511c88: b.ne     #0x2511cb4
  0x2511c8c: mov      x0, x23
  0x2511c90: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2511c94: ldr      x24, [x0] ; = 0x0 (u64 @ 0x5599000)
  0x2511c98: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2511c9c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511ca0: add      x0, sp, #0x20
  0x2511ca4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511ca8: cbz      x24, #0x2510db0
  0x2511cac: mov      x0, x24
  0x2511cb0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511cb4: mov      x24, xzr
  0x2511cb8: b        #0x2511cc0
  0x2511cbc: mov      x23, x0
  0x2511cc0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5599000)
  0x2511cc4: add      x0, sp, #0x20
  0x2511cc8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2511ccc: cbnz     x24, #0x2511cd8
  0x2511cd0: mov      x0, x23
  0x2511cd4: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2511cd8: mov      x0, x24
  0x2511cdc: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2511ce0: bl       #0x1f86e18 ; -> ??? 0x1f86e18
