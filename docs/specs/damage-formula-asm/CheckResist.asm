; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CheckResist @ 0x2cb21ac..0x2cb226c (taille 192 octets) =====
  0x2cb21ac: stp      d9, d8, [sp, #-0x20]!
  0x2cb21b0: stp      x30, x19, [sp, #0x10]
  0x2cb21b4: subs     w8, w1, w0
  0x2cb21b8: b.lt     #0x2cb225c
  0x2cb21bc: cmp      w8, #0
  0x2cb21c0: mov      w9, #0x42c80000
  0x2cb21c4: adrp     x19, #0x59d5000
  0x2cb21c8: csinc    w8, w8, wzr, ne
  0x2cb21cc: fmov     s0, w9
  0x2cb21d0: ldrb     w9, [x19, #8]
  0x2cb21d4: scvtf    s1, w8
  0x2cb21d8: fdiv     s0, s0, s1
  0x2cb21dc: fmov     s1, #1.00000000
  0x2cb21e0: mov      w8, #0x447a0000
  0x2cb21e4: fadd     s8, s0, s1
  0x2cb21e8: fmov     s9, w8
  0x2cb21ec: cbnz     w9, #0x2cb2204
  0x2cb21f0: adrp     x0, #0x5588000
  0x2cb21f4: ldr      x0, [x0, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb21f8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb21fc: mov      w8, #1
  0x2cb2200: strb     w8, [x19, #8]
  0x2cb2204: adrp     x8, #0x5588000
  0x2cb2208: ldr      x8, [x8, #0x530] ; = 0x0 (u64 @ 0x5588530)
  0x2cb220c: fdiv     s8, s9, s8
  0x2cb2210: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5588000)
  0x2cb2214: ldr      w8, [x0, #0xe0]
  0x2cb2218: cbnz     w8, #0x2cb2220
  0x2cb221c: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb2220: mov      w8, #0x7f800000
  0x2cb2224: frintm   s0, s8
  0x2cb2228: fmov     s1, w8
  0x2cb222c: fcvtms   w9, s8
  0x2cb2230: fcmp     s0, s1
  0x2cb2234: mov      w8, #-0xffffffff80000000
  0x2cb2238: csel     w19, w8, w9, eq
  0x2cb223c: cmp      w19, #1
  0x2cb2240: b.lt     #0x2cb225c
  0x2cb2244: mov      w1, #0x3e8
  0x2cb2248: mov      w0, wzr
  0x2cb224c: bl       #0x2cb1b04 ; -> CFormula$$GetBattleRandomRange
  0x2cb2250: cmp      w0, w19
  0x2cb2254: cset     w0, le
  0x2cb2258: b        #0x2cb2260
  0x2cb225c: mov      w0, wzr
  0x2cb2260: ldp      x30, x19, [sp, #0x10]
  0x2cb2264: ldp      d9, d8, [sp], #0x20
  0x2cb2268: ret      
