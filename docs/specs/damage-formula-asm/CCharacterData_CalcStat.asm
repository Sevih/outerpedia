; ===== CCharacterData_CalcStat @ 0x27e2870..0x27e2bdc (taille 876 octets) =====
  0x27e2870: sub      sp, sp, #0xa0
  0x27e2874: str      x30, [sp, #0x60]
  0x27e2878: stp      x24, x23, [sp, #0x70]
  0x27e287c: stp      x22, x21, [sp, #0x80]
  0x27e2880: stp      x20, x19, [sp, #0x90]
  0x27e2884: adrp     x20, #0x5958000
  0x27e2888: ldrb     w8, [x20, #0x38d]
  0x27e288c: mov      x19, x0
  0x27e2890: tbnz     w8, #0, #0x27e28e4
  0x27e2894: adrp     x0, #0x5536000
  0x27e2898: ldr      x0, [x0, #0xad0] ; = 0x0 (u64 @ 0x5536ad0)
  0x27e289c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28a0: adrp     x0, #0x5536000
  0x27e28a4: ldr      x0, [x0, #0xad8] ; = 0x0 (u64 @ 0x5536ad8)
  0x27e28a8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28ac: adrp     x0, #0x5536000
  0x27e28b0: ldr      x0, [x0, #0xae0] ; = 0x0 (u64 @ 0x5536ae0)
  0x27e28b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28b8: adrp     x0, #0x5536000
  0x27e28bc: ldr      x0, [x0, #0xae8] ; = 0x0 (u64 @ 0x5536ae8)
  0x27e28c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28c4: adrp     x0, #0x5536000
  0x27e28c8: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e28cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28d0: adrp     x0, #0x5536000
  0x27e28d4: ldr      x0, [x0, #0xd50] ; = 0x0 (u64 @ 0x5536d50)
  0x27e28d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e28dc: mov      w8, #1
  0x27e28e0: strb     w8, [x20, #0x38d]
  0x27e28e4: movi     v0.2d, #0000000000000000
  0x27e28e8: mov      x0, x19
  0x27e28ec: str      xzr, [sp, #0x50]
  0x27e28f0: stp      q0, q0, [sp, #0x30]
  0x27e28f4: strb     wzr, [x19, #0x28]
  0x27e28f8: bl       #0x27e4750 ; -> CCharacterData$$CalcBasicStats
  0x27e28fc: ldr      x8, [x19, #0xf0]
  0x27e2900: cbz      x8, #0x27e2b60
  0x27e2904: ldr      w8, [x8, #0x40]
  0x27e2908: cbnz     w8, #0x27e2924
  0x27e290c: mov      x0, x19
  0x27e2910: bl       #0x27e57f4 ; -> CCharacterData$$CalcEvolutionStats
  0x27e2914: mov      x0, x19
  0x27e2918: bl       #0x27e59cc ; -> CCharacterData$$CalcTranscendentStarStats
  0x27e291c: mov      x0, x19
  0x27e2920: bl       #0x27e5c18 ; -> CCharacterData$$CalcArchiveStats
  0x27e2924: mov      x0, x19
  0x27e2928: bl       #0x27e5e54 ; -> CCharacterData$$CalcSetItem
  0x27e292c: ldr      x0, [x19, #0x40]
  0x27e2930: cbz      x0, #0x27e2b60
  0x27e2934: adrp     x8, #0x5536000
  0x27e2938: ldr      x8, [x8, #0xad0] ; = 0x0 (u64 @ 0x5536ad0)
  0x27e293c: adrp     x23, #0x5536000
  0x27e2940: adrp     x24, #0x5536000
  0x27e2944: adrp     x22, #0x5536000
  0x27e2948: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e294c: ldr      x23, [x23, #0xae0] ; = 0x0 (u64 @ 0x5536ae0)
  0x27e2950: ldr      x24, [x24, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e2954: ldr      x22, [x22, #0xad8] ; = 0x0 (u64 @ 0x5536ad8)
  0x27e2958: add      x8, sp, #8
  0x27e295c: bl       #0x3fb1a10 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x27e2960: ldur     q0, [sp, #8]
  0x27e2964: ldur     q1, [sp, #0x18]
  0x27e2968: ldr      x8, [sp, #0x28]
  0x27e296c: stp      q0, q1, [sp, #0x30]
  0x27e2970: str      x8, [sp, #0x50]
  0x27e2974: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e2978: add      x0, sp, #0x30
  0x27e297c: bl       #0x40f6228 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x27e2980: tbz      w0, #0, #0x27e2b20
  0x27e2984: ldr      x20, [sp, #0x48]
  0x27e2988: cbz      x20, #0x27e2b5c
  0x27e298c: ldr      x8, [x20]
  0x27e2990: ldr      x21, [x19, #0x48]
  0x27e2994: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e2998: ldrh     w9, [x8, #0x12e]
  0x27e299c: cbz      x9, #0x27e29c0
  0x27e29a0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e29a4: add      x10, x10, #8
  0x27e29a8: ldur     x11, [x10, #-8]
  0x27e29ac: cmp      x11, x1
  0x27e29b0: b.eq     #0x27e29d0
  0x27e29b4: subs     x9, x9, #1
  0x27e29b8: add      x10, x10, #0x10
  0x27e29bc: b.ne     #0x27e29a8
  0x27e29c0: mov      w2, #7
  0x27e29c4: mov      x0, x20
  0x27e29c8: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e29cc: b        #0x27e29e0
  0x27e29d0: ldr      w9, [x10]
  0x27e29d4: add      w9, w9, #7
  0x27e29d8: add      x8, x8, w9, sxtw #4
  0x27e29dc: add      x0, x8, #0x138
  0x27e29e0: ldp      x8, x2, [x0]
  0x27e29e4: mov      x0, x20
  0x27e29e8: mov      x1, x21
  0x27e29ec: blr      x8
  0x27e29f0: ldr      x8, [x20]
  0x27e29f4: ldr      x21, [x19, #0x18]
  0x27e29f8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e29fc: ldrh     w9, [x8, #0x12e]
  0x27e2a00: cbz      x9, #0x27e2a24
  0x27e2a04: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e2a08: add      x10, x10, #8
  0x27e2a0c: ldur     x11, [x10, #-8]
  0x27e2a10: cmp      x11, x1
  0x27e2a14: b.eq     #0x27e2a34
  0x27e2a18: subs     x9, x9, #1
  0x27e2a1c: add      x10, x10, #0x10
  0x27e2a20: b.ne     #0x27e2a0c
  0x27e2a24: mov      w2, #8
  0x27e2a28: mov      x0, x20
  0x27e2a2c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e2a30: b        #0x27e2a44
  0x27e2a34: ldr      w9, [x10]
  0x27e2a38: add      w9, w9, #8
  0x27e2a3c: add      x8, x8, w9, sxtw #4
  0x27e2a40: add      x0, x8, #0x138
  0x27e2a44: ldp      x8, x2, [x0]
  0x27e2a48: mov      x0, x20
  0x27e2a4c: mov      x1, x21
  0x27e2a50: blr      x8
  0x27e2a54: ldr      x8, [x20]
  0x27e2a58: ldr      x21, [x19, #0x20]
  0x27e2a5c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e2a60: ldrh     w9, [x8, #0x12e]
  0x27e2a64: cbz      x9, #0x27e2a88
  0x27e2a68: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e2a6c: add      x10, x10, #8
  0x27e2a70: ldur     x11, [x10, #-8]
  0x27e2a74: cmp      x11, x1
  0x27e2a78: b.eq     #0x27e2a98
  0x27e2a7c: subs     x9, x9, #1
  0x27e2a80: add      x10, x10, #0x10
  0x27e2a84: b.ne     #0x27e2a70
  0x27e2a88: mov      w2, #9
  0x27e2a8c: mov      x0, x20
  0x27e2a90: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e2a94: b        #0x27e2aa8
  0x27e2a98: ldr      w9, [x10]
  0x27e2a9c: add      w9, w9, #9
  0x27e2aa0: add      x8, x8, w9, sxtw #4
  0x27e2aa4: add      x0, x8, #0x138
  0x27e2aa8: ldp      x8, x2, [x0]
  0x27e2aac: mov      x0, x20
  0x27e2ab0: mov      x1, x21
  0x27e2ab4: blr      x8
  0x27e2ab8: ldr      x8, [x20]
  0x27e2abc: ldr      x21, [x19, #0x30]
  0x27e2ac0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e2ac4: ldrh     w9, [x8, #0x12e]
  0x27e2ac8: cbz      x9, #0x27e2aec
  0x27e2acc: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e2ad0: add      x10, x10, #8
  0x27e2ad4: ldur     x11, [x10, #-8]
  0x27e2ad8: cmp      x11, x1
  0x27e2adc: b.eq     #0x27e2afc
  0x27e2ae0: subs     x9, x9, #1
  0x27e2ae4: add      x10, x10, #0x10
  0x27e2ae8: b.ne     #0x27e2ad4
  0x27e2aec: mov      w2, #0xa
  0x27e2af0: mov      x0, x20
  0x27e2af4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e2af8: b        #0x27e2b0c
  0x27e2afc: ldr      w9, [x10]
  0x27e2b00: add      w9, w9, #0xa
  0x27e2b04: add      x8, x8, w9, sxtw #4
  0x27e2b08: add      x0, x8, #0x138
  0x27e2b0c: ldp      x8, x2, [x0]
  0x27e2b10: mov      x0, x20
  0x27e2b14: mov      x1, x21
  0x27e2b18: blr      x8
  0x27e2b1c: b        #0x27e2974
  0x27e2b20: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x27e2b24: add      x0, sp, #0x30
  0x27e2b28: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e2b2c: mov      x0, x19
  0x27e2b30: bl       #0x27e6230 ; -> CCharacterData$$CreateBuffSetItem
  0x27e2b34: mov      x0, x19
  0x27e2b38: bl       #0x27e6854 ; -> CCharacterData$$CalcPvpRealtimeFieldSkillStats
  0x27e2b3c: mov      x0, x19
  0x27e2b40: bl       #0x27e3668 ; -> CCharacterData$$CalcAwakeningNodeStats
  0x27e2b44: ldp      x20, x19, [sp, #0x90]
  0x27e2b48: ldp      x22, x21, [sp, #0x80]
  0x27e2b4c: ldp      x24, x23, [sp, #0x70]
  0x27e2b50: ldr      x30, [sp, #0x60]
  0x27e2b54: add      sp, sp, #0xa0
  0x27e2b58: ret      
  0x27e2b5c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e2b60: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e2b64: b        #0x27e2b78
  0x27e2b68: b        #0x27e2b78
  0x27e2b6c: b        #0x27e2b78
  0x27e2b70: b        #0x27e2b78
  0x27e2b74: b        #0x27e2b78
  0x27e2b78: mov      x20, x0
  0x27e2b7c: cmp      w1, #1
  0x27e2b80: b.ne     #0x27e2bac
  0x27e2b84: mov      x0, x20
  0x27e2b88: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x27e2b8c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e2b90: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x27e2b94: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x27e2b98: add      x0, sp, #0x30
  0x27e2b9c: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e2ba0: cbz      x21, #0x27e2b2c
  0x27e2ba4: mov      x0, x21
  0x27e2ba8: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e2bac: mov      x21, xzr
  0x27e2bb0: b        #0x27e2bb8
  0x27e2bb4: mov      x20, x0
  0x27e2bb8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x27e2bbc: add      x0, sp, #0x30
  0x27e2bc0: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e2bc4: cbnz     x21, #0x27e2bd0
  0x27e2bc8: mov      x0, x20
  0x27e2bcc: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x27e2bd0: mov      x0, x21
  0x27e2bd4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e2bd8: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
