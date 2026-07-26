; ===== CBuff_CheckReverseHealCAP @ 0x22ffd44..0x22ffed4 (taille 400 octets) =====
  0x22ffd44: sub      sp, sp, #0x50
  0x22ffd48: str      x30, [sp, #0x20]
  0x22ffd4c: stp      x22, x21, [sp, #0x30]
  0x22ffd50: stp      x20, x19, [sp, #0x40]
  0x22ffd54: adrp     x21, #0x5955000
  0x22ffd58: ldrb     w8, [x21, #0x92e]
  0x22ffd5c: mov      w19, w1
  0x22ffd60: mov      x20, x0
  0x22ffd64: tbnz     w8, #0, #0x22ffda0
  0x22ffd68: adrp     x0, #0x5511000
  0x22ffd6c: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ffd70: bl       #0x2184724 ; -> ??? 0x2184724
  0x22ffd74: adrp     x0, #0x5511000
  0x22ffd78: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22ffd7c: bl       #0x2184724 ; -> ??? 0x2184724
  0x22ffd80: adrp     x0, #0x5511000
  0x22ffd84: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x22ffd88: bl       #0x2184724 ; -> ??? 0x2184724
  0x22ffd8c: adrp     x0, #0x5511000
  0x22ffd90: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22ffd94: bl       #0x2184724 ; -> ??? 0x2184724
  0x22ffd98: mov      w8, #1
  0x22ffd9c: strb     w8, [x21, #0x92e]
  0x22ffda0: stp      xzr, xzr, [sp, #8]
  0x22ffda4: str      xzr, [sp, #0x18]
  0x22ffda8: ldr      x0, [x20, #0x20]
  0x22ffdac: cbz      x0, #0x22ffe54
  0x22ffdb0: mov      w1, #0x12
  0x22ffdb4: mov      x2, xzr
  0x22ffdb8: bl       #0x26d110c ; -> CCharacterBattle$$GetBuffListByType
  0x22ffdbc: cbz      x0, #0x22ffe54
  0x22ffdc0: adrp     x8, #0x5511000
  0x22ffdc4: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x22ffdc8: adrp     x22, #0x5511000
  0x22ffdcc: adrp     x21, #0x5511000
  0x22ffdd0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ffdd4: ldr      x22, [x22, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x22ffdd8: ldr      x21, [x21, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ffddc: add      x8, sp, #8
  0x22ffde0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x22ffde4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x22ffde8: add      x0, sp, #8
  0x22ffdec: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x22ffdf0: tbz      w0, #0, #0x22ffe2c
  0x22ffdf4: ldr      x20, [sp, #0x18]
  0x22ffdf8: cbz      x20, #0x22ffde4
  0x22ffdfc: mov      x0, x20
  0x22ffe00: mov      x1, xzr
  0x22ffe04: bl       #0x22f6ccc ; -> CBuff$$CheckCondition
  0x22ffe08: tbz      w0, #0, #0x22ffde4
  0x22ffe0c: ldr      x8, [x20, #0x10]
  0x22ffe10: cbz      x8, #0x22ffe50
  0x22ffe14: ldr      w8, [x8, #0x54]
  0x22ffe18: ldr      w9, [x20, #0x30]
  0x22ffe1c: mul      w8, w9, w8
  0x22ffe20: cmp      w8, w19
  0x22ffe24: b.ge     #0x22ffde4
  0x22ffe28: mov      w19, w8
  0x22ffe2c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x22ffe30: add      x0, sp, #8
  0x22ffe34: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ffe38: mov      w0, w19
  0x22ffe3c: ldp      x20, x19, [sp, #0x40]
  0x22ffe40: ldp      x22, x21, [sp, #0x30]
  0x22ffe44: ldr      x30, [sp, #0x20]
  0x22ffe48: add      sp, sp, #0x50
  0x22ffe4c: ret      
  0x22ffe50: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ffe54: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x22ffe58: b        #0x22ffe60
  0x22ffe5c: b        #0x22ffe60
  0x22ffe60: mov      x20, x0
  0x22ffe64: cmp      w1, #1
  0x22ffe68: b.ne     #0x22ffe9c
  0x22ffe6c: mov      x0, x20
  0x22ffe70: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x22ffe74: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x22ffe78: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x22ffe7c: adrp     x8, #0x5511000
  0x22ffe80: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ffe84: add      x0, sp, #8
  0x22ffe88: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ffe8c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ffe90: cbz      x21, #0x22ffe38
  0x22ffe94: mov      x0, x21
  0x22ffe98: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ffe9c: mov      x21, xzr
  0x22ffea0: b        #0x22ffea8
  0x22ffea4: mov      x20, x0
  0x22ffea8: adrp     x8, #0x5511000
  0x22ffeac: ldr      x8, [x8, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x22ffeb0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x22ffeb4: add      x0, sp, #8
  0x22ffeb8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x22ffebc: cbnz     x21, #0x22ffec8
  0x22ffec0: mov      x0, x20
  0x22ffec4: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x22ffec8: mov      x0, x21
  0x22ffecc: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x22ffed0: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
