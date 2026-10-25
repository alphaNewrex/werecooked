import { useFonts } from 'expo-font';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChefHat,
  CircleCheck,
  Clock3,
  Flame,
  Gauge,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Timer,
  Trash2,
  UsersRound,
  X,
  Zap,
} from 'lucide-react-native';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  BricolageGrotesque_800ExtraBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Shrikhand_400Regular } from '@expo-google-fonts/shrikhand';
import { Unbounded_700Bold } from '@expo-google-fonts/unbounded';

import { directionA } from '@/lib/design/directions/a';
import { directionB } from '@/lib/design/directions/b';
import { directionC } from '@/lib/design/directions/c';
import type { DirectionColors, DirectionTokens, SpringConfig } from '@/lib/design/directions/a';

type DirectionId = 'a' | 'b' | 'c';
type Mode = 'light' | 'dark';
type Tone = 'have' | 'partial' | 'need' | 'staple';

const DIRECTIONS = {
  a: directionA,
  b: directionB,
  c: directionC,
} satisfies Record<DirectionId, DirectionTokens>;

const JOB_STAGES = [
  'Finding the reel ingredients…',
  'Watching the cooking steps…',
  "Reading the creator's comments…",
  'Matching your pantry…',
  'Checking quantities…',
  'Plating the answer…',
];

const RECIPE_INGREDIENTS: {
  name: string;
  amount: string;
  note: string;
  tone: Tone;
}[] = [
  { name: 'Chicken breast', amount: '2 lb', note: 'In pantry', tone: 'have' },
  {
    name: 'All-purpose flour',
    amount: '2 cups',
    note: 'Have ½ cup · buy 1½ cups',
    tone: 'partial',
  },
  { name: 'Cornstarch', amount: '½ cup', note: 'Kroger $2.19 · 16 oz box', tone: 'need' },
  { name: 'Salt', amount: 'to taste', note: 'Kitchen staple', tone: 'staple' },
];

const fontAssets = {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_700Bold,
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_700Bold,
  Shrikhand_400Regular,
  Unbounded_700Bold,
};

function isDirection(value: string | undefined): value is DirectionId {
  return value === 'a' || value === 'b' || value === 'c';
}

function isMode(value: string | undefined): value is Mode {
  return value === 'light' || value === 'dark';
}

function alpha(hex: string, opacity: number) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function springFor(tokens: DirectionTokens) {
  return Object.values(tokens.motion)[0];
}

function LoadingScreen({ colors }: { colors: DirectionColors }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Sparkles color={colors.primary} size={24} />
      <Text style={{ color: colors.ink, fontFamily: 'DMSans_700Bold', marginTop: 12 }}>
        Warming up the kitchen…
      </Text>
    </View>
  );
}

function PressScale({
  children,
  onPress,
  style,
  spring,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
  spring: SpringConfig;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.965, spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, spring);
      }}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

function SectionLabel({
  children,
  colors,
  tokens,
}: {
  children: ReactNode;
  colors: DirectionColors;
  tokens: DirectionTokens;
}) {
  return (
    <Text
      style={{
        color: colors.muted,
        fontFamily: tokens.fonts.mono,
        fontSize: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
      }}>
      {children}
    </Text>
  );
}

