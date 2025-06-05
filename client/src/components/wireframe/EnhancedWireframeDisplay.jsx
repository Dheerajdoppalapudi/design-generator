// components/wireframe/EnhancedWireframeDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Button, Tabs, Row, Col, Card, Typography, Switch, Slider } from 'antd';
import { 
  AppstoreOutlined, 
  MobileOutlined, 
  CodeOutlined, 
  PlayCircleOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  SettingOutlined
} from '@ant-design/icons';

import { MobileCanvas } from './MobileCanvas';
import { ComponentLibrary } from './ComponentFactory';
import { AnimationController, useAnimationQueue, useAnimatedWireframeGeneration } from './AnimationController';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const EnhancedWireframeDisplay = ({
  wireframeData,
  wireframeScreens = [],
  isDarkMode = false,
  isMultiScreen = false,
  totalScreens = 0,
  currentGeneratingIndex = 0,
  isLoading = false,
  isWaitingBetweenRequests = false,
  waitingCountdown = 0,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
  onGenerateNewScreen
}) => {
  const [viewMode, setViewMode] = useState('canvas');
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showAnimationControls, setShowAnimationControls] = useState(true);
  const [canvasScale, setCanvasScale] = useState(1);

  // Animation management
  const {
    animationQueue,
    currentIndex: animationIndex,
    isAnimating,
    animationSpeed,
    completedComponents,
    animationProgress,
    startAnimation,
    pauseAnimation,
    resetAnimation,
    skipAnimation,
    completeCurrentComponent,
    totalComponents,
    currentComponent
  } = useAnimationQueue(isMultiScreen ? wireframeScreens[currentScreenIndex] : wireframeData);

  // Multi-screen generation animation
  const {
    generatedScreens,
    currentGeneratingScreen,
    isGenerating,
    animationState,
    startGeneration,
    resetGeneration,
    totalGenerated
  } = useAnimatedWireframeGeneration();

  // Auto-scroll to show the latest generated screen
  useEffect(() => {
    if (isMultiScreen && wireframeScreens.length > 0) {
      setCurrentScreenIndex(wireframeScreens.length - 1);
    }
  }, [wireframeScreens.length, isMultiScreen]);

  // Handle component drag from library
  const handleComponentDragStart = (e, componentData) => {
    e.dataTransfer.setData('component', JSON.stringify(componentData));
  };

  // Current screen data
  const getCurrentScreenData = () => {
    if (isMultiScreen && wireframeScreens.length > 0) {
      return wireframeScreens[currentScreenIndex];
    }
    return wireframeData;
  };

  const currentScreenData = getCurrentScreenData();
  const screensData = isMultiScreen ? wireframeScreens : [wireframeData].filter(Boolean);

  // Generate available components for the library
  const getAvailableComponents = () => {
    const allComponents = [];
    screensData.forEach(screen => {
      if (screen?.screens?.[0]?.components) {
        screen.screens[0].components.forEach(comp => {
          if (!allComponents.find(existing => existing.type === comp.type)) {
            allComponents.push({
              type: comp.type,
              name: comp.type,
              icon: getComponentIcon(comp.type)
            });
          }
        });
      }
    });
    return allComponents;
  };

  const getComponentIcon = (type) => {
    const icons = {
      'Header': '📄',
      'Button': '🔘',
      'Card': '🃏',
      'Input': '📝',
      'Text': '📰',
      'List': '📋',
      'Carousel': '🎠',
      'Divider': '➖'
    };
    return icons[type] || '📦';
  };

  const handleStartLiveGeneration = async () => {
    if (onGenerateNewScreen) {
      await startGeneration(totalScreens - wireframeScreens.length, async (screenIndex) => {
        return await onGenerateNewScreen(wireframeScreens.length + screenIndex);
      });
    }
  };

  return (
    <div style={{ 
      background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
      minHeight: '600px',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header Controls */}
      <div style={{
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        padding: '12px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{
            margin: 0,
            color: isDarkMode ? '#fff' : '#000'
          }}>
            Interactive Wireframe Canvas
          </Title>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <Button.Group>
              <Button
                icon={<AppstoreOutlined />}
                type={viewMode === 'canvas' ? 'primary' : 'default'}
                onClick={() => setViewMode('canvas')}
                size="small"
              >
                Canvas
              </Button>
              <Button
                icon={<MobileOutlined />}
                type={viewMode === 'preview' ? 'primary' : 'default'}
                onClick={() => setViewMode('preview')}
                size="small"
              >
                Preview
              </Button>
              <Button
                icon={<CodeOutlined />}
                type={viewMode === 'json' ? 'primary' : 'default'}
                onClick={() => setViewMode('json')}
                size="small"
              >
                JSON
              </Button>
            </Button.Group>

            {/* Edit Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={{ 
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '12px'
              }}>
                Edit Mode
              </Text>
              <Switch
                checked={isEditMode}
                onChange={setIsEditMode}
                size="small"
              />
            </div>

            {/* Scale Control */}
            {viewMode === 'canvas' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                minWidth: '120px'
              }}>
                <Text style={{ 
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: '12px'
                }}>
                  Scale
                </Text>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={canvasScale}
                  onChange={setCanvasScale}
                  style={{ width: '80px', margin: 0 }}
                />
                <Text style={{ 
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: '10px',
                  minWidth: '30px'
                }}>
                  {Math.round(canvasScale * 100)}%
                </Text>
              </div>
            )}

            {/* Live Generation Button */}
            {isMultiScreen && wireframeScreens.length < totalScreens && (
              <Button
                icon={<PlayCircleOutlined />}
                type="primary"
                onClick={handleStartLiveGeneration}
                loading={isGenerating}
                size="small"
              >
                Live Generate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
        {/* Component Library Sidebar */}
        {viewMode === 'canvas' && isEditMode && (
          <ComponentLibrary
            isDarkMode={isDarkMode}
            onComponentDragStart={handleComponentDragStart}
            availableComponents={getAvailableComponents()}
            isGenerating={isGenerating || isLoading}
          />
        )}

        {/* Main Canvas Area */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          overflowY: 'auto'
        }}>
          {/* Animation Controls */}
          {showAnimationControls && viewMode === 'canvas' && totalComponents > 0 && (
            <AnimationController
              wireframeData={currentScreenData}
              isAnimating={isAnimating}
              onStartAnimation={startAnimation}
              onPauseAnimation={pauseAnimation}
              onResetAnimation={resetAnimation}
              onSkipAnimation={skipAnimation}
              animationProgress={animationProgress}
              currentComponentIndex={completedComponents.length}
              totalComponents={totalComponents}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Multi-screen navigation */}
          {isMultiScreen && screensData.length > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              padding: '12px 20px'
            }}>
              <Button
                icon={<LeftOutlined />}
                disabled={currentScreenIndex === 0}
                onClick={() => setCurrentScreenIndex(prev => Math.max(0, prev - 1))}
                size="small"
              >
                Previous
              </Button>

              <Text style={{
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: '120px',
                textAlign: 'center'
              }}>
                Screen {currentScreenIndex + 1} of {screensData.length}
              </Text>

              <Button
                icon={<RightOutlined />}
                disabled={currentScreenIndex === screensData.length - 1}
                onClick={() => setCurrentScreenIndex(prev => Math.min(screensData.length - 1, prev + 1))}
                size="small"
              >
                Next
              </Button>
            </div>
          )}

          {/* Canvas Content */}
          <div style={{
            transform: `scale(${canvasScale})`,
            transformOrigin: 'center top',
            transition: 'transform 0.2s ease'
          }}>
            {viewMode === 'canvas' ? (
              currentScreenData ? (
                <MobileCanvas
                  wireframeData={currentScreenData}
                  isDarkMode={isDarkMode}
                  screenIndex={currentScreenIndex}
                  isEditable={isEditMode}
                  onComponentUpdate={onComponentUpdate}
                  onComponentDelete={onComponentDelete}
                  onComponentAdd={onComponentAdd}
                  isAnimating={isAnimating}
                  animationQueue={isAnimating ? [currentComponent].filter(Boolean) : []}
                  onAnimationComplete={completeCurrentComponent}
                />
              ) : (
                <div style={{
                  width: '280px',
                  height: '500px',
                  borderRadius: '20px',
                  border: isDarkMode ? '2px dashed rgba(255,255,255,0.15)' : '2px dashed rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>
                      📱
                    </div>
                    <Text style={{
                      color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                      fontSize: '14px'
                    }}>
                      No wireframe data available
                    </Text>
                    <br />
                    <Text style={{
                      color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                      fontSize: '12px'
                    }}>
                      Generate wireframes to get started
                    </Text>
                  </div>
                </div>
              )
            ) : viewMode === 'preview' ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
              }}>
                {/* Preview Mode - Static view */}
                {currentScreenData ? (
                  <MobileCanvas
                    wireframeData={currentScreenData}
                    isDarkMode={isDarkMode}
                    screenIndex={currentScreenIndex}
                    isEditable={false}
                    isAnimating={false}
                  />
                ) : (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: isDarkMode ? '#fff' : '#000'
                  }}>
                    <Text>No wireframe data available for preview</Text>
                  </div>
                )}

                {/* Screen overview for multi-screen */}
                {isMultiScreen && screensData.length > 1 && (
                  <div style={{ width: '100%', maxWidth: '800px' }}>
                    <Title level={5} style={{
                      color: isDarkMode ? '#fff' : '#000',
                      textAlign: 'center',
                      marginBottom: '20px'
                    }}>
                      All Screens Overview
                    </Title>

                    <Row gutter={[16, 16]} justify="center">
                      {screensData.map((screenData, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={6}>
                          <Card
                            hoverable
                            style={{
                              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                              border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
                              cursor: 'pointer'
                            }}
                            bodyStyle={{ padding: '12px' }}
                            onClick={() => setCurrentScreenIndex(index)}
                          >
                            <div style={{
                              width: '100%',
                              height: '120px',
                              background: currentScreenIndex === index
                                ? (isDarkMode ? '#1890ff' : '#1890ff')
                                : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '8px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                fontSize: '10px',
                                color: currentScreenIndex === index ? '#fff' : (isDarkMode ? '#fff' : '#666'),
                                textAlign: 'center'
                              }}>
                                Screen {index + 1}
                                <br />
                                {screenData?.screens?.[0]?.components?.length || 0} components
                              </div>
                            </div>

                            <Text style={{
                              color: isDarkMode ? '#fff' : '#000',
                              fontSize: '14px',
                              fontWeight: currentScreenIndex === index ? '600' : '400',
                              display: 'block',
                              textAlign: 'center'
                            }}>
                              {screenData?.screens?.[0]?.title || `Screen ${index + 1}`}
                            </Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>
            ) : (
              /* JSON View */
              <div style={{ width: '100%', maxWidth: '800px' }}>
                {screensData.length > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <Button
                      icon={<LeftOutlined />}
                      disabled={currentScreenIndex === 0}
                      onClick={() => setCurrentScreenIndex(prev => Math.max(0, prev - 1))}
                      size="small"
                    >
                      Previous JSON
                    </Button>

                    <Text style={{
                      color: isDarkMode ? '#fff' : '#000',
                      fontSize: '16px',
                      fontWeight: '500',
                      minWidth: '120px',
                      textAlign: 'center'
                    }}>
                      Screen {currentScreenIndex + 1} of {screensData.length}
                    </Text>

                    <Button
                      icon={<RightOutlined />}
                      disabled={currentScreenIndex === screensData.length - 1}
                      onClick={() => setCurrentScreenIndex(prev => Math.min(screensData.length - 1, prev + 1))}
                      size="small"
                    >
                      Next JSON
                    </Button>
                  </div>
                )}

                {currentScreenData ? (
                  <pre style={{
                    background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                    padding: '20px',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    color: isDarkMode ? '#e6e6e6' : '#333',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    maxHeight: '600px',
                    overflow: 'auto',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
                  }}>
                    {JSON.stringify(currentScreenData, null, 2)}
                  </pre>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 0',
                    color: isDarkMode ? '#fff' : '#000'
                  }}>
                    <Text>No JSON data available</Text>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generation Progress for Multi-screen */}
          {isMultiScreen && isLoading && (
            <div style={{
              width: '100%',
              maxWidth: '600px',
              background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <Title level={5} style={{
                color: isDarkMode ? '#fff' : '#000',
                marginBottom: '16px'
              }}>
                🚀 Generating Wireframes
              </Title>

              <div style={{ marginBottom: '12px' }}>
                <Text style={{
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                  fontSize: '14px'
                }}>
                  {isWaitingBetweenRequests
                    ? `⏱️ Next screen in ${waitingCountdown}s`
                    : `⚡ Generating screen ${currentGeneratingIndex + 1} of ${totalScreens}`
                  }
                </Text>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px'
              }}>
                {Array.from({ length: totalScreens }, (_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: index < wireframeScreens.length
                        ? '#52c41a'  // Completed
                        : index === currentGeneratingIndex
                          ? '#1890ff'  // Current
                          : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'), // Pending
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>

              <Text style={{
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                fontSize: '12px',
                display: 'block',
                marginTop: '8px'
              }}>
                {wireframeScreens.length} of {totalScreens} screens completed
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text style={{
          color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontSize: '12px'
        }}>
          {isMultiScreen 
            ? `${screensData.length} screens available • ${screensData.reduce((total, screen) => total + (screen?.screens?.[0]?.components?.length || 0), 0)} total components`
            : `${currentScreenData?.screens?.[0]?.components?.length || 0} components in this screen`
          }
        </Text>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            icon={<SettingOutlined />}
            size="small"
            onClick={() => setShowAnimationControls(!showAnimationControls)}
            type={showAnimationControls ? 'primary' : 'default'}
          >
            Animation Controls
          </Button>

          <Button
            icon={<FullscreenOutlined />}
            size="small"
            onClick={() => setCanvasScale(canvasScale === 1 ? 1.5 : 1)}
          >
            {canvasScale === 1 ? 'Zoom In' : 'Reset Zoom'}
          </Button>
        </div>
      </div>
    </div>
  );
};