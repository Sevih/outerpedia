; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcMonadGateEnchantNodeStats @ 0x290cfb4..0x290d4a4 (taille 1264 octets) =====
  0x290cfb4: sub      sp, sp, #0xe0
  0x290cfb8: stp      x29, x30, [sp, #0x80]
  0x290cfbc: stp      x28, x27, [sp, #0x90]
  0x290cfc0: stp      x26, x25, [sp, #0xa0]
  0x290cfc4: stp      x24, x23, [sp, #0xb0]
  0x290cfc8: stp      x22, x21, [sp, #0xc0]
  0x290cfcc: stp      x20, x19, [sp, #0xd0]
  0x290cfd0: adrp     x20, #0x59e7000
  0x290cfd4: ldrb     w8, [x20, #0xea7]
  0x290cfd8: mov      x19, x0
  0x290cfdc: tbnz     w8, #0, #0x290d0d8
  0x290cfe0: adrp     x0, #0x55c5000
  0x290cfe4: ldr      x0, [x0, #0x498] ; = 0x0 (u64 @ 0x55c5498)
  0x290cfe8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290cfec: adrp     x0, #0x55c5000
  0x290cff0: ldr      x0, [x0, #0x4a0] ; = 0x0 (u64 @ 0x55c54a0)
  0x290cff4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290cff8: adrp     x0, #0x55c5000
  0x290cffc: ldr      x0, [x0, #0x4a8] ; = 0x0 (u64 @ 0x55c54a8)
  0x290d000: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d004: adrp     x0, #0x55c5000
  0x290d008: ldr      x0, [x0, #0x438] ; = 0x0 (u64 @ 0x55c5438)
  0x290d00c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d010: adrp     x0, #0x55c5000
  0x290d014: ldr      x0, [x0, #0x4b0] ; = 0x0 (u64 @ 0x55c54b0)
  0x290d018: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d01c: adrp     x0, #0x55c5000
  0x290d020: ldr      x0, [x0, #0x4b8] ; = 0x0 (u64 @ 0x55c54b8)
  0x290d024: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d028: adrp     x0, #0x55c5000
  0x290d02c: ldr      x0, [x0, #0x4c0] ; = 0x0 (u64 @ 0x55c54c0)
  0x290d030: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d034: adrp     x0, #0x55c5000
  0x290d038: ldr      x0, [x0, #0x4c8] ; = 0x0 (u64 @ 0x55c54c8)
  0x290d03c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d040: adrp     x0, #0x55c5000
  0x290d044: ldr      x0, [x0, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x290d048: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d04c: adrp     x0, #0x55c5000
  0x290d050: ldr      x0, [x0, #0x4d8] ; = 0x0 (u64 @ 0x55c54d8)
  0x290d054: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d058: adrp     x0, #0x55c5000
  0x290d05c: ldr      x0, [x0, #0x4e0] ; = 0x0 (u64 @ 0x55c54e0)
  0x290d060: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d064: adrp     x0, #0x55c5000
  0x290d068: ldr      x0, [x0, #0x4e8] ; = 0x0 (u64 @ 0x55c54e8)
  0x290d06c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d070: adrp     x0, #0x55c5000
  0x290d074: ldr      x0, [x0, #0x4f0] ; = 0x0 (u64 @ 0x55c54f0)
  0x290d078: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d07c: adrp     x0, #0x55c5000
  0x290d080: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290d084: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d088: adrp     x0, #0x55c5000
  0x290d08c: ldr      x0, [x0, #0x4f8] ; = 0x0 (u64 @ 0x55c54f8)
  0x290d090: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d094: adrp     x0, #0x55c5000
  0x290d098: ldr      x0, [x0, #0x500] ; = 0x0 (u64 @ 0x55c5500)
  0x290d09c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d0a0: adrp     x0, #0x55c5000
  0x290d0a4: ldr      x0, [x0, #0x508] ; = 0x0 (u64 @ 0x55c5508)
  0x290d0a8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d0ac: adrp     x0, #0x55c5000
  0x290d0b0: ldr      x0, [x0, #0x510] ; = 0x0 (u64 @ 0x55c5510)
  0x290d0b4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d0b8: adrp     x0, #0x55c5000
  0x290d0bc: ldr      x0, [x0, #0x518] ; = 0x0 (u64 @ 0x55c5518)
  0x290d0c0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d0c4: adrp     x0, #0x55c5000
  0x290d0c8: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x55c5520)
  0x290d0cc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d0d0: mov      w8, #1
  0x290d0d4: strb     w8, [x20, #0xea7]
  0x290d0d8: movi     v0.2d, #0000000000000000
  0x290d0dc: stp      xzr, xzr, [sp, #0x60]
  0x290d0e0: str      xzr, [sp, #0x70]
  0x290d0e4: str      xzr, [sp, #0x50]
  0x290d0e8: stp      q0, q0, [sp, #0x30]
  0x290d0ec: str      xzr, [sp, #0x28]
  0x290d0f0: ldr      x8, [x19, #0xd8]
  0x290d0f4: cbz      x8, #0x290d360
  0x290d0f8: adrp     x8, #0x55c5000
  0x290d0fc: ldr      x8, [x8, #0x4c0] ; = 0x0 (u64 @ 0x55c54c0)
  0x290d100: adrp     x20, #0x55c5000
  0x290d104: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d108: ldr      x20, [x20, #0x4b0] ; = 0x0 (u64 @ 0x55c54b0)
  0x290d10c: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290d110: ldr      x1, [x20] ; = 0x0 (u64 @ 0x55c5000)
  0x290d114: mov      x20, x0
  0x290d118: bl       #0x4027c48 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$.ctor
  0x290d11c: ldr      x0, [x19, #0xd8]
  0x290d120: cbz      x0, #0x290d398
  0x290d124: adrp     x8, #0x55c5000
  0x290d128: ldr      x8, [x8, #0x510] ; = 0x0 (u64 @ 0x55c5510)
  0x290d12c: adrp     x24, #0x55c5000
  0x290d130: adrp     x28, #0x55c5000
  0x290d134: adrp     x29, #0x55c5000
  0x290d138: adrp     x27, #0x55c5000
  0x290d13c: adrp     x25, #0x55c5000
  0x290d140: adrp     x26, #0x55c5000
  0x290d144: ldr      x24, [x24, #0x4d8] ; = 0x0 (u64 @ 0x55c54d8)
  0x290d148: ldr      x28, [x28, #0x4a0] ; = 0x0 (u64 @ 0x55c54a0)
  0x290d14c: ldr      x29, [x29, #0x4b8] ; = 0x0 (u64 @ 0x55c54b8)
  0x290d150: ldr      x27, [x27, #0x508] ; = 0x0 (u64 @ 0x55c5508)
  0x290d154: ldr      x25, [x25, #0x4e0] ; = 0x0 (u64 @ 0x55c54e0)
  0x290d158: ldr      x26, [x26, #0x438] ; = 0x0 (u64 @ 0x55c5438)
  0x290d15c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d160: mov      x8, sp
  0x290d164: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x290d168: ldr      q0, [sp]
  0x290d16c: ldr      x8, [sp, #0x10]
  0x290d170: str      q0, [sp, #0x60]
  0x290d174: str      x8, [sp, #0x70]
  0x290d178: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290d17c: add      x0, sp, #0x60
  0x290d180: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x290d184: tbz      w0, #0, #0x290d268
  0x290d188: ldr      x21, [sp, #0x70]
  0x290d18c: cbz      x21, #0x290d384
  0x290d190: ldr      w8, [x21, #0x50]
  0x290d194: cbnz     w8, #0x290d178
  0x290d198: cbz      x20, #0x290d390
  0x290d19c: ldr      w1, [x21, #0x54]
  0x290d1a0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290d1a4: mov      x0, x20
  0x290d1a8: bl       #0x4028810 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$ContainsKey
  0x290d1ac: tbnz     w0, #0, #0x290d1f4
  0x290d1b0: adrp     x8, #0x55c5000
  0x290d1b4: ldr      w22, [x21, #0x54]
  0x290d1b8: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x55c5520)
  0x290d1bc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d1c0: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290d1c4: adrp     x8, #0x55c5000
  0x290d1c8: ldr      x8, [x8, #0x518] ; = 0x0 (u64 @ 0x55c5518)
  0x290d1cc: mov      x23, x0
  0x290d1d0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d1d4: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x290d1d8: adrp     x8, #0x55c5000
  0x290d1dc: ldr      x8, [x8, #0x498] ; = 0x0 (u64 @ 0x55c5498)
  0x290d1e0: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d1e4: mov      x0, x20
  0x290d1e8: mov      w1, w22
  0x290d1ec: mov      x2, x23
  0x290d1f0: bl       #0x402861c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$Add
  0x290d1f4: ldr      w1, [x21, #0x54]
  0x290d1f8: ldr      x2, [x29] ; = 0x0 (u64 @ 0x55c5000)
  0x290d1fc: mov      x0, x20
  0x290d200: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290d204: cbz      x0, #0x290d394
  0x290d208: ldr      w10, [x0, #0x1c]
  0x290d20c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55c5010)
  0x290d210: ldr      x9, [x27] ; = 0x0 (u64 @ 0x55c5000)
  0x290d214: add      w10, w10, #1
  0x290d218: str      w10, [x0, #0x1c]
  0x290d21c: cbz      x8, #0x290d38c
  0x290d220: ldrsw    x10, [x0, #0x18]
  0x290d224: ldr      w11, [x8, #0x18]
  0x290d228: cmp      w10, w11
  0x290d22c: b.hs     #0x290d250
  0x290d230: add      w9, w10, #1
  0x290d234: add      x8, x8, x10, lsl #3
  0x290d238: str      w9, [x0, #0x18]
  0x290d23c: str      x21, [x8, #0x20]!
  0x290d240: mov      x0, x8
  0x290d244: mov      x1, x21
  0x290d248: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x290d24c: b        #0x290d178
  0x290d250: ldr      x8, [x9, #0x20]
  0x290d254: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55c50c0)
  0x290d258: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55c5070)
  0x290d25c: mov      x1, x21
  0x290d260: bl       #0x44c93c4 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x290d264: b        #0x290d178
  0x290d268: adrp     x8, #0x55c5000
  0x290d26c: ldr      x8, [x8, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x290d270: add      x0, sp, #0x60
  0x290d274: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d278: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290d27c: adrp     x22, #0x55c5000
  0x290d280: ldr      x22, [x22, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290d284: cbz      x20, #0x290d398
  0x290d288: adrp     x8, #0x55c5000
  0x290d28c: ldr      x8, [x8, #0x4a8] ; = 0x0 (u64 @ 0x55c54a8)
  0x290d290: mov      x0, x20
  0x290d294: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d298: mov      x8, sp
  0x290d29c: bl       #0x4028a54 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x290d2a0: ldp      q0, q1, [sp]
  0x290d2a4: ldr      x8, [sp, #0x20]
  0x290d2a8: stp      q0, q1, [sp, #0x30]
  0x290d2ac: str      x8, [sp, #0x50]
  0x290d2b0: ldr      x1, [x25] ; = 0x0 (u64 @ 0x55c5000)
  0x290d2b4: add      x0, sp, #0x30
  0x290d2b8: bl       #0x416d0bc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x290d2bc: tbz      w0, #0, #0x290d34c
  0x290d2c0: ldr      x0, [x19, #0x40]
  0x290d2c4: cbz      x0, #0x290d380
  0x290d2c8: ldr      x20, [sp, #0x48]
  0x290d2cc: ldr      w1, [sp, #0x40]
  0x290d2d0: ldr      x3, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290d2d4: add      x2, sp, #0x28
  0x290d2d8: bl       #0x4029d90 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$TryGetValue
  0x290d2dc: tbz      w0, #0, #0x290d2b0
  0x290d2e0: ldr      x21, [sp, #0x28]
  0x290d2e4: cbz      x21, #0x290d388
  0x290d2e8: ldr      x8, [x21]
  0x290d2ec: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55c5000)
  0x290d2f0: ldrh     w9, [x8, #0x12e]
  0x290d2f4: cbz      x9, #0x290d318
  0x290d2f8: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x290d2fc: add      x10, x10, #8
  0x290d300: ldur     x11, [x10, #-8]
  0x290d304: cmp      x11, x1
  0x290d308: b.eq     #0x290d328
  0x290d30c: subs     x9, x9, #1
  0x290d310: add      x10, x10, #0x10
  0x290d314: b.ne     #0x290d300
  0x290d318: mov      w2, #0x11
  0x290d31c: mov      x0, x21
  0x290d320: bl       #0x2215130 ; -> ??? 0x2215130
  0x290d324: b        #0x290d338
  0x290d328: ldr      w9, [x10]
  0x290d32c: add      w9, w9, #0x11
  0x290d330: add      x8, x8, w9, sxtw #4
  0x290d334: add      x0, x8, #0x138
  0x290d338: ldp      x8, x2, [x0]
  0x290d33c: mov      x0, x21
  0x290d340: mov      x1, x20
  0x290d344: blr      x8
  0x290d348: b        #0x290d2b0
  0x290d34c: adrp     x8, #0x55c5000
  0x290d350: ldr      x8, [x8, #0x4c8] ; = 0x0 (u64 @ 0x55c54c8)
  0x290d354: add      x0, sp, #0x30
  0x290d358: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d35c: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290d360: ldp      x20, x19, [sp, #0xd0]
  0x290d364: ldp      x22, x21, [sp, #0xc0]
  0x290d368: ldp      x24, x23, [sp, #0xb0]
  0x290d36c: ldp      x26, x25, [sp, #0xa0]
  0x290d370: ldp      x28, x27, [sp, #0x90]
  0x290d374: ldp      x29, x30, [sp, #0x80]
  0x290d378: add      sp, sp, #0xe0
  0x290d37c: ret      
  0x290d380: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d384: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d388: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d38c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d390: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d394: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d398: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290d39c: b        #0x290d3c8
  0x290d3a0: b        #0x290d3c8
  0x290d3a4: b        #0x290d3c8
  0x290d3a8: b        #0x290d3c8
  0x290d3ac: b        #0x290d430
  0x290d3b0: b        #0x290d3c8
  0x290d3b4: b        #0x290d3c8
  0x290d3b8: b        #0x290d430
  0x290d3bc: b        #0x290d3c8
  0x290d3c0: b        #0x290d430
  0x290d3c4: b        #0x290d430
  0x290d3c8: mov      x21, x0
  0x290d3cc: cmp      w1, #1
  0x290d3d0: b.ne     #0x290d404
  0x290d3d4: mov      x0, x21
  0x290d3d8: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290d3dc: ldr      x22, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290d3e0: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290d3e4: adrp     x8, #0x55c5000
  0x290d3e8: ldr      x8, [x8, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x290d3ec: add      x0, sp, #0x60
  0x290d3f0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d3f4: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290d3f8: cbz      x22, #0x290d27c
  0x290d3fc: mov      x0, x22
  0x290d400: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290d404: mov      x22, xzr
  0x290d408: b        #0x290d410
  0x290d40c: mov      x21, x0
  0x290d410: adrp     x8, #0x55c5000
  0x290d414: ldr      x8, [x8, #0x4d0] ; = 0x0 (u64 @ 0x55c54d0)
  0x290d418: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d41c: add      x0, sp, #0x60
  0x290d420: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x290d424: cbz      x22, #0x290d490
  0x290d428: mov      x0, x22
  0x290d42c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290d430: mov      x21, x0
  0x290d434: cmp      w1, #1
  0x290d438: b.ne     #0x290d46c
  0x290d43c: mov      x0, x21
  0x290d440: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x290d444: ldr      x19, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290d448: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x290d44c: adrp     x8, #0x55c5000
  0x290d450: ldr      x8, [x8, #0x4c8] ; = 0x0 (u64 @ 0x55c54c8)
  0x290d454: add      x0, sp, #0x30
  0x290d458: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d45c: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290d460: cbz      x19, #0x290d360
  0x290d464: mov      x0, x19
  0x290d468: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290d46c: mov      x19, xzr
  0x290d470: b        #0x290d478
  0x290d474: mov      x21, x0
  0x290d478: adrp     x8, #0x55c5000
  0x290d47c: ldr      x8, [x8, #0x4c8] ; = 0x0 (u64 @ 0x55c54c8)
  0x290d480: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290d484: add      x0, sp, #0x30
  0x290d488: bl       #0x416d1e0 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x290d48c: cbnz     x19, #0x290d498
  0x290d490: mov      x0, x21
  0x290d494: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x290d498: mov      x0, x19
  0x290d49c: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290d4a0: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