function ModeToggle({
  colors,
  mode,
  setMode,
  tokens,
}: {
  colors: DirectionColors;
  mode: Mode;
  setMode: (mode: Mode) => void;
  tokens: DirectionTokens;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: alpha(colors.surface, 0.82),
        borderColor: colors.border,
        borderRadius: tokens.shape.controlRadius,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 3,
      }}>
      {(['light', 'dark'] as const).map((item) => {
        const selected = mode === item;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            onPress={() => setMode(item)}
            style={{
              backgroundColor: selected ? colors.ink : 'transparent',
              borderRadius: tokens.shape.controlRadius,
              paddingHorizontal: 11,
              paddingVertical: 7,
            }}>
            <Text
              style={{
                color: selected ? colors.bg : colors.muted,
                fontFamily: tokens.fonts.bodyMedium,
                fontSize: 11,
              }}>
              {item === 'light' ? 'Day' : 'Night'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DirectionPicker({
  colors,
  selected,
  setSelected,
  tokens,
}: {
  colors: DirectionColors;
  selected: DirectionId;
  setSelected: (direction: DirectionId) => void;
  tokens: DirectionTokens;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: alpha(colors.surface, 0.82),
        borderColor: colors.border,
        borderRadius: tokens.shape.controlRadius,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 3,
      }}>
      {(['a', 'b', 'c'] as const).map((item) => {
        const selectedItem = selected === item;
        return (
          <Pressable
            key={item}
            accessibilityRole="button"
            onPress={() => setSelected(item)}
            style={{
              alignItems: 'center',
              backgroundColor: selectedItem ? colors.primary : 'transparent',
              borderRadius: tokens.shape.controlRadius,
              minWidth: 38,
              paddingHorizontal: 10,
              paddingVertical: 7,
            }}>
            <Text
              style={{
                color: selectedItem ? '#FFFFFF' : colors.muted,
                fontFamily: tokens.fonts.mono,
                fontSize: 11,
                fontWeight: '700',
              }}>
              {item.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Sticker({
  children,
  color,
  rotation = 0,
  style,
  textColor = '#16211A',
  tokens,
}: {
  children: ReactNode;
  color: string;
  rotation?: number;
  style?: object;
  textColor?: string;
  tokens: DirectionTokens;
}) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: color,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
        transform: [{ rotate: `${rotation}deg` }],
        ...style,
      }}>
      <Text
        numberOfLines={1}
        style={{
          color: textColor,
          fontFamily: tokens.fonts.mono,
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 0.15,
        }}>
        {children}
      </Text>
    </View>
  );
}

function SegmentedRing({
  colors,
  progress,
  progressColor = colors.primary,
  size = 64,
  showValue = true,
  strokeWidth = 6,
  tokens,
}: {
  colors: DirectionColors;
  progress: number;
  progressColor?: string;
  size?: number;
  showValue?: boolean;
  strokeWidth?: number;
  tokens: DirectionTokens;
}) {
  const center = size / 2;
  const radius = size / 2 - 7;
  const segmentCount = 12;
  const segmentAngle = (Math.PI * 2) / segmentCount;
  const filledSegments = Math.round(progress * segmentCount);
  return (
    <View style={{ height: size, width: size }}>
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        {Array.from({ length: segmentCount }, (_, index) => {
          const gap = 0.08;
          const start = -Math.PI / 2 + index * segmentAngle + gap;
          const end = -Math.PI / 2 + (index + 1) * segmentAngle - gap;
          const startX = center + Math.cos(start) * radius;
          const startY = center + Math.sin(start) * radius;
          const endX = center + Math.cos(end) * radius;
          const endY = center + Math.sin(end) * radius;
          return (
            <Path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
              key={index}
              fill="none"
              stroke={index < filledSegments ? progressColor : colors.border}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
            />
          );
        })}
      </Svg>
      {showValue && (
        <View
          style={{
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}>
          <Text style={{ color: colors.ink, fontFamily: tokens.fonts.mono, fontSize: 12, fontWeight: '700' }}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
}

function BurnerMeter({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
      <SegmentedRing colors={colors} progress={0.72} size={66} tokens={tokens} />
      <View style={{ gap: 3 }}>
        <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 12 }}>
          Pantry match
        </Text>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 11 }}>
          4 have · 1 partial · 9 need
        </Text>
      </View>
    </View>
  );
}

function HeatMeter({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  return (
    <View
      style={{
        backgroundColor: alpha(colors.primary, 0.09),
        borderColor: alpha(colors.primary, 0.18),
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 12,
        padding: 12,
      }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Flame color={colors.primary} fill={colors.primary} size={27} />
      </View>
      <View style={{ flex: 1, gap: 7 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 12 }}>
            How cooked are we?
          </Text>
          <Text style={{ color: colors.primary, fontFamily: tokens.fonts.mono, fontSize: 10 }}>72°</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {Array.from({ length: 8 }, (_, index) => (
            <View
              key={index}
              style={{
                backgroundColor: index < 6 ? colors.primary : colors.border,
                borderRadius: 4,
                flex: 1,
                height: 8,
              }}
            />
          ))}
        </View>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 10 }}>
          Almost dinner. Keep the pan hot.
        </Text>
      </View>
    </View>
  );
}

function RecipeCard({
  colors,
  tokens,
}: {
  colors: DirectionColors;
  tokens: DirectionTokens;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: tokens.shape.cardRadius,
        borderWidth: 1,
        gap: 18,
        padding: 18,
      }}>
      <View style={{ alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, gap: 8, paddingRight: 14 }}>
          <SectionLabel colors={colors} tokens={tokens}>
            Tonight&apos;s move
          </SectionLabel>
          <Text
            style={{
              color: colors.ink,
              fontFamily: tokens.fonts.display,
              fontSize: tokens.id === 'b' ? 20 : 25,
              lineHeight: tokens.id === 'b' ? 28 : 29,
            }}>
            Chili Crunch Chicken Tenders
          </Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 13 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
              <Clock3 color={colors.muted} size={14} />
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 10 }}>40 MIN</Text>
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
              <UsersRound color={colors.muted} size={14} />
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 10 }}>SERVES 4</Text>
            </View>
          </View>
        </View>
        {tokens.signature === 'stickers' && <Sticker color={colors.partial} rotation={-2} tokens={tokens}>40 MIN</Sticker>}
        {tokens.signature === 'burner' && <SegmentedRing colors={colors} progress={0.72} size={60} tokens={tokens} />}
        {tokens.signature === 'heat' && <Flame color={colors.primary} fill={alpha(colors.primary, 0.18)} size={31} />}
      </View>

      {tokens.signature === 'stickers' && (
        <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'space-between' }}>
          <Sticker color={colors.have} rotation={-1.8} tokens={tokens}>4 HAVE</Sticker>
          <Sticker color={colors.partial} rotation={1.2} tokens={tokens}>1 PARTIAL</Sticker>
          <Sticker color={colors.need} rotation={-0.7} tokens={tokens}>9 NEED</Sticker>
        </View>
      )}
      {tokens.signature === 'burner' && <BurnerMeter colors={colors} tokens={tokens} />}
      {tokens.signature === 'heat' && <HeatMeter colors={colors} tokens={tokens} />}

      <PressScale
        onPress={() => undefined}
        spring={springFor(tokens)}
        style={{
          alignItems: 'center',
          backgroundColor: colors.primary,
          borderRadius: tokens.shape.controlRadius,
          flexDirection: 'row',
          justifyContent: 'center',
          paddingVertical: 13,
        }}>
        <ShoppingBasket color="#FFFFFF" size={16} />
        <Text style={{ color: '#FFFFFF', fontFamily: tokens.fonts.bodyBold, fontSize: 13, marginLeft: 8 }}>
          View recipe
        </Text>
        <ArrowUpRight color="#FFFFFF" size={16} style={{ marginLeft: 7 }} />
      </PressScale>
    </View>
  );
}

