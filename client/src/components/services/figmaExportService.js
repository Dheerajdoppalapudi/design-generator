// figmaExportService.js - Service for Figma export functionality

// Convert workflow and design data to Figma-compatible format
export const convertToFigmaFormat = (designData) => {
  const { workflow, wireframeData, improvedDescription, htmlFiles } = designData;
  
  // Basic Figma file structure
  const figmaData = {
    name: "Design Export - " + new Date().toLocaleDateString(),
    role: "owner",
    lastModified: new Date().toISOString(),
    version: "1.0.0",
    document: {
      id: "0:0",
      name: "Document",
      type: "DOCUMENT",
      children: []
    }
  };

  // Create pages for different design phases
  const pages = [];

  // 1. Create Workflow Page
  if (workflow && workflow.length > 0) {
    const workflowPage = createWorkflowPage(workflow);
    pages.push(workflowPage);
  }

  // 2. Create Wireframes Page
  if (wireframeData) {
    const wireframePage = createWireframePage(wireframeData);
    pages.push(wireframePage);
  }

  // 3. Create HTML Preview Page
  if (htmlFiles && htmlFiles.length > 0) {
    const htmlPreviewPage = createHtmlPreviewPage(htmlFiles);
    pages.push(htmlPreviewPage);
  }

  // 4. Create Design Brief Page
  const designBriefPage = createDesignBriefPage(improvedDescription);
  pages.push(designBriefPage);

  figmaData.document.children = pages;
  return figmaData;
};

// Create workflow page with flow diagrams
const createWorkflowPage = (workflow) => {
  const frames = [];
  let xOffset = 0;

  workflow.forEach((screen, index) => {
    const frame = {
      id: `workflow-${index}`,
      name: screen.title,
      type: "FRAME",
      x: xOffset,
      y: 100,
      width: 300,
      height: 200,
      backgroundColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
      children: [
        {
          id: `text-${index}`,
          type: "TEXT",
          x: 20,
          y: 20,
          width: 260,
          height: 40,
          characters: screen.title,
          style: {
            fontSize: 18,
            fontWeight: 600,
            textAlign: "CENTER"
          }
        },
        {
          id: `desc-${index}`,
          type: "TEXT",
          x: 20,
          y: 70,
          width: 260,
          height: 100,
          characters: screen.description,
          style: {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.4
          }
        }
      ]
    };

    frames.push(frame);
    xOffset += 350; // Space between frames
  });

  return {
    id: "workflow-page",
    name: "Workflow",
    type: "CANVAS",
    backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
    children: frames
  };
};

// Create wireframes page
const createWireframePage = (wireframeData) => {
  // This would convert wireframe data to Figma components
  // For now, we'll create placeholder frames
  return {
    id: "wireframe-page",
    name: "Wireframes",
    type: "CANVAS",
    backgroundColor: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
    children: [
      {
        id: "wireframe-frame",
        name: "Wireframe Overview",
        type: "FRAME",
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
        children: [
          {
            id: "wireframe-text",
            type: "TEXT",
            x: 50,
            y: 50,
            width: 700,
            height: 500,
            characters: JSON.stringify(wireframeData, null, 2),
            style: {
              fontSize: 12,
              fontFamily: "monospace"
            }
          }
        ]
      }
    ]
  };
};

// Create HTML preview page
const createHtmlPreviewPage = (htmlFiles) => {
  const frames = [];
  let yOffset = 100;

  htmlFiles.forEach((file, index) => {
    const frame = {
      id: `html-${index}`,
      name: file.filename,
      type: "FRAME",
      x: 100,
      y: yOffset,
      width: 400,
      height: 300,
      backgroundColor: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
      children: [
        {
          id: `html-title-${index}`,
          type: "TEXT",
          x: 20,
          y: 20,
          width: 360,
          height: 30,
          characters: file.filename,
          style: {
            fontSize: 16,
            fontWeight: 600
          }
        },
        {
          id: `html-preview-${index}`,
          type: "TEXT",
          x: 20,
          y: 60,
          width: 360,
          height: 220,
          characters: `HTML Content Preview\n\nFile: ${file.filename}\nSize: ${Math.round(file.content.length / 1024)}KB\n\nThis would show a visual representation of the HTML page in Figma.`,
          style: {
            fontSize: 12,
            lineHeight: 1.4
          }
        }
      ]
    };

    frames.push(frame);
    yOffset += 350;
  });

  return {
    id: "html-page",
    name: "HTML Pages",
    type: "CANVAS",
    backgroundColor: { r: 0.96, g: 0.96, b: 0.96, a: 1 },
    children: frames
  };
};

// Create design brief page
const createDesignBriefPage = (description) => {
  return {
    id: "brief-page",
    name: "Design Brief",
    type: "CANVAS",
    backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
    children: [
      {
        id: "brief-frame",
        name: "Design Requirements",
        type: "FRAME",
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        backgroundColor: { r: 0.99, g: 0.99, b: 0.99, a: 1 },
        children: [
          {
            id: "brief-title",
            type: "TEXT",
            x: 50,
            y: 50,
            width: 700,
            height: 40,
            characters: "Design Requirements & Brief",
            style: {
              fontSize: 24,
              fontWeight: 700,
              textAlign: "CENTER"
            }
          },
          {
            id: "brief-content",
            type: "TEXT",
            x: 50,
            y: 120,
            width: 700,
            height: 430,
            characters: description || "No design description provided.",
            style: {
              fontSize: 14,
              lineHeight: 1.6
            }
          }
        ]
      }
    ]
  };
};

// Export to Figma using Figma API or Plugin
export const exportToFigma = async (designData, figmaToken) => {
  try {
    // Convert design data to Figma format
    const figmaData = convertToFigmaFormat(designData);
    
    // Method 1: Use Figma Web API (requires Figma token)
    if (figmaToken) {
      const response = await fetch('https://api.figma.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${figmaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(figmaData)
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          figmaUrl: `https://www.figma.com/file/${result.key}`,
          message: 'Successfully exported to Figma!'
        };
      }
    }

    // Method 2: Generate Figma-compatible JSON for manual import
    const blob = new Blob([JSON.stringify(figmaData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figma-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Figma-compatible file downloaded. Import it manually to Figma.',
      downloadedFile: true
    };

  } catch (error) {
    console.error('Figma export error:', error);
    return {
      success: false,
      message: 'Failed to export to Figma. Please try again.',
      error: error.message
    };
  }
};

// Alternative: Generate Figma Plugin URL
export const generateFigmaPluginUrl = (designData) => {
  const encodedData = encodeURIComponent(JSON.stringify(designData));
  const pluginUrl = `figma://plugin/design-importer?data=${encodedData}`;
  
  return {
    pluginUrl,
    webUrl: `https://www.figma.com/community/plugin/design-importer?data=${encodedData}`
  };
};

// Generate .fig file (Figma's native format) - simplified version
export const generateFigFile = (designData) => {
  const figmaData = convertToFigmaFormat(designData);
  
  // Create a simplified .fig file structure
  const figFile = {
    version: "1.0",
    meta: {
      name: figmaData.name,
      created: new Date().toISOString(),
      generator: "Design Generator Tool"
    },
    document: figmaData.document
  };

  // Convert to downloadable file
  const blob = new Blob([JSON.stringify(figFile, null, 2)], { 
    type: 'application/figma' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `design-export-${Date.now()}.fig`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    message: 'Figma file downloaded successfully!'
  };
};