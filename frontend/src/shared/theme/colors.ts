/** WOKY palette from docs/UX_DESIGN_SYSTEM.md, plus tints and text-safe variants. */
export const colors = {
  brand: '#FF5B45',
  brandDark: '#ED4934',
  /** Orange that passes 4.5:1 on white for small text (prices, links). */
  brandText: '#C2361C',
  /** Darker fill behind white button labels. */
  brandStrong: '#D9402A',
  brandSoft: '#FFEDE8',
  header: '#353535',
  ink: '#202020',
  muted: '#6B6B6B',
  surface: '#FFFFFF',
  soft: '#F6F7F8',
  line: '#E8E8E8',
  danger: '#D84636',
  dangerSoft: '#FDECEA',
  success: '#2E7D32',
  successSoft: '#E6F4EA',
  warning: '#F9A825',
  warningText: '#8A5A00',
  warningSoft: '#FFF4DC',
  info: '#2F80ED',
  infoText: '#1F5FB8',
  infoSoft: '#E8F1FD',
  star: '#E8A317',
  overlay: 'rgba(0,0,0,0.35)',
};

export type AppColor = keyof typeof colors;
