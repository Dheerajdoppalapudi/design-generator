// components/WireframeDisplay/MobileWireframeParser.jsx
import React from 'react';
import {
  Typography, Button, Card, Carousel, Input, Avatar, Badge, Progress, Tabs, List, Image, Divider, Steps, Alert, Row, Col, Spin
} from 'antd';
import { 
  HomeOutlined, UserOutlined, CalendarOutlined, HistoryOutlined, SearchOutlined, PlusOutlined, MenuOutlined, HeartOutlined, StarOutlined, BellOutlined, SettingOutlined, BookOutlined, ShareAltOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, ArrowLeftOutlined, ArrowRightOutlined, CameraOutlined, LeftOutlined, RightOutlined, LoadingOutlined, ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
  'arrow-left': ArrowLeftOutlined,
  'arrow-right': ArrowRightOutlined,
  'camera': CameraOutlined
};

const MobileWireframeParser = ({ 
  wireframeData, 
  isDarkMode = false, 
  screenIndex = 0, 
  isLoading = false, 
  isWaiting = false, 
  waitingTime = 0, 
  showAsGenerated = false 
}) => {
  // Show loading state for currently generating screen
  if (isLoading && !showAsGenerated) {
    return (
      <div style={{
        width: '280px',
        height: '500px',
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 40, color: '#1890ff' }} spin />}
          />
          <div style={{
            marginTop: '16px',
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontSize: '14px'
          }}>
            Generating Screen {screenIndex + 1}...
          </div>
        </div>
      </div>
    );
  }

  // Show waiting state for next screen
  if (isWaiting) {
    return (
      <div style={{
        width: '280px',
        height: '500px',
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: isDarkMode ? '2px dashed #52c41a' : '2px dashed #52c41a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `conic-gradient(#52c41a ${(15 - waitingTime) * 24}deg, rgba(82, 196, 26, 0.2) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            margin: '0 auto 16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              color: '#52c41a'
            }}>
              {waitingTime}
            </div>
          </div>
          <div style={{
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontSize: '12px'
          }}>
            Next screen in {waitingTime}s
          </div>
          <div style={{
            color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontSize: '10px',
            marginTop: '4px'
          }}>
            Screen {screenIndex + 1}
          </div>
        </div>
      </div>
    );
  }

  if (!wireframeData || !wireframeData.screens || wireframeData.screens.length === 0) {
    return (
      <div style={{
        width: '280px',
        height: '500px',
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '20px',
        border: isDarkMode ? '2px dashed rgba(255,255,255,0.15)' : '2px dashed rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '20px',
            color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            fontWeight: '600'
          }}>
            {screenIndex + 1}
          </div>
          <Text style={{
            color: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            fontSize: '14px'
          }}>
            Screen {screenIndex + 1}
          </Text>
        </div>
      </div>
    );
  }

  const screen = wireframeData.screens[0];
  const theme = wireframeData.app?.theme || {};

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
        // Handle arrays by mapping each item to safe string
        safe[key] = value.map(item =>
          typeof item === 'object' ? item : safeToString(item)
        );
      } else {
        safe[key] = safeToString(value);
      }
    });
    return safe;
  };

  // Component renderer based on type
  const renderComponent = (component, index) => {
    const { type, dataProperties = {}, designProperties = {} } = component;
    const IconComponent = iconMap[dataProperties.icon] || null;

    // Get safe data properties
    const safeData = getSafeDataProperties(dataProperties);

    const baseStyle = {
      backgroundColor: designProperties.backgroundColor || theme.surface || '#ffffff',
      color: designProperties.textColor || theme.text || '#262626',
      borderRadius: designProperties.borderRadius || 0,
      padding: designProperties.padding || 0,
      margin: designProperties.margin || 0,
      height: designProperties.height || 'auto',
      width: designProperties.width || '100%',
      ...(!designProperties.bordered && { border: 'none' })
    };

    switch (type) {
      case 'Header':
        return (
          <div
            key={component.id || index}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: designProperties.alignment || 'center',
              padding: '8px 12px',
              fontSize: '12px',
              boxShadow: designProperties.elevation > 0 ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 'none'
            }}
          >
            {designProperties.hasBack && (
              <ArrowLeftOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
            )}
            <div style={{ flex: 1, textAlign: designProperties.alignment || 'center' }}>
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: designProperties.textColor || '#fff',
                  fontSize: '12px'
                }}
              >
                {safeData.title || 'Header'}
              </Title>
              {safeData.subtitle && (
                <Text style={{
                  color: designProperties.textColor || '#fff',
                  opacity: 0.8,
                  fontSize: '10px'
                }}>
                  {safeData.subtitle}
                </Text>
              )}
            </div>
            {designProperties.hasMenu && (
              <MenuOutlined style={{ fontSize: '12px' }} />
            )}
          </div>
        );

      case 'Button':
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            <Button
              type={designProperties.variant === 'solid' ? 'primary' : 'default'}
              size="small"
              block={designProperties.full}
              disabled={designProperties.disabled}
              icon={IconComponent ? <IconComponent style={{ fontSize: '10px' }} /> : null}
              style={{
                ...baseStyle,
                borderRadius: designProperties.borderRadius || '4px',
                height: '24px',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              {safeData.text || 'Button'}
            </Button>
          </div>
        );

      case 'Card':
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            <Card
              size="small"
              style={{
                ...baseStyle,
                fontSize: '10px',
                boxShadow: designProperties.elevation > 0 ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 'none'
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
                  {safeData.title && (
                    <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '2px' }}>
                      {safeData.title}
                    </div>
                  )}
                  {safeData.description && (
                    <div style={{ color: designProperties.textColor || '#666', fontSize: '8px' }}>
                      {safeData.description}
                    </div>
                  )}
                </div>
                {safeData.action === 'navigate' && (
                  <ArrowRightOutlined style={{ color: theme.primary || '#1890ff', fontSize: '8px' }} />
                )}
              </div>
            </Card>
          </div>
        );

      case 'Input':
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            {safeData.label && (
              <div style={{
                marginBottom: '2px',
                fontSize: '8px',
                fontWeight: '500',
                color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
              }}>
                {safeData.label}
              </div>
            )}
            <Input
              size="small"
              placeholder={safeData.placeholder || ''}
              style={{
                ...baseStyle,
                height: '20px',
                fontSize: '8px'
              }}
            />
          </div>
        );

      case 'Text':
        return (
          <div
            key={component.id || index}
            style={{
              ...baseStyle,
              fontSize: '8px',
              fontWeight: designProperties.fontWeight || 'normal',
              textAlign: designProperties.alignment || 'left',
              lineHeight: 1.4,
              padding: '4px 8px'
            }}
          >
            {safeData.content || 'Text content'}
          </div>
        );

      case 'List':
        const listItems = Array.isArray(dataProperties.items) ? dataProperties.items : [];
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            <List
              size="small"
              style={{ ...baseStyle, fontSize: '8px' }}
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
        );

      case 'Divider':
        return (
          <Divider
            key={component.id || index}
            style={{
              margin: '4px 8px',
              borderColor: designProperties.borderColor || theme.border
            }}
          />
        );

      case 'Image':
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            <div style={{
              ...baseStyle,
              height: designProperties.height || '80px',
              borderRadius: designProperties.borderRadius || '4px',
              overflow: 'hidden',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {safeData.src ? (
                <img
                  src={safeData.src}
                  alt={safeData.alt || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: designProperties.objectFit || 'cover'
                  }}
                />
              ) : (
                <div style={{ fontSize: '8px', color: '#999' }}>
                  📷 Image
                </div>
              )}
            </div>
          </div>
        );

      case 'Carousel':
        const carouselItems = Array.isArray(dataProperties.items) ? dataProperties.items : [];
        return (
          <div key={component.id || index} style={{ padding: '4px 8px' }}>
            <div style={{
              ...baseStyle,
              borderRadius: designProperties.borderRadius || '8px',
              overflow: 'hidden',
              height: '80px',
              background: `linear-gradient(135deg, ${theme.primary || '#1890ff'}, ${theme.secondary || '#52c41a'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '600' }}>
                  {(carouselItems[0]?.title) || 'Carousel'}
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>
                  {(carouselItems[0]?.description) || 'Slideshow content'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            key={component.id || index}
            style={{
              ...baseStyle,
              padding: '8px',
              border: '1px dashed #ccc',
              textAlign: 'center',
              color: '#666',
              fontSize: '8px',
              margin: '4px 8px'
            }}
          >
            <Text style={{ fontSize: '8px' }}>{type}</Text>
          </div>
        );
    }
  };

  return (
    <div style={{
      width: '280px',
      height: '500px',
      background: theme.background || '#f5f5f5',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '6px solid #333',
      position: 'relative'
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
        color: '#fff'
      }}>
        <span>9:41</span>
        <span>•••• WiFi 100%</span>
      </div>

      {/* Screen Content */}
      <div style={{
        background: theme.background || '#f5f5f5',
        height: 'calc(500px - 60px)',
        overflow: 'auto'
      }}>
        <div>
          {screen.components?.map((component, index) =>
            renderComponent(component, index)
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {wireframeData.app?.nav?.type === 'tabs' && (
        <div style={{
          height: '44px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '4px 0'
        }}>
          {wireframeData.app.nav.items?.slice(0, 5).map((item, index) => {
            const IconComponent = iconMap[item.icon] || HomeOutlined;
            const isActive = item.screen === screen.name;

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
                <IconComponent style={{ fontSize: '12px' }} />
                <span style={{ fontSize: '6px' }}>{safeToString(item.name)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '8px',
        textAlign: 'center'
      }}>
        <div><strong>Screen {screenIndex + 1}: {safeToString(screen.title)}</strong></div>
        <div>{screen.components?.length || 0} components</div>
      </div>
    </div>
  );
};

export default MobileWireframeParser;