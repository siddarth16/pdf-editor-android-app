import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
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
import AnimatedButton from '../components/AnimatedButton';
import FloatingActionButton from '../components/FloatingActionButton';
import GlassMorphismCard from '../components/GlassMorphismCard';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(50);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(30);
  const glowAnimation = useSharedValue(0);
  const particleAnimation = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    titleOpacity.value = withTiming(1, { duration: 1000 });
    titleY.value = withTiming(0, { duration: 1000 });
    
    setTimeout(() => {
      cardOpacity.value = withTiming(1, { duration: 800 });
      cardY.value = withTiming(0, { duration: 800 });
    }, 300);

    // Continuous animations
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );

    particleAnimation.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const handleUploadPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setSelectedFile(result);
        navigation.navigate('PDFViewer', { file: result });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick PDF file');
    }
  };

  const handleCreateNew = () => {
    Alert.alert(
      'Create New PDF',
      'This feature will be available in the next update!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleY.value }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ translateY: cardY.value }],
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glowAnimation.value, [0, 1], [0.3, 0.8]),
      transform: [
        {
          scale: interpolate(glowAnimation.value, [0, 1], [0.95, 1.05]),
        },
      ],
    };
  });

  const particleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(particleAnimation.value, [0, 1], [0, 360])}deg`,
        },
      ],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.gradients.background}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Particles */}
      <View style={styles.particlesContainer}>
        {[...Array(20)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                backgroundColor: index % 2 === 0 ? theme.colors.primary : theme.colors.secondary,
              },
              particleAnimatedStyle,
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Header */}
        <Animated.View style={[styles.header, titleAnimatedStyle]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            PDF Editor
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            Pro
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Create, Edit & Transform PDFs with{'\n'}Futuristic Precision
          </Text>
        </Animated.View>

        {/* Feature Cards */}
        <Animated.View style={[styles.cardsContainer, cardAnimatedStyle]}>
          <GlassMorphismCard
            variant="primary"
            style={styles.featureCard}
            padding={24}
          >
            <View style={styles.cardContent}>
              <Animated.View style={[styles.iconContainer, glowAnimatedStyle]}>
                <Ionicons name="document-text" size={32} color={theme.colors.primary} />
              </Animated.View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Smart PDF Editing
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                Advanced text editing, annotations, and digital signatures
              </Text>
            </View>
          </GlassMorphismCard>

          <GlassMorphismCard
            variant="secondary"
            style={styles.featureCard}
            padding={24}
          >
            <View style={styles.cardContent}>
              <Animated.View style={[styles.iconContainer, glowAnimatedStyle]}>
                <Ionicons name="brush" size={32} color={theme.colors.secondary} />
              </Animated.View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Creative Tools
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                Draw, highlight, and add multimedia content
              </Text>
            </View>
          </GlassMorphismCard>

          <GlassMorphismCard
            variant="accent"
            style={styles.featureCard}
            padding={24}
          >
            <View style={styles.cardContent}>
              <Animated.View style={[styles.iconContainer, glowAnimatedStyle]}>
                <Ionicons name="share" size={32} color={theme.colors.accent} />
              </Animated.View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Instant Sharing
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
                Export and share your edited PDFs instantly
              </Text>
            </View>
          </GlassMorphismCard>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionsContainer, cardAnimatedStyle]}>
          <AnimatedButton
            title="Upload PDF"
            onPress={handleUploadPDF}
            variant="primary"
            size="large"
            style={styles.actionButton}
            icon={<Ionicons name="cloud-upload" size={24} color={theme.colors.text} />}
          />
          
          <AnimatedButton
            title="Create New"
            onPress={handleCreateNew}
            variant="ghost"
            size="large"
            style={styles.actionButton}
            icon={<Ionicons name="add-circle" size={24} color={theme.colors.primary} />}
          />
        </Animated.View>
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={handleUploadPDF}
        icon={<Ionicons name="add" size={28} color={theme.colors.text} />}
        variant="primary"
        size={70}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    marginBottom: 40,
  },
  featureCard: {
    marginBottom: 16,
    minHeight: 120,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    marginBottom: 16,
  },
});

export default HomeScreen; 