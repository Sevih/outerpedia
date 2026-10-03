'use client';

/**
 * Barre du haut du Tier List Maker : champ de titre, partage, export PNG,
 * panneau des réglages d'affichage (avec l'export / import JSON) et remise à
 * zéro. Extrait du composant principal (découpage du 03/10/2026 — JSX déplacé
 * tel quel ; les réglages persistés et les actions restent au parent, seul
 * l'état ouvert / fermé du panneau vit ici).
 */
import { useState, type RefObject } from 'react';
import {
  FaImage,
  FaLink,
  FaArrowRotateLeft,
  FaCheck,
  FaGear,
  FaFileExport,
  FaFileImport,
} from 'react-icons/fa6';
import type { IconSize, TlmLabels } from './contracts';
import type { TlmSettings } from './stores';
import { SettingRow, ToolbarButton } from './ui';

export function Toolbar({
  title,
  setTitle,
  copyLink,
  copied,
  exportPng,
  settings,
  patchSettings,
  exportJson,
  importInputRef,
  resetAll,
  labels: L,
}: {
  title: string;
  setTitle: (next: string) => void;
  copyLink: () => void;
  copied: boolean;
  exportPng: () => void;
  settings: TlmSettings;
  patchSettings: (patch: Partial<TlmSettings>) => void;
  exportJson: () => void;
  /** Le champ fichier caché du parent — « Importer » ne fait que l'ouvrir. */
  importInputRef: RefObject<HTMLInputElement | null>;
  resetAll: () => void;
  labels: TlmLabels;
}) {
  const {
    iconSize,
    showNames,
    showElement,
    showClass,
    showRarity,
    showSkins,
    showSkinNames,
    showCards,
    cardSize,
    showCardTags,
  } = settings;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={L.titlePlaceholder}
        maxLength={100}
        className="border-line bg-surface-raised/60 text-content-strong placeholder-content-subtle w-full rounded-lg border px-3 py-2 text-lg font-semibold focus:border-sky-500 focus:outline-none sm:max-w-sm"
      />
      <div className="flex flex-wrap gap-2">
        <ToolbarButton onClick={copyLink} icon={copied ? <FaCheck /> : <FaLink />}>
          {copied ? L.copied : L.share}
        </ToolbarButton>
        <ToolbarButton onClick={exportPng} icon={<FaImage />}>
          {L.exportPng}
        </ToolbarButton>
        <div className="relative">
          <ToolbarButton onClick={() => setShowSettings((v) => !v)} icon={<FaGear />}>
            {L.settings}
          </ToolbarButton>
          {showSettings && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
              <div className="border-line bg-surface-raised absolute right-0 z-50 mt-2 w-60 rounded-lg border p-3 text-sm shadow-xl">
                <p className="text-content-muted mb-1 text-xs tracking-wide uppercase">
                  {L.iconSize}
                </p>
                <div className="mb-3 flex gap-1.5">
                  {(['s', 'm', 'l'] as IconSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => patchSettings({ iconSize: sz })}
                      className={[
                        'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                        iconSize === sz
                          ? 'bg-accent text-accent-fg'
                          : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
                      ].join(' ')}
                    >
                      {L.sizes[sz]}
                    </button>
                  ))}
                </div>
                <SettingRow
                  label={L.showNames}
                  checked={showNames}
                  onChange={(v) => patchSettings({ showNames: v })}
                />
                <SettingRow
                  label={L.showElement}
                  checked={showElement}
                  onChange={(v) => patchSettings({ showElement: v })}
                />
                <SettingRow
                  label={L.showClass}
                  checked={showClass}
                  onChange={(v) => patchSettings({ showClass: v })}
                />
                <SettingRow
                  label={L.showRarity}
                  checked={showRarity}
                  onChange={(v) => patchSettings({ showRarity: v })}
                />
                <div className="border-line/60 mt-2 border-t pt-2">
                  <SettingRow
                    label={L.showSkins}
                    checked={showSkins}
                    onChange={(v) => patchSettings({ showSkins: v })}
                  />
                  <SettingRow
                    label={L.showSkinNames}
                    checked={showSkinNames}
                    onChange={(v) => patchSettings({ showSkinNames: v })}
                  />
                </div>
                <div className="border-line/60 mt-2 border-t pt-2">
                  <SettingRow
                    label={L.showCards}
                    checked={showCards}
                    onChange={(v) => patchSettings({ showCards: v })}
                  />
                  {showCards && (
                    <>
                      <p className="text-content-muted mb-1 text-xs tracking-wide uppercase">
                        {L.cardSize}
                      </p>
                      <div className="mb-3 flex gap-1.5">
                        {(['s', 'm', 'l'] as IconSize[]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => patchSettings({ cardSize: sz })}
                            className={[
                              'flex-1 rounded px-2 py-1 text-xs font-medium transition',
                              cardSize === sz
                                ? 'bg-accent text-accent-fg'
                                : 'bg-surface-overlay text-content-muted hover:bg-surface-overlay/70',
                            ].join(' ')}
                          >
                            {L.sizes[sz]}
                          </button>
                        ))}
                      </div>
                      <SettingRow
                        label={L.showCardTags}
                        checked={showCardTags}
                        onChange={(v) => patchSettings({ showCardTags: v })}
                      />
                    </>
                  )}
                </div>
                <div className="border-line/60 flex gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={exportJson}
                    className="bg-surface-overlay text-content hover:bg-surface-overlay/70 flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs"
                  >
                    <FaFileExport /> {L.exportJson}
                  </button>
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="bg-surface-overlay text-content hover:bg-surface-overlay/70 flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs"
                  >
                    <FaFileImport /> {L.importJson}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <ToolbarButton onClick={resetAll} icon={<FaArrowRotateLeft />} danger>
          {L.reset}
        </ToolbarButton>
      </div>
    </div>
  );
}
