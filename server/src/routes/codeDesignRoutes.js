import express from 'express';
import { 
  processDescription, 
  generateHtmlPages,
  getGeneratedFiles 
} from '../controllers/codeDesignController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate website from simple description (backward compatibility)
router.post('/codedesign', authenticate, processDescription);

// Generate HTML pages with full workflow and design description
router.post('/generate-html-pages', authenticate, generateHtmlPages);

// Get list of generated projects (optional)
router.get('/generated-files', authenticate, getGeneratedFiles);

export default router;