// components/Canvas/ComponentEditor.jsx
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  ColorPicker, 
  Button, 
  Space, 
  Divider, 
  Typography, 
  Collapse,
  Row,
  Col,
  message,
  Tabs
} from 'antd';
import { 
  CloseOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  SettingOutlined,
  BgColorsOutlined,
  FontSizeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { TextArea } = Input;

const ComponentEditor = ({ 
  component, 
  onUpdate, 
  onClose, 
  isDarkMode 
}) => {
  const [form] = Form.useForm();
  const [dataForm] = Form.useForm();
  const [designForm] = Form.useForm();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize forms with component data
  useEffect(() => {
    if (component) {
      dataForm.setFieldsValue(component.dataProperties || {});
      designForm.setFieldsValue(component.designProperties || {});
      setHasUnsavedChanges(false);
    }
  }, [component, dataForm, designForm]);

  // Handle form changes
  const handleDataChange = (changedValues, allValues) => {
    setHasUnsavedChanges(true);
    // Auto-save for real-time updates
    onUpdate({
      dataProperties: allValues
    });
  };

  const handleDesignChange = (changedValues, allValues) => {
    setHasUnsavedChanges(true);
    // Auto-save for real-time updates
    onUpdate({
      designProperties: allValues
    });
  };

  // Save changes
  const handleSave = () => {
    const dataValues = dataForm.getFieldsValue();
    const designValues = designForm.getFieldsValue();
    
    onUpdate({
      dataProperties: dataValues,
      designProperties: designValues
    });
    
    setHasUnsavedChanges(false);
    message.success('Component updated successfully');
  };

  // Reset to original values
  const handleReset = () => {
    dataForm.setFieldsValue(component.dataProperties || {});
    designForm.setFieldsValue(component.designProperties || {});
    setHasUnsavedChanges(false);
    message.info('Changes reset');
  };

  if (!component) return null;

  // Component-specific field configurations
  const getDataFields = () => {
    const { type } = component;
    
    switch (type) {
      case 'Header':
        return (
          <>
            <Form.Item label="Title" name="title">
              <Input placeholder="Header title" />
            </Form.Item>
            <Form.Item label="Subtitle" name="subtitle">
              <Input placeholder="Optional subtitle" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea rows={2} placeholder="Header description" />
            </Form.Item>
          </>
        );

      case 'Button':
        return (
          <>
            <Form.Item label="Button Text" name="text" rules={[{ required: true }]}>
              <Input placeholder="Button text" />
            </Form.Item>
            <Form.Item label="Icon" name="icon">
              <Select placeholder="Select icon" allowClear>
                <Option value="home">Home</Option>
                <Option value="user">User</Option>
                <Option value="star">Star</Option>
                <Option value="search">Search</Option>
                <Option value="plus">Plus</Option>
                <Option value="heart">Heart</Option>
                <Option value="bell">Bell</Option>
                <Option value="settings">Settings</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Action" name="action">
              <Select placeholder="Button action">
                <Option value="navigate">Navigate</Option>
                <Option value="submit">Submit</Option>
                <Option value="reset">Reset</Option>
                <Option value="custom">Custom</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Target Screen" name="screen">
              <Input placeholder="Screen to navigate to" />
            </Form.Item>
          </>
        );

      case 'Card':
        return (
          <>
            <Form.Item label="Title" name="title">
              <Input placeholder="Card title" />
            </Form.Item>
            <Form.Item label="Subtitle" name="subtitle">
              <Input placeholder="Card subtitle" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <TextArea rows={3} placeholder="Card description" />
            </Form.Item>
            <Form.Item label="Call to Action" name="cta">
              <Input placeholder="CTA text" />
            </Form.Item>
            <Form.Item label="Icon" name="icon">
              <Select placeholder="Select icon" allowClear>
                <Option value="home">Home</Option>
                <Option value="user">User</Option>
                <Option value="star">Star</Option>
                <Option value="search">Search</Option>
                <Option value="plus">Plus</Option>
                <Option value="heart">Heart</Option>
                <Option value="bell">Bell</Option>
                <Option value="settings">Settings</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'Input':
        return (
          <>
            <Form.Item label="Label" name="label">
              <Input placeholder="Input label" />
            </Form.Item>
            <Form.Item label="Placeholder" name="placeholder">
              <Input placeholder="Placeholder text" />
            </Form.Item>
            <Form.Item label="Helper Text" name="helperText">
              <Input placeholder="Help text below input" />
            </Form.Item>
            <Form.Item label="Default Value" name="value">
              <Input placeholder="Default input value" />
            </Form.Item>
          </>
        );

      case 'Text':
        return (
          <>
            <Form.Item label="Content" name="content" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="Text content" />
            </Form.Item>
            <Form.Item label="Text Type" name="type">
              <Select placeholder="Text type">
                <Option value="heading">Heading</Option>
                <Option value="subheading">Subheading</Option>
                <Option value="body">Body</Option>
                <Option value="caption">Caption</Option>
              </Select>
            </Form.Item>
          </>
        );

      case 'Image':
        return (
          <>
            <Form.Item label="Image URL" name="src" rules={[{ required: true }]}>
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>
            <Form.Item label="Alt Text" name="alt">
              <Input placeholder="Image description" />
            </Form.Item>
            <Form.Item label="Caption" name="caption">
              <Input placeholder="Image caption" />
            </Form.Item>
          </>
        );

      case 'List':
        return (
          <>
            <Form.Item label="List Items" name="items">
              <Select mode="tags" placeholder="Add list items">
                <Option value="Item 1">Item 1</Option>
                <Option value="Item 2">Item 2</Option>
                <Option value="Item 3">Item 3</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Empty Text" name="emptyText">
              <Input placeholder="Text when list is empty" />
            </Form.Item>
            <Form.Item label="Max Items" name="maxItems">
              <InputNumber min={1} placeholder="Maximum items to show" />
            </Form.Item>
          </>
        );

      default:
        return (
          <Form.Item label="Properties" name="properties">
            <TextArea rows={6} placeholder="Component properties (JSON)" />
          </Form.Item>
        );
    }
  };

  const getDesignFields = () => {
    const { type } = component;
    
    const commonFields = (
      <>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Background" name="backgroundColor">
              <ColorPicker 
                showText 
                size="small"
                format="hex"
                presets={[
                  { label: 'Primary', colors: ['#1890ff', '#40a9ff', '#69c0ff'] },
                  { label: 'Success', colors: ['#52c41a', '#73d13d', '#95de64'] },
                  { label: 'Warning', colors: ['#faad14', '#ffc53d', '#ffd666'] },
                  { label: 'Error', colors: ['#ff4d4f', '#ff7875', '#ffa39e'] },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Text Color" name="textColor">
              <ColorPicker 
                showText 
                size="small"
                format="hex"
                presets={[
                  { label: 'Grays', colors: ['#000000', '#262626', '#595959', '#8c8c8c', '#bfbfbf', '#ffffff'] }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Border Radius" name="borderRadius">
              <InputNumber 
                min={0} 
                max={50} 
                addonAfter="px"
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Padding" name="padding">
              <InputNumber 
                min={0} 
                max={100} 
                addonAfter="px"
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Margin" name="margin">
              <Input placeholder="e.g., 8px 16px" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Width" name="width">
              <Input placeholder="e.g., 100%, 200px" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );

    // Type-specific design fields
    const typeSpecificFields = () => {
      switch (type) {
        case 'Header':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Height" name="height">
                    <InputNumber min={40} max={120} addonAfter="px" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Alignment" name="alignment">
                    <Select placeholder="Text alignment">
                      <Option value="left">Left</Option>
                      <Option value="center">Center</Option>
                      <Option value="right">Right</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Back Button" name="hasBack" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Menu Button" name="hasMenu" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="Elevation" name="elevation">
                <InputNumber min={0} max={10} />
              </Form.Item>
            </>
          );

        case 'Button':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Variant" name="variant">
                    <Select placeholder="Button style">
                      <Option value="solid">Solid</Option>
                      <Option value="outline">Outline</Option>
                      <Option value="text">Text</Option>
                      <Option value="ghost">Ghost</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Size" name="size">
                    <Select placeholder="Button size">
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Full Width" name="full" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Disabled" name="disabled" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Border Color" name="borderColor">
                <ColorPicker showText size="small" format="hex" />
              </Form.Item>
            </>
          );

        case 'Card':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Elevation" name="elevation">
                    <InputNumber min={0} max={10} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Border Color" name="borderColor">
                    <ColorPicker showText size="small" format="hex" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Bordered" name="bordered" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Hoverable" name="hoverable" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );

        case 'Input':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Input Type" name="type">
                    <Select placeholder="Input type">
                      <Option value="text">Text</Option>
                      <Option value="email">Email</Option>
                      <Option value="password">Password</Option>
                      <Option value="number">Number</Option>
                      <Option value="tel">Phone</Option>
                      <Option value="url">URL</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Height" name="height">
                    <InputNumber min={32} max={80} addonAfter="px" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Required" name="required" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Border Color" name="borderColor">
                    <ColorPicker showText size="small" format="hex" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );

        case 'Text':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Font Size" name="fontSize">
                    <InputNumber min={10} max={48} addonAfter="px" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Font Weight" name="fontWeight">
                    <Select placeholder="Font weight">
                      <Option value="normal">Normal</Option>
                      <Option value="500">Medium</Option>
                      <Option value="600">Semi Bold</Option>
                      <Option value="700">Bold</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Text Align" name="alignment">
                    <Select placeholder="Text alignment">
                      <Option value="left">Left</Option>
                      <Option value="center">Center</Option>
                      <Option value="right">Right</Option>
                      <Option value="justify">Justify</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Line Height" name="lineHeight">
                    <InputNumber min={1} max={3} step={0.1} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );

        case 'Image':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Width" name="width">
                    <Input placeholder="e.g., 100%, 300px" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Height" name="height">
                    <InputNumber min={50} max={500} addonAfter="px" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Object Fit" name="objectFit">
                    <Select placeholder="How image fits">
                      <Option value="cover">Cover</Option>
                      <Option value="contain">Contain</Option>
                      <Option value="fill">Fill</Option>
                      <Option value="none">None</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Aspect Ratio" name="aspectRatio">
                    <Select placeholder="Aspect ratio">
                      <Option value="1:1">1:1 (Square)</Option>
                      <Option value="4:3">4:3</Option>
                      <Option value="16:9">16:9</Option>
                      <Option value="3:2">3:2</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </>
          );

        case 'List':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Item Height" name="itemHeight">
                    <InputNumber min={32} max={100} addonAfter="px" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Divider Color" name="dividerColor">
                    <ColorPicker showText size="small" format="hex" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Selectable" name="selectable" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Searchable" name="searchable" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </>
          );

        case 'Carousel':
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Height" name="height">
                    <InputNumber min={100} max={400} addonAfter="px" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Autoplay" name="autoplay" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Show Dots" name="dots" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          );

        default:
          return null;
      }
    };

    return (
      <>
        {commonFields}
        {typeSpecificFields()}
      </>
    );
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingOutlined />
          <span>Edit {component.type}</span>
          {hasUnsavedChanges && (
            <span style={{ 
              color: '#faad14', 
              fontSize: '12px',
              fontWeight: 'normal'
            }}>
              • Unsaved changes
            </span>
          )}
        </div>
      }
      placement="right"
      width={400}
      open={true}
      onClose={onClose}
      extra={
        <Space>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
          >
            Reset
          </Button>
          <Button 
            type="primary" 
            size="small" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            Save
          </Button>
          <Button 
            size="small" 
            icon={<CloseOutlined />} 
            onClick={onClose}
          />
        </Space>
      }
      styles={{
        body: { 
          background: isDarkMode ? '#1f1f1f' : '#fafafa',
          padding: 0
        }
      }}
    >
      <div style={{ height: '100%' }}>
        <Tabs defaultActiveKey="content" size="small">
          <TabPane 
            tab={
              <span>
                <FontSizeOutlined />
                Content
              </span>
            } 
            key="content"
          >
            <div style={{ padding: '16px' }}>
              <Form
                form={dataForm}
                layout="vertical"
                onValuesChange={handleDataChange}
                size="small"
              >
                {getDataFields()}
              </Form>
            </div>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BgColorsOutlined />
                Design
              </span>
            } 
            key="design"
          >
            <div style={{ padding: '16px' }}>
              <Form
                form={designForm}
                layout="vertical"
                onValuesChange={handleDesignChange}
                size="small"
              >
                {getDesignFields()}
              </Form>
            </div>
          </TabPane>
        </Tabs>

        {/* Component Info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: isDarkMode ? '#262626' : '#f0f0f0',
          borderTop: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
        }}>
          <Text style={{ 
            fontSize: '12px', 
            color: isDarkMode ? '#999' : '#666',
            display: 'block',
            marginBottom: '4px'
          }}>
            Component ID: {component.id}
          </Text>
          <Text style={{ 
            fontSize: '12px', 
            color: isDarkMode ? '#999' : '#666'
          }}>
            Type: {component.type}
          </Text>
        </div>
      </div>
    </Drawer>
  );
};

export default ComponentEditor;