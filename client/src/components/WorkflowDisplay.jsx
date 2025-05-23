// WorkflowDisplay.jsx
import React, { useState } from 'react';
import { Typography, Button, Space, Tooltip, Drawer } from 'antd';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  FormOutlined,
  FireOutlined,
  FileTextOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const WorkflowDisplay = ({ workflow = [], isDarkMode = false }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);

  // Open drawer with screen details
  const showDrawer = (screen) => {
    setSelectedScreen(screen);
    setDrawerVisible(true);
  };

  // Close drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Get icon based on screen title
  const getScreenIcon = (title) => {
    const iconMap = {
      dashboard: <AppstoreOutlined />,
      login: <UserOutlined />,
      account: <UserOutlined />,
      promotions: <FireOutlined />,
      'book drone': <CalendarOutlined />,
      'booking form': <FormOutlined />,
      'booking success': <CheckCircleOutlined />,
      profile: <UserOutlined />,
      settings: <SettingOutlined />,
      summary: <FileTextOutlined />,
      review: <StarOutlined />
    };
    
    const key = Object.keys(iconMap).find(key => 
      title.toLowerCase().includes(key)
    );
    
    return key ? iconMap[key] : <AppstoreOutlined />;
  };

  // Phone frame styling - simplified
  const phoneFrameStyle = {
    width: '180px',
    height: '340px',
    borderRadius: '24px',
    background: isDarkMode ? '#1a1e24' : '#f8fafc',
    boxShadow: isDarkMode 
      ? '0 10px 25px -5px rgba(0,0,0,0.5)'
      : '0 10px 25px -5px rgba(0,0,0,0.08)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
  };

  // Render screen content based on screen type
  const renderScreenContent = (screen) => {
    const title = screen.title.toLowerCase();
    
    if (title.includes('dashboard')) {
      return <DashboardScreenContent isDarkMode={isDarkMode} />;
    } else if (title.includes('login')) {
      return <LoginScreenContent isDarkMode={isDarkMode} />;
    } else if (title.includes('account')) {
      return <AccountScreenContent isDarkMode={isDarkMode} />;
    } else {
      return <DefaultScreenContent isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ overflowX: 'auto', paddingBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          minWidth: 'max-content', 
          padding: '10px 10px 10px',
        }}>
          {workflow.map((screen, index) => (
            <React.Fragment key={screen.id}>
              <div>
                {/* Screen with phone mockup */}
                <div style={{ position: 'relative' }}>
                  <div style={phoneFrameStyle}>
                    {/* Phone status bar */}
                    <PhoneStatusBar isDarkMode={isDarkMode} />
                    
                    {/* Screen content */}
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 16px',
                      position: 'relative',
                    }}>
                      {renderScreenContent(screen)}
                    </div>
                    
                    {/* Bottom navigation bar */}
                    <PhoneNavBar position={screen.position} isDarkMode={isDarkMode} />
                  </div>
                </div>
                
                {/* Screen title and description below the phone */}
                <div style={{ textAlign: 'center', marginTop: '16px', width: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    {/* Start badge - now placed beside the title instead of overlapping the phone */}
                    {screen.isStartPoint && (
                      <StartBadge isDarkMode={isDarkMode} />
                    )}
                    
                    <Title level={5} style={{ 
                      fontSize: '16px', 
                      margin: '0', 
                      color: isDarkMode ? '#fff' : '#000',
                      fontWeight: '600',
                    }}>
                      {screen.title}
                    </Title>
                  </div>
                  
                  <Paragraph 
                    ellipsis={{ rows: 2 }}
                    style={{ 
                      fontSize: '13px', 
                      color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)',
                      margin: '0 0 16px 0',
                      lineHeight: '1.5',
                    }}
                  >
                    {screen.description}
                  </Paragraph>
                  
                  {/* Action buttons */}
                  <Space>
                    <Tooltip title="View screen details">
                      <Button 
                        size="small" 
                        type="primary"
                        icon={<EyeOutlined />} 
                        onClick={() => showDrawer(screen)}
                        style={{ 
                          borderRadius: '6px',
                          background: isDarkMode ? '#3b82f6' : '#2563eb',
                          border: 'none',
                        }}
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Remove screen">
                      <Button 
                        size="small" 
                        danger
                        icon={<DeleteOutlined />} 
                        style={{ borderRadius: '6px' }}
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
              </div>
              
              {/* Connector between screens */}
              {index < workflow.length - 1 && (
                <ScreenConnector isDarkMode={isDarkMode} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={selectedScreen?.title || "Screen Details"}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={500}
        bodyStyle={{ padding: '28px' }}
        headerStyle={{ 
          background: isDarkMode ? '#1a1e24' : '#ffffff',
          color: isDarkMode ? '#fff' : '#000',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
        }}
        contentWrapperStyle={{
          background: isDarkMode ? '#1a1e24' : '#ffffff',
        }}
      >
        {selectedScreen && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px',
              gap: '16px'
            }}>
              <div style={{ 
                width: '52px', 
                height: '52px', 
                borderRadius: '12px', 
                background: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: isDarkMode ? '#3b82f6' : '#2563eb'
              }}>
                {getScreenIcon(selectedScreen.title)}
              </div>
              <div>
                <Title level={4} style={{ margin: '0 0 4px 0', color: isDarkMode ? '#fff' : '#000' }}>
                  {selectedScreen.title}
                </Title>
                <Text style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  Screen {selectedScreen.position}
                </Text>
              </div>
            </div>

            <Paragraph style={{ 
              marginBottom: '28px',
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
              fontSize: '15px',
              lineHeight: '1.8'
            }}>
              {selectedScreen.description}
            </Paragraph>

            <div style={{ 
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                ...phoneFrameStyle,
                width: '240px',
                height: '440px',
                boxShadow: isDarkMode 
                  ? '0 15px 25px -5px rgba(0,0,0,0.5)'
                  : '0 15px 25px -5px rgba(0,0,0,0.1)',
              }}>
                <PhoneStatusBar isDarkMode={isDarkMode} />
                
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 20px',
                  position: 'relative',
                }}>
                  {renderScreenContent(selectedScreen)}
                </div>
                
                <PhoneNavBar position={selectedScreen.position} isDarkMode={isDarkMode} />
              </div>
            </div>

            <div>
              <Title level={5} style={{ 
                margin: '0 0 16px 0', 
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '16px'
              }}>
                Navigation
              </Title>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedScreen.previousScreens && selectedScreen.previousScreens.length > 0 && (
                  <div>
                    <Text style={{ 
                      color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Previous Screens
                    </Text>
                    <div style={{ 
                      padding: '12px 16px',
                      background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '8px',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)'
                    }}>
                      {selectedScreen.previousScreens.join(', ')}
                    </div>
                  </div>
                )}
                
                {selectedScreen.nextScreens && selectedScreen.nextScreens.length > 0 && (
                  <div>
                    <Text style={{ 
                      color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Next Screens
                    </Text>
                    <div style={{ 
                      padding: '12px 16px',
                      background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '8px',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)'
                    }}>
                      {selectedScreen.nextScreens.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

// Modular components for cleaner code organization

const PhoneStatusBar = ({ isDarkMode }) => (
  <div style={{
    height: '28px',
    width: '100%',
    background: isDarkMode ? '#0f1215' : '#f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 14px',
    fontSize: '12px',
    color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
    fontWeight: '500',
    borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
  }}>
    <span>9:41</span>
    <span style={{ display: 'flex', gap: '4px' }}>
      <span>5G</span>
      <span>●●●●</span>
    </span>
  </div>
);

const PhoneNavBar = ({ position, isDarkMode }) => (
  <div style={{
    height: '50px',
    width: '100%',
    background: isDarkMode ? '#0f1215' : '#f1f5f9',
    borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 12px',
  }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} style={{ 
        width: '28px', 
        height: '4px', 
        borderRadius: '2px',
        background: i === position % 4 || (i === 4 && position % 4 === 0)
          ? (isDarkMode ? '#3b82f6' : '#2563eb')
          : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
      }} />
    ))}
  </div>
);

const StartBadge = ({ isDarkMode }) => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px 4px 6px',
    borderRadius: '20px',
    background: isDarkMode ? '#059669' : '#10b981',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '11px',
    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
    marginRight: '8px',
  }}>
    <div style={{ 
      width: '4px', 
      height: '4px', 
      background: 'white', 
      borderRadius: '50%', 
      marginRight: '4px',
      boxShadow: '0 0 0 2px rgba(255,255,255,0.3)'
    }} />
    Start
  </div>
);

