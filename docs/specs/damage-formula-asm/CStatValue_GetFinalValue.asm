; ===== CStatValue_GetFinalValue @ 0x28d33b4..0x28d3558 (taille 420 octets) =====
  0x28d33b4: str      x30, [sp, #-0x30]!
  0x28d33b8: stp      x22, x21, [sp, #0x10]
  0x28d33bc: stp      x20, x19, [sp, #0x20]
  0x28d33c0: adrp     x20, #0x5958000
  0x28d33c4: adrp     x22, #0x5511000
  0x28d33c8: ldrb     w8, [x20, #0xbc3]
  0x28d33cc: ldr      x22, [x22, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d33d0: mov      x19, x0
  0x28d33d4: tbnz     w8, #0, #0x28d3404
  0x28d33d8: adrp     x0, #0x5536000
  0x28d33dc: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x5536ec0)
  0x28d33e0: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d33e4: adrp     x0, #0x550f000
  0x28d33e8: ldr      x0, [x0, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x28d33ec: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d33f0: adrp     x0, #0x5511000
  0x28d33f4: ldr      x0, [x0, #0xaf0] ; = 0x0 (u64 @ 0x5511af0)
  0x28d33f8: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d33fc: mov      w8, #1
  0x28d3400: strb     w8, [x20, #0xbc3]
  0x28d3404: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x28d3408: str      wzr, [sp, #0xc]
  0x28d340c: ldur     x20, [x19, #0x74]
  0x28d3410: ldr      w21, [x19, #0x7c]
  0x28d3414: ldr      w8, [x0, #0xe0]
  0x28d3418: cbnz     w8, #0x28d3420
  0x28d341c: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3420: mov      x0, x20
  0x28d3424: mov      x1, x21
  0x28d3428: mov      x2, xzr
  0x28d342c: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3430: cmn      w0, #1
  0x28d3434: b.eq     #0x28d3464
  0x28d3438: ldr      x0, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x28d343c: ldur     x20, [x19, #0x74]
  0x28d3440: ldr      w19, [x19, #0x7c]
  0x28d3444: ldr      w8, [x0, #0xe0]
  0x28d3448: cbnz     w8, #0x28d3450
  0x28d344c: bl       #0x218489c ; -> ??? 0x218489c
  0x28d3450: mov      x0, x20
  0x28d3454: mov      x1, x19
  0x28d3458: mov      x2, xzr
  0x28d345c: bl       #0x2c59abc ; -> SVAInt$$op_Implicit
  0x28d3460: b        #0x28d3544
  0x28d3464: ldrb     w8, [x19, #0xe0]
  0x28d3468: cbz      w8, #0x28d3474
  0x28d346c: mov      x0, x19
  0x28d3470: bl       #0x28d2eac ; -> CStatValue$$SetFinalValue
  0x28d3474: adrp     x21, #0x5955000
  0x28d3478: ldrb     w8, [x21, #0x8f3]
  0x28d347c: cbnz     w8, #0x28d3494
  0x28d3480: adrp     x0, #0x5511000
  0x28d3484: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x28d3488: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d348c: mov      w8, #1
  0x28d3490: strb     w8, [x21, #0x8f3]
  0x28d3494: adrp     x22, #0x5511000
  0x28d3498: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x28d349c: adrp     x9, #0x550f000
  0x28d34a0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x28d34a4: ldr      x9, [x9, #0x100] ; = 0x0 (u64 @ 0x550f100)
  0x28d34a8: ldr      x8, [x8, #0xb8]
  0x28d34ac: ldr      x0, [x9] ; = 0x0 (u64 @ 0x550f000)
  0x28d34b0: ldr      x20, [x8]
  0x28d34b4: ldr      w9, [x0, #0xe0]
  0x28d34b8: cbnz     w9, #0x28d34c0
  0x28d34bc: bl       #0x218489c ; -> ??? 0x218489c
  0x28d34c0: mov      x0, x20
  0x28d34c4: mov      x1, xzr
  0x28d34c8: mov      x2, xzr
  0x28d34cc: bl       #0x4f81aa0 ; -> UnityEngine.Object$$op_Inequality
  0x28d34d0: tbz      w0, #0, #0x28d353c
  0x28d34d4: ldrb     w8, [x21, #0x8f3]
  0x28d34d8: cbnz     w8, #0x28d34f0
  0x28d34dc: adrp     x0, #0x5511000
  0x28d34e0: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x28d34e4: bl       #0x2184724 ; -> ??? 0x2184724
  0x28d34e8: mov      w8, #1
  0x28d34ec: strb     w8, [x21, #0x8f3]
  0x28d34f0: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x28d34f4: ldr      x8, [x8, #0xb8]
  0x28d34f8: ldr      x8, [x8]
  0x28d34fc: cbz      x8, #0x28d3554
  0x28d3500: ldr      x0, [x8, #0x168]
  0x28d3504: cbz      x0, #0x28d3554
  0x28d3508: adrp     x8, #0x5536000
  0x28d350c: ldr      w1, [x19, #0x10]
  0x28d3510: ldr      x8, [x8, #0xec0] ; = 0x0 (u64 @ 0x5536ec0)
  0x28d3514: add      x2, sp, #0xc
  0x28d3518: ldr      x3, [x8] ; = 0x0 (u64 @ 0x5536000)
  0x28d351c: bl       #0x3faa1d0 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$TryGetValue
  0x28d3520: tbz      w0, #0, #0x28d353c
  0x28d3524: mov      x0, x19
  0x28d3528: bl       #0x28d13f4 ; -> CStatValue$$get_m_nFinalValue
  0x28d352c: ldr      w8, [sp, #0xc]
  0x28d3530: cmp      w0, w8
  0x28d3534: csel     w0, w0, w8, lt
  0x28d3538: b        #0x28d3544
  0x28d353c: mov      x0, x19
  0x28d3540: bl       #0x28d13f4 ; -> CStatValue$$get_m_nFinalValue
  0x28d3544: ldp      x20, x19, [sp, #0x20]
  0x28d3548: ldp      x22, x21, [sp, #0x10]
  0x28d354c: ldr      x30, [sp], #0x30
  0x28d3550: ret      
  0x28d3554: bl       #0x21849c0 ; -> ??? 0x21849c0
