; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_GetBuffListOnSpawn @ 0x251428c..0x251433c (taille 176 octets) =====
  0x251428c: stp      x30, x23, [sp, #-0x30]!
  0x2514290: stp      x22, x21, [sp, #0x10]
  0x2514294: stp      x20, x19, [sp, #0x20]
  0x2514298: adrp     x22, #0x59e5000
  0x251429c: adrp     x23, #0x559a000
  0x25142a0: adrp     x21, #0x559a000
  0x25142a4: ldrb     w8, [x22, #0xc93]
  0x25142a8: ldr      x23, [x23, #0x3f0] ; = 0x0 (u64 @ 0x559a3f0)
  0x25142ac: ldr      x21, [x21, #0x3f8] ; = 0x0 (u64 @ 0x559a3f8)
  0x25142b0: mov      x19, x1
  0x25142b4: mov      x20, x0
  0x25142b8: tbnz     w8, #0, #0x25142dc
  0x25142bc: adrp     x0, #0x559a000
  0x25142c0: ldr      x0, [x0, #0x3f8] ; = 0x0 (u64 @ 0x559a3f8)
  0x25142c4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25142c8: adrp     x0, #0x559a000
  0x25142cc: ldr      x0, [x0, #0x3f0] ; = 0x0 (u64 @ 0x559a3f0)
  0x25142d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25142d4: mov      w8, #1
  0x25142d8: strb     w8, [x22, #0xc93]
  0x25142dc: ldr      x0, [x23] ; = 0x0 (u64 @ 0x559a000)
  0x25142e0: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x25142e4: ldr      x1, [x21] ; = 0x0 (u64 @ 0x559a000)
  0x25142e8: mov      x21, x0
  0x25142ec: bl       #0x44c8b90 ; -> System.Collections.Generic.List<object>$$.ctor
  0x25142f0: mov      x0, x19
  0x25142f4: mov      x1, x21
  0x25142f8: str      x21, [x19]
  0x25142fc: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2514300: mov      w1, #0x17
  0x2514304: mov      w2, #1
  0x2514308: mov      w3, #3
  0x251430c: mov      x0, x20
  0x2514310: mov      x4, x19
  0x2514314: bl       #0x2511e94 ; -> CSkillManager$$GetBuffList
  0x2514318: mov      x0, x20
  0x251431c: mov      x4, x19
  0x2514320: ldp      x20, x19, [sp, #0x20]
  0x2514324: ldp      x22, x21, [sp, #0x10]
  0x2514328: mov      w1, #0x17
  0x251432c: mov      w2, #1
  0x2514330: mov      w3, #4
  0x2514334: ldp      x30, x23, [sp], #0x30
  0x2514338: b        #0x2511e94