const ScreenConnector = ({ isDarkMode }) => (
  <>
    <div style={{
      height: '3px',
      background: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
      flex: 1,
      margin: '0 8px',
      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
    }} />
    <Tooltip title="Add screen">
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode ? '#3b82f6' : '#2563eb',
        color: 'white',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: isDarkMode 
          ? '0 4px 6px -1px rgba(0,0,0,0.3)'
          : '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}>
        <PlusOutlined />
      </div>
    </Tooltip>
    <div style={{
      height: '3px',
      background: isDarkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
      flex: 1,
      margin: '0 8px',
      boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
    }} />
  </>
);

// Screen content components
const DashboardScreenContent = ({ isDarkMode }) => (
  <div style={{ width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <div style={{ width: '48%', height: '60px', borderRadius: '8px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
      <div style={{ width: '48%', height: '60px', borderRadius: '8px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
    </div>
    <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', marginBottom: '10px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {[1, 2].map(i => (
        <div key={i} style={{ display: 'flex', height: '16px', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
          <div style={{ height: '8px', flex: 1, background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  </div>
);

const LoginScreenContent = ({ isDarkMode }) => (
  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
    <div style={{ 
      width: '60px', 
      height: '60px', 
      borderRadius: '50%', 
      background: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)', 
      margin: '0 auto 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '30px',
      color: isDarkMode ? '#3b82f6' : '#2563eb'
    }}>
      <UserOutlined />
    </div>
    
    {[1, 2].map(i => (
      <div key={i} style={{ marginBottom: '12px' }}>
        <div style={{ height: '6px', width: '40%', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: '3px', marginBottom: '6px' }} />
        <div style={{ height: '36px', width: '100%', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '6px' }} />
      </div>
    ))}
    
    <div style={{ 
      height: '40px', 
      width: '100%', 
      background: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.2)', 
      borderRadius: '6px',
      marginTop: '8px'
    }} />
  </div>
);

const AccountScreenContent = ({ isDarkMode }) => (
  <div style={{ width: '100%' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '16px',
      padding: '12px',
      background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      borderRadius: '12px'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '50%', 
        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        marginRight: '12px'
      }} />
      <div>
        <div style={{ height: '8px', width: '80px', background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '6px', width: '60px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '3px' }} />
      </div>
    </div>
    
    {[1, 2, 3].map(i => (
      <div key={i} style={{ 
        padding: '10px 0',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
      }}>
        <div style={{ height: '8px', width: `${70 - i * 10}%`, background: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '6px', width: `${90 - i * 5}%`, background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '3px' }} />
      </div>
    ))}
  </div>
);

const DefaultScreenContent = ({ isDarkMode }) => (
  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{ 
        height: '10px', 
        width: `${90 - i * 15}%`, 
        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
        borderRadius: '5px', 
        margin: '10px auto',
      }} />
    ))}
    
    <div style={{ 
      height: '36px', 
      width: '80%', 
      background: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', 
      borderRadius: '8px', 
      margin: '20px auto 0',
    }} />
  </div>
);

export default WorkflowDisplay;