import express from 'express';
import { processDescription, saveAnswers, constructBetterDescription, generateWireframe, generatePages } from '../controllers/designController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/process', authenticate, processDescription);
router.post('/construct-description', authenticate, constructBetterDescription);
router.post('/generate-wireframe', authenticate, generateWireframe);
router.post('/generate-pages', authenticate, generatePages); // process flows

router.post('/answers', authenticate, saveAnswers);

export default router;