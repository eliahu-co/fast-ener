import { ExternalLink, AlertCircle } from 'lucide-react';
import type { Fastener } from '../types';

interface Props {
  results: Fastener[];
}

const MCMASTER_BASE = 'https://www.mcmaster.com/search/?q=';

const MATERIAL_STYLE: Record<string, string> = {
  'Zinc-Plated Steel':   'bg-slate-700 text-slate-300',
  '410 Stainless Steel': 'bg-sky-900 text-sky-300',
};

export function ResultsTable({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm px-4 py-6">
        <AlertCircle size={15} />
        No fasteners meet the specified criteria. Adjust parameters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
            <th className="text-left py-2 px-3 font-semibold">Part #</th>
            <th className="text-left py-2 px-3 font-semibold">Thread</th>
            <th className="text-left py-2 px-3 font-semibold">Length</th>
            <th className="text-left py-2 px-3 font-semibold">Drive</th>
            <th className="text-left py-2 px-3 font-semibold">Material</th>
            <th className="text-left py-2 px-3 font-semibold">Pt</th>
            <th className="py-2 px-3" />
          </tr>
        </thead>
        <tbody>
          {results.map((f, i) => (
            <tr
              key={f.partNumber}
              className={`border-b border-slate-800 hover:bg-slate-800 transition-colors ${
                i === 0 ? 'bg-amber-950/20' : ''
              }`}
            >
              <td className="py-2 px-3 font-mono text-amber-300 font-semibold tracking-wide">
                {f.partNumber}
              </td>
              <td className="py-2 px-3 font-mono text-slate-200">{f.threadSize}</td>
              <td className="py-2 px-3 font-mono text-slate-200 tabular-nums">{f.length.toFixed(2)}&quot;</td>
              <td className="py-2 px-3 text-slate-300">{f.headDrive}</td>
              <td className="py-2 px-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${MATERIAL_STYLE[f.material]}`}>
                  {f.material}
                </span>
              </td>
              <td className="py-2 px-3 font-mono text-slate-500 text-xs">#{f.drillPoint}</td>
              <td className="py-2 px-3">
                <a
                  href={`${MCMASTER_BASE}${f.partNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-amber-300 transition-colors"
                >
                  McMaster <ExternalLink size={11} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-600 mt-2 px-3 pb-2">
        {results.length} fastener{results.length !== 1 ? 's' : ''} match ·
        First row is shortest qualifying selection
      </p>
    </div>
  );
}
