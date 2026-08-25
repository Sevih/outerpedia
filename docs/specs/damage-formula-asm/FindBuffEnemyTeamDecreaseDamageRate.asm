; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== FindBuffEnemyTeamDecreaseDamageRate @ 0x282fb94..0x282fd24 (taille 400 octets) =====
  0x282fb94: sub      sp, sp, #0x50
  0x282fb98: str      x30, [sp, #0x20]
  0x282fb9c: stp      x22, x21, [sp, #0x30]
  0x282fba0: stp      x20, x19, [sp, #0x40]
  0x282fba4: adrp     x20, #0x59e7000
  0x282fba8: ldrb     w8, [x20, #0x6e4]
  0x282fbac: mov      x19, x0
  0x282fbb0: tbnz     w8, #0, #0x282fbec
  0x282fbb4: adrp     x0, #0x5598000
  0x282fbb8: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282fbbc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fbc0: adrp     x0, #0x5598000
  0x282fbc4: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282fbc8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fbcc: adrp     x0, #0x5598000
  0x282fbd0: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x282fbd4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fbd8: adrp     x0, #0x5598000
  0x282fbdc: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282fbe0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x282fbe4: mov      w8, #1
  0x282fbe8: strb     w8, [x20, #0x6e4]
  0x282fbec: stp      xzr, xzr, [sp, #8]
  0x282fbf0: str      xzr, [sp, #0x18]
  0x282fbf4: ldr      x0, [x19, #0x380]
  0x282fbf8: cbz      x0, #0x282fca8
  0x282fbfc: adrp     x8, #0x5598000
  0x282fc00: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x282fc04: adrp     x22, #0x5598000
  0x282fc08: adrp     x21, #0x5598000
  0x282fc0c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x282fc10: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x282fc14: ldr      x21, [x21, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x282fc18: add      x8, sp, #8
  0x282fc1c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x282fc20: mov      w19, wzr
  0x282fc24: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fc28: add      x0, sp, #8
  0x282fc2c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x282fc30: tbz      w0, #0, #0x282fc7c
  0x282fc34: ldr      x20, [sp, #0x18]
  0x282fc38: cbz      x20, #0x282fca0
  0x282fc3c: mov      x0, x20
  0x282fc40: mov      x1, xzr
  0x282fc44: bl       #0x23252b8 ; -> CBuff$$get_Type
  0x282fc48: cmp      w0, #0x65
  0x282fc4c: b.ne     #0x282fc24
  0x282fc50: mov      w2, #0x17
  0x282fc54: mov      x0, x20
  0x282fc58: mov      x1, xzr
  0x282fc5c: mov      x3, xzr
  0x282fc60: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x282fc64: tbz      w0, #0, #0x282fc24
  0x282fc68: mov      x0, x20
  0x282fc6c: mov      x1, xzr
  0x282fc70: bl       #0x232548c ; -> CBuff$$get_Value
  0x282fc74: add      w19, w0, w19
  0x282fc78: b        #0x282fc24
  0x282fc7c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x282fc80: add      x0, sp, #8
  0x282fc84: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282fc88: mov      w0, w19
  0x282fc8c: ldp      x20, x19, [sp, #0x40]
  0x282fc90: ldp      x22, x21, [sp, #0x30]
  0x282fc94: ldr      x30, [sp, #0x20]
  0x282fc98: add      sp, sp, #0x50
  0x282fc9c: ret      
  0x282fca0: mov      x22, x21
  0x282fca4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282fca8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x282fcac: b        #0x282fcbc
  0x282fcb0: b        #0x282fcbc
  0x282fcb4: b        #0x282fcc0
  0x282fcb8: b        #0x282fcbc
  0x282fcbc: mov      x22, x21
  0x282fcc0: mov      x20, x0
  0x282fcc4: cmp      w1, #1
  0x282fcc8: b.ne     #0x282fcf4
  0x282fccc: mov      x0, x20
  0x282fcd0: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x282fcd4: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x282fcd8: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x282fcdc: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fce0: add      x0, sp, #8
  0x282fce4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282fce8: cbz      x21, #0x282fc88
  0x282fcec: mov      x0, x21
  0x282fcf0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282fcf4: mov      x21, xzr
  0x282fcf8: b        #0x282fd00
  0x282fcfc: mov      x20, x0
  0x282fd00: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x282fd04: add      x0, sp, #8
  0x282fd08: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x282fd0c: cbnz     x21, #0x282fd18
  0x282fd10: mov      x0, x20
  0x282fd14: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x282fd18: mov      x0, x21
  0x282fd1c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x282fd20: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
