; ===== FindBuffElementDamageRate @ 0x26df700..0x26df890 (taille 400 octets) =====
  0x26df700: sub      sp, sp, #0x50
  0x26df704: str      x30, [sp, #0x20]
  0x26df708: stp      x22, x21, [sp, #0x30]
  0x26df70c: stp      x20, x19, [sp, #0x40]
  0x26df710: adrp     x20, #0x5957000
  0x26df714: ldrb     w8, [x20, #0xb6b]
  0x26df718: mov      x19, x0
  0x26df71c: tbnz     w8, #0, #0x26df758
  0x26df720: adrp     x0, #0x5511000
  0x26df724: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df728: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df72c: adrp     x0, #0x5511000
  0x26df730: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df734: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df738: adrp     x0, #0x5511000
  0x26df73c: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x26df740: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df744: adrp     x0, #0x5511000
  0x26df748: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df74c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26df750: mov      w8, #1
  0x26df754: strb     w8, [x20, #0xb6b]
  0x26df758: stp      xzr, xzr, [sp, #8]
  0x26df75c: str      xzr, [sp, #0x18]
  0x26df760: ldr      x0, [x19, #0x380]
  0x26df764: cbz      x0, #0x26df814
  0x26df768: adrp     x8, #0x5511000
  0x26df76c: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26df770: adrp     x22, #0x5511000
  0x26df774: adrp     x21, #0x5511000
  0x26df778: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26df77c: ldr      x22, [x22, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26df780: ldr      x21, [x21, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26df784: add      x8, sp, #8
  0x26df788: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26df78c: mov      w19, wzr
  0x26df790: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26df794: add      x0, sp, #8
  0x26df798: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26df79c: tbz      w0, #0, #0x26df7e8
  0x26df7a0: ldr      x20, [sp, #0x18]
  0x26df7a4: cbz      x20, #0x26df80c
  0x26df7a8: mov      x0, x20
  0x26df7ac: mov      x1, xzr
  0x26df7b0: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26df7b4: cmp      w0, #0x5f
  0x26df7b8: b.ne     #0x26df790
  0x26df7bc: mov      w2, #0x17
  0x26df7c0: mov      x0, x20
  0x26df7c4: mov      x1, xzr
  0x26df7c8: mov      x3, xzr
  0x26df7cc: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26df7d0: tbz      w0, #0, #0x26df790
  0x26df7d4: mov      x0, x20
  0x26df7d8: mov      x1, xzr
  0x26df7dc: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26df7e0: add      w19, w0, w19
  0x26df7e4: b        #0x26df790
  0x26df7e8: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x26df7ec: add      x0, sp, #8
  0x26df7f0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df7f4: mov      w0, w19
  0x26df7f8: ldp      x20, x19, [sp, #0x40]
  0x26df7fc: ldp      x22, x21, [sp, #0x30]
  0x26df800: ldr      x30, [sp, #0x20]
  0x26df804: add      sp, sp, #0x50
  0x26df808: ret      
  0x26df80c: mov      x22, x21
  0x26df810: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df814: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26df818: b        #0x26df828
  0x26df81c: b        #0x26df828
  0x26df820: b        #0x26df82c
  0x26df824: b        #0x26df828
  0x26df828: mov      x22, x21
  0x26df82c: mov      x20, x0
  0x26df830: cmp      w1, #1
  0x26df834: b.ne     #0x26df860
  0x26df838: mov      x0, x20
  0x26df83c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26df840: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x26df844: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26df848: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26df84c: add      x0, sp, #8
  0x26df850: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df854: cbz      x21, #0x26df7f4
  0x26df858: mov      x0, x21
  0x26df85c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df860: mov      x21, xzr
  0x26df864: b        #0x26df86c
  0x26df868: mov      x20, x0
  0x26df86c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x26df870: add      x0, sp, #8
  0x26df874: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df878: cbnz     x21, #0x26df884
  0x26df87c: mov      x0, x20
  0x26df880: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x26df884: mov      x0, x21
  0x26df888: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df88c: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
