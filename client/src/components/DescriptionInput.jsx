// DescriptionInput.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Input, Button, Row, Col, Spin, message, Upload } from 'antd';
import { RightOutlined, LoadingOutlined, PaperClipOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const DescriptionInput = ({ onSubmit, loading, errorMsg, isDarkMode }) => {
  const [description, setDescription] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  const loadingMessages = [
    "Generating smart questions for you...",
    "Analyzing your description...",
    "Design AI is thinking...",
    "Almost there, preparing your experience..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1800);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = () => {
    if (!description.trim() && uploadedFiles.length === 0) {
      message.warning('Please provide a description or upload files');
      return;
    }
    onSubmit(description, uploadedFiles);
  };

  const handleFileUpload = (file) => {
    const allowedTypes = [
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      message.error('Only TXT, DOC, and DOCX files are allowed');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('File size must be less than 10MB');
      return false;
    }

    setUploadedFiles(prev => [...prev, file]);
    message.success(`${file.name} uploaded successfully`);
    return false; // Prevent default upload behavior
  };

  const removeFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
    message.info('File removed');
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  // Custom spinner icon
  const spinIcon = <LoadingOutlined style={{ 
    fontSize: 60, 
    color: isDarkMode ? '#1890ff' : '#1890ff' 
  }} spin />;

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <div style={{ position: 'relative' }}>
          <TextArea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your design requirements in detail..."
            style={{ 
              borderRadius: '8px',
              resize: 'none',
              fontSize: '16px',
              padding: '16px 20px 45px 20px', // Extra bottom padding for upload area
              background: isDarkMode ? 'rgba(0,0,0,0.3)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #d9d9d9',
              color: isDarkMode ? '#fff' : '#000',
              minHeight: '120px'
            }}
          />
          
          {/* Upload area at bottom of textarea */}
          <div style={{ 
            position: 'absolute', 
            bottom: '8px',
            left: '12px',
            right: '12px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: '4px',
            borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)'
          }}>
            {/* File names display */}
            <div style={{
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              flex: 1,
              overflow: 'hidden'
            }}>
              {uploadedFiles.length > 0 ? (
                <>
                  {uploadedFiles.slice(0, 2).map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: isDarkMode ? '#1890ff' : '#1890ff',
                        background: isDarkMode ? 'rgba(24,144,255,0.15)' : 'rgba(24,144,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        maxWidth: '100px',
                        border: `1px solid rgba(24,144,255,0.3)`
                      }}
                    >
                      <span>{getFileIcon(file.name)}</span>
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {file.name}
                      </span>
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeFile(file)}
                        style={{
                          color: '#ff4d4f',
                          padding: '0',
                          minWidth: '12px',
                          height: '12px',
                          fontSize: '8px',
                          lineHeight: '1'
                        }}
                      />
                    </div>
                  ))}
                  {uploadedFiles.length > 2 && (
                    <span style={{
                      fontSize: '11px',
                      color: isDarkMode ? '#1890ff' : '#1890ff',
                      fontWeight: '500'
                    }}>
                      +{uploadedFiles.length - 2} more
                    </span>
                  )}
                </>
              ) : (
                <Text style={{
                  fontSize: '11px',
                  color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
                }}>
                  No files attached
                </Text>
              )}
            </div>
            
            {/* Upload button */}
            <Upload
              beforeUpload={handleFileUpload}
              showUploadList={false}
              multiple
            >
              <Button
                type="text"
                size="small"
                style={{
                  color: '#1890ff',
                  border: '1px solid rgba(24,144,255,0.4)',
                  background: 'rgba(24,144,255,0.1)',
                  padding: '4px 8px',
                  height: '26px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '70px'
                }}
                title="Upload TXT, DOC, DOCX files"
              >
                <PaperClipOutlined style={{ fontSize: '12px' }} />
                <span style={{ fontSize: '10px' }}>
                  {uploadedFiles.length > 0 ? uploadedFiles.length : 'Attach'}
                </span>
              </Button>
            </Upload>
          </div>
        </div>
        
        {/* Display uploaded files */}
        {uploadedFiles.length > 0 && (
          <div style={{ 
            marginTop: '12px',
            padding: '12px 16px',
            background: isDarkMode ? 'rgba(24,144,255,0.1)' : '#f6f8ff',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? 'rgba(24,144,255,0.3)' : '#d6e4ff'}`
          }}>
            <Text style={{ 
              fontSize: '13px', 
              color: isDarkMode ? '#1890ff' : '#1890ff',
              marginBottom: '8px',
              display: 'block',
              fontWeight: '500'
            }}>
              📎 {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} attached
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#fff',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e8e8e8',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <span>{getFileIcon(file.name)}</span>
                  <Text style={{ 
                    fontSize: '12px', 
                    color: isDarkMode ? '#fff' : '#000',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {file.name}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeFile(file)}
                    style={{
                      color: '#ff4d4f',
                      padding: '0',
                      minWidth: '16px',
                      height: '16px',
                      fontSize: '10px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Col>
      
      <Col span={24} style={{ textAlign: 'right' }}>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            padding: '0 28px',
            fontSize: '16px',
            backgroundColor: '#1890ff',
            borderColor: '#1890ff',
            color: '#ffffff',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
          }}
          disabled={loading || (!description.trim() && uploadedFiles.length === 0)}
        >
          Continue
          <RightOutlined style={{ fontSize: '12px', marginLeft: '8px' }} />
        </Button>
      </Col>
      
      {loading ? (
        <Col span={24} style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Spin indicator={spinIcon} />
            <Text style={{ 
              marginTop: 24, 
              color: isDarkMode ? '#fff' : '#333', 
              fontSize: 20, 
              fontWeight: 500,
              opacity: 0.9
            }}>
              {loadingMessages[loadingMsgIndex]}
            </Text>
          </div>
        </Col>
      ) : (
        <Col span={24} style={{ textAlign: 'center', marginTop: '30px' }}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/2936/2936580.png" 
            alt="Design Illustration" 
            style={{ 
              width: '200px', 
              opacity: isDarkMode ? 0.6 : 0.7,
              filter: isDarkMode ? 'grayscale(30%)' : 'grayscale(10%)'
            }} 
          />
        </Col>
      )}
      
      {errorMsg && (
        <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{
            padding: '12px 16px',
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            color: '#ff4d4f'
          }}>
            <Text style={{ color: '#ff4d4f', fontSize: '14px' }}>
              {errorMsg}
            </Text>
          </div>
        </Col>
      )}
    </Row>
  );
};

export default DescriptionInput;