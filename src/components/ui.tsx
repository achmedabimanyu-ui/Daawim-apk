import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import {
  BookOpen, Brain, CircleDot, Clock, CloudSun, Droplet, Dumbbell, Footprints, HandHeart, Heart,
  Library, Moon, MoonStar, PenLine, Repeat, ScrollText, Sparkles, Sun, SunMedium, Sunrise, Sunset,
  UtensilsCrossed,
} from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

export const iconMap: Record<string, LucideIcon> = {
  sunrise: Sunrise, sun: Sun, 'cloud-sun': CloudSun, sunset: Sunset, moon: Moon, 'moon-star': MoonStar,
  'sun-medium': SunMedium, sparkles: Sparkles, 'circle-dot': CircleDot, 'utensils-crossed': UtensilsCrossed,
  'book-open': BookOpen, repeat: Repeat, library: Library, 'scroll-text': ScrollText, heart: Heart,
  dumbbell: Dumbbell, droplet: Droplet, 'pen-line': PenLine, 'hand-heart': HandHeart, footprints: Footprints,
  brain: Brain, clock: Clock,
};

export function HabitIcon({ name, size = 22, color }: { name: string; size?: number; color: string }) {
  const I = iconMap[name] ?? CircleDot;
  return <I size={size} color={color} strokeWidth={2.4} />;
}

type Weight = 'regular' | 'bold' | 'black';

export function Txt({
  w = 'bold',
  size = 15,
  color,
  style,
  ...rest
}: TextProps & { w?: Weight; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const th = useTheme();
  const { rtl } = useT();
  const family = rtl
    ? { regular: 'Cairo_500Medium', bold: 'Cairo_700Bold', black: 'Cairo_800ExtraBold' }[w]
    : { regular: 'Nunito_600SemiBold', bold: 'Nunito_800ExtraBold', black: 'Nunito_900Black' }[w];
  return (
    <Text
      {...rest}
      style={[{ fontFamily: family, fontSize: Math.round(size * 0.88), color: color ?? th.text, writingDirection: rtl ? 'rtl' : 'ltr' }, style]}
    />
  );
}

export function Card({ children, style, pad = 16 }: { children: ReactNode; style?: StyleProp<ViewStyle>; pad?: number }) {
  const th = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: th.card, borderRadius: 22, padding: pad,
          borderWidth: 1.5, borderBottomWidth: 4, borderColor: th.border,
          shadowColor: '#1C2A3A', shadowOpacity: th.isDark ? 0 : 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: th.isDark ? 0 : 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Press3D({
  children,
  onPress,
  color,
  edge,
  style,
  radius = 16,
  depth = 4,
  disabled,
  haptic = true,
}: {
  children: ReactNode;
  onPress?: () => void;
  color: string;
  edge: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  depth?: number;
  disabled?: boolean;
  haptic?: boolean;
}) {
  const y = useSharedValue(0);
  const face = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        y.value = withTiming(depth, { duration: 60 });
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      onPressOut={() => {
        y.value = withSpring(0, { damping: 12, stiffness: 400 });
      }}
      onPress={onPress}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={{ backgroundColor: edge, borderRadius: radius, paddingBottom: depth }}>
        <Animated.View style={[{ backgroundColor: color, borderRadius: radius, marginTop: 0 }, face]}>{children}</Animated.View>
      </View>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'danger' | 'flame';
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const th = useTheme();
  const map = {
    primary: [th.accent.main, th.accent.dark, '#fff'],
    flame: [th.flame, th.flameDark, '#fff'],
    danger: [th.danger, th.dangerDark, '#fff'],
    ghost: [th.card, th.border, th.accent.main],
  } as const;
  const [bg, edge, fg] = map[variant];
  return (
    <Press3D color={bg} edge={edge} onPress={onPress} disabled={disabled} style={style}>
      <View
        style={[
          s.btn,
          variant === 'ghost' && { borderWidth: 2, borderColor: th.border, borderRadius: 16 },
        ]}
      >
        {icon}
        <Txt w="black" size={15} color={fg} style={{ letterSpacing: 0.8, textTransform: 'uppercase' }}>
          {label}
        </Txt>
      </View>
    </Press3D>
  );
}

export function ProgressBar({ value, color, height = 14 }: { value: number; color: string; height?: number }) {
  const th = useTheme();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withSpring(Math.max(0, Math.min(1, value)), { damping: 18, stiffness: 120 });
  }, [value, w]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: th.sunk, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color }, fill]}>
        <View style={{ position: 'absolute', top: 3, left: 8, right: 8, height: height / 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' }} />
      </Animated.View>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: th.isDark ? th.bg : '#ECEEF1', borderRadius: 100, padding: 4 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(o.key);
            }}
            style={{
              flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 100,
              backgroundColor: on ? (th.isDark ? '#38434A' : th.card) : 'transparent',
              shadowColor: '#000', shadowOpacity: on ? 0.08 : 0, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: on ? 2 : 0,
            }}
          >
            <Txt size={14} color={on ? th.text : th.muted}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 }}>
      <Txt w="black" size={18}>
        {children}
      </Txt>
      {right}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16 },
});
