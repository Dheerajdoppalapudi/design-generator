import React, { useState } from 'react';
import { Button, Modal, message, Typography, Radio, Space, Card, Divider } from 'antd';
import { CopyOutlined, LinkOutlined, DownloadOutlined } from '@ant-design/icons';
import figmaLogo from '../media/images/figma-logo.png';

const { Paragraph, Text } = Typography;

const FigmaExportButton = ({ 
  designData = {}, 
  isDarkMode = false, 
  disabled = false,
  size = "default", // Changed default from "large" to "default"
  currentStep = "workflow",
  placement = "inline" // New prop: "inline", "floating", "corner"
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMethod, setExportMethod] = useState('plugin-url'); // 'plugin-url', 'new-file', 'clipboard', 'download'

  // Get context-specific export data
  const getExportData = () => {
    const baseData = {
      name: `Design Export - ${currentStep} - ${new Date().toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      exportType: currentStep,
      generator: "Design Generator Tool"
    };

    switch (currentStep) {
      case 'workflow':
        return {
          ...baseData,
          workflow: designData.workflow || [],
          description: designData.description || '',
          improvedDescription: designData.improvedDescription || '',
          answers: designData.answers || []
        };
      
      case 'wireframe':
        return {
          ...baseData,
          wireframeData: designData.wireframeData || {},
          workflow: designData.workflow || [],
          description: designData.description || '',
          improvedDescription: designData.improvedDescription || ''
        };
      
      case 'htmlpages':
        return {
          ...baseData,
          htmlFiles: designData.htmlFiles || [],
          workflow: designData.workflow || [],
          wireframeData: designData.wireframeData || {},
          description: designData.description || '',
          improvedDescription: designData.improvedDescription || ''
        };
      
      default:
        return { ...baseData, ...designData };
    }
  };

  // Generate Figma Plugin URL with embedded data
  const generatePluginUrl = (data) => {
    const pluginId = "design-importer"; // This would be your actual plugin ID
    const encodedData = encodeURIComponent(JSON.stringify(data));
    return `figma://plugin/${pluginId}?data=${encodedData}`;
  };

  // Generate Figma-compatible text for clipboard
  const generateClipboardText = (data) => {
    let content = `# ${data.name}\n\n`;
    
    if (currentStep === 'workflow' && data.workflow) {
      content += "## User Flow\n";
      data.workflow.forEach((screen, index) => {
        content += `${index + 1}. **${screen.title}**\n   ${screen.description}\n\n`;
      });
    }
    
    if (currentStep === 'wireframe' && data.wireframeData) {
      content += "## Wireframe Data\n";
      content += "```json\n" + JSON.stringify(data.wireframeData, null, 2) + "\n```\n\n";
    }
    
    if (currentStep === 'htmlpages' && data.htmlFiles) {
      content += "## HTML Pages\n";
      data.htmlFiles.forEach((file, index) => {
        content += `### ${file.filename}\n`;
        content += `- Size: ${Math.round((file.content?.length || 0) / 1024)}KB\n\n`;
      });
    }
    
    if (data.improvedDescription || data.description) {
      content += "## Design Requirements\n";
      content += (data.improvedDescription || data.description) + "\n\n";
    }
    
    return content;
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const exportData = getExportData();

      switch (exportMethod) {
        case 'plugin-url':
          // Method 1: Open Figma with plugin URL
          const pluginUrl = generatePluginUrl(exportData);
          try {
            window.open(pluginUrl, '_blank');
            message.success('Opening Figma with your design data...');
          } catch {
            // Fallback: Copy plugin URL to clipboard
            await navigator.clipboard.writeText(pluginUrl);
            message.info('Plugin URL copied to clipboard. Paste it in your browser to open Figma.');
          }
          break;

        case 'new-file':
          // Method 2: Create new Figma file and copy data
          const newFileUrl = 'https://figma.com/new';
          const clipboardData = generateClipboardText(exportData);
          
          // Copy data to clipboard first
          await navigator.clipboard.writeText(clipboardData);
          
          // Open new Figma file
          window.open(newFileUrl, '_blank');
          
          message.success('New Figma file opened! Your design data is copied to clipboard - paste it into the file.');
          break;

        case 'clipboard':
          // Method 3: Copy formatted text to clipboard
          const formattedText = generateClipboardText(exportData);
          await navigator.clipboard.writeText(formattedText);
          message.success('Design data copied to clipboard! Paste it into any Figma file.');
          break;

        case 'download':
          // Method 4: Download JSON file
          const content = JSON.stringify(exportData, null, 2);
          const blob = new Blob([content], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `figma-${currentStep}-export-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          message.success('Design data downloaded! Import using Figma plugins.');
          break;

        default:
          throw new Error('Invalid export method');
      }

      setModalVisible(false);
      
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case 'workflow': return 'Workflow';
      case 'wireframe': return 'Wireframes';
      case 'htmlpages': return 'HTML Pages';
      default: return 'Design';
    }
  };

  const buttonStyle = {
    height: size === 'large' ? '48px' : size === 'small' ? '32px' : '40px',
    padding: size === 'large' ? '0 32px' : size === 'small' ? '0 16px' : '0 20px',
    fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
    fontWeight: '500',
    borderRadius: '6px',
    // Professional color scheme
    backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc', // Gray instead of blue
    borderColor: isDarkMode ? '#4a5568' : '#e2e8f0',
    color: isDarkMode ? '#e2e8f0' : '#2d3748',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
    // Hover effects
    ':hover': {
      backgroundColor: isDarkMode ? '#4a5568' : '#edf2f7',
      borderColor: isDarkMode ? '#718096' : '#cbd5e0',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  };

  // Container style based on placement
  const getContainerStyle = () => {
    switch (placement) {
      case 'floating':
        return {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        };
      case 'corner':
        return {
          position: 'absolute',
          top: '10px',
          right: '10px',
        };
      default: // inline
        return {};
    }
  };

  return (
    <div style={getContainerStyle()}>
      <Button
        type="default" // Changed from "primary" to "default"
        size={size}
        icon={
          <img 
            src={figmaLogo}
            alt="Figma" 
            style={{ width: size === 'small' ? '12px' : '14px', height: size === 'small' ? '12px' : '14px' }}
            onError={(e) => {
              // Fallback to SVG icon if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline-block';
            }}
          />
        }
        onClick={() => setModalVisible(true)}
        disabled={disabled}
        style={buttonStyle}
        className="figma-export-btn" // For additional CSS styling if needed
      >
        {/* Fallback SVG icon */}
        <svg style={{ display: 'none' }} width={size === 'small' ? '12' : '14'} height={size === 'small' ? '12' : '14'} viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z"/>
          <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z"/>
          <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z"/>
          <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z"/>
          <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z"/>
        </svg>
        {size !== 'small' && `Export to Figma`}
        {size === 'small' && 'Figma'}
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={figmaLogo}
              alt="Figma" 
              style={{ width: '24px', height: '24px' }}
              onError={(e) => e.target.style.display = 'none'}
            />
            <span>Export {getStepLabel()} to Figma</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={700}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="export"
            type="primary"
            loading={exporting}
            onClick={handleExport}
            style={{
              backgroundColor: '#1890ff',
              borderColor: '#1890ff'
            }}
            icon={
              exportMethod === 'plugin-url' ? <LinkOutlined /> :
              exportMethod === 'clipboard' ? <CopyOutlined /> :
              <DownloadOutlined />
            }
          >
            {exporting ? 'Exporting...' : 
             exportMethod === 'plugin-url' ? 'Open in Figma' :
             exportMethod === 'new-file' ? 'Create New File' :
             exportMethod === 'clipboard' ? 'Copy to Clipboard' :
             'Download Export'}
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Paragraph style={{ 
            color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
            marginBottom: '24px'
          }}>
            Choose how you'd like to get your {getStepLabel().toLowerCase()} data into Figma:
          </Paragraph>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            
            {/* Option 1: Plugin URL (Direct) */}
            <Card 
              size="small"
              style={{
                backgroundColor: exportMethod === 'plugin-url' ? (isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)') : 'transparent',
                border: exportMethod === 'plugin-url' ? '2px solid #1890ff' : `1px solid ${isDarkMode ? '#333' : '#d9d9d9'}`,
                cursor: 'pointer'
              }}
              onClick={() => setExportMethod('plugin-url')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="radio" 
                  checked={exportMethod === 'plugin-url'} 
                  onChange={() => setExportMethod('plugin-url')}
                />
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : '#000', display: 'block', marginBottom: '4px' }}>
                    🚀 Direct Plugin Integration (BEST)
                  </Text>
                  <Text style={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    fontSize: '13px'
                  }}>
                    Opens Figma directly with your data via plugin URL (requires compatible plugin)
                  </Text>
                </div>
              </div>
            </Card>

            {/* Option 2: New File + Clipboard */}
            <Card 
              size="small"
              style={{
                backgroundColor: exportMethod === 'new-file' ? (isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)') : 'transparent',
                border: exportMethod === 'new-file' ? '2px solid #1890ff' : `1px solid ${isDarkMode ? '#333' : '#d9d9d9'}`,
                cursor: 'pointer'
              }}
              onClick={() => setExportMethod('new-file')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="radio" 
                  checked={exportMethod === 'new-file'} 
                  onChange={() => setExportMethod('new-file')}
                />
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : '#000', display: 'block', marginBottom: '4px' }}>
                    📝 Create New File + Paste
                  </Text>
                  <Text style={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    fontSize: '13px'
                  }}>
                    Opens new Figma file and copies your data to clipboard for pasting
                  </Text>
                </div>
              </div>
            </Card>

            {/* Option 3: Clipboard Only */}
            <Card 
              size="small"
              style={{
                backgroundColor: exportMethod === 'clipboard' ? (isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)') : 'transparent',
                border: exportMethod === 'clipboard' ? '2px solid #1890ff' : `1px solid ${isDarkMode ? '#333' : '#d9d9d9'}`,
                cursor: 'pointer'
              }}
              onClick={() => setExportMethod('clipboard')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="radio" 
                  checked={exportMethod === 'clipboard'} 
                  onChange={() => setExportMethod('clipboard')}
                />
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : '#000', display: 'block', marginBottom: '4px' }}>
                    📋 Copy to Clipboard
                  </Text>
                  <Text style={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    fontSize: '13px'
                  }}>
                    Copies formatted text that you can paste into any existing Figma file
                  </Text>
                </div>
              </div>
            </Card>

            {/* Option 4: Download JSON */}
            <Card 
              size="small"
              style={{
                backgroundColor: exportMethod === 'download' ? (isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)') : 'transparent',
                border: exportMethod === 'download' ? '2px solid #1890ff' : `1px solid ${isDarkMode ? '#333' : '#d9d9d9'}`,
                cursor: 'pointer'
              }}
              onClick={() => setExportMethod('download')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="radio" 
                  checked={exportMethod === 'download'} 
                  onChange={() => setExportMethod('download')}
                />
                <div>
                  <Text strong style={{ color: isDarkMode ? '#fff' : '#000', display: 'block', marginBottom: '4px' }}>
                    💾 Download JSON File
                  </Text>
                  <Text style={{ 
                    color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    fontSize: '13px'
                  }}>
                    Downloads structured data file for use with Figma import plugins
                  </Text>
                </div>
              </div>
            </Card>
          </Space>

          <Divider style={{ margin: '24px 0' }} />

          {/* Current export info */}
          <div style={{ 
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            padding: '16px',
            borderRadius: '6px',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <Text style={{ 
              fontSize: '13px',
              color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
            }}>
              <strong>What will be exported ({getStepLabel()}):</strong>
              <br />
              {currentStep === 'workflow' && '• Workflow screens and user journey'}
              {currentStep === 'wireframe' && '• Wireframe structure and components'}
              {currentStep === 'htmlpages' && '• HTML page layouts and code structure'}
              <br />• Design requirements and context
              <br />• Metadata and timestamps
            </Text>
          </div>

          {/* Instructions based on selected method */}
          <div style={{
            background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.05)',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid rgba(24, 144, 255, 0.2)'
          }}>
            <Text style={{ 
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
              fontSize: '12px'
            }}>
              {exportMethod === 'plugin-url' && (
                <>💡 <strong>Plugin Method:</strong> This will attempt to open Figma with a plugin that can import your design data directly.</>
              )}
              {exportMethod === 'new-file' && (
                <>💡 <strong>New File Method:</strong> Creates a new Figma file and copies your data. Paste it as text or use import plugins.</>
              )}
              {exportMethod === 'clipboard' && (
                <>💡 <strong>Clipboard Method:</strong> Copies formatted text that you can paste into any Figma file for reference.</>
              )}
              {exportMethod === 'download' && (
                <>💡 <strong>Download Method:</strong> Use plugins like "JSON to Figma" or "Design Importer" to import the file.</>
              )}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FigmaExportButton;