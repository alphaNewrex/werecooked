import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import * as React from 'react';
import { Platform, Text as RNText } from 'react-native';

import { useTheme } from '@/lib/theme';

export type TextVariant =
  | 'default'
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'title'
  | 'body-lg'
  | 'body'
  | 'body-strong'
  | 'body-sm'
  | 'caption'
  | 'label'
  | 'numeric'
  | 'numeric-sm'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'blockquote'
  | 'code'
  | 'lead'
  | 'large'
  | 'small'
  | 'muted';

export type TextTone =
  | 'text'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'primary-ink'
  | 'success'
  | 'success-ink'
  | 'warning'
  | 'warning-ink'
  | 'danger'
  | 'danger-ink'
  | 'info'
  | 'info-ink'
  | 'on-primary';

const legacyVariants: Partial<Record<TextVariant, string>> = {
  h1: 'text-center',
  h2: 'border-border border-b pb-2',
  h3: '',
  h4: '',
  p: 'mt-3',
  blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
  code: 'bg-muted relative rounded px-1 py-0.5 font-mono',
  lead: 'text-muted-foreground',
  large: '',
  small: 'leading-none',
  muted: 'text-muted-foreground',
};

const toneToColor = {
  text: 'text',
  muted: 'textMuted',
  subtle: 'textSubtle',
  primary: 'primary',
  'primary-ink': 'primaryInk',
  success: 'success',
  'success-ink': 'successInk',
  warning: 'warning',
  'warning-ink': 'warningInk',
  danger: 'danger',
  'danger-ink': 'dangerInk',
  info: 'info',
  'info-ink': 'infoInk',
  'on-primary': 'onPrimary',
} as const;

export const TextClassContext = React.createContext<string | undefined>(undefined);

export function Text({
  className,
  style,
  asChild = false,
  variant = 'default',
  tone,
  ...props
}: React.ComponentProps<typeof RNText> & {
  asChild?: boolean;
  tone?: TextTone;
  variant?: TextVariant;
}) {
  const textClass = React.useContext(TextClassContext);
  const { colors, type } = useTheme();
  const role = type[variant];
  const Component = asChild ? Slot : RNText;
  const roleStyle = role
    ? {
        color: tone ? colors[toneToColor[tone]] : colors.text,
        fontFamily: role.fontFamily,
        fontSize: role.size,
        lineHeight: role.lineHeight,
        letterSpacing: role.letterSpacing,
        textTransform: role.textTransform,
      }
    : undefined;

  return (
    <Component
      className={cn(
        'text-text font-sans text-base',
        Platform.select({ web: 'select-text' }),
        legacyVariants[variant],
        textClass,
        className
      )}
      role={variant.startsWith('h') ? 'heading' : undefined}
      style={[roleStyle, style]}
      {...props}
    />
  );
}
