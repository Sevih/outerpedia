; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItemMainOption_ctor @ 0x234458c..0x2344728 (taille 412 octets) =====
  0x234458c: sub      sp, sp, #0x60
  0x2344590: str      d8, [sp, #0x20]
  0x2344594: str      x30, [sp, #0x28]
  0x2344598: stp      x24, x23, [sp, #0x30]
  0x234459c: stp      x22, x21, [sp, #0x40]
  0x23445a0: stp      x20, x19, [sp, #0x50]
  0x23445a4: str      d1, [sp]
  0x23445a8: str      d0, [sp, #0x10]
  0x23445ac: adrp     x23, #0x59e4000
  0x23445b0: adrp     x24, #0x559a000
  0x23445b4: adrp     x22, #0x559a000
  0x23445b8: ldrb     w8, [x23, #0xcb5]
  0x23445bc: ldr      x24, [x24, #0x3c8] ; = 0x0 (u64 @ 0x559a3c8)
  0x23445c0: ldr      x22, [x22, #0x3d0] ; = 0x0 (u64 @ 0x559a3d0)
  0x23445c4: mov      v8.16b, v2.16b
  0x23445c8: mov      x20, x2
  0x23445cc: mov      w21, w1
  0x23445d0: mov      x19, x0
  0x23445d4: tbnz     w8, #0, #0x23445f8
  0x23445d8: adrp     x0, #0x559a000
  0x23445dc: ldr      x0, [x0, #0x3d0] ; = 0x0 (u64 @ 0x559a3d0)
  0x23445e0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23445e4: adrp     x0, #0x559a000
  0x23445e8: ldr      x0, [x0, #0x3c8] ; = 0x0 (u64 @ 0x559a3c8)
  0x23445ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x23445f0: mov      w8, #1
  0x23445f4: strb     w8, [x23, #0xcb5]
  0x23445f8: ldr      x0, [x24] ; = 0x0 (u64 @ 0x559a000)
  0x23445fc: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x2344600: ldr      x1, [x22] ; = 0x0 (u64 @ 0x559a000)
  0x2344604: mov      x22, x0
  0x2344608: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x234460c: mov      x0, x19
  0x2344610: str      x22, [x0, #0x38]!
  0x2344614: mov      x1, x22
  0x2344618: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x234461c: mov      x0, x19
  0x2344620: mov      x1, xzr
  0x2344624: bl       #0x4955ea4 ; -> System.Object$$.ctor
  0x2344628: mov      x0, x19
  0x234462c: mov      w1, w21
  0x2344630: bl       #0x23443ec ; -> CItemOption$$set_ID
  0x2344634: ldp      q0, q3, [sp]
  0x2344638: mov      w9, #0x447a0000
  0x234463c: ldr      x8, [x19, #0x18]
  0x2344640: fmov     s1, w9
  0x2344644: mov      v3.s[1], v0.s[0]
  0x2344648: dup      v0.2s, w9
  0x234464c: fmul     s2, s8, s1
  0x2344650: fmul     v3.2s, v3.2s, v0.2s
  0x2344654: fdiv     s1, s2, s1
  0x2344658: fdiv     v0.2s, v3.2s, v0.2s
  0x234465c: str      wzr, [x19, #0x10]
  0x2344660: str      d0, [x19, #0x20]
  0x2344664: str      s1, [x19, #0x28]
  0x2344668: cbz      x8, #0x2344688
  0x234466c: ldr      w9, [x8, #0x18]
  0x2344670: cmp      w9, #1
  0x2344674: b.ne     #0x2344688
  0x2344678: ldr      x0, [x8, #0x38]
  0x234467c: mov      x1, xzr
  0x2344680: bl       #0x4788410 ; -> System.String$$IsNullOrEmpty
  0x2344684: tbz      w0, #0, #0x23446a4
  0x2344688: ldp      x20, x19, [sp, #0x50]
  0x234468c: ldp      x22, x21, [sp, #0x40]
  0x2344690: ldp      x24, x23, [sp, #0x30]
  0x2344694: ldr      x30, [sp, #0x28]
  0x2344698: ldr      d8, [sp, #0x20]
  0x234469c: add      sp, sp, #0x60
  0x23446a0: ret      
  0x23446a4: cbz      x20, #0x23446d8
  0x23446a8: mov      x0, x20
  0x23446ac: bl       #0x2344728 ; -> CItem$$IsSpecialItemEnchantable
  0x23446b0: tbz      w0, #0, #0x23446d8
  0x23446b4: mov      x0, xzr
  0x23446b8: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x23446bc: ldr      x8, [x19, #0x18]
  0x23446c0: cbz      x8, #0x2344724
  0x23446c4: cbz      x0, #0x2344724
  0x23446c8: ldrb     w9, [x20, #0x58]
  0x23446cc: ldr      x1, [x8, #0x38]
  0x23446d0: add      w2, w9, #1
  0x23446d4: b        #0x23446f4
  0x23446d8: mov      x0, xzr
  0x23446dc: bl       #0x25f46cc ; -> CBuffTempletContainer$$get_Instance
  0x23446e0: ldr      x8, [x19, #0x18]
  0x23446e4: cbz      x8, #0x2344724
  0x23446e8: cbz      x0, #0x2344724
  0x23446ec: ldr      x1, [x8, #0x38]
  0x23446f0: mov      w2, #1
  0x23446f4: mov      x3, xzr
  0x23446f8: bl       #0x25f4b9c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x23446fc: str      x0, [x19, #0x30]!
  0x2344700: mov      x1, x0
  0x2344704: mov      x0, x19
  0x2344708: ldp      x20, x19, [sp, #0x50]
  0x234470c: ldp      x22, x21, [sp, #0x40]
  0x2344710: ldp      x24, x23, [sp, #0x30]
  0x2344714: ldr      x30, [sp, #0x28]
  0x2344718: ldr      d8, [sp, #0x20]
  0x234471c: add      sp, sp, #0x60
  0x2344720: b        #0x21b4a28
  0x2344724: bl       #0x21b4d20 ; -> ??? 0x21b4d20
