; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CFormula_IsIgnoreTurnLimitDamage @ 0x2cb35a8..0x2cb36fc (taille 340 octets) =====
  0x2cb35a8: stp      x30, x23, [sp, #-0x30]!
  0x2cb35ac: stp      x22, x21, [sp, #0x10]
  0x2cb35b0: stp      x20, x19, [sp, #0x20]
  0x2cb35b4: adrp     x20, #0x59da000
  0x2cb35b8: ldrb     w8, [x20, #0x117]
  0x2cb35bc: mov      x19, x0
  0x2cb35c0: tbnz     w8, #0, #0x2cb35d8
  0x2cb35c4: adrp     x0, #0x5587000
  0x2cb35c8: ldr      x0, [x0, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb35cc: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb35d0: mov      w8, #1
  0x2cb35d4: strb     w8, [x20, #0x117]
  0x2cb35d8: adrp     x22, #0x59d4000
  0x2cb35dc: adrp     x21, #0x5587000
  0x2cb35e0: ldrb     w8, [x22, #0xfc3]
  0x2cb35e4: ldr      x21, [x21, #0xb30] ; = 0x0 (u64 @ 0x5587b30)
  0x2cb35e8: cbnz     w8, #0x2cb3600
  0x2cb35ec: adrp     x0, #0x558a000
  0x2cb35f0: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb35f4: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb35f8: mov      w8, #1
  0x2cb35fc: strb     w8, [x22, #0xfc3]
  0x2cb3600: adrp     x23, #0x558a000
  0x2cb3604: ldr      x23, [x23, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb3608: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5587000)
  0x2cb360c: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3610: ldr      w9, [x0, #0xe0]
  0x2cb3614: ldr      x8, [x8, #0xb8]
  0x2cb3618: ldr      x20, [x8]
  0x2cb361c: cbnz     w9, #0x2cb3624
  0x2cb3620: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb3624: mov      x0, x20
  0x2cb3628: mov      x1, xzr
  0x2cb362c: mov      x2, xzr
  0x2cb3630: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb3634: tbz      w0, #0, #0x2cb36e4
  0x2cb3638: ldrb     w8, [x22, #0xfc3]
  0x2cb363c: cbnz     w8, #0x2cb3654
  0x2cb3640: adrp     x0, #0x558a000
  0x2cb3644: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb3648: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb364c: mov      w8, #1
  0x2cb3650: strb     w8, [x22, #0xfc3]
  0x2cb3654: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3658: ldr      x8, [x8, #0xb8]
  0x2cb365c: ldr      x0, [x8]
  0x2cb3660: cbz      x0, #0x2cb36f8
  0x2cb3664: mov      x1, xzr
  0x2cb3668: bl       #0x25958b8 ; -> CDungeonScene$$get_IsWorldBoss
  0x2cb366c: tbz      w0, #0, #0x2cb36e4
  0x2cb3670: ldrb     w8, [x22, #0xfc3]
  0x2cb3674: cbnz     w8, #0x2cb368c
  0x2cb3678: adrp     x0, #0x558a000
  0x2cb367c: ldr      x0, [x0, #0x248] ; = 0x0 (u64 @ 0x558a248)
  0x2cb3680: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2cb3684: mov      w8, #1
  0x2cb3688: strb     w8, [x22, #0xfc3]
  0x2cb368c: ldr      x8, [x23] ; = 0x0 (u64 @ 0x558a000)
  0x2cb3690: ldr      x8, [x8, #0xb8]
  0x2cb3694: ldr      x8, [x8]
  0x2cb3698: cbz      x8, #0x2cb36f8
  0x2cb369c: ldrb     w8, [x8, #0x34]
  0x2cb36a0: cbz      w8, #0x2cb36e4
  0x2cb36a4: ldr      x0, [x21] ; = 0x0 (u64 @ 0x5587000)
  0x2cb36a8: ldr      w8, [x0, #0xe0]
  0x2cb36ac: cbnz     w8, #0x2cb36b4
  0x2cb36b0: bl       #0x21afaf4 ; -> ??? 0x21afaf4
  0x2cb36b4: mov      x0, x19
  0x2cb36b8: mov      x1, xzr
  0x2cb36bc: mov      x2, xzr
  0x2cb36c0: bl       #0x5037138 ; -> UnityEngine.Object$$op_Inequality
  0x2cb36c4: tbz      w0, #0, #0x2cb36e4
  0x2cb36c8: cbz      x19, #0x2cb36f8
  0x2cb36cc: mov      x0, x19
  0x2cb36d0: mov      x1, xzr
  0x2cb36d4: bl       #0x270d244 ; -> CCharacter$$get_UID
  0x2cb36d8: cmp      x0, #0
  0x2cb36dc: cset     w0, eq
  0x2cb36e0: b        #0x2cb36e8
  0x2cb36e4: mov      w0, wzr
  0x2cb36e8: ldp      x20, x19, [sp, #0x20]
  0x2cb36ec: ldp      x22, x21, [sp, #0x10]
  0x2cb36f0: ldp      x30, x23, [sp], #0x30
  0x2cb36f4: ret      
  0x2cb36f8: bl       #0x21afc18 ; -> ??? 0x21afc18
