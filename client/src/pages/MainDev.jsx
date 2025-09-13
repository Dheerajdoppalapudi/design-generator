import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Typography, Button, Modal } from 'antd';
import { 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    ReloadOutlined, 
    CheckCircleOutlined, 
    ArrowRightOutlined,
    FileTextOutlined,
    ProjectOutlined,
    SketchOutlined,
    CodeOutlined,
    BugOutlined,
    RocketOutlined
} from '@ant-design/icons';

// Import sub-components
import RequirementAnalysis from '../components/maindev/RequirementAnalysis';
import PlanningAgent from '../components/maindev/PlanningAgent';
import DesignAgent from '../components/maindev/DesignAgent';
import DevelopmentAgent from '../components/maindev/DevelopmentAgent';
import TestingAgent from '../components/maindev/TestingAgent';
import CICDAgent from '../components/maindev/CICDAgent';

const { Title, Text } = Typography;

const MainDev = () => {
    const { theme } = useContext(ThemeContext);
    const isDarkMode = theme === 'dark';
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const agents = [
        { 
            key: 'requirement', 
            title: 'Requirement Analysis', 
            component: RequirementAnalysis,
            description: 'Analyze and document project requirements',
            icon: FileTextOutlined
        },
        { 
            key: 'planning', 
            title: 'Planning Agent', 
            component: PlanningAgent,
            description: 'Create project structure and roadmap',
            icon: ProjectOutlined
        },
        { 
            key: 'design', 
            title: 'Design Agent', 
            component: DesignAgent,
            description: 'Generate system architecture and UI design',
            icon: SketchOutlined
        },
        { 
            key: 'development', 
            title: 'Development Agent', 
            component: DevelopmentAgent,
            description: 'Write and implement application code',
            icon: CodeOutlined
        },
        { 
            key: 'testing', 
            title: 'Testing Agent', 
            component: TestingAgent,
            description: 'Execute comprehensive testing procedures',
            icon: BugOutlined
        },
        { 
            key: 'cicd', 
            title: 'CI/CD Agent', 
            component: CICDAgent,
            description: 'Deploy and configure continuous integration',
            icon: RocketOutlined
        }
    ];

    const currentAgent = agents[currentStep];
    const CurrentComponent = currentAgent?.component;
    const isCurrentStepCompleted = completedSteps.includes(currentStep);
    const isLastStep = currentStep === agents.length - 1;

    const handleStepClick = (index) => {
        const maxAccessibleStep = Math.max(...completedSteps, -1) + 1;
        if (index <= maxAccessibleStep) {
            setCurrentStep(index);
        }
    };

    const handleStartPause = () => {
        setIsRunning(!isRunning);
    };

    const handleReset = () => {
        setCurrentStep(0);
        setIsRunning(false);
        setCompletedSteps([]);
        setShowCompleteModal(false);
    };

    const handleCompleteStep = () => {
        setShowCompleteModal(true);
    };

    const confirmCompleteStep = () => {
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps(prev => [...prev, currentStep]);
        }
        setShowCompleteModal(false);
        
        if (!isLastStep) {
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, 500);
        }
    };

    const getStepStatus = (index) => {
        if (completedSteps.includes(index)) return 'completed';
        if (index === currentStep) return 'active';
        const maxAccessibleStep = Math.max(...completedSteps, -1) + 1;
        if (index <= maxAccessibleStep) return 'accessible';
        return 'locked';
    };

    const getStepIcon = (agent, status, index) => {
        if (status === 'completed') {
            const IconComponent = agent.icon;
            return <IconComponent style={{ fontSize: 14 }} />;
        }
        return index + 1;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'active': return isDarkMode ? '#2563eb' : '#1d4ed8';
            default: return isDarkMode ? '#374151' : '#e5e7eb';
        }
    };

    const getStatusTextColor = (status) => {
        if (status === 'completed' || status === 'active') return '#fff';
        return isDarkMode ? '#9ca3af' : '#6b7280';
    };

    const getRunningStatus = () => {
        if (isCurrentStepCompleted) return { text: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
        if (isRunning) return { text: 'Running', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
        return { text: 'Pending', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.1)' };
    };

    const runningStatus = getRunningStatus();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0a0a0a' : '#fafbfc'
        }}>
            {/* Header */}
            <div style={{
                borderBottom: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                backgroundColor: isDarkMode ? '#111' : '#fff',
                padding: '24px 0',
                position: 'sticky',
                top: 63,
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0 24px'
                }}>
                    {/* Title and Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20
                    }}>
                        <div>
                            <Title level={1} style={{
                                color: isDarkMode ? '#fff' : '#1a1a1a',
                                margin: 0,
                                fontSize: 24,
                                fontWeight: 600
                            }}>
                                AI Agent Framework
                            </Title>
                            <Text style={{ 
                                color: isDarkMode ? '#9ca3af' : '#6b7280',
                                fontSize: 14,
                                display: 'block',
                                marginTop: 2
                            }}>
                                Automated software development pipeline
                            </Text>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                type="primary"
                                icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                onClick={handleStartPause}
                                style={{
                                    backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                                    borderColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                                    height: 36
                                }}
                            >
                                {isRunning ? 'Pause' : 'Start'}
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleReset}
                                style={{
                                    borderColor: isDarkMode ? '#374151' : '#d1d5db',
                                    color: isDarkMode ? '#d1d5db' : '#6b7280',
                                    height: 36
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* Progress Stepper */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        overflowX: 'auto',
                        paddingBottom: 4
                    }}>
                        {agents.map((agent, index) => {
                            const status = getStepStatus(index);
                            const isClickable = status !== 'locked';
                            
                            return (
                                <React.Fragment key={agent.key}>
                                    <div
                                        onClick={() => isClickable && handleStepClick(index)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '8px 12px',
                                            cursor: isClickable ? 'pointer' : 'default',
                                            opacity: status === 'locked' ? 0.4 : 1,
                                            borderRadius: 4,
                                            backgroundColor: status === 'active' 
                                                ? (isDarkMode ? 'rgba(37, 99, 235, 0.1)' : 'rgba(29, 78, 216, 0.05)')
                                                : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{
                                            width: 24,
                                            height: 24,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            backgroundColor: getStatusColor(status),
                                            color: getStatusTextColor(status),
                                            borderRadius: 4
                                        }}>
                                            {getStepIcon(agent, status, index)}
                                        </div>
                                        <Text style={{
                                            color: status === 'active' 
                                                ? (isDarkMode ? '#fff' : '#1a1a1a')
                                                : status === 'completed'
                                                    ? (isDarkMode ? '#d1d5db' : '#374151')
                                                    : (isDarkMode ? '#6b7280' : '#9ca3af'),
                                            fontSize: 13,
                                            fontWeight: status === 'active' ? 600 : 500,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {agent.title}
                                        </Text>
                                    </div>
                                    {index < agents.length - 1 && (
                                        <div style={{
                                            width: 16,
                                            height: 1,
                                            backgroundColor: completedSteps.includes(index)
                                                ? '#10b981' 
                                                : (isDarkMode ? '#374151' : '#e5e7eb'),
                                            margin: '0 4px'
                                        }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                {/* Current Agent Card */}
                <div style={{
                    backgroundColor: isDarkMode ? '#111' : '#fff',
                    border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                    borderRadius: 8,
                    marginBottom: 24,
                    overflow: 'hidden'
                }}>
                    {/* Agent Header */}
                    <div style={{
                        padding: '20px 24px',
                        borderBottom: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                        backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                                    borderRadius: 8
                                }}>
                                    {currentAgent && React.createElement(currentAgent.icon, {
                                        style: { fontSize: 20, color: '#fff' }
                                    })}
                                </div>
                                
                                <div>
                                    <Title level={3} style={{
                                        color: isDarkMode ? '#fff' : '#1a1a1a',
                                        margin: 0,
                                        fontSize: 18,
                                        fontWeight: 600,
                                        lineHeight: 1.2
                                    }}>
                                        {currentAgent?.title}
                                    </Title>
                                    <Text style={{
                                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                                        fontSize: 14,
                                        lineHeight: 1.3
                                    }}>
                                        {currentAgent?.description}
                                    </Text>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    padding: '4px 12px',
                                    backgroundColor: runningStatus.bg,
                                    color: runningStatus.color,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                    borderRadius: 4
                                }}>
                                    {runningStatus.text}
                                </div>
                                
                                <Text style={{
                                    color: isDarkMode ? '#6b7280' : '#9ca3af',
                                    fontSize: 13,
                                    fontWeight: 500
                                }}>
                                    {currentStep + 1} / {agents.length}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Agent Content */}
                    <div style={{
                        padding: 32,
                        minHeight: 400
                    }}>
                        {CurrentComponent && (
                            <CurrentComponent
                                isActive={true}
                                isRunning={isRunning}
                                onComplete={() => setIsRunning(false)}
                                onNext={() => {}}
                                onPrevious={() => {
                                    if (currentStep > 0) {
                                        setCurrentStep(currentStep - 1);
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Navigation Controls */}
                    <div style={{
                        padding: '20px 32px',
                        borderTop: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                        backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Button
                            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                            disabled={currentStep === 0}
                            style={{
                                borderColor: isDarkMode ? '#374151' : '#d1d5db',
                                color: isDarkMode ? '#d1d5db' : '#6b7280'
                            }}
                        >
                            Previous
                        </Button>

                        <div style={{ display: 'flex', gap: 12 }}>
                            {!isCurrentStepCompleted && (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleCompleteStep}
                                    size="large"
                                    style={{
                                        backgroundColor: '#10b981',
                                        borderColor: '#10b981'
                                    }}
                                >
                                    Complete Step
                                </Button>
                            )}
                            
                            {isCurrentStepCompleted && !isLastStep && (
                                <Button
                                    type="primary"
                                    icon={<ArrowRightOutlined />}
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    size="large"
                                    style={{
                                        backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                                        borderColor: isDarkMode ? '#2563eb' : '#1d4ed8'
                                    }}
                                >
                                    Next Agent
                                </Button>
                            )}

                            {isCurrentStepCompleted && isLastStep && (
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    size="large"
                                    style={{
                                        backgroundColor: '#10b981',
                                        borderColor: '#10b981'
                                    }}
                                >
                                    Pipeline Complete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pipeline Overview */}
                <div style={{
                    backgroundColor: isDarkMode ? '#111' : '#fff',
                    border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                    borderRadius: 8,
                    padding: 24
                }}>
                    <Text style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        fontSize: 16,
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: 16
                    }}>
                        Pipeline Overview
                    </Text>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16
                    }}>
                        {agents.map((agent, index) => {
                            const status = getStepStatus(index);
                            const isClickable = status !== 'locked';
                            const IconComponent = agent.icon;
                            
                            return (
                                <div
                                    key={agent.key}
                                    onClick={() => isClickable && handleStepClick(index)}
                                    style={{
                                        padding: 16,
                                        border: `1px solid ${
                                            status === 'active' 
                                                ? (isDarkMode ? '#2563eb' : '#1d4ed8')
                                                : (isDarkMode ? '#374151' : '#e5e7eb')
                                        }`,
                                        cursor: isClickable ? 'pointer' : 'default',
                                        opacity: status === 'locked' ? 0.5 : 1,
                                        backgroundColor: status === 'active' 
                                            ? (isDarkMode ? 'rgba(37, 99, 235, 0.05)' : 'rgba(29, 78, 216, 0.03)')
                                            : 'transparent',
                                        borderRadius: 6,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        marginBottom: 8
                                    }}>
                                        <div style={{
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 10,
                                            backgroundColor: getStatusColor(status),
                                            color: getStatusTextColor(status),
                                            borderRadius: 4,
                                            fontWeight: 600
                                        }}>
                                            {status === 'completed' ? 
                                                <IconComponent style={{ fontSize: 11 }} /> : 
                                                index + 1
                                            }
                                        </div>
                                        <Text style={{
                                            color: status === 'active' 
                                                ? (isDarkMode ? '#fff' : '#1a1a1a')
                                                : status === 'completed'
                                                    ? (isDarkMode ? '#d1d5db' : '#374151')
                                                    : (isDarkMode ? '#9ca3af' : '#6b7280'),
                                            fontSize: 12,
                                            fontWeight: status === 'active' ? 600 : 500,
                                            margin: 0
                                        }}>
                                            {agent.title}
                                        </Text>
                                    </div>
                                    {/* <Text style={{
                                        color: isDarkMode ? '#6b7280' : '#9ca3af',
                                        fontSize: 12,
                                        lineHeight: 1.4,
                                        margin: 0
                                    }}>
                                        {agent.description}
                                    </Text> */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            <Modal
                title="Complete Current Step"
                open={showCompleteModal}
                onOk={confirmCompleteStep}
                onCancel={() => setShowCompleteModal(false)}
                okText={isLastStep ? "Complete Pipeline" : "Complete & Continue"}
                cancelText="Cancel"
                centered
            >
                <p>
                    Are you sure you want to mark "<strong>{currentAgent?.title}</strong>" as complete?
                    {!isLastStep && " This will advance to the next agent in the pipeline."}
                </p>
            </Modal>
        </div>
    );
};

export default MainDev;