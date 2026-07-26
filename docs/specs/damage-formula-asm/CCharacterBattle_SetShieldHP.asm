; ===== CCharacterBattle_SetShieldHP @ 0x26c89d0..0x26c8b30 (taille 352 octets) =====
  0x26c89d0: str      x30, [sp, #-0x30]!
  0x26c89d4: stp      x22, x21, [sp, #0x10]
  0x26c89d8: stp      x20, x19, [sp, #0x20]
  0x26c89dc: adrp     x21, #0x5957000
  0x26c89e0: ldrb     w8, [x21, #0xb5e]
  0x26c89e4: mov      w20, w1
  0x26c89e8: mov      x19, x0
  0x26c89ec: tbnz     w8, #0, #0x26c8a04
  0x26c89f0: adrp     x0, #0x5511000
  0x26c89f4: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x26c89f8: bl       #0x2184724 ; -> ??? 0x2184724
  0x26c89fc: mov      w8, #1
  0x26c8a00: strb     w8, [x21, #0xb5e]
  0x26c8a04: mov      x0, x19
  0x26c8a08: mov      w1, w20
  0x26c8a0c: bl       #0x26c5eec ; -> CCharacterBattle$$set_m_nShieldHP
  0x26c8a10: ldr      x0, [x19, #0x28]
  0x26c8a14: str      w20, [x19, #0x30c]
  0x26c8a18: cbz      x0, #0x26c8a98
  0x26c8a1c: mov      x1, xzr
  0x26c8a20: bl       #0x27df4b4 ; -> CCharacterData$$get_Type
  0x26c8a24: cmp      w0, #3
  0x26c8a28: b.lt     #0x26c8a98
  0x26c8a2c: ldr      x20, [x19, #0x2d8]
  0x26c8a30: cbz      x20, #0x26c8b1c
  0x26c8a34: adrp     x8, #0x5511000
  0x26c8a38: ldr      x8, [x8, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x26c8a3c: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c8a40: add      x8, x19, #0x31c
  0x26c8a44: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c8a48: ldr      w22, [x8, #8]
  0x26c8a4c: ldr      w9, [x0, #0xe0]
  0x26c8a50: cbnz     w9, #0x26c8a58
  0x26c8a54: bl       #0x218489c ; -> ??? 0x218489c
  0x26c8a58: mov      x0, x21
  0x26c8a5c: mov      x1, x22
  0x26c8a60: mov      x2, xzr
  0x26c8a64: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c8a68: mov      w21, w0
  0x26c8a6c: mov      x0, x19
  0x26c8a70: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c8a74: ldr      w3, [x19, #0x30c]
  0x26c8a78: mov      w2, w0
  0x26c8a7c: mov      x0, x20
  0x26c8a80: mov      w1, w21
  0x26c8a84: ldp      x20, x19, [sp, #0x20]
  0x26c8a88: ldp      x22, x21, [sp, #0x10]
  0x26c8a8c: mov      x4, xzr
  0x26c8a90: ldr      x30, [sp], #0x30
  0x26c8a94: b        #0x28a515c
  0x26c8a98: ldr      x20, [x19, #0x2d0]
  0x26c8a9c: cbz      x20, #0x26c8b1c
  0x26c8aa0: adrp     x8, #0x5511000
  0x26c8aa4: ldr      x8, [x8, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x26c8aa8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c8aac: add      x8, x19, #0x31c
  0x26c8ab0: ldr      x21, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26c8ab4: ldr      w22, [x8, #8]
  0x26c8ab8: ldr      w9, [x0, #0xe0]
  0x26c8abc: cbnz     w9, #0x26c8ac4
  0x26c8ac0: bl       #0x218489c ; -> ??? 0x218489c
  0x26c8ac4: mov      x0, x21
  0x26c8ac8: mov      x1, x22
  0x26c8acc: mov      x2, xzr
  0x26c8ad0: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x26c8ad4: ldr      x8, [x19, #0x28]
  0x26c8ad8: cbz      x8, #0x26c8b2c
  0x26c8adc: mov      w21, w0
  0x26c8ae0: mov      x0, x8
  0x26c8ae4: mov      x1, xzr
  0x26c8ae8: bl       #0x27dfb20 ; -> CCharacterData$$get_MaxHP
  0x26c8aec: mov      w22, w0
  0x26c8af0: mov      x0, x19
  0x26c8af4: bl       #0x26c5e88 ; -> CCharacterBattle$$get_m_nShieldHP
  0x26c8af8: mov      w3, w0
  0x26c8afc: mov      x0, x20
  0x26c8b00: mov      w1, w21
  0x26c8b04: mov      w2, w22
  0x26c8b08: ldp      x20, x19, [sp, #0x20]
  0x26c8b0c: ldp      x22, x21, [sp, #0x10]
  0x26c8b10: mov      x4, xzr
  0x26c8b14: ldr      x30, [sp], #0x30
  0x26c8b18: b        #0x289e9c4
  0x26c8b1c: ldp      x20, x19, [sp, #0x20]
  0x26c8b20: ldp      x22, x21, [sp, #0x10]
  0x26c8b24: ldr      x30, [sp], #0x30
  0x26c8b28: ret      
  0x26c8b2c: bl       #0x21849c0 ; -> ??? 0x21849c0
