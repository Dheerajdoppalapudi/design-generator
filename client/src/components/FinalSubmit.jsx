// FinalSubmit.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Result, Button, Spin } from 'antd';
import { CheckCircleFilled, LoadingOutlined } from '@ant-design/icons';
import WorkflowDisplay from './WorkflowDisplay';

const { Title, Paragraph } = Typography;

const FinalSubmit = ({ isDarkMode, workflowData }) => {
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState([]);
  const [showWorkflow, setShowWorkflow] = useState(false);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
      if (workflowData) {
        setWorkflow(workflowData);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [workflowData]);

  // Custom spinner icon that matches the app theme
  const spinIcon = <LoadingOutlined style={{ 
    fontSize: 60, 
    color: isDarkMode ? '#00d2ff' : '#0ea5e9' 
  }} spin />;

  if (showWorkflow) {
    return <WorkflowDisplay workflow={workflow} onBack={() => setShowWorkflow(false)} />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Spin indicator={spinIcon} />
          <Title level={4} style={{ 
            marginTop: 24, 
            color: isDarkMode ? '#fff' : '#333', 
            fontWeight: 500
          }}>
            Generating Application Workflow...
          </Title>
          <Paragraph style={{
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontSize: '16px',
            maxWidth: '500px',
          }}>
            Our AI is creating a complete workflow based on your requirements.
            This may take a few moments.
          </Paragraph>
        </div>
      </div>
    );
  }

  return (
    <Result
      icon={<CheckCircleFilled style={{ 
        color: isDarkMode ? '#00d2ff' : '#0ea5e9',
        fontSize: 64
      }} />}
      title={
        <Title level={3} style={{
          color: isDarkMode ? '#fff' : '#000',
          marginBottom: '16px',
          fontWeight: '500',
        }}>
          Workflow Generated Successfully!
        </Title>
      }
      subTitle={
        <Paragraph style={{
          color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          fontSize: '16px',
          maxWidth: '500px',
          margin: '0 auto',
          marginBottom: '32px',
        }}>
          Your application workflow has been generated based on your design requirements.
          You can now view the complete workflow or return to the dashboard.
        </Paragraph>
      }
      extra={[
        <Button 
          type="primary" 
          key="viewWorkflow" 
          size="large"
          onClick={() => setShowWorkflow(true)}
          style={{
            height: '48px',
            borderRadius: '8px',
            padding: '0 28px',
            fontSize: '16px',
            background: isDarkMode ? 'linear-gradient(90deg, #3a7bd5, #00d2ff)' : 'linear-gradient(90deg, #2563eb, #0ea5e9)',
            border: 'none',
            fontWeight: '500',
            marginBottom: '16px',
          }}
        >
          View Workflow
        </Button>,
        <Button 
          key="dashboard"
          size="large"
          style={{
            height: '48px',
            borderRadius: '8px',
            padding: '0 28px',
            fontSize: '16px',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
            background: 'transparent',
            color: isDarkMode ? '#fff' : '#000',
          }}
        >
          Back to Dashboard
        </Button>,
      ]}
      style={{
        padding: '60px 20px',
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#fff',
        borderRadius: '12px',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
      }}
    />
  );
};

export default FinalSubmit;