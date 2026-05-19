import { useState, useEffect } from 'react';
import { PALETTES } from './data/palettes';
import HomeScreen from './components/HomeScreen';
import VisualizationScreen from './components/VisualizationScreen';
import UploadOverlay from './components/UploadOverlay';
import PaletteOverlay from './components/PaletteOverlay';
import LegendOverlay from './components/LegendOverlay';
import EditAlbumOverlay from './components/EditAlbumOverlay';

function loadStored(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentPaletteId, setCurrentPaletteId] = useState(null);
  const [userAlbums, setUserAlbums] = useState(() => loadStored('userAlbums', []));
  const [paletteOverrides, setPaletteOverrides] = useState(() => loadStored('paletteOverrides', {}));
  const [showUpload, setShowUpload] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  // Tracks viz slide separately — flips false immediately when overlay starts closing
  const [vizSlideActive, setVizSlideActive] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('userAlbums', JSON.stringify(userAlbums)); } catch {}
  }, [userAlbums]);

  useEffect(() => {
    const userAlbumIds = new Set(userAlbums.map(a => a.id));
    const toStore = Object.fromEntries(
      Object.entries(paletteOverrides).filter(([id]) => userAlbumIds.has(id))
    );
    try { localStorage.setItem('paletteOverrides', JSON.stringify(toStore)); } catch {}
  }, [paletteOverrides, userAlbums]);


  function handleRemoveAlbum(albumId) {
    setUserAlbums(prev => prev.filter(a => a.id !== albumId));
  }

  function handleSelectAlbum(album) {
    const paletteId = paletteOverrides[album.id] ?? album.paletteId;
    setCurrentAlbum({ ...album, paletteId });
    setCurrentPaletteId(paletteId);
    setScreen('viz');
  }

  function handleUpload(album) {
    setShowUpload(false);
    setUserAlbums(prev => [album, ...prev]);
    handleSelectAlbum(album);
  }

  function handleUpdateAlbum(updatedAlbum) {
    setCurrentAlbum(updatedAlbum);
    setUserAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));
  }

  function handlePaletteSelect(paletteId) {
    setCurrentPaletteId(paletteId);
    if (currentAlbum) {
      const updated = { ...currentAlbum, paletteId };
      setCurrentAlbum(updated);
      setPaletteOverrides(prev => ({ ...prev, [updated.id]: paletteId }));
      const isUserAlbum = userAlbums.some(a => a.id === currentAlbum.id);
      if (isUserAlbum) {
        setUserAlbums(prev => prev.map(a => a.id === updated.id ? updated : a));
      }
    }
  }

  return (
    <div className="relative">
      {/* Always mounted so body scroll height is preserved — keeps iOS address bar hidden when entering viz screen */}
      <div style={{ pointerEvents: screen === 'home' ? 'auto' : 'none' }}>
        <HomeScreen
          userAlbums={userAlbums}
          paletteOverrides={paletteOverrides}
          onSelectAlbum={handleSelectAlbum}
          onCreateClick={() => setShowUpload(true)}
          onRemoveAlbum={handleRemoveAlbum}
        />
      </div>
      {screen === 'viz' && currentAlbum && (
        <VisualizationScreen
          album={currentAlbum}
          paletteId={currentPaletteId}
          onBack={() => setScreen('home')}
          onPaletteClick={() => { setShowPalette(true); setVizSlideActive(true); }}
          onInfoClick={() => { setShowLegend(true); setVizSlideActive(true); }}
          onEditClick={() => setShowEdit(true)}
          desktopOverlayOpen={vizSlideActive}
          onCloseOverlay={() => { setVizSlideActive(false); setShowPalette(false); setShowLegend(false); }}
        />
      )}

      {showUpload && (
        <UploadOverlay
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}
      {showPalette && (
        <PaletteOverlay
          activePaletteId={currentPaletteId}
          onSelect={handlePaletteSelect}
          onClose={() => setShowPalette(false)}
          onClosingStart={() => setVizSlideActive(false)}
        />
      )}
      {showLegend && (() => {
        const activePalette = PALETTES.find(p => p.id === currentPaletteId) ?? PALETTES[0];
        return (
          <LegendOverlay
            onClose={() => setShowLegend(false)}
            onClosingStart={() => setVizSlideActive(false)}
            colorStart={activePalette.colorStart}
            colorEnd={activePalette.colorEnd}
            bgColor={activePalette.bg}
          />
        );
      })()}
      {showEdit && currentAlbum && (
        <EditAlbumOverlay
          album={currentAlbum}
          onSave={handleUpdateAlbum}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
