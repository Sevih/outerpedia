# Régénère les listings ASM que cite docs/specs/damage-formula.md
# (`pnpm datagen:disasm`).
#
# Les specs damage s'appuient sur ces listings : ils doivent être régénérés
# À CHAQUE PATCH (demande Sevih 10/08/2026 — les RVA changent à chaque version
# du binaire). D'où ce script COMMITTÉ, qui résout chaque méthode PAR NOM dans
# script.json (jamais d'adresse en dur), contrairement aux scripts historiques
# de .gamedata/apk/ (RVA 1.4.9 figés).
#
# Entrées, TOUTES produites par `pnpm datagen:dump` (qui ré-extrait la paire de
# l'APK installé sur l'émulateur — c'est là que « régénérer l'APK » se joue) :
#   - .gamedata/apk/libil2cpp.so         binaire du dump courant
#   - .gamedata/apk/dumped/script.json   noms → adresses (Il2CppDumper)
#   - .gamedata/apk/dumped/.dump-stamp.json  empreinte de la paire
# AUCUN repli sur un .so trouvé ailleurs (constat Sevih 13/08/2026 : le repli
# ramassait l'archive APKPure 1.4.9 du 22/06 et désassemblait du figé). Pire,
# il pouvait apparier un binaire PÉRIMÉ à un script.json FRAIS : adresses
# justes, octets faux, 88 listings crédibles et mensongers sans une erreur.
# D'où la vérification du sha256 contre l'empreinte, avant tout octet lu.
#
# Sortie : docs/specs/damage-formula-asm/<listing>.asm — SUIVIS PAR GIT, c'est
# la copie durable que la spec référence. Le diff d'un patch montre donc
# exactement ce que le jeu a bougé dans les formules.
#
# Une méthode du manifeste ABSENTE de script.json = échec de fin de run avec
# la liste complète : un renommage du jeu doit se VOIR (la spec qui cite ce
# listing est peut-être périmée), jamais être sauté en silence. Un .asm présent
# en sortie mais ABSENT du manifeste est signalé de même : plus personne ne le
# régénère, la spec qui le cite se périme en silence.
#
# Annotations (reprises du pattern historique dump_cformula.py) :
#   - `bl` → nom de la méthode cible (script.json) ;
#   - `adrp`+`ldr` → littéral chargé (f32/f64/u64) — les constantes des
#     formules (plancher −999000, MISSED_DAMAGE_RATE…) se lisent en clair.
#
# Prérequis : python 3 + capstone (`pip install capstone`).
import bisect
import hashlib
import json
import os
import re
import struct
import sys
from collections import defaultdict

try:
    import capstone
except ImportError:
    sys.exit(
        "capstone manquant — `pip install capstone` (désassembleur ARM64 des listings)."
    )

# Racine de l'aire de travail — `GAMEDATA_ROOT` (cf. datagen/lib/paths.ts).
APK_DIR = os.path.join(os.environ.get("GAMEDATA_ROOT", ".gamedata"), "apk")
LIB = os.path.join(APK_DIR, "libil2cpp.so")
SCRIPT_JSON = os.path.join(APK_DIR, "dumped", "script.json")
STAMP = os.path.join(APK_DIR, "dumped", ".dump-stamp.json")
ASM_DIR = os.path.join("docs", "specs", "damage-formula-asm")
RUN_DUMP = "lancer `pnpm datagen:dump` (émulateur lancé, jeu À JOUR)."

# ── Manifeste : listing → nom Il2CppDumper (+ ordinal parmi les surcharges,
# adresses croissantes). Il vit dans `listings.json`, PARTAGÉ avec
# `extract-cs.ts` (pipeline Steam, mêmes 99 méthodes en C#) : AJOUTER LÀ-BAS
# toute méthode qu'une spec se met à citer.
with open(os.path.join("datagen", "extract", "listings.json"), encoding="utf-8") as _f:
    M = [(e["file"], e["method"], e["overload"]) for e in json.load(_f)]


