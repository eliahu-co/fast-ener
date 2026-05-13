import { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { CrossSection } from './components/CrossSection';
import { ResultsTable } from './components/ResultsTable';
import { filterFasteners } from './utils/lgsEngine';

export function App() {
  const [attachmentThickness, setAttachmentThickness] = useState(0.033);
  const [substrateGauge, setSubstrateGauge] = useState('18 ga');
  const [isOutdoor, setIsOutdoor] = useState(false);

  const results = useMemo(
    () => filterFasteners(attachmentThickness, substrateGauge, isOutdoor),
    [attachmentThickness, substrateGauge, isOutdoor],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 bg-slate-900 border-b border-slate-700 shrink-0">
        <Zap size={20} className="text-amber-400" fill="currentColor" />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 leading-none">
            FAST-<span className="text-amber-400">ener</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            LGS Self-Drilling Fastener Selection Engine
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
            IBC / AISI S100 · ASTM C955
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
            McMaster-Carr catalog
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <InputPanel
          attachmentThickness={attachmentThickness}
          substrateGauge={substrateGauge}
          isOutdoor={isOutdoor}
          onAttachmentChange={setAttachmentThickness}
          onGaugeChange={setSubstrateGauge}
          onOutdoorChange={setIsOutdoor}
        />

        <main className="flex-1 flex flex-col overflow-auto">
          <section className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 border-b border-slate-800">
            <CrossSection
              attachmentThickness={attachmentThickness}
              substrateGauge={substrateGauge}
            />
          </section>

          <section className="bg-slate-900 shrink-0">
            <div className="px-6 py-3 border-b border-slate-700 flex items-center gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Matching Fasteners
              </h2>
              <span className="text-amber-400 font-mono text-sm font-semibold">
                {results.length}
              </span>
            </div>
            <ResultsTable results={results} />
          </section>
        </main>
      </div>

      <footer className="px-6 py-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-600 font-mono flex gap-4 shrink-0">
        <span>FAST-ener v1.0</span>
        <span>·</span>
        <span>Static SPA · Zero network dependencies</span>
        <span>·</span>
        <span>L ≥ t₁ + t₂ + 0.25&quot;</span>
      </footer>
    </div>
  );
}
