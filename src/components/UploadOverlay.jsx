import { useState } from 'react';
import Papa from 'papaparse';
import { X, Copy } from 'lucide-react';
import PrimaryButton from './PrimaryButton';

const REQUIRED_COLUMNS = ['track', 'name', 'duration', 'bpm', 'key', 'accidental', 'mode'];
const VALID_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const VALID_ACCIDENTALS = ['natural', 'sharp', 'flat'];
const VALID_MODES = ['major', 'minor'];

const LLM_PROMPT = `I need you to look up music data for an album and format it as a CSV.

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

export default function UploadOverlay({ onClose, onUpload }) {
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState(null);

  function handleCopy() {
    navigator.clipboard.writeText(LLM_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSubmit() {
    setError(null);
    const text = csvText.trim();
    if (!text) { setError('Paste your CSV data above first.'); return; }

    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase(),
    });

    const missing = REQUIRED_COLUMNS.filter(c => !result.meta.fields?.includes(c));
    if (missing.length) { setError(`Missing columns: ${missing.join(', ')}`); return; }

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
    if (errs.length) { setError(errs[0]); return; }

    onUpload({
      id: 'custom-' + Date.now(),
      title: 'My Album',
      artist: 'Your Artist',
      paletteId: 'deep-navy',
      songs: rows,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface-1 rounded-t-lg flex flex-col max-h-[90vh]">

        <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="font-sans text-ui font-medium uppercase tracking-wider text-text-primary">Create Your Visualization</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-8">

          <p className="font-sans text-body text-text-secondary mb-6 leading-relaxed">
            Copy the prompt, paste it into an AI assistant with your album name, then paste the CSV result below.
          </p>

          {/* LLM prompt block */}
          <div className="bg-surface-2 rounded-md p-4 mb-1">
            <div className="flex justify-end mb-2">
              <button
                onClick={handleCopy}
                className="font-mono text-caption text-text-secondary flex items-center gap-1 hover:text-text-primary transition-colors"
              >
                {copied ? 'Copied!' : 'COPY'}
                <Copy size={14} />
              </button>
            </div>
            <p className={`font-mono text-caption text-text-secondary leading-relaxed whitespace-pre-wrap ${!promptExpanded ? 'line-clamp-3' : ''}`}>
              {LLM_PROMPT}
            </p>
          </div>
          <button
            onClick={() => setPromptExpanded(v => !v)}
            className="font-mono text-caption text-text-tertiary mb-6 ml-1"
          >
            {promptExpanded ? '▲ collapse' : '▼ expand'}
          </button>

          <div className="border-t border-border mb-6" />

          <p className="font-mono text-caption text-text-secondary uppercase mb-2">Paste CSV here</p>
          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder={'track,name,duration,bpm,key,accidental,mode\n1,Song Name,240,120,C,natural,major\n…'}
            className="w-full h-36 bg-surface-2 font-mono text-caption text-text-primary rounded-md p-4 resize-none outline-none placeholder-text-tertiary focus:ring-1 focus:ring-accent"
          />

          {error && <p className="text-red-400 font-mono text-caption mt-2">{error}</p>}

          <PrimaryButton onClick={handleSubmit} className="mt-6">GENERATE →</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
