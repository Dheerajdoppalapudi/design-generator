// DocumentsPage.jsx - Main container component with HTML Pages Display and Figma Export
import React, { useContext, useState } from 'react';
import { Typography, Space, message, Spin, Button } from 'antd';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { FileTextOutlined, LoadingOutlined, AppstoreOutlined, ReloadOutlined, CodeOutlined, ManOutlined } from '@ant-design/icons';
import DescriptionInput from '../components/DescriptionInput';
import QuestionsFlow from '../components/QuestionsFlow';
import ResultsView from '../components/ResultsView';
import WorkflowDisplay from '../components/WorkflowDisplay';
import WireframeDisplay from '../components/WireframeDisplay';
import HTMLPagesDisplay from '../components/HTMLPagesDisplay';
import FigmaExportButton from '../components/FigmaExportButton';
import { apiRequest } from '../api/apiEndpoints';

const { Title, Text, Paragraph } = Typography;

const DocumentsPage = () => {
  const { theme, getColor } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';

  const [currentStep, setCurrentStep] = useState('description'); // 'description', 'questions', 'results', 'workflow', 'wireframe', 'htmlpages'
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [improvedDescription, setImprovedDescription] = useState('');
  const [workflowData, setWorkflowData] = useState(null);
  const [wireframeData, setWireframeData] = useState(null);
  const [htmlPagesData, setHtmlPagesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [wireframeLoading, setWireframeLoading] = useState(false);
  const [htmlPagesLoading, setHtmlPagesLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [wireframeError, setWireframeError] = useState('');
  const [htmlPagesError, setHtmlPagesError] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const loadingMessages = [
    "Generating workflow based on your requirements...",
    "Creating application screens...",
    "Mapping user journeys...",
    "Almost there, finalizing your workflow..."
  ];

  const wireframeLoadingMessages = [
    "Analyzing your workflow...",
    "Creating wireframe components...",
    "Mapping screen layouts...",
    "Finalizing your UI structure..."
  ];

  const htmlPagesLoadingMessages = [
    "Generating HTML pages...",
    "Creating responsive layouts...",
    "Applying consistent styling...",
    "Finalizing your website pages..."
  ];

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
    return () => clearInterval(interval);
  }, [workflowLoading, wireframeLoading, htmlPagesLoading]);

  const handleDescriptionSubmit = async (descText) => {
    setDescription(descText);
    setErrorMsg('');
    setLoading(true);

    try {
      // const response = await apiRequest(
      //   'http://localhost:8000/api/designs/process',
      //   'POST',
      //   { description: description },
      //   user?.token
      // );

      const response = {
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

      if (response.success) {
        setQuestions(response.questions || []);
        setCurrentStep('questions');
      } else {
        setErrorMsg(response.error || 'Failed to process description');
      }
    } catch (error) {
      setErrorMsg('Failed to process your description');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionsComplete = async (answeredQuestions) => {
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
  };

  const apiRequest = async (url, method = 'GET', body = null, token = null) => {
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
  };

  const handleGeneratePages = async () => {
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
      } else {
        setErrorMsg(response.error || 'Failed to generate workflow');
      }
    } catch (error) {
      setErrorMsg('Failed to generate workflow');
      console.error('Error generating workflow:', error);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleGenerateWireframe = async () => {
    setWireframeLoading(true);
    setWireframeError('');
    setCurrentStep('wireframe');

    try {
      const response = await apiRequest(
        'http://localhost:8000/api/designs/generate-wireframe',
        'POST',
        { description: improvedDescription, workflow: workflowData },
        user?.token
      );

      // const response = {
      //   "success": true,
      //   "message": "Wireframe generated successfully",
      //   "wireframe": {
      //     "app": {
      //       "name": "Drone Booking App",
      //       "description": "Agricultural drone booking application",
      //       "theme": {
      //         "primary": "#1890ff",
      //         "secondary": "#52c41a",
      //         "background": "#f5f5f5",
      //         "text": "#262626",
      //         "error": "#ff4d4f",
      //         "success": "#52c41a",
      //         "warning": "#faad14",
      //         "border": "#d9d9d9",
      //         "surface": "#ffffff",
      //         "accent": "#722ed1"
      //       },
      //       "nav": {
      //         "type": "tabs",
      //         "items": [
      //           {
      //             "name": "Home",
      //             "icon": "home",
      //             "screen": "dashboard"
      //           }
      //         ]
      //       }
      //     },
      //     "screens": [
      //       {
      //         "name": "dashboard",
      //         "title": "Dashboard",
      //         "description": "Welcome to our drone booking application. Book your agricultural drone services today.",
      //         "workflowPosition": 1,
      //         "isStartPoint": true,
      //         "nextScreens": [
      //           "date-selection"
      //         ],
      //         "components": [
      //           {
      //             "id": "header-1",
      //             "type": "Header",
      //             "dataProperties": {
      //               "title": "Dashboard",
      //               "subtitle": "Agricultural Drone Services"
      //             },
      //             "designProperties": {
      //               "backgroundColor": "#1890ff",
      //               "textColor": "#ffffff",
      //               "height": 60,
      //               "alignment": "center",
      //               "hasBack": false,
      //               "hasMenu": true,
      //               "elevation": 2
      //             }
      //           },
      //           {
      //             "id": "carousel-1",
      //             "type": "Carousel",
      //             "dataProperties": {
      //               "items": [
      //                 {
      //                   "title": "Special Promotion!",
      //                   "description": "Get 10% off your first booking"
      //                 },
      //                 {
      //                   "title": "New Feature!",
      //                   "description": "Book multiple dates at once"
      //                 }
      //               ]
      //             },
      //             "designProperties": {
      //               "height": 200,
      //               "autoplay": true,
      //               "dots": true,
      //               "backgroundColor": "#ffffff",
      //               "elevation": 1
      //             }
      //           },
      //           {
      //             "id": "card-book",
      //             "type": "Card",
      //             "dataProperties": {
      //               "title": "Book Now",
      //               "description": "Select a date and time for your drone service",
      //               "icon": "plus",
      //               "action": "navigate",
      //               "navigationScreen": "date-selection"
      //             },
      //             "designProperties": {
      //               "backgroundColor": "#ffffff",
      //               "textColor": "#262626",
      //               "elevation": 1,
      //               "padding": 16,
      //               "borderRadius": 8,
      //               "margin": 8
      //             }
      //           },
      //           {
      //             "id": "card-history",
      //             "type": "Card",
      //             "dataProperties": {
      //               "title": "Booking History",
      //               "description": "View your previous bookings",
      //               "icon": "calendar",
      //               "action": "navigate",
      //               "navigationScreen": "booking-history"
      //             },
      //             "designProperties": {
      //               "backgroundColor": "#ffffff",
      //               "textColor": "#262626",
      //               "elevation": 1,
      //               "padding": 16,
      //               "borderRadius": 8,
      //               "margin": 8
      //             }
      //           },
      //           {
      //             "id": "button-1",
      //             "type": "Button",
      //             "dataProperties": {
      //               "text": "Start Booking",
      //               "icon": "arrow-right",
      //               "action": "navigate",
      //               "navigationScreen": "date-selection"
      //             },
      //             "designProperties": {
      //               "backgroundColor": "#1890ff",
      //               "textColor": "#ffffff",
      //               "height": 48,
      //               "width": "100%",
      //               "borderRadius": 8,
      //               "elevation": 1,
      //               "margin": 16
      //             }
      //           }
      //         ]
      //       }
      //     ],
      //     "data": {
      //       "globalData": {
      //         "user": {
      //           "name": "User",
      //           "avatar": "https://example.com/avatar.jpg"
      //         }
      //       },
      //       "screenData": {
      //         "dashboard": {
      //           "screenInfo": {
      //             "id": "dashboard",
      //             "title": "Dashboard",
      //             "description": "Welcome to our drone booking application. Book your agricultural drone services today."
      //           }
      //         }
      //       }
      //     },
      //     "workflow": {
      //       "currentScreen": "dashboard",
      //       "totalScreens": 5,
      //       "nextScreens": [
      //         "date-selection"
      //       ],
      //       "isComplete": false
      //     },
      //     "metadata": {
      //       "version": "2.0",
      //       "generatedAt": "2025-01-01T00:00:00Z",
      //       "description": "Generated wireframe for first screen",
      //       "workflowBased": true
      //     }
      //   },
      //   "validation": {
      //     "isValid": true,
      //     "warnings": []
      //   },
      //   "metadata": {
      //     "generatedAt": "2025-05-26T12:17:39.313Z",
      //     "inputLength": 1153,
      //     "screenCount": 1,
      //     "componentCount": 5
      //   },
      //   "timestamp": "2025-05-26T12:17:39.313Z"
      // }

      if (response.success) {
        console.log('Wireframe generated successfully!');
        setWireframeData(response.wireframe);
      } else {
        setWireframeError(response.error || 'Failed to generate wireframe');
      }
    } catch (error) {
      setWireframeError('Failed to generate wireframe');
      console.error('Error generating wireframe:', error);
    } finally {
      setWireframeLoading(false);
    }
  };

  const handleGenerateHtmlPages = async () => {
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
  };

  const handleRegenerateHtmlPages = async () => {
    setHtmlPagesError('');
    await handleGenerateHtmlPages();
  };

  // Custom spinner icon that matches the app theme
  const spinIcon = <LoadingOutlined style={{
    fontSize: 60,
    color: isDarkMode ? '#00d2ff' : '#0ea5e9'
  }} spin />;

  const containerStyle = {
    maxWidth: '1050px',
    margin: '0 auto',
    padding: '60px 20px',
  };

  // Professional button styles
  const buttonStyles = {
    height: '48px',
    padding: '0 32px',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '4px',
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
  };

  // Get current design data for Figma export
  const getCurrentDesignData = () => ({
    workflow: workflowData,
    wireframeData: wireframeData,
    improvedDescription: improvedDescription,
    answers: answers,
    description: description,
    htmlFiles: htmlPagesData
  });

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
                        <FigmaExportButton
                          designData={getCurrentDesignData()}
                          isDarkMode={isDarkMode}
                          size="small"
                          currentStep="workflow"
                          placement="corner"
                        />

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

            {wireframeLoading ? (
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
              </div>
            ) : (
              <>
                {wireframeData ? (
                  <div>
                    <WireframeDisplay wireframeData={wireframeData} isDarkMode={isDarkMode} />

                    {currentStep === 'wireframe' && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '30px'
                      }}>
                        <FigmaExportButton
                          designData={getCurrentDesignData()}
                          isDarkMode={isDarkMode}
                          size="small"
                          currentStep="wireframe"
                          placement="corner"
                        />

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
                    )}
                  </div>
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
                      <FigmaExportButton
                        designData={getCurrentDesignData()}
                        isDarkMode={isDarkMode}
                        size="small"
                        currentStep="wireframe"
                        placement="corner"
                      />

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {wireframeError && (
                          <Button
                            type="default"
                            size="large"
                            icon={<ReloadOutlined />}
                            onClick={handleGenerateWireframe}
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