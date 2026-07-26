; ===== FindBuffEnemyTeamDecreaseDamageRate @ 0x26df890..0x26dfa20 (taille 400 octets) =====
  0x26df890: sub      sp, sp, #0x50
  0x26df894: str      x30, [sp, #0x20]
  0x26df898: stp      x22, x21, [sp, #0x30]
  0x26df89c: stp      x20, x19, [sp, #0x40]
  0x26df8a0: adrp     x20, #0x5957000
  0x26df8a4: ldrb     w8, [x20, #0xb6c]
  0x26df8a8: mov      x19, x0
  0x26df8ac: tbnz     w8, #0, #0x26df8e8
  0x26df8b0: adrp     x0, #0x5511000
  0x26df8b4: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df8b8: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df8bc: adrp     x0, #0x5511000
  0x26df8c0: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df8c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df8c8: adrp     x0, #0x5511000
  0x26df8cc: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x26df8d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df8d4: adrp     x0, #0x5511000
  0x26df8d8: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df8dc: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df8e0: mov      w8, #1
  0x26df8e4: strb     w8, [x20, #0xb6c]
  0x26df8e8: stp      xzr, xzr, [sp, #8]
  0x26df8ec: str      xzr, [sp, #0x18]
  0x26df8f0: ldr      x0, [x19, #0x380]
  0x26df8f4: cbz      x0, #0x26df9a4
  0x26df8f8: adrp     x8, #0x5511000
  0x26df8fc: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df900: adrp     x22, #0x5511000
  0x26df904: adrp     x21, #0x5511000
  0x26df908: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26df90c: ldr      x22, [x22, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df910: ldr      x21, [x21, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df914: add      x8, sp, #8
  0x26df918: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26df91c: mov      w19, wzr
  0x26df920: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26df924: add      x0, sp, #8
  0x26df928: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26df92c: tbz      w0, #0, #0x26df978
  0x26df930: ldr      x20, [sp, #0x18]
  0x26df934: cbz      x20, #0x26df99c
  0x26df938: mov      x0, x20
  0x26df93c: mov      x1, xzr
  0x26df940: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df944: cmp      w0, #0x60
  0x26df948: b.ne     #0x26df920
  0x26df94c: mov      w2, #0x17
  0x26df950: mov      x0, x20
  0x26df954: mov      x1, xzr
  0x26df958: mov      x3, xzr
  0x26df95c: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26df960: tbz      w0, #0, #0x26df920
  0x26df964: mov      x0, x20
  0x26df968: mov      x1, xzr
  0x26df96c: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df970: add      w19, w0, w19
  0x26df974: b        #0x26df920
  0x26df978: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x26df97c: add      x0, sp, #8
  0x26df980: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df984: mov      w0, w19
  0x26df988: ldp      x20, x19, [sp, #0x40]
  0x26df98c: ldp      x22, x21, [sp, #0x30]
  0x26df990: ldr      x30, [sp, #0x20]
  0x26df994: add      sp, sp, #0x50
  0x26df998: ret      
  0x26df99c: mov      x22, x21
  0x26df9a0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df9a4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df9a8: b        #0x26df9b8
  0x26df9ac: b        #0x26df9b8
  0x26df9b0: b        #0x26df9bc
  0x26df9b4: b        #0x26df9b8
  0x26df9b8: mov      x22, x21
  0x26df9bc: mov      x20, x0
  0x26df9c0: cmp      w1, #1
  0x26df9c4: b.ne     #0x26df9f0
  0x26df9c8: mov      x0, x20
  0x26df9cc: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26df9d0: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x26df9d4: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26df9d8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26df9dc: add      x0, sp, #8
  0x26df9e0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df9e4: cbz      x21, #0x26df984
  0x26df9e8: mov      x0, x21
  0x26df9ec: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df9f0: mov      x21, xzr
  0x26df9f4: b        #0x26df9fc
  0x26df9f8: mov      x20, x0
  0x26df9fc: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26dfa00: add      x0, sp, #8
  0x26dfa04: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26dfa08: cbnz     x21, #0x26dfa14
  0x26dfa0c: mov      x0, x20
  0x26dfa10: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x26dfa14: mov      x0, x21
  0x26dfa18: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26dfa1c: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
