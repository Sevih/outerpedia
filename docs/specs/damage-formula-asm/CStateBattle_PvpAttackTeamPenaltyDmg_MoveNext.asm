; ===== CStateBattle_PvpAttackTeamPenaltyDmg_MoveNext @ 0x25ce848..0x25cebf4 (taille 940 octets) =====
  0x25ce848: stp      x30, x23, [sp, #-0x30]!
  0x25ce84c: stp      x22, x21, [sp, #0x10]
  0x25ce850: stp      x20, x19, [sp, #0x20]
  0x25ce854: adrp     x20, #0x5957000
  0x25ce858: ldrb     w8, [x20, #0x2f4]
  0x25ce85c: mov      x19, x0
  0x25ce860: tbnz     w8, #0, #0x25ce8a8
  0x25ce864: adrp     x0, #0x5512000
  0x25ce868: ldr      x0, [x0, #0x678] ; = 0x0 (u64 @ 0x5512678)
  0x25ce86c: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ce870: adrp     x0, #0x5513000
  0x25ce874: ldr      x0, [x0, #0xa30] ; = 0x0 (u64 @ 0x5513a30)
  0x25ce878: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ce87c: adrp     x0, #0x5525000
  0x25ce880: ldr      x0, [x0, #0xe30] ; = 0x0 (u64 @ 0x5525e30)
  0x25ce884: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ce888: adrp     x0, #0x5525000
  0x25ce88c: ldr      x0, [x0, #0xe38] ; = 0x0 (u64 @ 0x5525e38)
  0x25ce890: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ce894: adrp     x0, #0x5511000
  0x25ce898: ldr      x0, [x0, #0x8f8] ; = 0x0 (u64 @ 0x55118f8)
  0x25ce89c: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ce8a0: mov      w8, #1
  0x25ce8a4: strb     w8, [x20, #0x2f4]
  0x25ce8a8: ldr      w8, [x19, #0x10]
  0x25ce8ac: cmp      w8, #3
  0x25ce8b0: b.hi     #0x25ceb10
  0x25ce8b4: ldr      x20, [x19, #0x28]
  0x25ce8b8: adrp     x9, #0x1057000
  0x25ce8bc: add      x9, x9, #0x103
  0x25ce8c0: adr      x10, #0x25ce8d0
  0x25ce8c4: ldrb     w11, [x9, x8]
  0x25ce8c8: add      x10, x10, x11, lsl #2
  0x25ce8cc: br       x10
  0x25ce8d0: ldr      w8, [x19, #0x20]
  0x25ce8d4: mov      w9, #-1
  0x25ce8d8: str      w9, [x19, #0x10]
  0x25ce8dc: str      w8, [x19, #0x38]
  0x25ce8e0: cbz      x20, #0x25cebf0
  0x25ce8e4: ldrb     w8, [x20, #0x90]
  0x25ce8e8: cbnz     w8, #0x25ceb24
  0x25ce8ec: adrp     x8, #0x5525000
  0x25ce8f0: ldr      x8, [x8, #0xe38] ; = 0x0 (u64 @ 0x5525e38)
  0x25ce8f4: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x25ce8f8: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x25ce8fc: mov      x1, xzr
  0x25ce900: mov      x22, x0
  0x25ce904: bl       #0x48e6ab0 ; -> System.Object$$.ctor
  0x25ce908: mov      x21, x19
  0x25ce90c: str      x22, [x21, #0x30]!
  0x25ce910: mov      x0, x21
  0x25ce914: mov      x1, x22
  0x25ce918: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x25ce91c: mov      w8, #1
  0x25ce920: strb     w8, [x20, #0x90]
  0x25ce924: ldr      x9, [x21]
  0x25ce928: cbz      x9, #0x25cebf0
  0x25ce92c: mov      x0, xzr
  0x25ce930: strb     w8, [x9, #0x10]
  0x25ce934: bl       #0x268afb8 ; -> CUIManager$$get_Instance
  0x25ce938: adrp     x22, #0x5513000
  0x25ce93c: ldr      x22, [x22, #0xa30] ; = 0x0 (u64 @ 0x5513a30)
  0x25ce940: mov      x20, x0
  0x25ce944: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5513000)
  0x25ce948: ldr      w9, [x8, #0xe0]
  0x25ce94c: cbnz     w9, #0x25ce95c
  0x25ce950: mov      x0, x8
  0x25ce954: bl       #0x218489c ; -> ??? 0x218489c
  0x25ce958: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5513000)
  0x25ce95c: adrp     x9, #0x5512000
  0x25ce960: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55250b8)
  0x25ce964: ldr      x23, [x21]
  0x25ce968: ldr      x9, [x9, #0x678] ; = 0x0 (u64 @ 0x5512678)
  0x25ce96c: ldr      w21, [x8, #0x5a8]
  0x25ce970: ldr      x0, [x9] ; = 0x0 (u64 @ 0x5512000)
  0x25ce974: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x25ce978: adrp     x8, #0x5525000
  0x25ce97c: ldr      x8, [x8, #0xe30] ; = 0x0 (u64 @ 0x5525e30)
  0x25ce980: mov      x1, x23
  0x25ce984: mov      x3, xzr
  0x25ce988: mov      x22, x0
  0x25ce98c: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x25ce990: bl       #0x480fb58 ; -> System.Action$$.ctor
  0x25ce994: cbz      x20, #0x25cebf0
  0x25ce998: fmov     s0, #2.00000000
  0x25ce99c: mov      x0, x20
  0x25ce9a0: mov      w1, w21
  0x25ce9a4: mov      x2, x22
  0x25ce9a8: mov      x3, xzr
  0x25ce9ac: bl       #0x2697f0c ; -> CUIManager$$SimpleMessage
  0x25ce9b0: b        #0x25ce9bc
  0x25ce9b4: mov      w8, #-1
  0x25ce9b8: str      w8, [x19, #0x10]
  0x25ce9bc: mov      x0, x19
  0x25ce9c0: ldr      x8, [x0, #0x30]!
  0x25ce9c4: cbz      x8, #0x25cebf0
  0x25ce9c8: ldrb     w8, [x8, #0x10]
  0x25ce9cc: cbz      w8, #0x25ceb18
  0x25ce9d0: str      xzr, [x19, #0x18]!
  0x25ce9d4: mov      x0, x19
  0x25ce9d8: mov      x1, xzr
  0x25ce9dc: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x25ce9e0: mov      w0, #1
  0x25ce9e4: stur     w0, [x19, #-8]
  0x25ce9e8: b        #0x25cebe0
  0x25ce9ec: mov      w8, #-1
  0x25ce9f0: str      w8, [x19, #0x10]
  0x25ce9f4: adrp     x21, #0x5955000
  0x25ce9f8: ldrb     w8, [x21, #0x8f3]
  0x25ce9fc: cbnz     w8, #0x25cea14
  0x25cea00: adrp     x0, #0x5511000
  0x25cea04: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25cea08: bl       #0x2184724 ; -> ??? 0x2184724
  0x25cea0c: mov      w8, #1
  0x25cea10: strb     w8, [x21, #0x8f3]
  0x25cea14: adrp     x22, #0x5511000
  0x25cea18: ldr      x22, [x22, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25cea1c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x25cea20: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55250b8)
  0x25cea24: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x25cea28: cbz      x8, #0x25cebf0
  0x25cea2c: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x5525090)
  0x25cea30: add      x20, x19, #0x38
  0x25cea34: mov      x1, x20
  0x25cea38: mov      x2, xzr
  0x25cea3c: bl       #0x24dc250 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|79_1
  0x25cea40: ldrb     w8, [x21, #0x8f3]
  0x25cea44: cbnz     w8, #0x25cea5c
  0x25cea48: adrp     x0, #0x5511000
  0x25cea4c: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25cea50: bl       #0x2184724 ; -> ??? 0x2184724
  0x25cea54: mov      w8, #1
  0x25cea58: strb     w8, [x21, #0x8f3]
  0x25cea5c: ldr      x8, [x22] ; = 0x0 (u64 @ 0x5511000)
  0x25cea60: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55250b8)
  0x25cea64: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5525000)
  0x25cea68: cbz      x8, #0x25cebf0
  0x25cea6c: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x5525098)
  0x25cea70: mov      x1, x20
  0x25cea74: mov      x2, xzr
  0x25cea78: bl       #0x24dc250 ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__PlayDamage|79_1
  0x25cea7c: adrp     x8, #0x5511000
  0x25cea80: ldr      x8, [x8, #0x8f8] ; = 0x0 (u64 @ 0x55118f8)
  0x25cea84: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25cea88: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x25cea8c: fmov     s0, #2.00000000
  0x25cea90: mov      x1, xzr
  0x25cea94: mov      x20, x0
  0x25cea98: bl       #0x4f87b84 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x25cea9c: str      x20, [x19, #0x18]!
  0x25ceaa0: mov      x0, x19
  0x25ceaa4: mov      x1, x20
  0x25ceaa8: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x25ceaac: mov      w8, #3
  0x25ceab0: b        #0x25cebd8
  0x25ceab4: mov      w8, #-1
  0x25ceab8: str      w8, [x19, #0x10]
  0x25ceabc: adrp     x19, #0x5955000
  0x25ceac0: ldrb     w8, [x19, #0x8f3]
  0x25ceac4: cbnz     w8, #0x25ceadc
  0x25ceac8: adrp     x0, #0x5511000
  0x25ceacc: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25cead0: bl       #0x2184724 ; -> ??? 0x2184724
  0x25cead4: mov      w8, #1
  0x25cead8: strb     w8, [x19, #0x8f3]
  0x25ceadc: adrp     x8, #0x5511000
  0x25ceae0: ldr      x8, [x8, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25ceae4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25ceae8: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x25ceaec: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25ceaf0: cbz      x0, #0x25cebf0
  0x25ceaf4: mov      x1, xzr
  0x25ceaf8: bl       #0x255a430 ; -> CDungeonScene$$UpdatePvpTurnPenalty
  0x25ceafc: cbz      x20, #0x25cebf0
  0x25ceb00: mov      w1, #7
  0x25ceb04: mov      x0, x20
  0x25ceb08: mov      x2, xzr
  0x25ceb0c: bl       #0x24ce038 ; -> CStateBattle$$ChangeSubState
  0x25ceb10: mov      w0, wzr
  0x25ceb14: b        #0x25cebe0
  0x25ceb18: mov      x1, xzr
  0x25ceb1c: str      xzr, [x0]
  0x25ceb20: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x25ceb24: adrp     x20, #0x5955000
  0x25ceb28: ldrb     w8, [x20, #0x8f3]
  0x25ceb2c: cbnz     w8, #0x25ceb44
  0x25ceb30: adrp     x0, #0x5511000
  0x25ceb34: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25ceb38: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ceb3c: mov      w8, #1
  0x25ceb40: strb     w8, [x20, #0x8f3]
  0x25ceb44: adrp     x21, #0x5511000
  0x25ceb48: ldr      x21, [x21, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25ceb4c: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x25ceb50: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x25ceb54: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25ceb58: cbz      x8, #0x25cebf0
  0x25ceb5c: ldr      x0, [x8, #0x90] ; = 0x0 (u64 @ 0x5511090)
  0x25ceb60: mov      x1, xzr
  0x25ceb64: bl       #0x24dc06c ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|79_0
  0x25ceb68: ldrb     w8, [x20, #0x8f3]
  0x25ceb6c: cbnz     w8, #0x25ceb84
  0x25ceb70: adrp     x0, #0x5511000
  0x25ceb74: ldr      x0, [x0, #0x818] ; = 0x0 (u64 @ 0x5511818)
  0x25ceb78: bl       #0x2184724 ; -> ??? 0x2184724
  0x25ceb7c: mov      w8, #1
  0x25ceb80: strb     w8, [x20, #0x8f3]
  0x25ceb84: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5511000)
  0x25ceb88: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55110b8)
  0x25ceb8c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25ceb90: cbz      x8, #0x25cebf0
  0x25ceb94: ldr      x0, [x8, #0x98] ; = 0x0 (u64 @ 0x5511098)
  0x25ceb98: mov      x1, xzr
  0x25ceb9c: bl       #0x24dc06c ; -> CStateBattle$$<PvpAttackTeamPenaltyDmg>g__StartEffect|79_0
  0x25ceba0: adrp     x8, #0x5511000
  0x25ceba4: ldr      x8, [x8, #0x8f8] ; = 0x0 (u64 @ 0x55118f8)
  0x25ceba8: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5511000)
  0x25cebac: bl       #0x21849b0 ; -> ??? 0x21849b0
  0x25cebb0: adrp     x8, #0x1056000
  0x25cebb4: ldr      s0, [x8, #0x654] ; = 0.20000000298023224 (f32 @ 0x1056654)
  0x25cebb8: mov      x1, xzr
  0x25cebbc: mov      x20, x0
  0x25cebc0: bl       #0x4f87b84 ; -> UnityEngine.WaitForSeconds$$.ctor
  0x25cebc4: str      x20, [x19, #0x18]!
  0x25cebc8: mov      x0, x19
  0x25cebcc: mov      x1, x20
  0x25cebd0: bl       #0x21846c8 ; -> ??? 0x21846c8
  0x25cebd4: mov      w8, #2
  0x25cebd8: stur     w8, [x19, #-8]
  0x25cebdc: mov      w0, #1
  0x25cebe0: ldp      x20, x19, [sp, #0x20]
  0x25cebe4: ldp      x22, x21, [sp, #0x10]
  0x25cebe8: ldp      x30, x23, [sp], #0x30
  0x25cebec: ret      
  0x25cebf0: bl       #0x21849c0 ; -> ??? 0x21849c0
