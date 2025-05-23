import React, { useContext } from "react";
import { Typography, Card, Row, Col, Button } from "antd";
import { FileTextOutlined, TeamOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const { theme, getColor } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const features = [
    {
      title: "Document Management",
      icon: <FileTextOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Easily organize, store, and access your documents in one centralized location.",
    },
    {
      title: "User Profiles",
      icon: <UserOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Customize your profile and manage your account settings with ease.",
    },
    {
      title: "Team Collaboration",
      icon: <TeamOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Work together seamlessly with your team members on shared documents.",
    },
    {
      title: "Admin Controls",
      icon: <SettingOutlined style={{ fontSize: "36px", color: isDarkMode ? "#1890ff" : "#092e5d" }} />,
      description: "Powerful administrative tools to manage users and system settings.",
    },
  ];

  return (
    <div style={{ padding: "40px 20px", background: getColor('level01') }}>
      {/* Hero section */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: isDarkMode ? "#001529" : "#092e5d",
          color: "white",
          borderRadius: "8px",
          marginBottom: "40px",
        }}
      >
        <Title level={1} style={{ color: "white", marginBottom: "16px" }}>
          Welcome to DesignGen
        </Title>
        <Paragraph style={{ fontSize: "18px", maxWidth: "800px", margin: "0 auto 24px", color: "white" }}>
          Your comprehensive Design Generation solution. Store, organize, and collaborate on documents with ease.
        </Paragraph>
        
        {!user ? (
          <div>
            <Link to="/login">
              <Button type="primary" size="large" style={{ marginRight: "16px" }}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="large" ghost>
                Register
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <Link to="/profile">
              <Button type="primary" size="large" style={{ marginRight: "16px" }}>
                View Profile
              </Button>
            </Link>
            <Link to="/documents">
              <Button size="large" ghost>
                My Designs
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Features section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Title level={2} style={{ 
          textAlign: "center", 
          marginBottom: "40px",
          color: isDarkMode ? "white" : "inherit"
        }}>
          Key Features
        </Title>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                style={{ 
                  height: "100%", 
                  textAlign: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  background: getColor('level02')
                }}
                hoverable
              >
                <div style={{ marginBottom: "20px" }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ color: isDarkMode ? "white" : "inherit" }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div 
        style={{ 
          maxWidth: "800px", 
          margin: "60px auto 0", 
          textAlign: "center",
          background: getColor('level03'),
          padding: "40px 20px",
          borderRadius: "8px"
        }}
      >
        <Title level={3} style={{ color: isDarkMode ? "white" : "inherit" }}>
          Ready to get started?
        </Title>
        <Paragraph style={{ 
          marginBottom: "20px",
          color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "inherit"
        }}>
          Join thousands of users who trust AppName for their UI Design Generation needs.
        </Paragraph>
        
        {!user ? (
          <Link to="/register">
            <Button type="primary" size="large" style={{ background: isDarkMode ? "#1890ff" : "#092e5d" }}>
              Sign Up Now
            </Button>
          </Link>
        ) : (
          <Link to="/documents">
            <Button type="primary" size="large" style={{ background: isDarkMode ? "#1890ff" : "#092e5d" }}>
              Generate UI
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HomePage;