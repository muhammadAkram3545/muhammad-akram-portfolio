import React from 'react';
import { TypographyConfig } from '../../../types/portfolio';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  RotateCcw
} from 'lucide-react';

interface TypographyControlsProps {
  value?: TypographyConfig;
  onChange: (value: TypographyConfig) => void;
  onReset?: () => void;
}

export const TypographyControls: React.FC<TypographyControlsProps> = ({
  value = {},
  onChange,
  onReset
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">Typography</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
            title="Reset Typography"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 mb-1">FONT FAMILY</label>
        <select
          value={value.fontFamily || ''}
          onChange={(e) => onChange({ ...value, fontFamily: e.target.value || undefined })}
          className="w-full px-2 py-1.5 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none"
        >
          <option value="">Theme Default</option>
          <option value="Syne, sans-serif">Syne (Display)</option>
          <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Body)</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono (Code)</option>
          <option value="'Playfair Display', serif">Playfair Display (Serif)</option>
          <option value="system-ui, sans-serif">System Sans</option>
        </select>
      </div>

      {/* Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">SIZE</label>
          <input
            type="text"
            placeholder="e.g. 24px"
            value={value.fontSize || ''}
            onChange={(e) => onChange({ ...value, fontSize: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">WEIGHT</label>
          <select
            value={value.fontWeight || ''}
            onChange={(e) => onChange({ ...value, fontWeight: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          >
            <option value="">Inherit</option>
            <option value="300">Light 300</option>
            <option value="400">Regular 400</option>
            <option value="500">Medium 500</option>
            <option value="600">SemiBold 600</option>
            <option value="700">Bold 700</option>
            <option value="800">ExtraBold 800</option>
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 mb-1">TEXT COLOR</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.color || '#ffffff'}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={value.color || ''}
            placeholder="#ffffff"
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 mb-1">ALIGNMENT</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] border border-white/10 rounded-lg">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => {
            const Icon =
              align === 'left'
                ? AlignLeft
                : align === 'center'
                ? AlignCenter
                : align === 'right'
                ? AlignRight
                : AlignJustify;
            return (
              <button
                key={align}
                type="button"
                onClick={() => onChange({ ...value, textAlign: align })}
                className={`flex items-center justify-center p-1 rounded transition-colors ${
                  value.textAlign === align
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Align ${align}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Transform & Line Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">TRANSFORM</label>
          <select
            value={value.textTransform || 'none'}
            onChange={(e) => onChange({ ...value, textTransform: e.target.value as any })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          >
            <option value="none">None</option>
            <option value="uppercase">UPPERCASE</option>
            <option value="lowercase">lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">LINE HEIGHT</label>
          <input
            type="text"
            placeholder="e.g. 1.4"
            value={value.lineHeight || ''}
            onChange={(e) => onChange({ ...value, lineHeight: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>
      </div>
    </div>
  );
};
