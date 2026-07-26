; ===== CBuff_get_Value @ 0x22f4b38..0x22f4b5c (taille 36 octets) =====
  0x22f4b38: str      x30, [sp, #-0x10]!
  0x22f4b3c: ldr      x8, [x0, #0x10]
  0x22f4b40: cbz      x8, #0x22f4b58
  0x22f4b44: ldr      w8, [x8, #0x54]
  0x22f4b48: ldr      w9, [x0, #0x30]
  0x22f4b4c: mul      w0, w9, w8
  0x22f4b50: ldr      x30, [sp], #0x10
  0x22f4b54: ret      
  0x22f4b58: bl       #0x21849c0 ; -> ??? 0x21849c0
