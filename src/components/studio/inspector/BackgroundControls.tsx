import React from 'react';
import { BackgroundConfig } from '../../../types/portfolio';
import { RotateCcw, Upload, Image as ImageIcon } from 'lucide-react';
import { PORTFOLIO_IMAGE_ACCEPT, uploadLocalFile } from '../../../utils/fileUploadHelper';

interface BackgroundControlsProps {
  value?: BackgroundConfig;
  onChange: (value: BackgroundConfig) => void;
  onReset?: () => void;
}

export const BackgroundControls: React.FC<BackgroundControlsProps> = ({
  value = { type: 'transparent' },
  onChange,
  onReset
}) => {
  const currentType = value.type || 'transparent';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 uppercase">Background</span>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="p-1 rounded text-slate-500 hover:text-slate-300"
            title="Reset Background"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Type Selector Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#090b10] border border-white/10 rounded-lg text-center text-[10px] font-mono">
        {(['transparent', 'color', 'gradient', 'image'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...value, type: t })}
            className={`py-1 rounded capitalize transition-colors ${
              currentType === t ? 'bg-sky-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'transparent' ? 'None' : t}
          </button>
        ))}
      </div>

      {/* Solid Color */}
      {currentType === 'color' && (
        <div>
          <label className="block text-[10px] font-mono text-slate-500 mb-1">COLOR</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.color || '#0f172a'}
              onChange={(e) => onChange({ ...value, type: 'color', color: e.target.value })}
              className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={value.color || '#0f172a'}
              onChange={(e) => onChange({ ...value, type: 'color', color: e.target.value })}
              className="flex-1 px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {currentType === 'gradient' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">FROM</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={value.gradient?.from || '#090b10'}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      type: 'gradient',
                      gradient: {
                        angle: value.gradient?.angle ?? 135,
                        type: 'linear',
                        from: e.target.value,
                        to: value.gradient?.to || '#0284c7'
                      }
                    })
                  }
                  className="w-6 h-6 rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={value.gradient?.from || '#090b10'}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      type: 'gradient',
                      gradient: {
                        angle: value.gradient?.angle ?? 135,
                        type: 'linear',
                        from: e.target.value,
                        to: value.gradient?.to || '#0284c7'
                      }
                    })
                  }
                  className="w-full px-1.5 py-0.5 bg-[#090b10] border border-white/10 rounded text-[11px] text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">TO</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={value.gradient?.to || '#0284c7'}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      type: 'gradient',
                      gradient: {
                        angle: value.gradient?.angle ?? 135,
                        type: 'linear',
                        from: value.gradient?.from || '#090b10',
                        to: e.target.value
                      }
                    })
                  }
                  className="w-6 h-6 rounded border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={value.gradient?.to || '#0284c7'}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      type: 'gradient',
                      gradient: {
                        angle: value.gradient?.angle ?? 135,
                        type: 'linear',
                        from: value.gradient?.from || '#090b10',
                        to: e.target.value
                      }
                    })
                  }
                  className="w-full px-1.5 py-0.5 bg-[#090b10] border border-white/10 rounded text-[11px] text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>ANGLE</span>
              <span>{value.gradient?.angle ?? 135}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={value.gradient?.angle ?? 135}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: 'gradient',
                  gradient: {
                    type: 'linear',
                    angle: parseInt(e.target.value, 10),
                    from: value.gradient?.from || '#090b10',
                    to: value.gradient?.to || '#0284c7'
                  }
                })
              }
              className="w-full accent-sky-400"
            />
          </div>
        </div>
      )}

      {/* Image */}
      {currentType === 'image' && (
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-slate-500">BACKGROUND IMAGE</label>
              <label className="flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Gallery Pick</span>
                <input
                  type="file"
                  accept={PORTFOLIO_IMAGE_ACCEPT}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = '';
                  }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await uploadLocalFile(file, {
                          name: 'Background Image'
                        });
                        onChange({
                          ...value,
                          type: 'image',
                          image: {
                            url: result.url,
                            size: value.image?.size || 'cover',
                            position: value.image?.position || 'center',
                            repeat: value.image?.repeat || 'no-repeat',
                            attachment: value.image?.attachment || 'scroll'
                          }
                        });
                      } catch (err) {
                        console.error('Background image upload failed:', err);
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="https://... or choose photo above"
              value={value.image?.url || ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: 'image',
                  image: {
                    url: e.target.value,
                    size: value.image?.size || 'cover',
                    position: value.image?.position || 'center',
                    repeat: value.image?.repeat || 'no-repeat',
                    attachment: value.image?.attachment || 'scroll'
                  }
                })
              }
              className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white font-mono outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">SIZE</label>
              <select
                value={value.image?.size || 'cover'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    type: 'image',
                    image: {
                      ...value.image!,
                      size: e.target.value
                    }
                  })
                }
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 mb-1">POSITION</label>
              <select
                value={value.image?.position || 'center'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    type: 'image',
                    image: {
                      ...value.image!,
                      position: e.target.value
                    }
                  })
                }
                className="w-full px-2 py-1 bg-[#090b10] border border-white/10 rounded text-xs text-white outline-none"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
