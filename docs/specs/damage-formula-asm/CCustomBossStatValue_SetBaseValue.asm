; ===== CCustomBossStatValue_SetBaseValue @ 0x28d3dc4..0x28d3e84 (taille 192 octets) =====
  0x28d3dc4: stp      x30, x23, [sp, #-0x30]!
  0x28d3dc8: stp      x22, x21, [sp, #0x10]
  0x28d3dcc: stp      x20, x19, [sp, #0x20]
  0x28d3dd0: adrp     x23, #0x5958000
  0x28d3dd4: ldrb     w8, [x23, #0xbcc]
  0x28d3dd8: mov      w22, w3
  0x28d3ddc: mov      w20, w2
  0x28d3de0: mov      w21, w1
  0x28d3de4: mov      x19, x0
  0x28d3de8: tbnz     w8, #0, #0x28d3e00
  0x28d3dec: adrp     x0, #0x5511000
  0x28d3df0: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d3df4: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d3df8: mov      w8, #1
  0x28d3dfc: strb     w8, [x23, #0xbcc]
  0x28d3e00: ldr      w8, [x19, #0x10]
  0x28d3e04: adrp     x23, #0x5511000
  0x28d3e08: ldr      x23, [x23, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d3e0c: cmp      w8, #1
  0x28d3e10: b.ne     #0x28d3e2c
  0x28d3e14: ldr      x0, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d3e18: ldr      w8, [x0, #0xe0]
  0x28d3e1c: cbnz     w8, #0x28d3e24
  0x28d3e20: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3e24: sub      w20, w20, w21
  0x28d3e28: b        #0x28d3e58
  0x28d3e2c: mov      w0, w21
  0x28d3e30: mov      w1, w20
  0x28d3e34: mov      w2, w22
  0x28d3e38: mov      x3, xzr
  0x28d3e3c: bl       #0x2c59db0 ; -> CFormula$$CalcStat
  0x28d3e40: ldr      x8, [x23] ; = 0x0 (u64 @ 0x5511000)
  0x28d3e44: mov      w20, w0
  0x28d3e48: ldr      w9, [x8, #0xe0]
  0x28d3e4c: cbnz     w9, #0x28d3e58
  0x28d3e50: mov      x0, x8
  0x28d3e54: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3e58: mov      w0, w20
  0x28d3e5c: mov      x1, xzr
  0x28d3e60: bl       #0x2c59b20 ; -> SVAInt$$op_Implicit
  0x28d3e64: mov      w8, #1
  0x28d3e68: stur     x0, [x19, #0x14]
  0x28d3e6c: str      w1, [x19, #0x1c]
  0x28d3e70: strb     w8, [x19, #0xe0]
  0x28d3e74: ldp      x20, x19, [sp, #0x20]
  0x28d3e78: ldp      x22, x21, [sp, #0x10]
  0x28d3e7c: ldp      x30, x23, [sp], #0x30
  0x28d3e80: ret      
