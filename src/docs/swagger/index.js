// Swagger spec generator (OpenAPI 3) using swagger-jsdoc

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const baseUrl =
  process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vivi API',
      version: '1.0.0',
      description: 'Backend API for user management, auth and roles',
    },
    servers: [
      {
        url: `${baseUrl}/api/v1`,
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
                    name: { type: 'string', example: 'Franco' },
                    lastName: { type: 'string', example: 'Moccehgiani' },
                    email: { type: 'string', example: 'franco@example.com' },
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
  },

  // Reads Swagger JSDoc annotations from your route swagger files.
  // Example: src/auth.swagger.js, src/users.swagger.js, etc.
  apis: [path.join(__dirname, '*.swagger.js')],
};

module.exports = swaggerJsdoc(options);
