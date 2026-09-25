/**
 * Guide « Outerplane on Linux » — Steam + Proton en tête (le jeu est sur Steam
 * Windows depuis le 26/08/2026, testé par Sevih sous Fedora), puis le setup
 * Waydroid en repli (porté tel quel, contribution Daystars). Les
 * `[À CONFIRMER : …]` attendent les réglages exacts de Sevih. VOLONTAIREMENT EN ANGLAIS SEUL : guide technique de niche
 * (commandes shell, public anglophone) — seuls le meta et le SEO sont
 * localisés. Server Component, aucune donnée de jeu.
 *
 * Le disclaimer, autrefois passé à GuideTemplate, est ici un bandeau en tête
 * de contenu : le cadre actuel (guide-detail) n'a pas — à raison — de prop dédiée
 * pour un cas unique.
 */

function Code({ children }: { children: string }) {
  return (
    <pre className="border-line-subtle bg-surface-sunken text-content overflow-x-auto rounded-lg border p-4 text-sm">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  id = `step-${n}`,
  children,
}: {
  n: number;
  title: string;
  /** Ancre ; `step-n` par défaut (voie Waydroid), `steam-n` pour la voie Steam. */
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-3">
      <h2 className="text-xl font-semibold">
        <span className="text-content-strong mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-sm font-bold">
          {n}
        </span>
        {title}
      </h2>
      <div className="text-content-muted space-y-3 text-sm">{children}</div>
    </section>
  );
}

/** Placeholder à remplacer par un fait fourni par Sevih — voyant exprès. */
function ToConfirm({ children }: { children: string }) {
  return <span className="text-ed-amber font-semibold">[À CONFIRMER : {children}]</span>;
}

function Warning({ children }: { children: React.ReactNode }) {
  return <div className="border-warn/30 bg-warn/10 rounded-lg border p-4 text-sm">{children}</div>;
}

