import { TextInput as RNTextInput, View } from 'react-native';

import { useTheme } from '@/lib/theme';
import { Text } from './text';

export type InputProps = React.ComponentProps<typeof RNTextInput> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  mono?: boolean;
};

export function Input({
  className,
  errorText,
  helperText,
  label,
  leadingIcon: LeadingIcon,
  mono = false,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  return (
    <View className={`min-w-0 w-full gap-1.5 ${className ?? ''}`}>
      {label && <Text variant="caption" tone="text">{label}</Text>}
      <View className="flex-row items-center rounded-full border border-border-strong bg-surface-muted px-3">
        {LeadingIcon && <LeadingIcon color={colors.textMuted} size={16} strokeWidth={2} />}
        <RNTextInput
          className={`h-10 min-w-0 flex-1 px-2 py-1 text-text ${mono ? 'font-mono' : 'font-sans'}`}
          placeholderTextColor={colors.textSubtle}
          {...props}
        />
      </View>
      {(errorText || helperText) && (
        <Text variant="caption" tone={errorText ? 'danger-ink' : 'muted'}>
          {errorText ?? helperText}
        </Text>
      )}
    </View>
  );
}
