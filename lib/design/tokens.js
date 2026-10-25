// @ts-check

/**
 * @typedef {{ size: number, lineHeight: number, letterSpacing: number, fontFamily: string, textTransform?: 'uppercase' | 'none' }} TypeRole
 * @typedef {{ bg: string, surface: string, surfaceMuted: string, surfaceRaised: string, text: string, textMuted: string, textSubtle: string, border: string, borderStrong: string, primary: string, onPrimary: string, primarySoft: string, primaryInk: string, success: string, successSoft: string, successInk: string, warning: string, warningSoft: string, warningInk: string, danger: string, dangerSoft: string, dangerInk: string, info: string, infoSoft: string, infoInk: string, scrim: string, have: string, partial: string, need: string, price: string, staple: string }} ColorTokens
 * @typedef {{ colors: { light: ColorTokens, dark: ColorTokens }, type: Record<string, TypeRole>, radius: { sm: number, md: number, lg: number, xl: number, full: number }, iconSize: { sm: number, md: number, lg: number, xl: number }, elevation: Record<string, { shadowColor: string, shadowOpacity: number, shadowRadius: number, shadowOffset: { width: number, height: number }, elevation: number }>, motion: { durations: Record<string, number>, curves: Record<string, readonly [number, number, number, number]>, springs: Record<string, { damping: number, stiffness: number, mass: number }>, press: { scale: number, opacity: number }, reducedMotion: { maxDuration: number } }, signature: { stickerRotation: { min: number, max: number }, stickerScale: { from: number, to: number } } }} DesignTokens
 */

const typeRoles = {
  'display-xl': { fontFamily: 'YoungSerif_400Regular', size: 34, lineHeight: 40, letterSpacing: -0.2 },
  'display-lg': { fontFamily: 'YoungSerif_400Regular', size: 28, lineHeight: 34, letterSpacing: -0.2 },
  'display-md': { fontFamily: 'YoungSerif_400Regular', size: 22, lineHeight: 28, letterSpacing: -0.1 },
  title: { fontFamily: 'DMSans_700Bold', size: 20, lineHeight: 26, letterSpacing: 0 },
  'body-lg': { fontFamily: 'DMSans_400Regular', size: 17, lineHeight: 24, letterSpacing: 0 },
  body: { fontFamily: 'DMSans_400Regular', size: 15, lineHeight: 22, letterSpacing: 0 },
  'body-strong': { fontFamily: 'DMSans_700Bold', size: 15, lineHeight: 22, letterSpacing: 0 },
  'body-sm': { fontFamily: 'DMSans_400Regular', size: 13, lineHeight: 18, letterSpacing: 0 },
  caption: { fontFamily: 'DMSans_500Medium', size: 12, lineHeight: 16, letterSpacing: 0 },
  label: { fontFamily: 'IBMPlexMono_500Medium', size: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  numeric: { fontFamily: 'IBMPlexMono_500Medium', size: 15, lineHeight: 20, letterSpacing: 0 },
  'numeric-sm': { fontFamily: 'IBMPlexMono_400Regular', size: 12, lineHeight: 16, letterSpacing: 0 },
};

/**
 * @param {Record<string, string>} base
 * @returns {ColorTokens}
 */
function withAliases(base) {
  return {
    ...base,
    have: base.success,
    partial: base.warning,
    need: base.primary,
    price: base.warning,
    staple: base.surfaceMuted,
  };
}

const colors = {
  light: withAliases({
    bg: '#F6F7F1',
    surface: '#FFFFFF',
    surfaceMuted: '#EDF0E8',
    surfaceRaised: '#FFFFFF',
    text: '#16211A',
    textMuted: '#5D6B61',
    textSubtle: '#7C887F',
    border: '#DCE3D8',
    borderStrong: '#C4CEC0',
    primary: '#E8482A',
    onPrimary: '#FFFFFF',
    primarySoft: '#FDE3DC',
    primaryInk: '#B2321A',
    success: '#2F8F4E',
    successSoft: '#DCEFE2',
    successInk: '#1E6A37',
    warning: '#F4C842',
    warningSoft: '#FCF3CF',
    warningInk: '#6B5200',
    danger: '#C8243B',
    dangerSoft: '#F9DDE1',
    dangerInk: '#A01D30',
    info: '#2D6FB7',
    infoSoft: '#DCE9F7',
    infoInk: '#1F528A',
    scrim: 'rgba(16,23,18,0.45)',
  }),
  dark: withAliases({
    bg: '#101712',
    surface: '#18221B',
    surfaceMuted: '#1F2B22',
    surfaceRaised: '#223026',
    text: '#EEF2EA',
    textMuted: '#9DAA9F',
    textSubtle: '#75827A',
    border: '#2A362D',
    borderStrong: '#3A483E',
    primary: '#FF6A4D',
    onPrimary: '#1A0F0B',
    primarySoft: '#3A1E17',
    primaryInk: '#FF9A85',
    success: '#5BC27C',
    successSoft: '#1C3324',
    successInk: '#8EDBA6',
    warning: '#F7D560',
    warningSoft: '#3A3216',
    warningInk: '#F7D560',
    danger: '#FF5C77',
    dangerSoft: '#3D1A21',
    dangerInk: '#FF8A9C',
    info: '#6FA8EA',
    infoSoft: '#182A3D',
    infoInk: '#A9CBF2',
    scrim: 'rgba(0,0,0,0.6)',
  }),
};

/** @type {DesignTokens} */
const tokens = {
  colors,
  type: typeRoles,
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 },
  iconSize: { sm: 16, md: 20, lg: 24, xl: 32 },
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      elevation: 0,
    },
    card: {
      shadowColor: colors.light.text,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    raised: {
      shadowColor: colors.light.text,
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    overlay: {
      shadowColor: colors.light.text,
      shadowOpacity: 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  },
  motion: {
    durations: { instant: 0, fast: 120, base: 220, slow: 360, deliberate: 520 },
    curves: {
      standard: [0.2, 0, 0, 1],
      enter: [0.05, 0.7, 0.1, 1],
      exit: [0.3, 0, 0.8, 0.15],
      linear: [0, 0, 1, 1],
    },
    springs: {
      snappy: { damping: 20, stiffness: 300, mass: 1 },
      smooth: { damping: 26, stiffness: 180, mass: 1 },
      bouncy: { damping: 12, stiffness: 180, mass: 1 },
    },
    press: { scale: 0.97, opacity: 0.9 },
    reducedMotion: { maxDuration: 120 },
  },
  signature: {
    stickerRotation: { min: -2, max: 2 },
    stickerScale: { from: 0.8, to: 1 },
  },
};

module.exports = tokens;
