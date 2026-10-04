import { useEffect } from 'react';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const OUTER = 'M50 4 C58 22 80 30 84 56 C88 82 70 100 50 100 C30 100 12 84 14 60 C15 46 24 38 30 30 C32 40 36 44 42 46 C40 30 42 16 50 4 Z';
const INNER = 'M50 26 C56 40 72 48 72 66 C72 82 62 92 50 92 C38 92 28 82 28 68 C28 58 34 52 38 48 C40 56 44 58 48 58 C46 46 46 36 50 26 Z';
const CORE = 'M50 58 C55 66 60 70 60 77 C60 84 55 88 50 88 C45 88 40 84 40 77 C40 70 45 66 50 58 Z';

export function Flame({ size = 64, lit = true, animate = true }: { size?: number; lit?: boolean; animate?: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!animate || !lit) return;
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [animate, lit, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: size * 0.45 },
      { scaleY: 1 + t.value * 0.02 },
      { scaleX: 1 - t.value * 0.008 },
      { rotate: `${(t.value - 0.5) * 1}deg` },
      { translateY: -size * 0.45 },
    ],
  }));
  const [a, b, c] = lit ? ['#FFC23D', '#FF5A4E', '#FF9A3D'] : ['#D5D9DE', '#B8BEC6', '#C9CED4'];
  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 104">
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={b} />
            <Stop offset="1" stopColor={c} />
          </LinearGradient>
        </Defs>
        <Path d={OUTER} fill={a} />
        <Path d={INNER} fill="url(#g)" />
        <Path d={CORE} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
}
