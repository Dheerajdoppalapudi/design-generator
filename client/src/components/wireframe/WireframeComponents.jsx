// components/wireframe/WireframeComponents.jsx - Fixed version with text editing
import React, { useState, useRef, useEffect } from 'react';
import { Typography, Button, Card, Input, List, Divider } from 'antd';
import { 
  ArrowLeftOutlined, MenuOutlined, ArrowRightOutlined,
  HomeOutlined, UserOutlined, CalendarOutlined, HistoryOutlined,
  SearchOutlined, PlusOutlined, HeartOutlined, StarOutlined,
  BellOutlined, SettingOutlined, BookOutlined, ShareAltOutlined,
  EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined,
  CameraOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Icon mapping
const iconMap = {
  'home': HomeOutlined,
  'user': UserOutlined,
  'calendar': CalendarOutlined,
  'history': HistoryOutlined,
  'search': SearchOutlined,
  'plus': PlusOutlined,
  'menu': MenuOutlined,
  'heart': HeartOutlined,
  'star': StarOutlined,
  'bell': BellOutlined,
  'settings': SettingOutlined,
  'bookmark': BookOutlined,
  'share': ShareAltOutlined,
  'edit': EditOutlined,
  'delete': DeleteOutlined,
  'check': CheckOutlined,
  'close': CloseOutlined,
  'camera': CameraOutlined
};

// Helper function to safely convert any value to string
const safeToString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Helper function to safely process data properties
const getSafeDataProperties = (dataProperties) => {
  const safe = {};
  Object.keys(dataProperties).forEach(key => {
    const value = dataProperties[key];
    if (Array.isArray(value)) {
      safe[key] = value.map(item =>
        typeof item === 'object' ? item : safeToString(item)
      );
    } else {
      safe[key] = safeToString(value);
    }
  });
  return safe;
};

// Editable Text Component
const EditableText = ({ 
  text, 
  onTextChange, 
  style = {}, 
  placeholder = "Click to edit",
  multiline = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onTextChange(editValue);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(text || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return multiline ? (
      <Input.TextArea
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        style={{
          ...style,
          fontSize: style.fontSize || '8px',
          padding: '2px 4px',
          minHeight: '20px',
          resize: 'none'
        }}
        placeholder={placeholder}
        autoSize={{ minRows: 1, maxRows: 3 }}
      />
    ) : (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyPress={handleKeyPress}
        style={{
          ...style,
          fontSize: style.fontSize || '8px',
          padding: '2px 4px',
          height: 'auto',
          minHeight: '16px'
        }}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        ...style,
        cursor: 'text',
        minHeight: '16px',
        padding: '2px',
        border: '1px solid transparent',
        borderRadius: '2px'
      }}
      onMouseEnter={(e) => {
        e.target.style.border = '1px dashed #d9d9d9';
      }}
      onMouseLeave={(e) => {
        e.target.style.border = '1px solid transparent';
      }}
    >
      {text || placeholder}
    </div>
  );
};

// Base wrapper for draggable components
export const DraggableWrapper = ({ 
  children, 
  id, 
  position, 
  onDrag, 
  onSelect, 
  isSelected, 
  isEditable = true,
  style = {}
}) => {
  const handleMouseDown = (e) => {
    if (!isEditable) return;
    
    e.preventDefault();
    onSelect(id);
    
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      onDrag(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: isEditable ? 'move' : 'default',
        border: isSelected ? '2px solid #1890ff' : '2px solid transparent',
        borderRadius: '4px',
        zIndex: isSelected ? 1000 : 1,
        ...style
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {isSelected && isEditable && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '16px',
          height: '16px',
          background: '#1890ff',
          borderRadius: '50%',
          cursor: 'grab',
          border: '2px solid white'
        }} />
      )}
    </div>
  );
};

