import { useState, useEffect } from 'react';
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

  useEffect(() => {
    try { localStorage.setItem('userAlbums', JSON.stringify(userAlbums)); } catch {}
  }, [userAlbums]);

  useEffect(() => {
    try { localStorage.setItem('paletteOverrides', JSON.stringify(paletteOverrides)); } catch {}
  }, [paletteOverrides]);

  function handleSelectAlbum(album) {
    const isUserAlbum = userAlbums.some(a => a.id === album.id);
    const paletteId = isUserAlbum ? (paletteOverrides[album.id] ?? album.paletteId) : album.paletteId;
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
      const isUserAlbum = userAlbums.some(a => a.id === currentAlbum.id);
      if (isUserAlbum) {
        setPaletteOverrides(prev => ({ ...prev, [updated.id]: paletteId }));
        setUserAlbums(prev => prev.map(a => a.id === updated.id ? updated : a));
      }
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {screen === 'home' && (
        <HomeScreen
          userAlbums={userAlbums}
          paletteOverrides={paletteOverrides}
          onSelectAlbum={handleSelectAlbum}
          onCreateClick={() => setShowUpload(true)}
        />
      )}
      {screen === 'viz' && currentAlbum && (
        <VisualizationScreen
          album={currentAlbum}
          paletteId={currentPaletteId}
          onBack={() => setScreen('home')}
          onPaletteClick={() => setShowPalette(true)}
          onInfoClick={() => setShowLegend(true)}
          onEditClick={() => setShowEdit(true)}
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
        />
      )}
      {showLegend && (
        <LegendOverlay onClose={() => setShowLegend(false)} />
      )}
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
