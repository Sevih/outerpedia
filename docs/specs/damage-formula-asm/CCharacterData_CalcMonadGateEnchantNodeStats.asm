; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcMonadGateEnchantNodeStats @ 0x2905d40..0x2906230 (taille 1264 octets) =====
  0x2905d40: sub      sp, sp, #0xe0
  0x2905d44: stp      x29, x30, [sp, #0x80]
  0x2905d48: stp      x28, x27, [sp, #0x90]
  0x2905d4c: stp      x26, x25, [sp, #0xa0]
  0x2905d50: stp      x24, x23, [sp, #0xb0]
  0x2905d54: stp      x22, x21, [sp, #0xc0]
  0x2905d58: stp      x20, x19, [sp, #0xd0]
  0x2905d5c: adrp     x20, #0x59d8000
  0x2905d60: ldrb     w8, [x20, #0x288]
  0x2905d64: mov      x19, x0
  0x2905d68: tbnz     w8, #0, #0x2905e64
  0x2905d6c: adrp     x0, #0x55b6000
  0x2905d70: ldr      x0, [x0, #0x898] ; = 0x0 (u64 @ 0x55b6898)
  0x2905d74: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905d78: adrp     x0, #0x55b6000
  0x2905d7c: ldr      x0, [x0, #0x8a0] ; = 0x0 (u64 @ 0x55b68a0)
  0x2905d80: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905d84: adrp     x0, #0x55b6000
  0x2905d88: ldr      x0, [x0, #0x8a8] ; = 0x0 (u64 @ 0x55b68a8)
  0x2905d8c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905d90: adrp     x0, #0x55b6000
  0x2905d94: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x55b6838)
  0x2905d98: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905d9c: adrp     x0, #0x55b6000
  0x2905da0: ldr      x0, [x0, #0x8b0] ; = 0x0 (u64 @ 0x55b68b0)
  0x2905da4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905da8: adrp     x0, #0x55b6000
  0x2905dac: ldr      x0, [x0, #0x8b8] ; = 0x0 (u64 @ 0x55b68b8)
  0x2905db0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905db4: adrp     x0, #0x55b6000
  0x2905db8: ldr      x0, [x0, #0x8c0] ; = 0x0 (u64 @ 0x55b68c0)
  0x2905dbc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905dc0: adrp     x0, #0x55b6000
  0x2905dc4: ldr      x0, [x0, #0x8c8] ; = 0x0 (u64 @ 0x55b68c8)
  0x2905dc8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905dcc: adrp     x0, #0x55b6000
  0x2905dd0: ldr      x0, [x0, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x2905dd4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905dd8: adrp     x0, #0x55b6000
  0x2905ddc: ldr      x0, [x0, #0x8d8] ; = 0x0 (u64 @ 0x55b68d8)
  0x2905de0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905de4: adrp     x0, #0x55b6000
  0x2905de8: ldr      x0, [x0, #0x8e0] ; = 0x0 (u64 @ 0x55b68e0)
  0x2905dec: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905df0: adrp     x0, #0x55b6000
  0x2905df4: ldr      x0, [x0, #0x8e8] ; = 0x0 (u64 @ 0x55b68e8)
  0x2905df8: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905dfc: adrp     x0, #0x55b6000
  0x2905e00: ldr      x0, [x0, #0x8f0] ; = 0x0 (u64 @ 0x55b68f0)
  0x2905e04: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e08: adrp     x0, #0x55b6000
  0x2905e0c: ldr      x0, [x0, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2905e10: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e14: adrp     x0, #0x55b6000
  0x2905e18: ldr      x0, [x0, #0x8f8] ; = 0x0 (u64 @ 0x55b68f8)
  0x2905e1c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e20: adrp     x0, #0x55b6000
  0x2905e24: ldr      x0, [x0, #0x900] ; = 0x0 (u64 @ 0x55b6900)
  0x2905e28: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e2c: adrp     x0, #0x55b6000
  0x2905e30: ldr      x0, [x0, #0x908] ; = 0x0 (u64 @ 0x55b6908)
  0x2905e34: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e38: adrp     x0, #0x55b6000
  0x2905e3c: ldr      x0, [x0, #0x910] ; = 0x0 (u64 @ 0x55b6910)
  0x2905e40: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e44: adrp     x0, #0x55b6000
  0x2905e48: ldr      x0, [x0, #0x918] ; = 0x0 (u64 @ 0x55b6918)
  0x2905e4c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e50: adrp     x0, #0x55b6000
  0x2905e54: ldr      x0, [x0, #0x920] ; = 0x0 (u64 @ 0x55b6920)
  0x2905e58: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2905e5c: mov      w8, #1
  0x2905e60: strb     w8, [x20, #0x288]
  0x2905e64: movi     v0.2d, #0000000000000000
  0x2905e68: stp      xzr, xzr, [sp, #0x60]
  0x2905e6c: str      xzr, [sp, #0x70]
  0x2905e70: str      xzr, [sp, #0x50]
  0x2905e74: stp      q0, q0, [sp, #0x30]
  0x2905e78: str      xzr, [sp, #0x28]
  0x2905e7c: ldr      x8, [x19, #0xd8]
  0x2905e80: cbz      x8, #0x29060ec
  0x2905e84: adrp     x8, #0x55b6000
  0x2905e88: ldr      x8, [x8, #0x8c0] ; = 0x0 (u64 @ 0x55b68c0)
  0x2905e8c: adrp     x20, #0x55b6000
  0x2905e90: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905e94: ldr      x20, [x20, #0x8b0] ; = 0x0 (u64 @ 0x55b68b0)
  0x2905e98: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2905e9c: ldr      x1, [x20] ; = 0x0 (u64 @ 0x55b6000)
  0x2905ea0: mov      x20, x0
  0x2905ea4: bl       #0x4019344 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$.ctor
  0x2905ea8: ldr      x0, [x19, #0xd8]
  0x2905eac: cbz      x0, #0x2906124
  0x2905eb0: adrp     x8, #0x55b6000
  0x2905eb4: ldr      x8, [x8, #0x910] ; = 0x0 (u64 @ 0x55b6910)
  0x2905eb8: adrp     x24, #0x55b6000
  0x2905ebc: adrp     x28, #0x55b6000
  0x2905ec0: adrp     x29, #0x55b6000
  0x2905ec4: adrp     x27, #0x55b6000
  0x2905ec8: adrp     x25, #0x55b6000
  0x2905ecc: adrp     x26, #0x55b6000
  0x2905ed0: ldr      x24, [x24, #0x8d8] ; = 0x0 (u64 @ 0x55b68d8)
  0x2905ed4: ldr      x28, [x28, #0x8a0] ; = 0x0 (u64 @ 0x55b68a0)
  0x2905ed8: ldr      x29, [x29, #0x8b8] ; = 0x0 (u64 @ 0x55b68b8)
  0x2905edc: ldr      x27, [x27, #0x908] ; = 0x0 (u64 @ 0x55b6908)
  0x2905ee0: ldr      x25, [x25, #0x8e0] ; = 0x0 (u64 @ 0x55b68e0)
  0x2905ee4: ldr      x26, [x26, #0x838] ; = 0x0 (u64 @ 0x55b6838)
  0x2905ee8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905eec: mov      x8, sp
  0x2905ef0: bl       #0x44bb5c0 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x2905ef4: ldr      q0, [sp]
  0x2905ef8: ldr      x8, [sp, #0x10]
  0x2905efc: str      q0, [sp, #0x60]
  0x2905f00: str      x8, [sp, #0x70]
  0x2905f04: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f08: add      x0, sp, #0x60
  0x2905f0c: bl       #0x4112894 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x2905f10: tbz      w0, #0, #0x2905ff4
  0x2905f14: ldr      x21, [sp, #0x70]
  0x2905f18: cbz      x21, #0x2906110
  0x2905f1c: ldr      w8, [x21, #0x50]
  0x2905f20: cbnz     w8, #0x2905f04
  0x2905f24: cbz      x20, #0x290611c
  0x2905f28: ldr      w1, [x21, #0x54]
  0x2905f2c: ldr      x2, [x28] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f30: mov      x0, x20
  0x2905f34: bl       #0x4019f0c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$ContainsKey
  0x2905f38: tbnz     w0, #0, #0x2905f80
  0x2905f3c: adrp     x8, #0x55b6000
  0x2905f40: ldr      w22, [x21, #0x54]
  0x2905f44: ldr      x8, [x8, #0x920] ; = 0x0 (u64 @ 0x55b6920)
  0x2905f48: ldr      x0, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f4c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x2905f50: adrp     x8, #0x55b6000
  0x2905f54: ldr      x8, [x8, #0x918] ; = 0x0 (u64 @ 0x55b6918)
  0x2905f58: mov      x23, x0
  0x2905f5c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f60: bl       #0x44ba28c ; -> System.Collections.Generic.List<object>$$.ctor
  0x2905f64: adrp     x8, #0x55b6000
  0x2905f68: ldr      x8, [x8, #0x898] ; = 0x0 (u64 @ 0x55b6898)
  0x2905f6c: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f70: mov      x0, x20
  0x2905f74: mov      w1, w22
  0x2905f78: mov      x2, x23
  0x2905f7c: bl       #0x4019d18 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$Add
  0x2905f80: ldr      w1, [x21, #0x54]
  0x2905f84: ldr      x2, [x29] ; = 0x0 (u64 @ 0x55b6000)
  0x2905f88: mov      x0, x20
  0x2905f8c: bl       #0x4019c78 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2905f90: cbz      x0, #0x2906120
  0x2905f94: ldr      w10, [x0, #0x1c]
  0x2905f98: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x55b6010)
  0x2905f9c: ldr      x9, [x27] ; = 0x0 (u64 @ 0x55b6000)
  0x2905fa0: add      w10, w10, #1
  0x2905fa4: str      w10, [x0, #0x1c]
  0x2905fa8: cbz      x8, #0x2906118
  0x2905fac: ldrsw    x10, [x0, #0x18]
  0x2905fb0: ldr      w11, [x8, #0x18]
  0x2905fb4: cmp      w10, w11
  0x2905fb8: b.hs     #0x2905fdc
  0x2905fbc: add      w9, w10, #1
  0x2905fc0: add      x8, x8, x10, lsl #3
  0x2905fc4: str      w9, [x0, #0x18]
  0x2905fc8: str      x21, [x8, #0x20]!
  0x2905fcc: mov      x0, x8
  0x2905fd0: mov      x1, x21
  0x2905fd4: bl       #0x21af920 ; -> ??? 0x21af920
  0x2905fd8: b        #0x2905f04
  0x2905fdc: ldr      x8, [x9, #0x20]
  0x2905fe0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x55b60c0)
  0x2905fe4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x55b6070)
  0x2905fe8: mov      x1, x21
  0x2905fec: bl       #0x44baac0 ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x2905ff0: b        #0x2905f04
  0x2905ff4: adrp     x8, #0x55b6000
  0x2905ff8: ldr      x8, [x8, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x2905ffc: add      x0, sp, #0x60
  0x2906000: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2906004: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2906008: adrp     x22, #0x55b6000
  0x290600c: ldr      x22, [x22, #0x780] ; = 0x0 (u64 @ 0x55b6780)
  0x2906010: cbz      x20, #0x2906124
  0x2906014: adrp     x8, #0x55b6000
  0x2906018: ldr      x8, [x8, #0x8a8] ; = 0x0 (u64 @ 0x55b68a8)
  0x290601c: mov      x0, x20
  0x2906020: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2906024: mov      x8, sp
  0x2906028: bl       #0x401a150 ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$GetEnumerator
  0x290602c: ldp      q0, q1, [sp]
  0x2906030: ldr      x8, [sp, #0x20]
  0x2906034: stp      q0, q1, [sp, #0x30]
  0x2906038: str      x8, [sp, #0x50]
  0x290603c: ldr      x1, [x25] ; = 0x0 (u64 @ 0x55b6000)
  0x2906040: add      x0, sp, #0x30
  0x2906044: bl       #0x415e7b8 ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$MoveNext
  0x2906048: tbz      w0, #0, #0x29060d8
  0x290604c: ldr      x0, [x19, #0x40]
  0x2906050: cbz      x0, #0x290610c
  0x2906054: ldr      x20, [sp, #0x48]
  0x2906058: ldr      w1, [sp, #0x40]
  0x290605c: ldr      x3, [x26] ; = 0x0 (u64 @ 0x55b6000)
  0x2906060: add      x2, sp, #0x28
  0x2906064: bl       #0x401b48c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$TryGetValue
  0x2906068: tbz      w0, #0, #0x290603c
  0x290606c: ldr      x21, [sp, #0x28]
  0x2906070: cbz      x21, #0x2906114
  0x2906074: ldr      x8, [x21]
  0x2906078: ldr      x1, [x22] ; = 0x0 (u64 @ 0x55b6000)
  0x290607c: ldrh     w9, [x8, #0x12e]
  0x2906080: cbz      x9, #0x29060a4
  0x2906084: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55b60b0)
  0x2906088: add      x10, x10, #8
  0x290608c: ldur     x11, [x10, #-8]
  0x2906090: cmp      x11, x1
  0x2906094: b.eq     #0x29060b4
  0x2906098: subs     x9, x9, #1
  0x290609c: add      x10, x10, #0x10
  0x29060a0: b.ne     #0x290608c
  0x29060a4: mov      w2, #0x11
  0x29060a8: mov      x0, x21
  0x29060ac: bl       #0x2210028 ; -> ??? 0x2210028
  0x29060b0: b        #0x29060c4
  0x29060b4: ldr      w9, [x10]
  0x29060b8: add      w9, w9, #0x11
  0x29060bc: add      x8, x8, w9, sxtw #4
  0x29060c0: add      x0, x8, #0x138
  0x29060c4: ldp      x8, x2, [x0]
  0x29060c8: mov      x0, x21
  0x29060cc: mov      x1, x20
  0x29060d0: blr      x8
  0x29060d4: b        #0x290603c
  0x29060d8: adrp     x8, #0x55b6000
  0x29060dc: ldr      x8, [x8, #0x8c8] ; = 0x0 (u64 @ 0x55b68c8)
  0x29060e0: add      x0, sp, #0x30
  0x29060e4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29060e8: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x29060ec: ldp      x20, x19, [sp, #0xd0]
  0x29060f0: ldp      x22, x21, [sp, #0xc0]
  0x29060f4: ldp      x24, x23, [sp, #0xb0]
  0x29060f8: ldp      x26, x25, [sp, #0xa0]
  0x29060fc: ldp      x28, x27, [sp, #0x90]
  0x2906100: ldp      x29, x30, [sp, #0x80]
  0x2906104: add      sp, sp, #0xe0
  0x2906108: ret      
  0x290610c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906110: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906114: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906118: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x290611c: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906120: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906124: bl       #0x21afc18 ; -> ??? 0x21afc18
  0x2906128: b        #0x2906154
  0x290612c: b        #0x2906154
  0x2906130: b        #0x2906154
  0x2906134: b        #0x2906154
  0x2906138: b        #0x29061bc
  0x290613c: b        #0x2906154
  0x2906140: b        #0x2906154
  0x2906144: b        #0x29061bc
  0x2906148: b        #0x2906154
  0x290614c: b        #0x29061bc
  0x2906150: b        #0x29061bc
  0x2906154: mov      x21, x0
  0x2906158: cmp      w1, #1
  0x290615c: b.ne     #0x2906190
  0x2906160: mov      x0, x21
  0x2906164: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x2906168: ldr      x22, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x290616c: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x2906170: adrp     x8, #0x55b6000
  0x2906174: ldr      x8, [x8, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x2906178: add      x0, sp, #0x60
  0x290617c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2906180: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2906184: cbz      x22, #0x2906008
  0x2906188: mov      x0, x22
  0x290618c: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x2906190: mov      x22, xzr
  0x2906194: b        #0x290619c
  0x2906198: mov      x21, x0
  0x290619c: adrp     x8, #0x55b6000
  0x29061a0: ldr      x8, [x8, #0x8d0] ; = 0x0 (u64 @ 0x55b68d0)
  0x29061a4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29061a8: add      x0, sp, #0x60
  0x29061ac: bl       #0x4112890 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x29061b0: cbz      x22, #0x290621c
  0x29061b4: mov      x0, x22
  0x29061b8: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29061bc: mov      x21, x0
  0x29061c0: cmp      w1, #1
  0x29061c4: b.ne     #0x29061f8
  0x29061c8: mov      x0, x21
  0x29061cc: bl       #0x525f4e0 ; -> ??? 0x525f4e0
  0x29061d0: ldr      x19, [x0] ; = 0x0 (u64 @ 0x55b6000)
  0x29061d4: bl       #0x525f4f0 ; -> ??? 0x525f4f0
  0x29061d8: adrp     x8, #0x55b6000
  0x29061dc: ldr      x8, [x8, #0x8c8] ; = 0x0 (u64 @ 0x55b68c8)
  0x29061e0: add      x0, sp, #0x30
  0x29061e4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x29061e8: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x29061ec: cbz      x19, #0x29060ec
  0x29061f0: mov      x0, x19
  0x29061f4: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x29061f8: mov      x19, xzr
  0x29061fc: b        #0x2906204
  0x2906200: mov      x21, x0
  0x2906204: adrp     x8, #0x55b6000
  0x2906208: ldr      x8, [x8, #0x8c8] ; = 0x0 (u64 @ 0x55b68c8)
  0x290620c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x55b6000)
  0x2906210: add      x0, sp, #0x30
  0x2906214: bl       #0x415e8dc ; -> System.Collections.Generic.Dictionary.Enumerator<Int32Enum, object>$$Dispose
  0x2906218: cbnz     x19, #0x2906224
  0x290621c: mov      x0, x21
  0x2906220: bl       #0x22b072c ; -> ??? 0x22b072c
  0x2906224: mov      x0, x19
  0x2906228: bl       #0x21afc10 ; -> ??? 0x21afc10
  0x290622c: bl       #0x1f86e18 ; -> ??? 0x1f86e18