function StatusGlyph({
  colors,
  progress,
  toneColor,
  tokens,
}: {
  colors: DirectionColors;
  progress: number;
  toneColor: string;
  tokens: DirectionTokens;
}) {
  if (tokens.signature === 'burner') {
    return (
      <SegmentedRing
        colors={colors}
        progress={progress}
        progressColor={toneColor}
        showValue={false}
        size={30}
        strokeWidth={4}
        tokens={tokens}
      />
    );
  }
  if (tokens.signature === 'heat') {
    return <MessageCircle color={toneColor} size={15} />;
  }
  return null;
}

function StatusTag({
  colors,
  text,
  toneColor,
  tokens,
}: {
  colors: DirectionColors;
  text: string;
  toneColor: string;
  tokens: DirectionTokens;
}) {
  const isChat = tokens.signature === 'heat';
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: alpha(toneColor, isChat ? 0.16 : 0.2),
        borderBottomLeftRadius: isChat ? 5 : tokens.shape.controlRadius,
        borderColor: alpha(toneColor, 0.35),
        borderRadius: tokens.shape.controlRadius,
        borderWidth: 1,
        maxWidth: 155,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}>
      <Text
        numberOfLines={2}
        style={{
          color: colors.ink,
          fontFamily: tokens.fonts.mono,
          fontSize: 9,
          lineHeight: 12,
          textAlign: isChat ? 'left' : 'right',
        }}>
        {text}
      </Text>
    </View>
  );
}

