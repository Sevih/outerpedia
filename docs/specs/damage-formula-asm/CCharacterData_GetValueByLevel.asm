; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_GetValueByLevel @ 0x2911034..0x2911398 (taille 868 octets) =====
  0x2911034: str      x30, [sp, #-0x40]!
  0x2911038: stp      x24, x23, [sp, #0x10]
  0x291103c: stp      x22, x21, [sp, #0x20]
  0x2911040: stp      x20, x19, [sp, #0x30]
  0x2911044: adrp     x23, #0x59e7000
  0x2911048: adrp     x24, #0x5598000
  0x291104c: ldrb     w8, [x23, #0xeba]
  0x2911050: ldr      x24, [x24, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2911054: mov      w21, w3
  0x2911058: mov      w22, w2
  0x291105c: mov      w19, w1
  0x2911060: mov      x20, x0
  0x2911064: tbnz     w8, #0, #0x29110a0
  0x2911068: adrp     x0, #0x5599000
  0x291106c: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2911070: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2911074: adrp     x0, #0x5598000
  0x2911078: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x291107c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2911080: adrp     x0, #0x55c5000
  0x2911084: ldr      x0, [x0, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2911088: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x291108c: adrp     x0, #0x55c5000
  0x2911090: ldr      x0, [x0, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2911094: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2911098: mov      w8, #1
  0x291109c: strb     w8, [x23, #0xeba]
  0x29110a0: ldr      x0, [x24] ; = 0x0 (u64 @ 0x5598000)
  0x29110a4: ldr      w8, [x0, #0xe0]
  0x29110a8: cbnz     w8, #0x29110b0
  0x29110ac: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x29110b0: mov      x0, xzr
  0x29110b4: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x29110b8: ldr      x8, [x20, #0xf0]
  0x29110bc: cbz      x8, #0x2911394
  0x29110c0: cbz      x0, #0x2911394
  0x29110c4: ldr      w3, [x8, #0x10]
  0x29110c8: ldrb     w2, [x20, #0x98]
  0x29110cc: ldrb     w1, [x8, #0x54]
  0x29110d0: mov      x4, xzr
  0x29110d4: bl       #0x2630e40 ; -> CTempletManager$$GetCharacterTranscendent
  0x29110d8: cmp      w22, #1
  0x29110dc: b.eq     #0x29110fc
  0x29110e0: cmp      w22, #5
  0x29110e4: b.eq     #0x2911108
  0x29110e8: cmp      w22, #4
  0x29110ec: b.ne     #0x2911114
  0x29110f0: cbz      x0, #0x291111c
  0x29110f4: ldr      w22, [x0, #0x34]
  0x29110f8: b        #0x2911120
  0x29110fc: cbz      x0, #0x29111d4
  0x2911100: ldr      w22, [x0, #0x30]
  0x2911104: b        #0x29111d8
  0x2911108: cbz      x0, #0x2911288
  0x291110c: ldr      w22, [x0, #0x38]
  0x2911110: b        #0x291128c
  0x2911114: mov      w19, wzr
  0x2911118: b        #0x291134c
  0x291111c: mov      w22, wzr
  0x2911120: ldr      x8, [x20, #0xf0]
  0x2911124: cbz      x8, #0x2911394
  0x2911128: ldrh     w0, [x8, #0x72]
  0x291112c: ldrh     w1, [x8, #0x74]
  0x2911130: mov      w2, w19
  0x2911134: mov      x3, xzr
  0x2911138: bl       #0x2cc0608 ; -> CFormula$$CalcStat
  0x291113c: adrp     x8, #0x5599000
  0x2911140: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2911144: mov      w19, w0
  0x2911148: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x291114c: ldr      w9, [x8, #0xe0]
  0x2911150: cbnz     w9, #0x291115c
  0x2911154: mov      x0, x8
  0x2911158: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x291115c: mov      w0, w19
  0x2911160: mov      w1, w22
  0x2911164: mov      x2, xzr
  0x2911168: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x291116c: add      w19, w0, w19
  0x2911170: tbz      w21, #0, #0x291134c
  0x2911174: ldr      x0, [x20, #0x40]
  0x2911178: cbz      x0, #0x2911394
  0x291117c: adrp     x8, #0x55c5000
  0x2911180: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2911184: mov      w1, #4
  0x2911188: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x291118c: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2911190: cbz      x0, #0x2911394
  0x2911194: adrp     x10, #0x55c5000
  0x2911198: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x291119c: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x29111a0: mov      x20, x0
  0x29111a4: ldrh     w9, [x8, #0x12e]
  0x29111a8: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x29111ac: cbz      x9, #0x291133c
  0x29111b0: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x29111b4: add      x10, x10, #8
  0x29111b8: ldur     x11, [x10, #-8]
  0x29111bc: cmp      x11, x1
  0x29111c0: b.eq     #0x2911364
  0x29111c4: subs     x9, x9, #1
  0x29111c8: add      x10, x10, #0x10
  0x29111cc: b.ne     #0x29111b8
  0x29111d0: b        #0x291133c
  0x29111d4: mov      w22, wzr
  0x29111d8: ldr      x8, [x20, #0xf0]
  0x29111dc: cbz      x8, #0x2911394
  0x29111e0: ldp      w0, w1, [x8, #0x64]
  0x29111e4: mov      w2, w19
  0x29111e8: mov      x3, xzr
  0x29111ec: bl       #0x2cc0608 ; -> CFormula$$CalcStat
  0x29111f0: adrp     x8, #0x5599000
  0x29111f4: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x29111f8: mov      w19, w0
  0x29111fc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2911200: ldr      w9, [x8, #0xe0]
  0x2911204: cbnz     w9, #0x2911210
  0x2911208: mov      x0, x8
  0x291120c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2911210: mov      w0, w19
  0x2911214: mov      w1, w22
  0x2911218: mov      x2, xzr
  0x291121c: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2911220: add      w19, w0, w19
  0x2911224: tbz      w21, #0, #0x291134c
  0x2911228: ldr      x0, [x20, #0x40]
  0x291122c: cbz      x0, #0x2911394
  0x2911230: adrp     x8, #0x55c5000
  0x2911234: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x2911238: mov      w1, #1
  0x291123c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x2911240: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x2911244: cbz      x0, #0x2911394
  0x2911248: adrp     x10, #0x55c5000
  0x291124c: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2911250: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x2911254: mov      x20, x0
  0x2911258: ldrh     w9, [x8, #0x12e]
  0x291125c: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2911260: cbz      x9, #0x291133c
  0x2911264: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2911268: add      x10, x10, #8
  0x291126c: ldur     x11, [x10, #-8]
  0x2911270: cmp      x11, x1
  0x2911274: b.eq     #0x2911364
  0x2911278: subs     x9, x9, #1
  0x291127c: add      x10, x10, #0x10
  0x2911280: b.ne     #0x291126c
  0x2911284: b        #0x291133c
  0x2911288: mov      w22, wzr
  0x291128c: ldr      x8, [x20, #0xf0]
  0x2911290: cbz      x8, #0x2911394
  0x2911294: ldrh     w0, [x8, #0x76]
  0x2911298: ldrh     w1, [x8, #0x78]
  0x291129c: mov      w2, w19
  0x29112a0: mov      x3, xzr
  0x29112a4: bl       #0x2cc0608 ; -> CFormula$$CalcStat
  0x29112a8: adrp     x8, #0x5599000
  0x29112ac: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x29112b0: mov      w19, w0
  0x29112b4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x29112b8: ldr      w9, [x8, #0xe0]
  0x29112bc: cbnz     w9, #0x29112c8
  0x29112c0: mov      x0, x8
  0x29112c4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x29112c8: mov      w0, w19
  0x29112cc: mov      w1, w22
  0x29112d0: mov      x2, xzr
  0x29112d4: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x29112d8: add      w19, w0, w19
  0x29112dc: tbz      w21, #0, #0x291134c
  0x29112e0: ldr      x0, [x20, #0x40]
  0x29112e4: cbz      x0, #0x2911394
  0x29112e8: adrp     x8, #0x55c5000
  0x29112ec: ldr      x8, [x8, #0x378] ; = 0x0 (u64 @ 0x55c5378)
  0x29112f0: mov      w1, #5
  0x29112f4: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55c5000)
  0x29112f8: bl       #0x402857c ; -> System.Collections.Generic.Dictionary<Int32Enum, object>$$get_Item
  0x29112fc: cbz      x0, #0x2911394
  0x2911300: adrp     x10, #0x55c5000
  0x2911304: ldr      x8, [x0] ; = 0x0 (u64 @ 0x55c5000)
  0x2911308: ldr      x10, [x10, #0x380] ; = 0x0 (u64 @ 0x55c5380)
  0x291130c: mov      x20, x0
  0x2911310: ldrh     w9, [x8, #0x12e]
  0x2911314: ldr      x1, [x10] ; = 0x0 (u64 @ 0x55c5000)
  0x2911318: cbz      x9, #0x291133c
  0x291131c: ldr      x10, [x8, #0xb0] ; = 0x0 (u64 @ 0x55c50b0)
  0x2911320: add      x10, x10, #8
  0x2911324: ldur     x11, [x10, #-8]
  0x2911328: cmp      x11, x1
  0x291132c: b.eq     #0x2911364
  0x2911330: subs     x9, x9, #1
  0x2911334: add      x10, x10, #0x10
  0x2911338: b.ne     #0x2911324
  0x291133c: mov      w2, #4
  0x2911340: mov      x0, x20
  0x2911344: bl       #0x2215130 ; -> ??? 0x2215130
  0x2911348: b        #0x2911374
  0x291134c: mov      w0, w19
  0x2911350: ldp      x20, x19, [sp, #0x30]
  0x2911354: ldp      x22, x21, [sp, #0x20]
  0x2911358: ldp      x24, x23, [sp, #0x10]
  0x291135c: ldr      x30, [sp], #0x40
  0x2911360: ret      
  0x2911364: ldr      w9, [x10]
  0x2911368: add      w9, w9, #4
  0x291136c: add      x8, x8, w9, sxtw #4
  0x2911370: add      x0, x8, #0x138
  0x2911374: ldp      x3, x2, [x0]
  0x2911378: mov      x0, x20
  0x291137c: mov      w1, w19
  0x2911380: ldp      x20, x19, [sp, #0x30]
  0x2911384: ldp      x22, x21, [sp, #0x20]
  0x2911388: ldp      x24, x23, [sp, #0x10]
  0x291138c: ldr      x30, [sp], #0x40
  0x2911390: br       x3
  0x2911394: bl       #0x21b4d20 ; -> ??? 0x21b4d20
