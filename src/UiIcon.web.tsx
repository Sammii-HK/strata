import { Check, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Expand, Layers, List, Minus, MoveHorizontal, Plus, Search, X, type LucideIcon } from 'lucide-react';
import type { UiIconName, UiIconProps } from './UiIcon.types';

const components: Record<UiIconName, LucideIcon> = {
  close: X, check: Check, 'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft, 'chevron-down': ChevronDown,
  list: List, search: Search, minus: Minus, plus: Plus,
  expand: Expand, pan: MoveHorizontal, world: Layers, point: CircleDot,
};

export default function UiIcon({ name, size = 14 }: UiIconProps) {
  const Icon = components[name];
  return <Icon size={size} color="currentColor" aria-hidden="true" focusable="false" style={{ verticalAlign: 'middle', flexShrink: 0 }} />;
}
