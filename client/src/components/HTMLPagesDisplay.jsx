import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, Typography, Spin, message, Modal, Input, Select } from 'antd';
import { EyeOutlined, CodeOutlined, DownloadOutlined, EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const HTMLPagesDisplay = ({ 
  htmlFiles = [], 
  isDarkMode, 
  onRegeneratePages,
  loading = false,
  designData = {} // Add designData prop for Figma export
}) => {
  const [activeTab, setActiveTab] = useState('0');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [editableFiles, setEditableFiles] = useState({});
  const [editingFile, setEditingFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [textFieldValue, setTextFieldValue] = useState('');

  // Initialize editable files when htmlFiles change
  useEffect(() => {
    if (htmlFiles && htmlFiles.length > 0) {
      const filesMap = {};
      htmlFiles.forEach((file, index) => {
        filesMap[index] = { ...file };
      });
      setEditableFiles(filesMap);
      // Set first page as default selection
      setSelectedPage(Object.keys(filesMap)[0]);
    }
  }, [htmlFiles]);

  // Handle file editing
  const handleEditFile = (index) => {
    setEditingFile({
      index,
      content: editableFiles[index]?.content || '',
      filename: editableFiles[index]?.filename || ''
    });
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      setEditableFiles(prev => ({
        ...prev,
        [editingFile.index]: {
          ...prev[editingFile.index],
          content: editingFile.content
        }
      }));
      message.success('File updated successfully!');
      setModalVisible(false);
      setEditingFile(null);
    }
  };

  // Download functionality
  const downloadFile = (file, content) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Downloaded ${file.filename}`);
  };

  const downloadAllFiles = () => {
    Object.values(editableFiles).forEach(file => {
      setTimeout(() => downloadFile(file, file.content), 100);
    });
  };

  // Toggle between preview and code view, and handle editing
  const handleCodeEdit = () => {
    if (viewMode === 'code') {
      // If already in code view, open edit modal
      handleEditFile(parseInt(activeTab));
    } else {
      // Switch to code view
      setViewMode('code');
    }
  };

  // Render HTML in iframe
  const renderHTMLPreview = (content) => {
    return (
      <iframe
        srcDoc={content}
        style={{
          width: '100%',
          height: '600px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#fff'
        }}
        title="HTML Preview"
      />
    );
  };

  // Render code view
  const renderCodeView = (content) => {
    return (
      <div style={{
        background: isDarkMode ? '#1e1e1e' : '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: isDarkMode ? '1px solid #333' : '1px solid #e1e5e9',
        height: '600px',
        overflow: 'auto',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: '13px',
        lineHeight: '1.5'
      }}>
        <pre style={{
          margin: 0,
          color: isDarkMode ? '#d4d4d4' : '#24292e',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {content}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px', color: isDarkMode ? '#fff' : '#000' }}>
          Generating HTML pages...
        </div>
      </div>
    );
  }

  if (!htmlFiles || htmlFiles.length === 0) {
    return (
      <Card style={{
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
      }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: '16px' }}>
            No HTML pages available. Please generate pages first.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header with controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <Title level={5} style={{
          margin: 0,
          color: isDarkMode ? '#fff' : '#000'
        }}>
          Generated HTML Pages ({Object.keys(editableFiles).length} files)
        </Title>

        <Space wrap>
          <Button.Group>
            <Button
              type={viewMode === 'preview' ? 'primary' : 'default'}
              icon={<EyeOutlined />}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </Button>
            <Button
              type={viewMode === 'code' ? 'primary' : 'default'}
              icon={viewMode === 'code' ? <EditOutlined /> : <CodeOutlined />}
              onClick={handleCodeEdit}
            >
              {viewMode === 'code' ? 'Edit Code' : 'View Code'}
            </Button>
          </Button.Group>

          <Button
            icon={<DownloadOutlined />}
            onClick={downloadAllFiles}
          >
            Download All
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={onRegeneratePages}
            type="default"
          >
            Regenerate Pages
          </Button>
        </Space>
      </div>

      {/* Page selector and text field */}
      <div style={{ 
        display: 'flex', 
        gap: '0px', 
        alignItems: 'end',
        marginBottom: '20px',
        flexWrap: 'nowrap'
      }}>
        <div style={{ width: '200px' }}>
          <Text style={{ 
            color: isDarkMode ? '#fff' : '#000',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            display: 'block'
          }}>
            Select Page:
          </Text>
          <Select
            value={selectedPage}
            onChange={setSelectedPage}
            style={{ 
              width: '100%'
            }}
            placeholder="Choose a page"
          >
            {Object.entries(editableFiles).map(([index, file]) => (
              <Option key={index} value={index}>
                {file.filename}
              </Option>
            ))}
          </Select>
        </div>
        
        <div style={{ flex: '1', marginLeft: '-1px' }}>
          <Text style={{ 
            color: isDarkMode ? '#fff' : '#000',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            display: 'block'
          }}>
            Notes/Comments:
          </Text>
          <Input
            value={textFieldValue}
            onChange={(e) => setTextFieldValue(e.target.value)}
            placeholder="Add notes or comments about the selected page..."
            style={{ 
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Tabs for different HTML files */}
      <Card style={{
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#fff',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e1e5e9',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          tabBarStyle={{
            marginBottom: '20px'
          }}
        >
          {Object.entries(editableFiles).map(([index, file]) => (
            <TabPane
              tab={
                <span style={{ color: isDarkMode ? '#fff' : '#000' }}>
                  {file.filename}
                </span>
              }
              key={index}
            >
              <div style={{ marginBottom: '12px' }}>
                <Text style={{
                  fontSize: '12px',
                  color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {file.filename} • {Math.round(file.content.length / 1024)}KB • {viewMode.toUpperCase()} MODE
                </Text>
              </div>

              {viewMode === 'preview' ? (
                renderHTMLPreview(file.content)
              ) : (
                renderCodeView(file.content)
              )}
            </TabPane>
          ))}
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Modal
        title={`Edit ${editingFile?.filename}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSaveEdit}>
            Save Changes
          </Button>
        ]}
      >
        <TextArea
          value={editingFile?.content || ''}
          onChange={(e) => setEditingFile(prev => ({ ...prev, content: e.target.value }))}
          rows={20}
          style={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '13px'
          }}
        />
      </Modal>
    </div>
  );
};

export default HTMLPagesDisplay;