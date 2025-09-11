const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');
const authenticateToken = require('../middleware/auth'); // The one, correct declaration

/**
 * @swagger
 * tags:
 *   name: Job Management
 *   description: Endpoints for creating, viewing, and managing job postings.
 */

// NOTE: The old, multi-line authenticateToken function that was here is now DELETED.

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Fetches a paginated list of all open job postings.
 *     tags: [Job Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of jobs per page
 *     responses:
 *       200:
 *         description: A list of jobs.
 *   post:
 *     summary: Creates a new job posting.
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, amount, skills_required]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: integer
 *               skills_required:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Job created successfully.
 *
 * /jobs/{id}:
 *   get:
 *     summary: Retrieves the complete details for a single job posting.
 *     tags: [Job Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID.
 *     responses:
 *       200:
 *         description: Job details retrieved successfully.
 *       404:
 *         description: Job not found.
 */

// GET /api/jobs - Get All Jobs
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const offset = (page - 1) * limit;

  try {
    let query = supabaseServiceRole
      .from('jobs')
      .select(`
        id,
        title,
        amount,
        skills_required,
        description,
        category,
        poster_id,
        poster:poster_id (full_name)
      `)
      .eq('status', 'open');
      
    if (category && category !== 'All') {
      query = query.contains('skills_required', [category]);
    }

    const { data: jobsData, error: jobsError } = await query
      .range(offset, offset + limit - 1);

    if (jobsError) {
      console.error(jobsError);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    const jobs = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      amount: job.amount,
      skills_required: job.skills_required,
      description: job.description,
      category: job.category,
      poster: { full_name: job.poster.full_name },
    }));

    res.status(200).json({ jobs, page, has_more: jobs.length === limit });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabaseServiceRole
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ message: 'Job not found.' });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// POST /api/jobs
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, amount, skills_required, category } = req.body;
  const posterId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('jobs')
      .insert({ poster_id: posterId, title, description, amount, skills_required, category, status: 'open' })
      .select('*')
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