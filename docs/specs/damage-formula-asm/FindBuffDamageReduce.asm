; ===== FindBuffDamageReduce @ 0x26debd8..0x26df06c (taille 1172 octets) =====
  0x26debd8: sub      sp, sp, #0xd0
  0x26debdc: stp      x29, x30, [sp, #0x70]
  0x26debe0: stp      x28, x27, [sp, #0x80]
  0x26debe4: stp      x26, x25, [sp, #0x90]
  0x26debe8: stp      x24, x23, [sp, #0xa0]
  0x26debec: stp      x22, x21, [sp, #0xb0]
  0x26debf0: stp      x20, x19, [sp, #0xc0]
  0x26debf4: adrp     x22, #0x5957000
  0x26debf8: ldrb     w8, [x22, #0xb67]
  0x26debfc: mov      x20, x2
  0x26dec00: mov      x19, x1
  0x26dec04: mov      x21, x0
  0x26dec08: tbnz     w8, #0, #0x26dec80
  0x26dec0c: adrp     x0, #0x5511000
  0x26dec10: ldr      x0, [x0, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26dec14: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec18: adrp     x0, #0x5511000
  0x26dec1c: ldr      x0, [x0, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26dec20: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec24: adrp     x0, #0x5511000
  0x26dec28: ldr      x0, [x0, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26dec2c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec30: adrp     x0, #0x5511000
  0x26dec34: ldr      x0, [x0, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26dec38: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec3c: adrp     x0, #0x5511000
  0x26dec40: ldr      x0, [x0, #0x850] ; = 0x0 (u64 @ 0x5511850)
  0x26dec44: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec48: adrp     x0, #0x5511000
  0x26dec4c: ldr      x0, [x0, #0x858] ; = 0x0 (u64 @ 0x5511858)
  0x26dec50: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec54: adrp     x0, #0x5511000
  0x26dec58: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26dec5c: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec60: adrp     x0, #0x5511000
  0x26dec64: ldr      x0, [x0, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26dec68: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec6c: adrp     x0, #0x550f000
  0x26dec70: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26dec74: bl       #0x2184724 ; -> ??? 0x2184724
  0x26dec78: mov      w8, #1
  0x26dec7c: strb     w8, [x22, #0xb67]
  0x26dec80: stp      xzr, xzr, [sp, #0x50]
  0x26dec84: str      xzr, [sp, #0x60]
  0x26dec88: stp      xzr, xzr, [sp, #0x30]
  0x26dec8c: str      xzr, [sp, #0x40]
  0x26dec90: ldr      x0, [x21, #0x380]
  0x26dec94: cbz      x0, #0x26def90
  0x26dec98: adrp     x8, #0x5511000
  0x26dec9c: ldr      x8, [x8, #0x868] ; = 0x0 (u64 @ 0x5511868)
  0x26deca0: adrp     x26, #0x5511000
  0x26deca4: adrp     x27, #0x550f000
  0x26deca8: adrp     x28, #0x5511000
  0x26decac: ldr      x26, [x26, #0x840] ; = 0x0 (u64 @ 0x5511840)
  0x26decb0: ldr      x27, [x27, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x26decb4: ldr      x28, [x28, #0x860] ; = 0x0 (u64 @ 0x5511860)
  0x26decb8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26decbc: adrp     x29, #0x5511000
  0x26decc0: adrp     x25, #0x5511000
  0x26decc4: ldr      x29, [x29, #0x848] ; = 0x0 (u64 @ 0x5511848)
  0x26decc8: ldr      x25, [x25, #0x838] ; = 0x0 (u64 @ 0x5511838)
  0x26deccc: add      x8, sp, #0x18
  0x26decd0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26decd4: ldur     q0, [sp, #0x18]
  0x26decd8: ldr      x8, [sp, #0x28]
  0x26decdc: mov      w24, wzr
  0x26dece0: str      q0, [sp, #0x50]
  0x26dece4: str      x8, [sp, #0x60]
  0x26dece8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5511000)
  0x26decec: add      x0, sp, #0x50
  0x26decf0: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26decf4: tbz      w0, #0, #0x26def28
  0x26decf8: ldr      x21, [sp, #0x60]
  0x26decfc: cbz      x21, #0x26def58
  0x26ded00: mov      x0, x21
  0x26ded04: mov      x1, xzr
  0x26ded08: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ded0c: cmp      w0, #0x6e
  0x26ded10: b.ne     #0x26ded60
  0x26ded14: mov      w2, #0x17
  0x26ded18: mov      x0, x21
  0x26ded1c: mov      x1, x20
  0x26ded20: mov      x3, xzr
  0x26ded24: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26ded28: tbz      w0, #0, #0x26ded60
  0x26ded2c: mov      x0, x21
  0x26ded30: mov      x1, xzr
  0x26ded34: bl       #0x22f4afc ; -> CBuff$$get_ApplyingType
  0x26ded38: cmp      w0, #2
  0x26ded3c: b.ne     #0x26dece8
  0x26ded40: mov      x0, x21
  0x26ded44: mov      x1, xzr
  0x26ded48: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26ded4c: add      w24, w0, w24
  0x26ded50: mov      x0, x21
  0x26ded54: mov      x1, xzr
  0x26ded58: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26ded5c: b        #0x26dece8
  0x26ded60: mov      x0, x21
  0x26ded64: mov      x1, xzr
  0x26ded68: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26ded6c: cmp      w0, #0x95
  0x26ded70: b.ne     #0x26dedb4
  0x26ded74: ldr      x0, [x27] ; = 0x0 (u64 @ 0x550f000)
  0x26ded78: ldr      w8, [x0, #0xe0]
  0x26ded7c: cbnz     w8, #0x26ded84
  0x26ded80: bl       #0x218489c ; -> ??? 0x218489c
  0x26ded84: mov      x0, x20
  0x26ded88: mov      x1, xzr
  0x26ded8c: mov      x2, xzr
  0x26ded90: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x26ded94: tbz      w0, #0, #0x26dedb4
  0x26ded98: cbz      x20, #0x26def60
  0x26ded9c: mov      x0, x20
  0x26deda0: bl       #0x26c7224 ; -> CCharacterBattle$$get_SkillRecord
  0x26deda4: cbz      x0, #0x26def5c
  0x26deda8: ldr      w8, [x0, #0x20]
  0x26dedac: cmp      w8, #1
  0x26dedb0: b.ne     #0x26dee9c
  0x26dedb4: mov      x0, x21
  0x26dedb8: mov      x1, xzr
  0x26dedbc: bl       #0x22f4964 ; -> CBuff$$get_Type
  0x26dedc0: cmp      w0, #0x71
  0x26dedc4: b.ne     #0x26dece8
  0x26dedc8: mov      w2, #0x17
  0x26dedcc: mov      x0, x21
  0x26dedd0: mov      x1, x20
  0x26dedd4: mov      x3, xzr
  0x26dedd8: bl       #0x22ffbc0 ; -> CBuff$$CheckAvailable
  0x26deddc: tbz      w0, #0, #0x26dece8
  0x26dede0: ldr      x0, [x27] ; = 0x0 (u64 @ 0x550f000)
  0x26dede4: ldr      x22, [x21, #0x20]
  0x26dede8: ldr      w8, [x0, #0xe0]
  0x26dedec: cbnz     w8, #0x26dedf4
  0x26dedf0: bl       #0x218489c ; -> ??? 0x218489c
  0x26dedf4: mov      x0, x22
  0x26dedf8: mov      x1, xzr
  0x26dedfc: mov      x2, xzr
  0x26dee00: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26dee04: tbnz     w0, #0, #0x26dece8
  0x26dee08: ldr      x0, [x21, #0x20]
  0x26dee0c: cbz      x0, #0x26def64
  0x26dee10: ldr      x8, [x0, #0x28] ; = 0x0 (u64 @ 0x550f028)
  0x26dee14: cbz      x8, #0x26dece8
  0x26dee18: bl       #0x26c96b8 ; -> CCharacterBattle$$GetTeam
  0x26dee1c: cbz      x0, #0x26dece8
  0x26dee20: ldr      x0, [x0, #0x10] ; = 0x0 (u64 @ 0x550f010)
  0x26dee24: cbz      x0, #0x26def94
  0x26dee28: ldr      x1, [x28] ; = 0x0 (u64 @ 0x5511000)
  0x26dee2c: add      x8, sp, #0x18
  0x26dee30: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x26dee34: ldur     q0, [sp, #0x18]
  0x26dee38: ldr      x8, [sp, #0x28]
  0x26dee3c: mov      w23, wzr
  0x26dee40: str      q0, [sp, #0x30]
  0x26dee44: str      x8, [sp, #0x40]
  0x26dee48: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5511000)
  0x26dee4c: add      x0, sp, #0x30
  0x26dee50: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x26dee54: tbz      w0, #0, #0x26deeb0
  0x26dee58: ldr      x0, [x27] ; = 0x0 (u64 @ 0x550f000)
  0x26dee5c: ldr      x22, [sp, #0x40]
  0x26dee60: ldr      w8, [x0, #0xe0]
  0x26dee64: cbnz     w8, #0x26dee6c
  0x26dee68: bl       #0x218489c ; -> ??? 0x218489c
  0x26dee6c: mov      x0, x22
  0x26dee70: mov      x1, xzr
  0x26dee74: mov      x2, xzr
  0x26dee78: bl       #0x4f8268c ; -> UnityEngine.Object$$op_Equality
  0x26dee7c: tbnz     w0, #0, #0x26dee48
  0x26dee80: cbz      x22, #0x26deef0
  0x26dee84: mov      x0, x22
  0x26dee88: mov      x1, xzr
  0x26dee8c: bl       #0x27d18b4 ; -> CCharacter$$get_IsAlive
  0x26dee90: and      w8, w0, #1
  0x26dee94: add      w23, w23, w8
  0x26dee98: b        #0x26dee48
  0x26dee9c: mov      x0, x21
  0x26deea0: mov      x1, xzr
  0x26deea4: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26deea8: add      w24, w0, w24
  0x26deeac: b        #0x26dece8
  0x26deeb0: mov      x22, xzr
  0x26deeb4: adrp     x8, #0x5511000
  0x26deeb8: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26deebc: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26deec0: add      x0, sp, #0x30
  0x26deec4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26deec8: cbnz     x22, #0x26def98
  0x26deecc: mov      x0, x21
  0x26deed0: mov      x1, xzr
  0x26deed4: bl       #0x22f4b38 ; -> CBuff$$get_Value
  0x26deed8: sub      w8, w23, #1
  0x26deedc: madd     w24, w0, w8, w24
  0x26deee0: mov      x0, x21
  0x26deee4: mov      x1, xzr
  0x26deee8: bl       #0x22ffc5c ; -> CBuff$$MarkUsedHitOverThisSkill
  0x26deeec: b        #0x26dece8
  0x26deef0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26deef4: b        #0x26defa0
  0x26deef8: b        #0x26def08
  0x26deefc: b        #0x26def08
  0x26def00: b        #0x26def08
  0x26def04: b        #0x26def08
  0x26def08: cmp      w1, #1
  0x26def0c: stp      x1, x0, [sp, #8]
  0x26def10: b.ne     #0x26def68
  0x26def14: ldr      x0, [sp, #0x10]
  0x26def18: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26def1c: ldr      x22, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x26def20: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26def24: b        #0x26deeb4
  0x26def28: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x26def2c: add      x0, sp, #0x50
  0x26def30: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26def34: str      w24, [x19]
  0x26def38: ldp      x20, x19, [sp, #0xc0]
  0x26def3c: ldp      x22, x21, [sp, #0xb0]
  0x26def40: ldp      x24, x23, [sp, #0xa0]
  0x26def44: ldp      x26, x25, [sp, #0x90]
  0x26def48: ldp      x28, x27, [sp, #0x80]
  0x26def4c: ldp      x29, x30, [sp, #0x70]
  0x26def50: add      sp, sp, #0xd0
  0x26def54: ret      
  0x26def58: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def5c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def60: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def64: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def68: mov      x22, xzr
  0x26def6c: adrp     x8, #0x5511000
  0x26def70: ldr      x8, [x8, #0x830] ; = 0x0 (u64 @ 0x5511830)
  0x26def74: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x26def78: add      x0, sp, #0x30
  0x26def7c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26def80: ldp      x1, x0, [sp, #8]
  0x26def84: cbz      x22, #0x26df00c
  0x26def88: mov      x0, x22
  0x26def8c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26def90: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def94: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x26def98: mov      x0, x22
  0x26def9c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26defa0: stp      x1, x0, [sp, #8]
  0x26defa4: b        #0x26def6c
  0x26defa8: b        #0x26df00c
  0x26defac: b        #0x26df00c
  0x26defb0: b        #0x26df00c
  0x26defb4: b        #0x26df00c
  0x26defb8: b        #0x26df00c
  0x26defbc: b        #0x26df00c
  0x26defc0: b        #0x26df00c
  0x26defc4: b        #0x26df00c
  0x26defc8: b        #0x26df00c
  0x26defcc: b        #0x26df00c
  0x26defd0: b        #0x26df00c
  0x26defd4: b        #0x26df00c
  0x26defd8: b        #0x26df00c
  0x26defdc: b        #0x26df00c
  0x26defe0: b        #0x26df00c
  0x26defe4: b        #0x26df00c
  0x26defe8: b        #0x26df00c
  0x26defec: b        #0x26df00c
  0x26deff0: b        #0x26df00c
  0x26deff4: b        #0x26df00c
  0x26deff8: b        #0x26df00c
  0x26deffc: b        #0x26df00c
  0x26df000: b        #0x26df00c
  0x26df004: b        #0x26df00c
  0x26df008: b        #0x26df00c
  0x26df00c: cmp      w1, #1
  0x26df010: b.ne     #0x26df038
  0x26df014: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x26df018: ldr      x20, [x0] ; = 0x0 (u64 @ 0x550f000)
  0x26df01c: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x26df020: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x26df024: add      x0, sp, #0x50
  0x26df028: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df02c: cbz      x20, #0x26def34
  0x26df030: mov      x0, x20
  0x26df034: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df038: mov      x19, x0
  0x26df03c: mov      x20, xzr
  0x26df040: b        #0x26df048
  0x26df044: mov      x19, x0
  0x26df048: ldr      x1, [x25] ; = 0x0 (u64 @ 0x5511000)
  0x26df04c: add      x0, sp, #0x50
  0x26df050: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x26df054: cbnz     x20, #0x26df060
  0x26df058: mov      x0, x19
  0x26df05c: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x26df060: mov      x0, x20
  0x26df064: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x26df068: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
