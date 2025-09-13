import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Typography } from 'antd';
import { BugOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TestingAgent = ({ isActive, isRunning, onComplete, onNext, onPrevious }) => {
    const { theme } = useContext(ThemeContext);
    const isDarkMode = theme === 'dark';

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <Title 
                    level={3} 
                    style={{ 
                        color: isDarkMode ? '#fff' : '#000',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <BugOutlined style={{ 
                        color: isDarkMode ? '#3b7bd5' : '#2563eb',
                        fontSize: '24px',
                    }} />
                    Testing Agent
                </Title>
                <Text style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>
                    Automated testing with unit tests, integration tests, and quality assurance
                </Text>
            </div>
        </div>
    );
};

export default TestingAgent;