// components/ComponentLibrary/ComponentLibraryPanel.jsx
import React, { useState } from 'react';
import { Card, Typography, Space, Button, Collapse, Badge, Input } from 'antd';
import { 
  AppstoreOutlined, 
  SearchOutlined,
  DragOutlined,
  FileTextOutlined,
  ControlOutlined,
  FormOutlined,
  UnorderedListOutlined,
  PictureOutlined,
  MenuOutlined,
  DashboardOutlined,
  StepForwardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Component categories and their available components
const COMPONENT_CATEGORIES = {
  layout: {
    title: 'Layout Components',
    icon: <DashboardOutlined />,
    components: [
      {
        type: 'Header',
        name: 'Header',
        icon: <MenuOutlined />,
        description: 'App header with title and navigation',
        defaultProps: {
          dataProperties: {
            title: 'Header Title',
            subtitle: '',
            description: 'Main header of the screen'
          },
          designProperties: {
            backgroundColor: '#1890ff',
            textColor: '#ffffff',
            height: 60,
            alignment: 'center',
            hasBack: false,
            hasMenu: false,
            elevation: 0
          }
        }
      },
      {
        type: 'Divider',
        name: 'Divider',
        icon: <MenuOutlined style={{ transform: 'rotate(90deg)' }} />,
        description: 'Visual separator between content',
        defaultProps: {
          dataProperties: {},
          designProperties: {
            borderColor: '#f0f0f0',
            margin: '16px 0'
          }
        }
      }
    ]
  },
  content: {
    title: 'Content Components',
    icon: <FileTextOutlined />,
    components: [
      {
        type: 'Text',
        name: 'Text',
        icon: <FileTextOutlined />,
        description: 'Display text content',
        defaultProps: {
          dataProperties: {
            content: 'Your text content here',
            type: 'body'
          },
          designProperties: {
            fontSize: 14,
            fontWeight: 'normal',
            color: '#262626',
            alignment: 'left',
            lineHeight: 1.5,
            margin: 0
          }
        }
      },
      {
        type: 'Card',
        name: 'Card',
        icon: <DashboardOutlined />,
        description: 'Content container with elevation',
        defaultProps: {
          dataProperties: {
            title: 'Card Title',
            subtitle: '',
            description: 'Card description goes here',
            cta: 'Learn More'
          },
          designProperties: {
            backgroundColor: '#ffffff',
            borderColor: '#d9d9d9',
            borderRadius: 8,
            elevation: 1,
            padding: 16,
            margin: 8,
            bordered: true,
            hoverable: false
          }
        }
      },
      {
        type: 'Image',
        name: 'Image',
        icon: <PictureOutlined />,
        description: 'Display images with customizable styling',
        defaultProps: {
          dataProperties: {
            src: 'https://via.placeholder.com/300x200',
            alt: 'Placeholder image',
            caption: ''
          },
          designProperties: {
            width: '100%',
            height: 200,
            borderRadius: 0,
            aspectRatio: '16:9',
            objectFit: 'cover'
          }
        }
      }
    ]
  },
  interactive: {
    title: 'Interactive Components',
    icon: <ControlOutlined />,
    components: [
      {
        type: 'Button',
        name: 'Button',
        icon: <ControlOutlined />,
        description: 'Clickable action button',
        defaultProps: {
          dataProperties: {
            text: 'Click me',
            icon: null,
            action: 'navigate',
            screen: null
          },
          designProperties: {
            variant: 'solid',
            size: 'medium',
            backgroundColor: '#1890ff',
            textColor: '#ffffff',
            borderRadius: 4,
            full: false,
            disabled: false
          }
        }
      },
      {
        type: 'Input',
        name: 'Input Field',
        icon: <FormOutlined />,
        description: 'Text input for user data',
        defaultProps: {
          dataProperties: {
            placeholder: 'Enter text here',
            label: 'Input Label',
            value: '',
            helperText: ''
          },
          designProperties: {
            type: 'text',
            backgroundColor: '#ffffff',
            textColor: '#262626',
            borderColor: '#d9d9d9',
            borderRadius: 4,
            height: 40,
            required: false
          }
        }
      }
    ]
  },
  lists: {
    title: 'List Components',
    icon: <UnorderedListOutlined />,
    components: [
      {
        type: 'List',
        name: 'List',
        icon: <UnorderedListOutlined />,
        description: 'Display lists of items',
        defaultProps: {
          dataProperties: {
            items: ['Item 1', 'Item 2', 'Item 3'],
            emptyText: 'No items found',
            maxItems: null
          },
          designProperties: {
            backgroundColor: '#ffffff',
            itemHeight: 48,
            dividerColor: '#f0f0f0',
            selectable: false,
            searchable: false,
            showMore: false,
            pagination: false
          }
        }
      },
      {
        type: 'Carousel',
        name: 'Carousel',
        icon: <StepForwardOutlined />,
        description: 'Sliding image/content carousel',
        defaultProps: {
          dataProperties: {
            items: [
              { title: 'Slide 1', description: 'First slide content' },
              { title: 'Slide 2', description: 'Second slide content' },
              { title: 'Slide 3', description: 'Third slide content' }
            ]
          },
          designProperties: {
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            height: 200,
            autoplay: true,
            dots: true
          }
        }
      }
    ]
  }
};

const ComponentLibraryPanel = ({ 
  isDarkMode, 
  onComponentDrag, 
  onComponentSelect,
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(['layout', 'content', 'interactive']);

  // Filter components based on search term
  const filterComponents = (components) => {
    if (!searchTerm) return components;
    return components.filter(component =>
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle drag start
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...component,
      id: `${component.type.toLowerCase()}-${Date.now()}`
    }));
    
    if (onComponentDrag) {
      onComponentDrag(component);
    }
  };

  // Get total component count for search results
  const getTotalFilteredComponents = () => {
    return Object.values(COMPONENT_CATEGORIES).reduce((total, category) => {
      return total + filterComponents(category.components).length;
    }, 0);
  };

  const panelStyle = {
    width: isCollapsed ? '60px' : '320px',
    height: '100vh',
    background: isDarkMode ? '#1f1f1f' : '#fafafa',
    borderRight: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
    transition: 'width 0.3s ease',
    overflow: isCollapsed ? 'hidden' : 'auto',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 1000
  };

  const componentItemStyle = (component) => ({
    padding: '12px',
    margin: '8px 0',
    background: isDarkMode ? '#2a2a2a' : '#ffffff',
    border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
    borderRadius: '8px',
    cursor: 'grab',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  });

  if (isCollapsed) {
    return (
      <div style={panelStyle}>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            onClick={onToggleCollapse}
            style={{
              color: isDarkMode ? '#fff' : '#000',
              width: '100%',
              height: '40px'
            }}
          />
        </div>
        
        {/* Collapsed component icons */}
        <div style={{ padding: '8px' }}>
          {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => (
            <div key={key} style={{ marginBottom: '8px', textAlign: 'center' }}>
              <Button
                type="text"
                icon={category.icon}
                size="small"
                style={{
                  color: isDarkMode ? '#fff' : '#666',
                  width: '100%'
                }}
                title={category.title}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
        background: isDarkMode ? '#262626' : '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Title level={4} style={{
            margin: 0,
            color: isDarkMode ? '#fff' : '#000',
            fontSize: '16px'
          }}>
            <AppstoreOutlined style={{ marginRight: '8px' }} />
            Components
          </Title>
          
          <Button
            type="text"
            size="small"
            onClick={onToggleCollapse}
            style={{ color: isDarkMode ? '#fff' : '#666' }}
          >
            <MenuOutlined />
          </Button>
        </div>

        {/* Search */}
        <Input
          placeholder="Search components..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: isDarkMode ? '#1f1f1f' : '#f5f5f5',
            border: 'none'
          }}
        />

        {/* Search results count */}
        {searchTerm && (
          <Text style={{
            fontSize: '12px',
            color: isDarkMode ? '#999' : '#666',
            marginTop: '8px',
            display: 'block'
          }}>
            {getTotalFilteredComponents()} components found
          </Text>
        )}
      </div>

      {/* Component Categories */}
      <div style={{ padding: '16px' }}>
        <Collapse
          activeKey={activeCategory}
          onChange={setActiveCategory}
          ghost
          expandIconPosition="right"
        >
          {Object.entries(COMPONENT_CATEGORIES).map(([categoryKey, category]) => {
            const filteredComponents = filterComponents(category.components);
            
            if (searchTerm && filteredComponents.length === 0) {
              return null;
            }

            return (
              <Panel
                key={categoryKey}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {category.icon}
                    <span style={{ color: isDarkMode ? '#fff' : '#000' }}>
                      {category.title}
                    </span>
                    <Badge
                      count={filteredComponents.length}
                      style={{
                        backgroundColor: isDarkMode ? '#1890ff' : '#1890ff',
                        marginLeft: 'auto'
                      }}
                    />
                  </div>
                }
                style={{
                  background: 'transparent',
                  border: 'none'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {filteredComponents.map((component) => (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, component)}
                      onClick={() => onComponentSelect && onComponentSelect(component)}
                      style={componentItemStyle(component)}
                      onMouseEnter={(e) => {
                        e.target.style.boxShadow = isDarkMode 
                          ? '0 4px 12px rgba(255,255,255,0.1)' 
                          : '0 4px 12px rgba(0,0,0,0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: isDarkMode ? '#1890ff' : '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '14px'
                      }}>
                        {component.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: isDarkMode ? '#fff' : '#000',
                          marginBottom: '2px'
                        }}>
                          {component.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#999' : '#666',
                          lineHeight: '1.3'
                        }}>
                          {component.description}
                        </div>
                      </div>

                      <DragOutlined style={{
                        color: isDarkMode ? '#666' : '#999',
                        fontSize: '12px'
                      }} />
                    </div>
                  ))}
                </Space>
              </Panel>
            );
          })}
        </Collapse>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        borderTop: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
        background: isDarkMode ? '#262626' : '#ffffff'
      }}>
        <Text style={{
          fontSize: '12px',
          color: isDarkMode ? '#666' : '#999',
          textAlign: 'center',
          display: 'block'
        }}>
          Drag components to canvas
        </Text>
      </div>
    </div>
  );
};

export default ComponentLibraryPanel;
export { COMPONENT_CATEGORIES };