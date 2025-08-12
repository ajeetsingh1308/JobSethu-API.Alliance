const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateMyProfile,
    deleteMyProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { getUserReviews } = require('../controllers/reviewController');

/**
 * @swagger
 * tags:
 * name: Users
 * description: User profile management and review retrieval
 */

/**
 * @swagger
 * components:
 * schemas:
 * Review:
 * type: object
 * required:
 * - reviewedUserId
 * - jobId
 * - rating
 * - comment
 * properties:
 * id:
 * type: string
 * reviewerId:
 * type: string
 * reviewedUserId:
 * type: string
 * jobId:
 * type: string
 * rating:
 * type: number
 * minimum: 1
 * maximum: 5
 * comment:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 */

/**
 * @swagger
 * /api/users/me:
 * get:
 * summary: Get the profile of the currently authenticated user
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: The user's full profile data
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '401':
 * description: Unauthorized
 */
router.get('/me', protect, getMyProfile);

/**
 * @swagger
 * /api/users/me:
 * put:
 * summary: Update the profile of the currently authenticated user
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * name:
 * type: string
 * location:
 * type: string
 * phone:
 * type: string
 * skills:
 * type: array
 * items:
 * type: string
 * responses:
 * '200':
 * description: The updated user profile
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '400':
 * description: Validation error
 * '401':
 * description: Unauthorized
 */
router.put('/me', protect, updateMyProfile);

/**
 * @swagger
 * /api/users/me:
 * delete:
 * summary: Delete the profile of the currently authenticated user
 * tags: [Users]
 * security:
 * - bearerAuth: []
 * responses:
 * '200':
 * description: Success message
 * '401':
 * description: Unauthorized
 */
router.delete('/me', protect, deleteMyProfile);

/**
 * @swagger
 * /api/users/{userId}/reviews:
 * get:
 * summary: Get all reviews for a specific user
 * tags: [Users]
 * parameters:
 * - in: path
 * name: userId
 * schema:
 * type: string
 * required: true
 * description: The user ID
 * responses:
 * '200':
 * description: A list of reviews for the user
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Review'
 */
router.get('/:userId/reviews', getUserReviews);

/**
 * @swagger
 * /api/users/{userId}:
 * get:
 * summary: Get the public profile of a specific user
 * tags: [Users]
 * parameters:
 * - in: path
 * name: userId
 * schema:
 * type: string
 * required: true
 * description: The user ID
 * responses:
 * '200':
 * description: The user's public profile data (name, location, skills, rating)
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/User'
 * '404':
 * description: User not found
 */
router.get('/:userId', getUserProfile);

module.exports = router;