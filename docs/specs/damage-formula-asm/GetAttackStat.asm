; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== GetAttackStat @ 0x28305a8..0x28306a8 (taille 256 octets) =====
  0x28305a8: stp      x30, x21, [sp, #-0x20]!
  0x28305ac: stp      x20, x19, [sp, #0x10]
  0x28305b0: adrp     x19, #0x59e7000
  0x28305b4: ldrb     w8, [x19, #0x6f4]
  0x28305b8: mov      x20, x0
  0x28305bc: tbnz     w8, #0, #0x28305d4
  0x28305c0: adrp     x0, #0x5599000
  0x28305c4: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x28305c8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x28305cc: mov      w8, #1
  0x28305d0: strb     w8, [x19, #0x6f4]
  0x28305d4: mov      w1, #0x72
  0x28305d8: mov      x0, x20
  0x28305dc: bl       #0x2814f10 ; -> CCharacterBattle$$FindBuffByType
  0x28305e0: cbz      x0, #0x283067c
  0x28305e4: mov      w2, #0x17
  0x28305e8: mov      x1, x20
  0x28305ec: mov      x3, xzr
  0x28305f0: mov      x19, x0
  0x28305f4: bl       #0x2330c0c ; -> CBuff$$CheckAvailable
  0x28305f8: tbz      w0, #0, #0x283067c
  0x28305fc: ldr      x20, [x20, #0x28]
  0x2830600: mov      x0, x19
  0x2830604: mov      x1, xzr
  0x2830608: bl       #0x2325438 ; -> CBuff$$get_StatType
  0x283060c: cbz      x20, #0x28306a4
  0x2830610: mov      w1, w0
  0x2830614: mov      x0, x20
  0x2830618: mov      x2, xzr
  0x283061c: bl       #0x29101ac ; -> CCharacterData$$GetFinalStat
  0x2830620: mov      w20, w0
  0x2830624: mov      x0, x19
  0x2830628: mov      x1, xzr
  0x283062c: bl       #0x2325450 ; -> CBuff$$get_ApplyingType
  0x2830630: mov      w21, w0
  0x2830634: mov      x0, x19
  0x2830638: mov      x1, xzr
  0x283063c: bl       #0x232548c ; -> CBuff$$get_Value
  0x2830640: cmp      w21, #2
  0x2830644: mov      w19, w0
  0x2830648: b.ne     #0x2830694
  0x283064c: adrp     x8, #0x5599000
  0x2830650: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2830654: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2830658: ldr      w8, [x0, #0xe0]
  0x283065c: cbnz     w8, #0x2830664
  0x2830660: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2830664: mov      w0, w20
  0x2830668: mov      w1, w19
  0x283066c: ldp      x20, x19, [sp, #0x10]
  0x2830670: mov      x2, xzr
  0x2830674: ldp      x30, x21, [sp], #0x20
  0x2830678: b        #0x2a0b520
  0x283067c: ldr      x0, [x20, #0x28]
  0x2830680: cbz      x0, #0x28306a4
  0x2830684: ldp      x20, x19, [sp, #0x10]
  0x2830688: mov      x1, xzr
  0x283068c: ldp      x30, x21, [sp], #0x20
  0x2830690: b        #0x2909180
  0x2830694: add      w0, w19, w20
  0x2830698: ldp      x20, x19, [sp, #0x10]
  0x283069c: ldp      x30, x21, [sp], #0x20
  0x28306a0: ret      
  0x28306a4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
