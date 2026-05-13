import { GAUGE_LABELS } from '../data/gauges';

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
  return (
    <aside className="flex flex-col gap-8 p-6 bg-slate-900 border-r border-slate-700 w-64 shrink-0 overflow-y-auto">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Connection Parameters
        </h2>

        <label className="block mb-1 text-sm font-medium text-slate-300">
          Attachment Thickness
        </label>
        <div className="flex items-center gap-3 mb-2">
          <input
            type="range"
            min={0.021}
            max={0.250}
            step={0.001}
            value={attachmentThickness}
            onChange={(e) => onAttachmentChange(parseFloat(e.target.value))}
            className="flex-1 accent-amber-400"
          />
          <span className="text-sm font-mono text-amber-300 w-14 text-right tabular-nums">
            {attachmentThickness.toFixed(3)}"
          </span>
        </div>
        <input
          type="number"
          min={0.021}
          max={0.250}
          step={0.001}
          value={attachmentThickness}
          onChange={(e) => onAttachmentChange(parseFloat(e.target.value))}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
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
                : 'bg-slate-800 text-slate-500 hover:bg-slate-750 hover:text-slate-400'
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
