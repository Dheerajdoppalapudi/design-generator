// components/wireframe/MobileCanvas.jsx - Fixed version with proper drag & drop
import React, { useState, useCallback, useRef } from 'react';
import { Button, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined, CopyOutlined } from '@ant-design/icons';
import { createComponent, FlyingComponent, createComponentFromDrag } from './ComponentFactory';

const { Text } = Typography;

// Helper function to safely convert any value to string
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const MobileCanvas = ({
  wireframeData,
  isDarkMode = false,
  screenIndex = 0,
  isEditable = true,
  onComponentUpdate,
  onComponentDelete,
  onComponentAdd,
  isAnimating = false,
  animationQueue = [],
  onAnimationComplete
}) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentPositions, setComponentPositions] = useState({});
  const [flyingComponents, setFlyingComponents] = useState([]);
  const [canvasComponents, setCanvasComponents] = useState([]);
  const canvasRef = useRef(null);

  const screen = wireframeData?.screens?.[0];
  const theme = wireframeData?.app?.theme || {};
  const components = screen?.components || [];

  // Combine original components with canvas components
  const allComponents = [...components, ...canvasComponents];

  // Initialize component positions
  React.useEffect(() => {
    if (components.length > 0 && Object.keys(componentPositions).length === 0) {
      const initialPositions = {};
      let yOffset = 60; // Start below status bar and header

      components.forEach((component, index) => {
        const componentId = component.id || `comp-${index}`;
        initialPositions[componentId] = {
          x: 16,
          y: yOffset
        };
        yOffset += getComponentHeight(component.type) + 8;
      });

      setComponentPositions(initialPositions);
    }
  }, [components, componentPositions]);

  // Handle animation queue
  React.useEffect(() => {
    if (isAnimating && animationQueue.length > 0) {
      const nextComponent = animationQueue[0];
      const componentId = nextComponent.id || `temp-${Date.now()}`;
      
      // Calculate target position
      let yOffset = 60;
      
      Object.values(componentPositions).forEach(pos => {
        if (pos.y + 40 > yOffset) {
          yOffset = pos.y + 40 + 8;
        }
      });

      const startPosition = { x: -100, y: yOffset };
      const endPosition = { x: 16, y: yOffset };

      // Create flying component
      setFlyingComponents(prev => [...prev, {
        id: componentId,
        component: nextComponent,
        startPosition,
        endPosition,
        delay: 500
      }]);

      // Set final position
      setTimeout(() => {
        setComponentPositions(prev => ({
          ...prev,
          [componentId]: endPosition
        }));
      }, 1300);
    }
  }, [isAnimating, animationQueue, componentPositions]);

  const getComponentHeight = (type) => {
    switch (type) {
      case 'Header': return 40;
      case 'Button': return 32;
      case 'Card': return 60;
      case 'Input': return 40;
      case 'Text': return 24;
      case 'List': return 80;
      case 'Carousel': return 88;
      case 'Divider': return 16;
      default: return 40;
    }
  };

  const handleComponentDrag = useCallback((componentId, newPosition) => {
    // Constrain to canvas bounds
    const constrainedPosition = {
      x: Math.max(8, Math.min(newPosition.x, 240)),
      y: Math.max(60, Math.min(newPosition.y, 440))
    };
    
    setComponentPositions(prev => ({
      ...prev,
      [componentId]: constrainedPosition
    }));
  }, []);

  const handleComponentSelect = useCallback((componentId) => {
    setSelectedComponent(componentId);
  }, []);

  const handleCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current) {
      setSelectedComponent(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    
    try {
      const componentData = JSON.parse(e.dataTransfer.getData('text/plain'));
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - canvasRect.left;
      const y = e.clientY - canvasRect.top;

      // Create new component using the factory
      const newComponent = createComponentFromDrag(componentData.type, x, y);

      const newPosition = {
        x: Math.max(8, Math.min(x - 120, 240)),
        y: Math.max(60, Math.min(y - 20, 440))
      };

      // Add to canvas components
      setCanvasComponents(prev => [...prev, newComponent]);

      // Set position
      setComponentPositions(prev => ({
        ...prev,
        [newComponent.id]: newPosition
      }));

      if (onComponentAdd) {
        onComponentAdd(newComponent);
      }

      message.success(`${componentData.type} added to canvas`);
    } catch (error) {
      console.error('Error handling drop:', error);
      message.error('Failed to add component');
    }
  }, [onComponentAdd]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFlyingAnimationComplete = useCallback((componentId) => {
    setFlyingComponents(prev => prev.filter(fc => fc.id !== componentId));
    if (onAnimationComplete) {
      onAnimationComplete(componentId);
    }
  }, [onAnimationComplete]);

  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      // Check if it's a canvas component or original component
      const isCanvasComponent = canvasComponents.find(c => c.id === selectedComponent);
      
      if (isCanvasComponent) {
        // Remove from canvas components
        setCanvasComponents(prev => prev.filter(c => c.id !== selectedComponent));
      }

      if (onComponentDelete) {
        onComponentDelete(selectedComponent);
      }
      
      setSelectedComponent(null);
      
      // Remove from positions
      setComponentPositions(prev => {
        const newPositions = { ...prev };
        delete newPositions[selectedComponent];
        return newPositions;
      });

      message.success('Component deleted');
    }
  }, [selectedComponent, canvasComponents, onComponentDelete]);

  const handleDuplicateComponent = useCallback(() => {
    if (selectedComponent) {
      const originalComponent = allComponents.find(c => c.id === selectedComponent);
      if (originalComponent) {
        const duplicatedComponent = {
          ...originalComponent,
          id: `duplicate-${Date.now()}`
        };

        const originalPosition = componentPositions[selectedComponent];
        const newPosition = {
          x: Math.min(originalPosition.x + 20, 240),
          y: Math.min(originalPosition.y + 20, 440)
        };

        // Add to canvas components
        setCanvasComponents(prev => [...prev, duplicatedComponent]);

        setComponentPositions(prev => ({
          ...prev,
          [duplicatedComponent.id]: newPosition
        }));

        if (onComponentAdd) {
          onComponentAdd(duplicatedComponent);
        }

        message.success('Component duplicated');
      }
    }
  }, [selectedComponent, allComponents, componentPositions, onComponentAdd]);

  const handleComponentUpdate = useCallback((componentId, updates) => {
    // Update canvas components
    setCanvasComponents(prev => prev.map(comp => 
      comp.id === componentId 
        ? { ...comp, ...updates }
        : comp
    ));

    if (onComponentUpdate) {
      onComponentUpdate(componentId, updates);
    }
  }, [onComponentUpdate]);

  return (
    <div style={{
      width: '280px',
      height: '500px',
      background: theme.background || '#f5f5f5',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '6px solid #333',
      position: 'relative',
      margin: '0 auto'
    }}>
      {/* Mobile Status Bar */}
      <div style={{
        height: '16px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        fontSize: '8px',
        color: '#fff',
        position: 'relative',
        zIndex: 100
      }}>
        <span>9:41</span>
        <span>•••• WiFi 100%</span>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        style={{
          background: theme.background || '#f5f5f5',
          height: 'calc(500px - 60px)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Render positioned components */}
        {allComponents.map((component, index) => {
          const componentId = component.id || `comp-${index}`;
          const position = componentPositions[componentId] || { x: 16, y: 60 + index * 50 };

          return createComponent(component, theme, {
            position,
            onDrag: handleComponentDrag,
            onSelect: handleComponentSelect,
            onComponentUpdate: handleComponentUpdate,
            isSelected: selectedComponent === componentId,
            isEditable
          });
        })}

        {/* Flying animation components */}
        {flyingComponents.map((flyingComp) => (
          <FlyingComponent
            key={flyingComp.id}
            component={flyingComp.component}
            startPosition={flyingComp.startPosition}
            endPosition={flyingComp.endPosition}
            delay={flyingComp.delay}
            onComplete={() => handleFlyingAnimationComplete(flyingComp.id)}
            theme={theme}
          />
        ))}

        {/* Drop zone indicator */}
        {isEditable && allComponents.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            fontSize: '12px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
            <div>Drag components here</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              or generate wireframe
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {wireframeData?.app?.nav?.type === 'tabs' && (
        <div style={{
          height: '44px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '4px 0',
          position: 'relative',
          zIndex: 100
        }}>
          {wireframeData.app.nav.items?.slice(0, 5).map((item, index) => {
            const isActive = item.screen === screen?.name;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  color: isActive ? (theme.primary || '#1890ff') : '#999',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12px' }}>
                  {item.icon === 'home' ? '🏠' : 
                   item.icon === 'user' ? '👤' : 
                   item.icon === 'search' ? '🔍' : '📄'}
                </div>
                <span style={{ fontSize: '6px' }}>{safeToString(item.name)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Component info overlay */}
      <div style={{
        position: 'absolute',
        bottom: isEditable ? '52px' : '8px',
        left: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '8px',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div><strong>Screen {screenIndex + 1}: {safeToString(screen?.title || 'Canvas')}</strong></div>
        <div>{allComponents.length} components • {canvasComponents.length} added</div>
        {isAnimating && (
          <div style={{ color: '#52c41a', marginTop: '2px' }}>
            ⚡ Animating components...
          </div>
        )}
      </div>

      {/* Floating toolbar for selected component */}
      {selectedComponent && isEditable && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '8px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1001
        }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            style={{ width: '28px', height: '28px', padding: 0 }}
            title="Edit Component"
          />
          <Button
            size="small"
            icon={<CopyOutlined />}
            style={{ width: '28px', height: '28px', padding: 0 }}
            title="Duplicate Component"
            onClick={handleDuplicateComponent}
          />
          <Button
            size="small"
            icon={<DeleteOutlined />}
            danger
            style={{ width: '28px', height: '28px', padding: 0 }}
            title="Delete Component"
            onClick={handleDeleteComponent}
          />
        </div>
      )}
    </div>
  );
};