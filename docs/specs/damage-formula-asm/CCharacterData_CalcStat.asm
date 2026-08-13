; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcStat @ 0x2904780..0x2904aec (taille 876 octets) =====
  0x2904780: sub      sp, sp, #0xa0
  0x2904784: str      x30, [sp, #0x60]
  0x2904788: stp      x24, x23, [sp, #0x70]
  0x290478c: stp      x22, x21, [sp, #0x80]
  0x2904790: stp      x20, x19, [sp, #0x90]
  0x2904794: adrp     x20, #0x59d8000
  0x2904798: ldrb     w8, [x20, #0x281]
  0x290479c: mov      x19, x0
  0x29047a0: tbnz     w8, #0, #0x29047f4
  0x29047a4: adrp     x0, #0x55b6000
  0x29047a8: ldr      x0, [x0, #0x7d8] ; = 0x0 (u64 @ 0x55b67d8)
  0x29047ac: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047b0: adrp     x0, #0x55b6000
  0x29047b4: ldr      x0, [x0, #0x7e0] ; = 0x0 (u64 @ 0x55b67e0)
  0x29047b8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047bc: adrp     x0, #0x55b6000
  0x29047c0: ldr      x0, [x0, #0x7e8] ; = 0x0 (u64 @ 0x55b67e8)
  0x29047c4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047c8: adrp     x0, #0x55b6000
  0x29047cc: ldr      x0, [x0, #0x7f0] ; = 0x0 (u64 @ 0x55b67f0)
  0x29047d0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047d4: adrp     x0, #0x55b6000
  0x29047d8: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x29047dc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047e0: adrp     x0, #0x55b6000
  0x29047e4: ldr      x0, [x0, #0x7f8] ; = 0x0 (u64 @ 0x55b67f8)
  0x29047e8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x29047ec: mov      w8, #1
  0x29047f0: strb     w8, [x20, #0x281]
  0x29047f4: movi     v0.2d, #0000000000000000
  0x29047f8: mov      x0, x19
  0x29047fc: str      xzr, [sp, #0x50]
  0x2904800: stp      q0, q0, [sp, #0x30]
  0x2904804: strb     wzr, [x19, #0x28]
  0x2904808: bl       #0x2906660 ; -> CCharacterData$$CalcBasicStats
  0x290480c: ldr      x8, [x19, #0xf0]
  0x2904810: cbz      x8, #0x2904a70
  0x2904814: ldr      w8, [x8, #0x40]
  0x2904818: cbnz     w8, #0x2904834
  0x290481c: mov      x0, x19
  0x2904820: bl       #0x2907704 ; -> CCharacterData$$CalcEvolutionStats
  0x2904824: mov      x0, x19
  0x2904828: bl       #0x29078dc ; -> CCharacterData$$CalcTranscendentStarStats
  0x290482c: mov      x0, x19
  0x2904830: bl       #0x2907b28 ; -> CCharacterData$$CalcArchiveStats
  0x2904834: mov      x0, x19
  0x2904838: bl       #0x2907d64 ; -> CCharacterData$$CalcSetItem
  0x290483c: ldr      x0, [x19, #0x40]
  0x2904840: cbz      x0, #0x2904a70
  0x2904844: adrp     x8, #0x55b6000
  0x2904848: ldr      x8, [x8, #0x7d8] ; = 0x0 (u64 @ 0x55b67d8)
  0x290484c: adrp     x23, #0x55b6000
  0x2904850: adrp     x24, #0x55b6000
  0x2904854: adrp     x22, #0x55b6000
  0x2904858: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x290485c: ldr      x23, [x23, #0x7e8] ; = 0x0 (u64 @ 0x55b67e8)
  0x2904860: ldr      x24, [x24, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2904864: ldr      x22, [x22, #0x7e0] ; = 0x0 (u64 @ 0x55b67e0)
  0x2904868: add      x8, sp, #8
  0x290486c: bl       #0x401a150 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x2904870: ldur     q0, [sp, #8]
  0x2904874: ldur     q1, [sp, #0x18]
  0x2904878: ldr      x8, [sp, #0x28]
  0x290487c: stp      q0, q1, [sp, #0x30]
  0x2904880: str      x8, [sp, #0x50]
  0x2904884: ldr      x1, [x23] ; = 0x0 (u64 @ 0x55b6000)
  0x2904888: add      x0, sp, #0x30
  0x290488c: bl       #0x415e7b8 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x2904890: tbz      w0, #0, #0x2904a30
  0x2904894: ldr      x20, [sp, #0x48]
  0x2904898: cbz      x20, #0x2904a6c
  0x290489c: ldr      x8, [x20]
  0x29048a0: ldr      x21, [x19, #0x48]
  0x29048a4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x29048a8: ldrh     w9, [x8, #0x12e]
  0x29048ac: cbz      x9, #0x29048d0
  0x29048b0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29048b4: add      x10, x10, #8
  0x29048b8: ldur     x11, [x10, #-8]
  0x29048bc: cmp      x11, x1
  0x29048c0: b.eq     #0x29048e0
  0x29048c4: subs     x9, x9, #1
  0x29048c8: add      x10, x10, #0x10
  0x29048cc: b.ne     #0x29048b8
  0x29048d0: mov      w2, #7
  0x29048d4: mov      x0, x20
  0x29048d8: bl       #0x2210028 ; -> ??? 0x2210028
  0x29048dc: b        #0x29048f0
  0x29048e0: ldr      w9, [x10]
  0x29048e4: add      w9, w9, #7
  0x29048e8: add      x8, x8, w9, sxtw #4
  0x29048ec: add      x0, x8, #0x138
  0x29048f0: ldp      x8, x2, [x0]
  0x29048f4: mov      x0, x20
  0x29048f8: mov      x1, x21
  0x29048fc: blr      x8
  0x2904900: ldr      x8, [x20]
  0x2904904: ldr      x21, [x19, #0x18]
  0x2904908: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x290490c: ldrh     w9, [x8, #0x12e]
  0x2904910: cbz      x9, #0x2904934
  0x2904914: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2904918: add      x10, x10, #8
  0x290491c: ldur     x11, [x10, #-8]
  0x2904920: cmp      x11, x1
  0x2904924: b.eq     #0x2904944
  0x2904928: subs     x9, x9, #1
  0x290492c: add      x10, x10, #0x10
  0x2904930: b.ne     #0x290491c
  0x2904934: mov      w2, #8
  0x2904938: mov      x0, x20
  0x290493c: bl       #0x2210028 ; -> ??? 0x2210028
  0x2904940: b        #0x2904954
  0x2904944: ldr      w9, [x10]
  0x2904948: add      w9, w9, #8
  0x290494c: add      x8, x8, w9, sxtw #4
  0x2904950: add      x0, x8, #0x138
  0x2904954: ldp      x8, x2, [x0]
  0x2904958: mov      x0, x20
  0x290495c: mov      x1, x21
  0x2904960: blr      x8
  0x2904964: ldr      x8, [x20]
  0x2904968: ldr      x21, [x19, #0x20]
  0x290496c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2904970: ldrh     w9, [x8, #0x12e]
  0x2904974: cbz      x9, #0x2904998
  0x2904978: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x290497c: add      x10, x10, #8
  0x2904980: ldur     x11, [x10, #-8]
  0x2904984: cmp      x11, x1
  0x2904988: b.eq     #0x29049a8
  0x290498c: subs     x9, x9, #1
  0x2904990: add      x10, x10, #0x10
  0x2904994: b.ne     #0x2904980
  0x2904998: mov      w2, #9
  0x290499c: mov      x0, x20
  0x29049a0: bl       #0x2210028 ; -> ??? 0x2210028
  0x29049a4: b        #0x29049b8
  0x29049a8: ldr      w9, [x10]
  0x29049ac: add      w9, w9, #9
  0x29049b0: add      x8, x8, w9, sxtw #4
  0x29049b4: add      x0, x8, #0x138
  0x29049b8: ldp      x8, x2, [x0]
  0x29049bc: mov      x0, x20
  0x29049c0: mov      x1, x21
  0x29049c4: blr      x8
  0x29049c8: ldr      x8, [x20]
  0x29049cc: ldr      x21, [x19, #0x30]
  0x29049d0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x29049d4: ldrh     w9, [x8, #0x12e]
  0x29049d8: cbz      x9, #0x29049fc
  0x29049dc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x29049e0: add      x10, x10, #8
  0x29049e4: ldur     x11, [x10, #-8]
  0x29049e8: cmp      x11, x1
  0x29049ec: b.eq     #0x2904a0c
  0x29049f0: subs     x9, x9, #1
  0x29049f4: add      x10, x10, #0x10
  0x29049f8: b.ne     #0x29049e4
  0x29049fc: mov      w2, #0xa
  0x2904a00: mov      x0, x20
  0x2904a04: bl       #0x2210028 ; -> ??? 0x2210028
  0x2904a08: b        #0x2904a1c
  0x2904a0c: ldr      w9, [x10]
  0x2904a10: add      w9, w9, #0xa
  0x2904a14: add      x8, x8, w9, sxtw #4
  0x2904a18: add      x0, x8, #0x138
  0x2904a1c: ldp      x8, x2, [x0]
  0x2904a20: mov      x0, x20
  0x2904a24: mov      x1, x21
  0x2904a28: blr      x8
  0x2904a2c: b        #0x2904884
  0x2904a30: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x2904a34: add      x0, sp, #0x30
  0x2904a38: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2904a3c: mov      x0, x19
  0x2904a40: bl       #0x2908140 ; -> CCharacterData$$CreateBuffSetItem
  0x2904a44: mov      x0, x19
  0x2904a48: bl       #0x2908764 ; -> CCharacterData$$CalcPvpRealtimeFieldSkillStats
  0x2904a4c: mov      x0, x19
  0x2904a50: bl       #0x2905578 ; -> CCharacterData$$CalcAwakeningNodeStats
  0x2904a54: ldp      x20, x19, [sp, #0x90]
  0x2904a58: ldp      x22, x21, [sp, #0x80]
  0x2904a5c: ldp      x24, x23, [sp, #0x70]
  0x2904a60: ldr      x30, [sp, #0x60]
  0x2904a64: add      sp, sp, #0xa0
  0x2904a68: ret      
  0x2904a6c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2904a70: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2904a74: b        #0x2904a88
  0x2904a78: b        #0x2904a88
  0x2904a7c: b        #0x2904a88
  0x2904a80: b        #0x2904a88
  0x2904a84: b        #0x2904a88
  0x2904a88: mov      x20, x0
  0x2904a8c: cmp      w1, #1
  0x2904a90: b.ne     #0x2904abc
  0x2904a94: mov      x0, x20
  0x2904a98: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2904a9c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x2904aa0: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2904aa4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x2904aa8: add      x0, sp, #0x30
  0x2904aac: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2904ab0: cbz      x21, #0x2904a3c
  0x2904ab4: mov      x0, x21
  0x2904ab8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2904abc: mov      x21, xzr
  0x2904ac0: b        #0x2904ac8
  0x2904ac4: mov      x20, x0
  0x2904ac8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x2904acc: add      x0, sp, #0x30
  0x2904ad0: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2904ad4: cbnz     x21, #0x2904ae0
  0x2904ad8: mov      x0, x20
  0x2904adc: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2904ae0: mov      x0, x21
  0x2904ae4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2904ae8: bl       #0x1f86e18 ; -> ??? 0x1f86e18
