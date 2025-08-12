const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 * name: Reviews
 * description: Creating and viewing user reviews
 */

/**
 * @swagger
 * /api/reviews:
 * post:
 * summary: Create a review for a user after a completed job
 * tags: [Reviews]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - reviewedUserId
 * - jobId
 * - rating
 * - comment
 * properties:
 * reviewedUserId:
 * type: string
 * description: ID of the user being reviewed
 * jobId:
 * type: string
 * description: ID of the completed job
 * rating:
 * type: number
 * minimum: 1
 * maximum: 5
 * description: Rating from 1 to 5
 * comment:
 * type: string
 * description: Review comment
 * example:
 * reviewedUserId: "60d0fe4f5311236168a109ca"
 * jobId: "60d0fe4f5311236168a109cb"
 * rating: 5
 * comment: "Excellent work and communication!"
 * responses:
 * '201':
 * description: Review created successfully
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Review'
 * '400':
 * description: Bad Request (e.g., job not complete, reviewing yourself)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * '401':
 * description: Unauthorized
 * '403':
 * description: Forbidden (not part of the job)
 * '409':
 * description: Conflict (review already exists)
 */
router.post('/', protect, createReview);

module.exports = router;