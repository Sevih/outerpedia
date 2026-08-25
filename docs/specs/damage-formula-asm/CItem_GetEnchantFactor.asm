; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetEnchantFactor @ 0x2346e18..0x2346f4c (taille 308 octets) =====
  0x2346e18: str      d8, [sp, #-0x40]!
  0x2346e1c: stp      x30, x23, [sp, #0x10]
  0x2346e20: stp      x22, x21, [sp, #0x20]
  0x2346e24: stp      x20, x19, [sp, #0x30]
  0x2346e28: adrp     x21, #0x59e4000
  0x2346e2c: adrp     x22, #0x5598000
  0x2346e30: ldrb     w8, [x21, #0xccc]
  0x2346e34: ldr      x22, [x22, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346e38: mov      w19, w1
  0x2346e3c: mov      x20, x0
  0x2346e40: tbnz     w8, #0, #0x2346e70
  0x2346e44: adrp     x0, #0x5598000
  0x2346e48: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2346e4c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346e50: adrp     x0, #0x559a000
  0x2346e54: ldr      x0, [x0, #0x558] ; = 0x0 (u64 @ 0x559a558)
  0x2346e58: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346e5c: adrp     x0, #0x559a000
  0x2346e60: ldr      x0, [x0, #0x560] ; = 0x0 (u64 @ 0x559a560)
  0x2346e64: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2346e68: mov      w8, #1
  0x2346e6c: strb     w8, [x21, #0xccc]
  0x2346e70: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2346e74: ldr      w8, [x0, #0xe0]
  0x2346e78: cbnz     w8, #0x2346e80
  0x2346e7c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2346e80: mov      x0, xzr
  0x2346e84: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2346e88: ldr      x8, [x20, #0x70]
  0x2346e8c: cbz      x8, #0x2346f48
  0x2346e90: cbz      x0, #0x2346f48
  0x2346e94: ldr      w1, [x8, #0x34]
  0x2346e98: mov      x2, xzr
  0x2346e9c: bl       #0x262e674 ; -> CTempletManager$$GetEnchantTempletList
  0x2346ea0: cbz      x0, #0x2346f48
  0x2346ea4: ldr      w22, [x0, #0x18]
  0x2346ea8: mov      x20, x0
  0x2346eac: cmp      w22, #1
  0x2346eb0: b.lt     #0x2346f2c
  0x2346eb4: adrp     x23, #0x559a000
  0x2346eb8: ldr      x23, [x23, #0x560] ; = 0x0 (u64 @ 0x559a560)
  0x2346ebc: mov      w21, wzr
  0x2346ec0: fmov     s8, wzr
  0x2346ec4: ldr      x2, [x23] ; = 0x0 (u64 @ 0x559a000)
  0x2346ec8: mov      x0, x20
  0x2346ecc: mov      w1, w21
  0x2346ed0: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2346ed4: cbz      x0, #0x2346f48
  0x2346ed8: ldrb     w8, [x0, #0x14]
  0x2346edc: cbz      w8, #0x2346f1c
  0x2346ee0: ldr      x2, [x23] ; = 0x0 (u64 @ 0x559a000)
  0x2346ee4: mov      x0, x20
  0x2346ee8: mov      w1, w21
  0x2346eec: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2346ef0: cbz      x0, #0x2346f48
  0x2346ef4: ldrb     w8, [x0, #0x14]
  0x2346ef8: cmp      w8, w19, uxtb
  0x2346efc: b.hi     #0x2346f30
  0x2346f00: ldr      x2, [x23] ; = 0x0 (u64 @ 0x559a000)
  0x2346f04: mov      x0, x20
  0x2346f08: mov      w1, w21
  0x2346f0c: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2346f10: cbz      x0, #0x2346f48
  0x2346f14: ldr      s0, [x0, #0x20] ; = 0.0 (f32 @ 0x559a020)
  0x2346f18: fadd     s8, s8, s0
  0x2346f1c: add      w21, w21, #1
  0x2346f20: cmp      w22, w21
  0x2346f24: b.ne     #0x2346ec4
  0x2346f28: b        #0x2346f30
  0x2346f2c: fmov     s8, wzr
  0x2346f30: ldp      x20, x19, [sp, #0x30]
  0x2346f34: ldp      x22, x21, [sp, #0x20]
  0x2346f38: ldp      x30, x23, [sp, #0x10]
  0x2346f3c: mov      v0.16b, v8.16b
  0x2346f40: ldr      d8, [sp], #0x40
  0x2346f44: ret      
  0x2346f48: bl       #0x21b4d20 ; -> ??? 0x21b4d20