// Header Component
export const HeaderComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);

  const handleTextChange = (field, newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          [field]: newValue
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div
        style={{
          backgroundColor: designProperties.backgroundColor || theme.surface || '#1890ff',
          color: designProperties.textColor || theme.text || '#ffffff',
          borderRadius: designProperties.borderRadius || 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: designProperties.alignment || 'center',
          padding: '8px 12px',
          fontSize: '12px',
          width: '248px',
          boxShadow: designProperties.elevation > 0 ? 
            `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 
            'none'
        }}
      >
        {designProperties.hasBack && (
          <ArrowLeftOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
        )}
        <div style={{ flex: 1, textAlign: designProperties.alignment || 'center' }}>
          <EditableText
            text={safeData.title || 'Header'}
            onTextChange={(newValue) => handleTextChange('title', newValue)}
            style={{
              color: designProperties.textColor || '#fff',
              fontSize: '12px',
              fontWeight: '600'
            }}
            placeholder="Header Title"
          />
          {safeData.subtitle && (
            <EditableText
              text={safeData.subtitle}
              onTextChange={(newValue) => handleTextChange('subtitle', newValue)}
              style={{
                color: designProperties.textColor || '#fff',
                opacity: 0.8,
                fontSize: '10px'
              }}
              placeholder="Subtitle"
            />
          )}
        </div>
        {designProperties.hasMenu && (
          <MenuOutlined style={{ fontSize: '12px' }} />
        )}
      </div>
    </DraggableWrapper>
  );
};

// Button Component
export const ButtonComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);
  const IconComponent = iconMap[dataProperties.icon] || null;

  const handleTextChange = (newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          text: newValue
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        <div
          style={{
            backgroundColor: designProperties.backgroundColor || (designProperties.variant === 'solid' ? theme.primary || '#1890ff' : 'transparent'),
            color: designProperties.textColor || (designProperties.variant === 'solid' ? '#fff' : theme.text),
            borderRadius: designProperties.borderRadius || '4px',
            height: '24px',
            fontSize: '10px',
            fontWeight: '500',
            width: designProperties.full ? '240px' : 'auto',
            minWidth: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            border: designProperties.variant === 'solid' ? 'none' : '1px solid #d9d9d9',
            cursor: 'pointer',
            padding: '0 12px'
          }}
        >
          {IconComponent && <IconComponent style={{ fontSize: '10px' }} />}
          <EditableText
            text={safeData.text || 'Button'}
            onTextChange={handleTextChange}
            style={{
              color: 'inherit',
              fontSize: '10px',
              fontWeight: '500'
            }}
            placeholder="Button Text"
          />
        </div>
      </div>
    </DraggableWrapper>
  );
};

// Card Component
export const CardComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);
  const IconComponent = iconMap[dataProperties.icon] || null;

  const handleTextChange = (field, newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          [field]: newValue
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        <Card
          size="small"
          style={{
            backgroundColor: designProperties.backgroundColor || theme.surface || '#ffffff',
            color: designProperties.textColor || theme.text || '#262626',
            fontSize: '10px',
            width: '240px',
            boxShadow: designProperties.elevation > 0 ? 
              `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 
              'none'
          }}
          bodyStyle={{ padding: '8px' }}
          hoverable={designProperties.hoverable}
          bordered={designProperties.bordered !== false}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {IconComponent && (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                background: theme.primary || '#1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <IconComponent style={{ fontSize: '10px' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <EditableText
                text={safeData.title || 'Card Title'}
                onTextChange={(newValue) => handleTextChange('title', newValue)}
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  marginBottom: '2px',
                  display: 'block'
                }}
                placeholder="Card Title"
              />
              <EditableText
                text={safeData.description || 'Card description'}
                onTextChange={(newValue) => handleTextChange('description', newValue)}
                style={{
                  color: designProperties.textColor || '#666',
                  fontSize: '8px',
                  display: 'block'
                }}
                placeholder="Card description"
                multiline={true}
              />
            </div>
            {safeData.action === 'navigate' && (
              <ArrowRightOutlined style={{ color: theme.primary || '#1890ff', fontSize: '8px' }} />
            )}
          </div>
        </Card>
      </div>
    </DraggableWrapper>
  );
};

// Input Component
export const InputComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);

  const handleTextChange = (field, newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          [field]: newValue
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        {safeData.label && (
          <EditableText
            text={safeData.label}
            onTextChange={(newValue) => handleTextChange('label', newValue)}
            style={{
              marginBottom: '2px',
              fontSize: '8px',
              fontWeight: '500',
              color: designProperties.textColor || theme.text || '#333',
              display: 'block'
            }}
            placeholder="Label"
          />
        )}
        <Input
          size="small"
          placeholder={safeData.placeholder || 'Enter text...'}
          style={{
            backgroundColor: designProperties.backgroundColor || theme.surface || '#ffffff',
            color: designProperties.textColor || theme.text || '#262626',
            height: '20px',
            fontSize: '8px',
            width: '240px'
          }}
        />
      </div>
    </DraggableWrapper>
  );
};

