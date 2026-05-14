import { ExternalLink, AlertCircle } from 'lucide-react';
import { TPI, DRILL_POINT_MAX } from '../data/drillPoints';
import type { FastenerResult } from '../types';

interface Props {
  results: FastenerResult[];
}

const MATERIAL_STYLE: Record<string, string> = {
  'Zinc-Plated Steel':   'bg-slate-700 text-slate-300',
  '410 Stainless Steel': 'bg-sky-900 text-sky-300',
};

const DRILL_PT_STYLE: Record<number, string> = {
  2: 'bg-slate-700 text-slate-400',
  3: 'bg-indigo-950 text-indigo-400',
};

const HEAD_ABBREV: Record<string, string> = {
  'Hex Washer Head':   'Hex Washer',
  'Pan Head Phillips': 'Pan / Phillips',
  'Flat Head Torx':    'Flat / Torx',
};

const MCMASTER_BASE = 'https://www.mcmaster.com/search/?q=';

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
            <th className="text-left py-2 px-3 font-semibold">TPI</th>
            <th className="text-left py-2 px-3 font-semibold">Length</th>
            <th className="text-left py-2 px-3 font-semibold text-slate-500">Pt. Length</th>
            <th className="text-left py-2 px-3 font-semibold">Head / Drive</th>
            <th className="text-left py-2 px-3 font-semibold">Drill Pt</th>
            <th className="text-left py-2 px-3 font-semibold">Material</th>
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
              <td className="py-2 px-3 font-mono font-semibold tracking-wide">
                <a
                  href={`${MCMASTER_BASE}${f.partNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 hover:underline transition-colors"
                >
                  {f.partNumber}
                  <ExternalLink size={10} className="opacity-50" />
                </a>
              </td>
              <td className="py-2 px-3 font-mono text-slate-200">{f.threadSize}</td>
              <td className="py-2 px-3 font-mono text-slate-300 tabular-nums">
                {TPI[f.threadSize]}
              </td>
              <td className="py-2 px-3 font-mono text-slate-200 tabular-nums">
                {f.length.toFixed(2)}&quot;
              </td>
              <td className="py-2 px-3 font-mono text-slate-500 tabular-nums text-xs">
                {DRILL_POINT_MAX[f.drillPoint][f.threadSize].toFixed(3)}&quot;
              </td>
              <td className="py-2 px-3 text-slate-300 text-xs">
                {HEAD_ABBREV[f.headDrive] ?? f.headDrive}
              </td>
              <td className="py-2 px-3">
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${DRILL_PT_STYLE[f.drillPoint]}`}>
                  Pt. {f.drillPoint}
                </span>
              </td>
              <td className="py-2 px-3">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${MATERIAL_STYLE[f.material]}`}>
                  {f.material}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-600 mt-2 px-3 pb-2">
        {results.length} fastener{results.length !== 1 ? 's' : ''} match ·
        First row is shortest qualifying selection · SAE J78-2013
      </p>
    </div>
  );
}
