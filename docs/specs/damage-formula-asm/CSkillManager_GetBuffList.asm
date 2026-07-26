; ===== CSkillManager_GetBuffList @ 0x24d3138..0x24d4a1c (taille 6372 octets) =====
  0x24d3138: sub      sp, sp, #0xc0
  0x24d313c: stp      x29, x30, [sp, #0x60]
  0x24d3140: stp      x28, x27, [sp, #0x70]
  0x24d3144: stp      x26, x25, [sp, #0x80]
  0x24d3148: stp      x24, x23, [sp, #0x90]
  0x24d314c: stp      x22, x21, [sp, #0xa0]
  0x24d3150: stp      x20, x19, [sp, #0xb0]
  0x24d3154: adrp     x22, #0x5956000
  0x24d3158: ldrb     w8, [x22, #0x949]
  0x24d315c: mov      x19, x4
  0x24d3160: mov      w20, w3
  0x24d3164: mov      w24, w2
  0x24d3168: mov      w21, w1
  0x24d316c: mov      x29, x0
  0x24d3170: tbnz     w8, #0, #0x24d3230
  0x24d3174: adrp     x0, #0x551f000
  0x24d3178: ldr      x0, [x0, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d317c: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d3180: adrp     x0, #0x551f000
  0x24d3184: ldr      x0, [x0, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d3188: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d318c: adrp     x0, #0x551f000
  0x24d3190: ldr      x0, [x0, #0x5e8] ; = 0x0 (u64 @ 0x551f5e8)
  0x24d3194: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d3198: adrp     x0, #0x551f000
  0x24d319c: ldr      x0, [x0, #0x6a8] ; = 0x0 (u64 @ 0x551f6a8)
  0x24d31a0: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31a4: adrp     x0, #0x551f000
  0x24d31a8: ldr      x0, [x0, #0x6b0] ; = 0x0 (u64 @ 0x551f6b0)
  0x24d31ac: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31b0: adrp     x0, #0x551f000
  0x24d31b4: ldr      x0, [x0, #0x5f0] ; = 0x0 (u64 @ 0x551f5f0)
  0x24d31b8: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31bc: adrp     x0, #0x5512000
  0x24d31c0: ldr      x0, [x0, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d31c4: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31c8: adrp     x0, #0x551f000
  0x24d31cc: ldr      x0, [x0, #0x7b0] ; = 0x0 (u64 @ 0x551f7b0)
  0x24d31d0: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31d4: adrp     x0, #0x551f000
  0x24d31d8: ldr      x0, [x0, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d31dc: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31e0: adrp     x0, #0x551f000
  0x24d31e4: ldr      x0, [x0, #0x6b8] ; = 0x0 (u64 @ 0x551f6b8)
  0x24d31e8: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31ec: adrp     x0, #0x551f000
  0x24d31f0: ldr      x0, [x0, #0x7b8] ; = 0x0 (u64 @ 0x551f7b8)
  0x24d31f4: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d31f8: adrp     x0, #0x551f000
  0x24d31fc: ldr      x0, [x0, #0x7c0] ; = 0x0 (u64 @ 0x551f7c0)
  0x24d3200: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d3204: adrp     x0, #0x551f000
  0x24d3208: ldr      x0, [x0, #0x7c8] ; = 0x0 (u64 @ 0x551f7c8)
  0x24d320c: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d3210: adrp     x0, #0x551f000
  0x24d3214: ldr      x0, [x0, #0x7d0] ; = 0x0 (u64 @ 0x551f7d0)
  0x24d3218: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d321c: adrp     x0, #0x551f000
  0x24d3220: ldr      x0, [x0, #0x7d8] ; = 0x0 (u64 @ 0x551f7d8)
  0x24d3224: bl       #0x2184724 ; -> ??? 0x2184724
  0x24d3228: mov      w8, #1
  0x24d322c: strb     w8, [x22, #0x949]
  0x24d3230: adrp     x28, #0x551f000
  0x24d3234: adrp     x27, #0x5512000
  0x24d3238: adrp     x26, #0x551f000
  0x24d323c: ldr      x28, [x28, #0x5e8] ; = 0x0 (u64 @ 0x551f5e8)
  0x24d3240: ldr      x27, [x27, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d3244: ldr      x26, [x26, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d3248: cmp      w21, #0x17
  0x24d324c: stp      xzr, xzr, [sp, #0x40]
  0x24d3250: str      xzr, [sp, #0x50]
  0x24d3254: stp      xzr, xzr, [sp, #0x20]
  0x24d3258: str      xzr, [sp, #0x30]
  0x24d325c: b.eq     #0x24d35b8
  0x24d3260: cmp      w21, #0x18
  0x24d3264: b.ne     #0x24d34b8
  0x24d3268: ldr      x0, [x29, #0x10]
  0x24d326c: cbz      x0, #0x24d441c
  0x24d3270: adrp     x8, #0x551f000
  0x24d3274: ldr      x8, [x8, #0x6b8] ; = 0x0 (u64 @ 0x551f6b8)
  0x24d3278: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d327c: add      x8, sp, #8
  0x24d3280: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3284: ldur     q0, [sp, #8]
  0x24d3288: ldr      x8, [sp, #0x18]
  0x24d328c: adrp     x22, #0x551f000
  0x24d3290: str      q0, [sp, #0x40]
  0x24d3294: str      x8, [sp, #0x50]
  0x24d3298: ldr      x22, [x22, #0x6a8] ; = 0x0 (u64 @ 0x551f6a8)
  0x24d329c: ldr      x1, [x22] ; = 0x0 (u64 @ 0x551f000)
  0x24d32a0: add      x0, sp, #0x40
  0x24d32a4: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d32a8: tbz      w0, #0, #0x24d3418
  0x24d32ac: ldr      x8, [sp, #0x50]
  0x24d32b0: cbz      x8, #0x24d3458
  0x24d32b4: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x551f030)
  0x24d32b8: cbz      x0, #0x24d344c
  0x24d32bc: adrp     x8, #0x551f000
  0x24d32c0: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d32c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d32c8: add      x8, sp, #8
  0x24d32cc: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d32d0: ldur     q0, [sp, #8]
  0x24d32d4: ldr      x8, [sp, #0x18]
  0x24d32d8: str      q0, [sp, #0x20]
  0x24d32dc: str      x8, [sp, #0x30]
  0x24d32e0: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d32e4: add      x0, sp, #0x20
  0x24d32e8: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d32ec: tbz      w0, #0, #0x24d33a0
  0x24d32f0: ldr      x23, [sp, #0x30]
  0x24d32f4: cbz      x23, #0x24d33c8
  0x24d32f8: ldr      w8, [x23, #0x24]
  0x24d32fc: cmp      w8, #0x1e
  0x24d3300: b.ne     #0x24d3310
  0x24d3304: ldr      w8, [x23, #0x28]
  0x24d3308: cmp      w8, #1
  0x24d330c: b.eq     #0x24d32e0
  0x24d3310: mov      x0, x23
  0x24d3314: mov      w1, w20
  0x24d3318: mov      x2, xzr
  0x24d331c: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3320: tbz      w0, #0, #0x24d32e0
  0x24d3324: mov      w1, #0x18
  0x24d3328: mov      x0, x23
  0x24d332c: mov      x2, xzr
  0x24d3330: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3334: tbz      w0, #0, #0x24d32e0
  0x24d3338: ldr      x0, [x19]
  0x24d333c: cbz      x0, #0x24d33d8
  0x24d3340: ldr      w10, [x0, #0x1c]
  0x24d3344: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3348: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d334c: add      w10, w10, #1
  0x24d3350: str      w10, [x0, #0x1c]
  0x24d3354: cbz      x8, #0x24d33d0
  0x24d3358: ldrsw    x10, [x0, #0x18]
  0x24d335c: ldr      w11, [x8, #0x18]
  0x24d3360: cmp      w10, w11
  0x24d3364: b.hs     #0x24d3388
  0x24d3368: add      w9, w10, #1
  0x24d336c: add      x8, x8, x10, lsl #3
  0x24d3370: str      w9, [x0, #0x18]
  0x24d3374: str      x23, [x8, #0x20]!
  0x24d3378: mov      x0, x8
  0x24d337c: mov      x1, x23
  0x24d3380: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3384: b        #0x24d32e0
  0x24d3388: ldr      x8, [x9, #0x20]
  0x24d338c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3390: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3394: mov      x1, x23
  0x24d3398: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d339c: b        #0x24d32e0
  0x24d33a0: mov      x25, xzr
  0x24d33a4: mov      w23, #3
  0x24d33a8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d33ac: add      x0, sp, #0x20
  0x24d33b0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d33b4: cbnz     x25, #0x24d3450
  0x24d33b8: cmp      w23, #3
  0x24d33bc: b.eq     #0x24d329c
  0x24d33c0: cbz      w23, #0x24d329c
  0x24d33c4: b        #0x24d4328
  0x24d33c8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d33cc: b        #0x24d345c
  0x24d33d0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d33d4: b        #0x24d345c
  0x24d33d8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d33dc: b        #0x24d345c
  0x24d33e0: b        #0x24d33f4
  0x24d33e4: b        #0x24d33f4
  0x24d33e8: b        #0x24d33f4
  0x24d33ec: b        #0x24d33f4
  0x24d33f0: b        #0x24d33f4
  0x24d33f4: mov      x23, x0
  0x24d33f8: cmp      w1, #1
  0x24d33fc: b.ne     #0x24d342c
  0x24d3400: mov      x0, x23
  0x24d3404: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d3408: ldr      x25, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d340c: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d3410: mov      w23, wzr
  0x24d3414: b        #0x24d33a8
  0x24d3418: adrp     x8, #0x551f000
  0x24d341c: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d3420: add      x0, sp, #0x40
  0x24d3424: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3428: b        #0x24d35b4
  0x24d342c: str      x1, [sp]
  0x24d3430: mov      x25, xzr
  0x24d3434: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3438: add      x0, sp, #0x20
  0x24d343c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3440: cbz      x25, #0x24d3484
  0x24d3444: mov      x0, x25
  0x24d3448: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d344c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d3450: mov      x0, x25
  0x24d3454: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d3458: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d345c: mov      x23, x0
  0x24d3460: str      x1, [sp]
  0x24d3464: b        #0x24d3434
  0x24d3468: b        #0x24d347c
  0x24d346c: b        #0x24d347c
  0x24d3470: b        #0x24d347c
  0x24d3474: b        #0x24d347c
  0x24d3478: b        #0x24d347c
  0x24d347c: mov      x23, x0
  0x24d3480: str      x1, [sp]
  0x24d3484: ldr      x8, [sp]
  0x24d3488: cmp      w8, #1
  0x24d348c: b.ne     #0x24d4434
  0x24d3490: mov      x0, x23
  0x24d3494: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d3498: ldr      x25, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d349c: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d34a0: adrp     x8, #0x551f000
  0x24d34a4: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d34a8: add      x0, sp, #0x40
  0x24d34ac: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d34b0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d34b4: cbnz     x25, #0x24d4520
  0x24d34b8: mov      x0, x29
  0x24d34bc: mov      w1, w21
  0x24d34c0: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x24d34c4: cbz      x0, #0x24d35b8
  0x24d34c8: mov      x0, x29
  0x24d34cc: mov      w1, w21
  0x24d34d0: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x24d34d4: cbz      x0, #0x24d441c
  0x24d34d8: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x551f030)
  0x24d34dc: cbz      x0, #0x24d441c
  0x24d34e0: adrp     x8, #0x551f000
  0x24d34e4: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d34e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d34ec: add      x8, sp, #8
  0x24d34f0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d34f4: ldur     q0, [sp, #8]
  0x24d34f8: ldr      x8, [sp, #0x18]
  0x24d34fc: str      q0, [sp, #0x20]
  0x24d3500: str      x8, [sp, #0x30]
  0x24d3504: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3508: add      x0, sp, #0x20
  0x24d350c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3510: tbz      w0, #0, #0x24d35ac
  0x24d3514: ldr      x23, [sp, #0x30]
  0x24d3518: cbz      x23, #0x24d43b8
  0x24d351c: mov      x0, x23
  0x24d3520: mov      w1, w20
  0x24d3524: mov      x2, xzr
  0x24d3528: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d352c: tbz      w0, #0, #0x24d3504
  0x24d3530: mov      x0, x23
  0x24d3534: mov      w1, w21
  0x24d3538: mov      x2, xzr
  0x24d353c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3540: tbz      w0, #0, #0x24d3504
  0x24d3544: ldr      x0, [x19]
  0x24d3548: cbz      x0, #0x24d4424
  0x24d354c: ldr      w10, [x0, #0x1c]
  0x24d3550: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3554: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3558: add      w10, w10, #1
  0x24d355c: str      w10, [x0, #0x1c]
  0x24d3560: cbz      x8, #0x24d4428
  0x24d3564: ldrsw    x10, [x0, #0x18]
  0x24d3568: ldr      w11, [x8, #0x18]
  0x24d356c: cmp      w10, w11
  0x24d3570: b.hs     #0x24d3594
  0x24d3574: add      w9, w10, #1
  0x24d3578: add      x8, x8, x10, lsl #3
  0x24d357c: str      w9, [x0, #0x18]
  0x24d3580: str      x23, [x8, #0x20]!
  0x24d3584: mov      x0, x8
  0x24d3588: mov      x1, x23
  0x24d358c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3590: b        #0x24d3504
  0x24d3594: ldr      x8, [x9, #0x20]
  0x24d3598: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d359c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d35a0: mov      x1, x23
  0x24d35a4: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d35a8: b        #0x24d3504
  0x24d35ac: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d35b0: add      x0, sp, #0x20
  0x24d35b4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d35b8: tbz      w24, #0, #0x24d39f0
  0x24d35bc: ldr      x0, [x29, #0x10]
  0x24d35c0: str      x29, [sp]
  0x24d35c4: cbz      x0, #0x24d441c
  0x24d35c8: adrp     x8, #0x551f000
  0x24d35cc: ldr      x8, [x8, #0x6b8] ; = 0x0 (u64 @ 0x551f6b8)
  0x24d35d0: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d35d4: add      x8, sp, #8
  0x24d35d8: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d35dc: ldur     q0, [sp, #8]
  0x24d35e0: ldr      x8, [sp, #0x18]
  0x24d35e4: adrp     x29, #0x551f000
  0x24d35e8: adrp     x27, #0x551f000
  0x24d35ec: ldr      x29, [x29, #0x7c8] ; = 0x0 (u64 @ 0x551f7c8)
  0x24d35f0: ldr      x27, [x27, #0x7c0] ; = 0x0 (u64 @ 0x551f7c0)
  0x24d35f4: str      q0, [sp, #0x40]
  0x24d35f8: str      x8, [sp, #0x50]
  0x24d35fc: adrp     x22, #0x551f000
  0x24d3600: ldr      x22, [x22, #0x7b0] ; = 0x0 (u64 @ 0x551f7b0)
  0x24d3604: adrp     x8, #0x551f000
  0x24d3608: ldr      x8, [x8, #0x6a8] ; = 0x0 (u64 @ 0x551f6a8)
  0x24d360c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3610: add      x0, sp, #0x40
  0x24d3614: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3618: tbz      w0, #0, #0x24d3834
  0x24d361c: ldr      x8, [sp, #0x50]
  0x24d3620: cbz      x8, #0x24d43a8
  0x24d3624: ldr      x9, [x8, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3628: cbz      x9, #0x24d43ac
  0x24d362c: ldr      w9, [x9, #0x3c]
  0x24d3630: cmp      w9, #1
  0x24d3634: b.le     #0x24d3604
  0x24d3638: ldr      x0, [x8, #0x30] ; = 0x0 (u64 @ 0x551f030)
  0x24d363c: cbz      x0, #0x24d43bc
  0x24d3640: adrp     x8, #0x551f000
  0x24d3644: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3648: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d364c: add      x8, sp, #8
  0x24d3650: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3654: ldur     q0, [sp, #8]
  0x24d3658: ldr      x8, [sp, #0x18]
  0x24d365c: str      q0, [sp, #0x20]
  0x24d3660: str      x8, [sp, #0x30]
  0x24d3664: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3668: add      x0, sp, #0x20
  0x24d366c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3670: tbz      w0, #0, #0x24d377c
  0x24d3674: ldr      x0, [x29] ; = 0x0 (u64 @ 0x551f000)
  0x24d3678: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x24d367c: mov      x24, x0
  0x24d3680: mov      x1, xzr
  0x24d3684: bl       #0x48e6ab0 ; -> System.Object$$.ctor
  0x24d3688: cbz      x24, #0x24d37ac
  0x24d368c: ldr      x1, [sp, #0x30]
  0x24d3690: mov      x23, x24
  0x24d3694: str      x1, [x23, #0x10]!
  0x24d3698: mov      x0, x23
  0x24d369c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d36a0: ldr      x0, [x23]
  0x24d36a4: cbz      x0, #0x24d37b4
  0x24d36a8: mov      w1, w20
  0x24d36ac: mov      x2, xzr
  0x24d36b0: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d36b4: tbz      w0, #0, #0x24d3664
  0x24d36b8: ldr      x0, [x23]
  0x24d36bc: cbz      x0, #0x24d37bc
  0x24d36c0: mov      w1, w21
  0x24d36c4: mov      x2, xzr
  0x24d36c8: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d36cc: tbz      w0, #0, #0x24d3664
  0x24d36d0: adrp     x8, #0x551f000
  0x24d36d4: ldr      x25, [x19]
  0x24d36d8: ldr      x8, [x8, #0x7b8] ; = 0x0 (u64 @ 0x551f7b8)
  0x24d36dc: ldr      x0, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d36e0: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x24d36e4: ldr      x2, [x27] ; = 0x0 (u64 @ 0x551f000)
  0x24d36e8: mov      x26, x0
  0x24d36ec: mov      x1, x24
  0x24d36f0: mov      x3, xzr
  0x24d36f4: bl       #0x463389c ; -> System.Predicate<object>$$.ctor
  0x24d36f8: cbz      x25, #0x24d37c4
  0x24d36fc: ldr      x2, [x22] ; = 0x0 (u64 @ 0x551f000)
  0x24d3700: mov      x0, x25
  0x24d3704: mov      x1, x26
  0x24d3708: bl       #0x444ae4c ; -> System.Collections.Generic.List<object>$$Exists
  0x24d370c: tbnz     w0, #0, #0x24d3664
  0x24d3710: ldr      x0, [x19]
  0x24d3714: cbz      x0, #0x24d37cc
  0x24d3718: adrp     x9, #0x5512000
  0x24d371c: ldr      x1, [x23]
  0x24d3720: ldr      w10, [x0, #0x1c]
  0x24d3724: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3728: ldr      x9, [x9, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d372c: add      w10, w10, #1
  0x24d3730: ldr      x9, [x9] ; = 0x0 (u64 @ 0x5512000)
  0x24d3734: str      w10, [x0, #0x1c]
  0x24d3738: cbz      x8, #0x24d37d4
  0x24d373c: ldrsw    x10, [x0, #0x18]
  0x24d3740: ldr      w11, [x8, #0x18]
  0x24d3744: cmp      w10, w11
  0x24d3748: b.hs     #0x24d3768
  0x24d374c: add      w9, w10, #1
  0x24d3750: add      x8, x8, x10, lsl #3
  0x24d3754: str      w9, [x0, #0x18]
  0x24d3758: str      x1, [x8, #0x20]!
  0x24d375c: mov      x0, x8
  0x24d3760: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3764: b        #0x24d3664
  0x24d3768: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d376c: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3770: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3774: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3778: b        #0x24d3664
  0x24d377c: mov      x25, xzr
  0x24d3780: mov      w23, #0xc
  0x24d3784: adrp     x8, #0x551f000
  0x24d3788: ldr      x8, [x8, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d378c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3790: add      x0, sp, #0x20
  0x24d3794: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3798: cbnz     x25, #0x24d43c0
  0x24d379c: cmp      w23, #0xc
  0x24d37a0: b.eq     #0x24d3604
  0x24d37a4: cbz      w23, #0x24d3604
  0x24d37a8: b        #0x24d4328
  0x24d37ac: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37b0: b        #0x24d4434
  0x24d37b4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37b8: b        #0x24d4434
  0x24d37bc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37c0: b        #0x24d4434
  0x24d37c4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37c8: b        #0x24d4434
  0x24d37cc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37d0: b        #0x24d4434
  0x24d37d4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d37d8: b        #0x24d4434
  0x24d37dc: b        #0x24d380c
  0x24d37e0: b        #0x24d380c
  0x24d37e4: b        #0x24d380c
  0x24d37e8: b        #0x24d380c
  0x24d37ec: b        #0x24d380c
  0x24d37f0: b        #0x24d380c
  0x24d37f4: b        #0x24d380c
  0x24d37f8: b        #0x24d380c
  0x24d37fc: b        #0x24d380c
  0x24d3800: b        #0x24d380c
  0x24d3804: b        #0x24d380c
  0x24d3808: b        #0x24d380c
  0x24d380c: mov      x24, x1
  0x24d3810: mov      x23, x0
  0x24d3814: cmp      w24, #1
  0x24d3818: b.ne     #0x24d435c
  0x24d381c: mov      x0, x23
  0x24d3820: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d3824: ldr      x25, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d3828: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d382c: mov      w23, wzr
  0x24d3830: b        #0x24d3784
  0x24d3834: adrp     x8, #0x551f000
  0x24d3838: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d383c: add      x0, sp, #0x40
  0x24d3840: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3844: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3848: ldr      x29, [sp]
  0x24d384c: mov      w1, #7
  0x24d3850: mov      x0, x29
  0x24d3854: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x24d3858: adrp     x26, #0x551f000
  0x24d385c: adrp     x27, #0x5512000
  0x24d3860: ldr      x26, [x26, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d3864: ldr      x27, [x27, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d3868: cbz      x0, #0x24d39f0
  0x24d386c: mov      w1, #7
  0x24d3870: mov      x0, x29
  0x24d3874: bl       #0x24cefec ; -> CSkillManager$$GetSkill
  0x24d3878: cbz      x0, #0x24d441c
  0x24d387c: ldr      x0, [x0, #0x30] ; = 0x0 (u64 @ 0x551f030)
  0x24d3880: cbz      x0, #0x24d441c
  0x24d3884: adrp     x8, #0x551f000
  0x24d3888: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d388c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3890: add      x8, sp, #8
  0x24d3894: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3898: ldur     q0, [sp, #8]
  0x24d389c: ldr      x8, [sp, #0x18]
  0x24d38a0: adrp     x27, #0x551f000
  0x24d38a4: ldr      x27, [x27, #0x7d8] ; = 0x0 (u64 @ 0x551f7d8)
  0x24d38a8: str      q0, [sp, #0x20]
  0x24d38ac: str      x8, [sp, #0x30]
  0x24d38b0: adrp     x29, #0x551f000
  0x24d38b4: ldr      x29, [x29, #0x7d0] ; = 0x0 (u64 @ 0x551f7d0)
  0x24d38b8: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d38bc: add      x0, sp, #0x20
  0x24d38c0: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d38c4: tbz      w0, #0, #0x24d39d0
  0x24d38c8: ldr      x0, [x27] ; = 0x0 (u64 @ 0x551f000)
  0x24d38cc: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x24d38d0: mov      x24, x0
  0x24d38d4: mov      x1, xzr
  0x24d38d8: bl       #0x48e6ab0 ; -> System.Object$$.ctor
  0x24d38dc: cbz      x24, #0x24d43b0
  0x24d38e0: ldr      x1, [sp, #0x30]
  0x24d38e4: mov      x23, x24
  0x24d38e8: str      x1, [x23, #0x10]!
  0x24d38ec: mov      x0, x23
  0x24d38f0: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d38f4: ldr      x0, [x23]
  0x24d38f8: cbz      x0, #0x24d43b4
  0x24d38fc: mov      w1, w20
  0x24d3900: mov      x2, xzr
  0x24d3904: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3908: tbz      w0, #0, #0x24d38b8
  0x24d390c: ldr      x0, [x23]
  0x24d3910: cbz      x0, #0x24d43f8
  0x24d3914: mov      w1, w21
  0x24d3918: mov      x2, xzr
  0x24d391c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3920: tbz      w0, #0, #0x24d38b8
  0x24d3924: adrp     x8, #0x551f000
  0x24d3928: ldr      x25, [x19]
  0x24d392c: ldr      x8, [x8, #0x7b8] ; = 0x0 (u64 @ 0x551f7b8)
  0x24d3930: ldr      x0, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3934: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x24d3938: ldr      x2, [x29] ; = 0x0 (u64 @ 0x551f000)
  0x24d393c: mov      x26, x0
  0x24d3940: mov      x1, x24
  0x24d3944: mov      x3, xzr
  0x24d3948: bl       #0x463389c ; -> System.Predicate<object>$$.ctor
  0x24d394c: cbz      x25, #0x24d4420
  0x24d3950: ldr      x2, [x22] ; = 0x0 (u64 @ 0x551f000)
  0x24d3954: mov      x0, x25
  0x24d3958: mov      x1, x26
  0x24d395c: bl       #0x444ae4c ; -> System.Collections.Generic.List<object>$$Exists
  0x24d3960: tbnz     w0, #0, #0x24d38b8
  0x24d3964: ldr      x0, [x19]
  0x24d3968: cbz      x0, #0x24d442c
  0x24d396c: adrp     x9, #0x5512000
  0x24d3970: ldr      x1, [x23]
  0x24d3974: ldr      w10, [x0, #0x1c]
  0x24d3978: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d397c: ldr      x9, [x9, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d3980: add      w10, w10, #1
  0x24d3984: ldr      x9, [x9] ; = 0x0 (u64 @ 0x5512000)
  0x24d3988: str      w10, [x0, #0x1c]
  0x24d398c: cbz      x8, #0x24d4430
  0x24d3990: ldrsw    x10, [x0, #0x18]
  0x24d3994: ldr      w11, [x8, #0x18]
  0x24d3998: cmp      w10, w11
  0x24d399c: b.hs     #0x24d39bc
  0x24d39a0: add      w9, w10, #1
  0x24d39a4: add      x8, x8, x10, lsl #3
  0x24d39a8: str      w9, [x0, #0x18]
  0x24d39ac: str      x1, [x8, #0x20]!
  0x24d39b0: mov      x0, x8
  0x24d39b4: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d39b8: b        #0x24d38b8
  0x24d39bc: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d39c0: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d39c4: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d39c8: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d39cc: b        #0x24d38b8
  0x24d39d0: adrp     x26, #0x551f000
  0x24d39d4: ldr      x26, [x26, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d39d8: add      x0, sp, #0x20
  0x24d39dc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d39e0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d39e4: adrp     x27, #0x5512000
  0x24d39e8: ldr      x27, [x27, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d39ec: ldr      x29, [sp]
  0x24d39f0: ldr      x0, [x29, #0x18] ; = 0x0 (u64 @ 0x551f018)
  0x24d39f4: cbz      x0, #0x24d441c
  0x24d39f8: adrp     x8, #0x551f000
  0x24d39fc: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3a00: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3a04: add      x8, sp, #8
  0x24d3a08: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3a0c: ldur     q0, [sp, #8]
  0x24d3a10: ldr      x8, [sp, #0x18]
  0x24d3a14: str      q0, [sp, #0x20]
  0x24d3a18: str      x8, [sp, #0x30]
  0x24d3a1c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3a20: add      x0, sp, #0x20
  0x24d3a24: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3a28: tbz      w0, #0, #0x24d3adc
  0x24d3a2c: ldr      x23, [sp, #0x30]
  0x24d3a30: cbz      x23, #0x24d4380
  0x24d3a34: ldr      w8, [x23, #0x24]
  0x24d3a38: cmp      w8, #0x1e
  0x24d3a3c: b.ne     #0x24d3a4c
  0x24d3a40: ldr      w8, [x23, #0x28]
  0x24d3a44: cmp      w8, #1
  0x24d3a48: b.eq     #0x24d3a1c
  0x24d3a4c: mov      x0, x23
  0x24d3a50: mov      w1, w20
  0x24d3a54: mov      x2, xzr
  0x24d3a58: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3a5c: tbz      w0, #0, #0x24d3a1c
  0x24d3a60: mov      x0, x23
  0x24d3a64: mov      w1, w21
  0x24d3a68: mov      x2, xzr
  0x24d3a6c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3a70: tbz      w0, #0, #0x24d3a1c
  0x24d3a74: ldr      x0, [x19]
  0x24d3a78: cbz      x0, #0x24d43cc
  0x24d3a7c: ldr      w10, [x0, #0x1c]
  0x24d3a80: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3a84: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3a88: add      w10, w10, #1
  0x24d3a8c: str      w10, [x0, #0x1c]
  0x24d3a90: cbz      x8, #0x24d43c8
  0x24d3a94: ldrsw    x10, [x0, #0x18]
  0x24d3a98: ldr      w11, [x8, #0x18]
  0x24d3a9c: cmp      w10, w11
  0x24d3aa0: b.hs     #0x24d3ac4
  0x24d3aa4: add      w9, w10, #1
  0x24d3aa8: add      x8, x8, x10, lsl #3
  0x24d3aac: str      w9, [x0, #0x18]
  0x24d3ab0: str      x23, [x8, #0x20]!
  0x24d3ab4: mov      x0, x8
  0x24d3ab8: mov      x1, x23
  0x24d3abc: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3ac0: b        #0x24d3a1c
  0x24d3ac4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3ac8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3acc: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3ad0: mov      x1, x23
  0x24d3ad4: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3ad8: b        #0x24d3a1c
  0x24d3adc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3ae0: add      x0, sp, #0x20
  0x24d3ae4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3ae8: ldr      x0, [x29, #0x20] ; = 0x0 (u64 @ 0x551f020)
  0x24d3aec: cbz      x0, #0x24d3bc8
  0x24d3af0: adrp     x8, #0x551f000
  0x24d3af4: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3af8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3afc: add      x8, sp, #8
  0x24d3b00: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3b04: ldur     q0, [sp, #8]
  0x24d3b08: ldr      x8, [sp, #0x18]
  0x24d3b0c: str      q0, [sp, #0x20]
  0x24d3b10: str      x8, [sp, #0x30]
  0x24d3b14: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3b18: add      x0, sp, #0x20
  0x24d3b1c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3b20: tbz      w0, #0, #0x24d3bbc
  0x24d3b24: ldr      x23, [sp, #0x30]
  0x24d3b28: cbz      x23, #0x24d4394
  0x24d3b2c: mov      x0, x23
  0x24d3b30: mov      w1, w20
  0x24d3b34: mov      x2, xzr
  0x24d3b38: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3b3c: tbz      w0, #0, #0x24d3b14
  0x24d3b40: mov      x0, x23
  0x24d3b44: mov      w1, w21
  0x24d3b48: mov      x2, xzr
  0x24d3b4c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3b50: tbz      w0, #0, #0x24d3b14
  0x24d3b54: ldr      x0, [x19]
  0x24d3b58: cbz      x0, #0x24d43d0
  0x24d3b5c: ldr      w10, [x0, #0x1c]
  0x24d3b60: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3b64: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3b68: add      w10, w10, #1
  0x24d3b6c: str      w10, [x0, #0x1c]
  0x24d3b70: cbz      x8, #0x24d43e4
  0x24d3b74: ldrsw    x10, [x0, #0x18]
  0x24d3b78: ldr      w11, [x8, #0x18]
  0x24d3b7c: cmp      w10, w11
  0x24d3b80: b.hs     #0x24d3ba4
  0x24d3b84: add      w9, w10, #1
  0x24d3b88: add      x8, x8, x10, lsl #3
  0x24d3b8c: str      w9, [x0, #0x18]
  0x24d3b90: str      x23, [x8, #0x20]!
  0x24d3b94: mov      x0, x8
  0x24d3b98: mov      x1, x23
  0x24d3b9c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3ba0: b        #0x24d3b14
  0x24d3ba4: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3ba8: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3bac: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3bb0: mov      x1, x23
  0x24d3bb4: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3bb8: b        #0x24d3b14
  0x24d3bbc: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3bc0: add      x0, sp, #0x20
  0x24d3bc4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3bc8: ldr      x0, [x29, #0x28] ; = 0x0 (u64 @ 0x551f028)
  0x24d3bcc: cbz      x0, #0x24d3ca8
  0x24d3bd0: adrp     x8, #0x551f000
  0x24d3bd4: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3bd8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3bdc: add      x8, sp, #8
  0x24d3be0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3be4: ldur     q0, [sp, #8]
  0x24d3be8: ldr      x8, [sp, #0x18]
  0x24d3bec: str      q0, [sp, #0x20]
  0x24d3bf0: str      x8, [sp, #0x30]
  0x24d3bf4: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3bf8: add      x0, sp, #0x20
  0x24d3bfc: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3c00: tbz      w0, #0, #0x24d3c9c
  0x24d3c04: ldr      x23, [sp, #0x30]
  0x24d3c08: cbz      x23, #0x24d4398
  0x24d3c0c: mov      x0, x23
  0x24d3c10: mov      w1, w20
  0x24d3c14: mov      x2, xzr
  0x24d3c18: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3c1c: tbz      w0, #0, #0x24d3bf4
  0x24d3c20: mov      x0, x23
  0x24d3c24: mov      w1, w21
  0x24d3c28: mov      x2, xzr
  0x24d3c2c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3c30: tbz      w0, #0, #0x24d3bf4
  0x24d3c34: ldr      x0, [x19]
  0x24d3c38: cbz      x0, #0x24d43d4
  0x24d3c3c: ldr      w10, [x0, #0x1c]
  0x24d3c40: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3c44: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3c48: add      w10, w10, #1
  0x24d3c4c: str      w10, [x0, #0x1c]
  0x24d3c50: cbz      x8, #0x24d43e8
  0x24d3c54: ldrsw    x10, [x0, #0x18]
  0x24d3c58: ldr      w11, [x8, #0x18]
  0x24d3c5c: cmp      w10, w11
  0x24d3c60: b.hs     #0x24d3c84
  0x24d3c64: add      w9, w10, #1
  0x24d3c68: add      x8, x8, x10, lsl #3
  0x24d3c6c: str      w9, [x0, #0x18]
  0x24d3c70: str      x23, [x8, #0x20]!
  0x24d3c74: mov      x0, x8
  0x24d3c78: mov      x1, x23
  0x24d3c7c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3c80: b        #0x24d3bf4
  0x24d3c84: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3c88: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3c8c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3c90: mov      x1, x23
  0x24d3c94: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3c98: b        #0x24d3bf4
  0x24d3c9c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3ca0: add      x0, sp, #0x20
  0x24d3ca4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3ca8: ldr      x0, [x29, #0x30] ; = 0x0 (u64 @ 0x551f030)
  0x24d3cac: cbz      x0, #0x24d3d88
  0x24d3cb0: adrp     x8, #0x551f000
  0x24d3cb4: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3cb8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3cbc: add      x8, sp, #8
  0x24d3cc0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3cc4: ldur     q0, [sp, #8]
  0x24d3cc8: ldr      x8, [sp, #0x18]
  0x24d3ccc: str      q0, [sp, #0x20]
  0x24d3cd0: str      x8, [sp, #0x30]
  0x24d3cd4: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3cd8: add      x0, sp, #0x20
  0x24d3cdc: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3ce0: tbz      w0, #0, #0x24d3d7c
  0x24d3ce4: ldr      x23, [sp, #0x30]
  0x24d3ce8: cbz      x23, #0x24d439c
  0x24d3cec: mov      x0, x23
  0x24d3cf0: mov      w1, w20
  0x24d3cf4: mov      x2, xzr
  0x24d3cf8: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3cfc: tbz      w0, #0, #0x24d3cd4
  0x24d3d00: mov      x0, x23
  0x24d3d04: mov      w1, w21
  0x24d3d08: mov      x2, xzr
  0x24d3d0c: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3d10: tbz      w0, #0, #0x24d3cd4
  0x24d3d14: ldr      x0, [x19]
  0x24d3d18: cbz      x0, #0x24d43d8
  0x24d3d1c: ldr      w10, [x0, #0x1c]
  0x24d3d20: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3d24: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3d28: add      w10, w10, #1
  0x24d3d2c: str      w10, [x0, #0x1c]
  0x24d3d30: cbz      x8, #0x24d43ec
  0x24d3d34: ldrsw    x10, [x0, #0x18]
  0x24d3d38: ldr      w11, [x8, #0x18]
  0x24d3d3c: cmp      w10, w11
  0x24d3d40: b.hs     #0x24d3d64
  0x24d3d44: add      w9, w10, #1
  0x24d3d48: add      x8, x8, x10, lsl #3
  0x24d3d4c: str      w9, [x0, #0x18]
  0x24d3d50: str      x23, [x8, #0x20]!
  0x24d3d54: mov      x0, x8
  0x24d3d58: mov      x1, x23
  0x24d3d5c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3d60: b        #0x24d3cd4
  0x24d3d64: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3d68: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3d6c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3d70: mov      x1, x23
  0x24d3d74: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3d78: b        #0x24d3cd4
  0x24d3d7c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3d80: add      x0, sp, #0x20
  0x24d3d84: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3d88: ldr      x0, [x29, #0x38] ; = 0x0 (u64 @ 0x551f038)
  0x24d3d8c: cbz      x0, #0x24d3e68
  0x24d3d90: adrp     x8, #0x551f000
  0x24d3d94: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3d98: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3d9c: add      x8, sp, #8
  0x24d3da0: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3da4: ldur     q0, [sp, #8]
  0x24d3da8: ldr      x8, [sp, #0x18]
  0x24d3dac: str      q0, [sp, #0x20]
  0x24d3db0: str      x8, [sp, #0x30]
  0x24d3db4: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3db8: add      x0, sp, #0x20
  0x24d3dbc: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3dc0: tbz      w0, #0, #0x24d3e5c
  0x24d3dc4: ldr      x23, [sp, #0x30]
  0x24d3dc8: cbz      x23, #0x24d43a0
  0x24d3dcc: mov      x0, x23
  0x24d3dd0: mov      w1, w20
  0x24d3dd4: mov      x2, xzr
  0x24d3dd8: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3ddc: tbz      w0, #0, #0x24d3db4
  0x24d3de0: mov      x0, x23
  0x24d3de4: mov      w1, w21
  0x24d3de8: mov      x2, xzr
  0x24d3dec: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3df0: tbz      w0, #0, #0x24d3db4
  0x24d3df4: ldr      x0, [x19]
  0x24d3df8: cbz      x0, #0x24d43dc
  0x24d3dfc: ldr      w10, [x0, #0x1c]
  0x24d3e00: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3e04: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3e08: add      w10, w10, #1
  0x24d3e0c: str      w10, [x0, #0x1c]
  0x24d3e10: cbz      x8, #0x24d43f0
  0x24d3e14: ldrsw    x10, [x0, #0x18]
  0x24d3e18: ldr      w11, [x8, #0x18]
  0x24d3e1c: cmp      w10, w11
  0x24d3e20: b.hs     #0x24d3e44
  0x24d3e24: add      w9, w10, #1
  0x24d3e28: add      x8, x8, x10, lsl #3
  0x24d3e2c: str      w9, [x0, #0x18]
  0x24d3e30: str      x23, [x8, #0x20]!
  0x24d3e34: mov      x0, x8
  0x24d3e38: mov      x1, x23
  0x24d3e3c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3e40: b        #0x24d3db4
  0x24d3e44: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3e48: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3e4c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3e50: mov      x1, x23
  0x24d3e54: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3e58: b        #0x24d3db4
  0x24d3e5c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3e60: add      x0, sp, #0x20
  0x24d3e64: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3e68: ldr      x0, [x29, #0x58] ; = 0x0 (u64 @ 0x551f058)
  0x24d3e6c: cbz      x0, #0x24d3f48
  0x24d3e70: adrp     x8, #0x551f000
  0x24d3e74: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3e78: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3e7c: add      x8, sp, #8
  0x24d3e80: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3e84: ldur     q0, [sp, #8]
  0x24d3e88: ldr      x8, [sp, #0x18]
  0x24d3e8c: str      q0, [sp, #0x20]
  0x24d3e90: str      x8, [sp, #0x30]
  0x24d3e94: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3e98: add      x0, sp, #0x20
  0x24d3e9c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3ea0: tbz      w0, #0, #0x24d3f3c
  0x24d3ea4: ldr      x23, [sp, #0x30]
  0x24d3ea8: cbz      x23, #0x24d43a4
  0x24d3eac: mov      x0, x23
  0x24d3eb0: mov      w1, w20
  0x24d3eb4: mov      x2, xzr
  0x24d3eb8: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3ebc: tbz      w0, #0, #0x24d3e94
  0x24d3ec0: mov      x0, x23
  0x24d3ec4: mov      w1, w21
  0x24d3ec8: mov      x2, xzr
  0x24d3ecc: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3ed0: tbz      w0, #0, #0x24d3e94
  0x24d3ed4: ldr      x0, [x19]
  0x24d3ed8: cbz      x0, #0x24d43e0
  0x24d3edc: ldr      w10, [x0, #0x1c]
  0x24d3ee0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3ee4: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3ee8: add      w10, w10, #1
  0x24d3eec: str      w10, [x0, #0x1c]
  0x24d3ef0: cbz      x8, #0x24d43f4
  0x24d3ef4: ldrsw    x10, [x0, #0x18]
  0x24d3ef8: ldr      w11, [x8, #0x18]
  0x24d3efc: cmp      w10, w11
  0x24d3f00: b.hs     #0x24d3f24
  0x24d3f04: add      w9, w10, #1
  0x24d3f08: add      x8, x8, x10, lsl #3
  0x24d3f0c: str      w9, [x0, #0x18]
  0x24d3f10: str      x23, [x8, #0x20]!
  0x24d3f14: mov      x0, x8
  0x24d3f18: mov      x1, x23
  0x24d3f1c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d3f20: b        #0x24d3e94
  0x24d3f24: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d3f28: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d3f2c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d3f30: mov      x1, x23
  0x24d3f34: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d3f38: b        #0x24d3e94
  0x24d3f3c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d3f40: add      x0, sp, #0x20
  0x24d3f44: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d3f48: ldr      x0, [x29, #0x40] ; = 0x0 (u64 @ 0x551f040)
  0x24d3f4c: cbz      x0, #0x24d4040
  0x24d3f50: adrp     x8, #0x551f000
  0x24d3f54: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d3f58: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d3f5c: add      x8, sp, #8
  0x24d3f60: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d3f64: ldur     q0, [sp, #8]
  0x24d3f68: ldr      x8, [sp, #0x18]
  0x24d3f6c: str      q0, [sp, #0x20]
  0x24d3f70: str      x8, [sp, #0x30]
  0x24d3f74: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d3f78: add      x0, sp, #0x20
  0x24d3f7c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d3f80: tbz      w0, #0, #0x24d4034
  0x24d3f84: ldr      x23, [sp, #0x30]
  0x24d3f88: cbz      x23, #0x24d4384
  0x24d3f8c: ldr      w8, [x23, #0x24]
  0x24d3f90: cmp      w8, #0x1e
  0x24d3f94: b.ne     #0x24d3fa4
  0x24d3f98: ldr      w8, [x23, #0x28]
  0x24d3f9c: cmp      w8, #1
  0x24d3fa0: b.eq     #0x24d3f74
  0x24d3fa4: mov      x0, x23
  0x24d3fa8: mov      w1, w20
  0x24d3fac: mov      x2, xzr
  0x24d3fb0: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d3fb4: tbz      w0, #0, #0x24d3f74
  0x24d3fb8: mov      x0, x23
  0x24d3fbc: mov      w1, w21
  0x24d3fc0: mov      x2, xzr
  0x24d3fc4: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d3fc8: tbz      w0, #0, #0x24d3f74
  0x24d3fcc: ldr      x0, [x19]
  0x24d3fd0: cbz      x0, #0x24d4404
  0x24d3fd4: ldr      w10, [x0, #0x1c]
  0x24d3fd8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d3fdc: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d3fe0: add      w10, w10, #1
  0x24d3fe4: str      w10, [x0, #0x1c]
  0x24d3fe8: cbz      x8, #0x24d43fc
  0x24d3fec: ldrsw    x10, [x0, #0x18]
  0x24d3ff0: ldr      w11, [x8, #0x18]
  0x24d3ff4: cmp      w10, w11
  0x24d3ff8: b.hs     #0x24d401c
  0x24d3ffc: add      w9, w10, #1
  0x24d4000: add      x8, x8, x10, lsl #3
  0x24d4004: str      w9, [x0, #0x18]
  0x24d4008: str      x23, [x8, #0x20]!
  0x24d400c: mov      x0, x8
  0x24d4010: mov      x1, x23
  0x24d4014: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d4018: b        #0x24d3f74
  0x24d401c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d4020: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d4024: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d4028: mov      x1, x23
  0x24d402c: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d4030: b        #0x24d3f74
  0x24d4034: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4038: add      x0, sp, #0x20
  0x24d403c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4040: ldr      x0, [x29, #0x48] ; = 0x0 (u64 @ 0x551f048)
  0x24d4044: cbz      x0, #0x24d4138
  0x24d4048: adrp     x8, #0x551f000
  0x24d404c: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d4050: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d4054: add      x8, sp, #8
  0x24d4058: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d405c: ldur     q0, [sp, #8]
  0x24d4060: ldr      x8, [sp, #0x18]
  0x24d4064: str      q0, [sp, #0x20]
  0x24d4068: str      x8, [sp, #0x30]
  0x24d406c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d4070: add      x0, sp, #0x20
  0x24d4074: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d4078: tbz      w0, #0, #0x24d412c
  0x24d407c: ldr      x23, [sp, #0x30]
  0x24d4080: cbz      x23, #0x24d4388
  0x24d4084: ldr      w8, [x23, #0x24]
  0x24d4088: cmp      w8, #0x1e
  0x24d408c: b.ne     #0x24d409c
  0x24d4090: ldr      w8, [x23, #0x28]
  0x24d4094: cmp      w8, #1
  0x24d4098: b.eq     #0x24d406c
  0x24d409c: mov      x0, x23
  0x24d40a0: mov      w1, w20
  0x24d40a4: mov      x2, xzr
  0x24d40a8: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d40ac: tbz      w0, #0, #0x24d406c
  0x24d40b0: mov      x0, x23
  0x24d40b4: mov      w1, w21
  0x24d40b8: mov      x2, xzr
  0x24d40bc: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d40c0: tbz      w0, #0, #0x24d406c
  0x24d40c4: ldr      x0, [x19]
  0x24d40c8: cbz      x0, #0x24d440c
  0x24d40cc: ldr      w10, [x0, #0x1c]
  0x24d40d0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d40d4: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d40d8: add      w10, w10, #1
  0x24d40dc: str      w10, [x0, #0x1c]
  0x24d40e0: cbz      x8, #0x24d4400
  0x24d40e4: ldrsw    x10, [x0, #0x18]
  0x24d40e8: ldr      w11, [x8, #0x18]
  0x24d40ec: cmp      w10, w11
  0x24d40f0: b.hs     #0x24d4114
  0x24d40f4: add      w9, w10, #1
  0x24d40f8: add      x8, x8, x10, lsl #3
  0x24d40fc: str      w9, [x0, #0x18]
  0x24d4100: str      x23, [x8, #0x20]!
  0x24d4104: mov      x0, x8
  0x24d4108: mov      x1, x23
  0x24d410c: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d4110: b        #0x24d406c
  0x24d4114: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d4118: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d411c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d4120: mov      x1, x23
  0x24d4124: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d4128: b        #0x24d406c
  0x24d412c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4130: add      x0, sp, #0x20
  0x24d4134: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4138: ldr      x0, [x29, #0x50] ; = 0x0 (u64 @ 0x551f050)
  0x24d413c: cbz      x0, #0x24d4230
  0x24d4140: adrp     x8, #0x551f000
  0x24d4144: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d4148: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d414c: add      x8, sp, #8
  0x24d4150: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d4154: ldur     q0, [sp, #8]
  0x24d4158: ldr      x8, [sp, #0x18]
  0x24d415c: str      q0, [sp, #0x20]
  0x24d4160: str      x8, [sp, #0x30]
  0x24d4164: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d4168: add      x0, sp, #0x20
  0x24d416c: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d4170: tbz      w0, #0, #0x24d4224
  0x24d4174: ldr      x23, [sp, #0x30]
  0x24d4178: cbz      x23, #0x24d438c
  0x24d417c: ldr      w8, [x23, #0x24]
  0x24d4180: cmp      w8, #0x1e
  0x24d4184: b.ne     #0x24d4194
  0x24d4188: ldr      w8, [x23, #0x28]
  0x24d418c: cmp      w8, #1
  0x24d4190: b.eq     #0x24d4164
  0x24d4194: mov      x0, x23
  0x24d4198: mov      w1, w20
  0x24d419c: mov      x2, xzr
  0x24d41a0: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d41a4: tbz      w0, #0, #0x24d4164
  0x24d41a8: mov      x0, x23
  0x24d41ac: mov      w1, w21
  0x24d41b0: mov      x2, xzr
  0x24d41b4: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d41b8: tbz      w0, #0, #0x24d4164
  0x24d41bc: ldr      x0, [x19]
  0x24d41c0: cbz      x0, #0x24d4414
  0x24d41c4: ldr      w10, [x0, #0x1c]
  0x24d41c8: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d41cc: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d41d0: add      w10, w10, #1
  0x24d41d4: str      w10, [x0, #0x1c]
  0x24d41d8: cbz      x8, #0x24d4408
  0x24d41dc: ldrsw    x10, [x0, #0x18]
  0x24d41e0: ldr      w11, [x8, #0x18]
  0x24d41e4: cmp      w10, w11
  0x24d41e8: b.hs     #0x24d420c
  0x24d41ec: add      w9, w10, #1
  0x24d41f0: add      x8, x8, x10, lsl #3
  0x24d41f4: str      w9, [x0, #0x18]
  0x24d41f8: str      x23, [x8, #0x20]!
  0x24d41fc: mov      x0, x8
  0x24d4200: mov      x1, x23
  0x24d4204: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d4208: b        #0x24d4164
  0x24d420c: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d4210: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d4214: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d4218: mov      x1, x23
  0x24d421c: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d4220: b        #0x24d4164
  0x24d4224: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4228: add      x0, sp, #0x20
  0x24d422c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4230: ldr      x0, [x29, #0x60] ; = 0x0 (u64 @ 0x551f060)
  0x24d4234: cbz      x0, #0x24d433c
  0x24d4238: adrp     x8, #0x551f000
  0x24d423c: ldr      x8, [x8, #0x5f8] ; = 0x0 (u64 @ 0x551f5f8)
  0x24d4240: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d4244: add      x8, sp, #8
  0x24d4248: bl       #0x444b3b8 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x24d424c: ldur     q0, [sp, #8]
  0x24d4250: ldr      x8, [sp, #0x18]
  0x24d4254: str      q0, [sp, #0x20]
  0x24d4258: str      x8, [sp, #0x30]
  0x24d425c: ldr      x1, [x28] ; = 0x0 (u64 @ 0x551f000)
  0x24d4260: add      x0, sp, #0x20
  0x24d4264: bl       #0x40a9ccc ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x24d4268: tbz      w0, #0, #0x24d431c
  0x24d426c: ldr      x22, [sp, #0x30]
  0x24d4270: cbz      x22, #0x24d4390
  0x24d4274: ldr      w8, [x22, #0x24]
  0x24d4278: cmp      w8, #0x1e
  0x24d427c: b.ne     #0x24d428c
  0x24d4280: ldr      w8, [x22, #0x28]
  0x24d4284: cmp      w8, #1
  0x24d4288: b.eq     #0x24d425c
  0x24d428c: mov      x0, x22
  0x24d4290: mov      w1, w20
  0x24d4294: mov      x2, xzr
  0x24d4298: bl       #0x25a7114 ; -> CBuffTemplet$$IsBuffCreateType
  0x24d429c: tbz      w0, #0, #0x24d425c
  0x24d42a0: mov      x0, x22
  0x24d42a4: mov      w1, w21
  0x24d42a8: mov      x2, xzr
  0x24d42ac: bl       #0x25a7124 ; -> CBuffTemplet$$IsCallerSkillType
  0x24d42b0: tbz      w0, #0, #0x24d425c
  0x24d42b4: ldr      x0, [x19]
  0x24d42b8: cbz      x0, #0x24d4418
  0x24d42bc: ldr      w10, [x0, #0x1c]
  0x24d42c0: ldr      x8, [x0, #0x10] ; = 0x0 (u64 @ 0x551f010)
  0x24d42c4: ldr      x9, [x27] ; = 0x0 (u64 @ 0x5512000)
  0x24d42c8: add      w10, w10, #1
  0x24d42cc: str      w10, [x0, #0x1c]
  0x24d42d0: cbz      x8, #0x24d4410
  0x24d42d4: ldrsw    x10, [x0, #0x18]
  0x24d42d8: ldr      w11, [x8, #0x18]
  0x24d42dc: cmp      w10, w11
  0x24d42e0: b.hs     #0x24d4304
  0x24d42e4: add      w9, w10, #1
  0x24d42e8: add      x8, x8, x10, lsl #3
  0x24d42ec: str      w9, [x0, #0x18]
  0x24d42f0: str      x22, [x8, #0x20]!
  0x24d42f4: mov      x0, x8
  0x24d42f8: mov      x1, x22
  0x24d42fc: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x24d4300: b        #0x24d425c
  0x24d4304: ldr      x8, [x9, #0x20] ; = 0x0 (u64 @ 0x5512020)
  0x24d4308: ldr      x8, [x8, #0xc0] ; = 0x0 (u64 @ 0x551f0c0)
  0x24d430c: ldr      x2, [x8, #0x70] ; = 0x0 (u64 @ 0x551f070)
  0x24d4310: mov      x1, x22
  0x24d4314: bl       #0x444a7bc ; -> System.Collections.Generic.List<object>$$AddWithResize
  0x24d4318: b        #0x24d425c
  0x24d431c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4320: add      x0, sp, #0x20
  0x24d4324: b        #0x24d4338
  0x24d4328: adrp     x8, #0x551f000
  0x24d432c: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d4330: add      x0, sp, #0x40
  0x24d4334: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d4338: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d433c: ldp      x20, x19, [sp, #0xb0]
  0x24d4340: ldp      x22, x21, [sp, #0xa0]
  0x24d4344: ldp      x24, x23, [sp, #0x90]
  0x24d4348: ldp      x26, x25, [sp, #0x80]
  0x24d434c: ldp      x28, x27, [sp, #0x70]
  0x24d4350: ldp      x29, x30, [sp, #0x60]
  0x24d4354: add      sp, sp, #0xc0
  0x24d4358: ret      
  0x24d435c: mov      x25, xzr
  0x24d4360: adrp     x8, #0x551f000
  0x24d4364: ldr      x8, [x8, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d4368: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d436c: add      x0, sp, #0x20
  0x24d4370: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4374: cbz      x25, #0x24d45a0
  0x24d4378: mov      x0, x25
  0x24d437c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4380: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4384: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4388: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d438c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4390: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4394: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4398: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d439c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43a0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43a4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43a8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43ac: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43b0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43b4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43b8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43bc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43c0: mov      x0, x25
  0x24d43c4: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d43c8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43cc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43d0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43d4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43d8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43dc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43e0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43e4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43e8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43ec: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43f0: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43f4: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43f8: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d43fc: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4400: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4404: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4408: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d440c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4410: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4414: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4418: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d441c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4420: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4424: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4428: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d442c: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4430: bl       #0x21849c0 ; -> ??? 0x21849c0
  0x24d4434: mov      x25, xzr
  0x24d4438: b        #0x24d4440
  0x24d443c: mov      x23, x0
  0x24d4440: adrp     x8, #0x551f000
  0x24d4444: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d4448: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d444c: add      x0, sp, #0x40
  0x24d4450: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4454: cbz      x25, #0x24d4a08
  0x24d4458: mov      x0, x25
  0x24d445c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4460: mov      x24, x1
  0x24d4464: mov      x23, x0
  0x24d4468: b        #0x24d4360
  0x24d446c: b        #0x24d4610
  0x24d4470: b        #0x24d44f4
  0x24d4474: b        #0x24d4610
  0x24d4478: b        #0x24d4610
  0x24d447c: b        #0x24d4610
  0x24d4480: b        #0x24d485c
  0x24d4484: b        #0x24d48b4
  0x24d4488: b        #0x24d4908
  0x24d448c: b        #0x24d495c
  0x24d4490: b        #0x24d44f4
  0x24d4494: b        #0x24d44f4
  0x24d4498: b        #0x24d4610
  0x24d449c: b        #0x24d4610
  0x24d44a0: b        #0x24d4610
  0x24d44a4: b        #0x24d46b8
  0x24d44a8: b        #0x24d470c
  0x24d44ac: b        #0x24d4760
  0x24d44b0: b        #0x24d47b4
  0x24d44b4: b        #0x24d4808
  0x24d44b8: b        #0x24d49b8
  0x24d44bc: b        #0x24d4598
  0x24d44c0: b        #0x24d4598
  0x24d44c4: b        #0x24d4598
  0x24d44c8: b        #0x24d4598
  0x24d44cc: b        #0x24d485c
  0x24d44d0: b        #0x24d48b4
  0x24d44d4: b        #0x24d4908
  0x24d44d8: b        #0x24d485c
  0x24d44dc: b        #0x24d495c
  0x24d44e0: b        #0x24d48b4
  0x24d44e4: b        #0x24d4908
  0x24d44e8: b        #0x24d495c
  0x24d44ec: b        #0x24d44f4
  0x24d44f0: b        #0x24d44f4
  0x24d44f4: mov      x23, x0
  0x24d44f8: cmp      w1, #1
  0x24d44fc: b.ne     #0x24d4528
  0x24d4500: mov      x0, x23
  0x24d4504: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4508: ldr      x25, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d450c: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4510: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4514: add      x0, sp, #0x20
  0x24d4518: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d451c: cbz      x25, #0x24d35b8
  0x24d4520: mov      x0, x25
  0x24d4524: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4528: mov      x25, xzr
  0x24d452c: b        #0x24d4534
  0x24d4530: mov      x23, x0
  0x24d4534: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4538: add      x0, sp, #0x20
  0x24d453c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4540: cbz      x25, #0x24d4a08
  0x24d4544: mov      x0, x25
  0x24d4548: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d454c: b        #0x24d4610
  0x24d4550: b        #0x24d4610
  0x24d4554: b        #0x24d4610
  0x24d4558: b        #0x24d4610
  0x24d455c: b        #0x24d4610
  0x24d4560: b        #0x24d46b8
  0x24d4564: b        #0x24d470c
  0x24d4568: b        #0x24d4760
  0x24d456c: b        #0x24d47b4
  0x24d4570: b        #0x24d4808
  0x24d4574: b        #0x24d46b8
  0x24d4578: b        #0x24d470c
  0x24d457c: b        #0x24d4760
  0x24d4580: b        #0x24d47b4
  0x24d4584: b        #0x24d4808
  0x24d4588: b        #0x24d49b8
  0x24d458c: b        #0x24d49b8
  0x24d4590: b        #0x24d4598
  0x24d4594: b        #0x24d4598
  0x24d4598: mov      x24, x1
  0x24d459c: mov      x23, x0
  0x24d45a0: cmp      w24, #1
  0x24d45a4: b.ne     #0x24d45d4
  0x24d45a8: mov      x0, x23
  0x24d45ac: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d45b0: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d45b4: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d45b8: adrp     x8, #0x551f000
  0x24d45bc: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d45c0: add      x0, sp, #0x40
  0x24d45c4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d45c8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d45cc: cbz      x24, #0x24d3848
  0x24d45d0: b        #0x24d49e4
  0x24d45d4: mov      x24, xzr
  0x24d45d8: b        #0x24d45e0
  0x24d45dc: mov      x23, x0
  0x24d45e0: adrp     x8, #0x551f000
  0x24d45e4: ldr      x8, [x8, #0x6a0] ; = 0x0 (u64 @ 0x551f6a0)
  0x24d45e8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d45ec: add      x0, sp, #0x40
  0x24d45f0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d45f4: cbz      x24, #0x24d4a08
  0x24d45f8: mov      x0, x24
  0x24d45fc: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4600: b        #0x24d485c
  0x24d4604: b        #0x24d48b4
  0x24d4608: b        #0x24d4908
  0x24d460c: b        #0x24d495c
  0x24d4610: mov      x23, x0
  0x24d4614: cmp      w1, #1
  0x24d4618: b.ne     #0x24d4654
  0x24d461c: mov      x0, x23
  0x24d4620: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4624: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4628: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d462c: adrp     x26, #0x551f000
  0x24d4630: ldr      x26, [x26, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d4634: add      x0, sp, #0x20
  0x24d4638: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d463c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4640: adrp     x27, #0x5512000
  0x24d4644: ldr      x27, [x27, #0xb18] ; = 0x0 (u64 @ 0x5512b18)
  0x24d4648: ldr      x29, [sp]
  0x24d464c: cbz      x24, #0x24d39f0
  0x24d4650: b        #0x24d49e4
  0x24d4654: mov      x24, xzr
  0x24d4658: b        #0x24d4660
  0x24d465c: mov      x23, x0
  0x24d4660: adrp     x8, #0x551f000
  0x24d4664: ldr      x8, [x8, #0x5e0] ; = 0x0 (u64 @ 0x551f5e0)
  0x24d4668: ldr      x1, [x8] ; = 0x0 (u64 @ 0x551f000)
  0x24d466c: add      x0, sp, #0x20
  0x24d4670: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4674: cbz      x24, #0x24d4a08
  0x24d4678: mov      x0, x24
  0x24d467c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4680: b        #0x24d46b8
  0x24d4684: b        #0x24d470c
  0x24d4688: b        #0x24d4760
  0x24d468c: b        #0x24d47b4
  0x24d4690: b        #0x24d46b8
  0x24d4694: b        #0x24d4808
  0x24d4698: b        #0x24d470c
  0x24d469c: b        #0x24d4760
  0x24d46a0: b        #0x24d47b4
  0x24d46a4: b        #0x24d4808
  0x24d46a8: b        #0x24d485c
  0x24d46ac: b        #0x24d48b4
  0x24d46b0: b        #0x24d4908
  0x24d46b4: b        #0x24d495c
  0x24d46b8: mov      x23, x0
  0x24d46bc: cmp      w1, #1
  0x24d46c0: b.ne     #0x24d46e8
  0x24d46c4: mov      x0, x23
  0x24d46c8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d46cc: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d46d0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d46d4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d46d8: add      x0, sp, #0x20
  0x24d46dc: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d46e0: cbz      x24, #0x24d3f48
  0x24d46e4: b        #0x24d49e4
  0x24d46e8: mov      x24, xzr
  0x24d46ec: b        #0x24d46f4
  0x24d46f0: mov      x23, x0
  0x24d46f4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d46f8: add      x0, sp, #0x20
  0x24d46fc: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4700: cbz      x24, #0x24d4a08
  0x24d4704: mov      x0, x24
  0x24d4708: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d470c: mov      x23, x0
  0x24d4710: cmp      w1, #1
  0x24d4714: b.ne     #0x24d473c
  0x24d4718: mov      x0, x23
  0x24d471c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4720: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4724: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4728: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d472c: add      x0, sp, #0x20
  0x24d4730: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4734: cbz      x24, #0x24d3e68
  0x24d4738: b        #0x24d49e4
  0x24d473c: mov      x24, xzr
  0x24d4740: b        #0x24d4748
  0x24d4744: mov      x23, x0
  0x24d4748: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d474c: add      x0, sp, #0x20
  0x24d4750: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4754: cbz      x24, #0x24d4a08
  0x24d4758: mov      x0, x24
  0x24d475c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4760: mov      x23, x0
  0x24d4764: cmp      w1, #1
  0x24d4768: b.ne     #0x24d4790
  0x24d476c: mov      x0, x23
  0x24d4770: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4774: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4778: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d477c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4780: add      x0, sp, #0x20
  0x24d4784: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4788: cbz      x24, #0x24d3d88
  0x24d478c: b        #0x24d49e4
  0x24d4790: mov      x24, xzr
  0x24d4794: b        #0x24d479c
  0x24d4798: mov      x23, x0
  0x24d479c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d47a0: add      x0, sp, #0x20
  0x24d47a4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d47a8: cbz      x24, #0x24d4a08
  0x24d47ac: mov      x0, x24
  0x24d47b0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d47b4: mov      x23, x0
  0x24d47b8: cmp      w1, #1
  0x24d47bc: b.ne     #0x24d47e4
  0x24d47c0: mov      x0, x23
  0x24d47c4: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d47c8: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d47cc: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d47d0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d47d4: add      x0, sp, #0x20
  0x24d47d8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d47dc: cbz      x24, #0x24d3ca8
  0x24d47e0: b        #0x24d49e4
  0x24d47e4: mov      x24, xzr
  0x24d47e8: b        #0x24d47f0
  0x24d47ec: mov      x23, x0
  0x24d47f0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d47f4: add      x0, sp, #0x20
  0x24d47f8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d47fc: cbz      x24, #0x24d4a08
  0x24d4800: mov      x0, x24
  0x24d4804: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4808: mov      x23, x0
  0x24d480c: cmp      w1, #1
  0x24d4810: b.ne     #0x24d4838
  0x24d4814: mov      x0, x23
  0x24d4818: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d481c: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4820: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4824: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4828: add      x0, sp, #0x20
  0x24d482c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4830: cbz      x24, #0x24d3bc8
  0x24d4834: b        #0x24d49e4
  0x24d4838: mov      x24, xzr
  0x24d483c: b        #0x24d4844
  0x24d4840: mov      x23, x0
  0x24d4844: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4848: add      x0, sp, #0x20
  0x24d484c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4850: cbz      x24, #0x24d4a08
  0x24d4854: mov      x0, x24
  0x24d4858: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d485c: mov      x23, x0
  0x24d4860: cmp      w1, #1
  0x24d4864: b.ne     #0x24d4890
  0x24d4868: mov      x0, x23
  0x24d486c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4870: ldr      x19, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4874: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4878: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d487c: add      x0, sp, #0x20
  0x24d4880: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4884: cbz      x19, #0x24d433c
  0x24d4888: mov      x0, x19
  0x24d488c: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4890: mov      x19, xzr
  0x24d4894: b        #0x24d489c
  0x24d4898: mov      x23, x0
  0x24d489c: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d48a0: add      x0, sp, #0x20
  0x24d48a4: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d48a8: cbz      x19, #0x24d4a08
  0x24d48ac: mov      x0, x19
  0x24d48b0: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d48b4: mov      x23, x0
  0x24d48b8: cmp      w1, #1
  0x24d48bc: b.ne     #0x24d48e4
  0x24d48c0: mov      x0, x23
  0x24d48c4: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d48c8: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d48cc: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d48d0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d48d4: add      x0, sp, #0x20
  0x24d48d8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d48dc: cbz      x24, #0x24d4230
  0x24d48e0: b        #0x24d49e4
  0x24d48e4: mov      x24, xzr
  0x24d48e8: b        #0x24d48f0
  0x24d48ec: mov      x23, x0
  0x24d48f0: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d48f4: add      x0, sp, #0x20
  0x24d48f8: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d48fc: cbz      x24, #0x24d4a08
  0x24d4900: mov      x0, x24
  0x24d4904: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4908: mov      x23, x0
  0x24d490c: cmp      w1, #1
  0x24d4910: b.ne     #0x24d4938
  0x24d4914: mov      x0, x23
  0x24d4918: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d491c: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4920: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4924: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4928: add      x0, sp, #0x20
  0x24d492c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4930: cbz      x24, #0x24d4138
  0x24d4934: b        #0x24d49e4
  0x24d4938: mov      x24, xzr
  0x24d493c: b        #0x24d4944
  0x24d4940: mov      x23, x0
  0x24d4944: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d4948: add      x0, sp, #0x20
  0x24d494c: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4950: cbz      x24, #0x24d4a08
  0x24d4954: mov      x0, x24
  0x24d4958: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d495c: mov      x23, x0
  0x24d4960: cmp      w1, #1
  0x24d4964: b.ne     #0x24d498c
  0x24d4968: mov      x0, x23
  0x24d496c: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d4970: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d4974: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d4978: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d497c: add      x0, sp, #0x20
  0x24d4980: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4984: cbz      x24, #0x24d4040
  0x24d4988: b        #0x24d49e4
  0x24d498c: mov      x24, xzr
  0x24d4990: b        #0x24d4998
  0x24d4994: mov      x23, x0
  0x24d4998: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d499c: add      x0, sp, #0x20
  0x24d49a0: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d49a4: cbz      x24, #0x24d4a08
  0x24d49a8: mov      x0, x24
  0x24d49ac: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d49b0: b        #0x24d49b8
  0x24d49b4: b        #0x24d49b8
  0x24d49b8: mov      x23, x0
  0x24d49bc: cmp      w1, #1
  0x24d49c0: b.ne     #0x24d49ec
  0x24d49c4: mov      x0, x23
  0x24d49c8: bl       #0x51eaae0 ; -> ??? 0x51eaae0
  0x24d49cc: ldr      x24, [x0] ; = 0x0 (u64 @ 0x551f000)
  0x24d49d0: bl       #0x51eaaf0 ; -> ??? 0x51eaaf0
  0x24d49d4: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d49d8: add      x0, sp, #0x20
  0x24d49dc: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d49e0: cbz      x24, #0x24d3ae8
  0x24d49e4: mov      x0, x24
  0x24d49e8: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d49ec: mov      x24, xzr
  0x24d49f0: b        #0x24d49f8
  0x24d49f4: mov      x23, x0
  0x24d49f8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x551f000)
  0x24d49fc: add      x0, sp, #0x20
  0x24d4a00: bl       #0x40a9cc8 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x24d4a04: cbnz     x24, #0x24d4a10
  0x24d4a08: mov      x0, x23
  0x24d4a0c: bl       #0x22854d4 ; -> ??? 0x22854d4
  0x24d4a10: mov      x0, x24
  0x24d4a14: bl       #0x21849b8 ; -> ??? 0x21849b8
  0x24d4a18: bl       #0x1f5cd20 ; -> ??? 0x1f5cd20