// Text Component
export const TextComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);

  const handleTextChange = (newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          content: newValue
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div
        style={{
          backgroundColor: designProperties.backgroundColor || 'transparent',
          padding: '4px',
          width: '240px'
        }}
      >
        <EditableText
          text={safeData.content || 'Text content'}
          onTextChange={handleTextChange}
          style={{
            color: designProperties.textColor || theme.text || '#262626',
            fontSize: '8px',
            fontWeight: designProperties.fontWeight || 'normal',
            textAlign: designProperties.alignment || 'left',
            lineHeight: 1.4
          }}
          placeholder="Text content"
          multiline={true}
        />
      </div>
    </DraggableWrapper>
  );
};

// List Component
export const ListComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const listItems = Array.isArray(dataProperties.items) ? dataProperties.items : ['List Item 1', 'List Item 2', 'List Item 3'];

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        <List
          size="small"
          style={{
            backgroundColor: designProperties.backgroundColor || theme.surface || '#ffffff',
            color: designProperties.textColor || theme.text || '#262626',
            fontSize: '8px',
            width: '240px'
          }}
          dataSource={listItems.slice(0, 3)}
          renderItem={(item, idx) => (
            <List.Item style={{
              padding: '4px 8px',
              borderBottom: `1px solid ${designProperties.dividerColor || '#f0f0f0'}`,
              fontSize: '8px'
            }}>
              <Text style={{ fontSize: '8px' }}>
                {typeof item === 'object'
                  ? (item.title || item.name || safeToString(item))
                  : safeToString(item)
                }
              </Text>
            </List.Item>
          )}
        />
      </div>
    </DraggableWrapper>
  );
};

// Carousel Component
export const CarouselComponent = ({ component, theme, isEditable, onComponentUpdate, ...wrapperProps }) => {
  const { dataProperties = {}, designProperties = {} } = component;
  const safeData = getSafeDataProperties(dataProperties);

  const handleTextChange = (field, newValue) => {
    if (onComponentUpdate) {
      onComponentUpdate(component.id, {
        dataProperties: {
          ...dataProperties,
          items: [{
            ...((dataProperties.items && dataProperties.items[0]) || {}),
            [field]: newValue
          }]
        }
      });
    }
  };

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        <div style={{
          backgroundColor: designProperties.backgroundColor || theme.surface || '#ffffff',
          borderRadius: designProperties.borderRadius || '8px',
          overflow: 'hidden',
          height: '80px',
          width: '240px',
          background: `linear-gradient(135deg, ${theme.primary || '#1890ff'}, ${theme.secondary || '#52c41a'})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <EditableText
            text={(Array.isArray(safeData.items) && safeData.items[0]?.title) || 'Carousel Title'}
            onTextChange={(newValue) => handleTextChange('title', newValue)}
            style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#fff'
            }}
            placeholder="Carousel Title"
          />
          <EditableText
            text={(Array.isArray(safeData.items) && safeData.items[0]?.description) || 'Slideshow content'}
            onTextChange={(newValue) => handleTextChange('description', newValue)}
            style={{
              fontSize: '8px',
              opacity: 0.8,
              color: '#fff'
            }}
            placeholder="Description"
          />
        </div>
      </div>
    </DraggableWrapper>
  );
};

// Divider Component
export const DividerComponent = ({ component, theme, isEditable, ...wrapperProps }) => {
  const { designProperties = {} } = component;

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div style={{ padding: '4px' }}>
        <Divider
          style={{
            margin: '4px 0',
            borderColor: designProperties.borderColor || theme.border || '#d9d9d9',
            width: '240px'
          }}
        />
      </div>
    </DraggableWrapper>
  );
};

// Generic Component for unknown types
export const GenericComponent = ({ component, theme, isEditable, ...wrapperProps }) => {
  const { type } = component;

  return (
    <DraggableWrapper {...wrapperProps} isEditable={isEditable}>
      <div
        style={{
          padding: '8px',
          border: '1px dashed #ccc',
          textAlign: 'center',
          color: '#666',
          fontSize: '8px',
          width: '240px',
          backgroundColor: theme.surface || '#f5f5f5'
        }}
      >
        <Text style={{ fontSize: '8px' }}>{type}</Text>
      </div>
    </DraggableWrapper>
  );
};