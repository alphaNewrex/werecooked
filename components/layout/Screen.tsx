import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export function Screen({
  children,
  footer,
  scroll = true,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}) {
  const { colors } = useTheme();
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-6 px-5 pb-8"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1">{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {content}
      {footer && <View className="absolute inset-x-0 bottom-0 z-10 border-t border-border" style={{ backgroundColor: colors.bg }}>{footer}</View>}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  actions,
  eyebrow,
  meta,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <View className="flex-row items-baseline justify-between gap-3">
      <View className="min-w-0 flex-1 gap-1">
        {eyebrow && <TextLabel>{eyebrow}</TextLabel>}
        <TextDisplay>{title}</TextDisplay>
        {subtitle && <TextBody>{subtitle}</TextBody>}
      </View>
      {meta ?? actions}
    </View>
  );
}

function TextLabel({ children }: { children: string }) {
  const { colors } = useTheme();
  return <Text variant="label" style={{ color: colors.textMuted }}>{children}</Text>;
}

function TextDisplay({ children }: { children: string }) {
  return <Text variant="display-xl">{children}</Text>;
}

function TextBody({ children }: { children: string }) {
  return <Text variant="body" tone="muted">{children}</Text>;
}
