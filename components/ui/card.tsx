import { Platform, View, type ViewProps } from 'react-native';

import { tokens } from '@/lib/design';
import { useTheme } from '@/lib/theme';
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
  style,
  tone = 'default',
  ...props
}: CardProps) {
  const { colors } = useTheme();
  const classes = `rounded-lg border ${toneClass[tone]} ${paddingClass[padding]} ${className ?? ''}`;
  const elevationToken = elevation === 'none' ? undefined : tokens.elevation[elevation];
  const elevationStyle = elevationToken
    ? Platform.OS === 'web'
      ? ({ boxShadow: `0 ${elevationToken.shadowOffset.height}px ${elevationToken.shadowRadius}px ${colors.text}1A` } as object)
      : {
          shadowColor: colors.text,
          shadowOpacity: elevationToken.shadowOpacity,
          shadowRadius: elevationToken.shadowRadius,
          shadowOffset: elevationToken.shadowOffset,
          elevation: elevationToken.elevation,
        }
    : undefined;
  return (
    <TextClassContext.Provider value="text-text">
      {onPress ? (
        <Pressable className={classes} onPress={onPress} style={[elevationStyle, style]} {...props} />
      ) : (
        <View className={classes} style={[elevationStyle, style]} {...props} />
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
