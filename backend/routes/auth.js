const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');

/**
 * @swagger
 * tags:
 *   name: Authentication & User Profile
 *   description: User authentication and profile management.
 */

// ========== SIGNUP ==========
router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const { data, error } = await supabaseServiceRole
      .from('users')
      .insert({ email, password, full_name })
      .select('id, email, full_name')
      .single();

    if (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        return res.status(400).json({ message: 'User with this email already exists.' });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: data,
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Creates a new user account.
 *     tags: [Authentication & User Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 example: test.user@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               full_name:
 *                 type: string
 *                 example: Test User
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully. Please check your email.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: a1b2c3d4-e5f6-g7h8
 *                     email:
 *                       type: string
 *                       example: test.user@example.com
 *                     full_name:
 *                       type: string
 *                       example: Test User
 *       400:
 *         description: User with this email already exists.
 *       500:
 *         description: Internal server error.
 */

// ========== LOGIN ==========
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = 'supabase.jwt.token.string'; // Placeholder for JWT
    res.status(200).json({
      message: 'Login successful.',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in an existing user.
 *     tags: [Authentication & User Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test.user@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 token:
 *                   type: string
 *                   example: supabase.jwt.token.string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: a1b2c3d4-e5f6-g7h8
 *                     email:
 *                       type: string
 *                       example: test.user@example.com
 *                     full_name:
 *                       type: string
 *                       example: Test User
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */

module.exports = router;