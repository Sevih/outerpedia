; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_PiercePower @ 0x29095cc..0x29096a8 (taille 220 octets) =====
  0x29095cc: str      x30, [sp, #-0x20]!
  0x29095d0: stp      x20, x19, [sp, #0x10]
  0x29095d4: adrp     x20, #0x59e7000
  0x29095d8: ldrb     w8, [x20, #0xe7e]
  0x29095dc: mov      x19, x0
  0x29095e0: tbnz     w8, #0, #0x2909604
  0x29095e4: adrp     x0, #0x55c5000
  0x29095e8: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29095ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29095f0: adrp     x0, #0x55c5000
  0x29095f4: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29095f8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29095fc: mov      w8, #1
  0x2909600: strb     w8, [x20, #0xe7e]
  0x2909604: ldrb     w8, [x19, #0x28]
  0x2909608: cbz      w8, #0x2909614
  0x290960c: mov      x0, x19
  0x2909610: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x2909614: ldr      x0, [x19, #0x40]
  0x2909618: cbz      x0, #0x29096a4
  0x290961c: adrp     x8, #0x55c5000
  0x2909620: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909624: mov      w1, #9
  0x2909628: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x290962c: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2909630: cbz      x0, #0x29096a4
  0x2909634: adrp     x10, #0x55c5000
  0x2909638: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x290963c: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2909640: mov      x19, x0
  0x2909644: ldrh     w9, [x8, #0x12e]
  0x2909648: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x290964c: cbz      x9, #0x2909670
  0x2909650: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2909654: add      x10, x10, #8
  0x2909658: ldur     x11, [x10, #-8]
  0x290965c: cmp      x11, x1
  0x2909660: b.eq     #0x2909680
  0x2909664: subs     x9, x9, #1
  0x2909668: add      x10, x10, #0x10
  0x290966c: b.ne     #0x2909658
  0x2909670: mov      w2, #1
  0x2909674: mov      x0, x19
  0x2909678: bl       #0x2215130 ; -> ??? 0x2215130
  0x290967c: b        #0x2909690
  0x2909680: ldr      w9, [x10]
  0x2909684: add      w9, w9, #1
  0x2909688: add      x8, x8, w9, sxtw #4
  0x290968c: add      x0, x8, #0x138
  0x2909690: ldp      x2, x1, [x0]
  0x2909694: mov      x0, x19
  0x2909698: ldp      x20, x19, [sp, #0x10]
  0x290969c: ldr      x30, [sp], #0x20
  0x29096a0: br       x2
  0x29096a4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
