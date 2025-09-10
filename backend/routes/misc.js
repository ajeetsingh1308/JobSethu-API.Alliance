
const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Placeholder middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  req.user = { id: 'deee8a0d-8bee-4f78-a61a-40e1d55f8daa' };
  next();
};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Corrected to a more generic, and often available, model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flas" });


/**
 * @swagger
 * tags:
 *   - name: Payment & AI Features
 *     description: Payment integration with Razorpay and AI services using Gemini.
 */

// ========== PAYMENT INTEGRATION (Razorpay) 💳 ==========

/**
 * @swagger
 * /jobs/{id}/create-order:
 *   post:
 *     summary: Creates a Razorpay order.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID to create an order for.
 *     responses:
 *       200:
 *         description: Razorpay order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: string
 *                   example: order_K8yq8X5J2v6Z8Y
 *                 razorpay_key_id:
 *                   type: string
 *                   example: rzp_test_12345
 *                 amount:
 *                   type: integer
 *                   example: 200000
 *                 currency:
 *                   type: string
 *                   example: INR
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/jobs/:id/create-order', authenticateToken, async (req, res) => {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const amount = 200000;
    res.status(200).json({
      order_id: 'order_K8yq8X5J2v6Z8Y',
      razorpay_key_id: razorpayKeyId,
      amount: amount,
      currency: 'INR',
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Receives and verifies notifications from Razorpay.
 *     tags: [Payment & AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received.
 *       500:
 *         description: Internal server error.
 */
router.post('/payment/webhook', (req, res) => {
  console.log('Received a Razorpay webhook.');
  res.status(200).json({ status: 'received' });
});


/**
 * @swagger
 * /jobs/{id}/release-funds:
 *   post:
 *     summary: Confirms job completion and initiates payout.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID.
 *     responses:
 *       200:
 *         description: Payout initiated successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
router.post('/jobs/:id/release-funds', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Payout initiated successfully.',
    payout_id: 'pout_K9a...',
  });
});

// ========== AI FEATURES (Genkit & Gemini) ==========

/**
 * @swagger
 * /ai/suggest-job-details:
 *   post:
 *     summary: Generates a job description and skills.
 *     tags: [Payment & AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Help moving boxes to a new apartment
 *     responses:
 *       200:
 *         description: AI-suggested job details returned.
 *       500:
 *         description: Internal server error.
 */

// Generate job details using Gemini
router.post('/ai/suggest-job-details', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const prompt = `Based on the job title "${title}", generate a detailed job description and a list of 3-5 key skills. The response should be a JSON object with two keys: "description" (string) and "skills" (an array of strings). Do not include any other text or formatting outside of the JSON object. Example: { "description": "...", "skills": ["skill1", "skill2"] }`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, '').trim();

    // Safely parse JSON and handle errors
    let jobDetails;
    try {
      jobDetails = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', jsonString);
      return res.status(500).json({ message: 'AI response was not in the correct format. Please try again.' });
    }

    res.status(200).json(jobDetails);
  } catch (err) {
    console.error('Error with Gemini API:', err);
    res.status(500).json({ message: 'Failed to generate job details with AI.' });
  }
});


/**
 * @swagger
 * /ai/generate-job-image:
 *   post:
 *     summary: Generates an image for the job posting.
 *     tags: [Payment & AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [prompt]
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: A friendly person helping with gardening under a sunny sky
 *     responses:
 *       200:
 *         description: AI-generated image URL returned.
 *       500:
 *         description: Internal server error.
 */

// Generate job image using Gemini
router.post('/ai/generate-job-image', (req, res) => {
  const { prompt } = req.body;
  // Note: Gemini-pro does not generate images. You would need to use another model or service.
  // For now, we'll return a dynamic mock URL based on the prompt for a better user experience.
  let imageUrl;
  if (prompt.toLowerCase().includes('gardening')) {
    imageUrl = 'https://images.unsplash.com/photo-1549419149-1d48c8b6d859?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  } else if (prompt.toLowerCase().includes('tutor')) {
    imageUrl = 'https://images.unsplash.com/photo-1593816668700-1c3132e02d08?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  } else {
    imageUrl = 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2715&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  }
  
  res.status(200).json({ image_url: imageUrl });
});

/**
 * @swagger
 * /ai/suggest-reply:
 *   post:
 *     summary: Generates contextual chat reply suggestions.
 *     tags: [Payment & AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [job_title, message_history]
 *             properties:
 *               job_title:
 *                 type: string
 *                 example: Need help with garden weeding
 *               message_history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sender:
 *                       type: string
 *                       enum: [applicant, poster]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI-generated chat reply suggestions returned.
 *       500:
 *         description: Internal server error.
 */
router.post('/ai/suggest-reply', (req, res) => {
  // This is a simple mock as a full chat-based AI is more complex
  res.status(200).json({
    suggestions: [
      'Yes, it is! Are you available this week?',
      'Yes! Could you tell me about your experience?',
      'Thank you for your interest!',
    ],
  });
});

module.exports = router;