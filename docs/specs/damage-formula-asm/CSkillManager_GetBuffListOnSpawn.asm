; ===== CSkillManager_GetBuffListOnSpawn @ 0x24d5530..0x24d55e0 (taille 176 octets) =====
  0x24d5530: stp      x30, x23, [sp, #-0x30]!
  0x24d5534: stp      x22, x21, [sp, #0x10]
  0x24d5538: stp      x20, x19, [sp, #0x20]
  0x24d553c: adrp     x22, #0x5956000
  0x24d5540: adrp     x23, #0x5512000
  0x24d5544: adrp     x21, #0x5512000
  0x24d5548: ldrb     w8, [x22, #0x94c]
  0x24d554c: ldr      x23, [x23, #0xae8] ; = 0x0 (u64 @ 0x5512ae8)
  0x24d5550: ldr      x21, [x21, #0xaf0] ; = 0x0 (u64 @ 0x5512af0)
  0x24d5554: mov      x19, x1
  0x24d5558: mov      x20, x0
  0x24d555c: tbnz     w8, #0, #0x24d5580
  0x24d5560: adrp     x0, #0x5512000
  0x24d5564: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5512af0)
  0x24d5568: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d556c: adrp     x0, #0x5512000
  0x24d5570: ldr      x0, [x0, #0xae8] ; = 0x0 (u64 @ 0x5512ae8)
  0x24d5574: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d5578: mov      w8, #1
  0x24d557c: strb     w8, [x22, #0x94c]
  0x24d5580: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x24d5584: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x24d5588: ldr      x1, [x21] ; = 0x0 (u64 @ 0x5512000)
  0x24d558c: mov      x21, x0
  0x24d5590: bl       #0x4449f88 ; -> System.Collections.Generic.List<object>$$.ctor
  0x24d5594: mov      x0, x19
  0x24d5598: mov      x1, x21
  0x24d559c: str      x21, [x19]
  0x24d55a0: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d55a4: mov      w1, #0x17
  0x24d55a8: mov      w2, #1
  0x24d55ac: mov      w3, #3
  0x24d55b0: mov      x0, x20
  0x24d55b4: mov      x4, x19
  0x24d55b8: bl       #0x24d3138 ; -> CSkillManager$$GetBuffList
  0x24d55bc: mov      x0, x20
  0x24d55c0: mov      x4, x19
  0x24d55c4: ldp      x20, x19, [sp, #0x20]
  0x24d55c8: ldp      x22, x21, [sp, #0x10]
  0x24d55cc: mov      w1, #0x17
  0x24d55d0: mov      w2, #1
  0x24d55d4: mov      w3, #4
  0x24d55d8: ldp      x30, x23, [sp], #0x30
  0x24d55dc: b        #0x24d3138
