const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 * name: Authentication
 * description: User authentication and registration
 */

/**
 * @swagger
 * components:
 * schemas:
 * User:
 * type: object
 * properties:
 * id:
 * type: string
 * description: The user ID
 * name:
 * type: string
 * description: The user's name
 * email:
 * type: string
 * description: The user's email
 * phone:
 * type: string
 * description: The user's phone number
 * location:
 * type: string
 * description: The user's location
 * createdAt:
 * type: string
 * format: date-time
 * description: Account creation timestamp
 */

/**
 * @swagger
 * /api/auth/register:
 * post:
 * summary: Register a new user
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * description: User's full name
 * example: John Doe
 * email:
 * type: string
 * format: email
 * description: User's email address
 * example: john@example.com
 * password:
 * type: string
 * format: password
 * description: User's password (min 6 characters)
 * example: password123
 * phone:
 * type: string
 * description: User's phone number
 * example: +1234567890
 * location:
 * type: string
 * description: User's location
 * example: New York, NY
 * responses:
 * '201':
 * description: User registered successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * user:
 * type: object
 * properties:
 * id:
 * type: string
 * name:
 * type: string
 * email:
 * type: string
 * token:
 * type: string
 * description: JWT authentication token
 * '400':
 * description: Bad request - Invalid user data or email already exists
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * '500':
 * description: Server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 * post:
 * summary: Login user
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email:
 * type: string
 * format: email
 * description: User's email address
 * example: john@example.com
 * password:
 * type: string
 * format: password
 * description: User's password
 * example: password123
 * responses:
 * '200':
 * description: Login successful
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * user:
 * type: object
 * properties:
 * id:
 * type: string
 * name:
 * type: string
 * email:
 * type: string
 * token:
 * type: string
 * description: JWT authentication token
 * '401':
 * description: Invalid credentials
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message:
 * type: string
 * example: Invalid credentials.
 * '500':
 * description: Server error
 */
router.post('/login', loginUser);

module.exports = router;