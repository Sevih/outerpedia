; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_GetBuffList @ 0x2511e94..0x2513778 (taille 6372 octets) =====
  0x2511e94: sub      sp, sp, #0xc0
  0x2511e98: stp      x29, x30, [sp, #0x60]
  0x2511e9c: stp      x28, x27, [sp, #0x70]
  0x2511ea0: stp      x26, x25, [sp, #0x80]
  0x2511ea4: stp      x24, x23, [sp, #0x90]
  0x2511ea8: stp      x22, x21, [sp, #0xa0]
  0x2511eac: stp      x20, x19, [sp, #0xb0]
  0x2511eb0: adrp     x22, #0x59e5000
  0x2511eb4: ldrb     w8, [x22, #0xc90]
  0x2511eb8: mov      x19, x4
  0x2511ebc: mov      w20, w3
  0x2511ec0: mov      w24, w2
  0x2511ec4: mov      w21, w1
  0x2511ec8: mov      x29, x0
  0x2511ecc: tbnz     w8, #0, #0x2511f8c
  0x2511ed0: adrp     x0, #0x55a7000
  0x2511ed4: ldr      x0, [x0, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x2511ed8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511edc: adrp     x0, #0x55a7000
  0x2511ee0: ldr      x0, [x0, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x2511ee4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511ee8: adrp     x0, #0x55a7000
  0x2511eec: ldr      x0, [x0, #0xe68] ; = 0x0 (u64 @ 0x55a7e68)
  0x2511ef0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511ef4: adrp     x0, #0x55a7000
  0x2511ef8: ldr      x0, [x0, #0xf00] ; = 0x0 (u64 @ 0x55a7f00)
  0x2511efc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f00: adrp     x0, #0x55a7000
  0x2511f04: ldr      x0, [x0, #0xf08] ; = 0x0 (u64 @ 0x55a7f08)
  0x2511f08: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f0c: adrp     x0, #0x55a7000
  0x2511f10: ldr      x0, [x0, #0xe70] ; = 0x0 (u64 @ 0x55a7e70)
  0x2511f14: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f18: adrp     x0, #0x559a000
  0x2511f1c: ldr      x0, [x0, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x2511f20: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f24: adrp     x0, #0x55a8000
  0x2511f28: ldr      x0, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2511f2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f30: adrp     x0, #0x55a7000
  0x2511f34: ldr      x0, [x0, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2511f38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f3c: adrp     x0, #0x55a7000
  0x2511f40: ldr      x0, [x0, #0xf10] ; = 0x0 (u64 @ 0x55a7f10)
  0x2511f44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f48: adrp     x0, #0x55a8000
  0x2511f4c: ldr      x0, [x0, #8] ; = 0x0 (u64 @ 0x55a8008)
  0x2511f50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f54: adrp     x0, #0x55a8000
  0x2511f58: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2511f5c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f60: adrp     x0, #0x55a8000
  0x2511f64: ldr      x0, [x0, #0x18] ; = 0x0 (u64 @ 0x55a8018)
  0x2511f68: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f6c: adrp     x0, #0x55a8000
  0x2511f70: ldr      x0, [x0, #0x20] ; = 0x0 (u64 @ 0x55a8020)
  0x2511f74: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f78: adrp     x0, #0x55a8000
  0x2511f7c: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x55a8028)
  0x2511f80: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2511f84: mov      w8, #1
  0x2511f88: strb     w8, [x22, #0xc90]
  0x2511f8c: adrp     x28, #0x55a7000
  0x2511f90: adrp     x27, #0x559a000
  0x2511f94: adrp     x26, #0x55a7000
  0x2511f98: ldr      x28, [x28, #0xe68] ; = 0x0 (u64 @ 0x55a7e68)
  0x2511f9c: ldr      x27, [x27, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x2511fa0: ldr      x26, [x26, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x2511fa4: cmp      w21, #0x17
  0x2511fa8: stp      xzr, xzr, [sp, #0x40]
  0x2511fac: str      xzr, [sp, #0x50]
  0x2511fb0: stp      xzr, xzr, [sp, #0x20]
  0x2511fb4: str      xzr, [sp, #0x30]
  0x2511fb8: b.eq     #0x2512314
  0x2511fbc: cmp      w21, #0x18
  0x2511fc0: b.ne     #0x2512214
  0x2511fc4: ldr      x0, [x29, #0x10]
  0x2511fc8: cbz      x0, #0x2513178
  0x2511fcc: adrp     x8, #0x55a7000
  0x2511fd0: ldr      x8, [x8, #0xf10] ; = 0x0 (u64 @ 0x55a7f10)
  0x2511fd4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2511fd8: add      x8, sp, #8
  0x2511fdc: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2511fe0: ldur     q0, [sp, #8]
  0x2511fe4: ldr      x8, [sp, #0x18]
  0x2511fe8: adrp     x22, #0x55a7000
  0x2511fec: str      q0, [sp, #0x40]
  0x2511ff0: str      x8, [sp, #0x50]
  0x2511ff4: ldr      x22, [x22, #0xf00] ; = 0x0 (u64 @ 0x55a7f00)
  0x2511ff8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55a7000)
  0x2511ffc: add      x0, sp, #0x40
  0x2512000: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512004: tbz      w0, #0, #0x2512174
  0x2512008: ldr      x8, [sp, #0x50]
  0x251200c: cbz      x8, #0x25121b4
  0x2512010: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x55a7030)
  0x2512014: cbz      x0, #0x25121a8
  0x2512018: adrp     x8, #0x55a7000
  0x251201c: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512020: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512024: add      x8, sp, #8
  0x2512028: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x251202c: ldur     q0, [sp, #8]
  0x2512030: ldr      x8, [sp, #0x18]
  0x2512034: str      q0, [sp, #0x20]
  0x2512038: str      x8, [sp, #0x30]
  0x251203c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512040: add      x0, sp, #0x20
  0x2512044: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512048: tbz      w0, #0, #0x25120fc
  0x251204c: ldr      x23, [sp, #0x30]
  0x2512050: cbz      x23, #0x2512124
  0x2512054: ldr      w8, [x23, #0x24]
  0x2512058: cmp      w8, #0x20
  0x251205c: b.ne     #0x251206c
  0x2512060: ldr      w8, [x23, #0x28]
  0x2512064: cmp      w8, #1
  0x2512068: b.eq     #0x251203c
  0x251206c: mov      x0, x23
  0x2512070: mov      w1, w20
  0x2512074: mov      x2, xzr
  0x2512078: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x251207c: tbz      w0, #0, #0x251203c
  0x2512080: mov      w1, #0x18
  0x2512084: mov      x0, x23
  0x2512088: mov      x2, xzr
  0x251208c: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512090: tbz      w0, #0, #0x251203c
  0x2512094: ldr      x0, [x19]
  0x2512098: cbz      x0, #0x2512134
  0x251209c: ldr      w10, [x0, #0x1c]
  0x25120a0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25120a4: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x25120a8: add      w10, w10, #1
  0x25120ac: str      w10, [x0, #0x1c]
  0x25120b0: cbz      x8, #0x251212c
  0x25120b4: ldrsw    x10, [x0, #0x18]
  0x25120b8: ldr      w11, [x8, #0x18]
  0x25120bc: cmp      w10, w11
  0x25120c0: b.hs     #0x25120e4
  0x25120c4: add      w9, w10, #1
  0x25120c8: add      x8, x8, x10, lsl #3
  0x25120cc: str      w9, [x0, #0x18]
  0x25120d0: str      x23, [x8, #0x20]!
  0x25120d4: mov      x0, x8
  0x25120d8: mov      x1, x23
  0x25120dc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25120e0: b        #0x251203c
  0x25120e4: ldr      x8, [x9, #0x20]
  0x25120e8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x25120ec: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x25120f0: mov      x1, x23
  0x25120f4: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25120f8: b        #0x251203c
  0x25120fc: mov      x25, xzr
  0x2512100: mov      w23, #3
  0x2512104: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512108: add      x0, sp, #0x20
  0x251210c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512110: cbnz     x25, #0x25121ac
  0x2512114: cmp      w23, #3
  0x2512118: b.eq     #0x2511ff8
  0x251211c: cbz      w23, #0x2511ff8
  0x2512120: b        #0x2513084
  0x2512124: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512128: b        #0x25121b8
  0x251212c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512130: b        #0x25121b8
  0x2512134: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512138: b        #0x25121b8
  0x251213c: b        #0x2512150
  0x2512140: b        #0x2512150
  0x2512144: b        #0x2512150
  0x2512148: b        #0x2512150
  0x251214c: b        #0x2512150
  0x2512150: mov      x23, x0
  0x2512154: cmp      w1, #1
  0x2512158: b.ne     #0x2512188
  0x251215c: mov      x0, x23
  0x2512160: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2512164: ldr      x25, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2512168: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x251216c: mov      w23, wzr
  0x2512170: b        #0x2512104
  0x2512174: adrp     x8, #0x55a7000
  0x2512178: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x251217c: add      x0, sp, #0x40
  0x2512180: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512184: b        #0x2512310
  0x2512188: str      x1, [sp]
  0x251218c: mov      x25, xzr
  0x2512190: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512194: add      x0, sp, #0x20
  0x2512198: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251219c: cbz      x25, #0x25121e0
  0x25121a0: mov      x0, x25
  0x25121a4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25121a8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25121ac: mov      x0, x25
  0x25121b0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25121b4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25121b8: mov      x23, x0
  0x25121bc: str      x1, [sp]
  0x25121c0: b        #0x2512190
  0x25121c4: b        #0x25121d8
  0x25121c8: b        #0x25121d8
  0x25121cc: b        #0x25121d8
  0x25121d0: b        #0x25121d8
  0x25121d4: b        #0x25121d8
  0x25121d8: mov      x23, x0
  0x25121dc: str      x1, [sp]
  0x25121e0: ldr      x8, [sp]
  0x25121e4: cmp      w8, #1
  0x25121e8: b.ne     #0x2513190
  0x25121ec: mov      x0, x23
  0x25121f0: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x25121f4: ldr      x25, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x25121f8: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x25121fc: adrp     x8, #0x55a7000
  0x2512200: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x2512204: add      x0, sp, #0x40
  0x2512208: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x251220c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512210: cbnz     x25, #0x251327c
  0x2512214: mov      x0, x29
  0x2512218: mov      w1, w21
  0x251221c: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2512220: cbz      x0, #0x2512314
  0x2512224: mov      x0, x29
  0x2512228: mov      w1, w21
  0x251222c: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x2512230: cbz      x0, #0x2513178
  0x2512234: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x55a8030)
  0x2512238: cbz      x0, #0x2513178
  0x251223c: adrp     x8, #0x55a7000
  0x2512240: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512244: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512248: add      x8, sp, #8
  0x251224c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512250: ldur     q0, [sp, #8]
  0x2512254: ldr      x8, [sp, #0x18]
  0x2512258: str      q0, [sp, #0x20]
  0x251225c: str      x8, [sp, #0x30]
  0x2512260: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512264: add      x0, sp, #0x20
  0x2512268: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x251226c: tbz      w0, #0, #0x2512308
  0x2512270: ldr      x23, [sp, #0x30]
  0x2512274: cbz      x23, #0x2513114
  0x2512278: mov      x0, x23
  0x251227c: mov      w1, w20
  0x2512280: mov      x2, xzr
  0x2512284: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512288: tbz      w0, #0, #0x2512260
  0x251228c: mov      x0, x23
  0x2512290: mov      w1, w21
  0x2512294: mov      x2, xzr
  0x2512298: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x251229c: tbz      w0, #0, #0x2512260
  0x25122a0: ldr      x0, [x19]
  0x25122a4: cbz      x0, #0x2513180
  0x25122a8: ldr      w10, [x0, #0x1c]
  0x25122ac: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25122b0: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x25122b4: add      w10, w10, #1
  0x25122b8: str      w10, [x0, #0x1c]
  0x25122bc: cbz      x8, #0x2513184
  0x25122c0: ldrsw    x10, [x0, #0x18]
  0x25122c4: ldr      w11, [x8, #0x18]
  0x25122c8: cmp      w10, w11
  0x25122cc: b.hs     #0x25122f0
  0x25122d0: add      w9, w10, #1
  0x25122d4: add      x8, x8, x10, lsl #3
  0x25122d8: str      w9, [x0, #0x18]
  0x25122dc: str      x23, [x8, #0x20]!
  0x25122e0: mov      x0, x8
  0x25122e4: mov      x1, x23
  0x25122e8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25122ec: b        #0x2512260
  0x25122f0: ldr      x8, [x9, #0x20]
  0x25122f4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x25122f8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x25122fc: mov      x1, x23
  0x2512300: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512304: b        #0x2512260
  0x2512308: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x251230c: add      x0, sp, #0x20
  0x2512310: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512314: tbz      w24, #0, #0x251274c
  0x2512318: ldr      x0, [x29, #0x10]
  0x251231c: str      x29, [sp]
  0x2512320: cbz      x0, #0x2513178
  0x2512324: adrp     x8, #0x55a7000
  0x2512328: ldr      x8, [x8, #0xf10] ; = 0x0 (u64 @ 0x55a7f10)
  0x251232c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512330: add      x8, sp, #8
  0x2512334: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512338: ldur     q0, [sp, #8]
  0x251233c: ldr      x8, [sp, #0x18]
  0x2512340: adrp     x29, #0x55a8000
  0x2512344: adrp     x27, #0x55a8000
  0x2512348: ldr      x29, [x29, #0x18] ; = 0x0 (u64 @ 0x55a8018)
  0x251234c: ldr      x27, [x27, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512350: str      q0, [sp, #0x40]
  0x2512354: str      x8, [sp, #0x50]
  0x2512358: adrp     x22, #0x55a8000
  0x251235c: ldr      x22, [x22] ; = 0x0 (u64 @ 0x55a8000)
  0x2512360: adrp     x8, #0x55a7000
  0x2512364: ldr      x8, [x8, #0xf00] ; = 0x0 (u64 @ 0x55a7f00)
  0x2512368: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x251236c: add      x0, sp, #0x40
  0x2512370: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512374: tbz      w0, #0, #0x2512590
  0x2512378: ldr      x8, [sp, #0x50]
  0x251237c: cbz      x8, #0x2513104
  0x2512380: ldr      x9, [x8, #0x10] ; = 0x0 (u64 @ 0x55a7010)
  0x2512384: cbz      x9, #0x2513108
  0x2512388: ldr      w9, [x9, #0x3c]
  0x251238c: cmp      w9, #1
  0x2512390: b.le     #0x2512360
  0x2512394: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x55a7030)
  0x2512398: cbz      x0, #0x2513118
  0x251239c: adrp     x8, #0x55a7000
  0x25123a0: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x25123a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25123a8: add      x8, sp, #8
  0x25123ac: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x25123b0: ldur     q0, [sp, #8]
  0x25123b4: ldr      x8, [sp, #0x18]
  0x25123b8: str      q0, [sp, #0x20]
  0x25123bc: str      x8, [sp, #0x30]
  0x25123c0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x25123c4: add      x0, sp, #0x20
  0x25123c8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x25123cc: tbz      w0, #0, #0x25124d8
  0x25123d0: ldr      x0, [x29] ; = 0x0 (u64 @ 0x55a8000)
  0x25123d4: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x25123d8: mov      x24, x0
  0x25123dc: mov      x1, xzr
  0x25123e0: bl       #0x4955ea4 ; -> System.Object$$.ctor
  0x25123e4: cbz      x24, #0x2512508
  0x25123e8: ldr      x1, [sp, #0x30]
  0x25123ec: mov      x23, x24
  0x25123f0: str      x1, [x23, #0x10]!
  0x25123f4: mov      x0, x23
  0x25123f8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25123fc: ldr      x0, [x23]
  0x2512400: cbz      x0, #0x2512510
  0x2512404: mov      w1, w20
  0x2512408: mov      x2, xzr
  0x251240c: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512410: tbz      w0, #0, #0x25123c0
  0x2512414: ldr      x0, [x23]
  0x2512418: cbz      x0, #0x2512518
  0x251241c: mov      w1, w21
  0x2512420: mov      x2, xzr
  0x2512424: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512428: tbz      w0, #0, #0x25123c0
  0x251242c: adrp     x8, #0x55a8000
  0x2512430: ldr      x25, [x19]
  0x2512434: ldr      x8, [x8, #8] ; = 0x0 (u64 @ 0x55a8008)
  0x2512438: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55a8000)
  0x251243c: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2512440: ldr      x2, [x27] ; = 0x0 (u64 @ 0x55a8000)
  0x2512444: mov      x26, x0
  0x2512448: mov      x1, x24
  0x251244c: mov      x3, xzr
  0x2512450: bl       #0x46b4344 ; -> System.Predicate<object>$$.ctor
  0x2512454: cbz      x25, #0x2512520
  0x2512458: ldr      x2, [x22] ; = 0x0 (u64 @ 0x55a8000)
  0x251245c: mov      x0, x25
  0x2512460: mov      x1, x26
  0x2512464: bl       #0x44c9a54 ; -> System.Collections.Generic.List<object>$$Exists
  0x2512468: tbnz     w0, #0, #0x25123c0
  0x251246c: ldr      x0, [x19]
  0x2512470: cbz      x0, #0x2512528
  0x2512474: adrp     x9, #0x559a000
  0x2512478: ldr      x1, [x23]
  0x251247c: ldr      w10, [x0, #0x1c]
  0x2512480: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512484: ldr      x9, [x9, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x2512488: add      w10, w10, #1
  0x251248c: ldr      x9, [x9] ; = 0x0 (u64 @ 0x559a000)
  0x2512490: str      w10, [x0, #0x1c]
  0x2512494: cbz      x8, #0x2512530
  0x2512498: ldrsw    x10, [x0, #0x18]
  0x251249c: ldr      w11, [x8, #0x18]
  0x25124a0: cmp      w10, w11
  0x25124a4: b.hs     #0x25124c4
  0x25124a8: add      w9, w10, #1
  0x25124ac: add      x8, x8, x10, lsl #3
  0x25124b0: str      w9, [x0, #0x18]
  0x25124b4: str      x1, [x8, #0x20]!
  0x25124b8: mov      x0, x8
  0x25124bc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25124c0: b        #0x25123c0
  0x25124c4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x25124c8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a80c0)
  0x25124cc: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a8070)
  0x25124d0: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25124d4: b        #0x25123c0
  0x25124d8: mov      x25, xzr
  0x25124dc: mov      w23, #0xc
  0x25124e0: adrp     x8, #0x55a7000
  0x25124e4: ldr      x8, [x8, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x25124e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25124ec: add      x0, sp, #0x20
  0x25124f0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25124f4: cbnz     x25, #0x251311c
  0x25124f8: cmp      w23, #0xc
  0x25124fc: b.eq     #0x2512360
  0x2512500: cbz      w23, #0x2512360
  0x2512504: b        #0x2513084
  0x2512508: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251250c: b        #0x2513190
  0x2512510: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512514: b        #0x2513190
  0x2512518: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251251c: b        #0x2513190
  0x2512520: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512524: b        #0x2513190
  0x2512528: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251252c: b        #0x2513190
  0x2512530: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2512534: b        #0x2513190
  0x2512538: b        #0x2512568
  0x251253c: b        #0x2512568
  0x2512540: b        #0x2512568
  0x2512544: b        #0x2512568
  0x2512548: b        #0x2512568
  0x251254c: b        #0x2512568
  0x2512550: b        #0x2512568
  0x2512554: b        #0x2512568
  0x2512558: b        #0x2512568
  0x251255c: b        #0x2512568
  0x2512560: b        #0x2512568
  0x2512564: b        #0x2512568
  0x2512568: mov      x24, x1
  0x251256c: mov      x23, x0
  0x2512570: cmp      w24, #1
  0x2512574: b.ne     #0x25130b8
  0x2512578: mov      x0, x23
  0x251257c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2512580: ldr      x25, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2512584: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2512588: mov      w23, wzr
  0x251258c: b        #0x25124e0
  0x2512590: adrp     x8, #0x55a7000
  0x2512594: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x2512598: add      x0, sp, #0x40
  0x251259c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25125a0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25125a4: ldr      x29, [sp]
  0x25125a8: mov      w1, #7
  0x25125ac: mov      x0, x29
  0x25125b0: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x25125b4: adrp     x26, #0x55a7000
  0x25125b8: adrp     x27, #0x559a000
  0x25125bc: ldr      x26, [x26, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x25125c0: ldr      x27, [x27, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x25125c4: cbz      x0, #0x251274c
  0x25125c8: mov      w1, #7
  0x25125cc: mov      x0, x29
  0x25125d0: bl       #0x250dd38 ; -> CSkillManager$$GetSkill
  0x25125d4: cbz      x0, #0x2513178
  0x25125d8: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x55a8030)
  0x25125dc: cbz      x0, #0x2513178
  0x25125e0: adrp     x8, #0x55a7000
  0x25125e4: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x25125e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25125ec: add      x8, sp, #8
  0x25125f0: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x25125f4: ldur     q0, [sp, #8]
  0x25125f8: ldr      x8, [sp, #0x18]
  0x25125fc: adrp     x27, #0x55a8000
  0x2512600: ldr      x27, [x27, #0x28] ; = 0x0 (u64 @ 0x55a8028)
  0x2512604: str      q0, [sp, #0x20]
  0x2512608: str      x8, [sp, #0x30]
  0x251260c: adrp     x29, #0x55a8000
  0x2512610: ldr      x29, [x29, #0x20] ; = 0x0 (u64 @ 0x55a8020)
  0x2512614: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512618: add      x0, sp, #0x20
  0x251261c: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512620: tbz      w0, #0, #0x251272c
  0x2512624: ldr      x0, [x27] ; = 0x0 (u64 @ 0x55a8000)
  0x2512628: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x251262c: mov      x24, x0
  0x2512630: mov      x1, xzr
  0x2512634: bl       #0x4955ea4 ; -> System.Object$$.ctor
  0x2512638: cbz      x24, #0x251310c
  0x251263c: ldr      x1, [sp, #0x30]
  0x2512640: mov      x23, x24
  0x2512644: str      x1, [x23, #0x10]!
  0x2512648: mov      x0, x23
  0x251264c: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512650: ldr      x0, [x23]
  0x2512654: cbz      x0, #0x2513110
  0x2512658: mov      w1, w20
  0x251265c: mov      x2, xzr
  0x2512660: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512664: tbz      w0, #0, #0x2512614
  0x2512668: ldr      x0, [x23]
  0x251266c: cbz      x0, #0x2513154
  0x2512670: mov      w1, w21
  0x2512674: mov      x2, xzr
  0x2512678: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x251267c: tbz      w0, #0, #0x2512614
  0x2512680: adrp     x8, #0x55a8000
  0x2512684: ldr      x25, [x19]
  0x2512688: ldr      x8, [x8, #8] ; = 0x0 (u64 @ 0x55a8008)
  0x251268c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55a8000)
  0x2512690: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2512694: ldr      x2, [x29] ; = 0x0 (u64 @ 0x55a8000)
  0x2512698: mov      x26, x0
  0x251269c: mov      x1, x24
  0x25126a0: mov      x3, xzr
  0x25126a4: bl       #0x46b4344 ; -> System.Predicate<object>$$.ctor
  0x25126a8: cbz      x25, #0x251317c
  0x25126ac: ldr      x2, [x22] ; = 0x0 (u64 @ 0x55a8000)
  0x25126b0: mov      x0, x25
  0x25126b4: mov      x1, x26
  0x25126b8: bl       #0x44c9a54 ; -> System.Collections.Generic.List<object>$$Exists
  0x25126bc: tbnz     w0, #0, #0x2512614
  0x25126c0: ldr      x0, [x19]
  0x25126c4: cbz      x0, #0x2513188
  0x25126c8: adrp     x9, #0x559a000
  0x25126cc: ldr      x1, [x23]
  0x25126d0: ldr      w10, [x0, #0x1c]
  0x25126d4: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25126d8: ldr      x9, [x9, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x25126dc: add      w10, w10, #1
  0x25126e0: ldr      x9, [x9] ; = 0x0 (u64 @ 0x559a000)
  0x25126e4: str      w10, [x0, #0x1c]
  0x25126e8: cbz      x8, #0x251318c
  0x25126ec: ldrsw    x10, [x0, #0x18]
  0x25126f0: ldr      w11, [x8, #0x18]
  0x25126f4: cmp      w10, w11
  0x25126f8: b.hs     #0x2512718
  0x25126fc: add      w9, w10, #1
  0x2512700: add      x8, x8, x10, lsl #3
  0x2512704: str      w9, [x0, #0x18]
  0x2512708: str      x1, [x8, #0x20]!
  0x251270c: mov      x0, x8
  0x2512710: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512714: b        #0x2512614
  0x2512718: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x251271c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a80c0)
  0x2512720: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a8070)
  0x2512724: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512728: b        #0x2512614
  0x251272c: adrp     x26, #0x55a7000
  0x2512730: ldr      x26, [x26, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x2512734: add      x0, sp, #0x20
  0x2512738: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x251273c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512740: adrp     x27, #0x559a000
  0x2512744: ldr      x27, [x27, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x2512748: ldr      x29, [sp]
  0x251274c: ldr      x0, [x29, #0x18] ; = 0x0 (u64 @ 0x55a8018)
  0x2512750: cbz      x0, #0x2513178
  0x2512754: adrp     x8, #0x55a7000
  0x2512758: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x251275c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512760: add      x8, sp, #8
  0x2512764: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512768: ldur     q0, [sp, #8]
  0x251276c: ldr      x8, [sp, #0x18]
  0x2512770: str      q0, [sp, #0x20]
  0x2512774: str      x8, [sp, #0x30]
  0x2512778: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x251277c: add      x0, sp, #0x20
  0x2512780: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512784: tbz      w0, #0, #0x2512838
  0x2512788: ldr      x23, [sp, #0x30]
  0x251278c: cbz      x23, #0x25130dc
  0x2512790: ldr      w8, [x23, #0x24]
  0x2512794: cmp      w8, #0x20
  0x2512798: b.ne     #0x25127a8
  0x251279c: ldr      w8, [x23, #0x28]
  0x25127a0: cmp      w8, #1
  0x25127a4: b.eq     #0x2512778
  0x25127a8: mov      x0, x23
  0x25127ac: mov      w1, w20
  0x25127b0: mov      x2, xzr
  0x25127b4: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x25127b8: tbz      w0, #0, #0x2512778
  0x25127bc: mov      x0, x23
  0x25127c0: mov      w1, w21
  0x25127c4: mov      x2, xzr
  0x25127c8: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x25127cc: tbz      w0, #0, #0x2512778
  0x25127d0: ldr      x0, [x19]
  0x25127d4: cbz      x0, #0x2513128
  0x25127d8: ldr      w10, [x0, #0x1c]
  0x25127dc: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25127e0: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x25127e4: add      w10, w10, #1
  0x25127e8: str      w10, [x0, #0x1c]
  0x25127ec: cbz      x8, #0x2513124
  0x25127f0: ldrsw    x10, [x0, #0x18]
  0x25127f4: ldr      w11, [x8, #0x18]
  0x25127f8: cmp      w10, w11
  0x25127fc: b.hs     #0x2512820
  0x2512800: add      w9, w10, #1
  0x2512804: add      x8, x8, x10, lsl #3
  0x2512808: str      w9, [x0, #0x18]
  0x251280c: str      x23, [x8, #0x20]!
  0x2512810: mov      x0, x8
  0x2512814: mov      x1, x23
  0x2512818: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x251281c: b        #0x2512778
  0x2512820: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512824: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512828: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x251282c: mov      x1, x23
  0x2512830: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512834: b        #0x2512778
  0x2512838: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x251283c: add      x0, sp, #0x20
  0x2512840: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512844: ldr      x0, [x29, #0x20] ; = 0x0 (u64 @ 0x55a8020)
  0x2512848: cbz      x0, #0x2512924
  0x251284c: adrp     x8, #0x55a7000
  0x2512850: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512854: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512858: add      x8, sp, #8
  0x251285c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512860: ldur     q0, [sp, #8]
  0x2512864: ldr      x8, [sp, #0x18]
  0x2512868: str      q0, [sp, #0x20]
  0x251286c: str      x8, [sp, #0x30]
  0x2512870: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512874: add      x0, sp, #0x20
  0x2512878: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x251287c: tbz      w0, #0, #0x2512918
  0x2512880: ldr      x23, [sp, #0x30]
  0x2512884: cbz      x23, #0x25130f0
  0x2512888: mov      x0, x23
  0x251288c: mov      w1, w20
  0x2512890: mov      x2, xzr
  0x2512894: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512898: tbz      w0, #0, #0x2512870
  0x251289c: mov      x0, x23
  0x25128a0: mov      w1, w21
  0x25128a4: mov      x2, xzr
  0x25128a8: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x25128ac: tbz      w0, #0, #0x2512870
  0x25128b0: ldr      x0, [x19]
  0x25128b4: cbz      x0, #0x251312c
  0x25128b8: ldr      w10, [x0, #0x1c]
  0x25128bc: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25128c0: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x25128c4: add      w10, w10, #1
  0x25128c8: str      w10, [x0, #0x1c]
  0x25128cc: cbz      x8, #0x2513140
  0x25128d0: ldrsw    x10, [x0, #0x18]
  0x25128d4: ldr      w11, [x8, #0x18]
  0x25128d8: cmp      w10, w11
  0x25128dc: b.hs     #0x2512900
  0x25128e0: add      w9, w10, #1
  0x25128e4: add      x8, x8, x10, lsl #3
  0x25128e8: str      w9, [x0, #0x18]
  0x25128ec: str      x23, [x8, #0x20]!
  0x25128f0: mov      x0, x8
  0x25128f4: mov      x1, x23
  0x25128f8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25128fc: b        #0x2512870
  0x2512900: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512904: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512908: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x251290c: mov      x1, x23
  0x2512910: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512914: b        #0x2512870
  0x2512918: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x251291c: add      x0, sp, #0x20
  0x2512920: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512924: ldr      x0, [x29, #0x28] ; = 0x0 (u64 @ 0x55a8028)
  0x2512928: cbz      x0, #0x2512a04
  0x251292c: adrp     x8, #0x55a7000
  0x2512930: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512934: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512938: add      x8, sp, #8
  0x251293c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512940: ldur     q0, [sp, #8]
  0x2512944: ldr      x8, [sp, #0x18]
  0x2512948: str      q0, [sp, #0x20]
  0x251294c: str      x8, [sp, #0x30]
  0x2512950: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512954: add      x0, sp, #0x20
  0x2512958: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x251295c: tbz      w0, #0, #0x25129f8
  0x2512960: ldr      x23, [sp, #0x30]
  0x2512964: cbz      x23, #0x25130f4
  0x2512968: mov      x0, x23
  0x251296c: mov      w1, w20
  0x2512970: mov      x2, xzr
  0x2512974: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512978: tbz      w0, #0, #0x2512950
  0x251297c: mov      x0, x23
  0x2512980: mov      w1, w21
  0x2512984: mov      x2, xzr
  0x2512988: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x251298c: tbz      w0, #0, #0x2512950
  0x2512990: ldr      x0, [x19]
  0x2512994: cbz      x0, #0x2513130
  0x2512998: ldr      w10, [x0, #0x1c]
  0x251299c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x25129a0: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x25129a4: add      w10, w10, #1
  0x25129a8: str      w10, [x0, #0x1c]
  0x25129ac: cbz      x8, #0x2513144
  0x25129b0: ldrsw    x10, [x0, #0x18]
  0x25129b4: ldr      w11, [x8, #0x18]
  0x25129b8: cmp      w10, w11
  0x25129bc: b.hs     #0x25129e0
  0x25129c0: add      w9, w10, #1
  0x25129c4: add      x8, x8, x10, lsl #3
  0x25129c8: str      w9, [x0, #0x18]
  0x25129cc: str      x23, [x8, #0x20]!
  0x25129d0: mov      x0, x8
  0x25129d4: mov      x1, x23
  0x25129d8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x25129dc: b        #0x2512950
  0x25129e0: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x25129e4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x25129e8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x25129ec: mov      x1, x23
  0x25129f0: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x25129f4: b        #0x2512950
  0x25129f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25129fc: add      x0, sp, #0x20
  0x2512a00: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512a04: ldr      x0, [x29, #0x30] ; = 0x0 (u64 @ 0x55a8030)
  0x2512a08: cbz      x0, #0x2512ae4
  0x2512a0c: adrp     x8, #0x55a7000
  0x2512a10: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512a14: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512a18: add      x8, sp, #8
  0x2512a1c: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512a20: ldur     q0, [sp, #8]
  0x2512a24: ldr      x8, [sp, #0x18]
  0x2512a28: str      q0, [sp, #0x20]
  0x2512a2c: str      x8, [sp, #0x30]
  0x2512a30: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512a34: add      x0, sp, #0x20
  0x2512a38: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512a3c: tbz      w0, #0, #0x2512ad8
  0x2512a40: ldr      x23, [sp, #0x30]
  0x2512a44: cbz      x23, #0x25130f8
  0x2512a48: mov      x0, x23
  0x2512a4c: mov      w1, w20
  0x2512a50: mov      x2, xzr
  0x2512a54: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512a58: tbz      w0, #0, #0x2512a30
  0x2512a5c: mov      x0, x23
  0x2512a60: mov      w1, w21
  0x2512a64: mov      x2, xzr
  0x2512a68: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512a6c: tbz      w0, #0, #0x2512a30
  0x2512a70: ldr      x0, [x19]
  0x2512a74: cbz      x0, #0x2513134
  0x2512a78: ldr      w10, [x0, #0x1c]
  0x2512a7c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512a80: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512a84: add      w10, w10, #1
  0x2512a88: str      w10, [x0, #0x1c]
  0x2512a8c: cbz      x8, #0x2513148
  0x2512a90: ldrsw    x10, [x0, #0x18]
  0x2512a94: ldr      w11, [x8, #0x18]
  0x2512a98: cmp      w10, w11
  0x2512a9c: b.hs     #0x2512ac0
  0x2512aa0: add      w9, w10, #1
  0x2512aa4: add      x8, x8, x10, lsl #3
  0x2512aa8: str      w9, [x0, #0x18]
  0x2512aac: str      x23, [x8, #0x20]!
  0x2512ab0: mov      x0, x8
  0x2512ab4: mov      x1, x23
  0x2512ab8: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512abc: b        #0x2512a30
  0x2512ac0: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512ac4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512ac8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512acc: mov      x1, x23
  0x2512ad0: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512ad4: b        #0x2512a30
  0x2512ad8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512adc: add      x0, sp, #0x20
  0x2512ae0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512ae4: ldr      x0, [x29, #0x38] ; = 0x0 (u64 @ 0x55a8038)
  0x2512ae8: cbz      x0, #0x2512bc4
  0x2512aec: adrp     x8, #0x55a7000
  0x2512af0: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512af4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512af8: add      x8, sp, #8
  0x2512afc: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512b00: ldur     q0, [sp, #8]
  0x2512b04: ldr      x8, [sp, #0x18]
  0x2512b08: str      q0, [sp, #0x20]
  0x2512b0c: str      x8, [sp, #0x30]
  0x2512b10: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512b14: add      x0, sp, #0x20
  0x2512b18: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512b1c: tbz      w0, #0, #0x2512bb8
  0x2512b20: ldr      x23, [sp, #0x30]
  0x2512b24: cbz      x23, #0x25130fc
  0x2512b28: mov      x0, x23
  0x2512b2c: mov      w1, w20
  0x2512b30: mov      x2, xzr
  0x2512b34: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512b38: tbz      w0, #0, #0x2512b10
  0x2512b3c: mov      x0, x23
  0x2512b40: mov      w1, w21
  0x2512b44: mov      x2, xzr
  0x2512b48: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512b4c: tbz      w0, #0, #0x2512b10
  0x2512b50: ldr      x0, [x19]
  0x2512b54: cbz      x0, #0x2513138
  0x2512b58: ldr      w10, [x0, #0x1c]
  0x2512b5c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512b60: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512b64: add      w10, w10, #1
  0x2512b68: str      w10, [x0, #0x1c]
  0x2512b6c: cbz      x8, #0x251314c
  0x2512b70: ldrsw    x10, [x0, #0x18]
  0x2512b74: ldr      w11, [x8, #0x18]
  0x2512b78: cmp      w10, w11
  0x2512b7c: b.hs     #0x2512ba0
  0x2512b80: add      w9, w10, #1
  0x2512b84: add      x8, x8, x10, lsl #3
  0x2512b88: str      w9, [x0, #0x18]
  0x2512b8c: str      x23, [x8, #0x20]!
  0x2512b90: mov      x0, x8
  0x2512b94: mov      x1, x23
  0x2512b98: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512b9c: b        #0x2512b10
  0x2512ba0: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512ba4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512ba8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512bac: mov      x1, x23
  0x2512bb0: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512bb4: b        #0x2512b10
  0x2512bb8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512bbc: add      x0, sp, #0x20
  0x2512bc0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512bc4: ldr      x0, [x29, #0x58] ; = 0x0 (u64 @ 0x55a8058)
  0x2512bc8: cbz      x0, #0x2512ca4
  0x2512bcc: adrp     x8, #0x55a7000
  0x2512bd0: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512bd4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512bd8: add      x8, sp, #8
  0x2512bdc: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512be0: ldur     q0, [sp, #8]
  0x2512be4: ldr      x8, [sp, #0x18]
  0x2512be8: str      q0, [sp, #0x20]
  0x2512bec: str      x8, [sp, #0x30]
  0x2512bf0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512bf4: add      x0, sp, #0x20
  0x2512bf8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512bfc: tbz      w0, #0, #0x2512c98
  0x2512c00: ldr      x23, [sp, #0x30]
  0x2512c04: cbz      x23, #0x2513100
  0x2512c08: mov      x0, x23
  0x2512c0c: mov      w1, w20
  0x2512c10: mov      x2, xzr
  0x2512c14: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512c18: tbz      w0, #0, #0x2512bf0
  0x2512c1c: mov      x0, x23
  0x2512c20: mov      w1, w21
  0x2512c24: mov      x2, xzr
  0x2512c28: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512c2c: tbz      w0, #0, #0x2512bf0
  0x2512c30: ldr      x0, [x19]
  0x2512c34: cbz      x0, #0x251313c
  0x2512c38: ldr      w10, [x0, #0x1c]
  0x2512c3c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512c40: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512c44: add      w10, w10, #1
  0x2512c48: str      w10, [x0, #0x1c]
  0x2512c4c: cbz      x8, #0x2513150
  0x2512c50: ldrsw    x10, [x0, #0x18]
  0x2512c54: ldr      w11, [x8, #0x18]
  0x2512c58: cmp      w10, w11
  0x2512c5c: b.hs     #0x2512c80
  0x2512c60: add      w9, w10, #1
  0x2512c64: add      x8, x8, x10, lsl #3
  0x2512c68: str      w9, [x0, #0x18]
  0x2512c6c: str      x23, [x8, #0x20]!
  0x2512c70: mov      x0, x8
  0x2512c74: mov      x1, x23
  0x2512c78: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512c7c: b        #0x2512bf0
  0x2512c80: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512c84: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512c88: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512c8c: mov      x1, x23
  0x2512c90: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512c94: b        #0x2512bf0
  0x2512c98: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512c9c: add      x0, sp, #0x20
  0x2512ca0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512ca4: ldr      x0, [x29, #0x40] ; = 0x0 (u64 @ 0x55a8040)
  0x2512ca8: cbz      x0, #0x2512d9c
  0x2512cac: adrp     x8, #0x55a7000
  0x2512cb0: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512cb4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512cb8: add      x8, sp, #8
  0x2512cbc: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512cc0: ldur     q0, [sp, #8]
  0x2512cc4: ldr      x8, [sp, #0x18]
  0x2512cc8: str      q0, [sp, #0x20]
  0x2512ccc: str      x8, [sp, #0x30]
  0x2512cd0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512cd4: add      x0, sp, #0x20
  0x2512cd8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512cdc: tbz      w0, #0, #0x2512d90
  0x2512ce0: ldr      x23, [sp, #0x30]
  0x2512ce4: cbz      x23, #0x25130e0
  0x2512ce8: ldr      w8, [x23, #0x24]
  0x2512cec: cmp      w8, #0x20
  0x2512cf0: b.ne     #0x2512d00
  0x2512cf4: ldr      w8, [x23, #0x28]
  0x2512cf8: cmp      w8, #1
  0x2512cfc: b.eq     #0x2512cd0
  0x2512d00: mov      x0, x23
  0x2512d04: mov      w1, w20
  0x2512d08: mov      x2, xzr
  0x2512d0c: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512d10: tbz      w0, #0, #0x2512cd0
  0x2512d14: mov      x0, x23
  0x2512d18: mov      w1, w21
  0x2512d1c: mov      x2, xzr
  0x2512d20: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512d24: tbz      w0, #0, #0x2512cd0
  0x2512d28: ldr      x0, [x19]
  0x2512d2c: cbz      x0, #0x2513160
  0x2512d30: ldr      w10, [x0, #0x1c]
  0x2512d34: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512d38: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512d3c: add      w10, w10, #1
  0x2512d40: str      w10, [x0, #0x1c]
  0x2512d44: cbz      x8, #0x2513158
  0x2512d48: ldrsw    x10, [x0, #0x18]
  0x2512d4c: ldr      w11, [x8, #0x18]
  0x2512d50: cmp      w10, w11
  0x2512d54: b.hs     #0x2512d78
  0x2512d58: add      w9, w10, #1
  0x2512d5c: add      x8, x8, x10, lsl #3
  0x2512d60: str      w9, [x0, #0x18]
  0x2512d64: str      x23, [x8, #0x20]!
  0x2512d68: mov      x0, x8
  0x2512d6c: mov      x1, x23
  0x2512d70: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512d74: b        #0x2512cd0
  0x2512d78: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512d7c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512d80: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512d84: mov      x1, x23
  0x2512d88: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512d8c: b        #0x2512cd0
  0x2512d90: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512d94: add      x0, sp, #0x20
  0x2512d98: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512d9c: ldr      x0, [x29, #0x48] ; = 0x0 (u64 @ 0x55a8048)
  0x2512da0: cbz      x0, #0x2512e94
  0x2512da4: adrp     x8, #0x55a7000
  0x2512da8: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512dac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512db0: add      x8, sp, #8
  0x2512db4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512db8: ldur     q0, [sp, #8]
  0x2512dbc: ldr      x8, [sp, #0x18]
  0x2512dc0: str      q0, [sp, #0x20]
  0x2512dc4: str      x8, [sp, #0x30]
  0x2512dc8: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512dcc: add      x0, sp, #0x20
  0x2512dd0: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512dd4: tbz      w0, #0, #0x2512e88
  0x2512dd8: ldr      x23, [sp, #0x30]
  0x2512ddc: cbz      x23, #0x25130e4
  0x2512de0: ldr      w8, [x23, #0x24]
  0x2512de4: cmp      w8, #0x20
  0x2512de8: b.ne     #0x2512df8
  0x2512dec: ldr      w8, [x23, #0x28]
  0x2512df0: cmp      w8, #1
  0x2512df4: b.eq     #0x2512dc8
  0x2512df8: mov      x0, x23
  0x2512dfc: mov      w1, w20
  0x2512e00: mov      x2, xzr
  0x2512e04: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512e08: tbz      w0, #0, #0x2512dc8
  0x2512e0c: mov      x0, x23
  0x2512e10: mov      w1, w21
  0x2512e14: mov      x2, xzr
  0x2512e18: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512e1c: tbz      w0, #0, #0x2512dc8
  0x2512e20: ldr      x0, [x19]
  0x2512e24: cbz      x0, #0x2513168
  0x2512e28: ldr      w10, [x0, #0x1c]
  0x2512e2c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512e30: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512e34: add      w10, w10, #1
  0x2512e38: str      w10, [x0, #0x1c]
  0x2512e3c: cbz      x8, #0x251315c
  0x2512e40: ldrsw    x10, [x0, #0x18]
  0x2512e44: ldr      w11, [x8, #0x18]
  0x2512e48: cmp      w10, w11
  0x2512e4c: b.hs     #0x2512e70
  0x2512e50: add      w9, w10, #1
  0x2512e54: add      x8, x8, x10, lsl #3
  0x2512e58: str      w9, [x0, #0x18]
  0x2512e5c: str      x23, [x8, #0x20]!
  0x2512e60: mov      x0, x8
  0x2512e64: mov      x1, x23
  0x2512e68: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512e6c: b        #0x2512dc8
  0x2512e70: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512e74: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512e78: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512e7c: mov      x1, x23
  0x2512e80: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512e84: b        #0x2512dc8
  0x2512e88: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512e8c: add      x0, sp, #0x20
  0x2512e90: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512e94: ldr      x0, [x29, #0x50] ; = 0x0 (u64 @ 0x55a8050)
  0x2512e98: cbz      x0, #0x2512f8c
  0x2512e9c: adrp     x8, #0x55a7000
  0x2512ea0: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512ea4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512ea8: add      x8, sp, #8
  0x2512eac: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512eb0: ldur     q0, [sp, #8]
  0x2512eb4: ldr      x8, [sp, #0x18]
  0x2512eb8: str      q0, [sp, #0x20]
  0x2512ebc: str      x8, [sp, #0x30]
  0x2512ec0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512ec4: add      x0, sp, #0x20
  0x2512ec8: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512ecc: tbz      w0, #0, #0x2512f80
  0x2512ed0: ldr      x23, [sp, #0x30]
  0x2512ed4: cbz      x23, #0x25130e8
  0x2512ed8: ldr      w8, [x23, #0x24]
  0x2512edc: cmp      w8, #0x20
  0x2512ee0: b.ne     #0x2512ef0
  0x2512ee4: ldr      w8, [x23, #0x28]
  0x2512ee8: cmp      w8, #1
  0x2512eec: b.eq     #0x2512ec0
  0x2512ef0: mov      x0, x23
  0x2512ef4: mov      w1, w20
  0x2512ef8: mov      x2, xzr
  0x2512efc: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512f00: tbz      w0, #0, #0x2512ec0
  0x2512f04: mov      x0, x23
  0x2512f08: mov      w1, w21
  0x2512f0c: mov      x2, xzr
  0x2512f10: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x2512f14: tbz      w0, #0, #0x2512ec0
  0x2512f18: ldr      x0, [x19]
  0x2512f1c: cbz      x0, #0x2513170
  0x2512f20: ldr      w10, [x0, #0x1c]
  0x2512f24: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2512f28: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2512f2c: add      w10, w10, #1
  0x2512f30: str      w10, [x0, #0x1c]
  0x2512f34: cbz      x8, #0x2513164
  0x2512f38: ldrsw    x10, [x0, #0x18]
  0x2512f3c: ldr      w11, [x8, #0x18]
  0x2512f40: cmp      w10, w11
  0x2512f44: b.hs     #0x2512f68
  0x2512f48: add      w9, w10, #1
  0x2512f4c: add      x8, x8, x10, lsl #3
  0x2512f50: str      w9, [x0, #0x18]
  0x2512f54: str      x23, [x8, #0x20]!
  0x2512f58: mov      x0, x8
  0x2512f5c: mov      x1, x23
  0x2512f60: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2512f64: b        #0x2512ec0
  0x2512f68: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2512f6c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2512f70: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x2512f74: mov      x1, x23
  0x2512f78: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2512f7c: b        #0x2512ec0
  0x2512f80: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2512f84: add      x0, sp, #0x20
  0x2512f88: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2512f8c: ldr      x0, [x29, #0x60] ; = 0x0 (u64 @ 0x55a8060)
  0x2512f90: cbz      x0, #0x2513098
  0x2512f94: adrp     x8, #0x55a7000
  0x2512f98: ldr      x8, [x8, #0xe78] ; = 0x0 (u64 @ 0x55a7e78)
  0x2512f9c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2512fa0: add      x8, sp, #8
  0x2512fa4: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2512fa8: ldur     q0, [sp, #8]
  0x2512fac: ldr      x8, [sp, #0x18]
  0x2512fb0: str      q0, [sp, #0x20]
  0x2512fb4: str      x8, [sp, #0x30]
  0x2512fb8: ldr      x1, [x28] ; = 0x0 (u64 @ 0x55a7000)
  0x2512fbc: add      x0, sp, #0x20
  0x2512fc0: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2512fc4: tbz      w0, #0, #0x2513078
  0x2512fc8: ldr      x22, [sp, #0x30]
  0x2512fcc: cbz      x22, #0x25130ec
  0x2512fd0: ldr      w8, [x22, #0x24]
  0x2512fd4: cmp      w8, #0x20
  0x2512fd8: b.ne     #0x2512fe8
  0x2512fdc: ldr      w8, [x22, #0x28]
  0x2512fe0: cmp      w8, #1
  0x2512fe4: b.eq     #0x2512fb8
  0x2512fe8: mov      x0, x22
  0x2512fec: mov      w1, w20
  0x2512ff0: mov      x2, xzr
  0x2512ff4: bl       #0x25f4150 ; -> CBuffTemplet$$IsBuffCreateType
  0x2512ff8: tbz      w0, #0, #0x2512fb8
  0x2512ffc: mov      x0, x22
  0x2513000: mov      w1, w21
  0x2513004: mov      x2, xzr
  0x2513008: bl       #0x25f4160 ; -> CBuffTemplet$$IsCallerSkillType
  0x251300c: tbz      w0, #0, #0x2512fb8
  0x2513010: ldr      x0, [x19]
  0x2513014: cbz      x0, #0x2513174
  0x2513018: ldr      w10, [x0, #0x1c]
  0x251301c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55a8010)
  0x2513020: ldr      x9, [x27] ; = 0x0 (u64 @ 0x559a000)
  0x2513024: add      w10, w10, #1
  0x2513028: str      w10, [x0, #0x1c]
  0x251302c: cbz      x8, #0x251316c
  0x2513030: ldrsw    x10, [x0, #0x18]
  0x2513034: ldr      w11, [x8, #0x18]
  0x2513038: cmp      w10, w11
  0x251303c: b.hs     #0x2513060
  0x2513040: add      w9, w10, #1
  0x2513044: add      x8, x8, x10, lsl #3
  0x2513048: str      w9, [x0, #0x18]
  0x251304c: str      x22, [x8, #0x20]!
  0x2513050: mov      x0, x8
  0x2513054: mov      x1, x22
  0x2513058: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x251305c: b        #0x2512fb8
  0x2513060: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x559a020)
  0x2513064: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55a70c0)
  0x2513068: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55a7070)
  0x251306c: mov      x1, x22
  0x2513070: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2513074: b        #0x2512fb8
  0x2513078: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x251307c: add      x0, sp, #0x20
  0x2513080: b        #0x2513094
  0x2513084: adrp     x8, #0x55a7000
  0x2513088: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x251308c: add      x0, sp, #0x40
  0x2513090: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2513094: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513098: ldp      x20, x19, [sp, #0xb0]
  0x251309c: ldp      x22, x21, [sp, #0xa0]
  0x25130a0: ldp      x24, x23, [sp, #0x90]
  0x25130a4: ldp      x26, x25, [sp, #0x80]
  0x25130a8: ldp      x28, x27, [sp, #0x70]
  0x25130ac: ldp      x29, x30, [sp, #0x60]
  0x25130b0: add      sp, sp, #0xc0
  0x25130b4: ret      
  0x25130b8: mov      x25, xzr
  0x25130bc: adrp     x8, #0x55a7000
  0x25130c0: ldr      x8, [x8, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x25130c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25130c8: add      x0, sp, #0x20
  0x25130cc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25130d0: cbz      x25, #0x25132fc
  0x25130d4: mov      x0, x25
  0x25130d8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25130dc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130e0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130e4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130e8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130ec: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130f0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130f8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25130fc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513100: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513104: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513108: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251310c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513110: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513114: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513118: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251311c: mov      x0, x25
  0x2513120: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513124: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513128: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251312c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513130: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513134: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513138: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251313c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513140: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513144: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513148: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251314c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513150: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513154: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513158: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251315c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513160: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513164: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513168: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251316c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513170: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513174: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513178: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251317c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513180: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513184: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513188: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x251318c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2513190: mov      x25, xzr
  0x2513194: b        #0x251319c
  0x2513198: mov      x23, x0
  0x251319c: adrp     x8, #0x55a7000
  0x25131a0: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x25131a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25131a8: add      x0, sp, #0x40
  0x25131ac: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25131b0: cbz      x25, #0x2513764
  0x25131b4: mov      x0, x25
  0x25131b8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25131bc: mov      x24, x1
  0x25131c0: mov      x23, x0
  0x25131c4: b        #0x25130bc
  0x25131c8: b        #0x251336c
  0x25131cc: b        #0x2513250
  0x25131d0: b        #0x251336c
  0x25131d4: b        #0x251336c
  0x25131d8: b        #0x251336c
  0x25131dc: b        #0x25135b8
  0x25131e0: b        #0x2513610
  0x25131e4: b        #0x2513664
  0x25131e8: b        #0x25136b8
  0x25131ec: b        #0x2513250
  0x25131f0: b        #0x2513250
  0x25131f4: b        #0x251336c
  0x25131f8: b        #0x251336c
  0x25131fc: b        #0x251336c
  0x2513200: b        #0x2513414
  0x2513204: b        #0x2513468
  0x2513208: b        #0x25134bc
  0x251320c: b        #0x2513510
  0x2513210: b        #0x2513564
  0x2513214: b        #0x2513714
  0x2513218: b        #0x25132f4
  0x251321c: b        #0x25132f4
  0x2513220: b        #0x25132f4
  0x2513224: b        #0x25132f4
  0x2513228: b        #0x25135b8
  0x251322c: b        #0x2513610
  0x2513230: b        #0x2513664
  0x2513234: b        #0x25135b8
  0x2513238: b        #0x25136b8
  0x251323c: b        #0x2513610
  0x2513240: b        #0x2513664
  0x2513244: b        #0x25136b8
  0x2513248: b        #0x2513250
  0x251324c: b        #0x2513250
  0x2513250: mov      x23, x0
  0x2513254: cmp      w1, #1
  0x2513258: b.ne     #0x2513284
  0x251325c: mov      x0, x23
  0x2513260: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513264: ldr      x25, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513268: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x251326c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513270: add      x0, sp, #0x20
  0x2513274: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513278: cbz      x25, #0x2512314
  0x251327c: mov      x0, x25
  0x2513280: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513284: mov      x25, xzr
  0x2513288: b        #0x2513290
  0x251328c: mov      x23, x0
  0x2513290: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513294: add      x0, sp, #0x20
  0x2513298: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251329c: cbz      x25, #0x2513764
  0x25132a0: mov      x0, x25
  0x25132a4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25132a8: b        #0x251336c
  0x25132ac: b        #0x251336c
  0x25132b0: b        #0x251336c
  0x25132b4: b        #0x251336c
  0x25132b8: b        #0x251336c
  0x25132bc: b        #0x2513414
  0x25132c0: b        #0x2513468
  0x25132c4: b        #0x25134bc
  0x25132c8: b        #0x2513510
  0x25132cc: b        #0x2513564
  0x25132d0: b        #0x2513414
  0x25132d4: b        #0x2513468
  0x25132d8: b        #0x25134bc
  0x25132dc: b        #0x2513510
  0x25132e0: b        #0x2513564
  0x25132e4: b        #0x2513714
  0x25132e8: b        #0x2513714
  0x25132ec: b        #0x25132f4
  0x25132f0: b        #0x25132f4
  0x25132f4: mov      x24, x1
  0x25132f8: mov      x23, x0
  0x25132fc: cmp      w24, #1
  0x2513300: b.ne     #0x2513330
  0x2513304: mov      x0, x23
  0x2513308: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x251330c: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513310: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513314: adrp     x8, #0x55a7000
  0x2513318: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x251331c: add      x0, sp, #0x40
  0x2513320: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2513324: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513328: cbz      x24, #0x25125a4
  0x251332c: b        #0x2513740
  0x2513330: mov      x24, xzr
  0x2513334: b        #0x251333c
  0x2513338: mov      x23, x0
  0x251333c: adrp     x8, #0x55a7000
  0x2513340: ldr      x8, [x8, #0xef8] ; = 0x0 (u64 @ 0x55a7ef8)
  0x2513344: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x2513348: add      x0, sp, #0x40
  0x251334c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513350: cbz      x24, #0x2513764
  0x2513354: mov      x0, x24
  0x2513358: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x251335c: b        #0x25135b8
  0x2513360: b        #0x2513610
  0x2513364: b        #0x2513664
  0x2513368: b        #0x25136b8
  0x251336c: mov      x23, x0
  0x2513370: cmp      w1, #1
  0x2513374: b.ne     #0x25133b0
  0x2513378: mov      x0, x23
  0x251337c: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513380: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513384: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513388: adrp     x26, #0x55a7000
  0x251338c: ldr      x26, [x26, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x2513390: add      x0, sp, #0x20
  0x2513394: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513398: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251339c: adrp     x27, #0x559a000
  0x25133a0: ldr      x27, [x27, #0x420] ; = 0x0 (u64 @ 0x559a420)
  0x25133a4: ldr      x29, [sp]
  0x25133a8: cbz      x24, #0x251274c
  0x25133ac: b        #0x2513740
  0x25133b0: mov      x24, xzr
  0x25133b4: b        #0x25133bc
  0x25133b8: mov      x23, x0
  0x25133bc: adrp     x8, #0x55a7000
  0x25133c0: ldr      x8, [x8, #0xe60] ; = 0x0 (u64 @ 0x55a7e60)
  0x25133c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55a7000)
  0x25133c8: add      x0, sp, #0x20
  0x25133cc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25133d0: cbz      x24, #0x2513764
  0x25133d4: mov      x0, x24
  0x25133d8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25133dc: b        #0x2513414
  0x25133e0: b        #0x2513468
  0x25133e4: b        #0x25134bc
  0x25133e8: b        #0x2513510
  0x25133ec: b        #0x2513414
  0x25133f0: b        #0x2513564
  0x25133f4: b        #0x2513468
  0x25133f8: b        #0x25134bc
  0x25133fc: b        #0x2513510
  0x2513400: b        #0x2513564
  0x2513404: b        #0x25135b8
  0x2513408: b        #0x2513610
  0x251340c: b        #0x2513664
  0x2513410: b        #0x25136b8
  0x2513414: mov      x23, x0
  0x2513418: cmp      w1, #1
  0x251341c: b.ne     #0x2513444
  0x2513420: mov      x0, x23
  0x2513424: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513428: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x251342c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513430: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513434: add      x0, sp, #0x20
  0x2513438: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251343c: cbz      x24, #0x2512ca4
  0x2513440: b        #0x2513740
  0x2513444: mov      x24, xzr
  0x2513448: b        #0x2513450
  0x251344c: mov      x23, x0
  0x2513450: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513454: add      x0, sp, #0x20
  0x2513458: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251345c: cbz      x24, #0x2513764
  0x2513460: mov      x0, x24
  0x2513464: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513468: mov      x23, x0
  0x251346c: cmp      w1, #1
  0x2513470: b.ne     #0x2513498
  0x2513474: mov      x0, x23
  0x2513478: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x251347c: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513480: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513484: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513488: add      x0, sp, #0x20
  0x251348c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513490: cbz      x24, #0x2512bc4
  0x2513494: b        #0x2513740
  0x2513498: mov      x24, xzr
  0x251349c: b        #0x25134a4
  0x25134a0: mov      x23, x0
  0x25134a4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25134a8: add      x0, sp, #0x20
  0x25134ac: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25134b0: cbz      x24, #0x2513764
  0x25134b4: mov      x0, x24
  0x25134b8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25134bc: mov      x23, x0
  0x25134c0: cmp      w1, #1
  0x25134c4: b.ne     #0x25134ec
  0x25134c8: mov      x0, x23
  0x25134cc: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x25134d0: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x25134d4: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x25134d8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25134dc: add      x0, sp, #0x20
  0x25134e0: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25134e4: cbz      x24, #0x2512ae4
  0x25134e8: b        #0x2513740
  0x25134ec: mov      x24, xzr
  0x25134f0: b        #0x25134f8
  0x25134f4: mov      x23, x0
  0x25134f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25134fc: add      x0, sp, #0x20
  0x2513500: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513504: cbz      x24, #0x2513764
  0x2513508: mov      x0, x24
  0x251350c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513510: mov      x23, x0
  0x2513514: cmp      w1, #1
  0x2513518: b.ne     #0x2513540
  0x251351c: mov      x0, x23
  0x2513520: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513524: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513528: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x251352c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513530: add      x0, sp, #0x20
  0x2513534: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513538: cbz      x24, #0x2512a04
  0x251353c: b        #0x2513740
  0x2513540: mov      x24, xzr
  0x2513544: b        #0x251354c
  0x2513548: mov      x23, x0
  0x251354c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513550: add      x0, sp, #0x20
  0x2513554: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513558: cbz      x24, #0x2513764
  0x251355c: mov      x0, x24
  0x2513560: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513564: mov      x23, x0
  0x2513568: cmp      w1, #1
  0x251356c: b.ne     #0x2513594
  0x2513570: mov      x0, x23
  0x2513574: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513578: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x251357c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513580: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513584: add      x0, sp, #0x20
  0x2513588: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251358c: cbz      x24, #0x2512924
  0x2513590: b        #0x2513740
  0x2513594: mov      x24, xzr
  0x2513598: b        #0x25135a0
  0x251359c: mov      x23, x0
  0x25135a0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25135a4: add      x0, sp, #0x20
  0x25135a8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25135ac: cbz      x24, #0x2513764
  0x25135b0: mov      x0, x24
  0x25135b4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25135b8: mov      x23, x0
  0x25135bc: cmp      w1, #1
  0x25135c0: b.ne     #0x25135ec
  0x25135c4: mov      x0, x23
  0x25135c8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x25135cc: ldr      x19, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x25135d0: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x25135d4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25135d8: add      x0, sp, #0x20
  0x25135dc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25135e0: cbz      x19, #0x2513098
  0x25135e4: mov      x0, x19
  0x25135e8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25135ec: mov      x19, xzr
  0x25135f0: b        #0x25135f8
  0x25135f4: mov      x23, x0
  0x25135f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25135fc: add      x0, sp, #0x20
  0x2513600: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513604: cbz      x19, #0x2513764
  0x2513608: mov      x0, x19
  0x251360c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513610: mov      x23, x0
  0x2513614: cmp      w1, #1
  0x2513618: b.ne     #0x2513640
  0x251361c: mov      x0, x23
  0x2513620: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513624: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x2513628: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x251362c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513630: add      x0, sp, #0x20
  0x2513634: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513638: cbz      x24, #0x2512f8c
  0x251363c: b        #0x2513740
  0x2513640: mov      x24, xzr
  0x2513644: b        #0x251364c
  0x2513648: mov      x23, x0
  0x251364c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513650: add      x0, sp, #0x20
  0x2513654: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513658: cbz      x24, #0x2513764
  0x251365c: mov      x0, x24
  0x2513660: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513664: mov      x23, x0
  0x2513668: cmp      w1, #1
  0x251366c: b.ne     #0x2513694
  0x2513670: mov      x0, x23
  0x2513674: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513678: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x251367c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513680: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513684: add      x0, sp, #0x20
  0x2513688: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251368c: cbz      x24, #0x2512e94
  0x2513690: b        #0x2513740
  0x2513694: mov      x24, xzr
  0x2513698: b        #0x25136a0
  0x251369c: mov      x23, x0
  0x25136a0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25136a4: add      x0, sp, #0x20
  0x25136a8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25136ac: cbz      x24, #0x2513764
  0x25136b0: mov      x0, x24
  0x25136b4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25136b8: mov      x23, x0
  0x25136bc: cmp      w1, #1
  0x25136c0: b.ne     #0x25136e8
  0x25136c4: mov      x0, x23
  0x25136c8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x25136cc: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x25136d0: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x25136d4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25136d8: add      x0, sp, #0x20
  0x25136dc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25136e0: cbz      x24, #0x2512d9c
  0x25136e4: b        #0x2513740
  0x25136e8: mov      x24, xzr
  0x25136ec: b        #0x25136f4
  0x25136f0: mov      x23, x0
  0x25136f4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x25136f8: add      x0, sp, #0x20
  0x25136fc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513700: cbz      x24, #0x2513764
  0x2513704: mov      x0, x24
  0x2513708: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x251370c: b        #0x2513714
  0x2513710: b        #0x2513714
  0x2513714: mov      x23, x0
  0x2513718: cmp      w1, #1
  0x251371c: b.ne     #0x2513748
  0x2513720: mov      x0, x23
  0x2513724: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x2513728: ldr      x24, [x0] ; = 0x0 (u64 @ 0x55a8000)
  0x251372c: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2513730: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513734: add      x0, sp, #0x20
  0x2513738: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x251373c: cbz      x24, #0x2512844
  0x2513740: mov      x0, x24
  0x2513744: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513748: mov      x24, xzr
  0x251374c: b        #0x2513754
  0x2513750: mov      x23, x0
  0x2513754: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55a7000)
  0x2513758: add      x0, sp, #0x20
  0x251375c: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2513760: cbnz     x24, #0x251376c
  0x2513764: mov      x0, x23
  0x2513768: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x251376c: mov      x0, x24
  0x2513770: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x2513774: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
