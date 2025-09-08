const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');

/**
 * @swagger
 * tags:
 *   - name: Chat & Messaging
 *     description: Real-time chat history and messaging for jobs.
 */

// Placeholder middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  req.user = { id: 'deee8a0d-8bee-4f78-a61a-40e1d55f8daa' };
  next();
};



/**
 * @swagger
 * /jobs/{id}/messages:
 *   get:
 *     summary: Retrieves the chat history for a specific job.
 *     tags: [Chat & Messaging]
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
 *         description: Chat history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: msg1-...
 *                   sender_id:
 *                     type: string
 *                     example: u9p8o7i6-...
 *                   content:
 *                     type: string
 *                     example: Hi, I'm interested in the gardening job.
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-08-16T10:30:00Z
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 *   post:
 *     summary: Sends a new message in a job's chat.
 *     tags: [Chat & Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Yes, I have 2 years of landscaping experience.
 *     responses:
 *       201:
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: msg2-...
 *                 sender_id:
 *                   type: string
 *                   example: p1q2r3s4-...
 *                 content:
 *                   type: string
 *                   example: Yes, I have 2 years of landscaping experience.
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-08-16T10:32:00Z
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 */

// ========== GET MESSAGE HISTORY ==========
router.get('/:id/messages', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ========== SEND A MESSAGE ==========
router.post('/:id/messages', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  const { content } = req.body;
  const senderId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('messages')
      .insert({ job_id: jobId, sender_id: senderId, content })
      .select('id, sender_id, content, created_at')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;