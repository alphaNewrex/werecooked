import type { ComponentType } from 'react';

import { IconButton, type IconButtonProps } from './icon-button';

export type FABProps = Omit<IconButtonProps, 'size'> & {
  icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export function FAB({ className, ...props }: FABProps) {
  return <IconButton className={`bg-primary shadow-lg ${className ?? ''}`} size="lg" {...props} />;
}
