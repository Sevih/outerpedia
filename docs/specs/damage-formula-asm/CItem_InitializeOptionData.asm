; ===== CItem_InitializeOptionData @ 0x230f9c4..0x23104a4 (taille 2784 octets) =====
  0x230f9c4: sub      sp, sp, #0xe0
  0x230f9c8: str      d10, [sp, #0x60]
  0x230f9cc: stp      d9, d8, [sp, #0x70]
  0x230f9d0: stp      x29, x30, [sp, #0x80]
  0x230f9d4: stp      x28, x27, [sp, #0x90]
  0x230f9d8: stp      x26, x25, [sp, #0xa0]
  0x230f9dc: stp      x24, x23, [sp, #0xb0]
  0x230f9e0: stp      x22, x21, [sp, #0xc0]
  0x230f9e4: stp      x20, x19, [sp, #0xd0]
  0x230f9e8: adrp     x20, #0x5955000
  0x230f9ec: ldrb     w8, [x20, #0x9a4]
  0x230f9f0: mov      w26, w3
  0x230f9f4: mov      x21, x2
  0x230f9f8: mov      x22, x1
  0x230f9fc: mov      x19, x0
  0x230fa00: tbnz     w8, #0, #0x230fb50
  0x230fa04: adrp     x0, #0x5511000
  0x230fa08: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x230fa0c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa10: adrp     x0, #0x5512000
  0x230fa14: ldr      x0, [x0, #0xbd0] ; = 0x0 (u64 @ 0x5512bd0)
  0x230fa18: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa1c: adrp     x0, #0x5512000
  0x230fa20: ldr      x0, [x0, #0xbd8] ; = 0x0 (u64 @ 0x5512bd8)
  0x230fa24: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa28: adrp     x0, #0x5512000
  0x230fa2c: ldr      x0, [x0, #0xb68] ; = 0x0 (u64 @ 0x5512b68)
  0x230fa30: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa34: adrp     x0, #0x5511000
  0x230fa38: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x230fa3c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa40: adrp     x0, #0x5512000
  0x230fa44: ldr      x0, [x0, #0xbe0] ; = 0x0 (u64 @ 0x5512be0)
  0x230fa48: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa4c: adrp     x0, #0x5511000
  0x230fa50: ldr      x0, [x0, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x230fa54: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa58: adrp     x0, #0x5512000
  0x230fa5c: ldr      x0, [x0, #0xbe8] ; = 0x0 (u64 @ 0x5512be8)
  0x230fa60: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa64: adrp     x0, #0x5511000
  0x230fa68: ldr      x0, [x0, #0x770] ; = 0x0 (u64 @ 0x5511770)
  0x230fa6c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa70: adrp     x0, #0x5512000
  0x230fa74: ldr      x0, [x0, #0xbf0] ; = 0x0 (u64 @ 0x5512bf0)
  0x230fa78: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa7c: adrp     x0, #0x5511000
  0x230fa80: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x5511778)
  0x230fa84: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa88: adrp     x0, #0x5512000
  0x230fa8c: ldr      x0, [x0, #0xbf8] ; = 0x0 (u64 @ 0x5512bf8)
  0x230fa90: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fa94: adrp     x0, #0x550f000
  0x230fa98: ldr      x0, [x0, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x230fa9c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230faa0: adrp     x0, #0x5511000
  0x230faa4: ldr      x0, [x0, #0x798] ; = 0x0 (u64 @ 0x5511798)
  0x230faa8: bl       #0x2184724 ; -> ??? 0x2184724
  0x230faac: adrp     x0, #0x5512000
  0x230fab0: ldr      x0, [x0, #0xc00] ; = 0x0 (u64 @ 0x5512c00)
  0x230fab4: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fab8: adrp     x0, #0x5512000
  0x230fabc: ldr      x0, [x0, #0xc08] ; = 0x0 (u64 @ 0x5512c08)
  0x230fac0: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fac4: adrp     x0, #0x5512000
  0x230fac8: ldr      x0, [x0, #0xc10] ; = 0x0 (u64 @ 0x5512c10)
  0x230facc: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fad0: adrp     x0, #0x5512000
  0x230fad4: ldr      x0, [x0, #0xc18] ; = 0x0 (u64 @ 0x5512c18)
  0x230fad8: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fadc: adrp     x0, #0x5511000
  0x230fae0: ldr      x0, [x0, #0x518] ; = 0x0 (u64 @ 0x5511518)
  0x230fae4: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fae8: adrp     x0, #0x5512000
  0x230faec: ldr      x0, [x0, #0xc20] ; = 0x0 (u64 @ 0x5512c20)
  0x230faf0: bl       #0x2184724 ; -> ??? 0x2184724
  0x230faf4: adrp     x0, #0x5511000
  0x230faf8: ldr      x0, [x0, #0x7a0] ; = 0x0 (u64 @ 0x55117a0)
  0x230fafc: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb00: adrp     x0, #0x5512000
  0x230fb04: ldr      x0, [x0, #0xc28] ; = 0x0 (u64 @ 0x5512c28)
  0x230fb08: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb0c: adrp     x0, #0x5512000
  0x230fb10: ldr      x0, [x0, #0xc30] ; = 0x0 (u64 @ 0x5512c30)
  0x230fb14: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb18: adrp     x0, #0x5512000
  0x230fb1c: ldr      x0, [x0, #0xc38] ; = 0x0 (u64 @ 0x5512c38)
  0x230fb20: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb24: adrp     x0, #0x5512000
  0x230fb28: ldr      x0, [x0, #0xc40] ; = 0x0 (u64 @ 0x5512c40)
  0x230fb2c: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb30: adrp     x0, #0x5512000
  0x230fb34: ldr      x0, [x0, #0xc48] ; = 0x0 (u64 @ 0x5512c48)
  0x230fb38: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb3c: adrp     x0, #0x5512000
  0x230fb40: ldr      x0, [x0, #0xc50] ; = 0x0 (u64 @ 0x5512c50)
  0x230fb44: bl       #0x2184724 ; -> ??? 0x2184724
  0x230fb48: mov      w8, #1
  0x230fb4c: strb     w8, [x20, #0x9a4]
  0x230fb50: stp      xzr, xzr, [sp, #0x40]
  0x230fb54: str      xzr, [sp, #0x50]
  0x230fb58: stp      xzr, xzr, [sp, #0x20]
  0x230fb5c: str      xzr, [sp, #0x30]
  0x230fb60: ldr      x8, [x19, #0x10]
  0x230fb64: cbz      x8, #0x23102d0
  0x230fb68: ldp      w2, w9, [x8, #0x18]
  0x230fb6c: add      w9, w9, #1
  0x230fb70: cmp      w2, #1
  0x230fb74: stp      wzr, w9, [x8, #0x18]
  0x230fb78: b.lt     #0x230fb8c
  0x230fb7c: ldr      x0, [x8, #0x10]
  0x230fb80: mov      w1, wzr
  0x230fb84: mov      x3, xzr
  0x230fb88: bl       #0x48c66cc ; -> System.Array$$Clear
  0x230fb8c: ldr      x8, [x19, #0x18]
  0x230fb90: cbz      x8, #0x23102d0
  0x230fb94: ldp      w2, w9, [x8, #0x18]
  0x230fb98: add      w9, w9, #1
  0x230fb9c: cmp      w2, #1
  0x230fba0: stp      wzr, w9, [x8, #0x18]
  0x230fba4: b.lt     #0x230fbb8
  0x230fba8: ldr      x0, [x8, #0x10]
  0x230fbac: mov      w1, wzr
  0x230fbb0: mov      x3, xzr
  0x230fbb4: bl       #0x48c66cc ; -> System.Array$$Clear
  0x230fbb8: ldr      x8, [x19, #0x38]
  0x230fbbc: cbz      x8, #0x23102d0
  0x230fbc0: ldr      w9, [x8, #0x1c]
  0x230fbc4: add      w9, w9, #1
  0x230fbc8: stp      wzr, w9, [x8, #0x18]
  0x230fbcc: ldr      x8, [x19, #0x28]
  0x230fbd0: cbz      x8, #0x23102d0
  0x230fbd4: ldp      w2, w9, [x8, #0x18]
  0x230fbd8: add      w9, w9, #1
  0x230fbdc: cmp      w2, #1
  0x230fbe0: stp      wzr, w9, [x8, #0x18]
  0x230fbe4: b.lt     #0x230fbf8
  0x230fbe8: ldr      x0, [x8, #0x10]
  0x230fbec: mov      w1, wzr
  0x230fbf0: mov      x3, xzr
  0x230fbf4: bl       #0x48c66cc ; -> System.Array$$Clear
  0x230fbf8: ldr      x8, [x19, #0x70]
  0x230fbfc: cbz      x8, #0x23102d0
  0x230fc00: ldr      w8, [x8, #0x34]
  0x230fc04: adrp     x29, #0x5512000
  0x230fc08: adrp     x24, #0x5511000
  0x230fc0c: ldr      x29, [x29, #0xb68] ; = 0x0 (u64 @ 0x5512b68)
  0x230fc10: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x230fc14: cmp      w8, #8
  0x230fc18: b.ne     #0x230fca4
  0x230fc1c: ldrb     w8, [x19, #0x58]
  0x230fc20: cbz      w8, #0x230fca4
  0x230fc24: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x230fc28: ldr      w8, [x0, #0xe0]
  0x230fc2c: cbnz     w8, #0x230fc34
  0x230fc30: bl       #0x218489c ; -> ??? 0x218489c
  0x230fc34: mov      x0, xzr
  0x230fc38: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x230fc3c: ldr      x8, [x19, #0x70]
  0x230fc40: cbz      x8, #0x23102d0
  0x230fc44: cbz      x0, #0x23102d0
  0x230fc48: ldr      w1, [x8, #0x10]
  0x230fc4c: mov      x2, xzr
  0x230fc50: bl       #0x25f0844 ; -> CTempletManager$$GetItemOptionTempletFromGroup
  0x230fc54: adrp     x8, #0x5512000
  0x230fc58: ldr      x8, [x8, #0xbe0] ; = 0x0 (u64 @ 0x5512be0)
  0x230fc5c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x230fc60: bl       #0x3412b48 ; -> System.Linq.Enumerable$$FirstOrDefault<object>
  0x230fc64: cbz      x0, #0x23102d0
  0x230fc68: ldr      w23, [x0, #0x10]
  0x230fc6c: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x230fc70: ldrb     w24, [x19, #0x58]
  0x230fc74: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x230fc78: mov      w1, w23
  0x230fc7c: mov      w2, wzr
  0x230fc80: mov      w3, w24
  0x230fc84: mov      x25, x0
  0x230fc88: bl       #0x230de50 ; -> CItemSubOptionData$$.ctor
  0x230fc8c: mov      x0, x19
  0x230fc90: str      x25, [x0, #0x20]!
  0x230fc94: mov      x1, x25
  0x230fc98: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x230fc9c: adrp     x24, #0x5511000
  0x230fca0: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x230fca4: str      w26, [sp, #0x6c]
  0x230fca8: adrp     x25, #0x5511000
  0x230fcac: adrp     x28, #0x5511000
  0x230fcb0: adrp     x26, #0x5512000
  0x230fcb4: ldr      x25, [x25, #0x7a0] ; = 0x0 (u64 @ 0x55117a0)
  0x230fcb8: ldr      x28, [x28, #0x770] ; = 0x0 (u64 @ 0x5511770)
  0x230fcbc: ldr      x26, [x26, #0xc00] ; = 0x0 (u64 @ 0x5512c00)
  0x230fcc0: cbz      x22, #0x230fddc
  0x230fcc4: ldrb     w1, [x19, #0x58]
  0x230fcc8: adrp     x20, #0x5512000
  0x230fccc: ldr      x20, [x20, #0xbd0] ; = 0x0 (u64 @ 0x5512bd0)
  0x230fcd0: mov      x0, x19
  0x230fcd4: bl       #0x23104a4 ; -> CItem$$GetEnchantFactor
  0x230fcd8: ldrb     w1, [x19, #0x65]
  0x230fcdc: mov      x0, x19
  0x230fce0: mov      v8.16b, v0.16b
  0x230fce4: bl       #0x23105d8 ; -> CItem$$GetBreakLimitFactor
  0x230fce8: ldrb     w2, [x19, #0x67]
  0x230fcec: ldrb     w1, [x19, #0x66]
  0x230fcf0: mov      x0, x19
  0x230fcf4: mov      v9.16b, v0.16b
  0x230fcf8: bl       #0x23106ac ; -> CItem$$GetSingularityFactor
  0x230fcfc: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x230fd00: add      x8, sp, #8
  0x230fd04: mov      x0, x22
  0x230fd08: mov      v10.16b, v0.16b
  0x230fd0c: bl       #0x43fdf1c ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x230fd10: ldur     q0, [sp, #8]
  0x230fd14: ldr      x8, [sp, #0x18]
  0x230fd18: str      q0, [sp, #0x40]
  0x230fd1c: str      x8, [sp, #0x50]
  0x230fd20: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x230fd24: add      x0, sp, #0x40
  0x230fd28: bl       #0x40a5818 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x230fd2c: tbz      w0, #0, #0x230fdc8
  0x230fd30: ldr      w23, [sp, #0x50]
  0x230fd34: cmp      w23, #1
  0x230fd38: b.lt     #0x230fd20
  0x230fd3c: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5512000)
  0x230fd40: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x230fd44: mov      x22, x0
  0x230fd48: mov      w1, w23
  0x230fd4c: mov      v0.16b, v8.16b
  0x230fd50: mov      v1.16b, v9.16b
  0x230fd54: mov      x2, x19
  0x230fd58: mov      v2.16b, v10.16b
  0x230fd5c: bl       #0x230dbac ; -> CItemMainOption$$.ctor
  0x230fd60: ldr      x0, [x19, #0x10]
  0x230fd64: cbz      x0, #0x23102b4
  0x230fd68: ldr      w10, [x0, #0x1c]
  0x230fd6c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5512010)
  0x230fd70: ldr      x9, [x26] ; = 0x0 (u64 @ 0x5512000)
  0x230fd74: add      w10, w10, #1
  0x230fd78: str      w10, [x0, #0x1c]
  0x230fd7c: cbz      x8, #0x23102b8
  0x230fd80: ldrsw    x10, [x0, #0x18]
  0x230fd84: ldr      w11, [x8, #0x18]
  0x230fd88: cmp      w10, w11
  0x230fd8c: b.hs     #0x230fdb0
  0x230fd90: add      w9, w10, #1
  0x230fd94: add      x8, x8, x10, lsl #3
  0x230fd98: str      w9, [x0, #0x18]
  0x230fd9c: str      x22, [x8, #0x20]!
  0x230fda0: mov      x0, x8
  0x230fda4: mov      x1, x22
  0x230fda8: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x230fdac: b        #0x230fd20
  0x230fdb0: ldr      x8, [x9, #0x20]
  0x230fdb4: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55120c0)
  0x230fdb8: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5512070)
  0x230fdbc: mov      x1, x22
  0x230fdc0: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x230fdc4: b        #0x230fd20
  0x230fdc8: adrp     x8, #0x5511000
  0x230fdcc: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x230fdd0: add      x0, sp, #0x40
  0x230fdd4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x230fdd8: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x230fddc: cbz      x21, #0x230ff40
  0x230fde0: adrp     x8, #0x5512000
  0x230fde4: ldr      x8, [x8, #0xc20] ; = 0x0 (u64 @ 0x5512c20)
  0x230fde8: adrp     x27, #0x5512000
  0x230fdec: adrp     x20, #0x5511000
  0x230fdf0: mov      x0, x21
  0x230fdf4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x230fdf8: ldr      x27, [x27, #0xbf0] ; = 0x0 (u64 @ 0x5512bf0)
  0x230fdfc: ldr      x20, [x20, #0x798] ; = 0x0 (u64 @ 0x5511798)
  0x230fe00: add      x8, sp, #8
  0x230fe04: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x230fe08: ldur     q0, [sp, #8]
  0x230fe0c: ldr      x8, [sp, #0x18]
  0x230fe10: str      q0, [sp, #0x20]
  0x230fe14: str      x8, [sp, #0x30]
  0x230fe18: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x230fe1c: add      x0, sp, #0x20
  0x230fe20: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x230fe24: tbz      w0, #0, #0x230ff24
  0x230fe28: ldr      x24, [sp, #0x30]
  0x230fe2c: cbz      x24, #0x23102a4
  0x230fe30: ldr      x0, [x19, #0x38]
  0x230fe34: cbz      x0, #0x23102a8
  0x230fe38: ldr      w10, [x0, #0x1c]
  0x230fe3c: ldr      w21, [x24, #0x10]
  0x230fe40: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5512010)
  0x230fe44: ldr      x9, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x230fe48: add      w10, w10, #1
  0x230fe4c: str      w10, [x0, #0x1c]
  0x230fe50: cbz      x8, #0x23102a0
  0x230fe54: ldrsw    x10, [x0, #0x18]
  0x230fe58: ldr      w11, [x8, #0x18]
  0x230fe5c: cmp      w10, w11
  0x230fe60: b.hs     #0x230fe78
  0x230fe64: add      w9, w10, #1
  0x230fe68: add      x8, x8, x10, lsl #2
  0x230fe6c: str      w9, [x0, #0x18]
  0x230fe70: str      w21, [x8, #0x20]
  0x230fe74: b        #0x230fe8c
  0x230fe78: ldr      x8, [x9, #0x20]
  0x230fe7c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55120c0)
  0x230fe80: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5512070)
  0x230fe84: mov      w1, w21
  0x230fe88: bl       #0x43fd344 ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x230fe8c: cmp      w21, #1
  0x230fe90: b.lt     #0x230fe18
  0x230fe94: ldr      w22, [x24, #0x10]
  0x230fe98: ldrb     w23, [x24, #0x15]
  0x230fe9c: ldrb     w24, [x24, #0x14]
  0x230fea0: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x230fea4: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x230fea8: mov      x21, x0
  0x230feac: mov      w1, w22
  0x230feb0: mov      w2, w23
  0x230feb4: mov      w3, w24
  0x230feb8: bl       #0x230de50 ; -> CItemSubOptionData$$.ctor
  0x230febc: ldr      x0, [x19, #0x18]
  0x230fec0: cbz      x0, #0x23102c0
  0x230fec4: ldr      w10, [x0, #0x1c]
  0x230fec8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5512010)
  0x230fecc: ldr      x9, [x26] ; = 0x0 (u64 @ 0x5512000)
  0x230fed0: add      w10, w10, #1
  0x230fed4: str      w10, [x0, #0x1c]
  0x230fed8: cbz      x8, #0x23102bc
  0x230fedc: ldrsw    x10, [x0, #0x18]
  0x230fee0: ldr      w11, [x8, #0x18]
  0x230fee4: cmp      w10, w11
  0x230fee8: b.hs     #0x230ff0c
  0x230feec: add      w9, w10, #1
  0x230fef0: add      x8, x8, x10, lsl #3
  0x230fef4: str      w9, [x0, #0x18]
  0x230fef8: str      x21, [x8, #0x20]!
  0x230fefc: mov      x0, x8
  0x230ff00: mov      x1, x21
  0x230ff04: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x230ff08: b        #0x230fe18
  0x230ff0c: ldr      x8, [x9, #0x20]
  0x230ff10: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55120c0)
  0x230ff14: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5512070)
  0x230ff18: mov      x1, x21
  0x230ff1c: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x230ff20: b        #0x230fe18
  0x230ff24: adrp     x8, #0x5512000
  0x230ff28: ldr      x8, [x8, #0xbe8] ; = 0x0 (u64 @ 0x5512be8)
  0x230ff2c: add      x0, sp, #0x20
  0x230ff30: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x230ff34: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x230ff38: adrp     x24, #0x5511000
  0x230ff3c: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x230ff40: ldr      x8, [x19, #0x70]
  0x230ff44: cbz      x8, #0x23102d0
  0x230ff48: ldr      x0, [x8, #0x70] ; = 0x0 (u64 @ 0x5512070)
  0x230ff4c: cbz      x0, #0x23102d0
  0x230ff50: adrp     x26, #0x5512000
  0x230ff54: adrp     x29, #0x5512000
  0x230ff58: adrp     x27, #0x5511000
  0x230ff5c: ldr      x26, [x26, #0xc48] ; = 0x0 (u64 @ 0x5512c48)
  0x230ff60: ldr      x29, [x29, #0xc50] ; = 0x0 (u64 @ 0x5512c50)
  0x230ff64: ldr      x27, [x27, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x230ff68: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x230ff6c: adrp     x25, #0x5512000
  0x230ff70: adrp     x20, #0x5512000
  0x230ff74: ldr      x25, [x25, #0xbd8] ; = 0x0 (u64 @ 0x5512bd8)
  0x230ff78: ldr      x20, [x20, #0xc08] ; = 0x0 (u64 @ 0x5512c08)
  0x230ff7c: add      x8, sp, #8
  0x230ff80: bl       #0x43fdf1c ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x230ff84: ldur     q0, [sp, #8]
  0x230ff88: ldr      x8, [sp, #0x18]
  0x230ff8c: str      q0, [sp, #0x40]
  0x230ff90: str      x8, [sp, #0x50]
  0x230ff94: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x230ff98: add      x0, sp, #0x40
  0x230ff9c: bl       #0x40a5818 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x230ffa0: tbz      w0, #0, #0x2310184
  0x230ffa4: ldr      w23, [sp, #0x50]
  0x230ffa8: cmp      w23, #1
  0x230ffac: b.lt     #0x230ff94
  0x230ffb0: ldr      x0, [x26] ; = 0x0 (u64 @ 0x5512000)
  0x230ffb4: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x230ffb8: mov      x21, x0
  0x230ffbc: mov      x1, xzr
  0x230ffc0: bl       #0x48e6ab0 ; -> System.Object$$.ctor
  0x230ffc4: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5511000)
  0x230ffc8: ldr      w8, [x0, #0xe0]
  0x230ffcc: cbnz     w8, #0x230ffd4
  0x230ffd0: bl       #0x218489c ; -> ??? 0x218489c
  0x230ffd4: mov      x0, xzr
  0x230ffd8: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x230ffdc: cbz      x0, #0x23102ac
  0x230ffe0: mov      w1, w23
  0x230ffe4: mov      x2, xzr
  0x230ffe8: bl       #0x25fa438 ; -> CTempletManager$$GetItemSpecialOptionTemplet
  0x230ffec: mov      x1, x0
  0x230fff0: cbz      x21, #0x23102b0
  0x230fff4: mov      x22, x21
  0x230fff8: str      x1, [x22, #0x10]!
  0x230fffc: mov      x0, x22
  0x2310000: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x2310004: ldr      x8, [x22]
  0x2310008: cbz      x8, #0x23100a4
  0x231000c: ldrb     w23, [x19, #0x65]
  0x2310010: mov      x0, x19
  0x2310014: bl       #0x230dd48 ; -> CItem$$IsSpecialItemEnchantable
  0x2310018: tbz      w0, #0, #0x23100f0
  0x231001c: ldr      x8, [x22]
  0x2310020: cbz      x8, #0x23102d4
  0x2310024: ldrb     w9, [x19, #0x58]
  0x2310028: ldr      w23, [x8, #0x18]
  0x231002c: cmp      w9, #0
  0x2310030: csinc    w9, w9, wzr, ne
  0x2310034: cmp      w23, w9
  0x2310038: b.gt     #0x230ff94
  0x231003c: ldrb     w8, [x8, #0x1c]
  0x2310040: cbnz     w8, #0x23100f4
  0x2310044: adrp     x8, #0x5512000
  0x2310048: ldr      x24, [x19, #0x28]
  0x231004c: ldr      x8, [x8, #0xc38] ; = 0x0 (u64 @ 0x5512c38)
  0x2310050: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x2310054: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x2310058: adrp     x8, #0x5512000
  0x231005c: ldr      x8, [x8, #0xc40] ; = 0x0 (u64 @ 0x5512c40)
  0x2310060: mov      x25, x0
  0x2310064: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x2310068: mov      x1, x21
  0x231006c: mov      x3, xzr
  0x2310070: bl       #0x463389c ; -> System.Predicate<object>$$.ctor
  0x2310074: cbz      x24, #0x23102d8
  0x2310078: adrp     x8, #0x5512000
  0x231007c: ldr      x8, [x8, #0xc28] ; = 0x0 (u64 @ 0x5512c28)
  0x2310080: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x2310084: mov      x1, x25
  0x2310088: adrp     x25, #0x5512000
  0x231008c: ldr      x25, [x25, #0xbd8] ; = 0x0 (u64 @ 0x5512bd8)
  0x2310090: mov      x0, x24
  0x2310094: bl       #0x444bf1c ; -> System.Collections.Generic.List<object>$$RemoveAll
  0x2310098: adrp     x24, #0x5511000
  0x231009c: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x23100a0: b        #0x23100f4
  0x23100a4: adrp     x8, #0x550f000
  0x23100a8: ldr      x8, [x8, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x23100ac: str      w23, [sp, #8]
  0x23100b0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x23100b4: add      x1, sp, #8
  0x23100b8: bl       #0x21848a4 ; -> ??? 0x21848a4
  0x23100bc: mov      x1, x0
  0x23100c0: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5512000)
  0x23100c4: mov      x2, xzr
  0x23100c8: bl       #0x470ffc0 ; -> System.String$$Format
  0x23100cc: mov      x21, x0
  0x23100d0: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5511000)
  0x23100d4: ldr      w8, [x0, #0xe0]
  0x23100d8: cbnz     w8, #0x23100e0
  0x23100dc: bl       #0x218489c ; -> ??? 0x218489c
  0x23100e0: mov      x0, x21
  0x23100e4: mov      x1, xzr
  0x23100e8: bl       #0x2c4ff18 ; -> CDebug$$LogError
  0x23100ec: b        #0x230ff94
  0x23100f0: add      w23, w23, #1
  0x23100f4: ldr      x8, [x22]
  0x23100f8: cbz      x8, #0x23102c8
  0x23100fc: ldr      w22, [x8, #0x10]
  0x2310100: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5512000)
  0x2310104: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x2310108: mov      x21, x0
  0x231010c: mov      w1, w22
  0x2310110: mov      w2, w23
  0x2310114: mov      w3, wzr
  0x2310118: bl       #0x230e1fc ; -> CItemSpecialOption$$.ctor
  0x231011c: ldr      x0, [x19, #0x28]
  0x2310120: cbz      x0, #0x23102cc
  0x2310124: ldr      w10, [x0, #0x1c]
  0x2310128: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x5512010)
  0x231012c: ldr      x9, [x20] ; = 0x0 (u64 @ 0x5512000)
  0x2310130: add      w10, w10, #1
  0x2310134: str      w10, [x0, #0x1c]
  0x2310138: cbz      x8, #0x23102c4
  0x231013c: ldrsw    x10, [x0, #0x18]
  0x2310140: ldr      w11, [x8, #0x18]
  0x2310144: cmp      w10, w11
  0x2310148: b.hs     #0x231016c
  0x231014c: add      w9, w10, #1
  0x2310150: add      x8, x8, x10, lsl #3
  0x2310154: str      w9, [x0, #0x18]
  0x2310158: str      x21, [x8, #0x20]!
  0x231015c: mov      x0, x8
  0x2310160: mov      x1, x21
  0x2310164: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x2310168: b        #0x230ff94
  0x231016c: ldr      x8, [x9, #0x20]
  0x2310170: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x550f0c0)
  0x2310174: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x550f070)
  0x2310178: mov      x1, x21
  0x231017c: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2310180: b        #0x230ff94
  0x2310184: adrp     x8, #0x5511000
  0x2310188: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x231018c: add      x0, sp, #0x40
  0x2310190: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2310194: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2310198: ldr      w20, [sp, #0x6c]
  0x231019c: cmp      w20, #1
  0x23101a0: b.lt     #0x23101d0
  0x23101a4: ldr      x0, [x25] ; = 0x0 (u64 @ 0x5512000)
  0x23101a8: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x23101ac: mov      w2, #1
  0x23101b0: mov      w1, w20
  0x23101b4: mov      w3, wzr
  0x23101b8: mov      x21, x0
  0x23101bc: bl       #0x230e1fc ; -> CItemSpecialOption$$.ctor
  0x23101c0: mov      x0, x19
  0x23101c4: str      x21, [x0, #0x30]!
  0x23101c8: mov      x1, x21
  0x23101cc: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x23101d0: ldr      x8, [x19, #0x10]
  0x23101d4: fmov     s0, wzr
  0x23101d8: cbz      x8, #0x2310274
  0x23101dc: ldr      w8, [x8, #0x18]
  0x23101e0: cmp      w8, #1
  0x23101e4: b.lt     #0x2310274
  0x23101e8: ldr      x8, [x19, #0x70]
  0x23101ec: cbz      x8, #0x23102d0
  0x23101f0: ldr      w8, [x8, #0x38]
  0x23101f4: sub      w8, w8, #1
  0x23101f8: cmp      w8, #2
  0x23101fc: b.hi     #0x2310210
  0x2310200: adrp     x9, #0x1056000
  0x2310204: add      x9, x9, #0x988
  0x2310208: ldr      s8, [x9, w8, sxtw #2] ; = 6.428484731059385e-40 (f32 @ 0x1056002)
  0x231020c: b        #0x2310218
  0x2310210: adrp     x8, #0x1056000
  0x2310214: ldr      s8, [x8, #0x488] ; = 0.6000000238418579 (f32 @ 0x1056488)
  0x2310218: mov      x0, x19
  0x231021c: bl       #0x2310844 ; -> CItem$$GetBasicStarPoint
  0x2310220: ldrb     w8, [x19, #0x65]
  0x2310224: fmov     s1, #1.00000000
  0x2310228: sub      w8, w8, #2
  0x231022c: cmp      w8, #3
  0x2310230: b.hi     #0x2310244
  0x2310234: adrp     x9, #0x1055000
  0x2310238: sxtb     x8, w8
  0x231023c: add      x9, x9, #0x2f0
  0x2310240: ldr      s1, [x9, x8, lsl #2] ; = 7.22507101977305e+28 (f32 @ 0x1055002)
  0x2310244: ldrb     w8, [x19, #0x58]
  0x2310248: fmul     s0, s8, s0
  0x231024c: adrp     x9, #0x1056000
  0x2310250: fmul     s0, s0, s1
  0x2310254: ldr      s1, [x9, #0x690] ; = 0.07999999821186066 (f32 @ 0x1056690)
  0x2310258: sub      w8, w8, #1
  0x231025c: scvtf    s3, w8
  0x2310260: fmov     s2, #5.00000000
  0x2310264: fmul     s3, s0, s3
  0x2310268: fmul     s1, s3, s1
  0x231026c: fdiv     s0, s0, s2
  0x2310270: fadd     s0, s0, s1
  0x2310274: str      s0, [x19, #0x40]
  0x2310278: ldp      x20, x19, [sp, #0xd0]
  0x231027c: ldp      x22, x21, [sp, #0xc0]
  0x2310280: ldp      x24, x23, [sp, #0xb0]
  0x2310284: ldp      x26, x25, [sp, #0xa0]
  0x2310288: ldp      x28, x27, [sp, #0x90]
  0x231028c: ldp      x29, x30, [sp, #0x80]
  0x2310290: ldp      d9, d8, [sp, #0x70]
  0x2310294: ldr      d10, [sp, #0x60]
  0x2310298: add      sp, sp, #0xe0
  0x231029c: ret      
  0x23102a0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102a4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102a8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102ac: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102b0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102b4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102b8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102bc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102c0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102c4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102c8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102cc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102d0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102d4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102d8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23102dc: b        #0x23103c0
  0x23102e0: b        #0x2310320
  0x23102e4: b        #0x2310320
  0x23102e8: b        #0x2310320
  0x23102ec: b        #0x23103c0
  0x23102f0: b        #0x23103c0
  0x23102f4: b        #0x23103c0
  0x23102f8: b        #0x2310320
  0x23102fc: b        #0x2310428
  0x2310300: b        #0x23103c0
  0x2310304: b        #0x2310428
  0x2310308: b        #0x2310348
  0x231030c: b        #0x23103c0
  0x2310310: b        #0x2310320
  0x2310314: b        #0x23103c0
  0x2310318: b        #0x23103c0
  0x231031c: b        #0x2310320
  0x2310320: adrp     x25, #0x5512000
  0x2310324: ldr      w20, [sp, #0x6c]
  0x2310328: ldr      x25, [x25, #0xbd8] ; = 0x0 (u64 @ 0x5512bd8)
  0x231032c: b        #0x23103c4
  0x2310330: b        #0x2310428
  0x2310334: b        #0x2310428
  0x2310338: b        #0x2310348
  0x231033c: b        #0x2310428
  0x2310340: b        #0x2310428
  0x2310344: b        #0x2310348
  0x2310348: mov      x22, x0
  0x231034c: cmp      w1, #1
  0x2310350: b.ne     #0x231038c
  0x2310354: mov      x0, x22
  0x2310358: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x231035c: ldr      x23, [x0] ; = 0x0 (u64 @ 0x5512000)
  0x2310360: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x2310364: adrp     x8, #0x5511000
  0x2310368: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x231036c: add      x0, sp, #0x40
  0x2310370: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2310374: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2310378: adrp     x24, #0x5511000
  0x231037c: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2310380: cbz      x23, #0x230fddc
  0x2310384: mov      x0, x23
  0x2310388: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x231038c: mov      x23, xzr
  0x2310390: b        #0x2310398
  0x2310394: mov      x22, x0
  0x2310398: adrp     x8, #0x5511000
  0x231039c: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x23103a0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x23103a4: add      x0, sp, #0x40
  0x23103a8: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x23103ac: cbz      x23, #0x2310490
  0x23103b0: mov      x0, x23
  0x23103b4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x23103b8: b        #0x23103c0
  0x23103bc: b        #0x23103c0
  0x23103c0: ldr      w20, [sp, #0x6c]
  0x23103c4: mov      x22, x0
  0x23103c8: cmp      w1, #1
  0x23103cc: b.ne     #0x23103fc
  0x23103d0: mov      x0, x22
  0x23103d4: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x23103d8: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5512000)
  0x23103dc: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x23103e0: adrp     x8, #0x5511000
  0x23103e4: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x23103e8: add      x0, sp, #0x40
  0x23103ec: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x23103f0: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x23103f4: cbz      x21, #0x231019c
  0x23103f8: b        #0x2310464
  0x23103fc: mov      x21, xzr
  0x2310400: b        #0x2310408
  0x2310404: mov      x22, x0
  0x2310408: adrp     x8, #0x5511000
  0x231040c: ldr      x8, [x8, #0x758] ; = 0x0 (u64 @ 0x5511758)
  0x2310410: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2310414: add      x0, sp, #0x40
  0x2310418: bl       #0x40a5814 ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x231041c: cbz      x21, #0x2310490
  0x2310420: mov      x0, x21
  0x2310424: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x2310428: adrp     x24, #0x5511000
  0x231042c: ldr      x24, [x24, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2310430: mov      x22, x0
  0x2310434: cmp      w1, #1
  0x2310438: b.ne     #0x231046c
  0x231043c: mov      x0, x22
  0x2310440: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x2310444: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5512000)
  0x2310448: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x231044c: adrp     x8, #0x5512000
  0x2310450: ldr      x8, [x8, #0xbe8] ; = 0x0 (u64 @ 0x5512be8)
  0x2310454: add      x0, sp, #0x20
  0x2310458: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x231045c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2310460: cbz      x21, #0x230ff40
  0x2310464: mov      x0, x21
  0x2310468: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x231046c: mov      x21, xzr
  0x2310470: b        #0x2310478
  0x2310474: mov      x22, x0
  0x2310478: adrp     x8, #0x5512000
  0x231047c: ldr      x8, [x8, #0xbe8] ; = 0x0 (u64 @ 0x5512be8)
  0x2310480: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5512000)
  0x2310484: add      x0, sp, #0x20
  0x2310488: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x231048c: cbnz     x21, #0x2310498
  0x2310490: mov      x0, x22
  0x2310494: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x2310498: mov      x0, x21
  0x231049c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x23104a0: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
