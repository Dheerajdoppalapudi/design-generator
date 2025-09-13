import React, { useContext } from "react";
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Switch } from "antd";
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  FileTextOutlined, 
  TeamOutlined,
  BulbOutlined,
  BulbFilled,
  DeploymentUnitOutlined
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDarkMode = theme === 'dark';

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      {user && user.role === "admin" && (
        <Menu.Item key="admin" icon={<TeamOutlined />}>
          <Link to="/admin">Admin Dashboard</Link>
        </Menu.Item>
      )}
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: isDarkMode ? "#001529" : "#092e5d",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        position: "fixed",
        width: "100%",
        zIndex: 2
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Title
          level={3}
          style={{
            color: "white",
            margin: 0,
            marginRight: "20px",
          }}
        >
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            <span style={{ fontWeight: 300 }}>App</span><span style={{ fontWeight: 600 }}>Name</span>
          </Link>
        </Title>

        <Menu
          theme={isDarkMode ? "dark" : "dark"}
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ 
            background: "transparent", 
            borderBottom: "none" 
          }}
        >
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="/documents" icon={<FileTextOutlined />}>
            <Link to="/documents">Documents</Link>
          </Menu.Item>
          <Menu.Item key="/maindev" icon={<DeploymentUnitOutlined />}>
            <Link to="/maindev">MainDev</Link>
          </Menu.Item>
        </Menu>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Theme Toggle Switch */}
        <div style={{ marginRight: "16px", display: "flex", alignItems: "center" }}>
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            checkedChildren={<BulbFilled style={{ color: "#f8e71c" }} />}
            unCheckedChildren={<BulbOutlined style={{ color: "#f8e71c" }} />}
          />
        </div>

        {user ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Button
              type="text"
              icon={
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: isDarkMode ? "#177ddc" : "#1890ff",
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)'
                  }} 
                />
              }
              style={{ color: "white" }}
            >
              <span style={{ 
                marginLeft: "8px",
                color: 'white', 
                fontSize: '14px',
                fontWeight: 500
              }}>
                {user.username}
              </span>
            </Button>
          </Dropdown>
        ) : (
          <div>
            <Button
              type="link"
              style={{ color: "white", marginRight: "10px" }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
            <Button
              type="primary"
              ghost
              onClick={() => navigate("/register")}
              style={{
                borderColor: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)'
              }}
            >
              Register
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar;