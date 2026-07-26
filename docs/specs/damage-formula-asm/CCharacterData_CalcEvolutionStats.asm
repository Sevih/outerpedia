; ===== CCharacterData_CalcEvolutionStats @ 0x27e57f4..0x27e59cc (taille 472 octets) =====
  0x27e57f4: sub      sp, sp, #0x60
  0x27e57f8: stp      x30, x23, [sp, #0x30]
  0x27e57fc: stp      x22, x21, [sp, #0x40]
  0x27e5800: stp      x20, x19, [sp, #0x50]
  0x27e5804: adrp     x20, #0x5958000
  0x27e5808: ldrb     w8, [x20, #0x390]
  0x27e580c: mov      x19, x0
  0x27e5810: tbnz     w8, #0, #0x27e5864
  0x27e5814: adrp     x0, #0x5536000
  0x27e5818: ldr      x0, [x0, #0xad0] ; = 0x0 (u64 @ 0x5536ad0)
  0x27e581c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5820: adrp     x0, #0x5536000
  0x27e5824: ldr      x0, [x0, #0xad8] ; = 0x0 (u64 @ 0x5536ad8)
  0x27e5828: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e582c: adrp     x0, #0x5536000
  0x27e5830: ldr      x0, [x0, #0xae0] ; = 0x0 (u64 @ 0x5536ae0)
  0x27e5834: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5838: adrp     x0, #0x5536000
  0x27e583c: ldr      x0, [x0, #0xae8] ; = 0x0 (u64 @ 0x5536ae8)
  0x27e5840: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5844: adrp     x0, #0x5536000
  0x27e5848: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e584c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5850: adrp     x0, #0x5536000
  0x27e5854: ldr      x0, [x0, #0xd50] ; = 0x0 (u64 @ 0x5536d50)
  0x27e5858: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e585c: mov      w8, #1
  0x27e5860: strb     w8, [x20, #0x390]
  0x27e5864: movi     v0.2d, #0000000000000000
  0x27e5868: mov      w1, #1
  0x27e586c: mov      x0, x19
  0x27e5870: mov      w2, wzr
  0x27e5874: str      xzr, [sp, #0x20]
  0x27e5878: stp      q0, q0, [sp]
  0x27e587c: bl       #0x27e6b50 ; -> CCharacterData$$GetEvolutionStat
  0x27e5880: ldr      x9, [x19, #0x40]
  0x27e5884: cbz      x9, #0x27e595c
  0x27e5888: adrp     x8, #0x5536000
  0x27e588c: ldr      x8, [x8, #0xad0] ; = 0x0 (u64 @ 0x5536ad0)
  0x27e5890: adrp     x22, #0x5536000
  0x27e5894: adrp     x23, #0x5536000
  0x27e5898: adrp     x21, #0x5536000
  0x27e589c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e58a0: ldr      x22, [x22, #0xae0] ; = 0x0 (u64 @ 0x5536ae0)
  0x27e58a4: ldr      x23, [x23, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e58a8: ldr      x21, [x21, #0xad8] ; = 0x0 (u64 @ 0x5536ad8)
  0x27e58ac: mov      x19, x0
  0x27e58b0: mov      x8, sp
  0x27e58b4: mov      x0, x9
  0x27e58b8: bl       #0x3fb1a10 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x27e58bc: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x27e58c0: mov      x0, sp
  0x27e58c4: bl       #0x40f6228 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x27e58c8: tbz      w0, #0, #0x27e5938
  0x27e58cc: ldr      x20, [sp, #0x18]
  0x27e58d0: cbz      x20, #0x27e5958
  0x27e58d4: ldr      x8, [x20]
  0x27e58d8: ldr      x1, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e58dc: ldrh     w9, [x8, #0x12e]
  0x27e58e0: cbz      x9, #0x27e5904
  0x27e58e4: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e58e8: add      x10, x10, #8
  0x27e58ec: ldur     x11, [x10, #-8]
  0x27e58f0: cmp      x11, x1
  0x27e58f4: b.eq     #0x27e5914
  0x27e58f8: subs     x9, x9, #1
  0x27e58fc: add      x10, x10, #0x10
  0x27e5900: b.ne     #0x27e58ec
  0x27e5904: mov      w2, #0xb
  0x27e5908: mov      x0, x20
  0x27e590c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5910: b        #0x27e5924
  0x27e5914: ldr      w9, [x10]
  0x27e5918: add      w9, w9, #0xb
  0x27e591c: add      x8, x8, w9, sxtw #4
  0x27e5920: add      x0, x8, #0x138
  0x27e5924: ldp      x8, x2, [x0]
  0x27e5928: mov      x0, x20
  0x27e592c: mov      x1, x19
  0x27e5930: blr      x8
  0x27e5934: b        #0x27e58bc
  0x27e5938: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5536000)
  0x27e593c: mov      x0, sp
  0x27e5940: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e5944: ldp      x20, x19, [sp, #0x50]
  0x27e5948: ldp      x22, x21, [sp, #0x40]
  0x27e594c: ldp      x30, x23, [sp, #0x30]
  0x27e5950: add      sp, sp, #0x60
  0x27e5954: ret      
  0x27e5958: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e595c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x27e5960: b        #0x27e5968
  0x27e5964: b        #0x27e5968
  0x27e5968: mov      x19, x0
  0x27e596c: cmp      w1, #1
  0x27e5970: b.ne     #0x27e599c
  0x27e5974: mov      x0, x19
  0x27e5978: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x27e597c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5980: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x27e5984: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5536000)
  0x27e5988: mov      x0, sp
  0x27e598c: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e5990: cbz      x20, #0x27e5944
  0x27e5994: mov      x0, x20
  0x27e5998: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e599c: mov      x20, xzr
  0x27e59a0: b        #0x27e59a8
  0x27e59a4: mov      x19, x0
  0x27e59a8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5536000)
  0x27e59ac: mov      x0, sp
  0x27e59b0: bl       #0x40f634c ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x27e59b4: cbnz     x20, #0x27e59c0
  0x27e59b8: mov      x0, x19
  0x27e59bc: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x27e59c0: mov      x0, x20
  0x27e59c4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x27e59c8: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
