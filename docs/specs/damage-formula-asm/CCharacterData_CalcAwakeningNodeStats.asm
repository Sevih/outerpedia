; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcAwakeningNodeStats @ 0x2905578..0x2905d1c (taille 1956 octets) =====
  0x2905578: sub      sp, sp, #0x110
  0x290557c: stp      x29, x30, [sp, #0xb0]
  0x2905580: stp      x28, x27, [sp, #0xc0]
  0x2905584: stp      x26, x25, [sp, #0xd0]
  0x2905588: stp      x24, x23, [sp, #0xe0]
  0x290558c: stp      x22, x21, [sp, #0xf0]
  0x2905590: stp      x20, x19, [sp, #0x100]
  0x2905594: adrp     x20, #0x59d8000
  0x2905598: ldrb     w8, [x20, #0x289]
  0x290559c: mov      x19, x0
  0x29055a0: tbnz     w8, #0, #0x29056f0
  0x29055a4: adrp     x0, #0x55b6000
  0x29055a8: ldr      x0, [x0, #0x820] ; = 0x0 (u64 @ 0x55b6820)
  0x29055ac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055b0: adrp     x0, #0x55b6000
  0x29055b4: ldr      x0, [x0, #0x828] ; = 0x0 (u64 @ 0x55b6828)
  0x29055b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055bc: adrp     x0, #0x55b6000
  0x29055c0: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x55b6830)
  0x29055c4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055c8: adrp     x0, #0x55b6000
  0x29055cc: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x55b6838)
  0x29055d0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055d4: adrp     x0, #0x55b6000
  0x29055d8: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x55b6840)
  0x29055dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055e0: adrp     x0, #0x55b6000
  0x29055e4: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x55b6848)
  0x29055e8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055ec: adrp     x0, #0x55b6000
  0x29055f0: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x55b6850)
  0x29055f4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29055f8: adrp     x0, #0x55b6000
  0x29055fc: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x55b6858)
  0x2905600: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905604: adrp     x0, #0x55ad000
  0x2905608: ldr      x0, [x0, #0x7c8] ; = 0x0 (u64 @ 0x55ad7c8)
  0x290560c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905610: adrp     x0, #0x558a000
  0x2905614: ldr      x0, [x0, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x2905618: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290561c: adrp     x0, #0x55b6000
  0x2905620: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x55b6860)
  0x2905624: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905628: adrp     x0, #0x55ad000
  0x290562c: ldr      x0, [x0, #0x7d0] ; = 0x0 (u64 @ 0x55ad7d0)
  0x2905630: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905634: adrp     x0, #0x558a000
  0x2905638: ldr      x0, [x0, #0xe90] ; = 0x0 (u64 @ 0x558ae90)
  0x290563c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905640: adrp     x0, #0x558a000
  0x2905644: ldr      x0, [x0, #0xe98] ; = 0x0 (u64 @ 0x558ae98)
  0x2905648: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290564c: adrp     x0, #0x55ad000
  0x2905650: ldr      x0, [x0, #0x7d8] ; = 0x0 (u64 @ 0x55ad7d8)
  0x2905654: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905658: adrp     x0, #0x55b6000
  0x290565c: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x55b6868)
  0x2905660: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905664: adrp     x0, #0x55b6000
  0x2905668: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x290566c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905670: adrp     x0, #0x55b6000
  0x2905674: ldr      x0, [x0, #0x870] ; = 0x0 (u64 @ 0x55b6870)
  0x2905678: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290567c: adrp     x0, #0x55b6000
  0x2905680: ldr      x0, [x0, #0x878] ; = 0x0 (u64 @ 0x55b6878)
  0x2905684: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905688: adrp     x0, #0x55b6000
  0x290568c: ldr      x0, [x0, #0x880] ; = 0x0 (u64 @ 0x55b6880)
  0x2905690: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905694: adrp     x0, #0x558b000
  0x2905698: ldr      x0, [x0, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x290569c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056a0: adrp     x0, #0x558a000
  0x29056a4: ldr      x0, [x0, #0xea8] ; = 0x0 (u64 @ 0x558aea8)
  0x29056a8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056ac: adrp     x0, #0x55ad000
  0x29056b0: ldr      x0, [x0, #0x7f0] ; = 0x0 (u64 @ 0x55ad7f0)
  0x29056b4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056b8: adrp     x0, #0x558b000
  0x29056bc: ldr      x0, [x0, #0x8c8] ; = 0x0 (u64 @ 0x558b8c8)
  0x29056c0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056c4: adrp     x0, #0x55b6000
  0x29056c8: ldr      x0, [x0, #0x888] ; = 0x0 (u64 @ 0x55b6888)
  0x29056cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056d0: adrp     x0, #0x558b000
  0x29056d4: ldr      x0, [x0, #0x8c0] ; = 0x0 (u64 @ 0x558b8c0)
  0x29056d8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056dc: adrp     x0, #0x55b6000
  0x29056e0: ldr      x0, [x0, #0x890] ; = 0x0 (u64 @ 0x55b6890)
  0x29056e4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29056e8: mov      w8, #1
  0x29056ec: strb     w8, [x20, #0x289]
  0x29056f0: movi     v0.2d, #0000000000000000
  0x29056f4: stp      xzr, xzr, [sp, #0x90]
  0x29056f8: str      xzr, [sp, #0xa0]
  0x29056fc: stp      xzr, xzr, [sp, #0x70]
  0x2905700: str      xzr, [sp, #0x80]
  0x2905704: str      xzr, [sp, #0x60]
  0x2905708: stp      q0, q0, [sp, #0x40]
  0x290570c: str      xzr, [sp, #0x38]
  0x2905710: ldr      x8, [x19, #0xd0]
  0x2905714: cbz      x8, #0x2905b48
  0x2905718: adrp     x8, #0x558b000
  0x290571c: ldr      x8, [x8, #0x8c0] ; = 0x0 (u64 @ 0x558b8c0)
  0x2905720: adrp     x20, #0x558b000
  0x2905724: adrp     x21, #0x55b6000
  0x2905728: adrp     x22, #0x55b6000
  0x290572c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2905730: ldr      x20, [x20, #0x8c8] ; = 0x0 (u64 @ 0x558b8c8)
  0x2905734: ldr      x21, [x21, #0x850] ; = 0x0 (u64 @ 0x55b6850)
  0x2905738: ldr      x22, [x22, #0x840] ; = 0x0 (u64 @ 0x55b6840)
  0x290573c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2905740: ldr      x1, [x20] ; = 0x0 (u64 @ 0x558b000)
  0x2905744: mov      x20, x0
  0x2905748: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x290574c: ldr      x0, [x21] ; = 0x0 (u64 @ 0x55b6000)
  0x2905750: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2905754: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x2905758: mov      x21, x0
  0x290575c: bl       #0x4019344 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$.ctor
  0x2905760: ldr      x0, [x19, #0xd0]
  0x2905764: cbz      x0, #0x2905bc0
  0x2905768: adrp     x8, #0x55ad000
  0x290576c: ldr      x8, [x8, #0x7f0] ; = 0x0 (u64 @ 0x55ad7f0)
  0x2905770: adrp     x25, #0x55ad000
  0x2905774: adrp     x29, #0x558a000
  0x2905778: adrp     x28, #0x558b000
  0x290577c: adrp     x26, #0x55b6000
  0x2905780: adrp     x27, #0x55b6000
  0x2905784: ldr      x25, [x25, #0x7d0] ; = 0x0 (u64 @ 0x55ad7d0)
  0x2905788: ldr      x29, [x29, #0xe90] ; = 0x0 (u64 @ 0x558ae90)
  0x290578c: ldr      x28, [x28, #0x8f0] ; = 0x0 (u64 @ 0x558b8f0)
  0x2905790: ldr      x26, [x26, #0x860] ; = 0x0 (u64 @ 0x55b6860)
  0x2905794: ldr      x27, [x27, #0x838] ; = 0x0 (u64 @ 0x55b6838)
  0x2905798: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ad000)
  0x290579c: add      x8, sp, #0x10
  0x29057a0: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x29057a4: ldr      q0, [sp, #0x10]
  0x29057a8: ldr      x8, [sp, #0x20]
  0x29057ac: str      q0, [sp, #0x90]
  0x29057b0: str      x8, [sp, #0xa0]
  0x29057b4: ldr      x1, [x25] ; = 0x0 (u64 @ 0x55ad000)
  0x29057b8: add      x0, sp, #0x90
  0x29057bc: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x29057c0: tbz      w0, #0, #0x2905a3c
  0x29057c4: ldr      x22, [sp, #0xa0]
  0x29057c8: cbz      x22, #0x2905b84
  0x29057cc: ldr      x8, [x22, #0x18] ; = 0x0 (u64 @ 0x55b6018)
  0x29057d0: cbz      x8, #0x2905b88
  0x29057d4: ldr      w8, [x8, #0x38]
  0x29057d8: cmp      w8, #2
  0x29057dc: b.eq     #0x29057b4
  0x29057e0: mov      x0, x19
  0x29057e4: mov      x1, x22
  0x29057e8: bl       #0x2908e44 ; -> CCharacterData$$CheckNodeApply
  0x29057ec: tbz      w0, #0, #0x29057b4
  0x29057f0: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55b6020)
  0x29057f4: cbz      x8, #0x2905bbc
  0x29057f8: ldr      w9, [x8, #0x34]
  0x29057fc: cbz      w9, #0x29058c8
  0x2905800: cmp      w9, #1
  0x2905804: b.ne     #0x29057b4
  0x2905808: ldr      x0, [x8, #0x48] ; = 0x0 (u64 @ 0x55ad048)
  0x290580c: cbz      x0, #0x2905bcc
  0x2905810: adrp     x8, #0x558a000
  0x2905814: ldr      x8, [x8, #0xea8] ; = 0x0 (u64 @ 0x558aea8)
  0x2905818: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x290581c: add      x8, sp, #0x10
  0x2905820: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2905824: ldr      q0, [sp, #0x10]
  0x2905828: ldr      x8, [sp, #0x20]
  0x290582c: str      q0, [sp, #0x70]
  0x2905830: str      x8, [sp, #0x80]
  0x2905834: ldr      x1, [x29] ; = 0x0 (u64 @ 0x558a000)
  0x2905838: add      x0, sp, #0x70
  0x290583c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2905840: tbz      w0, #0, #0x29059a8
  0x2905844: ldr      x22, [sp, #0x80]
  0x2905848: mov      x0, xzr
  0x290584c: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x2905850: cbz      x0, #0x29059ec
  0x2905854: mov      w2, #1
  0x2905858: mov      x1, x22
  0x290585c: mov      x3, xzr
  0x2905860: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x2905864: mov      x1, x0
  0x2905868: cbz      x1, #0x2905834
  0x290586c: cbz      x20, #0x29059fc
  0x2905870: ldr      w10, [x20, #0x1c]
  0x2905874: ldr      x8, [x20, #0x10] ; = 0x0 (u64 @ 0x558b010)
  0x2905878: ldr      x9, [x28] ; = 0x0 (u64 @ 0x558b000)
  0x290587c: add      w10, w10, #1
  0x2905880: str      w10, [x20, #0x1c]
  0x2905884: cbz      x8, #0x29059f4
  0x2905888: ldrsw    x10, [x20, #0x18]
  0x290588c: ldr      w11, [x8, #0x18]
  0x2905890: cmp      w10, w11
  0x2905894: b.hs     #0x29058b0
  0x2905898: add      w9, w10, #1
  0x290589c: add      x0, x8, x10, lsl #3
  0x29058a0: str      w9, [x20, #0x18]
  0x29058a4: str      x1, [x0, #0x20]!
  0x29058a8: bl       #0x21af920 ; -> ??? 0x21af920
  0x29058ac: b        #0x2905834
  0x29058b0: ldr      x8, [x9, #0x20]
  0x29058b4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558a0c0)
  0x29058b8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558a070)
  0x29058bc: mov      x0, x20
  0x29058c0: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x29058c4: b        #0x2905834
  0x29058c8: cbz      x21, #0x2905bdc
  0x29058cc: ldr      w1, [x8, #0x38]
  0x29058d0: adrp     x8, #0x55b6000
  0x29058d4: ldr      x8, [x8, #0x828] ; = 0x0 (u64 @ 0x55b6828)
  0x29058d8: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29058dc: mov      x0, x21
  0x29058e0: bl       #0x4019f0c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$ContainsKey
  0x29058e4: tbnz     w0, #0, #0x2905934
  0x29058e8: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55b6020)
  0x29058ec: cbz      x8, #0x2905be0
  0x29058f0: ldr      w23, [x8, #0x38]
  0x29058f4: adrp     x8, #0x55b6000
  0x29058f8: ldr      x8, [x8, #0x890] ; = 0x0 (u64 @ 0x55b6890)
  0x29058fc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905900: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2905904: adrp     x8, #0x55b6000
  0x2905908: ldr      x8, [x8, #0x888] ; = 0x0 (u64 @ 0x55b6888)
  0x290590c: mov      x24, x0
  0x2905910: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905914: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x2905918: adrp     x8, #0x55b6000
  0x290591c: ldr      x8, [x8, #0x820] ; = 0x0 (u64 @ 0x55b6820)
  0x2905920: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905924: mov      x0, x21
  0x2905928: mov      w1, w23
  0x290592c: mov      x2, x24
  0x2905930: bl       #0x4019d18 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$Add
  0x2905934: ldr      x8, [x22, #0x20] ; = 0x0 (u64 @ 0x55b6020)
  0x2905938: cbz      x8, #0x2905bd0
  0x290593c: ldr      w1, [x8, #0x38]
  0x2905940: adrp     x8, #0x55b6000
  0x2905944: ldr      x8, [x8, #0x848] ; = 0x0 (u64 @ 0x55b6848)
  0x2905948: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x290594c: mov      x0, x21
  0x2905950: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2905954: cbz      x0, #0x2905bd4
  0x2905958: adrp     x9, #0x55b6000
  0x290595c: ldr      x1, [x22, #0x20] ; = 0x0 (u64 @ 0x55b6020)
  0x2905960: ldr      w10, [x0, #0x1c]
  0x2905964: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55b6010)
  0x2905968: ldr      x9, [x9, #0x880] ; = 0x0 (u64 @ 0x55b6880)
  0x290596c: add      w10, w10, #1
  0x2905970: ldr      x9, [x9] ; = 0x0 (u64 @ 0x55b6000)
  0x2905974: str      w10, [x0, #0x1c]
  0x2905978: cbz      x8, #0x2905bd8
  0x290597c: ldrsw    x10, [x0, #0x18]
  0x2905980: ldr      w11, [x8, #0x18]
  0x2905984: cmp      w10, w11
  0x2905988: b.hs     #0x29059d8
  0x290598c: add      w9, w10, #1
  0x2905990: add      x8, x8, x10, lsl #3
  0x2905994: str      w9, [x0, #0x18]
  0x2905998: str      x1, [x8, #0x20]!
  0x290599c: mov      x0, x8
  0x29059a0: bl       #0x21af920 ; -> ??? 0x21af920
  0x29059a4: b        #0x29057b4
  0x29059a8: mov      x23, xzr
  0x29059ac: mov      w22, #3
  0x29059b0: adrp     x8, #0x558a000
  0x29059b4: ldr      x8, [x8, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x29059b8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x29059bc: add      x0, sp, #0x70
  0x29059c0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29059c4: cbnz     x23, #0x2905bc4
  0x29059c8: cmp      w22, #3
  0x29059cc: b.eq     #0x29057b4
  0x29059d0: cbz      w22, #0x29057b4
  0x29059d4: b        #0x2905b68
  0x29059d8: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x55b6020)
  0x29059dc: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558a0c0)
  0x29059e0: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558a070)
  0x29059e4: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x29059e8: b        #0x29057b4
  0x29059ec: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x29059f0: b        #0x2905be4
  0x29059f4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x29059f8: b        #0x2905be4
  0x29059fc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905a00: b        #0x2905be4
  0x2905a04: b        #0x2905a18
  0x2905a08: b        #0x2905a18
  0x2905a0c: b        #0x2905a18
  0x2905a10: b        #0x2905a18
  0x2905a14: b        #0x2905a18
  0x2905a18: mov      x22, x0
  0x2905a1c: cmp      w1, #1
  0x2905a20: b.ne     #0x2905b90
  0x2905a24: mov      x0, x22
  0x2905a28: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2905a2c: ldr      x23, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2905a30: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2905a34: mov      w22, wzr
  0x2905a38: b        #0x29059b0
  0x2905a3c: adrp     x8, #0x55ad000
  0x2905a40: ldr      x8, [x8, #0x7c8] ; = 0x0 (u64 @ 0x55ad7c8)
  0x2905a44: add      x0, sp, #0x90
  0x2905a48: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ad000)
  0x2905a4c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2905a50: adrp     x23, #0x55b6000
  0x2905a54: ldr      x23, [x23, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2905a58: cbz      x21, #0x2905bc0
  0x2905a5c: adrp     x8, #0x55b6000
  0x2905a60: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x55b6830)
  0x2905a64: mov      x0, x21
  0x2905a68: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905a6c: add      x8, sp, #0x10
  0x2905a70: bl       #0x401a150 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x2905a74: ldp      q0, q1, [sp, #0x10]
  0x2905a78: ldr      x8, [sp, #0x30]
  0x2905a7c: stp      q0, q1, [sp, #0x40]
  0x2905a80: str      x8, [sp, #0x60]
  0x2905a84: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2905a88: add      x0, sp, #0x40
  0x2905a8c: bl       #0x415e7b8 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x2905a90: tbz      w0, #0, #0x2905b20
  0x2905a94: ldr      x0, [x19, #0x40]
  0x2905a98: cbz      x0, #0x2905b80
  0x2905a9c: ldr      x21, [sp, #0x58]
  0x2905aa0: ldr      w1, [sp, #0x50]
  0x2905aa4: ldr      x3, [x27] ; = 0x0 (u64 @ 0x55b6000)
  0x2905aa8: add      x2, sp, #0x38
  0x2905aac: bl       #0x401b48c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$TryGetValue
  0x2905ab0: tbz      w0, #0, #0x2905a84
  0x2905ab4: ldr      x22, [sp, #0x38]
  0x2905ab8: cbz      x22, #0x2905b8c
  0x2905abc: ldr      x8, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x2905ac0: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2905ac4: ldrh     w9, [x8, #0x12e]
  0x2905ac8: cbz      x9, #0x2905aec
  0x2905acc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2905ad0: add      x10, x10, #8
  0x2905ad4: ldur     x11, [x10, #-8]
  0x2905ad8: cmp      x11, x1
  0x2905adc: b.eq     #0x2905afc
  0x2905ae0: subs     x9, x9, #1
  0x2905ae4: add      x10, x10, #0x10
  0x2905ae8: b.ne     #0x2905ad4
  0x2905aec: mov      w2, #0x10
  0x2905af0: mov      x0, x22
  0x2905af4: bl       #0x2210028 ; -> ??? 0x2210028
  0x2905af8: b        #0x2905b0c
  0x2905afc: ldr      w9, [x10]
  0x2905b00: add      w9, w9, #0x10
  0x2905b04: add      x8, x8, w9, sxtw #4
  0x2905b08: add      x0, x8, #0x138
  0x2905b0c: ldp      x8, x2, [x0]
  0x2905b10: mov      x0, x22
  0x2905b14: mov      x1, x21
  0x2905b18: blr      x8
  0x2905b1c: b        #0x2905a84
  0x2905b20: adrp     x8, #0x55b6000
  0x2905b24: ldr      x8, [x8, #0x858] ; = 0x0 (u64 @ 0x55b6858)
  0x2905b28: add      x0, sp, #0x40
  0x2905b2c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905b30: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2905b34: ldr      x0, [x19, #0x10]
  0x2905b38: cbz      x0, #0x2905bc0
  0x2905b3c: str      x20, [x0, #0x40]!
  0x2905b40: mov      x1, x20
  0x2905b44: bl       #0x21af920 ; -> ??? 0x21af920
  0x2905b48: ldp      x20, x19, [sp, #0x100]
  0x2905b4c: ldp      x22, x21, [sp, #0xf0]
  0x2905b50: ldp      x24, x23, [sp, #0xe0]
  0x2905b54: ldp      x26, x25, [sp, #0xd0]
  0x2905b58: ldp      x28, x27, [sp, #0xc0]
  0x2905b5c: ldp      x29, x30, [sp, #0xb0]
  0x2905b60: add      sp, sp, #0x110
  0x2905b64: ret      
  0x2905b68: adrp     x8, #0x55ad000
  0x2905b6c: ldr      x8, [x8, #0x7c8] ; = 0x0 (u64 @ 0x55ad7c8)
  0x2905b70: add      x0, sp, #0x90
  0x2905b74: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ad000)
  0x2905b78: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2905b7c: b        #0x2905b48
  0x2905b80: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905b84: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905b88: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905b8c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905b90: str      x1, [sp, #8]
  0x2905b94: mov      x23, xzr
  0x2905b98: adrp     x8, #0x558a000
  0x2905b9c: ldr      x8, [x8, #0xe88] ; = 0x0 (u64 @ 0x558ae88)
  0x2905ba0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2905ba4: add      x0, sp, #0x70
  0x2905ba8: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2905bac: ldr      x1, [sp, #8]
  0x2905bb0: cbz      x23, #0x2905c44
  0x2905bb4: mov      x0, x23
  0x2905bb8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905bbc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bc0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bc4: mov      x0, x23
  0x2905bc8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905bcc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bd0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bd4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bd8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905bdc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905be0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2905be4: mov      x22, x0
  0x2905be8: str      x1, [sp, #8]
  0x2905bec: b        #0x2905b98
  0x2905bf0: b        #0x2905c40
  0x2905bf4: b        #0x2905c40
  0x2905bf8: b        #0x2905c40
  0x2905bfc: b        #0x2905c40
  0x2905c00: b        #0x2905c40
  0x2905c04: b        #0x2905c40
  0x2905c08: b        #0x2905c40
  0x2905c0c: b        #0x2905c40
  0x2905c10: b        #0x2905c40
  0x2905c14: b        #0x2905c40
  0x2905c18: b        #0x2905c40
  0x2905c1c: b        #0x2905c40
  0x2905c20: b        #0x2905c40
  0x2905c24: b        #0x2905c40
  0x2905c28: b        #0x2905ca8
  0x2905c2c: b        #0x2905ca8
  0x2905c30: b        #0x2905c40
  0x2905c34: b        #0x2905c40
  0x2905c38: b        #0x2905ca8
  0x2905c3c: b        #0x2905ca8
  0x2905c40: mov      x22, x0
  0x2905c44: cmp      w1, #1
  0x2905c48: b.ne     #0x2905c7c
  0x2905c4c: mov      x0, x22
  0x2905c50: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2905c54: ldr      x23, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2905c58: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2905c5c: adrp     x8, #0x55ad000
  0x2905c60: ldr      x8, [x8, #0x7c8] ; = 0x0 (u64 @ 0x55ad7c8)
  0x2905c64: add      x0, sp, #0x90
  0x2905c68: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ad000)
  0x2905c6c: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2905c70: cbz      x23, #0x2905a50
  0x2905c74: mov      x0, x23
  0x2905c78: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905c7c: mov      x23, xzr
  0x2905c80: b        #0x2905c88
  0x2905c84: mov      x22, x0
  0x2905c88: adrp     x8, #0x55ad000
  0x2905c8c: ldr      x8, [x8, #0x7c8] ; = 0x0 (u64 @ 0x55ad7c8)
  0x2905c90: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55ad000)
  0x2905c94: add      x0, sp, #0x90
  0x2905c98: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2905c9c: cbz      x23, #0x2905d08
  0x2905ca0: mov      x0, x23
  0x2905ca4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905ca8: mov      x22, x0
  0x2905cac: cmp      w1, #1
  0x2905cb0: b.ne     #0x2905ce4
  0x2905cb4: mov      x0, x22
  0x2905cb8: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2905cbc: ldr      x21, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2905cc0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2905cc4: adrp     x8, #0x55b6000
  0x2905cc8: ldr      x8, [x8, #0x858] ; = 0x0 (u64 @ 0x55b6858)
  0x2905ccc: add      x0, sp, #0x40
  0x2905cd0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905cd4: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2905cd8: cbz      x21, #0x2905b34
  0x2905cdc: mov      x0, x21
  0x2905ce0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905ce4: mov      x21, xzr
  0x2905ce8: b        #0x2905cf0
  0x2905cec: mov      x22, x0
  0x2905cf0: adrp     x8, #0x55b6000
  0x2905cf4: ldr      x8, [x8, #0x858] ; = 0x0 (u64 @ 0x55b6858)
  0x2905cf8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905cfc: add      x0, sp, #0x40
  0x2905d00: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2905d04: cbnz     x21, #0x2905d10
  0x2905d08: mov      x0, x22
  0x2905d0c: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2905d10: mov      x0, x21
  0x2905d14: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2905d18: bl       #0x1f86e18 ; -> ??? 0x1f86e18