function IngredientRow({
  colors,
  item,
  index,
  tokens,
}: {
  colors: DirectionColors;
  item: (typeof RECIPE_INGREDIENTS)[number];
  index: number;
  tokens: DirectionTokens;
}) {
  const toneColor =
    item.tone === 'have'
      ? colors.have
      : item.tone === 'partial'
        ? colors.partial
        : item.tone === 'need'
      ? colors.need
      : colors.muted;
  const statusProgress = item.tone === 'have' ? 1 : item.tone === 'partial' ? 0.5 : item.tone === 'need' ? 0.2 : 0.8;
  return (
    <View
      style={{
        alignItems: 'center',
        borderBottomColor: index === RECIPE_INGREDIENTS.length - 1 ? 'transparent' : colors.border,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 13,
      }}>
      {tokens.signature === 'stickers' ? (
        <Sticker
          color={alpha(toneColor, 0.2)}
          rotation={index % 2 ? 1.4 : -1.2}
          textColor={colors.ink}
          tokens={tokens}>
          {item.tone === 'have' ? 'HAVE' : item.tone === 'partial' ? 'PARTIAL' : item.tone === 'need' ? 'NEED' : 'STAPLE'}
        </Sticker>
      ) : (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: alpha(toneColor, 0.1),
            borderBottomLeftRadius: tokens.signature === 'heat' ? 5 : tokens.shape.controlRadius,
            borderRadius: tokens.shape.controlRadius,
            height: 34,
            justifyContent: 'center',
            width: 34,
          }}>
          <StatusGlyph colors={colors} progress={statusProgress} toneColor={toneColor} tokens={tokens} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyMedium, fontSize: 12 }}>{item.name}</Text>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 10 }}>{item.amount}</Text>
      </View>
      {tokens.signature === 'stickers' ? (
        <Sticker
          color={alpha(toneColor, 0.2)}
          rotation={index % 2 ? -1.2 : 1.1}
          textColor={colors.ink}
          tokens={tokens}>
          {item.note}
        </Sticker>
      ) : (
        <StatusTag colors={colors} text={item.note} toneColor={toneColor} tokens={tokens} />
      )}
    </View>
  );
}

function JobCard({
  colors,
  tokens,
}: {
  colors: DirectionColors;
  tokens: DirectionTokens;
}) {
  const [stage, setStage] = useState(3);
  const progress = useSharedValue(3);
  const pulse = useSharedValue(0);
  const spring = springFor(tokens);

  useEffect(() => {
    progress.value = withTiming(3, { duration: 1 });
    pulse.value = withTiming(1, { duration: 800 });
    const timer = setInterval(() => {
      setStage((current) => {
        const next = Math.min(current + 1, 6);
        progress.value = withSpring(next, spring);
        pulse.value = withTiming(0, { duration: 1 });
        pulse.value = withTiming(1, { duration: 800 });
        return next;
      });
    }, 1600);
    return () => clearInterval(timer);
  }, [progress, pulse, spring]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.94, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(pulse.value, [0, 1], [3, 0], Extrapolation.CLAMP) }],
  }));
  const done = stage === 6;
  const stageLabel = done ? 'Dinner plan is ready.' : JOB_STAGES[stage - 1];

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: done ? colors.have : colors.border,
          borderRadius: tokens.shape.cardRadius,
          borderWidth: 1,
          overflow: 'hidden',
        },
        animatedStyle,
      ]}>
      {tokens.signature === 'stickers' && (
        <View style={{ backgroundColor: colors.primary, height: 4, width: `${(stage / 6) * 100}%` }} />
      )}
      <View style={{ gap: 15, padding: 17 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 9 }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: alpha(colors.primary, 0.14),
                borderRadius: 999,
                height: 34,
                justifyContent: 'center',
                width: 34,
              }}>
              {done ? <Check color={colors.have} size={17} strokeWidth={3} /> : <ChefHat color={colors.primary} size={17} />}
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 12 }}>@crispy.kitchen</Text>
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 9 }}>
                {done ? 'READY TO COOK' : `REEL JOB · ${stage} OF 6`}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 10 }}>
            {done ? '00:58' : '0:42'}
          </Text>
        </View>

        {tokens.signature === 'burner' ? (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14 }}>
            <SegmentedRing colors={colors} progress={stage / 6} size={72} tokens={tokens} />
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 13 }}>{stageLabel}</Text>
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 11 }}>
                {done ? 'Your pantry can handle this one.' : 'The dial is turning through the reel.'}
              </Text>
            </View>
          </View>
        ) : tokens.signature === 'heat' ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: alpha(colors.primary, 0.1),
              borderBottomLeftRadius: 5,
              borderRadius: 17,
              gap: 6,
              maxWidth: '88%',
              paddingHorizontal: 14,
              paddingVertical: 11,
            }}>
            <Text style={{ color: colors.primary, fontFamily: tokens.fonts.mono, fontSize: 9 }}>FRIEND UPDATE</Text>
            <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyMedium, fontSize: 12 }}>{stageLabel}</Text>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
              <MoreHorizontal color={colors.primary} size={14} />
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 10 }}>
                {done ? 'You&apos;re all set.' : 'typing'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: index < stage ? colors.primary : colors.border,
                    borderRadius: 4,
                    flex: 1,
                    height: 8,
                  }}
                />
              ))}
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyMedium, fontSize: 12 }}>{stageLabel}</Text>
              <Timer color={colors.muted} size={15} />
            </View>
          </View>
        )}

        {!done ? (
          <Pressable
            onPress={() => setStage(6)}
            style={{
              alignSelf: 'flex-start',
              borderColor: colors.border,
              borderRadius: tokens.shape.controlRadius,
              borderWidth: 1,
              paddingHorizontal: 13,
              paddingVertical: 8,
            }}>
            <Text style={{ color: colors.muted, fontFamily: tokens.fonts.bodyMedium, fontSize: 11 }}>Cancel</Text>
          </Pressable>
        ) : (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <CircleCheck color={colors.have} size={16} />
            <Text style={{ color: colors.have, fontFamily: tokens.fonts.bodyBold, fontSize: 11 }}>Saved to Incoming</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function ServingsStepper({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 12 }}>Servings 4</Text>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 10 }}>Scale the crunch</Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: tokens.signature === 'burner' ? colors.primary : alpha(colors.primary, 0.1),
          borderColor: tokens.signature === 'burner' ? colors.primary : colors.border,
          borderRadius: tokens.shape.stepperRadius,
          borderWidth: 1,
          flexDirection: 'row',
          padding: tokens.signature === 'burner' ? 4 : 3,
        }}>
        <Pressable
          accessibilityLabel="Decrease servings"
          style={{
            alignItems: 'center',
            backgroundColor: tokens.signature === 'burner' ? alpha('#FFFFFF', 0.16) : colors.surface,
            borderRadius: tokens.shape.stepperRadius,
            height: 29,
            justifyContent: 'center',
            width: 29,
          }}>
          <Minus color={tokens.signature === 'burner' ? '#FFFFFF' : colors.ink} size={14} />
        </Pressable>
        <Text
          style={{
            color: tokens.signature === 'burner' ? '#FFFFFF' : colors.ink,
            fontFamily: tokens.fonts.mono,
            fontSize: 11,
            fontWeight: '700',
            paddingHorizontal: 12,
          }}>
          4
        </Text>
        <Pressable
          accessibilityLabel="Increase servings"
          style={{
            alignItems: 'center',
            backgroundColor: tokens.signature === 'burner' ? alpha('#FFFFFF', 0.16) : colors.surface,
            borderRadius: tokens.shape.stepperRadius,
            height: 29,
            justifyContent: 'center',
            width: 29,
          }}>
          <Plus color={tokens.signature === 'burner' ? '#FFFFFF' : colors.ink} size={14} />
        </Pressable>
      </View>
    </View>
  );
}

