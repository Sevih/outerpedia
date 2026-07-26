; ===== CItem_GetEnchantFactor @ 0x23104a4..0x23105d8 (taille 308 octets) =====
  0x23104a4: str      d8, [sp, #-0x40]!
  0x23104a8: stp      x30, x23, [sp, #0x10]
  0x23104ac: stp      x22, x21, [sp, #0x20]
  0x23104b0: stp      x20, x19, [sp, #0x30]
  0x23104b4: adrp     x21, #0x5955000
  0x23104b8: adrp     x22, #0x5511000
  0x23104bc: ldrb     w8, [x21, #0x9a7]
  0x23104c0: ldr      x22, [x22, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x23104c4: mov      w19, w1
  0x23104c8: mov      x20, x0
  0x23104cc: tbnz     w8, #0, #0x23104fc
  0x23104d0: adrp     x0, #0x5511000
  0x23104d4: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x23104d8: bl       #0x2184724 ; -> ??? 0x2184724
  0x23104dc: adrp     x0, #0x5512000
  0x23104e0: ldr      x0, [x0, #0xc58] ; = 0x0 (u64 @ 0x5512c58)
  0x23104e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x23104e8: adrp     x0, #0x5512000
  0x23104ec: ldr      x0, [x0, #0xc60] ; = 0x0 (u64 @ 0x5512c60)
  0x23104f0: bl       #0x2184724 ; -> ??? 0x2184724
  0x23104f4: mov      w8, #1
  0x23104f8: strb     w8, [x21, #0x9a7]
  0x23104fc: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x2310500: ldr      w8, [x0, #0xe0]
  0x2310504: cbnz     w8, #0x231050c
  0x2310508: bl       #0x218489c ; -> ??? 0x218489c
  0x231050c: mov      x0, xzr
  0x2310510: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x2310514: ldr      x8, [x20, #0x70]
  0x2310518: cbz      x8, #0x23105d4
  0x231051c: cbz      x0, #0x23105d4
  0x2310520: ldr      w1, [x8, #0x34]
  0x2310524: mov      x2, xzr
  0x2310528: bl       #0x25f0b38 ; -> CTempletManager$$GetEnchantTempletList
  0x231052c: cbz      x0, #0x23105d4
  0x2310530: ldr      w22, [x0, #0x18]
  0x2310534: mov      x20, x0
  0x2310538: cmp      w22, #1
  0x231053c: b.lt     #0x23105b8
  0x2310540: adrp     x23, #0x5512000
  0x2310544: ldr      x23, [x23, #0xc60] ; = 0x0 (u64 @ 0x5512c60)
  0x2310548: mov      w21, wzr
  0x231054c: fmov     s8, wzr
  0x2310550: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x2310554: mov      x0, x20
  0x2310558: mov      w1, w21
  0x231055c: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x2310560: cbz      x0, #0x23105d4
  0x2310564: ldrb     w8, [x0, #0x14]
  0x2310568: cbz      w8, #0x23105a8
  0x231056c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x2310570: mov      x0, x20
  0x2310574: mov      w1, w21
  0x2310578: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x231057c: cbz      x0, #0x23105d4
  0x2310580: ldrb     w8, [x0, #0x14]
  0x2310584: cmp      w8, w19, uxtb
  0x2310588: b.hi     #0x23105bc
  0x231058c: ldr      x2, [x23] ; = 0x0 (u64 @ 0x5512000)
  0x2310590: mov      x0, x20
  0x2310594: mov      w1, w21
  0x2310598: bl       #0x444a4ec ; -> System.Collections.Generic.List<object>$$get_Item
  0x231059c: cbz      x0, #0x23105d4
  0x23105a0: ldr      s0, [x0, #0x20] ; = 0.0 (f32 @ 0x5512020)
  0x23105a4: fadd     s8, s8, s0
  0x23105a8: add      w21, w21, #1
  0x23105ac: cmp      w22, w21
  0x23105b0: b.ne     #0x2310550
  0x23105b4: b        #0x23105bc
  0x23105b8: fmov     s8, wzr
  0x23105bc: ldp      x20, x19, [sp, #0x30]
  0x23105c0: ldp      x22, x21, [sp, #0x20]
  0x23105c4: ldp      x30, x23, [sp, #0x10]
  0x23105c8: mov      v0.16b, v8.16b
  0x23105cc: ldr      d8, [sp], #0x40
  0x23105d0: ret      
  0x23105d4: bl       #0x21849c0 ; -> ??? 0x21849c0
