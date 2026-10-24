import React from 'react';
import { LayoutConfig, SizeConfig } from '../../../types/portfolio';
import { RotateCcw } from 'lucide-react';

interface LayoutSizeControlsProps {
  layout?: LayoutConfig;
  size?: SizeConfig;
  onLayoutChange: (layout: LayoutConfig) => void;
  onSizeChange: (size: SizeConfig) => void;
  onReset?: () => void;
}

export const LayoutSizeControls: React.FC<LayoutSizeControlsProps> = ({
  layout = {},
  size = {},
  onLayoutChange,
  onSizeChange,
  onReset
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">Layout & Sizing</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
            title="Reset Layout & Size"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Display Selector */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 mb-1">DISPLAY</label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] border border-white/10 rounded-lg text-center text-[10px] font-mono">
          {(['block', 'flex', 'grid', 'inline-block'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onLayoutChange({ ...layout, display: d })}
              className={`py-1 rounded capitalize transition-colors ${
                (layout.display || 'block') === d
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d === 'inline-block' ? 'Inline' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Flex controls if display === flex */}
      {layout.display === 'flex' && (
        <div className="p-2.5 rounded-xl bg-[#090b10] border border-white/10 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">DIRECTION</label>
              <select
                value={layout.flexDirection || 'row'}
                onChange={(e) => onLayoutChange({ ...layout, flexDirection: e.target.value as any })}
                className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="row">Row (Horizontal)</option>
                <option value="column">Column (Vertical)</option>
                <option value="row-reverse">Row Reverse</option>
                <option value="column-reverse">Column Reverse</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">WRAP</label>
              <select
                value={layout.flexWrap || 'nowrap'}
                onChange={(e) => onLayoutChange({ ...layout, flexWrap: e.target.value as any })}
                className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap Items</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">JUSTIFY</label>
              <select
                value={layout.justifyContent || 'flex-start'}
                onChange={(e) => onLayoutChange({ ...layout, justifyContent: e.target.value as any })}
                className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">ALIGN</label>
              <select
                value={layout.alignItems || 'stretch'}
                onChange={(e) => onLayoutChange({ ...layout, alignItems: e.target.value as any })}
                className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="flex-start">Start</option>
                <option value="flex-end">End</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">GAP</label>
            <input
              type="text"
              placeholder="e.g. 16px or 1rem"
              value={layout.gap || ''}
              onChange={(e) => onLayoutChange({ ...layout, gap: e.target.value })}
              className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>
        </div>
      )}

      {/* Grid controls if display === grid */}
      {layout.display === 'grid' && (
        <div className="p-2.5 rounded-xl bg-[#090b10] border border-white/10 space-y-2 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">GRID COLUMNS</label>
            <input
              type="text"
              placeholder="e.g. repeat(3, 1fr) or 1fr 1fr"
              value={layout.gridColumns || ''}
              onChange={(e) => onLayoutChange({ ...layout, gridColumns: e.target.value })}
              className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">GRID GAP</label>
            <input
              type="text"
              placeholder="e.g. 24px"
              value={layout.gap || ''}
              onChange={(e) => onLayoutChange({ ...layout, gap: e.target.value })}
              className="w-full px-2 py-1 bg-[#121620] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>
        </div>
      )}

      {/* Dimensions Width & Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">WIDTH</label>
          <input
            type="text"
            placeholder="100% or 400px"
            value={size.width || ''}
            onChange={(e) => onSizeChange({ ...size, width: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">MAX WIDTH</label>
          <input
            type="text"
            placeholder="1200px"
            value={size.maxWidth || ''}
            onChange={(e) => onSizeChange({ ...size, maxWidth: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">HEIGHT</label>
          <input
            type="text"
            placeholder="auto or 300px"
            value={size.height || ''}
            onChange={(e) => onSizeChange({ ...size, height: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">MIN HEIGHT</label>
          <input
            type="text"
            placeholder="200px"
            value={size.minHeight || ''}
            onChange={(e) => onSizeChange({ ...size, minHeight: e.target.value })}
            className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
          />
        </div>
      </div>
    </div>
  );
};
