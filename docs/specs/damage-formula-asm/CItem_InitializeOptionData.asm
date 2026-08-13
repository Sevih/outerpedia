; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItem_InitializeOptionData @ 0x2340ff0..0x2341ad0 (taille 2784 octets) =====
  0x2340ff0: sub      sp, sp, #0xe0
  0x2340ff4: str      d10, [sp, #0x60]
  0x2340ff8: stp      d9, d8, [sp, #0x70]
  0x2340ffc: stp      x29, x30, [sp, #0x80]
  0x2341000: stp      x28, x27, [sp, #0x90]
  0x2341004: stp      x26, x25, [sp, #0xa0]
  0x2341008: stp      x24, x23, [sp, #0xb0]
  0x234100c: stp      x22, x21, [sp, #0xc0]
  0x2341010: stp      x20, x19, [sp, #0xd0]
  0x2341014: adrp     x20, #0x59d5000
  0x2341018: ldrb     w8, [x20, #0xb8]
  0x234101c: mov      w26, w3
  0x2341020: mov      x21, x2
  0x2341024: mov      x22, x1
  0x2341028: mov      x19, x0
  0x234102c: tbnz     w8, #0, #0x234117c
  0x2341030: adrp     x0, #0x5589000
  0x2341034: ldr      x0, [x0, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2341038: bl       #0x21af97c ; -> ??? 0x21af97c
  0x234103c: adrp     x0, #0x558b000
  0x2341040: ldr      x0, [x0, #0x9a0] ; = 0x0 (u64 @ 0x558b9a0)
  0x2341044: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341048: adrp     x0, #0x558b000
  0x234104c: ldr      x0, [x0, #0x9a8] ; = 0x0 (u64 @ 0x558b9a8)
  0x2341050: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341054: adrp     x0, #0x558b000
  0x2341058: ldr      x0, [x0, #0x938] ; = 0x0 (u64 @ 0x558b938)
  0x234105c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341060: adrp     x0, #0x558a000
  0x2341064: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341068: bl       #0x21af97c ; -> ??? 0x21af97c
  0x234106c: adrp     x0, #0x558b000
  0x2341070: ldr      x0, [x0, #0x9b0] ; = 0x0 (u64 @ 0x558b9b0)
  0x2341074: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341078: adrp     x0, #0x558a000
  0x234107c: ldr      x0, [x0, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x2341080: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341084: adrp     x0, #0x558b000
  0x2341088: ldr      x0, [x0, #0x9b8] ; = 0x0 (u64 @ 0x558b9b8)
  0x234108c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341090: adrp     x0, #0x558a000
  0x2341094: ldr      x0, [x0, #0x1a0] ; = 0x0 (u64 @ 0x558a1a0)
  0x2341098: bl       #0x21af97c ; -> ??? 0x21af97c
  0x234109c: adrp     x0, #0x558b000
  0x23410a0: ldr      x0, [x0, #0x9c0] ; = 0x0 (u64 @ 0x558b9c0)
  0x23410a4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410a8: adrp     x0, #0x558a000
  0x23410ac: ldr      x0, [x0, #0x1a8] ; = 0x0 (u64 @ 0x558a1a8)
  0x23410b0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410b4: adrp     x0, #0x558b000
  0x23410b8: ldr      x0, [x0, #0x9c8] ; = 0x0 (u64 @ 0x558b9c8)
  0x23410bc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410c0: adrp     x0, #0x5587000
  0x23410c4: ldr      x0, [x0, #0xa48] ; = 0x0 (u64 @ 0x5587a48)
  0x23410c8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410cc: adrp     x0, #0x558a000
  0x23410d0: ldr      x0, [x0, #0x1c8] ; = 0x0 (u64 @ 0x558a1c8)
  0x23410d4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410d8: adrp     x0, #0x558b000
  0x23410dc: ldr      x0, [x0, #0x9d0] ; = 0x0 (u64 @ 0x558b9d0)
  0x23410e0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410e4: adrp     x0, #0x558b000
  0x23410e8: ldr      x0, [x0, #0x9d8] ; = 0x0 (u64 @ 0x558b9d8)
  0x23410ec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410f0: adrp     x0, #0x558b000
  0x23410f4: ldr      x0, [x0, #0x9e0] ; = 0x0 (u64 @ 0x558b9e0)
  0x23410f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x23410fc: adrp     x0, #0x558b000
  0x2341100: ldr      x0, [x0, #0x9e8] ; = 0x0 (u64 @ 0x558b9e8)
  0x2341104: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341108: adrp     x0, #0x5589000
  0x234110c: ldr      x0, [x0, #0xf48] ; = 0x0 (u64 @ 0x5589f48)
  0x2341110: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341114: adrp     x0, #0x558b000
  0x2341118: ldr      x0, [x0, #0x9f0] ; = 0x0 (u64 @ 0x558b9f0)
  0x234111c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341120: adrp     x0, #0x558a000
  0x2341124: ldr      x0, [x0, #0x1d0] ; = 0x0 (u64 @ 0x558a1d0)
  0x2341128: bl       #0x21af97c ; -> ??? 0x21af97c
  0x234112c: adrp     x0, #0x558b000
  0x2341130: ldr      x0, [x0, #0x9f8] ; = 0x0 (u64 @ 0x558b9f8)
  0x2341134: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341138: adrp     x0, #0x558b000
  0x234113c: ldr      x0, [x0, #0xa00] ; = 0x0 (u64 @ 0x558ba00)
  0x2341140: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341144: adrp     x0, #0x558b000
  0x2341148: ldr      x0, [x0, #0xa08] ; = 0x0 (u64 @ 0x558ba08)
  0x234114c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341150: adrp     x0, #0x558b000
  0x2341154: ldr      x0, [x0, #0xa10] ; = 0x0 (u64 @ 0x558ba10)
  0x2341158: bl       #0x21af97c ; -> ??? 0x21af97c
  0x234115c: adrp     x0, #0x558b000
  0x2341160: ldr      x0, [x0, #0xa18] ; = 0x0 (u64 @ 0x558ba18)
  0x2341164: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341168: adrp     x0, #0x558b000
  0x234116c: ldr      x0, [x0, #0xa20] ; = 0x0 (u64 @ 0x558ba20)
  0x2341170: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341174: mov      w8, #1
  0x2341178: strb     w8, [x20, #0xb8]
  0x234117c: stp      xzr, xzr, [sp, #0x40]
  0x2341180: str      xzr, [sp, #0x50]
  0x2341184: stp      xzr, xzr, [sp, #0x20]
  0x2341188: str      xzr, [sp, #0x30]
  0x234118c: ldr      x8, [x19, #0x10]
  0x2341190: cbz      x8, #0x23418fc
  0x2341194: ldp      w2, w9, [x8, #0x18]
  0x2341198: add      w9, w9, #1
  0x234119c: cmp      w2, #1
  0x23411a0: stp      wzr, w9, [x8, #0x18]
  0x23411a4: b.lt     #0x23411b8
  0x23411a8: ldr      x0, [x8, #0x10]
  0x23411ac: mov      w1, wzr
  0x23411b0: mov      x3, xzr
  0x23411b4: bl       #0x49271b4 ; -> System.Array$$Clear
  0x23411b8: ldr      x8, [x19, #0x18]
  0x23411bc: cbz      x8, #0x23418fc
  0x23411c0: ldp      w2, w9, [x8, #0x18]
  0x23411c4: add      w9, w9, #1
  0x23411c8: cmp      w2, #1
  0x23411cc: stp      wzr, w9, [x8, #0x18]
  0x23411d0: b.lt     #0x23411e4
  0x23411d4: ldr      x0, [x8, #0x10]
  0x23411d8: mov      w1, wzr
  0x23411dc: mov      x3, xzr
  0x23411e0: bl       #0x49271b4 ; -> System.Array$$Clear
  0x23411e4: ldr      x8, [x19, #0x38]
  0x23411e8: cbz      x8, #0x23418fc
  0x23411ec: ldr      w9, [x8, #0x1c]
  0x23411f0: add      w9, w9, #1
  0x23411f4: stp      wzr, w9, [x8, #0x18]
  0x23411f8: ldr      x8, [x19, #0x28]
  0x23411fc: cbz      x8, #0x23418fc
  0x2341200: ldp      w2, w9, [x8, #0x18]
  0x2341204: add      w9, w9, #1
  0x2341208: cmp      w2, #1
  0x234120c: stp      wzr, w9, [x8, #0x18]
  0x2341210: b.lt     #0x2341224
  0x2341214: ldr      x0, [x8, #0x10]
  0x2341218: mov      w1, wzr
  0x234121c: mov      x3, xzr
  0x2341220: bl       #0x49271b4 ; -> System.Array$$Clear
  0x2341224: ldr      x8, [x19, #0x70]
  0x2341228: cbz      x8, #0x23418fc
  0x234122c: ldr      w8, [x8, #0x34]
  0x2341230: adrp     x29, #0x558b000
  0x2341234: adrp     x24, #0x558a000
  0x2341238: ldr      x29, [x29, #0x938] ; = 0x0 (u64 @ 0x558b938)
  0x234123c: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341240: cmp      w8, #8
  0x2341244: b.ne     #0x23412d0
  0x2341248: ldrb     w8, [x19, #0x58]
  0x234124c: cbz      w8, #0x23412d0
  0x2341250: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x2341254: ldr      w8, [x0, #0xe0]
  0x2341258: cbnz     w8, #0x2341260
  0x234125c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2341260: mov      x0, xzr
  0x2341264: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341268: ldr      x8, [x19, #0x70]
  0x234126c: cbz      x8, #0x23418fc
  0x2341270: cbz      x0, #0x23418fc
  0x2341274: ldr      w1, [x8, #0x10]
  0x2341278: mov      x2, xzr
  0x234127c: bl       #0x26277cc ; -> CTempletManager$$GetItemOptionTempletFromGroup
  0x2341280: adrp     x8, #0x558b000
  0x2341284: ldr      x8, [x8, #0x9b0] ; = 0x0 (u64 @ 0x558b9b0)
  0x2341288: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x234128c: bl       #0x345ff74 ; -> System.Linq.Enumerable$$FirstOrDefault<object>
  0x2341290: cbz      x0, #0x23418fc
  0x2341294: ldr      w23, [x0, #0x10]
  0x2341298: ldr      x0, [x29] ; = 0x0 (u64 @ 0x558b000)
  0x234129c: ldrb     w24, [x19, #0x58]
  0x23412a0: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x23412a4: mov      w1, w23
  0x23412a8: mov      w2, wzr
  0x23412ac: mov      w3, w24
  0x23412b0: mov      x25, x0
  0x23412b4: bl       #0x233f4e8 ; -> CItemSubOptionData$$.ctor
  0x23412b8: mov      x0, x19
  0x23412bc: str      x25, [x0, #0x20]!
  0x23412c0: mov      x1, x25
  0x23412c4: bl       #0x21af920 ; -> ??? 0x21af920
  0x23412c8: adrp     x24, #0x558a000
  0x23412cc: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x23412d0: str      w26, [sp, #0x6c]
  0x23412d4: adrp     x25, #0x558a000
  0x23412d8: adrp     x28, #0x558a000
  0x23412dc: adrp     x26, #0x558b000
  0x23412e0: ldr      x25, [x25, #0x1d0] ; = 0x0 (u64 @ 0x558a1d0)
  0x23412e4: ldr      x28, [x28, #0x1a0] ; = 0x0 (u64 @ 0x558a1a0)
  0x23412e8: ldr      x26, [x26, #0x9d0] ; = 0x0 (u64 @ 0x558b9d0)
  0x23412ec: cbz      x22, #0x2341408
  0x23412f0: ldrb     w1, [x19, #0x58]
  0x23412f4: adrp     x20, #0x558b000
  0x23412f8: ldr      x20, [x20, #0x9a0] ; = 0x0 (u64 @ 0x558b9a0)
  0x23412fc: mov      x0, x19
  0x2341300: bl       #0x2341ad0 ; -> CItem$$GetEnchantFactor
  0x2341304: ldrb     w1, [x19, #0x65]
  0x2341308: mov      x0, x19
  0x234130c: mov      v8.16b, v0.16b
  0x2341310: bl       #0x2341c04 ; -> CItem$$GetBreakLimitFactor
  0x2341314: ldrb     w2, [x19, #0x67]
  0x2341318: ldrb     w1, [x19, #0x66]
  0x234131c: mov      x0, x19
  0x2341320: mov      v9.16b, v0.16b
  0x2341324: bl       #0x2341cd8 ; -> CItem$$GetSingularityFactor
  0x2341328: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x234132c: add      x8, sp, #8
  0x2341330: mov      x0, x22
  0x2341334: mov      v10.16b, v0.16b
  0x2341338: bl       #0x446dfb8 ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x234133c: ldur     q0, [sp, #8]
  0x2341340: ldr      x8, [sp, #0x18]
  0x2341344: str      q0, [sp, #0x40]
  0x2341348: str      x8, [sp, #0x50]
  0x234134c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x2341350: add      x0, sp, #0x40
  0x2341354: bl       #0x410e3e0 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x2341358: tbz      w0, #0, #0x23413f4
  0x234135c: ldr      w23, [sp, #0x50]
  0x2341360: cmp      w23, #1
  0x2341364: b.lt     #0x234134c
  0x2341368: ldr      x0, [x20] ; = 0x0 (u64 @ 0x558b000)
  0x234136c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2341370: mov      x22, x0
  0x2341374: mov      w1, w23
  0x2341378: mov      v0.16b, v8.16b
  0x234137c: mov      v1.16b, v9.16b
  0x2341380: mov      x2, x19
  0x2341384: mov      v2.16b, v10.16b
  0x2341388: bl       #0x233f244 ; -> CItemMainOption$$.ctor
  0x234138c: ldr      x0, [x19, #0x10]
  0x2341390: cbz      x0, #0x23418e0
  0x2341394: ldr      w10, [x0, #0x1c]
  0x2341398: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x558b010)
  0x234139c: ldr      x9, [x26] ; = 0x0 (u64 @ 0x558b000)
  0x23413a0: add      w10, w10, #1
  0x23413a4: str      w10, [x0, #0x1c]
  0x23413a8: cbz      x8, #0x23418e4
  0x23413ac: ldrsw    x10, [x0, #0x18]
  0x23413b0: ldr      w11, [x8, #0x18]
  0x23413b4: cmp      w10, w11
  0x23413b8: b.hs     #0x23413dc
  0x23413bc: add      w9, w10, #1
  0x23413c0: add      x8, x8, x10, lsl #3
  0x23413c4: str      w9, [x0, #0x18]
  0x23413c8: str      x22, [x8, #0x20]!
  0x23413cc: mov      x0, x8
  0x23413d0: mov      x1, x22
  0x23413d4: bl       #0x21af920 ; -> ??? 0x21af920
  0x23413d8: b        #0x234134c
  0x23413dc: ldr      x8, [x9, #0x20]
  0x23413e0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558b0c0)
  0x23413e4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558b070)
  0x23413e8: mov      x1, x22
  0x23413ec: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x23413f0: b        #0x234134c
  0x23413f4: adrp     x8, #0x558a000
  0x23413f8: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x23413fc: add      x0, sp, #0x40
  0x2341400: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2341404: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2341408: cbz      x21, #0x234156c
  0x234140c: adrp     x8, #0x558b000
  0x2341410: ldr      x8, [x8, #0x9f0] ; = 0x0 (u64 @ 0x558b9f0)
  0x2341414: adrp     x27, #0x558b000
  0x2341418: adrp     x20, #0x558a000
  0x234141c: mov      x0, x21
  0x2341420: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341424: ldr      x27, [x27, #0x9c0] ; = 0x0 (u64 @ 0x558b9c0)
  0x2341428: ldr      x20, [x20, #0x1c8] ; = 0x0 (u64 @ 0x558a1c8)
  0x234142c: add      x8, sp, #8
  0x2341430: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2341434: ldur     q0, [sp, #8]
  0x2341438: ldr      x8, [sp, #0x18]
  0x234143c: str      q0, [sp, #0x20]
  0x2341440: str      x8, [sp, #0x30]
  0x2341444: ldr      x1, [x27] ; = 0x0 (u64 @ 0x558b000)
  0x2341448: add      x0, sp, #0x20
  0x234144c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2341450: tbz      w0, #0, #0x2341550
  0x2341454: ldr      x24, [sp, #0x30]
  0x2341458: cbz      x24, #0x23418d0
  0x234145c: ldr      x0, [x19, #0x38]
  0x2341460: cbz      x0, #0x23418d4
  0x2341464: ldr      w10, [x0, #0x1c]
  0x2341468: ldr      w21, [x24, #0x10]
  0x234146c: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x558b010)
  0x2341470: ldr      x9, [x20] ; = 0x0 (u64 @ 0x558a000)
  0x2341474: add      w10, w10, #1
  0x2341478: str      w10, [x0, #0x1c]
  0x234147c: cbz      x8, #0x23418cc
  0x2341480: ldrsw    x10, [x0, #0x18]
  0x2341484: ldr      w11, [x8, #0x18]
  0x2341488: cmp      w10, w11
  0x234148c: b.hs     #0x23414a4
  0x2341490: add      w9, w10, #1
  0x2341494: add      x8, x8, x10, lsl #2
  0x2341498: str      w9, [x0, #0x18]
  0x234149c: str      w21, [x8, #0x20]
  0x23414a0: b        #0x23414b8
  0x23414a4: ldr      x8, [x9, #0x20]
  0x23414a8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558b0c0)
  0x23414ac: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558b070)
  0x23414b0: mov      w1, w21
  0x23414b4: bl       #0x446d4dc ; -> System.Collections.Generic.List<int>$$AddWithResize
  0x23414b8: cmp      w21, #1
  0x23414bc: b.lt     #0x2341444
  0x23414c0: ldr      w22, [x24, #0x10]
  0x23414c4: ldrb     w23, [x24, #0x15]
  0x23414c8: ldrb     w24, [x24, #0x14]
  0x23414cc: ldr      x0, [x29] ; = 0x0 (u64 @ 0x558b000)
  0x23414d0: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x23414d4: mov      x21, x0
  0x23414d8: mov      w1, w22
  0x23414dc: mov      w2, w23
  0x23414e0: mov      w3, w24
  0x23414e4: bl       #0x233f4e8 ; -> CItemSubOptionData$$.ctor
  0x23414e8: ldr      x0, [x19, #0x18]
  0x23414ec: cbz      x0, #0x23418ec
  0x23414f0: ldr      w10, [x0, #0x1c]
  0x23414f4: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x558b010)
  0x23414f8: ldr      x9, [x26] ; = 0x0 (u64 @ 0x558b000)
  0x23414fc: add      w10, w10, #1
  0x2341500: str      w10, [x0, #0x1c]
  0x2341504: cbz      x8, #0x23418e8
  0x2341508: ldrsw    x10, [x0, #0x18]
  0x234150c: ldr      w11, [x8, #0x18]
  0x2341510: cmp      w10, w11
  0x2341514: b.hs     #0x2341538
  0x2341518: add      w9, w10, #1
  0x234151c: add      x8, x8, x10, lsl #3
  0x2341520: str      w9, [x0, #0x18]
  0x2341524: str      x21, [x8, #0x20]!
  0x2341528: mov      x0, x8
  0x234152c: mov      x1, x21
  0x2341530: bl       #0x21af920 ; -> ??? 0x21af920
  0x2341534: b        #0x2341444
  0x2341538: ldr      x8, [x9, #0x20]
  0x234153c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x558b0c0)
  0x2341540: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x558b070)
  0x2341544: mov      x1, x21
  0x2341548: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x234154c: b        #0x2341444
  0x2341550: adrp     x8, #0x558b000
  0x2341554: ldr      x8, [x8, #0x9b8] ; = 0x0 (u64 @ 0x558b9b8)
  0x2341558: add      x0, sp, #0x20
  0x234155c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341560: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2341564: adrp     x24, #0x558a000
  0x2341568: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x234156c: ldr      x8, [x19, #0x70]
  0x2341570: cbz      x8, #0x23418fc
  0x2341574: ldr      x0, [x8, #0x70] ; = 0x0 (u64 @ 0x558b070)
  0x2341578: cbz      x0, #0x23418fc
  0x234157c: adrp     x26, #0x558b000
  0x2341580: adrp     x29, #0x558b000
  0x2341584: adrp     x27, #0x5589000
  0x2341588: ldr      x26, [x26, #0xa18] ; = 0x0 (u64 @ 0x558ba18)
  0x234158c: ldr      x29, [x29, #0xa20] ; = 0x0 (u64 @ 0x558ba20)
  0x2341590: ldr      x27, [x27, #0xf50] ; = 0x0 (u64 @ 0x5589f50)
  0x2341594: ldr      x1, [x25] ; = 0x0 (u64 @ 0x558a000)
  0x2341598: adrp     x25, #0x558b000
  0x234159c: adrp     x20, #0x558b000
  0x23415a0: ldr      x25, [x25, #0x9a8] ; = 0x0 (u64 @ 0x558b9a8)
  0x23415a4: ldr      x20, [x20, #0x9d8] ; = 0x0 (u64 @ 0x558b9d8)
  0x23415a8: add      x8, sp, #8
  0x23415ac: bl       #0x446dfb8 ; -> System.Collections.Generic.List<int>$$GetEnumerator
  0x23415b0: ldur     q0, [sp, #8]
  0x23415b4: ldr      x8, [sp, #0x18]
  0x23415b8: str      q0, [sp, #0x40]
  0x23415bc: str      x8, [sp, #0x50]
  0x23415c0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x558a000)
  0x23415c4: add      x0, sp, #0x40
  0x23415c8: bl       #0x410e3e0 ; -> System.Collections.Generic.List.Enumerator<int>$$MoveNext
  0x23415cc: tbz      w0, #0, #0x23417b0
  0x23415d0: ldr      w23, [sp, #0x50]
  0x23415d4: cmp      w23, #1
  0x23415d8: b.lt     #0x23415c0
  0x23415dc: ldr      x0, [x26] ; = 0x0 (u64 @ 0x558b000)
  0x23415e0: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x23415e4: mov      x21, x0
  0x23415e8: mov      x1, xzr
  0x23415ec: bl       #0x2416030 ; -> CItem.<>c__DisplayClass122_0$$.ctor
  0x23415f0: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558a000)
  0x23415f4: ldr      w8, [x0, #0xe0]
  0x23415f8: cbnz     w8, #0x2341600
  0x23415fc: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2341600: mov      x0, xzr
  0x2341604: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341608: cbz      x0, #0x23418d8
  0x234160c: mov      w1, w23
  0x2341610: mov      x2, xzr
  0x2341614: bl       #0x26313c0 ; -> CTempletManager$$GetItemSpecialOptionTemplet
  0x2341618: mov      x1, x0
  0x234161c: cbz      x21, #0x23418dc
  0x2341620: mov      x22, x21
  0x2341624: str      x1, [x22, #0x10]!
  0x2341628: mov      x0, x22
  0x234162c: bl       #0x21af920 ; -> ??? 0x21af920
  0x2341630: ldr      x8, [x22]
  0x2341634: cbz      x8, #0x23416d0
  0x2341638: ldrb     w23, [x19, #0x65]
  0x234163c: mov      x0, x19
  0x2341640: bl       #0x233f3e0 ; -> CItem$$IsSpecialItemEnchantable
  0x2341644: tbz      w0, #0, #0x234171c
  0x2341648: ldr      x8, [x22]
  0x234164c: cbz      x8, #0x2341900
  0x2341650: ldrb     w9, [x19, #0x58]
  0x2341654: ldr      w23, [x8, #0x18]
  0x2341658: cmp      w9, #0
  0x234165c: csinc    w9, w9, wzr, ne
  0x2341660: cmp      w23, w9
  0x2341664: b.gt     #0x23415c0
  0x2341668: ldrb     w8, [x8, #0x1c]
  0x234166c: cbnz     w8, #0x2341720
  0x2341670: adrp     x8, #0x558b000
  0x2341674: ldr      x24, [x19, #0x28]
  0x2341678: ldr      x8, [x8, #0xa08] ; = 0x0 (u64 @ 0x558ba08)
  0x234167c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341680: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2341684: adrp     x8, #0x558b000
  0x2341688: ldr      x8, [x8, #0xa10] ; = 0x0 (u64 @ 0x558ba10)
  0x234168c: mov      x25, x0
  0x2341690: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341694: mov      x1, x21
  0x2341698: mov      x3, xzr
  0x234169c: bl       #0x46a5a40 ; -> System.Predicate<object>$$.ctor
  0x23416a0: cbz      x24, #0x2341904
  0x23416a4: adrp     x8, #0x558b000
  0x23416a8: ldr      x8, [x8, #0x9f8] ; = 0x0 (u64 @ 0x558b9f8)
  0x23416ac: ldr      x2, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x23416b0: mov      x1, x25
  0x23416b4: adrp     x25, #0x558b000
  0x23416b8: ldr      x25, [x25, #0x9a8] ; = 0x0 (u64 @ 0x558b9a8)
  0x23416bc: mov      x0, x24
  0x23416c0: bl       #0x44bc124 ; -> System.Collections.Generic.List<object>$$RemoveAll
  0x23416c4: adrp     x24, #0x558a000
  0x23416c8: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x23416cc: b        #0x2341720
  0x23416d0: adrp     x8, #0x5587000
  0x23416d4: ldr      x8, [x8, #0xa48] ; = 0x0 (u64 @ 0x5587a48)
  0x23416d8: str      w23, [sp, #8]
  0x23416dc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5587000)
  0x23416e0: add      x1, sp, #8
  0x23416e4: bl       #0x21afafc ; -> ??? 0x21afafc
  0x23416e8: mov      x1, x0
  0x23416ec: ldr      x0, [x29] ; = 0x0 (u64 @ 0x558b000)
  0x23416f0: mov      x2, xzr
  0x23416f4: bl       #0x4770938 ; -> System.String$$Format
  0x23416f8: mov      x21, x0
  0x23416fc: ldr      x0, [x27] ; = 0x0 (u64 @ 0x5589000)
  0x2341700: ldr      w8, [x0, #0xe0]
  0x2341704: cbnz     w8, #0x234170c
  0x2341708: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x234170c: mov      x0, x21
  0x2341710: mov      x1, xzr
  0x2341714: bl       #0x2ca73cc ; -> CDebug$$LogError
  0x2341718: b        #0x23415c0
  0x234171c: add      w23, w23, #1
  0x2341720: ldr      x8, [x22]
  0x2341724: cbz      x8, #0x23418f4
  0x2341728: ldr      w22, [x8, #0x10]
  0x234172c: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558b000)
  0x2341730: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2341734: mov      x21, x0
  0x2341738: mov      w1, w22
  0x234173c: mov      w2, w23
  0x2341740: mov      w3, wzr
  0x2341744: bl       #0x233f894 ; -> CItemSpecialOption$$.ctor
  0x2341748: ldr      x0, [x19, #0x28]
  0x234174c: cbz      x0, #0x23418f8
  0x2341750: ldr      w10, [x0, #0x1c]
  0x2341754: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x558b010)
  0x2341758: ldr      x9, [x20] ; = 0x0 (u64 @ 0x558b000)
  0x234175c: add      w10, w10, #1
  0x2341760: str      w10, [x0, #0x1c]
  0x2341764: cbz      x8, #0x23418f0
  0x2341768: ldrsw    x10, [x0, #0x18]
  0x234176c: ldr      w11, [x8, #0x18]
  0x2341770: cmp      w10, w11
  0x2341774: b.hs     #0x2341798
  0x2341778: add      w9, w10, #1
  0x234177c: add      x8, x8, x10, lsl #3
  0x2341780: str      w9, [x0, #0x18]
  0x2341784: str      x21, [x8, #0x20]!
  0x2341788: mov      x0, x8
  0x234178c: mov      x1, x21
  0x2341790: bl       #0x21af920 ; -> ??? 0x21af920
  0x2341794: b        #0x23415c0
  0x2341798: ldr      x8, [x9, #0x20]
  0x234179c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55870c0)
  0x23417a0: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x5587070)
  0x23417a4: mov      x1, x21
  0x23417a8: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x23417ac: b        #0x23415c0
  0x23417b0: adrp     x8, #0x558a000
  0x23417b4: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x23417b8: add      x0, sp, #0x40
  0x23417bc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23417c0: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x23417c4: ldr      w20, [sp, #0x6c]
  0x23417c8: cmp      w20, #1
  0x23417cc: b.lt     #0x23417fc
  0x23417d0: ldr      x0, [x25] ; = 0x0 (u64 @ 0x558b000)
  0x23417d4: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x23417d8: mov      w2, #1
  0x23417dc: mov      w1, w20
  0x23417e0: mov      w3, wzr
  0x23417e4: mov      x21, x0
  0x23417e8: bl       #0x233f894 ; -> CItemSpecialOption$$.ctor
  0x23417ec: mov      x0, x19
  0x23417f0: str      x21, [x0, #0x30]!
  0x23417f4: mov      x1, x21
  0x23417f8: bl       #0x21af920 ; -> ??? 0x21af920
  0x23417fc: ldr      x8, [x19, #0x10]
  0x2341800: fmov     s0, wzr
  0x2341804: cbz      x8, #0x23418a0
  0x2341808: ldr      w8, [x8, #0x18]
  0x234180c: cmp      w8, #1
  0x2341810: b.lt     #0x23418a0
  0x2341814: ldr      x8, [x19, #0x70]
  0x2341818: cbz      x8, #0x23418fc
  0x234181c: ldr      w8, [x8, #0x38]
  0x2341820: sub      w8, w8, #1
  0x2341824: cmp      w8, #2
  0x2341828: b.hi     #0x234183c
  0x234182c: adrp     x9, #0x106d000
  0x2341830: add      x9, x9, #0xbc0
  0x2341834: ldr      s8, [x9, w8, sxtw #2] ; = 6.648889921838564e-38 (f32 @ 0x106d002)
  0x2341838: b        #0x2341844
  0x234183c: adrp     x8, #0x106d000
  0x2341840: ldr      s8, [x8, #0x678] ; = 0.6000000238418579 (f32 @ 0x106d678)
  0x2341844: mov      x0, x19
  0x2341848: bl       #0x2341e68 ; -> CItem$$GetBasicStarPoint
  0x234184c: ldrb     w8, [x19, #0x65]
  0x2341850: fmov     s1, #1.00000000
  0x2341854: sub      w8, w8, #2
  0x2341858: cmp      w8, #3
  0x234185c: b.hi     #0x2341870
  0x2341860: adrp     x9, #0x106c000
  0x2341864: sxtb     x8, w8
  0x2341868: add      x9, x9, #0x530
  0x234186c: ldr      s1, [x9, x8, lsl #2] ; = 9.554553383390208e+20 (f32 @ 0x106c002)
  0x2341870: ldrb     w8, [x19, #0x58]
  0x2341874: fmul     s0, s8, s0
  0x2341878: adrp     x9, #0x106d000
  0x234187c: fmul     s0, s0, s1
  0x2341880: ldr      s1, [x9, #0x884] ; = 0.07999999821186066 (f32 @ 0x106d884)
  0x2341884: sub      w8, w8, #1
  0x2341888: scvtf    s3, w8
  0x234188c: fmov     s2, #5.00000000
  0x2341890: fmul     s3, s0, s3
  0x2341894: fmul     s1, s3, s1
  0x2341898: fdiv     s0, s0, s2
  0x234189c: fadd     s0, s0, s1
  0x23418a0: str      s0, [x19, #0x40]
  0x23418a4: ldp      x20, x19, [sp, #0xd0]
  0x23418a8: ldp      x22, x21, [sp, #0xc0]
  0x23418ac: ldp      x24, x23, [sp, #0xb0]
  0x23418b0: ldp      x26, x25, [sp, #0xa0]
  0x23418b4: ldp      x28, x27, [sp, #0x90]
  0x23418b8: ldp      x29, x30, [sp, #0x80]
  0x23418bc: ldp      d9, d8, [sp, #0x70]
  0x23418c0: ldr      d10, [sp, #0x60]
  0x23418c4: add      sp, sp, #0xe0
  0x23418c8: ret      
  0x23418cc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418d0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418d4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418d8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418dc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418e0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418e4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418e8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418ec: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418f0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418f4: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418f8: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x23418fc: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2341900: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2341904: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2341908: b        #0x23419ec
  0x234190c: b        #0x234194c
  0x2341910: b        #0x234194c
  0x2341914: b        #0x234194c
  0x2341918: b        #0x23419ec
  0x234191c: b        #0x23419ec
  0x2341920: b        #0x23419ec
  0x2341924: b        #0x234194c
  0x2341928: b        #0x2341a54
  0x234192c: b        #0x23419ec
  0x2341930: b        #0x2341a54
  0x2341934: b        #0x2341974
  0x2341938: b        #0x23419ec
  0x234193c: b        #0x234194c
  0x2341940: b        #0x23419ec
  0x2341944: b        #0x23419ec
  0x2341948: b        #0x234194c
  0x234194c: adrp     x25, #0x558b000
  0x2341950: ldr      w20, [sp, #0x6c]
  0x2341954: ldr      x25, [x25, #0x9a8] ; = 0x0 (u64 @ 0x558b9a8)
  0x2341958: b        #0x23419f0
  0x234195c: b        #0x2341a54
  0x2341960: b        #0x2341a54
  0x2341964: b        #0x2341974
  0x2341968: b        #0x2341a54
  0x234196c: b        #0x2341a54
  0x2341970: b        #0x2341974
  0x2341974: mov      x22, x0
  0x2341978: cmp      w1, #1
  0x234197c: b.ne     #0x23419b8
  0x2341980: mov      x0, x22
  0x2341984: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2341988: ldr      x23, [x0] ; = 0x0 (u64 @ 0x558b000)
  0x234198c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2341990: adrp     x8, #0x558a000
  0x2341994: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x2341998: add      x0, sp, #0x40
  0x234199c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23419a0: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x23419a4: adrp     x24, #0x558a000
  0x23419a8: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x23419ac: cbz      x23, #0x2341408
  0x23419b0: mov      x0, x23
  0x23419b4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x23419b8: mov      x23, xzr
  0x23419bc: b        #0x23419c4
  0x23419c0: mov      x22, x0
  0x23419c4: adrp     x8, #0x558a000
  0x23419c8: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x23419cc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x23419d0: add      x0, sp, #0x40
  0x23419d4: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x23419d8: cbz      x23, #0x2341abc
  0x23419dc: mov      x0, x23
  0x23419e0: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x23419e4: b        #0x23419ec
  0x23419e8: b        #0x23419ec
  0x23419ec: ldr      w20, [sp, #0x6c]
  0x23419f0: mov      x22, x0
  0x23419f4: cmp      w1, #1
  0x23419f8: b.ne     #0x2341a28
  0x23419fc: mov      x0, x22
  0x2341a00: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2341a04: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558b000)
  0x2341a08: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2341a0c: adrp     x8, #0x558a000
  0x2341a10: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x2341a14: add      x0, sp, #0x40
  0x2341a18: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2341a1c: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2341a20: cbz      x21, #0x23417c8
  0x2341a24: b        #0x2341a90
  0x2341a28: mov      x21, xzr
  0x2341a2c: b        #0x2341a34
  0x2341a30: mov      x22, x0
  0x2341a34: adrp     x8, #0x558a000
  0x2341a38: ldr      x8, [x8, #0x188] ; = 0x0 (u64 @ 0x558a188)
  0x2341a3c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2341a40: add      x0, sp, #0x40
  0x2341a44: bl       #0x410e3dc ; -> System.Collections.Generic.List.Enumerator<int>$$Dispose
  0x2341a48: cbz      x21, #0x2341abc
  0x2341a4c: mov      x0, x21
  0x2341a50: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2341a54: adrp     x24, #0x558a000
  0x2341a58: ldr      x24, [x24, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341a5c: mov      x22, x0
  0x2341a60: cmp      w1, #1
  0x2341a64: b.ne     #0x2341a98
  0x2341a68: mov      x0, x22
  0x2341a6c: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2341a70: ldr      x21, [x0] ; = 0x0 (u64 @ 0x558b000)
  0x2341a74: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2341a78: adrp     x8, #0x558b000
  0x2341a7c: ldr      x8, [x8, #0x9b8] ; = 0x0 (u64 @ 0x558b9b8)
  0x2341a80: add      x0, sp, #0x20
  0x2341a84: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341a88: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2341a8c: cbz      x21, #0x234156c
  0x2341a90: mov      x0, x21
  0x2341a94: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2341a98: mov      x21, xzr
  0x2341a9c: b        #0x2341aa4
  0x2341aa0: mov      x22, x0
  0x2341aa4: adrp     x8, #0x558b000
  0x2341aa8: ldr      x8, [x8, #0x9b8] ; = 0x0 (u64 @ 0x558b9b8)
  0x2341aac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x2341ab0: add      x0, sp, #0x20
  0x2341ab4: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2341ab8: cbnz     x21, #0x2341ac4
  0x2341abc: mov      x0, x22
  0x2341ac0: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2341ac4: mov      x0, x21
  0x2341ac8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2341acc: bl       #0x1f86e18 ; -> ??? 0x1f86e18
