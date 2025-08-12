const express = require('express');
const router = express.Router();
const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    applyForJob,
    getApplicants,
    selectApplicant,
    markJobComplete,
    getMessages,
    sendMessage,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 * name: Jobs
 * description: Job management, Browse, lifecycle, and chat
 */

/**
 * @swagger
 * components:
 * schemas:
 * Job:
 * type: object
 * required:
 * - title
 * - description
 * - location
 * - payment
 * - category
 * properties:
 * id:
 * type: string
 * description: The auto-generated id of the job
 * title:
 * type: string
 * description: Job title
 * description:
 * type: string
 * description: Job description
 * location:
 * type: string
 * description: Job location
 * payment:
 * type: number
 * description: Job payment amount
 * category:
 * type: string
 * description: Job category
 * urgencyFlag:
 * type: boolean
 * description: Whether the job is urgent
 * status:
 * type: string
 * enum: [open, assigned, completed, paid, canceled]
 * description: Job status
 * Message:
 * type: object
 * properties:
 * id:
 * type: string
 * jobId:
 * type: string
 * senderId:
 * type: string
 * message:
 * type: string
 * timestamp:
 * type: string
 * format: date-time
 * User:
 * type: object
 * properties:
 * id:
 * type: string
 * name:
 * type: string
 * email:
 * type: string
 * location:
 * type: string
 * rating:
 * type: number
 * skills:
 * type: array
 * items:
 * type: string
 */

// --- GET /api/jobs ---
/**
 * @swagger
 * /api/jobs:
 * get:
 * summary: Get all open jobs
 * tags: [Jobs]
 * parameters:
 * - in: query
 * name: category
 * schema:
 * type: string
 * description: Filter jobs by category
 * - in: query
 * name: location
 * schema:
 * type: string
 * description: Filter jobs by location
 * - in: query
 * name: urgency
 * schema:
 * type: string
 * description: Filter urgent jobs (true/false)
 * responses:
 * '200':
 * description: A list of open jobs.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Job'
 */
router.get('/', getAllJobs);

// --- POST /api/jobs ---
/**
 * @swagger
 * /api/jobs:
 * post:
 * summary: Post a new job
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Job'
 * responses:
 * '201':
 * description: Job created successfully.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Job'
 * '401':
 * description: Unauthorized.
 */
router.post('/', protect, createJob);

// --- GET /api/jobs/{jobId} ---
/**
 * @swagger
 * /api/jobs/{jobId}:
 * get:
 * summary: Get a single job by ID
 * tags: [Jobs]
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '200':
 * description: Job data.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Job'
 * '404':
 * description: Job not found.
 */
router.get('/:jobId', getJobById);

// --- PUT /api/jobs/{jobId} ---
/**
 * @swagger
 * /api/jobs/{jobId}:
 * put:
 * summary: Update a job posting
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Job'
 * responses:
 * '200':
 * description: Updated job data.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Job'
 * '403':
 * description: Forbidden, user is not the poster.
 */
router.put('/:jobId', protect, updateJob);

// --- DELETE /api/jobs/{jobId} ---
/**
 * @swagger
 * /api/jobs/{jobId}:
 * delete:
 * summary: Delete a job posting
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '200':
 * description: Job deleted successfully.
 * '403':
 * description: Forbidden, user is not the poster.
 */
router.delete('/:jobId', protect, deleteJob);

// --- Apply, Applicants, Select, Complete ---

/**
 * @swagger
 * /api/jobs/{jobId}/apply:
 * post:
 * summary: Apply for a job
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '201':
 * description: Application successful.
 * '409':
 * description: Already applied for this job.
 */
router.post('/:jobId/apply', protect, applyForJob);

/**
 * @swagger
 * /api/jobs/{jobId}/applicants:
 * get:
 * summary: View applicants for a job (poster only)
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '200':
 * description: A list of applicants.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/User'
 * '403':
 * description: Forbidden, user is not the poster.
 */
router.get('/:jobId/applicants', protect, getApplicants);

/**
 * @swagger
 * /api/jobs/{jobId}/select:
 * put:
 * summary: Select an applicant for a job (poster only)
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - applicantId
 * properties:
 * applicantId:
 * type: string
 * description: ID of the applicant to select
 * responses:
 * '200':
 * description: Job assigned successfully.
 * '403':
 * description: Forbidden, user is not the poster.
 */
router.put('/:jobId/select', protect, selectApplicant);

/**
 * @swagger
 * /api/jobs/{jobId}/complete:
 * put:
 * summary: Mark a job as complete (assigned worker only)
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '200':
 * description: Job marked as complete.
 * '403':
 * description: Forbidden, user is not the assigned worker.
 */
router.put('/:jobId/complete', protect, markJobComplete);

// --- Chat Messages ---

/**
 * @swagger
 * /api/jobs/{jobId}/messages:
 * get:
 * summary: Get chat messages for a job
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * responses:
 * '200':
 * description: A list of chat messages.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Message'
 * '403':
 * description: Forbidden, user not part of this job's chat.
 */
router.get('/:jobId/messages', protect, getMessages);

/**
 * @swagger
 * /api/jobs/{jobId}/messages:
 * post:
 * summary: Send a chat message
 * tags: [Jobs]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: jobId
 * required: true
 * schema:
 * type: string
 * description: Job ID
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - message
 * properties:
 * message:
 * type: string
 * description: Message content
 * responses:
 * '201':
 * description: Message sent successfully.
 * '403':
 * description: Forbidden, user not part of this job's chat.
 */
router.post('/:jobId/messages', protect, sendMessage);

module.exports = router;