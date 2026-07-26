; ===== CCharacterData_CalcTranscendentStarStats @ 0x27e59cc..0x27e5c18 (taille 588 octets) =====
  0x27e59cc: str      x30, [sp, #-0x40]!
  0x27e59d0: stp      x24, x23, [sp, #0x10]
  0x27e59d4: stp      x22, x21, [sp, #0x20]
  0x27e59d8: stp      x20, x19, [sp, #0x30]
  0x27e59dc: adrp     x20, #0x5958000
  0x27e59e0: adrp     x21, #0x5511000
  0x27e59e4: ldrb     w8, [x20, #0x391]
  0x27e59e8: ldr      x21, [x21, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e59ec: mov      x19, x0
  0x27e59f0: tbnz     w8, #0, #0x27e5a20
  0x27e59f4: adrp     x0, #0x5511000
  0x27e59f8: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x27e59fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5a00: adrp     x0, #0x5536000
  0x27e5a04: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e5a08: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5a0c: adrp     x0, #0x5536000
  0x27e5a10: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e5a14: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e5a18: mov      w8, #1
  0x27e5a1c: strb     w8, [x20, #0x391]
  0x27e5a20: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x27e5a24: ldr      w8, [x0, #0xe0]
  0x27e5a28: cbnz     w8, #0x27e5a30
  0x27e5a2c: bl       #0x218489c ; -> ??? 0x218489c
  0x27e5a30: mov      x0, xzr
  0x27e5a34: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x27e5a38: ldr      x8, [x19, #0xf0]
  0x27e5a3c: cbz      x8, #0x27e5c14
  0x27e5a40: cbz      x0, #0x27e5c14
  0x27e5a44: ldr      w3, [x8, #0x10]
  0x27e5a48: ldrb     w2, [x19, #0x98]
  0x27e5a4c: ldrb     w1, [x8, #0x54]
  0x27e5a50: mov      x4, xzr
  0x27e5a54: bl       #0x25f3304 ; -> CTempletManager$$GetCharacterTranscendent
  0x27e5a58: cbz      x0, #0x27e5ad0
  0x27e5a5c: mov      x20, x0
  0x27e5a60: ldr      x0, [x19, #0x40]
  0x27e5a64: cbz      x0, #0x27e5c14
  0x27e5a68: adrp     x23, #0x5536000
  0x27e5a6c: ldr      x23, [x23, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e5a70: mov      w1, #1
  0x27e5a74: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5a78: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5a7c: cbz      x0, #0x27e5c14
  0x27e5a80: adrp     x24, #0x5536000
  0x27e5a84: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5a88: ldr      x24, [x24, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e5a8c: ldr      w22, [x20, #0x30]
  0x27e5a90: mov      x21, x0
  0x27e5a94: ldrh     w9, [x8, #0x12e]
  0x27e5a98: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5a9c: cbz      x9, #0x27e5ac0
  0x27e5aa0: ldr      x10, [x8, #0xb0]
  0x27e5aa4: add      x10, x10, #8
  0x27e5aa8: ldur     x11, [x10, #-8]
  0x27e5aac: cmp      x11, x1
  0x27e5ab0: b.eq     #0x27e5ae4
  0x27e5ab4: subs     x9, x9, #1
  0x27e5ab8: add      x10, x10, #0x10
  0x27e5abc: b.ne     #0x27e5aa8
  0x27e5ac0: mov      w2, #0xc
  0x27e5ac4: mov      x0, x21
  0x27e5ac8: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5acc: b        #0x27e5af4
  0x27e5ad0: ldp      x20, x19, [sp, #0x30]
  0x27e5ad4: ldp      x22, x21, [sp, #0x20]
  0x27e5ad8: ldp      x24, x23, [sp, #0x10]
  0x27e5adc: ldr      x30, [sp], #0x40
  0x27e5ae0: ret      
  0x27e5ae4: ldr      w9, [x10]
  0x27e5ae8: add      w9, w9, #0xc
  0x27e5aec: add      x8, x8, w9, sxtw #4
  0x27e5af0: add      x0, x8, #0x138
  0x27e5af4: ldp      x8, x2, [x0]
  0x27e5af8: mov      x0, x21
  0x27e5afc: mov      w1, w22
  0x27e5b00: blr      x8
  0x27e5b04: ldr      x0, [x19, #0x40]
  0x27e5b08: cbz      x0, #0x27e5c14
  0x27e5b0c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5b10: mov      w1, #4
  0x27e5b14: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5b18: cbz      x0, #0x27e5c14
  0x27e5b1c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5b20: ldr      w22, [x20, #0x34]
  0x27e5b24: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5b28: mov      x21, x0
  0x27e5b2c: ldrh     w9, [x8, #0x12e]
  0x27e5b30: cbz      x9, #0x27e5b54
  0x27e5b34: ldr      x10, [x8, #0xb0]
  0x27e5b38: add      x10, x10, #8
  0x27e5b3c: ldur     x11, [x10, #-8]
  0x27e5b40: cmp      x11, x1
  0x27e5b44: b.eq     #0x27e5b64
  0x27e5b48: subs     x9, x9, #1
  0x27e5b4c: add      x10, x10, #0x10
  0x27e5b50: b.ne     #0x27e5b3c
  0x27e5b54: mov      w2, #0xc
  0x27e5b58: mov      x0, x21
  0x27e5b5c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5b60: b        #0x27e5b74
  0x27e5b64: ldr      w9, [x10]
  0x27e5b68: add      w9, w9, #0xc
  0x27e5b6c: add      x8, x8, w9, sxtw #4
  0x27e5b70: add      x0, x8, #0x138
  0x27e5b74: ldp      x8, x2, [x0]
  0x27e5b78: mov      x0, x21
  0x27e5b7c: mov      w1, w22
  0x27e5b80: blr      x8
  0x27e5b84: ldr      x0, [x19, #0x40]
  0x27e5b88: cbz      x0, #0x27e5c14
  0x27e5b8c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5536000)
  0x27e5b90: mov      w1, #5
  0x27e5b94: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5b98: cbz      x0, #0x27e5c14
  0x27e5b9c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5536000)
  0x27e5ba0: ldr      w20, [x20, #0x38]
  0x27e5ba4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x5536000)
  0x27e5ba8: mov      x19, x0
  0x27e5bac: ldrh     w9, [x8, #0x12e]
  0x27e5bb0: cbz      x9, #0x27e5bd4
  0x27e5bb4: ldr      x10, [x8, #0xb0]
  0x27e5bb8: add      x10, x10, #8
  0x27e5bbc: ldur     x11, [x10, #-8]
  0x27e5bc0: cmp      x11, x1
  0x27e5bc4: b.eq     #0x27e5be4
  0x27e5bc8: subs     x9, x9, #1
  0x27e5bcc: add      x10, x10, #0x10
  0x27e5bd0: b.ne     #0x27e5bbc
  0x27e5bd4: mov      w2, #0xc
  0x27e5bd8: mov      x0, x19
  0x27e5bdc: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5be0: b        #0x27e5bf4
  0x27e5be4: ldr      w9, [x10]
  0x27e5be8: add      w9, w9, #0xc
  0x27e5bec: add      x8, x8, w9, sxtw #4
  0x27e5bf0: add      x0, x8, #0x138
  0x27e5bf4: ldp      x3, x2, [x0]
  0x27e5bf8: mov      x0, x19
  0x27e5bfc: mov      w1, w20
  0x27e5c00: ldp      x20, x19, [sp, #0x30]
  0x27e5c04: ldp      x22, x21, [sp, #0x20]
  0x27e5c08: ldp      x24, x23, [sp, #0x10]
  0x27e5c0c: ldr      x30, [sp], #0x40
  0x27e5c10: br       x3
  0x27e5c14: bl       #0x21849c0 ; -> ??? 0x21849c0
