; ===== CCharacterData_get_DMGBoost @ 0x27e1208..0x27e12e4 (taille 220 octets) =====
  0x27e1208: str      x30, [sp, #-0x20]!
  0x27e120c: stp      x20, x19, [sp, #0x10]
  0x27e1210: adrp     x20, #0x5958000
  0x27e1214: ldrb     w8, [x20, #0x37b]
  0x27e1218: mov      x19, x0
  0x27e121c: tbnz     w8, #0, #0x27e1240
  0x27e1220: adrp     x0, #0x5536000
  0x27e1224: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e1228: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e122c: adrp     x0, #0x5536000
  0x27e1230: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e1234: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e1238: mov      w8, #1
  0x27e123c: strb     w8, [x20, #0x37b]
  0x27e1240: ldrb     w8, [x19, #0x28]
  0x27e1244: cbz      w8, #0x27e1250
  0x27e1248: mov      x0, x19
  0x27e124c: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e1250: ldr      x0, [x19, #0x40]
  0x27e1254: cbz      x0, #0x27e12e0
  0x27e1258: adrp     x8, #0x5536000
  0x27e125c: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e1260: mov      w1, #0x19
  0x27e1264: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e1268: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e126c: cbz      x0, #0x27e12e0
  0x27e1270: adrp     x10, #0x5536000
  0x27e1274: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e1278: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e127c: mov      x19, x0
  0x27e1280: ldrh     w9, [x8, #0x12e]
  0x27e1284: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e1288: cbz      x9, #0x27e12ac
  0x27e128c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e1290: add      x10, x10, #8
  0x27e1294: ldur     x11, [x10, #-8]
  0x27e1298: cmp      x11, x1
  0x27e129c: b.eq     #0x27e12bc
  0x27e12a0: subs     x9, x9, #1
  0x27e12a4: add      x10, x10, #0x10
  0x27e12a8: b.ne     #0x27e1294
  0x27e12ac: mov      w2, #1
  0x27e12b0: mov      x0, x19
  0x27e12b4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e12b8: b        #0x27e12cc
  0x27e12bc: ldr      w9, [x10]
  0x27e12c0: add      w9, w9, #1
  0x27e12c4: add      x8, x8, w9, sxtw #4
  0x27e12c8: add      x0, x8, #0x138
  0x27e12cc: ldp      x2, x1, [x0]
  0x27e12d0: mov      x0, x19
  0x27e12d4: ldp      x20, x19, [sp, #0x10]
  0x27e12d8: ldr      x30, [sp], #0x20
  0x27e12dc: br       x2
  0x27e12e0: bl       #0x21849c0 ; -> ??? 0x21849c0
