import { View } from 'react-native';

import { TextClassContext } from './text';
import { Sticker, type StickerTone } from './sticker';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type BadgeProps = React.ComponentProps<typeof View> & {
  variant?: BadgeVariant;
  tone?: StickerTone;
  label?: string;
  asChild?: boolean;
};

export function Badge({ children, className, label, tone, variant = 'default', ...props }: BadgeProps) {
  const resolvedTone: StickerTone = tone ?? (
    variant === 'destructive' ? 'danger' : variant === 'secondary' ? 'staple' : variant === 'outline' ? 'staple' : 'primary'
  );
  const variantClass = variant === 'outline'
    ? 'border border-border bg-transparent'
    : variant === 'secondary'
      ? 'border border-transparent bg-surface-muted'
      : variant === 'destructive'
        ? 'border border-transparent bg-danger'
        : 'border border-transparent bg-primary';
  return (
    <TextClassContext.Provider value="text-label">
      <View className={`shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-full px-2 py-0.5 ${variantClass} ${className ?? ''}`} {...props}>
        {label ? <Sticker label={label} tone={resolvedTone} animate={false} /> : children}
      </View>
    </TextClassContext.Provider>
  );
}

export const badgeVariants = () => '';
export const badgeTextVariants = () => '';
