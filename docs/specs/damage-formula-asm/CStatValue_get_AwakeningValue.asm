; ===== CStatValue_get_AwakeningValue @ 0x28d124c..0x28d12b0 (taille 100 octets) =====
  0x28d124c: stp      x30, x21, [sp, #-0x20]!
  0x28d1250: stp      x20, x19, [sp, #0x10]
  0x28d1254: adrp     x21, #0x5958000
  0x28d1258: adrp     x20, #0x5511000
  0x28d125c: ldrb     w8, [x21, #0xbaf]
  0x28d1260: ldr      x20, [x20, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d1264: mov      x19, x0
  0x28d1268: tbnz     w8, #0, #0x28d1280
  0x28d126c: adrp     x0, #0x5511000
  0x28d1270: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d1274: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d1278: mov      w8, #1
  0x28d127c: strb     w8, [x21, #0xbaf]
  0x28d1280: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5511000)
  0x28d1284: ldur     x20, [x19, #0xbc]
  0x28d1288: ldr      w19, [x19, #0xc4]
  0x28d128c: ldr      w8, [x0, #0xe0]
  0x28d1290: cbnz     w8, #0x28d1298
  0x28d1294: bl       #0x218489c ; -> ??? 0x218489c
  0x28d1298: mov      x0, x20
  0x28d129c: mov      x1, x19
  0x28d12a0: ldp      x20, x19, [sp, #0x10]
  0x28d12a4: mov      x2, xzr
  0x28d12a8: ldp      x30, x21, [sp], #0x20
  0x28d12ac: b        #0x2c59abc
