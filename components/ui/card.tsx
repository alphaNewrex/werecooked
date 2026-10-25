import { View, type ViewProps } from 'react-native';

import { Pressable, type PressableProps } from './pressable';
import { Text, TextClassContext } from './text';

type CardTone = 'default' | 'muted' | 'success' | 'warning' | 'danger' | 'dashed';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = Omit<ViewProps, 'onTouchEnd'> & {
  tone?: CardTone;
  padding?: CardPadding;
  elevation?: 'none' | 'card' | 'raised' | 'overlay';
  onPress?: PressableProps['onPress'];
};

const toneClass: Record<CardTone, string> = {
  default: 'border-border bg-surface',
  muted: 'border-border bg-surface-muted',
  success: 'border-success bg-success-soft',
  warning: 'border-warning bg-warning-soft',
  danger: 'border-danger bg-danger-soft',
  dashed: 'border-border border-dashed bg-transparent',
};

const paddingClass: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  className,
  elevation = 'card',
  onPress,
  padding = 'md',
  tone = 'default',
  ...props
}: CardProps) {
  const classes = `rounded-lg border ${toneClass[tone]} ${paddingClass[padding]} ${elevation === 'none' ? '' : 'shadow-sm'} ${className ?? ''}`;
  return (
    <TextClassContext.Provider value="text-text">
      {onPress ? (
        <Pressable className={classes} onPress={onPress} {...props} />
      ) : (
        <View className={classes} {...props} />
      )}
    </TextClassContext.Provider>
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return <View className={`gap-1.5 ${className ?? ''}`} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="title" {...props} className={`text-text ${className ?? ''}`} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text variant="body-sm" tone="muted" {...props} className={className} />;
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={className} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return <View className={`flex-row items-center ${className ?? ''}`} {...props} />;
}
