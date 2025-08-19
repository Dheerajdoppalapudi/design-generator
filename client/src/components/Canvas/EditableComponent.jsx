// components/Canvas/EditableComponent.jsx
import React from 'react';
import { Typography, Button, Card, Input, List, Divider, Image } from 'antd';
import { 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  MenuOutlined,
  HomeOutlined,
  UserOutlined,
  StarOutlined,
  SearchOutlined,
  PlusOutlined,
  HeartOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Icon mapping for components
const iconMap = {
  'home': HomeOutlined,
  'user': UserOutlined,
  'star': StarOutlined,
  'search': SearchOutlined,
  'plus': PlusOutlined,
  'heart': HeartOutlined,
  'bell': BellOutlined,
  'settings': SettingOutlined,
  'menu': MenuOutlined
};

const EditableComponent = ({ 
  component, 
  isSelected, 
  isDarkMode, 
  onClick, 
  onUpdate 
}) => {
  const { type, dataProperties = {}, designProperties = {} } = component;
  
  // Helper function to safely convert values to strings
  const safeToString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Base styling that applies to all components
  const baseStyle = {
    backgroundColor: designProperties.backgroundColor || '#ffffff',
    color: designProperties.textColor || '#262626',
    borderRadius: designProperties.borderRadius || 0,
    padding: designProperties.padding || 0,
    margin: designProperties.margin || '4px 8px',
    width: designProperties.width || '100%',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease'
  };

  // Handle inline text editing
  const handleTextEdit = (field, value) => {
    onUpdate({
      dataProperties: {
        ...dataProperties,
        [field]: value
      }
    });
  };

  // Render component based on type
  const renderComponentContent = () => {
    const IconComponent = iconMap[dataProperties.icon] || null;

    switch (type) {
      case 'Header':
        return (
          <div
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: designProperties.alignment || 'center',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: designProperties.elevation > 0 
                ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` 
                : 'none'
            }}
          >
            {designProperties.hasBack && (
              <ArrowLeftOutlined style={{ marginRight: '12px', fontSize: '16px' }} />
            )}
            
            <div style={{ flex: 1, textAlign: designProperties.alignment || 'center' }}>
              <div
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTextEdit('title', e.target.textContent)}
                style={{
                  outline: 'none',
                  minHeight: '20px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {safeToString(dataProperties.title) || 'Header Title'}
              </div>
              
              {dataProperties.subtitle && (
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleTextEdit('subtitle', e.target.textContent)}
                  style={{
                    outline: 'none',
                    fontSize: '12px',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}
                >
                  {safeToString(dataProperties.subtitle)}
                </div>
              )}
            </div>
            
            {designProperties.hasMenu && (
              <MenuOutlined style={{ fontSize: '16px' }} />
            )}
          </div>
        );

      case 'Button':
        return (
          <div style={{ padding: '8px 16px' }}>
            <Button
              type={designProperties.variant === 'solid' ? 'primary' : 'default'}
              size={designProperties.size || 'middle'}
              block={designProperties.full}
              disabled={designProperties.disabled}
              icon={IconComponent ? <IconComponent style={{ fontSize: '14px' }} /> : null}
              style={{
                ...baseStyle,
                borderRadius: designProperties.borderRadius || '6px',
                height: designProperties.height || 'auto',
                fontSize: '14px',
                fontWeight: '500',
                border: designProperties.variant === 'outline' 
                  ? `1px solid ${designProperties.backgroundColor || '#1890ff'}` 
                  : 'none'
              }}
            >
              <span
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTextEdit('text', e.target.textContent)}
                style={{ outline: 'none' }}
              >
                {safeToString(dataProperties.text) || 'Button Text'}
              </span>
            </Button>
          </div>
        );

      case 'Card':
        return (
          <div style={{ padding: '8px 16px' }}>
            <Card
              size="small"
              style={{
                ...baseStyle,
                boxShadow: designProperties.elevation > 0 
                  ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` 
                  : 'none'
              }}
              bodyStyle={{ padding: '16px' }}
              hoverable={designProperties.hoverable}
              bordered={designProperties.bordered !== false}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {IconComponent && (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}>
                    <IconComponent style={{ fontSize: '18px' }} />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  {dataProperties.title && (
                    <div
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleTextEdit('title', e.target.textContent)}
                      style={{
                        outline: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '4px',
                        color: designProperties.textColor || '#262626'
                      }}
                    >
                      {safeToString(dataProperties.title)}
                    </div>
                  )}
                  
                  {dataProperties.description && (
                    <div
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleTextEdit('description', e.target.textContent)}
                      style={{
                        outline: 'none',
                        fontSize: '14px',
                        color: designProperties.textColor || '#666',
                        lineHeight: '1.4'
                      }}
                    >
                      {safeToString(dataProperties.description)}
                    </div>
                  )}
                </div>

                {dataProperties.action === 'navigate' && (
                  <ArrowRightOutlined style={{ 
                    color: '#1890ff', 
                    fontSize: '14px',
                    flexShrink: 0
                  }} />
                )}
              </div>
            </Card>
          </div>
        );

      case 'Input':
        return (
          <div style={{ padding: '8px 16px' }}>
            {dataProperties.label && (
              <div
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTextEdit('label', e.target.textContent)}
                style={{
                  outline: 'none',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                }}
              >
                {safeToString(dataProperties.label)}
              </div>
            )}
            
            <Input
              placeholder={dataProperties.placeholder || 'Enter text...'}
              value={dataProperties.value || ''}
              style={{
                ...baseStyle,
                height: designProperties.height || '40px',
                fontSize: '14px'
              }}
              onChange={(e) => handleTextEdit('value', e.target.value)}
            />
            
            {dataProperties.helperText && (
              <div
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => handleTextEdit('helperText', e.target.textContent)}
                style={{
                  outline: 'none',
                  marginTop: '4px',
                  fontSize: '12px',
                  color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
                }}
              >
                {safeToString(dataProperties.helperText)}
              </div>
            )}
          </div>
        );

      case 'Text':
        return (
          <div
            contentEditable
            suppressContentEditableWarning={true}
            onBlur={(e) => handleTextEdit('content', e.target.textContent)}
            style={{
              ...baseStyle,
              fontSize: designProperties.fontSize || '14px',
              fontWeight: designProperties.fontWeight || 'normal',
              textAlign: designProperties.alignment || 'left',
              lineHeight: designProperties.lineHeight || 1.5,
              padding: '8px 16px',
              outline: 'none',
              minHeight: '20px'
            }}
          >
            {safeToString(dataProperties.content) || 'Text content here'}
          </div>
        );

      case 'List':
        const listItems = Array.isArray(dataProperties.items) 
          ? dataProperties.items 
          : ['Item 1', 'Item 2', 'Item 3'];
          
        return (
          <div style={{ padding: '8px 16px' }}>
            <List
              size="small"
              style={{ ...baseStyle }}
              dataSource={listItems.slice(0, 5)} // Limit items for canvas
              renderItem={(item, index) => (
                <List.Item
                  style={{
                    padding: '8px 0',
                    borderBottom: `1px solid ${designProperties.dividerColor || '#f0f0f0'}`,
                    fontSize: '14px'
                  }}
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => {
                      const newItems = [...listItems];
                      newItems[index] = e.target.textContent;
                      onUpdate({
                        dataProperties: {
                          ...dataProperties,
                          items: newItems
                        }
                      });
                    }}
                    style={{ outline: 'none' }}
                  >
                    {typeof item === 'object' 
                      ? (item.title || item.name || safeToString(item))
                      : safeToString(item)
                    }
                  </span>
                </List.Item>
              )}
            />
          </div>
        );

      case 'Image':
        return (
          <div style={{ padding: '8px 16px' }}>
            <div style={{
              ...baseStyle,
              height: designProperties.height || '200px',
              borderRadius: designProperties.borderRadius || '8px',
              overflow: 'hidden',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {dataProperties.src ? (
                <img
                  src={dataProperties.src}
                  alt={dataProperties.alt || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: designProperties.objectFit || 'cover'
                  }}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                  <div>Image placeholder</div>
                </div>
              )}
              
              {dataProperties.caption && (
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleTextEdit('caption', e.target.textContent)}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    padding: '8px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                >
                  {safeToString(dataProperties.caption)}
                </div>
              )}
            </div>
          </div>
        );

      case 'Divider':
        return (
          <Divider
            style={{
              margin: designProperties.margin || '16px 8px',
              borderColor: designProperties.borderColor || '#f0f0f0'
            }}
          />
        );

      case 'Carousel':
        const carouselItems = Array.isArray(dataProperties.items) 
          ? dataProperties.items 
          : [{ title: 'Slide 1', description: 'First slide' }];
          
        return (
          <div style={{ padding: '8px 16px' }}>
            <div style={{
              ...baseStyle,
              borderRadius: designProperties.borderRadius || '8px',
              overflow: 'hidden',
              height: designProperties.height || '200px',
              background: `linear-gradient(135deg, #1890ff, #52c41a)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div>
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const newItems = [...carouselItems];
                    newItems[0] = { ...newItems[0], title: e.target.textContent };
                    onUpdate({
                      dataProperties: {
                        ...dataProperties,
                        items: newItems
                      }
                    });
                  }}
                  style={{
                    outline: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                >
                  {carouselItems[0]?.title || 'Carousel Title'}
                </div>
                
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(e) => {
                    const newItems = [...carouselItems];
                    newItems[0] = { ...newItems[0], description: e.target.textContent };
                    onUpdate({
                      dataProperties: {
                        ...dataProperties,
                        items: newItems
                      }
                    });
                  }}
                  style={{
                    outline: 'none',
                    fontSize: '14px',
                    opacity: 0.9
                  }}
                >
                  {carouselItems[0]?.description || 'Carousel description'}
                </div>
              </div>
              
              {/* Carousel indicators */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px'
              }}>
                {carouselItems.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === 0 ? '#fff' : 'rgba(255,255,255,0.5)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            style={{
              ...baseStyle,
              padding: '16px',
              border: '2px dashed #ccc',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px',
              margin: '8px 16px'
            }}
          >
            <div>Unknown Component: {type}</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Object.keys(dataProperties).length} properties
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      onClick={onClick}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #1890ff' : 'none',
        borderRadius: '4px'
      }}
    >
      {renderComponentContent()}
      
      {/* Component label for editing */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-24px',
          left: '0',
          background: '#1890ff',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '500',
          pointerEvents: 'none'
        }}>
          {type} • Click to edit
        </div>
      )}
    </div>
  );
};

export default EditableComponent;