// components/Canvas/EditableCanvas.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Button, message, Space, Tooltip, Card } from 'antd';
import {
  PlusOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import EditableComponent from './EditableComponent';
import ComponentEditor from './ComponentEditor';

const EditableCanvas = ({
  wireframeData,
  onWireframeUpdate,
  isDarkMode,
  isLibraryCollapsed,
  onPreview
}) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [history, setHistory] = useState([wireframeData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedComponentIndex, setDraggedComponentIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const canvasRef = useRef(null);

  // Get current screen data
  const currentScreen = wireframeData?.screens?.[0] || { components: [] };
  const screenComponents = currentScreen.components || [];

  // Handle component reordering
  const moveComponent = useCallback((fromIndex, toIndex) => {
    const newWireframeData = { ...wireframeData };
    const screen = newWireframeData.screens[0];
    const components = [...screen.components];

    // Move component from one position to another
    const [movedComponent] = components.splice(fromIndex, 1);
    components.splice(toIndex, 0, movedComponent);

    screen.components = components;

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newWireframeData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    onWireframeUpdate(newWireframeData);
    message.success('Component moved');
  }, [wireframeData, history, historyIndex, onWireframeUpdate]);

  // Handle component drag start for reordering
  const handleComponentDragStart = useCallback((e, componentIndex) => {
    setDraggedComponentIndex(componentIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', componentIndex.toString());
  }, []);

  // Handle component drag over for reordering
  const handleComponentDragOver = useCallback((e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedComponentIndex !== null && draggedComponentIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  }, [draggedComponentIndex]);

  // Handle component drop for reordering
  const handleComponentDrop = useCallback((e, targetIndex) => {
    e.preventDefault();

    if (draggedComponentIndex !== null && draggedComponentIndex !== targetIndex) {
      moveComponent(draggedComponentIndex, targetIndex);
    }

    setDraggedComponentIndex(null);
    setDragOverIndex(null);
  }, [draggedComponentIndex, moveComponent]);

  // Handle component drag end
  const handleComponentDragEnd = useCallback(() => {
    setDraggedComponentIndex(null);
    setDragOverIndex(null);
  }, []);
  const updateComponent = useCallback((componentId, updates) => {
    const newWireframeData = { ...wireframeData };
    const screen = newWireframeData.screens[0];

    const componentIndex = screen.components.findIndex(comp => comp.id === componentId);
    if (componentIndex !== -1) {
      screen.components[componentIndex] = {
        ...screen.components[componentIndex],
        ...updates
      };

      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newWireframeData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      onWireframeUpdate(newWireframeData);
      message.success('Component updated');
    }
  }, [wireframeData, history, historyIndex, onWireframeUpdate]);

  // Handle component deletion
  const deleteComponent = useCallback((componentId) => {
    const newWireframeData = { ...wireframeData };
    const screen = newWireframeData.screens[0];

    screen.components = screen.components.filter(comp => comp.id !== componentId);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newWireframeData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    onWireframeUpdate(newWireframeData);
    setSelectedComponent(null);
    message.success('Component deleted');
  }, [wireframeData, history, historyIndex, onWireframeUpdate]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const componentData = JSON.parse(e.dataTransfer.getData('application/json'));

      // Create new component with unique ID
      const newComponent = {
        ...componentData,
        id: `${componentData.type.toLowerCase()}-${Date.now()}`,
        dataProperties: { ...componentData.defaultProps.dataProperties },
        designProperties: { ...componentData.defaultProps.designProperties }
      };

      // Add component to wireframe
      const newWireframeData = { ...wireframeData };
      if (!newWireframeData.screens[0]) {
        newWireframeData.screens[0] = { components: [] };
      }

      newWireframeData.screens[0].components.push(newComponent);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newWireframeData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      onWireframeUpdate(newWireframeData);
      setSelectedComponent(newComponent.id);
      message.success(`${componentData.name} added to canvas`);

    } catch (error) {
      console.error('Error handling component drop:', error);
      message.error('Failed to add component');
    }
  }, [wireframeData, history, historyIndex, onWireframeUpdate]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onWireframeUpdate(history[newIndex]);
      setSelectedComponent(null);
      message.success('Undone');
    }
  }, [history, historyIndex, onWireframeUpdate]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onWireframeUpdate(history[newIndex]);
      setSelectedComponent(null);
      message.success('Redone');
    }
  }, [history, historyIndex, onWireframeUpdate]);

  // Handle component selection
  const handleComponentClick = useCallback((componentId, e) => {
    e.stopPropagation();
    setSelectedComponent(componentId === selectedComponent ? null : componentId);
  }, [selectedComponent]);

  // Canvas click (deselect)
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSelectedComponent(null);
    }
  }, []);

  const canvasStyle = {
    marginLeft: isLibraryCollapsed ? '60px' : '320px',
    minHeight: '100vh',
    background: isDarkMode ? '#121212' : '#f0f2f5',
    transition: 'margin-left 0.3s ease',
    position: 'relative'
  };

  const phoneCanvasStyle = {
    width: '375px',
    height: '667px',
    background: wireframeData?.app?.theme?.background || '#ffffff',
    borderRadius: '30px',
    border: '8px solid #333',
    margin: '40px auto',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  };

  const dropZoneStyle = {
    ...phoneCanvasStyle,
    border: isDragOver
      ? '8px dashed #1890ff'
      : '8px solid #333',
    background: isDragOver
      ? (isDarkMode ? 'rgba(24,144,255,0.1)' : 'rgba(24,144,255,0.05)')
      : (wireframeData?.app?.theme?.background || '#ffffff')
  };

  return (
    <div style={canvasStyle}>
      {/* Toolbar */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
      }}>
        <Space>
          <Tooltip title="Undo">
            <Button
              icon={<UndoOutlined />}
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              size="small"
              type="text"
            />
          </Tooltip>

          <Tooltip title="Redo">
            <Button
              icon={<RedoOutlined />}
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              size="small"
              type="text"
            />
          </Tooltip>

          <Tooltip title="Preview">
            <Button
              icon={<EyeOutlined />}
              onClick={onPreview}
              size="small"
              type="text"
            />
          </Tooltip>

          <Tooltip title="Save">
            <Button
              icon={<SaveOutlined />}
              onClick={() => message.success('Design saved!')}
              size="small"
              type="primary"
            />
          </Tooltip>
        </Space>
      </div>

      {/* Canvas Area */}
      <div style={{ padding: '20px', minHeight: '100vh' }} onClick={handleCanvasClick}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: isDarkMode ? '#fff' : '#000', margin: 0 }}>
            {wireframeData?.app?.name || 'Mobile App Canvas'}
          </h2>
          <p style={{ color: isDarkMode ? '#999' : '#666', margin: '8px 0' }}>
            {screenComponents.length} components • Drag from library to add more
          </p>
        </div>

        {/* Phone Canvas */}
        <div
          ref={canvasRef}
          style={dropZoneStyle}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Status Bar */}
          <div style={{
            height: '24px',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: '12px',
            color: '#fff'
          }}>
            <span>9:41</span>
            <span>•••• WiFi 100%</span>
          </div>

          {/* Content Area */}
          <div style={{
            height: 'calc(100% - 24px)',
            overflow: 'auto',
            position: 'relative'
          }}>
            {screenComponents.length === 0 && !isDragOver ? (
              // Empty state
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: isDarkMode ? '#666' : '#999',
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <h3 style={{ color: 'inherit', margin: '0 0 8px 0' }}>
                  Start Building Your App
                </h3>
                <p style={{ color: 'inherit', margin: 0 }}>
                  Drag components from the library to get started
                </p>
              </div>
            ) : isDragOver ? (
              // Drop zone indicator
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#1890ff',
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <h3 style={{ color: 'inherit', margin: '0 0 8px 0' }}>
                  Drop Component Here
                </h3>
                <p style={{ color: 'inherit', margin: 0 }}>
                  Release to add component to your app
                </p>
              </div>
            ) : (
              // Render components
              <div>
                {screenComponents.map((component, index) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleComponentDragStart(e, index)}
                    onDragOver={(e) => handleComponentDragOver(e, index)}
                    onDrop={(e) => handleComponentDrop(e, index)}
                    onDragEnd={handleComponentDragEnd}
                    style={{
                      position: 'relative',
                      border: selectedComponent === component.id
                        ? '2px solid #1890ff'
                        : hoveredComponent === component.id
                          ? '2px solid rgba(24,144,255,0.3)'
                          : dragOverIndex === index
                            ? '2px dashed #52c41a'
                            : '2px solid transparent',
                      borderRadius: '4px',
                      margin: '2px',
                      opacity: draggedComponentIndex === index ? 0.5 : 1,
                      cursor: 'grab',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={() => setHoveredComponent(component.id)}
                    onMouseLeave={() => setHoveredComponent(null)}
                  >
                    <EditableComponent
                      component={component}
                      isSelected={selectedComponent === component.id}
                      isDarkMode={isDarkMode}
                      onClick={(e) => handleComponentClick(component.id, e)}
                      onUpdate={(updates) => updateComponent(component.id, updates)}
                    />

                    {/* Component actions */}
                    {(selectedComponent === component.id || hoveredComponent === component.id) && (
                      <div style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '0',
                        background: '#1890ff',
                        borderRadius: '4px',
                        padding: '4px',
                        display: 'flex',
                        gap: '4px'
                      }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<DragOutlined />}
                          title="Drag to reorder"
                          style={{ color: '#fff', padding: '0 4px', cursor: 'grab' }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowUpOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index > 0) moveComponent(index, index - 1);
                          }}
                          disabled={index === 0}
                          title="Move up"
                          style={{ color: '#fff', padding: '0 4px' }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowDownOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (index < screenComponents.length - 1) moveComponent(index, index + 1);
                          }}
                          disabled={index === screenComponents.length - 1}
                          title="Move down"
                          style={{ color: '#fff', padding: '0 4px' }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComponent(component.id);
                          }}
                          title="Edit properties"
                          style={{ color: '#fff', padding: '0 4px' }}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteComponent(component.id);
                          }}
                          title="Delete component"
                          style={{ color: '#fff', padding: '0 4px' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default EditableCanvas;