; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_AddEvolutionStatToDictionary @ 0x290a124..0x290a20c (taille 232 octets) =====
  0x290a124: str      x30, [sp, #-0x30]!
  0x290a128: stp      x22, x21, [sp, #0x10]
  0x290a12c: stp      x20, x19, [sp, #0x20]
  0x290a130: adrp     x22, #0x59d8000
  0x290a134: ldrb     w8, [x22, #0x29d]
  0x290a138: mov      w19, w3
  0x290a13c: mov      w20, w2
  0x290a140: mov      x21, x1
  0x290a144: tbnz     w8, #0, #0x290a180
  0x290a148: adrp     x0, #0x559f000
  0x290a14c: ldr      x0, [x0, #0xbd0] ; = 0x0 (u64 @ 0x559fbd0)
  0x290a150: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290a154: adrp     x0, #0x559f000
  0x290a158: ldr      x0, [x0, #0xbd8] ; = 0x0 (u64 @ 0x559fbd8)
  0x290a15c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290a160: adrp     x0, #0x559f000
  0x290a164: ldr      x0, [x0, #0xbe0] ; = 0x0 (u64 @ 0x559fbe0)
  0x290a168: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290a16c: adrp     x0, #0x558b000
  0x290a170: ldr      x0, [x0, #0xdd8] ; = 0x0 (u64 @ 0x558bdd8)
  0x290a174: bl       #0x21af97c ; -> ??? 0x21af97c
  0x290a178: mov      w8, #1
  0x290a17c: strb     w8, [x22, #0x29d]
  0x290a180: cbz      x21, #0x290a208
  0x290a184: adrp     x8, #0x559f000
  0x290a188: ldr      x8, [x8, #0xbd8] ; = 0x0 (u64 @ 0x559fbd8)
  0x290a18c: mov      x0, x21
  0x290a190: mov      w1, w20
  0x290a194: ldr      x2, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x290a198: bl       #0x401147c ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$ContainsKey
  0x290a19c: tbz      w0, #0, #0x290a1e0
  0x290a1a0: adrp     x8, #0x559f000
  0x290a1a4: ldr      x8, [x8, #0xbe0] ; = 0x0 (u64 @ 0x559fbe0)
  0x290a1a8: mov      x0, x21
  0x290a1ac: mov      w1, w20
  0x290a1b0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x290a1b4: bl       #0x40111f4 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$get_Item
  0x290a1b8: adrp     x8, #0x558b000
  0x290a1bc: ldr      x8, [x8, #0xdd8] ; = 0x0 (u64 @ 0x558bdd8)
  0x290a1c0: add      w2, w0, w19
  0x290a1c4: mov      x0, x21
  0x290a1c8: mov      w1, w20
  0x290a1cc: ldr      x3, [x8] ; = 0x0 (u64 @ 0x558b000)
  0x290a1d0: ldp      x20, x19, [sp, #0x20]
  0x290a1d4: ldp      x22, x21, [sp, #0x10]
  0x290a1d8: ldr      x30, [sp], #0x30
  0x290a1dc: b        #0x401127c
  0x290a1e0: adrp     x8, #0x559f000
  0x290a1e4: ldr      x8, [x8, #0xbd0] ; = 0x0 (u64 @ 0x559fbd0)
  0x290a1e8: mov      x0, x21
  0x290a1ec: mov      w1, w20
  0x290a1f0: mov      w2, w19
  0x290a1f4: ldr      x3, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x290a1f8: ldp      x20, x19, [sp, #0x20]
  0x290a1fc: ldp      x22, x21, [sp, #0x10]
  0x290a200: ldr      x30, [sp], #0x30
  0x290a204: b        #0x4011290
  0x290a208: bl       #0x21afc18 ; -> ??? 0x21afc18
