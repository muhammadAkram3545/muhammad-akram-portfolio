import React, { useState } from 'react';
import { SpacingSides } from '../../../types/portfolio';
import { Link2, Unlink2, RotateCcw } from 'lucide-react';

interface SpacingControlsProps {
  label: string;
  value?: SpacingSides;
  onChange: (value: SpacingSides) => void;
  onReset?: () => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  label,
  value = { top: 0, right: 0, bottom: 0, left: 0, unit: 'px', isLinked: true },
  onChange,
  onReset
}) => {
  const [isLinked, setIsLinked] = useState(value.isLinked ?? true);

  const handleSideChange = (side: keyof Omit<SpacingSides, 'unit' | 'isLinked'>, val: number) => {
    if (isLinked) {
      onChange({
        top: val,
        right: val,
        bottom: val,
        left: val,
        unit: value.unit || 'px',
        isLinked: true
      });
    } else {
      onChange({
        ...value,
        [side]: val,
        isLinked: false
      });
    }
  };

  const toggleLink = () => {
    const nextLinked = !isLinked;
    setIsLinked(nextLinked);
    if (nextLinked) {
      // sync all to top
      onChange({
        top: value.top,
        right: value.top,
        bottom: value.top,
        left: value.top,
        unit: value.unit || 'px',
        isLinked: true
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">{label}</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleLink}
            className={`p-1 rounded transition-colors ${
              isLinked ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isLinked ? 'Linked values (all sides equal)' : 'Unlinked values (independent sides)'}
          >
            {isLinked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="p-1 rounded text-slate-500 hover:text-slate-300"
              title="Reset spacing"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          <select
            value={value.unit || 'px'}
            onChange={(e) => onChange({ ...value, unit: e.target.value as any })}
            className="bg-[#090b10] border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-slate-300"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
            <option value="%">%</option>
            <option value="em">em</option>
          </select>
        </div>
      </div>

      {/* 4 sides input grid */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side}>
            <input
              type="number"
              value={value[side] ?? 0}
              onChange={(e) => handleSideChange(side, parseFloat(e.target.value) || 0)}
              className="w-full px-1.5 py-1 text-center bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono focus:border-sky-400 outline-none"
            />
            <span className="text-[9px] uppercase font-mono text-slate-500 mt-0.5 block">
              {side[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
