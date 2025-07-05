import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FloatingActionButton = ({ 
  onPress, 
  icon, 
  style, 
  size = 60,
  variant = 'primary',
  pulseAnimation = true,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (pulseAnimation) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [pulseAnimation]);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15 });
    glow.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    glow.value = withTiming(0, { duration: 300 });
  };

  const handlePress = () => {
    scale.value = withSpring(0.8, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
      runOnJS(onPress)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const glowScale = interpolate(glow.value, [0, 1], [1, 1.2]);
    const glowOpacity = interpolate(glow.value, [0, 1], [0.3, 0.8]);
    
    return {
      transform: [
        { scale: scale.value * pulse.value },
      ],
      shadowOpacity: glowOpacity,
      shadowRadius: interpolate(glow.value, [0, 1], [15, 25]),
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: theme.gradients.primary,
          shadow: theme.shadows.glow,
        };
      case 'secondary':
        return {
          gradient: theme.gradients.secondary,
          shadow: theme.shadows.purple,
        };
      case 'accent':
        return {
          gradient: theme.gradients.accent,
          shadow: theme.shadows.pink,
        };
      default:
        return {
          gradient: theme.gradients.primary,
          shadow: theme.shadows.glow,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
        variantStyles.shadow,
        animatedStyle,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <BlurView
        intensity={20}
        style={[
          styles.blur,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <LinearGradient
          colors={variantStyles.gradient}
          style={[
            styles.gradient,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            {icon}
          </View>
        </LinearGradient>
      </BlurView>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 1000,
  },
  blur: {
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton; 