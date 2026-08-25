; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CItem_GetSingularityFactor @ 0x2347020..0x2347170 (taille 336 octets) =====
  0x2347020: str      d8, [sp, #-0x30]!
  0x2347024: str      x30, [sp, #8]
  0x2347028: stp      x22, x21, [sp, #0x10]
  0x234702c: stp      x20, x19, [sp, #0x20]
  0x2347030: adrp     x22, #0x59e4000
  0x2347034: ldrb     w8, [x22, #0xcce]
  0x2347038: mov      w19, w2
  0x234703c: mov      w21, w1
  0x2347040: mov      x20, x0
  0x2347044: tbnz     w8, #0, #0x2347074
  0x2347048: adrp     x0, #0x5598000
  0x234704c: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2347050: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2347054: adrp     x0, #0x559a000
  0x2347058: ldr      x0, [x0, #0x568] ; = 0x0 (u64 @ 0x559a568)
  0x234705c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2347060: adrp     x0, #0x559a000
  0x2347064: ldr      x0, [x0, #0x570] ; = 0x0 (u64 @ 0x559a570)
  0x2347068: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x234706c: mov      w8, #1
  0x2347070: strb     w8, [x22, #0xcce]
  0x2347074: tst      w21, #0xff
  0x2347078: b.eq     #0x2347100
  0x234707c: adrp     x8, #0x5598000
  0x2347080: ldr      x8, [x8, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2347084: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2347088: ldr      w8, [x0, #0xe0]
  0x234708c: cbnz     w8, #0x2347094
  0x2347090: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2347094: mov      x0, xzr
  0x2347098: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x234709c: ldr      x8, [x20, #0x70]
  0x23470a0: cbz      x8, #0x234716c
  0x23470a4: cbz      x0, #0x234716c
  0x23470a8: ldr      w1, [x8, #0x34]
  0x23470ac: mov      w2, wzr
  0x23470b0: mov      x3, xzr
  0x23470b4: bl       #0x2650180 ; -> CTempletManager$$GetSingularityEquipEnchantTemplet
  0x23470b8: mov      x21, x0
  0x23470bc: mov      x0, xzr
  0x23470c0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x23470c4: ldr      x8, [x20, #0x70]
  0x23470c8: cbz      x8, #0x234716c
  0x23470cc: cbz      x0, #0x234716c
  0x23470d0: ldr      w1, [x8, #0x34]
  0x23470d4: and      w3, w19, #0xff
  0x23470d8: mov      w2, #1
  0x23470dc: mov      x4, xzr
  0x23470e0: bl       #0x2650390 ; -> CTempletManager$$GetSingularityEquipEnchantTemplets
  0x23470e4: mov      x19, x0
  0x23470e8: cbz      x21, #0x2347108
  0x23470ec: ldr      s0, [x21, #0x4c]
  0x23470f0: fmov     s1, wzr
  0x23470f4: fadd     s8, s0, s1
  0x23470f8: cbnz     x19, #0x2347110
  0x23470fc: b        #0x234716c
  0x2347100: fmov     s8, wzr
  0x2347104: b        #0x2347154
  0x2347108: fmov     s8, wzr
  0x234710c: cbz      x19, #0x234716c
  0x2347110: ldr      w8, [x19, #0x18]
  0x2347114: cmp      w8, #1
  0x2347118: b.lt     #0x2347154
  0x234711c: adrp     x21, #0x559a000
  0x2347120: ldr      x21, [x21, #0x570] ; = 0x0 (u64 @ 0x559a570)
  0x2347124: mov      w20, wzr
  0x2347128: ldr      x2, [x21] ; = 0x0 (u64 @ 0x559a000)
  0x234712c: mov      x0, x19
  0x2347130: mov      w1, w20
  0x2347134: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x2347138: cbz      x0, #0x234716c
  0x234713c: ldr      w8, [x19, #0x18]
  0x2347140: ldr      s0, [x0, #0x4c] ; = 0.0 (f32 @ 0x559a04c)
  0x2347144: add      w20, w20, #1
  0x2347148: cmp      w20, w8
  0x234714c: fadd     s8, s8, s0
  0x2347150: b.lt     #0x2347128
  0x2347154: ldp      x20, x19, [sp, #0x20]
  0x2347158: ldp      x22, x21, [sp, #0x10]
  0x234715c: ldr      x30, [sp, #8]
  0x2347160: mov      v0.16b, v8.16b
  0x2347164: ldr      d8, [sp], #0x30
  0x2347168: ret      
  0x234716c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