def load_binary() -> tuple[bytes, str]:
    """Octets du binaire du dump COURANT + version du jeu, une fois l'appariement
    .so ↔ script.json prouvé par l'empreinte. Aucun repli : désassembler un .so
    qui ne correspond pas au script.json donne des listings faux et muets."""
    for path in (LIB, SCRIPT_JSON, STAMP):
        if not os.path.exists(path):
            sys.exit(f"{path} introuvable — {RUN_DUMP}")

    with open(STAMP, encoding="utf-8") as f:
        stamp = json.load(f)
    with open(LIB, "rb") as f:
        data = f.read()

    digest = hashlib.sha256(data).hexdigest()
    expected = stamp.get("so", {}).get("sha256")
    if digest != expected:
        sys.exit(
            f"✗ {LIB} ne correspond PAS à l'empreinte du dump :\n"
            f"    binaire   sha256 {digest}\n"
            f"    empreinte sha256 {expected}\n"
            f"  Le script.json d'à côté vient d'un AUTRE binaire : les adresses\n"
            f"  tomberaient sur les mauvais octets. Régénérer la paire — {RUN_DUMP}"
        )
    return data, stamp.get("gameVersion", "inconnue")


def skeleton(name: str) -> str:
    """Nom avec ses suites de chiffres remplacées par `#`.

    Les méthodes générées par le compilateur portent un compteur interne
    (`<Foo>d__81$$MoveNext`, `<Foo>g__Bar|81_1`, `<>c__DisplayClass81_1`) qui
    se renumérote à chaque recompilation de la classe, sans que la méthode
    change. Le squelette sert de repli quand le nom exact a disparu — et il
    n'est accepté que s'il désigne UN SEUL nom, sinon on ne sait pas lequel
    la spec citait et on échoue.
    """
    return re.sub(r"\d+", "#", name)


def report_orphans(generated: set[str]) -> None:
    """Listings présents en sortie mais hors manifeste : plus personne ne les
    régénère, donc la spec qui les cite se périmera sans bruit."""
    existing = {f[:-4] for f in os.listdir(ASM_DIR) if f.endswith(".asm")}
    orphans = sorted(existing - generated)
    if orphans:
        print("\n⚠ Listings hors manifeste (plus régénérés — les ajouter à M ou")
        print("  les supprimer avec la référence de la spec) :")
        for name in orphans:
            print(f"  - {name}.asm")


