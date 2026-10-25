import { Redirect, Stack } from 'expo-router';
import {
  ChefHat,
  ChevronRight,
  CircleCheck,
  Flame,
  Heart,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { NumberStepper, Stepper } from '@/components/ui/stepper';
import { ProgressMeter } from '@/components/ui/progress-meter';
import { Skeleton } from '@/components/ui/skeleton';
import { Sticker } from '@/components/ui/sticker';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { Text } from '@/components/ui/text';
import { useFeedback } from '@/components/feedback';
import { enterAnimation, exitAnimation, layoutTransition, useMotionPreferences } from '@/lib/design/motion';
import { tokens } from '@/lib/design';
import { useTheme } from '@/lib/theme';

const COLOR_NAMES = [
  'bg',
  'surface',
  'surfaceMuted',
  'surfaceRaised',
  'text',
  'textMuted',
  'textSubtle',
  'border',
  'borderStrong',
  'primary',
  'onPrimary',
  'primarySoft',
  'primaryInk',
  'success',
  'successSoft',
  'successInk',
  'warning',
  'warningSoft',
  'warningInk',
  'danger',
  'dangerSoft',
  'dangerInk',
  'info',
  'infoSoft',
  'infoInk',
] as const;

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View className="gap-3">
      <Text variant="label" tone="muted">{title}</Text>
      {children}
    </View>
  );
}

function Swatches() {
  const { scheme, colors } = useTheme();
  return (
    <View className="flex-row flex-wrap gap-2">
      {COLOR_NAMES.map((name) => (
        <View className="w-[30%] min-w-[102px] gap-1" key={name}>
          <View className="h-12 rounded-md border border-border-strong" style={{ backgroundColor: colors[name] }} />
          <Text variant="caption">{name}</Text>
          <Text variant="numeric-sm" tone="muted">{tokens.colors[scheme][name]}</Text>
        </View>
      ))}
    </View>
  );
}

function MotionPlayground() {
  const { toast, confirm, notify } = useFeedback();
  const [key, setKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const { reducedMotion } = useMotionPreferences();
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between rounded-md bg-surface-muted p-3">
        <View className="gap-1">
          <Text variant="body-strong">Reduced motion simulation</Text>
          <Text variant="caption" tone="muted">System preference: {reducedMotion ? 'on' : 'off'}</Text>
        </View>
        <Switch value={reduced} onValueChange={setReduced} />
      </View>
      <View className="min-h-20 items-center justify-center rounded-md bg-surface-muted">
        <Animated.View
          entering={enterAnimation(reduced)}
          exiting={exitAnimation(reduced)}
          layout={layoutTransition(reduced)}
          key={key}
          className="h-10 w-10 rounded-full bg-primary"
        />
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button size="sm" onPress={() => setKey((value) => value + 1)}><Text>Enter / exit</Text></Button>
        <Button size="sm" variant="secondary" onPress={() => toast({ message: 'Added 9 items to cart', action: { label: 'Undo', onPress: () => undefined }, tone: 'success' })}><Text>Toast</Text></Button>
        <Button size="sm" variant="outline" onPress={() => void confirm({ title: 'Clear pantry?', message: 'This removes every saved pantry item.', confirmLabel: 'Clear', destructive: true })}><Text>Confirm</Text></Button>
        <Button size="sm" variant="ghost" onPress={() => notify({ title: 'Sync complete', message: 'Your pantry is up to date.', tone: 'success' })}><Text>Notify</Text></Button>
      </View>
    </View>
  );
}

