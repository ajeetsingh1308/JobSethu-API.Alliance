const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');

/**
 * @swagger
 * tags:
 *   name: Job Management
 *   description: Endpoints for creating, viewing, and managing job postings.
 */

// Placeholder middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  // In real code verify JWT here
  req.user = { id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' };
  next();
};

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                       poster:
 *                         type: object
 *                         properties:
 *                           full_name:
 *                             type: string
 *                 page:
 *                   type: integer
 *                 has_more:
 *                   type: boolean
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
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
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
 *   put:
 *     summary: Updates the details of an existing job.
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Job updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 *   delete:
 *     summary: Deletes a job posting.
 *     tags: [Job Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Job deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 */

// GET /api/jobs - Get All Jobs
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { data: jobsData, error: jobsError } = await supabaseServiceRole
      .from('jobs')
      .select(`
        id,
        title,
        amount,
        poster_id,
        poster:poster_id (full_name)
      `)
      .eq('status', 'open')
      .range(offset, offset + limit - 1);

    if (jobsError) {
      console.error(jobsError);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    const jobs = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      amount: job.amount,
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
  const { title, description, amount, skills_required } = req.body;
  const posterId = req.user.id;
  try {
    const { data, error } = await supabaseServiceRole
      .from('jobs')
      .insert({ poster_id: posterId, title, description, amount, skills_required, status: 'open' })
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

// ========== UPDATE APPLICATION STATUS ==========
router.put('/:id', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;
  
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be either accepted or rejected.' });
  }

  try {
    const { data: application, error: appError } = await supabaseServiceRole
      .from('applications')
      .select('job_id')
      .eq('id', applicationId)
      .single();

    if (appError) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    
    const { data: job, error: jobError } = await supabaseServiceRole
      .from('jobs')
      .select('poster_id')
      .eq('id', application.job_id)
      .single();
    
    if (jobError) {
      return res.status(404).json({ message: 'Associated job not found.' });
    }

    if (job.poster_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized. You are not the job poster.' });
    }

    const { data: updatedApp, error: updateError } = await supabaseServiceRole
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select('id, job_id, applicant_id, status')
      .single();
    
    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    res.status(200).json(updatedApp);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// ========== WITHDRAW APPLICATION ==========
router.delete('/:id', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  const userId = req.user.id;
  try {
    const { data: application, error: appError } = await supabaseServiceRole
      .from('applications')
      .select('applicant_id')
      .eq('id', applicationId)
      .single();

    if (appError) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    if (application.applicant_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized. You can only withdraw your own application.' });
    }
    
    const { error: deleteError } = await supabaseServiceRole
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (deleteError) {
      console.error(deleteError);
      return res.status(500).json({ message: 'Internal server error.' });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;