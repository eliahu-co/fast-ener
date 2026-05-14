import { useState, useMemo } from 'react';
import { Zap, SlidersHorizontal } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { CrossSection } from './components/CrossSection';
import { ResultsTable } from './components/ResultsTable';
import { filterFasteners } from './utils/lgsEngine';
import type { AttachmentLayer } from './types';

export function App() {
  const [layers, setLayers] = useState<AttachmentLayer[]>([
    { material: 'steel', thickness: 0.033 },
  ]);
  const [substrateGauge, setSubstrateGauge] = useState('18 ga');
  const [isOutdoor, setIsOutdoor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const results = useMemo(
    () => filterFasteners(layers, substrateGauge, isOutdoor),
    [layers, substrateGauge, isOutdoor],
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
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar — full-screen on mobile, normal column on md+ */}
        <div className={`
          flex-col
          fixed inset-0 z-40
          md:relative md:inset-auto md:z-auto md:flex
          ${sidebarOpen ? 'flex' : 'hidden'}
        `}>
          <InputPanel
            layers={layers}
            substrateGauge={substrateGauge}
            isOutdoor={isOutdoor}
            onLayersChange={setLayers}
            onGaugeChange={setSubstrateGauge}
            onOutdoorChange={setIsOutdoor}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 flex flex-col overflow-auto">
          <section className="flex flex-col items-center pt-8 px-8 bg-slate-950 border-b border-slate-800">
            <CrossSection
              layers={layers}
              substrateGauge={substrateGauge}
            />
          </section>

          <section className="bg-slate-900 flex-1">
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

      {/* FAB — mobile only, shown when sidebar is collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 bg-amber-400 text-slate-900 rounded-full w-14 h-14 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          aria-label="Open settings"
        >
          <SlidersHorizontal size={20} />
        </button>
      )}

      <footer className="px-6 py-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-600 font-mono flex gap-4 shrink-0">
        <span>FAST-ener v1.0</span>
        <span>·</span>
        <span>Static SPA · Zero network dependencies</span>
        <span>·</span>
        <span>L ≥ TMT + drill-point + 3/TPI · SAE J78</span>
      </footer>
    </div>
  );
}
