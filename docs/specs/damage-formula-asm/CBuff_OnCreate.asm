; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CBuff_OnCreate @ 0x232856c..0x232b7d8 (taille 12908 octets) =====
  0x232856c: sub      sp, sp, #0xd0
  0x2328570: stp      x29, x30, [sp, #0x70]
  0x2328574: stp      x28, x27, [sp, #0x80]
  0x2328578: stp      x26, x25, [sp, #0x90]
  0x232857c: stp      x24, x23, [sp, #0xa0]
  0x2328580: stp      x22, x21, [sp, #0xb0]
  0x2328584: stp      x20, x19, [sp, #0xc0]
  0x2328588: adrp     x20, #0x59d4000
  0x232858c: ldrb     w8, [x20, #0xffb]
  0x2328590: mov      x19, x0
  0x2328594: tbnz     w8, #0, #0x232887c
  0x2328598: adrp     x0, #0x5587000
  0x232859c: ldr      x0, [x0, #0xb20] ; = 0x0 (u64 @ 0x5587b20)
  0x23285a0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285a4: adrp     x0, #0x558a000
  0x23285a8: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x23285ac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285b0: adrp     x0, #0x5589000
  0x23285b4: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x23285b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285bc: adrp     x0, #0x558a000
  0x23285c0: ldr      x0, [x0, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x23285c4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285c8: adrp     x0, #0x558a000
  0x23285cc: ldr      x0, [x0, #0xeb0] ; = 0x0 (u64 @ 0x558aeb0)
  0x23285d0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285d4: adrp     x0, #0x558a000
  0x23285d8: ldr      x0, [x0, #0x258] ; = 0x0 (u64 @ 0x558a258)
  0x23285dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285e0: adrp     x0, #0x558a000
  0x23285e4: ldr      x0, [x0, #0xeb8] ; = 0x0 (u64 @ 0x558aeb8)
  0x23285e8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285ec: adrp     x0, #0x558a000
  0x23285f0: ldr      x0, [x0, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x23285f4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23285f8: adrp     x0, #0x558a000
  0x23285fc: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2328600: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328604: adrp     x0, #0x558a000
  0x2328608: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x558aec0)
  0x232860c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328610: adrp     x0, #0x558a000
  0x2328614: ldr      x0, [x0, #0xec8] ; = 0x0 (u64 @ 0x558aec8)
  0x2328618: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232861c: adrp     x0, #0x558a000
  0x2328620: ldr      x0, [x0, #0xed0] ; = 0x0 (u64 @ 0x558aed0)
  0x2328624: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328628: adrp     x0, #0x558a000
  0x232862c: ldr      x0, [x0, #0xed8] ; = 0x0 (u64 @ 0x558aed8)
  0x2328630: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328634: adrp     x0, #0x558a000
  0x2328638: ldr      x0, [x0, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x232863c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328640: adrp     x0, #0x558a000
  0x2328644: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2328648: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232864c: adrp     x0, #0x558a000
  0x2328650: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2328654: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328658: adrp     x0, #0x558a000
  0x232865c: ldr      x0, [x0, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x2328660: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328664: adrp     x0, #0x558a000
  0x2328668: ldr      x0, [x0, #0x280] ; = 0x0 (u64 @ 0x558a280)
  0x232866c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328670: adrp     x0, #0x558a000
  0x2328674: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x2328678: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232867c: adrp     x0, #0x558a000
  0x2328680: ldr      x0, [x0, #0xee0] ; = 0x0 (u64 @ 0x558aee0)
  0x2328684: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328688: adrp     x0, #0x5587000
  0x232868c: ldr      x0, [x0, #0xa48] ; = 0x0 (u64 @ 0x5587a48)
  0x2328690: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328694: adrp     x0, #0x558a000
  0x2328698: ldr      x0, [x0, #0x1c8] ; = 0x0 (u64 @ 0x558a1c8)
  0x232869c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286a0: adrp     x0, #0x5587000
  0x23286a4: ldr      x0, [x0, #0xb08] ; = 0x0 (u64 @ 0x5587b08)
  0x23286a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286ac: adrp     x0, #0x558a000
  0x23286b0: ldr      x0, [x0, #0xb0] ; = 0x0 (u64 @ 0x558a0b0)
  0x23286b4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286b8: adrp     x0, #0x558a000
  0x23286bc: ldr      x0, [x0, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x23286c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286c4: adrp     x0, #0x558a000
  0x23286c8: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x23286cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286d0: adrp     x0, #0x558a000
  0x23286d4: ldr      x0, [x0, #0xee8] ; = 0x0 (u64 @ 0x558aee8)
  0x23286d8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286dc: adrp     x0, #0x5589000
  0x23286e0: ldr      x0, [x0, #0xec8] ; = 0x0 (u64 @ 0x5589ec8)
  0x23286e4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286e8: adrp     x0, #0x558a000
  0x23286ec: ldr      x0, [x0, #0xef0] ; = 0x0 (u64 @ 0x558aef0)
  0x23286f0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23286f4: adrp     x0, #0x558a000
  0x23286f8: ldr      x0, [x0, #0xef8] ; = 0x0 (u64 @ 0x558aef8)
  0x23286fc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328700: adrp     x0, #0x5587000
  0x2328704: ldr      x0, [x0, #0xaf8] ; = 0x0 (u64 @ 0x5587af8)
  0x2328708: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232870c: adrp     x0, #0x558a000
  0x2328710: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x558ad88)
  0x2328714: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328718: adrp     x0, #0x558a000
  0x232871c: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x558a040)
  0x2328720: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328724: adrp     x0, #0x558a000
  0x2328728: ldr      x0, [x0, #0x7a8] ; = 0x0 (u64 @ 0x558a7a8)
  0x232872c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328730: adrp     x0, #0x558a000
  0x2328734: ldr      x0, [x0, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x2328738: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232873c: adrp     x0, #0x558a000
  0x2328740: ldr      x0, [x0, #0x878] ; = 0x0 (u64 @ 0x558a878)
  0x2328744: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328748: adrp     x0, #0x558a000
  0x232874c: ldr      x0, [x0, #0x7b0] ; = 0x0 (u64 @ 0x558a7b0)
  0x2328750: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328754: adrp     x0, #0x558a000
  0x2328758: ldr      x0, [x0, #0xf00] ; = 0x0 (u64 @ 0x558af00)
  0x232875c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328760: adrp     x0, #0x5589000
  0x2328764: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x5589ec0)
  0x2328768: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232876c: adrp     x0, #0x558a000
  0x2328770: ldr      x0, [x0, #0xf08] ; = 0x0 (u64 @ 0x558af08)
  0x2328774: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328778: adrp     x0, #0x558a000
  0x232877c: ldr      x0, [x0, #0x9e0] ; = 0x0 (u64 @ 0x558a9e0)
  0x2328780: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328784: adrp     x0, #0x5587000
  0x2328788: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5587af0)
  0x232878c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328790: adrp     x0, #0x5588000
  0x2328794: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2328798: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232879c: adrp     x0, #0x5587000
  0x23287a0: ldr      x0, [x0, #0xd40] ; = 0x0 (u64 @ 0x5587d40)
  0x23287a4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287a8: adrp     x0, #0x5587000
  0x23287ac: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x23287b0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287b4: adrp     x0, #0x5587000
  0x23287b8: ldr      x0, [x0, #0xc90] ; = 0x0 (u64 @ 0x5587c90)
  0x23287bc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287c0: adrp     x0, #0x558a000
  0x23287c4: ldr      x0, [x0, #0x440] ; = 0x0 (u64 @ 0x558a440)
  0x23287c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287cc: adrp     x0, #0x558a000
  0x23287d0: ldr      x0, [x0, #0xf10] ; = 0x0 (u64 @ 0x558af10)
  0x23287d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287d8: adrp     x0, #0x558a000
  0x23287dc: ldr      x0, [x0, #0xf18] ; = 0x0 (u64 @ 0x558af18)
  0x23287e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287e4: adrp     x0, #0x558a000
  0x23287e8: ldr      x0, [x0, #0xe78] ; = 0x0 (u64 @ 0x558ae78)
  0x23287ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287f0: adrp     x0, #0x558a000
  0x23287f4: ldr      x0, [x0, #0xf20] ; = 0x0 (u64 @ 0x558af20)
  0x23287f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23287fc: adrp     x0, #0x558a000
  0x2328800: ldr      x0, [x0, #0xf28] ; = 0x0 (u64 @ 0x558af28)
  0x2328804: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328808: adrp     x0, #0x558a000
  0x232880c: ldr      x0, [x0, #0xf30] ; = 0x0 (u64 @ 0x558af30)
  0x2328810: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328814: adrp     x0, #0x558a000
  0x2328818: ldr      x0, [x0, #0xf38] ; = 0x0 (u64 @ 0x558af38)
  0x232881c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328820: adrp     x0, #0x558a000
  0x2328824: ldr      x0, [x0, #0xf40] ; = 0x0 (u64 @ 0x558af40)
  0x2328828: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232882c: adrp     x0, #0x558a000
  0x2328830: ldr      x0, [x0, #0xf48] ; = 0x0 (u64 @ 0x558af48)
  0x2328834: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328838: adrp     x0, #0x558a000
  0x232883c: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x558af50)
  0x2328840: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328844: adrp     x0, #0x558a000
  0x2328848: ldr      x0, [x0, #0x470] ; = 0x0 (u64 @ 0x558a470)
  0x232884c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328850: adrp     x0, #0x558a000
  0x2328854: ldr      x0, [x0, #0xf58] ; = 0x0 (u64 @ 0x558af58)
  0x2328858: bl       #0x21af97c ; -> ??? 0x21af97c
  0x232885c: adrp     x0, #0x558a000
  0x2328860: ldr      x0, [x0, #0xf60] ; = 0x0 (u64 @ 0x558af60)
  0x2328864: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328868: adrp     x0, #0x558a000
  0x232886c: ldr      x0, [x0, #0xf68] ; = 0x0 (u64 @ 0x558af68)
  0x2328870: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328874: mov      w8, #1
  0x2328878: strb     w8, [x20, #0xffb]
  0x232887c: str      wzr, [sp, #0x6c]
  0x2328880: stp      xzr, xzr, [sp, #0x50]
  0x2328884: str      xzr, [sp, #0x60]
  0x2328888: str      wzr, [sp, #0x4c]
  0x232888c: stp      xzr, xzr, [sp, #0x30]
  0x2328890: str      xzr, [sp, #0x40]
  0x2328894: mov      x26, x19
  0x2328898: ldr      x0, [x26, #0x10]!
  0x232889c: cbz      x0, #0x232b698
  0x23288a0: ldr      w22, [x0, #0x24]
  0x23288a4: sub      w8, w22, #0xa
  0x23288a8: cmp      w8, #0x4c
  0x23288ac: b.hi     #0x2329914
  0x23288b0: ldr      w2, [x0, #0x54]
  0x23288b4: ldr      w9, [x19, #0x30]
  0x23288b8: adrp     x10, #0x106d000
  0x23288bc: add      x10, x10, #0xaec
  0x23288c0: adr      x11, #0x23288d8
  0x23288c4: ldrh     w12, [x10, x8, lsl #1]
  0x23288c8: add      x11, x11, x12, lsl #2
  0x23288cc: mul      w20, w9, w2
  0x23288d0: mov      w24, #1
  0x23288d4: br       x11
  0x23288d8: mov      x0, x19
  0x23288dc: bl       #0x232bbf0 ; -> CBuff$$ConvertImmediatelyToDot
  0x23288e0: ldr      x8, [x19, #0x20]
  0x23288e4: cbz      x8, #0x232b698
  0x23288e8: mov      w1, w0
  0x23288ec: mov      x0, x8
  0x23288f0: mov      x2, xzr
  0x23288f4: bl       #0x2819f2c ; -> CCharacterBattle$$GetBuffListByType
  0x23288f8: adrp     x8, #0x558a000
  0x23288fc: ldr      x8, [x8, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x2328900: mov      x20, x0
  0x2328904: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328908: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x232890c: tbnz     w0, #0, #0x232b3e8
  0x2328910: cbz      x20, #0x232b698
  0x2328914: adrp     x8, #0x558a000
  0x2328918: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232891c: mov      x0, x20
  0x2328920: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328924: add      x8, sp, #0x18
  0x2328928: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232892c: ldur     q0, [sp, #0x18]
  0x2328930: ldr      x8, [sp, #0x28]
  0x2328934: adrp     x22, #0x558a000
  0x2328938: ldr      x22, [x22, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232893c: str      q0, [sp, #0x50]
  0x2328940: str      x8, [sp, #0x60]
  0x2328944: adrp     x23, #0x558a000
  0x2328948: ldr      x23, [x23, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x232894c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328950: add      x0, sp, #0x50
  0x2328954: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2328958: tbz      w0, #0, #0x2328abc
  0x232895c: ldr      x20, [sp, #0x60]
  0x2328960: cbz      x20, #0x232a8a8
  0x2328964: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x59d4010)
  0x2328968: cbz      x8, #0x232a8ac
  0x232896c: ldr      x9, [x26]
  0x2328970: cbz      x9, #0x232a8a4
  0x2328974: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2328978: ldr      w24, [x8, #0x54]
  0x232897c: ldr      w25, [x20, #0x30]
  0x2328980: ldr      w21, [x9, #0x54]
  0x2328984: ldr      w8, [x0, #0xe0]
  0x2328988: cbnz     w8, #0x2328990
  0x232898c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2328990: mul      w0, w25, w24
  0x2328994: mov      w1, w21
  0x2328998: mov      x2, xzr
  0x232899c: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x23289a0: mov      w1, w0
  0x23289a4: ldr      w2, [x20, #0x2c]
  0x23289a8: ldr      x3, [x19, #0x18]
  0x23289ac: mov      x0, x20
  0x23289b0: mov      x4, xzr
  0x23289b4: bl       #0x2313894 ; -> CBattleManager$$ProcessDamageOverTime
  0x23289b8: str      wzr, [x20, #0x2c]
  0x23289bc: b        #0x232894c
  0x23289c0: cmp      w22, #0x23
  0x23289c4: b.ne     #0x232993c
  0x23289c8: adrp     x21, #0x59d4000
  0x23289cc: ldrb     w8, [x21, #0xfc3]
  0x23289d0: cbnz     w8, #0x23289e8
  0x23289d4: adrp     x0, #0x558a000
  0x23289d8: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23289dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23289e0: mov      w8, #1
  0x23289e4: strb     w8, [x21, #0xfc3]
  0x23289e8: adrp     x22, #0x558a000
  0x23289ec: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23289f0: adrp     x9, #0x5587000
  0x23289f4: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x23289f8: ldr      x9, [x9, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x23289fc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2328a00: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x2328a04: ldr      x20, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328a08: ldr      w9, [x0, #0xe0]
  0x2328a0c: cbnz     w9, #0x2328a14
  0x2328a10: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2328a14: mov      x0, x20
  0x2328a18: mov      x1, xzr
  0x2328a1c: mov      x2, xzr
  0x2328a20: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x2328a24: tbnz     w0, #0, #0x232a55c
  0x2328a28: ldrb     w8, [x21, #0xfc3]
  0x2328a2c: cbnz     w8, #0x2328a44
  0x2328a30: adrp     x0, #0x558a000
  0x2328a34: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2328a38: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328a3c: mov      w8, #1
  0x2328a40: strb     w8, [x21, #0xfc3]
  0x2328a44: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328a48: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2328a4c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328a50: cbz      x8, #0x232b698
  0x2328a54: ldr      x0, [x8, #0x20] ; = 0x0 (u64 @ 0x558a020)
  0x2328a58: mov      x1, xzr
  0x2328a5c: bl       #0x2cb0b30 ; -> CExtension$$IsTowerModes
  0x2328a60: tbz      w0, #0, #0x232a55c
  0x2328a64: ldr      x0, [x26]
  0x2328a68: cbnz     x0, #0x232993c
  0x2328a6c: b        #0x232b698
  0x2328a70: ldr      x8, [x19, #0x20]
  0x2328a74: cbz      x8, #0x232b698
  0x2328a78: ldr      w1, [x0, #0x48]
  0x2328a7c: mov      x0, x8
  0x2328a80: mov      x2, xzr
  0x2328a84: bl       #0x2826168 ; -> CCharacterBattle$$SetCCFreeze
  0x2328a88: ldr      x8, [x26]
  0x2328a8c: cbz      x8, #0x232b698
  0x2328a90: ldr      w8, [x8, #0x24]
  0x2328a94: cmp      w8, #0xc
  0x2328a98: b.ne     #0x232b3e8
  0x2328a9c: ldr      x0, [x19, #0x20]
  0x2328aa0: cbz      x0, #0x232b698
  0x2328aa4: mov      w1, #0xe
  0x2328aa8: mov      w2, #1
  0x2328aac: mov      x3, xzr
  0x2328ab0: mov      w24, #1
  0x2328ab4: bl       #0x2709674 ; -> CCharacter$$PlayAnimation
  0x2328ab8: b        #0x232b3ec
  0x2328abc: adrp     x8, #0x558a000
  0x2328ac0: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2328ac4: add      x0, sp, #0x50
  0x2328ac8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328acc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2328ad0: b        #0x2329738
  0x2328ad4: ldr      x0, [x19, #0x20]
  0x2328ad8: cbz      x0, #0x232b698
  0x2328adc: mov      w1, #3
  0x2328ae0: mov      x2, xzr
  0x2328ae4: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2328ae8: cbnz     x0, #0x2328bbc
  0x2328aec: ldr      x8, [x26]
  0x2328af0: cbz      x8, #0x2328b24
  0x2328af4: ldr      w1, [x8, #0x4c]
  0x2328af8: cbz      w1, #0x2328b24
  0x2328afc: ldr      x9, [x19, #0x18]
  0x2328b00: cbz      x9, #0x232b698
  0x2328b04: ldr      x0, [x9, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2328b08: cbz      x0, #0x232b698
  0x2328b0c: ldr      w9, [x19, #0x30]
  0x2328b10: ldr      w8, [x8, #0x54]
  0x2328b14: mov      x3, xzr
  0x2328b18: mul      w2, w8, w9
  0x2328b1c: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2328b20: mov      w20, w0
  0x2328b24: mov      x0, x19
  0x2328b28: mov      w1, w20
  0x2328b2c: bl       #0x232bf8c ; -> CBuff$$CheckReverseHealCAP
  0x2328b30: ldr      x8, [x19, #0x20]
  0x2328b34: cbz      x8, #0x232b698
  0x2328b38: mov      w20, w0
  0x2328b3c: mov      x0, x8
  0x2328b40: mov      x1, xzr
  0x2328b44: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2328b48: ldr      x8, [x19, #0x20]
  0x2328b4c: cbz      x8, #0x232b698
  0x2328b50: mov      w21, w0
  0x2328b54: mov      x0, x8
  0x2328b58: mov      x1, xzr
  0x2328b5c: bl       #0x280e4a4 ; -> CCharacterBattle$$get_ShieldHP
  0x2328b60: add      w8, w0, w21
  0x2328b64: cmp      w8, w20
  0x2328b68: b.gt     #0x2329d20
  0x2328b6c: cmp      w22, #0x12
  0x2328b70: b.ne     #0x2329c20
  0x2328b74: ldr      x0, [x19, #0x20]
  0x2328b78: cbz      x0, #0x232b698
  0x2328b7c: neg      w1, w20
  0x2328b80: mov      w2, wzr
  0x2328b84: mov      w3, wzr
  0x2328b88: mov      w4, wzr
  0x2328b8c: mov      x5, xzr
  0x2328b90: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x2328b94: mov      x0, x19
  0x2328b98: bl       #0x232c11c ; -> CBuff$$TrySetDieByReverseHeal
  0x2328b9c: cbnz     w20, #0x2329d44
  0x2328ba0: b        #0x232b3e8
  0x2328ba4: ldr      x0, [x19, #0x20]
  0x2328ba8: cbz      x0, #0x232b698
  0x2328bac: mov      w1, #3
  0x2328bb0: mov      x2, xzr
  0x2328bb4: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2328bb8: cbz      x0, #0x2329b98
  0x2328bbc: adrp     x8, #0x558a000
  0x2328bc0: ldr      x19, [x19, #0x20]
  0x2328bc4: ldr      x8, [x8, #0x440] ; = 0x0 (u64 @ 0x558a440)
  0x2328bc8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328bcc: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2328bd0: adrp     x8, #0x558a000
  0x2328bd4: ldr      x8, [x8, #0x470] ; = 0x0 (u64 @ 0x558a470)
  0x2328bd8: mov      x2, xzr
  0x2328bdc: mov      x20, x0
  0x2328be0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328be4: bl       #0x25e8dd0 ; -> Symbol$$.ctor
  0x2328be8: cbz      x19, #0x232b698
  0x2328bec: mov      x0, x19
  0x2328bf0: mov      x1, xzr
  0x2328bf4: mov      x2, xzr
  0x2328bf8: mov      x3, x20
  0x2328bfc: mov      w4, wzr
  0x2328c00: mov      w5, wzr
  0x2328c04: mov      w6, wzr
  0x2328c08: mov      w7, wzr
  0x2328c0c: str      xzr, [sp]
  0x2328c10: bl       #0x280ee60 ; -> CCharacterBattle$$PlayBuffEffect
  0x2328c14: b        #0x232b3e8
  0x2328c18: ldr      x0, [x19, #0x20]
  0x2328c1c: cbz      x0, #0x232b698
  0x2328c20: mov      w1, #0x1b
  0x2328c24: mov      x2, xzr
  0x2328c28: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2328c2c: cbz      x0, #0x232b3e8
  0x2328c30: mov      x1, x0
  0x2328c34: ldr      x0, [x19, #0x20]
  0x2328c38: cbz      x0, #0x232b698
  0x2328c3c: mov      w2, #1
  0x2328c40: mov      x3, xzr
  0x2328c44: mov      w24, #1
  0x2328c48: bl       #0x2824374 ; -> CCharacterBattle$$RemoveBuff
  0x2328c4c: b        #0x232b3ec
  0x2328c50: ldr      x0, [x19, #0x20]
  0x2328c54: cbz      x0, #0x232b698
  0x2328c58: mov      x1, xzr
  0x2328c5c: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x2328c60: cbz      x0, #0x232b698
  0x2328c64: mov      w1, w20
  0x2328c68: mov      x2, xzr
  0x2328c6c: bl       #0x2510178 ; -> CSkillManager$$ReduceCoolMax
  0x2328c70: b        #0x23298ec
  0x2328c74: ldr      x0, [x19, #0x20]
  0x2328c78: cbz      x0, #0x232b698
  0x2328c7c: mov      w1, wzr
  0x2328c80: mov      x2, xzr
  0x2328c84: bl       #0x28248b4 ; -> CCharacterBattle$$GetBuffList
  0x2328c88: adrp     x8, #0x558a000
  0x2328c8c: ldr      x8, [x8, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x2328c90: mov      x20, x0
  0x2328c94: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328c98: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x2328c9c: tbnz     w0, #0, #0x232b3e8
  0x2328ca0: cbz      x20, #0x232b698
  0x2328ca4: adrp     x8, #0x558a000
  0x2328ca8: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x2328cac: mov      x0, x20
  0x2328cb0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328cb4: add      x8, sp, #0x18
  0x2328cb8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2328cbc: ldur     q0, [sp, #0x18]
  0x2328cc0: ldr      x8, [sp, #0x28]
  0x2328cc4: adrp     x23, #0x558a000
  0x2328cc8: mov      w22, wzr
  0x2328ccc: str      q0, [sp, #0x50]
  0x2328cd0: str      x8, [sp, #0x60]
  0x2328cd4: ldr      x23, [x23, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x2328cd8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2328cdc: add      x0, sp, #0x50
  0x2328ce0: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2328ce4: tbz      w0, #0, #0x2328dc4
  0x2328ce8: ldr      x20, [sp, #0x60]
  0x2328cec: cbz      x20, #0x232a8b0
  0x2328cf0: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x59d4010)
  0x2328cf4: cbz      x8, #0x232a8b4
  0x2328cf8: ldrb     w8, [x8, #0x44]
  0x2328cfc: cbnz     w8, #0x2328cd8
  0x2328d00: mov      x0, xzr
  0x2328d04: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x2328d08: cbz      x0, #0x232a8cc
  0x2328d0c: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2328d10: cbz      x0, #0x232a8c8
  0x2328d14: mov      x1, xzr
  0x2328d18: bl       #0x2509174 ; -> CBuffManager.CBuffPool$$GetBuff
  0x2328d1c: mov      x21, x0
  0x2328d20: cbz      x0, #0x232a8c4
  0x2328d24: ldr      x1, [x20, #0x10] ; = 0x0 (u64 @ 0x59d4010)
  0x2328d28: ldr      x2, [x19, #0x18]
  0x2328d2c: ldr      w5, [x20, #0x2c]
  0x2328d30: mov      w4, #1
  0x2328d34: mov      x0, x21
  0x2328d38: mov      x3, x2
  0x2328d3c: bl       #0x2320510 ; -> CBuff$$Initialize
  0x2328d40: tbz      w0, #0, #0x2328d70
  0x2328d44: mov      x0, x21
  0x2328d48: bl       #0x23281dc ; -> CBuff$$Run
  0x2328d4c: ldr      w8, [x20, #0x2c]
  0x2328d50: str      w8, [x21, #0x2c]
  0x2328d54: ldr      x0, [x19, #0x18]
  0x2328d58: cbz      x0, #0x232a8d8
  0x2328d5c: mov      x1, x21
  0x2328d60: mov      x2, xzr
  0x2328d64: bl       #0x2823dc0 ; -> CCharacterBattle$$AddBuff
  0x2328d68: add      w22, w22, #1
  0x2328d6c: b        #0x2328d90
  0x2328d70: mov      x0, xzr
  0x2328d74: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x2328d78: cbz      x0, #0x232a8d4
  0x2328d7c: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2328d80: cbz      x0, #0x232a8d0
  0x2328d84: mov      x1, x21
  0x2328d88: mov      x2, xzr
  0x2328d8c: bl       #0x2508b38 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x2328d90: ldr      x0, [x19, #0x20]
  0x2328d94: cbz      x0, #0x232a8c0
  0x2328d98: mov      w2, #1
  0x2328d9c: mov      x1, x20
  0x2328da0: mov      x3, xzr
  0x2328da4: bl       #0x2824374 ; -> CCharacterBattle$$RemoveBuff
  0x2328da8: ldr      x8, [x26]
  0x2328dac: cbz      x8, #0x232a8bc
  0x2328db0: ldr      w8, [x8, #0x54]
  0x2328db4: ldr      w9, [x19, #0x30]
  0x2328db8: mul      w8, w9, w8
  0x2328dbc: cmp      w22, w8
  0x2328dc0: b.lt     #0x2328cd8
  0x2328dc4: adrp     x8, #0x558a000
  0x2328dc8: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x2328dcc: add      x0, sp, #0x50
  0x2328dd0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2328dd4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2328dd8: b        #0x232b3e8
  0x2328ddc: ldr      x0, [x19, #0x20]
  0x2328de0: cbz      x0, #0x232b698
  0x2328de4: mov      w1, wzr
  0x2328de8: mov      w2, w20
  0x2328dec: mov      x3, xzr
  0x2328df0: bl       #0x2825360 ; -> CCharacterBattle$$RemoveBuffs
  0x2328df4: tbz      w0, #0, #0x232b3e8
  0x2328df8: adrp     x8, #0x5587000
  0x2328dfc: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2328e00: ldr      x20, [x19, #0x18]
  0x2328e04: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2328e08: ldr      w8, [x0, #0xe0]
  0x2328e0c: cbnz     w8, #0x2328e14
  0x2328e10: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2328e14: mov      x0, x20
  0x2328e18: mov      x1, xzr
  0x2328e1c: mov      x2, xzr
  0x2328e20: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2328e24: tbz      w0, #0, #0x232b3e8
  0x2328e28: ldr      x0, [x19, #0x18]
  0x2328e2c: cbz      x0, #0x232b698
  0x2328e30: mov      x1, xzr
  0x2328e34: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2328e38: cbz      x0, #0x232b698
  0x2328e3c: mov      w24, #1
  0x2328e40: strb     w24, [x0, #0xb4]
  0x2328e44: b        #0x232b3ec
  0x2328e48: ldr      w8, [x0, #0x50]
  0x2328e4c: cmp      w8, #2
  0x2328e50: b.ne     #0x2328eb0
  0x2328e54: ldr      x8, [x19, #0x20]
  0x2328e58: cbz      x8, #0x232b698
  0x2328e5c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2328e60: cbz      x0, #0x232b698
  0x2328e64: mov      x1, xzr
  0x2328e68: bl       #0x2901d54 ; -> CCharacterData$$get_MaxWG
  0x2328e6c: ldr      x8, [x26]
  0x2328e70: cbz      x8, #0x232b698
  0x2328e74: adrp     x9, #0x558a000
  0x2328e78: ldr      x9, [x9, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2328e7c: mov      w20, w0
  0x2328e80: ldr      w8, [x8, #0x54]
  0x2328e84: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x2328e88: ldr      w9, [x19, #0x30]
  0x2328e8c: ldr      w10, [x0, #0xe0]
  0x2328e90: mul      w21, w9, w8
  0x2328e94: cbnz     w10, #0x2328e9c
  0x2328e98: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2328e9c: mov      w0, w20
  0x2328ea0: mov      w1, w21
  0x2328ea4: mov      x2, xzr
  0x2328ea8: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2328eac: mov      w20, w0
  0x2328eb0: ldr      x8, [x19, #0x20]
  0x2328eb4: cbz      x8, #0x232b698
  0x2328eb8: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x5587378)
  0x2328ebc: cbz      x0, #0x232b698
  0x2328ec0: ldr      w8, [x0, #0x38]
  0x2328ec4: add      w1, w8, w20
  0x2328ec8: b        #0x2329628
  0x2328ecc: ldr      w1, [x0, #0x4c]
  0x2328ed0: cbz      w1, #0x2328fd0
  0x2328ed4: ldr      x8, [x19, #0x20]
  0x2328ed8: cbz      x8, #0x232b698
  0x2328edc: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5587028)
  0x2328ee0: cbz      x0, #0x232b698
  0x2328ee4: mov      w2, w20
  0x2328ee8: mov      x3, xzr
  0x2328eec: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2328ef0: adrp     x21, #0x59d4000
  0x2328ef4: ldrb     w8, [x21, #0xfc3]
  0x2328ef8: mov      w20, w0
  0x2328efc: cbnz     w8, #0x2328f14
  0x2328f00: adrp     x0, #0x558a000
  0x2328f04: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2328f08: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328f0c: mov      w8, #1
  0x2328f10: strb     w8, [x21, #0xfc3]
  0x2328f14: adrp     x22, #0x558a000
  0x2328f18: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2328f1c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328f20: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55870b8)
  0x2328f24: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2328f28: cbz      x0, #0x232b698
  0x2328f2c: mov      x1, xzr
  0x2328f30: bl       #0x2595824 ; -> CDungeonScene$$get_IsPvp
  0x2328f34: tbnz     w0, #0, #0x2328f70
  0x2328f38: ldrb     w8, [x21, #0xfc3]
  0x2328f3c: cbnz     w8, #0x2328f54
  0x2328f40: adrp     x0, #0x558a000
  0x2328f44: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2328f48: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328f4c: mov      w8, #1
  0x2328f50: strb     w8, [x21, #0xfc3]
  0x2328f54: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328f58: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55870b8)
  0x2328f5c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2328f60: cbz      x0, #0x232b698
  0x2328f64: mov      x1, xzr
  0x2328f68: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x2328f6c: tbz      w0, #0, #0x2328fd0
  0x2328f70: ldrb     w8, [x21, #0xfc3]
  0x2328f74: cbnz     w8, #0x2328f8c
  0x2328f78: adrp     x0, #0x558a000
  0x2328f7c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2328f80: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2328f84: mov      w8, #1
  0x2328f88: strb     w8, [x21, #0xfc3]
  0x2328f8c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2328f90: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55870b8)
  0x2328f94: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2328f98: cbz      x8, #0x232b698
  0x2328f9c: adrp     x9, #0x558a000
  0x2328fa0: ldr      x9, [x9, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2328fa4: ldr      w21, [x8, #0x100]
  0x2328fa8: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x2328fac: ldr      w9, [x0, #0xe0]
  0x2328fb0: cbnz     w9, #0x2328fb8
  0x2328fb4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2328fb8: mov      w8, #0x3e8
  0x2328fbc: sub      w1, w8, w21
  0x2328fc0: mov      w0, w20
  0x2328fc4: mov      x2, xzr
  0x2328fc8: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2328fcc: mov      w20, w0
  0x2328fd0: ldr      x0, [x19, #0x20]
  0x2328fd4: cbz      x0, #0x232b698
  0x2328fd8: mov      w2, #1
  0x2328fdc: mov      w1, w20
  0x2328fe0: mov      w3, wzr
  0x2328fe4: mov      w4, wzr
  0x2328fe8: mov      x5, xzr
  0x2328fec: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x2328ff0: ldr      x8, [x19, #0x20]
  0x2328ff4: cbz      x8, #0x232b698
  0x2328ff8: mov      w20, w0
  0x2328ffc: mov      x0, x8
  0x2329000: mov      x1, xzr
  0x2329004: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2329008: cbz      x0, #0x232b698
  0x232900c: ldr      w8, [x0, #0xac]
  0x2329010: add      w8, w8, w20
  0x2329014: str      w8, [x0, #0xac]
  0x2329018: ldr      x0, [x19, #0x20]
  0x232901c: cbz      x0, #0x232b698
  0x2329020: mov      x1, xzr
  0x2329024: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2329028: ldr      x8, [x19, #0x18]
  0x232902c: cbz      x8, #0x232b698
  0x2329030: mov      x21, x0
  0x2329034: mov      x0, x8
  0x2329038: mov      x1, xzr
  0x232903c: bl       #0x270d244 ; -> CCharacter$$get_UID
  0x2329040: cbz      x21, #0x232b698
  0x2329044: mov      x1, x0
  0x2329048: mov      x0, x21
  0x232904c: mov      w2, w20
  0x2329050: mov      x3, xzr
  0x2329054: bl       #0x258d088 ; -> CTeam$$AddTotalHeal
  0x2329058: adrp     x21, #0x59d4000
  0x232905c: ldrb     w8, [x21, #0xfc3]
  0x2329060: cbnz     w8, #0x2329078
  0x2329064: adrp     x0, #0x558a000
  0x2329068: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x232906c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329070: mov      w8, #1
  0x2329074: strb     w8, [x21, #0xfc3]
  0x2329078: adrp     x8, #0x558a000
  0x232907c: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329080: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329084: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329088: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232908c: cbz      x8, #0x232b698
  0x2329090: ldr      x0, [x19, #0x20]
  0x2329094: cbz      x0, #0x232b698
  0x2329098: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x558a068)
  0x232909c: mov      x1, xzr
  0x23290a0: bl       #0x5034840 ; -> UnityEngine.Component$$get_transform
  0x23290a4: cbz      x21, #0x232b698
  0x23290a8: mov      x4, x0
  0x23290ac: mov      w2, #1
  0x23290b0: mov      x0, x21
  0x23290b4: mov      w1, w20
  0x23290b8: mov      w3, wzr
  0x23290bc: mov      w5, wzr
  0x23290c0: mov      x6, xzr
  0x23290c4: bl       #0x28fc644 ; -> CUIHud$$PlayHudTextDamage
  0x23290c8: ldr      x0, [x19, #0x20]
  0x23290cc: cbz      x0, #0x232b698
  0x23290d0: mov      x1, xzr
  0x23290d4: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x23290d8: cbz      x0, #0x232b698
  0x23290dc: ldr      w8, [x0, #0x60]
  0x23290e0: cbnz     w8, #0x232b3e8
  0x23290e4: adrp     x20, #0x558a000
  0x23290e8: ldr      x20, [x20, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x23290ec: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x23290f0: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x23290f4: cbz      x0, #0x232b698
  0x23290f8: mov      w1, #0x10
  0x23290fc: mov      x2, xzr
  0x2329100: bl       #0x23177a0 ; -> CBattleManager$$BattleMissionCheck
  0x2329104: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2329108: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232910c: cbz      x0, #0x232b698
  0x2329110: ldr      x2, [x19, #0x18]
  0x2329114: b        #0x2329360
  0x2329118: ldr      w1, [x0, #0x4c]
  0x232911c: cbz      w1, #0x232921c
  0x2329120: ldr      x8, [x19, #0x18]
  0x2329124: cbz      x8, #0x232b698
  0x2329128: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x232912c: cbz      x0, #0x232b698
  0x2329130: mov      w2, w20
  0x2329134: mov      x3, xzr
  0x2329138: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x232913c: adrp     x21, #0x59d4000
  0x2329140: ldrb     w8, [x21, #0xfc3]
  0x2329144: mov      w20, w0
  0x2329148: cbnz     w8, #0x2329160
  0x232914c: adrp     x0, #0x558a000
  0x2329150: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329154: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329158: mov      w8, #1
  0x232915c: strb     w8, [x21, #0xfc3]
  0x2329160: adrp     x22, #0x558a000
  0x2329164: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329168: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x232916c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329170: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329174: cbz      x0, #0x232b698
  0x2329178: mov      x1, xzr
  0x232917c: bl       #0x2595824 ; -> CDungeonScene$$get_IsPvp
  0x2329180: tbnz     w0, #0, #0x23291bc
  0x2329184: ldrb     w8, [x21, #0xfc3]
  0x2329188: cbnz     w8, #0x23291a0
  0x232918c: adrp     x0, #0x558a000
  0x2329190: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329194: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329198: mov      w8, #1
  0x232919c: strb     w8, [x21, #0xfc3]
  0x23291a0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x23291a4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x23291a8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23291ac: cbz      x0, #0x232b698
  0x23291b0: mov      x1, xzr
  0x23291b4: bl       #0x2595900 ; -> CDungeonScene$$get_IsPvpRealtime
  0x23291b8: tbz      w0, #0, #0x232921c
  0x23291bc: ldrb     w8, [x21, #0xfc3]
  0x23291c0: cbnz     w8, #0x23291d8
  0x23291c4: adrp     x0, #0x558a000
  0x23291c8: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23291cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23291d0: mov      w8, #1
  0x23291d4: strb     w8, [x21, #0xfc3]
  0x23291d8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x23291dc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x23291e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23291e4: cbz      x8, #0x232b698
  0x23291e8: adrp     x9, #0x558a000
  0x23291ec: ldr      x9, [x9, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x23291f0: ldr      w21, [x8, #0x100]
  0x23291f4: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x23291f8: ldr      w9, [x0, #0xe0]
  0x23291fc: cbnz     w9, #0x2329204
  0x2329200: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329204: mov      w8, #0x3e8
  0x2329208: sub      w1, w8, w21
  0x232920c: mov      w0, w20
  0x2329210: mov      x2, xzr
  0x2329214: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x2329218: mov      w20, w0
  0x232921c: ldr      x0, [x19, #0x20]
  0x2329220: cbz      x0, #0x232b698
  0x2329224: mov      w2, #1
  0x2329228: mov      w1, w20
  0x232922c: mov      w3, wzr
  0x2329230: mov      w4, wzr
  0x2329234: mov      x5, xzr
  0x2329238: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x232923c: ldr      x8, [x19, #0x20]
  0x2329240: cbz      x8, #0x232b698
  0x2329244: mov      w20, w0
  0x2329248: mov      x0, x8
  0x232924c: mov      x1, xzr
  0x2329250: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x2329254: cbz      x0, #0x232b698
  0x2329258: ldr      w8, [x0, #0xac]
  0x232925c: add      w8, w8, w20
  0x2329260: str      w8, [x0, #0xac]
  0x2329264: ldr      x0, [x19, #0x20]
  0x2329268: cbz      x0, #0x232b698
  0x232926c: mov      x1, xzr
  0x2329270: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2329274: ldr      x8, [x19, #0x18]
  0x2329278: cbz      x8, #0x232b698
  0x232927c: mov      x21, x0
  0x2329280: mov      x0, x8
  0x2329284: mov      x1, xzr
  0x2329288: bl       #0x270d244 ; -> CCharacter$$get_UID
  0x232928c: cbz      x21, #0x232b698
  0x2329290: mov      x1, x0
  0x2329294: mov      x0, x21
  0x2329298: mov      w2, w20
  0x232929c: mov      x3, xzr
  0x23292a0: bl       #0x258d088 ; -> CTeam$$AddTotalHeal
  0x23292a4: adrp     x21, #0x59d4000
  0x23292a8: ldrb     w8, [x21, #0xfc3]
  0x23292ac: cbnz     w8, #0x23292c4
  0x23292b0: adrp     x0, #0x558a000
  0x23292b4: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23292b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23292bc: mov      w8, #1
  0x23292c0: strb     w8, [x21, #0xfc3]
  0x23292c4: adrp     x8, #0x558a000
  0x23292c8: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x23292cc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23292d0: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x23292d4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23292d8: cbz      x8, #0x232b698
  0x23292dc: ldr      x0, [x19, #0x20]
  0x23292e0: cbz      x0, #0x232b698
  0x23292e4: ldr      x21, [x8, #0x68] ; = 0x0 (u64 @ 0x558a068)
  0x23292e8: mov      x1, xzr
  0x23292ec: bl       #0x5034840 ; -> UnityEngine.Component$$get_transform
  0x23292f0: cbz      x21, #0x232b698
  0x23292f4: mov      x4, x0
  0x23292f8: mov      w2, #1
  0x23292fc: mov      x0, x21
  0x2329300: mov      w1, w20
  0x2329304: mov      w3, wzr
  0x2329308: mov      w5, wzr
  0x232930c: mov      x6, xzr
  0x2329310: bl       #0x28fc644 ; -> CUIHud$$PlayHudTextDamage
  0x2329314: ldr      x0, [x19, #0x20]
  0x2329318: cbz      x0, #0x232b698
  0x232931c: mov      x1, xzr
  0x2329320: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x2329324: cbz      x0, #0x232b698
  0x2329328: ldr      w8, [x0, #0x60]
  0x232932c: cbnz     w8, #0x232b3e8
  0x2329330: adrp     x20, #0x558a000
  0x2329334: ldr      x20, [x20, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x2329338: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x232933c: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2329340: cbz      x0, #0x232b698
  0x2329344: mov      w1, #0x10
  0x2329348: mov      x2, xzr
  0x232934c: bl       #0x23177a0 ; -> CBattleManager$$BattleMissionCheck
  0x2329350: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2329354: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x2329358: cbz      x0, #0x232b698
  0x232935c: ldr      x2, [x19, #0x20]
  0x2329360: mov      w1, #0x18
  0x2329364: mov      x3, xzr
  0x2329368: bl       #0x23179bc ; -> CBattleManager$$BattleMissionCheck
  0x232936c: b        #0x232b3e8
  0x2329370: adrp     x8, #0x558a000
  0x2329374: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2329378: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232937c: ldr      w8, [x0, #0xe0]
  0x2329380: cbnz     w8, #0x2329388
  0x2329384: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329388: mov      x0, xzr
  0x232938c: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2329390: ldr      x8, [x26]
  0x2329394: cbz      x8, #0x232b698
  0x2329398: cbz      x0, #0x232b698
  0x232939c: ldr      w9, [x19, #0x30]
  0x23293a0: ldr      w8, [x8, #0x54]
  0x23293a4: mov      x2, xzr
  0x23293a8: mul      w1, w8, w9
  0x23293ac: bl       #0x2625914 ; -> CTempletManager$$GetBuffGroupTemplet
  0x23293b0: cbz      x0, #0x2329dd0
  0x23293b4: adrp     x8, #0x558a000
  0x23293b8: ldr      x20, [x0, #0x18] ; = 0x0 (u64 @ 0x558a018)
  0x23293bc: ldr      x8, [x8, #0xeb8] ; = 0x0 (u64 @ 0x558aeb8)
  0x23293c0: mov      x0, x20
  0x23293c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23293c8: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x23293cc: tbnz     w0, #0, #0x232b3e8
  0x23293d0: cbz      x20, #0x232b698
  0x23293d4: ldr      w8, [x20, #0x18]
  0x23293d8: cmp      w8, #1
  0x23293dc: b.lt     #0x232b3e8
  0x23293e0: adrp     x25, #0x558a000
  0x23293e4: ldr      x25, [x25, #0xeb0] ; = 0x0 (u64 @ 0x558aeb0)
  0x23293e8: mov      x22, xzr
  0x23293ec: add      x23, x20, #0x20
  0x23293f0: mov      w24, #1
  0x23293f4: cmp      w22, w8
  0x23293f8: b.hs     #0x232a8b8
  0x23293fc: ldr      x21, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x558a003)
  0x2329400: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x2329404: mov      x0, x21
  0x2329408: bl       #0x34142a8 ; -> CExtension$$IsNullOrEmpty<char>
  0x232940c: tbnz     w0, #0, #0x2329458
  0x2329410: ldr      x0, [x19, #0x20]
  0x2329414: cbz      x0, #0x232b698
  0x2329418: mov      x1, x21
  0x232941c: mov      x2, xzr
  0x2329420: bl       #0x282473c ; -> CCharacterBattle$$FindBuff
  0x2329424: cbz      x0, #0x2329458
  0x2329428: mov      x1, x0
  0x232942c: ldr      x0, [x19, #0x20]
  0x2329430: cbz      x0, #0x232b698
  0x2329434: mov      w2, #1
  0x2329438: mov      x3, xzr
  0x232943c: bl       #0x2824374 ; -> CCharacterBattle$$RemoveBuff
  0x2329440: ldr      x8, [x19, #0x20]
  0x2329444: cbz      x8, #0x232b698
  0x2329448: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x232944c: cbz      x0, #0x232b698
  0x2329450: mov      x1, xzr
  0x2329454: bl       #0x290070c ; -> CCharacterData$$SetStatDirty
  0x2329458: add      x22, x22, #1
  0x232945c: str      w22, [sp, #0x6c]
  0x2329460: ldr      w8, [x20, #0x18]
  0x2329464: cmp      w22, w8
  0x2329468: b.lt     #0x23293f4
  0x232946c: b        #0x232b3ec
  0x2329470: ldr      w1, [x0, #0x4c]
  0x2329474: cbz      w1, #0x232965c
  0x2329478: ldr      x8, [x19, #0x20]
  0x232947c: cbnz     x8, #0x2329644
  0x2329480: b        #0x232b698
  0x2329484: ldr      x20, [x19, #0x20]
  0x2329488: mov      x0, x19
  0x232948c: bl       #0x232c1b8 ; -> CBuff$$GetActionGaugeEnhanceValue
  0x2329490: cbz      x20, #0x232b698
  0x2329494: mov      w1, w0
  0x2329498: mov      w2, #1
  0x232949c: mov      x0, x20
  0x23294a0: mov      x3, xzr
  0x23294a4: mov      w21, #1
  0x23294a8: bl       #0x280e238 ; -> CCharacterBattle$$AddActionPoint
  0x23294ac: adrp     x20, #0x59d4000
  0x23294b0: ldrb     w8, [x20, #0xfcb]
  0x23294b4: cbnz     w8, #0x23294c8
  0x23294b8: adrp     x0, #0x558a000
  0x23294bc: ldr      x0, [x0, #0x6e8] ; = 0x0 (u64 @ 0x558a6e8)
  0x23294c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23294c4: strb     w21, [x20, #0xfcb]
  0x23294c8: adrp     x8, #0x558a000
  0x23294cc: ldr      x8, [x8, #0x6e8] ; = 0x0 (u64 @ 0x558a6e8)
  0x23294d0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23294d4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x23294d8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23294dc: cbz      x0, #0x232b698
  0x23294e0: ldr      x1, [x19, #0x20]
  0x23294e4: mov      x2, xzr
  0x23294e8: bl       #0x28f9e48 ; -> CHudTurnSequencePanel$$JumpIcon
  0x23294ec: b        #0x232b3e8
  0x23294f0: ldr      x0, [x19, #0x20]
  0x23294f4: cbz      x0, #0x232b698
  0x23294f8: mov      w1, #1
  0x23294fc: b        #0x232972c
  0x2329500: ldr      x0, [x19, #0x20]
  0x2329504: cbz      x0, #0x232b698
  0x2329508: mov      x1, xzr
  0x232950c: bl       #0x270d5f8 ; -> CCharacter$$get_IsGhost
  0x2329510: tbz      w0, #0, #0x232b3e8
  0x2329514: ldr      x8, [x26]
  0x2329518: cbz      x8, #0x2329554
  0x232951c: ldr      w9, [x8, #0x50]
  0x2329520: cmp      w9, #2
  0x2329524: b.ne     #0x2329554
  0x2329528: ldr      x9, [x19, #0x20]
  0x232952c: cbz      x9, #0x232b698
  0x2329530: ldr      x0, [x9, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329534: cbz      x0, #0x232b698
  0x2329538: ldr      w9, [x19, #0x30]
  0x232953c: ldr      w8, [x8, #0x54]
  0x2329540: mov      w1, #1
  0x2329544: mov      x3, xzr
  0x2329548: mul      w2, w8, w9
  0x232954c: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2329550: mov      w20, w0
  0x2329554: ldr      x0, [x19, #0x20]
  0x2329558: cbz      x0, #0x232b698
  0x232955c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x2329560: mov      w1, w20
  0x2329564: ldp      x9, x2, [x8, #0x1c8]
  0x2329568: blr      x9
  0x232956c: b        #0x232b3e8
  0x2329570: ldr      x8, [x19, #0x20]
  0x2329574: cbz      x8, #0x232b698
  0x2329578: ldr      x0, [x8, #0x378] ; = 0x0 (u64 @ 0x558a378)
  0x232957c: cbz      x0, #0x232b698
  0x2329580: mov      x1, xzr
  0x2329584: bl       #0x2509864 ; -> CRageManager$$get_CanReduceWG
  0x2329588: tbz      w0, #0, #0x232a55c
  0x232958c: ldr      x8, [x26]
  0x2329590: cbz      x8, #0x23295fc
  0x2329594: ldr      w8, [x8, #0x50]
  0x2329598: cmp      w8, #2
  0x232959c: b.ne     #0x23295fc
  0x23295a0: ldr      x8, [x19, #0x20]
  0x23295a4: cbz      x8, #0x232b698
  0x23295a8: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x23295ac: cbz      x0, #0x232b698
  0x23295b0: mov      x1, xzr
  0x23295b4: bl       #0x2901d54 ; -> CCharacterData$$get_MaxWG
  0x23295b8: ldr      x8, [x26]
  0x23295bc: cbz      x8, #0x232b698
  0x23295c0: adrp     x9, #0x558a000
  0x23295c4: ldr      x9, [x9, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x23295c8: mov      w20, w0
  0x23295cc: ldr      w8, [x8, #0x54]
  0x23295d0: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x23295d4: ldr      w9, [x19, #0x30]
  0x23295d8: ldr      w10, [x0, #0xe0]
  0x23295dc: mul      w21, w9, w8
  0x23295e0: cbnz     w10, #0x23295e8
  0x23295e4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23295e8: mov      w0, w20
  0x23295ec: mov      w1, w21
  0x23295f0: mov      x2, xzr
  0x23295f4: bl       #0x2a00d74 ; -> CCommonDefine$$MulPermille
  0x23295f8: mov      w20, w0
  0x23295fc: ldp      x0, x1, [x19, #0x18]
  0x2329600: mov      w2, w20
  0x2329604: mov      x3, xzr
  0x2329608: bl       #0x2cb3d40 ; -> CFormula$$CalcDamageWG
  0x232960c: ldr      x8, [x19, #0x20]
  0x2329610: cbz      x8, #0x232b698
  0x2329614: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x558a378)
  0x2329618: cbz      x8, #0x232b698
  0x232961c: ldr      w9, [x8, #0x38]
  0x2329620: sub      w1, w9, w0
  0x2329624: mov      x0, x8
  0x2329628: mov      x2, xzr
  0x232962c: bl       #0x25097b0 ; -> CRageManager$$set_WG
  0x2329630: b        #0x232b3e8
  0x2329634: ldr      w1, [x0, #0x4c]
  0x2329638: cbz      w1, #0x232965c
  0x232963c: ldr      x8, [x19, #0x18]
  0x2329640: cbz      x8, #0x232b698
  0x2329644: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329648: cbz      x0, #0x232b698
  0x232964c: mov      w2, w20
  0x2329650: mov      x3, xzr
  0x2329654: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2329658: mov      w20, w0
  0x232965c: ldr      x0, [x19, #0x20]
  0x2329660: cbz      x0, #0x232b698
  0x2329664: mov      w1, w20
  0x2329668: mov      x2, xzr
  0x232966c: bl       #0x2810eb0 ; -> CCharacterBattle$$SetShieldHP
  0x2329670: b        #0x232b3e8
  0x2329674: ldr      x0, [x19, #0x20]
  0x2329678: cbz      x0, #0x232b698
  0x232967c: mov      x1, xzr
  0x2329680: bl       #0x270d5d8 ; -> CCharacter$$get_IsDying
  0x2329684: tbz      w0, #0, #0x232b3e8
  0x2329688: ldr      x0, [x19, #0x20]
  0x232968c: cbz      x0, #0x232b698
  0x2329690: mov      x1, xzr
  0x2329694: bl       #0x2813cc0 ; -> CCharacterBattle$$SetSealedResurrection
  0x2329698: b        #0x232b3e8
  0x232969c: ldr      x0, [x19, #0x20]
  0x23296a0: cbz      x0, #0x232b698
  0x23296a4: mov      w1, #1
  0x23296a8: mov      w2, w20
  0x23296ac: mov      x3, xzr
  0x23296b0: mov      w24, #1
  0x23296b4: bl       #0x2825360 ; -> CCharacterBattle$$RemoveBuffs
  0x23296b8: tbz      w0, #0, #0x232b3ec
  0x23296bc: ldr      x8, [x19, #0x20]
  0x23296c0: cbz      x8, #0x232b698
  0x23296c4: ldr      w8, [x8, #0x21c]
  0x23296c8: cbnz     w8, #0x232a39c
  0x23296cc: adrp     x21, #0x5587000
  0x23296d0: ldr      x21, [x21, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x23296d4: ldr      x20, [x19, #0x18]
  0x23296d8: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5587000)
  0x23296dc: ldr      w8, [x0, #0xe0]
  0x23296e0: cbnz     w8, #0x23296e8
  0x23296e4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23296e8: mov      x0, x20
  0x23296ec: mov      x1, xzr
  0x23296f0: mov      x2, xzr
  0x23296f4: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x23296f8: tbz      w0, #0, #0x232a364
  0x23296fc: adrp     x8, #0x558a000
  0x2329700: ldr      x8, [x8, #0x358] ; = 0x0 (u64 @ 0x558a358)
  0x2329704: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329708: bl       #0x3e5d064 ; -> CSingletonBehaviour<object>$$get_Instance
  0x232970c: cbz      x0, #0x232b698
  0x2329710: mov      w1, #0x19
  0x2329714: mov      x2, xzr
  0x2329718: bl       #0x23177a0 ; -> CBattleManager$$BattleMissionCheck
  0x232971c: b        #0x232a39c
  0x2329720: ldr      x0, [x19, #0x20]
  0x2329724: cbz      x0, #0x232b698
  0x2329728: mov      w1, wzr
  0x232972c: mov      w2, w20
  0x2329730: mov      x3, xzr
  0x2329734: bl       #0x2825e18 ; -> CCharacterBattle$$ExtendBuff
  0x2329738: ldr      x0, [x19, #0x20]
  0x232973c: cbz      x0, #0x232b698
  0x2329740: mov      x1, xzr
  0x2329744: bl       #0x2825f08 ; -> CCharacterBattle$$ClearBuffFinishDuration
  0x2329748: b        #0x232b3e8
  0x232974c: ldr      x0, [x19, #0x20]
  0x2329750: cbz      x0, #0x232b698
  0x2329754: mov      x1, xzr
  0x2329758: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x232975c: cbz      x0, #0x232b698
  0x2329760: ldr      w8, [x0, #0x70]
  0x2329764: mov      x2, xzr
  0x2329768: add      w1, w8, w20
  0x232976c: bl       #0x258ccb4 ; -> CTeam$$set_CP
  0x2329770: b        #0x232b3e8
  0x2329774: ldr      x0, [x19, #0x20]
  0x2329778: cbz      x0, #0x232b698
  0x232977c: mov      x1, xzr
  0x2329780: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x2329784: ldr      x8, [x26]
  0x2329788: cbz      x8, #0x232b698
  0x232978c: cbz      x0, #0x232b698
  0x2329790: ldr      w1, [x8, #0x58]
  0x2329794: mov      w2, w20
  0x2329798: mov      x3, xzr
  0x232979c: bl       #0x251024c ; -> CSkillManager$$SetMaxUniqueResource
  0x23297a0: ldr      x0, [x19, #0x20]
  0x23297a4: cbz      x0, #0x232b698
  0x23297a8: mov      x1, xzr
  0x23297ac: bl       #0x280db8c ; -> CCharacterBattle$$get_IsOverNamed
  0x23297b0: ldr      x8, [x19, #0x20]
  0x23297b4: cbz      x8, #0x232b698
  0x23297b8: tbz      w0, #0, #0x2329dc0
  0x23297bc: mov      x0, x8
  0x23297c0: mov      x1, xzr
  0x23297c4: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x23297c8: ldr      x8, [x26]
  0x23297cc: cbz      x8, #0x232b698
  0x23297d0: cbz      x0, #0x232b698
  0x23297d4: ldr      w1, [x8, #0x58]
  0x23297d8: mov      x2, xzr
  0x23297dc: bl       #0x250c2a4 ; -> CSkillManager$$GetSkill
  0x23297e0: cbz      x0, #0x232b3e8
  0x23297e4: ldr      x8, [x19, #0x20]
  0x23297e8: cbz      x8, #0x232b698
  0x23297ec: ldr      x8, [x8, #0x2d8] ; = 0x0 (u64 @ 0x558a2d8)
  0x23297f0: cbz      x8, #0x232b3e8
  0x23297f4: ldr      x9, [x26]
  0x23297f8: cbz      x9, #0x232b698
  0x23297fc: ldr      w1, [x9, #0x58]
  0x2329800: ldp      w2, w3, [x0, #0x3c]
  0x2329804: mov      x0, x8
  0x2329808: mov      x4, xzr
  0x232980c: bl       #0x28e4c94 ; -> CHudBossGauge$$UpdateUniqueResource
  0x2329810: b        #0x232b3e8
  0x2329814: ldr      x19, [x19, #0x20]
  0x2329818: cbz      x19, #0x232b698
  0x232981c: mov      x0, x19
  0x2329820: mov      x1, xzr
  0x2329824: bl       #0x280f2ac ; -> CCharacterBattle$$get_AP
  0x2329828: add      w1, w0, w20
  0x232982c: mov      x0, x19
  0x2329830: mov      x2, xzr
  0x2329834: bl       #0x280f310 ; -> CCharacterBattle$$set_AP
  0x2329838: b        #0x232b3e8
  0x232983c: ldr      x0, [x19, #0x20]
  0x2329840: cbz      x0, #0x232b698
  0x2329844: mov      x1, xzr
  0x2329848: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x232984c: cbz      x0, #0x232b698
  0x2329850: mov      w1, w20
  0x2329854: mov      x2, xzr
  0x2329858: bl       #0x2510058 ; -> CSkillManager$$AddCoolSecond
  0x232985c: b        #0x23298ec
  0x2329860: ldr      x1, [x19, #0x20]
  0x2329864: neg      w2, w2
  0x2329868: b        #0x232990c
  0x232986c: ldr      x8, [x19, #0x20]
  0x2329870: cbz      x8, #0x232b698
  0x2329874: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329878: cbz      x0, #0x232b698
  0x232987c: mov      w1, #0x26
  0x2329880: mov      x2, xzr
  0x2329884: bl       #0x290c1c4 ; -> CCharacterData$$IsImmune
  0x2329888: tbnz     w0, #0, #0x23298ac
  0x232988c: ldr      x0, [x19, #0x20]
  0x2329890: cbz      x0, #0x232b698
  0x2329894: mov      x1, xzr
  0x2329898: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x232989c: cbz      x0, #0x232b698
  0x23298a0: mov      w1, w20
  0x23298a4: mov      x2, xzr
  0x23298a8: bl       #0x2510058 ; -> CSkillManager$$AddCoolSecond
  0x23298ac: ldr      x8, [x19, #0x20]
  0x23298b0: cbz      x8, #0x232b698
  0x23298b4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x23298b8: cbz      x0, #0x232b698
  0x23298bc: mov      w1, #0x27
  0x23298c0: mov      x2, xzr
  0x23298c4: bl       #0x290c1c4 ; -> CCharacterData$$IsImmune
  0x23298c8: tbnz     w0, #0, #0x23298ec
  0x23298cc: ldr      x0, [x19, #0x20]
  0x23298d0: cbz      x0, #0x232b698
  0x23298d4: mov      x1, xzr
  0x23298d8: bl       #0x270d288 ; -> CCharacter$$get_SkillManager
  0x23298dc: cbz      x0, #0x232b698
  0x23298e0: mov      w1, w20
  0x23298e4: mov      x2, xzr
  0x23298e8: bl       #0x25100b8 ; -> CSkillManager$$AddCoolUltimate
  0x23298ec: ldr      x8, [x19, #0x20]
  0x23298f0: cbz      x8, #0x232b698
  0x23298f4: ldr      x0, [x8, #0x2d8] ; = 0x0 (u64 @ 0x558a2d8)
  0x23298f8: cbz      x0, #0x232b3e8
  0x23298fc: mov      x1, xzr
  0x2329900: bl       #0x28e4a28 ; -> CHudBossGauge$$SetSkillButtons
  0x2329904: b        #0x232b3e8
  0x2329908: ldr      x1, [x19, #0x18]
  0x232990c: bl       #0x232c56c ; -> CBuff$$AddUniqueResource
  0x2329910: b        #0x232b3e8
  0x2329914: sub      w8, w22, #0x8f
  0x2329918: cmp      w8, #0xa
  0x232991c: mov      w24, #1
  0x2329920: b.hi     #0x232b3ec
  0x2329924: adrp     x9, #0x106d000
  0x2329928: add      x9, x9, #0xb86
  0x232992c: adr      x10, #0x232993c
  0x2329930: ldrh     w11, [x9, x8, lsl #1]
  0x2329934: add      x10, x10, x11, lsl #2
  0x2329938: br       x10
  0x232993c: ldr      w8, [x0, #0x24]
  0x2329940: cmp      w8, #0x22
  0x2329944: b.eq     #0x2329a18
  0x2329948: cmp      w8, #0x21
  0x232994c: b.eq     #0x23299ec
  0x2329950: cmp      w8, #0x1f
  0x2329954: b.ne     #0x2329b24
  0x2329958: ldr      w8, [x0, #0xd8]
  0x232995c: cbz      w8, #0x2329b24
  0x2329960: mov      x1, xzr
  0x2329964: bl       #0x25ed8a8 ; -> CBuffTemplet$$get_IsDebuff
  0x2329968: ldr      x8, [x19, #0x20]
  0x232996c: cbz      x8, #0x232b698
  0x2329970: tst      w0, #1
  0x2329974: mov      w9, #0x1d
  0x2329978: cinc     w1, w9, ne
  0x232997c: mov      x0, x8
  0x2329980: mov      x2, xzr
  0x2329984: bl       #0x280df90 ; -> CCharacterBattle$$FindBuffByType
  0x2329988: cbz      x0, #0x2329b24
  0x232998c: ldr      x8, [x19, #0x10]
  0x2329990: mov      w9, #1
  0x2329994: strb     w9, [x19, #0x34]
  0x2329998: cbz      x8, #0x232b698
  0x232999c: ldr      x9, [x0, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x23299a0: cbz      x9, #0x232b698
  0x23299a4: ldr      w10, [x8, #0x54]
  0x23299a8: adrp     x8, #0x558a000
  0x23299ac: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x23299b0: ldr      w11, [x19, #0x30]
  0x23299b4: ldr      w9, [x9, #0x54]
  0x23299b8: ldr      w12, [x0, #0x30]
  0x23299bc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23299c0: mul      w21, w11, w10
  0x23299c4: mul      w20, w12, w9
  0x23299c8: ldr      w13, [x8, #0xe0]
  0x23299cc: cbnz     w13, #0x23299d8
  0x23299d0: mov      x0, x8
  0x23299d4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x23299d8: mov      w0, w21
  0x23299dc: mov      w1, w20
  0x23299e0: mov      x2, xzr
  0x23299e4: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x23299e8: b        #0x2329b20
  0x23299ec: ldr      x8, [x19, #0x20]
  0x23299f0: mov      w9, #1
  0x23299f4: strb     w9, [x19, #0x34]
  0x23299f8: cbz      x8, #0x232b698
  0x23299fc: ldr      w9, [x19, #0x30]
  0x2329a00: ldr      w10, [x0, #0x54]
  0x2329a04: mov      x0, x8
  0x2329a08: mov      x2, xzr
  0x2329a0c: mul      w1, w10, w9
  0x2329a10: bl       #0x280f19c ; -> CCharacterBattle$$GetLostHPRateValue
  0x2329a14: b        #0x2329b20
  0x2329a18: ldr      x0, [x19, #0x20]
  0x2329a1c: mov      w8, #1
  0x2329a20: strb     w8, [x19, #0x34]
  0x2329a24: cbz      x0, #0x232b698
  0x2329a28: mov      x1, xzr
  0x2329a2c: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329a30: ldr      x8, [x19, #0x20]
  0x2329a34: cbz      x8, #0x232b698
  0x2329a38: mov      w20, w0
  0x2329a3c: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329a40: cbz      x0, #0x232b698
  0x2329a44: mov      x1, xzr
  0x2329a48: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2329a4c: ldr      x8, [x19, #0x20]
  0x2329a50: cbz      x8, #0x232b698
  0x2329a54: mov      w21, w0
  0x2329a58: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329a5c: cbz      x0, #0x232b698
  0x2329a60: mov      x1, xzr
  0x2329a64: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2329a68: adrp     x23, #0x5588000
  0x2329a6c: ldr      x23, [x23, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2329a70: mov      w22, w0
  0x2329a74: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5588000)
  0x2329a78: ldr      w9, [x8, #0xe0]
  0x2329a7c: cbnz     w9, #0x2329a88
  0x2329a80: mov      x0, x8
  0x2329a84: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329a88: adrp     x24, #0x59d5000
  0x2329a8c: ldrb     w8, [x24, #0xe]
  0x2329a90: sbfiz    x9, x20, #1, #0x20
  0x2329a94: sub      x21, x9, w21, sxtw
  0x2329a98: sxtw     x20, w22
  0x2329a9c: cbnz     w8, #0x2329ac0
  0x2329aa0: adrp     x0, #0x558a000
  0x2329aa4: ldr      x0, [x0, #0xf70] ; = 0x0 (u64 @ 0x558af70)
  0x2329aa8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329aac: adrp     x0, #0x5588000
  0x2329ab0: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2329ab4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329ab8: mov      w8, #1
  0x2329abc: strb     w8, [x24, #0xe]
  0x2329ac0: tbz      w22, #0x1f, #0x2329aec
  0x2329ac4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5588000)
  0x2329ac8: ldr      w8, [x0, #0xe0]
  0x2329acc: cbnz     w8, #0x2329ad4
  0x2329ad0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329ad4: adrp     x8, #0x558a000
  0x2329ad8: ldr      x8, [x8, #0xf70] ; = 0x0 (u64 @ 0x558af70)
  0x2329adc: mov      x0, xzr
  0x2329ae0: mov      x1, x20
  0x2329ae4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329ae8: bl       #0x34c37c0 ; -> System.Math$$ThrowMinMaxException<long>
  0x2329aec: ldr      x8, [x19, #0x10]
  0x2329af0: cmp      x21, x20
  0x2329af4: csel     w9, w20, w21, gt
  0x2329af8: cmp      x21, #0
  0x2329afc: csel     w1, wzr, w9, lt
  0x2329b00: cbz      x8, #0x232b698
  0x2329b04: ldr      x0, [x19, #0x20]
  0x2329b08: cbz      x0, #0x232b698
  0x2329b0c: ldr      w9, [x19, #0x30]
  0x2329b10: ldr      w8, [x8, #0x54]
  0x2329b14: mov      x3, xzr
  0x2329b18: mul      w2, w8, w9
  0x2329b1c: bl       #0x280f220 ; -> CCharacterBattle$$GetLostHPRateValue
  0x2329b20: str      w0, [x19, #0x38]
  0x2329b24: ldr      x8, [x26]
  0x2329b28: cbz      x8, #0x232b3e8
  0x2329b2c: ldr      w8, [x8, #0x4c]
  0x2329b30: cbz      w8, #0x232b3e8
  0x2329b34: cmp      w8, #1
  0x2329b38: b.ne     #0x2329da0
  0x2329b3c: ldr      x0, [x19, #0x20]
  0x2329b40: cbz      x0, #0x232b698
  0x2329b44: mov      x1, xzr
  0x2329b48: bl       #0x280f164 ; -> CCharacterBattle$$get_IsFullHP
  0x2329b4c: ldr      x8, [x19, #0x20]
  0x2329b50: cbz      x8, #0x232b698
  0x2329b54: tbz      w0, #0, #0x2329e40
  0x2329b58: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2329b5c: cbz      x0, #0x232b698
  0x2329b60: mov      x1, x19
  0x2329b64: mov      x2, xzr
  0x2329b68: bl       #0x2909784 ; -> CCharacterData$$AddStatBuff
  0x2329b6c: ldr      x19, [x19, #0x20]
  0x2329b70: cbz      x19, #0x232b698
  0x2329b74: ldr      x0, [x19, #0x28]
  0x2329b78: cbz      x0, #0x232b698
  0x2329b7c: mov      x1, xzr
  0x2329b80: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2329b84: mov      w1, w0
  0x2329b88: mov      w4, #1
  0x2329b8c: mov      w24, #1
  0x2329b90: mov      x0, x19
  0x2329b94: b        #0x232a350
  0x2329b98: ldr      x8, [x26]
  0x2329b9c: cbz      x8, #0x2329bd0
  0x2329ba0: ldr      w1, [x8, #0x4c]
  0x2329ba4: cbz      w1, #0x2329bd0
  0x2329ba8: ldr      x9, [x19, #0x20]
  0x2329bac: cbz      x9, #0x232b698
  0x2329bb0: ldr      x0, [x9, #0x28] ; = 0x174876e800 (u64 @ 0x106d028)
  0x2329bb4: cbz      x0, #0x232b698
  0x2329bb8: ldr      w9, [x19, #0x30]
  0x2329bbc: ldr      w8, [x8, #0x54]
  0x2329bc0: mov      x3, xzr
  0x2329bc4: mul      w2, w8, w9
  0x2329bc8: bl       #0x29033c8 ; -> CCharacterData$$GetStatValuePermille
  0x2329bcc: mov      w20, w0
  0x2329bd0: mov      x0, x19
  0x2329bd4: mov      w1, w20
  0x2329bd8: bl       #0x232bf8c ; -> CBuff$$CheckReverseHealCAP
  0x2329bdc: ldr      x8, [x19, #0x20]
  0x2329be0: cbz      x8, #0x232b698
  0x2329be4: mov      w20, w0
  0x2329be8: mov      x0, x8
  0x2329bec: mov      x1, xzr
  0x2329bf0: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329bf4: ldr      x8, [x19, #0x20]
  0x2329bf8: cbz      x8, #0x232b698
  0x2329bfc: mov      w21, w0
  0x2329c00: mov      x0, x8
  0x2329c04: mov      x1, xzr
  0x2329c08: bl       #0x280e4a4 ; -> CCharacterBattle$$get_ShieldHP
  0x2329c0c: add      w8, w0, w21
  0x2329c10: cmp      w8, w20
  0x2329c14: b.gt     #0x2329d20
  0x2329c18: cmp      w22, #0x13
  0x2329c1c: b.eq     #0x2328b74
  0x2329c20: adrp     x21, #0x59d4000
  0x2329c24: ldrb     w8, [x21, #0xfc3]
  0x2329c28: cbnz     w8, #0x2329c40
  0x2329c2c: adrp     x0, #0x558a000
  0x2329c30: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329c34: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329c38: mov      w8, #1
  0x2329c3c: strb     w8, [x21, #0xfc3]
  0x2329c40: adrp     x22, #0x558a000
  0x2329c44: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329c48: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2329c4c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329c50: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329c54: cbz      x0, #0x232b698
  0x2329c58: mov      x1, xzr
  0x2329c5c: bl       #0x259586c ; -> CDungeonScene$$get_IsGuildDungeon
  0x2329c60: tbnz     w0, #0, #0x2329d0c
  0x2329c64: ldrb     w8, [x21, #0xfc3]
  0x2329c68: cbnz     w8, #0x2329c80
  0x2329c6c: adrp     x0, #0x558a000
  0x2329c70: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329c74: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329c78: mov      w8, #1
  0x2329c7c: strb     w8, [x21, #0xfc3]
  0x2329c80: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2329c84: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329c88: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329c8c: cbz      x0, #0x232b698
  0x2329c90: mov      x1, xzr
  0x2329c94: bl       #0x25958dc ; -> CDungeonScene$$get_IsEventChallenge
  0x2329c98: tbnz     w0, #0, #0x2329d0c
  0x2329c9c: ldrb     w8, [x21, #0xfc3]
  0x2329ca0: cbnz     w8, #0x2329cb8
  0x2329ca4: adrp     x0, #0x558a000
  0x2329ca8: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329cac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329cb0: mov      w8, #1
  0x2329cb4: strb     w8, [x21, #0xfc3]
  0x2329cb8: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2329cbc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329cc0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329cc4: cbz      x0, #0x232b698
  0x2329cc8: mov      x1, xzr
  0x2329ccc: bl       #0x25958b8 ; -> CDungeonScene$$get_IsWorldBoss
  0x2329cd0: tbnz     w0, #0, #0x2329d0c
  0x2329cd4: ldrb     w8, [x21, #0xfc3]
  0x2329cd8: cbnz     w8, #0x2329cf0
  0x2329cdc: adrp     x0, #0x558a000
  0x2329ce0: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2329ce4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329ce8: mov      w8, #1
  0x2329cec: strb     w8, [x21, #0xfc3]
  0x2329cf0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x2329cf4: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x2329cf8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329cfc: cbz      x0, #0x232b698
  0x2329d00: mov      x1, xzr
  0x2329d04: bl       #0x2595994 ; -> CDungeonScene$$get_IsMonadGateSingularity
  0x2329d08: tbz      w0, #0, #0x2329ed4
  0x2329d0c: ldr      x0, [x19, #0x20]
  0x2329d10: cbz      x0, #0x232b698
  0x2329d14: mov      x1, xzr
  0x2329d18: bl       #0x280db44 ; -> CCharacterBattle$$get_IsBoss
  0x2329d1c: tbz      w0, #0, #0x2329ed4
  0x2329d20: ldr      x0, [x19, #0x20]
  0x2329d24: cbz      x0, #0x232b698
  0x2329d28: neg      w1, w20
  0x2329d2c: mov      w2, wzr
  0x2329d30: mov      w3, wzr
  0x2329d34: mov      w4, wzr
  0x2329d38: mov      x5, xzr
  0x2329d3c: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x2329d40: cbz      w20, #0x232b3e8
  0x2329d44: adrp     x22, #0x59d5000
  0x2329d48: ldrb     w8, [x22, #0xd]
  0x2329d4c: ldp      x21, x19, [x19, #0x18]
  0x2329d50: cbnz     w8, #0x2329d68
  0x2329d54: adrp     x0, #0x5588000
  0x2329d58: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2329d5c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2329d60: mov      w8, #1
  0x2329d64: strb     w8, [x22, #0xd]
  0x2329d68: adrp     x8, #0x5588000
  0x2329d6c: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2329d70: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x2329d74: ldr      w8, [x0, #0xe0]
  0x2329d78: cbnz     w8, #0x2329d80
  0x2329d7c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329d80: cmp      w20, #0
  0x2329d84: cneg     w2, w20, mi
  0x2329d88: mov      x0, x21
  0x2329d8c: mov      x1, x19
  0x2329d90: mov      w3, wzr
  0x2329d94: mov      x4, xzr
  0x2329d98: bl       #0x2312d88 ; -> CBattleManager$$ShowDamage
  0x2329d9c: b        #0x232b3e8
  0x2329da0: ldr      x8, [x19, #0x20]
  0x2329da4: cbz      x8, #0x232b698
  0x2329da8: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x2329dac: cbz      x0, #0x232b698
  0x2329db0: mov      x1, x19
  0x2329db4: mov      x2, xzr
  0x2329db8: bl       #0x2909784 ; -> CCharacterData$$AddStatBuff
  0x2329dbc: b        #0x232b3e8
  0x2329dc0: mov      x0, x8
  0x2329dc4: mov      x1, xzr
  0x2329dc8: bl       #0x2823d68 ; -> CCharacterBattle$$UpdateBuffIcon
  0x2329dcc: b        #0x232b3e8
  0x2329dd0: ldr      x8, [x26]
  0x2329dd4: cbz      x8, #0x232b698
  0x2329dd8: ldr      w8, [x8, #0x54]
  0x2329ddc: ldr      w9, [x19, #0x30]
  0x2329de0: add      x0, sp, #0x6c
  0x2329de4: mov      x1, xzr
  0x2329de8: mul      w8, w9, w8
  0x2329dec: str      w8, [sp, #0x6c]
  0x2329df0: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x2329df4: adrp     x8, #0x558a000
  0x2329df8: ldr      x8, [x8, #0xf30] ; = 0x0 (u64 @ 0x558af30)
  0x2329dfc: mov      x1, x0
  0x2329e00: mov      x2, xzr
  0x2329e04: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329e08: mov      x0, x8
  0x2329e0c: bl       #0x476ca18 ; -> System.String$$Concat
  0x2329e10: adrp     x8, #0x5589000
  0x2329e14: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2329e18: mov      x19, x0
  0x2329e1c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x2329e20: ldr      w9, [x8, #0xe0]
  0x2329e24: cbnz     w9, #0x2329e30
  0x2329e28: mov      x0, x8
  0x2329e2c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329e30: mov      x0, x19
  0x2329e34: mov      x1, xzr
  0x2329e38: bl       #0x2ca7298 ; -> CDebug$$LogWarning
  0x2329e3c: b        #0x232b3e8
  0x2329e40: mov      x0, x8
  0x2329e44: mov      x1, xzr
  0x2329e48: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329e4c: ldr      x8, [x19, #0x20]
  0x2329e50: cbz      x8, #0x232b698
  0x2329e54: mov      w20, w0
  0x2329e58: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5589028)
  0x2329e5c: cbz      x0, #0x232b698
  0x2329e60: mov      x1, xzr
  0x2329e64: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2329e68: ldr      x8, [x19, #0x20]
  0x2329e6c: cbz      x8, #0x232b698
  0x2329e70: mov      w21, w0
  0x2329e74: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5589028)
  0x2329e78: cbz      x0, #0x232b698
  0x2329e7c: mov      x1, x19
  0x2329e80: mov      x2, xzr
  0x2329e84: bl       #0x2909784 ; -> CCharacterData$$AddStatBuff
  0x2329e88: cmp      w21, #1
  0x2329e8c: b.lt     #0x232a33c
  0x2329e90: ldr      x8, [x19, #0x20]
  0x2329e94: cbz      x8, #0x232b698
  0x2329e98: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5589028)
  0x2329e9c: cbz      x0, #0x232b698
  0x2329ea0: mov      x1, xzr
  0x2329ea4: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2329ea8: ldr      x8, [x19, #0x20]
  0x2329eac: cbz      x8, #0x232b698
  0x2329eb0: mov      w22, w0
  0x2329eb4: mov      x0, x8
  0x2329eb8: mov      x1, xzr
  0x2329ebc: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329ec0: smull    x8, w22, w20
  0x2329ec4: mov      w9, w21
  0x2329ec8: sdiv     x8, x8, x9
  0x2329ecc: sub      w1, w8, w0
  0x2329ed0: b        #0x232a340
  0x2329ed4: ldr      x0, [x19, #0x20]
  0x2329ed8: cbz      x0, #0x232b698
  0x2329edc: mov      x1, xzr
  0x2329ee0: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329ee4: ldr      x21, [x19, #0x20]
  0x2329ee8: cbz      x21, #0x232b698
  0x2329eec: mov      w20, w0
  0x2329ef0: mov      x0, x21
  0x2329ef4: mov      x1, xzr
  0x2329ef8: bl       #0x280e43c ; -> CCharacterBattle$$get_HP
  0x2329efc: ldr      x8, [x19, #0x20]
  0x2329f00: cbz      x8, #0x232b698
  0x2329f04: mov      w22, w0
  0x2329f08: mov      x0, x8
  0x2329f0c: mov      x1, xzr
  0x2329f10: bl       #0x280e4a4 ; -> CCharacterBattle$$get_ShieldHP
  0x2329f14: add      w8, w22, w0
  0x2329f18: mov      w9, #1
  0x2329f1c: sub      w1, w9, w8
  0x2329f20: mov      x0, x21
  0x2329f24: mov      w2, wzr
  0x2329f28: mov      w3, wzr
  0x2329f2c: mov      w4, wzr
  0x2329f30: mov      x5, xzr
  0x2329f34: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x2329f38: ldr      x0, [x19, #0x20]
  0x2329f3c: cbz      x0, #0x232b698
  0x2329f40: mov      x1, xzr
  0x2329f44: bl       #0x280e4a4 ; -> CCharacterBattle$$get_ShieldHP
  0x2329f48: add      w8, w20, w0
  0x2329f4c: sub      w20, w8, #1
  0x2329f50: cbnz     w20, #0x2329d44
  0x2329f54: b        #0x232b3e8
  0x2329f58: ldr      x8, [x19, #0x20]
  0x2329f5c: cbz      x8, #0x232b698
  0x2329f60: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x5589088)
  0x2329f64: cbz      x0, #0x232b698
  0x2329f68: mov      w1, #1
  0x2329f6c: mov      x2, xzr
  0x2329f70: mov      w24, #1
  0x2329f74: bl       #0x2570868 ; -> CCharacterRender$$ToggleObject
  0x2329f78: b        #0x232b3ec
  0x2329f7c: adrp     x8, #0x558a000
  0x2329f80: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2329f84: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2329f88: ldr      w8, [x0, #0xe0]
  0x2329f8c: cbnz     w8, #0x2329f94
  0x2329f90: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2329f94: mov      x0, xzr
  0x2329f98: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2329f9c: ldr      x8, [x26]
  0x2329fa0: cbz      x8, #0x232b698
  0x2329fa4: cbz      x0, #0x232b698
  0x2329fa8: ldr      w9, [x19, #0x30]
  0x2329fac: ldr      w8, [x8, #0x54]
  0x2329fb0: mov      x2, xzr
  0x2329fb4: mul      w1, w8, w9
  0x2329fb8: bl       #0x2625914 ; -> CTempletManager$$GetBuffGroupTemplet
  0x2329fbc: cbz      x0, #0x232a464
  0x2329fc0: adrp     x8, #0x5587000
  0x2329fc4: ldr      x8, [x8, #0xaf0] ; = 0x0 (u64 @ 0x5587af0)
  0x2329fc8: mov      x23, x0
  0x2329fcc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2329fd0: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2329fd4: adrp     x8, #0x5587000
  0x2329fd8: ldr      x8, [x8, #0xaf8] ; = 0x0 (u64 @ 0x5587af8)
  0x2329fdc: mov      x20, x0
  0x2329fe0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x2329fe4: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x2329fe8: adrp     x8, #0x5589000
  0x2329fec: ldr      x8, [x8, #0xec0] ; = 0x0 (u64 @ 0x5589ec0)
  0x2329ff0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x2329ff4: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2329ff8: adrp     x8, #0x5589000
  0x2329ffc: ldr      x8, [x8, #0xec8] ; = 0x0 (u64 @ 0x5589ec8)
  0x232a000: mov      x22, x0
  0x232a004: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a008: bl       #0x446cc88 ; -> System.Collections.Generic.List<int>$$.ctor
  0x232a00c: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x5588018)
  0x232a010: cbz      x8, #0x232b698
  0x232a014: adrp     x29, #0x558a000
  0x232a018: adrp     x27, #0x558a000
  0x232a01c: adrp     x25, #0x558a000
  0x232a020: ldr      x29, [x29, #0xeb0] ; = 0x0 (u64 @ 0x558aeb0)
  0x232a024: ldr      x27, [x27, #0x1c8] ; = 0x0 (u64 @ 0x558a1c8)
  0x232a028: ldr      x25, [x25, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232a02c: mov      x28, xzr
  0x232a030: ldr      w9, [x8, #0x18]
  0x232a034: cmp      x28, w9, sxtw
  0x232a038: b.ge     #0x232a3ec
  0x232a03c: cmp      x28, x9
  0x232a040: b.hs     #0x232a8b8
  0x232a044: add      x8, x8, x28, lsl #3
  0x232a048: ldr      x24, [x8, #0x20] ; = 0x0 (u64 @ 0x5589020)
  0x232a04c: ldr      x1, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x232a050: mov      x0, x24
  0x232a054: bl       #0x34142a8 ; -> CExtension$$IsNullOrEmpty<char>
  0x232a058: tbnz     w0, #0, #0x232a1f0
  0x232a05c: mov      x0, xzr
  0x232a060: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x232a064: cbz      x0, #0x232b698
  0x232a068: mov      w2, #1
  0x232a06c: mov      x1, x24
  0x232a070: mov      x3, xzr
  0x232a074: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232a078: cbz      x0, #0x232a1f0
  0x232a07c: ldr      w8, [x0, #0xd8]
  0x232a080: mov      x21, x0
  0x232a084: cbz      w8, #0x232a118
  0x232a088: ldr      x8, [x19, #0x18]
  0x232a08c: cbz      x8, #0x232b698
  0x232a090: ldr      x0, [x8, #0x380] ; = 0x0 (u64 @ 0x5589380)
  0x232a094: cbz      x0, #0x232b698
  0x232a098: adrp     x8, #0x558a000
  0x232a09c: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232a0a0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a0a4: add      x8, sp, #0x18
  0x232a0a8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232a0ac: ldur     q0, [sp, #0x18]
  0x232a0b0: ldr      x8, [sp, #0x28]
  0x232a0b4: str      q0, [sp, #0x50]
  0x232a0b8: str      x8, [sp, #0x60]
  0x232a0bc: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x232a0c0: add      x0, sp, #0x50
  0x232a0c4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232a0c8: tbz      w0, #0, #0x232a104
  0x232a0cc: ldr      x8, [sp, #0x60]
  0x232a0d0: cbz      x8, #0x232a0bc
  0x232a0d4: ldr      x8, [x8, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232a0d8: cbz      x8, #0x232a0bc
  0x232a0dc: ldr      w8, [x8, #0xd8]
  0x232a0e0: ldr      w9, [x21, #0xd8]
  0x232a0e4: cmp      w8, w9
  0x232a0e8: b.ne     #0x232a0bc
  0x232a0ec: adrp     x8, #0x558a000
  0x232a0f0: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232a0f4: add      x0, sp, #0x50
  0x232a0f8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a0fc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232a100: b        #0x232a1f0
  0x232a104: adrp     x8, #0x558a000
  0x232a108: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232a10c: add      x0, sp, #0x50
  0x232a110: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a114: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232a118: cbz      x20, #0x232b698
  0x232a11c: adrp     x9, #0x5587000
  0x232a120: ldr      w10, [x20, #0x1c]
  0x232a124: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x59d4010)
  0x232a128: ldr      x9, [x9, #0xb08] ; = 0x0 (u64 @ 0x5587b08)
  0x232a12c: add      w10, w10, #1
  0x232a130: ldr      x9, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x232a134: str      w10, [x20, #0x1c]
  0x232a138: cbz      x8, #0x232b698
  0x232a13c: ldrsw    x10, [x20, #0x18]
  0x232a140: ldr      w11, [x8, #0x18]
  0x232a144: cmp      w10, w11
  0x232a148: b.hs     #0x232a168
  0x232a14c: add      w9, w10, #1
  0x232a150: add      x0, x8, x10, lsl #3
  0x232a154: str      w9, [x20, #0x18]
  0x232a158: str      x24, [x0, #0x20]!
  0x232a15c: mov      x1, x24
  0x232a160: bl       #0x21af920 ; -> ??? 0x21af920
  0x232a164: b        #0x232a180
  0x232a168: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5587020)
  0x232a16c: mov      x0, x20
  0x232a170: mov      x1, x24
  0x232a174: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558a0c0)
  0x232a178: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558a070)
  0x232a17c: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x232a180: ldr      x8, [x23, #0x20] ; = 0x0 (u64 @ 0x5588020)
  0x232a184: cbz      x8, #0x232b698
  0x232a188: ldr      w9, [x8, #0x18]
  0x232a18c: cmp      x28, x9
  0x232a190: b.hs     #0x232a8b8
  0x232a194: cbz      x22, #0x232b698
  0x232a198: add      x8, x8, x28, lsl #2
  0x232a19c: ldr      w10, [x22, #0x1c]
  0x232a1a0: ldr      w1, [x8, #0x20]
  0x232a1a4: ldr      x8, [x22, #0x10]
  0x232a1a8: ldr      x9, [x27] ; = 0x0 (u64 @ 0x558a000)
  0x232a1ac: add      w10, w10, #1
  0x232a1b0: str      w10, [x22, #0x1c]
  0x232a1b4: cbz      x8, #0x232b698
  0x232a1b8: ldrsw    x10, [x22, #0x18]
  0x232a1bc: ldr      w11, [x8, #0x18]
  0x232a1c0: cmp      w10, w11
  0x232a1c4: b.hs     #0x232a1dc
  0x232a1c8: add      w9, w10, #1
  0x232a1cc: add      x8, x8, x10, lsl #2
  0x232a1d0: str      w9, [x22, #0x18]
  0x232a1d4: str      w1, [x8, #0x20]
  0x232a1d8: b        #0x232a1f0
  0x232a1dc: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5587020)
  0x232a1e0: mov      x0, x22
  0x232a1e4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558a0c0)
  0x232a1e8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558a070)
  0x232a1ec: bl       #0x446d4dc ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x232a1f0: ldr      x8, [x23, #0x18] ; = 0x0 (u64 @ 0x5588018)
  0x232a1f4: add      x28, x28, #1
  0x232a1f8: cbnz     x8, #0x232a030
  0x232a1fc: b        #0x232b698
  0x232a200: cmp      w1, #1
  0x232a204: mov      x21, x0
  0x232a208: b.ne     #0x232a8e8
  0x232a20c: mov      x0, x21
  0x232a210: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232a214: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232a218: str      x8, [sp, #0x10]
  0x232a21c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232a220: adrp     x8, #0x558a000
  0x232a224: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232a228: add      x0, sp, #0x50
  0x232a22c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a230: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232a234: ldr      x8, [sp, #0x10]
  0x232a238: cbz      x8, #0x232a118
  0x232a23c: ldr      x0, [sp, #0x10]
  0x232a240: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232a244: ldr      x8, [x19, #0x20]
  0x232a248: cbz      x8, #0x232b698
  0x232a24c: ldr      x0, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x232a250: cbz      x0, #0x232b698
  0x232a254: mov      w1, #2
  0x232a258: mov      x2, xzr
  0x232a25c: bl       #0x2570868 ; -> CCharacterRender$$ToggleObject
  0x232a260: b        #0x232b3e8
  0x232a264: adrp     x8, #0x558a000
  0x232a268: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x232a26c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a270: ldr      w8, [x0, #0xe0]
  0x232a274: cbnz     w8, #0x232a27c
  0x232a278: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a27c: mov      x0, xzr
  0x232a280: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x232a284: ldr      x8, [x26]
  0x232a288: cbz      x8, #0x232b698
  0x232a28c: cbz      x0, #0x232b698
  0x232a290: ldr      w9, [x19, #0x30]
  0x232a294: ldr      w8, [x8, #0x54]
  0x232a298: mov      x2, xzr
  0x232a29c: mul      w1, w8, w9
  0x232a2a0: bl       #0x2625914 ; -> CTempletManager$$GetBuffGroupTemplet
  0x232a2a4: cbz      x0, #0x232a4b0
  0x232a2a8: ldrb     w8, [x0, #0x28]
  0x232a2ac: mov      x20, x0
  0x232a2b0: cbz      w8, #0x232a564
  0x232a2b4: adrp     x8, #0x558a000
  0x232a2b8: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x59d4018)
  0x232a2bc: ldr      x8, [x8, #0xeb8] ; = 0x0 (u64 @ 0x558aeb8)
  0x232a2c0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a2c4: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x232a2c8: tbz      w0, #0, #0x232a5c4
  0x232a2cc: ldr      x8, [x26]
  0x232a2d0: cbz      x8, #0x232b698
  0x232a2d4: ldr      w8, [x8, #0x54]
  0x232a2d8: ldr      w9, [x19, #0x30]
  0x232a2dc: add      x0, sp, #0x4c
  0x232a2e0: mov      x1, xzr
  0x232a2e4: mul      w8, w9, w8
  0x232a2e8: str      w8, [sp, #0x4c]
  0x232a2ec: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x232a2f0: adrp     x8, #0x558a000
  0x232a2f4: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x558af50)
  0x232a2f8: mov      x1, x0
  0x232a2fc: mov      x2, xzr
  0x232a300: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a304: mov      x0, x8
  0x232a308: bl       #0x476ca18 ; -> System.String$$Concat
  0x232a30c: adrp     x8, #0x5589000
  0x232a310: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232a314: mov      x19, x0
  0x232a318: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a31c: ldr      w9, [x8, #0xe0]
  0x232a320: cbnz     w9, #0x232a32c
  0x232a324: mov      x0, x8
  0x232a328: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a32c: mov      x0, x19
  0x232a330: mov      x1, xzr
  0x232a334: bl       #0x2ca7298 ; -> CDebug$$LogWarning
  0x232a338: b        #0x232a55c
  0x232a33c: mov      w1, wzr
  0x232a340: ldr      x0, [x19, #0x20]
  0x232a344: cbz      x0, #0x232b698
  0x232a348: mov      w4, #1
  0x232a34c: mov      w24, #1
  0x232a350: mov      w2, wzr
  0x232a354: mov      w3, wzr
  0x232a358: mov      x5, xzr
  0x232a35c: bl       #0x280e4b8 ; -> CCharacterBattle$$AddHP
  0x232a360: b        #0x232b3ec
  0x232a364: ldr      x0, [x21] ; = 0x0 (u64 @ 0x59d4000)
  0x232a368: ldr      x20, [x19, #0x18]
  0x232a36c: ldr      w8, [x0, #0xe0]
  0x232a370: cbnz     w8, #0x232a378
  0x232a374: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a378: mov      x0, x20
  0x232a37c: mov      x1, xzr
  0x232a380: mov      x2, xzr
  0x232a384: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x232a388: tbz      w0, #0, #0x232a39c
  0x232a38c: ldr      x8, [x19, #0x18]
  0x232a390: cbz      x8, #0x232b698
  0x232a394: ldr      w8, [x8, #0x21c]
  0x232a398: cbz      w8, #0x23296fc
  0x232a39c: adrp     x8, #0x5587000
  0x232a3a0: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x232a3a4: ldr      x20, [x19, #0x18]
  0x232a3a8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232a3ac: ldr      w8, [x0, #0xe0]
  0x232a3b0: cbnz     w8, #0x232a3b8
  0x232a3b4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a3b8: mov      x0, x20
  0x232a3bc: mov      x1, xzr
  0x232a3c0: mov      x2, xzr
  0x232a3c4: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x232a3c8: tbz      w0, #0, #0x232b3e8
  0x232a3cc: ldr      x0, [x19, #0x18]
  0x232a3d0: cbz      x0, #0x232b698
  0x232a3d4: mov      x1, xzr
  0x232a3d8: bl       #0x280f704 ; -> CCharacterBattle$$get_SkillRecord
  0x232a3dc: cbz      x0, #0x232b698
  0x232a3e0: mov      w24, #1
  0x232a3e4: strb     w24, [x0, #0xb5]
  0x232a3e8: b        #0x232b3ec
  0x232a3ec: mov      x0, x22
  0x232a3f0: mov      x1, xzr
  0x232a3f4: bl       #0x4a1ce5c ; -> System.Linq.Enumerable$$Sum
  0x232a3f8: cbz      w0, #0x232b3e8
  0x232a3fc: sub      w1, w0, #1
  0x232a400: mov      w0, wzr
  0x232a404: mov      x2, xzr
  0x232a408: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x232a40c: cbz      x22, #0x232b698
  0x232a410: ldr      w8, [x22, #0x18]
  0x232a414: cmp      w8, #1
  0x232a418: b.lt     #0x232b3e8
  0x232a41c: adrp     x27, #0x558a000
  0x232a420: ldr      x27, [x27, #0x878] ; = 0x0 (u64 @ 0x558a878)
  0x232a424: mov      w23, w0
  0x232a428: mov      w21, wzr
  0x232a42c: mov      w25, wzr
  0x232a430: mov      w24, #1
  0x232a434: ldr      x2, [x27] ; = 0x0 (u64 @ 0x558a000)
  0x232a438: mov      x0, x22
  0x232a43c: mov      w1, w21
  0x232a440: bl       #0x446d1ec ; -> System.Collections.Generic.List<int>$$get_Item
  0x232a444: add      w25, w0, w25
  0x232a448: cmp      w23, w25
  0x232a44c: b.lt     #0x232a670
  0x232a450: ldr      w8, [x22, #0x18]
  0x232a454: add      w21, w21, #1
  0x232a458: cmp      w21, w8
  0x232a45c: b.lt     #0x232a434
  0x232a460: b        #0x232b3ec
  0x232a464: adrp     x8, #0x5587000
  0x232a468: ldr      x8, [x8, #0xd40] ; = 0x0 (u64 @ 0x5587d40)
  0x232a46c: mov      w1, #1
  0x232a470: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232a474: bl       #0x21afa64 ; -> ??? 0x21afa64
  0x232a478: ldr      x8, [x26]
  0x232a47c: cbz      x8, #0x232b698
  0x232a480: adrp     x10, #0x5587000
  0x232a484: ldr      w8, [x8, #0x54]
  0x232a488: ldr      w9, [x19, #0x30]
  0x232a48c: ldr      x10, [x10, #0xa48] ; = 0x0 (u64 @ 0x5587a48)
  0x232a490: mov      x20, x0
  0x232a494: add      x1, sp, #0x18
  0x232a498: mul      w8, w9, w8
  0x232a49c: ldr      x0, [x10] ; = 0x0 (u64 @ 0x5587000)
  0x232a4a0: str      w8, [sp, #0x18]
  0x232a4a4: bl       #0x21afafc ; -> ??? 0x21afafc
  0x232a4a8: cbnz     x20, #0x232a4f8
  0x232a4ac: b        #0x232b698
  0x232a4b0: adrp     x8, #0x5587000
  0x232a4b4: ldr      x8, [x8, #0xd40] ; = 0x0 (u64 @ 0x5587d40)
  0x232a4b8: mov      w1, #1
  0x232a4bc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232a4c0: bl       #0x21afa64 ; -> ??? 0x21afa64
  0x232a4c4: ldr      x8, [x26]
  0x232a4c8: cbz      x8, #0x232b698
  0x232a4cc: adrp     x10, #0x5587000
  0x232a4d0: ldr      w8, [x8, #0x54]
  0x232a4d4: ldr      w9, [x19, #0x30]
  0x232a4d8: ldr      x10, [x10, #0xa48] ; = 0x0 (u64 @ 0x5587a48)
  0x232a4dc: mov      x20, x0
  0x232a4e0: add      x1, sp, #0x18
  0x232a4e4: mul      w8, w9, w8
  0x232a4e8: ldr      x0, [x10] ; = 0x0 (u64 @ 0x5587000)
  0x232a4ec: str      w8, [sp, #0x18]
  0x232a4f0: bl       #0x21afafc ; -> ??? 0x21afafc
  0x232a4f4: cbz      x20, #0x232b698
  0x232a4f8: mov      x19, x0
  0x232a4fc: cbz      x0, #0x232a514
  0x232a500: ldr      x8, [x20] ; = 0x0 (u64 @ 0x59d4000)
  0x232a504: mov      x0, x19
  0x232a508: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5587040)
  0x232a50c: bl       #0x21afaf8 ; -> ??? 0x21afaf8
  0x232a510: cbz      x0, #0x232a8dc
  0x232a514: ldr      w8, [x20, #0x18]
  0x232a518: cbz      w8, #0x232a8b8
  0x232a51c: mov      x0, x20
  0x232a520: str      x19, [x0, #0x20]!
  0x232a524: mov      x1, x19
  0x232a528: bl       #0x21af920 ; -> ??? 0x21af920
  0x232a52c: adrp     x8, #0x5589000
  0x232a530: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232a534: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a538: ldr      w8, [x0, #0xe0]
  0x232a53c: cbnz     w8, #0x232a544
  0x232a540: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a544: adrp     x8, #0x558a000
  0x232a548: ldr      x8, [x8, #0xf48] ; = 0x0 (u64 @ 0x558af48)
  0x232a54c: mov      x1, x20
  0x232a550: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a554: mov      x2, xzr
  0x232a558: bl       #0x2ca745c ; -> CDebug$$LogErrorFormat
  0x232a55c: mov      w24, wzr
  0x232a560: b        #0x232b3ec
  0x232a564: mov      w1, #0x3e7
  0x232a568: mov      w0, wzr
  0x232a56c: mov      x2, xzr
  0x232a570: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x232a574: ldr      x8, [x20, #0x20] ; = 0x0 (u64 @ 0x59d4020)
  0x232a578: cbz      x8, #0x232b698
  0x232a57c: ldr      w9, [x8, #0x18]
  0x232a580: cmp      w9, #1
  0x232a584: b.lt     #0x232b3e8
  0x232a588: mov      w11, wzr
  0x232a58c: mov      w10, wzr
  0x232a590: mov      w24, #1
  0x232a594: cmp      w11, w9
  0x232a598: b.hs     #0x232a8b8
  0x232a59c: sxtw     x22, w11
  0x232a5a0: add      x11, x8, x22, lsl #2
  0x232a5a4: ldr      w11, [x11, #0x20]
  0x232a5a8: add      w10, w11, w10
  0x232a5ac: cmp      w0, w10
  0x232a5b0: b.lt     #0x232a6d8
  0x232a5b4: add      w11, w22, #1
  0x232a5b8: cmp      w11, w9
  0x232a5bc: b.lt     #0x232a594
  0x232a5c0: b        #0x232b3ec
  0x232a5c4: ldr      x21, [x20, #0x18] ; = 0x0 (u64 @ 0x59d4018)
  0x232a5c8: cbz      x21, #0x232b698
  0x232a5cc: ldr      w8, [x21, #0x18]
  0x232a5d0: cmp      w8, #1
  0x232a5d4: b.lt     #0x232a740
  0x232a5d8: adrp     x24, #0x558a000
  0x232a5dc: ldr      x24, [x24, #0xeb0] ; = 0x0 (u64 @ 0x558aeb0)
  0x232a5e0: mov      x22, xzr
  0x232a5e4: mov      w25, wzr
  0x232a5e8: add      x23, x21, #0x20
  0x232a5ec: cmp      w22, w8
  0x232a5f0: b.hs     #0x232a8b8
  0x232a5f4: ldr      x20, [x23, x22, lsl #3] ; = 0x0 (u64 @ 0x5588003)
  0x232a5f8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x232a5fc: mov      x0, x20
  0x232a600: bl       #0x34142a8 ; -> CExtension$$IsNullOrEmpty<char>
  0x232a604: tbnz     w0, #0, #0x232a658
  0x232a608: mov      x0, xzr
  0x232a60c: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x232a610: ldr      x8, [x26]
  0x232a614: cbz      x8, #0x232b698
  0x232a618: cbz      x0, #0x232b698
  0x232a61c: ldrb     w2, [x8, #0x20]
  0x232a620: mov      x1, x20
  0x232a624: mov      x3, xzr
  0x232a628: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232a62c: cbz      x0, #0x232a658
  0x232a630: mov      x20, x0
  0x232a634: mov      x0, xzr
  0x232a638: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232a63c: cbz      x0, #0x232b698
  0x232a640: ldp      x2, x3, [x19, #0x18]
  0x232a644: mov      x1, x20
  0x232a648: mov      w4, wzr
  0x232a64c: mov      x5, xzr
  0x232a650: bl       #0x2504d48 ; -> CBuffManager$$CreateBuff
  0x232a654: mov      w25, #1
  0x232a658: add      x22, x22, #1
  0x232a65c: str      w22, [sp, #0x4c]
  0x232a660: ldr      w8, [x21, #0x18]
  0x232a664: cmp      w22, w8
  0x232a668: b.lt     #0x232a5ec
  0x232a66c: b        #0x232a744
  0x232a670: mov      x0, xzr
  0x232a674: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x232a678: cbz      x20, #0x232b698
  0x232a67c: adrp     x23, #0x558a000
  0x232a680: ldr      x23, [x23, #0x430] ; = 0x0 (u64 @ 0x558a430)
  0x232a684: mov      x22, x0
  0x232a688: mov      x0, x20
  0x232a68c: mov      w1, w21
  0x232a690: ldr      x2, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232a694: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232a698: ldr      x8, [x26]
  0x232a69c: cbz      x8, #0x232b698
  0x232a6a0: cbz      x22, #0x232b698
  0x232a6a4: ldrb     w2, [x8, #0x20]
  0x232a6a8: mov      x1, x0
  0x232a6ac: mov      x0, x22
  0x232a6b0: mov      x3, xzr
  0x232a6b4: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232a6b8: cbz      x0, #0x232a74c
  0x232a6bc: mov      x22, x0
  0x232a6c0: mov      x0, xzr
  0x232a6c4: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232a6c8: cbz      x0, #0x232b698
  0x232a6cc: ldp      x2, x3, [x19, #0x18]
  0x232a6d0: mov      x1, x22
  0x232a6d4: b        #0x232a730
  0x232a6d8: mov      x0, xzr
  0x232a6dc: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x232a6e0: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x59d4018)
  0x232a6e4: cbz      x8, #0x232b698
  0x232a6e8: ldr      w9, [x8, #0x18]
  0x232a6ec: cmp      w22, w9
  0x232a6f0: b.hs     #0x232a8b8
  0x232a6f4: ldr      x9, [x26]
  0x232a6f8: cbz      x9, #0x232b698
  0x232a6fc: cbz      x0, #0x232b698
  0x232a700: add      x8, x8, x22, lsl #3
  0x232a704: ldr      x1, [x8, #0x20] ; = 0x0 (u64 @ 0x558a020)
  0x232a708: ldrb     w2, [x9, #0x20]
  0x232a70c: mov      x3, xzr
  0x232a710: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x232a714: cbz      x0, #0x232a7b8
  0x232a718: mov      x21, x0
  0x232a71c: mov      x0, xzr
  0x232a720: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232a724: cbz      x0, #0x232b698
  0x232a728: ldp      x2, x3, [x19, #0x18]
  0x232a72c: mov      x1, x21
  0x232a730: mov      w4, wzr
  0x232a734: mov      x5, xzr
  0x232a738: bl       #0x2504d48 ; -> CBuffManager$$CreateBuff
  0x232a73c: b        #0x232b3e8
  0x232a740: mov      w25, wzr
  0x232a744: and      w24, w25, #1
  0x232a748: b        #0x232b3ec
  0x232a74c: adrp     x8, #0x5587000
  0x232a750: ldr      x8, [x8, #0xd40] ; = 0x0 (u64 @ 0x5587d40)
  0x232a754: mov      w1, #2
  0x232a758: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232a75c: bl       #0x21afa64 ; -> ??? 0x21afa64
  0x232a760: ldr      x2, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232a764: mov      x19, x0
  0x232a768: mov      x0, x20
  0x232a76c: mov      w1, w21
  0x232a770: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232a774: cbz      x19, #0x232b698
  0x232a778: mov      x20, x0
  0x232a77c: cbz      x0, #0x232a794
  0x232a780: ldr      x8, [x19]
  0x232a784: mov      x0, x20
  0x232a788: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5587040)
  0x232a78c: bl       #0x21afaf8 ; -> ??? 0x21afaf8
  0x232a790: cbz      x0, #0x232a8dc
  0x232a794: ldr      w8, [x19, #0x18]
  0x232a798: cbz      w8, #0x232a8b8
  0x232a79c: mov      x0, x19
  0x232a7a0: str      x20, [x0, #0x20]!
  0x232a7a4: mov      x1, x20
  0x232a7a8: bl       #0x21af920 ; -> ??? 0x21af920
  0x232a7ac: ldr      x8, [x26]
  0x232a7b0: cbnz     x8, #0x232a828
  0x232a7b4: b        #0x232b698
  0x232a7b8: adrp     x8, #0x5587000
  0x232a7bc: ldr      x8, [x8, #0xd40] ; = 0x0 (u64 @ 0x5587d40)
  0x232a7c0: mov      w1, #2
  0x232a7c4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232a7c8: bl       #0x21afa64 ; -> ??? 0x21afa64
  0x232a7cc: ldr      x8, [x20, #0x18] ; = 0x0 (u64 @ 0x59d4018)
  0x232a7d0: cbz      x8, #0x232b698
  0x232a7d4: ldr      w9, [x8, #0x18]
  0x232a7d8: cmp      w22, w9
  0x232a7dc: b.hs     #0x232a8b8
  0x232a7e0: mov      x19, x0
  0x232a7e4: cbz      x0, #0x232b698
  0x232a7e8: add      x8, x8, x22, lsl #3
  0x232a7ec: ldr      x20, [x8, #0x20] ; = 0x0 (u64 @ 0x5587020)
  0x232a7f0: cbz      x20, #0x232a808
  0x232a7f4: ldr      x8, [x19]
  0x232a7f8: mov      x0, x20
  0x232a7fc: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5587040)
  0x232a800: bl       #0x21afaf8 ; -> ??? 0x21afaf8
  0x232a804: cbz      x0, #0x232a8dc
  0x232a808: ldr      w8, [x19, #0x18]
  0x232a80c: cbz      w8, #0x232a8b8
  0x232a810: mov      x0, x19
  0x232a814: str      x20, [x0, #0x20]!
  0x232a818: mov      x1, x20
  0x232a81c: bl       #0x21af920 ; -> ??? 0x21af920
  0x232a820: ldr      x8, [x26]
  0x232a824: cbz      x8, #0x232b698
  0x232a828: adrp     x9, #0x5587000
  0x232a82c: ldrb     w8, [x8, #0x20]
  0x232a830: ldr      x9, [x9, #0xb20] ; = 0x0 (u64 @ 0x5587b20)
  0x232a834: add      x1, sp, #0x18
  0x232a838: strb     w8, [sp, #0x18]
  0x232a83c: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5587000)
  0x232a840: bl       #0x21afafc ; -> ??? 0x21afafc
  0x232a844: mov      x20, x0
  0x232a848: cbz      x0, #0x232a860
  0x232a84c: ldr      x8, [x19]
  0x232a850: mov      x0, x20
  0x232a854: ldr      x1, [x8, #0x40] ; = 0x0 (u64 @ 0x5587040)
  0x232a858: bl       #0x21afaf8 ; -> ??? 0x21afaf8
  0x232a85c: cbz      x0, #0x232a8dc
  0x232a860: ldr      w8, [x19, #0x18]
  0x232a864: cmp      w8, #1
  0x232a868: b.ls     #0x232a8b8
  0x232a86c: mov      x0, x19
  0x232a870: str      x20, [x0, #0x28]!
  0x232a874: mov      x1, x20
  0x232a878: bl       #0x21af920 ; -> ??? 0x21af920
  0x232a87c: adrp     x8, #0x5589000
  0x232a880: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232a884: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a888: ldr      w8, [x0, #0xe0]
  0x232a88c: cbnz     w8, #0x232a894
  0x232a890: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a894: adrp     x8, #0x558a000
  0x232a898: ldr      x8, [x8, #0xf58] ; = 0x0 (u64 @ 0x558af58)
  0x232a89c: mov      x1, x19
  0x232a8a0: b        #0x232a550
  0x232a8a4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8a8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8ac: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8b8: bl       #0x21afc20 ; -> ??? 0x21afc20
  0x232a8bc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8c0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8c4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8c8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8cc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8d0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8d4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8d8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232a8dc: bl       #0x21afc3c ; -> ??? 0x21afc3c
  0x232a8e0: mov      x1, xzr
  0x232a8e4: bl       #0x21afae4 ; -> ??? 0x21afae4
  0x232a8e8: str      xzr, [sp, #0x10]
  0x232a8ec: b        #0x232a8f4
  0x232a8f0: mov      x21, x0
  0x232a8f4: adrp     x8, #0x558a000
  0x232a8f8: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232a8fc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a900: add      x0, sp, #0x50
  0x232a904: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232a908: ldr      x8, [sp, #0x10]
  0x232a90c: cbz      x8, #0x232b7c4
  0x232a910: ldr      x0, [sp, #0x10]
  0x232a914: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232a918: b        #0x232a960
  0x232a91c: b        #0x232a960
  0x232a920: b        #0x232a960
  0x232a924: b        #0x232a960
  0x232a928: b        #0x232a960
  0x232a92c: b        #0x232a960
  0x232a930: b        #0x232a960
  0x232a934: b        #0x232a960
  0x232a938: b        #0x232a960
  0x232a93c: b        #0x232a960
  0x232a940: b        #0x232a960
  0x232a944: b        #0x232a960
  0x232a948: b        #0x232a960
  0x232a94c: b        #0x232a960
  0x232a950: b        #0x232a960
  0x232a954: b        #0x232a960
  0x232a958: b        #0x232a960
  0x232a95c: b        #0x232a960
  0x232a960: mov      x21, x0
  0x232a964: cmp      w1, #1
  0x232a968: b.ne     #0x232b074
  0x232a96c: mov      x0, x21
  0x232a970: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232a974: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232a978: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232a97c: adrp     x8, #0x558a000
  0x232a980: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232a984: add      x0, sp, #0x50
  0x232a988: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a98c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232a990: cbnz     x20, #0x232b714
  0x232a994: adrp     x8, #0x5589000
  0x232a998: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232a99c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a9a0: ldr      w8, [x0, #0xe0]
  0x232a9a4: cbnz     w8, #0x232a9ac
  0x232a9a8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232a9ac: adrp     x8, #0x558a000
  0x232a9b0: ldr      x8, [x8, #0xf40] ; = 0x0 (u64 @ 0x558af40)
  0x232a9b4: mov      x1, xzr
  0x232a9b8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232a9bc: bl       #0x2ca7164 ; -> CDebug$$Log
  0x232a9c0: ldr      x0, [x19, #0x20]
  0x232a9c4: cbz      x0, #0x232b698
  0x232a9c8: mov      w1, wzr
  0x232a9cc: mov      x2, xzr
  0x232a9d0: bl       #0x28248b4 ; -> CCharacterBattle$$GetBuffList
  0x232a9d4: adrp     x25, #0x558a000
  0x232a9d8: ldr      x25, [x25, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x232a9dc: mov      x20, x0
  0x232a9e0: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x232a9e4: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x232a9e8: tbz      w0, #0, #0x232aa10
  0x232a9ec: adrp     x8, #0x5589000
  0x232a9f0: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232a9f4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232a9f8: ldr      w8, [x0, #0xe0]
  0x232a9fc: cbnz     w8, #0x232aa04
  0x232aa00: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232aa04: adrp     x8, #0x558a000
  0x232aa08: ldr      x8, [x8, #0xf20] ; = 0x0 (u64 @ 0x558af20)
  0x232aa0c: b        #0x232aae8
  0x232aa10: adrp     x23, #0x558a000
  0x232aa14: ldr      x23, [x23, #0xe78] ; = 0x0 (u64 @ 0x558ae78)
  0x232aa18: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232aa1c: ldr      w8, [x0, #0xe0]
  0x232aa20: cbnz     w8, #0x232aa2c
  0x232aa24: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232aa28: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232aa2c: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55880b8)
  0x232aa30: ldr      x21, [x8, #0xd8] ; = 0x0 (u64 @ 0x558a0d8)
  0x232aa34: cbnz     x21, #0x232aa90
  0x232aa38: ldr      w8, [x0, #0xe0]
  0x232aa3c: cbnz     w8, #0x232aa48
  0x232aa40: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232aa44: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232aa48: adrp     x9, #0x558a000
  0x232aa4c: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55880b8)
  0x232aa50: ldr      x9, [x9, #0xee0] ; = 0x0 (u64 @ 0x558aee0)
  0x232aa54: ldr      x22, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aa58: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x232aa5c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x232aa60: adrp     x8, #0x558a000
  0x232aa64: ldr      x8, [x8, #0xf10] ; = 0x0 (u64 @ 0x558af10)
  0x232aa68: mov      x1, x22
  0x232aa6c: mov      x3, xzr
  0x232aa70: mov      x21, x0
  0x232aa74: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aa78: bl       #0x4298dfc ; -> System.Func<object, bool>$$.ctor
  0x232aa7c: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232aa80: mov      x1, x21
  0x232aa84: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x232aa88: str      x21, [x0, #0xd8]!
  0x232aa8c: bl       #0x21af920 ; -> ??? 0x21af920
  0x232aa90: adrp     x8, #0x558a000
  0x232aa94: ldr      x8, [x8, #0xed8] ; = 0x0 (u64 @ 0x558aed8)
  0x232aa98: mov      x0, x20
  0x232aa9c: mov      x1, x21
  0x232aaa0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aaa4: bl       #0x3494a98 ; -> System.Linq.Enumerable$$Where<object>
  0x232aaa8: adrp     x24, #0x558a000
  0x232aaac: ldr      x24, [x24, #0xed0] ; = 0x0 (u64 @ 0x558aed0)
  0x232aab0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x232aab4: bl       #0x3492418 ; -> System.Linq.Enumerable$$ToList<object>
  0x232aab8: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x232aabc: mov      x20, x0
  0x232aac0: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x232aac4: tbz      w0, #0, #0x232aaf8
  0x232aac8: adrp     x8, #0x5589000
  0x232aacc: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232aad0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232aad4: ldr      w8, [x0, #0xe0]
  0x232aad8: cbnz     w8, #0x232aae0
  0x232aadc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232aae0: adrp     x8, #0x558a000
  0x232aae4: ldr      x8, [x8, #0xf60] ; = 0x0 (u64 @ 0x558af60)
  0x232aae8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aaec: mov      x1, xzr
  0x232aaf0: bl       #0x2ca7164 ; -> CDebug$$Log
  0x232aaf4: b        #0x232b3e8
  0x232aaf8: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232aafc: ldr      w8, [x0, #0xe0]
  0x232ab00: cbnz     w8, #0x232ab0c
  0x232ab04: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232ab08: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232ab0c: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55880b8)
  0x232ab10: ldr      x21, [x8, #0xe0] ; = 0x0 (u64 @ 0x558a0e0)
  0x232ab14: cbnz     x21, #0x232ab70
  0x232ab18: ldr      w8, [x0, #0xe0]
  0x232ab1c: cbnz     w8, #0x232ab28
  0x232ab20: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232ab24: ldr      x0, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232ab28: adrp     x9, #0x558a000
  0x232ab2c: ldr      x8, [x0, #0xb8] ; = 0x0 (u64 @ 0x55880b8)
  0x232ab30: ldr      x9, [x9, #0xec0] ; = 0x0 (u64 @ 0x558aec0)
  0x232ab34: ldr      x22, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ab38: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558a000)
  0x232ab3c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x232ab40: adrp     x8, #0x558a000
  0x232ab44: ldr      x8, [x8, #0xf18] ; = 0x0 (u64 @ 0x558af18)
  0x232ab48: mov      x1, x22
  0x232ab4c: mov      x3, xzr
  0x232ab50: mov      x21, x0
  0x232ab54: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ab58: bl       #0x3f7de88 ; -> System.Comparison<object>$$.ctor
  0x232ab5c: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232ab60: mov      x1, x21
  0x232ab64: ldr      x0, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x232ab68: str      x21, [x0, #0xe0]!
  0x232ab6c: bl       #0x21af920 ; -> ??? 0x21af920
  0x232ab70: cbz      x20, #0x232b698
  0x232ab74: adrp     x8, #0x558a000
  0x232ab78: ldr      x8, [x8, #0xee8] ; = 0x0 (u64 @ 0x558aee8)
  0x232ab7c: mov      x0, x20
  0x232ab80: mov      x1, x21
  0x232ab84: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ab88: bl       #0x44bc58c ; -> System.Collections.Generic.List<object>$$Sort
  0x232ab8c: ldr      x8, [x26]
  0x232ab90: cbz      x8, #0x232b698
  0x232ab94: adrp     x10, #0x558a000
  0x232ab98: ldr      w8, [x8, #0x54]
  0x232ab9c: ldr      w9, [x19, #0x30]
  0x232aba0: ldr      x10, [x10, #0xec8] ; = 0x0 (u64 @ 0x558aec8)
  0x232aba4: mov      x0, x20
  0x232aba8: mul      w1, w9, w8
  0x232abac: ldr      x2, [x10] ; = 0x0 (u64 @ 0x558a000)
  0x232abb0: bl       #0x348c9c0 ; -> System.Linq.Enumerable$$Take<object>
  0x232abb4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x232abb8: bl       #0x3492418 ; -> System.Linq.Enumerable$$ToList<object>
  0x232abbc: cbz      x0, #0x232b698
  0x232abc0: adrp     x8, #0x558a000
  0x232abc4: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232abc8: str      x0, [sp, #0x10]
  0x232abcc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232abd0: add      x8, sp, #0x18
  0x232abd4: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232abd8: ldur     q0, [sp, #0x18]
  0x232abdc: ldr      x8, [sp, #0x28]
  0x232abe0: adrp     x28, #0x558a000
  0x232abe4: adrp     x29, #0x558a000
  0x232abe8: adrp     x20, #0x558a000
  0x232abec: adrp     x27, #0x5587000
  0x232abf0: ldr      x28, [x28, #0x7b0] ; = 0x0 (u64 @ 0x558a7b0)
  0x232abf4: ldr      x29, [x29, #0xf00] ; = 0x0 (u64 @ 0x558af00)
  0x232abf8: ldr      x20, [x20, #0x278] ; = 0x0 (u64 @ 0x558a278)
  0x232abfc: ldr      x27, [x27, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x232ac00: str      q0, [sp, #0x50]
  0x232ac04: str      x8, [sp, #0x60]
  0x232ac08: adrp     x21, #0x558a000
  0x232ac0c: ldr      x21, [x21, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232ac10: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x232ac14: add      x0, sp, #0x50
  0x232ac18: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232ac1c: tbz      w0, #0, #0x232afb0
  0x232ac20: ldr      x0, [x19, #0x18]
  0x232ac24: cbz      x0, #0x232b05c
  0x232ac28: ldr      x25, [sp, #0x60]
  0x232ac2c: mov      x1, xzr
  0x232ac30: bl       #0x2811ba8 ; -> CCharacterBattle$$GetTeam
  0x232ac34: cbz      x0, #0x232b060
  0x232ac38: adrp     x8, #0x558a000
  0x232ac3c: ldr      x22, [x0, #0x10] ; = 0x0 (u64 @ 0x5588010)
  0x232ac40: ldr      x8, [x8, #0x9e0] ; = 0x0 (u64 @ 0x558a9e0)
  0x232ac44: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ac48: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x232ac4c: adrp     x8, #0x558a000
  0x232ac50: ldr      x8, [x8, #0xef0] ; = 0x0 (u64 @ 0x558aef0)
  0x232ac54: mov      x21, x0
  0x232ac58: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ac5c: mov      x1, x22
  0x232ac60: bl       #0x44ba3b4 ; -> System.Collections.Generic.List<object>$$.ctor
  0x232ac64: cbz      x21, #0x232b058
  0x232ac68: ldr      w8, [x21, #0x18]
  0x232ac6c: sub      w22, w8, #1
  0x232ac70: cmp      w22, #0
  0x232ac74: b.le     #0x232ace8
  0x232ac78: mov      w0, wzr
  0x232ac7c: mov      w1, w22
  0x232ac80: mov      x2, xzr
  0x232ac84: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x232ac88: mov      w1, w0
  0x232ac8c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x232ac90: str      w22, [sp, #0x6c]
  0x232ac94: str      w1, [sp, #0x4c]
  0x232ac98: mov      x0, x21
  0x232ac9c: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232aca0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x232aca4: mov      x24, x0
  0x232aca8: mov      x0, x21
  0x232acac: mov      w1, w22
  0x232acb0: bl       #0x44ba7f0 ; -> System.Collections.Generic.List<object>$$get_Item
  0x232acb4: ldr      w1, [sp, #0x6c]
  0x232acb8: ldr      x3, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x232acbc: mov      x23, x0
  0x232acc0: mov      x0, x21
  0x232acc4: mov      x2, x24
  0x232acc8: bl       #0x44ba844 ; -> System.Collections.Generic.List<object>$$set_Item
  0x232accc: ldr      w1, [sp, #0x4c]
  0x232acd0: ldr      x3, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x232acd4: sub      w22, w22, #1
  0x232acd8: mov      x0, x21
  0x232acdc: mov      x2, x23
  0x232ace0: bl       #0x44ba844 ; -> System.Collections.Generic.List<object>$$set_Item
  0x232ace4: b        #0x232ac70
  0x232ace8: adrp     x8, #0x558a000
  0x232acec: ldr      x8, [x8, #0x290] ; = 0x0 (u64 @ 0x558a290)
  0x232acf0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232acf4: add      x8, sp, #0x18
  0x232acf8: mov      x0, x21
  0x232acfc: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232ad00: ldur     q0, [sp, #0x18]
  0x232ad04: ldr      x8, [sp, #0x28]
  0x232ad08: str      q0, [sp, #0x30]
  0x232ad0c: str      x8, [sp, #0x40]
  0x232ad10: ldr      x1, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x232ad14: add      x0, sp, #0x30
  0x232ad18: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232ad1c: tbz      w0, #0, #0x232adb4
  0x232ad20: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5587000)
  0x232ad24: ldr      x21, [sp, #0x40]
  0x232ad28: ldr      w8, [x0, #0xe0]
  0x232ad2c: cbnz     w8, #0x232ad34
  0x232ad30: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232ad34: mov      x0, x21
  0x232ad38: mov      x1, xzr
  0x232ad3c: mov      x2, xzr
  0x232ad40: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x232ad44: tbnz     w0, #0, #0x232ad10
  0x232ad48: mov      x0, xzr
  0x232ad4c: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232ad50: cbz      x0, #0x232aefc
  0x232ad54: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x232ad58: cbz      x0, #0x232af04
  0x232ad5c: mov      x1, xzr
  0x232ad60: bl       #0x2509174 ; -> CBuffManager.CBuffPool$$GetBuff
  0x232ad64: cbz      x25, #0x232aeec
  0x232ad68: mov      x22, x0
  0x232ad6c: cbz      x0, #0x232aef4
  0x232ad70: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232ad74: ldr      w5, [x25, #0x2c]
  0x232ad78: ldr      x2, [x19, #0x18]
  0x232ad7c: mov      w4, #1
  0x232ad80: mov      x0, x22
  0x232ad84: mov      x3, x21
  0x232ad88: bl       #0x2320510 ; -> CBuff$$Initialize
  0x232ad8c: tbnz     w0, #0, #0x232adc0
  0x232ad90: mov      x0, xzr
  0x232ad94: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232ad98: cbz      x0, #0x232af0c
  0x232ad9c: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x232ada0: cbz      x0, #0x232af14
  0x232ada4: mov      x1, x22
  0x232ada8: mov      x2, xzr
  0x232adac: bl       #0x2508b38 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x232adb0: b        #0x232ad10
  0x232adb4: mov      x23, xzr
  0x232adb8: mov      w24, wzr
  0x232adbc: b        #0x232ae64
  0x232adc0: mov      x0, x22
  0x232adc4: bl       #0x23281dc ; -> CBuff$$Run
  0x232adc8: ldr      w8, [x25, #0x2c]
  0x232adcc: str      w8, [x22, #0x2c]
  0x232add0: cbz      x21, #0x232af1c
  0x232add4: mov      x0, x21
  0x232add8: mov      x1, x22
  0x232addc: mov      x2, xzr
  0x232ade0: bl       #0x2823dc0 ; -> CCharacterBattle$$AddBuff
  0x232ade4: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232ade8: cbz      x8, #0x232af24
  0x232adec: ldr      x22, [x8, #0x18] ; = 0x0 (u64 @ 0x558a018)
  0x232adf0: mov      x0, x21
  0x232adf4: mov      x1, xzr
  0x232adf8: bl       #0x270d25c ; -> CCharacter$$get_ID
  0x232adfc: str      w0, [sp, #0x4c]
  0x232ae00: add      x0, sp, #0x4c
  0x232ae04: mov      x1, xzr
  0x232ae08: bl       #0x4901d80 ; -> System.Int32$$ToString
  0x232ae0c: adrp     x8, #0x558a000
  0x232ae10: ldr      x8, [x8, #0xf38] ; = 0x0 (u64 @ 0x558af38)
  0x232ae14: mov      x3, x0
  0x232ae18: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ae1c: adrp     x8, #0x558a000
  0x232ae20: ldr      x8, [x8, #0xf28] ; = 0x0 (u64 @ 0x558af28)
  0x232ae24: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ae28: mov      x1, x22
  0x232ae2c: mov      x4, xzr
  0x232ae30: bl       #0x4779b28 ; -> System.String$$Concat
  0x232ae34: adrp     x8, #0x5589000
  0x232ae38: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232ae3c: mov      x21, x0
  0x232ae40: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232ae44: ldr      w8, [x0, #0xe0]
  0x232ae48: cbnz     w8, #0x232ae50
  0x232ae4c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232ae50: mov      x0, x21
  0x232ae54: mov      x1, xzr
  0x232ae58: bl       #0x2ca7164 ; -> CDebug$$Log
  0x232ae5c: mov      x23, xzr
  0x232ae60: mov      w24, #1
  0x232ae64: mov      w21, #0x65
  0x232ae68: adrp     x8, #0x558a000
  0x232ae6c: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x232ae70: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232ae74: add      x0, sp, #0x30
  0x232ae78: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232ae7c: cbnz     x23, #0x232b064
  0x232ae80: cmp      w21, #0x65
  0x232ae84: b.eq     #0x232ae8c
  0x232ae88: cbnz     w21, #0x232b018
  0x232ae8c: tbnz     w24, #0, #0x232ac08
  0x232ae90: cbz      x25, #0x232b070
  0x232ae94: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232ae98: cbz      x8, #0x232b06c
  0x232ae9c: ldr      x1, [x8, #0x18] ; = 0x0 (u64 @ 0x558a018)
  0x232aea0: adrp     x8, #0x558a000
  0x232aea4: ldr      x8, [x8, #0xf38] ; = 0x0 (u64 @ 0x558af38)
  0x232aea8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aeac: adrp     x8, #0x558a000
  0x232aeb0: ldr      x8, [x8, #0xf68] ; = 0x0 (u64 @ 0x558af68)
  0x232aeb4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232aeb8: mov      x3, xzr
  0x232aebc: bl       #0x4779808 ; -> System.String$$Concat
  0x232aec0: adrp     x8, #0x5589000
  0x232aec4: ldr      x8, [x8, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x232aec8: mov      x21, x0
  0x232aecc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5589000)
  0x232aed0: ldr      w8, [x0, #0xe0]
  0x232aed4: cbnz     w8, #0x232aedc
  0x232aed8: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232aedc: mov      x0, x21
  0x232aee0: mov      x1, xzr
  0x232aee4: bl       #0x2ca7164 ; -> CDebug$$Log
  0x232aee8: b        #0x232ac08
  0x232aeec: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232aef0: b        #0x232b074
  0x232aef4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232aef8: b        #0x232b074
  0x232aefc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af00: b        #0x232b074
  0x232af04: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af08: b        #0x232b074
  0x232af0c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af10: b        #0x232b074
  0x232af14: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af18: b        #0x232b074
  0x232af1c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af20: b        #0x232b074
  0x232af24: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232af28: b        #0x232b074
  0x232af2c: b        #0x232af40
  0x232af30: b        #0x232af40
  0x232af34: b        #0x232af40
  0x232af38: b        #0x232af84
  0x232af3c: b        #0x232af84
  0x232af40: mov      x22, x1
  0x232af44: mov      x21, x0
  0x232af48: mov      w24, #1
  0x232af4c: b        #0x232af90
  0x232af50: b        #0x232af84
  0x232af54: b        #0x232af84
  0x232af58: b        #0x232af84
  0x232af5c: b        #0x232af84
  0x232af60: b        #0x232af84
  0x232af64: b        #0x232af84
  0x232af68: b        #0x232af84
  0x232af6c: b        #0x232af84
  0x232af70: b        #0x232af84
  0x232af74: b        #0x232af84
  0x232af78: b        #0x232af84
  0x232af7c: b        #0x232af84
  0x232af80: b        #0x232af84
  0x232af84: mov      x22, x1
  0x232af88: mov      x21, x0
  0x232af8c: mov      w24, wzr
  0x232af90: cmp      w22, #1
  0x232af94: b.ne     #0x232b030
  0x232af98: mov      x0, x21
  0x232af9c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232afa0: ldr      x23, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232afa4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232afa8: mov      w21, wzr
  0x232afac: b        #0x232ae68
  0x232afb0: adrp     x8, #0x558a000
  0x232afb4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232afb8: add      x0, sp, #0x50
  0x232afbc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232afc0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232afc4: adrp     x8, #0x558a000
  0x232afc8: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232afcc: ldr      x0, [sp, #0x10]
  0x232afd0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232afd4: add      x8, sp, #0x18
  0x232afd8: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232afdc: ldur     q0, [sp, #0x18]
  0x232afe0: ldr      x8, [sp, #0x28]
  0x232afe4: str      q0, [sp, #0x50]
  0x232afe8: str      x8, [sp, #0x60]
  0x232afec: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x232aff0: add      x0, sp, #0x50
  0x232aff4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232aff8: tbz      w0, #0, #0x2328dc4
  0x232affc: ldr      x0, [x19, #0x20]
  0x232b000: cbz      x0, #0x232b054
  0x232b004: ldr      x1, [sp, #0x60]
  0x232b008: mov      w2, #1
  0x232b00c: mov      x3, xzr
  0x232b010: bl       #0x2824374 ; -> CCharacterBattle$$RemoveBuff
  0x232b014: b        #0x232afec
  0x232b018: adrp     x8, #0x558a000
  0x232b01c: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b020: add      x0, sp, #0x50
  0x232b024: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b028: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b02c: b        #0x232b3ec
  0x232b030: mov      x23, xzr
  0x232b034: adrp     x8, #0x558a000
  0x232b038: ldr      x8, [x8, #0x260] ; = 0x0 (u64 @ 0x558a260)
  0x232b03c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b040: add      x0, sp, #0x30
  0x232b044: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b048: cbz      x23, #0x232b760
  0x232b04c: mov      x0, x23
  0x232b050: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b054: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b058: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b05c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b060: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b064: mov      x0, x23
  0x232b068: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b06c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b070: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b074: mov      x20, xzr
  0x232b078: b        #0x232b080
  0x232b07c: mov      x21, x0
  0x232b080: adrp     x8, #0x558a000
  0x232b084: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b088: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b08c: add      x0, sp, #0x50
  0x232b090: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b094: cbz      x20, #0x232b7c4
  0x232b098: mov      x0, x20
  0x232b09c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b0a0: mov      x22, x1
  0x232b0a4: mov      x21, x0
  0x232b0a8: b        #0x232b034
  0x232b0ac: b        #0x232b758
  0x232b0b0: b        #0x232b758
  0x232b0b4: b        #0x232b758
  0x232b0b8: b        #0x232b758
  0x232b0bc: b        #0x232b758
  0x232b0c0: b        #0x232b758
  0x232b0c4: b        #0x232b758
  0x232b0c8: b        #0x232b758
  0x232b0cc: b        #0x232b758
  0x232b0d0: b        #0x232b0dc
  0x232b0d4: b        #0x232b0dc
  0x232b0d8: b        #0x232b758
  0x232b0dc: mov      x21, x0
  0x232b0e0: cmp      w1, #1
  0x232b0e4: b.ne     #0x232b2d4
  0x232b0e8: mov      x0, x21
  0x232b0ec: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232b0f0: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232b0f4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232b0f8: adrp     x8, #0x558a000
  0x232b0fc: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b100: add      x0, sp, #0x50
  0x232b104: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b108: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b10c: cbnz     x20, #0x232b714
  0x232b110: ldr      x0, [x19, #0x20]
  0x232b114: cbz      x0, #0x232b698
  0x232b118: mov      w1, wzr
  0x232b11c: mov      x2, xzr
  0x232b120: bl       #0x28248b4 ; -> CCharacterBattle$$GetBuffList
  0x232b124: adrp     x8, #0x558a000
  0x232b128: ldr      x8, [x8, #0xf08] ; = 0x0 (u64 @ 0x558af08)
  0x232b12c: mov      x21, x0
  0x232b130: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b134: mov      x0, x8
  0x232b138: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x232b13c: adrp     x8, #0x558a000
  0x232b140: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x558aef8)
  0x232b144: mov      x1, x21
  0x232b148: mov      x20, x0
  0x232b14c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b150: bl       #0x44ba3b4 ; -> System.Collections.Generic.List<object>$$.ctor
  0x232b154: cbz      x20, #0x232b3e8
  0x232b158: ldr      w8, [x20, #0x18]
  0x232b15c: cmp      w8, #1
  0x232b160: b.lt     #0x232b3e8
  0x232b164: adrp     x8, #0x558a000
  0x232b168: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232b16c: mov      x0, x20
  0x232b170: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b174: add      x8, sp, #0x18
  0x232b178: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232b17c: ldur     q0, [sp, #0x18]
  0x232b180: ldr      x8, [sp, #0x28]
  0x232b184: adrp     x23, #0x558a000
  0x232b188: ldr      x23, [x23, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232b18c: str      q0, [sp, #0x50]
  0x232b190: str      x8, [sp, #0x60]
  0x232b194: adrp     x24, #0x558a000
  0x232b198: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x232b19c: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232b1a0: add      x0, sp, #0x50
  0x232b1a4: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232b1a8: tbz      w0, #0, #0x2328dc4
  0x232b1ac: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x232b1b0: ldr      x20, [sp, #0x60]
  0x232b1b4: ldr      w8, [x0, #0xe0]
  0x232b1b8: cbnz     w8, #0x232b1c0
  0x232b1bc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232b1c0: mov      x0, xzr
  0x232b1c4: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x232b1c8: cbz      x20, #0x232b2b0
  0x232b1cc: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b1d0: cbz      x8, #0x232b2b4
  0x232b1d4: cbz      x0, #0x232b2b8
  0x232b1d8: ldr      w1, [x8, #0xd8]
  0x232b1dc: mov      x2, xzr
  0x232b1e0: bl       #0x2625970 ; -> CTempletManager$$GetBuffToolTipTemplet
  0x232b1e4: mov      x22, x0
  0x232b1e8: cbz      x0, #0x232b19c
  0x232b1ec: ldr      w8, [x22, #0x34]
  0x232b1f0: cmp      w8, #1
  0x232b1f4: b.lt     #0x232b19c
  0x232b1f8: mov      x0, xzr
  0x232b1fc: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232b200: cbz      x0, #0x232b2bc
  0x232b204: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x232b208: cbz      x0, #0x232b2cc
  0x232b20c: mov      x1, xzr
  0x232b210: bl       #0x2509174 ; -> CBuffManager.CBuffPool$$GetBuff
  0x232b214: mov      x21, x0
  0x232b218: ldr      x0, [x20, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b21c: cbz      x0, #0x232b2c4
  0x232b220: ldr      w1, [x22, #0x34]
  0x232b224: mov      x2, xzr
  0x232b228: bl       #0x25ed900 ; -> CBuffTemplet$$CopyForChangeDebuff
  0x232b22c: mov      x1, x0
  0x232b230: cbz      x21, #0x232b2c0
  0x232b234: mov      x0, x21
  0x232b238: str      x1, [x0, #0x10]!
  0x232b23c: bl       #0x21af920 ; -> ??? 0x21af920
  0x232b240: ldr      x1, [x21, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b244: ldr      x2, [x19, #0x18]
  0x232b248: ldr      x3, [x20, #0x20] ; = 0x0 (u64 @ 0x558a020)
  0x232b24c: mov      w4, #1
  0x232b250: mov      w5, #-1
  0x232b254: mov      x0, x21
  0x232b258: bl       #0x2320510 ; -> CBuff$$Initialize
  0x232b25c: tbz      w0, #0, #0x232b294
  0x232b260: ldr      x1, [x19, #0x18]
  0x232b264: mov      x0, x21
  0x232b268: str      x1, [x0, #0x18]!
  0x232b26c: bl       #0x21af920 ; -> ??? 0x21af920
  0x232b270: mov      x0, x21
  0x232b274: bl       #0x23281dc ; -> CBuff$$Run
  0x232b278: ldr      w8, [x20, #0x2c]
  0x232b27c: str      w8, [x21, #0x2c]
  0x232b280: ldr      x0, [x19, #0x20]
  0x232b284: cbz      x0, #0x232b2d0
  0x232b288: mov      x1, x21
  0x232b28c: mov      x2, xzr
  0x232b290: bl       #0x2823dc0 ; -> CCharacterBattle$$AddBuff
  0x232b294: ldr      x0, [x19, #0x20]
  0x232b298: cbz      x0, #0x232b2c8
  0x232b29c: mov      w2, #1
  0x232b2a0: mov      x1, x20
  0x232b2a4: mov      x3, xzr
  0x232b2a8: bl       #0x2824374 ; -> CCharacterBattle$$RemoveBuff
  0x232b2ac: b        #0x232b19c
  0x232b2b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2b8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2bc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2c0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2c4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2c8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2cc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2d0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b2d4: mov      x20, xzr
  0x232b2d8: b        #0x232b2e0
  0x232b2dc: mov      x21, x0
  0x232b2e0: adrp     x8, #0x558a000
  0x232b2e4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b2e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b2ec: add      x0, sp, #0x50
  0x232b2f0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b2f4: cbz      x20, #0x232b7c4
  0x232b2f8: mov      x0, x20
  0x232b2fc: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b300: b        #0x232b358
  0x232b304: b        #0x232b358
  0x232b308: b        #0x232b358
  0x232b30c: b        #0x232b358
  0x232b310: b        #0x232b358
  0x232b314: b        #0x232b358
  0x232b318: b        #0x232b358
  0x232b31c: b        #0x232b358
  0x232b320: b        #0x232b358
  0x232b324: b        #0x232b358
  0x232b328: b        #0x232b358
  0x232b32c: b        #0x232b358
  0x232b330: b        #0x232b358
  0x232b334: b        #0x232b358
  0x232b338: b        #0x232b758
  0x232b33c: b        #0x232b358
  0x232b340: b        #0x232b758
  0x232b344: b        #0x232b358
  0x232b348: b        #0x232b358
  0x232b34c: b        #0x232b358
  0x232b350: b        #0x232b358
  0x232b354: b        #0x232b358
  0x232b358: mov      x21, x0
  0x232b35c: cmp      w1, #1
  0x232b360: b.ne     #0x232b5cc
  0x232b364: mov      x0, x21
  0x232b368: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232b36c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232b370: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232b374: adrp     x8, #0x558a000
  0x232b378: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b37c: add      x0, sp, #0x50
  0x232b380: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b384: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b388: cbnz     x20, #0x232b714
  0x232b38c: adrp     x8, #0x5587000
  0x232b390: ldr      x8, [x8, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x232b394: ldr      x20, [x19, #0x18]
  0x232b398: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x232b39c: ldr      w8, [x0, #0xe0]
  0x232b3a0: cbnz     w8, #0x232b3a8
  0x232b3a4: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232b3a8: mov      x0, x20
  0x232b3ac: mov      x1, xzr
  0x232b3b0: mov      x2, xzr
  0x232b3b4: bl       #0x5037d24 ; -> UnityEngine.Object$$op_Equality
  0x232b3b8: tbnz     w0, #0, #0x232b3e8
  0x232b3bc: ldr      x0, [x19, #0x18]
  0x232b3c0: cbz      x0, #0x232b698
  0x232b3c4: mov      w1, wzr
  0x232b3c8: mov      x2, xzr
  0x232b3cc: bl       #0x28248b4 ; -> CCharacterBattle$$GetBuffList
  0x232b3d0: adrp     x8, #0x558a000
  0x232b3d4: ldr      x8, [x8, #0x250] ; = 0x0 (u64 @ 0x558a250)
  0x232b3d8: mov      x20, x0
  0x232b3dc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b3e0: bl       #0x34143f8 ; -> CExtension$$IsNullOrEmpty<object>
  0x232b3e4: tbz      w0, #0, #0x232b410
  0x232b3e8: mov      w24, #1
  0x232b3ec: and      w0, w24, #1
  0x232b3f0: ldp      x20, x19, [sp, #0xc0]
  0x232b3f4: ldp      x22, x21, [sp, #0xb0]
  0x232b3f8: ldp      x24, x23, [sp, #0xa0]
  0x232b3fc: ldp      x26, x25, [sp, #0x90]
  0x232b400: ldp      x28, x27, [sp, #0x80]
  0x232b404: ldp      x29, x30, [sp, #0x70]
  0x232b408: add      sp, sp, #0xd0
  0x232b40c: ret      
  0x232b410: cbz      x20, #0x232b698
  0x232b414: adrp     x8, #0x558a000
  0x232b418: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x232b41c: mov      x0, x20
  0x232b420: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b424: add      x8, sp, #0x18
  0x232b428: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x232b42c: ldur     q0, [sp, #0x18]
  0x232b430: ldr      x8, [sp, #0x28]
  0x232b434: adrp     x21, #0x558a000
  0x232b438: adrp     x22, #0x558a000
  0x232b43c: adrp     x23, #0x558a000
  0x232b440: ldr      x21, [x21, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232b444: ldr      x22, [x22, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x232b448: ldr      x23, [x23, #0x258] ; = 0x0 (u64 @ 0x558a258)
  0x232b44c: str      q0, [sp, #0x50]
  0x232b450: str      x8, [sp, #0x60]
  0x232b454: adrp     x24, #0x558a000
  0x232b458: ldr      x24, [x24, #0xb0] ; = 0x0 (u64 @ 0x558a0b0)
  0x232b45c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x232b460: add      x0, sp, #0x50
  0x232b464: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x232b468: tbz      w0, #0, #0x2328dc4
  0x232b46c: ldr      x25, [sp, #0x60]
  0x232b470: cbz      x25, #0x232b45c
  0x232b474: ldr      w8, [x25, #0x2c]
  0x232b478: cmp      w8, #1
  0x232b47c: b.lt     #0x232b45c
  0x232b480: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b484: cbz      x8, #0x232b598
  0x232b488: ldr      w8, [x8, #0xd8]
  0x232b48c: cmp      w8, #1
  0x232b490: b.lt     #0x232b45c
  0x232b494: ldr      x0, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x232b498: ldr      w8, [x0, #0xe0]
  0x232b49c: cbnz     w8, #0x232b4a4
  0x232b4a0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x232b4a4: mov      x0, xzr
  0x232b4a8: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x232b4ac: ldr      x8, [x26]
  0x232b4b0: cbz      x8, #0x232b5a0
  0x232b4b4: cbz      x0, #0x232b59c
  0x232b4b8: ldr      w1, [x8, #0x54]
  0x232b4bc: mov      x2, xzr
  0x232b4c0: bl       #0x26258b0 ; -> CTempletManager$$GetToolTipMemberTemplet
  0x232b4c4: mov      x20, x0
  0x232b4c8: cbz      x0, #0x232b45c
  0x232b4cc: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x558a018)
  0x232b4d0: ldr      x1, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x232b4d4: bl       #0x34142fc ; -> CExtension$$IsNullOrEmpty<int>
  0x232b4d8: tbnz     w0, #0, #0x232b45c
  0x232b4dc: ldr      x8, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b4e0: cbz      x8, #0x232b5a4
  0x232b4e4: ldr      x0, [x20, #0x18] ; = 0x0 (u64 @ 0x558a018)
  0x232b4e8: cbz      x0, #0x232b5a8
  0x232b4ec: ldr      w1, [x8, #0xd8]
  0x232b4f0: ldr      x2, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x232b4f4: bl       #0x446d854 ; -> System.Collections.Generic.List<int>$$Contains
  0x232b4f8: tbz      w0, #0, #0x232b45c
  0x232b4fc: mov      x0, xzr
  0x232b500: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232b504: cbz      x0, #0x232b5b4
  0x232b508: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x232b50c: cbz      x0, #0x232b5b0
  0x232b510: mov      x1, xzr
  0x232b514: bl       #0x2509174 ; -> CBuffManager.CBuffPool$$GetBuff
  0x232b518: ldr      x8, [x19, #0x10]
  0x232b51c: cbz      x8, #0x232b5ac
  0x232b520: mov      x20, x0
  0x232b524: cbz      x0, #0x232b5b8
  0x232b528: ldr      x1, [x25, #0x10] ; = 0x0 (u64 @ 0x558a010)
  0x232b52c: ldp      x2, x3, [x19, #0x18]
  0x232b530: ldr      w5, [x8, #0x88]
  0x232b534: mov      x0, x20
  0x232b538: mov      w4, wzr
  0x232b53c: bl       #0x2320510 ; -> CBuff$$Initialize
  0x232b540: tbz      w0, #0, #0x232b574
  0x232b544: mov      x0, x20
  0x232b548: bl       #0x23281dc ; -> CBuff$$Run
  0x232b54c: ldr      x8, [x26]
  0x232b550: cbz      x8, #0x232b5c8
  0x232b554: ldr      w8, [x8, #0x88]
  0x232b558: str      w8, [x20, #0x2c]
  0x232b55c: ldr      x0, [x19, #0x20]
  0x232b560: cbz      x0, #0x232b5c0
  0x232b564: mov      x1, x20
  0x232b568: mov      x2, xzr
  0x232b56c: bl       #0x2823dc0 ; -> CCharacterBattle$$AddBuff
  0x232b570: b        #0x232b45c
  0x232b574: mov      x0, xzr
  0x232b578: bl       #0x2503e44 ; -> CBuffManager$$get_Instance
  0x232b57c: cbz      x0, #0x232b5bc
  0x232b580: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5588028)
  0x232b584: cbz      x0, #0x232b5c4
  0x232b588: mov      x1, x20
  0x232b58c: mov      x2, xzr
  0x232b590: bl       #0x2508b38 ; -> CBuffManager.CBuffPool$$ReturnBuff
  0x232b594: b        #0x232b45c
  0x232b598: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b59c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5a0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5a4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5a8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5ac: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5b0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5b4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5b8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5bc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5c0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5c4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5c8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b5cc: mov      x20, xzr
  0x232b5d0: b        #0x232b5d8
  0x232b5d4: mov      x21, x0
  0x232b5d8: adrp     x8, #0x558a000
  0x232b5dc: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b5e0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b5e4: add      x0, sp, #0x50
  0x232b5e8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b5ec: cbz      x20, #0x232b7c4
  0x232b5f0: mov      x0, x20
  0x232b5f4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b5f8: b        #0x232b65c
  0x232b5fc: b        #0x232b65c
  0x232b600: b        #0x232b65c
  0x232b604: b        #0x232b65c
  0x232b608: b        #0x232b65c
  0x232b60c: b        #0x232b65c
  0x232b610: b        #0x232b65c
  0x232b614: b        #0x232b65c
  0x232b618: b        #0x232b65c
  0x232b61c: b        #0x232b65c
  0x232b620: b        #0x232b65c
  0x232b624: b        #0x232b65c
  0x232b628: b        #0x232b65c
  0x232b62c: b        #0x232b65c
  0x232b630: b        #0x232b65c
  0x232b634: b        #0x232b65c
  0x232b638: b        #0x232b65c
  0x232b63c: b        #0x232b65c
  0x232b640: b        #0x232b65c
  0x232b644: b        #0x232b65c
  0x232b648: b        #0x232b65c
  0x232b64c: b        #0x232b65c
  0x232b650: b        #0x232b65c
  0x232b654: b        #0x232b65c
  0x232b658: b        #0x232b65c
  0x232b65c: mov      x21, x0
  0x232b660: cmp      w1, #1
  0x232b664: b.ne     #0x232b69c
  0x232b668: mov      x0, x21
  0x232b66c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232b670: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232b674: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232b678: adrp     x8, #0x558a000
  0x232b67c: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b680: add      x0, sp, #0x50
  0x232b684: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b688: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b68c: cbnz     x20, #0x232b714
  0x232b690: ldr      x8, [x26]
  0x232b694: cbnz     x8, #0x23288d8
  0x232b698: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x232b69c: mov      x20, xzr
  0x232b6a0: b        #0x232b6a8
  0x232b6a4: mov      x21, x0
  0x232b6a8: adrp     x8, #0x558a000
  0x232b6ac: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b6b0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b6b4: add      x0, sp, #0x50
  0x232b6b8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b6bc: cbz      x20, #0x232b7c4
  0x232b6c0: mov      x0, x20
  0x232b6c4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b6c8: b        #0x232b6e0
  0x232b6cc: b        #0x232b6e0
  0x232b6d0: b        #0x232b6e0
  0x232b6d4: b        #0x232b6e0
  0x232b6d8: b        #0x232b6e0
  0x232b6dc: b        #0x232b6e0
  0x232b6e0: mov      x21, x0
  0x232b6e4: cmp      w1, #1
  0x232b6e8: b.ne     #0x232b71c
  0x232b6ec: mov      x0, x21
  0x232b6f0: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232b6f4: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232b6f8: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232b6fc: adrp     x8, #0x558a000
  0x232b700: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b704: add      x0, sp, #0x50
  0x232b708: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b70c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b710: cbz      x20, #0x2329738
  0x232b714: mov      x0, x20
  0x232b718: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b71c: mov      x20, xzr
  0x232b720: b        #0x232b728
  0x232b724: mov      x21, x0
  0x232b728: adrp     x8, #0x558a000
  0x232b72c: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b730: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b734: add      x0, sp, #0x50
  0x232b738: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b73c: cbz      x20, #0x232b7c4
  0x232b740: mov      x0, x20
  0x232b744: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b748: b        #0x232b758
  0x232b74c: b        #0x232b758
  0x232b750: b        #0x232b758
  0x232b754: b        #0x232b758
  0x232b758: mov      x22, x1
  0x232b75c: mov      x21, x0
  0x232b760: cmp      w22, #1
  0x232b764: b.ne     #0x232b7a0
  0x232b768: mov      x0, x21
  0x232b76c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x232b770: ldr      x22, [x0] ; = 0x0 (u64 @ 0x5588000)
  0x232b774: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x232b778: adrp     x8, #0x558a000
  0x232b77c: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b780: add      x0, sp, #0x50
  0x232b784: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b788: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b78c: adrp     x21, #0x558a000
  0x232b790: ldr      x21, [x21, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x232b794: cbz      x22, #0x232afc4
  0x232b798: mov      x0, x22
  0x232b79c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b7a0: mov      x22, xzr
  0x232b7a4: b        #0x232b7ac
  0x232b7a8: mov      x21, x0
  0x232b7ac: adrp     x8, #0x558a000
  0x232b7b0: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x232b7b4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x232b7b8: add      x0, sp, #0x50
  0x232b7bc: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x232b7c0: cbnz     x22, #0x232b7cc
  0x232b7c4: mov      x0, x21
  0x232b7c8: bl       #0x22b072c ; -> ??? 0x22b072c
  0x232b7cc: mov      x0, x22
  0x232b7d0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x232b7d4: bl       #0x1f86e18 ; -> ??? 0x1f86e18