def main() -> None:
    # Console Windows en cp1252 (sortie redirigée, CI) : sans ça les `✅`/`⚠`
    # lèvent un UnicodeEncodeError APRÈS écriture — un run réussi remonterait
    # en échec à `datagen:dump`.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")

    data, version = load_binary()
    print(f"lib : {LIB} (jeu {version})")

    # Mapping VA → offset fichier via les program headers ELF (PT_LOAD).
    e_phoff = struct.unpack_from("<Q", data, 0x20)[0]
    e_phentsize = struct.unpack_from("<H", data, 0x36)[0]
    e_phnum = struct.unpack_from("<H", data, 0x38)[0]
    segs = []
    for i in range(e_phnum):
        base = e_phoff + i * e_phentsize
        p_type, _f, p_offset, p_vaddr, _pa, p_filesz, _ms, _al = struct.unpack_from(
            "<IIQQQQQQ", data, base
        )
        if p_type == 1:
            segs.append((p_vaddr, p_filesz, p_offset))

    def va_to_off(va: int):
        for v, fs, off in segs:
            if v <= va < v + fs:
                return off + (va - v)
        return None

    with open(SCRIPT_JSON, encoding="utf-8") as f:
        script = json.load(f)
    name_by_addr = {}
    addrs_by_name = defaultdict(list)
    for m in script["ScriptMethod"]:
        name_by_addr.setdefault(m["Address"], m["Name"])
        addrs_by_name[m["Name"]].append(m["Address"])
    for name in addrs_by_name:
        addrs_by_name[name].sort()
    sorted_addrs = sorted(name_by_addr)

    names_by_skeleton = defaultdict(set)
    for name in addrs_by_name:
        names_by_skeleton[skeleton(name)].add(name)

    renamed = []

    def resolve(method: str) -> tuple[str, list[int]]:
        """Nom exact, sinon repli sur le squelette (compteur du compilateur
        renuméroté). Ambigu = non résolu : mieux vaut l'échec que le mauvais
        listing."""
        if method in addrs_by_name:
            return method, addrs_by_name[method]
        candidates = names_by_skeleton.get(skeleton(method), set())
        if len(candidates) == 1:
            actual = next(iter(candidates))
            renamed.append((method, actual))
            return actual, addrs_by_name[actual]
        return method, []

    def func_end(start: int) -> int:
        i = bisect.bisect_right(sorted_addrs, start)
        return sorted_addrs[i] if i < len(sorted_addrs) else start + 0x2000

    md = capstone.Cs(capstone.CS_ARCH_ARM64, capstone.CS_MODE_ARM)
    md.detail = True

    def read_f32(off):
        return struct.unpack_from("<f", data, off)[0]

    def read_f64(off):
        return struct.unpack_from("<d", data, off)[0]

    def read_u64(off):
        return struct.unpack_from("<Q", data, off)[0]

    os.makedirs(ASM_DIR, exist_ok=True)
    # Estampille : un listing sorti d'un patch doit dire DE QUEL binaire il sort
    # — les RVA seuls ne le disent pas.
    stamp_line = f"; jeu {version} — régénéré par datagen/extract/disasm.py"
    missing = []
    written = set()
    for fname, method, pick in M:
        method, addrs = resolve(method)
        if pick >= len(addrs):
            missing.append(f"{fname}: {method} (surcharge {pick}, {len(addrs)} trouvée(s))")
            continue
        start = addrs[pick]
        end = func_end(start)
        off = va_to_off(start)
        if off is None:
            missing.append(f"{fname}: {method} — adresse {hex(start)} hors segments")
            continue
        out = [
            stamp_line,
            f"; ===== {fname} @ {hex(start)}..{hex(end)} (taille {end - start} octets) =====",
        ]
        # Suivi naïf des `adrp` par registre pour annoter les littéraux chargés.
        adrp_pages = {}
        for ins in md.disasm(data[off : off + (end - start)], start):
            line = f"{hex(ins.address)}: {ins.mnemonic:8s} {ins.op_str}"
            ann = ""
            if ins.mnemonic == "bl":
                tgt = int(ins.op_str.strip("#"), 16)
                n = name_by_addr.get(tgt)
                ann = f" ; -> {n}" if n else f" ; -> ??? {hex(tgt)}"
            elif ins.mnemonic == "adrp":
                reg = ins.op_str.split(",")[0].strip()
                page = int(ins.op_str.split("#")[1], 16)
                adrp_pages[reg] = page
            elif ins.mnemonic == "ldr":
                parts = ins.op_str.split(", [")
                if len(parts) == 2 and parts[1].endswith("]"):
                    dst = parts[0].strip()
                    mem = parts[1][:-1]
                    base = mem.split(",")[0].strip()
                    imm = int(mem.split("#")[1], 16) if "#" in mem else 0
                    if base in adrp_pages:
                        va = adrp_pages[base] + imm
                        o = va_to_off(va)
                        if o is not None:
                            if dst.startswith("s"):
                                ann = f" ; = {read_f32(o)!r} (f32 @ {hex(va)})"
                            elif dst.startswith("d"):
                                ann = f" ; = {read_f64(o)!r} (f64 @ {hex(va)})"
                            elif dst.startswith("x"):
                                ann = f" ; = {hex(read_u64(o))} (u64 @ {hex(va)})"
            out.append("  " + line + ann)
        path = os.path.join(ASM_DIR, f"{fname}.asm")
        with open(path, "w", encoding="utf-8", newline="\n") as g:
            g.write("\n".join(out) + "\n")
        written.add(fname)
        print(f"  {fname}: {end - start} octets")

    if renamed:
        print("\nℹ Compteurs du compilateur renumérotés (résolus par squelette —")
        print("  aligner le manifeste M pour garder une lecture honnête) :")
        for before, after in renamed:
            print(f"  - {before}\n    → {after}")

    report_orphans(written)
    if missing:
        print("\n✗ Méthodes du manifeste NON résolues (jeu renommé/restructuré ?")
        print("  — les specs qui citent ces listings sont peut-être périmées) :")
        for line in missing:
            print(f"  - {line}")
        sys.exit(1)
    print(f"\n✅ {len(M)} listings régénérés dans {ASM_DIR}")


if __name__ == "__main__":
    main()
