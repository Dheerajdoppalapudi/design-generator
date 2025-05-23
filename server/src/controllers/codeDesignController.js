import https from 'https';
import fs from 'fs';
import path from 'path';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

// Function to make API request to Groq
function makeGroqRequest(prompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile"
        });

        const options = {
            hostname: 'api.groq.com',
            port: 443,
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.choices && response.choices[0]) {
                        resolve(response.choices[0].message.content);
                    } else {
                        reject(new Error('Invalid response format from Groq API'));
                    }
                } catch (error) {
                    reject(new Error('Failed to parse API response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// Function to parse HTML files from response
function parseHtmlFiles(response) {
    const lines = response.split('\n');
    const files = [];
    let currentFilename = null;
    let htmlBuffer = [];

    for (const line of lines) {
        if (line.trim().startsWith("--- FILE:")) {
            // Save previous file if exists
            if (currentFilename && htmlBuffer.length > 0) {
                files.push({
                    filename: currentFilename,
                    content: htmlBuffer.join('\n')
                });
                htmlBuffer = [];
            }

            // Extract new filename
            const parts = line.trim().split(':', 2);
            if (parts.length > 1) {
                currentFilename = parts[1].trim();
            }
        } else if (currentFilename) {
            htmlBuffer.push(line);
        }
    }

    // Add the final file
    if (currentFilename && htmlBuffer.length > 0) {
        files.push({
            filename: currentFilename,
            content: htmlBuffer.join('\n')
        });
    }

    return files;
}

// Function to save files to disk (optional)
function saveFilesToDisk(files, baseDir = './generated_websites') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const projectDir = path.join(baseDir, `website_${timestamp}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
    }

    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }

    const savedFiles = [];

    files.forEach(file => {
        try {
            const filePath = path.join(projectDir, file.filename);
            fs.writeFileSync(filePath, file.content, 'utf8');
            savedFiles.push({
                filename: file.filename,
                path: filePath
            });
        } catch (error) {
            console.error(`Error saving file ${file.filename}:`, error.message);
        }
    });

    return {
        projectDir,
        savedFiles
    };
}

// Helper function to convert workflow to readable format
function formatWorkflowForPrompt(workflow) {
    if (!workflow || !Array.isArray(workflow)) return '';
    
    return workflow.map(screen => 
        `- ${screen.title}: ${screen.description} (connects to: ${screen.nextScreens.join(', ') || 'none'})`
    ).join('\n');
}

// Main controller function for generating HTML pages
export const generateHtmlPages = async (req, res) => {
    try {
        const { 
            designDescription, 
            workflow = [], 
            siteType = "web application",
            saveToFile = false 
        } = req.body;

        // Validate input
        if (!designDescription || typeof designDescription !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Design description is required and must be a string'
            });
        }

        // Format workflow for the prompt
        const workflowText = formatWorkflowForPrompt(workflow);
        
        // Construct the comprehensive prompt
        const prompt = `
You're a frontend web designer. Create a complete set of modern, visually cohesive HTML screens (with inline CSS in a <style> tag inside each file) for a ${siteType}.

DESIGN REQUIREMENTS:
${designDescription}

TECHNICAL REQUIREMENTS:
1. Use consistent design elements (color theme, fonts, buttons, spacing) across all screens.
2. Use only HTML and CSS (no JavaScript).
3. All CSS should be embedded in a <style> tag in the head section of each file.
4. Make the layout responsive and mobile-friendly using CSS Grid and Flexbox.
5. Use modern CSS features like CSS variables for consistent theming.
6. Each file should represent one logical screen in the user flow.
7. Include proper navigation between screens (even if links won't work in static HTML).
8. Use semantic HTML elements for accessibility.
9. Include hover states and smooth transitions for better UX.

DESIGN GUIDELINES:
- Use a modern, clean design aesthetic
- Implement a consistent color scheme throughout
- Use readable typography with proper hierarchy
- Include proper spacing and visual hierarchy
- Make forms user-friendly with proper validation styling
- Use icons and visual elements to enhance the user experience
- Ensure mobile-first responsive design

REQUIRED SCREENS (based on workflow):
${workflow.map(screen => `- ${screen.title.toLowerCase().replace(/\s+/g, '-')}.html - ${screen.description}`).join('\n')}

OUTPUT FORMAT:
- Clearly separate each HTML file using comments like:
  --- FILE: filename.html ---
  <html>...</html>
- Each screen must have a consistent design like a real web application
- Include proper DOCTYPE, meta tags, and title for each page
- Use consistent CSS variables for colors, fonts, and spacing

Only output the raw HTML code for each file. Do not include explanations or markdown formatting.
        `;

        console.log(`🚀 Generating HTML pages for: ${siteType}`);

        // Send request to Groq API
        const response = await makeGroqRequest(prompt);
        console.log('📥 Received response from Groq API');

        // Parse HTML files from response
        const htmlFiles = parseHtmlFiles(response);

        if (htmlFiles.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No HTML files were generated. Please try again with a different description.'
            });
        }

        console.log(`📄 Generated ${htmlFiles.length} HTML files`);

        let savedInfo = null;

        // Save to disk if requested
        if (saveToFile) {
            try {
                savedInfo = saveFilesToDisk(htmlFiles);
                console.log(`💾 Files saved to: ${savedInfo.projectDir}`);
            } catch (error) {
                console.error('Error saving files to disk:', error.message);
                // Continue without saving to disk
            }
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: 'HTML pages generated successfully',
            data: {
                designDescription,
                workflow: workflow,
                siteType,
                filesGenerated: htmlFiles.length,
                files: htmlFiles.map(file => ({
                    filename: file.filename,
                    contentLength: file.content.length,
                    sizeKB: Math.round(file.content.length / 1024)
                })),
                htmlFiles: htmlFiles, // Full content for client use
                ...(savedInfo && { savedTo: savedInfo.projectDir })
            }
        });

    } catch (error) {
        console.error('Error in generateHtmlPages:', error);

        // Handle specific API errors
        if (error.message.includes('API')) {
            return res.status(503).json({
                success: false,
                message: 'External AI service unavailable. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Generic error response
        res.status(500).json({
            success: false,
            message: 'Internal server error occurred while generating HTML pages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Keep your existing processDescription function for backward compatibility
export const processDescription = async (req, res) => {
    try {
        const { siteDescription, saveToFile = false } = req.body;

        // Validate input
        if (!siteDescription || typeof siteDescription !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Site description is required and must be a string'
            });
        }

        // Use the new function with simple parameters
        req.body = {
            designDescription: siteDescription,
            workflow: [],
            siteType: siteDescription,
            saveToFile
        };

        return generateHtmlPages(req, res);

    } catch (error) {
        console.error('Error in processDescription:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error occurred while generating website',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Optional: Get generated files list (if saving to disk)
export const getGeneratedFiles = async (req, res) => {
    try {
        const baseDir = './generated_websites';

        if (!fs.existsSync(baseDir)) {
            return res.status(200).json({
                success: true,
                data: {
                    projects: []
                }
            });
        }

        const projects = fs.readdirSync(baseDir)
            .filter(item => fs.statSync(path.join(baseDir, item)).isDirectory())
            .map(projectName => {
                const projectPath = path.join(baseDir, projectName);
                const files = fs.readdirSync(projectPath)
                    .filter(file => file.endsWith('.html'))
                    .map(file => ({
                        filename: file,
                        path: path.join(projectPath, file),
                        size: fs.statSync(path.join(projectPath, file)).size
                    }));

                return {
                    projectName,
                    projectPath,
                    files,
                    createdAt: fs.statSync(projectPath).birthtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json({
            success: true,
            data: {
                projects
            }
        });

    } catch (error) {
        console.error('Error getting generated files:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving generated files',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};