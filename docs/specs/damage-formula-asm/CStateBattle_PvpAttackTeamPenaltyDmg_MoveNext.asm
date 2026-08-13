; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CStateBattle_PvpAttackTeamPenaltyDmg_MoveNext @ 0x2609f5c..0x260a308 (taille 940 octets) =====
  0x2609f5c: stp      x30, x23, [sp, #-0x30]!
  0x2609f60: stp      x22, x21, [sp, #0x10]
  0x2609f64: stp      x20, x19, [sp, #0x20]
  0x2609f68: adrp     x20, #0x59d6000
  0x2609f6c: ldrb     w8, [x20, #0x97a]
  0x2609f70: mov      x19, x0
  0x2609f74: tbnz     w8, #0, #0x2609fbc
  0x2609f78: adrp     x0, #0x558b000
  0x2609f7c: ldr      x0, [x0, #0x488] ; = 0x0 (u64 @ 0x558b488)
  0x2609f80: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2609f84: adrp     x0, #0x558b000
  0x2609f88: ldr      x0, [x0, #0xca8] ; = 0x0 (u64 @ 0x558bca8)
  0x2609f8c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2609f90: adrp     x0, #0x559f000
  0x2609f94: ldr      x0, [x0, #0xed8] ; = 0x0 (u64 @ 0x559fed8)
  0x2609f98: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2609f9c: adrp     x0, #0x559f000
  0x2609fa0: ldr      x0, [x0, #0xee0] ; = 0x0 (u64 @ 0x559fee0)
  0x2609fa4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2609fa8: adrp     x0, #0x558a000
  0x2609fac: ldr      x0, [x0, #0x328] ; = 0x0 (u64 @ 0x558a328)
  0x2609fb0: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2609fb4: mov      w8, #1
  0x2609fb8: strb     w8, [x20, #0x97a]
  0x2609fbc: ldr      w8, [x19, #0x10]
  0x2609fc0: cmp      w8, #3
  0x2609fc4: b.hi     #0x260a224
  0x2609fc8: ldr      x20, [x19, #0x28]
  0x2609fcc: adrp     x9, #0x106e000
  0x2609fd0: add      x9, x9, #0x37c
  0x2609fd4: adr      x10, #0x2609fe4
  0x2609fd8: ldrb     w11, [x9, x8]
  0x2609fdc: add      x10, x10, x11, lsl #2
  0x2609fe0: br       x10
  0x2609fe4: ldr      w8, [x19, #0x20]
  0x2609fe8: mov      w9, #-1
  0x2609fec: str      w9, [x19, #0x10]
  0x2609ff0: str      w8, [x19, #0x38]
  0x2609ff4: cbz      x20, #0x260a304
  0x2609ff8: ldrb     w8, [x20, #0x98]
  0x2609ffc: cbnz     w8, #0x260a238
  0x260a000: adrp     x8, #0x559f000
  0x260a004: ldr      x8, [x8, #0xee0] ; = 0x0 (u64 @ 0x559fee0)
  0x260a008: ldr      x0, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x260a00c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x260a010: mov      x1, xzr
  0x260a014: mov      x22, x0
  0x260a018: bl       #0x49475a0 ; -> System.Object$$.ctor
  0x260a01c: mov      x21, x19
  0x260a020: str      x22, [x21, #0x30]!
  0x260a024: mov      x0, x21
  0x260a028: mov      x1, x22
  0x260a02c: bl       #0x21af920 ; -> ??? 0x21af920
  0x260a030: mov      w8, #1
  0x260a034: strb     w8, [x20, #0x98]
  0x260a038: ldr      x9, [x21]
  0x260a03c: cbz      x9, #0x260a304
  0x260a040: mov      x0, xzr
  0x260a044: strb     w8, [x9, #0x10]
  0x260a048: bl       #0x26cf64c ; -> CUIManager$$get_Instance
  0x260a04c: adrp     x22, #0x558b000
  0x260a050: ldr      x22, [x22, #0xca8] ; = 0x0 (u64 @ 0x558bca8)
  0x260a054: mov      x20, x0
  0x260a058: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558b000)
  0x260a05c: ldr      w9, [x8, #0xe0]
  0x260a060: cbnz     w9, #0x260a070
  0x260a064: mov      x0, x8
  0x260a068: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x260a06c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558b000)
  0x260a070: adrp     x9, #0x558b000
  0x260a074: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x559f0b8)
  0x260a078: ldr      x23, [x21]
  0x260a07c: ldr      x9, [x9, #0x488] ; = 0x0 (u64 @ 0x558b488)
  0x260a080: ldr      w21, [x8, #0x5ac]
  0x260a084: ldr      x0, [x9] ; = 0x0 (u64 @ 0x558b000)
  0x260a088: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x260a08c: adrp     x8, #0x559f000
  0x260a090: ldr      x8, [x8, #0xed8] ; = 0x0 (u64 @ 0x559fed8)
  0x260a094: mov      x1, x23
  0x260a098: mov      x3, xzr
  0x260a09c: mov      x22, x0
  0x260a0a0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x260a0a4: bl       #0x4870504 ; -> System.Action$$.ctor
  0x260a0a8: cbz      x20, #0x260a304
  0x260a0ac: fmov     s0, #2.00000000
  0x260a0b0: mov      x0, x20
  0x260a0b4: mov      w1, w21
  0x260a0b8: mov      x2, x22
  0x260a0bc: mov      x3, xzr
  0x260a0c0: bl       #0x26dc6cc ; -> CUIManager$$SimpleMessage
  0x260a0c4: b        #0x260a0d0
  0x260a0c8: mov      w8, #-1
  0x260a0cc: str      w8, [x19, #0x10]
  0x260a0d0: mov      x0, x19
  0x260a0d4: ldr      x8, [x0, #0x30]!
  0x260a0d8: cbz      x8, #0x260a304
  0x260a0dc: ldrb     w8, [x8, #0x10]
  0x260a0e0: cbz      w8, #0x260a22c
  0x260a0e4: str      xzr, [x19, #0x18]!
  0x260a0e8: mov      x0, x19
  0x260a0ec: mov      x1, xzr
  0x260a0f0: bl       #0x21af920 ; -> ??? 0x21af920
  0x260a0f4: mov      w0, #1
  0x260a0f8: stur     w0, [x19, #-8]
  0x260a0fc: b        #0x260a2f4
  0x260a100: mov      w8, #-1
  0x260a104: str      w8, [x19, #0x10]
  0x260a108: adrp     x21, #0x59d4000
  0x260a10c: ldrb     w8, [x21, #0xfc3]
  0x260a110: cbnz     w8, #0x260a128
  0x260a114: adrp     x0, #0x558a000
  0x260a118: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a11c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x260a120: mov      w8, #1
  0x260a124: strb     w8, [x21, #0xfc3]
  0x260a128: adrp     x22, #0x558a000
  0x260a12c: ldr      x22, [x22, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a130: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x260a134: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x559f0b8)
  0x260a138: ldr      x8, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x260a13c: cbz      x8, #0x260a304
  0x260a140: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x559f090)
  0x260a144: add      x20, x19, #0x38
  0x260a148: mov      x1, x20
  0x260a14c: mov      x2, xzr
  0x260a150: bl       #0x251e4e0 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|81_1
  0x260a154: ldrb     w8, [x21, #0xfc3]
  0x260a158: cbnz     w8, #0x260a170
  0x260a15c: adrp     x0, #0x558a000
  0x260a160: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a164: bl       #0x21af97c ; -> ??? 0x21af97c
  0x260a168: mov      w8, #1
  0x260a16c: strb     w8, [x21, #0xfc3]
  0x260a170: ldr      x8, [x22] ; = 0x0 (u64 @ 0x558a000)
  0x260a174: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x559f0b8)
  0x260a178: ldr      x8, [x8] ; = 0x0 (u64 @ 0x559f000)
  0x260a17c: cbz      x8, #0x260a304
  0x260a180: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x559f098)
  0x260a184: mov      x1, x20
  0x260a188: mov      x2, xzr
  0x260a18c: bl       #0x251e4e0 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|81_1
  0x260a190: adrp     x8, #0x558a000
  0x260a194: ldr      x8, [x8, #0x328] ; = 0x0 (u64 @ 0x558a328)
  0x260a198: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a19c: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x260a1a0: fmov     s0, #2.00000000
  0x260a1a4: mov      x1, xzr
  0x260a1a8: mov      x20, x0
  0x260a1ac: bl       #0x503d184 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x260a1b0: str      x20, [x19, #0x18]!
  0x260a1b4: mov      x0, x19
  0x260a1b8: mov      x1, x20
  0x260a1bc: bl       #0x21af920 ; -> ??? 0x21af920
  0x260a1c0: mov      w8, #3
  0x260a1c4: b        #0x260a2ec
  0x260a1c8: mov      w8, #-1
  0x260a1cc: str      w8, [x19, #0x10]
  0x260a1d0: adrp     x19, #0x59d4000
  0x260a1d4: ldrb     w8, [x19, #0xfc3]
  0x260a1d8: cbnz     w8, #0x260a1f0
  0x260a1dc: adrp     x0, #0x558a000
  0x260a1e0: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a1e4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x260a1e8: mov      w8, #1
  0x260a1ec: strb     w8, [x19, #0xfc3]
  0x260a1f0: adrp     x8, #0x558a000
  0x260a1f4: ldr      x8, [x8, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a1f8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a1fc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x260a200: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a204: cbz      x0, #0x260a304
  0x260a208: mov      x1, xzr
  0x260a20c: bl       #0x259f724 ; -> CDungeonScene$$UpdatePvpTurnPenalty
  0x260a210: cbz      x20, #0x260a304
  0x260a214: mov      w1, #7
  0x260a218: mov      x0, x20
  0x260a21c: mov      x2, xzr
  0x260a220: bl       #0x250b2cc ; -> CStateBattle$$ChangeSubState
  0x260a224: mov      w0, wzr
  0x260a228: b        #0x260a2f4
  0x260a22c: mov      x1, xzr
  0x260a230: str      xzr, [x0]
  0x260a234: bl       #0x21af920 ; -> ??? 0x21af920
  0x260a238: adrp     x20, #0x59d4000
  0x260a23c: ldrb     w8, [x20, #0xfc3]
  0x260a240: cbnz     w8, #0x260a258
  0x260a244: adrp     x0, #0x558a000
  0x260a248: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a24c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x260a250: mov      w8, #1
  0x260a254: strb     w8, [x20, #0xfc3]
  0x260a258: adrp     x21, #0x558a000
  0x260a25c: ldr      x21, [x21, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a260: ldr      x8, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x260a264: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x260a268: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a26c: cbz      x8, #0x260a304
  0x260a270: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x558a090)
  0x260a274: mov      x1, xzr
  0x260a278: bl       #0x251e2fc ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|81_0
  0x260a27c: ldrb     w8, [x20, #0xfc3]
  0x260a280: cbnz     w8, #0x260a298
  0x260a284: adrp     x0, #0x558a000
  0x260a288: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x260a28c: bl       #0x21af97c ; -> ??? 0x21af97c
  0x260a290: mov      w8, #1
  0x260a294: strb     w8, [x20, #0xfc3]
  0x260a298: ldr      x8, [x21] ; = 0x0 (u64 @ 0x558a000)
  0x260a29c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x558a0b8)
  0x260a2a0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a2a4: cbz      x8, #0x260a304
  0x260a2a8: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x558a098)
  0x260a2ac: mov      x1, xzr
  0x260a2b0: bl       #0x251e2fc ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|81_0
  0x260a2b4: adrp     x8, #0x558a000
  0x260a2b8: ldr      x8, [x8, #0x328] ; = 0x0 (u64 @ 0x558a328)
  0x260a2bc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x558a000)
  0x260a2c0: bl       #0x21afc08 ; -> ??? 0x21afc08
  0x260a2c4: adrp     x8, #0x106d000
  0x260a2c8: ldr      s0, [x8, #0x848] ; = 0.20000000298023224 (f32 @ 0x106d848)
  0x260a2cc: mov      x1, xzr
  0x260a2d0: mov      x20, x0
  0x260a2d4: bl       #0x503d184 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x260a2d8: str      x20, [x19, #0x18]!
  0x260a2dc: mov      x0, x19
  0x260a2e0: mov      x1, x20
  0x260a2e4: bl       #0x21af920 ; -> ??? 0x21af920
  0x260a2e8: mov      w8, #2
  0x260a2ec: stur     w8, [x19, #-8]
  0x260a2f0: mov      w0, #1
  0x260a2f4: ldp      x20, x19, [sp, #0x20]
  0x260a2f8: ldp      x22, x21, [sp, #0x10]
  0x260a2fc: ldp      x30, x23, [sp], #0x30
  0x260a300: ret      
  0x260a304: bl       #0x21afc18 ; -> ??? 0x21afc18
