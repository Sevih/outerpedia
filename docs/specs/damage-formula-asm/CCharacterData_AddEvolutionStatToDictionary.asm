; ===== CCharacterData_AddEvolutionStatToDictionary @ 0x27e8214..0x27e82fc (taille 232 octets) =====
  0x27e8214: str      x30, [sp, #-0x30]!
  0x27e8218: stp      x22, x21, [sp, #0x10]
  0x27e821c: stp      x20, x19, [sp, #0x20]
  0x27e8220: adrp     x22, #0x5958000
  0x27e8224: ldrb     w8, [x22, #0x3a9]
  0x27e8228: mov      w19, w3
  0x27e822c: mov      w20, w2
  0x27e8230: mov      x21, x1
  0x27e8234: tbnz     w8, #0, #0x27e8270
  0x27e8238: adrp     x0, #0x5525000
  0x27e823c: ldr      x0, [x0, #0xb60] ; = 0x0 (u64 @ 0x5525b60)
  0x27e8240: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e8244: adrp     x0, #0x5525000
  0x27e8248: ldr      x0, [x0, #0xb68] ; = 0x0 (u64 @ 0x5525b68)
  0x27e824c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e8250: adrp     x0, #0x5525000
  0x27e8254: ldr      x0, [x0, #0xb70] ; = 0x0 (u64 @ 0x5525b70)
  0x27e8258: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e825c: adrp     x0, #0x5523000
  0x27e8260: ldr      x0, [x0, #0x410] ; = 0x0 (u64 @ 0x5523410)
  0x27e8264: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e8268: mov      w8, #1
  0x27e826c: strb     w8, [x22, #0x3a9]
  0x27e8270: cbz      x21, #0x27e82f8
  0x27e8274: adrp     x8, #0x5525000
  0x27e8278: ldr      x8, [x8, #0xb68] ; = 0x0 (u64 @ 0x5525b68)
  0x27e827c: mov      x0, x21
  0x27e8280: mov      w1, w20
  0x27e8284: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x27e8288: bl       #0x3fa8d3c ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$ContainsKey
  0x27e828c: tbz      w0, #0, #0x27e82d0
  0x27e8290: adrp     x8, #0x5525000
  0x27e8294: ldr      x8, [x8, #0xb70] ; = 0x0 (u64 @ 0x5525b70)
  0x27e8298: mov      x0, x21
  0x27e829c: mov      w1, w20
  0x27e82a0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x27e82a4: bl       #0x3fa8ab4 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$get_Item
  0x27e82a8: adrp     x8, #0x5523000
  0x27e82ac: ldr      x8, [x8, #0x410] ; = 0x0 (u64 @ 0x5523410)
  0x27e82b0: add      w2, w0, w19
  0x27e82b4: mov      x0, x21
  0x27e82b8: mov      w1, w20
  0x27e82bc: ldr      x3, [x8] ; = 0x0 (u64 @ 0x5523000)
  0x27e82c0: ldp      x20, x19, [sp, #0x20]
  0x27e82c4: ldp      x22, x21, [sp, #0x10]
  0x27e82c8: ldr      x30, [sp], #0x30
  0x27e82cc: b        #0x3fa8b3c
  0x27e82d0: adrp     x8, #0x5525000
  0x27e82d4: ldr      x8, [x8, #0xb60] ; = 0x0 (u64 @ 0x5525b60)
  0x27e82d8: mov      x0, x21
  0x27e82dc: mov      w1, w20
  0x27e82e0: mov      w2, w19
  0x27e82e4: ldr      x3, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x27e82e8: ldp      x20, x19, [sp, #0x20]
  0x27e82ec: ldp      x22, x21, [sp, #0x10]
  0x27e82f0: ldr      x30, [sp], #0x30
  0x27e82f4: b        #0x3fa8b50
  0x27e82f8: bl       #0x21849c0 ; -> ??? 0x21849c0
