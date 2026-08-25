; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CCharacterData_AddEvolutionStatToDictionary @ 0x2911398..0x2911480 (taille 232 octets) =====
  0x2911398: str      x30, [sp, #-0x30]!
  0x291139c: stp      x22, x21, [sp, #0x10]
  0x29113a0: stp      x20, x19, [sp, #0x20]
  0x29113a4: adrp     x22, #0x59e7000
  0x29113a8: ldrb     w8, [x22, #0xebc]
  0x29113ac: mov      w19, w3
  0x29113b0: mov      w20, w2
  0x29113b4: mov      x21, x1
  0x29113b8: tbnz     w8, #0, #0x29113f4
  0x29113bc: adrp     x0, #0x55ae000
  0x29113c0: ldr      x0, [x0, #0x768] ; = 0x0 (u64 @ 0x55ae768)
  0x29113c4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29113c8: adrp     x0, #0x55ae000
  0x29113cc: ldr      x0, [x0, #0x770] ; = 0x0 (u64 @ 0x55ae770)
  0x29113d0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29113d4: adrp     x0, #0x55ae000
  0x29113d8: ldr      x0, [x0, #0x778] ; = 0x0 (u64 @ 0x55ae778)
  0x29113dc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29113e0: adrp     x0, #0x559a000
  0x29113e4: ldr      x0, [x0, #0x908] ; = 0x0 (u64 @ 0x559a908)
  0x29113e8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x29113ec: mov      w8, #1
  0x29113f0: strb     w8, [x22, #0xebc]
  0x29113f4: cbz      x21, #0x291147c
  0x29113f8: adrp     x8, #0x55ae000
  0x29113fc: ldr      x8, [x8, #0x770] ; = 0x0 (u64 @ 0x55ae770)
  0x2911400: mov      x0, x21
  0x2911404: mov      w1, w20
  0x2911408: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x291140c: bl       #0x401fd80 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$ContainsKey
  0x2911410: tbz      w0, #0, #0x2911454
  0x2911414: adrp     x8, #0x55ae000
  0x2911418: ldr      x8, [x8, #0x778] ; = 0x0 (u64 @ 0x55ae778)
  0x291141c: mov      x0, x21
  0x2911420: mov      w1, w20
  0x2911424: ldr      x2, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x2911428: bl       #0x401faf8 ; -> System.Collections.Generic.Dictionary<Int32Enum, int>$$get_Item
  0x291142c: adrp     x8, #0x559a000
  0x2911430: ldr      x8, [x8, #0x908] ; = 0x0 (u64 @ 0x559a908)
  0x2911434: add      w2, w0, w19
  0x2911438: mov      x0, x21
  0x291143c: mov      w1, w20
  0x2911440: ldr      x3, [x8] ; = 0x0 (u64 @ 0x559a000)
  0x2911444: ldp      x20, x19, [sp, #0x20]
  0x2911448: ldp      x22, x21, [sp, #0x10]
  0x291144c: ldr      x30, [sp], #0x30
  0x2911450: b        #0x401fb80
  0x2911454: adrp     x8, #0x55ae000
  0x2911458: ldr      x8, [x8, #0x768] ; = 0x0 (u64 @ 0x55ae768)
  0x291145c: mov      x0, x21
  0x2911460: mov      w1, w20
  0x2911464: mov      w2, w19
  0x2911468: ldr      x3, [x8] ; = 0x0 (u64 @ 0x55ae000)
  0x291146c: ldp      x20, x19, [sp, #0x20]
  0x2911470: ldp      x22, x21, [sp, #0x10]
  0x2911474: ldr      x30, [sp], #0x30
  0x2911478: b        #0x401fb94
  0x291147c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
