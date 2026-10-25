import { TextInput as RNTextInput, View } from 'react-native';

import { useTheme } from '@/lib/theme';
import { Text } from './text';

export type InputProps = React.ComponentProps<typeof RNTextInput> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
};

export function Input({
  className,
  errorText,
  helperText,
  label,
  leadingIcon: LeadingIcon,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  return (
    <View className="w-full gap-1.5">
      {label && <Text variant="caption" tone="text">{label}</Text>}
      <View className="flex-row items-center rounded-full border border-border-strong bg-surface-muted px-3">
        {LeadingIcon && <LeadingIcon color={colors.textMuted} size={16} strokeWidth={2} />}
        <RNTextInput
          className={`h-10 min-w-0 flex-1 px-2 py-1 text-body text-text ${className ?? ''}`}
          placeholderTextColor="#7C887F"
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
