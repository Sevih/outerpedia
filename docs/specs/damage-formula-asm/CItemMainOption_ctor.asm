; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItemMainOption_ctor @ 0x233f244..0x233f3e0 (taille 412 octets) =====
  0x233f244: sub      sp, sp, #0x60
  0x233f248: str      d8, [sp, #0x20]
  0x233f24c: str      x30, [sp, #0x28]
  0x233f250: stp      x24, x23, [sp, #0x30]
  0x233f254: stp      x22, x21, [sp, #0x40]
  0x233f258: stp      x20, x19, [sp, #0x50]
  0x233f25c: str      d1, [sp]
  0x233f260: str      d0, [sp, #0x10]
  0x233f264: adrp     x23, #0x59d5000
  0x233f268: adrp     x24, #0x558b000
  0x233f26c: adrp     x22, #0x558b000
  0x233f270: ldrb     w8, [x23, #0xa4]
  0x233f274: ldr      x24, [x24, #0x898] ; = 0x0 (u64 @ 0x558b898)
  0x233f278: ldr      x22, [x22, #0x8a0] ; = 0x0 (u64 @ 0x558b8a0)
  0x233f27c: mov      v8.16b, v2.16b
  0x233f280: mov      x20, x2
  0x233f284: mov      w21, w1
  0x233f288: mov      x19, x0
  0x233f28c: tbnz     w8, #0, #0x233f2b0
  0x233f290: adrp     x0, #0x558b000
  0x233f294: ldr      x0, [x0, #0x8a0] ; = 0x0 (u64 @ 0x558b8a0)
  0x233f298: bl       #0x21af97c ; -> ??? 0x21af97c
  0x233f29c: adrp     x0, #0x558b000
  0x233f2a0: ldr      x0, [x0, #0x898] ; = 0x0 (u64 @ 0x558b898)
  0x233f2a4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x233f2a8: mov      w8, #1
  0x233f2ac: strb     w8, [x23, #0xa4]
  0x233f2b0: ldr      x0, [x24] ; = 0x0 (u64 @ 0x558b000)
  0x233f2b4: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x233f2b8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x558b000)
  0x233f2bc: mov      x22, x0
  0x233f2c0: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x233f2c4: mov      x0, x19
  0x233f2c8: str      x22, [x0, #0x38]!
  0x233f2cc: mov      x1, x22
  0x233f2d0: bl       #0x21af920 ; -> ??? 0x21af920
  0x233f2d4: mov      x0, x19
  0x233f2d8: mov      x1, xzr
  0x233f2dc: bl       #0x49475a0 ; -> System.Object$$.ctor
  0x233f2e0: mov      x0, x19
  0x233f2e4: mov      w1, w21
  0x233f2e8: bl       #0x233f0a4 ; -> CItemOption$$set_ID
  0x233f2ec: ldp      q0, q3, [sp]
  0x233f2f0: mov      w9, #0x447a0000
  0x233f2f4: ldr      x8, [x19, #0x18]
  0x233f2f8: fmov     s1, w9
  0x233f2fc: mov      v3.s[1], v0.s[0]
  0x233f300: dup      v0.2s, w9
  0x233f304: fmul     s2, s8, s1
  0x233f308: fmul     v3.2s, v3.2s, v0.2s
  0x233f30c: fdiv     s1, s2, s1
  0x233f310: fdiv     v0.2s, v3.2s, v0.2s
  0x233f314: str      wzr, [x19, #0x10]
  0x233f318: str      d0, [x19, #0x20]
  0x233f31c: str      s1, [x19, #0x28]
  0x233f320: cbz      x8, #0x233f340
  0x233f324: ldr      w9, [x8, #0x18]
  0x233f328: cmp      w9, #1
  0x233f32c: b.ne     #0x233f340
  0x233f330: ldr      x0, [x8, #0x38]
  0x233f334: mov      x1, xzr
  0x233f338: bl       #0x4779b0c ; -> System.String$$IsNullOrEmpty
  0x233f33c: tbz      w0, #0, #0x233f35c
  0x233f340: ldp      x20, x19, [sp, #0x50]
  0x233f344: ldp      x22, x21, [sp, #0x40]
  0x233f348: ldp      x24, x23, [sp, #0x30]
  0x233f34c: ldr      x30, [sp, #0x28]
  0x233f350: ldr      d8, [sp, #0x20]
  0x233f354: add      sp, sp, #0x60
  0x233f358: ret      
  0x233f35c: cbz      x20, #0x233f390
  0x233f360: mov      x0, x20
  0x233f364: bl       #0x233f3e0 ; -> CItem$$IsSpecialItemEnchantable
  0x233f368: tbz      w0, #0, #0x233f390
  0x233f36c: mov      x0, xzr
  0x233f370: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x233f374: ldr      x8, [x19, #0x18]
  0x233f378: cbz      x8, #0x233f3dc
  0x233f37c: cbz      x0, #0x233f3dc
  0x233f380: ldrb     w9, [x20, #0x58]
  0x233f384: ldr      x1, [x8, #0x38]
  0x233f388: add      w2, w9, #1
  0x233f38c: b        #0x233f3ac
  0x233f390: mov      x0, xzr
  0x233f394: bl       #0x25edb4c ; -> CBuffTempletContainer$$get_Instance
  0x233f398: ldr      x8, [x19, #0x18]
  0x233f39c: cbz      x8, #0x233f3dc
  0x233f3a0: cbz      x0, #0x233f3dc
  0x233f3a4: ldr      x1, [x8, #0x38]
  0x233f3a8: mov      w2, #1
  0x233f3ac: mov      x3, xzr
  0x233f3b0: bl       #0x25ee01c ; -> CBuffTempletContainer$$GetBuffTemplet
  0x233f3b4: str      x0, [x19, #0x30]!
  0x233f3b8: mov      x1, x0
  0x233f3bc: mov      x0, x19
  0x233f3c0: ldp      x20, x19, [sp, #0x50]
  0x233f3c4: ldp      x22, x21, [sp, #0x40]
  0x233f3c8: ldp      x24, x23, [sp, #0x30]
  0x233f3cc: ldr      x30, [sp, #0x28]
  0x233f3d0: ldr      d8, [sp, #0x20]
  0x233f3d4: add      sp, sp, #0x60
  0x233f3d8: b        #0x21af920
  0x233f3dc: bl       #0x21afc18 ; -> ??? 0x21afc18
