const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { supabaseServiceRole } = require('../supabase');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authenticateToken = require('../middleware/auth'); // Using the secure middleware
const multer = require('multer');
require('dotenv').config();

// Initialize Razorpay client. This will read the keys from your .env file.
// It will only work once you have valid keys.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


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
 *     summary: Creates a Razorpay order for a specific job.
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
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/jobs/:id/create-order', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  try {
    // 1. Fetch the job from the database to get the real amount
    const { data: job, error } = await supabaseServiceRole
      .from('jobs')
      .select('amount')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // 2. Create Razorpay order options
    const options = {
      amount: job.amount * 100, // Amount in paise (e.g., 50000 for ₹500)
      currency: 'INR',
      receipt: `receipt_job_${jobId}`,
      notes: {
        jobId: jobId,
        userId: req.user.id,
      },
    };

    // 3. Use the Razorpay SDK to create the order
    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      order_id: order.id,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (err) {
    console.error('Razorpay order creation failed:', err.message);
    res.status(500).json({ message: 'Failed to create payment order.' });
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
 *         description: Webhook received successfully.
 *       400:
 *         description: Invalid webhook signature.
 *       500:
 *         description: Internal server error.
 */
router.post('/payment/webhook', (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    try {
      // Create a signature hash to validate the webhook
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
  
      // Compare the generated signature with the one from Razorpay
      if (digest === signature) {
        console.log('Payment webhook validated successfully:', req.body);
        // TODO: Add logic here to update the payment status in your database
        // For example: if (req.body.event === 'payment.captured') { updateJobPaymentStatus(jobId); }
      } else {
        console.warn('Invalid webhook signature received.');
        return res.status(400).json({ status: 'error', message: 'Invalid signature.' });
      }
      res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send({ status: 'error', message: 'Internal Server Error' });
    }
});

// ========== Image Uploads to Supabase Storage ==========

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Uploads a job image.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 */
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabaseServiceRole.storage
            .from('job-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            throw uploadError;
        }

        // Get the public URL of the uploaded file
        const { data } = supabaseServiceRole.storage
            .from('job-images')
            .getPublicUrl(fileName);

        res.status(200).json({ image_url: data.publicUrl });

    } catch (err) {
        console.error('Error uploading file to Supabase:', err);
        res.status(500).json({ message: 'Failed to upload image.' });
    }
});

/**
 * @swagger
 * /upload/avatar:
 *   post:
 *     summary: Uploads a user avatar image.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully.
 */
router.post('/upload/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const file = req.file;
        // Use user ID for filename to ensure uniqueness and prevent conflicts
        const fileName = `${req.user.id}-${Date.now()}`;

        // Upload file to the 'avatars' bucket
        const { error: uploadError } = await supabaseServiceRole.storage
            .from('avatars')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true, // Overwrite existing file for the user if they upload a new one
            });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabaseServiceRole.storage
            .from('avatars')
            .getPublicUrl(fileName);

        res.status(200).json({ avatar_url: data.publicUrl });

    } catch (err) {
        console.error('Error uploading avatar to Supabase:', err);
        res.status(500).json({ message: 'Failed to upload avatar.' });
    }
});


// ========== AI FEATURES (Genkit & Gemini) ==========

/**
 * @swagger
 * /ai/suggest-job-details:
 *   post:
 *     summary: Generates a job description and skills using AI.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
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
router.post('/ai/suggest-job-details', authenticateToken, async (req, res) => {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }
  
    try {
      const prompt = `Based on the job title "${title}", generate a detailed job description and a list of 3-5 key skills. The response must be a valid JSON object with two keys: "description" (string) and "skills" (an array of strings). Do not include any other text or formatting outside of the JSON object. Example: { "description": "...", "skills": ["skill1", "skill2"] }`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      // Clean up the response to ensure it's a parseable JSON string
      const jsonString = response.text().replace(/```json|```/g, '').trim();
      
      const jobDetails = JSON.parse(jsonString);
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
 *     summary: Generates an image for the job posting (placeholder).
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
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
 *         description: A placeholder image URL is returned.
 */
router.post('/ai/generate-job-image', authenticateToken, (req, res) => {
    // NOTE: This is a placeholder. The 'gemini-1.5-flash' model does not generate images.
    // A real implementation would require a different service (e.g., Google's Imagen model).
    const placeholderImageUrl = 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2715&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90oy1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    res.status(200).json({ image_url: placeholderImageUrl });
});

/**
 * @swagger
 * /ai/suggest-reply:
 *   post:
 *     summary: Generates contextual chat reply suggestions.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_history
 *             properties:
 *               message_history:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, other]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: AI-generated chat reply suggestions returned.
 */
router.post('/ai/suggest-reply', authenticateToken, async (req, res) => {
  const { message_history } = req.body;

  if (!message_history || message_history.length === 0) {
    return res.status(400).json({ message: 'Message history is required.' });
  }

  // Format the history for the AI prompt
  const conversation = message_history
    .map(msg => `${msg.role === 'user' ? 'Me' : 'Them'}: ${msg.content}`)
    .join('\n');

  try {
    const prompt = `
      You are a helpful assistant in a job messaging app. Based on the following conversation, generate 3 short, natural-sounding, and relevant reply suggestions for "Me".
      The response must be a valid JSON object with a single key "suggestions" which is an array of 3 strings. Do not include any other text or formatting.

      Conversation:
      ${conversation}

      My turn to reply. My suggestions are:
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, '').trim();
    
    const suggestions = JSON.parse(jsonString);
    res.status(200).json(suggestions);

  } catch (err) {
    console.error('Error with Gemini API for suggestions:', err);
    res.status(500).json({ message: 'Failed to generate suggestions.' });
  }
});

/**
 * @swagger
 * /ai/generate-about:
 *   post:
 *     summary: Generates a user profile "About Me" section based on skills.
 *     tags: [Payment & AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skills]
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Graphic Design", "React", "Teamwork"]
 *     responses:
 *       200:
 *         description: AI-generated "About Me" text returned.
 */
router.post('/ai/generate-about', authenticateToken, async (req, res) => {
  const { skills } = req.body;

  if (!skills || skills.length === 0) {
    return res.status(400).json({ message: 'A list of skills is required to generate an about section.' });
  }

  try {
    const prompt = `
      Based on the following skills: ${skills.join(', ')}.
      Write a friendly, first-person "About Me" paragraph for a job-finding profile. It should be 2-3 sentences long.
      The response must be a valid JSON object with a single key "about" which contains the generated text as a string.
      Example: { "about": "I am a skilled professional..." }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json|```/g, '').trim();
    
    const aboutSection = JSON.parse(jsonString);
    res.status(200).json(aboutSection);

  } catch (err) {
    console.error('Error with Gemini API for about section:', err);
    res.status(500).json({ message: 'Failed to generate about section.' });
  }
});

module.exports = router;