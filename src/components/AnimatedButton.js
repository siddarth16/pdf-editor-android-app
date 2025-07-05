import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedButton = ({ 
  title, 
  onPress, 
  style, 
  variant = 'primary', 
  size = 'medium',
  icon,
  disabled = false,
  isLoading = false,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glow = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    glow.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    glow.value = withTiming(0, { duration: 300 });
  };

  const handlePress = () => {
    if (disabled || isLoading) return;
    
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
      runOnJS(onPress)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const glowScale = interpolate(glow.value, [0, 1], [1, 1.1]);
    const glowOpacity = interpolate(glow.value, [0, 1], [0.3, 0.8]);
    
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      shadowOpacity: glowOpacity,
      shadowRadius: interpolate(glow.value, [0, 1], [10, 20]),
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
      case 'ghost':
        return {
          gradient: ['transparent', 'transparent'],
          shadow: theme.shadows.glow,
          borderColor: theme.colors.primary,
          borderWidth: 2,
        };
      default:
        return {
          gradient: theme.gradients.primary,
          shadow: theme.shadows.glow,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          fontSize: 18,
        };
      default:
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          fontSize: 16,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        variantStyles.shadow,
        animatedStyle,
        style,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled || isLoading}
    >
      <LinearGradient
        colors={variantStyles.gradient}
        style={[
          styles.gradient,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
          },
          variantStyles.borderColor && {
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeStyles.fontSize,
                color: variant === 'ghost' ? theme.colors.primary : theme.colors.text,
              },
            ]}
          >
            {isLoading ? 'Loading...' : title}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AnimatedButton; 