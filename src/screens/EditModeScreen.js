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
  PanResponder,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../context/ThemeContext';
import AnimatedButton from '../components/AnimatedButton';
import GlassMorphismCard from '../components/GlassMorphismCard';

const { width, height } = Dimensions.get('window');

const EditModeScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { file, currentPage } = route.params;
  const canvasRef = useRef(null);
  const drawingRef = useRef(null);
  
  const [editMode, setEditMode] = useState('draw'); // 'draw', 'text', 'highlight', 'signature'
  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState([]);
  const [currentColor, setCurrentColor] = useState(theme.colors.primary);
  const [brushSize, setBrushSize] = useState(5);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [colorPaletteVisible, setColorPaletteVisible] = useState(false);
  const [textAnnotations, setTextAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Animation values
  const toolbarOpacity = useSharedValue(1);
  const toolbarY = useSharedValue(0);
  const colorPaletteOpacity = useSharedValue(0);
  const colorPaletteScale = useSharedValue(0);
  const modeButtonScale = useSharedValue(1);

  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.error,
    '#FFFFFF',
    '#000000',
  ];

  useEffect(() => {
    // Initialize drawing canvas
    setupDrawing();
  }, []);

  const setupDrawing = () => {
    drawingRef.current = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        if (editMode === 'draw') {
          const { locationX, locationY } = event.nativeEvent;
          const newPath = `M${locationX},${locationY}`;
          setCurrentPath(newPath);
          setIsDrawing(true);
        }
      },
      onPanResponderMove: (event) => {
        if (editMode === 'draw' && isDrawing) {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
        }
      },
      onPanResponderRelease: () => {
        if (editMode === 'draw' && isDrawing) {
          setPaths(prev => [...prev, {
            path: currentPath,
            color: currentColor,
            strokeWidth: brushSize,
            id: Date.now(),
          }]);
          setCurrentPath('');
          setIsDrawing(false);
        }
      },
    });
  };

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

  const toggleColorPalette = () => {
    if (colorPaletteVisible) {
      colorPaletteOpacity.value = withTiming(0, { duration: 200 });
      colorPaletteScale.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(setColorPaletteVisible)(false);
      });
    } else {
      setColorPaletteVisible(true);
      colorPaletteOpacity.value = withTiming(1, { duration: 200 });
      colorPaletteScale.value = withTiming(1, { duration: 200 });
    }
  };

  const handleModeChange = (mode) => {
    setEditMode(mode);
    modeButtonScale.value = withSpring(1.2, { damping: 15 }, () => {
      modeButtonScale.value = withSpring(1, { damping: 15 });
    });
  };

  const handleColorSelect = (color) => {
    setCurrentColor(color);
    toggleColorPalette();
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear all drawings?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setPaths([]) },
      ]
    );
  };

  const handleSave = async () => {
    try {
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 0.8,
      });
      
      Alert.alert(
        'Save Successful',
        'Your edited PDF has been saved!',
        [
          { text: 'OK', style: 'default' },
          { text: 'Share', onPress: () => Sharing.shareAsync(uri) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save the edited PDF');
    }
  };

  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: toolbarOpacity.value,
      transform: [{ translateY: toolbarY.value }],
    };
  });

  const colorPaletteAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: colorPaletteOpacity.value,
      transform: [{ scale: colorPaletteScale.value }],
    };
  });

  const modeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: modeButtonScale.value }],
    };
  });

  const renderModeButton = (mode, icon, label) => (
    <Animated.View style={modeButtonAnimatedStyle}>
      <AnimatedButton
        title=""
        onPress={() => handleModeChange(mode)}
        variant={editMode === mode ? 'primary' : 'ghost'}
        size="small"
        style={[
          styles.modeButton,
          editMode === mode && styles.activeModeButton,
        ]}
        icon={<Ionicons name={icon} size={24} color={
          editMode === mode ? theme.colors.text : theme.colors.primary
        } />}
      />
      <Text style={[styles.modeLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={theme.gradients.background}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Main Canvas */}
      <View style={styles.canvasContainer} ref={canvasRef}>
        <View
          style={styles.drawingArea}
          {...(drawingRef.current?.panHandlers || {})}
        >
          <Svg
            height={height * 0.7}
            width={width}
            style={styles.svg}
          >
            {/* Render all completed paths */}
            {paths.map((pathData) => (
              <Path
                key={pathData.id}
                d={pathData.path}
                stroke={pathData.color}
                strokeWidth={pathData.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            
            {/* Render current path being drawn */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={currentColor}
                strokeWidth={brushSize}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        </View>
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
            
            <Text style={[styles.fileName, { color: theme.colors.text }]}>
              Edit Mode - Page {currentPage}
            </Text>

            <AnimatedButton
              title=""
              onPress={handleSave}
              variant="primary"
              size="small"
              style={styles.toolbarButton}
              icon={<Ionicons name="save" size={24} color={theme.colors.text} />}
            />
          </View>
        </BlurView>
      </Animated.View>

      {/* Bottom Toolbar */}
      <Animated.View style={[styles.bottomToolbar, toolbarAnimatedStyle]}>
        <BlurView intensity={80} style={styles.toolbarBlur}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarScrollContent}
          >
            {/* Mode Buttons */}
            <View style={styles.modeSection}>
              {renderModeButton('draw', 'brush', 'Draw')}
              {renderModeButton('text', 'text', 'Text')}
              {renderModeButton('highlight', 'color-filter', 'Highlight')}
              {renderModeButton('signature', 'create', 'Sign')}
            </View>

            {/* Brush Size Slider */}
            {editMode === 'draw' && (
              <GlassMorphismCard
                variant="secondary"
                style={styles.sliderCard}
                padding={12}
              >
                <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
                  Size: {brushSize}px
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  value={brushSize}
                  onValueChange={setBrushSize}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.surface}
                  thumbStyle={{ backgroundColor: theme.colors.primary }}
                />
              </GlassMorphismCard>
            )}

            {/* Color Picker */}
            <AnimatedButton
              title=""
              onPress={toggleColorPalette}
              variant="ghost"
              size="small"
              style={[styles.colorButton, { backgroundColor: currentColor }]}
              icon={<Ionicons name="color-palette" size={24} color={theme.colors.text} />}
            />

            {/* Action Buttons */}
            <AnimatedButton
              title=""
              onPress={handleUndo}
              variant="ghost"
              size="small"
              style={styles.actionButton}
              icon={<Ionicons name="arrow-undo" size={24} color={theme.colors.warning} />}
            />

            <AnimatedButton
              title=""
              onPress={handleClear}
              variant="ghost"
              size="small"
              style={styles.actionButton}
              icon={<Ionicons name="trash" size={24} color={theme.colors.error} />}
            />
          </ScrollView>
        </BlurView>
      </Animated.View>

      {/* Color Palette */}
      {colorPaletteVisible && (
        <Animated.View style={[styles.colorPalette, colorPaletteAnimatedStyle]}>
          <GlassMorphismCard
            variant="primary"
            style={styles.colorPaletteCard}
            padding={20}
          >
            <Text style={[styles.colorPaletteTitle, { color: theme.colors.text }]}>
              Select Color
            </Text>
            <View style={styles.colorGrid}>
              {colors.map((color, index) => (
                <AnimatedButton
                  key={index}
                  title=""
                  onPress={() => handleColorSelect(color)}
                  variant="ghost"
                  size="small"
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    currentColor === color && styles.selectedColor,
                  ]}
                />
              ))}
            </View>
          </GlassMorphismCard>
        </Animated.View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <GlassMorphismCard
          variant="success"
          style={styles.instructionsCard}
          padding={16}
        >
          <Text style={[styles.instructionsText, { color: theme.colors.text }]}>
            {editMode === 'draw' && 'Draw on the canvas with your finger'}
            {editMode === 'text' && 'Tap to add text annotations'}
            {editMode === 'highlight' && 'Drag to highlight text'}
            {editMode === 'signature' && 'Sign your document'}
          </Text>
        </GlassMorphismCard>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawingArea: {
    width: width,
    height: height * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    margin: 20,
  },
  svg: {
    flex: 1,
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
  toolbarScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 48,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeSection: {
    flexDirection: 'row',
    marginRight: 20,
  },
  modeButton: {
    marginHorizontal: 8,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  activeModeButton: {
    borderWidth: 2,
    borderColor: '#00D4FF',
  },
  modeLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  sliderCard: {
    marginHorizontal: 12,
    minWidth: 120,
  },
  sliderLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: 100,
    height: 30,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  actionButton: {
    marginHorizontal: 8,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  colorPalette: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    zIndex: 1001,
  },
  colorPaletteCard: {
    minWidth: 300,
  },
  colorPaletteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  instructionsCard: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default EditModeScreen; 