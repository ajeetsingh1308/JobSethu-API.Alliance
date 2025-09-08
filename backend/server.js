const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger Definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My Project API',
      description: 'API documentation for the job-finding platform.',
      version: '1.0.0',
      contact: {
        name: 'Coding Partner',
        email: 'help@codingpartner.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  // Here, we specify the files where JSDoc comments for API definitions are located.
  // We will create these files in the next steps.
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Define a simple root route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the backend API!');
});

// We will add our API routes here in the next step.

// API Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const messagesRoutes = require('./routes/messages');
const miscRoutes = require('./routes/misc');

// Set up the routes with the correct, non-conflicting order
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/jobs', messagesRoutes);
app.use('/api', miscRoutes);

// Start the server
// ... rest of the file ...

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📖 API Documentation available at http://localhost:${port}/api-docs`);
});


