; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcTranscendentStarStats @ 0x290eb50..0x290ed9c (taille 588 octets) =====
  0x290eb50: str      x30, [sp, #-0x40]!
  0x290eb54: stp      x24, x23, [sp, #0x10]
  0x290eb58: stp      x22, x21, [sp, #0x20]
  0x290eb5c: stp      x20, x19, [sp, #0x30]
  0x290eb60: adrp     x20, #0x59e7000
  0x290eb64: adrp     x21, #0x5598000
  0x290eb68: ldrb     w8, [x20, #0xea4]
  0x290eb6c: ldr      x21, [x21, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290eb70: mov      x19, x0
  0x290eb74: tbnz     w8, #0, #0x290eba4
  0x290eb78: adrp     x0, #0x5598000
  0x290eb7c: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290eb80: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290eb84: adrp     x0, #0x55c5000
  0x290eb88: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290eb8c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290eb90: adrp     x0, #0x55c5000
  0x290eb94: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290eb98: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290eb9c: mov      w8, #1
  0x290eba0: strb     w8, [x20, #0xea4]
  0x290eba4: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x290eba8: ldr      w8, [x0, #0xe0]
  0x290ebac: cbnz     w8, #0x290ebb4
  0x290ebb0: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x290ebb4: mov      x0, xzr
  0x290ebb8: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x290ebbc: ldr      x8, [x19, #0xf0]
  0x290ebc0: cbz      x8, #0x290ed98
  0x290ebc4: cbz      x0, #0x290ed98
  0x290ebc8: ldr      w3, [x8, #0x10]
  0x290ebcc: ldrb     w2, [x19, #0x98]
  0x290ebd0: ldrb     w1, [x8, #0x54]
  0x290ebd4: mov      x4, xzr
  0x290ebd8: bl       #0x2630e40 ; -> CTempletManager$$GetCharacterTranscendent
  0x290ebdc: cbz      x0, #0x290ec54
  0x290ebe0: mov      x20, x0
  0x290ebe4: ldr      x0, [x19, #0x40]
  0x290ebe8: cbz      x0, #0x290ed98
  0x290ebec: adrp     x23, #0x55c5000
  0x290ebf0: ldr      x23, [x23, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290ebf4: mov      w1, #1
  0x290ebf8: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ebfc: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290ec00: cbz      x0, #0x290ed98
  0x290ec04: adrp     x24, #0x55c5000
  0x290ec08: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290ec0c: ldr      x24, [x24, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290ec10: ldr      w22, [x20, #0x30]
  0x290ec14: mov      x21, x0
  0x290ec18: ldrh     w9, [x8, #0x12e]
  0x290ec1c: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290ec20: cbz      x9, #0x290ec44
  0x290ec24: ldr      x10, [x8, #0xb0]
  0x290ec28: add      x10, x10, #8
  0x290ec2c: ldur     x11, [x10, #-8]
  0x290ec30: cmp      x11, x1
  0x290ec34: b.eq     #0x290ec68
  0x290ec38: subs     x9, x9, #1
  0x290ec3c: add      x10, x10, #0x10
  0x290ec40: b.ne     #0x290ec2c
  0x290ec44: mov      w2, #0xc
  0x290ec48: mov      x0, x21
  0x290ec4c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ec50: b        #0x290ec78
  0x290ec54: ldp      x20, x19, [sp, #0x30]
  0x290ec58: ldp      x22, x21, [sp, #0x20]
  0x290ec5c: ldp      x24, x23, [sp, #0x10]
  0x290ec60: ldr      x30, [sp], #0x40
  0x290ec64: ret      
  0x290ec68: ldr      w9, [x10]
  0x290ec6c: add      w9, w9, #0xc
  0x290ec70: add      x8, x8, w9, sxtw #4
  0x290ec74: add      x0, x8, #0x138
  0x290ec78: ldp      x8, x2, [x0]
  0x290ec7c: mov      x0, x21
  0x290ec80: mov      w1, w22
  0x290ec84: blr      x8
  0x290ec88: ldr      x0, [x19, #0x40]
  0x290ec8c: cbz      x0, #0x290ed98
  0x290ec90: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ec94: mov      w1, #4
  0x290ec98: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290ec9c: cbz      x0, #0x290ed98
  0x290eca0: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290eca4: ldr      w22, [x20, #0x34]
  0x290eca8: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290ecac: mov      x21, x0
  0x290ecb0: ldrh     w9, [x8, #0x12e]
  0x290ecb4: cbz      x9, #0x290ecd8
  0x290ecb8: ldr      x10, [x8, #0xb0]
  0x290ecbc: add      x10, x10, #8
  0x290ecc0: ldur     x11, [x10, #-8]
  0x290ecc4: cmp      x11, x1
  0x290ecc8: b.eq     #0x290ece8
  0x290eccc: subs     x9, x9, #1
  0x290ecd0: add      x10, x10, #0x10
  0x290ecd4: b.ne     #0x290ecc0
  0x290ecd8: mov      w2, #0xc
  0x290ecdc: mov      x0, x21
  0x290ece0: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ece4: b        #0x290ecf8
  0x290ece8: ldr      w9, [x10]
  0x290ecec: add      w9, w9, #0xc
  0x290ecf0: add      x8, x8, w9, sxtw #4
  0x290ecf4: add      x0, x8, #0x138
  0x290ecf8: ldp      x8, x2, [x0]
  0x290ecfc: mov      x0, x21
  0x290ed00: mov      w1, w22
  0x290ed04: blr      x8
  0x290ed08: ldr      x0, [x19, #0x40]
  0x290ed0c: cbz      x0, #0x290ed98
  0x290ed10: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ed14: mov      w1, #5
  0x290ed18: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290ed1c: cbz      x0, #0x290ed98
  0x290ed20: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290ed24: ldr      w20, [x20, #0x38]
  0x290ed28: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290ed2c: mov      x19, x0
  0x290ed30: ldrh     w9, [x8, #0x12e]
  0x290ed34: cbz      x9, #0x290ed58
  0x290ed38: ldr      x10, [x8, #0xb0]
  0x290ed3c: add      x10, x10, #8
  0x290ed40: ldur     x11, [x10, #-8]
  0x290ed44: cmp      x11, x1
  0x290ed48: b.eq     #0x290ed68
  0x290ed4c: subs     x9, x9, #1
  0x290ed50: add      x10, x10, #0x10
  0x290ed54: b.ne     #0x290ed40
  0x290ed58: mov      w2, #0xc
  0x290ed5c: mov      x0, x19
  0x290ed60: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ed64: b        #0x290ed78
  0x290ed68: ldr      w9, [x10]
  0x290ed6c: add      w9, w9, #0xc
  0x290ed70: add      x8, x8, w9, sxtw #4
  0x290ed74: add      x0, x8, #0x138
  0x290ed78: ldp      x3, x2, [x0]
  0x290ed7c: mov      x0, x19
  0x290ed80: mov      w1, w20
  0x290ed84: ldp      x20, x19, [sp, #0x30]
  0x290ed88: ldp      x22, x21, [sp, #0x20]
  0x290ed8c: ldp      x24, x23, [sp, #0x10]
  0x290ed90: ldr      x30, [sp], #0x40
  0x290ed94: br       x3
  0x290ed98: bl       #0x21b4d20 ; -> ??? 0x21b4d20
