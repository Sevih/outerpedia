; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CBuff_CheckReverseHealCAP @ 0x2331094..0x2331224 (taille 400 octets) =====
  0x2331094: sub      sp, sp, #0x50
  0x2331098: str      x30, [sp, #0x20]
  0x233109c: stp      x22, x21, [sp, #0x30]
  0x23310a0: stp      x20, x19, [sp, #0x40]
  0x23310a4: adrp     x21, #0x59e4000
  0x23310a8: ldrb     w8, [x21, #0xc11]
  0x23310ac: mov      w19, w1
  0x23310b0: mov      x20, x0
  0x23310b4: tbnz     w8, #0, #0x23310f0
  0x23310b8: adrp     x0, #0x5598000
  0x23310bc: ldr      x0, [x0, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23310c0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23310c4: adrp     x0, #0x5598000
  0x23310c8: ldr      x0, [x0, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x23310cc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23310d0: adrp     x0, #0x5598000
  0x23310d4: ldr      x0, [x0, #0xd98] ; = 0x0 (u64 @ 0x5598d98)
  0x23310d8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23310dc: adrp     x0, #0x5598000
  0x23310e0: ldr      x0, [x0, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x23310e4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23310e8: mov      w8, #1
  0x23310ec: strb     w8, [x21, #0xc11]
  0x23310f0: stp      xzr, xzr, [sp, #8]
  0x23310f4: str      xzr, [sp, #0x18]
  0x23310f8: ldr      x0, [x20, #0x20]
  0x23310fc: cbz      x0, #0x23311a4
  0x2331100: mov      w1, #0x14
  0x2331104: mov      x2, xzr
  0x2331108: bl       #0x2820eac ; -> CCharacterBattle$$GetBuffListByType
  0x233110c: cbz      x0, #0x23311a4
  0x2331110: adrp     x8, #0x5598000
  0x2331114: ldr      x8, [x8, #0xda8] ; = 0x0 (u64 @ 0x5598da8)
  0x2331118: adrp     x22, #0x5598000
  0x233111c: adrp     x21, #0x5598000
  0x2331120: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2331124: ldr      x22, [x22, #0xd80] ; = 0x0 (u64 @ 0x5598d80)
  0x2331128: ldr      x21, [x21, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x233112c: add      x8, sp, #8
  0x2331130: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2331134: ldr      x1, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2331138: add      x0, sp, #8
  0x233113c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2331140: tbz      w0, #0, #0x233117c
  0x2331144: ldr      x20, [sp, #0x18]
  0x2331148: cbz      x20, #0x2331134
  0x233114c: mov      x0, x20
  0x2331150: mov      x1, xzr
  0x2331154: bl       #0x23279e0 ; -> CBuff$$CheckCondition
  0x2331158: tbz      w0, #0, #0x2331134
  0x233115c: ldr      x8, [x20, #0x10]
  0x2331160: cbz      x8, #0x23311a0
  0x2331164: ldr      w8, [x8, #0x54]
  0x2331168: ldr      w9, [x20, #0x30]
  0x233116c: mul      w8, w9, w8
  0x2331170: cmp      w8, w19
  0x2331174: b.ge     #0x2331134
  0x2331178: mov      w19, w8
  0x233117c: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2331180: add      x0, sp, #8
  0x2331184: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2331188: mov      w0, w19
  0x233118c: ldp      x20, x19, [sp, #0x40]
  0x2331190: ldp      x22, x21, [sp, #0x30]
  0x2331194: ldr      x30, [sp, #0x20]
  0x2331198: add      sp, sp, #0x50
  0x233119c: ret      
  0x23311a0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23311a4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x23311a8: b        #0x23311b0
  0x23311ac: b        #0x23311b0
  0x23311b0: mov      x20, x0
  0x23311b4: cmp      w1, #1
  0x23311b8: b.ne     #0x23311ec
  0x23311bc: mov      x0, x20
  0x23311c0: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x23311c4: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x23311c8: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x23311cc: adrp     x8, #0x5598000
  0x23311d0: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x23311d4: add      x0, sp, #8
  0x23311d8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x23311dc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x23311e0: cbz      x21, #0x2331188
  0x23311e4: mov      x0, x21
  0x23311e8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x23311ec: mov      x21, xzr
  0x23311f0: b        #0x23311f8
  0x23311f4: mov      x20, x0
  0x23311f8: adrp     x8, #0x5598000
  0x23311fc: ldr      x8, [x8, #0xd78] ; = 0x0 (u64 @ 0x5598d78)
  0x2331200: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2331204: add      x0, sp, #8
  0x2331208: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x233120c: cbnz     x21, #0x2331218
  0x2331210: mov      x0, x20
  0x2331214: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2331218: mov      x0, x21
  0x233121c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2331220: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
