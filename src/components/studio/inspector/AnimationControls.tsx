import React, { useState } from 'react';
import { AnimationConfig, TransformConfig, HoverConfig } from '../../../types/portfolio';
import { RotateCcw } from 'lucide-react';

interface AnimationControlsProps {
  animation?: AnimationConfig;
  transform?: TransformConfig;
  hover?: HoverConfig;
  onAnimationChange: (anim: AnimationConfig) => void;
  onTransformChange: (tr: TransformConfig) => void;
  onHoverChange: (h: HoverConfig) => void;
  onReset?: () => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  animation = { entrance: 'none', duration: 300, delay: 0 },
  transform = { translateX: 0, translateY: 0, scale: 1, rotate: 0 },
  hover = {},
  onAnimationChange,
  onTransformChange,
  onHoverChange,
  onReset
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'entrance' | 'transform' | 'hover'>('entrance');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">Motion & Effects</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
            title="Reset Animation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Mini tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#090b10] border border-white/10 rounded-lg text-center text-[10px] font-mono">
        {(['entrance', 'transform', 'hover'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveSubtab(tab)}
            className={`py-1 rounded capitalize transition-colors ${
              activeSubtab === tab ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ENTRANCE TAB */}
      {activeSubtab === 'entrance' && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">ENTRANCE ANIMATION</label>
            <select
              value={animation.entrance || 'none'}
              onChange={(e) => onAnimationChange({ ...animation, entrance: e.target.value as any })}
              className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none"
            >
              <option value="none">None (Static)</option>
              <option value="fade">Fade In</option>
              <option value="fade-up">Fade Up</option>
              <option value="fade-down">Fade Down</option>
              <option value="fade-left">Fade Left</option>
              <option value="fade-right">Fade Right</option>
              <option value="scale">Scale Up</option>
              <option value="blur-reveal">Blur Reveal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">DURATION (MS)</label>
              <input
                type="number"
                step="50"
                min="100"
                max="3000"
                value={animation.duration ?? 400}
                onChange={(e) => onAnimationChange({ ...animation, duration: parseInt(e.target.value, 10) || 400 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">DELAY (MS)</label>
              <input
                type="number"
                step="50"
                min="0"
                max="2000"
                value={animation.delay ?? 0}
                onChange={(e) => onAnimationChange({ ...animation, delay: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TRANSFORM TAB */}
      {activeSubtab === 'transform' && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">TRANSLATE X (PX)</label>
              <input
                type="number"
                value={transform.translateX ?? 0}
                onChange={(e) => onTransformChange({ ...transform, translateX: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">TRANSLATE Y (PX)</label>
              <input
                type="number"
                value={transform.translateY ?? 0}
                onChange={(e) => onTransformChange({ ...transform, translateY: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">SCALE</label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="2"
                value={transform.scale ?? 1}
                onChange={(e) => onTransformChange({ ...transform, scale: parseFloat(e.target.value) || 1 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">ROTATE (DEG)</label>
              <input
                type="number"
                step="1"
                min="-180"
                max="180"
                value={transform.rotate ?? 0}
                onChange={(e) => onTransformChange({ ...transform, rotate: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* HOVER TAB */}
      {activeSubtab === 'hover' && (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">HOVER SCALE</label>
            <input
              type="number"
              step="0.02"
              min="0.8"
              max="1.5"
              value={hover.scale ?? 1.02}
              onChange={(e) => onHoverChange({ ...hover, scale: parseFloat(e.target.value) || 1.0 })}
              className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">HOVER TEXT COLOR</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hover.textColor || '#38bdf8'}
                onChange={(e) => onHoverChange({ ...hover, textColor: e.target.value })}
                className="w-6 h-6 rounded border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={hover.textColor || ''}
                placeholder="Inherit / #38bdf8"
                onChange={(e) => onHoverChange({ ...hover, textColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-500 mb-1">HOVER BG COLOR</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hover.backgroundColor || '#0284c7'}
                onChange={(e) => onHoverChange({ ...hover, backgroundColor: e.target.value })}
                className="w-6 h-6 rounded border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={hover.backgroundColor || ''}
                placeholder="Inherit / #0284c7"
                onChange={(e) => onHoverChange({ ...hover, backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
