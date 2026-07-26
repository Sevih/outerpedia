; ===== GetBuffDamgeFinalReduce @ 0x26df06c..0x26df574 (taille 1288 octets) =====
  0x26df06c: sub      sp, sp, #0xd0
  0x26df070: stp      x29, x30, [sp, #0x70]
  0x26df074: stp      x28, x27, [sp, #0x80]
  0x26df078: stp      x26, x25, [sp, #0x90]
  0x26df07c: stp      x24, x23, [sp, #0xa0]
  0x26df080: stp      x22, x21, [sp, #0xb0]
  0x26df084: stp      x20, x19, [sp, #0xc0]
  0x26df088: adrp     x22, #0x5957000
  0x26df08c: ldrb     w8, [x22, #0xb68]
  0x26df090: mov      x19, x2
  0x26df094: mov      x20, x1
  0x26df098: mov      x21, x0
  0x26df09c: tbnz     w8, #0, #0x26df114
  0x26df0a0: adrp     x0, #0x5511000
  0x26df0a4: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26df0a8: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0ac: adrp     x0, #0x5511000
  0x26df0b0: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df0b4: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0b8: adrp     x0, #0x5511000
  0x26df0bc: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df0c0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0c4: adrp     x0, #0x5511000
  0x26df0c8: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26df0cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0d0: adrp     x0, #0x5511000
  0x26df0d4: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5511850)
  0x26df0d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0dc: adrp     x0, #0x5511000
  0x26df0e0: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x26df0e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0e8: adrp     x0, #0x5511000
  0x26df0ec: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26df0f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df0f4: adrp     x0, #0x5511000
  0x26df0f8: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df0fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df100: adrp     x0, #0x550f000
  0x26df104: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26df108: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df10c: mov      w8, #1
  0x26df110: strb     w8, [x22, #0xb68]
  0x26df114: stp      xzr, xzr, [sp, #0x50]
  0x26df118: str      xzr, [sp, #0x60]
  0x26df11c: stp      xzr, xzr, [sp, #0x30]
  0x26df120: str      xzr, [sp, #0x40]
  0x26df124: str      wzr, [x20]
  0x26df128: ldr      x0, [x21, #0x380]
  0x26df12c: cbz      x0, #0x26df488
  0x26df130: adrp     x8, #0x5511000
  0x26df134: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df138: adrp     x25, #0x5511000
  0x26df13c: adrp     x26, #0x550f000
  0x26df140: adrp     x27, #0x5511000
  0x26df144: ldr      x25, [x25, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df148: ldr      x26, [x26, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26df14c: ldr      x27, [x27, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26df150: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26df154: adrp     x28, #0x5511000
  0x26df158: adrp     x24, #0x5511000
  0x26df15c: adrp     x23, #0x5511000
  0x26df160: ldr      x28, [x28, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26df164: ldr      x24, [x24, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26df168: ldr      x23, [x23, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df16c: add      x8, sp, #0x18
  0x26df170: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26df174: ldur     q0, [sp, #0x18]
  0x26df178: ldr      x8, [sp, #0x28]
  0x26df17c: str      q0, [sp, #0x50]
  0x26df180: str      x8, [sp, #0x60]
  0x26df184: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x26df188: add      x0, sp, #0x50
  0x26df18c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26df190: tbz      w0, #0, #0x26df418
  0x26df194: ldr      x21, [sp, #0x60]
  0x26df198: cbz      x21, #0x26df184
  0x26df19c: ldr      x0, [x26] ; = 0x0 (u64 @ 0x550f000)
  0x26df1a0: ldr      x22, [x21, #0x20]
  0x26df1a4: ldr      w8, [x0, #0xe0]
  0x26df1a8: cbnz     w8, #0x26df1b0
  0x26df1ac: bl       #0x218489c ; -> ??? 0x218489c
  0x26df1b0: mov      x0, x22
  0x26df1b4: mov      x1, xzr
  0x26df1b8: mov      x2, xzr
  0x26df1bc: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26df1c0: tbnz     w0, #0, #0x26df184
  0x26df1c4: mov      x0, x21
  0x26df1c8: mov      x1, xzr
  0x26df1cc: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df1d0: cmp      w0, #0x72
  0x26df1d4: b.ne     #0x26df224
  0x26df1d8: mov      w2, #0x17
  0x26df1dc: mov      x0, x21
  0x26df1e0: mov      x1, x19
  0x26df1e4: mov      x3, xzr
  0x26df1e8: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26df1ec: tbz      w0, #0, #0x26df224
  0x26df1f0: ldr      w22, [x20]
  0x26df1f4: mov      x0, x21
  0x26df1f8: mov      x1, xzr
  0x26df1fc: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df200: cmp      w22, w0
  0x26df204: b.ge     #0x26df224
  0x26df208: mov      x0, x21
  0x26df20c: mov      x1, xzr
  0x26df210: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df214: str      w0, [x20]
  0x26df218: mov      x0, x21
  0x26df21c: mov      x1, xzr
  0x26df220: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26df224: mov      x0, x21
  0x26df228: mov      x1, xzr
  0x26df22c: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df230: cmp      w0, #0x73
  0x26df234: b.ne     #0x26df320
  0x26df238: mov      w2, #0x17
  0x26df23c: mov      x0, x21
  0x26df240: mov      x1, x19
  0x26df244: mov      x3, xzr
  0x26df248: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26df24c: tbz      w0, #0, #0x26df320
  0x26df250: ldr      x0, [x21, #0x20]
  0x26df254: cbz      x0, #0x26df478
  0x26df258: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x26df25c: cbz      x0, #0x26df184
  0x26df260: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x550f010)
  0x26df264: cbz      x0, #0x26df47c
  0x26df268: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5511000)
  0x26df26c: add      x8, sp, #0x18
  0x26df270: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26df274: ldur     q0, [sp, #0x18]
  0x26df278: ldr      x8, [sp, #0x28]
  0x26df27c: mov      w29, wzr
  0x26df280: str      q0, [sp, #0x30]
  0x26df284: str      x8, [sp, #0x40]
  0x26df288: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26df28c: add      x0, sp, #0x30
  0x26df290: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26df294: tbz      w0, #0, #0x26df2dc
  0x26df298: ldr      x0, [x26] ; = 0x0 (u64 @ 0x550f000)
  0x26df29c: ldr      x22, [sp, #0x40]
  0x26df2a0: ldr      w8, [x0, #0xe0]
  0x26df2a4: cbnz     w8, #0x26df2ac
  0x26df2a8: bl       #0x218489c ; -> ??? 0x218489c
  0x26df2ac: mov      x0, x22
  0x26df2b0: mov      x1, xzr
  0x26df2b4: mov      x2, xzr
  0x26df2b8: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26df2bc: tbnz     w0, #0, #0x26df288
  0x26df2c0: cbz      x22, #0x26df3e0
  0x26df2c4: mov      x0, x22
  0x26df2c8: mov      x1, xzr
  0x26df2cc: bl       #0x27d18b4 ; -> CCharacter$$get_IsAlive
  0x26df2d0: and      w8, w0, #1
  0x26df2d4: add      w29, w29, w8
  0x26df2d8: b        #0x26df288
  0x26df2dc: mov      x22, xzr
  0x26df2e0: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x26df2e4: add      x0, sp, #0x30
  0x26df2e8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df2ec: cbnz     x22, #0x26df480
  0x26df2f0: mov      x0, x21
  0x26df2f4: mov      x1, xzr
  0x26df2f8: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df2fc: ldr      w9, [x20]
  0x26df300: sub      w8, w29, #1
  0x26df304: mul      w8, w0, w8
  0x26df308: cmp      w8, w9
  0x26df30c: b.le     #0x26df320
  0x26df310: str      w8, [x20]
  0x26df314: mov      x0, x21
  0x26df318: mov      x1, xzr
  0x26df31c: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26df320: mov      x0, x21
  0x26df324: mov      x1, xzr
  0x26df328: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df32c: cmp      w0, #0x74
  0x26df330: b.ne     #0x26df3a4
  0x26df334: cbz      x19, #0x26df44c
  0x26df338: mov      x0, x19
  0x26df33c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26df340: cbz      x0, #0x26df444
  0x26df344: ldr      w8, [x0, #0x18]
  0x26df348: cbz      w8, #0x26df3a4
  0x26df34c: mov      x0, x19
  0x26df350: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26df354: cbz      x0, #0x26df474
  0x26df358: ldr      w2, [x0, #0x18]
  0x26df35c: mov      x0, x21
  0x26df360: mov      x1, x19
  0x26df364: mov      x3, xzr
  0x26df368: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26df36c: tbz      w0, #0, #0x26df3a4
  0x26df370: mov      x0, x21
  0x26df374: mov      x1, xzr
  0x26df378: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df37c: ldr      w8, [x20]
  0x26df380: cmp      w0, w8
  0x26df384: b.le     #0x26df3a4
  0x26df388: mov      x0, x21
  0x26df38c: mov      x1, xzr
  0x26df390: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df394: str      w0, [x20]
  0x26df398: mov      x0, x21
  0x26df39c: mov      x1, xzr
  0x26df3a0: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26df3a4: mov      x0, x21
  0x26df3a8: mov      x1, xzr
  0x26df3ac: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df3b0: cmp      w0, #0x74
  0x26df3b4: b.ne     #0x26df184
  0x26df3b8: cbz      x19, #0x26df448
  0x26df3bc: mov      x0, x19
  0x26df3c0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26df3c4: cbz      x0, #0x26df450
  0x26df3c8: ldr      w8, [x0, #0x18]
  0x26df3cc: cbnz     w8, #0x26df184
  0x26df3d0: mov      x0, x21
  0x26df3d4: mov      x1, xzr
  0x26df3d8: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26df3dc: b        #0x26df184
  0x26df3e0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df3e4: b        #0x26df48c
  0x26df3e8: b        #0x26df3f8
  0x26df3ec: b        #0x26df3f8
  0x26df3f0: b        #0x26df3f8
  0x26df3f4: b        #0x26df3f8
  0x26df3f8: cmp      w1, #1
  0x26df3fc: stp      x1, x0, [sp, #8]
  0x26df400: b.ne     #0x26df454
  0x26df404: ldr      x0, [sp, #0x10]
  0x26df408: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26df40c: ldr      x22, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x26df410: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26df414: b        #0x26df2e0
  0x26df418: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x26df41c: add      x0, sp, #0x50
  0x26df420: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df424: ldp      x20, x19, [sp, #0xc0]
  0x26df428: ldp      x22, x21, [sp, #0xb0]
  0x26df42c: ldp      x24, x23, [sp, #0xa0]
  0x26df430: ldp      x26, x25, [sp, #0x90]
  0x26df434: ldp      x28, x27, [sp, #0x80]
  0x26df438: ldp      x29, x30, [sp, #0x70]
  0x26df43c: add      sp, sp, #0xd0
  0x26df440: ret      
  0x26df444: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df448: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df44c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df450: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df454: mov      x22, xzr
  0x26df458: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x26df45c: add      x0, sp, #0x30
  0x26df460: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df464: ldp      x1, x0, [sp, #8]
  0x26df468: cbz      x22, #0x26df514
  0x26df46c: mov      x0, x22
  0x26df470: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df474: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df478: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df47c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df480: mov      x0, x22
  0x26df484: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df488: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df48c: stp      x1, x0, [sp, #8]
  0x26df490: b        #0x26df458
  0x26df494: b        #0x26df514
  0x26df498: b        #0x26df514
  0x26df49c: b        #0x26df514
  0x26df4a0: b        #0x26df514
  0x26df4a4: b        #0x26df514
  0x26df4a8: b        #0x26df514
  0x26df4ac: b        #0x26df514
  0x26df4b0: b        #0x26df514
  0x26df4b4: b        #0x26df514
  0x26df4b8: b        #0x26df514
  0x26df4bc: b        #0x26df514
  0x26df4c0: b        #0x26df514
  0x26df4c4: b        #0x26df514
  0x26df4c8: b        #0x26df514
  0x26df4cc: b        #0x26df514
  0x26df4d0: b        #0x26df514
  0x26df4d4: b        #0x26df514
  0x26df4d8: b        #0x26df514
  0x26df4dc: b        #0x26df514
  0x26df4e0: b        #0x26df514
  0x26df4e4: b        #0x26df514
  0x26df4e8: b        #0x26df514
  0x26df4ec: b        #0x26df514
  0x26df4f0: b        #0x26df514
  0x26df4f4: b        #0x26df514
  0x26df4f8: b        #0x26df514
  0x26df4fc: b        #0x26df514
  0x26df500: b        #0x26df514
  0x26df504: b        #0x26df514
  0x26df508: b        #0x26df514
  0x26df50c: b        #0x26df514
  0x26df510: b        #0x26df514
  0x26df514: cmp      w1, #1
  0x26df518: b.ne     #0x26df540
  0x26df51c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26df520: ldr      x19, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x26df524: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26df528: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x26df52c: add      x0, sp, #0x50
  0x26df530: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df534: cbz      x19, #0x26df424
  0x26df538: mov      x0, x19
  0x26df53c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df540: mov      x20, x0
  0x26df544: mov      x19, xzr
  0x26df548: b        #0x26df550
  0x26df54c: mov      x20, x0
  0x26df550: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x26df554: add      x0, sp, #0x50
  0x26df558: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df55c: cbnz     x19, #0x26df568
  0x26df560: mov      x0, x20
  0x26df564: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x26df568: mov      x0, x19
  0x26df56c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df570: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
