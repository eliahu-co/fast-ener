import { GAUGE_MAP } from '../data/gauges';
import { ATTACHMENT_MATERIAL_MAP } from '../data/attachments';
import type { AttachmentLayer, AttachmentMaterial } from '../types';

interface Props {
  layers: AttachmentLayer[];
  substrateGauge: string;
}

/** Visual fill / stroke per material type */
const MAT_STYLE: Record<AttachmentMaterial, { fill: string; stroke: string; label: string }> = {
  steel:  { fill: '#334155', stroke: '#64748b', label: 'Steel (LGS)' },
  gypsum: { fill: '#2d3a2e', stroke: '#4ade80', label: 'Gypsum Board' },
  foam:   { fill: '#2a2a1a', stroke: '#facc15', label: 'Polyiso / Foam' },
  wood:   { fill: '#2d1f0e', stroke: '#a16207', label: 'OSB / Plywood' },
};

/**
 * Elevation cross-section (top = exterior face, fastener goes straight down).
 * layers[0] = outermost (top). Uniform STUD_SCALE throughout.
 */

const STUD_SCALE = 40;  // px/in — uniform scale for ALL geometry

const SVG_W     = 380;
const CX        = 190;

const FLANGE_PX = 2   * STUD_SCALE;  //  80 px
const LIP_PX    = 0.5 * STUD_SCALE;  //  20 px
const WEB_PX    = 5   * STUD_SCALE;  // 200 px

const flangeLeft  = CX - FLANGE_PX / 2;  // 150
const flangeRight = CX + FLANGE_PX / 2;  // 230
const webX        = flangeLeft;

const PAD_TOP    = 28;
const PAD_BOT    = 32;
const HEAD_W     = 30;
const HEAD_H_HEX = 9;
const HEAD_H_PAN = 5;
const SHAFT_W    = 10;

