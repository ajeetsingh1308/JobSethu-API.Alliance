const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Retrieves the profile data for the currently authenticated user.
 *     tags: [Authentication & User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
 *                 full_name:
 *                   type: string
 *                   example: Rohan Patel
 *                 email:
 *                   type: string
 *                   example: rohan.patel@example.com
 *                 avatar_url:
 *                   type: string
 *                   example: https://example.com/avatars/rohan.png
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Event Support", "Driving"]
 *                 location:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       example: 15.2993
 *                     lon:
 *                       type: number
 *                       example: 74.1240
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       500:
 *         description: Internal server error.
 *   put:
 *     summary: Updates the authenticated user's profile.
 *     tags: [Authentication & User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Rohan P.
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Event Support", "Driving", "Photography"]
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 15.3000
 *                   lon:
 *                     type: number
 *                     example: 74.1250
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
 *                 full_name:
 *                   type: string
 *                   example: Rohan P.
 *                 email:
 *                   type: string
 *                   example: rohan.patel@example.com
 *                 avatar_url:
 *                   type: string
 *                   example: https://example.com/avatars/rohan.png
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Event Support", "Driving", "Photography"]
 *                 location:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       example: 15.3000
 *                     lon:
 *                       type: number
 *                       example: 74.1250
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       500:
 *         description: Internal server error.
 */

// 🔒 Placeholder authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  // Normally you'd verify JWT here, for now assume valid
  req.user = { id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' };
  next();
};

// 📌 GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseServiceRole
      .from('users')
      .select('id, full_name, email, avatar_url, skills, location')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    if (!data) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// 📌 PUT /api/profile
router.put('/', authenticateToken, async (req, res) => {
  const { full_name, skills, location } = req.body;
  const userId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('users')
      .update({ full_name, skills, location })
      .eq('id', userId)
      .select('id, full_name, email, avatar_url, skills, location')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    if (!data) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;