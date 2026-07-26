; ===== CItem_GetBreakLimitFactor @ 0x23105d8..0x23106ac (taille 212 octets) =====
  0x23105d8: stp      x30, x21, [sp, #-0x20]!
  0x23105dc: stp      x20, x19, [sp, #0x10]
  0x23105e0: adrp     x21, #0x5955000
  0x23105e4: ldrb     w8, [x21, #0x9a8]
  0x23105e8: mov      w19, w1
  0x23105ec: mov      x20, x0
  0x23105f0: tbnz     w8, #0, #0x2310608
  0x23105f4: adrp     x0, #0x5511000
  0x23105f8: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x23105fc: bl       #0x2184724 ; -> ??? 0x2184724
  0x2310600: mov      w8, #1
  0x2310604: strb     w8, [x21, #0x9a8]
  0x2310608: tst      w19, #0xff
  0x231060c: b.eq     #0x2310694
  0x2310610: adrp     x8, #0x5511000
  0x2310614: ldr      x8, [x8, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2310618: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x231061c: ldr      w8, [x0, #0xe0]
  0x2310620: cbnz     w8, #0x2310628
  0x2310624: bl       #0x218489c ; -> ??? 0x218489c
  0x2310628: mov      x0, xzr
  0x231062c: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x2310630: ldr      x8, [x20, #0x70]
  0x2310634: cbz      x8, #0x23106a4
  0x2310638: cbz      x0, #0x23106a4
  0x231063c: ldr      w2, [x8, #0x38]
  0x2310640: ldrb     w1, [x8, #0x3c]
  0x2310644: mov      x3, xzr
  0x2310648: bl       #0x25fc2c0 ; -> CTempletManager$$GetBreakLimitTemplet
  0x231064c: cbz      x0, #0x23106a4
  0x2310650: ldr      x9, [x0, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x2310654: and      w10, w19, #0xff
  0x2310658: cmp      w10, #1
  0x231065c: mov      x8, xzr
  0x2310660: csinc    w10, w10, wzr, hi
  0x2310664: add      x11, x9, #0x20
  0x2310668: fmov     s0, wzr
  0x231066c: cbz      x9, #0x23106a4
  0x2310670: ldr      w12, [x9, #0x18]
  0x2310674: cmp      x8, x12
  0x2310678: b.hs     #0x23106a8
  0x231067c: ldr      s1, [x11, x8, lsl #2]
  0x2310680: add      x8, x8, #1
  0x2310684: cmp      x10, x8
  0x2310688: fadd     s0, s0, s1
  0x231068c: b.ne     #0x231066c
  0x2310690: b        #0x2310698
  0x2310694: fmov     s0, wzr
  0x2310698: ldp      x20, x19, [sp, #0x10]
  0x231069c: ldp      x30, x21, [sp], #0x20
  0x23106a0: ret      
  0x23106a4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x23106a8: bl       #0x21849c8 ; -> ??? 0x21849c8