export function CrossSection({ layers, substrateGauge }: Props) {
  const subT = GAUGE_MAP[substrateGauge] ?? 0.048;
  const st   = Math.max(3, Math.min(10, Math.round(subT * 80)));

  // Per-layer pixel heights — minimum 5 px so thin steel gauges stay visible
  const layerHeights = layers.map((l) => Math.max(l.thickness * STUD_SCALE, 5));
  const totalAttH    = layerHeights.reduce((s, h) => s + h, 0);

  const attY = PAD_TOP;
  const webY = attY + totalAttH;
  const svgH = PAD_TOP + totalAttH + WEB_PX + PAD_BOT;

  // Head type: outermost layer drives the decision
  const outerMaterial = layers[0]?.material ?? 'steel';
  const outerMatDef   = ATTACHMENT_MATERIAL_MAP[outerMaterial];
  const usePanHead    = outerMatDef.excludeHeads?.includes('Hex Washer Head') ?? false;
  const headH         = usePanHead ? HEAD_H_PAN : HEAD_H_HEX;

  const shaftX = CX - SHAFT_W / 2;
  const headX  = CX - HEAD_W / 2;
  const tipY   = webY + st + 20;
  const shaftH = tipY - attY;
  const pointH = 12;

  const tipPts = [
    `${shaftX},${tipY}`,
    `${shaftX + SHAFT_W},${tipY}`,
    `${CX},${tipY + pointH}`,
  ].join(' ');

  const ticks: number[] = [];
  for (let y = attY + headH + 4; y < tipY - 4; y += 5) ticks.push(y);

  // Stack callout: from top-of-first-layer to bottom-of-top-flange
  const stackX  = flangeRight + 22;
  const stackTop = attY;
  const stackBot = webY + st;
  const totalStackIn = layers.reduce((s, l) => s + l.thickness, 0) + subT;

  const labelY1 = Math.max(webY + st + 16, tipY + pointH + 14);
  const labelY2 = labelY1 + 13;

  const hasFastener = layers.length > 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Cross-Section Preview
      </p>
      <svg
        width={SVG_W}
        height={svgH}
        viewBox={`0 0 ${SVG_W} ${svgH}`}
        className="bg-slate-950"
        aria-label="Structural connection cross-section"
      >
        {/* ── Attachment layers — stacked top-to-bottom ── */}
        {layers.map((layer, index) => {
          const style   = MAT_STYLE[layer.material];
          const yOffset = attY + layerHeights.slice(0, index).reduce((s, h) => s + h, 0);
          const h       = layerHeights[index];
          return (
            <g key={index}>
              <rect
                x={16} y={yOffset} width={SVG_W - 32} height={h}
                fill={style.fill} stroke={style.stroke} strokeWidth={1}
              />
              <text
                x={22}
                y={yOffset + Math.min(h / 2 + 4, h - 2)}
                fill={style.stroke} fontSize={10} fontFamily="monospace"
              >
                {index + 1}. {style.label} · {layer.thickness.toFixed(3)}&quot;
              </text>
            </g>
          );
        })}

        {/* ── Cavity fill ── */}
        <rect
          x={webX + st} y={webY + st}
          width={FLANGE_PX - st} height={WEB_PX - 2 * st}
          fill="#0f172a"
        />

        {/* ── C-section stud: web LEFT, flanges TOP & BOTTOM, opens RIGHT ── */}
        <rect x={webX} y={webY} width={st} height={WEB_PX}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={0.5} />
        <rect x={flangeLeft} y={webY} width={FLANGE_PX} height={st}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={0.5} />
        <rect x={flangeLeft} y={webY + WEB_PX - st} width={FLANGE_PX} height={st}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={0.5} />
        <rect x={flangeRight - st} y={webY + st} width={st} height={LIP_PX}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={0.5} />
        <rect x={flangeRight - st} y={webY + WEB_PX - st - LIP_PX} width={st} height={LIP_PX}
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth={0.5} />

        {/* ── Stud label ── */}
        <text x={CX + 8} y={labelY1} fill="#60a5fa" fontSize={10} fontFamily="monospace">
          LGS Stud · {substrateGauge}
        </text>
        <text x={CX + 8} y={labelY2} fill="#3b82f6" fontSize={9} fontFamily="monospace">
          {subT.toFixed(3)}&quot;
        </text>

        {/* ── Screw head ── */}
        {hasFastener && (usePanHead ? (
          <>
            <path
              d={[
                `M ${headX},${attY}`,
                `L ${headX},${attY - headH + 2}`,
                `Q ${headX},${attY - headH} ${CX},${attY - headH}`,
                `Q ${headX + HEAD_W},${attY - headH} ${headX + HEAD_W},${attY - headH + 2}`,
                `L ${headX + HEAD_W},${attY} Z`,
              ].join(' ')}
              fill="#fbbf24" stroke="#d97706" strokeWidth={1}
            />
            <line x1={CX - 4} y1={attY - headH + 2} x2={CX + 4} y2={attY - headH + 2}
              stroke="#92400e" strokeWidth={1.2} />
            <line x1={CX} y1={attY - headH} x2={CX} y2={attY - headH + 4}
              stroke="#92400e" strokeWidth={1.2} />
          </>
        ) : (
          <>
            <rect x={headX} y={attY - headH} width={HEAD_W} height={headH}
              fill="#fbbf24" stroke="#d97706" strokeWidth={1} rx={1} />
            <rect x={headX + 5} y={attY - headH} width={HEAD_W - 10} height={headH - 2}
              fill="#f59e0b" stroke="#d97706" strokeWidth={0.5} rx={1} />
            <line x1={headX + 8} y1={attY - headH + 2}
                  x2={headX + HEAD_W - 8} y2={attY - headH + 2}
              stroke="#92400e" strokeWidth={1.2} />
          </>
        ))}

        {/* ── Shaft ── */}
        {hasFastener && (
          <rect x={shaftX} y={attY} width={SHAFT_W} height={shaftH}
            fill="#d97706" stroke="#b45309" strokeWidth={0.5} />
        )}

        {/* ── Thread marks ── */}
        {hasFastener && ticks.map((y) => (
          <line key={y}
            x1={shaftX - 2} y1={y} x2={shaftX + SHAFT_W + 2} y2={y}
            stroke="#fcd34d" strokeWidth={0.8} opacity={0.55}
          />
        ))}

        {/* ── Drill point ── */}
        {hasFastener && (
          <polygon points={tipPts} fill="#fbbf24" stroke="#b45309" strokeWidth={0.5} />
        )}

        {/* ── Stack callout — engineering drawing style ── */}
        {hasFastener && (() => {
          const midY    = (stackTop + stackBot) / 2;
          const tk      = 8;   // half-length of 45° tick marks
          const textX   = stackX + 18;
          const extFrom = flangeRight + 4;   // gap from feature edge
          const extTo   = stackX + 4;        // slight overhang past dim line
          return (
            <>
              {/* extension (witness) lines — from feature to just past dim line */}
              <line x1={extFrom} y1={stackTop} x2={extTo} y2={stackTop}
                stroke="#64748b" strokeWidth={0.8} />
              <line x1={extFrom} y1={stackBot} x2={extTo} y2={stackBot}
                stroke="#64748b" strokeWidth={0.8} />
              {/* vertical dimension line */}
              <line x1={stackX} y1={stackTop} x2={stackX} y2={stackBot}
                stroke="#94a3b8" strokeWidth={1} />
              {/* top 45° tick (architectural slash) */}
              <line
                x1={stackX - tk} y1={stackTop + tk}
                x2={stackX + tk} y2={stackTop - tk}
                stroke="#94a3b8" strokeWidth={1.5}
              />
              {/* bottom 45° tick */}
              <line
                x1={stackX - tk} y1={stackBot + tk}
                x2={stackX + tk} y2={stackBot - tk}
                stroke="#94a3b8" strokeWidth={1.5}
              />
              {/* dimension value — rotated 90° to read bottom-to-top */}
              <text
                x={textX}
                y={midY}
                fill="#cbd5e1"
                fontSize={11}
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(-90, ${textX}, ${midY})`}
              >
                {totalStackIn.toFixed(3)}&quot;
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}
