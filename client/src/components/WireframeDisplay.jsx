// WireframeDisplay.jsx
import React from 'react';
import { Typography, Tabs, Card } from 'antd';
import { CodeOutlined, AppstoreOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const WireframeDisplay = ({ wireframeData, isDarkMode }) => {
  // Function to pretty-print JSON with syntax highlighting
  const formatJson = (json) => {
    const formattedJson = JSON.stringify(json, null, 2);
    
    return (
      <pre style={{
        background: isDarkMode ? '#1e1e1e' : '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        overflowX: 'auto',
        color: isDarkMode ? '#e6e6e6' : '#333',
        fontSize: '14px',
        lineHeight: 1.5,
        fontFamily: 'monospace'
      }}>
        {formattedJson}
      </pre>
    );
  };
  
  const renderScreenCards = () => {
    if (!wireframeData || !wireframeData.screens || wireframeData.screens.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text style={{ color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' }}>
            No screens available in the wireframe data.
          </Text>
        </div>
      );
    }
    
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '24px',
        marginTop: '20px'
      }}>
        {wireframeData.screens.map((screen, index) => (
          <Card 
            key={index}
            title={<span style={{ 
              color: isDarkMode ? '#fff' : '#000',
              fontWeight: 500
            }}>{screen.name}</span>}
            style={{ 
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0',
              borderRadius: '8px'
            }}
            headStyle={{
              background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#fafafa',
              borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f0f0f0'
            }}
          >
            <div style={{ 
              color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
              fontSize: '14px'
            }}>
              <Text style={{ 
                display: 'block', 
                marginBottom: '12px', 
                color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
                fontWeight: 500
              }}>
                Components: {screen.components.length}
              </Text>
              <ul style={{ 
                listStyleType: 'none', 
                padding: 0, 
                margin: 0,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {screen.components.map((component, idx) => (
                  <li key={idx} style={{ 
                    padding: '4px 0',
                    borderBottom: isDarkMode 
                      ? '1px solid rgba(255,255,255,0.05)' 
                      : '1px solid rgba(0,0,0,0.03)'
                  }}>
                    <Text style={{ 
                      color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)' 
                    }}>
                      {component.type || 'Component'}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        padding: '20px',
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
        borderRadius: '8px',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
      }}>
        <Tabs defaultActiveKey="1" style={{ color: isDarkMode ? '#fff' : '#000' }}>
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined style={{ marginRight: '8px' }} />
                Screens
              </span>
            } 
            key="1"
          >
            <div>
              <Paragraph style={{
                margin: '0 0 16px 0',
                color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
                fontSize: '15px',
              }}>
                App Name: <Text strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
                  {wireframeData?.app?.name || 'Unnamed App'}
                </Text>
              </Paragraph>
              
              {renderScreenCards()}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CodeOutlined style={{ marginRight: '8px' }} />
                JSON Data
              </span>
            } 
            key="2"
          >
            {formatJson(wireframeData)}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default WireframeDisplay;