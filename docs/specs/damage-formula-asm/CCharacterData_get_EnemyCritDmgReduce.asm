; ===== CCharacterData_get_EnemyCritDmgReduce @ 0x27e12e4..0x27e13c0 (taille 220 octets) =====
  0x27e12e4: str      x30, [sp, #-0x20]!
  0x27e12e8: stp      x20, x19, [sp, #0x10]
  0x27e12ec: adrp     x20, #0x5958000
  0x27e12f0: ldrb     w8, [x20, #0x37c]
  0x27e12f4: mov      x19, x0
  0x27e12f8: tbnz     w8, #0, #0x27e131c
  0x27e12fc: adrp     x0, #0x5536000
  0x27e1300: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e1304: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e1308: adrp     x0, #0x5536000
  0x27e130c: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e1310: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e1314: mov      w8, #1
  0x27e1318: strb     w8, [x20, #0x37c]
  0x27e131c: ldrb     w8, [x19, #0x28]
  0x27e1320: cbz      w8, #0x27e132c
  0x27e1324: mov      x0, x19
  0x27e1328: bl       #0x27e2870 ; -> CCharacterData$$CalcStat
  0x27e132c: ldr      x0, [x19, #0x40]
  0x27e1330: cbz      x0, #0x27e13bc
  0x27e1334: adrp     x8, #0x5536000
  0x27e1338: ldr      x8, [x8, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e133c: mov      w1, #0x1a
  0x27e1340: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x27e1344: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e1348: cbz      x0, #0x27e13bc
  0x27e134c: adrp     x10, #0x5536000
  0x27e1350: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e1354: ldr      x10, [x10, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e1358: mov      x19, x0
  0x27e135c: ldrh     w9, [x8, #0x12e]
  0x27e1360: ldr      x1, [x10] ; = 0x0 (u64 @ 0x5536000)
  0x27e1364: cbz      x9, #0x27e1388
  0x27e1368: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55360b0)
  0x27e136c: add      x10, x10, #8
  0x27e1370: ldur     x11, [x10, #-8]
  0x27e1374: cmp      x11, x1
  0x27e1378: b.eq     #0x27e1398
  0x27e137c: subs     x9, x9, #1
  0x27e1380: add      x10, x10, #0x10
  0x27e1384: b.ne     #0x27e1370
  0x27e1388: mov      w2, #1
  0x27e138c: mov      x0, x19
  0x27e1390: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e1394: b        #0x27e13a8
  0x27e1398: ldr      w9, [x10]
  0x27e139c: add      w9, w9, #1
  0x27e13a0: add      x8, x8, w9, sxtw #4
  0x27e13a4: add      x0, x8, #0x138
  0x27e13a8: ldp      x2, x1, [x0]
  0x27e13ac: mov      x0, x19
  0x27e13b0: ldp      x20, x19, [sp, #0x10]
  0x27e13b4: ldr      x30, [sp], #0x20
  0x27e13b8: br       x2
  0x27e13bc: bl       #0x21849c0 ; -> ??? 0x21849c0
