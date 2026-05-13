import { GAUGE_LABELS } from '../data/gauges';

const ATTACHMENT_PRESETS: { label: string; value: number }[] = [
  { label: '25 ga',  value: 0.021 },
  { label: '20 ga',  value: 0.033 },
  { label: '18 ga',  value: 0.048 },
  { label: '16 ga',  value: 0.060 },
  { label: '14 ga',  value: 0.075 },
  { label: '12 ga',  value: 0.105 },
  { label: '1/8"',   value: 0.125 },
  { label: '3/16"',  value: 0.1875 },
  { label: '1/4"',   value: 0.250 },
];

interface Props {
  attachmentThickness: number;
  substrateGauge: string;
  isOutdoor: boolean;
  onAttachmentChange: (v: number) => void;
  onGaugeChange: (g: string) => void;
  onOutdoorChange: (v: boolean) => void;
}

export function InputPanel({
  attachmentThickness,
  substrateGauge,
  isOutdoor,
  onAttachmentChange,
  onGaugeChange,
  onOutdoorChange,
}: Props) {
  const activePreset = ATTACHMENT_PRESETS.find((p) => p.value === attachmentThickness);

  return (
    <aside className="flex flex-col gap-8 p-6 bg-slate-900 border-r border-slate-700 w-64 shrink-0 overflow-y-auto">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Connection Parameters
        </h2>

        <label className="block mb-2 text-sm font-medium text-slate-300">
          Attachment Thickness
        </label>

        <div className="grid grid-cols-3 gap-1 mb-3">
          {ATTACHMENT_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onAttachmentChange(p.value)}
              className={`py-1.5 rounded text-xs font-mono transition-colors ${
                activePreset?.label === p.label
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0.001}
            step={0.001}
            value={attachmentThickness}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) onAttachmentChange(v);
            }}
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
            placeholder="0.000"
          />
          <span className="text-xs text-slate-500 font-mono shrink-0">in.</span>
        </div>
        {!activePreset && (
          <p className="mt-1 text-xs text-amber-500 font-mono">custom</p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Substrate Gauge
        </label>
        <div className="flex flex-col gap-1.5">
          {GAUGE_LABELS.map((label) => (
            <button
              key={label}
              onClick={() => onGaugeChange(label)}
              className={`text-left px-3 py-1.5 rounded text-sm font-mono transition-colors ${
                substrateGauge === label
                  ? 'bg-amber-400 text-slate-900 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-slate-300">
          Environment
        </label>
        <div className="flex rounded overflow-hidden border border-slate-700">
          <button
            onClick={() => onOutdoorChange(false)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              !isOutdoor
                ? 'bg-slate-600 text-slate-100'
                : 'bg-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            Interior
          </button>
          <button
            onClick={() => onOutdoorChange(true)}
            className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-slate-700 ${
              isOutdoor
                ? 'bg-sky-700 text-white'
                : 'bg-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            Exterior
          </button>
        </div>
        {isOutdoor && (
          <p className="mt-1.5 text-xs text-sky-400">410 Stainless Steel only</p>
        )}
      </div>
    </aside>
  );
}
