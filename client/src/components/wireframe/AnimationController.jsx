// components/wireframe/AnimationController.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Progress, Typography } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, ForwardOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const AnimationController = ({
  wireframeData,
  isAnimating,
  onStartAnimation,
  onPauseAnimation,
  onResetAnimation,
  onSkipAnimation,
  animationProgress = 0,
  currentComponentIndex = 0,
  totalComponents = 0,
  isDarkMode = false
}) => {
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x, 2x, 0.5x speed

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' }
  ];

  return (
    <div style={{
      padding: '16px',
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: '8px',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <Text style={{
          color: isDarkMode ? '#fff' : '#000',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Animation Controls
        </Text>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Speed Control */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {speedOptions.map((option) => (
              <Button
                key={option.value}
                size="small"
                type={animationSpeed === option.value ? 'primary' : 'default'}
                onClick={() => setAnimationSpeed(option.value)}
                style={{
                  width: '40px',
                  height: '24px',
                  padding: 0,
                  fontSize: '10px'
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Animation Controls */}
          <Button
            icon={isAnimating ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isAnimating ? onPauseAnimation : () => onStartAnimation(animationSpeed)}
            type="primary"
            size="small"
          >
            {isAnimating ? 'Pause' : 'Play'}
          </Button>

          <Button
            icon={<ForwardOutlined />}
            onClick={onSkipAnimation}
            size="small"
            disabled={!isAnimating}
          >
            Skip
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={onResetAnimation}
            size="small"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '8px' }}>
        <Progress
          percent={animationProgress}
          size="small"
          format={() => `${currentComponentIndex} / ${totalComponents} components`}
          strokeColor={isDarkMode ? '#1890ff' : '#1890ff'}
        />
      </div>

      {/* Animation Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{
          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          fontSize: '12px'
        }}>
          {isAnimating 
            ? `Animating at ${animationSpeed}x speed`
            : `Ready to animate ${totalComponents} components`
          }
        </Text>

        {isAnimating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#52c41a',
            fontSize: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#52c41a',
              animation: 'pulse 1s infinite'
            }} />
            Live
          </div>
        )}
      </div>
    </div>
  );
};

// Animation Queue Manager
export const useAnimationQueue = (wireframeData) => {
  const [animationQueue, setAnimationQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [completedComponents, setCompletedComponents] = useState([]);

  // Initialize queue from wireframe data
  useEffect(() => {
    if (wireframeData?.screens?.[0]?.components) {
      const components = wireframeData.screens[0].components;
      setAnimationQueue(components);
      setCurrentIndex(0);
      setCompletedComponents([]);
    }
  }, [wireframeData]);

  const startAnimation = useCallback((speed = 1) => {
    setAnimationSpeed(speed);
    setIsAnimating(true);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  const resetAnimation = useCallback(() => {
    setCurrentIndex(0);
    setIsAnimating(false);
    setCompletedComponents([]);
  }, []);

  const skipAnimation = useCallback(() => {
    setCompletedComponents(animationQueue);
    setCurrentIndex(animationQueue.length);
    setIsAnimating(false);
  }, [animationQueue]);

  const completeCurrentComponent = useCallback(() => {
    if (currentIndex < animationQueue.length) {
      const component = animationQueue[currentIndex];
      setCompletedComponents(prev => [...prev, component]);
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= animationQueue.length) {
          setIsAnimating(false);
        }
        return nextIndex;
      });
    }
  }, [currentIndex, animationQueue]);

  const animationProgress = animationQueue.length > 0 
    ? Math.round((completedComponents.length / animationQueue.length) * 100)
    : 0;

  return {
    animationQueue,
    currentIndex,
    isAnimating,
    animationSpeed,
    completedComponents,
    animationProgress,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    skipAnimation,
    completeCurrentComponent,
    totalComponents: animationQueue.length,
    currentComponent: animationQueue[currentIndex] || null
  };
};

// Animated Wireframe Generator Hook
export const useAnimatedWireframeGeneration = () => {
  const [generatedScreens, setGeneratedScreens] = useState([]);
  const [currentGeneratingScreen, setCurrentGeneratingScreen] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animationState, setAnimationState] = useState('idle'); // 'idle', 'generating', 'animating', 'complete'

  const startGeneration = useCallback(async (totalScreens, generateScreenCallback) => {
    setIsGenerating(true);
    setAnimationState('generating');
    setGeneratedScreens([]);
    setCurrentGeneratingScreen(0);

    for (let i = 0; i < totalScreens; i++) {
      setCurrentGeneratingScreen(i);
      
      try {
        // Call the actual screen generation
        const screenData = await generateScreenCallback(i);
        
        // Add to generated screens
        setGeneratedScreens(prev => [...prev, screenData]);
        
        // Start animation for this screen
        setAnimationState('animating');
        
        // Wait for animation to complete before generating next screen
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`Error generating screen ${i + 1}:`, error);
        break;
      }
    }

    setIsGenerating(false);
    setAnimationState('complete');
  }, []);

  const resetGeneration = useCallback(() => {
    setGeneratedScreens([]);
    setCurrentGeneratingScreen(0);
    setIsGenerating(false);
    setAnimationState('idle');
  }, []);

  return {
    generatedScreens,
    currentGeneratingScreen,
    isGenerating,
    animationState,
    startGeneration,
    resetGeneration,
    totalGenerated: generatedScreens.length
  };
};