import React from 'react';
import { ElementStyleConfig, StudioViewport, SpacingSides, BorderCornerRadius } from '../types/portfolio';

export function resolveSpacingString(spacing?: SpacingSides): string | undefined {
  if (!spacing) return undefined;
  const { top, right, bottom, left, unit } = spacing;
  return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
}

export function resolveBorderRadiusString(radius?: BorderCornerRadius): string | undefined {
  if (!radius) return undefined;
  const { topLeft, topRight, bottomRight, bottomLeft, unit } = radius;
  return `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`;
}

export function resolveBoxShadow(shadow?: ElementStyleConfig['shadow']): string | undefined {
  if (!shadow || shadow.preset === 'none') return undefined;
  if (shadow.preset === 'soft') {
    return '0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 2px 6px -1px rgba(0, 0, 0, 0.15)';
  }
  if (shadow.preset === 'medium') {
    return '0 10px 30px -4px rgba(0, 0, 0, 0.4), 0 4px 10px -2px rgba(0, 0, 0, 0.25)';
  }
  if (shadow.preset === 'strong') {
    return '0 20px 50px -6px rgba(0, 0, 0, 0.6), 0 8px 16px -3px rgba(0, 0, 0, 0.35)';
  }
  if (shadow.preset === 'custom') {
    const { x = 0, y = 4, blur = 16, spread = 0, color = '#000000', opacity = 0.3 } = shadow;
    // convert hex to rgba or use opacity
    return `${x}px ${y}px ${blur}px ${spread}px rgba(0, 0, 0, ${opacity})`;
  }
  return undefined;
}

export function resolveBackground(bg?: ElementStyleConfig['background']): {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
} {
  if (!bg || bg.type === 'transparent') {
    return { backgroundColor: 'transparent' };
  }
  if (bg.type === 'color' && bg.color) {
    return { backgroundColor: bg.color };
  }
  if (bg.type === 'gradient' && bg.gradient) {
    const { angle = 135, from = '#0f172a', to = '#0284c7' } = bg.gradient;
    return {
      backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})`
    };
  }
  if (bg.type === 'image' && bg.image?.url) {
    return {
      backgroundImage: `url(${bg.image.url})`,
      backgroundSize: bg.image.size || 'cover',
      backgroundPosition: bg.image.position || 'center',
      backgroundRepeat: bg.image.repeat || 'no-repeat'
    };
  }
  return {};
}

/**
 * Resolves full CSS Properties object considering responsive viewport inheritance
 */
export function resolveElementStyles(
  styleConfig?: ElementStyleConfig,
  viewport: StudioViewport = 'desktop',
  isHovered: boolean = false
): React.CSSProperties {
  if (!styleConfig) return {};

  // Check inheritance
  const overrides =
    viewport === 'mobile'
      ? styleConfig.mobileOverrides || styleConfig.tabletOverrides
      : viewport === 'tablet'
      ? styleConfig.tabletOverrides
      : undefined;

  // Merge base and responsive overrides
  const effectiveTypography = {
    ...styleConfig.typography,
    ...overrides?.typography
  };

  const effectiveMargin = overrides?.margin || styleConfig.margin;
  const effectivePadding = overrides?.padding || styleConfig.padding;
  const effectiveSize = { ...styleConfig.size, ...overrides?.size };
  const effectiveLayout = { ...styleConfig.layout, ...overrides?.layout };

  const bgStyles = resolveBackground(styleConfig.background);
  const shadowValue = resolveBoxShadow(styleConfig.shadow);
  const borderRadiusValue = resolveBorderRadiusString(styleConfig.border?.radius);

  let transformValue: string | undefined = undefined;
  if (styleConfig.transform) {
    const { translateX = 0, translateY = 0, scale = 1, rotate = 0 } = styleConfig.transform;
    const parts = [];
    if (translateX !== 0 || translateY !== 0) parts.push(`translate(${translateX}px, ${translateY}px)`);
    if (scale !== 1) parts.push(`scale(${scale})`);
    if (rotate !== 0) parts.push(`rotate(${rotate}deg)`);
    if (parts.length > 0) transformValue = parts.join(' ');
  }

  // Hover overrides
  if (isHovered && styleConfig.hover) {
    if (styleConfig.hover.scale && styleConfig.hover.scale !== 1) {
      transformValue = `${transformValue ? transformValue + ' ' : ''}scale(${styleConfig.hover.scale})`;
    }
  }

  const styles: React.CSSProperties = {
    // Spacing
    margin: resolveSpacingString(effectiveMargin),
    padding: resolveSpacingString(effectivePadding),

    // Size
    width: effectiveSize.width,
    minWidth: effectiveSize.minWidth,
    maxWidth: effectiveSize.maxWidth,
    height: effectiveSize.height,
    minHeight: effectiveSize.minHeight,
    maxHeight: effectiveSize.maxHeight,

    // Typography
    fontFamily: effectiveTypography.fontFamily,
    fontSize: effectiveTypography.fontSize,
    fontWeight: effectiveTypography.fontWeight as any,
    lineHeight: effectiveTypography.lineHeight,
    letterSpacing: effectiveTypography.letterSpacing,
    color: isHovered && styleConfig.hover?.textColor ? styleConfig.hover.textColor : effectiveTypography.color,
    textAlign: effectiveTypography.textAlign,
    textTransform: effectiveTypography.textTransform,
    textDecoration: effectiveTypography.textDecoration,

    // Layout
    display: effectiveLayout.display,
    flexDirection: effectiveLayout.flexDirection,
    justifyContent: effectiveLayout.justifyContent,
    alignItems: effectiveLayout.alignItems,
    flexWrap: effectiveLayout.flexWrap,
    gap: effectiveLayout.gap,
    overflow: effectiveLayout.overflow,

    // Position
    position: styleConfig.position?.position,
    top: styleConfig.position?.top,
    right: styleConfig.position?.right,
    bottom: styleConfig.position?.bottom,
    left: styleConfig.position?.left,
    zIndex: styleConfig.position?.zIndex,

    // Background
    ...bgStyles,
    backgroundColor:
      isHovered && styleConfig.hover?.backgroundColor
        ? styleConfig.hover.backgroundColor
        : bgStyles.backgroundColor,

    // Border
    borderStyle: styleConfig.border?.style !== 'none' ? styleConfig.border?.style : undefined,
    borderWidth: styleConfig.border?.width,
    borderColor:
      isHovered && styleConfig.hover?.borderColor
        ? styleConfig.hover.borderColor
        : styleConfig.border?.color,
    borderRadius: borderRadiusValue,

    // Shadow & Opacity
    boxShadow: isHovered && styleConfig.hover?.shadow ? styleConfig.hover.shadow : shadowValue,
    opacity: styleConfig.opacity,
    backdropFilter: styleConfig.backdropBlur ? `blur(${styleConfig.backdropBlur})` : undefined,

    // Transform
    transform: transformValue,
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  // Clean undefined keys
  Object.keys(styles).forEach((key) => {
    if ((styles as any)[key] === undefined) {
      delete (styles as any)[key];
    }
  });

  return styles;
}

/**
 * Checks if the element is configured to be visible in the current viewport
 */
export function isElementVisibleInViewport(
  styleConfig?: ElementStyleConfig,
  viewport: StudioViewport = 'desktop'
): boolean {
  if (!styleConfig?.visibility) return true;
  return styleConfig.visibility[viewport] !== false;
}
