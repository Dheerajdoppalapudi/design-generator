// DocumentsPage.jsx - Main container component with HTML Pages Display and Figma Export
import React, { useContext, useState } from 'react';
import { Typography, Space, message, Spin, Button } from 'antd';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { FileTextOutlined, LoadingOutlined, AppstoreOutlined, ReloadOutlined, CodeOutlined } from '@ant-design/icons';
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

  // Static workflow data for demo purposes
  const staticWorkflowData = {
    "success": true,
    "data": {
      "workflow": [
        {
          "id": "dashboard",
          "title": "Dashboard",
          "description": "Welcome to our drone booking application. Book your agricultural drone services today.",
          "icon": "",
          "position": 1,
          "isStartPoint": true,
          "nextScreens": ["date-selection"],
          "previousScreens": []
        },
        {
          "id": "date-selection",
          "title": "Select Date",
          "description": "Choose a date for your drone service from our calendar.",
          "icon": "",
          "position": 2,
          "isStartPoint": false,
          "nextScreens": ["slot-selection"],
          "previousScreens": ["dashboard"]
        },
        {
          "id": "slot-selection",
          "title": "Select Slot",
          "description": "Choose an available slot on your selected date for drone service.",
          "icon": "",
          "position": 3,
          "isStartPoint": false,
          "nextScreens": ["payment"],
          "previousScreens": ["date-selection"]
        },
        {
          "id": "payment",
          "title": "Make Payment",
          "description": "Securely pay for your drone service using our integrated payment gateways.",
          "icon": "",
          "position": 4,
          "isStartPoint": false,
          "nextScreens": ["booking-history"],
          "previousScreens": ["slot-selection"]
        },
        {
          "id": "booking-history",
          "title": "Booking History",
          "description": "View your past drone bookings in a clear and concise table.",
          "icon": "",
          "position": 5,
          "isStartPoint": false,
          "nextScreens": [],
          "previousScreens": ["payment"]
        }
      ]
    }
  };

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
      // Static response for demo - replace with actual API call
      const response = {
        "data": {
          "message": "Description processed successfully",
          "questions": [
            {
              "question": "What type of drone application is this?",
              "options": [
                "Commercial (agricultural use)",
                "Recreational (personal use)",
                "Delivery/Aerial Photography",
                "Other (please specify)"
              ]
            },
            {
              "question": "What are the primary features that need to be showcased on the homepage?",
              "options": [
                "Latest drone models and prices",
                "Promotions and discounts",
                "User testimonials and reviews",
                "All of the above"
              ]
            },
            {
              "question": "How would you like to display the booking process?",
              "options": [
                "Step-by-step wizard (multiple screens)",
                "Single-page form with validation",
                "Slide-out or popup modal for each step"
              ]
            },
            {
              "question": "What is the primary layout for the 'Booking History' section?",
              "options": [
                "List view with details on a separate screen",
                "Grid view with brief information and drill-down to details",
                "Calendar view showing all bookings by date"
              ]
            },
            {
              "question": "Are there any specific design requirements or constraints (e.g. branding guidelines, color scheme, font styles)?",
              "options": [
                "Yes, provide the details",
                "No, let's discuss and determine together",
                "Not at this time, we'll decide later"
              ]
            }
          ]
        },
        "success": true
      };

      if (response.success) {
        setQuestions(response.data.questions || []);
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
      // Static response for demo - replace with actual API call
      const response = {
        "data": {
          "message": "Constructed better description successfully",
          "improvedDescription": "Here is the improved design description based on the user input:\n\n**Design Description**\n\nThe drone application will be designed for recreational personal use. The primary features of the app include:\n\n* **Homepage**: Displaying promotions and discounts to attract users, providing an engaging entry point into the app.\n* **Booking Process**:\n\t+ Users can select a date and slot for booking a drone.\n\t+ A single-page form with validation will be used to ensure accurate information is provided.\n\t+ The booking process will be straightforward and easy to navigate.\n* **Booking History**: A grid view layout will display brief information about each booking, including:\n\t+ Date and time of the booking\n\t+ Drone type or name\n\t+ Brief status (e.g. \"pending\", \"completed\")\n* Users can drill down into details for each booking by tapping on a specific entry in the grid view.\n* The app will allow users to easily navigate between different sections, including booking history.\n\n**Additional Requirements**\n\nNone specified, but we will discuss and determine any design requirements or constraints together (e.g. branding guidelines, color scheme, font styles)."
        },
        "success": true
      };

      if (response.success) {
        message.success('Your design requirements have been submitted!');
        setImprovedDescription(response.data.improvedDescription || 'Thank you for your submission. Our design team will review your requirements and get back to you shortly.');
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
      // Using static data for demo - replace with actual API call
      const response = staticWorkflowData;

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

      if (response.success) {
        message.success('Wireframe generated successfully!');
        setWireframeData(response.data.wireframe);
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
          siteType: "drone booking application",
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
                            style={{...buttonStyles, backgroundColor: 'transparent', color: isDarkMode ? '#fff' : '#000'}}
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
                            style={{...buttonStyles, backgroundColor: 'transparent', color: isDarkMode ? '#fff' : '#000'}}
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