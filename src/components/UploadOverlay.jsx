import { useState } from 'react';
import Papa from 'papaparse';

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
      <div className="relative bg-surface-1 rounded-t-lg max-h-[90vh] overflow-y-auto">
        {/* Handle pill */}
        <div className="flex justify-center pt-3 pb-3">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-6 pt-4 pb-8">
          <div className="flex items-start justify-between mb-5">
            <h2 className="font-serif text-title text-text-primary leading-tight">Create Your Visualization</h2>
            <button onClick={onClose} className="text-text-secondary text-2xl leading-none ml-4">×</button>
          </div>

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
                <span className="text-base">⧉</span>
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

          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-3 bg-accent text-surface-0 font-sans text-ui font-bold rounded-sm"
          >
            GENERATE →
          </button>
        </div>
      </div>
    </div>
  );
}
