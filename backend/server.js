const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');

const app = express();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// --- START: CORRECTED SWAGGER SPECIFICATION ---
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Job Platform API MVP',
    version: '1.0.0',
    description: 'A simple job platform API for connecting job posters with workers',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token in the format: Bearer {token}'
      },
    },
    schemas: {
      // Base user schema for internal model reference (not directly exposed)
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          phone: { type: 'string', example: '1234567890' },
          location: { type: 'string', example: 'New York, NY' },
          rating: { type: 'number', format: 'float', example: 4.5 },
          skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Node.js'] },
        },
      },
      // Schema for public user profiles
      PublicUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          name: { type: 'string', example: 'John Doe' },
          location: { type: 'string', example: 'New York, NY' },
          rating: { type: 'number', format: 'float', example: 4.5 },
          skills: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Node.js'] },
        }
      },
      // Schema for applicant info (poster's view)
      Applicant: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '2' },
          name: { type: 'string', example: 'Jane Worker' },
          rating: { type: 'number', format: 'float', example: 4.8 },
          skills: { type: 'array', items: { type: 'string' }, example: ['React', 'CSS'] },
        }
      },
      // Schema for job details
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          title: { type: 'string', example: 'Website Development' },
          description: { type: 'string', example: 'Need a responsive website built' },
          location: { type: 'string', example: 'Remote' },
          payment: { type: 'number', example: 500 },
          category: { type: 'string', example: 'Development' },
          urgencyFlag: { type: 'boolean', example: false },
          status: { type: 'string', enum: ['open', 'assigned', 'completed', 'paid'], example: 'open' },
          postedBy: { type: 'string', description: 'ID of the user who posted the job', example: '1' },
          applicants: { type: 'array', items: { type: 'string' }, description: 'Array of applicant user IDs' },
          selectedWorkerId: { type: 'string', nullable: true },
        },
        required: ['title', 'description', 'location', 'payment', 'category'],
      },
      // Schema for job list where poster info is embedded
      JobWithPosterInfo: {
        allOf: [{ $ref: '#/components/schemas/Job' }],
        properties: {
          postedBy: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@example.com' },
            }
          }
        }
      },
      // Schema for job applications
      Application: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            jobId: { type: 'string' },
            applicantId: { type: 'string' },
            status: { type: 'string', example: 'pending'},
            appliedAt: { type: 'string', format: 'date-time' }
        }
      },
      // Schema for reviews
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          reviewerId: { type: 'string', example: '1' },
          reviewedUserId: { type: 'string', example: '2' },
          jobId: { type: 'string', example: '1' },
          rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
          comment: { type: 'string', example: 'Great work!' },
        },
        required: ['reviewedUserId', 'jobId', 'rating', 'comment'],
      },
      // Schema for review list where reviewer info is embedded
      ReviewWithReviewerInfo: {
        allOf: [{ $ref: '#/components/schemas/Review' }],
        properties: {
            reviewer: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'John Doe' }
                }
            }
        }
      },
      // Standard message response
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      // Auth schemas
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'demo@example.com' },
          password: { type: 'string', example: 'password' },
        },
        required: ['email', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      // Standard error response
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error message' },
          details: { type: 'string', example: 'Additional error details' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Get API information',
        tags: ['General'],
        responses: { '200': { description: 'API information' } },
      },
    },
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['General'],
        responses: { '200': { description: 'Server health status' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs': {
      get: {
        summary: 'Get all jobs',
        tags: ['Jobs'],
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'location', in: 'query', schema: { type: 'string' }, description: 'Filter by location' },
          { name: 'urgency', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filter by urgency flag' },
        ],
        responses: {
          '200': { description: 'List of jobs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/JobWithPosterInfo' } } } } },
        },
      },
      post: {
        summary: 'Create a new job',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } },
        },
        responses: {
          '201': { description: 'Job created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs/{jobId}': {
      get: {
        summary: 'Get job by ID',
        tags: ['Jobs'],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Job details', content: { 'application/json': { schema: { $ref: '#/components/schemas/JobWithPosterInfo' } } } },
          '404': { description: 'Job not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        summary: 'Update job (poster only)',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
        responses: {
          '200': { description: 'Job updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Job' } } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        summary: 'Delete job (poster only)',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Job deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' }}}},
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs/{jobId}/apply': {
      post: {
        summary: 'Apply for a job',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '201': { description: 'Application successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/Application' }}}},
          '409': { description: 'Already applied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs/{jobId}/applicants': {
      get: {
        summary: 'Get job applicants (poster only)',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'List of applicants', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Applicant' } } } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs/{jobId}/select': {
      put: {
        summary: 'Select an applicant (poster only)',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { applicantId: { type: 'string', example: '2' } }, required: ['applicantId'] } } },
        },
        responses: {
          '200': { description: 'Applicant selected', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' }}}},
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/jobs/{jobId}/complete': {
      put: {
        summary: 'Mark job as complete (worker only)',
        tags: ['Jobs'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Job marked as complete', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' }}}},
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/me': {
      get: {
        summary: 'Get my profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        summary: 'Update my profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, location: { type: 'string' }, phone: { type: 'string' }, skills: { type: 'array', items: { type: 'string' } } } } } },
        },
        responses: {
          '200': { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/users/{userId}': {
      get: {
        summary: 'Get user public profile',
        tags: ['Users'],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User public profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/PublicUser' } } } },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
     '/api/users/{userId}/reviews': {
      get: {
        summary: 'Get user reviews',
        tags: ['Reviews'],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'List of user reviews', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ReviewWithReviewerInfo' } } } } },
        },
      },
    },
    '/api/reviews': {
      post: {
        summary: 'Create a review',
        tags: ['Reviews'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } },
        },
        responses: {
          '201': { description: 'Review created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Review' } } } },
          '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};
