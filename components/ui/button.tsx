import { ActivityIndicator } from 'react-native';
import type { ComponentType, ReactNode } from 'react';

import { useTheme } from '@/lib/theme';

import { Pressable, type PressableProps } from './pressable';
import { TextClassContext } from './text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link' | 'default' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'default' | 'icon';
type ButtonIcon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ButtonIcon;
  trailingIcon?: ButtonIcon;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  default: 'bg-primary',
  secondary: 'border border-border bg-surface-muted',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
  destructive: 'bg-danger',
  link: 'bg-transparent',
};

const textClass: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  default: 'text-on-primary',
  secondary: 'text-text',
  outline: 'text-text',
  ghost: 'text-text',
  danger: 'text-on-primary',
  destructive: 'text-on-primary',
  link: 'text-primary underline',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3',
  md: 'min-h-10 px-4',
  default: 'min-h-10 px-4',
  lg: 'min-h-12 px-6',
  icon: 'h-10 w-10',
};

export function Button({
  children,
  className,
  disabled,
  fullWidth,
  leadingIcon: LeadingIcon,
  loading = false,
  size = 'md',
  trailingIcon: TrailingIcon,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const normalizedVariant = variant === 'default' ? 'primary' : variant === 'destructive' ? 'danger' : variant;
  const iconColor = normalizedVariant === 'primary' || normalizedVariant === 'danger' ? colors.onPrimary : colors.text;
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <TextClassContext.Provider value={`${textClass[variant]} font-sans-bold`}>
      <Pressable
        accessibilityRole="button"
        className={`flex-row items-center justify-center gap-2 rounded-full ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
        disabled={disabled || loading}
        haptic="light"
        {...props}>
        {loading ? (
          <ActivityIndicator color={normalizedVariant === 'primary' || normalizedVariant === 'danger' ? colors.onPrimary : colors.text} size="small" />
        ) : (
          <>
            {LeadingIcon && <LeadingIcon color={iconColor} size={iconSize} strokeWidth={2} />}
            {children}
            {TrailingIcon && <TrailingIcon color={iconColor} size={iconSize} strokeWidth={2} />}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export const buttonVariants = () => '';
export const buttonTextVariants = () => '';
