import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  Carousel, 
  Input,
  Avatar,
  Badge,
  Progress,
  Tabs,
  List,
  Image,
  Divider,
  Steps,
  Alert,
  FloatButton
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  HistoryOutlined,
  SearchOutlined,
  PlusOutlined,
  MenuOutlined,
  HeartOutlined,
  StarOutlined,
  BellOutlined,
  SettingOutlined,
  BookOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CameraOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

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

const MobileWireframeParser = ({ wireframeData, isDarkMode = false }) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  if (!wireframeData || !wireframeData.screens || wireframeData.screens.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: isDarkMode ? '#fff' : '#000'
      }}>
        <Text>No wireframe data available</Text>
      </div>
    );
  }

  const screen = wireframeData.screens[currentScreen];
  const theme = wireframeData.app?.theme || {};

  // Component renderer based on type
  const renderComponent = (component, index) => {
    const { type, dataProperties = {}, designProperties = {} } = component;
    const IconComponent = iconMap[dataProperties.icon] || null;

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
              padding: '12px 16px',
              boxShadow: designProperties.elevation > 0 ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 'none'
            }}
          >
            {designProperties.hasBack && (
              <ArrowLeftOutlined style={{ marginRight: '12px', fontSize: '18px' }} />
            )}
            <div style={{ flex: 1, textAlign: designProperties.alignment || 'center' }}>
              <Title 
                level={4} 
                style={{ 
                  margin: 0, 
                  color: designProperties.textColor || '#fff',
                  fontSize: '18px'
                }}
              >
                {dataProperties.title}
              </Title>
              {dataProperties.subtitle && (
                <Text style={{ 
                  color: designProperties.textColor || '#fff', 
                  opacity: 0.8,
                  fontSize: '14px'
                }}>
                  {dataProperties.subtitle}
                </Text>
              )}
            </div>
            {designProperties.hasMenu && (
              <MenuOutlined style={{ fontSize: '18px' }} />
            )}
          </div>
        );

      case 'Button':
        return (
          <Button
            key={component.id || index}
            type={designProperties.variant === 'solid' ? 'primary' : 'default'}
            size={designProperties.size || 'middle'}
            block={designProperties.full}
            disabled={designProperties.disabled}
            icon={IconComponent ? <IconComponent /> : null}
            style={{
              ...baseStyle,
              borderRadius: designProperties.borderRadius || '6px',
              height: designProperties.height || '40px',
              fontSize: '16px',
              fontWeight: '500'
            }}
            onClick={() => {
              if (dataProperties.action === 'navigate' && dataProperties.navigationScreen) {
                console.log(`Navigate to: ${dataProperties.navigationScreen}`);
              }
            }}
          >
            {dataProperties.text}
          </Button>
        );

      case 'Card':
        return (
          <Card
            key={component.id || index}
            style={{
              ...baseStyle,
              boxShadow: designProperties.elevation > 0 ? `0 ${designProperties.elevation}px ${designProperties.elevation * 2}px rgba(0,0,0,0.1)` : 'none'
            }}
            bodyStyle={{ padding: designProperties.padding || '16px' }}
            hoverable={designProperties.hoverable}
            bordered={designProperties.bordered !== false}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {IconComponent && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: theme.primary || '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <IconComponent style={{ fontSize: '20px' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                {dataProperties.title && (
                  <Title level={5} style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                    {dataProperties.title}
                  </Title>
                )}
                {dataProperties.description && (
                  <Text style={{ color: designProperties.textColor || '#666', fontSize: '14px' }}>
                    {dataProperties.description}
                  </Text>
                )}
              </div>
              {dataProperties.action === 'navigate' && (
                <ArrowRightOutlined style={{ color: theme.primary || '#1890ff' }} />
              )}
            </div>
          </Card>
        );

      case 'Carousel':
        return (
          <Carousel
            key={component.id || index}
            autoplay={designProperties.autoplay}
            dots={designProperties.dots}
            style={{
              ...baseStyle,
              borderRadius: designProperties.borderRadius || '8px',
              overflow: 'hidden'
            }}
          >
            {dataProperties.items?.map((item, idx) => (
              <div key={idx}>
                <div style={{
                  height: designProperties.height || '200px',
                  background: `linear-gradient(135deg, ${theme.primary || '#1890ff'}, ${theme.secondary || '#52c41a'})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div>
                    <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0' }}>
                      {item.title}
                    </Title>
                    <Text style={{ color: '#fff', fontSize: '14px' }}>
                      {item.description}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        );

      case 'Input':
        return (
          <div key={component.id || index} style={{ margin: designProperties.margin || '8px 0' }}>
            {dataProperties.label && (
              <Text style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {dataProperties.label}
              </Text>
            )}
            <Input
              placeholder={dataProperties.placeholder}
              type={designProperties.type || 'text'}
              style={{
                ...baseStyle,
                height: designProperties.height || '40px'
              }}
              required={designProperties.required}
            />
          </div>
        );

      case 'Text':
        return (
          <div
            key={component.id || index}
            style={{
              ...baseStyle,
              fontSize: designProperties.fontSize || '14px',
              fontWeight: designProperties.fontWeight || 'normal',
              textAlign: designProperties.alignment || 'left',
              lineHeight: designProperties.lineHeight || 1.5
            }}
          >
            {dataProperties.content}
          </div>
        );

      case 'Image':
        return (
          <Image
            key={component.id || index}
            src={dataProperties.src}
            alt={dataProperties.alt}
            style={{
              ...baseStyle,
              objectFit: designProperties.objectFit || 'cover'
            }}
            preview={false}
          />
        );

      case 'List':
        const listItems = dataProperties.items || [];
        return (
          <List
            key={component.id || index}
            style={baseStyle}
            dataSource={listItems}
            renderItem={(item, idx) => (
              <List.Item style={{ 
                padding: '12px 16px',
                borderBottom: `1px solid ${designProperties.dividerColor || '#f0f0f0'}`
              }}>
                <Text>{item.title || item}</Text>
              </List.Item>
            )}
            locale={{ emptyText: dataProperties.emptyText || 'No items found' }}
          />
        );

      case 'Divider':
        return (
          <Divider
            key={component.id || index}
            style={{
              margin: designProperties.margin || '16px 0',
              borderColor: designProperties.borderColor || theme.border
            }}
          />
        );

      case 'Fab':
        return (
          <FloatButton
            key={component.id || index}
            icon={IconComponent ? <IconComponent /> : <PlusOutlined />}
            style={{
              backgroundColor: designProperties.backgroundColor || theme.primary,
              color: designProperties.textColor || '#fff'
            }}
            onClick={() => {
              if (dataProperties.action === 'navigate' && dataProperties.screen) {
                console.log(`Navigate to: ${dataProperties.screen}`);
              }
            }}
          />
        );

      default:
        return (
          <div
            key={component.id || index}
            style={{
              ...baseStyle,
              padding: '16px',
              border: '1px dashed #ccc',
              textAlign: 'center',
              color: '#666'
            }}
          >
            <Text>Unknown component: {type}</Text>
          </div>
        );
    }
  };

  return (
    <div style={{
      maxWidth: '375px',
      margin: '20px auto',
      background: theme.background || '#f5f5f5',
      minHeight: '667px',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '8px solid #333',
      position: 'relative'
    }}>
      {/* Mobile Status Bar */}
      <div style={{
        height: '24px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '12px',
        color: '#fff'
      }}>
        <span>9:41</span>
        <span>••••• WiFi 100%</span>
      </div>

      {/* Screen Content */}
      <div style={{
        background: theme.background || '#f5f5f5',
        minHeight: 'calc(667px - 88px)', // Account for status bar and nav
        overflow: 'auto'
      }}>
        {/* Render Components */}
        <div style={{ padding: '0' }}>
          {screen.components?.map((component, index) => 
            renderComponent(component, index)
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {wireframeData.app?.nav?.type === 'tabs' && (
        <div style={{
          height: '64px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 0'
        }}>
          {wireframeData.app.nav.items?.map((item, index) => {
            const IconComponent = iconMap[item.icon] || HomeOutlined;
            const isActive = item.screen === screen.name;
            
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  color: isActive ? (theme.primary || '#1890ff') : '#999',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  // Handle navigation
                  console.log(`Navigate to: ${item.screen}`);
                }}
              >
                <IconComponent style={{ fontSize: '20px' }} />
                <span style={{ fontSize: '10px' }}>{item.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Screen Info Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        opacity: 0.8
      }}>
        <div><strong>{screen.title}</strong></div>
        <div>{screen.components?.length || 0} components</div>
        {screen.nextScreens?.length > 0 && (
          <div>Next: {screen.nextScreens.join(', ')}</div>
        )}
      </div>
    </div>
  );
};

// Example usage with your wireframe data
const WireframeDisplay = ({ wireframeData, isDarkMode }) => {
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' or 'json'

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <Button.Group>
          <Button 
            type={viewMode === 'mobile' ? 'primary' : 'default'}
            onClick={() => setViewMode('mobile')}
          >
            📱 Mobile View
          </Button>
          <Button 
            type={viewMode === 'json' ? 'primary' : 'default'}
            onClick={() => setViewMode('json')}
          >
            📝 JSON View
          </Button>
        </Button.Group>
      </div>

      {viewMode === 'mobile' ? (
        <MobileWireframeParser 
          wireframeData={wireframeData} 
          isDarkMode={isDarkMode} 
        />
      ) : (
        <pre style={{
          background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          overflowX: 'auto',
          color: isDarkMode ? '#e6e6e6' : '#333',
          fontSize: '14px',
          lineHeight: 1.5,
          fontFamily: 'monospace',
          maxHeight: '600px',
          overflow: 'auto'
        }}>
          {JSON.stringify(wireframeData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default WireframeDisplay;