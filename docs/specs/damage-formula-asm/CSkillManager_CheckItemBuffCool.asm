; jeu 1.4.14 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_CheckItemBuffCool @ 0x2513824..0x25138d8 (taille 180 octets) =====
  0x2513824: stp      x30, x21, [sp, #-0x20]!
  0x2513828: stp      x20, x19, [sp, #0x10]
  0x251382c: adrp     x21, #0x59d6000
  0x2513830: ldrb     w8, [x21, #0xb4]
  0x2513834: mov      x19, x1
  0x2513838: mov      x20, x0
  0x251383c: tbnz     w8, #0, #0x2513860
  0x2513840: adrp     x0, #0x5599000
  0x2513844: ldr      x0, [x0, #0x6a0] ; = 0x0 (u64 @ 0x55996a0)
  0x2513848: bl       #0x21af97c ; -> ??? 0x21af97c
  0x251384c: adrp     x0, #0x5599000
  0x2513850: ldr      x0, [x0, #0x6a8] ; = 0x0 (u64 @ 0x55996a8)
  0x2513854: bl       #0x21af97c ; -> ??? 0x21af97c
  0x2513858: mov      w8, #1
  0x251385c: strb     w8, [x21, #0xb4]
  0x2513860: cbz      x19, #0x25138d4
  0x2513864: ldr      x0, [x20, #0x68]
  0x2513868: cbz      x0, #0x25138d4
  0x251386c: adrp     x8, #0x5599000
  0x2513870: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x55996a0)
  0x2513874: ldr      x1, [x19, #0x18]
  0x2513878: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x251387c: bl       #0x4059654 ; -> System.Collections.Generic.Dictionary<object, object>$$ContainsKey
  0x2513880: tbz      w0, #0, #0x25138c4
  0x2513884: ldr      x0, [x20, #0x68]
  0x2513888: cbz      x0, #0x25138d4
  0x251388c: adrp     x8, #0x5599000
  0x2513890: ldr      x1, [x19, #0x18]
  0x2513894: ldr      x8, [x8, #0x6a8] ; = 0x0 (u64 @ 0x55996a8)
  0x2513898: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x251389c: bl       #0x40593e0 ; -> System.Collections.Generic.Dictionary<object, object>$$get_Item
  0x25138a0: cbz      x0, #0x25138d4
  0x25138a4: ldr      w8, [x0, #0x18]
  0x25138a8: cbz      w8, #0x25138c0
  0x25138ac: ldr      w9, [x0, #0x20]
  0x25138b0: cmp      w9, w8
  0x25138b4: b.ge     #0x25138c0
  0x25138b8: mov      w0, wzr
  0x25138bc: b        #0x25138c8
  0x25138c0: str      wzr, [x0, #0x20]
  0x25138c4: mov      w0, #1
  0x25138c8: ldp      x20, x19, [sp, #0x10]
  0x25138cc: ldp      x30, x21, [sp], #0x20
  0x25138d0: ret      
  0x25138d4: bl       #0x21afc18 ; -> ??? 0x21afc18
