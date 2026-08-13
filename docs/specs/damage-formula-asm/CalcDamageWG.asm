; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CalcDamageWG @ 0x2cb3d40..0x2cb3e1c (taille 220 octets) =====
  0x2cb3d40: str      x30, [sp, #-0x30]!
  0x2cb3d44: stp      x22, x21, [sp, #0x10]
  0x2cb3d48: stp      x20, x19, [sp, #0x20]
  0x2cb3d4c: adrp     x22, #0x59da000
  0x2cb3d50: ldrb     w8, [x22, #0x115]
  0x2cb3d54: mov      w19, w2
  0x2cb3d58: mov      x20, x1
  0x2cb3d5c: mov      x21, x0
  0x2cb3d60: tbnz     w8, #0, #0x2cb3d78
  0x2cb3d64: adrp     x0, #0x558a000
  0x2cb3d68: ldr      x0, [x0, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb3d6c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3d70: mov      w8, #1
  0x2cb3d74: strb     w8, [x22, #0x115]
  0x2cb3d78: str      xzr, [sp, #8]
  0x2cb3d7c: cbz      x20, #0x2cb3e18
  0x2cb3d80: mov      x0, x20
  0x2cb3d84: mov      x1, x21
  0x2cb3d88: mov      x2, xzr
  0x2cb3d8c: bl       #0x2826410 ; -> CCharacterBattle$$FindBuffWGInvincible
  0x2cb3d90: cbz      x0, #0x2cb3da4
  0x2cb3d94: mov      x1, xzr
  0x2cb3d98: bl       #0x2327f00 ; -> CBuff$$PlayActivateEffect
  0x2cb3d9c: mov      w0, wzr
  0x2cb3da0: b        #0x2cb3e08
  0x2cb3da4: cbnz     w19, #0x2cb3dc0
  0x2cb3da8: cbz      x21, #0x2cb3e18
  0x2cb3dac: ldr      x0, [x21, #0x2e0]
  0x2cb3db0: cbz      x0, #0x2cb3e18
  0x2cb3db4: mov      x1, xzr
  0x2cb3db8: bl       #0x250ccb8 ; -> CSkill$$get_WGReduce
  0x2cb3dbc: and      w19, w0, #0xff
  0x2cb3dc0: add      x1, sp, #0xc
  0x2cb3dc4: add      x2, sp, #8
  0x2cb3dc8: mov      x0, x20
  0x2cb3dcc: mov      x3, x21
  0x2cb3dd0: mov      x4, xzr
  0x2cb3dd4: bl       #0x2826588 ; -> CCharacterBattle$$FindBuffWGDamageReduce
  0x2cb3dd8: adrp     x8, #0x558a000
  0x2cb3ddc: ldr      x8, [x8, #0x6d8] ; = 0x0 (u64 @ 0x558a6d8)
  0x2cb3de0: ldp      w20, w21, [sp, #8]
  0x2cb3de4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3de8: ldr      w8, [x0, #0xe0]
  0x2cb3dec: cbnz     w8, #0x2cb3df4
  0x2cb3df0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3df4: add      w0, w21, w19
  0x2cb3df8: mov      w1, w20
  0x2cb3dfc: mov      x2, xzr
  0x2cb3e00: bl       #0x29fa264 ; -> CCommonDefine$$ApplyRate
  0x2cb3e04: bic      w0, w0, w0, asr #31
  0x2cb3e08: ldp      x20, x19, [sp, #0x20]
  0x2cb3e0c: ldp      x22, x21, [sp, #0x10]
  0x2cb3e10: ldr      x30, [sp], #0x30
  0x2cb3e14: ret      
  0x2cb3e18: bl       #0x21afc18 ; -> ??? 0x21afc18