export default function DesignGuide() {
  const { colors, radius, scheme, type } = useTheme();
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', backgroundColor: colors.bg, padding: 20, paddingBottom: 64 }}
        nativeID="design-scroll"
        style={{ backgroundColor: colors.bg }}>
        <View className="w-full max-w-[620px] gap-8">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <View className="gap-1">
                <Text variant="label" tone="primary">WE&apos;RE COOKED! / FOUNDATION</Text>
                <Text variant="display-xl">Market Stall</Text>
              </View>
              <View className="items-end gap-1">
                <Text variant="caption" tone="muted">resolved scheme</Text>
                <Sticker label={scheme} tone="have" numeric={false} animate={false} />
              </View>
            </View>
            <Text variant="body-lg" tone="muted">The token and primitive workshop for the next screen migration.</Text>
          </View>

          <Section title="COLOR / semantic swatches">
            <Swatches />
          </Section>

          <Section title="TYPE / role ramp">
            <Card padding="md">
              <View className="gap-3">
                {Object.entries(type).map(([name, role]) => (
                  <View className="flex-row items-baseline justify-between gap-3" key={name}>
                    <Text variant={name as never}>{name}</Text>
                    <Text variant="numeric-sm" tone="muted">{role.size}/{role.lineHeight}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Section>

          <Section title="RADIUS / elevation / icons">
            <View className="flex-row flex-wrap gap-2">
              {Object.entries(radius).map(([name, value]) => (
                <View className="h-16 flex-1 min-w-[90px] items-center justify-center border border-border bg-surface" key={name} style={{ borderRadius: value }}>
                  <Text variant="caption">{name}</Text>
                  <Text variant="numeric-sm" tone="muted">{value}</Text>
                </View>
              ))}
            </View>
            <View className="flex-row items-center justify-around rounded-md bg-surface-muted p-4">
              <Icon icon={ChefHat} size="sm" tone="primary" />
              <Icon icon={Flame} size="md" tone="warning" />
              <Icon icon={Sparkles} size="lg" tone="success" />
              <Icon icon={Heart} size="xl" tone="danger" />
              <Text variant="caption" tone="muted">16 · 20 · 24 · 32</Text>
            </View>
          </Section>

          <Section title="BUTTON / all variants and states">
            <View className="flex-row flex-wrap gap-2">
              {(['primary', 'secondary', 'outline', 'ghost', 'danger', 'link'] as const).map((variant) => (
                <Button key={variant} variant={variant} size="sm"><Text>{variant}</Text></Button>
              ))}
              <Button size="sm" loading><Text>Loading</Text></Button>
              <Button size="sm" leadingIcon={Plus}><Text>Leading</Text></Button>
              <Button size="sm" trailingIcon={ChevronRight}><Text>Trailing</Text></Button>
            </View>
          </Section>

          <Section title="CARD / tones and elevation">
            <View className="gap-2">
              {(['default', 'muted', 'success', 'warning', 'danger', 'dashed'] as const).map((tone) => (
                <Card key={tone} tone={tone} elevation={tone === 'default' ? 'raised' : 'none'}>
                  <Text variant="body-strong">{tone} card</Text>
                  <Text variant="body-sm" tone="muted">16px padding · 12px default gap</Text>
                </Card>
              ))}
            </View>
          </Section>

          <Section title="STICKER / chip / badge">
            <View className="flex-row flex-wrap items-center gap-2">
              <Sticker label="4 HAVE" tone="have" />
              <Sticker label="1 PARTIAL" tone="partial" />
              <Sticker label="9 NEED" tone="need" />
              <Sticker label="$2.19" tone="price" numeric />
              <Chip label="Vegetarian" selected />
              <Chip label="Gluten-free" />
              <Badge variant="secondary"><Text>Legacy badge</Text></Badge>
            </View>
          </Section>

          <Section title="INPUT / feedback / status">
            <Card padding="md">
              <View className="gap-3">
                <Input label="Ingredient name" placeholder="Search your pantry" leadingIcon={Search} helperText="Use a simple ingredient name." />
                <Input label="Quantity" defaultValue="2 lb" errorText="Add a quantity." />
                <View className="flex-row items-center gap-3">
                  <Avatar label="CK" />
                  <SyncIndicator status="synced" />
                  <Text variant="caption">Synced</Text>
                  <SyncIndicator status="syncing" />
                  <SyncIndicator status="offline" />
                  <SyncIndicator status="error" />
                </View>
                <Notice title="Pantry synced" body="Your ingredients are ready for dinner." tone="success" action={{ label: 'View pantry', onPress: () => undefined }} />
                <Notice title="Something needs attention" body="We could not read this reel." tone="danger" dismiss={() => undefined} />
              </View>
            </Card>
          </Section>

          <Section title="PROGRESS / steppers / skeleton">
            <Card padding="md">
              <View className="gap-4">
                <ProgressMeter values={{ have: 4, partial: 1, need: 9 }} total={14} />
                <Stepper count={6} current={3} />
                <NumberStepper value={4} onDecrement={() => undefined} onIncrement={() => undefined} />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-12 w-full" />
              </View>
            </Card>
          </Section>

          <Section title="MOTION / feedback playground">
            <Card padding="md">
              <MotionPlayground />
            </Card>
          </Section>

          <View className="items-center gap-2 border-t border-border pt-5">
            <View className="flex-row items-center gap-2">
              <Icon icon={CircleCheck} size="sm" tone="success" />
              <Text variant="label" tone="muted">Token source is lib/design/tokens.js</Text>
            </View>
            <Text variant="caption" tone="subtle">Direction A · Market Stall · phase 1 foundation</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
