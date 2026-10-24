import React, { useState } from 'react';
import { BorderConfig, ShadowConfig, BorderCornerRadius } from '../../../types/portfolio';
import { Link2, Unlink2, RotateCcw } from 'lucide-react';

interface BorderShadowControlsProps {
  border?: BorderConfig;
  shadow?: ShadowConfig;
  opacity?: number;
  onBorderChange: (border: BorderConfig) => void;
  onShadowChange: (shadow: ShadowConfig) => void;
  onOpacityChange?: (opacity: number) => void;
  onReset?: () => void;
}

export const BorderShadowControls: React.FC<BorderShadowControlsProps> = ({
  border = { style: 'none', width: '1px', color: 'rgba(255,255,255,0.1)' },
  shadow = { preset: 'none' },
  opacity,
  onBorderChange,
  onShadowChange,
  onOpacityChange,
  onReset
}) => {
  const currentRadius = border.radius || {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
    unit: 'px',
    isLinked: true
  };

  const [isRadiusLinked, setIsRadiusLinked] = useState(currentRadius.isLinked ?? true);

  const handleCornerChange = (corner: keyof Omit<BorderCornerRadius, 'unit' | 'isLinked'>, val: number) => {
    if (isRadiusLinked) {
      onBorderChange({
        ...border,
        radius: {
          topLeft: val,
          topRight: val,
          bottomRight: val,
          bottomLeft: val,
          unit: currentRadius.unit || 'px',
          isLinked: true
        }
      });
    } else {
      onBorderChange({
        ...border,
        radius: {
          ...currentRadius,
          [corner]: val,
          isLinked: false
        }
      });
    }
  };

  const toggleRadiusLink = () => {
    const next = !isRadiusLinked;
    setIsRadiusLinked(next);
    if (next) {
      onBorderChange({
        ...border,
        radius: {
          topLeft: currentRadius.topLeft,
          topRight: currentRadius.topLeft,
          bottomRight: currentRadius.topLeft,
          bottomLeft: currentRadius.topLeft,
          unit: currentRadius.unit || 'px',
          isLinked: true
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">Border & Shadow</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
            title="Reset Border & Shadow"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Border Style & Width */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">BORDER STYLE</label>
          <select
            value={border.style || 'none'}
            onChange={(e) => onBorderChange({ ...border, style: e.target.value as any })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none"
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">WIDTH</label>
          <input
            type="text"
            placeholder="1px"
            value={border.width || '1px'}
            onChange={(e) => onBorderChange({ ...border, width: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>
      </div>

      {/* Border Color */}
      {border.style !== 'none' && (
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">BORDER COLOR</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={border.color?.startsWith('#') ? border.color : '#38bdf8'}
              onChange={(e) => onBorderChange({ ...border, color: e.target.value })}
              className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={border.color || 'rgba(255,255,255,0.1)'}
              onChange={(e) => onBorderChange({ ...border, color: e.target.value })}
              className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>
        </div>
      )}

      {/* Corner Radius Controls with Link/Unlink */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
          <span>CORNER RADIUS</span>
          <button
            type="button"
            onClick={toggleRadiusLink}
            className={`p-0.5 rounded ${
              isRadiusLinked ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isRadiusLinked ? 'All corners linked' : 'Independent corners'}
          >
            {isRadiusLinked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const).map((c) => (
            <div key={c}>
              <input
                type="number"
                value={currentRadius[c] ?? 0}
                onChange={(e) => handleCornerChange(c, parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-1 text-center bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
              <span className="text-[8px] uppercase font-mono text-slate-500 mt-0.5 block truncate">
                {c === 'topLeft' ? 'TL' : c === 'topRight' ? 'TR' : c === 'bottomRight' ? 'BR' : 'BL'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Box Shadow */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 mb-1">BOX SHADOW</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] border border-white/10 rounded-lg text-center text-[10px] font-mono">
          {(['none', 'soft', 'medium', 'strong'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onShadowChange({ ...shadow, preset: p })}
              className={`py-1 rounded capitalize transition-colors ${
                (shadow.preset || 'none') === p
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      {typeof opacity === 'number' && onOpacityChange && (
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
            <span>OPACITY</span>
            <span>{Math.round((opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity ?? 1}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
