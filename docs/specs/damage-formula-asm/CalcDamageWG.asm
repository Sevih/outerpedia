; ===== CalcDamageWG @ 0x2c5bdbc..0x2c5be98 (taille 220 octets) =====
  0x2c5bdbc: str      x30, [sp, #-0x30]!
  0x2c5bdc0: stp      x22, x21, [sp, #0x10]
  0x2c5bdc4: stp      x20, x19, [sp, #0x20]
  0x2c5bdc8: adrp     x22, #0x595a000
  0x2c5bdcc: ldrb     w8, [x22, #0x908]
  0x2c5bdd0: mov      w19, w2
  0x2c5bdd4: mov      x20, x1
  0x2c5bdd8: mov      x21, x0
  0x2c5bddc: tbnz     w8, #0, #0x2c5bdf4
  0x2c5bde0: adrp     x0, #0x5511000
  0x2c5bde4: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5bde8: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5bdec: mov      w8, #1
  0x2c5bdf0: strb     w8, [x22, #0x908]
  0x2c5bdf4: str      xzr, [sp, #8]
  0x2c5bdf8: cbz      x20, #0x2c5be94
  0x2c5bdfc: mov      x0, x20
  0x2c5be00: mov      x1, x21
  0x2c5be04: mov      x2, xzr
  0x2c5be08: bl       #0x26dd504 ; -> CCharacterBattle$$FindBuffWGInvincible
  0x2c5be0c: cbz      x0, #0x2c5be20
  0x2c5be10: mov      x1, xzr
  0x2c5be14: bl       #0x22fc0b0 ; -> CBuff$$PlayActivateEffect
  0x2c5be18: mov      w0, wzr
  0x2c5be1c: b        #0x2c5be84
  0x2c5be20: cbnz     w19, #0x2c5be3c
  0x2c5be24: cbz      x21, #0x2c5be94
  0x2c5be28: ldr      x0, [x21, #0x2e0]
  0x2c5be2c: cbz      x0, #0x2c5be94
  0x2c5be30: mov      x1, xzr
  0x2c5be34: bl       #0x24cfa00 ; -> CSkill$$get_WGReduce
  0x2c5be38: and      w19, w0, #0xff
  0x2c5be3c: add      x1, sp, #0xc
  0x2c5be40: add      x2, sp, #8
  0x2c5be44: mov      x0, x20
  0x2c5be48: mov      x3, x21
  0x2c5be4c: mov      x4, xzr
  0x2c5be50: bl       #0x26dd67c ; -> CCharacterBattle$$FindBuffWGDamageReduce
  0x2c5be54: adrp     x8, #0x5511000
  0x2c5be58: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5be5c: ldp      w20, w21, [sp, #8]
  0x2c5be60: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5be64: ldr      w8, [x0, #0xe0]
  0x2c5be68: cbnz     w8, #0x2c5be70
  0x2c5be6c: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5be70: add      w0, w21, w19
  0x2c5be74: mov      w1, w20
  0x2c5be78: mov      x2, xzr
  0x2c5be7c: bl       #0x28d18e4 ; -> CCommonDefine$$ApplyRate
  0x2c5be80: bic      w0, w0, w0, asr #31
  0x2c5be84: ldp      x20, x19, [sp, #0x20]
  0x2c5be88: ldp      x22, x21, [sp, #0x10]
  0x2c5be8c: ldr      x30, [sp], #0x30
  0x2c5be90: ret      
  0x2c5be94: bl       #0x21849c0 ; -> ??? 0x21849c0