function ActionButtons({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  const spring = springFor(tokens);
  return (
    <View style={{ gap: 9 }}>
      <PressScale
        onPress={() => undefined}
        spring={spring}
        style={{
          alignItems: 'center',
          backgroundColor: colors.primary,
          borderRadius: tokens.shape.controlRadius,
          flexDirection: 'row',
          justifyContent: 'center',
          paddingVertical: 12,
        }}>
        <ShoppingBasket color="#FFFFFF" size={15} />
        <Text style={{ color: '#FFFFFF', fontFamily: tokens.fonts.bodyBold, fontSize: 12, marginLeft: 7 }}>
          Add to cart
        </Text>
      </PressScale>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <PressScale
          onPress={() => undefined}
          spring={spring}
          style={{
            alignItems: 'center',
            borderColor: colors.primary,
            borderRadius: tokens.shape.controlRadius,
            borderWidth: 1,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            minWidth: 0,
            paddingHorizontal: 10,
            paddingVertical: 11,
          }}>
          <Play color={colors.primary} fill={colors.primary} size={13} />
          <Text style={{ color: colors.primary, flexShrink: 1, fontFamily: tokens.fonts.bodyBold, fontSize: 11, marginLeft: 6 }}>
            Start cooking
          </Text>
        </PressScale>
        <Pressable
          style={{
            alignItems: 'center',
            borderColor: colors.border,
            borderRadius: tokens.shape.controlRadius,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
            paddingVertical: 11,
          }}>
          <Text style={{ color: colors.muted, fontFamily: tokens.fonts.bodyMedium, fontSize: 11 }}>Open original reel</Text>
        </Pressable>
      </View>
      <Pressable style={{ alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 4, padding: 8 }}>
        <Trash2 color={colors.danger} size={11} />
        <Text style={{ color: colors.danger, fontFamily: tokens.fonts.bodyMedium, fontSize: 10 }}>
          Delete account
        </Text>
      </Pressable>
    </View>
  );
}

function InputsAndChips({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  return (
    <View style={{ gap: 13 }}>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: tokens.signature === 'burner' ? alpha(colors.ink, 0.04) : colors.surface,
            borderColor: tokens.signature === 'burner' ? alpha(colors.ink, 0.2) : colors.border,
            borderRadius: tokens.shape.controlRadius,
            borderWidth: 1,
            flex: 1.25,
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 12,
          }}>
          <Search color={colors.muted} size={15} />
          <TextInput
            placeholder="Ingredient name"
            placeholderTextColor={colors.muted}
            style={{ color: colors.ink, flex: 1, fontFamily: tokens.fonts.body, fontSize: 11, paddingVertical: 10 }}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: tokens.signature === 'burner' ? alpha(colors.ink, 0.04) : colors.surface,
            borderColor: tokens.signature === 'burner' ? alpha(colors.ink, 0.2) : colors.border,
            borderRadius: tokens.shape.controlRadius,
            borderWidth: 1,
            flex: 0.75,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 10,
          }}>
          <TextInput
            defaultValue="2"
            keyboardType="numeric"
            style={{ color: colors.ink, fontFamily: tokens.fonts.mono, fontSize: 11, paddingVertical: 10, textAlign: 'right', width: 25 }}
          />
          <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 11, marginLeft: 4 }}>| lb</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {['Vegetarian', 'Gluten-free', 'Nut allergy'].map((item, index) => (
          tokens.signature === 'stickers' || tokens.signature === 'heat' ? (
            <Sticker
              color={alpha(index === 0 ? colors.have : index === 1 ? colors.partial : colors.need, 0.2)}
              key={item}
              rotation={index === 0 ? -1.5 : index === 1 ? 1.2 : -0.8}
              textColor={colors.ink}
              tokens={tokens}>
              {index === 0 ? '✓ ' : ''}
              {item}
            </Sticker>
          ) : (
            <Pressable
              key={item}
              style={{
                alignItems: 'center',
                backgroundColor: index === 0 ? alpha(colors.have, 0.16) : alpha(colors.border, 0.36),
                borderColor: index === 0 ? colors.have : colors.border,
                borderRadius: tokens.shape.controlRadius,
                borderWidth: 1,
                flexDirection: 'row',
                paddingHorizontal: 11,
                paddingVertical: 7,
              }}>
              {index === 0 && <Check color={colors.have} size={11} />}
              <Text
                numberOfLines={1}
                style={{
                  color: colors.ink,
                  fontFamily: tokens.fonts.bodyMedium,
                  fontSize: 10,
                  marginLeft: index === 0 ? 4 : 0,
                }}>
                {item}
              </Text>
            </Pressable>
          )
        ))}
      </View>
    </View>
  );
}

