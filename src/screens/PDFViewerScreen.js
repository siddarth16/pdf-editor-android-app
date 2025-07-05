import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import AnimatedButton from '../components/AnimatedButton';
import GlassMorphismCard from '../components/GlassMorphismCard';

const { width, height } = Dimensions.get('window');

const PDFViewerScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { file } = route.params;
  const pdfRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  // Animation values
  const toolbarOpacity = useSharedValue(1);
  const toolbarY = useSharedValue(0);
  const pageInfoOpacity = useSharedValue(0);
  const fabScale = useSharedValue(1);

  useEffect(() => {
    // Show page info briefly
    pageInfoOpacity.value = withTiming(1, { duration: 300 });
    setTimeout(() => {
      pageInfoOpacity.value = withTiming(0, { duration: 300 });
    }, 2000);
  }, [currentPage]);

  useEffect(() => {
    // Auto-hide toolbar after 5 seconds
    const timer = setTimeout(() => {
      hideToolbar();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const showToolbar = () => {
    setToolbarVisible(true);
    toolbarOpacity.value = withTiming(1, { duration: 300 });
    toolbarY.value = withTiming(0, { duration: 300 });
  };

  const hideToolbar = () => {
    toolbarOpacity.value = withTiming(0, { duration: 300 });
    toolbarY.value = withTiming(-100, { duration: 300 }, () => {
      runOnJS(setToolbarVisible)(false);
    });
  };

  const toggleToolbar = () => {
    if (toolbarVisible) {
      hideToolbar();
    } else {
      showToolbar();
    }
  };

  const handleLoadComplete = (numberOfPages) => {
    setTotalPages(numberOfPages);
    setIsLoading(false);
  };

  const handlePageChanged = (page) => {
    setCurrentPage(page);
  };

  const handleEditMode = () => {
    navigation.navigate('EditMode', { file, currentPage });
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.5, 3);
    setScale(newScale);
    fabScale.value = withSpring(1.2, { damping: 15 }, () => {
      fabScale.value = withSpring(1, { damping: 15 });
    });
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 0.5);
    setScale(newScale);
    fabScale.value = withSpring(1.2, { damping: 15 }, () => {
      fabScale.value = withSpring(1, { damping: 15 });
    });
  };

  const handleShare = () => {
    Alert.alert(
      'Share PDF',
      'Sharing functionality will be available in the next update!',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: toolbarOpacity.value,
      transform: [{ translateY: toolbarY.value }],
    };
  });

  const pageInfoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pageInfoOpacity.value,
      transform: [
        {
          scale: interpolate(pageInfoOpacity.value, [0, 1], [0.8, 1]),
        },
      ],
    };
  });

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }],
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

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {file && (
          <Pdf
            ref={pdfRef}
            source={{ uri: file.uri }}
            style={styles.pdf}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={(error) => {
              console.log('PDF Error:', error);
              Alert.alert('Error', 'Failed to load PDF');
            }}
            scale={scale}
            minScale={0.5}
            maxScale={3}
            enablePaging={true}
            horizontal={false}
            onSingleTap={toggleToolbar}
            spacing={10}
            renderActivityIndicator={() => (
              <View style={styles.loadingContainer}>
                <GlassMorphismCard
                  variant="primary"
                  style={styles.loadingCard}
                  padding={24}
                >
                  <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    Loading PDF...
                  </Text>
                </GlassMorphismCard>
              </View>
            )}
          />
        )}
      </View>

      {/* Top Toolbar */}
      <Animated.View style={[styles.topToolbar, toolbarAnimatedStyle]}>
        <BlurView intensity={80} style={styles.toolbarBlur}>
          <View style={styles.toolbarContent}>
            <AnimatedButton
              title=""
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="small"
              style={styles.toolbarButton}
              icon={<Ionicons name="arrow-back" size={24} color={theme.colors.primary} />}
            />
            
            <View style={styles.titleContainer}>
              <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                {file?.name || 'PDF Document'}
              </Text>
            </View>

            <AnimatedButton
              title=""
              onPress={handleShare}
              variant="ghost"
              size="small"
              style={styles.toolbarButton}
              icon={<Ionicons name="share" size={24} color={theme.colors.primary} />}
            />
          </View>
        </BlurView>
      </Animated.View>

      {/* Bottom Toolbar */}
      <Animated.View style={[styles.bottomToolbar, toolbarAnimatedStyle]}>
        <BlurView intensity={80} style={styles.toolbarBlur}>
          <View style={styles.toolbarContent}>
            <AnimatedButton
              title=""
              onPress={handleZoomOut}
              variant="ghost"
              size="small"
              style={styles.toolbarButton}
              icon={<Ionicons name="remove" size={24} color={theme.colors.primary} />}
            />

            <AnimatedButton
              title=""
              onPress={handleZoomIn}
              variant="ghost"
              size="small"
              style={styles.toolbarButton}
              icon={<Ionicons name="add" size={24} color={theme.colors.primary} />}
            />

            <View style={styles.pageIndicator}>
              <Text style={[styles.pageText, { color: theme.colors.text }]}>
                {currentPage} / {totalPages}
              </Text>
            </View>

            <AnimatedButton
              title="Edit"
              onPress={handleEditMode}
              variant="primary"
              size="small"
              style={styles.editButton}
              icon={<Ionicons name="create" size={20} color={theme.colors.text} />}
            />
          </View>
        </BlurView>
      </Animated.View>

      {/* Page Info Overlay */}
      <Animated.View style={[styles.pageInfoOverlay, pageInfoAnimatedStyle]}>
        <GlassMorphismCard
          variant="primary"
          style={styles.pageInfoCard}
          padding={16}
        >
          <Text style={[styles.pageInfoText, { color: theme.colors.text }]}>
            Page {currentPage} of {totalPages}
          </Text>
        </GlassMorphismCard>
      </Animated.View>

      {/* Floating Zoom Controls */}
      <Animated.View style={[styles.zoomControls, fabAnimatedStyle]}>
        <GlassMorphismCard
          variant="secondary"
          style={styles.zoomCard}
          padding={12}
        >
          <Text style={[styles.zoomText, { color: theme.colors.text }]}>
            {Math.round(scale * 100)}%
          </Text>
        </GlassMorphismCard>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingCard: {
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  topToolbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  toolbarBlur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 48,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageInfoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    zIndex: 999,
  },
  pageInfoCard: {
    minWidth: 150,
  },
  pageInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    zIndex: 999,
  },
  zoomCard: {
    minWidth: 60,
  },
  zoomText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PDFViewerScreen; 