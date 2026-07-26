; ===== CStatValue_get_ItemOptionValue @ 0x28d10a4..0x28d1108 (taille 100 octets) =====
  0x28d10a4: stp      x30, x21, [sp, #-0x20]!
  0x28d10a8: stp      x20, x19, [sp, #0x10]
  0x28d10ac: adrp     x21, #0x5958000
  0x28d10b0: adrp     x20, #0x5511000
  0x28d10b4: ldrb     w8, [x21, #0xbab]
  0x28d10b8: ldr      x20, [x20, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d10bc: mov      x19, x0
  0x28d10c0: tbnz     w8, #0, #0x28d10d8
  0x28d10c4: adrp     x0, #0x5511000
  0x28d10c8: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d10cc: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d10d0: mov      w8, #1
  0x28d10d4: strb     w8, [x21, #0xbab]
  0x28d10d8: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d10dc: ldur     x20, [x19, #0xa4]
  0x28d10e0: ldr      w19, [x19, #0xac]
  0x28d10e4: ldr      w8, [x0, #0xe0]
  0x28d10e8: cbnz     w8, #0x28d10f0
  0x28d10ec: bl       #0x218489c ; -> ??? 0x218489c
  0x28d10f0: mov      x0, x20
  0x28d10f4: mov      x1, x19
  0x28d10f8: ldp      x20, x19, [sp, #0x10]
  0x28d10fc: mov      x2, xzr
  0x28d1100: ldp      x30, x21, [sp], #0x20
  0x28d1104: b        #0x2c59abc
