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
      title: 'Job Sethu API',
      description: 'API documentation for the Job Sethu platform.',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${port}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Corrected API Routing ---

// Import all route files
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const messagesRoutes = require('./routes/messages');
const miscRoutes = require('./routes/misc');
const dashboardRoutes = require('./routes/dashboard');

// Mount routers with a clear and non-conflicting structure
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// All routes that start with /api/jobs/...
app.use('/api/jobs', jobsRoutes); 
app.use('/api/jobs', messagesRoutes); // Now correctly handled under /api/jobs
app.use('/api/jobs', applicationsRoutes); // Now correctly handled under /api/jobs

// Miscellaneous routes like upload and AI helpers
app.use('/api', miscRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the Job Sethu backend API!');
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  console.log(`📖 API Documentation available at http://localhost:${port}/api-docs`);
});