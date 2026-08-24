; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_GetDotDamageIncreaseBuffValue @ 0x282a928..0x282abcc (taille 676 octets) =====
  0x282a928: sub      sp, sp, #0x80
  0x282a92c: stp      x30, x25, [sp, #0x40]
  0x282a930: stp      x24, x23, [sp, #0x50]
  0x282a934: stp      x22, x21, [sp, #0x60]
  0x282a938: stp      x20, x19, [sp, #0x70]
  0x282a93c: adrp     x22, #0x59d7000
  0x282a940: adrp     x21, #0x558a000
  0x282a944: ldrb     w8, [x22, #0xadf]
  0x282a948: ldr      x21, [x21, #0x350] ; = 0x0 (u64 @ 0x558a350)
  0x282a94c: mov      w20, w1
  0x282a950: mov      x19, x0
  0x282a954: tbnz     w8, #0, #0x282a99c
  0x282a958: adrp     x0, #0x558a000
  0x282a95c: ldr      x0, [x0, #0x350] ; = 0x0 (u64 @ 0x558a350)
  0x282a960: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282a964: adrp     x0, #0x558a000
  0x282a968: ldr      x0, [x0, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282a96c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282a970: adrp     x0, #0x558a000
  0x282a974: ldr      x0, [x0, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x282a978: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282a97c: adrp     x0, #0x558a000
  0x282a980: ldr      x0, [x0, #0x288] ; = 0x0 (u64 @ 0x558a288)
  0x282a984: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282a988: adrp     x0, #0x558a000
  0x282a98c: ldr      x0, [x0, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x282a990: bl       #0x21af97c ; -> ??? 0x21af97c
  0x282a994: mov      w8, #1
  0x282a998: strb     w8, [x22, #0xadf]
  0x282a99c: ldr      x0, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x282a9a0: stp      xzr, xzr, [sp, #0x20]
  0x282a9a4: str      xzr, [sp, #0x30]
  0x282a9a8: ldr      w8, [x0, #0xe0]
  0x282a9ac: cbnz     w8, #0x282a9b4
  0x282a9b0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x282a9b4: sub      w22, w20, #0x38
  0x282a9b8: cmp      w22, #6
  0x282a9bc: b.hi     #0x282aa04
  0x282a9c0: ldr      x0, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x282a9c4: ldr      w8, [x0, #0xe0]
  0x282a9c8: cbnz     w8, #0x282a9d0
  0x282a9cc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x282a9d0: cmp      w22, #6
  0x282a9d4: b.hi     #0x282aa30
  0x282a9d8: adrp     x8, #0x106e000
  0x282a9dc: add      x8, x8, #0xd31
  0x282a9e0: adr      x9, #0x282a9f8
  0x282a9e4: ldrb     w10, [x8, x22]
  0x282a9e8: add      x9, x9, x10, lsl #2
  0x282a9ec: mov      w23, wzr
  0x282a9f0: mov      w24, #0x47
  0x282a9f4: br       x9
  0x282a9f8: mov      w23, wzr
  0x282a9fc: mov      w24, #0x46
  0x282aa00: b        #0x282aa50
  0x282aa04: mov      w20, wzr
  0x282aa08: b        #0x282ab24
  0x282aa0c: mov      w23, wzr
  0x282aa10: mov      w24, #0x4a
  0x282aa14: b        #0x282aa50
  0x282aa18: mov      w23, wzr
  0x282aa1c: mov      w24, #0x48
  0x282aa20: b        #0x282aa50
  0x282aa24: mov      w23, wzr
  0x282aa28: mov      w24, #0x49
  0x282aa2c: b        #0x282aa50
  0x282aa30: mov      w24, wzr
  0x282aa34: mov      w23, #1
  0x282aa38: b        #0x282aa50
  0x282aa3c: mov      w23, wzr
  0x282aa40: mov      w24, #0x4b
  0x282aa44: b        #0x282aa50
  0x282aa48: mov      w23, wzr
  0x282aa4c: mov      w24, #0x4c
  0x282aa50: ldr      x0, [x19, #0x380]
  0x282aa54: cbz      x0, #0x282ab40
  0x282aa58: adrp     x8, #0x558a000
  0x282aa5c: ldr      x8, [x8, #0x298] ; = 0x0 (u64 @ 0x558a298)
  0x282aa60: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282aa64: add      x8, sp, #8
  0x282aa68: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282aa6c: ldur     q0, [sp, #8]
  0x282aa70: ldr      x8, [sp, #0x18]
  0x282aa74: adrp     x25, #0x558a000
  0x282aa78: mov      w20, wzr
  0x282aa7c: str      q0, [sp, #0x20]
  0x282aa80: str      x8, [sp, #0x30]
  0x282aa84: ldr      x25, [x25, #0x270] ; = 0x0 (u64 @ 0x558a270)
  0x282aa88: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x282aa8c: add      x0, sp, #0x20
  0x282aa90: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282aa94: tbz      w0, #0, #0x282ab10
  0x282aa98: ldr      x21, [sp, #0x30]
  0x282aa9c: cbz      x21, #0x282aa88
  0x282aaa0: tbnz     w23, #0, #0x282aab8
  0x282aaa4: mov      x0, x21
  0x282aaa8: mov      x1, xzr
  0x282aaac: bl       #0x2320198 ; -> CBuff$$get_Type
  0x282aab0: cmp      w0, w24
  0x282aab4: b.eq     #0x282aae8
  0x282aab8: cmp      w22, #4
  0x282aabc: b.hi     #0x282aad4
  0x282aac0: mov      x0, x21
  0x282aac4: mov      x1, xzr
  0x282aac8: bl       #0x2320198 ; -> CBuff$$get_Type
  0x282aacc: cmp      w0, #0x4e
  0x282aad0: b.eq     #0x282aae8
  0x282aad4: mov      x0, x21
  0x282aad8: mov      x1, xzr
  0x282aadc: bl       #0x2320198 ; -> CBuff$$get_Type
  0x282aae0: cmp      w0, #0x4f
  0x282aae4: b.ne     #0x282aa88
  0x282aae8: mov      x0, x21
  0x282aaec: mov      x1, x19
  0x282aaf0: mov      x2, xzr
  0x282aaf4: bl       #0x23228c0 ; -> CBuff$$CheckCondition
  0x282aaf8: tbz      w0, #0, #0x282aa88
  0x282aafc: mov      x0, x21
  0x282ab00: mov      x1, xzr
  0x282ab04: bl       #0x232036c ; -> CBuff$$get_Value
  0x282ab08: add      w20, w0, w20
  0x282ab0c: b        #0x282aa88
  0x282ab10: adrp     x8, #0x558a000
  0x282ab14: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ab18: add      x0, sp, #0x20
  0x282ab1c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282ab20: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282ab24: mov      w0, w20
  0x282ab28: ldp      x20, x19, [sp, #0x70]
  0x282ab2c: ldp      x22, x21, [sp, #0x60]
  0x282ab30: ldp      x24, x23, [sp, #0x50]
  0x282ab34: ldp      x30, x25, [sp, #0x40]
  0x282ab38: add      sp, sp, #0x80
  0x282ab3c: ret      
  0x282ab40: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x282ab44: b        #0x282ab58
  0x282ab48: b        #0x282ab58
  0x282ab4c: b        #0x282ab58
  0x282ab50: b        #0x282ab58
  0x282ab54: b        #0x282ab58
  0x282ab58: mov      x19, x0
  0x282ab5c: cmp      w1, #1
  0x282ab60: b.ne     #0x282ab94
  0x282ab64: mov      x0, x19
  0x282ab68: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x282ab6c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558a000)
  0x282ab70: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x282ab74: adrp     x8, #0x558a000
  0x282ab78: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282ab7c: add      x0, sp, #0x20
  0x282ab80: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282ab84: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282ab88: cbz      x21, #0x282ab24
  0x282ab8c: mov      x0, x21
  0x282ab90: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282ab94: mov      x21, xzr
  0x282ab98: b        #0x282aba0
  0x282ab9c: mov      x19, x0
  0x282aba0: adrp     x8, #0x558a000
  0x282aba4: ldr      x8, [x8, #0x268] ; = 0x0 (u64 @ 0x558a268)
  0x282aba8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x282abac: add      x0, sp, #0x20
  0x282abb0: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282abb4: cbnz     x21, #0x282abc0
  0x282abb8: mov      x0, x19
  0x282abbc: bl       #0x22b072c ; -> ??? 0x22b072c
  0x282abc0: mov      x0, x21
  0x282abc4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x282abc8: bl       #0x1f86e18 ; -> ??? 0x1f86e18