function ToastAndError({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  const toast =
    tokens.signature === 'stickers' ? (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: alpha(colors.have, 0.1),
          borderColor: alpha(colors.have, 0.28),
          borderRadius: tokens.shape.controlRadius,
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 9,
          paddingVertical: 7,
        }}>
        <Sticker color={alpha(colors.have, 0.28)} rotation={-1} textColor={colors.ink} tokens={tokens}>
          Added 9 items to cart
        </Sticker>
        <Sticker color={alpha(colors.partial, 0.35)} rotation={1.5} textColor={colors.ink} tokens={tokens}>
          Undo
        </Sticker>
      </View>
    ) : tokens.signature === 'burner' ? (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.ink,
          borderColor: colors.primary,
          borderRadius: tokens.shape.controlRadius,
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 13,
          paddingVertical: 11,
        }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
          <CircleCheck color={colors.have} size={16} />
          <Text style={{ color: colors.bg, fontFamily: tokens.fonts.mono, fontSize: 10 }}>
            ADDED 09 ITEMS / CART
          </Text>
        </View>
        <Text style={{ color: colors.partial, fontFamily: tokens.fonts.mono, fontSize: 10 }}>UNDO</Text>
      </View>
    ) : (
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'flex-start',
          backgroundColor: alpha(colors.primary, 0.12),
          borderBottomLeftRadius: 5,
          borderColor: alpha(colors.primary, 0.28),
          borderRadius: 17,
          borderWidth: 1,
          flexDirection: 'row',
          gap: 8,
          maxWidth: '100%',
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}>
        <MessageCircle color={colors.primary} size={16} />
        <Text style={{ color: colors.ink, flex: 1, fontFamily: tokens.fonts.bodyMedium, fontSize: 11 }}>
          Added 9 items to cart
        </Text>
        <Pressable
          style={{
            backgroundColor: alpha(colors.partial, 0.24),
            borderRadius: tokens.shape.controlRadius,
            paddingHorizontal: 8,
            paddingVertical: 5,
          }}>
          <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 9 }}>Undo</Text>
        </Pressable>
      </View>
    );

  const error =
    tokens.signature === 'heat' ? (
      <View style={{ alignItems: 'flex-start', gap: 6 }}>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 9 }}>WE&apos;RE COOKED!</Text>
        <View
          style={{
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: alpha(colors.danger, 0.12),
            borderBottomLeftRadius: 5,
            borderColor: alpha(colors.danger, 0.32),
            borderRadius: 17,
            borderWidth: 1,
            flexDirection: 'row',
            gap: 10,
            padding: 12,
          }}>
          <AlertTriangle color={colors.danger} size={17} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: colors.danger, fontFamily: tokens.fonts.bodyBold, fontSize: 11 }}>
              Couldn&apos;t read this reel
            </Text>
            <Text style={{ color: colors.ink, fontFamily: tokens.fonts.body, fontSize: 10, lineHeight: 15 }}>
              Add a screenshot and we&apos;ll read the text from it.
            </Text>
          </View>
          <X color={colors.muted} size={14} />
        </View>
      </View>
    ) : (
      <View
        style={{
          backgroundColor: alpha(colors.danger, 0.1),
          borderColor: alpha(colors.danger, 0.3),
          borderRadius: tokens.shape.cardRadius,
          borderWidth: 1,
          flexDirection: 'row',
          gap: 10,
          padding: 13,
        }}>
        <AlertTriangle color={colors.danger} size={17} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.danger, fontFamily: tokens.fonts.bodyBold, fontSize: 11 }}>
            Couldn&apos;t read this reel
          </Text>
          <Text style={{ color: colors.ink, fontFamily: tokens.fonts.body, fontSize: 10, lineHeight: 15 }}>
            Add a screenshot and we&apos;ll read the text from it.
          </Text>
        </View>
        <X color={colors.muted} size={14} />
      </View>
    );

  return (
    <View style={{ gap: 10 }}>
      {toast}
      {error}
    </View>
  );
}

