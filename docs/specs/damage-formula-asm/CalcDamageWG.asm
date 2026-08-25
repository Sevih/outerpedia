; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcDamageWG @ 0x2cc2774..0x2cc2850 (taille 220 octets) =====
  0x2cc2774: str      x30, [sp, #-0x30]!
  0x2cc2778: stp      x22, x21, [sp, #0x10]
  0x2cc277c: stp      x20, x19, [sp, #0x20]
  0x2cc2780: adrp     x22, #0x59e9000
  0x2cc2784: ldrb     w8, [x22, #0xd6a]
  0x2cc2788: mov      w19, w2
  0x2cc278c: mov      x20, x1
  0x2cc2790: mov      x21, x0
  0x2cc2794: tbnz     w8, #0, #0x2cc27ac
  0x2cc2798: adrp     x0, #0x5599000
  0x2cc279c: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc27a0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc27a4: mov      w8, #1
  0x2cc27a8: strb     w8, [x22, #0xd6a]
  0x2cc27ac: str      xzr, [sp, #8]
  0x2cc27b0: cbz      x20, #0x2cc284c
  0x2cc27b4: mov      x0, x20
  0x2cc27b8: mov      x1, x21
  0x2cc27bc: mov      x2, xzr
  0x2cc27c0: bl       #0x282d388 ; -> CCharacterBattle$$FindBuffWGInvincible
  0x2cc27c4: cbz      x0, #0x2cc27d8
  0x2cc27c8: mov      x1, xzr
  0x2cc27cc: bl       #0x232d020 ; -> CBuff$$PlayActivateEffect
  0x2cc27d0: mov      w0, wzr
  0x2cc27d4: b        #0x2cc283c
  0x2cc27d8: cbnz     w19, #0x2cc27f4
  0x2cc27dc: cbz      x21, #0x2cc284c
  0x2cc27e0: ldr      x0, [x21, #0x2e0]
  0x2cc27e4: cbz      x0, #0x2cc284c
  0x2cc27e8: mov      x1, xzr
  0x2cc27ec: bl       #0x250e74c ; -> CSkill$$get_WGReduce
  0x2cc27f0: and      w19, w0, #0xff
  0x2cc27f4: add      x1, sp, #0xc
  0x2cc27f8: add      x2, sp, #8
  0x2cc27fc: mov      x0, x20
  0x2cc2800: mov      x3, x21
  0x2cc2804: mov      x4, xzr
  0x2cc2808: bl       #0x282d500 ; -> CCharacterBattle$$FindBuffWGDamageReduce
  0x2cc280c: adrp     x8, #0x5599000
  0x2cc2810: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc2814: ldp      w20, w21, [sp, #8]
  0x2cc2818: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2cc281c: ldr      w8, [x0, #0xe0]
  0x2cc2820: cbnz     w8, #0x2cc2828
  0x2cc2824: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc2828: add      w0, w21, w19
  0x2cc282c: mov      w1, w20
  0x2cc2830: mov      x2, xzr
  0x2cc2834: bl       #0x2a04a10 ; -> CCommonDefine$$ApplyRate
  0x2cc2838: bic      w0, w0, w0, asr #31
  0x2cc283c: ldp      x20, x19, [sp, #0x20]
  0x2cc2840: ldp      x22, x21, [sp, #0x10]
  0x2cc2844: ldr      x30, [sp], #0x30
  0x2cc2848: ret      
  0x2cc284c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