export default function OuterplaneOnLinuxGuide() {
  // Guide EN seul par choix : `lang="en"` pour que les lecteurs d'écran le
  // lisent en anglais sur /fr, /jp… — `contents` ne change rien à la mise en page.
  return (
    <div lang="en" className="contents">
      {/* Disclaimer (ex-prop de GuideTemplate) */}
      <Warning>
        <strong>Important:</strong> This is an unofficial community guide, not endorsed or supported
        by the Outerplane team. The game does not officially support Linux, and the team is unable
        to provide any assistance for issues encountered in this environment. Users proceed at their
        own risk — the team reserves the right to take action if problems arise. For the officially
        supported PC experience, use Steam (Windows) or Google Play Games.
      </Warning>

      {/* Héro */}
      <section className="border-line-subtle from-surface-raised/60 via-surface-raised to-surface-raised/60 relative mb-8 overflow-hidden rounded-xl border bg-linear-to-br p-6 md:p-8">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Outerplane on <span className="text-green-400">Linux</span>
          </h2>
          <p className="text-content-muted mt-2 text-sm">
            Outerplane is on Steam for Windows: on Linux, Steam + Proton runs it directly. Waydroid
            Android emulation remains as a fallback, with all 2026 fixes for translation, Google
            cert, network sync, and anti-cheat.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-8 lg:col-span-2">
          {/* Voie recommandée : Steam + Proton (le PC natif est Windows seul). */}
          <section id="steam-proton" className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">Via Steam (Proton) — recommended</h2>
            <p className="text-content-muted text-sm">
              Outerplane is available on{' '}
              <a
                href="https://store.steampowered.com/app/4247320/OUTERPLANE/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-sky underline"
              >
                Steam
              </a>{' '}
              for Windows. Steam&apos;s Proton compatibility layer runs it on Linux, with no Android
              emulation needed. Tested on Fedora (
              <ToConfirm>version de Fedora et GPU du test</ToConfirm>).
            </p>
          </section>

          <Step n={1} id="steam-1" title="Install Steam">
            <p>Install Steam from your distribution, or from Flathub:</p>
            <p className="text-content-strong font-semibold">Fedora (RPM Fusion nonfree):</p>
            <Code>{`sudo dnf install steam`}</Code>
            <p className="text-content-strong mt-2 font-semibold">Any distro (Flatpak):</p>
            <Code>{`flatpak install flathub com.valvesoftware.Steam`}</Code>
            <p>
              <ToConfirm>paquet utilisé pour le test (RPM Fusion ou Flatpak)</ToConfirm>
            </p>
          </Step>

          <Step n={2} id="steam-2" title="Enable Proton for all titles">
            <p>
              In Steam, open <strong>Settings → Compatibility</strong>, turn on{' '}
              <strong>Enable Steam Play for all other titles</strong>, pick a Proton version, then
              restart Steam.
            </p>
            <p>
              Proton version: <ToConfirm>version de Proton testée</ToConfirm>
            </p>
          </Step>

          <Step n={3} id="steam-3" title="Install Outerplane">
            <p>
              Search for <strong>OUTERPLANE</strong> in the Steam store (free to play), add it to
              your library, then install it.
            </p>
            <p>
              <ToConfirm>
                réglage par jeu nécessaire ou non (Properties → Compatibility → Force the use of a
                specific Steam Play compatibility tool)
              </ToConfirm>
            </p>
          </Step>

          <Step n={4} id="steam-4" title="Launch">
            <p>
              Press <strong>Play</strong>.
            </p>
            <p>
              Launch options (Properties → General):{' '}
              <ToConfirm>options de lancement, ou « none needed »</ToConfirm>
            </p>
            <Warning>
              <p>
                Known pitfalls: <ToConfirm>pièges rencontrés au premier lancement</ToConfirm>
              </p>
            </Warning>
          </Step>

          {/* Repli : l'ancienne voie par émulation Android, inchangée. */}
          <section id="waydroid" className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Fallback: Android emulation (Waydroid)
            </h2>
            <p className="text-content-muted text-sm">
              Only if Steam + Proton does not work on your setup: run the Android version in
              Waydroid.
            </p>
          </section>

          <Step n={1} title="Prerequisites">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong>Wayland compositor</strong> — GNOME / Plasma 6 / Sway
              </li>
              <li>
                X11: run a nested Wayland session via <code className="text-green-400">cage</code>
              </li>
              <li>
                Kernel modules: <code className="text-green-400">binder_linux</code> +{' '}
                <code className="text-green-400">ashmem_linux</code> (via <code>linux-zen</code> or{' '}
                <code>waydroid-dkms</code>)
              </li>
            </ul>
          </Step>

          <Step n={2} title="Install Waydroid">
            <p className="text-content-strong font-semibold">Arch / Manjaro:</p>
            <Code>{`sudo pacman -S waydroid lzip python-pip sqlite3 git --needed`}</Code>
            <p className="text-content-strong mt-2 font-semibold">Ubuntu / Debian:</p>
            <Code>{`sudo apt install curl ca-certificates -y\ncurl -s https://repo.waydro.id | sudo bash\nsudo apt install waydroid -y`}</Code>
            <p className="text-content-strong mt-2 font-semibold">Fedora:</p>
            <Code>{`sudo dnf install waydroid`}</Code>
            <p className="text-content-subtle mt-2 text-xs">
              See{' '}
              <a
                href="https://docs.waydro.id/usage/install-on-desktops"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-sky underline"
              >
                Waydroid docs
              </a>{' '}
              for other distros.
            </p>
          </Step>

          <Step n={3} title="Init with GAPPS">
            <Code>{`sudo waydroid init -s GAPPS\nsudo systemctl enable --now waydroid-container`}</Code>
          </Step>

          <Step n={4} title="Translation Layer Setup">
            <Code>{`git clone https://github.com/casualsnek/waydroid_script\ncd waydroid_script && python3 -m venv venv\nvenv/bin/pip install -r requirements.txt`}</Code>
            <p className="text-content-strong mt-2 font-semibold">
              Install libndk (2026 Standard):
            </p>
            <Code>{`sudo venv/bin/python3 main.py install libndk`}</Code>
          </Step>

          <Step n={5} title="Google Certification Fix">
            <p>Get your Android ID:</p>
            <Code>{`sudo waydroid shell -- sh -c "sqlite3 /data/data/com.google.android.gsf/databases/gservices.db \\\n  'select value from main where name=\\"android_id\\";'"`}</Code>
            <p>
              Register at{' '}
              <a
                href="https://www.google.com/android/uncertified/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-sky underline"
              >
                google.com/android/uncertified
              </a>
            </p>
            <Warning>
              <p>
                Wait <strong>20 min to 24 hours</strong> for certification to propagate.
              </p>
            </Warning>
          </Step>

          <Step n={6} title='Network Sync Fix (2026 "Ack Patch")'>
            <Code>{`sudo waydroid shell <<EOF\nip link set eth0 mtu 1400\nsetprop persist.waydroid.fake_wifi '*'\nsettings put global private_dns_mode off\nexit\nEOF`}</Code>
          </Step>

          <Step n={7} title="GPU Passthrough">
            <Code>{`waydroid prop set ro.hardware.egl mesa\nwaydroid prop set ro.hardware.gralloc gbm`}</Code>
          </Step>

          <Step n={8} title="Anti-Cheat (Magisk)">
            <Code>{`sudo venv/bin/python3 main.py install magisk`}</Code>
            <p>Then in Magisk:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Enable <strong>Zygisk</strong>
              </li>
              <li>
                Add Outerplane to <strong>DenyList</strong>
              </li>
            </ul>
          </Step>

          <Step n={9} title="2026 Splash-Screen Bypass">
            <p>
              Only applies if using <strong>libhoudini</strong> as translation layer (some distros
              do not support libndk).
            </p>
            <Warning>
              <p>If stuck on the icon:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Set system date to <strong>Oct 2025</strong>
                </li>
                <li>Launch the game</li>
                <li>After &quot;Tap to Start,&quot; restore the correct date</li>
              </ol>
            </Warning>
          </Step>

          <Step n={10} title="Play Store / Final Launch Fix">
            <Code>{`sudo waydroid shell rm -rf /data/data/com.android.vending\nwaydroid session stop\nwaydroid show-full-ui`}</Code>
          </Step>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Troubleshooting: Black Screen</h2>
            <div className="border-line-subtle bg-surface-raised text-content-muted space-y-3 rounded-lg border p-4 text-sm">
              <div>
                <p className="text-content-strong font-semibold">High CPU (25%+)</p>
                <p>Reinstall libndk translation layer.</p>
              </div>
              <div>
                <p className="text-content-strong font-semibold">NVIDIA GPU</p>
                <Code>{`waydroid prop set ro.hardware.egl swiftshader`}</Code>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="h-max space-y-4 lg:sticky lg:top-24">
          <div className="border-line-subtle bg-surface-raised rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#steam-proton" className="text-ed-sky hover:underline">
                  Via Steam (Proton)
                </a>
              </li>
              <li>
                <a href="#waydroid" className="text-ed-sky hover:underline">
                  Fallback: Waydroid
                </a>
              </li>
              <li>
                <a href="#step-1" className="text-ed-sky hover:underline">
                  Prerequisites
                </a>
              </li>
              <li>
                <a href="#step-2" className="text-ed-sky hover:underline">
                  Install Waydroid
                </a>
              </li>
              <li>
                <a href="#step-4" className="text-ed-sky hover:underline">
                  Translation Layer
                </a>
              </li>
              <li>
                <a href="#step-5" className="text-ed-sky hover:underline">
                  Google Cert Fix
                </a>
              </li>
              <li>
                <a href="#step-8" className="text-ed-sky hover:underline">
                  Anti-Cheat
                </a>
              </li>
            </ul>
          </div>

          <div className="border-warn/40 bg-warn/10 rounded-lg border p-4">
            <h4 className="mb-2 font-semibold">Waydroid Requirements</h4>
            <ul className="space-y-1 text-sm">
              <li>Wayland compositor</li>
              <li>binder_linux + ashmem_linux</li>
              <li>AMD GPU recommended</li>
            </ul>
          </div>

          <Warning>
            <p className="font-semibold">Disclaimer</p>
            <p className="mt-1 text-xs">
              Waydroid is not officially supported. This guide was tested on Arch Linux with a full
              AMD hardware stack. NVIDIA GPUs require software rendering (swiftshader) which may
              result in poor performance. Community-maintained.
            </p>
          </Warning>
        </aside>
      </div>
    </div>
  );
}
