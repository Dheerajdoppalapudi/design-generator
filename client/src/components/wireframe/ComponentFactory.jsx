// components/wireframe/ComponentFactory.jsx - Complete Fixed Version
import React from 'react';
import {
  HeaderComponent,
  ButtonComponent,
  CardComponent,
  InputComponent,
  TextComponent,
  ListComponent,
  CarouselComponent,
  DividerComponent,
  GenericComponent
} from './WireframeComponents';

// Component factory to create components based on type
export const createComponent = (component, theme, props) => {
  const componentProps = {
    component,
    theme,
    key: component.id,
    id: component.id,
    ...props
  };

  switch (component.type) {
    case 'Header':
      return <HeaderComponent {...componentProps} />;
    case 'Button':
      return <ButtonComponent {...componentProps} />;
    case 'Card':
      return <CardComponent {...componentProps} />;
    case 'Input':
      return <InputComponent {...componentProps} />;
    case 'Text':
      return <TextComponent {...componentProps} />;
    case 'List':
      return <ListComponent {...componentProps} />;
    case 'Carousel':
      return <CarouselComponent {...componentProps} />;
    case 'Divider':
      return <DividerComponent {...componentProps} />;
    default:
      return <GenericComponent {...componentProps} />;
  }
};

// Create component from drag data (for new components)
export const createComponentFromDrag = (componentType, x, y) => {
  const componentId = `${componentType.toLowerCase()}-${Date.now()}`;
  
  const baseComponent = {
    id: componentId,
    type: componentType,
    dataProperties: {},
    designProperties: {}
  };

  // Set default properties based on component type
  switch (componentType) {
    case 'Header':
      baseComponent.dataProperties = {
        title: 'New Header',
        subtitle: ''
      };
      baseComponent.designProperties = {
        backgroundColor: '#1890ff',
        textColor: '#ffffff',
        alignment: 'center',
        hasBack: false,
        hasMenu: true
      };
      break;
      
    case 'Button':
      baseComponent.dataProperties = {
        text: 'New Button',
        icon: 'plus'
      };
      baseComponent.designProperties = {
        variant: 'solid',
        full: false
      };
      break;
      
    case 'Card':
      baseComponent.dataProperties = {
        title: 'New Card',
        description: 'Card description goes here',
        action: 'navigate'
      };
      baseComponent.designProperties = {
        elevation: 2,
        hoverable: true,
        bordered: true
      };
      break;
      
    case 'Input':
      baseComponent.dataProperties = {
        label: 'Input Label',
        placeholder: 'Enter text...'
      };
      baseComponent.designProperties = {
        bordered: true
      };
      break;
      
    case 'Text':
      baseComponent.dataProperties = {
        content: 'Sample text content'
      };
      baseComponent.designProperties = {
        fontWeight: 'normal',
        alignment: 'left'
      };
      break;
      
    case 'List':
      baseComponent.dataProperties = {
        items: ['List Item 1', 'List Item 2', 'List Item 3']
      };
      baseComponent.designProperties = {
        dividerColor: '#f0f0f0'
      };
      break;
      
    case 'Carousel':
      baseComponent.dataProperties = {
        items: [
          {
            title: 'Slide 1',
            description: 'First slide content'
          }
        ]
      };
      baseComponent.designProperties = {
        borderRadius: 8
      };
      break;
      
    case 'Divider':
      baseComponent.dataProperties = {};
      baseComponent.designProperties = {
        borderColor: '#d9d9d9'
      };
      break;
      
    default:
      baseComponent.dataProperties = {
        content: `New ${componentType} Component`
      };
      break;
  }

  return baseComponent;
};

