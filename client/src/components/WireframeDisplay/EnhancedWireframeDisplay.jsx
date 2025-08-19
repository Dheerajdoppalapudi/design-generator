// components/WireframeDisplay/EnhancedWireframeDisplay.jsx
import React, { useState, useCallback } from 'react';
import { 
  Button, 
  Typography, 
  Space, 
  message, 
  Tooltip,
  Modal,
  Card
} from 'antd';
import { 
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
  AppstoreOutlined,
  MobileOutlined,
  CodeOutlined
} from '@ant-design/icons';
import ComponentLibraryPanel from '../ComponentLibrary/ComponentLibraryPanel';
import EditableCanvas from '../Canvas/EditableCanvas';
import MobileWireframeParser from './MobileWireframeParser';

const { Title, Text } = Typography;

const EnhancedWireframeDisplay = ({
  wireframeData,
  wireframeScreens,
  isDarkMode,
  isMultiScreen = false,
  totalScreens = 0,
  currentGeneratingIndex = 0,
  isLoading = false,
  isWaitingBetweenRequests = false,
  waitingCountdown = 0,
  onWireframeUpdate,
  onExport
}) => {
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'flow', 'json'
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Determine which data to use
  const screensData = isMultiScreen ? wireframeScreens : [wireframeData];
  const currentWireframe = screensData[currentScreenIndex] || screensData[0];

  // Handle wireframe updates
  const handleWireframeUpdate = useCallback((updatedWireframe) => {
    if (isMultiScreen && onWireframeUpdate) {
      // Update specific screen in multi-screen array
      const newScreens = [...wireframeScreens];
      newScreens[currentScreenIndex] = updatedWireframe;
      onWireframeUpdate(newScreens, currentScreenIndex);
    } else if (onWireframeUpdate) {
      // Update single wireframe
      onWireframeUpdate(updatedWireframe);
    }
    message.success('Wireframe updated');
  }, [isMultiScreen, wireframeScreens, currentScreenIndex, onWireframeUpdate]);

  // Handle component library interactions
  const handleComponentDrag = useCallback((component) => {
    console.log('Component being dragged:', component.name);
  }, []);

  const handleComponentSelect = useCallback((component) => {
    message.info(`Selected ${component.name} - drag to canvas to add`);
  }, []);

  // Handle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(!previewMode);
  }, [previewMode]);

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(currentWireframe);
    } else {
      // Default export to JSON
      const dataStr = JSON.stringify(currentWireframe, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wireframe-${currentWireframe?.app?.name || 'design'}.json`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('Wireframe exported successfully');
    }
  }, [currentWireframe, onExport]);

  // Navigation for multi-screen
  const handlePrevScreen = () => {
    setCurrentScreenIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextScreen = () => {
    setCurrentScreenIndex(prev => Math.min(screensData.length - 1, prev + 1));
  };

  if (!currentWireframe && !isLoading) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: isDarkMode ? '#fff' : '#000'
      }}>
        <MobileOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
        <Title level={3} style={{ color: 'inherit', opacity: 0.7 }}>
          No Wireframe Data Available
        </Title>
        <Text style={{ color: 'inherit', opacity: 0.5 }}>
          Generate a wireframe to start editing
        </Text>
      </div>
    );
  }

  // Main container style
  const containerStyle = {
    display: 'flex',
    height: '100vh',
    background: isDarkMode ? '#121212' : '#f0f2f5',
    position: 'relative'
  };

  // Render different view modes
  const renderContent = () => {
    if (previewMode) {
      return (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MobileOutlined />
              <span>Preview Mode</span>
            </div>
          }
          open={previewMode}
          onCancel={togglePreview}
          footer={null}
          width={400}
          centered
          styles={{
            body: { 
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              background: isDarkMode ? '#1f1f1f' : '#f5f5f5'
            }
          }}
        >
          <MobileWireframeParser
            wireframeData={currentWireframe}
            isDarkMode={isDarkMode}
            screenIndex={currentScreenIndex}
          />
        </Modal>
      );
    }

    switch (viewMode) {
      case 'edit':
        return (
          <>
            {/* Component Library Panel */}
            <ComponentLibraryPanel
              isDarkMode={isDarkMode}
              onComponentDrag={handleComponentDrag}
              onComponentSelect={handleComponentSelect}
              isCollapsed={isLibraryCollapsed}
              onToggleCollapse={() => setIsLibraryCollapsed(!isLibraryCollapsed)}
            />

            {/* Main Canvas */}
            <EditableCanvas
              wireframeData={currentWireframe}
              onWireframeUpdate={handleWireframeUpdate}
              isDarkMode={isDarkMode}
              isLibraryCollapsed={isLibraryCollapsed}
              onPreview={togglePreview}
            />
          </>
        );

      case 'preview':
        return (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}>
            <MobileWireframeParser
              wireframeData={currentWireframe}
              isDarkMode={isDarkMode}
              screenIndex={currentScreenIndex}
            />
          </div>
        );

      case 'flow':
        return (
          <div style={{
            flex: 1,
            padding: '20px',
            overflowX: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
              minWidth: 'fit-content',
              padding: '20px'
            }}>
              {screensData.map((screenData, index) => (
                <React.Fragment key={index}>
                  <div
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      opacity: currentScreenIndex === index ? 1 : 0.7,
                      transform: currentScreenIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => setCurrentScreenIndex(index)}
                  >
                    <MobileWireframeParser
                      wireframeData={screenData}
                      isDarkMode={isDarkMode}
                      screenIndex={index}
                    />
                    
                    {currentScreenIndex === index && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1890ff',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Current
                      </div>
                    )}
                  </div>

                  {index < screensData.length - 1 && (
                    <div style={{
                      fontSize: '24px',
                      color: '#1890ff'
                    }}>
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      case 'json':
        return (
          <div style={{
            flex: 1,
            padding: '20px'
          }}>
            <Card
              title="Wireframe JSON"
              style={{ height: '100%' }}
              bodyStyle={{ 
                height: 'calc(100% - 57px)',
                overflow: 'auto'
              }}
            >
              <pre style={{
                background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                color: isDarkMode ? '#e6e6e6' : '#333',
                fontSize: '12px',
                lineHeight: 1.4,
                fontFamily: 'Monaco, "Courier New", monospace',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(currentWireframe, null, 2)}
              </pre>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Top Toolbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 1001
      }}>
        {/* Left Section - Title and Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title level={4} style={{
            margin: 0,
            color: isDarkMode ? '#fff' : '#000'
          }}>
            {currentWireframe?.app?.name || 'Wireframe Editor'}
          </Title>

          {/* Multi-screen navigation */}
          {isMultiScreen && screensData.length > 1 && (
            <Space>
              <Button
                size="small"
                icon={<LeftOutlined />}
                disabled={currentScreenIndex === 0}
                onClick={handlePrevScreen}
              />
              
              <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
                {currentScreenIndex + 1} / {screensData.length}
              </Text>
              
              <Button
                size="small"
                icon={<RightOutlined />}
                disabled={currentScreenIndex >= screensData.length - 1}
                onClick={handleNextScreen}
              />
            </Space>
          )}
        </div>

        {/* Center Section - View Mode Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button.Group>
            <Button
              type={viewMode === 'edit' ? 'primary' : 'default'}
              icon={<EditOutlined />}
              onClick={() => setViewMode('edit')}
              size="small"
            >
              Edit
            </Button>
            <Button
              type={viewMode === 'preview' ? 'primary' : 'default'}
              icon={<MobileOutlined />}
              onClick={() => setViewMode('preview')}
              size="small"
            >
              Preview
            </Button>
            {isMultiScreen && (
              <Button
                type={viewMode === 'flow' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('flow')}
                size="small"
              >
                Flow
              </Button>
            )}
            <Button
              type={viewMode === 'json' ? 'primary' : 'default'}
              icon={<CodeOutlined />}
              onClick={() => setViewMode('json')}
              size="small"
            >
              JSON
            </Button>
          </Button.Group>
        </div>

        {/* Right Section - Actions */}
        <Space>
          <Tooltip title="Preview in popup">
            <Button
              icon={<FullscreenOutlined />}
              onClick={togglePreview}
              size="small"
            >
              Preview
            </Button>
          </Tooltip>
          
          <Tooltip title="Export wireframe">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              size="small"
            >
              Export
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Main Content */}
      <div style={{
        ...containerStyle,
        marginTop: '64px'
      }}>
        {renderContent()}
        {previewMode && renderContent()}
      </div>

      {/* Status Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        background: isDarkMode ? '#262626' : '#f0f0f0',
        borderTop: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        fontSize: '12px',
        color: isDarkMode ? '#999' : '#666',
        zIndex: 1000
      }}>
        <div>
          Components: {currentWireframe?.screens?.[0]?.components?.length || 0} • 
          Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
        </div>
        
        <div>
          {isLoading && (
            <span style={{ color: '#1890ff' }}>
              {isWaitingBetweenRequests 
                ? `Next screen in ${waitingCountdown}s`
                : `Generating screen ${currentGeneratingIndex + 1}...`
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWireframeDisplay;