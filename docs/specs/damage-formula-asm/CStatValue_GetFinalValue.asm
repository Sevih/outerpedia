; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStatValue_GetFinalValue @ 0x2a064e0..0x2a06684 (taille 420 octets) =====
  0x2a064e0: str      x30, [sp, #-0x30]!
  0x2a064e4: stp      x22, x21, [sp, #0x10]
  0x2a064e8: stp      x20, x19, [sp, #0x20]
  0x2a064ec: adrp     x20, #0x59e8000
  0x2a064f0: adrp     x22, #0x5599000
  0x2a064f4: ldrb     w8, [x20, #0x5e4]
  0x2a064f8: ldr      x22, [x22, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a064fc: mov      x19, x0
  0x2a06500: tbnz     w8, #0, #0x2a06530
  0x2a06504: adrp     x0, #0x55c5000
  0x2a06508: ldr      x0, [x0, #0x568] ; = 0x0 (u64 @ 0x55c5568)
  0x2a0650c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06510: adrp     x0, #0x5596000
  0x2a06514: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2a06518: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a0651c: adrp     x0, #0x5599000
  0x2a06520: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x5599038)
  0x2a06524: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06528: mov      w8, #1
  0x2a0652c: strb     w8, [x20, #0x5e4]
  0x2a06530: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2a06534: str      wzr, [sp, #0xc]
  0x2a06538: ldur     x20, [x19, #0x74]
  0x2a0653c: ldr      w21, [x19, #0x7c]
  0x2a06540: ldr      w8, [x0, #0xe0]
  0x2a06544: cbnz     w8, #0x2a0654c
  0x2a06548: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a0654c: mov      x0, x20
  0x2a06550: mov      x1, x21
  0x2a06554: mov      x2, xzr
  0x2a06558: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a0655c: cmn      w0, #1
  0x2a06560: b.eq     #0x2a06590
  0x2a06564: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5599000)
  0x2a06568: ldur     x20, [x19, #0x74]
  0x2a0656c: ldr      w19, [x19, #0x7c]
  0x2a06570: ldr      w8, [x0, #0xe0]
  0x2a06574: cbnz     w8, #0x2a0657c
  0x2a06578: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a0657c: mov      x0, x20
  0x2a06580: mov      x1, x19
  0x2a06584: mov      x2, xzr
  0x2a06588: bl       #0x2cc0314 ; -> SVAInt$$op_Implicit
  0x2a0658c: b        #0x2a06670
  0x2a06590: ldrb     w8, [x19, #0xe0]
  0x2a06594: cbz      w8, #0x2a065a0
  0x2a06598: mov      x0, x19
  0x2a0659c: bl       #0x2a05fd8 ; -> CStatValue$$SetFinalValue
  0x2a065a0: adrp     x21, #0x59e4000
  0x2a065a4: ldrb     w8, [x21, #0xbd3]
  0x2a065a8: cbnz     w8, #0x2a065c0
  0x2a065ac: adrp     x0, #0x5598000
  0x2a065b0: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2a065b4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a065b8: mov      w8, #1
  0x2a065bc: strb     w8, [x21, #0xbd3]
  0x2a065c0: adrp     x22, #0x5598000
  0x2a065c4: ldr      x22, [x22, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2a065c8: adrp     x9, #0x5596000
  0x2a065cc: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2a065d0: ldr      x9, [x9, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x2a065d4: ldr      x8, [x8, #0xb8]
  0x2a065d8: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5596000)
  0x2a065dc: ldr      x20, [x8]
  0x2a065e0: ldr      w9, [x0, #0xe0]
  0x2a065e4: cbnz     w9, #0x2a065ec
  0x2a065e8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2a065ec: mov      x0, x20
  0x2a065f0: mov      x1, xzr
  0x2a065f4: mov      x2, xzr
  0x2a065f8: bl       #0x5045a3c ; -> UnityEngine.Object$$op_Inequality
  0x2a065fc: tbz      w0, #0, #0x2a06668
  0x2a06600: ldrb     w8, [x21, #0xbd3]
  0x2a06604: cbnz     w8, #0x2a0661c
  0x2a06608: adrp     x0, #0x5598000
  0x2a0660c: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2a06610: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2a06614: mov      w8, #1
  0x2a06618: strb     w8, [x21, #0xbd3]
  0x2a0661c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5598000)
  0x2a06620: ldr      x8, [x8, #0xb8]
  0x2a06624: ldr      x8, [x8]
  0x2a06628: cbz      x8, #0x2a06680
  0x2a0662c: ldr      x0, [x8, #0x168]
  0x2a06630: cbz      x0, #0x2a06680
  0x2a06634: adrp     x8, #0x55c5000
  0x2a06638: ldr      w1, [x19, #0x10]
  0x2a0663c: ldr      x8, [x8, #0x568] ; = 0x0 (u64 @ 0x55c5568)
  0x2a06640: add      x2, sp, #0xc
  0x2a06644: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2a06648: bl       #0x4021214 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$TryGetValue
  0x2a0664c: tbz      w0, #0, #0x2a06668
  0x2a06650: mov      x0, x19
  0x2a06654: bl       #0x2a0436c ; -> CStatValue$$get_m_nFinalValue
  0x2a06658: ldr      w8, [sp, #0xc]
  0x2a0665c: cmp      w0, w8
  0x2a06660: csel     w0, w0, w8, lt
  0x2a06664: b        #0x2a06670
  0x2a06668: mov      x0, x19
  0x2a0666c: bl       #0x2a0436c ; -> CStatValue$$get_m_nFinalValue
  0x2a06670: ldp      x20, x19, [sp, #0x20]
  0x2a06674: ldp      x22, x21, [sp, #0x10]
  0x2a06678: ldr      x30, [sp], #0x30
  0x2a0667c: ret      
  0x2a06680: bl       #0x21b4d20 ; -> ??? 0x21b4d20
