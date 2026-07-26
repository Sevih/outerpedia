; ===== CSkillManager_CheckItemBuffCool @ 0x24d655c..0x24d6610 (taille 180 octets) =====
  0x24d655c: stp      x30, x21, [sp, #-0x20]!
  0x24d6560: stp      x20, x19, [sp, #0x10]
  0x24d6564: adrp     x21, #0x5956000
  0x24d6568: ldrb     w8, [x21, #0x964]
  0x24d656c: mov      x19, x1
  0x24d6570: mov      x20, x0
  0x24d6574: tbnz     w8, #0, #0x24d6598
  0x24d6578: adrp     x0, #0x551f000
  0x24d657c: ldr      x0, [x0, #0x7e0] ; = 0x0 (u64 @ 0x551f7e0)
  0x24d6580: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d6584: adrp     x0, #0x551f000
  0x24d6588: ldr      x0, [x0, #0x7e8] ; = 0x0 (u64 @ 0x551f7e8)
  0x24d658c: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d6590: mov      w8, #1
  0x24d6594: strb     w8, [x21, #0x964]
  0x24d6598: cbz      x19, #0x24d660c
  0x24d659c: ldr      x0, [x20, #0x68]
  0x24d65a0: cbz      x0, #0x24d660c
  0x24d65a4: adrp     x8, #0x551f000
  0x24d65a8: ldr      x8, [x8, #0x7e0] ; = 0x0 (u64 @ 0x551f7e0)
  0x24d65ac: ldr      x1, [x19, #0x18]
  0x24d65b0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d65b4: bl       #0x3ff0a8c ; -> System.Collections.Generic.Dictionary<object, object>$$ContainsKey
  0x24d65b8: tbz      w0, #0, #0x24d65fc
  0x24d65bc: ldr      x0, [x20, #0x68]
  0x24d65c0: cbz      x0, #0x24d660c
  0x24d65c4: adrp     x8, #0x551f000
  0x24d65c8: ldr      x1, [x19, #0x18]
  0x24d65cc: ldr      x8, [x8, #0x7e8] ; = 0x0 (u64 @ 0x551f7e8)
  0x24d65d0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d65d4: bl       #0x3ff0818 ; -> System.Collections.Generic.Dictionary<object, object>$$get_Item
  0x24d65d8: cbz      x0, #0x24d660c
  0x24d65dc: ldr      w8, [x0, #0x18]
  0x24d65e0: cbz      w8, #0x24d65f8
  0x24d65e4: ldr      w9, [x0, #0x20]
  0x24d65e8: cmp      w9, w8
  0x24d65ec: b.ge     #0x24d65f8
  0x24d65f0: mov      w0, wzr
  0x24d65f4: b        #0x24d6600
  0x24d65f8: str      wzr, [x0, #0x20]
  0x24d65fc: mov      w0, #1
  0x24d6600: ldp      x20, x19, [sp, #0x10]
  0x24d6604: ldp      x30, x21, [sp], #0x20
  0x24d6608: ret      
  0x24d660c: bl       #0x21849c0 ; -> ??? 0x21849c0
