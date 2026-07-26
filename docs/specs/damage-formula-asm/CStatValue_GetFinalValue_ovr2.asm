; ===== CStatValue_GetFinalValue_ovr2 @ 0x28d3e84..0x28d3e9c (taille 24 octets) =====
  0x28d3e84: ldr      w8, [x0, #0x10]
  0x28d3e88: cmp      w8, #3
  0x28d3e8c: b.ne     #0x28d3e98
  0x28d3e90: mov      w0, wzr
  0x28d3e94: ret      
  0x28d3e98: b        #0x28d33b4
