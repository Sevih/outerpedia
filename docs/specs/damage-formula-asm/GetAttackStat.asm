; ===== GetAttackStat @ 0x26e02a4..0x26e03a4 (taille 256 octets) =====
  0x26e02a4: stp      x30, x21, [sp, #-0x20]!
  0x26e02a8: stp      x20, x19, [sp, #0x10]
  0x26e02ac: adrp     x19, #0x5957000
  0x26e02b0: ldrb     w8, [x19, #0xb7c]
  0x26e02b4: mov      x20, x0
  0x26e02b8: tbnz     w8, #0, #0x26e02d0
  0x26e02bc: adrp     x0, #0x5511000
  0x26e02c0: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26e02c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x26e02c8: mov      w8, #1
  0x26e02cc: strb     w8, [x19, #0xb7c]
  0x26e02d0: mov      w1, #0x6d
  0x26e02d4: mov      x0, x20
  0x26e02d8: bl       #0x26c5ab0 ; -> CCharacterBattle$$FindBuffByType
  0x26e02dc: cbz      x0, #0x26e0378
  0x26e02e0: mov      w2, #0x17
  0x26e02e4: mov      x1, x20
  0x26e02e8: mov      x3, xzr
  0x26e02ec: mov      x19, x0
  0x26e02f0: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26e02f4: tbz      w0, #0, #0x26e0378
  0x26e02f8: ldr      x20, [x20, #0x28]
  0x26e02fc: mov      x0, x19
  0x26e0300: mov      x1, xzr
  0x26e0304: bl       #0x22f4ae4 ; -> CBuff$$get_StatType
  0x26e0308: cbz      x20, #0x26e03a0
  0x26e030c: mov      w1, w0
  0x26e0310: mov      x0, x20
  0x26e0314: mov      x2, xzr
  0x26e0318: bl       #0x27e7028 ; -> CCharacterData$$GetFinalStat
  0x26e031c: mov      w20, w0
  0x26e0320: mov      x0, x19
  0x26e0324: mov      x1, xzr
  0x26e0328: bl       #0x22f4afc ; -> CBuff$$get_ApplyingType
  0x26e032c: mov      w21, w0
  0x26e0330: mov      x0, x19
  0x26e0334: mov      x1, xzr
  0x26e0338: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26e033c: cmp      w21, #2
  0x26e0340: mov      w19, w0
  0x26e0344: b.ne     #0x26e0390
  0x26e0348: adrp     x8, #0x5511000
  0x26e034c: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x26e0350: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26e0354: ldr      w8, [x0, #0xe0]
  0x26e0358: cbnz     w8, #0x26e0360
  0x26e035c: bl       #0x218489c ; -> ??? 0x218489c
  0x26e0360: mov      w0, w20
  0x26e0364: mov      w1, w19
  0x26e0368: ldp      x20, x19, [sp, #0x10]
  0x26e036c: mov      x2, xzr
  0x26e0370: ldp      x30, x21, [sp], #0x20
  0x26e0374: b        #0x28d81c0
  0x26e0378: ldr      x0, [x20, #0x28]
  0x26e037c: cbz      x0, #0x26e03a0
  0x26e0380: ldp      x20, x19, [sp, #0x10]
  0x26e0384: mov      x1, xzr
  0x26e0388: ldp      x30, x21, [sp], #0x20
  0x26e038c: b        #0x27dfffc
  0x26e0390: add      w0, w19, w20
  0x26e0394: ldp      x20, x19, [sp, #0x10]
  0x26e0398: ldp      x30, x21, [sp], #0x20
  0x26e039c: ret      
  0x26e03a0: bl       #0x21849c0 ; -> ??? 0x21849c0
