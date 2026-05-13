import { GAUGE_MAP } from '../data/gauges';

interface Props {
  attachmentThickness: number;
  substrateGauge: string;
}

const SCALE = 300;
const SVG_WIDTH = 340;
const PAD = 28;
const HEAD_W = 30;
const HEAD_H = 9;
const SHAFT_W = 10;
const CX = SVG_WIDTH / 2;

export function CrossSection({ attachmentThickness, substrateGauge }: Props) {
  const subT = GAUGE_MAP[substrateGauge] ?? 0.048;

  const attH = Math.max(attachmentThickness * SCALE, 10);
  const subH = Math.max(subT * SCALE, 10);
  const svgH = PAD + attH + subH + PAD;

  const attY = PAD;
  const subY = PAD + attH;

  const tipY = subY + subH * 0.65;
  const shaftH = tipY - attY;
  const pointH = 12;
  const shaftX = CX - SHAFT_W / 2;
  const headX = CX - HEAD_W / 2;

  const tipPts = [
    `${shaftX},${tipY}`,
    `${shaftX + SHAFT_W},${tipY}`,
    `${CX},${tipY + pointH}`,
  ].join(' ');

  const ticks: number[] = [];
  for (let y = attY + HEAD_H + 5; y < tipY - 4; y += 5) ticks.push(y);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Cross-Section Preview
      </p>
      <svg
        width={SVG_WIDTH}
        height={svgH}
        viewBox={`0 0 ${SVG_WIDTH} ${svgH}`}
        className="rounded border border-slate-700 bg-slate-950"
        aria-label="Structural connection cross-section"
      >
        {/* Attachment material block */}
        <rect x={16} y={attY} width={SVG_WIDTH - 32} height={attH}
          fill="#334155" stroke="#64748b" strokeWidth={1} />
        <text x={22} y={attY + attH / 2 + 4} fill="#94a3b8" fontSize={10} fontFamily="monospace">
          Attachment · {attachmentThickness.toFixed(3)}&quot;
        </text>

        {/* LGS stud block */}
        <rect x={16} y={subY} width={SVG_WIDTH - 32} height={subH}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1} />
        <line x1={16} y1={subY + 2} x2={SVG_WIDTH - 16} y2={subY + 2}
          stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.45} />
        <line x1={16} y1={subY + subH - 2} x2={SVG_WIDTH - 16} y2={subY + subH - 2}
          stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 3" opacity={0.45} />
        <text x={22} y={subY + subH / 2 + 4} fill="#60a5fa" fontSize={10} fontFamily="monospace">
          LGS Stud · {substrateGauge} · {subT.toFixed(3)}&quot;
        </text>

        {/* Screw head */}
        <rect x={headX} y={attY - HEAD_H} width={HEAD_W} height={HEAD_H}
          fill="#fbbf24" stroke="#d97706" strokeWidth={1} rx={1} />
        <line x1={headX + 6} y1={attY - HEAD_H + 3}
              x2={headX + HEAD_W - 6} y2={attY - HEAD_H + 3}
          stroke="#92400e" strokeWidth={1.5} />

        {/* Shaft */}
        <rect x={shaftX} y={attY} width={SHAFT_W} height={shaftH}
          fill="#d97706" stroke="#b45309" strokeWidth={0.5} />

        {/* Thread marks */}
        {ticks.map((y) => (
          <line key={y}
            x1={shaftX - 2} y1={y} x2={shaftX + SHAFT_W + 2} y2={y}
            stroke="#fcd34d" strokeWidth={0.8} opacity={0.55} />
        ))}

        {/* Drill point */}
        <polygon points={tipPts} fill="#fbbf24" stroke="#b45309" strokeWidth={0.5} />

        {/* TMT callout */}
        <line
          x1={CX + HEAD_W / 2 + 10} y1={attY}
          x2={CX + HEAD_W / 2 + 10} y2={subY + subH}
          stroke="#475569" strokeWidth={1} />
        <line x1={CX + HEAD_W / 2 + 7} y1={attY}
              x2={CX + HEAD_W / 2 + 13} y2={attY}
          stroke="#475569" strokeWidth={1} />
        <line x1={CX + HEAD_W / 2 + 7} y1={subY + subH}
              x2={CX + HEAD_W / 2 + 13} y2={subY + subH}
          stroke="#475569" strokeWidth={1} />
        <text
          x={CX + HEAD_W / 2 + 16}
          y={PAD + (attH + subH) / 2 + 4}
          fill="#64748b" fontSize={9} fontFamily="monospace"
        >
          TMT {(attachmentThickness + subT).toFixed(3)}&quot;
        </text>
      </svg>
      <p className="text-xs text-slate-600 font-mono">1&quot; = {SCALE}px</p>
    </div>
  );
}
