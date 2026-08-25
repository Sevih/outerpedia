; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_CalcArchiveStats @ 0x290ed9c..0x290efd8 (taille 572 octets) =====
  0x290ed9c: str      x30, [sp, #-0x40]!
  0x290eda0: stp      x24, x23, [sp, #0x10]
  0x290eda4: stp      x22, x21, [sp, #0x20]
  0x290eda8: stp      x20, x19, [sp, #0x30]
  0x290edac: adrp     x20, #0x59e7000
  0x290edb0: adrp     x21, #0x5598000
  0x290edb4: ldrb     w8, [x20, #0xea5]
  0x290edb8: ldr      x21, [x21, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290edbc: mov      x19, x0
  0x290edc0: tbnz     w8, #0, #0x290edf0
  0x290edc4: adrp     x0, #0x5598000
  0x290edc8: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x290edcc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290edd0: adrp     x0, #0x55c5000
  0x290edd4: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290edd8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290eddc: adrp     x0, #0x55c5000
  0x290ede0: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290ede4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x290ede8: mov      w8, #1
  0x290edec: strb     w8, [x20, #0xea5]
  0x290edf0: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x290edf4: ldr      w8, [x0, #0xe0]
  0x290edf8: cbnz     w8, #0x290ee00
  0x290edfc: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x290ee00: mov      x0, xzr
  0x290ee04: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x290ee08: cbz      x0, #0x290efd4
  0x290ee0c: ldr      w1, [x19, #0xc8]
  0x290ee10: mov      x2, xzr
  0x290ee14: bl       #0x2632c10 ; -> CTempletManager$$GetCharacterArchiveStatTemplet
  0x290ee18: cbz      x0, #0x290ee90
  0x290ee1c: mov      x20, x0
  0x290ee20: ldr      x0, [x19, #0x40]
  0x290ee24: cbz      x0, #0x290efd4
  0x290ee28: adrp     x23, #0x55c5000
  0x290ee2c: ldr      x23, [x23, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x290ee30: mov      w1, #4
  0x290ee34: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ee38: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290ee3c: cbz      x0, #0x290efd4
  0x290ee40: adrp     x24, #0x55c5000
  0x290ee44: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290ee48: ldr      x24, [x24, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290ee4c: ldrh     w22, [x20, #0x14]
  0x290ee50: mov      x21, x0
  0x290ee54: ldrh     w9, [x8, #0x12e]
  0x290ee58: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290ee5c: cbz      x9, #0x290ee80
  0x290ee60: ldr      x10, [x8, #0xb0]
  0x290ee64: add      x10, x10, #8
  0x290ee68: ldur     x11, [x10, #-8]
  0x290ee6c: cmp      x11, x1
  0x290ee70: b.eq     #0x290eea4
  0x290ee74: subs     x9, x9, #1
  0x290ee78: add      x10, x10, #0x10
  0x290ee7c: b.ne     #0x290ee68
  0x290ee80: mov      w2, #0xd
  0x290ee84: mov      x0, x21
  0x290ee88: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ee8c: b        #0x290eeb4
  0x290ee90: ldp      x20, x19, [sp, #0x30]
  0x290ee94: ldp      x22, x21, [sp, #0x20]
  0x290ee98: ldp      x24, x23, [sp, #0x10]
  0x290ee9c: ldr      x30, [sp], #0x40
  0x290eea0: ret      
  0x290eea4: ldr      w9, [x10]
  0x290eea8: add      w9, w9, #0xd
  0x290eeac: add      x8, x8, w9, sxtw #4
  0x290eeb0: add      x0, x8, #0x138
  0x290eeb4: ldp      x8, x2, [x0]
  0x290eeb8: mov      x0, x21
  0x290eebc: mov      w1, w22
  0x290eec0: blr      x8
  0x290eec4: ldr      x0, [x19, #0x40]
  0x290eec8: cbz      x0, #0x290efd4
  0x290eecc: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290eed0: mov      w1, #5
  0x290eed4: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290eed8: cbz      x0, #0x290efd4
  0x290eedc: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290eee0: ldrh     w22, [x20, #0x16]
  0x290eee4: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290eee8: mov      x21, x0
  0x290eeec: ldrh     w9, [x8, #0x12e]
  0x290eef0: cbz      x9, #0x290ef14
  0x290eef4: ldr      x10, [x8, #0xb0]
  0x290eef8: add      x10, x10, #8
  0x290eefc: ldur     x11, [x10, #-8]
  0x290ef00: cmp      x11, x1
  0x290ef04: b.eq     #0x290ef24
  0x290ef08: subs     x9, x9, #1
  0x290ef0c: add      x10, x10, #0x10
  0x290ef10: b.ne     #0x290eefc
  0x290ef14: mov      w2, #0xd
  0x290ef18: mov      x0, x21
  0x290ef1c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290ef20: b        #0x290ef34
  0x290ef24: ldr      w9, [x10]
  0x290ef28: add      w9, w9, #0xd
  0x290ef2c: add      x8, x8, w9, sxtw #4
  0x290ef30: add      x0, x8, #0x138
  0x290ef34: ldp      x8, x2, [x0]
  0x290ef38: mov      x0, x21
  0x290ef3c: mov      w1, w22
  0x290ef40: blr      x8
  0x290ef44: ldr      x0, [x19, #0x40]
  0x290ef48: cbz      x0, #0x290efd4
  0x290ef4c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x55c5000)
  0x290ef50: mov      w1, #1
  0x290ef54: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290ef58: cbz      x0, #0x290efd4
  0x290ef5c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290ef60: ldr      w20, [x20, #0x18]
  0x290ef64: ldr      x1, [x24] ; = 0x0 (u64 @ 0x55c5000)
  0x290ef68: mov      x19, x0
  0x290ef6c: ldrh     w9, [x8, #0x12e]
  0x290ef70: cbz      x9, #0x290ef94
  0x290ef74: ldr      x10, [x8, #0xb0]
  0x290ef78: add      x10, x10, #8
  0x290ef7c: ldur     x11, [x10, #-8]
  0x290ef80: cmp      x11, x1
  0x290ef84: b.eq     #0x290efa4
  0x290ef88: subs     x9, x9, #1
  0x290ef8c: add      x10, x10, #0x10
  0x290ef90: b.ne     #0x290ef7c
  0x290ef94: mov      w2, #0xd
  0x290ef98: mov      x0, x19
  0x290ef9c: bl       #0x2215130 ; -> ??? 0x2215130
  0x290efa0: b        #0x290efb4
  0x290efa4: ldr      w9, [x10]
  0x290efa8: add      w9, w9, #0xd
  0x290efac: add      x8, x8, w9, sxtw #4
  0x290efb0: add      x0, x8, #0x138
  0x290efb4: ldp      x3, x2, [x0]
  0x290efb8: mov      x0, x19
  0x290efbc: mov      w1, w20
  0x290efc0: ldp      x20, x19, [sp, #0x30]
  0x290efc4: ldp      x22, x21, [sp, #0x20]
  0x290efc8: ldp      x24, x23, [sp, #0x10]
  0x290efcc: ldr      x30, [sp], #0x40
  0x290efd0: br       x3
  0x290efd4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
