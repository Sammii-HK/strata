export type UiIconName = 'close' | 'check' | 'chevron-right' | 'chevron-left' | 'chevron-down' | 'list' | 'search' | 'minus' | 'plus' | 'expand' | 'pan' | 'world' | 'point';

export interface UiIconProps {
  name: UiIconName;
  size?: number;
}