// --- END: CORRECTED SWAGGER SPECIFICATION ---

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Job Platform API Documentation",
  swaggerOptions: {
    persistAuthorization: true, // Remembers your JWT token
  }
}));

// In-memory data storage
let users = [
    {
        id: '1',
        name: 'Demo Poster',
        email: 'demo@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        phone: '1234567890',
        location: 'Demo City',
        rating: 4.5,
        skills: ['Management', 'Planning']
    },
    {
        id: '2',
        name: 'Jane Worker',
        email: 'worker@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        phone: '0987654321',
        location: 'Worker Town',
        rating: 4.8,
        skills: ['JavaScript', 'Node.js', 'React']
    }
];

let jobs = [
    {
        id: '1',
        title: 'Website Development',
        description: 'Need a simple website built',
        location: 'Remote',
        payment: 500,
        category: 'Development',
        urgencyFlag: false,
        postedBy: '1',
        applicants: [],
        selectedWorkerId: null,
        status: 'open',
        createdAt: new Date()
    }
];

let applications = [];
let reviews = [];
let chatMessages = [];

// Helper functions
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const findUserById = (id) => users.find(user => user.id === id);
const findJobById = (id) => jobs.find(job => job.id === id);

// Auth middleware
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = findUserById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// --- API ROUTES (Unchanged from your original code) ---

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Job Platform API MVP',
        status: 'running',
        documentation: `http://localhost:${PORT}/api-docs`
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        dataStats: {
            users: users.length,
            jobs: jobs.length,
            applications: applications.length
        }
    });
});

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = users.find(u => u.email === email);

        if (user && await bcrypt.compare(password, user.password)) {
            const userResponse = { ...user };
            delete userResponse.password;
            res.json({
                user: userResponse,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// JOB ROUTES
app.get('/api/jobs', (req, res) => {
    try {
        const { category, location, urgency } = req.query;
        let filteredJobs = jobs; // Show all jobs, not just open ones, for general Browse

        if (category) {
            filteredJobs = filteredJobs.filter(job =>
                job.category.toLowerCase().includes(category.toLowerCase())
            );
        }

        if (location) {
            filteredJobs = filteredJobs.filter(job =>
                job.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        if (urgency === 'true') {
            filteredJobs = filteredJobs.filter(job => job.urgencyFlag === true);
        }

        const jobsWithPoster = filteredJobs.map(job => {
            const poster = findUserById(job.postedBy);
            return {
                ...job,
                postedBy: poster ? { name: poster.name, email: poster.email } : null
            };
        });

        res.json(jobsWithPoster);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.get('/api/jobs/:jobId', (req, res) => {
    try {
        const job = findJobById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const poster = findUserById(job.postedBy);
        const jobWithPoster = {
            ...job,
            postedBy: poster ? { name: poster.name, email: poster.email } : null
        };

        res.json(jobWithPoster);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/jobs', protect, (req, res) => {
    const { title, description, location, payment, category, urgencyFlag } = req.body;

    try {
        const newJob = {
            id: Date.now().toString(),
            title,
            description,
            location,
            payment: Number(payment),
            category,
            urgencyFlag: urgencyFlag || false,
            postedBy: req.user.id,
            applicants: [],
            selectedWorkerId: null,
            status: 'open',
            createdAt: new Date()
        };

        jobs.push(newJob);
        res.status(201).json(newJob);
    } catch (error) {
        res.status(400).json({ message: 'Validation Error', details: error.message });
    }
});

app.put('/api/jobs/:jobId', protect, (req, res) => {
    try {
        const jobIndex = jobs.findIndex(job => job.id === req.params.jobId);
        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = jobs[jobIndex];
        if (job.postedBy !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }
        
        const updatedJob = { ...job, ...req.body, id: job.id, postedBy: job.postedBy };
        jobs[jobIndex] = updatedJob;

        res.json(jobs[jobIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.delete('/api/jobs/:jobId', protect, (req, res) => {
    try {
        const jobIndex = jobs.findIndex(job => job.id === req.params.jobId);
        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job not found' });
        }

        const job = jobs[jobIndex];
        if (job.postedBy !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }

        jobs.splice(jobIndex, 1);
        res.json({ message: 'Job deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/jobs/:jobId/apply', protect, (req, res) => {
    try {
        const job = findJobById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if(job.postedBy === req.user.id) {
            return res.status(400).json({ message: 'You cannot apply to your own job.' });
        }

        const alreadyApplied = job.applicants.includes(req.user.id);
        if (alreadyApplied) {
            return res.status(409).json({ message: 'You have already applied for this job.' });
        }

        const application = {
            id: Date.now().toString(),
            jobId: job.id,
            applicantId: req.user.id,
            status: 'pending',
            appliedAt: new Date()
        };

        applications.push(application);
        job.applicants.push(req.user.id);

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
});

app.get('/api/jobs/:jobId/applicants', protect, (req, res) => {
    try {
        const job = findJobById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }

        const applicants = job.applicants.map(applicantId => {
            const user = findUserById(applicantId);
            return user ? {
                id: user.id,
                name: user.name,
                rating: user.rating,
                skills: user.skills
            } : null;
        }).filter(Boolean);

        res.json(applicants);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/api/jobs/:jobId/select', protect, (req, res) => {
    const { applicantId } = req.body;

    try {
        const job = findJobById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.postedBy !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden. You are not the poster of this job.' });
        }

        if (job.status !== 'open') {
            return res.status(400).json({ message: 'Job is not open for selection.' });
        }

        if (!job.applicants.includes(applicantId)) {
            return res.status(400).json({ message: 'This user did not apply for the job.' });
        }

        job.selectedWorkerId = applicantId;
        job.status = 'assigned';

        res.json({ message: `Job assigned successfully to user ${applicantId}.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/api/jobs/:jobId/complete', protect, (req, res) => {
    try {
        const job = findJobById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!job.selectedWorkerId || job.selectedWorkerId !== req.user.id) {
            return res.status(403).json({ message: 'Only the assigned worker can mark this job as complete.' });
        }

        if (job.status !== 'assigned') {
            return res.status(400).json({ message: 'Job must be in "assigned" status to be marked as complete.' });
        }

        job.status = 'completed';
        res.json({ message: 'Job marked as complete.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// USER ROUTES
app.get('/api/users/me', protect, (req, res) => {
    const user = { ...req.user };
    delete user.password;
    res.json(user);
});

app.get('/api/users/:userId', (req, res) => {
    try {
        const user = findUserById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const publicProfile = {
            id: user.id,
            name: user.name,
            location: user.location,
            skills: user.skills,
            rating: user.rating
        };

        res.json(publicProfile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', details: error.message });
    }
});

app.put('/api/users/me', protect, (req, res) => {
    try {
        const userIndex = users.findIndex(u => u.id === req.user.id);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, location, phone, skills } = req.body;

        if (skills && !Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills must be an array of strings.' });
        }

        users[userIndex] = {
            ...users[userIndex],
            ...(name && { name }),
            ...(location && { location }),
            ...(phone && { phone }),
            ...(skills && { skills })
        };

        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: 'Validation Error', details: error.message });
    }
});

// REVIEW ROUTES
app.post('/api/reviews', protect, (req, res) => {
    const { reviewedUserId, jobId, rating, comment } = req.body;

    try {
        const job = findJobById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        if (!['completed', 'paid'].includes(job.status)) {
            return res.status(400).json({ message: "You cannot review a user for a job that is not completed." });
        }

        const isPoster = job.postedBy === req.user.id;
        const isWorker = job.selectedWorkerId && job.selectedWorkerId === req.user.id;

        if (!isPoster && !isWorker) {
            return res.status(403).json({ message: "You are not authorized to review for this job." });
        }

        if (req.user.id === reviewedUserId) {
            return res.status(400).json({ message: "You cannot review yourself." });
        }

        const isReviewingPoster = isWorker && job.postedBy === reviewedUserId;
        const isReviewingWorker = isPoster && job.selectedWorkerId === reviewedUserId;

        if (!isReviewingPoster && !isReviewingWorker) {
            return res.status(400).json({ message: "You can only review the other party involved in the job." });
        }

        const existingReview = reviews.find(r => r.jobId === jobId && r.reviewerId === req.user.id);
        if (existingReview) {
            return res.status(409).json({ message: "You have already submitted a review for this job." });
        }

        const review = {
            id: Date.now().toString(),
            reviewerId: req.user.id,
            reviewedUserId,
            jobId,
            rating: Number(rating),
            comment,
            createdAt: new Date()
        };

        reviews.push(review);

        const userReviews = reviews.filter(r => r.reviewedUserId === reviewedUserId);
        const avgRating = userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;

        const userIndex = users.findIndex(u => u.id === reviewedUserId);
        if (userIndex !== -1) {
            users[userIndex].rating = Number(avgRating.toFixed(1));
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: "Server Error", details: error.message });
    }
});

app.get('/api/users/:userId/reviews', (req, res) => {
    try {
        const userReviews = reviews
            .filter(r => r.reviewedUserId === req.params.userId)
            .map(review => {
                const reviewer = findUserById(review.reviewerId);
                return {
                    ...review,
                    reviewer: reviewer ? { id: reviewer.id, name: reviewer.name } : null
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(userReviews);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found. Go to /api-docs for documentation.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`🔐 Demo Poster Login: email: demo@example.com, password: password`);
    console.log(`🔐 Demo Worker Login: email: worker@example.com, password: password`);
});