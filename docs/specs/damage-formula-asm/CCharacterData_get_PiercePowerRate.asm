; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_get_PiercePowerRate @ 0x29096a8..0x2909784 (taille 220 octets) =====
  0x29096a8: str      x30, [sp, #-0x20]!
  0x29096ac: stp      x20, x19, [sp, #0x10]
  0x29096b0: adrp     x20, #0x59e7000
  0x29096b4: ldrb     w8, [x20, #0xe7f]
  0x29096b8: mov      x19, x0
  0x29096bc: tbnz     w8, #0, #0x29096e0
  0x29096c0: adrp     x0, #0x55c5000
  0x29096c4: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29096c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29096cc: adrp     x0, #0x55c5000
  0x29096d0: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29096d4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29096d8: mov      w8, #1
  0x29096dc: strb     w8, [x20, #0xe7f]
  0x29096e0: ldrb     w8, [x19, #0x28]
  0x29096e4: cbz      w8, #0x29096f0
  0x29096e8: mov      x0, x19
  0x29096ec: bl       #0x290b9f4 ; -> CCharacterData$$CalcStat
  0x29096f0: ldr      x0, [x19, #0x40]
  0x29096f4: cbz      x0, #0x2909780
  0x29096f8: adrp     x8, #0x55c5000
  0x29096fc: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2909700: mov      w1, #0xa
  0x2909704: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2909708: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x290970c: cbz      x0, #0x2909780
  0x2909710: adrp     x10, #0x55c5000
  0x2909714: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2909718: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x290971c: mov      x19, x0
  0x2909720: ldrh     w9, [x8, #0x12e]
  0x2909724: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2909728: cbz      x9, #0x290974c
  0x290972c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2909730: add      x10, x10, #8
  0x2909734: ldur     x11, [x10, #-8]
  0x2909738: cmp      x11, x1
  0x290973c: b.eq     #0x290975c
  0x2909740: subs     x9, x9, #1
  0x2909744: add      x10, x10, #0x10
  0x2909748: b.ne     #0x2909734
  0x290974c: mov      w2, #1
  0x2909750: mov      x0, x19
  0x2909754: bl       #0x2215130 ; -> ??? 0x2215130
  0x2909758: b        #0x290976c
  0x290975c: ldr      w9, [x10]
  0x2909760: add      w9, w9, #1
  0x2909764: add      x8, x8, w9, sxtw #4
  0x2909768: add      x0, x8, #0x138
  0x290976c: ldp      x2, x1, [x0]
  0x2909770: mov      x0, x19
  0x2909774: ldp      x20, x19, [sp, #0x10]
  0x2909778: ldr      x30, [sp], #0x20
  0x290977c: br       x2
  0x2909780: bl       #0x21b4d20 ; -> ??? 0x21b4d20
