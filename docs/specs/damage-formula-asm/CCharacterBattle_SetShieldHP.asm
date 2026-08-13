; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterBattle_SetShieldHP @ 0x2810eb0..0x2811010 (taille 352 octets) =====
  0x2810eb0: str      x30, [sp, #-0x30]!
  0x2810eb4: stp      x22, x21, [sp, #0x10]
  0x2810eb8: stp      x20, x19, [sp, #0x20]
  0x2810ebc: adrp     x21, #0x59d7000
  0x2810ec0: ldrb     w8, [x21, #0xab7]
  0x2810ec4: mov      w20, w1
  0x2810ec8: mov      x19, x0
  0x2810ecc: tbnz     w8, #0, #0x2810ee4
  0x2810ed0: adrp     x0, #0x558a000
  0x2810ed4: ldr      x0, [x0, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x2810ed8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2810edc: mov      w8, #1
  0x2810ee0: strb     w8, [x21, #0xab7]
  0x2810ee4: mov      x0, x19
  0x2810ee8: mov      w1, w20
  0x2810eec: bl       #0x280e3cc ; -> CCharacterBattle$$set_m_nShieldHP
  0x2810ef0: ldr      x0, [x19, #0x28]
  0x2810ef4: str      w20, [x19, #0x30c]
  0x2810ef8: cbz      x0, #0x2810f78
  0x2810efc: mov      x1, xzr
  0x2810f00: bl       #0x29010f8 ; -> CCharacterData$$get_Type
  0x2810f04: cmp      w0, #3
  0x2810f08: b.lt     #0x2810f78
  0x2810f0c: ldr      x20, [x19, #0x2d8]
  0x2810f10: cbz      x20, #0x2810ffc
  0x2810f14: adrp     x8, #0x558a000
  0x2810f18: ldr      x8, [x8, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x2810f1c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2810f20: add      x8, x19, #0x31c
  0x2810f24: ldr      x21, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2810f28: ldr      w22, [x8, #8]
  0x2810f2c: ldr      w9, [x0, #0xe0]
  0x2810f30: cbnz     w9, #0x2810f38
  0x2810f34: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2810f38: mov      x0, x21
  0x2810f3c: mov      x1, x22
  0x2810f40: mov      x2, xzr
  0x2810f44: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x2810f48: mov      w21, w0
  0x2810f4c: mov      x0, x19
  0x2810f50: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x2810f54: ldr      w3, [x19, #0x30c]
  0x2810f58: mov      w2, w0
  0x2810f5c: mov      x0, x20
  0x2810f60: mov      w1, w21
  0x2810f64: ldp      x20, x19, [sp, #0x20]
  0x2810f68: ldp      x22, x21, [sp, #0x10]
  0x2810f6c: mov      x4, xzr
  0x2810f70: ldr      x30, [sp], #0x30
  0x2810f74: b        #0x28e4da4
  0x2810f78: ldr      x20, [x19, #0x2d0]
  0x2810f7c: cbz      x20, #0x2810ffc
  0x2810f80: adrp     x8, #0x558a000
  0x2810f84: ldr      x8, [x8, #0x528] ; = 0x0 (u64 @ 0x558a528)
  0x2810f88: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2810f8c: add      x8, x19, #0x31c
  0x2810f90: ldr      x21, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2810f94: ldr      w22, [x8, #8]
  0x2810f98: ldr      w9, [x0, #0xe0]
  0x2810f9c: cbnz     w9, #0x2810fa4
  0x2810fa0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2810fa4: mov      x0, x21
  0x2810fa8: mov      x1, x22
  0x2810fac: mov      x2, xzr
  0x2810fb0: bl       #0x2cb18e0 ; -> SVAInt$$op_Implicit
  0x2810fb4: ldr      x8, [x19, #0x28]
  0x2810fb8: cbz      x8, #0x281100c
  0x2810fbc: mov      w21, w0
  0x2810fc0: mov      x0, x8
  0x2810fc4: mov      x1, xzr
  0x2810fc8: bl       #0x2901a30 ; -> CCharacterData$$get_MaxHP
  0x2810fcc: mov      w22, w0
  0x2810fd0: mov      x0, x19
  0x2810fd4: bl       #0x280e368 ; -> CCharacterBattle$$get_m_nShieldHP
  0x2810fd8: mov      w3, w0
  0x2810fdc: mov      x0, x20
  0x2810fe0: mov      w1, w21
  0x2810fe4: mov      w2, w22
  0x2810fe8: ldp      x20, x19, [sp, #0x20]
  0x2810fec: ldp      x22, x21, [sp, #0x10]
  0x2810ff0: mov      x4, xzr
  0x2810ff4: ldr      x30, [sp], #0x30
  0x2810ff8: b        #0x28de60c
  0x2810ffc: ldp      x20, x19, [sp, #0x20]
  0x2811000: ldp      x22, x21, [sp, #0x10]
  0x2811004: ldr      x30, [sp], #0x30
  0x2811008: ret      
  0x281100c: bl       #0x21afc18 ; -> ??? 0x21afc18
