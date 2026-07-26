; ===== CItem_GetSingularityFactor @ 0x23106ac..0x23107fc (taille 336 octets) =====
  0x23106ac: str      d8, [sp, #-0x30]!
  0x23106b0: str      x30, [sp, #8]
  0x23106b4: stp      x22, x21, [sp, #0x10]
  0x23106b8: stp      x20, x19, [sp, #0x20]
  0x23106bc: adrp     x22, #0x5955000
  0x23106c0: ldrb     w8, [x22, #0x9a9]
  0x23106c4: mov      w19, w2
  0x23106c8: mov      w21, w1
  0x23106cc: mov      x20, x0
  0x23106d0: tbnz     w8, #0, #0x2310700
  0x23106d4: adrp     x0, #0x5511000
  0x23106d8: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x23106dc: bl       #0x2184724 ; -> ??? 0x2184724
  0x23106e0: adrp     x0, #0x5512000
  0x23106e4: ldr      x0, [x0, #0xc68] ; = 0x0 (u64 @ 0x5512c68)
  0x23106e8: bl       #0x2184724 ; -> ??? 0x2184724
  0x23106ec: adrp     x0, #0x5512000
  0x23106f0: ldr      x0, [x0, #0xc70] ; = 0x0 (u64 @ 0x5512c70)
  0x23106f4: bl       #0x2184724 ; -> ??? 0x2184724
  0x23106f8: mov      w8, #1
  0x23106fc: strb     w8, [x22, #0x9a9]
  0x2310700: tst      w21, #0xff
  0x2310704: b.eq     #0x231078c
  0x2310708: adrp     x8, #0x5511000
  0x231070c: ldr      x8, [x8, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2310710: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2310714: ldr      w8, [x0, #0xe0]
  0x2310718: cbnz     w8, #0x2310720
  0x231071c: bl       #0x218489c ; -> ??? 0x218489c
  0x2310720: mov      x0, xzr
  0x2310724: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x2310728: ldr      x8, [x20, #0x70]
  0x231072c: cbz      x8, #0x23107f8
  0x2310730: cbz      x0, #0x23107f8
  0x2310734: ldr      w1, [x8, #0x34]
  0x2310738: mov      w2, wzr
  0x231073c: mov      x3, xzr
  0x2310740: bl       #0x2612118 ; -> CTempletManager$$GetSingularityEquipEnchantTemplet
  0x2310744: mov      x21, x0
  0x2310748: mov      x0, xzr
  0x231074c: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x2310750: ldr      x8, [x20, #0x70]
  0x2310754: cbz      x8, #0x23107f8
  0x2310758: cbz      x0, #0x23107f8
  0x231075c: ldr      w1, [x8, #0x34]
  0x2310760: and      w3, w19, #0xff
  0x2310764: mov      w2, #1
  0x2310768: mov      x4, xzr
  0x231076c: bl       #0x2612328 ; -> CTempletManager$$GetSingularityEquipEnchantTemplets
  0x2310770: mov      x19, x0
  0x2310774: cbz      x21, #0x2310794
  0x2310778: ldr      s0, [x21, #0x4c]
  0x231077c: fmov     s1, wzr
  0x2310780: fadd     s8, s0, s1
  0x2310784: cbnz     x19, #0x231079c
  0x2310788: b        #0x23107f8
  0x231078c: fmov     s8, wzr
  0x2310790: b        #0x23107e0
  0x2310794: fmov     s8, wzr
  0x2310798: cbz      x19, #0x23107f8
  0x231079c: ldr      w8, [x19, #0x18]
  0x23107a0: cmp      w8, #1
  0x23107a4: b.lt     #0x23107e0
  0x23107a8: adrp     x21, #0x5512000
  0x23107ac: ldr      x21, [x21, #0xc70] ; = 0x0 (u64 @ 0x5512c70)
  0x23107b0: mov      w20, wzr
  0x23107b4: ldr      x2, [x21] ; = 0x0 (u64 @ 0x5512000)
  0x23107b8: mov      x0, x19
  0x23107bc: mov      w1, w20
  0x23107c0: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x23107c4: cbz      x0, #0x23107f8
  0x23107c8: ldr      w8, [x19, #0x18]
  0x23107cc: ldr      s0, [x0, #0x4c] ; = 0.0 (f32 @ 0x551204c)
  0x23107d0: add      w20, w20, #1
  0x23107d4: cmp      w20, w8
  0x23107d8: fadd     s8, s8, s0
  0x23107dc: b.lt     #0x23107b4
  0x23107e0: ldp      x20, x19, [sp, #0x20]
  0x23107e4: ldp      x22, x21, [sp, #0x10]
  0x23107e8: ldr      x30, [sp, #8]
  0x23107ec: mov      v0.16b, v8.16b
  0x23107f0: ldr      d8, [sp], #0x30
  0x23107f4: ret      
  0x23107f8: bl       #0x21849c0 ; -> ??? 0x21849c0
