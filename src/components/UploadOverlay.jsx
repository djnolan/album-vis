import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { X, Copy, ChevronDown } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import { useScrollLock } from '../hooks/useScrollLock';
import { useSheetAnimation } from '../hooks/useSheetAnimation';
import { useIsDesktop } from '../hooks/useIsDesktop';

const REQUIRED_COLUMNS = ['track', 'name', 'duration', 'bpm', 'key', 'accidental', 'mode'];
const VALID_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const VALID_ACCIDENTALS = ['natural', 'sharp', 'flat'];
const VALID_MODES = ['major', 'minor'];

const LLM_PROMPT_TEMPLATE = `I need you to look up music data for an album and format it as a CSV.

Album: [ALBUM NAME] by [ARTIST NAME]

Please look up the following data for every track on the album using a source like Musicstax, Tunebat, or GetSongBPM, and return a CSV with these exact column headers:

track, name, duration, bpm, key, accidental, mode

Rules for each field:
• track — track number as an integer (1, 2, 3...)
• name — song title as a string
• duration — song length in seconds as an integer (e.g. 3:45 = 225)
• bpm — beats per minute as an integer. If two sources disagree, prefer the higher value.
• key — the root note letter only, one of: C, D, E, F, G, A, B (no sharps or flats here)
• accidental — one of: natural, sharp, flat (e.g. F# = key F, accidental sharp / Bb = key B, accidental flat / C major = key C, accidental natural)
• mode — one of: major or minor

Include every track on the standard album. Output only the CSV data with no explanation.`;

function buildPrompt(album, artist) {
  return LLM_PROMPT_TEMPLATE
    .replace('[ALBUM NAME]', album || '[ALBUM NAME]')
    .replace('[ARTIST NAME]', artist || '[ARTIST NAME]');
}

function validateRows(rows) {
  const errors = [];
  rows.forEach((row, i) => {
    const n = i + 2;
    if (!VALID_KEYS.includes(row.key)) errors.push(`Row ${n}: invalid key "${row.key}"`);
    if (!VALID_ACCIDENTALS.includes(row.accidental)) errors.push(`Row ${n}: invalid accidental "${row.accidental}"`);
    if (!VALID_MODES.includes(row.mode)) errors.push(`Row ${n}: invalid mode "${row.mode}"`);
    if (isNaN(parseInt(row.track))) errors.push(`Row ${n}: track must be an integer`);
    if (isNaN(parseInt(row.duration))) errors.push(`Row ${n}: duration must be an integer`);
    if (isNaN(parseInt(row.bpm))) errors.push(`Row ${n}: bpm must be an integer`);
  });
  return errors;
}

