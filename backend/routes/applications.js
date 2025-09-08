const express = require('express');
const router = express.Router();
const { supabaseServiceRole } = require('../supabase');

/**
 * @swagger
 * tags:
 *   name: Job Applications
 *   description: Endpoints for job applications.
 */

// Placeholder middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  // In real code verify JWT here
  req.user = { id: 'deee8a0d-8bee-4f78-a61a-40e1d55f8daa' };
  next();
};

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Allows a user to submit an application for a specific job.
 *     tags: [Job Applications]
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
 *       201:
 *         description: Application submitted successfully.
 *       400:
 *         description: User has already applied or is the poster.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found.
 *       500:
 *         description: Internal server error.
 *
 * /jobs/{id}/applicants:
 *   get:
 *     summary: Retrieves a list of all users who have applied for a job.
 *     tags: [Job Applications]
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
 *         description: List of applicants retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Job not found or no applicants.
 *       500:
 *         description: Internal server error.
 *
 * /applications/{id}:
 *   put:
 *     summary: Allows the job poster to accept or reject an applicant.
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *     responses:
 *       200:
 *         description: Application status updated.
 *       400:
 *         description: Invalid status.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 *
 *   delete:
 *     summary: Allows the applicant to withdraw their application.
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID.
 *     responses:
 *       204:
 *         description: Application withdrawn successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Application not found.
 *       500:
 *         description: Internal server error.
 */

// POST /api/jobs/:id/apply - Apply for a Job
router.post('/:id/apply', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  const applicantId = req.user.id;
  try {
    const jobResult = await db.query('SELECT poster_id FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (jobResult.rows[0].poster_id === applicantId) {
      return res.status(400).json({ message: 'Cannot apply to your own job.' });
    }

    const existingApplication = await db.query(
      'SELECT 1 FROM applications WHERE job_id = $1 AND applicant_id = $2',
      [jobId, applicantId]
    );
    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const result = await db.query(
      'INSERT INTO applications (job_id, applicant_id, status) VALUES ($1, $2, $3) RETURNING id, job_id, applicant_id, status',
      [jobId, applicantId, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET /api/jobs/:id/applicants - Get Applicants for a Job
router.get('/:id/applicants', authenticateToken, async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  try {
    const jobResult = await db.query('SELECT poster_id FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    if (jobResult.rows[0].poster_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized. You are not the job poster.' });
    }

    const applicantsResult = await db.query(
      `SELECT a.id AS application_id, a.status, u.id, u.full_name, u.skills
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       WHERE a.job_id = $1`,
      [jobId]
    );

    if (applicantsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    const applicants = applicantsResult.rows.map(row => ({
      application_id: row.application_id,
      status: row.status,
      applicant: {
        id: row.id,
        full_name: row.full_name,
        skills: row.skills
      }
    }));

    res.status(200).json(applicants);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT /api/applications/:id - Update Application Status
router.put('/:id', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be either accepted or rejected.' });
  }

  try {
    const applicationResult = await db.query('SELECT job_id FROM applications WHERE id = $1', [applicationId]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const jobId = applicationResult.rows[0].job_id;
    const jobResult = await db.query('SELECT poster_id FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows[0].poster_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized. You are not the job poster.' });
    }

    const updateResult = await db.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING id, job_id, applicant_id, status',
      [status, applicationId]
    );

    res.status(200).json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE /api/applications/:id - Withdraw Application
router.delete('/:id', authenticateToken, async (req, res) => {
  const applicationId = req.params.id;
  const userId = req.user.id;

  try {
    const applicationResult = await db.query('SELECT applicant_id FROM applications WHERE id = $1', [applicationId]);
    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (applicationResult.rows[0].applicant_id !== userId) {
      return res.status(401).json({ message: 'Unauthorized. You can only withdraw your own application.' });
    }

    await db.query('DELETE FROM applications WHERE id = $1', [applicationId]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;