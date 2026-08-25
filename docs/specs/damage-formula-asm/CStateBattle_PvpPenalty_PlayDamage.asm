; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CStateBattle_PvpPenalty_PlayDamage @ 0x251ff74..0x2520530 (taille 1468 octets) =====
  0x251ff74: sub      sp, sp, #0xc0
  0x251ff78: stp      d9, d8, [sp, #0x50]
  0x251ff7c: stp      x29, x30, [sp, #0x60]
  0x251ff80: stp      x28, x27, [sp, #0x70]
  0x251ff84: stp      x26, x25, [sp, #0x80]
  0x251ff88: stp      x24, x23, [sp, #0x90]
  0x251ff8c: stp      x22, x21, [sp, #0xa0]
  0x251ff90: stp      x20, x19, [sp, #0xb0]
  0x251ff94: adrp     x22, #0x59e5000
  0x251ff98: adrp     x20, #0x5598000
  0x251ff9c: ldrb     w8, [x22, #0xce8]
  0x251ffa0: ldr      x20, [x20, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x251ffa4: mov      x19, x1
  0x251ffa8: mov      x21, x0
  0x251ffac: tbnz     w8, #0, #0x2520048
  0x251ffb0: adrp     x0, #0x5599000
  0x251ffb4: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x251ffb8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251ffbc: adrp     x0, #0x5598000
  0x251ffc0: ldr      x0, [x0, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x251ffc4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251ffc8: adrp     x0, #0x5598000
  0x251ffcc: ldr      x0, [x0, #0xec8] ; = 0x0 (u64 @ 0x5598ec8)
  0x251ffd0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251ffd4: adrp     x0, #0x5598000
  0x251ffd8: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x251ffdc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251ffe0: adrp     x0, #0x5598000
  0x251ffe4: ldr      x0, [x0, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x251ffe8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251ffec: adrp     x0, #0x5598000
  0x251fff0: ldr      x0, [x0, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x251fff4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x251fff8: adrp     x0, #0x5598000
  0x251fffc: ldr      x0, [x0, #0xd90] ; = 0x0 (u64 @ 0x5598d90)
  0x2520000: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520004: adrp     x0, #0x5598000
  0x2520008: ldr      x0, [x0, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x252000c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520010: adrp     x0, #0x5598000
  0x2520014: ldr      x0, [x0, #0xf38] ; = 0x0 (u64 @ 0x5598f38)
  0x2520018: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x252001c: adrp     x0, #0x5598000
  0x2520020: ldr      x0, [x0, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x2520024: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520028: adrp     x0, #0x5598000
  0x252002c: ldr      x0, [x0, #0xf48] ; = 0x0 (u64 @ 0x5598f48)
  0x2520030: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520034: adrp     x0, #0x5596000
  0x2520038: ldr      x0, [x0, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x252003c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520040: mov      w8, #1
  0x2520044: strb     w8, [x22, #0xce8]
  0x2520048: ldr      x0, [x20] ; = 0x0 (u64 @ 0x5598000)
  0x252004c: stp      xzr, xzr, [sp, #0x30]
  0x2520050: str      xzr, [sp, #0x40]
  0x2520054: ldr      w8, [x0, #0xe0]
  0x2520058: cbnz     w8, #0x2520060
  0x252005c: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2520060: mov      x0, xzr
  0x2520064: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2520068: cbz      x0, #0x2520420
  0x252006c: mov      w1, #0x17
  0x2520070: mov      x2, xzr
  0x2520074: bl       #0x262c5dc ; -> CTempletManager$$GetDamageTypeTemplet
  0x2520078: cbz      x21, #0x2520420
  0x252007c: mov      x20, x0
  0x2520080: ldr      x0, [x21, #0x10]
  0x2520084: cbz      x0, #0x2520420
  0x2520088: adrp     x8, #0x5598000
  0x252008c: ldr      x8, [x8, #0xda0] ; = 0x0 (u64 @ 0x5598da0)
  0x2520090: adrp     x27, #0x5598000
  0x2520094: adrp     x28, #0x5596000
  0x2520098: adrp     x29, #0x5599000
  0x252009c: ldr      x27, [x27, #0xd88] ; = 0x0 (u64 @ 0x5598d88)
  0x25200a0: ldr      x28, [x28, #0x640] ; = 0x0 (u64 @ 0x5596640)
  0x25200a4: ldr      x29, [x29, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x25200a8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x25200ac: adrp     x26, #0x5598000
  0x25200b0: ldr      x26, [x26, #0xf48] ; = 0x0 (u64 @ 0x5598f48)
  0x25200b4: add      x8, sp, #0x18
  0x25200b8: bl       #0x44c9ec4 ; -> System.Collections.Generic.List<object>$$GetEnumerator
  0x25200bc: adrp     x21, #0x5598000
  0x25200c0: adrp     x9, #0x1070000
  0x25200c4: ldur     q0, [sp, #0x18]
  0x25200c8: ldr      x8, [sp, #0x28]
  0x25200cc: ldr      x21, [x21, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x25200d0: ldr      s9, [x9, #0x3ec] ; = 9.999999439624929e-11 (f32 @ 0x10703ec)
  0x25200d4: adrp     x22, #0x59e4000
  0x25200d8: fmov     s8, #-1.00000000
  0x25200dc: str      q0, [sp, #0x30]
  0x25200e0: str      x8, [sp, #0x40]
  0x25200e4: ldr      x1, [x27] ; = 0x0 (u64 @ 0x5598000)
  0x25200e8: add      x0, sp, #0x30
  0x25200ec: bl       #0x4121198 ; -> System.Collections.Generic.List.Enumerator<object>$$MoveNext
  0x25200f0: tbz      w0, #0, #0x25203bc
  0x25200f4: ldr      x0, [x28] ; = 0x0 (u64 @ 0x5596000)
  0x25200f8: ldr      x23, [sp, #0x40]
  0x25200fc: ldr      w8, [x0, #0xe0]
  0x2520100: cbnz     w8, #0x2520108
  0x2520104: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2520108: mov      x0, x23
  0x252010c: mov      x1, xzr
  0x2520110: bl       #0x50491e8 ; -> UnityEngine.Object$$op_Implicit
  0x2520114: tbz      w0, #0, #0x25200e4
  0x2520118: cbz      x23, #0x2520400
  0x252011c: ldr      x0, [x23, #0x28]
  0x2520120: cbz      x0, #0x2520404
  0x2520124: mov      x1, xzr
  0x2520128: bl       #0x2908ca4 ; -> CCharacterData$$get_MaxHP
  0x252012c: mov      w24, w0
  0x2520130: ldr      x0, [x29] ; = 0x0 (u64 @ 0x5599000)
  0x2520134: ldr      w25, [x19]
  0x2520138: ldr      w8, [x0, #0xe0]
  0x252013c: cbnz     w8, #0x2520144
  0x2520140: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2520144: mov      w0, w24
  0x2520148: mov      w1, w25
  0x252014c: mov      x2, xzr
  0x2520150: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2520154: mov      w24, w0
  0x2520158: neg      w1, w0
  0x252015c: mov      w3, #1
  0x2520160: mov      x0, x23
  0x2520164: mov      w2, wzr
  0x2520168: mov      w4, wzr
  0x252016c: mov      x5, xzr
  0x2520170: bl       #0x2815438 ; -> CCharacterBattle$$AddHP
  0x2520174: ldrb     w8, [x22, #0xbd3]
  0x2520178: cbnz     w8, #0x252018c
  0x252017c: mov      x0, x21
  0x2520180: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2520184: mov      w8, #1
  0x2520188: strb     w8, [x22, #0xbd3]
  0x252018c: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2520190: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2520194: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2520198: cbz      x8, #0x25203f8
  0x252019c: ldr      x25, [x8, #0x68] ; = 0x0 (u64 @ 0x5598068)
  0x25201a0: mov      x0, x23
  0x25201a4: mov      x1, xzr
  0x25201a8: bl       #0x5043144 ; -> UnityEngine.Component$$get_transform
  0x25201ac: cbz      x25, #0x25203fc
  0x25201b0: mov      x4, x0
  0x25201b4: mov      x0, x25
  0x25201b8: mov      w1, w24
  0x25201bc: mov      w2, wzr
  0x25201c0: mov      w3, wzr
  0x25201c4: mov      w5, wzr
  0x25201c8: mov      x6, xzr
  0x25201cc: bl       #0x29038b8 ; -> CUIHud$$PlayHudTextDamage
  0x25201d0: mov      x0, x23
  0x25201d4: mov      x1, xzr
  0x25201d8: bl       #0x28153bc ; -> CCharacterBattle$$get_HP
  0x25201dc: cbnz     w0, #0x2520204
  0x25201e0: mov      x0, x23
  0x25201e4: mov      x1, xzr
  0x25201e8: bl       #0x2714530 ; -> CCharacter$$get_IsAlive
  0x25201ec: tbz      w0, #0, #0x2520204
  0x25201f0: ldr      x8, [x23]
  0x25201f4: ldp      x9, x2, [x8, #0x198]
  0x25201f8: mov      x0, x23
  0x25201fc: mov      w1, wzr
  0x2520200: blr      x9
  0x2520204: cbz      x20, #0x25203f4
  0x2520208: ldr      x8, [x20, #0x38] ; = 0x0 (u64 @ 0x5598038)
  0x252020c: cbz      x8, #0x2520408
  0x2520210: ldr      w8, [x8, #0x18]
  0x2520214: cmp      w8, #1
  0x2520218: b.lt     #0x2520268
  0x252021c: adrp     x8, #0x5598000
  0x2520220: ldr      x8, [x8, #0xec8] ; = 0x0 (u64 @ 0x5598ec8)
  0x2520224: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2520228: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x252022c: mov      x24, x0
  0x2520230: mov      x0, x20
  0x2520234: mov      x1, xzr
  0x2520238: bl       #0x25f5448 ; -> CDamageTypeTemplet$$get_SoundName
  0x252023c: mov      x25, x0
  0x2520240: mov      x0, x23
  0x2520244: mov      x1, xzr
  0x2520248: bl       #0x5043180 ; -> UnityEngine.Component$$get_gameObject
  0x252024c: cbz      x24, #0x2520418
  0x2520250: mov      x3, x0
  0x2520254: mov      x0, x24
  0x2520258: mov      w1, wzr
  0x252025c: mov      x2, x25
  0x2520260: mov      x4, xzr
  0x2520264: bl       #0x25e59e4 ; -> CSoundManager$$PlaySound
  0x2520268: ldr      x8, [x20, #0x50] ; = 0x0 (u64 @ 0x5598050)
  0x252026c: cbz      x8, #0x252040c
  0x2520270: ldr      w8, [x8, #0x18]
  0x2520274: cmp      w8, #1
  0x2520278: b.lt     #0x2520348
  0x252027c: adrp     x8, #0x5598000
  0x2520280: ldr      x8, [x8, #0xec0] ; = 0x0 (u64 @ 0x5598ec0)
  0x2520284: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2520288: bl       #0x3e6b928 ; -> CSingletonBehaviour<object>$$get_Instance
  0x252028c: mov      x24, x0
  0x2520290: ldr      x0, [x20, #0x50] ; = 0x0 (u64 @ 0x5598050)
  0x2520294: cbz      x0, #0x2520414
  0x2520298: adrp     x8, #0x5598000
  0x252029c: ldr      x8, [x8, #0xf40] ; = 0x0 (u64 @ 0x5598f40)
  0x25202a0: ldr      x2, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x25202a4: mov      w1, wzr
  0x25202a8: bl       #0x44c90f4 ; -> System.Collections.Generic.List<object>$$get_Item
  0x25202ac: mov      x25, x0
  0x25202b0: mov      x0, x23
  0x25202b4: mov      x1, xzr
  0x25202b8: bl       #0x5043144 ; -> UnityEngine.Component$$get_transform
  0x25202bc: cbz      x0, #0x2520410
  0x25202c0: mov      x1, xzr
  0x25202c4: bl       #0x504f928 ; -> UnityEngine.Transform$$get_position
  0x25202c8: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x25202cc: stp      xzr, xzr, [sp, #0x18]
  0x25202d0: add      x0, sp, #0x18
  0x25202d4: bl       #0x46357b4 ; -> System.Nullable<Vector3>$$.ctor
  0x25202d8: adrp     x8, #0x59e4000
  0x25202dc: ldrb     w8, [x8, #0xbd8]
  0x25202e0: cbnz     w8, #0x25202fc
  0x25202e4: adrp     x0, #0x5598000
  0x25202e8: ldr      x0, [x0, #0x940] ; = 0x0 (u64 @ 0x5598940)
  0x25202ec: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x25202f0: mov      w8, #1
  0x25202f4: adrp     x9, #0x59e4000
  0x25202f8: strb     w8, [x9, #0xbd8]
  0x25202fc: adrp     x8, #0x5598000
  0x2520300: ldr      x8, [x8, #0x940] ; = 0x0 (u64 @ 0x5598940)
  0x2520304: ldr      x1, [x26] ; = 0x0 (u64 @ 0x5598000)
  0x2520308: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x252030c: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2520310: ldp      s0, s1, [x8]
  0x2520314: ldr      s2, [x8, #8] ; = 0.0 (f32 @ 0x5598008)
  0x2520318: stp      xzr, xzr, [sp, #8]
  0x252031c: add      x0, sp, #8
  0x2520320: bl       #0x46357b4 ; -> System.Nullable<Vector3>$$.ctor
  0x2520324: cbz      x24, #0x252041c
  0x2520328: ldp      x4, x5, [sp, #0x18]
  0x252032c: ldp      x6, x7, [sp, #8]
  0x2520330: mov      x0, x24
  0x2520334: mov      x1, x25
  0x2520338: mov      x2, x23
  0x252033c: mov      x3, x23
  0x2520340: str      xzr, [sp]
  0x2520344: bl       #0x2bebf34 ; -> CEffectManager$$Play
  0x2520348: mov      x0, x20
  0x252034c: mov      x1, xzr
  0x2520350: bl       #0x25f533c ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x2520354: fmul     s0, s0, s0
  0x2520358: fmul     s1, s1, s1
  0x252035c: fadd     s3, s3, s8
  0x2520360: fmul     s2, s2, s2
  0x2520364: fadd     s0, s0, s1
  0x2520368: fadd     s0, s2, s0
  0x252036c: fmul     s1, s3, s3
  0x2520370: fadd     s0, s1, s0
  0x2520374: fcmp     s0, s9
  0x2520378: b.mi     #0x25203a4
  0x252037c: ldr      s0, [x20, #0x30] ; = 0.0 (f32 @ 0x5598030)
  0x2520380: fcmp     s0, #0.0
  0x2520384: b.eq     #0x25203a4
  0x2520388: mov      x0, x20
  0x252038c: mov      x1, xzr
  0x2520390: bl       #0x25f533c ; -> CDamageTypeTemplet$$get_HitColorRGB
  0x2520394: ldr      s4, [x20, #0x30] ; = 0.0 (f32 @ 0x5598030)
  0x2520398: mov      x0, x23
  0x252039c: mov      x1, xzr
  0x25203a0: bl       #0x271dc94 ; -> CCharacter$$PlayHitLightEffect
  0x25203a4: mov      w1, #1
  0x25203a8: mov      x0, x23
  0x25203ac: mov      w2, wzr
  0x25203b0: mov      x3, xzr
  0x25203b4: bl       #0x271d900 ; -> CCharacter$$ChangeDamageReactState
  0x25203b8: b        #0x25200e4
  0x25203bc: adrp     x8, #0x5598000
  0x25203c0: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x25203c4: add      x0, sp, #0x30
  0x25203c8: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x25203cc: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25203d0: ldp      x20, x19, [sp, #0xb0]
  0x25203d4: ldp      x22, x21, [sp, #0xa0]
  0x25203d8: ldp      x24, x23, [sp, #0x90]
  0x25203dc: ldp      x26, x25, [sp, #0x80]
  0x25203e0: ldp      x28, x27, [sp, #0x70]
  0x25203e4: ldp      x29, x30, [sp, #0x60]
  0x25203e8: ldp      d9, d8, [sp, #0x50]
  0x25203ec: add      sp, sp, #0xc0
  0x25203f0: ret      
  0x25203f4: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25203f8: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x25203fc: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520400: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520404: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520408: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x252040c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520410: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520414: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520418: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x252041c: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520420: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2520424: b        #0x25204bc
  0x2520428: b        #0x25204bc
  0x252042c: b        #0x25204bc
  0x2520430: b        #0x25204bc
  0x2520434: b        #0x25204bc
  0x2520438: b        #0x25204bc
  0x252043c: b        #0x25204bc
  0x2520440: b        #0x25204bc
  0x2520444: b        #0x25204bc
  0x2520448: b        #0x25204bc
  0x252044c: b        #0x25204bc
  0x2520450: b        #0x25204bc
  0x2520454: b        #0x25204bc
  0x2520458: b        #0x25204bc
  0x252045c: b        #0x25204bc
  0x2520460: b        #0x25204bc
  0x2520464: b        #0x25204bc
  0x2520468: b        #0x25204bc
  0x252046c: b        #0x25204bc
  0x2520470: b        #0x25204bc
  0x2520474: b        #0x25204bc
  0x2520478: b        #0x25204bc
  0x252047c: b        #0x25204bc
  0x2520480: b        #0x25204bc
  0x2520484: b        #0x25204bc
  0x2520488: b        #0x25204bc
  0x252048c: b        #0x25204bc
  0x2520490: b        #0x25204bc
  0x2520494: b        #0x25204bc
  0x2520498: b        #0x25204bc
  0x252049c: b        #0x25204bc
  0x25204a0: b        #0x25204bc
  0x25204a4: b        #0x25204bc
  0x25204a8: b        #0x25204bc
  0x25204ac: b        #0x25204bc
  0x25204b0: b        #0x25204bc
  0x25204b4: b        #0x25204bc
  0x25204b8: b        #0x25204bc
  0x25204bc: mov      x19, x0
  0x25204c0: cmp      w1, #1
  0x25204c4: b.ne     #0x25204f8
  0x25204c8: mov      x0, x19
  0x25204cc: bl       #0x526dd10 ; -> ??? 0x526dd10
  0x25204d0: ldr      x20, [x0] ; = 0x0 (u64 @ 0x5598000)
  0x25204d4: bl       #0x526dd20 ; -> ??? 0x526dd20
  0x25204d8: adrp     x8, #0x5598000
  0x25204dc: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x25204e0: add      x0, sp, #0x30
  0x25204e4: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x25204e8: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x25204ec: cbz      x20, #0x25203d0
  0x25204f0: mov      x0, x20
  0x25204f4: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x25204f8: mov      x20, xzr
  0x25204fc: b        #0x2520504
  0x2520500: mov      x19, x0
  0x2520504: adrp     x8, #0x5598000
  0x2520508: ldr      x8, [x8, #0xd70] ; = 0x0 (u64 @ 0x5598d70)
  0x252050c: ldr      x1, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2520510: add      x0, sp, #0x30
  0x2520514: bl       #0x4121194 ; -> System.Collections.Generic.List.Enumerator<object>$$Dispose
  0x2520518: cbnz     x20, #0x2520524
  0x252051c: mov      x0, x19
  0x2520520: bl       #0x22b5834 ; -> ??? 0x22b5834
  0x2520524: mov      x0, x20
  0x2520528: bl       #0x21b4d18 ; -> ??? 0x21b4d18
  0x252052c: bl       #0x1f8bf20 ; -> ??? 0x1f8bf20
