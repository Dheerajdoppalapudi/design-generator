import React, { useContext, useState, useRef } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { Typography, Button, Input, Upload, message, Card, Progress, Spin } from 'antd';
import { 
    FileTextOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    SendOutlined,
    InboxOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const RequirementAnalysis = ({ isActive, isRunning, onComplete, onNext, onPrevious }) => {
    const { theme } = useContext(ThemeContext);
    const { user } = useContext(AuthContext);
    const isDarkMode = theme === 'dark';
    
    const [requirements, setRequirements] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [processedData, setProcessedData] = useState(null);

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return <FilePdfOutlined style={{ color: '#ef4444' }} />;
        if (fileType.includes('word') || fileType.includes('document')) return <FileWordOutlined style={{ color: '#2563eb' }} />;
        return <FileTextOutlined style={{ color: '#10b981' }} />;
    };

    const handleFileUpload = (info) => {
        const { file } = info;
        
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            message.error('Only TXT, PDF, DOC, and DOCX files are allowed');
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            message.error('File size must be less than 10MB');
            return false;
        }

        const newFile = {
            uid: file.uid,
            name: file.name,
            type: file.type,
            size: file.size,
            file: file
        };

        setUploadedFiles(prev => [...prev, newFile]);
        message.success(`${file.name} uploaded successfully`);
        return false; // Prevent automatic upload
    };

    const handleRemoveFile = (fileUid) => {
        setUploadedFiles(prev => prev.filter(file => file.uid !== fileUid));
        message.info('File removed');
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmitRequirements = async () => {
        if (!requirements.trim() && uploadedFiles.length === 0) {
            message.error('Please provide requirements text or upload files');
            return;
        }

        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append('description', requirements);
            
            // Add files to form data
            uploadedFiles.forEach(fileData => {
                formData.append('files', fileData.file);
            });

            const response = await axios.post('/api/sdgen/requirementProcess', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${user?.token}`
                },
                timeout: 30000 // 30 second timeout
            });

            if (response.data.success) {
                setQuestions(response.data.questions || []);
                setProcessedData(response.data);
                
                const { data } = response.data;
                let successMessage = 'Requirements processed successfully!';
                
                if (data?.filesProcessed > 0) {
                    successMessage += ` ${data.filesProcessed} file(s) processed.`;
                }
                
                if (data?.filesFailed > 0) {
                    message.warning(`${data.filesFailed} file(s) could not be processed. Check the details below.`);
                }
                
                message.success(successMessage);
                
                // Call onComplete if provided to notify parent component
                if (onComplete) {
                    onComplete(response.data);
                }
            } else {
                throw new Error(response.data.error || 'Processing failed');
            }

        } catch (error) {
            console.error('Error processing requirements:', error);
            
            let errorMessage = 'Failed to process requirements';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please try again with fewer or smaller files.';
            } else if (error.response?.status === 413) {
                errorMessage = 'Files too large. Please reduce file sizes and try again.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            message.error(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div>
            {/* Requirements Input */}
            <div style={{ marginBottom: 16 }}>
                <Text style={{
                    color: isDarkMode ? '#d1d5db' : '#374151',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: 8
                }}>
                    Describe your project requirements
                </Text>
                <TextArea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Enter your project requirements, goals, features, constraints, and any specific details..."
                    autoSize={{ minRows: 6, maxRows: 12 }}
                    style={{
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                        borderColor: isDarkMode ? '#374151' : '#d1d5db',
                        color: isDarkMode ? '#fff' : '#1a1a1a'
                    }}
                />
            </div>

            {/* File Upload */}
            <div style={{ marginBottom: 20 }}>
                <Text style={{
                    color: isDarkMode ? '#d1d5db' : '#374151',
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: 12
                }}>
                    Upload Supporting Documents
                </Text>
                
                <Dragger
                    name="files"
                    multiple
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                    accept=".txt,.doc,.docx"
                    style={{
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#fafbfc',
                        borderColor: isDarkMode ? '#374151' : '#d1d5db',
                        borderStyle: 'dashed'
                    }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ 
                            color: isDarkMode ? '#6b7280' : '#9ca3af',
                            fontSize: 32 
                        }} />
                    </p>
                    <p style={{
                        color: isDarkMode ? '#d1d5db' : '#374151',
                        fontSize: 14,
                        fontWeight: 500,
                        margin: '8px 0 4px'
                    }}>
                        Click or drag files to upload
                    </p>
                    <p style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 12,
                        margin: 0
                    }}>
                        Supports TXT, PDF, DOC, DOCX files (max 10MB each)
                    </p>
                </Dragger>
            </div>

            {/* Uploaded Files List - Always show if files exist */}
            {uploadedFiles.length > 0 ? (
                <div style={{ 
                    marginBottom: 20,
                    backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc',
                    border: `2px solid ${isDarkMode ? '#10b981' : '#10b981'}`,
                    borderRadius: 8,
                    padding: 16
                }}>
                    <Text style={{
                        color: isDarkMode ? '#10b981' : '#059669',
                        fontSize: 14,
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: 12
                    }}>
                        Selected Files ({uploadedFiles.length})
                    </Text>
                    
                    <div>
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={file.uid}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: 6,
                                    marginBottom: index !== uploadedFiles.length - 1 ? 8 : 0
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    flex: 1
                                }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                                        borderRadius: 4
                                    }}>
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text style={{
                                            color: isDarkMode ? '#fff' : '#1f2937',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            display: 'block',
                                            lineHeight: 1.4
                                        }}>
                                            {file.name}
                                        </Text>
                                        <Text style={{
                                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                                            fontSize: 12
                                        }}>
                                            {formatFileSize(file.size)} • Ready to upload
                                        </Text>
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveFile(file.uid)}
                                    style={{ 
                                        color: '#ef4444',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        minWidth: 32,
                                        height: 32
                                    }}
                                    title="Remove file"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Submit Button */}
            <Button
                type="primary"
                size="large"
                icon={isProcessing ? <Spin size="small" /> : <SendOutlined />}
                onClick={handleSubmitRequirements}
                loading={isProcessing}
                disabled={!requirements.trim() && uploadedFiles.length === 0}
                style={{
                    width: '100%',
                    height: 44,
                    fontWeight: 500,
                    backgroundColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                    borderColor: isDarkMode ? '#2563eb' : '#1d4ed8',
                    color: '#fff'
                }}
            >
                <span style={{ color: '#fff' }}>
                    {isProcessing ? 'Processing Requirements...' : 'Process Requirements'}
                </span>
            </Button>

            {/* Generated Questions */}
            {questions.length > 0 && (
                <Card
                    title="Clarifying Questions"
                    style={{
                        backgroundColor: isDarkMode ? '#111' : '#fff',
                        borderColor: isDarkMode ? '#1f1f1f' : '#e1e5e9',
                        marginTop: 24
                    }}
                    headStyle={{
                        backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc',
                        borderBottom: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                        color: isDarkMode ? '#fff' : '#1a1a1a'
                    }}
                >
                    <Text style={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: 14,
                        display: 'block',
                        marginBottom: 20
                    }}>
                        Based on your requirements, here are some clarifying questions:
                    </Text>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {questions.map((q, index) => (
                            <div key={index} style={{
                                padding: 16,
                                backgroundColor: isDarkMode ? '#0f0f0f' : '#f8fafc',
                                border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                                borderRadius: 6
                            }}>
                                <Text style={{
                                    color: isDarkMode ? '#fff' : '#1a1a1a',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    display: 'block',
                                    marginBottom: 12
                                }}>
                                    {index + 1}. {q.question}
                                </Text>
                                
                                {q.options && (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: 8
                                    }}>
                                        {q.options.map((option, optIndex) => (
                                            <Button
                                                key={optIndex}
                                                size="small"
                                                style={{
                                                    borderColor: isDarkMode ? '#374151' : '#d1d5db',
                                                    color: isDarkMode ? '#d1d5db' : '#374151',
                                                    textAlign: 'left',
                                                    height: 'auto',
                                                    padding: '6px 12px',
                                                    whiteSpace: 'normal',
                                                    fontSize: 12
                                                }}
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Processing Results */}
                    {processedData?.data && (
                        <div style={{ marginTop: 20 }}>
                            {processedData.data.filesProcessed > 0 && (
                                <div style={{
                                    marginBottom: 16,
                                    padding: 12,
                                    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                                    border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
                                    borderRadius: 4
                                }}>
                                    <Text style={{
                                        color: '#10b981',
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>
                                        ✓ Successfully processed {processedData.data.filesProcessed} file(s)
                                    </Text>
                                </div>
                            )}

                            {processedData.data.failedFiles && processedData.data.failedFiles.length > 0 && (
                                <div style={{
                                    marginBottom: 16,
                                    padding: 12,
                                    backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                                    border: `1px solid ${isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
                                    borderRadius: 4
                                }}>
                                    <Text style={{
                                        color: '#ef4444',
                                        fontSize: 12,
                                        fontWeight: 500,
                                        display: 'block',
                                        marginBottom: 8
                                    }}>
                                        ⚠ Some files could not be processed:
                                    </Text>
                                    {processedData.data.failedFiles.map((failedFile, index) => (
                                        <Text key={index} style={{
                                            color: '#ef4444',
                                            fontSize: 11,
                                            display: 'block'
                                        }}>
                                            • {failedFile.name}: {failedFile.error}
                                        </Text>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{
                        marginTop: 24,
                        padding: 16,
                        backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                        border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`,
                        borderRadius: 6
                    }}>
                        <Text style={{
                            color: '#10b981',
                            fontSize: 13,
                            fontWeight: 500
                        }}>
                            Requirements analysis complete! You can now proceed to the next step.
                        </Text>
                    </div>
                </Card>
            )}

            {/* Processing Progress */}
            {isProcessing && (
                <div style={{
                    marginTop: 20,
                    padding: 20,
                    backgroundColor: isDarkMode ? '#111' : '#fff',
                    border: `1px solid ${isDarkMode ? '#1f1f1f' : '#e1e5e9'}`,
                    borderRadius: 6,
                    textAlign: 'center'
                }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 12 }}>
                        <Text style={{
                            color: isDarkMode ? '#d1d5db' : '#374151',
                            fontSize: 14,
                            fontWeight: 500
                        }}>
                            Analyzing requirements and generating clarifying questions...
                        </Text>
                    </div>
                    <Progress
                        percent={100}
                        status="active"
                        showInfo={false}
                        style={{ marginTop: 12 }}
                    />
                </div>
            )}
        </div>
    );
};

export default RequirementAnalysis;