; ===== CCharacterData_CalcBasicStats @ 0x27e4750..0x27e57f4 (taille 4260 octets) =====
  0x27e4750: stp      x29, x30, [sp, #-0x60]!
  0x27e4754: stp      x28, x27, [sp, #0x10]
  0x27e4758: stp      x26, x25, [sp, #0x20]
  0x27e475c: stp      x24, x23, [sp, #0x30]
  0x27e4760: stp      x22, x21, [sp, #0x40]
  0x27e4764: stp      x20, x19, [sp, #0x50]
  0x27e4768: adrp     x20, #0x5958000
  0x27e476c: ldrb     w8, [x20, #0x38f]
  0x27e4770: mov      x19, x0
  0x27e4774: tbnz     w8, #0, #0x27e4798
  0x27e4778: adrp     x0, #0x5536000
  0x27e477c: ldr      x0, [x0, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e4780: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e4784: adrp     x0, #0x5536000
  0x27e4788: ldr      x0, [x0, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e478c: bl       #0x2184724 ; -> ??? 0x2184724
  0x27e4790: mov      w8, #1
  0x27e4794: strb     w8, [x20, #0x38f]
  0x27e4798: ldr      x8, [x19]
  0x27e479c: mov      x0, x19
  0x27e47a0: ldp      x9, x1, [x8, #0x188]
  0x27e47a4: blr      x9
  0x27e47a8: ldr      x0, [x19, #0x40]
  0x27e47ac: cbz      x0, #0x27e57f0
  0x27e47b0: adrp     x28, #0x5536000
  0x27e47b4: ldr      x28, [x28, #0xcf0] ; = 0x0 (u64 @ 0x5536cf0)
  0x27e47b8: mov      w1, #2
  0x27e47bc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e47c0: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e47c4: mov      x29, x19
  0x27e47c8: ldr      x9, [x29, #0xf0]!
  0x27e47cc: cbz      x9, #0x27e57f0
  0x27e47d0: mov      x20, x0
  0x27e47d4: cbz      x0, #0x27e57f0
  0x27e47d8: adrp     x26, #0x5536000
  0x27e47dc: ldr      x26, [x26, #0xcf8] ; = 0x0 (u64 @ 0x5536cf8)
  0x27e47e0: ldr      x8, [x20]
  0x27e47e4: add      x27, x19, #0x79
  0x27e47e8: ldrb     w21, [x27]
  0x27e47ec: ldrb     w22, [x9, #0x6d]
  0x27e47f0: ldrb     w23, [x9, #0x6c]
  0x27e47f4: ldrh     w9, [x8, #0x12e]
  0x27e47f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e47fc: cbz      x9, #0x27e4820
  0x27e4800: ldr      x10, [x8, #0xb0]
  0x27e4804: add      x10, x10, #8
  0x27e4808: ldur     x11, [x10, #-8]
  0x27e480c: cmp      x11, x1
  0x27e4810: b.eq     #0x27e4830
  0x27e4814: subs     x9, x9, #1
  0x27e4818: add      x10, x10, #0x10
  0x27e481c: b.ne     #0x27e4808
  0x27e4820: mov      w2, #6
  0x27e4824: mov      x0, x20
  0x27e4828: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e482c: b        #0x27e4840
  0x27e4830: ldr      w9, [x10]
  0x27e4834: add      w9, w9, #6
  0x27e4838: add      x8, x8, w9, sxtw #4
  0x27e483c: add      x0, x8, #0x138
  0x27e4840: ldp      x8, x7, [x0]
  0x27e4844: mov      x0, x20
  0x27e4848: mov      w1, w23
  0x27e484c: mov      w2, w22
  0x27e4850: mov      w3, w21
  0x27e4854: mov      w4, wzr
  0x27e4858: mov      w5, wzr
  0x27e485c: mov      x6, x19
  0x27e4860: blr      x8
  0x27e4864: ldr      x0, [x19, #0x40]
  0x27e4868: cbz      x0, #0x27e57f0
  0x27e486c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4870: mov      w1, #4
  0x27e4874: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4878: ldr      x9, [x29]
  0x27e487c: cbz      x9, #0x27e57f0
  0x27e4880: mov      x20, x0
  0x27e4884: cbz      x0, #0x27e57f0
  0x27e4888: ldr      x8, [x20]
  0x27e488c: ldr      w21, [x19, #0xb0]
  0x27e4890: ldr      w22, [x19, #0xc0]
  0x27e4894: ldrb     w23, [x27]
  0x27e4898: ldrh     w24, [x9, #0x74]
  0x27e489c: ldrh     w25, [x9, #0x72]
  0x27e48a0: ldrh     w9, [x8, #0x12e]
  0x27e48a4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e48a8: cbz      x9, #0x27e48cc
  0x27e48ac: ldr      x10, [x8, #0xb0]
  0x27e48b0: add      x10, x10, #8
  0x27e48b4: ldur     x11, [x10, #-8]
  0x27e48b8: cmp      x11, x1
  0x27e48bc: b.eq     #0x27e48dc
  0x27e48c0: subs     x9, x9, #1
  0x27e48c4: add      x10, x10, #0x10
  0x27e48c8: b.ne     #0x27e48b4
  0x27e48cc: mov      w2, #6
  0x27e48d0: mov      x0, x20
  0x27e48d4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e48d8: b        #0x27e48ec
  0x27e48dc: ldr      w9, [x10]
  0x27e48e0: add      w9, w9, #6
  0x27e48e4: add      x8, x8, w9, sxtw #4
  0x27e48e8: add      x0, x8, #0x138
  0x27e48ec: ldp      x8, x7, [x0]
  0x27e48f0: mov      x0, x20
  0x27e48f4: mov      w1, w25
  0x27e48f8: mov      w2, w24
  0x27e48fc: mov      w3, w23
  0x27e4900: mov      w4, w21
  0x27e4904: mov      w5, w22
  0x27e4908: mov      x6, x19
  0x27e490c: blr      x8
  0x27e4910: ldr      x0, [x19, #0x40]
  0x27e4914: cbz      x0, #0x27e57f0
  0x27e4918: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e491c: mov      w1, #5
  0x27e4920: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4924: ldr      x9, [x29]
  0x27e4928: cbz      x9, #0x27e57f0
  0x27e492c: mov      x20, x0
  0x27e4930: cbz      x0, #0x27e57f0
  0x27e4934: ldr      x8, [x20]
  0x27e4938: ldr      w21, [x19, #0xb4]
  0x27e493c: ldr      w22, [x19, #0xc4]
  0x27e4940: ldrb     w23, [x27]
  0x27e4944: ldrh     w24, [x9, #0x78]
  0x27e4948: ldrh     w25, [x9, #0x76]
  0x27e494c: ldrh     w9, [x8, #0x12e]
  0x27e4950: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4954: cbz      x9, #0x27e4978
  0x27e4958: ldr      x10, [x8, #0xb0]
  0x27e495c: add      x10, x10, #8
  0x27e4960: ldur     x11, [x10, #-8]
  0x27e4964: cmp      x11, x1
  0x27e4968: b.eq     #0x27e4988
  0x27e496c: subs     x9, x9, #1
  0x27e4970: add      x10, x10, #0x10
  0x27e4974: b.ne     #0x27e4960
  0x27e4978: mov      w2, #6
  0x27e497c: mov      x0, x20
  0x27e4980: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4984: b        #0x27e4998
  0x27e4988: ldr      w9, [x10]
  0x27e498c: add      w9, w9, #6
  0x27e4990: add      x8, x8, w9, sxtw #4
  0x27e4994: add      x0, x8, #0x138
  0x27e4998: ldp      x8, x7, [x0]
  0x27e499c: mov      x0, x20
  0x27e49a0: mov      w1, w25
  0x27e49a4: mov      w2, w24
  0x27e49a8: mov      w3, w23
  0x27e49ac: mov      w4, w21
  0x27e49b0: mov      w5, w22
  0x27e49b4: mov      x6, x19
  0x27e49b8: blr      x8
  0x27e49bc: ldr      x0, [x19, #0x40]
  0x27e49c0: cbz      x0, #0x27e57f0
  0x27e49c4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e49c8: mov      w1, #3
  0x27e49cc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e49d0: ldr      x9, [x29]
  0x27e49d4: cbz      x9, #0x27e57f0
  0x27e49d8: mov      x20, x0
  0x27e49dc: cbz      x0, #0x27e57f0
  0x27e49e0: ldr      x8, [x20]
  0x27e49e4: ldr      w21, [x19, #0xbc]
  0x27e49e8: ldrb     w22, [x27]
  0x27e49ec: ldrh     w23, [x9, #0x70]
  0x27e49f0: ldrh     w24, [x9, #0x6e]
  0x27e49f4: ldrh     w9, [x8, #0x12e]
  0x27e49f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e49fc: cbz      x9, #0x27e4a20
  0x27e4a00: ldr      x10, [x8, #0xb0]
  0x27e4a04: add      x10, x10, #8
  0x27e4a08: ldur     x11, [x10, #-8]
  0x27e4a0c: cmp      x11, x1
  0x27e4a10: b.eq     #0x27e4a30
  0x27e4a14: subs     x9, x9, #1
  0x27e4a18: add      x10, x10, #0x10
  0x27e4a1c: b.ne     #0x27e4a08
  0x27e4a20: mov      w2, #6
  0x27e4a24: mov      x0, x20
  0x27e4a28: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4a2c: b        #0x27e4a40
  0x27e4a30: ldr      w9, [x10]
  0x27e4a34: add      w9, w9, #6
  0x27e4a38: add      x8, x8, w9, sxtw #4
  0x27e4a3c: add      x0, x8, #0x138
  0x27e4a40: ldp      x8, x7, [x0]
  0x27e4a44: mov      x0, x20
  0x27e4a48: mov      w1, w24
  0x27e4a4c: mov      w2, w23
  0x27e4a50: mov      w3, w22
  0x27e4a54: mov      w4, w21
  0x27e4a58: mov      w5, wzr
  0x27e4a5c: mov      x6, x19
  0x27e4a60: blr      x8
  0x27e4a64: ldr      x0, [x19, #0x40]
  0x27e4a68: cbz      x0, #0x27e57f0
  0x27e4a6c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4a70: mov      w1, #6
  0x27e4a74: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4a78: ldr      x9, [x29]
  0x27e4a7c: cbz      x9, #0x27e57f0
  0x27e4a80: mov      x20, x0
  0x27e4a84: cbz      x0, #0x27e57f0
  0x27e4a88: ldr      x8, [x20]
  0x27e4a8c: ldrb     w21, [x27]
  0x27e4a90: ldrh     w22, [x9, #0x7c]
  0x27e4a94: ldrh     w23, [x9, #0x7a]
  0x27e4a98: ldrh     w9, [x8, #0x12e]
  0x27e4a9c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4aa0: cbz      x9, #0x27e4ac4
  0x27e4aa4: ldr      x10, [x8, #0xb0]
  0x27e4aa8: add      x10, x10, #8
  0x27e4aac: ldur     x11, [x10, #-8]
  0x27e4ab0: cmp      x11, x1
  0x27e4ab4: b.eq     #0x27e4ad4
  0x27e4ab8: subs     x9, x9, #1
  0x27e4abc: add      x10, x10, #0x10
  0x27e4ac0: b.ne     #0x27e4aac
  0x27e4ac4: mov      w2, #6
  0x27e4ac8: mov      x0, x20
  0x27e4acc: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4ad0: b        #0x27e4ae4
  0x27e4ad4: ldr      w9, [x10]
  0x27e4ad8: add      w9, w9, #6
  0x27e4adc: add      x8, x8, w9, sxtw #4
  0x27e4ae0: add      x0, x8, #0x138
  0x27e4ae4: ldp      x8, x7, [x0]
  0x27e4ae8: mov      x0, x20
  0x27e4aec: mov      w1, w23
  0x27e4af0: mov      w2, w22
  0x27e4af4: mov      w3, w21
  0x27e4af8: mov      w4, wzr
  0x27e4afc: mov      w5, wzr
  0x27e4b00: mov      x6, x19
  0x27e4b04: blr      x8
  0x27e4b08: ldr      x0, [x19, #0x40]
  0x27e4b0c: cbz      x0, #0x27e57f0
  0x27e4b10: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4b14: mov      w1, #7
  0x27e4b18: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4b1c: ldr      x9, [x29]
  0x27e4b20: cbz      x9, #0x27e57f0
  0x27e4b24: mov      x20, x0
  0x27e4b28: cbz      x0, #0x27e57f0
  0x27e4b2c: ldr      x8, [x20]
  0x27e4b30: ldrb     w21, [x27]
  0x27e4b34: ldrh     w22, [x9, #0x80]
  0x27e4b38: ldrh     w23, [x9, #0x7e]
  0x27e4b3c: ldrh     w9, [x8, #0x12e]
  0x27e4b40: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4b44: cbz      x9, #0x27e4b68
  0x27e4b48: ldr      x10, [x8, #0xb0]
  0x27e4b4c: add      x10, x10, #8
  0x27e4b50: ldur     x11, [x10, #-8]
  0x27e4b54: cmp      x11, x1
  0x27e4b58: b.eq     #0x27e4b78
  0x27e4b5c: subs     x9, x9, #1
  0x27e4b60: add      x10, x10, #0x10
  0x27e4b64: b.ne     #0x27e4b50
  0x27e4b68: mov      w2, #6
  0x27e4b6c: mov      x0, x20
  0x27e4b70: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4b74: b        #0x27e4b88
  0x27e4b78: ldr      w9, [x10]
  0x27e4b7c: add      w9, w9, #6
  0x27e4b80: add      x8, x8, w9, sxtw #4
  0x27e4b84: add      x0, x8, #0x138
  0x27e4b88: ldp      x8, x7, [x0]
  0x27e4b8c: mov      x0, x20
  0x27e4b90: mov      w1, w23
  0x27e4b94: mov      w2, w22
  0x27e4b98: mov      w3, w21
  0x27e4b9c: mov      w4, wzr
  0x27e4ba0: mov      w5, wzr
  0x27e4ba4: mov      x6, x19
  0x27e4ba8: blr      x8
  0x27e4bac: ldr      x0, [x19, #0x40]
  0x27e4bb0: cbz      x0, #0x27e57f0
  0x27e4bb4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4bb8: mov      w1, #8
  0x27e4bbc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4bc0: ldr      x9, [x29]
  0x27e4bc4: cbz      x9, #0x27e57f0
  0x27e4bc8: mov      x20, x0
  0x27e4bcc: cbz      x0, #0x27e57f0
  0x27e4bd0: ldr      x8, [x20]
  0x27e4bd4: ldrb     w21, [x27]
  0x27e4bd8: ldrh     w22, [x9, #0x84]
  0x27e4bdc: ldrh     w23, [x9, #0x82]
  0x27e4be0: ldrh     w9, [x8, #0x12e]
  0x27e4be4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4be8: cbz      x9, #0x27e4c0c
  0x27e4bec: ldr      x10, [x8, #0xb0]
  0x27e4bf0: add      x10, x10, #8
  0x27e4bf4: ldur     x11, [x10, #-8]
  0x27e4bf8: cmp      x11, x1
  0x27e4bfc: b.eq     #0x27e4c1c
  0x27e4c00: subs     x9, x9, #1
  0x27e4c04: add      x10, x10, #0x10
  0x27e4c08: b.ne     #0x27e4bf4
  0x27e4c0c: mov      w2, #6
  0x27e4c10: mov      x0, x20
  0x27e4c14: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4c18: b        #0x27e4c2c
  0x27e4c1c: ldr      w9, [x10]
  0x27e4c20: add      w9, w9, #6
  0x27e4c24: add      x8, x8, w9, sxtw #4
  0x27e4c28: add      x0, x8, #0x138
  0x27e4c2c: ldp      x8, x7, [x0]
  0x27e4c30: mov      x0, x20
  0x27e4c34: mov      w1, w23
  0x27e4c38: mov      w2, w22
  0x27e4c3c: mov      w3, w21
  0x27e4c40: mov      w4, wzr
  0x27e4c44: mov      w5, wzr
  0x27e4c48: mov      x6, x19
  0x27e4c4c: blr      x8
  0x27e4c50: ldr      x0, [x19, #0x40]
  0x27e4c54: cbz      x0, #0x27e57f0
  0x27e4c58: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4c5c: mov      w1, #9
  0x27e4c60: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4c64: ldr      x9, [x29]
  0x27e4c68: cbz      x9, #0x27e57f0
  0x27e4c6c: mov      x20, x0
  0x27e4c70: cbz      x0, #0x27e57f0
  0x27e4c74: ldr      x8, [x20]
  0x27e4c78: ldrb     w21, [x27]
  0x27e4c7c: ldrh     w22, [x9, #0x88]
  0x27e4c80: ldrh     w23, [x9, #0x86]
  0x27e4c84: ldrh     w9, [x8, #0x12e]
  0x27e4c88: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4c8c: cbz      x9, #0x27e4cb0
  0x27e4c90: ldr      x10, [x8, #0xb0]
  0x27e4c94: add      x10, x10, #8
  0x27e4c98: ldur     x11, [x10, #-8]
  0x27e4c9c: cmp      x11, x1
  0x27e4ca0: b.eq     #0x27e4cc0
  0x27e4ca4: subs     x9, x9, #1
  0x27e4ca8: add      x10, x10, #0x10
  0x27e4cac: b.ne     #0x27e4c98
  0x27e4cb0: mov      w2, #6
  0x27e4cb4: mov      x0, x20
  0x27e4cb8: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4cbc: b        #0x27e4cd0
  0x27e4cc0: ldr      w9, [x10]
  0x27e4cc4: add      w9, w9, #6
  0x27e4cc8: add      x8, x8, w9, sxtw #4
  0x27e4ccc: add      x0, x8, #0x138
  0x27e4cd0: ldp      x8, x7, [x0]
  0x27e4cd4: mov      x0, x20
  0x27e4cd8: mov      w1, w23
  0x27e4cdc: mov      w2, w22
  0x27e4ce0: mov      w3, w21
  0x27e4ce4: mov      w4, wzr
  0x27e4ce8: mov      w5, wzr
  0x27e4cec: mov      x6, x19
  0x27e4cf0: blr      x8
  0x27e4cf4: ldr      x0, [x19, #0x40]
  0x27e4cf8: cbz      x0, #0x27e57f0
  0x27e4cfc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4d00: mov      w1, #0xa
  0x27e4d04: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4d08: ldr      x9, [x29]
  0x27e4d0c: cbz      x9, #0x27e57f0
  0x27e4d10: mov      x20, x0
  0x27e4d14: cbz      x0, #0x27e57f0
  0x27e4d18: ldr      x8, [x20]
  0x27e4d1c: ldrb     w21, [x27]
  0x27e4d20: ldrh     w22, [x9, #0x8c]
  0x27e4d24: ldrh     w23, [x9, #0x8a]
  0x27e4d28: ldrh     w9, [x8, #0x12e]
  0x27e4d2c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4d30: cbz      x9, #0x27e4d54
  0x27e4d34: ldr      x10, [x8, #0xb0]
  0x27e4d38: add      x10, x10, #8
  0x27e4d3c: ldur     x11, [x10, #-8]
  0x27e4d40: cmp      x11, x1
  0x27e4d44: b.eq     #0x27e4d64
  0x27e4d48: subs     x9, x9, #1
  0x27e4d4c: add      x10, x10, #0x10
  0x27e4d50: b.ne     #0x27e4d3c
  0x27e4d54: mov      w2, #6
  0x27e4d58: mov      x0, x20
  0x27e4d5c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4d60: b        #0x27e4d74
  0x27e4d64: ldr      w9, [x10]
  0x27e4d68: add      w9, w9, #6
  0x27e4d6c: add      x8, x8, w9, sxtw #4
  0x27e4d70: add      x0, x8, #0x138
  0x27e4d74: ldp      x8, x7, [x0]
  0x27e4d78: mov      x0, x20
  0x27e4d7c: mov      w1, w23
  0x27e4d80: mov      w2, w22
  0x27e4d84: mov      w3, w21
  0x27e4d88: mov      w4, wzr
  0x27e4d8c: mov      w5, wzr
  0x27e4d90: mov      x6, x19
  0x27e4d94: blr      x8
  0x27e4d98: ldr      x0, [x19, #0x40]
  0x27e4d9c: cbz      x0, #0x27e57f0
  0x27e4da0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4da4: mov      w1, #0xb
  0x27e4da8: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4dac: ldr      x9, [x29]
  0x27e4db0: cbz      x9, #0x27e57f0
  0x27e4db4: mov      x20, x0
  0x27e4db8: cbz      x0, #0x27e57f0
  0x27e4dbc: ldr      x8, [x20]
  0x27e4dc0: ldrb     w21, [x27]
  0x27e4dc4: ldrh     w22, [x9, #0x90]
  0x27e4dc8: ldrh     w23, [x9, #0x8e]
  0x27e4dcc: ldrh     w9, [x8, #0x12e]
  0x27e4dd0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4dd4: cbz      x9, #0x27e4df8
  0x27e4dd8: ldr      x10, [x8, #0xb0]
  0x27e4ddc: add      x10, x10, #8
  0x27e4de0: ldur     x11, [x10, #-8]
  0x27e4de4: cmp      x11, x1
  0x27e4de8: b.eq     #0x27e4e08
  0x27e4dec: subs     x9, x9, #1
  0x27e4df0: add      x10, x10, #0x10
  0x27e4df4: b.ne     #0x27e4de0
  0x27e4df8: mov      w2, #6
  0x27e4dfc: mov      x0, x20
  0x27e4e00: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4e04: b        #0x27e4e18
  0x27e4e08: ldr      w9, [x10]
  0x27e4e0c: add      w9, w9, #6
  0x27e4e10: add      x8, x8, w9, sxtw #4
  0x27e4e14: add      x0, x8, #0x138
  0x27e4e18: ldp      x8, x7, [x0]
  0x27e4e1c: mov      x0, x20
  0x27e4e20: mov      w1, w23
  0x27e4e24: mov      w2, w22
  0x27e4e28: mov      w3, w21
  0x27e4e2c: mov      w4, wzr
  0x27e4e30: mov      w5, wzr
  0x27e4e34: mov      x6, x19
  0x27e4e38: blr      x8
  0x27e4e3c: ldr      x0, [x19, #0x40]
  0x27e4e40: cbz      x0, #0x27e57f0
  0x27e4e44: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4e48: mov      w1, #0xc
  0x27e4e4c: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4e50: ldr      x9, [x29]
  0x27e4e54: cbz      x9, #0x27e57f0
  0x27e4e58: mov      x20, x0
  0x27e4e5c: cbz      x0, #0x27e57f0
  0x27e4e60: ldr      x8, [x20]
  0x27e4e64: ldrb     w21, [x27]
  0x27e4e68: ldrh     w22, [x9, #0x94]
  0x27e4e6c: ldrh     w23, [x9, #0x92]
  0x27e4e70: ldrh     w9, [x8, #0x12e]
  0x27e4e74: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4e78: cbz      x9, #0x27e4e9c
  0x27e4e7c: ldr      x10, [x8, #0xb0]
  0x27e4e80: add      x10, x10, #8
  0x27e4e84: ldur     x11, [x10, #-8]
  0x27e4e88: cmp      x11, x1
  0x27e4e8c: b.eq     #0x27e4eac
  0x27e4e90: subs     x9, x9, #1
  0x27e4e94: add      x10, x10, #0x10
  0x27e4e98: b.ne     #0x27e4e84
  0x27e4e9c: mov      w2, #6
  0x27e4ea0: mov      x0, x20
  0x27e4ea4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4ea8: b        #0x27e4ebc
  0x27e4eac: ldr      w9, [x10]
  0x27e4eb0: add      w9, w9, #6
  0x27e4eb4: add      x8, x8, w9, sxtw #4
  0x27e4eb8: add      x0, x8, #0x138
  0x27e4ebc: ldp      x8, x7, [x0]
  0x27e4ec0: mov      x0, x20
  0x27e4ec4: mov      w1, w23
  0x27e4ec8: mov      w2, w22
  0x27e4ecc: mov      w3, w21
  0x27e4ed0: mov      w4, wzr
  0x27e4ed4: mov      w5, wzr
  0x27e4ed8: mov      x6, x19
  0x27e4edc: blr      x8
  0x27e4ee0: ldr      x0, [x19, #0x40]
  0x27e4ee4: cbz      x0, #0x27e57f0
  0x27e4ee8: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4eec: mov      w1, #0xd
  0x27e4ef0: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4ef4: ldr      x9, [x29]
  0x27e4ef8: cbz      x9, #0x27e57f0
  0x27e4efc: mov      x20, x0
  0x27e4f00: cbz      x0, #0x27e57f0
  0x27e4f04: ldr      x8, [x20]
  0x27e4f08: ldrb     w21, [x27]
  0x27e4f0c: ldrh     w22, [x9, #0x98]
  0x27e4f10: ldrh     w23, [x9, #0x96]
  0x27e4f14: ldrh     w9, [x8, #0x12e]
  0x27e4f18: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4f1c: cbz      x9, #0x27e4f40
  0x27e4f20: ldr      x10, [x8, #0xb0]
  0x27e4f24: add      x10, x10, #8
  0x27e4f28: ldur     x11, [x10, #-8]
  0x27e4f2c: cmp      x11, x1
  0x27e4f30: b.eq     #0x27e4f50
  0x27e4f34: subs     x9, x9, #1
  0x27e4f38: add      x10, x10, #0x10
  0x27e4f3c: b.ne     #0x27e4f28
  0x27e4f40: mov      w2, #6
  0x27e4f44: mov      x0, x20
  0x27e4f48: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4f4c: b        #0x27e4f60
  0x27e4f50: ldr      w9, [x10]
  0x27e4f54: add      w9, w9, #6
  0x27e4f58: add      x8, x8, w9, sxtw #4
  0x27e4f5c: add      x0, x8, #0x138
  0x27e4f60: ldp      x8, x7, [x0]
  0x27e4f64: mov      x0, x20
  0x27e4f68: mov      w1, w23
  0x27e4f6c: mov      w2, w22
  0x27e4f70: mov      w3, w21
  0x27e4f74: mov      w4, wzr
  0x27e4f78: mov      w5, wzr
  0x27e4f7c: mov      x6, x19
  0x27e4f80: blr      x8
  0x27e4f84: ldr      x0, [x19, #0x40]
  0x27e4f88: cbz      x0, #0x27e57f0
  0x27e4f8c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e4f90: mov      w1, #0xe
  0x27e4f94: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e4f98: ldr      x9, [x29]
  0x27e4f9c: cbz      x9, #0x27e57f0
  0x27e4fa0: mov      x20, x0
  0x27e4fa4: cbz      x0, #0x27e57f0
  0x27e4fa8: ldr      x8, [x20]
  0x27e4fac: ldrb     w21, [x27]
  0x27e4fb0: ldrh     w22, [x9, #0x9c]
  0x27e4fb4: ldrh     w23, [x9, #0x9a]
  0x27e4fb8: ldrh     w9, [x8, #0x12e]
  0x27e4fbc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e4fc0: cbz      x9, #0x27e4fe4
  0x27e4fc4: ldr      x10, [x8, #0xb0]
  0x27e4fc8: add      x10, x10, #8
  0x27e4fcc: ldur     x11, [x10, #-8]
  0x27e4fd0: cmp      x11, x1
  0x27e4fd4: b.eq     #0x27e4ff4
  0x27e4fd8: subs     x9, x9, #1
  0x27e4fdc: add      x10, x10, #0x10
  0x27e4fe0: b.ne     #0x27e4fcc
  0x27e4fe4: mov      w2, #6
  0x27e4fe8: mov      x0, x20
  0x27e4fec: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e4ff0: b        #0x27e5004
  0x27e4ff4: ldr      w9, [x10]
  0x27e4ff8: add      w9, w9, #6
  0x27e4ffc: add      x8, x8, w9, sxtw #4
  0x27e5000: add      x0, x8, #0x138
  0x27e5004: ldp      x8, x7, [x0]
  0x27e5008: mov      x0, x20
  0x27e500c: mov      w1, w23
  0x27e5010: mov      w2, w22
  0x27e5014: mov      w3, w21
  0x27e5018: mov      w4, wzr
  0x27e501c: mov      w5, wzr
  0x27e5020: mov      x6, x19
  0x27e5024: blr      x8
  0x27e5028: ldr      x0, [x19, #0x40]
  0x27e502c: cbz      x0, #0x27e57f0
  0x27e5030: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e5034: mov      w1, #0xf
  0x27e5038: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e503c: ldr      x9, [x29]
  0x27e5040: cbz      x9, #0x27e57f0
  0x27e5044: mov      x20, x0
  0x27e5048: cbz      x0, #0x27e57f0
  0x27e504c: ldr      x8, [x20]
  0x27e5050: ldrb     w21, [x27]
  0x27e5054: ldrh     w22, [x9, #0xa0]
  0x27e5058: ldrh     w23, [x9, #0x9e]
  0x27e505c: ldrh     w9, [x8, #0x12e]
  0x27e5060: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5064: cbz      x9, #0x27e5088
  0x27e5068: ldr      x10, [x8, #0xb0]
  0x27e506c: add      x10, x10, #8
  0x27e5070: ldur     x11, [x10, #-8]
  0x27e5074: cmp      x11, x1
  0x27e5078: b.eq     #0x27e5098
  0x27e507c: subs     x9, x9, #1
  0x27e5080: add      x10, x10, #0x10
  0x27e5084: b.ne     #0x27e5070
  0x27e5088: mov      w2, #6
  0x27e508c: mov      x0, x20
  0x27e5090: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5094: b        #0x27e50a8
  0x27e5098: ldr      w9, [x10]
  0x27e509c: add      w9, w9, #6
  0x27e50a0: add      x8, x8, w9, sxtw #4
  0x27e50a4: add      x0, x8, #0x138
  0x27e50a8: ldp      x8, x7, [x0]
  0x27e50ac: mov      x0, x20
  0x27e50b0: mov      w1, w23
  0x27e50b4: mov      w2, w22
  0x27e50b8: mov      w3, w21
  0x27e50bc: mov      w4, wzr
  0x27e50c0: mov      w5, wzr
  0x27e50c4: mov      x6, x19
  0x27e50c8: blr      x8
  0x27e50cc: ldr      x0, [x19, #0x40]
  0x27e50d0: cbz      x0, #0x27e57f0
  0x27e50d4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e50d8: mov      w1, #0x10
  0x27e50dc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e50e0: ldr      x9, [x29]
  0x27e50e4: cbz      x9, #0x27e57f0
  0x27e50e8: mov      x20, x0
  0x27e50ec: cbz      x0, #0x27e57f0
  0x27e50f0: ldr      x8, [x20]
  0x27e50f4: ldrb     w21, [x27]
  0x27e50f8: ldrh     w22, [x9, #0xa4]
  0x27e50fc: ldrh     w23, [x9, #0xa2]
  0x27e5100: ldrh     w9, [x8, #0x12e]
  0x27e5104: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5108: cbz      x9, #0x27e512c
  0x27e510c: ldr      x10, [x8, #0xb0]
  0x27e5110: add      x10, x10, #8
  0x27e5114: ldur     x11, [x10, #-8]
  0x27e5118: cmp      x11, x1
  0x27e511c: b.eq     #0x27e513c
  0x27e5120: subs     x9, x9, #1
  0x27e5124: add      x10, x10, #0x10
  0x27e5128: b.ne     #0x27e5114
  0x27e512c: mov      w2, #6
  0x27e5130: mov      x0, x20
  0x27e5134: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5138: b        #0x27e514c
  0x27e513c: ldr      w9, [x10]
  0x27e5140: add      w9, w9, #6
  0x27e5144: add      x8, x8, w9, sxtw #4
  0x27e5148: add      x0, x8, #0x138
  0x27e514c: ldp      x8, x7, [x0]
  0x27e5150: mov      x0, x20
  0x27e5154: mov      w1, w23
  0x27e5158: mov      w2, w22
  0x27e515c: mov      w3, w21
  0x27e5160: mov      w4, wzr
  0x27e5164: mov      w5, wzr
  0x27e5168: mov      x6, x19
  0x27e516c: blr      x8
  0x27e5170: ldr      x0, [x19, #0x40]
  0x27e5174: cbz      x0, #0x27e57f0
  0x27e5178: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e517c: mov      w1, #0x11
  0x27e5180: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5184: ldr      x9, [x29]
  0x27e5188: cbz      x9, #0x27e57f0
  0x27e518c: mov      x20, x0
  0x27e5190: cbz      x0, #0x27e57f0
  0x27e5194: ldr      x8, [x20]
  0x27e5198: ldrb     w21, [x27]
  0x27e519c: ldrh     w22, [x9, #0xa8]
  0x27e51a0: ldrh     w23, [x9, #0xa6]
  0x27e51a4: ldrh     w9, [x8, #0x12e]
  0x27e51a8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e51ac: cbz      x9, #0x27e51d0
  0x27e51b0: ldr      x10, [x8, #0xb0]
  0x27e51b4: add      x10, x10, #8
  0x27e51b8: ldur     x11, [x10, #-8]
  0x27e51bc: cmp      x11, x1
  0x27e51c0: b.eq     #0x27e51e0
  0x27e51c4: subs     x9, x9, #1
  0x27e51c8: add      x10, x10, #0x10
  0x27e51cc: b.ne     #0x27e51b8
  0x27e51d0: mov      w2, #6
  0x27e51d4: mov      x0, x20
  0x27e51d8: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e51dc: b        #0x27e51f0
  0x27e51e0: ldr      w9, [x10]
  0x27e51e4: add      w9, w9, #6
  0x27e51e8: add      x8, x8, w9, sxtw #4
  0x27e51ec: add      x0, x8, #0x138
  0x27e51f0: ldp      x8, x7, [x0]
  0x27e51f4: mov      x0, x20
  0x27e51f8: mov      w1, w23
  0x27e51fc: mov      w2, w22
  0x27e5200: mov      w3, w21
  0x27e5204: mov      w4, wzr
  0x27e5208: mov      w5, wzr
  0x27e520c: mov      x6, x19
  0x27e5210: blr      x8
  0x27e5214: ldr      x0, [x19, #0x40]
  0x27e5218: cbz      x0, #0x27e57f0
  0x27e521c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e5220: mov      w1, #0x12
  0x27e5224: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5228: ldr      x9, [x29]
  0x27e522c: cbz      x9, #0x27e57f0
  0x27e5230: mov      x20, x0
  0x27e5234: cbz      x0, #0x27e57f0
  0x27e5238: ldr      x8, [x20]
  0x27e523c: ldrb     w21, [x27]
  0x27e5240: ldrh     w22, [x9, #0xac]
  0x27e5244: ldrh     w23, [x9, #0xaa]
  0x27e5248: ldrh     w9, [x8, #0x12e]
  0x27e524c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5250: cbz      x9, #0x27e5274
  0x27e5254: ldr      x10, [x8, #0xb0]
  0x27e5258: add      x10, x10, #8
  0x27e525c: ldur     x11, [x10, #-8]
  0x27e5260: cmp      x11, x1
  0x27e5264: b.eq     #0x27e5284
  0x27e5268: subs     x9, x9, #1
  0x27e526c: add      x10, x10, #0x10
  0x27e5270: b.ne     #0x27e525c
  0x27e5274: mov      w2, #6
  0x27e5278: mov      x0, x20
  0x27e527c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5280: b        #0x27e5294
  0x27e5284: ldr      w9, [x10]
  0x27e5288: add      w9, w9, #6
  0x27e528c: add      x8, x8, w9, sxtw #4
  0x27e5290: add      x0, x8, #0x138
  0x27e5294: ldp      x8, x7, [x0]
  0x27e5298: mov      x0, x20
  0x27e529c: mov      w1, w23
  0x27e52a0: mov      w2, w22
  0x27e52a4: mov      w3, w21
  0x27e52a8: mov      w4, wzr
  0x27e52ac: mov      w5, wzr
  0x27e52b0: mov      x6, x19
  0x27e52b4: blr      x8
  0x27e52b8: ldr      x0, [x19, #0x40]
  0x27e52bc: cbz      x0, #0x27e57f0
  0x27e52c0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e52c4: mov      w1, #0x13
  0x27e52c8: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e52cc: ldr      x9, [x29]
  0x27e52d0: cbz      x9, #0x27e57f0
  0x27e52d4: mov      x20, x0
  0x27e52d8: cbz      x0, #0x27e57f0
  0x27e52dc: ldr      x8, [x20]
  0x27e52e0: ldrb     w21, [x27]
  0x27e52e4: ldrh     w22, [x9, #0xb0]
  0x27e52e8: ldrh     w23, [x9, #0xae]
  0x27e52ec: ldrh     w9, [x8, #0x12e]
  0x27e52f0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e52f4: cbz      x9, #0x27e5318
  0x27e52f8: ldr      x10, [x8, #0xb0]
  0x27e52fc: add      x10, x10, #8
  0x27e5300: ldur     x11, [x10, #-8]
  0x27e5304: cmp      x11, x1
  0x27e5308: b.eq     #0x27e5328
  0x27e530c: subs     x9, x9, #1
  0x27e5310: add      x10, x10, #0x10
  0x27e5314: b.ne     #0x27e5300
  0x27e5318: mov      w2, #6
  0x27e531c: mov      x0, x20
  0x27e5320: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5324: b        #0x27e5338
  0x27e5328: ldr      w9, [x10]
  0x27e532c: add      w9, w9, #6
  0x27e5330: add      x8, x8, w9, sxtw #4
  0x27e5334: add      x0, x8, #0x138
  0x27e5338: ldp      x8, x7, [x0]
  0x27e533c: mov      x0, x20
  0x27e5340: mov      w1, w23
  0x27e5344: mov      w2, w22
  0x27e5348: mov      w3, w21
  0x27e534c: mov      w4, wzr
  0x27e5350: mov      w5, wzr
  0x27e5354: mov      x6, x19
  0x27e5358: blr      x8
  0x27e535c: ldr      x0, [x19, #0x40]
  0x27e5360: cbz      x0, #0x27e57f0
  0x27e5364: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e5368: mov      w1, #0x14
  0x27e536c: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5370: ldr      x9, [x29]
  0x27e5374: cbz      x9, #0x27e57f0
  0x27e5378: mov      x20, x0
  0x27e537c: cbz      x0, #0x27e57f0
  0x27e5380: ldr      x8, [x20]
  0x27e5384: ldrb     w21, [x27]
  0x27e5388: ldrh     w22, [x9, #0xb4]
  0x27e538c: ldrh     w23, [x9, #0xb2]
  0x27e5390: ldrh     w9, [x8, #0x12e]
  0x27e5394: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5398: cbz      x9, #0x27e53bc
  0x27e539c: ldr      x10, [x8, #0xb0]
  0x27e53a0: add      x10, x10, #8
  0x27e53a4: ldur     x11, [x10, #-8]
  0x27e53a8: cmp      x11, x1
  0x27e53ac: b.eq     #0x27e53cc
  0x27e53b0: subs     x9, x9, #1
  0x27e53b4: add      x10, x10, #0x10
  0x27e53b8: b.ne     #0x27e53a4
  0x27e53bc: mov      w2, #6
  0x27e53c0: mov      x0, x20
  0x27e53c4: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e53c8: b        #0x27e53dc
  0x27e53cc: ldr      w9, [x10]
  0x27e53d0: add      w9, w9, #6
  0x27e53d4: add      x8, x8, w9, sxtw #4
  0x27e53d8: add      x0, x8, #0x138
  0x27e53dc: ldp      x8, x7, [x0]
  0x27e53e0: mov      x0, x20
  0x27e53e4: mov      w1, w23
  0x27e53e8: mov      w2, w22
  0x27e53ec: mov      w3, w21
  0x27e53f0: mov      w4, wzr
  0x27e53f4: mov      w5, wzr
  0x27e53f8: mov      x6, x19
  0x27e53fc: blr      x8
  0x27e5400: ldr      x0, [x19, #0x40]
  0x27e5404: cbz      x0, #0x27e57f0
  0x27e5408: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e540c: mov      w1, #0x15
  0x27e5410: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5414: ldr      x9, [x29]
  0x27e5418: cbz      x9, #0x27e57f0
  0x27e541c: mov      x20, x0
  0x27e5420: cbz      x0, #0x27e57f0
  0x27e5424: ldr      x8, [x20]
  0x27e5428: ldrb     w21, [x27]
  0x27e542c: ldrh     w22, [x9, #0xb8]
  0x27e5430: ldrh     w23, [x9, #0xb6]
  0x27e5434: ldrh     w9, [x8, #0x12e]
  0x27e5438: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e543c: cbz      x9, #0x27e5460
  0x27e5440: ldr      x10, [x8, #0xb0]
  0x27e5444: add      x10, x10, #8
  0x27e5448: ldur     x11, [x10, #-8]
  0x27e544c: cmp      x11, x1
  0x27e5450: b.eq     #0x27e5470
  0x27e5454: subs     x9, x9, #1
  0x27e5458: add      x10, x10, #0x10
  0x27e545c: b.ne     #0x27e5448
  0x27e5460: mov      w2, #6
  0x27e5464: mov      x0, x20
  0x27e5468: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e546c: b        #0x27e5480
  0x27e5470: ldr      w9, [x10]
  0x27e5474: add      w9, w9, #6
  0x27e5478: add      x8, x8, w9, sxtw #4
  0x27e547c: add      x0, x8, #0x138
  0x27e5480: ldp      x8, x7, [x0]
  0x27e5484: mov      x0, x20
  0x27e5488: mov      w1, w23
  0x27e548c: mov      w2, w22
  0x27e5490: mov      w3, w21
  0x27e5494: mov      w4, wzr
  0x27e5498: mov      w5, wzr
  0x27e549c: mov      x6, x19
  0x27e54a0: blr      x8
  0x27e54a4: ldr      x0, [x19, #0x40]
  0x27e54a8: cbz      x0, #0x27e57f0
  0x27e54ac: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e54b0: mov      w1, #0x16
  0x27e54b4: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e54b8: ldr      x9, [x29]
  0x27e54bc: cbz      x9, #0x27e57f0
  0x27e54c0: mov      x20, x0
  0x27e54c4: cbz      x0, #0x27e57f0
  0x27e54c8: ldr      x8, [x20]
  0x27e54cc: ldrb     w21, [x27]
  0x27e54d0: ldrh     w22, [x9, #0xbc]
  0x27e54d4: ldrh     w23, [x9, #0xba]
  0x27e54d8: ldrh     w9, [x8, #0x12e]
  0x27e54dc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e54e0: cbz      x9, #0x27e5504
  0x27e54e4: ldr      x10, [x8, #0xb0]
  0x27e54e8: add      x10, x10, #8
  0x27e54ec: ldur     x11, [x10, #-8]
  0x27e54f0: cmp      x11, x1
  0x27e54f4: b.eq     #0x27e5514
  0x27e54f8: subs     x9, x9, #1
  0x27e54fc: add      x10, x10, #0x10
  0x27e5500: b.ne     #0x27e54ec
  0x27e5504: mov      w2, #6
  0x27e5508: mov      x0, x20
  0x27e550c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5510: b        #0x27e5524
  0x27e5514: ldr      w9, [x10]
  0x27e5518: add      w9, w9, #6
  0x27e551c: add      x8, x8, w9, sxtw #4
  0x27e5520: add      x0, x8, #0x138
  0x27e5524: ldp      x8, x7, [x0]
  0x27e5528: mov      x0, x20
  0x27e552c: mov      w1, w23
  0x27e5530: mov      w2, w22
  0x27e5534: mov      w3, w21
  0x27e5538: mov      w4, wzr
  0x27e553c: mov      w5, wzr
  0x27e5540: mov      x6, x19
  0x27e5544: blr      x8
  0x27e5548: ldr      x0, [x19, #0x40]
  0x27e554c: cbz      x0, #0x27e57f0
  0x27e5550: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e5554: mov      w1, #0x17
  0x27e5558: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e555c: ldr      x9, [x29]
  0x27e5560: cbz      x9, #0x27e57f0
  0x27e5564: mov      x20, x0
  0x27e5568: cbz      x0, #0x27e57f0
  0x27e556c: ldr      x8, [x20]
  0x27e5570: ldrb     w21, [x27]
  0x27e5574: ldrh     w22, [x9, #0xc0]
  0x27e5578: ldrh     w23, [x9, #0xbe]
  0x27e557c: ldrh     w9, [x8, #0x12e]
  0x27e5580: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5584: cbz      x9, #0x27e55a8
  0x27e5588: ldr      x10, [x8, #0xb0]
  0x27e558c: add      x10, x10, #8
  0x27e5590: ldur     x11, [x10, #-8]
  0x27e5594: cmp      x11, x1
  0x27e5598: b.eq     #0x27e55b8
  0x27e559c: subs     x9, x9, #1
  0x27e55a0: add      x10, x10, #0x10
  0x27e55a4: b.ne     #0x27e5590
  0x27e55a8: mov      w2, #6
  0x27e55ac: mov      x0, x20
  0x27e55b0: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e55b4: b        #0x27e55c8
  0x27e55b8: ldr      w9, [x10]
  0x27e55bc: add      w9, w9, #6
  0x27e55c0: add      x8, x8, w9, sxtw #4
  0x27e55c4: add      x0, x8, #0x138
  0x27e55c8: ldp      x8, x7, [x0]
  0x27e55cc: mov      x0, x20
  0x27e55d0: mov      w1, w23
  0x27e55d4: mov      w2, w22
  0x27e55d8: mov      w3, w21
  0x27e55dc: mov      w4, wzr
  0x27e55e0: mov      w5, wzr
  0x27e55e4: mov      x6, x19
  0x27e55e8: blr      x8
  0x27e55ec: ldr      x0, [x19, #0x40]
  0x27e55f0: cbz      x0, #0x27e57f0
  0x27e55f4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e55f8: mov      w1, #0x18
  0x27e55fc: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5600: ldr      x9, [x29]
  0x27e5604: cbz      x9, #0x27e57f0
  0x27e5608: mov      x20, x0
  0x27e560c: cbz      x0, #0x27e57f0
  0x27e5610: ldr      x8, [x20]
  0x27e5614: ldrb     w21, [x27]
  0x27e5618: ldrh     w22, [x9, #0xc4]
  0x27e561c: ldrh     w23, [x9, #0xc2]
  0x27e5620: ldrh     w9, [x8, #0x12e]
  0x27e5624: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5628: cbz      x9, #0x27e564c
  0x27e562c: ldr      x10, [x8, #0xb0]
  0x27e5630: add      x10, x10, #8
  0x27e5634: ldur     x11, [x10, #-8]
  0x27e5638: cmp      x11, x1
  0x27e563c: b.eq     #0x27e565c
  0x27e5640: subs     x9, x9, #1
  0x27e5644: add      x10, x10, #0x10
  0x27e5648: b.ne     #0x27e5634
  0x27e564c: mov      w2, #6
  0x27e5650: mov      x0, x20
  0x27e5654: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e5658: b        #0x27e566c
  0x27e565c: ldr      w9, [x10]
  0x27e5660: add      w9, w9, #6
  0x27e5664: add      x8, x8, w9, sxtw #4
  0x27e5668: add      x0, x8, #0x138
  0x27e566c: ldp      x8, x7, [x0]
  0x27e5670: mov      x0, x20
  0x27e5674: mov      w1, w23
  0x27e5678: mov      w2, w22
  0x27e567c: mov      w3, w21
  0x27e5680: mov      w4, wzr
  0x27e5684: mov      w5, wzr
  0x27e5688: mov      x6, x19
  0x27e568c: blr      x8
  0x27e5690: ldr      x0, [x19, #0x40]
  0x27e5694: cbz      x0, #0x27e57f0
  0x27e5698: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e569c: mov      w1, #0x19
  0x27e56a0: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e56a4: ldr      x9, [x29]
  0x27e56a8: cbz      x9, #0x27e57f0
  0x27e56ac: mov      x20, x0
  0x27e56b0: cbz      x0, #0x27e57f0
  0x27e56b4: ldr      x8, [x20]
  0x27e56b8: ldrb     w21, [x27]
  0x27e56bc: ldrh     w22, [x9, #0xc8]
  0x27e56c0: ldrh     w23, [x9, #0xc6]
  0x27e56c4: ldrh     w9, [x8, #0x12e]
  0x27e56c8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e56cc: cbz      x9, #0x27e56f0
  0x27e56d0: ldr      x10, [x8, #0xb0]
  0x27e56d4: add      x10, x10, #8
  0x27e56d8: ldur     x11, [x10, #-8]
  0x27e56dc: cmp      x11, x1
  0x27e56e0: b.eq     #0x27e5700
  0x27e56e4: subs     x9, x9, #1
  0x27e56e8: add      x10, x10, #0x10
  0x27e56ec: b.ne     #0x27e56d8
  0x27e56f0: mov      w2, #6
  0x27e56f4: mov      x0, x20
  0x27e56f8: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e56fc: b        #0x27e5710
  0x27e5700: ldr      w9, [x10]
  0x27e5704: add      w9, w9, #6
  0x27e5708: add      x8, x8, w9, sxtw #4
  0x27e570c: add      x0, x8, #0x138
  0x27e5710: ldp      x8, x7, [x0]
  0x27e5714: mov      x0, x20
  0x27e5718: mov      w1, w23
  0x27e571c: mov      w2, w22
  0x27e5720: mov      w3, w21
  0x27e5724: mov      w4, wzr
  0x27e5728: mov      w5, wzr
  0x27e572c: mov      x6, x19
  0x27e5730: blr      x8
  0x27e5734: ldr      x0, [x19, #0x40]
  0x27e5738: cbz      x0, #0x27e57f0
  0x27e573c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x27e5740: mov      w1, #0x1a
  0x27e5744: bl       #0x3fb1538 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x27e5748: ldr      x9, [x29]
  0x27e574c: cbz      x9, #0x27e57f0
  0x27e5750: mov      x20, x0
  0x27e5754: cbz      x0, #0x27e57f0
  0x27e5758: ldr      x8, [x20]
  0x27e575c: ldrb     w21, [x27]
  0x27e5760: ldrh     w22, [x9, #0xcc]
  0x27e5764: ldrh     w23, [x9, #0xca]
  0x27e5768: ldrh     w9, [x8, #0x12e]
  0x27e576c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5536000)
  0x27e5770: cbz      x9, #0x27e5794
  0x27e5774: ldr      x10, [x8, #0xb0]
  0x27e5778: add      x10, x10, #8
  0x27e577c: ldur     x11, [x10, #-8]
  0x27e5780: cmp      x11, x1
  0x27e5784: b.eq     #0x27e57a4
  0x27e5788: subs     x9, x9, #1
  0x27e578c: add      x10, x10, #0x10
  0x27e5790: b.ne     #0x27e577c
  0x27e5794: mov      w2, #6
  0x27e5798: mov      x0, x20
  0x27e579c: bl       #0x21e4dd0 ; -> ??? 0x21e4dd0
  0x27e57a0: b        #0x27e57b4
  0x27e57a4: ldr      w9, [x10]
  0x27e57a8: add      w9, w9, #6
  0x27e57ac: add      x8, x8, w9, sxtw #4
  0x27e57b0: add      x0, x8, #0x138
  0x27e57b4: ldp      x8, x7, [x0]
  0x27e57b8: mov      x0, x20
  0x27e57bc: mov      w1, w23
  0x27e57c0: mov      w2, w22
  0x27e57c4: mov      w3, w21
  0x27e57c8: mov      x6, x19
  0x27e57cc: ldp      x20, x19, [sp, #0x50]
  0x27e57d0: ldp      x22, x21, [sp, #0x40]
  0x27e57d4: ldp      x24, x23, [sp, #0x30]
  0x27e57d8: ldp      x26, x25, [sp, #0x20]
  0x27e57dc: ldp      x28, x27, [sp, #0x10]
  0x27e57e0: mov      w4, wzr
  0x27e57e4: mov      w5, wzr
  0x27e57e8: ldp      x29, x30, [sp], #0x60
  0x27e57ec: br       x8
  0x27e57f0: bl       #0x21849c0 ; -> ??? 0x21849c0
