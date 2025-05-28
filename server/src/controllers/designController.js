import dotenv from "dotenv";
import db from "../utils/prisma.js";
import axios from "axios";
import { makeGroqRequest } from './codeDesignController.js';


dotenv.config();

export const processDescription = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const prompt = `
You are a helpful assistant for a design generator app.
Given the following user description, generate 4-5 clarifying questions to better understand the design requirements.
For each question, provide 3-5 multiple-choice options.
Return your response as a JSON array in the following format:
[
  {
    "question": "What type of design do you want?",
    "options": ["Website", "Mobile App", "Logo", "Poster"]
  },
  ...
]
User description: "${description}"
`;

    console.log("=============== HITTING AI FOR CONTEXT ===============")
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1:latest",
        prompt,
        stream: false
      }
    );
    console.log("===============AI GENERATED QUESTIONS===============")
    let questions = [];
    try {
      const match = ollamaResponse.data.response.match(/\[.*\]/s);
      if (match) {
        questions = JSON.parse(match[0]);
      } else {
        throw new Error("Could not extract questions JSON from AI response.");
      }
    } catch (err) {
      return res.status(500).json({ error: "Failed to parse AI-generated questions." });
    }

    res.status(200).json({
      success: true,
      message: "Description processed successfully",
      questions
    });

  } catch (error) {
    console.log("Error processing description:", error);
    res.status(500).json({ error: "Failed to process description", success: false, });
  }
};

export const saveAnswers = async (req, res) => {
  try {
    const { designId, answers } = req.body;

    if (!designId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Design ID and answers array are required" });
    }

    // databse saving can be done here!
    res.status(200).json({
      message: "Answers saved successfully",
      success: true,
    });

  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ error: "Failed to save answers", success: false });
  }
};

export const constructBetterDescription = async (req, res) => {
  try {
    const { description, answers } = req.body;

    if (!description || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Description and answers array are required" });
    }

    const prompt = `
You are a helpful assistant for a design generator app.
Given the following user description and their answers to clarifying questions, construct a more complete and well-structured design description.

User description: "${description}"

Answers to clarifying questions:
${answers.map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`).join('\n')}

Return only the improved description as a string.
`;

    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1:latest",
        prompt,
        stream: false
      }
    );

    const improvedDescription = ollamaResponse.data.response.trim();

    res.status(200).json({
      message: "Constructed better description successfully",
      success: true,
      improvedDescription
    });

  } catch (error) {
    console.error("Error constructing better description:", error);
    res.status(500).json({ error: "Failed to construct better description", success: false });
  }
};

const generateUserFlowsLLMPrompt = (description) => {
  return `
You are a specialized AI tasked with converting user requirements into a detailed mobile app workflow diagram. 
The user has provided the following design description and preferences:

DESIGN DESCRIPTION and USER PREFERENCES:
${description}

YOUR TASK:
Generate a detailed workflow for a mobile application based on the above requirements.

RESPONSE FORMAT:
Respond ONLY with a valid JSON array of workflow screens. Each screen should be represented as a JSON object with the following structure:

[
  {
    "id": "unique-identifier",
    "title": "Screen Title",
    "description": "A detailed description of this screen's purpose and functionality (40-60 words)",
    "position": 1,
    "isStartPoint": true/false,
    "nextScreens": ["id of screen(s) that follow this one (must match 'id' field of other screens)"],
    "previousScreens": ["id-of-previous-screen-1"]
  },
  ...
]

IMPORTANT GUIDELINES:
1. Create between 5-9 screens that form a logical user journey
2. First screen should have isStartPoint: true
3. The title should be short (1-3 words)
4. The description should clearly explain what the screen does
5. Connections between screens should make logical sense
6. Ensure the workflow represents a complete journey from start to completion
7. Your response must be a parseable JSON array
8. The workflow should begin with a dashboard/home screen and follow standard mobile app patterns

EXAMPLES OF GOOD SCREEN TITLES:
- Dashboard
- Login
- Product Selection
- Payment
- Confirmation
- Profile
- Settings
- Summary
- Review

