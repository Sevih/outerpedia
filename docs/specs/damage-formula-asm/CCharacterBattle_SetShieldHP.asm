; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_SetShieldHP @ 0x2817e30..0x2817f90 (taille 352 octets) =====
  0x2817e30: str      x30, [sp, #-0x30]!
  0x2817e34: stp      x22, x21, [sp, #0x10]
  0x2817e38: stp      x20, x19, [sp, #0x20]
  0x2817e3c: adrp     x21, #0x59e7000
  0x2817e40: ldrb     w8, [x21, #0x6d6]
  0x2817e44: mov      w20, w1
  0x2817e48: mov      x19, x0
  0x2817e4c: tbnz     w8, #0, #0x2817e64
  0x2817e50: adrp     x0, #0x5599000
  0x2817e54: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2817e58: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2817e5c: mov      w8, #1
  0x2817e60: strb     w8, [x21, #0x6d6]
  0x2817e64: mov      x0, x19
  0x2817e68: mov      w1, w20
  0x2817e6c: bl       #0x281534c ; -> CCharacterBattle$$set_m_nShieldHP
  0x2817e70: ldr      x0, [x19, #0x28]
  0x2817e74: str      w20, [x19, #0x30c]
  0x2817e78: cbz      x0, #0x2817ef8
  0x2817e7c: mov      x1, xzr
  0x2817e80: bl       #0x290836c ; -> CCharacterData$$get_Type
  0x2817e84: cmp      w0, #3
  0x2817e88: b.lt     #0x2817ef8
  0x2817e8c: ldr      x20, [x19, #0x2d8]
  0x2817e90: cbz      x20, #0x2817f7c
  0x2817e94: adrp     x8, #0x5599000
  0x2817e98: ldr      x8, [x8, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2817e9c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2817ea0: add      x8, x19, #0x31c
  0x2817ea4: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2817ea8: ldr      w22, [x8, #8]
  0x2817eac: ldr      w9, [x0, #0xe0]
  0x2817eb0: cbnz     w9, #0x2817eb8
  0x2817eb4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2817eb8: mov      x0, x21
  0x2817ebc: mov      x1, x22
  0x2817ec0: mov      x2, xzr
  0x2817ec4: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2817ec8: mov      w21, w0
  0x2817ecc: mov      x0, x19
  0x2817ed0: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x2817ed4: ldr      w3, [x19, #0x30c]
  0x2817ed8: mov      w2, w0
  0x2817edc: mov      x0, x20
  0x2817ee0: mov      w1, w21
  0x2817ee4: ldp      x20, x19, [sp, #0x20]
  0x2817ee8: ldp      x22, x21, [sp, #0x10]
  0x2817eec: mov      x4, xzr
  0x2817ef0: ldr      x30, [sp], #0x30
  0x2817ef4: b        #0x28ebfb0
  0x2817ef8: ldr      x20, [x19, #0x2d0]
  0x2817efc: cbz      x20, #0x2817f7c
  0x2817f00: adrp     x8, #0x5599000
  0x2817f04: ldr      x8, [x8, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2817f08: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2817f0c: add      x8, x19, #0x31c
  0x2817f10: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2817f14: ldr      w22, [x8, #8]
  0x2817f18: ldr      w9, [x0, #0xe0]
  0x2817f1c: cbnz     w9, #0x2817f24
  0x2817f20: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2817f24: mov      x0, x21
  0x2817f28: mov      x1, x22
  0x2817f2c: mov      x2, xzr
  0x2817f30: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2817f34: ldr      x8, [x19, #0x28]
  0x2817f38: cbz      x8, #0x2817f8c
  0x2817f3c: mov      w21, w0
  0x2817f40: mov      x0, x8
  0x2817f44: mov      x1, xzr
  0x2817f48: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x2817f4c: mov      w22, w0
  0x2817f50: mov      x0, x19
  0x2817f54: bl       #0x28152e8 ; -> CCharacterBattle$$get_m_nShieldHP
  0x2817f58: mov      w3, w0
  0x2817f5c: mov      x0, x20
  0x2817f60: mov      w1, w21
  0x2817f64: mov      w2, w22
  0x2817f68: ldp      x20, x19, [sp, #0x20]
  0x2817f6c: ldp      x22, x21, [sp, #0x10]
  0x2817f70: mov      x4, xzr
  0x2817f74: ldr      x30, [sp], #0x30
  0x2817f78: b        #0x28e5818
  0x2817f7c: ldp      x20, x19, [sp, #0x20]
  0x2817f80: ldp      x22, x21, [sp, #0x10]
  0x2817f84: ldr      x30, [sp], #0x30
  0x2817f88: ret      
  0x2817f8c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
