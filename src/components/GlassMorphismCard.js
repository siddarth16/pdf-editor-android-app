import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const GlassMorphismCard = ({ 
  children, 
  style, 
  intensity = 40,
  borderRadius = 20,
  padding = 20,
  variant = 'default',
  animated = true,
  onPress,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const borderGlow = useSharedValue(0);

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 15 });
      borderGlow.value = withTiming(1, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15 });
      borderGlow.value = withTiming(0, { duration: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(borderGlow.value, [0, 1], [0.3, 0.8]),
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: theme.colors.primary,
          backgroundColor: 'rgba(0, 212, 255, 0.05)',
        };
      case 'secondary':
        return {
          borderColor: theme.colors.secondary,
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
        };
      case 'accent':
        return {
          borderColor: theme.colors.accent,
          backgroundColor: 'rgba(255, 0, 128, 0.05)',
        };
      case 'success':
        return {
          borderColor: theme.colors.success,
          backgroundColor: 'rgba(0, 255, 136, 0.05)',
        };
      case 'warning':
        return {
          borderColor: theme.colors.warning,
          backgroundColor: 'rgba(255, 184, 0, 0.05)',
        };
      case 'error':
        return {
          borderColor: theme.colors.error,
          backgroundColor: 'rgba(255, 68, 68, 0.05)',
        };
      default:
        return {
          borderColor: theme.colors.glass,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <AnimatedBlurView
        intensity={intensity}
        style={[
          styles.blur,
          {
            borderRadius,
            backgroundColor: variantStyles.backgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.border,
            {
              borderRadius,
              borderColor: variantStyles.borderColor,
            },
            borderAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.content,
              {
                padding,
                borderRadius,
              },
            ]}
          >
            {children}
          </View>
        </Animated.View>
      </AnimatedBlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
  },
  border: {
    flex: 1,
    borderWidth: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default GlassMorphismCard; 