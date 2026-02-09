import { useState } from 'react';
import './App.css';
import { GameCard } from './components/GameCard';
import { SettingsModal } from './components/SettingsModal';

import { ImageButton } from './components/ImageButton';
import { GAMES } from './lib/api';
import { openUrl } from '@tauri-apps/plugin-opener';
import { MESSAGES, PTD_URLS, ALTS } from './lib/constants';

// Import Assets
import logo from './assets/logo.png';
import settingsIcon from './assets/settings.png';

import pcDefault from './assets/PTD_PC_DEFAULT.png';
import pcHover from './assets/PTD_PC_HOVER.png';
import pcPressed from './assets/PTD_PC_PRESSED.png';

function App() {
  const [statusMessage, setStatusMessage] = useState<string>(MESSAGES.READY);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handlePokecenter = (version: string) => {
    let url;
    switch (version) {
      case '1':
        url = PTD_URLS.PTD1;
        break;
      case '2':
        url = PTD_URLS.PTD2;
        break;
      case '3':
        url = PTD_URLS.PTD3;
        break;
      default:
        return;
    }
    openUrl(url);
    setStatusMessage(MESSAGES.OPENED_POKECENTER(version));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-container">
            <img src={logo} alt={ALTS.LOGO} className="app-logo" />
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={() => setSettingsOpen(true)}
              title={ALTS.SETTINGS}
            >
              <img src={settingsIcon} alt={ALTS.SETTINGS} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="pokecenter-section">
          <h2 className="section-title">PokéCenters</h2>
          <div className="pokecenter-buttons">
            <ImageButton
              defaultSrc={pcDefault}
              hoverSrc={pcHover}
              pressedSrc={pcPressed}
              alt={ALTS.PTD1_PC}
              onClick={() => handlePokecenter('1')}
            />
            <ImageButton
              defaultSrc={pcDefault}
              hoverSrc={pcHover}
              pressedSrc={pcPressed}
              alt={ALTS.PTD2_PC}
              onClick={() => handlePokecenter('2')}
            />
            <ImageButton
              defaultSrc={pcDefault}
              hoverSrc={pcHover}
              pressedSrc={pcPressed}
              alt={ALTS.PTD3_PC}
              onClick={() => handlePokecenter('3')}
            />
          </div>
        </section>

        <section className="games-section">
          <h2 className="section-title">Games</h2>
          <div className="games-grid">
            {GAMES.map((game) => (
              <GameCard key={game.id} game={game} onStatusChange={setStatusMessage} />
            ))}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="status-bar">
          <span className="status-dot" />
          <span className="status-text">{statusMessage}</span>
        </div>
      </footer>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onStatusChange={setStatusMessage}
      />
    </div>
  );
}

export default App;
