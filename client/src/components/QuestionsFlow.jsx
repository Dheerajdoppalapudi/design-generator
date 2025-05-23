// QuestionsFlow.jsx
import React, { useState, useEffect } from 'react';
import { Typography, Button, Space, Steps, Spin, Badge } from 'antd';
import { ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const QuestionsFlow = ({ questions, onComplete, loading, errorMsg, isDarkMode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  
  const loadingMessages = [
    "Processing your answers...",
    "Creating your design brief...",
    "Finalizing your requirements...",
    "Almost ready..."
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

  const handleQuestionSubmit = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleFinalSubmit = () => {
    onComplete(answers);
  };

  // Custom spinner icon that matches the app theme
  const spinIcon = <LoadingOutlined style={{ 
    fontSize: 60, 
    color: isDarkMode ? '#00d2ff' : '#0ea5e9' 
  }} spin />;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
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
      </div>
    );
  }

  return (
    <>
      <Steps 
        current={currentQuestion} 
        progressDot
        style={{ 
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto 30px auto',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {questions.map((_, index) => (
          <Step key={index} />
        ))}
      </Steps>
      
      <div style={{ marginBottom: '20px' }}>
        <Title level={4} style={{ 
          color: isDarkMode ? '#fff' : '#000',
          marginBottom: '24px',
          fontWeight: '400',
          fontSize: '24px',
          letterSpacing: '-0.3px',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {questions[currentQuestion]?.question}
        </Title>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {questions[currentQuestion]?.options?.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleQuestionSubmit({
                question: questions[currentQuestion].question,
                answer: typeof option === 'object' ? option.text : option
              })}
              style={{
                width: '100%',
                height: '56px',
                marginBottom: '12px',
                borderRadius: '8px',
                textAlign: 'left',
                paddingLeft: '24px',
                paddingRight: '24px',
                border: 'none',
                background: isDarkMode 
                  ? 'rgba(255,255,255,0.03)' 
                  : 'linear-gradient(to right, rgba(249,250,251,1), rgba(243,244,246,0.7))',
                color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '16px',
                fontWeight: '400',
                boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {typeof option === 'object' ? option.text : option}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDarkMode 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(37,99,235,0.1)',
                color: isDarkMode ? '#fff' : '#2563eb',
              }}>
                <ArrowRightOutlined style={{ fontSize: '12px', opacity: 0.7 }} />
              </div>
            </Button>
          ))}
        </Space>
      </div>
      
      {/* Submit button positioned at bottom right after all questions answered */}
      {answers.length === questions.length && (
        <div style={{ textAlign: 'right', marginTop: 32 }}>
          <Button
            type="primary"
            size="large"
            onClick={handleFinalSubmit}
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
            Submit Answers
          </Button>
        </div>
      )}
      
      {errorMsg && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Badge count={errorMsg} style={{ backgroundColor: '#f5222d', fontSize: 16 }} />
        </div>
      )}
    </>
  );
};

export default QuestionsFlow;