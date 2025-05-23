import dotenv from "dotenv";
import db from "../utils/prisma.js";
import axios from "axios";

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

    // Call Ollama API
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
      message: "Description processed successfully",
      questions
    });

  } catch (error) {
    console.log("Error processing description:", error);
    res.status(500).json({ error: "Failed to process description" });
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
    });

  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ error: "Failed to save answers" });
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
      improvedDescription
    });

  } catch (error) {
    console.error("Error constructing better description:", error);
    res.status(500).json({ error: "Failed to construct better description" });
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
  border: "#d9d9d9"
};

const COMPONENT_SCHEMAS = {
  Header: {
    required: ['title'],
    optional: ['hasBack', 'hasMenu', 'actions'],
    defaults: { hasBack: false, hasMenu: false }
  },
  Button: {
    required: ['text'],
    optional: ['type', 'full', 'disabled', 'screen', 'action', 'variant'],
    defaults: { type: 'primary', full: false, disabled: false, variant: 'solid' }
  },
  Input: {
    required: ['placeholder'],
    optional: ['type', 'required', 'label', 'validation'],
    defaults: { type: 'text', required: false }
  },
  List: {
    required: [],
    optional: ['selectable', 'searchable', 'empty', 'max', 'showMore', 'pagination'],
    defaults: { selectable: false, searchable: false, empty: 'No items found' }
  },
  Card: {
    required: [],
    optional: ['title', 'desc', 'image', 'cta', 'bordered', 'hoverable'],
    defaults: { bordered: true, hoverable: false }
  },
  Carousel: {
    required: [],
    optional: ['title', 'height', 'autoplay', 'dots', 'arrows'],
    defaults: { height: 200, autoplay: false, dots: true, arrows: true }
  },
  Steps: {
    required: ['steps', 'current'],
    optional: ['direction', 'size'],
    defaults: { direction: 'horizontal', size: 'default' }
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
          // Validate components
          screen.components.forEach((component, compIndex) => {
            if (!component.type) {
              errors.push(`Component ${compIndex} in screen "${screen.name}" missing type`);
            } else if (!VALID_COMPONENT_TYPES.includes(component.type)) {
              errors.push(`Invalid component type "${component.type}" in screen "${screen.name}"`);
            }

            // Check screen references
            if (component.props?.screen && !screenNames.includes(component.props.screen)) {
              errors.push(`Component in "${screen.name}" references non-existent screen "${component.props.screen}"`);
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

export const generateWireframeJson = async (improvedDescription, workflow) => {
  const prompt = `
ROLE: You are a specialized UI wireframe generator for mobile apps using Ant Design components.

OBJECTIVE: Generate a robust, validated JSON structure for mobile app wireframes.

CRITICAL REQUIREMENTS:
1. Use ONLY these component types: ${VALID_COMPONENT_TYPES.join(', ')}
2. Use ONLY these navigation types: ${VALID_NAV_TYPES.join(', ')}
3. Use ONLY these icons: ${VALID_ICONS.join(', ')}
4. All screen references must be valid
5. All required component props must be present
6. Follow kebab-case for screen names, camelCase for properties

COMPONENT SPECIFICATIONS:
- Header: { title: string (required), hasBack?: boolean, hasMenu?: boolean }
- Button: { text: string (required), type?: "primary"|"secondary", full?: boolean, screen?: string }
- Input: { placeholder: string (required), type?: "text"|"email"|"password", label?: string }
- List: { empty?: string, max?: number, selectable?: boolean, searchable?: boolean }
- Card: { title?: string, desc?: string, cta?: object, bordered?: boolean }
- Carousel: { title?: string, height?: number, autoplay?: boolean, dots?: boolean }
- Steps: { steps: array (required), current: number (required), direction?: "horizontal"|"vertical" }

REQUIRED JSON STRUCTURE:
\`\`\`json
{
  "app": {
    "name": "App Name",
    "theme": {
      "primary": "#1890ff",
      "secondary": "#52c41a",
      "background": "#f5f5f5",
      "text": "#262626",
      "error": "#ff4d4f",
      "success": "#52c41a",
      "warning": "#faad14",
      "border": "#d9d9d9"
    },
    "nav": {
      "type": "tabs",
      "items": [
        { "name": "Home", "icon": "home", "screen": "home" }
      ]
    }
  },
  "screens": [
    {
      "name": "home",
      "title": "Home Screen",
      "components": [
        {
          "type": "Header",
          "props": { "title": "App Name", "hasMenu": true }
        }
      ]
    }
  ],
  "data": {
    "sampleData": [
      { "id": 1, "title": "Sample Item" }
    ]
  }
}
\`\`\`

VALIDATION RULES:
- All navigation screen references must exist in screens array
- All component screen references must be valid
- Required component props cannot be missing
- Screen names must be unique and use kebab-case
- Theme colors must be valid hex codes
- Icons must be from the approved list

DESCRIPTION: ${improvedDescription}

Return ONLY the JSON structure. Ensure all validations pass.
`;

  console.log("\n=============== GENERATING WIREFRAME JSON ===============");

  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1:latest",
        prompt: prompt,
        stream: false,
        // options: {
        //   temperature: 0.1, // Lower temperature for more consistent output
        //   top_p: 0.9
        // }
      },
    );

    if (response.status !== 200) {
      throw new Error(`Error from Ollama API: ${response.statusText}`);
    }

    const result = response.data;
    if (!result.response) {
      throw new Error('Empty response from Ollama API');
    }

    const rawText = result.response;

    // Extract JSON from the response
    const jsonText = extractJsonFromText(rawText);
    console.log("==============================")
    console.log(jsonText)
    console.log("==============================")

    try {
      const wireframeJson = JSON.parse(jsonText);
      console.log("WireFrame data")

      // Quick validation before returning
      // const validation = validateWireframe(wireframeJson);
      // if (!validation.isValid) {
      //   console.warn("Generated wireframe has validation issues:", validation.errors);
      //   // Don't throw here, let the calling function handle it
      // }

      // Add metadata section if not present
      if (!wireframeJson.metadata) {
        wireframeJson.metadata = {
          generatedAt: new Date().toISOString(),
          version: "1.0",
          
        };
      }

      return wireframeJson;

    } catch (parseError) {
      console.log(`Failed to parse JSON from Ollama response. Error: ${parseError.message}`);
      console.log("Attempting to fix JSON...");

      try {
        // Enhanced JSON fixing
        let fixedJson = jsonText
          .replace(/,\s*}/g, '}')           // Remove trailing commas in objects
          .replace(/,\s*]/g, ']')           // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')  // Quote unquoted keys
          .replace(/'/g, '"')              // Replace single quotes with double quotes
          .replace(/\n|\r/g, '')           // Remove newlines that might break JSON
          .trim();

        const wireframeJson = JSON.parse(fixedJson);
        console.log("✅ Successfully fixed JSON parsing issues");

        // Add metadata for fixed JSON
        if (!wireframeJson.metadata) {
          wireframeJson.metadata = {
            generatedAt: new Date().toISOString(),
            version: "1.0",
            description: improvedDescription.length > 100
              ? improvedDescription.substring(0, 100) + "..."
              : improvedDescription,
            fixed: true
          };
        }

        return wireframeJson;

      } catch (fixError) {
        console.error("❌ All JSON fix attempts failed");
        console.log("Raw response sample:", rawText.substring(0, 200));
        throw new Error("Failed to generate valid wireframe JSON");
      }
    }

  } catch (error) {
    console.error("Error generating wireframe JSON:", error.message);
    throw error;
  }
};

export const generateWireframe = async (req, res) => {
  try {
    const { improvedDescription, workflow } = req.body;


    const wireframeJson = await generateWireframeJson(improvedDescription, workflow);

    // Final validation before sending response
    // const validation = validateWireframe(wireframeJson);

    return res.status(200).json({
      success: true,
      message: "Wireframe generated successfully",
      wireframe: wireframeJson,
      
    });

  } catch (error) {
    console.error("❌ Wireframe generation failed:", error.message);

    let errorCode = "GENERATION_FAILED";
    let statusCode = 500;

    if (error.message.includes('timeout')) {
      errorCode = "TIMEOUT";
      statusCode = 408;
    } else if (error.message.includes('validation')) {
      errorCode = "VALIDATION_FAILED";
      statusCode = 422;
    } else if (error.message.includes('JSON')) {
      errorCode = "INVALID_JSON";
      statusCode = 422;
    } else if (error.message.includes('API')) {
      errorCode = "API_ERROR";
      statusCode = 502;
    }

    return res.status(statusCode).json({
      success: false,
      error: error.message,
      code: errorCode,
      timestamp: new Date().toISOString()
    });
  }
};

// Export constants for frontend use
export {
  VALID_COMPONENT_TYPES,
  VALID_NAV_TYPES,
  VALID_ICONS,
  DEFAULT_THEME,
  COMPONENT_SCHEMAS
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