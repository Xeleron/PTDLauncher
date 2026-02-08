/**
 * SettingsModal component for app configuration.
 */

import { useState, useEffect } from 'react';
import {
  Settings,
  getSettings,
  saveSettings,
  checkFlashInstalled,
  downloadFlash,
  checkRuffleInstalled,
  downloadRuffle,
  DownloadProgress,
} from '../lib/api';
import { listen } from '@tauri-apps/api/event';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
}

export function SettingsModal({ isOpen, onClose, onStatusChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({});
  const [flashInstalled, setFlashInstalled] = useState<boolean | null>(null);
  const [ruffleInstalled, setRuffleInstalled] = useState<boolean | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();

      checkFlash();
      checkRuffle();
    }
  }, [isOpen]);

  // Listen for download progress
  useEffect(() => {
    const unlisten = listen<DownloadProgress>('download-progress', (event) => {
      if (event.payload.item === 'flash_player') {
        setDownloadProgress(event.payload.progress);

        if (event.payload.progress >= 100) {
          setFlashInstalled(true);
          setDownloadProgress(null);
          setIsDownloading(false);
        }
      } else if (event.payload.item === 'ruffle') {
        setDownloadProgress(event.payload.progress);

        if (event.payload.progress >= 100) {
          setRuffleInstalled(true);
          setDownloadProgress(null);
          setIsDownloading(false);
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  async function loadSettings() {
    try {
      const s = await getSettings();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  async function checkFlash() {
    try {
      const installed = await checkFlashInstalled();
      setFlashInstalled(installed);
    } catch (err) {
      console.error('Failed to check Flash:', err);
    }
  }

  async function checkRuffle() {
    try {
      const installed = await checkRuffleInstalled();
      setRuffleInstalled(installed);
    } catch (err) {
      console.error('Failed to check Ruffle:', err);
    }
  }

  async function handleDownloadFlash() {
    if (isDownloading) return;

    setIsDownloading(true);
    onStatusChange?.('Downloading Flash Player...');

    try {
      await downloadFlash();
      setFlashInstalled(true);
      onStatusChange?.('Flash Player installed');
    } catch (err) {
      console.error('Failed to download Flash:', err);
      onStatusChange?.(`Error: ${err}`);
      setIsDownloading(false);
    } finally {
      setDownloadProgress(null);
    }
  }

  async function handleDownloadRuffle() {
    if (isDownloading) return;

    setIsDownloading(true);
    onStatusChange?.('Downloading Ruffle...');

    try {
      await downloadRuffle();
      setRuffleInstalled(true);
      onStatusChange?.('Ruffle installed');
    } catch (err) {
      console.error('Failed to download Ruffle:', err);
      onStatusChange?.(`Error: ${err}`);
      setIsDownloading(false);
    } finally {
      setDownloadProgress(null);
    }
  }

  async function handleSave() {
    try {
      await saveSettings(settings);
      onStatusChange?.('Settings saved');
      onClose();
    } catch (err) {
      console.error('Failed to save settings:', err);
      onStatusChange?.(`Error: ${err}`);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        // Close only when clicking directly on the overlay (not children)
        if (e.currentTarget === e.target) onClose();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <h3>Player Preference</h3>
            <div className="player-toggle">
              <label className={!settings.use_ruffle ? 'selected' : ''}>
                <input
                  type="radio"
                  name="player"
                  checked={!settings.use_ruffle}
                  onChange={() => setSettings({ ...settings, use_ruffle: false })}
                />
                Adobe Flash Player
              </label>
              <label className={settings.use_ruffle ? 'selected' : ''}>
                <input
                  type="radio"
                  name="player"
                  checked={!!settings.use_ruffle}
                  onChange={() => setSettings({ ...settings, use_ruffle: true })}
                />
                Ruffle
              </label>
            </div>
          </div>

          {!settings.use_ruffle ? (
            <div className="settings-section">
              <h3>Flash Player</h3>
              <div className="flash-status">
                <span
                  className={`status-indicator ${flashInstalled ? 'installed' : 'not-installed'}`}
                >
                  {flashInstalled === null
                    ? 'Checking...'
                    : flashInstalled
                    ? '✓ Installed'
                    : '✗ Not installed'}
                </span>

                {!flashInstalled && (
                  <button
                    className="download-flash-button"
                    onClick={handleDownloadFlash}
                    disabled={isDownloading}
                  >
                    {isDownloading
                      ? downloadProgress !== null
                        ? `${downloadProgress}%`
                        : 'Downloading...'
                      : 'Download Flash Player'}
                  </button>
                )}
              </div>

              {downloadProgress !== null && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${downloadProgress}%` }} />
                </div>
              )}
            </div>
          ) : (
            <div className="settings-section">
              <h3>Ruffle</h3>
              <div className="flash-status">
                <span
                  className={`status-indicator ${ruffleInstalled ? 'installed' : 'not-installed'}`}
                >
                  {ruffleInstalled === null
                    ? 'Checking...'
                    : ruffleInstalled
                    ? '✓ Installed'
                    : '✗ Not installed'}
                </span>

                {!ruffleInstalled && (
                  <button
                    className="download-flash-button"
                    onClick={handleDownloadRuffle}
                    disabled={isDownloading}
                  >
                    {isDownloading
                      ? downloadProgress !== null
                        ? `${downloadProgress}%`
                        : 'Downloading...'
                      : 'Download Ruffle'}
                  </button>
                )}
              </div>

              {downloadProgress !== null && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${downloadProgress}%` }} />
                </div>
              )}
            </div>
          )}

          <div className="settings-section">
            <h3>Custom {settings.use_ruffle ? 'Ruffle' : 'Flash'} Path</h3>
            <input
              type="text"
              className="settings-input"
              placeholder="Leave empty for default"
              value={
                (settings.use_ruffle ? settings.ruffle_path : settings.flash_player_path) || ''
              }
              onChange={(e) => {
                if (settings.use_ruffle) {
                  setSettings({ ...settings, ruffle_path: e.target.value || undefined });
                } else {
                  setSettings({ ...settings, flash_player_path: e.target.value || undefined });
                }
              }}
            />
          </div>

          <div className="settings-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.sound_enabled ?? true}
                onChange={(e) => setSettings({ ...settings, sound_enabled: e.target.checked })}
              />
              <span>Enable sounds</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
