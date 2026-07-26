; ===== CStatValue_get_BuffValue @ 0x28d1178..0x28d11dc (taille 100 octets) =====
  0x28d1178: stp      x30, x21, [sp, #-0x20]!
  0x28d117c: stp      x20, x19, [sp, #0x10]
  0x28d1180: adrp     x21, #0x5958000
  0x28d1184: adrp     x20, #0x5511000
  0x28d1188: ldrb     w8, [x21, #0xbad]
  0x28d118c: ldr      x20, [x20, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d1190: mov      x19, x0
  0x28d1194: tbnz     w8, #0, #0x28d11ac
  0x28d1198: adrp     x0, #0x5511000
  0x28d119c: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d11a0: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d11a4: mov      w8, #1
  0x28d11a8: strb     w8, [x21, #0xbad]
  0x28d11ac: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d11b0: ldr      x20, [x19, #0xb0]
  0x28d11b4: ldr      w19, [x19, #0xb8]
  0x28d11b8: ldr      w8, [x0, #0xe0]
  0x28d11bc: cbnz     w8, #0x28d11c4
  0x28d11c0: bl       #0x218489c ; -> ??? 0x218489c
  0x28d11c4: mov      x0, x20
  0x28d11c8: mov      x1, x19
  0x28d11cc: ldp      x20, x19, [sp, #0x10]
  0x28d11d0: mov      x2, xzr
  0x28d11d4: ldp      x30, x21, [sp], #0x20
  0x28d11d8: b        #0x2c59abc