Output the JSON array only, with no additional text before or after it.
`;
};

export const generatePages = async (req, res) => {
  try {
    const { description } = req.body;

    // Generate the prompt for the LLM
    const prompt = generateUserFlowsLLMPrompt(description);

    // Call the LLM API
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1:latest",
        prompt: prompt,
        stream: false
      }
    );

    let workflowData;
    try {
      // Extract JSON from the response
      const jsonText = response.data.response;
      workflowData = JSON.parse(jsonText);

      // Validate the workflow data
      if (!Array.isArray(workflowData) || workflowData.length === 0) {
        throw new Error('Invalid workflow format');
      }

      // Return the workflow data to the client
      res.json({
        success: true,
        data: {
          workflow: workflowData
        }
      });
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      res.status(500).json({
        success: false,
        error: 'Failed to parse workflow data'
      });
    }
  } catch (error) {
    console.error('Error generating pages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate workflow'
    });
  }
};

const extractJsonFromText = (text) => {
  // Look for content between triple backticks
  const jsonMatch1 = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch1) {
    return jsonMatch1[1].trim();
  }

  // Look for content between curly braces (find the largest valid JSON object)
  const jsonMatch2 = text.match(/({[\s\S]*})/);
  if (jsonMatch2) {
    return jsonMatch2[1].trim();
  }
  return text.trim();
};

const VALID_COMPONENT_TYPES = [
  'Header', 'Button', 'Input', 'List', 'Card', 'Carousel', 'Steps',
  'Divider', 'Fab', 'Image', 'Text', 'SearchBar', 'Filter', 'Modal',
  'Tabs', 'Avatar', 'Badge', 'Progress', 'Alert', 'Drawer', 'Menu'
];

const VALID_NAV_TYPES = ['tabs', 'drawer', 'stack'];

const VALID_ICONS = [
  'home', 'user', 'calendar', 'history', 'search', 'plus', 'menu',
  'heart', 'star', 'bell', 'settings', 'bookmark', 'share', 'edit',
  'delete', 'check', 'close', 'arrow-left', 'arrow-right', 'camera'
];

const DEFAULT_THEME = {
  primary: "#1890ff",
  secondary: "#52c41a",
  background: "#f5f5f5",
  text: "#262626",
  error: "#ff4d4f",
  success: "#52c41a",
  warning: "#faad14",
  border: "#d9d9d9",
  surface: "#ffffff",
  accent: "#722ed1"
};

const COMPONENT_SCHEMAS = {
  Header: {
    dataProperties: {
      required: ['title'],
      optional: ['subtitle', 'description', 'actions'],
      defaults: { subtitle: '', description: '' }
    },
    designProperties: {
      optional: ['backgroundColor', 'textColor', 'height', 'alignment', 'hasBack', 'hasMenu', 'elevation'],
      defaults: { 
        backgroundColor: '#ffffff', 
        textColor: '#262626', 
        height: 56, 
        alignment: 'center',
        hasBack: false, 
        hasMenu: false,
        elevation: 0
      }
    }
  },
  Button: {
    dataProperties: {
      required: ['text'],
      optional: ['icon', 'action', 'screen', 'url'],
      defaults: { icon: null, action: 'navigate' }
    },
    designProperties: {
      optional: ['variant', 'size', 'backgroundColor', 'textColor', 'borderColor', 'borderRadius', 'full', 'disabled'],
      defaults: { 
        variant: 'solid', 
        size: 'medium', 
        backgroundColor: '#1890ff', 
        textColor: '#ffffff',
        borderRadius: 4,
        full: false, 
        disabled: false 
      }
    }
  },
  Input: {
    dataProperties: {
      required: ['placeholder'],
      optional: ['label', 'value', 'validation', 'helperText'],
      defaults: { value: '', helperText: '' }
    },
    designProperties: {
      optional: ['type', 'backgroundColor', 'textColor', 'borderColor', 'borderRadius', 'height', 'required'],
      defaults: { 
        type: 'text', 
        backgroundColor: '#ffffff', 
        textColor: '#262626',
        borderColor: '#d9d9d9',
        borderRadius: 4,
        height: 40,
        required: false 
      }
    }
  },
  Card: {
    dataProperties: {
      required: [],
      optional: ['title', 'subtitle', 'description', 'image', 'cta', 'data'],
      defaults: { title: '', subtitle: '', description: '' }
    },
    designProperties: {
      optional: ['backgroundColor', 'borderColor', 'borderRadius', 'elevation', 'padding', 'margin', 'bordered', 'hoverable'],
      defaults: { 
        backgroundColor: '#ffffff',
        borderColor: '#d9d9d9',
        borderRadius: 8,
        elevation: 1,
        padding: 16,
        margin: 8,
        bordered: true, 
        hoverable: false 
      }
    }
  },
  List: {
    dataProperties: {
      required: [],
      optional: ['items', 'emptyText', 'searchPlaceholder', 'maxItems'],
      defaults: { items: [], emptyText: 'No items found', maxItems: null }
    },
    designProperties: {
      optional: ['backgroundColor', 'itemHeight', 'dividerColor', 'selectable', 'searchable', 'showMore', 'pagination'],
      defaults: { 
        backgroundColor: '#ffffff',
        itemHeight: 48,
        dividerColor: '#f0f0f0',
        selectable: false, 
        searchable: false, 
        showMore: false,
        pagination: false
      }
    }
  },
  Image: {
    dataProperties: {
      required: ['src'],
      optional: ['alt', 'caption'],
      defaults: { alt: '', caption: '' }
    },
    designProperties: {
      optional: ['width', 'height', 'borderRadius', 'aspectRatio', 'objectFit'],
      defaults: { 
        width: '100%', 
        height: 200, 
        borderRadius: 0,
        aspectRatio: '16:9',
        objectFit: 'cover'
      }
    }
  },
  Text: {
    dataProperties: {
      required: ['content'],
      optional: ['type'],
      defaults: { type: 'body' }
    },
    designProperties: {
      optional: ['fontSize', 'fontWeight', 'color', 'alignment', 'lineHeight', 'margin'],
      defaults: { 
        fontSize: 14, 
        fontWeight: 'normal', 
        color: '#262626',
        alignment: 'left',
        lineHeight: 1.5,
        margin: 0
      }
    }
  }
};

export const validateWireframe = (wireframeJson) => {
  const errors = [];
  const warnings = [];

  try {
    if (!wireframeJson || typeof wireframeJson !== 'object') {
      errors.push('Invalid wireframe JSON structure');
      return { isValid: false, errors, warnings };
    }

    // Validate app section
    if (!wireframeJson.app) {
      errors.push('Missing required "app" section');
    } else {
      if (!wireframeJson.app.name || typeof wireframeJson.app.name !== 'string') {
        errors.push('App name is required and must be a string');
      }

      if (!wireframeJson.app.nav) {
        errors.push('Navigation is required');
      } else if (!VALID_NAV_TYPES.includes(wireframeJson.app.nav.type)) {
        errors.push(`Invalid navigation type: ${wireframeJson.app.nav.type}`);
      }
    }

    // Validate screens
    if (!Array.isArray(wireframeJson.screens) || wireframeJson.screens.length === 0) {
      errors.push('At least one screen is required');
    } else {
      const screenNames = wireframeJson.screens.map(s => s.name).filter(Boolean);

      // Check for duplicate screen names
      const uniqueNames = [...new Set(screenNames)];
      if (screenNames.length !== uniqueNames.length) {
        errors.push('Screen names must be unique');
      }

      // Validate each screen
      wireframeJson.screens.forEach((screen, index) => {
        if (!screen.name) {
          errors.push(`Screen ${index} missing name`);
        }
        if (!Array.isArray(screen.components)) {
          errors.push(`Screen "${screen.name || index}" missing components array`);
        } else {
          // Validate components with new structure
          screen.components.forEach((component, compIndex) => {
            if (!component.type) {
              errors.push(`Component ${compIndex} in screen "${screen.name}" missing type`);
            } else if (!VALID_COMPONENT_TYPES.includes(component.type)) {
              errors.push(`Invalid component type "${component.type}" in screen "${screen.name}"`);
            }

            // Validate component structure
            if (!component.dataProperties && !component.designProperties) {
              warnings.push(`Component ${compIndex} in screen "${screen.name}" missing both data and design properties`);
            }

            // Check screen references in data properties
            if (component.dataProperties?.screen && !screenNames.includes(component.dataProperties.screen)) {
              errors.push(`Component in "${screen.name}" references non-existent screen "${component.dataProperties.screen}"`);
            }
          });
        }
      });

      // Validate navigation references
      if (wireframeJson.app?.nav?.items) {
        wireframeJson.app.nav.items.forEach(item => {
          if (!screenNames.includes(item.screen)) {
            errors.push(`Navigation item "${item.name}" references non-existent screen "${item.screen}"`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`],
      warnings
    };
  }
};

