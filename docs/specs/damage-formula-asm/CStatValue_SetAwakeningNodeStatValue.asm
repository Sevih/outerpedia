; ===== CStatValue_SetAwakeningNodeStatValue @ 0x28d38a8..0x28d3aec (taille 580 octets) =====
  0x28d38a8: sub      sp, sp, #0x90
  0x28d38ac: stp      x30, x27, [sp, #0x40]
  0x28d38b0: stp      x26, x25, [sp, #0x50]
  0x28d38b4: stp      x24, x23, [sp, #0x60]
  0x28d38b8: stp      x22, x21, [sp, #0x70]
  0x28d38bc: stp      x20, x19, [sp, #0x80]
  0x28d38c0: adrp     x21, #0x5958000
  0x28d38c4: adrp     x23, #0x5511000
  0x28d38c8: ldrb     w8, [x21, #0xbc9]
  0x28d38cc: ldr      x23, [x23, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d38d0: mov      x20, x1
  0x28d38d4: mov      x19, x0
  0x28d38d8: tbnz     w8, #0, #0x28d3920
  0x28d38dc: adrp     x0, #0x553c000
  0x28d38e0: ldr      x0, [x0, #0xef8] ; = 0x0 (u64 @ 0x553cef8)
  0x28d38e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d38e8: adrp     x0, #0x553c000
  0x28d38ec: ldr      x0, [x0, #0xf00] ; = 0x0 (u64 @ 0x553cf00)
  0x28d38f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d38f4: adrp     x0, #0x553c000
  0x28d38f8: ldr      x0, [x0, #0xf08] ; = 0x0 (u64 @ 0x553cf08)
  0x28d38fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3900: adrp     x0, #0x553c000
  0x28d3904: ldr      x0, [x0, #0xf10] ; = 0x0 (u64 @ 0x553cf10)
  0x28d3908: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d390c: adrp     x0, #0x5511000
  0x28d3910: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d3914: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3918: mov      w8, #1
  0x28d391c: strb     w8, [x21, #0xbc9]
  0x28d3920: mov      x0, x19
  0x28d3924: mov      w1, wzr
  0x28d3928: stp      xzr, xzr, [sp, #0x20]
  0x28d392c: str      xzr, [sp, #0x30]
  0x28d3930: bl       #0x28d11dc ; -> CStatValue$$set_m_nAwakeningValue
  0x28d3934: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d3938: ldr      w8, [x0, #0xe0]
  0x28d393c: cbnz     w8, #0x28d3944
  0x28d3940: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3944: mov      w0, wzr
  0x28d3948: mov      x1, xzr
  0x28d394c: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d3950: stur     x0, [x19, #0x8c]
  0x28d3954: str      w1, [x19, #0x94]
  0x28d3958: cbz      x20, #0x28d3a50
  0x28d395c: adrp     x8, #0x553c000
  0x28d3960: ldr      x8, [x8, #0xf10] ; = 0x0 (u64 @ 0x553cf10)
  0x28d3964: adrp     x24, #0x553c000
  0x28d3968: adrp     x22, #0x553c000
  0x28d396c: mov      x0, x20
  0x28d3970: ldr      x1, [x8] ; = 0x0 (u64 @ 0x553c000)
  0x28d3974: ldr      x24, [x24, #0xf00] ; = 0x0 (u64 @ 0x553cf00)
  0x28d3978: ldr      x22, [x22, #0xef8] ; = 0x0 (u64 @ 0x553cef8)
  0x28d397c: add      x8, sp, #8
  0x28d3980: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x28d3984: ldur     q0, [sp, #8]
  0x28d3988: ldr      x8, [sp, #0x18]
  0x28d398c: mov      w25, #1
  0x28d3990: str      q0, [sp, #0x20]
  0x28d3994: str      x8, [sp, #0x30]
  0x28d3998: ldr      x1, [x24] ; = 0x0 (u64 @ 0x553c000)
  0x28d399c: add      x0, sp, #0x20
  0x28d39a0: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x28d39a4: tbz      w0, #0, #0x28d3a44
  0x28d39a8: ldr      x26, [sp, #0x30]
  0x28d39ac: cbz      x26, #0x28d3a6c
  0x28d39b0: ldr      w8, [x19, #0x10]
  0x28d39b4: ldr      w9, [x26, #0x38]
  0x28d39b8: cmp      w8, w9
  0x28d39bc: b.ne     #0x28d3998
  0x28d39c0: ldr      w8, [x26, #0x3c]
  0x28d39c4: cmp      w8, #1
  0x28d39c8: b.eq     #0x28d3a24
  0x28d39cc: cmp      w8, #2
  0x28d39d0: b.ne     #0x28d3998
  0x28d39d4: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d39d8: ldur     x21, [x19, #0x8c]
  0x28d39dc: ldr      w27, [x19, #0x94]
  0x28d39e0: ldr      w8, [x0, #0xe0]
  0x28d39e4: cbnz     w8, #0x28d39ec
  0x28d39e8: bl       #0x218489c ; -> ??? 0x218489c
  0x28d39ec: and      x8, x20, #0xffffffff00000000
  0x28d39f0: orr      x20, x8, x27
  0x28d39f4: mov      x0, x21
  0x28d39f8: mov      x1, x20
  0x28d39fc: mov      x2, xzr
  0x28d3a00: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3a04: ldr      w8, [x26, #0x40]
  0x28d3a08: add      w0, w8, w0
  0x28d3a0c: mov      x1, xzr
  0x28d3a10: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d3a14: stur     x0, [x19, #0x8c]
  0x28d3a18: str      w1, [x19, #0x94]
  0x28d3a1c: strb     w25, [x19, #0xe0]
  0x28d3a20: b        #0x28d3998
  0x28d3a24: strb     w25, [x19, #0xe0]
  0x28d3a28: mov      x0, x19
  0x28d3a2c: bl       #0x28d124c ; -> CStatValue$$get_m_nAwakeningValue
  0x28d3a30: ldr      w8, [x26, #0x40]
  0x28d3a34: add      w1, w8, w0
  0x28d3a38: mov      x0, x19
  0x28d3a3c: bl       #0x28d11dc ; -> CStatValue$$set_m_nAwakeningValue
  0x28d3a40: b        #0x28d3998
  0x28d3a44: ldr      x1, [x22] ; = 0x0 (u64 @ 0x553c000)
  0x28d3a48: add      x0, sp, #0x20
  0x28d3a4c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3a50: ldp      x20, x19, [sp, #0x80]
  0x28d3a54: ldp      x22, x21, [sp, #0x70]
  0x28d3a58: ldp      x24, x23, [sp, #0x60]
  0x28d3a5c: ldp      x26, x25, [sp, #0x50]
  0x28d3a60: ldp      x30, x27, [sp, #0x40]
  0x28d3a64: add      sp, sp, #0x90
  0x28d3a68: ret      
  0x28d3a6c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x28d3a70: b        #0x28d3a88
  0x28d3a74: b        #0x28d3a88
  0x28d3a78: b        #0x28d3a88
  0x28d3a7c: b        #0x28d3a88
  0x28d3a80: b        #0x28d3a88
  0x28d3a84: b        #0x28d3a88
  0x28d3a88: mov      x19, x0
  0x28d3a8c: cmp      w1, #1
  0x28d3a90: b.ne     #0x28d3abc
  0x28d3a94: mov      x0, x19
  0x28d3a98: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x28d3a9c: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5511000)
  0x28d3aa0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x28d3aa4: ldr      x1, [x22] ; = 0x0 (u64 @ 0x553c000)
  0x28d3aa8: add      x0, sp, #0x20
  0x28d3aac: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3ab0: cbz      x20, #0x28d3a50
  0x28d3ab4: mov      x0, x20
  0x28d3ab8: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x28d3abc: mov      x20, xzr
  0x28d3ac0: b        #0x28d3ac8
  0x28d3ac4: mov      x19, x0
  0x28d3ac8: ldr      x1, [x22] ; = 0x0 (u64 @ 0x553c000)
  0x28d3acc: add      x0, sp, #0x20
  0x28d3ad0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x28d3ad4: cbnz     x20, #0x28d3ae0
  0x28d3ad8: mov      x0, x19
  0x28d3adc: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x28d3ae0: mov      x0, x20
  0x28d3ae4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x28d3ae8: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
