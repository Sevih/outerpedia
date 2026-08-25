; jeu 1.4.15 — régénéré par datagen/extract/disasm.py
; ===== CalcDamage @ 0x2cc1588..0x2cc1d40 (taille 1976 octets) =====
  0x2cc1588: sub      sp, sp, #0xc0
  0x2cc158c: stp      d9, d8, [sp, #0x50]
  0x2cc1590: stp      x29, x30, [sp, #0x60]
  0x2cc1594: stp      x28, x27, [sp, #0x70]
  0x2cc1598: stp      x26, x25, [sp, #0x80]
  0x2cc159c: stp      x24, x23, [sp, #0x90]
  0x2cc15a0: stp      x22, x21, [sp, #0xa0]
  0x2cc15a4: stp      x20, x19, [sp, #0xb0]
  0x2cc15a8: adrp     x19, #0x59e9000
  0x2cc15ac: ldrb     w8, [x19, #0xd68]
  0x2cc15b0: mov      x21, x6
  0x2cc15b4: mov      x28, x5
  0x2cc15b8: mov      x27, x4
  0x2cc15bc: mov      w23, w3
  0x2cc15c0: mov      x22, x2
  0x2cc15c4: mov      x24, x1
  0x2cc15c8: mov      x25, x0
  0x2cc15cc: tbnz     w8, #0, #0x2cc1638
  0x2cc15d0: adrp     x0, #0x5599000
  0x2cc15d4: ldr      x0, [x0, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc15d8: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc15dc: adrp     x0, #0x5598000
  0x2cc15e0: ldr      x0, [x0, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2cc15e4: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc15e8: adrp     x0, #0x5598000
  0x2cc15ec: ldr      x0, [x0, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2cc15f0: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc15f4: adrp     x0, #0x55b8000
  0x2cc15f8: ldr      x0, [x0, #0xae0] ; = 0x0 (u64 @ 0x55b8ae0)
  0x2cc15fc: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1600: adrp     x0, #0x5596000
  0x2cc1604: ldr      x0, [x0, #0x628] ; = 0x0 (u64 @ 0x5596628)
  0x2cc1608: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc160c: adrp     x0, #0x55d9000
  0x2cc1610: ldr      x0, [x0, #0xeb8] ; = 0x0 (u64 @ 0x55d9eb8)
  0x2cc1614: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1618: adrp     x0, #0x55b8000
  0x2cc161c: ldr      x0, [x0, #0xaf8] ; = 0x0 (u64 @ 0x55b8af8)
  0x2cc1620: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1624: adrp     x0, #0x5596000
  0x2cc1628: ldr      x0, [x0, #0x860] ; = 0x0 (u64 @ 0x5596860)
  0x2cc162c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1630: mov      w8, #1
  0x2cc1634: strb     w8, [x19, #0xd68]
  0x2cc1638: add      x8, sp, #0x38
  0x2cc163c: add      x0, sp, #0x38
  0x2cc1640: mov      x1, x25
  0x2cc1644: stp      xzr, xzr, [sp, #0x40]
  0x2cc1648: stp      xzr, x25, [sp, #0x30]
  0x2cc164c: str      wzr, [sp, #0x2c]
  0x2cc1650: add      x26, x8, #8
  0x2cc1654: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2cc1658: mov      x0, x26
  0x2cc165c: mov      x1, x24
  0x2cc1660: str      x24, [sp, #0x40]
  0x2cc1664: bl       #0x21b4a28 ; -> ??? 0x21b4a28
  0x2cc1668: str      w23, [sp, #0x48]
  0x2cc166c: cbz      w23, #0x2cc1924
  0x2cc1670: cbz      x22, #0x2cc1d38
  0x2cc1674: ldr      w0, [x22, #0x68]
  0x2cc1678: cbz      w0, #0x2cc1934
  0x2cc167c: add      x1, sp, #0x38
  0x2cc1680: bl       #0x2cc1d40 ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2cc1684: str      w0, [x27]
  0x2cc1688: ldr      x0, [sp, #0x40]
  0x2cc168c: cbz      x0, #0x2cc1d38
  0x2cc1690: mov      x1, xzr
  0x2cc1694: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1698: cbz      x0, #0x2cc1d38
  0x2cc169c: ldr      w8, [x0, #0x80]
  0x2cc16a0: cbnz     w8, #0x2cc1a08
  0x2cc16a4: ldr      x8, [sp, #0x38]
  0x2cc16a8: cbz      x8, #0x2cc1d38
  0x2cc16ac: ldr      x0, [x8, #0xf0]
  0x2cc16b0: cbz      x0, #0x2cc1d38
  0x2cc16b4: mov      w1, wzr
  0x2cc16b8: mov      x2, xzr
  0x2cc16bc: bl       #0x5011710 ; -> UnityEngine.Animator$$GetCurrentAnimatorClipInfo
  0x2cc16c0: cbz      x0, #0x2cc1d38
  0x2cc16c4: ldr      x8, [x0, #0x18] ; = 0x0 (u64 @ 0x5596018)
  0x2cc16c8: mov      x24, x0
  0x2cc16cc: stp      x22, x28, [sp, #8]
  0x2cc16d0: stp      x27, x21, [sp, #0x18]
  0x2cc16d4: cmp      w8, #1
  0x2cc16d8: b.lt     #0x2cc1944
  0x2cc16dc: adrp     x28, #0x55b8000
  0x2cc16e0: adrp     x29, #0x5596000
  0x2cc16e4: adrp     x19, #0x5596000
  0x2cc16e8: adrp     x21, #0x5598000
  0x2cc16ec: adrp     x22, #0x55b8000
  0x2cc16f0: ldr      x28, [x28, #0xae0] ; = 0x0 (u64 @ 0x55b8ae0)
  0x2cc16f4: ldr      x29, [x29, #0x628] ; = 0x0 (u64 @ 0x5596628)
  0x2cc16f8: ldr      x19, [x19, #0x860] ; = 0x0 (u64 @ 0x5596860)
  0x2cc16fc: ldr      x21, [x21, #0xb98] ; = 0x0 (u64 @ 0x5598b98)
  0x2cc1700: ldr      x22, [x22, #0xaf8] ; = 0x0 (u64 @ 0x55b8af8)
  0x2cc1704: mov      w23, wzr
  0x2cc1708: mov      x27, xzr
  0x2cc170c: and      x8, x8, #0xffffffff
  0x2cc1710: cmp      x27, w8, uxtw
  0x2cc1714: b.hs     #0x2cc1d3c
  0x2cc1718: add      x8, x24, x27, lsl #3
  0x2cc171c: ldr      x8, [x8, #0x20]
  0x2cc1720: add      x0, sp, #0x30
  0x2cc1724: mov      x1, xzr
  0x2cc1728: str      x8, [sp, #0x30]
  0x2cc172c: bl       #0x5010f0c ; -> UnityEngine.AnimatorClipInfo$$get_clip
  0x2cc1730: cbz      x0, #0x2cc1d38
  0x2cc1734: mov      x1, xzr
  0x2cc1738: bl       #0x5010e44 ; -> UnityEngine.AnimationClip$$get_events
  0x2cc173c: cbz      x0, #0x2cc1d38
  0x2cc1740: ldr      w8, [x0, #0x18]
  0x2cc1744: mov      x25, x0
  0x2cc1748: cmp      w8, #1
  0x2cc174c: b.lt     #0x2cc1910
  0x2cc1750: mov      w20, wzr
  0x2cc1754: cmp      w20, w8
  0x2cc1758: b.hs     #0x2cc1d3c
  0x2cc175c: add      x8, x25, w20, sxtw #3
  0x2cc1760: ldr      x26, [x8, #0x20]
  0x2cc1764: cbz      x26, #0x2cc1d38
  0x2cc1768: mov      x0, x26
  0x2cc176c: mov      x1, xzr
  0x2cc1770: bl       #0x5010af8 ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2cc1774: ldr      x8, [x28] ; = 0x0 (u64 @ 0x55b8000)
  0x2cc1778: cbz      x8, #0x2cc1d38
  0x2cc177c: mov      x1, x0
  0x2cc1780: mov      x0, x8
  0x2cc1784: mov      x2, xzr
  0x2cc1788: bl       #0x4787590 ; -> System.String$$Equals
  0x2cc178c: tbz      w0, #0, #0x2cc181c
  0x2cc1790: mov      x0, x26
  0x2cc1794: mov      x1, xzr
  0x2cc1798: bl       #0x5010af0 ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2cc179c: cbz      x0, #0x2cc1d38
  0x2cc17a0: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5596000)
  0x2cc17a4: ldr      x2, [x19] ; = 0x0 (u64 @ 0x5596000)
  0x2cc17a8: mov      x3, xzr
  0x2cc17ac: bl       #0x4789cbc ; -> System.String$$Replace
  0x2cc17b0: cbz      x0, #0x2cc1d38
  0x2cc17b4: mov      w1, #0x2c
  0x2cc17b8: mov      w2, wzr
  0x2cc17bc: mov      x3, xzr
  0x2cc17c0: bl       #0x478a310 ; -> System.String$$Split
  0x2cc17c4: ldr      x8, [x21] ; = 0x0 (u64 @ 0x5598000)
  0x2cc17c8: mov      x26, x0
  0x2cc17cc: ldr      w9, [x8, #0xe0]
  0x2cc17d0: cbnz     w9, #0x2cc17dc
  0x2cc17d4: mov      x0, x8
  0x2cc17d8: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc17dc: mov      x0, xzr
  0x2cc17e0: bl       #0x262162c ; -> CTempletManager$$get_Instance
  0x2cc17e4: cbz      x26, #0x2cc1d38
  0x2cc17e8: ldr      w8, [x26, #0x18]
  0x2cc17ec: cbz      w8, #0x2cc1d3c
  0x2cc17f0: cbz      x0, #0x2cc1d38
  0x2cc17f4: ldr      x1, [x26, #0x20]
  0x2cc17f8: mov      x2, xzr
  0x2cc17fc: bl       #0x262c964 ; -> CTempletManager$$GetDamageTemplet
  0x2cc1800: cbz      x0, #0x2cc1d38
  0x2cc1804: ldr      w8, [x0, #0x34]
  0x2cc1808: ldr      w9, [x0, #0x68]
  0x2cc180c: cmp      w8, #0
  0x2cc1810: csinc    w8, w8, wzr, ne
  0x2cc1814: madd     w23, w8, w9, w23
  0x2cc1818: b        #0x2cc1900
  0x2cc181c: mov      x0, x26
  0x2cc1820: mov      x1, xzr
  0x2cc1824: bl       #0x5010af8 ; -> UnityEngine.AnimationEvent$$get_functionName
  0x2cc1828: ldr      x8, [x22] ; = 0x0 (u64 @ 0x55b8000)
  0x2cc182c: cbz      x8, #0x2cc1d38
  0x2cc1830: mov      x1, x0
  0x2cc1834: mov      x0, x8
  0x2cc1838: mov      x2, xzr
  0x2cc183c: bl       #0x4787590 ; -> System.String$$Equals
  0x2cc1840: tbz      w0, #0, #0x2cc1900
  0x2cc1844: mov      x0, x26
  0x2cc1848: mov      x1, xzr
  0x2cc184c: bl       #0x5010af0 ; -> UnityEngine.AnimationEvent$$get_stringParameter
  0x2cc1850: cbz      x0, #0x2cc1d38
  0x2cc1854: ldr      x1, [x29] ; = 0x0 (u64 @ 0x5596000)
  0x2cc1858: ldr      x2, [x19] ; = 0x0 (u64 @ 0x5596000)
  0x2cc185c: mov      x3, xzr
  0x2cc1860: bl       #0x4789cbc ; -> System.String$$Replace
  0x2cc1864: cbz      x0, #0x2cc1d38
  0x2cc1868: mov      w1, #0x2c
  0x2cc186c: mov      w2, wzr
  0x2cc1870: mov      x3, xzr
  0x2cc1874: bl       #0x478a310 ; -> System.String$$Split
  0x2cc1878: cbz      x0, #0x2cc1900
  0x2cc187c: ldr      w8, [x0, #0x18]
  0x2cc1880: cmp      w8, #2
  0x2cc1884: b.lt     #0x2cc1900
  0x2cc1888: ldr      x0, [x0, #0x28] ; = 0x0 (u64 @ 0x5596028)
  0x2cc188c: add      x1, sp, #0x2c
  0x2cc1890: mov      x2, xzr
  0x2cc1894: bl       #0x4910d98 ; -> System.Int32$$TryParse
  0x2cc1898: ldr      w8, [sp, #0x2c]
  0x2cc189c: cmp      w8, #1
  0x2cc18a0: b.lt     #0x2cc1900
  0x2cc18a4: tbz      w0, #0, #0x2cc1900
  0x2cc18a8: add      x0, sp, #0x2c
  0x2cc18ac: mov      x1, xzr
  0x2cc18b0: bl       #0x4910684 ; -> System.Int32$$ToString
  0x2cc18b4: adrp     x8, #0x55d9000
  0x2cc18b8: ldr      x8, [x8, #0xeb8] ; = 0x0 (u64 @ 0x55d9eb8)
  0x2cc18bc: mov      x1, x0
  0x2cc18c0: mov      x2, xzr
  0x2cc18c4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x55d9000)
  0x2cc18c8: mov      x0, x8
  0x2cc18cc: bl       #0x477b31c ; -> System.String$$Concat
  0x2cc18d0: adrp     x8, #0x5598000
  0x2cc18d4: ldr      x8, [x8, #0xa60] ; = 0x0 (u64 @ 0x5598a60)
  0x2cc18d8: mov      x26, x0
  0x2cc18dc: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2cc18e0: ldr      w9, [x8, #0xe0]
  0x2cc18e4: cbnz     w9, #0x2cc18f0
  0x2cc18e8: mov      x0, x8
  0x2cc18ec: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc18f0: mov      x0, x26
  0x2cc18f4: bl       #0x2cb6058 ; -> CDebug$$LogWarning
  0x2cc18f8: ldr      w8, [sp, #0x2c]
  0x2cc18fc: add      w23, w8, w23
  0x2cc1900: ldr      w8, [x25, #0x18]
  0x2cc1904: add      w20, w20, #1
  0x2cc1908: cmp      w20, w8
  0x2cc190c: b.lt     #0x2cc1754
  0x2cc1910: ldr      w8, [x24, #0x18]
  0x2cc1914: add      x27, x27, #1
  0x2cc1918: cmp      x27, w8, sxtw
  0x2cc191c: b.lt     #0x2cc1710
  0x2cc1920: b        #0x2cc1948
  0x2cc1924: str      wzr, [x21]
  0x2cc1928: str      wzr, [x28]
  0x2cc192c: str      wzr, [x27]
  0x2cc1930: b        #0x2cc1c74
  0x2cc1934: str      wzr, [x27]
  0x2cc1938: str      wzr, [x28]
  0x2cc193c: str      wzr, [x21]
  0x2cc1940: b        #0x2cc1c74
  0x2cc1944: mov      w23, wzr
  0x2cc1948: ldp      x27, x21, [sp, #0x18]
  0x2cc194c: ldp      x22, x28, [sp, #8]
  0x2cc1950: cbnz     w23, #0x2cc1990
  0x2cc1954: ldr      x0, [sp, #0x38]
  0x2cc1958: cbz      x0, #0x2cc1d38
  0x2cc195c: mov      x1, xzr
  0x2cc1960: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1964: cbz      x0, #0x2cc1d38
  0x2cc1968: ldr      w8, [x0, #0x88]
  0x2cc196c: cbz      w8, #0x2cc198c
  0x2cc1970: ldr      x0, [sp, #0x38]
  0x2cc1974: cbz      x0, #0x2cc1d38
  0x2cc1978: mov      x1, xzr
  0x2cc197c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1980: cbz      x0, #0x2cc1d38
  0x2cc1984: ldr      w23, [x0, #0x88]
  0x2cc1988: b        #0x2cc1990
  0x2cc198c: mov      w23, wzr
  0x2cc1990: ldr      x0, [sp, #0x40]
  0x2cc1994: cbz      x0, #0x2cc1d38
  0x2cc1998: mov      x1, xzr
  0x2cc199c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc19a0: mov      x24, x0
  0x2cc19a4: add      x1, sp, #0x38
  0x2cc19a8: mov      w0, w23
  0x2cc19ac: bl       #0x2cc1d40 ; -> CFormula$$<CalcDamage>g__CalcDamage|17_0
  0x2cc19b0: cbz      x24, #0x2cc1d38
  0x2cc19b4: str      w0, [x24, #0x80]
  0x2cc19b8: ldr      x0, [sp, #0x40]
  0x2cc19bc: cbz      x0, #0x2cc1d38
  0x2cc19c0: mov      x1, xzr
  0x2cc19c4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc19c8: cbz      x0, #0x2cc1d38
  0x2cc19cc: str      w23, [x0, #0x88]
  0x2cc19d0: ldr      x0, [sp, #0x40]
  0x2cc19d4: cbz      x0, #0x2cc1d38
  0x2cc19d8: mov      x1, xzr
  0x2cc19dc: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc19e0: ldr      x8, [sp, #0x40]
  0x2cc19e4: cbz      x8, #0x2cc1d38
  0x2cc19e8: mov      x23, x0
  0x2cc19ec: mov      x0, x8
  0x2cc19f0: mov      x1, xzr
  0x2cc19f4: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc19f8: cbz      x0, #0x2cc1d38
  0x2cc19fc: str      wzr, [x0, #0x84]
  0x2cc1a00: cbz      x23, #0x2cc1d38
  0x2cc1a04: str      wzr, [x23, #0x8c]
  0x2cc1a08: ldr      x0, [sp, #0x38]
  0x2cc1a0c: bl       #0x2cc1fdc ; -> CFormula$$IsIgnoreTurnLimitDamage
  0x2cc1a10: tbnz     w0, #0, #0x2cc1a54
  0x2cc1a14: adrp     x19, #0x59e4000
  0x2cc1a18: ldrb     w8, [x19, #0xbd3]
  0x2cc1a1c: cbnz     w8, #0x2cc1a34
  0x2cc1a20: adrp     x0, #0x5598000
  0x2cc1a24: ldr      x0, [x0, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc1a28: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1a2c: mov      w8, #1
  0x2cc1a30: strb     w8, [x19, #0xbd3]
  0x2cc1a34: adrp     x8, #0x5598000
  0x2cc1a38: ldr      x8, [x8, #0xd58] ; = 0x0 (u64 @ 0x5598d58)
  0x2cc1a3c: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2cc1a40: ldr      x8, [x8, #0xb8] ; = 0x0 (u64 @ 0x55980b8)
  0x2cc1a44: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5598000)
  0x2cc1a48: cbz      x8, #0x2cc1d38
  0x2cc1a4c: ldrb     w8, [x8, #0x35]
  0x2cc1a50: cbz      w8, #0x2cc1c98
  0x2cc1a54: ldr      x0, [sp, #0x40]
  0x2cc1a58: cbz      x0, #0x2cc1d38
  0x2cc1a5c: mov      x1, xzr
  0x2cc1a60: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1a64: cbz      x0, #0x2cc1d38
  0x2cc1a68: ldr      w8, [x0, #0x8c]
  0x2cc1a6c: ldr      w9, [x22, #0x68]
  0x2cc1a70: add      w8, w9, w8
  0x2cc1a74: str      w8, [x0, #0x8c]
  0x2cc1a78: ldr      x0, [sp, #0x40]
  0x2cc1a7c: cbz      x0, #0x2cc1d38
  0x2cc1a80: mov      x1, xzr
  0x2cc1a84: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1a88: cbz      x0, #0x2cc1d38
  0x2cc1a8c: ldr      x8, [sp, #0x40]
  0x2cc1a90: cbz      x8, #0x2cc1d38
  0x2cc1a94: ldr      w19, [x0, #0x8c]
  0x2cc1a98: mov      x0, x8
  0x2cc1a9c: mov      x1, xzr
  0x2cc1aa0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1aa4: cbz      x0, #0x2cc1d38
  0x2cc1aa8: ldr      w8, [x0, #0x88]
  0x2cc1aac: cmp      w19, w8
  0x2cc1ab0: b.lt     #0x2cc1b78
  0x2cc1ab4: ldr      x0, [sp, #0x40]
  0x2cc1ab8: cbz      x0, #0x2cc1d38
  0x2cc1abc: mov      x1, xzr
  0x2cc1ac0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1ac4: cbz      x0, #0x2cc1d38
  0x2cc1ac8: ldr      x8, [sp, #0x40]
  0x2cc1acc: cbz      x8, #0x2cc1d38
  0x2cc1ad0: ldr      w20, [x0, #0x80]
  0x2cc1ad4: mov      x0, x8
  0x2cc1ad8: mov      x1, xzr
  0x2cc1adc: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1ae0: cbz      x0, #0x2cc1d38
  0x2cc1ae4: ldr      w8, [x0, #0x84]
  0x2cc1ae8: ldr      w19, [x27]
  0x2cc1aec: add      w8, w19, w8
  0x2cc1af0: cmp      w20, w8
  0x2cc1af4: b.le     #0x2cc1b40
  0x2cc1af8: ldr      x0, [sp, #0x40]
  0x2cc1afc: cbz      x0, #0x2cc1d38
  0x2cc1b00: mov      x1, xzr
  0x2cc1b04: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1b08: cbz      x0, #0x2cc1d38
  0x2cc1b0c: ldr      x8, [sp, #0x40]
  0x2cc1b10: cbz      x8, #0x2cc1d38
  0x2cc1b14: ldr      w20, [x0, #0x80]
  0x2cc1b18: mov      x0, x8
  0x2cc1b1c: mov      x1, xzr
  0x2cc1b20: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1b24: cbz      x0, #0x2cc1d38
  0x2cc1b28: ldr      w8, [x0, #0x84]
  0x2cc1b2c: ldr      w9, [x27]
  0x2cc1b30: add      w10, w20, w19
  0x2cc1b34: sub      w8, w10, w8
  0x2cc1b38: sub      w8, w8, w9
  0x2cc1b3c: str      w8, [x27]
  0x2cc1b40: ldr      x0, [sp, #0x40]
  0x2cc1b44: cbz      x0, #0x2cc1d38
  0x2cc1b48: mov      x1, xzr
  0x2cc1b4c: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1b50: ldr      x8, [sp, #0x40]
  0x2cc1b54: cbz      x8, #0x2cc1d38
  0x2cc1b58: mov      x22, x0
  0x2cc1b5c: mov      x0, x8
  0x2cc1b60: mov      x1, xzr
  0x2cc1b64: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1b68: cbz      x0, #0x2cc1d38
  0x2cc1b6c: str      wzr, [x0, #0x88]
  0x2cc1b70: cbz      x22, #0x2cc1d38
  0x2cc1b74: str      wzr, [x22, #0x80]
  0x2cc1b78: ldr      x0, [sp, #0x40]
  0x2cc1b7c: cbz      x0, #0x2cc1d38
  0x2cc1b80: mov      x1, xzr
  0x2cc1b84: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1b88: cbz      x0, #0x2cc1d38
  0x2cc1b8c: ldr      w8, [x0, #0x84]
  0x2cc1b90: ldr      w9, [x27]
  0x2cc1b94: add      w8, w9, w8
  0x2cc1b98: str      w8, [x0, #0x84]
  0x2cc1b9c: ldr      x8, [sp, #0x38]
  0x2cc1ba0: cbz      x8, #0x2cc1d38
  0x2cc1ba4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5598028)
  0x2cc1ba8: cbz      x0, #0x2cc1d38
  0x2cc1bac: ldr      w22, [x27]
  0x2cc1bb0: mov      x1, xzr
  0x2cc1bb4: bl       #0x2909784 ; -> CCharacterData$$get_Vampiric
  0x2cc1bb8: adrp     x8, #0x5599000
  0x2cc1bbc: ldr      x8, [x8, #0x1e8] ; = 0x0 (u64 @ 0x55991e8)
  0x2cc1bc0: mov      w23, w0
  0x2cc1bc4: ldr      x8, [x8] ; = 0x0 (u64 @ 0x5599000)
  0x2cc1bc8: ldr      w9, [x8, #0xe0]
  0x2cc1bcc: cbnz     w9, #0x2cc1bd8
  0x2cc1bd0: mov      x0, x8
  0x2cc1bd4: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc1bd8: mov      w0, w22
  0x2cc1bdc: mov      w1, w23
  0x2cc1be0: mov      x2, xzr
  0x2cc1be4: bl       #0x2a0b520 ; -> CCommonDefine$$MulPermille
  0x2cc1be8: str      w0, [x28]
  0x2cc1bec: ldr      x8, [sp, #0x40]
  0x2cc1bf0: cbz      x8, #0x2cc1d38
  0x2cc1bf4: ldr      x0, [x8, #0x28] ; = 0x0 (u64 @ 0x5599028)
  0x2cc1bf8: cbz      x0, #0x2cc1d38
  0x2cc1bfc: ldr      w20, [x27]
  0x2cc1c00: mov      x1, xzr
  0x2cc1c04: bl       #0x2909860 ; -> CCharacterData$$get_HitHPRecovery
  0x2cc1c08: adrp     x8, #0x1070000
  0x2cc1c0c: adrp     x19, #0x59e4000
  0x2cc1c10: ldrb     w9, [x19, #0xc19]
  0x2cc1c14: ldr      s8, [x8, #0x6d8] ; = 0.0010000000474974513 (f32 @ 0x10706d8)
  0x2cc1c18: mul      w8, w0, w20
  0x2cc1c1c: scvtf    s9, w8
  0x2cc1c20: cbnz     w9, #0x2cc1c38
  0x2cc1c24: adrp     x0, #0x5597000
  0x2cc1c28: ldr      x0, [x0, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc1c2c: bl       #0x21b4a84 ; -> ??? 0x21b4a84
  0x2cc1c30: mov      w8, #1
  0x2cc1c34: strb     w8, [x19, #0xc19]
  0x2cc1c38: adrp     x8, #0x5597000
  0x2cc1c3c: ldr      x8, [x8, #0x40] ; = 0x0 (u64 @ 0x5597040)
  0x2cc1c40: fmul     s8, s9, s8
  0x2cc1c44: ldr      x0, [x8] ; = 0x0 (u64 @ 0x5597000)
  0x2cc1c48: ldr      w8, [x0, #0xe0]
  0x2cc1c4c: cbnz     w8, #0x2cc1c54
  0x2cc1c50: bl       #0x21b4bfc ; -> ??? 0x21b4bfc
  0x2cc1c54: mov      w8, #0x7f800000
  0x2cc1c58: frintm   s0, s8
  0x2cc1c5c: fmov     s1, w8
  0x2cc1c60: fcvtms   w9, s8
  0x2cc1c64: fcmp     s0, s1
  0x2cc1c68: mov      w8, #-0xffffffff80000000
  0x2cc1c6c: csel     w8, w8, w9, eq
  0x2cc1c70: str      w8, [x21]
  0x2cc1c74: ldp      x20, x19, [sp, #0xb0]
  0x2cc1c78: ldp      x22, x21, [sp, #0xa0]
  0x2cc1c7c: ldp      x24, x23, [sp, #0x90]
  0x2cc1c80: ldp      x26, x25, [sp, #0x80]
  0x2cc1c84: ldp      x28, x27, [sp, #0x70]
  0x2cc1c88: ldp      x29, x30, [sp, #0x60]
  0x2cc1c8c: ldp      d9, d8, [sp, #0x50]
  0x2cc1c90: add      sp, sp, #0xc0
  0x2cc1c94: ret      
  0x2cc1c98: ldr      x0, [sp, #0x40]
  0x2cc1c9c: cbz      x0, #0x2cc1d38
  0x2cc1ca0: ldr      w8, [x0, #0x2ec]
  0x2cc1ca4: cmn      w8, #1
  0x2cc1ca8: b.eq     #0x2cc1a54
  0x2cc1cac: mov      x1, xzr
  0x2cc1cb0: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1cb4: cbz      x0, #0x2cc1d38
  0x2cc1cb8: ldr      w8, [x0, #0x90]
  0x2cc1cbc: cmn      w8, #1
  0x2cc1cc0: b.ne     #0x2cc1a54
  0x2cc1cc4: ldr      x0, [sp, #0x40]
  0x2cc1cc8: cbz      x0, #0x2cc1d38
  0x2cc1ccc: ldr      w19, [x0, #0x2ec]
  0x2cc1cd0: ldr      w20, [x0, #0x2f0]
  0x2cc1cd4: mov      x1, xzr
  0x2cc1cd8: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1cdc: cbz      x0, #0x2cc1d38
  0x2cc1ce0: ldr      w8, [x0, #0x80]
  0x2cc1ce4: sub      w9, w19, w20
  0x2cc1ce8: ldr      x0, [sp, #0x40]
  0x2cc1cec: bic      w9, w9, w9, asr #31
  0x2cc1cf0: cmp      w9, w8
  0x2cc1cf4: csel     w23, w9, w8, lt
  0x2cc1cf8: mov      w1, w23
  0x2cc1cfc: bl       #0x2cc2130 ; -> CFormula$$CalcCharacterSharedDamage
  0x2cc1d00: ldr      x8, [sp, #0x40]
  0x2cc1d04: cbz      x8, #0x2cc1d38
  0x2cc1d08: mov      w24, w0
  0x2cc1d0c: mov      x0, x8
  0x2cc1d10: mov      x1, xzr
  0x2cc1d14: bl       #0x2816684 ; -> CCharacterBattle$$get_SkillRecord
  0x2cc1d18: cbz      x0, #0x2cc1d38
  0x2cc1d1c: str      w24, [x0, #0x90]
  0x2cc1d20: ldr      x8, [sp, #0x40]
  0x2cc1d24: cbz      x8, #0x2cc1d38
  0x2cc1d28: ldr      w9, [x8, #0x2f0]
  0x2cc1d2c: add      w9, w9, w23
  0x2cc1d30: str      w9, [x8, #0x2f0]
  0x2cc1d34: b        #0x2cc1a54
  0x2cc1d38: bl       #0x21b4d20 ; -> ??? 0x21b4d20
  0x2cc1d3c: bl       #0x21b4d28 ; -> ??? 0x21b4d28