function DesignSignature({ colors, tokens }: { colors: DirectionColors; tokens: DirectionTokens }) {
  if (tokens.signature === 'stickers') {
    return (
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center', paddingVertical: 1 }}>
        <Sticker color={colors.have} rotation={-3} textColor={colors.ink} tokens={tokens}>FRESH</Sticker>
        <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 9 }}>SIGNATURE</Text>
        <Sticker color={colors.partial} rotation={2} textColor={colors.ink} tokens={tokens}>PLU 04</Sticker>
      </View>
    );
  }
  if (tokens.signature === 'burner') {
    return (
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
        <SegmentedRing colors={colors} progress={0.62} size={43} tokens={tokens} />
        <View style={{ gap: 2 }}>
          <Text style={{ color: colors.ink, fontFamily: tokens.fonts.bodyBold, fontSize: 11 }}>Dial in dinner.</Text>
          <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 9 }}>SIGNATURE / BURNER RING</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      <Flame color={colors.primary} fill={colors.primary} size={19} />
      <Text style={{ color: colors.primary, fontFamily: tokens.fonts.display, fontSize: 16 }}>How cooked are we?</Text>
    </View>
  );
}

export default function DirectionsPrototype() {
  const params = useLocalSearchParams<{ d?: string; mode?: string }>();
  const initialDirection = Array.isArray(params.d) ? params.d[0] : params.d;
  const initialMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const [selected, setSelected] = useState<DirectionId>(isDirection(initialDirection) ? initialDirection : 'a');
  const [mode, setMode] = useState<Mode>(isMode(initialMode) ? initialMode : 'light');
  const { width } = useWindowDimensions();
  const [loaded, error] = useFonts(fontAssets);
  const tokens = DIRECTIONS[selected];
  const colors = tokens.colors[mode];
  const maxWidth = Math.min(width - 28, 620);

  useEffect(() => {
    if (isDirection(initialDirection)) setSelected(initialDirection);
    if (isMode(initialMode)) setMode(initialMode);
  }, [initialDirection, initialMode]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previousHtmlColor = document.documentElement.style.backgroundColor;
    const previousBodyColor = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = colors.bg;
    document.body.style.backgroundColor = colors.bg;
    return () => {
      document.documentElement.style.backgroundColor = previousHtmlColor;
      document.body.style.backgroundColor = previousBodyColor;
    };
  }, [colors.bg]);

  const caption = useMemo(() => `${tokens.name} · ${mode === 'light' ? 'day' : 'night'} study`, [mode, tokens.name]);

  if (!loaded && !error) return <LoadingScreen colors={colors} />;

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg, flex: 1, minHeight: '100%' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          backgroundColor: colors.bg,
          minHeight: '100%',
          paddingBottom: 54,
          paddingHorizontal: 14,
          paddingTop: 14,
        }}
        nativeID="directions-scroll"
        style={{ backgroundColor: colors.bg, flex: 1 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ gap: 20, maxWidth, width: '100%' }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ gap: 5 }}>
              <Text style={{ color: colors.primary, fontFamily: tokens.fonts.mono, fontSize: 9, letterSpacing: 1.5 }}>
                WE&apos;RE COOKED! / PROTOTYPE
              </Text>
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 10 }}>{caption}</Text>
            </View>
            <ModeToggle colors={colors} mode={mode} setMode={setMode} tokens={tokens} />
          </View>

          <View style={{ gap: 14 }}>
            <View style={{ alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: colors.ink, fontFamily: tokens.fonts.display, fontSize: selected === 'b' ? 33 : 39, lineHeight: 43 }}>
                  Pantry
                </Text>
                <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 12 }}>
                  18 items · synced
                </Text>
              </View>
              <DirectionPicker colors={colors} selected={selected} setSelected={setSelected} tokens={tokens} />
            </View>
            <View
              style={{
                backgroundColor: alpha(colors.primary, 0.08),
                borderColor: alpha(colors.primary, 0.17),
                borderRadius: tokens.shape.cardRadius,
                borderWidth: 1,
                gap: 7,
                padding: 13,
              }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 7 }}>
                <Gauge color={colors.primary} size={15} />
                <Text style={{ color: colors.primary, fontFamily: tokens.fonts.bodyBold, fontSize: 11 }}>
                  Direction {selected.toUpperCase()} · {tokens.name}
                </Text>
              </View>
              <Text style={{ color: colors.muted, fontFamily: tokens.fonts.body, fontSize: 11, lineHeight: 16 }}>
                {tokens.thesis}
              </Text>
              <DesignSignature colors={colors} tokens={tokens} />
            </View>
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>01 / recipe card</SectionLabel>
            <RecipeCard colors={colors} tokens={tokens} />
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>02 / reel job</SectionLabel>
            <JobCard key={selected} colors={colors} tokens={tokens} />
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>03 / ingredients</SectionLabel>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: tokens.shape.cardRadius,
                borderWidth: 1,
                paddingHorizontal: 15,
              }}>
              {RECIPE_INGREDIENTS.map((item, index) => (
                <IngredientRow colors={colors} index={index} item={item} key={item.name} tokens={tokens} />
              ))}
            </View>
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>04 / controls</SectionLabel>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: tokens.shape.cardRadius,
                borderWidth: 1,
                gap: 18,
                padding: 15,
              }}>
              <ServingsStepper colors={colors} tokens={tokens} />
              <ActionButtons colors={colors} tokens={tokens} />
            </View>
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>05 / pantry input</SectionLabel>
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: tokens.shape.cardRadius,
                borderWidth: 1,
                padding: 15,
              }}>
              <InputsAndChips colors={colors} tokens={tokens} />
            </View>
          </View>

          <View style={{ gap: 9 }}>
            <SectionLabel colors={colors} tokens={tokens}>06 / feedback</SectionLabel>
            <ToastAndError colors={colors} tokens={tokens} />
          </View>

          <View
            style={{
              alignItems: 'center',
              borderTopColor: colors.border,
              borderTopWidth: 1,
              flexDirection: 'row',
              gap: 7,
              justifyContent: 'center',
              paddingTop: 18,
            }}>
            <Zap color={colors.partial} fill={colors.partial} size={14} />
            <Text style={{ color: colors.muted, fontFamily: tokens.fonts.mono, fontSize: 9, letterSpacing: 0.8 }}>
              THROWAWAY DIRECTION ROUND · A / B / C
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
