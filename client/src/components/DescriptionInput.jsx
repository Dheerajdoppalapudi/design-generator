// DescriptionInput.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Input, Button, Row, Col, Spin, Badge } from 'antd';
import { RightOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const DescriptionInput = ({ onSubmit, loading, errorMsg, isDarkMode }) => {
  const [description, setDescription] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
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
    if (!description.trim()) return;
    onSubmit(description);
  };

  // Custom spinner icon that matches the app theme
  const spinIcon = <LoadingOutlined style={{ 
    fontSize: 60, 
    color: isDarkMode ? '#00d2ff' : '#0ea5e9' 
  }} spin />;

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <TextArea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your design requirements in detail..."
          style={{ 
            borderRadius: '8px',
            resize: 'none',
            fontSize: '16px',
            padding: '16px 20px',
            background: isDarkMode ? 'rgba(0,0,0,0.3)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
          }}
        />
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
            background: isDarkMode ? 'linear-gradient(90deg, #3a7bd5, #00d2ff)' : 'linear-gradient(90deg, #2563eb, #0ea5e9)',
            border: 'none',
            fontWeight: '500',
          }}
          disabled={loading}
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
              opacity: isDarkMode ? 0.8 : 0.9,
              filter: isDarkMode ? 'grayscale(20%)' : 'none'
            }} 
          />
        </Col>
      )}
      
      {errorMsg && (
        <Col span={24} style={{ textAlign: 'center', marginTop: '20px' }}>
          <Badge count={errorMsg} style={{ backgroundColor: '#f5222d', fontSize: 16 }} />
        </Col>
      )}
    </Row>
  );
};

export default DescriptionInput;