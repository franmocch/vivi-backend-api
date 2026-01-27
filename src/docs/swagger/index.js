const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;

const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${port}`;

const rawAppVersionUrl = process.env.APP_VERSION_URL || '/api/v1';
const appVersionUrl = rawAppVersionUrl.startsWith('/')
  ? rawAppVersionUrl
  : `/${rawAppVersionUrl}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservice User API',
      version: '1.0.0',
      description: 'Backend API for user management, auth and roles',
    },
    servers: [
      {
        url: `${baseUrl}${appVersionUrl}`,
        description: 'Current environment',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Invalid credentials' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: '65f1c2a1b2c3d4e5f6a7b8c9' },
                    name: { type: 'string', example: 'xxx' },
                    lastName: { type: 'string', example: 'xxx' },
                    email: { type: 'string', example: 'xxx@example.com' },
                    role: { type: 'string', example: 'user' },
                  },
                },
              },
            },
          },
        },
        MeResponse: {
          allOf: [{ $ref: '#/components/schemas/AuthResponse' }],
        },
      },
    },

    // security: [{ bearerAuth: [] }],
  },

  apis: [path.join(__dirname, '*.swagger.js')],
};

module.exports = swaggerJsdoc(options);
