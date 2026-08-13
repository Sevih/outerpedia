; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetBreakLimitFactor @ 0x2341c04..0x2341cd8 (taille 212 octets) =====
  0x2341c04: stp      x30, x21, [sp, #-0x20]!
  0x2341c08: stp      x20, x19, [sp, #0x10]
  0x2341c0c: adrp     x21, #0x59d5000
  0x2341c10: ldrb     w8, [x21, #0xbc]
  0x2341c14: mov      w19, w1
  0x2341c18: mov      x20, x0
  0x2341c1c: tbnz     w8, #0, #0x2341c34
  0x2341c20: adrp     x0, #0x558a000
  0x2341c24: ldr      x0, [x0, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341c28: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2341c2c: mov      w8, #1
  0x2341c30: strb     w8, [x21, #0xbc]
  0x2341c34: tst      w19, #0xff
  0x2341c38: b.eq     #0x2341cc0
  0x2341c3c: adrp     x8, #0x558a000
  0x2341c40: ldr      x8, [x8, #0x88] ; = 0x0 (u64 @ 0x558a088)
  0x2341c44: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2341c48: ldr      w8, [x0, #0xe0]
  0x2341c4c: cbnz     w8, #0x2341c54
  0x2341c50: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2341c54: mov      x0, xzr
  0x2341c58: bl       #0x261aa78 ; -> CTempletManager$$get_Instance
  0x2341c5c: ldr      x8, [x20, #0x70]
  0x2341c60: cbz      x8, #0x2341cd0
  0x2341c64: cbz      x0, #0x2341cd0
  0x2341c68: ldr      w2, [x8, #0x38]
  0x2341c6c: ldrb     w1, [x8, #0x3c]
  0x2341c70: mov      x3, xzr
  0x2341c74: bl       #0x2633248 ; -> CTempletManager$$GetBreakLimitTemplet
  0x2341c78: cbz      x0, #0x2341cd0
  0x2341c7c: ldr      x9, [x0, #0x28] ; = 0x0 (u64 @ 0x558a028)
  0x2341c80: and      w10, w19, #0xff
  0x2341c84: cmp      w10, #1
  0x2341c88: mov      x8, xzr
  0x2341c8c: csinc    w10, w10, wzr, hi
  0x2341c90: add      x11, x9, #0x20
  0x2341c94: fmov     s0, wzr
  0x2341c98: cbz      x9, #0x2341cd0
  0x2341c9c: ldr      w12, [x9, #0x18]
  0x2341ca0: cmp      x8, x12
  0x2341ca4: b.hs     #0x2341cd4
  0x2341ca8: ldr      s1, [x11, x8, lsl #2]
  0x2341cac: add      x8, x8, #1
  0x2341cb0: cmp      x10, x8
  0x2341cb4: fadd     s0, s0, s1
  0x2341cb8: b.ne     #0x2341c98
  0x2341cbc: b        #0x2341cc4
  0x2341cc0: fmov     s0, wzr
  0x2341cc4: ldp      x20, x19, [sp, #0x10]
  0x2341cc8: ldp      x30, x21, [sp], #0x20
  0x2341ccc: ret      
  0x2341cd0: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2341cd4: bl       #0x21afc20 ; -> ??? 0x21afc20
