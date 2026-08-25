; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CSkillManager_CheckItemBuffCool @ 0x25152b8..0x251536c (taille 180 octets) =====
  0x25152b8: stp      x30, x21, [sp, #-0x20]!
  0x25152bc: stp      x20, x19, [sp, #0x10]
  0x25152c0: adrp     x21, #0x59e5000
  0x25152c4: ldrb     w8, [x21, #0xcab]
  0x25152c8: mov      x19, x1
  0x25152cc: mov      x20, x0
  0x25152d0: tbnz     w8, #0, #0x25152f4
  0x25152d4: adrp     x0, #0x55a8000
  0x25152d8: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x55a8030)
  0x25152dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25152e0: adrp     x0, #0x55a8000
  0x25152e4: ldr      x0, [x0, #0x38] ; = 0x0 (u64 @ 0x55a8038)
  0x25152e8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25152ec: mov      w8, #1
  0x25152f0: strb     w8, [x21, #0xcab]
  0x25152f4: cbz      x19, #0x2515368
  0x25152f8: ldr      x0, [x20, #0x68]
  0x25152fc: cbz      x0, #0x2515368
  0x2515300: adrp     x8, #0x55a8000
  0x2515304: ldr      x8, [x8, #0x30] ; = 0x0 (u64 @ 0x55a8030)
  0x2515308: ldr      x1, [x19, #0x18]
  0x251530c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55a8000)
  0x2515310: bl       #0x4067f58 ; -> System.Collections.Generic.Dictionary<object, object>$$ContainsKey
  0x2515314: tbz      w0, #0, #0x2515358
  0x2515318: ldr      x0, [x20, #0x68]
  0x251531c: cbz      x0, #0x2515368
  0x2515320: adrp     x8, #0x55a8000
  0x2515324: ldr      x1, [x19, #0x18]
  0x2515328: ldr      x8, [x8, #0x38] ; = 0x0 (u64 @ 0x55a8038)
  0x251532c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55a8000)
  0x2515330: bl       #0x4067ce4 ; -> System.Collections.Generic.Dictionary<object, object>$$get_Item
  0x2515334: cbz      x0, #0x2515368
  0x2515338: ldr      w8, [x0, #0x18]
  0x251533c: cbz      w8, #0x2515354
  0x2515340: ldr      w9, [x0, #0x20]
  0x2515344: cmp      w9, w8
  0x2515348: b.ge     #0x2515354
  0x251534c: mov      w0, wzr
  0x2515350: b        #0x251535c
  0x2515354: str      wzr, [x0, #0x20]
  0x2515358: mov      w0, #1
  0x251535c: ldp      x20, x19, [sp, #0x10]
  0x2515360: ldp      x30, x21, [sp], #0x20
  0x2515364: ret      
  0x2515368: bl       #0x21b4d20 ; -> ??? 0x21b4d20