export const generateWireframeJson = async (improvedDescription, workflow, startScreen = null) => {
  console.log("StartScreen: ", startScreen?.description)
  const prompt = `
ROLE: You are a specialized UI wireframe generator for mobile apps using Ant Design components.

OBJECTIVE: Generate a robust, validated JSON structure for a mobile app wireframe with separated data and design properties.
${startScreen ? `\nSPECIFIC TASK: Generate ONLY the first screen based on the provided workflow start point.` : ''}

CRITICAL REQUIREMENTS:
1. Use ONLY these component types: ${VALID_COMPONENT_TYPES.join(', ')}
2. Use ONLY these navigation types: ${VALID_NAV_TYPES.join(', ')}
3. Use ONLY these icons: ${VALID_ICONS.join(', ')}
4. All screen references must be valid
5. Separate dataProperties and designProperties for each component
6. Follow kebab-case for screen names, camelCase for properties

${startScreen ? `7. Generate ONLY ONE screen: "${startScreen.id}" with title "${startScreen.title}"` : ''}

${startScreen ? `
SCREEN TO GENERATE:
- Screen ID: ${startScreen.id}
- Screen Title: ${startScreen.title}
- Screen Description: ${startScreen.description}
- Position in Flow: ${startScreen.position}
- Next Screens: ${startScreen.nextScreens?.join(', ') || 'None'}

Create components that match this screen's purpose and description.
` : ''}

REQUIRED JSON STRUCTURE:
\`\`\`json
{
  "app": {
    "name": "App Name",
    "description": "App description",
    "theme": {
      "primary": "#1890ff",
      "secondary": "#52c41a",
      "background": "#f5f5f5",
      "text": "#262626",
      "error": "#ff4d4f",
      "success": "#52c41a",
      "warning": "#faad14",
      "border": "#d9d9d9",
      "surface": "#ffffff",
      "accent": "#722ed1"
    },
    "nav": {
      "type": "tabs",
      "items": [
        { "name": "Home", "icon": "home", "screen": "${startScreen?.id || 'home'}" }
      ]
    }
  },
  "screens": [
    {
      "name": "${startScreen?.id || 'home'}",
      "title": "${startScreen?.title || 'Home Screen'}",
      "description": "${startScreen?.description || 'Main screen of the app'}",
      "workflowPosition": ${startScreen?.position || 1},
      "isStartPoint": ${startScreen?.isStartPoint || true},
      "nextScreens": ${JSON.stringify(startScreen?.nextScreens || [])},
      "components": [
        {
          "id": "header-1",
          "type": "Header",
          "dataProperties": {
            "title": "${startScreen?.title || 'Welcome'}",
            "subtitle": "Get started",
            "description": "${startScreen?.description || 'Welcome to our app'}"
          },
          "designProperties": {
            "backgroundColor": "#1890ff",
            "textColor": "#ffffff",
            "height": 60,
            "alignment": "center",
            "hasBack": false,
            "hasMenu": true,
            "elevation": 2
          }
        }
      ]
    }
  ],
  "data": {
    "globalData": {
      "user": {
        "name": "User",
        "avatar": "https://example.com/avatar.jpg"
      }
    },
    "screenData": {
      "${startScreen?.id || 'home'}": {
        "screenInfo": {
          "id": "${startScreen?.id || 'home'}",
          "title": "${startScreen?.title || 'Home'}",
          "description": "${startScreen?.description || 'Main screen'}"
        }
      }
    }
  },
  "workflow": {
    "currentScreen": "${startScreen?.id || 'home'}",
    "totalScreens": ${workflow?.length || 1},
    "nextScreens": ${JSON.stringify(startScreen?.nextScreens || [])},
    "isComplete": false
  },
  "metadata": {
    "version": "2.0",
    "generatedAt": "2025-01-01T00:00:00Z",
    "description": "Generated wireframe for first screen",
    "workflowBased": ${!!startScreen}
  }
}
\`\`\`

COMPONENT STRUCTURE RULES:
- Each component MUST have: id, type, dataProperties, designProperties
- dataProperties: Contains all content, text, actions, navigation references
- designProperties: Contains all styling, colors, dimensions, layout properties
- Use meaningful IDs for components (e.g., "header-1", "card-featured", "list-products")

VALIDATION RULES:
- All navigation screen references must exist in screens array
- All component screen references must be valid
- Required component properties cannot be missing
- Screen names must be unique and use kebab-case
- Theme colors must be valid hex codes
- Icons must be from the approved list
- Each component must have both dataProperties and designProperties objects

DESCRIPTION: ${improvedDescription}

${startScreen ? 
`Focus on creating components that are appropriate for the "${startScreen.title}" screen with the following purpose: ${startScreen.description}

Create 4-6 relevant components for this screen that match its purpose and description.` :
`Generate a complete mobile app wireframe with one screen and multiple components per screen.`
}

Return ONLY the JSON structure. Ensure all validations pass.
`;

  console.log("\n=============== GENERATING WIREFRAME JSON WITH GROQ ===============");

  try {
    // Use Groq API instead of Ollama
    const response = await makeGroqRequest(prompt);

    if (!response) {
      throw new Error('Empty response from Groq API');
    }

    const rawText = response;

    // Extract JSON from the response
    const jsonText = extractJsonFromText(rawText);
    
    console.log("Generated JSON Preview:");
    console.log(jsonText.substring(0, 500) + "...");

    // Commented out Ollama endpoint
    // const response = await axios.post(
    //   "http://localhost:11434/api/generate",
    //   {
    //     model: "llama3.1:latest",
    //     prompt: prompt,
    //     stream: false,
    //     options: {
    //       temperature: 0.2,
    //       top_p: 0.9,
    //       num_predict: 4000
    //     }
    //   },
    // );

    // if (response.status !== 200) {
    //   throw new Error(`Error from Ollama API: ${response.statusText}`);
    // }

    // const result = response.data;
    // if (!result.response) {
    //   throw new Error('Empty response from Ollama API');
    // }

    // const rawText = result.response;
    // const jsonText = extractJsonFromText(rawText);

    try {
      const wireframeJson = JSON.parse(jsonText);
      
      // Add component IDs if missing
      wireframeJson.screens?.forEach(screen => {
        screen.components?.forEach((component, index) => {
          if (!component.id) {
            component.id = `${component.type.toLowerCase()}-${index + 1}`;
          }
        });
      });

      // Add metadata if missing
      if (!wireframeJson.metadata) {
        wireframeJson.metadata = {
          version: "2.0",
          generatedAt: new Date().toISOString(),
          description: improvedDescription.length > 100
            ? improvedDescription.substring(0, 100) + "..."
            : improvedDescription,
          provider: "groq"
        };
      }

      // Validate the generated wireframe
      const validation = validateWireframe(wireframeJson);
      if (!validation.isValid) {
        console.warn("Generated wireframe has validation issues:", validation.errors);
        console.warn("Warnings:", validation.warnings);
      } else {
        console.log("✅ Wireframe JSON validated successfully");
      }

      return wireframeJson;

    } catch (parseError) {
      console.log(`Failed to parse JSON. Attempting to fix...`);
      
      // Enhanced JSON fixing
      let fixedJson = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
        .replace(/'/g, '"')
        .replace(/\n|\r/g, '')
        .trim();

      try {
        const wireframeJson = JSON.parse(fixedJson);
        console.log("✅ Successfully fixed and parsed JSON");
        
        // Add missing properties for fixed JSON
        if (!wireframeJson.metadata) {
          wireframeJson.metadata = {
            version: "2.0",
            generatedAt: new Date().toISOString(),
            description: improvedDescription,
            fixed: true
          };
        }

        return wireframeJson;
      } catch (fixError) {
        throw new Error("Failed to generate valid wireframe JSON after fix attempts");
      }
    }

  } catch (error) {
    console.error("Error generating wireframe JSON:", error.message);
    throw error;
  }
};

export { COMPONENT_SCHEMAS, DEFAULT_THEME, VALID_COMPONENT_TYPES, VALID_ICONS };

export const generateWireframe = async (req, res) => {
  try {
    const { description, workflow, screenIndex } = req.body;
    console.log("SCREEN INDEX: ", screenIndex)

    const improvedDescription = description;
    // console.log("Workflow: ", workflow[0])
    const wireframeJson = await generateWireframeJson(improvedDescription, workflow, workflow[screenIndex]);

    console.log("wireframeJsonL ",wireframeJson)

    // Final validation before sending response
    const validation = validateWireframe(wireframeJson);

    if (!validation.isValid) {
      console.warn("⚠️ Generated wireframe has validation issues:", validation.errors);

      // You can choose to either:
      // 1. Return the wireframe with warnings
      return res.status(200).json({
        success: true,
        message: "Wireframe generated with validation warnings",
        wireframe: wireframeJson,
        validation: {
          isValid: false,
          errors: validation.errors,
          warnings: validation.warnings
        },
        timestamp: new Date().toISOString()
      });

      // 2. Or reject if validation fails (uncomment below)
      // return res.status(422).json({
      //   success: false,
      //   error: "Generated wireframe failed validation",
      //   code: "VALIDATION_FAILED",
      //   details: validation.errors,
      //   timestamp: new Date().toISOString()
      // });
    }

    console.log("✅ Wireframe generated and validated successfully");

    return res.status(200).json({
      success: true,
      message: "Wireframe generated successfully",
      wireframe: wireframeJson,
      validation: {
        isValid: true,
        warnings: validation.warnings
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        inputLength: improvedDescription.length,
        screenCount: wireframeJson.screens?.length || 0,
        componentCount: wireframeJson.screens?.reduce((total, screen) =>
          total + (screen.components?.length || 0), 0) || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Wireframe generation failed:", error.message);
    console.error("Stack trace:", error.stack);

    let errorCode = "GENERATION_FAILED";
    let statusCode = 500;
    let userMessage = "An unexpected error occurred while generating the wireframe";

    // Enhanced error classification
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      errorCode = "TIMEOUT";
      statusCode = 408;
      userMessage = "Request timed out. Please try again.";
    } else if (error.message.includes('validation')) {
      errorCode = "VALIDATION_FAILED";
      statusCode = 422;
      userMessage = "The generated wireframe failed validation checks";
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      errorCode = "INVALID_JSON";
      statusCode = 422;
      userMessage = "Failed to generate valid JSON structure";
    } else if (error.message.includes('API') || error.message.includes('Ollama')) {
      errorCode = "API_ERROR";
      statusCode = 502;
      userMessage = "External API service is unavailable";
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      errorCode = "CONNECTION_ERROR";
      statusCode = 503;
      userMessage = "Unable to connect to the AI service";
    } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
      errorCode = "RATE_LIMITED";
      statusCode = 429;
      userMessage = "Rate limit exceeded. Please try again later.";
    }

    return res.status(statusCode).json({
      success: false,
      error: userMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || generateRequestId()
    });
  }
};

// Helper function to generate request ID for tracking
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

// Optional: Add request logging middleware
export const logWireframeRequest = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  req.requestId = requestId;

  console.log(`📝 [${requestId}] Wireframe generation request:`, {
    descriptionLength: req.body?.improvedDescription?.length || 0,
    hasWorkflow: !!req.body?.workflow,
    timestamp: new Date().toISOString()
  });

  next();
};

// Input validation middleware (alternative approach)
export const validateWireframeInput = (req, res, next) => {
  const { improvedDescription, workflow } = req.body;

  const errors = [];

  if (!improvedDescription) {
    errors.push("improvedDescription is required");
  } else if (typeof improvedDescription !== 'string') {
    errors.push("improvedDescription must be a string");
  } else if (improvedDescription.trim().length < 10) {
    errors.push("improvedDescription must be at least 10 characters long");
  } else if (improvedDescription.length > 5000) {
    errors.push("improvedDescription must be less than 5000 characters");
  }

  if (workflow && typeof workflow !== 'string') {
    errors.push("workflow must be a string if provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid input parameters",
      code: "INVALID_INPUT",
      details: errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
};