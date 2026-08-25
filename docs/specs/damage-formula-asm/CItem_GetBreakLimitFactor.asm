; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetBreakLimitFactor @ 0x2346f4c..0x2347020 (taille 212 octets) =====
  0x2346f4c: stp      x30, x21, [sp, #-0x20]!
  0x2346f50: stp      x20, x19, [sp, #0x10]
  0x2346f54: adrp     x21, #0x59e4000
  0x2346f58: ldrb     w8, [x21, #0xccd]
  0x2346f5c: mov      w19, w1
  0x2346f60: mov      x20, x0
  0x2346f64: tbnz     w8, #0, #0x2346f7c
  0x2346f68: adrp     x0, #0x5598000
  0x2346f6c: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346f70: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346f74: mov      w8, #1
  0x2346f78: strb     w8, [x21, #0xccd]
  0x2346f7c: tst      w19, #0xff
  0x2346f80: b.eq     #0x2347008
  0x2346f84: adrp     x8, #0x5598000
  0x2346f88: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346f8c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2346f90: ldr      w8, [x0, #0xe0]
  0x2346f94: cbnz     w8, #0x2346f9c
  0x2346f98: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2346f9c: mov      x0, xzr
  0x2346fa0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2346fa4: ldr      x8, [x20, #0x70]
  0x2346fa8: cbz      x8, #0x2347018
  0x2346fac: cbz      x0, #0x2347018
  0x2346fb0: ldr      w2, [x8, #0x38]
  0x2346fb4: ldrb     w1, [x8, #0x3c]
  0x2346fb8: mov      x3, xzr
  0x2346fbc: bl       #0x2639dfc ; -> CTempletManager$$GetBreakLimitTemplet
  0x2346fc0: cbz      x0, #0x2347018
  0x2346fc4: ldr      x9, [x0, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x2346fc8: and      w10, w19, #0xff
  0x2346fcc: cmp      w10, #1
  0x2346fd0: mov      x8, xzr
  0x2346fd4: csinc    w10, w10, wzr, hi
  0x2346fd8: add      x11, x9, #0x20
  0x2346fdc: fmov     s0, wzr
  0x2346fe0: cbz      x9, #0x2347018
  0x2346fe4: ldr      w12, [x9, #0x18]
  0x2346fe8: cmp      x8, x12
  0x2346fec: b.hs     #0x234701c
  0x2346ff0: ldr      s1, [x11, x8, lsl #2]
  0x2346ff4: add      x8, x8, #1
  0x2346ff8: cmp      x10, x8
  0x2346ffc: fadd     s0, s0, s1
  0x2347000: b.ne     #0x2346fe0
  0x2347004: b        #0x234700c
  0x2347008: fmov     s0, wzr
  0x234700c: ldp      x20, x19, [sp, #0x10]
  0x2347010: ldp      x30, x21, [sp], #0x20
  0x2347014: ret      
  0x2347018: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x234701c: bl       #0x21b4d28 ; -> ??? 0x21b4d28
