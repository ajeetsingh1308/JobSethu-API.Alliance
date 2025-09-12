const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints for user-specific dashboard data
 */

/**
 * @swagger
 * /dashboard/postings:
 *   get:
 *     summary: Retrieves all jobs posted by the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of jobs posted by the user
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/postings', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('jobs')
      .select(`
        id,
        title,
        amount,
        skills_required,
        description,
        category,
        poster:poster_id (full_name)
      `)
      .eq('poster_id', userId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * @swagger
 * /dashboard/applications:
 *   get:
 *     summary: Retrieves all jobs the authenticated user has applied to
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of jobs the user has applied to
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/applications', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('applications')
      .select(`
        status,
        job:jobs (
          id,
          title,
          amount,
          skills_required,
          description,
          category,
          poster:poster_id (full_name)
        )
      `)
      .eq('applicant_id', userId);

    if (error) throw error;

    // Flatten the data to match the JobCard component structure
    const appliedJobs = data.map(app => ({
      ...app.job,
      application_status: app.status,
    }));

    res.status(200).json(appliedJobs);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;