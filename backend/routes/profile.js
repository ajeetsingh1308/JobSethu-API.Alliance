const express = require("express");
const router = express.Router();
const { supabaseServiceRole } = require("../supabase");
const authenticateToken = require('../middleware/auth'); // Use the correct middleware

/**
 * @swagger
 * tags:
 *   name: Authentication & User Profile
 *   description: Endpoints for managing user authentication and profile
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Retrieves the profile data for the currently authenticated user
 *     tags: [Authentication & User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Updates the authenticated user's profile
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
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               about:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

// GET /api/profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseServiceRole
      .from("users")
      .select("id, full_name, email, avatar_url, skills, location, about")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "User not found." });

    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error." });
  }
});

// PUT /api/profile
router.put("/", authenticateToken, async (req, res) => {
  const { full_name, skills, location, about } = req.body;
  const userId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from("users")
      .update({ full_name, skills, location, about })
      .eq("id", userId)
      .select("id, full_name, email, avatar_url, skills, location, about")
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "User not found." });

    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;