// Animation component for flying components
export const FlyingComponent = ({ 
  component, 
  startPosition, 
  endPosition, 
  delay = 0, 
  onComplete, 
  theme 
}) => {
  const [position, setPosition] = React.useState(startPosition);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      // Animate to end position
      const animationTimer = setTimeout(() => {
        setPosition(endPosition);
        
        // Complete animation
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 800); // Animation duration
        
        return () => clearTimeout(completeTimer);
      }, 100);
      
      return () => clearTimeout(animationTimer);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [startPosition, endPosition, delay, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transition: isAnimating ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        transform: isAnimating ? 'none' : 'scale(0.8)',
        opacity: isAnimating ? 1 : 0.8,
        zIndex: 2000,
        pointerEvents: 'none'
      }}
    >
      {createComponent(component, theme, {
        position: { x: 0, y: 0 },
        onDrag: () => {},
        onSelect: () => {},
        isSelected: false,
        isEditable: false
      })}
    </div>
  );
};

// Component library sidebar
export const ComponentLibrary = ({ 
  isDarkMode, 
  onComponentDragStart, 
  availableComponents = [],
  isGenerating = false 
}) => {
  // Always show all component types
  const allComponents = [
    { type: 'Header', icon: '📄', name: 'Header' },
    { type: 'Button', icon: '🔘', name: 'Button' },
    { type: 'Card', icon: '🃏', name: 'Card' },
    { type: 'Input', icon: '📝', name: 'Input' },
    { type: 'Text', icon: '📰', name: 'Text' },
    { type: 'List', icon: '📋', name: 'List' },
    { type: 'Carousel', icon: '🎠', name: 'Carousel' },
    { type: 'Divider', icon: '➖', name: 'Divider' }
  ];

  // Use all components instead of availableComponents for the library
  const componentsToShow = allComponents;

  const handleDragStart = (e, comp) => {
    // Set the drag data properly
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: comp.type,
      name: comp.name,
      icon: comp.icon
    }));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';
    
    // Optional: Set drag image for better UX
    const dragElement = e.target.cloneNode(true);
    dragElement.style.transform = 'rotate(-5deg)';
    dragElement.style.opacity = '0.8';
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-1000px';
    dragElement.style.zIndex = '9999';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 50, 25);
    
    // Clean up drag image after drag starts
    setTimeout(() => {
      if (document.body.contains(dragElement)) {
        document.body.removeChild(dragElement);
      }
    }, 100);
    
    if (onComponentDragStart) {
      onComponentDragStart(e, comp);
    }
  };

  return (
    <div style={{
      width: '200px',
      height: '100%',
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRight: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        color: isDarkMode ? '#fff' : '#000',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        Component Library
      </div>

      {isGenerating && (
        <div style={{
          background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)',
          border: '1px solid #1890ff',
          borderRadius: '6px',
          padding: '8px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ 
            color: '#1890ff', 
            fontSize: '12px', 
            fontWeight: '500' 
          }}>
            ⚡ Generating UI...
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {componentsToShow.map((comp, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, comp)}
            onDragEnd={(e) => {
              e.currentTarget.style.cursor = 'grab';
            }}
            style={{
              padding: '12px 8px',
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              borderRadius: '6px',
              cursor: 'grab',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.cursor = 'grabbing';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.cursor = 'grab';
            }}
          >
            <div style={{ 
              fontSize: '20px', 
              marginBottom: '4px' 
            }}>
              {comp.icon}
            </div>
            <div style={{
              fontSize: '10px',
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
              fontWeight: '500'
            }}>
              {comp.name}
            </div>
          </div>
        ))}
      </div>

      {/* Animation queue display during generation */}
      {isGenerating && availableComponents.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: '8px'
          }}>
            Animation Queue
          </div>
          {availableComponents.map((comp, index) => (
            <div
              key={index}
              style={{
                padding: '4px 8px',
                background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '10px',
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{comp.icon}</span>
              <span>{comp.name}</span>
              <div style={{
                marginLeft: 'auto',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: index === 0 ? '#52c41a' : '#d9d9d9'
              }} />
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderRadius: '6px',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{
          fontSize: '10px',
          color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          lineHeight: 1.4
        }}>
          💡 <strong>Tip:</strong> Drag components to the mobile screen to add them. Click on text in components to edit.
        </div>
      </div>
    </div>
  );
};