function AccordionStep({ stepLabel, label, isOpen, onToggle, children }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: isOpen ? 'rgba(31,38,51,0.8)' : '#1F2633', outline: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
      >
        <span
          className="shrink-0 px-2 py-0.5 rounded font-mono text-caption font-medium uppercase tracking-wider"
          style={{ background: 'rgba(123,159,212,0.15)', color: '#7B9FD4' }}
        >
          {stepLabel}
        </span>
        <span className="flex-1 font-sans font-medium text-text-primary" style={{ fontSize: '1rem' }}>{label}</span>
        <ChevronDown
          size={18}
          className="shrink-0 text-text-secondary"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>

      <div
        className="grid"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadContent({
  openStep, toggle, copied, handleCopy, displayPrompt,
  albumTitle, setAlbumTitle, titleError, setTitleError,
  artistName, setArtistName, artistError, setArtistError,
  csvText, setCsvText, csvError, handleSubmit,
  albumInputRef, artistInputRef,
  close,
}) {
  return (
    <>
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
        <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Create Your Visualization</h2>
        <button
          onClick={close}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 px-6 pb-10">
        <p className="font-sans text-body text-text-secondary mb-6">
          Once you have an album in mind, follow this two step process to generate your artwork. It takes about 30 seconds. You'll need access to an AI chat tool like ChatGPT, Claude or Gemini.
        </p>

        <div className="flex flex-col gap-3">
          <AccordionStep
            stepLabel="Step 1"
            label="Get Your Album Data"
            isOpen={openStep === 1}
            onToggle={() => toggle(1)}
          >
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="font-mono text-caption text-text-secondary uppercase block mb-2">Album</label>
                <input
                  ref={albumInputRef}
                  value={albumTitle}
                  onChange={e => { setAlbumTitle(e.target.value); if (e.target.value.trim()) setTitleError(''); }}
                  className="w-full bg-surface-1 text-text-primary font-sans text-body rounded-md px-4 py-3 outline-none border border-border focus:ring-1 focus:ring-accent"
                  placeholder="Album name"
                />
                {titleError && <p className="text-red-400 font-mono text-caption mt-1.5">{titleError}</p>}
              </div>
              <div>
                <label className="font-mono text-caption text-text-secondary uppercase block mb-2">Artist</label>
                <input
                  ref={artistInputRef}
                  value={artistName}
                  onChange={e => { setArtistName(e.target.value); if (e.target.value.trim()) setArtistError(''); }}
                  className="w-full bg-surface-1 text-text-primary font-sans text-body rounded-md px-4 py-3 outline-none border border-border focus:ring-1 focus:ring-accent"
                  placeholder="Artist name"
                />
                {artistError && <p className="text-red-400 font-mono text-caption mt-1.5">{artistError}</p>}
              </div>
            </div>

            <p className="font-sans text-body text-text-secondary mb-4">
              Copy this prompt into an AI chat tool like ChatGPT.
            </p>

            <div className="bg-surface-0 rounded-md p-4 mb-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCopy}
                  className="font-mono text-caption flex items-center gap-1 transition-colors"
                  style={{ color: copied ? '#7B9FD4' : '#525A68' }}
                >
                  {copied ? 'Copied!' : 'COPY'}
                  <Copy size={13} />
                </button>
              </div>
              <p className="font-mono text-caption text-text-secondary whitespace-pre-wrap">
                {displayPrompt}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 rounded-md py-3 font-sans text-ui font-bold transition-colors"
              style={{ border: '1px solid rgba(123,159,212,0.35)', color: '#7B9FD4', background: copied ? 'rgba(123,159,212,0.08)' : 'transparent' }}
            >
              <Copy size={15} />
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          </AccordionStep>

          <AccordionStep
            stepLabel="Step 2"
            label="Paste In Your Data"
            isOpen={openStep === 2}
            onToggle={() => toggle(2)}
          >
            <p className="font-sans text-body text-text-secondary mb-4">
              Paste the CSV text your AI tool gives you into the box below.
            </p>

            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Paste your data here."
              className="w-full h-36 bg-surface-0 font-mono text-caption text-text-primary rounded-md p-4 resize-none outline-none placeholder-text-tertiary focus:ring-1 focus:ring-accent"
            />

            {csvError && <p className="text-red-400 font-mono text-caption mt-2">{csvError}</p>}

            <PrimaryButton onClick={handleSubmit} className="mt-4">GENERATE →</PrimaryButton>
          </AccordionStep>
        </div>
      </div>
    </>
  );
}

export default function UploadOverlay({ onClose, onUpload }) {
  useScrollLock(true);
  const isDesktop = useIsDesktop();
  const { close, backdropStyle, sheetStyle } = useSheetAnimation(onClose, isDesktop ? 'right' : 'up');
  const [openStep, setOpenStep] = useState(null);
  const [copied, setCopied] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [titleError, setTitleError] = useState('');
  const [artistError, setArtistError] = useState('');
  const [csvError, setCsvError] = useState(null);

  const [promptAlbum, setPromptAlbum] = useState('');
  const [promptArtist, setPromptArtist] = useState('');

  const albumInputRef = useRef(null);
  const artistInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setPromptAlbum(albumTitle), 150);
    return () => clearTimeout(t);
  }, [albumTitle]);

  useEffect(() => {
    const t = setTimeout(() => setPromptArtist(artistName), 150);
    return () => clearTimeout(t);
  }, [artistName]);

  const displayPrompt = buildPrompt(promptAlbum, promptArtist);

  function toggle(step) {
    setOpenStep(prev => prev === step ? null : step);
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildPrompt(albumTitle, artistName)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSubmit() {
    setCsvError(null);

    let fieldError = false;
    if (!albumTitle.trim()) {
      setTitleError('Add an album name to continue');
      fieldError = true;
    }
    if (!artistName.trim()) {
      setArtistError('Add an artist name to continue');
      fieldError = true;
    }

    if (fieldError) {
      setOpenStep(1);
      setTimeout(() => {
        if (!albumTitle.trim()) albumInputRef.current?.focus();
        else artistInputRef.current?.focus();
      }, 50);
      return;
    }

    const text = csvText.trim();
    if (!text) { setCsvError('Paste your CSV data above first.'); return; }

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
    });

    const missing = REQUIRED_COLUMNS.filter(c => !result.meta.fields?.includes(c));
    if (missing.length) { setCsvError(`Missing columns: ${missing.join(', ')}`); return; }

    const rows = result.data.map(r => ({
      track: parseInt(r.track),
      name: r.name?.trim(),
      duration: parseInt(r.duration),
      bpm: parseInt(r.bpm),
      key: r.key?.trim(),
      accidental: r.accidental?.trim().toLowerCase(),
      mode: r.mode?.trim().toLowerCase(),
    }));

    const errs = validateRows(rows);
    if (errs.length) { setCsvError(errs[0]); return; }

    onUpload({
      id: 'custom-' + Date.now(),
      title: albumTitle.trim(),
      artist: artistName.trim(),
      paletteId: 'deep-navy',
      songs: rows,
    });
  }

  const contentProps = {
    openStep, toggle, copied, handleCopy, displayPrompt,
    albumTitle, setAlbumTitle, titleError, setTitleError,
    artistName, setArtistName, artistError, setArtistError,
    csvText, setCsvText, csvError, handleSubmit,
    albumInputRef, artistInputRef,
    close,
  };

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-black/60" style={backdropStyle} onClick={close} />
        <div
          className="relative ml-auto h-full bg-surface-1 flex flex-col"
          style={{
            width: '40%',
            minWidth: '380px',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
            ...sheetStyle,
          }}
        >
          <UploadContent {...contentProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/75" style={backdropStyle} onClick={close} />
      <div
        className="relative bg-surface-1 rounded-t-lg flex flex-col"
        style={{ height: 'calc(100dvh - 48px)', maxHeight: 'calc(100dvh - 48px)', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)', ...sheetStyle }}
      >
        <UploadContent {...contentProps} />
      </div>
    </div>
  );
}
