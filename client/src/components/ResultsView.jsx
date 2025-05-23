// ResultsView.jsx
import React from 'react';
import { Typography, Space, Button, Badge } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ResultsView = ({ improvedDescription, answers, onNext, loading, errorMsg, isDarkMode }) => {
  return (
    <div style={{
      padding: '24px',
      marginTop: '30px',
      background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#fff',
      borderRadius: '12px',
      border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
      boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
    }}>
      <Text style={{ 
        fontSize: '13px', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        fontWeight: '600',
        display: 'block',
        marginBottom: '12px'
      }}>
        Your Design Requirements
      </Text>
      <Paragraph style={{ 
        margin: '0',
        color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
        fontSize: '16px',
        lineHeight: '1.8',
      }}>
        {improvedDescription}
      </Paragraph>
      
      <div style={{ marginTop: '24px' }}>
        <Title level={5} style={{
          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '16px'
        }}>
          Your Selected Preferences
        </Title>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {answers.map((answer, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: isDarkMode 
                ? '1px solid rgba(255,255,255,0.05)' 
                : '1px solid rgba(0,0,0,0.03)',
            }}>
              <Text style={{ 
                color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                fontSize: '14px',
              }}>
                {answer.question}
              </Text>
              <Text style={{ 
                color: isDarkMode ? '#fff' : '#000',
                fontWeight: '500',
                fontSize: '14px',
              }}>
                {answer.answer}
              </Text>
            </div>
          ))}
        </Space>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          onClick={onNext}
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
          Generate Pages
          <RightOutlined style={{ fontSize: '12px', marginLeft: '8px' }} />
        </Button>
      </div>
      
      {errorMsg && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Badge count={errorMsg} style={{ backgroundColor: '#f5222d', fontSize: 16 }} />
        </div>
      )}
    </div>
  );
};

export default ResultsView;