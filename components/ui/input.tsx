import { useState } from 'react';
import { TextInput as RNTextInput, View } from 'react-native';

import { useTheme } from '@/lib/theme';
import { Text } from './text';

export type InputProps = React.ComponentPropsWithRef<typeof RNTextInput> & {
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
  const [focused, setFocused] = useState(false);
  return (
    <View className={`min-w-0 w-full gap-1.5 ${className ?? ''}`}>
      {label && <Text variant="caption" tone="text">{label}</Text>}
      <View className={`flex-row items-center rounded-full border bg-surface-muted px-3 ${focused ? 'border-primary' : 'border-border-strong'}`}>
        {LeadingIcon && <LeadingIcon color={colors.textMuted} size={16} strokeWidth={2} />}
        <RNTextInput
          className={`h-10 min-w-0 flex-1 px-2 py-1 text-text outline-none ${mono ? 'font-mono' : 'font-sans'}`}
          placeholderTextColor={colors.textSubtle}
          {...props}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
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
