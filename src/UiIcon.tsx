import type { UiIconProps } from './UiIcon.types';

// Native compatibility only. These are the existing native text characters,
// kept inside their existing RN Text/style context. Metro selects UiIcon.web
// for the web UI. This batch does not certify or migrate the native interface.
const nativeCharacters = {
  close: '✕', check: '✓', 'chevron-right': '›', 'chevron-left': '‹',
  'chevron-down': '▾', list: '☰', search: '⌕', minus: '–', plus: '+',
  expand: '⤢', pan: '↔', world: '◐', point: '○',
} as const;

export default function UiIcon({ name }: UiIconProps) {
  return nativeCharacters[name];
}
