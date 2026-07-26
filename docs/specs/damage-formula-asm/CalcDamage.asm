; ===== CalcDamage @ 0x2c5ad30..0x2c5b4dc (taille 1964 octets) =====
  0x2c5ad30: sub      sp, sp, #0xc0
  0x2c5ad34: stp      d9, d8, [sp, #0x50]
  0x2c5ad38: stp      x29, x30, [sp, #0x60]
  0x2c5ad3c: stp      x28, x27, [sp, #0x70]
  0x2c5ad40: stp      x26, x25, [sp, #0x80]
  0x2c5ad44: stp      x24, x23, [sp, #0x90]
  0x2c5ad48: stp      x22, x21, [sp, #0xa0]
  0x2c5ad4c: stp      x20, x19, [sp, #0xb0]
  0x2c5ad50: adrp     x19, #0x595a000
  0x2c5ad54: ldrb     w8, [x19, #0x906]
  0x2c5ad58: mov      x21, x6
  0x2c5ad5c: mov      x28, x5
  0x2c5ad60: mov      x27, x4
  0x2c5ad64: mov      w23, w3
  0x2c5ad68: mov      x22, x2
  0x2c5ad6c: mov      x24, x1
  0x2c5ad70: mov      x25, x0
  0x2c5ad74: tbnz     w8, #0, #0x2c5ade0
  0x2c5ad78: adrp     x0, #0x5511000
  0x2c5ad7c: ldr      x0, [x0, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5ad80: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5ad84: adrp     x0, #0x5511000
  0x2c5ad88: ldr      x0, [x0, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x2c5ad8c: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5ad90: adrp     x0, #0x5511000
  0x2c5ad94: ldr      x0, [x0, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2c5ad98: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5ad9c: adrp     x0, #0x5536000
  0x2c5ada0: ldr      x0, [x0, #0x870] ; = 0x0 (u64 @ 0x5536870)
  0x2c5ada4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5ada8: adrp     x0, #0x550f000
  0x2c5adac: ldr      x0, [x0, #0xe8] ; = 0x0 (u64 @ 0x550f0e8)
  0x2c5adb0: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5adb4: adrp     x0, #0x5551000
  0x2c5adb8: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55511e8)
  0x2c5adbc: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5adc0: adrp     x0, #0x5536000
  0x2c5adc4: ldr      x0, [x0, #0x888] ; = 0x0 (u64 @ 0x5536888)
  0x2c5adc8: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5adcc: adrp     x0, #0x550f000
  0x2c5add0: ldr      x0, [x0, #0x320] ; = 0x0 (u64 @ 0x550f320)
  0x2c5add4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5add8: mov      w8, #1
  0x2c5addc: strb     w8, [x19, #0x906]
  0x2c5ade0: add      x8, sp, #0x38
  0x2c5ade4: add      x0, sp, #0x38
  0x2c5ade8: mov      x1, x25
  0x2c5adec: stp      xzr, xzr, [sp, #0x40]
  0x2c5adf0: stp      xzr, x25, [sp, #0x30]
  0x2c5adf4: str      wzr, [sp, #0x2c]
  0x2c5adf8: add      x26, x8, #8
  0x2c5adfc: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x2c5ae00: mov      x0, x26
  0x2c5ae04: mov      x1, x24
  0x2c5ae08: str      x24, [sp, #0x40]
  0x2c5ae0c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x2c5ae10: str      w23, [sp, #0x48]
  0x2c5ae14: cbz      w23, #0x2c5b0cc
  0x2c5ae18: cbz      x22, #0x2c5b4d4
  0x2c5ae1c: ldr      w0, [x22, #0x68]
  0x2c5ae20: cbz      w0, #0x2c5b0dc
  0x2c5ae24: add      x1, sp, #0x38
  0x2c5ae28: bl       #0x2c5b4dc ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2c5ae2c: str      w0, [x27]
  0x2c5ae30: ldr      x0, [sp, #0x40]
  0x2c5ae34: cbz      x0, #0x2c5b4d4
  0x2c5ae38: mov      x1, xzr
  0x2c5ae3c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5ae40: cbz      x0, #0x2c5b4d4
  0x2c5ae44: ldr      w8, [x0, #0x80]
  0x2c5ae48: cbnz     w8, #0x2c5b1b0
  0x2c5ae4c: ldr      x8, [sp, #0x38]
  0x2c5ae50: cbz      x8, #0x2c5b4d4
  0x2c5ae54: ldr      x0, [x8, #0xf0]
  0x2c5ae58: cbz      x0, #0x2c5b4d4
  0x2c5ae5c: mov      w1, wzr
  0x2c5ae60: mov      x2, xzr
  0x2c5ae64: bl       #0x4f4d724 ; -> UnityEngine.Animator$$GetCurrentAnimatorClipInfo
  0x2c5ae68: cbz      x0, #0x2c5b4d4
  0x2c5ae6c: ldr      x8, [x0, #0x18] ; = 0x0 (u64 @ 0x550f018)
  0x2c5ae70: mov      x24, x0
  0x2c5ae74: stp      x22, x28, [sp, #8]
  0x2c5ae78: stp      x27, x21, [sp, #0x18]
  0x2c5ae7c: cmp      w8, #1
  0x2c5ae80: b.lt     #0x2c5b0ec
  0x2c5ae84: adrp     x28, #0x5536000
  0x2c5ae88: adrp     x29, #0x550f000
  0x2c5ae8c: adrp     x19, #0x550f000
  0x2c5ae90: adrp     x21, #0x5511000
  0x2c5ae94: adrp     x22, #0x5536000
  0x2c5ae98: ldr      x28, [x28, #0x870] ; = 0x0 (u64 @ 0x5536870)
  0x2c5ae9c: ldr      x29, [x29, #0xe8] ; = 0x0 (u64 @ 0x550f0e8)
  0x2c5aea0: ldr      x19, [x19, #0x320] ; = 0x0 (u64 @ 0x550f320)
  0x2c5aea4: ldr      x21, [x21, #0x658] ; = 0x0 (u64 @ 0x5511658)
  0x2c5aea8: ldr      x22, [x22, #0x888] ; = 0x0 (u64 @ 0x5536888)
  0x2c5aeac: mov      w23, wzr
  0x2c5aeb0: mov      x27, xzr
  0x2c5aeb4: and      x8, x8, #0xffffffff
  0x2c5aeb8: cmp      x27, w8, uxtw
  0x2c5aebc: b.hs     #0x2c5b4d8
  0x2c5aec0: add      x8, x24, x27, lsl #3
  0x2c5aec4: ldr      x8, [x8, #0x20]
  0x2c5aec8: add      x0, sp, #0x30
  0x2c5aecc: mov      x1, xzr
  0x2c5aed0: str      x8, [sp, #0x30]
  0x2c5aed4: bl       #0x4f4cf20 ; -> UnityEngine.AnimatorClipInfo$$get_clip
  0x2c5aed8: cbz      x0, #0x2c5b4d4
  0x2c5aedc: mov      x1, xzr
  0x2c5aee0: bl       #0x4f4ce58 ; -> UnityEngine.AnimationClip$$get_events
  0x2c5aee4: cbz      x0, #0x2c5b4d4
  0x2c5aee8: ldr      w8, [x0, #0x18]
  0x2c5aeec: mov      x25, x0
  0x2c5aef0: cmp      w8, #1
  0x2c5aef4: b.lt     #0x2c5b0b8
  0x2c5aef8: mov      w20, wzr
  0x2c5aefc: cmp      w20, w8
  0x2c5af00: b.hs     #0x2c5b4d8
  0x2c5af04: add      x8, x25, w20, sxtw #3
  0x2c5af08: ldr      x26, [x8, #0x20]
  0x2c5af0c: cbz      x26, #0x2c5b4d4
  0x2c5af10: mov      x0, x26
  0x2c5af14: mov      x1, xzr
  0x2c5af18: bl       #0x4f4cb0c ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2c5af1c: ldr      x8, [x28] ; = 0x0 (u64 @ 0x5536000)
  0x2c5af20: cbz      x8, #0x2c5b4d4
  0x2c5af24: mov      x1, x0
  0x2c5af28: mov      x0, x8
  0x2c5af2c: mov      x2, xzr
  0x2c5af30: bl       #0x4718314 ; -> System.String$$Equals
  0x2c5af34: tbz      w0, #0, #0x2c5afc4
  0x2c5af38: mov      x0, x26
  0x2c5af3c: mov      x1, xzr
  0x2c5af40: bl       #0x4f4cb04 ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2c5af44: cbz      x0, #0x2c5b4d4
  0x2c5af48: ldr      x1, [x29] ; = 0x0 (u64 @ 0x550f000)
  0x2c5af4c: ldr      x2, [x19] ; = 0x0 (u64 @ 0x550f000)
  0x2c5af50: mov      x3, xzr
  0x2c5af54: bl       #0x471aa40 ; -> System.String$$Replace
  0x2c5af58: cbz      x0, #0x2c5b4d4
  0x2c5af5c: mov      w1, #0x2c
  0x2c5af60: mov      w2, wzr
  0x2c5af64: mov      x3, xzr
  0x2c5af68: bl       #0x471b094 ; -> System.String$$Split
  0x2c5af6c: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x2c5af70: mov      x26, x0
  0x2c5af74: ldr      w9, [x8, #0xe0]
  0x2c5af78: cbnz     w9, #0x2c5af84
  0x2c5af7c: mov      x0, x8
  0x2c5af80: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5af84: mov      x0, xzr
  0x2c5af88: bl       #0x25e3bc0 ; -> CTempletManager$$get_Instance
  0x2c5af8c: cbz      x26, #0x2c5b4d4
  0x2c5af90: ldr      w8, [x26, #0x18]
  0x2c5af94: cbz      w8, #0x2c5b4d8
  0x2c5af98: cbz      x0, #0x2c5b4d4
  0x2c5af9c: ldr      x1, [x26, #0x20]
  0x2c5afa0: mov      x2, xzr
  0x2c5afa4: bl       #0x25eee28 ; -> CTempletManager$$GetDamageTemplet
  0x2c5afa8: cbz      x0, #0x2c5b4d4
  0x2c5afac: ldr      w8, [x0, #0x34]
  0x2c5afb0: ldr      w9, [x0, #0x68]
  0x2c5afb4: cmp      w8, #0
  0x2c5afb8: csinc    w8, w8, wzr, ne
  0x2c5afbc: madd     w23, w8, w9, w23
  0x2c5afc0: b        #0x2c5b0a8
  0x2c5afc4: mov      x0, x26
  0x2c5afc8: mov      x1, xzr
  0x2c5afcc: bl       #0x4f4cb0c ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2c5afd0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5536000)
  0x2c5afd4: cbz      x8, #0x2c5b4d4
  0x2c5afd8: mov      x1, x0
  0x2c5afdc: mov      x0, x8
  0x2c5afe0: mov      x2, xzr
  0x2c5afe4: bl       #0x4718314 ; -> System.String$$Equals
  0x2c5afe8: tbz      w0, #0, #0x2c5b0a8
  0x2c5afec: mov      x0, x26
  0x2c5aff0: mov      x1, xzr
  0x2c5aff4: bl       #0x4f4cb04 ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2c5aff8: cbz      x0, #0x2c5b4d4
  0x2c5affc: ldr      x1, [x29] ; = 0x0 (u64 @ 0x550f000)
  0x2c5b000: ldr      x2, [x19] ; = 0x0 (u64 @ 0x550f000)
  0x2c5b004: mov      x3, xzr
  0x2c5b008: bl       #0x471aa40 ; -> System.String$$Replace
  0x2c5b00c: cbz      x0, #0x2c5b4d4
  0x2c5b010: mov      w1, #0x2c
  0x2c5b014: mov      w2, wzr
  0x2c5b018: mov      x3, xzr
  0x2c5b01c: bl       #0x471b094 ; -> System.String$$Split
  0x2c5b020: cbz      x0, #0x2c5b0a8
  0x2c5b024: ldr      w8, [x0, #0x18]
  0x2c5b028: cmp      w8, #2
  0x2c5b02c: b.lt     #0x2c5b0a8
  0x2c5b030: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x2c5b034: add      x1, sp, #0x2c
  0x2c5b038: mov      x2, xzr
  0x2c5b03c: bl       #0x48a19ac ; -> System.Int32$$TryParse
  0x2c5b040: ldr      w8, [sp, #0x2c]
  0x2c5b044: cmp      w8, #1
  0x2c5b048: b.lt     #0x2c5b0a8
  0x2c5b04c: tbz      w0, #0, #0x2c5b0a8
  0x2c5b050: add      x0, sp, #0x2c
  0x2c5b054: mov      x1, xzr
  0x2c5b058: bl       #0x48a1298 ; -> System.Int32$$ToString
  0x2c5b05c: adrp     x8, #0x5551000
  0x2c5b060: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55511e8)
  0x2c5b064: mov      x1, x0
  0x2c5b068: mov      x2, xzr
  0x2c5b06c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5551000)
  0x2c5b070: mov      x0, x8
  0x2c5b074: bl       #0x470c0a0 ; -> System.String$$Concat
  0x2c5b078: adrp     x8, #0x5511000
  0x2c5b07c: ldr      x8, [x8, #0x520] ; = 0x0 (u64 @ 0x5511520)
  0x2c5b080: mov      x26, x0
  0x2c5b084: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b088: ldr      w9, [x8, #0xe0]
  0x2c5b08c: cbnz     w9, #0x2c5b098
  0x2c5b090: mov      x0, x8
  0x2c5b094: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b098: mov      x0, x26
  0x2c5b09c: bl       #0x2c4fde4 ; -> CDebug$$LogWarning
  0x2c5b0a0: ldr      w8, [sp, #0x2c]
  0x2c5b0a4: add      w23, w8, w23
  0x2c5b0a8: ldr      w8, [x25, #0x18]
  0x2c5b0ac: add      w20, w20, #1
  0x2c5b0b0: cmp      w20, w8
  0x2c5b0b4: b.lt     #0x2c5aefc
  0x2c5b0b8: ldr      w8, [x24, #0x18]
  0x2c5b0bc: add      x27, x27, #1
  0x2c5b0c0: cmp      x27, w8, sxtw
  0x2c5b0c4: b.lt     #0x2c5aeb8
  0x2c5b0c8: b        #0x2c5b0f0
  0x2c5b0cc: str      wzr, [x21]
  0x2c5b0d0: str      wzr, [x28]
  0x2c5b0d4: str      wzr, [x27]
  0x2c5b0d8: b        #0x2c5b410
  0x2c5b0dc: str      wzr, [x27]
  0x2c5b0e0: str      wzr, [x28]
  0x2c5b0e4: str      wzr, [x21]
  0x2c5b0e8: b        #0x2c5b410
  0x2c5b0ec: mov      w23, wzr
  0x2c5b0f0: ldp      x27, x21, [sp, #0x18]
  0x2c5b0f4: ldp      x22, x28, [sp, #8]
  0x2c5b0f8: cbnz     w23, #0x2c5b138
  0x2c5b0fc: ldr      x0, [sp, #0x38]
  0x2c5b100: cbz      x0, #0x2c5b4d4
  0x2c5b104: mov      x1, xzr
  0x2c5b108: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b10c: cbz      x0, #0x2c5b4d4
  0x2c5b110: ldr      w8, [x0, #0x88]
  0x2c5b114: cbz      w8, #0x2c5b134
  0x2c5b118: ldr      x0, [sp, #0x38]
  0x2c5b11c: cbz      x0, #0x2c5b4d4
  0x2c5b120: mov      x1, xzr
  0x2c5b124: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b128: cbz      x0, #0x2c5b4d4
  0x2c5b12c: ldr      w23, [x0, #0x88]
  0x2c5b130: b        #0x2c5b138
  0x2c5b134: mov      w23, wzr
  0x2c5b138: ldr      x0, [sp, #0x40]
  0x2c5b13c: cbz      x0, #0x2c5b4d4
  0x2c5b140: mov      x1, xzr
  0x2c5b144: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b148: mov      x24, x0
  0x2c5b14c: add      x1, sp, #0x38
  0x2c5b150: mov      w0, w23
  0x2c5b154: bl       #0x2c5b4dc ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2c5b158: cbz      x24, #0x2c5b4d4
  0x2c5b15c: str      w0, [x24, #0x80]
  0x2c5b160: ldr      x0, [sp, #0x40]
  0x2c5b164: cbz      x0, #0x2c5b4d4
  0x2c5b168: mov      x1, xzr
  0x2c5b16c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b170: cbz      x0, #0x2c5b4d4
  0x2c5b174: str      w23, [x0, #0x88]
  0x2c5b178: ldr      x0, [sp, #0x40]
  0x2c5b17c: cbz      x0, #0x2c5b4d4
  0x2c5b180: mov      x1, xzr
  0x2c5b184: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b188: ldr      x8, [sp, #0x40]
  0x2c5b18c: cbz      x8, #0x2c5b4d4
  0x2c5b190: mov      x23, x0
  0x2c5b194: mov      x0, x8
  0x2c5b198: mov      x1, xzr
  0x2c5b19c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b1a0: cbz      x0, #0x2c5b4d4
  0x2c5b1a4: str      wzr, [x0, #0x84]
  0x2c5b1a8: cbz      x23, #0x2c5b4d4
  0x2c5b1ac: str      wzr, [x23, #0x8c]
  0x2c5b1b0: adrp     x19, #0x5955000
  0x2c5b1b4: ldrb     w8, [x19, #0x8f3]
  0x2c5b1b8: cbnz     w8, #0x2c5b1d0
  0x2c5b1bc: adrp     x0, #0x5511000
  0x2c5b1c0: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5b1c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b1c8: mov      w8, #1
  0x2c5b1cc: strb     w8, [x19, #0x8f3]
  0x2c5b1d0: adrp     x8, #0x5511000
  0x2c5b1d4: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x2c5b1d8: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b1dc: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x2c5b1e0: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b1e4: cbz      x8, #0x2c5b4d4
  0x2c5b1e8: ldrb     w8, [x8, #0x35]
  0x2c5b1ec: cbz      w8, #0x2c5b434
  0x2c5b1f0: ldr      x0, [sp, #0x40]
  0x2c5b1f4: cbz      x0, #0x2c5b4d4
  0x2c5b1f8: mov      x1, xzr
  0x2c5b1fc: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b200: cbz      x0, #0x2c5b4d4
  0x2c5b204: ldr      w8, [x0, #0x8c]
  0x2c5b208: ldr      w9, [x22, #0x68]
  0x2c5b20c: add      w8, w9, w8
  0x2c5b210: str      w8, [x0, #0x8c]
  0x2c5b214: ldr      x0, [sp, #0x40]
  0x2c5b218: cbz      x0, #0x2c5b4d4
  0x2c5b21c: mov      x1, xzr
  0x2c5b220: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b224: cbz      x0, #0x2c5b4d4
  0x2c5b228: ldr      x8, [sp, #0x40]
  0x2c5b22c: cbz      x8, #0x2c5b4d4
  0x2c5b230: ldr      w19, [x0, #0x8c]
  0x2c5b234: mov      x0, x8
  0x2c5b238: mov      x1, xzr
  0x2c5b23c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b240: cbz      x0, #0x2c5b4d4
  0x2c5b244: ldr      w8, [x0, #0x88]
  0x2c5b248: cmp      w19, w8
  0x2c5b24c: b.lt     #0x2c5b314
  0x2c5b250: ldr      x0, [sp, #0x40]
  0x2c5b254: cbz      x0, #0x2c5b4d4
  0x2c5b258: mov      x1, xzr
  0x2c5b25c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b260: cbz      x0, #0x2c5b4d4
  0x2c5b264: ldr      x8, [sp, #0x40]
  0x2c5b268: cbz      x8, #0x2c5b4d4
  0x2c5b26c: ldr      w20, [x0, #0x80]
  0x2c5b270: mov      x0, x8
  0x2c5b274: mov      x1, xzr
  0x2c5b278: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b27c: cbz      x0, #0x2c5b4d4
  0x2c5b280: ldr      w8, [x0, #0x84]
  0x2c5b284: ldr      w19, [x27]
  0x2c5b288: add      w8, w19, w8
  0x2c5b28c: cmp      w20, w8
  0x2c5b290: b.le     #0x2c5b2dc
  0x2c5b294: ldr      x0, [sp, #0x40]
  0x2c5b298: cbz      x0, #0x2c5b4d4
  0x2c5b29c: mov      x1, xzr
  0x2c5b2a0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b2a4: cbz      x0, #0x2c5b4d4
  0x2c5b2a8: ldr      x8, [sp, #0x40]
  0x2c5b2ac: cbz      x8, #0x2c5b4d4
  0x2c5b2b0: ldr      w20, [x0, #0x80]
  0x2c5b2b4: mov      x0, x8
  0x2c5b2b8: mov      x1, xzr
  0x2c5b2bc: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b2c0: cbz      x0, #0x2c5b4d4
  0x2c5b2c4: ldr      w8, [x0, #0x84]
  0x2c5b2c8: ldr      w9, [x27]
  0x2c5b2cc: add      w10, w20, w19
  0x2c5b2d0: sub      w8, w10, w8
  0x2c5b2d4: sub      w8, w8, w9
  0x2c5b2d8: str      w8, [x27]
  0x2c5b2dc: ldr      x0, [sp, #0x40]
  0x2c5b2e0: cbz      x0, #0x2c5b4d4
  0x2c5b2e4: mov      x1, xzr
  0x2c5b2e8: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b2ec: ldr      x8, [sp, #0x40]
  0x2c5b2f0: cbz      x8, #0x2c5b4d4
  0x2c5b2f4: mov      x22, x0
  0x2c5b2f8: mov      x0, x8
  0x2c5b2fc: mov      x1, xzr
  0x2c5b300: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b304: cbz      x0, #0x2c5b4d4
  0x2c5b308: str      wzr, [x0, #0x88]
  0x2c5b30c: cbz      x22, #0x2c5b4d4
  0x2c5b310: str      wzr, [x22, #0x80]
  0x2c5b314: ldr      x0, [sp, #0x40]
  0x2c5b318: cbz      x0, #0x2c5b4d4
  0x2c5b31c: mov      x1, xzr
  0x2c5b320: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b324: cbz      x0, #0x2c5b4d4
  0x2c5b328: ldr      w8, [x0, #0x84]
  0x2c5b32c: ldr      w9, [x27]
  0x2c5b330: add      w8, w9, w8
  0x2c5b334: str      w8, [x0, #0x84]
  0x2c5b338: ldr      x8, [sp, #0x38]
  0x2c5b33c: cbz      x8, #0x2c5b4d4
  0x2c5b340: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x2c5b344: cbz      x0, #0x2c5b4d4
  0x2c5b348: ldr      w22, [x27]
  0x2c5b34c: mov      x1, xzr
  0x2c5b350: bl       #0x27e0600 ; -> CCharacterData$$get_Vampiric
  0x2c5b354: adrp     x8, #0x5511000
  0x2c5b358: ldr      x8, [x8, #0xca0] ; = 0x0 (u64 @ 0x5511ca0)
  0x2c5b35c: mov      w23, w0
  0x2c5b360: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x2c5b364: ldr      w9, [x8, #0xe0]
  0x2c5b368: cbnz     w9, #0x2c5b374
  0x2c5b36c: mov      x0, x8
  0x2c5b370: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b374: mov      w0, w22
  0x2c5b378: mov      w1, w23
  0x2c5b37c: mov      x2, xzr
  0x2c5b380: bl       #0x28d81c0 ; -> CCommonDefine$$MulPermille
  0x2c5b384: str      w0, [x28]
  0x2c5b388: ldr      x8, [sp, #0x40]
  0x2c5b38c: cbz      x8, #0x2c5b4d4
  0x2c5b390: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5511028)
  0x2c5b394: cbz      x0, #0x2c5b4d4
  0x2c5b398: ldr      w20, [x27]
  0x2c5b39c: mov      x1, xzr
  0x2c5b3a0: bl       #0x27e06dc ; -> CCharacterData$$get_HitHPRecovery
  0x2c5b3a4: adrp     x8, #0x1056000
  0x2c5b3a8: adrp     x19, #0x5955000
  0x2c5b3ac: ldrb     w9, [x19, #0x8ff]
  0x2c5b3b0: ldr      s8, [x8, #0x6a4] ; = 0.0010000000474974513 (f32 @ 0x10566a4)
  0x2c5b3b4: mul      w8, w0, w20
  0x2c5b3b8: scvtf    s9, w8
  0x2c5b3bc: cbnz     w9, #0x2c5b3d4
  0x2c5b3c0: adrp     x0, #0x550f000
  0x2c5b3c4: ldr      x0, [x0, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5b3c8: bl       #0x2184724 ; -> ??? 0x2184724
  0x2c5b3cc: mov      w8, #1
  0x2c5b3d0: strb     w8, [x19, #0x8ff]
  0x2c5b3d4: adrp     x8, #0x550f000
  0x2c5b3d8: ldr      x8, [x8, #0xb00] ; = 0x0 (u64 @ 0x550fb00)
  0x2c5b3dc: fmul     s8, s9, s8
  0x2c5b3e0: ldr      x0, [x8] ; = 0x0 (u64 @ 0x550f000)
  0x2c5b3e4: ldr      w8, [x0, #0xe0]
  0x2c5b3e8: cbnz     w8, #0x2c5b3f0
  0x2c5b3ec: bl       #0x218489c ; -> ??? 0x218489c
  0x2c5b3f0: mov      w8, #0x7f800000
  0x2c5b3f4: frintm   s0, s8
  0x2c5b3f8: fmov     s1, w8
  0x2c5b3fc: fcvtms   w9, s8
  0x2c5b400: fcmp     s0, s1
  0x2c5b404: mov      w8, #-0xffffffff80000000
  0x2c5b408: csel     w8, w8, w9, eq
  0x2c5b40c: str      w8, [x21]
  0x2c5b410: ldp      x20, x19, [sp, #0xb0]
  0x2c5b414: ldp      x22, x21, [sp, #0xa0]
  0x2c5b418: ldp      x24, x23, [sp, #0x90]
  0x2c5b41c: ldp      x26, x25, [sp, #0x80]
  0x2c5b420: ldp      x28, x27, [sp, #0x70]
  0x2c5b424: ldp      x29, x30, [sp, #0x60]
  0x2c5b428: ldp      d9, d8, [sp, #0x50]
  0x2c5b42c: add      sp, sp, #0xc0
  0x2c5b430: ret      
  0x2c5b434: ldr      x0, [sp, #0x40]
  0x2c5b438: cbz      x0, #0x2c5b4d4
  0x2c5b43c: ldr      w8, [x0, #0x2ec]
  0x2c5b440: cmn      w8, #1
  0x2c5b444: b.eq     #0x2c5b1f0
  0x2c5b448: mov      x1, xzr
  0x2c5b44c: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b450: cbz      x0, #0x2c5b4d4
  0x2c5b454: ldr      w8, [x0, #0x90]
  0x2c5b458: cmn      w8, #1
  0x2c5b45c: b.ne     #0x2c5b1f0
  0x2c5b460: ldr      x0, [sp, #0x40]
  0x2c5b464: cbz      x0, #0x2c5b4d4
  0x2c5b468: ldr      w19, [x0, #0x2ec]
  0x2c5b46c: ldr      w20, [x0, #0x2f0]
  0x2c5b470: mov      x1, xzr
  0x2c5b474: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b478: cbz      x0, #0x2c5b4d4
  0x2c5b47c: ldr      w8, [x0, #0x80]
  0x2c5b480: sub      w9, w19, w20
  0x2c5b484: ldr      x0, [sp, #0x40]
  0x2c5b488: bic      w9, w9, w9, asr #31
  0x2c5b48c: cmp      w9, w8
  0x2c5b490: csel     w23, w9, w8, lt
  0x2c5b494: mov      w1, w23
  0x2c5b498: bl       #0x2c5b778 ; -> CFormula$$CalcCharacterSharedDamage
  0x2c5b49c: ldr      x8, [sp, #0x40]
  0x2c5b4a0: cbz      x8, #0x2c5b4d4
  0x2c5b4a4: mov      w24, w0
  0x2c5b4a8: mov      x0, x8
  0x2c5b4ac: mov      x1, xzr
  0x2c5b4b0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x2c5b4b4: cbz      x0, #0x2c5b4d4
  0x2c5b4b8: str      w24, [x0, #0x90]
  0x2c5b4bc: ldr      x8, [sp, #0x40]
  0x2c5b4c0: cbz      x8, #0x2c5b4d4
  0x2c5b4c4: ldr      w9, [x8, #0x2f0]
  0x2c5b4c8: add      w9, w9, w23
  0x2c5b4cc: str      w9, [x8, #0x2f0]
  0x2c5b4d0: b        #0x2c5b1f0
  0x2c5b4d4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x2c5b4d8: bl       #0x21849c8 ; -> ??? 0x21849c8
