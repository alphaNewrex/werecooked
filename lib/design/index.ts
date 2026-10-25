export type ColorScheme = 'light' | 'dark';
export type ColorTokenName =
  | 'bg'
  | 'surface'
  | 'surfaceMuted'
  | 'surfaceRaised'
  | 'text'
  | 'textMuted'
  | 'textSubtle'
  | 'border'
  | 'borderStrong'
  | 'primary'
  | 'onPrimary'
  | 'primarySoft'
  | 'primaryInk'
  | 'success'
  | 'successSoft'
  | 'successInk'
  | 'warning'
  | 'warningSoft'
  | 'warningInk'
  | 'danger'
  | 'dangerSoft'
  | 'dangerInk'
  | 'info'
  | 'infoSoft'
  | 'infoInk'
  | 'scrim'
  | 'have'
  | 'partial'
  | 'need'
  | 'price'
  | 'staple';

export type DesignColors = Record<ColorTokenName, string>;
export type DesignTypeRole = {
  fontFamily: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'uppercase' | 'none';
};
export type DesignTokens = {
  colors: Record<ColorScheme, DesignColors>;
  type: Record<string, DesignTypeRole>;
  radius: { sm: number; md: number; lg: number; xl: number; full: number };
  iconSize: { sm: number; md: number; lg: number; xl: number };
  elevation: Record<string, {
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    shadowOffset: { width: number; height: number };
    elevation: number;
  }>;
  motion: {
    durations: Record<string, number>;
    curves: Record<string, readonly [number, number, number, number]>;
    springs: Record<string, { damping: number; stiffness: number; mass: number }>;
    press: { scale: number; opacity: number };
    reducedMotion: { maxDuration: number };
  };
  signature: {
    stickerRotation: { min: number; max: number };
    stickerScale: { from: number; to: number };
  };
};

// Keep the JavaScript token module as the sole value source.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const tokens = require('./tokens') as DesignTokens;
export const colors = tokens.colors;
export const type = tokens.type;
export const radius = tokens.radius;
export const iconSize = tokens.iconSize;
export const elevation = tokens.elevation;
export const motion = tokens.motion;

export function color(scheme: ColorScheme, name: ColorTokenName): string {
  return tokens.colors[scheme][name];
}
