; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetEvolutionStat @ 0x290fcd4..0x29100b8 (taille 996 octets) =====
  0x290fcd4: stp      x30, x27, [sp, #-0x50]!
  0x290fcd8: stp      x26, x25, [sp, #0x10]
  0x290fcdc: stp      x24, x23, [sp, #0x20]
  0x290fce0: stp      x22, x21, [sp, #0x30]
  0x290fce4: stp      x20, x19, [sp, #0x40]
  0x290fce8: adrp     x24, #0x59e7000
  0x290fcec: adrp     x25, #0x559a000
  0x290fcf0: adrp     x19, #0x559a000
  0x290fcf4: adrp     x20, #0x5598000
  0x290fcf8: ldrb     w8, [x24, #0xebb]
  0x290fcfc: ldr      x25, [x25, #0x948] ; = 0x0 (u64 @ 0x559a948)
  0x290fd00: ldr      x19, [x19, #0x8b0] ; = 0x0 (u64 @ 0x559a8b0)
  0x290fd04: ldr      x20, [x20, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290fd08: mov      w21, w2
  0x290fd0c: mov      w22, w1
  0x290fd10: mov      x23, x0
  0x290fd14: tbnz     w8, #0, #0x290fd74
  0x290fd18: adrp     x0, #0x5598000
  0x290fd1c: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290fd20: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd24: adrp     x0, #0x559a000
  0x290fd28: ldr      x0, [x0, #0x8b0] ; = 0x0 (u64 @ 0x559a8b0)
  0x290fd2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd30: adrp     x0, #0x559a000
  0x290fd34: ldr      x0, [x0, #0x948] ; = 0x0 (u64 @ 0x559a948)
  0x290fd38: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd3c: adrp     x0, #0x5596000
  0x290fd40: ldr      x0, [x0, #0x700] ; = 0x0 (u64 @ 0x5596700)
  0x290fd44: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd48: adrp     x0, #0x55bc000
  0x290fd4c: ldr      x0, [x0, #0xe80] ; = 0x0 (u64 @ 0x55bce80)
  0x290fd50: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd54: adrp     x0, #0x55bc000
  0x290fd58: ldr      x0, [x0, #0xe88] ; = 0x0 (u64 @ 0x55bce88)
  0x290fd5c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd60: adrp     x0, #0x5596000
  0x290fd64: ldr      x0, [x0, #0x7f8] ; = 0x0 (u64 @ 0x55967f8)
  0x290fd68: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290fd6c: mov      w8, #1
  0x290fd70: strb     w8, [x24, #0xebb]
  0x290fd74: ldr      x0, [x25] ; = 0x0 (u64 @ 0x559a000)
  0x290fd78: bl       #0x21b4d10 ; -> ??? 0x21b4d10
  0x290fd7c: ldr      x1, [x19] ; = 0x0 (u64 @ 0x559a000)
  0x290fd80: mov      x19, x0
  0x290fd84: bl       #0x401f1d0 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$.ctor
  0x290fd88: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x290fd8c: ldr      w8, [x0, #0xe0]
  0x290fd90: cbnz     w8, #0x290fd98
  0x290fd94: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x290fd98: mov      x0, xzr
  0x290fd9c: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x290fda0: ldr      x8, [x23, #0xf0]
  0x290fda4: cbz      x8, #0x290ffec
  0x290fda8: cbz      x0, #0x290ffec
  0x290fdac: ldr      w1, [x8, #0x10]
  0x290fdb0: mov      x2, xzr
  0x290fdb4: bl       #0x2630d44 ; -> CTempletManager$$GetCharacterEvolutionStatTempletList
  0x290fdb8: cbz      x0, #0x290ffec
  0x290fdbc: adrp     x10, #0x55bc000
  0x290fdc0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x290fdc4: ldr      x10, [x10, #0xe80] ; = 0x0 (u64 @ 0x55bce80)
  0x290fdc8: mov      x20, x0
  0x290fdcc: ldrh     w9, [x8, #0x12e]
  0x290fdd0: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55bc000)
  0x290fdd4: cbz      x9, #0x290fdf8
  0x290fdd8: ldr      x10, [x8, #0xb0]
  0x290fddc: add      x10, x10, #8
  0x290fde0: ldur     x11, [x10, #-8]
  0x290fde4: cmp      x11, x1
  0x290fde8: b.eq     #0x290fe08
  0x290fdec: subs     x9, x9, #1
  0x290fdf0: add      x10, x10, #0x10
  0x290fdf4: b.ne     #0x290fde0
  0x290fdf8: mov      x0, x20
  0x290fdfc: mov      w2, wzr
  0x290fe00: bl       #0x2215130 ; -> ??? 0x2215130
  0x290fe04: b        #0x290fe14
  0x290fe08: ldrsw    x9, [x10]
  0x290fe0c: add      x8, x8, x9, lsl #4
  0x290fe10: add      x0, x8, #0x138
  0x290fe14: ldp      x8, x1, [x0]
  0x290fe18: adrp     x25, #0x5596000
  0x290fe1c: ldr      x25, [x25, #0x700] ; = 0x0 (u64 @ 0x5596700)
  0x290fe20: mov      x0, x20
  0x290fe24: blr      x8
  0x290fe28: mov      x20, x0
  0x290fe2c: cbz      x0, #0x290fff0
  0x290fe30: adrp     x26, #0x5596000
  0x290fe34: adrp     x27, #0x55bc000
  0x290fe38: ldr      x26, [x26, #0x7f8] ; = 0x0 (u64 @ 0x55967f8)
  0x290fe3c: ldr      x27, [x27, #0xe88] ; = 0x0 (u64 @ 0x55bce88)
  0x290fe40: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x290fe44: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5596000)
  0x290fe48: ldrh     w9, [x8, #0x12e]
  0x290fe4c: cbz      x9, #0x290fe70
  0x290fe50: ldr      x10, [x8, #0xb0]
  0x290fe54: add      x10, x10, #8
  0x290fe58: ldur     x11, [x10, #-8]
  0x290fe5c: cmp      x11, x1
  0x290fe60: b.eq     #0x290fe80
  0x290fe64: subs     x9, x9, #1
  0x290fe68: add      x10, x10, #0x10
  0x290fe6c: b.ne     #0x290fe58
  0x290fe70: mov      x0, x20
  0x290fe74: mov      w2, wzr
  0x290fe78: bl       #0x2215130 ; -> ??? 0x2215130
  0x290fe7c: b        #0x290fe8c
  0x290fe80: ldrsw    x9, [x10]
  0x290fe84: add      x8, x8, x9, lsl #4
  0x290fe88: add      x0, x8, #0x138
  0x290fe8c: ldp      x8, x1, [x0]
  0x290fe90: mov      x0, x20
  0x290fe94: blr      x8
  0x290fe98: tbz      w0, #0, #0x290ff64
  0x290fe9c: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x290fea0: ldr      x1, [x27] ; = 0x0 (u64 @ 0x55bc000)
  0x290fea4: ldrh     w9, [x8, #0x12e]
  0x290fea8: cbz      x9, #0x290fecc
  0x290feac: ldr      x10, [x8, #0xb0]
  0x290feb0: add      x10, x10, #8
  0x290feb4: ldur     x11, [x10, #-8]
  0x290feb8: cmp      x11, x1
  0x290febc: b.eq     #0x290fedc
  0x290fec0: subs     x9, x9, #1
  0x290fec4: add      x10, x10, #0x10
  0x290fec8: b.ne     #0x290feb4
  0x290fecc: mov      x0, x20
  0x290fed0: mov      w2, wzr
  0x290fed4: bl       #0x2215130 ; -> ??? 0x2215130
  0x290fed8: b        #0x290fee8
  0x290fedc: ldrsw    x9, [x10]
  0x290fee0: add      x8, x8, x9, lsl #4
  0x290fee4: add      x0, x8, #0x138
  0x290fee8: ldp      x8, x1, [x0]
  0x290feec: mov      x0, x20
  0x290fef0: blr      x8
  0x290fef4: mov      x24, x0
  0x290fef8: tbz      w22, #0, #0x290ff14
  0x290fefc: cbz      x24, #0x290ffe8
  0x290ff00: ldrb     w8, [x24, #0x18]
  0x290ff04: ldrb     w9, [x23, #0x78]
  0x290ff08: cmp      w8, w9
  0x290ff0c: b.hi     #0x290fe40
  0x290ff10: b        #0x290ff24
  0x290ff14: cbz      x24, #0x290ffe4
  0x290ff18: ldrb     w8, [x24, #0x18]
  0x290ff1c: cmp      w8, w21
  0x290ff20: b.ne     #0x290fe40
  0x290ff24: ldr      w2, [x24, #0x1c]
  0x290ff28: cbz      w2, #0x290ff38
  0x290ff2c: ldr      w3, [x24, #0x20]
  0x290ff30: mov      x1, x19
  0x290ff34: bl       #0x2911398 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x290ff38: ldr      w2, [x24, #0x24]
  0x290ff3c: cbz      w2, #0x290ff4c
  0x290ff40: ldr      w3, [x24, #0x28]
  0x290ff44: mov      x1, x19
  0x290ff48: bl       #0x2911398 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x290ff4c: ldr      w2, [x24, #0x2c]
  0x290ff50: cbz      w2, #0x290fe40
  0x290ff54: ldr      w3, [x24, #0x30]
  0x290ff58: mov      x1, x19
  0x290ff5c: bl       #0x2911398 ; -> CCharacterData$$AddEvolutionStatToDictionary
  0x290ff60: b        #0x290fe40
  0x290ff64: mov      x21, xzr
  0x290ff68: cbz      x20, #0x290ffc4
  0x290ff6c: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x290ff70: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x290ff74: ldrh     w9, [x8, #0x12e]
  0x290ff78: cbz      x9, #0x290ff9c
  0x290ff7c: ldr      x10, [x8, #0xb0]
  0x290ff80: add      x10, x10, #8
  0x290ff84: ldur     x11, [x10, #-8]
  0x290ff88: cmp      x11, x1
  0x290ff8c: b.eq     #0x290ffac
  0x290ff90: subs     x9, x9, #1
  0x290ff94: add      x10, x10, #0x10
  0x290ff98: b.ne     #0x290ff84
  0x290ff9c: mov      x0, x20
  0x290ffa0: mov      w2, wzr
  0x290ffa4: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ffa8: b        #0x290ffb8
  0x290ffac: ldrsw    x9, [x10]
  0x290ffb0: add      x8, x8, x9, lsl #4
  0x290ffb4: add      x0, x8, #0x138
  0x290ffb8: ldp      x8, x1, [x0]
  0x290ffbc: mov      x0, x20
  0x290ffc0: blr      x8
  0x290ffc4: cbnz     x21, #0x290fff4
  0x290ffc8: mov      x0, x19
  0x290ffcc: ldp      x20, x19, [sp, #0x40]
  0x290ffd0: ldp      x22, x21, [sp, #0x30]
  0x290ffd4: ldp      x24, x23, [sp, #0x20]
  0x290ffd8: ldp      x26, x25, [sp, #0x10]
  0x290ffdc: ldp      x30, x27, [sp], #0x50
  0x290ffe0: ret      
  0x290ffe4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ffe8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290ffec: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290fff0: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x290fff4: mov      x0, x21
  0x290fff8: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x290fffc: b        #0x2910018
  0x2910000: b        #0x2910018
  0x2910004: b        #0x2910018
  0x2910008: b        #0x2910018
  0x291000c: b        #0x2910018
  0x2910010: b        #0x2910018
  0x2910014: b        #0x2910018
  0x2910018: mov      x22, x0
  0x291001c: cmp      w1, #1
  0x2910020: b.ne     #0x2910038
  0x2910024: mov      x0, x22
  0x2910028: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x291002c: ldr      x21, [x0] ; = 0x0 (u64 @ 0x5596000)
  0x2910030: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x2910034: b        #0x290ff68
  0x2910038: mov      x21, xzr
  0x291003c: b        #0x2910044
  0x2910040: mov      x22, x0
  0x2910044: cbz      x20, #0x29100a0
  0x2910048: ldr      x8, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x291004c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5596000)
  0x2910050: ldrh     w9, [x8, #0x12e]
  0x2910054: cbz      x9, #0x2910078
  0x2910058: ldr      x10, [x8, #0xb0]
  0x291005c: add      x10, x10, #8
  0x2910060: ldur     x11, [x10, #-8]
  0x2910064: cmp      x11, x1
  0x2910068: b.eq     #0x2910088
  0x291006c: subs     x9, x9, #1
  0x2910070: add      x10, x10, #0x10
  0x2910074: b.ne     #0x2910060
  0x2910078: mov      x0, x20
  0x291007c: mov      w2, wzr
  0x2910080: bl       #0x2215130 ; -> ??? 0x2215130
  0x2910084: b        #0x2910094
  0x2910088: ldrsw    x9, [x10]
  0x291008c: add      x8, x8, x9, lsl #4
  0x2910090: add      x0, x8, #0x138
  0x2910094: ldp      x8, x1, [x0]
  0x2910098: mov      x0, x20
  0x291009c: blr      x8
  0x29100a0: cbnz     x21, #0x29100ac
  0x29100a4: mov      x0, x22
  0x29100a8: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x29100ac: mov      x0, x21
  0x29100b0: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x29100b4: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
