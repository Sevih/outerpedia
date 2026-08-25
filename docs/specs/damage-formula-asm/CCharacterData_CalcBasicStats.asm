; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcBasicStats @ 0x290d8d4..0x290e978 (taille 4260 octets) =====
  0x290d8d4: stp      x29, x30, [sp, #-0x60]!
  0x290d8d8: stp      x28, x27, [sp, #0x10]
  0x290d8dc: stp      x26, x25, [sp, #0x20]
  0x290d8e0: stp      x24, x23, [sp, #0x30]
  0x290d8e4: stp      x22, x21, [sp, #0x40]
  0x290d8e8: stp      x20, x19, [sp, #0x50]
  0x290d8ec: adrp     x20, #0x59e7000
  0x290d8f0: ldrb     w8, [x20, #0xea2]
  0x290d8f4: mov      x19, x0
  0x290d8f8: tbnz     w8, #0, #0x290d91c
  0x290d8fc: adrp     x0, #0x55c5000
  0x290d900: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290d904: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d908: adrp     x0, #0x55c5000
  0x290d90c: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290d910: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290d914: mov      w8, #1
  0x290d918: strb     w8, [x20, #0xea2]
  0x290d91c: ldr      x8, [x19]
  0x290d920: mov      x0, x19
  0x290d924: ldp      x9, x1, [x8, #0x188]
  0x290d928: blr      x9
  0x290d92c: ldr      x0, [x19, #0x40]
  0x290d930: cbz      x0, #0x290e974
  0x290d934: adrp     x28, #0x55c5000
  0x290d938: ldr      x28, [x28, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290d93c: mov      w1, #2
  0x290d940: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290d944: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290d948: mov      x29, x19
  0x290d94c: ldr      x9, [x29, #0xf0]!
  0x290d950: cbz      x9, #0x290e974
  0x290d954: mov      x20, x0
  0x290d958: cbz      x0, #0x290e974
  0x290d95c: adrp     x26, #0x55c5000
  0x290d960: ldr      x26, [x26, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290d964: ldr      x8, [x20]
  0x290d968: add      x27, x19, #0x79
  0x290d96c: ldrb     w21, [x27]
  0x290d970: ldrb     w22, [x9, #0x6d]
  0x290d974: ldrb     w23, [x9, #0x6c]
  0x290d978: ldrh     w9, [x8, #0x12e]
  0x290d97c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290d980: cbz      x9, #0x290d9a4
  0x290d984: ldr      x10, [x8, #0xb0]
  0x290d988: add      x10, x10, #8
  0x290d98c: ldur     x11, [x10, #-8]
  0x290d990: cmp      x11, x1
  0x290d994: b.eq     #0x290d9b4
  0x290d998: subs     x9, x9, #1
  0x290d99c: add      x10, x10, #0x10
  0x290d9a0: b.ne     #0x290d98c
  0x290d9a4: mov      w2, #6
  0x290d9a8: mov      x0, x20
  0x290d9ac: bl       #0x2215130 ; -> ??? 0x2215130
  0x290d9b0: b        #0x290d9c4
  0x290d9b4: ldr      w9, [x10]
  0x290d9b8: add      w9, w9, #6
  0x290d9bc: add      x8, x8, w9, sxtw #4
  0x290d9c0: add      x0, x8, #0x138
  0x290d9c4: ldp      x8, x7, [x0]
  0x290d9c8: mov      x0, x20
  0x290d9cc: mov      w1, w23
  0x290d9d0: mov      w2, w22
  0x290d9d4: mov      w3, w21
  0x290d9d8: mov      w4, wzr
  0x290d9dc: mov      w5, wzr
  0x290d9e0: mov      x6, x19
  0x290d9e4: blr      x8
  0x290d9e8: ldr      x0, [x19, #0x40]
  0x290d9ec: cbz      x0, #0x290e974
  0x290d9f0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290d9f4: mov      w1, #4
  0x290d9f8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290d9fc: ldr      x9, [x29]
  0x290da00: cbz      x9, #0x290e974
  0x290da04: mov      x20, x0
  0x290da08: cbz      x0, #0x290e974
  0x290da0c: ldr      x8, [x20]
  0x290da10: ldr      w21, [x19, #0xb0]
  0x290da14: ldr      w22, [x19, #0xc0]
  0x290da18: ldrb     w23, [x27]
  0x290da1c: ldrh     w24, [x9, #0x74]
  0x290da20: ldrh     w25, [x9, #0x72]
  0x290da24: ldrh     w9, [x8, #0x12e]
  0x290da28: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290da2c: cbz      x9, #0x290da50
  0x290da30: ldr      x10, [x8, #0xb0]
  0x290da34: add      x10, x10, #8
  0x290da38: ldur     x11, [x10, #-8]
  0x290da3c: cmp      x11, x1
  0x290da40: b.eq     #0x290da60
  0x290da44: subs     x9, x9, #1
  0x290da48: add      x10, x10, #0x10
  0x290da4c: b.ne     #0x290da38
  0x290da50: mov      w2, #6
  0x290da54: mov      x0, x20
  0x290da58: bl       #0x2215130 ; -> ??? 0x2215130
  0x290da5c: b        #0x290da70
  0x290da60: ldr      w9, [x10]
  0x290da64: add      w9, w9, #6
  0x290da68: add      x8, x8, w9, sxtw #4
  0x290da6c: add      x0, x8, #0x138
  0x290da70: ldp      x8, x7, [x0]
  0x290da74: mov      x0, x20
  0x290da78: mov      w1, w25
  0x290da7c: mov      w2, w24
  0x290da80: mov      w3, w23
  0x290da84: mov      w4, w21
  0x290da88: mov      w5, w22
  0x290da8c: mov      x6, x19
  0x290da90: blr      x8
  0x290da94: ldr      x0, [x19, #0x40]
  0x290da98: cbz      x0, #0x290e974
  0x290da9c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290daa0: mov      w1, #5
  0x290daa4: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290daa8: ldr      x9, [x29]
  0x290daac: cbz      x9, #0x290e974
  0x290dab0: mov      x20, x0
  0x290dab4: cbz      x0, #0x290e974
  0x290dab8: ldr      x8, [x20]
  0x290dabc: ldr      w21, [x19, #0xb4]
  0x290dac0: ldr      w22, [x19, #0xc4]
  0x290dac4: ldrb     w23, [x27]
  0x290dac8: ldrh     w24, [x9, #0x78]
  0x290dacc: ldrh     w25, [x9, #0x76]
  0x290dad0: ldrh     w9, [x8, #0x12e]
  0x290dad4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290dad8: cbz      x9, #0x290dafc
  0x290dadc: ldr      x10, [x8, #0xb0]
  0x290dae0: add      x10, x10, #8
  0x290dae4: ldur     x11, [x10, #-8]
  0x290dae8: cmp      x11, x1
  0x290daec: b.eq     #0x290db0c
  0x290daf0: subs     x9, x9, #1
  0x290daf4: add      x10, x10, #0x10
  0x290daf8: b.ne     #0x290dae4
  0x290dafc: mov      w2, #6
  0x290db00: mov      x0, x20
  0x290db04: bl       #0x2215130 ; -> ??? 0x2215130
  0x290db08: b        #0x290db1c
  0x290db0c: ldr      w9, [x10]
  0x290db10: add      w9, w9, #6
  0x290db14: add      x8, x8, w9, sxtw #4
  0x290db18: add      x0, x8, #0x138
  0x290db1c: ldp      x8, x7, [x0]
  0x290db20: mov      x0, x20
  0x290db24: mov      w1, w25
  0x290db28: mov      w2, w24
  0x290db2c: mov      w3, w23
  0x290db30: mov      w4, w21
  0x290db34: mov      w5, w22
  0x290db38: mov      x6, x19
  0x290db3c: blr      x8
  0x290db40: ldr      x0, [x19, #0x40]
  0x290db44: cbz      x0, #0x290e974
  0x290db48: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290db4c: mov      w1, #3
  0x290db50: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290db54: ldr      x9, [x29]
  0x290db58: cbz      x9, #0x290e974
  0x290db5c: mov      x20, x0
  0x290db60: cbz      x0, #0x290e974
  0x290db64: ldr      x8, [x20]
  0x290db68: ldr      w21, [x19, #0xbc]
  0x290db6c: ldrb     w22, [x27]
  0x290db70: ldrh     w23, [x9, #0x70]
  0x290db74: ldrh     w24, [x9, #0x6e]
  0x290db78: ldrh     w9, [x8, #0x12e]
  0x290db7c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290db80: cbz      x9, #0x290dba4
  0x290db84: ldr      x10, [x8, #0xb0]
  0x290db88: add      x10, x10, #8
  0x290db8c: ldur     x11, [x10, #-8]
  0x290db90: cmp      x11, x1
  0x290db94: b.eq     #0x290dbb4
  0x290db98: subs     x9, x9, #1
  0x290db9c: add      x10, x10, #0x10
  0x290dba0: b.ne     #0x290db8c
  0x290dba4: mov      w2, #6
  0x290dba8: mov      x0, x20
  0x290dbac: bl       #0x2215130 ; -> ??? 0x2215130
  0x290dbb0: b        #0x290dbc4
  0x290dbb4: ldr      w9, [x10]
  0x290dbb8: add      w9, w9, #6
  0x290dbbc: add      x8, x8, w9, sxtw #4
  0x290dbc0: add      x0, x8, #0x138
  0x290dbc4: ldp      x8, x7, [x0]
  0x290dbc8: mov      x0, x20
  0x290dbcc: mov      w1, w24
  0x290dbd0: mov      w2, w23
  0x290dbd4: mov      w3, w22
  0x290dbd8: mov      w4, w21
  0x290dbdc: mov      w5, wzr
  0x290dbe0: mov      x6, x19
  0x290dbe4: blr      x8
  0x290dbe8: ldr      x0, [x19, #0x40]
  0x290dbec: cbz      x0, #0x290e974
  0x290dbf0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290dbf4: mov      w1, #6
  0x290dbf8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290dbfc: ldr      x9, [x29]
  0x290dc00: cbz      x9, #0x290e974
  0x290dc04: mov      x20, x0
  0x290dc08: cbz      x0, #0x290e974
  0x290dc0c: ldr      x8, [x20]
  0x290dc10: ldrb     w21, [x27]
  0x290dc14: ldrh     w22, [x9, #0x7c]
  0x290dc18: ldrh     w23, [x9, #0x7a]
  0x290dc1c: ldrh     w9, [x8, #0x12e]
  0x290dc20: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290dc24: cbz      x9, #0x290dc48
  0x290dc28: ldr      x10, [x8, #0xb0]
  0x290dc2c: add      x10, x10, #8
  0x290dc30: ldur     x11, [x10, #-8]
  0x290dc34: cmp      x11, x1
  0x290dc38: b.eq     #0x290dc58
  0x290dc3c: subs     x9, x9, #1
  0x290dc40: add      x10, x10, #0x10
  0x290dc44: b.ne     #0x290dc30
  0x290dc48: mov      w2, #6
  0x290dc4c: mov      x0, x20
  0x290dc50: bl       #0x2215130 ; -> ??? 0x2215130
  0x290dc54: b        #0x290dc68
  0x290dc58: ldr      w9, [x10]
  0x290dc5c: add      w9, w9, #6
  0x290dc60: add      x8, x8, w9, sxtw #4
  0x290dc64: add      x0, x8, #0x138
  0x290dc68: ldp      x8, x7, [x0]
  0x290dc6c: mov      x0, x20
  0x290dc70: mov      w1, w23
  0x290dc74: mov      w2, w22
  0x290dc78: mov      w3, w21
  0x290dc7c: mov      w4, wzr
  0x290dc80: mov      w5, wzr
  0x290dc84: mov      x6, x19
  0x290dc88: blr      x8
  0x290dc8c: ldr      x0, [x19, #0x40]
  0x290dc90: cbz      x0, #0x290e974
  0x290dc94: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290dc98: mov      w1, #7
  0x290dc9c: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290dca0: ldr      x9, [x29]
  0x290dca4: cbz      x9, #0x290e974
  0x290dca8: mov      x20, x0
  0x290dcac: cbz      x0, #0x290e974
  0x290dcb0: ldr      x8, [x20]
  0x290dcb4: ldrb     w21, [x27]
  0x290dcb8: ldrh     w22, [x9, #0x80]
  0x290dcbc: ldrh     w23, [x9, #0x7e]
  0x290dcc0: ldrh     w9, [x8, #0x12e]
  0x290dcc4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290dcc8: cbz      x9, #0x290dcec
  0x290dccc: ldr      x10, [x8, #0xb0]
  0x290dcd0: add      x10, x10, #8
  0x290dcd4: ldur     x11, [x10, #-8]
  0x290dcd8: cmp      x11, x1
  0x290dcdc: b.eq     #0x290dcfc
  0x290dce0: subs     x9, x9, #1
  0x290dce4: add      x10, x10, #0x10
  0x290dce8: b.ne     #0x290dcd4
  0x290dcec: mov      w2, #6
  0x290dcf0: mov      x0, x20
  0x290dcf4: bl       #0x2215130 ; -> ??? 0x2215130
  0x290dcf8: b        #0x290dd0c
  0x290dcfc: ldr      w9, [x10]
  0x290dd00: add      w9, w9, #6
  0x290dd04: add      x8, x8, w9, sxtw #4
  0x290dd08: add      x0, x8, #0x138
  0x290dd0c: ldp      x8, x7, [x0]
  0x290dd10: mov      x0, x20
  0x290dd14: mov      w1, w23
  0x290dd18: mov      w2, w22
  0x290dd1c: mov      w3, w21
  0x290dd20: mov      w4, wzr
  0x290dd24: mov      w5, wzr
  0x290dd28: mov      x6, x19
  0x290dd2c: blr      x8
  0x290dd30: ldr      x0, [x19, #0x40]
  0x290dd34: cbz      x0, #0x290e974
  0x290dd38: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290dd3c: mov      w1, #8
  0x290dd40: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290dd44: ldr      x9, [x29]
  0x290dd48: cbz      x9, #0x290e974
  0x290dd4c: mov      x20, x0
  0x290dd50: cbz      x0, #0x290e974
  0x290dd54: ldr      x8, [x20]
  0x290dd58: ldrb     w21, [x27]
  0x290dd5c: ldrh     w22, [x9, #0x84]
  0x290dd60: ldrh     w23, [x9, #0x82]
  0x290dd64: ldrh     w9, [x8, #0x12e]
  0x290dd68: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290dd6c: cbz      x9, #0x290dd90
  0x290dd70: ldr      x10, [x8, #0xb0]
  0x290dd74: add      x10, x10, #8
  0x290dd78: ldur     x11, [x10, #-8]
  0x290dd7c: cmp      x11, x1
  0x290dd80: b.eq     #0x290dda0
  0x290dd84: subs     x9, x9, #1
  0x290dd88: add      x10, x10, #0x10
  0x290dd8c: b.ne     #0x290dd78
  0x290dd90: mov      w2, #6
  0x290dd94: mov      x0, x20
  0x290dd98: bl       #0x2215130 ; -> ??? 0x2215130
  0x290dd9c: b        #0x290ddb0
  0x290dda0: ldr      w9, [x10]
  0x290dda4: add      w9, w9, #6
  0x290dda8: add      x8, x8, w9, sxtw #4
  0x290ddac: add      x0, x8, #0x138
  0x290ddb0: ldp      x8, x7, [x0]
  0x290ddb4: mov      x0, x20
  0x290ddb8: mov      w1, w23
  0x290ddbc: mov      w2, w22
  0x290ddc0: mov      w3, w21
  0x290ddc4: mov      w4, wzr
  0x290ddc8: mov      w5, wzr
  0x290ddcc: mov      x6, x19
  0x290ddd0: blr      x8
  0x290ddd4: ldr      x0, [x19, #0x40]
  0x290ddd8: cbz      x0, #0x290e974
  0x290dddc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290dde0: mov      w1, #9
  0x290dde4: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290dde8: ldr      x9, [x29]
  0x290ddec: cbz      x9, #0x290e974
  0x290ddf0: mov      x20, x0
  0x290ddf4: cbz      x0, #0x290e974
  0x290ddf8: ldr      x8, [x20]
  0x290ddfc: ldrb     w21, [x27]
  0x290de00: ldrh     w22, [x9, #0x88]
  0x290de04: ldrh     w23, [x9, #0x86]
  0x290de08: ldrh     w9, [x8, #0x12e]
  0x290de0c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290de10: cbz      x9, #0x290de34
  0x290de14: ldr      x10, [x8, #0xb0]
  0x290de18: add      x10, x10, #8
  0x290de1c: ldur     x11, [x10, #-8]
  0x290de20: cmp      x11, x1
  0x290de24: b.eq     #0x290de44
  0x290de28: subs     x9, x9, #1
  0x290de2c: add      x10, x10, #0x10
  0x290de30: b.ne     #0x290de1c
  0x290de34: mov      w2, #6
  0x290de38: mov      x0, x20
  0x290de3c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290de40: b        #0x290de54
  0x290de44: ldr      w9, [x10]
  0x290de48: add      w9, w9, #6
  0x290de4c: add      x8, x8, w9, sxtw #4
  0x290de50: add      x0, x8, #0x138
  0x290de54: ldp      x8, x7, [x0]
  0x290de58: mov      x0, x20
  0x290de5c: mov      w1, w23
  0x290de60: mov      w2, w22
  0x290de64: mov      w3, w21
  0x290de68: mov      w4, wzr
  0x290de6c: mov      w5, wzr
  0x290de70: mov      x6, x19
  0x290de74: blr      x8
  0x290de78: ldr      x0, [x19, #0x40]
  0x290de7c: cbz      x0, #0x290e974
  0x290de80: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290de84: mov      w1, #0xa
  0x290de88: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290de8c: ldr      x9, [x29]
  0x290de90: cbz      x9, #0x290e974
  0x290de94: mov      x20, x0
  0x290de98: cbz      x0, #0x290e974
  0x290de9c: ldr      x8, [x20]
  0x290dea0: ldrb     w21, [x27]
  0x290dea4: ldrh     w22, [x9, #0x8c]
  0x290dea8: ldrh     w23, [x9, #0x8a]
  0x290deac: ldrh     w9, [x8, #0x12e]
  0x290deb0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290deb4: cbz      x9, #0x290ded8
  0x290deb8: ldr      x10, [x8, #0xb0]
  0x290debc: add      x10, x10, #8
  0x290dec0: ldur     x11, [x10, #-8]
  0x290dec4: cmp      x11, x1
  0x290dec8: b.eq     #0x290dee8
  0x290decc: subs     x9, x9, #1
  0x290ded0: add      x10, x10, #0x10
  0x290ded4: b.ne     #0x290dec0
  0x290ded8: mov      w2, #6
  0x290dedc: mov      x0, x20
  0x290dee0: bl       #0x2215130 ; -> ??? 0x2215130
  0x290dee4: b        #0x290def8
  0x290dee8: ldr      w9, [x10]
  0x290deec: add      w9, w9, #6
  0x290def0: add      x8, x8, w9, sxtw #4
  0x290def4: add      x0, x8, #0x138
  0x290def8: ldp      x8, x7, [x0]
  0x290defc: mov      x0, x20
  0x290df00: mov      w1, w23
  0x290df04: mov      w2, w22
  0x290df08: mov      w3, w21
  0x290df0c: mov      w4, wzr
  0x290df10: mov      w5, wzr
  0x290df14: mov      x6, x19
  0x290df18: blr      x8
  0x290df1c: ldr      x0, [x19, #0x40]
  0x290df20: cbz      x0, #0x290e974
  0x290df24: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290df28: mov      w1, #0xb
  0x290df2c: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290df30: ldr      x9, [x29]
  0x290df34: cbz      x9, #0x290e974
  0x290df38: mov      x20, x0
  0x290df3c: cbz      x0, #0x290e974
  0x290df40: ldr      x8, [x20]
  0x290df44: ldrb     w21, [x27]
  0x290df48: ldrh     w22, [x9, #0x90]
  0x290df4c: ldrh     w23, [x9, #0x8e]
  0x290df50: ldrh     w9, [x8, #0x12e]
  0x290df54: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290df58: cbz      x9, #0x290df7c
  0x290df5c: ldr      x10, [x8, #0xb0]
  0x290df60: add      x10, x10, #8
  0x290df64: ldur     x11, [x10, #-8]
  0x290df68: cmp      x11, x1
  0x290df6c: b.eq     #0x290df8c
  0x290df70: subs     x9, x9, #1
  0x290df74: add      x10, x10, #0x10
  0x290df78: b.ne     #0x290df64
  0x290df7c: mov      w2, #6
  0x290df80: mov      x0, x20
  0x290df84: bl       #0x2215130 ; -> ??? 0x2215130
  0x290df88: b        #0x290df9c
  0x290df8c: ldr      w9, [x10]
  0x290df90: add      w9, w9, #6
  0x290df94: add      x8, x8, w9, sxtw #4
  0x290df98: add      x0, x8, #0x138
  0x290df9c: ldp      x8, x7, [x0]
  0x290dfa0: mov      x0, x20
  0x290dfa4: mov      w1, w23
  0x290dfa8: mov      w2, w22
  0x290dfac: mov      w3, w21
  0x290dfb0: mov      w4, wzr
  0x290dfb4: mov      w5, wzr
  0x290dfb8: mov      x6, x19
  0x290dfbc: blr      x8
  0x290dfc0: ldr      x0, [x19, #0x40]
  0x290dfc4: cbz      x0, #0x290e974
  0x290dfc8: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290dfcc: mov      w1, #0xc
  0x290dfd0: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290dfd4: ldr      x9, [x29]
  0x290dfd8: cbz      x9, #0x290e974
  0x290dfdc: mov      x20, x0
  0x290dfe0: cbz      x0, #0x290e974
  0x290dfe4: ldr      x8, [x20]
  0x290dfe8: ldrb     w21, [x27]
  0x290dfec: ldrh     w22, [x9, #0x94]
  0x290dff0: ldrh     w23, [x9, #0x92]
  0x290dff4: ldrh     w9, [x8, #0x12e]
  0x290dff8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290dffc: cbz      x9, #0x290e020
  0x290e000: ldr      x10, [x8, #0xb0]
  0x290e004: add      x10, x10, #8
  0x290e008: ldur     x11, [x10, #-8]
  0x290e00c: cmp      x11, x1
  0x290e010: b.eq     #0x290e030
  0x290e014: subs     x9, x9, #1
  0x290e018: add      x10, x10, #0x10
  0x290e01c: b.ne     #0x290e008
  0x290e020: mov      w2, #6
  0x290e024: mov      x0, x20
  0x290e028: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e02c: b        #0x290e040
  0x290e030: ldr      w9, [x10]
  0x290e034: add      w9, w9, #6
  0x290e038: add      x8, x8, w9, sxtw #4
  0x290e03c: add      x0, x8, #0x138
  0x290e040: ldp      x8, x7, [x0]
  0x290e044: mov      x0, x20
  0x290e048: mov      w1, w23
  0x290e04c: mov      w2, w22
  0x290e050: mov      w3, w21
  0x290e054: mov      w4, wzr
  0x290e058: mov      w5, wzr
  0x290e05c: mov      x6, x19
  0x290e060: blr      x8
  0x290e064: ldr      x0, [x19, #0x40]
  0x290e068: cbz      x0, #0x290e974
  0x290e06c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e070: mov      w1, #0xd
  0x290e074: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e078: ldr      x9, [x29]
  0x290e07c: cbz      x9, #0x290e974
  0x290e080: mov      x20, x0
  0x290e084: cbz      x0, #0x290e974
  0x290e088: ldr      x8, [x20]
  0x290e08c: ldrb     w21, [x27]
  0x290e090: ldrh     w22, [x9, #0x98]
  0x290e094: ldrh     w23, [x9, #0x96]
  0x290e098: ldrh     w9, [x8, #0x12e]
  0x290e09c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e0a0: cbz      x9, #0x290e0c4
  0x290e0a4: ldr      x10, [x8, #0xb0]
  0x290e0a8: add      x10, x10, #8
  0x290e0ac: ldur     x11, [x10, #-8]
  0x290e0b0: cmp      x11, x1
  0x290e0b4: b.eq     #0x290e0d4
  0x290e0b8: subs     x9, x9, #1
  0x290e0bc: add      x10, x10, #0x10
  0x290e0c0: b.ne     #0x290e0ac
  0x290e0c4: mov      w2, #6
  0x290e0c8: mov      x0, x20
  0x290e0cc: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e0d0: b        #0x290e0e4
  0x290e0d4: ldr      w9, [x10]
  0x290e0d8: add      w9, w9, #6
  0x290e0dc: add      x8, x8, w9, sxtw #4
  0x290e0e0: add      x0, x8, #0x138
  0x290e0e4: ldp      x8, x7, [x0]
  0x290e0e8: mov      x0, x20
  0x290e0ec: mov      w1, w23
  0x290e0f0: mov      w2, w22
  0x290e0f4: mov      w3, w21
  0x290e0f8: mov      w4, wzr
  0x290e0fc: mov      w5, wzr
  0x290e100: mov      x6, x19
  0x290e104: blr      x8
  0x290e108: ldr      x0, [x19, #0x40]
  0x290e10c: cbz      x0, #0x290e974
  0x290e110: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e114: mov      w1, #0xe
  0x290e118: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e11c: ldr      x9, [x29]
  0x290e120: cbz      x9, #0x290e974
  0x290e124: mov      x20, x0
  0x290e128: cbz      x0, #0x290e974
  0x290e12c: ldr      x8, [x20]
  0x290e130: ldrb     w21, [x27]
  0x290e134: ldrh     w22, [x9, #0x9c]
  0x290e138: ldrh     w23, [x9, #0x9a]
  0x290e13c: ldrh     w9, [x8, #0x12e]
  0x290e140: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e144: cbz      x9, #0x290e168
  0x290e148: ldr      x10, [x8, #0xb0]
  0x290e14c: add      x10, x10, #8
  0x290e150: ldur     x11, [x10, #-8]
  0x290e154: cmp      x11, x1
  0x290e158: b.eq     #0x290e178
  0x290e15c: subs     x9, x9, #1
  0x290e160: add      x10, x10, #0x10
  0x290e164: b.ne     #0x290e150
  0x290e168: mov      w2, #6
  0x290e16c: mov      x0, x20
  0x290e170: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e174: b        #0x290e188
  0x290e178: ldr      w9, [x10]
  0x290e17c: add      w9, w9, #6
  0x290e180: add      x8, x8, w9, sxtw #4
  0x290e184: add      x0, x8, #0x138
  0x290e188: ldp      x8, x7, [x0]
  0x290e18c: mov      x0, x20
  0x290e190: mov      w1, w23
  0x290e194: mov      w2, w22
  0x290e198: mov      w3, w21
  0x290e19c: mov      w4, wzr
  0x290e1a0: mov      w5, wzr
  0x290e1a4: mov      x6, x19
  0x290e1a8: blr      x8
  0x290e1ac: ldr      x0, [x19, #0x40]
  0x290e1b0: cbz      x0, #0x290e974
  0x290e1b4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e1b8: mov      w1, #0xf
  0x290e1bc: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e1c0: ldr      x9, [x29]
  0x290e1c4: cbz      x9, #0x290e974
  0x290e1c8: mov      x20, x0
  0x290e1cc: cbz      x0, #0x290e974
  0x290e1d0: ldr      x8, [x20]
  0x290e1d4: ldrb     w21, [x27]
  0x290e1d8: ldrh     w22, [x9, #0xa0]
  0x290e1dc: ldrh     w23, [x9, #0x9e]
  0x290e1e0: ldrh     w9, [x8, #0x12e]
  0x290e1e4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e1e8: cbz      x9, #0x290e20c
  0x290e1ec: ldr      x10, [x8, #0xb0]
  0x290e1f0: add      x10, x10, #8
  0x290e1f4: ldur     x11, [x10, #-8]
  0x290e1f8: cmp      x11, x1
  0x290e1fc: b.eq     #0x290e21c
  0x290e200: subs     x9, x9, #1
  0x290e204: add      x10, x10, #0x10
  0x290e208: b.ne     #0x290e1f4
  0x290e20c: mov      w2, #6
  0x290e210: mov      x0, x20
  0x290e214: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e218: b        #0x290e22c
  0x290e21c: ldr      w9, [x10]
  0x290e220: add      w9, w9, #6
  0x290e224: add      x8, x8, w9, sxtw #4
  0x290e228: add      x0, x8, #0x138
  0x290e22c: ldp      x8, x7, [x0]
  0x290e230: mov      x0, x20
  0x290e234: mov      w1, w23
  0x290e238: mov      w2, w22
  0x290e23c: mov      w3, w21
  0x290e240: mov      w4, wzr
  0x290e244: mov      w5, wzr
  0x290e248: mov      x6, x19
  0x290e24c: blr      x8
  0x290e250: ldr      x0, [x19, #0x40]
  0x290e254: cbz      x0, #0x290e974
  0x290e258: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e25c: mov      w1, #0x10
  0x290e260: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e264: ldr      x9, [x29]
  0x290e268: cbz      x9, #0x290e974
  0x290e26c: mov      x20, x0
  0x290e270: cbz      x0, #0x290e974
  0x290e274: ldr      x8, [x20]
  0x290e278: ldrb     w21, [x27]
  0x290e27c: ldrh     w22, [x9, #0xa4]
  0x290e280: ldrh     w23, [x9, #0xa2]
  0x290e284: ldrh     w9, [x8, #0x12e]
  0x290e288: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e28c: cbz      x9, #0x290e2b0
  0x290e290: ldr      x10, [x8, #0xb0]
  0x290e294: add      x10, x10, #8
  0x290e298: ldur     x11, [x10, #-8]
  0x290e29c: cmp      x11, x1
  0x290e2a0: b.eq     #0x290e2c0
  0x290e2a4: subs     x9, x9, #1
  0x290e2a8: add      x10, x10, #0x10
  0x290e2ac: b.ne     #0x290e298
  0x290e2b0: mov      w2, #6
  0x290e2b4: mov      x0, x20
  0x290e2b8: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e2bc: b        #0x290e2d0
  0x290e2c0: ldr      w9, [x10]
  0x290e2c4: add      w9, w9, #6
  0x290e2c8: add      x8, x8, w9, sxtw #4
  0x290e2cc: add      x0, x8, #0x138
  0x290e2d0: ldp      x8, x7, [x0]
  0x290e2d4: mov      x0, x20
  0x290e2d8: mov      w1, w23
  0x290e2dc: mov      w2, w22
  0x290e2e0: mov      w3, w21
  0x290e2e4: mov      w4, wzr
  0x290e2e8: mov      w5, wzr
  0x290e2ec: mov      x6, x19
  0x290e2f0: blr      x8
  0x290e2f4: ldr      x0, [x19, #0x40]
  0x290e2f8: cbz      x0, #0x290e974
  0x290e2fc: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e300: mov      w1, #0x11
  0x290e304: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e308: ldr      x9, [x29]
  0x290e30c: cbz      x9, #0x290e974
  0x290e310: mov      x20, x0
  0x290e314: cbz      x0, #0x290e974
  0x290e318: ldr      x8, [x20]
  0x290e31c: ldrb     w21, [x27]
  0x290e320: ldrh     w22, [x9, #0xa8]
  0x290e324: ldrh     w23, [x9, #0xa6]
  0x290e328: ldrh     w9, [x8, #0x12e]
  0x290e32c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e330: cbz      x9, #0x290e354
  0x290e334: ldr      x10, [x8, #0xb0]
  0x290e338: add      x10, x10, #8
  0x290e33c: ldur     x11, [x10, #-8]
  0x290e340: cmp      x11, x1
  0x290e344: b.eq     #0x290e364
  0x290e348: subs     x9, x9, #1
  0x290e34c: add      x10, x10, #0x10
  0x290e350: b.ne     #0x290e33c
  0x290e354: mov      w2, #6
  0x290e358: mov      x0, x20
  0x290e35c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e360: b        #0x290e374
  0x290e364: ldr      w9, [x10]
  0x290e368: add      w9, w9, #6
  0x290e36c: add      x8, x8, w9, sxtw #4
  0x290e370: add      x0, x8, #0x138
  0x290e374: ldp      x8, x7, [x0]
  0x290e378: mov      x0, x20
  0x290e37c: mov      w1, w23
  0x290e380: mov      w2, w22
  0x290e384: mov      w3, w21
  0x290e388: mov      w4, wzr
  0x290e38c: mov      w5, wzr
  0x290e390: mov      x6, x19
  0x290e394: blr      x8
  0x290e398: ldr      x0, [x19, #0x40]
  0x290e39c: cbz      x0, #0x290e974
  0x290e3a0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e3a4: mov      w1, #0x12
  0x290e3a8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e3ac: ldr      x9, [x29]
  0x290e3b0: cbz      x9, #0x290e974
  0x290e3b4: mov      x20, x0
  0x290e3b8: cbz      x0, #0x290e974
  0x290e3bc: ldr      x8, [x20]
  0x290e3c0: ldrb     w21, [x27]
  0x290e3c4: ldrh     w22, [x9, #0xac]
  0x290e3c8: ldrh     w23, [x9, #0xaa]
  0x290e3cc: ldrh     w9, [x8, #0x12e]
  0x290e3d0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e3d4: cbz      x9, #0x290e3f8
  0x290e3d8: ldr      x10, [x8, #0xb0]
  0x290e3dc: add      x10, x10, #8
  0x290e3e0: ldur     x11, [x10, #-8]
  0x290e3e4: cmp      x11, x1
  0x290e3e8: b.eq     #0x290e408
  0x290e3ec: subs     x9, x9, #1
  0x290e3f0: add      x10, x10, #0x10
  0x290e3f4: b.ne     #0x290e3e0
  0x290e3f8: mov      w2, #6
  0x290e3fc: mov      x0, x20
  0x290e400: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e404: b        #0x290e418
  0x290e408: ldr      w9, [x10]
  0x290e40c: add      w9, w9, #6
  0x290e410: add      x8, x8, w9, sxtw #4
  0x290e414: add      x0, x8, #0x138
  0x290e418: ldp      x8, x7, [x0]
  0x290e41c: mov      x0, x20
  0x290e420: mov      w1, w23
  0x290e424: mov      w2, w22
  0x290e428: mov      w3, w21
  0x290e42c: mov      w4, wzr
  0x290e430: mov      w5, wzr
  0x290e434: mov      x6, x19
  0x290e438: blr      x8
  0x290e43c: ldr      x0, [x19, #0x40]
  0x290e440: cbz      x0, #0x290e974
  0x290e444: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e448: mov      w1, #0x13
  0x290e44c: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e450: ldr      x9, [x29]
  0x290e454: cbz      x9, #0x290e974
  0x290e458: mov      x20, x0
  0x290e45c: cbz      x0, #0x290e974
  0x290e460: ldr      x8, [x20]
  0x290e464: ldrb     w21, [x27]
  0x290e468: ldrh     w22, [x9, #0xb0]
  0x290e46c: ldrh     w23, [x9, #0xae]
  0x290e470: ldrh     w9, [x8, #0x12e]
  0x290e474: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e478: cbz      x9, #0x290e49c
  0x290e47c: ldr      x10, [x8, #0xb0]
  0x290e480: add      x10, x10, #8
  0x290e484: ldur     x11, [x10, #-8]
  0x290e488: cmp      x11, x1
  0x290e48c: b.eq     #0x290e4ac
  0x290e490: subs     x9, x9, #1
  0x290e494: add      x10, x10, #0x10
  0x290e498: b.ne     #0x290e484
  0x290e49c: mov      w2, #6
  0x290e4a0: mov      x0, x20
  0x290e4a4: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e4a8: b        #0x290e4bc
  0x290e4ac: ldr      w9, [x10]
  0x290e4b0: add      w9, w9, #6
  0x290e4b4: add      x8, x8, w9, sxtw #4
  0x290e4b8: add      x0, x8, #0x138
  0x290e4bc: ldp      x8, x7, [x0]
  0x290e4c0: mov      x0, x20
  0x290e4c4: mov      w1, w23
  0x290e4c8: mov      w2, w22
  0x290e4cc: mov      w3, w21
  0x290e4d0: mov      w4, wzr
  0x290e4d4: mov      w5, wzr
  0x290e4d8: mov      x6, x19
  0x290e4dc: blr      x8
  0x290e4e0: ldr      x0, [x19, #0x40]
  0x290e4e4: cbz      x0, #0x290e974
  0x290e4e8: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e4ec: mov      w1, #0x14
  0x290e4f0: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e4f4: ldr      x9, [x29]
  0x290e4f8: cbz      x9, #0x290e974
  0x290e4fc: mov      x20, x0
  0x290e500: cbz      x0, #0x290e974
  0x290e504: ldr      x8, [x20]
  0x290e508: ldrb     w21, [x27]
  0x290e50c: ldrh     w22, [x9, #0xb4]
  0x290e510: ldrh     w23, [x9, #0xb2]
  0x290e514: ldrh     w9, [x8, #0x12e]
  0x290e518: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e51c: cbz      x9, #0x290e540
  0x290e520: ldr      x10, [x8, #0xb0]
  0x290e524: add      x10, x10, #8
  0x290e528: ldur     x11, [x10, #-8]
  0x290e52c: cmp      x11, x1
  0x290e530: b.eq     #0x290e550
  0x290e534: subs     x9, x9, #1
  0x290e538: add      x10, x10, #0x10
  0x290e53c: b.ne     #0x290e528
  0x290e540: mov      w2, #6
  0x290e544: mov      x0, x20
  0x290e548: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e54c: b        #0x290e560
  0x290e550: ldr      w9, [x10]
  0x290e554: add      w9, w9, #6
  0x290e558: add      x8, x8, w9, sxtw #4
  0x290e55c: add      x0, x8, #0x138
  0x290e560: ldp      x8, x7, [x0]
  0x290e564: mov      x0, x20
  0x290e568: mov      w1, w23
  0x290e56c: mov      w2, w22
  0x290e570: mov      w3, w21
  0x290e574: mov      w4, wzr
  0x290e578: mov      w5, wzr
  0x290e57c: mov      x6, x19
  0x290e580: blr      x8
  0x290e584: ldr      x0, [x19, #0x40]
  0x290e588: cbz      x0, #0x290e974
  0x290e58c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e590: mov      w1, #0x15
  0x290e594: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e598: ldr      x9, [x29]
  0x290e59c: cbz      x9, #0x290e974
  0x290e5a0: mov      x20, x0
  0x290e5a4: cbz      x0, #0x290e974
  0x290e5a8: ldr      x8, [x20]
  0x290e5ac: ldrb     w21, [x27]
  0x290e5b0: ldrh     w22, [x9, #0xb8]
  0x290e5b4: ldrh     w23, [x9, #0xb6]
  0x290e5b8: ldrh     w9, [x8, #0x12e]
  0x290e5bc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e5c0: cbz      x9, #0x290e5e4
  0x290e5c4: ldr      x10, [x8, #0xb0]
  0x290e5c8: add      x10, x10, #8
  0x290e5cc: ldur     x11, [x10, #-8]
  0x290e5d0: cmp      x11, x1
  0x290e5d4: b.eq     #0x290e5f4
  0x290e5d8: subs     x9, x9, #1
  0x290e5dc: add      x10, x10, #0x10
  0x290e5e0: b.ne     #0x290e5cc
  0x290e5e4: mov      w2, #6
  0x290e5e8: mov      x0, x20
  0x290e5ec: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e5f0: b        #0x290e604
  0x290e5f4: ldr      w9, [x10]
  0x290e5f8: add      w9, w9, #6
  0x290e5fc: add      x8, x8, w9, sxtw #4
  0x290e600: add      x0, x8, #0x138
  0x290e604: ldp      x8, x7, [x0]
  0x290e608: mov      x0, x20
  0x290e60c: mov      w1, w23
  0x290e610: mov      w2, w22
  0x290e614: mov      w3, w21
  0x290e618: mov      w4, wzr
  0x290e61c: mov      w5, wzr
  0x290e620: mov      x6, x19
  0x290e624: blr      x8
  0x290e628: ldr      x0, [x19, #0x40]
  0x290e62c: cbz      x0, #0x290e974
  0x290e630: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e634: mov      w1, #0x16
  0x290e638: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e63c: ldr      x9, [x29]
  0x290e640: cbz      x9, #0x290e974
  0x290e644: mov      x20, x0
  0x290e648: cbz      x0, #0x290e974
  0x290e64c: ldr      x8, [x20]
  0x290e650: ldrb     w21, [x27]
  0x290e654: ldrh     w22, [x9, #0xbc]
  0x290e658: ldrh     w23, [x9, #0xba]
  0x290e65c: ldrh     w9, [x8, #0x12e]
  0x290e660: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e664: cbz      x9, #0x290e688
  0x290e668: ldr      x10, [x8, #0xb0]
  0x290e66c: add      x10, x10, #8
  0x290e670: ldur     x11, [x10, #-8]
  0x290e674: cmp      x11, x1
  0x290e678: b.eq     #0x290e698
  0x290e67c: subs     x9, x9, #1
  0x290e680: add      x10, x10, #0x10
  0x290e684: b.ne     #0x290e670
  0x290e688: mov      w2, #6
  0x290e68c: mov      x0, x20
  0x290e690: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e694: b        #0x290e6a8
  0x290e698: ldr      w9, [x10]
  0x290e69c: add      w9, w9, #6
  0x290e6a0: add      x8, x8, w9, sxtw #4
  0x290e6a4: add      x0, x8, #0x138
  0x290e6a8: ldp      x8, x7, [x0]
  0x290e6ac: mov      x0, x20
  0x290e6b0: mov      w1, w23
  0x290e6b4: mov      w2, w22
  0x290e6b8: mov      w3, w21
  0x290e6bc: mov      w4, wzr
  0x290e6c0: mov      w5, wzr
  0x290e6c4: mov      x6, x19
  0x290e6c8: blr      x8
  0x290e6cc: ldr      x0, [x19, #0x40]
  0x290e6d0: cbz      x0, #0x290e974
  0x290e6d4: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e6d8: mov      w1, #0x17
  0x290e6dc: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e6e0: ldr      x9, [x29]
  0x290e6e4: cbz      x9, #0x290e974
  0x290e6e8: mov      x20, x0
  0x290e6ec: cbz      x0, #0x290e974
  0x290e6f0: ldr      x8, [x20]
  0x290e6f4: ldrb     w21, [x27]
  0x290e6f8: ldrh     w22, [x9, #0xc0]
  0x290e6fc: ldrh     w23, [x9, #0xbe]
  0x290e700: ldrh     w9, [x8, #0x12e]
  0x290e704: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e708: cbz      x9, #0x290e72c
  0x290e70c: ldr      x10, [x8, #0xb0]
  0x290e710: add      x10, x10, #8
  0x290e714: ldur     x11, [x10, #-8]
  0x290e718: cmp      x11, x1
  0x290e71c: b.eq     #0x290e73c
  0x290e720: subs     x9, x9, #1
  0x290e724: add      x10, x10, #0x10
  0x290e728: b.ne     #0x290e714
  0x290e72c: mov      w2, #6
  0x290e730: mov      x0, x20
  0x290e734: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e738: b        #0x290e74c
  0x290e73c: ldr      w9, [x10]
  0x290e740: add      w9, w9, #6
  0x290e744: add      x8, x8, w9, sxtw #4
  0x290e748: add      x0, x8, #0x138
  0x290e74c: ldp      x8, x7, [x0]
  0x290e750: mov      x0, x20
  0x290e754: mov      w1, w23
  0x290e758: mov      w2, w22
  0x290e75c: mov      w3, w21
  0x290e760: mov      w4, wzr
  0x290e764: mov      w5, wzr
  0x290e768: mov      x6, x19
  0x290e76c: blr      x8
  0x290e770: ldr      x0, [x19, #0x40]
  0x290e774: cbz      x0, #0x290e974
  0x290e778: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e77c: mov      w1, #0x18
  0x290e780: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e784: ldr      x9, [x29]
  0x290e788: cbz      x9, #0x290e974
  0x290e78c: mov      x20, x0
  0x290e790: cbz      x0, #0x290e974
  0x290e794: ldr      x8, [x20]
  0x290e798: ldrb     w21, [x27]
  0x290e79c: ldrh     w22, [x9, #0xc4]
  0x290e7a0: ldrh     w23, [x9, #0xc2]
  0x290e7a4: ldrh     w9, [x8, #0x12e]
  0x290e7a8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e7ac: cbz      x9, #0x290e7d0
  0x290e7b0: ldr      x10, [x8, #0xb0]
  0x290e7b4: add      x10, x10, #8
  0x290e7b8: ldur     x11, [x10, #-8]
  0x290e7bc: cmp      x11, x1
  0x290e7c0: b.eq     #0x290e7e0
  0x290e7c4: subs     x9, x9, #1
  0x290e7c8: add      x10, x10, #0x10
  0x290e7cc: b.ne     #0x290e7b8
  0x290e7d0: mov      w2, #6
  0x290e7d4: mov      x0, x20
  0x290e7d8: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e7dc: b        #0x290e7f0
  0x290e7e0: ldr      w9, [x10]
  0x290e7e4: add      w9, w9, #6
  0x290e7e8: add      x8, x8, w9, sxtw #4
  0x290e7ec: add      x0, x8, #0x138
  0x290e7f0: ldp      x8, x7, [x0]
  0x290e7f4: mov      x0, x20
  0x290e7f8: mov      w1, w23
  0x290e7fc: mov      w2, w22
  0x290e800: mov      w3, w21
  0x290e804: mov      w4, wzr
  0x290e808: mov      w5, wzr
  0x290e80c: mov      x6, x19
  0x290e810: blr      x8
  0x290e814: ldr      x0, [x19, #0x40]
  0x290e818: cbz      x0, #0x290e974
  0x290e81c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e820: mov      w1, #0x19
  0x290e824: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e828: ldr      x9, [x29]
  0x290e82c: cbz      x9, #0x290e974
  0x290e830: mov      x20, x0
  0x290e834: cbz      x0, #0x290e974
  0x290e838: ldr      x8, [x20]
  0x290e83c: ldrb     w21, [x27]
  0x290e840: ldrh     w22, [x9, #0xc8]
  0x290e844: ldrh     w23, [x9, #0xc6]
  0x290e848: ldrh     w9, [x8, #0x12e]
  0x290e84c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e850: cbz      x9, #0x290e874
  0x290e854: ldr      x10, [x8, #0xb0]
  0x290e858: add      x10, x10, #8
  0x290e85c: ldur     x11, [x10, #-8]
  0x290e860: cmp      x11, x1
  0x290e864: b.eq     #0x290e884
  0x290e868: subs     x9, x9, #1
  0x290e86c: add      x10, x10, #0x10
  0x290e870: b.ne     #0x290e85c
  0x290e874: mov      w2, #6
  0x290e878: mov      x0, x20
  0x290e87c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e880: b        #0x290e894
  0x290e884: ldr      w9, [x10]
  0x290e888: add      w9, w9, #6
  0x290e88c: add      x8, x8, w9, sxtw #4
  0x290e890: add      x0, x8, #0x138
  0x290e894: ldp      x8, x7, [x0]
  0x290e898: mov      x0, x20
  0x290e89c: mov      w1, w23
  0x290e8a0: mov      w2, w22
  0x290e8a4: mov      w3, w21
  0x290e8a8: mov      w4, wzr
  0x290e8ac: mov      w5, wzr
  0x290e8b0: mov      x6, x19
  0x290e8b4: blr      x8
  0x290e8b8: ldr      x0, [x19, #0x40]
  0x290e8bc: cbz      x0, #0x290e974
  0x290e8c0: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55c5000)
  0x290e8c4: mov      w1, #0x1a
  0x290e8c8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290e8cc: ldr      x9, [x29]
  0x290e8d0: cbz      x9, #0x290e974
  0x290e8d4: mov      x20, x0
  0x290e8d8: cbz      x0, #0x290e974
  0x290e8dc: ldr      x8, [x20]
  0x290e8e0: ldrb     w21, [x27]
  0x290e8e4: ldrh     w22, [x9, #0xcc]
  0x290e8e8: ldrh     w23, [x9, #0xca]
  0x290e8ec: ldrh     w9, [x8, #0x12e]
  0x290e8f0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x55c5000)
  0x290e8f4: cbz      x9, #0x290e918
  0x290e8f8: ldr      x10, [x8, #0xb0]
  0x290e8fc: add      x10, x10, #8
  0x290e900: ldur     x11, [x10, #-8]
  0x290e904: cmp      x11, x1
  0x290e908: b.eq     #0x290e928
  0x290e90c: subs     x9, x9, #1
  0x290e910: add      x10, x10, #0x10
  0x290e914: b.ne     #0x290e900
  0x290e918: mov      w2, #6
  0x290e91c: mov      x0, x20
  0x290e920: bl       #0x2215130 ; -> ??? 0x2215130
  0x290e924: b        #0x290e938
  0x290e928: ldr      w9, [x10]
  0x290e92c: add      w9, w9, #6
  0x290e930: add      x8, x8, w9, sxtw #4
  0x290e934: add      x0, x8, #0x138
  0x290e938: ldp      x8, x7, [x0]
  0x290e93c: mov      x0, x20
  0x290e940: mov      w1, w23
  0x290e944: mov      w2, w22
  0x290e948: mov      w3, w21
  0x290e94c: mov      x6, x19
  0x290e950: ldp      x20, x19, [sp, #0x50]
  0x290e954: ldp      x22, x21, [sp, #0x40]
  0x290e958: ldp      x24, x23, [sp, #0x30]
  0x290e95c: ldp      x26, x25, [sp, #0x20]
  0x290e960: ldp      x28, x27, [sp, #0x10]
  0x290e964: mov      w4, wzr
  0x290e968: mov      w5, wzr
  0x290e96c: ldp      x29, x30, [sp], #0x60
  0x290e970: br       x8
  0x290e974: bl       #0x21b4d20 ; -> ??? 0x21b4d20
