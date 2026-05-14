import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Check } from 'lucide-react';
import { GAUGE_LABELS } from '../data/gauges';
import { ATTACHMENT_MATERIAL_DEFS, ATTACHMENT_MATERIAL_MAP } from '../data/attachments';
import type { AttachmentLayer, AttachmentMaterial } from '../types';

const MAX_TOTAL = 10; // inches — must match CrossSection MAX_ATT_IN

interface Props {
  layers: AttachmentLayer[];
  substrateGauge: string;
  isOutdoor: boolean;
  onLayersChange: (layers: AttachmentLayer[]) => void;
  onGaugeChange: (g: string) => void;
  onOutdoorChange: (v: boolean) => void;
  onClose?: () => void;
}

export function InputPanel({
  layers,
  substrateGauge,
  isOutdoor,
  onLayersChange,
  onGaugeChange,
  onOutdoorChange,
  onClose,
}: Props) {
  // Tracks raw string values typed in each layer's custom input, keyed by layer index.
  // undefined = not editing; empty string or any string = user is actively editing that row.
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});

  const totalThickness = layers.reduce((s, l) => s + l.thickness, 0);

  // ── Custom-input helpers ─────────────────────────────────────────────────

  function setCustom(index: number, value: string) {
    setCustomInputs(prev => ({ ...prev, [index]: value }));
  }

  function clearCustom(index: number) {
    setCustomInputs(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  function resetAllCustom() {
    setCustomInputs({});
  }

  // ── Layer mutation helpers ────────────────────────────────────────────────

  function updateLayer(index: number, patch: Partial<AttachmentLayer>): void {
    onLayersChange(layers.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    clearCustom(index);
  }

  function moveLayer(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[index], next[target]] = [next[target], next[index]];
    onLayersChange(next);
    resetAllCustom();
  }

  function removeLayer(index: number): void {
    onLayersChange(layers.filter((_, i) => i !== index));
    resetAllCustom();
  }

  function addLayer(): void {
    const def = ATTACHMENT_MATERIAL_DEFS[0];
    const t = def.presets[0].thickness;
    if (totalThickness + t > MAX_TOTAL) return;
    onLayersChange([...layers, { material: def.id, thickness: t }]);
  }

  function commitCustom(index: number): void {
    const raw = customInputs[index];
    if (raw === undefined) return;
    const v = parseFloat(raw);
    const maxForThis = MAX_TOTAL - (totalThickness - layers[index].thickness);
    if (isNaN(v) || v <= 0 || v > maxForThis) return;
    updateLayer(index, { thickness: v });
  }

  const addLayerDisabled =
    totalThickness + ATTACHMENT_MATERIAL_DEFS[0].presets[0].thickness > MAX_TOTAL;

  return (
    <aside className="flex flex-col bg-slate-900 border-r border-slate-700 w-full md:w-72 h-full shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-6 p-4">

      {/* ── Attachment layers ── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Attachment Layers
        </h2>
        <p className="text-xs text-slate-500 mb-3 leading-snug">
          Layer 1 is outermost — screw head bears here.
        </p>

        {layers.map((layer, index) => {
          const matDef       = ATTACHMENT_MATERIAL_MAP[layer.material];
          const activePreset = matDef.presets.find((p) => p.thickness === layer.thickness);
          const showWarn     = matDef.warnAbove !== undefined && layer.thickness > matDef.warnAbove;
          const isOuter      = index === 0;

          const customRaw    = customInputs[index];
          const isEditing    = customRaw !== undefined;
          const parsedCustom = parseFloat(customRaw ?? '');
          const maxForThis   = MAX_TOTAL - (totalThickness - layer.thickness);
          const isInvalid    = isEditing && (isNaN(parsedCustom) || parsedCustom <= 0 || parsedCustom > maxForThis);

          return (
            <div key={index} className="mb-3 rounded border border-slate-700 bg-slate-800 p-3">

              {/* Row 1: index + material select + reorder / delete */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-mono text-slate-500 w-4 shrink-0 text-center">
                  {index + 1}
                </span>
                <select
                  value={layer.material}
                  onChange={(e) => {
                    const newMat = e.target.value as AttachmentMaterial;
                    const newDef = ATTACHMENT_MATERIAL_MAP[newMat];
                    updateLayer(index, { material: newMat, thickness: newDef.presets[0].thickness });
                  }}
                  className="flex-1 min-w-0 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {ATTACHMENT_MATERIAL_DEFS.map((def) => (
                    <option key={def.id} value={def.id}>{def.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => moveLayer(index, -1)}
                  disabled={index === 0}
                  title="Move up (more exterior)"
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveLayer(index, 1)}
                  disabled={index === layers.length - 1}
                  title="Move down (more interior)"
                  className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => removeLayer(index)}
                  disabled={layers.length === 1}
                  title="Remove layer"
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Row 2: thickness presets */}
              <div className="grid grid-cols-3 gap-1 mb-2">
                {matDef.presets.map((p) => {
                  const wouldExceed = totalThickness - layer.thickness + p.thickness > MAX_TOTAL;
                  return (
                    <button
                      key={p.label}
                      onClick={() => updateLayer(index, { thickness: p.thickness })}
                      disabled={wouldExceed}
                      className={`py-1 rounded text-xs font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                        activePreset?.label === p.label
                          ? 'bg-amber-400 text-slate-900 font-semibold'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Row 3: custom thickness input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  inputMode="decimal"
                  value={isEditing ? customRaw : layer.thickness.toFixed(3)}
                  onFocus={() => {
                    if (!isEditing) setCustom(index, layer.thickness.toFixed(3));
                  }}
                  onChange={(e) => setCustom(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitCustom(index);
                    if (e.key === 'Escape') clearCustom(index);
                  }}
                  className={`flex-1 min-w-0 bg-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none border transition-colors ${
                    isInvalid
                      ? 'border-red-500 ring-1 ring-red-500'
                      : isEditing
                      ? 'border-amber-400 ring-1 ring-amber-400'
                      : 'border-slate-600 focus:ring-1 focus:ring-amber-400'
                  }`}
                  placeholder="0.000"
                />
                {isEditing && (
                  <button
                    onClick={() => commitCustom(index)}
                    disabled={isInvalid}
                    title="Apply (Enter)"
                    className="p-1 rounded bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <Check size={13} />
                  </button>
                )}
                <span className="text-xs text-slate-500 font-mono shrink-0">in.</span>
              </div>
              {!activePreset && !isEditing && (
                <p className="mt-1 text-xs text-amber-500 font-mono">custom</p>
              )}
              {isEditing && isInvalid && (
                <p className="mt-1 text-xs text-red-400 font-mono">
                  {parseFloat(customRaw) <= 0 || isNaN(parseFloat(customRaw))
                    ? 'must be > 0'
                    : `max ${maxForThis.toFixed(3)}" here`}
                </p>
              )}

              {/* Thickness warning (e.g. wood > ½") */}
              {showWarn && matDef.warnMessage && (
                <p className="mt-2 text-xs text-orange-400 leading-snug">
                  ⚠ {matDef.warnMessage}
                </p>
              )}

              {/* Head note — outermost layer only */}
              {isOuter && matDef.headNote && (
                <p className="mt-2 text-xs text-slate-400 leading-snug">
                  {matDef.excludeHeads?.length ? '⛔' : 'ℹ'} {matDef.headNote}
                </p>
              )}
            </div>
          );
        })}

        {/* Total thickness indicator */}
        <div className="flex justify-between items-center text-xs font-mono mb-2 px-1">
          <span className="text-slate-500">Stack total</span>
          <span className={
            totalThickness >= MAX_TOTAL
              ? 'text-red-400 font-semibold'
              : totalThickness >= MAX_TOTAL * 0.9
              ? 'text-amber-400'
              : 'text-slate-400'
          }>
            {totalThickness.toFixed(3)} in.
          </span>
        </div>

        {/* Add Layer */}
        <button
          onClick={addLayer}
          disabled={addLayerDisabled}
          title={addLayerDisabled ? 'Total attachment thickness at 10" maximum' : undefined}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded border border-dashed border-slate-600 text-xs text-slate-400 hover:text-slate-100 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-600 transition-colors"
        >
          <Plus size={13} />
          Add Layer
        </button>
      </div>

      {/* ── Substrate gauge ── */}
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

      {/* ── Environment ── */}
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
      </div>

      {onClose && (
        <div className="md:hidden shrink-0 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-3 rounded bg-amber-400 text-slate-900 font-semibold text-sm active:scale-95 transition-transform"
          >
            Pick a fastener!
          </button>
        </div>
      )}
    </aside>
  );
}
