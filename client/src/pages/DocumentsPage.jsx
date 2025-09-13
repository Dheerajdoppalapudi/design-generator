// DocumentsPage.jsx - Complete file with incremental wireframe generation and 15-second delays (Part 1)
import React, { useContext, useState } from 'react';
import { Typography, Space, message, Spin, Button, Progress } from 'antd';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { FileTextOutlined, LoadingOutlined, AppstoreOutlined, ReloadOutlined, CodeOutlined, ManOutlined, EditOutlined } from '@ant-design/icons';
import DescriptionInput from '../components/DescriptionInput';
import QuestionsFlow from '../components/QuestionsFlow';
import ResultsView from '../components/ResultsView';
import WorkflowDisplay from '../components/WorkflowDisplay';
import WireframeDisplay from '../components/WireframeDisplay';
import HTMLPagesDisplay from '../components/HTMLPagesDisplay';
// import FigmaExportButton from '../components/FigmaExportButton';
import EnhancedWireframeDisplay from '../components/WireframeDisplay/EnhancedWireframeDisplay';
import { apiRequest } from '../api/apiEndpoints';

const { Title, Text, Paragraph } = Typography;

const DocumentsPage = () => {
  const { theme, getColor } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';

  const [currentStep, setCurrentStep] = useState('description');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [improvedDescription, setImprovedDescription] = useState('');
  const [workflowData, setWorkflowData] = useState(null);

  // Wireframe state
  const [wireframeScreens, setWireframeScreens] = useState([]);
  const [totalScreensCount, setTotalScreensCount] = useState(0);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [wireframeGenerationComplete, setWireframeGenerationComplete] = useState(false);
  const [isWaitingBetweenRequests, setIsWaitingBetweenRequests] = useState(false);
  const [waitingCountdown, setWaitingCountdown] = useState(0);

  const [htmlPagesData, setHtmlPagesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [wireframeLoading, setWireframeLoading] = useState(false);
  const [htmlPagesLoading, setHtmlPagesLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [wireframeError, setWireframeError] = useState('');
  const [htmlPagesError, setHtmlPagesError] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Move loading messages outside useEffect to avoid dependency issues
  const loadingMessages = React.useMemo(() => [
    "Generating workflow based on your requirements...",
    "Creating application screens...",
    "Mapping user journeys...",
    "Almost there, finalizing your workflow..."
  ], []);

  const wireframeLoadingMessages = React.useMemo(() => [
    "Analyzing your workflow...",
    "Creating wireframe components...",
    "Mapping screen layouts...",
    "Finalizing your UI structure..."
  ], []);

  const htmlPagesLoadingMessages = React.useMemo(() => [
    "Generating HTML pages...",
    "Creating responsive layouts...",
    "Applying consistent styling...",
    "Finalizing your website pages..."
  ], []);

  // Setup loading message rotation
  React.useEffect(() => {
    let interval;
    if (workflowLoading || wireframeLoading || htmlPagesLoading) {
      const messages = workflowLoading ? loadingMessages :
        wireframeLoading ? wireframeLoadingMessages :
          htmlPagesLoadingMessages;

      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % messages.length);
      }, 1800);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [workflowLoading, wireframeLoading, htmlPagesLoading, loadingMessages, wireframeLoadingMessages, htmlPagesLoadingMessages]);

  // Countdown timer for waiting between requests
  React.useEffect(() => {
    let countdownInterval;
    if (isWaitingBetweenRequests && waitingCountdown > 0) {
      countdownInterval = setInterval(() => {
        setWaitingCountdown(prev => {
          if (prev <= 1) {
            setIsWaitingBetweenRequests(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isWaitingBetweenRequests, waitingCountdown]);

  const apiRequest = React.useCallback(async (url, method = 'GET', body = null, token = null) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || 'Something went wrong',
        };
      }

      return data;
    } catch (error) {
      console.error('Network or parsing error:', error);
      return {
        success: false,
        error: 'Network or parsing error',
      };
    }
  }, []);

  const handleDescriptionSubmit = React.useCallback(async (descText, files = []) => {
    setDescription(descText);
    setErrorMsg('');
    setLoading(true);

    try {
      // const formData = new FormData();
      // formData.append('description', descText);

      // files.forEach((file, index) => {
      //   formData.append(`file_${index}`, file);
      // });

      // const response = await fetch('http://localhost:8000/api/designs/process', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${user?.token}`,
      //   },
      //   body: formData
      // });

      // const result = await response.json();

      const result = {
        "success": true,
        "message": "Description processed successfully",
        "questions": [
          {
            "question": "What type of design do you want?",
            "options": [
              "Website",
              "Mobile App",
              "Both Website & Mobile App"
            ]
          },
          {
            "question": "How important is user authentication for this application?",
            "options": [
              "Very Important - Users need to be logged in to book drones",
              "Somewhat Important - Users can browse booking options without logging in, but may need to log in to proceed with booking",
              "Not Very Important - Anyone can access booking options without logging in"
            ]
          },
          {
            "question": "Do you have any specific color scheme or branding guidelines for the drone company?",
            "options": [
              "Yes, please provide me with the guidelines",
              "No, but I'd like to explore some standard color schemes and fonts",
              "I don't know, can you suggest some options"
            ]
          },
          {
            "question": "How would you like to design the booking process? Should it be a multi-step process or a single form with all required fields?",
            "options": [
              "Multi-Step Process",
              "Single Form with all required fields",
              "Hybrid - Single form with some steps and optional fields"
            ]
          },
          {
            "question": "Are there any specific features you would like to include in the booking history section of the application?",
            "options": [
              "Show all bookings, with details such as date, slot, and drone type",
              "Allow users to cancel or edit existing bookings",
              "Provide analytics or insights on user's booking history"
            ]
          }
        ]
      }

      if (result.success) {
        setQuestions(result.questions || []);
        setCurrentStep('questions');
      } else {
        setErrorMsg(result.error || 'Failed to process description');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Failed to process your description');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  const handleQuestionsComplete = React.useCallback(async (answeredQuestions) => {
    setAnswers(answeredQuestions);
    setLoading(true);
    setErrorMsg("");

    try {
      // const response = await apiRequest(
      //   'http://localhost:8000/api/designs/construct-description',
      //   'POST',
      //   { description, answers: answeredQuestions },
      //   user?.token
      // );

      const response = {
        "message": "Constructed better description successfully",
        "success": true,
        "improvedDescription": "Here is the improved design description:\n\n**Design Description**\n\n**Application:** Drone Booking Application for Spraying Services\n\n**Overview:** The application will allow users to book drones for spraying services on a specific date and time slot. The app will have a homepage, booking functionality, and user account management.\n\n**Key Features:**\n\n1. **Homepage:** A visually appealing page that showcases available drone options, upcoming events, or promotions.\n2. **Booking Process:**\n\t* Users can browse available drones and select their preferred date and slot on a single form with all required fields (date, time slot, drone type).\n\t* Upon submission, the app will confirm the booking details and allow users to proceed with payment processing.\n3. **User Account Management:** Users can log in to access their account information and view their booking history.\n4. **Booking History:**\n\t* A dedicated section within the user account where bookings are listed with details such as date, slot, and drone type.\n\n**Design Requirements:**\n\n1. Mobile App design for both iOS and Android platforms\n2. Standard color scheme and font suggestions will be explored to ensure a professional look and feel\n\n**User Authentication:** User authentication is somewhat important, allowing users to browse booking options without logging in but requiring login to proceed with booking and access account information.\n\nThis improved description includes a more detailed overview of the application's features and requirements, making it easier for the design team to create an effective and user-friendly design."
      }

      if (response.success) {
        message.success('Your design requirements have been submitted!');
        setImprovedDescription(response.improvedDescription || 'Thank you for your submission. Our design team will review your requirements and get back to you shortly.');
        setCurrentStep('results');
      } else {
        setErrorMsg(response.error || 'Failed to submit your answers');
      }
    } catch (error) {
      setErrorMsg('Failed to submit your answers');
    } finally {
      setLoading(false);
    }
  }, [apiRequest, description, user?.token]);

  const handleGeneratePages = React.useCallback(async () => {
    setWorkflowLoading(true);
    setCurrentStep('workflow');
    setErrorMsg("");

    try {
      // const response = await apiRequest(
      //   'http://localhost:8000/api/designs/generate-pages',
      //   'POST',
      //   { description: improvedDescription, answers },
      //   user?.token
      // );

      const response = {
        "success": true,
        "data": {
          "workflow": [
            {
              "id": "dashboard",
              "title": "Dashboard",
              "description": "Welcome screen displaying available drone options and promotions.",
              "position": 1,
              "isStartPoint": true,
              "nextScreens": [
                "login"
              ]
            },
            {
              "id": "login",
              "title": "Login",
              "description": "Users can log in to access their account information and proceed with booking.",
              "position": 2,
              "previousScreens": [
                "dashboard"
              ],
              "nextScreens": [
                "booking-selection",
                "create-account"
              ]
            },
            {
              "id": "create-account",
              "title": "Create Account",
              "description": "New users can create an account to access their booking history and proceed with booking.",
              "position": 3,
              "previousScreens": [
                "login"
              ],
              "nextScreens": [
                "booking-selection"
              ]
            },
            {
              "id": "booking-selection",
              "title": "Book Drone",
              "description": "Users can select a drone, date, and time slot for booking on a single form.",
              "position": 4,
              "previousScreens": [
                "login",
                "create-account"
              ],
              "nextScreens": [
                "payment-processing"
              ]
            },
            {
              "id": "payment-processing",
              "title": "Pay Now",
              "description": "Users can proceed with payment processing to confirm their booking details.",
              "position": 5,
              "previousScreens": [
                "booking-selection"
              ],
              "nextScreens": [
                "booking-confirmation"
              ]
            },
            {
              "id": "booking-confirmation",
              "title": "Booking Confirmed",
              "description": "Users can view a summary of their booking, including date, slot, and drone type.",
              "position": 6,
              "previousScreens": [
                "payment-processing"
              ],
              "nextScreens": []
            },
            {
              "id": "account-management",
              "title": "Account Settings",
              "description": "Users can access their account information and view booking history from this section.",
              "position": 7,
              "previousScreens": [
                "login",
                "create-account"
              ],
              "nextScreens": []
            }
          ]
        }
      }


      if (response.success) {
        message.success('Workflow generated successfully!');
        setWorkflowData(response.data.workflow);

        const screensCount = response.data.workflow?.length || 5;
        setTotalScreensCount(screensCount);
      } else {
        setErrorMsg(response.error || 'Failed to generate workflow');
      }
    } catch (error) {
      setErrorMsg('Failed to generate workflow');
      console.error('Error generating workflow:', error);
    } finally {
      setWorkflowLoading(false);
    }
  }, [apiRequest, improvedDescription, answers, user?.token]);

  const generateNextWireframeScreen = React.useCallback(async (screenIndex) => {
    try {
      setCurrentScreenIndex(screenIndex);
      setIsWaitingBetweenRequests(false);

      console.log(`Starting generation of wireframe screen ${screenIndex + 1}/${totalScreensCount}`);

      const response = await apiRequest(
        'http://localhost:8000/api/designs/generate-wireframe',
        'POST',
        {
          description: improvedDescription,
          workflow: workflowData,
          screenIndex: screenIndex
        },
        user?.token
      );

      if (response.success) {
        // Add the new wireframe screen to the array immediately - REAL-TIME DISPLAY
        setWireframeScreens(prev => {
          const newScreens = [...prev, response.wireframe];
          console.log(`✅ Wireframe screen ${screenIndex + 1} generated and displayed! Total screens: ${newScreens.length}/${totalScreensCount}`);
          message.success(`Screen ${screenIndex + 1} generated successfully!`);
          return newScreens;
        });

        // Check if we need to generate more screens
        const nextScreenIndex = screenIndex + 1;
        if (nextScreenIndex < totalScreensCount) {
          // Start 15-second countdown before next request
          console.log(`Waiting 15 seconds before generating screen ${nextScreenIndex + 1}...`);
          setIsWaitingBetweenRequests(true);
          setWaitingCountdown(15);

          // Use setTimeout instead of manual countdown for more reliable timing
          setTimeout(async () => {
            setIsWaitingBetweenRequests(false);
            await generateNextWireframeScreen(nextScreenIndex);
          }, 15000);

        } else {
          // All screens generated
          setWireframeGenerationComplete(true);
          setWireframeLoading(false);
          setIsWaitingBetweenRequests(false);
          console.log(`✅ All ${totalScreensCount} wireframe screens generated successfully!`);
          message.success(`All ${totalScreensCount} wireframe screens generated successfully!`);
        }
      } else {
        setWireframeError(response.error || `Failed to generate wireframe screen ${screenIndex + 1}`);
        setWireframeLoading(false);
        setIsWaitingBetweenRequests(false);
        message.error(`Failed to generate screen ${screenIndex + 1}`);
      }
    } catch (error) {
      setWireframeError(`Failed to generate wireframe screen ${screenIndex + 1}`);
      setWireframeLoading(false);
      setIsWaitingBetweenRequests(false);
      message.error(`Error generating screen ${screenIndex + 1}`);
      console.error('Error generating wireframe screen:', error);
    }
  }, [apiRequest, improvedDescription, workflowData, user?.token, totalScreensCount]);

  // Add these two handlers here
  const handleWireframeUpdate = React.useCallback((updatedWireframes, screenIndex = null) => {
    if (Array.isArray(updatedWireframes)) {
      // Multi-screen update
      setWireframeScreens(updatedWireframes);
    } else {
      // Single screen update
      if (screenIndex !== null) {
        setWireframeScreens(prev => {
          const newScreens = [...prev];
          newScreens[screenIndex] = updatedWireframes;
          return newScreens;
        });
      } else {
        // Update first screen if no index specified
        setWireframeScreens(prev => {
          if (prev.length === 0) return [updatedWireframes];
          const newScreens = [...prev];
          newScreens[0] = updatedWireframes;
          return newScreens;
        });
      }
    }
  }, []);

  const handleWireframeExport = React.useCallback((wireframe) => {
    const dataStr = JSON.stringify({
      wireframe,
      metadata: {
        exportedAt: new Date().toISOString(),
        appName: wireframe?.app?.name || 'Mobile App',
        totalScreens: wireframeScreens.length,
        workflow: workflowData
      }
    }, null, 2);

    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wireframe?.app?.name || 'mobile-app'}-wireframe.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [wireframeScreens, workflowData]);

  // Updated wireframe generation with 15-second delays
  const handleGenerateWireframe = React.useCallback(async () => {
    setWireframeLoading(true);
    setWireframeError('');
    setCurrentStep('wireframe');
    setCurrentScreenIndex(0);
    setWireframeScreens([]);
    setWireframeGenerationComplete(false);
    setIsWaitingBetweenRequests(false);
    setWaitingCountdown(0);

    // Start generating screens one by one
    await generateNextWireframeScreen(0);
  }, [generateNextWireframeScreen]);

  const handleRetryWireframeGeneration = React.useCallback(async () => {
    setWireframeError('');
    await handleGenerateWireframe();
  }, [handleGenerateWireframe]);

  const handleGenerateHtmlPages = React.useCallback(async () => {
    setHtmlPagesLoading(true);
    setHtmlPagesError('');
    setCurrentStep('htmlpages');

    try {
      const response = await apiRequest(
        'http://localhost:8000/api/codedesign/generate-html-pages',
        'POST',
        {
          designDescription: improvedDescription,
          workflow: workflowData,
          wireframeScreens: wireframeScreens,
          siteType: "e-commerce website",
          saveToFile: false
        },
        user?.token
      );

      if (response.success) {
        message.success('HTML pages generated successfully!');
        setHtmlPagesData(response.data.htmlFiles || []);
      } else {
        setHtmlPagesError(response.error || 'Failed to generate HTML pages');
      }
    } catch (error) {
      setHtmlPagesError('Failed to generate HTML pages');
      console.error('Error generating HTML pages:', error);
    } finally {
      setHtmlPagesLoading(false);
    }
  }, [apiRequest, improvedDescription, workflowData, wireframeScreens, user?.token]);

  const handleRegenerateHtmlPages = React.useCallback(async () => {
    setHtmlPagesError('');
    await handleGenerateHtmlPages();
  }, [handleGenerateHtmlPages]);

  const spinIcon = <LoadingOutlined style={{
    fontSize: 60,
    color: isDarkMode ? '#00d2ff' : '#0ea5e9'
  }} spin />;

  const containerStyle = {
    maxWidth: '1050px',
    margin: '0 auto',
    padding: '60px 20px',
  };

  const buttonStyles = {
    height: '48px',
    padding: '0 32px',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '4px',
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
  };

  const getCurrentDesignData = React.useCallback(() => ({
    workflow: workflowData,
    wireframeData: wireframeScreens,
    improvedDescription: improvedDescription,
    answers: answers,
    description: description,
    htmlFiles: htmlPagesData
  }), [workflowData, wireframeScreens, improvedDescription, answers, description, htmlPagesData]);

  if (isEditMode && wireframeScreens.length > 0) {
    return (
      <EnhancedWireframeDisplay
        wireframeScreens={wireframeScreens}
        isDarkMode={isDarkMode}
        isMultiScreen={true}
        totalScreens={totalScreensCount}
        currentGeneratingIndex={currentScreenIndex}
        isLoading={wireframeLoading}
        isWaitingBetweenRequests={isWaitingBetweenRequests}
        waitingCountdown={waitingCountdown}
        onWireframeUpdate={handleWireframeUpdate}
        onExport={handleWireframeExport}
      />
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: getColor('level01'),
    }}>
      <div style={containerStyle}>
        <Title
          level={2}
          style={{
            color: isDarkMode ? '#fff' : '#000',
            marginBottom: '40px',
            fontWeight: '500',
            fontSize: '28px',
            letterSpacing: '-0.5px',
          }}
        >
          <span style={{
            background: isDarkMode ? 'linear-gradient(90deg, #3a7bd5, #00d2ff)' : 'linear-gradient(90deg, #2563eb, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginRight: '12px'
          }}>
            <FileTextOutlined />
          </span>
          Design Generator
        </Title>

        {/* Step 1: Description */}
        {(currentStep === 'description' || description) && (
          <div style={{ marginBottom: currentStep !== 'description' ? '40px' : '0' }}>
            {currentStep !== 'description' && (
              <Title
                level={4}
                style={{
                  color: isDarkMode ? '#fff' : '#000',
                  marginBottom: '16px',
                  fontWeight: '500',
                }}
              >
                Step 1: Design Description
              </Title>
            )}

            {currentStep === 'description' ? (
              <DescriptionInput
                onSubmit={handleDescriptionSubmit}
                loading={loading}
                errorMsg={errorMsg}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div style={{
                padding: '16px 24px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
              }}>
                <OriginalDescription
                  description={description}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Questions */}
        {(currentStep === 'questions' || (currentStep !== 'description' && questions.length > 0)) && (
          <div style={{ marginBottom: currentStep !== 'questions' ? '40px' : '0' }}>
            {currentStep !== 'questions' && (
              <Title
                level={4}
                style={{
                  color: isDarkMode ? '#fff' : '#000',
                  marginBottom: '16px',
                  marginTop: '30px',
                  fontWeight: '500',
                }}
              >
                Step 2: Requirements
              </Title>
            )}

            {currentStep === 'questions' ? (
              <QuestionsFlow
                questions={questions}
                onComplete={handleQuestionsComplete}
                loading={loading}
                errorMsg={errorMsg}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div style={{
                padding: '16px 24px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
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
                  Your Selected Preferences
                </Text>

                <Space direction="vertical" style={{ width: '100%' }}>
                  {answers.map((answer, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
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
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {(currentStep === 'results' || (currentStep !== 'description' && currentStep !== 'questions' && improvedDescription)) && (
          <div style={{ marginBottom: currentStep !== 'results' ? '40px' : '0' }}>
            {currentStep !== 'results' && (
              <Title
                level={4}
                style={{
                  color: isDarkMode ? '#fff' : '#000',
                  marginBottom: '16px',
                  marginTop: '30px',
                  fontWeight: '500',
                }}
              >
                Step 3: Design Requirements
              </Title>
            )}

            {currentStep === 'results' ? (
              <ResultsView
                improvedDescription={improvedDescription}
                answers={answers}
                onNext={handleGeneratePages}
                loading={loading}
                errorMsg={errorMsg}
                isDarkMode={isDarkMode}
              />
            ) : (
              <div style={{
                padding: '16px 24px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
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
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}>
                  {improvedDescription}
                </Paragraph>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Workflow */}
        {(currentStep === 'workflow' || currentStep === 'wireframe' || currentStep === 'htmlpages') && (
          <div style={{ marginBottom: currentStep !== 'workflow' ? '40px' : '0' }}>
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                marginBottom: '16px',
                marginTop: '30px',
                fontWeight: '500',
              }}
            >
              Step 4: Application Workflow
            </Title>

            {workflowLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin indicator={spinIcon} />
                <Paragraph style={{
                  marginTop: 24,
                  color: isDarkMode ? '#fff' : '#333',
                  fontSize: 18,
                  fontWeight: 500,
                }}>
                  {loadingMessages[loadingMsgIndex]}
                </Paragraph>
              </div>
            ) : (
              <>
                {workflowData ? (
                  <div>
                    <WorkflowDisplay workflow={workflowData} isDarkMode={isDarkMode} />

                    {currentStep === 'workflow' && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '30px',
                        marginBottom: '16px'
                      }}>
                        {/* <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}> */}
                        <Button
                          type="default"
                          size="large"
                          icon={<EditOutlined />}
                          onClick={() => setIsEditMode(true)}
                          style={{
                            ...buttonStyles,
                            backgroundColor: '#52c41a',
                            borderColor: '#52c41a',
                            color: '#fff'
                          }}
                        >
                          Open Editor
                        </Button>
                        {/* <FigmaExportButton
                          designData={getCurrentDesignData()}
                          isDarkMode={isDarkMode}
                          size="small"
                          currentStep="workflow"
                          placement="corner"
                        /> */}

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <Button
                            type="default"
                            size="large"
                            icon={<AppstoreOutlined />}
                            onClick={handleGenerateWireframe}
                            loading={wireframeLoading}
                            style={{ ...buttonStyles, backgroundColor: 'transparent', color: isDarkMode ? '#fff' : '#000' }}
                          >
                            Generate UI Wireframe
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            icon={<CodeOutlined />}
                            onClick={handleGenerateHtmlPages}
                            loading={htmlPagesLoading}
                            style={buttonStyles}
                          >
                            Generate HTML Pages
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: isDarkMode ? '#fff' : '#333' }}>
                    No workflow data available. Please try generating again.
                  </div>
                )}
              </>
            )}

            {errorMsg && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text style={{ color: '#f5222d', fontSize: 16 }}>
                  {errorMsg}
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Wireframe */}
        {(currentStep === 'wireframe' || currentStep === 'htmlpages') && (
          <div style={{ marginBottom: currentStep !== 'wireframe' ? '40px' : '0' }}>
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                marginBottom: '16px',
                marginTop: '30px',
                fontWeight: '500',
              }}
            >
              Step 5: UI Wireframe
            </Title>

            {/* Show loading only if no screens are generated yet */}
            {wireframeLoading && wireframeScreens.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin indicator={spinIcon} />
                <Paragraph style={{
                  marginTop: 24,
                  color: isDarkMode ? '#fff' : '#333',
                  fontSize: 18,
                  fontWeight: 500,
                }}>
                  {wireframeLoadingMessages[loadingMsgIndex]}
                </Paragraph>

                <div style={{ maxWidth: '400px', margin: '20px auto' }}>
                  <Progress
                    percent={0}
                    format={() => `Starting wireframe generation...`}
                    strokeColor={isDarkMode ? '#00d2ff' : '#0ea5e9'}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Show wireframes immediately as they are generated */}
                {wireframeScreens.length > 0 && (
                  <div>
                    <EnhancedWireframeDisplay
                      wireframeScreens={wireframeScreens}
                      isDarkMode={isDarkMode}
                      isMultiScreen={true}
                      totalScreens={totalScreensCount}
                      currentGeneratingIndex={currentScreenIndex}
                      isLoading={wireframeLoading}
                      isWaitingBetweenRequests={isWaitingBetweenRequests}
                      waitingCountdown={waitingCountdown}
                      onWireframeUpdate={handleWireframeUpdate}
                      onExport={handleWireframeExport}
                    />

                    {currentStep === 'wireframe' && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '30px',
                        padding: '20px',
                        background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                        borderRadius: '8px',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                      }}>
                        {/* <FigmaExportButton
                          designData={getCurrentDesignData()}
                          isDarkMode={isDarkMode}
                          size="small"
                          currentStep="wireframe"
                          placement="corner"
                        /> */}

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {/* Generation status indicator */}
                          {wireframeLoading && !wireframeGenerationComplete && (
                            <div style={{
                              padding: '8px 16px',
                              background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(24, 144, 255, 0.1)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: '1px solid #1890ff'
                            }}>
                              <LoadingOutlined style={{ color: '#1890ff' }} />
                              <Text style={{ color: '#1890ff', fontSize: '14px', fontWeight: '500' }}>
                                {isWaitingBetweenRequests
                                  ? `Next screen in ${waitingCountdown}s`
                                  : `Generating screen ${currentScreenIndex + 1}...`
                                }
                              </Text>
                            </div>
                          )}

                          {/* Completion indicator */}
                          {wireframeGenerationComplete && (
                            <div style={{
                              padding: '8px 16px',
                              background: isDarkMode ? 'rgba(82, 196, 26, 0.1)' : 'rgba(82, 196, 26, 0.1)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              border: '1px solid #52c41a'
                            }}>
                              <CheckOutlined style={{ color: '#52c41a' }} />
                              <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: '500' }}>
                                All wireframes generated!
                              </Text>
                            </div>
                          )}

                          {/* Generate HTML Pages Button - Always show, enable when wireframes complete */}
                          <Button
                            type="primary"
                            size="large"
                            icon={<CodeOutlined />}
                            onClick={handleGenerateHtmlPages}
                            loading={htmlPagesLoading}
                            disabled={!wireframeGenerationComplete && wireframeLoading}
                            style={{
                              ...buttonStyles,
                              opacity: (!wireframeGenerationComplete && wireframeLoading) ? 0.6 : 1
                            }}
                          >
                            Generate HTML Pages
                          </Button>

                          {/* Retry wireframe button if there's an error */}
                          {wireframeError && (
                            <Button
                              type="default"
                              size="large"
                              icon={<ReloadOutlined />}
                              onClick={handleRetryWireframeGeneration}
                              loading={wireframeLoading}
                              style={{
                                ...buttonStyles,
                                backgroundColor: 'transparent',
                                color: isDarkMode ? '#fff' : '#000',
                                borderColor: '#f5222d'
                              }}
                            >
                              Retry Wireframes
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show placeholder/error only if no screens and not loading */}
                {wireframeScreens.length === 0 && !wireframeLoading && (
                  <div>
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: isDarkMode ? '#fff' : '#333',
                      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                      borderRadius: '8px',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
                    }}>
                      {wireframeError ? (
                        <Text style={{ color: '#f5222d', fontSize: 16 }}>
                          {wireframeError}
                        </Text>
                      ) : (
                        <Text>No wireframe data available. You can skip this step and generate HTML pages directly.</Text>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '20px'
                    }}>
                      {/* <FigmaExportButton
                        designData={getCurrentDesignData()}
                        isDarkMode={isDarkMode}
                        size="small"
                        currentStep="wireframe"
                        placement="corner"
                      /> */}

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {wireframeError && (
                          <Button
                            type="default"
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={handleRetryWireframeGeneration}
                            loading={wireframeLoading}
                            style={{ ...buttonStyles, backgroundColor: 'transparent', color: isDarkMode ? '#fff' : '#000' }}
                          >
                            Retry Generate Wireframe
                          </Button>
                        )}
                        <Button
                          type="primary"
                          size="large"
                          icon={<CodeOutlined />}
                          onClick={handleGenerateHtmlPages}
                          loading={htmlPagesLoading}
                          style={buttonStyles}
                        >
                          Generate HTML Pages
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step 6: HTML Pages */}
        {currentStep === 'htmlpages' && (
          <div>
            <Title
              level={4}
              style={{
                color: isDarkMode ? '#fff' : '#000',
                marginBottom: '16px',
                marginTop: '30px',
                fontWeight: '500',
              }}
            >
              Step 6: HTML Pages
            </Title>

            {htmlPagesLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin indicator={spinIcon} />
                <Paragraph style={{
                  marginTop: 24,
                  color: isDarkMode ? '#fff' : '#333',
                  fontSize: 18,
                  fontWeight: 500,
                }}>
                  {htmlPagesLoadingMessages[loadingMsgIndex]}
                </Paragraph>
              </div>
            ) : (
              <>
                {htmlPagesData && htmlPagesData.length > 0 ? (
                  <HTMLPagesDisplay
                    htmlFiles={htmlPagesData}
                    isDarkMode={isDarkMode}
                    onRegeneratePages={handleRegenerateHtmlPages}
                    loading={htmlPagesLoading}
                    designData={getCurrentDesignData()}
                  />
                ) : (
                  <div>
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: isDarkMode ? '#fff' : '#333',
                      background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                      borderRadius: '8px',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
                    }}>
                      {htmlPagesError ? (
                        <Text style={{ color: '#f5222d', fontSize: 16 }}>
                          {htmlPagesError}
                        </Text>
                      ) : (
                        <Text>No HTML pages available. Please try generating again.</Text>
                      )}
                    </div>

                    {/* Retry button when HTML pages generation fails */}
                    {htmlPagesError && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '20px'
                      }}>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ReloadOutlined />}
                          onClick={handleGenerateHtmlPages}
                          loading={htmlPagesLoading}
                          style={buttonStyles}
                        >
                          Retry Generate HTML Pages
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Small helper component for showing the original description
const OriginalDescription = ({ description, isDarkMode }) => {
  const { Text, Paragraph } = Typography;

  return (
    <>
      <Text style={{
        fontSize: '13px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        fontWeight: '600',
      }}>
        Your Description
      </Text>
      <Paragraph style={{
        margin: '8px 0 0 0',
        color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
        fontSize: '15px',
        lineHeight: '1.6',
      }}>
        {description}
      </Paragraph>
    </>
  );
};

export default DocumentsPage;